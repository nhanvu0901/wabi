'use client'
import { useState, useTransition } from 'react'
import { Send, Check } from 'lucide-react'
import { submitContact } from '../lib/actions'
import { t, type Lang } from '../lib/i18n'

const FIELD: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  border: '1px solid #E2D8C6',
  borderRadius: '14px',
  background: '#F7F2E9',
  color: '#33302A',
  outline: 'none',
}

const LABEL: React.CSSProperties = { display: 'block', fontSize: '.86rem', fontWeight: 500, marginBottom: '7px' }

export default function ContactForm({ lang }: { lang: Lang }) {
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [pending, startTransition] = useTransition()
  const tr = t(lang)

  if (state === 'ok') {
    return (
      <div id="cform-ok" style={{ textAlign: 'center', padding: '24px 0' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#E7EADD',
            color: 'var(--accent-deep,#434D35)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 18px',
          }}
        >
          <Check style={{ width: '28px', height: '28px' }} />
        </div>
        <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.5rem', marginBottom: '8px' }}>
          {tr('ct.ok.t')}
        </h3>
        <p style={{ color: '#6B6459' }}>{tr('ct.ok.b')}</p>
      </div>
    )
  }

  return (
    <form
      id="cform"
      style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
      onSubmit={(e) => {
        e.preventDefault()
        if (pending) return
        const fd = new FormData(e.currentTarget)
        startTransition(async () => {
          // Catches a network failure reaching the server action, not just a
          // Supabase-side { ok: false } — both must surface the same error line.
          try {
            const res = await submitContact(fd)
            setState(res.ok ? 'ok' : 'error')
          } catch {
            setState('error')
          }
        })
      }}
    >
      <div>
        <label htmlFor="f-name" style={LABEL}>
          {tr('ct.f.name')}
        </label>
        <input id="f-name" name="name" type="text" required autoComplete="name" style={FIELD} />
      </div>
      <div>
        <label htmlFor="f-contact" style={LABEL}>
          {tr('ct.f.contact')}
        </label>
        <input id="f-contact" name="contact" type="text" required autoComplete="email" style={FIELD} />
      </div>
      <div>
        <label htmlFor="f-msg" style={LABEL}>
          {tr('ct.f.msg')}
        </label>
        <textarea id="f-msg" name="message" rows={4} style={{ ...FIELD, resize: 'vertical' }} />
      </div>
      <button
        type="submit"
        disabled={pending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '9px',
          padding: '15px 24px',
          borderRadius: '100px',
          fontWeight: 500,
          cursor: 'pointer',
          background: 'var(--accent,#5A6647)',
          color: '#FCFAF4',
          border: 'none',
          marginTop: '4px',
        }}
      >
        <Send style={{ width: '17px', height: '17px' }} /> <span>{tr('ct.f.btn')}</span>
      </button>
      <p style={{ fontSize: '.8rem', color: '#8A8072', textAlign: 'center' }}>{tr('ct.f.note')}</p>
      {state === 'error' && (
        <p style={{ color: '#8a4b3a', fontSize: '.9rem', marginTop: '8px' }}>{tr('ct.f.err')}</p>
      )}
    </form>
  )
}
