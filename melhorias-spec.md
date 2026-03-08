# Melhorias v2 — Specs Detalhadas

Cada melhoria está documentada com: problema, schema, lógica de cálculo, componentes de UI e critérios de aceite.

---

## Melhoria #1 — Caixa Real (Input Manual com Histórico)

### Problema
O "Caixa Atual" (card na tela Estratégico) é calculado a partir dos títulos do Omie e não reflete o saldo bancário real. Diferenças de timing, tarifas, movimentações fora do ERP e antecipações fazem o valor divergir.

### Schema Supabase

```sql
CREATE TABLE IF NOT EXISTS public.cash_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC(15,2) NOT NULL,
  reference_date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cash_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "founders_can_manage_cash_balances"
  ON public.cash_balances FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_cash_balances_date ON public.cash_balances(reference_date DESC);
```

### Lógica
- O card "Caixa Atual" exibe o registro mais recente de `cash_balances` como valor principal
- Abaixo, em texto secundário: "Caixa Omie: R$ XXX.XXX" (valor calculado dos títulos)
- Botão de edição (ícone lápis) abre modal com: campo valor, date picker, textarea de observação
- Popover/drawer com histórico dos últimos 30 registros (data, valor, quem atualizou)
- Todos os cálculos derivados (Runway, Caixa Previsto 30d) passam a usar `cash_balances.amount` mais recente

### Componentes
- `CashBalanceCard` — card principal com display + botão editar
- `CashBalanceModal` — stepper: Valor → Data → Observação → Confirmar
- `CashBalanceHistory` — drawer/popover com lista dos últimos registros

### Critérios de Aceite
- [ ] Campo editável com validação (valor > 0, data obrigatória)
- [ ] Após salvar, card atualiza imediatamente (optimistic)
- [ ] Histórico mostra últimos 30 registros com nome do autor
- [ ] Runway recalcula usando saldo manual
- [ ] Caixa Previsto 30d recalcula usando saldo manual como base
- [ ] Valor Omie aparece como referência secundária

---

## Melhoria #2 — Corrigir KPIs Vazios

### Problema
Receita MTD, Margem, Burn Rate e Break-even mostram "Sem dados no período" apesar de 600 títulos sincronizados.

### Diagnóstico Provável
Os títulos estão sendo sincronizados mas o campo `tipo` (receita/despesa) ou `status` (pago/previsto) não está mapeado corretamente, impedindo os cálculos de agregação.

### Lógica de Cálculo

**Receita MTD:**
```sql
SELECT COALESCE(SUM(valor), 0) as receita_mtd
FROM titulos
WHERE tipo = 'receita'
  AND status IN ('liquidado', 'pago')
  AND date_trunc('month', data_competencia) = date_trunc('month', CURRENT_DATE);
```

**Burn Rate (média móvel 3 meses):**
```sql
SELECT COALESCE(SUM(ABS(valor)) / 3, 0) as burn_rate
FROM titulos
WHERE tipo = 'despesa'
  AND status IN ('liquidado', 'pago')
  AND data_competencia >= (CURRENT_DATE - INTERVAL '3 months');
```

**Margem MTD:**
```
margem = (receita_mtd - despesas_mtd) / receita_mtd * 100
```
Se `receita_mtd = 0`, exibir "—" com tooltip "Sem receita no período".

**Break-even:**
```
break_even = soma das despesas fixas mensais (overhead)
```
Usar despesas com `recorrente = true` ou classificadas como overhead nos centros de custo (infraestrutura + financeiro).

