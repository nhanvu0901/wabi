type Stat = {
  number: string
  label: string
}

export default function ParallaxIntro({
  eyebrow,
  body,
  stats,
}: {
  eyebrow: string
  body: string
  stats: Stat[]
}) {
  return (
    <section className="pxa-intro">
      <div className="pxa-shell">
        <div data-pxa="flow" data-pxa-y="-34" className="pxa-intro-card">
          <span className="pxa-intro-eyebrow">{eyebrow}</span>
          <p className="pxa-intro-copy">{body}</p>
        </div>
        <div className="pxa-stat-grid">
          {stats.map((stat, index) => (
            <div data-pxa="flow" data-pxa-y={index % 2 ? '-30' : '-58'} key={stat.label} className="pxa-stat">
              <b className={index === stats.length - 1 ? 'pxa-stat__number pxa-stat__number--word' : 'pxa-stat__number'}>{stat.number}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
