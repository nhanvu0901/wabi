# Thiết kế hồ sơ chi tiết therapist

## Mục tiêu

Mở rộng trang chi tiết therapist hiện có tại `/{lang}/doi-ngu/{id}` để hiển thị bài tự giới thiệu dài từ tài liệu “Tự giới thiệu của các therapist.docx”. Nội dung dài phải được tải từ Supabase, giữ nguyên giọng văn theo từng đoạn, hỗ trợ song ngữ về mặt schema và không làm nặng truy vấn dùng cho trang danh sách.

## Phạm vi

- Tạo bảng `therapist_profiles` quan hệ một-một với bảng `therapists`.
- Nhập bài giới thiệu tiếng Việt cho 9 therapist đã khớp chắc chắn với dữ liệu hiện tại.
- Mở rộng lớp truy cập dữ liệu và local snapshot để trang vẫn hoạt động khi Supabase không khả dụng.
- Hoàn thiện trang chi tiết với ảnh, thông tin tóm tắt, bài giới thiệu, trích dẫn và CTA liên hệ.
- Hiển thị trạng thái “đang cập nhật” cho therapist chưa có profile được xuất bản.
- Giữ nguyên trang danh sách và URL chi tiết theo ID hiện tại.

Ngoài phạm vi:

- Dịch toàn bộ bài giới thiệu sang tiếng Anh.
- Xây CMS riêng ngoài Supabase Table Editor.
- Chuẩn hóa specialties/therapies thành các bảng quan hệ nhiều-nhiều.
- Tự động parse DOCX trong production.

## Kết quả phân tích nguồn

Tài liệu có 10 tiêu đề hồ sơ, 63 đoạn văn, không có bảng, ảnh hoặc drawing. Chín hồ sơ khớp với dữ liệu hiện tại theo tên hiển thị:

| Tên trong tài liệu | Tên trong `therapists` |
| --- | --- |
| Nguyễn Đức Minh | ThS. Đức Minh |
| Nguyễn Thu Thủy | ThS. Thu Thuỷ |
| Nguyễn Ngọc Mai | ThS. Ngọc Mai |
| Minh Châu | ThS. Minh Châu |
| Đinh Y Ly | ThS. Ly Đinh |
| Ngọ Quỳnh Trang | ThS. Quỳnh Trang |
| An Nguyễn Như Phương | ThS. Phương An |
| Trần Gia Bảo | ThS. Gia Bảo |
| Nguyễn Thị Kim Ngân | ThS. Kim Ngân |

Phạm Trần Đắc Thạnh chưa có bản ghi trong `therapists`. Hồ sơ này chưa được nhập/xuất bản trong đợt đầu vì bảng chính đang yêu cầu `price` và `location`, nhưng tài liệu không cung cấp hai giá trị đó. Khi có dữ liệu còn thiếu, thêm therapist vào bảng chính rồi gắn profile bằng foreign key.

Ba therapist hiện tại chưa có bài giới thiệu là ThS. Hà Trang, ThS. Mai Nguyen và Vi Vương.

## Mô hình dữ liệu

Tạo migration mới với schema:

```sql
create table therapist_profiles (
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
```

`therapist_id` vừa là primary key vừa là foreign key, bảo đảm mỗi therapist chỉ có một profile. `bio_vi` lưu văn bản với các đoạn ngăn cách bởi hai ký tự xuống dòng. Cách này giữ được nội dung gốc và dễ sửa trong Supabase hơn JSONB hoặc nhiều cột nội dung không đồng nhất.

`quote_vi` và `quote_en` là tùy chọn, chỉ dùng cho trích dẫn được tách rõ trong nguồn. `bio_en` và `quote_en` nullable để có thể bổ sung bản dịch sau.

Bật RLS và chỉ cho phép public đọc profile đã xuất bản:

```sql
alter table therapist_profiles enable row level security;

create policy "public read published therapist profiles"
on therapist_profiles
for select
using (is_published = true);
```

Migration seed dùng truy vấn tên hiện tại để tìm `therapist_id`, tránh giả định identity ID giống nhau giữa các môi trường. Các insert dùng `on conflict (therapist_id) do update` để có thể chạy lại an toàn.

## Biên tập và nhập dữ liệu

- Giữ nguyên thứ tự đoạn và ngôi kể của từng therapist.
- Sửa lỗi đánh máy rõ ràng `tâm lýtrước hết` thành `tâm lý trước hết`.
- Không tự ý viết lại các tuyên bố về bằng cấp, chứng nhận, số giờ hoặc kinh nghiệm.
- Giữ nội dung Reiki/Tarot/Oracle trong hồ sơ Thu Thủy vì đây là nội dung do nguồn cung cấp; có thể bỏ sau nếu Wabi yêu cầu biên tập thương hiệu.
- Tách hai trích dẫn được định dạng rõ của Quỳnh Trang và Kim Ngân sang `quote_vi`; không tự tách các phép ẩn dụ nằm giữa đoạn văn.
- Tạo `data/therapist-profiles.json` làm snapshot cùng cấu trúc với bảng để kiểm thử và fallback. Supabase vẫn là nguồn chính.

