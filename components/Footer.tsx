export default function Footer() {
  return (
    <footer style={{ background: '#EFE7D8', borderTop: '1px solid #E2D8C6', padding: 'clamp(40px,6vw,60px) 0 36px' }}>
      <div
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          padding: '0 clamp(20px,5vw,40px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '26px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '12px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#B67A5E', boxShadow: '0 0 0 5px #EAD9CB' }}></span>
            <span style={{ fontFamily: "'Newsreader',serif", fontSize: '1.4rem' }}>Wabi Therapy</span>
          </div>
          <p style={{ fontSize: '.92rem', color: '#6B6459' }}>Không gian an toàn, riêng tư và thấu cảm cho sức khỏe tinh thần của bạn.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a
            href="https://www.instagram.com/wabi.therapy/"
            target="_blank"
            rel="noopener"
            aria-label="Instagram"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid #DDD1BE',
              display: 'grid',
              placeItems: 'center',
              color: '#6B6459',
              background: '#FBF7EF',
            }}
          >
            <i className="fa-brands fa-instagram" style={{ fontSize: '1.15rem' }}></i>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61556380754645"
            target="_blank"
            rel="noopener"
            aria-label="Facebook"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid #DDD1BE',
              display: 'grid',
              placeItems: 'center',
              color: '#6B6459',
              background: '#FBF7EF',
            }}
          >
            <i className="fa-brands fa-facebook" style={{ fontSize: '1.15rem' }}></i>
          </a>
        </div>
      </div>
      <div
        style={{
          maxWidth: '1160px',
          margin: '28px auto 0',
          padding: '22px clamp(20px,5vw,40px) 0',
          borderTop: '1px solid #E2D8C6',
          fontSize: '.82rem',
          color: '#8A8072',
        }}
      >
        © 2026 Wabi Therapy · Tham vấn · Trị liệu · Đánh giá tâm lý
      </div>
    </footer>
  )
}
