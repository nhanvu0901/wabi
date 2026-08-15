'use client'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { t, type Lang } from '../lib/i18n'

// Ports #wabi-chat from the design (bundled design L704-722) — launcher, panel,
// header, bubbles, chips and input keep the design's exact styles. What changed
// is where replies come from: the design answered with five canned strings
// picked by regex; here the reply streams from /api/chat, which is also the only
// place the OpenRouter key exists.

type Msg = { who: 'bot' | 'user'; text: string }

const CHIP_KEYS = ['chat.chip1', 'chat.chip2', 'chat.chip3', 'chat.chip4']

const BUBBLE_ROW = (bot: boolean): React.CSSProperties => ({
  display: 'flex',
  justifyContent: bot ? 'flex-start' : 'flex-end',
  animation: 'wabiMsg .3s ease',
})

const BUBBLE = (bot: boolean): React.CSSProperties => ({
  maxWidth: '82%',
  padding: '11px 15px',
  borderRadius: bot ? '4px 16px 16px 16px' : '16px 16px 4px 16px',
  fontSize: '.9rem',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  ...(bot
    ? { background: '#FCFAF4', border: '1px solid #EAE0D0', color: '#33302A' }
    : { background: 'var(--accent,#5A6647)', color: '#FCFAF4' }),
})

export default function ChatBox({ lang }: { lang: Lang }) {
  const tr = t(lang)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // The greeting is seeded on first open, matching the design's resetChat().
  // Re-seeding on language change keeps the transcript in one language.
  useEffect(() => {
    setMessages([{ who: 'bot', text: tr('chat.greeting') }])
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  async function send(text: string) {
    const question = text.trim()
    if (!question || busy) return
    setDraft('')
    setBusy(true)

    // History goes up before the empty bot bubble, so the request carries the
    // conversation the user can actually see.
    const history = [...messages, { who: 'user' as const, text: question }]
    setMessages([...history, { who: 'bot', text: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          messages: history.map((m) => ({ role: m.who === 'bot' ? 'assistant' : 'user', content: m.text })),
        }),
      })
      if (!res.ok || !res.body) throw new Error(String(res.status))

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { who: 'bot', text: acc }
          return next
        })
      }
      if (!acc.trim()) throw new Error('empty')
    } catch {
      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = { who: 'bot', text: tr('chat.err') }
        return next
      })
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  // Chips only show on the opening turn, exactly as in the design.
  const showChips = messages.length === 1 && messages[0].who === 'bot'

  return (
    <div id="wabi-chat" style={{ position: 'fixed', right: 'clamp(16px,3vw,28px)', bottom: 'clamp(16px,3vw,28px)', zIndex: 300 }}>
      <div
        id="chat-panel"
        role="dialog"
        aria-label="Wabi Therapy chat"
        style={{
          display: open ? 'flex' : 'none',
          width: '370px',
          height: '540px',
          maxHeight: 'calc(100vh - 120px)',
          background: '#FBF7EF',
          border: '1px solid #E2D8C6',
          borderRadius: '24px',
          overflow: 'hidden',
          flexDirection: 'column',
          boxShadow: '0 40px 80px -30px rgba(51,48,42,.55)',
          animation: 'wabiPop .3s ease',
        }}
      >
        <div style={{ background: '#3A342C', color: '#F7F2E9', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#7C8968,#5A6647)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#EEDFD3', boxShadow: '0 0 0 4px rgba(238,223,211,.28)' }}></span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Newsreader',serif", fontSize: '1.12rem', lineHeight: 1.1 }}>Wabi Therapy</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.76rem', color: 'rgba(247,242,233,.7)', marginTop: '2px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#8FB37A' }}></span>
              <span>{tr('chat.status')}</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label={tr('chat.close')}
            style={{
              background: 'rgba(247,242,233,.1)',
              border: 'none',
              color: '#F7F2E9',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <div
          id="chat-body"
          ref={bodyRef}
          aria-live="polite"
          style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#F7F2E9' }}
        >
          {messages.map((m, i) => (
            <div key={i} style={BUBBLE_ROW(m.who === 'bot')}>
              <div style={BUBBLE(m.who === 'bot')}>
                {m.text || <span style={{ opacity: 0.5 }}>…</span>}
              </div>
            </div>
          ))}
          {showChips && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
              {CHIP_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => send(tr(k))}
                  style={{
                    background: '#FBF7EF',
                    border: '1px solid #DED3C0',
                    color: 'var(--accent-deep,#434D35)',
                    padding: '8px 14px',
                    borderRadius: '100px',
                    cursor: 'pointer',
                    fontSize: '.85rem',
                    fontFamily: 'inherit',
                    transition: '.15s',
                  }}
                >
                  {tr(k)}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          id="chat-form"
          onSubmit={(e) => {
            e.preventDefault()
            send(draft)
          }}
          style={{ flexShrink: 0, display: 'flex', gap: '9px', padding: '14px', background: '#FBF7EF', borderTop: '1px solid #EAE0D0' }}
        >
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={tr('chat.placeholder')}
            aria-label={tr('chat.placeholder')}
            style={{
              flex: 1,
              padding: '12px 15px',
              border: '1px solid #E2D8C6',
              borderRadius: '100px',
              background: '#F7F2E9',
              color: '#33302A',
              outline: 'none',
              fontSize: '.92rem',
            }}
          />
          <button
            type="submit"
            aria-label={tr('chat.send')}
            disabled={busy || !draft.trim()}
            style={{
              width: '46px',
              height: '46px',
              flexShrink: 0,
              border: 'none',
              borderRadius: '50%',
              cursor: busy || !draft.trim() ? 'default' : 'pointer',
              background: 'var(--accent,#5A6647)',
              color: '#FCFAF4',
              display: 'grid',
              placeItems: 'center',
              opacity: busy || !draft.trim() ? 0.55 : 1,
            }}
          >
            <Send style={{ width: '18px', height: '18px' }} />
          </button>
        </form>
      </div>

      <button
        id="chat-launch"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? tr('chat.close') : tr('chat.open')}
        aria-expanded={open}
        style={{
          marginLeft: 'auto',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'var(--accent,#5A6647)',
          color: '#FCFAF4',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 18px 34px -12px rgba(90,102,71,.9)',
          transition: 'transform .2s',
        }}
      >
        {open ? <X style={{ width: '26px', height: '26px' }} /> : <MessageCircle style={{ width: '26px', height: '26px' }} />}
      </button>
    </div>
  )
}
