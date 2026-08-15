# Research: reranker + kiến trúc chat search — số liệu đo thật

**Ngày:** 2026-08-14 · **Chưa code gì.** Đây là phân tích để chốt kiến trúc.
Số liệu bên dưới đo bằng key thật trên đúng data 12 therapist trong `supabase/seed.sql`.

---

## 1. Reranker hoạt động thế nào

### Hai kiểu model, khác nhau ở chỗ query và document có "gặp nhau" hay không

**Embedding model = bi-encoder** (`qwen/qwen3-embedding-8b`)

```
query    ──► [model] ──► vector A ┐
                                   ├─► cosine(A,B) = điểm
document ──► [model] ──► vector B ┘
```

Query và document đi qua model **riêng biệt**, mỗi bên ra một vector. Model **chưa bao giờ nhìn thấy cả hai cùng lúc** — nó chỉ nén mỗi văn bản thành một điểm trong không gian 4096 chiều, rồi ta đo góc giữa hai điểm.

→ Vector của document **tính trước được**, lưu vào DB. Lúc query chỉ cần embed 1 câu hỏi rồi so sánh toán học. Rất nhanh, rất rẻ, quét được hàng triệu dòng.
→ Đánh đổi: hai câu có thể "gần nhau" trong không gian vector mà thực chất không trả lời được cho nhau.

**Reranker = cross-encoder** (`qwen/qwen3-reranker-8b`)

```
query + document ──► [model đọc cả hai cùng lúc] ──► 1 điểm relevance
```

Ghép query và document vào **cùng một prompt**, cho model đọc chung. Attention chạy chéo giữa từng token của query và từng token của document. Cụ thể với Qwen3-Reranker: model được hỏi "document này có trả lời được query không?" và điểm số lấy từ **logit của token `yes` so với token `no`**, chuẩn hoá về 0–1.

→ Chính xác hơn hẳn vì model thấy được quan hệ trực tiếp.
→ Đánh đổi: **không tính trước được**. Mỗi cặp (query, document) là một lần chạy model. 12 document = 12 lần forward pass. Không quét được cả DB lớn.

### Vì sao phải dùng cả hai — pipeline retrieve-then-rerank

```
1000 dòng ──[embedding, rẻ, nhanh]──► top 20 ──[reranker, đắt, chính xác]──► top 3
```

Embedding lọc thô cho nhanh, reranker tinh lọc cho chính xác. Đây là pipeline chuẩn của RAG.

**Nhưng xem mục 4 — với 17 dòng data thì tầng đầu là thừa.**

---

## 2. Số liệu đo thật

Cách đo: embed 12 therapist (`name + specialties + therapies + price + location`), embed query, xếp hạng bằng cosine, lấy top 5, đưa top 5 qua reranker, so hai bảng xếp hạng.

### Query 1 — "Tôi hay lo âu, mất ngủ, muốn tìm therapist ở Hà Nội"

| # | Embedding (cosine) | | Reranker | |
|---|---|---|---|---|
| 1 | ThS. Gia Bảo | 0.5369 | ThS. Gia Bảo | **0.9707** |
| 2 | ThS. Minh Châu *(HCM)* | 0.5025 | ThS. Quỳnh Trang *(HN)* | **0.9325** |
| 3 | ThS. Đức Minh *(HCM)* | 0.4811 | ThS. Ly Đinh | 0.8355 |
| 4 | ThS. Ly Đinh | 0.4806 | ThS. Minh Châu *(HCM)* | 0.7058 |
| 5 | ThS. Quỳnh Trang *(HN)* | 0.4805 | ThS. Đức Minh *(HCM)* | 0.7058 |

Reranker đẩy 2 người ở **Hà Nội** lên top 2, cosine thì để 2 người HCM ở hạng 2–3. Reranker đọc được chữ "Hà Nội" trong query đối chiếu với "offline HN" trong document — cosine không làm được vì hai vector đã được nén độc lập.

**Độ giãn điểm** (top1 − top5): cosine `0.0565` vs reranker `0.2649`.

### Query 2 — "Con tôi 12 tuổi bị bắt nạt ở trường, cần người hỗ trợ"

