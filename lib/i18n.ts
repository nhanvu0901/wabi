// Ported verbatim from the design's T() dictionary (Wabi_Therapy bundled design,
// ~L880-975). 96 keys. Values are byte-identical to the design apart from HTML
// entity decoding on the plain-text keys — the four keys listed in HTML_KEYS keep
// their inline markup and must be rendered with <Rich/>.
export const LANGS = ['vi', 'en'] as const
export type Lang = (typeof LANGS)[number]

export const DEFAULT_LANG: Lang = 'vi'

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v)
}

/** Keys whose values contain inline markup and must go through <Rich/>. */
export const HTML_KEYS = new Set(['hero.title', 'phil.body', 'sv2.b', 'sv5.b'])

export const DICT: Record<string, { vi: string; en: string }> = {
  "nav.home": { vi: "Home", en: "Home" },
  "nav.services": { vi: "Dịch vụ", en: "Services" },
  "nav.team": { vi: "Đội ngũ Therapist", en: "Our Therapists" },
  "nav.contact": { vi: "Contact", en: "Contact" },
  "nav.book": { vi: "Đặt lịch", en: "Book a session" },
  "hero.eyebrow": { vi: "Tham vấn · Trị liệu · Đánh giá tâm lý", en: "Counseling · Therapy · Assessment" },
  "hero.title": { vi: "Một khoảng lặng để bạn được <span style=\"font-style:italic;color:var(--accent-deep,#434D35)\">là chính mình.</span>", en: "A quiet space to simply <span style=\"font-style:italic;color:var(--accent-deep,#434D35)\">be yourself.</span>" },
  "hero.line1": { vi: "Một khoảng lặng", en: "A quiet space" },
  "hero.line2": { vi: "để bạn được", en: "to simply" },
  "hero.line3": { vi: "là chính mình.", en: "be yourself." },
  "hero.body": { vi: "Wabi là không gian an toàn, riêng tư và thấu cảm — nơi bạn bắt đầu hành trình chăm sóc sức khỏe tinh thần một cách nhẹ nhàng, đúng với chính mình. Online & offline tại Hà Nội và TP.HCM.", en: "Wabi is a safe, private and compassionate space — where you begin caring for your mental health gently, in a way that is true to you. Online & in person in Hanoi and Ho Chi Minh City." },
  "hero.cta1": { vi: "Liên hệ với tụi mình", en: "Get in touch" },
  "hero.cta2": { vi: "Khám phá dịch vụ", en: "Explore services" },
  "intro.eyebrow": { vi: "Wabi là gì?", en: "What is Wabi?" },
  "hero.scroll": { vi: "Cuộn xuống", en: "Scroll down" },
  "trust.1": { vi: "Thạc sĩ Tâm lý Lâm sàng", en: "Clinical Psychology Masters" },
  "trust.2": { vi: "Liệu pháp trị liệu", en: "Therapeutic approaches" },
  "trust.3": { vi: "Ngôn ngữ: Việt · Anh · Hàn · Trung", en: "Languages: VN · EN · KR · CN" },
  "trust.4num": { vi: "Linh hoạt", en: "Flexible" },
  "trust.4": { vi: "Không cọc · không ép số buổi", en: "No deposit · no session quota" },
  "why.eyebrow": { vi: "Vì sao chọn Wabi", en: "Why Wabi" },
  "why.title": { vi: "Ba điều bạn luôn được đảm bảo", en: "Three things you can always count on" },
  "why.c1.t": { vi: "An toàn & riêng tư", en: "Safe & private" },
  "why.c1.b": { vi: "Mọi chia sẻ của bạn được giữ kín tuyệt đối. Không phán xét, chỉ có lắng nghe và thấu hiểu.", en: "Everything you share is kept in strict confidence. No judgment — only listening and understanding." },
  "why.c2.t": { vi: "Chuyên môn sâu", en: "Deep expertise" },
  "why.c2.b": { vi: "Đội ngũ tốt nghiệp Thạc sĩ Tâm lý học Lâm sàng, đào tạo bài bản trong nước & quốc tế (Anh, Úc, Nga…).", en: "Our team holds Master's degrees in Clinical Psychology, trained both in Vietnam and abroad (UK, Australia, Russia…)." },
  "why.c3.t": { vi: "Đồng hành linh hoạt", en: "Flexible companionship" },
  "why.c3.b": { vi: "Không quy định số buổi cố định, không cọc trước. Bạn hẹn theo nhịp của mình — tuần, tháng, hay khi cần.", en: "No fixed number of sessions, no upfront deposit. You book at your own pace — weekly, monthly, or whenever you need." },
  "sp.eyebrow": { vi: "Dịch vụ", en: "Services" },
  "sp.title": { vi: "Chúng mình có thể đồng hành cùng bạn ở đâu?", en: "Where can we walk beside you?" },
  "sp.c1.t": { vi: "Tham vấn & Trị liệu", en: "Counseling & Therapy" },
  "sp.c1.b": { vi: "Cho các vấn đề về bản ngã, lòng tự trọng, gắn bó, và bệnh lý: trầm cảm, lo âu, ADHD, BPD, PTSD…", en: "For questions of self, self-esteem and attachment, and clinical conditions: depression, anxiety, ADHD, BPD, PTSD…" },
  "sp.c2.t": { vi: "Đánh giá tâm lý", en: "Psychological Assessment" },
  "sp.c2.b": { vi: "Buổi 60 phút cùng nhà tâm lý + báo cáo PDF chuyên sâu qua email trong 7–10 ngày.", en: "A 60-minute session with a psychologist + an in-depth PDF report by email within 7–10 days." },
  "sp.c3.t": { vi: "Cặp đôi · Hướng nghiệp · Cộng đồng", en: "Couples · Careers · Community" },
  "sp.c3.b": { vi: "Tham vấn cặp đôi, hướng nghiệp, hỗ trợ chi phí, chương trình doanh nghiệp và các không gian học hỏi — kết nối.", en: "Couples counseling, career guidance, low-cost support, workplace programs, and spaces to learn and connect." },
  "phil.eyebrow": { vi: "Tinh thần Wabi", en: "The Wabi spirit" },
  "phil.body": { vi: "Mỗi vết thương tâm hồn đều xứng đáng được <span style=\"font-style:italic;color:var(--accent-deep,#434D35)\">lắng nghe và chăm sóc.</span> Wabi có những nhà trị liệu sẵn sàng ở đây, đi cùng bạn nhẹ nhàng từng bước.", en: "Every wound of the heart deserves to be <span style=\"font-style:italic;color:var(--accent-deep,#434D35)\">heard and cared for.</span> Wabi has therapists ready to be here, walking gently beside you, step by step." },
  "tg.eyebrow": { vi: "Đội ngũ", en: "Our team" },
  "tg.title": { vi: "Những người sẽ đồng hành cùng bạn", en: "The people who will walk beside you" },
  "tg.viewall": { vi: "Xem tất cả therapist", en: "See all therapists" },
  "tg.r1": { vi: "Thạc sĩ Tâm lý Lâm sàng", en: "MSc Clinical Psychology" },
  "tg.r2": { vi: "Thạc sĩ Tâm lý Lâm sàng · ĐH Xã hội Nga", en: "MSc Clinical Psychology · Russian State Social Univ." },
  "tg.r3": { vi: "Thạc sĩ Tâm lý", en: "MSc Psychology" },
  "tg.r4": { vi: "Trị liệu & Tư vấn · ĐH Western Sydney", en: "Therapy & Counseling · Western Sydney Univ." },
  "cta.title": { vi: "Bạn không cần phải chờ đến khi “đủ tệ”.", en: "You don't have to wait until things feel “bad enough.”" },
  "cta.body": { vi: "Hãy đi therapy khi bạn sẵn sàng. Nhắn cho tụi mình bất cứ khi nào bạn muốn bắt đầu.", en: "Come to therapy when you are ready. Message us whenever you would like to begin." },
  "cta.btn": { vi: "Bắt đầu ngay", en: "Start now" },
  "sv.title": { vi: "Chọn hình thức phù hợp với bạn", en: "Choose what fits you" },
  "sv.titleLead": { vi: "Chọn hình thức", en: "Choose what" },
  "sv.titleAccent": { vi: "phù hợp với bạn", en: "fits you" },
  "sv.intro": { vi: "Online qua Google Meet hoặc trực tiếp tại địa điểm của therapist (HN & TP.HCM). Một buổi khoảng 60 phút. Không quy định số buổi cố định.", en: "Online via Google Meet, or in person at your therapist's location (Hanoi & HCMC). Each session is about 60 minutes. No fixed number of sessions." },
  "sv1.t": { vi: "Tham vấn & Trị liệu tâm lý", en: "Counseling & Psychotherapy" },
  "sv1.b": { vi: "Quá trình điều trị liên tục nhằm giải quyết vấn đề tâm lý, cải thiện sức khỏe tinh thần và phát triển cá nhân, thông qua đối thoại và các kỹ thuật chuyên biệt. Phù hợp cho vấn đề về bản ngã (phát triển bản thân, lòng tự trọng, phong cách gắn bó) và các bệnh lý.", en: "An ongoing process to address psychological difficulties, improve mental wellbeing and support personal growth, through dialogue and specialized techniques. Suited to questions of self (personal development, self-esteem, attachment style) and clinical conditions." },
  "sv1.tag": { vi: "Lòng tự trọng", en: "Self-esteem" },
  "sv2.t": { vi: "Đánh giá tâm lý", en: "Psychological Assessment" },
  "sv2.b": { vi: "Sử dụng các bài kiểm tra và công cụ chuẩn hóa để thu thập thông tin về nhận thức, tính cách, cảm xúc và hành vi. Buổi 60 phút làm việc trực tiếp với therapist — họ chọn bài test phù hợp, kết luận ngay trong buổi và gửi báo cáo PDF chi tiết qua email trong <b style=\"color:#33302A;font-weight:500\">7–10 ngày</b>.", en: "Using standardized tests and tools to gather information about cognition, personality, emotion and behavior. A 60-minute session working directly with a therapist — they choose suitable tests, conclude within the session, and send a detailed PDF report by email within <b style=\"color:#33302A;font-weight:500\">7–10 days</b>." },
  "sv2.tag1": { vi: "Test nhân cách Big5", en: "Big Five personality test" },
  "sv2.tag2": { vi: "Đa trí thông minh", en: "Multiple intelligences" },
  "sv2.tag3": { vi: "Lòng tự trọng (Sorensen)", en: "Self-esteem (Sorensen)" },
  "sv2.tag4": { vi: "Cảm nhận hạnh phúc (Ryff)", en: "Wellbeing (Ryff)" },
  "sv3.t": { vi: "Tham vấn cặp đôi", en: "Couple Counseling" },
  "sv3.b": { vi: "Cùng nhau xây dựng mối quan hệ tốt đẹp hơn và làm rõ các vấn đề về giao tiếp, cách thể hiện cảm xúc. Buổi đầu khám phá nhu cầu riêng của mỗi người (30 phút/người), các buổi sau cả hai tham gia cùng nhau (90 phút). Có thể sắp xếp buổi riêng khi cần.", en: "Build a better relationship together and clarify issues around communication and expressing emotion. The first session explores each person's needs (30 min/person); later sessions are joint (90 min). Individual sessions can be arranged when needed." },
  "sv3.tag1": { vi: "Đánh giá mối quan hệ", en: "Relationship assessment" },
  "sv3.tag2": { vi: "Chuẩn bị làm cha mẹ", en: "Preparing for parenthood" },
  "sv3.tag3": { vi: "Couple Hàn–Việt (tiếng Hàn)", en: "Korean–Viet couples (in Korean)" },
  "sv5.t": { vi: "Hướng nghiệp", en: "Career Counseling" },
  "sv5.b": { vi: "Làm test năng lực + trò chuyện với therapist về định hướng. Gói <b style=\"color:#33302A;font-weight:500\">Cơ bản</b> (2 buổi) gồm test và tư vấn kết quả; gói <b style=\"color:#33302A;font-weight:500\">Chuyên sâu</b> (3 buổi) có thêm buổi lên kế hoạch thực hiện định hướng.", en: "Take an aptitude test + talk with a therapist about direction. The <b style=\"color:#33302A;font-weight:500\">Basic</b> package (2 sessions) covers testing and results consultation; the <b style=\"color:#33302A;font-weight:500\">In-depth</b> package (3 sessions) adds a session to plan out your direction." },
  "sv5.tag1": { vi: "Test đa trí thông minh", en: "Multiple-intelligences test" },
  "sv5.tag2": { vi: "Định hướng nghề", en: "Career direction" },
  "sv5.tag3": { vi: "Lập kế hoạch", en: "Action planning" },
  "sv.cta": { vi: "Gặp đội ngũ therapist", en: "Meet the therapist team" },
  "tm.eyebrow": { vi: "Đội ngũ Therapist", en: "Our Therapists" },
  "tm.title": { vi: "Những người sẽ đồng hành cùng bạn", en: "The people who will walk beside you" },
  "tm.titleLead": { vi: "Những người sẽ đồng hành", en: "The people who will walk" },
  "tm.titleAccent": { vi: "cùng bạn", en: "beside you" },
  "tm.intro": { vi: "Mỗi therapist có chuyên môn, liệu pháp và mức phí riêng. Chia sẻ với admin về tuổi, nơi sống và vấn đề bạn gặp — tụi mình sẽ tư vấn người phù hợp nhất. Bạn hoàn toàn có thể đổi therapist nếu thấy cần.", en: "Each therapist has their own expertise, approaches and fees. Tell our admin your age, where you live and what you are going through — we will suggest the best fit. You are always free to change therapist if you feel you need to." },
  "tm.filterLabel": { vi: "Hình thức", en: "Format" },
  "tm.filterAll": { vi: "Tất cả", en: "All" },
  "tm.filterOnline": { vi: "Online", en: "Online" },
  "tm.filterHn": { vi: "Offline Hà Nội", en: "In person Hanoi" },
  "tm.filterHcm": { vi: "Offline TP.HCM", en: "In person HCMC" },
  "tm.countOne": { vi: "therapist", en: "therapist" },
  "tm.countMany": { vi: "therapist", en: "therapists" },
  "tm.foot": { vi: "…và nhiều chuyên viên khác. Nhắn admin để nhận danh sách đầy đủ phù hợp với nhu cầu của bạn.", en: "…and many more specialists. Message admin for the full list matched to your needs." },
  "tm.cta": { vi: "Nhờ tư vấn chọn therapist", en: "Ask us to help choose a therapist" },
  "ct.eyebrow": { vi: "Contact", en: "Contact" },
  "ct.title": { vi: "Hãy nhắn cho tụi mình khi bạn sẵn sàng", en: "Message us when you are ready" },
  "ct.titleLead": { vi: "Hãy nhắn cho tụi mình", en: "Message us" },
  "ct.titleAccent": { vi: "khi bạn sẵn sàng", en: "when you are ready" },
  "ct.intro": { vi: "Cứ thoải mái suy nghĩ. Bao giờ muốn lên lịch, chỉ cần nhắn — admin sẽ sắp xếp giúp bạn sớm nhất. Nếu có câu hỏi ngoài tham vấn hay tình huống cần giúp đỡ, cũng cứ nhắn nhé.", en: "Take all the time you need. Whenever you would like to arrange a session, just message — admin will help set it up as soon as possible. If you have questions beyond counseling, or a situation you need help with, message us too." },
  "ct.connect.t": { vi: "Kết nối với Wabi", en: "Connect with Wabi" },
  "ct.connect.b": { vi: "Chia sẻ một chút về tuổi, nơi sống và điều bạn đang gặp phải — tụi mình sẽ tư vấn therapist & dịch vụ phù hợp.", en: "Share a little about your age, where you live and what you are facing — we will suggest a therapist & service that fit." },
  "ct.f.name": { vi: "Họ tên", en: "Full name" },
  "ct.f.contact": { vi: "Email hoặc số điện thoại", en: "Email or phone number" },
  "ct.f.msg": { vi: "Bạn muốn chia sẻ điều gì?", en: "What would you like to share?" },
  "ct.f.btn": { vi: "Gửi lời nhắn", en: "Send message" },
  "ct.f.sending": { vi: "Đang gửi", en: "Sending" },
  "ct.f.note": { vi: "Tụi mình sẽ phản hồi qua thông tin bạn để lại. Mọi chia sẻ đều được giữ kín.", en: "We will reply via the details you leave. Everything you share is kept private." },
  "ct.ok.t": { vi: "Cảm ơn bạn đã nhắn.", en: "Thank you for your message." },
  "ct.ok.b": { vi: "Tụi mình đã nhận lời nhắn của bạn và sẽ phản hồi sớm nhất. Cứ thở nhẹ nhàng nhé.", en: "We have received your message and will reply as soon as we can. Breathe easy." },
  "ct.hot.tag": { vi: "Cần hỗ trợ khẩn cấp?", en: "Need urgent support?" },
  "ct.hot.t": { vi: "Đường dây nóng", en: "Hotlines" },
  "ct.hot.b": { vi: "Nếu bạn đang trong khủng hoảng, hãy liên hệ ngay các đường dây dưới đây — luôn có người sẵn sàng lắng nghe.", en: "If you are in crisis, reach out to the lines below right away — someone is always ready to listen." },
  "ct.hl1": { vi: "Đường dây nóng Ngày Mai", en: "Ngay Mai Hotline" },
  "ct.hl2": { vi: "Tổng đài Bảo vệ Trẻ em Quốc gia", en: "National Child Protection Hotline" },
  "ct.hl3": { vi: "Hội Tâm lý Trị liệu Việt Nam", en: "Vietnam Psychotherapy Association" },
  "ct.hl4": { vi: "Ngôi nhà Bình yên (PN & trẻ em)", en: "Peace House (women & children)" },
  "ct.hl5": { vi: "Bệnh viện Việt Pháp (Hà Nội)", en: "Vietnam–France Hospital (Hanoi)" },
  "foot.tag": { vi: "Không gian an toàn, riêng tư và thấu cảm cho sức khỏe tinh thần của bạn.", en: "A safe, private and compassionate space for your mental health." },
  "foot.copy": { vi: "© 2026 Wabi Therapy · Tham vấn · Trị liệu · Đánh giá tâm lý", en: "© 2026 Wabi Therapy · Counseling · Therapy · Assessment" },
  "chat.status": { vi: "Thường trả lời trong ít phút", en: "Usually replies in a few minutes" },

  // Chatbox strings. Greeting, chips and placeholder are ported from the design's
  // chatScript(); the design's five canned answers are gone — replies now stream
  // from the model, so only the opening state and the failure line live here.
  "chat.greeting": {
    vi: "Xin chào, mình là trợ lý của Wabi. Mình có thể giúp bạn tìm hiểu về dịch vụ, chọn therapist hay cách bắt đầu. Bạn muốn hỏi điều gì?",
    en: "Hi, I'm Wabi's assistant. I can help you learn about our services, choose a therapist, or how to begin. What would you like to ask?",
  },
  "chat.chip1": { vi: "Các dịch vụ", en: "Our services" },
  "chat.chip2": { vi: "Chọn therapist", en: "Choosing a therapist" },
  "chat.chip3": { vi: "Chi phí & cách bắt đầu", en: "Fees & getting started" },
  "chat.chip4": { vi: "Nhắn admin", en: "Message admin" },
  "chat.placeholder": { vi: "Nhắn cho Wabi…", en: "Message Wabi…" },
  "chat.err": {
    vi: "Xin lỗi, mình chưa trả lời được ngay. Bạn thử lại giúp mình, hoặc nhắn admin qua Instagram / Facebook nhé.",
    en: "Sorry, I could not reply just now. Please try again, or message admin on Instagram / Facebook.",
  },
  "chat.open": { vi: "Mở khung chat", en: "Open chat" },
  "chat.close": { vi: "Đóng khung chat", en: "Close chat" },
  "chat.send": { vi: "Gửi", en: "Send" },
  "chat.replying": { vi: "Đang trả lời", en: "Replying" },

  // Therapist-card labels. Not part of the design's T() table — they live inline
  // in buildTeam() as L.spec / L.ther / L.ses; same strings, moved here so every
  // translated string has one home.
  // Not in the design either: the form has no failure state there. Added when the
  // form became a real Supabase insert that can fail.
  "ct.f.err": {
    vi: "Gửi không thành công, vui lòng thử lại hoặc gọi hotline.",
    en: "Could not send. Please try again, or call one of the hotlines.",
  },

  "card.spec": { vi: "Chuyên môn:", en: "Focus:" },
  "card.ther": { vi: "Liệu pháp:", en: "Approaches:" },
  "card.ses": { vi: "/buổi", en: "/session" },
}

export const SITE_URL = 'https://wabi-therapy.vercel.app'

/**
 * Per-route canonical + hreflang set. Every page must call this with its own
 * path — inheriting the layout's alternates would canonicalise each page to the
 * homepage, which tells search engines the pages are duplicates.
 *
 * `path` is the route without the language prefix: '' for home, '/dich-vu', …
 */
export function langAlternates(lang: Lang, path: string) {
  return {
    canonical: `/${lang}${path}`,
    languages: {
      vi: `/vi${path}`,
      en: `/en${path}`,
      'x-default': `/${DEFAULT_LANG}${path}`,
    },
  }
}

export type TFn = (key: string) => string

/** Returns a lookup bound to one language. Unknown key returns the key itself. */
export function t(lang: Lang): TFn {
  return (key) => DICT[key]?.[lang] ?? key
}
