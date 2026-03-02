#!/bin/bash
# ============================================================
# TBO OS — Claude Code Overnight QA Loop
# ============================================================
#
# COMO USAR:
#   cd /caminho/para/tbo-os
#   bash run-qa-overnight.sh
#
# O que acontece:
#   1. Claude Code entra em modo sem supervisão
#   2. Executa loop de QA (audit → fix → review → repeat)
#   3. Para quando: score 85+ / estabilizou / 5 ciclos
#   4. Commits + push automático ao finalizar o loop
#
# PRÉ-REQUISITOS:
#   - Claude Code instalado (claude CLI disponível)
#   - Estar na raiz do projeto TBO OS
#   - git status limpo
#
# ============================================================

set -e

# Verificações
if [ ! -f "package.json" ]; then
  echo "❌ Execute da raiz do TBO OS"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Working tree sujo. Fazendo stash..."
  git stash push -m "pre-qa-overnight-$(date +%Y%m%d)"
fi

echo "🌙 Iniciando QA Loop Overnight — $(date)"
echo "   Branch será criada: qa-loop-$(date +%Y-%m-%d)-overnight"
echo "   Safety cap: 5 ciclos"
echo "   Target: score 85+"
echo ""
echo "💤 Pode ir dormir. Revise de manhã."
echo "============================================================"
echo ""

# Executa Claude Code sem supervisão
claude --dangerously-skip-permissions -p "

Você vai executar um LOOP CONTÍNUO de QA no TBO OS.
Trabalhe 100% autônomo — zero confirmações. Erros: resolva ou documente e siga.

# REGRAS DO LOOP
- Cada iteração = 1 CICLO. Máximo 5 CICLOS.
- PARAR quando: score >= 85 / score não subiu entre 2 ciclos / 5 ciclos / build irrecuperável.
- Ciclo N+1 audita e revisa os fixes do ciclo N (self-review).

# SETUP (1x)
1. git checkout -b qa-loop-$(date +%Y-%m-%d)-overnight
2. npm install (se necessário)
3. Leia docs/qa-report.md → registre SCORE_INICIAL
4. CICLO = 1

# LOOP (repete até parada)

## 1 — Audit (6 camadas em src/)
Escaneie TODOS os arquivos:
- TypeScript: any, @ts-ignore, as any, missing interfaces
- Components: sem error boundary, sem loading/empty state, props sem tipo
- Data: queries Supabase sem try/catch, sem validação de retorno
- A11y: img sem alt, button sem aria-label, input sem label
- Arquitetura: imports circulares, violação de module boundaries
- Perf/Security: console.log, secrets hardcoded, re-renders

Se CICLO > 1: foque nos arquivos do ciclo anterior. Verifique se fixes anteriores realmente funcionaram e não criaram problemas novos.

Registre cada finding: arquivo, linha, severidade (CRIT/ARCH/WARN/INFO), descrição.

## 2 — Score
Score = 100 - (CRIT×3 + ARCH×2 + WARN×1 + INFO×0.25). Mínimo 0.

## 3 — Check Parada
- Score >= 85 → PARAR
- CICLO > 1 e score <= score anterior → PARAR (estabilizou)
- CICLO >= 5 → PARAR
- Senão → continuar

## 4 — Priorizar
Ordem: CRIT sistêmicos → CRIT individuais → ARCH sistêmicos → ARCH individuais → WARN sistêmicos.
Budget: máximo 30 arquivos por ciclo.
Use componentes shared existentes: RBACGuard, ErrorState, EmptyState.

## 5 — Implementar
- Fixes na ordem de prioridade
- A cada 10 arquivos: npx tsc --noEmit
- Se TS quebrar: revert APENAS fixes problemáticos, mantenha os que passaram
- NUNCA modifique: .env*, next.config.*, package.json, middleware.ts
- NUNCA delete funcionalidade existente

## 6 — Validar
1. npx tsc --noEmit (DEVE passar)
2. npm run lint (registre)
3. npm run build (se disponível)
Se falhar: reverta fixes problemáticos, documente, mantenha os bons.

## 7 — Commit
git add -A && git commit -m 'chore(qa): ciclo {N} — score {ANTES}→{DEPOIS} (+{DELTA})'

## 8 — Loop
CICLO += 1 → volte ao passo 1.

# FINALIZAÇÃO

1. Atualize docs/qa-report.md com relatório completo:
   - Ciclos executados, motivo da parada
   - Score INICIAL → FINAL (+TOTAL pts)
   - Detalhamento por ciclo (score, foco, arquivos, findings)
   - Findings remanescentes agrupados por severidade
   - Próximos passos e estimativa para atingir 85+

2. Crie/atualize .antigravity/qa-execution-log.json com entrada desta execução.

3. git add -A && git commit -m 'docs(qa): overnight loop report — {N} ciclos, score {INICIAL}→{FINAL}'

4. git push -u origin qa-loop-$(date +%Y-%m-%d)-overnight

5. Escreva um resumo final no terminal:
   Score: X → Y em N ciclos
   Top 5 melhorias
   Top 5 pendências
   Recomendação

Comece agora. Metodicamente, fase por fase. Não pule. Não pare.
"

echo ""
echo "============================================================"
echo "✅ QA Loop finalizado — $(date)"
echo "   Revise: git log --oneline -10"
echo "   Report: cat docs/qa-report.md"
echo "============================================================"
