'use client'
import { useState, useTransition } from 'react'
import { Send, Check } from 'lucide-react'
import { submitContact } from '../lib/actions'

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [pending, startTransition] = useTransition()

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
          Cảm ơn bạn đã nhắn.
        </h3>
        <p style={{ color: '#6B6459' }}>Tụi mình đã nhận lời nhắn của bạn và sẽ phản hồi sớm nhất. Cứ thở nhẹ nhàng nhé.</p>
      </div>
    )
  }

  return (
    <form
      id="cform"
      style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(async () => {
          // ponytail: catches network failure (e.g. offline) reaching the
          // server action, not just a Supabase-side { ok: false } — both must
          // surface the same error line.
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
        <label htmlFor="f-name" style={{ display: 'block', fontSize: '.86rem', fontWeight: 500, marginBottom: '7px' }}>
          Họ tên
        </label>
        <input
          id="f-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          style={{
            width: '100%',
            padding: '13px 16px',
            border: '1px solid #E2D8C6',
            borderRadius: '14px',
            background: '#F7F2E9',
            color: '#33302A',
            outline: 'none',
          }}
        />
      </div>
      <div>
        <label htmlFor="f-contact" style={{ display: 'block', fontSize: '.86rem', fontWeight: 500, marginBottom: '7px' }}>
          Email hoặc số điện thoại
        </label>
        <input
          id="f-contact"
          name="contact"
          type="text"
          required
          autoComplete="email"
          style={{
            width: '100%',
            padding: '13px 16px',
            border: '1px solid #E2D8C6',
            borderRadius: '14px',
            background: '#F7F2E9',
            color: '#33302A',
            outline: 'none',
          }}
        />
      </div>
      <div>
        <label htmlFor="f-msg" style={{ display: 'block', fontSize: '.86rem', fontWeight: 500, marginBottom: '7px' }}>
          Bạn muốn chia sẻ điều gì?
        </label>
        <textarea
          id="f-msg"
          name="message"
          rows={4}
          style={{
            width: '100%',
            padding: '13px 16px',
            border: '1px solid #E2D8C6',
            borderRadius: '14px',
            background: '#F7F2E9',
            color: '#33302A',
            outline: 'none',
            resize: 'vertical',
          }}
        />
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
        <Send style={{ width: '17px', height: '17px' }} /> Gửi lời nhắn
      </button>
      <p style={{ fontSize: '.8rem', color: '#8A8072', textAlign: 'center' }}>
        Tụi mình sẽ phản hồi qua thông tin bạn để lại. Mọi chia sẻ đều được giữ kín.
      </p>
      {state === 'error' && (
        <p style={{ color: '#8a4b3a', fontSize: '.9rem', marginTop: '8px' }}>
          Gửi không thành công, vui lòng thử lại hoặc gọi hotline.
        </p>
      )}
    </form>
  )
}