| # | Embedding | | Reranker | |
|---|---|---|---|---|
| 1 | ThS. Đức Minh | 0.3032 | ThS. Ngọc Mai | **0.0191** |
| 2 | ThS. Ngọc Mai | 0.2956 | ThS. Ly Đinh | **0.0071** |
| 3 | ThS. Ly Đinh | 0.2650 | ThS. Minh Châu | 0.0057 |
| 4 | ThS. Minh Châu | 0.2447 | ThS. Quỳnh Trang | 0.0052 |
| 5 | ThS. Quỳnh Trang | 0.2432 | ThS. Đức Minh | 0.0045 |

**Đây là query quan trọng nhất trong cả bài test.** Điểm reranker của *cả 5 người* đều gần 0 (cao nhất 0.019). Reranker đang nói: "không ai trong số này phù hợp."

Và nó đúng. Người phù hợp thật là **ThS. Phương An** (*Tâm lý học đường, chuyên viên tâm lý học đường*) và **ThS. Gia Bảo** (*ThS Lâm sàng trẻ em & vị thành niên*) — nhưng **tầng embedding không lôi được họ vào top 5**, nên reranker không có cơ hội chọn.

Hai bài học rút ra:

1. **Reranker chỉ sắp xếp lại thứ đã được đưa cho nó.** Tầng retrieval sót người thì reranker vô phương cứu. Rác vào, rác ra.
2. **Nội dung đưa vào embedding quyết định tất cả.** Mình dựng document từ `name + specialties + therapies + price + location` — **thiếu cột `title`**. Mà "trẻ em & vị thành niên" của Gia Bảo lại nằm đúng ở `title`. Thiếu một cột là hỏng cả truy vấn.

### Query 3 — "vợ chồng tôi hay cãi nhau, muốn tham vấn cặp đôi"

| # | Embedding | | Reranker | |
|---|---|---|---|---|
| 1 | ThS. Mai Nguyen | 0.4395 | ThS. Mai Nguyen | **0.9325** |
| 2 | ThS. Thu Thuỷ | 0.3738 | ThS. Thu Thuỷ | **0.7982** |
| 3 | ThS. Quỳnh Trang | 0.3306 | ThS. Quỳnh Trang | 0.3775 |
| 4 | ThS. Minh Châu | 0.3094 | ThS. Minh Châu | 0.1824 |
| 5 | ThS. Đức Minh | 0.3064 | ThS. Đức Minh | 0.0447 |

Thứ tự **y hệt nhau** — nhưng độ giãn khác một trời một vực: cosine `0.133` vs reranker `0.888`.

Ý nghĩa thực tế: với reranker bạn **đặt được ngưỡng**. "Chỉ hiện người ≥ 0.5" → ra đúng 2 người phù hợp thật. Với cosine bạn không đặt ngưỡng được, vì 0.44 và 0.31 không mang ý nghĩa tuyệt đối nào — nó phụ thuộc query, không so sánh được giữa các query khác nhau.

### Query 4 — "I am an expat, need English-speaking therapist for depression"

| # | Embedding | | Reranker | |
|---|---|---|---|---|
| 1 | ThS. Đức Minh | 0.5071 | ThS. Gia Bảo | 0.9526 |
| 2 | ThS. Gia Bảo | 0.4982 | ThS. Ly Đinh | 0.9526 |
| 3 | ThS. Minh Châu | 0.4773 | ThS. Minh Châu | 0.9325 |
| 4 | ThS. Ly Đinh | 0.4698 | ThS. Đức Minh | 0.9047 |
| 5 | ThS. Kim Ngân | 0.4668 | ThS. Kim Ngân | 0.8933 |

**Cross-lingual chạy tốt**: query tiếng Anh, document tiếng Việt, vẫn khớp được (0.89–0.95). Quan trọng cho phần song ngữ — không cần embed 2 lần cho 2 ngôn ngữ.

Nhưng lại lộ điểm yếu thứ hai: **Vi Vương** là người duy nhất ghi rõ *"4 ngôn ngữ: Việt–Anh–Quan Thoại–Quảng Đông"* — đúng thứ query hỏi — mà không lọt nổi top 5. Lại là lỗi tầng retrieval.

Và điểm reranker dàn đều 0.89–0.95, không phân biệt được ai hơn ai. Vì "depression" thì gần như ai cũng nhận.

