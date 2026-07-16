import { describe, it, expect } from 'vitest'
import { validateContact } from './validate'

describe('validateContact', () => {
  it('accepts valid input', () => {
    expect(
      validateContact({ name: 'An', contact: '0900000000', message: 'xin chào' })
    ).toEqual({ name: 'An', contact: '0900000000', message: 'xin chào' })
  })
  it('trims and treats empty message as null', () => {
    expect(validateContact({ name: ' An ', contact: ' a@b.c ', message: '  ' }))
      .toEqual({ name: 'An', contact: 'a@b.c', message: null })
  })
  it('rejects missing name', () => {
    expect(validateContact({ contact: '0900000000' })).toBeNull()
  })
  it('rejects missing contact', () => {
    expect(validateContact({ name: 'An' })).toBeNull()
  })
  it('rejects name longer than 200 chars', () => {
    expect(validateContact({ name: 'a'.repeat(201), contact: '0900000000' })).toBeNull()
  })
  it('accepts message of exactly 5000 chars', () => {
    const message = 'a'.repeat(5000)
    expect(validateContact({ name: 'An', contact: '0900000000', message }))
      .toEqual({ name: 'An', contact: '0900000000', message })
  })
})
