// Fixed-window rate limiter over an in-memory map.
//
// Scope caveat: state lives in one server instance. A serverless deploy runs
// several, and each cold start starts empty, so the effective ceiling is
// `max × live instances`. That is enough to stop a casual script hammering the
// chat endpoint; it is not a defence against a determined attacker. Swap the
// store for Supabase or Upstash if abuse actually shows up.
export type RateLimiter = (key: string, now?: number) => boolean

export function createRateLimiter({
  windowMs,
  max,
  maxKeys = 5000,
}: {
  windowMs: number
  max: number
  maxKeys?: number
}): RateLimiter {
  const hits = new Map<string, number[]>()

  return function isLimited(key, now = Date.now()) {
    const recent = (hits.get(key) ?? []).filter((ts) => now - ts < windowMs)
    recent.push(now)

    // Crude bound so a flood of distinct keys can't grow the map without limit.
    // Dropping the oldest key is fine: its window rebuilds on the next request.
    if (!hits.has(key) && hits.size >= maxKeys) {
      const oldest = hits.keys().next().value
      if (oldest !== undefined) hits.delete(oldest)
    }
    hits.set(key, recent)

    return recent.length > max
  }
}
