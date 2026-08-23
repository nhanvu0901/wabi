import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import TeamDirectory from '../../../components/TeamDirectory'
import { getTherapists } from '../../../lib/content'
import { isLang, langAlternates, t, type Lang } from '../../../lib/i18n'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) return { title: 'Đội ngũ' }
  return { title: t(lang)('tm.eyebrow'), alternates: langAlternates(lang, '/doi-ngu') }
}

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  if (!isLang(raw)) notFound()
  const lang: Lang = raw
  const tr = t(lang)
  const therapists = await getTherapists()

  return (
    <main className="inner-page inner-page--team">
      <section className="inner-page__section">
        <div className="inner-page__shell inner-page__shell--team">
          <header className="inner-page__hero inner-page__hero--team">
            <span className="inner-page__eyebrow">{tr('tm.eyebrow')}</span>
            <h1>
              {tr('tm.titleLead')} <em>{tr('tm.titleAccent')}</em>
            </h1>
            <p>{tr('tm.intro')}</p>
          </header>

          <TeamDirectory therapists={therapists} lang={lang} />

          <p className="inner-team-footnote">{tr('tm.foot')}</p>
          <div className="inner-page__cta-wrap inner-page__cta-wrap--team">
            <Link className="inner-page__cta" href={`/${lang}/lien-he`}>
              {tr('tm.cta')}
              <span><MessageCircle aria-hidden="true" /></span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
