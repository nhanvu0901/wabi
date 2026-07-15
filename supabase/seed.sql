insert into services (sort_order, name, description) values
  (1, 'Tham vấn & Trị liệu tâm lý', 'Quá trình điều trị liên tục nhằm giải quyết vấn đề tâm lý, cải thiện sức khỏe tinh thần và phát triển cá nhân, thông qua đối thoại và các kỹ thuật chuyên biệt. Phù hợp cho vấn đề về bản ngã (phát triển bản thân, lòng tự trọng, phong cách gắn bó) và các bệnh lý.'),
  (2, 'Đánh giá tâm lý', 'Sử dụng các bài kiểm tra và công cụ chuẩn hóa để thu thập thông tin về nhận thức, tính cách, cảm xúc và hành vi. Buổi 60 phút làm việc trực tiếp với therapist — họ chọn bài test phù hợp, kết luận ngay trong buổi và gửi báo cáo PDF chi tiết qua email trong 7–10 ngày.'),
  (3, 'Tham vấn cặp đôi', 'Cùng nhau xây dựng mối quan hệ tốt đẹp hơn và làm rõ các vấn đề về giao tiếp, cách thể hiện cảm xúc. Buổi đầu khám phá nhu cầu riêng của mỗi người (30 phút/người), các buổi sau cả hai tham gia cùng nhau (90 phút). Có thể sắp xếp buổi riêng khi cần.'),
  (4, 'Art Therapy', 'Dùng công cụ nghệ thuật để khám phá và chữa lành cảm xúc — dành cho những ai muốn thể hiện bản thân theo cách không chỉ bằng lời nói. 60 phút mỗi buổi, có nhiều lựa chọn tiếp cận.'),
  (5, 'Hướng nghiệp', 'Làm test năng lực + trò chuyện với therapist về định hướng. Gói Cơ bản (2 buổi) gồm test và tư vấn kết quả; gói Chuyên sâu (3 buổi) có thêm buổi lên kế hoạch thực hiện định hướng.');

insert into therapists (sort_order, name, title, specialties, therapies, price, location, photo_url) values
  (1, 'ThS. Hà Trang', 'Thạc sĩ Tâm lý Lâm sàng · ĐH Xã hội Nga', 'PTSD, ADHD & LGBTQI+', 'CBT · ACT · Neurodiversity · AOP', '650K', 'Online · offline SG', null),
  (2, 'ThS. Ngọc Mai', 'Thạc sĩ Tâm lý Lâm sàng', 'Tổn thương thời thơ ấu, khủng hoảng hiện sinh, lòng tự trọng thấp, rối loạn cảm xúc, vấn đề gắn bó & mối quan hệ', 'Person-Centered · CBT · MiCBT · IFS', '650K', 'Online · offline HN', null),
  (3, 'ThS. Thu Thuỷ', 'Thạc sĩ Tâm lý', 'Thân chủ 20–35: mối quan hệ, childhood trauma, attachment styles, lo âu, stress, trầm cảm. Couple therapy', 'CBT · SFBT · Psychodynamic · Mindfulness', '650K', 'Chỉ online', null),
  (4, 'ThS. Ly Đinh', 'Thạc sĩ Tâm lý', 'PTSD/C-PTSD, đau buồn & mất mát, trải nghiệm tuổi thơ bất lợi, trầm cảm, lo âu', 'CBT · CPT · Person-Centered · ACT · DBT', '650K', 'Chỉ online', null),
  (5, 'ThS. Phương An', 'Thạc sĩ Lâm sàng · ĐH Sussex, Anh', 'Tâm lý học trường học, stress, hướng dẫn hành vi. Chuyên viên tâm lý học đường', 'CBT · MI · MBCT', '650K', 'Online · offline HN', null),
  (6, 'ThS. Kim Ngân', '7 năm kinh nghiệm trị liệu', 'ADHD, sang chấn, rối loạn cảm xúc (lo âu, trầm cảm, lưỡng cực), giá trị bản thân, ranh giới', 'CBT · EFT', '650K', 'Online · offline HN', null),
  (7, 'ThS. Gia Bảo', 'ThS Lâm sàng trẻ em & VTN · ĐHQG HN', 'Trầm cảm, lo âu, OCD, PTSD, rối loạn nhân cách ranh giới', 'CBT · DBT · BA', '650K', 'Online · offline HN', null),
  (8, 'ThS. Mai Nguyen', 'Thạc sĩ Tâm lý', 'Vấn đề mối quan hệ (tình yêu, hôn nhân, gia đình, xã hội). Couple Hàn–Việt bằng tiếng Hàn', 'Psychoanalytic · Client-centered · Gestalt', '650K', 'Chỉ online', null),
  (9, 'ThS. Minh Châu', 'Thạc sĩ Tâm lý', 'Lo âu, trầm cảm, đau buồn – tang chế, khó khăn về mối quan hệ gắn bó', 'Psychoanalysis · Adlerian · Mindfulness · Art', '750K', 'Online · offline HCM', null),
  (10, 'ThS. Đức Minh', 'Trị liệu & Tư vấn · ĐH Western Sydney', 'Thân chủ 18–35: lo âu, trầm cảm, PTSD/C-PTSD, sang chấn liên thế hệ, tổn thương gắn bó. Hỗ trợ ASD, ADHD', 'Person-Centered · IFS · EFIT · MI', '650K', 'Online · offline HCM', null),
  (11, 'ThS. Quỳnh Trang', 'ThS Lâm sàng · ĐHQG HN', 'Thân chủ 10–30: trầm cảm, lo âu, OCD, ám sợ xã hội, PTSD. Couple tuổi trẻ', 'CBT & các kỹ thuật lâm sàng', '600K', 'Online · offline HN', null),
  (12, 'Vi Vương', 'PG Dip Tâm lý · ĐH Wrexham (Anh)', 'Tâm lý ung thư học, khủng hoảng tâm lý, bản sắc & ý nghĩa sống. 4 ngôn ngữ: Việt–Anh–Quan Thoại–Quảng Đông', 'ACT · DBT', '600K', 'Online · offline HCM', null);
