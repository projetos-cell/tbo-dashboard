// TBO OS — Module: Alertas (Smart Notification Center)
const TBO_ALERTS = {
  _filter: 'all', // 'all','urgent','projects','commercial','tasks'
  _dismissed: JSON.parse(localStorage.getItem('tbo_alerts_dismissed') || '[]'),

  render() {
    const alerts = this._generateAlerts();
    const filtered = this._filter === 'all' ? alerts : alerts.filter(a => a.category === this._filter);
    const urgent = alerts.filter(a => a.severity === 'high');
    const medium = alerts.filter(a => a.severity === 'medium');

    const filterBtns = [
      { key: 'all', label: 'Todos', icon: '&#9673;' },
      { key: 'urgent', label: 'Urgentes', icon: '&#9888;' },
      { key: 'projects', label: 'Projetos', icon: '&#128203;' },
      { key: 'commercial', label: 'Comercial', icon: '&#128200;' },
      { key: 'tasks', label: 'Tarefas', icon: '&#9745;' }
    ];

    return `
      <div class="alerts-module">
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Central de Alertas</h2>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag tag-danger">${urgent.length} urgentes</span>
              <span class="tag">${medium.length} atencao</span>
              <span class="tag">${alerts.length} total</span>
              <button class="btn btn-secondary btn-sm alerts-dismiss-all" title="Dispensar todos">Limpar lidos</button>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="alerts-summary">
            <div class="alerts-summary-card alerts-summary-urgent">
              <div class="alerts-summary-number">${urgent.length}</div>
              <div class="alerts-summary-label">Urgentes</div>
            </div>
            <div class="alerts-summary-card alerts-summary-medium">
              <div class="alerts-summary-number">${medium.length}</div>
              <div class="alerts-summary-label">Atencao</div>
            </div>
            <div class="alerts-summary-card alerts-summary-low">
              <div class="alerts-summary-number">${alerts.filter(a => a.severity === 'low').length}</div>
              <div class="alerts-summary-label">Info</div>
            </div>
            <div class="alerts-summary-card alerts-summary-total">
              <div class="alerts-summary-number">${alerts.length}</div>
              <div class="alerts-summary-label">Total</div>
            </div>
          </div>

          <!-- Filters -->
          <div style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;">
            ${filterBtns.map(f => `<button class="btn ${this._filter === f.key ? 'btn-primary' : 'btn-secondary'} alerts-filter-btn" data-filter="${f.key}" style="font-size:0.72rem;padding:5px 12px;">${f.icon} ${f.label}</button>`).join('')}
          </div>

          ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Nenhum alerta pendente. Tudo em dia!</div></div>' : ''}

          <!-- Alert List -->
          <div class="alerts-list">
            ${filtered.map(a => `
              <div class="alerts-item alerts-item--${a.severity}" data-alert-id="${a.id}">
                <div class="alerts-item-icon">${a.icon}</div>
                <div class="alerts-item-body">
                  <div class="alerts-item-header">
                    <span class="alerts-item-title">${a.title}</span>
                    <span class="alerts-badge alerts-badge--${a.severity}">${a.severityLabel}</span>
                    <span class="alerts-item-cat">${a.categoryLabel}</span>
                  </div>
                  <div class="alerts-item-desc">${a.description}</div>
                  ${a.actionLabel ? `<button class="btn btn-sm btn-primary alerts-action-btn" data-action="${a.actionRoute}" style="margin-top:6px;font-size:0.7rem;">${a.actionLabel}</button>` : ''}
                </div>
                <button class="alerts-dismiss-btn" data-dismiss="${a.id}" title="Dispensar">&#10005;</button>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  },

  _generateAlerts() {
    const alerts = [];
    const now = new Date();
    const context = TBO_STORAGE.get('context');
    const projects = context.projetos_ativos || [];
    const erpSummary = TBO_STORAGE.getErpSummary();
    const crmData = TBO_STORAGE.getCrmData();
    const deals = TBO_STORAGE.getCrmDeals();
    const auditLog = typeof TBO_ERP !== 'undefined' ? TBO_ERP.getAuditLog().slice(0, 50) : [];
    const erpProjects = TBO_STORAGE.getAllErpEntities('project');
    const erpTasks = TBO_STORAGE.getAllErpEntities('task');
    const erpDeliverables = TBO_STORAGE.getAllErpEntities('deliverable');
    const proposals = TBO_STORAGE.getAllErpEntities('proposal');

    // 1. Overdue tasks
    const overdue = erpTasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && t.due_date && new Date(t.due_date) < now);
    if (overdue.length > 0) {
      alerts.push({
        id: 'overdue-tasks',
        severity: 'high',
        severityLabel: 'Urgente',
        category: 'tasks',
        categoryLabel: 'Tarefas',
        icon: '&#9888;',
        title: `${overdue.length} tarefa${overdue.length > 1 ? 's' : ''} atrasada${overdue.length > 1 ? 's' : ''}`,
        description: overdue.slice(0, 3).map(t => `${t.title} (${this._daysAgo(t.due_date)}d atraso)`).join(', '),
        actionLabel: 'Ver Projetos',
        actionRoute: 'projetos'
      });
    }

    // 2. Deliverables pending review
    const pendingReview = erpDeliverables.filter(d => d.status === 'em_revisao');
    if (pendingReview.length > 0) {
      alerts.push({
        id: 'pending-reviews',
        severity: 'medium',
        severityLabel: 'Atencao',
        category: 'projects',
        categoryLabel: 'Projetos',
        icon: '&#128269;',
        title: `${pendingReview.length} entregavel aguardando revisao`,
        description: pendingReview.slice(0, 3).map(d => d.name).join(', '),
        actionLabel: 'Ver Projetos',
        actionRoute: 'projetos'
      });
    }

    // 3. Stalled projects (no activity in 7+ days)
    const stalledProjects = erpProjects.filter(p => {
      if (['finalizado','cancelado','pausado'].includes(p.status)) return false;
      const lastUpdate = new Date(p.updatedAt || p.createdAt);
      return (now - lastUpdate) / (1000*60*60*24) > 7;
    });
    if (stalledProjects.length > 0) {
      alerts.push({
        id: 'stalled-projects',
        severity: 'medium',
        severityLabel: 'Atencao',
        category: 'projects',
        categoryLabel: 'Projetos',
        icon: '&#9888;',
        title: `${stalledProjects.length} projeto${stalledProjects.length > 1 ? 's' : ''} sem movimentacao`,
        description: 'Sem atualizacao ha mais de 7 dias',
        actionLabel: 'Ver Projetos',
        actionRoute: 'projetos'
      });
    }

    // 4. Open proposals nearing close date
    const urgentDeals = deals.filter(d => {
      if (['fechado_ganho','fechado_perdido'].includes(d.stage)) return false;
      if (!d.expectedClose) return false;
      const daysLeft = (new Date(d.expectedClose) - now) / (1000*60*60*24);
      return daysLeft >= 0 && daysLeft <= 7;
    });
    if (urgentDeals.length > 0) {
      alerts.push({
        id: 'urgent-deals',
        severity: 'high',
        severityLabel: 'Urgente',
        category: 'commercial',
        categoryLabel: 'Comercial',
        icon: '&#128176;',
        title: `${urgentDeals.length} deal${urgentDeals.length > 1 ? 's' : ''} com fechamento proximo`,
        description: urgentDeals.slice(0, 3).map(d => `${d.name} (${this._daysUntil(d.expectedClose)}d)`).join(', '),
        actionLabel: 'Ver Pipeline',
        actionRoute: 'pipeline'
      });
    }

    // 5. Lost deals recent
    const recentLost = deals.filter(d => {
      if (d.stage !== 'fechado_perdido') return false;
      const daysAgo = (now - new Date(d.updatedAt || d.createdAt)) / (1000*60*60*24);
      return daysAgo <= 14;
    });
    if (recentLost.length > 0) {
      alerts.push({
        id: 'recent-lost',
        severity: 'low',
        severityLabel: 'Info',
        category: 'commercial',
        categoryLabel: 'Comercial',
        icon: '&#128308;',
        title: `${recentLost.length} deal${recentLost.length > 1 ? 's' : ''} perdido${recentLost.length > 1 ? 's' : ''} recentemente`,
        description: recentLost.slice(0, 2).map(d => d.name).join(', '),
        actionLabel: 'Ver Pipeline',
        actionRoute: 'pipeline'
      });
    }

    // 6. High value active projects (info)
    const highValueProjects = projects.filter(p => (p.bus || []).length >= 4);
    if (highValueProjects.length > 0) {
      alerts.push({
        id: 'high-value-projects',
        severity: 'low',
        severityLabel: 'Info',
        category: 'projects',
        categoryLabel: 'Projetos',
        icon: '&#11088;',
        title: `${highValueProjects.length} projeto${highValueProjects.length > 1 ? 's' : ''} de alto escopo`,
        description: highValueProjects.slice(0, 3).map(p => `${p.nome} (${(p.bus||[]).length} BUs)`).join(', '),
        actionLabel: 'Ver Projetos',
        actionRoute: 'projetos'
      });
    }

    // 7. Pipeline health
    const activeDeals = deals.filter(d => !['fechado_ganho','fechado_perdido'].includes(d.stage));
    const totalPipelineValue = activeDeals.reduce((s,d) => s + (d.value || 0), 0);
    if (activeDeals.length > 0) {
      alerts.push({
        id: 'pipeline-health',
        severity: 'low',
        severityLabel: 'Info',
        category: 'commercial',
        categoryLabel: 'Comercial',
        icon: '&#128200;',
        title: `Pipeline: ${activeDeals.length} deals ativos`,
        description: `Valor total: R$ ${this._formatCurrency(totalPipelineValue)}`,
        actionLabel: 'Ver Pipeline',
        actionRoute: 'pipeline'
      });
    }

    // 8. ERP Projects count info
    if (projects.length > 0) {
      const clientCount = new Set(projects.map(p => p.construtora)).size;
      alerts.push({
        id: 'projects-summary',
        severity: 'low',
        severityLabel: 'Info',
        category: 'projects',
        categoryLabel: 'Projetos',
        icon: '&#128203;',
        title: `${projects.length} projetos ativos com ${clientCount} clientes`,
        description: `BUs: ${[...new Set(projects.flatMap(p => p.bus || []))].join(', ')}`,
        actionLabel: 'Ver Projetos',
        actionRoute: 'projetos'
      });
    }

    // Filter dismissed
    const dismissed = this._dismissed;
    return alerts.filter(a => !dismissed.includes(a.id));
  },

  _daysAgo(dateStr) {
    const d = new Date(dateStr);
    return Math.floor((new Date() - d) / (1000*60*60*24));
  },

  _daysUntil(dateStr) {
    const d = new Date(dateStr);
    return Math.max(0, Math.floor((d - new Date()) / (1000*60*60*24)));
  },

  _formatCurrency(val) {
    return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  },

  init() {
    // Filter buttons
    document.querySelectorAll('.alerts-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._filter = btn.dataset.filter;
        this._refresh();
      });
    });

    // Dismiss individual
    document.querySelectorAll('.alerts-dismiss-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.dismiss;
        if (id && !this._dismissed.includes(id)) {
          this._dismissed.push(id);
          localStorage.setItem('tbo_alerts_dismissed', JSON.stringify(this._dismissed));
          this._refresh();
        }
      });
    });

    // Dismiss all
    const dismissAll = document.querySelector('.alerts-dismiss-all');
    if (dismissAll) {
      dismissAll.addEventListener('click', () => {
        const alerts = this._generateAlerts();
        alerts.filter(a => a.severity === 'low').forEach(a => {
          if (!this._dismissed.includes(a.id)) this._dismissed.push(a.id);
        });
        localStorage.setItem('tbo_alerts_dismissed', JSON.stringify(this._dismissed));
        this._refresh();
      });
    }

    // Action buttons (navigate to module)
    document.querySelectorAll('.alerts-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.dataset.action;
        if (route && typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate(route);
      });
    });
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  }
};
