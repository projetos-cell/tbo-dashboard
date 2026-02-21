/**
 * TBO OS — Sidebar Bridge (v2)
 *
 * Conecta a nova sidebar Notion-style (baseada em Supabase)
 * ao sistema existente. Detecta preferência do usuário
 * e ativa o renderer adequado.
 *
 * Coexiste com TBO_NAV_BRIDGE (v1) — este é o v2 com dados do Supabase.
 * Quando ativado, substitui completamente a sidebar clássica e a v1.
 *
 * API:
 *   TBO_SIDEBAR_BRIDGE.init()           → Detecta e ativa
 *   TBO_SIDEBAR_BRIDGE.setStyle(style)  → 'notion-v2' | 'notion' | 'classic'
 *   TBO_SIDEBAR_BRIDGE.toggle()         → Alternar entre estilos
 */

const TBO_SIDEBAR_BRIDGE = (() => {
  'use strict';

  const STORAGE_KEY = 'tbo_sidebar_style_v2';
  let _currentStyle = null;

  /**
   * Detecta estilo preferido
   * Prioridade: localStorage > config > default
   */
  function _detectStyle() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'notion-v2' || stored === 'notion' || stored === 'classic') {
        return stored;
      }
    } catch (_e) {
      // noop
    }

    // Config global
    if (typeof TBO_APP_CONFIG !== 'undefined') {
      const cfgStyle = TBO_APP_CONFIG.get('ui.sidebarStyle');
      if (cfgStyle === 'notion-v2') return 'notion-v2';
    }

    // Default: notion-v2 (sidebar integrada com Supabase)
    return 'notion-v2';
  }

  /**
   * Ativa sidebar Notion v2 (baseada em Supabase)
   */
  async function _activateNotionV2() {
    // Desativar sidebar clássica
    const sidebarNav = document.getElementById('sidebarNav');
    if (sidebarNav) {
      sidebarNav.classList.add('nsb-container');
    }

    // Desativar v1 se ativo
    if (typeof TBO_NOTION_SIDEBAR !== 'undefined') {
      try { TBO_NOTION_SIDEBAR.destroy?.(); } catch (_e) { /* noop */ }
    }

    // Inicializar v2
    if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
      await TBO_SIDEBAR_RENDERER.init();
    }
  }

  /**
   * Restaura sidebar clássica
   */
  function _activateClassic() {
    // Destruir v2
    if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
      TBO_SIDEBAR_RENDERER.destroy();
    }

    // Destruir v1
    if (typeof TBO_NOTION_SIDEBAR !== 'undefined') {
      try { TBO_NOTION_SIDEBAR.destroy?.(); } catch (_e) { /* noop */ }
    }

    // Re-renderizar sidebar clássica
    const sidebarNav = document.getElementById('sidebarNav');
    if (sidebarNav) {
      sidebarNav.classList.remove('nsb-container');
    }

    // Triggerar re-render da sidebar clássica
    if (typeof TBO_APP !== 'undefined' && TBO_APP._renderSidebar) {
      try { TBO_APP._renderSidebar(); } catch (_e) { /* noop */ }
    }
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  async function init() {
    _currentStyle = _detectStyle();

    if (_currentStyle === 'notion-v2') {
      await _activateNotionV2();
    } else if (_currentStyle === 'notion') {
      // v1 — delegar para TBO_NAV_BRIDGE se disponível
      if (typeof TBO_NAV_BRIDGE !== 'undefined') {
        TBO_NAV_BRIDGE.init();
      }
    }
    // 'classic' → não fazer nada (sidebar padrão do app.js)

    // Registrar no Command Palette
    if (typeof TBO_COMMAND_REGISTRY !== 'undefined') {
      TBO_COMMAND_REGISTRY.register({
        id: 'sidebar-style-toggle',
        label: 'Alternar estilo da sidebar',
        icon: 'layout',
        category: 'interface',
        handler: () => toggle()
      });
    }
  }

  function setStyle(style) {
    if (!['notion-v2', 'notion', 'classic'].includes(style)) return;

    _currentStyle = style;
    try {
      localStorage.setItem(STORAGE_KEY, style);
    } catch (_e) { /* noop */ }

    // Aplicar estilo
    if (style === 'notion-v2') {
      _activateNotionV2();
    } else if (style === 'notion') {
      _activateClassic(); // Limpar v2 primeiro
      if (typeof TBO_NAV_BRIDGE !== 'undefined') {
        TBO_NAV_BRIDGE.setStyle('notion');
      }
    } else {
      _activateClassic();
    }
  }

  function toggle() {
    const styles = ['notion-v2', 'classic'];
    const currentIdx = styles.indexOf(_currentStyle);
    const nextIdx = (currentIdx + 1) % styles.length;
    setStyle(styles[nextIdx]);

    if (typeof TBO_TOAST !== 'undefined') {
      const labels = { 'notion-v2': 'Notion (Supabase)', 'classic': 'Clássica' };
      TBO_TOAST.info('Sidebar', `Estilo: ${labels[styles[nextIdx]]}`);
    }
  }

  return {
    init,
    setStyle,
    toggle,
    get currentStyle() { return _currentStyle; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_SIDEBAR_BRIDGE = TBO_SIDEBAR_BRIDGE;
}
