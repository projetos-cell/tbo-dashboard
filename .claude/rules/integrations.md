---
description: Rules for external integrations (OMIE, Fireflies)
globs: ["**/integrations/**", "**/services/**", "**/*omie*", "**/*fireflies*", "**/*sync*"]
---

# Integration Rules

## OMIE (ERP)
- Direction: OMIE -> TBO OS (read) + TBO OS -> OMIE (limited write)
- Feeds: Receita & Caixa, DRE, Fluxo de Caixa
- Sync: faturas, clientes, contas a pagar/receber, fluxo de caixa

## Fireflies (Transcricao)
- Direction: Fireflies -> TBO OS (read only)
- Feeds: 1:1s module, Action Items, PDI
- Sync: meeting transcriptions

## CRM (Nativo)
- Dados migrados do RD Station para Supabase (2026-03-20)
- Tabelas: crm_deals, crm_deal_activities, rd_pipelines, crm_stages
- SEM dependencia externa — tudo no Supabase
- Pipeline kanban funciona direto contra crm_deals

## Implementation Pattern
- ALWAYS error handling + retry (3 attempts with exponential backoff)
- ALWAYS show sync status badge (synced/syncing/error/stale)
- ALWAYS fallback UI if integration is offline
- ALWAYS log sync errors for debugging
- Use Supabase Edge Functions for sync workers
- Store sync metadata: last_sync, status, error_message, records_synced
