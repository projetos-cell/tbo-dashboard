/**
 * TBO OS — Project System Module (Kanban + Tasks)
 *
 * Task #22 — Sistema de Projetos v2
 * Views: Kanban | Tabela | Timeline
 * Features: drag-drop cards, task detail modal, comments, subtasks, filters
 */

const TBO_PROJECT_SYSTEM = (() => {
  'use strict';

  // ── State ─────────────────────────────────────────────────────────────
  let _boards = [];
  let _currentBoard = null;
  let _tasks = [];
  let _activeView = 'kanban'; // kanban | tabela | timeline
  let _filters = { status: '', priority: '', assignee_id: '', client_id: '', due_from: '', due_to: '' };
  let _teamMembers = [];
  let _draggedTaskId = null;
  let _detailTask = null;
  let _comments = [];
  let _subtasks = [];

  // ── Helpers ────────────────────────────────────────────────────────────
  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function _priorityLabel(p) {
    return { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baixa' }[p] || p;
  }

  function _priorityClass(p) {
    return { urgent: 'ps-priority--urgent', high: 'ps-priority--high', medium: 'ps-priority--medium', low: 'ps-priority--low' }[p] || '';
  }

  function _formatDate(d) {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  function _isOverdue(d) {
    if (!d) return false;
    return new Date(d + 'T23:59:59') < new Date();
  }

  function _getMemberName(id) {
    const m = _teamMembers.find(t => t.id === id);
    return m ? (m.full_name || m.name || m.email || 'Sem nome') : '';
  }

  function _getMemberInitials(id) {
    const name = _getMemberName(id);
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function _getBoardColumns() {
    if (!_currentBoard || !_currentBoard.columns) return [];
    try {
      return typeof _currentBoard.columns === 'string'
        ? JSON.parse(_currentBoard.columns)
        : _currentBoard.columns;
    } catch { return []; }
  }

  function _getColName(colId) {
    const cols = _getBoardColumns();
    const col = cols.find(c => c.id === colId);
    return col ? col.name : colId;
  }

  // ── Data Loading ──────────────────────────────────────────────────────
  async function _loadBoards() {
    try {
      _boards = await ProjectSystemRepo.listBoards();
    } catch (e) {
      console.warn('[ProjectSystem] loadBoards error:', e);
      _boards = [];
    }
  }

  async function _loadTasks() {
    if (!_currentBoard) { _tasks = []; return; }
    try {
      const filters = {};
      if (_filters.status) filters.status = _filters.status;
      if (_filters.priority) filters.priority = _filters.priority;
      if (_filters.assignee_id) filters.assignee_id = _filters.assignee_id;
      if (_filters.client_id) filters.client_id = _filters.client_id;
      if (_filters.due_from) filters.due_from = _filters.due_from;
      if (_filters.due_to) filters.due_to = _filters.due_to;
      _tasks = await ProjectSystemRepo.listTasks(_currentBoard.id, filters);
    } catch (e) {
      console.warn('[ProjectSystem] loadTasks error:', e);
      _tasks = [];
    }
  }

  async function _loadTeamMembers() {
    try {
      if (typeof TBO_SUPABASE === 'undefined') return;
      const client = TBO_SUPABASE.getClient ? TBO_SUPABASE.getClient() : null;
      if (!client) return;
      const tid = RepoBase.requireTenantId();
      const { data } = await client.from('people')
        .select('id, full_name, name, email, avatar_url, role')
        .eq('tenant_id', tid)
        .eq('status', 'active')
        .order('full_name');
      _teamMembers = data || [];
    } catch (e) {
      console.warn('[ProjectSystem] loadTeam error:', e);
      _teamMembers = [];
    }
  }

  // ── Render ────────────────────────────────────────────────────────────
  function render() {
    return `
      <div class="ps-module">
        <!-- Header -->
        <div class="ps-header">
          <div class="ps-header__left">
            <h1 class="ps-header__title">
              <i data-lucide="kanban" class="ps-header__icon"></i>
              Projetos v2
            </h1>
            <div class="ps-board-selector" id="psBoardSelector"></div>
          </div>
          <div class="ps-header__right">
            <button class="ps-btn ps-btn--primary" id="psNewTaskBtn">
              <i data-lucide="plus" style="width:16px;height:16px"></i>
              Nova Tarefa
            </button>
            <button class="ps-btn ps-btn--ghost" id="psNewBoardBtn" title="Criar board">
              <i data-lucide="layout-grid" style="width:16px;height:16px"></i>
            </button>
          </div>
        </div>

        <!-- View Tabs -->
        <div class="ps-tabs">
          <button class="ps-tab ps-tab--active" data-view="kanban">
            <i data-lucide="columns" style="width:14px;height:14px"></i> Kanban
          </button>
          <button class="ps-tab" data-view="tabela">
            <i data-lucide="table" style="width:14px;height:14px"></i> Tabela
          </button>
          <button class="ps-tab" data-view="timeline">
            <i data-lucide="gantt-chart" style="width:14px;height:14px"></i> Timeline
          </button>
          <div class="ps-tabs__spacer"></div>
          <div class="ps-filters" id="psFilters"></div>
        </div>

        <!-- Content -->
        <div class="ps-content" id="psContent">
          <div class="ps-loading">
            <div class="ps-spinner"></div>
            <span>Carregando...</span>
          </div>
        </div>

        <!-- Task Detail Modal -->
        <div class="ps-modal-overlay" id="psModalOverlay" style="display:none">
          <div class="ps-modal" id="psModal"></div>
        </div>
      </div>
    `;
  }

  // ── Init ──────────────────────────────────────────────────────────────
  async function init() {
    if (window.lucide) lucide.createIcons();

    // Load data
    await Promise.all([_loadBoards(), _loadTeamMembers()]);

    // Auto-select first board
    if (_boards.length > 0 && !_currentBoard) {
      _currentBoard = _boards[0];
    }

    await _loadTasks();

    _renderBoardSelector();
    _renderFilters();
    _renderContent();
    _bindEvents();
  }

  // ── Board Selector ────────────────────────────────────────────────────
  function _renderBoardSelector() {
    const el = document.getElementById('psBoardSelector');
    if (!el) return;

    if (_boards.length === 0) {
      el.innerHTML = '<span class="ps-board-selector__empty">Nenhum board</span>';
      return;
    }

    el.innerHTML = `
      <select class="ps-select" id="psBoardSelect">
        ${_boards.map(b => `<option value="${b.id}" ${b.id === _currentBoard?.id ? 'selected' : ''}>${_esc(b.name)}</option>`).join('')}
      </select>
    `;

    document.getElementById('psBoardSelect')?.addEventListener('change', async (e) => {
      _currentBoard = _boards.find(b => b.id === e.target.value) || null;
      await _loadTasks();
      _renderContent();
    });
  }

  // ── Filters ───────────────────────────────────────────────────────────
  function _renderFilters() {
    const el = document.getElementById('psFilters');
    if (!el) return;

    el.innerHTML = `
      <select class="ps-filter-select" id="psFilterPriority" title="Prioridade">
        <option value="">Prioridade</option>
        <option value="urgent">Urgente</option>
        <option value="high">Alta</option>
        <option value="medium">Media</option>
        <option value="low">Baixa</option>
      </select>
      <select class="ps-filter-select" id="psFilterAssignee" title="Responsavel">
        <option value="">Responsavel</option>
        ${_teamMembers.map(m => `<option value="${m.id}">${_esc(m.full_name || m.name || m.email)}</option>`).join('')}
      </select>
      <button class="ps-btn ps-btn--ghost ps-btn--sm" id="psClearFilters" title="Limpar filtros">
        <i data-lucide="x" style="width:14px;height:14px"></i>
      </button>
    `;

    if (window.lucide) lucide.createIcons({ root: el });

    document.getElementById('psFilterPriority')?.addEventListener('change', async (e) => {
      _filters.priority = e.target.value;
      await _loadTasks();
      _renderContent();
    });

    document.getElementById('psFilterAssignee')?.addEventListener('change', async (e) => {
      _filters.assignee_id = e.target.value;
      await _loadTasks();
      _renderContent();
    });

    document.getElementById('psClearFilters')?.addEventListener('click', async () => {
      _filters = { status: '', priority: '', assignee_id: '', client_id: '', due_from: '', due_to: '' };
      document.getElementById('psFilterPriority').value = '';
      document.getElementById('psFilterAssignee').value = '';
      await _loadTasks();
      _renderContent();
    });
  }

  // ── Content Router ────────────────────────────────────────────────────
  function _renderContent() {
    const el = document.getElementById('psContent');
    if (!el) return;

    if (!_currentBoard) {
      el.innerHTML = `
        <div class="ps-empty">
          <i data-lucide="kanban" style="width:48px;height:48px;color:var(--text-muted)"></i>
          <h3>Nenhum board encontrado</h3>
          <p>Crie um board para comecar a gerenciar suas tarefas.</p>
          <button class="ps-btn ps-btn--primary" id="psEmptyNewBoard">
            <i data-lucide="plus" style="width:16px;height:16px"></i> Criar Board
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons({ root: el });
      document.getElementById('psEmptyNewBoard')?.addEventListener('click', () => _showCreateBoardModal());
      return;
    }

    if (_activeView === 'kanban') _renderKanban(el);
    else if (_activeView === 'tabela') _renderTable(el);
    else if (_activeView === 'timeline') _renderTimeline(el);

    if (window.lucide) lucide.createIcons({ root: el });
  }

  // ── Kanban View ───────────────────────────────────────────────────────
  function _renderKanban(container) {
    const columns = _getBoardColumns();
    const parentTasks = _tasks.filter(t => !t.parent_task_id);

    container.innerHTML = `
      <div class="ps-kanban">
        ${columns.map(col => {
          const colTasks = parentTasks.filter(t => t.status === col.id)
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          return `
            <div class="ps-kanban__col" data-col-id="${_esc(col.id)}"
                 ondragover="event.preventDefault()" ondrop="event.preventDefault()">
              <div class="ps-kanban__col-header" style="--col-color: ${col.color || '#64748B'}">
                <span class="ps-kanban__col-dot" style="background:${col.color || '#64748B'}"></span>
                <span class="ps-kanban__col-name">${_esc(col.name)}</span>
                <span class="ps-kanban__col-count">${colTasks.length}</span>
              </div>
              <div class="ps-kanban__cards" data-col-id="${_esc(col.id)}">
                ${colTasks.map(t => _renderCard(t)).join('')}
              </div>
              <button class="ps-kanban__add-btn" data-col-id="${_esc(col.id)}">
                <i data-lucide="plus" style="width:14px;height:14px"></i> Adicionar
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    _bindKanbanDragDrop();
  }

  function _renderCard(task) {
    const subtaskCount = _tasks.filter(t => t.parent_task_id === task.id).length;
    const overdue = _isOverdue(task.due_date);
    const assigneeName = _getMemberName(task.assignee_id);
    const assigneeInitials = _getMemberInitials(task.assignee_id);

    return `
      <div class="ps-card" data-task-id="${task.id}" draggable="true">
        <div class="ps-card__header">
          <span class="ps-card__title">${_esc(task.title)}</span>
        </div>
        <div class="ps-card__meta">
          ${task.priority ? `<span class="ps-priority ${_priorityClass(task.priority)}">${_priorityLabel(task.priority)}</span>` : ''}
          ${task.due_date ? `<span class="ps-card__due ${overdue ? 'ps-card__due--overdue' : ''}">
            <i data-lucide="calendar" style="width:12px;height:12px"></i> ${_formatDate(task.due_date)}
          </span>` : ''}
        </div>
        <div class="ps-card__footer">
          <div class="ps-card__tags">
            ${subtaskCount > 0 ? `<span class="ps-card__subtasks"><i data-lucide="list-tree" style="width:12px;height:12px"></i> ${subtaskCount}</span>` : ''}
          </div>
          ${task.assignee_id ? `<div class="ps-avatar ps-avatar--sm" title="${_esc(assigneeName)}">${assigneeInitials}</div>` : ''}
        </div>
      </div>
    `;
  }

  // ── Table View ────────────────────────────────────────────────────────
  function _renderTable(container) {
    const parentTasks = _tasks.filter(t => !t.parent_task_id);

    container.innerHTML = `
      <div class="ps-table-wrap">
        <table class="ps-table">
          <thead>
            <tr>
              <th class="ps-table__th">Tarefa</th>
              <th class="ps-table__th">Status</th>
              <th class="ps-table__th">Prioridade</th>
              <th class="ps-table__th">Responsavel</th>
              <th class="ps-table__th">Prazo</th>
              <th class="ps-table__th" style="width:60px"></th>
            </tr>
          </thead>
          <tbody>
            ${parentTasks.length === 0 ? `
              <tr><td colspan="6" class="ps-table__empty">Nenhuma tarefa encontrada</td></tr>
            ` : parentTasks.map(t => `
              <tr class="ps-table__row" data-task-id="${t.id}">
                <td class="ps-table__td ps-table__td--title">
                  <span class="ps-table__task-title">${_esc(t.title)}</span>
                </td>
                <td class="ps-table__td">
                  <span class="ps-status-pill" style="--pill-color: ${_getColColor(t.status)}">${_esc(_getColName(t.status))}</span>
                </td>
                <td class="ps-table__td">
                  <span class="ps-priority ${_priorityClass(t.priority)}">${_priorityLabel(t.priority)}</span>
                </td>
                <td class="ps-table__td">
                  ${t.assignee_id ? `<div class="ps-avatar-inline">
                    <div class="ps-avatar ps-avatar--xs">${_getMemberInitials(t.assignee_id)}</div>
                    <span>${_esc(_getMemberName(t.assignee_id))}</span>
                  </div>` : '<span class="ps-muted">-</span>'}
                </td>
                <td class="ps-table__td ${_isOverdue(t.due_date) ? 'ps-table__td--overdue' : ''}">
                  ${t.due_date ? _formatDate(t.due_date) : '<span class="ps-muted">-</span>'}
                </td>
                <td class="ps-table__td">
                  <button class="ps-btn ps-btn--icon" data-action="delete-task" data-task-id="${t.id}" title="Excluir">
                    <i data-lucide="trash-2" style="width:14px;height:14px"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function _getColColor(colId) {
    const cols = _getBoardColumns();
    const col = cols.find(c => c.id === colId);
    return col ? col.color : '#64748B';
  }

  // ── Timeline View ─────────────────────────────────────────────────────
  function _renderTimeline(container) {
    const tasksWithDates = _tasks.filter(t => t.due_date && !t.parent_task_id)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    if (tasksWithDates.length === 0) {
      container.innerHTML = `
        <div class="ps-empty">
          <i data-lucide="gantt-chart" style="width:48px;height:48px;color:var(--text-muted)"></i>
          <h3>Nenhuma tarefa com prazo</h3>
          <p>Adicione prazos as tarefas para visualizar no timeline.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="ps-timeline">
        ${tasksWithDates.map(t => {
          const overdue = _isOverdue(t.due_date);
          return `
            <div class="ps-timeline__item ${overdue ? 'ps-timeline__item--overdue' : ''}" data-task-id="${t.id}">
              <div class="ps-timeline__dot" style="background:${_getColColor(t.status)}"></div>
              <div class="ps-timeline__content">
                <div class="ps-timeline__date">${_formatDate(t.due_date)}</div>
                <div class="ps-timeline__title">${_esc(t.title)}</div>
                <div class="ps-timeline__meta">
                  <span class="ps-status-pill ps-status-pill--sm" style="--pill-color: ${_getColColor(t.status)}">${_esc(_getColName(t.status))}</span>
                  <span class="ps-priority ${_priorityClass(t.priority)}">${_priorityLabel(t.priority)}</span>
                  ${t.assignee_id ? `<span class="ps-avatar ps-avatar--xs" title="${_esc(_getMemberName(t.assignee_id))}">${_getMemberInitials(t.assignee_id)}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ── Kanban Drag & Drop ────────────────────────────────────────────────
  function _bindKanbanDragDrop() {
    const kanban = document.querySelector('.ps-kanban');
    if (!kanban) return;

    kanban.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.ps-card[data-task-id]');
      if (!card) return;
      _draggedTaskId = card.dataset.taskId;
      card.classList.add('ps-card--dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', _draggedTaskId);
    });

    kanban.addEventListener('dragend', (e) => {
      const card = e.target.closest('.ps-card');
      if (card) card.classList.remove('ps-card--dragging');
      _draggedTaskId = null;
      kanban.querySelectorAll('.ps-kanban__col--dragover').forEach(c => c.classList.remove('ps-kanban__col--dragover'));
    });

    kanban.addEventListener('dragover', (e) => {
      e.preventDefault();
      const col = e.target.closest('.ps-kanban__col');
      if (!col) return;
      kanban.querySelectorAll('.ps-kanban__col--dragover').forEach(c => c.classList.remove('ps-kanban__col--dragover'));
      col.classList.add('ps-kanban__col--dragover');
    });

    kanban.addEventListener('dragleave', (e) => {
      const col = e.target.closest('.ps-kanban__col');
      if (col && !col.contains(e.relatedTarget)) {
        col.classList.remove('ps-kanban__col--dragover');
      }
    });

    kanban.addEventListener('drop', async (e) => {
      e.preventDefault();
      const col = e.target.closest('.ps-kanban__col');
      if (!col || !_draggedTaskId) return;
      col.classList.remove('ps-kanban__col--dragover');

      const newStatus = col.dataset.colId;
      const cards = col.querySelector('.ps-kanban__cards');
      const existingCards = cards ? cards.querySelectorAll('.ps-card') : [];
      const newOrder = existingCards.length;

      try {
        await ProjectSystemRepo.updateTaskOrder(_draggedTaskId, newStatus, newOrder);
        await _loadTasks();
        _renderContent();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Movido', 'Tarefa atualizada.');
      } catch (err) {
        console.error('[ProjectSystem] Drop error:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao mover tarefa.');
      }
    });
  }

  // ── Events ────────────────────────────────────────────────────────────
  function _bindEvents() {
    // Tab switching
    document.querySelectorAll('.ps-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.ps-tab').forEach(t => t.classList.remove('ps-tab--active'));
        tab.classList.add('ps-tab--active');
        _activeView = tab.dataset.view;
        _renderContent();
      });
    });

    // New Task
    document.getElementById('psNewTaskBtn')?.addEventListener('click', () => {
      if (!_currentBoard) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Board', 'Selecione ou crie um board primeiro.');
        return;
      }
      _showCreateTaskModal();
    });

    // New Board
    document.getElementById('psNewBoardBtn')?.addEventListener('click', () => _showCreateBoardModal());

    // Card click -> detail
    document.getElementById('psContent')?.addEventListener('click', (e) => {
      // Delete action
      const delBtn = e.target.closest('[data-action="delete-task"]');
      if (delBtn) {
        e.stopPropagation();
        _confirmDeleteTask(delBtn.dataset.taskId);
        return;
      }

      const card = e.target.closest('.ps-card[data-task-id]');
      if (card && !e.target.closest('.ps-btn')) {
        _showTaskDetail(card.dataset.taskId);
        return;
      }

      // Table row click
      const row = e.target.closest('.ps-table__row[data-task-id]');
      if (row && !e.target.closest('.ps-btn')) {
        _showTaskDetail(row.dataset.taskId);
        return;
      }

      // Timeline item click
      const tItem = e.target.closest('.ps-timeline__item[data-task-id]');
      if (tItem) {
        _showTaskDetail(tItem.dataset.taskId);
        return;
      }

      // Add task to column
      const addBtn = e.target.closest('.ps-kanban__add-btn');
      if (addBtn) {
        _showCreateTaskModal(addBtn.dataset.colId);
        return;
      }
    });

    // Modal close
    document.getElementById('psModalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'psModalOverlay') _closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') _closeModal();
    });
  }

  // ── Create Board Modal ────────────────────────────────────────────────
  function _showCreateBoardModal() {
    const overlay = document.getElementById('psModalOverlay');
    const modal = document.getElementById('psModal');
    if (!overlay || !modal) return;

    modal.innerHTML = `
      <div class="ps-modal__header">
        <h2 class="ps-modal__title">Novo Board</h2>
        <button class="ps-modal__close" id="psModalClose">&times;</button>
      </div>
      <div class="ps-modal__body">
        <div class="ps-form-group">
          <label class="ps-label">Nome do Board</label>
          <input type="text" class="ps-input" id="psBoardName" placeholder="Ex: Sprint 01" autofocus>
        </div>
      </div>
      <div class="ps-modal__footer">
        <button class="ps-btn ps-btn--ghost" id="psModalCancel">Cancelar</button>
        <button class="ps-btn ps-btn--primary" id="psSaveBoardBtn">Criar Board</button>
      </div>
    `;

    overlay.style.display = 'flex';
    document.getElementById('psBoardName')?.focus();

    document.getElementById('psModalClose')?.addEventListener('click', _closeModal);
    document.getElementById('psModalCancel')?.addEventListener('click', _closeModal);
    document.getElementById('psSaveBoardBtn')?.addEventListener('click', async () => {
      const name = document.getElementById('psBoardName')?.value?.trim();
      if (!name) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Nome', 'Informe o nome do board.');
        return;
      }
      try {
        const board = await ProjectSystemRepo.createBoard({ name });
        _boards.unshift(board);
        _currentBoard = board;
        await _loadTasks();
        _renderBoardSelector();
        _renderContent();
        _closeModal();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Board criado', name);
      } catch (err) {
        console.error('[ProjectSystem] createBoard error:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao criar board.');
      }
    });
  }

  // ── Create Task Modal ─────────────────────────────────────────────────
  function _showCreateTaskModal(defaultStatus) {
    const overlay = document.getElementById('psModalOverlay');
    const modal = document.getElementById('psModal');
    if (!overlay || !modal) return;

    const columns = _getBoardColumns();
    const defaultCol = defaultStatus || (columns[0]?.id || '');

    modal.innerHTML = `
      <div class="ps-modal__header">
        <h2 class="ps-modal__title">Nova Tarefa</h2>
        <button class="ps-modal__close" id="psModalClose">&times;</button>
      </div>
      <div class="ps-modal__body">
        <div class="ps-form-group">
          <label class="ps-label">Titulo *</label>
          <input type="text" class="ps-input" id="psTaskTitle" placeholder="Nome da tarefa" autofocus>
        </div>
        <div class="ps-form-group">
          <label class="ps-label">Descricao</label>
          <textarea class="ps-textarea" id="psTaskDesc" rows="3" placeholder="Descricao opcional..."></textarea>
        </div>
        <div class="ps-form-row">
          <div class="ps-form-group ps-form-group--half">
            <label class="ps-label">Status</label>
            <select class="ps-select" id="psTaskStatus">
              ${columns.map(c => `<option value="${c.id}" ${c.id === defaultCol ? 'selected' : ''}>${_esc(c.name)}</option>`).join('')}
            </select>
          </div>
          <div class="ps-form-group ps-form-group--half">
            <label class="ps-label">Prioridade</label>
            <select class="ps-select" id="psTaskPriority">
              <option value="low">Baixa</option>
              <option value="medium" selected>Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
        <div class="ps-form-row">
          <div class="ps-form-group ps-form-group--half">
            <label class="ps-label">Responsavel</label>
            <select class="ps-select" id="psTaskAssignee">
              <option value="">Nenhum</option>
              ${_teamMembers.map(m => `<option value="${m.id}">${_esc(m.full_name || m.name || m.email)}</option>`).join('')}
            </select>
          </div>
          <div class="ps-form-group ps-form-group--half">
            <label class="ps-label">Prazo</label>
            <input type="date" class="ps-input" id="psTaskDue">
          </div>
        </div>
      </div>
      <div class="ps-modal__footer">
        <button class="ps-btn ps-btn--ghost" id="psModalCancel">Cancelar</button>
        <button class="ps-btn ps-btn--primary" id="psSaveTaskBtn">Criar Tarefa</button>
      </div>
    `;

    overlay.style.display = 'flex';
    document.getElementById('psTaskTitle')?.focus();

    document.getElementById('psModalClose')?.addEventListener('click', _closeModal);
    document.getElementById('psModalCancel')?.addEventListener('click', _closeModal);
    document.getElementById('psSaveTaskBtn')?.addEventListener('click', async () => {
      const title = document.getElementById('psTaskTitle')?.value?.trim();
      if (!title) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Titulo', 'Informe o titulo da tarefa.');
        return;
      }
      try {
        await ProjectSystemRepo.createTask({
          board_id: _currentBoard.id,
          title,
          description: document.getElementById('psTaskDesc')?.value?.trim() || '',
          status: document.getElementById('psTaskStatus')?.value || defaultCol,
          priority: document.getElementById('psTaskPriority')?.value || 'medium',
          assignee_id: document.getElementById('psTaskAssignee')?.value || null,
          due_date: document.getElementById('psTaskDue')?.value || null,
          order_index: _tasks.length
        });
        await _loadTasks();
        _renderContent();
        _closeModal();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa criada', title);
      } catch (err) {
        console.error('[ProjectSystem] createTask error:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao criar tarefa.');
      }
    });
  }

  // ── Task Detail Modal ─────────────────────────────────────────────────
  async function _showTaskDetail(taskId) {
    const overlay = document.getElementById('psModalOverlay');
    const modal = document.getElementById('psModal');
    if (!overlay || !modal) return;

    let task;
    try {
      task = await ProjectSystemRepo.getTask(taskId);
    } catch (e) {
      console.error('[ProjectSystem] getTask error:', e);
      return;
    }
    if (!task) return;

    _detailTask = task;

    // Load comments and subtasks in parallel
    let comments = [];
    let subtasks = [];
    try {
      [comments, subtasks] = await Promise.all([
        ProjectSystemRepo.listComments(taskId),
        ProjectSystemRepo.listTasks(task.board_id, { parent_task_id: taskId })
      ]);
    } catch (e) { console.warn('[ProjectSystem] detail load error:', e); }

    _comments = comments;
    _subtasks = subtasks;

    const columns = _getBoardColumns();
    const overdue = _isOverdue(task.due_date);

    modal.innerHTML = `
      <div class="ps-modal__header">
        <h2 class="ps-modal__title">${_esc(task.title)}</h2>
        <button class="ps-modal__close" id="psModalClose">&times;</button>
      </div>
      <div class="ps-modal__body ps-detail">
        <!-- Inline editable fields -->
        <div class="ps-detail__fields">
          <div class="ps-detail__field">
            <label class="ps-label">Status</label>
            <select class="ps-select" id="psDetailStatus">
              ${columns.map(c => `<option value="${c.id}" ${c.id === task.status ? 'selected' : ''}>${_esc(c.name)}</option>`).join('')}
            </select>
          </div>
          <div class="ps-detail__field">
            <label class="ps-label">Prioridade</label>
            <select class="ps-select" id="psDetailPriority">
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Baixa</option>
              <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Media</option>
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Alta</option>
              <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgente</option>
            </select>
          </div>
          <div class="ps-detail__field">
            <label class="ps-label">Responsavel</label>
            <select class="ps-select" id="psDetailAssignee">
              <option value="">Nenhum</option>
              ${_teamMembers.map(m => `<option value="${m.id}" ${m.id === task.assignee_id ? 'selected' : ''}>${_esc(m.full_name || m.name || m.email)}</option>`).join('')}
            </select>
          </div>
          <div class="ps-detail__field">
            <label class="ps-label">Prazo</label>
            <input type="date" class="ps-input" id="psDetailDue" value="${task.due_date || ''}">
          </div>
        </div>

        <!-- Description -->
        <div class="ps-detail__section">
          <label class="ps-label">Descricao</label>
          <textarea class="ps-textarea" id="psDetailDesc" rows="3" placeholder="Adicionar descricao...">${_esc(task.description || '')}</textarea>
        </div>

        <!-- Subtasks -->
        <div class="ps-detail__section">
          <div class="ps-detail__section-header">
            <label class="ps-label">Subtarefas (${subtasks.length})</label>
            <button class="ps-btn ps-btn--ghost ps-btn--sm" id="psAddSubtask">
              <i data-lucide="plus" style="width:14px;height:14px"></i> Adicionar
            </button>
          </div>
          <div class="ps-subtasks" id="psSubtasksList">
            ${subtasks.length === 0 ? '<div class="ps-muted" style="padding:8px 0">Nenhuma subtarefa</div>' :
              subtasks.map(st => `
                <div class="ps-subtask" data-subtask-id="${st.id}">
                  <span class="ps-priority ${_priorityClass(st.priority)}" style="font-size:10px">${_priorityLabel(st.priority)}</span>
                  <span class="ps-subtask__title">${_esc(st.title)}</span>
                  <span class="ps-status-pill ps-status-pill--sm" style="--pill-color:${_getColColor(st.status)}">${_esc(_getColName(st.status))}</span>
                </div>
              `).join('')}
          </div>
          <div id="psNewSubtaskForm" style="display:none" class="ps-subtask-form">
            <input type="text" class="ps-input ps-input--sm" id="psSubtaskTitle" placeholder="Nome da subtarefa">
            <button class="ps-btn ps-btn--primary ps-btn--sm" id="psSaveSubtask">Salvar</button>
            <button class="ps-btn ps-btn--ghost ps-btn--sm" id="psCancelSubtask">Cancelar</button>
          </div>
        </div>

        <!-- Comments -->
        <div class="ps-detail__section">
          <label class="ps-label">Comentarios (${comments.length})</label>
          <div class="ps-comments" id="psCommentsList">
            ${comments.length === 0 ? '<div class="ps-muted" style="padding:8px 0">Nenhum comentario</div>' :
              comments.map(c => `
                <div class="ps-comment">
                  <div class="ps-comment__header">
                    <div class="ps-avatar ps-avatar--xs">${_getMemberInitials(c.user_id)}</div>
                    <span class="ps-comment__author">${_esc(_getMemberName(c.user_id) || 'Usuario')}</span>
                    <span class="ps-comment__date">${new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div class="ps-comment__body">${_esc(c.content)}</div>
                </div>
              `).join('')}
          </div>
          <div class="ps-comment-form">
            <textarea class="ps-textarea ps-textarea--sm" id="psCommentInput" rows="2" placeholder="Adicionar comentario..."></textarea>
            <button class="ps-btn ps-btn--primary ps-btn--sm" id="psSendComment">Enviar</button>
          </div>
        </div>
      </div>
      <div class="ps-modal__footer">
        <button class="ps-btn ps-btn--danger ps-btn--ghost" id="psDeleteTaskBtn">
          <i data-lucide="trash-2" style="width:14px;height:14px"></i> Excluir
        </button>
        <button class="ps-btn ps-btn--primary" id="psSaveDetailBtn">Salvar Alteracoes</button>
      </div>
    `;

    overlay.style.display = 'flex';
    if (window.lucide) lucide.createIcons({ root: modal });

    // Bind detail events
    document.getElementById('psModalClose')?.addEventListener('click', _closeModal);

    // Save changes
    document.getElementById('psSaveDetailBtn')?.addEventListener('click', async () => {
      try {
        await ProjectSystemRepo.updateTask(task.id, {
          status: document.getElementById('psDetailStatus')?.value,
          priority: document.getElementById('psDetailPriority')?.value,
          assignee_id: document.getElementById('psDetailAssignee')?.value || null,
          due_date: document.getElementById('psDetailDue')?.value || null,
          description: document.getElementById('psDetailDesc')?.value || ''
        });
        await _loadTasks();
        _renderContent();
        _closeModal();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Salvo', 'Tarefa atualizada.');
      } catch (err) {
        console.error('[ProjectSystem] updateTask error:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao salvar.');
      }
    });

    // Delete task
    document.getElementById('psDeleteTaskBtn')?.addEventListener('click', () => {
      _confirmDeleteTask(task.id);
    });

    // Add comment
    document.getElementById('psSendComment')?.addEventListener('click', async () => {
      const content = document.getElementById('psCommentInput')?.value?.trim();
      if (!content) return;
      try {
        await ProjectSystemRepo.addComment({ task_id: task.id, content });
        // Reload detail
        _showTaskDetail(task.id);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Comentario', 'Adicionado.');
      } catch (err) {
        console.error('[ProjectSystem] addComment error:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao adicionar comentario.');
      }
    });

    // Subtask add
    document.getElementById('psAddSubtask')?.addEventListener('click', () => {
      document.getElementById('psNewSubtaskForm').style.display = 'flex';
      document.getElementById('psSubtaskTitle')?.focus();
    });
    document.getElementById('psCancelSubtask')?.addEventListener('click', () => {
      document.getElementById('psNewSubtaskForm').style.display = 'none';
    });
    document.getElementById('psSaveSubtask')?.addEventListener('click', async () => {
      const title = document.getElementById('psSubtaskTitle')?.value?.trim();
      if (!title) return;
      try {
        await ProjectSystemRepo.createTask({
          board_id: task.board_id,
          title,
          status: task.status,
          parent_task_id: task.id,
          order_index: _subtasks.length
        });
        _showTaskDetail(task.id);
        await _loadTasks();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Subtarefa', 'Criada.');
      } catch (err) {
        console.error('[ProjectSystem] createSubtask error:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao criar subtarefa.');
      }
    });
  }

  // ── Delete Task ───────────────────────────────────────────────────────
  async function _confirmDeleteTask(taskId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await ProjectSystemRepo.deleteTask(taskId);
      await _loadTasks();
      _closeModal();
      _renderContent();
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Excluida', 'Tarefa removida.');
    } catch (err) {
      console.error('[ProjectSystem] deleteTask error:', err);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao excluir tarefa.');
    }
  }

  // ── Close Modal ───────────────────────────────────────────────────────
  function _closeModal() {
    const overlay = document.getElementById('psModalOverlay');
    if (overlay) overlay.style.display = 'none';
    _detailTask = null;
    _comments = [];
    _subtasks = [];
  }

  // ── Public API ────────────────────────────────────────────────────────
  return { render, init };
})();

if (typeof window !== 'undefined') {
  window.TBO_PROJECT_SYSTEM = TBO_PROJECT_SYSTEM;
}
