import { describe, it, expect } from 'vitest'
import { parseMoney } from '../lib/currency'

describe('Finance validation', () => {
  describe('parseMoney', () => {
    it('parses Brazilian formatted numbers correctly', () => {
      expect(parseMoney('1.234,56')).toBeCloseTo(1234.56)
      expect(parseMoney('100,50')).toBeCloseTo(100.50)
      expect(parseMoney('0,01')).toBeCloseTo(0.01)
    })

    it('returns 0 for invalid inputs', () => {
      expect(parseMoney('')).toBe(0)
      expect(parseMoney('abc')).toBe(0)
      expect(parseMoney(null)).toBe(0)
      expect(parseMoney(undefined)).toBe(0)
    })

    it('handles numbers without separators', () => {
      expect(parseMoney('1000')).toBe(1000)
      expect(parseMoney('50')).toBe(50)
    })
  })

  describe('Form validation rules', () => {
    const validateForm = (form: {
      description: string
      category: string
      amount: string
      type: string
      dueDate?: string
    }) => {
      const errors: Record<string, string> = {}

      if (!form.description.trim()) {
        errors.description = 'Descrição é obrigatória.'
      }
      if (!form.category.trim()) {
        errors.category = 'Categoria é obrigatória.'
      }
      if (!parseMoney(form.amount)) {
        errors.amount = 'Informe um valor monetário válido.'
      }
      if (form.type.toLowerCase().includes('sa') && !form.dueDate?.trim()) {
        errors.dueDate = 'Data de vencimento é obrigatória para saídas.'
      }

      return errors
    }

    it('rejects empty form', () => {
      const errors = validateForm({
        description: '',
        category: '',
        amount: '',
        type: 'Entrada',
      })
      expect(Object.keys(errors).length).toBe(3)
    })

    it('accepts valid entrada form', () => {
      const errors = validateForm({
        description: 'Venda',
        category: 'Receita',
        amount: '1.000,00',
        type: 'Entrada',
      })
      expect(Object.keys(errors).length).toBe(0)
    })

    it('requires dueDate for Saída', () => {
      const errors = validateForm({
        description: 'Aluguel',
        category: 'Despesa',
        amount: '500,00',
        type: 'Saída',
      })
      expect(errors.dueDate).toBeDefined()
    })

    it('accepts Saída with dueDate', () => {
      const errors = validateForm({
        description: 'Aluguel',
        category: 'Despesa',
        amount: '500,00',
        type: 'Saída',
        dueDate: '2026-06-30',
      })
      expect(Object.keys(errors).length).toBe(0)
    })
  })
})
