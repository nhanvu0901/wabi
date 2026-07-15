# Wabi Therapy Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port design `Wabi Therapy.dc.html` sang Next.js App Router chạy trên Vercel, form + nội dung động qua Supabase, giữ 100% style/animation.

**Architecture:** 4 route thật (`/`, `/dich-vu`, `/doi-ngu`, `/lien-he`) render server-side với ISR 60s; markup port nguyên trạng sang JSX (inline style verbatim); 1 client component chạy lại logic reveal-on-scroll gốc; form contact submit qua server action vào Supabase.

**Tech Stack:** Next.js (App Router, TypeScript), `@supabase/supabase-js`, `lucide-react`, Google Fonts CDN (Newsreader + Be Vietnam Pro), Font Awesome 6.5.1 CDN (brand icons), vitest (validation logic).

**Spec:** `docs/superpowers/specs/2026-07-15-wabi-therapy-nextjs-design.md` — đọc trước khi làm bất kỳ task nào.

## Global Constraints

- **Nguồn design chuẩn duy nhất:** `Wabi Therapy.dc.html` ở project root. `uploads/wabi-therapy.html` KHÔNG dùng (bản draft khác).
- **Fidelity là yêu cầu cứng:** mọi giá trị CSS (màu, spacing, font-size, shadow, transition, delay) copy verbatim từ design. Không "làm đẹp thêm", không đổi giá trị, không format lại màu.
- KHÔNG dùng: Tailwind, CSS modules, styled-components, UI library, `next/font`, `support.js`, `image-slot.js`.
- Palette gốc (tham chiếu nhanh): bg `#F7F2E9`, text `#33302A`, accent `#5A6647`, accent-deep `#434D35`, selection bg `#DDE2CF`, nav bg `rgba(247,242,233,.82)` + blur 14px, mobile menu bg `#FBF7EF`, border `#E2D8C6`.
- Font: Newsreader (display) + Be Vietnam Pro (body) qua `<link>` Google Fonts giữ NGUYÊN URL trong design (có preconnect). Font Awesome 6.5.1 qua CDN cdnjs giữ nguyên URL.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong `.env.local` (không commit). `.env.example` commit.
- Node >= 20. Package manager: npm.
- Mọi nội dung text tiếng Việt copy nguyên văn từ design — không sửa chính tả, không viết lại.
- Commit message tiếng Anh, conventional commits, kết thúc bằng footer Co-Authored-By theo chuẩn session.

### Quy tắc chuyển đổi markup (R1–R9) — áp dụng cho MỌI task port

- **R1** — `style="a:b;c:d"` → `style={{ a: 'b', c: 'd' }}`. Property đổi camelCase (`font-size`→`fontSize`), GIÁ TRỊ giữ nguyên từng ký tự. `backdrop-filter` cần cả `WebkitBackdropFilter`.
- **R2** — `class` → `className`, `for` → `htmlFor`. Void element tự đóng (`<br/>`, `<img/>`).
- **R3** — Link điều hướng `<a onClick="{{ go }}" data-p="X">` → `<Link href="...">` của `next/link`, giữ nguyên className/style, bỏ `data-p`. Map: `home`→`/`, `services`→`/dich-vu`, `team`→`/doi-ngu`, `contact`→`/lien-he`.
- **R4** — Icon Lucide `<i data-lucide="heart-handshake" style="...">` → import icon PascalCase từ `lucide-react`: `<HeartHandshake style={{...}} />`. Nếu design set width/height/stroke qua style/attr thì giữ; không set thì để default (24px, stroke 2 — trùng default CDN).
- **R5** — `<image-slot id="..." placeholder="...">` → component `<ImagePlaceholder label="..."/>` (Task 3) khi chưa có ảnh thật; → `<img src="/images/..." alt="..." style={{...}}/>` khi có ảnh (Task 10). Giữ nguyên style của element bao ngoài.
- **R6** — `onClick="{{ toggleMenu }}"`, `onSubmit="{{ submitForm }}"` → React handler trong client component tương ứng.
- **R7** — Giữ nguyên attribute `data-reveal` và inline `opacity:0;transform:translateY(...);transition:...` của các phần tử reveal — KHÔNG gộp, KHÔNG bỏ delay.
- **R8** — HTML comment `<!-- ... -->` → `{/* ... */}` hoặc bỏ.
- **R9** — Section nào trong design nằm trong `#page-X` có `display:none` thì khi port sang page riêng BỎ wrapper ẩn/hiện đó (route đảm nhiệm), giữ nguyên mọi thứ bên trong.

