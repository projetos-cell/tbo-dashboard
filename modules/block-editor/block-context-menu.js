/**
 * TBO OS — Block Context Menu
 *
 * Menu de contexto por bloco (botao ⋮ ou clique direito).
 * Secoes: Transformar em, Cor, Acoes (duplicar, link, mover, excluir), IA.
 * Delega acoes de volta ao TBO_BLOCK_EDITOR via callback onAction.
 */

const BlockContextMenu = (() => {
  'use strict';

  let _el = null;
  let _isOpen = false;
  let _blockId = null;
  let _block = null;
  let _pageId = null;
  let _onAction = null;
  let _subMenuEl = null;

  // ── Block type options for "Transform" submenu ─────────────────────────

  const TRANSFORM_TYPES = [
    { type: 'text',           label: 'Texto',              icon: 'type' },
    { type: 'heading_1',      label: 'Titulo 1',           icon: 'heading-1' },
    { type: 'heading_2',      label: 'Titulo 2',           icon: 'heading-2' },
    { type: 'heading_3',      label: 'Titulo 3',           icon: 'heading-3' },
    { type: 'bulleted_list',  label: 'Lista com marcadores', icon: 'list' },
    { type: 'numbered_list',  label: 'Lista numerada',     icon: 'list-ordered' },
    { type: 'todo',           label: 'Lista de tarefas',   icon: 'check-square' },
    { type: 'toggle',         label: 'Alternante',         icon: 'chevrons-down-up' },
    { type: 'code',           label: 'Codigo',             icon: 'code-2' },
    { type: 'quote',          label: 'Citacao',            icon: 'quote' },
    { type: 'callout',        label: 'Destaque',           icon: 'megaphone' }
  ];

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Create root element ────────────────────────────────────────────────

  function _createEl() {
    if (_el) return;
    _el = document.createElement('div');
    _el.className = 'be-context-menu';
    _el.style.display = 'none';
    document.body.appendChild(_el);

    document.addEventListener('mousedown', _onOutsideClick);
  }

  // ── Render menu ────────────────────────────────────────────────────────

  function _renderMenu() {
    if (!_el) return;
    const currentType = _block?.type || 'text';

    let html = '';

    // -- Secao: Texto --
    html += '<div class="be-ctx-section">';
    html += `<div class="be-ctx-item be-ctx-item--has-sub" data-action="transform-sub">
      <i data-lucide="repeat" class="be-ctx-icon"></i>
      <span>Transformar em</span>
      <i data-lucide="chevron-right" class="be-ctx-arrow"></i>
    </div>`;
    html += `<div class="be-ctx-item be-ctx-item--has-sub" data-action="color-sub">
      <i data-lucide="palette" class="be-ctx-icon"></i>
      <span>Cor</span>
      <i data-lucide="chevron-right" class="be-ctx-arrow"></i>
    </div>`;
    html += '</div>';

    // -- Secao: Acoes --
    html += '<div class="be-ctx-separator"></div>';
    html += '<div class="be-ctx-section">';

    html += `<div class="be-ctx-item" data-action="link">
      <i data-lucide="link" class="be-ctx-icon"></i>
      <span>Link para o bloco</span>
    </div>`;
    html += `<div class="be-ctx-item" data-action="duplicate">
      <i data-lucide="copy" class="be-ctx-icon"></i>
      <span>Duplicar</span>
      <span class="be-ctx-shortcut">Ctrl+D</span>
    </div>`;
    html += `<div class="be-ctx-item" data-action="moveTo">
      <i data-lucide="move" class="be-ctx-icon"></i>
      <span>Mover para</span>
    </div>`;
    html += `<div class="be-ctx-item be-ctx-item--danger" data-action="delete">
      <i data-lucide="trash-2" class="be-ctx-icon"></i>
      <span>Excluir</span>
      <span class="be-ctx-shortcut">Del</span>
    </div>`;

    html += '</div>';

    // -- Secao: IA --
    html += '<div class="be-ctx-separator"></div>';
    html += '<div class="be-ctx-section">';
    html += `<div class="be-ctx-item" data-action="suggestEdits">
      <i data-lucide="sparkles" class="be-ctx-icon"></i>
      <span>Sugerir edicoes</span>
    </div>`;
    html += `<div class="be-ctx-item" data-action="askAI">
      <i data-lucide="message-circle" class="be-ctx-icon"></i>
      <span>Peca a IA</span>
    </div>`;
    html += '</div>';

    // -- Footer: Ultima edicao --
    const updatedAt = _block?.updated_at;
    if (updatedAt) {
      html += '<div class="be-ctx-separator"></div>';
      html += `<div class="be-ctx-footer">Ultima edicao ${_esc(_formatTimeAgo(updatedAt))}</div>`;
    }

    _el.innerHTML = html;
    if (window.lucide) lucide.createIcons({ root: _el });

    _bindMenuItems();
  }

  function _bindMenuItems() {
    _el.querySelectorAll('.be-ctx-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const action = item.dataset.action;
        _handleItemClick(action);
      });

      // Hover for submenus
      item.addEventListener('mouseenter', () => {
        const action = item.dataset.action;
        if (action === 'transform-sub') {
          _showTransformSub(item);
        } else if (action === 'color-sub') {
          _showColorSub(item);
        } else {
          _closeSubMenu();
        }
      });
    });
  }

  // ── Sub-menus ──────────────────────────────────────────────────────────

  function _showTransformSub(anchorEl) {
    _closeSubMenu();
    _subMenuEl = document.createElement('div');
    _subMenuEl.className = 'be-context-submenu';

    let html = '';
    TRANSFORM_TYPES.forEach(t => {
      const active = (_block?.type === t.type) ? ' be-ctx-item--active' : '';
      html += `<div class="be-ctx-item${active}" data-transform-type="${t.type}">
        <i data-lucide="${_esc(t.icon)}" class="be-ctx-icon"></i>
        <span>${_esc(t.label)}</span>
      </div>`;
    });
    _subMenuEl.innerHTML = html;
    if (window.lucide) lucide.createIcons({ root: _subMenuEl });

    _subMenuEl.querySelectorAll('.be-ctx-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newType = item.dataset.transformType;
        close();
        if (_onAction) _onAction('transform', _blockId, { type: newType });
      });
    });

    _positionSubMenu(anchorEl);
    document.body.appendChild(_subMenuEl);
  }

  function _showColorSub(anchorEl) {
    _closeSubMenu();

    if (typeof BlockColors !== 'undefined') {
      _subMenuEl = document.createElement('div');
      _subMenuEl.className = 'be-context-submenu be-colors-submenu';

      const currentTextColor = _block?.props?.textColor || 'default';
      const currentBgColor = _block?.props?.bgColor || 'default';

      _subMenuEl.innerHTML = BlockColors.renderPicker(currentTextColor, currentBgColor);

      _subMenuEl.querySelectorAll('[data-color-action]').forEach(item => {
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const colorType = item.dataset.colorType;
          const colorName = item.dataset.colorName;
          close();
          if (_onAction) _onAction('color', _blockId, { colorType, colorName });
        });
      });

      _positionSubMenu(anchorEl);
      document.body.appendChild(_subMenuEl);
    }
  }

  function _positionSubMenu(anchorEl) {
    if (!_subMenuEl || !_el) return;
    const menuRect = _el.getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();
    const viewW = window.innerWidth;

    _subMenuEl.style.position = 'fixed';
    _subMenuEl.style.zIndex = '10000';

    // Tentar abrir a direita
    const rightX = menuRect.right + 4;
    const leftX = menuRect.left - 200 - 4;

    if (rightX + 200 < viewW) {
      _subMenuEl.style.left = rightX + 'px';
    } else {
      _subMenuEl.style.left = Math.max(8, leftX) + 'px';
    }
    _subMenuEl.style.top = anchorRect.top + 'px';
  }

  function _closeSubMenu() {
    if (_subMenuEl) {
      _subMenuEl.remove();
      _subMenuEl = null;
    }
  }

  // ── Action handling ────────────────────────────────────────────────────

  function _handleItemClick(action) {
    if (action === 'transform-sub' || action === 'color-sub') return;

    close();
    if (_onAction) _onAction(action, _blockId);
  }

  // ── Position ───────────────────────────────────────────────────────────

  function _position(x, y) {
    if (!_el) return;
    const viewH = window.innerHeight;
    const viewW = window.innerWidth;
    const menuW = 220;
    const menuH = 360;

    _el.style.position = 'fixed';
    _el.style.zIndex = '9999';
    _el.style.width = menuW + 'px';

    // Vertical
    if (y + menuH > viewH) {
      _el.style.top = Math.max(8, viewH - menuH - 8) + 'px';
    } else {
      _el.style.top = y + 'px';
    }

    // Horizontal
    if (x + menuW > viewW) {
      _el.style.left = Math.max(8, x - menuW) + 'px';
    } else {
      _el.style.left = x + 'px';
    }
  }

  // ── Outside click ──────────────────────────────────────────────────────

  function _onOutsideClick(e) {
    if (!_isOpen) return;
    if (_el && _el.contains(e.target)) return;
    if (_subMenuEl && _subMenuEl.contains(e.target)) return;
    close();
  }

  // ── Time formatting ────────────────────────────────────────────────────

  function _formatTimeAgo(dateInput) {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const diff = Date.now() - date.getTime();
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (min < 1) return 'agora';
    if (min < 60) return `ha ${min} min`;
    if (hr < 24) return `ha ${hr}h`;
    if (d === 1) return 'ontem';
    if (d < 7) return `ha ${d} dias`;
    return `ha ${Math.floor(d / 7)} sem`;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  function open({ x, y, blockId, block, pageId, onAction }) {
    _createEl();
    _blockId = blockId;
    _block = block;
    _pageId = pageId;
    _onAction = onAction;
    _isOpen = true;

    _renderMenu();
    _position(x, y);
    _el.style.display = 'block';
  }

  function close() {
    _closeSubMenu();
    if (!_isOpen) return;
    _isOpen = false;
    if (_el) _el.style.display = 'none';
    _onAction = null;
    _blockId = null;
    _block = null;
  }

  return {
    open,
    close,
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.BlockContextMenu = BlockContextMenu;
}
