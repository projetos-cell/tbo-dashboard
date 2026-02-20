/**
 * TBO OS — Repository: Pages
 *
 * CRUD de páginas (documentos) criados via overlay "Adicionar a...".
 * UI NUNCA chama supabase.from('pages') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const PagesRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * Criar nova página
     * @param {Object} opts
     * @param {string} opts.space_id - ID do workspace (ex: 'ws-geral')
     * @param {string} [opts.title] - Título (default: 'Nova página')
     * @param {Object} [opts.content] - Conteúdo JSONB
     * @param {string} [opts.icon] - Ícone (emoji ou lucide name)
     * @param {string} [opts.cover_url] - URL da capa
     * @param {string} opts.created_by - UUID do usuário criador
     * @returns {Object} Página criada
     */
    async create({ space_id, title, content, icon, cover_url, created_by }) {
      const tid = _tid();
      const { data, error } = await _db().from('pages')
        .insert({
          tenant_id: tid,
          space_id,
          title: title || 'Nova página',
          content: content || {},
          icon: icon || null,
          cover_url: cover_url || null,
          created_by,
          updated_by: created_by
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Buscar página por ID
     * @param {string} id - UUID da página
     * @returns {Object|null} Página encontrada
     */
    async getById(id) {
      const { data, error } = await _db().from('pages')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualizar campos de uma página
     * @param {string} id - UUID da página
     * @param {Object} updates - Campos a atualizar (title, content, icon, cover_url, etc.)
     * @returns {Object} Página atualizada
     */
    async update(id, updates) {
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      const { data, error } = await _db().from('pages')
        .update({
          ...updates,
          updated_by: user?.supabaseId || user?.id || updates.updated_by
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Listar páginas de um workspace/space
     * @param {string} spaceId - ID do workspace
     * @param {Object} [opts] - Opções de paginação
     * @returns {Array} Lista de páginas
     */
    async listBySpace(spaceId, { limit = 50, offset = 0 } = {}) {
      const tid = _tid();
      const { data, error } = await _db().from('pages')
        .select('id, title, icon, updated_at, created_at, created_by, updated_by')
        .eq('tenant_id', tid)
        .eq('space_id', spaceId)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    },

    /**
     * Soft delete — marca como excluída sem remover do banco
     * @param {string} id - UUID da página
     */
    async softDelete(id) {
      return this.update(id, { is_deleted: true });
    }
  };
})();

if (typeof window !== 'undefined') {
  window.PagesRepo = PagesRepo;
}