### Vị trí nguồn trong `Wabi Therapy.dc.html` (bản đồ line)

| Phần | Lines |
|---|---|
| `<style>` global (head) | trong `<helmet>`, ~L18–38 |
| Header/nav | L40–54 |
| Home: hero-still | L60–75 |
| Home: hero-editorial (KHÔNG port) | L78–94 |
| Home: trust strip | L97–104 |
| Home: value cards | L107–131 |
| Home: services preview | L134–158 |
| Home: philosophy quote | L161–168 |
| Home: team glimpse | L171–203 |
| Home: closing CTA | L206–212 |
| Page services | L216–304 |
| Page team (grid rỗng, JS đổ) | L307–322 |
| Page contact + form `#cform` | L325–397 (form L348–363) |
| Footer | L400–415 |
| Script: `initIcons()` | L453–456 |
| Script: `initReveal()` | L458–483 |
| Script: `go()` | L485–500 |
| Script: `buildTeam()` + mảng 12 therapist | L502–538 |
| Script: `toggleMenu()`, `submitForm()` | L547–555 |

(Line có thể lệch vài dòng — grep theo id/tên hàm nếu không khớp.)

---

### Task 1: Scaffold Next.js + git repo

**Files:**
- Create: `package.json`, `.gitignore`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css` (tạm), `.env.example`
- Auto-generated khi chạy dev: `tsconfig.json`, `next-env.d.ts`

**Interfaces:**
- Produces: project chạy được `npm run dev`, layout import `globals.css`.

- [ ] **Step 1: Init git + gitignore**

```bash
cd "/Users/nhan/Documents/Mac home project/Wabi Therapy website redesign"
git init
```

`.gitignore`:
```
node_modules/
.next/
.env*.local
.DS_Store
*.tsbuildinfo
```

- [ ] **Step 2: package.json + deps**

```json
{
  "name": "wabi-therapy",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  }
}
```

```bash
npm install next@latest react@latest react-dom@latest
npm install @supabase/supabase-js lucide-react
npm install -D typescript @types/react @types/react-dom @types/node vitest
```

- [ ] **Step 3: layout + page tối thiểu**

`app/layout.tsx`:
```tsx
import './globals.css'

