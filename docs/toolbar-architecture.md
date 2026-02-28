# TBO OS — Arquitetura de Toolbars em 3 Niveis

## Sumario Executivo

O TBO OS hoje possui ~15 padroes diferentes de toolbar espalhados pelos modulos,
cada um com classes CSS proprias, layouts inconsistentes e zero reuso de logica.
Este documento propoe uma arquitetura unificada em 3 camadas que preserva a
flexibilidade por modulo mas garante consistencia visual e reutilizacao de codigo.

---

## 1. Modelo de 3 Niveis

```
+========================================================================+
|  GLOBAL TOOLBAR (fixa no topo — breadcrumb, busca global, user menu)   |
+========================================================================+
|  CONTEXT TOOLBAR (por rota — titulo, filtros, view toggle, tabs)       |
+------------------------------------------------------------------------+
|  ACTION TOOLBAR (condicional — selecao bulk, edicao inline, etc.)      |
+------------------------------------------------------------------------+
|                                                                        |
|                        CONTEUDO DO MODULO                              |
|                                                                        |
+------------------------------------------------------------------------+
```

| Nivel   | Posicao         | Visibilidade       | Responsabilidade                            |
|---------|-----------------|--------------------|--------------------------------------------|
| Global  | sticky top      | Sempre visivel     | Breadcrumb, busca global, notificacoes, user |
| Context | sticky abaixo   | Por rota/modulo    | Titulo, filtros, view mode, tabs, acoes     |
| Action  | condicional     | Ao selecionar itens| Bulk actions, confirmacao, edicao inline     |

---

## 2. Mapa de Rotas → Context Toolbar

### 2.1 Inicio

| Rota              | Modulo               | Context Toolbar         | Filtros                          | Views              | Acoes Primarias         |
|-------------------|----------------------|-------------------------|----------------------------------|--------------------|-----------------------|
| `#/dashboard`     | TBO_COMMAND_CENTER   | `DashboardToolbar`      | —                                | —                  | Personalizar           |
| `#/alerts`        | TBO_ALERTS           | `SimpleHeaderToolbar`   | —                                | —                  | Marcar lidas           |
| `#/inbox`         | TBO_INBOX            | `SimpleHeaderToolbar`   | —                                | —                  | —                      |

### 2.2 Projetos

| Rota              | Modulo               | Context Toolbar         | Filtros                                    | Views                  | Acoes Primarias         |
|-------------------|----------------------|-------------------------|--------------------------------------------|------------------------|-----------------------|
| `#/projetos`      | TBO_PROJETOS (QP)    | `ProjectsToolbar`       | search, status, BU, construtora            | Board, List, Gantt     | Density toggle         |
| `#/projeto/:id`   | TBO_PROJECT_DETAIL   | `DetailToolbar`         | —                                          | —                      | Editar, Status         |

### 2.3 Execucao

| Rota              | Modulo               | Context Toolbar         | Filtros                                    | Views              | Acoes Primarias         |
|-------------------|----------------------|-------------------------|--------------------------------------------|--------------------|-----------------------|
| `#/tarefas`       | TBO_TAREFAS          | `TasksToolbar`          | status, owner, project, priority, search   | List, Board        | + Nova Tarefa          |
| `#/reunioes`      | TBO_REUNIOES         | `MeetingsToolbar`       | search, category                           | Lista, Actions     | Sincronizar            |
| `#/agenda`        | TBO_AGENDA           | `SimpleHeaderToolbar`   | —                                          | —                  | —                      |

### 2.4 Producao

| Rota              | Modulo               | Context Toolbar         | Filtros                                    | Views              | Acoes Primarias         |
|-------------------|----------------------|-------------------------|--------------------------------------------|--------------------|-----------------------|
| `#/entregas`      | TBO_ENTREGAS         | `DeliverablesToolbar`   | status (tabs)                              | Table              | —                      |
| `#/revisoes`      | TBO_REVISOES         | `SimpleHeaderToolbar`   | —                                          | —                  | —                      |
| `#/portal-cliente` | TBO_PORTAL_CLIENTE  | `SimpleHeaderToolbar`   | —                                          | —                  | —                      |

### 2.5 Comercial

