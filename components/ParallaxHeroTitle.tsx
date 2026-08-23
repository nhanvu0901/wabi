export default function ParallaxHeroTitle({ lines }: { lines: [string, string, string] }) {
  const offsets = ['-150', '-215', '-290'] as const

  return (
    <h1 id="home-title" className="pxa-hero-title">
      {lines.map((line, index) => (
        <span
          key={line}
          data-pxa="pin"
          data-pxa-y={offsets[index]}
          data-pxa-opacity="1,0"
          className={index === 2 ? 'pxa-hero-title__line pxa-hero-title__line--accent' : 'pxa-hero-title__line'}
        >
          <span className="pxa-hero-title__motion" style={{ animationDelay: `${0.08 + index * 0.1}s` }}>
            {line}
          </span>
        </span>
      ))}
    </h1>
  )
}
