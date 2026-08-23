import { LifeBuoy, MapPin } from 'lucide-react'
import ContactForm from './ContactForm'
import { t, type Lang } from '../lib/i18n'

const HOTLINES = [
  { key: 'ct.hl1', number: '096 306 1414' },
  { key: 'ct.hl2', number: '111' },
  { key: 'ct.hl3', number: '1900 63 644' },
  { key: 'ct.hl4', number: '1900 96 96 80' },
  { key: 'ct.hl5', number: '024 3574 1111' },
]

export default function ContactPageContent({ lang }: { lang: Lang }) {
  const tr = t(lang)

  return (
    <main className="inner-page contact-page">
      <section className="contact-page__section">
        <div className="contact-page__shell">
          <header className="inner-page__hero contact-page__hero">
            <span className="inner-page__eyebrow">{tr('ct.eyebrow')}</span>
            <h1>
              {tr('ct.titleLead')} <em>{tr('ct.titleAccent')}</em>
            </h1>
            <p>{tr('ct.intro')}</p>
          </header>

          <div className="contact-page__grid">
            <section className="contact-connect-card">
              <div className="contact-connect-card__glow" aria-hidden="true" />
              <h2>{tr('ct.connect.t')}</h2>
              <p>{tr('ct.connect.b')}</p>
              <div className="contact-connect-card__links">
                <a href="https://www.instagram.com/wabi.therapy/" target="_blank" rel="noopener">
                  <i className="fa-brands fa-instagram" aria-hidden="true" />
                  <span><b>wabi.therapy</b><small>Instagram</small></span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61556380754645" target="_blank" rel="noopener">
                  <i className="fa-brands fa-facebook" aria-hidden="true" />
                  <span><b>Wabi Therapy</b><small>Facebook</small></span>
                </a>
                <div className="contact-connect-card__address">
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  <span><b>4 Ngõ 46A Phạm Ngọc Thạch</b><small>Onion Cafe · Hà Nội</small></span>
                </div>
              </div>
            </section>

            <section className="contact-form-card" aria-label={tr('ct.f.btn')}>
              <ContactForm lang={lang} />
            </section>
          </div>

          <section className="contact-hotlines">
            <div className="contact-hotlines__tag">
              <LifeBuoy aria-hidden="true" />
              <span>{tr('ct.hot.tag')}</span>
            </div>
            <h2>{tr('ct.hot.t')}</h2>
            <p>{tr('ct.hot.b')}</p>
            <div className="contact-hotlines__grid">
              {HOTLINES.map((hotline) => (
                <div key={hotline.key} className="contact-hotlines__row">
                  <span>{tr(hotline.key)}</span>
                  <b>{hotline.number}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="contact-map" aria-label="Onion Cafe · Hà Nội">
            <div className="contact-map__grid" aria-hidden="true" />
            <div className="contact-map__glow" aria-hidden="true" />
            <div className="contact-map__pin">
              <span><MapPin aria-hidden="true" /></span>
              <h2>Onion Cafe · Hà Nội</h2>
              <p>4 Ngõ 46A Phạm Ngọc Thạch</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
