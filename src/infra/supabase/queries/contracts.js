/**
 * TBO OS — Repository: Contracts (Contratos)
 *
 * CRUD e queries para gestão de contratos de pessoas (PJ, NDA, Aditivo, Freelancer).
 * Inclui upload de PDF via Supabase Storage.
 * ACESSO RESTRITO: owner, admin, diretor, financeiro (via RLS).
 * UI NUNCA chama supabase.from('contracts') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const ContractsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  const _SELECT = 'id, person_id, person_name, type, title, description, start_date, end_date, status, monthly_value, file_url, file_name, created_by, created_at, updated_at';
  const _BUCKET = 'contracts';

  return {

    /**
     * Lista contratos com filtros opcionais
     */
    async list({ status, type, personId, search, limit = 50, offset = 0 } = {}) {
      const tid = _tid();
      let query = _db().from('contracts')
        .select(_SELECT, { count: 'exact' })
        .eq('tenant_id', tid)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (type) query = query.eq('type', type);
      if (personId) query = query.eq('person_id', personId);

      if (search) {
        const safe = search.replace(/[%(),.]/g, '');
        query = query.or(`title.ilike.%${safe}%,person_name.ilike.%${safe}%,description.ilike.%${safe}%`);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },

    /**
     * Busca contrato por ID
     */
    async getById(id) {
      const { data, error } = await _db().from('contracts')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Cria novo contrato
     */
    async create(contract) {
      const { data, error } = await _db().from('contracts')
        .insert({
          ...contract,
          tenant_id: _tid(),
          created_by: _uid(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza contrato
     */
    async update(id, updates) {
      const { data, error } = await _db().from('contracts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Upload de PDF para Supabase Storage e atualiza file_url no contrato
     */
    async uploadFile(contractId, file) {
      const tid = _tid();
      const ext = file.name.split('.').pop() || 'pdf';
      const path = `${tid}/${contractId}/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await _db().storage
        .from(_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Gerar URL publica ou signed
      const { data: urlData } = _db().storage
        .from(_BUCKET)
        .getPublicUrl(path);

      const fileUrl = urlData?.publicUrl || path;

      // Atualizar contrato com URL do arquivo
      const updated = await this.update(contractId, {
        file_url: fileUrl,
        file_name: file.name
      });

      return updated;
    },

    /**
     * Remove arquivo do contrato
     */
    async deleteFile(contractId) {
      const contract = await this.getById(contractId);
      if (!contract?.file_url) return;

      // Extrair path relativo da URL
      const urlParts = contract.file_url.split(`${_BUCKET}/`);
      const filePath = urlParts[urlParts.length - 1];

      if (filePath) {
        await _db().storage.from(_BUCKET).remove([filePath]);
      }

      return this.update(contractId, { file_url: null, file_name: null });
    },

    /**
     * Contratos de uma pessoa especifica
     */
    async getByPerson(personId) {
      const { data, error } = await _db().from('contracts')
        .select(_SELECT)
        .eq('tenant_id', _tid())
        .eq('person_id', personId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * KPIs agregados de contratos
     */
    async getKPIs() {
      const tid = _tid();
      const { data, error } = await _db().from('contracts')
        .select('id, type, status, monthly_value, end_date')
        .eq('tenant_id', tid);

      if (error) throw error;
      const all = data || [];

      // Contagens por status
      const byStatus = { draft: 0, active: 0, expired: 0, cancelled: 0, renewed: 0 };
      const byType = {};
      let custoMensalTotal = 0;
      let vencendo30d = 0;
      const now = new Date();
      const in30d = new Date();
      in30d.setDate(in30d.getDate() + 30);

      all.forEach(c => {
        byStatus[c.status || 'active']++;
        if (c.type) byType[c.type] = (byType[c.type] || 0) + 1;
        if (c.status === 'active') {
          custoMensalTotal += parseFloat(c.monthly_value) || 0;
        }
        if (c.end_date && c.status === 'active') {
          const end = new Date(c.end_date);
          if (end >= now && end <= in30d) vencendo30d++;
        }
      });

      return {
        total: all.length,
        totalAtivos: byStatus.active,
        byStatus,
        byType,
        custoMensalTotal,
        vencendo30d
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.ContractsRepo = ContractsRepo;
}