| Rota                       | Modulo                      | Context Toolbar        | Filtros                          | Views              | Acoes Primarias        |
|----------------------------|-----------------------------|------------------------|----------------------------------|--------------------|-----------------------|
| `#/pipeline`               | TBO_PIPELINE                | `PipelineToolbar`      | —                                | Kanban, Tabela     | + Novo Deal            |
| `#/comercial`              | TBO_COMERCIAL               | `TabbedToolbar`        | owner, service, search           | Multi-tab          | —                      |
| `#/clientes`               | TBO_CLIENTES                | `ClientsToolbar`       | crm_status (pills), search       | Grid               | + Novo Cliente         |
| `#/inteligencia`           | TBO_INTELIGENCIA            | `SimpleHeaderToolbar`  | —                                | —                  | —                      |
| `#/inteligencia-imobiliaria`| TBO_INTELIGENCIA_IMOBILIARIA| `SimpleHeaderToolbar` | —                                | —                  | —                      |
| `#/mercado`                | TBO_MERCADO                 | `SimpleHeaderToolbar`  | —                                | —                  | —                      |

### 2.6 Financeiro

| Rota                    | Modulo                    | Context Toolbar        | Filtros                         | Views       | Acoes Primarias        |
|-------------------------|---------------------------|------------------------|---------------------------------|-------------|-----------------------|
| `#/financeiro`          | TBO_FINANCEIRO            | `FinanceToolbar`       | status, center, client, search  | Multi-tab   | Atualizar              |
| `#/pagar`               | TBO_PAGAR                 | `TabbedToolbar`        | —                               | Multi-tab   | —                      |
| `#/receber`             | TBO_RECEBER               | `TabbedToolbar`        | —                               | Multi-tab   | —                      |
| `#/margens`             | TBO_MARGENS               | `SimpleHeaderToolbar`  | —                               | —           | —                      |
| `#/conciliacao`         | TBO_CONCILIACAO           | `SimpleHeaderToolbar`  | —                               | —           | —                      |
| `#/conciliacao-bancaria`| TBO_CONCILIACAO_BANCARIA  | `SimpleHeaderToolbar`  | —                               | —           | —                      |

### 2.7 Pessoas

| Rota          | Modulo       | Context Toolbar     | Filtros            | Views                 | Acoes Primarias  |
|---------------|-------------|---------------------|--------------------|-----------------------|-----------------|
| `#/rh`        | TBO_RH      | `PeopleToolbar`     | BU, search         | Multi-tab, Organo     | —                |
| `#/cultura`   | TBO_CULTURA | `SimpleHeaderToolbar`| —                 | —                     | —                |
| `#/people/:id`| TBO_PEOPLE_PROFILE | `DetailToolbar` | —              | —                     | Editar           |

### 2.8 Sistema & Outros

| Rota                | Modulo                 | Context Toolbar       | Filtros  | Views  | Acoes Primarias  |
|---------------------|------------------------|-----------------------|----------|--------|-----------------|
| `#/admin-portal`    | TBO_ADMIN_PORTAL       | `AdminToolbar`        | —        | tabs   | —                |
| `#/permissoes-config`| TBO_PERMISSOES_CONFIG | `SimpleHeaderToolbar` | —        | —      | —                |
| `#/integracoes`     | TBO_INTEGRACOES        | `SimpleHeaderToolbar` | —        | —      | —                |
| `#/configuracoes`   | TBO_CONFIGURACOES      | `SimpleHeaderToolbar` | —        | —      | —                |
| `#/changelog`       | TBO_CHANGELOG          | `SimpleHeaderToolbar` | —        | —      | —                |
| `#/system-health`   | TBO_SYSTEM_HEALTH      | `SimpleHeaderToolbar` | —        | —      | —                |
| `#/conteudo`        | TBO_CONTEUDO           | `TabbedToolbar`       | —        | tabs   | —                |
| `#/contratos`       | TBO_CONTRATOS          | `ContractsToolbar`    | search, status | —  | + Novo           |
| `#/decisoes`        | TBO_DECISOES           | `SimpleHeaderToolbar` | —        | —      | —                |
| `#/templates`       | TBO_TEMPLATES          | `SimpleHeaderToolbar` | —        | —      | —                |
| `#/rsm`             | TBO_RSM                | `SimpleHeaderToolbar` | —        | —      | —                |
| `#/relatorios`      | TBO_RELATORIOS         | `SimpleHeaderToolbar` | —        | —      | Gerar            |
| `#/page/:id`        | TBO_PAGE_EDITOR        | `EditorToolbar`       | —        | —      | Salvar, Publicar |

