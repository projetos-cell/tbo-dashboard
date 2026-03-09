---
description: Rules for external integrations (OMIE, RD Station, Fireflies)
globs: ["**/integrations/**", "**/services/**", "**/*omie*", "**/*rdstation*", "**/*fireflies*", "**/*sync*"]
---

# Integration Rules

## OMIE (ERP)
- Direction: OMIE -> TBO OS (read) + TBO OS -> OMIE (limited write)
- Feeds: Receita & Caixa, DRE, Fluxo de Caixa
- Sync: faturas, clientes, contas a pagar/receber, fluxo de caixa

## RD Station (CRM/Marketing)
- Direction: Unidirectional (RD Station → TBO OS)
- Feeds: Pipeline, ROI Comercial, Intelligence
- Sync: leads, pipeline stages, conversoes

## Fireflies (Transcricao)
- Direction: Fireflies -> TBO OS (read only)
- Feeds: 1:1s module, Action Items, PDI
- Sync: meeting transcriptions

## Implementation Pattern
- ALWAYS error handling + retry (3 attempts with exponential backoff)
- ALWAYS show sync status badge (synced/syncing/error/stale)
- ALWAYS fallback UI if integration is offline
- ALWAYS log sync errors for debugging
- Use Supabase Edge Functions for sync workers
- Store sync metadata: last_sync, status, error_message, records_synced
