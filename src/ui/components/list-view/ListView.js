/**
 * TBO OS — ListView (Lista estruturada Asana-style)
 *
 * Renderiza dados em formato de tabela/lista com:
 * - Colunas configuráveis
 * - Checkbox
 * - Drag-and-drop
 * - Click para abrir DetailsPanel
 * - Grupos colapsáveis
 * - Inline editing
 *
 * API:
 *   TBO_LIST_VIEW.create(container, { columns, data, groups?, onSelect, onReorder, onEdit, entityType })
 */

const TBO_LIST_VIEW = (() => {
  'use strict';

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /**
   * Gera HTML de uma célula
   * @param {object} col - Definição da coluna
   * @param {*} value - Valor da célula
   * @returns {string} HTML
   */
  function _renderCell(col, value) {
    const type = col.type || 'text';

    if (type === 'status') {
      const statusMap = { todo: 'todo', 'em andamento': 'progress', 'em progresso': 'progress', 'in_progress': 'progress', review: 'review', revisao: 'review', done: 'done', concluido: 'done', finalizado: 'done' };
      const cls = statusMap[(value || '').toLowerCase()] || 'todo';
      return `<span class="lv-status lv-status--${cls}">${_escHtml(value || 'A fazer')}</span>`;
    }

    if (type === 'avatar') {
      if (!value) return '<span class="lv-avatar">?</span>';
      if (typeof value === 'object') {
        if (value.avatar_url) {
          return `<span class="lv-avatar"><img src="${_escHtml(value.avatar_url)}" alt="${_escHtml(value.name || '')}"></span>`;
        }
        const initials = (value.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        return `<span class="lv-avatar" title="${_escHtml(value.name || '')}">${_escHtml(initials)}</span>`;
      }
      return `<span class="lv-avatar">${_escHtml(String(value).slice(0, 2).toUpperCase())}</span>`;
    }

    if (type === 'date') {
      if (!value) return '<span class="lv-cell--muted">—</span>';
      try {
        return _escHtml(new Date(value).toLocaleDateString('pt-BR'));
      } catch {
        return _escHtml(String(value));
      }
    }

    if (type === 'priority') {
      const colors = { alta: '#EF4444', media: '#F59E0B', baixa: '#22C55E' };
      const color = colors[(value || '').toLowerCase()] || '#9f9f9f';
      return `<span style="color:${color};font-weight:500;font-size:12px">${_escHtml(value || '—')}</span>`;
    }

    return `<span class="lv-cell${!value ? ' lv-cell--muted' : ''}">${_escHtml(value != null ? String(value) : '—')}</span>`;
  }

  /**
   * Gera HTML de uma linha
   * @param {object} item - Dados do item
   * @param {Array} columns - Definições das colunas
   * @param {boolean} isSelected
   * @returns {string}
   */
  function _renderRow(item, columns, isSelected) {
    const cells = columns.map(col => {
      const value = item[col.key];
      const sizeClass = col.size === 'sm' ? 'lv-col-sm' : col.size === 'md' ? 'lv-col-md' : col.size === 'lg' ? 'lv-col-lg' : 'lv-col-title';
      const isTitle = col.isTitle;

      return `<div class="${sizeClass}">
        <div class="lv-cell${isTitle ? ' lv-cell--title' : ''}">${_renderCell(col, value)}</div>
      </div>`;
    }).join('');

    return `<div class="lv-row${isSelected ? ' lv-row--selected' : ''}" data-id="${_escHtml(item.id || '')}" draggable="true">
      <div class="lv-col-select">
        <span class="lv-drag-handle" title="Arrastar">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></svg>
        </span>
        <button class="lv-checkbox${isSelected ? ' lv-checkbox--checked' : ''}" data-check="${_escHtml(item.id || '')}" aria-label="Selecionar"></button>
      </div>
      ${cells}
    </div>`;
  }

  /**
   * Cria uma ListView
   * @param {HTMLElement|string} container
   * @param {object} opts
   * @returns {object} Instance com métodos de controle
   */
  function create(container, opts = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;

    const {
      columns = [],
      data = [],
      groups = null,
      onSelect = null,
      onCheck = null,
      onReorder = null,
      onAdd = null,
      entityType = 'item',
      entityIcon: _entityIcon = 'file'
    } = opts;

    let _data = [...data];
    let _selectedId = null;
    const _checked = new Set();

    function _render() {
      let html = '';

      // Header
      html += '<div class="lv-header">';
      html += '<div class="lv-col-select"><button class="lv-checkbox" data-check-all aria-label="Selecionar todos"></button></div>';
      html += columns.map(col => {
        const sizeClass = col.size === 'sm' ? 'lv-col-sm' : col.size === 'md' ? 'lv-col-md' : col.size === 'lg' ? 'lv-col-lg' : 'lv-col-title';
        return `<div class="lv-header-cell ${sizeClass}" data-sort="${_escHtml(col.key)}">${_escHtml(col.label)}</div>`;
      }).join('');
      html += '</div>';

      // Body
      html += '<div class="lv-body">';

      if (groups && groups.length) {
        // Render com grupos
        groups.forEach(group => {
          const groupItems = _data.filter(item => group.filter(item));
          html += `<div class="lv-group">
            <div class="lv-group-header" data-group="${_escHtml(group.id)}">
              <i data-lucide="chevron-down" class="lv-group-chevron"></i>
              <span class="lv-group-label">${_escHtml(group.label)}</span>
              <span class="lv-group-count">${groupItems.length}</span>
            </div>
            <div class="lv-group-items">
              ${groupItems.map(item => _renderRow(item, columns, item.id === _selectedId)).join('')}
            </div>
          </div>`;
        });
      } else {
        // Render flat
        html += _data.map(item => _renderRow(item, columns, item.id === _selectedId)).join('');
      }

      html += '</div>';

      // Add row
      if (onAdd) {
        html += `<div class="lv-add-row" id="lvAddRow">
          <i data-lucide="plus"></i>
          <span>Adicionar ${_escHtml(entityType)}</span>
        </div>`;
      }

      el.innerHTML = html;
      if (window.lucide) lucide.createIcons({ root: el });
      _bindEvents();
    }

    function _bindEvents() {
      // Click em linha → selecionar e abrir DetailsPanel
      el.querySelectorAll('.lv-row').forEach(row => {
        row.addEventListener('click', (e) => {
          // Ignorar click no checkbox ou drag handle
          if (e.target.closest('.lv-checkbox') || e.target.closest('.lv-drag-handle')) return;

          const id = row.dataset.id;
          _selectedId = id;

          // Atualizar visual
          el.querySelectorAll('.lv-row--selected').forEach(r => r.classList.remove('lv-row--selected'));
          row.classList.add('lv-row--selected');

          const item = _data.find(d => String(d.id) === id);
          if (onSelect && item) onSelect(item);
        });
      });

      // Checkbox
      el.querySelectorAll('.lv-checkbox[data-check]').forEach(cb => {
        cb.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = cb.dataset.check;
          if (_checked.has(id)) {
            _checked.delete(id);
            cb.classList.remove('lv-checkbox--checked');
          } else {
            _checked.add(id);
            cb.classList.add('lv-checkbox--checked');
          }
          if (onCheck) onCheck([..._checked]);
        });
      });

      // Check all
      const checkAll = el.querySelector('[data-check-all]');
      if (checkAll) {
        checkAll.addEventListener('click', () => {
          if (_checked.size === _data.length) {
            _checked.clear();
            el.querySelectorAll('.lv-checkbox--checked').forEach(c => c.classList.remove('lv-checkbox--checked'));
          } else {
            _data.forEach(d => _checked.add(String(d.id)));
            el.querySelectorAll('.lv-checkbox[data-check]').forEach(c => c.classList.add('lv-checkbox--checked'));
            checkAll.classList.add('lv-checkbox--checked');
          }
          if (onCheck) onCheck([..._checked]);
        });
      }

      // Group toggle
      el.querySelectorAll('.lv-group-header').forEach(header => {
        header.addEventListener('click', () => {
          header.classList.toggle('lv-group-header--collapsed');
          const items = header.nextElementSibling;
          if (items) items.classList.toggle('lv-group-items--collapsed');
        });
      });

      // Drag and drop
      if (onReorder) {
        let _draggedRow = null;

        el.querySelectorAll('.lv-row').forEach(row => {
          row.addEventListener('dragstart', (e) => {
            _draggedRow = row;
            row.classList.add('lv-row--dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', row.dataset.id);
          });

          row.addEventListener('dragend', () => {
            row.classList.remove('lv-row--dragging');
            el.querySelectorAll('.lv-row--drop-target').forEach(r => r.classList.remove('lv-row--drop-target'));
            _draggedRow = null;
          });

          row.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (_draggedRow === row) return;
            el.querySelectorAll('.lv-row--drop-target').forEach(r => r.classList.remove('lv-row--drop-target'));
            row.classList.add('lv-row--drop-target');
          });

          row.addEventListener('drop', (e) => {
            e.preventDefault();
            row.classList.remove('lv-row--drop-target');
            if (!_draggedRow || _draggedRow === row) return;

            const fromId = _draggedRow.dataset.id;
            const toId = row.dataset.id;
            const fromIdx = _data.findIndex(d => String(d.id) === fromId);
            const toIdx = _data.findIndex(d => String(d.id) === toId);

            if (fromIdx >= 0 && toIdx >= 0) {
              const [moved] = _data.splice(fromIdx, 1);
              _data.splice(toIdx, 0, moved);
              onReorder(_data.map(d => d.id));
              _render();
            }
          });
        });
      }

      // Add row
      const addRow = el.querySelector('#lvAddRow');
      if (addRow && onAdd) {
        addRow.addEventListener('click', () => onAdd());
      }
    }

    // Render inicial
    _render();

    // Retornar instance
    return {
      setData(newData) { _data = [...newData]; _render(); },
      getData() { return [..._data]; },
      getSelected() { return _selectedId; },
      getChecked() { return [..._checked]; },
      selectRow(id) {
        _selectedId = id;
        el.querySelectorAll('.lv-row--selected').forEach(r => r.classList.remove('lv-row--selected'));
        const row = el.querySelector(`.lv-row[data-id="${id}"]`);
        if (row) row.classList.add('lv-row--selected');
      },
      refresh() { _render(); }
    };
  }

  return { create };
})();

if (typeof window !== 'undefined') {
  window.TBO_LIST_VIEW = TBO_LIST_VIEW;
}