---

## 3. UI Contract — ToolbarState Types

```javascript
// ═══════════════════════════════════════════════════════════════════════
// src/ui/toolbar/types.js — Toolbar State Contracts (JSDoc for Vanilla JS)
// ═══════════════════════════════════════════════════════════════════════

/**
 * @typedef {'text' | 'select' | 'multi-select' | 'date-range' | 'pills'} FilterType
 */

/**
 * @typedef {Object} FilterOption
 * @property {string} value     — valor interno (ex: 'em_andamento')
 * @property {string} label     — label exibido (ex: 'Em Andamento')
 * @property {string} [icon]    — lucide icon name opcional
 * @property {string} [color]   — cor hex para pills/badges
 * @property {number} [count]   — contagem para exibir no badge
 */

/**
 * @typedef {Object} FilterDefinition
 * @property {string}         id          — identificador unico (ex: 'status', 'bu')
 * @property {FilterType}     type        — tipo de controle UI
 * @property {string}         label       — placeholder ou label visivel
 * @property {string}         [icon]      — lucide icon no prefix
 * @property {FilterOption[]} [options]   — opcoes para select/pills (pode ser dinamico)
 * @property {string|string[]} value      — valor atual selecionado
 * @property {string|string[]} defaultValue — valor padrao (reset)
 * @property {boolean}        [multiple]  — permite multi-selecao
 * @property {boolean}        [searchable] — habilita busca dentro do dropdown
 * @property {number}         [debounceMs] — debounce para text inputs (default 300)
 */

/**
 * @typedef {Object} ViewMode
 * @property {string} id      — identificador (ex: 'board', 'list', 'gantt')
 * @property {string} label   — label visivel
 * @property {string} icon    — lucide icon name
 */

/**
 * @typedef {Object} TabDefinition
 * @property {string} id      — identificador unico do tab (ex: 'tf-todas')
 * @property {string} label   — texto exibido
 * @property {string} [icon]  — lucide icon name
 * @property {number} [count] — badge com contagem
 * @property {boolean} [hidden] — ocultar condicionalmente
 */

/**
 * @typedef {Object} ActionDefinition
 * @property {string}   id        — identificador (ex: 'create', 'export')
 * @property {string}   label     — texto do botao
 * @property {string}   [icon]    — lucide icon name
 * @property {'primary' | 'secondary' | 'ghost' | 'danger'} variant — estilo visual
 * @property {'sm' | 'md'} [size] — tamanho (default 'sm')
 * @property {Function} onClick   — callback
 * @property {boolean}  [disabled] — desabilitar condicionalmente
 * @property {string}   [tooltip] — tooltip text
 * @property {string[]} [roles]   — RBAC — roles permitidos (vazio = todos)
 */

/**
 * @typedef {Object} BulkActionDefinition
 * @property {string}   id        — identificador (ex: 'bulk-delete', 'bulk-move')
 * @property {string}   label     — texto do botao
 * @property {string}   [icon]    — lucide icon
 * @property {'primary' | 'danger' | 'secondary'} variant
 * @property {Function} onClick   — recebe array de selectedIds
 * @property {boolean}  [confirm] — exigir confirmacao antes de executar
 * @property {string}   [confirmMessage] — mensagem de confirmacao
 */

// ═══════════════════════════════════════════════════════════════════════
// TOOLBAR STATE — Estado completo de uma Context Toolbar
// ═══════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} ContextToolbarState
 * @property {string}              moduleId      — id do modulo (ex: 'projetos')
 * @property {string}              title         — titulo exibido
 * @property {string}              [icon]        — lucide icon do titulo
 * @property {string}              [subtitle]    — subtitulo ou descricao curta
 *
 * @property {FilterDefinition[]}  filters       — array de filtros ativos
 * @property {Object<string, any>} filterValues  — mapa { filterId: currentValue }
 *
 * @property {ViewMode[]}          viewModes     — opcoes de view (se modulo suporta)
 * @property {string}              activeView    — id do view mode ativo
 *
 * @property {TabDefinition[]}     tabs          — tabs se toolbar usar tabs
 * @property {string}              activeTab     — id do tab ativo
 *
 * @property {ActionDefinition[]}  actions       — botoes de acao no header
 *
 * @property {Function}            onFilterChange — callback(filterId, newValue)
 * @property {Function}            onViewChange   — callback(viewModeId)
 * @property {Function}            onTabChange    — callback(tabId)
 */

// ═══════════════════════════════════════════════════════════════════════
// ACTION TOOLBAR STATE — Estado da toolbar condicional de selecao
// ═══════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} ActionToolbarState
 * @property {boolean}               visible        — toolbar visivel?
 * @property {string[]}              selectedIds    — ids selecionados
 * @property {number}                selectedCount  — total selecionado
 * @property {BulkActionDefinition[]} actions       — botoes de bulk action
 * @property {Function}              onClear        — callback para limpar selecao
 * @property {Function}              onSelectAll    — callback para selecionar tudo
 */

// ═══════════════════════════════════════════════════════════════════════
// GLOBAL TOOLBAR STATE — Estado da toolbar global (sempre visivel)
// ═══════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label   — texto exibido
 * @property {string} [route] — hash route para navegacao (null = item atual)
 * @property {string} [icon]  — lucide icon
 */

/**
 * @typedef {Object} GlobalToolbarState
 * @property {BreadcrumbItem[]}  breadcrumbs    — trilha de navegacao
 * @property {string}            searchQuery    — busca global
 * @property {number}            notificationCount — badge de notificacoes
 * @property {Object}            user           — dados do usuario logado
 * @property {string}            user.name
 * @property {string}            user.avatar
 * @property {string}            user.role
 */
```

