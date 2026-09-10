import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const snapshotUrl = new URL('../data/therapist-profiles.json', import.meta.url)
const migrationUrl = new URL('../supabase/migrations/0007_therapist_profiles.sql', import.meta.url)
const seedUrl = new URL('../supabase/seed.sql', import.meta.url)
const { entries: profiles } = JSON.parse(readFileSync(snapshotUrl, 'utf8'))

const expectedProfileCount = profiles.length
const seedBlockStart = '-- BEGIN GENERATED THERAPIST PROFILES'
const seedBlockEnd = '-- END GENERATED THERAPIST PROFILES'

const q = (value) => value == null
  ? 'null'
  : `'${String(value).replace(/'/g, "''")}'`

const values = profiles.map((profile) => `  (${[
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
  select v.therapist_name, count(t.id)::bigint as match_count
  from (values
${values}
  ) as v(therapist_name, full_name, bio_vi, bio_en, quote_vi, quote_en, is_published)
  left join therapists t on t.name = v.therapist_name
  group by v.therapist_name
)
select
  coalesce(sum(match_count), 0)::bigint,
  count(*) filter (where match_count <> 1)::bigint
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
) as v(therapist_name, full_name, bio_vi, bio_en, quote_vi, quote_en, is_published)
join therapists t on t.name = v.therapist_name
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
      'Expected exactly ${expectedProfileCount} uniquely matched therapist profiles; found % mapping rows and % invalid name matches',
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
      'Expected exactly ${expectedProfileCount} uniquely matched therapist profiles; found % mapping rows and % invalid name matches',
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

writeFileSync(
  fileURLToPath(migrationUrl),
  `${schemaSql}\n\n${migrationValidationSql}\n\n${profileUpsertSql}\n`,
)
writeFileSync(fileURLToPath(seedUrl), replaceGeneratedSeedBlock(seed))
