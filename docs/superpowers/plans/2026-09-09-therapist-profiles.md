# Therapist Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tải bài tự giới thiệu từ Supabase và biến route chi tiết therapist hiện có thành trang hồ sơ đầy đủ, có fallback cục bộ và song ngữ ở lớp giao diện.

**Architecture:** Giữ `therapists` là bảng dữ liệu tóm tắt dùng cho card; thêm `therapist_profiles` quan hệ một-một để nội dung dài chỉ được tải tại detail route. Snapshot JSON là nguồn tạo migration và fallback; lớp truy cập dữ liệu trả về một `TherapistDetail`, còn component trình bày không biết Supabase.

**Tech Stack:** Next.js 16 App Router, React 19 server components, TypeScript 6, Supabase/PostgreSQL, Vitest 4, JSON snapshots.

**Spec:** `docs/superpowers/specs/2026-09-09-therapist-profiles-design.md`

## Global Constraints

- Supabase là nguồn chính; local JSON chỉ dùng làm fallback và nguồn sinh migration.
- Giữ nguyên URL `/{lang}/doi-ngu/{id}` và link “Xem thêm/View details” hiện tại.
- Không tải biography trong truy vấn danh sách therapist.
- Chỉ sửa lỗi đánh máy chắc chắn `tâm lýtrước hết` thành `tâm lý trước hết`; không diễn giải lại tuyên bố chuyên môn.
- Nhập 9 profile đã map chắc chắn; chưa thêm Phạm Trần Đắc Thạnh vì thiếu `price` và `location` bắt buộc.
- `bio_en`/`quote_en` nullable; route tiếng Anh fallback sang tiếng Việt và phải báo rõ fallback.
- Profile không tồn tại không gây 404 nếu therapist vẫn tồn tại.
- Nội dung phải render thành text React bình thường, không dùng `dangerouslySetInnerHTML`.

---

## File Structure

- `data/therapist-profiles.json`: snapshot đã biên tập tối thiểu, map bằng `therapist_name` ổn định.
- `scripts/therapist-profile-sql.mjs`: sinh migration schema, RLS và seed từ snapshot.
- `supabase/migrations/0007_therapist_profiles.sql`: output xác định của generator.
- `lib/types.ts`: khai báo `TherapistProfile`, `TherapistProfileSnapshot`, `TherapistDetail` và helper chọn nội dung.
- `lib/content.ts`: tải một therapist cùng profile, chuẩn hóa quan hệ Supabase và fallback JSON.
- `components/TherapistProfile.tsx`: server-rendered presentation component cho hồ sơ đầy đủ.
- `app/[lang]/doi-ngu/[id]/page.tsx`: validate route, metadata, 404 và gọi component.
- `lib/i18n.ts`: nhãn song ngữ của trang chi tiết.
- `app/globals.css`: layout responsive và visual treatment của profile.
- `tests/therapist-profile-data.test.ts`: tính toàn vẹn snapshot/migration.
- `tests/therapist-profile-content.test.ts`: data access và language selection.
- `tests/therapist-profile-page.test.tsx`: SSR markup, fallback, route và metadata.

---

### Task 1: Snapshot nội dung và migration database

**Files:**
- Create: `data/therapist-profiles.json`
- Create: `scripts/therapist-profile-sql.mjs`
- Create: `supabase/migrations/0007_therapist_profiles.sql`
- Create: `tests/therapist-profile-data.test.ts`

**Interfaces:**
- Consumes: `/Users/nhanvu/Downloads/Tự giới thiệu của các therapist.docx`, `data/therapists.json`.
- Produces: snapshot `{ generatedBy, count, entries }`; mỗi entry có `therapist_name`, `full_name`, `bio_vi`, `bio_en`, `quote_vi`, `quote_en`, `is_published`.

- [ ] **Step 1: Viết test thất bại cho snapshot và schema SQL**

