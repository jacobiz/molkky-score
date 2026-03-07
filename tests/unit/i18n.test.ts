import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getLangFromUrl } from '../../src/utils/i18n'

describe('getLangFromUrl', () => {
  const originalLocation = window.location

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { search: '' },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
  })

  it('returns "en" for ?lang=en', () => {
    window.location = { ...window.location, search: '?lang=en' }
    expect(getLangFromUrl()).toBe('en')
  })

  it('returns "fi" for ?lang=fi', () => {
    window.location = { ...window.location, search: '?lang=fi' }
    expect(getLangFromUrl()).toBe('fi')
  })

  it('returns "ja" for ?lang=ja', () => {
    window.location = { ...window.location, search: '?lang=ja' }
    expect(getLangFromUrl()).toBe('ja')
  })

  it('returns null for unsupported value ?lang=zh', () => {
    window.location = { ...window.location, search: '?lang=zh' }
    expect(getLangFromUrl()).toBeNull()
  })

  it('returns null when lang param is absent', () => {
    window.location = { ...window.location, search: '' }
    expect(getLangFromUrl()).toBeNull()
  })

  it('returns null for empty ?lang=', () => {
    window.location = { ...window.location, search: '?lang=' }
    expect(getLangFromUrl()).toBeNull()
  })

  it('returns first value "en" for ?lang=en&lang=fi', () => {
    window.location = { ...window.location, search: '?lang=en&lang=fi' }
    expect(getLangFromUrl()).toBe('en')
  })
})
