#!/usr/bin/env node
// Reports which migrations have actually landed on the live Supabase project.
//
//   node --env-file=.env.local scripts/check-supabase.mjs
//
// Read-only: it only issues selects with the anon key. Run it after applying SQL
// in the dashboard to confirm the app will see what you expect.

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!URL_ || !KEY) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const ok = (b) => (b ? '  OK  ' : ' THIẾU')

async function probe(path) {
  try {
    const res = await fetch(`${URL_}/rest/v1/${path}`, { headers: { ...headers, Prefer: 'count=exact' } })
    const range = res.headers.get('content-range')
    const count = range ? Number(range.split('/')[1]) : null
    return { status: res.status, count, body: res.ok ? null : (await res.text()).slice(0, 120) }
  } catch (err) {
    return { status: 0, count: null, body: String(err) }
  }
}

const checks = []

// ---- 0001_init ------------------------------------------------------------
for (const [table, expect] of [['therapists', 12], ['services', 9], ['contact_submissions', null]]) {
  const r = await probe(`${table}?select=id&limit=1`)
  checks.push({
    migration: '0001_init',
    what: `bảng ${table}`,
    pass: r.status < 400,
    detail: r.status < 400 ? `${r.count ?? '?'} dòng${expect && r.count !== expect ? ` (mong đợi ${expect})` : ''}` : `HTTP ${r.status}`,
  })
}

// ---- 0002_i18n ------------------------------------------------------------
for (const [table, col] of [
  ['therapists', 'title_en'],
  ['therapists', 'specialties_en'],
  ['therapists', 'therapies_en'],
  ['therapists', 'location_en'],
  ['services', 'name_en'],
  ['services', 'description_en'],
]) {
  const r = await probe(`${table}?select=${col}&limit=1`)
  checks.push({ migration: '0002_i18n', what: `${table}.${col}`, pass: r.status < 400, detail: r.status < 400 ? 'có' : `HTTP ${r.status}` })
}

// Translations present, not just the columns.
const filled = await probe('therapists?select=id&title_en=not.is.null&limit=1')
checks.push({
  migration: '0002_i18n',
  what: 'bản dịch EN đã điền',
  pass: filled.status < 400 && (filled.count ?? 0) > 0,
  detail: filled.status < 400 ? `${filled.count ?? 0}/12 therapist có title_en` : `HTTP ${filled.status}`,
})

// The revised Vietnamese copy that 0002 also applies.
const revised = await probe(`therapists?select=id&specialties=like.*cộng đồng LGBTQI*&limit=1`)
checks.push({
  migration: '0002_i18n',
  what: 'copy VI đã cập nhật',
  pass: revised.status < 400 && (revised.count ?? 0) > 0,
  detail: revised.status < 400 ? ((revised.count ?? 0) > 0 ? 'đã áp dụng' : 'vẫn là bản cũ') : `HTTP ${revised.status}`,
})

// ---- 0004_photos ----------------------------------------------------------
// 9 of 12 have a photo; Hà Trang, Mai Nguyen and Vi Vương are still missing one,
// so "pass" here means the 9 landed, not that the set is complete.
const photos = await probe('therapists?select=id&photo_url=not.is.null&limit=1')
checks.push({
  migration: '0004_photos',
  what: 'photo_url đã điền',
  pass: photos.status < 400 && (photos.count ?? 0) >= 9,
  detail: photos.status < 400 ? `${photos.count ?? 0}/12 therapist có ảnh (đủ khi ≥ 9)` : `HTTP ${photos.status}`,
})

// ---- 0003_faq -------------------------------------------------------------
const faq = await probe('faq?select=id&limit=1')
checks.push({ migration: '0003_faq', what: 'bảng faq', pass: faq.status < 400, detail: faq.status < 400 ? `${faq.count ?? '?'} dòng (mong đợi 44)` : `HTTP ${faq.status}` })

const revisedFaq = await probe('faq?select=id&is_revised=is.true&limit=1')
checks.push({
  migration: '0003_faq',
  what: 'cột is_revised',
  pass: revisedFaq.status < 400,
  detail: revisedFaq.status < 400 ? `${revisedFaq.count ?? 0} câu dùng bản sửa (mong đợi 15)` : `HTTP ${revisedFaq.status}`,
})

// ---- report ---------------------------------------------------------------
console.log(`\nProject: ${URL_}\n`)
let current = ''
for (const c of checks) {
  if (c.migration !== current) {
    current = c.migration
    console.log(`── ${current} ${'─'.repeat(46 - current.length)}`)
  }
  console.log(` ${ok(c.pass)}  ${c.what.padEnd(26)} ${c.detail}`)
}

const byMigration = {}
for (const c of checks) byMigration[c.migration] = (byMigration[c.migration] ?? true) && c.pass
console.log()
for (const [m, pass] of Object.entries(byMigration)) console.log(`${pass ? '✓' : '✗'} ${m}${pass ? ' — đã áp dụng đầy đủ' : ' — CHƯA áp dụng (hoặc chưa đủ)'}`)

const pending = Object.entries(byMigration).filter(([, p]) => !p).map(([m]) => m)
if (pending.length) {
  console.log(`\nCần chạy trong Supabase SQL Editor: ${pending.map((m) => `supabase/migrations/${m}.sql`).join(', ')}`)
  process.exitCode = 1
}
