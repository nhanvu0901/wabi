// Four dictionary values carry inline markup from the design (hero.title,
// phil.body, sv2.b, sv5.b — the italic accent spans and the <b> highlights).
// The dictionary is static, authored by us, and never contains user input, so
// rendering it as HTML is safe; everything else goes through plain interpolation.
export default function Rich({
  html,
  as: Tag = 'span',
  ...rest
}: {
  html: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3'
} & React.HTMLAttributes<HTMLElement>) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />
}
