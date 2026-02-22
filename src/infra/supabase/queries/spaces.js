/**
 * TBO OS — SpaceRepo (Workspace CRUD + Members + Invitations)
 *
 * Repositório para operações de workspaces (espaços de equipe).
 * Gerencia: sidebar_items (workspace), space_members, space_invitations.
 *
 * Segue padrão de FinanceRepo/ProjectsRepo (IIFE singleton + RepoBase).
 *
 * API:
 *   SpaceRepo.getById(id)
 *   SpaceRepo.update(id, data)
 *   SpaceRepo.rename(id, newName)
 *   SpaceRepo.updateIcon(id, { icon_type, icon_value, icon_url })
 *   SpaceRepo.archive(id, userId) ............ Entrega 2
 *   SpaceRepo.softDelete(id, userId) ......... Entrega 2
 *   SpaceRepo.duplicate(sourceId, newName) ... Entrega 2
 *   SpaceRepo.listMembers(spaceId)
 *   SpaceRepo.addMember(spaceId, userId, role)
 *   SpaceRepo.updateMemberRole(spaceId, userId, newRole)
 *   SpaceRepo.removeMember(spaceId, userId)
 *   SpaceRepo.getMyRole(spaceId)
 *   SpaceRepo.countOwners(spaceId)
 *   SpaceRepo.createInvitation(spaceId, email, role)
 *   SpaceRepo.listInvitations(spaceId)
 *   SpaceRepo.cancelInvitation(invitationId)
 *   SpaceRepo.searchTenantUsers(query)
 *   SpaceRepo.getRecentIcons(limit)
 *   SpaceRepo.addRecentIcon(iconType, iconValue)
 */

