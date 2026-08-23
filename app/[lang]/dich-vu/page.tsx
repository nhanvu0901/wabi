import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import ServiceDirectory from '../../../components/ServiceDirectory'
import { getServices } from '../../../lib/content'
import { isLang, langAlternates, t, type Lang } from '../../../lib/i18n'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) return { title: 'Dịch vụ' }
  return { title: t(lang)('nav.services'), alternates: langAlternates(lang, '/dich-vu') }
}

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  if (!isLang(raw)) notFound()
  const lang: Lang = raw
  const tr = t(lang)
  const services = await getServices()

  return (
    <main className="inner-page inner-page--services">
      <section className="inner-page__section">
        <div className="inner-services-motif" aria-hidden="true" />
        <div className="inner-page__shell inner-page__shell--services">
          <header className="inner-page__hero">
            <span className="inner-page__eyebrow">{tr('sp.eyebrow')}</span>
            <h1>
              {tr('sv.titleLead')} <em>{tr('sv.titleAccent')}</em>
            </h1>
            <p>{tr('sv.intro')}</p>
          </header>

          <ServiceDirectory services={services} lang={lang} />

          <div className="inner-page__cta-wrap">
            <Link className="inner-page__cta" href={`/${lang}/doi-ngu`}>
              {tr('sv.cta')}
              <span><ArrowRight aria-hidden="true" /></span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
