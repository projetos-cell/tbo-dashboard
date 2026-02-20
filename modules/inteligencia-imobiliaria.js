// TBO OS — Module: Inteligencia Imobiliaria (Curadoria de Conteudo)
// Curadoria automatizada de noticias do mercado imobiliario, arquitetura, design e arte
// Usa prompt de IA para agregar conteudo de fontes brasileiras especializadas

const TBO_INTELIGENCIA_IMOBILIARIA = {

  // Prompt de curadoria (fornecido pelo Marco)
  _curadoriaPrompt: `Voce e um curador de conteudo especializado em mercado imobiliario brasileiro, arquitetura, design de interiores e arte contemporanea. Busque as principais noticias das ultimas 24h sobre esses temas nas seguintes fontes:

**Mercado Imobiliario:**
- Valor Economico (secao Imoveis)
- Estadao (secao Imoveis)
- ABRAINC
- CBIC
- Secovi-SP
- GRI Hub
- Buildings
- SiiLA Brasil

**Arquitetura e Design:**
- ArchDaily Brasil
- Archdaily (internacional, projetos residenciais)
- Dezeen
- Casa Vogue Brasil
- Revista Casa e Jardim
- AU (Arquitetura e Urbanismo)
- Projeto Design

**Arte Contemporanea:**
- ArtNews Brasil
- Select (revista de arte)
- Artforum
- Frieze
- MASP (noticias/exposicoes)
- SP-Arte

Para cada noticia, retorne em formato JSON:
{
  "data": "YYYY-MM-DD",
  "categoria": "mercado_imobiliario|arquitetura|design|arte",
  "fonte": "nome da fonte",
  "titulo": "titulo da noticia",
  "resumo": "resumo de 2-3 frases",
  "link": "URL original",
  "relevancia": "alta|media|baixa",
  "tags": ["tag1", "tag2"],
  "insight_tbo": "como isso pode impactar projetos TBO ou oportunidades de negocio"
}

Priorize noticias sobre:
1. Lancamentos imobiliarios de alto padrao
2. Tendencias de arquitetura residencial/comercial
3. Novos materiais e tecnologias construtivas
4. Regulamentacoes e politicas habitacionais
5. Design de interiores premium
6. Exposicoes e eventos de arte relevantes
7. Sustentabilidade na construcao
8. PropTech e inovacao no setor`,

  // Escapa HTML para prevenir XSS
  _esc(s) { if (s == null) return ''; const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; },

  // Valida URL para prevenir javascript: e outros protocolos perigosos
  _safeUrl(url) { if (!url) return ''; const s = String(url).trim(); if (/^https?:\/\//i.test(s)) return this._esc(s); return ''; },

  // Cache de noticias (localStorage + timestamp)
  _cacheKey: 'tbo_inteligencia_imob_cache',
  _cacheTTL: 4 * 60 * 60 * 1000, // 4 horas

  _getCache() {
    try {
      const raw = localStorage.getItem(this._cacheKey);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (Date.now() - cache.timestamp > this._cacheTTL) return null;
      return cache.data;
    } catch { return null; }
  },

  _setCache(data) {
    localStorage.setItem(this._cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
  },

  // Noticias de exemplo (seed) para demonstracao
  _seedNoticias: [
    { data: '2026-02-20', categoria: 'mercado_imobiliario', fonte: 'Valor Economico', titulo: 'Lancamentos de alto padrao crescem 18% em SP no 1T2026', resumo: 'O segmento de imoveis de alto padrao registrou crescimento expressivo no primeiro trimestre, impulsionado pela demanda reprimida e novas linhas de credito.', link: '#', relevancia: 'alta', tags: ['alto padrao', 'SP', 'lancamentos'], insight_tbo: 'Oportunidade para projetos de branding e comunicacao visual para empreendimentos premium.' },
    { data: '2026-02-20', categoria: 'arquitetura', fonte: 'ArchDaily Brasil', titulo: 'Edificio residencial em Pinheiros vence premio de sustentabilidade', resumo: 'Projeto utiliza fachada ventilada com paineis fotovoltaicos integrados e sistema de reuso de agua cinza, reduzindo consumo energetico em 40%.', link: '#', relevancia: 'alta', tags: ['sustentabilidade', 'residencial', 'premio'], insight_tbo: 'Referencia tecnica para renders 3D de projetos sustentaveis. Tendencia crescente.' },
    { data: '2026-02-19', categoria: 'design', fonte: 'Casa Vogue', titulo: 'Tendencias de interiores 2026: minimalismo quente e materiais naturais', resumo: 'Designers apontam para paletas terrosas, madeiras certificadas e iluminacao natural como protagonistas dos projetos residenciais.', link: '#', relevancia: 'media', tags: ['tendencias', 'interiores', '2026'], insight_tbo: 'Direciona a paleta de materiais para projetos de imagem e tour virtual.' },
    { data: '2026-02-19', categoria: 'mercado_imobiliario', fonte: 'ABRAINC', titulo: 'Vendas de imoveis novos sobem 12% em janeiro', resumo: 'Dados da ABRAINC mostram que o mercado iniciou 2026 com forca, com destaque para o segmento de medio padrao nas capitais do Sudeste.', link: '#', relevancia: 'media', tags: ['vendas', 'mercado', 'ABRAINC'], insight_tbo: 'Indica aquecimento do mercado, potencial aumento de demanda por servicos de visualizacao.' },
    { data: '2026-02-18', categoria: 'arte', fonte: 'MASP', titulo: 'MASP inaugura mostra sobre arquitetura brasileira contemporanea', resumo: 'Exposicao reune 50 projetos que redefinem a relacao entre espaco urbano e natureza, incluindo obras de escritorios emergentes.', link: '#', relevancia: 'media', tags: ['MASP', 'exposicao', 'arquitetura'], insight_tbo: 'Networking e inspiracao visual. Potencial para conteudo de redes sociais da TBO.' },
    { data: '2026-02-18', categoria: 'mercado_imobiliario', fonte: 'GRI Hub', titulo: 'Fundos imobiliarios de logistica lideram captacao em fevereiro', resumo: 'FIIs logisticos captaram R$ 2,1 bi no mes, refletindo a demanda por galpoes modernos e centros de distribuicao.', link: '#', relevancia: 'baixa', tags: ['FIIs', 'logistica', 'captacao'], insight_tbo: 'Segmento de logistica pode demandar visualizacoes arquitetonicas para novos empreendimentos.' },
    { data: '2026-02-17', categoria: 'arquitetura', fonte: 'Dezeen', titulo: 'Studio japonese cria residencia com fachada de bambu trancado', resumo: 'O projeto em Kyoto utiliza tecnicas tradicionais de trancado de bambu para criar uma envoltoria que filtra luz e ventilacao naturalmente.', link: '#', relevancia: 'media', tags: ['bambu', 'Japao', 'inovacao'], insight_tbo: 'Referencia para materiais inovadores em projetos de comunicacao visual de construtoras.' },
    { data: '2026-02-17', categoria: 'design', fonte: 'Projeto Design', titulo: 'IA generativa transforma processo de concepcao de interiores', resumo: 'Ferramentas de IA estao sendo adotadas por escritorios de design para acelerar a fase de concepcao, gerando moodboards e paletas automaticamente.', link: '#', relevancia: 'alta', tags: ['IA', 'design', 'inovacao'], insight_tbo: 'Diretamente relevante para a BU Digital 3D. Avaliar integracao de IA no pipeline de producao.' },
    { data: '2026-02-16', categoria: 'mercado_imobiliario', fonte: 'Secovi-SP', titulo: 'Preco do metro quadrado em SP atinge recorde historico', resumo: 'O metro quadrado medio em Sao Paulo chegou a R$ 12.800 em janeiro de 2026, impulsionado pela escassez de terrenos em regioes nobres.', link: '#', relevancia: 'alta', tags: ['preco', 'SP', 'recorde'], insight_tbo: 'Alto padrao demanda materiais de venda sofisticados — oportunidade para BU Branding e Digital 3D.' },
    { data: '2026-02-16', categoria: 'arte', fonte: 'SP-Arte', titulo: 'SP-Arte 2026 anuncia 180 galerias participantes', resumo: 'A maior feira de arte da America Latina confirma edicao com recorde de galerias, incluindo 30 internacionais e programacao expandida.', link: '#', relevancia: 'baixa', tags: ['SP-Arte', 'feira', 'galerias'], insight_tbo: 'Evento para networking e curadoria de arte para projetos de construtoras premium.' }
  ],

  _loading: false,
  _activeFilter: 'todas',

  render() {
    const noticias = this._getCache() || this._seedNoticias;
    const categorias = ['todas', 'mercado_imobiliario', 'arquitetura', 'design', 'arte'];
    const catLabels = { todas: 'Todas', mercado_imobiliario: 'Mercado Imobiliario', arquitetura: 'Arquitetura', design: 'Design', arte: 'Arte' };
    const catColors = { mercado_imobiliario: '#2ecc71', arquitetura: '#3a7bd5', design: '#f59e0b', arte: '#8b5cf6' };
    const catIcons = { mercado_imobiliario: 'building-2', arquitetura: 'ruler', design: 'palette', arte: 'brush' };

    const filtered = this._activeFilter === 'todas' ? noticias : noticias.filter(n => n.categoria === this._activeFilter);

    // Contadores por categoria
    const counts = {};
    noticias.forEach(n => { counts[n.categoria] = (counts[n.categoria] || 0) + 1; });

    return `
      <style>
        .imob-module { max-width: 1200px; }
        .imob-card { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); padding: 16px; transition: border-color 0.2s, box-shadow 0.2s; }
        .imob-card:hover { border-color: var(--accent-gold); box-shadow: 0 2px 8px rgba(232,81,2,0.08); }
        .imob-filter-btn { padding: 6px 14px; font-size: 0.76rem; border-radius: 20px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .imob-filter-btn:hover { border-color: var(--accent-gold); }
        .imob-filter-btn.active { background: var(--accent-gold); color: #fff; border-color: var(--accent-gold); }
        .imob-relevancia-alta { border-left: 3px solid var(--color-success); }
        .imob-relevancia-media { border-left: 3px solid var(--accent-gold); }
        .imob-relevancia-baixa { border-left: 3px solid var(--text-muted); }
      </style>

      <div class="imob-module">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <div>
            <h2 style="margin:0;font-size:1.1rem;">Inteligencia Imobiliaria</h2>
            <p style="margin:4px 0 0;font-size:0.78rem;color:var(--text-muted);">Curadoria automatizada de noticias e tendencias do mercado</p>
          </div>
          <button class="btn btn-primary btn-sm" id="imobRefresh" style="display:flex;align-items:center;gap:6px;">
            <i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Atualizar
          </button>
        </div>

        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:20px;">
          <div class="kpi-card"><div class="kpi-label">Total Noticias</div><div class="kpi-value">${noticias.length}</div><div class="kpi-sub">ultimas 24h</div></div>
          <div class="kpi-card kpi-card--success"><div class="kpi-label">Alta Relevancia</div><div class="kpi-value">${noticias.filter(n => n.relevancia === 'alta').length}</div><div class="kpi-sub">prioridade</div></div>
          <div class="kpi-card kpi-card--blue"><div class="kpi-label">Fontes</div><div class="kpi-value">${new Set(noticias.map(n => n.fonte)).size}</div><div class="kpi-sub">ativas</div></div>
          <div class="kpi-card kpi-card--gold"><div class="kpi-label">Categorias</div><div class="kpi-value">${Object.keys(counts).length}</div><div class="kpi-sub">cobertas</div></div>
        </div>

        <!-- Filtros por categoria -->
        <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
          ${categorias.map(c => `
            <button class="imob-filter-btn ${this._activeFilter === c ? 'active' : ''}" data-filter="${c}">
              ${c !== 'todas' ? `<i data-lucide="${catIcons[c]}" style="width:12px;height:12px;vertical-align:-2px;margin-right:4px;"></i>` : ''}
              ${catLabels[c]} ${c !== 'todas' ? `(${counts[c] || 0})` : ''}
            </button>
          `).join('')}
        </div>

        <!-- Feed de noticias -->
        <div id="imobFeed" style="display:grid;gap:12px;">
          ${filtered.map(n => {
            const catKey = this._esc(n.categoria || '');
            const color = catColors[n.categoria] || 'var(--text-muted)';
            const relKey = (n.relevancia || '').replace(/[^a-z]/g, '');
            return `
              <div class="imob-card imob-relevancia-${this._esc(relKey)}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                  <div style="flex:1;">
                    <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
                      <span class="tag" style="font-size:0.62rem;background:${color}15;color:${color};">${catLabels[n.categoria] || catKey}</span>
                      <span style="font-size:0.68rem;color:var(--text-muted);">${this._esc(n.fonte)}</span>
                      <span style="font-size:0.62rem;color:var(--text-muted);">${n.data ? new Date(n.data).toLocaleDateString('pt-BR') : ''}</span>
                    </div>
                    <div style="font-weight:700;font-size:0.9rem;margin-bottom:6px;">${this._esc(n.titulo)}</div>
                    <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;margin-bottom:8px;">${this._esc(n.resumo)}</div>
                    ${n.insight_tbo ? `
                      <div style="background:var(--accent-gold)08;border-radius:6px;padding:8px 12px;margin-bottom:8px;">
                        <div style="font-size:0.68rem;font-weight:600;color:var(--accent-gold);margin-bottom:2px;">Insight TBO</div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);">${this._esc(n.insight_tbo)}</div>
                      </div>
                    ` : ''}
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                      ${(n.tags || []).map(t => `<span class="tag" style="font-size:0.58rem;">${this._esc(t)}</span>`).join('')}
                    </div>
                  </div>
                  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;">
                    <span class="tag" style="font-size:0.6rem;background:${n.relevancia === 'alta' ? 'var(--color-success-dim)' : n.relevancia === 'media' ? 'var(--accent-gold)20' : 'var(--bg-tertiary)'};color:${n.relevancia === 'alta' ? 'var(--color-success)' : n.relevancia === 'media' ? 'var(--accent-gold)' : 'var(--text-muted)'};">${this._esc(n.relevancia)}</span>
                  </div>
                </div>
              </div>`;
          }).join('')}
          ${!filtered.length ? '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:0.85rem;">Nenhuma noticia encontrada para esta categoria.</div>' : ''}
        </div>

        <!-- Prompt utilizado (collapsible) -->
        <details style="margin-top:24px;">
          <summary style="font-size:0.78rem;color:var(--text-muted);cursor:pointer;padding:8px 0;">Ver prompt de curadoria utilizado</summary>
          <pre style="font-size:0.7rem;background:var(--bg-elevated);padding:16px;border-radius:8px;overflow-x:auto;white-space:pre-wrap;color:var(--text-secondary);line-height:1.6;margin-top:8px;border:1px solid var(--border-subtle);">${this._esc(this._curadoriaPrompt)}</pre>
        </details>
      </div>
    `;
  },

  init() {
    // Filtros por categoria
    document.querySelectorAll('.imob-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeFilter = btn.dataset.filter;
        document.querySelectorAll('.imob-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Re-renderizar feed
        if (typeof TBO_ROUTER !== 'undefined') {
          const container = document.getElementById('moduleContent') || document.querySelector('.module-content');
          if (container) { container.innerHTML = this.render(); this.init(); }
        }
        if (window.lucide) lucide.createIcons();
      });
    });

    // Botao atualizar — buscar noticias reais via proxy
    const refreshBtn = document.getElementById('imobRefresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.info('Curadoria em andamento', 'Buscando noticias reais das ultimas 24h...');
        }
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i data-lucide="loader-2" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i> Buscando...';

        try {
          let noticias = [];
          let usedReal = false;

          // 1) Proxy RSS via Vercel
          try {
            const proxyUrl = `${window.location.origin}/api/news-proxy?limit=30`;
            const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
            if (resp.ok) {
              const data = await resp.json();
              if (data.success && data.news?.length > 0) {
                noticias = data.news.map(n => ({
                  data: n.date, categoria: this._mapCategory(n.category),
                  fonte: n.source, titulo: n.title, resumo: n.summary || '',
                  link: n.url || '#', relevancia: 'media',
                  tags: [n.category, n.region].filter(Boolean),
                  insight_tbo: ''
                }));
                usedReal = true;
              }
            }
          } catch { /* proxy indisponivel */ }

          // 2) Fallback: CORS proxy publico
          if (!usedReal) {
            try {
              const queries = ['mercado+imobiliário+Brasil', 'arquitetura+design+interiores+2026', 'arte+contemporânea+Brasil'];
              const corsProxy = 'https://api.allorigins.win/raw?url=';
              for (const q of queries) {
                try {
                  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
                  const resp = await fetch(corsProxy + encodeURIComponent(rssUrl), { signal: AbortSignal.timeout(8000) });
                  if (!resp.ok) continue;
                  const xml = await resp.text();
                  const items = this._parseRSS(xml);
                  noticias = noticias.concat(items);
                } catch { /* skip */ }
              }
              if (noticias.length > 0) usedReal = true;
            } catch { /* fallback falhou */ }
          }

          // 3) Ultimo fallback: IA
          if (!usedReal && typeof TBO_API !== 'undefined' && TBO_API.isConfigured()) {
            try {
              const result = await TBO_API.call(
                'Retorne APENAS JSON array, sem markdown.',
                this._curadoriaPrompt + '\n\nRetorne as noticias em JSON array.',
                { temperature: 0.7, maxTokens: 3500 }
              );
              let text = result.text.trim();
              if (text.startsWith('```')) text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
              const parsed = JSON.parse(text);
              noticias = Array.isArray(parsed) ? parsed : (parsed.noticias || []);
            } catch { /* IA falhou */ }
          }

          // Fallback final: seed
          if (noticias.length === 0) noticias = this._seedNoticias;

          // Deduplicar
          const seen = new Set();
          noticias = noticias.filter(n => {
            const k = (n.titulo || '').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
            if (seen.has(k)) return false;
            seen.add(k); return true;
          });

          this._setCache(noticias);
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.success('Curadoria concluida', `${noticias.length} noticias ${usedReal ? 'reais' : '(seed)'} carregadas`);
          }

          // Re-renderizar
          this._activeFilter = 'todas';
          const container = document.getElementById('moduleContent') || document.querySelector('.module-content') || document.getElementById('moduleContainer');
          if (container) { container.innerHTML = this.render(); this.init(); }
          if (window.lucide) lucide.createIcons();
        } catch (e) {
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message);
        } finally {
          refreshBtn.disabled = false;
          refreshBtn.innerHTML = '<i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Atualizar';
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    if (window.lucide) lucide.createIcons();
  },

  // Mapear categorias do proxy para as categorias locais
  _mapCategory(cat) {
    const map = {
      lancamentos: 'mercado_imobiliario', indicadores: 'mercado_imobiliario',
      incorporadoras: 'mercado_imobiliario', tendencias: 'mercado_imobiliario',
      mercado: 'mercado_imobiliario', curitiba: 'mercado_imobiliario',
      custos: 'mercado_imobiliario', financiamento: 'mercado_imobiliario',
      arquitetura: 'arquitetura', design: 'design', arte: 'arte'
    };
    return map[cat] || 'mercado_imobiliario';
  },

  // Parsear RSS XML simples
  _parseRSS(xml) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const getTag = (tag) => {
        const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const m = itemXml.match(r);
        return m ? (m[1] || m[2] || '').trim() : '';
      };
      const title = getTag('title').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const link = getTag('link');
      const pubDate = getTag('pubDate');
      const source = getTag('source');
      const desc = getTag('description').replace(/<[^>]*>/g, '').substring(0, 300);
      if (title) {
        const cat = this._categorizeRSSTitle(title);
        items.push({
          data: pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          categoria: cat, fonte: source || 'Google News',
          titulo: title, resumo: desc, link: link || '#',
          relevancia: 'media', tags: [cat], insight_tbo: ''
        });
      }
    }
    return items;
  },

  _categorizeRSSTitle(title) {
    const t = (title || '').toLowerCase();
    if (/arquitetur|edificio|projeto|fachada|urbanis/i.test(t)) return 'arquitetura';
    if (/design|interior|decorac|mobili/i.test(t)) return 'design';
    if (/arte|museu|exposic|galeria|bienal|masp/i.test(t)) return 'arte';
    return 'mercado_imobiliario';
  }
};
