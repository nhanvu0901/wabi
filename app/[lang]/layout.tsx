import '../globals.css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import RevealInit from '../../components/RevealInit'
import ChatBox from '../../components/ChatBox'
import { LANGS, isLang, t, langAlternates, SITE_URL } from '../../lib/i18n'

// This is the app's root layout — it owns <html>/<body>. Every route lives under
// /[lang], so the language is known at render time and <html lang> is correct in
// the first server response (the design set it client-side from localStorage,
// which meant the server always emitted Vietnamese).
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLang(lang)) return {}
  const tr = t(lang)
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: 'Wabi Therapy', template: '%s — Wabi Therapy' },
    description: tr('hero.body'),
    // Deliberately no `alternates` here: metadata is merged, not replaced, so a
    // canonical set at the layout would leak onto every child route and point
    // them all at the homepage. Each page sets its own via langAlternates().
    openGraph: {
      title: 'Wabi Therapy',
      description: tr('hero.body'),
      locale: lang === 'vi' ? 'vi_VN' : 'en_US',
      type: 'website',
    },
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400;1,6..72,500&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <div id="wabi" style={{ position: 'relative' }}>
          <RevealInit />
          <Nav lang={lang} />
          {children}
          <Footer lang={lang} />
          <ChatBox lang={lang} />
        </div>
      </body>
    </html>
  )
}
