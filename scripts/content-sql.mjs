#!/usr/bin/env node
// Regenerates the i18n + photo migrations from data/therapists.json and
// data/services.json, so the SQL and the offline fallback can never disagree.
//
//   node scripts/content-sql.mjs
//
// Writes:
//   supabase/migrations/0002_i18n.sql    columns + English values + revised VI copy
//   supabase/migrations/0004_photos.sql  photo_url paths
//
// Both are idempotent — safe to paste into the Supabase SQL Editor more than once.

import fs from 'node:fs'
import path from 'node:path'

const read = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'))
const therapists = read('data/therapists.json').entries
const services = read('data/services.json').entries

const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`)

/* -------------------------------------------------- 0002: i18n columns ---- */

// A single UPDATE ... FROM (VALUES …) rather than one statement per row: it is
// one atomic statement, it is short enough to paste into the SQL Editor, and a
// typo in a name shows up as a missing row rather than a silently skipped update.
// Vietnamese columns are included because the newer design revised some of that
// copy too; sending the full row keeps the DB identical to data/therapists.json.
const therapistValues = therapists.map(
  (t) =>
    `  (${[t.name, t.title, t.title_en, t.specialties, t.specialties_en, t.therapies, t.therapies_en, t.location, t.location_en].map(q).join(', ')})`
)

const therapistUpdate = `update therapists as x set
  title          = v.title,
  title_en       = v.title_en,
  specialties    = v.specialties,
  specialties_en = v.specialties_en,
  therapies      = v.therapies,
  therapies_en   = v.therapies_en,
  location       = v.location,
  location_en    = v.location_en
from (values
${therapistValues.join(',\n')}
) as v(name, title, title_en, specialties, specialties_en, therapies, therapies_en, location, location_en)
where x.name = v.name;`

const serviceUpdate = `update services as x set
  name_en        = v.name_en,
  description_en = v.description_en
from (values
${services.map((s) => `  (${s.sort_order}, ${q(s.name_en)}, ${q(s.description_en)})`).join(',\n')}
) as v(sort_order, name_en, description_en)
where x.sort_order = v.sort_order;`

const i18nSql = `-- Song ngữ VI/EN cho nội dung động.
--
-- GENERATED bởi scripts/content-sql.mjs từ data/therapists.json + data/services.json.
-- Chạy lại được nhiều lần, không hỏng gì.
--
-- Quy tắc cột: mỗi cột chứa tiếng Việt có một cột _en tương ứng. Loại trừ:
--   name   — tên người, không dịch
--   price  — con số; hậu tố "/buổi" vs "/session" lấy từ dictionary (card.ses)
--
-- Cột _en để null được: khi null thì giao diện tự rơi về bản tiếng Việt, nên
-- 11/12 dòng therapies_en là null (những giá trị kiểu "CBT · ACT · DBT" giống
-- nhau ở cả hai ngôn ngữ).
--
-- Phần update cũng ghi đè luôn cột tiếng Việt, vì design mới có sửa lại chữ cho
-- 5 therapist (bỏ bớt từ tiếng Anh chen vào: "Tâm lý học trường học" →
-- "Tâm lý học đường", "Couple therapy" → "Trị liệu cặp đôi", …).

alter table therapists
  add column if not exists title_en text,
  add column if not exists specialties_en text,
  add column if not exists therapies_en text,
  add column if not exists location_en text;

alter table services
  add column if not exists name_en text,
  add column if not exists description_en text;

-- 12 therapist ---------------------------------------------------------------

${therapistUpdate}

-- 5 dịch vụ ------------------------------------------------------------------

${serviceUpdate}
`

/* ------------------------------------------------------- 0004: photos ---- */

const withPhoto = therapists.filter((t) => t.photo_url)
const without = therapists.filter((t) => !t.photo_url).map((t) => t.name)

const photoSql = `-- Ảnh chân dung therapist.
--
-- GENERATED bởi scripts/content-sql.mjs từ data/therapists.json.
--
-- Nguồn ảnh: "Ảnh các therapist.zip" (Wabi gửi 2026-08-14). File ảnh nằm trong
-- public/images/therapists/; bảng chỉ giữ đường dẫn.
--
-- Ánh xạ theo tên: tên file trong zip là họ tên đầy đủ, tên trên card là tên gọi
-- (ví dụ "Nguyễn Thị Kim Ngân" → card "ThS. Kim Ngân").
--
-- ${withPhoto.length}/${therapists.length} therapist có ảnh.${without.length ? ` Chưa có: ${without.join(', ')}.` : ''}

update therapists as x set photo_url = v.photo_url
from (values
${withPhoto.map((t) => `  (${q(t.name)}, ${q(t.photo_url)})`).join(',\n')}
) as v(name, photo_url)
where x.name = v.name;
`

const write = (name, sql) => {
  const p = path.join(process.cwd(), 'supabase/migrations', name)
  fs.writeFileSync(p, sql)
  console.log(`  supabase/migrations/${name}  (${sql.split('\n').length} dòng)`)
}

write('0002_i18n.sql', i18nSql)
write('0004_photos.sql', photoSql)
console.log(`\n${therapists.length} therapist · ${services.length} dịch vụ · ${withPhoto.length} ảnh`)
if (without.length) console.log(`chưa có ảnh: ${without.join(', ')}`)
