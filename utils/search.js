// TBO OS — Search Utilities
const TBO_SEARCH = {
  // Simple text search across all data
  search(query, options = {}) {
    const results = [];
    const q = query.toLowerCase().trim();
    if (!q) return results;

    const context = TBO_STORAGE.get('context');
    const meetings = TBO_STORAGE.get('meetings');
    const market = TBO_STORAGE.get('market');

    // Search active projects
    (context.projetos_ativos || []).forEach(p => {
      const text = `${p.nome} ${p.construtora} ${(p.bus || []).join(' ')}`.toLowerCase();
      if (text.includes(q)) {
        results.push({ type: 'projeto_ativo', title: p.nome, subtitle: p.construtora, data: p, score: this._score(text, q) });
      }
    });

    // Search completed projects
    Object.entries(context.projetos_finalizados || {}).forEach(([year, projects]) => {
      projects.forEach(name => {
        if (name.toLowerCase().includes(q)) {
          results.push({ type: 'projeto_finalizado', title: name, subtitle: `Finalizado em ${year}`, data: { nome: name, ano: year }, score: this._score(name.toLowerCase(), q) });
        }
      });
    });

    // Search clients
    (context.clientes_construtoras || []).forEach(client => {
      if (client.toLowerCase().includes(q)) {
        results.push({ type: 'cliente', title: client, subtitle: 'Construtora/Cliente', data: { nome: client }, score: this._score(client.toLowerCase(), q) });
      }
    });

    // Search meetings (support both formats)
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    meetingsArr.forEach(r => {
      const title = r.title || r.titulo || '';
      const summary = r.summary || r.resumo || '';
      const category = r.category || r.categoria || '';
      const date = r.date || r.data || '';
      const items = (r.action_items || []).map(i => i.task || i.tarefa || (typeof i === 'string' ? i : '')).join(' ');
      const text = `${title} ${summary} ${items}`.toLowerCase();
      if (text.includes(q)) {
        results.push({ type: 'reuniao', title: title, subtitle: `${date} — ${category}`, data: r, score: this._score(text, q) });
      }
    });

    // Search market trends
    (market.tendencias || []).forEach(t => {
      if (t.toLowerCase().includes(q)) {
        results.push({ type: 'mercado', title: t, subtitle: 'Tendência de mercado', data: { tendencia: t }, score: this._score(t.toLowerCase(), q) });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    return options.limit ? results.slice(0, options.limit) : results;
  },

  _score(text, query) {
    let score = 0;
    if (text.startsWith(query)) score += 10;
    if (text.includes(query)) score += 5;
    // Count occurrences
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    if (matches) score += matches.length;
    return score;
  },

  // Get project list for dropdowns
  getProjectList(filter = 'all') {
    const context = TBO_STORAGE.get('context');
    const list = [];

    if (filter === 'all' || filter === 'ativos') {
      (context.projetos_ativos || []).forEach(p => {
        list.push({ value: p.nome, label: `${p.nome} (${p.construtora})`, status: 'ativo', construtora: p.construtora });
      });
    }

    if (filter === 'all' || filter === 'finalizados') {
      Object.entries(context.projetos_finalizados || {}).forEach(([year, projects]) => {
        projects.forEach(name => {
          list.push({ value: name, label: `${name} (${year})`, status: 'finalizado', ano: year });
        });
      });
    }

    return list;
  },

  // Get client list for dropdowns
  getClientList() {
    const context = TBO_STORAGE.get('context');
    return (context.clientes_construtoras || []).map(c => ({
      value: c,
      label: c
    }));
  },

  // Get BU list
  getBUList() {
    return ['Digital 3D', 'Audiovisual', 'Branding', 'Marketing', 'Interiores'];
  }
};
