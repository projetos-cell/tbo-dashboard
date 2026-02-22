// TBO OS — People Tab: Banco de Talentos
// Sub-modulo lazy-loaded

(function() {
  const S = TBO_PEOPLE_SHARED;

  const TabTalentos = {
    // ── Estado especifico da tab ──
    _talentsData: [],
    _talentsCount: 0,
    _talentsLoading: false,
    _talentsFilter: { status: '', specialty: '', seniority: '', search: '' },

    // ══════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════
    render() {
      return this._renderBancoTalentos();
    },

    _renderBancoTalentos() {
      const f = this._talentsFilter;
      return `
        ${S._pageHeader('Banco de Talentos', 'Candidatos, freelancers e parceiros externos')}
        <div class="rh-talentos-section">
          <!-- KPIs -->
          <div id="rhTalentosKPIs" class="grid-4" style="margin-bottom:20px;">
            ${this._renderTalentosKPIs()}
          </div>

          <!-- Toolbar -->
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap;">
            <input type="text" class="form-input rh-talentos-search" placeholder="Buscar talentos..." value="${f.search}" style="flex:1; min-width:200px;">
            <select class="form-input rh-talentos-filter-specialty" style="width:160px;">
              <option value="">Todas Especialidades</option>
              <option value="Branding" ${f.specialty==='Branding'?'selected':''}>Branding</option>
              <option value="Digital 3D" ${f.specialty==='Digital 3D'?'selected':''}>Digital 3D</option>
              <option value="Marketing" ${f.specialty==='Marketing'?'selected':''}>Marketing</option>
              <option value="Vendas" ${f.specialty==='Vendas'?'selected':''}>Vendas</option>
              <option value="Design" ${f.specialty==='Design'?'selected':''}>Design</option>
              <option value="Desenvolvimento" ${f.specialty==='Desenvolvimento'?'selected':''}>Desenvolvimento</option>
              <option value="Audiovisual" ${f.specialty==='Audiovisual'?'selected':''}>Audiovisual</option>
              <option value="Outro" ${f.specialty==='Outro'?'selected':''}>Outro</option>
            </select>
            <select class="form-input rh-talentos-filter-seniority" style="width:130px;">
              <option value="">Senioridade</option>
              <option value="Jr" ${f.seniority==='Jr'?'selected':''}>Jr</option>
              <option value="Pleno" ${f.seniority==='Pleno'?'selected':''}>Pleno</option>
              <option value="Senior" ${f.seniority==='Senior'?'selected':''}>Senior</option>
              <option value="Especialista" ${f.seniority==='Especialista'?'selected':''}>Especialista</option>
            </select>
            <select class="form-input rh-talentos-filter-status" style="width:140px;">
              <option value="">Todos Status</option>
              <option value="available" ${f.status==='available'?'selected':''}>Disponivel</option>
              <option value="contacted" ${f.status==='contacted'?'selected':''}>Contatado</option>
              <option value="in_process" ${f.status==='in_process'?'selected':''}>Em Processo</option>
              <option value="hired" ${f.status==='hired'?'selected':''}>Contratado</option>
              <option value="archived" ${f.status==='archived'?'selected':''}>Arquivado</option>
            </select>
            <button class="btn btn-primary" id="rhBtnNovoTalento" style="white-space:nowrap;">
              <i data-lucide="user-plus" style="width:16px;height:16px;"></i> Novo Talento
            </button>
          </div>

          <!-- Tabela -->
          <div id="rhTalentosTable" class="rh-tabela-card" style="overflow-x:auto;">
            ${this._renderTalentosTable()}
          </div>
        </div>

        <!-- Modal Talento -->
        <div id="rhTalentoModal" class="modal-overlay" style="display:none;">
          <div class="modal" style="max-width:600px;">
            <div id="rhTalentoModalContent"></div>
          </div>
        </div>
      `;
    },

    _renderTalentosKPIs() {
      const all = this._talentsData || [];
      const avail = all.filter(t => t.status === 'available').length;
      const inProc = all.filter(t => t.status === 'in_process' || t.status === 'contacted').length;
      const hired = all.filter(t => t.status === 'hired').length;
      return `
        <div class="kpi-card"><div class="kpi-label">Total Cadastrados</div><div class="kpi-value">${all.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Disponiveis</div><div class="kpi-value" style="color:var(--color-success)">${avail}</div></div>
        <div class="kpi-card"><div class="kpi-label">Em Processo</div><div class="kpi-value" style="color:var(--accent-gold)">${inProc}</div></div>
        <div class="kpi-card"><div class="kpi-label">Contratados</div><div class="kpi-value" style="color:var(--color-info)">${hired}</div></div>
      `;
    },

    _talentStatusLabel(s) {
      const map = { available:'Disponivel', contacted:'Contatado', in_process:'Em Processo', hired:'Contratado', archived:'Arquivado' };
      return map[s] || s || 'Disponivel';
    },
    _talentStatusColor(s) {
      const map = { available:'#2ECC71', contacted:'#3B82F6', in_process:'#F59E0B', hired:'#8B5CF6', archived:'#94A3B8' };
      return map[s] || '#94A3B8';
    },

    _renderTalentosTable() {
      if (this._talentsLoading) {
        return '<div style="padding:40px;text-align:center;"><div class="rh-skeleton" style="height:200px;border-radius:8px;"></div></div>';
      }
      const talents = this._talentsData || [];
      if (!talents.length) {
        return `<div class="empty-state" style="padding:60px 20px;text-align:center;">
          <i data-lucide="user-plus" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
          <h3 style="color:var(--text-muted);margin:0 0 4px;">Nenhum talento cadastrado</h3>
          <p style="color:var(--text-muted);font-size:0.85rem;">Clique em "Novo Talento" para adicionar ao banco.</p>
        </div>`;
      }
      const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
      return `
        <table class="rh-bu-table">
          <thead><tr>
            <th>Nome</th><th>Email</th><th>Especialidade</th><th>Senioridade</th><th>Cidade/UF</th><th>Status</th><th style="width:80px;">Acoes</th>
          </tr></thead>
          <tbody>
            ${talents.map(t => `
              <tr class="rh-bu-row">
                <td style="font-weight:600;">${esc(t.full_name)}</td>
                <td>${esc(t.email)}</td>
                <td>${esc(t.specialty)}</td>
                <td>${esc(t.seniority)}</td>
                <td>${esc(t.city)}${t.state ? '/' + esc(t.state) : ''}</td>
                <td><span class="tag" style="background:${this._talentStatusColor(t.status)}20;color:${this._talentStatusColor(t.status)};font-size:0.7rem;">${this._talentStatusLabel(t.status)}</span></td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="btn btn-sm rh-talent-edit" data-id="${t.id}" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                    <button class="btn btn-sm rh-talent-archive" data-id="${t.id}" title="Arquivar"><i data-lucide="archive" style="width:14px;height:14px;"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    },

    _renderTalentoModalContent(talent) {
      const t = talent || {};
      const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="margin:0;">${t.id ? 'Editar Talento' : 'Novo Talento'}</h3>
          <button class="btn btn-sm" id="rhTalentoModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="rhTalentoForm">
          <input type="hidden" id="rhTalentoId" value="${t.id || ''}">
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div><label class="form-label">Nome *</label><input class="form-input" id="rhTalentoNome" value="${esc(t.full_name)}" required></div>
            <div><label class="form-label">Email</label><input class="form-input" id="rhTalentoEmail" type="email" value="${esc(t.email)}"></div>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div><label class="form-label">Telefone</label><input class="form-input" id="rhTalentoPhone" value="${esc(t.phone)}"></div>
            <div><label class="form-label">Fonte</label>
              <select class="form-input" id="rhTalentoSource">
                <option value="">Selecionar...</option>
                <option value="indicacao" ${t.source==='indicacao'?'selected':''}>Indicacao</option>
                <option value="linkedin" ${t.source==='linkedin'?'selected':''}>LinkedIn</option>
                <option value="site" ${t.source==='site'?'selected':''}>Site</option>
                <option value="portfolio" ${t.source==='portfolio'?'selected':''}>Portfolio</option>
                <option value="outro" ${t.source==='outro'?'selected':''}>Outro</option>
              </select>
            </div>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div><label class="form-label">Especialidade</label>
              <select class="form-input" id="rhTalentoSpecialty">
                <option value="">Selecionar...</option>
                <option value="Branding" ${t.specialty==='Branding'?'selected':''}>Branding</option>
                <option value="Digital 3D" ${t.specialty==='Digital 3D'?'selected':''}>Digital 3D</option>
                <option value="Marketing" ${t.specialty==='Marketing'?'selected':''}>Marketing</option>
                <option value="Vendas" ${t.specialty==='Vendas'?'selected':''}>Vendas</option>
                <option value="Design" ${t.specialty==='Design'?'selected':''}>Design</option>
                <option value="Desenvolvimento" ${t.specialty==='Desenvolvimento'?'selected':''}>Desenvolvimento</option>
                <option value="Audiovisual" ${t.specialty==='Audiovisual'?'selected':''}>Audiovisual</option>
                <option value="Outro" ${t.specialty==='Outro'?'selected':''}>Outro</option>
              </select>
            </div>
            <div><label class="form-label">Senioridade</label>
              <select class="form-input" id="rhTalentoSeniority">
                <option value="">Selecionar...</option>
                <option value="Jr" ${t.seniority==='Jr'?'selected':''}>Jr</option>
                <option value="Pleno" ${t.seniority==='Pleno'?'selected':''}>Pleno</option>
                <option value="Senior" ${t.seniority==='Senior'?'selected':''}>Senior</option>
                <option value="Especialista" ${t.seniority==='Especialista'?'selected':''}>Especialista</option>
              </select>
            </div>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div><label class="form-label">Cidade</label><input class="form-input" id="rhTalentoCity" value="${esc(t.city)}"></div>
            <div><label class="form-label">Estado</label><input class="form-input" id="rhTalentoState" value="${esc(t.state)}"></div>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div><label class="form-label">Portfolio URL</label><input class="form-input" id="rhTalentoPortfolio" type="url" value="${esc(t.portfolio_url)}"></div>
            <div><label class="form-label">LinkedIn URL</label><input class="form-input" id="rhTalentoLinkedin" type="url" value="${esc(t.linkedin_url)}"></div>
          </div>
          <div style="margin-bottom:12px;">
            <label class="form-label">Tags (separadas por virgula)</label>
            <input class="form-input" id="rhTalentoTags" value="${(t.tags || []).join(', ')}">
          </div>
          <div style="margin-bottom:16px;">
            <label class="form-label">Observacoes</label>
            <textarea class="form-input" id="rhTalentoNotes" rows="3">${esc(t.notes)}</textarea>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" id="rhTalentoCancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar</button>
          </div>
        </form>
      `;
    },

    async _loadTalentos() {
      if (typeof TalentsRepo === 'undefined') return;
      this._talentsLoading = true;
      const tableEl = document.getElementById('rhTalentosTable');
      if (tableEl) tableEl.innerHTML = this._renderTalentosTable();

      try {
        const f = this._talentsFilter;
        const opts = {};
        if (f.status) opts.status = f.status;
        if (f.specialty) opts.specialty = f.specialty;
        if (f.seniority) opts.seniority = f.seniority;
        if (f.search) opts.search = f.search;

        const result = await TalentsRepo.list(opts);
        this._talentsData = result.data;
        this._talentsCount = result.count;
      } catch (err) {
        console.error('[RH] Erro ao carregar talentos:', err);
        TBO_TOAST.error('Erro ao carregar banco de talentos');
        this._talentsData = [];
      }
      this._talentsLoading = false;

      if (tableEl) {
        tableEl.innerHTML = this._renderTalentosTable();
        if (window.lucide) lucide.createIcons({ root: tableEl });
        this._bindTalentosActions();
      }
      const kpis = document.getElementById('rhTalentosKPIs');
      if (kpis) { kpis.innerHTML = this._renderTalentosKPIs(); }
    },

    _bindTalentosActions() {
      const self = this;
      document.querySelectorAll('.rh-talent-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (typeof TalentsRepo === 'undefined') return;
          try {
            const talent = await TalentsRepo.getById(btn.dataset.id);
            self._openTalentoModal(talent);
          } catch (e) { TBO_TOAST.error('Erro ao carregar talento'); }
        });
      });
      document.querySelectorAll('.rh-talent-archive').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (typeof TalentsRepo === 'undefined') return;
          if (!confirm('Arquivar este talento?')) return;
          try {
            await TalentsRepo.archive(btn.dataset.id);
            TBO_TOAST.success('Talento arquivado');
            self._loadTalentos();
          } catch (e) { TBO_TOAST.error('Erro ao arquivar talento'); }
        });
      });
    },

    _openTalentoModal(talent) {
      const self = this;
      const modal = document.getElementById('rhTalentoModal');
      const content = document.getElementById('rhTalentoModalContent');
      if (!modal || !content) return;
      content.innerHTML = this._renderTalentoModalContent(talent);
      modal.style.display = 'flex';
      // Ativar transicao CSS (opacity + visibility)
      requestAnimationFrame(() => modal.classList.add('active'));
      if (window.lucide) lucide.createIcons({ root: modal });

      // Helper para fechar modal com animacao
      const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 200);
      };

      // Bind modal events
      document.getElementById('rhTalentoModalClose')?.addEventListener('click', closeModal);
      document.getElementById('rhTalentoCancel')?.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

      document.getElementById('rhTalentoForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('rhTalentoId')?.value;
        const tagsRaw = document.getElementById('rhTalentoTags')?.value || '';
        const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

        const payload = {
          full_name: document.getElementById('rhTalentoNome')?.value?.trim(),
          email: document.getElementById('rhTalentoEmail')?.value?.trim() || null,
          phone: document.getElementById('rhTalentoPhone')?.value?.trim() || null,
          specialty: document.getElementById('rhTalentoSpecialty')?.value || null,
          seniority: document.getElementById('rhTalentoSeniority')?.value || null,
          city: document.getElementById('rhTalentoCity')?.value?.trim() || null,
          state: document.getElementById('rhTalentoState')?.value?.trim() || null,
          portfolio_url: document.getElementById('rhTalentoPortfolio')?.value?.trim() || null,
          linkedin_url: document.getElementById('rhTalentoLinkedin')?.value?.trim() || null,
          source: document.getElementById('rhTalentoSource')?.value || null,
          tags: tags.length ? tags : null,
          notes: document.getElementById('rhTalentoNotes')?.value?.trim() || null,
        };

        if (!payload.full_name) { TBO_TOAST.warning('Nome e obrigatorio'); return; }

        try {
          if (id) { await TalentsRepo.update(id, payload); TBO_TOAST.success('Talento atualizado!'); }
          else { await TalentsRepo.create(payload); TBO_TOAST.success('Talento cadastrado!'); }
          closeModal();
          self._loadTalentos();
        } catch (err) {
          console.error('[RH] Erro ao salvar talento:', err);
          TBO_TOAST.error('Erro ao salvar talento');
        }
      });
    },

    // ══════════════════════════════════════════════════════════════════
    // INIT
    // ══════════════════════════════════════════════════════════════════
    init() {
      this._initBancoTalentos();
    },

    _initBancoTalentos() {
      const self = this;

      // Botao novo talento
      document.getElementById('rhBtnNovoTalento')?.addEventListener('click', () => {
        self._openTalentoModal(null);
      });

      // Filtros
      let searchTimer = null;
      const searchInput = document.querySelector('.rh-talentos-search');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          clearTimeout(searchTimer);
          searchTimer = setTimeout(() => {
            self._talentsFilter.search = searchInput.value.trim();
            self._loadTalentos();
          }, 300);
        });
      }

      document.querySelector('.rh-talentos-filter-specialty')?.addEventListener('change', (e) => {
        self._talentsFilter.specialty = e.target.value;
        self._loadTalentos();
      });
      document.querySelector('.rh-talentos-filter-seniority')?.addEventListener('change', (e) => {
        self._talentsFilter.seniority = e.target.value;
        self._loadTalentos();
      });
      document.querySelector('.rh-talentos-filter-status')?.addEventListener('change', (e) => {
        self._talentsFilter.status = e.target.value;
        self._loadTalentos();
      });

      // Carregar dados iniciais se estiver na tab
      if (S._activeTab === 'banco-talentos') {
        self._loadTalentos();
      }
    },

    // ══════════════════════════════════════════════════════════════════
    // DESTROY
    // ══════════════════════════════════════════════════════════════════
    destroy() {}
  };

  TBO_PEOPLE.registerTab('banco-talentos', TabTalentos);
})();
