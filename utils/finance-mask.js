// TBO OS — Finance Value Masking
// Toggle visibility of all monetary values across the dashboard
const TBO_FINANCE_MASK = {
  _STORAGE_KEY: 'tbo_finance_masked',
  _MASK_TEXT: 'R$ ••••••',

  /** Check if values are currently masked */
  isMasked() {
    return localStorage.getItem(this._STORAGE_KEY) === '1';
  },

  /** Toggle mask state and re-render current view */
  toggle() {
    const next = !this.isMasked();
    localStorage.setItem(this._STORAGE_KEY, next ? '1' : '0');
    this._updateIcon();
    this._reRender();
  },

  /** Apply mask — returns masked text if active, otherwise the original value */
  apply(formattedValue) {
    return this.isMasked() ? this._MASK_TEXT : formattedValue;
  },

  /** Update eye icon state in sidebar toggle button */
  _updateIcon() {
    const btn = document.getElementById('financeMaskToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', this.isMasked() ? 'eye-off' : 'eye');
      if (window.lucide) lucide.createIcons({ root: btn });
    }
    btn.classList.toggle('active', this.isMasked());
    btn.title = this.isMasked() ? 'Mostrar valores financeiros' : 'Ocultar valores financeiros';
  },

  /** Re-render the current module/view to apply mask changes */
  async _reRender() {
    window.dispatchEvent(new CustomEvent('tbo:finance-mask-changed', {
      detail: { masked: this.isMasked() }
    }));

    // Re-render current route module (same pattern as TBO_ROUTER.navigate)
    if (typeof TBO_ROUTER !== 'undefined' && TBO_ROUTER._currentModule) {
      const moduleName = TBO_ROUTER._currentModule;
      const mod = TBO_ROUTER._modules?.[moduleName];
      const container = document.getElementById('moduleContainer');
      if (mod && container) {
        try {
          if (mod.render) {
            const html = await mod.render();
            container.innerHTML = html;
          }
          if (mod.init) await mod.init();
          if (window.lucide) lucide.createIcons();
        } catch (e) { console.warn('[FinanceMask] re-render error:', e); }
      }
    }
  },

  /** Init — sync toggle icon state on page load */
  init() {
    this._updateIcon();
  }
};
