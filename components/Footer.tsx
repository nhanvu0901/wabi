import { type Lang, t } from '../lib/i18n'

export default function Footer({ lang }: { lang: Lang }) {
  const tr = t(lang)

  return (
    <footer className="wabi-footer">
      <div className="wabi-footer__watermark" aria-hidden="true">Wabi Therapy</div>
      <div className="wabi-footer__top">
        <div className="wabi-footer__about">
          <div className="wabi-footer__brand">
            <span className="wabi-pulse" />
            <span>Wabi <em>Therapy</em></span>
          </div>
          <p>{tr('foot.tag')}</p>
        </div>
        <div className="wabi-footer__socials">
          <a href="https://www.instagram.com/wabi.therapy/" target="_blank" rel="noopener" aria-label="Instagram">
            <i className="fa-brands fa-instagram" aria-hidden="true" />
          </a>
          <a href="https://www.facebook.com/profile.php?id=61556380754645" target="_blank" rel="noopener" aria-label="Facebook">
            <i className="fa-brands fa-facebook" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="wabi-footer__copy">{tr('foot.copy')}</div>
    </footer>
  )
}
