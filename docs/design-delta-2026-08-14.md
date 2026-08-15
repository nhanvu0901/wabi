# Đối chiếu 1:1 — design mới vs code hiện tại

**Ngày:** 2026-08-14
**Design mới:** `6f9a0d73-Wabi_Therapy.html` (bundled page, 2.1 MB) — markup thật nằm ở dòng 392 dưới dạng chuỗi JSON, đã giải nén ra `uploaded-design.html` (1120 dòng).
**Design cũ (code hiện tại port từ đây):** `Wabi Therapy.dc.html` (561 dòng).
**Trạng thái:** chưa code gì. Đây là bản đồ để quyết định phạm vi.

---

## 0. Cách đọc file bundled

File 2.1 MB nhưng **không chứa ảnh**. Dung lượng đến từ 2 chỗ:

| Dòng | Kích thước | Nội dung |
|---|---|---|
| 380 | 1.91 MB | `support.js` runtime, gzip + base64 — bỏ qua |
| 392 | 216 KB | **Design thật**, chuỗi JSON-escaped |
| còn lại | ~30 KB | thumbnail SVG + loader của bundler |

Giải nén: `JSON.parse(lines[391])` → HTML gốc 1120 dòng.

So sánh markup thô sẽ thấy "+282 dòng" ở phần `<head>` — đó chỉ là bundler inline các `@font-face` của Google Fonts, **không phải thay đổi design**. Sau khi bỏ phần đó, body markup: cũ 355 dòng → mới 376 dòng.

---

## 1. Tổng kết: 3 hạng mục thiếu, 2 lỗi nhỏ

| # | Hạng mục | Design mới | Code hiện tại | Mức độ |
|---|---|---|---|---|
| 1 | **Song ngữ VI/EN** (96 key i18n + nút chuyển) | Có | **Không có** | Lớn — đụng cả DB schema |
| 2 | **Chatbox** (FAB + panel + bot kịch bản) | Có | **Không có** | Lớn — component mới hoàn toàn |
| 3 | **Data therapist song ngữ** (3 field → mảng `[vi,en]`) | Có | 1 ngôn ngữ | Lớn — đụng DB schema |
| 4 | Icon 2 nút CTA: `message-circle` | `calendar-heart` | Nhỏ | |
| 5 | CSS chatbox (7 dòng: scrollbar, 2 keyframes, media query) | Có | Không có | Nhỏ |

**Phần còn lại khớp hoàn toàn.** Đã verify bằng diff: block `<style>` global giống hệt trừ 7 dòng chat; toàn bộ section của 4 trang giống hệt về cấu trúc, style value, text tiếng Việt.

Về câu bạn hỏi trước — "have we have the chat interface" — bây giờ đã rõ: **design mới có chatbox, code chưa có**. Đó là phần thiếu bạn cảm nhận được.

---

## 2. Bản đồ chi tiết theo từng phần

### 2.1 Nav — `components/Nav.tsx`

| Element design mới | Dòng | Code hiện tại | Trạng thái |
|---|---|---|---|
| Logo + 4 link | 327–335 | `Nav.tsx:42–74` | ✅ khớp |
| **Nút VI / EN** | **338–341** | — | ❌ **thiếu** |
| Burger | 342 | `Nav.tsx:75–93` | ⚠️ `aria-label` đổi `"Mở menu"` → `"Menu"` |

Nút ngôn ngữ nằm trong một `<div>` bọc chung với burger, bên phải nav. Active state: `background: var(--accent)` + `color:#FCFAF4`; inactive: `transparent` + `#8A8072`.

### 2.2 Trang chủ — `app/page.tsx`

| Section | Dòng design | Code | Trạng thái |
|---|---|---|---|
| Hero still | 349–370 | `page.tsx:39–190` | ⚠️ icon CTA1 sai |
| Trust strip | 388–398 | `page.tsx:195–243` | ✅ |
| Value cards ×3 | 400–421 | `page.tsx:246–376` | ✅ |
| Services preview ×3 | 427–447 | `page.tsx:379–521` | ✅ |
| Philosophy | 449–459 | `page.tsx:524–559` | ✅ |
| Team glimpse ×4 | 461–495 | `page.tsx:562–639` | ✅ |
| Closing CTA | 497–503 | `page.tsx:642–688` | ⚠️ icon sai |

**Icon sai (2 chỗ):** design mới dùng `message-circle`, code đang dùng `CalendarHeart`.
- `app/page.tsx:156` — nút "Liên hệ với tụi mình"
- `app/page.tsx:685` — nút "Bắt đầu ngay"

