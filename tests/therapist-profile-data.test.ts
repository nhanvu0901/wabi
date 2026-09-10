import { readFileSync } from 'node:fs'
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
})
