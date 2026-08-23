import Rich from './Rich'
import { t, type Lang } from '../lib/i18n'
import { pickServiceDescription, pickServiceName, type Service } from '../lib/types'

type Chip = { text: string; key?: boolean }

const SERVICE_EXTRAS: Record<number, { pill: string; pillKey?: boolean; tags: Chip[] }> = {
  1: {
    pill: 'Counseling / Psychotherapy',
    tags: [
      { text: 'Trầm cảm · Lo âu' },
      { text: 'ADHD · BPD · PTSD' },
      { text: 'Attachment styles' },
      { text: 'Childhood trauma' },
      { text: 'sv1.tag', key: true },
    ],
  },
  2: {
    pill: 'Psychological Assessment',
    tags: [
      { text: 'sv2.tag1', key: true },
      { text: 'sv2.tag2', key: true },
      { text: 'sv2.tag3', key: true },
      { text: 'sv2.tag4', key: true },
    ],
  },
  3: {
    pill: 'Couple Therapy',
    tags: [
      { text: 'sv3.tag1', key: true },
      { text: 'sv3.tag2', key: true },
      { text: 'sv3.tag3', key: true },
    ],
  },
  4: {
    pill: 'sv4.badge',
    pillKey: true,
    tags: [{ text: 'Art as Therapy' }, { text: 'sv4.tag', key: true }],
  },
  5: {
    pill: 'Career Counseling',
    tags: [
      { text: 'sv5.tag1', key: true },
      { text: 'sv5.tag2', key: true },
      { text: 'sv5.tag3', key: true },
    ],
  },
}

const RICH_DESCRIPTION: Record<number, string> = { 2: 'sv2.b', 5: 'sv5.b' }
const stripTags = (value: string) => value.replace(/<[^>]*>/g, '')

export default function ServiceDirectory({ services, lang }: { services: Service[]; lang: Lang }) {
  const tr = t(lang)

  return (
    <div className="inner-service-list">
      {services.map((service) => {
        const extra = SERVICE_EXTRAS[service.sort_order] ?? { pill: '', tags: [] }
        const description = pickServiceDescription(service, lang)
        const richKey = RICH_DESCRIPTION[service.sort_order]
        const richValue = richKey ? tr(richKey) : null
        const useRich = richValue != null && stripTags(richValue) === description

        return (
          <article
            className={`inner-service-card inner-service-card--${service.sort_order} wabi-lift`}
            key={service.id}
          >
            <div className="inner-service-card__number">
              {String(service.sort_order).padStart(2, '0')}
            </div>
            <div className="inner-service-card__content">
              <h2>{pickServiceName(service, lang)}</h2>
              {extra.pill && (
                <div className="inner-service-card__badge">
                  {extra.pillKey ? tr(extra.pill) : extra.pill}
                </div>
              )}
              {useRich ? (
                <Rich as="p" html={richValue} className="inner-service-card__copy" />
              ) : (
                <p className="inner-service-card__copy">{description}</p>
              )}
              <div className="inner-service-card__tags">
                {extra.tags.map((tag) => (
                  <span key={tag.text}>{tag.key ? tr(tag.text) : tag.text}</span>
                ))}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