Hợp lý: booking ngoài scope, nên design bỏ ẩn dụ "đặt lịch" cả ở chữ lẫn icon. Code đã đổi chữ đúng nhưng chưa đổi icon.

> Đính chính: ở lần review trước mình có báo chữ `"Liên hệ với tụi mình"` là sai lệch so với design. Sai — design mới có đúng chuỗi này (`hero.cta1`). Code đã đúng, chỉ còn icon.

### 2.3 Trang `/dich-vu` — `app/dich-vu/page.tsx`

Cấu trúc, 5 mục, số 01–05, pill, tag, `<b>` highlight: **khớp 100%**. Chỉ thêm `data-i18n` cho từng phần tử — nghĩa là `SERVICE_EXTRAS` (pill + tags) phải có bản EN nếu làm song ngữ.

Key liên quan: `sv.title` `sv.intro` `sv.cta` `sv1.t/b/tag` `sv2.t/b/tag1–4` `sv3.t/b/tag1–3` `sv4.t/badge/b/tag` `sv5.t/b/tag1–3`.

Lưu ý: `sv4.badge` chính là pill "Trị liệu bằng nghệ thuật" hiện có — không phải element mới.

### 2.4 Trang `/doi-ngu` — `app/doi-ngu/page.tsx` + `components/TherapistCard.tsx`

Layout grid và markup card khớp. Nhưng **data đổi cấu trúc**:

| Field | Design cũ | Design mới |
|---|---|---|
| `n` (name) | string | string (giữ nguyên) |
| `r` (title) | string | **`[vi, en]`** |
| `s` (specialties) | string | **`[vi, en]`** |
| `t` (therapies) | string | string (giữ nguyên — toàn viết tắt CBT/ACT/DBT) |
| `p` (price) | string | string (giữ nguyên) |
| `loc` (location) | string | **`[vi, en]`** |

Vẫn đúng 12 người, đúng thứ tự, đúng giá.

**Tiếng Việt cũng được sửa lại** trong bản mới (bỏ bớt từ tiếng Anh chen vào) — seed hiện tại trong Supabase đã lỗi thời:

| Người | Seed hiện tại | Design mới |
|---|---|---|
| Hà Trang | `PTSD, ADHD & LGBTQI+` | `PTSD, ADHD & cộng đồng LGBTQI+` |
| Thu Thuỷ | `childhood trauma, attachment styles` | `sang chấn tuổi thơ, kiểu gắn bó` |
| Thu Thuỷ | `Couple therapy` | `Trị liệu cặp đôi` |
| Phương An | `Tâm lý học trường học` | `Tâm lý học đường` |
| Mai Nguyen | `Couple Hàn–Việt` | `Cặp đôi Hàn–Việt` |
| Quỳnh Trang | `Couple tuổi trẻ` | `Cặp đôi tuổi trẻ` |

### 2.5 Trang `/lien-he` — `app/lien-he/page.tsx` + `components/ContactForm.tsx`

Markup khớp 100%. Chỉ thêm `data-i18n` — kể cả label form (`ct.f.name/contact/msg/btn/note`), block cảm ơn (`ct.ok.t/b`), và **tên 5 đường dây nóng** (`ct.hl1`–`ct.hl5`). Số điện thoại không dịch.

### 2.6 Footer — `components/Footer.tsx`

Khớp. 2 key i18n: `foot.tag`, `foot.copy`.

---

## 3. Chatbox — chi tiết

**Quan trọng: đây là bot kịch bản, KHÔNG dùng LLM.** Không gọi API, không cần OpenRouter. Toàn bộ logic là regex + câu trả lời viết sẵn.

### Markup (design dòng 704–722)
- `#wabi-chat` — wrapper `position:fixed` góc dưới phải
- `#chat-launch` — nút tròn 60px, `var(--accent)`, icon đổi `message-circle` ↔ `x` khi mở/đóng
- `#chat-panel` — header (avatar + "Wabi Therapy" + dòng trạng thái `chat.status`) + `#chat-body` + `#chat-form`
- Mobile ≤520px: panel full-width `calc(100vw - 28px)`

### Hành vi (design dòng 970–1095)
1. Mở lần đầu → `resetChat()`: bong bóng chào + 4 chip gợi ý
2. Chip: `Các dịch vụ` / `Chọn therapist` / `Chi phí & cách bắt đầu` / `Nhắn admin`
3. Gõ tự do → regex phân loại về 1 trong 4 chủ đề, không khớp → `fallback`:
   - `services`: `dịch vụ|service|trị liệu|đánh giá|art|cặp|couple|nghiệp|career`
   - `therapist`: `therapist|chuyên|chọn|choose|ai |who`
   - `fees`: `giá|phí|tiền|cost|fee|price|bao nhiêu|bắt đầu|start|book|đặt|lịch`
   - `admin`: `admin|instagram|facebook|nhắn|contact|liên hệ`
