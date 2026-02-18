// TBO OS — Module: Biblioteca (Base de Conhecimento)
// CRUD de documentos, links e recursos por categoria
const TBO_BIBLIOTECA = {

  _categories: ['Processos', 'Referencias', 'Tutoriais', 'Templates', 'Politicas'],
  _filterCat: 'all',
  _searchQuery: '',

  render() {
    if (typeof TBO_ERP !== 'undefined') TBO_ERP.init();

    const items = TBO_STORAGE.getAllErpEntities('knowledge_item');
    const byCat = {};
    this._categories.forEach(c => byCat[c] = 0);
    items.forEach(i => { if (byCat[i.category] !== undefined) byCat[i.category]++; });

    return `
      <div class="biblioteca-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Total de Recursos</div>
            <div class="kpi-value">${items.length}</div>
          </div>
          ${this._categories.slice(0, 3).map(c => `
            <div class="kpi-card">
              <div class="kpi-label">${c}</div>
              <div class="kpi-value">${byCat[c] || 0}</div>
            </div>
          `).join('')}
        </div>

        <!-- Toolbar -->
        <div class="card" style="margin-bottom:20px;">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
            <input type="text" class="form-input" id="bibSearchInput" placeholder="Buscar recursos..." style="flex:1;min-width:200px;">
            <select class="form-input" id="bibCatFilter" style="width:180px;">
              <option value="all">Todas categorias</option>
              ${this._categories.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
            <button class="btn btn-primary" id="bibAddBtn">+ Novo Recurso</button>
          </div>
        </div>

        <!-- List -->
        <div class="card">
          <div id="bibList">${this._renderList(items)}</div>
        </div>

        <!-- Add/Edit Modal (hidden) -->
        <div id="bibModal" style="display:none;">
          <div class="ux-confirm-overlay visible" id="bibModalOverlay">
            <div class="ux-confirm-modal" style="max-width:520px;width:90%;">
              <div class="ux-confirm-title" id="bibModalTitle">Novo Recurso</div>
              <div style="display:flex;flex-direction:column;gap:12px;margin:16px 0;">
                <input type="hidden" id="bibEditId">
                <div class="form-group">
                  <label class="form-label">Titulo *</label>
                  <input type="text" class="form-input" id="bibTitle" required>
                </div>
                <div class="form-group">
                  <label class="form-label">URL / Link</label>
                  <input type="url" class="form-input" id="bibUrl" placeholder="https://...">
                </div>
                <div class="form-group">
                  <label class="form-label">Descricao</label>
                  <textarea class="form-input" id="bibDesc" rows="3" style="resize:vertical;"></textarea>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Categoria *</label>
                    <select class="form-input" id="bibCategory">
                      ${this._categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Tags (virgula)</label>
                    <input type="text" class="form-input" id="bibTags" placeholder="ex: onboarding, guia">
                  </div>
                </div>
              </div>
              <div class="ux-confirm-actions">
                <button class="btn btn-secondary" id="bibCancelBtn">Cancelar</button>
                <button class="btn btn-primary" id="bibSaveBtn">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // Search
    document.getElementById('bibSearchInput')?.addEventListener('input', (e) => {
      this._searchQuery = e.target.value.toLowerCase();
      this._refreshList();
    });

    // Category filter
    document.getElementById('bibCatFilter')?.addEventListener('change', (e) => {
      this._filterCat = e.target.value;
      this._refreshList();
    });

    // Add button
    document.getElementById('bibAddBtn')?.addEventListener('click', () => this._openModal());

    // Modal actions
    document.getElementById('bibCancelBtn')?.addEventListener('click', () => this._closeModal());
    document.getElementById('bibSaveBtn')?.addEventListener('click', () => this._save());
    document.getElementById('bibModalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'bibModalOverlay') this._closeModal();
    });
  },

  _renderList(items) {
    let filtered = items || TBO_STORAGE.getAllErpEntities('knowledge_item');

    if (this._filterCat !== 'all') {
      filtered = filtered.filter(i => i.category === this._filterCat);
    }
    if (this._searchQuery) {
      filtered = filtered.filter(i =>
        (i.name || '').toLowerCase().includes(this._searchQuery) ||
        (i.description || '').toLowerCase().includes(this._searchQuery) ||
        (i.tags || []).some(t => t.toLowerCase().includes(this._searchQuery))
      );
    }

    if (filtered.length === 0) {
      return '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Nenhum recurso encontrado.</div>';
    }

    return filtered.map(item => {
      const tags = (item.tags || []).map(t => `<span class="badge">${this._esc(t)}</span>`).join(' ');
      const catColor = this._catColor(item.category);
      return `
        <div class="bib-item" style="display:flex;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid var(--border-subtle);">
          <div style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:${catColor};margin-top:6px;"></div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;">
              <strong style="font-size:0.88rem;color:var(--text-primary);">${this._esc(item.name)}</strong>
              <span style="font-size:0.68rem;color:var(--text-muted);background:var(--bg-elevated);padding:2px 8px;border-radius:999px;">${item.category || 'Geral'}</span>
            </div>
            ${item.description ? `<div style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px;line-height:1.4;">${this._esc(item.description)}</div>` : ''}
            ${item.url ? `<a href="${this._esc(item.url)}" target="_blank" rel="noopener" style="font-size:0.74rem;color:var(--accent-gold);margin-top:4px;display:inline-block;">${this._esc(item.url)}</a>` : ''}
            ${tags ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">${tags}</div>` : ''}
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            <button class="btn btn-sm btn-ghost bib-edit-btn" data-id="${item.id}" title="Editar">Editar</button>
            <button class="btn btn-sm btn-ghost bib-delete-btn" data-id="${item.id}" title="Excluir" style="color:var(--color-danger);">Excluir</button>
          </div>
        </div>
      `;
    }).join('');
  },

  _refreshList() {
    const el = document.getElementById('bibList');
    if (el) {
      el.innerHTML = this._renderList();
      this._bindListEvents();
    }
  },

  _bindListEvents() {
    document.querySelectorAll('.bib-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => this._openModal(btn.dataset.id));
    });
    document.querySelectorAll('.bib-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => this._delete(btn.dataset.id));
    });
  },

  _openModal(editId) {
    const modal = document.getElementById('bibModal');
    if (!modal) return;

    document.getElementById('bibEditId').value = editId || '';
    document.getElementById('bibModalTitle').textContent = editId ? 'Editar Recurso' : 'Novo Recurso';

    if (editId) {
      const item = TBO_STORAGE.getErpEntity(editId);
      if (item) {
        document.getElementById('bibTitle').value = item.name || '';
        document.getElementById('bibUrl').value = item.url || '';
        document.getElementById('bibDesc').value = item.description || '';
        document.getElementById('bibCategory').value = item.category || 'Processos';
        document.getElementById('bibTags').value = (item.tags || []).join(', ');
      }
    } else {
      document.getElementById('bibTitle').value = '';
      document.getElementById('bibUrl').value = '';
      document.getElementById('bibDesc').value = '';
      document.getElementById('bibCategory').value = 'Processos';
      document.getElementById('bibTags').value = '';
    }

    modal.style.display = 'block';
  },

  _closeModal() {
    const modal = document.getElementById('bibModal');
    if (modal) modal.style.display = 'none';
  },

  _save() {
    const title = document.getElementById('bibTitle')?.value.trim();
    if (!title) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Titulo obrigatorio');
      return;
    }

    const editId = document.getElementById('bibEditId')?.value;
    const data = {
      name: title,
      url: document.getElementById('bibUrl')?.value.trim() || '',
      description: document.getElementById('bibDesc')?.value.trim() || '',
      category: document.getElementById('bibCategory')?.value || 'Processos',
      tags: (document.getElementById('bibTags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
      author: TBO_AUTH?.getCurrentUser?.()?.id || 'unknown'
    };

    if (editId) {
      TBO_STORAGE.updateErpEntity(editId, data);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Atualizado', `"${title}" salvo.`);
    } else {
      TBO_STORAGE.addErpEntity('knowledge_item', data);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Criado', `"${title}" adicionado a biblioteca.`);
    }

    this._closeModal();
    this._refreshList();
  },

  _delete(id) {
    const item = TBO_STORAGE.getErpEntity(id);
    if (!item) return;
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.confirm('Excluir recurso', `Remover "${item.name}" da biblioteca?`, () => {
        TBO_STORAGE.deleteErpEntity(id);
        this._refreshList();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Removido', `"${item.name}" excluido.`);
      }, { danger: true, confirmText: 'Excluir' });
    } else {
      TBO_STORAGE.deleteErpEntity(id);
      this._refreshList();
    }
  },

  _catColor(cat) {
    const colors = {
      'Processos': '#3a7bd5',
      'Referencias': '#8b5cf6',
      'Tutoriais': '#2ecc71',
      'Templates': '#f39c12',
      'Politicas': '#e74c3c'
    };
    return colors[cat] || '#9F9F9F';
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};
