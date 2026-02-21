/**
 * TBO OS — Sidebar Renderer (Notion-style)
 *
 * Renderiza a sidebar Notion-style usando dados do TBO_SIDEBAR_SERVICE.
 * Skeleton loading, expand/collapse com animação, highlight do item ativo,
 * navegação instantânea, badges em tempo real.
 *
 * Substituição completa da sidebar clássica quando ativado.
 *
 * API:
 *   TBO_SIDEBAR_RENDERER.init()       → Inicializa e renderiza
 *   TBO_SIDEBAR_RENDERER.render()     → Re-renderiza
 *   TBO_SIDEBAR_RENDERER.setActive()  → Atualiza item ativo
 *   TBO_SIDEBAR_RENDERER.destroy()    → Remove sidebar
 */

const TBO_SIDEBAR_RENDERER = (() => {
  'use strict';

  let _container = null;
  let _activeRoute = null;
  let _badgeInterval = null;

  const BADGE_POLL_INTERVAL = 2 * 60 * 1000; // 2 minutos

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Skeleton Loading ────────────────────────────────────────────────────

  function _renderSkeleton() {
    let html = '<div class="nsb-skeleton">';
    // 7 itens de sistema
    for (let i = 0; i < 7; i++) {
      html += `<div class="nsb-skeleton-item">
        <div class="nsb-skeleton-icon"></div>
        <div class="nsb-skeleton-text" style="width:${60 + Math.random() * 40}%"></div>
      </div>`;
    }
    // Separador
    html += '<div class="nsb-skeleton-sep"></div>';
    // 5 workspaces
    for (let i = 0; i < 5; i++) {
      html += `<div class="nsb-skeleton-item">
        <div class="nsb-skeleton-icon"></div>
        <div class="nsb-skeleton-text" style="width:${50 + Math.random() * 40}%"></div>
      </div>`;
    }
    html += '</div>';
    return html;
  }

  // ── Render: Item do sistema ─────────────────────────────────────────────

  function _renderSystemItem(item) {
    // Match exato ou base (rh/performance matcheia item.route='rh')
    const isActive = _activeRoute && (
      item.route === _activeRoute ||
      (_activeRoute.includes('/') && item.route === _activeRoute.split('/')[0])
    );
    const badge = typeof TBO_SIDEBAR_SERVICE !== 'undefined'
      ? TBO_SIDEBAR_SERVICE.getBadge(item.id)
      : 0;

    const action = item.metadata?.action || '';
    const clickAttr = item.route
      ? `data-route="${_escHtml(item.route)}"`
      : action ? `data-action="${_escHtml(action)}"` : '';

    return `<div class="nsb-item${isActive ? ' nsb-item--active' : ''}" ${clickAttr} data-item-id="${_escHtml(item.id)}">
      <i data-lucide="${_escHtml(item.icon || 'file')}"></i>
      <span class="nsb-item-label">${_escHtml(item.name)}</span>
      ${badge > 0 ? `<span class="nsb-badge" data-badge-id="${_escHtml(item.id)}">${badge > 99 ? '99+' : badge}</span>` : ''}
    </div>`;
  }

  // ── Render: Separador ───────────────────────────────────────────────────

  function _renderSeparator(item) {
    return `<div class="nsb-separator" data-item-id="${_escHtml(item.id)}">
      <span class="nsb-separator-label">${_escHtml(item.name)}</span>
    </div>`;
  }

  // ── Render: Workspace (espaço de equipe) ────────────────────────────────

  function _renderWorkspace(item) {
    const expanded = typeof TBO_SIDEBAR_SERVICE !== 'undefined'
      ? TBO_SIDEBAR_SERVICE.isExpanded(item.id)
      : true;

    // Conteúdo interno — placeholder inicial, preenchido por _loadWorkspaceContent
    const innerHtml = expanded
      ? `<div class="nsb-ws-content" id="nsbWsContent_${_escHtml(item.id)}">
           <div class="nsb-ws-placeholder">
             <span class="nsb-ws-placeholder-text">Carregando...</span>
           </div>
         </div>`
      : '';

    return `<div class="nsb-workspace${expanded ? ' nsb-workspace--expanded' : ''}" data-item-id="${_escHtml(item.id)}">
      <div class="nsb-ws-header" data-toggle="${_escHtml(item.id)}">
        <i data-lucide="chevron-right" class="nsb-ws-chevron"></i>
        <i data-lucide="${_escHtml(item.icon || 'folder')}" class="nsb-ws-icon"></i>
        <span class="nsb-ws-name">${_escHtml(item.name)}</span>
        <button class="nsb-ws-add" data-ws-add="${_escHtml(item.id)}" data-ws-label="${_escHtml(item.name)}" data-ws-icon="${_escHtml(item.icon || 'folder')}" aria-label="Adicionar a ${_escHtml(item.name)}" aria-haspopup="dialog" aria-expanded="false" title="Adicionar a ${_escHtml(item.name)}">
          <i data-lucide="plus"></i>
        </button>
        <button class="nsb-ws-more" data-ws-more="${_escHtml(item.id)}" title="Opções">
          <i data-lucide="more-horizontal"></i>
        </button>
      </div>
      ${innerHtml}
    </div>`;
  }

  // ── Carregar conteúdo de um workspace (children fixos + páginas) ─────

  /**
   * Renderiza conteúdo completo de um workspace:
   * 1. Children fixos (módulos como Financeiro) via SidebarService
   * 2. Páginas do Supabase via PagesRepo
   * @param {string} spaceId - ID do workspace (ex: 'ws-geral')
   */
  async function _loadWorkspaceContent(spaceId) {
    const contentEl = document.getElementById(`nsbWsContent_${spaceId}`);
    if (!contentEl) return;

    let html = '';

    // 1. Renderizar children fixos (módulos) do SidebarService
    if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
      const children = TBO_SIDEBAR_SERVICE.getChildItems(spaceId);
      if (children && children.length > 0) {
        html += children.map(child => _renderChildItem(child)).join('');
      }
    }

    // 2. Renderizar páginas do Supabase
    if (typeof PagesRepo !== 'undefined') {
      try {
        const pages = await PagesRepo.listBySpace(spaceId, { limit: 30 });
        if (pages && pages.length > 0) {
          html += pages.map(p => _renderPageItem(p)).join('');
        }
      } catch (err) {
        console.warn('[TBO Sidebar] Erro ao carregar páginas:', err);
      }
    }

    // Se nenhum conteúdo, mostrar placeholder
    if (!html) {
      contentEl.innerHTML = '<div class="nsb-ws-placeholder"><span class="nsb-ws-placeholder-text">Nenhum conteúdo ainda</span></div>';
      return;
    }

    contentEl.innerHTML = html;
    if (window.lucide) lucide.createIcons({ root: contentEl });
    _bindPageItemEvents(contentEl);
    _bindChildItemEvents(contentEl);
  }

  /**
   * Renderiza HTML de um child item fixo (módulo dentro de workspace)
   */
  function _renderChildItem(child) {
    const icon = child.icon || 'file';
    const title = _escHtml(child.name);
    // Match: exato, rota base, ou rota ativa comeca com a rota do child
    // Ex: activeRoute='rh/cultura/rituais' matcheia child.route='rh/cultura/rituais' (exato)
    //     activeRoute='rh/performance' matcheia child.route='rh' (base)
    //     activeRoute='rh/cultura/rituais' matcheia child.route='rh/cultura' (prefixo — NAO, queremos match exato no child)
    const isActive = _activeRoute && (
      child.route === _activeRoute ||
      (_activeRoute.includes('/') && child.route === _activeRoute.split('/')[0]) ||
      (_activeRoute.startsWith(child.route + '/'))
    );
    return `<div class="nsb-ws-item nsb-ws-child${isActive ? ' nsb-item--active' : ''}" data-child-route="${_escHtml(child.route)}" title="${title}">
      <i data-lucide="${_escHtml(icon)}"></i>
      <span class="nsb-ws-item-label">${title}</span>
    </div>`;
  }

  /**
   * Bind click events nos children fixos
   */
  function _bindChildItemEvents(container) {
    container.querySelectorAll('[data-child-route]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const route = el.dataset.childRoute;
        if (route) {
          window.location.hash = route;
          setActive(route);
        }
      });
    });
  }

  /**
   * Renderiza HTML de um item de página na sidebar
   */
  function _renderPageItem(page) {
    const icon = page.icon || 'file-text';
    const title = _escHtml(page.title || 'Sem título');
    return `<div class="nsb-ws-item" data-page-route="page/${page.id}" data-page-id="${page.id}" title="${title}">
      <i data-lucide="${_escHtml(icon)}"></i>
      <span class="nsb-ws-item-label">${title}</span>
    </div>`;
  }

  /**
   * Bind click events nos itens de página dentro de um container
   */
  function _bindPageItemEvents(container) {
    container.querySelectorAll('[data-page-route]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const route = el.dataset.pageRoute;
        if (route && typeof TBO_ROUTER !== 'undefined') {
          TBO_ROUTER.navigate(route);
        } else if (route) {
          window.location.hash = route;
        }
      });
    });
  }

  /**
   * Adiciona uma página recém-criada ao workspace na sidebar (sem reload).
   * @param {string} spaceId - ID do workspace
   * @param {Object} page - Objeto da página ({ id, title, icon })
   */
  function addPageToWorkspace(spaceId, page) {
    const contentEl = document.getElementById(`nsbWsContent_${spaceId}`);
    if (!contentEl) return;

    // Remove placeholder "Nenhum conteúdo" / "Carregando" se existir
    const placeholder = contentEl.querySelector('.nsb-ws-placeholder');
    if (placeholder) placeholder.remove();

    // Cria elemento do item
    const temp = document.createElement('div');
    temp.innerHTML = _renderPageItem(page);
    const itemEl = temp.firstElementChild;

    // Insere no topo da lista
    contentEl.insertBefore(itemEl, contentEl.firstChild);
    if (window.lucide) lucide.createIcons({ root: itemEl });
    _bindPageItemEvents(contentEl);
  }

  // ── Render: "Mais" botão ────────────────────────────────────────────────

  function _renderMoreButton(item) {
    return `<div class="nsb-item nsb-item--more" data-action="show-more-workspaces" data-item-id="${_escHtml(item.id)}">
      <i data-lucide="${_escHtml(item.icon || 'plus')}"></i>
      <span class="nsb-item-label">${_escHtml(item.name)}</span>
    </div>`;
  }

  // ── Render Completo ─────────────────────────────────────────────────────

  function _renderFull() {
    if (!_container) return;

    if (typeof TBO_SIDEBAR_SERVICE === 'undefined' || !TBO_SIDEBAR_SERVICE.initialized) {
      _container.innerHTML = _renderSkeleton();
      return;
    }

    const items = TBO_SIDEBAR_SERVICE.getItems();
    if (!items || items.length === 0) {
      _container.innerHTML = _renderSkeleton();
      return;
    }

    let html = '<nav class="nsb-nav" role="navigation" aria-label="Navegação principal">';

    // Seção raiz (system items antes do primeiro separador)
    const systemBefore = [];
    const separators = [];
    const workspaces = [];
    const systemAfter = [];
    let foundSeparator = false;

    items.forEach(item => {
      // Children são renderizados dentro dos workspaces, não no nível raiz
      if (item.type === 'child') return;

      if (item.type === 'separator') {
        foundSeparator = true;
        separators.push(item);
      } else if (item.type === 'workspace') {
        workspaces.push(item);
      } else if (!foundSeparator) {
        systemBefore.push(item);
      } else {
        systemAfter.push(item);
      }
    });

    // Itens fixos do sistema
    html += '<div class="nsb-section nsb-section--system">';
    systemBefore.forEach(item => {
      html += _renderSystemItem(item);
    });
    html += '</div>';

    // Separador + workspaces
    if (separators.length > 0) {
      html += _renderSeparator(separators[0]);
      html += '<div class="nsb-section nsb-section--workspaces">';
      workspaces.forEach(item => {
        html += _renderWorkspace(item);
      });
      html += '</div>';
    }

    // Itens pós-separador (Mais, etc.)
    if (systemAfter.length > 0) {
      html += '<div class="nsb-section nsb-section--footer">';
      systemAfter.forEach(item => {
        if (item.metadata?.action === 'show-more-workspaces') {
          html += _renderMoreButton(item);
        } else {
          html += _renderSystemItem(item);
        }
      });
      html += '</div>';
    }

    html += '</nav>';

    _container.innerHTML = html;
    if (window.lucide) lucide.createIcons({ root: _container });
    _bindEvents();

    // Carregar páginas dos workspaces que já estão expandidos
    workspaces.forEach(item => {
      const expanded = typeof TBO_SIDEBAR_SERVICE !== 'undefined'
        ? TBO_SIDEBAR_SERVICE.isExpanded(item.id)
        : true;
      if (expanded) {
        _loadWorkspaceContent(item.id);
      }
    });
  }

  // ── Bind Eventos ────────────────────────────────────────────────────────

  function _bindEvents() {
    if (!_container) return;

    // Click em item com rota → navegar
    _container.querySelectorAll('[data-route]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const route = el.dataset.route;
        if (route) {
          window.location.hash = route;
          setActive(route);
        }
      });
    });

    // Click em item com ação
    _container.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const action = el.dataset.action;
        _handleAction(action);
      });
    });

    // Toggle workspace expand/collapse
    _container.querySelectorAll('[data-toggle]').forEach(header => {
      header.addEventListener('click', (e) => {
        // Ignorar click no botão "mais"
        if (e.target.closest('.nsb-ws-more')) return;

        const itemId = header.dataset.toggle;
        if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
          const newState = TBO_SIDEBAR_SERVICE.toggleExpanded(itemId);
          const ws = header.closest('.nsb-workspace');
          if (ws) {
            ws.classList.toggle('nsb-workspace--expanded', newState);
            // Animar conteúdo
            const content = ws.querySelector('.nsb-ws-content');
            if (newState && !content) {
              // Criar container e carregar páginas do Supabase
              const contentDiv = document.createElement('div');
              contentDiv.className = 'nsb-ws-content';
              contentDiv.id = `nsbWsContent_${itemId}`;
              contentDiv.innerHTML = '<div class="nsb-ws-placeholder"><span class="nsb-ws-placeholder-text">Carregando...</span></div>';
              ws.appendChild(contentDiv);
              _loadWorkspaceContent(itemId);
            } else if (!newState && content) {
              content.remove();
            }
          }
        }
      });
    });

    // Botão "+" nos workspaces → abrir AddToSpaceOverlay
    _container.querySelectorAll('[data-ws-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const spaceId = btn.dataset.wsAdd;
        const spaceLabel = btn.dataset.wsLabel;
        const spaceIcon = btn.dataset.wsIcon;
        if (typeof TBO_ADD_TO_SPACE !== 'undefined') {
          TBO_ADD_TO_SPACE.open({
            spaceId,
            spaceLabel,
            spaceIcon,
            onCreate: (data) => {
              console.log('[TBO Sidebar] Criar em', spaceId, data);
            }
          });
        }
      });
    });

    // Botão "…" nos workspaces → abrir context menu
    _container.querySelectorAll('[data-ws-more]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const spaceId = btn.dataset.wsMore;
        const spaceItem = typeof TBO_SIDEBAR_SERVICE !== 'undefined'
          ? TBO_SIDEBAR_SERVICE.getItems().find(i => i.id === spaceId)
          : null;
        if (typeof TBO_WS_CONTEXT_MENU !== 'undefined') {
          TBO_WS_CONTEXT_MENU.open(btn, spaceId, spaceItem);
        }
      });
    });

    // Keyboard navigation
    _container.addEventListener('keydown', (e) => {
      const focusable = [..._container.querySelectorAll('.nsb-item, .nsb-ws-header')];
      const currentIndex = focusable.indexOf(document.activeElement);

      if (e.key === 'ArrowDown' && currentIndex < focusable.length - 1) {
        e.preventDefault();
        focusable[currentIndex + 1]?.focus();
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        focusable[currentIndex - 1]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.activeElement?.click();
      }
    });

    // Tornar itens focáveis
    _container.querySelectorAll('.nsb-item, .nsb-ws-header').forEach(el => {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'menuitem');
    });
  }

  // ── Ações especiais ─────────────────────────────────────────────────────

  function _handleAction(action) {
    switch (action) {
    case 'search':
      // Abrir Command Palette
      if (typeof TBO_COMMAND_PALETTE !== 'undefined') {
        TBO_COMMAND_PALETTE.toggle();
      } else {
        // Fallback: focar na barra de busca
        const searchInput = document.querySelector('#globalSearchInput, .search-input');
        if (searchInput) searchInput.focus();
      }
      break;

    case 'ai-assistant':
      // Abrir assistente IA (futuro)
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.info('IA TBO', 'Assistente IA em desenvolvimento');
      }
      break;

    case 'show-more-workspaces':
      // Mostrar workspaces ocultos ou modal de criação
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.info('Mais espaços', 'Funcionalidade em desenvolvimento');
      }
      break;

    case 'toggle-inbox':
      // Abrir/fechar painel complementar de notificações
      if (typeof TBO_SECONDARY_SIDEBAR !== 'undefined') {
        TBO_SECONDARY_SIDEBAR.toggle('inbox');
      }
      break;

    case 'activity-feed':
      if (typeof TBO_ACTIVITY_FEED !== 'undefined') {
        TBO_ACTIVITY_FEED.toggle();
      }
      break;

    default:
      console.log('[TBO Sidebar] Ação não reconhecida:', action);
    }
  }

  // ── Badges polling ──────────────────────────────────────────────────────

  function _startBadgePolling() {
    if (_badgeInterval) clearInterval(_badgeInterval);

    _badgeInterval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      _updateBadges();
    }, BADGE_POLL_INTERVAL);
  }

  function _updateBadges() {
    if (!_container || typeof TBO_SIDEBAR_SERVICE === 'undefined') return;

    _container.querySelectorAll('[data-badge-id]').forEach(badge => {
      const itemId = badge.dataset.badgeId;
      const count = TBO_SIDEBAR_SERVICE.getBadge(itemId);
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    });
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  async function init() {
    _container = document.getElementById('sidebarNav');
    if (!_container) {
      console.warn('[TBO Sidebar Renderer] Container #sidebarNav não encontrado');
      return;
    }

    // Mostrar skeleton imediato
    _container.innerHTML = _renderSkeleton();
    _container.classList.add('nsb-container');

    // Detectar rota atual (full route para deep links como rh/performance)
    _activeRoute = (window.location.hash || '#dashboard').replace('#', '');

    // Inicializar service
    if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
      await TBO_SIDEBAR_SERVICE.init();
    }

    // Renderizar
    _renderFull();

    // Iniciar polling de badges
    _startBadgePolling();

    // Escutar mudanças de rota
    window.addEventListener('hashchange', () => {
      const newRoute = (window.location.hash || '#dashboard').replace('#', '');
      setActive(newRoute);
    });
  }

  function render() {
    _renderFull();
  }

  /**
   * Atualiza item ativo na sidebar
   */
  function setActive(route) {
    _activeRoute = route;
    if (!_container) return;

    // Remover active de todos
    _container.querySelectorAll('.nsb-item--active').forEach(el => {
      el.classList.remove('nsb-item--active');
    });

    // Tentar match exato primeiro (deep link: rh/performance)
    let activeItem = _container.querySelector(`[data-route="${route}"]`) ||
                     _container.querySelector(`[data-child-route="${route}"]`);

    // Fallback: match pela rota base (rh/performance → rh)
    if (!activeItem && route.includes('/')) {
      const base = route.split('/')[0];
      activeItem = _container.querySelector(`[data-route="${base}"]`) ||
                   _container.querySelector(`[data-child-route="${base}"]`);
    }

    if (activeItem) {
      activeItem.classList.add('nsb-item--active');
    }
  }

  function destroy() {
    if (_badgeInterval) {
      clearInterval(_badgeInterval);
      _badgeInterval = null;
    }
    if (_container) {
      _container.classList.remove('nsb-container');
      _container.innerHTML = '';
    }
    _container = null;
  }

  return {
    init,
    render,
    setActive,
    destroy,
    addPageToWorkspace,
    get activeRoute() { return _activeRoute; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_SIDEBAR_RENDERER = TBO_SIDEBAR_RENDERER;
}
