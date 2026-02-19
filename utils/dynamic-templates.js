// ============================================================================
// TBO OS — Dynamic Templates Engine
// CRUD de templates reutilizaveis com {{variavel}} substitution
// Propostas, contratos, emails, briefings, relatorios, atas
// ============================================================================

const TBO_DYNAMIC_TEMPLATES = {

  _cache: null,
  _cacheTime: 0,
  _CACHE_TTL: 300000, // 5 min

  // ══════════════════════════════════════════════════════════════════════
  // CRUD — LISTAR TEMPLATES
  // ══════════════════════════════════════════════════════════════════════
  async getTemplates(type = null) {
    // Cache
    if (this._cache && Date.now() - this._cacheTime < this._CACHE_TTL) {
      return type ? this._cache.filter(t => t.type === type) : this._cache;
    }

    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) return [];

    let query = client.from('dynamic_templates').select('*').order('usage_count', { ascending: false });
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) {
      console.error('[TBO Templates] Erro ao buscar templates:', error);
      return [];
    }

    if (!type) {
      this._cache = data || [];
      this._cacheTime = Date.now();
    }

    return data || [];
  },

  async getTemplate(id) {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) return null;

    const { data, error } = await client.from('dynamic_templates').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },

  // ══════════════════════════════════════════════════════════════════════
  // CRUD — CRIAR / ATUALIZAR / DELETAR
  // ══════════════════════════════════════════════════════════════════════
  async saveTemplate(templateData) {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) throw new Error('Supabase nao disponivel');

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;

    if (templateData.id) {
      // Update
      const { data, error } = await client
        .from('dynamic_templates')
        .update({
          name: templateData.name,
          type: templateData.type,
          description: templateData.description,
          content: templateData.content,
          variables: templateData.variables,
          category: templateData.category
        })
        .eq('id', templateData.id)
        .select()
        .single();

      if (error) throw error;
      this._cache = null;
      return data;
    } else {
      // Insert
      const { data, error } = await client
        .from('dynamic_templates')
        .insert({
          ...templateData,
          created_by: user?.supabaseId,
          created_by_name: user?.name
        })
        .select()
        .single();

      if (error) throw error;
      this._cache = null;
      return data;
    }
  },

  async deleteTemplate(id) {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) throw new Error('Supabase nao disponivel');

    const { error } = await client.from('dynamic_templates').delete().eq('id', id);
    if (error) throw error;
    this._cache = null;
  },

  // ══════════════════════════════════════════════════════════════════════
  // APLICAR TEMPLATE — substituir {{variaveis}} por valores
  // ══════════════════════════════════════════════════════════════════════
  applyTemplate(content, values = {}) {
    let result = content;
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value || '');
    });
    return result;
  },

  // Incrementar contador de uso
  async incrementUsage(templateId) {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) return;

    await client.rpc('increment_template_usage', { template_id: templateId }).catch(() => {
      // Fallback: update direto
      client.from('dynamic_templates')
        .update({ usage_count: client.raw('usage_count + 1'), last_used_at: new Date().toISOString() })
        .eq('id', templateId);
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  // RENDERIZAR SELETOR DE TEMPLATE
  // ══════════════════════════════════════════════════════════════════════
  async renderTemplateSelector(container, type = null, onSelect = null) {
    if (!container) return;

    container.innerHTML = '<div style="text-align:center;padding:20px;"><div class="skel-shimmer" style="width:100%;height:120px;border-radius:8px;"></div></div>';

    const templates = await this.getTemplates(type);

    const typeLabels = {
      proposta: 'Proposta', contrato: 'Contrato', email: 'Email',
      briefing: 'Briefing', relatorio: 'Relatorio', ata: 'Ata', outro: 'Outro'
    };

    const typeColors = {
      proposta: '#3b82f6', contrato: '#8b5cf6', email: '#f59e0b',
      briefing: '#22c55e', relatorio: '#ef4444', ata: '#06b6d4', outro: '#6b7280'
    };

    const typeIcons = {
      proposta: 'file-text', contrato: 'file-check', email: 'mail',
      briefing: 'clipboard-list', relatorio: 'bar-chart-3', ata: 'scroll-text', outro: 'file'
    };

    if (templates.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:32px;color:var(--text-muted);">
          <i data-lucide="file-plus" style="width:32px;height:32px;margin-bottom:8px;"></i>
          <p style="font-size:0.8rem;">Nenhum template disponivel${type ? ` do tipo "${typeLabels[type] || type}"` : ''}.</p>
          <button class="btn btn-primary btn-sm tpl-create-btn" style="margin-top:8px;">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Criar Template
          </button>
        </div>
      `;
      container.querySelector('.tpl-create-btn')?.addEventListener('click', () => this._showTemplateEditor(container, null, type, onSelect));
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="tpl-selector">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h4 style="margin:0;font-size:0.85rem;">Escolha um Template</h4>
          <button class="btn btn-sm tpl-create-btn">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Novo
          </button>
        </div>

        <!-- Filtros por tipo -->
        ${!type ? `
          <div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap;">
            <button class="tpl-filter active" data-type="all" style="padding:4px 10px;border-radius:6px;border:1px solid var(--border-default);background:var(--brand-orange);color:#fff;font-size:0.68rem;cursor:pointer;">Todos</button>
            ${Object.entries(typeLabels).map(([k, v]) => `
              <button class="tpl-filter" data-type="${k}" style="padding:4px 10px;border-radius:6px;border:1px solid var(--border-default);background:transparent;color:var(--text-secondary);font-size:0.68rem;cursor:pointer;">${v}</button>
            `).join('')}
          </div>
        ` : ''}

        <!-- Grid de templates -->
        <div class="tpl-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
          ${templates.map(t => `
            <div class="tpl-card" data-tpl-id="${t.id}" style="
              cursor:pointer;padding:14px;border-radius:8px;border:2px solid transparent;
              background:var(--bg-card);transition:all 200ms;border:1px solid var(--border-default);">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <div style="width:28px;height:28px;border-radius:6px;background:${typeColors[t.type]}20;display:flex;align-items:center;justify-content:center;">
                  <i data-lucide="${typeIcons[t.type] || 'file'}" style="width:14px;height:14px;color:${typeColors[t.type]};"></i>
                </div>
                <div>
                  <div style="font-size:0.78rem;font-weight:600;">${t.name}</div>
                  <div style="font-size:0.6rem;color:var(--text-muted);">${typeLabels[t.type] || t.type}</div>
                </div>
              </div>
              ${t.description ? `<p style="font-size:0.68rem;color:var(--text-secondary);margin:0 0 6px;line-height:1.3;">${t.description}</p>` : ''}
              <div style="display:flex;align-items:center;gap:8px;font-size:0.6rem;color:var(--text-muted);">
                <span>${(t.variables || []).length} variaveis</span>
                <span>·</span>
                <span>${t.usage_count || 0}x usado</span>
                ${t.is_default ? '<span style="background:var(--brand-orange);color:#fff;padding:1px 5px;border-radius:3px;font-size:0.55rem;">PADRAO</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind card clicks
    container.querySelectorAll('.tpl-card').forEach(card => {
      card.addEventListener('click', async () => {
        const tplId = card.dataset.tplId;
        const tpl = await this.getTemplate(tplId);
        if (tpl && onSelect) {
          onSelect(tpl);
        } else if (tpl) {
          this._showTemplatePreview(tpl);
        }
      });
      card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--brand-orange)'; });
      card.addEventListener('mouseleave', () => { card.style.borderColor = 'var(--border-default)'; });
    });

    // Filtros
    container.querySelectorAll('.tpl-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tpl-filter').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
        });
        btn.classList.add('active');
        btn.style.background = 'var(--brand-orange)';
        btn.style.color = '#fff';

        const filterType = btn.dataset.type;
        container.querySelectorAll('.tpl-card').forEach(card => {
          const tpl = templates.find(t => t.id === card.dataset.tplId);
          card.style.display = (filterType === 'all' || tpl?.type === filterType) ? '' : 'none';
        });
      });
    });

    // Criar novo
    container.querySelector('.tpl-create-btn')?.addEventListener('click', () => {
      this._showTemplateEditor(container, null, type, onSelect);
    });

    if (window.lucide) lucide.createIcons();
  },

  // ══════════════════════════════════════════════════════════════════════
  // FORM DE PREENCHIMENTO (preencher variaveis de um template)
  // ══════════════════════════════════════════════════════════════════════
  renderVariableForm(container, template, onSubmit) {
    if (!container || !template) return;

    const variables = template.variables || [];

    container.innerHTML = `
      <div class="tpl-form" style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-default);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <i data-lucide="edit-3" style="width:18px;height:18px;color:var(--brand-orange);"></i>
          <div>
            <h4 style="margin:0;font-size:0.9rem;">${template.name}</h4>
            <span style="font-size:0.68rem;color:var(--text-muted);">Preencha as variaveis abaixo</span>
          </div>
        </div>

        <div class="tpl-fields" style="display:flex;flex-direction:column;gap:10px;">
          ${variables.map(v => `
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:0.75rem;">${v.label || v.key}</label>
              ${v.type === 'textarea' ? `
                <textarea class="form-input tpl-var-input" data-var-key="${v.key}" rows="3" placeholder="${v.label || v.key}" style="font-size:0.8rem;"></textarea>
              ` : v.type === 'date' ? `
                <input type="date" class="form-input tpl-var-input" data-var-key="${v.key}" style="font-size:0.8rem;">
              ` : v.type === 'number' ? `
                <input type="number" class="form-input tpl-var-input" data-var-key="${v.key}" placeholder="0" style="font-size:0.8rem;">
              ` : `
                <input type="text" class="form-input tpl-var-input" data-var-key="${v.key}" placeholder="${v.label || v.key}" style="font-size:0.8rem;">
              `}
            </div>
          `).join('')}
        </div>

        <div style="display:flex;gap:8px;margin-top:16px;">
          <button class="btn btn-sm tpl-preview-btn" style="flex:1;">
            <i data-lucide="eye" style="width:14px;height:14px;"></i> Visualizar
          </button>
          <button class="btn btn-primary btn-sm tpl-apply-btn" style="flex:1;">
            <i data-lucide="check" style="width:14px;height:14px;"></i> Aplicar Template
          </button>
        </div>
      </div>
    `;

    // Bind preview
    container.querySelector('.tpl-preview-btn')?.addEventListener('click', () => {
      const values = this._collectFormValues(container);
      const rendered = this.applyTemplate(template.content, values);
      this._showRenderedPreview(template.name, rendered);
    });

    // Bind apply
    container.querySelector('.tpl-apply-btn')?.addEventListener('click', async () => {
      const values = this._collectFormValues(container);
      const rendered = this.applyTemplate(template.content, values);
      await this.incrementUsage(template.id);
      if (onSubmit) onSubmit(rendered, values);
    });

    if (window.lucide) lucide.createIcons();
  },

  _collectFormValues(container) {
    const values = {};
    container.querySelectorAll('.tpl-var-input').forEach(input => {
      values[input.dataset.varKey] = input.value;
    });
    return values;
  },

  _showRenderedPreview(title, content) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = `
      <div style="background:var(--bg-card);border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 style="margin:0;font-size:0.95rem;">${title}</h3>
          <button class="btn btn-sm tpl-close-btn" style="padding:4px 8px;">✕</button>
        </div>
        <div style="background:var(--bg-primary);border-radius:8px;padding:20px;font-size:0.82rem;line-height:1.6;white-space:pre-wrap;border:1px solid var(--border-default);">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div style="margin-top:12px;text-align:right;">
          <button class="btn btn-sm tpl-copy-btn">
            <i data-lucide="copy" style="width:14px;height:14px;"></i> Copiar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.tpl-close-btn')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelector('.tpl-copy-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(content).then(() => {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Copiado!', 'Conteudo copiado para a area de transferencia.');
      });
    });

    if (window.lucide) lucide.createIcons();
  },

  _showTemplatePreview(template) {
    this._showRenderedPreview(template.name, template.content);
  },

  _showTemplateEditor(container, template, type, onSelectAfterSave) {
    const isNew = !template;
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = `
      <div style="background:var(--bg-card);border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <h3 style="margin:0 0 16px;font-size:0.95rem;">${isNew ? 'Novo Template' : 'Editar Template'}</h3>

        <div class="form-group">
          <label class="form-label" style="font-size:0.75rem;">Nome</label>
          <input type="text" class="form-input tpl-ed-name" value="${template?.name || ''}" placeholder="Nome do template">
        </div>

        <div style="display:flex;gap:8px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label" style="font-size:0.75rem;">Tipo</label>
            <select class="form-input tpl-ed-type">
              <option value="proposta" ${(template?.type || type) === 'proposta' ? 'selected' : ''}>Proposta</option>
              <option value="contrato" ${(template?.type || type) === 'contrato' ? 'selected' : ''}>Contrato</option>
              <option value="email" ${(template?.type || type) === 'email' ? 'selected' : ''}>Email</option>
              <option value="briefing" ${(template?.type || type) === 'briefing' ? 'selected' : ''}>Briefing</option>
              <option value="relatorio" ${(template?.type || type) === 'relatorio' ? 'selected' : ''}>Relatorio</option>
              <option value="ata" ${(template?.type || type) === 'ata' ? 'selected' : ''}>Ata</option>
              <option value="outro" ${(template?.type || type) === 'outro' ? 'selected' : ''}>Outro</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label" style="font-size:0.75rem;">Categoria</label>
            <input type="text" class="form-input tpl-ed-category" value="${template?.category || 'geral'}" placeholder="geral">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-size:0.75rem;">Descricao</label>
          <input type="text" class="form-input tpl-ed-desc" value="${template?.description || ''}" placeholder="Descricao curta">
        </div>

        <div class="form-group">
          <label class="form-label" style="font-size:0.75rem;">Conteudo (use {{variavel}} para campos dinamicos)</label>
          <textarea class="form-input tpl-ed-content" rows="10" placeholder="# Titulo\n\nOla {{nome}},\n\n..." style="font-family:monospace;font-size:0.78rem;">${template?.content || ''}</textarea>
        </div>

        <div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:12px;">
          💡 Variaveis detectadas serao extraidas automaticamente do conteudo.
        </div>

        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-sm tpl-ed-cancel">Cancelar</button>
          <button class="btn btn-primary btn-sm tpl-ed-save">Salvar Template</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.tpl-ed-cancel')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelector('.tpl-ed-save')?.addEventListener('click', async () => {
      const name = modal.querySelector('.tpl-ed-name').value.trim();
      const content = modal.querySelector('.tpl-ed-content').value.trim();

      if (!name || !content) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Campos obrigatorios', 'Preencha nome e conteudo.');
        return;
      }

      // Extrair variaveis do conteudo
      const varMatches = content.match(/\{\{(\w+)\}\}/g) || [];
      const uniqueVars = [...new Set(varMatches.map(v => v.replace(/[{}]/g, '')))];
      const variables = uniqueVars.map(key => ({
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        type: key.includes('descricao') || key.includes('observa') || key.includes('lista') ? 'textarea' :
              key.includes('data') || key.includes('date') ? 'date' :
              key.includes('valor') || key.includes('orcamento') || key.includes('prazo') ? 'number' : 'text'
      }));

      try {
        const saved = await this.saveTemplate({
          id: template?.id,
          name,
          type: modal.querySelector('.tpl-ed-type').value,
          description: modal.querySelector('.tpl-ed-desc').value.trim(),
          category: modal.querySelector('.tpl-ed-category').value.trim() || 'geral',
          content,
          variables
        });

        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Template salvo', `"${name}" salvo com sucesso.`);
        modal.remove();

        // Re-render selector
        if (container) {
          await this.renderTemplateSelector(container, type, onSelectAfterSave);
        }
      } catch (e) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message);
      }
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════════════
  init() {
    console.log('[TBO DynamicTemplates] Engine initialized with CRUD + variable substitution');
  }
};
