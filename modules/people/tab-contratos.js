// TBO OS — People Tab: Contratos
// Sub-modulo lazy-loaded

(function() {
  const S = TBO_PEOPLE_SHARED;

  const TabContratos = {
    // ── Estado especifico da tab ──
    _contratosData: [],
    _contratosCount: 0,
    _contratosLoading: false,
    _contratosFilter: { status: '', type: '', search: '' },

    // ══════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════
    render() {
      return this._renderContratos();
    },

    _renderContratos() {
      if (!S._canSeeContracts()) {
        return '<div class="empty-state" style="padding:60px;text-align:center;"><p style="color:var(--text-muted);">Acesso restrito.</p></div>';
      }

      const f = this._contratosFilter;
      return `
        ${S._pageHeader('Contratos', 'Gestão de contratos PJ, NDA, aditivos e freelancers')}
        <div class="rh-contratos-section">
          <!-- KPIs -->
          <div id="rhContratosKPIs" class="grid-4" style="margin-bottom:20px;">
            ${this._renderContratosKPIs()}
          </div>

          <!-- Toolbar -->
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap;">
            <input type="text" class="form-input rh-contratos-search" placeholder="Buscar contratos..." value="${f.search}" style="flex:1; min-width:200px;">
            <select class="form-input rh-contratos-filter-type" style="width:140px;">
              <option value="">Todos Tipos</option>
              <option value="pj" ${f.type==='pj'?'selected':''}>PJ</option>
              <option value="clt" ${f.type==='clt'?'selected':''}>CLT</option>
              <option value="nda" ${f.type==='nda'?'selected':''}>NDA</option>
              <option value="aditivo" ${f.type==='aditivo'?'selected':''}>Aditivo</option>
              <option value="freelancer" ${f.type==='freelancer'?'selected':''}>Freelancer</option>
              <option value="outro" ${f.type==='outro'?'selected':''}>Outro</option>
            </select>
            <select class="form-input rh-contratos-filter-status" style="width:140px;">
              <option value="">Todos Status</option>
              <option value="draft" ${f.status==='draft'?'selected':''}>Rascunho</option>
              <option value="active" ${f.status==='active'?'selected':''}>Ativo</option>
              <option value="expired" ${f.status==='expired'?'selected':''}>Expirado</option>
              <option value="cancelled" ${f.status==='cancelled'?'selected':''}>Cancelado</option>
              <option value="renewed" ${f.status==='renewed'?'selected':''}>Renovado</option>
            </select>
            <button class="btn btn-primary" id="rhBtnNovoContrato" style="white-space:nowrap;">
              <i data-lucide="file-plus" style="width:16px;height:16px;"></i> Novo Contrato
            </button>
          </div>

          <!-- Tabela -->
          <div id="rhContratosTable" class="rh-tabela-card" style="overflow-x:auto;">
            ${this._renderContratosTable()}
          </div>
        </div>

        <!-- Modal Contrato -->
        <div id="rhContratoModal" class="modal-overlay" style="display:none;">
          <div class="modal" style="max-width:600px;">
            <div id="rhContratoModalContent"></div>
          </div>
        </div>
      `;
    },

    _renderContratosKPIs() {
      const all = this._contratosData || [];
      const ativos = all.filter(c => c.status === 'active').length;
      const custoTotal = all.filter(c => c.status === 'active').reduce((s, c) => s + (parseFloat(c.monthly_value) || 0), 0);
      const now = new Date();
      const in30d = new Date(); in30d.setDate(in30d.getDate() + 30);
      const vencendo = all.filter(c => c.status === 'active' && c.end_date && new Date(c.end_date) >= now && new Date(c.end_date) <= in30d).length;
      const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
      return `
        <div class="kpi-card"><div class="kpi-label">Total Ativos</div><div class="kpi-value">${ativos}</div></div>
        <div class="kpi-card"><div class="kpi-label">Custo Mensal Total</div><div class="kpi-value" style="font-size:1.1rem;">${fmt(custoTotal)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Vencendo 30d</div><div class="kpi-value" style="color:${vencendo > 0 ? 'var(--color-danger)' : 'var(--text-muted)'}">${vencendo}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Cadastrados</div><div class="kpi-value">${all.length}</div></div>
      `;
    },

    _contratoTypeLabel(t) {
      const map = { pj:'PJ', nda:'NDA', aditivo:'Aditivo', freelancer:'Freelancer', clt:'CLT', outro:'Outro' };
      return map[t] || t || 'PJ';
    },
    _contratoTypeColor(t) {
      const map = { pj:'#3B82F6', nda:'#8B5CF6', aditivo:'#F59E0B', freelancer:'#2ECC71', clt:'#EC4899', outro:'#94A3B8' };
      return map[t] || '#94A3B8';
    },
    _contratoStatusLabel(s) {
      const map = { draft:'Rascunho', active:'Ativo', expired:'Expirado', cancelled:'Cancelado', renewed:'Renovado' };
      return map[s] || s || 'Ativo';
    },
    _contratoStatusColor(s) {
      const map = { draft:'#94A3B8', active:'#2ECC71', expired:'#EF4444', cancelled:'#6B7280', renewed:'#3B82F6' };
      return map[s] || '#94A3B8';
    },

    _renderContratosTable() {
      if (this._contratosLoading) {
        return '<div style="padding:40px;text-align:center;"><div class="rh-skeleton" style="height:200px;border-radius:8px;"></div></div>';
      }
      const contratos = this._contratosData || [];
      if (!contratos.length) {
        return `<div class="empty-state" style="padding:60px 20px;text-align:center;">
          <i data-lucide="file-text" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
          <h3 style="color:var(--text-muted);margin:0 0 4px;">Nenhum contrato cadastrado</h3>
          <p style="color:var(--text-muted);font-size:0.85rem;">Clique em "Novo Contrato" para adicionar.</p>
        </div>`;
      }
      const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
      const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
      const fmt = (v) => v ? parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) : '-';

      return `
        <table class="rh-bu-table">
          <thead><tr>
            <th>Pessoa</th><th>Tipo</th><th>Titulo</th><th>Inicio</th><th>Fim</th><th>Status</th><th>Valor/mes</th><th>PDF</th><th style="width:60px;">Acoes</th>
          </tr></thead>
          <tbody>
            ${contratos.map(c => `
              <tr class="rh-bu-row">
                <td style="font-weight:600;">${esc(c.person_name) || '-'}</td>
                <td><span class="tag" style="background:${this._contratoTypeColor(c.type)}20;color:${this._contratoTypeColor(c.type)};font-size:0.7rem;">${this._contratoTypeLabel(c.type)}</span></td>
                <td>${esc(c.title)}</td>
                <td style="font-size:0.78rem;">${formatDate(c.start_date)}</td>
                <td style="font-size:0.78rem;">${formatDate(c.end_date)}</td>
                <td><span class="tag" style="background:${this._contratoStatusColor(c.status)}20;color:${this._contratoStatusColor(c.status)};font-size:0.7rem;">${this._contratoStatusLabel(c.status)}</span></td>
                <td style="font-weight:600;font-size:0.85rem;">${fmt(c.monthly_value)}</td>
                <td>${c.file_url ? `<a href="${esc(c.file_url)}" target="_blank" title="${esc(c.file_name)}"><i data-lucide="download" style="width:16px;height:16px;color:var(--accent-gold);"></i></a>` : '<span style="color:var(--text-muted);font-size:0.75rem;">-</span>'}</td>
                <td>
                  <button class="btn btn-sm rh-contrato-edit" data-id="${c.id}" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    },

    _renderContratoModalContent(contract) {
      const c = contract || {};
      const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
      // Lista de pessoas do time para select
      const team = S._getInternalTeam();
      const personOptions = team.map(p => {
        const name = p.nome || p.full_name || '';
        const id = p.supabaseId || p.id || '';
        return `<option value="${id}" ${c.person_id === id ? 'selected' : ''}>${esc(name)}</option>`;
      }).join('');

      return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="margin:0;">${c.id ? 'Editar Contrato' : 'Novo Contrato'}</h3>
          <button class="btn btn-sm" id="rhContratoModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="rhContratoForm">
          <input type="hidden" id="rhContratoId" value="${c.id || ''}">
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div><label class="form-label">Pessoa</label>
              <select class="form-input" id="rhContratoPessoa">
                <option value="">Selecionar ou digitar abaixo...</option>
                ${personOptions}
              </select>
            </div>
            <div><label class="form-label">Nome (se nao listado)</label>
              <input class="form-input" id="rhContratoPessoaNome" value="${esc(c.person_name)}" placeholder="Nome manual">
            </div>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div><label class="form-label">Tipo *</label>
              <select class="form-input" id="rhContratoTipo" required>
                <option value="pj" ${c.type==='pj'||!c.type?'selected':''}>PJ</option>
                <option value="clt" ${c.type==='clt'?'selected':''}>CLT</option>
                <option value="nda" ${c.type==='nda'?'selected':''}>NDA</option>
                <option value="aditivo" ${c.type==='aditivo'?'selected':''}>Aditivo</option>
                <option value="freelancer" ${c.type==='freelancer'?'selected':''}>Freelancer</option>
                <option value="outro" ${c.type==='outro'?'selected':''}>Outro</option>
              </select>
            </div>
            <div><label class="form-label">Status</label>
              <select class="form-input" id="rhContratoStatus">
                <option value="draft" ${c.status==='draft'?'selected':''}>Rascunho</option>
                <option value="active" ${c.status==='active'||!c.status?'selected':''}>Ativo</option>
                <option value="expired" ${c.status==='expired'?'selected':''}>Expirado</option>
                <option value="cancelled" ${c.status==='cancelled'?'selected':''}>Cancelado</option>
                <option value="renewed" ${c.status==='renewed'?'selected':''}>Renovado</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <label class="form-label">Titulo *</label>
            <input class="form-input" id="rhContratoTitulo" value="${esc(c.title)}" required>
          </div>
          <div style="margin-bottom:12px;">
            <label class="form-label">Descricao</label>
            <textarea class="form-input" id="rhContratoDescricao" rows="2">${esc(c.description)}</textarea>
          </div>
          <div class="grid-3" style="gap:12px;margin-bottom:12px;">
            <div><label class="form-label">Data Inicio</label><input class="form-input" id="rhContratoInicio" type="date" value="${c.start_date || ''}"></div>
            <div><label class="form-label">Data Fim</label><input class="form-input" id="rhContratoFim" type="date" value="${c.end_date || ''}"></div>
            <div><label class="form-label">Valor Mensal (R$)</label><input class="form-input" id="rhContratoValor" type="number" step="0.01" min="0" value="${c.monthly_value || ''}"></div>
          </div>
          <div style="margin-bottom:16px;">
            <label class="form-label">Arquivo PDF</label>
            <input type="file" class="form-input" id="rhContratoFile" accept=".pdf,.doc,.docx">
            ${c.file_name ? `<p style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">Atual: ${esc(c.file_name)}</p>` : ''}
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" id="rhContratoCancel">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="rhContratoSubmit">Salvar</button>
          </div>
        </form>
      `;
    },

    // ══════════════════════════════════════════════════════════════════
    // DATA
    // ══════════════════════════════════════════════════════════════════
    async _loadContratos() {
      if (typeof ContractsRepo === 'undefined') return;
      this._contratosLoading = true;
      const tableEl = document.getElementById('rhContratosTable');
      if (tableEl) tableEl.innerHTML = this._renderContratosTable();

      try {
        const f = this._contratosFilter;
        const opts = {};
        if (f.status) opts.status = f.status;
        if (f.type) opts.type = f.type;
        if (f.search) opts.search = f.search;

        const result = await ContractsRepo.list(opts);
        this._contratosData = result.data;
        this._contratosCount = result.count;
      } catch (err) {
        console.error('[RH] Erro ao carregar contratos:', err);
        TBO_TOAST.error('Erro ao carregar contratos');
        this._contratosData = [];
      }
      this._contratosLoading = false;

      if (tableEl) {
        tableEl.innerHTML = this._renderContratosTable();
        if (window.lucide) lucide.createIcons({ root: tableEl });
        this._bindContratosActions();
      }
      const kpis = document.getElementById('rhContratosKPIs');
      if (kpis) { kpis.innerHTML = this._renderContratosKPIs(); }
    },

    _bindContratosActions() {
      const self = this;
      document.querySelectorAll('.rh-contrato-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (typeof ContractsRepo === 'undefined') return;
          try {
            const contract = await ContractsRepo.getById(btn.dataset.id);
            self._openContratoModal(contract);
          } catch (e) { TBO_TOAST.error('Erro ao carregar contrato'); }
        });
      });
    },

    // ══════════════════════════════════════════════════════════════════
    // MODAL (PUBLIC — callable from shell via _delegateAction)
    // ══════════════════════════════════════════════════════════════════
    _openContratoModal(contract) {
      const self = this;
      let modal = document.getElementById('rhContratoModal');

      // Fallback: se modal nao existe no DOM (re-render destruiu), criar dinamicamente
      if (!modal) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<div id="rhContratoModal" class="modal-overlay" style="display:none;">
          <div class="modal" style="max-width:600px;"><div id="rhContratoModalContent"></div></div>
        </div>`;
        document.body.appendChild(wrapper.firstElementChild);
        modal = document.getElementById('rhContratoModal');
      }
      const content = document.getElementById('rhContratoModalContent');
      if (!modal || !content) return;

      content.innerHTML = this._renderContratoModalContent(contract);
      modal.style.display = 'flex';
      // Ativar transicao CSS (opacity + visibility)
      requestAnimationFrame(() => modal.classList.add('active'));
      if (window.lucide) lucide.createIcons({ root: modal });

      // Helper para fechar modal com animacao
      const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 200);
      };
      document.getElementById('rhContratoModalClose')?.addEventListener('click', closeModal);
      document.getElementById('rhContratoCancel')?.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
      const escHandler = (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          closeModal();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      // Focus no primeiro campo para UX
      setTimeout(() => document.getElementById('rhContratoTitulo')?.focus(), 100);

      document.getElementById('rhContratoForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('rhContratoId')?.value;
        const personId = document.getElementById('rhContratoPessoa')?.value || null;
        const personName = document.getElementById('rhContratoPessoaNome')?.value?.trim() || null;
        const fileInput = document.getElementById('rhContratoFile');

        // Resolver person_name: se selecionou pessoa, pegar nome do time
        let resolvedName = personName;
        if (personId) {
          const person = S._getInternalTeam().find(p => (p.supabaseId || p.id) === personId);
          resolvedName = person?.nome || person?.full_name || personName;
        }

        const payload = {
          person_id: personId,
          person_name: resolvedName,
          type: document.getElementById('rhContratoTipo')?.value || 'pj',
          title: document.getElementById('rhContratoTitulo')?.value?.trim(),
          description: document.getElementById('rhContratoDescricao')?.value?.trim() || null,
          start_date: document.getElementById('rhContratoInicio')?.value || null,
          end_date: document.getElementById('rhContratoFim')?.value || null,
          status: document.getElementById('rhContratoStatus')?.value || 'active',
          monthly_value: parseFloat(document.getElementById('rhContratoValor')?.value) || null,
        };

        if (!payload.title) { TBO_TOAST.warning('Titulo e obrigatorio'); return; }

        const submitBtn = document.getElementById('rhContratoSubmit');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Salvando...'; }

        try {
          let saved;
          if (id) { saved = await ContractsRepo.update(id, payload); }
          else { saved = await ContractsRepo.create(payload); }

          // Upload de arquivo se selecionado
          if (fileInput?.files?.length > 0 && saved?.id) {
            try {
              await ContractsRepo.uploadFile(saved.id, fileInput.files[0]);
            } catch (upErr) {
              console.error('[RH] Erro no upload:', upErr);
              TBO_TOAST.warning('Contrato salvo, mas erro no upload do arquivo');
            }
          }

          TBO_TOAST.success(id ? 'Contrato atualizado!' : 'Contrato criado!');
          closeModal();
          self._loadContratos();
        } catch (err) {
          console.error('[RH] Erro ao salvar contrato:', err);
          TBO_TOAST.error('Erro ao salvar contrato');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Salvar'; }
        }
      });
    },

    // ══════════════════════════════════════════════════════════════════
    // INIT
    // ══════════════════════════════════════════════════════════════════
    init() {
      this._initContratos();
    },

    _initContratos() {
      const self = this;

      // Botao novo contrato (backup — delegation principal no shell index.js)
      document.getElementById('rhBtnNovoContrato')?.addEventListener('click', () => {
        self._openContratoModal(null);
      });

      // Filtros
      let searchTimer = null;
      const searchInput = document.querySelector('.rh-contratos-search');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          clearTimeout(searchTimer);
          searchTimer = setTimeout(() => {
            self._contratosFilter.search = searchInput.value.trim();
            self._loadContratos();
          }, 300);
        });
      }

      document.querySelector('.rh-contratos-filter-type')?.addEventListener('change', (e) => {
        self._contratosFilter.type = e.target.value;
        self._loadContratos();
      });
      document.querySelector('.rh-contratos-filter-status')?.addEventListener('change', (e) => {
        self._contratosFilter.status = e.target.value;
        self._loadContratos();
      });

      // Carregar dados iniciais se estiver na tab
      if (S._activeTab === 'contratos' && S._canSeeContracts()) {
        self._loadContratos();
      }
    },

    // ══════════════════════════════════════════════════════════════════
    // DESTROY
    // ══════════════════════════════════════════════════════════════════
    destroy() {}
  };

  TBO_PEOPLE.registerTab('contratos', TabContratos);
})();
