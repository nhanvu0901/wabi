import { describe, it, expect } from 'vitest'
import { createRateLimiter } from './rate-limit'

describe('createRateLimiter', () => {
  it('allows up to max requests in the window', () => {
    const limited = createRateLimiter({ windowMs: 60_000, max: 3 })
    expect(limited('a', 1000)).toBe(false)
    expect(limited('a', 1001)).toBe(false)
    expect(limited('a', 1002)).toBe(false)
  })

  it('blocks the request after max', () => {
    const limited = createRateLimiter({ windowMs: 60_000, max: 3 })
    limited('a', 1000)
    limited('a', 1001)
    limited('a', 1002)
    expect(limited('a', 1003)).toBe(true)
  })

  it('lets requests through again once the window has passed', () => {
    const limited = createRateLimiter({ windowMs: 60_000, max: 2 })
    limited('a', 1000)
    limited('a', 1001)
    expect(limited('a', 1002)).toBe(true)
    expect(limited('a', 62_000)).toBe(false)
  })

  it('counts each key separately', () => {
    const limited = createRateLimiter({ windowMs: 60_000, max: 1 })
    expect(limited('a', 1000)).toBe(false)
    expect(limited('b', 1000)).toBe(false)
    expect(limited('a', 1001)).toBe(true)
  })

  it('evicts an old key rather than growing past maxKeys', () => {
    const limited = createRateLimiter({ windowMs: 60_000, max: 1, maxKeys: 2 })
    limited('a', 1000)
    limited('b', 1000)
    limited('c', 1000) // evicts 'a'
    // 'a' was dropped, so its window starts fresh instead of staying blocked.
    expect(limited('a', 1001)).toBe(false)
    // 'c' is still tracked.
    expect(limited('c', 1001)).toBe(true)
  })
})
