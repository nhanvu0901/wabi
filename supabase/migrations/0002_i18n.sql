-- Song ngữ VI/EN cho nội dung động.
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

update therapists as x set
  title          = v.title,
  title_en       = v.title_en,
  specialties    = v.specialties,
  specialties_en = v.specialties_en,
  therapies      = v.therapies,
  therapies_en   = v.therapies_en,
  location       = v.location,
  location_en    = v.location_en
from (values
  ('ThS. Hà Trang', 'Thạc sĩ Tâm lý Lâm sàng · ĐH Xã hội Nga', 'MSc Clinical Psychology · Russian State Social Univ.', 'PTSD, ADHD & cộng đồng LGBTQI+', 'PTSD, ADHD & the LGBTQI+ community', 'CBT · ACT · Neurodiversity · AOP', null, 'Online · offline SG', 'Online · in-person HCMC'),
  ('ThS. Ngọc Mai', 'Thạc sĩ Tâm lý Lâm sàng', 'MSc Clinical Psychology', 'Tổn thương thời thơ ấu, khủng hoảng hiện sinh, lòng tự trọng thấp, rối loạn cảm xúc, vấn đề gắn bó & mối quan hệ', 'Childhood trauma, existential crisis, low self-esteem, mood disorders, attachment & relationship issues', 'Person-Centered · CBT · MiCBT · IFS', null, 'Online · offline HN', 'Online · in-person Hanoi'),
  ('ThS. Thu Thuỷ', 'Thạc sĩ Tâm lý', 'MSc Psychology', 'Thân chủ 20–35: mối quan hệ, sang chấn tuổi thơ, kiểu gắn bó, lo âu, stress, trầm cảm. Trị liệu cặp đôi', 'Clients 20–35: relationships, childhood trauma, attachment styles, anxiety, stress, depression. Couple therapy', 'CBT · SFBT · Psychodynamic · Mindfulness', null, 'Chỉ online', 'Online only'),
  ('ThS. Ly Đinh', 'Thạc sĩ Tâm lý', 'MSc Psychology', 'PTSD/C-PTSD, đau buồn & mất mát, trải nghiệm tuổi thơ bất lợi, trầm cảm, lo âu', 'PTSD/C-PTSD, grief & loss, adverse childhood experiences, depression, anxiety', 'CBT · CPT · Person-Centered · ACT · DBT', null, 'Chỉ online', 'Online only'),
  ('ThS. Phương An', 'Thạc sĩ Lâm sàng · ĐH Sussex, Anh', 'MSc Clinical · Univ. of Sussex, UK', 'Tâm lý học đường, stress, hướng dẫn hành vi. Chuyên viên tâm lý học đường', 'School psychology, stress, behavioral guidance. School psychology specialist', 'CBT · MI · MBCT', null, 'Online · offline HN', 'Online · in-person Hanoi'),
  ('ThS. Kim Ngân', '7 năm kinh nghiệm trị liệu', '7 years of therapy experience', 'ADHD, sang chấn, rối loạn cảm xúc (lo âu, trầm cảm, lưỡng cực), giá trị bản thân, ranh giới', 'ADHD, trauma, mood disorders (anxiety, depression, bipolar), self-worth, boundaries', 'CBT · EFT', null, 'Online · offline HN', 'Online · in-person Hanoi'),
  ('ThS. Gia Bảo', 'ThS Lâm sàng trẻ em & VTN · ĐHQG HN', 'MSc Child & Adolescent Clinical · VNU Hanoi', 'Trầm cảm, lo âu, OCD, PTSD, rối loạn nhân cách ranh giới', 'Depression, anxiety, OCD, PTSD, borderline personality disorder', 'CBT · DBT · BA', null, 'Online · offline HN', 'Online · in-person Hanoi'),
  ('ThS. Mai Nguyen', 'Thạc sĩ Tâm lý', 'MSc Psychology', 'Vấn đề mối quan hệ (tình yêu, hôn nhân, gia đình, xã hội). Cặp đôi Hàn–Việt bằng tiếng Hàn', 'Relationship issues (love, marriage, family, social). Korean–Viet couples in Korean', 'Psychoanalytic · Client-centered · Gestalt', null, 'Chỉ online', 'Online only'),
  ('ThS. Minh Châu', 'Thạc sĩ Tâm lý', 'MSc Psychology', 'Lo âu, trầm cảm, đau buồn – tang chế, khó khăn về mối quan hệ gắn bó', 'Anxiety, depression, grief & bereavement, attachment-relationship difficulties', 'Psychoanalysis · Adlerian · Mindfulness · Art', null, 'Online · offline HCM', 'Online · in-person HCMC'),
  ('ThS. Đức Minh', 'Trị liệu & Tư vấn · ĐH Western Sydney', 'Therapy & Counseling · Western Sydney Univ.', 'Thân chủ 18–35: lo âu, trầm cảm, PTSD/C-PTSD, sang chấn liên thế hệ, tổn thương gắn bó. Hỗ trợ ASD, ADHD', 'Clients 18–35: anxiety, depression, PTSD/C-PTSD, intergenerational trauma, attachment wounds. ASD, ADHD support', 'Person-Centered · IFS · EFIT · MI', null, 'Online · offline HCM', 'Online · in-person HCMC'),
  ('ThS. Quỳnh Trang', 'ThS Lâm sàng · ĐHQG HN', 'MSc Clinical · VNU Hanoi', 'Thân chủ 10–30: trầm cảm, lo âu, OCD, ám sợ xã hội, PTSD. Cặp đôi tuổi trẻ', 'Clients 10–30: depression, anxiety, OCD, social phobia, PTSD. Young couples', 'CBT & các kỹ thuật lâm sàng', 'CBT & clinical techniques', 'Online · offline HN', 'Online · in-person Hanoi'),
  ('Vi Vương', 'PG Dip Tâm lý · ĐH Wrexham (Anh)', 'PG Dip Psychology · Wrexham Univ. (UK)', 'Tâm lý ung thư học, khủng hoảng tâm lý, bản sắc & ý nghĩa sống. 4 ngôn ngữ: Việt–Anh–Quan Thoại–Quảng Đông', 'Psycho-oncology, psychological crisis, identity & meaning. 4 languages: Viet–Eng–Mandarin–Cantonese', 'ACT · DBT', null, 'Online · offline HCM', 'Online · in-person HCMC')
) as v(name, title, title_en, specialties, specialties_en, therapies, therapies_en, location, location_en)
where x.name = v.name;

