/**
 * TBO OS — Field Engine
 *
 * Registry of field types with validation, display rendering, and editor creation.
 * Each field type provides: validate, renderDisplay, renderEditor, getDefault,
 * serialize, deserialize.
 *
 * API:
 *   TBO_FIELD_ENGINE.TYPES              — enum of type constants
 *   TBO_FIELD_ENGINE.READONLY_TYPES     — types that cannot be edited
 *   TBO_FIELD_ENGINE.isReadOnly(type)   — check if type is read-only
 *   TBO_FIELD_ENGINE.validate(type, value, config)       — { ok, error? }
 *   TBO_FIELD_ENGINE.serialize(type, value)               — value → JSON-safe
 *   TBO_FIELD_ENGINE.deserialize(type, valueJson)         — JSON → JS value
 *   TBO_FIELD_ENGINE.getDefaultValue(type)                — type default
 *   TBO_FIELD_ENGINE.renderDisplay(type, value, config)   — HTML string
 *   TBO_FIELD_ENGINE.renderEditor(type, value, config, callbacks) — { el, getValue, setValue, destroy }
 *   TBO_FIELD_ENGINE.register(type, handler)              — add custom type
 *   TBO_FIELD_ENGINE.getRegisteredTypes()                 — list of registered types
 */
const TBO_FIELD_ENGINE = (() => {
  'use strict';

  // ── Constants ──
  const TYPES = Object.freeze({
    TEXT: 'text',
    NUMBER: 'number',
    DATE: 'date',
    SINGLE_SELECT: 'single_select',
    MULTI_SELECT: 'multi_select',
    PEOPLE: 'people',
    REFERENCE: 'reference',
  });

  const READONLY_TYPES = Object.freeze(['id', 'created_at', 'updated_at', 'created_by']);

  // ── Registry ──
  const _handlers = {};

  function register(type, handler) {
    _handlers[type] = handler;
  }

  function _getHandler(type) {
    return _handlers[type] || null;
  }

  // ── Utilities ──
  function _esc(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) return TBO_FORMATTER.escapeHtml(str);
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return String(dateStr); }
  }

  function _formatNumber(num, config) {
    if (num == null) return '';
    const n = Number(num);
    if (isNaN(n)) return String(num);
    if (config && config.format === 'currency') {
      const prefix = config.prefix || 'R$';
      return prefix + ' ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return n.toLocaleString('pt-BR');
  }

  // ── Public API ──

  function isReadOnly(type) {
    return READONLY_TYPES.includes(type);
  }

  function validate(type, value, config) {
    const h = _getHandler(type);
    if (!h) return { ok: false, error: 'Tipo desconhecido: ' + type };
    try { return h.validate(value, config || {}); }
    catch (e) { return { ok: false, error: e.message }; }
  }

  function serialize(type, value) {
    const h = _getHandler(type);
    if (!h || !h.serialize) return value;
    return h.serialize(value);
  }

  function deserialize(type, valueJson) {
    const h = _getHandler(type);
    if (!h || !h.deserialize) return valueJson;
    return h.deserialize(valueJson);
  }

  function getDefaultValue(type) {
    const h = _getHandler(type);
    if (!h) return null;
    return h.getDefault();
  }

  function renderDisplay(type, value, config) {
    const h = _getHandler(type);
    if (!h) return '<span class="fe-empty">—</span>';
    try { return h.renderDisplay(value, config || {}); }
    catch { return '<span class="fe-empty">—</span>'; }
  }

  function renderEditor(type, value, config, callbacks) {
    const h = _getHandler(type);
    if (!h || !h.renderEditor) return null;
    try { return h.renderEditor(value, config || {}, callbacks || {}); }
    catch (e) {
      if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.warn('[FieldEngine] renderEditor failed for ' + type, e);
      return null;
    }
  }

  function getRegisteredTypes() {
    return Object.keys(_handlers);
  }

  // ═══════════════════════════════════════════════════════════════════
  // Built-in Type Handlers
  // ═══════════════════════════════════════════════════════════════════

  // ── TEXT ──
  register('text', {
    validate(value, config) {
      if (value != null && typeof value !== 'string') return { ok: false, error: 'Deve ser texto' };
      if (config.maxLength && value && value.length > config.maxLength) {
        return { ok: false, error: 'Máximo ' + config.maxLength + ' caracteres' };
      }
      return { ok: true };
    },
    getDefault() { return ''; },
    serialize(v) { return v == null ? null : String(v); },
    deserialize(v) { return v == null ? '' : String(v); },
    renderDisplay(value) {
      if (!value) return '<span class="fe-empty">—</span>';
      return '<span class="fe-text">' + _esc(value) + '</span>';
    },
    renderEditor(value, config, cb) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'fe-editor fe-editor-text';
      input.value = value || '';
      if (config.placeholder) input.placeholder = config.placeholder;
      if (config.maxLength) input.maxLength = config.maxLength;

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); if (cb.onCommit) cb.onCommit(input.value); }
        if (e.key === 'Escape') { e.preventDefault(); if (cb.onCancel) cb.onCancel(); }
      });
      input.addEventListener('blur', () => { if (cb.onCommit) cb.onCommit(input.value); });

      return {
        el: input,
        getValue() { return input.value; },
        setValue(v) { input.value = v || ''; },
        focus() { input.focus(); input.select(); },
        destroy() { input.remove(); },
      };
    },
  });

  // ── NUMBER ──
  register('number', {
    validate(value, config) {
      if (value == null || value === '') return { ok: true };
      const n = Number(value);
      if (isNaN(n)) return { ok: false, error: 'Deve ser número' };
      if (config.min != null && n < config.min) return { ok: false, error: 'Mínimo: ' + config.min };
      if (config.max != null && n > config.max) return { ok: false, error: 'Máximo: ' + config.max };
      return { ok: true };
    },
    getDefault() { return null; },
    serialize(v) { return v == null || v === '' ? null : Number(v); },
    deserialize(v) { return v == null ? null : Number(v); },
    renderDisplay(value, config) {
      if (value == null || value === '') return '<span class="fe-empty">—</span>';
      return '<span class="fe-number">' + _esc(_formatNumber(value, config)) + '</span>';
    },
    renderEditor(value, config, cb) {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'fe-editor fe-editor-number';
      input.value = value != null ? value : '';
      if (config.min != null) input.min = config.min;
      if (config.max != null) input.max = config.max;
      if (config.step) input.step = config.step;

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); if (cb.onCommit) cb.onCommit(input.value === '' ? null : Number(input.value)); }
        if (e.key === 'Escape') { e.preventDefault(); if (cb.onCancel) cb.onCancel(); }
      });
      input.addEventListener('blur', () => { if (cb.onCommit) cb.onCommit(input.value === '' ? null : Number(input.value)); });

      return {
        el: input,
        getValue() { return input.value === '' ? null : Number(input.value); },
        setValue(v) { input.value = v != null ? v : ''; },
        focus() { input.focus(); input.select(); },
        destroy() { input.remove(); },
      };
    },
  });

  // ── DATE ──
  register('date', {
    validate(value) {
      if (value == null || value === '') return { ok: true };
      if (typeof value !== 'string' || isNaN(Date.parse(value))) return { ok: false, error: 'Data inválida' };
      return { ok: true };
    },
    getDefault() { return null; },
    serialize(v) { return v || null; },
    deserialize(v) { return v || null; },
    renderDisplay(value) {
      if (!value) return '<span class="fe-empty">—</span>';
      return '<span class="fe-date">' + _esc(_formatDate(value)) + '</span>';
    },
    renderEditor(value, config, cb) {
      const input = document.createElement('input');
      input.type = 'date';
      input.className = 'fe-editor fe-editor-date';
      input.value = value || '';

      input.addEventListener('change', () => { if (cb.onChange) cb.onChange(input.value || null); });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); if (cb.onCommit) cb.onCommit(input.value || null); }
        if (e.key === 'Escape') { e.preventDefault(); if (cb.onCancel) cb.onCancel(); }
      });
      input.addEventListener('blur', () => { if (cb.onCommit) cb.onCommit(input.value || null); });

      return {
        el: input,
        getValue() { return input.value || null; },
        setValue(v) { input.value = v || ''; },
        focus() { input.showPicker ? input.showPicker() : input.focus(); },
        destroy() { input.remove(); },
      };
    },
  });

  // ── SINGLE_SELECT ──
  register('single_select', {
    validate(value, config) {
      if (value == null || value === '') return { ok: true };
      const opts = config.options || [];
      if (opts.length > 0 && !opts.includes(value)) return { ok: false, error: 'Opção inválida: ' + value };
      return { ok: true };
    },
    getDefault() { return null; },
    serialize(v) { return v || null; },
    deserialize(v) { return v || null; },
    renderDisplay(value, config) {
      if (!value) return '<span class="fe-empty">—</span>';
      const colors = config.colors || {};
      const color = colors[value] || '#6b7280';
      return '<span class="fe-pill" style="background:' + color + '20;color:' + color + ';border:1px solid ' + color + '40">' + _esc(value) + '</span>';
    },
    renderEditor(value, config, cb) {
      const select = document.createElement('select');
      select.className = 'fe-editor fe-editor-select';

      // Empty option
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '— Selecionar —';
      select.appendChild(emptyOpt);

      // Options
      const opts = config.options || [];
      for (const opt of opts) {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        if (opt === value) o.selected = true;
        select.appendChild(o);
      }

      select.addEventListener('change', () => {
        const v = select.value || null;
        if (cb.onChange) cb.onChange(v);
        if (cb.onCommit) cb.onCommit(v);
      });
      select.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); if (cb.onCancel) cb.onCancel(); }
      });

      return {
        el: select,
        getValue() { return select.value || null; },
        setValue(v) { select.value = v || ''; },
        focus() { select.focus(); },
        destroy() { select.remove(); },
      };
    },
  });

  // ── MULTI_SELECT ──
  register('multi_select', {
    validate(value, config) {
      if (value == null) return { ok: true };
      if (!Array.isArray(value)) return { ok: false, error: 'Deve ser lista' };
      const opts = config.options || [];
      if (opts.length > 0) {
        for (const v of value) {
          if (!opts.includes(v)) return { ok: false, error: 'Opção inválida: ' + v };
        }
      }
      return { ok: true };
    },
    getDefault() { return []; },
    serialize(v) { return Array.isArray(v) ? v : []; },
    deserialize(v) { return Array.isArray(v) ? v : []; },
    renderDisplay(value, config) {
      if (!value || !Array.isArray(value) || value.length === 0) return '<span class="fe-empty">—</span>';
      const colors = config.colors || {};
      return value.map(v => {
        const color = colors[v] || '#6b7280';
        return '<span class="fe-pill" style="background:' + color + '20;color:' + color + ';border:1px solid ' + color + '40">' + _esc(v) + '</span>';
      }).join(' ');
    },
    renderEditor(value, config, cb) {
      const container = document.createElement('div');
      container.className = 'fe-editor fe-editor-multi-select';

      const selected = new Set(Array.isArray(value) ? value : []);
      const opts = config.options || [];
      const colors = config.colors || {};

      function _render() {
        container.innerHTML = '';
        for (const opt of opts) {
          const label = document.createElement('label');
          label.className = 'fe-ms-option';

          const cb2 = document.createElement('input');
          cb2.type = 'checkbox';
          cb2.checked = selected.has(opt);
          cb2.addEventListener('change', () => {
            if (cb2.checked) selected.add(opt); else selected.delete(opt);
            const arr = Array.from(selected);
            if (cb.onChange) cb.onChange(arr);
          });

          const color = colors[opt] || '#6b7280';
          const span = document.createElement('span');
          span.className = 'fe-ms-label';
          span.style.color = color;
          span.textContent = opt;

          label.appendChild(cb2);
          label.appendChild(span);
          container.appendChild(label);
        }

        // Done button
        const doneBtn = document.createElement('button');
        doneBtn.className = 'fe-ms-done';
        doneBtn.textContent = 'OK';
        doneBtn.addEventListener('click', () => { if (cb.onCommit) cb.onCommit(Array.from(selected)); });
        container.appendChild(doneBtn);
      }

      _render();

      container.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); if (cb.onCancel) cb.onCancel(); }
      });

      return {
        el: container,
        getValue() { return Array.from(selected); },
        setValue(v) { selected.clear(); if (Array.isArray(v)) v.forEach(x => selected.add(x)); _render(); },
        focus() { const first = container.querySelector('input'); if (first) first.focus(); },
        destroy() { container.remove(); },
      };
    },
  });

  // ── PEOPLE ──
  register('people', {
    validate(value, config) {
      if (value == null || value === '') return { ok: true };
      if (config.multiple) {
        if (!Array.isArray(value)) return { ok: false, error: 'Deve ser lista de pessoas' };
      }
      return { ok: true };
    },
    getDefault() { return null; },
    serialize(v) { return v || null; },
    deserialize(v) { return v || null; },
    renderDisplay(value) {
      if (!value) return '<span class="fe-empty">—</span>';
      // value can be { id, name, avatar_url } or just a string name
      if (typeof value === 'string') {
        const initials = value.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        return '<span class="fe-people"><span class="fe-avatar">' + _esc(initials) + '</span><span class="fe-people-name">' + _esc(value) + '</span></span>';
      }
      if (value && value.name) {
        const initials = value.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        if (value.avatar_url) {
          return '<span class="fe-people"><img class="fe-avatar-img" src="' + _esc(value.avatar_url) + '" alt=""><span class="fe-people-name">' + _esc(value.name) + '</span></span>';
        }
        return '<span class="fe-people"><span class="fe-avatar">' + _esc(initials) + '</span><span class="fe-people-name">' + _esc(value.name) + '</span></span>';
      }
      return '<span class="fe-empty">—</span>';
    },
    renderEditor(value, config, cb) {
      const container = document.createElement('div');
      container.className = 'fe-editor fe-editor-people';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'fe-people-search';
      input.placeholder = 'Buscar pessoa...';
      input.value = typeof value === 'string' ? value : (value && value.name ? value.name : '');
      container.appendChild(input);

      const dropdown = document.createElement('div');
      dropdown.className = 'fe-people-dropdown';
      dropdown.style.display = 'none';
      container.appendChild(dropdown);

      let _searchTimeout = null;

      async function _search(term) {
        dropdown.innerHTML = '<div class="fe-people-loading">Buscando...</div>';
        dropdown.style.display = 'block';
        try {
          let people = [];
          if (typeof PeopleRepo !== 'undefined' && PeopleRepo.list) {
            people = await PeopleRepo.list({ search: term, limit: 10 });
          }
          dropdown.innerHTML = '';
          if (people.length === 0) {
            dropdown.innerHTML = '<div class="fe-people-empty">Nenhuma pessoa encontrada</div>';
            return;
          }
          for (const p of people) {
            const item = document.createElement('div');
            item.className = 'fe-people-item';
            const initials = (p.name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            item.innerHTML = '<span class="fe-avatar">' + _esc(initials) + '</span><span>' + _esc(p.name || p.email || '') + '</span>';
            item.addEventListener('click', () => {
              const val = { id: p.id, name: p.name || '', avatar_url: p.avatar_url || null };
              input.value = val.name;
              dropdown.style.display = 'none';
              if (cb.onChange) cb.onChange(val);
              if (cb.onCommit) cb.onCommit(val);
            });
            dropdown.appendChild(item);
          }
        } catch {
          dropdown.innerHTML = '<div class="fe-people-empty">Erro na busca</div>';
        }
      }

      input.addEventListener('input', () => {
        clearTimeout(_searchTimeout);
        const term = input.value.trim();
        if (term.length < 2) { dropdown.style.display = 'none'; return; }
        _searchTimeout = setTimeout(() => _search(term), 300);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); dropdown.style.display = 'none'; if (cb.onCancel) cb.onCancel(); }
        if (e.key === 'Enter') { e.preventDefault(); dropdown.style.display = 'none'; }
      });

      // Clear button
      const clearBtn = document.createElement('button');
      clearBtn.className = 'fe-people-clear';
      clearBtn.textContent = '✕';
      clearBtn.title = 'Limpar';
      clearBtn.addEventListener('click', () => {
        input.value = '';
        dropdown.style.display = 'none';
        if (cb.onChange) cb.onChange(null);
        if (cb.onCommit) cb.onCommit(null);
      });
      container.appendChild(clearBtn);

      return {
        el: container,
        getValue() {
          const text = input.value.trim();
          return text ? (typeof value === 'object' && value ? value : text) : null;
        },
        setValue(v) {
          input.value = typeof v === 'string' ? v : (v && v.name ? v.name : '');
        },
        focus() { input.focus(); },
        destroy() { clearTimeout(_searchTimeout); container.remove(); },
      };
    },
  });

  // ── REFERENCE ──
  register('reference', {
    validate(value) {
      if (value == null || value === '') return { ok: true };
      return { ok: true };
    },
    getDefault() { return null; },
    serialize(v) { return v || null; },
    deserialize(v) { return v || null; },
    renderDisplay(value) {
      if (!value) return '<span class="fe-empty">—</span>';
      // value = { id, title } or string
      if (typeof value === 'string') return '<span class="fe-reference">' + _esc(value) + '</span>';
      if (value.title) return '<span class="fe-reference">' + _esc(value.title) + '</span>';
      return '<span class="fe-empty">—</span>';
    },
    renderEditor(value, config, cb) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'fe-editor fe-editor-reference';
      input.placeholder = 'Buscar...';
      input.value = typeof value === 'string' ? value : (value && value.title ? value.title : '');

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); if (cb.onCommit) cb.onCommit(input.value || null); }
        if (e.key === 'Escape') { e.preventDefault(); if (cb.onCancel) cb.onCancel(); }
      });
      input.addEventListener('blur', () => { if (cb.onCommit) cb.onCommit(input.value || null); });

      return {
        el: input,
        getValue() { return input.value || null; },
        setValue(v) { input.value = typeof v === 'string' ? v : (v && v.title ? v.title : ''); },
        focus() { input.focus(); },
        destroy() { input.remove(); },
      };
    },
  });

  // ═══════════════════════════════════════════════════════════════════

  return {
    TYPES,
    READONLY_TYPES,
    isReadOnly,
    register,
    getRegisteredTypes,
    validate,
    serialize,
    deserialize,
    getDefaultValue,
    renderDisplay,
    renderEditor,
  };
})();

if (typeof window !== 'undefined') window.TBO_FIELD_ENGINE = TBO_FIELD_ENGINE;
