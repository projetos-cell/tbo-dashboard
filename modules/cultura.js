// TBO OS — Module: Manual de Cultura
// Viewer for TBO culture manual content (from Notion + Supabase culture_pages)
const TBO_CULTURA = {

  _currentSection: null,
  _customPages: [],  // Paginas do Supabase (culture_pages)
  _tab: 'manual',    // manual | paginas | editor

  render() {
    const data = typeof TBO_CULTURA_DATA !== 'undefined' ? TBO_CULTURA_DATA : null;
    const sections = data ? [data.sobre, data.mvv, data.estrategia, data.comunicacao, data.estrutura, data.politicas, data.ferramentas, data.cultura] : [];

    return `
    <div class="cultura-module">
      <div class="cultura-header">
        <div class="cultura-header-info">
          <h2 class="cultura-title">Manual de Cultura TBO</h2>
          <p class="cultura-subtitle">Fonte: Notion + Supabase &mdash; Atualizado em ${data?.metadata?.lastUpdate || new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="cultura-header-stats">
          <div class="cultura-stat"><span class="cultura-stat-num">${sections.length + this._customPages.length}</span><span class="cultura-stat-label">Secoes</span></div>
          <div class="cultura-stat"><span class="cultura-stat-num">${this._getHeadcount()}</span><span class="cultura-stat-label">Pessoas</span></div>
          <div class="cultura-stat"><span class="cultura-stat-num">${this._getBUCount()}</span><span class="cultura-stat-label">BUs</span></div>
        </div>
      </div>

      <div class="cultura-grid">
        ${sections.map(s => `
          <button class="cultura-card" data-section="${s.id}">
            <div class="cultura-card-icon"><i data-lucide="${s.icon}"></i></div>
            <div class="cultura-card-body">
              <h3 class="cultura-card-title">${s.titulo}</h3>
              <p class="cultura-card-desc">${s.resumo}</p>
            </div>
            <i data-lucide="chevron-right" class="cultura-card-arrow"></i>
          </button>
        `).join('')}
      </div>

      <div class="cultura-detail" id="culturaDetail" style="display:none;">
        <button class="cultura-back" id="culturaBack"><i data-lucide="arrow-left"></i> Voltar ao Manual</button>
        <div class="cultura-detail-content" id="culturaDetailContent"></div>
      </div>
    </div>`;
  },

  _renderCustomPages() {
    const categories = { valores: 'Valores', praticas: 'Praticas', rituais: 'Rituais', padroes: 'Padroes', geral: 'Geral' };

    if (!this._customPages.length) {
      return `<div class="card" style="text-align:center;padding:32px;"><p style="color:var(--text-muted);">Nenhuma pagina customizada. Crie uma na aba "Nova Pagina".</p></div>`;
    }

    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
        ${this._customPages.map(p => `
          <div class="card" style="cursor:pointer;" data-page-id="${p.id}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span class="tag" style="font-size:0.62rem;">${categories[p.category] || p.category || 'Geral'}</span>
              ${p.is_published ? '' : '<span class="tag" style="font-size:0.62rem;background:var(--color-warning)18;color:var(--color-warning);">Rascunho</span>'}
            </div>
            <h3 style="margin:0 0 4px;font-size:0.92rem;">${this._esc(p.title)}</h3>
            <p style="font-size:0.75rem;color:var(--text-secondary);margin:0;line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">
              ${this._esc((p.content || '').substring(0, 200))}
            </p>
          </div>
        `).join('')}
      </div>
    `;
  },

  _renderEditor() {
    return `
      <div class="card" style="max-width:640px;">
        <h3 style="margin:0 0 16px;font-size:0.92rem;">Nova Pagina de Cultura</h3>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <label style="font-size:0.82rem;font-weight:500;">
            Titulo
            <input type="text" id="cultPageTitle" placeholder="Ex: Politica de Home Office" style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);">
          </label>
          <label style="font-size:0.82rem;font-weight:500;">
            Categoria
            <select id="cultPageCategory" style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);">
              <option value="geral">Geral</option>
              <option value="valores">Valores</option>
              <option value="praticas">Praticas</option>
              <option value="rituais">Rituais</option>
              <option value="padroes">Padroes de Qualidade</option>
            </select>
          </label>
          <label style="font-size:0.82rem;font-weight:500;">
            Conteudo
            <textarea id="cultPageContent" rows="8" placeholder="Escreva o conteudo da pagina..." style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);resize:vertical;"></textarea>
          </label>
          <div style="display:flex;gap:12px;">
            <button class="btn btn-primary" id="cultPageSave">Salvar Pagina</button>
            <button class="btn btn-ghost" id="cultPageCancel">Cancelar</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    document.querySelectorAll('.cultura-card').forEach(card => {
      card.addEventListener('click', () => {
        const sectionId = card.dataset.section;
        this._showSection(sectionId);
      });
    });

    const backBtn = document.getElementById('culturaBack');
    if (backBtn) backBtn.addEventListener('click', () => this._hideSection());

    // Editor save
    document.getElementById('cultPageSave')?.addEventListener('click', () => this._savePage());
    document.getElementById('cultPageCancel')?.addEventListener('click', () => { this._tab = 'paginas'; this._rerender(); });

    // Load custom pages
    this._loadCustomPages();

    if (window.lucide) lucide.createIcons();
  },

  async _loadCustomPages() {
    try {
      if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.getClient()) return;
      const client = TBO_SUPABASE.getClient();
      const tenantStr = localStorage.getItem('tbo_current_workspace');
      const tenantId = tenantStr ? JSON.parse(tenantStr).id : null;
      let query = client.from('culture_pages').select('*').order('order_index');
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) {
        console.warn('[Cultura] Erro ao carregar paginas:', error.message);
        return;
      }
      if (data) this._customPages = data;
    } catch (e) {
      console.warn('[Cultura] Erro ao carregar paginas:', e.message);
    }
  },

  async _savePage() {
    const title = document.getElementById('cultPageTitle')?.value?.trim();
    const category = document.getElementById('cultPageCategory')?.value;
    const content = document.getElementById('cultPageContent')?.value?.trim();

    if (!title) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Cultura', 'Preencha o titulo.');
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const client = TBO_SUPABASE?.getClient();
      if (client) {
        const tenantStr = localStorage.getItem('tbo_current_workspace');
        const tenantId = tenantStr ? JSON.parse(tenantStr).id : null;
        const { data: { user } } = await client.auth.getUser();

        await client.from('culture_pages').insert({
          tenant_id: tenantId,
          title, slug, content, category,
          is_published: true,
          created_by: user?.id,
          order_index: this._customPages.length
        });
      }
    } catch (e) {
      console.warn('[Cultura] Erro ao salvar:', e.message);
    }

    // Adicionar localmente tambem
    this._customPages.push({ id: 'local_' + Date.now(), title, slug, content, category, is_published: true });
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Cultura', 'Pagina criada!');
    this._tab = 'paginas';
    this._rerender();
  },

  _rerender() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
    }
  },

  _esc(str) {
    if (typeof _escapeHtml === 'function') return _escapeHtml(String(str || ''));
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  _showSection(sectionId) {
    const data = TBO_CULTURA_DATA;
    const detail = document.getElementById('culturaDetail');
    const content = document.getElementById('culturaDetailContent');
    const grid = document.querySelector('.cultura-grid');
    if (!detail || !content) return;

    this._currentSection = sectionId;
    let html = '';

    switch (sectionId) {
      case 'sobre': html = this._renderSobre(data.sobre); break;
      case 'mvv': html = this._renderMVV(data.mvv); break;
      case 'estrategia': html = this._renderEstrategia(data.estrategia); break;
      case 'comunicacao': html = this._renderComunicacao(data.comunicacao); break;
      case 'estrutura': html = this._renderEstrutura(data.estrutura); break;
      case 'politicas': html = this._renderPoliticas(data.politicas); break;
      case 'ferramentas': html = this._renderFerramentas(data.ferramentas); break;
      case 'cultura': html = this._renderCultura(data.cultura); break;
    }

    content.innerHTML = html;
    if (grid) grid.style.display = 'none';
    detail.style.display = 'block';
    if (window.lucide) lucide.createIcons();
  },

  _hideSection() {
    const detail = document.getElementById('culturaDetail');
    const grid = document.querySelector('.cultura-grid');
    if (detail) detail.style.display = 'none';
    if (grid) grid.style.display = '';
    this._currentSection = null;
  },

  // ── Section Renderers ──────────────────────────────────────────────

  _renderSobre(d) {
    return `
      <h2><i data-lucide="building-2"></i> ${d.titulo}</h2>
      <div class="cultura-text-block">${d.conteudo.manifesto}</div>
      <h3>Metodologia Think | Build | Own</h3>
      <div class="cultura-tbo-method">
        <div class="cultura-method-card" style="border-left:3px solid #E85102">
          <strong>Think</strong><p>${d.conteudo.metodologia.think}</p>
        </div>
        <div class="cultura-method-card" style="border-left:3px solid #3a7bd5">
          <strong>Build</strong><p>${d.conteudo.metodologia.build}</p>
        </div>
        <div class="cultura-method-card" style="border-left:3px solid #2ecc71">
          <strong>Own</strong><p>${d.conteudo.metodologia.own}</p>
        </div>
      </div>
      <h3>Numeros</h3>
      <div class="cultura-nums-grid">
        ${d.conteudo.numeros.map(n => `<div class="cultura-num-card"><span class="cultura-num-val">${n.valor}</span><span class="cultura-num-label">${n.label}</span></div>`).join('')}
      </div>
      <h3>Business Units</h3>
      <div class="cultura-tags">${d.conteudo.bus.map(b => `<span class="cultura-tag">${b}</span>`).join('')}</div>`;
  },

  _renderMVV(d) {
    return `
      <h2><i data-lucide="target"></i> ${d.titulo}</h2>
      <div class="cultura-mvv-section">
        <div class="cultura-mvv-card cultura-mvv-missao">
          <h3>Missao</h3>
          <p class="cultura-mvv-text">${d.missao.texto}</p>
          <ul>${d.missao.principios.map(p => `<li>${p}</li>`).join('')}</ul>
        </div>
        <div class="cultura-mvv-card cultura-mvv-visao">
          <h3>Visao</h3>
          <p class="cultura-mvv-text">${d.visao.texto}</p>
          <ul>${d.visao.elementos.map(e => `<li>${e}</li>`).join('')}</ul>
        </div>
      </div>
      <h3>Valores</h3>
      <div class="cultura-valores-grid">
        ${d.valores.map(v => `<div class="cultura-valor-card"><strong>${v.nome}</strong><p>${v.desc}</p></div>`).join('')}
      </div>`;
  },

  _renderEstrategia(d) {
    return `
      <h2><i data-lucide="compass"></i> ${d.titulo}</h2>
      <h3>5 Pilares Estrategicos</h3>
      <div class="cultura-pilares">
        ${d.pilares.map((p, i) => `<div class="cultura-pilar-card"><div class="cultura-pilar-num">${i + 1}</div><div><strong>${p.nome}</strong><p>${p.desc}</p></div></div>`).join('')}
      </div>
      <h3>Framework de Decisao</h3>
      <div class="cultura-callout">${d.frameworkDecisao}</div>`;
  },

  _renderComunicacao(d) {
    return `
      <h2><i data-lucide="message-circle"></i> ${d.titulo}</h2>
      <h3>Regras de Ouro</h3>
      <div class="cultura-regras-grid">
        ${d.regrasOuro.map(r => `<div class="cultura-regra-card cultura-regra-${r.cor}"><strong>${r.titulo}</strong><p>${r.desc}</p></div>`).join('')}
      </div>
      <h3>Ferramentas e Canais</h3>
      <div class="cultura-table-wrap"><table class="cultura-table">
        <thead><tr><th>Ferramenta</th><th>Uso</th></tr></thead>
        <tbody>${d.ferramentas.map(f => `<tr><td><strong>${f.nome}</strong></td><td>${f.uso}</td></tr>`).join('')}</tbody>
      </table></div>
      <h3>Rituais</h3>
      <ul class="cultura-list">${d.rituais.map(r => `<li>${r}</li>`).join('')}</ul>
      <h3>Tom de Voz</h3>
      <div class="cultura-tom-grid">
        ${d.tomDeVoz.map(t => `<div class="cultura-tom-card"><strong>${t.caracteristica}</strong><p>${t.desc}</p></div>`).join('')}
      </div>
      <h3>Vocabulario</h3>
      <div class="cultura-vocab">
        <div class="cultura-vocab-do"><strong>Usamos:</strong> ${d.palavrasUsamos}</div>
        <div class="cultura-vocab-dont"><strong>Evitamos:</strong> ${d.palavrasEvitamos}</div>
      </div>`;
  },

  _renderEstrutura(d) {
    return `
      <h2><i data-lucide="git-branch"></i> ${d.titulo}</h2>
      <p class="cultura-subtitle-text">Modelo: <strong>${d.modelo.tipo}</strong> &mdash; Total: <strong>${d.totalPessoas}</strong></p>
      <h3>Camadas Organizacionais</h3>
      <div class="cultura-camadas">
        ${d.modelo.camadas.map(c => `
          <div class="cultura-camada">
            <div class="cultura-camada-header">
              <span class="cultura-camada-nivel">Camada ${c.nivel}</span>
              <strong>${c.nome}</strong>
              <span class="cultura-camada-desc">${c.desc}</span>
            </div>
            <div class="cultura-camada-pessoas">${c.pessoas.map(p => `<span class="cultura-pessoa-chip">${p}</span>`).join('')}</div>
          </div>
        `).join('')}
      </div>
      <h3>Principios da Estrutura</h3>
      <div class="cultura-principios-list">
        ${d.principios.map(p => `<div class="cultura-principio-item"><strong>${p.nome}</strong><p>${p.desc}</p></div>`).join('')}
      </div>`;
  },

  _renderPoliticas(d) {
    return `
      <h2><i data-lucide="shield-check"></i> ${d.titulo}</h2>

      <h3>Politica Etica e Moral</h3>
      <div class="cultura-etica-principios">
        ${d.etica.principios.map(p => `<div class="cultura-etica-card"><strong>${p.nome}</strong><p>${p.desc}</p></div>`).join('')}
      </div>
      <div class="cultura-callout"><strong>Confidencialidade:</strong> ${d.etica.confidencialidade}</div>
      <h4>Canais de Relato</h4>
      <ul class="cultura-list">${d.etica.canaisRelato.map(c => `<li>${c}</li>`).join('')}</ul>
      <h4>Medidas por Gravidade</h4>
      <div class="cultura-table-wrap"><table class="cultura-table">
        <thead><tr><th>Nivel</th><th>Acao</th></tr></thead>
        <tbody>${d.etica.medidas.map(m => `<tr><td><strong>${m.nivel}</strong></td><td>${m.acao}</td></tr>`).join('')}</tbody>
      </table></div>

      <h3 style="margin-top:32px;">Politica Antiassedio</h3>
      <div class="cultura-callout cultura-callout-warn">${d.antiassedio.principio}</div>
      <h4>Tipos de Assedio</h4>
      <ul class="cultura-list cultura-list-warn">${d.antiassedio.tiposAssedio.map(t => `<li>${t}</li>`).join('')}</ul>
      <h4>Classificacao de Medidas</h4>
      <div class="cultura-table-wrap"><table class="cultura-table">
        <thead><tr><th>Nivel</th><th>Descricao</th></tr></thead>
        <tbody>${d.antiassedio.classificacao.map(c => `<tr><td><strong>Nivel ${c.nivel}</strong></td><td>${c.desc}</td></tr>`).join('')}</tbody>
      </table></div>

      <h3 style="margin-top:32px;">Limites e Regras (Cliente x TBO)</h3>
      <div class="cultura-limites-grid">
        ${d.limitesRegras.principiosCentrais.map(p => `<div class="cultura-limite-card"><strong>${p.nome}</strong><p>${p.desc}</p></div>`).join('')}
      </div>
      <div class="cultura-info-row">
        <div class="cultura-info-box"><strong>Revisoes:</strong> ${d.limitesRegras.regrasRevisoes}</div>
        <div class="cultura-info-box"><strong>Atendimento:</strong> ${d.limitesRegras.regrasComunicacao}</div>
      </div>
      <h4>Niveis de Demanda</h4>
      <div class="cultura-table-wrap"><table class="cultura-table">
        <thead><tr><th>Nivel</th><th>Descricao</th></tr></thead>
        <tbody>${d.limitesRegras.nivelDemandas.map(n => `<tr><td><strong>Nivel ${n.nivel}</strong></td><td>${n.desc}</td></tr>`).join('')}</tbody>
      </table></div>`;
  },

  _renderFerramentas(d) {
    return `
      <h2><i data-lucide="wrench"></i> ${d.titulo}</h2>
      <h3>Boas Praticas</h3>
      <ul class="cultura-list">${d.boasPraticas.map(b => `<li>${b}</li>`).join('')}</ul>
      <h3>Stack por Area</h3>
      <div class="cultura-ferramentas-grid">
        ${d.categorias.map(c => `
          <div class="cultura-ferramenta-card">
            <strong>${c.nome}</strong>
            <div class="cultura-tags">${c.ferramentas.map(f => `<span class="cultura-tag">${f}</span>`).join('')}</div>
          </div>
        `).join('')}
      </div>`;
  },

  _renderCultura(d) {
    return `
      <h2><i data-lucide="heart"></i> ${d.titulo}</h2>
      <div class="cultura-callout">${d.trabalhoRemoto}</div>
      <h3>Principios Culturais</h3>
      <ul class="cultura-list-accent">${d.principiosCulturais.map(p => `<li>${p}</li>`).join('')}</ul>
      <h3>Perfil de Lideranca TBO</h3>
      <ul class="cultura-list-accent">${d.perfilLider.map(p => `<li>${p}</li>`).join('')}</ul>`;
  },

  // ── Lifecycle: destroy ──────────────────────────────────────────────

  destroy() {
    this._currentSection = null;
    this._customPages = [];
    this._tab = 'manual';
  },

  // ── Dynamic stats helpers ───────────────────────────────────────────

  _getHeadcount() {
    try {
      if (typeof TBO_PEOPLE_SHARED !== 'undefined' && TBO_PEOPLE_SHARED._getInternalTeam) {
        const team = TBO_PEOPLE_SHARED._getInternalTeam();
        if (team && team.length > 0) return team.length;
      }
    } catch (e) { /* fallback */ }
    return '\u2014';
  },

  _getBUCount() {
    try {
      if (typeof TBO_PEOPLE_SHARED !== 'undefined' && TBO_PEOPLE_SHARED._getInternalTeam) {
        const team = TBO_PEOPLE_SHARED._getInternalTeam();
        if (team && team.length > 0) {
          const bus = new Set(team.map(p => p.bu).filter(Boolean));
          return bus.size || '\u2014';
        }
      }
    } catch (e) { /* fallback */ }
    return '\u2014';
  }
};
