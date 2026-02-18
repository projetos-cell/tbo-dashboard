// ============================================================================
// TBO OS — ERP Core Engine (MVP Local)
// State machines, audit log, ownership validation, health score, next_action
// ============================================================================

const TBO_ERP = {

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MACHINES — Valid transitions for each entity type
  // ═══════════════════════════════════════════════════════════════════════════

  stateMachines: {
    project: {
      states: ['briefing','planejamento','producao','revisao','entrega','finalizado','pausado','cancelado'],
      transitions: {
        briefing:      ['planejamento','cancelado'],
        planejamento:  ['producao','pausado','cancelado'],
        producao:      ['revisao','pausado','cancelado'],
        revisao:       ['producao','entrega','pausado'],
        entrega:       ['finalizado','revisao'],
        finalizado:    [],
        pausado:       ['briefing','planejamento','producao','revisao','cancelado'],
        cancelado:     []
      },
      labels: {
        briefing:'Briefing', planejamento:'Planejamento', producao:'Producao',
        revisao:'Revisao', entrega:'Entrega', finalizado:'Finalizado',
        pausado:'Pausado', cancelado:'Cancelado'
      },
      colors: {
        briefing:'#6366f1', planejamento:'#f59e0b', producao:'#3b82f6',
        revisao:'#8b5cf6', entrega:'#14b8a6', finalizado:'#22c55e',
        pausado:'#94a3b8', cancelado:'#ef4444'
      }
    },

    proposal: {
      states: ['rascunho','enviada','em_negociacao','aprovada','recusada','convertida'],
      transitions: {
        rascunho:       ['enviada','recusada'],
        enviada:        ['em_negociacao','aprovada','recusada'],
        em_negociacao:  ['aprovada','recusada','enviada'],
        aprovada:       ['convertida'],
        recusada:       [],
        convertida:     []
      },
      labels: {
        rascunho:'Rascunho', enviada:'Enviada', em_negociacao:'Em Negociacao',
        aprovada:'Aprovada', recusada:'Recusada', convertida:'Convertida em Projeto'
      },
      colors: {
        rascunho:'#94a3b8', enviada:'#3b82f6', em_negociacao:'#f59e0b',
        aprovada:'#22c55e', recusada:'#ef4444', convertida:'#14b8a6'
      }
    },

    deliverable: {
      states: ['pendente','em_producao','em_revisao','aprovado','entregue'],
      transitions: {
        pendente:      ['em_producao'],
        em_producao:   ['em_revisao','pendente'],
        em_revisao:    ['em_producao','aprovado'],
        aprovado:      ['entregue','em_producao'],
        entregue:      []
      },
      labels: {
        pendente:'Pendente', em_producao:'Em Producao', em_revisao:'Em Revisao',
        aprovado:'Aprovado', entregue:'Entregue'
      },
      colors: {
        pendente:'#94a3b8', em_producao:'#3b82f6', em_revisao:'#f59e0b',
        aprovado:'#22c55e', entregue:'#14b8a6'
      }
    },

    task: {
      states: ['pendente','em_andamento','concluida','cancelada'],
      transitions: {
        pendente:       ['em_andamento','cancelada'],
        em_andamento:   ['concluida','pendente','cancelada'],
        concluida:      ['pendente'],
        cancelada:      []
      },
      labels: {
        pendente:'Pendente', em_andamento:'Em Andamento',
        concluida:'Concluida', cancelada:'Cancelada'
      },
      colors: {
        pendente:'#94a3b8', em_andamento:'#3b82f6',
        concluida:'#22c55e', cancelada:'#ef4444'
      }
    },

    meeting: {
      states: ['agendada','em_andamento','concluida','cancelada'],
      transitions: {
        agendada:       ['em_andamento','cancelada'],
        em_andamento:   ['concluida'],
        concluida:      [],
        cancelada:      []
      },
      labels: {
        agendada:'Agendada', em_andamento:'Em Andamento',
        concluida:'Concluida', cancelada:'Cancelada'
      },
      colors: {
        agendada:'#f59e0b', em_andamento:'#3b82f6',
        concluida:'#22c55e', cancelada:'#ef4444'
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSITION VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  canTransition(entityType, currentState, newState) {
    const sm = this.stateMachines[entityType];
    if (!sm) return false;
    const allowed = sm.transitions[currentState];
    if (!allowed) return false;
    return allowed.includes(newState);
  },

  getValidTransitions(entityType, currentState) {
    const sm = this.stateMachines[entityType];
    if (!sm) return [];
    return (sm.transitions[currentState] || []).map(s => ({
      state: s,
      label: sm.labels[s] || s,
      color: sm.colors[s] || '#94a3b8'
    }));
  },

  getStateLabel(entityType, state) {
    const sm = this.stateMachines[entityType];
    if (!sm) return state;
    return sm.labels[state] || state;
  },

  getStateColor(entityType, state) {
    const sm = this.stateMachines[entityType];
    if (!sm) return '#94a3b8';
    return sm.colors[state] || '#94a3b8';
  },

  // Execute a state transition with validation + audit log
  transition(entityType, entityId, newState, userId, reason) {
    const entity = TBO_STORAGE.getErpEntity(entityType, entityId);
    if (!entity) return { ok: false, error: 'Entidade nao encontrada' };

    const currentState = entity.status || entity.state;
    if (currentState === newState) return { ok: false, error: 'Estado ja e o atual' };

    if (!this.canTransition(entityType, currentState, newState)) {
      const label = this.getStateLabel(entityType, currentState);
      const validStr = this.getValidTransitions(entityType, currentState)
        .map(t => t.label).join(', ');
      return {
        ok: false,
        error: `Transicao invalida: ${label} -> ${this.getStateLabel(entityType, newState)}. Validas: ${validStr || 'nenhuma'}`
      };
    }

    // Pre-transition validations
    const validation = this._preTransitionValidation(entityType, entity, newState);
    if (!validation.ok) return validation;

    // Execute transition
    const oldState = currentState;
    const updates = { status: newState, updatedAt: new Date().toISOString() };

    // Clear next_action warning if transitioning to final states
    if (['finalizado','cancelado','concluida','entregue','recusada','convertida'].includes(newState)) {
      updates.next_action = null;
      updates.next_action_date = null;
    }

    TBO_STORAGE.updateErpEntity(entityType, entityId, updates);

    // Log the transition
    const sm = this.stateMachines[entityType];
    this.addAuditLog({
      entityType,
      entityId,
      action: 'state_change',
      from: oldState,
      to: newState,
      userId: userId || this._getCurrentUserId(),
      reason: reason || '',
      entityName: entity.name || entity.title || entity.nome || entityId,
      details: {
        fromLabel: sm ? sm.labels[oldState] : oldState,
        toLabel: sm ? sm.labels[newState] : newState,
        transitionTime: new Date().toISOString()
      }
    });

    return { ok: true, from: oldState, to: newState };
  },

  _preTransitionValidation(entityType, entity, newState) {
    // Project: cant go to "producao" without next_action
    if (entityType === 'project' && newState === 'producao') {
      if (!entity.next_action) {
        return { ok: false, error: 'Defina a proxima acao antes de iniciar producao' };
      }
    }
    // Project: cant go to "entrega" without owner
    if (entityType === 'project' && newState === 'entrega') {
      if (!entity.owner) {
        return { ok: false, error: 'Projeto precisa ter um responsavel para ir para entrega' };
      }
    }
    // Proposal: cant send without client + value
    if (entityType === 'proposal' && newState === 'enviada') {
      if (!entity.client) return { ok: false, error: 'Proposta precisa ter cliente definido' };
      if (!entity.value || entity.value <= 0) return { ok: false, error: 'Proposta precisa ter valor > 0' };
    }
    return { ok: true };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OWNERSHIP ENFORCEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  validateOwnership(entity) {
    const warnings = [];
    if (!entity.owner) {
      warnings.push({ level: 'critical', message: 'Sem responsavel definido' });
    }
    return warnings;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEXT ACTION ENFORCEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  validateNextAction(entity) {
    const warnings = [];
    const activeStates = ['planejamento','producao','revisao','entrega','em_andamento','em_producao','em_revisao'];
    if (activeStates.includes(entity.status)) {
      if (!entity.next_action) {
        warnings.push({ level: 'warning', message: 'Proxima acao nao definida' });
      }
      if (entity.next_action_date) {
        const due = new Date(entity.next_action_date);
        const now = new Date();
        if (due < now) {
          warnings.push({ level: 'critical', message: `Proxima acao atrasada (${TBO_FORMATTER.relativeTime(entity.next_action_date)})` });
        }
      }
    }
    return warnings;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT LOG
  // ═══════════════════════════════════════════════════════════════════════════

  addAuditLog(entry) {
    const now = new Date().toISOString();
    const logEntry = {
      ...entry,
      timestamp: now,
      id: 'al_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4)
    };

    // 1. Save to localStorage (for immediate sync reads)
    try {
      const logs = this._getLocalAuditLog();
      logs.unshift(logEntry);
      // Keep last 1000 entries locally (Supabase has unlimited)
      if (logs.length > 1000) logs.length = 1000;
      localStorage.setItem('tbo_audit_log', JSON.stringify(logs));
    } catch (e) {
      console.warn('Audit log localStorage save failed:', e);
    }

    // 2. Write to Supabase (fire-and-forget)
    this._auditLogToSupabase(logEntry);
  },

  _auditLogToSupabase(entry) {
    if (typeof TBO_SUPABASE === 'undefined') return;
    const client = TBO_SUPABASE.getClient();
    if (!client || !TBO_SUPABASE.isOnline()) {
      TBO_SUPABASE.addToSyncQueue({
        table: 'audit_log', action: 'insert',
        entity: entry, id: entry.id
      });
      return;
    }

    (async () => {
      try {
        await client.from('audit_log').insert({
          entity_type: entry.entityType,
          entity_id: entry.entityId,
          action: entry.action,
          user_id: entry.userId || 'system',
          details: {
            from: entry.from || null,
            to: entry.to || null,
            reason: entry.reason || null,
            entityName: entry.entityName || null
          }
        });
      } catch (e) {
        console.warn('[TBO ERP] Supabase audit log write failed:', e);
        TBO_SUPABASE.addToSyncQueue({
          table: 'audit_log', action: 'insert',
          entity: entry, id: entry.id
        });
      }
    })();
  },

  _getLocalAuditLog() {
    try {
      const raw = localStorage.getItem('tbo_audit_log');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  getAuditLog(filters) {
    // Read from local cache (sync)
    try {
      let logs = this._getLocalAuditLog();
      if (filters) {
        if (filters.entityType) logs = logs.filter(l => l.entityType === filters.entityType);
        if (filters.entityId) logs = logs.filter(l => l.entityId === filters.entityId);
        if (filters.userId) logs = logs.filter(l => l.userId === filters.userId);
        if (filters.action) logs = logs.filter(l => l.action === filters.action);
        if (filters.from) logs = logs.filter(l => l.timestamp >= filters.from);
        if (filters.to) logs = logs.filter(l => l.timestamp <= filters.to);
      }
      return logs;
    } catch (e) {
      return [];
    }
  },

  // Async version: query Supabase for full audit history (server-side filters)
  async getAuditLogAsync(filters) {
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.isOnline()) {
      return this.getAuditLog(filters);
    }
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return this.getAuditLog(filters);

      let query = client.from('audit_log').select('*').order('created_at', { ascending: false }).limit(500);
      if (filters) {
        if (filters.entityType) query = query.eq('entity_type', filters.entityType);
        if (filters.entityId) query = query.eq('entity_id', filters.entityId);
        if (filters.userId) query = query.eq('user_id', filters.userId);
        if (filters.action) query = query.eq('action', filters.action);
        if (filters.from) query = query.gte('created_at', filters.from);
        if (filters.to) query = query.lte('created_at', filters.to);
      }

      const { data, error } = await query;
      if (error) return this.getAuditLog(filters);

      return (data || []).map(row => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        action: row.action,
        userId: row.user_id,
        from: row.details?.from || null,
        to: row.details?.to || null,
        reason: row.details?.reason || null,
        entityName: row.details?.entityName || null,
        timestamp: row.created_at
      }));
    } catch (e) {
      return this.getAuditLog(filters);
    }
  },

  getEntityHistory(entityType, entityId) {
    return this.getAuditLog({ entityType, entityId });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT CODE — Auto-generate unique project codes (TBO-YYYY-NNN)
  // ═══════════════════════════════════════════════════════════════════════════

  generateProjectCode() {
    const year = new Date().getFullYear();
    const prefix = `TBO-${year}-`;

    // Get all existing projects to find the highest code for this year
    const projects = TBO_STORAGE.getAllErpEntities('project');
    let maxNum = 0;

    projects.forEach(p => {
      if (p.code && p.code.startsWith(prefix)) {
        const num = parseInt(p.code.replace(prefix, ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    const nextNum = maxNum + 1;
    return prefix + String(nextNum).padStart(3, '0');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEADLINE ENGINE — Calculate days remaining, urgency, and deadline alerts
  // ═══════════════════════════════════════════════════════════════════════════

  getDeadlineInfo(project) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const result = {
      hasDeadline: false,
      daysRemaining: null,
      urgency: 'none', // 'none', 'safe', 'warning', 'critical', 'overdue'
      urgencyColor: '#94a3b8',
      label: '',
      endDate: null,
      startDate: null,
      durationDays: null,
      progressPercent: null
    };

    if (!project.end_date) return result;
    result.hasDeadline = true;
    result.endDate = new Date(project.end_date);
    result.endDate.setHours(0, 0, 0, 0);

    if (project.start_date) {
      result.startDate = new Date(project.start_date);
      result.startDate.setHours(0, 0, 0, 0);
      const totalDays = Math.ceil((result.endDate - result.startDate) / 86400000);
      const elapsedDays = Math.ceil((now - result.startDate) / 86400000);
      result.durationDays = totalDays;
      result.progressPercent = totalDays > 0 ? Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100))) : 0;
    }

    const diff = Math.ceil((result.endDate - now) / 86400000);
    result.daysRemaining = diff;

    if (['finalizado', 'cancelado'].includes(project.status)) {
      result.urgency = 'none';
      result.urgencyColor = '#94a3b8';
      result.label = 'Concluido';
    } else if (diff < 0) {
      result.urgency = 'overdue';
      result.urgencyColor = '#ef4444';
      result.label = `${Math.abs(diff)}d atrasado`;
    } else if (diff === 0) {
      result.urgency = 'critical';
      result.urgencyColor = '#ef4444';
      result.label = 'Vence hoje';
    } else if (diff <= 1) {
      result.urgency = 'critical';
      result.urgencyColor = '#ef4444';
      result.label = 'Vence amanha';
    } else if (diff <= 3) {
      result.urgency = 'critical';
      result.urgencyColor = '#f59e0b';
      result.label = `${diff}d restantes`;
    } else if (diff <= 7) {
      result.urgency = 'warning';
      result.urgencyColor = '#f59e0b';
      result.label = `${diff}d restantes`;
    } else {
      result.urgency = 'safe';
      result.urgencyColor = '#22c55e';
      result.label = `${diff}d restantes`;
    }

    return result;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MONTHLY CLOSING — check if a month is locked
  // ═══════════════════════════════════════════════════════════════════════════

  _monthlyLockCache: {},

  isMonthLocked(dateStr) {
    // dateStr: ISO date string or 'YYYY-MM'
    const d = dateStr ? new Date(dateStr) : new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${month}`;
    if (this._monthlyLockCache[key] !== undefined) return this._monthlyLockCache[key];
    // Default: not locked (async check will update cache)
    return false;
  },

  async checkMonthlyLocks() {
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.isOnline()) return;
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return;
      const { data, error } = await client.from('monthly_closings').select('year, month, locked');
      if (!error && data) {
        this._monthlyLockCache = {};
        data.forEach(row => {
          this._monthlyLockCache[`${row.year}-${row.month}`] = !!row.locked;
        });
      }
    } catch (e) {
      console.warn('[TBO ERP] Monthly lock check failed:', e);
    }
  },

  async lockMonth(year, month, userId) {
    if (typeof TBO_SUPABASE === 'undefined') return { ok: false, error: 'Supabase nao disponivel' };
    const client = TBO_SUPABASE.getClient();
    if (!client) return { ok: false, error: 'Supabase client nao inicializado' };

    try {
      const { error } = await client.from('monthly_closings').upsert({
        year, month, locked: true, locked_by: userId
      }, { onConflict: 'year,month' });

      if (error) return { ok: false, error: error.message };

      this._monthlyLockCache[`${year}-${month}`] = true;
      this.addAuditLog({
        entityType: 'system', entityId: `lock_${year}_${month}`,
        action: 'month_locked', userId,
        reason: `Mes ${month}/${year} fechado`,
        entityName: `Fechamento ${month}/${year}`
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  async unlockMonth(year, month, userId) {
    if (typeof TBO_SUPABASE === 'undefined') return { ok: false, error: 'Supabase nao disponivel' };
    const client = TBO_SUPABASE.getClient();
    if (!client) return { ok: false, error: 'Supabase client nao inicializado' };

    try {
      const { error } = await client.from('monthly_closings').upsert({
        year, month, locked: false, locked_by: userId
      }, { onConflict: 'year,month' });

      if (error) return { ok: false, error: error.message };

      this._monthlyLockCache[`${year}-${month}`] = false;
      this.addAuditLog({
        entityType: 'system', entityId: `lock_${year}_${month}`,
        action: 'month_unlocked', userId,
        reason: `Mes ${month}/${year} reaberto`,
        entityName: `Reabertura ${month}/${year}`
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH SCORE (0-100)
  // Calculated per project based on multiple factors
  // ═══════════════════════════════════════════════════════════════════════════

  calculateHealthScore(project) {
    let score = 100;
    const reasons = [];

    // -20: No owner
    if (!project.owner) {
      score -= 20;
      reasons.push('Sem responsavel');
    }

    // -15: No next_action when in active state
    const activeStates = ['planejamento','producao','revisao','entrega'];
    if (activeStates.includes(project.status) && !project.next_action) {
      score -= 15;
      reasons.push('Sem proxima acao definida');
    }

    // -10 to -25: next_action overdue
    if (project.next_action_date) {
      const days = Math.floor((new Date() - new Date(project.next_action_date)) / 86400000);
      if (days > 0) {
        const penalty = Math.min(25, days * 3);
        score -= penalty;
        reasons.push(`Proxima acao atrasada ${days}d`);
      }
    }

    // -10: No tasks
    const tasks = TBO_STORAGE.getErpEntitiesByParent('task', project.id);
    if (tasks.length === 0 && activeStates.includes(project.status)) {
      score -= 10;
      reasons.push('Nenhuma tarefa criada');
    }

    // -5 per overdue task (max -20)
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'concluida' || t.status === 'cancelada') return false;
      if (!t.due_date) return false;
      return new Date(t.due_date) < new Date();
    });
    if (overdueTasks.length > 0) {
      const penalty = Math.min(20, overdueTasks.length * 5);
      score -= penalty;
      reasons.push(`${overdueTasks.length} tarefa(s) atrasada(s)`);
    }

    // -10: No deliverables in producao/revisao/entrega
    const deliverables = TBO_STORAGE.getErpEntitiesByParent('deliverable', project.id);
    if (deliverables.length === 0 && ['producao','revisao','entrega'].includes(project.status)) {
      score -= 10;
      reasons.push('Nenhum entregavel definido');
    }

    // -5: Pending reviews > 3 days
    const pendingReviews = deliverables.filter(d => d.status === 'em_revisao');
    pendingReviews.forEach(d => {
      const days = Math.floor((new Date() - new Date(d.updatedAt || d.createdAt)) / 86400000);
      if (days > 3) {
        score -= 5;
        reasons.push(`Revisao pendente ${days}d: ${d.name || d.id}`);
      }
    });

    // -5: Tasks without estimate_minutes (max -15)
    if (tasks.length > 0) {
      const withoutEstimate = tasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && !t.estimate_minutes);
      const pctNoEstimate = withoutEstimate.length / tasks.length;
      if (pctNoEstimate > 0.5) {
        const penalty = Math.min(15, withoutEstimate.length * 5);
        score -= penalty;
        reasons.push(`${withoutEstimate.length} tarefa(s) sem estimativa`);
      }
    }

    // -10: No recent activity (>7 days since last update)
    if (project.updatedAt) {
      const days = Math.floor((new Date() - new Date(project.updatedAt)) / 86400000);
      if (days > 7 && activeStates.includes(project.status)) {
        score -= 10;
        reasons.push(`Sem atividade ha ${days} dias`);
      }
    }

    // Deadline overdue
    const deadline = this.getDeadlineInfo(project);
    if (deadline.hasDeadline && !['finalizado','cancelado'].includes(project.status)) {
      if (deadline.urgency === 'overdue') {
        const overdueDays = Math.abs(deadline.daysRemaining);
        const penalty = Math.min(30, 10 + overdueDays * 2);
        score -= penalty;
        reasons.push(`Prazo vencido ha ${overdueDays}d (-${penalty})`);
      } else if (deadline.daysRemaining <= 3) {
        score -= 5;
        reasons.push(`Prazo em ${deadline.daysRemaining}d (-5)`);
      }
    }

    // No end_date defined for active project in production+ phases
    if (!project.end_date && ['producao','revisao','entrega'].includes(project.status)) {
      score -= 10;
      reasons.push('Sem prazo definido (-10)');
    }

    // Clamp
    score = Math.max(0, Math.min(100, score));

    return { score, reasons, level: score >= 80 ? 'healthy' : score >= 50 ? 'warning' : 'critical' };
  },

  getHealthColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  },

  getHealthEmoji(score) {
    if (score >= 80) return '\u{1F7E2}';
    if (score >= 50) return '\u{1F7E1}';
    return '\u{1F534}';
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ALERTS ENGINE — Generates alerts from all ERP data
  // ═══════════════════════════════════════════════════════════════════════════

  generateAlerts() {
    const alerts = [];
    const now = new Date();

    // 1. Projects without owner
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const activeProjects = projects.filter(p =>
      !['finalizado','cancelado'].includes(p.status)
    );

    activeProjects.forEach(p => {
      if (!p.owner) {
        alerts.push({
          level: 'critical', icon: '\u{1F6A8}', entity: 'project', entityId: p.id,
          title: `Projeto sem responsavel: ${p.name}`,
          action: 'Defina um responsavel para o projeto'
        });
      }

      // Without next_action
      if (!p.next_action && ['producao','revisao','entrega','planejamento'].includes(p.status)) {
        alerts.push({
          level: 'warning', icon: '\u26A0\uFE0F', entity: 'project', entityId: p.id,
          title: `Sem proxima acao: ${p.name}`,
          action: 'Defina a proxima acao e prazo'
        });
      }

      // Overdue next_action
      if (p.next_action_date && new Date(p.next_action_date) < now) {
        const days = Math.floor((now - new Date(p.next_action_date)) / 86400000);
        alerts.push({
          level: 'critical', icon: '\u{1F525}', entity: 'project', entityId: p.id,
          title: `Acao atrasada ${days}d: ${p.name}`,
          action: `"${p.next_action}" estava prevista para ${TBO_FORMATTER.date(p.next_action_date)}`
        });
      }

      // Low health score
      const health = this.calculateHealthScore(p);
      if (health.score < 50) {
        alerts.push({
          level: 'critical', icon: '\u{1F6D1}', entity: 'project', entityId: p.id,
          title: `Projeto em risco (${health.score}/100): ${p.name}`,
          action: health.reasons.join('; ')
        });
      }

      // Project deadline approaching or overdue
      const deadline = this.getDeadlineInfo(p);
      if (deadline.hasDeadline) {
        if (deadline.urgency === 'overdue') {
          alerts.push({
            level: 'critical', icon: '\u23F0', entity: 'project', entityId: p.id,
            title: `Projeto atrasado ${Math.abs(deadline.daysRemaining)}d: ${p.name}`,
            action: `Prazo era ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.date(p.end_date) : p.end_date}`
          });
        } else if (deadline.urgency === 'critical') {
          alerts.push({
            level: 'critical', icon: '\u{1F514}', entity: 'project', entityId: p.id,
            title: `Prazo em ${deadline.daysRemaining}d: ${p.name}`,
            action: `Entrega prevista para ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.date(p.end_date) : p.end_date}`
          });
        } else if (deadline.urgency === 'warning') {
          alerts.push({
            level: 'warning', icon: '\u{1F4C5}', entity: 'project', entityId: p.id,
            title: `Prazo em ${deadline.daysRemaining}d: ${p.name}`,
            action: `Entrega prevista para ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.date(p.end_date) : p.end_date}`
          });
        }
      }
    });

    // 2. Overdue tasks
    const tasks = TBO_STORAGE.getAllErpEntities('task');
    tasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && t.due_date).forEach(t => {
      if (new Date(t.due_date) < now) {
        const days = Math.floor((now - new Date(t.due_date)) / 86400000);
        alerts.push({
          level: days > 3 ? 'critical' : 'warning',
          icon: '\u23F0', entity: 'task', entityId: t.id,
          title: `Tarefa atrasada ${days}d: ${t.title || t.name}`,
          action: `Responsavel: ${t.owner || 'Nao definido'}`
        });
      }
    });

    // 3. Deliverables in review > 3 days
    const deliverables = TBO_STORAGE.getAllErpEntities('deliverable');
    deliverables.filter(d => d.status === 'em_revisao').forEach(d => {
      const days = Math.floor((now - new Date(d.updatedAt || d.createdAt)) / 86400000);
      if (days > 3) {
        alerts.push({
          level: 'warning', icon: '\u{1F50D}', entity: 'deliverable', entityId: d.id,
          title: `Revisao pendente ${days}d: ${d.name}`,
          action: 'Aprovar ou solicitar alteracoes'
        });
      }
    });

    // 4. Proposals without follow-up > 5 days
    const proposals = TBO_STORAGE.getAllErpEntities('proposal');
    proposals.filter(p => p.status === 'enviada').forEach(p => {
      const days = Math.floor((now - new Date(p.updatedAt || p.createdAt)) / 86400000);
      if (days > 5) {
        alerts.push({
          level: 'warning', icon: '\u{1F4E7}', entity: 'proposal', entityId: p.id,
          title: `Proposta sem resposta ${days}d: ${p.name}`,
          action: 'Fazer follow-up com o cliente'
        });
      }
    });

    // 5. Workload alerts (timer/capacity/cost)
    if (typeof TBO_WORKLOAD !== 'undefined') {
      try {
        const wlAlerts = TBO_WORKLOAD.generateWorkloadAlerts();
        alerts.push(...wlAlerts);
      } catch (e) { /* ignore workload errors in alert generation */ }
    }

    // Sort: critical first, then warning, then info
    const levelOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => (levelOrder[a.level] || 2) - (levelOrder[b.level] || 2));

    return alerts;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS TODAY — What each person should work on
  // ═══════════════════════════════════════════════════════════════════════════

  getActionsToday(userId) {
    const actions = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Tasks due today or overdue
    const tasks = TBO_STORAGE.getAllErpEntities('task');
    tasks.filter(t => {
      if (t.status === 'concluida' || t.status === 'cancelada') return false;
      if (userId && t.owner !== userId) return false;
      if (!t.due_date) return false;
      return t.due_date <= today;
    }).forEach(t => {
      const overdue = t.due_date < today;
      actions.push({
        type: 'task',
        entityId: t.id,
        title: t.title || t.name,
        project: t.project_name || '',
        priority: overdue ? 'critical' : 'high',
        label: overdue ? `Atrasada ${Math.floor((now - new Date(t.due_date)) / 86400000)}d` : 'Vence hoje'
      });
    });

    // Next actions due today or overdue
    const projects = TBO_STORAGE.getAllErpEntities('project');
    projects.filter(p => {
      if (['finalizado','cancelado'].includes(p.status)) return false;
      if (userId && p.owner !== userId) return false;
      if (!p.next_action_date) return false;
      return p.next_action_date <= today;
    }).forEach(p => {
      actions.push({
        type: 'next_action',
        entityId: p.id,
        title: p.next_action,
        project: p.name,
        priority: p.next_action_date < today ? 'critical' : 'high',
        label: `Projeto: ${p.name}`
      });
    });

    // Deliverables pending review (for reviewers)
    const deliverables = TBO_STORAGE.getAllErpEntities('deliverable');
    deliverables.filter(d => {
      if (d.status !== 'em_revisao') return false;
      if (userId && d.reviewer !== userId) return false;
      return true;
    }).forEach(d => {
      actions.push({
        type: 'review',
        entityId: d.id,
        title: `Revisar: ${d.name}`,
        project: d.project_name || '',
        priority: 'medium',
        label: 'Aguardando revisao'
      });
    });

    // Hours tracked today
    if (typeof TBO_WORKLOAD !== 'undefined' && userId) {
      const todayEntries = TBO_WORKLOAD.getTimeEntries({ userId, dateFrom: today, dateTo: today });
      const todayMinutes = todayEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      const targetMinutes = TBO_WORKLOAD.getUserWeeklyMinutes(userId) / 5; // daily target
      actions.push({
        type: 'timetrack',
        entityId: null,
        title: `Horas hoje: ${TBO_WORKLOAD.formatHoursMinutes(todayMinutes)} de ${TBO_WORKLOAD.formatHoursMinutes(Math.round(targetMinutes))}`,
        project: '',
        priority: todayMinutes >= targetMinutes * 0.8 ? 'low' : 'medium',
        label: todayMinutes >= targetMinutes ? 'Meta atingida' : 'Continuar apontando'
      });
    }

    // Sort by priority
    const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    actions.sort((a, b) => (pOrder[a.priority] || 3) - (pOrder[b.priority] || 3));

    return actions;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROPOSAL → PROJECT CONVERSION
  // ═══════════════════════════════════════════════════════════════════════════

  convertProposalToProject(proposalId) {
    const proposal = TBO_STORAGE.getErpEntity('proposal', proposalId);
    if (!proposal) return { ok: false, error: 'Proposta nao encontrada' };
    if (proposal.status !== 'aprovada') return { ok: false, error: 'Apenas propostas aprovadas podem ser convertidas' };

    // Create project from proposal
    const project = TBO_STORAGE.addErpEntity('project', {
      name: proposal.name || proposal.title || 'Projeto sem nome',
      client: proposal.client || '',
      client_company: proposal.company || '',
      status: 'briefing',
      owner: proposal.owner || '',
      value: proposal.value || 0,
      services: proposal.services || [],
      proposal_id: proposalId,
      next_action: 'Alinhar briefing com cliente',
      next_action_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: `Convertido da proposta: ${proposal.name}. ${proposal.notes || ''}`,
      priority: proposal.priority || 'media'
    });

    // Update proposal status
    this.transition('proposal', proposalId, 'convertida', this._getCurrentUserId(), 'Convertida em projeto ' + project.id);

    // Update the deal in CRM if linked
    if (proposal.deal_id) {
      TBO_STORAGE.updateCrmDeal(proposal.deal_id, { stage: 'fechado_ganho' });
    }

    this.addAuditLog({
      entityType: 'proposal', entityId: proposalId,
      action: 'convert_to_project',
      userId: this._getCurrentUserId(),
      reason: `Projeto criado: ${project.id}`,
      entityName: proposal.name
    });

    return { ok: true, project };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DELIVERABLE VERSIONING (R00, R01, R02...)
  // ═══════════════════════════════════════════════════════════════════════════

  addDeliverableVersion(deliverableId, versionData) {
    const deliverable = TBO_STORAGE.getErpEntity('deliverable', deliverableId);
    if (!deliverable) return { ok: false, error: 'Entregavel nao encontrado' };

    const versions = deliverable.versions || [];
    const versionNumber = versions.length;
    const versionCode = 'R' + String(versionNumber).padStart(2, '0');

    const version = {
      code: versionCode,
      number: versionNumber,
      description: versionData.description || '',
      files: versionData.files || [],
      createdBy: versionData.createdBy || this._getCurrentUserId(),
      createdAt: new Date().toISOString(),
      feedback: null,
      approved: false
    };

    versions.push(version);
    TBO_STORAGE.updateErpEntity('deliverable', deliverableId, {
      versions,
      current_version: versionCode,
      status: 'em_revisao'
    });

    this.addAuditLog({
      entityType: 'deliverable', entityId: deliverableId,
      action: 'new_version',
      userId: version.createdBy,
      reason: `Nova versao ${versionCode}: ${version.description}`,
      entityName: deliverable.name
    });

    return { ok: true, version };
  },

  approveVersion(deliverableId, versionCode, feedback) {
    const deliverable = TBO_STORAGE.getErpEntity('deliverable', deliverableId);
    if (!deliverable) return { ok: false, error: 'Entregavel nao encontrado' };

    const versions = deliverable.versions || [];
    const version = versions.find(v => v.code === versionCode);
    if (!version) return { ok: false, error: `Versao ${versionCode} nao encontrada` };

    version.approved = true;
    version.feedback = feedback || 'Aprovado';
    version.approvedAt = new Date().toISOString();
    version.approvedBy = this._getCurrentUserId();

    TBO_STORAGE.updateErpEntity('deliverable', deliverableId, {
      versions,
      status: 'aprovado'
    });

    this.addAuditLog({
      entityType: 'deliverable', entityId: deliverableId,
      action: 'version_approved',
      userId: version.approvedBy,
      reason: `Versao ${versionCode} aprovada. ${feedback || ''}`,
      entityName: deliverable.name
    });

    return { ok: true };
  },

  requestRevision(deliverableId, versionCode, feedback) {
    const deliverable = TBO_STORAGE.getErpEntity('deliverable', deliverableId);
    if (!deliverable) return { ok: false, error: 'Entregavel nao encontrado' };

    const versions = deliverable.versions || [];
    const version = versions.find(v => v.code === versionCode);
    if (!version) return { ok: false, error: `Versao ${versionCode} nao encontrada` };

    version.feedback = feedback || 'Revisao solicitada';
    version.feedbackAt = new Date().toISOString();
    version.feedbackBy = this._getCurrentUserId();

    TBO_STORAGE.updateErpEntity('deliverable', deliverableId, {
      versions,
      status: 'em_producao'
    });

    this.addAuditLog({
      entityType: 'deliverable', entityId: deliverableId,
      action: 'revision_requested',
      userId: version.feedbackBy,
      reason: `Revisao solicitada em ${versionCode}: ${feedback}`,
      entityName: deliverable.name
    });

    return { ok: true };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEETING → DECISION → TASK PIPELINE
  // ═══════════════════════════════════════════════════════════════════════════

  createDecisionFromMeeting(meetingId, decisionData) {
    const decision = TBO_STORAGE.addErpEntity('decision', {
      meeting_id: meetingId,
      title: decisionData.title || '',
      description: decisionData.description || '',
      decided_by: decisionData.decided_by || [],
      status: 'decidida',
      tasks_created: [],
      project_id: decisionData.project_id || null,
      createdBy: this._getCurrentUserId()
    });

    this.addAuditLog({
      entityType: 'decision', entityId: decision.id,
      action: 'created',
      userId: this._getCurrentUserId(),
      reason: `Decisao de reuniao: ${decisionData.title}`,
      entityName: decisionData.title
    });

    return decision;
  },

  createTaskFromDecision(decisionId, taskData) {
    const decision = TBO_STORAGE.getErpEntity('decision', decisionId);
    if (!decision) return { ok: false, error: 'Decisao nao encontrada' };

    const task = TBO_STORAGE.addErpEntity('task', {
      title: taskData.title || '',
      description: taskData.description || '',
      owner: taskData.owner || '',
      due_date: taskData.due_date || '',
      priority: taskData.priority || 'media',
      status: 'pendente',
      project_id: taskData.project_id || decision.project_id || null,
      project_name: taskData.project_name || '',
      decision_id: decisionId,
      source: 'decision',
      createdBy: this._getCurrentUserId()
    });

    // Link task to decision
    const tasksCreated = decision.tasks_created || [];
    tasksCreated.push(task.id);
    TBO_STORAGE.updateErpEntity('decision', decisionId, { tasks_created: tasksCreated });

    this.addAuditLog({
      entityType: 'task', entityId: task.id,
      action: 'created_from_decision',
      userId: this._getCurrentUserId(),
      reason: `Tarefa criada da decisao: ${decision.title}`,
      entityName: taskData.title
    });

    return { ok: true, task };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBOOK / TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  playbooks: {
    'projeto_3d': {
      name: 'Projeto Digital 3D',
      phases: [
        { name: 'Recebimento de Arquivos', status: 'briefing', tasks: ['Receber plantas e cortes', 'Receber referencias do cliente', 'Alinhar expectativas e prazo'] },
        { name: 'Modelagem', status: 'producao', tasks: ['Modelagem 3D do empreendimento', 'Aplicacao de materiais', 'Setup de iluminacao'] },
        { name: 'Revisao Interna', status: 'revisao', tasks: ['Review interno da equipe', 'Ajustes pos-review'] },
        { name: 'Revisao Cliente', status: 'revisao', tasks: ['Envio para aprovacao do cliente', 'Implementar feedback', 'Aprovacao final'] },
        { name: 'Finalizacao', status: 'entrega', tasks: ['Render final em alta resolucao', 'Pos-producao', 'Entrega dos arquivos'] }
      ],
      deliverables: ['Imagens Externas', 'Imagens Internas', 'Implantacao']
    },
    'projeto_branding': {
      name: 'Projeto Branding',
      phases: [
        { name: 'Briefing & Imersao', status: 'briefing', tasks: ['Briefing com cliente', 'Pesquisa de mercado', 'Analise de concorrencia'] },
        { name: 'Conceito de Marca', status: 'planejamento', tasks: ['Naming (3-5 opcoes)', 'Posicionamento', 'Proposta de valor'] },
        { name: 'Estrutura Criativa', status: 'producao', tasks: ['Storytelling', 'Moodboard', 'Tom de voz'] },
        { name: 'Construcao Visual', status: 'producao', tasks: ['Logo', 'Identidade visual', 'Manual de marca'] },
        { name: 'Aprovacao & Entrega', status: 'entrega', tasks: ['Apresentacao para cliente', 'Ajustes finais', 'Entrega do manual'] }
      ],
      deliverables: ['Manual de Marca', 'Logo (formatos)', 'Guia de Aplicacao']
    },
    'projeto_marketing': {
      name: 'Projeto Marketing',
      phases: [
        { name: 'Diagnostico', status: 'briefing', tasks: ['Analise de produto', 'Publico-alvo', 'Concorrencia'] },
        { name: 'Planejamento', status: 'planejamento', tasks: ['Plano de marketing', 'Plano de midias', 'Cronograma'] },
        { name: 'Producao de Materiais', status: 'producao', tasks: ['Criativos de campanha', 'Landing page', 'Materiais impressos'] },
        { name: 'Campanha', status: 'producao', tasks: ['Setup de campanhas', 'Monitoramento', 'Otimizacao'] },
        { name: 'Analise & Report', status: 'entrega', tasks: ['Relatorio de resultados', 'Insights para sustentacao'] }
      ],
      deliverables: ['Plano de Marketing', 'Kit de Criativos', 'Relatorio']
    },
    'projeto_lancamento': {
      name: 'Lancamento Imobiliario',
      phases: [
        { name: 'Fase 0 - Pre-Planejamento', status: 'briefing', tasks: ['Alinhamento inicial', 'Definicao de escopo', 'Cronograma macro'] },
        { name: 'Fase 1 - Planejamento', status: 'planejamento', tasks: ['Diagnostico de produto', 'Estrategia', 'Metas de vendas'] },
        { name: 'Fase 2 - Pre-Campanha', status: 'producao', tasks: ['Producao de materiais', 'Setup de canais', 'Site'] },
        { name: 'Fase 3-6 - Campanha', status: 'producao', tasks: ['Brand awareness', 'Captacao de leads', 'Evento de lancamento'] },
        { name: 'Fase 7-8 - Pos-Lancamento', status: 'entrega', tasks: ['Sustentacao', 'Remarketing', 'Report final'] }
      ],
      deliverables: ['Plano de Lancamento', 'Kit de Campanha', 'Relatorio de Resultados']
    }
  },

  applyPlaybook(projectId, playbookKey) {
    const playbook = this.playbooks[playbookKey];
    if (!playbook) return { ok: false, error: 'Playbook nao encontrado' };

    const project = TBO_STORAGE.getErpEntity('project', projectId);
    if (!project) return { ok: false, error: 'Projeto nao encontrado' };

    // Create tasks from playbook phases
    let taskCount = 0;
    playbook.phases.forEach((phase, pi) => {
      (phase.tasks || []).forEach((taskName, ti) => {
        TBO_STORAGE.addErpEntity('task', {
          title: taskName,
          project_id: projectId,
          project_name: project.name,
          owner: project.owner || '',
          status: 'pendente',
          priority: pi === 0 ? 'alta' : 'media',
          phase: phase.name,
          order: pi * 100 + ti,
          source: 'playbook'
        });
        taskCount++;
      });
    });

    // Create deliverables from playbook
    let delivCount = 0;
    (playbook.deliverables || []).forEach(name => {
      TBO_STORAGE.addErpEntity('deliverable', {
        name,
        project_id: projectId,
        project_name: project.name,
        status: 'pendente',
        owner: project.owner || '',
        versions: [],
        current_version: null,
        source: 'playbook'
      });
      delivCount++;
    });

    // Update project with playbook info
    TBO_STORAGE.updateErpEntity('project', projectId, {
      playbook: playbookKey,
      playbook_name: playbook.name
    });

    this.addAuditLog({
      entityType: 'project', entityId: projectId,
      action: 'playbook_applied',
      userId: this._getCurrentUserId(),
      reason: `Playbook "${playbook.name}" aplicado: ${taskCount} tarefas, ${delivCount} entregaveis`,
      entityName: project.name
    });

    return { ok: true, taskCount, delivCount };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCIAL HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  calculateProjectMargin(projectId) {
    const project = TBO_STORAGE.getErpEntity('project', projectId);
    if (!project) return null;
    const value = project.value || 0;
    const cost = project.cost || 0;
    if (value <= 0) return { revenue: 0, cost: 0, margin: 0, marginPct: 0 };
    const margin = value - cost;
    const marginPct = value > 0 ? (margin / value * 100) : 0;
    return { revenue: value, cost, margin, marginPct: Math.round(marginPct * 10) / 10 };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER — Current user
  // ═══════════════════════════════════════════════════════════════════════════

  _getCurrentUserId() {
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      if (user) return user.name || user.id || 'system';
    }
    return 'system';
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION — seed ERP data from existing context if empty
  // ═══════════════════════════════════════════════════════════════════════════

  init() {
    // Ensure ERP storage is initialized
    TBO_STORAGE.initErpStorage();

    // Check if already seeded
    const meta = TBO_STORAGE.getErpMeta();
    if (meta._erpSeeded) return;

    const context = TBO_STORAGE.get('context');
    const ativos = context.projetos_ativos || [];
    let seeded = 0;

    // Seed projects from active projects
    ativos.forEach(p => {
      if (!p.nome || p.construtora === 'TBO') return;

      const existing = TBO_STORAGE.getAllErpEntities('project')
        .find(ep => ep.source_name === p.nome);
      if (existing) return;

      TBO_STORAGE.addErpEntity('project', {
        name: p.nome.replace(/_/g, ' '),
        client: p.construtora,
        client_company: p.construtora,
        services: p.bus || [],
        status: 'producao',
        owner: '',
        value: 0,
        next_action: null,
        next_action_date: null,
        source: 'auto_seed',
        source_name: p.nome,
        priority: 'media'
      });
      seeded++;
    });

    if (seeded > 0) {
      TBO_STORAGE.setErpMeta({ _erpSeeded: true, _seedDate: new Date().toISOString(), _seedCount: seeded });
      this.addAuditLog({
        entityType: 'system', entityId: 'init',
        action: 'erp_seed',
        userId: 'system',
        reason: `${seeded} projetos importados do contexto`,
        entityName: 'TBO ERP Init'
      });
    } else {
      TBO_STORAGE.setErpMeta({ _erpSeeded: true, _seedDate: new Date().toISOString(), _seedCount: 0 });
    }
  }
};