---

## 3. Chi phí & độ trễ (đo thật)

| Hạng mục | Token | Chi phí |
|---|---|---|
| Ingest 12 therapist (1 lần) | 853 | $0.0000085 |
| Embed 1 query | ~16 | $0.00000016 |
| Rerank 5 document | ~805 | $0.000161 |
| **Tổng 1 lượt chat** | | **~$0.00016** |

→ **~6.200 lượt hỏi cho $1.** Chi phí không phải vấn đề.

**Độ trễ** (từ VN, đo thật):
- Embed query: 640–2300 ms
- Rerank 5 doc: 880–930 ms
- **Tổng ~1,6–3,2 giây** cho một câu trả lời

Đây mới là vấn đề. 3 giây im lặng trong khung chat là lâu. Cần hiện typing indicator, và nên cân nhắc bỏ bớt một tầng (mục 4).

Giá niêm yết: embedding-8b `$0.01/M token`, reranker-8b `$0.20/M token` — reranker **đắt gấp 20 lần** trên mỗi token, và còn ngốn token gấp nhiều lần vì phải nhét cả document vào mỗi lần chấm.

---

## 4. Khuyến nghị: bạn có thể KHÔNG cần embedding

Data thật của Wabi: **12 therapist + 5 dịch vụ = 17 dòng.**

Pipeline retrieve-then-rerank sinh ra để giải bài toán "1 triệu document, không thể rerank hết". Với 17 dòng, bài toán đó không tồn tại.

| | Phương án A: Embedding → rerank | Phương án B: Rerank thẳng 17 dòng |
|---|---|---|
| Hạ tầng | pgvector + cột vector + pipeline ingest + tái tạo vector mỗi lần sửa nội dung | Không cần gì |
| Số lần gọi API mỗi query | 2 | 1 |
| Độ trễ | ~1,6–3,2s | ~1s |
| Chi phí mỗi query | ~$0.00016 | ~$0.0005 |
| Rủi ro sót người phù hợp | **Có** (đã chứng minh ở query 2 và 4) | **Không** — mọi dòng đều được chấm |
| Vector lỗi thời khi sửa nội dung trong dashboard | Có | Không |

Phương án B đắt hơn ~3 lần mỗi query — tức **2.000 lượt/$1 thay vì 6.200 lượt/$1**. Đổi lại: bỏ được toàn bộ pgvector, bỏ pipeline ingest, bỏ luôn cái lỗi nghiêm trọng nhất đã đo được (retrieval sót người).

**Đề xuất: làm phương án B trước.** Khi nào data vượt ~200 dòng (thêm bài viết, FAQ, blog) thì mới thêm tầng embedding. Code `lib/openrouter.ts` đã có sẵn `embed()` nên lúc đó gắn vào cũng nhanh.

### Nếu vẫn muốn dùng embedding + pgvector

Có một cái bẫy: **pgvector chỉ đánh index được vector tối đa 2000 chiều** (cả `hnsw` lẫn `ivfflat`). `qwen3-embedding-8b` trả về **4096 chiều** → lưu được nhưng không index được, Postgres phải quét tuần tự.

Đã test: OpenRouter **có** nhận tham số `dimensions` — gửi `{"dimensions": 1024}` thì trả về đúng vector 1024 chiều (Matryoshka truncation). Vậy dùng 1024 chiều là index được.

(Với 17 dòng thì quét tuần tự cũng chưa tới 1 ms — lại thêm một lý do cho phương án B.)

### Reranker không thay được filter cứng

Điểm relevance là **ngữ nghĩa**, không phải điều kiện. Query 1 hỏi "ở Hà Nội" nhưng reranker vẫn xếp ThS. Ly Đinh (*chỉ online*) hạng 3 với 0.8355 — vì về mặt chuyên môn thì đúng là hợp.

→ Điều kiện cứng (địa điểm, mức phí, online/offline) phải làm bằng `WHERE` trong SQL, lọc trước rồi mới rerank phần còn lại.

---

## 5. Vấn đề chặn: API key không thể nằm ở frontend

Bạn viết *"our chat won't have backend, we only have supabase database so the FE will do all the embed"*. Chỗ này không làm được như vậy.

