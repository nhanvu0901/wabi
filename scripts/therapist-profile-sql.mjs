import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const snapshotUrl = new URL('../data/therapist-profiles.json', import.meta.url)
const migrationUrl = new URL('../supabase/migrations/0007_therapist_profiles.sql', import.meta.url)
const { entries: profiles } = JSON.parse(readFileSync(snapshotUrl, 'utf8'))

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

const seedSql = `insert into therapist_profiles (
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

writeFileSync(fileURLToPath(migrationUrl), `${schemaSql}\n\n${seedSql}\n`)
