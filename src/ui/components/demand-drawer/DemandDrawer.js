/**
 * TBO OS — Demand Drawer (Painel lateral direito de detalhes da demanda)
 *
 * Todos os campos sao editaveis inline. Suporta adicionar novas propriedades.
 * Salva via Supabase automaticamente (autosave com debounce).
 *
 * API:
 *   TBO_DEMAND_DRAWER.open(demand, project)
 *   TBO_DEMAND_DRAWER.close()
 *   TBO_DEMAND_DRAWER.refresh()
 */
const TBO_DEMAND_DRAWER = (() => {
  'use strict';

  let _panel = null;
  let _overlay = null;
  let _isOpen = false;
  let _demand = null;
  let _project = null;
  let _saveTimer = null;
  let _customProps = []; // { key, label, icon, type } — legacy local-only props
  let _dbFieldDefs = [];    // os_custom_fields definitions from DB
  let _dbFieldValues = {};  // { fieldId: valueJson }

  // ── Comments + @mentions state ──
  let _comments = [];
  let _commentUsers = [];     // cached PeopleRepo.list() for autocomplete
  let _showMentionSuggestions = false;
  let _mentionQuery = '';
  let _mentionStartPos = -1;
  let _mentionSelectedIdx = 0;
  let _pendingMentions = [];  // [ { id, name, startIdx, endIdx } ]
  let _commentDocClickBound = false;

  const AUTOSAVE_DELAY = 800;

  // ── Helpers ──────────────────────────────────────

  function _esc(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _initials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function _fmtDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso.slice(0, 10) + 'T12:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso.slice(0, 10); }
  }

  function _isLate(demand) {
    if (!demand.due_date) return false;
    const done = demand.status === 'Concluído' || demand.status === 'Concluido' || demand.status === 'Done' || demand.feito;
    if (done) return false;
    return new Date(demand.due_date) < new Date();
  }

  // ── Comment helpers ─────────────────────────────

  function _avatarColor(name) {
    if (!name) return '#6b7280';
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return `hsl(${((h % 360) + 360) % 360}, 55%, 50%)`;
  }

  function _fmtRelative(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `ha ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `ha ${Math.floor(diff / 3600)}h`;
    if (diff < 172800) return 'ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  function _normalizeSearch(str) {
    return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function _userById(id) {
    return _commentUsers.find(u => u.id === id);
  }

  // ── Status / Priority colors ─────────────────────

  const STATUS_OPTIONS = ['A fazer', 'Backlog', 'Planejamento', 'Em andamento', 'Em revisão', 'Concluído', 'Cancelado'];
  const PRIORITY_OPTIONS = ['Alta', 'Média', 'Baixa'];

  const STATUS_COLORS = {
    'A fazer':      { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    'Backlog':      { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    'Planejamento': { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    'Em andamento': { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    'Em Andamento': { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    'In Progress':  { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    'Em revisão':   { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Em Revisão':   { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Revisão':      { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Review':       { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Concluído':    { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Concluido':    { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Finalizado':   { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Done':         { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Cancelado':    { color: '#9ca3af', bg: 'rgba(156,163,175,0.10)' },
  };

  const PROJECT_STATUS_COLORS = {
    em_andamento: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    producao:     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    finalizado:   { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    parado:       { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    pausado:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  };

  function _statusColor(status) {
    return STATUS_COLORS[status] || { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' };
  }

  function _priorityColor(prioridade) {
    if (!prioridade) return null;
    const p = prioridade.toLowerCase();
    if (p.includes('alta') || p.includes('high') || p.includes('urgente')) return { color: '#ef4444', bg: 'rgba(239,68,68,0.10)' };
    if (p.includes('média') || p.includes('media') || p.includes('medium')) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' };
    if (p.includes('baixa') || p.includes('low')) return { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' };
    return { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' };
  }

  // ── Supabase save ────────────────────────────────

  async function _saveDemand(changes) {
    if (!_demand || !_demand.id) return;
    Object.assign(_demand, changes);
    try {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (!client) return;
      const { error } = await client.from('demands').update(changes).eq('id', _demand.id);
      if (error) console.error('[DD] Save error:', error);
    } catch (e) { console.error('[DD] Save exception:', e); }
  }

  function _scheduleSave(changes) {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => _saveDemand(changes), AUTOSAVE_DELAY);
  }

  // ── DOM creation ─────────────────────────────────

  function _createDOM() {
    if (_panel) return;

    _overlay = document.createElement('div');
    _overlay.className = 'dd-overlay';
    _overlay.addEventListener('click', close);
    document.body.appendChild(_overlay);

    _panel = document.createElement('div');
    _panel.className = 'dd-panel';
    _panel.setAttribute('role', 'dialog');
    _panel.setAttribute('aria-label', 'Detalhes da demanda');

    _panel.innerHTML = `
      <div class="dd-header">
        <span class="dd-header-entity">
          <i data-lucide="clipboard-list"></i>
          DEMANDA
        </span>
        <span class="dd-header-spacer"></span>
        <div class="dd-header-actions">
          <button class="dd-header-btn" id="ddNotionBtn" title="Abrir no Notion" style="display:none;">
            <i data-lucide="external-link"></i>
          </button>
          <button class="dd-header-btn" id="ddCloseBtn" title="Fechar (Esc)">
            <i data-lucide="x"></i>
          </button>
        </div>
      </div>
      <div class="dd-body" id="ddBody"></div>
    `;

    document.body.appendChild(_panel);
    _panel.querySelector('#ddCloseBtn').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _isOpen) close();
    });

    if (window.lucide) lucide.createIcons({ root: _panel });
  }

  // ── Inline edit helpers ──────────────────────────

  function _makeEditable(el, opts) {
    el.classList.add('dd-editable');
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (el.querySelector('.dd-edit-input, .dd-edit-select')) return;

      if (opts.type === 'select') {
        _showSelectEditor(el, opts);
      } else if (opts.type === 'date') {
        _showDateEditor(el, opts);
      } else {
        _showTextEditor(el, opts);
      }
    });
  }

  function _showTextEditor(el, opts) {
    const isDbField = opts.key && opts.key.startsWith('__dbfield_');
    const dbFieldId = isDbField ? opts.key.slice(10) : null;
    const current = isDbField ? (_dbFieldValues[dbFieldId] != null ? String(_dbFieldValues[dbFieldId]) : '') : (_demand[opts.key] || '');
    const input = document.createElement(opts.multiline ? 'textarea' : 'input');
    input.className = 'dd-edit-input';
    if (!opts.multiline) input.type = 'text';
    input.value = current;
    if (opts.placeholder) input.placeholder = opts.placeholder;
    if (opts.multiline) { input.rows = 3; input.style.minHeight = '60px'; }

    const origHtml = el.innerHTML;
    el.innerHTML = '';
    el.appendChild(input);
    input.focus();
    input.select();

    const finish = () => {
      const val = input.value.trim();
      if (val !== current) {
        if (opts._onSave) {
          opts._onSave(val);
        } else {
          _scheduleSave({ [opts.key]: val || null });
          _demand[opts.key] = val || null;
        }
      }
      _refreshBody();
    };

    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !opts.multiline) { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = current; input.blur(); }
    });
  }

  function _showDateEditor(el, opts) {
    const isDbField = opts.key && opts.key.startsWith('__dbfield_');
    const dbFieldId = isDbField ? opts.key.slice(10) : null;
    const current = isDbField ? (_dbFieldValues[dbFieldId] || '') : (_demand[opts.key] || '');
    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'dd-edit-input';
    input.value = current ? current.slice(0, 10) : '';

    const origHtml = el.innerHTML;
    el.innerHTML = '';
    el.appendChild(input);
    input.focus();

    const finish = () => {
      const val = input.value;
      if (val !== (current ? current.slice(0, 10) : '')) {
        if (opts._onSave) {
          opts._onSave(val);
        } else {
          _scheduleSave({ [opts.key]: val || null });
          _demand[opts.key] = val || null;
        }
      }
      _refreshBody();
    };

    input.addEventListener('blur', finish);
    input.addEventListener('change', () => input.blur());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { input.value = current ? current.slice(0, 10) : ''; input.blur(); }
    });
  }

  function _showSelectEditor(el, opts) {
    const isDbField = opts.key && opts.key.startsWith('__dbfield_');
    const dbFieldId = isDbField ? opts.key.slice(10) : null;
    const current = isDbField ? (_dbFieldValues[dbFieldId] || '') : (_demand[opts.key] || '');

    const dropdown = document.createElement('div');
    dropdown.className = 'dd-select-dropdown';

    (opts.options || []).forEach(rawOpt => {
      // Options can be plain strings (built-in) or {value, label} objects (DB fields)
      const optValue = typeof rawOpt === 'object' ? rawOpt.value : rawOpt;
      const optLabel = typeof rawOpt === 'object' ? (rawOpt.label || rawOpt.value) : rawOpt;

      const item = document.createElement('div');
      item.className = 'dd-select-option' + (optValue === current ? ' dd-select-option--active' : '');
      item.textContent = optLabel;

      if (opts.key === 'status') {
        const sc = _statusColor(optValue);
        item.innerHTML = `<span class="dd-select-dot" style="background:${sc.color};"></span> ${_esc(optLabel)}`;
      } else if (opts.key === 'prioridade') {
        const pc = _priorityColor(optValue);
        if (pc) item.innerHTML = `<span class="dd-select-dot" style="background:${pc.color};"></span> ${_esc(optLabel)}`;
      }

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (optValue !== current) {
          if (opts._onSave) {
            opts._onSave(optValue);
          } else {
            _scheduleSave({ [opts.key]: optValue });
            _demand[opts.key] = optValue;
          }
        }
        _closeDropdowns();
        _refreshBody();
      });
      dropdown.appendChild(item);
    });

    // Position dropdown
    el.style.position = 'relative';
    el.appendChild(dropdown);

    // Close on outside click
    const closeHandler = (e) => {
      if (!dropdown.contains(e.target) && e.target !== el) {
        _closeDropdowns();
        document.removeEventListener('click', closeHandler, true);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler, true), 10);
  }

  function _closeDropdowns() {
    if (!_panel) return;
    _panel.querySelectorAll('.dd-select-dropdown').forEach(d => d.remove());
  }

  // ── Refresh body (after edits) ───────────────────

  function _refreshBody() {
    if (!_panel || !_demand) return;
    const body = _panel.querySelector('#ddBody');
    if (body) {
      body.innerHTML = _renderBody(_demand, _project);
      _bindBodyEvents();
      if (window.lucide) lucide.createIcons({ root: body });
    }
  }

  // ── Render body ──────────────────────────────────

  function _renderBody(demand, project) {
    const sc = _statusColor(demand.status);
    const pc = _priorityColor(demand.prioridade);
    const late = _isLate(demand);
    const subtasks = _parseSubtasks(demand);
    const stage = _resolveStage(demand.status);

    return `
      <!-- Title (editable) -->
      <div class="dd-title-section">
        <h2 class="dd-title dd-editable" data-edit="title">${_esc(demand.title || 'Sem titulo')}</h2>
        <div class="dd-status-row">
          <span class="dd-status-badge dd-editable" data-edit="status" style="background:${sc.bg};color:${sc.color};cursor:pointer;">
            ${_esc(demand.status || 'Sem status')}
          </span>
          <span class="dd-priority-badge dd-editable" data-edit="prioridade" style="${pc ? `background:${pc.bg};color:${pc.color};` : 'background:rgba(107,114,128,0.10);color:#6b7280;'}cursor:pointer;">
            <i data-lucide="flag" style="width:11px;height:11px;"></i>
            ${_esc(demand.prioridade || 'Prioridade')}
          </span>
        </div>
      </div>

      <!-- Fields -->
      <div class="dd-fields" id="ddFields">
        ${_renderField('user', 'Responsavel', demand.responsible, 'responsible', 'text', demand.responsible
          ? `<span style="display:inline-flex;align-items:center;gap:6px;">
              <span style="width:22px;height:22px;border-radius:50%;background:var(--accent,#E85102);color:#fff;font-size:9px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">${_initials(demand.responsible)}</span>
              ${_esc(demand.responsible)}
            </span>`
          : null
        )}

        ${_renderField('calendar', 'Data de entrega', demand.due_date, 'due_date', 'date',
          demand.due_date
            ? `<span style="${late ? 'color:#ef4444;font-weight:500;' : ''}">${_fmtDate(demand.due_date)}${demand.due_date_end ? ' &rarr; ' + _fmtDate(demand.due_date_end) : ''}</span>`
            : null
        )}

        ${_renderField('film', 'Tipo de midia', demand.tipo_midia, 'tipo_midia', 'text',
          _renderTipoMidiaHtml(demand.tipo_midia)
        )}

        ${_renderField('file-check', 'Formalizacao', demand.formalizacao, 'formalizacao', 'text')}

        ${_renderField('milestone', 'Milestones', demand.milestones, 'milestones', 'text')}

        <!-- Custom properties (legacy local) -->
        ${_customProps.map(cp => _renderField(cp.icon || 'tag', cp.label, demand[cp.key], cp.key, cp.type || 'text')).join('')}

        <!-- Custom fields from DB (os_custom_fields) -->
        ${_dbFieldDefs.map(fd => {
          const val = _dbFieldValues[fd.id];
          const ico = { text:'type', number:'hash', date:'calendar', select:'list', multi_select:'tags', checkbox:'check-square', url:'link', user:'user' }[fd.type] || 'tag';
          const displayVal = _formatDbFieldValue(fd, val);
          return `
            <div class="dd-field" data-db-field-id="${fd.id}">
              <i data-lucide="${ico}" class="dd-field-icon"></i>
              <span class="dd-field-label">${_esc(fd.name)}</span>
              <span class="dd-field-value dd-editable dd-dbfield-editable" data-dbfield="${fd.id}" data-type="${fd.type}">
                ${displayVal || '<span class="dd-field-value--empty">Adicionar...</span>'}
              </span>
            </div>
          `;
        }).join('')}

        <!-- Linked project (read-only) -->
        ${project ? `
        <div class="dd-field" style="align-items:flex-start;">
          <i data-lucide="folder" class="dd-field-icon" style="margin-top:10px;"></i>
          <span class="dd-field-label" style="margin-top:8px;">Projeto vinculado</span>
          <span class="dd-field-value">
            <div class="dd-linked-project" onclick="TBO_DEMAND_DRAWER.close();if(typeof TBO_ROUTER!=='undefined')TBO_ROUTER.navigate('projeto/${project.id}');">
              <span class="dd-linked-project-name">${_esc(project.name)}</span>
              <div class="dd-linked-project-meta">
                ${stage ? `<span class="dd-linked-project-stage">${_esc(stage)}</span>` : ''}
                ${project.status ? (() => {
                  const psc = PROJECT_STATUS_COLORS[project.status] || { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };
                  return `<span class="dd-linked-project-status" style="background:${psc.bg};color:${psc.color};">${_esc(_projectStatusLabel(project.status))}</span>`;
                })() : ''}
              </div>
            </div>
          </span>
        </div>
        ` : ''}

        <!-- Add property button -->
        <div class="dd-add-property" id="ddAddProperty">
          <i data-lucide="plus" style="width:13px;height:13px;"></i>
          Adicionar propriedade
        </div>
      </div>

      <!-- Description (editable) -->
      <div class="dd-section">
        <div class="dd-section-header">
          <i data-lucide="align-left"></i>
          Descricao
        </div>
        <div class="dd-description-text dd-editable" data-edit="info">${demand.info ? _esc(demand.info) : '<span class="dd-description-empty">Clique para adicionar descricao...</span>'}</div>
      </div>

      <!-- Subtasks -->
      <div class="dd-section">
        <div class="dd-section-header">
          <i data-lucide="list-checks"></i>
          Subtarefas
          ${subtasks.length > 0 ? `<span class="dd-section-header-count">${subtasks.filter(s => s.done).length}/${subtasks.length}</span>` : ''}
        </div>
        ${subtasks.length > 0 ? _renderSubtasks(subtasks) : ''}
        <div class="dd-add-subtask" id="ddAddSubtask">
          <i data-lucide="plus" style="width:13px;height:13px;"></i>
          Adicionar subtarefa
        </div>
      </div>

      <!-- Attachments -->
      <div class="dd-section">
        <div class="dd-section-header">
          <i data-lucide="paperclip"></i>
          Anexos
        </div>
        <div class="dd-attachments-empty">Nenhum anexo.</div>
      </div>

      <!-- Comments -->
      <div class="dd-section" id="ddCommentsSection">
        <div class="dd-section-header">
          <i data-lucide="message-circle"></i>
          Comentarios
          ${_comments.length > 0 ? `<span class="dd-section-header-count">${_comments.length}</span>` : ''}
        </div>
        <div class="dd-comments-list" id="ddCommentsList"></div>
        <div class="dd-comment-input-wrapper">
          <textarea class="dd-comment-input" placeholder="Escrever um comentario... Use @ para mencionar" rows="1" id="ddCommentInput"></textarea>
          <button class="dd-comment-send" id="ddCommentSend" title="Enviar comentario (Enter)">
            <i data-lucide="send"></i>
          </button>
        </div>
      </div>

      <!-- Collaborators -->
      <div class="dd-section">
        <div class="dd-section-header">
          <i data-lucide="users"></i>
          Colaboradores
        </div>
        <div class="dd-collaborators">
          ${demand.responsible
            ? `<div class="dd-collaborator" title="${_esc(demand.responsible)}">${_initials(demand.responsible)}</div>`
            : ''}
          ${project && project.owner_name && project.owner_name !== demand.responsible
            ? `<div class="dd-collaborator" title="${_esc(project.owner_name)}" style="background:#8b5cf6;">${_initials(project.owner_name)}</div>`
            : ''}
          <div class="dd-add-collaborator" title="Adicionar colaborador">
            <i data-lucide="plus"></i>
          </div>
        </div>
      </div>

      <!-- Notion link -->
      ${demand.notion_url ? `
        <div class="dd-section" style="border-bottom:none;">
          <a href="${_esc(demand.notion_url)}" target="_blank" class="dd-notion-link" onclick="event.stopPropagation()">
            <i data-lucide="external-link"></i>
            Abrir no Notion
          </a>
        </div>
      ` : ''}
    `;
  }

  function _formatDbFieldValue(fd, val) {
    if (val === undefined || val === null) return null;
    switch (fd.type) {
      case 'text': case 'user': return _esc(String(val));
      case 'number': return _esc(String(val));
      case 'date': return val ? _fmtDate(val) : null;
      case 'checkbox': return val ? '<i data-lucide="check-square" style="width:14px;height:14px;color:var(--accent,#E85102);"></i>' : '<i data-lucide="square" style="width:14px;height:14px;opacity:0.4;"></i>';
      case 'url': return val ? `<a href="${_esc(val)}" target="_blank" onclick="event.stopPropagation()" style="color:var(--accent,#E85102);text-decoration:none;font-size:0.82rem;">${_esc(val.length > 35 ? val.slice(0, 35) + '…' : val)}</a>` : null;
      case 'select': {
        const opts = (fd.config_json && fd.config_json.options) || [];
        const opt = opts.find(o => o.value === val);
        const c = opt ? (opt.color || '#6b7280') : '#6b7280';
        return `<span style="background:${c}20;color:${c};padding:2px 8px;border-radius:9999px;font-size:0.78rem;font-weight:500;">${_esc(val)}</span>`;
      }
      case 'multi_select': {
        if (!Array.isArray(val) || val.length === 0) return null;
        const opts = (fd.config_json && fd.config_json.options) || [];
        return val.map(v => {
          const opt = opts.find(o => o.value === v);
          const c = opt ? (opt.color || '#6b7280') : '#6b7280';
          return `<span style="background:${c}20;color:${c};padding:1px 6px;border-radius:9999px;font-size:0.72rem;font-weight:500;margin-right:3px;">${_esc(v)}</span>`;
        }).join('');
      }
      default: return _esc(String(val));
    }
  }

  function _renderField(icon, label, value, key, type, customHtml) {
    const displayEmpty = '<span class="dd-field-value--empty">Adicionar...</span>';
    const displayValue = customHtml || (value ? _esc(String(value)) : null);

    return `
      <div class="dd-field">
        <i data-lucide="${_esc(icon)}" class="dd-field-icon"></i>
        <span class="dd-field-label">${_esc(label)}</span>
        <span class="dd-field-value dd-editable" data-edit="${_esc(key)}" data-type="${_esc(type)}">
          ${displayValue || displayEmpty}
        </span>
      </div>
    `;
  }

  // ── DB custom field save ─────────────────────────

  async function _saveDbFieldValue(fieldId, value) {
    if (!_demand || !_demand.id) return;
    _dbFieldValues[fieldId] = value;
    try {
      if (typeof DemandFieldsRepo !== 'undefined') {
        await DemandFieldsRepo.upsertValue(_demand.id, fieldId, value);
      }
    } catch (e) { console.error('[DD] DB field save error:', e); }
  }

  function _makeDbFieldEditable(el, fieldId, opts) {
    el.classList.add('dd-editable');
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (el.querySelector('.dd-edit-input, .dd-edit-select')) return;

      if (opts.type === 'select') {
        _showSelectEditor(el, {
          key: '__dbfield_' + fieldId,
          type: 'select',
          options: opts.options || [],
          _onSave: (val) => _saveDbFieldValue(fieldId, val || null),
        });
      } else if (opts.type === 'date') {
        _showDateEditor(el, {
          key: '__dbfield_' + fieldId,
          type: 'date',
          _onSave: (val) => _saveDbFieldValue(fieldId, val || null),
        });
      } else {
        _showTextEditor(el, {
          key: '__dbfield_' + fieldId,
          type: 'text',
          placeholder: opts.placeholder || '',
          _onSave: (val) => {
            const finalVal = opts.type === 'number' ? (val === '' ? null : Number(val)) : (val || null);
            _saveDbFieldValue(fieldId, finalVal);
          },
        });
      }
    });
  }

  // ── Bind events on body ──────────────────────────

  function _bindBodyEvents() {
    if (!_panel || !_demand) return;
    const body = _panel.querySelector('#ddBody');
    if (!body) return;

    // Title edit
    const titleEl = body.querySelector('.dd-title[data-edit="title"]');
    if (titleEl) {
      _makeEditable(titleEl, { key: 'title', type: 'text', placeholder: 'Titulo da demanda' });
    }

    // Status select
    const statusEl = body.querySelector('[data-edit="status"]');
    if (statusEl) {
      _makeEditable(statusEl, { key: 'status', type: 'select', options: STATUS_OPTIONS });
    }

    // Priority select
    const prioEl = body.querySelector('[data-edit="prioridade"]');
    if (prioEl) {
      _makeEditable(prioEl, { key: 'prioridade', type: 'select', options: PRIORITY_OPTIONS });
    }

    // Field edits
    body.querySelectorAll('.dd-field-value.dd-editable[data-edit]').forEach(el => {
      const key = el.dataset.edit;
      const type = el.dataset.type || 'text';
      if (key === 'status' || key === 'prioridade') return; // already bound above

      if (type === 'date') {
        _makeEditable(el, { key, type: 'date' });
      } else {
        _makeEditable(el, { key, type: 'text', placeholder: 'Adicionar...' });
      }
    });

    // Description edit
    const descEl = body.querySelector('.dd-description-text[data-edit="info"]');
    if (descEl) {
      _makeEditable(descEl, { key: 'info', type: 'text', multiline: true, placeholder: 'Adicionar descricao...' });
    }

    // DB custom field edits
    body.querySelectorAll('.dd-dbfield-editable[data-dbfield]').forEach(el => {
      const fieldId = el.dataset.dbfield;
      const fd = _dbFieldDefs.find(f => f.id === fieldId);
      if (!fd) return;

      if (fd.type === 'checkbox') {
        el.style.cursor = 'pointer';
        el.addEventListener('click', async (e) => {
          e.stopPropagation();
          const cur = _dbFieldValues[fieldId];
          const newVal = !cur;
          await _saveDbFieldValue(fieldId, newVal);
          _refreshBody();
        });
      } else if (fd.type === 'multi_select') {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const opts = (fd.config_json && fd.config_json.options) || [];
          const cur = Array.isArray(_dbFieldValues[fieldId]) ? _dbFieldValues[fieldId].join(', ') : '';
          const input = prompt(`${fd.name} (separar por virgula):\nOpcoes: ${opts.map(o => o.value).join(', ')}`, cur);
          if (input !== null) {
            const arr = input.split(',').map(s => s.trim()).filter(Boolean);
            _saveDbFieldValue(fieldId, arr).then(() => _refreshBody());
          }
        });
      } else if (fd.type === 'select') {
        const opts = (fd.config_json && fd.config_json.options) || [];
        _makeDbFieldEditable(el, fieldId, {
          type: 'select',
          options: [{ value: '', label: '— Nenhum —' }, ...opts.map(o => ({ value: o.value, label: o.value }))],
        });
      } else if (fd.type === 'date') {
        _makeDbFieldEditable(el, fieldId, { type: 'date' });
      } else if (fd.type === 'number') {
        _makeDbFieldEditable(el, fieldId, { type: 'text', placeholder: '0' });
      } else {
        _makeDbFieldEditable(el, fieldId, { type: 'text', placeholder: 'Adicionar...' });
      }
    });

    // Add property button
    const addPropBtn = body.querySelector('#ddAddProperty');
    if (addPropBtn) {
      addPropBtn.addEventListener('click', _showAddPropertyModal);
    }

    // Add subtask
    const addSubBtn = body.querySelector('#ddAddSubtask');
    if (addSubBtn) {
      addSubBtn.addEventListener('click', _addSubtask);
    }

    // Subtask checkboxes
    body.querySelectorAll('.dd-subtask-check').forEach((chk, i) => {
      chk.addEventListener('click', () => _toggleSubtask(i));
    });

    // Comment events are bound separately in _bindCommentEvents()
  }

  // ── Add property modal ───────────────────────────

  function _showAddPropertyModal() {
    _closeDropdowns();
    const container = _panel.querySelector('#ddAddProperty');
    if (!container) return;

    // Check if already showing
    if (container.parentElement.querySelector('.dd-add-prop-form')) return;

    const form = document.createElement('div');
    form.className = 'dd-add-prop-form';
    form.innerHTML = `
      <input class="dd-edit-input" type="text" placeholder="Nome da propriedade" id="ddNewPropName" style="margin-bottom:6px;">
      <select class="dd-edit-input" id="ddNewPropType" style="margin-bottom:6px;">
        <option value="text">Texto</option>
        <option value="number">Numero</option>
        <option value="date">Data</option>
        <option value="select">Selecao</option>
        <option value="multi_select">Multi-selecao</option>
        <option value="checkbox">Checkbox</option>
        <option value="url">URL</option>
        <option value="user">Pessoa</option>
      </select>
      <div style="display:flex;gap:6px;">
        <button class="dd-add-prop-btn dd-add-prop-confirm" id="ddNewPropOk">Criar</button>
        <button class="dd-add-prop-btn dd-add-prop-cancel" id="ddNewPropCancel">Cancelar</button>
      </div>
    `;

    container.after(form);

    const nameInput = form.querySelector('#ddNewPropName');
    nameInput.focus();

    form.querySelector('#ddNewPropOk').addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const type = form.querySelector('#ddNewPropType').value;
      if (!name) return;

      // Create DB-backed custom field via DemandFieldsRepo
      if (typeof DemandFieldsRepo !== 'undefined' && _demand && _demand.project_id) {
        try {
          const newField = await DemandFieldsRepo.createField({
            name,
            type,
            project_id: _demand.project_id,
            config_json: (type === 'select' || type === 'multi_select')
              ? { options: [] } : {},
          });
          if (newField) {
            _dbFieldDefs.push(newField);
          }
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Campo criado');
        } catch (e) {
          console.error('[DD] Create field error:', e);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao criar campo');
        }
      } else {
        // Fallback: local-only prop (legacy)
        const key = '_custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        _customProps.push({ key, label: name, icon: 'tag', type });
        _demand[key] = null;
      }

      form.remove();
      _refreshBody();
    });

    form.querySelector('#ddNewPropCancel').addEventListener('click', () => form.remove());
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') form.querySelector('#ddNewPropOk').click();
      if (e.key === 'Escape') form.querySelector('#ddNewPropCancel').click();
    });
  }

  // ── Subtask helpers ──────────────────────────────

  function _parseSubtasks(demand) {
    if (!demand.subitem && !demand.item_principal) return [];
    const items = [];
    if (demand.subitem) {
      const parts = demand.subitem.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => {
        const done = p.startsWith('[x]') || p.startsWith('[X]');
        const title = done ? p.slice(3).trim() : p.replace(/^\[\s?\]\s*/, '');
        items.push({ title, done });
      });
    }
    return items;
  }

  function _serializeSubtasks(subtasks) {
    return subtasks.map(s => (s.done ? '[x] ' : '') + s.title).join(', ');
  }

  function _renderSubtasks(subtasks) {
    const doneCount = subtasks.filter(s => s.done).length;
    const pct = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0;

    return `
      <div class="dd-subtasks-progress">
        <div class="dd-subtasks-bar-track">
          <div class="dd-subtasks-bar-fill" style="width:${pct}%;"></div>
        </div>
        <span class="dd-subtasks-bar-label">${pct}%</span>
      </div>
      ${subtasks.map((s, i) => `
        <div class="dd-subtask-item" data-subtask-idx="${i}">
          <div class="dd-subtask-check ${s.done ? 'dd-subtask-check--done' : ''}">
            ${s.done ? '<i data-lucide="check" style="width:10px;height:10px;"></i>' : ''}
          </div>
          <span class="dd-subtask-title ${s.done ? 'dd-subtask-title--done' : ''}">${_esc(s.title)}</span>
        </div>
      `).join('')}
    `;
  }

  function _toggleSubtask(idx) {
    const subtasks = _parseSubtasks(_demand);
    if (!subtasks[idx]) return;
    subtasks[idx].done = !subtasks[idx].done;
    _demand.subitem = _serializeSubtasks(subtasks);
    _scheduleSave({ subitem: _demand.subitem });
    _refreshBody();
  }

  function _addSubtask() {
    const container = _panel.querySelector('#ddAddSubtask');
    if (!container || container.querySelector('.dd-edit-input')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'dd-edit-input';
    input.placeholder = 'Nova subtarefa...';
    input.style.marginTop = '6px';
    container.before(input);
    input.focus();

    const finish = () => {
      const val = input.value.trim();
      if (val) {
        const current = _demand.subitem ? _demand.subitem + ', ' + val : val;
        _demand.subitem = current;
        _scheduleSave({ subitem: current });
      }
      input.remove();
      _refreshBody();
    };

    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = ''; input.blur(); }
    });
  }

  // ── Misc helpers ─────────────────────────────────

  function _renderTipoMidiaHtml(tipoMidia) {
    if (!tipoMidia) return null;
    let arr = tipoMidia;
    if (typeof tipoMidia === 'string') {
      try { arr = JSON.parse(tipoMidia); } catch { arr = [tipoMidia]; }
    }
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr.map(t => `<span style="display:inline-block;font-size:11px;font-weight:500;padding:2px 7px;border-radius:4px;background:rgba(139,92,246,0.1);color:#7c3aed;margin-right:4px;">${_esc(t)}</span>`).join('');
  }

  function _resolveStage(status) {
    if (!status) return '';
    const s = status.toLowerCase();
    if (['a fazer', 'backlog', 'planejamento'].includes(s)) return 'Planejamento';
    if (['em andamento', 'in progress'].includes(s)) return 'Execucao';
    if (['em revisão', 'em revisao', 'revisão', 'revisao', 'review'].includes(s)) return 'Revisao';
    if (['concluído', 'concluido', 'finalizado', 'done', 'cancelado'].includes(s)) return 'Finalizacao';
    return '';
  }

  function _projectStatusLabel(status) {
    const map = {
      em_andamento: 'Em Andamento',
      producao: 'Em Producao',
      finalizado: 'Finalizado',
      parado: 'Parado',
      pausado: 'Pausado',
    };
    return map[status] || status || '';
  }

  // ── Comments: load, render, CRUD ─────────────────

  async function _loadCommentUsers() {
    try {
      if (typeof PeopleRepo !== 'undefined') {
        _commentUsers = await PeopleRepo.list({ is_active: true, limit: 200 }) || [];
      }
    } catch (e) { console.warn('[DD] Load comment users:', e); }
  }

  async function _loadComments() {
    if (!_demand || !_demand.id) return;
    try {
      if (typeof DemandCommentsRepo !== 'undefined') {
        _comments = await DemandCommentsRepo.list(_demand.id) || [];
      }
    } catch (e) { console.warn('[DD] Load comments:', e); }
    _renderCommentsList();
  }

  function _renderCommentsList() {
    const container = _panel ? _panel.querySelector('#ddCommentsList') : null;
    if (!container) return;

    const currentUserId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.supabaseId : null;

    if (_comments.length === 0) {
      container.innerHTML = '<div class="dd-comments-empty">Nenhum comentario ainda.</div>';
      return;
    }

    container.innerHTML = _comments.map(c => {
      const user = _userById(c.author_id);
      const name = user ? (user.full_name || user.email) : 'Usuario';
      const isOwn = c.author_id === currentUserId;
      const color = _avatarColor(name);

      return `
        <div class="dd-comment" data-comment-id="${c.id}">
          <div class="dd-comment-avatar" style="background:${color};" title="${_esc(name)}">
            ${_initials(name)}
          </div>
          <div class="dd-comment-body">
            <div class="dd-comment-meta">
              <span class="dd-comment-author">${_esc(name)}</span>
              <span class="dd-comment-time">${_fmtRelative(c.created_at)}</span>
              ${isOwn ? '<button class="dd-comment-delete" data-comment-id="' + c.id + '" title="Excluir"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>' : ''}
            </div>
            <div class="dd-comment-text">${_renderCommentContent(c.content, currentUserId)}</div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons({ root: container });

    // Bind delete buttons
    container.querySelectorAll('.dd-comment-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        _deleteComment(btn.dataset.commentId);
      });
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  function _renderCommentContent(content, currentUserId) {
    if (!content) return '';
    // Replace <@userId> tokens with mention chips
    return _esc(content).replace(/&lt;@([\w-]+)&gt;/g, (match, userId) => {
      const user = _userById(userId);
      const name = user ? (user.full_name || user.email) : 'usuario';
      const isSelf = userId === currentUserId;
      return `<span class="dd-mention${isSelf ? ' dd-mention-self' : ''}" data-user-id="${userId}">@${_esc(name)}</span>`;
    });
  }

  async function _sendComment() {
    if (!_demand || !_demand.id) return;
    const textarea = _panel ? _panel.querySelector('#ddCommentInput') : null;
    if (!textarea) return;

    // Use untrimmed text for _buildMentionData (indices match textarea.value)
    const rawText = textarea.value;
    if (!rawText.trim()) return;

    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    if (!currentUser) return;

    if (typeof DemandCommentsRepo === 'undefined') {
      console.error('[DD] DemandCommentsRepo not loaded');
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro: modulo de comentarios nao carregado');
      return;
    }

    try {
      // Tokenize: replace @FullName with <@userId>
      const { content, mentions } = _buildMentionData(rawText);
      const finalContent = content.trim();
      if (!finalContent) return;

      const tenantId = typeof RepoBase !== 'undefined' ? RepoBase.requireTenantId() : null;

      const created = await DemandCommentsRepo.create({
        demand_id: _demand.id,
        author_id: currentUser.supabaseId,
        content: finalContent,
        mentions,
      });

      // Clear input
      textarea.value = '';
      textarea.style.height = 'auto';
      _pendingMentions = [];
      _closeMentionSuggestions();

      // Add to local list & re-render
      _comments.push(created);
      _renderCommentsList();

      // Update comment count in header
      const countEl = _panel ? _panel.querySelector('#ddCommentsSection .dd-section-header-count') : null;
      if (countEl) {
        countEl.textContent = _comments.length;
      } else {
        const header = _panel ? _panel.querySelector('#ddCommentsSection .dd-section-header') : null;
        if (header && _comments.length > 0) {
          const span = document.createElement('span');
          span.className = 'dd-section-header-count';
          span.textContent = _comments.length;
          header.appendChild(span);
        }
      }

      // Notify mentioned users (fire-and-forget)
      _notifyMentionedUsers(mentions, created, tenantId);

    } catch (e) {
      console.error('[DD] Send comment error:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao enviar comentario');
    }
  }

  async function _deleteComment(commentId) {
    if (!confirm('Excluir este comentario?')) return;
    try {
      await DemandCommentsRepo.remove(commentId);
      _comments = _comments.filter(c => c.id !== commentId);
      _renderCommentsList();
      // Update count
      const countEl = _panel ? _panel.querySelector('#ddCommentsSection .dd-section-header-count') : null;
      if (countEl) countEl.textContent = _comments.length || '';
    } catch (e) {
      console.error('[DD] Delete comment error:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao excluir comentario');
    }
  }

  function _notifyMentionedUsers(mentions, comment, tenantId) {
    if (!mentions || !mentions.length) return;
    if (typeof TBO_NOTIFICATIONS === 'undefined') return;
    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    if (!currentUser) return;

    const senderName = currentUser.name || 'Alguem';
    const demandTitle = _demand ? (_demand.title || 'demanda') : 'demanda';
    const projectId = _demand ? _demand.project_id : '';
    const notifiedIds = new Set();

    for (const m of mentions) {
      if (m.id === currentUser.supabaseId) continue; // dont notify self
      if (notifiedIds.has(m.id)) continue;
      notifiedIds.add(m.id);

      TBO_NOTIFICATIONS.create(m.id, {
        title: `${senderName} mencionou voce`,
        body: `em "${demandTitle.slice(0, 60)}"`,
        type: 'mention',
        entityType: 'demand',
        entityId: _demand ? _demand.id : '',
        actionUrl: projectId ? `#/projetos/${projectId}` : '',
        tenantId: tenantId || '',
      }).catch(e => console.warn('[DD] Mention notify error:', e.message));
    }
  }

  // ── @Mentions engine ────────────────────────────

  function _buildMentionData(rawContent) {
    if (!_pendingMentions.length) {
      return { content: rawContent, mentions: [] };
    }

    // Validate mentions still match text
    const validMentions = _pendingMentions.filter(m => {
      if (m.startIdx < 0 || m.endIdx > rawContent.length) return false;
      return rawContent.slice(m.startIdx, m.endIdx) === '@' + m.name;
    });

    if (!validMentions.length) {
      return { content: rawContent, mentions: [] };
    }

    // Replace from end to start for safe index handling
    const sorted = [...validMentions].sort((a, b) => b.startIdx - a.startIdx);
    let tokenContent = rawContent;
    const mentionsArr = [];
    const seenIds = new Set();

    for (const mention of sorted) {
      tokenContent = tokenContent.slice(0, mention.startIdx) + '<@' + mention.id + '>' + tokenContent.slice(mention.endIdx);
      if (!seenIds.has(mention.id)) {
        mentionsArr.push({ id: mention.id, name: mention.name });
        seenIds.add(mention.id);
      }
    }
    return { content: tokenContent, mentions: mentionsArr };
  }

  function _checkMentionTrigger() {
    const input = _panel ? _panel.querySelector('#ddCommentInput') : null;
    if (!input) return;

    const pos = input.selectionStart;
    const text = input.value;

    // Find last @ before cursor
    let atPos = -1;
    for (let i = pos - 1; i >= 0; i--) {
      if (text[i] === '@') {
        if (i === 0 || /[\s\n]/.test(text[i - 1])) atPos = i;
        break;
      }
      if (text[i] === '\n') break;
    }

    if (atPos >= 0) {
      const query = text.slice(atPos + 1, pos);
      if (query.length > 30) { _closeMentionSuggestions(); return; }
      if (/[\t]/.test(query)) { _closeMentionSuggestions(); return; }

      // Check if this is a completed mention
      const isCompleted = _pendingMentions.some(m =>
        m.startIdx === atPos && m.endIdx <= pos && m.endIdx >= pos
      );
      if (isCompleted) { _closeMentionSuggestions(); return; }

      _mentionStartPos = atPos + 1;
      _mentionQuery = query;
      _showMentionSuggestions = true;
      _mentionSelectedIdx = 0;
      _renderMentionSuggestions();
    } else {
      _closeMentionSuggestions();
    }
  }

  function _renderMentionSuggestions() {
    const wrapper = _panel ? _panel.querySelector('.dd-comment-input-wrapper') : null;
    if (!wrapper) return;

    // Remove existing
    let dropdown = wrapper.querySelector('.dd-mention-suggestions');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'dd-mention-suggestions';
      wrapper.appendChild(dropdown);
    }

    const q = _normalizeSearch(_mentionQuery);
    const qWords = q.split(/\s+/).filter(Boolean);
    const currentUserId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.supabaseId : null;

    // 4-tier ranking
    const tier1 = [], tier2 = [], tier3 = [], tier4 = [];
    for (const u of _commentUsers) {
      const normName = _normalizeSearch(u.full_name || '');
      const normEmail = _normalizeSearch(u.email || '');

      if (!q) { tier1.push(u); continue; }

      if (qWords.length > 1) {
        const nameWords = normName.split(/\s+/);
        const allMatch = qWords.every(qw => nameWords.some(nw => nw.startsWith(qw) || nw.includes(qw)));
        if (allMatch) { tier1.push(u); continue; }
      }

      if (normName.startsWith(q)) { tier1.push(u); }
      else if (normName.split(/\s+/).some(w => w.startsWith(q))) { tier2.push(u); }
      else if (normName.includes(q)) { tier3.push(u); }
      else if (normEmail.includes(q)) { tier4.push(u); }
    }

    const filtered = [...tier1, ...tier2, ...tier3, ...tier4].slice(0, 8);

    if (!filtered.length) {
      dropdown.innerHTML = '<div class="dd-mention-empty"><span>Nenhum usuario encontrado</span></div>';
      dropdown.style.display = 'block';
      return;
    }

    if (_mentionSelectedIdx >= filtered.length) _mentionSelectedIdx = 0;

    const _highlightMatch = (text, query) => {
      if (!query) return _esc(text);
      const normText = _normalizeSearch(text);
      const normQ = _normalizeSearch(query);
      const idx = normText.indexOf(normQ);
      if (idx < 0) return _esc(text);
      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + query.length);
      const after = text.slice(idx + query.length);
      return `${_esc(before)}<mark class="dd-mention-highlight">${_esc(match)}</mark>${_esc(after)}`;
    };

    dropdown.innerHTML = '<div class="dd-mention-header">Mencionar alguem</div>' +
      filtered.map((u, i) => {
        const name = u.full_name || u.email || '';
        const role = u.cargo || u.role || '';
        const color = _avatarColor(name);
        const nameHtml = q ? _highlightMatch(name, _mentionQuery) : _esc(name);
        const isSelf = u.id === currentUserId;
        return `<div class="dd-mention-item ${i === _mentionSelectedIdx ? 'active' : ''}" data-user-id="${u.id}" data-user-name="${_esc(name)}" data-idx="${i}">
          <div class="dd-mention-item-avatar" style="background:${color};">${_initials(name)}</div>
          <div class="dd-mention-item-info">
            <span class="dd-mention-item-name">${nameHtml}${isSelf ? ' <span style="opacity:0.5;font-size:11px;">(voce)</span>' : ''}</span>
            ${role ? `<span class="dd-mention-role">${_esc(role)}</span>` : ''}
          </div>
        </div>`;
      }).join('');

    dropdown.style.display = 'block';

    // Bind mousedown (not click) to avoid blur
    dropdown.querySelectorAll('.dd-mention-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        _selectMention(item.dataset.userId);
      });
    });
  }

  function _selectMention(userId) {
    const user = _commentUsers.find(u => u.id === userId);
    if (!user) return;

    const input = _panel ? _panel.querySelector('#ddCommentInput') : null;
    if (!input) return;

    const text = input.value;
    const atPos = _mentionStartPos - 1; // Position of @
    const cursorPos = input.selectionStart;
    const before = text.slice(0, atPos);
    const after = text.slice(cursorPos);
    const name = user.full_name || user.email || '';
    const mentionText = '@' + name;
    const newFragment = mentionText + ' ';

    // Adjust existing mention indices
    const oldLength = cursorPos - atPos;
    const delta = newFragment.length - oldLength;
    _pendingMentions.forEach(m => {
      if (m.startIdx >= cursorPos) { m.startIdx += delta; m.endIdx += delta; }
      else if (m.startIdx > atPos && m.startIdx < cursorPos) { m._invalid = true; }
    });
    _pendingMentions = _pendingMentions.filter(m => !m._invalid);

    input.value = before + newFragment + after;
    const newCursorPos = before.length + newFragment.length;
    input.focus();
    input.selectionStart = input.selectionEnd = newCursorPos;

    // Auto-resize
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';

    // Track pending mention
    _pendingMentions.push({
      id: user.id,
      name: name,
      startIdx: atPos,
      endIdx: atPos + mentionText.length,
    });

    _closeMentionSuggestions();
  }

  function _navigateMentionSuggestions(dir) {
    const wrapper = _panel ? _panel.querySelector('.dd-comment-input-wrapper') : null;
    if (!wrapper) return;
    const items = wrapper.querySelectorAll('.dd-mention-item');
    if (!items.length) return;
    items.forEach(item => item.classList.remove('active'));
    _mentionSelectedIdx += dir;
    if (_mentionSelectedIdx < 0) _mentionSelectedIdx = items.length - 1;
    if (_mentionSelectedIdx >= items.length) _mentionSelectedIdx = 0;
    const activeItem = items[_mentionSelectedIdx];
    activeItem.classList.add('active');
    activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function _closeMentionSuggestions() {
    _showMentionSuggestions = false;
    _mentionSelectedIdx = 0;
    _mentionQuery = '';
    _mentionStartPos = -1;
    const dropdown = _panel ? _panel.querySelector('.dd-mention-suggestions') : null;
    if (dropdown) dropdown.style.display = 'none';
  }

  // ── Bind comment events ─────────────────────────

  function _bindCommentEvents() {
    if (!_panel) return;

    const textarea = _panel.querySelector('#ddCommentInput');
    const sendBtn = _panel.querySelector('#ddCommentSend');

    if (textarea) {
      // Input: auto-grow + mention trigger
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
        _checkMentionTrigger();
      });

      // Keydown: Enter sends, arrows navigate, Escape closes, Tab selects
      textarea.addEventListener('keydown', (e) => {
        if (_showMentionSuggestions) {
          if (e.key === 'ArrowDown') { e.preventDefault(); _navigateMentionSuggestions(1); return; }
          if (e.key === 'ArrowUp') { e.preventDefault(); _navigateMentionSuggestions(-1); return; }
          if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
            const items = _panel.querySelectorAll('.dd-mention-item');
            if (items.length > 0 && items[_mentionSelectedIdx]) {
              _selectMention(items[_mentionSelectedIdx].dataset.userId);
            }
            return;
          }
          if (e.key === 'Escape') { e.preventDefault(); _closeMentionSuggestions(); return; }
        }

        // Enter without Shift sends comment
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          _sendComment();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => _sendComment());
    }

    // Close mention suggestions on outside click
    if (!_commentDocClickBound) {
      _commentDocClickBound = true;
      document.addEventListener('click', (e) => {
        if (!_showMentionSuggestions) return;
        const dropdown = _panel ? _panel.querySelector('.dd-mention-suggestions') : null;
        const textarea = _panel ? _panel.querySelector('#ddCommentInput') : null;
        if (dropdown && !dropdown.contains(e.target) && e.target !== textarea) {
          _closeMentionSuggestions();
        }
      });
    }
  }

  // ── Public API ───────────────────────────────────

  async function open(demand, project) {
    if (!demand) return;
    _createDOM();
    _demand = { ...demand };
    _project = project || null;

    // Load custom fields from DB
    _dbFieldDefs = [];
    _dbFieldValues = {};
    try {
      if (typeof DemandFieldsRepo !== 'undefined' && demand.project_id) {
        const [defs, vals] = await Promise.all([
          DemandFieldsRepo.listFields(demand.project_id),
          DemandFieldsRepo.listValues(demand.id),
        ]);
        _dbFieldDefs = defs || [];
        (vals || []).forEach(v => { _dbFieldValues[v.field_id] = v.value_json; });
      }
    } catch (e) { console.warn('[DD] Custom fields load:', e); }

    // Reset comments state
    _comments = [];
    _pendingMentions = [];
    _showMentionSuggestions = false;

    const body = _panel.querySelector('#ddBody');
    if (body) {
      body.innerHTML = _renderBody(_demand, _project);
      _bindBodyEvents();
      _bindCommentEvents();
    }

    // Load comment users + comments (non-blocking)
    _loadCommentUsers().then(() => _loadComments());

    // Notion button
    const notionBtn = _panel.querySelector('#ddNotionBtn');
    if (notionBtn) {
      if (demand.notion_url) {
        notionBtn.style.display = '';
        notionBtn.onclick = () => window.open(demand.notion_url, '_blank');
      } else {
        notionBtn.style.display = 'none';
      }
    }

    requestAnimationFrame(() => {
      _overlay.classList.add('dd-overlay--visible');
      _panel.classList.add('dd-panel--open');
    });
    _isOpen = true;

    if (window.lucide) lucide.createIcons({ root: _panel });
  }

  function close() {
    if (!_panel || !_isOpen) return;
    clearTimeout(_saveTimer);
    _closeMentionSuggestions();
    _panel.classList.remove('dd-panel--open');
    _overlay.classList.remove('dd-overlay--visible');
    _isOpen = false;
    _demand = null;
    _project = null;
    _comments = [];
    _pendingMentions = [];
  }

  function refresh() {
    if (_isOpen && _demand) _refreshBody();
  }

  return {
    open,
    close,
    refresh,
    get isOpen() { return _isOpen; },
    get currentDemand() { return _demand ? { ..._demand } : null; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_DEMAND_DRAWER = TBO_DEMAND_DRAWER;
}
