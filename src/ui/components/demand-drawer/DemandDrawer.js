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
  let _customProps = []; // { key, label, icon, type }

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
    const current = _demand[opts.key] || '';
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
        _scheduleSave({ [opts.key]: val || null });
        _demand[opts.key] = val || null;
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
    const current = _demand[opts.key] || '';
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
        _scheduleSave({ [opts.key]: val || null });
        _demand[opts.key] = val || null;
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
    const current = _demand[opts.key] || '';
    const dropdown = document.createElement('div');
    dropdown.className = 'dd-select-dropdown';

    (opts.options || []).forEach(opt => {
      const item = document.createElement('div');
      item.className = 'dd-select-option' + (opt === current ? ' dd-select-option--active' : '');
      item.textContent = opt;

      if (opts.key === 'status') {
        const sc = _statusColor(opt);
        item.innerHTML = `<span class="dd-select-dot" style="background:${sc.color};"></span> ${_esc(opt)}`;
      } else if (opts.key === 'prioridade') {
        const pc = _priorityColor(opt);
        if (pc) item.innerHTML = `<span class="dd-select-dot" style="background:${pc.color};"></span> ${_esc(opt)}`;
      }

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (opt !== current) {
          _scheduleSave({ [opts.key]: opt });
          _demand[opts.key] = opt;
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

        <!-- Custom properties -->
        ${_customProps.map(cp => _renderField(cp.icon || 'tag', cp.label, demand[cp.key], cp.key, cp.type || 'text')).join('')}

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
      <div class="dd-section">
        <div class="dd-section-header">
          <i data-lucide="message-circle"></i>
          Comentarios
        </div>
        <div class="dd-comments-empty">Nenhum comentario ainda.</div>
        <div class="dd-comment-input-row">
          <textarea class="dd-comment-input" placeholder="Escrever um comentario..." rows="1" id="ddCommentInput"></textarea>
          <button class="dd-comment-send" id="ddCommentSend" title="Enviar comentario">
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

    // Comment input auto-grow
    const commentInput = body.querySelector('#ddCommentInput');
    if (commentInput) {
      commentInput.addEventListener('input', () => {
        commentInput.style.height = 'auto';
        commentInput.style.height = Math.min(commentInput.scrollHeight, 100) + 'px';
      });
    }
  }

  // ── Add property modal ───────────────────────────

  function _showAddPropertyModal() {
    _closeDropdowns();
    const container = _panel.querySelector('#ddAddProperty');
    if (!container) return;

    // Check if already showing
    if (container.querySelector('.dd-add-prop-form')) return;

    const form = document.createElement('div');
    form.className = 'dd-add-prop-form';
    form.innerHTML = `
      <input class="dd-edit-input" type="text" placeholder="Nome da propriedade" id="ddNewPropName" style="margin-bottom:6px;">
      <select class="dd-edit-input" id="ddNewPropType" style="margin-bottom:6px;">
        <option value="text">Texto</option>
        <option value="date">Data</option>
        <option value="select">Selecao</option>
      </select>
      <div style="display:flex;gap:6px;">
        <button class="dd-add-prop-btn dd-add-prop-confirm" id="ddNewPropOk">Criar</button>
        <button class="dd-add-prop-btn dd-add-prop-cancel" id="ddNewPropCancel">Cancelar</button>
      </div>
    `;

    container.after(form);

    const nameInput = form.querySelector('#ddNewPropName');
    nameInput.focus();

    form.querySelector('#ddNewPropOk').addEventListener('click', () => {
      const name = nameInput.value.trim();
      const type = form.querySelector('#ddNewPropType').value;
      if (!name) return;
      const key = '_custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      _customProps.push({ key, label: name, icon: 'tag', type });
      _demand[key] = null;
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

  // ── Public API ───────────────────────────────────

  function open(demand, project) {
    if (!demand) return;
    _createDOM();
    _demand = { ...demand };
    _project = project || null;

    const body = _panel.querySelector('#ddBody');
    if (body) {
      body.innerHTML = _renderBody(_demand, _project);
      _bindBodyEvents();
    }

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
    _panel.classList.remove('dd-panel--open');
    _overlay.classList.remove('dd-overlay--visible');
    _isOpen = false;
    _demand = null;
    _project = null;
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