-- 5 dịch vụ ------------------------------------------------------------------

update services as x set
  name_en        = v.name_en,
  description_en = v.description_en
from (values
  (1, 'Counseling & Psychotherapy', 'An ongoing process to address psychological difficulties, improve mental wellbeing and support personal growth, through dialogue and specialized techniques. Suited to questions of self (personal development, self-esteem, attachment style) and clinical conditions.'),
  (2, 'Psychological Assessment', 'Using standardized tests and tools to gather information about cognition, personality, emotion and behavior. A 60-minute session working directly with a therapist — they choose suitable tests, conclude within the session, and send a detailed PDF report by email within 7–10 days.'),
  (3, 'Couple Counseling', 'Build a better relationship together and clarify issues around communication and expressing emotion. The first session explores each person''s needs (30 min/person); later sessions are joint (90 min). Individual sessions can be arranged when needed.'),
  (4, 'Art Therapy', 'Using art tools to explore and heal emotions — for those who want to express themselves in more than words. 60 minutes per session, with several approaches to choose from.'),
  (5, 'Career Counseling', 'Take an aptitude test + talk with a therapist about direction. The Basic package (2 sessions) covers testing and results consultation; the In-depth package (3 sessions) adds a session to plan out your direction.')
) as v(sort_order, name_en, description_en)
where x.sort_order = v.sort_order;