---

## 4. Arvore de Componentes

```
src/ui/toolbar/
├── GlobalToolbar.js           — Barra fixa no topo (busca, breadcrumb, user)
│   ├── Breadcrumb.js          — Trilha de navegacao (Home > Projetos > Detalhe)
│   ├── GlobalSearch.js        — Busca omni (Cmd+K) com resultados inline
│   ├── NotificationBell.js    — Icone + badge de notificacoes
│   └── UserMenu.js            — Avatar + dropdown (perfil, config, logout)
│
├── ContextToolbar.js          — Container generico por rota (recebe ToolbarState)
│   ├── ToolbarTitle.js        — Icon + Titulo + Subtitle
│   ├── FilterBar.js           — Container horizontal de filtros
│   │   ├── TextFilter.js      — Input de busca com debounce + icon
│   │   ├── SelectFilter.js    — Dropdown <select> estilizado
│   │   ├── MultiSelectFilter.js — Dropdown com checkboxes
│   │   ├── PillFilter.js      — Grupo de pills/chips clicaveis
│   │   └── DateRangeFilter.js — Seletor de intervalo de datas
│   ├── ViewToggle.js          — Grupo de botoes segmentado (Board|List|Gantt)
│   ├── TabBar.js              — Tabs horizontais reutilizavel
│   └── ActionGroup.js         — Grupo de botoes de acao (+ Novo, Export, etc.)
│
├── ActionToolbar.js           — Barra condicional de selecao bulk
│   ├── SelectionCounter.js    — "3 itens selecionados" + Limpar
│   └── BulkActionGroup.js     — Botoes de acao em massa (Mover, Deletar, etc.)
│
├── presets/                   — Configuracoes pre-montadas por modulo
│   ├── ProjectsToolbar.js     — ContextToolbarState para #/projetos
│   ├── TasksToolbar.js        — ContextToolbarState para #/tarefas
│   ├── PipelineToolbar.js     — ContextToolbarState para #/pipeline
│   ├── ClientsToolbar.js      — ContextToolbarState para #/clientes
│   ├── MeetingsToolbar.js     — ContextToolbarState para #/reunioes
│   ├── FinanceToolbar.js      — ContextToolbarState para #/financeiro
│   ├── PeopleToolbar.js       — ContextToolbarState para #/rh
│   ├── DeliverablesToolbar.js — ContextToolbarState para #/entregas
│   ├── ContractsToolbar.js    — ContextToolbarState para #/contratos
│   ├── DetailToolbar.js       — ContextToolbarState para paginas de detalhe
│   ├── EditorToolbar.js       — ContextToolbarState para #/page/:id
│   ├── TabbedToolbar.js       — ContextToolbarState generico com tabs
│   ├── SimpleHeaderToolbar.js — ContextToolbarState minimo (so titulo)
│   └── AdminToolbar.js        — ContextToolbarState para #/admin-portal
│
├── toolbar.css                — Estilos unificados para os 3 niveis
└── index.js                   — Export barrel + ToolbarManager (orquestra estado)
```

