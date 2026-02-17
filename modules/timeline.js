// TBO OS — Module: Timeline (Activity Feed + Project Milestones)
const TBO_TIMELINE = {
  _filter: 'all', // 'all', 'projects', 'meetings', 'crm', 'tasks'

  render() {
    const auditLogs = typeof TBO_ERP !== 'undefined' ? TBO_ERP.getAuditLog().slice(0, 100) : [];
    const meetings = TBO_STORAGE.get('meetings');
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    const context = TBO_STORAGE.get('context');
    const projects = context.projetos_ativos || [];

    // Build unified timeline events
    const events = [];

    // From audit log
    auditLogs.forEach(l => {
      events.push({
        type: l.entityType === 'project' ? 'projects' : l.entityType === 'deal' ? 'crm' : 'tasks',
        date: l.timestamp,
        title: this._actionLabel(l.action),
        detail: l.entityName || '',
        extra: l.from && l.to ? `${l.from} → ${l.to}` : (l.reason || ''),
        user: l.userId || 'sistema',
        icon: this._actionIcon(l.action),
        color: this._actionColor(l.entityType)
      });
    });

    // From meetings
    meetingsArr.forEach(m => {
      const title = m.title || m.titulo || '';
      const date = m.date || m.data || '';
      const dur = m.duration_minutes || m.duracao_minutos || 0;
      events.push({
        type: 'meetings',
        date: date,
        title: title,
        detail: `${Math.round(dur)} min`,
        extra: m.category || m.categoria || '',
        user: '',
        icon: '&#128227;',
        color: '#8b5cf6'
      });
    });

    // Sort by date descending
    events.sort((a, b) => {
      const da = new Date(a.date || 0);
      const db = new Date(b.date || 0);
      return db - da;
    });

    // Apply filter
    const filtered = this._filter === 'all' ? events : events.filter(e => e.type === this._filter);
    const displayed = filtered.slice(0, 80);

    // Group by date
    const groups = {};
    displayed.forEach(e => {
      const d = e.date ? new Date(e.date) : new Date();
      const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    const filterBtns = [
      { key: 'all', label: 'Tudo', icon: '&#9673;' },
      { key: 'projects', label: 'Projetos', icon: '&#128203;' },
      { key: 'meetings', label: 'Reunioes', icon: '&#128227;' },
      { key: 'crm', label: 'Comercial', icon: '&#128200;' },
      { key: 'tasks', label: 'Tarefas', icon: '&#9745;' }
    ];

    return `
      <div class="timeline-module">
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Timeline de Atividades</h2>
            <span class="tag">${filtered.length} eventos</span>
          </div>

          <!-- Filters -->
          <div style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;">
            ${filterBtns.map(f => `<button class="btn ${this._filter === f.key ? 'btn-primary' : 'btn-secondary'} tl-filter-btn" data-filter="${f.key}" style="font-size:0.72rem;padding:5px 12px;">${f.icon} ${f.label}</button>`).join('')}
          </div>

          ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Nenhuma atividade registrada ainda. Use a plataforma para gerar historico.</div></div>' : ''}

          <!-- Timeline -->
          <div class="tl-container">
            ${Object.entries(groups).map(([dateLabel, items]) => `
              <div class="tl-date-group">
                <div class="tl-date-label">${dateLabel}</div>
                <div class="tl-items">
                  ${items.map(e => `
                    <div class="tl-item">
                      <div class="tl-dot" style="background:${e.color};"></div>
                      <div class="tl-content">
                        <div class="tl-header">
                          <span class="tl-icon">${e.icon}</span>
                          <span class="tl-title">${e.title}</span>
                          ${e.user ? `<span class="tl-user">${e.user}</span>` : ''}
                          <span class="tl-time">${e.date ? new Date(e.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        ${e.detail ? `<div class="tl-detail">${e.detail}</div>` : ''}
                        ${e.extra ? `<div class="tl-extra">${e.extra}</div>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  },

  _actionLabel(action) {
    const map = {
      state_change: 'Mudou status', created: 'Criou', updated: 'Atualizou',
      deleted: 'Removeu', convert_to_project: 'Converteu em projeto',
      timer_started: 'Iniciou timer', timer_stopped: 'Parou timer',
      manual_entry: 'Lancamento manual', erp_seed: 'Inicializacao',
      new_version: 'Nova versao', version_approved: 'Versao aprovada',
      playbook_applied: 'Playbook aplicado'
    };
    return map[action] || action;
  },

  _actionIcon(action) {
    const map = {
      state_change: '&#9654;', created: '&#10010;', updated: '&#9998;',
      deleted: '&#10006;', timer_started: '&#9200;', timer_stopped: '&#9209;',
      convert_to_project: '&#128640;', erp_seed: '&#9881;'
    };
    return map[action] || '&#8226;';
  },

  _actionColor(entityType) {
    const map = { project: '#3b82f6', task: '#22c55e', deal: '#f59e0b', deliverable: '#8b5cf6', proposal: '#E85102' };
    return map[entityType] || '#94a3b8';
  },

  init() {
    document.querySelectorAll('.tl-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._filter = btn.dataset.filter;
        const container = document.getElementById('moduleContainer');
        if (container) { container.innerHTML = this.render(); this.init(); }
      });
    });
  }
};
