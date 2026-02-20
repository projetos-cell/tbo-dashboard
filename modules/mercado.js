// TBO OS — Module: Inteligencia de Mercado (Noticias e Dados)
const TBO_MERCADO = {

  render() {
    const market = TBO_STORAGE.get('market');
    const news = TBO_STORAGE.get('news');
    const sources = TBO_STORAGE.get('sources');
    const ic = market.indicadores_curitiba || {};
    const rm = market.indicadores_rm_curitiba || {};
    const tendencias = market.tendencias || [];
    const noticias = news.noticias || [];
    const allSources = [...(sources.dados_mercado || []), ...(sources.noticias || [])];

    return `
      <div class="mercado-module">
        <!-- KPIs -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Mercado Imobiliario ${ic.periodo || ''}</h2>
            <button class="btn btn-sm btn-secondary" id="mkBuscarNoticias">Buscar Noticias</button>
          </div>
          <div class="grid-4" style="margin-bottom:12px;">
            <div class="kpi-card" style="position:relative;">
              <span class="kpi-info-icon" data-tooltip="Numero de novos empreendimentos lancados em Curitiba no periodo. Fonte: ADEMI/BRAIN."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
              <div class="kpi-label">Lancamentos CWB</div>
              <div class="kpi-value">${ic.empreendimentos_lancados || '\u2014'}</div>
              <div class="kpi-change negative">${ic.variacao_empreendimentos || ''}</div>
            </div>
            <div class="kpi-card" style="position:relative;">
              <span class="kpi-info-icon" data-tooltip="Total de unidades residenciais lancadas em Curitiba. Indica o volume do mercado local."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
              <div class="kpi-label">Unidades CWB</div>
              <div class="kpi-value">${TBO_FORMATTER.number(ic.unidades_lancadas)}</div>
              <div class="kpi-change negative">${ic.variacao_unidades || ''}</div>
            </div>
            <div class="kpi-card" style="position:relative;">
              <span class="kpi-info-icon" data-tooltip="Empreendimentos lancados na Regiao Metropolitana de Curitiba. Inclui cidades vizinhas."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
              <div class="kpi-label">Lancamentos RM</div>
              <div class="kpi-value">${rm.empreendimentos_lancados || '\u2014'}</div>
              <div class="kpi-change negative">${rm.variacao_empreendimentos || ''}</div>
            </div>
            <div class="kpi-card" style="position:relative;">
              <span class="kpi-info-icon" data-tooltip="Total de unidades lancadas na Regiao Metropolitana. Visao ampliada do mercado regional."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
              <div class="kpi-label">Unidades RM</div>
              <div class="kpi-value">${TBO_FORMATTER.number(rm.unidades_lancadas)}</div>
              <div class="kpi-change negative">${rm.variacao_unidades || ''}</div>
            </div>
          </div>
          ${ic.contexto ? `
          <div class="context-banner">
            <div class="context-banner-text">${ic.contexto}</div>
          </div>
          ` : ''}
        </section>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab active" data-tab="mk-noticias">Noticias</button>
          <button class="tab" data-tab="mk-tendencias">Tendencias</button>
          <button class="tab" data-tab="mk-consulta">Consulta IA</button>
          <button class="tab" data-tab="mk-fontes">Fontes</button>
        </div>

        <!-- ============ Noticias ============ -->
        <div class="tab-panel" id="tab-mk-noticias">
          <!-- Category filters -->
          <div class="news-filters" style="margin-bottom:16px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <button class="quick-chip active" data-filter="todas">Todas</button>
            <button class="quick-chip" data-filter="lancamentos">Lancamentos</button>
            <button class="quick-chip" data-filter="indicadores">Indicadores</button>
            <button class="quick-chip" data-filter="incorporadoras">Incorporadoras</button>
            <button class="quick-chip" data-filter="tendencias">Tendencias</button>
            <button class="quick-chip" data-filter="curitiba">Curitiba/PR</button>
          </div>

          <div id="mkNewsFeed">
            ${noticias.length > 0 ? this._renderNewsList(noticias) : `
              <div class="empty-state" style="padding:40px 20px;">
                <div class="empty-state-icon" style="font-size:2rem;">\u{1F4F0}</div>
                <div class="empty-state-text" style="margin-top:12px;">Nenhuma noticia carregada</div>
                <p style="color:var(--text-muted); font-size:0.8rem; margin-top:8px;">
                  Clique em "Buscar Noticias" para carregar noticias atualizadas do mercado imobiliario via IA.
                </p>
              </div>
            `}
          </div>
        </div>

        <!-- ============ Tendencias ============ -->
        <div class="tab-panel" id="tab-mk-tendencias" style="display:none;">
          ${tendencias.length > 0 ? `
          <div class="trend-grid">
            ${tendencias.map((t, i) => {
              const impacts = ['alto', 'alto', 'medio', 'medio', 'monitor', 'monitor'];
              const impact = impacts[i] || 'monitor';
              const labels = { alto: 'Alto Impacto', medio: 'Medio Impacto', monitor: 'Monitorar' };
              return `
                <div class="trend-card">
                  <span class="trend-card-tag trend-card-tag--${impact}">${labels[impact]}</span>
                  <div class="trend-card-text">${t}</div>
                </div>`;
            }).join('')}
          </div>
          ` : '<div class="empty-state"><div class="empty-state-text">Sem tendencias registradas</div></div>'}

          <div class="card" style="margin-top:20px;">
            <div class="card-header"><h3 class="card-title">Gerar Analise de Tendencias</h3></div>
            <p style="color:var(--text-secondary); font-size:0.82rem; margin-bottom:12px;">
              Use IA para gerar uma analise atualizada das tendencias do mercado imobiliario.
            </p>
            <button class="btn btn-primary" id="mkGerarTendencias" style="width:100%;">Analisar Tendencias com IA</button>
          </div>
          <div id="mkTendenciasOutput" class="ai-response" style="min-height:100px; margin-top:16px;"></div>
        </div>

        <!-- ============ Consulta IA ============ -->
        <div class="tab-panel" id="tab-mk-consulta" style="display:none;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Consulta Inteligente de Mercado</h3></div>
            <p style="color:var(--text-secondary); font-size:0.82rem; margin-bottom:12px;">
              Faca perguntas sobre o mercado imobiliario e receba analises baseadas nos dados disponiveis.
            </p>
            <div class="quick-chips" id="mkQuickChips">
              <button class="quick-chip" data-query="Quais sao os lancamentos imobiliarios mais recentes em Curitiba?">Lancamentos recentes CWB</button>
              <button class="quick-chip" data-query="Qual o cenario do mercado imobiliario de alto padrao em Curitiba em 2026?">Alto padrao CWB</button>
              <button class="quick-chip" data-query="Quais indicadores economicos afetam o mercado imobiliario brasileiro em 2026?">Indicadores economicos</button>
              <button class="quick-chip" data-query="Projecao para o mercado imobiliario de Curitiba no S2 2026">Projecao S2 2026</button>
              <button class="quick-chip" data-query="Quais incorporadoras estao mais ativas em Curitiba atualmente?">Incorporadoras ativas</button>
            </div>
            <div class="form-group">
              <label class="form-label">Sua pergunta</label>
              <textarea class="form-input" id="mkPergunta" rows="3" placeholder="Ex: Como esta o mercado de lancamentos imobiliarios em Curitiba?"></textarea>
            </div>
            <button class="btn btn-primary" id="mkGerarConsulta" style="width:100%;">Consultar</button>
          </div>
          <div id="mkConsultaOutput" class="ai-response" style="min-height:200px; margin-top:16px;">
            <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
          </div>
        </div>

        <!-- ============ Fontes ============ -->
        <div class="tab-panel" id="tab-mk-fontes" style="display:none;">
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header">
              <h3 class="card-title">Fontes de Dados e Noticias</h3>
              <span style="font-size:0.72rem; color:var(--text-muted);">Atualizado: ${market.ultima_atualizacao || '\u2014'}</span>
            </div>
            <div class="source-grid">
              ${allSources.map(s => {
                const isActive = s.ativo !== false && s.active !== false;
                const name = s.nome || s.name || 'Fonte';
                const type = s.tipo || s.type || '';
                const freq = s.frequencia || s.frequency || '';
                const url = s.url || '';
                return `
                  <div class="source-card">
                    <div class="source-dot ${isActive ? 'source-dot--active' : 'source-dot--inactive'}"></div>
                    <div class="source-info">
                      <div class="source-name">${url ? `<a href="${url}" target="_blank" rel="noopener">${name}</a>` : name}</div>
                      <div class="source-meta">${[type, freq].filter(Boolean).join(' \u2014 ')}</div>
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _renderNewsList(noticias) {
    const categoryIcons = {
      lancamentos: '\u{1F3D7}\uFE0F',
      indicadores: '\u{1F4CA}',
      incorporadoras: '\u{1F3E2}',
      tendencias: '\u{1F4C8}',
      mercado: '\u{1F4B0}',
      curitiba: '\u{1F4CD}'
    };
    const categoryColors = {
      lancamentos: 'var(--accent-blue)',
      indicadores: 'var(--color-success)',
      incorporadoras: 'var(--brand-orange)',
      tendencias: 'var(--color-purple)',
      mercado: 'var(--color-warning)',
      curitiba: 'var(--color-info)'
    };

    return noticias.map(n => {
      const cat = (n.category || n.categoria || 'mercado').toLowerCase();
      const icon = categoryIcons[cat] || '\u{1F4F0}';
      const color = categoryColors[cat] || 'var(--text-muted)';
      const date = n.date || n.data || '';
      const isLocal = (n.region || n.regiao || '').toLowerCase().includes('curitiba') || (n.region || n.regiao || '').toLowerCase().includes('parana');

      return `
        <div class="news-card" data-category="${cat}" data-region="${n.region || n.regiao || ''}">
          <div class="news-card-header">
            <span class="news-card-tag" style="background:${color}20; color:${color}; border:1px solid ${color}40;">
              ${icon} ${TBO_FORMATTER.capitalize(cat)}
            </span>
            ${isLocal ? '<span class="news-card-tag" style="background:var(--accent-gold-dim); color:var(--accent-gold); border:1px solid var(--accent-gold)40;">Curitiba/PR</span>' : ''}
            <span class="news-card-date">${date ? TBO_FORMATTER.date(date) : ''}</span>
          </div>
          <div class="news-card-title">${n.url ? `<a href="${n.url}" target="_blank" rel="noopener">${n.title || n.titulo}</a>` : (n.title || n.titulo)}</div>
          <div class="news-card-source">${n.source || n.fonte || ''}</div>
          ${n.summary || n.resumo ? `<div class="news-card-summary">${n.summary || n.resumo}</div>` : ''}
        </div>
      `;
    }).join('');
  },

  // ── Event Binding ──

  init() {
    // Tab switching with breadcrumb + deep link
    document.querySelectorAll('.mercado-module .tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.mercado-module .tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.mercado-module .tab-panel').forEach(p => p.style.display = 'none');
        const panel = document.getElementById(`tab-${tab.dataset.tab}`);
        if (panel) panel.style.display = 'block';
        if (typeof TBO_UX !== 'undefined') {
          TBO_UX.updateBreadcrumb('mercado', tab.textContent.trim());
          TBO_UX.setTabHash('mercado', tab.dataset.tab);
        }
      });
    });

    // News filters
    document.querySelectorAll('.news-filters .quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.news-filters .quick-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this._filterNews(chip.dataset.filter);
      });
    });

    // Quick chips for consulta
    document.querySelectorAll('#mkQuickChips .quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.query;
        const textarea = document.getElementById('mkPergunta');
        if (textarea) { textarea.value = q; }
        this._generateConsulta();
      });
    });

    this._bind('mkBuscarNoticias', () => this._fetchNews());
    this._bind('mkGerarConsulta', () => this._generateConsulta());
    this._bind('mkGerarTendencias', () => this._generateTendencias());
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  _filterNews(filter) {
    const cards = document.querySelectorAll('.news-card');
    cards.forEach(card => {
      if (filter === 'todas') {
        card.style.display = '';
        return;
      }
      if (filter === 'curitiba') {
        const region = (card.dataset.region || '').toLowerCase();
        card.style.display = (region.includes('curitiba') || region.includes('parana')) ? '' : 'none';
        return;
      }
      card.style.display = card.dataset.category === filter ? '' : 'none';
    });
  },

  async _fetchNews() {
    const btn = document.getElementById('mkBuscarNoticias');
    const feed = document.getElementById('mkNewsFeed');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.btnLoading(btn, true, 'Buscando...');
      TBO_UX.showLoading(feed, 'Buscando noticias reais do mercado imobiliario...');
    } else {
      if (btn) { btn.disabled = true; btn.textContent = 'Buscando...'; }
      if (feed) feed.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">Buscando noticias reais do mercado imobiliario...</div>';
    }

    try {
      // 1) Tentar proxy de noticias reais (Google News RSS via Vercel)
      let newsArray = [];
      let usedRealNews = false;

      try {
        const proxyUrl = `${window.location.origin}/api/news-proxy?limit=25&queries=mercado_imobiliario,lancamentos_curitiba,incorporadoras,selic_imoveis,construcao_civil,curitiba_imoveis`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            'Authorization': typeof TBO_SUPABASE !== 'undefined' ? `Bearer ${TBO_SUPABASE.getAccessToken?.() || ''}` : ''
          }
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.news && data.news.length > 0) {
            newsArray = data.news.map(n => ({
              title: n.title,
              titulo: n.title,
              source: n.source,
              fonte: n.source,
              url: n.url,
              date: n.date,
              data: n.date,
              summary: n.summary,
              resumo: n.summary,
              category: n.category,
              categoria: n.category,
              region: n.region,
              regiao: n.region === 'curitiba' ? 'Curitiba' : n.region === 'nacional' ? 'Nacional' : n.region
            }));
            usedRealNews = true;
          }
        }
      } catch (proxyErr) {
        console.warn('Proxy de noticias indisponivel, tentando fallback...', proxyErr.message);
      }

      // 2) Fallback: buscar via Google News RSS diretamente (pode falhar por CORS)
      if (!usedRealNews) {
        try {
          const queries = [
            'mercado+imobiliário+Brasil+2026',
            'lançamentos+imobiliários+Curitiba',
            'Selic+imóveis+2026'
          ];
          const corsProxy = 'https://api.allorigins.win/raw?url=';

          for (const q of queries) {
            try {
              const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
              const resp = await fetch(corsProxy + encodeURIComponent(rssUrl), { signal: AbortSignal.timeout(8000) });
              if (!resp.ok) continue;
              const xml = await resp.text();

              // Parsear RSS simples
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
                if (title) {
                  newsArray.push({
                    title, titulo: title, url: link,
                    source: source || 'Google News', fonte: source || 'Google News',
                    date: pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    data: pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    summary: '', resumo: '',
                    category: this._categorizeByTitle(title), categoria: this._categorizeByTitle(title),
                    region: this._detectRegion(title), regiao: this._detectRegion(title)
                  });
                }
              }
            } catch { /* skip query */ }
          }
          if (newsArray.length > 0) usedRealNews = true;
        } catch (fallbackErr) {
          console.warn('Fallback RSS tambem falhou:', fallbackErr.message);
        }
      }

      // 3) Ultimo fallback: gerar via IA (se API configurada)
      if (!usedRealNews && TBO_API.isConfigured()) {
        const market = TBO_STORAGE.get('market');
        const ic = market.indicadores_curitiba || {};

        const prompt = `Gere 12 noticias REALISTAS e ATUAIS (fevereiro 2026) sobre mercado imobiliario brasileiro, foco Curitiba/PR.

Contexto: ${ic.contexto || 'Mercado em retracao'}, ${ic.empreendimentos_lancados || 44} empreendimentos, Selic ~12.75%.

Retorne APENAS JSON array: [{"title":"...","source":"Valor Economico|InfoMoney|SECOVI-PR|Brain|etc","date":"2026-02-XX","category":"lancamentos|indicadores|incorporadoras|tendencias","region":"curitiba|nacional","summary":"2-3 frases"}]`;

        try {
          const result = await TBO_API.call('Retorne APENAS JSON valido, sem markdown.', prompt, { temperature: 0.7, maxTokens: 3000 });
          let text = result.text.trim();
          if (text.startsWith('```')) text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            newsArray = parsed.map(n => ({ ...n, titulo: n.title, fonte: n.source, data: n.date, resumo: n.summary, categoria: n.category, regiao: n.region }));
          }
        } catch (aiErr) {
          console.warn('Fallback IA tambem falhou:', aiErr.message);
        }
      }

      // Deduplicar
      const seen = new Set();
      newsArray = newsArray.filter(item => {
        const key = (item.title || item.titulo || '').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (newsArray.length > 0) {
        const newsData = {
          ultima_atualizacao: new Date().toISOString(),
          noticias: newsArray,
          nota: usedRealNews ? 'Noticias reais via RSS/proxy' : 'Noticias geradas via IA (fallback)'
        };
        TBO_STORAGE.set('news', newsData);
        try { localStorage.setItem('tbo_data_news', JSON.stringify(newsData)); } catch { /* ignore */ }

        if (feed) feed.innerHTML = this._renderNewsList(newsArray);
        TBO_TOAST.success('Noticias atualizadas', `${newsArray.length} noticias ${usedRealNews ? 'reais' : '(IA)'} carregadas.`);
      } else {
        TBO_TOAST.error('Sem noticias', 'Nao foi possivel buscar noticias. Verifique sua conexao.');
        if (feed) feed.innerHTML = '<div class="empty-state"><div class="empty-state-text">Nenhuma noticia encontrada. Tente novamente mais tarde.</div></div>';
      }
    } catch (e) {
      TBO_TOAST.error('Erro', e.message);
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(feed, e.message, () => this._fetchNews());
      } else if (feed) {
        feed.innerHTML = '<div class="empty-state"><div class="empty-state-text">Erro ao buscar noticias: ' + e.message + '</div></div>';
      }
    } finally {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.btnLoading(btn, false, 'Buscar Noticias');
      } else if (btn) {
        btn.disabled = false; btn.textContent = 'Buscar Noticias';
      }
    }
  },

  _categorizeByTitle(title) {
    const t = (title || '').toLowerCase();
    if (/lanc|empreendiment|residencial|apartament/i.test(t)) return 'lancamentos';
    if (/selic|juros|ipca|incc|inflac|indicador|pib/i.test(t)) return 'indicadores';
    if (/incorporadora|construtora|mrv|cyrela|eztec/i.test(t)) return 'incorporadoras';
    if (/tendenc|futuro|projec|inovac|proptech|tech/i.test(t)) return 'tendencias';
    return 'mercado';
  },

  _detectRegion(title) {
    const t = (title || '').toLowerCase();
    if (/curitiba|cwb|paran/i.test(t)) return 'curitiba';
    return 'nacional';
  },

  async _generateConsulta() {
    const pergunta = document.getElementById('mkPergunta')?.value || '';
    if (!pergunta) { TBO_TOAST.warning('Escreva sua pergunta'); return; }
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }

    const out = document.getElementById('mkConsultaOutput');
    const btn = document.getElementById('mkGerarConsulta');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Analisando...');
      TBO_UX.btnLoading(btn, true, 'Analisando...');
    } else if (out) { out.textContent = 'Analisando...'; }

    try {
      const ctx = TBO_STORAGE.getFullContext();
      const result = await TBO_API.callWithContext('mercado', pergunta, ctx);
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._generateConsulta());
      } else if (out) { out.textContent = 'Erro: ' + e.message; }
    } finally {
      if (typeof TBO_UX !== 'undefined') TBO_UX.btnLoading(btn, false);
    }
  },

  async _generateTendencias() {
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }

    const btn = document.getElementById('mkGerarTendencias');
    const out = document.getElementById('mkTendenciasOutput');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.btnLoading(btn, true, 'Analisando...');
      TBO_UX.showLoading(out, 'Gerando analise de tendencias...');
    } else {
      if (btn) { btn.disabled = true; btn.textContent = 'Analisando...'; }
      if (out) out.textContent = 'Gerando analise de tendencias...';
    }

    try {
      const ctx = TBO_STORAGE.getFullContext();
      const news = TBO_STORAGE.get('news');
      const newsCtx = (news.noticias || []).slice(0, 10).map(n => `- ${n.title || n.titulo} (${n.source || n.fonte})`).join('\n');

      const result = await TBO_API.callWithContext('mercado',
        `Analise as tendencias atuais do mercado imobiliario brasileiro, com foco em Curitiba/PR. Considere os dados de mercado disponiveis e as noticias recentes:\n\n${newsCtx}\n\nGere uma analise completa com: 1) Panorama geral, 2) Tendencias de curto prazo (3-6 meses), 3) Tendencias de medio prazo (6-12 meses), 4) Impactos para empresas de visualizacao arquitetonica e marketing imobiliario, 5) Oportunidades identificadas.`, ctx);
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._generateTendencias());
      } else if (out) { out.textContent = 'Erro: ' + e.message; }
    } finally {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.btnLoading(btn, false, 'Analisar Tendencias com IA');
      } else if (btn) {
        btn.disabled = false; btn.textContent = 'Analisar Tendencias com IA';
      }
    }
  }
};
