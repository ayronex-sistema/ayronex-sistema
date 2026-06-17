# Operacao do Portal Checklist

## Diagnostico de integracao

Se a rota `/checklist` abrir, mas o formulario nao carregar corretamente ou nao gravar no Google Sheets, analise primeiro estes pontos na Vercel:

1. `Project > Deployments > ultimo deploy > Build Logs`
   Verifica erros de build, tipagem, imports quebrados e configuracao do Next.js.

2. `Project > Logs`
   Verifica erros em tempo real da API `/api/checklist`, incluindo falhas de autenticacao, validacao e Google Sheets.

3. `Project > Settings > Environment Variables`
   Confirma se as variaveis obrigatorias estao cadastradas para `Production`:
   `FISCAL_USER_EMAIL`, `FISCAL_USER_PASSWORD`, `CHECKLIST_SPREADSHEET_ID`, `CHECKLIST_SUMMARY_SHEET`, `CHECKLIST_ITEMS_SHEET` e `GOOGLE_SERVICE_ACCOUNT_JSON`.

4. Google Cloud / Google Sheets
   Confirma se a Service Account tem permissao de editor na planilha configurada em `CHECKLIST_SPREADSHEET_ID`.

## Verificacao em tempo real

Para acompanhar a API no painel:

1. Acesse `Vercel > checklist > Logs`.
2. Filtre por `/api/checklist`.
3. Envie um checklist de teste.
4. Confirme se a requisicao aparece com status `200`.

Para testar por terminal:

```bash
curl -i -X POST "https://SUA_URL_DA_VERCEL/api/checklist" \
  -u "FISCAL_USER_EMAIL:FISCAL_USER_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "TCI",
    "employeeId": "tci-1",
    "inspectorName": "Teste Operacional",
    "observations": "Teste tecnico de integracao",
    "declarationAccept": true,
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lD7Q7wAAAABJRU5ErkJggg==",
    "epis": [
      {
        "id": "capacete",
        "label": "Capacete",
        "ca": "CA-1001",
        "quantity": 1,
        "selected": true
      },
      {
        "id": "luva",
        "label": "Luva de protecao",
        "ca": "CA-1002",
        "quantity": 1,
        "selected": false
      }
    ]
  }'
```

Resposta esperada:

```json
{
  "ok": true,
  "recordedToSheets": true,
  "summaryRows": 1,
  "itemRows": 1
}
```

Se a resposta for `401`, revise `FISCAL_USER_EMAIL` e `FISCAL_USER_PASSWORD`.
Se a resposta for `500`, revise `GOOGLE_SERVICE_ACCOUNT_JSON`, `CHECKLIST_SPREADSHEET_ID` e permissao da Service Account na planilha.

## Teste via console do navegador

Com a pagina autenticada, abra o console do navegador e execute:

```js
fetch("/api/checklist", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    company: "TCI",
    employeeId: "tci-1",
    inspectorName: "Teste Operacional",
    observations: "Teste via console",
    declarationAccept: true,
    signature:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lD7Q7wAAAABJRU5ErkJggg==",
    epis: [
      {
        id: "capacete",
        label: "Capacete",
        ca: "CA-1001",
        quantity: 1,
        selected: true
      }
    ]
  })
}).then(async (res) => ({
  status: res.status,
  body: await res.json().catch(() => null)
})).then(console.log);
```

## Relatorio tecnico de entrega

O portal Checklist foi implementado como uma aplicacao independente em Next.js com App Router, isolada do ERP principal e publicada como projeto proprio na Vercel. A rota principal `/checklist` e protegida por Middleware com autenticacao Basic Auth, validando usuario e senha por variaveis de ambiente (`FISCAL_USER_EMAIL` e `FISCAL_USER_PASSWORD`) antes de permitir acesso ao formulario.

A persistencia dos dados ocorre por uma API Route (`/api/checklist`) executada em runtime Node.js. A rota valida o payload do formulario, verifica empresa, funcionario e EPIs selecionados, gera um identificador unico de entrega e envia os dados para o Google Sheets por meio da Google Sheets API. A autenticacao com o Google e feita via Service Account, configurada por `GOOGLE_SERVICE_ACCOUNT_JSON` ou por credenciais separadas (`GOOGLE_SERVICE_ACCOUNT_EMAIL` e `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`).

O fluxo registra uma linha de resumo da entrega na aba configurada por `CHECKLIST_SUMMARY_SHEET` e os itens individuais entregues na aba configurada por `CHECKLIST_ITEMS_SHEET`. Essa estrutura permite auditoria operacional, rastreio por funcionario, vinculacao dos itens entregues ao mesmo registro e validacao posterior pela central administrativa.

## Criterio de aceite final

O sistema pode ser considerado operacional quando:

1. `/checklist` exige usuario e senha.
2. O formulario abre apos credenciais validas.
3. Um POST em `/api/checklist` retorna `200`.
4. A resposta contem `recordedToSheets: true`.
5. A planilha recebe uma linha na aba de resumo e uma ou mais linhas na aba de itens.