const SpaceRepo = (() => {
  'use strict';

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _db() {
    return RepoBase.getDb();
  }

  function _tid() {
    return RepoBase.requireTenantId();
  }

  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      return user?.supabaseId || user?.id || null;
    }
    return null;
  }

  /**
   * Verifica se o usuário atual é super admin (acesso total irrestrito)
   * @private
   */
  function _isSuperAdmin() {
    if (typeof TBO_PERMISSIONS !== 'undefined') {
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      return user && TBO_PERMISSIONS.isSuperAdmin(user.email);
    }
    return false;
  }

  // ── Workspace CRUD ──────────────────────────────────────────────────────

  /**
   * Busca workspace por ID
   * @param {string} id - UUID do sidebar_item
   * @returns {Object|null}
   */
  async function getById(id) {
    const { data, error } = await _db().from('sidebar_items')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', _tid())
      .single();

    if (error) {
      console.warn('[SpaceRepo] getById erro:', error.message);
      return null;
    }
    return data;
  }

  /**
   * Atualiza campos de um workspace
   * @param {string} id - UUID do sidebar_item
   * @param {Object} updates - campos a atualizar
   * @returns {Object|null}
   */
  async function update(id, updates) {
    const { data, error } = await _db().from('sidebar_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', _tid())
      .select()
      .single();

    if (error) {
      console.error('[SpaceRepo] update erro:', error.message);
      throw error;
    }
    return data;
  }

  /**
   * Renomeia um workspace
   * @param {string} id
   * @param {string} newName
   */
  async function rename(id, newName) {
    const trimmed = (newName || '').trim();
    if (!trimmed) throw new Error('Nome não pode ser vazio');
    if (trimmed.length > 60) throw new Error('Nome deve ter no máximo 60 caracteres');
    return update(id, { name: trimmed });
  }

  /**
   * Atualiza ícone do workspace
   * @param {string} id
   * @param {Object} iconData - { icon_type, icon_value, icon_url }
   */
  async function updateIcon(id, { icon_type, icon_value, icon_url }) {
    const updates = { icon_type: icon_type || 'none' };
    if (icon_type === 'lucide' || icon_type === 'emoji') {
      updates.icon_value = icon_value || null;
      updates.icon_url = null;
      // Também atualizar campo icon legado para compatibilidade
      if (icon_type === 'lucide' && icon_value) {
        updates.icon = icon_value;
      }
    } else if (icon_type === 'upload') {
      updates.icon_url = icon_url || null;
      updates.icon_value = null;
    } else {
      // none — limpar tudo
      updates.icon_value = null;
      updates.icon_url = null;
      updates.icon = 'folder';
    }
    return update(id, updates);
  }

  /**
   * Arquivar workspace (soft)
   * @param {string} id
   * @param {string} userId
   */
  async function archive(id, userId) {
    return update(id, {
      archived_at: new Date().toISOString(),
      archived_by: userId,
      is_visible: false
    });
  }

  /**
   * Soft delete do workspace
   * @param {string} id
   * @param {string} userId
   */
  async function softDelete(id, userId) {
    return update(id, {
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
      is_visible: false
    });
  }

  /**
   * Duplicar workspace (config + membros, sem páginas)
   * @param {string} sourceId
   * @param {string} [newName]
   * @returns {Object} novo workspace
   */
  async function duplicate(sourceId, newName) {
    const tid = _tid();
    const source = await getById(sourceId);
    if (!source) throw new Error('Workspace não encontrado');

    // Criar cópia do workspace
    const { data: newSpace, error } = await _db().from('sidebar_items')
      .insert({
        tenant_id: tid,
        parent_id: source.parent_id,
        name: newName || `${source.name} (cópia)`,
        type: 'workspace',
        order_index: source.order_index + 1,
        icon: source.icon,
        icon_type: source.icon_type,
        icon_value: source.icon_value,
        icon_url: source.icon_url,
        description: source.description || '',
        allowed_roles: source.allowed_roles || [],
        metadata: source.metadata || {},
        is_visible: true,
        is_expanded: true
      })
      .select()
      .single();

    if (error) {
      console.error('[SpaceRepo] duplicate erro:', error.message);
      throw error;
    }

    // Copiar membros (owners e admins)
    const members = await listMembers(sourceId);
    if (members && members.length > 0) {
      const uid = _uid();
      const memberInserts = members
        .filter(m => m.role === 'owner' || m.role === 'admin')
        .map(m => ({
          tenant_id: tid,
          space_id: newSpace.id,
          user_id: m.user_id,
          role: m.role,
          invited_by: uid
        }));

      if (memberInserts.length > 0) {
        await _db().from('space_members').insert(memberInserts);
      }
    }

    return newSpace;
  }

  // ── Members ─────────────────────────────────────────────────────────────

  /**
   * Lista membros de um workspace com dados de perfil
   * @param {string} spaceId
   * @returns {Array}
   */
  async function listMembers(spaceId) {
    // 1) Buscar membros do espaço
    const { data: members, error } = await _db().from('space_members')
      .select('id, space_id, user_id, role, joined_at, created_at')
      .eq('space_id', spaceId)
      .eq('tenant_id', _tid())
      .order('role', { ascending: true })
      .order('joined_at', { ascending: true });

    if (error) {
      console.warn('[SpaceRepo] listMembers erro:', error.message);
      return [];
    }

    if (!members || members.length === 0) return [];

    // 2) Buscar perfis dos membros separadamente (sem FK join)
    const userIds = members.map(m => m.user_id).filter(Boolean);
    let profilesMap = {};

    if (userIds.length > 0) {
      const { data: profiles, error: profError } = await _db().from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      if (!profError && profiles) {
        profiles.forEach(p => { profilesMap[p.id] = p; });
      }
    }

    // 3) Combinar dados
    return members.map(m => {
      const profile = profilesMap[m.user_id];
      return {
        id: m.id,
        space_id: m.space_id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        full_name: profile?.full_name || 'Sem nome',
        email: profile?.email || '',
        avatar_url: profile?.avatar_url || null
      };
    });
  }

  /**
   * Adiciona membro a um workspace
   * @param {string} spaceId
   * @param {string} userId
   * @param {string} [role='member']
   */
  async function addMember(spaceId, userId, role = 'member') {
    const uid = _uid();
    const { data, error } = await _db().from('space_members')
      .insert({
        tenant_id: _tid(),
        space_id: spaceId,
        user_id: userId,
        role,
        invited_by: uid
      })
      .select()
      .single();

    if (error) {
      // Verificar duplicata
      if (error.code === '23505') {
        throw new Error('Usuário já é membro deste espaço');
      }
      console.error('[SpaceRepo] addMember erro:', error.message);
      throw error;
    }
    return data;
  }

  /**
   * Atualiza role de um membro
   * @param {string} spaceId
   * @param {string} userId
   * @param {string} newRole
   */
  async function updateMemberRole(spaceId, userId, newRole) {
    // Validar: não rebaixar último owner
    if (newRole !== 'owner') {
      const currentMember = await _getMember(spaceId, userId);
      if (currentMember?.role === 'owner') {
        const ownerCount = await countOwners(spaceId);
        if (ownerCount <= 1) {
          throw new Error('Não é possível rebaixar o último proprietário');
        }
      }
    }

    const { data, error } = await _db().from('space_members')
      .update({ role: newRole })
      .eq('space_id', spaceId)
      .eq('user_id', userId)
      .eq('tenant_id', _tid())
      .select()
      .single();

    if (error) {
      console.error('[SpaceRepo] updateMemberRole erro:', error.message);
      throw error;
    }
    return data;
  }

  /**
   * Remove membro de um workspace
   * @param {string} spaceId
   * @param {string} userId
   */
  async function removeMember(spaceId, userId) {
    const { error } = await _db().from('space_members')
      .delete()
      .eq('space_id', spaceId)
      .eq('user_id', userId)
      .eq('tenant_id', _tid());

    if (error) {
      console.error('[SpaceRepo] removeMember erro:', error.message);
      throw error;
    }
  }

  /**
   * Retorna role do usuário atual em um workspace
   * @param {string} spaceId
   * @returns {string|null} 'owner', 'admin', 'member', ou null
   */
  async function getMyRole(spaceId) {
    const uid = _uid();
    if (!uid) return null;

    // Super admins SEMPRE são owners em qualquer workspace
    if (_isSuperAdmin()) return 'owner';

    // Verificar se é owner/admin do tenant (bypass)
    const userRole = _getTenantRole();
    if (userRole === 'owner' || userRole === 'admin') {
      // Tenant owners/admins têm acesso de owner em todos os espaços
      return 'owner';
    }

    const member = await _getMember(spaceId, uid);
    return member?.role || null;
  }

  /**
   * Conta quantos owners existem em um workspace
   * @param {string} spaceId
   * @returns {number}
   */
  async function countOwners(spaceId) {
    const { count, error } = await _db().from('space_members')
      .select('id', { count: 'exact', head: true })
      .eq('space_id', spaceId)
      .eq('tenant_id', _tid())
      .eq('role', 'owner');

    if (error) {
      console.warn('[SpaceRepo] countOwners erro:', error.message);
      return 0;
    }
    return count || 0;
  }

  /**
   * Busca membro específico
   * @private
   */
  async function _getMember(spaceId, userId) {
    const { data, error } = await _db().from('space_members')
      .select('id, role')
      .eq('space_id', spaceId)
      .eq('user_id', userId)
      .eq('tenant_id', _tid())
      .maybeSingle();

    if (error) return null;
    return data;
  }

  /**
   * Retorna role do usuário no tenant (owner, admin, etc.)
   * @private
   */
  function _getTenantRole() {
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      if (user) {
        // Super admins sempre retornam 'owner'
        if (_isSuperAdmin()) return 'owner';
        const roleMap = { 'socio': 'owner', 'founder': 'owner' };
        const role = user.role || user.role_slug || 'viewer';
        return roleMap[role] || role;
      }
    }
    return 'viewer';
  }

  // ── Invitations ─────────────────────────────────────────────────────────

  /**
   * Cria convite para um espaço
   * @param {string} spaceId
   * @param {string} email
   * @param {string} [role='member']
   */
  async function createInvitation(spaceId, email, role = 'member') {
    const uid = _uid();
    const { data, error } = await _db().from('space_invitations')
      .insert({
        tenant_id: _tid(),
        space_id: spaceId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: uid,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Convite já enviado para este email');
      }
      console.error('[SpaceRepo] createInvitation erro:', error.message);
      throw error;
    }
    return data;
  }

  /**
   * Lista convites pendentes de um espaço
   * @param {string} spaceId
   * @returns {Array}
   */
  async function listInvitations(spaceId) {
    const { data, error } = await _db().from('space_invitations')
      .select('*')
      .eq('space_id', spaceId)
      .eq('tenant_id', _tid())
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SpaceRepo] listInvitations erro:', error.message);
      return [];
    }
    return data || [];
  }

  /**
   * Cancela convite
   * @param {string} invitationId
   */
  async function cancelInvitation(invitationId) {
    const { error } = await _db().from('space_invitations')
      .update({ status: 'expired' })
      .eq('id', invitationId)
      .eq('tenant_id', _tid());

    if (error) {
      console.error('[SpaceRepo] cancelInvitation erro:', error.message);
      throw error;
    }
  }

  // ── People Lookup ───────────────────────────────────────────────────────

  /**
   * Busca usuários do tenant para autocomplete
   * @param {string} query - busca por nome ou email
   * @param {number} [limit=10]
   * @returns {Array} [{ id, full_name, email, avatar_url }]
   */
  async function searchTenantUsers(query, limit = 10) {
    const q = (query || '').trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const { data, error } = await _db().from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('tenant_id', _tid())
      .eq('is_active', true)
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(limit);

    if (error) {
      console.warn('[SpaceRepo] searchTenantUsers erro:', error.message);
      return [];
    }
    return data || [];
  }

  // ── Recent Icons ────────────────────────────────────────────────────────

  /**
   * Retorna ícones recentes do usuário
   * @param {number} [limit=20]
   */
  async function getRecentIcons(limit = 20) {
    const uid = _uid();
    if (!uid) return [];

    const { data, error } = await _db().from('user_recent_icons')
      .select('icon_type, icon_value, used_at')
      .eq('tenant_id', _tid())
      .eq('user_id', uid)
      .order('used_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[SpaceRepo] getRecentIcons erro:', error.message);
      return [];
    }
    return data || [];
  }

  /**
   * Adiciona ícone aos recentes do usuário
   * @param {string} iconType - 'lucide' ou 'emoji'
   * @param {string} iconValue
   */
  async function addRecentIcon(iconType, iconValue) {
    const uid = _uid();
    if (!uid) return;

    await _db().from('user_recent_icons')
      .upsert({
        tenant_id: _tid(),
        user_id: uid,
        icon_type: iconType,
        icon_value: iconValue,
        used_at: new Date().toISOString()
      }, {
        onConflict: 'tenant_id,user_id,icon_type,icon_value'
      });
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  return {
    // Workspace CRUD
    getById,
    update,
    rename,
    updateIcon,
    archive,
    softDelete,
    duplicate,

    // Members
    listMembers,
    addMember,
    updateMemberRole,
    removeMember,
    getMyRole,
    countOwners,

    // Invitations
    createInvitation,
    listInvitations,
    cancelInvitation,

    // People Lookup
    searchTenantUsers,

    // Recent Icons
    getRecentIcons,
    addRecentIcon
  };
})();

if (typeof window !== 'undefined') {
  window.SpaceRepo = SpaceRepo;
}
