// TBO OS — People Tab: Equipe (Visão Geral)
// Sub-modulo lazy-loaded: organograma, tabela BU, cards, drawer perfil

(function() {
  const S = TBO_PEOPLE_SHARED;

  const TabEquipe = {
    // Sub-view state
    _visaoGeralView: 'tabela',
    _personPDICache: null,
    _personProjectsCache: null,
    _personSkillsCache: null,
    _personTasks: [],

    render() {
      const team = S._getInternalTeam();
      const reviews = S._getStore('avaliacoes_people');
      const medias = reviews.map(r => r.mediaGeral).filter(Boolean);
      const mediaGeral = medias.length ? (medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(1) : '\u2014';
      const bus = S._getBUs();
      const v = this._visaoGeralView;

      // Extrair roles RBAC unicos para filtro
      const rbacRoles = [...new Set(team.map(t => t.rbacRole).filter(Boolean))].sort();
      // Extrair status unicos
      const statuses = [...new Set(team.map(t => t.status || 'ativo'))].sort();
      // Lideres
      const leaders = team.filter(t => team.some(m => m.lider === t.id));

      // Contadores para KPIs
      const onboarding = team.filter(t => t.status === 'onboarding').length;
      const coordinators = team.filter(t => t.isCoordinator).length;

      // Paginacao info
      const totalPages = Math.ceil(S._totalCount / S._pageSize) || 1;

      // KPIs: container com skeleton, carregamento async
      const ativos = team.filter(t => t.status === 'ativo' || t.status === 'active').length;
      const ferias = team.filter(t => t.status === 'ferias' || t.status === 'vacation').length;
      const ausentes = team.filter(t => t.status === 'away' || t.status === 'ausente').length;
      const fmt = typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER : { currency: v => `R$ ${Number(v).toLocaleString('pt-BR', {minimumFractionDigits:0})}` };

      return `
        ${S._pageHeader('Equipe', 'Visão geral da equipe, estrutura e indicadores')}

        <div id="rhKPIContainer" class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card"><div class="kpi-label">Total Pessoas</div><div class="kpi-value">${S._totalCount || team.length}</div><div class="kpi-sub">${coordinators} coordenadores</div></div>
          <div class="kpi-card kpi-card--success"><div class="kpi-label">Ativos</div><div class="kpi-value">${ativos}</div><div class="kpi-sub">${ferias ? ferias + ' ferias' : ''}${ferias && ausentes ? ' · ' : ''}${ausentes ? ausentes + ' ausentes' : ''}${!ferias && !ausentes ? 'em operacao' : ''}</div></div>
          ${S._isAdmin() ? `<div class="kpi-card kpi-card--blue"><div class="kpi-label">Custo Mensal</div><div class="kpi-value" id="rhKPICusto"><span class="rh-skeleton" style="width:80px;height:20px;display:inline-block;border-radius:4px;"></span></div><div class="kpi-sub" id="rhKPICustoSub">carregando...</div></div>` : `<div class="kpi-card kpi-card--blue"><div class="kpi-label">BUs</div><div class="kpi-value">${bus.length}</div><div class="kpi-sub">${bus.join(', ')}</div></div>`}
          <div class="kpi-card kpi-card--gold"><div class="kpi-label">Media Performance</div><div class="kpi-value">${mediaGeral}</div><div class="kpi-sub">escala 1-5</div></div>
        </div>

        <!-- Widget Aniversariantes do Mês (P2) -->
        <div id="rhBirthdayWidget"></div>

        <!-- Toolbar: view switcher + filtros avancados -->
        <div class="card" style="margin-bottom:16px;padding:10px 16px;">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:space-between;">
            <div style="display:flex;gap:4px;align-items:center;">
              <button class="btn btn-sm rh-view-btn ${v === 'organograma' ? 'btn-primary' : 'btn-secondary'}" data-view="organograma" title="Organograma">
                <i data-lucide="git-branch" style="width:14px;height:14px;"></i>
              </button>
              <button class="btn btn-sm rh-view-btn ${v === 'tabela' ? 'btn-primary' : 'btn-secondary'}" data-view="tabela" title="Tabela por BU">
                <i data-lucide="table-2" style="width:14px;height:14px;"></i>
              </button>
              <button class="btn btn-sm rh-view-btn ${v === 'cards' ? 'btn-primary' : 'btn-secondary'}" data-view="cards" title="Cards">
                <i data-lucide="layout-grid" style="width:14px;height:14px;"></i>
              </button>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <div style="position:relative;">
                <i data-lucide="search" style="width:13px;height:13px;position:absolute;left:8px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;"></i>
                <input type="text" class="form-input rh-filter-search" placeholder="Buscar por nome ou email..." style="width:auto;min-width:200px;padding:5px 10px 5px 28px;font-size:0.76rem;">
              </div>
              <select class="form-input rh-filter-bu" style="width:auto;min-width:120px;padding:5px 10px;font-size:0.76rem;">
                <option value="">Todas BUs</option>
                ${bus.map(bu => `<option value="${bu}" ${S._filterSquad === bu ? 'selected' : ''}>${bu}</option>`).join('')}
              </select>
              <select class="form-input rh-filter-role" style="width:auto;min-width:110px;padding:5px 10px;font-size:0.76rem;">
                <option value="">Todos Roles</option>
                ${rbacRoles.map(r => `<option value="${r}" ${S._filterRole === r ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
              <select class="form-input rh-filter-status" style="width:auto;min-width:100px;padding:5px 10px;font-size:0.76rem;">
                <option value="">Todos Status</option>
                <option value="ativo" ${S._filterStatus === 'ativo' ? 'selected' : ''}>Ativo</option>
                <option value="ferias" ${S._filterStatus === 'ferias' ? 'selected' : ''}>Ferias</option>
                <option value="ausente" ${S._filterStatus === 'ausente' ? 'selected' : ''}>Ausente</option>
                <option value="inativo" ${S._filterStatus === 'inativo' ? 'selected' : ''}>Inativo</option>
                <option value="onboarding" ${S._filterStatus === 'onboarding' ? 'selected' : ''}>Onboarding</option>
                <option value="suspenso" ${S._filterStatus === 'suspenso' ? 'selected' : ''}>Suspenso</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Conteudo da view ativa -->
        <div id="rhVisaoGeralContent">
          ${this._renderVisaoGeralContent(team, reviews)}
        </div>

        <!-- Paginacao (so na view tabela) -->
        ${v === 'tabela' && S._totalCount > S._pageSize ? `
        <div class="card rh-pagination" style="margin-top:12px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.75rem;color:var(--text-muted);">
            Mostrando ${S._page * S._pageSize + 1}\u2013${Math.min((S._page + 1) * S._pageSize, S._totalCount)} de ${S._totalCount}
          </span>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm btn-secondary rh-page-btn" data-page="prev" ${S._page === 0 ? 'disabled' : ''}>
              <i data-lucide="chevron-left" style="width:14px;height:14px;"></i>
            </button>
            <span style="font-size:0.78rem;padding:4px 10px;font-weight:600;">${S._page + 1} / ${totalPages}</span>
            <button class="btn btn-sm btn-secondary rh-page-btn" data-page="next" ${S._page >= totalPages - 1 ? 'disabled' : ''}>
              <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>` : ''}

        <!-- Drawer de detalhe (Perfil Asana-style) -->
        <div id="rhPersonDrawer" class="rh-drawer" style="display:none;"></div>

        <!-- Context menu (acoes por usuario) -->
        <div id="rhContextMenu" class="rh-context-menu" style="display:none;"></div>
      `;
    },

    _renderVisaoGeralContent(team, reviews) {
      switch (this._visaoGeralView) {
        case 'organograma': return this._renderOrganograma(team);
        case 'tabela':      return this._renderTabelaBU(team, reviews);
        case 'cards':       return this._renderPeopleCards(team, reviews);
        default:            return this._renderTabelaBU(team, reviews);
      }
    },

    // ── Organograma (Org Chart) ──────────────────────────────────────
    _renderOrganograma(team) {
      // P2: Construir árvore hierárquica usando gestorId (manager_id UUID) com fallback para lider (slug)
      const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
      const statusDot = { 'active': '#10B981', 'inactive': '#6B7280', 'vacation': '#F59E0B', 'away': '#8B5CF6', 'onboarding': '#3B82F6', 'offboarding': '#F97316', 'desligado': '#9CA3AF', 'suspended': '#DC2626' };

      // Identificar raízes: quem não tem gestor (nem gestorId nem lider)
      const roots = team.filter(t => !t.gestorId && !t.lider);

      // getChildren: prioriza gestorId (UUID match via supabaseId), fallback para lider (slug match via id)
      const getChildren = (person) => {
        return team.filter(t => {
          if (t.gestorId && person.supabaseId) return t.gestorId === person.supabaseId;
          if (t.lider) return t.lider === person.id;
          return false;
        });
      };

      const renderNode = (person, level = 0) => {
        const children = getChildren(person);
        const color = buColors[person.bu] || 'var(--accent-gold)';
        const review = S._getStore('avaliacoes_people').find(r => r.pessoaId === person.id);
        const score = review ? review.mediaGeral.toFixed(1) : '';
        const dotColor = statusDot[person.status] || statusDot['active'];
        const isExpanded = level < 2; // Expandir primeiros 2 níveis

        return `
          <div class="rh-org-node" style="cursor:pointer;">
            <div class="rh-org-card" data-person="${person.id}" style="border-left:3px solid ${color};position:relative;">
              <div style="position:absolute;top:8px;right:8px;width:8px;height:8px;border-radius:50%;background:${dotColor};" title="${person.status || 'active'}"></div>
              <div style="display:flex;align-items:center;gap:10px;">
                ${S._getAvatarHTML(person, 36, '0.8rem')}
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:700;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" data-person-id="${person.supabaseId || ''}">${S._esc(person.nome)}</div>
                  <div style="font-size:0.68rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${S._esc(person.cargo)}</div>
                </div>
                ${score ? `<div style="font-size:0.72rem;font-weight:700;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${score}</div>` : ''}
              </div>
              <div style="display:flex;gap:4px;align-items:center;margin-top:6px;">
                ${person.bu ? `<span class="tag" style="font-size:0.58rem;background:${color}15;color:${color};">${person.bu}</span>` : ''}
                ${children.length ? `<span style="font-size:0.58rem;color:var(--text-muted);margin-left:auto;">${children.length} report${children.length > 1 ? 's' : ''}</span>` : ''}
              </div>
            </div>
            ${children.length ? `
              <div class="rh-org-children ${isExpanded ? '' : 'rh-org-collapsed'}" data-parent="${person.id}">
                ${children.length ? `<div class="rh-org-connector"></div>` : ''}
                ${children.map(c => renderNode(c, level + 1)).join('')}
              </div>
              ${!isExpanded ? `<button class="btn btn-ghost btn-sm rh-org-toggle" data-toggle="${person.id}" style="font-size:0.65rem;padding:2px 8px;margin-top:4px;color:var(--text-muted);">
                <i data-lucide="chevron-down" style="width:12px;height:12px;"></i> ${children.length} reports
              </button>` : ''}
            ` : ''}
          </div>`;
      };

      // Totais para legenda
      const totalReports = team.filter(t => t.gestorId || t.lider).length;
      const maxDepth = (nodes, depth = 0) => {
        let max = depth;
        nodes.forEach(n => { const ch = getChildren(n); if (ch.length) max = Math.max(max, maxDepth(ch, depth + 1)); });
        return max;
      };
      const treeDepth = maxDepth(roots);

      return `
        <div class="card" style="padding:24px;overflow-x:auto;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
            <i data-lucide="git-branch" style="width:18px;height:18px;color:var(--accent-gold);"></i>
            <h3 style="font-size:0.95rem;margin:0;">Organograma TBO</h3>
            <div style="display:flex;gap:12px;margin-left:auto;align-items:center;">
              <span style="font-size:0.68rem;color:var(--text-muted);">${team.length} pessoas \u00B7 ${treeDepth + 1} n\u00EDveis</span>
              <div style="display:flex;gap:8px;font-size:0.62rem;">
                ${Object.entries(statusDot).slice(0, 4).map(([k, c]) => `<span style="display:flex;align-items:center;gap:3px;"><span style="width:6px;height:6px;border-radius:50%;background:${c};"></span>${k === 'active' ? 'Ativo' : k === 'vacation' ? 'F\u00E9rias' : k === 'away' ? 'Ausente' : 'Inativo'}</span>`).join('')}
              </div>
            </div>
          </div>
          <div class="rh-org-tree">
            ${roots.map(r => renderNode(r)).join('')}
          </div>
        </div>`;
    },

    // ── Tabela por BU (estilo Notion) ─────────────────────────────────
    _renderTabelaBU(team, reviews) {
      const bus = S._getBUs();
      const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
      const statusConfig = {
        'ativo':      { label: 'Ativo',      color: 'var(--color-success)', icon: 'check-circle' },
        'active':     { label: 'Ativo',      color: 'var(--color-success)', icon: 'check-circle' },
        'onboarding': { label: 'Onboarding', color: 'var(--color-info)',    icon: 'compass' },
        'convidado':  { label: 'Convidado',  color: 'var(--color-purple, #8b5cf6)', icon: 'mail' },
        'ferias':     { label: 'Ferias',     color: 'var(--color-warning)', icon: 'sun' },
        'vacation':   { label: 'Ferias',     color: 'var(--color-warning)', icon: 'sun' },
        'ausente':    { label: 'Ausente',    color: 'var(--color-warning)', icon: 'moon' },
        'away':       { label: 'Ausente',    color: 'var(--color-warning)', icon: 'moon' },
        'suspenso':   { label: 'Suspenso',   color: 'var(--color-warning)', icon: 'pause-circle' },
        'suspended':  { label: 'Suspenso',   color: 'var(--color-warning)', icon: 'pause-circle' },
        'inativo':    { label: 'Inativo',    color: 'var(--text-muted)',    icon: 'x-circle' },
        'inactive':   { label: 'Inativo',    color: 'var(--text-muted)',    icon: 'x-circle' },
        'removido':   { label: 'Removido',   color: 'var(--color-danger)',  icon: 'user-x' }
      };

      // Sortable header helper
      const sortIcon = (col) => {
        if (S._sortBy === col) return `<i data-lucide="${S._sortDir === 'asc' ? 'chevron-up' : 'chevron-down'}" style="width:12px;height:12px;opacity:0.7;"></i>`;
        return `<i data-lucide="chevrons-up-down" style="width:11px;height:11px;opacity:0.3;"></i>`;
      };

      // Agrupar por BU (+ grupo "Diretoria" para quem nao tem BU)
      const groups = {};
      team.forEach(p => {
        const g = p.bu || 'Diretoria';
        if (!groups[g]) groups[g] = [];
        groups[g].push(p);
      });

      // Ordenar: Diretoria primeiro, depois BUs
      const sortedGroups = Object.entries(groups).sort((a, b) => {
        if (a[0] === 'Diretoria') return -1;
        if (b[0] === 'Diretoria') return 1;
        return a[0].localeCompare(b[0]);
      });

      const isAdmin = S._isAdmin();

      return `
        <div class="card rh-tabela-card" style="overflow:hidden;">
          <div style="overflow-x:auto;">
            <table class="data-table rh-bu-table" style="min-width:950px;">
              <thead>
                <tr>
                  <th class="rh-sort-header" data-sort="full_name" style="min-width:200px;cursor:pointer;">
                    <div style="display:flex;align-items:center;gap:4px;">Colaborador(a) ${sortIcon('full_name')}</div>
                  </th>
                  <th style="min-width:130px;">Cargo</th>
                  <th style="min-width:100px;">Papel RBAC</th>
                  <th style="min-width:90px;">Squad/BU</th>
                  ${isAdmin ? '<th style="min-width:95px;">Custo Mensal</th>' : ''}
                  <th style="min-width:60px;text-align:center;">Projetos</th>
                  <th class="rh-sort-header" data-sort="created_at" style="min-width:85px;cursor:pointer;">
                    <div style="display:flex;align-items:center;gap:4px;">Entrada ${sortIcon('created_at')}</div>
                  </th>
                  <th style="min-width:95px;">Gestor</th>
                  <th style="min-width:75px;text-align:center;">Status</th>
                  <th class="rh-sort-header" data-sort="updated_at" style="min-width:85px;cursor:pointer;">
                    <div style="display:flex;align-items:center;gap:4px;">Atividade ${sortIcon('updated_at')}</div>
                  </th>
                  ${isAdmin ? '<th style="width:40px;text-align:center;"></th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${sortedGroups.map(([groupName, members]) => {
                  const color = buColors[groupName] || 'var(--accent-gold)';
                  const colSpan = isAdmin ? 11 : 9;
                  return `
                    <tr class="rh-bu-group-header" data-group="${groupName}">
                      <td colspan="${colSpan}" style="background:${color}08;padding:8px 16px;cursor:pointer;">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <i data-lucide="chevron-down" class="rh-group-chevron" style="width:14px;height:14px;color:${color};transition:transform 0.2s;"></i>
                          <span style="font-weight:700;font-size:0.85rem;color:${color};">${groupName}</span>
                          <span style="font-size:0.72rem;color:var(--text-muted);">${members.length} pessoas</span>
                        </div>
                      </td>
                    </tr>
                    ${members.map(p => {
                      const dataEntrada = p.dataEntrada || p.dataInicio || (p.id === 'marco' || p.id === 'ruy' ? '2021-03-01' : '2024-06-01');
                      const st = statusConfig[p.status] || statusConfig['ativo'];
                      const rbacColor = p.rbacColor || '#94a3b8';
                      const gestorNome = p.gestorNome || (p.lider ? S._getPersonName(p.lider) : '\u2014');
                      const custoFmt = p.custoMensal ? (typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(p.custoMensal) : `R$ ${Number(p.custoMensal).toLocaleString('pt-BR', {minimumFractionDigits:0})}`) : '\u2014';
                      return `
                      <tr class="rh-bu-row rh-person-row" data-person="${p.id}" data-group="${groupName}" data-bu="${p.bu || ''}" data-status="${p.status || 'active'}" style="cursor:pointer;">
                        <td>
                          <div style="display:flex;align-items:center;gap:10px;">
                            ${S._getAvatarHTML(p, 32, '0.72rem')}
                            <div style="min-width:0;" data-person-id="${p.supabaseId || p.id}">
                              <div style="font-weight:600;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${S._esc(p.nome)}</div>
                              ${p.email ? `<div style="font-size:0.66rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${S._esc(p.email)}</div>` : ''}
                            </div>
                          </div>
                        </td>
                        <td style="font-size:0.78rem;">${S._esc(p.cargo)}</td>
                        <td>
                          <span class="tag" style="font-size:0.65rem;background:${rbacColor}18;color:${rbacColor};border:1px solid ${rbacColor}30;">
                            ${S._esc(p.rbacLabel || p.rbacRole || 'artist')}
                          </span>
                        </td>
                        <td style="font-size:0.78rem;">${S._esc(p.bu || 'Geral')}</td>
                        ${isAdmin ? `<td style="font-size:0.75rem;font-weight:500;color:var(--text-secondary);">${custoFmt}</td>` : ''}
                        <td style="text-align:center;font-size:0.75rem;" data-user-projects="${p.supabaseId || p.id}"><span class="rh-skeleton" style="width:20px;height:14px;display:inline-block;border-radius:3px;"></span></td>
                        <td style="font-size:0.75rem;color:var(--text-secondary);">${new Date(dataEntrada).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</td>
                        <td style="font-size:0.75rem;">${gestorNome !== '\u2014' ? `<span style="color:var(--text-secondary);" data-person-id="${p.gestorId || ''}">${S._esc(gestorNome)}</span>` : '<span style="color:var(--text-muted);">\u2014</span>'}</td>
                        <td style="text-align:center;">
                          <span class="tag" style="font-size:0.62rem;background:${st.color}18;color:${st.color};">
                            ${st.label}
                          </span>
                        </td>
                        <td style="font-size:0.72rem;color:var(--text-muted);">${p.dataEntrada ? new Date(p.dataEntrada).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '\u2014'}</td>
                        ${isAdmin ? `
                        <td style="text-align:center;">
                          <button class="btn btn-ghost btn-sm rh-action-menu-btn" data-person="${p.id}" data-name="${S._esc(p.nome)}" style="padding:2px 6px;" title="Acoes" onclick="event.stopPropagation();">
                            <i data-lucide="more-horizontal" style="width:14px;height:14px;"></i>
                          </button>
                        </td>` : ''}
                      </tr>`;
                    }).join('')}
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    },

    // ── Context menu (acoes por usuario) ───────────────────────────────
    _renderContextMenu(personId, personName, x, y) {
      const isOwner = S._isAdmin();
      const person = S._getPerson(personId);
      const isSelf = personId === S._currentUserId();

      const items = [
        { icon: 'user', label: 'Ver perfil', action: 'view_profile', always: true },
        { icon: 'shield', label: 'Alterar role RBAC', action: 'change_role', admin: true },
        { icon: 'briefcase', label: 'Alterar cargo', action: 'change_cargo', admin: true },
        { icon: 'users', label: 'Mover de squad', action: 'change_squad', admin: true },
        { icon: 'mail', label: 'Reenviar convite', action: 'resend_invite', admin: true, condition: person?.status === 'convidado' },
        { divider: true },
        { icon: 'pause-circle', label: 'Suspender', action: 'suspend', admin: true, danger: false, condition: person?.status === 'ativo' },
        { icon: 'play-circle', label: 'Reativar', action: 'reactivate', admin: true, condition: person?.status === 'suspenso' || person?.status === 'inativo' },
        { icon: 'user-x', label: 'Remover do time', action: 'remove', admin: true, danger: true, condition: !isSelf }
      ];

      const menu = document.getElementById('rhContextMenu');
      if (!menu) return;

      const filteredItems = items.filter(item => {
        if (item.divider) return true;
        if (item.condition === false) return false;
        if (item.admin && !isOwner) return false;
        return true;
      });

      menu.innerHTML = `
        <div class="rh-ctx-header" style="padding:8px 12px;border-bottom:1px solid var(--border-subtle);font-size:0.72rem;color:var(--text-muted);font-weight:600;">
          ${S._esc(personName)}
        </div>
        ${filteredItems.map(item => {
          if (item.divider) return '<div style="height:1px;background:var(--border-subtle);margin:4px 0;"></div>';
          return `
            <button class="rh-ctx-item ${item.danger ? 'rh-ctx-danger' : ''}" data-action="${item.action}" data-person="${personId}">
              <i data-lucide="${item.icon}" style="width:14px;height:14px;"></i>
              <span>${item.label}</span>
            </button>`;
        }).join('')}
      `;

      // Posicionar menu (viewport-aware)
      const menuW = 200, menuH = filteredItems.length * 36 + 40;
      const vw = window.innerWidth, vh = window.innerHeight;
      const posX = x + menuW > vw ? x - menuW : x;
      const posY = y + menuH > vh ? Math.max(8, y - menuH) : y;

      menu.style.cssText = `display:block;position:fixed;top:${posY}px;left:${posX}px;z-index:1100;min-width:${menuW}px;`;
      if (window.lucide) lucide.createIcons();

      // Fechar ao clicar fora
      const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
          menu.style.display = 'none';
          document.removeEventListener('click', closeMenu);
        }
      };
      setTimeout(() => document.addEventListener('click', closeMenu), 10);
    },

    // ── Handler de acoes do context menu ──────────────────────────────
    async _handleContextAction(action, personId) {
      const person = S._getPerson(personId);
      if (!person) return;

      switch (action) {
        case 'view_profile':
          TBO_ROUTER.navigate(`people/${personId}/overview`);
          break;

        case 'change_role':
          // TODO: Modal para selecionar novo role RBAC (carregado de roles table)
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Em desenvolvimento', 'Alterar role RBAC sera implementado com o Admin Portal completo.');
          break;

        case 'change_cargo':
          const newCargo = prompt(`Novo cargo para ${person.nome}:`, person.cargo);
          if (newCargo && newCargo !== person.cargo) {
            // Atualizar no Supabase se disponivel
            if (typeof TBO_SUPABASE !== 'undefined') {
              try {
                const client = TBO_SUPABASE.getClient();
                if (client && person.supabaseId) {
                  await client.from('profiles').update({ role: newCargo }).eq('id', person.supabaseId);
                  person.cargo = newCargo;
                  if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Cargo atualizado!');
                  this._refreshVisaoGeral();
                  return;
                }
              } catch (e) { console.warn('[RH] Erro ao atualizar cargo:', e.message); }
            }
            person.cargo = newCargo;
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Cargo atualizado (local)');
            this._refreshVisaoGeral();
          }
          break;

        case 'change_squad':
          const bus = S._getBUs();
          const newBU = prompt(`Mover ${person.nome} para qual squad/BU?\nOpcoes: ${bus.join(', ')}`, person.bu);
          if (newBU !== null && newBU !== person.bu) {
            if (typeof TBO_SUPABASE !== 'undefined') {
              try {
                const client = TBO_SUPABASE.getClient();
                if (client && person.supabaseId) {
                  await client.from('profiles').update({ bu: newBU }).eq('id', person.supabaseId);
                  person.bu = newBU;
                  if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Squad atualizado!');
                  this._refreshVisaoGeral();
                  return;
                }
              } catch (e) { console.warn('[RH] Erro ao atualizar squad:', e.message); }
            }
            person.bu = newBU;
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Squad atualizado (local)');
            this._refreshVisaoGeral();
          }
          break;

        case 'suspend':
          if (confirm(`Suspender ${person.nome}? O usuario perdera acesso ao sistema.`)) {
            if (typeof TBO_SUPABASE !== 'undefined') {
              try {
                const client = TBO_SUPABASE.getClient();
                if (client && person.supabaseId) {
                  await client.from('profiles').update({ is_active: false }).eq('id', person.supabaseId);
                }
              } catch (e) { console.warn('[RH] Erro ao suspender:', e.message); }
            }
            person.status = 'suspenso';
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Usuario suspenso');
            this._refreshVisaoGeral();
          }
          break;

        case 'reactivate':
          if (typeof TBO_SUPABASE !== 'undefined') {
            try {
              const client = TBO_SUPABASE.getClient();
              if (client && person.supabaseId) {
                await client.from('profiles').update({ is_active: true }).eq('id', person.supabaseId);
              }
            } catch (e) { console.warn('[RH] Erro ao reativar:', e.message); }
          }
          person.status = 'ativo';
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Usuario reativado!');
          this._refreshVisaoGeral();
          break;

        case 'remove':
          if (confirm(`ATENCAO: Remover ${person.nome} do time? Esta acao pode ser revertida apenas pelo admin.`)) {
            if (typeof TBO_SUPABASE !== 'undefined') {
              try {
                const client = TBO_SUPABASE.getClient();
                if (client && person.supabaseId) {
                  await client.from('profiles').update({ is_active: false }).eq('id', person.supabaseId);
                }
              } catch (e) { console.warn('[RH] Erro ao remover:', e.message); }
            }
            person.status = 'removido';
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Usuario removido do time');
            this._refreshVisaoGeral();
          }
          break;

        case 'resend_invite':
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Em desenvolvimento', 'Reenvio de convite sera implementado com o sistema de onboarding.');
          break;
      }
    },

    // ── Refresh helper (re-renderiza conteudo da visao geral) ──────────
    _refreshVisaoGeral() {
      const content = document.getElementById('rhVisaoGeralContent');
      if (content) {
        const team = S._getInternalTeam();
        const reviews = S._getStore('avaliacoes_people');
        content.innerHTML = this._renderVisaoGeralContent(team, reviews);
        this._bindVisaoGeralContent();
        if (window.lucide) lucide.createIcons();
      }
    },

    // ── Server-side reload (para sort/filter/pagination) ──────────────
    async _reloadTeamServerSide() {
      S._teamLoaded = false;
      await S._loadTeamFromSupabase({ force: true });
      // Re-renderizar toda a visao geral (com novos dados e paginacao)
      const tabContent = document.getElementById('rhTabContent');
      if (tabContent) {
        tabContent.innerHTML = this.render();
        this.init();
      }
    },

    // ── KPIs async (custo mensal, projetos ativos) ──────────────────────
    async _loadDashboardKPIs() {
      if (!S._isAdmin() || typeof PeopleRepo === 'undefined') return;
      try {
        const kpis = await PeopleRepo.getDashboardKPIs();
        const fmt = typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER : { currency: v => `R$ ${Number(v).toLocaleString('pt-BR', {minimumFractionDigits:0})}` };

        // Atualizar KPI Custo Mensal
        const custoEl = document.getElementById('rhKPICusto');
        const custoSubEl = document.getElementById('rhKPICustoSub');
        if (custoEl) custoEl.textContent = fmt.currency(kpis.custoMensalTotal);
        if (custoSubEl) {
          const equipes = kpis.custoEquipe.sort((a, b) => b.custo - a.custo).slice(0, 3);
          custoSubEl.textContent = equipes.map(e => `${e.name}: ${fmt.currency(e.custo)}`).join(' \u00B7 ');
        }
      } catch (e) {
        console.warn('[RH] Erro ao carregar KPIs:', e.message);
        const custoEl = document.getElementById('rhKPICusto');
        if (custoEl) custoEl.textContent = '\u2014';
      }
    },

    // ── Projetos ativos por pessoa (async, preenche placeholders na tabela) ──
    async _loadProjectCounts() {
      if (typeof PeopleRepo === 'undefined') return;
      try {
        const userIds = S._team.map(p => p.supabaseId).filter(Boolean);
        if (!userIds.length) return;
        const counts = await PeopleRepo.getActiveProjectCounts(userIds);
        // Preencher placeholders na tabela
        document.querySelectorAll('[data-user-projects]').forEach(td => {
          const uid = td.dataset.userProjects;
          const count = counts[uid] || 0;
          td.innerHTML = count > 0
            ? `<span style="font-weight:600;color:var(--brand-primary);">${count}</span>`
            : '<span style="color:var(--text-muted);">0</span>';
        });
      } catch (e) {
        console.warn('[RH] Erro ao carregar contagem de projetos:', e.message);
        document.querySelectorAll('[data-user-projects]').forEach(td => {
          td.innerHTML = '<span style="color:var(--text-muted);">\u2014</span>';
        });
      }
    },

    // ── Widget Aniversariantes do M\u00EAs (P2) ─────────────────────────────
    async _loadBirthdayWidget() {
      const container = document.getElementById('rhBirthdayWidget');
      if (!container) return;

      try {
        // Buscar todas as pessoas com birth_date do tenant
        const team = S._team;
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-based
        const currentDay = now.getDate();

        // Filtrar aniversariantes do m\u00EAs (usar birth_date dos dados carregados ou buscar)
        let birthdays = [];

        if (typeof PeopleRepo !== 'undefined') {
          // Buscar todos os profiles com birth_date
          const { data: profiles } = await PeopleRepo.listPaginated({ pageSize: 100, filterStatus: 'active' });
          birthdays = (profiles || [])
            .filter(p => p.birth_date)
            .map(p => {
              const bd = new Date(p.birth_date + 'T12:00:00');
              return { ...p, birthMonth: bd.getMonth(), birthDay: bd.getDate() };
            })
            .filter(p => p.birthMonth === currentMonth)
            .sort((a, b) => a.birthDay - b.birthDay);
        }

        if (!birthdays.length) {
          container.innerHTML = ''; // Sem aniversariantes, n\u00E3o mostrar widget
          return;
        }

        const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
        const monthNames = ['Janeiro', 'Fevereiro', 'Mar\u00E7o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        container.innerHTML = `
          <div class="card" style="margin-bottom:16px;padding:16px 20px;background:linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(59,130,246,0.04) 100%);border:1px solid rgba(245,158,11,0.15);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <span style="font-size:1.2rem;">\uD83C\uDF82</span>
              <h3 style="font-size:0.88rem;margin:0;font-weight:700;">Aniversariantes de ${monthNames[currentMonth]}</h3>
              <span class="tag" style="font-size:0.65rem;background:var(--accent-gold)15;color:var(--accent-gold);">${birthdays.length}</span>
            </div>
            <div style="display:flex;gap:12px;overflow-x:auto;padding:4px 0;">
              ${birthdays.map(p => {
                const teamName = p.teams?.name || p.bu || '';
                const color = buColors[teamName] || 'var(--accent-gold)';
                const initials = (p.full_name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const isToday = p.birthDay === currentDay;
                const isPast = p.birthDay < currentDay;

                return `
                  <div style="flex-shrink:0;text-align:center;padding:10px 14px;background:${isToday ? 'var(--accent-gold)10' : 'var(--bg-elevated)'};border:1px solid ${isToday ? 'var(--accent-gold)30' : 'var(--border-subtle)'};border-radius:10px;min-width:80px;cursor:pointer;transition:border-color 0.15s;${isPast ? 'opacity:0.6;' : ''}" data-person-id="${p.id}">
                    ${p.avatar_url
                      ? `<img src="${S._esc(p.avatar_url)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;margin-bottom:6px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                        + `<div style="width:36px;height:36px;border-radius:50%;background:${color}20;color:${color};display:none;align-items:center;justify-content:center;font-weight:700;font-size:0.7rem;margin:0 auto 6px;">${initials}</div>`
                      : `<div style="width:36px;height:36px;border-radius:50%;background:${color}20;color:${color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.7rem;margin:0 auto 6px;">${initials}</div>`
                    }
                    <div style="font-size:0.72rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px;">${S._esc((p.full_name || '').split(' ')[0])}</div>
                    <div style="font-size:0.85rem;font-weight:800;color:${isToday ? 'var(--accent-gold)' : 'var(--text-secondary)'};">${p.birthDay}/${String(currentMonth + 1).padStart(2, '0')}</div>
                    ${isToday ? '<div style="font-size:0.58rem;color:var(--accent-gold);font-weight:700;margin-top:2px;">HOJE! \uD83C\uDF89</div>' : ''}
                  </div>`;
              }).join('')}
            </div>
          </div>`;

        // Bind hover card nos aniversariantes
        if (typeof TBO_HOVER_CARD !== 'undefined') TBO_HOVER_CARD.bind(container);
        if (window.lucide) lucide.createIcons();
      } catch (e) {
        console.warn('[RH] Erro ao carregar aniversariantes:', e.message);
        container.innerHTML = '';
      }
    },

    // ── Cards Grid (view original) ────────────────────────────────────
    _renderPeopleCards(team, reviews) {
      const cards = team.map(person => {
        const review = reviews.find(r => r.pessoaId === person.id);
        const score = review ? review.mediaGeral.toFixed(1) : '\u2014';
        const scoreColor = review ? (review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)') : 'var(--text-muted)';
        const buLabel = person.bu || 'Geral';
        const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
        const buColor = buColors[person.bu] || 'var(--text-muted)';

        return `
          <div class="rh-person-card" data-person="${person.id}" data-bu="${person.bu || ''}" data-status="${person.status || 'active'}">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              ${S._getAvatarHTML(person, 40, '0.85rem')}
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${S._esc(person.nome)}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);">${S._esc(person.cargo)}</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:1.2rem;font-weight:800;color:${scoreColor};">${score}</div>
                <div style="font-size:0.6rem;color:var(--text-muted);">score</div>
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
              <span class="tag" style="font-size:0.62rem;background:${buColor}15;color:${buColor};">${buLabel}</span>
              ${person.nivel ? `<span class="tag" style="font-size:0.62rem;">${S._esc(person.nivel)}</span>` : ''}
              ${person.lider ? `<span style="font-size:0.62rem;color:var(--text-muted);">lider: ${S._getPersonName(person.lider)}</span>` : '<span class="tag" style="font-size:0.62rem;background:var(--accent-gold)20;color:var(--accent-gold);">Diretor</span>'}
            </div>
          </div>`;
      }).join('');

      return `<div class="rh-people-grid" id="rhPeopleGrid">${cards}</div>`;
    },

    // ── Drawer de Perfil (Asana-style) ─────────────────────────────────
    _renderPersonDrawer(personId) {
      const person = S._getPerson(personId);
      if (!person) return '';
      const reviews = S._getStore('avaliacoes_people');
      const review = reviews.find(r => r.pessoaId === personId);
      const feedbacks = S._getStore('feedbacks').filter(f => f.para === personId || f.de === personId);
      const elogios = S._getStore('elogios').filter(e => e.para === personId);
      const oneOnOnes = S._getStore('1on1s').filter(o => o.lider === personId || o.colaborador === personId);
      const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
      const buColor = buColors[person.bu] || 'var(--accent-gold)';

      // Colaboradores frequentes: quem esta na mesma BU ou compartilha 1:1s
      const colleagues = S._getInternalTeam().filter(t => t.id !== person.id && (t.bu === person.bu || t.lider === person.id || person.lider === t.id)).slice(0, 6);

      // Metas reais do PDI (person_tasks category='pdi') — carregadas async
      const metas = this._personPDICache?.[personId] || [];

      // Projetos reais — carregados async via _loadPersonProjects()
      const projetos = this._personProjectsCache?.[personId] || [];

      // Skills da pessoa — carregadas async via _loadPersonSkills()
      const skills = this._personSkillsCache?.[personId] || [];

      return `
        <div class="rh-drawer-content rh-profile-asana">
          <!-- Header Asana-style com banner -->
          <div class="rh-profile-header" style="background:linear-gradient(135deg, ${buColor}15 0%, ${buColor}05 100%);margin:-24px -24px 0;padding:20px 24px 16px;border-bottom:1px solid var(--border-subtle);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div style="display:flex;align-items:center;gap:16px;">
                ${S._getAvatarHTML(person, 72, '1.5rem')}
                <div>
                  <div style="font-weight:800;font-size:1.15rem;margin-bottom:2px;">${S._esc(person.nome)}</div>
                  <div style="font-size:0.82rem;color:var(--text-muted);">${S._esc(person.cargo)}</div>
                  <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                    ${person.bu ? `<span class="tag" style="font-size:0.65rem;background:${buColor}15;color:${buColor};">${person.bu}</span>` : ''}
                    ${person.nivel ? `<span class="tag" style="font-size:0.65rem;">${S._esc(person.nivel)}</span>` : ''}
                    <span class="tag" style="font-size:0.65rem;background:var(--color-success)20;color:var(--color-success);">${person.status || 'ativo'}</span>
                  </div>
                </div>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0;">
                ${S._isAdmin() ? `<button class="btn btn-secondary btn-sm" id="rhEditPerson" data-person="${personId}" title="Editar pessoa" style="font-size:0.68rem;padding:3px 10px;">
                  <i data-lucide="pencil" style="width:12px;height:12px;"></i> Editar
                </button>` : ''}
                <button class="btn btn-primary btn-sm" id="rhOpenFullProfile" data-person="${personId}" title="Ver perfil completo" style="font-size:0.68rem;padding:3px 10px;">
                  <i data-lucide="external-link" style="width:12px;height:12px;"></i> Perfil
                </button>
                <button class="btn btn-secondary btn-sm" id="rhCloseDrawer"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
              </div>
            </div>
            ${person.email ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:8px;margin-left:88px;"><i data-lucide="mail" style="width:12px;height:12px;vertical-align:-2px;margin-right:4px;"></i>${S._esc(person.email)}</div>` : ''}
            ${person.lider ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;margin-left:88px;"><i data-lucide="user" style="width:12px;height:12px;vertical-align:-2px;margin-right:4px;"></i>Reporta a: <strong>${S._getPersonName(person.lider)}</strong></div>` : ''}
          </div>

          <!-- Dados do Onboarding (carrega async do Supabase) -->
          <div id="rhOnboardingData" style="margin-top:16px;"></div>

          <!-- Formulario de edicao (hidden por default) -->
          <div id="rhEditPersonForm" style="display:none;margin-top:16px;padding:20px;background:var(--bg-elevated);border-radius:12px;border:1px solid var(--border-subtle);">
            <h4 style="font-size:0.9rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:6px;"><i data-lucide="pencil" style="width:16px;height:16px;color:var(--accent-gold);"></i> Editar Dados</h4>
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Nome Completo</label><input type="text" class="form-input" id="editFullName" value="${S._esc(person.nome || '')}" style="font-size:0.8rem;padding:8px 12px;"></div>
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Cargo</label><input type="text" class="form-input" id="editCargo" value="${S._esc(person.cargo || '')}" style="font-size:0.8rem;padding:8px 12px;"></div>
            </div>
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">BU / Equipe</label>
                <select class="form-input" id="editBU" style="font-size:0.8rem;padding:8px 12px;">
                  <option value="">Sem equipe</option>
                  ${(S._teamsCache || []).filter(t => t.is_active !== false).map(t => `<option value="${t.id}" ${t.name === person.bu ? 'selected' : ''}>${t.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Status</label>
                <select class="form-input" id="editStatus" style="font-size:0.8rem;padding:8px 12px;">
                  <option value="active" ${person.status === 'active' ? 'selected' : ''}>Ativo</option>
                  <option value="inactive" ${person.status === 'inactive' ? 'selected' : ''}>Inativo</option>
                  <option value="vacation" ${person.status === 'vacation' ? 'selected' : ''}>Ferias</option>
                  <option value="away" ${person.status === 'away' ? 'selected' : ''}>Ausente</option>
                  <option value="onboarding" ${person.status === 'onboarding' ? 'selected' : ''}>Onboarding</option>
                  <option value="offboarding" ${person.status === 'offboarding' ? 'selected' : ''}>Offboarding</option>
                  <option value="suspended" ${person.status === 'suspended' ? 'selected' : ''}>Suspenso</option>
                  <option value="desligado" ${person.status === 'desligado' ? 'selected' : ''}>Desligado</option>
                </select>
              </div>
            </div>
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Salario PJ (R$)</label><input type="number" class="form-input" id="editSalary" value="${person.custoMensal || ''}" step="0.01" min="0" style="font-size:0.8rem;padding:8px 12px;"></div>
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Telefone</label><input type="text" class="form-input" id="editPhone" value="${S._esc(person.phone || '')}" style="font-size:0.8rem;padding:8px 12px;"></div>
            </div>
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Gestor</label>
                <select class="form-input" id="editManager" style="font-size:0.8rem;padding:8px 12px;">
                  <option value="">Sem gestor</option>
                  ${S._getInternalTeam().filter(t => t.id !== person.id).map(t => `<option value="${t.supabaseId}" ${t.supabaseId === person.gestorId ? 'selected' : ''}>${t.nome}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Tipo de Contrato</label>
                <select class="form-input" id="editContractType" style="font-size:0.8rem;padding:8px 12px;">
                  <option value="">Nao definido</option>
                  <option value="pj" ${person.contractType === 'pj' ? 'selected' : ''}>PJ</option>
                  <option value="clt" ${person.contractType === 'clt' ? 'selected' : ''}>CLT</option>
                  <option value="freelancer" ${person.contractType === 'freelancer' ? 'selected' : ''}>Freelancer</option>
                  <option value="estagio" ${person.contractType === 'estagio' ? 'selected' : ''}>Estagio</option>
                </select>
              </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:16px;">
              <button class="btn btn-primary btn-sm" id="rhSavePersonEdit" data-supabase-id="${person.supabaseId}" style="font-size:0.78rem;padding:6px 16px;"><i data-lucide="check" style="width:14px;height:14px;"></i> Salvar</button>
              <button class="btn btn-secondary btn-sm" id="rhCancelPersonEdit" style="font-size:0.78rem;padding:6px 16px;">Cancelar</button>
            </div>
          </div>

          <!-- Layout 2 colunas estilo Asana -->
          <div id="rhDrawerReadOnly" style="display:grid;grid-template-columns:1fr;gap:16px;margin-top:16px;">

            <!-- Minhas Tarefas -->
            <div class="rh-profile-section">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <div style="font-weight:700;font-size:0.88rem;display:flex;align-items:center;gap:6px;">
                  <i data-lucide="check-circle" style="width:16px;height:16px;color:var(--color-success);"></i> Tarefas
                </div>
                <button class="btn btn-primary btn-sm" id="rhNewPersonTask" style="font-size:0.66rem;padding:3px 10px;">+ Nova</button>
              </div>
              <div id="rhPersonTaskForm" style="display:none;margin-bottom:12px;padding:12px;background:var(--bg-primary);border-radius:var(--radius-md, 8px);border:1px solid var(--border-subtle);">
                <input type="text" class="form-input" id="ptTitle" placeholder="Titulo da tarefa..." style="font-size:0.78rem;padding:6px 10px;margin-bottom:8px;">
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                  <select class="form-input" id="ptPriority" style="font-size:0.72rem;padding:4px 8px;flex:1;">
                    <option value="media">Media</option><option value="alta">Alta</option><option value="baixa">Baixa</option>
                  </select>
                  <select class="form-input" id="ptCategory" style="font-size:0.72rem;padding:4px 8px;flex:1;">
                    <option value="general">Geral</option><option value="pdi">PDI</option><option value="onboarding">Onboarding</option><option value="1on1_action">Acao 1:1</option>
                  </select>
                  <input type="date" class="form-input" id="ptDueDate" style="font-size:0.72rem;padding:4px 8px;flex:1;">
                </div>
                <div style="display:flex;gap:8px;">
                  <button class="btn btn-primary btn-sm" id="ptSave" style="font-size:0.66rem;padding:3px 10px;">Salvar</button>
                  <button class="btn btn-secondary btn-sm" id="ptCancel" style="font-size:0.66rem;padding:3px 10px;">Cancelar</button>
                </div>
              </div>
              <div id="rhPersonTaskList" data-person="${personId}">
                <div style="text-align:center;padding:12px;font-size:0.72rem;color:var(--text-muted);">
                  <i data-lucide="loader" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i> Carregando...
                </div>
              </div>
            </div>

            <!-- Meus Projetos Recentes (carregado async) -->
            <div class="rh-profile-section">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="folder" style="width:16px;height:16px;color:var(--color-info);"></i> Projetos Recentes
              </div>
              <div id="rhDrawerProjects" data-person="${personId}">
                <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;vertical-align:-2px;"></i> Carregando projetos...</div>
              </div>
            </div>

            <!-- Skills & Compet\u00EAncias (carregado async) -->
            <div class="rh-profile-section">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="zap" style="width:16px;height:16px;color:var(--color-purple, #8b5cf6);"></i> Compet\u00EAncias
              </div>
              <div id="rhDrawerSkills" data-person="${personId}">
                <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;vertical-align:-2px;"></i> Carregando skills...</div>
              </div>
            </div>

            <!-- Metas / PDI (carregado async) -->
            <div class="rh-profile-section">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="target" style="width:16px;height:16px;color:var(--accent-gold);"></i> Metas & PDI
              </div>
              <div id="rhDrawerMetas" data-person="${personId}">
                <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;vertical-align:-2px;"></i> Carregando metas...</div>
              </div>
            </div>

            <!-- Historico de Compensacao (carregado async) -->
            <div class="rh-profile-section">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="trending-up" style="width:16px;height:16px;color:var(--color-success);"></i> Hist\u00F3rico
              </div>
              <div id="rhDrawerHistory" data-person="${personId}">
                <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;vertical-align:-2px;"></i> Carregando hist\u00F3rico...</div>
              </div>
            </div>

            ${review ? `
            <!-- Performance (compacto) -->
            <div class="rh-profile-section">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="bar-chart-3" style="width:16px;height:16px;color:var(--color-purple, #8b5cf6);"></i> Performance
              </div>
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px;">
                <div style="font-size:2rem;font-weight:800;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${review.mediaGeral.toFixed(1)}</div>
                <div style="flex:1;">
                  ${['Auto|autoMedia|var(--color-info)', 'Gestor|gestorMedia|var(--accent-gold)', 'Pares|paresMedia|var(--color-purple, #8b5cf6)'].map(s => {
                    const [l, k, c] = s.split('|');
                    return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;"><span style="font-size:0.68rem;width:40px;color:var(--text-muted);">${l}</span><div style="flex:1;height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${(review[k] / 5) * 100}%;background:${c};border-radius:2px;"></div></div><span style="font-size:0.68rem;font-weight:600;">${review[k].toFixed(1)}</span></div>`;
                  }).join('')}
                </div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${(review.destaques || []).map(d => `<span class="tag" style="font-size:0.6rem;background:var(--color-success-dim);color:var(--color-success);">${d}</span>`).join('')}
                ${(review.gaps || []).map(g => `<span class="tag" style="font-size:0.6rem;background:var(--color-warning-dim);color:var(--color-warning);">${g}</span>`).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Colaboradores Frequentes -->
            <div class="rh-profile-section">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="users" style="width:16px;height:16px;color:var(--text-muted);"></i> Colaboradores Frequentes
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${colleagues.map(c => `
                  <div class="rh-colleague-chip rh-person-row" data-person="${c.id}" style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--bg-elevated);border-radius:20px;cursor:pointer;transition:background 0.15s;">
                    ${S._getAvatarHTML(c, 24, '0.6rem')}
                    <span style="font-size:0.72rem;font-weight:500;">${S._esc(c.nome.split(' ')[0])}</span>
                  </div>
                `).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Nenhum</div>'}
              </div>
            </div>

            <!-- Academy / Elogios -->
            <div class="rh-profile-section">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="award" style="width:16px;height:16px;color:var(--accent-gold);"></i> Reconhecimentos & Academy
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
                ${elogios.slice(0, 4).map(e => {
                  const v = S._valores.find(v2 => v2.id === e.valor);
                  return `<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-elevated);border-radius:6px;font-size:0.72rem;">${v ? v.emoji : '\u2B50'} ${v ? v.nome : ''}</div>`;
                }).join('') || '<span style="font-size:0.72rem;color:var(--text-muted);">Nenhum reconhecimento</span>'}
              </div>
              ${review && review.destaques ? `
              <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">Habilidades desenvolvidas:</div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${review.destaques.map(d => `<span class="tag" style="font-size:0.62rem;">${d}</span>`).join('')}
              </div>` : ''}
            </div>
          </div>
        </div>
      `;
    },

    _renderMiniRadar(review) {
      const size = 140, cx = size / 2, cy = size / 2, r = 50;
      const comps = S._competenciasRadar;
      const n = comps.length;
      const angleStep = (2 * Math.PI) / n;
      const getPoint = (i, val) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const dist = (val / 5) * r;
        return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
      };
      let grid = '';
      for (let level = 1; level <= 5; level++) {
        const pts = [];
        for (let i = 0; i < n; i++) pts.push(getPoint(i, level));
        grid += `<polygon points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="var(--border-subtle)" stroke-width="0.5"/>`;
      }
      const gestorPts = comps.map((c, i) => getPoint(i, review.gestorScores.find(s => s.comp === c.id)?.nota || 0));
      return `<svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:140px;margin:8px auto 0;display:block;">
        ${grid}
        <polygon points="${gestorPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(232,81,2,0.15)" stroke="var(--accent-gold)" stroke-width="1.5"/>
      </svg>`;
    },

    // ── Drawer: Carregar dados do onboarding da pessoa (tabela colaboradores) ──
    async _loadPersonOnboardingData(personId) {
      const container = document.getElementById('rhOnboardingData');
      if (!container) return;

      if (typeof TBO_SUPABASE === 'undefined') return;
      try {
        const client = TBO_SUPABASE.getClient();
        const person = S._getPerson(personId);
        if (!client || !person) return;

        // Buscar por email no colaboradores
        const email = person.email;
        if (!email) return;

        const { data, error } = await client
          .from('colaboradores')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (error || !data) return;

        // Renderizar dados do onboarding
        const fields = [];
        if (data.telefone) fields.push({ icon: 'phone', label: 'Telefone', value: data.telefone });
        if (data.tipo_contrato) fields.push({ icon: 'file-text', label: 'Contrato', value: data.tipo_contrato });
        if (data.data_inicio) fields.push({ icon: 'calendar', label: 'Inicio', value: new Date(data.data_inicio).toLocaleDateString('pt-BR') });
        if (data.tipo_onboarding) fields.push({ icon: 'compass', label: 'Onboarding', value: data.tipo_onboarding });
        if (data.quiz_score_final) fields.push({ icon: 'award', label: 'Quiz Score', value: `${data.quiz_score_final}%` });

        if (fields.length) {
          container.innerHTML = `
            <div class="rh-profile-section">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="clipboard-list" style="width:16px;height:16px;color:var(--color-info);"></i> Dados do Onboarding
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                ${fields.map(f => `
                  <div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--bg-primary);border-radius:6px;">
                    <i data-lucide="${f.icon}" style="width:12px;height:12px;color:var(--text-muted);flex-shrink:0;"></i>
                    <div>
                      <div style="font-size:0.62rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.3px;">${f.label}</div>
                      <div style="font-size:0.78rem;font-weight:500;">${S._esc(f.value)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>`;
          if (window.lucide) lucide.createIcons();
        }
      } catch (e) {
        console.warn('[RH] Erro ao carregar dados onboarding:', e.message);
      }
    },

    // ── Drawer: Carregar projetos reais da pessoa (Fase B + Notion) ──
    async _loadPersonProjects(personId) {
      const container = document.getElementById('rhDrawerProjects');
      if (!container) return;
      try {
        const person = S._getPerson(personId);
        if (!person) { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>'; return; }

        let projects = [];

        // 1. Tentar buscar projetos do Notion (fonte primaria)
        if (typeof NotionIntegration !== 'undefined') {
          try {
            const notionProjects = NotionIntegration.getProjectsByBU(person.bu || person.area || '');
            if (notionProjects.length) {
              projects = notionProjects.slice(0, 6).map(p => ({
                nome: p.nome,
                cliente: p.construtora,
                status: p.status || 'Em Andamento',
                cor: p.status === 'Conclu\u00EDdo' ? 'var(--color-success)' : p.status === 'Parado' ? 'var(--color-warning)' : 'var(--color-info)',
                url: p.url,
                _source: 'notion'
              }));
            }
          } catch { /* fallback abaixo */ }
        }

        // 2. Fallback: buscar via ProjectsRepo (Supabase)
        if (!projects.length && typeof ProjectsRepo !== 'undefined') {
          try {
            const { data } = await ProjectsRepo.list({ limit: 50 });
            projects = (data || []).filter(p =>
              (p.members || []).some(m => m.user_id === person.supabaseId) ||
              p.team === person.bu
            ).slice(0, 6).map(p => ({
              nome: p.name || p.title,
              cliente: p.client || '',
              status: p.status || 'em_andamento',
              cor: p.status === 'concluido' || p.status === 'completed' ? 'var(--color-success)' : 'var(--color-info)',
              _source: 'supabase'
            }));
          } catch { /* fallback abaixo */ }
        }

        // 3. Tambem buscar demandas da pessoa no Notion
        let demandas = [];
        if (typeof NotionIntegration !== 'undefined') {
          try {
            demandas = NotionIntegration.getDemandasByPerson(person.nome || person.email || '').slice(0, 4);
          } catch { /* sem demandas */ }
        }

        if (!projects.length && !demandas.length) {
          container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Nenhum projeto vinculado</div>';
          return;
        }

        let html = '';

        // Projetos
        if (projects.length) {
          html += projects.map(pj => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--bg-elevated);border-radius:6px;margin-bottom:6px;${pj.url ? 'cursor:pointer;' : ''}" ${pj.url ? `onclick="window.open('${pj.url}','_blank')"` : ''}>
              <div style="width:8px;height:8px;border-radius:50%;background:${pj.cor};flex-shrink:0;"></div>
              <div style="flex:1;">
                <div style="font-size:0.8rem;font-weight:500;">${S._esc(pj.nome)}</div>
                ${pj.cliente ? `<div style="font-size:0.65rem;color:var(--text-muted);">${S._esc(pj.cliente)}</div>` : ''}
              </div>
              <span class="tag" style="font-size:0.6rem;background:${pj.cor}20;color:${pj.cor};">${S._esc(pj.status)}</span>
            </div>
          `).join('');
        }

        // Demandas ativas
        if (demandas.length) {
          html += `<div style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);margin-top:10px;margin-bottom:6px;">Demandas Ativas</div>`;
          html += demandas.map(d => {
            const statusColor = d.status === 'Desenvolvimento' ? 'var(--color-info)' : d.status === 'Revis\u00E3o Interna' ? 'var(--color-warning)' : 'var(--text-muted)';
            return `
              <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg-elevated);border-radius:6px;margin-bottom:4px;${d.url ? 'cursor:pointer;' : ''}" ${d.url ? `onclick="window.open('${d.url}','_blank')"` : ''}>
                <i data-lucide="file-text" style="width:12px;height:12px;color:var(--text-muted);flex-shrink:0;"></i>
                <div style="flex:1;font-size:0.75rem;">${S._esc(d.demanda)}</div>
                <span style="font-size:0.58rem;color:${statusColor};">${S._esc(d.status)}</span>
              </div>
            `;
          }).join('');
        }

        container.innerHTML = html;
        if (window.lucide) lucide.createIcons();
      } catch (e) {
        console.warn('[RH] Erro ao carregar projetos:', e.message);
        container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>';
      }
    },

    // ── Drawer: Carregar skills da pessoa (Fase G) ──
    async _loadPersonSkills(personId) {
      const container = document.getElementById('rhDrawerSkills');
      if (!container) return;
      try {
        const person = S._getPerson(personId);
        const uid = person?.supabaseId || personId;

        let skills = [];
        if (typeof SkillsRepo !== 'undefined') {
          try { skills = await SkillsRepo.getForPerson(uid); } catch { /* sem skills */ }
        }

        if (!skills.length) {
          container.innerHTML = `
            <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">Nenhuma compet\u00EAncia registrada</div>
            ${S._isAdmin() ? `<button class="btn btn-secondary btn-sm rh-add-skill" data-person="${personId}" style="font-size:0.66rem;padding:2px 8px;"><i data-lucide="plus" style="width:10px;height:10px;"></i> Adicionar</button>` : ''}
          `;
          if (window.lucide) lucide.createIcons();
          return;
        }

        const levelLabels = ['', 'B\u00E1sico', 'Intermedi\u00E1rio', 'Avan\u00E7ado', 'Expert', 'Master'];
        const levelColors = ['', 'var(--text-muted)', 'var(--color-info)', 'var(--accent-gold)', 'var(--color-success)', 'var(--color-purple, #8b5cf6)'];

        container.innerHTML = `
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
            ${skills.map(s => `
              <span class="tag" style="font-size:0.62rem;background:${levelColors[s.proficiency_level] || 'var(--text-muted)'}15;color:${levelColors[s.proficiency_level] || 'var(--text-muted)'};">
                ${S._esc(s.skill_name)} \u00B7 ${levelLabels[s.proficiency_level] || 'Nv' + s.proficiency_level}
                ${s.certification_name ? ' \uD83D\uDCDC' : ''}
              </span>
            `).join('')}
          </div>
          ${S._isAdmin() ? `<button class="btn btn-secondary btn-sm rh-add-skill" data-person="${personId}" style="font-size:0.66rem;padding:2px 8px;"><i data-lucide="plus" style="width:10px;height:10px;"></i> Adicionar</button>` : ''}
        `;
        if (window.lucide) lucide.createIcons();
      } catch (e) {
        console.warn('[RH] Erro ao carregar skills:', e.message);
        container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>';
      }
    },

    // ── Drawer: Carregar metas/PDI reais (Fase D) ──
    async _loadPersonHistory(personId) {
      const container = document.getElementById('rhDrawerMetas');
      if (!container) return;
      try {
        const person = S._getPerson(personId);
        const uid = person?.supabaseId || personId;

        // Buscar person_tasks com category='pdi'
        let metas = [];
        if (typeof RepoBase !== 'undefined') {
          try {
            const db = RepoBase.getDb();
            const tid = RepoBase.requireTenantId();
            const { data } = await db.from('person_tasks')
              .select('id, title, status, description, category, due_date, completed_at')
              .eq('tenant_id', tid)
              .eq('person_id', uid)
              .eq('category', 'pdi')
              .order('created_at', { ascending: false });

            metas = (data || []).map(t => {
              const progresso = t.status === 'completed' ? 100 : t.status === 'in_progress' ? 50 : 10;
              return { id: t.id, nome: t.title, progresso, prazo: t.due_date || '', status: t.status };
            });
          } catch { /* sem metas */ }
        }

        // Fallback: metas dos gaps da review
        if (!metas.length) {
          const reviews = S._getStore('avaliacoes_people');
          const review = reviews.find(r => r.pessoaId === personId);
          if (review && review.gaps) {
            metas = review.gaps.map((g, i) => ({
              id: `gap-${i}`, nome: `Desenvolver ${g}`, progresso: 20, prazo: '2026-06-30', status: 'pending'
            }));
          }
        }

        if (!metas.length) {
          container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem metas / PDI definidos</div>';
          return;
        }

        container.innerHTML = metas.map(m => `
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px;">
              <span>${S._esc(m.nome)}</span>
              <span style="font-weight:600;color:${m.progresso >= 75 ? 'var(--color-success)' : m.progresso >= 40 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${m.progresso}%</span>
            </div>
            <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${m.progresso}%;background:${m.progresso >= 75 ? 'var(--color-success)' : m.progresso >= 40 ? 'var(--accent-gold)' : 'var(--color-danger)'};border-radius:3px;transition:width 0.3s;"></div>
            </div>
          </div>
        `).join('');
      } catch (e) {
        console.warn('[RH] Erro ao carregar metas:', e.message);
        container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>';
      }
    },

    // ── Drawer: Carregar historico de compensacao/promocoes (Fase H) ──
    async _loadPersonCompensationHistory(personId) {
      const container = document.getElementById('rhDrawerHistory');
      if (!container) return;
      try {
        const person = S._getPerson(personId);
        const uid = person?.supabaseId || personId;

        let history = [];
        if (typeof PeopleRepo !== 'undefined') {
          try { history = await PeopleRepo.getHistory(uid); } catch { /* sem historico */ }
        }

        if (!history || !history.length) {
          // Mostrar info basica
          const startDate = person?.inicio || person?.start_date;
          const salary = person?.custoMensal;
          if (startDate || salary) {
            container.innerHTML = `
              <div style="display:flex;gap:12px;flex-wrap:wrap;">
                ${startDate ? `<div style="font-size:0.72rem;"><span style="color:var(--text-muted);">Inicio:</span> <strong>${new Date(startDate + 'T12:00').toLocaleDateString('pt-BR')}</strong></div>` : ''}
                ${salary ? `<div style="font-size:0.72rem;"><span style="color:var(--text-muted);">Remuneracao:</span> <strong>R$ ${Number(salary).toLocaleString('pt-BR')}</strong></div>` : ''}
              </div>
            `;
          } else {
            container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem historico registrado</div>';
          }
          return;
        }

        // Renderizar timeline
        const importantFields = ['salary_pj', 'nivel_atual', 'cargo', 'bu', 'status'];
        const relevant = history.filter(h => importantFields.includes(h.field_changed)).slice(0, 10);

        if (!relevant.length) {
          container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem alteracoes significativas</div>';
          return;
        }

        const fieldLabels = { salary_pj: '\uD83D\uDCB0 Remunera\u00E7\u00E3o', nivel_atual: '\uD83D\uDCC8 N\u00EDvel', cargo: '\uD83D\uDCBC Cargo', bu: '\uD83C\uDFE2 Equipe', status: '\uD83D\uDD04 Status' };

        container.innerHTML = `
          <div style="border-left:2px solid var(--border-subtle);padding-left:12px;">
            ${relevant.map(h => `
              <div style="margin-bottom:10px;position:relative;">
                <div style="position:absolute;left:-17px;top:2px;width:8px;height:8px;border-radius:50%;background:var(--accent-gold);border:2px solid var(--bg-primary);"></div>
                <div style="font-size:0.68rem;color:var(--text-muted);">${h.changed_at ? new Date(h.changed_at).toLocaleDateString('pt-BR') : ''}</div>
                <div style="font-size:0.76rem;font-weight:500;">${fieldLabels[h.field_changed] || h.field_changed}</div>
                <div style="font-size:0.7rem;color:var(--text-secondary);">
                  ${h.old_value ? `<span style="text-decoration:line-through;opacity:0.6;">${S._esc(String(h.old_value).slice(0, 30))}</span> \u2192 ` : ''}
                  <strong>${S._esc(String(h.new_value).slice(0, 30))}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } catch (e) {
        console.warn('[RH] Erro ao carregar historico:', e.message);
        container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>';
      }
    },

    // ── Abrir drawer com backdrop (fechar com click fora, Escape) ──
    _openPersonDrawer(personId) {
      const drawer = document.getElementById('rhPersonDrawer');
      if (!drawer) return;

      // Criar backdrop se nao existir
      let backdrop = document.getElementById('rhDrawerBackdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'rhDrawerBackdrop';
        backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:1099;opacity:0;transition:opacity 0.2s ease;';
        drawer.parentElement.appendChild(backdrop);
      }

      drawer.innerHTML = this._renderPersonDrawer(personId);
      drawer.style.display = 'block';
      backdrop.style.display = 'block';
      requestAnimationFrame(() => { backdrop.style.opacity = '1'; drawer.classList.add('rh-drawer-open'); });
      if (window.lucide) lucide.createIcons();

      // Carregar tarefas da pessoa e dados do onboarding (async)
      this._loadPersonTasks(personId);
      this._loadPersonOnboardingData(personId);
      this._loadPersonProjects(personId);
      this._loadPersonSkills(personId);
      this._loadPersonHistory(personId);
      this._loadPersonCompensationHistory(personId);

      // Abrir perfil completo
      S._bind('rhOpenFullProfile', () => {
        this._closePersonDrawer();
        TBO_ROUTER.navigate(`people/${personId}/overview`);
      });
      // Fechar pelo X
      S._bind('rhCloseDrawer', () => this._closePersonDrawer());
      // Fechar pelo backdrop
      backdrop.addEventListener('click', () => this._closePersonDrawer());
      // Fechar por Escape
      this._drawerEscHandler = (e) => { if (e.key === 'Escape') this._closePersonDrawer(); };
      document.addEventListener('keydown', this._drawerEscHandler);

      // ── Edicao de pessoa ──
      S._bind('rhEditPerson', () => {
        const editForm = document.getElementById('rhEditPersonForm');
        const readOnly = document.getElementById('rhDrawerReadOnly');
        if (editForm && readOnly) {
          const isEditing = editForm.style.display !== 'none';
          editForm.style.display = isEditing ? 'none' : 'block';
          readOnly.style.display = isEditing ? 'grid' : 'none';
          // Atualizar botao
          const btn = document.getElementById('rhEditPerson');
          if (btn) btn.innerHTML = isEditing
            ? '<i data-lucide="pencil" style="width:12px;height:12px;"></i> Editar'
            : '<i data-lucide="x" style="width:12px;height:12px;"></i> Cancelar';
          if (window.lucide) lucide.createIcons();
        }
      });
      S._bind('rhCancelPersonEdit', () => {
        const editForm = document.getElementById('rhEditPersonForm');
        const readOnly = document.getElementById('rhDrawerReadOnly');
        if (editForm) editForm.style.display = 'none';
        if (readOnly) readOnly.style.display = 'grid';
        const btn = document.getElementById('rhEditPerson');
        if (btn) { btn.innerHTML = '<i data-lucide="pencil" style="width:12px;height:12px;"></i> Editar'; if (window.lucide) lucide.createIcons(); }
      });
      S._bind('rhSavePersonEdit', async () => {
        const saveBtn = document.getElementById('rhSavePersonEdit');
        const supabaseId = saveBtn?.dataset.supabaseId;
        if (!supabaseId || typeof PeopleRepo === 'undefined') {
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Repositorio nao disponivel');
          return;
        }
        // Coletar valores do formulario
        const updates = {};
        const fullName = document.getElementById('editFullName')?.value?.trim();
        const cargo = document.getElementById('editCargo')?.value?.trim();
        const teamId = document.getElementById('editBU')?.value || null;
        const status = document.getElementById('editStatus')?.value || 'active';
        const salary = document.getElementById('editSalary')?.value;
        const phone = document.getElementById('editPhone')?.value?.trim() || null;
        const managerId = document.getElementById('editManager')?.value || null;
        const contractType = document.getElementById('editContractType')?.value || null;

        if (fullName) updates.full_name = fullName;
        if (cargo !== undefined) updates.cargo = cargo;
        updates.team_id = teamId;
        updates.status = status;
        updates.is_active = (status === 'active' || status === 'vacation' || status === 'away' || status === 'onboarding');
        if (salary !== '' && salary !== undefined) updates.salary_pj = parseFloat(salary) || 0;
        updates.phone = phone;
        updates.manager_id = managerId;
        if (contractType !== undefined) updates.contract_type = contractType;

        // Salvar via PeopleRepo
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i data-lucide="loader" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i> Salvando...';
        if (window.lucide) lucide.createIcons();
        try {
          await PeopleRepo.update(supabaseId, updates);

          // Auto-trigger onboarding/offboarding se status mudou
          if (typeof OnboardingRepo !== 'undefined') {
            if (status === 'onboarding') {
              try {
                await OnboardingRepo.triggerAutomation(supabaseId, 'onboarding');
                console.log(`[RH] Onboarding automatico disparado para ${fullName || supabaseId}`);
              } catch (e) { console.warn('[RH] Erro ao disparar onboarding:', e.message); }
            } else if (status === 'offboarding') {
              try {
                await OnboardingRepo.triggerAutomation(supabaseId, 'offboarding');
                console.log(`[RH] Offboarding automatico disparado para ${fullName || supabaseId}`);
              } catch (e) { console.warn('[RH] Erro ao disparar offboarding:', e.message); }
            }
          }

          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Perfil atualizado!', fullName || '');
          // Recarregar equipe e reabrir drawer
          S._teamLoaded = false;
          await S._loadTeamFromSupabase({ force: true });
          // Re-renderizar lista e drawer
          const tabContent = document.getElementById('rhTabContent');
          if (tabContent) { tabContent.innerHTML = this.render(); this.init(); }
          // Reabrir drawer com dados atualizados
          this._openPersonDrawer(personId);
        } catch (err) {
          console.error('[RH] Erro ao atualizar perfil:', err);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao salvar', err.message || 'Tente novamente');
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i> Salvar';
          if (window.lucide) lucide.createIcons();
        }
      });
    },

    _closePersonDrawer() {
      const drawer = document.getElementById('rhPersonDrawer');
      const backdrop = document.getElementById('rhDrawerBackdrop');
      if (drawer) { drawer.classList.remove('rh-drawer-open'); setTimeout(() => { drawer.style.display = 'none'; drawer.innerHTML = ''; }, 200); }
      if (backdrop) { backdrop.style.opacity = '0'; setTimeout(() => { backdrop.style.display = 'none'; }, 200); }
      if (this._drawerEscHandler) { document.removeEventListener('keydown', this._drawerEscHandler); this._drawerEscHandler = null; }
    },

    // ── Person Tasks (Supabase) ─────────────────────────────────
    async _loadPersonTasks(personId) {
      const list = document.getElementById('rhPersonTaskList');
      if (!list) return;

      // Tentar Supabase primeiro
      if (typeof TBO_SUPABASE !== 'undefined') {
        try {
          const client = TBO_SUPABASE.getClient();
          const tenantId = TBO_SUPABASE.getCurrentTenantId();
          if (client && tenantId) {
            const { data, error } = await client.from('person_tasks')
              .select('*')
              .eq('tenant_id', tenantId)
              .eq('person_id', personId)
              .neq('status', 'cancelada')
              .order('created_at', { ascending: false });
            if (!error && data) {
              this._personTasks = data;
              list.innerHTML = this._renderPersonTaskItems(data, personId);
              this._bindPersonTaskActions(personId);
              return;
            }
          }
        } catch (e) { console.warn('[RH] Supabase person_tasks nao disponivel, usando localStorage', e.message); }
      }

      // Fallback: localStorage
      const tasks = S._getStore('person_tasks_' + personId);
      this._personTasks = tasks;
      list.innerHTML = this._renderPersonTaskItems(tasks, personId);
      this._bindPersonTaskActions(personId);
    },

    _renderPersonTaskItems(tasks, personId) {
      const pending = tasks.filter(t => t.status !== 'concluida');
      const done = tasks.filter(t => t.status === 'concluida');
      if (!tasks.length) return '<div style="font-size:0.72rem;color:var(--text-muted);padding:8px 0;">Nenhuma tarefa ainda</div>';

      const priorityColors = { alta: 'var(--color-danger)', media: 'var(--accent-gold)', baixa: 'var(--color-info)' };
      const categoryLabels = { pdi: 'PDI', onboarding: 'Onboard', '1on1_action': '1:1', general: 'Geral' };

      const renderTask = (t) => `
        <div class="rh-person-task-item" style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-subtle);">
          <input type="checkbox" class="rh-task-check" data-task-id="${t.id}" data-person="${personId}" ${t.status === 'concluida' ? 'checked' : ''} style="margin-top:2px;cursor:pointer;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.75rem;${t.status === 'concluida' ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${S._esc(t.title)}</div>
            <div style="display:flex;gap:4px;margin-top:3px;">
              <span class="tag" style="font-size:0.55rem;background:${priorityColors[t.priority] || 'var(--text-muted)'}20;color:${priorityColors[t.priority] || 'var(--text-muted)'};">${t.priority || 'media'}</span>
              <span class="tag" style="font-size:0.55rem;">${categoryLabels[t.category] || 'Geral'}</span>
              ${t.due_date ? `<span style="font-size:0.55rem;color:var(--text-muted);">${t.due_date}</span>` : ''}
            </div>
          </div>
        </div>`;

      let html = pending.map(renderTask).join('');
      if (done.length) {
        html += `<div style="font-size:0.68rem;color:var(--text-muted);margin-top:8px;margin-bottom:4px;">Concluidas (${done.length})</div>`;
        html += done.slice(0, 3).map(renderTask).join('');
      }
      return html;
    },

    _bindPersonTaskActions(personId) {
      // Botao nova tarefa
      S._bindToggle('rhNewPersonTask', 'rhPersonTaskForm');
      S._bindToggle('ptCancel', 'rhPersonTaskForm', false);

      // Salvar tarefa
      S._bind('ptSave', async () => {
        const title = document.getElementById('ptTitle')?.value?.trim();
        if (!title) { TBO_TOAST.warning('Digite o titulo da tarefa'); return; }

        const task = {
          id: S._genId(),
          person_id: personId,
          title,
          priority: document.getElementById('ptPriority')?.value || 'media',
          category: document.getElementById('ptCategory')?.value || 'general',
          due_date: document.getElementById('ptDueDate')?.value || null,
          status: 'pendente',
          created_at: new Date().toISOString()
        };

        // Tentar Supabase
        if (typeof TBO_SUPABASE !== 'undefined') {
          try {
            const client = TBO_SUPABASE.getClient();
            const tenantId = TBO_SUPABASE.getCurrentTenantId();
            if (client && tenantId) {
              const session = await TBO_SUPABASE.getSession();
              const { error } = await client.from('person_tasks').insert({
                ...task, tenant_id: tenantId, assigned_by: session?.user?.id || null
              });
              if (!error) {
                TBO_TOAST.success('Tarefa criada!');
                await this._loadPersonTasks(personId);
                document.getElementById('rhPersonTaskForm').style.display = 'none';
                document.getElementById('ptTitle').value = '';
                return;
              }
            }
          } catch (e) { console.warn('[RH] Fallback localStorage para person_tasks', e.message); }
        }

        // Fallback: localStorage
        const tasks = S._getStore('person_tasks_' + personId);
        tasks.unshift(task);
        S._setStore('person_tasks_' + personId, tasks);
        TBO_TOAST.success('Tarefa criada!');
        await this._loadPersonTasks(personId);
        document.getElementById('rhPersonTaskForm').style.display = 'none';
        document.getElementById('ptTitle').value = '';
      });

      // Toggle status das tarefas
      document.querySelectorAll('.rh-task-check').forEach(chk => {
        chk.addEventListener('change', async () => {
          const taskId = chk.dataset.taskId;
          const pid = chk.dataset.person;
          const newStatus = chk.checked ? 'concluida' : 'pendente';

          if (typeof TBO_SUPABASE !== 'undefined') {
            try {
              const client = TBO_SUPABASE.getClient();
              if (client) {
                await client.from('person_tasks').update({ status: newStatus }).eq('id', taskId);
                await this._loadPersonTasks(pid);
                return;
              }
            } catch (e) { /* fallback */ }
          }

          const tasks = S._getStore('person_tasks_' + pid);
          const t = tasks.find(x => x.id === taskId);
          if (t) { t.status = newStatus; S._setStore('person_tasks_' + pid, tasks); }
          await this._loadPersonTasks(pid);
        });
      });

      if (window.lucide) lucide.createIcons();
    },

    // ── Bind para conteudo da visao geral (cards/tabela/organograma) ──
    _bindVisaoGeralContent() {
      // Cards: click abre drawer
      document.querySelectorAll('.rh-person-card').forEach(card => {
        card.addEventListener('click', () => this._openPersonDrawer(card.dataset.person));
      });
      // Tabela: click na row abre drawer
      document.querySelectorAll('.rh-person-row').forEach(row => {
        row.addEventListener('click', () => this._openPersonDrawer(row.dataset.person));
      });
      // Organograma: click no card abre drawer
      document.querySelectorAll('.rh-org-card[data-person]').forEach(card => {
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          this._openPersonDrawer(card.dataset.person);
        });
      });
      // Organograma: toggle expand/collapse de reports
      document.querySelectorAll('.rh-org-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const parentId = btn.dataset.toggle;
          const children = document.querySelector(`.rh-org-children[data-parent="${parentId}"]`);
          if (children) {
            children.classList.toggle('rh-org-collapsed');
            const icon = btn.querySelector('[data-lucide]');
            if (icon) icon.style.transform = children.classList.contains('rh-org-collapsed') ? '' : 'rotate(180deg)';
          }
        });
      });
      // Tabela BU: toggle de grupo (colapsar/expandir)
      document.querySelectorAll('.rh-bu-group-header').forEach(header => {
        header.addEventListener('click', () => {
          const group = header.dataset.group;
          const rows = document.querySelectorAll(`.rh-bu-row[data-group="${group}"]`);
          const chevron = header.querySelector('.rh-group-chevron');
          const isHidden = rows[0]?.style.display === 'none';
          rows.forEach(r => r.style.display = isHidden ? '' : 'none');
          if (chevron) chevron.style.transform = isHidden ? '' : 'rotate(-90deg)';
        });
      });
      // Action menu (three dots) — abre context menu por usuario
      document.querySelectorAll('.rh-action-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rect = btn.getBoundingClientRect();
          this._renderContextMenu(btn.dataset.person, btn.dataset.name, rect.right - 200, rect.bottom + 4);
        });
      });
      // Context menu items
      document.querySelectorAll('.rh-ctx-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const menu = document.getElementById('rhContextMenu');
          if (menu) menu.style.display = 'none';
          this._handleContextAction(item.dataset.action, item.dataset.person);
        });
      });
      // Colleague chips no drawer -> abrir perfil
      document.querySelectorAll('.rh-colleague-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          this._openPersonDrawer(chip.dataset.person);
        });
      });
    },

    // ── INIT (chamado pelo shell apos render) ──
    init() {
      // ── Visao Geral: View Switcher (organograma / tabela / cards) ──
      document.querySelectorAll('.rh-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._visaoGeralView = btn.dataset.view;
          // Atualizar visual dos botoes
          document.querySelectorAll('.rh-view-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
          btn.classList.remove('btn-secondary'); btn.classList.add('btn-primary');
          // Re-renderizar apenas o conteudo da view
          const content = document.getElementById('rhVisaoGeralContent');
          if (content) {
            const team = S._getInternalTeam();
            const reviews = S._getStore('avaliacoes_people');
            content.innerHTML = this._renderVisaoGeralContent(team, reviews);
            this._bindVisaoGeralContent();
          }
          if (window.lucide) lucide.createIcons();
        });
      });

      // Bind do conteudo da visao geral (cards/tabela/organograma)
      this._bindVisaoGeralContent();

      // ── Filtros avancados ──
      const filterBu = document.querySelector('.rh-filter-bu');
      const filterSearch = document.querySelector('.rh-filter-search');
      const filterRole = document.querySelector('.rh-filter-role');
      const filterStatus = document.querySelector('.rh-filter-status');

      // Restaurar valores de filtros preservados
      if (filterBu && S._filterSquad) filterBu.value = S._filterSquad;
      if (filterSearch && S._filterSearch) filterSearch.value = S._filterSearch;
      if (filterRole && S._filterRole) filterRole.value = S._filterRole;
      if (filterStatus && S._filterStatus) filterStatus.value = S._filterStatus;

      // Filtro local/client-side (rapido, para organograma e cards)
      const applyClientFilters = () => {
        const bu = filterBu ? filterBu.value : '';
        const search = filterSearch ? filterSearch.value.toLowerCase() : '';
        const role = filterRole ? filterRole.value : '';
        const status = filterStatus ? filterStatus.value : '';

        // Mapa de status filtro local -> status do DB
        const statusLocalMap = { 'ativo': 'active', 'inativo': 'inactive', 'ferias': 'vacation', 'ausente': 'away', 'onboarding': 'onboarding', 'offboarding': 'offboarding', 'desligado': 'desligado', 'suspenso': 'suspended' };
        const statusDb = status ? statusLocalMap[status] || status : '';

        // Cards
        document.querySelectorAll('.rh-person-card').forEach(card => {
          const matchBu = !bu || card.dataset.bu === bu;
          const matchSearch = !search || card.textContent.toLowerCase().includes(search);
          const matchStatus = !statusDb || card.dataset.status === statusDb;
          card.style.display = (matchBu && matchSearch && matchStatus) ? '' : 'none';
        });
        // Organograma nodes
        document.querySelectorAll('.rh-org-node').forEach(node => {
          const matchSearch = !search || node.textContent.toLowerCase().includes(search);
          node.style.display = matchSearch ? '' : 'none';
        });
        // Tabela rows (client-side filtering for responsiveness)
        document.querySelectorAll('.rh-bu-row').forEach(row => {
          const matchBu = !bu || row.dataset.bu === bu || row.dataset.group === bu;
          const matchSearch = !search || row.textContent.toLowerCase().includes(search);
          const matchStatus = !statusDb || row.dataset.status === statusDb;
          row.style.display = (matchBu && matchSearch && matchStatus) ? '' : 'none';
        });
      };

      // Filtros server-side (para busca/paginacao — debounced)
      const applyServerFilters = () => {
        S._filterSquad = filterBu ? filterBu.value : '';
        S._filterRole = filterRole ? filterRole.value : '';
        S._filterStatus = filterStatus ? filterStatus.value : '';
        S._filterSearch = filterSearch ? filterSearch.value.trim() : '';
        S._page = 0; // Reset paginacao ao filtrar
        this._reloadTeamServerSide();
      };

      // Bind filter events
      if (filterBu) filterBu.addEventListener('change', () => { applyClientFilters(); applyServerFilters(); });
      if (filterRole) filterRole.addEventListener('change', applyServerFilters);
      if (filterStatus) filterStatus.addEventListener('change', applyServerFilters);
      if (filterSearch) {
        // Debounce busca: client-side imediato, server-side apos 400ms
        filterSearch.addEventListener('input', () => {
          applyClientFilters();
          clearTimeout(S._searchDebounceTimer);
          S._searchDebounceTimer = setTimeout(applyServerFilters, 400);
        });
      }

      // Aplicar filtros restaurados imediatamente
      if (S._filterSquad || S._filterSearch) applyClientFilters();

      // ── Sort headers (click to sort) ──
      document.querySelectorAll('.rh-sort-header').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.dataset.sort;
          if (S._sortBy === col) {
            S._sortDir = S._sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            S._sortBy = col;
            S._sortDir = 'asc';
          }
          S._page = 0;
          this._reloadTeamServerSide();
        });
      });

      // ── Paginacao ──
      document.querySelectorAll('.rh-page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.page === 'prev' && S._page > 0) {
            S._page--;
          } else if (btn.dataset.page === 'next') {
            const totalPages = Math.ceil(S._totalCount / S._pageSize);
            if (S._page < totalPages - 1) S._page++;
          }
          this._reloadTeamServerSide();
        });
      });

      // Hover Card — bind em elementos com data-person-id
      if (typeof TBO_HOVER_CARD !== 'undefined') {
        const rhModule = document.querySelector('.rh-module');
        if (rhModule) TBO_HOVER_CARD.bind(rhModule);
      }

      // Carregar KPIs, projetos e aniversariantes async (nao bloqueia render)
      this._loadDashboardKPIs();
      this._loadProjectCounts();
      this._loadBirthdayWidget();

      // Lucide icons
      if (window.lucide) lucide.createIcons();
    },

    destroy() {
      // Fechar drawer se aberto
      this._closePersonDrawer();
      // Limpar timers
      if (S._searchDebounceTimer) {
        clearTimeout(S._searchDebounceTimer);
        S._searchDebounceTimer = null;
      }
    }
  };

  TBO_PEOPLE.registerTab('visao-geral', TabEquipe);
})();
