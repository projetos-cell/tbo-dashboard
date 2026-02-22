/**
 * TBO OS — Repository: Block Links
 *
 * Gerencia slugs estaveis para "Link para o bloco".
 * Cada slug e unico por tenant e aponta para um bloco especifico.
 * UI NUNCA chama supabase.from('block_links') diretamente.
 */

const BlockLinksRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  async function _tid() { return RepoBase.resolveTenantId(); }

  /**
   * Gera slug alfanumerico de 8 caracteres (nanoid-style)
   */
  function _generateSlug() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 8; i++) {
      slug += chars[arr[i] % chars.length];
    }
    return slug;
  }

  return {
    /**
     * Criar slug para um bloco (ou retornar existente)
     */
    async createSlug(blockId) {
      const tid = await _tid();

      // Verificar se ja existe
      const existing = await this.getByBlockId(blockId);
      if (existing) return existing;

      const slug = _generateSlug();
      const { data, error } = await _db().from('block_links')
        .insert({
          tenant_id: tid,
          block_id: blockId,
          slug
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Buscar por slug
     */
    async getBySlug(slug) {
      const { data, error } = await _db().from('block_links')
        .select('*, page_blocks!inner(page_id)')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },

    /**
     * Buscar por block_id
     */
    async getByBlockId(blockId) {
      const { data, error } = await _db().from('block_links')
        .select('*')
        .eq('block_id', blockId)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.BlockLinksRepo = BlockLinksRepo;
}
