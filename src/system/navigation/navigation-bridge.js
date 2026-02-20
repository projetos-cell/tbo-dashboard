/**
 * TBO OS — Navigation Bridge
 *
 * Ponte entre sidebar antiga e Notion sidebar.
 * Controla qual sidebar é ativa baseado em:
 *   TBO_APP_CONFIG.get('ui.navigationStyle') === 'notion'
 *
 * Se 'notion': renderiza TBO_NOTION_SIDEBAR no #sidebarNav
 * Se 'classic' (default): não interfere, app.js renderiza normalmente
 *
 * Também permite trocar via TBO_NAV_BRIDGE.setStyle('notion'|'classic')
 */

const TBO_NAV_BRIDGE = (() => {
  'use strict';

  const STORAGE_KEY = 'tbo_nav_style';
  let _currentStyle = 'classic';

  /**
   * Detecta estilo de navegação configurado
   * Prioridade: localStorage > TBO_APP_CONFIG > default
   * @returns {'notion'|'classic'}
   */
  function _detectStyle() {
    // 1. localStorage (preferência do usuário)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'notion' || stored === 'classic') return stored;
    } catch { /* ignore */ }

    // 2. TBO_APP_CONFIG
    if (typeof TBO_APP_CONFIG !== 'undefined') {
      const cfgStyle = TBO_APP_CONFIG.get('ui.navigationStyle');
      if (cfgStyle === 'notion') return 'notion';
    }

    // 3. Default
    return 'classic';
  }

  /**
   * Aplica o estilo Notion na sidebar
   */
  function _applyNotion() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    // Adicionar classe nsb-mode para ativar estilos Notion
    nav.classList.add('nsb-mode');

    // Inicializar Notion sidebar no container #sidebarNav
    if (typeof TBO_NOTION_SIDEBAR !== 'undefined') {
      TBO_NOTION_SIDEBAR.init(nav);
    } else {
      console.warn('[NavBridge] TBO_NOTION_SIDEBAR não disponível');
    }

    _currentStyle = 'notion';
    console.log('[NavBridge] Modo Notion ativado');
  }

  /**
   * Remove Notion sidebar e restaura sidebar clássica
   */
  function _applyClassic() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    nav.classList.remove('nsb-mode');

    // Destruir Notion sidebar se inicializada
    if (typeof TBO_NOTION_SIDEBAR !== 'undefined' && TBO_NOTION_SIDEBAR.isInitialized) {
      TBO_NOTION_SIDEBAR.destroy();
    }

    // Re-renderizar sidebar clássica via app.js
    if (typeof TBO_APP !== 'undefined' && TBO_APP._renderSidebar) {
      TBO_APP._renderSidebar();
    }

    _currentStyle = 'classic';
    console.log('[NavBridge] Modo clássico restaurado');
  }

  return {
    /**
     * Inicializa a bridge.
     * Deve ser chamado APÓS o DOM estar pronto e APÓS TBO_APP._renderSidebar()
     * (ou seja, depois do login, quando sidebar já foi renderizada).
     */
    init() {
      const style = _detectStyle();

      if (style === 'notion') {
        // Substituir sidebar clássica pela Notion
        _applyNotion();
      } else {
        _currentStyle = 'classic';
      }

      // Registrar comando no Command Palette para trocar estilo
      if (typeof TBO_COMMAND_REGISTRY !== 'undefined') {
        TBO_COMMAND_REGISTRY.register({
          id: 'action:toggle-nav-style',
          label: 'Alternar estilo de navegação',
          icon: 'layout-list',
          category: 'Configurações',
          keywords: ['sidebar', 'notion', 'menu', 'navegação', 'estilo'],
          action: () => {
            const next = _currentStyle === 'notion' ? 'classic' : 'notion';
            TBO_NAV_BRIDGE.setStyle(next);
            if (typeof TBO_TOAST !== 'undefined') {
              TBO_TOAST.info('Navegação', `Estilo alterado para ${next === 'notion' ? 'Notion' : 'Clássico'}`);
            }
          }
        });
      }

      console.log(`[NavBridge] Inicializado — estilo: ${style}`);
    },

    /**
     * Troca estilo de navegação
     * @param {'notion'|'classic'} style
     */
    setStyle(style) {
      if (style === _currentStyle) return;

      try {
        localStorage.setItem(STORAGE_KEY, style);
      } catch { /* ignore */ }

      if (style === 'notion') {
        _applyNotion();
      } else {
        _applyClassic();
      }
    },

    /**
     * Retorna estilo atual
     * @returns {'notion'|'classic'}
     */
    getStyle() {
      return _currentStyle;
    },

    /**
     * Toggle entre estilos
     */
    toggle() {
      this.setStyle(_currentStyle === 'notion' ? 'classic' : 'notion');
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_NAV_BRIDGE = TBO_NAV_BRIDGE;
}
