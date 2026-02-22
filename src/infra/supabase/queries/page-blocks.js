/**
 * TBO OS — Repository: Page Blocks
 *
 * CRUD de blocos de conteudo para o editor Notion-style.
 * Cada bloco pertence a uma page e possui type, content (JSONB), props (JSONB).
 * UI NUNCA chama supabase.from('page_blocks') diretamente.
 * tenant_id e OBRIGATORIO — lanca erro se ausente.
 */

const PageBlocksRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  async function _tid() { return RepoBase.resolveTenantId(); }

  function _getUserId() {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    return user?.supabaseId || user?.id || null;
  }

  return {
    /**
     * Criar novo bloco
     */
    async create({ page_id, type, content, props, position, parent_block_id, created_by }) {
      const tid = await _tid();
      const uid = created_by || _getUserId();
      const { data, error } = await _db().from('page_blocks')
        .insert({
          tenant_id: tid,
          page_id,
          parent_block_id: parent_block_id || null,
          type: type || 'text',
          content: content || { text: '', marks: [] },
          props: props || {},
          position: position ?? 0,
          created_by: uid,
          updated_by: uid
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Listar blocos de uma pagina, ordenados por position
     */
    async listByPage(pageId) {
      const { data, error } = await _db().from('page_blocks')
        .select('*')
        .eq('page_id', pageId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    /**
     * Buscar bloco por ID
     */
    async getById(blockId) {
      const { data, error } = await _db().from('page_blocks')
        .select('*')
        .eq('id', blockId)
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualizar campos de um bloco
     */
    async update(blockId, updates) {
      const uid = _getUserId();
      const { data, error } = await _db().from('page_blocks')
        .update({
          ...updates,
          updated_by: uid || updates.updated_by
        })
        .eq('id', blockId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Deletar bloco
     */
    async delete(blockId) {
      const { error } = await _db().from('page_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
    },

    /**
     * Duplicar bloco — cria copia com nova posicao (original.position + 0.5)
     */
    async duplicate(blockId) {
      const original = await this.getById(blockId);
      if (!original) throw new Error('Bloco nao encontrado');

      return this.create({
        page_id: original.page_id,
        type: original.type,
        content: { ...original.content },
        props: { ...original.props },
        position: original.position + 0.5,
        parent_block_id: original.parent_block_id
      });
    },

    /**
     * Mover bloco para outra pagina
     */
    async moveToPage(blockId, targetPageId, position) {
      const tid = await _tid();
      const uid = _getUserId();
      const block = await this.getById(blockId);
      if (!block) throw new Error('Bloco nao encontrado');

      // Delete from origin
      await this.delete(blockId);

      // Insert in destination
      return this.create({
        page_id: targetPageId,
        type: block.type,
        content: block.content,
        props: block.props,
        position: position ?? 9999,
        parent_block_id: null,
        created_by: uid
      });
    },

    /**
     * Reordenar blocos — recebe array de IDs na ordem desejada
     * Atualiza position de cada bloco sequencialmente (1, 2, 3...)
     */
    async reorder(pageId, orderedIds) {
      const uid = _getUserId();
      const promises = orderedIds.map((id, index) =>
        _db().from('page_blocks')
          .update({ position: index + 1, updated_by: uid })
          .eq('id', id)
          .eq('page_id', pageId)
      );

      const results = await Promise.all(promises);
      const firstError = results.find(r => r.error);
      if (firstError?.error) throw firstError.error;
    },

    /**
     * Obter maior position de uma pagina (para inserir no final)
     */
    async getMaxPosition(pageId) {
      const { data, error } = await _db().from('page_blocks')
        .select('position')
        .eq('page_id', pageId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data?.position || 0;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.PageBlocksRepo = PageBlocksRepo;
}
