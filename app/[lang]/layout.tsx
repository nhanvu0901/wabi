import '../globals.css'
import type { Metadata } from 'next'
import { Newsreader, Be_Vietnam_Pro } from 'next/font/google'
import { notFound } from 'next/navigation'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import RevealInit from '../../components/RevealInit'
import ChatBox from '../../components/ChatBox'
import Ambient from '../../components/Ambient'
import { LANGS, isLang, t, langAlternates, SITE_URL } from '../../lib/i18n'

const newsreader = Newsreader({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-newsreader',
})

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
})

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
    <html lang={lang} className={`${newsreader.variable} ${beVietnamPro.variable}`}>
      <body>
        <Ambient />
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