---

## 5. Detalhe dos Componentes

### 5.1 GlobalToolbar

```
┌─────────────────────────────────────────────────────────────────────┐
│  [icon] Home > Projetos > Detalhe    [🔍 Busca...]    [🔔 3] [👤] │
│  ← Breadcrumb                        ← GlobalSearch   ← Bell  User│
└─────────────────────────────────────────────────────────────────────┘
```

- **Posicao**: `position: sticky; top: 0; z-index: 100;`
- **Altura**: 48px fixa
- **Background**: `var(--bg-primary)` com `backdrop-filter: blur(8px)`
- **Border**: `border-bottom: 1px solid var(--border-subtle)`
- **Layout**: `display: flex; align-items: center; justify-content: space-between; padding: 0 20px;`
- **Requer**: Mover de dentro de `#moduleContainer` para filho direto de `#app-container`, ANTES de `#main-content`

**Subcomponentes:**

| Componente       | Descricao                                          | API                        |
|------------------|----------------------------------------------------|---------------------------|
| `Breadcrumb`     | Renderiza items como links, ultimo sem link         | `render(items[])`          |
| `GlobalSearch`   | Input com Cmd+K shortcut, dropdown de resultados    | `render()`, `onSearch(cb)` |
| `NotificationBell`| Icone bell + badge count vermelho                  | `render(count)`            |
| `UserMenu`       | Avatar + nome + dropdown (perfil, config, sair)     | `render(user)`             |

### 5.2 ContextToolbar

```
┌─────────────────────────────────────────────────────────────────────┐
│  [icon] Quadro de Projetos                                         │
│                                                                     │
│  [🔍 Buscar...] [Status ▾] [BU ▾] [Construtora ▾]  [▦][≡][▤]  [⊞]│
│  ← FilterBar (TextFilter, SelectFilter x3)   ← ViewToggle  ← Density│
│                                                                     │
│  [Todas] [Em Andamento] [Finalizados]                              │
│  ← TabBar (opcional, so se tabs definidos)                         │
└─────────────────────────────────────────────────────────────────────┘
```

- **Posicao**: `position: sticky; top: 48px; z-index: 90;` (abaixo da GlobalToolbar)
- **Background**: `var(--bg-primary)` com blur
- **Padding**: `16px 0`
- **Layout**: Flex column, gap 12px entre linhas
- **Renderizacao**: Baseada no `ContextToolbarState` — se nao tem filtros, nao renderiza FilterBar; se nao tem tabs, nao renderiza TabBar

**Subcomponentes:**

| Componente         | Descricao                                          | API                                     |
|--------------------|----------------------------------------------------|-----------------------------------------|
| `ToolbarTitle`     | Icon + H2 titulo + span subtitle                   | `render(icon, title, subtitle)`          |
| `FilterBar`        | Container flex-wrap com filtros                     | `render(filters[], onChange)`             |
| `TextFilter`       | Input com icon search, debounce 300ms               | `render(def)`, `onChange(value)`          |
| `SelectFilter`     | Native select estilizado                            | `render(def)`, `onChange(value)`          |
| `MultiSelectFilter`| Custom dropdown com checkboxes                      | `render(def)`, `onChange(values[])`       |
| `PillFilter`       | Horizontal pill group (radio ou multi)              | `render(def)`, `onChange(value)`          |
| `DateRangeFilter`  | Two date inputs (de/ate)                            | `render(def)`, `onChange({start, end})`   |
| `ViewToggle`       | Segmented button group                              | `render(modes[], active, onChange)`       |
| `TabBar`           | Tabs horizontais com badge count                    | `render(tabs[], active, onChange)`        |
| `ActionGroup`      | Botoes de acao a direita                            | `render(actions[])`                       |

