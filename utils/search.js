// TBO OS — Search Utilities (Enhanced: ERP indexing, fuzzy matching, field search)
const TBO_SEARCH = {

  // ── Type icons for search results ──────────────────────────────────────
  _typeIcons: {
    'projeto_ativo': 'briefcase',
    'projeto_finalizado': 'archive',
    'project': 'briefcase',
    'task': 'clipboard-list',
    'deliverable': 'package',
    'proposal': 'file-text',
    'decision': 'check-square',
    'meeting_erp': 'users',
    'knowledge_item': 'book-open',
    'cliente': 'building',
    'reuniao': 'video',
    'mercado': 'trending-up',
    'modulo': 'layout-grid'
  },

  _typeLabels: {
    'project': 'Projeto',
    'task': 'Tarefa',
    'deliverable': 'Entrega',
    'proposal': 'Proposta',
    'decision': 'Decisao',
    'meeting_erp': 'Reuniao ERP',
    'knowledge_item': 'Biblioteca',
    'projeto_ativo': 'Projeto Ativo',
    'projeto_finalizado': 'Projeto Finalizado',
    'cliente': 'Cliente',
    'reuniao': 'Reuniao',
    'mercado': 'Mercado',
    'modulo': 'Modulo'
  },

  // ── Main search (enhanced with ERP + fuzzy + field syntax) ────────────
  search(query, options = {}) {
    const results = [];
    const raw = query.trim();
    if (!raw) return results;

    // Check for field search syntax: "campo:valor"
    const fieldMatch = raw.match(/^(\w+):(.+)$/);
    if (fieldMatch) {
      return this._fieldSearch(fieldMatch[1].toLowerCase(), fieldMatch[2].trim().toLowerCase(), options);
    }

    const q = raw.toLowerCase();
    const filter = options.filter || 'all';

    const context = TBO_STORAGE.get('context');
    const meetings = TBO_STORAGE.get('meetings');
    const market = TBO_STORAGE.get('market');

    // ── ERP entities (projects, tasks, deliverables, proposals, decisions) ──
    if (filter === 'all' || filter === 'projeto_ativo' || filter === 'project') {
      this._searchErpType('project', q, results);
    }
    if (filter === 'all' || filter === 'task') {
      this._searchErpType('task', q, results);
    }
    if (filter === 'all' || filter === 'deliverable') {
      this._searchErpType('deliverable', q, results);
    }
    if (filter === 'all' || filter === 'proposal') {
      this._searchErpType('proposal', q, results);
    }
    if (filter === 'all' || filter === 'decision') {
      this._searchErpType('decision', q, results);
    }
    if (filter === 'all' || filter === 'knowledge_item') {
      this._searchErpType('knowledge_item', q, results);
    }

    // ── Context-based (active projects from JSON) ──
    if (filter === 'all' || filter === 'projeto_ativo') {
      (context.projetos_ativos || []).forEach(p => {
        const text = `${p.nome} ${p.construtora} ${(p.bus || []).join(' ')}`.toLowerCase();
        if (this._fuzzyMatch(text, q)) {
          // Avoid duplicates with ERP projects
          if (!results.find(r => r.type === 'project' && r.title === p.nome)) {
            results.push({ type: 'projeto_ativo', title: p.nome, subtitle: p.construtora, data: p, score: this._score(text, q), icon: 'briefcase' });
          }
        }
      });
    }

    // Completed projects
    if (filter === 'all' || filter === 'projeto_ativo') {
      Object.entries(context.projetos_finalizados || {}).forEach(([year, projects]) => {
        projects.forEach(name => {
          if (this._fuzzyMatch(name.toLowerCase(), q)) {
            results.push({ type: 'projeto_finalizado', title: name, subtitle: `Finalizado em ${year}`, data: { nome: name, ano: year }, score: this._score(name.toLowerCase(), q), icon: 'archive' });
          }
        });
      });
    }

    // Clients
    if (filter === 'all' || filter === 'cliente') {
      (context.clientes_construtoras || []).forEach(client => {
        if (this._fuzzyMatch(client.toLowerCase(), q)) {
          results.push({ type: 'cliente', title: client, subtitle: 'Construtora/Cliente', data: { nome: client }, score: this._score(client.toLowerCase(), q), icon: 'building' });
        }
      });
    }

    // Meetings
    if (filter === 'all' || filter === 'reuniao') {
      const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
      meetingsArr.forEach(r => {
        const title = r.title || r.titulo || '';
        const summary = r.summary || r.resumo || '';
        const category = r.category || r.categoria || '';
        const date = r.date || r.data || '';
        const text = `${title} ${summary}`.toLowerCase();
        if (this._fuzzyMatch(text, q)) {
          results.push({ type: 'reuniao', title, subtitle: `${date} — ${category}`, data: r, score: this._score(text, q), icon: 'video' });
        }
      });
    }

    // Market trends
    if (filter === 'all') {
      (market.tendencias || []).forEach(t => {
        if (this._fuzzyMatch(t.toLowerCase(), q)) {
          results.push({ type: 'mercado', title: t, subtitle: 'Tendencia', data: { tendencia: t }, score: this._score(t.toLowerCase(), q), icon: 'trending-up' });
        }
      });
    }

    // Modules
    if (filter === 'all' || filter === 'modulo') {
      this._searchModules(q, results);
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return options.limit ? results.slice(0, options.limit) : results;
  },

  // ── Search ERP entity type ────────────────────────────────────────────
  _searchErpType(type, q, results) {
    const items = TBO_STORAGE.getAllErpEntities(type);
    items.forEach(item => {
      const name = item.name || item.title || '';
      const client = item.client || '';
      const status = item.status || '';
      const owner = item.ownerId || '';
      const desc = item.description || '';
      const text = `${name} ${client} ${status} ${owner} ${desc}`.toLowerCase();

      if (this._fuzzyMatch(text, q)) {
        const label = this._typeLabels[type] || type;
        const statusBadge = status ? ` [${status}]` : '';
        results.push({
          type,
          title: name,
          subtitle: `${label}${statusBadge}${client ? ' — ' + client : ''}`,
          data: item,
          score: this._score(text, q),
          icon: this._typeIcons[type] || 'file',
          entityId: item.id,
          actionUrl: this._getActionUrl(type, item)
        });
      }
    });
  },

  // ── Field search (e.g., "cliente:xyz", "status:producao") ─────────────
  _fieldSearch(field, value, options) {
    const results = [];
    const types = ['project', 'task', 'deliverable', 'proposal', 'decision', 'meeting_erp'];

    const fieldMap = {
      'cliente': 'client',
      'client': 'client',
      'status': 'status',
      'owner': 'ownerId',
      'dono': 'ownerId',
      'prioridade': 'priority',
      'priority': 'priority',
      'bu': 'bu',
      'projeto': 'projectId',
      'project': 'projectId',
      'tipo': '__type__',
      'type': '__type__'
    };

    const mappedField = fieldMap[field] || field;

    types.forEach(type => {
      const items = TBO_STORAGE.getAllErpEntities(type);
      items.forEach(item => {
        let match = false;
        if (mappedField === '__type__') {
          match = type.includes(value);
        } else {
          const val = (item[mappedField] || '').toString().toLowerCase();
          match = this._fuzzyMatch(val, value);
        }

        if (match) {
          const name = item.name || item.title || '';
          results.push({
            type,
            title: name,
            subtitle: `${this._typeLabels[type] || type} [${item.status || ''}]`,
            data: item,
            score: 10,
            icon: this._typeIcons[type] || 'file',
            entityId: item.id,
            actionUrl: this._getActionUrl(type, item)
          });
        }
      });
    });

    results.sort((a, b) => b.score - a.score);
    return options.limit ? results.slice(0, options.limit) : results;
  },

  // ── Module search ─────────────────────────────────────────────────────
  _searchModules(q, results) {
    if (typeof TBO_APP === 'undefined') return;
    const labels = TBO_APP._moduleLabels || {};
    Object.entries(labels).forEach(([key, label]) => {
      if (this._fuzzyMatch(label.toLowerCase(), q) || this._fuzzyMatch(key, q)) {
        results.push({
          type: 'modulo',
          title: label,
          subtitle: 'Modulo',
          data: { key },
          score: this._score(label.toLowerCase(), q) + 3,
          icon: 'layout-grid',
          actionUrl: '#' + key
        });
      }
    });
  },

  // ── Action URL for navigation ─────────────────────────────────────────
  _getActionUrl(type, item) {
    const map = {
      'project': '#projetos',
      'task': '#tarefas',
      'deliverable': '#entregas',
      'proposal': '#comercial',
      'decision': '#decisoes',
      'meeting_erp': '#reunioes',
      'knowledge_item': '#biblioteca'
    };
    return map[type] || null;
  },

  // ── Fuzzy matching (tolerance for 1 typo on words > 3 chars) ──────────
  _fuzzyMatch(text, query) {
    if (text.includes(query)) return true;

    // Split query into words, check each
    const words = query.split(/\s+/);
    return words.every(word => {
      if (text.includes(word)) return true;
      // Fuzzy: allow 1 char difference for words > 3 chars
      if (word.length > 3) {
        return this._levenshteinClose(text, word, 1);
      }
      return false;
    });
  },

  _levenshteinClose(text, word, maxDist) {
    // Check if any substring of text is within maxDist of word
    const wLen = word.length;
    for (let i = 0; i <= text.length - wLen + maxDist; i++) {
      const sub = text.substring(i, i + wLen + maxDist);
      if (this._levenshtein(sub.substring(0, wLen), word) <= maxDist) return true;
      if (wLen + 1 <= sub.length && this._levenshtein(sub.substring(0, wLen + 1), word) <= maxDist) return true;
    }
    return false;
  },

  _levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => i);
    for (let j = 1; j <= n; j++) {
      let prev = dp[0];
      dp[0] = j;
      for (let i = 1; i <= m; i++) {
        const temp = dp[i];
        dp[i] = Math.min(
          dp[i - 1] + 1,
          dp[i] + 1,
          prev + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
        prev = temp;
      }
    }
    return dp[m];
  },

  // ── Scoring ───────────────────────────────────────────────────────────
  _score(text, query) {
    let score = 0;
    if (text.startsWith(query)) score += 10;
    else if (text.includes(query)) score += 5;
    // Exact word match bonus
    if (text.split(/\s+/).includes(query)) score += 8;
    // Count occurrences
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    if (matches) score += matches.length;
    // Shorter text = more relevant
    if (text.length < 50) score += 2;
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
