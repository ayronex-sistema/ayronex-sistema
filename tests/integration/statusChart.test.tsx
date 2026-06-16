/** @vitest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react'
import React, { useState } from 'react'
import { StatusOperationalChart } from '../../components/indicators/StatusOperationalChart'
import { describe, it, expect } from 'vitest'
import type { ProductionRecord } from '../../lib/indicators'

const records: ProductionRecord[] = [
  { id: 'p1', date: '2026-06-16', equipe: 'A', points: 0, value: 0, status: 'Pendente', launchedConecta: false },
  { id: 'p2', date: '2026-06-16', equipe: 'B', points: 0, value: 0, status: 'OK', launchedConecta: false },
  { id: 'p3', date: '2026-06-16', equipe: 'C', points: 0, value: 0, status: 'OK', launchedConecta: false },
]

describe('StatusOperationalChart integration', () => {
  it('renders status buttons and updates filter when clicked (stateful parent)', () => {
    function Wrapper() {
      const [selected, setSelected] = useState<string | null>(null)
      return <StatusOperationalChart records={records} onFilterStatus={setSelected} selectedStatus={selected} />
    }

    render(<Wrapper />)

    // Should render buttons for Pendente and OK
    expect(screen.getByText(/Pendente/i)).toBeTruthy()
    expect(screen.getByText(/OK/i)).toBeTruthy()

    // Click to set filter
    fireEvent.click(screen.getByText(/Pendente/i))
    // Now the button should appear active (has text color or changed aria), we assert the clear filter button appears
    expect(screen.getByText(/Limpar filtro/i)).toBeTruthy()

    // Click clear filter
    fireEvent.click(screen.getByText(/Limpar filtro/i))
    expect(screen.queryByText(/Limpar filtro/i)).toBeNull()
  })
})
