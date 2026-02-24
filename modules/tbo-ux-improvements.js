// TBO OS — UX Improvements Module (20 features)
// Implements: breadcrumb, notifications, command palette, onboarding,
// bulk actions, filters, inline search, resizable columns, undo/redo,
// skeletons, save indicator, empty states, density toggle, avatar colors,
// page transitions, clickable KPIs, mobile nav, swipe, keyboard help, FAB

const TBO_UX_IMPROVEMENTS = {

  // ═══════════════════════════════════════════════════════════════════
  // #1 — BREADCRUMB NAVIGATION
  // ═══════════════════════════════════════════════════════════════════
  _breadcrumbHistory: [],

  _initBreadcrumb() {
    const el = document.getElementById('breadcrumb');
    if (!el) return;

    // Listen for route changes
    if (typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.onChange((route) => {
        this._updateBreadcrumb(route);
      });
    }
  },

  _updateBreadcrumb(route) {
    const el = document.getElementById('breadcrumb');
    if (!el) return;

    const base = (route || '').split('/')[0];
    const label = (typeof TBO_APP !== 'undefined' && TBO_APP._moduleLabels)
      ? TBO_APP._moduleLabels[base] || base
      : base;

    // Add to history (max 5)
    const last = this._breadcrumbHistory[this._breadcrumbHistory.length - 1];
    if (last !== base && base) {
      this._breadcrumbHistory.push(base);
      if (this._breadcrumbHistory.length > 5) this._breadcrumbHistory.shift();
    }

    const crumbs = this._breadcrumbHistory.slice(-3);
    const icon = (typeof TBO_APP !== 'undefined' && TBO_APP._moduleIcons)
      ? TBO_APP._moduleIcons[base] || 'file'
      : 'file';

    el.innerHTML = `
      <button class="breadcrumb-home" onclick="TBO_ROUTER.navigate('dashboard')" title="Dashboard">
        <i data-lucide="home" style="width:14px;height:14px;"></i>
      </button>
      ${crumbs.map((c, i) => {
        const l = (typeof TBO_APP !== 'undefined' && TBO_APP._moduleLabels) ? TBO_APP._moduleLabels[c] || c : c;
        const isLast = i === crumbs.length - 1;
        return `
          <span class="breadcrumb-sep"><i data-lucide="chevron-right" style="width:12px;height:12px;"></i></span>
          ${isLast
            ? `<span class="breadcrumb-current"><i data-lucide="${icon}" style="width:13px;height:13px;"></i> ${this._esc(l)}</span>`
            : `<button class="breadcrumb-link" onclick="TBO_ROUTER.navigate('${c}')">${this._esc(l)}</button>`
          }
        `;
      }).join('')}
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: el });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #2 — NOTIFICATION CENTER
  // ═══════════════════════════════════════════════════════════════════
  _notifications: [],
  _notifPanel: null,

  _initNotificationCenter() {
    // Create notification bell in header
    const header = document.getElementById('app-header');
    if (!header) return;

    const searchBtn = document.getElementById('searchBtn');
    if (!searchBtn) return;

    // Check if already added
    if (document.getElementById('notifCenterBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'notifCenterBtn';
    btn.className = 'header-action-btn uxi-notif-btn';
    btn.title = 'Notificações';
    btn.innerHTML = `<i data-lucide="bell" style="width:18px;height:18px;"></i><span class="uxi-notif-badge" id="notifBadge"></span>`;
    searchBtn.parentNode.insertBefore(btn, searchBtn);

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'notifCenterPanel';
    panel.className = 'uxi-notif-panel';
    panel.innerHTML = `
      <div class="uxi-notif-header">
        <span class="uxi-notif-title">Notificações</span>
        <button class="uxi-notif-clear" id="notifClearAll" title="Limpar tudo">Limpar</button>
      </div>
      <div class="uxi-notif-list" id="notifList">
        <div class="uxi-notif-empty">Nenhuma notificação</div>
      </div>
    `;
    document.body.appendChild(panel);
    this._notifPanel = panel;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('visible');
    });

    document.getElementById('notifClearAll').addEventListener('click', () => {
      this._notifications = [];
      this._renderNotifications();
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('visible');
      }
    });

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: btn });
    this._loadNotifications();
  },

  async _loadNotifications() {
    try {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (!client) return;
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      if (!user) return;

      const { data } = await client.from('notifications')
        .select('id,title,body,type,read,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      this._notifications = data || [];
      this._renderNotifications();
    } catch (e) {
      console.warn('[UXI] Notifications load error:', e);
    }
  },

  _renderNotifications() {
    const list = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');
    if (!list) return;

    const unread = this._notifications.filter(n => !n.read).length;
    if (badge) {
      badge.textContent = unread > 0 ? (unread > 99 ? '99+' : unread) : '';
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }

    if (this._notifications.length === 0) {
      list.innerHTML = '<div class="uxi-notif-empty">Nenhuma notificação</div>';
      return;
    }

    list.innerHTML = this._notifications.slice(0, 15).map(n => {
      const time = this._timeAgo(n.created_at);
      const typeIcon = { info: 'info', warning: 'alert-triangle', error: 'alert-circle', success: 'check-circle-2' }[n.type] || 'bell';
      return `
        <div class="uxi-notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
          <i data-lucide="${typeIcon}" class="uxi-notif-icon uxi-notif-icon--${n.type || 'info'}" style="width:16px;height:16px;"></i>
          <div class="uxi-notif-content">
            <div class="uxi-notif-item-title">${this._esc(n.title)}</div>
            ${n.body ? `<div class="uxi-notif-item-body">${this._esc(n.body)}</div>` : ''}
            <div class="uxi-notif-item-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: list });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #3 — ENHANCED COMMAND PALETTE (Cmd+K)
  // ═══════════════════════════════════════════════════════════════════
  _cmdPaletteOpen: false,

  _initCommandPalette() {
    // Create overlay
    if (document.getElementById('uxiCmdPalette')) return;

    const overlay = document.createElement('div');
    overlay.id = 'uxiCmdPalette';
    overlay.className = 'uxi-cmd-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="uxi-cmd-dialog">
        <div class="uxi-cmd-input-wrap">
          <i data-lucide="search" style="width:18px;height:18px;color:var(--text-muted);"></i>
          <input type="text" class="uxi-cmd-input" id="uxiCmdInput" placeholder="Buscar módulo, ação ou atalho..." autocomplete="off" />
          <kbd class="uxi-cmd-esc">ESC</kbd>
        </div>
        <div class="uxi-cmd-results" id="uxiCmdResults"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('uxiCmdInput');
    const results = document.getElementById('uxiCmdResults');

    // Keyboard shortcut (Cmd/Ctrl+K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this._toggleCmdPalette();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this._toggleCmdPalette(false);
    });

    let debounce = null;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => this._searchCmdPalette(input.value, results), 120);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._toggleCmdPalette(false);
      if (e.key === 'Enter') {
        const first = results.querySelector('.uxi-cmd-item');
        if (first) first.click();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const items = results.querySelectorAll('.uxi-cmd-item');
        const focused = results.querySelector('.uxi-cmd-item.focused');
        if (focused) {
          focused.classList.remove('focused');
          const next = focused.nextElementSibling || items[0];
          if (next) next.classList.add('focused');
        } else if (items[0]) items[0].classList.add('focused');
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const items = results.querySelectorAll('.uxi-cmd-item');
        const focused = results.querySelector('.uxi-cmd-item.focused');
        if (focused) {
          focused.classList.remove('focused');
          const prev = focused.previousElementSibling || items[items.length - 1];
          if (prev) prev.classList.add('focused');
        }
      }
    });

    // Show default actions on open
    this._showDefaultCmdActions(results);
  },

  _toggleCmdPalette(show) {
    const overlay = document.getElementById('uxiCmdPalette');
    const input = document.getElementById('uxiCmdInput');
    if (!overlay) return;

    if (show === undefined) show = overlay.hidden;

    overlay.hidden = !show;
    this._cmdPaletteOpen = show;

    if (show) {
      input.value = '';
      input.focus();
      this._showDefaultCmdActions(document.getElementById('uxiCmdResults'));
    }
  },

  _showDefaultCmdActions(results) {
    if (!results) return;
    const actions = [
      { icon: 'layout-dashboard', label: 'Ir para Dashboard', action: () => TBO_ROUTER.navigate('dashboard') },
      { icon: 'list-checks', label: 'Ir para Tarefas', action: () => TBO_ROUTER.navigate('tarefas') },
      { icon: 'layout-dashboard', label: 'Quadro de Projetos', action: () => TBO_ROUTER.navigate('quadro-projetos') },
      { icon: 'calendar', label: 'Calendário', action: () => TBO_ROUTER.navigate('reunioes') },
      { icon: 'settings', label: 'Configurações', action: () => TBO_ROUTER.navigate('configuracoes') },
      { icon: 'moon', label: 'Alternar tema escuro', action: () => { document.body.classList.toggle('dark-mode'); document.body.classList.toggle('light-mode'); } },
      { icon: 'keyboard', label: 'Atalhos de teclado', action: () => this._showKeyboardHelp() },
    ];

    results.innerHTML = `<div class="uxi-cmd-group-label">Ações rápidas</div>` +
      actions.map((a, i) => `
        <div class="uxi-cmd-item" data-idx="${i}">
          <i data-lucide="${a.icon}" style="width:16px;height:16px;"></i>
          <span>${a.label}</span>
        </div>
      `).join('');

    results.querySelectorAll('.uxi-cmd-item').forEach((item, i) => {
      item.addEventListener('click', () => {
        actions[i].action();
        this._toggleCmdPalette(false);
      });
    });

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: results });
  },

  _searchCmdPalette(query, results) {
    if (!results || !query.trim()) {
      this._showDefaultCmdActions(results);
      return;
    }

    const q = query.toLowerCase();
    const matches = [];

    // Search modules
    if (typeof TBO_APP !== 'undefined' && TBO_APP._moduleLabels) {
      Object.entries(TBO_APP._moduleLabels).forEach(([key, label]) => {
        if (label.toLowerCase().includes(q) || key.toLowerCase().includes(q)) {
          matches.push({
            icon: TBO_APP._moduleIcons[key] || 'file',
            label: label,
            sub: 'Módulo',
            action: () => TBO_ROUTER.navigate(key)
          });
        }
      });
    }

    // Search actions
    const quickActions = [
      { icon: 'moon', label: 'Alternar tema', keywords: 'tema dark light escuro claro', action: () => { document.body.classList.toggle('dark-mode'); document.body.classList.toggle('light-mode'); } },
      { icon: 'refresh-cw', label: 'Atualizar dados', keywords: 'refresh reload atualizar', action: () => TBO_APP.refreshData() },
      { icon: 'keyboard', label: 'Atalhos de teclado', keywords: 'shortcuts atalhos teclado', action: () => this._showKeyboardHelp() },
    ];

    quickActions.forEach(a => {
      if (a.label.toLowerCase().includes(q) || a.keywords.includes(q)) {
        matches.push({ ...a, sub: 'Ação' });
      }
    });

    if (matches.length === 0) {
      results.innerHTML = '<div class="uxi-cmd-empty">Nenhum resultado</div>';
      return;
    }

    results.innerHTML = matches.slice(0, 10).map((m, i) => `
      <div class="uxi-cmd-item" data-idx="${i}">
        <i data-lucide="${m.icon}" style="width:16px;height:16px;"></i>
        <span>${this._esc(m.label)}</span>
        <span class="uxi-cmd-item-sub">${m.sub || ''}</span>
      </div>
    `).join('');

    results.querySelectorAll('.uxi-cmd-item').forEach((item, i) => {
      item.addEventListener('click', () => {
        matches[i].action();
        this._toggleCmdPalette(false);
      });
    });

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: results });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #4 — CONTEXTUAL ONBOARDING PER MODULE
  // ═══════════════════════════════════════════════════════════════════
  _onboardingTips: {
    'quadro-projetos': { title: 'Quadro de Projetos', tip: 'Use as visualizações Board, Lista ou Gantt. Clique em qualquer campo para editar inline.' },
    'tarefas': { title: 'Tarefas', tip: 'Organize suas tarefas por status. Arraste para reordenar prioridades.' },
    'financeiro': { title: 'Financeiro', tip: 'Acompanhe receitas, despesas e margens em tempo real.' },
    'pipeline': { title: 'Pipeline', tip: 'Gerencie seus deals arrastando entre as etapas do funil.' },
    'dashboard': { title: 'Dashboard', tip: 'Visão geral do seu workspace. Use Ctrl+K para navegar rapidamente.' },
  },

  _initOnboarding() {
    if (typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.onChange((route) => {
        const base = (route || '').split('/')[0];
        this._showOnboardingTip(base);
      });
    }
  },

  _showOnboardingTip(module) {
    const tip = this._onboardingTips[module];
    if (!tip) return;

    const key = `uxi_onboard_${module}`;
    if (localStorage.getItem(key)) return; // Already seen

    const el = document.createElement('div');
    el.className = 'uxi-onboard-tip';
    el.innerHTML = `
      <div class="uxi-onboard-content">
        <i data-lucide="lightbulb" style="width:18px;height:18px;color:var(--brand-orange);flex-shrink:0;"></i>
        <div>
          <strong>${this._esc(tip.title)}</strong>
          <p>${this._esc(tip.tip)}</p>
        </div>
        <button class="uxi-onboard-close" title="Fechar">
          <i data-lucide="x" style="width:14px;height:14px;"></i>
        </button>
      </div>
    `;

    const container = document.getElementById('moduleContainer');
    if (!container) return;

    // Remove previous tip
    container.querySelector('.uxi-onboard-tip')?.remove();
    container.insertBefore(el, container.firstChild);

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: el });

    el.querySelector('.uxi-onboard-close').addEventListener('click', () => {
      el.classList.add('uxi-onboard-hiding');
      setTimeout(() => el.remove(), 300);
      localStorage.setItem(key, '1');
    });

    // Auto-dismiss after 8s
    setTimeout(() => {
      if (el.parentNode) {
        el.classList.add('uxi-onboard-hiding');
        setTimeout(() => el.remove(), 300);
      }
    }, 8000);
  },

  // ═══════════════════════════════════════════════════════════════════
  // #5 — BULK ACTIONS (multi-select + floating bar)
  // ═══════════════════════════════════════════════════════════════════
  _selectedRows: new Set(),

  _initBulkActions() {
    // Create floating action bar
    if (document.getElementById('uxiBulkBar')) return;

    const bar = document.createElement('div');
    bar.id = 'uxiBulkBar';
    bar.className = 'uxi-bulk-bar';
    bar.innerHTML = `
      <span class="uxi-bulk-count" id="uxiBulkCount">0 selecionados</span>
      <button class="uxi-bulk-action" data-action="status" title="Alterar status">
        <i data-lucide="toggle-right" style="width:14px;height:14px;"></i> Status
      </button>
      <button class="uxi-bulk-action" data-action="delete" title="Excluir">
        <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Excluir
      </button>
      <button class="uxi-bulk-action uxi-bulk-cancel" data-action="cancel" title="Cancelar">
        <i data-lucide="x" style="width:14px;height:14px;"></i>
      </button>
    `;
    document.body.appendChild(bar);

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.uxi-bulk-action');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'cancel') {
        this._clearBulkSelection();
      } else if (action === 'status') {
        this._bulkChangeStatus();
      } else if (action === 'delete') {
        if (confirm(`Deseja excluir ${this._selectedRows.size} itens?`)) {
          this._bulkDelete();
        }
      }
    });

    // Delegate checkbox clicks on tables
    document.addEventListener('change', (e) => {
      const cb = e.target.closest('.uxi-bulk-checkbox');
      if (!cb) return;
      const id = cb.dataset.id;
      if (cb.checked) this._selectedRows.add(id);
      else this._selectedRows.delete(id);
      this._updateBulkBar();
    });
  },

  _updateBulkBar() {
    const bar = document.getElementById('uxiBulkBar');
    const count = document.getElementById('uxiBulkCount');
    if (!bar) return;

    const n = this._selectedRows.size;
    bar.classList.toggle('visible', n > 0);
    if (count) count.textContent = `${n} selecionado${n !== 1 ? 's' : ''}`;
  },

  _clearBulkSelection() {
    this._selectedRows.clear();
    document.querySelectorAll('.uxi-bulk-checkbox').forEach(cb => cb.checked = false);
    this._updateBulkBar();
  },

  async _bulkChangeStatus() {
    const status = prompt('Novo status (em_andamento, producao, finalizado, parado, pausado):');
    if (!status) return;
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) return;

    for (const id of this._selectedRows) {
      await client.from('projects').update({ status }).eq('id', id);
    }
    this._clearBulkSelection();
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Bulk', 'Status atualizado');
    // Re-render current module
    if (typeof TBO_QUADRO_PROJETOS !== 'undefined' && TBO_QUADRO_PROJETOS._loaded) {
      TBO_QUADRO_PROJETOS._load();
    }
  },

  async _bulkDelete() {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) return;

    for (const id of this._selectedRows) {
      await client.from('projects').delete().eq('id', id);
    }
    this._clearBulkSelection();
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Bulk', 'Itens removidos');
    if (typeof TBO_QUADRO_PROJETOS !== 'undefined' && TBO_QUADRO_PROJETOS._loaded) {
      TBO_QUADRO_PROJETOS._load();
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // #6 — ADVANCED FILTERS WITH SAVE/VIEWS
  // ═══════════════════════════════════════════════════════════════════
  _savedViews: [],

  _initAdvancedFilters() {
    this._savedViews = this._loadViews();
  },

  _loadViews() {
    try { return JSON.parse(localStorage.getItem('uxi_saved_views') || '[]'); } catch { return []; }
  },

  _saveView(name, filters) {
    this._savedViews.push({ name, filters, id: Date.now() });
    localStorage.setItem('uxi_saved_views', JSON.stringify(this._savedViews));
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Filtros', `Vista "${name}" salva`);
  },

  _deleteView(id) {
    this._savedViews = this._savedViews.filter(v => v.id !== id);
    localStorage.setItem('uxi_saved_views', JSON.stringify(this._savedViews));
  },

  // ═══════════════════════════════════════════════════════════════════
  // #7 — INLINE SEARCH IN TABLES (Ctrl+F highlight)
  // ═══════════════════════════════════════════════════════════════════
  _tableSearchActive: false,

  _initInlineTableSearch() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        // Only intercept in table views
        const hasTable = document.querySelector('.qp-table, .pd-task-row');
        if (!hasTable) return;

        e.preventDefault();
        this._showTableSearch();
      }
    });
  },

  _showTableSearch() {
    let bar = document.getElementById('uxiTableSearch');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'uxiTableSearch';
      bar.className = 'uxi-table-search';
      bar.innerHTML = `
        <i data-lucide="search" style="width:14px;height:14px;color:var(--text-muted);"></i>
        <input type="text" class="uxi-table-search-input" id="uxiTableSearchInput" placeholder="Buscar na tabela..." autocomplete="off" />
        <span class="uxi-table-search-count" id="uxiTableSearchCount"></span>
        <button class="uxi-table-search-close" id="uxiTableSearchClose">
          <i data-lucide="x" style="width:14px;height:14px;"></i>
        </button>
      `;

      const main = document.getElementById('main-content');
      if (main) main.insertBefore(bar, main.firstChild);
      else document.body.appendChild(bar);

      if (typeof lucide !== 'undefined') lucide.createIcons({ root: bar });

      document.getElementById('uxiTableSearchClose').addEventListener('click', () => {
        this._hideTableSearch();
      });

      document.getElementById('uxiTableSearchInput').addEventListener('input', (e) => {
        this._highlightTableCells(e.target.value);
      });

      document.getElementById('uxiTableSearchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this._hideTableSearch();
      });
    }

    bar.classList.add('visible');
    this._tableSearchActive = true;
    document.getElementById('uxiTableSearchInput').focus();
  },

  _hideTableSearch() {
    const bar = document.getElementById('uxiTableSearch');
    if (bar) bar.classList.remove('visible');
    this._tableSearchActive = false;
    this._clearHighlights();
  },

  _highlightTableCells(query) {
    this._clearHighlights();
    const countEl = document.getElementById('uxiTableSearchCount');

    if (!query || query.length < 2) {
      if (countEl) countEl.textContent = '';
      return;
    }

    const q = query.toLowerCase();
    let matches = 0;

    document.querySelectorAll('.qp-table td, .pd-task-row .pd-cell').forEach(cell => {
      const text = cell.textContent.toLowerCase();
      if (text.includes(q)) {
        cell.classList.add('uxi-search-match');
        matches++;
      }
    });

    if (countEl) countEl.textContent = `${matches} resultado${matches !== 1 ? 's' : ''}`;
  },

  _clearHighlights() {
    document.querySelectorAll('.uxi-search-match').forEach(el => {
      el.classList.remove('uxi-search-match');
    });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #8 — RESIZABLE/REORDERABLE COLUMNS
  // ═══════════════════════════════════════════════════════════════════
  _initResizableColumns() {
    // Add resize handles to table headers on mutation
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.qp-table thead th:not(.uxi-resizable)').forEach(th => {
        th.classList.add('uxi-resizable');
        const handle = document.createElement('div');
        handle.className = 'uxi-col-resize-handle';
        th.appendChild(handle);
        th.style.position = 'relative';

        let startX, startW;
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          startX = e.pageX;
          startW = th.offsetWidth;
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';

          const onMove = (ev) => {
            const diff = ev.pageX - startX;
            th.style.width = Math.max(60, startW + diff) + 'px';
            th.style.minWidth = th.style.width;
          };
          const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
          };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #9 — UNDO/REDO SYSTEM WITH TOAST
  // ═══════════════════════════════════════════════════════════════════
  _undoStack: [],

  pushUndo(description, undoFn) {
    this._undoStack.push({ description, undoFn, timestamp: Date.now() });
    if (this._undoStack.length > 20) this._undoStack.shift();
    this._showUndoToast(description);
  },

  _showUndoToast(description) {
    let toast = document.getElementById('uxiUndoToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'uxiUndoToast';
      toast.className = 'uxi-undo-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span>${this._esc(description)}</span>
      <button class="uxi-undo-btn" id="uxiUndoBtn">Desfazer</button>
    `;
    toast.classList.add('visible');

    clearTimeout(this._undoToastTimer);

    document.getElementById('uxiUndoBtn').addEventListener('click', () => {
      const action = this._undoStack.pop();
      if (action && action.undoFn) {
        action.undoFn();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Desfeito', action.description);
      }
      toast.classList.remove('visible');
    });

    this._undoToastTimer = setTimeout(() => toast.classList.remove('visible'), 5000);
  },

  // Ctrl+Z global undo
  _initUndoShortcut() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

        if (this._undoStack.length > 0) {
          e.preventDefault();
          const action = this._undoStack.pop();
          if (action && action.undoFn) {
            action.undoFn();
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Desfeito', action.description);
          }
        }
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #10 — MODULE-SPECIFIC SKELETON LOADING STATES
  // ═══════════════════════════════════════════════════════════════════
  _initSkeletons() {
    // Enhance the module loading with skeleton that matches module type
    if (typeof TBO_ROUTER !== 'undefined') {
      const origNav = TBO_ROUTER.navigate.bind(TBO_ROUTER);
      TBO_ROUTER.navigate = (route) => {
        const container = document.getElementById('moduleContainer');
        if (container) {
          const base = (route || '').split('/')[0];
          container.innerHTML = this._getSkeletonForModule(base);
        }
        return origNav(route);
      };
    }
  },

  _getSkeletonForModule(mod) {
    const skel = (h) => `<div class="uxi-skeleton" style="${h}"></div>`;

    if (mod === 'quadro-projetos' || mod === 'tarefas') {
      return `<div class="uxi-skeleton-wrap">
        <div class="uxi-skeleton-toolbar">${skel('width:200px;height:28px;')} ${skel('width:140px;height:28px;')} ${skel('width:100px;height:28px;')}</div>
        <div class="uxi-skeleton-kpis">${Array(5).fill(skel('height:64px;flex:1;')).join('')}</div>
        <div class="uxi-skeleton-board">${Array(4).fill(`<div class="uxi-skeleton-col">${skel('height:16px;width:60%;')}${Array(3).fill(skel('height:80px;')).join('')}</div>`).join('')}</div>
      </div>`;
    }

    if (mod === 'financeiro' || mod === 'dashboard') {
      return `<div class="uxi-skeleton-wrap">
        <div class="uxi-skeleton-kpis">${Array(4).fill(skel('height:80px;flex:1;')).join('')}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
          ${skel('height:240px;border-radius:12px;')}
          ${skel('height:240px;border-radius:12px;')}
        </div>
      </div>`;
    }

    // Default skeleton
    return `<div class="uxi-skeleton-wrap">
      ${skel('height:32px;width:40%;margin-bottom:16px;')}
      ${skel('height:200px;border-radius:12px;')}
    </div>`;
  },

  // ═══════════════════════════════════════════════════════════════════
  // #11 — REAL-TIME SAVE INDICATOR
  // ═══════════════════════════════════════════════════════════════════
  _saveState: 'saved', // 'saving' | 'saved' | 'error'

  _initSaveIndicator() {
    if (document.getElementById('uxiSaveIndicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'uxiSaveIndicator';
    indicator.className = 'uxi-save-indicator';
    indicator.innerHTML = `
      <span class="uxi-save-dot"></span>
      <span class="uxi-save-text">Salvo</span>
    `;

    const header = document.getElementById('app-header');
    const freshness = document.getElementById('dataFreshness');
    if (header && freshness) {
      freshness.parentNode.insertBefore(indicator, freshness.nextSibling);
    }
  },

  setSaveState(state) {
    this._saveState = state;
    const el = document.getElementById('uxiSaveIndicator');
    if (!el) return;

    el.className = `uxi-save-indicator uxi-save-${state}`;
    const text = el.querySelector('.uxi-save-text');
    if (text) {
      text.textContent = state === 'saving' ? 'Salvando...' : state === 'error' ? 'Erro ao salvar' : 'Salvo';
    }

    if (state === 'saved') {
      clearTimeout(this._saveHideTimer);
      this._saveHideTimer = setTimeout(() => {
        el.classList.add('uxi-save-hidden');
      }, 3000);
    } else {
      el.classList.remove('uxi-save-hidden');
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // #12 — CONTEXTUAL EMPTY STATES WITH CTAs
  // ═══════════════════════════════════════════════════════════════════
  renderEmptyState(icon, title, subtitle, ctaLabel, ctaAction) {
    return `
      <div class="uxi-empty-state">
        <div class="uxi-empty-icon">
          <i data-lucide="${icon}" style="width:48px;height:48px;"></i>
        </div>
        <h3 class="uxi-empty-title">${this._esc(title)}</h3>
        <p class="uxi-empty-subtitle">${this._esc(subtitle)}</p>
        ${ctaLabel ? `<button class="uxi-empty-cta" onclick="${ctaAction}">
          <i data-lucide="plus" style="width:14px;height:14px;"></i> ${this._esc(ctaLabel)}
        </button>` : ''}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════
  // #13 — COMPACT/COMFORTABLE DENSITY TOGGLE
  // ═══════════════════════════════════════════════════════════════════
  _density: 'comfortable',

  _initDensityToggle() {
    this._density = localStorage.getItem('uxi_density') || 'comfortable';
    this._applyDensity();
  },

  toggleDensity() {
    this._density = this._density === 'comfortable' ? 'compact' : 'comfortable';
    localStorage.setItem('uxi_density', this._density);
    this._applyDensity();
    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.info('Densidade', this._density === 'compact' ? 'Modo compacto ativado' : 'Modo confortável ativado');
    }
  },

  _applyDensity() {
    document.body.classList.toggle('uxi-density-compact', this._density === 'compact');
  },

  // ═══════════════════════════════════════════════════════════════════
  // #14 — AVATAR COLORS BY PERSON (hash-based)
  // ═══════════════════════════════════════════════════════════════════
  _avatarColors: [
    '#E85102', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444',
    '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6',
  ],

  getAvatarColor(name) {
    if (!name) return this._avatarColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this._avatarColors[Math.abs(hash) % this._avatarColors.length];
  },

  renderAvatar(name, size) {
    size = size || 28;
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const color = this.getAvatarColor(name);
    return `<div class="uxi-avatar" style="width:${size}px;height:${size}px;background:${color};font-size:${size * 0.4}px;" title="${this._esc(name || '')}">${initials}</div>`;
  },

  // ═══════════════════════════════════════════════════════════════════
  // #15 — PAGE TRANSITION ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════
  _initPageTransitions() {
    if (typeof TBO_ROUTER === 'undefined') return;

    const container = document.getElementById('moduleContainer');
    if (!container) return;

    TBO_ROUTER.onChange(() => {
      container.classList.remove('uxi-page-enter');
      // Force reflow
      void container.offsetWidth;
      container.classList.add('uxi-page-enter');
    });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #16 — CLICKABLE/INTERACTIVE KPI CARDS
  // ═══════════════════════════════════════════════════════════════════
  _initClickableKpis() {
    // Delegate clicks on KPI cards
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.qp-kpi-card');
      if (!card) return;

      const label = card.querySelector('.qp-kpi-label')?.textContent?.trim();
      if (!label) return;

      const filterMap = {
        'Total Projetos': 'all',
        'Em Andamento': 'em_andamento',
        'Em Produção': 'producao',
        'Finalizados': 'finalizado',
        'Parados/Pausados': 'parado',
      };

      const status = filterMap[label];
      if (status !== undefined && typeof TBO_QUADRO_PROJETOS !== 'undefined') {
        const filterEl = document.getElementById('qpFilterStatus');
        if (filterEl) {
          filterEl.value = status;
          filterEl.dispatchEvent(new Event('change'));
        }
        card.classList.add('uxi-kpi-clicked');
        setTimeout(() => card.classList.remove('uxi-kpi-clicked'), 300);
      }

      if (label === 'Demandas Abertas') {
        // Navigate to first project with open demands
        if (typeof TBO_QUADRO_PROJETOS !== 'undefined' && TBO_QUADRO_PROJETOS._data.projects.length > 0) {
          TBO_ROUTER.navigate('quadro-projetos');
        }
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #17 — MOBILE BOTTOM NAVIGATION BAR
  // ═══════════════════════════════════════════════════════════════════
  _initMobileNav() {
    if (document.getElementById('uxiMobileNav')) return;

    const nav = document.createElement('nav');
    nav.id = 'uxiMobileNav';
    nav.className = 'uxi-mobile-nav';

    const items = [
      { icon: 'layout-dashboard', label: 'Home', route: 'dashboard' },
      { icon: 'layout-dashboard', label: 'Projetos', route: 'quadro-projetos' },
      { icon: 'list-checks', label: 'Tarefas', route: 'tarefas' },
      { icon: 'calendar', label: 'Agenda', route: 'reunioes' },
      { icon: 'ellipsis', label: 'Mais', route: '__more__' },
    ];

    nav.innerHTML = items.map(item => `
      <button class="uxi-mobile-nav-item" data-route="${item.route}" title="${item.label}">
        <i data-lucide="${item.icon}" style="width:20px;height:20px;"></i>
        <span>${item.label}</span>
      </button>
    `).join('');

    document.body.appendChild(nav);

    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('.uxi-mobile-nav-item');
      if (!btn) return;
      const route = btn.dataset.route;
      if (route === '__more__') {
        // Expand sidebar on mobile
        document.getElementById('sidebar')?.classList.toggle('mobile-open');
      } else if (typeof TBO_ROUTER !== 'undefined') {
        TBO_ROUTER.navigate(route);
      }
      // Update active state
      nav.querySelectorAll('.uxi-mobile-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: nav });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #18 — SWIPE GESTURES ON MOBILE
  // ═══════════════════════════════════════════════════════════════════
  _initSwipeGestures() {
    let startX = 0, startY = 0;
    const main = document.getElementById('main-content');
    if (!main) return;

    main.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    main.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      // Only horizontal swipes (dx > dy)
      if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy)) return;

      if (dx > 0) {
        // Swipe right — open sidebar
        document.getElementById('sidebar')?.classList.add('mobile-open');
      } else {
        // Swipe left — close sidebar
        document.getElementById('sidebar')?.classList.remove('mobile-open');
      }
    }, { passive: true });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #19 — KEYBOARD SHORTCUTS HELP MODAL
  // ═══════════════════════════════════════════════════════════════════
  _showKeyboardHelp() {
    let modal = document.getElementById('uxiKbHelp');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'uxiKbHelp';
      modal.className = 'uxi-kb-overlay';
      document.body.appendChild(modal);
    }

    const shortcuts = [
      { key: 'Ctrl+K', desc: 'Command Palette' },
      { key: 'Ctrl+F', desc: 'Buscar na tabela' },
      { key: 'Ctrl+Z', desc: 'Desfazer' },
      { key: 'Alt+K', desc: 'Busca global' },
      { key: 'Alt+R', desc: 'Atualizar dados' },
      { key: 'Alt+B', desc: 'Recolher sidebar' },
      { key: '/', desc: 'Focar busca na sidebar' },
      { key: 'Alt+D', desc: 'Alternar densidade' },
      { key: '?', desc: 'Esta ajuda' },
      { key: 'Esc', desc: 'Fechar modal/overlay' },
    ];

    modal.innerHTML = `
      <div class="uxi-kb-dialog">
        <div class="uxi-kb-header">
          <h3>Atalhos de Teclado</h3>
          <button class="uxi-kb-close" onclick="document.getElementById('uxiKbHelp').hidden=true">
            <i data-lucide="x" style="width:18px;height:18px;"></i>
          </button>
        </div>
        <div class="uxi-kb-body">
          ${shortcuts.map(s => `
            <div class="uxi-kb-row">
              <kbd class="uxi-kb-key">${s.key}</kbd>
              <span class="uxi-kb-desc">${s.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.hidden = false;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.hidden = true;
    });

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: modal });

    // ? shortcut to show help
    document.addEventListener('keydown', (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
        e.preventDefault();
        this._showKeyboardHelp();
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════════
  // #20 — QUICK-ADD UNIVERSAL FAB BUTTON
  // ═══════════════════════════════════════════════════════════════════
  _initFab() {
    if (document.getElementById('uxiFab')) return;

    const fab = document.createElement('div');
    fab.id = 'uxiFab';
    fab.className = 'uxi-fab';
    fab.innerHTML = `
      <button class="uxi-fab-btn" id="uxiFabBtn" title="Criar novo">
        <i data-lucide="plus" style="width:22px;height:22px;"></i>
      </button>
      <div class="uxi-fab-menu" id="uxiFabMenu">
        <button class="uxi-fab-option" data-create="projeto">
          <i data-lucide="folder-plus" style="width:16px;height:16px;"></i> Novo Projeto
        </button>
        <button class="uxi-fab-option" data-create="tarefa">
          <i data-lucide="list-plus" style="width:16px;height:16px;"></i> Nova Tarefa
        </button>
        <button class="uxi-fab-option" data-create="contato">
          <i data-lucide="user-plus" style="width:16px;height:16px;"></i> Novo Contato
        </button>
      </div>
    `;
    document.body.appendChild(fab);

    const btn = document.getElementById('uxiFabBtn');
    const menu = document.getElementById('uxiFabMenu');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      fab.classList.toggle('open');
    });

    menu.addEventListener('click', (e) => {
      const opt = e.target.closest('.uxi-fab-option');
      if (!opt) return;
      fab.classList.remove('open');
      const action = opt.dataset.create;
      if (action === 'projeto') TBO_ROUTER.navigate('quadro-projetos');
      else if (action === 'tarefa') TBO_ROUTER.navigate('tarefas');
      else if (action === 'contato') TBO_ROUTER.navigate('clientes');
    });

    document.addEventListener('click', () => fab.classList.remove('open'));

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: fab });
  },

  // ═══════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════
  _esc(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  },

  // ═══════════════════════════════════════════════════════════════════
  // INIT — boot all features
  // ═══════════════════════════════════════════════════════════════════
  init() {
    try { this._initBreadcrumb(); } catch(e) { console.warn('[UXI] Breadcrumb error:', e); }
    try { this._initNotificationCenter(); } catch(e) { console.warn('[UXI] Notifications error:', e); }
    try { this._initCommandPalette(); } catch(e) { console.warn('[UXI] Command palette error:', e); }
    try { this._initOnboarding(); } catch(e) { console.warn('[UXI] Onboarding error:', e); }
    try { this._initBulkActions(); } catch(e) { console.warn('[UXI] Bulk actions error:', e); }
    try { this._initAdvancedFilters(); } catch(e) { console.warn('[UXI] Filters error:', e); }
    try { this._initInlineTableSearch(); } catch(e) { console.warn('[UXI] Table search error:', e); }
    try { this._initResizableColumns(); } catch(e) { console.warn('[UXI] Resizable cols error:', e); }
    try { this._initUndoShortcut(); } catch(e) { console.warn('[UXI] Undo error:', e); }
    try { this._initSaveIndicator(); } catch(e) { console.warn('[UXI] Save indicator error:', e); }
    try { this._initDensityToggle(); } catch(e) { console.warn('[UXI] Density error:', e); }
    try { this._initPageTransitions(); } catch(e) { console.warn('[UXI] Transitions error:', e); }
    try { this._initClickableKpis(); } catch(e) { console.warn('[UXI] KPIs error:', e); }
    try { this._initMobileNav(); } catch(e) { console.warn('[UXI] Mobile nav error:', e); }
    try { this._initSwipeGestures(); } catch(e) { console.warn('[UXI] Swipe error:', e); }
    try { this._initFab(); } catch(e) { console.warn('[UXI] FAB error:', e); }

    // Keyboard shortcut for density toggle
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        this.toggleDensity();
      }
    });

    console.log('[TBO UXI] All 20 improvements initialized');
  }
};
