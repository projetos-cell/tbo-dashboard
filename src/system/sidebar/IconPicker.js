/**
 * TBO OS — Icon Picker Popover
 *
 * Popover para selecionar ícone de workspace.
 * Tabs: Ícones (Lucide) | Emoji | Upload | Remover.
 * Busca, recentes por usuário, grid responsiva.
 *
 * API:
 *   TBO_ICON_PICKER.open(triggerEl, { currentIcon, iconType, onSelect, onRemove })
 *   TBO_ICON_PICKER.close()
 *   TBO_ICON_PICKER.isOpen
 */

const TBO_ICON_PICKER = (() => {
  'use strict';

  // ── Estado ──────────────────────────────────────────────────────────────
  let _popover = null;
  let _backdrop = null;
  let _isOpen = false;
  let _activeTab = 'icons';
  let _searchTerm = '';
  let _currentIcon = null;
  let _currentIconType = 'lucide';
  let _onSelectCb = null;
  let _onRemoveCb = null;
  let _recentIcons = [];

  // ── Ícones Lucide populares (curadoria para workspaces) ─────────────────
  const LUCIDE_ICONS = {
    'Geral': [
      'folder', 'folder-open', 'globe', 'home', 'building', 'building-2',
      'briefcase', 'layout-dashboard', 'layers', 'box', 'package',
      'archive', 'bookmark', 'flag', 'star', 'heart', 'shield',
      'lock', 'key', 'settings', 'sliders-horizontal', 'wrench'
    ],
    'Pessoas': [
      'users', 'user', 'user-plus', 'user-check', 'user-cog',
      'handshake', 'smile', 'message-circle', 'messages-square',
      'at-sign', 'mail', 'phone', 'video'
    ],
    'Trabalho': [
      'check-square', 'list-todo', 'list-checks', 'clipboard',
      'clipboard-list', 'kanban-square', 'calendar', 'calendar-days',
      'clock', 'timer', 'alarm-clock', 'target', 'trophy',
      'medal', 'award', 'trending-up', 'bar-chart-3', 'pie-chart'
    ],
    'Conteúdo': [
      'file-text', 'file-code', 'file-image', 'files', 'notebook',
      'notebook-pen', 'book', 'book-open', 'library', 'graduation-cap',
      'newspaper', 'pen-tool', 'pencil', 'type', 'heading'
    ],
    'Tech': [
      'code', 'terminal', 'database', 'server', 'cloud',
      'cpu', 'hard-drive', 'monitor', 'smartphone', 'tablet',
      'wifi', 'globe-2', 'link', 'share-2', 'git-branch'
    ],
    'Criativo': [
      'palette', 'paintbrush', 'image', 'camera', 'film',
      'music', 'headphones', 'mic', 'lightbulb', 'sparkles',
      'wand-2', 'compass', 'map', 'navigation', 'rocket'
    ],
    'Finanças': [
      'dollar-sign', 'credit-card', 'wallet', 'banknote',
      'coins', 'receipt', 'calculator', 'percent',
      'shopping-cart', 'shopping-bag', 'store', 'tag'
    ],
    'Natureza': [
      'sun', 'moon', 'cloud-sun', 'umbrella', 'flower-2',
      'leaf', 'trees', 'mountain', 'waves', 'flame',
      'snowflake', 'zap', 'rainbow'
    ]
  };

  // ── Emojis comuns (curadoria organizada por categoria) ──────────────────
  const EMOJI_DATA = {
    'Carinhas': [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘',
      '😎', '🤓', '🧐', '🤔', '🤗', '🤫', '😶', '😏'
    ],
    'Mãos & Gestos': [
      '👋', '🤚', '✋', '🖖', '👌', '🤌', '✌️', '🤞',
      '🤟', '🤘', '👍', '👎', '👊', '🤛', '🤜', '👏',
      '🙌', '🤝', '🙏', '💪', '🫶', '☝️', '👆', '👇'
    ],
    'Objetos': [
      '⭐', '🌟', '✨', '💫', '🔥', '💡', '🎯', '🏆',
      '🥇', '🎨', '🎭', '🎪', '🎲', '🎮', '🎵', '🎬',
      '📱', '💻', '🖥️', '📊', '📈', '📉', '📋', '📝'
    ],
    'Natureza': [
      '🌈', '☀️', '🌙', '⚡', '🌊', '🔮', '🌸', '🌺',
      '🌻', '🌵', '🌲', '🍀', '🍃', '🌍', '🏔️', '🌋'
    ],
    'Comida': [
      '☕', '🍕', '🍔', '🌮', '🍣', '🍰', '🧁', '🍪',
      '🍩', '🍫', '🍿', '🧃', '🥤', '🍷', '🍺', '🥂'
    ],
    'Animais': [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄',
      '🐝', '🦋', '🐢', '🐬', '🦈', '🐙', '🦅', '🐉'
    ],
    'Símbolos': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '💯', '💢', '💥', '💦', '💨', '🕳️', '❗', '❓',
      '⚠️', '🔴', '🟢', '🔵', '🟡', '🟣', '⚫', '⚪'
    ]
  };

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function _getAllLucideIcons() {
    const all = [];
    Object.values(LUCIDE_ICONS).forEach(icons => all.push(...icons));
    return [...new Set(all)]; // Dedupe
  }

  function _filterLucideIcons(query) {
    if (!query) return LUCIDE_ICONS;
    const q = query.toLowerCase();
    const filtered = {};
    Object.entries(LUCIDE_ICONS).forEach(([cat, icons]) => {
      const matches = icons.filter(icon => icon.includes(q));
      if (matches.length > 0) filtered[cat] = matches;
    });
    return filtered;
  }

  function _filterEmojis(query) {
    if (!query) return EMOJI_DATA;
    const q = query.toLowerCase();
    const filtered = {};
    Object.entries(EMOJI_DATA).forEach(([cat, emojis]) => {
      // Filtra pela categoria (match parcial)
      if (cat.toLowerCase().includes(q)) {
        filtered[cat] = emojis;
      }
    });
    // Se não achou por categoria, retorna tudo (emoji search não é trivial sem dados extras)
    if (Object.keys(filtered).length === 0 && q.length <= 2) return EMOJI_DATA;
    return filtered;
  }

  // ── Carregar recentes ───────────────────────────────────────────────────

  async function _loadRecents() {
    if (typeof SpaceRepo !== 'undefined') {
      try {
        _recentIcons = await SpaceRepo.getRecentIcons(16);
      } catch (_e) {
        _recentIcons = [];
      }
    }
  }

  async function _saveRecent(iconType, iconValue) {
    if (typeof SpaceRepo !== 'undefined') {
      try {
        await SpaceRepo.addRecentIcon(iconType, iconValue);
      } catch (_e) { /* silencioso */ }
    }
  }

  // ── Build HTML ──────────────────────────────────────────────────────────

  function _buildPopoverHTML() {
    return `
      <nav class="ipk-tabs" role="tablist">
        <button class="ipk-tab${_activeTab === 'icons' ? ' ipk-tab--active' : ''}" data-ipk-tab="icons" role="tab">
          <i data-lucide="grid-3x3"></i> Ícones
        </button>
        <button class="ipk-tab${_activeTab === 'emoji' ? ' ipk-tab--active' : ''}" data-ipk-tab="emoji" role="tab">
          <i data-lucide="smile"></i> Emoji
        </button>
        <button class="ipk-tab${_activeTab === 'upload' ? ' ipk-tab--active' : ''}" data-ipk-tab="upload" role="tab">
          <i data-lucide="upload"></i> Upload
        </button>
      </nav>
      <div class="ipk-search-wrap">
        <input type="text" class="ipk-search"
          placeholder="${_activeTab === 'emoji' ? 'Buscar categoria...' : 'Buscar ícone...'}"
          data-ipk-search value="${_esc(_searchTerm)}" autocomplete="off" spellcheck="false" />
      </div>
      <div class="ipk-body" data-ipk-body>
        ${_renderTabContent()}
      </div>
      ${_currentIcon ? `
        <div class="ipk-remove-section">
          <button class="ipk-remove-btn" data-ipk-remove>
            <i data-lucide="x-circle"></i>
            Remover ícone
          </button>
        </div>
      ` : ''}
    `;
  }

  function _renderTabContent() {
    switch (_activeTab) {
    case 'icons':   return _renderIconsTab();
    case 'emoji':   return _renderEmojiTab();
    case 'upload':  return _renderUploadTab();
    default:        return '';
    }
  }

  // ── Tab Ícones (Lucide) ─────────────────────────────────────────────────

  function _renderIconsTab() {
    let html = '';

    // Recentes (apenas Lucide)
    const lucideRecents = _recentIcons.filter(r => r.icon_type === 'lucide');
    if (lucideRecents.length > 0 && !_searchTerm) {
      html += '<div class="ipk-section-label">Recentes</div>';
      html += '<div class="ipk-grid">';
      lucideRecents.forEach(r => {
        const selected = _currentIconType === 'lucide' && _currentIcon === r.icon_value;
        html += `<button class="ipk-icon-btn${selected ? ' ipk-icon-btn--selected' : ''}"
          data-ipk-select="lucide:${_esc(r.icon_value)}" title="${_esc(r.icon_value)}">
          <i data-lucide="${_esc(r.icon_value)}"></i>
        </button>`;
      });
      html += '</div>';
    }

    // Categorias filtradas
    const filtered = _filterLucideIcons(_searchTerm);
    const categories = Object.entries(filtered);

    if (categories.length === 0) {
      html += '<div class="ipk-empty">Nenhum ícone encontrado</div>';
      return html;
    }

    categories.forEach(([cat, icons]) => {
      html += `<div class="ipk-section-label">${_esc(cat)}</div>`;
      html += '<div class="ipk-grid">';
      icons.forEach(icon => {
        const selected = _currentIconType === 'lucide' && _currentIcon === icon;
        html += `<button class="ipk-icon-btn${selected ? ' ipk-icon-btn--selected' : ''}"
          data-ipk-select="lucide:${_esc(icon)}" title="${_esc(icon)}">
          <i data-lucide="${_esc(icon)}"></i>
        </button>`;
      });
      html += '</div>';
    });

    return html;
  }

  // ── Tab Emoji ───────────────────────────────────────────────────────────

  function _renderEmojiTab() {
    let html = '';

    // Recentes (apenas emoji)
    const emojiRecents = _recentIcons.filter(r => r.icon_type === 'emoji');
    if (emojiRecents.length > 0 && !_searchTerm) {
      html += '<div class="ipk-section-label">Recentes</div>';
      html += '<div class="ipk-grid ipk-grid--emoji">';
      emojiRecents.forEach(r => {
        const selected = _currentIconType === 'emoji' && _currentIcon === r.icon_value;
        html += `<button class="ipk-icon-btn ipk-icon-btn--emoji${selected ? ' ipk-icon-btn--selected' : ''}"
          data-ipk-select="emoji:${_esc(r.icon_value)}">${r.icon_value}</button>`;
      });
      html += '</div>';
    }

    // Categorias
    const filtered = _filterEmojis(_searchTerm);
    const categories = Object.entries(filtered);

    if (categories.length === 0) {
      html += '<div class="ipk-empty">Nenhum emoji encontrado</div>';
      return html;
    }

    categories.forEach(([cat, emojis]) => {
      html += `<div class="ipk-section-label">${_esc(cat)}</div>`;
      html += '<div class="ipk-grid ipk-grid--emoji">';
      emojis.forEach(emoji => {
        const selected = _currentIconType === 'emoji' && _currentIcon === emoji;
        html += `<button class="ipk-icon-btn ipk-icon-btn--emoji${selected ? ' ipk-icon-btn--selected' : ''}"
          data-ipk-select="emoji:${_esc(emoji)}">${emoji}</button>`;
      });
      html += '</div>';
    });

    return html;
  }

  // ── Tab Upload ──────────────────────────────────────────────────────────

  function _renderUploadTab() {
    return `
      <div class="ipk-upload-zone" data-ipk-upload-zone>
        <i data-lucide="upload-cloud"></i>
        <div class="ipk-upload-text">Clique ou arraste uma imagem</div>
        <div class="ipk-upload-hint">PNG, JPG ou SVG • Máx. 512KB</div>
        <input type="file" class="ipk-upload-input" data-ipk-upload-input
          accept=".png,.jpg,.jpeg,.svg,.webp" />
      </div>
    `;
  }

  // ── Refresh ─────────────────────────────────────────────────────────────

  function _refreshBody() {
    if (!_popover) return;
    const body = _popover.querySelector('[data-ipk-body]');
    if (!body) return;
    body.innerHTML = _renderTabContent();
    if (window.lucide) lucide.createIcons({ root: body });
    _bindBodyEvents();
  }

  function _refreshTabs() {
    if (!_popover) return;
    _popover.querySelectorAll('[data-ipk-tab]').forEach(tab => {
      const isActive = tab.dataset.ipkTab === _activeTab;
      tab.classList.toggle('ipk-tab--active', isActive);
    });
    // Atualizar placeholder do search
    const search = _popover.querySelector('[data-ipk-search]');
    if (search) {
      search.placeholder = _activeTab === 'emoji' ? 'Buscar categoria...' : 'Buscar ícone...';
    }
  }

  // ── Posicionamento ──────────────────────────────────────────────────────

  function _positionPopover(triggerEl) {
    if (!_popover || !triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const popH = _popover.offsetHeight || 420;
    const popW = _popover.offsetWidth || 340;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Padrão: abaixo e à direita
    let top = rect.bottom + 8;
    let left = rect.left;

    // Flip vertical
    if (top + popH > vh - 10) {
      top = rect.top - popH - 8;
    }

    // Ajustar horizontal
    if (left + popW > vw - 10) {
      left = vw - popW - 10;
    }

    top = Math.max(10, top);
    left = Math.max(10, left);

    _popover.style.top = `${top}px`;
    _popover.style.left = `${left}px`;
  }

  // ── Event Handlers ──────────────────────────────────────────────────────

  function _onKeydown(e) {
    if (e.key === 'Escape' && _isOpen) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  }

  function _bindEvents() {
    if (!_popover) return;

    // Tabs
    _popover.querySelectorAll('[data-ipk-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const newTab = tab.dataset.ipkTab;
        if (newTab !== _activeTab) {
          _activeTab = newTab;
          _searchTerm = '';
          _refreshTabs();
          _refreshBody();
          // Limpar e focar search
          const search = _popover.querySelector('[data-ipk-search]');
          if (search) {
            search.value = '';
            search.focus();
          }
        }
      });
    });

    // Search
    const search = _popover.querySelector('[data-ipk-search]');
    if (search) {
      search.addEventListener('input', (e) => {
        _searchTerm = e.target.value.trim();
        _refreshBody();
      });
    }

    // Remover ícone
    const removeBtn = _popover.querySelector('[data-ipk-remove]');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (typeof _onRemoveCb === 'function') _onRemoveCb();
        close();
      });
    }

    // ESC
    document.addEventListener('keydown', _onKeydown);

    // Bind eventos no body
    _bindBodyEvents();
  }

  function _bindBodyEvents() {
    if (!_popover) return;
    const body = _popover.querySelector('[data-ipk-body]');
    if (!body) return;

    // Click em ícone/emoji
    body.querySelectorAll('[data-ipk-select]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.ipkSelect; // formato: "lucide:folder" ou "emoji:🐶"
        const [type, ...rest] = val.split(':');
        const value = rest.join(':'); // Emoji pode conter ':'
        _handleSelect(type, value);
      });
    });

    // Upload zone
    const uploadZone = body.querySelector('[data-ipk-upload-zone]');
    const uploadInput = body.querySelector('[data-ipk-upload-input]');
    if (uploadZone && uploadInput) {
      uploadZone.addEventListener('click', () => uploadInput.click());

      // Drag & drop
      uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--brand-orange)';
      });
      uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = '';
      });
      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '';
        const file = e.dataTransfer?.files?.[0];
        if (file) _handleUpload(file);
      });

      uploadInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) _handleUpload(file);
      });
    }
  }

  // ── Ações ───────────────────────────────────────────────────────────────

  function _handleSelect(type, value) {
    // Salvar nos recentes
    _saveRecent(type, value);

    if (typeof _onSelectCb === 'function') {
      _onSelectCb({
        icon_type: type,
        icon_value: value,
        icon_url: null
      });
    }
    close();
  }

  async function _handleUpload(file) {
    // Validar
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.warning('Formato inválido', 'Use PNG, JPG, SVG ou WebP');
      }
      return;
    }
    if (file.size > 512 * 1024) {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.warning('Arquivo grande', 'O arquivo deve ter no máximo 512KB');
      }
      return;
    }

    // Upload via TBO_FILE_STORAGE ou TBO_STORAGE
    try {
      let uploadUrl = null;

      if (typeof TBO_STORAGE !== 'undefined') {
        const fileName = `ws-icon-${Date.now()}.${file.name.split('.').pop()}`;
        const result = await TBO_STORAGE.upload('workspace-icons', fileName, file);
        uploadUrl = result?.url || result?.publicUrl || null;
      } else {
        // Fallback: converter para data URL
        uploadUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      if (uploadUrl && typeof _onSelectCb === 'function') {
        _onSelectCb({
          icon_type: 'upload',
          icon_value: null,
          icon_url: uploadUrl
        });
      }

      close();

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Ícone atualizado', 'Imagem enviada com sucesso');
      }
    } catch (err) {
      console.error('[IconPicker] Erro ao fazer upload:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', 'Não foi possível enviar a imagem');
      }
    }
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  /**
   * Abre o icon picker posicionado abaixo de um elemento
   * @param {HTMLElement} triggerEl - Elemento que abre o picker
   * @param {Object} opts
   * @param {string} opts.currentIcon - Ícone atual (nome lucide ou emoji)
   * @param {string} opts.iconType - Tipo atual ('lucide', 'emoji', 'upload')
   * @param {Function} opts.onSelect - Callback({ icon_type, icon_value, icon_url })
   * @param {Function} opts.onRemove - Callback ao remover ícone
   */
  async function open(triggerEl, opts = {}) {
    if (_isOpen) close();

    _currentIcon = opts.currentIcon || null;
    _currentIconType = opts.iconType || 'lucide';
    _onSelectCb = opts.onSelect || null;
    _onRemoveCb = opts.onRemove || null;
    _activeTab = _currentIconType === 'emoji' ? 'emoji' : 'icons';
    _searchTerm = '';

    // Carregar recentes
    await _loadRecents();

    // Criar backdrop
    _backdrop = document.createElement('div');
    _backdrop.className = 'ipk-backdrop';
    _backdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });
    document.body.appendChild(_backdrop);

    // Criar popover
    _popover = document.createElement('div');
    _popover.className = 'ipk-popover';
    _popover.setAttribute('role', 'dialog');
    _popover.setAttribute('aria-label', 'Selecionar ícone');
    _popover.innerHTML = _buildPopoverHTML();
    document.body.appendChild(_popover);

    // Ícones Lucide
    if (window.lucide) lucide.createIcons({ root: _popover });

    // Posicionar
    _positionPopover(triggerEl);

    // Animar entrada
    requestAnimationFrame(() => {
      _popover.classList.add('ipk-popover--open');
    });

    _isOpen = true;

    // Bind events
    _bindEvents();

    // Focar no search
    setTimeout(() => {
      const search = _popover?.querySelector('[data-ipk-search]');
      if (search) search.focus();
    }, 50);
  }

  function close() {
    if (!_isOpen) return;

    document.removeEventListener('keydown', _onKeydown);

    if (_popover) {
      _popover.classList.remove('ipk-popover--open');
      setTimeout(() => {
        if (_popover && _popover.parentNode) _popover.remove();
        _popover = null;
      }, 150);
    }

    if (_backdrop) {
      _backdrop.remove();
      _backdrop = null;
    }

    _isOpen = false;
    _onSelectCb = null;
    _onRemoveCb = null;
    _currentIcon = null;
    _searchTerm = '';
    _recentIcons = [];
  }

  return {
    open,
    close,
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_ICON_PICKER = TBO_ICON_PICKER;
}