export const metadata = { title: 'Wabi Therapy' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
```

`app/page.tsx`:
```tsx
export default function Home() {
  return <div>wabi</div>
}
```

`app/globals.css`: file rỗng (Task 2 điền).

`.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 4: Verify**

Run: `npm run dev` → mở `http://localhost:3000`, thấy "wabi". `tsconfig.json` + `next-env.d.ts` tự sinh. Dừng dev server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app"
```

---

### Task 2: globals.css + layout hoàn chỉnh (fonts, Nav, Footer)

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`
- Create: `components/Nav.tsx`, `components/Footer.tsx`

**Interfaces:**
- Consumes: layout Task 1.
- Produces: `<Nav/>` (client component, tự quản burger state, active link theo `usePathname()`), `<Footer/>` (server component). Mọi page sau chỉ cần render nội dung — nav/footer nằm ở layout.

- [ ] **Step 1: globals.css**

Copy NGUYÊN VĂN block `<style>` trong `<helmet>` của `Wabi Therapy.dc.html` (~L18–38) vào `app/globals.css`. Nội dung phải gồm đúng các rule sau (đối chiếu từng dòng với source):

```css
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Be Vietnam Pro',system-ui,sans-serif;background:#F7F2E9;color:#33302A;line-height:1.72;font-weight:400;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:var(--accent,#5A6647);text-decoration:none;transition:color .2s}
a:hover{color:var(--accent-deep,#434D35)}
img{max-width:100%;display:block}
input,textarea,button,select{font-family:inherit;font-size:1rem}
::selection{background:#DDE2CF;color:#33302A}
.wburger{display:none}
@media(max-width:860px){
  .wnav-links{display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;background:#FBF7EF;border-bottom:1px solid #E2D8C6;padding:14px;gap:6px;box-shadow:0 24px 40px -28px rgba(51,48,42,.5)}
  .wnav-links.open{display:flex}
  .wnav-links a{width:100%;text-align:left}
  .wburger{display:inline-flex}
}
```

Kiểm tra trong source xem `--accent`/`--accent-deep` có được set ở đâu không (script set theo prop accent). Nếu chỉ có fallback → thêm cuối globals.css:

```css
:root{--accent:#5A6647;--accent-deep:#434D35}
```

(Nếu script gốc set giá trị khác cho default accent → dùng giá trị đó.)

- [ ] **Step 2: layout head — fonts + FA**

`app/layout.tsx` — thêm đúng các link trong `<helmet>` của design:

```tsx
import './globals.css'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export const metadata = { title: 'Wabi Therapy' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400;1,6..72,500&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <div id="wabi" style={{ position: 'relative' }}>
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Nav.tsx**

Port header L40–54 theo R1–R6. Khung behavior:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dich-vu', label: 'Dịch vụ' },      // label copy đúng từ design
  { href: '/doi-ngu', label: 'Đội ngũ' },
  { href: '/lien-he', label: 'Contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  // markup: copy verbatim từ L40-54, thay:
  // - onClick="{{ go }}" → <Link>, đóng menu khi click: onClick={() => setOpen(false)}
  // - active style: design style link active thế nào (class/inline) thì áp cho link có pathname === href
  // - burger: onClick={() => setOpen(o => !o)}; div .wnav-links thêm className={open ? 'wnav-links open' : 'wnav-links'} với id giữ nguyên (#wmenu nếu có)
  return (/* header port từ L40-54 */)
}
```

Đọc kỹ L485–500 (`go()`) xem active state set thế nào (class hay inline style) và áp đúng cơ chế đó theo pathname.

- [ ] **Step 4: Footer.tsx**

Port footer L400–415 theo R1–R8. Server component thuần (không state). Social icons dùng Font Awesome class y nguyên (`fa-brands fa-facebook`...), href giữ link thật trong design.

- [ ] **Step 5: Verify**

`npm run dev` → check:
- Nav sticky, blur backdrop, đúng màu `rgba(247,242,233,.82)`.
- Thu hẹp cửa sổ < 860px → burger hiện, bấm toggle menu, menu nền `#FBF7EF`.
- Click link đổi route (page con 404 — chưa tạo, OK), logo/footer đúng font chữ.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: global styles, fonts, nav and footer"
```

---

### Task 3: RevealInit + ImagePlaceholder

**Files:**
- Create: `components/RevealInit.tsx`, `components/ImagePlaceholder.tsx`
- Modify: `app/layout.tsx` (mount `<RevealInit/>`)

**Interfaces:**
- Produces: `<RevealInit/>` — client component không render gì, chạy lại observer mỗi lần đổi route; `<ImagePlaceholder label={string} style?={React.CSSProperties}/>`.
- Mọi page sau chỉ cần giữ `data-reveal` + inline style gốc là animation tự chạy.

- [ ] **Step 1: Đọc `initReveal()` gốc (L458–483)**

Ghi lại chính xác: threshold, rootMargin, hành vi khi intersect (set opacity/transform gì), safety timeout ms, xử lý reduceMotion. Các giá trị dưới đây phải khớp source — nếu source khác, THEO SOURCE.

- [ ] **Step 2: RevealInit.tsx**

```tsx
'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function RevealInit() {
  const pathname = usePathname()
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const show = (el: HTMLElement) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(show)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show(e.target as HTMLElement)
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '-6%' } // đối chiếu source, copy đúng giá trị gốc
    )
    els.forEach((el) => io.observe(el))
    const t = setTimeout(() => els.forEach(show), 2600) // safety timeout gốc
    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [pathname])
  return null
}
```

Mount trong layout body: `<RevealInit />` ngay trong `<div id="wabi">`.

- [ ] **Step 3: ImagePlaceholder.tsx**

Nhìn cách `<image-slot>` hiển thị placeholder trong design (image-slot.js render khối gì: nền màu + text placeholder). Tái tạo tối giản đúng hình thức:

```tsx
export default function ImagePlaceholder({
  label,
  style,
}: {
  label: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#E9E2D3',   // đối chiếu màu placeholder thật trong image-slot.js/design
        color: '#8A8272',
        fontSize: '.85rem',
        textAlign: 'center',
        padding: '12px',
        ...style,
      }}
    >
      {label}
    </div>
  )
}
```

- [ ] **Step 4: Verify**

Thêm tạm vào `app/page.tsx` 1 block `data-reveal` với inline style gốc kiểu hero (`opacity:0;transform:translateY(18px);transition:opacity .8s ease, transform .8s ease`):
reload → block fade-in đúng kiểu. Bật "Emulate CSS prefers-reduced-motion" trong DevTools → hiện ngay không animation. Xóa block tạm.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: reveal-on-scroll runtime and image placeholder"
```

