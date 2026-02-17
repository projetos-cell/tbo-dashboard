// TBO OS — Keyboard Shortcuts Manager
const TBO_SHORTCUTS = {
  _bindings: [],
  _enabled: true,

  init() {
    document.addEventListener('keydown', (e) => {
      if (!this._enabled) return;

      // Skip if user is typing in an input/textarea
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        // Only allow Escape in inputs
        if (e.key !== 'Escape') return;
      }

      for (const binding of this._bindings) {
        if (this._matches(e, binding)) {
          e.preventDefault();
          e.stopPropagation();
          binding.handler(e);
          return;
        }
      }
    });
  },

  // Register a shortcut
  bind(key, handler, description = '') {
    this._bindings.push({ ...this._parseKey(key), handler, description, keyStr: key });
  },

  // Check if event matches a binding
  _matches(event, binding) {
    return event.key === binding.key &&
      !!event.altKey === !!binding.alt &&
      !!event.ctrlKey === !!binding.ctrl &&
      !!event.shiftKey === !!binding.shift &&
      !!event.metaKey === !!binding.meta;
  },

  // Parse key string like "Alt+1" into structured object
  _parseKey(keyStr) {
    const parts = keyStr.toLowerCase().split('+');
    return {
      key: this._normalizeKey(parts[parts.length - 1]),
      alt: parts.includes('alt'),
      ctrl: parts.includes('ctrl'),
      shift: parts.includes('shift'),
      meta: parts.includes('meta') || parts.includes('cmd')
    };
  },

  _normalizeKey(key) {
    const map = {
      'esc': 'Escape', 'escape': 'Escape',
      'enter': 'Enter', 'return': 'Enter',
      'space': ' ', 'tab': 'Tab',
      'up': 'ArrowUp', 'down': 'ArrowDown',
      'left': 'ArrowLeft', 'right': 'ArrowRight',
      'backspace': 'Backspace', 'delete': 'Delete',
    };
    return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
  },

  // Get all bindings for display
  getAll() {
    return this._bindings.map(b => ({
      key: b.keyStr,
      description: b.description
    }));
  },

  enable() { this._enabled = true; },
  disable() { this._enabled = false; }
};
