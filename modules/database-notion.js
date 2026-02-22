/**
 * TBO OS — Database Notion-style Module
 *
 * Flexible database system inspired by Notion with multiple views,
 * column types, filters, sorts, and JSONB-backed records.
 *
 * Task #23 — TBO-OS Fase 4
 */

const TBO_DATABASE_NOTION = (() => {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────
  let _databases = [];
  let _activeDbId = null;
  let _activeDb = null;
  let _rows = [];
  let _activeViewId = null;
  let _editingCell = null;
  let _selectedRows = new Set();
  let _filterBarOpen = false;
  let _tempFilters = [];
  let _searchTerm = '';

  // Column type definitions
  const COLUMN_TYPES = {
    text:         { label: 'Texto',         icon: 'type',           defaultWidth: 250 },
    number:       { label: 'Número',        icon: 'hash',           defaultWidth: 120 },
    select:       { label: 'Select',        icon: 'chevron-down',   defaultWidth: 180 },
    multi_select: { label: 'Multi Select',  icon: 'tags',           defaultWidth: 220 },
    date:         { label: 'Data',          icon: 'calendar',       defaultWidth: 160 },
    person:       { label: 'Pessoa',        icon: 'user',           defaultWidth: 160 },
    checkbox:     { label: 'Checkbox',      icon: 'check-square',   defaultWidth: 80 },
    url:          { label: 'URL',           icon: 'link',           defaultWidth: 250 },
    email:        { label: 'Email',         icon: 'mail',           defaultWidth: 200 },
    phone:        { label: 'Telefone',      icon: 'phone',          defaultWidth: 160 },
    relation:     { label: 'Relação',       icon: 'arrow-up-right', defaultWidth: 200 },
    formula:      { label: 'Fórmula',       icon: 'function-square',defaultWidth: 150 }
  };

  const SELECT_COLORS = [
    { name: 'gray', bg: '#F1F1EF', text: '#787774' },
    { name: 'brown', bg: '#F4EEEE', text: '#976D57' },
    { name: 'orange', bg: '#FAEBDD', text: '#D9730D' },
    { name: 'yellow', bg: '#FBF3DB', text: '#DFAB01' },
    { name: 'green', bg: '#DDEDEA', text: '#0F7B6C' },
    { name: 'blue', bg: '#DDEBF1', text: '#0B6E99' },
    { name: 'purple', bg: '#EAE4F2', text: '#6940A5' },
    { name: 'pink', bg: '#F4DFEB', text: '#AD1A72' },
    { name: 'red', bg: '#FFE2DD', text: '#E03E3E' }
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  function render() {
    return `
      <div class="ntdb-container">
        <div class="ntdb-sidebar-panel" id="ntdbSidebarPanel">
          <div class="ntdb-sidebar-header">
            <h3>Databases</h3>
            <button class="ntdb-btn ntdb-btn-icon" id="ntdbCreateDb" title="Novo database">
              <i data-lucide="plus" style="width:16px;height:16px"></i>
            </button>
          </div>
          <div class="ntdb-sidebar-list" id="ntdbDbList"></div>
        </div>
        <div class="ntdb-main" id="ntdbMain">
          <div class="ntdb-empty-state" id="ntdbEmptyState">
            <i data-lucide="database" style="width:48px;height:48px;color:var(--text-tertiary, #999)"></i>
            <h2 style="margin:12px 0 4px;font-size:1.1rem;color:var(--text-primary, #333)">Nenhum database selecionado</h2>
            <p style="color:var(--text-secondary, #666);font-size:0.85rem">Selecione um database na lista ou crie um novo.</p>
          </div>
          <div class="ntdb-database-view" id="ntdbDatabaseView" style="display:none">
            <!-- Header -->
            <div class="ntdb-db-header">
              <div class="ntdb-db-title-row">
                <span class="ntdb-db-icon" id="ntdbDbIcon"><i data-lucide="database" style="width:20px;height:20px"></i></span>
                <input type="text" class="ntdb-db-title-input" id="ntdbDbTitle" placeholder="Sem título" />
                <div class="ntdb-db-actions">
                  <button class="ntdb-btn ntdb-btn-sm" id="ntdbDeleteDb" title="Excluir database">
                    <i data-lucide="trash-2" style="width:14px;height:14px"></i>
                  </button>
                </div>
              </div>
              <p class="ntdb-db-desc" id="ntdbDbDesc" contenteditable="true" data-placeholder="Adicionar descrição..."></p>
            </div>

            <!-- Toolbar -->
            <div class="ntdb-toolbar">
              <div class="ntdb-views-tabs" id="ntdbViewTabs"></div>
              <div class="ntdb-toolbar-actions">
                <button class="ntdb-btn ntdb-btn-sm" id="ntdbAddView" title="Nova view">
                  <i data-lucide="plus" style="width:14px;height:14px"></i> View
                </button>
                <div class="ntdb-toolbar-divider"></div>
                <button class="ntdb-btn ntdb-btn-sm" id="ntdbFilterBtn">
                  <i data-lucide="filter" style="width:14px;height:14px"></i> Filtrar
                </button>
                <button class="ntdb-btn ntdb-btn-sm" id="ntdbSortBtn">
                  <i data-lucide="arrow-up-down" style="width:14px;height:14px"></i> Ordenar
                </button>
                <div class="ntdb-toolbar-divider"></div>
                <div class="ntdb-search-wrapper">
                  <i data-lucide="search" style="width:14px;height:14px"></i>
                  <input type="text" class="ntdb-search-input" id="ntdbSearchInput" placeholder="Pesquisar..." />
                </div>
              </div>
            </div>

            <!-- Filter bar -->
            <div class="ntdb-filter-bar" id="ntdbFilterBar" style="display:none"></div>

            <!-- Content area (table/kanban/calendar/gallery/list) -->
            <div class="ntdb-content" id="ntdbContent"></div>

            <!-- New row button -->
            <div class="ntdb-add-row">
              <button class="ntdb-btn ntdb-btn-add-row" id="ntdbAddRow">
                <i data-lucide="plus" style="width:14px;height:14px"></i> Novo registro
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Init ───────────────────────────────────────────────────────────────

  async function init() {
    try {
      _databases = await CustomDatabaseRepo.listDatabases();
    } catch (e) {
      console.warn('[DB-NOTION] Failed to load databases:', e);
      _databases = [];
    }

    _renderDbList();
    _bindEvents();

    // Auto-select first database if available
    if (_databases.length > 0) {
      await _selectDatabase(_databases[0].id);
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Database List (sidebar) ────────────────────────────────────────────

  function _renderDbList() {
    const container = document.getElementById('ntdbDbList');
    if (!container) return;

    if (_databases.length === 0) {
      container.innerHTML = `
        <div class="ntdb-sidebar-empty">
          <p style="font-size:0.8rem;color:var(--text-tertiary,#999);padding:16px;text-align:center">
            Nenhum database criado.<br>Clique em + para começar.
          </p>
        </div>`;
      return;
    }

    container.innerHTML = _databases.map(db => `
      <div class="ntdb-sidebar-item ${db.id === _activeDbId ? 'active' : ''}" data-db-id="${db.id}">
        <i data-lucide="${db.icon || 'database'}" style="width:16px;height:16px;color:${db.color || '#3B82F6'}"></i>
        <span class="ntdb-sidebar-item-name">${_esc(db.name)}</span>
        <span class="ntdb-sidebar-item-count">${db._rowCount || ''}</span>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Select Database ────────────────────────────────────────────────────

  async function _selectDatabase(dbId) {
    _activeDbId = dbId;
    _editingCell = null;
    _selectedRows.clear();
    _searchTerm = '';

    try {
      _activeDb = await CustomDatabaseRepo.getDatabase(dbId);
      _rows = await CustomDatabaseRepo.listRows(dbId);
    } catch (e) {
      console.error('[DB-NOTION] Failed to load database:', e);
      return;
    }

    // Set active view
    _activeViewId = _activeDb.views?.[0]?.id || null;

    // Show database view
    const empty = document.getElementById('ntdbEmptyState');
    const view = document.getElementById('ntdbDatabaseView');
    if (empty) empty.style.display = 'none';
    if (view) view.style.display = 'flex';

    // Update header
    const titleEl = document.getElementById('ntdbDbTitle');
    if (titleEl) titleEl.value = _activeDb.name || '';
    const descEl = document.getElementById('ntdbDbDesc');
    if (descEl) descEl.textContent = _activeDb.description || '';

    _renderDbList();
    _renderViewTabs();
    _renderContent();

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── View Tabs ──────────────────────────────────────────────────────────

  function _renderViewTabs() {
    const container = document.getElementById('ntdbViewTabs');
    if (!container || !_activeDb) return;

    const views = _activeDb.views || [];
    container.innerHTML = views.map(v => {
      const iconMap = { table: 'table', kanban: 'columns', calendar: 'calendar', gallery: 'grid-3x3', list: 'list' };
      return `
        <button class="ntdb-view-tab ${v.id === _activeViewId ? 'active' : ''}" data-view-id="${v.id}">
          <i data-lucide="${iconMap[v.type] || 'table'}" style="width:14px;height:14px"></i>
          ${_esc(v.name)}
        </button>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Content Rendering (view dispatcher) ────────────────────────────────

  function _renderContent() {
    const container = document.getElementById('ntdbContent');
    if (!container || !_activeDb) return;

    const view = (_activeDb.views || []).find(v => v.id === _activeViewId);
    const viewType = view?.type || 'table';

    // Apply search filter
    let filteredRows = _rows;
    if (_searchTerm) {
      const term = _searchTerm.toLowerCase();
      filteredRows = filteredRows.filter(r => {
        return Object.values(r.properties || {}).some(v =>
          String(v).toLowerCase().includes(term)
        );
      });
    }

    // Apply view filters
    if (view?.filters?.length > 0) {
      filteredRows = CustomDatabaseRepo.applyFilters(filteredRows, view.filters);
    }

    switch (viewType) {
      case 'kanban':
        container.innerHTML = _renderKanbanView(filteredRows, view);
        break;
      case 'gallery':
        container.innerHTML = _renderGalleryView(filteredRows);
        break;
      case 'list':
        container.innerHTML = _renderListView(filteredRows);
        break;
      case 'calendar':
        container.innerHTML = _renderCalendarView(filteredRows, view);
        break;
      default:
        container.innerHTML = _renderTableView(filteredRows, view);
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    _bindCellEvents();
  }

  // ── Table View ─────────────────────────────────────────────────────────

  function _renderTableView(rows, view) {
    const columns = _activeDb.columns || [];
    const hidden = new Set(view?.hiddenColumns || []);
    const visibleCols = columns.filter(c => !hidden.has(c.id));

    if (visibleCols.length === 0) {
      return '<div class="ntdb-empty-table"><p>Nenhuma coluna definida. Adicione uma coluna para começar.</p></div>';
    }

    const headerCells = visibleCols.map(col => `
      <th class="ntdb-th" style="width:${col.width || COLUMN_TYPES[col.type]?.defaultWidth || 200}px;min-width:100px" data-col-id="${col.id}">
        <div class="ntdb-th-content">
          <i data-lucide="${COLUMN_TYPES[col.type]?.icon || 'type'}" style="width:14px;height:14px;opacity:0.5"></i>
          <span class="ntdb-th-name">${_esc(col.name)}</span>
          <button class="ntdb-col-menu-btn" data-col-id="${col.id}" title="Opções da coluna">
            <i data-lucide="chevron-down" style="width:12px;height:12px"></i>
          </button>
        </div>
      </th>
    `).join('');

    const bodyRows = rows.map(row => {
      const cells = visibleCols.map(col => {
        const val = row.properties?.[col.id];
        return `<td class="ntdb-td" data-row-id="${row.id}" data-col-id="${col.id}" data-col-type="${col.type}">
          <div class="ntdb-cell-content">${_renderCellValue(val, col)}</div>
        </td>`;
      }).join('');

      return `<tr class="ntdb-row" data-row-id="${row.id}">
        <td class="ntdb-td ntdb-td-checkbox">
          <input type="checkbox" class="ntdb-row-check" data-row-id="${row.id}" ${_selectedRows.has(row.id) ? 'checked' : ''} />
        </td>
        ${cells}
      </tr>`;
    }).join('');

    return `
      <div class="ntdb-table-wrapper">
        <table class="ntdb-table">
          <thead>
            <tr>
              <th class="ntdb-th ntdb-th-checkbox" style="width:32px">
                <input type="checkbox" class="ntdb-select-all" />
              </th>
              ${headerCells}
              <th class="ntdb-th ntdb-th-add" style="width:32px">
                <button class="ntdb-btn ntdb-btn-icon ntdb-add-col-btn" title="Adicionar coluna">
                  <i data-lucide="plus" style="width:14px;height:14px"></i>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
      <div class="ntdb-table-footer">
        <span class="ntdb-row-count">${rows.length} registro${rows.length !== 1 ? 's' : ''}</span>
      </div>`;
  }

  // ── Kanban View ────────────────────────────────────────────────────────

  function _renderKanbanView(rows, view) {
    const groupBy = view?.groupBy;
    const col = (_activeDb.columns || []).find(c => c.id === groupBy);

    if (!col || (col.type !== 'select' && col.type !== 'multi_select')) {
      return `<div class="ntdb-kanban-empty">
        <p>Configure uma coluna Select como agrupamento para usar a view Kanban.</p>
        <p style="font-size:0.8rem;color:var(--text-tertiary, #999)">Clique em "Ordenar" e defina o campo de agrupamento.</p>
      </div>`;
    }

    const options = col.options || [];
    const groups = {};
    const noGroup = [];

    // Group rows by select value
    for (const row of rows) {
      const val = row.properties?.[col.id];
      if (!val) { noGroup.push(row); continue; }
      if (!groups[val]) groups[val] = [];
      groups[val].push(row);
    }

    const titleCol = (_activeDb.columns || []).find(c => c.primary);

    const columns = options.map(opt => {
      const optColor = SELECT_COLORS.find(c => c.name === opt.color) || SELECT_COLORS[0];
      const groupRows = groups[opt.name] || [];
      const cards = groupRows.map(r => `
        <div class="ntdb-kanban-card" data-row-id="${r.id}">
          <span class="ntdb-kanban-card-title">${_esc(r.properties?.[titleCol?.id] || 'Sem título')}</span>
        </div>
      `).join('');

      return `
        <div class="ntdb-kanban-col" data-group="${_esc(opt.name)}">
          <div class="ntdb-kanban-col-header">
            <span class="ntdb-select-tag" style="background:${optColor.bg};color:${optColor.text}">${_esc(opt.name)}</span>
            <span class="ntdb-kanban-count">${groupRows.length}</span>
          </div>
          <div class="ntdb-kanban-cards">${cards}</div>
        </div>`;
    }).join('');

    // No group column
    const noGroupCards = noGroup.map(r => `
      <div class="ntdb-kanban-card" data-row-id="${r.id}">
        <span class="ntdb-kanban-card-title">${_esc(r.properties?.[titleCol?.id] || 'Sem título')}</span>
      </div>
    `).join('');

    const noGroupCol = noGroup.length > 0 ? `
      <div class="ntdb-kanban-col" data-group="">
        <div class="ntdb-kanban-col-header">
          <span style="color:var(--text-tertiary,#999)">Sem grupo</span>
          <span class="ntdb-kanban-count">${noGroup.length}</span>
        </div>
        <div class="ntdb-kanban-cards">${noGroupCards}</div>
      </div>` : '';

    return `<div class="ntdb-kanban-board">${noGroupCol}${columns}</div>`;
  }

  // ── Gallery View ───────────────────────────────────────────────────────

  function _renderGalleryView(rows) {
    const titleCol = (_activeDb.columns || []).find(c => c.primary);
    const columns = (_activeDb.columns || []).filter(c => !c.primary).slice(0, 3);

    const cards = rows.map(r => {
      const props = columns.map(col => `
        <div class="ntdb-gallery-prop">
          <span class="ntdb-gallery-prop-label">${_esc(col.name)}</span>
          <span class="ntdb-gallery-prop-value">${_renderCellValue(r.properties?.[col.id], col)}</span>
        </div>
      `).join('');

      return `
        <div class="ntdb-gallery-card" data-row-id="${r.id}">
          <div class="ntdb-gallery-card-title">${_esc(r.properties?.[titleCol?.id] || 'Sem título')}</div>
          ${props}
        </div>`;
    }).join('');

    return `<div class="ntdb-gallery-grid">${cards}</div>`;
  }

  // ── List View ──────────────────────────────────────────────────────────

  function _renderListView(rows) {
    const titleCol = (_activeDb.columns || []).find(c => c.primary);
    const items = rows.map(r => `
      <div class="ntdb-list-item" data-row-id="${r.id}">
        <div class="ntdb-list-item-title">${_esc(r.properties?.[titleCol?.id] || 'Sem título')}</div>
        <div class="ntdb-list-item-date">${_formatDate(r.created_at)}</div>
      </div>
    `).join('');

    return `<div class="ntdb-list-view">${items || '<p class="ntdb-empty-list">Nenhum registro.</p>'}</div>`;
  }

  // ── Calendar View ──────────────────────────────────────────────────────

  function _renderCalendarView(rows, view) {
    const dateCol = view?.dateColumn;
    if (!dateCol) {
      return `<div class="ntdb-calendar-empty"><p>Configure uma coluna Data para usar a view Calendário.</p></div>`;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();

    const titleCol = (_activeDb.columns || []).find(c => c.primary);
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    // Map rows to days
    const dayMap = {};
    for (const r of rows) {
      const d = r.properties?.[dateCol];
      if (!d) continue;
      const day = new Date(d).getDate();
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push(r);
    }

    let cells = '';
    // Empty cells before first day
    for (let i = 0; i < startDow; i++) cells += '<div class="ntdb-cal-cell ntdb-cal-empty"></div>';
    // Day cells
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const isToday = d === now.getDate() && month === now.getMonth();
      const dayRows = dayMap[d] || [];
      const dots = dayRows.slice(0, 3).map(r => `
        <div class="ntdb-cal-event" data-row-id="${r.id}">${_esc((r.properties?.[titleCol?.id] || '').slice(0, 20))}</div>
      `).join('');
      cells += `<div class="ntdb-cal-cell ${isToday ? 'ntdb-cal-today' : ''}">
        <span class="ntdb-cal-day">${d}</span>
        ${dots}
        ${dayRows.length > 3 ? `<span class="ntdb-cal-more">+${dayRows.length - 3}</span>` : ''}
      </div>`;
    }

    return `
      <div class="ntdb-calendar">
        <div class="ntdb-cal-header">
          <h3>${monthNames[month]} ${year}</h3>
        </div>
        <div class="ntdb-cal-weekdays">
          <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
        </div>
        <div class="ntdb-cal-grid">${cells}</div>
      </div>`;
  }

  // ── Cell Value Rendering ───────────────────────────────────────────────

  function _renderCellValue(val, col) {
    if (val == null || val === '') return '<span class="ntdb-cell-empty"></span>';

    switch (col.type) {
      case 'checkbox':
        return `<span class="ntdb-checkbox ${val ? 'checked' : ''}"><i data-lucide="${val ? 'check-square' : 'square'}" style="width:16px;height:16px"></i></span>`;

      case 'select': {
        const opt = (col.options || []).find(o => o.name === val);
        const color = SELECT_COLORS.find(c => c.name === opt?.color) || SELECT_COLORS[0];
        return `<span class="ntdb-select-tag" style="background:${color.bg};color:${color.text}">${_esc(val)}</span>`;
      }

      case 'multi_select': {
        if (!Array.isArray(val)) return _esc(val);
        return val.map(v => {
          const opt = (col.options || []).find(o => o.name === v);
          const color = SELECT_COLORS.find(c => c.name === opt?.color) || SELECT_COLORS[0];
          return `<span class="ntdb-select-tag" style="background:${color.bg};color:${color.text}">${_esc(v)}</span>`;
        }).join(' ');
      }

      case 'date':
        return `<span class="ntdb-date-val">${_formatDate(val)}</span>`;

      case 'number':
        return `<span class="ntdb-number-val">${Number(val).toLocaleString('pt-BR')}</span>`;

      case 'url':
        return `<a href="${_esc(val)}" target="_blank" rel="noopener" class="ntdb-url-val">${_esc(val.replace(/^https?:\/\//, '').slice(0, 40))}</a>`;

      case 'email':
        return `<a href="mailto:${_esc(val)}" class="ntdb-email-val">${_esc(val)}</a>`;

      case 'person':
        return `<span class="ntdb-person-val"><i data-lucide="user" style="width:14px;height:14px"></i> ${_esc(val)}</span>`;

      default:
        return `<span class="ntdb-text-val">${_esc(String(val))}</span>`;
    }
  }

  // ── Cell Editing ───────────────────────────────────────────────────────

  function _startCellEdit(td) {
    if (_editingCell) _finishCellEdit();

    const rowId = td.dataset.rowId;
    const colId = td.dataset.colId;
    const colType = td.dataset.colType;
    const col = (_activeDb.columns || []).find(c => c.id === colId);
    const row = _rows.find(r => r.id === rowId);
    if (!col || !row) return;

    const val = row.properties?.[colId];
    _editingCell = { td, rowId, colId, colType, originalVal: val };

    td.classList.add('ntdb-editing');

    switch (colType) {
      case 'checkbox':
        _toggleCheckbox(rowId, colId, !val);
        return;

      case 'select':
        _showSelectDropdown(td, col, val, rowId, colId);
        return;

      case 'multi_select':
        _showMultiSelectDropdown(td, col, val || [], rowId, colId);
        return;

      case 'date': {
        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'ntdb-cell-input';
        input.value = val ? new Date(val).toISOString().split('T')[0] : '';
        td.querySelector('.ntdb-cell-content').innerHTML = '';
        td.querySelector('.ntdb-cell-content').appendChild(input);
        input.focus();
        input.addEventListener('change', () => _saveCellValue(rowId, colId, input.value));
        input.addEventListener('blur', () => _finishCellEdit());
        return;
      }

      case 'number': {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'ntdb-cell-input';
        input.value = val ?? '';
        td.querySelector('.ntdb-cell-content').innerHTML = '';
        td.querySelector('.ntdb-cell-content').appendChild(input);
        input.focus();
        input.addEventListener('blur', () => {
          const numVal = input.value !== '' ? Number(input.value) : null;
          _saveCellValue(rowId, colId, numVal);
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { input.blur(); }
          if (e.key === 'Escape') { _finishCellEdit(); }
        });
        return;
      }

      default: {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'ntdb-cell-input';
        input.value = val ?? '';
        td.querySelector('.ntdb-cell-content').innerHTML = '';
        td.querySelector('.ntdb-cell-content').appendChild(input);
        input.focus();
        input.addEventListener('blur', () => _saveCellValue(rowId, colId, input.value));
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { input.blur(); }
          if (e.key === 'Escape') { _finishCellEdit(); }
        });
      }
    }
  }

  function _finishCellEdit() {
    if (!_editingCell) return;
    const { td, rowId, colId, colType } = _editingCell;
    td.classList.remove('ntdb-editing');

    // Re-render cell
    const row = _rows.find(r => r.id === rowId);
    const col = (_activeDb.columns || []).find(c => c.id === colId);
    if (row && col) {
      td.querySelector('.ntdb-cell-content').innerHTML = _renderCellValue(row.properties?.[colId], col);
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    _editingCell = null;
  }

  async function _saveCellValue(rowId, colId, value) {
    const row = _rows.find(r => r.id === rowId);
    if (!row) return;

    const props = { ...row.properties, [colId]: value };
    row.properties = props;

    try {
      await CustomDatabaseRepo.updateRow(rowId, props);
    } catch (e) {
      console.error('[DB-NOTION] Failed to save cell:', e);
    }

    _finishCellEdit();
  }

  async function _toggleCheckbox(rowId, colId, newVal) {
    await _saveCellValue(rowId, colId, newVal);
    _renderContent();
  }

  // ── Select Dropdown ────────────────────────────────────────────────────

  function _showSelectDropdown(td, col, currentVal, rowId, colId) {
    _removeDropdown();
    const options = col.options || [];
    const rect = td.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.className = 'ntdb-dropdown';
    dropdown.style.cssText = `position:fixed;top:${rect.bottom + 2}px;left:${rect.left}px;min-width:${rect.width}px;z-index:9999`;

    dropdown.innerHTML = options.map(opt => {
      const color = SELECT_COLORS.find(c => c.name === opt.color) || SELECT_COLORS[0];
      return `<div class="ntdb-dropdown-item ${opt.name === currentVal ? 'active' : ''}" data-value="${_esc(opt.name)}">
        <span class="ntdb-select-tag" style="background:${color.bg};color:${color.text}">${_esc(opt.name)}</span>
      </div>`;
    }).join('') + `<div class="ntdb-dropdown-item ntdb-dropdown-clear" data-value="">
      <span style="color:var(--text-tertiary,#999)">Limpar</span>
    </div>`;

    document.body.appendChild(dropdown);

    dropdown.addEventListener('click', async (e) => {
      const item = e.target.closest('.ntdb-dropdown-item');
      if (!item) return;
      const value = item.dataset.value || null;
      _removeDropdown();
      await _saveCellValue(rowId, colId, value);
      _renderContent();
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function _close(e) {
        if (!dropdown.contains(e.target)) {
          _removeDropdown();
          _finishCellEdit();
          document.removeEventListener('click', _close);
        }
      });
    }, 10);
  }

  function _showMultiSelectDropdown(td, col, currentVals, rowId, colId) {
    _removeDropdown();
    const options = col.options || [];
    const rect = td.getBoundingClientRect();
    const selected = new Set(currentVals);

    const dropdown = document.createElement('div');
    dropdown.className = 'ntdb-dropdown';
    dropdown.style.cssText = `position:fixed;top:${rect.bottom + 2}px;left:${rect.left}px;min-width:${rect.width}px;z-index:9999`;

    const renderItems = () => options.map(opt => {
      const color = SELECT_COLORS.find(c => c.name === opt.color) || SELECT_COLORS[0];
      return `<div class="ntdb-dropdown-item" data-value="${_esc(opt.name)}">
        <input type="checkbox" ${selected.has(opt.name) ? 'checked' : ''} style="margin-right:8px" />
        <span class="ntdb-select-tag" style="background:${color.bg};color:${color.text}">${_esc(opt.name)}</span>
      </div>`;
    }).join('');

    dropdown.innerHTML = renderItems();
    document.body.appendChild(dropdown);

    dropdown.addEventListener('click', async (e) => {
      const item = e.target.closest('.ntdb-dropdown-item');
      if (!item) return;
      const val = item.dataset.value;
      if (selected.has(val)) selected.delete(val); else selected.add(val);
      dropdown.innerHTML = renderItems();
      await _saveCellValue(rowId, colId, [...selected]);
    });

    setTimeout(() => {
      document.addEventListener('click', function _close(e) {
        if (!dropdown.contains(e.target)) {
          _removeDropdown();
          _finishCellEdit();
          _renderContent();
          document.removeEventListener('click', _close);
        }
      });
    }, 10);
  }

  function _removeDropdown() {
    document.querySelectorAll('.ntdb-dropdown').forEach(d => d.remove());
  }

  // ── Column Management ──────────────────────────────────────────────────

  function _showAddColumnDialog() {
    _removeDropdown();

    const dropdown = document.createElement('div');
    dropdown.className = 'ntdb-dropdown ntdb-col-type-picker';
    dropdown.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;min-width:240px;max-height:400px;overflow-y:auto';

    dropdown.innerHTML = `
      <div style="padding:8px 12px;font-weight:600;font-size:0.8rem;color:var(--text-secondary,#666);border-bottom:1px solid var(--border-primary,#e5e5e5)">Tipo da coluna</div>
      ${Object.entries(COLUMN_TYPES).map(([type, def]) => `
        <div class="ntdb-dropdown-item" data-col-type="${type}">
          <i data-lucide="${def.icon}" style="width:16px;height:16px;margin-right:8px"></i>
          ${def.label}
        </div>
      `).join('')}
    `;

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.2)';
    backdrop.addEventListener('click', () => {
      backdrop.remove();
      dropdown.remove();
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(dropdown);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    dropdown.addEventListener('click', async (e) => {
      const item = e.target.closest('.ntdb-dropdown-item');
      if (!item) return;
      const type = item.dataset.colType;
      backdrop.remove();
      dropdown.remove();
      await _addColumn(type);
    });
  }

  async function _addColumn(type) {
    const colId = CustomDatabaseRepo.generateColumnId();
    const typeDef = COLUMN_TYPES[type] || COLUMN_TYPES.text;
    const cols = [...(_activeDb.columns || [])];
    const newCol = {
      id: colId,
      name: typeDef.label,
      type,
      order: cols.length,
      width: typeDef.defaultWidth
    };

    if (type === 'select' || type === 'multi_select') {
      newCol.options = [
        { name: 'Opção 1', color: 'blue' },
        { name: 'Opção 2', color: 'green' },
        { name: 'Opção 3', color: 'orange' }
      ];
    }

    cols.push(newCol);

    try {
      _activeDb = await CustomDatabaseRepo.updateDatabase(_activeDbId, { columns: cols });
      _renderContent();
    } catch (e) {
      console.error('[DB-NOTION] Failed to add column:', e);
    }
  }

  function _showColumnMenu(colId) {
    _removeDropdown();
    const col = (_activeDb.columns || []).find(c => c.id === colId);
    if (!col) return;

    const btn = document.querySelector(`.ntdb-col-menu-btn[data-col-id="${colId}"]`);
    const rect = btn?.getBoundingClientRect() || { bottom: 200, left: 200 };

    const dropdown = document.createElement('div');
    dropdown.className = 'ntdb-dropdown';
    dropdown.style.cssText = `position:fixed;top:${rect.bottom + 4}px;left:${rect.left - 100}px;min-width:180px;z-index:9999`;

    dropdown.innerHTML = `
      <div class="ntdb-dropdown-item" data-action="rename"><i data-lucide="pencil" style="width:14px;height:14px;margin-right:8px"></i>Renomear</div>
      <div class="ntdb-dropdown-item" data-action="type"><i data-lucide="settings" style="width:14px;height:14px;margin-right:8px"></i>Alterar tipo</div>
      ${col.type === 'select' || col.type === 'multi_select' ? `
        <div class="ntdb-dropdown-item" data-action="options"><i data-lucide="list" style="width:14px;height:14px;margin-right:8px"></i>Editar opções</div>` : ''}
      <div class="ntdb-dropdown-divider"></div>
      <div class="ntdb-dropdown-item" data-action="hide"><i data-lucide="eye-off" style="width:14px;height:14px;margin-right:8px"></i>Ocultar coluna</div>
      ${!col.primary ? `<div class="ntdb-dropdown-item ntdb-danger" data-action="delete"><i data-lucide="trash-2" style="width:14px;height:14px;margin-right:8px"></i>Excluir coluna</div>` : ''}
    `;

    document.body.appendChild(dropdown);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    dropdown.addEventListener('click', async (e) => {
      const item = e.target.closest('.ntdb-dropdown-item');
      if (!item) return;
      const action = item.dataset.action;
      _removeDropdown();

      switch (action) {
        case 'rename':
          _renameColumn(colId);
          break;
        case 'delete':
          await _deleteColumn(colId);
          break;
        case 'hide':
          await _hideColumn(colId);
          break;
        case 'options':
          _editSelectOptions(colId);
          break;
      }
    });

    setTimeout(() => {
      document.addEventListener('click', function _close(e) {
        if (!dropdown.contains(e.target)) {
          _removeDropdown();
          document.removeEventListener('click', _close);
        }
      });
    }, 10);
  }

  function _renameColumn(colId) {
    const col = (_activeDb.columns || []).find(c => c.id === colId);
    if (!col) return;
    const name = prompt('Nome da coluna:', col.name);
    if (name != null && name.trim()) {
      col.name = name.trim();
      CustomDatabaseRepo.updateDatabase(_activeDbId, { columns: _activeDb.columns })
        .then(db => { _activeDb = db; _renderContent(); })
        .catch(e => console.error('[DB-NOTION] Rename failed:', e));
    }
  }

  async function _deleteColumn(colId) {
    const cols = (_activeDb.columns || []).filter(c => c.id !== colId);
    try {
      _activeDb = await CustomDatabaseRepo.updateDatabase(_activeDbId, { columns: cols });
      // Clean property from all rows
      for (const row of _rows) {
        if (row.properties?.[colId] !== undefined) {
          const props = { ...row.properties };
          delete props[colId];
          row.properties = props;
          await CustomDatabaseRepo.updateRow(row.id, props);
        }
      }
      _renderContent();
    } catch (e) {
      console.error('[DB-NOTION] Delete column failed:', e);
    }
  }

  async function _hideColumn(colId) {
    const view = (_activeDb.views || []).find(v => v.id === _activeViewId);
    if (!view) return;
    if (!view.hiddenColumns) view.hiddenColumns = [];
    view.hiddenColumns.push(colId);
    try {
      _activeDb = await CustomDatabaseRepo.updateDatabase(_activeDbId, { views: _activeDb.views });
      _renderContent();
    } catch (e) {
      console.error('[DB-NOTION] Hide column failed:', e);
    }
  }

  function _editSelectOptions(colId) {
    const col = (_activeDb.columns || []).find(c => c.id === colId);
    if (!col) return;

    const current = (col.options || []).map(o => `${o.name} (${o.color})`).join('\n');
    const input = prompt(
      'Edite as opções (uma por linha, formato: Nome (cor)):\nCores: gray, brown, orange, yellow, green, blue, purple, pink, red',
      current
    );
    if (input == null) return;

    col.options = input.split('\n').filter(Boolean).map(line => {
      const match = line.match(/^(.+?)\s*\((\w+)\)\s*$/);
      if (match) return { name: match[1].trim(), color: match[2] };
      return { name: line.trim(), color: 'gray' };
    });

    CustomDatabaseRepo.updateDatabase(_activeDbId, { columns: _activeDb.columns })
      .then(db => { _activeDb = db; _renderContent(); })
      .catch(e => console.error('[DB-NOTION] Edit options failed:', e));
  }

  // ── Row Management ─────────────────────────────────────────────────────

  async function _addNewRow() {
    const titleCol = (_activeDb.columns || []).find(c => c.primary);
    const props = {};
    if (titleCol) props[titleCol.id] = '';

    try {
      const row = await CustomDatabaseRepo.createRow(_activeDbId, props);
      _rows.push(row);
      _renderContent();

      // Focus on first editable cell of new row
      setTimeout(() => {
        const td = document.querySelector(`.ntdb-td[data-row-id="${row.id}"]`);
        if (td) _startCellEdit(td);
      }, 50);
    } catch (e) {
      console.error('[DB-NOTION] Failed to add row:', e);
    }
  }

  async function _deleteSelectedRows() {
    if (_selectedRows.size === 0) return;
    const ids = [..._selectedRows];

    try {
      await CustomDatabaseRepo.deleteRows(ids);
      _rows = _rows.filter(r => !_selectedRows.has(r.id));
      _selectedRows.clear();
      _renderContent();
    } catch (e) {
      console.error('[DB-NOTION] Failed to delete rows:', e);
    }
  }

  // ── Database CRUD ──────────────────────────────────────────────────────

  async function _createNewDatabase() {
    try {
      const db = await CustomDatabaseRepo.createDatabase({ name: 'Novo Database' });
      _databases.unshift(db);
      _renderDbList();
      await _selectDatabase(db.id);
    } catch (e) {
      console.error('[DB-NOTION] Failed to create database:', e);
    }
  }

  async function _deleteActiveDatabase() {
    if (!_activeDbId) return;
    if (!confirm('Tem certeza que deseja excluir este database? Esta ação não pode ser desfeita.')) return;

    try {
      await CustomDatabaseRepo.deleteDatabase(_activeDbId);
      _databases = _databases.filter(d => d.id !== _activeDbId);
      _activeDbId = null;
      _activeDb = null;
      _rows = [];

      const empty = document.getElementById('ntdbEmptyState');
      const view = document.getElementById('ntdbDatabaseView');
      if (empty) empty.style.display = '';
      if (view) view.style.display = 'none';

      _renderDbList();

      if (_databases.length > 0) {
        await _selectDatabase(_databases[0].id);
      }
    } catch (e) {
      console.error('[DB-NOTION] Failed to delete database:', e);
    }
  }

  // ── View Management ────────────────────────────────────────────────────

  function _showAddViewDialog() {
    _removeDropdown();

    const dropdown = document.createElement('div');
    dropdown.className = 'ntdb-dropdown';
    dropdown.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;min-width:200px';

    const viewTypes = [
      { type: 'table',    icon: 'table',     label: 'Tabela' },
      { type: 'kanban',   icon: 'columns',   label: 'Kanban' },
      { type: 'calendar', icon: 'calendar',  label: 'Calendário' },
      { type: 'gallery',  icon: 'grid-3x3',  label: 'Galeria' },
      { type: 'list',     icon: 'list',      label: 'Lista' }
    ];

    dropdown.innerHTML = `
      <div style="padding:8px 12px;font-weight:600;font-size:0.8rem;color:var(--text-secondary,#666);border-bottom:1px solid var(--border-primary,#e5e5e5)">Tipo de view</div>
      ${viewTypes.map(v => `
        <div class="ntdb-dropdown-item" data-view-type="${v.type}">
          <i data-lucide="${v.icon}" style="width:16px;height:16px;margin-right:8px"></i> ${v.label}
        </div>
      `).join('')}
    `;

    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.2)';
    backdrop.addEventListener('click', () => { backdrop.remove(); dropdown.remove(); });

    document.body.appendChild(backdrop);
    document.body.appendChild(dropdown);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    dropdown.addEventListener('click', async (e) => {
      const item = e.target.closest('.ntdb-dropdown-item');
      if (!item) return;
      const type = item.dataset.viewType;
      backdrop.remove();
      dropdown.remove();
      await _addView(type);
    });
  }

  async function _addView(type) {
    const views = [...(_activeDb.views || [])];
    const nameMap = { table: 'Tabela', kanban: 'Kanban', calendar: 'Calendário', gallery: 'Galeria', list: 'Lista' };
    const count = views.filter(v => v.type === type).length;
    const newView = {
      id: CustomDatabaseRepo.generateViewId(),
      name: nameMap[type] + (count > 0 ? ` ${count + 1}` : ''),
      type,
      filters: [],
      sorts: [],
      hiddenColumns: []
    };

    // For kanban, try to set default groupBy to first select column
    if (type === 'kanban') {
      const selectCol = (_activeDb.columns || []).find(c => c.type === 'select');
      if (selectCol) newView.groupBy = selectCol.id;
    }

    // For calendar, try to set default dateColumn
    if (type === 'calendar') {
      const dateCol = (_activeDb.columns || []).find(c => c.type === 'date');
      if (dateCol) newView.dateColumn = dateCol.id;
    }

    views.push(newView);

    try {
      _activeDb = await CustomDatabaseRepo.updateDatabase(_activeDbId, { views });
      _activeViewId = newView.id;
      _renderViewTabs();
      _renderContent();
    } catch (e) {
      console.error('[DB-NOTION] Failed to add view:', e);
    }
  }

  // ── Event Bindings ─────────────────────────────────────────────────────

  function _bindEvents() {
    // Create database
    document.getElementById('ntdbCreateDb')?.addEventListener('click', _createNewDatabase);

    // Database list click
    document.getElementById('ntdbDbList')?.addEventListener('click', (e) => {
      const item = e.target.closest('.ntdb-sidebar-item');
      if (item) _selectDatabase(item.dataset.dbId);
    });

    // Delete database
    document.getElementById('ntdbDeleteDb')?.addEventListener('click', _deleteActiveDatabase);

    // Title change (debounced)
    let titleTimer;
    document.getElementById('ntdbDbTitle')?.addEventListener('input', (e) => {
      clearTimeout(titleTimer);
      titleTimer = setTimeout(async () => {
        if (_activeDbId) {
          try {
            await CustomDatabaseRepo.updateDatabase(_activeDbId, { name: e.target.value });
            const db = _databases.find(d => d.id === _activeDbId);
            if (db) db.name = e.target.value;
            _renderDbList();
          } catch (err) { console.error('[DB-NOTION] Title save failed:', err); }
        }
      }, 500);
    });

    // Description change (debounced)
    let descTimer;
    document.getElementById('ntdbDbDesc')?.addEventListener('input', (e) => {
      clearTimeout(descTimer);
      descTimer = setTimeout(async () => {
        if (_activeDbId) {
          try {
            await CustomDatabaseRepo.updateDatabase(_activeDbId, { description: e.target.textContent });
          } catch (err) { console.error('[DB-NOTION] Desc save failed:', err); }
        }
      }, 500);
    });

    // View tabs
    document.getElementById('ntdbViewTabs')?.addEventListener('click', (e) => {
      const tab = e.target.closest('.ntdb-view-tab');
      if (tab) {
        _activeViewId = tab.dataset.viewId;
        _renderViewTabs();
        _renderContent();
      }
    });

    // Add view
    document.getElementById('ntdbAddView')?.addEventListener('click', _showAddViewDialog);

    // Add row
    document.getElementById('ntdbAddRow')?.addEventListener('click', _addNewRow);

    // Search
    document.getElementById('ntdbSearchInput')?.addEventListener('input', (e) => {
      _searchTerm = e.target.value;
      _renderContent();
    });

    // Filter button
    document.getElementById('ntdbFilterBtn')?.addEventListener('click', () => {
      _filterBarOpen = !_filterBarOpen;
      const bar = document.getElementById('ntdbFilterBar');
      if (bar) bar.style.display = _filterBarOpen ? '' : 'none';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Delete selected rows
      if (e.key === 'Delete' && _selectedRows.size > 0 && !_editingCell) {
        e.preventDefault();
        _deleteSelectedRows();
      }
    });
  }

  function _bindCellEvents() {
    // Cell click for editing
    document.querySelectorAll('.ntdb-td[data-col-id]').forEach(td => {
      td.addEventListener('dblclick', () => _startCellEdit(td));
    });

    // Column menu
    document.querySelectorAll('.ntdb-col-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        _showColumnMenu(btn.dataset.colId);
      });
    });

    // Add column button
    document.querySelectorAll('.ntdb-add-col-btn').forEach(btn => {
      btn.addEventListener('click', _showAddColumnDialog);
    });

    // Row checkboxes
    document.querySelectorAll('.ntdb-row-check').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) _selectedRows.add(cb.dataset.rowId);
        else _selectedRows.delete(cb.dataset.rowId);
      });
    });

    // Select all
    document.querySelectorAll('.ntdb-select-all').forEach(cb => {
      cb.addEventListener('change', () => {
        _selectedRows.clear();
        if (cb.checked) _rows.forEach(r => _selectedRows.add(r.id));
        document.querySelectorAll('.ntdb-row-check').forEach(rc => { rc.checked = cb.checked; });
      });
    });

    // Kanban/gallery/list card click -> open row
    document.querySelectorAll('.ntdb-kanban-card, .ntdb-gallery-card, .ntdb-list-item').forEach(card => {
      card.addEventListener('click', () => _openRowDetail(card.dataset.rowId));
    });
  }

  // ── Row Detail Modal ───────────────────────────────────────────────────

  function _openRowDetail(rowId) {
    const row = _rows.find(r => r.id === rowId);
    if (!row) return;

    const columns = _activeDb.columns || [];
    const titleCol = columns.find(c => c.primary);

    const propsHtml = columns.map(col => `
      <div class="ntdb-detail-prop">
        <label class="ntdb-detail-label">
          <i data-lucide="${COLUMN_TYPES[col.type]?.icon || 'type'}" style="width:14px;height:14px;opacity:0.5"></i>
          ${_esc(col.name)}
        </label>
        <div class="ntdb-detail-value">${_renderCellValue(row.properties?.[col.id], col)}</div>
      </div>
    `).join('');

    const modal = document.createElement('div');
    modal.className = 'ntdb-modal-backdrop';
    modal.innerHTML = `
      <div class="ntdb-modal">
        <div class="ntdb-modal-header">
          <h2 class="ntdb-modal-title">${_esc(row.properties?.[titleCol?.id] || 'Sem título')}</h2>
          <button class="ntdb-btn ntdb-btn-icon ntdb-modal-close">&times;</button>
        </div>
        <div class="ntdb-modal-body">
          ${propsHtml}
        </div>
        <div class="ntdb-modal-footer">
          <span style="font-size:0.75rem;color:var(--text-tertiary,#999)">Criado em ${_formatDate(row.created_at)}</span>
          <button class="ntdb-btn ntdb-btn-danger ntdb-modal-delete" data-row-id="${row.id}">
            <i data-lucide="trash-2" style="width:14px;height:14px"></i> Excluir
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    modal.querySelector('.ntdb-modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.ntdb-modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.querySelector('.ntdb-modal-delete')?.addEventListener('click', async () => {
      try {
        await CustomDatabaseRepo.deleteRow(rowId);
        _rows = _rows.filter(r => r.id !== rowId);
        modal.remove();
        _renderContent();
      } catch (err) {
        console.error('[DB-NOTION] Delete row failed:', err);
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  function _esc(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function _formatDate(d) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return ''; }
  }

  // ── Public API ─────────────────────────────────────────────────────────

  return { render, init };
})();

if (typeof window !== 'undefined') {
  window.TBO_DATABASE_NOTION = TBO_DATABASE_NOTION;
}