---

### Task 4: Trang chủ (static port)

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `RevealInit` (đã mount ở layout), `ImagePlaceholder`.
- Produces: trang `/` đầy đủ 7 section. Team glimpse tạm hard-code 4 card như design — Task 8 chuyển sang Supabase.

- [ ] **Step 1: Port lần lượt 7 section**

Nguồn → thứ tự trong page:
1. hero-still L60–75 (bỏ hero-editorial L78–94)
2. trust strip L97–104
3. value cards L107–131
4. services preview L134–158 (3 card — giữ hard-code vĩnh viễn, link sang `/dich-vu`)
5. philosophy quote L161–168
6. team glimpse L171–203 (4 card hard-code — copy đúng data trong markup)
7. closing CTA L206–212

Áp R1–R9. Mọi `data-reveal` + delay so le giữ nguyên (R7). `<image-slot>` hero + glimpse → `<ImagePlaceholder label="<placeholder text gốc>"/>` (R5).

- [ ] **Step 2: Verify từng section**

`npm run dev` → so với design source từng section: đúng thứ tự, font display Newsreader ở heading, spacing/màu khớp, reveal chạy stagger khi scroll. Mobile < 860px: layout không vỡ, không tràn ngang (`overflow-x` đã hidden ở body).

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: build pass, `/` prerendered.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: home page ported from design"
```

---

### Task 5: Supabase — schema, seed, client

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `supabase/seed.sql`, `lib/supabase.ts`, `lib/types.ts`, `.env.local` (không commit)

**Interfaces:**
- Produces: `supabase()` trả `SupabaseClient`; types `Therapist`, `Service`; 3 bảng đã tạo + seed trên Supabase project của Master.

```ts
// lib/types.ts
export type Service = {
  id: number
  sort_order: number
  name: string
  description: string
}

export type Therapist = {
  id: number
  sort_order: number
  name: string
  title: string
  specialties: string
  therapies: string
  price: string
  location: string
  photo_url: string | null
}
```

- [ ] **Step 1: Migration SQL**

`supabase/migrations/0001_init.sql`:

```sql
create table services (
  id bigint generated always as identity primary key,
  sort_order int not null,
  name text not null,
  description text not null
);

