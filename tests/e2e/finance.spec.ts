import { test, expect } from '@playwright/test'

test.describe('Financeiro E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/financeiro')
  })

  test('add → shows badge → edit → delete', async ({ page }) => {
    // preencher novo lançamento
    await page.getByLabel('Descrição').fill('Test E2E Receita')
    await page.getByLabel('Categoria').fill('Test')
    await page.getByLabel('Valor').fill('100,00')
    // tipo Entrada deve marcar paid automático
    await page.click('button:has-text("Adicionar")')

    // validar feedback
    await expect(page.locator('role=status')).toHaveText(/Lançamento financeiro adicionado\./)

    // verificar badge de pendentes (não deve aumentar para entrada)
    const badge = page.locator('article:has-text("Falta Pagar") span')
    await expect(badge).toHaveCount(0)

    // adicionar uma Saída pendente
    await page.click('button:has-text("Novo Lançamento")')
    await page.getByLabel('Descrição').fill('Test E2E Despesa')
    await page.getByLabel('Categoria').fill('Despesa')
    await page.getByLabel('Valor').fill('50,00')
    // selecionar tipo Saída
    await page.getByLabel('Tipo').selectOption('Saída')
    // preencher dueDate
    await page.getByLabel('Vencimento').fill('2026-06-30')
    await page.click('button:has-text("Adicionar")')

    // badge agora deve existir e ter contagem 1
    const badge2 = page.locator('article:has-text("Falta Pagar") span')
    await expect(badge2).toHaveCount(1)
    await expect(badge2).toHaveText('1')

    // editar o lançamento: localizar na tabela e clicar editar
    const row = page.locator('table').locator('tr').filter({ hasText: 'Test E2E Despesa' }).first()
    await row.locator('button[title="Editar"]').first().click()
    await page.fill('input[name="amount"]', '60,00')
    await page.click('button:has-text("Salvar edição")')

    // verificar que o saldo / total atualizou (badge permanece)
    await expect(badge2).toHaveText('1')

    // excluir o lançamento
    const row2 = page.locator('table').locator('tr').filter({ hasText: 'Test E2E Despesa' }).first()
    await row2.locator('button[title="Excluir"]').first().click()

    // confirmar remoção via feedback
    await expect(page.locator('role=status')).toHaveText(/Lançamento removido\./)

    // badge deve desaparecer
    await expect(page.locator('article:has-text("Falta Pagar") span')).toHaveCount(0)
  })
})
