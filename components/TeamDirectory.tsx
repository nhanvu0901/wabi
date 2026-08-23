'use client'

import { useMemo, useState } from 'react'
import TherapistCard from './TherapistCard'
import { t, type Lang } from '../lib/i18n'
import { filterTherapists, type TeamFilter } from '../lib/team-filter'
import type { Therapist } from '../lib/types'

const FILTERS: Array<{ value: TeamFilter; key: string }> = [
  { value: 'all', key: 'tm.filterAll' },
  { value: 'online', key: 'tm.filterOnline' },
  { value: 'hn', key: 'tm.filterHn' },
  { value: 'hcm', key: 'tm.filterHcm' },
]

export default function TeamDirectory({ therapists, lang }: { therapists: Therapist[]; lang: Lang }) {
  const [filter, setFilter] = useState<TeamFilter>('all')
  const tr = t(lang)
  const visibleTherapists = useMemo(
    () => filterTherapists(therapists, filter),
    [therapists, filter],
  )

  return (
    <>
      <div className="inner-team-filters" role="group" aria-label={tr('tm.filterLabel')}>
        <span className="inner-team-filters__label">{tr('tm.filterLabel')}</span>
        {FILTERS.map(({ value, key }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {tr(key)}
          </button>
        ))}
        <span className="inner-team-filters__count" aria-live="polite">
          {visibleTherapists.length}{' '}
          {tr(visibleTherapists.length === 1 ? 'tm.countOne' : 'tm.countMany')}
        </span>
      </div>
      <div className="inner-team-grid">
        {visibleTherapists.map((therapist, index) => (
          <TherapistCard key={therapist.id} t={therapist} lang={lang} priority={index === 0} />
        ))}
      </div>
    </>
  )
}
