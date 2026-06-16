import { describe, it, expect } from 'vitest'
import { parseMoney } from '../lib/currency'

describe('parseMoney', () => {
  it('parses Brazilian formatted numbers', () => {
    expect(parseMoney('1.234,56')).toBeCloseTo(1234.56)
    expect(parseMoney('0,00')).toBe(0)
    expect(parseMoney('')).toBe(0)
    expect(parseMoney('1234')).toBe(1234)
    expect(parseMoney('1.000')).toBe(1000)
  })
})
