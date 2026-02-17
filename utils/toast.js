// TBO OS — Toast Notification System
const TBO_TOAST = {
  _container: null,

  _getContainer() {
    if (!this._container) {
      this._container = document.getElementById('toastContainer');
    }
    return this._container;
  },

  show(type, title, message, duration = 5000, action = null) {
    const container = this._getContainer();
    if (!container) return;

    const icons = {
      success: '\u2705',
      error: '\u274C',
      warning: '\u26A0\uFE0F',
      info: '\u2139\uFE0F'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        <div class="toast-title">${this._escapeHtml(title)}${action ? `<button class="toast-action">${action.label}</button>` : ''}</div>
        ${message ? `<div class="toast-message">${this._escapeHtml(message)}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Fechar">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this._remove(toast));

    // Bind action button
    if (action) {
      const actionBtn = toast.querySelector('.toast-action');
      if (actionBtn) actionBtn.addEventListener('click', () => { action.onClick(); this._remove(toast); });
    }

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this._remove(toast), duration);
    }

    return toast;
  },

  success(title, message, duration) {
    return this.show('success', title, message, duration);
  },

  error(title, message, duration = 8000) {
    return this.show('error', title, message, duration);
  },

  warning(title, message, duration = 6000) {
    return this.show('warning', title, message, duration);
  },

  info(title, message, duration) {
    return this.show('info', title, message, duration);
  },

  _remove(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  },

  clearAll() {
    const container = this._getContainer();
    if (container) container.innerHTML = '';
  },

  _escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
