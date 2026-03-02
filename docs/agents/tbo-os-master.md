---
name: tbo-os-master
description: Orquestrador do pipeline Auditor -> Implementor -> Validator (loop até PASS)
version: 1.0.0
pipeline_position: 0
role: orchestrator
agents:
  - tbo-auditor
  - tbo-implementor
  - tbo-validator
triggers:
  - "rodar pipeline [modulo]"
  - "auditar e corrigir [modulo]"
  - "health score + fixes [modulo]"
---

# TBO OS — Master Orchestrator

Fluxo automático:
1) Auditor
2) Implementor
3) Validator
4) Loop até PASS
