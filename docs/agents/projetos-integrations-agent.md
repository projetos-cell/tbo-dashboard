# Agente 9 — Projetos Integrations

## Escopo
Saúde das integrações do módulo de projetos: Google Drive, Templates, Intake Forms,
3D Pipeline, Custom Fields, Rules Engine.

## Subsistemas

### Google Drive Integration
```
Arquivo: services/google-drive.ts (27L)
Status: Mínimo — apenas createFolder e error logging

□ Sync bidirecional de arquivos funcional?
□ Retry com exponential backoff?
□ Status badge (synced/syncing/error)?
□ Fallback quando offline?
□ File versioning?
□ Permission sync?
```

### Template System
```
Arquivo: services/project-templates.ts (400L)
Componente: template-selector.tsx (88L)
Rota: /projetos/templates (184L)

□ Templates predefinidos funcionais?
□ Criar template a partir de projeto existente?
□ Aplicar template preserva custom fields?
□ Template inclui sections + tasks?
□ Bulk task creation a partir de template?
□ Preview antes de aplicar?
```

### Intake Forms
```
Arquivo: services/intake-forms.ts (96L)
Componente: project-intake.tsx (427L)
Settings: settings-intake-form.tsx (176L)

□ Form builder funcional?
□ Campos condicionais?
□ Validação Zod?
□ Submissão gera projeto automaticamente?
□ Notificação de nova submissão?
□ Histórico de submissões?
```

### 3D Pipeline (D3D)
```
Diretório: d3d-pipeline/ (6 arquivos)
Rota: /projetos/fluxo-3d (375L)

□ Stages customizáveis?
□ Gates com critérios?
□ Progresso visual por stage?
□ Timeline de progresso?
□ Imagens/renders por stage?
□ Status transitions com validação?
```

### Custom Fields
```
Serviço: services/custom-fields.ts (222L, 3x `any`)
Hook: hooks/use-custom-fields.ts (139L)
Componentes: 8 editors dedicados

□ Todos os 18 tipos suportados?
□ Validação por tipo?
□ Inline editing?
□ Filter por custom field?
□ Sort por custom field?
□ Export com custom fields?
```

### Rules Engine
```
Componente: settings-rules-engine.tsx (123L)

□ Automações trigger → action?
□ Condições compostas (AND/OR)?
□ Ações: assignee, status, tag, notification?
□ Ativação/desativação?
□ Log de execução?
```

## Output
Health score por subsistema + gaps de funcionalidade + priorização de implementação.
