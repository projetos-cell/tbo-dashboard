/**
 * TBO OS — Command Palette (Cmd/Ctrl+K)
 *
 * Modal de busca e ações rápidas estilo VS Code / Linear.
 * Integra com TBO_COMMAND_REGISTRY para buscar comandos.
 */

const TBO_COMMAND_PALETTE = (() => {
  let _isOpen = false;
  let _selectedIndex = 0;
  let _results = [];
  let _overlay = null;
  let _input = null;
  let _list = null;
  let _debounceTimer = null;

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function _createDOM() {
    if (_overlay) return;

    _overlay = document.createElement('div');
    _overlay.id = 'commandPaletteOverlay';
    _overlay.className = 'cp-overlay';
    _overlay.innerHTML = `
      <div class="cp-modal" role="dialog" aria-label="Command Palette">
        <div class="cp-header">
          <i data-lucide="search" class="cp-search-icon"></i>
          <input class="cp-input" id="cpInput" type="text"
            placeholder="Buscar comandos, módulos, ações..."
            autocomplete="off" spellcheck="false" />
          <kbd class="cp-kbd">ESC</kbd>
        </div>
        <div class="cp-results" id="cpResults"></div>
        <div class="cp-footer">
          <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navegar</span>
          <span><kbd>Enter</kbd> executar</span>
          <span><kbd>Esc</kbd> fechar</span>
        </div>
      </div>
    `;

    document.body.appendChild(_overlay);

    _input = _overlay.querySelector('#cpInput');
    _list = _overlay.querySelector('#cpResults');

    // Eventos
    _overlay.addEventListener('click', (e) => {
      if (e.target === _overlay) _close();
    });

    _input.addEventListener('input', () => {
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(() => _search(_input.value), 80);
    });

    _input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        _selectedIndex = Math.min(_selectedIndex + 1, _results.length - 1);
        _highlightSelected();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        _selectedIndex = Math.max(_selectedIndex - 1, 0);
        _highlightSelected();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        _executeSelected();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        _close();
      }
    });

    _list.addEventListener('click', (e) => {
      const item = e.target.closest('.cp-item');
      if (item) {
        const idx = parseInt(item.dataset.index, 10);
        if (!isNaN(idx)) {
          _selectedIndex = idx;
          _executeSelected();
        }
      }
    });

    if (window.lucide) lucide.createIcons({ root: _overlay });
  }

  function _search(query) {
    if (typeof TBO_COMMAND_REGISTRY === 'undefined') return;

    _results = TBO_COMMAND_REGISTRY.search(query).slice(0, 15);
    _selectedIndex = 0;
    _render();
  }

  function _render() {
    if (!_list) return;

    if (_results.length === 0) {
      _list.innerHTML = '<div class="cp-empty">Nenhum comando encontrado</div>';
      return;
    }

    let currentCategory = '';
    let html = '';

    _results.forEach((cmd, i) => {
      if (cmd.category && cmd.category !== currentCategory) {
        currentCategory = cmd.category;
        html += `<div class="cp-category">${_escHtml(currentCategory)}</div>`;
      }

      const icon = cmd.icon || 'terminal';
      const isSelected = i === _selectedIndex;
      const shortcutHtml = cmd.shortcut
        ? `<kbd class="cp-shortcut">${_escHtml(cmd.shortcut)}</kbd>`
        : '';

      html += `<div class="cp-item${isSelected ? ' cp-item--selected' : ''}" data-index="${i}" role="option">
        <i data-lucide="${_escHtml(icon)}" class="cp-item-icon"></i>
        <span class="cp-item-label">${_escHtml(cmd.label)}</span>
        ${shortcutHtml}
      </div>`;
    });

    _list.innerHTML = html;
    if (window.lucide) lucide.createIcons({ root: _list });
  }

  function _highlightSelected() {
    if (!_list) return;
    _list.querySelectorAll('.cp-item').forEach((el, i) => {
      el.classList.toggle('cp-item--selected', i === _selectedIndex);
      if (i === _selectedIndex) {
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function _executeSelected() {
    const cmd = _results[_selectedIndex];
    if (!cmd) return;

    _close();

    try {
      cmd.action();
    } catch (err) {
      console.error('[CommandPalette] Erro ao executar comando:', cmd.id, err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', `Falha ao executar: ${cmd.label}`);
      }
    }
  }

  function _open() {
    if (_isOpen) return;
    _createDOM();

    _overlay.classList.add('cp-overlay--visible');
    _isOpen = true;
    _input.value = '';
    _selectedIndex = 0;

    // Mostrar todos os comandos inicialmente
    _search('');

    // Focar com delay para animação
    requestAnimationFrame(() => _input.focus());
  }

  function _close() {
    if (!_isOpen) return;
    _overlay.classList.remove('cp-overlay--visible');
    _isOpen = false;
  }

  // ── Atalho global: Cmd/Ctrl + K ──
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (_isOpen) {
        _close();
      } else {
        _open();
      }
    }
  });

  return {
    open: _open,
    close: _close,
    toggle() { _isOpen ? _close() : _open(); },
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_COMMAND_PALETTE = TBO_COMMAND_PALETTE;
}