```ts
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
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run: `npm test -- tests/therapist-profile-data.test.ts`

Expected: FAIL vì snapshot và migration chưa tồn tại.

- [ ] **Step 3: Tạo snapshot chính xác từ tài liệu nguồn**

Dùng `textutil -convert txt -stdout '/Users/nhanvu/Downloads/Tự giới thiệu của các therapist.docx'` để đối chiếu từng đoạn. Tạo đúng chín entry theo mapping:

```js
const mappings = [
  ['Nguyễn Đức Minh', 'ThS. Đức Minh'],
  ['Nguyễn Thu Thủy', 'ThS. Thu Thuỷ'],
  ['Nguyễn Ngọc Mai', 'ThS. Ngọc Mai'],
  ['Minh Châu', 'ThS. Minh Châu'],
  ['Đinh Y Ly', 'ThS. Ly Đinh'],
  ['Ngọ Quỳnh Trang', 'ThS. Quỳnh Trang'],
  ['An Nguyễn Như Phương', 'ThS. Phương An'],
  ['Trần Gia Bảo', 'ThS. Gia Bảo'],
  ['Nguyễn Thị Kim Ngân', 'ThS. Kim Ngân'],
]
```

Mỗi đoạn gốc được nối bằng `\n\n`; `bio_en` và `quote_en` là `null`. Tách câu trích dẫn cuối hồ sơ Quỳnh Trang và “Nảy mầm trong đêm tối và nở hoa dưới ánh mặt trời.” của Kim Ngân sang `quote_vi`, không lặp lại chúng trong `bio_vi`.

- [ ] **Step 4: Viết generator và sinh migration**

Generator đọc JSON bằng `JSON.parse(readFileSync(...))`, quote SQL bằng hàm:

```js
const q = (value) => value == null
  ? 'null'
  : `'${String(value).replace(/'/g, "''")}'`
```

SQL phải tạo bảng/columns đúng spec, bật RLS, tạo policy và seed bằng mapping tên. Generator dựng rows trực tiếp từ snapshot:

```js
const values = profiles.map((profile) => `  (${[
  profile.therapist_name,
  profile.full_name,
  profile.bio_vi,
  profile.bio_en,
  profile.quote_vi,
  profile.quote_en,
].map(q).join(', ')}, ${profile.is_published})`).join(',\n')

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
```

Run: `node scripts/therapist-profile-sql.mjs`

Expected: tạo `supabase/migrations/0007_therapist_profiles.sql` với chín seed rows.

- [ ] **Step 5: Chạy test và kiểm tra generator xác định**

Run: `npm test -- tests/therapist-profile-data.test.ts && node scripts/therapist-profile-sql.mjs && git diff --exit-code -- supabase/migrations/0007_therapist_profiles.sql`

Expected: PASS; lần chạy generator thứ hai không thay đổi migration.

- [ ] **Step 6: Commit task 1**

```bash
git add data/therapist-profiles.json scripts/therapist-profile-sql.mjs supabase/migrations/0007_therapist_profiles.sql tests/therapist-profile-data.test.ts
git commit -m "feat(data): add therapist profile content"
```

---

### Task 2: Domain types và lựa chọn nội dung theo ngôn ngữ

**Files:**
- Modify: `lib/types.ts`
- Create: `tests/therapist-profile-content.test.ts`

**Interfaces:**
- Consumes: snapshot fields từ Task 1 và `Lang` hiện tại.
- Produces: `TherapistProfile`, `TherapistProfileSnapshot`, `TherapistDetail`, `pickProfileContent(profile, lang)`.

- [ ] **Step 1: Viết test thất bại cho chọn ngôn ngữ và fallback**

```ts
import { describe, expect, it } from 'vitest'
import { pickProfileContent, type TherapistProfile } from '../lib/types'

const profile: TherapistProfile = {
  therapist_id: 2,
  full_name: 'Nguyễn Ngọc Mai',
  bio_vi: 'Đoạn một.\n\nĐoạn hai.',
  bio_en: null,
  quote_vi: 'Trích dẫn.',
  quote_en: null,
  is_published: true,
  created_at: null,
  updated_at: null,
}