## Kiểu dữ liệu và truy cập nội dung

Thêm `TherapistProfile` trong `lib/types.ts` và helper chọn nội dung theo ngôn ngữ. Khi `lang=en` nhưng `bio_en` chưa có, giao diện fallback sang `bio_vi`, theo cùng nguyên tắc đang dùng cho các cột `_en` khác.

Thêm hàm `getTherapistDetail(id)` trong `lib/content.ts`. Hàm tải một therapist theo ID cùng profile đã xuất bản, thay vì tải toàn bộ danh sách rồi dùng `.find()`. Nếu Supabase lỗi, hàm ghép `data/therapists.json` và `data/therapist-profiles.json`.

Luồng dữ liệu:

```text
URL /{lang}/doi-ngu/{id}
  -> kiểm tra lang và id
  -> getTherapistDetail(id)
  -> Supabase therapists + therapist_profiles
  -> fallback local snapshots nếu truy vấn lỗi
  -> render thông tin cơ bản + profile
```

ID sai định dạng hoặc therapist không tồn tại trả về 404. Therapist tồn tại nhưng chưa có profile vẫn trả trang hợp lệ với thông tin cơ bản và thông báo đang cập nhật.

## Thiết kế giao diện

Trang chi tiết dùng lại visual system hiện có:

1. Liên kết quay lại “Đội ngũ therapist”.
2. Hero responsive hai cột: ảnh chân dung ở một bên; tên đầy đủ, chức danh, địa điểm và nút liên hệ ở bên còn lại.
3. Khối thông tin nhanh dùng dữ liệu từ `therapists`: chuyên môn, liệu pháp, chi phí và hình thức làm việc.
4. Phần “Giới thiệu” có chiều rộng đọc khoảng 680–760px, render mỗi đoạn trong `bio` thành một `<p>` riêng.
5. Pull quote nền xanh nhạt nếu profile có `quote`.
6. CTA cuối trang dẫn tới `/{lang}/lien-he`.

Trên mobile, bố cục chuyển thành một cột; ảnh và phần nhận diện đứng trước nội dung. Không thu gọn bài viết bằng accordion trong phiên bản đầu vì người dùng đã chủ động bấm “Xem thêm”.

## Nội dung song ngữ

Thêm các khóa UI cho cả Việt và Anh: quay lại, giới thiệu, chuyên môn, liệu pháp, chi phí, đang cập nhật và CTA. Nội dung metadata của therapist tiếp tục dùng các helper `pickTitle`, `pickSpecialties`, `pickTherapies` và `pickLocation` hiện tại.

Khi bài tiếng Anh chưa có, route `/en` hiển thị bài tiếng Việt kèm nhãn ngắn “This introduction is currently available in Vietnamese.” để tránh khiến người dùng tưởng đây là lỗi đổi ngôn ngữ.

## SEO và metadata

`generateMetadata` dùng tên therapist và title theo ngôn ngữ. Canonical và language alternates giữ nguyên ID trong hai route `/vi/doi-ngu/{id}` và `/en/doi-ngu/{id}`.

## Kiểm thử

- Migration có table, foreign key, RLS và policy chỉ đọc profile đã publish.
- Tất cả 9 hồ sơ seed khớp đúng therapist; không tạo nhầm profile cho tên gần giống.
- Hàm đọc detail dùng Supabase khi thành công và local snapshot khi lỗi.
- ID sai hoặc therapist không tồn tại dẫn tới 404.
- Therapist chưa có profile hiển thị trạng thái đang cập nhật.
- Trang tiếng Việt render tên, metadata, các đoạn bio và quote.
- Trang tiếng Anh dùng nội dung `_en` khi có và fallback có nhãn khi chưa có.
- Link “Xem thêm/View details” trên card tiếp tục trỏ đúng route.
- Chạy toàn bộ Vitest và production build trước khi hoàn tất.

## Rủi ro và biện pháp

- **Tên nguồn không trùng tên hiển thị:** mapping được khai báo rõ trong migration, không match mơ hồ trong runtime.
- **Bài viết dài làm nặng trang danh sách:** profile nằm bảng riêng và chỉ được tải ở detail route.
- **Profile chưa sẵn sàng:** `is_published` cùng RLS ngăn nội dung nháp bị public đọc.
- **Supabase gián đoạn:** snapshot cục bộ giữ trang hoạt động và log cảnh báo stale content.
- **Nội dung chuyên môn bị thay đổi ngoài ý muốn:** chỉ sửa lỗi đánh máy hiển nhiên; các chỉnh sửa biên tập khác cần xác nhận riêng.

