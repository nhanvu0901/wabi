# Wabi Therapy — Next.js + Vercel + Supabase Design Spec

**Ngày:** 2026-07-15
**Trạng thái:** Chờ Master Nhan duyệt
**Nguồn design chuẩn:** `Wabi Therapy.dc.html` (bản Claude design, 4 trang). Bản `uploads/wabi-therapy.html` chỉ là tư liệu tham khảo, KHÔNG nằm trong scope.

## 1. Mục tiêu

Chuyển design tĩnh của Claude design thành website Next.js chạy trên Vercel, dùng Supabase cho form contact và nội dung động (therapists, services). **Yêu cầu cứng: giữ 100% style, animation, layout của design gốc.**

## 2. Quyết định đã chốt

| Hạng mục | Quyết định |
|---|---|
| Bản design chuẩn | `Wabi Therapy.dc.html` |
| Vai trò Supabase | Lưu form contact + nội dung therapists/services |
| Sửa nội dung | Trực tiếp qua Supabase Table Editor (KHÔNG build admin UI) |
| Routing | Route thật per page (SEO), giữ nguyên hiệu ứng |
| Ảnh | Tĩnh trong `/public/images`, không dùng Supabase Storage |
| Hướng port | Port nguyên trạng markup + inline style (không Tailwind, không UI lib) |

## 3. Stack

- Next.js (App Router, TypeScript), React server components mặc định.
- Deploy: Vercel. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Supabase: Postgres + RLS. Package `@supabase/supabase-js` (server-side client cho fetch + insert).
- Icon: `lucide-react` (thay CDN `lucide.min.js` — cùng bộ SVG); Font Awesome 6.5.1 giữ qua CDN CSS, chỉ dùng cho brand icon (Facebook/Instagram) và `fa-location-dot`.
- Font: giữ nguyên `<link>` Google Fonts của design gốc (Newsreader + Be Vietnam Pro, đúng URL weights/ital). KHÔNG dùng `next/font` — nó đổi tên font-family nội bộ, làm inline style `font-family:'Newsreader'` của design không match.
- KHÔNG dùng: Tailwind, CSS-in-JS lib, component lib, `support.js`/`image-slot.js` (runtime editor, bỏ hoàn toàn).

## 4. Routes & layout

| Route | Nội dung (thứ tự section giữ nguyên design) |
|---|---|
| `/` | Hero `hero-still` → trust strip (4 số liệu) → 3 value card → services preview (3 card) → philosophy quote → team glimpse (4 người) → closing CTA |
| `/dich-vu` | 5 dịch vụ dạng list đánh số 01–05 |
| `/doi-ngu` | Grid 12 therapist card — data từ Supabase |
| `/lien-he` | Form contact, hotline khẩn cấp, map placeholder |

- Layout chung (`app/layout.tsx`): nav sticky (background `rgba(247,242,233,.82)` + `backdrop-filter:blur(14px)`), footer, mobile burger menu tại breakpoint 860px.
- Nav active state đổi theo route hiện tại (thay cho cơ chế JS `go()` cũ).
- Chuyển route scroll về top (tương đương hành vi `go()` gốc).

## 5. Fidelity — quy tắc port

1. Markup port thẳng sang JSX; **mọi inline style giữ nguyên từng giá trị** (chỉ đổi cú pháp `style` string → object JSX).
2. Block `<style>` gốc (reset, body, `::selection`, `.wburger`, `.wnav-links` media query...) copy nguyên văn vào `app/globals.css`.
3. Component `<Reveal>` (client) tái tạo `initReveal()` gốc đúng thông số: IntersectionObserver `threshold: 0.12`, `rootMargin: '-6%'`; phần tử bắt đầu `opacity:0; transform:translateY(...)` như inline gốc; transition `.8s/.9s ease` + stagger delay `0/.08/.16/.24s`; safety timeout 2600ms hiện nội dung nếu observer không bắn; tôn trọng `prefers-reduced-motion` (thay cho prop `reduceMotion` cũ).
4. `html{scroll-behavior:smooth}`, transition link `color .2s`, hover state — giữ nguyên.
5. Hero: chỉ port variant `hero-still` (mặc định của design). Variant `hero-editorial` KHÔNG port.
6. Nghiệm thu: chạy song song design gốc và bản Next.js, so screenshot từng trang ở desktop + mobile (860px boundary). Lệch = bug.

