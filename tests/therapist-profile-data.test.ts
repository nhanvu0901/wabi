import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import profilesJson from '../data/therapist-profiles.json'
import therapistsJson from '../data/therapists.json'

describe('therapist profile source data', () => {
  it('maps exactly nine published profiles to existing therapists', () => {
    const therapistNames = new Set(therapistsJson.entries.map((item) => item.name))
    const expectedNames = [
      'ThS. Đức Minh', 'ThS. Thu Thuỷ', 'ThS. Ngọc Mai',
      'ThS. Minh Châu', 'ThS. Ly Đinh', 'ThS. Quỳnh Trang',
      'ThS. Phương An', 'ThS. Gia Bảo', 'ThS. Kim Ngân',
    ]
    expect(profilesJson.count).toBe(9)
    expect(profilesJson.entries).toHaveLength(9)
    expect(new Set(profilesJson.entries.map((item) => item.therapist_name)).size).toBe(9)
    expect(profilesJson.entries.map((item) => item.therapist_name).sort())
      .toEqual(expectedNames.sort())
    expect(profilesJson.entries.every((item) => therapistNames.has(item.therapist_name))).toBe(true)
    expect(profilesJson.entries.every((item) => item.is_published)).toBe(true)
  })

  it('preserves paragraphs and applies only the approved typo correction', () => {
    const ducMinh = profilesJson.entries.find((item) => item.therapist_name === 'ThS. Đức Minh')
    expect(ducMinh?.full_name).toBe('Nguyễn Đức Minh')
    expect(ducMinh?.bio_vi).toContain('\n\n')
    expect(ducMinh?.bio_vi).toContain('tâm lý trước hết')
    expect(ducMinh?.bio_vi).not.toContain('tâm lýtrước hết')
  })

  it('preserves the approved paragraph count for every profile', () => {
    const expectedParagraphCounts: Record<string, number> = {
      'ThS. Đức Minh': 4,
      'ThS. Thu Thuỷ': 6,
      'ThS. Ngọc Mai': 4,
      'ThS. Minh Châu': 4,
      'ThS. Ly Đinh': 6,
      'ThS. Quỳnh Trang': 1,
      'ThS. Phương An': 4,
      'ThS. Gia Bảo': 4,
      'ThS. Kim Ngân': 4,
    }

    const actualParagraphCounts = Object.fromEntries(
      profilesJson.entries.map((item) => [
        item.therapist_name,
        item.bio_vi.split(/\n\n+/).length,
      ]),
    )

    expect(actualParagraphCounts).toEqual(expectedParagraphCounts)
  })

  it('provides a complete English biography with matching paragraph boundaries', () => {
    for (const profile of profilesJson.entries) {
      expect(profile.bio_en, `${profile.therapist_name} bio_en`).toEqual(expect.any(String))
      expect((profile.bio_en as string).trim().length).toBeGreaterThan(0)
      expect((profile.bio_en as string).split(/\n\n+/)).toHaveLength(
        profile.bio_vi.split(/\n\n+/).length,
      )
    }
  })

  it('translates only the two approved quotes and keeps them out of the biographies', () => {

    const quotedProfiles = profilesJson.entries.filter((item) => item.quote_vi !== null)
    expect(quotedProfiles.map((item) => item.therapist_name).sort()).toEqual([
      'ThS. Kim Ngân',
      'ThS. Quỳnh Trang',
    ])
    for (const profile of quotedProfiles) {
      expect(profile.bio_vi).not.toContain(profile.quote_vi as string)
      expect(profile.quote_en, `${profile.therapist_name} quote_en`).toEqual(expect.any(String))
      expect((profile.quote_en as string).trim().length).toBeGreaterThan(0)
      expect(profile.bio_en).not.toContain(profile.quote_en as string)
    }

    expect(profilesJson.entries.filter((item) => item.quote_en !== null).map((item) => item.therapist_name).sort())
      .toEqual(['ThS. Kim Ngân', 'ThS. Quỳnh Trang'])
  })

  it('creates the one-to-one table and published-only read policy', () => {
    const sql = readFileSync(
      new URL('../supabase/migrations/0007_therapist_profiles.sql', import.meta.url),
      'utf8',
    )
    expect(sql).toContain('create table therapist_profiles')
    expect(sql).toContain('therapist_id bigint primary key')
    expect(sql).toContain('references therapists(id) on delete cascade')
    expect(sql).toContain('using (is_published = true)')
    expect(sql).toContain('on conflict (therapist_id) do update')
  })

  it('allows an empty therapist table during migration but rejects ID/name drift', () => {
    const sql = readFileSync(
      new URL('../supabase/migrations/0007_therapist_profiles.sql', import.meta.url),
      'utf8',
    )

    expect(sql).toContain('therapist_count > 0')
    expect(sql).toContain('mapped_profile_count <> 9')
    expect(sql).toContain('invalid_profile_match_count > 0')
    expect(sql).toContain('expected_therapist_id')
    expect(sql).toContain('t.id = v.expected_therapist_id')
    expect(sql).toContain('t.name = v.therapist_name')
    expect(sql).toContain('raise exception')
  })

  it('seeds stable therapist IDs before profiles and advances the identity sequence', () => {
    const sql = readFileSync(new URL('../supabase/seed.sql', import.meta.url), 'utf8')
    const therapistInsertStart = sql.indexOf('insert into therapists')
    const therapistInsertEnd = sql.indexOf(';', therapistInsertStart)
    const blockStart = sql.indexOf('-- BEGIN GENERATED THERAPIST PROFILES')
    const blockEnd = sql.indexOf('-- END GENERATED THERAPIST PROFILES')
    const generatedBlock = sql.slice(blockStart, blockEnd)

    expect(therapistInsertStart).toBeGreaterThanOrEqual(0)
    expect(blockStart).toBeGreaterThan(therapistInsertEnd)
    expect(blockEnd).toBeGreaterThan(blockStart)
    expect(sql.match(/-- BEGIN GENERATED THERAPIST PROFILES/g)).toHaveLength(1)
    expect(sql.match(/-- END GENERATED THERAPIST PROFILES/g)).toHaveLength(1)
    expect(sql).toContain('insert into therapists (id, sort_order, name')
    expect(sql).toContain('overriding system value')
    for (const therapist of therapistsJson.entries) {
      expect(sql).toContain(`(${therapist.id}, ${therapist.sort_order}, '${therapist.name}'`)
    }
    expect(sql).toContain("pg_get_serial_sequence('therapists', 'id')")
    expect(sql).toContain('setval(')
    expect(generatedBlock).toContain('mapped_profile_count <> 9')
    expect(generatedBlock).toContain('invalid_profile_match_count > 0')
    expect(generatedBlock).toContain('expected_therapist_id')
    expect(generatedBlock).toContain('t.id = v.expected_therapist_id')
    expect(generatedBlock).toContain('t.name = v.therapist_name')
    expect(generatedBlock).toContain('raise exception')
    expect(generatedBlock).toContain('on conflict (therapist_id) do update')
    expect(generatedBlock).not.toContain('therapist_count > 0')
  })

  it('checks generated artifacts without mutating them', () => {
    const generator = new URL('../scripts/therapist-profile-sql.mjs', import.meta.url)
    const migration = new URL('../supabase/migrations/0007_therapist_profiles.sql', import.meta.url)
    const seed = new URL('../supabase/seed.sql', import.meta.url)

    const migrationBefore = readFileSync(migration, 'utf8')
    const seedBefore = readFileSync(seed, 'utf8')
    const migrationMtimeBefore = statSync(migration).mtimeMs
    const seedMtimeBefore = statSync(seed).mtimeMs

    execFileSync(process.execPath, [generator.pathname, '--check'])

    expect(readFileSync(migration, 'utf8')).toBe(migrationBefore)
    expect(readFileSync(seed, 'utf8')).toBe(seedBefore)
    expect(statSync(migration).mtimeMs).toBe(migrationMtimeBefore)
    expect(statSync(seed).mtimeMs).toBe(seedMtimeBefore)
  })

  it('fails check mode clearly for a stale artifact without touching tracked files', () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), 'therapist-profile-sql-'))
    try {
      const projectRoot = new URL('..', import.meta.url)
      for (const relativePath of [
        'scripts/therapist-profile-sql.mjs',
        'data/therapist-profiles.json',
        'data/therapists.json',
        'supabase/migrations/0007_therapist_profiles.sql',
        'supabase/seed.sql',
      ]) {
        const destination = join(fixtureRoot, relativePath)
        mkdirSync(dirname(destination), { recursive: true })
        cpSync(new URL(relativePath, projectRoot), destination, {
          recursive: true,
        })
      }

      const fixtureMigration = join(
        fixtureRoot,
        'supabase/migrations/0007_therapist_profiles.sql',
      )
      writeFileSync(fixtureMigration, `${readFileSync(fixtureMigration, 'utf8')}-- stale\n`)

      const result = spawnSync(
        process.execPath,
        [join(fixtureRoot, 'scripts/therapist-profile-sql.mjs'), '--check'],
        { encoding: 'utf8' },
      )

      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('Stale generated therapist profile artifacts: migration')
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })
})
