'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dich-vu', label: 'Dịch vụ' },
  { href: '/doi-ngu', label: 'Đội ngũ Therapist' },
  { href: '/lien-he', label: 'Contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        background: 'rgba(247,242,233,.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid #E7DECE',
      }}
    >
      <div
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          padding: '0 clamp(20px,5vw,40px)',
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer', color: '#33302A' }}
        >
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#B67A5E', boxShadow: '0 0 0 5px #EEDFD3' }}></span>
          <span style={{ fontFamily: "'Newsreader',serif", fontSize: '1.55rem', letterSpacing: '-.01em', lineHeight: 1 }}>
            Wabi <span style={{ fontStyle: 'italic', color: '#8A8072', fontSize: '.92em' }}>Therapy</span>
          </span>
        </Link>
        <nav className={open ? 'wnav-links open' : 'wnav-links'} id="wmenu" style={{ alignItems: 'center', gap: '4px' }}>
          {LINKS.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  fontSize: '.92rem',
                  padding: '9px 16px',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  transition: '.2s',
                  background: active ? 'var(--accent,#5A6647)' : 'transparent',
                  color: active ? '#FCFAF4' : '#6B6459',
                }}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
        <button
          className="wburger"
          onClick={() => setOpen((o) => !o)}
          aria-label="Mở menu"
          aria-expanded={open}
          style={{
            background: 'transparent',
            border: '1px solid #E2D8C6',
            borderRadius: '12px',
            width: '44px',
            height: '44px',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#33302A',
          }}
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  )
}
