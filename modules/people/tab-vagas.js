// TBO OS — People Tab: Vagas
// Sub-modulo lazy-loaded

(function() {
  const S = TBO_PEOPLE_SHARED;

  const TabVagas = {
    // ── Estado especifico da tab ──
    _vagasData: [],
    _vagasCount: 0,
    _vagasLoading: false,
    _vagasFilter: { status: '', area: '', priority: '', search: '' },
    _vagaDetalheId: null,

    // ══════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════
    render() {
      return this._renderVagas();
    },

    _renderVagas() {
      // Se estiver mostrando detalhe de uma vaga, renderizar detalhe
      if (this._vagaDetalheId) {
        return S._pageHeader('Detalhe da Vaga', 'Pipeline de candidatos e informações da vaga') + this._renderVagaDetalhe();
      }

      const f = this._vagasFilter;
      return `
        ${S._pageHeader('Vagas', 'Gestão de vagas abertas e processo seletivo')}
        <div class="rh-vagas-section">
          <!-- KPIs -->
          <div id="rhVagasKPIs" class="grid-4" style="margin-bottom:20px;">
            ${this._renderVagasKPIs()}
          </div>

          <!-- Toolbar -->
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap;">
            <input type="text" class="form-input rh-vagas-search" placeholder="Buscar vagas..." value="${f.search}" style="flex:1; min-width:200px;">
            <select class="form-input rh-vagas-filter-area" style="width:160px;">
              <option value="">Todas Areas</option>
              <option value="Branding" ${f.area==='Branding'?'selected':''}>Branding</option>
              <option value="Digital 3D" ${f.area==='Digital 3D'?'selected':''}>Digital 3D</option>
              <option value="Marketing" ${f.area==='Marketing'?'selected':''}>Marketing</option>
              <option value="Vendas" ${f.area==='Vendas'?'selected':''}>Vendas</option>
              <option value="Operacao" ${f.area==='Operacao'?'selected':''}>Operacao</option>
            </select>
            <select class="form-input rh-vagas-filter-status" style="width:140px;">
              <option value="">Todos Status</option>
              <option value="draft" ${f.status==='draft'?'selected':''}>Rascunho</option>
              <option value="open" ${f.status==='open'?'selected':''}>Aberta</option>
              <option value="in_progress" ${f.status==='in_progress'?'selected':''}>Em Andamento</option>
              <option value="paused" ${f.status==='paused'?'selected':''}>Pausada</option>
              <option value="closed" ${f.status==='closed'?'selected':''}>Fechada</option>
              <option value="filled" ${f.status==='filled'?'selected':''}>Preenchida</option>
            </select>
            <select class="form-input rh-vagas-filter-priority" style="width:130px;">
              <option value="">Prioridade</option>
              <option value="urgent" ${f.priority==='urgent'?'selected':''}>Urgente</option>
              <option value="high" ${f.priority==='high'?'selected':''}>Alta</option>
              <option value="medium" ${f.priority==='medium'?'selected':''}>Media</option>
              <option value="low" ${f.priority==='low'?'selected':''}>Baixa</option>
            </select>
            <button class="btn btn-primary" id="rhBtnNovaVaga" style="white-space:nowrap;">
              <i data-lucide="briefcase" style="width:16px;height:16px;"></i> Nova Vaga
            </button>
          </div>

          <!-- Tabela -->
          <div id="rhVagasTable" class="rh-tabela-card" style="overflow-x:auto;">
            ${this._renderVagasTable()}
          </div>
        </div>

        <!-- Modal Vaga -->
        <div id="rhVagaModal" class="modal-overlay" style="display:none;">
          <div class="modal" style="max-width:600px;">
            <div id="rhVagaModalContent"></div>
          </div>
        </div>
      `;
    },

    _renderVagasKPIs() {
      const all = this._vagasData || [];
      const open = all.filter(v => v.status === 'open').length;
      const inProg = all.filter(v => v.status === 'in_progress').length;
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const closedMonth = all.filter(v => v.closed_at && new Date(v.closed_at) >= firstOfMonth).length;
      return `
        <div class="kpi-card"><div class="kpi-label">Total Vagas</div><div class="kpi-value">${all.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Abertas</div><div class="kpi-value" style="color:var(--color-success)">${open}</div></div>
        <div class="kpi-card"><div class="kpi-label">Em Andamento</div><div class="kpi-value" style="color:var(--accent-gold)">${inProg}</div></div>
        <div class="kpi-card"><div class="kpi-label">Fechadas (mes)</div><div class="kpi-value" style="color:var(--text-muted)">${closedMonth}</div></div>
      `;
    },

    _vagaStatusLabel(s) {
      const map = { draft:'Rascunho', open:'Aberta', in_progress:'Em Andamento', paused:'Pausada', closed:'Fechada', filled:'Preenchida' };
      return map[s] || s || 'Aberta';
    },
    _vagaStatusColor(s) {
      const map = { draft:'#94A3B8', open:'#2ECC71', in_progress:'#F59E0B', paused:'#6B7280', closed:'#EF4444', filled:'#8B5CF6' };
      return map[s] || '#94A3B8';
    },
    _vagaPriorityLabel(p) {
      const map = { low:'Baixa', medium:'Media', high:'Alta', urgent:'Urgente' };
      return map[p] || p || 'Media';
    },
    _vagaPriorityColor(p) {
      const map = { low:'#94A3B8', medium:'#3B82F6', high:'#F59E0B', urgent:'#EF4444' };
      return map[p] || '#94A3B8';
    },

    _renderVagasTable() {
      if (this._vagasLoading) {
        return '<div style="padding:40px;text-align:center;"><div class="rh-skeleton" style="height:200px;border-radius:8px;"></div></div>';
      }
      const vagas = this._vagasData || [];
      if (!vagas.length) {
        return `<div class="empty-state" style="padding:60px 20px;text-align:center;">
          <i data-lucide="briefcase" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
          <h3 style="color:var(--text-muted);margin:0 0 4px;">Nenhuma vaga cadastrada</h3>
          <p style="color:var(--text-muted);font-size:0.85rem;">Clique em "Nova Vaga" para criar uma vaga.</p>
        </div>`;
      }
      const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
      const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
      return `
        <table class="rh-bu-table">
          <thead><tr>
            <th>Titulo</th><th>Area</th><th>Status</th><th>Prioridade</th><th>Abertura</th><th style="width:80px;">Acoes</th>
          </tr></thead>
          <tbody>
            ${vagas.map(v => `
              <tr class="rh-bu-row rh-person-row rh-vaga-row" data-id="${v.id}" style="cursor:pointer;">
                <td style="font-weight:600;">${esc(v.title)}</td>
                <td>${esc(v.area)}</td>
                <td><span class="tag" style="background:${this._vagaStatusColor(v.status)}20;color:${this._vagaStatusColor(v.status)};font-size:0.7rem;">${this._vagaStatusLabel(v.status)}</span></td>
                <td><span class="tag" style="background:${this._vagaPriorityColor(v.priority)}20;color:${this._vagaPriorityColor(v.priority)};font-size:0.7rem;">${this._vagaPriorityLabel(v.priority)}</span></td>
                <td style="font-size:0.78rem;">${formatDate(v.opened_at)}</td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="btn btn-sm rh-vaga-edit" data-id="${v.id}" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                    <button class="btn btn-sm rh-vaga-close" data-id="${v.id}" title="Fechar vaga" ${v.status==='closed'||v.status==='filled'?'disabled':''}><i data-lucide="x-circle" style="width:14px;height:14px;"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    },

    _renderVagaDetalhe() {
      const vaga = this._vagasData.find(v => v.id === this._vagaDetalheId);
      if (!vaga) {
        this._vagaDetalheId = null;
        return this._renderVagas();
      }
      const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
      const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

      return `
        <div class="rh-vaga-detalhe">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <button class="btn btn-secondary btn-sm" id="rhVagaVoltarLista"><i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Voltar</button>
              <h2 style="margin:0;">${esc(vaga.title)}</h2>
              <span class="tag" style="background:${this._vagaStatusColor(vaga.status)}20;color:${this._vagaStatusColor(vaga.status)};">${this._vagaStatusLabel(vaga.status)}</span>
            </div>
            <button class="btn btn-primary btn-sm" id="rhVagaVincularTalento"><i data-lucide="link" style="width:14px;height:14px;"></i> Vincular Talento</button>
          </div>

          <div class="grid-2" style="gap:20px;margin-bottom:24px;">
            <div class="card" style="padding:16px;">
              <h4 style="margin:0 0 8px;font-size:0.85rem;color:var(--text-muted);">Informacoes</h4>
              <p style="margin:4px 0;font-size:0.85rem;"><strong>Area:</strong> ${esc(vaga.area) || '-'}</p>
              <p style="margin:4px 0;font-size:0.85rem;"><strong>Prioridade:</strong> ${this._vagaPriorityLabel(vaga.priority)}</p>
              <p style="margin:4px 0;font-size:0.85rem;"><strong>Abertura:</strong> ${formatDate(vaga.opened_at)}</p>
              ${vaga.closed_at ? `<p style="margin:4px 0;font-size:0.85rem;"><strong>Fechamento:</strong> ${formatDate(vaga.closed_at)}</p>` : ''}
            </div>
            <div class="card" style="padding:16px;">
              <h4 style="margin:0 0 8px;font-size:0.85rem;color:var(--text-muted);">Descricao</h4>
              <p style="font-size:0.85rem;white-space:pre-wrap;">${esc(vaga.description) || 'Sem descricao'}</p>
              ${vaga.requirements ? `<h4 style="margin:12px 0 8px;font-size:0.85rem;color:var(--text-muted);">Requisitos</h4><p style="font-size:0.85rem;white-space:pre-wrap;">${esc(vaga.requirements)}</p>` : ''}
            </div>
          </div>

          <!-- Pipeline de candidatos -->
          <h3 style="margin:0 0 12px;">Candidatos Vinculados</h3>
          <div id="rhVagaCandidatos">
            <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Carregando candidatos...</div>
          </div>
        </div>

        <!-- Modal Vincular Talento -->
        <div id="rhVinculaTalentoModal" class="modal-overlay" style="display:none;">
          <div class="modal" style="max-width:500px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h3 style="margin:0;">Vincular Talento</h3>
              <button class="btn btn-sm" id="rhVinculaTalentoClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
            </div>
            <input type="text" class="form-input" id="rhVinculaTalentoBusca" placeholder="Buscar por nome ou email..." style="margin-bottom:12px;">
            <div id="rhVinculaTalentoResults" style="max-height:300px;overflow-y:auto;"></div>
          </div>
        </div>
      `;
    },

    _stageLabel(s) {
      const map = { applied:'Inscrito', screening:'Triagem', interview:'Entrevista', offer:'Proposta', hired:'Contratado', rejected:'Rejeitado' };
      return map[s] || s || 'Inscrito';
    },
    _stageColor(s) {
      const map = { applied:'#94A3B8', screening:'#3B82F6', interview:'#F59E0B', offer:'#8B5CF6', hired:'#2ECC71', rejected:'#EF4444' };
      return map[s] || '#94A3B8';
    },

    async _loadVagaCandidatos() {
      if (typeof TalentsRepo === 'undefined' || !this._vagaDetalheId) return;
      const self = this;
      const container = document.getElementById('rhVagaCandidatos');
      if (!container) return;

      try {
        const candidates = await TalentsRepo.getByVacancy(this._vagaDetalheId);
        if (!candidates.length) {
          container.innerHTML = `<div class="empty-state" style="padding:30px;text-align:center;">
            <i data-lucide="users" style="width:36px;height:36px;color:var(--text-muted);margin-bottom:8px;"></i>
            <p style="color:var(--text-muted);font-size:0.85rem;">Nenhum candidato vinculado a esta vaga.</p>
          </div>`;
          if (window.lucide) lucide.createIcons({ root: container });
          return;
        }

        const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
        const stages = ['applied','screening','interview','offer','hired','rejected'];

        container.innerHTML = `
          <table class="rh-bu-table">
            <thead><tr><th>Nome</th><th>Especialidade</th><th>Etapa</th><th style="width:120px;">Acoes</th></tr></thead>
            <tbody>
              ${candidates.map(c => {
                const t = c.talents || {};
                return `
                  <tr class="rh-bu-row">
                    <td style="font-weight:600;">${esc(t.full_name)}</td>
                    <td>${esc(t.specialty)}</td>
                    <td>
                      <select class="form-input rh-candidate-stage" data-talent="${c.talent_id}" style="font-size:0.78rem;padding:4px 8px;">
                        ${stages.map(s => `<option value="${s}" ${c.stage===s?'selected':''}>${self._stageLabel(s)}</option>`).join('')}
                      </select>
                    </td>
                    <td>
                      <button class="btn btn-sm rh-candidate-unlink" data-talent="${c.talent_id}" title="Desvincular"><i data-lucide="unlink" style="width:14px;height:14px;"></i></button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
        if (window.lucide) lucide.createIcons({ root: container });

        // Bind stage change
        container.querySelectorAll('.rh-candidate-stage').forEach(sel => {
          sel.addEventListener('change', async () => {
            try {
              await TalentsRepo.updateCandidateStage(sel.dataset.talent, self._vagaDetalheId, sel.value);
              TBO_TOAST.success('Etapa atualizada');
            } catch (e) { TBO_TOAST.error('Erro ao atualizar etapa'); }
          });
        });

        // Bind unlink
        container.querySelectorAll('.rh-candidate-unlink').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Desvincular este candidato da vaga?')) return;
            try {
              await TalentsRepo.unlinkFromVacancy(btn.dataset.talent, self._vagaDetalheId);
              TBO_TOAST.success('Candidato desvinculado');
              self._loadVagaCandidatos();
            } catch (e) { TBO_TOAST.error('Erro ao desvincular'); }
          });
        });
      } catch (err) {
        console.error('[RH] Erro ao carregar candidatos:', err);
        container.innerHTML = '<p style="color:var(--color-danger);padding:12px;">Erro ao carregar candidatos.</p>';
      }
    },

    _renderVagaModalContent(vaga) {
      const v = vaga || {};
      const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="margin:0;">${v.id ? 'Editar Vaga' : 'Nova Vaga'}</h3>
          <button class="btn btn-sm" id="rhVagaModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="rhVagaForm">
          <input type="hidden" id="rhVagaId" value="${v.id || ''}">
          <div style="margin-bottom:12px;">
            <label class="form-label">Titulo *</label>
            <input class="form-input" id="rhVagaTitulo" value="${esc(v.title)}" required>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div><label class="form-label">Area</label>
              <select class="form-input" id="rhVagaArea">
                <option value="">Selecionar...</option>
                <option value="Branding" ${v.area==='Branding'?'selected':''}>Branding</option>
                <option value="Digital 3D" ${v.area==='Digital 3D'?'selected':''}>Digital 3D</option>
                <option value="Marketing" ${v.area==='Marketing'?'selected':''}>Marketing</option>
                <option value="Vendas" ${v.area==='Vendas'?'selected':''}>Vendas</option>
                <option value="Operacao" ${v.area==='Operacao'?'selected':''}>Operacao</option>
              </select>
            </div>
            <div><label class="form-label">Prioridade</label>
              <select class="form-input" id="rhVagaPrioridade">
                <option value="low" ${v.priority==='low'?'selected':''}>Baixa</option>
                <option value="medium" ${v.priority==='medium'||!v.priority?'selected':''}>Media</option>
                <option value="high" ${v.priority==='high'?'selected':''}>Alta</option>
                <option value="urgent" ${v.priority==='urgent'?'selected':''}>Urgente</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <label class="form-label">Descricao</label>
            <textarea class="form-input" id="rhVagaDescricao" rows="3">${esc(v.description)}</textarea>
          </div>
          <div style="margin-bottom:12px;">
            <label class="form-label">Requisitos</label>
            <textarea class="form-input" id="rhVagaRequisitos" rows="3">${esc(v.requirements)}</textarea>
          </div>
          <div style="margin-bottom:16px;">
            <label class="form-label">Notas</label>
            <textarea class="form-input" id="rhVagaNotas" rows="2">${esc(v.notes)}</textarea>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" id="rhVagaCancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar</button>
          </div>
        </form>
      `;
    },

    async _loadVagas() {
      if (typeof VacanciesRepo === 'undefined') return;
      this._vagasLoading = true;
      const tableEl = document.getElementById('rhVagasTable');
      if (tableEl) tableEl.innerHTML = this._renderVagasTable();

      try {
        const f = this._vagasFilter;
        const opts = {};
        if (f.status) opts.status = f.status;
        if (f.area) opts.area = f.area;
        if (f.priority) opts.priority = f.priority;
        if (f.search) opts.search = f.search;

        const result = await VacanciesRepo.list(opts);
        this._vagasData = result.data;
        this._vagasCount = result.count;
      } catch (err) {
        console.error('[RH] Erro ao carregar vagas:', err);
        TBO_TOAST.error('Erro ao carregar vagas');
        this._vagasData = [];
      }
      this._vagasLoading = false;

      if (tableEl) {
        tableEl.innerHTML = this._renderVagasTable();
        if (window.lucide) lucide.createIcons({ root: tableEl });
        this._bindVagasActions();
      }
      const kpis = document.getElementById('rhVagasKPIs');
      if (kpis) { kpis.innerHTML = this._renderVagasKPIs(); }
    },

    _bindVagasActions() {
      const self = this;

      // Clicar na linha abre detalhe
      document.querySelectorAll('.rh-vaga-row').forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('button')) return; // nao abrir se clicou em acao
          self._vagaDetalheId = row.dataset.id;
          const tabContent = document.getElementById('rhTabContent');
          if (tabContent) {
            tabContent.innerHTML = self.render();
            self.init();
            if (window.lucide) lucide.createIcons();
          }
        });
      });

      document.querySelectorAll('.rh-vaga-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const vaga = self._vagasData.find(v => v.id === btn.dataset.id);
          if (vaga) self._openVagaModal(vaga);
        });
      });

      document.querySelectorAll('.rh-vaga-close').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm('Fechar esta vaga?')) return;
          try {
            await VacanciesRepo.close(btn.dataset.id);
            TBO_TOAST.success('Vaga fechada');
            self._loadVagas();
          } catch (e) { TBO_TOAST.error('Erro ao fechar vaga'); }
        });
      });
    },

    // Metodo publico — chamavel pelo shell via delegation
    _openVagaModal(vaga) {
      const self = this;
      let modal = document.getElementById('rhVagaModal');
      const content = document.getElementById('rhVagaModalContent');

      // Fallback: se modal nao existe no DOM (re-render destruiu), criar dinamicamente
      if (!modal) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<div id="rhVagaModal" class="modal-overlay" style="display:none;">
          <div class="modal" style="max-width:600px;"><div id="rhVagaModalContent"></div></div>
        </div>`;
        document.body.appendChild(wrapper.firstElementChild);
        modal = document.getElementById('rhVagaModal');
      }
      const modalContent = document.getElementById('rhVagaModalContent');
      if (!modal || !modalContent) return;

      modalContent.innerHTML = this._renderVagaModalContent(vaga);
      modal.style.display = 'flex';
      // Ativar transicao CSS (opacity + visibility)
      requestAnimationFrame(() => modal.classList.add('active'));
      if (window.lucide) lucide.createIcons({ root: modal });

      // Helper para fechar modal com animacao
      const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 200);
      };
      document.getElementById('rhVagaModalClose')?.addEventListener('click', closeModal);
      document.getElementById('rhVagaCancel')?.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
      const escHandler = (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          closeModal();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      // Focus no primeiro campo para UX
      setTimeout(() => document.getElementById('rhVagaTitulo')?.focus(), 100);

      document.getElementById('rhVagaForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('rhVagaId')?.value;

        const payload = {
          title: document.getElementById('rhVagaTitulo')?.value?.trim(),
          area: document.getElementById('rhVagaArea')?.value || null,
          priority: document.getElementById('rhVagaPrioridade')?.value || 'medium',
          description: document.getElementById('rhVagaDescricao')?.value?.trim() || null,
          requirements: document.getElementById('rhVagaRequisitos')?.value?.trim() || null,
          notes: document.getElementById('rhVagaNotas')?.value?.trim() || null,
        };

        if (!payload.title) { TBO_TOAST.warning('Titulo e obrigatorio'); return; }

        try {
          if (id) { await VacanciesRepo.update(id, payload); TBO_TOAST.success('Vaga atualizada!'); }
          else { await VacanciesRepo.create(payload); TBO_TOAST.success('Vaga criada!'); }
          closeModal();
          self._loadVagas();
        } catch (err) {
          console.error('[RH] Erro ao salvar vaga:', err);
          TBO_TOAST.error('Erro ao salvar vaga');
        }
      });
    },

    // ══════════════════════════════════════════════════════════════════
    // INIT
    // ══════════════════════════════════════════════════════════════════
    init() {
      this._initVagas();
    },

    _initVagas() {
      const self = this;

      // Botao nova vaga (backup — delegation principal no init())
      document.getElementById('rhBtnNovaVaga')?.addEventListener('click', () => {
        self._openVagaModal(null);
      });

      // Voltar da view detalhe
      document.getElementById('rhVagaVoltarLista')?.addEventListener('click', () => {
        self._vagaDetalheId = null;
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) {
          tabContent.innerHTML = self.render();
          self.init();
          if (window.lucide) lucide.createIcons();
        }
      });

      // Vincular talento (na view detalhe)
      document.getElementById('rhVagaVincularTalento')?.addEventListener('click', () => {
        const modal = document.getElementById('rhVinculaTalentoModal');
        if (modal) {
          modal.style.display = 'flex';
          requestAnimationFrame(() => modal.classList.add('active'));
          if (window.lucide) lucide.createIcons({ root: modal });
        }
      });
      document.getElementById('rhVinculaTalentoClose')?.addEventListener('click', () => {
        const modal = document.getElementById('rhVinculaTalentoModal');
        if (modal) {
          modal.classList.remove('active');
          setTimeout(() => { modal.style.display = 'none'; }, 200);
        }
      });

      // Busca de talentos para vincular
      let vinculaTimer = null;
      document.getElementById('rhVinculaTalentoBusca')?.addEventListener('input', (e) => {
        clearTimeout(vinculaTimer);
        vinculaTimer = setTimeout(async () => {
          const query = e.target.value.trim();
          const results = document.getElementById('rhVinculaTalentoResults');
          if (!results || !query || query.length < 2) { if (results) results.innerHTML = ''; return; }

          try {
            const talents = await TalentsRepo.search(query);
            const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
            if (!talents.length) {
              results.innerHTML = '<p style="padding:12px;color:var(--text-muted);text-align:center;">Nenhum talento encontrado.</p>';
              return;
            }
            results.innerHTML = talents.map(t => `
              <div class="rh-vincula-talent-item" data-id="${t.id}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--border-subtle);cursor:pointer;transition:background 0.15s;">
                <div>
                  <div style="font-weight:600;font-size:0.85rem;">${esc(t.full_name)}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);">${esc(t.specialty)} · ${esc(t.seniority)}</div>
                </div>
                <button class="btn btn-sm btn-primary rh-vincula-btn" data-id="${t.id}">Vincular</button>
              </div>
            `).join('');

            results.querySelectorAll('.rh-vincula-btn').forEach(btn => {
              btn.addEventListener('click', async () => {
                try {
                  await TalentsRepo.linkToVacancy(btn.dataset.id, self._vagaDetalheId);
                  TBO_TOAST.success('Talento vinculado a vaga!');
                  document.getElementById('rhVinculaTalentoModal').style.display = 'none';
                  self._loadVagaCandidatos();
                } catch (e) {
                  if (e.message?.includes('duplicate')) TBO_TOAST.warning('Talento ja vinculado');
                  else TBO_TOAST.error('Erro ao vincular talento');
                }
              });
            });
          } catch (e) { results.innerHTML = '<p style="padding:12px;color:var(--color-danger);">Erro na busca.</p>'; }
        }, 300);
      });

      // Filtros
      let searchTimer = null;
      const searchInput = document.querySelector('.rh-vagas-search');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          clearTimeout(searchTimer);
          searchTimer = setTimeout(() => {
            self._vagasFilter.search = searchInput.value.trim();
            self._loadVagas();
          }, 300);
        });
      }

      document.querySelector('.rh-vagas-filter-area')?.addEventListener('change', (e) => {
        self._vagasFilter.area = e.target.value;
        self._loadVagas();
      });
      document.querySelector('.rh-vagas-filter-status')?.addEventListener('change', (e) => {
        self._vagasFilter.status = e.target.value;
        self._loadVagas();
      });
      document.querySelector('.rh-vagas-filter-priority')?.addEventListener('change', (e) => {
        self._vagasFilter.priority = e.target.value;
        self._loadVagas();
      });

      // Carregar dados iniciais se estiver na tab
      if (S._activeTab === 'vagas') {
        self._loadVagas();
        // Se estiver mostrando detalhe, carregar candidatos tambem
        if (self._vagaDetalheId) {
          self._loadVagaCandidatos();
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════
    // DESTROY
    // ══════════════════════════════════════════════════════════════════
    destroy() {}
  };

  TBO_PEOPLE.registerTab('vagas', TabVagas);
})();
