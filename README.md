# Checklist Ayronex

Portal independente para fiscais realizarem checklist de EPI com assinatura digital e envio para Google Sheets.

## O que este projeto entrega

- Acesso protegido por autenticação básica na rota `/checklist`.
- Fluxo em etapas: empresa, funcionário, EPIs e assinatura.
- Captura de assinatura em tela com `signature_pad`.
- Envio para Google Sheets via service account.
- Interface em `bg-zinc-950` com destaques em âmbar, no padrão Ayronex.
- Projeto isolado, pronto para deploy em um subdomínio como `checklist.ayronex.com.br`.

## Estrutura de planilhas sugerida

### Aba `Checklist`

Colunas recomendadas:

1. `Data_Hora`
2. `Empresa_ID`
3. `Empresa`
4. `CNPJ`
5. `Funcionario_ID`
6. `Funcionario`
7. `Matricula`
8. `Fiscal`
9. `Total_Itens`
10. `Observacoes`
11. `Assinatura_Base64`

### Aba `Checklist_Itens`

Colunas recomendadas:

1. `Data_Hora`
2. `Empresa_ID`
3. `Empresa`
4. `Funcionario_ID`
5. `Funcionario`
6. `EPI_ID`
7. `EPI`
8. `CA`
9. `Quantidade`
10. `Fiscal`

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

- `FISCAL_USER_EMAIL`
- `FISCAL_USER_PASSWORD`
- `FISCAL_USER_NAME`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `CHECKLIST_SPREADSHEET_ID`
- `CHECKLIST_SUMMARY_SHEET`
- `CHECKLIST_ITEMS_SHEET`

Você pode usar o JSON completo da Service Account em `GOOGLE_SERVICE_ACCOUNT_JSON` ou separar em `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.

## Variáveis obrigatórias na Vercel

Configure no painel do projeto:

- `FISCAL_USER_EMAIL`
- `FISCAL_USER_PASSWORD`
- `FISCAL_USER_NAME`
- `GOOGLE_SERVICE_ACCOUNT_JSON` ou `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `CHECKLIST_SPREADSHEET_ID`
- `CHECKLIST_SUMMARY_SHEET`
- `CHECKLIST_ITEMS_SHEET`

## Deploy na Vercel

1. Suba este projeto como repositório separado.
2. Crie um novo projeto na Vercel apontando para esse repositório.
3. Aponte o domínio `checklist.ayronex.com.br` para o projeto.
4. Configure as variáveis de ambiente na Vercel.

## Integração com o ERP principal

Quando a aba `Checklist` for criada no ERP principal, ela pode apenas abrir este portal ou carregar um link/iframe para o subdomínio.
Como os dados chegam aqui em formato de imagem/base64 da assinatura, a central consegue manter a trilha digital completa.
