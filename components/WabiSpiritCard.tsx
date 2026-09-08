import Image from 'next/image'
import type { Lang } from '../lib/i18n'

type Props = {
  lang: Lang
  title: string
}

export default function WabiSpiritCard({ lang, title }: Props) {
  return (
    <div className="wabi-spirit-card">
      <div className="wabi-spirit-card__media">
        <Image
          src="/images/tinh-than-wabi.jpg"
          alt={title}
          fill
          sizes="(max-width: 860px) 100vw, 560px"
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          priority
        />
        <div className="wabi-spirit-card__vignette" aria-hidden="true" />
      </div>

      <div className="wabi-spirit-card__content">
        <div className="wabi-spirit-card__top">
          <span className="wabi-spirit-card__eyebrow">
            <span className="wabi-spirit-card__spark" aria-hidden="true">✦</span>
            {title}
          </span>
        </div>

        <div className="wabi-spirit-card__bottom">
          <h3 className="wabi-spirit-card__quote">
            {lang === 'vi'
              ? 'Một khoảng lặng để lắng nghe chính mình'
              : 'A quiet moment to listen to yourself'}
          </h3>
          <p className="wabi-spirit-card__desc">
            {lang === 'vi'
              ? 'Trị liệu bắt đầu từ sự buông lỏng và cho phép bản thân được dừng lại.'
              : 'Healing begins with easing into stillness and allowing yourself to pause.'}
          </p>
        </div>
      </div>
    </div>
  )
}
