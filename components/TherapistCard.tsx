import { MapPin } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder'
import type { Therapist } from '../lib/types'

// Ports the card template inside buildTeam() (Wabi Therapy.dc.html ~L520-537)
// verbatim: photo circle, name/title, Chuyên môn/Liệu pháp lines, location
// pill (map-pin icon) + price pill.
export default function TherapistCard({ t }: { t: Therapist }) {
  return (
    <div
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
          {t.photo_url ? (
            <img src={t.photo_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImagePlaceholder label="Ảnh" />
          )}
        </div>
        <div>
          <h4 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.28rem', lineHeight: 1.15 }}>
            {t.name}
          </h4>
          <div style={{ fontSize: '.8rem', color: '#8A8072', marginTop: '3px' }}>{t.title}</div>
        </div>
      </div>
      <div style={{ fontSize: '.9rem', color: '#6B6459', marginBottom: '12px' }}>
        <b style={{ color: '#33302A', fontWeight: 500 }}>Chuyên môn:</b> {t.specialties}
      </div>
      <div style={{ fontSize: '.9rem', color: '#6B6459', marginBottom: '16px' }}>
        <b style={{ color: '#33302A', fontWeight: 500 }}>Liệu pháp:</b> {t.therapies}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
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
          }}
        >
          <MapPin style={{ width: '13px', height: '13px' }} />
          {t.location}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            background: '#E7EADD',
            color: 'var(--accent-deep,#434D35)',
            fontWeight: 500,
            padding: '5px 12px',
            borderRadius: '100px',
          }}
        >
          {t.price}/buổi
        </span>
      </div>
    </div>
  )
}
