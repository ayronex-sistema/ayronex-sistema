/** @vitest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react'
import { DetailsModal } from '../../components/indicators/DetailsModal'
import { describe, it, expect, vi } from 'vitest'
import type { DrilldownData, ProductionRecord } from '../../lib/indicators'

const sampleData: DrilldownData = {
  type: 'producaodia',
  records: [
    { id: 'r1', equipe: 'Team A', points: 1, date: '2026-06-16', value: 0, status: 'OK', launchedConecta: false },
    { id: 'r2', equipe: 'Team B', points: 2, date: '2026-06-16', value: 0, status: 'OK', launchedConecta: false },
  ] as ProductionRecord[],
  total: 2,
  monthPrevious: 1,
}

describe('DetailsModal integration', () => {
  it('renders modal content and calls onClose', () => {
    const onClose = vi.fn()
    render(<DetailsModal data={sampleData} onClose={onClose} />)

    expect(screen.getByRole('heading', { name: /Produção do Dia/i })).toBeTruthy()
    expect(screen.getByText(/Total de registros/i)).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText(/Mês anterior: 1 registros/i)).toBeTruthy()

    // records list
    expect(screen.getByText('Team A')).toBeTruthy()
    expect(screen.getByText('Team B')).toBeTruthy()

    // close via button
    fireEvent.click(screen.getAllByRole('button', { name: /Fechar/i })[0])
    expect(onClose).toHaveBeenCalled()
  })
})
