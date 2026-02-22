/**
 * TBO OS — Workspace Settings Overlay
 *
 * Overlay full-screen para configurações de workspace (espaço de equipe).
 * Três tabs: Geral (nome, descrição, ícone) + Membros (lista, roles, convites) + Segurança.
 * Segue padrão de AddToSpaceOverlay: focus trap, ESC, backdrop, ARIA.
 *
 * API:
 *   TBO_WS_SETTINGS.open(spaceId, [initialTab])
 *   TBO_WS_SETTINGS.close()
 *   TBO_WS_SETTINGS.isOpen
 */

const TBO_WS_SETTINGS = (() => {
  'use strict';

  // ── Estado ──────────────────────────────────────────────────────────────
  let _overlay = null;
  let _isOpen = false;
  let _triggerEl = null;
  let _spaceId = null;
  let _spaceData = null;
  let _userRole = null;   // 'owner' | 'admin' | 'member'
  let _activeTab = 'geral';
  let _members = [];
  let _invitations = [];
  let _searchFilter = '';
  let _showAddMember = false;
  let _autocompleteResults = [];
  let _autocompleteTimer = null;
  let _selectedUser = null; // Usuário selecionado no autocomplete

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      return user?.supabaseId || user?.id || null;
    }
    return null;
  }

  function _isAdmin() {
    return _userRole === 'owner' || _userRole === 'admin';
  }

  function _roleLabel(role) {
    const map = { owner: 'Proprietário', admin: 'Administrador', member: 'Membro' };
    return map[role] || role;
  }

  function _initials(name) {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  // ── Resolver role do usuário ────────────────────────────────────────────

  async function _resolveUserRole(spaceId) {
    // Super admins SEMPRE são owners (acesso total irrestrito)
    if (typeof TBO_PERMISSIONS !== 'undefined' && typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      if (user && TBO_PERMISSIONS.isSuperAdmin(user.email)) return 'owner';
    }

    if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
      const tenantRole = TBO_SIDEBAR_SERVICE.userRole;
      if (tenantRole === 'owner' || tenantRole === 'admin') return 'owner';
    }
    if (typeof SpaceRepo !== 'undefined') {
      try {
        const role = await SpaceRepo.getMyRole(spaceId);
        return role || 'member';
      } catch (_e) { /* fallback */ }
    }
    return 'member';
  }

  // ── Carregar dados ──────────────────────────────────────────────────────

  async function _loadSpaceData(spaceId) {
    if (typeof SpaceRepo === 'undefined') return null;
    try {
      return await SpaceRepo.getById(spaceId);
    } catch (_e) {
      return null;
    }
  }

  async function _loadMembers(spaceId) {
    if (typeof SpaceRepo === 'undefined') return [];
    try {
      return await SpaceRepo.listMembers(spaceId);
    } catch (_e) {
      return [];
    }
  }

  async function _loadInvitations(spaceId) {
    if (typeof SpaceRepo === 'undefined') return [];
    try {
      return await SpaceRepo.listInvitations(spaceId);
    } catch (_e) {
      return [];
    }
  }

  // ── Build HTML ──────────────────────────────────────────────────────────

  function _buildOverlayHTML() {
    const name = _esc(_spaceData?.name || 'Espaço');
    const memberCount = _members.length;
    const iconValue = _spaceData?.icon_value || _spaceData?.icon || 'folder';
    const iconType = _spaceData?.icon_type || 'lucide';

    const iconHTML = iconType === 'emoji'
      ? `<span class="wss-header-icon">${_esc(iconValue)}</span>`
      : `<div class="wss-header-icon"><i data-lucide="${_esc(iconValue)}"></i></div>`;

    return `
      <div class="wss-overlay" role="dialog" aria-modal="true" aria-label="Configurações de ${name}">
        <div class="wss-backdrop"></div>
        <div class="wss-container">
          <!-- Header -->
          <header class="wss-header">
            ${iconHTML}
            <div class="wss-header-info">
              <div class="wss-header-name">${name}</div>
              <div class="wss-header-meta">${memberCount} ${memberCount === 1 ? 'membro' : 'membros'}</div>
            </div>
            <button class="wss-close-btn" aria-label="Fechar" data-wss-close>
              <i data-lucide="x"></i>
            </button>
          </header>

          <!-- Tabs -->
          <nav class="wss-tabs" role="tablist">
            <button class="wss-tab${_activeTab === 'geral' ? ' wss-tab--active' : ''}"
                    role="tab" aria-selected="${_activeTab === 'geral'}"
                    data-wss-tab="geral">
              <i data-lucide="settings"></i>
              Geral
            </button>
            <button class="wss-tab${_activeTab === 'membros' ? ' wss-tab--active' : ''}"
                    role="tab" aria-selected="${_activeTab === 'membros'}"
                    data-wss-tab="membros">
              <i data-lucide="users"></i>
              Membros
            </button>
            ${_isAdmin() ? `
            <button class="wss-tab${_activeTab === 'seguranca' ? ' wss-tab--active' : ''}"
                    role="tab" aria-selected="${_activeTab === 'seguranca'}"
                    data-wss-tab="seguranca">
              <i data-lucide="shield"></i>
              Segurança
            </button>` : ''}
          </nav>

          <!-- Body -->
          <div class="wss-body" role="tabpanel" data-wss-body>
            ${_renderTabContent()}
          </div>
        </div>
      </div>
    `;
  }

  function _renderTabContent() {
    if (_activeTab === 'geral') return _renderTabGeral();
    if (_activeTab === 'membros') return _renderTabMembros();
    if (_activeTab === 'seguranca') return _renderTabSeguranca();
    return _renderTabGeral();
  }

  // ── Tab Geral ───────────────────────────────────────────────────────────

  function _renderTabGeral() {
    const name = _spaceData?.name || '';
    const description = _spaceData?.description || '';
    const iconValue = _spaceData?.icon_value || _spaceData?.icon || 'folder';
    const iconType = _spaceData?.icon_type || 'lucide';
    const canEdit = _isAdmin();

    let iconDisplay;
    if (iconType === 'upload' && (_spaceData?.icon_url)) {
      iconDisplay = `<img src="${_esc(_spaceData.icon_url)}" alt="Ícone" style="width:100%;height:100%;object-fit:cover;border-radius:6px" />`;
    } else if (iconType === 'emoji') {
      iconDisplay = `<span>${_esc(iconValue)}</span>`;
    } else {
      iconDisplay = `<i data-lucide="${_esc(iconValue)}"></i>`;
    }

    return `
      <!-- Ícone -->
      <div class="wss-field">
        <label class="wss-field-label">Ícone</label>
        <div class="wss-icon-preview">
          <div class="wss-icon-display" data-wss-icon-trigger title="${canEdit ? 'Clique para alterar o ícone' : ''}" style="${canEdit ? 'cursor:pointer' : ''}">
            ${iconDisplay}
          </div>
          <span class="wss-icon-hint">${canEdit ? 'Clique para alterar' : 'Somente admins podem alterar'}</span>
        </div>
      </div>

      <!-- Nome -->
      <div class="wss-field">
        <label class="wss-field-label">Nome do espaço</label>
        ${canEdit
          ? `<div class="wss-field-value wss-field-value--editable" data-wss-edit="name" title="Clique para editar">${_esc(name)}</div>`
          : `<div class="wss-field-value">${_esc(name)}</div>`
        }
      </div>

      <!-- Descrição -->
      <div class="wss-field">
        <label class="wss-field-label">Descrição</label>
        ${canEdit
          ? `<div class="wss-field-value wss-field-value--editable" data-wss-edit="description" title="Clique para editar">${_esc(description) || '<span style="color:var(--text-muted)">Adicionar descrição...</span>'}</div>`
          : `<div class="wss-field-value">${_esc(description) || '<span style="color:var(--text-muted)">Sem descrição</span>'}</div>`
        }
      </div>

      <!-- Ações -->
      <div class="wss-actions">
        <button class="wss-btn wss-btn--danger" data-wss-action="leave">
          <i data-lucide="log-out"></i>
          Sair do espaço
        </button>
        ${canEdit ? `
          <button class="wss-btn" data-wss-action="archive">
            <i data-lucide="archive"></i>
            Arquivar espaço
          </button>
        ` : ''}
      </div>
    `;
  }

  // ── Tab Membros ─────────────────────────────────────────────────────────

  function _renderTabMembros() {
    const canEdit = _isAdmin();
    const currentUid = _uid();

    // Filtrar membros pela busca (só filtra se não estiver adicionando)
    const filterQuery = _showAddMember ? '' : _searchFilter;
    const filtered = filterQuery
      ? _members.filter(m => {
        const q = filterQuery.toLowerCase();
        return (m.full_name || '').toLowerCase().includes(q) ||
               (m.email || '').toLowerCase().includes(q);
      })
      : _members;

    let html = '';

    // ── Seção de adicionar membro (sempre visível para admins, como Notion) ──
    if (canEdit) {
      html += _renderAddMemberForm();
    }

    // ── Toolbar de filtro (aparece quando há membros) ──
    if (_members.length > 0) {
      html += `<div class="wss-members-toolbar">
        <div class="wss-members-section-title">
          <span>Membros</span>
          <span class="wss-members-count">${_members.length}</span>
        </div>
        ${_members.length > 3 ? `<input type="text" class="wss-members-search" placeholder="Filtrar por nome ou email..." data-wss-member-search value="${_esc(filterQuery)}" />` : ''}
      </div>`;
    }

    // ── Lista de membros ──
    if (_members.length === 0 && !canEdit) {
      html += `<div class="wss-empty">
        <i data-lucide="users"></i>
        <div class="wss-empty-text">Nenhum membro neste espaço</div>
      </div>`;
    } else if (filtered.length === 0 && filterQuery) {
      html += `<div class="wss-empty">
        <i data-lucide="search"></i>
        <div class="wss-empty-text">Nenhum membro encontrado para "${_esc(filterQuery)}"</div>
      </div>`;
    } else if (filtered.length > 0) {
      html += '<div class="wss-member-list">';
      filtered.forEach(member => {
        const isMe = member.user_id === currentUid;
        const isLastOwner = member.role === 'owner' && _members.filter(m => m.role === 'owner').length <= 1;

        // Avatar
        const avatarContent = member.avatar_url
          ? `<img src="${_esc(member.avatar_url)}" alt="${_esc(member.full_name)}" />`
          : _initials(member.full_name);

        html += `<div class="wss-member-row" data-member-id="${_esc(member.user_id)}">
          <div class="wss-member-avatar">${avatarContent}</div>
          <div class="wss-member-info">
            <div class="wss-member-name">
              ${_esc(member.full_name)}
              ${isMe ? '<span class="wss-member-name-you">(você)</span>' : ''}
            </div>
            <div class="wss-member-email">${_esc(member.email)}</div>
          </div>
          <div class="wss-member-role">
            ${canEdit && !isLastOwner
              ? `<select class="wss-member-role-select" data-wss-role-change="${_esc(member.user_id)}">
                  <option value="owner" ${member.role === 'owner' ? 'selected' : ''}>Proprietário</option>
                  <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Administrador</option>
                  <option value="member" ${member.role === 'member' ? 'selected' : ''}>Membro</option>
                </select>`
              : `<span class="wss-member-role-badge${member.role === 'owner' ? ' wss-member-role-badge--owner' : ''}">${_roleLabel(member.role)}</span>`
            }
          </div>
          <div class="wss-member-actions">
            ${canEdit && !isMe && !isLastOwner
              ? `<button class="wss-member-remove-btn" data-wss-remove-member="${_esc(member.user_id)}" title="Remover membro">
                  <i data-lucide="x"></i>
                </button>`
              : ''
            }
          </div>
        </div>`;
      });
      html += '</div>';
    }

    // ── Convites pendentes ──
    if (_invitations.length > 0 && canEdit) {
      html += `<div class="wss-invitations-section">
        <div class="wss-invitations-title">Convites pendentes (${_invitations.length})</div>`;

      _invitations.forEach(inv => {
        html += `<div class="wss-invitation-row">
          <div class="wss-member-avatar" style="font-size:11px">✉</div>
          <div class="wss-invitation-email">${_esc(inv.email)}</div>
          <span class="wss-invitation-badge">Convidado</span>
          <span class="wss-member-role-badge">${_roleLabel(inv.role)}</span>
          <button class="wss-invitation-revoke-btn" data-wss-revoke-invitation="${_esc(inv.id)}">
            Revogar
          </button>
        </div>`;
      });

      html += '</div>';
    }

    return html;
  }

  // ── Formulário Add Member ───────────────────────────────────────────────

  function _renderAddMemberForm() {
    const selectedName = _selectedUser ? _esc(_selectedUser.full_name || _selectedUser.email) : '';
    const inputValue = _showAddMember ? selectedName : '';

    let html = `<div class="wss-add-member">
      <div class="wss-add-member-form">
        <div class="wss-add-member-input-wrap">
          <i data-lucide="user-plus" class="wss-add-member-icon"></i>
          <input type="text"
            class="wss-add-member-input"
            placeholder="Adicionar membros por nome ou email..."
            data-wss-add-input
            value="${inputValue}"
            autocomplete="off"
            spellcheck="false" />`;

    // Autocomplete dropdown
    if (_autocompleteResults.length > 0 || _showAddMember) {
      const hasResults = _autocompleteResults.length > 0;

      if (hasResults) {
        html += '<div class="wss-autocomplete">';
        _autocompleteResults.forEach(user => {
          const avatarContent = user.avatar_url
            ? `<img src="${_esc(user.avatar_url)}" alt="${_esc(user.full_name)}" />`
            : _initials(user.full_name);
          html += `<button class="wss-autocomplete-item" data-wss-select-user="${_esc(user.id)}">
            <div class="wss-autocomplete-avatar">${avatarContent}</div>
            <div class="wss-autocomplete-info">
              <span class="wss-autocomplete-name">${_esc(user.full_name || 'Sem nome')}</span>
              <span class="wss-autocomplete-email">${_esc(user.email)}</span>
            </div>
            <span class="wss-autocomplete-action">Adicionar</span>
          </button>`;
        });
        html += '</div>';
      }
    }

    // Mostrar controles de role + submit quando um usuário foi selecionado
    if (_selectedUser) {
      const avatarContent = _selectedUser.avatar_url
        ? `<img src="${_esc(_selectedUser.avatar_url)}" alt="${_esc(_selectedUser.full_name)}" />`
        : _initials(_selectedUser.full_name);

      html += `</div>
        <div class="wss-add-member-selected">
          <div class="wss-add-member-selected-user">
            <div class="wss-autocomplete-avatar">${avatarContent}</div>
            <span>${_esc(_selectedUser.full_name || _selectedUser.email)}</span>
            <button class="wss-add-member-clear" data-wss-clear-selection title="Limpar">
              <i data-lucide="x"></i>
            </button>
          </div>
          <select class="wss-add-member-role-select" data-wss-add-role>
            <option value="member">Membro</option>
            <option value="admin">Administrador</option>
          </select>
          <button class="wss-add-member-submit" data-wss-add-submit>
            Adicionar
          </button>
        </div>`;
    } else {
      html += '</div>';
    }

    html += `</div>
    </div>`;

    return html;
  }

  // ── Tab Segurança ─────────────────────────────────────────────────────

  function _renderTabSeguranca() {
    const spaceName = _esc(_spaceData?.name || 'Espaço');

    return `
      <!-- Política de entrada -->
      <div class="wss-field">
        <label class="wss-field-label">Política de entrada</label>
        <p class="wss-field-description">
          Defina quem pode acessar este espaço de equipe.
        </p>
        <div class="wss-security-options">
          <label class="wss-radio-option">
            <input type="radio" name="wss-entry-policy" value="invite" checked data-wss-entry-policy />
            <div class="wss-radio-content">
              <i data-lucide="lock" class="wss-radio-icon"></i>
              <div>
                <div class="wss-radio-label">Somente por convite</div>
                <div class="wss-radio-desc">Apenas membros convidados por admins podem acessar</div>
              </div>
            </div>
          </label>
          <label class="wss-radio-option">
            <input type="radio" name="wss-entry-policy" value="request" data-wss-entry-policy />
            <div class="wss-radio-content">
              <i data-lucide="hand" class="wss-radio-icon"></i>
              <div>
                <div class="wss-radio-label">Solicitar acesso</div>
                <div class="wss-radio-desc">Membros do tenant podem solicitar entrada (admin aprova)</div>
              </div>
            </div>
          </label>
          <label class="wss-radio-option">
            <input type="radio" name="wss-entry-policy" value="open" data-wss-entry-policy />
            <div class="wss-radio-content">
              <i data-lucide="globe" class="wss-radio-icon"></i>
              <div>
                <div class="wss-radio-label">Aberto</div>
                <div class="wss-radio-desc">Qualquer membro do tenant pode entrar livremente</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Permissões de membro -->
      <div class="wss-field">
        <label class="wss-field-label">Permissões de membros</label>
        <div class="wss-checkbox-group">
          <label class="wss-checkbox-option">
            <input type="checkbox" checked data-wss-perm="create-pages" />
            <span>Membros podem criar páginas</span>
          </label>
          <label class="wss-checkbox-option">
            <input type="checkbox" checked data-wss-perm="invite-members" />
            <span>Admins podem convidar membros</span>
          </label>
          <label class="wss-checkbox-option">
            <input type="checkbox" data-wss-perm="export-data" />
            <span>Membros podem exportar dados</span>
          </label>
        </div>
      </div>

      <!-- Registro de atividades -->
      <div class="wss-field">
        <label class="wss-field-label">Registro de atividades</label>
        <p class="wss-field-description">
          Últimas alterações neste espaço.
        </p>
        <div class="wss-audit-log" data-wss-audit-log>
          <div class="wss-audit-loading">
            <i data-lucide="loader" class="wss-spin"></i>
            Carregando registro de atividades...
          </div>
        </div>
      </div>

      <!-- Zona de perigo -->
      <div class="wss-field wss-danger-zone">
        <label class="wss-field-label wss-field-label--danger">Zona de perigo</label>
        <div class="wss-danger-actions">
          <div class="wss-danger-item">
            <div>
              <div class="wss-danger-item-title">Arquivar espaço</div>
              <div class="wss-danger-item-desc">Ocultar o espaço "${spaceName}" da sidebar. Pode ser revertido.</div>
            </div>
            <button class="wss-btn wss-btn--outline" data-wss-action="archive">
              <i data-lucide="archive"></i>
              Arquivar
            </button>
          </div>
          <div class="wss-danger-item">
            <div>
              <div class="wss-danger-item-title">Excluir espaço</div>
              <div class="wss-danger-item-desc">Excluir permanentemente "${spaceName}" e todo seu conteúdo.</div>
            </div>
            <button class="wss-btn wss-btn--danger" data-wss-action="delete">
              <i data-lucide="trash-2"></i>
              Excluir
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Refresh ─────────────────────────────────────────────────────────────

  function _refreshBody() {
    if (!_overlay) return;
    const body = _overlay.querySelector('[data-wss-body]');
    if (!body) return;
    body.innerHTML = _renderTabContent();
    if (window.lucide) lucide.createIcons({ root: body });
    _bindBodyEvents();
  }

  function _refreshTabs() {
    if (!_overlay) return;
    _overlay.querySelectorAll('[data-wss-tab]').forEach(tab => {
      const isActive = tab.dataset.wssTab === _activeTab;
      tab.classList.toggle('wss-tab--active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
  }

  function _updateHeaderMeta() {
    if (!_overlay) return;
    const meta = _overlay.querySelector('.wss-header-meta');
    if (meta) {
      const count = _members.length;
      meta.textContent = `${count} ${count === 1 ? 'membro' : 'membros'}`;
    }
  }

  // ── Focus Trap ──────────────────────────────────────────────────────────

  function _trapFocus(e) {
    if (!_overlay || !_isOpen) return;
    if (e.key !== 'Tab') return;

    const focusable = _overlay.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ── Event Handlers ──────────────────────────────────────────────────────

  function _onKeydown(e) {
    if (e.key === 'Escape' && _isOpen) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
    _trapFocus(e);
  }

  function _bindEvents() {
    if (!_overlay) return;

    // Fechar com X
    _overlay.querySelectorAll('[data-wss-close]').forEach(btn => {
      btn.addEventListener('click', close);
    });

    // Backdrop
    const backdrop = _overlay.querySelector('.wss-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', close);
    }

    // Tabs
    _overlay.querySelectorAll('[data-wss-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const newTab = tab.dataset.wssTab;
        if (newTab !== _activeTab) {
          _activeTab = newTab;
          _showAddMember = false;
          _autocompleteResults = [];
          _selectedUser = null;
          _searchFilter = '';
          _refreshTabs();
          _refreshBody();
        }
      });
    });

    // ESC + Focus trap
    document.addEventListener('keydown', _onKeydown);

    // Bind events nos conteúdos do body
    _bindBodyEvents();
  }

  function _unbindEvents() {
    document.removeEventListener('keydown', _onKeydown);
    if (_autocompleteTimer) clearTimeout(_autocompleteTimer);
  }

  /** Bind eventos dinâmicos dentro do body (re-bind a cada refresh) */
  function _bindBodyEvents() {
    if (!_overlay) return;
    const body = _overlay.querySelector('[data-wss-body]');
    if (!body) return;

    // ── Tab Geral: editar nome/descrição ──
    body.querySelectorAll('[data-wss-edit]').forEach(el => {
      el.addEventListener('click', () => _handleInlineEdit(el));
    });

    // ── Tab Geral: ícone (Icon Picker) ──
    const iconTrigger = body.querySelector('[data-wss-icon-trigger]');
    if (iconTrigger && _isAdmin()) {
      iconTrigger.addEventListener('click', () => {
        if (typeof TBO_ICON_PICKER !== 'undefined') {
          TBO_ICON_PICKER.open(iconTrigger, {
            currentIcon: _spaceData?.icon_value || _spaceData?.icon || 'folder',
            iconType: _spaceData?.icon_type || 'lucide',
            onSelect: async (icon) => {
              // icon = { type: 'lucide'|'emoji'|'upload', value: string, url?: string }
              try {
                await SpaceRepo.updateIcon(_spaceId, {
                  icon_type: icon.type,
                  icon_value: icon.value,
                  icon_url: icon.url || null
                });
                // Atualizar cache local
                _spaceData.icon_type = icon.type;
                _spaceData.icon_value = icon.value;
                _spaceData.icon_url = icon.url || null;
                // Atualizar header do overlay
                _updateHeaderIcon();
                // Atualizar sidebar
                _updateSidebarIcon(_spaceId, icon);
                _refreshBody();
                if (typeof TBO_TOAST !== 'undefined') {
                  TBO_TOAST.success('Ícone atualizado', 'Novo ícone salvo com sucesso');
                }
              } catch (err) {
                console.error('[WS Settings] Erro ao atualizar ícone:', err);
                if (typeof TBO_TOAST !== 'undefined') {
                  TBO_TOAST.error('Erro', 'Não foi possível atualizar o ícone');
                }
              }
            },
            onRemove: async () => {
              try {
                await SpaceRepo.updateIcon(_spaceId, {
                  icon_type: 'lucide',
                  icon_value: 'folder',
                  icon_url: null
                });
                _spaceData.icon_type = 'lucide';
                _spaceData.icon_value = 'folder';
                _spaceData.icon_url = null;
                _updateHeaderIcon();
                _updateSidebarIcon(_spaceId, { type: 'lucide', value: 'folder' });
                _refreshBody();
                if (typeof TBO_TOAST !== 'undefined') {
                  TBO_TOAST.success('Ícone removido', 'Ícone padrão restaurado');
                }
              } catch (err) {
                console.error('[WS Settings] Erro ao remover ícone:', err);
                if (typeof TBO_TOAST !== 'undefined') {
                  TBO_TOAST.error('Erro', 'Não foi possível remover o ícone');
                }
              }
            }
          });
        } else {
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.info('Em breve', 'Seletor de ícones não disponível');
          }
        }
      });
    }

    // ── Tab Geral: ações ──
    body.querySelectorAll('[data-wss-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.wssAction;
        _handleAction(action);
      });
    });

    // ── Tab Membros: busca ──
    const memberSearch = body.querySelector('[data-wss-member-search]');
    if (memberSearch) {
      memberSearch.addEventListener('input', (e) => {
        _searchFilter = e.target.value.trim();
        _refreshBody();
        // Re-focar no input depois do refresh
        const newInput = _overlay?.querySelector('[data-wss-member-search]');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        }
      });
    }

    // ── Tab Membros: clear selection ──
    const clearBtn = body.querySelector('[data-wss-clear-selection]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        _selectedUser = null;
        _autocompleteResults = [];
        _showAddMember = false;
        _refreshBody();
        setTimeout(() => {
          const addInput = _overlay?.querySelector('[data-wss-add-input]');
          if (addInput) addInput.focus();
        }, 50);
      });
    }

    // ── Tab Membros: adicionar membro input (autocomplete) ──
    const addInput = body.querySelector('[data-wss-add-input]');
    if (addInput) {
      addInput.addEventListener('focus', () => {
        _showAddMember = true;
      });

      addInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        _selectedUser = null;
        _showAddMember = true;
        if (_autocompleteTimer) clearTimeout(_autocompleteTimer);

        if (query.length < 2) {
          _autocompleteResults = [];
          _refreshBody();
          // Re-focar
          const newInput = _overlay?.querySelector('[data-wss-add-input]');
          if (newInput) {
            newInput.focus();
            newInput.setSelectionRange(newInput.value.length, newInput.value.length);
          }
          return;
        }

        _autocompleteTimer = setTimeout(async () => {
          try {
            const results = await SpaceRepo.searchTenantUsers(query);
            // Filtrar quem já é membro
            const memberIds = _members.map(m => m.user_id);
            _autocompleteResults = results.filter(u => !memberIds.includes(u.id));
            _refreshBody();
            // Re-focar no input
            const newInput = _overlay?.querySelector('[data-wss-add-input]');
            if (newInput) {
              newInput.focus();
              newInput.value = query;
              newInput.setSelectionRange(query.length, query.length);
            }
          } catch (_e) {
            _autocompleteResults = [];
          }
        }, 300);
      });

      // ESC no input fecha autocomplete
      addInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          if (_autocompleteResults.length > 0) {
            _autocompleteResults = [];
            _refreshBody();
            const newInput = _overlay?.querySelector('[data-wss-add-input]');
            if (newInput) newInput.focus();
          }
        }
      });
    }

    // ── Tab Membros: selecionar usuário do autocomplete ──
    body.querySelectorAll('[data-wss-select-user]').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.wssSelectUser;
        const user = _autocompleteResults.find(u => u.id === userId);
        if (user) {
          _selectedUser = user;
          _autocompleteResults = [];
          _refreshBody();
        }
      });
    });

    // ── Tab Membros: submit adicionar membro ──
    const addSubmit = body.querySelector('[data-wss-add-submit]');
    if (addSubmit) {
      addSubmit.addEventListener('click', _handleAddMember);
    }

    // ── Tab Membros: alterar role ──
    body.querySelectorAll('[data-wss-role-change]').forEach(select => {
      select.addEventListener('change', async (e) => {
        const userId = select.dataset.wssRoleChange;
        const newRole = e.target.value;
        await _handleRoleChange(userId, newRole);
      });
    });

    // ── Tab Membros: remover membro ──
    body.querySelectorAll('[data-wss-remove-member]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.wssRemoveMember;
        await _handleRemoveMember(userId);
      });
    });

    // ── Tab Membros: revogar convite ──
    body.querySelectorAll('[data-wss-revoke-invitation]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const invId = btn.dataset.wssRevokeInvitation;
        await _handleRevokeInvitation(invId);
      });
    });

    // ── Tab Segurança: carregar audit log ──
    if (_activeTab === 'seguranca') {
      _loadAuditLog();

      // Salvar política de entrada ao mudar
      body.querySelectorAll('[data-wss-entry-policy]').forEach(radio => {
        radio.addEventListener('change', async (e) => {
          const policy = e.target.value;
          try {
            await SpaceRepo.update(_spaceId, { entry_policy: policy });
            if (typeof TBO_TOAST !== 'undefined') {
              const labels = { invite: 'Somente por convite', request: 'Solicitar acesso', open: 'Aberto' };
              TBO_TOAST.success('Política atualizada', labels[policy] || policy);
            }
          } catch (err) {
            console.error('[WS Settings] Erro ao salvar política:', err);
            if (typeof TBO_TOAST !== 'undefined') {
              TBO_TOAST.error('Erro', 'Não foi possível salvar a política');
            }
          }
        });
      });

      // Salvar permissões ao mudar
      body.querySelectorAll('[data-wss-perm]').forEach(cb => {
        cb.addEventListener('change', () => {
          // Coletar todas as permissões ativas
          const perms = {};
          body.querySelectorAll('[data-wss-perm]').forEach(el => {
            perms[el.dataset.wssPerm] = el.checked;
          });
          // Salvar (fire-and-forget)
          SpaceRepo.update(_spaceId, { permissions: perms }).catch(err => {
            console.error('[WS Settings] Erro ao salvar permissões:', err);
          });
        });
      });
    }
  }

  // ── Audit Log ──────────────────────────────────────────────────────────

  async function _loadAuditLog() {
    const logContainer = _overlay?.querySelector('[data-wss-audit-log]');
    if (!logContainer) return;

    try {
      let logs = [];
      // Usar AuditRepo se disponível
      if (typeof AuditRepo !== 'undefined' && typeof AuditRepo.getByTarget === 'function') {
        logs = await AuditRepo.getByTarget(_spaceId, 20);
      }

      if (logs.length === 0) {
        logContainer.innerHTML = `
          <div class="wss-audit-empty">
            <i data-lucide="file-text"></i>
            <span>Nenhuma atividade registrada</span>
          </div>
        `;
      } else {
        let html = '';
        logs.forEach(log => {
          const date = log.created_at ? new Date(log.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : '';
          const userName = log.user_name || log.actor_name || 'Usuário';
          const action = log.action || log.event || 'ação';
          html += `<div class="wss-audit-entry">
            <div class="wss-audit-entry-icon"><i data-lucide="activity"></i></div>
            <div class="wss-audit-entry-content">
              <span class="wss-audit-entry-actor">${_esc(userName)}</span>
              <span class="wss-audit-entry-action">${_esc(action)}</span>
            </div>
            <div class="wss-audit-entry-time">${_esc(date)}</div>
          </div>`;
        });
        logContainer.innerHTML = html;
      }

      if (window.lucide) lucide.createIcons({ root: logContainer });
    } catch (err) {
      console.error('[WS Settings] Erro ao carregar audit log:', err);
      logContainer.innerHTML = `
        <div class="wss-audit-empty">
          <i data-lucide="alert-circle"></i>
          <span>Erro ao carregar registro</span>
        </div>
      `;
      if (window.lucide) lucide.createIcons({ root: logContainer });
    }
  }

  // ── Ações ───────────────────────────────────────────────────────────────

  function _handleAction(action) {
    switch (action) {
    case 'leave':
      _handleLeave();
      break;
    case 'archive':
      _handleArchive();
      break;
    case 'delete':
      _handleDeleteFromSettings();
      break;
    case 'toggle-add-member':
      _showAddMember = true;
      _selectedUser = null;
      _autocompleteResults = [];
      _refreshBody();
      setTimeout(() => {
        const addInput = _overlay?.querySelector('[data-wss-add-input]');
        if (addInput) addInput.focus();
      }, 50);
      break;
    }
  }

  // ── Delete via Settings (Segurança tab) ────────────────────────────────

  function _handleDeleteFromSettings() {
    const spaceName = _spaceData?.name || 'Espaço';

    if (typeof TBO_DELETE_CONFIRM !== 'undefined') {
      TBO_DELETE_CONFIRM.open({
        name: spaceName,
        onConfirm: async () => {
          try {
            const uid = _uid();
            await SpaceRepo.softDelete(_spaceId, uid);
            close();
            if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') await TBO_SIDEBAR_SERVICE.refresh();
            if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') TBO_SIDEBAR_RENDERER.render();
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Excluído', `"${spaceName}" foi removido`);
          } catch (err) {
            console.error('[WS Settings] Erro ao excluir:', err);
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', err.message || 'Não foi possível excluir');
          }
        }
      });
    } else {
      // Fallback
      const input = window.prompt(`Para excluir "${spaceName}", digite o nome:`);
      if (!input || input.trim() !== spaceName) return;
      (async () => {
        try {
          const uid = _uid();
          await SpaceRepo.softDelete(_spaceId, uid);
          close();
          if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') await TBO_SIDEBAR_SERVICE.refresh();
          if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') TBO_SIDEBAR_RENDERER.render();
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Excluído', `"${spaceName}" foi removido`);
        } catch (err) {
          console.error('[WS Settings] Erro ao excluir:', err);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', err.message || 'Não foi possível excluir');
        }
      })();
    }
  }

  // ── Atualizar ícone no header do overlay ────────────────────────────────

  function _updateHeaderIcon() {
    if (!_overlay) return;
    const iconEl = _overlay.querySelector('.wss-header-icon');
    if (!iconEl) return;
    const iconType = _spaceData?.icon_type || 'lucide';
    const iconValue = _spaceData?.icon_value || 'folder';
    if (iconType === 'emoji') {
      iconEl.innerHTML = _esc(iconValue);
      iconEl.className = 'wss-header-icon';
    } else if (iconType === 'upload' && _spaceData?.icon_url) {
      iconEl.innerHTML = `<img src="${_esc(_spaceData.icon_url)}" alt="Ícone" style="width:100%;height:100%;object-fit:cover;border-radius:6px" />`;
      iconEl.className = 'wss-header-icon';
    } else {
      iconEl.innerHTML = `<i data-lucide="${_esc(iconValue)}"></i>`;
      iconEl.className = 'wss-header-icon';
      if (window.lucide) lucide.createIcons({ root: iconEl });
    }
  }

  // ── Atualizar ícone na sidebar ─────────────────────────────────────────

  function _updateSidebarIcon(spaceId, icon) {
    const wsEl = document.querySelector(`.nsb-workspace[data-item-id="${spaceId}"]`);
    if (!wsEl) return;
    const iconContainer = wsEl.querySelector('.nsb-ws-icon');
    if (!iconContainer) return;

    if (icon.type === 'emoji') {
      iconContainer.innerHTML = `<span>${_esc(icon.value)}</span>`;
    } else if (icon.type === 'upload' && icon.url) {
      iconContainer.innerHTML = `<img src="${_esc(icon.url)}" alt="" style="width:18px;height:18px;object-fit:cover;border-radius:3px" />`;
    } else {
      iconContainer.innerHTML = `<i data-lucide="${_esc(icon.value)}"></i>`;
      if (window.lucide) lucide.createIcons({ root: iconContainer });
    }

    // Refresh sidebar service cache
    if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
      TBO_SIDEBAR_SERVICE.refresh();
    }
  }

  // ── Archive ────────────────────────────────────────────────────────────

  async function _handleArchive() {
    const spaceName = _spaceData?.name || 'Espaço';
    if (!window.confirm(`Deseja arquivar o espaço "${spaceName}"? Ele ficará oculto na sidebar.`)) {
      return;
    }

    try {
      const uid = _uid();
      await SpaceRepo.archive(_spaceId, uid);
      close();

      // Refresh sidebar
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
      console.error('[WS Settings] Erro ao arquivar:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', err.message || 'Não foi possível arquivar o espaço');
      }
    }
  }

  // ── Inline Edit (nome, descrição) ───────────────────────────────────────

  function _handleInlineEdit(el) {
    if (!_isAdmin()) return;

    const field = el.dataset.wssEdit;
    const currentValue = field === 'name'
      ? (_spaceData?.name || '')
      : (_spaceData?.description || '');

    if (field === 'description') {
      // Textarea para descrição
      const textarea = document.createElement('textarea');
      textarea.className = 'wss-field-textarea';
      textarea.value = currentValue;
      textarea.placeholder = 'Adicionar descrição...';
      textarea.rows = 3;

      el.innerHTML = '';
      el.appendChild(textarea);
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      const save = async () => {
        const newVal = textarea.value.trim();
        try {
          await SpaceRepo.update(_spaceId, { description: newVal });
          _spaceData.description = newVal;
          _refreshBody();
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.success('Salvo', 'Descrição atualizada');
          }
        } catch (err) {
          console.error('[WS Settings] Erro ao salvar descrição:', err);
          _refreshBody();
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.error('Erro', 'Não foi possível salvar a descrição');
          }
        }
      };

      textarea.addEventListener('blur', save);
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          textarea.removeEventListener('blur', save);
          _refreshBody();
        }
      });
    } else {
      // Input para nome
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'wss-field-input';
      input.value = currentValue;
      input.placeholder = 'Nome do espaço';
      input.maxLength = 60;

      el.innerHTML = '';
      el.appendChild(input);
      input.focus();
      input.select();

      const save = async () => {
        const newVal = input.value.trim();
        if (!newVal) {
          _refreshBody();
          return;
        }
        if (newVal.length > 60) {
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.warning('Limite', 'Nome deve ter no máximo 60 caracteres');
          }
          return;
        }
        try {
          await SpaceRepo.rename(_spaceId, newVal);
          _spaceData.name = newVal;

          // Atualizar header do overlay
          const headerName = _overlay?.querySelector('.wss-header-name');
          if (headerName) headerName.textContent = newVal;

          // Atualizar nome na sidebar
          const sidebarName = document.querySelector(`.nsb-workspace[data-item-id="${_spaceId}"] .nsb-ws-name`);
          if (sidebarName) sidebarName.textContent = newVal;

          // Refresh sidebar service cache
          if (typeof TBO_SIDEBAR_SERVICE !== 'undefined') {
            TBO_SIDEBAR_SERVICE.refresh();
          }

          _refreshBody();
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.success('Salvo', `Espaço renomeado para "${newVal}"`);
          }
        } catch (err) {
          console.error('[WS Settings] Erro ao renomear:', err);
          _refreshBody();
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.error('Erro', 'Não foi possível renomear o espaço');
          }
        }
      };

      input.addEventListener('blur', save);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        if (e.key === 'Escape') {
          e.preventDefault();
          input.removeEventListener('blur', save);
          _refreshBody();
        }
      });
    }
  }

  // ── Leave ───────────────────────────────────────────────────────────────

  async function _handleLeave() {
    const uid = _uid();
    if (!uid) return;

    try {
      const myRole = await SpaceRepo.getMyRole(_spaceId);
      if (myRole === 'owner') {
        const ownerCount = await SpaceRepo.countOwners(_spaceId);
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

      const spaceName = _spaceData?.name || 'este espaço';
      if (!window.confirm(`Deseja sair do espaço "${spaceName}"? Você perderá o acesso ao conteúdo.`)) {
        return;
      }

      await SpaceRepo.removeMember(_spaceId, uid);
      close();

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
      console.error('[WS Settings] Erro ao sair:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', err.message || 'Não foi possível sair do espaço');
      }
    }
  }

  // ── Add Member ──────────────────────────────────────────────────────────

  async function _handleAddMember() {
    if (!_selectedUser) return;

    const roleSelect = _overlay?.querySelector('[data-wss-add-role]');
    const role = roleSelect?.value || 'member';

    try {
      await SpaceRepo.addMember(_spaceId, _selectedUser.id, role);

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Membro adicionado', `${_selectedUser.full_name || _selectedUser.email} foi adicionado`);
      }

      // Resetar form
      _selectedUser = null;
      _autocompleteResults = [];
      _showAddMember = false;

      // Recarregar membros
      _members = await _loadMembers(_spaceId);
      _updateHeaderMeta();
      _refreshBody();
    } catch (err) {
      console.error('[WS Settings] Erro ao adicionar membro:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', err.message || 'Não foi possível adicionar o membro');
      }
    }
  }

  // ── Role Change ─────────────────────────────────────────────────────────

  async function _handleRoleChange(userId, newRole) {
    try {
      await SpaceRepo.updateMemberRole(_spaceId, userId, newRole);

      // Atualizar cache local
      const member = _members.find(m => m.user_id === userId);
      if (member) member.role = newRole;

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Função atualizada', `${member?.full_name || 'Membro'} agora é ${_roleLabel(newRole)}`);
      }

      _refreshBody();
    } catch (err) {
      console.error('[WS Settings] Erro ao alterar função:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', err.message || 'Não foi possível alterar a função');
      }
      // Reverter no UI
      _refreshBody();
    }
  }

  // ── Remove Member ───────────────────────────────────────────────────────

  async function _handleRemoveMember(userId) {
    const member = _members.find(m => m.user_id === userId);
    const name = member?.full_name || 'este membro';

    if (!window.confirm(`Remover ${name} do espaço?`)) return;

    try {
      await SpaceRepo.removeMember(_spaceId, userId);

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Membro removido', `${name} foi removido do espaço`);
      }

      // Recarregar membros
      _members = await _loadMembers(_spaceId);
      _updateHeaderMeta();
      _refreshBody();
    } catch (err) {
      console.error('[WS Settings] Erro ao remover membro:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', err.message || 'Não foi possível remover o membro');
      }
    }
  }

  // ── Revoke Invitation ───────────────────────────────────────────────────

  async function _handleRevokeInvitation(invId) {
    if (!window.confirm('Revogar este convite?')) return;

    try {
      await SpaceRepo.cancelInvitation(invId);

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Convite revogado', 'O convite foi cancelado');
      }

      // Recarregar convites
      _invitations = await _loadInvitations(_spaceId);
      _refreshBody();
    } catch (err) {
      console.error('[WS Settings] Erro ao revogar convite:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', err.message || 'Não foi possível revogar o convite');
      }
    }
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  /**
   * Abre o overlay de configurações para um workspace
   * @param {string} spaceId - UUID do sidebar_item (workspace)
   * @param {string} [initialTab='geral'] - Tab inicial ('geral' ou 'membros')
   */
  async function open(spaceId, initialTab) {
    if (_isOpen) close();

    _spaceId = spaceId;
    _activeTab = initialTab || 'geral';
    _searchFilter = '';
    _showAddMember = false;
    _autocompleteResults = [];
    _selectedUser = null;
    _triggerEl = document.activeElement;

    // Carregar dados em paralelo
    const [spaceData, userRole, members, invitations] = await Promise.all([
      _loadSpaceData(spaceId),
      _resolveUserRole(spaceId),
      _loadMembers(spaceId),
      _loadInvitations(spaceId)
    ]);

    _spaceData = spaceData || { name: 'Espaço', description: '' };
    _userRole = userRole;
    _members = members;
    _invitations = invitations;

    // Se abriu com initialTab='membros', o form de add já é visível por padrão

    // Criar DOM
    const wrapper = document.createElement('div');
    wrapper.id = 'wssOverlayRoot';
    wrapper.innerHTML = _buildOverlayHTML();
    document.body.appendChild(wrapper);

    _overlay = wrapper.querySelector('.wss-overlay');
    _isOpen = true;

    // Atualizar trigger ARIA
    if (_triggerEl) {
      _triggerEl.setAttribute('aria-expanded', 'true');
    }

    // Ícones Lucide
    if (window.lucide) lucide.createIcons({ root: _overlay });

    // Bind events
    _bindEvents();

    // Block body scroll
    document.body.style.overflow = 'hidden';

    // Animar entrada
    requestAnimationFrame(() => {
      _overlay.classList.add('wss-overlay--open');

      // Focar no input correto
      if (_activeTab === 'membros' && _showAddMember) {
        setTimeout(() => {
          const addInput = _overlay?.querySelector('[data-wss-add-input]');
          if (addInput) addInput.focus();
        }, 50);
      }
    });
  }

  function close() {
    if (!_isOpen || !_overlay) return;

    _overlay.classList.remove('wss-overlay--open');
    _overlay.classList.add('wss-overlay--closing');

    // Atualizar trigger ARIA
    if (_triggerEl) {
      _triggerEl.setAttribute('aria-expanded', 'false');
    }

    _unbindEvents();
    document.body.style.overflow = '';

    // Animar saída
    setTimeout(() => {
      const root = document.getElementById('wssOverlayRoot');
      if (root) root.remove();
      _overlay = null;
      _isOpen = false;
      _spaceId = null;
      _spaceData = null;
      _userRole = null;
      _activeTab = 'geral';
      _members = [];
      _invitations = [];
      _searchFilter = '';
      _showAddMember = false;
      _autocompleteResults = [];
      _selectedUser = null;

      // Devolver foco ao trigger
      if (_triggerEl && _triggerEl.isConnected) {
        _triggerEl.focus();
        _triggerEl = null;
      }
    }, 200);
  }

  return {
    open,
    close,
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_WS_SETTINGS = TBO_WS_SETTINGS;
}
