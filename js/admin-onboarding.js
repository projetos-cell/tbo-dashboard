// ============================================================================
// TBO OS — Painel Admin de Onboarding
// Lista colaboradores em onboarding, progresso, check-ins, filtros
// Acessivel apenas para perfil_acesso = 'admin' ou 'gestor'
// ============================================================================

const TBO_ADMIN_ONBOARDING = {
  _dados: [],
  _filtro: 'todos',
  _realtimeChannel: null,
  _painelLateral: null,

  // ── Render (chamado pelo router quando registrado como modulo) ──────────────
  render() {
    return `
      <div class="module-wrapper">
        <div class="module-header">
          <h1>Gestao de Onboarding</h1>
          <div class="module-actions" style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" id="adminOnbExportCsv" title="Exportar CSV">
              <i data-lucide="download" style="width:14px;height:14px;margin-right:4px;"></i>
              CSV
            </button>
            <button class="btn btn-secondary btn-sm no-print" id="adminOnbPrintBtn" title="Imprimir relatorio" onclick="window.print()">
              <i data-lucide="printer" style="width:14px;height:14px;margin-right:4px;"></i>
              Imprimir
            </button>
            <a href="pages/novo-colaborador.html" class="btn btn-primary" id="adminOnbNovoBtnLink">
              <i data-lucide="user-plus" style="width:16px;height:16px;margin-right:6px;"></i>
              Novo Colaborador
            </a>
          </div>
        </div>

        <!-- Filtros -->
        <div class="module-tabs" id="adminOnbFiltros">
          <button class="tab-btn active" data-filtro="todos">Todos</button>
          <button class="tab-btn" data-filtro="onboarding">Em Onboarding</button>
          <button class="tab-btn" data-filtro="concluidos">Concluidos</button>
          <button class="tab-btn" data-filtro="atrasados">Atrasados</button>
        </div>

        <!-- KPIs -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin:20px 0;" id="adminOnbKPIs">
        </div>

        <!-- Tabela com skeleton loading -->
        <div class="table-wrapper" id="adminOnbTabela">
          <div style="padding:16px;">
            ${[1,2,3,4].map(() => `
              <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-light,#DFDFDF);">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--bg-tertiary,#EAEAEA);animation:skeleton-pulse 1.5s infinite;"></div>
                <div style="flex:1;">
                  <div style="height:14px;width:60%;background:var(--bg-tertiary);border-radius:4px;margin-bottom:6px;animation:skeleton-pulse 1.5s infinite;"></div>
                  <div style="height:10px;width:40%;background:var(--bg-tertiary);border-radius:4px;animation:skeleton-pulse 1.5s infinite;"></div>
                </div>
                <div style="height:6px;width:60px;background:var(--bg-tertiary);border-radius:3px;animation:skeleton-pulse 1.5s infinite;"></div>
              </div>
            `).join('')}
          </div>
          <style>
            @keyframes skeleton-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
            @media print {
              body > *:not(main), .sidebar, .header, .module-tabs,
              .module-actions, .no-print, .modal-overlay { display: none !important; }
              body, main { background: #fff !important; color: #000 !important; }
              .module-wrapper { padding: 0 !important; }
              .module-header h1 { font-size: 18px !important; }
              .kpi-card { border: 1px solid #ccc !important; box-shadow: none !important; break-inside: avoid; }
              .table { font-size: 12px !important; }
              .table th, .table td { padding: 6px 8px !important; }
              .table-actions { display: none !important; }
              .admin-onb-row { cursor: default !important; }
              @page { margin: 1.5cm; }
            }
          </style>
        </div>

        <!-- Painel lateral -->
        <div id="adminOnbPainelLateral"></div>
      </div>
    `;
  },

  // ── Init (chamado apos render) ──────────────────────────────────────────────
  async init(container) {
    try {
      // Verificar permissao
      if (typeof TBO_AUTH !== 'undefined') {
        const user = TBO_AUTH.getCurrentUser();
        if (user && !['founder', 'project_owner'].includes(user.role)) {
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.warning('Acesso restrito', 'Apenas administradores e gestores podem acessar esta pagina.');
          }
          return;
        }
      }

      await this._carregarDados();
      this._renderKPIs();
      this._renderTabela();
      this._bindFiltros();
      this._bindExportCsv();
      this._initRealtime();

    } catch (e) {
      console.error('[TBO Admin Onboarding] Erro:', e);
      const tabela = document.getElementById('adminOnbTabela');
      if (tabela) {
        tabela.innerHTML = `<p style="padding:24px;color:var(--danger);">Erro ao carregar dados: ${e.message}</p>`;
      }
    }
  },

  // ── Carregar dados ──────────────────────────────────────────────────────────
  async _carregarDados() {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : TBO_ONBOARDING_DB?.getClient();
    if (!client) throw new Error('Supabase nao disponivel');

    const { data, error } = await client
      .from('vw_progresso_onboarding')
      .select('*')
      .order('percentual_conclusao', { ascending: true });

    if (error) throw new Error(error.message);
    this._dados = data || [];

    // Tambem buscar colaboradores ativos que ja concluiram
    const { data: ativos } = await client
      .from('colaboradores')
      .select('id, nome, email, cargo, tipo_onboarding, onboarding_concluido_em, status')
      .eq('status', 'ativo')
      .not('onboarding_concluido_em', 'is', null)
      .order('onboarding_concluido_em', { ascending: false })
      .limit(20);

    if (ativos) {
      ativos.forEach(a => {
        if (!this._dados.find(d => d.colaborador_id === a.id)) {
          this._dados.push({
            colaborador_id: a.id,
            nome: a.nome,
            email: a.email,
            cargo: a.cargo,
            status: a.status,
            tipo_onboarding: a.tipo_onboarding,
            percentual_conclusao: 100,
            dias_concluidos: a.tipo_onboarding === 'completo' ? 10 : 3,
            total_dias: a.tipo_onboarding === 'completo' ? 10 : 3,
            ultima_atividade: 'Onboarding concluido',
            ultima_atividade_em: a.onboarding_concluido_em
          });
        }
      });
    }
  },

  // ── Render KPIs ─────────────────────────────────────────────────────────────
  _renderKPIs() {
    const container = document.getElementById('adminOnbKPIs');
    if (!container) return;

    const emOnboarding = this._dados.filter(d => d.status === 'onboarding').length;
    const concluidos = this._dados.filter(d => d.percentual_conclusao >= 100).length;
    const atrasados = this._dados.filter(d =>
      d.status === 'onboarding' && d.ultima_atividade_em &&
      (new Date() - new Date(d.ultima_atividade_em)) > 86400000
    ).length;
    const aguardando = this._dados.filter(d => d.status === 'aguardando_inicio').length;

    // Distribuicao de progresso para o grafico
    const faixas = [
      { label: '0-25%', count: this._dados.filter(d => d.status === 'onboarding' && (d.percentual_conclusao || 0) <= 25).length, color: 'var(--danger, #e74c3c)' },
      { label: '26-50%', count: this._dados.filter(d => d.status === 'onboarding' && (d.percentual_conclusao || 0) > 25 && (d.percentual_conclusao || 0) <= 50).length, color: '#f39c12' },
      { label: '51-75%', count: this._dados.filter(d => d.status === 'onboarding' && (d.percentual_conclusao || 0) > 50 && (d.percentual_conclusao || 0) <= 75).length, color: 'var(--brand-orange, #E85102)' },
      { label: '76-99%', count: this._dados.filter(d => d.status === 'onboarding' && (d.percentual_conclusao || 0) > 75 && (d.percentual_conclusao || 0) < 100).length, color: '#27ae60' },
    ];
    const maxFaixa = Math.max(1, ...faixas.map(f => f.count));

    container.innerHTML = `
      <div class="kpi-card kpi-card--gold">
        <div class="kpi-label">Em Onboarding</div>
        <div class="kpi-value">${emOnboarding}</div>
      </div>
      <div class="kpi-card kpi-card--success">
        <div class="kpi-label">Concluidos</div>
        <div class="kpi-value">${concluidos}</div>
      </div>
      <div class="kpi-card" style="border-left:3px solid var(--danger);">
        <div class="kpi-label">Atrasados</div>
        <div class="kpi-value" style="color:var(--danger);">${atrasados}</div>
      </div>
      <div class="kpi-card kpi-card--blue">
        <div class="kpi-label">Aguardando Inicio</div>
        <div class="kpi-value">${aguardando}</div>
      </div>
      <!-- Grafico de distribuicao de progresso -->
      <div class="kpi-card" style="grid-column:span 2;">
        <div class="kpi-label" style="margin-bottom:12px;">Distribuicao de Progresso (em onboarding)</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${faixas.map(f => `
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:11px;width:48px;color:var(--text-muted);text-align:right;">${f.label}</span>
              <div style="flex:1;height:16px;background:var(--bg-tertiary,#EAEAEA);border-radius:4px;overflow:hidden;">
                <div style="width:${(f.count / maxFaixa) * 100}%;height:100%;background:${f.color};border-radius:4px;transition:width 0.5s ease;"></div>
              </div>
              <span style="font-size:12px;font-weight:600;width:20px;">${f.count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ── Render tabela ───────────────────────────────────────────────────────────
  _renderTabela() {
    const container = document.getElementById('adminOnbTabela');
    if (!container) return;

    let dados = this._dados;

    // Aplicar filtro
    switch (this._filtro) {
      case 'onboarding':
        dados = dados.filter(d => d.status === 'onboarding');
        break;
      case 'concluidos':
        dados = dados.filter(d => d.percentual_conclusao >= 100);
        break;
      case 'atrasados':
        dados = dados.filter(d =>
          d.status === 'onboarding' && d.ultima_atividade_em &&
          (new Date() - new Date(d.ultima_atividade_em)) > 86400000
        );
        break;
    }

    if (dados.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-muted);">
          <i data-lucide="users" style="width:32px;height:32px;margin-bottom:8px;opacity:0.5;"></i>
          <p>Nenhum colaborador encontrado para este filtro.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Cargo</th>
            <th>Tipo</th>
            <th>Progresso</th>
            <th>Dias</th>
            <th>Ultima Atividade</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${dados.map(d => this._renderLinha(d)).join('')}
        </tbody>
      </table>
    `;

    if (window.lucide) lucide.createIcons();
    this._bindLinhaClicks();
  },

  _renderLinha(d) {
    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    const isAtrasado = d.status === 'onboarding' && d.ultima_atividade_em &&
      (new Date() - new Date(d.ultima_atividade_em)) > 86400000;

    const statusLabel = d.percentual_conclusao >= 100
      ? '<span style="color:var(--success);font-weight:600;">Concluido</span>'
      : isAtrasado
        ? '<span style="color:var(--danger);font-weight:600;">Atrasado</span>'
        : d.status === 'aguardando_inicio'
          ? '<span style="color:var(--text-muted);">Aguardando</span>'
          : '<span style="color:var(--brand-orange);font-weight:600;">Em dia</span>';

    const ultimaAtv = d.ultima_atividade_em
      ? new Date(d.ultima_atividade_em).toLocaleDateString('pt-BR')
      : '—';

    const nome = esc(d.nome);
    const iniciais = d.nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

    return `
      <tr data-colaborador-id="${esc(d.colaborador_id)}" style="cursor:pointer;" class="admin-onb-row">
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--brand-orange-pale);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--brand-orange-dark);">
              ${esc(iniciais)}
            </div>
            <div>
              <div style="font-weight:500;">${nome}</div>
              <div style="font-size:12px;color:var(--text-muted);">${esc(d.email)}</div>
            </div>
          </div>
        </td>
        <td>${esc(d.cargo) || '—'}</td>
        <td><span style="font-size:12px;padding:2px 8px;border-radius:4px;background:var(--bg-secondary);">${esc(d.tipo_onboarding)}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:60px;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
              <div style="width:${d.percentual_conclusao || 0}%;height:100%;background:${d.percentual_conclusao >= 100 ? 'var(--success)' : 'var(--brand-orange)'};border-radius:3px;"></div>
            </div>
            <span style="font-size:13px;font-weight:600;">${Math.round(d.percentual_conclusao || 0)}%</span>
          </div>
        </td>
        <td>${d.dias_concluidos || 0}/${d.total_dias || '?'}</td>
        <td style="font-size:13px;">${ultimaAtv}</td>
        <td>${statusLabel}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon btn-sm" title="Ver detalhes" data-action="detalhes" data-id="${d.colaborador_id}">
              <i data-lucide="eye" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  },

  // ── Bind filtros ────────────────────────────────────────────────────────────
  _bindFiltros() {
    const container = document.getElementById('adminOnbFiltros');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;

      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this._filtro = btn.dataset.filtro;
      this._renderTabela();
    });
  },

  // ── Bind clicks nas linhas ──────────────────────────────────────────────────
  _bindLinhaClicks() {
    const tabela = document.getElementById('adminOnbTabela');
    if (!tabela) return;

    tabela.addEventListener('click', (e) => {
      const row = e.target.closest('[data-colaborador-id]');
      if (!row) return;
      this._abrirPainelLateral(row.dataset.colaboradorId);
    });
  },

  // ── Painel lateral com detalhes ─────────────────────────────────────────────
  async _abrirPainelLateral(colaboradorId) {
    const container = document.getElementById('adminOnbPainelLateral');
    if (!container) return;

    const colab = this._dados.find(d => d.colaborador_id === colaboradorId);
    if (!colab) return;

    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : TBO_ONBOARDING_DB?.getClient();

    // Buscar atividades, progresso detalhado e timeline
    let atividadesHtml = '';
    let checkinsHtml = '';
    let timelineHtml = '';

    try {
      // Progresso detalhado
      const { data: progresso } = await client
        .from('onboarding_progresso')
        .select('*, atividade:onboarding_atividades(titulo, tipo, dia_id)')
        .eq('colaborador_id', colaboradorId)
        .order('concluido_em', { ascending: false });

      const escP = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
      if (progresso && progresso.length > 0) {
        atividadesHtml = progresso.map(p => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border-light);">
            <span style="color:${p.concluido ? 'var(--success)' : 'var(--text-muted)'};">
              <i data-lucide="${p.concluido ? 'check-circle' : 'circle'}" style="width:14px;height:14px;"></i>
            </span>
            <span style="flex:1;font-size:13px;">${escP(p.atividade?.titulo) || '—'}</span>
            <span style="font-size:12px;color:var(--text-muted);">
              ${p.concluido_em ? new Date(p.concluido_em).toLocaleDateString('pt-BR') : 'Pendente'}
            </span>
          </div>
        `).join('');
      } else {
        atividadesHtml = '<p style="color:var(--text-muted);font-size:13px;">Nenhuma atividade registrada.</p>';
      }

      // ── Timeline cronologica ──────────────────────────────────────
      const { data: diasLib } = await client
        .from('onboarding_dias_liberados')
        .select('*, dia:onboarding_dias(numero, titulo)')
        .eq('colaborador_id', colaboradorId)
        .order('liberado_em', { ascending: true });

      if (diasLib && diasLib.length > 0) {
        // Montar eventos cronologicos
        const eventos = [];
        diasLib.forEach(dl => {
          eventos.push({
            data: dl.liberado_em,
            tipo: 'liberado',
            label: `Dia ${dl.dia?.numero || '?'} liberado`,
            desc: escP(dl.dia?.titulo || ''),
            icon: 'unlock',
            color: 'var(--brand-orange)'
          });
          if (dl.concluido && dl.concluido_em) {
            eventos.push({
              data: dl.concluido_em,
              tipo: 'concluido',
              label: `Dia ${dl.dia?.numero || '?'} concluido`,
              desc: escP(dl.dia?.titulo || ''),
              icon: 'check-circle',
              color: 'var(--success)'
            });
          }
        });

        // Adicionar atividades concluidas a timeline
        if (progresso) {
          progresso.filter(p => p.concluido && p.concluido_em).forEach(p => {
            eventos.push({
              data: p.concluido_em,
              tipo: 'atividade',
              label: escP(p.atividade?.titulo || 'Atividade'),
              desc: p.atividade?.tipo || '',
              icon: 'activity',
              color: 'var(--text-secondary)'
            });
          });
        }

        // Ordenar por data
        eventos.sort((a, b) => new Date(a.data) - new Date(b.data));

        timelineHtml = eventos.map((ev, i) => `
          <div style="display:flex;gap:12px;position:relative;">
            <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
              <div style="width:24px;height:24px;border-radius:50%;background:${ev.color};display:flex;align-items:center;justify-content:center;">
                <i data-lucide="${ev.icon}" style="width:12px;height:12px;color:#fff;"></i>
              </div>
              ${i < eventos.length - 1 ? '<div style="width:2px;flex:1;background:var(--border-light,#DFDFDF);min-height:20px;"></div>' : ''}
            </div>
            <div style="padding-bottom:${i < eventos.length - 1 ? '16' : '0'}px;flex:1;">
              <div style="font-size:13px;font-weight:500;">${ev.label}</div>
              ${ev.desc ? `<div style="font-size:12px;color:var(--text-muted);">${ev.desc}</div>` : ''}
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                ${new Date(ev.data).toLocaleDateString('pt-BR')} as ${new Date(ev.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        `).join('');
      } else {
        timelineHtml = '<p style="color:var(--text-muted);font-size:13px;">Nenhum evento registrado.</p>';
      }

      // Check-ins
      const { data: checkins } = await client
        .from('onboarding_checkins')
        .select('*')
        .eq('colaborador_id', colaboradorId)
        .order('agendado_para');

      if (checkins && checkins.length > 0) {
        checkinsHtml = checkins.map(c => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border-light);">
            <span style="color:${c.realizado ? 'var(--success)' : 'var(--text-muted)'};">
              <i data-lucide="${c.realizado ? 'check-circle' : 'calendar'}" style="width:14px;height:14px;"></i>
            </span>
            <span style="flex:1;font-size:13px;">Check-in Dia ${c.dia_numero}</span>
            <span style="font-size:12px;color:var(--text-muted);">
              ${c.agendado_para ? new Date(c.agendado_para).toLocaleDateString('pt-BR') : '—'}
            </span>
            ${!c.realizado ? `<button class="btn btn-sm btn-secondary" data-action="marcar-checkin" data-checkin-id="${c.id}">Marcar realizado</button>` : ''}
          </div>
        `).join('');
      } else {
        checkinsHtml = '<p style="color:var(--text-muted);font-size:13px;">Nenhum check-in agendado.</p>';
      }
    } catch (e) {
      console.warn('[TBO Admin Onboarding] Erro ao carregar detalhes:', e);
    }

    // Verificar se convite precisa ser reenviado
    let conviteHtml = '';
    if (colab.status === 'aguardando_inicio' || colab.status === 'pre-onboarding') {
      conviteHtml = `
        <button class="btn btn-secondary btn-sm" id="adminOnbReenviarConvite" data-id="${colaboradorId}" style="margin-top:12px;">
          <i data-lucide="mail" style="width:14px;height:14px;margin-right:4px;"></i>
          Reenviar convite
        </button>
      `;
    }

    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);

    container.innerHTML = `
      <div class="modal-overlay active" id="adminOnbPainel" role="dialog" aria-modal="true" aria-labelledby="adminOnbPainelTitle">
        <div class="modal" style="max-width:560px;max-height:85vh;overflow-y:auto;">
          <div class="modal-header">
            <h2 class="modal-title" id="adminOnbPainelTitle">${esc(colab.nome)}</h2>
            <button class="modal-close" id="adminOnbPainelClose" aria-label="Fechar">&times;</button>
          </div>
          <div class="modal-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
              <div>
                <div style="font-size:12px;color:var(--text-muted);">Cargo</div>
                <div style="font-weight:500;">${esc(colab.cargo) || '—'}</div>
              </div>
              <div>
                <div style="font-size:12px;color:var(--text-muted);">Tipo</div>
                <div style="font-weight:500;">${esc(colab.tipo_onboarding)}</div>
              </div>
              <div>
                <div style="font-size:12px;color:var(--text-muted);">Buddy</div>
                <div style="font-weight:500;">${esc(colab.buddy_nome) || 'Nao designado'}</div>
              </div>
              <div>
                <div style="font-size:12px;color:var(--text-muted);">Progresso</div>
                <div style="font-weight:600;color:var(--brand-orange);">${Math.round(colab.percentual_conclusao || 0)}%</div>
              </div>
            </div>

            ${conviteHtml}

            <h4 style="margin:20px 0 8px;font-size:14px;">Atividades</h4>
            <div style="max-height:200px;overflow-y:auto;">
              ${atividadesHtml}
            </div>

            <h4 style="margin:20px 0 8px;font-size:14px;">Timeline</h4>
            <div style="max-height:250px;overflow-y:auto;padding:4px 0;">
              ${timelineHtml}
            </div>

            <h4 style="margin:20px 0 8px;font-size:14px;">Check-ins</h4>
            <div id="adminOnbCheckinsList">
              ${checkinsHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Fechar painel (com cleanup de Escape handler)
    const fecharPainel = () => {
      container.innerHTML = '';
      document.removeEventListener('keydown', escPainelHandler);
    };
    const escPainelHandler = (e) => { if (e.key === 'Escape') fecharPainel(); };
    document.addEventListener('keydown', escPainelHandler);

    document.getElementById('adminOnbPainelClose')?.addEventListener('click', fecharPainel);
    document.getElementById('adminOnbPainel')?.addEventListener('click', (e) => {
      if (e.target.id === 'adminOnbPainel') fecharPainel();
    });

    // Reenviar convite
    document.getElementById('adminOnbReenviarConvite')?.addEventListener('click', async (e) => {
      await this._reenviarConvite(e.target.closest('[data-id]').dataset.id);
    });

    // Marcar check-in
    const checkinsList = document.getElementById('adminOnbCheckinsList');
    if (checkinsList) {
      checkinsList.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action="marcar-checkin"]');
        if (!btn) return;
        await this._marcarCheckin(btn.dataset.checkinId);
      });
    }
  },

  // ── Reenviar convite ────────────────────────────────────────────────────────
  async _reenviarConvite(colaboradorId) {
    try {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : TBO_ONBOARDING_DB?.getClient();
      if (!client) return;

      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await client
        .from('convites')
        .insert({
          colaborador_id: colaboradorId,
          token,
          expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw new Error(error.message);

      const link = `${window.location.origin}/pages/convite.html?token=${token}`;

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Convite reenviado', 'Novo link gerado com sucesso. Copie-o do campo abaixo.');
      } else {
        alert('Convite reenviado! Link: ' + link);
      }
    } catch (e) {
      console.error('[TBO Admin Onboarding] Erro ao reenviar convite:', e);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', `Nao foi possivel reenviar: ${e.message}`);
      }
    }
  },

  // ── Marcar check-in como realizado ──────────────────────────────────────────
  async _marcarCheckin(checkinId) {
    // Usar modal ao inves de prompt() bloqueante
    const modalArea = document.getElementById('adminOnbPainelLateral');
    if (!modalArea) return;

    const existingModal = document.getElementById('adminOnbCheckinModal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'adminOnbCheckinModal';
    overlay.className = 'modal-overlay active';
    overlay.style.cssText = 'z-index:10001;';
    overlay.innerHTML = `
      <div class="modal" style="max-width:400px;">
        <div class="modal-header"><h2 class="modal-title">Registrar Check-in</h2></div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Anotacoes (opcional)</label>
            <textarea class="form-input" id="adminOnbCheckinNotes" rows="3" placeholder="Observacoes sobre o check-in..."></textarea>
          </div>
        </div>
        <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-secondary" id="adminOnbCheckinCancel">Cancelar</button>
          <button class="btn btn-primary" id="adminOnbCheckinConfirm">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#adminOnbCheckinCancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#adminOnbCheckinConfirm').addEventListener('click', async () => {
      const anotacoes = document.getElementById('adminOnbCheckinNotes')?.value?.trim();
      overlay.remove();

      try {
        const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : TBO_ONBOARDING_DB?.getClient();
        if (!client) return;

        const updates = { realizado: true, realizado_em: new Date().toISOString() };
        if (anotacoes) updates.anotacoes = anotacoes;

        const { error } = await client
          .from('onboarding_checkins')
          .update(updates)
          .eq('id', checkinId);

        if (error) throw new Error(error.message);

        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.success('Check-in registrado', 'Check-in marcado como realizado.');
        }

        await this._carregarDados();
        this._renderTabela();
      } catch (e) {
        console.error('[TBO Admin Onboarding] Erro ao marcar check-in:', e);
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.error('Erro', 'Falha ao registrar check-in.');
        }
      }
    });
  },

  // ── Exportar CSV ──────────────────────────────────────────────────────────
  _bindExportCsv() {
    document.getElementById('adminOnbExportCsv')?.addEventListener('click', () => {
      if (!this._dados || this._dados.length === 0) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Sem dados', 'Nenhum dado para exportar.');
        return;
      }

      const headers = ['Nome', 'Email', 'Cargo', 'Tipo', 'Progresso (%)', 'Dias Concluidos', 'Total Dias', 'Status', 'Ultima Atividade'];
      const rows = this._dados.map(d => [
        `"${(d.nome || '').replace(/"/g, '""')}"`,
        `"${(d.email || '').replace(/"/g, '""')}"`,
        `"${(d.cargo || '').replace(/"/g, '""')}"`,
        d.tipo_onboarding || '',
        Math.round(d.percentual_conclusao || 0),
        d.dias_concluidos || 0,
        d.total_dias || 0,
        d.status || '',
        d.ultima_atividade_em ? new Date(d.ultima_atividade_em).toLocaleDateString('pt-BR') : ''
      ]);

      const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onboarding_relatorio_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Exportado', 'Relatorio CSV gerado com sucesso.');
    });
  },

  // ── Realtime (com debounce para evitar re-renders excessivos) ───────────────
  _realtimeDebounce: null,

  _initRealtime() {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : TBO_ONBOARDING_DB?.getClient();
    if (!client) return;

    const debouncedRefresh = () => {
      clearTimeout(this._realtimeDebounce);
      this._realtimeDebounce = setTimeout(async () => {
        await this._carregarDados();
        this._renderKPIs();
        this._renderTabela();
      }, 500);
    };

    this._realtimeChannel = client
      .channel('admin-onboarding-progresso')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'onboarding_progresso'
      }, debouncedRefresh)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'colaboradores',
      }, debouncedRefresh)
      .subscribe();
  },

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  destroy() {
    // Remover canal Realtime
    if (this._realtimeChannel) {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (client) client.removeChannel(this._realtimeChannel);
      this._realtimeChannel = null;
    }
    // Limpar debounce pendente
    if (this._realtimeDebounce) {
      clearTimeout(this._realtimeDebounce);
      this._realtimeDebounce = null;
    }
    // Limpar painel lateral se aberto
    const painel = document.getElementById('adminOnbPainelLateral');
    if (painel) painel.innerHTML = '';
    // Limpar modal de checkin se aberto
    const checkinModal = document.getElementById('adminOnbCheckinModal');
    if (checkinModal) checkinModal.remove();
    // Limpar dados em memoria
    this._dados = [];
  }
};
