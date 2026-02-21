/**
 * TBO OS — Workspace Context Menu
 *
 * Menu contextual do botão "…" nos workspaces da sidebar.
 * Itens filtrados por RBAC (owner/admin vs member).
 * Reutiliza CSS existente: .sidebar-context-menu, .sidebar-context-item (styles.css).
 *
 * API:
 *   TBO_WS_CONTEXT_MENU.open(triggerBtn, spaceId, spaceData)
 *   TBO_WS_CONTEXT_MENU.close()
 *   TBO_WS_CONTEXT_MENU.isOpen
 */

const TBO_WS_CONTEXT_MENU = (() => {
  'use strict';

  // ── Estado ──────────────────────────────────────────────────────────────
  let _menu = null;
  let _backdrop = null;
  let _isOpen = false;
  let _spaceId = null;
  let _spaceData = null;
  let _userRole = null;

  // ── Itens do menu ───────────────────────────────────────────────────────
  const MENU_ITEMS = [
    { id: 'rename',      icon: 'pencil',    label: 'Renomear',                       roles: ['owner', 'admin'] },
    { type: 'separator' },
    { id: 'add-members', icon: 'user-plus', label: 'Adicionar membros',              roles: ['owner', 'admin'] },
    { id: 'settings',    icon: 'settings',  label: 'Configurações do espaço',        roles: ['owner', 'admin', 'member'] },
    { type: 'separator' },
    { id: 'duplicate',   icon: 'copy',      label: 'Duplicar espaço de equipe',      roles: ['owner', 'admin'] },
    { type: 'separator' },
    { id: 'leave',       icon: 'log-out',   label: 'Sair do espaço de equipe',       roles: ['owner', 'admin', 'member'] },
    { id: 'archive',     icon: 'archive',   label: 'Arquivar espaço de equipe',      roles: ['owner', 'admin'] },
    { id: 'delete',      icon: 'trash-2',   label: 'Excluir espaço de equipe',       roles: ['owner', 'admin'], danger: true }
  ];

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function _getCurrentUserId() {
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      return user?.supabaseId || user?.id || null;
    }
    return null;
  }

  // ── Determinar role do usuário no workspace ─────────────────────────────

  async function _resolveUserRole(spaceId) {
    // 1. Tenant-level: owner/admin do tenant = owner do espaço
    if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
      const tenantRole = TBO_SIDEBAR_SERVICE.userRole;
      if (tenantRole === 'owner' || tenantRole === 'admin') {
        return 'owner';
      }
    }

    // 2. Space-level: buscar de space_members
    if (typeof SpaceRepo !== 'undefined') {
      try {
        const role = await SpaceRepo.getMyRole(spaceId);
        return role || 'member'; // Se não tem role no espaço, tratar como membro (pode ver via allowed_roles)
      } catch (_e) {
        // Fallback
      }
    }

    return 'member';
  }

  // ── Build Menu HTML ─────────────────────────────────────────────────────

  function _buildMenu(role) {
    const isAdmin = role === 'owner' || role === 'admin';

    let html = '';
    let lastWasSeparator = true; // Para evitar separadores duplicados no topo

    MENU_ITEMS.forEach((item, idx) => {
      if (item.type === 'separator') {
        // Só renderizar se o próximo item visível existir
        if (!lastWasSeparator) {
          const hasNextVisible = MENU_ITEMS.slice(idx + 1).some(
            next => !next.type && next.roles.includes(role)
          );
          if (hasNextVisible) {
            html += '<div class="context-menu__separator"></div>';
            lastWasSeparator = true;
          }
        }
        return;
      }

      // Verificar permissão
      if (!item.roles.includes(role)) return;

      const dangerClass = item.danger ? ' sidebar-context-item--danger' : '';

      html += `<button class="sidebar-context-item${dangerClass}" data-action="${_esc(item.id)}" ${!isAdmin && (item.id === 'duplicate' || item.id === 'archive' || item.id === 'delete') ? 'disabled' : ''}>
        <i data-lucide="${_esc(item.icon)}" class="context-menu__item__icon"></i>
        <span>${_esc(item.label)}</span>
      </button>`;
      lastWasSeparator = false;
    });

    return html;
  }

  // ── Posicionamento ──────────────────────────────────────────────────────

  function _positionMenu(triggerBtn) {
    if (!_menu || !triggerBtn) return;

    const rect = triggerBtn.getBoundingClientRect();
    const menuHeight = _menu.offsetHeight || 280;
    const menuWidth = _menu.offsetWidth || 220;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    // Posição padrão: abaixo e à direita do botão
    let top = rect.bottom + 4;
    let left = rect.left;

    // Flip vertical se ultrapassa viewport
    if (top + menuHeight > viewportH - 10) {
      top = rect.top - menuHeight - 4;
    }

    // Ajustar horizontal se ultrapassa viewport
    if (left + menuWidth > viewportW - 10) {
      left = viewportW - menuWidth - 10;
    }

    // Garantir mínimos
    top = Math.max(10, top);
    left = Math.max(10, left);

    _menu.style.top = `${top}px`;
    _menu.style.left = `${left}px`;
  }

  // ── Abrir / Fechar ──────────────────────────────────────────────────────

  async function open(triggerBtn, spaceId, spaceData) {
    // Fechar se já aberto
    if (_isOpen) close();

    _spaceId = spaceId;
    _spaceData = spaceData;

    // Resolver role do usuário
    _userRole = await _resolveUserRole(spaceId);

    // Criar backdrop invisível para capturar cliques fora
    _backdrop = document.createElement('div');
    _backdrop.style.cssText = 'position:fixed;inset:0;z-index:10001;';
    _backdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });
    document.body.appendChild(_backdrop);

    // Criar menu
    _menu = document.createElement('div');
    _menu.className = 'sidebar-context-menu';
    _menu.setAttribute('role', 'menu');
    _menu.setAttribute('aria-label', `Opções de ${_esc(spaceData?.name || 'espaço')}`);
    _menu.innerHTML = _buildMenu(_userRole);
    document.body.appendChild(_menu);

    // Ícones Lucide
    if (window.lucide) lucide.createIcons({ root: _menu });

    // Posicionar
    _positionMenu(triggerBtn);

    // Animar entrada
    requestAnimationFrame(() => {
      _menu.classList.add('visible');
    });

    _isOpen = true;

    // Bind eventos
    _bindEvents();
  }

  function close() {
    if (!_isOpen) return;

    // Remover event listeners
    document.removeEventListener('keydown', _onKeydown);

    // Animar saída
    if (_menu) {
      _menu.classList.remove('visible');
      setTimeout(() => {
        if (_menu && _menu.parentNode) _menu.remove();
        _menu = null;
      }, 120);
    }

    if (_backdrop) {
      _backdrop.remove();
      _backdrop = null;
    }

    _isOpen = false;
    _spaceId = null;
    _spaceData = null;
    _userRole = null;
  }

  // ── Event Handlers ──────────────────────────────────────────────────────

  function _bindEvents() {
    if (!_menu) return;

    // Click em itens
    _menu.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const action = btn.dataset.action;
        const sid = _spaceId;
        const sdata = _spaceData;
        close();
        _handleAction(action, sid, sdata);
      });
    });

    // ESC para fechar
    document.addEventListener('keydown', _onKeydown);
  }

  function _onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  }

  // ── Ações ───────────────────────────────────────────────────────────────

  function _handleAction(action, spaceId, spaceData) {
    switch (action) {
    case 'rename':
      _handleRename(spaceId, spaceData);
      break;

    case 'add-members':
      _handleAddMembers(spaceId);
      break;

    case 'settings':
      _handleSettings(spaceId);
      break;

    case 'leave':
      _handleLeave(spaceId, spaceData);
      break;

    case 'duplicate':
      _handleDuplicate(spaceId, spaceData);
      break;

    case 'archive':
      _handleArchive(spaceId, spaceData);
      break;

    case 'delete':
      _handleDelete(spaceId, spaceData);
      break;

    default:
      console.warn('[WS Context Menu] Ação desconhecida:', action);
    }
  }

  // ── Rename (inline) ─────────────────────────────────────────────────────

  function _handleRename(spaceId, spaceData) {
    // Encontrar o elemento do nome na sidebar
    const wsEl = document.querySelector(`.nsb-workspace[data-item-id="${spaceId}"]`);
    if (!wsEl) return;
    const nameEl = wsEl.querySelector('.nsb-ws-name');
    if (!nameEl) return;

    // Usar fallback direto — cria input imediatamente (o InlineEditor.attach
    // apenas registra listener de click, exigindo um segundo clique, então
    // preferimos o input inline que já foca no campo de texto)
    _inlineRename(nameEl, spaceId, spaceData);
  }

  /**
   * Fallback de rename inline sem TBO_INLINE_EDITOR
   */
  function _inlineRename(nameEl, spaceId, spaceData) {
    const currentName = spaceData?.name || nameEl.textContent;
    const originalHTML = nameEl.innerHTML;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.maxLength = 60;
    input.style.cssText = 'width:100%;font-size:inherit;font-weight:inherit;font-family:inherit;padding:1px 4px;border:1px solid var(--brand-orange);border-radius:3px;outline:none;background:var(--bg-card);color:var(--text-primary);';

    nameEl.innerHTML = '';
    nameEl.appendChild(input);
    input.focus();
    input.select();

    const save = async () => {
      const trimmed = input.value.trim();
      if (trimmed && trimmed !== currentName && trimmed.length <= 60) {
        try {
          await SpaceRepo.rename(spaceId, trimmed);
          nameEl.textContent = trimmed;
          if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') TBO_SIDEBAR_SERVICE.refresh();
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Renomeado', `"${trimmed}"`);
        } catch (_err) {
          nameEl.innerHTML = originalHTML;
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao renomear');
        }
      } else {
        nameEl.innerHTML = originalHTML;
      }
    };

    const cancel = () => {
      nameEl.innerHTML = originalHTML;
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    });
    input.addEventListener('blur', save);
  }

  // ── Add Members ─────────────────────────────────────────────────────────

  function _handleAddMembers(spaceId) {
    if (typeof TBO_WS_SETTINGS !== 'undefined') {
      TBO_WS_SETTINGS.open(spaceId, 'membros');
    } else {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.info('Em breve', 'Gerenciamento de membros será implementado');
      }
    }
  }

  // ── Settings ────────────────────────────────────────────────────────────

  function _handleSettings(spaceId) {
    if (typeof TBO_WS_SETTINGS !== 'undefined') {
      TBO_WS_SETTINGS.open(spaceId);
    } else {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.info('Em breve', 'Configurações do espaço será implementado');
      }
    }
  }

  // ── Leave ───────────────────────────────────────────────────────────────

  async function _handleLeave(spaceId, spaceData) {
    const uid = _getCurrentUserId();
    if (!uid) return;

    try {
      // Verificar se é último owner
      const myRole = await SpaceRepo.getMyRole(spaceId);
      if (myRole === 'owner') {
        const ownerCount = await SpaceRepo.countOwners(spaceId);
        if (ownerCount <= 1) {
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.error(
              'Não é possível sair',
              'Você é o único proprietário. Transfira a propriedade antes de sair.'
            );
          }
          return;
        }
      }

      // Confirmação
      const spaceName = spaceData?.name || 'este espaço';
      if (!window.confirm(`Deseja sair do espaço "${spaceName}"? Você perderá o acesso ao conteúdo.`)) {
        return;
      }

      await SpaceRepo.removeMember(spaceId, uid);

      // Refresh sidebar
      if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
        await TBO_SIDEBAR_SERVICE.refresh();
      }
      if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
        TBO_SIDEBAR_RENDERER.render();
      }

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Saiu do espaço', spaceName);
      }
    } catch (err) {
      console.error('[WS Context Menu] Erro ao sair:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', err.message || 'Não foi possível sair do espaço');
      }
    }
  }

  // ── Duplicate (Entrega 2 — stub) ────────────────────────────────────────

  async function _handleDuplicate(spaceId, spaceData) {
    const spaceName = spaceData?.name || 'Espaço';
    try {
      const newSpace = await SpaceRepo.duplicate(spaceId);
      if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
        await TBO_SIDEBAR_SERVICE.refresh();
      }
      if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
        TBO_SIDEBAR_RENDERER.render();
      }
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Espaço duplicado', `"${spaceName}" foi duplicado com sucesso`);
      }
    } catch (err) {
      console.error('[WS Context Menu] Erro ao duplicar:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', err.message || 'Não foi possível duplicar o espaço');
      }
    }
  }

  // ── Archive (Entrega 2 — stub) ──────────────────────────────────────────

  async function _handleArchive(spaceId, spaceData) {
    const spaceName = spaceData?.name || 'Espaço';
    if (!window.confirm(`Deseja arquivar o espaço "${spaceName}"? Ele ficará oculto na sidebar.`)) {
      return;
    }

    try {
      const uid = _getCurrentUserId();
      await SpaceRepo.archive(spaceId, uid);
      if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
        await TBO_SIDEBAR_SERVICE.refresh();
      }
      if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
        TBO_SIDEBAR_RENDERER.render();
      }
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Arquivado', `"${spaceName}" foi arquivado`);
      }
    } catch (err) {
      console.error('[WS Context Menu] Erro ao arquivar:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', err.message || 'Não foi possível arquivar');
      }
    }
  }

  // ── Delete (confirmação dupla via modal nativo) ─────────────────────────

  function _handleDelete(spaceId, spaceData) {
    const spaceName = spaceData?.name || 'Espaço';

    // Usar modal nativo TBO_DELETE_CONFIRM se disponível
    if (typeof TBO_DELETE_CONFIRM !== 'undefined') {
      TBO_DELETE_CONFIRM.open({
        name: spaceName,
        onConfirm: async () => {
          try {
            const uid = _getCurrentUserId();
            await SpaceRepo.softDelete(spaceId, uid);
            if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
              await TBO_SIDEBAR_SERVICE.refresh();
            }
            if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
              TBO_SIDEBAR_RENDERER.render();
            }
            if (typeof TBO_TOAST !== 'undefined') {
              TBO_TOAST.success('Excluído', `"${spaceName}" foi removido`);
            }
          } catch (err) {
            console.error('[WS Context Menu] Erro ao excluir:', err);
            if (typeof TBO_TOAST !== 'undefined') {
              TBO_TOAST.error('Erro', err.message || 'Não foi possível excluir');
            }
          }
        }
      });
    } else {
      // Fallback: window.prompt caso o modal não esteja carregado
      const input = window.prompt(
        `Esta ação é irreversível.\n\nPara excluir o espaço "${spaceName}", digite o nome do espaço:`
      );
      if (!input || input.trim() !== spaceName) {
        if (input !== null && typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.warning('Cancelado', 'O nome digitado não confere');
        }
        return;
      }
      (async () => {
        try {
          const uid = _getCurrentUserId();
          await SpaceRepo.softDelete(spaceId, uid);
          if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') await TBO_SIDEBAR_SERVICE.refresh();
          if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') TBO_SIDEBAR_RENDERER.render();
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Excluído', `"${spaceName}" foi removido`);
        } catch (err) {
          console.error('[WS Context Menu] Erro ao excluir:', err);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', err.message || 'Não foi possível excluir');
        }
      })();
    }
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  return {
    open,
    close,
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_WS_CONTEXT_MENU = TBO_WS_CONTEXT_MENU;
}
