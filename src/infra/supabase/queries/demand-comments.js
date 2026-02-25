/**
 * TBO OS — Repository: Demand Comments
 *
 * CRUD for demand_comments table (comments with @mentions support).
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 * Segue padrão RepoBase: IIFE, _db(), _tid(), throw on error.
 */
const DemandCommentsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * List all comments for a demand, ordered by created_at ASC.
     */
    async list(demandId) {
      const { data, error } = await _db().from('demand_comments')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('demand_id', demandId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    /**
     * Create a new comment.
     * @param {{ demand_id: string, author_id: string, content: string, mentions: Array }} comment
     */
    async create(comment) {
      const { data, error } = await _db().from('demand_comments')
        .insert({
          tenant_id: _tid(),
          demand_id: comment.demand_id,
          author_id: comment.author_id,
          content: comment.content || '',
          mentions: comment.mentions || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Update a comment (content + mentions).
     */
    async update(id, changes) {
      const payload = {};
      if (changes.content !== undefined) payload.content = changes.content;
      if (changes.mentions !== undefined) payload.mentions = changes.mentions;

      const { data, error } = await _db().from('demand_comments')
        .update(payload)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Delete a comment.
     */
    async remove(id) {
      const { error } = await _db().from('demand_comments')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
    },
  };
})();

if (typeof window !== 'undefined') window.DemandCommentsRepo = DemandCommentsRepo;
