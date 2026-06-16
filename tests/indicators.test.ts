import { describe, it, expect } from 'vitest'
import { calculateVariation, formatVariation, getStatusCount, filterProductionByStatus } from '../lib/indicators'
import type { ProductionRecord } from '../lib/indicators'

describe('indicators utilities', () => {
  it('calculateVariation returns neutral when previous is 0 or undefined', () => {
    expect(calculateVariation(100, 0)).toEqual({ percentage: 0, direction: 'neutral' })
    expect(calculateVariation(50)).toEqual({ percentage: 0, direction: 'neutral' })
  })

  it('calculateVariation detects up and down correctly', () => {
    expect(calculateVariation(150, 100)).toEqual({ percentage: 50, direction: 'up' })
    expect(calculateVariation(50, 100)).toEqual({ percentage: 50, direction: 'down' })
    expect(calculateVariation(100, 100)).toEqual({ percentage: 0, direction: 'neutral' })
  })

  it('formatVariation renders arrows and percent with one decimal', () => {
    expect(formatVariation({ percentage: 12.3456, direction: 'up' })).toBe('↑ 12.3%')
    expect(formatVariation({ percentage: 8, direction: 'down' })).toBe('↓ 8.0%')
    expect(formatVariation({ percentage: 0, direction: 'neutral' })).toBe('—')
  })

  it('getStatusCount and filterProductionByStatus work on sample records', () => {
    const records: ProductionRecord[] = [
      { id: '1', date: '2026-06-16', equipe: 'A', points: 1, value: 0, status: 'OK', launchedConecta: false },
      { id: '2', date: '2026-06-16', equipe: 'B', points: 2, value: 0, status: 'Pendente', launchedConecta: false },
      { id: '3', date: '2026-06-16', equipe: 'C', points: 3, value: 0, status: 'OK', launchedConecta: false },
    ]

    expect(getStatusCount(records, 'OK')).toBe(2)
    expect(getStatusCount(records, 'Pendente')).toBe(1)

    const filtered = filterProductionByStatus(records, 'OK')
    expect(filtered.length).toBe(2)
    expect(filtered.every((r) => r.status === 'OK')).toBe(true)
  })
})
