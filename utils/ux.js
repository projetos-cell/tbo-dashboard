// TBO OS — UX Utilities (Phase 7 - Polish)
// Centralized UX components: loading, errors, confirm, skeletons, favorites, onboarding, keyboard nav, exports

const TBO_UX = {

  // ═══════════════════════════════════════════════════════════════════════
  // P0: LOADING STATES — Inline spinner for AI generation
  // ═══════════════════════════════════════════════════════════════════════
  showLoading(elementOrId, message = 'Gerando...') {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;
    el.innerHTML = `
      <div class="ux-loading-state">
        <div class="ux-spinner"></div>
        <span class="ux-loading-text">${message}</span>
        <div class="ux-loading-dots"><span>.</span><span>.</span><span>.</span></div>
      </div>
    `;
    el.style.display = 'block';
  },

  hideLoading(elementOrId) {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (el) el.querySelector('.ux-loading-state')?.remove();
  },

  // Button loading state (disable + spinner)
  btnLoading(btnOrId, loading, originalText = '') {
    const btn = typeof btnOrId === 'string' ? document.getElementById(btnOrId) : btnOrId;
    if (!btn) return;
    if (loading) {
      btn._originalText = btn.textContent;
      btn.disabled = true;
      btn.classList.add('btn-loading');
      btn.innerHTML = `<span class="ux-btn-spinner"></span> ${originalText || 'Processando...'}`;
    } else {
      btn.disabled = false;
      btn.classList.remove('btn-loading');
      btn.textContent = btn._originalText || originalText || 'Gerar';
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P0: ERROR STATES — Retry mechanism
  // ═══════════════════════════════════════════════════════════════════════
  showError(elementOrId, message, retryFn = null) {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;
    el.innerHTML = `
      <div class="ux-error-state">
        <span class="ux-error-icon">&#x26A0;&#xFE0F;</span>
        <span class="ux-error-msg">${message}</span>
        ${retryFn ? '<button class="btn btn-sm btn-secondary ux-retry-btn">Tentar novamente</button>' : ''}
      </div>
    `;
    if (retryFn) {
      el.querySelector('.ux-retry-btn')?.addEventListener('click', retryFn);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P0: FORM VALIDATION — Real-time feedback
  // ═══════════════════════════════════════════════════════════════════════
  validateField(inputOrId, rules = {}) {
    const input = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
    if (!input) return true;

    const val = input.value.trim();
    let error = '';

    if (rules.required && !val) error = 'Campo obrigatorio';
    else if (rules.minLength && val.length < rules.minLength) error = `Minimo ${rules.minLength} caracteres`;
    else if (rules.maxLength && val.length > rules.maxLength) error = `Maximo ${rules.maxLength} caracteres`;

    // Remove existing error
    const existing = input.parentElement?.querySelector('.ux-field-error');
    if (existing) existing.remove();
    input.classList.remove('ux-field-invalid');

    if (error) {
      input.classList.add('ux-field-invalid');
      const errEl = document.createElement('div');
      errEl.className = 'ux-field-error';
      errEl.textContent = error;
      input.parentElement?.appendChild(errEl);
      return false;
    }
    return true;
  },

  // Auto-bind validation to form inputs
  bindValidation(formSelector) {
    document.querySelectorAll(formSelector).forEach(input => {
      input.addEventListener('blur', () => {
        if (input.hasAttribute('required') || input.dataset.minlength) {
          this.validateField(input, {
            required: input.hasAttribute('required'),
            minLength: parseInt(input.dataset.minlength) || 0
          });
        }
      });
      // Clear error on input
      input.addEventListener('input', () => {
        input.classList.remove('ux-field-invalid');
        input.parentElement?.querySelector('.ux-field-error')?.remove();
      });
    });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P1: CONFIRM MODAL — For destructive actions
  // ═══════════════════════════════════════════════════════════════════════
  confirm(title, message, onConfirm, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'ux-confirm-overlay';
    overlay.innerHTML = `
      <div class="ux-confirm-modal">
        <div class="ux-confirm-title">${title}</div>
        <div class="ux-confirm-message">${message}</div>
        <div class="ux-confirm-actions">
          <button class="btn btn-secondary ux-confirm-cancel">${options.cancelText || 'Cancelar'}</button>
          <button class="btn ${options.danger ? 'btn-danger' : 'btn-primary'} ux-confirm-ok">${options.confirmText || 'Confirmar'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Focus trap
    const okBtn = overlay.querySelector('.ux-confirm-ok');
    const cancelBtn = overlay.querySelector('.ux-confirm-cancel');
    okBtn?.focus();

    const close = () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
    };

    cancelBtn?.addEventListener('click', close);
    okBtn?.addEventListener('click', () => { close(); onConfirm(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    // Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P1: LOADING SKELETONS — Module transition
  // ═══════════════════════════════════════════════════════════════════════
  showSkeleton(container) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;
    el.innerHTML = `
      <div class="ux-skeleton-layout" aria-hidden="true">
        <div class="ux-skeleton-header">
          <div class="skeleton" style="width:200px;height:28px;border-radius:6px;"></div>
          <div class="skeleton" style="width:100px;height:28px;border-radius:6px;"></div>
        </div>
        <div class="ux-skeleton-kpis">
          <div class="skeleton" style="height:90px;border-radius:8px;"></div>
          <div class="skeleton" style="height:90px;border-radius:8px;"></div>
          <div class="skeleton" style="height:90px;border-radius:8px;"></div>
          <div class="skeleton" style="height:90px;border-radius:8px;"></div>
        </div>
        <div class="ux-skeleton-body">
          <div class="skeleton" style="height:200px;border-radius:8px;"></div>
          <div class="skeleton" style="height:200px;border-radius:8px;"></div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P2: SEARCH HISTORY
  // ═══════════════════════════════════════════════════════════════════════
  _searchHistoryKey: 'tbo_search_history',

  addSearchHistory(query) {
    if (!query || query.trim().length < 2) return;
    let history = JSON.parse(localStorage.getItem(this._searchHistoryKey) || '[]');
    history = history.filter(h => h !== query.trim());
    history.unshift(query.trim());
    if (history.length > 5) history = history.slice(0, 5);
    localStorage.setItem(this._searchHistoryKey, JSON.stringify(history));
  },

  getSearchHistory() {
    return JSON.parse(localStorage.getItem(this._searchHistoryKey) || '[]');
  },

  renderSearchHistory() {
    const history = this.getSearchHistory();
    if (history.length === 0) return '';
    return `
      <div class="ux-search-history">
        <div class="ux-search-history-title">Buscas recentes</div>
        ${history.map(h => `<div class="ux-search-history-item" data-query="${h}">
          <span class="ux-search-history-icon">&#x1F552;</span>
          <span>${h}</span>
        </div>`).join('')}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P2: FAVORITES / PINS
  // ═══════════════════════════════════════════════════════════════════════
  _favKey: 'tbo_favorites',

  toggleFavorite(type, id, label) {
    let favs = JSON.parse(localStorage.getItem(this._favKey) || '[]');
    const idx = favs.findIndex(f => f.type === type && f.id === id);
    if (idx >= 0) {
      favs.splice(idx, 1);
      TBO_TOAST.info('Removido', `"${label}" removido dos favoritos.`);
    } else {
      favs.unshift({ type, id, label, added: Date.now() });
      TBO_TOAST.success('Favoritado', `"${label}" adicionado aos favoritos.`);
    }
    localStorage.setItem(this._favKey, JSON.stringify(favs));
    return idx < 0; // true if added
  },

  isFavorite(type, id) {
    const favs = JSON.parse(localStorage.getItem(this._favKey) || '[]');
    return favs.some(f => f.type === type && f.id === id);
  },

  getFavorites() {
    return JSON.parse(localStorage.getItem(this._favKey) || '[]');
  },

  renderFavStar(type, id, label) {
    const isFav = this.isFavorite(type, id);
    return `<button class="ux-fav-btn ${isFav ? 'active' : ''}"
      data-fav-type="${type}" data-fav-id="${id}" data-fav-label="${label}"
      title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
      aria-label="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
      ${isFav ? '&#x2605;' : '&#x2606;'}
    </button>`;
  },

  bindFavButtons(container) {
    const el = typeof container === 'string' ? document.getElementById(container) : (container || document);
    el?.querySelectorAll('.ux-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const added = this.toggleFavorite(btn.dataset.favType, btn.dataset.favId, btn.dataset.favLabel);
        btn.classList.toggle('active', added);
        btn.innerHTML = added ? '&#x2605;' : '&#x2606;';
      });
    });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P2: THEME — Smooth transition + system detection
  // ═══════════════════════════════════════════════════════════════════════
  initThemeDetection() {
    const saved = localStorage.getItem('tbo_theme');
    if (!saved) {
      // No saved theme — detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      }
    }

    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('tbo_theme')) {
        document.body.classList.toggle('dark-mode', e.matches);
        document.body.classList.toggle('light-mode', !e.matches);
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P3: KEYBOARD NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════
  initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Enter or Cmd+Enter to submit nearest form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const active = document.activeElement;
        if (active?.tagName === 'TEXTAREA' || active?.tagName === 'INPUT') {
          const form = active.closest('.card, .tab-content, section');
          const btn = form?.querySelector('.btn-primary, .btn[onclick*="generate"], .btn[onclick*="Generate"]');
          if (btn) { btn.click(); e.preventDefault(); }
        }
      }

      // Arrow keys for tab navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const active = document.activeElement;
        if (active?.classList.contains('tab-btn')) {
          const tabs = Array.from(active.parentElement.querySelectorAll('.tab-btn'));
          const idx = tabs.indexOf(active);
          const next = e.key === 'ArrowRight' ? tabs[idx + 1] || tabs[0] : tabs[idx - 1] || tabs[tabs.length - 1];
          next?.focus();
          next?.click();
          e.preventDefault();
        }
      }

      // Arrow keys for search results navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const results = document.getElementById('searchResults');
        if (results && !results.hidden) {
          const items = Array.from(results.querySelectorAll('.search-result-item'));
          if (items.length === 0) return;
          const focused = results.querySelector('.search-result-item.focused');
          let idx = focused ? items.indexOf(focused) : -1;
          if (e.key === 'ArrowDown') idx = Math.min(idx + 1, items.length - 1);
          else idx = Math.max(idx - 1, 0);
          items.forEach(i => i.classList.remove('focused'));
          items[idx]?.classList.add('focused');
          items[idx]?.scrollIntoView({ block: 'nearest' });
          e.preventDefault();
        }
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P3: ONBOARDING TOUR
  // ═══════════════════════════════════════════════════════════════════════
  _tourKey: 'tbo_tour_completed',

  showTour() {
    if (localStorage.getItem(this._tourKey)) return;

    const steps = [
      { target: '.nav-item[data-module="command-center"]', title: 'Dashboard', text: 'Visao geral com KPIs, alertas e mapa de cidades.', position: 'right' },
      { target: '#searchBtn', title: 'Busca Rapida', text: 'Pressione Alt+K para buscar qualquer coisa.', position: 'bottom' },
      { target: '#refreshBtn', title: 'Atualizar Dados', text: 'Sincronize os dados mais recentes do Drive e Fireflies.', position: 'bottom' },
      { target: '#themeToggle', title: 'Tema', text: 'Alterne entre modo claro e escuro.', position: 'right' },
      { target: '#sidebarToggle', title: 'Sidebar', text: 'Recolha o menu para mais espaco de trabalho.', position: 'right' }
    ];

    let currentStep = 0;

    const showStep = (idx) => {
      // Remove previous
      document.querySelector('.ux-tour-overlay')?.remove();
      document.querySelector('.ux-tour-tooltip')?.remove();

      if (idx >= steps.length) {
        localStorage.setItem(this._tourKey, '1');
        TBO_TOAST.success('Tour completo!', 'Use Alt+K para buscar e Alt+R para atualizar.');
        return;
      }

      const step = steps[idx];
      const target = document.querySelector(step.target);
      if (!target) { showStep(idx + 1); return; }

      const rect = target.getBoundingClientRect();

      // Highlight overlay
      const overlay = document.createElement('div');
      overlay.className = 'ux-tour-overlay';
      document.body.appendChild(overlay);

      // Tooltip
      const tooltip = document.createElement('div');
      tooltip.className = `ux-tour-tooltip ux-tour-${step.position}`;
      tooltip.innerHTML = `
        <div class="ux-tour-title">${step.title}</div>
        <div class="ux-tour-text">${step.text}</div>
        <div class="ux-tour-footer">
          <span class="ux-tour-counter">${idx + 1}/${steps.length}</span>
          <div class="ux-tour-btns">
            <button class="btn btn-sm btn-ghost ux-tour-skip">Pular</button>
            <button class="btn btn-sm btn-primary ux-tour-next">${idx === steps.length - 1 ? 'Concluir' : 'Proximo'}</button>
          </div>
        </div>
      `;

      // Position tooltip
      let top = rect.bottom + 12;
      let left = rect.left;
      if (step.position === 'right') { top = rect.top; left = rect.right + 12; }
      else if (step.position === 'bottom') { top = rect.bottom + 12; left = rect.left - 50; }

      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
      document.body.appendChild(tooltip);

      // Highlight target
      target.style.position = target.style.position || 'relative';
      target.style.zIndex = '10001';
      target.classList.add('ux-tour-highlight');

      tooltip.querySelector('.ux-tour-next')?.addEventListener('click', () => {
        target.style.zIndex = '';
        target.classList.remove('ux-tour-highlight');
        currentStep++;
        showStep(currentStep);
      });

      tooltip.querySelector('.ux-tour-skip')?.addEventListener('click', () => {
        target.style.zIndex = '';
        target.classList.remove('ux-tour-highlight');
        overlay.remove();
        tooltip.remove();
        localStorage.setItem(this._tourKey, '1');
      });
    };

    // Delay start to let page render
    setTimeout(() => showStep(0), 1000);
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P3: EXPORT — PDF / Excel (CSV)
  // ═══════════════════════════════════════════════════════════════════════
  exportCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) { TBO_TOAST.warning('Nenhum dado para exportar'); return; }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(';'),
      ...data.map(row => headers.map(h => {
        let val = row[h] ?? '';
        if (typeof val === 'string' && (val.includes(';') || val.includes('"') || val.includes('\n'))) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      }).join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    TBO_TOAST.success('Exportado', `Arquivo ${filename} baixado.`);
  },

  exportPDF(title, contentHtml) {
    const w = window.open('', '_blank');
    if (!w) { TBO_TOAST.error('Popup bloqueado', 'Permita popups para exportar.'); return; }
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - TBO OS</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
          h1 { color: #E85102; font-size: 1.5rem; border-bottom: 2px solid #E85102; padding-bottom: 8px; }
          h2 { color: #333; font-size: 1.1rem; margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.85rem; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; }
          .meta { color: #666; font-size: 0.8rem; margin-bottom: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">TBO OS &bull; ${new Date().toLocaleDateString('pt-BR')} &bull; Gerado automaticamente</div>
        ${contentHtml}
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
    w.document.close();
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P1: DEEP LINKING — Tab state in URL hash
  // ═══════════════════════════════════════════════════════════════════════
  setTabHash(moduleName, tabId) {
    const hash = tabId ? `${moduleName}/${tabId}` : moduleName;
    if (window.location.hash !== '#' + hash) {
      history.replaceState(null, '', '#' + hash);
    }
  },

  getTabFromHash() {
    const hash = window.location.hash.replace('#', '');
    const parts = hash.split('/');
    return { module: parts[0], tab: parts[1] || null };
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P1: BREADCRUMBS
  // ═══════════════════════════════════════════════════════════════════════
  updateBreadcrumb(moduleName, tabLabel = '') {
    const el = document.getElementById('headerBreadcrumb');
    if (!el) return;
    if (tabLabel) {
      el.innerHTML = `<span class="ux-breadcrumb-sep">&rsaquo;</span> <span class="ux-breadcrumb-tab">${tabLabel}</span>`;
    } else {
      el.innerHTML = '';
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // P3: BULK ACTIONS
  // ═══════════════════════════════════════════════════════════════════════
  _bulkSelected: new Set(),

  toggleBulkSelect(id) {
    if (this._bulkSelected.has(id)) {
      this._bulkSelected.delete(id);
    } else {
      this._bulkSelected.add(id);
    }
    this._updateBulkBar();
    return this._bulkSelected.has(id);
  },

  clearBulkSelect() {
    this._bulkSelected.clear();
    document.querySelectorAll('.ux-bulk-check').forEach(cb => cb.checked = false);
    this._updateBulkBar();
  },

  getBulkSelected() {
    return Array.from(this._bulkSelected);
  },

  _updateBulkBar() {
    let bar = document.getElementById('uxBulkBar');
    const count = this._bulkSelected.size;

    if (count === 0) {
      if (bar) bar.remove();
      return;
    }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'uxBulkBar';
      bar.className = 'ux-bulk-bar';
      document.body.appendChild(bar);
    }

    bar.innerHTML = `
      <span>${count} item${count > 1 ? 's' : ''} selecionado${count > 1 ? 's' : ''}</span>
      <button class="btn btn-sm btn-secondary" onclick="TBO_UX.clearBulkSelect()">Limpar</button>
    `;
  }
};
