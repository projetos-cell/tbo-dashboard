// ============================================================================
// TBO OS — UI Components Globais
// Drag-and-drop upload, skeleton loading, resize de colunas, color picker,
// auto-refresh, count-up animation, parallax
// ============================================================================

const TBO_UI = {

  // ══════════════════════════════════════════════════════════════════════
  // DRAG-AND-DROP UPLOAD
  // ══════════════════════════════════════════════════════════════════════
  createDropZone(containerId, options = {}) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return null;

    const {
      accept = '*',
      maxSize = 10 * 1024 * 1024, // 10MB
      multiple = false,
      onFiles = () => {},
      label = 'Arraste arquivos aqui ou clique para selecionar',
      icon = 'upload-cloud'
    } = options;

    container.innerHTML = `
      <div class="tbo-dropzone" tabindex="0" role="button" aria-label="${label}">
        <input type="file" class="tbo-dropzone-input" ${accept !== '*' ? `accept="${accept}"` : ''} ${multiple ? 'multiple' : ''} style="display:none;">
        <div class="tbo-dropzone-content">
          <i data-lucide="${icon}" style="width:40px;height:40px;color:var(--brand-orange);margin-bottom:8px;"></i>
          <p class="tbo-dropzone-label">${label}</p>
          <p class="tbo-dropzone-hint">Tamanho maximo: ${Math.round(maxSize / 1024 / 1024)}MB</p>
        </div>
        <div class="tbo-dropzone-active" style="display:none;">
          <i data-lucide="download" style="width:48px;height:48px;color:var(--brand-orange);"></i>
          <p>Solte o arquivo aqui</p>
        </div>
        <div class="tbo-dropzone-progress" style="display:none;">
          <div class="tbo-dropzone-progress-bar"><div class="tbo-dropzone-progress-fill"></div></div>
          <p class="tbo-dropzone-progress-text">Enviando...</p>
        </div>
      </div>
    `;

    const zone = container.querySelector('.tbo-dropzone');
    const input = container.querySelector('.tbo-dropzone-input');
    const content = container.querySelector('.tbo-dropzone-content');
    const active = container.querySelector('.tbo-dropzone-active');

    // Click para abrir file dialog
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') input.click(); });

    // File input change
    input.addEventListener('change', () => {
      if (input.files.length > 0) {
        const validFiles = this._validateFiles(Array.from(input.files), maxSize);
        if (validFiles.length > 0) onFiles(validFiles);
      }
    });

    // Drag events
    let dragCounter = 0;
    zone.addEventListener('dragenter', (e) => { e.preventDefault(); dragCounter++; content.style.display = 'none'; active.style.display = 'flex'; zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', (e) => { e.preventDefault(); dragCounter--; if (dragCounter <= 0) { dragCounter = 0; content.style.display = 'flex'; active.style.display = 'none'; zone.classList.remove('dragover'); } });
    zone.addEventListener('dragover', (e) => e.preventDefault());
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      content.style.display = 'flex';
      active.style.display = 'none';
      zone.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files);
      const validFiles = this._validateFiles(files, maxSize);
      if (validFiles.length > 0) onFiles(validFiles);
    });

    if (window.lucide) lucide.createIcons();
    return { zone, input, setProgress: (pct, text) => this._setDropzoneProgress(container, pct, text) };
  },

  _validateFiles(files, maxSize) {
    const valid = [];
    files.forEach(f => {
      if (f.size > maxSize) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Arquivo grande', `"${f.name}" excede o limite de ${Math.round(maxSize/1024/1024)}MB.`);
      } else {
        valid.push(f);
      }
    });
    return valid;
  },

  _setDropzoneProgress(container, pct, text) {
    const content = container.querySelector('.tbo-dropzone-content');
    const progress = container.querySelector('.tbo-dropzone-progress');
    const fill = container.querySelector('.tbo-dropzone-progress-fill');
    const pText = container.querySelector('.tbo-dropzone-progress-text');
    if (pct < 0) { content.style.display = 'flex'; progress.style.display = 'none'; return; }
    content.style.display = 'none';
    progress.style.display = 'flex';
    if (fill) fill.style.width = pct + '%';
    if (pText) pText.textContent = text || `${pct}%`;
  },

  // ══════════════════════════════════════════════════════════════════════
  // SKELETON LOADING POR MODULO
  // ══════════════════════════════════════════════════════════════════════
  _skeletonTemplates: {
    'dashboard': `
      <div class="skel-greeting skel-shimmer" style="height:60px;border-radius:8px;margin-bottom:16px;"></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
        ${Array(4).fill('<div class="skel-kpi skel-shimmer" style="height:90px;border-radius:8px;"></div>').join('')}
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
        <div class="skel-shimmer" style="height:300px;border-radius:8px;"></div>
        <div class="skel-shimmer" style="height:300px;border-radius:8px;"></div>
      </div>
    `,
    'pipeline': `
      <div class="skel-shimmer" style="height:40px;border-radius:8px;margin-bottom:16px;"></div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;">
        ${Array(5).fill(`<div><div class="skel-shimmer" style="height:30px;border-radius:6px;margin-bottom:8px;"></div>${Array(3).fill('<div class="skel-shimmer" style="height:80px;border-radius:6px;margin-bottom:8px;"></div>').join('')}</div>`).join('')}
      </div>
    `,
    'projetos': `
      <div class="skel-shimmer" style="height:44px;border-radius:8px;margin-bottom:16px;"></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
        ${Array(6).fill('<div class="skel-shimmer" style="height:140px;border-radius:8px;"></div>').join('')}
      </div>
    `,
    'default': `
      <div class="skel-shimmer" style="height:44px;border-radius:8px;margin-bottom:16px;"></div>
      <div class="skel-shimmer" style="height:24px;width:200px;border-radius:4px;margin-bottom:16px;"></div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${Array(6).fill('<div class="skel-shimmer" style="height:48px;border-radius:6px;"></div>').join('')}
      </div>
    `
  },

  showSkeleton(container, moduleId) {
    if (!container) return;
    const template = this._skeletonTemplates[moduleId] || this._skeletonTemplates['default'];
    container.innerHTML = `<div class="tbo-skeleton-wrap" style="padding:24px;">${template}</div>`;
  },

  // ══════════════════════════════════════════════════════════════════════
  // RESIZE DE COLUNAS EM TABELAS
  // ══════════════════════════════════════════════════════════════════════
  enableColumnResize(tableEl) {
    if (!tableEl) return;
    const thead = tableEl.querySelector('thead');
    if (!thead) return;

    const ths = thead.querySelectorAll('th');
    const tableId = tableEl.id || 'table_' + Math.random().toString(36).slice(2, 8);

    // Restaurar larguras salvas
    const saved = localStorage.getItem('tbo_col_widths_' + tableId);
    if (saved) {
      try {
        const widths = JSON.parse(saved);
        ths.forEach((th, i) => { if (widths[i]) th.style.width = widths[i] + 'px'; });
      } catch {}
    }

    ths.forEach((th, idx) => {
      if (idx === ths.length - 1) return; // Ultima coluna nao precisa de handle

      const handle = document.createElement('div');
      handle.className = 'tbo-col-resize-handle';
      handle.style.cssText = 'position:absolute;top:0;right:-2px;bottom:0;width:5px;cursor:col-resize;z-index:5;';
      th.style.position = 'relative';
      th.appendChild(handle);

      let startX, startWidth;

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = th.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const ghost = document.createElement('div');
        ghost.className = 'tbo-col-ghost';
        ghost.style.cssText = `position:fixed;top:${tableEl.getBoundingClientRect().top}px;height:${tableEl.offsetHeight}px;width:1px;background:var(--brand-orange);opacity:0.5;z-index:999;`;
        document.body.appendChild(ghost);

        const onMove = (ev) => {
          const diff = ev.clientX - startX;
          const newWidth = Math.max(40, startWidth + diff);
          th.style.width = newWidth + 'px';
          ghost.style.left = ev.clientX + 'px';
        };

        const onUp = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          ghost.remove();

          // Salvar larguras
          const widths = Array.from(ths).map(t => t.offsetWidth);
          localStorage.setItem('tbo_col_widths_' + tableId, JSON.stringify(widths));
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  // COLOR PICKER PARA TAGS/CATEGORIAS
  // ══════════════════════════════════════════════════════════════════════
  _colorPalette: [
    '#E85102', '#FD8241', '#e74c3c', '#c0392b',
    '#2ecc71', '#27ae60', '#3498db', '#2980b9',
    '#9b59b6', '#8e44ad', '#f39c12', '#e67e22',
    '#1abc9c', '#16a085', '#34495e', '#2c3e50',
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'
  ],

  createColorPicker(containerId, options = {}) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return null;

    const { value = '#E85102', onChange = () => {}, showCustom = true } = options;

    let selectedColor = value;

    const render = () => {
      container.innerHTML = `
        <div class="tbo-color-picker">
          <div class="tbo-color-palette" style="display:flex;flex-wrap:wrap;gap:6px;">
            ${this._colorPalette.map(c => `
              <button class="tbo-color-swatch${c === selectedColor ? ' active' : ''}" data-color="${c}"
                style="width:28px;height:28px;border-radius:6px;border:2px solid ${c === selectedColor ? 'var(--brand-orange)' : 'transparent'};background:${c};cursor:pointer;transition:all 150ms;"
                title="${c}"></button>
            `).join('')}
          </div>
          ${showCustom ? `
            <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
              <input type="color" class="tbo-color-custom" value="${selectedColor}" style="width:32px;height:32px;border:none;border-radius:4px;cursor:pointer;padding:0;">
              <span style="font-size:0.75rem;color:var(--text-muted);">Custom</span>
              <div class="tbo-color-preview" style="flex:1;height:28px;border-radius:4px;background:${selectedColor};border:1px solid var(--border-default);"></div>
            </div>
          ` : ''}
        </div>
      `;

      // Bind swatches
      container.querySelectorAll('.tbo-color-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedColor = btn.dataset.color;
          onChange(selectedColor);
          render();
        });
      });

      // Bind custom input
      const custom = container.querySelector('.tbo-color-custom');
      if (custom) {
        custom.addEventListener('input', (e) => {
          selectedColor = e.target.value;
          onChange(selectedColor);
          const preview = container.querySelector('.tbo-color-preview');
          if (preview) preview.style.background = selectedColor;
        });
      }
    };

    render();
    return { getColor: () => selectedColor, setColor: (c) => { selectedColor = c; render(); } };
  },

  // ══════════════════════════════════════════════════════════════════════
  // AUTO-REFRESH INTELIGENTE (polling)
  // ══════════════════════════════════════════════════════════════════════
  _autoRefreshInterval: null,
  _autoRefreshHash: null,

  startAutoRefresh(intervalMs = 60000) {
    if (this._autoRefreshInterval) clearInterval(this._autoRefreshInterval);

    // Hash inicial dos dados criticos
    this._autoRefreshHash = this._computeDataHash();

    this._autoRefreshInterval = setInterval(async () => {
      try {
        // Recarregar dados silenciosamente
        if (typeof TBO_STORAGE !== 'undefined') {
          await TBO_STORAGE.loadAll();
        }
        const newHash = this._computeDataHash();
        if (newHash !== this._autoRefreshHash) {
          this._autoRefreshHash = newHash;
          // Mostrar toast com botao de refresh
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.info('Novos dados', 'Informacoes atualizadas disponiveis.', 8000, {
              label: 'Atualizar',
              callback: () => {
                const current = TBO_ROUTER.getCurrent();
                if (current) { TBO_ROUTER._currentModule = null; TBO_ROUTER.navigate(current); }
              }
            });
          }
        }
      } catch (e) {
        console.warn('[TBO UI] Auto-refresh error:', e);
      }
    }, intervalMs);
  },

  stopAutoRefresh() {
    if (this._autoRefreshInterval) { clearInterval(this._autoRefreshInterval); this._autoRefreshInterval = null; }
  },

  _computeDataHash() {
    try {
      const deals = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.getAllErpEntities('project') : [];
      const tasks = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.getAllErpEntities('task') : [];
      return `${deals.length}|${tasks.length}|${deals.map(d => d.status).join('')}`;
    } catch { return ''; }
  },

  // ══════════════════════════════════════════════════════════════════════
  // ANIMACAO COUNT-UP NOS KPIs
  // ══════════════════════════════════════════════════════════════════════
  countUp(element, endValue, options = {}) {
    const { duration = 800, prefix = '', suffix = '', decimals = 0 } = options;
    if (!element) return;

    const startValue = 0;
    const startTime = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = startValue + (endValue - startValue) * easedProgress;

      element.textContent = prefix + currentValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + suffix;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  // Auto-detect e animar todos os KPIs com data-countup
  initCountUpAll() {
    document.querySelectorAll('[data-countup]').forEach(el => {
      const val = parseFloat(el.dataset.countup);
      if (isNaN(val)) return;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals) || 0;
      this.countUp(el, val, { prefix, suffix, decimals });
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  // PARALLAX SUTIL NO DASHBOARD
  // ══════════════════════════════════════════════════════════════════════
  initParallax(scrollContainer) {
    const container = typeof scrollContainer === 'string' ? document.getElementById(scrollContainer) : scrollContainer;
    if (!container) return;

    const parallaxElements = container.querySelectorAll('[data-parallax]');
    if (parallaxElements.length === 0) return;

    container.addEventListener('scroll', () => {
      const scrollY = container.scrollTop;
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.05;
        const offset = scrollY * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    }, { passive: true });
  },

  // ══════════════════════════════════════════════════════════════════════
  // INIT — chamado no boot do app
  // ══════════════════════════════════════════════════════════════════════
  init() {
    // Auto-refresh a cada 60 segundos
    this.startAutoRefresh(60000);

    // Parallax no main content
    this.initParallax(document.querySelector('.main-content'));

    console.log('[TBO UI] UI Components initialized');
  }
};