**Bất kỳ key nào chạy trong browser đều là key công khai.** Không có cách nào giấu. Người dùng mở DevTools → tab Network → thấy header `Authorization: Bearer sk-or-v1-...`. Bundle JS cũng đọc được. Đưa vào Vercel env vars **không** giúp gì: env var chỉ được thay bằng giá trị thật lúc build, nếu code client đọc nó thì giá trị đó nằm thẳng trong file JS gửi về browser.

Hậu quả: người khác lấy key xài credit của bạn, hoặc gọi model đắt tiền cho đến khi hết tiền.

**Nhưng tiền đề "we don't have a backend" không đúng — bạn đang có sẵn một cái.**

Wabi chạy Next.js trên Vercel. Vercel cho serverless function miễn phí trong cùng project, và **code hiện tại đã dùng rồi**: `submitContact` trong `lib/actions.ts` là một server action — nó chạy trên server Vercel, không phải trong browser. Đó chính là lý do anon key của Supabase tới giờ vẫn an toàn.

Cách làm đúng, không thêm hạ tầng, không thêm tiền:

```
Browser                    Vercel (đã có sẵn)              OpenRouter
   │                              │                            │
   │ POST /api/chat ─────────────►│                            │
   │   { query }                  │ đọc OPENROUTER_API_KEY     │
   │                              │ từ env (server-only)       │
   │                              ├───────────────────────────►│
   │                              │◄─── điểm relevance ────────┤
   │                              │                            │
   │                              │ query Supabase, lọc, xếp   │
   │◄──── danh sách therapist ────┤                            │
```

Key không bao giờ rời server. `lib/openrouter.ts` mình viết hôm trước đã đúng chuẩn này rồi: biến môi trường là `OPENROUTER_API_KEY`, **cố tình không có tiền tố `NEXT_PUBLIC_`**, nên Next sẽ không nhét nó vào bundle browser.

Cần thêm đúng 1 file: `app/api/chat/route.ts`.

Bonus: có server ở giữa thì mới đặt được rate limit. Không có nó, endpoint chat public đồng nghĩa hoá đơn OpenRouter do người lạ quyết định.

*(Nếu sau này thật sự bỏ Vercel: Supabase Edge Functions cũng giữ được key. Nhưng đang có Vercel thì route handler đơn giản hơn nhiều.)*

---

## 6. Vấn đề i18n — giải thích

### Design đang làm thế nào

`applyLang()` (design dòng 847) chạy **trong browser**:

```js
document.querySelectorAll('#wabi [data-i18n]').forEach(el => {
  el.innerHTML = dict[el.getAttribute('data-i18n')][lang]   // ghi đè nội dung
})
localStorage.setItem('wabi-lang', l)
```

Trang load ra tiếng Việt, JS chạy, quét 96 phần tử, ghi đè `innerHTML` từng cái theo ngôn ngữ lưu trong `localStorage`.

Với một file HTML tĩnh thì cách này hoàn toàn ổn. Với Next.js thì vướng 3 chỗ.

### Vướng 1 — Server không biết `localStorage` → mất SEO

Next.js render HTML **trên server**, rồi mới gửi về browser. `localStorage` chỉ tồn tại trong browser. Server không có cách nào biết người dùng chọn EN.

→ HTML server trả về **luôn luôn là tiếng Việt**. Bản tiếng Anh chỉ xuất hiện sau khi JS chạy xong.

Google index HTML từ server. Nghĩa là **toàn bộ nội dung tiếng Anh vô hình với công cụ tìm kiếm** — không có URL riêng để index, không có thẻ `hreflang`, không xếp hạng được cho truy vấn tiếng Anh.

Điều này phá đúng thứ mà spec gốc đánh đổi để lấy. Design gốc là SPA: 4 "trang" nằm chung một file, chuyển bằng hàm `go()` ẩn/hiện div. Spec chọn tách thành 4 route thật **chỉ vì SEO** (`docs/superpowers/specs/...`, mục 2: *"Routing: Route thật per page (SEO)"*). Bê nguyên i18n kiểu localStorage là vứt lại đúng thứ vừa đánh đổi để có.

