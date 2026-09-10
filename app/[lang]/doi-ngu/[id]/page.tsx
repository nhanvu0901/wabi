import { cache } from 'react'
import { notFound } from 'next/navigation'
import TherapistProfileView from '../../../../components/TherapistProfile'
import { getTherapistDetail } from '../../../../lib/content'
import { isLang, langAlternates, type Lang } from '../../../../lib/i18n'
import { pickTitle } from '../../../../lib/types'

export const revalidate = 60

const loadTherapist = cache(getTherapistDetail)

function parseParams(lang: string, id: string): { lang: Lang; id: number } | null {
  if (!isLang(lang) || !/^\d+$/.test(id)) return null
  return { lang, id: Number(id) }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang: rawLang, id: rawId } = await params
  const parsed = parseParams(rawLang, rawId)
  if (!parsed) return {}

  const therapist = await loadTherapist(parsed.id)
  if (!therapist) return {}

  return {
    title: therapist.name,
    description: pickTitle(therapist, parsed.lang),
    alternates: langAlternates(parsed.lang, `/doi-ngu/${parsed.id}`),
  }
}

export default async function TherapistDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang: rawLang, id: rawId } = await params
  const parsed = parseParams(rawLang, rawId)
  if (!parsed) notFound()

  const therapist = await loadTherapist(parsed.id)
  if (!therapist) notFound()

  return <TherapistProfileView therapist={therapist} lang={parsed.lang} />
}
