# Agente 7 — Projetos Task Subsystem

## Escopo
Qualidade e completude do subsistema de tarefas (114 arquivos, 15.4k linhas).

## Features Auditadas

### CRUD Completo
```
□ Create task (inline + form + dialog)
□ Read task (list, board, calendar, detail sheet)
□ Update task (inline edit, detail sheet, bulk)
□ Delete task (com confirmação, soft delete)
□ Subtasks CRUD (300L — task-subtasks-section.tsx)
□ Dependencies CRUD (task-dependencies-section.tsx)
□ Custom fields CRUD (8 componentes dedicados)
```

### Task Detail Sheet (274L)
```
□ Header com título editável inline
□ Status toggle funcional
□ Assignee picker (252L — verificar performance)
□ Collaborators list
□ Date range picker
□ Description editor (271L — rich text)
□ Subtasks section
□ Dependencies section
□ Custom fields section
□ Attachments section
□ History timeline (346L)
□ Comments com reactions
□ Follow/unfollow
□ Context menu (351L)
```

### Views de Tarefas
```
□ My Tasks — list view (167L) ✅
□ My Tasks — board view (221L) ✅
□ My Tasks — calendar view (222L) ✅
□ My Tasks — table body com D&D (241L) ✅
□ Project task board (35L — minimal controller)
□ Project task list (96L — lean wrapper)
□ Filtros persistentes por view?
□ Sort combinável?
□ Bulk actions (select multiple + action)?
```

### Optimistic Updates
```
□ use-task-mutations.ts (334L) — verificar rollback em cada mutation
□ use-section-dnd.ts (162L) — D&D com optimistic + undo
□ Status toggle — optimistic?
□ Assignee change — optimistic?
□ Priority change — optimistic?
□ Date change — optimistic?
```

### Gaps Conhecidos
- `use-task-history.ts` (13L) — stub, sem lógica real de fetch
- Task board no projeto (35L) — controller mínimo, delega tudo

## Output
Feature completeness matrix com ✅/⚠️/❌ por funcionalidade + lista de melhorias.
