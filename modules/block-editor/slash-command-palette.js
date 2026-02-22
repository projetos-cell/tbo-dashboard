/**
 * TBO OS — Slash Command Palette
 *
 * Palette flutuante acionada ao digitar "/" num bloco.
 * Exibe lista filtravel de tipos de bloco organizados por categoria.
 * TBO_BLOCK_EDITOR chama SlashCommandPalette.open() / .close() / .filter().
 */

const SlashCommandPalette = (() => {
  'use strict';

  let _el = null;
  let _isOpen = false;
  let _onSelect = null;
  let _blockId = null;
  let _filteredItems = [];
  let _selectedIndex = 0;

  // ── Comando → config ───────────────────────────────────────────────────

  const COMMANDS = [
    // Basico
    { type: 'text',           label: 'Texto',               icon: 'type',             category: 'Basico',    keywords: 'texto paragrafo text paragraph' },
    { type: 'heading_1',      label: 'Titulo 1',            icon: 'heading-1',        category: 'Basico',    keywords: 'titulo heading h1' },
    { type: 'heading_2',      label: 'Titulo 2',            icon: 'heading-2',        category: 'Basico',    keywords: 'titulo heading h2' },
    { type: 'heading_3',      label: 'Titulo 3',            icon: 'heading-3',        category: 'Basico',    keywords: 'titulo heading h3' },
    { type: 'quote',          label: 'Citacao',             icon: 'quote',            category: 'Basico',    keywords: 'citacao quote blockquote' },
    { type: 'divider',        label: 'Divisor',             icon: 'minus',            category: 'Basico',    keywords: 'divisor divider linha hr' },

    // Listas
    { type: 'bulleted_list',  label: 'Lista com marcadores', icon: 'list',            category: 'Listas',    keywords: 'lista marcadores bullets unordered' },
    { type: 'numbered_list',  label: 'Lista numerada',       icon: 'list-ordered',    category: 'Listas',    keywords: 'lista numerada ordered numbers' },
    { type: 'todo',           label: 'Lista de tarefas',     icon: 'check-square',    category: 'Listas',    keywords: 'tarefa todo checkbox task' },
    { type: 'toggle',         label: 'Alternante (Toggle)',  icon: 'chevrons-down-up', category: 'Listas',   keywords: 'toggle alternante expandir details' },

    // Avancado
    { type: 'code',           label: 'Codigo',              icon: 'code-2',           category: 'Avancado',  keywords: 'codigo code programacao' },
    { type: 'callout',        label: 'Destaque',            icon: 'megaphone',        category: 'Avancado',  keywords: 'destaque callout alerta info' },

    // Layout
    { type: 'columns_2',      label: '2 colunas',           icon: 'columns-2',        category: 'Layout',    keywords: 'colunas columns layout 2' },
    { type: 'columns_3',      label: '3 colunas',           icon: 'columns-3',        category: 'Layout',    keywords: 'colunas columns layout 3' },

    // Em breve
    { type: null, label: 'Equacao (em breve)',           icon: 'sigma',       category: 'Em breve', keywords: 'equacao math equation', disabled: true },
    { type: null, label: 'Bloco sincronizado (em breve)', icon: 'refresh-cw', category: 'Em breve', keywords: 'sincronizado synced block', disabled: true }
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  function _createEl() {
    if (_el) return;
    _el = document.createElement('div');
    _el.className = 'be-slash-palette';
    _el.setAttribute('role', 'listbox');
    _el.style.display = 'none';
    document.body.appendChild(_el);

    // Fechar ao clicar fora
    document.addEventListener('mousedown', _onOutsideClick);
  }

  function _renderItems() {
    if (!_el) return;

    let html = '';
    let lastCategory = '';

    _filteredItems.forEach((item, i) => {
      if (item.category !== lastCategory) {
        lastCategory = item.category;
        html += `<div class="be-slash-category">${_esc(item.category)}</div>`;
      }
      const selected = i === _selectedIndex ? ' be-slash-item--selected' : '';
      const disabled = item.disabled ? ' be-slash-item--disabled' : '';
      html += `<div class="be-slash-item${selected}${disabled}"
        role="option"
        data-index="${i}"
        data-type="${item.type || ''}"
        ${item.disabled ? 'aria-disabled="true"' : ''}>
        <i data-lucide="${_esc(item.icon)}" class="be-slash-icon"></i>
        <span class="be-slash-label">${_esc(item.label)}</span>
      </div>`;
    });

    if (_filteredItems.length === 0) {
      html = '<div class="be-slash-empty">Nenhum resultado</div>';
    }

    _el.innerHTML = html;
    if (window.lucide) lucide.createIcons({ root: _el });

    // Bind click
    _el.querySelectorAll('.be-slash-item:not(.be-slash-item--disabled)').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(item.dataset.index, 10);
        _selectItem(idx);
      });
      item.addEventListener('mouseenter', () => {
        _selectedIndex = parseInt(item.dataset.index, 10);
        _updateSelection();
      });
    });
  }

  function _updateSelection() {
    if (!_el) return;
    _el.querySelectorAll('.be-slash-item').forEach((item, i) => {
      item.classList.toggle('be-slash-item--selected', i === _selectedIndex);
    });

    // Scroll into view
    const selectedEl = _el.querySelector('.be-slash-item--selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function _selectItem(index) {
    const item = _filteredItems[index];
    if (!item || item.disabled) return;

    const type = item.type;
    const callback = _onSelect; // Salvar referencia antes de close() limpar
    close();
    if (callback) callback(type);
  }

  // ── Posicionamento ─────────────────────────────────────────────────────

  function _position(x, y) {
    if (!_el) return;
    const maxH = 320;
    const viewH = window.innerHeight;
    const viewW = window.innerWidth;

    _el.style.position = 'fixed';
    _el.style.zIndex = '9999';
    _el.style.maxHeight = maxH + 'px';

    // Se nao cabe abaixo, abrir acima
    if (y + maxH > viewH) {
      _el.style.top = Math.max(8, y - maxH - 8) + 'px';
    } else {
      _el.style.top = y + 'px';
    }

    // Se nao cabe a direita
    _el.style.left = Math.min(x, viewW - 260) + 'px';
    _el.style.width = '248px';
  }

  // ── Keyboard handler (global) ─────────────────────────────────────────

  function _onKeydown(e) {
    if (!_isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      // Pular items disabled
      let next = _selectedIndex;
      do {
        next = (next + 1) % _filteredItems.length;
      } while (_filteredItems[next]?.disabled && next !== _selectedIndex);
      _selectedIndex = next;
      _updateSelection();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      let prev = _selectedIndex;
      do {
        prev = (prev - 1 + _filteredItems.length) % _filteredItems.length;
      } while (_filteredItems[prev]?.disabled && prev !== _selectedIndex);
      _selectedIndex = prev;
      _updateSelection();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      _selectItem(_selectedIndex);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  function _onOutsideClick(e) {
    if (_isOpen && _el && !_el.contains(e.target)) {
      close();
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  function open({ x, y, blockId, onSelect }) {
    _createEl();
    _blockId = blockId;
    _onSelect = onSelect;
    _selectedIndex = 0;
    _filteredItems = COMMANDS.slice();
    _isOpen = true;

    _renderItems();
    _position(x, y);
    _el.style.display = 'block';

    document.addEventListener('keydown', _onKeydown, true);
  }

  function close() {
    if (!_isOpen) return;
    _isOpen = false;
    if (_el) _el.style.display = 'none';
    document.removeEventListener('keydown', _onKeydown, true);
    _onSelect = null;
    _blockId = null;
  }

  function filter(query) {
    if (!_isOpen) return;
    const q = (query || '').toLowerCase().trim();

    if (!q) {
      _filteredItems = COMMANDS.slice();
    } else {
      _filteredItems = COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.keywords.toLowerCase().includes(q)
      );
    }

    _selectedIndex = 0;
    // Pular disabled
    while (_filteredItems[_selectedIndex]?.disabled && _selectedIndex < _filteredItems.length - 1) {
      _selectedIndex++;
    }
    _renderItems();
  }

  return {
    open,
    close,
    filter,
    get isOpen() { return _isOpen; },
    COMMANDS
  };
})();

if (typeof window !== 'undefined') {
  window.SlashCommandPalette = SlashCommandPalette;
}
