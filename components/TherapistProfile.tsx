import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder'
import { t, type Lang } from '../lib/i18n'
import {
  pickTitle,
  pickSpecialties,
  pickTherapies,
  pickLocation,
  pickProfileContent,
  type TherapistDetail,
} from '../lib/types'

export default function TherapistProfileView({
  therapist,
  lang,
}: {
  therapist: TherapistDetail
  lang: Lang
}) {
  const tr = t(lang)
  const profile = therapist.profile
  const name = profile?.full_name?.trim() || therapist.name
  const content = profile ? pickProfileContent(profile, lang) : null
  const paragraphs = content?.bio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) ?? []
  const quote = content?.quote?.trim()
  const bioLang = lang === 'en' && profile?.bio_en?.trim() ? 'en' : 'vi'
  const quoteLang = lang === 'en' && profile?.quote_en?.trim() ? 'en' : 'vi'

  return (
    <main className="therapist-profile">
      <div className="therapist-profile__shell">
        <Link className="therapist-profile__back" href={`/${lang}/doi-ngu`}>
          <ArrowLeft size={16} aria-hidden="true" />
          {tr('profile.back')}
        </Link>

        <header className="therapist-profile__hero">
          <div className="therapist-profile__portrait">
            {therapist.photo_url ? (
              <Image
                src={therapist.photo_url}
                alt={name}
                width={640}
                height={800}
                sizes="(max-width: 759px) calc(100vw - 40px), (max-width: 1160px) 40vw, 432px"
                priority
              />
            ) : (
              <ImagePlaceholder label={name} />
            )}
          </div>
          <div className="therapist-profile__identity">
            <span className="therapist-profile__eyebrow">{tr('tm.eyebrow')}</span>
            <h1>{name}</h1>
            <p className="therapist-profile__title">{pickTitle(therapist, lang)}</p>
            <dl className="therapist-profile__facts">
              <div>
                <dt>{tr('profile.specialties')}</dt>
                <dd>{pickSpecialties(therapist, lang)}</dd>
              </div>
              <div>
                <dt>{tr('profile.therapies')}</dt>
                <dd>{pickTherapies(therapist, lang)}</dd>
              </div>
              <div>
                <dt>{tr('profile.price')}</dt>
                <dd>{therapist.price}{tr('card.ses')}</dd>
              </div>
              <div>
                <dt>{tr('profile.location')}</dt>
                <dd>{pickLocation(therapist, lang)}</dd>
              </div>
            </dl>
          </div>
        </header>

        <article className="therapist-profile__article" aria-labelledby="therapist-profile-about">
          <h2 id="therapist-profile-about">{tr('profile.about')}</h2>
          {content?.isFallback && (
            <p className="therapist-profile__notice">{tr('profile.fallback')}</p>
          )}
          {paragraphs.length ? (
            <div className="therapist-profile__bio" lang={bioLang}>
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          ) : (
            <p className="therapist-profile__pending">{tr('profile.pending')}</p>
          )}
          {quote && <blockquote lang={quoteLang}>{quote}</blockquote>}
        </article>

        <section className="therapist-profile__contact" aria-labelledby="therapist-profile-contact">
          <h2 id="therapist-profile-contact">{tr('profile.ctaLead')} <em>{name}</em>?</h2>
          <Link className="therapist-profile__cta" href={`/${lang}/lien-he`}>
            {tr('profile.cta')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  )
}