### 5.3 ActionToolbar

```
┌─────────────────────────────────────────────────────────────────────┐
│  ☑ 3 selecionados   [Limpar]            [Mover] [Arquivar] [🗑]   │
│  ← SelectionCounter                     ← BulkActionGroup          │
└─────────────────────────────────────────────────────────────────────┘
```

- **Posicao**: `position: sticky; top: calc(48px + ContextToolbar height); z-index: 80;`
- **Visibilidade**: `display: none` por padrao, `display: flex` quando `selectedCount > 0`
- **Background**: `var(--bg-elevated)` com sombra sutil
- **Animacao**: slide-down com transform
- **Layout**: `display: flex; align-items: center; justify-content: space-between; padding: 8px 16px;`

**Subcomponentes:**

| Componente         | Descricao                                          | API                                |
|--------------------|----------------------------------------------------|------------------------------------|
| `SelectionCounter` | Checkbox + "N selecionados" + botao Limpar          | `render(count, onClear, onAll)`    |
| `BulkActionGroup`  | Botoes de acao em massa com confirm dialog          | `render(actions[], selectedIds[])` |

---

## 6. Presets por Modulo — Exemplos

### 6.1 ProjectsToolbar (`#/projetos`)

```javascript
// presets/ProjectsToolbar.js
function getProjectsToolbarState(data) {
  return {
    moduleId: 'projetos',
    title: 'Quadro de Projetos',
    icon: 'layout-dashboard',

    filters: [
      {
        id: 'search', type: 'text',
        label: 'Buscar projeto...',
        icon: 'search',
        value: '', defaultValue: '',
        debounceMs: 300
      },
      {
        id: 'status', type: 'select',
        label: 'Todos os status',
        options: [
          { value: 'all', label: 'Todos os status' },
          { value: 'em_andamento', label: 'Em Andamento' },
          { value: 'producao', label: 'Em Producao' },
          { value: 'parado', label: 'Parado' },
          { value: 'pausado', label: 'Pausado' },
          { value: 'finalizado', label: 'Finalizado' }
        ],
        value: 'all', defaultValue: 'all'
      },
      {
        id: 'bu', type: 'select',
        label: 'Todas as BUs',
        options: data.bus.map(b => ({ value: b, label: b })),
        value: '', defaultValue: ''
      },
      {
        id: 'construtora', type: 'select',
        label: 'Todas as construtoras',
        options: data.construtoras.map(c => ({ value: c, label: c })),
        value: '', defaultValue: ''
      }
    ],
    filterValues: { search: '', status: 'all', bu: '', construtora: '' },

    viewModes: [
      { id: 'board', label: 'Board', icon: 'layout-dashboard' },
      { id: 'list', label: 'List', icon: 'list' },
      { id: 'gantt', label: 'Gantt', icon: 'gantt-chart' }
    ],
    activeView: 'board',

    tabs: [],
    activeTab: '',

    actions: [
      {
        id: 'density', label: '', icon: 'rows-3',
        variant: 'ghost', size: 'sm',
        onClick: () => TBO_PROJETOS.toggleDensity()
      }
    ],

    onFilterChange: (id, val) => TBO_PROJETOS.applyFilter(id, val),
    onViewChange:   (view) => TBO_PROJETOS.setView(view),
    onTabChange:    null
  };
}
```

### 6.2 TasksToolbar (`#/tarefas`)

