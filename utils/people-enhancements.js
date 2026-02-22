// ============================================================================
// TBO OS — People & Culture Enhancements Module
// 1:1 Meeting Assistant, Kudos Wall, Burnout Risk, Skill Gap Heatmap,
// Salary Benchmarking, Onboarding Checklist Generator
// ============================================================================

const TBO_PEOPLE_ENHANCEMENTS = {

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  _genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },

  _getTeam() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) return TBO_RH._team.filter(t => !t.terceirizado);
    if (typeof TBO_PERMISSIONS !== 'undefined' && TBO_PERMISSIONS._userRoles) {
      return Object.entries(TBO_PERMISSIONS._userRoles).map(([id, r]) => ({ id, nome: id, bu: r.bu || '', cargo: r.role }));
    }
    return [];
  },

  _getPerson(id) {
    const team = this._getTeam();
    return team.find(t => t.id === id) || null;
  },

  _getPersonName(id) {
    const p = this._getPerson(id);
    return p ? p.nome : id || '\u2014';
  },

  _store(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } },
  _storeObj(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } },
  _save(key, data) { localStorage.setItem(key, JSON.stringify(data)); },

  _today() { return new Date().toISOString().split('T')[0]; },
  _daysSince(dateStr) { return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000); },

  _formatDate(d) {
    if (!d) return '\u2014';
    const dt = new Date(d);
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  _coreValues: [
    { id: 'excelencia',  nome: 'Excelencia',  emoji: '\u2B50' },
    { id: 'cliente',     nome: 'Cliente',      emoji: '\uD83E\uDD1D' },
    { id: 'colaboracao', nome: 'Colaboracao',   emoji: '\uD83E\uDEC2' },
    { id: 'inovacao',    nome: 'Inovacao',      emoji: '\uD83D\uDCA1' },
    { id: 'ownership',   nome: 'Ownership',     emoji: '\uD83C\uDFAF' },
    { id: 'superacao',   nome: 'Superacao',     emoji: '\uD83D\uDE80' }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. 1:1 MEETING ASSISTANT
  // ═══════════════════════════════════════════════════════════════════════════

  generate1on1Agenda(memberId) {
    const person = this._getPerson(memberId);
    if (!person) return { memberName: memberId, suggestedTopics: [], openTasks: [], recentFeedback: [], developmentGoals: [], lastMeetingDate: null };

    // Pull tasks
    const openTasks = this._getMemberOpenTasks(memberId);
    const overdueTasks = openTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());
    const atRiskTasks = openTasks.filter(t => {
      if (!t.due_date) return false;
      const daysLeft = (new Date(t.due_date) - Date.now()) / 86400000;
      return daysLeft > 0 && daysLeft <= 3;
    });

    // Pull PDI goals
    const pdiData = this._storeObj('tbo_pdi_data');
    const memberPdi = pdiData[memberId] || {};
    const goals = (memberPdi.goals || []).map(g => g.title || g.description || g.nome || '');

    // Pull feedback from TBO_RH
    const recentFeedback = this._getRecentFeedback(memberId);

    // Last 1:1 date
    const lastMeetingDate = this._getLastOneOnOneDate(memberId);

    // Generate suggested topics
    const suggestedTopics = [];
    if (overdueTasks.length > 0) {
      suggestedTopics.push({ topic: `${overdueTasks.length} tarefa(s) atrasada(s)`, reason: 'Tarefas passaram do prazo', priority: 'alta', source: 'tarefas' });
    }
    if (atRiskTasks.length > 0) {
      suggestedTopics.push({ topic: `${atRiskTasks.length} tarefa(s) em risco de atraso`, reason: 'Vencem nos proximos 3 dias', priority: 'media', source: 'tarefas' });
    }
    if (goals.length > 0) {
      suggestedTopics.push({ topic: 'Progresso no PDI', reason: `${goals.length} meta(s) de desenvolvimento ativas`, priority: 'media', source: 'pdi' });
    }
    if (lastMeetingDate && this._daysSince(lastMeetingDate) > 30) {
      suggestedTopics.push({ topic: 'Check-in geral de bem-estar', reason: `Ultima 1:1 ha ${this._daysSince(lastMeetingDate)} dias`, priority: 'alta', source: 'frequencia' });
    }
    if (recentFeedback.length > 0) {
      suggestedTopics.push({ topic: 'Revisar feedbacks recentes', reason: `${recentFeedback.length} feedback(s) recente(s)`, priority: 'media', source: 'feedback' });
    }
    const burnout = this.calculateBurnoutRisk(memberId);
    if (burnout.level === 'high' || burnout.level === 'critical') {
      suggestedTopics.push({ topic: 'Bem-estar e carga de trabalho', reason: `Risco de burnout: ${burnout.level}`, priority: 'alta', source: 'burnout' });
    }
    if (suggestedTopics.length === 0) {
      suggestedTopics.push({ topic: 'Alinhamento de expectativas e proximos passos', reason: 'Reuniao periodica', priority: 'baixa', source: 'rotina' });
    }

    return {
      memberName: person.nome,
      suggestedTopics,
      openTasks: openTasks.slice(0, 8).map(t => ({ title: t.title || t.name || '\u2014', dueDate: t.due_date || null, status: t.status || 'pendente' })),
      recentFeedback,
      developmentGoals: goals,
      lastMeetingDate
    };
  },

  _getMemberOpenTasks(memberId) {
    try {
      if (typeof TBO_STORAGE !== 'undefined') {
        const tasks = TBO_STORAGE.getAllErpEntities('task') || [];
        return tasks.filter(t => t.owner === memberId && t.status !== 'concluida' && t.status !== 'cancelada');
      }
    } catch (e) { /* fallback */ }
    return [];
  },

  _getRecentFeedback(memberId) {
    try {
      if (typeof TBO_RH !== 'undefined' && TBO_RH._getStore) {
        const fbs = TBO_RH._getStore('feedbacks') || [];
        return fbs.filter(f => f.para === memberId).slice(0, 5).map(f => f.mensagem || '');
      }
    } catch (e) { /* fallback */ }
    return [];
  },

  _getLastOneOnOneDate(memberId) {
    try {
      if (typeof TBO_RH !== 'undefined' && TBO_RH._getStore) {
        const ones = TBO_RH._getStore('1on1s') || [];
        const memberOnes = ones.filter(o => o.colaborador === memberId && o.status === 'concluida');
        if (memberOnes.length > 0) {
          memberOnes.sort((a, b) => new Date(b.data) - new Date(a.data));
          return memberOnes[0].data;
        }
      }
    } catch (e) { /* fallback */ }
    return null;
  },

  render1on1Card(memberId) {
    const agenda = this.generate1on1Agenda(memberId);
    const priorityColors = { alta: '#ef4444', media: '#f59e0b', baixa: '#22c55e' };
    const topicsHtml = agenda.suggestedTopics.map(t => `
      <div class="oneon1-topic">
        <span class="oneon1-priority" style="background:${priorityColors[t.priority] || '#888'}">${t.priority.toUpperCase()}</span>
        <div><strong>${t.topic}</strong><br><small style="color:#999">${t.reason}</small></div>
      </div>
    `).join('');

    const tasksHtml = agenda.openTasks.length > 0 ? agenda.openTasks.map(t => {
      const overdue = t.dueDate && new Date(t.dueDate) < new Date();
      return `<div class="oneon1-task ${overdue ? 'oneon1-task--overdue' : ''}">${t.title} <small>${this._formatDate(t.dueDate)}</small></div>`;
    }).join('') : '<p style="color:#888;font-size:13px;">Nenhuma tarefa aberta</p>';

    const goalsHtml = agenda.developmentGoals.length > 0
      ? agenda.developmentGoals.map(g => `<div class="oneon1-goal">\uD83C\uDFAF ${g}</div>`).join('')
      : '<p style="color:#888;font-size:13px;">Nenhuma meta de PDI</p>';

    return `
      <div class="oneon1-card">
        <div class="oneon1-header">
          <h3>1:1 com ${agenda.memberName}</h3>
          <small>Ultima reuniao: ${agenda.lastMeetingDate ? this._formatDate(agenda.lastMeetingDate) : 'N/A'}</small>
        </div>
        <div class="oneon1-section">
          <h4>Topicos Sugeridos</h4>
          ${topicsHtml}
        </div>
        <div class="oneon1-section">
          <h4>Tarefas Abertas (${agenda.openTasks.length})</h4>
          ${tasksHtml}
        </div>
        <div class="oneon1-section">
          <h4>Metas de Desenvolvimento</h4>
          ${goalsHtml}
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PEER RECOGNITION WALL (KUDOS)
  // ═══════════════════════════════════════════════════════════════════════════

  giveKudos(fromId, toId, message, valueId) {
    if (!fromId || !toId || !message) return null;
    if (fromId === toId) return null;
    const kudos = {
      id: this._genId(),
      from: fromId,
      to: toId,
      message,
      value: valueId || 'colaboracao',
      date: new Date().toISOString(),
      reactions: {}
    };
    const feed = this._store('tbo_kudos');
    feed.unshift(kudos);
    this._save('tbo_kudos', feed);
    return kudos;
  },

  getKudosFeed(limit = 20) {
    const feed = this._store('tbo_kudos');
    return feed.slice(0, limit).map(k => ({
      ...k,
      from: this._getPersonName(k.from),
      to: this._getPersonName(k.to),
      valueName: (this._coreValues.find(v => v.id === k.value) || {}).nome || k.value,
      valueEmoji: (this._coreValues.find(v => v.id === k.value) || {}).emoji || ''
    }));
  },

  reactToKudos(kudosId, emoji) {
    const feed = this._store('tbo_kudos');
    const kudos = feed.find(k => k.id === kudosId);
    if (!kudos) return null;
    kudos.reactions[emoji] = (kudos.reactions[emoji] || 0) + 1;
    this._save('tbo_kudos', feed);
    return kudos;
  },

  getLeaderboard() {
    const feed = this._store('tbo_kudos');
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const weekFeed = feed.filter(k => new Date(k.date) >= weekAgo);
    const stats = {};
    weekFeed.forEach(k => {
      if (!stats[k.to]) stats[k.to] = { received: 0, given: 0, values: {} };
      if (!stats[k.from]) stats[k.from] = { received: 0, given: 0, values: {} };
      stats[k.to].received++;
      stats[k.from].given++;
      stats[k.to].values[k.value] = (stats[k.to].values[k.value] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([id, s]) => {
        const topValue = Object.entries(s.values).sort((a, b) => b[1] - a[1])[0];
        return { person: this._getPersonName(id), personId: id, kudosReceived: s.received, kudosGiven: s.given, topValue: topValue ? topValue[0] : null };
      })
      .sort((a, b) => b.kudosReceived - a.kudosReceived);
  },

  _ensureKudosSeed() {
    const existing = this._store('tbo_kudos');
    if (existing.length > 0) return;
    const seed = [
      { id: this._genId(), from: 'marco', to: 'dann', value: 'excelencia', message: 'Qualidade de render referencia no mercado. Parabens!', date: '2026-02-15T10:00:00Z', reactions: { '\uD83D\uDD25': 3, '\uD83D\uDC4F': 5 } },
      { id: this._genId(), from: 'nath', to: 'carol', value: 'colaboracao', message: 'Sempre disponivel para ajudar o time. Obrigada!', date: '2026-02-14T09:00:00Z', reactions: { '\u2764\uFE0F': 4 } },
      { id: this._genId(), from: 'rafa', to: 'nelson', value: 'inovacao', message: 'Conceito de branding surpreendeu o cliente. Criatividade no maximo!', date: '2026-02-13T14:00:00Z', reactions: { '\uD83D\uDE80': 2 } },
      { id: this._genId(), from: 'dann', to: 'tiago', value: 'superacao', message: 'Evolucao tecnica impressionante no ultimo mes. Continue assim!', date: '2026-02-12T11:00:00Z', reactions: { '\uD83D\uDCAA': 3 } },
      { id: this._genId(), from: 'marco', to: 'rafa', value: 'ownership', message: 'Campanha com ROAS historico. Tomou ownership total do resultado.', date: '2026-02-11T16:00:00Z', reactions: { '\uD83C\uDFAF': 2 } },
      { id: this._genId(), from: 'nelson', to: 'erick', value: 'inovacao', message: 'Proposta criativa surpreendente. Pensamento fora da caixa!', date: '2026-02-10T09:30:00Z', reactions: { '\uD83D\uDCA1': 3 } },
      { id: this._genId(), from: 'nath', to: 'duda', value: 'superacao', message: 'De zero a render em 3 meses. Dedicacao exemplar!', date: '2026-02-09T10:00:00Z', reactions: { '\uD83D\uDE80': 4, '\uD83D\uDC4F': 2 } },
      { id: this._genId(), from: 'marco', to: 'nath', value: 'ownership', message: 'Lideranca da BU Digital 3D com maestria. Time organizado e entregando.', date: '2026-02-08T08:00:00Z', reactions: { '\u2B50': 5 } }
    ];
    this._save('tbo_kudos', seed);
  },

  renderKudosWall() {
    this._ensureKudosSeed();
    const feed = this.getKudosFeed(20);
    const leaderboard = this.getLeaderboard();
    const team = this._getTeam().filter(t => !t.terceirizado);
    const valuesOptions = this._coreValues.map(v => `<option value="${v.id}">${v.emoji} ${v.nome}</option>`).join('');
    const teamOptions = team.map(t => `<option value="${t.id}">${t.nome}</option>`).join('');

    const feedHtml = feed.map((k, i) => {
      const reactionsHtml = Object.entries(k.reactions || {}).map(([emoji, count]) =>
        `<span class="kudos-reaction">${emoji} ${count}</span>`
      ).join('');
      return `
        <div class="kudos-card" style="animation-delay:${i * 60}ms">
          <div class="kudos-card-header">
            <span class="kudos-value-badge" title="${k.valueName}">${k.valueEmoji}</span>
            <div class="kudos-card-meta">
              <strong>${k.from}</strong> reconheceu <strong>${k.to}</strong>
              <small>${this._formatDate(k.date)}</small>
            </div>
          </div>
          <p class="kudos-message">${k.message}</p>
          <div class="kudos-reactions">${reactionsHtml}</div>
        </div>
      `;
    }).join('');

    const leaderboardHtml = leaderboard.slice(0, 5).map((l, i) => {
      const medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
      const medal = i < 3 ? medals[i] : `${i + 1}.`;
      const val = this._coreValues.find(v => v.id === l.topValue);
      return `
        <div class="kudos-leaderboard-row">
          <span class="kudos-rank">${medal}</span>
          <span class="kudos-lb-name">${l.person}</span>
          <span class="kudos-lb-count">${l.kudosReceived} recebidos</span>
          ${val ? `<span class="kudos-value-badge" title="${val.nome}">${val.emoji}</span>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="kudos-wall">
        <div class="kudos-form">
          <h4>Dar Reconhecimento</h4>
          <div class="kudos-form-row">
            <select id="kudosTo">${teamOptions}</select>
            <select id="kudosValue">${valuesOptions}</select>
          </div>
          <textarea id="kudosMsg" placeholder="Escreva sua mensagem de reconhecimento..." rows="2"></textarea>
          <button class="btn btn-primary" id="kudosSendBtn">Enviar Kudos</button>
        </div>
        <div class="kudos-layout">
          <div class="kudos-timeline">
            <h4>Timeline de Reconhecimentos</h4>
            ${feedHtml || '<p style="color:#888;">Nenhum reconhecimento ainda.</p>'}
          </div>
          <div class="kudos-sidebar">
            <h4>Leaderboard Semanal</h4>
            ${leaderboardHtml || '<p style="color:#888;">Sem dados nesta semana.</p>'}
          </div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. BURNOUT RISK INDICATOR
  // ═══════════════════════════════════════════════════════════════════════════

  calculateBurnoutRisk(memberId) {
    const signals = [];
    let totalScore = 0;

    // Signal 1: Task overload (>10 active tasks)
    const openTasks = this._getMemberOpenTasks(memberId);
    if (openTasks.length > 10) {
      const weight = Math.min(20, (openTasks.length - 10) * 4);
      signals.push({ signal: 'Sobrecarga de tarefas', weight, detail: `${openTasks.length} tarefas ativas` });
      totalScore += weight;
    } else if (openTasks.length > 7) {
      const weight = Math.min(10, (openTasks.length - 7) * 3);
      signals.push({ signal: 'Carga elevada de tarefas', weight, detail: `${openTasks.length} tarefas ativas` });
      totalScore += weight;
    }

    // Signal 2: Overdue accumulation (>3 overdue)
    const overdue = openTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());
    if (overdue.length > 3) {
      const weight = Math.min(20, overdue.length * 4);
      signals.push({ signal: 'Acumulo de atrasos', weight, detail: `${overdue.length} tarefas atrasadas` });
      totalScore += weight;
    } else if (overdue.length > 0) {
      const weight = overdue.length * 3;
      signals.push({ signal: 'Tarefas atrasadas', weight, detail: `${overdue.length} tarefa(s) atrasada(s)` });
      totalScore += weight;
    }

    // Signal 3: Overtime (>44h/week from TBO_WORKLOAD)
    try {
      if (typeof TBO_WORKLOAD !== 'undefined') {
        const weekStart = TBO_WORKLOAD.getWeekStart();
        const entries = (typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.getAllErpEntities('time_entry') : [])
          .filter(e => e.user_id === memberId && e.date >= weekStart);
        const weekMinutes = entries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
        const weekHours = weekMinutes / 60;
        if (weekHours > 44) {
          const weight = Math.min(20, Math.round((weekHours - 44) * 3));
          signals.push({ signal: 'Horas extras', weight, detail: `${weekHours.toFixed(1)}h nesta semana` });
          totalScore += weight;
        }
      }
    } catch (e) { /* TBO_WORKLOAD unavailable */ }

    // Signal 4: No breaks (no time off in 60+ days) - simulated check
    const absences = this._store('tbo_absences');
    const memberAbsences = absences.filter(a => a.personId === memberId);
    if (memberAbsences.length > 0) {
      const lastAbsence = memberAbsences.sort((a, b) => new Date(b.end || b.date) - new Date(a.end || a.date))[0];
      const daysSinceBreak = this._daysSince(lastAbsence.end || lastAbsence.date);
      if (daysSinceBreak > 60) {
        const weight = Math.min(15, Math.round((daysSinceBreak - 60) / 10) * 3);
        signals.push({ signal: 'Sem folga recente', weight, detail: `${daysSinceBreak} dias sem descanso` });
        totalScore += weight;
      }
    } else {
      signals.push({ signal: 'Sem registro de folgas', weight: 8, detail: 'Nenhuma folga registrada no sistema' });
      totalScore += 8;
    }

    // Signal 5: Revision cycles (too many revisions - frustration)
    try {
      if (typeof TBO_STORAGE !== 'undefined') {
        const deliverables = TBO_STORAGE.getAllErpEntities('deliverable') || [];
        const memberDeliverables = deliverables.filter(d => d.owner === memberId);
        const highRevision = memberDeliverables.filter(d => (d.current_version || 1) > 3);
        if (highRevision.length >= 2) {
          const weight = Math.min(15, highRevision.length * 5);
          signals.push({ signal: 'Muitas revisoes', weight, detail: `${highRevision.length} entregas com 3+ revisoes` });
          totalScore += weight;
        }
      }
    } catch (e) { /* fallback */ }

    // Signal 6: Missing deadlines trend
    if (overdue.length > 0) {
      const recentOverdue = overdue.filter(t => t.due_date && this._daysSince(t.due_date) <= 14);
      if (recentOverdue.length >= 3) {
        const weight = Math.min(15, recentOverdue.length * 4);
        signals.push({ signal: 'Tendencia de atrasos', weight, detail: `${recentOverdue.length} prazos perdidos em 2 semanas` });
        totalScore += weight;
      }
    }

    totalScore = Math.min(100, totalScore);
    const cr = TBO_CONFIG.business.scoring.churnRisk;
    let level = 'low';
    if (totalScore >= cr.critical) level = 'critical';
    else if (totalScore >= cr.high) level = 'high';
    else if (totalScore >= cr.moderate) level = 'moderate';

    const recommendations = {
      low: 'Situacao saudavel. Manter acompanhamento regular.',
      moderate: 'Atencao: verificar distribuicao de carga e conversar na proxima 1:1.',
      high: 'Alerta: redistribuir tarefas e agendar conversa sobre bem-estar.',
      critical: 'Urgente: intervencao imediata. Reavaliar prioridades e oferecer suporte.'
    };

    // Trend: compare with previous signals count (simple heuristic)
    const trend = totalScore <= 15 ? 'improving' : totalScore >= 50 ? 'worsening' : 'stable';

    return { score: totalScore, level, signals, recommendation: recommendations[level], trend };
  },

  getTeamBurnoutOverview() {
    const team = this._getTeam();
    return team.map(m => {
      const risk = this.calculateBurnoutRisk(m.id);
      const topSignal = risk.signals.length > 0 ? risk.signals.sort((a, b) => b.weight - a.weight)[0].signal : 'Nenhum';
      return { member: m.nome, memberId: m.id, risk: risk.level, score: risk.score, topSignal };
    }).sort((a, b) => b.score - a.score);
  },

  renderBurnoutDashboard() {
    const overview = this.getTeamBurnoutOverview();
    const team = this._getTeam();
    const signalNames = ['Sobrecarga de tarefas', 'Acumulo de atrasos', 'Horas extras', 'Sem folga recente', 'Muitas revisoes', 'Tendencia de atrasos'];
    const levelColors = { low: '#22c55e', moderate: '#f59e0b', high: '#f97316', critical: '#ef4444' };
    const levelLabels = { low: 'Baixo', moderate: 'Moderado', high: 'Alto', critical: 'Critico' };

    const headerCells = signalNames.map(s => `<th class="burnout-signal-header">${s}</th>`).join('');

    const rows = overview.map(o => {
      const risk = this.calculateBurnoutRisk(o.memberId);
      const signalMap = {};
      risk.signals.forEach(s => { signalMap[s.signal] = s.weight; });
      // Map abbreviated signal names
      const cellMap = {
        'Sobrecarga de tarefas': signalMap['Sobrecarga de tarefas'] || signalMap['Carga elevada de tarefas'] || 0,
        'Acumulo de atrasos': signalMap['Acumulo de atrasos'] || signalMap['Tarefas atrasadas'] || 0,
        'Horas extras': signalMap['Horas extras'] || 0,
        'Sem folga recente': signalMap['Sem folga recente'] || signalMap['Sem registro de folgas'] || 0,
        'Muitas revisoes': signalMap['Muitas revisoes'] || 0,
        'Tendencia de atrasos': signalMap['Tendencia de atrasos'] || 0
      };
      const cells = signalNames.map(s => {
        const w = cellMap[s] || 0;
        const cls = w === 0 ? 'low' : w <= 8 ? 'moderate' : w <= 14 ? 'high' : 'critical';
        return `<td class="burnout-cell burnout-cell--${cls}" title="${w} pontos">${w > 0 ? w : ''}</td>`;
      }).join('');

      return `
        <tr>
          <td class="burnout-member">${o.member}</td>
          <td><span class="burnout-level-badge" style="background:${levelColors[o.risk]}">${levelLabels[o.risk]} (${o.score})</span></td>
          ${cells}
        </tr>
      `;
    }).join('');

    return `
      <div class="burnout-dashboard">
        <h4>Mapa de Risco de Burnout da Equipe</h4>
        <div class="burnout-heatmap-wrapper">
          <table class="burnout-heatmap">
            <thead><tr><th>Membro</th><th>Risco</th>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="burnout-legend">
          <span><span class="burnout-dot" style="background:#22c55e"></span> Baixo (0-24)</span>
          <span><span class="burnout-dot" style="background:#f59e0b"></span> Moderado (25-44)</span>
          <span><span class="burnout-dot" style="background:#f97316"></span> Alto (45-69)</span>
          <span><span class="burnout-dot" style="background:#ef4444"></span> Critico (70-100)</span>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. SKILL GAP HEATMAP
  // ═══════════════════════════════════════════════════════════════════════════

  _requiredLevels: {
    'Branding':    { 'Identidade Visual': 4, 'Tipografia': 3, 'Naming': 3, 'Brand Strategy': 3, 'Packaging': 2, 'Motion Graphics': 2 },
    'Digital 3D':  { '3ds Max': 4, 'V-Ray': 4, 'SketchUp': 3, 'Lumion': 3, 'Photoshop': 3, 'InDesign': 2, 'After Effects': 2 },
    'Marketing':   { 'Copywriting': 3, 'SEO': 3, 'Analytics': 3, 'Social Media': 4, 'Email Marketing': 2, 'Paid Ads': 3 },
    'Vendas':      { 'Negociacao': 4, 'CRM': 3, 'Proposta Comercial': 4, 'Follow-up': 3, 'Networking': 3 }
  },

  generateSkillGapHeatmap() {
    const buCompetencies = (typeof TBO_TRILHA_APRENDIZAGEM !== 'undefined') ? TBO_TRILHA_APRENDIZAGEM._buCompetencies : {
      'Branding': ['Identidade Visual', 'Tipografia', 'Naming', 'Brand Strategy', 'Packaging', 'Motion Graphics'],
      'Digital 3D': ['3ds Max', 'V-Ray', 'SketchUp', 'Lumion', 'Photoshop', 'InDesign', 'After Effects'],
      'Marketing': ['Copywriting', 'SEO', 'Analytics', 'Social Media', 'Email Marketing', 'Paid Ads'],
      'Vendas': ['Negociacao', 'CRM', 'Proposta Comercial', 'Follow-up', 'Networking']
    };

    const pdiData = this._storeObj('tbo_pdi_data');
    const team = this._getTeam();
    const matrix = [];
    const criticalGaps = [];
    const hiringNeeds = [];

    Object.entries(buCompetencies).forEach(([bu, skills]) => {
      const buMembers = team.filter(t => t.bu === bu);
      const required = this._requiredLevels[bu] || {};
      const skillAnalysis = skills.map(skill => {
        // Calculate average from PDI data or generate realistic estimates
        let levels = buMembers.map(m => {
          const mPdi = pdiData[m.id];
          if (mPdi && mPdi.competencies && mPdi.competencies[skill] !== undefined) {
            return mPdi.competencies[skill];
          }
          // Estimate based on nivel
          const levelMap = { 'Jr. II': 1.5, 'Jr. III': 2, 'Pleno I': 2.5, 'Pleno II': 3, 'Pleno III': 3.5, 'Senior I': 4, 'Senior II': 4.5, 'Senior III': 5 };
          return levelMap[m.nivel] || 2;
        });
        const teamAvg = levels.length > 0 ? +(levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1) : 0;
        const requiredLevel = required[skill] || 3;
        const gap = +(requiredLevel - teamAvg).toFixed(1);
        const urgency = gap >= 2 ? 'critico' : gap >= 1 ? 'atencao' : gap > 0 ? 'aceitavel' : 'ok';

        if (gap >= 2) {
          criticalGaps.push({ bu, skill, currentLevel: teamAvg, requiredLevel });
        }

        return { name: skill, teamAvg, required: requiredLevel, gap: Math.max(0, gap), urgency };
      });

      // Hiring needs: if BU has <3 members and critical gaps
      if (buMembers.length < 3 && skillAnalysis.some(s => s.urgency === 'critico')) {
        hiringNeeds.push(`${bu}: contratar profissional com foco em ${skillAnalysis.filter(s => s.urgency === 'critico').map(s => s.name).join(', ')}`);
      }

      matrix.push({ bu, members: buMembers.length, skills: skillAnalysis });
    });

    return { matrix, criticalGaps, hiringNeeds };
  },

  renderSkillHeatmap() {
    const data = this.generateSkillGapHeatmap();
    const urgencyColors = { ok: '#22c55e', aceitavel: '#86efac', atencao: '#fbbf24', critico: '#ef4444' };
    const urgencyLabels = { ok: 'OK', aceitavel: 'Aceitavel', atencao: 'Atencao', critico: 'Critico' };

    const tablesHtml = data.matrix.map(buData => {
      const rows = buData.skills.map(s => `
        <tr>
          <td class="skill-name">${s.name}</td>
          <td class="skill-cell" style="background:${urgencyColors[s.urgency]}20;color:${urgencyColors[s.urgency]}">${s.teamAvg}</td>
          <td>${s.required}</td>
          <td class="skill-cell" style="background:${urgencyColors[s.urgency]}30;font-weight:600;color:${urgencyColors[s.urgency]}">${s.gap > 0 ? '-' + s.gap : 'OK'}</td>
          <td><span class="skill-urgency-badge" style="background:${urgencyColors[s.urgency]}">${urgencyLabels[s.urgency]}</span></td>
        </tr>
      `).join('');

      return `
        <div class="skill-bu-section">
          <h4>${buData.bu} <small>(${buData.members} membros)</small></h4>
          <table class="skill-heatmap">
            <thead><tr><th>Competencia</th><th>Media Equipe</th><th>Requerido</th><th>Gap</th><th>Urgencia</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }).join('');

    const criticalHtml = data.criticalGaps.length > 0
      ? `<div class="skill-critical-section"><h4>Gaps Criticos</h4>${data.criticalGaps.map(g =>
          `<div class="skill-critical-item">${g.bu}: <strong>${g.skill}</strong> (atual: ${g.currentLevel} / requerido: ${g.requiredLevel})</div>`
        ).join('')}</div>`
      : '';

    const hiringHtml = data.hiringNeeds.length > 0
      ? `<div class="skill-hiring-section"><h4>Necessidades de Contratacao</h4>${data.hiringNeeds.map(n =>
          `<div class="skill-hiring-item">\uD83D\uDCCB ${n}</div>`
        ).join('')}</div>`
      : '';

    return `
      <div class="skill-gap-module">
        <h3>Heatmap de Gaps de Competencias por BU</h3>
        ${tablesHtml}
        ${criticalHtml}
        ${hiringHtml}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. SALARY BENCHMARKING (SIMULATED)
  // ═══════════════════════════════════════════════════════════════════════════

  _marketRanges: {
    '3D Artist Jr':         { min: 2500, max: 3500, label: 'Artista 3D Jr' },
    '3D Artist Pleno':      { min: 4000, max: 6000, label: 'Artista 3D Pleno' },
    '3D Artist Senior':     { min: 6500, max: 9000, label: 'Artista 3D Senior' },
    'Branding Designer Jr': { min: 2200, max: 3000, label: 'Designer Branding Jr' },
    'Branding Designer Pleno': { min: 3500, max: 5000, label: 'Designer Branding Pleno' },
    'Marketing Analyst':    { min: 3000, max: 4500, label: 'Analista de Marketing' },
    'Project Owner':        { min: 5000, max: 8000, label: 'Project Owner' },
    'Sales Executive':      { min: 4000, max: 6000, label: 'Executivo Comercial' },
    'Lider Tecnico 3D':     { min: 7000, max: 10000, label: 'Lider Tecnico 3D' },
    'Coord. Atendimento':   { min: 5000, max: 7500, label: 'Coord. Atendimento' }
  },

  _mapRoleToMarket(person) {
    if (!person) return null;
    const cargo = (person.cargo || '').toLowerCase();
    const nivel = (person.nivel || '').toLowerCase();
    const bu = person.bu || '';

    if (cargo.includes('artista 3d') || (cargo.includes('designer') && bu === 'Digital 3D')) {
      if (nivel.includes('jr')) return '3D Artist Jr';
      if (nivel.includes('pleno')) return '3D Artist Pleno';
      return '3D Artist Senior';
    }
    if (cargo.includes('designer') && bu === 'Branding') {
      if (nivel.includes('jr')) return 'Branding Designer Jr';
      return 'Branding Designer Pleno';
    }
    if (cargo.includes('analista') && bu === 'Marketing') return 'Marketing Analyst';
    if (cargo.includes('po') || cargo.includes('project owner')) return 'Project Owner';
    if (cargo.includes('comercial') || bu === 'Vendas') return 'Sales Executive';
    if (cargo.includes('lider tecnico')) return 'Lider Tecnico 3D';
    if (cargo.includes('coord')) return 'Coord. Atendimento';
    return null;
  },

  getBenchmarks() {
    const team = this._getTeam();
    const results = [];

    // Try to get salary data from TBO_WORKLOAD
    let salaryData = [];
    try {
      if (typeof TBO_WORKLOAD !== 'undefined' && TBO_WORKLOAD._getSalaryData) {
        salaryData = TBO_WORKLOAD._getSalaryData();
      }
    } catch (e) { /* fallback */ }

    team.forEach(person => {
      if (person.id === 'marco' || person.id === 'ruy') return; // Skip founders
      const marketKey = this._mapRoleToMarket(person);
      if (!marketKey || !this._marketRanges[marketKey]) return;

      const market = this._marketRanges[marketKey];
      // Estimate current salary from salary data or level-based estimation
      const salEntry = salaryData.find(s => s.nome && s.nome.toLowerCase().includes(person.nome.toLowerCase()));
      let estimatedCurrent = salEntry ? salEntry.salario : null;
      if (!estimatedCurrent) {
        const levelMap = { 'Jr. II': 0.2, 'Jr. III': 0.35, 'Pleno I': 0.45, 'Pleno II': 0.55, 'Pleno III': 0.65, 'Senior I': 0.75, 'Senior II': 0.85, 'Senior III': 0.95 };
        const pct = levelMap[person.nivel] || 0.5;
        estimatedCurrent = Math.round(market.min + (market.max - market.min) * pct);
      }

      const marketMid = Math.round((market.min + market.max) / 2);
      const gapPct = +((estimatedCurrent - marketMid) / marketMid * 100).toFixed(1);
      let recommendation = 'Dentro da faixa de mercado';
      if (gapPct < -15) recommendation = 'Abaixo do mercado \u2014 avaliar reajuste';
      else if (gapPct < -5) recommendation = 'Levemente abaixo \u2014 monitorar';
      else if (gapPct > 15) recommendation = 'Acima do mercado \u2014 justificar por performance';
      else if (gapPct > 5) recommendation = 'Levemente acima \u2014 ok se alta performance';

      results.push({
        role: person.cargo,
        name: person.nome,
        bu: person.bu,
        nivel: person.nivel,
        currentEstimate: estimatedCurrent,
        marketRange: `R$ ${market.min.toLocaleString('pt-BR')}\u2013${market.max.toLocaleString('pt-BR')}`,
        marketMin: market.min,
        marketMax: market.max,
        marketMid,
        gapPct,
        recommendation
      });
    });

    return results;
  },

  renderSalaryBenchmark() {
    const benchmarks = this.getBenchmarks();
    if (benchmarks.length === 0) return '<p style="color:#888;">Sem dados de benchmarking disponiveis.</p>';

    const rows = benchmarks.map(b => {
      const gapClass = b.gapPct < -5 ? 'benchmark-gap-negative' : b.gapPct > 5 ? 'benchmark-gap-positive' : 'benchmark-gap-neutral';
      const barWidth = Math.min(100, Math.max(0, ((b.currentEstimate - b.marketMin) / (b.marketMax - b.marketMin)) * 100));
      return `
        <tr class="benchmark-row">
          <td><strong>${b.name}</strong><br><small>${b.role} (${b.nivel})</small></td>
          <td>${b.bu || '\u2014'}</td>
          <td>R$ ${b.currentEstimate.toLocaleString('pt-BR')}</td>
          <td>${b.marketRange}</td>
          <td class="${gapClass}">${b.gapPct > 0 ? '+' : ''}${b.gapPct}%</td>
          <td>
            <div class="benchmark-bar-track">
              <div class="benchmark-bar-fill" style="width:${barWidth}%;background:${b.gapPct < -5 ? '#ef4444' : b.gapPct > 5 ? '#3b82f6' : '#22c55e'}"></div>
            </div>
          </td>
          <td><small>${b.recommendation}</small></td>
        </tr>
      `;
    }).join('');

    return `
      <div class="benchmark-module">
        <h3>Benchmarking Salarial \u2014 Curitiba 2026 (Simulado)</h3>
        <p style="color:#999;font-size:12px;margin-bottom:16px;">Dados simulados com base em pesquisas salariais do mercado de Curitiba. Valores estimados para fins de planejamento.</p>
        <div class="benchmark-table-wrapper">
          <table class="benchmark-table">
            <thead><tr><th>Colaborador</th><th>BU</th><th>Estimado Atual</th><th>Faixa Mercado</th><th>Gap %</th><th>Posicao na Faixa</th><th>Recomendacao</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. ONBOARDING CHECKLIST GENERATOR
  // ═══════════════════════════════════════════════════════════════════════════

  _defaultOnboardingSteps: [
    // Administrativo (D+0)
    { id: 'adm-01', title: 'Criar email @agenciatbo.com.br', description: 'Configurar email corporativo no Google Workspace', category: 'Administrativo', dueDay: 0 },
    { id: 'adm-02', title: 'Configurar acessos (Drive, TBO OS)', description: 'Liberar acesso ao Drive compartilhado e ao sistema TBO OS', category: 'Administrativo', dueDay: 0 },
    { id: 'adm-03', title: 'Assinar contrato', description: 'Assinar contrato de trabalho e documentos admissionais', category: 'Administrativo', dueDay: 0 },
    // Cultura (D+1)
    { id: 'cul-01', title: 'Ler manual de cultura', description: 'Ler o manual de cultura e valores da TBO', category: 'Cultura', dueDay: 1 },
    { id: 'cul-02', title: 'Reuniao com socios', description: 'Reuniao de boas-vindas com Marco e Ruy', category: 'Cultura', dueDay: 1 },
    { id: 'cul-03', title: 'Tour virtual do estudio', description: 'Conhecer o estudio e as areas de trabalho', category: 'Cultura', dueDay: 1 },
    // Tecnico (D+3)
    { id: 'tec-01', title: 'Setup de ferramentas', description: 'Instalar e configurar ferramentas especificas da BU', category: 'Tecnico', dueDay: 3 },
    { id: 'tec-02', title: 'Configurar ambiente de trabalho', description: 'Ajustar estacao de trabalho, monitores e perifericos', category: 'Tecnico', dueDay: 3 },
    // Integracao (D+5)
    { id: 'int-01', title: 'Reuniao com lider da BU', description: 'Alinhamento de expectativas e processos da BU', category: 'Integracao', dueDay: 5 },
    { id: 'int-02', title: 'Conhecer equipe', description: 'Cafe virtual ou presencial com membros da equipe', category: 'Integracao', dueDay: 5 },
    { id: 'int-03', title: 'Primeiro projeto assistido', description: 'Acompanhar um projeto em andamento como observador', category: 'Integracao', dueDay: 5 },
    // Desenvolvimento (D+15)
    { id: 'dev-01', title: 'Iniciar trilha de aprendizagem', description: 'Comecar a trilha de aprendizagem da BU', category: 'Desenvolvimento', dueDay: 15 },
    { id: 'dev-02', title: 'Definir PDI inicial', description: 'Definir metas iniciais de desenvolvimento com o lider', category: 'Desenvolvimento', dueDay: 15 },
    { id: 'dev-03', title: 'Primeira entrega solo', description: 'Realizar a primeira tarefa/entrega independente', category: 'Desenvolvimento', dueDay: 15 }
  ],

  _buToolMap: {
    'Digital 3D': '3ds Max, SketchUp, V-Ray, Lumion, Photoshop',
    'Branding': 'Illustrator, Photoshop, InDesign, Figma',
    'Marketing': 'Google Analytics, Meta Ads, Canva, RD Station',
    'Vendas': 'CRM, Google Sheets, Apresentacoes'
  },

  createOnboardingChecklist(newMemberName, role, bu) {
    const id = this._genId();
    const steps = this._defaultOnboardingSteps.map(s => {
      const step = { ...s, id: `${id}-${s.id}`, isCompleted: false };
      // Customize technical step for BU
      if (s.id === 'tec-01') {
        step.description = `Instalar e configurar: ${this._buToolMap[bu] || 'ferramentas da BU'}`;
      }
      return step;
    });

    const checklist = {
      id,
      memberName: newMemberName,
      role,
      bu: bu || '',
      steps,
      createdAt: new Date().toISOString()
    };

    const allChecklists = this._store('tbo_onboarding');
    allChecklists.push(checklist);
    this._save('tbo_onboarding', allChecklists);
    return checklist;
  },

  getOnboardingProgress(checklistId) {
    const all = this._store('tbo_onboarding');
    const checklist = all.find(c => c.id === checklistId);
    if (!checklist) return { completed: 0, total: 0, percentage: 0 };
    const completed = checklist.steps.filter(s => s.isCompleted).length;
    const total = checklist.steps.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  },

  toggleOnboardingStep(checklistId, stepId) {
    const all = this._store('tbo_onboarding');
    const checklist = all.find(c => c.id === checklistId);
    if (!checklist) return null;
    const step = checklist.steps.find(s => s.id === stepId);
    if (!step) return null;
    step.isCompleted = !step.isCompleted;
    this._save('tbo_onboarding', all);
    return checklist;
  },

  renderOnboardingChecklist(checklistId) {
    const all = this._store('tbo_onboarding');
    const checklist = all.find(c => c.id === checklistId);
    if (!checklist) return '<p style="color:#888;">Checklist nao encontrado.</p>';

    const progress = this.getOnboardingProgress(checklistId);
    const categories = ['Administrativo', 'Cultura', 'Tecnico', 'Integracao', 'Desenvolvimento'];
    const categoryIcons = { Administrativo: '\uD83D\uDCCB', Cultura: '\uD83C\uDFAD', Tecnico: '\uD83D\uDD27', Integracao: '\uD83E\uDD1D', Desenvolvimento: '\uD83D\uDE80' };
    const categoryDueDays = { Administrativo: 'D+0', Cultura: 'D+1', Tecnico: 'D+3', Integracao: 'D+5', Desenvolvimento: 'D+15' };

    let celebration = '';
    if (progress.percentage === 100) {
      celebration = '<div class="onboarding-celebration">\uD83C\uDF89 Onboarding concluido! Parabens e bem-vindo(a) a equipe TBO!</div>';
    } else if (progress.percentage >= 75) {
      celebration = '<div class="onboarding-milestone">\uD83C\uDF1F Quase la! Faltam apenas ' + (progress.total - progress.completed) + ' etapa(s)!</div>';
    } else if (progress.percentage >= 50) {
      celebration = '<div class="onboarding-milestone">\uD83D\uDCAA Metade do caminho! Continue assim!</div>';
    }

    const sectionsHtml = categories.map(cat => {
      const catSteps = checklist.steps.filter(s => s.category === cat);
      if (catSteps.length === 0) return '';
      const catCompleted = catSteps.filter(s => s.isCompleted).length;

      const stepsHtml = catSteps.map(s => `
        <div class="onboarding-step ${s.isCompleted ? 'onboarding-step--done' : ''}" data-checklist="${checklistId}" data-step="${s.id}">
          <span class="onboarding-check">${s.isCompleted ? '\u2705' : '\u2B1C'}</span>
          <div class="onboarding-step-content">
            <strong>${s.title}</strong>
            <small>${s.description}</small>
          </div>
        </div>
      `).join('');

      return `
        <div class="onboarding-category">
          <div class="onboarding-category-header">
            <span>${categoryIcons[cat] || ''} ${cat}</span>
            <span class="onboarding-category-due">${categoryDueDays[cat] || ''}</span>
            <span class="onboarding-category-progress">${catCompleted}/${catSteps.length}</span>
          </div>
          ${stepsHtml}
        </div>
      `;
    }).join('');

    return `
      <div class="onboarding-checklist">
        <div class="onboarding-header">
          <h3>Onboarding: ${checklist.memberName}</h3>
          <p>${checklist.role} | ${checklist.bu || 'Geral'} | Criado em ${this._formatDate(checklist.createdAt)}</p>
        </div>
        <div class="onboarding-progress">
          <div class="onboarding-progress-bar">
            <div class="onboarding-progress-fill" style="width:${progress.percentage}%"></div>
          </div>
          <span class="onboarding-progress-label">${progress.percentage}% concluido (${progress.completed}/${progress.total})</span>
        </div>
        ${celebration}
        ${sectionsHtml}
      </div>
    `;
  },

  renderOnboardingManager() {
    const allChecklists = this._store('tbo_onboarding');
    const team = this._getTeam();
    const buOptions = [...new Set(team.map(t => t.bu).filter(Boolean))].map(bu => `<option value="${bu}">${bu}</option>`).join('');

    const listHtml = allChecklists.length > 0
      ? allChecklists.map(c => {
          const prog = this.getOnboardingProgress(c.id);
          return `
            <div class="onboarding-list-item" data-checklist-id="${c.id}">
              <div>
                <strong>${c.memberName}</strong>
                <small>${c.role} | ${c.bu || 'Geral'}</small>
              </div>
              <div class="onboarding-mini-bar">
                <div class="onboarding-mini-fill" style="width:${prog.percentage}%"></div>
              </div>
              <span>${prog.percentage}%</span>
            </div>
          `;
        }).join('')
      : '<p style="color:#888;font-size:13px;">Nenhum onboarding ativo.</p>';

    return `
      <div class="onboarding-manager">
        <h4>Novo Onboarding</h4>
        <div class="onboarding-form">
          <input type="text" id="onbName" placeholder="Nome do novo membro" />
          <input type="text" id="onbRole" placeholder="Cargo (ex: Artista 3D)" />
          <select id="onbBu"><option value="">Selecione a BU</option>${buOptions}</select>
          <button class="btn btn-primary" id="onbCreateBtn">Criar Checklist</button>
        </div>
        <h4 style="margin-top:20px;">Onboardings Ativos</h4>
        <div class="onboarding-list">${listHtml}</div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT BINDING (call after rendering)
  // ═══════════════════════════════════════════════════════════════════════════

  initKudos() {
    const sendBtn = document.getElementById('kudosSendBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const toId = document.getElementById('kudosTo')?.value;
        const valueId = document.getElementById('kudosValue')?.value;
        const msg = document.getElementById('kudosMsg')?.value?.trim();
        if (!msg) return;
        const currentUser = (typeof TBO_AUTH !== 'undefined' && TBO_AUTH.getCurrentUser()) ? TBO_AUTH.getCurrentUser().id : 'marco';
        this.giveKudos(currentUser, toId, msg, valueId);
        // Re-render
        const wall = document.querySelector('.kudos-wall');
        if (wall) { wall.outerHTML = this.renderKudosWall(); this.initKudos(); }
      });
    }
  },

  initOnboarding() {
    const createBtn = document.getElementById('onbCreateBtn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const name = document.getElementById('onbName')?.value?.trim();
        const role = document.getElementById('onbRole')?.value?.trim();
        const bu = document.getElementById('onbBu')?.value;
        if (!name || !role) return;
        const checklist = this.createOnboardingChecklist(name, role, bu);
        // Show checklist
        const container = document.querySelector('.onboarding-manager');
        if (container) {
          container.outerHTML = this.renderOnboardingManager() + this.renderOnboardingChecklist(checklist.id);
          this.initOnboarding();
        }
      });
    }
    // Step toggling
    document.querySelectorAll('.onboarding-step').forEach(el => {
      el.addEventListener('click', () => {
        const checklistId = el.dataset.checklist;
        const stepId = el.dataset.step;
        if (checklistId && stepId) {
          this.toggleOnboardingStep(checklistId, stepId);
          const container = el.closest('.onboarding-checklist');
          if (container) { container.outerHTML = this.renderOnboardingChecklist(checklistId); this.initOnboarding(); }
        }
      });
    });
    // Checklist list click
    document.querySelectorAll('.onboarding-list-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.checklistId;
        const existing = document.querySelector('.onboarding-checklist');
        if (existing) existing.outerHTML = this.renderOnboardingChecklist(id);
        else el.closest('.onboarding-manager')?.insertAdjacentHTML('afterend', this.renderOnboardingChecklist(id));
        this.initOnboarding();
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CSS (Self-executing IIFE)
// ═══════════════════════════════════════════════════════════════════════════
(function injectPeopleEnhancementsCSS() {
  if (document.getElementById('tbo-people-enhancements-css')) return;
  const style = document.createElement('style');
  style.id = 'tbo-people-enhancements-css';
  style.textContent = `

  /* ── 1:1 Meeting Assistant ──────────────────────────────────── */
  .oneon1-card{background:var(--bg-card,#1e1e2e);border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid rgba(255,255,255,.06)}
  .oneon1-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.06)}
  .oneon1-header h3{margin:0;font-size:1.1rem;font-weight:600}
  .oneon1-header small{color:#888;font-size:.75rem}
  .oneon1-section{margin-bottom:14px}
  .oneon1-section h4{font-size:.85rem;font-weight:600;margin:0 0 8px;color:#ccc;text-transform:uppercase;letter-spacing:.03em}
  .oneon1-topic{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.03);margin-bottom:6px}
  .oneon1-priority{font-size:.6rem;font-weight:700;color:#fff;padding:2px 8px;border-radius:4px;white-space:nowrap;margin-top:2px}
  .oneon1-task{padding:6px 10px;font-size:.85rem;border-radius:6px;background:rgba(255,255,255,.03);margin-bottom:4px;display:flex;justify-content:space-between;align-items:center}
  .oneon1-task small{color:#888;font-size:.75rem}
  .oneon1-task--overdue{border-left:3px solid #ef4444}
  .oneon1-goal{padding:5px 10px;font-size:.85rem;color:#a5b4fc;margin-bottom:3px}

  /* ── Kudos Wall ─────────────────────────────────────────────── */
  .kudos-wall{display:flex;flex-direction:column;gap:16px}
  .kudos-form{background:var(--bg-card,#1e1e2e);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,.06)}
  .kudos-form h4{margin:0 0 10px;font-size:.95rem}
  .kudos-form-row{display:flex;gap:8px;margin-bottom:8px}
  .kudos-form-row select{flex:1;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:inherit;font-size:.85rem}
  .kudos-form textarea{width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:inherit;font-size:.85rem;resize:none;box-sizing:border-box}
  .kudos-form .btn{margin-top:8px}
  .kudos-layout{display:grid;grid-template-columns:1fr 280px;gap:16px}
  @media(max-width:768px){.kudos-layout{grid-template-columns:1fr}}
  .kudos-timeline h4,.kudos-sidebar h4{margin:0 0 12px;font-size:.95rem}
  .kudos-card{background:var(--bg-card,#1e1e2e);border-radius:10px;padding:14px;margin-bottom:10px;border:1px solid rgba(255,255,255,.06);animation:kudosSlideIn .4s ease both}
  @keyframes kudosSlideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .kudos-card-header{display:flex;gap:10px;align-items:center;margin-bottom:8px}
  .kudos-value-badge{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border-radius:50%;font-size:1.1rem;flex-shrink:0}
  .kudos-card-meta{font-size:.85rem;line-height:1.4}
  .kudos-card-meta small{display:block;color:#888;font-size:.7rem}
  .kudos-message{margin:0;font-size:.85rem;color:#ddd;line-height:1.5}
  .kudos-reactions{display:flex;gap:6px;margin-top:8px}
  .kudos-reaction{font-size:.75rem;background:rgba(255,255,255,.06);padding:2px 8px;border-radius:12px;cursor:pointer}
  .kudos-reaction:hover{background:rgba(255,255,255,.12)}
  .kudos-sidebar{background:var(--bg-card,#1e1e2e);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,.06);align-self:flex-start}
  .kudos-leaderboard-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.85rem}
  .kudos-rank{font-size:1.1rem;width:28px;text-align:center}
  .kudos-lb-name{flex:1;font-weight:500}
  .kudos-lb-count{color:#888;font-size:.75rem}

  /* ── Burnout Dashboard ──────────────────────────────────────── */
  .burnout-dashboard{background:var(--bg-card,#1e1e2e);border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,.06)}
  .burnout-dashboard h4{margin:0 0 16px;font-size:1rem}
  .burnout-heatmap-wrapper{overflow-x:auto;margin-bottom:12px}
  .burnout-heatmap{width:100%;border-collapse:collapse;font-size:.8rem}
  .burnout-heatmap th{text-align:left;padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.1);font-size:.7rem;text-transform:uppercase;letter-spacing:.03em;color:#888;white-space:nowrap}
  .burnout-heatmap td{padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.04)}
  .burnout-member{font-weight:500;white-space:nowrap}
  .burnout-signal-header{max-width:80px;font-size:.65rem!important}
  .burnout-cell{text-align:center;font-weight:600;font-size:.75rem;border-radius:4px;min-width:40px}
  .burnout-cell--low{background:rgba(34,197,94,.1);color:#22c55e}
  .burnout-cell--moderate{background:rgba(245,158,11,.15);color:#f59e0b}
  .burnout-cell--high{background:rgba(249,115,22,.15);color:#f97316}
  .burnout-cell--critical{background:rgba(239,68,68,.2);color:#ef4444}
  .burnout-level-badge{font-size:.7rem;font-weight:600;color:#fff;padding:3px 10px;border-radius:6px;white-space:nowrap}
  .burnout-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:.75rem;color:#888;margin-top:8px}
  .burnout-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:middle}

  /* ── Skill Gap Heatmap ──────────────────────────────────────── */
  .skill-gap-module h3{margin:0 0 20px;font-size:1.1rem}
  .skill-bu-section{background:var(--bg-card,#1e1e2e);border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid rgba(255,255,255,.06)}
  .skill-bu-section h4{margin:0 0 12px;font-size:.95rem}
  .skill-bu-section h4 small{color:#888;font-weight:400}
  .skill-heatmap{width:100%;border-collapse:collapse;font-size:.83rem}
  .skill-heatmap th{text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.1);font-size:.7rem;text-transform:uppercase;color:#888}
  .skill-heatmap td{padding:8px;border-bottom:1px solid rgba(255,255,255,.04)}
  .skill-name{font-weight:500}
  .skill-cell{text-align:center;font-weight:600;border-radius:4px}
  .skill-urgency-badge{font-size:.65rem;font-weight:700;color:#fff;padding:2px 8px;border-radius:4px}
  .skill-critical-section,.skill-hiring-section{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:10px;padding:14px;margin-top:16px}
  .skill-critical-section h4,.skill-hiring-section h4{margin:0 0 8px;font-size:.9rem;color:#fca5a5}
  .skill-critical-item,.skill-hiring-item{font-size:.83rem;padding:4px 0;color:#fca5a5}

  /* ── Salary Benchmarking ────────────────────────────────────── */
  .benchmark-module h3{margin:0 0 6px;font-size:1.1rem}
  .benchmark-table-wrapper{overflow-x:auto}
  .benchmark-table{width:100%;border-collapse:collapse;font-size:.82rem}
  .benchmark-table th{text-align:left;padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.1);font-size:.7rem;text-transform:uppercase;color:#888}
  .benchmark-table td{padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
  .benchmark-row:hover{background:rgba(255,255,255,.02)}
  .benchmark-gap-positive{color:#3b82f6;font-weight:600}
  .benchmark-gap-negative{color:#ef4444;font-weight:600}
  .benchmark-gap-neutral{color:#22c55e;font-weight:600}
  .benchmark-bar-track{width:80px;height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden}
  .benchmark-bar-fill{height:100%;border-radius:3px;transition:width .3s ease}

  /* ── Onboarding Checklist ───────────────────────────────────── */
  .onboarding-manager{background:var(--bg-card,#1e1e2e);border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,.06);margin-bottom:16px}
  .onboarding-manager h4{margin:0 0 10px;font-size:.95rem}
  .onboarding-form{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .onboarding-form input,.onboarding-form select{padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:inherit;font-size:.85rem;flex:1;min-width:140px}
  .onboarding-list{margin-top:8px}
  .onboarding-list-item{display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;cursor:pointer;transition:background .15s}
  .onboarding-list-item:hover{background:rgba(255,255,255,.04)}
  .onboarding-list-item strong{font-size:.88rem}
  .onboarding-list-item small{display:block;color:#888;font-size:.72rem}
  .onboarding-mini-bar{flex:1;height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;max-width:100px}
  .onboarding-mini-fill{height:100%;background:#22c55e;border-radius:2px;transition:width .3s}
  .onboarding-checklist{background:var(--bg-card,#1e1e2e);border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,.06);margin-bottom:16px}
  .onboarding-header h3{margin:0 0 4px;font-size:1.1rem}
  .onboarding-header p{margin:0 0 16px;color:#888;font-size:.8rem}
  .onboarding-progress{margin-bottom:14px}
  .onboarding-progress-bar{height:10px;background:rgba(255,255,255,.08);border-radius:5px;overflow:hidden;margin-bottom:6px}
  .onboarding-progress-fill{height:100%;background:linear-gradient(90deg,#22c55e,#4ade80);border-radius:5px;transition:width .4s ease}
  .onboarding-progress-label{font-size:.78rem;color:#888}
  .onboarding-celebration{text-align:center;padding:14px;background:linear-gradient(135deg,rgba(34,197,94,.1),rgba(59,130,246,.08));border:1px solid rgba(34,197,94,.2);border-radius:10px;font-size:.95rem;font-weight:600;margin-bottom:14px;animation:celebratePulse 1.5s ease infinite}
  @keyframes celebratePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.01)}}
  .onboarding-milestone{text-align:center;padding:10px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.15);border-radius:8px;font-size:.88rem;margin-bottom:12px}
  .onboarding-category{margin-bottom:12px}
  .onboarding-category-header{display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.03);border-radius:8px;font-size:.85rem;font-weight:600;margin-bottom:6px}
  .onboarding-category-due{color:#888;font-size:.7rem;font-weight:400}
  .onboarding-category-progress{margin-left:auto;color:#888;font-size:.75rem}
  .onboarding-step{display:flex;align-items:flex-start;gap:10px;padding:8px 12px;border-radius:8px;cursor:pointer;transition:background .15s}
  .onboarding-step:hover{background:rgba(255,255,255,.04)}
  .onboarding-step--done{opacity:.55}
  .onboarding-step--done .onboarding-step-content strong{text-decoration:line-through}
  .onboarding-check{font-size:1.1rem;flex-shrink:0;margin-top:1px}
  .onboarding-step-content strong{display:block;font-size:.85rem}
  .onboarding-step-content small{color:#888;font-size:.75rem}

  `;
  document.head.appendChild(style);
})();
