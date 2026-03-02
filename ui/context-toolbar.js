// TBO OS — ContextToolbar (reusable module toolbar component)
// Renders a state-driven toolbar into #contextToolbar with filters, view toggle, and actions.

const TBO_CONTEXT_TOOLBAR = {
  _state: null,
  _containerEl: null,
  _debounceTimers: {},

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Render toolbar from a ContextToolbarState config.
   * @param {Object} state — { moduleId, title, icon, filters[], viewModes[], actions[], extraActions[], onFilterChange, onViewChange }
   */
  render(state) {
    this._state = state;
    const el = this._getContainer();
    if (!el) return;

    let html = '';

    // ── Row 1: Header (title + actions) ──────────────────────────────────
    html += '<div class="tbo-context-toolbar__header">';
    html += '<div class="tbo-context-toolbar__title">';
    if (state.icon) html += `<i data-lucide="${this._esc(state.icon)}" style="width:18px;height:18px;"></i>`;
    html += `<h2>${this._esc(state.title)}</h2>`;
    if (state.subtitle) html += `<span class="tbo-context-toolbar__subtitle">${this._esc(state.subtitle)}</span>`;
    html += '</div>';

    if (state.actions && state.actions.length) {
      html += '<div class="tbo-context-toolbar__actions">';
      state.actions.forEach(a => { html += this._renderAction(a); });
      html += '</div>';
    }
    html += '</div>';

    // ── Row 2: Filters + Controls ────────────────────────────────────────
    const hasFilters = state.filters && state.filters.length;
    const hasViews = state.viewModes && state.viewModes.length;
    const hasExtra = state.extraActions && state.extraActions.length;

    if (hasFilters || hasViews || hasExtra) {
      html += '<div class="tbo-context-toolbar__filters-row">';

      // Left: filters
      html += '<div class="tbo-context-toolbar__filters">';
      if (hasFilters) state.filters.forEach(f => { html += this._renderFilter(f); });
      html += '</div>';

      // Right: extra actions + view toggle
      html += '<div class="tbo-context-toolbar__controls">';
      if (hasExtra) state.extraActions.forEach(a => { html += this._renderAction(a); });
      if (hasViews) html += this._renderViewToggle(state.viewModes, state.activeView);
      html += '</div>';

      html += '</div>';
    }

    el.innerHTML = html;
    el.style.display = 'block';
    this._bindEvents();
    if (window.lucide) lucide.createIcons({ root: el });
  },

  /**
   * Render custom HTML into the toolbar container (for modules that need full control).
   * @param {string} html — raw HTML to inject
   * @param {string} [moduleId] — optional module identifier
   */
  renderCustom(html, moduleId) {
    this._state = moduleId ? { moduleId } : null;
    const el = this._getContainer();
    if (!el) return;
    el.innerHTML = html;
    el.style.display = 'block';
    if (window.lucide) lucide.createIcons({ root: el });
  },

  /** Clear toolbar and hide container */
  clear() {
    this._state = null;
    Object.values(this._debounceTimers).forEach(t => clearTimeout(t));
    this._debounceTimers = {};
    const el = this._getContainer();
    if (el) { el.innerHTML = ''; el.style.display = 'none'; }
  },

  /** Update options for a specific select filter without full re-render */
  updateFilterOptions(filterId, options) {
    if (!this._state) return;
    const def = this._state.filters.find(f => f.id === filterId);
    if (def) def.options = options;

    const sel = this._getContainer()?.querySelector(`[data-filter-id="${filterId}"]`);
    if (!sel || sel.tagName !== 'SELECT') return;
    const cur = sel.value;
    sel.innerHTML = options.map(o => `<option value="${this._esc(o.value)}">${this._esc(o.label)}</option>`).join('');
    sel.value = cur;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERERS
  // ═══════════════════════════════════════════════════════════════════════════

  _renderFilter(def) {
    if (def.type === 'text') return this._renderTextFilter(def);
    if (def.type === 'select') return this._renderSelectFilter(def);
    return '';
  },

  _renderTextFilter(def) {
    return `<input type="text" class="tbo-filter-text" data-filter-id="${this._esc(def.id)}"
      placeholder="${this._esc(def.label)}" value="${this._esc(def.value || '')}"
      autocomplete="off" ${def.debounceMs ? `data-debounce="${def.debounceMs}"` : ''}>`;
  },

  _renderSelectFilter(def) {
    const opts = (def.options || []).map(o =>
      `<option value="${this._esc(o.value)}"${o.value === def.value ? ' selected' : ''}>${this._esc(o.label)}</option>`
    ).join('');
    return `<select class="tbo-filter-select" data-filter-id="${this._esc(def.id)}">${opts}</select>`;
  },

  _renderViewToggle(modes, activeId) {
    const btns = modes.map(m => {
      const active = m.id === activeId ? ' tbo-view-toggle__btn--active' : '';
      return `<button class="tbo-view-toggle__btn${active}" data-view="${this._esc(m.id)}" title="${this._esc(m.label)}">
        <i data-lucide="${this._esc(m.icon)}" style="width:15px;height:15px;"></i>
      </button>`;
    }).join('');
    return `<div class="tbo-view-toggle">${btns}</div>`;
  },

  _renderAction(a) {
    const variant = a.variant || 'ghost';
    const sizeClass = a.size === 'sm' ? ' btn-sm' : '';
    const tooltip = a.tooltip ? ` title="${this._esc(a.tooltip)}"` : '';
    const label = a.label || '';
    const iconHtml = a.icon ? `<i data-lucide="${this._esc(a.icon)}" style="width:15px;height:15px;"></i>` : '';

    if (variant === 'ghost' && !label) {
      // Icon-only ghost button (like density toggle)
      return `<button class="tbo-context-toolbar__icon-btn" data-action-id="${this._esc(a.id)}"${tooltip}>${iconHtml}</button>`;
    }
    return `<button class="btn btn-${variant}${sizeClass}" data-action-id="${this._esc(a.id)}"${tooltip}>
      ${iconHtml}${label ? (a.icon ? ' ' : '') + this._esc(label) : ''}
    </button>`;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT BINDING (delegation on #contextToolbar)
  // ═══════════════════════════════════════════════════════════════════════════

  _bindEvents() {
    const el = this._getContainer();
    if (!el || !this._state) return;

    // Remove old listeners by replacing with clone — simple cleanup
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
    this._containerEl = clone;

    // Text filter input (with debounce)
    clone.addEventListener('input', (e) => {
      const input = e.target.closest('.tbo-filter-text');
      if (!input) return;
      const id = input.dataset.filterId;
      const ms = parseInt(input.dataset.debounce) || 0;
      if (ms > 0) {
        clearTimeout(this._debounceTimers[id]);
        this._debounceTimers[id] = setTimeout(() => {
          this._state?.onFilterChange?.(id, input.value.trim());
        }, ms);
      } else {
        this._state?.onFilterChange?.(id, input.value.trim());
      }
    });

    // Select filter change
    clone.addEventListener('change', (e) => {
      const sel = e.target.closest('.tbo-filter-select');
      if (!sel) return;
      this._state?.onFilterChange?.(sel.dataset.filterId, sel.value);
    });

    // Click delegation
    clone.addEventListener('click', (e) => {
      // View toggle
      const viewBtn = e.target.closest('.tbo-view-toggle__btn');
      if (viewBtn) {
        const viewId = viewBtn.dataset.view;
        // Update active class
        clone.querySelectorAll('.tbo-view-toggle__btn').forEach(b => b.classList.remove('tbo-view-toggle__btn--active'));
        viewBtn.classList.add('tbo-view-toggle__btn--active');
        this._state?.onViewChange?.(viewId);
        return;
      }

      // Action buttons
      const actionBtn = e.target.closest('[data-action-id]');
      if (actionBtn) {
        const actionId = actionBtn.dataset.actionId;
        const allActions = [...(this._state?.actions || []), ...(this._state?.extraActions || [])];
        const action = allActions.find(a => a.id === actionId);
        if (action?.onClick) action.onClick();
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  _getContainer() {
    if (!this._containerEl || !this._containerEl.isConnected) {
      this._containerEl = document.getElementById('contextToolbar');
    }
    return this._containerEl;
  },

  _esc(str) {
    if (str == null) return '';
    if (typeof str !== 'string') str = String(str);
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