```javascript
// presets/TasksToolbar.js
function getTasksToolbarState(data) {
  return {
    moduleId: 'tarefas',
    title: 'Tarefas',
    icon: 'clipboard-check',

    filters: [
      { id: 'status', type: 'select', label: 'Status', options: [...], value: 'all' },
      { id: 'owner', type: 'select', label: 'Responsavel', options: data.owners, value: '' },
      { id: 'project', type: 'select', label: 'Projeto', options: data.projects, value: '' },
      { id: 'priority', type: 'select', label: 'Prioridade', options: [...], value: '' },
      { id: 'search', type: 'text', label: 'Buscar...', icon: 'search', value: '' }
    ],

    viewModes: [
      { id: 'list', label: 'Lista', icon: 'list' },
      { id: 'board', label: 'Board', icon: 'kanban' }
    ],
    activeView: 'list',

    tabs: [
      { id: 'todas', label: 'Todas', count: data.total },
      { id: 'minhas', label: 'Minhas', count: data.mine },
      { id: 'board', label: 'Board' },
      { id: 'concluidas', label: 'Concluidas', count: data.done }
    ],
    activeTab: 'todas',

    actions: [
      { id: 'create', label: '+ Nova Tarefa', icon: 'plus', variant: 'primary', onClick: ... }
    ],

    onFilterChange: (id, val) => TBO_TAREFAS.applyFilter(id, val),
    onViewChange:   (view) => TBO_TAREFAS.setView(view),
    onTabChange:    (tab) => TBO_TAREFAS.switchTab(tab)
  };
}
```

### 6.3 ClientsToolbar (`#/clientes`)

```javascript
// presets/ClientsToolbar.js — exemplo com PillFilter
function getClientsToolbarState(data) {
  return {
    moduleId: 'clientes',
    title: 'Base de Clientes',
    icon: 'users',
    subtitle: data.total + ' clientes',

    filters: [
      {
        id: 'crm_status', type: 'pills',
        label: 'Status CRM',
        options: [
          { value: '',       label: 'Todos',    count: data.total },
          { value: 'lead',   label: 'Lead',     count: data.leads,   color: '#3b82f6' },
          { value: 'prospect', label: 'Prospect', count: data.prospects, color: '#8b5cf6' },
          { value: 'ativo',  label: 'Ativo',    count: data.ativos,  color: '#22c55e' },
          { value: 'vip',    label: 'VIP',      count: data.vips,    color: '#f59e0b' },
          { value: 'inativo', label: 'Inativo',  count: data.inativos, color: '#64748b' }
        ],
        value: '', defaultValue: ''
      },
      {
        id: 'search', type: 'text',
        label: 'Buscar cliente, contato ou responsavel...',
        icon: 'search', value: '', debounceMs: 300
      }
    ],

    viewModes: [],
    tabs: [],

    actions: [
      { id: 'create', label: '+ Novo Cliente', icon: 'plus', variant: 'primary', onClick: ... }
    ],

    onFilterChange: (id, val) => TBO_CLIENTES.applyFilter(id, val)
  };
}
```

---

## 7. Layout DOM Proposto

### Antes (atual):
```html
<body>
  <aside id="sidebar">...</aside>
  <div id="app-container">
    <header id="app-header" style="display:none!important">...</header>  <!-- MORTO -->
    <main id="main-content">
      <div id="moduleContainer">
        <!-- Toolbar + Conteudo misturados dentro de cada modulo -->
      </div>
    </main>
  </div>
</body>
```

### Depois (proposto):
```html
<body>
  <aside id="sidebar">...</aside>
  <div id="app-container">
    <!-- NIVEL 1: Global Toolbar (sticky, sempre visivel) -->
    <header id="globalToolbar" class="tbo-global-toolbar">
      <!-- Breadcrumb | GlobalSearch | Bell | UserMenu -->
    </header>

    <main id="main-content">
      <!-- NIVEL 2: Context Toolbar (sticky, muda por rota) -->
      <div id="contextToolbar" class="tbo-context-toolbar">
        <!-- ToolbarTitle | FilterBar | ViewToggle | TabBar | ActionGroup -->
      </div>

      <!-- NIVEL 3: Action Toolbar (condicional, aparece ao selecionar) -->
      <div id="actionToolbar" class="tbo-action-toolbar" hidden>
        <!-- SelectionCounter | BulkActionGroup -->
      </div>

      <div id="moduleContainer">
        <!-- SO conteudo do modulo — sem toolbar -->
      </div>
    </main>
  </div>
</body>
```

