# TBO OS — Audit Log

## Ciclo — 2026-03-12 (auto) — Ciclo 2

**Módulo**: Tarefas (`features/tasks`)
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou antes e depois de todas as mudanças

### Estado do módulo

| Funcionalidade                       | Antes | Depois | Detalhes |
|--------------------------------------|-------|--------|----------|
| Build (cache corrompido)             | 🔧    | ✅     | `tsconfig.tsbuildinfo` corrompido causava falso "module not found"; resolvido limpando cache |
| `task-detail-fields.tsx` — ícones    | 🔧    | ✅     | Substituídos 4 ícones lucide-react por Tabler equivalentes |
| `my-tasks-list-view.tsx` — tamanho  | ⚠️    | ✅     | 648 → 358 linhas (-45%) via 2 extrações |
| Lógica sort/filter/group             | ⚠️    | ✅     | Movida para `lib/my-tasks-utils.ts` (testável, reutilizável) |
| Lógica DnD/sections                  | ⚠️    | ✅     | Movida para `hooks/use-section-dnd.ts` |
| Colaboradores de tarefa              | ❌    | ✅     | picker + lista + hook com optimistic update |

### Implementado

- fix: resolver build com tsconfig.tsbuildinfo corrompido
- fix: substituir lucide-react por Tabler Icons em task-detail-fields.tsx
- refactor: extrair compareTasks/applyFilters/groupTasksDynamic → my-tasks-utils.ts
- refactor: extrair DnD + sections CRUD + undo → use-section-dnd.ts
- feat: TaskCollaboratorsList + TaskCollaboratorPicker + useTaskCollaborators + task-collaborators service

### Migrations aplicadas

Nenhuma neste ciclo — `task_collaborators` já existia no schema.

### Próximo ciclo (sugestões)

- `task-detail.tsx` (744 linhas) está **orphaned** — nenhum import encontrado. Candidato a remoção após confirmação do usuário
- Dividir `my-tasks-toolbar.tsx` (389 linhas) — ainda acima do limite
- Dividir `my-task-table-row.tsx` (325 linhas)
- Calendar View — ainda placeholder "em breve"
- Realtime subscription no task detail (comments/activity ao vivo)

### Debt técnico

- `task-detail.tsx` é dead code (nenhum componente o importa); não deletado sem confirmação explícita
- `my-tasks-toolbar.tsx` e `my-task-table-row.tsx` ainda acima de 200 linhas

---

## Ciclo — 2026-03-12 (auto) — Ciclo 1

**Módulo**: Tarefas (`features/tasks`)
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou antes e depois das mudanças

### Estado do módulo

| Funcionalidade              | Antes  | Depois | Detalhes |
|-----------------------------|--------|--------|----------|
| Botão "Copiar link"         | 🔧     | ✅     | Copia `origin + pathname + ?task=ID`, exibe toast |
| Botão "Mais opções"         | 🔧     | ✅     | DropdownMenu com "Copiar link" e "Excluir tarefa" |
| Botões ThumbsUp/Paperclip   | 🔧     | removido | Removidos da barra (não tinham caso de uso real no header) |
| Adicionar subtarefa         | 🔧     | ✅     | Input inline com Enter/Escape/blur, autofocus |
| Excluir subtarefa           | ❌     | ✅     | Botão X no hover de cada subtarefa |
| Error toast — delete tarefa | ❌     | ✅     | Toast destructive + rollback de estado |
| Error toast — criar subtarefa | ❌   | ✅     | Toast destructive on error |

### Implementado

- feat: copy link handler com clipboard API + toast (task-detail.tsx)
- feat: more menu com DropdownMenu shadcn (task-detail.tsx)
- feat: inline subtask create com estado temporário e autoFocus (task-detail.tsx)
- feat: subtask delete com hover button + error handling (task-detail.tsx)
- feat: error toasts em todas as operações destrutivas (task-detail.tsx)

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- Dividir `task-detail.tsx` (agora ~680 linhas) em sub-componentes
- Dividir `my-tasks-list-view.tsx` (648 linhas) — maior componente do módulo
- Implementar Calendar View (atualmente placeholder "em breve")
- Realtime subscription para task detail (comments, activity em tempo real)

### Debt técnico

- `task-detail.tsx` ainda acima de 200 linhas (escopo maior, será ciclo futuro)
- Botões Curtir (ThumbsUp) e Anexar (Paperclip) foram removidos do header —
  recurso ainda sem serviço implementado; retornar quando likes/attachments tiverem backend
