-- Ảnh chân dung therapist.
--
-- GENERATED bởi scripts/content-sql.mjs từ data/therapists.json.
--
-- Nguồn ảnh: "Ảnh các therapist.zip" (Wabi gửi 2026-08-14). File ảnh nằm trong
-- public/images/therapists/; bảng chỉ giữ đường dẫn.
--
-- Ánh xạ theo tên: tên file trong zip là họ tên đầy đủ, tên trên card là tên gọi
-- (ví dụ "Nguyễn Thị Kim Ngân" → card "ThS. Kim Ngân").
--
-- 9/12 therapist có ảnh. Chưa có: ThS. Hà Trang, ThS. Mai Nguyen, Vi Vương.

update therapists as x set photo_url = v.photo_url
from (values
  ('ThS. Ngọc Mai', '/images/therapists/ngoc-mai.jpg'),
  ('ThS. Thu Thuỷ', '/images/therapists/thu-thuy.jpg'),
  ('ThS. Ly Đinh', '/images/therapists/ly-dinh.jpg'),
  ('ThS. Phương An', '/images/therapists/phuong-an.jpg'),
  ('ThS. Kim Ngân', '/images/therapists/kim-ngan.jpg'),
  ('ThS. Gia Bảo', '/images/therapists/gia-bao.jpg'),
  ('ThS. Minh Châu', '/images/therapists/minh-chau.jpg'),
  ('ThS. Đức Minh', '/images/therapists/duc-minh.jpg'),
  ('ThS. Quỳnh Trang', '/images/therapists/quynh-trang.jpg')
) as v(name, photo_url)
where x.name = v.name;