create table therapists (
  id bigint generated always as identity primary key,
  sort_order int not null,
  name text not null,        -- field n
  title text not null,       -- field r
  specialties text not null, -- field s ("Chuyên môn:")
  therapies text not null,   -- field t ("Liệu pháp:")
  price text not null,       -- field p
  location text not null,    -- field loc
  photo_url text
);

create table contact_submissions (
  id bigint generated always as identity primary key,
  name text not null,
  contact text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table services enable row level security;
alter table therapists enable row level security;
alter table contact_submissions enable row level security;

create policy "public read services" on services
  for select using (true);

create policy "public read therapists" on therapists
  for select using (true);

create policy "anon insert contact" on contact_submissions
  for insert with check (true);
```

- [ ] **Step 2: Seed SQL — trích data từ design**

Đọc `Wabi Therapy.dc.html`:
- 5 services: trang services L216–304 — lấy đúng tên + mô tả từng dịch vụ 01–05.
- 12 therapists: mảng trong `buildTeam()` L502–538 (field n/r/s/t/p/loc) — map n→name, r→title, s→specialties, t→therapies, p→price, loc→location; `sort_order` theo thứ tự mảng, `photo_url` = null.

`supabase/seed.sql` dạng:

```sql
insert into services (sort_order, name, description) values
  (1, '<tên dịch vụ 1 nguyên văn>', '<mô tả nguyên văn>'),
  (2, '...', '...'),
  (3, '...', '...'),
  (4, '...', '...'),
  (5, '...', '...');

insert into therapists (sort_order, name, title, specialties, therapies, price, location, photo_url) values
  (1, '<tên>', '<title>', '<desc>', '<specialties>', '<price>', null),
  -- ... đủ 12 dòng, escape dấu nháy đơn trong text tiếng Việt ('' thay ')
  (12, '...', '...', '...', '...', '...', null);
```

Nội dung nguyên văn, không sửa chữ.

- [ ] **Step 3: Master tạo Supabase project + chạy SQL** *(cần Master hỗ trợ)*

1. Master tạo project tại supabase.com (region Singapore gần VN).
2. Dashboard → SQL Editor → paste `0001_init.sql` chạy, rồi `seed.sql` chạy.
3. Lấy Project URL + anon key (Settings → API) điền vào `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

- [ ] **Step 4: lib/supabase.ts**

```ts
import { createClient } from '@supabase/supabase-js'

export function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 5: Verify kết nối**

```bash
node --env-file=.env.local -e "
const { createClient } = require('@supabase/supabase-js');
const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
c.from('therapists').select('id', { count: 'exact', head: true }).then(r => console.log('therapists:', r.count));
c.from('services').select('id', { count: 'exact', head: true }).then(r => console.log('services:', r.count));
"
```
Expected: `therapists: 12`, `services: 5`.

- [ ] **Step 6: Commit** (không commit `.env.local`)

```bash
git add supabase lib .env.example
git commit -m "feat: supabase schema, seed and client"
```

---

### Task 6: Trang `/dich-vu`

**Files:**
- Create: `app/dich-vu/page.tsx`

**Interfaces:**
- Consumes: `supabase()`, `Service`.
- Produces: route `/dich-vu` render 5 services từ DB, đánh số `01`–`05` theo `sort_order`.

- [ ] **Step 1: Port page**

Markup từ L216–304 (bỏ wrapper `display:none` — R9). Phần lặp 5 dịch vụ → map từ DB:

```tsx
import { supabase } from '../../lib/supabase'
import type { Service } from '../../lib/types'

export const revalidate = 60
export const metadata = { title: 'Dịch vụ — Wabi Therapy' }

export default async function ServicesPage() {
  const { data, error } = await supabase()
    .from('services')
    .select('*')
    .order('sort_order')
  if (error) throw error
  const services = data as Service[]

  return (
    /* wrapper section port verbatim từ design */
    /* services.map((s, i) => ( item markup verbatim, số thứ tự String(i+1).padStart(2,'0'), tên + mô tả từ s )) */
  )
}
```

Số `01`–`05`, style numbered list, divider, spacing — copy đúng design.

- [ ] **Step 2: Verify**

`/dich-vu` hiện đúng 5 mục đúng thứ tự, so markup với design source. Sửa 1 description trong Supabase Table Editor → reload sau 60s thấy thay đổi → sửa lại như cũ.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: services page from supabase"
```

---

### Task 7: Trang `/doi-ngu`

**Files:**
- Create: `app/doi-ngu/page.tsx`, `components/TherapistCard.tsx`

**Interfaces:**
- Consumes: `supabase()`, `Therapist`, `ImagePlaceholder`.
- Produces: `<TherapistCard t={Therapist}/>` — card markup đúng `buildTeam()`; route `/doi-ngu` render grid 12 card.

- [ ] **Step 1: TherapistCard**

Đọc template string trong `buildTeam()` L502–538 — đó là markup chuẩn của card (ảnh slot, tên, title, specialties, price). Port sang:

```tsx
import ImagePlaceholder from './ImagePlaceholder'
import type { Therapist } from '../lib/types'

export default function TherapistCard({ t }: { t: Therapist }) {
  return (
    /* card markup verbatim từ template buildTeam():
       - <image-slot> → t.photo_url ? <img src={t.photo_url} alt={t.name} style={{...}}/> : <ImagePlaceholder label="Ảnh"/>
       - ${m.name} → {t.name}, tương tự title/specialties/price
       - data-reveal + transition giữ nguyên */
  )
}
```

- [ ] **Step 2: Page**

Port khung page team L307–322 (heading, intro, `#team-grid`):

```tsx
import { supabase } from '../../lib/supabase'
import type { Therapist } from '../../lib/types'
import TherapistCard from '../../components/TherapistCard'

export const revalidate = 60
export const metadata = { title: 'Đội ngũ — Wabi Therapy' }

export default async function TeamPage() {
  const { data, error } = await supabase()
    .from('therapists')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return (
    /* khung page verbatim; trong grid: (data as Therapist[]).map(t => <TherapistCard key={t.id} t={t}/>) */
  )
}
```

Grid style (columns, gap) copy đúng chỗ `buildTeam()` đổ card vào `#team-grid` (check style của `#team-grid` trong markup L307–322).

- [ ] **Step 3: Verify**

`/doi-ngu` hiện đủ 12 card đúng thứ tự như design, reveal stagger chạy, mobile không vỡ grid.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: team page from supabase"
```

---

### Task 8: Home glimpse lấy từ Supabase

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `supabase()`, `Therapist`.

- [ ] **Step 1: Chuyển page thành async, fetch 4 therapist đầu**

```tsx
export const revalidate = 60

export default async function Home() {
  const { data, error } = await supabase()
    .from('therapists')
    .select('*')
    .order('sort_order')
    .limit(4)
  if (error) throw error
  // glimpse section: thay 4 card hard-code bằng map(data), GIỮ NGUYÊN markup card glimpse gốc (L171-203),
  // chỉ thay text tên/title bằng field từ DB. Card glimpse ≠ TherapistCard (markup khác) — không dùng chung.
}
```

- [ ] **Step 2: Verify**

Trang chủ glimpse hiện đúng 4 người đầu của bảng, hình thức không đổi so trước.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: home team glimpse from supabase"
```

---

### Task 9: Trang `/lien-he` + form contact

**Files:**
- Create: `app/lien-he/page.tsx`, `components/ContactForm.tsx`, `lib/validate.ts`, `lib/actions.ts`, `lib/validate.test.ts`

**Interfaces:**
- Produces:
  - `validateContact(input: { name?: string; contact?: string; message?: string }): { name: string; contact: string; message: string | null } | null` — null nếu invalid.
  - server action `submitContact(formData: FormData): Promise<{ ok: boolean }>`.

- [ ] **Step 1: Failing test trước (TDD)**

`lib/validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateContact } from './validate'

describe('validateContact', () => {
  it('accepts valid input', () => {
    expect(
      validateContact({ name: 'An', contact: '0900000000', message: 'xin chào' })
    ).toEqual({ name: 'An', contact: '0900000000', message: 'xin chào' })
  })
  it('trims and treats empty message as null', () => {
    expect(validateContact({ name: ' An ', contact: ' a@b.c ', message: '  ' }))
      .toEqual({ name: 'An', contact: 'a@b.c', message: null })
  })
  it('rejects missing name', () => {
    expect(validateContact({ contact: '0900000000' })).toBeNull()
  })
  it('rejects missing contact', () => {
    expect(validateContact({ name: 'An' })).toBeNull()
  })
})
```

Run: `npm test` → FAIL (module not found).

- [ ] **Step 2: Implement validate**

`lib/validate.ts`:

```ts
export function validateContact(input: {
  name?: string
  contact?: string
  message?: string
}): { name: string; contact: string; message: string | null } | null {
  const name = input.name?.trim()
  const contact = input.contact?.trim()
  if (!name || !contact) return null
  const message = input.message?.trim()
  return { name, contact, message: message || null }
}
```

Run: `npm test` → PASS.

- [ ] **Step 3: Server action**

`lib/actions.ts`:

```ts
'use server'

import { supabase } from './supabase'
import { validateContact } from './validate'

export async function submitContact(formData: FormData): Promise<{ ok: boolean }> {
  const valid = validateContact({
    name: formData.get('name')?.toString(),
    contact: formData.get('contact')?.toString(),
    message: formData.get('message')?.toString(),
  })
  if (!valid) return { ok: false }
  const { error } = await supabase().from('contact_submissions').insert(valid)
  return { ok: !error }
}
```

- [ ] **Step 4: ContactForm client component**

Port form `#cform` L348–363 verbatim (field name/contact/message, required như design, nút submit). Behavior thay `submitForm()` gốc (L548–555: ẩn form, hiện `#cform-ok`):

```tsx
'use client'
import { useState, useTransition } from 'react'
import { submitContact } from '../lib/actions'

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [pending, startTransition] = useTransition()

  if (state === 'ok') {
    return (/* block #cform-ok port verbatim từ design */)
  }

  return (
    <form
      /* id + inline style verbatim từ #cform */
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(async () => {
          const res = await submitContact(fd)
          setState(res.ok ? 'ok' : 'error')
        })
      }}
    >
      {/* fields verbatim */}
      {state === 'error' && (
        <p style={{ color: '#8a4b3a', fontSize: '.9rem', marginTop: '8px' }}>
          Gửi không thành công, vui lòng thử lại hoặc gọi hotline.
        </p>
      )}
      {/* nút submit: disabled={pending} */}
    </form>
  )
}
```

(Câu báo lỗi: dùng lời trung tính — "Gửi không thành công, vui lòng thử lại hoặc gọi hotline." — màu lấy tông đất đồng bộ palette.)

- [ ] **Step 5: Page**

Port page contact L325–397 (bỏ wrapper ẩn — R9): heading, hotline khẩn cấp, map placeholder, chèn `<ContactForm/>` đúng vị trí `#cform`.

```tsx
export const metadata = { title: 'Liên hệ — Wabi Therapy' }
```

- [ ] **Step 6: Verify end-to-end**

1. `npm test` → PASS.
2. `/lien-he` → submit thiếu name → browser chặn (required). Submit hợp lệ → hiện block cảm ơn giống design.
3. Supabase Table Editor → `contact_submissions` có row mới đúng nội dung.
4. Tắt mạng (DevTools offline) → submit → hiện dòng lỗi.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: contact page with supabase-backed form"
```

---

### Task 10: Ảnh thật

**Files:**
- Create: `public/images/` (copy 3 jpg)
- Modify: `app/page.tsx` (hero + glimpse nếu gắn)

- [ ] **Step 1: Copy ảnh**

```bash
mkdir -p public/images
cp "uploads/274647ef7c12fd4ca403.jpg" public/images/hero.jpg
cp "uploads/2aoboqkw6la6lnwnrrspepritlhjjiqgu6uwrids2.jpg" public/images/glimpse-1.jpg
cp "uploads/2aoboqkw6la6lnwnrrspeptyrrkzu8cqqoutbres1.jpg" public/images/glimpse-2.jpg
```

Mở 3 ảnh xem nội dung thật trước khi đặt tên/gắn — ảnh nào hợp hero (phong cảnh/không gian) thì làm hero, ảnh chân dung thì vào glimpse. Đổi tên theo nội dung thực tế.

- [ ] **Step 2: Gắn ảnh**

Hero: `<ImagePlaceholder/>` → `<img src="/images/hero.jpg" alt="..." style={{width:'100%',height:'100%',objectFit:'cover'}}/>` — style khớp khung slot gốc (check style wrapper trong design, dùng đúng border-radius nếu có). Tương tự 2 slot glimpse; 2 slot glimpse còn lại giữ placeholder.

- [ ] **Step 3: Verify**

Ảnh hiện đúng khung, không méo tỉ lệ, không vỡ layout mobile.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: real images for hero and glimpse"
```

---

### Task 11: Fidelity pass toàn site

**Files:**
- Modify: bất kỳ file nào lệch design.

**Bối cảnh:** bản gốc `Wabi Therapy.dc.html` KHÔNG tự chạy ngoài editor (support.js cần React global do host inject) — nên đối chiếu bằng code-level diff + mắt thường, không mở được bản gốc trong browser thường. Nếu Master mở được design trong Claude design editor thì so screenshot trực tiếp.

- [ ] **Step 1: Code-level diff từng section**

Với từng section trong bản đồ line: mở song song source + file JSX tương ứng, đối chiếu TỪNG inline style value, className, text content, thứ tự element, `data-reveal` + delay. Ghi mọi lệch vào list, sửa hết.

- [ ] **Step 2: Kiểm tra hành vi**

- Reveal: scroll từng trang, stagger đúng; `prefers-reduced-motion` → hiện ngay.
- Nav: active state đổi đúng theo route; burger mobile toggle; route change scroll về top.
- `scroll-behavior:smooth`, `::selection` màu `#DDE2CF`, link hover đổi màu accent-deep.

- [ ] **Step 3: Screenshot cho Master duyệt**

Chụp 4 trang × 2 breakpoint (desktop 1440, mobile 390) → 8 ảnh, gửi Master duyệt fidelity.

- [ ] **Step 4: Build + test sạch**

```bash
npm test && npm run build
```
Expected: PASS + build success không warning lạ.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: fidelity corrections after design diff"
```

---

### Task 12: Deploy Vercel *(cần Master hỗ trợ bước login)*

- [ ] **Step 1: Push GitHub**

Master tạo repo (hoặc dùng `gh repo create wabi-therapy --private`), rồi:

```bash
git remote add origin <repo-url>
git push -u origin main
```

- [ ] **Step 2: Vercel import**

Master vào vercel.com → Add New Project → import repo → framework tự nhận Next.js → thêm 2 env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production + Preview) → Deploy.

- [ ] **Step 3: Verify production**

- 4 route load đúng trên domain vercel.app.
- Submit form thật → row mới trong `contact_submissions`.
- Sửa 1 therapist trong dashboard → ~1 phút sau production cập nhật (ISR).

- [ ] **Step 4: Done**

Báo Master: URL production + checklist nghiệm thu mục 11 của spec, từng mục pass/fail.