---

## 8. CSS Skeleton

```css
/* ── Global Toolbar ── */
.tbo-global-toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(8px);
  flex-shrink: 0;
}

/* ── Context Toolbar ── */
.tbo-context-toolbar {
  position: sticky;
  top: 0; /* dentro de main-content, fica sticky no scroll */
  z-index: 90;
  padding: 12px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(8px);
}

.tbo-context-toolbar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.tbo-context-toolbar__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tbo-context-toolbar__tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border-subtle);
  margin-top: 4px;
}

/* ── Action Toolbar ── */
.tbo-action-toolbar {
  position: sticky;
  top: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  animation: slideDown 0.15s ease;
}

.tbo-action-toolbar[hidden] { display: none; }

@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

/* ── Filter Components ── */
.tbo-filter-text {
  padding: 6px 10px 6px 32px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-hover);
  color: var(--text-primary);
  font-size: 0.82rem;
  width: 180px;
  outline: none;
  transition: border-color 0.15s;
}
.tbo-filter-text:focus { border-color: var(--accent-gold); }

.tbo-filter-select {
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-hover);
  color: var(--text-primary);
  font-size: 0.8rem;
  cursor: pointer;
}

.tbo-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 0.72rem;
  font-weight: 600;
  border: 1px solid var(--border-default);
  border-radius: 20px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
.tbo-filter-pill:hover { border-color: var(--accent-gold); color: var(--accent-gold); }
.tbo-filter-pill--active { background: var(--accent-gold); border-color: var(--accent-gold); color: #fff; }

/* ── View Toggle ── */
.tbo-view-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 7px;
  overflow: hidden;
}
.tbo-view-toggle__btn {
  padding: 5px 9px;
  background: var(--bg-card-hover);
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.78rem;
  transition: background 0.15s, color 0.15s;
}
.tbo-view-toggle__btn--active,
.tbo-view-toggle__btn:hover {
  background: var(--accent-gold);
  color: #fff;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .tbo-context-toolbar__filters { gap: 6px; }
  .tbo-filter-text { width: 100%; }
  .tbo-context-toolbar__tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
  }
}
```

---

## 9. Integracao com Router

O `ToolbarManager` escuta mudancas de rota e atualiza a Context Toolbar:

```javascript
// src/ui/toolbar/index.js
const ToolbarManager = {
  _presets: {},  // { moduleId: getToolbarState(data) }

  register(moduleId, presetFn) {
    this._presets[moduleId] = presetFn;
  },

  /** Chamado pelo router ao trocar de rota */
  onRouteChange(moduleId, routeParams) {
    const presetFn = this._presets[moduleId];
    if (!presetFn) {
      // Fallback: renderiza SimpleHeaderToolbar
      ContextToolbar.render({ moduleId, title: moduleId, filters: [], actions: [] });
      return;
    }
    const state = presetFn(routeParams);
    ContextToolbar.render(state);
    ActionToolbar.hide(); // Reset selecao ao trocar de rota
  },

  /** Atualiza breadcrumb na GlobalToolbar */
  updateBreadcrumb(items) {
    GlobalToolbar.updateBreadcrumb(items);
  }
};
```

---

## 10. Estrategia de Migracao

A migracao deve ser **incremental** — nao reescrever todos os modulos de uma vez:

| Fase | Escopo                                  | Impacto                    |
|------|----------------------------------------|----------------------------|
| 1    | Criar GlobalToolbar no index.html       | Breadcrumb + busca global  |
| 2    | Criar ContextToolbar + FilterBar generico| Componentes reutilizaveis  |
| 3    | Migrar `#/projetos` (QP) como piloto    | Substituir `.qp-toolbar`   |
| 4    | Migrar `#/tarefas` (segundo modulo)     | Validar pattern de tabs    |
| 5    | Migrar demais modulos progressivamente  | 1 por PR                   |
| 6    | Criar ActionToolbar + bulk actions      | Funcionalidade nova        |
| 7    | Remover CSS/HTML antigo de toolbars     | Cleanup final              |

**Regra:** Cada modulo migrado deve funcionar identicamente ao antes — zero regressao visual.
