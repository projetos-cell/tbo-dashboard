// TBO OS — UX Enhancements Module
// Command Palette, Focus Mode, Inline Editing, Toast Undo, Hover Previews,
// Smart Date Picker, Context Menus, Drag-to-Link

const TBO_UX_ENHANCEMENTS = {

  // ── 1. COMMAND PALETTE (Ctrl+K / Cmd+K) ──────────────────────────────
  _palette: {
    isOpen: false,
    selectedIndex: -1,
    results: [],
    overlay: null,
    input: null,
    resultsList: null,
    activeFilter: 'all'
  },

  _paletteCategories: {
    modulo:   { label: 'Modulos',  icon: 'layout-grid',   shortcut: 'Enter' },
    projeto:  { label: 'Projetos', icon: 'briefcase',     shortcut: 'Enter' },
    cliente:  { label: 'Clientes', icon: 'building-2',    shortcut: 'Enter' },
    tarefa:   { label: 'Tarefas',  icon: 'list-checks',   shortcut: 'Enter' },
    pessoa:   { label: 'Pessoas',  icon: 'users',         shortcut: 'Enter' },
    acao:     { label: 'Acoes',    icon: 'zap',           shortcut: 'Enter' },
    deal:     { label: 'Deals',    icon: 'handshake',     shortcut: 'Enter' }
  },

  _paletteActions: [
    { id: 'new-task',    label: 'Nova Tarefa',    category: 'acao', icon: 'plus-circle',   action: () => TBO_ROUTER.navigate('tarefas') },
    { id: 'new-deal',    label: 'Novo Deal',      category: 'acao', icon: 'plus-circle',   action: () => TBO_ROUTER.navigate('pipeline') },
    { id: 'new-project', label: 'Novo Projeto',   category: 'acao', icon: 'plus-circle',   action: () => TBO_ROUTER.navigate('projetos') },
    { id: 'new-meeting', label: 'Nova Reuniao',   category: 'acao', icon: 'plus-circle',   action: () => TBO_ROUTER.navigate('reunioes') },
    { id: 'new-content', label: 'Novo Conteudo',  category: 'acao', icon: 'pen-tool',      action: () => TBO_ROUTER.navigate('conteudo') },
    { id: 'focus-mode',  label: 'Modo Foco',      category: 'acao', icon: 'maximize',      action: () => TBO_UX_ENHANCEMENTS.toggleFocusMode() },
    { id: 'export-data', label: 'Exportar Dados', category: 'acao', icon: 'download',      action: () => { if (typeof TBO_STORAGE !== 'undefined') TBO_STORAGE.exportAll(); } },
    { id: 'refresh',     label: 'Atualizar Dados', category: 'acao', icon: 'refresh-cw',   action: () => document.getElementById('refreshBtn')?.click() },
    { id: 'theme-toggle',label: 'Alternar Tema',  category: 'acao', icon: 'sun-moon',      action: () => { document.body.classList.toggle('dark-mode'); document.body.classList.toggle('light-mode'); localStorage.setItem('tbo_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); } }
  ],

  initCommandPalette() {
    // Build overlay DOM
    if (document.getElementById('uxCommandPalette')) return;

    const overlay = document.createElement('div');
    overlay.id = 'uxCommandPalette';
    overlay.className = 'ux-cmd-palette-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Paleta de comandos');
    overlay.style.display = 'none';

    const filters = [['all','Tudo'],['modulo','Modulos'],['projeto','Projetos'],['cliente','Clientes'],['tarefa','Tarefas'],['pessoa','Pessoas'],['acao','Acoes']];
    overlay.innerHTML = `<div class="ux-cmd-palette-modal">
      <div class="ux-cmd-palette-input-wrap">
        <i data-lucide="search" class="ux-cmd-palette-search-icon" aria-hidden="true"></i>
        <input type="text" class="ux-cmd-palette-input" id="uxCmdPaletteInput" placeholder="Buscar modulos, projetos, tarefas, acoes..." autocomplete="off" spellcheck="false"/>
        <kbd class="ux-cmd-palette-esc">Esc</kbd>
      </div>
      <div class="ux-cmd-palette-filters" id="uxCmdPaletteFilters">
        ${filters.map(([k,l])=>`<button class="ux-cmd-filter-chip${k==='all'?' active':''}" data-filter="${k}">${l}</button>`).join('')}
      </div>
      <div class="ux-cmd-palette-results" id="uxCmdPaletteResults">
        <div class="ux-cmd-palette-hint"><span>Digite para buscar ou selecione uma categoria acima</span>
          <div class="ux-cmd-palette-hint-keys"><span><kbd>&#8593;&#8595;</kbd> Navegar</span><span><kbd>Enter</kbd> Selecionar</span><span><kbd>Esc</kbd> Fechar</span></div>
        </div>
      </div>
    </div>`;

    document.body.appendChild(overlay);
    this._palette.overlay = overlay;
    this._palette.input = document.getElementById('uxCmdPaletteInput');
    this._palette.resultsList = document.getElementById('uxCmdPaletteResults');

    // Bind events
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeCommandPalette();
    });

    this._palette.input.addEventListener('input', () => this._onPaletteInput());

    this._palette.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._paletteNavigate(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._paletteNavigate(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this._paletteSelectCurrent();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeCommandPalette();
      }
    });

    // Filter chips
    const filtersEl = document.getElementById('uxCmdPaletteFilters');
    if (filtersEl) {
      filtersEl.addEventListener('click', (e) => {
        const chip = e.target.closest('.ux-cmd-filter-chip');
        if (!chip) return;
        filtersEl.querySelectorAll('.ux-cmd-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this._palette.activeFilter = chip.dataset.filter;
        this._onPaletteInput();
        this._palette.input.focus();
      });
    }

    // Keyboard shortcut: Ctrl+K / Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        if (this._palette.isOpen) {
          this.closeCommandPalette();
        } else {
          this.openCommandPalette();
        }
      }
    });

    // Re-create lucide icons
    if (window.lucide) lucide.createIcons();
  },

  openCommandPalette() {
    const overlay = this._palette.overlay;
    if (!overlay) return;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    this._palette.isOpen = true;
    this._palette.selectedIndex = -1;
    this._palette.input.value = '';
    this._palette.activeFilter = 'all';

    // Reset filter chips
    const filtersEl = document.getElementById('uxCmdPaletteFilters');
    if (filtersEl) {
      filtersEl.querySelectorAll('.ux-cmd-filter-chip').forEach(c => c.classList.remove('active'));
      const allChip = filtersEl.querySelector('[data-filter="all"]');
      if (allChip) allChip.classList.add('active');
    }

    this._renderPaletteDefaults();
    setTimeout(() => this._palette.input.focus(), 50);
  },

  closeCommandPalette() {
    const overlay = this._palette.overlay;
    if (!overlay) return;
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 200);
    this._palette.isOpen = false;
    this._palette.results = [];
    this._palette.selectedIndex = -1;
  },

  _renderPaletteDefaults() {
    const container = this._palette.resultsList;
    if (!container) return;
    let html = '<div class="ux-cmd-palette-section-label">Acoes Rapidas</div>';
    this._paletteActions.slice(0,6).forEach((a,i) => { html += this._renderPaletteItem({ id:a.id, title:a.label, category:'acao', icon:a.icon, shortcut:'', index:i, type:'action' }); });
    const cur = typeof TBO_ROUTER !== 'undefined' ? TBO_ROUTER.getCurrent() : null;
    if (typeof TBO_APP !== 'undefined' && TBO_APP._moduleLabels) {
      const icons = TBO_APP._moduleIcons || {};
      const mods = Object.entries(TBO_APP._moduleLabels).slice(0,8);
      if (mods.length) {
        html += '<div class="ux-cmd-palette-section-label">Modulos</div>';
        mods.forEach(([key,label],i) => {
          if (typeof TBO_AUTH !== 'undefined' && !TBO_AUTH.canAccess(key)) return;
          html += this._renderPaletteItem({ id:'mod_'+key, title:label, category:'modulo', icon:icons[key]||'layout-grid', shortcut:cur===key?'Atual':'', index:6+i, type:'module', moduleKey:key });
        });
      }
    }
    container.innerHTML = html;
    this._palette.results = container.querySelectorAll('.ux-cmd-palette-item');
    if (window.lucide) lucide.createIcons();
    this._bindPaletteResultClicks();
  },

  _onPaletteInput() {
    const query = (this._palette.input.value || '').trim().toLowerCase();
    const filter = this._palette.activeFilter;
    if (!query && filter === 'all') { this._renderPaletteDefaults(); return; }

    const results = [];
    const ok = (f) => filter === 'all' || filter === f;
    const hasStorage = typeof TBO_STORAGE !== 'undefined';

    // Modules
    if (ok('modulo') && typeof TBO_APP !== 'undefined' && TBO_APP._moduleLabels) {
      const icons = TBO_APP._moduleIcons || {};
      Object.entries(TBO_APP._moduleLabels).forEach(([key, label]) => {
        if (typeof TBO_AUTH !== 'undefined' && !TBO_AUTH.canAccess(key)) return;
        if (!query || this._fuzzyMatch(label.toLowerCase(), query) || this._fuzzyMatch(key, query)) {
          results.push({ id:'mod_'+key, title:label, category:'modulo', icon:icons[key]||'layout-grid', score:this._paletteScore(label.toLowerCase(),query), type:'module', moduleKey:key });
        }
      });
    }
    // ERP Projects
    if (ok('projeto') && hasStorage) {
      TBO_STORAGE.getAllErpEntities('project').forEach(p => {
        const name = p.name||p.title||'', text = `${name} ${p.client||''} ${p.status||''}`.toLowerCase();
        if (!query || this._fuzzyMatch(text, query))
          results.push({ id:'proj_'+p.id, title:name, subtitle:p.client||'', category:'projeto', icon:'briefcase', score:this._paletteScore(text,query), type:'entity', entityType:'project', entityId:p.id });
      });
      // Context projects (deduplicated)
      (TBO_STORAGE.get('context').projetos_ativos||[]).forEach(p => {
        const text = `${p.nome} ${p.construtora}`.toLowerCase();
        if ((!query || this._fuzzyMatch(text, query)) && !results.find(r => r.title === p.nome))
          results.push({ id:'ctx_'+p.nome, title:p.nome, subtitle:p.construtora, category:'projeto', icon:'briefcase', score:this._paletteScore(text,query), type:'navigate', route:'projetos' });
      });
    }
    // Clients
    if (ok('cliente') && hasStorage) {
      (TBO_STORAGE.get('context').clientes_construtoras||[]).forEach(c => {
        if (!query || this._fuzzyMatch(c.toLowerCase(), query))
          results.push({ id:'client_'+c, title:c, category:'cliente', icon:'building-2', score:this._paletteScore(c.toLowerCase(),query), type:'navigate', route:'clientes' });
      });
    }
    // Tasks
    if (ok('tarefa') && hasStorage) {
      TBO_STORAGE.getAllErpEntities('task').slice(0,30).forEach(t => {
        const name = t.name||t.title||'', text = `${name} ${t.status||''}`.toLowerCase();
        if (!query || this._fuzzyMatch(text, query))
          results.push({ id:'task_'+t.id, title:name, subtitle:t.status||'', category:'tarefa', icon:'list-checks', score:this._paletteScore(text,query), type:'entity', entityType:'task', entityId:t.id });
      });
    }
    // People
    if (ok('pessoa') && typeof TBO_AUTH !== 'undefined' && TBO_AUTH._users) {
      Object.entries(TBO_AUTH._users).forEach(([key, user]) => {
        const text = `${user.name} ${key} ${user.email||''}`.toLowerCase();
        if (!query || this._fuzzyMatch(text, query))
          results.push({ id:'person_'+key, title:user.name, subtitle:user.email||key, category:'pessoa', icon:'user', score:this._paletteScore(text,query), type:'navigate', route:'rh' });
      });
    }
    // Deals
    if (ok('deal') && hasStorage) {
      TBO_STORAGE.getCrmDeals().forEach(d => {
        const text = `${d.name} ${d.company} ${d.stage}`.toLowerCase();
        if (!query || this._fuzzyMatch(text, query))
          results.push({ id:'deal_'+d.id, title:d.name, subtitle:`${d.company} - R$${(d.value||0).toLocaleString('pt-BR')}`, category:'deal', icon:'handshake', score:this._paletteScore(text,query), type:'navigate', route:'pipeline' });
      });
    }
    // Actions
    if (ok('acao')) {
      this._paletteActions.forEach(a => {
        const text = a.label.toLowerCase();
        if (!query || this._fuzzyMatch(text, query))
          results.push({ id:a.id, title:a.label, category:'acao', icon:a.icon, score:this._paletteScore(text,query)+2, type:'action' });
      });
    }

    results.sort((a, b) => (b.score||0) - (a.score||0));
    this._renderPaletteResults(results.slice(0, 20));
  },

  _renderPaletteResults(results) {
    const container = this._palette.resultsList;
    if (!container) return;
    if (results.length === 0) {
      container.innerHTML = '<div class="ux-cmd-palette-empty">Nenhum resultado encontrado</div>';
      this._palette.results = []; this._palette.selectedIndex = -1; return;
    }
    const grouped = {};
    results.forEach(r => { const c = r.category||'outros'; if (!grouped[c]) grouped[c]=[]; grouped[c].push(r); });
    let html = '', idx = 0;
    Object.entries(grouped).forEach(([cat, items]) => {
      html += `<div class="ux-cmd-palette-section-label">${this._escapeHtml((this._paletteCategories[cat]||{}).label||cat)}</div>`;
      items.forEach(item => { html += this._renderPaletteItem({ ...item, index: idx++ }); });
    });
    container.innerHTML = html;
    this._palette.results = container.querySelectorAll('.ux-cmd-palette-item');
    this._palette.selectedIndex = -1;
    if (window.lucide) lucide.createIcons();
    this._bindPaletteResultClicks();
  },

  _renderPaletteItem(item) {
    const sub = item.subtitle ? `<span class="ux-cmd-palette-item-sub">${this._escapeHtml(item.subtitle)}</span>` : '';
    const catLabel = (this._paletteCategories[item.category]||{}).label||'';
    const sc = item.shortcut||'';
    return `<div class="ux-cmd-palette-item" data-index="${item.index}" data-id="${item.id}" data-type="${item.type||''}" data-route="${item.route||''}" data-module-key="${item.moduleKey||''}" data-entity-type="${item.entityType||''}" data-entity-id="${item.entityId||''}" role="option" tabindex="-1">
      <div class="ux-cmd-palette-item-left"><i data-lucide="${item.icon||'file'}" class="ux-cmd-palette-item-icon" aria-hidden="true"></i><div class="ux-cmd-palette-item-text"><span class="ux-cmd-palette-item-title">${this._escapeHtml(item.title)}</span>${sub}</div></div>
      <div class="ux-cmd-palette-item-right"><span class="ux-cmd-palette-item-cat">${this._escapeHtml(catLabel)}</span>${sc?`<kbd class="ux-cmd-palette-item-key">${sc}</kbd>`:''}</div></div>`;
  },

  _bindPaletteResultClicks() {
    const container = this._palette.resultsList;
    if (!container) return;
    container.querySelectorAll('.ux-cmd-palette-item').forEach(item => {
      item.addEventListener('click', () => {
        this._palette.selectedIndex = parseInt(item.dataset.index) || 0;
        this._paletteSelectCurrent();
      });
      item.addEventListener('mouseenter', () => {
        container.querySelectorAll('.ux-cmd-palette-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        this._palette.selectedIndex = parseInt(item.dataset.index) || 0;
      });
    });
  },

  _paletteNavigate(direction) {
    const items = this._palette.results;
    if (!items || items.length === 0) return;
    items.forEach(i => i.classList.remove('selected'));
    this._palette.selectedIndex += direction;
    if (this._palette.selectedIndex < 0) this._palette.selectedIndex = items.length - 1;
    if (this._palette.selectedIndex >= items.length) this._palette.selectedIndex = 0;
    const current = items[this._palette.selectedIndex];
    if (current) {
      current.classList.add('selected');
      current.scrollIntoView({ block: 'nearest' });
    }
  },

  _paletteSelectCurrent() {
    const items = this._palette.results;
    if (!items || items.length === 0) return;

    let target;
    if (this._palette.selectedIndex >= 0 && this._palette.selectedIndex < items.length) {
      target = items[this._palette.selectedIndex];
    } else if (items.length > 0) {
      target = items[0];
    }
    if (!target) return;

    const type = target.dataset.type;
    const route = target.dataset.route;
    const moduleKey = target.dataset.moduleKey;
    const id = target.dataset.id;
    const entityType = target.dataset.entityType;

    this.closeCommandPalette();

    if (type === 'module' && moduleKey && typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.navigate(moduleKey);
    } else if (type === 'navigate' && route && typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.navigate(route);
    } else if (type === 'action') {
      const action = this._paletteActions.find(a => a.id === id);
      if (action && action.action) {
        try { action.action(); } catch (e) { console.warn('[UX Enhancements] Action error:', e); }
      }
    } else if (type === 'entity' && entityType) {
      const routeMap = {
        project: 'projetos', task: 'tarefas', deliverable: 'entregas',
        proposal: 'comercial', decision: 'decisoes'
      };
      if (routeMap[entityType] && typeof TBO_ROUTER !== 'undefined') {
        TBO_ROUTER.navigate(routeMap[entityType]);
      }
    }
  },

  _paletteScore(text, query) {
    if (!query) return 1;
    let score = 0;
    if (text.startsWith(query)) score += 10;
    else if (text.includes(query)) score += 5;
    if (text.split(/\s+/).includes(query)) score += 8;
    if (text.length < 30) score += 2;
    return score;
  },

  _fuzzyMatch(text, query) {
    if (!query) return true;
    if (text.includes(query)) return true;
    // Simple fuzzy: all query chars must appear in order
    let qi = 0;
    for (let i = 0; i < text.length && qi < query.length; i++) {
      if (text[i] === query[qi]) qi++;
    }
    return qi === query.length;
  },

  // ── 2. FOCUS MODE ─────────────────────────────────────────────────────
  _focusModeActive: false,
  _focusExitBtn: null,

  toggleFocusMode() {
    if (this._focusModeActive) {
      this._exitFocusMode();
    } else {
      this._enterFocusMode();
    }
  },

  _enterFocusMode() {
    this._focusModeActive = true;
    document.body.classList.add('focus-mode');

    // Create exit button if needed
    if (!this._focusExitBtn) {
      const btn = document.createElement('button');
      btn.id = 'uxFocusExitBtn';
      btn.className = 'ux-focus-exit-btn';
      btn.setAttribute('aria-label', 'Sair do Modo Foco');
      btn.innerHTML = '<i data-lucide="minimize-2" style="width:14px;height:14px;" aria-hidden="true"></i> Sair do Foco';
      btn.addEventListener('click', () => this._exitFocusMode());
      document.body.appendChild(btn);
      this._focusExitBtn = btn;
      if (window.lucide) lucide.createIcons();
    }

    this._focusExitBtn.style.display = 'flex';

    // Persist state
    try { sessionStorage.setItem('tbo_focus_mode', '1'); } catch (e) { /* noop */ }

    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.info('Modo Foco', 'Barra lateral e cabecalho ocultos. Pressione Ctrl+. para sair.');
    }
  },

  _exitFocusMode() {
    this._focusModeActive = false;
    document.body.classList.remove('focus-mode');

    if (this._focusExitBtn) {
      this._focusExitBtn.style.display = 'none';
    }

    try { sessionStorage.removeItem('tbo_focus_mode'); } catch (e) { /* noop */ }
  },

  _restoreFocusMode() {
    try {
      if (sessionStorage.getItem('tbo_focus_mode') === '1') {
        this._enterFocusMode();
      }
    } catch (e) { /* noop */ }
  },

  initFocusMode() {
    // Keyboard shortcut: Ctrl+. / Cmd+.
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '.') {
        e.preventDefault();
        this.toggleFocusMode();
      }
    });

    // Restore persisted state
    this._restoreFocusMode();
  },

  // ── 3. INLINE EDITING ─────────────────────────────────────────────────
  enableInlineEdit(element, options = {}) {
    if (!element) return;

    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;

    // Skip if already in edit mode
    if (el.dataset.uxInlineActive === 'true') return;

    const originalValue = el.textContent.trim();
    const type = options.type || el.dataset.inlineEditType || 'text';
    const entity = options.entity || el.dataset.inlineEditEntity || '';
    const field = options.field || el.dataset.inlineEditField || '';
    const entityId = options.entityId || el.dataset.inlineEditId || '';

    el.dataset.uxInlineActive = 'true';
    el.classList.add('ux-inline-editing');

    let inputEl;
    if (type === 'select') {
      inputEl = document.createElement('select');
      inputEl.className = 'ux-inline-input ux-inline-select';
      (options.selectOptions||[]).forEach(opt => {
        const o = document.createElement('option');
        o.value = typeof opt === 'object' ? opt.value : opt;
        o.textContent = typeof opt === 'object' ? opt.label : opt;
        if (o.value === originalValue || o.textContent === originalValue) o.selected = true;
        inputEl.appendChild(o);
      });
    } else {
      inputEl = document.createElement('input');
      inputEl.type = type === 'date' ? 'date' : type === 'number' ? 'number' : 'text';
      inputEl.className = 'ux-inline-input';
      inputEl.value = type === 'number' ? originalValue.replace(/[^0-9.,\-]/g, '') : originalValue;
    }

    inputEl.style.width = Math.max(el.offsetWidth, 80) + 'px';
    el.textContent = '';
    el.appendChild(inputEl);
    inputEl.focus();
    if (inputEl.select) inputEl.select();

    const cleanup = (restoreOriginal) => {
      el.dataset.uxInlineActive = 'false';
      el.classList.remove('ux-inline-editing');
      if (restoreOriginal) {
        el.textContent = originalValue;
      }
    };

    const save = async () => {
      const newValue = inputEl.value.trim();
      if (newValue === originalValue) {
        cleanup(true);
        return;
      }

      // Show spinner
      el.innerHTML = '<span class="ux-inline-spinner"></span>';

      try {
        let saved = false;

        if (entity && field && entityId && typeof TBO_STORAGE !== 'undefined') {
          if (entity === 'deal') {
            const result = TBO_STORAGE.updateCrmDeal(entityId, { [field]: newValue });
            saved = !!result;
          } else {
            const result = TBO_STORAGE.updateErpEntity(entity, entityId, { [field]: newValue });
            saved = !!result;
          }
        }

        if (options.onSave) {
          await options.onSave(newValue, originalValue);
          saved = true;
        }

        if (saved) {
          el.textContent = newValue;
          el.dataset.uxInlineActive = 'false';
          el.classList.remove('ux-inline-editing');

          // Flash success indicator
          const check = document.createElement('span');
          check.className = 'ux-inline-success';
          check.textContent = '\u2713';
          el.appendChild(check);
          setTimeout(() => check.remove(), 1500);
        } else {
          cleanup(true);
        }
      } catch (e) {
        console.warn('[UX Enhancements] Inline edit save error:', e);
        cleanup(true);
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.error('Erro ao salvar', e.message || 'Falha ao salvar edicao inline.');
        }
      }
    };

    inputEl.addEventListener('blur', () => {
      // Small delay to allow click events to fire first
      setTimeout(save, 100);
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inputEl.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        inputEl.removeEventListener('blur', save);
        cleanup(true);
      }
    });
  },

  initInlineEditing() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-inline-edit]');
      if (!target) return;
      if (target.dataset.uxInlineActive === 'true') return;
      e.preventDefault();

      this.enableInlineEdit(target, {
        type: target.dataset.inlineEditType || 'text',
        entity: target.dataset.inlineEditEntity || '',
        field: target.dataset.inlineEditField || '',
        entityId: target.dataset.inlineEditId || ''
      });
    });
  },

  // ── 4. TOAST ACTIONS (UNDO) ───────────────────────────────────────────
  successWithUndo(title, message, undoCallback, timeout = 5000) {
    if (typeof TBO_TOAST === 'undefined') {
      console.warn('[UX Enhancements] TBO_TOAST not available');
      return;
    }

    const container = TBO_TOAST._getContainer();
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast success ux-toast-undo';
    toast.innerHTML = `
      <span class="toast-icon">\u2705</span>
      <div class="toast-content">
        <div class="toast-title">${TBO_TOAST._escapeHtml(title)}</div>
        ${message ? `<div class="toast-message">${TBO_TOAST._escapeHtml(message)}</div>` : ''}
      </div>
      <button class="ux-toast-undo-btn">Desfazer</button>
      <button class="toast-close" aria-label="Fechar">&times;</button>
      <div class="ux-toast-countdown">
        <div class="ux-toast-countdown-bar"></div>
      </div>
    `;

    container.appendChild(toast);

    // Animate countdown bar
    const bar = toast.querySelector('.ux-toast-countdown-bar');
    if (bar) {
      bar.style.transition = `width ${timeout}ms linear`;
      requestAnimationFrame(() => {
        bar.style.width = '0%';
      });
    }

    let undone = false;
    let timerHandle;

    const closeToast = () => {
      TBO_TOAST._remove(toast);
      clearTimeout(timerHandle);
    };

    // Undo button
    const undoBtn = toast.querySelector('.ux-toast-undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        if (undone) return;
        undone = true;
        clearTimeout(timerHandle);
        try {
          undoCallback();
          TBO_TOAST.info('Desfeito', 'Acao revertida com sucesso.');
        } catch (e) {
          console.warn('[UX Enhancements] Undo failed:', e);
          TBO_TOAST.error('Erro', 'Falha ao desfazer acao.');
        }
        TBO_TOAST._remove(toast);
      });
    }

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeToast);
    }

    // Auto dismiss
    timerHandle = setTimeout(closeToast, timeout);

    return toast;
  },

  // ── 5. HOVER PREVIEWS (PEEK) ──────────────────────────────────────────
  _peekTimeout: null,
  _peekCard: null,
  _peekActiveEl: null,

  initHoverPreviews() {
    document.addEventListener('mouseenter', (e) => {
      if (!e.target || !e.target.closest) return;
      const target = e.target.closest('[data-peek]');
      if (!target) return;

      const type = target.dataset.peek;
      const id = target.dataset.peekId;
      if (!type || !id) return;

      this._peekActiveEl = target;

      // 300ms delay
      this._peekTimeout = setTimeout(() => {
        this._showPeekCard(target, type, id);
      }, 300);
    }, true);

    document.addEventListener('mouseleave', (e) => {
      if (!e.target || !e.target.closest) return;
      const target = e.target.closest('[data-peek]');
      if (!target) return;

      clearTimeout(this._peekTimeout);
      this._peekTimeout = null;

      // Delay hide to allow moving to the card
      setTimeout(() => {
        if (this._peekCard && !this._peekCard.matches(':hover')) {
          this._hidePeekCard();
        }
      }, 200);
    }, true);
  },

  _showPeekCard(anchor, type, id) {
    this._hidePeekCard();
    const esc = (s) => this._escapeHtml(s);
    const field = (label, val) => `<div class="ux-peek-field"><strong>${label}:</strong> ${esc(val||'N/A')}</div>`;
    const badge = (label, val) => `<div class="ux-peek-field"><strong>${label}:</strong> <span class="ux-peek-badge">${esc(val||'N/A')}</span></div>`;
    let content = '', title = '';
    const hasStorage = typeof TBO_STORAGE !== 'undefined';

    if (type === 'project' && hasStorage) {
      const p = TBO_STORAGE.getErpEntity('project', id);
      if (p) {
        title = p.name||p.title||'Projeto';
        const tasks = TBO_STORAGE.getErpEntitiesByParent('task', id);
        content = field('Cliente',p.client) + badge('Status',p.status) + field('Responsavel',p.owner)
          + `<div class="ux-peek-field"><strong>Tarefas pendentes:</strong> ${tasks.filter(t=>t.status!=='concluida').length} de ${tasks.length}</div>`
          + (p.next_action ? field('Proxima acao',p.next_action) : '');
      }
    } else if (type === 'task' && hasStorage) {
      const t = TBO_STORAGE.getErpEntity('task', id);
      if (t) {
        title = t.name||t.title||'Tarefa';
        content = badge('Status',t.status) + field('Responsavel',t.owner)
          + (t.due_date ? field('Prazo',t.due_date) : '')
          + (t.estimate_minutes ? field('Estimativa',t.estimate_minutes+' min') : '');
      }
    } else if (type === 'deal' && hasStorage) {
      const d = TBO_STORAGE.getCrmDeals().find(x => x.id === id);
      if (d) {
        title = d.name||'Deal';
        content = field('Empresa',d.company) + badge('Etapa',d.stage)
          + `<div class="ux-peek-field"><strong>Valor:</strong> R$ ${(d.value||0).toLocaleString('pt-BR')}</div>`
          + `<div class="ux-peek-field"><strong>Probabilidade:</strong> ${d.probability||0}%</div>`
          + field('Responsavel',d.owner);
      }
    } else if (type === 'person' && typeof TBO_AUTH !== 'undefined' && TBO_AUTH._users?.[id]) {
      const u = TBO_AUTH._users[id];
      title = u.name;
      const role = typeof TBO_PERMISSIONS !== 'undefined' ? TBO_PERMISSIONS.getRoleForUser(id) : null;
      content = field('Email',u.email)
        + (role ? field('Perfil',role.label) : '')
        + (role?.bu ? field('BU',role.bu) : '');
    }
    if (!content) return;

    const card = document.createElement('div');
    card.className = 'ux-peek-card';
    card.innerHTML = `<div class="ux-peek-header">${esc(title)}</div><div class="ux-peek-body">${content}</div>`;
    document.body.appendChild(card);
    this._peekCard = card;

    // Position near anchor, respecting viewport edges
    const rect = anchor.getBoundingClientRect();
    let top = rect.bottom + 8, left = rect.left;
    const cr = card.getBoundingClientRect();
    if (top + cr.height > window.innerHeight) top = rect.top - cr.height - 8;
    if (left + cr.width > window.innerWidth) left = window.innerWidth - cr.width - 16;
    if (left < 8) left = 8;
    card.style.top = top + 'px';
    card.style.left = left + 'px';
    requestAnimationFrame(() => card.classList.add('visible'));
    card.addEventListener('mouseleave', () => this._hidePeekCard());
  },

  _hidePeekCard() {
    if (this._peekCard) {
      this._peekCard.classList.remove('visible');
      const card = this._peekCard;
      setTimeout(() => card.remove(), 200);
      this._peekCard = null;
    }
    this._peekActiveEl = null;
  },

  // ── 6. SMART DATE PICKER ──────────────────────────────────────────────
  _datePatterns: [
    { regex: /^hoje$/i, fn: () => new Date() },
    { regex: /^amanha$/i, fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
    { regex: /^ontem$/i, fn: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; } },
    { regex: /^depois\s+de\s+amanha$/i, fn: () => { const d = new Date(); d.setDate(d.getDate() + 2); return d; } },
    { regex: /^em\s+(\d+)\s+dia(s)?$/i, fn: (m) => { const d = new Date(); d.setDate(d.getDate() + parseInt(m[1])); return d; } },
    { regex: /^em\s+(\d+)\s+semana(s)?$/i, fn: (m) => { const d = new Date(); d.setDate(d.getDate() + parseInt(m[1]) * 7); return d; } },
    { regex: /^em\s+(\d+)\s+m(e|es|eses|ê|ês)s?$/i, fn: (m) => { const d = new Date(); d.setMonth(d.getMonth() + parseInt(m[1])); return d; } },
    { regex: /^proxim(a|o)\s+segunda$/i, fn: () => TBO_UX_ENHANCEMENTS._nextWeekday(1) },
    { regex: /^proxim(a|o)\s+terca$/i, fn: () => TBO_UX_ENHANCEMENTS._nextWeekday(2) },
    { regex: /^proxim(a|o)\s+quarta$/i, fn: () => TBO_UX_ENHANCEMENTS._nextWeekday(3) },
    { regex: /^proxim(a|o)\s+quinta$/i, fn: () => TBO_UX_ENHANCEMENTS._nextWeekday(4) },
    { regex: /^proxim(a|o)\s+sexta$/i, fn: () => TBO_UX_ENHANCEMENTS._nextWeekday(5) },
    { regex: /^proxim(a|o)\s+sabado$/i, fn: () => TBO_UX_ENHANCEMENTS._nextWeekday(6) },
    { regex: /^proxim(a|o)\s+domingo$/i, fn: () => TBO_UX_ENHANCEMENTS._nextWeekday(0) },
    { regex: /^fim\s+d(o|e)\s+mes$/i, fn: () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return d; } },
    { regex: /^inicio\s+d(o|e)\s+mes$/i, fn: () => { const d = new Date(); d.setDate(1); return d; } },
    { regex: /^fim\s+d(o|a)\s+semana$/i, fn: () => TBO_UX_ENHANCEMENTS._nextWeekday(5) },
    { regex: /^proxim(a|o)\s+mes$/i, fn: () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; } }
  ],

  _nextWeekday(target) {
    const d = new Date();
    const current = d.getDay();
    let diff = target - current;
    if (diff <= 0) diff += 7;
    d.setDate(d.getDate() + diff);
    return d;
  },

  _parseNaturalDate(text) {
    const trimmed = text.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove accents for matching

    for (const pattern of this._datePatterns) {
      const match = trimmed.match(pattern.regex);
      if (match) {
        try {
          return pattern.fn(match);
        } catch (e) { /* continue */ }
      }
    }
    return null;
  },

  _formatDateBR(date) {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  },

  _formatDateISO(date) {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  },

  initSmartDatePickers() {
    document.querySelectorAll('.smart-date-input').forEach(input => {
      this._enhanceSmartDateInput(input);
    });

    // MutationObserver for dynamically added inputs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mut => {
        mut.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('smart-date-input')) {
            this._enhanceSmartDateInput(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.smart-date-input').forEach(inp => {
              this._enhanceSmartDateInput(inp);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },

  _enhanceSmartDateInput(input) {
    if (input.dataset.uxSmartDate === 'true') return;
    input.dataset.uxSmartDate = 'true';
    const preview = document.createElement('div');
    preview.className = 'ux-smart-date-preview';
    preview.style.display = 'none';
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(preview);
    input.setAttribute('placeholder', input.getAttribute('placeholder') || 'Ex: amanha, proxima sexta, em 2 semanas...');

    input.addEventListener('input', () => {
      const val = input.value.trim();
      if (!val) { preview.style.display = 'none'; return; }
      let date = this._parseNaturalDate(val);
      if (!date) { const d = new Date(val); if (!isNaN(d.getTime())) date = d; }
      if (date) {
        preview.textContent = this._formatDateBR(date);
        preview.style.display = 'block';
        preview.className = 'ux-smart-date-preview ux-smart-date-valid';
      } else {
        preview.textContent = 'Data nao reconhecida';
        preview.style.display = 'block';
        preview.className = 'ux-smart-date-preview ux-smart-date-invalid';
      }
    });

    const commit = () => {
      const val = input.value.trim();
      if (!val) return;
      let date = this._parseNaturalDate(val);
      if (!date) { const d = new Date(val); if (!isNaN(d.getTime())) date = d; }
      if (date) {
        const iso = this._formatDateISO(date);
        input.value = this._formatDateBR(date);
        input.dataset.isoValue = iso;
        const hid = input.dataset.hiddenInput;
        if (hid) { const el = document.getElementById(hid); if (el) el.value = iso; }
        preview.style.display = 'none';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); input.blur(); } });
  },

  // ── 7. CONTEXTUAL RIGHT-CLICK MENUS ───────────────────────────────────
  _contextMenu: null,

  initContextMenus() {
    document.addEventListener('contextmenu', (e) => {
      const target = e.target.closest('[data-context-menu]');
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();

      const menuType = target.dataset.contextMenu;
      const entityId = target.dataset.contextId || '';
      const entityName = target.dataset.contextName || '';

      this._showContextMenu(e.clientX, e.clientY, menuType, entityId, entityName, target);
    });

    // Dismiss on click outside
    document.addEventListener('click', (e) => {
      if (this._contextMenu && !this._contextMenu.contains(e.target)) {
        this._hideContextMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._contextMenu) {
        this._hideContextMenu();
      }
    });
  },

  _showContextMenu(x, y, type, entityId, entityName, targetEl) {
    this._hideContextMenu();
    const items = this._getContextMenuItems(type, entityId, entityName);
    if (!items.length) return;

    const menu = document.createElement('div');
    menu.className = 'ux-context-menu';
    menu.setAttribute('role', 'menu');
    items.forEach(item => {
      if (item.separator) { const s = document.createElement('div'); s.className = 'ux-context-menu-separator'; menu.appendChild(s); return; }
      const btn = document.createElement('button');
      btn.className = `ux-context-menu-item ${item.danger ? 'ux-context-menu-danger' : ''}`;
      btn.setAttribute('role', 'menuitem');
      btn.innerHTML = `<i data-lucide="${item.icon}" class="ux-context-menu-icon" aria-hidden="true"></i><span>${this._escapeHtml(item.label)}</span>`;
      btn.addEventListener('click', () => { this._hideContextMenu(); try { item.action?.(); } catch(e) { console.warn('[UX] ctx error:', e); } });
      menu.appendChild(btn);
    });
    document.body.appendChild(menu);
    this._contextMenu = menu;
    const r = menu.getBoundingClientRect();
    let fx = x, fy = y;
    if (x + r.width > innerWidth) fx = innerWidth - r.width - 8;
    if (y + r.height > innerHeight) fy = innerHeight - r.height - 8;
    menu.style.left = Math.max(8, fx) + 'px';
    menu.style.top = Math.max(8, fy) + 'px';
    requestAnimationFrame(() => menu.classList.add('visible'));
    if (window.lucide) lucide.createIcons();
  },

  _hideContextMenu() {
    if (this._contextMenu) {
      this._contextMenu.classList.remove('visible');
      const menu = this._contextMenu;
      setTimeout(() => menu.remove(), 150);
      this._contextMenu = null;
    }
  },

  _getContextMenuItems(type, entityId, entityName) {
    const routeMap = { project:'projetos', task:'tarefas', deal:'pipeline', deliverable:'entregas' };
    const nav = () => { if (routeMap[type] && typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate(routeMap[type]); };
    const isFounder = typeof TBO_AUTH !== 'undefined' && typeof TBO_PERMISSIONS !== 'undefined' && TBO_PERMISSIONS.isFounder(TBO_AUTH.getCurrentUser()?.userId);

    const items = [
      { label:'Editar', icon:'pencil', action: nav },
      { label:'Copiar Link', icon:'link', action: () => {
        const url = `${location.origin}${location.pathname}#${type}/${entityId}`;
        navigator.clipboard?.writeText(url).then(() => { if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Link copiado','Link copiado para a area de transferencia.'); });
      }},
      { label:'Ver Detalhes', icon:'eye', action: nav },
      { separator: true }
    ];

    if (isFounder) {
      items.push({ label:'Excluir', icon:'trash-2', danger:true, action: () => {
        if (typeof TBO_UX !== 'undefined') {
          TBO_UX.confirm('Excluir '+(entityName||type), `Tem certeza que deseja excluir "${entityName||entityId}"? Esta acao nao pode ser desfeita.`, () => {
            if (typeof TBO_STORAGE !== 'undefined') {
              type === 'deal' ? TBO_STORAGE.deleteCrmDeal(entityId) : TBO_STORAGE.deleteErpEntity(type, entityId);
              if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Excluido', `"${entityName||entityId}" foi excluido.`);
            }
          }, { danger:true, confirmText:'Excluir' });
        }
      }});
    }
    return items;
  },

  // ── 8. DRAG-TO-LINK ───────────────────────────────────────────────────
  _dragState: {
    active: false,
    sourceType: null,
    sourceId: null,
    sourceEl: null
  },

  initDragToLink() {
    document.addEventListener('dragstart', (e) => {
      const src = e.target.closest('[data-linkable-type]');
      if (!src) return;
      this._dragState = { active:true, sourceType:src.dataset.linkableType, sourceId:src.dataset.linkableId, sourceEl:src };
      e.dataTransfer.effectAllowed = 'link';
      e.dataTransfer.setData('text/plain', `${src.dataset.linkableType}:${src.dataset.linkableId}`);
      src.classList.add('ux-drag-source');
      document.querySelectorAll('[data-link-target-type]').forEach(t => t.classList.add('ux-link-target-candidate'));
    });
    document.addEventListener('dragend', () => this._cleanupDragState());
    document.addEventListener('dragover', (e) => {
      const t = e.target.closest('[data-link-target-type]');
      if (!t || !this._dragState.active) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'link'; t.classList.add('ux-link-target-hover');
    });
    document.addEventListener('dragleave', (e) => { e.target.closest('[data-link-target-type]')?.classList.remove('ux-link-target-hover'); });
    document.addEventListener('drop', (e) => {
      const t = e.target.closest('[data-link-target-type]');
      if (!t || !this._dragState.active) return;
      e.preventDefault();
      const { sourceType, sourceId } = this._dragState;
      this._cleanupDragState();
      this._createLink(sourceType, sourceId, t.dataset.linkTargetType, t.dataset.linkTargetId);
    });
  },

  _cleanupDragState() {
    this._dragState.sourceEl?.classList.remove('ux-drag-source');
    document.querySelectorAll('.ux-link-target-candidate').forEach(el => el.classList.remove('ux-link-target-candidate', 'ux-link-target-hover'));
    this._dragState = { active:false, sourceType:null, sourceId:null, sourceEl:null };
  },

  _createLink(srcType, srcId, tgtType, tgtId) {
    if (!srcType || !srcId || !tgtType || !tgtId || typeof TBO_STORAGE === 'undefined') return;
    try {
      let ok = false;
      if ((srcType === 'task' || srcType === 'deliverable') && tgtType === 'project') { TBO_STORAGE.updateErpEntity(srcType, srcId, { project_id: tgtId }); ok = true; }
      if (srcType === 'deliverable' && tgtType === 'task') { TBO_STORAGE.updateErpEntity(srcType, srcId, { task_id: tgtId }); ok = true; }
      if (srcType === 'task' && tgtType === 'task') { TBO_STORAGE.updateErpEntity(srcType, srcId, { parent_id: tgtId }); ok = true; }
      if (srcType === 'deal' && tgtType === 'project') { TBO_STORAGE.updateCrmDeal(srcId, { project_id: tgtId }); ok = true; }

      if (typeof TBO_TOAST !== 'undefined') {
        if (ok) {
          const sn = (TBO_STORAGE.getErpEntity(srcType, srcId)||{}).name || srcId;
          const tn = (TBO_STORAGE.getErpEntity(tgtType, tgtId)||{}).name || tgtId;
          TBO_TOAST.success('Vinculo criado', `"${sn}" vinculado a "${tn}".`);
        } else {
          TBO_TOAST.warning('Vinculo invalido', `Nao e possivel vincular ${srcType} a ${tgtType}.`);
        }
      }
    } catch (e) {
      console.warn('[UX] link error:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao criar vinculo.');
    }
  },

  // ── SHARED UTILITIES ──────────────────────────────────────────────────
  _escapeHtml(str) {
    if (typeof TBO_TOAST !== 'undefined' && TBO_TOAST._escapeHtml) {
      return TBO_TOAST._escapeHtml(str);
    }
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // ── MASTER INIT ───────────────────────────────────────────────────────
  init() {
    try {
      this.initCommandPalette();
      this.initFocusMode();
      this.initInlineEditing();
      this.initHoverPreviews();
      this.initSmartDatePickers();
      this.initContextMenus();
      this.initDragToLink();
      console.log('[TBO UX Enhancements] Inicializado com sucesso.');
    } catch (e) {
      console.error('[TBO UX Enhancements] Erro na inicializacao:', e);
    }
  }
};


// ── Scoped Styles (IIFE) ─────────────────────────────────────────────────────
(function() {
  if (document.getElementById('uxEnhancementsStyles')) return;
  const s = document.createElement('style');
  s.id = 'uxEnhancementsStyles';
  s.textContent = `
  /* Command Palette */
  .ux-cmd-palette-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:10000; display:flex; align-items:flex-start; justify-content:center; padding-top:12vh; opacity:0; transition:opacity .15s ease; }
  .ux-cmd-palette-overlay.visible { opacity:1; }
  .ux-cmd-palette-modal { width:600px; max-width:90vw; max-height:65vh; background:var(--bg-card,#fff); border:1px solid var(--border-subtle,#e0e0e0); border-radius:14px; box-shadow:0 24px 80px rgba(0,0,0,.25); overflow:hidden; display:flex; flex-direction:column; transform:translateY(-10px) scale(.98); transition:transform .15s ease; }
  .ux-cmd-palette-overlay.visible .ux-cmd-palette-modal { transform:translateY(0) scale(1); }
  .ux-cmd-palette-input-wrap { display:flex; align-items:center; padding:14px 18px; border-bottom:1px solid var(--border-subtle,#e0e0e0); gap:10px; }
  .ux-cmd-palette-search-icon { width:18px; height:18px; color:var(--text-tertiary,#999); flex-shrink:0; }
  .ux-cmd-palette-input { flex:1; border:none; outline:none; background:transparent; font-size:1rem; color:var(--text-primary,#1a1a1a); font-family:inherit; }
  .ux-cmd-palette-input::placeholder { color:var(--text-tertiary,#999); }
  .ux-cmd-palette-esc { font-size:.7rem; padding:2px 6px; border-radius:4px; background:var(--bg-main,#f5f5f5); color:var(--text-tertiary,#999); border:1px solid var(--border-subtle,#ddd); flex-shrink:0; }
  .ux-cmd-palette-filters { display:flex; gap:6px; padding:10px 18px; border-bottom:1px solid var(--border-subtle,#e0e0e0); overflow-x:auto; flex-shrink:0; }
  .ux-cmd-filter-chip { padding:4px 12px; border-radius:20px; font-size:.75rem; font-weight:500; border:1px solid var(--border-subtle,#ddd); background:transparent; color:var(--text-secondary,#666); cursor:pointer; white-space:nowrap; transition:all .15s ease; }
  .ux-cmd-filter-chip:hover { background:var(--bg-hover,#f0f0f0); }
  .ux-cmd-filter-chip.active { background:var(--accent,#E85102); color:#fff; border-color:var(--accent,#E85102); }
  .ux-cmd-palette-results { overflow-y:auto; padding:8px; flex:1; }
  .ux-cmd-palette-section-label { font-size:.68rem; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text-tertiary,#999); padding:8px 10px 4px; }
  .ux-cmd-palette-item { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:8px; cursor:pointer; transition:background .1s ease; gap:12px; }
  .ux-cmd-palette-item:hover, .ux-cmd-palette-item.selected { background:var(--bg-hover,#f0f0f0); }
  .ux-cmd-palette-item-left { display:flex; align-items:center; gap:10px; min-width:0; flex:1; }
  .ux-cmd-palette-item-icon { width:16px; height:16px; color:var(--text-tertiary,#999); flex-shrink:0; }
  .ux-cmd-palette-item-text { display:flex; flex-direction:column; min-width:0; }
  .ux-cmd-palette-item-title { font-size:.88rem; font-weight:500; color:var(--text-primary,#1a1a1a); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ux-cmd-palette-item-sub { font-size:.75rem; color:var(--text-tertiary,#999); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ux-cmd-palette-item-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .ux-cmd-palette-item-cat { font-size:.68rem; color:var(--text-tertiary,#999); }
  .ux-cmd-palette-item-key { font-size:.65rem; padding:2px 6px; border-radius:4px; background:var(--bg-main,#f5f5f5); color:var(--text-tertiary,#999); border:1px solid var(--border-subtle,#ddd); }
  .ux-cmd-palette-hint { padding:20px; text-align:center; color:var(--text-tertiary,#999); font-size:.82rem; }
  .ux-cmd-palette-hint-keys { display:flex; justify-content:center; gap:16px; margin-top:12px; font-size:.75rem; }
  .ux-cmd-palette-hint-keys kbd { font-size:.7rem; padding:1px 5px; border-radius:3px; background:var(--bg-main,#f5f5f5); border:1px solid var(--border-subtle,#ddd); margin-right:4px; }
  .ux-cmd-palette-empty { padding:32px 20px; text-align:center; color:var(--text-tertiary,#999); font-size:.88rem; }
  /* Focus Mode */
  body.focus-mode .sidebar { transform:translateX(-100%); opacity:0; pointer-events:none; }
  body.focus-mode .app-header { transform:translateY(-100%); opacity:0; pointer-events:none; }
  body.focus-mode .app-container { margin-left:0 !important; padding-top:0 !important; }
  body.focus-mode .main-content { padding-top:24px; }
  .sidebar { transition:transform .35s cubic-bezier(.4,0,.2,1), opacity .25s ease; }
  .app-header { transition:transform .3s cubic-bezier(.4,0,.2,1), opacity .2s ease; }
  .ux-focus-exit-btn { position:fixed; top:16px; right:16px; z-index:9999; display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:24px; border:1px solid var(--border-subtle,#ddd); background:var(--bg-card,#fff); color:var(--text-secondary,#666); font-size:.78rem; font-weight:500; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,.12); transition:all .2s ease; font-family:inherit; }
  .ux-focus-exit-btn:hover { background:var(--accent,#E85102); color:#fff; border-color:var(--accent,#E85102); }
  /* Inline Editing */
  [data-inline-edit] { cursor:pointer; border-bottom:1px dashed transparent; transition:border-color .15s ease; }
  [data-inline-edit]:hover { border-bottom-color:var(--accent,#E85102); }
  .ux-inline-editing { border-bottom-color:transparent !important; }
  .ux-inline-input { border:1px solid var(--accent,#E85102); border-radius:4px; padding:2px 6px; font-size:inherit; font-family:inherit; color:var(--text-primary,#1a1a1a); background:var(--bg-card,#fff); outline:none; box-shadow:0 0 0 2px rgba(232,81,2,.15); }
  .ux-inline-select { padding:2px 4px; }
  .ux-inline-spinner { display:inline-block; width:14px; height:14px; border:2px solid var(--border-subtle,#ddd); border-top-color:var(--accent,#E85102); border-radius:50%; animation:uxSpinnerSpin .6s linear infinite; }
  @keyframes uxSpinnerSpin { to { transform:rotate(360deg); } }
  .ux-inline-success { display:inline-block; margin-left:6px; color:#22c55e; font-weight:700; font-size:.9em; animation:uxInlineSuccessFade 1.5s ease forwards; }
  @keyframes uxInlineSuccessFade { 0%{opacity:1;transform:scale(1.2)} 70%{opacity:1} 100%{opacity:0;transform:scale(1)} }
  /* Toast Undo */
  .ux-toast-undo { position:relative; overflow:hidden; }
  .ux-toast-undo-btn { border:1px solid rgba(255,255,255,.3); background:rgba(255,255,255,.15); color:inherit; padding:4px 12px; border-radius:6px; font-size:.78rem; font-weight:600; cursor:pointer; white-space:nowrap; transition:background .15s ease; font-family:inherit; margin-left:8px; flex-shrink:0; }
  .ux-toast-undo-btn:hover { background:rgba(255,255,255,.3); }
  .ux-toast-countdown { position:absolute; bottom:0; left:0; right:0; height:3px; background:rgba(0,0,0,.1); }
  .ux-toast-countdown-bar { width:100%; height:100%; background:rgba(255,255,255,.5); transition:width linear; }
  /* Hover Previews */
  .ux-peek-card { position:fixed; z-index:9998; width:280px; background:var(--bg-card,#fff); border:1px solid var(--border-subtle,#e0e0e0); border-radius:10px; box-shadow:0 12px 40px rgba(0,0,0,.15); opacity:0; transform:translateY(4px); transition:opacity .15s ease, transform .15s ease; pointer-events:auto; }
  .ux-peek-card.visible { opacity:1; transform:translateY(0); }
  .ux-peek-header { padding:12px 14px 8px; font-size:.88rem; font-weight:700; color:var(--text-primary,#1a1a1a); border-bottom:1px solid var(--border-subtle,#e0e0e0); }
  .ux-peek-body { padding:10px 14px 14px; }
  .ux-peek-field { font-size:.78rem; color:var(--text-secondary,#666); padding:3px 0; line-height:1.4; }
  .ux-peek-field strong { color:var(--text-primary,#1a1a1a); font-weight:600; }
  .ux-peek-badge { display:inline-block; padding:1px 8px; border-radius:10px; font-size:.7rem; font-weight:600; background:var(--bg-hover,#f0f0f0); color:var(--text-secondary,#555); }
  /* Smart Date Picker */
  .ux-smart-date-preview { position:absolute; bottom:-22px; left:0; font-size:.72rem; padding:2px 8px; border-radius:4px; white-space:nowrap; z-index:10; transition:opacity .15s ease; }
  .ux-smart-date-valid { color:#22c55e; background:rgba(34,197,94,.08); }
  .ux-smart-date-invalid { color:#ef4444; background:rgba(239,68,68,.08); }
  .smart-date-input { position:relative; }
  /* Context Menus */
  .ux-context-menu { position:fixed; z-index:10001; min-width:180px; background:var(--bg-card,#fff); border:1px solid var(--border-subtle,#e0e0e0); border-radius:10px; box-shadow:0 12px 40px rgba(0,0,0,.18); padding:6px; opacity:0; transform:scale(.95); transition:opacity .12s ease, transform .12s ease; }
  .ux-context-menu.visible { opacity:1; transform:scale(1); }
  .ux-context-menu-item { display:flex; align-items:center; gap:10px; width:100%; padding:8px 12px; border:none; background:transparent; color:var(--text-primary,#1a1a1a); font-size:.82rem; font-family:inherit; cursor:pointer; border-radius:6px; transition:background .1s ease; text-align:left; }
  .ux-context-menu-item:hover { background:var(--bg-hover,#f0f0f0); }
  .ux-context-menu-danger { color:#ef4444; }
  .ux-context-menu-danger:hover { background:rgba(239,68,68,.08); }
  .ux-context-menu-icon { width:15px; height:15px; flex-shrink:0; }
  .ux-context-menu-separator { height:1px; background:var(--border-subtle,#e0e0e0); margin:4px 8px; }
  /* Drag-to-Link */
  [data-linkable-type] { cursor:grab; }
  [data-linkable-type]:active { cursor:grabbing; }
  .ux-drag-source { opacity:.5; outline:2px dashed var(--accent,#E85102); outline-offset:2px; }
  .ux-link-target-candidate { outline:2px dashed #3b82f6; outline-offset:2px; transition:outline-color .15s ease, background .15s ease; }
  .ux-link-target-hover { outline-color:#22c55e; background:rgba(34,197,94,.06) !important; outline-style:solid; }
  /* Dark Mode */
  body.dark-mode .ux-cmd-palette-overlay { background:rgba(0,0,0,.7); }
  body.dark-mode .ux-cmd-palette-modal { background:var(--bg-card,#1e1e1e); border-color:var(--border-subtle,#333); }
  body.dark-mode .ux-cmd-palette-input { color:var(--text-primary,#e0e0e0); }
  body.dark-mode .ux-cmd-palette-item:hover, body.dark-mode .ux-cmd-palette-item.selected { background:var(--bg-hover,#2a2a2a); }
  body.dark-mode .ux-peek-card { background:var(--bg-card,#1e1e1e); border-color:var(--border-subtle,#333); }
  body.dark-mode .ux-context-menu { background:var(--bg-card,#1e1e1e); border-color:var(--border-subtle,#333); }
  body.dark-mode .ux-context-menu-item:hover { background:var(--bg-hover,#2a2a2a); }
  body.dark-mode .ux-inline-input { background:var(--bg-card,#1e1e1e); color:var(--text-primary,#e0e0e0); border-color:var(--accent,#E85102); }
  body.dark-mode .ux-focus-exit-btn { background:var(--bg-card,#1e1e1e); border-color:var(--border-subtle,#444); color:var(--text-secondary,#aaa); }
  body.dark-mode .ux-focus-exit-btn:hover { background:var(--accent,#E85102); color:#fff; }
  /* Responsive */
  @media(max-width:768px) {
    .ux-cmd-palette-modal { width:95vw; max-height:70vh; border-radius:12px; }
    .ux-cmd-palette-overlay { padding-top:5vh; }
    .ux-peek-card { width:260px; }
    .ux-context-menu { min-width:160px; }
    .ux-focus-exit-btn { top:8px; right:8px; padding:6px 12px; font-size:.72rem; }
  }
  `;
  document.head.appendChild(s);
})();
