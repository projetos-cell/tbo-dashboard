// TBO OS — Module: Reunioes (v2 — Redesign aligned with Dashboard Command Center)
const TBO_REUNIOES = {
  _meetingsData: null,
  _loading: false,
  _activeTab: 'rn-lista',

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  render() {
    const cached = this._meetingsData;
    const meetings = cached || TBO_STORAGE.get('meetings') || {};
    const meetingsArr = cached ? cached : (meetings.meetings || meetings.reunioes_recentes || []);
    const meta = cached ? {} : (meetings.metadata || meetings._metadata || {});
    const catDist = cached ? this._buildCatDist(meetingsArr) : (meta.category_distribution || meetings.categorias || {});

    // Stats
    const participantSet = new Set();
    let totalActions = 0;
    let totalMin = 0;
    meetingsArr.forEach(r => {
      (r.participants || r.participantes || []).forEach(p => {
        const name = typeof p === 'string' ? p : (p.name || p.display_name || p.email || '');
        if (name) participantSet.add(name);
      });
      totalActions += (r.action_items || []).length;
      totalMin += r.duration_minutes || r.duracao_min || 0;
    });

    // Weekly count
    const _now = new Date();
    const _dayOfWeek = _now.getDay();
    const _mondayOffset = _dayOfWeek === 0 ? -6 : 1 - _dayOfWeek;
    const _weekStart = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() + _mondayOffset);
    const _weekEnd = new Date(_weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weeklyCount = meetingsArr.filter(r => {
      const d = r.date || r.data || '';
      if (!d) return false;
      const dt = new Date(d);
      return dt >= _weekStart && dt < _weekEnd;
    }).length;

    // Top categories (top 3)
    const catEntries = Object.entries(catDist).sort((a, b) => b[1] - a[1]);
    const avgDuration = meetingsArr.length > 0 ? Math.round(totalMin / meetingsArr.length) : 0;

    // Sync status
    const syncStatus = (typeof TBO_FIREFLIES !== 'undefined' && TBO_FIREFLIES.isEnabled())
      ? TBO_FIREFLIES.getStatus()
      : null;
    const lastSyncLabel = syncStatus && syncStatus.lastSync
      ? TBO_FORMATTER.relativeTime(syncStatus.lastSync)
      : null;

    return `
      <div class="reunioes-module" style="max-width:1200px;">

        <!-- Hero Header -->
        <div class="cc-hero" style="margin-bottom:20px;">
          <div class="cc-hero-left">
            <h1 class="cc-hero-title" style="display:flex;align-items:center;gap:8px;">
              <i data-lucide="calendar" style="width:22px;height:22px;color:var(--accent-gold);"></i>
              Reunioes
            </h1>
            <div class="cc-hero-meta">
              <span>${meetingsArr.length} reunioes registradas</span>
              <span style="color:var(--border-default);">|</span>
              <span class="cc-status-dot" style="background:#3b82f6;"></span>${weeklyCount} esta semana
              ${lastSyncLabel ? `<span style="color:var(--border-default);">|</span><span style="font-size:0.72rem;">Sync ${lastSyncLabel}</span>` : ''}
            </div>
          </div>
          <div class="cc-hero-actions">
            ${typeof TBO_FIREFLIES !== 'undefined' && TBO_FIREFLIES.isEnabled() ? `
              <button class="btn btn-sm btn-secondary" id="rnSyncFireflies" style="display:inline-flex;align-items:center;gap:5px;font-size:0.75rem;">
                <i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Sincronizar
              </button>
            ` : ''}
          </div>
        </div>

        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:20px;">
          <div class="kpi-card">
            <div class="kpi-label">Total de Reunioes</div>
            <div class="kpi-value">${meetingsArr.length}</div>
            <div class="kpi-change neutral">${Object.keys(catDist).length} categorias</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Esta Semana</div>
            <div class="kpi-value" style="color:var(--accent-gold);">${weeklyCount}</div>
            <div class="kpi-change neutral">${avgDuration} min media</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Horas em Reuniao</div>
            <div class="kpi-value">${Math.round(totalMin / 60)}h</div>
            <div class="kpi-change neutral">${Math.round(totalMin)} min totais</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Action Items</div>
            <div class="kpi-value">${totalActions}</div>
            <div class="kpi-change neutral">${participantSet.size} participantes</div>
          </div>
        </div>

        <!-- Category Distribution Bar -->
        ${catEntries.length > 0 ? `
        <div class="card" style="padding:14px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <span style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);">Categorias:</span>
            ${catEntries.slice(0, 6).map(([cat, count]) => {
              const colors = { producao: '#8b5cf6', cliente: '#3b82f6', review_projeto: '#f59e0b', daily_socios: '#22c55e', audio_whatsapp: '#06b6d4', alinhamento_interno: '#ec4899', estrategia: '#ef4444' };
              const color = colors[cat] || '#94a3b8';
              return `<span class="tag" style="background:${color}20;color:${color};border:1px solid ${color}30;font-size:0.7rem;">${cat.replace(/_/g, ' ')} (${count})</span>`;
            }).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Tabs -->
        <div class="tabs" style="margin-bottom:16px;">
          <button class="tab ${this._activeTab === 'rn-lista' ? 'active' : ''}" data-tab="rn-lista">
            <i data-lucide="list" style="width:14px;height:14px;"></i> Reunioes
          </button>
          <button class="tab ${this._activeTab === 'rn-actions' ? 'active' : ''}" data-tab="rn-actions">
            <i data-lucide="check-square" style="width:14px;height:14px;"></i> Action Items
          </button>
          <button class="tab ${this._activeTab === 'rn-busca' ? 'active' : ''}" data-tab="rn-busca">
            <i data-lucide="sparkles" style="width:14px;height:14px;"></i> Busca IA
          </button>
          <button class="tab ${this._activeTab === 'rn-decisoes' ? 'active' : ''}" data-tab="rn-decisoes">
            <i data-lucide="git-branch" style="width:14px;height:14px;"></i> Decisoes
          </button>
          <button class="tab ${this._activeTab === 'rn-analise' ? 'active' : ''}" data-tab="rn-analise">
            <i data-lucide="users" style="width:14px;height:14px;"></i> Relacionamento
          </button>
        </div>

        <!-- Tab: Meetings List -->
        <div class="tab-panel" id="tab-rn-lista" style="${this._activeTab === 'rn-lista' ? '' : 'display:none;'}">
          <!-- Filters -->
          <div class="card" style="padding:12px;margin-bottom:14px;">
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
              <div style="flex:1;min-width:200px;position:relative;">
                <i data-lucide="search" style="width:14px;height:14px;position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;"></i>
                <input type="text" class="form-input" id="rnFilter" placeholder="Filtrar reunioes..." style="padding-left:32px;font-size:0.78rem;height:34px;">
              </div>
              <select class="form-input" id="rnCatFilter" style="width:auto;min-width:160px;font-size:0.78rem;height:34px;">
                <option value="">Todas categorias</option>
                ${catEntries.map(([cat, count]) => `<option value="${cat}">${cat.replace(/_/g, ' ')} (${count})</option>`).join('')}
              </select>
              <select class="form-input" id="rnSourceFilter" style="width:auto;min-width:130px;font-size:0.78rem;height:34px;">
                <option value="">Todas fontes</option>
                <option value="fireflies">Fireflies</option>
                <option value="supabase">Supabase</option>
                <option value="google_calendar">Google Calendar</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          <!-- Meetings Grid -->
          <div id="rnMeetingList">
            ${this._renderMeetingsList(meetingsArr)}
          </div>
        </div>

        <!-- Tab: Action Items -->
        <div class="tab-panel" id="tab-rn-actions" style="${this._activeTab === 'rn-actions' ? '' : 'display:none;'}">
          <div class="card" style="padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <h3 style="font-size:0.9rem;font-weight:700;display:flex;align-items:center;gap:6px;">
                <i data-lucide="check-square" style="width:16px;height:16px;color:var(--accent-gold);"></i>
                Action Items Consolidados
              </h3>
              <button class="btn btn-sm btn-secondary" id="rnGerarActions" style="display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;">
                <i data-lucide="sparkles" style="width:12px;height:12px;"></i> Consolidar com IA
              </button>
            </div>
            <div id="rnActionsOutput">
              ${this._renderActionItems(meetingsArr)}
            </div>
          </div>
        </div>

        <!-- Tab: Smart Search -->
        <div class="tab-panel" id="tab-rn-busca" style="${this._activeTab === 'rn-busca' ? '' : 'display:none;'}">
          <div class="card" style="padding:16px;">
            <h3 style="font-size:0.9rem;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="sparkles" style="width:16px;height:16px;color:var(--accent-gold);"></i>
              Busca Inteligente
            </h3>
            <p style="color:var(--text-muted);font-size:0.75rem;margin-bottom:14px;">
              Pergunte qualquer coisa sobre suas reunioes. A IA busca nas transcricoes e resumos.
            </p>
            <div style="display:flex;gap:8px;">
              <textarea class="form-input" id="rnBusca" rows="2" placeholder="Ex: O que foi decidido sobre o praco do projeto Porto Batel?" style="flex:1;font-size:0.82rem;resize:vertical;"></textarea>
              <button class="btn btn-primary" id="rnGerarBusca" style="align-self:flex-end;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;">
                <i data-lucide="search" style="width:14px;height:14px;"></i> Buscar
              </button>
            </div>
          </div>
          <div id="rnBuscaOutput" class="ai-response" style="min-height:120px;margin-top:14px;">
            <div style="text-align:center;padding:30px;color:var(--text-muted);font-size:0.82rem;">Resultado aparecera aqui</div>
          </div>
        </div>

        <!-- Tab: Decisions -->
        <div class="tab-panel" id="tab-rn-decisoes" style="${this._activeTab === 'rn-decisoes' ? '' : 'display:none;'}">
          ${this._renderDecisionsTab(meetingsArr)}
        </div>

        <!-- Tab: Relationship Analysis -->
        <div class="tab-panel" id="tab-rn-analise" style="${this._activeTab === 'rn-analise' ? '' : 'display:none;'}">
          <div class="card" style="padding:16px;">
            <h3 style="font-size:0.9rem;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="users" style="width:16px;height:16px;color:var(--accent-gold);"></i>
              Analise de Relacionamento
            </h3>
            <p style="color:var(--text-muted);font-size:0.75rem;margin-bottom:14px;">
              Analise o historico de interacoes com um cliente ou empresa.
            </p>
            <div style="display:flex;gap:8px;">
              <input type="text" class="form-input" id="rnAnaliseCliente" placeholder="Nome do cliente ou empresa" style="flex:1;font-size:0.82rem;height:38px;">
              <button class="btn btn-primary" id="rnGerarAnalise" style="white-space:nowrap;display:inline-flex;align-items:center;gap:4px;">
                <i data-lucide="bar-chart-3" style="width:14px;height:14px;"></i> Analisar
              </button>
            </div>
          </div>
          <div id="rnAnaliseOutput" class="ai-response" style="min-height:120px;margin-top:14px;">
            <div style="text-align:center;padding:30px;color:var(--text-muted);font-size:0.82rem;">Resultado aparecera aqui</div>
          </div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEETINGS LIST RENDERER
  // ═══════════════════════════════════════════════════════════════════════════
  _renderMeetingsList(meetingsArr) {
    if (meetingsArr.length === 0) {
      return `<div style="text-align:center;padding:40px 20px;">
        <i data-lucide="calendar-x" style="width:40px;height:40px;color:var(--text-muted);margin-bottom:12px;"></i>
        <div style="font-size:0.88rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Nenhuma reuniao registrada</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">Verifique a conexao com Fireflies ou adicione reunioes manualmente.</div>
      </div>`;
    }

    // Group by date (day)
    const groups = {};
    meetingsArr.forEach(r => {
      const dateStr = r.date || r.data || '';
      const day = dateStr ? new Date(dateStr).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : 'Sem data';
      if (!groups[day]) groups[day] = [];
      groups[day].push(r);
    });

    let html = '';
    Object.entries(groups).forEach(([day, items]) => {
      html += `<div style="margin-bottom:16px;">
        <div style="font-size:0.72rem;font-weight:600;color:var(--text-muted);text-transform:capitalize;margin-bottom:8px;padding-left:2px;">${day} (${items.length})</div>`;
      items.forEach(r => {
        const title = r.title || r.titulo || '';
        const date = r.date || r.data || '';
        const category = r.category || r.categoria || '';
        const duration = r.duration_minutes || r.duracao_min || 0;
        const summary = r.summary || r.short_summary || r.resumo || '';
        const actionItems = r.action_items || [];
        const source = r._source || r.sync_source || 'manual';
        const timeStr = date ? new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        const participants = r.participants || r.participantes || [];
        const participantCount = participants.length;

        const sourceColors = { fireflies: '#a855f7', supabase: '#22c55e', google_calendar: '#4285f4', manual: '#94a3b8' };
        const sourceLabels = { fireflies: 'Fireflies', supabase: 'Supabase', google_calendar: 'G.Cal', manual: 'Manual' };
        const sColor = sourceColors[source] || '#94a3b8';
        const sLabel = sourceLabels[source] || source;

        const catColors = { producao: '#8b5cf6', cliente: '#3b82f6', review_projeto: '#f59e0b', daily_socios: '#22c55e', audio_whatsapp: '#06b6d4', alinhamento_interno: '#ec4899', estrategia: '#ef4444' };
        const catColor = catColors[category] || '#94a3b8';

        html += `
        <div class="card rn-meeting-card" style="padding:14px;margin-bottom:6px;cursor:pointer;transition:border-color 0.15s;" data-title="${title.toLowerCase()}" data-cat="${category.toLowerCase()}" data-source="${source}">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <!-- Time badge -->
            <div style="flex-shrink:0;text-align:center;min-width:48px;">
              <div style="font-size:0.82rem;font-weight:700;color:var(--text-primary);">${timeStr || '--:--'}</div>
              <div style="font-size:0.65rem;color:var(--text-muted);">${Math.round(duration)} min</div>
            </div>
            <!-- Content -->
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span style="font-weight:600;font-size:0.85rem;color:var(--text-primary);">${this._esc(title)}</span>
                <span class="tag" style="font-size:0.62rem;background:${catColor}15;color:${catColor};border:1px solid ${catColor}25;">${category.replace(/_/g, ' ')}</span>
                <span style="font-size:0.58rem;padding:1px 5px;border-radius:3px;background:${sColor}15;color:${sColor};border:1px solid ${sColor}25;">${sLabel}</span>
              </div>
              ${summary ? `<div style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px;line-height:1.4;">${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.truncate(summary, 200) : summary.slice(0, 200)}</div>` : ''}
              <div style="display:flex;align-items:center;gap:12px;margin-top:6px;font-size:0.7rem;color:var(--text-muted);">
                ${participantCount > 0 ? `<span style="display:inline-flex;align-items:center;gap:3px;"><i data-lucide="users" style="width:11px;height:11px;"></i>${participantCount} participante${participantCount > 1 ? 's' : ''}</span>` : ''}
                ${actionItems.length > 0 ? `<span style="display:inline-flex;align-items:center;gap:3px;"><i data-lucide="check-square" style="width:11px;height:11px;"></i>${actionItems.length} action item${actionItems.length > 1 ? 's' : ''}</span>` : ''}
              </div>
              ${actionItems.length > 0 ? `
                <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">
                  ${actionItems.slice(0, 3).map(ai => {
                    const task = typeof ai === 'string' ? ai : (ai.task || ai.tarefa || '');
                    const person = typeof ai === 'object' ? (ai.person || ai.responsavel || '') : '';
                    return `<span class="tag" style="font-size:0.65rem;">${person ? '<strong>' + this._esc(person) + ':</strong> ' : ''}${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.truncate(task, 40) : task.slice(0, 40)}</span>`;
                  }).join('')}
                  ${actionItems.length > 3 ? `<span class="tag" style="font-size:0.65rem;opacity:0.6;">+${actionItems.length - 3}</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        </div>`;
      });
      html += '</div>';
    });
    return html;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTION ITEMS RENDERER
  // ═══════════════════════════════════════════════════════════════════════════
  _renderActionItems(meetingsArr) {
    const allActions = [];
    meetingsArr.forEach(r => {
      const title = r.title || r.titulo || '';
      const date = r.date || r.data || '';
      const dateFormatted = date ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
      (r.action_items || []).forEach(ai => {
        const task = typeof ai === 'string' ? ai : (ai.task || ai.tarefa || '');
        const person = typeof ai === 'object' ? (ai.person || ai.responsavel || '') : '';
        allActions.push({ task, person, meeting: title, date: dateFormatted });
      });
    });

    if (allActions.length === 0) {
      return `<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.82rem;">Nenhum action item encontrado nas reunioes.</div>`;
    }

    const byPerson = {};
    allActions.forEach(a => {
      const key = a.person || 'Sem responsavel';
      if (!byPerson[key]) byPerson[key] = [];
      byPerson[key].push(a);
    });

    let html = '';
    Object.entries(byPerson).sort((a, b) => b[1].length - a[1].length).forEach(([person, items]) => {
      html += `<div style="margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:var(--accent-gold);flex-shrink:0;"></span>
          <span style="font-weight:600;font-size:0.82rem;">${this._esc(person)}</span>
          <span style="font-size:0.7rem;color:var(--text-muted);">(${items.length})</span>
        </div>`;
      items.forEach(a => {
        html += `
        <div style="display:flex;align-items:center;gap:8px;padding:5px 0 5px 14px;border-bottom:1px solid var(--border-subtle);font-size:0.78rem;">
          <i data-lucide="circle-check" style="width:13px;height:13px;color:var(--color-success);flex-shrink:0;"></i>
          <span style="flex:1;">${this._esc(a.task)}</span>
          <span style="font-size:0.68rem;color:var(--text-muted);white-space:nowrap;">${this._esc(a.meeting)} | ${a.date}</span>
        </div>`;
      });
      html += '</div>';
    });
    return html;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DECISIONS TAB
  // ═══════════════════════════════════════════════════════════════════════════
  _renderDecisionsTab(meetingsArr) {
    const decisions = TBO_STORAGE.getAllErpEntities('decision');
    const tasks = TBO_STORAGE.getAllErpEntities('task').filter(t => t.source === 'decision');
    const pendingTasks = tasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada');

    const recentActions = [];
    meetingsArr.slice(0, 10).forEach(r => {
      const title = r.title || r.titulo || '';
      const date = r.date || r.data || '';
      (r.action_items || []).forEach(ai => {
        const task = typeof ai === 'string' ? ai : (ai.task || ai.tarefa || '');
        const person = typeof ai === 'object' ? (ai.person || ai.responsavel || '') : '';
        if (task) recentActions.push({ task, person, meeting: title, date });
      });
    });

    return `
      <!-- Decision KPIs -->
      <div class="grid-3" style="margin-bottom:16px;">
        <div class="kpi-card">
          <div class="kpi-label">Decisoes Registradas</div>
          <div class="kpi-value">${decisions.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Tarefas de Decisoes</div>
          <div class="kpi-value">${tasks.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Tarefas Pendentes</div>
          <div class="kpi-value" style="color:${pendingTasks.length > 0 ? '#f59e0b' : '#22c55e'};">${pendingTasks.length}</div>
        </div>
      </div>

      <!-- Quick Create from Action Items -->
      <div class="card" style="padding:16px;margin-bottom:14px;">
        <h3 style="font-size:0.85rem;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
          <i data-lucide="zap" style="width:14px;height:14px;color:var(--accent-gold);"></i>
          Action Items Recentes (converter em tarefas)
        </h3>
        <div style="max-height:220px;overflow-y:auto;">
          ${recentActions.length === 0 ? '<div style="font-size:0.78rem;color:var(--text-muted);padding:8px;text-align:center;">Nenhum action item encontrado</div>' : ''}
          ${recentActions.slice(0, 12).map(a => `
            <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border-subtle);font-size:0.78rem;">
              <div style="flex:1;">
                <span style="font-weight:500;">${this._esc(a.task)}</span>
                <span style="color:var(--text-muted);font-size:0.68rem;"> | ${this._esc(a.person || 'Sem responsavel')} | ${this._esc(a.meeting)}</span>
              </div>
              <button class="btn btn-secondary" style="font-size:0.62rem;padding:2px 8px;flex-shrink:0;" onclick="TBO_REUNIOES._quickCreateTask(${JSON.stringify(a).replace(/"/g, '&quot;')})">
                <i data-lucide="plus" style="width:10px;height:10px;"></i> Tarefa
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Decisions List -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="font-size:0.9rem;font-weight:700;display:flex;align-items:center;gap:6px;">
          <i data-lucide="git-branch" style="width:16px;height:16px;color:var(--accent-gold);"></i>
          Decisoes Registradas
        </h3>
        <button class="btn btn-sm btn-primary" style="font-size:0.72rem;" onclick="TBO_REUNIOES._showDecisionModal(null)">
          <i data-lucide="plus" style="width:12px;height:12px;"></i> Nova Decisao
        </button>
      </div>
      <div id="rnDecisionsList">
        ${decisions.length === 0 ? `<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.82rem;">Nenhuma decisao registrada.</div>` : ''}
        ${decisions.map(d => {
          const linkedTasks = TBO_STORAGE.getAllErpEntities('task').filter(t => t.decision_id === d.id);
          const doneTasks = linkedTasks.filter(t => t.status === 'concluida').length;
          return `<div class="card" style="margin-bottom:6px;padding:14px;cursor:pointer;" onclick="TBO_REUNIOES._showDecisionModal('${d.id}')">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="flex:1;">
                <div style="font-weight:600;font-size:0.85rem;">${this._esc(d.title)}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">
                  ${d.description ? (typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.truncate(d.description, 120) : d.description.slice(0, 120)) + ' | ' : ''}${linkedTasks.length > 0 ? doneTasks + '/' + linkedTasks.length + ' tarefas' : 'Sem tarefas'}
                  | ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.relativeTime(d.createdAt) : ''}
                </div>
              </div>
              <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--text-muted);flex-shrink:0;"></i>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════════════
  async init() {
    if (!this._meetingsData) {
      await this._loadMeetings();
      if (this._meetingsData) {
        const container = document.getElementById('main-content');
        if (container) {
          container.innerHTML = this.render();
          if (window.lucide) lucide.createIcons();
        }
      }
    }
    this._initEventBindings();
  },

  _initEventBindings() {
    // Tab switching
    document.querySelectorAll('.tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
        const panel = document.getElementById(`tab-${tab.dataset.tab}`);
        if (panel) panel.style.display = 'block';
        this._activeTab = tab.dataset.tab;
        if (typeof TBO_UX !== 'undefined') {
          TBO_UX.updateBreadcrumb('reunioes', tab.textContent.trim());
          TBO_UX.setTabHash('reunioes', tab.dataset.tab);
        }
        if (window.lucide) lucide.createIcons();
      });
    });

    // Filters
    const filter = document.getElementById('rnFilter');
    if (filter) filter.addEventListener('input', () => this._applyFilters());
    const catFilter = document.getElementById('rnCatFilter');
    if (catFilter) catFilter.addEventListener('change', () => this._applyFilters());
    const sourceFilter = document.getElementById('rnSourceFilter');
    if (sourceFilter) sourceFilter.addEventListener('change', () => this._applyFilters());

    // Buttons
    this._bind('rnGerarBusca', () => this._searchMeetings());
    this._bind('rnGerarActions', () => this._consolidateActions());
    this._bind('rnGerarAnalise', () => this._analyzeRelationship());
    this._bind('rnSyncFireflies', () => this._syncFireflies());

    if (window.lucide) lucide.createIcons();
  },

  _applyFilters() {
    const q = (document.getElementById('rnFilter')?.value || '').toLowerCase();
    const cat = (document.getElementById('rnCatFilter')?.value || '').toLowerCase();
    const source = (document.getElementById('rnSourceFilter')?.value || '').toLowerCase();
    document.querySelectorAll('.rn-meeting-card').forEach(card => {
      const title = card.dataset.title || '';
      const cardCat = card.dataset.cat || '';
      const cardSource = card.dataset.source || '';
      const matchText = !q || title.includes(q) || cardCat.includes(q);
      const matchCat = !cat || cardCat === cat;
      const matchSource = !source || cardSource === source;
      card.style.display = (matchText && matchCat && matchSource) ? '' : 'none';
    });
  },

  async _syncFireflies() {
    if (typeof TBO_FIREFLIES === 'undefined' || !TBO_FIREFLIES.isEnabled()) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Fireflies nao configurado');
      return;
    }
    const btn = document.getElementById('rnSyncFireflies');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" style="width:14px;height:14px;" class="spin"></i> Sincronizando...';
      if (window.lucide) lucide.createIcons();
    }
    try {
      await TBO_FIREFLIES.sync({ triggerSource: 'manual' });
      // Reload meetings and re-render
      this._meetingsData = null;
      await this._loadMeetings();
      const container = document.getElementById('main-content');
      if (container) {
        container.innerHTML = this.render();
        this._initEventBindings();
        if (window.lucide) lucide.createIcons();
      }
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Reunioes sincronizadas!');
    } catch (e) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao sincronizar', e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Sincronizar';
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI FEATURES
  // ═══════════════════════════════════════════════════════════════════════════
  async _searchMeetings() {
    const query = document.getElementById('rnBusca')?.value || '';
    if (!query) { TBO_TOAST.warning('Escreva sua pergunta'); return; }
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }

    const out = document.getElementById('rnBuscaOutput');
    const btn = document.getElementById('rnGerarBusca');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Buscando nas reunioes...');
      TBO_UX.btnLoading(btn, true, 'Buscando...');
    } else if (out) { out.textContent = 'Buscando...'; }

    try {
      const meetingsArr = this._getMeetingsArr();
      const ctx = JSON.stringify(meetingsArr);
      const result = await TBO_API.callWithContext('reunioes', query, ctx);
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._searchMeetings());
      } else if (out) { out.textContent = 'Erro: ' + e.message; }
    } finally {
      if (typeof TBO_UX !== 'undefined') TBO_UX.btnLoading(btn, false);
    }
  },

  async _consolidateActions() {
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }
    const out = document.getElementById('rnActionsOutput');
    const btn = document.getElementById('rnGerarActions');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Consolidando action items...');
      TBO_UX.btnLoading(btn, true, 'Consolidando...');
    } else if (out) { out.textContent = 'Consolidando...'; }

    try {
      const meetingsArr = this._getMeetingsArr();
      const ctx = JSON.stringify(meetingsArr);
      const result = await TBO_API.callWithContext('reunioes',
        'Consolide TODOS os action items de todas as reunioes. Organize por projeto/cliente. Identifique itens vencidos, pendentes e concluidos. Destaque os mais urgentes.', ctx);
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._consolidateActions());
      } else if (out) { out.textContent = 'Erro: ' + e.message; }
    } finally {
      if (typeof TBO_UX !== 'undefined') TBO_UX.btnLoading(btn, false);
    }
  },

  async _analyzeRelationship() {
    const cliente = document.getElementById('rnAnaliseCliente')?.value || '';
    if (!cliente) { TBO_TOAST.warning('Informe o cliente'); return; }
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }

    const out = document.getElementById('rnAnaliseOutput');
    const btn = document.getElementById('rnGerarAnalise');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Analisando relacionamento...');
      TBO_UX.btnLoading(btn, true, 'Analisando...');
    } else if (out) { out.textContent = 'Analisando...'; }

    try {
      const ctx = TBO_STORAGE.getClientContext(cliente);
      const meetingsArr = this._getMeetingsArr();
      const meetingCtx = JSON.stringify(meetingsArr.filter(r => {
        const title = (r.title || r.titulo || '').toLowerCase();
        const summary = (r.summary || r.resumo || '').toLowerCase();
        return title.includes(cliente.toLowerCase()) || summary.includes(cliente.toLowerCase());
      }));
      const result = await TBO_API.callWithContext('reunioes',
        `Analise o relacionamento da TBO com "${cliente}". Construa uma timeline de interacoes, identifique padroes, sentimentos, oportunidades e riscos.`, ctx + '\n' + meetingCtx);
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._analyzeRelationship());
      } else if (out) { out.textContent = 'Erro: ' + e.message; }
    } finally {
      if (typeof TBO_UX !== 'undefined') TBO_UX.btnLoading(btn, false);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DECISIONS CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  _quickCreateTask(actionItem) {
    const owner = actionItem.person || '';
    const title = actionItem.task || '';
    if (!title) return;

    const projects = TBO_STORAGE.getAllErpEntities('project');
    const matchProject = projects.find(p =>
      actionItem.meeting && actionItem.meeting.toLowerCase().includes((p.client || '').toLowerCase())
    );

    TBO_STORAGE.addErpEntity('task', {
      title, owner, status: 'pendente', priority: 'media',
      project_id: matchProject ? matchProject.id : null,
      project_name: matchProject ? matchProject.name : '',
      source: 'meeting_action_item',
      meeting_title: actionItem.meeting || '',
      meeting_date: actionItem.date || ''
    });

    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog({
        entityType: 'task', entityId: 'new', action: 'created',
        userId: TBO_ERP._getCurrentUserId(),
        reason: `De action item: ${actionItem.meeting}`, entityName: title
      });
    }
    TBO_TOAST.success('Tarefa criada: ' + (typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.truncate(title, 40) : title.slice(0, 40)));
  },

  _showDecisionModal(decisionId) {
    const existing = decisionId ? TBO_STORAGE.getErpEntity('decision', decisionId) : null;
    const isNew = !existing;
    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !['finalizado','cancelado'].includes(p.status));
    const team = typeof TBO_COMERCIAL !== 'undefined' ? TBO_COMERCIAL._getTeamMembers() : ['Marco','Ruy','Nathalia','Nelson','Danniel'];

    let tasksHtml = '';
    if (existing) {
      const linkedTasks = TBO_STORAGE.getAllErpEntities('task').filter(t => t.decision_id === existing.id);
      const taskSm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
      tasksHtml = `
        <div style="border-top:1px solid var(--border-subtle);padding-top:12px;margin-top:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h4 style="font-size:0.85rem;font-weight:700;">Tarefas desta decisao (${linkedTasks.length})</h4>
            <button class="btn btn-secondary" style="font-size:0.68rem;padding:3px 8px;" onclick="TBO_REUNIOES._addTaskFromDecision('${existing.id}')">+ Tarefa</button>
          </div>
          ${linkedTasks.map(t => {
            const tc = taskSm ? taskSm.colors[t.status] || '#94a3b8' : '#94a3b8';
            return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:0.78rem;">
              <input type="checkbox" ${t.status === 'concluida' ? 'checked' : ''} onchange="TBO_REUNIOES._toggleDecisionTask('${t.id}', this.checked)">
              <span style="flex:1;">${t.title}</span>
              <span style="font-size:0.65rem;color:${tc};">${taskSm ? taskSm.labels[t.status] : t.status}</span>
              <span style="font-size:0.65rem;color:var(--text-muted);">${t.owner || ''}</span>
            </div>`;
          }).join('')}
        </div>`;
    }

    const d = existing || {};
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal modal--lg active" style="max-width:600px;">
        <div class="modal-header">
          <h3 class="modal-title">${isNew ? 'Nova Decisao' : this._esc(d.title)}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
          <div class="form-group">
            <label class="form-label">Titulo da Decisao*</label>
            <input type="text" class="form-input" id="rnDecTitle" value="${this._esc(d.title || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Descricao</label>
            <textarea class="form-input" id="rnDecDesc" rows="3">${this._esc(d.description || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Projeto Vinculado</label>
            <select class="form-input" id="rnDecProject">
              <option value="">Nenhum</option>
              ${projects.map(p => `<option value="${p.id}" ${d.project_id === p.id ? 'selected' : ''}>${this._esc(p.name)} (${this._esc(p.client)})</option>`).join('')}
            </select>
          </div>
          ${tasksHtml}
        </div>
        <div class="modal-footer" style="display:flex;justify-content:${isNew ? 'flex-end' : 'space-between'};">
          ${!isNew ? `<button class="btn btn-secondary" style="color:#ef4444;" onclick="TBO_REUNIOES._deleteDecision('${d.id}')">Excluir</button>` : ''}
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button class="btn btn-primary" onclick="TBO_REUNIOES._saveDecision('${d.id || ''}')">${isNew ? 'Criar' : 'Salvar'}</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  },

  _saveDecision(existingId) {
    const title = document.getElementById('rnDecTitle')?.value?.trim();
    if (!title) { TBO_TOAST.warning('Titulo e obrigatorio'); return; }
    const data = {
      title,
      description: document.getElementById('rnDecDesc')?.value?.trim() || '',
      project_id: document.getElementById('rnDecProject')?.value || null
    };

    if (existingId) {
      TBO_STORAGE.updateErpEntity('decision', existingId, data);
      TBO_TOAST.success('Decisao atualizada');
    } else {
      data.status = 'decidida';
      data.tasks_created = [];
      const newD = TBO_STORAGE.addErpEntity('decision', data);
      if (typeof TBO_ERP !== 'undefined') TBO_ERP.addAuditLog({
        entityType: 'decision', entityId: newD.id,
        action: 'created', userId: TBO_ERP._getCurrentUserId(), entityName: title
      });
      TBO_TOAST.success('Decisao registrada');
    }
    document.querySelector('.modal-overlay')?.remove();
  },

  _deleteDecision(id) {
    if (!confirm('Excluir esta decisao?')) return;
    TBO_STORAGE.deleteErpEntity('decision', id);
    TBO_TOAST.success('Decisao excluida');
    document.querySelector('.modal-overlay')?.remove();
  },

  _addTaskFromDecision(decisionId) {
    if (typeof TBO_ERP === 'undefined') return;
    const title = prompt('Nome da tarefa:');
    if (!title) return;
    const owner = prompt('Responsavel:', '');
    const dueDate = prompt('Prazo (YYYY-MM-DD):', '');
    const result = TBO_ERP.createTaskFromDecision(decisionId, {
      title, owner: owner || '', due_date: dueDate || null, priority: 'media'
    });
    if (result.ok) {
      TBO_TOAST.success('Tarefa criada');
      document.querySelector('.modal-overlay')?.remove();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _toggleDecisionTask(taskId, completed) {
    if (typeof TBO_ERP === 'undefined') return;
    TBO_ERP.transition('task', taskId, completed ? 'concluida' : 'pendente');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA LOADING (Supabase + Fireflies + Google Calendar)
  // ═══════════════════════════════════════════════════════════════════════════
  async _loadMeetings() {
    if (this._loading) return;
    this._loading = true;

    try {
      let baseMeetings = null;

      // Priority 1: MeetingsRepo (Supabase)
      if (typeof MeetingsRepo !== 'undefined') {
        const dbMeetings = await MeetingsRepo.list({ limit: 200 });
        if (dbMeetings && dbMeetings.length > 0) {
          baseMeetings = dbMeetings.map(m => ({ ...m, _source: m._source || m.sync_source || 'supabase' }));
        }
      }

      // Priority 2: TBO_FIREFLIES.loadFromDb()
      if (!baseMeetings && typeof TBO_FIREFLIES !== 'undefined' && TBO_FIREFLIES.isEnabled()) {
        const fMeetings = await TBO_FIREFLIES.loadFromDb();
        if (fMeetings && fMeetings.length > 0) {
          baseMeetings = fMeetings.map(m => ({ ...m, _source: m._source || 'fireflies' }));
        }
      }

      // Merge Google Calendar events
      const gcalEvents = this._getGoogleCalendarMeetings();
      if (gcalEvents.length > 0) {
        baseMeetings = (baseMeetings || []).concat(gcalEvents);
        baseMeetings.sort((a, b) => {
          const da = a.date || a.data || a.startAt || '';
          const db = b.date || b.data || b.startAt || '';
          return db.localeCompare(da);
        });
      }

      this._meetingsData = baseMeetings || null;
    } catch (e) {
      console.warn('[TBO Reunioes] _loadMeetings falhou:', e.message);
      this._meetingsData = null;
    } finally {
      this._loading = false;
    }
  },

  _getGoogleCalendarMeetings() {
    if (typeof TBO_GOOGLE_CALENDAR === 'undefined' || !TBO_GOOGLE_CALENDAR.isEnabled()) return [];
    try {
      const events = TBO_GOOGLE_CALENDAR.getEvents();
      if (!events || events.length === 0) return [];
      return events
        .filter(e => e.status !== 'cancelled')
        .map(e => ({
          title: e.title || '(sem titulo)', date: e.startAt || '', data: e.startAt || '',
          category: 'Google Calendar', categoria: 'Google Calendar',
          duration_minutes: this._calcDurationMin(e.startAt, e.endAt),
          summary: e.description || '', resumo: e.description || '',
          participants: (e.attendees || []).map(a => ({ name: a.name || a.email, email: a.email })),
          participantes: (e.attendees || []).map(a => ({ name: a.name || a.email, email: a.email })),
          action_items: [], _source: 'google_calendar',
          _googleEventId: e.googleEventId || '', _htmlLink: e.htmlLink || ''
        }));
    } catch (e) {
      console.warn('[TBO Reunioes] Google Calendar merge falhou:', e.message);
      return [];
    }
  },

  _calcDurationMin(start, end) {
    if (!start || !end) return 0;
    try { return Math.round((new Date(end) - new Date(start)) / 60000); } catch { return 0; }
  },

  _buildCatDist(meetingsArr) {
    const dist = {};
    for (const m of meetingsArr) {
      const cat = m.category || m.categoria || 'geral';
      dist[cat] = (dist[cat] || 0) + 1;
    }
    return dist;
  },

  _getMeetingsArr() {
    if (this._meetingsData && Array.isArray(this._meetingsData)) return this._meetingsData;
    const meetings = TBO_STORAGE.get('meetings') || {};
    return meetings.meetings || meetings.reunioes_recentes || [];
  }
};
