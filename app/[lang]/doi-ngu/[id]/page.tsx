import { notFound } from 'next/navigation'
import { getTherapists } from '../../../../lib/content'
import { isLang } from '../../../../lib/i18n'

export const revalidate = 60

export default async function TherapistDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang: rawLang, id: rawId } = await params
  if (!isLang(rawLang) || !/^\d+$/.test(rawId)) notFound()

  const therapist = (await getTherapists()).find((entry) => entry.id === Number(rawId))
  if (!therapist) notFound()

  return (
    <main className="inner-page inner-page--team">
      <section className="inner-page__section">
        <div className="inner-page__shell inner-page__shell--team">
          <header className="inner-page__hero inner-page__hero--team">
            <h1>{therapist.name}</h1>
          </header>
        </div>
      </section>
    </main>
  )
}
