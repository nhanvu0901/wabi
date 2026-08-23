import { notFound } from 'next/navigation'
import ContactPageContent from '../../../components/ContactPageContent'
import { isLang, langAlternates, t, type Lang } from '../../../lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) return { title: 'Liên hệ' }
  return { title: t(lang)('ct.eyebrow'), alternates: langAlternates(lang, '/lien-he') }
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  if (!isLang(raw)) notFound()

  return <ContactPageContent lang={raw as Lang} />
}
