/**
 * TBO OS — Inline Editor
 *
 * Transforma qualquer elemento em editável ao clicar.
 * Click → Editar → Enter salva → Esc cancela
 * Suporta text, textarea, date, select.
 * Autosave com debounce configurável.
 *
 * API:
 *   TBO_INLINE_EDITOR.attach(element, { key, type, value, onSave, placeholder })
 *   TBO_INLINE_EDITOR.attachAll(container, selector, config)
 */

const TBO_INLINE_EDITOR = (() => {
  'use strict';

  const _SAVE_DELAY = 600; // ms (reservado para autosave futuro)

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /**
   * Transforma elemento em editável inline
   * @param {HTMLElement} element - Elemento que recebe o click
   * @param {object} opts
   * @param {string} opts.key - Chave do campo
   * @param {string} opts.type - 'text' | 'textarea' | 'date' | 'select'
   * @param {*} opts.value - Valor atual
   * @param {function} opts.onSave - Callback(key, newValue, oldValue)
   * @param {string} opts.placeholder - Placeholder quando vazio
   * @param {Array} opts.options - Opções para type='select'
   */
  function attach(element, opts = {}) {
    if (!element) return null;

    const {
      key = '',
      type = 'text',
      value = '',
      onSave = null,
      placeholder = 'Clique para editar...',
      options = []
    } = opts;

    let _editing = false;
    let _currentValue = value;

    // Estilo de hover para indicar editabilidade
    element.style.cursor = 'text';
    element.style.borderRadius = 'var(--radius-xs, 3px)';
    element.style.transition = 'background 0.1s ease';
    element.title = 'Clique para editar';

    element.addEventListener('mouseenter', () => {
      if (!_editing) {
        element.style.background = 'var(--bg-card-hover, #f8f8f8)';
      }
    });

    element.addEventListener('mouseleave', () => {
      if (!_editing) {
        element.style.background = '';
      }
    });

    element.addEventListener('click', (e) => {
      if (_editing) return;
      e.stopPropagation();
      _startEdit();
    });

    function _startEdit() {
      _editing = true;
      const originalText = element.textContent;

      if (type === 'textarea') {
        element.contentEditable = true;
        element.style.outline = 'none';
        element.style.border = '1px solid var(--brand-orange, #E85102)';
        element.style.padding = '4px 6px';
        element.style.background = 'var(--bg-card, #ffffff)';
        element.focus();

        // Posicionar cursor no final
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        const _finishTextarea = () => {
          element.contentEditable = false;
          element.style.border = '';
          element.style.padding = '';
          element.style.background = '';
          _editing = false;

          const newValue = element.innerText.trim();
          if (newValue !== _currentValue) {
            _currentValue = newValue;
            if (onSave) onSave(key, newValue, originalText);
          }
        };

        element.addEventListener('blur', _finishTextarea, { once: true });
        element.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            element.innerText = _currentValue;
            element.blur();
          }
        }, { once: true });

        return;
      }

      if (type === 'select') {
        const select = document.createElement('select');
        select.style.cssText = `font-size:inherit;font-family:inherit;padding:2px 4px;border:1px solid var(--brand-orange,#E85102);border-radius:3px;outline:none;background:var(--bg-card,#fff);width:100%;`;

        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = typeof opt === 'object' ? opt.value : opt;
          option.textContent = typeof opt === 'object' ? opt.label : opt;
          if ((typeof opt === 'object' ? opt.value : opt) === _currentValue) {
            option.selected = true;
          }
          select.appendChild(option);
        });

        element.textContent = '';
        element.appendChild(select);
        select.focus();

        const _finishSelect = () => {
          const newValue = select.value;
          const label = select.options[select.selectedIndex]?.textContent || newValue;
          element.textContent = label;
          _editing = false;

          if (newValue !== _currentValue) {
            _currentValue = newValue;
            if (onSave) onSave(key, newValue, value);
          }
        };

        select.addEventListener('change', _finishSelect);
        select.addEventListener('blur', _finishSelect);
        return;
      }

      // Default: text input (ou date)
      const input = document.createElement('input');
      input.type = type === 'date' ? 'date' : 'text';
      input.value = _currentValue || '';
      input.placeholder = placeholder;
      input.style.cssText = `font-size:inherit;font-family:inherit;padding:2px 6px;border:1px solid var(--brand-orange,#E85102);border-radius:3px;outline:none;width:100%;box-sizing:border-box;background:var(--bg-card,#fff);`;

      element.textContent = '';
      element.appendChild(input);
      input.focus();
      input.select();

      const _finish = () => {
        const newValue = input.value.trim();
        element.textContent = newValue || placeholder;
        if (!newValue) {
          element.style.color = 'var(--text-muted, #9f9f9f)';
          element.style.fontStyle = 'italic';
        } else {
          element.style.color = '';
          element.style.fontStyle = '';
        }
        _editing = false;

        if (newValue !== _currentValue) {
          _currentValue = newValue;
          if (onSave) onSave(key, newValue, value);
        }
      };

      input.addEventListener('blur', _finish);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        if (e.key === 'Escape') { input.value = _currentValue || ''; input.blur(); }
      });
    }

    // Retornar referência para update externo
    return {
      setValue(v) {
        _currentValue = v;
        if (!_editing) {
          element.textContent = v || placeholder;
          element.style.color = v ? '' : 'var(--text-muted, #9f9f9f)';
          element.style.fontStyle = v ? '' : 'italic';
        }
      },
      getValue() { return _currentValue; },
      destroy() {
        element.style.cursor = '';
        element.style.borderRadius = '';
        element.title = '';
        // Nota: event listeners não podem ser removidos sem referência
      }
    };
  }

  /**
   * Aplica inline editing em todos os elementos que fazem match
   * @param {HTMLElement|string} container
   * @param {string} selector - CSS selector
   * @param {function} configFn - (element) => opts
   * @returns {Array} Array de instances
   */
  function attachAll(container, selector, configFn) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return [];

    const instances = [];
    el.querySelectorAll(selector).forEach(element => {
      const opts = configFn(element);
      if (opts) {
        instances.push(attach(element, opts));
      }
    });
    return instances;
  }

  return { attach, attachAll };
})();

if (typeof window !== 'undefined') {
  window.TBO_INLINE_EDITOR = TBO_INLINE_EDITOR;
}
