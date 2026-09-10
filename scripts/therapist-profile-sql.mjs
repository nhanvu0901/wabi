import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const snapshotUrl = new URL('../data/therapist-profiles.json', import.meta.url)
const therapistsUrl = new URL('../data/therapists.json', import.meta.url)
const migrationUrl = new URL('../supabase/migrations/0007_therapist_profiles.sql', import.meta.url)
const seedUrl = new URL('../supabase/seed.sql', import.meta.url)
const { entries: profiles } = JSON.parse(readFileSync(snapshotUrl, 'utf8'))
const { entries: therapists } = JSON.parse(readFileSync(therapistsUrl, 'utf8'))

const profilesWithIds = profiles.map((profile) => {
  const matches = therapists.filter((therapist) => therapist.name === profile.therapist_name)
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one therapist snapshot match for ${profile.therapist_name}; found ${matches.length}`,
    )
  }
  return { ...profile, expected_therapist_id: matches[0].id }
})

const expectedProfileCount = profiles.length
const seedBlockStart = '-- BEGIN GENERATED THERAPIST PROFILES'
const seedBlockEnd = '-- END GENERATED THERAPIST PROFILES'

const q = (value) => value == null
  ? 'null'
  : `'${String(value).replace(/'/g, "''")}'`

const values = profilesWithIds.map((profile) => `  (${profile.expected_therapist_id}, ${[
  profile.therapist_name,
  profile.full_name,
  profile.bio_vi,
  profile.bio_en,
  profile.quote_vi,
  profile.quote_en,
].map(q).join(', ')}, ${profile.is_published})`).join(',\n')

const schemaSql = `create table therapist_profiles (
  therapist_id bigint primary key
    references therapists(id) on delete cascade,
  full_name text,
  bio_vi text not null,
  bio_en text,
  quote_vi text,
  quote_en text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table therapist_profiles enable row level security;

create policy "public read published therapist profiles"
on therapist_profiles
for select
using (is_published = true);`

const mappingStatsSql = `with profile_match_counts as (
  select
    v.expected_therapist_id,
    v.therapist_name,
    count(t.id) filter (
      where t.id = v.expected_therapist_id and t.name = v.therapist_name
    )::bigint as exact_match_count,
    count(t.id) filter (where t.id = v.expected_therapist_id)::bigint as id_match_count,
    count(t.id) filter (where t.name = v.therapist_name)::bigint as name_match_count
  from (values
${values}
  ) as v(expected_therapist_id, therapist_name, full_name, bio_vi, bio_en, quote_vi, quote_en, is_published)
  left join therapists t
    on t.id = v.expected_therapist_id or t.name = v.therapist_name
  group by v.expected_therapist_id, v.therapist_name
)
select
  coalesce(sum(exact_match_count), 0)::bigint,
  count(*) filter (
    where exact_match_count <> 1 or id_match_count <> 1 or name_match_count <> 1
  )::bigint
into mapped_profile_count, invalid_profile_match_count
from profile_match_counts;`

const profileUpsertSql = `insert into therapist_profiles (
  therapist_id, full_name, bio_vi, bio_en,
  quote_vi, quote_en, is_published, updated_at
)
select
  t.id, v.full_name, v.bio_vi, v.bio_en,
  v.quote_vi, v.quote_en, v.is_published, now()
from (values
${values}
) as v(expected_therapist_id, therapist_name, full_name, bio_vi, bio_en, quote_vi, quote_en, is_published)
join therapists t
  on t.id = v.expected_therapist_id and t.name = v.therapist_name
on conflict (therapist_id) do update set
  full_name = excluded.full_name,
  bio_vi = excluded.bio_vi,
  bio_en = excluded.bio_en,
  quote_vi = excluded.quote_vi,
  quote_en = excluded.quote_en,
  is_published = excluded.is_published,
  updated_at = now();`

const migrationValidationSql = `do $$
declare
  therapist_count bigint;
  mapped_profile_count bigint;
  invalid_profile_match_count bigint;
begin
  select count(*) into therapist_count from therapists;

  ${mappingStatsSql}

  if therapist_count > 0 and (
    mapped_profile_count <> ${expectedProfileCount}
    or invalid_profile_match_count > 0
  ) then
    raise exception
      'Expected exactly ${expectedProfileCount} therapist profile ID/name mappings; found % mapping rows and % invalid mappings',
      mapped_profile_count,
      invalid_profile_match_count;
  end if;
end
$$;`

const seedValidationSql = `do $$
declare
  mapped_profile_count bigint;
  invalid_profile_match_count bigint;
begin
  ${mappingStatsSql}

  if mapped_profile_count <> ${expectedProfileCount}
    or invalid_profile_match_count > 0
  then
    raise exception
      'Expected exactly ${expectedProfileCount} therapist profile ID/name mappings; found % mapping rows and % invalid mappings',
      mapped_profile_count,
      invalid_profile_match_count;
  end if;
end
$$;`

const generatedSeedBlock = `${seedBlockStart}
${seedValidationSql}

${profileUpsertSql}
${seedBlockEnd}`

const replaceGeneratedSeedBlock = (seed) => {
  const start = seed.indexOf(seedBlockStart)
  const end = seed.indexOf(seedBlockEnd)

  if ((start === -1) !== (end === -1)) {
    throw new Error('Generated therapist profile seed block has mismatched markers')
  }

  if (start === -1) {
    if (!seed.includes('insert into therapists')) {
      throw new Error('Therapist seed insert must exist before generated profiles')
    }
    return `${seed.trimEnd()}\n\n${generatedSeedBlock}\n`
  }

  if (
    end < start
    || seed.indexOf(seedBlockStart, start + seedBlockStart.length) !== -1
    || seed.indexOf(seedBlockEnd, end + seedBlockEnd.length) !== -1
  ) {
    throw new Error('Generated therapist profile seed block markers must be unique and ordered')
  }

  const afterBlock = end + seedBlockEnd.length
  return `${seed.slice(0, start)}${generatedSeedBlock}${seed.slice(afterBlock)}`
}

const seed = readFileSync(seedUrl, 'utf8')
const expectedMigration = `${schemaSql}\n\n${migrationValidationSql}\n\n${profileUpsertSql}\n`
const expectedSeed = replaceGeneratedSeedBlock(seed)
const checkOnly = process.argv.slice(2).includes('--check')

if (checkOnly) {
  const stale = []
  if (readFileSync(migrationUrl, 'utf8') !== expectedMigration) stale.push('migration')
  if (seed !== expectedSeed) stale.push('seed')
  if (stale.length > 0) {
    console.error(`Stale generated therapist profile artifacts: ${stale.join(', ')}`)
    process.exitCode = 1
  }
} else {
  writeFileSync(fileURLToPath(migrationUrl), expectedMigration)
  writeFileSync(fileURLToPath(seedUrl), expectedSeed)
}
