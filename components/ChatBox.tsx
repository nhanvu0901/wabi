'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { t, type Lang } from '../lib/i18n'

type Msg = { who: 'bot' | 'user'; text: string }

const CHIP_KEYS = ['chat.chip1', 'chat.chip2', 'chat.chip3', 'chat.chip4']

export default function ChatBox({ lang }: { lang: Lang }) {
  const tr = t(lang)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMessages([{ who: 'bot', text: tr('chat.greeting') }])
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      requestAnimationFrame(() => launcherRef.current?.focus())
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    const body = bodyRef.current
    if (body) body.scrollTop = body.scrollHeight
  }, [messages, open])

  async function send(text: string) {
    const question = text.trim()
    if (!question || busy) return

    setDraft('')
    setBusy(true)
    const history = [...messages, { who: 'user' as const, text: question }]
    setMessages([...history, { who: 'bot', text: '' }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          messages: history.map((message) => ({
            role: message.who === 'bot' ? 'assistant' : 'user',
            content: message.text,
          })),
        }),
      })
      if (!response.ok || !response.body) throw new Error(String(response.status))

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let answer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        answer += decoder.decode(value, { stream: true })
        setMessages((current) => {
          const next = [...current]
          next[next.length - 1] = { who: 'bot', text: answer }
          return next
        })
      }
      if (!answer.trim()) throw new Error('empty')
    } catch {
      setMessages((current) => {
        const next = [...current]
        next[next.length - 1] = { who: 'bot', text: tr('chat.err') }
        return next
      })
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  const showChips = messages.length === 1 && messages[0]?.who === 'bot'

  return (
    <div className="wabi-chat" id="wabi-chat">
      <div
        className={`wabi-chat-panel${open ? ' is-open' : ''}`}
        id="chat-panel"
        role="dialog"
        aria-label="Wabi Therapy chat"
      >
        <header className="wabi-chat-panel__header">
          <div className="wabi-chat-panel__avatar"><span /></div>
          <div className="wabi-chat-panel__identity">
            <strong>Wabi Therapy</strong>
            <small><span />{tr('chat.status')}</small>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              requestAnimationFrame(() => launcherRef.current?.focus())
            }}
            aria-label={tr('chat.close')}
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="wabi-chat-panel__body" id="chat-body" ref={bodyRef} aria-live="polite">
          {messages.map((message, index) => (
            <div className={`wabi-chat-message wabi-chat-message--${message.who}`} key={index}>
              <div>
                {message.text || (
                  <span className="wabi-dots" aria-label={tr('chat.replying')}><i /><i /><i /></span>
                )}
              </div>
            </div>
          ))}
          {showChips && (
            <div className="wabi-chat-chips">
              {CHIP_KEYS.map((key) => (
                <button type="button" key={key} onClick={() => send(tr(key))}>{tr(key)}</button>
              ))}
            </div>
          )}
        </div>

        <form className="wabi-chat-form" onSubmit={(event) => { event.preventDefault(); send(draft) }}>
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={tr('chat.placeholder')}
            aria-label={tr('chat.placeholder')}
          />
          <button type="submit" aria-label={tr('chat.send')} disabled={busy || !draft.trim()}>
            <Send aria-hidden="true" />
          </button>
        </form>
      </div>

      <button
        ref={launcherRef}
        className="wabi-chat-launch"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? tr('chat.close') : tr('chat.open')}
        aria-expanded={open}
        aria-controls="chat-panel"
      >
        {open ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}
      </button>
    </div>
  )
}
