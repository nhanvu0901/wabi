'use client'
import { useState, useTransition, useEffect } from 'react'
import { Send, Check } from 'lucide-react'
import { submitContact } from '../lib/actions'
import { t, type Lang } from '../lib/i18n'

export default function ContactForm({ lang }: { lang: Lang }) {
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [submittedName, setSubmittedName] = useState('')
  const [renderedAt, setRenderedAt] = useState<number>(0)
  const [pending, startTransition] = useTransition()
  const tr = t(lang)

  useEffect(() => {
    setRenderedAt(Date.now())
  }, [])

  if (state === 'ok') {
    return (
      <div id="cform-ok" className="contact-form__success">
        <div className="contact-form__success-icon">
          <Check style={{ width: '28px', height: '28px' }} />
        </div>
        <h2>
          {submittedName
            ? lang === 'vi'
              ? `Cảm ơn ${submittedName} đã kết nối.`
              : `Thank you, ${submittedName}.`
            : tr('ct.ok.t')}
        </h2>
        <p>{tr('ct.ok.b')}</p>
        <p className="contact-form__note" style={{ marginTop: '12px', fontSize: '0.85rem' }}>
          {lang === 'vi'
            ? 'Tụi mình cũng đã gửi một email xác nhận tự động tới hộp thư của bạn.'
            : 'A confirmation email has also been sent to your inbox.'}
        </p>
      </div>
    )
  }

  return (
    <form
      id="cform"
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (pending) return
        const fd = new FormData(e.currentTarget)
        const clientName = fd.get('name')?.toString() || ''
        startTransition(async () => {
          // Catches a network failure reaching the server action, not just a
          // Supabase-side { ok: false } — both must surface the same error line.
          try {
            const res = await submitContact(fd)
            if (res.ok) {
              setSubmittedName(clientName)
              setState('ok')
            } else {
              setState('error')
            }
          } catch {
            setState('error')
          }
        })
      }}
    >
      {/* LỚP 1 BẢO VỆ: Honeypot ẩn với người dùng nhưng bẫy bot spam */}
      <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label htmlFor="user_verification_field">Do not fill this field</label>
        <input
          id="user_verification_field"
          name="user_verification_field"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* LỚP 2 BẢO VỆ: Timestamp thời điểm render form trên browser */}
      <input type="hidden" name="_form_rendered_at" value={renderedAt || ''} />
      <div>
        <label htmlFor="f-name">
          {tr('ct.f.name')}
        </label>
        <input id="f-name" name="name" type="text" required autoComplete="name" />
      </div>
      <div>
        <label htmlFor="f-contact">
          {tr('ct.f.contact')}
        </label>
        <input id="f-contact" name="contact" type="text" required autoComplete="email" />
      </div>
      <div>
        <label htmlFor="f-msg">
          {tr('ct.f.msg')}
        </label>
        <textarea id="f-msg" name="message" rows={4} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="contact-form__submit"
      >
        {pending ? (
          <span className="wabi-dots" style={{ color: '#FCFAF4' }} aria-label={tr('ct.f.sending')}>
            <i />
            <i />
            <i />
          </span>
        ) : (
          <Send style={{ width: '17px', height: '17px' }} />
        )}{' '}
        <span>{tr('ct.f.btn')}</span>
      </button>
      <p className="contact-form__note">{tr('ct.f.note')}</p>
      {state === 'error' && (
        <p className="contact-form__error">{tr('ct.f.err')}</p>
      )}
    </form>
  )
}