4. Bot trả lời sau `setTimeout` 380ms (chip) / 420ms (gõ tay) — giả độ trễ
5. Trong câu trả lời có `<button data-nav="services|team|contact">` → click thì điều hướng + đóng chat
6. Escape input người dùng bằng `val.replace(/</g,'&lt;')`

### CSS cần thêm vào `app/globals.css`
```css
#chat-panel::-webkit-scrollbar,#chat-body::-webkit-scrollbar{width:8px}
#chat-body::-webkit-scrollbar-thumb{background:#DED3C0;border-radius:8px}
@keyframes wabiPop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes wabiMsg{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(max-width:520px){
  #chat-panel{width:calc(100vw - 28px) !important;height:calc(100vh - 120px) !important;max-height:560px !important}
}
```

---

## 4. i18n — 96 key, và một quyết định kiến trúc

Phân bố key: `nav` 4 · `hero` 5 · `trust` 5 · `why` 8 · `sp` 8 · `phil` 2 · `tg` 7 · `cta` 3 · `sv*` 21 · `tm` 5 · `ct` 20 · `foot` 2 · `chat` 1.

### Cách design làm
`applyLang()` (dòng 847) chạy client-side: quét `#wabi [data-i18n]`, ghi đè `innerHTML`, lưu `localStorage['wabi-lang']`, set `document.documentElement.lang`, đổi placeholder ô chat, rồi `buildTeam()` + `resetChat()`.

### Vấn đề khi port sang Next.js
Cách này **không hợp với mục tiêu SEO** — vốn là lý do spec gốc chọn route thật thay vì SPA. Nếu bê nguyên: server luôn render tiếng Việt, bản EN chỉ tồn tại sau khi JS chạy, Google gần như không index được tiếng Anh, và có nháy đổi chữ khi tải trang.

**Đề xuất:** dùng route thật `/` (vi) và `/en/...`, chọn ngôn ngữ ở server, nút VI/EN thành `<Link>`. Giữ nguyên 96 key làm dictionary, chỉ đổi chỗ áp dụng — từ `innerHTML` sang render server-side. Giao diện y hệt, SEO không mất.

### Ảnh hưởng DB
```sql
alter table therapists
  add column title_en text,
  add column specialties_en text,
  add column location_en text;

alter table services
  add column name_en text,
  add column description_en text;
```
(hoặc gộp thành cột `jsonb`, nhưng tách cột thì sửa trong Table Editor dễ hơn — đúng tinh thần "sửa nội dung qua dashboard, không build admin UI".)

Pill và tag của trang dịch vụ đang hard-code trong `SERVICE_EXTRAS` → cần thêm bản EN trong code, không cần cột DB.

---

## 5. Đã verify là KHÔNG đổi

Để khỏi phải kiểm lại:
- `app/globals.css` — giống hệt design mới, trừ 7 dòng chat
- Toàn bộ palette, spacing, border-radius, shadow, transition, delay stagger
- `initReveal()` — threshold `0.12`, rootMargin `0px 0px -6% 0px`, timeout 2600ms
- Cấu trúc và text tiếng Việt của cả 4 trang (trừ phần therapist ở mục 2.4)
- Footer, 5 hotline, form contact, block cảm ơn
- Danh sách 5 dịch vụ, số 01–05, pill, tag
- 12 therapist: đúng người, đúng thứ tự, đúng giá

---

## 6. Cần bạn quyết trước khi code

1. **i18n theo route thật (`/en/...`) hay theo localStorage như design?** Mình đề xuất route thật — lý do ở mục 4.
2. **Làm chatbox không?** Nếu làm thì bê nguyên bot kịch bản của design (an toàn, không LLM), hay muốn nối vào OpenRouter? Nếu nối LLM thì phải bàn kỹ chuyện an toàn — web phòng trị liệu, người dùng có thể đang khủng hoảng.
3. **Bản EN của 12 therapist + 5 dịch vụ nhập vào DB hay hard-code?** DB thì sửa được qua dashboard, nhưng phải chạy migration.
4. Blocker cũ vẫn còn: **Supabase project `herfvqfjehbyccysqixf` đã chết**, `npm run build` fail. Phải dựng project mới trước khi verify được bất cứ thứ gì.
