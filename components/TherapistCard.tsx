import Image from 'next/image'
import { MapPin } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder'
import { t, type Lang } from '../lib/i18n'
import { pickTitle, pickSpecialties, pickTherapies, pickLocation, type Therapist } from '../lib/types'

// Ports the card template inside buildTeam() (bundled design ~L945-960) verbatim:
// photo circle, name/title, focus/approaches lines, location pill (map-pin icon)
// + price pill. Title, specialties and location come from the language-matched
// column; name, therapies and price are identical in both languages.
export default function TherapistCard({ t: therapist, lang }: { t: Therapist; lang: Lang }) {
  const tr = t(lang)
  return (
    <div
      className="wabi-lift"
      data-reveal
      style={{
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity .7s ease,transform .7s ease',
        background: '#FCFAF4',
        border: '1px solid #EAE0D0',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
        <div
          style={{
            width: '66px',
            height: '66px',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid #E7DECE',
          }}
        >
          {therapist.photo_url ? (
            // next/image rather than a bare <img>: the source portraits are up to
            // 2MB and this renders them at 66px, so Next resizes and re-encodes.
            <Image
              src={therapist.photo_url}
              alt={therapist.name}
              width={132}
              height={132}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImagePlaceholder label="Ảnh" />
          )}
        </div>
        <div>
          <h4 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.28rem', lineHeight: 1.15 }}>
            {therapist.name}
          </h4>
          <div style={{ fontSize: '.8rem', color: '#8A8072', marginTop: '3px' }}>{pickTitle(therapist, lang)}</div>
        </div>
      </div>
      <div style={{ fontSize: '.9rem', color: '#6B6459', marginBottom: '12px' }}>
        <b style={{ color: '#33302A', fontWeight: 500 }}>{tr('card.spec')}</b> {pickSpecialties(therapist, lang)}
      </div>
      <div style={{ fontSize: '.9rem', color: '#6B6459', marginBottom: '16px' }}>
        <b style={{ color: '#33302A', fontWeight: 500 }}>{tr('card.ther')}</b> {pickTherapies(therapist, lang)}
      </div>
      {/* Location left, price right — one row at any width. The design had
          flex-wrap:wrap here, which is fine in Vietnamese ("Online · offline SG",
          258px of 295px) but breaks in English ("Online · in-person HCMC" needs
          322px): the price pill dropped to a second line and the card grew from
          50px to 90px, so cards in the same row no longer matched.
          nowrap + a shrinkable location pill keeps the structure; the location
          text wraps inside its own pill when it runs out of room. */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '8px',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #EAE0D0',
          marginTop: 'auto',
          fontSize: '.82rem',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#F7F2E9',
            padding: '5px 12px',
            borderRadius: '100px',
            color: '#6B6459',
            minWidth: 0,
          }}
        >
          <MapPin style={{ width: '13px', height: '13px', flexShrink: 0 }} />
          <span style={{ minWidth: 0 }}>{pickLocation(therapist, lang)}</span>
        </span>
        <span
          style={{
            marginLeft: 'auto',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            background: '#E7EADD',
            color: 'var(--accent-deep,#434D35)',
            fontWeight: 500,
            padding: '5px 12px',
            borderRadius: '100px',
          }}
        >
          {therapist.price}
          {tr('card.ses')}
        </span>
      </div>
    </div>
  )
}
