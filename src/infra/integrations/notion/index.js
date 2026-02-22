/**
 * TBO OS — Integracao: Notion
 *
 * Contrato padronizado: connect(), sync(), healthcheck()
 * Busca dados de projetos, demandas e pessoas do Notion workspace TBO.
 *
 * IDs dos bancos Notion (BD Projetos, BD Demandas, BD Pessoas):
 *   - Projetos:  1f3b27ff29e381d9ba39ea23ea3d87e3
 *   - Demandas:  1fab27ff29e380ce908ddc792f29dae9
 *   - Pessoas:   2c5b27ff29e380359361d0145f2bda2c
 */

const NotionIntegration = (() => {
  let _config = null;
  let _connected = false;
  let _cache = { projects: null, demandas: null };
  let _cacheTime = { projects: 0, demandas: 0 };
  const _cacheTTL = 10 * 60 * 1000; // 10 minutos

  // IDs dos databases Notion
  const DB_IDS = {
    projetos: '1f3b27ff29e381d9ba39ea23ea3d87e3',
    demandas: '1fab27ff29e380ce908ddc792f29dae9',
    pessoas:  '2c5b27ff29e380359361d0145f2bda2c'
  };

  async function _loadConfig() {
    if (_config) return _config;

    try {
      // Primeiro: verificar TBO_CONFIG
      if (typeof TBO_CONFIG !== 'undefined') {
        const token = TBO_CONFIG.NOTION_API_KEY || TBO_CONFIG.NOTION_TOKEN;
        if (token) {
          _config = { token };
          return _config;
        }
      }

      // Segundo: verificar Supabase integration_configs
      const db = typeof TBO_DB !== 'undefined' ? TBO_DB : (typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE : null);
      if (!db) return null;

      const client = db.getClient ? db.getClient() : db;
      const { data } = await client.from('integration_configs')
        .select('config')
        .eq('provider', 'notion')
        .single();

      _config = data?.config || null;
      return _config;
    } catch {
      return null;
    }
  }

  /**
   * Chama a API do Notion via proxy (para evitar CORS)
   * Proxy esperado em /api/notion/* ou via Supabase Edge Function
   */
  async function _request(endpoint, body = null) {
    if (!_config?.token) throw new Error('Notion: token nao configurado');

    // Tentar proxy local ou Edge Function
    const proxyBase = typeof TBO_CONFIG !== 'undefined' && TBO_CONFIG.NOTION_PROXY_URL
      ? TBO_CONFIG.NOTION_PROXY_URL
      : '/api/notion';

    const url = `${proxyBase}/${endpoint}`;
    const options = {
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_config.token}`
      }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion ${res.status}: ${text.slice(0, 200)}`);
    }
    return res.json();
  }

  /**
   * Busca todos os projetos do Notion (BD Projetos)
   * Retorna array normalizado: { id, nome, construtora, bus, status, prazo }
   */
  async function _fetchProjects(forceRefresh = false) {
    if (!forceRefresh && _cache.projects && (Date.now() - _cacheTime.projects) < _cacheTTL) {
      return _cache.projects;
    }

    try {
      const result = await _request(`databases/${DB_IDS.projetos}/query`, {
        filter: {
          property: 'Status',
          status: { does_not_equal: 'Concluído' }
        },
        sorts: [{ property: 'Nome Projeto', direction: 'ascending' }],
        page_size: 100
      });

      const projects = (result.results || []).map(page => ({
        id: page.id,
        nome: page.properties?.['Nome Projeto']?.title?.[0]?.plain_text || '(sem nome)',
        construtora: page.properties?.['Construtora']?.select?.name || '',
        bus: (page.properties?.['BUs']?.multi_select || []).map(s => s.name),
        status: page.properties?.['Status']?.status?.name || 'Parado',
        prazo: page.properties?.['Prazo do Projeto']?.date?.start || null,
        url: page.url || '',
        _source: 'notion'
      }));

      _cache.projects = projects;
      _cacheTime.projects = Date.now();

      // Salvar no localStorage para acesso offline
      try { localStorage.setItem('tbo_notion_projects', JSON.stringify(projects)); } catch {}

      return projects;
    } catch (e) {
      console.warn('[Notion] Erro ao buscar projetos:', e.message);
      // Fallback: localStorage
      try { return JSON.parse(localStorage.getItem('tbo_notion_projects') || '[]'); } catch { return []; }
    }
  }

  /**
   * Busca demandas ativas do Notion (BD Demandas)
   * Retorna array normalizado: { id, demanda, responsavel, bus, status, prazo, projetoId }
   */
  async function _fetchDemandas(forceRefresh = false) {
    if (!forceRefresh && _cache.demandas && (Date.now() - _cacheTime.demandas) < _cacheTTL) {
      return _cache.demandas;
    }

    try {
      const result = await _request(`databases/${DB_IDS.demandas}/query`, {
        filter: {
          property: 'Status',
          status: { does_not_equal: 'Concluído' }
        },
        sorts: [{ property: 'Prazo', direction: 'descending' }],
        page_size: 100
      });

      const demandas = (result.results || []).map(page => ({
        id: page.id,
        demanda: page.properties?.['Demanda']?.title?.[0]?.plain_text || '(sem titulo)',
        responsavel: page.properties?.['Responsável']?.people?.[0]?.name || '',
        responsavelEmail: page.properties?.['Responsável']?.people?.[0]?.person?.email || '',
        bus: (page.properties?.['BUs Envolvidas']?.multi_select || []).map(s => s.name),
        status: page.properties?.['Status']?.status?.name || 'Briefing',
        prazo: page.properties?.['Prazo']?.date?.start || null,
        projetoRelation: page.properties?.['BD Projetos | TBO']?.relation || [],
        url: page.url || '',
        _source: 'notion'
      }));

      _cache.demandas = demandas;
      _cacheTime.demandas = Date.now();

      try { localStorage.setItem('tbo_notion_demandas', JSON.stringify(demandas)); } catch {}

      return demandas;
    } catch (e) {
      console.warn('[Notion] Erro ao buscar demandas:', e.message);
      try { return JSON.parse(localStorage.getItem('tbo_notion_demandas') || '[]'); } catch { return []; }
    }
  }

  return {
    name: 'notion',
    DB_IDS,

    async connect() {
      _config = await _loadConfig();
      _connected = !!_config?.token;
      return _connected;
    },

    async healthcheck() {
      try {
        if (!_connected) await this.connect();
        return { ok: _connected, error: _connected ? null : 'Nao configurado' };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async sync() {
      if (!_connected) await this.connect();
      if (!_connected) throw new Error('Notion nao configurado');

      const [projects, demandas] = await Promise.all([
        _fetchProjects(true),
        _fetchDemandas(true)
      ]);

      console.log(`[Notion] Sync: ${projects.length} projetos, ${demandas.length} demandas`);
      return { projects: projects.length, demandas: demandas.length };
    },

    isConnected() { return _connected; },

    // ── Acesso direto aos dados ──

    getProjects() { return _cache.projects || JSON.parse(localStorage.getItem('tbo_notion_projects') || '[]'); },
    getDemandas() { return _cache.demandas || JSON.parse(localStorage.getItem('tbo_notion_demandas') || '[]'); },

    async fetchProjects(force) { return _fetchProjects(force); },
    async fetchDemandas(force) { return _fetchDemandas(force); },

    /**
     * Busca projetos por BU (para exibir no drawer da pessoa)
     * @param {string} bu - Nome da BU (ex: 'Marketing', 'Digital 3D', 'Branding')
     * @returns {Array} Projetos filtrados por BU
     */
    getProjectsByBU(bu) {
      if (!bu) return [];
      const projects = this.getProjects();
      const buNorm = bu.toLowerCase().trim();
      return projects.filter(p =>
        p.bus.some(b => b.toLowerCase().trim() === buNorm) ||
        p.construtora?.toLowerCase().includes(buNorm)
      );
    },

    /**
     * Busca demandas por responsavel (email ou nome)
     * @param {string} nameOrEmail - Nome ou email do responsavel
     * @returns {Array} Demandas filtradas
     */
    getDemandasByPerson(nameOrEmail) {
      if (!nameOrEmail) return [];
      const demandas = this.getDemandas();
      const norm = nameOrEmail.toLowerCase().trim();
      return demandas.filter(d =>
        d.responsavel?.toLowerCase().includes(norm) ||
        d.responsavelEmail?.toLowerCase().includes(norm)
      );
    },

    /**
     * Busca projetos + demandas de uma pessoa (para drawer)
     * Combina projetos por BU + demandas por responsavel
     */
    getPersonProjectsAndDemandas(person) {
      if (!person) return { projects: [], demandas: [] };

      const projects = this.getProjectsByBU(person.bu || person.area);
      const demandas = this.getDemandasByPerson(person.nome || person.email || '');

      return { projects, demandas };
    },

    clearCache() {
      _cache = { projects: null, demandas: null };
      _cacheTime = { projects: 0, demandas: 0 };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.NotionIntegration = NotionIntegration;
}