describe('pickProfileContent', () => {
  it('returns Vietnamese without a fallback marker on vi', () => {
    expect(pickProfileContent(profile, 'vi')).toEqual({
      bio: profile.bio_vi,
      quote: profile.quote_vi,
      isFallback: false,
    })
  })

  it('falls back to Vietnamese when English content is absent', () => {
    expect(pickProfileContent(profile, 'en')).toEqual({
      bio: profile.bio_vi,
      quote: profile.quote_vi,
      isFallback: true,
    })
  })

  it('uses English content when it is present', () => {
    expect(pickProfileContent({
      ...profile,
      bio_en: 'English biography.',
      quote_en: 'English quote.',
    }, 'en')).toEqual({
      bio: 'English biography.',
      quote: 'English quote.',
      isFallback: false,
    })
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run: `npm test -- tests/therapist-profile-content.test.ts`

Expected: FAIL vì types/helper chưa tồn tại.

- [ ] **Step 3: Thêm types và helper tối thiểu**

```ts
export type TherapistProfile = {
  therapist_id: number
  full_name: string | null
  bio_vi: string
  bio_en: string | null
  quote_vi: string | null
  quote_en: string | null
  is_published: boolean
  created_at: string | null
  updated_at: string | null
}

export type TherapistProfileSnapshot = Omit<
  TherapistProfile,
  'therapist_id' | 'created_at' | 'updated_at'
> & { therapist_name: string }

export type TherapistDetail = Therapist & {
  profile: TherapistProfile | null
}

export function pickProfileContent(profile: TherapistProfile, lang: Lang) {
  const hasEnglish = Boolean(profile.bio_en?.trim())
  return {
    bio: lang === 'en' && hasEnglish ? profile.bio_en! : profile.bio_vi,
    quote: lang === 'en' && hasEnglish
      ? (profile.quote_en ?? profile.quote_vi)
      : profile.quote_vi,
    isFallback: lang === 'en' && !hasEnglish,
  }
}
```

- [ ] **Step 4: Chạy test để xác nhận GREEN**

Run: `npm test -- tests/therapist-profile-content.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit task 2**

```bash
git add lib/types.ts tests/therapist-profile-content.test.ts
git commit -m "feat(domain): model therapist profiles"
```

---

### Task 3: Data access Supabase và local fallback

**Files:**
- Modify: `lib/content.ts`
- Modify: `tests/therapist-profile-content.test.ts`

**Interfaces:**
- Consumes: `TherapistDetail`, `TherapistProfile`, `data/therapists.json`, `data/therapist-profiles.json`.
- Produces: `getTherapistDetail(id: number): Promise<TherapistDetail | null>`.

- [ ] **Step 1: Thêm test thất bại cho normalization và fallback**

Mock Supabase chain ở đầu file và tách pure helper để kiểm thử normalization độc lập:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import profilesJson from '../data/therapist-profiles.json'
import therapistsJson from '../data/therapists.json'

const db = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: () => ({ from: db.from }),
}))

import {
  findLocalTherapistDetail,
  getTherapistDetail,
  normalizeTherapistDetail,
} from '../lib/content'

beforeEach(() => {
  vi.clearAllMocks()
  db.from.mockReturnValue({ select: db.select })
  db.select.mockReturnValue({ eq: db.eq })
  db.eq.mockReturnValue({ maybeSingle: db.maybeSingle })
})

it('normalizes an embedded published profile', () => {
  const detail = normalizeTherapistDetail({
    ...therapistsJson.entries[1],
    therapist_profiles: [{
      therapist_id: 2,
      full_name: 'Nguyễn Ngọc Mai',
      bio_vi: 'Nội dung',
      bio_en: null,
      quote_vi: null,
      quote_en: null,
      is_published: true,
      created_at: null,
      updated_at: null,
    }],
  })
  expect(detail.profile?.full_name).toBe('Nguyễn Ngọc Mai')
})

it('joins local therapist and profile by stable display name', () => {
  const detail = findLocalTherapistDetail(2, therapistsJson.entries, profilesJson.entries)
  expect(detail?.name).toBe('ThS. Ngọc Mai')
  expect(detail?.profile?.full_name).toBe('Nguyễn Ngọc Mai')
})

it('returns a therapist with a null profile when no profile exists', () => {
  const detail = findLocalTherapistDetail(1, therapistsJson.entries, profilesJson.entries)
  expect(detail?.name).toBe('ThS. Hà Trang')
  expect(detail?.profile).toBeNull()
})

it('returns the joined Supabase detail when the query succeeds', async () => {
  db.maybeSingle.mockResolvedValueOnce({
    data: { ...therapistsJson.entries[1], therapist_profiles: [] },
    error: null,
  })
  const detail = await getTherapistDetail(2)
  expect(db.from).toHaveBeenCalledWith('therapists')
  expect(db.eq).toHaveBeenCalledWith('id', 2)
  expect(detail?.name).toBe('ThS. Ngọc Mai')
})

it('uses the local snapshots when Supabase returns an error', async () => {
  db.maybeSingle.mockResolvedValueOnce({ data: null, error: new Error('offline') })
  const detail = await getTherapistDetail(2)
  expect(detail?.profile?.full_name).toBe('Nguyễn Ngọc Mai')
})
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run: `npm test -- tests/therapist-profile-content.test.ts`

Expected: FAIL vì helper chưa tồn tại.

- [ ] **Step 3: Viết normalization và fallback pure helpers**

```ts
export function normalizeTherapistDetail(row: Therapist & {
  therapist_profiles?: TherapistProfile | TherapistProfile[] | null
}): TherapistDetail {
  const relation = row.therapist_profiles
  const profile = Array.isArray(relation) ? (relation[0] ?? null) : (relation ?? null)
  const { therapist_profiles: _relation, ...therapist } = row
  return { ...therapist, profile }
}

export function findLocalTherapistDetail(
  id: number,
  therapists: Therapist[],
  profiles: TherapistProfileSnapshot[],
): TherapistDetail | null {
  const therapist = therapists.find((item) => item.id === id)
  if (!therapist) return null
  const snapshot = profiles.find(
    (item) => item.therapist_name === therapist.name && item.is_published,
  )
  const profile = snapshot ? {
    therapist_id: therapist.id,
    full_name: snapshot.full_name,
    bio_vi: snapshot.bio_vi,
    bio_en: snapshot.bio_en,
    quote_vi: snapshot.quote_vi,
    quote_en: snapshot.quote_en,
    is_published: snapshot.is_published,
    created_at: null,
    updated_at: null,
  } : null
  return {
    ...therapist,
    profile,
  }
}
```

- [ ] **Step 4: Viết `getTherapistDetail` với query một therapist**

```ts
export async function getTherapistDetail(id: number): Promise<TherapistDetail | null> {
  try {
    const { data, error } = await supabase()
      .from('therapists')
      .select('*, therapist_profiles(*)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? normalizeTherapistDetail(data) : null
  } catch (err) {
    fallbackWarning('therapist-detail', err)
    return findLocalTherapistDetail(
      id,
      therapistsJson.entries as Therapist[],
      profilesJson.entries as TherapistProfileSnapshot[],
    )
  }
}
```

- [ ] **Step 5: Chạy test và typecheck bằng build**

Run: `npm test -- tests/therapist-profile-content.test.ts && npm run build`

Expected: tests PASS; build liệt kê route `ƒ /[lang]/doi-ngu/[id]` và thoát 0.

- [ ] **Step 6: Commit task 3**

```bash
git add lib/content.ts tests/therapist-profile-content.test.ts
git commit -m "feat(data): load therapist profile details"
```

---

### Task 4: Server-rendered profile component và styles

**Files:**
- Create: `components/TherapistProfile.tsx`
- Modify: `lib/i18n.ts`
- Modify: `app/globals.css`
- Create: `tests/therapist-profile-page.test.tsx`

**Interfaces:**
- Consumes: `TherapistDetail`, `Lang`, existing picker helpers và URL liên hệ.
- Produces: `TherapistProfileView({ therapist, lang })` server component.

- [ ] **Step 1: Viết SSR tests thất bại cho profile, quote và trạng thái thiếu profile**

```tsx
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import TherapistProfileView from '../components/TherapistProfile'
import type { TherapistDetail } from '../lib/types'

const detail: TherapistDetail = {
  id: 2,
  sort_order: 2,
  name: 'ThS. Ngọc Mai',
  title: 'Thạc sĩ Tâm lý Lâm sàng',
  specialties: 'Lo âu',
  therapies: 'CBT · IFS',
  price: '650K',
  location: 'Online · offline HN',
  title_en: 'MSc Clinical Psychology',
  specialties_en: 'Anxiety',
  therapies_en: null,
  location_en: 'Online · in-person Hanoi',
  photo_url: '/images/therapists/ngoc-mai.jpg',
  profile: {
    therapist_id: 2,
    full_name: 'Nguyễn Ngọc Mai',
    bio_vi: 'Đoạn một.\n\nĐoạn hai.',
    bio_en: null,
    quote_vi: 'Một trích dẫn.',
    quote_en: null,
    is_published: true,
    created_at: null,
    updated_at: null,
  },
}

it('renders profile paragraphs and quote in Vietnamese', () => {
  const html = renderToStaticMarkup(<TherapistProfileView therapist={detail} lang="vi" />)
  expect(html).toContain('Nguyễn Ngọc Mai')
  expect(html).toContain('<p>Đoạn một.</p>')
  expect(html).toContain('<p>Đoạn hai.</p>')
  expect(html).toContain('Một trích dẫn.')
  expect(html).toContain('650K/buổi')
})

it('marks a Vietnamese fallback on the English route', () => {
  const html = renderToStaticMarkup(<TherapistProfileView therapist={detail} lang="en" />)
  expect(html).toContain('This introduction is currently available in Vietnamese.')
  expect(html).toContain('650K/session')
})

it('renders an update message when no profile exists', () => {
  const html = renderToStaticMarkup(
    <TherapistProfileView therapist={{ ...detail, profile: null }} lang="vi" />,
  )
  expect(html).toContain('Thông tin giới thiệu đang được cập nhật.')
})
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run: `npm test -- tests/therapist-profile-page.test.tsx`

Expected: FAIL vì component chưa tồn tại.

- [ ] **Step 3: Thêm các khóa i18n của detail page**

Thêm các keys sau vào `DICT`, mỗi key có cả `vi` và `en`:

```ts
"profile.back": { vi: "Quay lại đội ngũ", en: "Back to our therapists" },
"profile.about": { vi: "Giới thiệu", en: "About" },
"profile.specialties": { vi: "Chuyên môn", en: "Focus" },
"profile.therapies": { vi: "Liệu pháp", en: "Approaches" },
"profile.price": { vi: "Chi phí", en: "Fee" },
"profile.location": { vi: "Hình thức", en: "Format" },
"profile.fallback": { vi: "", en: "This introduction is currently available in Vietnamese." },
"profile.pending": { vi: "Thông tin giới thiệu đang được cập nhật.", en: "This introduction is being updated." },
"profile.ctaLead": { vi: "Bạn muốn đồng hành cùng", en: "Would you like to work with" },
"profile.cta": { vi: "Liên hệ đặt lịch", en: "Contact us to book" },
```

- [ ] **Step 4: Tạo presentation component**

Component phải:

- dùng `Image` hoặc `ImagePlaceholder`;
- dùng `pickTitle`, `pickSpecialties`, `pickTherapies`, `pickLocation`, `pickProfileContent`;
- split biography bằng `/\n{2,}/`, trim và filter đoạn rỗng;
- render mỗi đoạn bằng `<p key={index}>`;
- render quote bằng `<blockquote>` chỉ khi có quote;
- link quay lại `/${lang}/doi-ngu` và CTA `/${lang}/lien-he`;
- không dùng HTML injection.

Khung root:

```tsx
export default function TherapistProfileView({
  therapist,
  lang,
}: {
  therapist: TherapistDetail
  lang: Lang
}) {
  const tr = t(lang)
  const content = therapist.profile ? pickProfileContent(therapist.profile, lang) : null
  const paragraphs = content?.bio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) ?? []

  return (
    <main className="therapist-profile">
      {/* semantic hero, facts, biography/empty state, quote, CTA */}
    </main>
  )
}
```

- [ ] **Step 5: Thêm responsive CSS**

Dùng prefix `.therapist-profile` cho toàn bộ selectors. Desktop: shell tối đa `1160px`, hero grid `minmax(280px, .8fr) minmax(0, 1.2fr)`, article tối đa `760px`. Mobile dưới `760px`: một cột, ảnh trước nội dung. Thêm `:focus-visible`, `text-wrap: pretty`, `overflow-wrap:anywhere`; không thêm animation bắt buộc.

- [ ] **Step 6: Chạy SSR tests để xác nhận GREEN**

Run: `npm test -- tests/therapist-profile-page.test.tsx`

Expected: PASS với biography, quote, English fallback và empty state.

- [ ] **Step 7: Commit task 4**

```bash
git add components/TherapistProfile.tsx lib/i18n.ts app/globals.css tests/therapist-profile-page.test.tsx
git commit -m "feat(ui): build therapist profile view"
```

---

### Task 5: Route detail, metadata và kiểm thử tích hợp

**Files:**
- Modify: `app/[lang]/doi-ngu/[id]/page.tsx`
- Modify: `tests/therapist-profile-page.test.tsx`
- Modify: `tests/inner-page-visibility.test.tsx`

**Interfaces:**
- Consumes: `getTherapistDetail(id)` từ Task 3, `TherapistProfileView` từ Task 4, `langAlternates` hiện tại.
- Produces: detail route SSR, `generateMetadata`, 404 cho invalid/missing therapist.

- [ ] **Step 1: Viết route tests thất bại**

Mock `getTherapistDetail` và `notFound`, rồi kiểm tra:

```tsx
const mocks = vi.hoisted(() => ({
  getTherapistDetail: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

vi.mock('../lib/content', () => ({ getTherapistDetail: mocks.getTherapistDetail }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))

it('loads one therapist and renders the profile component', async () => {
  mocks.getTherapistDetail.mockResolvedValueOnce(detail)
  const page = await TherapistDetailPage({
    params: Promise.resolve({ lang: 'vi', id: '2' }),
  })
  expect(mocks.getTherapistDetail).toHaveBeenCalledWith(2)
  expect(renderToStaticMarkup(page)).toContain('Nguyễn Ngọc Mai')
})

it('returns not found for a malformed id', async () => {
  await expect(TherapistDetailPage({
    params: Promise.resolve({ lang: 'vi', id: '2abc' }),
  })).rejects.toThrow('NEXT_NOT_FOUND')
  expect(mocks.getTherapistDetail).not.toHaveBeenCalled()
})

it('returns not found when the therapist does not exist', async () => {
  mocks.getTherapistDetail.mockResolvedValueOnce(null)
  await expect(TherapistDetailPage({
    params: Promise.resolve({ lang: 'vi', id: '999' }),
  })).rejects.toThrow('NEXT_NOT_FOUND')
})

it('builds localized metadata and alternates', async () => {
  mocks.getTherapistDetail.mockResolvedValueOnce(detail)
  const metadata = await generateMetadata({
    params: Promise.resolve({ lang: 'en', id: '2' }),
  })
  expect(metadata).toMatchObject({
    title: 'ThS. Ngọc Mai',
    description: 'MSc Clinical Psychology',
    alternates: {
      canonical: '/en/doi-ngu/2',
      languages: { vi: '/vi/doi-ngu/2', en: '/en/doi-ngu/2' },
    },
  })
})
```

- [ ] **Step 2: Chạy route tests để xác nhận RED**

Run: `npm test -- tests/therapist-profile-page.test.tsx`

Expected: FAIL vì route hiện gọi `getTherapists()` và chỉ render tên.

- [ ] **Step 3: Refactor route sang detail loader và component**

```tsx
import { cache } from 'react'
import { notFound } from 'next/navigation'
import TherapistProfileView from '../../../../components/TherapistProfile'
import { getTherapistDetail } from '../../../../lib/content'
import { isLang, langAlternates, type Lang } from '../../../../lib/i18n'
import { pickTitle } from '../../../../lib/types'

const loadTherapist = cache(getTherapistDetail)

function parseParams(lang: string, id: string): { lang: Lang; id: number } | null {
  if (!isLang(lang) || !/^\d+$/.test(id)) return null
  return { lang, id: Number(id) }
}
```

`page` và `generateMetadata` đều dùng `parseParams` và `loadTherapist`; page gọi `notFound()` khi parse/load thất bại.

Metadata trả:

```ts
return {
  title: therapist.name,
  description: pickTitle(therapist, lang),
  alternates: langAlternates(lang, `/doi-ngu/${id}`),
}
```

- [ ] **Step 4: Xóa assertion kiểm tra source text cũ**

Trong `tests/inner-page-visibility.test.tsx`, giữ assertion link card nhưng bỏ `existsSync/readFileSync` và test page mock cũ đang phụ thuộc `getTherapists`. Route behavior đã được kiểm tra trực tiếp trong `tests/therapist-profile-page.test.tsx`.

- [ ] **Step 5: Chạy tests liên quan**

Run: `npm test -- tests/therapist-profile-page.test.tsx tests/inner-page-visibility.test.tsx tests/therapist-profile-content.test.ts`

Expected: tất cả PASS.

- [ ] **Step 6: Chạy verification toàn bộ**

Run: `npm test && npm run build && git diff --check`

Expected:

- Vitest: 0 failed.
- Next build: compiled successfully; TypeScript hoàn tất; route `ƒ /[lang]/doi-ngu/[id]` xuất hiện.
- `git diff --check`: exit 0.

- [ ] **Step 7: Commit task 5**

```bash
git add 'app/[lang]/doi-ngu/[id]/page.tsx' tests/therapist-profile-page.test.tsx tests/inner-page-visibility.test.tsx
git commit -m "feat: publish therapist detail pages"
```

---

### Task 6: Kiểm tra nội dung và bàn giao migration

**Files:**
- Modify only if verification finds a defect in files owned by Tasks 1–5.

**Interfaces:**
- Consumes: toàn bộ implementation và source DOCX.
- Produces: bằng chứng nội dung/route/build sạch và hướng dẫn chạy migration.

- [ ] **Step 1: Đối chiếu snapshot với nguồn**

Run:

```bash
textutil -convert txt -stdout '/Users/nhanvu/Downloads/Tự giới thiệu của các therapist.docx'
npm test -- tests/therapist-profile-data.test.ts
```

Kiểm tra đủ chín mapping, paragraph boundaries, hai quote đã tách và lỗi `tâm lýtrước hết` không còn trong snapshot.

- [ ] **Step 2: Kiểm tra route và copy song ngữ bằng build output/tests**

Run: `npm test -- tests/therapist-profile-page.test.tsx && npm run build`

Expected: tests PASS và production build thoát 0. Cảnh báo Supabase thiếu env trong build được chấp nhận chỉ khi local snapshot được dùng và build vẫn thành công.

- [ ] **Step 3: Kiểm tra worktree và migration chưa được áp dụng tự động**

Run: `git status --short && git log -6 --oneline`

Không chạy migration trực tiếp lên Supabase nếu người dùng chưa yêu cầu thao tác external database. Bàn giao chính xác file `supabase/migrations/0007_therapist_profiles.sql` để chạy trong SQL Editor hoặc deployment pipeline.

- [ ] **Step 4: Commit correction cuối nếu có**

Chỉ khi Step 1–3 phát hiện và đã sửa lỗi, stage lại đúng nhóm file thuộc feature:

```bash
git add data/therapist-profiles.json scripts/therapist-profile-sql.mjs supabase/migrations/0007_therapist_profiles.sql lib/types.ts lib/content.ts components/TherapistProfile.tsx lib/i18n.ts app/globals.css 'app/[lang]/doi-ngu/[id]/page.tsx' tests/therapist-profile-data.test.ts tests/therapist-profile-content.test.ts tests/therapist-profile-page.test.tsx tests/inner-page-visibility.test.tsx
git commit -m "fix: verify therapist profile rollout"
```