Với một phòng trị liệu ở Việt Nam nhắm cả khách nước ngoài (design có sẵn bản EN, có therapist nói tiếng Anh/Hàn/Trung), mất khả năng tìm kiếm tiếng Anh là mất thật.

### Vướng 2 — Nháy đổi ngôn ngữ

Người dùng chọn EN, lần sau quay lại:

```
0ms    HTML server về → hiện tiếng Việt
~300ms JS tải xong, chạy applyLang()
~310ms 96 phần tử đổi sang tiếng Anh
```

Người dùng thấy trang giật một cái đổi chữ, **mỗi lần load trang**. Với một brand bán sự tĩnh lặng ("một khoảng lặng") thì chi tiết này lệch tông.

### Vướng 3 — `innerHTML` đánh nhau với React

React tự quản DOM. Lấy `innerHTML` ghi đè lên node do React render sẽ:
- gây **hydration mismatch** (server ra tiếng Việt, client thành tiếng Anh → React cảnh báo và có thể render lại)
- bị **xoá sạch** khi React re-render vì bất kỳ lý do gì (đổi route, đổi state)

Không thể port thẳng cơ chế này. Bắt buộc phải đổi cách.

### Cách sửa: chọn ngôn ngữ ở server, bằng route

```
app/[lang]/page.tsx          →  /vi  và  /en
app/[lang]/dich-vu/page.tsx  →  /vi/dich-vu  và  /en/services
```

Ngôn ngữ nằm trong URL → server biết ngay → render đúng thứ tiếng ngay từ HTML đầu tiên.

| | Cách của design (localStorage) | Route thật |
|---|---|---|
| Google index bản EN | ❌ | ✅ |
| Nháy đổi chữ | Có | Không |
| Xung đột React | Có | Không |
| Chia sẻ link bản EN | ❌ cùng 1 URL | ✅ |
| `hreflang` cho SEO | ❌ | ✅ |
| Giao diện hiển thị | giống hệt | giống hệt |

**Giữ nguyên được 96 key** — chỉ đổi chỗ áp dụng: thay vì `el.innerHTML = dict[k][lang]` chạy trong browser thì thành `{dict[k][lang]}` render ở server. Nút VI/EN thành `<Link>`.

### Ảnh hưởng dây chuyền

1. **Cấu trúc thư mục**: 4 route hiện tại chuyển vào `app/[lang]/`.
2. **DB**: therapist cần `title_en`, `specialties_en`, `location_en`; services cần `name_en`, `description_en` (đã ghi trong `docs/design-delta-2026-08-14.md`). Query chọn cột theo `lang`.
3. **Chat**: lời chào, 4 chip, 5 câu trả lời đều song ngữ → chọn theo `lang` của route.
4. **Chat + search**: document đưa vào rerank nên **luôn dùng bản tiếng Việt** kể cả khi giao diện đang EN — cross-lingual đã chứng minh chạy tốt ở query 4 (0.89–0.95). Đỡ phải duy trì 2 bộ vector/2 bộ document.
5. **Redirect**: `/` nên chuyển hướng theo `Accept-Language`, mặc định `vi`.

---

## 7. Tóm tắt việc cần chốt

| # | Câu hỏi | Đề xuất |
|---|---|---|
| 1 | Key ở FE hay qua route handler? | **Route handler** — không có lựa chọn khác nếu không muốn lộ key |
| 2 | Embedding + rerank, hay rerank thẳng? | **Rerank thẳng 17 dòng.** Thêm embedding khi data > ~200 dòng |
| 3 | Nếu vẫn dùng embedding: số chiều? | `dimensions: 1024` để index được pgvector |
| 4 | Lọc địa điểm/giá | `WHERE` trong SQL, không giao cho reranker |
| 5 | i18n | **Route thật `app/[lang]/`**, không dùng localStorage |
| 6 | Ngôn ngữ của document đem rerank | Luôn tiếng Việt, cross-lingual đã verify |
| 7 | Ngưỡng "không tìm thấy ai phù hợp" | Rerank < ~0.1 → trả lời "nhắn admin nhé" thay vì gợi ý bừa |

Blocker cũ vẫn nguyên: **Supabase project đã chết**, `npm run build` fail. Phải dựng lại trước khi verify được gì.