## 6. Data model (Supabase)

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
  name text not null,           -- field n trong design
  title text not null,          -- field r: học vị/chức danh
  specialties text not null,    -- field s: nhãn "Chuyên môn:" trên card
  therapies text not null,      -- field t: nhãn "Liệu pháp:" trên card
  price text not null,          -- field p: giữ dạng text hiển thị (vd "650K")
  location text not null,       -- field loc: "Online · offline HN"...
  photo_url text                -- path trong /public/images, nullable → placeholder
);

create table contact_submissions (
  id bigint generated always as identity primary key,
  name text not null,
  contact text not null,
  message text,
  created_at timestamptz not null default now()
);
```

- RLS bật cả 3 bảng: `services`/`therapists` cho phép `select` với anon; `contact_submissions` chỉ cho phép `insert` với anon (không select/update/delete).
- Seed script: 5 services + 12 therapists lấy đúng data hard-code trong `Wabi Therapy.dc.html`.
- Nguồn data từng phần:
  - `/dich-vu` (5 services) và `/doi-ngu` (12 therapists): fetch Supabase server-side, `revalidate = 60` (ISR) — sửa trong dashboard, web cập nhật trong ~1 phút.
  - Trang chủ — services preview (3 card): hard-code như design (copy riêng, không trùng bảng services).
  - Trang chủ — team glimpse (4 người): design chọn tay 4 người cụ thể (không phải 4 người đầu bảng) — fetch từ Supabase theo đúng 4 tên đó, giữ thứ tự design; nếu tên nào không còn trong DB (bị đổi tên) thì card đó fallback về nội dung hard-code gốc để giữ layout.

## 7. Form contact

- Client component giữ nguyên UI + validate như design (name required, contact required, message optional).
- Submit qua server action → insert `contact_submissions` → hiện block cảm ơn `#cform-ok` giống hệt hành vi gốc.
- Bổ sung tối thiểu (design gốc chưa có): state lỗi khi insert fail — 1 dòng text báo lỗi, style đồng bộ design.

## 8. Ảnh

- 3 file .jpg trong `uploads/` copy vào `/public/images`, gắn vào hero `hero-still` + team glimpse.
- Slot chưa có ảnh: render placeholder đúng style design (khối màu + caption), không dùng `<image-slot>` custom element.
- Thêm ảnh therapist sau này: commit ảnh vào `/public/images` + điền path vào cột `photo_url` trong dashboard.

## 9. Error handling

- Fetch content fail lúc render → Next.js error boundary mặc định (bảng content ổn định, không cần fallback phức tạp).
- Form fail → dòng báo lỗi inline (mục 7).

## 10. Ngoài scope

- 3 trang của bản uploads: Quy trình & Bảng giá, FAQ, Onion Cafe tracker.
- Admin UI, Supabase Auth, Supabase Storage, booking/đặt lịch.
- Hero variant `hero-editorial`, cơ chế chọn accent color qua prop.
- i18n (nội dung 100% tiếng Việt như design).

## 11. Nghiệm thu (definition of done)

1. 4 route render đúng nội dung, nav active + mobile burger hoạt động.
2. Screenshot so khớp design gốc từng trang, desktop + mobile.
3. Reveal animation chạy đúng (stagger, threshold) và tắt khi `prefers-reduced-motion`.
4. Submit form → có row trong `contact_submissions`, UI hiện lời cảm ơn.
5. Sửa 1 therapist trong Supabase dashboard → web cập nhật trong ~1 phút không cần deploy.
6. Deploy Vercel thành công, env vars cấu hình đúng.
