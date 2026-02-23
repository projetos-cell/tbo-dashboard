/**
 * TBO OS — Demand Drawer (Painel lateral direito de detalhes da demanda)
 *
 * Abre ao clicar em uma tarefa na tela de projeto.
 * Exibe: título, status, campos (responsável, data, dependência, projeto vinculado),
 *        descrição, subtarefas, anexos, comentários e colaboradores.
 *
 * API:
 *   TBO_DEMAND_DRAWER.open(demand, project)
 *   TBO_DEMAND_DRAWER.close()
 */
const TBO_DEMAND_DRAWER = (() => {
  'use strict';

  let _panel = null;
  let _overlay = null;
  let _isOpen = false;
  let _demand = null;
  let _project = null;

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

  function _fmtDateShort(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso.slice(0, 10) + 'T12:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch { return iso.slice(0, 10); }
  }

  function _isLate(demand) {
    if (!demand.due_date) return false;
    const done = demand.status === 'Concluído' || demand.status === 'Concluido' || demand.status === 'Done' || demand.feito;
    if (done) return false;
    return new Date(demand.due_date) < new Date();
  }

  // ── Status / Priority colors ─────────────────────

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

  // ── DOM creation ─────────────────────────────────

  function _createDOM() {
    if (_panel) return;

    // Overlay
    _overlay = document.createElement('div');
    _overlay.className = 'dd-overlay';
    _overlay.addEventListener('click', close);
    document.body.appendChild(_overlay);

    // Panel
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

    // Events
    _panel.querySelector('#ddCloseBtn').addEventListener('click', close);

    // Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _isOpen) close();
    });

    if (window.lucide) lucide.createIcons({ root: _panel });
  }

  // ── Render body ──────────────────────────────────

  function _renderBody(demand, project) {
    const sc = _statusColor(demand.status);
    const pc = _priorityColor(demand.prioridade);
    const late = _isLate(demand);

    // Parse subtasks from subitem/item_principal
    const subtasks = _parseSubtasks(demand);

    // Determine the section/stage this demand belongs to
    const stage = _resolveStage(demand.status);

    return `
      <!-- Title + Status -->
      <div class="dd-title-section">
        <h2 class="dd-title">${_esc(demand.title)}</h2>
        <div class="dd-status-row">
          <span class="dd-status-badge" style="background:${sc.bg};color:${sc.color};">
            ${_esc(demand.status || 'Sem status')}
          </span>
          ${pc ? `<span class="dd-priority-badge" style="background:${pc.bg};color:${pc.color};">
            <i data-lucide="flag" style="width:11px;height:11px;"></i>
            ${_esc(demand.prioridade)}
          </span>` : ''}
        </div>
      </div>

      <!-- Fields -->
      <div class="dd-fields">
        <!-- Responsavel -->
        <div class="dd-field">
          <i data-lucide="user" class="dd-field-icon"></i>
          <span class="dd-field-label">Responsavel</span>
          <span class="dd-field-value">
            ${demand.responsible
              ? `<span style="display:inline-flex;align-items:center;gap:6px;">
                  <span style="width:22px;height:22px;border-radius:50%;background:var(--accent,#E85102);color:#fff;font-size:9px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">${_initials(demand.responsible)}</span>
                  ${_esc(demand.responsible)}
                </span>`
              : '<span class="dd-field-value--empty">Nao atribuido</span>'}
          </span>
        </div>

        <!-- Data de entrega -->
        <div class="dd-field">
          <i data-lucide="calendar" class="dd-field-icon"></i>
          <span class="dd-field-label">Data de entrega</span>
          <span class="dd-field-value">
            ${demand.due_date
              ? `<span style="${late ? 'color:#ef4444;font-weight:500;' : ''}">${_fmtDate(demand.due_date)}${demand.due_date_end ? ' → ' + _fmtDate(demand.due_date_end) : ''}</span>`
              : '<span class="dd-field-value--empty">Sem data</span>'}
          </span>
        </div>

        <!-- Tipo de Midia -->
        <div class="dd-field">
          <i data-lucide="film" class="dd-field-icon"></i>
          <span class="dd-field-label">Tipo de midia</span>
          <span class="dd-field-value">
            ${_renderTipoMidia(demand.tipo_midia)}
          </span>
        </div>

        <!-- Formalizacao -->
        <div class="dd-field">
          <i data-lucide="file-check" class="dd-field-icon"></i>
          <span class="dd-field-label">Formalizacao</span>
          <span class="dd-field-value">
            ${demand.formalizacao
              ? _esc(demand.formalizacao)
              : '<span class="dd-field-value--empty">-</span>'}
          </span>
        </div>

        <!-- Milestones -->
        <div class="dd-field">
          <i data-lucide="milestone" class="dd-field-icon"></i>
          <span class="dd-field-label">Milestones</span>
          <span class="dd-field-value">
            ${demand.milestones
              ? _esc(demand.milestones)
              : '<span class="dd-field-value--empty">-</span>'}
          </span>
        </div>

        <!-- Projeto vinculado -->
        ${project ? `
        <div class="dd-field" style="align-items:flex-start;">
          <i data-lucide="folder" class="dd-field-icon" style="margin-top:10px;"></i>
          <span class="dd-field-label" style="margin-top:8px;">Projeto vinculado</span>
          <span class="dd-field-value">
            <div class="dd-linked-project" onclick="TBO_DEMAND_DRAWER.close();TBO_ROUTER.navigate('projeto/${project.id}');">
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
      </div>

      <!-- Description -->
      <div class="dd-section">
        <div class="dd-section-header">
          <i data-lucide="align-left"></i>
          Descricao
        </div>
        ${demand.info
          ? `<div class="dd-description-text">${_esc(demand.info)}</div>`
          : `<div class="dd-description-empty">Sem descricao adicionada.</div>`}
      </div>

      <!-- Subtasks -->
      <div class="dd-section">
        <div class="dd-section-header">
          <i data-lucide="list-checks"></i>
          Subtarefas
          ${subtasks.length > 0 ? `<span class="dd-section-header-count">${subtasks.filter(s => s.done).length}/${subtasks.length}</span>` : ''}
        </div>
        ${subtasks.length > 0 ? _renderSubtasks(subtasks) : '<div class="dd-description-empty">Nenhuma subtarefa.</div>'}
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
          ${!demand.responsible && !(project && project.owner_name)
            ? '<div class="dd-collaborators-empty">Nenhum colaborador.</div>'
            : ''}
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

  // ── Subtask helpers ──────────────────────────────

  function _parseSubtasks(demand) {
    // If there's a subitem field, it might reference sub-items
    // For now, we'll show it as text; real subtasks would come from a relation
    if (!demand.subitem && !demand.item_principal) return [];
    const items = [];
    if (demand.subitem) {
      // subitem can be a comma-separated list or a single item
      const parts = demand.subitem.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => {
        items.push({ title: p, done: false });
      });
    }
    return items;
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
      ${subtasks.map(s => `
        <div class="dd-subtask-item">
          <div class="dd-subtask-check ${s.done ? 'dd-subtask-check--done' : ''}">
            ${s.done ? '<i data-lucide="check" style="width:10px;height:10px;"></i>' : ''}
          </div>
          <span class="dd-subtask-title ${s.done ? 'dd-subtask-title--done' : ''}">${_esc(s.title)}</span>
        </div>
      `).join('')}
    `;
  }

  // ── Misc helpers ─────────────────────────────────

  function _renderTipoMidia(tipoMidia) {
    if (!tipoMidia) return '<span class="dd-field-value--empty">-</span>';
    let arr = tipoMidia;
    if (typeof tipoMidia === 'string') {
      try { arr = JSON.parse(tipoMidia); } catch { arr = [tipoMidia]; }
    }
    if (!Array.isArray(arr) || arr.length === 0) return '<span class="dd-field-value--empty">-</span>';
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
    _demand = demand;
    _project = project || null;

    // Body content
    const body = _panel.querySelector('#ddBody');
    if (body) body.innerHTML = _renderBody(demand, project);

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

    // Auto-grow comment textarea
    const commentInput = _panel.querySelector('#ddCommentInput');
    if (commentInput) {
      commentInput.addEventListener('input', () => {
        commentInput.style.height = 'auto';
        commentInput.style.height = Math.min(commentInput.scrollHeight, 100) + 'px';
      });
    }

    // Open animation
    requestAnimationFrame(() => {
      _overlay.classList.add('dd-overlay--visible');
      _panel.classList.add('dd-panel--open');
    });
    _isOpen = true;

    if (window.lucide) lucide.createIcons({ root: _panel });
  }

  function close() {
    if (!_panel || !_isOpen) return;
    _panel.classList.remove('dd-panel--open');
    _overlay.classList.remove('dd-overlay--visible');
    _isOpen = false;
    _demand = null;
    _project = null;
  }

  return {
    open,
    close,
    get isOpen() { return _isOpen; },
    get currentDemand() { return _demand ? { ..._demand } : null; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_DEMAND_DRAWER = TBO_DEMAND_DRAWER;
}
