import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LANGS, DEFAULT_LANG } from './lib/i18n'

// Every page lives under /[lang]. Anything without a language prefix gets
// redirected to one — picked from Accept-Language, falling back to Vietnamese.
// This replaces the design's localStorage mechanism: the language is now part of
// the URL, so the server renders the right text on the first response and search
// engines get a distinct, indexable URL per language.
export const config = {
  matcher: ['/((?!_next|api|favicon.ico|images|.*\\..*).*)'],
}

function preferred(header: string | null): string {
  if (!header) return DEFAULT_LANG
  // "en-GB,en;q=0.9,vi;q=0.8" → first tag we actually serve
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)
  for (const { tag } of tags) {
    const base = tag.split('-')[0]
    if ((LANGS as readonly string[]).includes(base)) return base
  }
  return DEFAULT_LANG
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLang = LANGS.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  if (hasLang) return NextResponse.next()

  const lang = preferred(request.headers.get('accept-language'))
  const url = request.nextUrl.clone()
  url.pathname = `/${lang}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}