**Runway:**
```
runway = caixa_real / burn_rate
```
Onde `caixa_real` vem de `cash_balances` (Melhoria #1). Se `cash_balances` estiver vazio, usar o consolidado do Omie como fallback.

### Ação
1. Debugar o mapeamento Omie → Supabase: verificar se `tipo` e `status` estão populados
2. Se estiverem vazios, corrigir o sync para extrair esses campos do payload Omie
3. Criar Supabase views ou functions para cada KPI
4. Se não houver dados suficientes (ex: menos de 3 meses para burn rate), exibir empty state explicativo: "Necessário X meses de dados para calcular" com ícone informativo

### Critérios de Aceite
- [ ] Receita MTD mostra valor correto baseado em títulos de receita liquidados no mês
- [ ] Burn Rate calcula média dos últimos 3 meses de despesas
- [ ] Margem calcula corretamente e trata divisão por zero
- [ ] Break-even identifica threshold de despesas fixas
- [ ] Runway usa caixa real (manual) quando disponível
- [ ] Cards com tooltip explicando a fórmula de cálculo (ícone ⓘ)
- [ ] Empty states informativos quando dados são insuficientes

---

## Melhoria #3 — Fluxo de Caixa Projetado (Gráfico de Linha)

### Problema
Não existe visualização temporal de entradas vs. saídas. O "Caixa Previsto 30d" é um número estático.

### Schema
Não precisa de tabela nova — usa dados de `titulos` (AR/AP com vencimento futuro) + `cash_balances`.

### Lógica
```
Para cada dia D nos próximos N dias:
  saldo[D] = saldo[D-1] 
    + soma(titulos WHERE tipo='receita' AND vencimento=D AND status='previsto')
    - soma(titulos WHERE tipo='despesa' AND vencimento=D AND status='previsto')

saldo[0] = cash_balances.amount (mais recente) OU caixa_omie (fallback)
```

### Componentes
- `CashFlowChart` — Recharts AreaChart
  - Eixo X: dias (próximos N dias)
  - Eixo Y: saldo acumulado projetado
  - Área verde acima do threshold, vermelha abaixo
  - Linha horizontal vermelha tracejada = threshold de segurança (1x burn rate, configurável)
  - Tooltip: data, saldo projetado, entradas do dia, saídas do dia
- Toggle: 30d / 60d / 90d (SegmentedControl ou Tabs)
- Threshold configurável via settings (default = 1 mês de burn rate)

### Critérios de Aceite
- [ ] Gráfico renderiza com dados reais de AR/AP
- [ ] Ponto inicial = caixa real (manual)
- [ ] Toggle 30/60/90 dias funciona
- [ ] Threshold visual aparece como linha tracejada
- [ ] Área em vermelho quando cruza threshold
- [ ] Tooltip com breakdown por dia
- [ ] Loading skeleton no formato do gráfico
- [ ] Empty state se não houver títulos futuros

---

## Melhoria #4 — Enriquecer Dados das Transações

### Problema
Todas as transações exibem "Conta a pagar" como descrição e "—" como contraparte. Os campos existem no Omie mas não estão sendo persistidos.

### Ação
1. Auditar o payload do webhook/sync Omie — identificar campos: `nome_fornecedor`, `nome_cliente`, `descricao`, `categoria`, `centro_custo`, `numero_documento`
2. Atualizar a função de sync para mapear e persistir esses campos na tabela `titulos`
3. Criar migration para adicionar colunas (se não existirem):

```sql
ALTER TABLE public.titulos
  ADD COLUMN IF NOT EXISTS contraparte_nome TEXT,
  ADD COLUMN IF NOT EXISTS descricao_detalhada TEXT,
  ADD COLUMN IF NOT EXISTS categoria TEXT,
  ADD COLUMN IF NOT EXISTS centro_custo TEXT,
  ADD COLUMN IF NOT EXISTS numero_documento TEXT;
```

4. Re-sync dos títulos existentes para preencher retroativamente
5. Atualizar a tabela no frontend para exibir os novos campos

### UI da Tabela (atualizada)
| Data | Tipo | Descrição | Contraparte | Categoria | Valor | Vencimento | Status |
|------|------|-----------|-------------|-----------|-------|------------|--------|

- Badge colorido para categoria
- Contraparte com nome real do fornecedor/cliente
- Descrição detalhada (truncada com tooltip no hover)

### Critérios de Aceite
- [ ] Sync Omie persiste todos os campos adicionais
- [ ] Tabela mostra contraparte real (não "—")
- [ ] Tabela mostra descrição detalhada (não genérico "Conta a pagar")
- [ ] Badge de categoria com cor diferenciada
- [ ] Retroativo: títulos existentes atualizados via re-sync

---

## Melhoria #5 — Classificação por Centro de Custo

### Problema
Não existe filtro ou agrupamento por centro de custo no dashboard.

### Schema

```sql
-- Enum de centros de custo
CREATE TYPE cost_center AS ENUM (
  'infraestrutura_operacao',
  'financeiro_encargos',
  'projetos_producao',
  'passivo_giro',
  'outros'
);

-- Se a coluna centro_custo já existir como TEXT (melhoria #4), converter:
ALTER TABLE public.titulos
  ALTER COLUMN centro_custo TYPE cost_center
  USING centro_custo::cost_center;
```

Labels PT-BR:
- `infraestrutura_operacao` → "Infraestrutura & Operação"
- `financeiro_encargos` → "Financeiro & Encargos"
- `projetos_producao` → "Projetos & Produção"
- `passivo_giro` → "Passivo de Giro"
- `outros` → "Outros"

### Componentes

**Tela Transações:**
- Dropdown de filtro por centro de custo (shadcn Select, multi-select)
- Badge na tabela com cor por centro de custo

**Tela Estratégico:**
- `CostCenterDistribution` — Recharts PieChart (donut)
  - Mostra % de despesas por centro de custo no período
  - Tooltip: nome do centro, valor absoluto, % do total
  - Legend abaixo do gráfico

### Mapeamento
- Se o Omie envia centro de custo no payload: mapear automaticamente
- Se não: permitir classificação manual via dropdown inline na tabela de transações (salva no Supabase via optimistic update)

### Critérios de Aceite
- [ ] Filtro funciona na tela de transações
- [ ] Donut chart na tela estratégico com dados reais
- [ ] Classificação manual possível quando Omie não envia
- [ ] Labels em PT-BR com acentuação
- [ ] Cores consistentes entre filtro, badges e gráfico

---

## Melhoria #6 — Orçado vs. Realizado

### Schema

```sql
CREATE TABLE IF NOT EXISTS public.budget_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  revenue_target NUMERIC(15,2) NOT NULL DEFAULT 0,
  expense_target NUMERIC(15,2) NOT NULL DEFAULT 0,
  ebitda_target_pct NUMERIC(5,2) NOT NULL DEFAULT 30.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(year, month)
);

ALTER TABLE public.budget_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "founders_manage_budget"
  ON public.budget_targets FOR ALL
  USING (auth.uid() IS NOT NULL);
```

### Configuração
- Tela de settings (acessível via ⚙️ no card): stepper para definir budget
- Default 2026: receita = R$1.250.000 / 12 = ~R$104.167/mês, EBITDA 30%
- Opção de distribuir anual igualmente ou customizar por mês

### Componentes
- `BudgetVsActualChart` — Recharts BarChart agrupado
  - Barras azuis = orçado, verdes = realizado (se acima), vermelhas = realizado (se abaixo)
  - Eixo X = meses do ano
  - Mostrar variação % como label acima de cada barra
- `BudgetSettingsModal` — stepper: Ano → Receita anual → Distribuição por mês → EBITDA target → Confirmar
- Toggle: Receita / Despesa / EBITDA
- Acumulado YTD como linha sobreposta (opcional)

### Critérios de Aceite
- [ ] Budget configurável por mês
- [ ] Gráfico compara orçado vs. realizado
- [ ] Variação % visível
- [ ] Cores diferenciam acima/abaixo da meta
- [ ] Dados default para 2026 pré-populados
- [ ] Filtro de período funciona

---

## Melhoria #7 — Aging de Inadimplência com Faixas

### Problema
Os alertas estratégicos listam recebíveis atrasados sem diferenciação por gravidade.

### Lógica de Faixas
```
dias_atraso = CURRENT_DATE - vencimento

🟡 1-30 dias
🟠 31-60 dias  
🔴 61-90 dias
⚫ 90+ dias → sinalizar como "Provisão de Perda"
```

### Componentes

**Substituir a lista flat por:**
- `AgingDashboard` — card resumo no topo:
  - Total inadimplente
  - % sobre faturamento do período
  - Mini barras horizontais por faixa (proporção visual)
- `AgingGroup` — agrupamento por faixa:
  - Header: cor + label da faixa + quantidade + valor total
  - Items dentro de cada grupo (expandível)
  - Badge "Provisão" para 90+ dias
- Manter botão "Cobrar Cliente" em cada item
- Títulos 90+ não entram (ou entram com peso reduzido) no forecast de receita

### View Supabase (sugerida)
```sql
CREATE OR REPLACE VIEW public.aging_receivables AS
SELECT
  t.*,
  (CURRENT_DATE - t.vencimento) AS dias_atraso,
  CASE
    WHEN (CURRENT_DATE - t.vencimento) BETWEEN 1 AND 30 THEN '1-30'
    WHEN (CURRENT_DATE - t.vencimento) BETWEEN 31 AND 60 THEN '31-60'
    WHEN (CURRENT_DATE - t.vencimento) BETWEEN 61 AND 90 THEN '61-90'
    WHEN (CURRENT_DATE - t.vencimento) > 90 THEN '90+'
    ELSE 'em_dia'
  END AS faixa_aging
FROM public.titulos t
WHERE t.tipo = 'receita'
  AND t.status = 'previsto'
  AND t.vencimento < CURRENT_DATE;
```

### Critérios de Aceite
- [ ] Agrupamento por faixas com cores distintas
- [ ] Card resumo com total e % sobre faturamento
- [ ] Badge "Provisão" em 90+ dias
- [ ] Botão "Cobrar Cliente" mantido
- [ ] Forecast de receita exclui ou reduz títulos 90+

---

## Melhoria #8 — DRE Simplificado Mensal

### Problema
Não existe visão de P&L (Profit & Loss).

### Estrutura do DRE
```
(+) Receita Bruta
(-) Impostos (% configurável, default 15%)
(=) Receita Líquida
(-) Custos Diretos (centro_custo = 'projetos_producao')
(=) Margem Bruta
(-) Overhead (centro_custo IN ('infraestrutura_operacao', 'financeiro_encargos'))
(=) Resultado Operacional (EBITDA)
    Margem EBITDA %
```

### Schema

```sql
CREATE TABLE IF NOT EXISTS public.dre_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 15.0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);
```

### Componentes
- `DreTable` — tabela com colunas = últimos 6 meses + mês atual
  - Cada linha = item do DRE
  - Cada célula: valor + variação % vs. mês anterior (badge verde/vermelho)
  - Linhas de subtotal (Receita Líquida, Margem Bruta, EBITDA) com fundo diferenciado
- `DreSettingsModal` — configuração da taxa de impostos
- Dados derivados automaticamente de `titulos` classificados por `centro_custo`

### Dependência
Requer Melhoria #5 (centro de custo) para funcionar corretamente.

### Critérios de Aceite
- [ ] DRE renderiza com dados reais
- [ ] 7 colunas (6 meses anteriores + mês atual)
- [ ] Variação % mês a mês
- [ ] Taxa de impostos configurável
- [ ] Linhas de subtotal destacadas
- [ ] Trata meses sem dados (mostra "—")

---

## Melhoria #9 — Concentração de Receita por Cliente

### Problema
Não existe indicador de risco de dependência de clientes.

### Lógica
```sql
SELECT
  contraparte_nome,
  SUM(valor) as total,
  SUM(valor) / (SELECT SUM(valor) FROM titulos WHERE tipo='receita' AND ...) * 100 as pct
FROM titulos
WHERE tipo = 'receita'
  AND status IN ('liquidado', 'pago')
  AND data_competencia BETWEEN :start AND :end
GROUP BY contraparte_nome
ORDER BY total DESC
LIMIT 5;
```

### Componentes
- `RevenueConcentrationChart` — Recharts BarChart horizontal
  - Top 5 clientes por receita no período
  - Label: nome do cliente + % do total
  - Badge de alerta:
    - 🟡 > 30% → "Alta concentração"
    - 🔴 > 50% → "Risco crítico"
  - Tooltip: nome, valor absoluto, %, quantidade de projetos
- Período segue o filtro global (MTD / QTD / YTD)

### Dependência
Requer Melhoria #4 (contraparte_nome populado) para funcionar.

### Critérios de Aceite
- [ ] Top 5 clientes renderiza corretamente
- [ ] % calculado sobre receita total do período
- [ ] Alertas visuais para concentração > 30% e > 50%
- [ ] Tooltip com detalhes completos
- [ ] Responde ao filtro temporal global
- [ ] Empty state se não houver dados de contraparte

---

## Melhoria #10 — Filtro Temporal Unificado + Gap AR vs. AP em Valor

### Problema
A tela de Transações não tem filtro de período. Os cards "A Receber: 100 / A Pagar: 500" mostram quantidade, não valor.

### Componentes

**Filtro temporal (tela Transações):**
- `DateRangeFilter` — shadcn DatePickerWithRange
- Presets: Hoje, 7d, 30d, Mês atual, Mês anterior, Custom
- Todos os dados da tela (tabela + cards) reagem ao filtro
- Persiste a seleção no URL (query params) para compartilhamento

**Cards atualizados:**
```
A Receber          A Pagar           Gap (AR - AP)
100 títulos        500 títulos       —
R$ 250.716         R$ 130.897        R$ 119.819
```

- Card "Gap": verde se positivo, vermelho se negativo
- Tooltip no Gap: "Diferença entre total a receber e total a pagar no período"

### Critérios de Aceite
- [ ] DateRangeFilter renderiza com presets funcionais
- [ ] Tabela filtra por período selecionado
- [ ] Cards mostram quantidade + valor em R$
- [ ] Novo card Gap com cor condicional
- [ ] Presets funcionam corretamente
- [ ] Filtro persiste via URL query params
- [ ] Loading state durante filtro
