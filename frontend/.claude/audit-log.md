## Ciclo — 2026-03-13 Ciclo 4

**Módulo**: Tarefas
**Branch**: claude/improve-20260312-auto
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| task-detail-header botões | 🔧 (Lucide + sem handler) | ✅ | Tabler Icons + copy link funcional + delete com AlertDialog |
| Ícones Lucide (13 arquivos restantes) | ⚠️ | ✅ | 100% migrados para Tabler Icons no módulo |
| Subtarefas no TaskDetailSheet | ❌ (ausente) | ✅ | TaskSubtasksSection com progress bar, toggle, add e delete |

### Implementado

- fix: task-detail-header — Tabler Icons + handlers reais (copy link com toast, delete com AlertDialog de confirmação, passagem de onClose para fechar sheet após delete) (arquivos: task-detail-header.tsx, task-detail-sheet.tsx)
- refactor: migração Lucide → Tabler Icons em lote nos 13 componentes restantes: task-status-toggle, task-card, task-compact-list, task-filters, task-list, quick-add-task, task-assignee-picker, task-row-context-menu, my-task-row, my-tasks-board-view, my-tasks-column-config, my-tasks-section-row, my-tasks-table-header, inline-date-picker
- feat: TaskSubtasksSection — componente dedicado para subtarefas no TaskDetailSheet com: progress bar (completed/total), toggle de conclusão, add inline (Enter para criar, Esc para cancelar), delete com hover reveal (arquivos: task-subtasks-section.tsx, task-detail-sheet.tsx)

### Migrations aplicadas
- Nenhuma (módulo já tem migrations adequadas em 001_task_entities.sql)

### Próximo ciclo
- `task-detail.tsx` (arquivo obsoleto, não importado em lugar nenhum) — pode ser removido com segurança
- Seção de comentários não está no TaskDetailSheet (o CommentThread está no antigo task-detail.tsx mas não foi portado)
- O botão "Likes" no header ainda usa toast de placeholder — implementar hook real de likes
- Botão "Anexar" no header ainda usa toast de placeholder — implementar upload de anexos

### Debt técnico
- `task-detail.tsx` é um arquivo orphaned com 400+ linhas ainda usando Lucide — mantido por segurança mas deveria ser deletado no próximo ciclo
- Ícone `IconSelector` usado para `ChevronsUpDown` em task-assignee-picker (equivalente semântico, funciona)
