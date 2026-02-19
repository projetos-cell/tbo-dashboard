// ============================================================================
// TBO OS — Digest Engine
// Sistema de digest diario/semanal com preview no dashboard e trigger de envio
// ============================================================================

const TBO_DIGEST = {

  // ══════════════════════════════════════════════════════════════════════
  // GERAR DIGEST LOCAL (preview no dashboard, sem precisar de Edge Function)
  // ══════════════════════════════════════════════════════════════════════
  async generateLocalDigest(period = 'daily') {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    if (!user) return null;

    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) return this._generateFromLocalStorage(period);

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - (period === 'weekly' ? 7 : 1));
    const since = sinceDate.toISOString();

    try {
      // Buscar dados em paralelo (com tenant_id — v2.1 multi-tenant)
      const tenantId = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getCurrentTenantId() : null;
      const tFilter = (q) => tenantId ? q.eq('tenant_id', tenantId) : q;
      const [tasksRes, projectsRes, dealsRes, notifsRes] = await Promise.all([
        tFilter(client.from('tasks').select('title, status, project_name, due_date, updated_at')
          .eq('owner_id', user.supabaseId)
          .gte('updated_at', since)),
        tFilter(client.from('projects').select('name, status, client, value')
          .eq('owner_id', user.supabaseId)
          .not('status', 'in', '("finalizado","cancelado")')),
        tFilter(client.from('crm_deals').select('name, stage, company, value')
          .eq('owner_id', user.supabaseId)
          .not('stage', 'in', '("fechado_ganho","fechado_perdido")')),
        client.from('notifications').select('id', { count: 'exact', head: true })
          .eq('user_id', user.supabaseId)
          .eq('read', false)
      ]);

      const tasks = tasksRes.data || [];
      const projects = projectsRes.data || [];
      const deals = dealsRes.data || [];
      const unreadNotifs = notifsRes.count || 0;

      return {
        period,
        generatedAt: new Date().toISOString(),
        user: user.name,
        stats: {
          tarefasConcluidas: tasks.filter(t => t.status === 'concluida').length,
          tarefasPendentes: tasks.filter(t => t.status === 'pendente').length,
          tarefasEmAndamento: tasks.filter(t => t.status === 'em_andamento').length,
          projetosAtivos: projects.length,
          dealsEmPipeline: deals.length,
          valorPipeline: deals.reduce((s, d) => s + (d.value || 0), 0),
          notificacoesNaoLidas: unreadNotifs
        },
        projects: projects.slice(0, 5),
        deals: deals.slice(0, 5),
        upcomingTasks: tasks
          .filter(t => t.status === 'pendente' && t.due_date)
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 5)
      };
    } catch (e) {
      console.warn('[TBO Digest] Erro ao buscar dados Supabase:', e);
      return this._generateFromLocalStorage(period);
    }
  },

  // Fallback: gerar digest do localStorage
  _generateFromLocalStorage(period) {
    if (typeof TBO_STORAGE === 'undefined') return null;

    const tasks = TBO_STORAGE.getAllErpEntities('task') || [];
    const projects = TBO_STORAGE.getAllErpEntities('project') || [];
    const deals = TBO_STORAGE.getAllErpEntities('deal') || [];

    return {
      period,
      generatedAt: new Date().toISOString(),
      user: 'Voce',
      stats: {
        tarefasConcluidas: tasks.filter(t => t.status === 'concluida').length,
        tarefasPendentes: tasks.filter(t => t.status === 'pendente').length,
        tarefasEmAndamento: tasks.filter(t => t.status === 'em_andamento').length,
        projetosAtivos: projects.filter(p => !['finalizado', 'cancelado'].includes(p.status)).length,
        dealsEmPipeline: deals.filter(d => !['fechado_ganho', 'fechado_perdido'].includes(d.stage)).length,
        valorPipeline: deals.filter(d => !['fechado_ganho', 'fechado_perdido'].includes(d.stage))
          .reduce((s, d) => s + (d.value || 0), 0),
        notificacoesNaoLidas: 0
      },
      projects: projects.filter(p => !['finalizado', 'cancelado'].includes(p.status)).slice(0, 5),
      deals: deals.filter(d => !['fechado_ganho', 'fechado_perdido'].includes(d.stage)).slice(0, 5),
      upcomingTasks: tasks.filter(t => t.status === 'pendente' && t.due_date)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5)
    };
  },

  // ══════════════════════════════════════════════════════════════════════
  // RENDERIZAR WIDGET DE DIGEST NO DASHBOARD
  // ══════════════════════════════════════════════════════════════════════
  renderDigestWidget(container, digest) {
    if (!container || !digest) return;

    const { stats } = digest;
    const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

    container.innerHTML = `
      <div class="digest-widget" style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-default);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:32px;height:32px;border-radius:8px;background:var(--brand-orange);display:flex;align-items:center;justify-content:center;">
              <i data-lucide="sparkles" style="width:16px;height:16px;color:#fff;"></i>
            </div>
            <div>
              <h3 style="margin:0;font-size:0.9rem;font-weight:600;">Seu Resumo ${digest.period === 'weekly' ? 'Semanal' : 'Diario'}</h3>
              <span style="font-size:0.7rem;color:var(--text-muted);">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="digest-period-btn ${digest.period === 'daily' ? 'active' : ''}" data-digest-period="daily"
              style="padding:4px 10px;border-radius:6px;border:1px solid var(--border-default);background:${digest.period === 'daily' ? 'var(--brand-orange)' : 'transparent'};color:${digest.period === 'daily' ? '#fff' : 'var(--text-secondary)'};font-size:0.68rem;cursor:pointer;">
              Dia
            </button>
            <button class="digest-period-btn ${digest.period === 'weekly' ? 'active' : ''}" data-digest-period="weekly"
              style="padding:4px 10px;border-radius:6px;border:1px solid var(--border-default);background:${digest.period === 'weekly' ? 'var(--brand-orange)' : 'transparent'};color:${digest.period === 'weekly' ? '#fff' : 'var(--text-secondary)'};font-size:0.68rem;cursor:pointer;">
              Semana
            </button>
          </div>
        </div>

        <!-- KPIs Grid -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;">
          <div style="background:var(--bg-tertiary);border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:1.4rem;font-weight:700;color:#22c55e;" data-kpi="digest_done">${stats.tarefasConcluidas}</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Concluidas</div>
          </div>
          <div style="background:var(--bg-tertiary);border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:1.4rem;font-weight:700;color:#3b82f6;" data-kpi="digest_wip">${stats.tarefasEmAndamento}</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Em Andamento</div>
          </div>
          <div style="background:var(--bg-tertiary);border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:1.4rem;font-weight:700;color:#f59e0b;" data-kpi="digest_pending">${stats.tarefasPendentes}</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Pendentes</div>
          </div>
        </div>

        <!-- Resumo Pipeline -->
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <div style="flex:1;background:linear-gradient(135deg,var(--brand-orange),#f43f5e);border-radius:8px;padding:12px;color:#fff;">
            <div style="font-size:0.65rem;opacity:0.9;">Pipeline Ativo</div>
            <div style="font-size:1.1rem;font-weight:700;">${stats.dealsEmPipeline} deals</div>
            <div style="font-size:0.75rem;opacity:0.9;">${formatCurrency(stats.valorPipeline)}</div>
          </div>
          <div style="flex:1;background:var(--bg-tertiary);border-radius:8px;padding:12px;">
            <div style="font-size:0.65rem;color:var(--text-muted);">Projetos Ativos</div>
            <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary);">${stats.projetosAtivos}</div>
            ${stats.notificacoesNaoLidas > 0 ? `<div style="font-size:0.7rem;color:#ef4444;">🔔 ${stats.notificacoesNaoLidas} alertas</div>` : ''}
          </div>
        </div>

        <!-- Tarefas urgentes -->
        ${digest.upcomingTasks && digest.upcomingTasks.length > 0 ? `
          <div style="margin-top:8px;">
            <div style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">⚡ Proximas Entregas</div>
            ${digest.upcomingTasks.slice(0, 3).map(t => `
              <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;background:var(--bg-tertiary);margin-bottom:4px;">
                <div style="width:6px;height:6px;border-radius:50%;background:${new Date(t.due_date) < new Date() ? '#ef4444' : '#f59e0b'};flex-shrink:0;"></div>
                <span style="font-size:0.72rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.title}</span>
                <span style="font-size:0.65rem;color:var(--text-muted);flex-shrink:0;">${t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // Bind period toggles
    container.querySelectorAll('.digest-period-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const period = btn.dataset.digestPeriod;
        const newDigest = await this.generateLocalDigest(period);
        if (newDigest) this.renderDigestWidget(container, newDigest);
      });
    });

    if (window.lucide) lucide.createIcons();
  },

  // ══════════════════════════════════════════════════════════════════════
  // TRIGGER ENVIO VIA EDGE FUNCTION
  // ══════════════════════════════════════════════════════════════════════
  async triggerEmailDigest(type = 'daily') {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Supabase nao disponivel.');
      return;
    }

    try {
      const { data, error } = await client.functions.invoke('daily-digest', {
        body: { type }
      });
      if (error) throw error;
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Digest enviado', `Digest ${type} enviado com sucesso!`);
      }
      return data;
    } catch (e) {
      console.error('[TBO Digest] Erro ao enviar digest:', e);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', 'Falha ao enviar digest: ' + e.message);
      }
    }
  },

  async triggerFinancialReport() {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Supabase nao disponivel.');
      return;
    }

    try {
      const { data, error } = await client.functions.invoke('weekly-financial-report');
      if (error) throw error;
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Relatorio enviado', 'Relatorio financeiro semanal enviado para marco@ e ruy@agenciatbo.com.br');
      }
      return data;
    } catch (e) {
      console.error('[TBO Digest] Erro ao enviar relatorio:', e);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', 'Falha ao enviar relatorio: ' + e.message);
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════════════
  init() {
    console.log('[TBO Digest] Engine initialized');
  }
};
