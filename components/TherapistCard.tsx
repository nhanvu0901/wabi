import Image from 'next/image'
import { MapPin } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder'
import { t, type Lang } from '../lib/i18n'
import { pickTitle, pickSpecialties, pickTherapies, pickLocation, type Therapist } from '../lib/types'

// Ports the card template inside buildTeam() (bundled design ~L945-960) verbatim:
// photo circle, name/title, focus/approaches lines, location pill (map-pin icon)
// + price pill. Title, specialties and location come from the language-matched
// column; name, therapies and price are identical in both languages.
export default function TherapistCard({
  t: therapist,
  lang,
  priority = false,
}: {
  t: Therapist
  lang: Lang
  priority?: boolean
}) {
  const tr = t(lang)
  const therapies = pickTherapies(therapist, lang)
    .split('·')
    .map((therapy) => therapy.trim())
    .filter(Boolean)

  return (
    <article className="inner-team-card wabi-lift">
      <div className="inner-team-card__header">
        <div className="inner-team-card__photo">
          {therapist.photo_url ? (
            <Image
              src={therapist.photo_url}
              alt={therapist.name}
              width={148}
              height={148}
              priority={priority}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImagePlaceholder label="Ảnh" />
          )}
        </div>
        <div className="inner-team-card__identity">
          <h2>{therapist.name}</h2>
          <p>{pickTitle(therapist, lang)}</p>
        </div>
      </div>

      <div className="inner-team-card__label">{tr('card.spec').replace(':', '')}</div>
      <p className="inner-team-card__specialties">{pickSpecialties(therapist, lang)}</p>

      <div className="inner-team-card__label">{tr('card.ther').replace(':', '')}</div>
      <div className="inner-team-card__therapies">
        {therapies.map((therapy) => (
          <span key={therapy}>{therapy}</span>
        ))}
      </div>

      <div className="inner-team-card__footer">
        <span className="inner-team-card__location">
          <MapPin aria-hidden="true" />
          <span>{pickLocation(therapist, lang)}</span>
        </span>
        <span className="inner-team-card__price">
          {therapist.price}{tr('card.ses')}
        </span>
      </div>
    </article>
  )
}
