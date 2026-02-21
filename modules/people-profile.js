// TBO OS — Module: People Profile (Perfil Individual)
// Pagina completa de perfil de colaborador com 5 tabs
// Rota: #people/{userId}/{tab}
// Tabs: overview, projects, tasks, development, activity
// v1.0: Supabase-first, RBAC-aware, Asana/Notion-inspired

const TBO_PEOPLE_PROFILE = {

  _personId: null,
  _personData: null,
  _personName: '',
  _activeTab: 'overview',
  _loading: false,

  // Recebe params do router (id, tab)
  setParams(params) {
    this._personId = params.id || null;
    this._activeTab = params.tab || 'overview';
  },

  // ── Helpers ──────────────────────────────────────────────────────
  _esc(s) { return typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s) : (typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.escapeHtml(s) : String(s || '')); },

  // Mapeamento de roles legados → labels amigáveis em PT-BR
  _roleLabel(role) {
    const labels = {
      'founder': 'Fundador', 'owner': 'Proprietário', 'admin': 'Administrador',
      'project_owner': 'Gestor de Projetos', 'coordinator': 'Coordenador(a)',
      'artist': 'Colaborador', '3d-artist': 'Artista 3D', 'finance': 'Financeiro',
      'member': 'Membro', 'viewer': 'Visualizador', 'guest': 'Convidado'
    };
    return labels[role] || role || 'Membro';
  },

  _roleColor(role) {
    const colors = {
      'founder': '#E85102', 'owner': '#E85102', 'admin': '#DC2626',
      'project_owner': '#3B82F6', 'coordinator': '#8B5CF6',
      'artist': '#10B981', '3d-artist': '#10B981', 'finance': '#F59E0B',
      'member': '#64748B', 'viewer': '#94A3B8', 'guest': '#CBD5E1'
    };
    return colors[role] || '#94a3b8';
  },

  _isAdmin() {
    // v2.1: Fail closed — se TBO_AUTH nao carregou, negar acesso (prevenir privilege escalation)
    if (typeof TBO_AUTH === 'undefined') return false;
    return TBO_AUTH.canDo('users', 'edit') || TBO_AUTH.getCurrentUser()?.isCoordinator;
  },

  _currentUserId() {
    // v2.1: Fail closed — retornar null se auth nao disponivel (nao hardcoded)
    if (typeof TBO_AUTH === 'undefined') return null;
    const u = TBO_AUTH.getCurrentUser();
    return u ? u.id : null;
  },

  _getAvatarHTML(person, size = 64, fontSize = '1.2rem') {
    const initials = (person.nome || person.full_name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
    const color = buColors[person.bu] || 'var(--accent-gold)';
    const avatarUrl = person.avatarUrl || person.avatar_url;

    if (avatarUrl) {
      return `<img src="${this._esc(avatarUrl)}" alt="${initials}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${fontSize};background:${color}20;color:${color};display:none;flex-shrink:0;">${initials}</div>`;
    }
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${fontSize};background:${color}20;color:${color};flex-shrink:0;">${initials}</div>`;
  },

  /**
   * Normaliza slug para comparacao (ex: "marco-andolfato" → "marcoandolfato")
   */
  _normalizeSlug(str) {
    return (str || '').toLowerCase().replace(/[-_\s.]/g, '');
  },

  // ── Carregar dados da pessoa do Supabase ────────────────────────
  async _loadPerson() {
    if (!this._personId) return null;
    this._loading = true;

    const pid = this._personId;
    const pidNorm = this._normalizeSlug(pid);

    // Tentar encontrar no RH module primeiro (ja carregado)
    if (typeof TBO_RH !== 'undefined' && TBO_RH._teamLoaded) {
      const person = TBO_RH._team.find(t =>
        t.id === pid ||
        t.supabaseId === pid ||
        this._normalizeSlug(t.nome) === pidNorm ||
        this._normalizeSlug(t.id) === pidNorm
      );
      if (person) {
        this._personData = person;
        this._personName = person.nome;
        this._loading = false;
        return person;
      }
    }

    // Tentar PeopleRepo (v3.0) — retorna perfil completo com teams JOIN
    if (typeof PeopleRepo !== 'undefined') {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pid);
        let data = null;

        if (isUUID) {
          data = await PeopleRepo.getById(pid);
        } else {
          // Buscar por username ou nome
          const results = await PeopleRepo.search(pid.replace(/-/g, ' '), 1);
          if (results && results.length) {
            data = await PeopleRepo.getById(results[0].id);
          }
        }

        if (data) {
          // Carregar RBAC role via PeopleRepo
          let rbacRole = {};
          try { rbacRole = await PeopleRepo.getUserRole(data.id) || {}; } catch (e) { /* silencioso */ }

          // Buscar seed data para campos extras legados
          let seedData = {};
          if (typeof TBO_RH !== 'undefined') {
            seedData = TBO_RH._teamSeed.find(s => s.id === (data.username || data.email?.split('@')[0])) || {};
          }

          const teamName = data.teams?.name || data.bu || seedData.bu || '';

          this._personData = {
            id: data.username || data.email?.split('@')[0] || data.id,
            supabaseId: data.id,
            nome: data.full_name || data.username || '',
            cargo: data.cargo || seedData.cargo || (data.is_coordinator ? 'Coordenador(a)' : data.role || ''),
            area: seedData.area || (teamName ? `BU ${teamName}` : ''),
            bu: teamName,
            nivel: seedData.nivel || '',
            lider: seedData.lider || null,
            status: data.status || (data.is_active ? 'active' : 'inactive'),
            avatarUrl: data.avatar_url || null,
            email: data.email || '',
            rbacRole: rbacRole.name || data.role || 'member',
            rbacLabel: rbacRole.label || this._roleLabel(data.role) || 'Membro',
            rbacColor: rbacRole.color || this._roleColor(data.role) || '#94a3b8',
            isCoordinator: data.is_coordinator || false,
            dataEntrada: data.start_date || data.created_at || null,
            ultimoLogin: data.last_sign_in_at || null,
            terceirizado: seedData.terceirizado || false,
            // Novos campos P0
            custoMensal: data.salary_pj || null,
            contractType: data.contract_type || null,
            phone: data.phone || null,
            managerId: data.manager_id || null,
            teamId: data.team_id || null,
            teamColor: data.teams?.color || null,
            department: data.department || null
          };
          this._personName = this._personData.nome;
          this._loading = false;
          return this._personData;
        }
      } catch (e) {
        console.warn('[People Profile] Erro ao carregar perfil via PeopleRepo:', e.message);
      }
    }

    // Fallback: carregar do Supabase diretamente (legado)
    if (typeof TBO_SUPABASE !== 'undefined') {
      try {
        const client = TBO_SUPABASE.getClient();
        const tenantId = TBO_SUPABASE.getCurrentTenantId();
        if (client && tenantId) {
          const _select = 'id, username, full_name, email, role, bu, is_coordinator, is_active, tenant_id, avatar_url, created_at, last_sign_in_at, salary_pj, contract_type, phone, manager_id, status, team_id, cargo, start_date, department, teams(id, name, color, icon)';
          let query = client.from('profiles').select(_select).eq('tenant_id', tenantId);

          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pid);
          if (isUUID) {
            query = query.eq('id', pid);
          } else {
            query = query.eq('username', pid);
          }

          let { data, error } = await query.maybeSingle();

          // Fallback: buscar por slug no full_name
          if (!data && !isUUID) {
            const nameLike = pid.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const { data: d2 } = await client.from('profiles').select(_select)
              .eq('tenant_id', tenantId)
              .ilike('full_name', `%${nameLike}%`)
              .maybeSingle();
            if (d2) { data = d2; error = null; }
          }
          if (!error && data) {
            let rbacRole = {};
            try {
              const { data: member } = await client
                .from('tenant_members')
                .select('role_id, roles(name, label, color)')
                .eq('tenant_id', tenantId)
                .eq('user_id', data.id)
                .maybeSingle();
              if (member) rbacRole = member.roles || {};
            } catch (e) { /* silencioso */ }

            let seedData = {};
            if (typeof TBO_RH !== 'undefined') {
              seedData = TBO_RH._teamSeed.find(s => s.id === (data.username || data.email?.split('@')[0])) || {};
            }

            const teamName = data.teams?.name || data.bu || seedData.bu || '';

            this._personData = {
              id: data.username || data.email?.split('@')[0] || data.id,
              supabaseId: data.id,
              nome: data.full_name || data.username || '',
              cargo: data.cargo || seedData.cargo || (data.is_coordinator ? 'Coordenador(a)' : data.role || ''),
              area: seedData.area || (teamName ? `BU ${teamName}` : ''),
              bu: teamName,
              nivel: seedData.nivel || '',
              lider: seedData.lider || null,
              status: data.status || (data.is_active ? 'active' : 'inactive'),
              avatarUrl: data.avatar_url || null,
              email: data.email || '',
              rbacRole: rbacRole.name || data.role || 'member',
              rbacLabel: rbacRole.label || this._roleLabel(data.role) || 'Membro',
              rbacColor: rbacRole.color || this._roleColor(data.role) || '#94a3b8',
              isCoordinator: data.is_coordinator || false,
              dataEntrada: data.start_date || data.created_at || null,
              ultimoLogin: data.last_sign_in_at || null,
              terceirizado: seedData.terceirizado || false,
              custoMensal: data.salary_pj || null,
              contractType: data.contract_type || null,
              phone: data.phone || null,
              managerId: data.manager_id || null,
              teamId: data.team_id || null,
              teamColor: data.teams?.color || null,
              department: data.department || null
            };
            this._personName = this._personData.nome;
            this._loading = false;
            return this._personData;
          }
        }
      } catch (e) {
        console.warn('[People Profile] Erro ao carregar perfil:', e.message);
      }
    }

    // Fallback: seed data
    if (typeof TBO_RH !== 'undefined') {
      const seed = TBO_RH._teamSeed.find(s => s.id === this._personId);
      if (seed) {
        this._personData = { ...seed, supabaseId: null };
        this._personName = seed.nome;
        this._loading = false;
        return this._personData;
      }
    }

    this._loading = false;
    return null;
  },

  // ══════════════════════════════════════════════════════════════════
  // RENDER (main entry point)
  // ══════════════════════════════════════════════════════════════════
  async render() {
    const person = await this._loadPerson();
    if (!person) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="user-x" style="width:48px;height:48px;color:var(--text-muted);"></i></div>
          <div class="empty-state-text">Pessoa nao encontrada</div>
          <button class="btn btn-primary" style="margin-top:12px;" onclick="TBO_ROUTER.navigate('rh')">Voltar para Equipe</button>
        </div>`;
    }

    const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
    const buColor = buColors[person.bu] || 'var(--accent-gold)';
    const rbacColor = person.rbacColor || '#94a3b8';
    const tab = this._activeTab;

    return `
      <div class="pp-module">
        <style>${this._getScopedCSS()}</style>

        <!-- Breadcrumb / Voltar -->
        <div style="margin-bottom:16px;">
          <button class="btn btn-ghost btn-sm" id="ppBackBtn" style="font-size:0.78rem;gap:4px;">
            <i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Voltar para Equipe
          </button>
        </div>

        <!-- Identity Block (estilo Asana/Linear) -->
        <div class="card pp-identity" style="margin-bottom:20px;overflow:hidden;">
          <div class="pp-banner" style="background:linear-gradient(135deg, ${buColor}20 0%, ${buColor}08 100%);height:80px;margin:-24px -24px 0;"></div>
          <div style="display:flex;gap:20px;align-items:flex-start;margin-top:-40px;padding:0 4px;">
            <div style="flex-shrink:0;border:3px solid var(--bg-primary);border-radius:50%;">
              ${this._getAvatarHTML(person, 80, '1.6rem')}
            </div>
            <div style="flex:1;padding-top:44px;">
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <h1 style="font-size:1.35rem;font-weight:800;margin:0;">${this._esc(person.nome)}</h1>
                <span class="tag" style="font-size:0.68rem;background:${person.status === 'ativo' ? 'var(--color-success)' : 'var(--text-muted)'}18;color:${person.status === 'ativo' ? 'var(--color-success)' : 'var(--text-muted)'};">${person.status || 'ativo'}</span>
              </div>
              <div style="font-size:0.88rem;color:var(--text-secondary);margin-top:2px;">${this._esc(person.cargo)}</div>
              <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center;">
                ${person.bu ? `<span class="tag" style="font-size:0.68rem;background:${buColor}15;color:${buColor};">${person.bu}</span>` : ''}
                ${person.nivel ? `<span class="tag" style="font-size:0.68rem;">${this._esc(person.nivel)}</span>` : ''}
                <span class="tag" style="font-size:0.65rem;background:${rbacColor}18;color:${rbacColor};border:1px solid ${rbacColor}30;">
                  ${this._esc(person.rbacLabel || person.rbacRole || '')}
                </span>
                ${person.isCoordinator ? '<span class="tag" style="font-size:0.62rem;background:var(--accent-gold)15;color:var(--accent-gold);">Coordenador</span>' : ''}
              </div>
            </div>
            <div style="padding-top:44px;display:flex;gap:8px;flex-shrink:0;">
              ${this._isAdmin() ? `<button class="btn btn-secondary btn-sm" id="ppEditProfile" title="Editar perfil"><i data-lucide="edit-3" style="width:14px;height:14px;"></i></button>` : ''}
            </div>
          </div>

          <!-- Info row -->
          <div style="display:flex;gap:20px;margin-top:16px;padding-top:12px;border-top:1px solid var(--border-subtle);flex-wrap:wrap;">
            ${person.email ? `<div class="pp-info-item"><i data-lucide="mail" style="width:13px;height:13px;"></i><span>${this._esc(person.email)}</span></div>` : ''}
            ${person.lider ? `<div class="pp-info-item"><i data-lucide="user" style="width:13px;height:13px;"></i><span>Reporta a: <a href="#people/${person.lider}/overview" style="color:var(--accent-gold);text-decoration:none;font-weight:500;">${typeof TBO_RH !== 'undefined' ? TBO_RH._getPersonName(person.lider) : person.lider}</a></span></div>` : ''}
            ${person.dataEntrada ? `<div class="pp-info-item"><i data-lucide="calendar" style="width:13px;height:13px;"></i><span>Desde ${new Date(person.dataEntrada).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span></div>` : ''}
            ${person.ultimoLogin ? `<div class="pp-info-item"><i data-lucide="clock" style="width:13px;height:13px;"></i><span>Ultimo acesso: ${new Date(person.ultimoLogin).toLocaleDateString('pt-BR')}</span></div>` : ''}
          </div>
        </div>

        <!-- Tab bar -->
        <div class="tab-bar pp-tabs" id="ppTabs" style="margin-bottom:20px;">
          <button class="tab ${tab === 'overview' ? 'active' : ''}" data-tab="overview">
            <i data-lucide="layout-dashboard" style="width:14px;height:14px;"></i> Visao Geral
          </button>
          <button class="tab ${tab === 'projects' ? 'active' : ''}" data-tab="projects">
            <i data-lucide="folder" style="width:14px;height:14px;"></i> Projetos
          </button>
          <button class="tab ${tab === 'tasks' ? 'active' : ''}" data-tab="tasks">
            <i data-lucide="check-square" style="width:14px;height:14px;"></i> Tarefas
          </button>
          <button class="tab ${tab === 'development' ? 'active' : ''}" data-tab="development">
            <i data-lucide="trending-up" style="width:14px;height:14px;"></i> Desenvolvimento
          </button>
          <button class="tab ${tab === 'activity' ? 'active' : ''}" data-tab="activity">
            <i data-lucide="activity" style="width:14px;height:14px;"></i> Atividade
          </button>
          ${this._isAdmin() ? `
          <button class="tab ${tab === 'custos' ? 'active' : ''}" data-tab="custos">
            <i data-lucide="dollar-sign" style="width:14px;height:14px;"></i> Custos
          </button>
          <button class="tab ${tab === 'acesso' ? 'active' : ''}" data-tab="acesso">
            <i data-lucide="shield" style="width:14px;height:14px;"></i> Acesso
          </button>
          ` : ''}
        </div>

        <!-- Tab content -->
        <div id="ppTabContent">
          ${this._renderActiveTab()}
        </div>
      </div>
    `;
  },

  // Tab switching (chamado pelo router para deep links)
  switchTab(tab) {
    this._activeTab = tab;
    document.querySelectorAll('#ppTabs .tab').forEach(t => t.classList.remove('active'));
    const activeBtn = document.querySelector(`#ppTabs .tab[data-tab="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    const content = document.getElementById('ppTabContent');
    if (content) {
      content.innerHTML = this._renderActiveTab();
      this._initActiveTab();
    }
  },

  _renderActiveTab() {
    if (!this._personData) return '<div style="padding:40px;text-align:center;color:var(--text-muted);">Carregando...</div>';
    switch (this._activeTab) {
      case 'overview':    return this._renderOverview();
      case 'projects':    return this._renderProjects();
      case 'tasks':       return this._renderTasks();
      case 'development': return this._renderDevelopment();
      case 'activity':    return this._renderActivity();
      case 'custos':      return this._isAdmin() ? this._renderCustos() : this._renderOverview();
      case 'acesso':      return this._isAdmin() ? this._renderAcesso() : this._renderOverview();
      default:            return this._renderOverview();
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 1: OVERVIEW
  // ══════════════════════════════════════════════════════════════════
  _renderOverview() {
    const p = this._personData;
    const reviews = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('avaliacoes_people') : [];
    const review = reviews.find(r => r.pessoaId === p.id);
    const feedbacks = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('feedbacks').filter(f => f.para === p.id) : [];
    const elogios = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('elogios').filter(e => e.para === p.id) : [];
    const oneOnOnes = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('1on1s').filter(o => o.colaborador === p.id || o.lider === p.id) : [];

    // Colaboradores frequentes
    const colleagues = typeof TBO_RH !== 'undefined' ?
      TBO_RH._getInternalTeam().filter(t => t.id !== p.id && (t.bu === p.bu || t.lider === p.id || p.lider === t.id)).slice(0, 8) : [];

    // Valores/reconhecimentos
    const valores = typeof TBO_RH !== 'undefined' ? TBO_RH._valores : [];

    return `
      <div class="grid-2" style="gap:16px;">
        <!-- Coluna esquerda -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${review ? `
          <!-- Performance Score -->
          <div class="card" style="padding:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
              <i data-lucide="bar-chart-3" style="width:18px;height:18px;color:var(--color-purple, #8b5cf6);"></i>
              <h3 style="font-size:0.92rem;margin:0;">Performance</h3>
            </div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:16px;">
              <div style="text-align:center;">
                <div style="font-size:2.8rem;font-weight:800;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${review.mediaGeral.toFixed(1)}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);">Media Geral</div>
              </div>
              <div style="flex:1;">
                ${['Autoavaliacao|autoMedia|var(--color-info)', 'Avaliacao Gestor|gestorMedia|var(--accent-gold)', 'Avaliacao Pares|paresMedia|var(--color-purple, #8b5cf6)'].map(s => {
                  const [l, k, c] = s.split('|');
                  return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span style="font-size:0.72rem;width:100px;color:var(--text-muted);">${l}</span>
                    <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                      <div style="height:100%;width:${(review[k] / 5) * 100}%;background:${c};border-radius:3px;"></div>
                    </div>
                    <span style="font-size:0.78rem;font-weight:600;width:28px;text-align:right;">${review[k].toFixed(1)}</span>
                  </div>`;
                }).join('')}
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${(review.destaques || []).map(d => `<span class="tag" style="font-size:0.65rem;background:var(--color-success-dim);color:var(--color-success);">\u2B50 ${d}</span>`).join('')}
              ${(review.gaps || []).map(g => `<span class="tag" style="font-size:0.65rem;background:var(--color-warning-dim);color:var(--color-warning);">\u26A0\uFE0F ${g}</span>`).join('')}
            </div>
            ${review.parecer ? `<div style="margin-top:12px;padding:10px 14px;background:var(--bg-elevated);border-radius:8px;font-size:0.78rem;color:var(--text-secondary);border-left:3px solid var(--accent-gold);"><strong>Parecer:</strong> ${this._esc(review.parecer)}</div>` : ''}
          </div>` : `
          <div class="card" style="padding:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <i data-lucide="bar-chart-3" style="width:18px;height:18px;color:var(--text-muted);"></i>
              <h3 style="font-size:0.92rem;margin:0;">Performance</h3>
            </div>
            <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.82rem;">
              Nenhuma avaliacao disponivel para este ciclo
            </div>
          </div>`}

          <!-- Reconhecimentos -->
          <div class="card" style="padding:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <i data-lucide="award" style="width:18px;height:18px;color:var(--accent-gold);"></i>
              <h3 style="font-size:0.92rem;margin:0;">Reconhecimentos</h3>
              <span class="tag" style="font-size:0.65rem;margin-left:auto;">${elogios.length} recebidos</span>
            </div>
            ${elogios.length ? `
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${elogios.slice(0, 5).map(e => {
                  const v = valores.find(v2 => v2.id === e.valor);
                  const deNome = typeof TBO_RH !== 'undefined' ? TBO_RH._getPersonName(e.de) : e.de;
                  return `<div style="padding:10px 14px;background:var(--bg-elevated);border-radius:8px;">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                      <span style="font-size:1rem;">${v ? v.emoji : '\u2B50'}</span>
                      <span style="font-size:0.75rem;font-weight:600;">${v ? v.nome : 'Reconhecimento'}</span>
                      <span style="font-size:0.65rem;color:var(--text-muted);margin-left:auto;">por ${this._esc(deNome)}</span>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-secondary);">${this._esc(e.mensagem)}</div>
                  </div>`;
                }).join('')}
              </div>` : '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhum reconhecimento recebido</div>'}
          </div>
        </div>

        <!-- Coluna direita -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Metas -->
          <div class="card" style="padding:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <i data-lucide="target" style="width:18px;height:18px;color:var(--accent-gold);"></i>
              <h3 style="font-size:0.92rem;margin:0;">Metas & Objetivos</h3>
            </div>
            ${review && review.gaps ? `
              ${review.gaps.map((g, i) => {
                const progress = Math.floor(Math.random() * 60) + 20;
                return `<div style="margin-bottom:12px;">
                  <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px;">
                    <span>Desenvolver ${g}</span>
                    <span style="font-weight:600;color:${progress >= 75 ? 'var(--color-success)' : progress >= 40 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${progress}%</span>
                  </div>
                  <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${progress}%;background:${progress >= 75 ? 'var(--color-success)' : progress >= 40 ? 'var(--accent-gold)' : 'var(--color-danger)'};border-radius:3px;"></div>
                  </div>
                </div>`;
              }).join('')}
            ` : '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhuma meta definida</div>'}
          </div>

          <!-- 1:1s Recentes -->
          <div class="card" style="padding:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <i data-lucide="message-circle" style="width:18px;height:18px;color:var(--color-info);"></i>
              <h3 style="font-size:0.92rem;margin:0;">1:1s Recentes</h3>
            </div>
            ${oneOnOnes.length ? `
              ${oneOnOnes.slice(0, 4).map(o => {
                const outroNome = typeof TBO_RH !== 'undefined' ?
                  (o.colaborador === p.id ? TBO_RH._getPersonName(o.lider) : TBO_RH._getPersonName(o.colaborador)) : '...';
                const statusColor = o.status === 'concluida' ? 'var(--color-success)' : 'var(--color-info)';
                return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-elevated);border-radius:8px;margin-bottom:6px;">
                  <div style="width:8px;height:8px;border-radius:50%;background:${statusColor};flex-shrink:0;"></div>
                  <div style="flex:1;">
                    <div style="font-size:0.8rem;font-weight:500;">com ${this._esc(outroNome)}</div>
                    <div style="font-size:0.68rem;color:var(--text-muted);">${new Date(o.data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <span class="tag" style="font-size:0.6rem;background:${statusColor}18;color:${statusColor};">${o.status === 'concluida' ? 'Concluida' : 'Agendada'}</span>
                </div>`;
              }).join('')}` : '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhuma 1:1 registrada</div>'}
          </div>

          <!-- Colaboradores Frequentes -->
          <div class="card" style="padding:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <i data-lucide="users" style="width:18px;height:18px;color:var(--text-muted);"></i>
              <h3 style="font-size:0.92rem;margin:0;">Colaboradores Frequentes</h3>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${colleagues.map(c => `
                <a href="#people/${c.id}/overview" style="text-decoration:none;" class="pp-colleague-link">
                  <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--bg-elevated);border-radius:20px;cursor:pointer;transition:background 0.15s;">
                    ${this._getAvatarHTML(c, 24, '0.55rem')}
                    <span style="font-size:0.75rem;font-weight:500;color:var(--text-primary);">${this._esc(c.nome.split(' ')[0])}</span>
                  </div>
                </a>
              `).join('') || '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhum</div>'}
            </div>
          </div>

          <!-- Feedbacks Recentes -->
          ${feedbacks.length ? `
          <div class="card" style="padding:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <i data-lucide="message-square" style="width:18px;height:18px;color:var(--color-purple, #8b5cf6);"></i>
              <h3 style="font-size:0.92rem;margin:0;">Feedbacks Recebidos</h3>
            </div>
            ${feedbacks.slice(0, 4).map(f => {
              const deNome = typeof TBO_RH !== 'undefined' ? TBO_RH._getPersonName(f.de) : f.de;
              const tipoColor = f.tipo === 'positivo' ? 'var(--color-success)' : 'var(--color-warning)';
              return `<div style="padding:10px 12px;background:var(--bg-elevated);border-radius:8px;margin-bottom:6px;border-left:3px solid ${tipoColor};">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:0.75rem;font-weight:500;">${this._esc(deNome)}</span>
                  <span class="tag" style="font-size:0.6rem;background:${tipoColor}18;color:${tipoColor};">${f.tipo}</span>
                </div>
                <div style="font-size:0.78rem;color:var(--text-secondary);">${this._esc(f.mensagem)}</div>
              </div>`;
            }).join('')}
          </div>` : ''}
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 2: PROJECTS
  // ══════════════════════════════════════════════════════════════════
  _renderProjects() {
    const p = this._personData;
    // Projetos simulados (baseados na BU/area)
    const projetos = [
      { nome: `Projeto ${p.bu || 'Geral'} Q1`, status: 'em_andamento', cor: 'var(--color-info)', papel: 'Membro', inicio: '2026-01-15', fim: '2026-03-31', progresso: 65 },
      { nome: `Campanha ${p.area || 'Interna'}`, status: 'concluido', cor: 'var(--color-success)', papel: 'Responsavel', inicio: '2025-11-01', fim: '2026-01-15', progresso: 100 },
      { nome: `Sprint Digital ${p.bu || 'TBO'}`, status: 'em_andamento', cor: 'var(--color-info)', papel: 'Colaborador', inicio: '2026-02-01', fim: '2026-04-30', progresso: 30 }
    ];

    return `
      <div class="card" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="font-size:0.95rem;margin:0;">Projetos de ${this._esc(p.nome.split(' ')[0])}</h3>
          <span class="tag" style="font-size:0.72rem;">${projetos.length} projetos</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;" id="ppProjectsList">
          ${projetos.map(pj => `
            <div class="pp-project-card" style="padding:16px;background:var(--bg-elevated);border-radius:8px;border-left:3px solid ${pj.cor};">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                <div>
                  <div style="font-weight:600;font-size:0.88rem;">${pj.nome}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${pj.papel} \u2022 ${new Date(pj.inicio).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} - ${new Date(pj.fim).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</div>
                </div>
                <span class="tag" style="font-size:0.65rem;background:${pj.cor}18;color:${pj.cor};">${pj.status === 'concluido' ? 'Concluido' : 'Em andamento'}</span>
              </div>
              <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${pj.progresso}%;background:${pj.cor};border-radius:2px;"></div>
              </div>
              <div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;text-align:right;">${pj.progresso}%</div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:12px;text-align:center;">
          <div style="font-size:0.75rem;color:var(--text-muted);padding:8px;background:var(--bg-elevated);border-radius:6px;">
            <i data-lucide="info" style="width:12px;height:12px;vertical-align:-2px;"></i>
            Projetos carregados localmente. Integracao Supabase em desenvolvimento.
          </div>
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 3: TASKS
  // ══════════════════════════════════════════════════════════════════
  _renderTasks() {
    return `
      <div class="card" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="font-size:0.95rem;margin:0;">Tarefas de ${this._esc(this._personData.nome.split(' ')[0])}</h3>
          ${this._isAdmin() ? `<button class="btn btn-primary btn-sm" id="ppNewTask">+ Nova Tarefa</button>` : ''}
        </div>
        <div id="ppTasksList">
          <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:0.8rem;">
            <i data-lucide="loader" style="width:16px;height:16px;animation:spin 1s linear infinite;"></i> Carregando tarefas...
          </div>
        </div>
      </div>
    `;
  },

  async _loadTasks() {
    const list = document.getElementById('ppTasksList');
    if (!list) return;

    const personId = this._personData.id;

    // Tentar Supabase
    if (typeof TBO_SUPABASE !== 'undefined') {
      try {
        const client = TBO_SUPABASE.getClient();
        const tenantId = TBO_SUPABASE.getCurrentTenantId();
        if (client && tenantId) {
          const { data, error } = await client.from('person_tasks')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('person_id', personId)
            .order('created_at', { ascending: false });
          if (!error && data) {
            list.innerHTML = this._renderTaskItems(data);
            if (window.lucide) lucide.createIcons();
            return;
          }
        }
      } catch (e) { /* fallback */ }
    }

    // Fallback: localStorage
    if (typeof TBO_RH !== 'undefined') {
      const tasks = TBO_RH._getStore('person_tasks_' + personId);
      list.innerHTML = this._renderTaskItems(tasks);
    } else {
      list.innerHTML = '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhuma tarefa encontrada</div>';
    }
    if (window.lucide) lucide.createIcons();
  },

  _renderTaskItems(tasks) {
    if (!tasks || !tasks.length) return '<div style="font-size:0.78rem;color:var(--text-muted);padding:12px 0;">Nenhuma tarefa encontrada</div>';

    const priorityColors = { alta: 'var(--color-danger)', media: 'var(--accent-gold)', baixa: 'var(--color-info)' };
    const categoryLabels = { pdi: 'PDI', onboarding: 'Onboard', '1on1_action': '1:1', general: 'Geral' };

    const pending = tasks.filter(t => t.status !== 'concluida');
    const done = tasks.filter(t => t.status === 'concluida');

    let html = '';
    if (pending.length) {
      html += `<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;font-weight:600;">Pendentes (${pending.length})</div>`;
      html += pending.map(t => `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:var(--bg-elevated);border-radius:8px;margin-bottom:6px;">
          <div style="width:6px;height:6px;border-radius:50%;background:${priorityColors[t.priority] || 'var(--text-muted)'};margin-top:6px;flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="font-size:0.82rem;font-weight:500;">${this._esc(t.title)}</div>
            <div style="display:flex;gap:4px;margin-top:4px;">
              <span class="tag" style="font-size:0.6rem;background:${priorityColors[t.priority] || 'var(--text-muted)'}18;color:${priorityColors[t.priority] || 'var(--text-muted)'};">${t.priority || 'media'}</span>
              <span class="tag" style="font-size:0.6rem;">${categoryLabels[t.category] || 'Geral'}</span>
              ${t.due_date ? `<span style="font-size:0.6rem;color:${new Date(t.due_date) < new Date() ? 'var(--color-danger)' : 'var(--text-muted)'};">${t.due_date}</span>` : ''}
            </div>
          </div>
        </div>`).join('');
    }
    if (done.length) {
      html += `<div style="font-size:0.75rem;color:var(--text-muted);margin:12px 0 8px;font-weight:600;">Concluidas (${done.length})</div>`;
      html += done.slice(0, 5).map(t => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:var(--bg-elevated);border-radius:8px;margin-bottom:4px;opacity:0.6;">
          <i data-lucide="check-circle" style="width:14px;height:14px;color:var(--color-success);flex-shrink:0;"></i>
          <span style="font-size:0.78rem;text-decoration:line-through;color:var(--text-muted);">${this._esc(t.title)}</span>
        </div>`).join('');
    }
    return html;
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 4: DEVELOPMENT
  // ══════════════════════════════════════════════════════════════════
  _renderDevelopment() {
    const p = this._personData;
    const reviews = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('avaliacoes_people') : [];
    const review = reviews.find(r => r.pessoaId === p.id);
    const competencias = typeof TBO_RH !== 'undefined' ? TBO_RH._competenciasRadar : [];
    const habilidades = typeof TBO_RH !== 'undefined' ? TBO_RH._habilidadesPDI : [];

    const nivelMap = ['Jr. I','Jr. II','Jr. III','Pleno I','Pleno II','Pleno III','Senior I','Senior II','Senior III','Lead','Principal'];
    const nivelIdx = nivelMap.indexOf(p.nivel);
    const proxNivel = nivelIdx >= 0 && nivelIdx < nivelMap.length - 1 ? nivelMap[nivelIdx + 1] : '\u2014';

    return `
      <div class="grid-2" style="gap:16px;">
        <!-- Nivel / Carreira -->
        <div class="card" style="padding:20px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
            <i data-lucide="compass" style="width:18px;height:18px;color:var(--color-info);"></i>
            <h3 style="font-size:0.92rem;margin:0;">Trilha de Carreira</h3>
          </div>
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
            <div style="text-align:center;padding:12px 20px;background:var(--bg-elevated);border-radius:8px;border:2px solid var(--accent-gold);">
              <div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:2px;">Nivel Atual</div>
              <div style="font-size:1.1rem;font-weight:800;color:var(--accent-gold);">${this._esc(p.nivel || '\u2014')}</div>
            </div>
            <div style="font-size:1.2rem;color:var(--text-muted);">\u2192</div>
            <div style="text-align:center;padding:12px 20px;background:var(--bg-elevated);border-radius:8px;border:2px dashed var(--color-info);">
              <div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:2px;">Proximo</div>
              <div style="font-size:1.1rem;font-weight:800;color:var(--color-info);">${this._esc(proxNivel)}</div>
            </div>
          </div>
          <!-- Timeline niveis -->
          <div style="display:flex;align-items:center;gap:4px;overflow-x:auto;padding:4px 0;">
            ${nivelMap.map((n, i) => {
              const isCurrent = n === p.nivel;
              const isPast = i < nivelIdx;
              const color = isCurrent ? 'var(--accent-gold)' : isPast ? 'var(--color-success)' : 'var(--text-muted)';
              return `<div style="display:flex;align-items:center;gap:2px;">
                <div style="width:${isCurrent ? 20 : 12}px;height:${isCurrent ? 20 : 12}px;border-radius:50%;background:${isCurrent ? color : isPast ? color + '40' : 'var(--bg-tertiary)'};border:2px solid ${color};flex-shrink:0;${isCurrent ? 'box-shadow:0 0 0 3px ' + color + '30;' : ''}"></div>
                ${i < nivelMap.length - 1 ? `<div style="width:${isCurrent ? 16 : 8}px;height:2px;background:${isPast ? 'var(--color-success)' : 'var(--bg-tertiary)'};"></div>` : ''}
              </div>`;
            }).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:var(--text-muted);margin-top:4px;">
            <span>Jr. I</span><span>Principal</span>
          </div>
        </div>

        <!-- Competencias Radar -->
        ${review ? `
        <div class="card" style="padding:20px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <i data-lucide="radar" style="width:18px;height:18px;color:var(--accent-gold);"></i>
            <h3 style="font-size:0.92rem;margin:0;">Competencias</h3>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${competencias.map(c => {
              const autoScore = review.autoScores.find(s => s.comp === c.id)?.nota || 0;
              const gestorScore = review.gestorScores.find(s => s.comp === c.id)?.nota || 0;
              const avgScore = ((autoScore + gestorScore) / 2).toFixed(1);
              const color = avgScore >= 4 ? 'var(--color-success)' : avgScore >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)';
              return `<div style="padding:10px;background:var(--bg-elevated);border-radius:8px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span style="font-size:0.75rem;font-weight:500;">${c.nome}</span>
                  <span style="font-size:0.82rem;font-weight:700;color:${color};">${avgScore}</span>
                </div>
                <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                  <div style="height:100%;width:${(avgScore / 5) * 100}%;background:${color};border-radius:2px;"></div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>` : `
        <div class="card" style="padding:20px;">
          <div style="text-align:center;padding:30px;color:var(--text-muted);font-size:0.82rem;">
            Avaliacao de competencias nao disponivel
          </div>
        </div>`}
      </div>

      <!-- Habilidades PDI -->
      <div class="card" style="margin-top:16px;padding:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <i data-lucide="book-open" style="width:18px;height:18px;color:var(--color-purple, #8b5cf6);"></i>
          <h3 style="font-size:0.92rem;margin:0;">Plano de Desenvolvimento Individual (PDI)</h3>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;">
          ${habilidades.map(h => {
            const progress = Math.floor(Math.random() * 80) + 10;
            const color = progress >= 70 ? 'var(--color-success)' : progress >= 40 ? 'var(--accent-gold)' : 'var(--color-info)';
            return `<div style="padding:12px;background:var(--bg-elevated);border-radius:8px;">
              <div style="font-size:0.78rem;font-weight:500;margin-bottom:8px;">${h.nome}</div>
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${progress}%;background:${color};border-radius:3px;"></div>
                </div>
                <span style="font-size:0.72rem;font-weight:600;color:${color};">${progress}%</span>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 5: ACTIVITY (Audit/Timeline)
  // ══════════════════════════════════════════════════════════════════
  _renderActivity() {
    const p = this._personData;

    // Gerar timeline simulada de atividades
    const now = new Date();
    const activities = [
      { tipo: 'login', desc: 'Login no sistema', data: p.ultimoLogin || now.toISOString(), icon: 'log-in', color: 'var(--color-info)' },
      { tipo: 'task', desc: 'Concluiu tarefa: Entrega do projeto Q1', data: new Date(now - 2 * 86400000).toISOString(), icon: 'check-circle', color: 'var(--color-success)' },
      { tipo: 'feedback', desc: 'Recebeu feedback positivo', data: new Date(now - 5 * 86400000).toISOString(), icon: 'message-square', color: 'var(--color-purple, #8b5cf6)' },
      { tipo: 'project', desc: `Adicionado ao projeto Sprint ${p.bu || 'Digital'}`, data: new Date(now - 10 * 86400000).toISOString(), icon: 'folder-plus', color: 'var(--accent-gold)' },
      { tipo: '1on1', desc: '1:1 realizada com gestor', data: new Date(now - 14 * 86400000).toISOString(), icon: 'users', color: 'var(--color-info)' },
      { tipo: 'elogio', desc: 'Recebeu reconhecimento: Excelencia Tecnica', data: new Date(now - 20 * 86400000).toISOString(), icon: 'award', color: 'var(--accent-gold)' },
      { tipo: 'role', desc: `Role atualizado para ${p.rbacLabel || p.rbacRole || 'Artist'}`, data: new Date(now - 30 * 86400000).toISOString(), icon: 'shield', color: 'var(--text-muted)' },
      { tipo: 'onboarding', desc: 'Onboarding concluido', data: p.dataEntrada || new Date(now - 90 * 86400000).toISOString(), icon: 'compass', color: 'var(--color-success)' }
    ];

    return `
      <div class="card" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="font-size:0.95rem;margin:0;">Historico de Atividades</h3>
          <span style="font-size:0.72rem;color:var(--text-muted);">Ultimos 90 dias</span>
        </div>
        <div class="pp-timeline">
          ${activities.map((a, i) => `
            <div class="pp-timeline-item" style="display:flex;gap:14px;padding-bottom:20px;position:relative;">
              <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
                <div style="width:32px;height:32px;border-radius:50%;background:${a.color}15;display:flex;align-items:center;justify-content:center;">
                  <i data-lucide="${a.icon}" style="width:15px;height:15px;color:${a.color};"></i>
                </div>
                ${i < activities.length - 1 ? `<div style="width:2px;flex:1;background:var(--border-subtle);margin-top:6px;"></div>` : ''}
              </div>
              <div style="flex:1;padding-top:4px;">
                <div style="font-size:0.82rem;font-weight:500;">${a.desc}</div>
                <div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px;">
                  ${new Date(a.data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  ${a.tipo === 'login' ? ` \u2022 ${new Date(a.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="text-align:center;padding:12px;font-size:0.75rem;color:var(--text-muted);background:var(--bg-elevated);border-radius:8px;margin-top:8px;">
          <i data-lucide="info" style="width:12px;height:12px;vertical-align:-2px;"></i>
          Audit log completo sera carregado do Supabase (tabela audit_logs)
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 6: CUSTOS (admin-only)
  // ══════════════════════════════════════════════════════════════════
  _renderCustos() {
    const p = this._personData;
    const fmt = typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER : { currency: v => `R$ ${Number(v || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}` };

    // Calcular tempo de casa
    let tenure = '\u2014';
    if (p.dataEntrada) {
      const start = new Date(p.dataEntrada);
      const now = new Date();
      const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      const years = Math.floor(months / 12);
      const remainMonths = months % 12;
      tenure = years > 0 ? `${years}a ${remainMonths}m` : `${remainMonths}m`;
    }

    const contractLabel = { 'pj': 'PJ (Pessoa Juridica)', 'clt': 'CLT', 'freelancer': 'Freelancer', 'estagio': 'Estagio', 'socio': 'Socio' };
    const contractBadge = p.contractType
      ? `<span class="tag" style="font-size:0.72rem;background:var(--color-info)15;color:var(--color-info);">${contractLabel[p.contractType] || p.contractType}</span>`
      : '<span style="color:var(--text-muted);font-size:0.78rem;">\u2014</span>';

    return `
      <div class="grid-2" style="gap:16px;">
        <!-- Resumo de Custos -->
        <div class="card" style="padding:20px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
            <i data-lucide="dollar-sign" style="width:18px;height:18px;color:var(--color-success);"></i>
            <h3 style="font-size:0.95rem;margin:0;">Remuneracao</h3>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">Valor Mensal</div>
              <div style="font-size:1.5rem;font-weight:800;color:var(--color-success);">${p.custoMensal ? fmt.currency(p.custoMensal) : '\u2014'}</div>
            </div>
            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">Valor Anual (est.)</div>
              <div style="font-size:1.1rem;font-weight:600;color:var(--text-primary);">${p.custoMensal ? fmt.currency(p.custoMensal * 12) : '\u2014'}</div>
            </div>
            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">Tipo de Contrato</div>
              <div style="margin-top:4px;">${contractBadge}</div>
            </div>
            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">Tempo de Casa</div>
              <div style="font-size:1.1rem;font-weight:600;">${tenure}</div>
            </div>
          </div>
          ${p.dataEntrada ? `
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-subtle);">
            <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">Data de Inicio</div>
            <div style="font-size:0.85rem;">${new Date(p.dataEntrada).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>` : ''}
        </div>

        <!-- Historico de Custos -->
        <div class="card" style="padding:20px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
            <i data-lucide="history" style="width:18px;height:18px;color:var(--accent-gold);"></i>
            <h3 style="font-size:0.95rem;margin:0;">Historico de Alteracoes</h3>
          </div>
          <div id="ppCostHistory">
            <div style="text-align:center;padding:30px;color:var(--text-muted);font-size:0.78rem;">
              <i data-lucide="loader" style="width:20px;height:20px;animation:spin 1s linear infinite;"></i>
              <div style="margin-top:8px;">Carregando historico...</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Carrega historico de custos async
  async _loadCostHistory() {
    const container = document.getElementById('ppCostHistory');
    if (!container || !this._personData?.supabaseId) return;

    try {
      if (typeof PeopleRepo === 'undefined') throw new Error('PeopleRepo indisponivel');
      const history = await PeopleRepo.getHistory(this._personData.supabaseId, { field: 'salary_pj', limit: 20 });

      if (!history.length) {
        container.innerHTML = `
          <div style="text-align:center;padding:30px;color:var(--text-muted);font-size:0.78rem;">
            <i data-lucide="file-text" style="width:24px;height:24px;"></i>
            <div style="margin-top:8px;">Nenhuma alteracao de custo registrada</div>
          </div>`;
        if (window.lucide) lucide.createIcons();
        return;
      }

      const fmt = typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER : { currency: v => `R$ ${Number(v || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}` };

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${history.map(h => `
            <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:var(--bg-elevated);border-radius:8px;">
              <i data-lucide="arrow-right" style="width:14px;height:14px;color:var(--accent-gold);flex-shrink:0;"></i>
              <div style="flex:1;min-width:0;">
                <div style="font-size:0.78rem;">
                  ${h.old_value ? `<span style="color:var(--text-muted);text-decoration:line-through;">${fmt.currency(h.old_value)}</span> →` : ''}
                  <span style="font-weight:600;color:var(--color-success);">${fmt.currency(h.new_value)}</span>
                </div>
              </div>
              <div style="font-size:0.68rem;color:var(--text-muted);flex-shrink:0;">
                ${new Date(h.changed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          `).join('')}
        </div>`;
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.78rem;">Historico indisponivel</div>`;
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 7: ACESSO / PERMISSOES (admin-only)
  // ══════════════════════════════════════════════════════════════════
  _renderAcesso() {
    const p = this._personData;
    const rbacColor = p.rbacColor || '#94a3b8';

    // Modulos do sistema para matrix de permissoes
    const modules = [
      { key: 'projects', label: 'Projetos', icon: 'folder' },
      { key: 'tasks', label: 'Tarefas', icon: 'check-square' },
      { key: 'users', label: 'Pessoas', icon: 'users' },
      { key: 'finance', label: 'Financeiro', icon: 'dollar-sign' },
      { key: 'crm', label: 'CRM', icon: 'briefcase' },
      { key: 'meetings', label: 'Reunioes', icon: 'video' },
      { key: 'reports', label: 'Relatorios', icon: 'bar-chart-3' },
      { key: 'settings', label: 'Configuracoes', icon: 'settings' }
    ];

    const actions = ['view', 'create', 'edit', 'delete'];
    const actionLabels = { view: 'Ver', create: 'Criar', edit: 'Editar', delete: 'Excluir' };

    return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Role RBAC atual -->
        <div class="card" style="padding:20px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
            <i data-lucide="shield" style="width:18px;height:18px;color:${rbacColor};"></i>
            <h3 style="font-size:0.95rem;margin:0;">Papel de Acesso (RBAC)</h3>
          </div>
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="padding:12px 20px;border-radius:12px;background:${rbacColor}12;border:2px solid ${rbacColor}30;">
              <div style="font-size:1.1rem;font-weight:800;color:${rbacColor};">${this._esc(p.rbacLabel || p.rbacRole || 'Membro')}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">slug: ${this._esc(p.rbacRole || 'member')}</div>
            </div>
            <div style="flex:1;">
              <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">
                ${p.isCoordinator ? '<i data-lucide="star" style="width:12px;height:12px;color:var(--accent-gold);vertical-align:-2px;"></i> Coordenador de equipe<br>' : ''}
                Este papel define as permissoes de acesso ao sistema. Alteracoes requerem role admin ou superior.
              </div>
            </div>
          </div>
        </div>

        <!-- Matrix de Permissoes -->
        <div class="card" style="padding:20px;overflow:hidden;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
            <i data-lucide="lock" style="width:18px;height:18px;color:var(--color-info);"></i>
            <h3 style="font-size:0.95rem;margin:0;">Matriz de Permissoes</h3>
            <span style="font-size:0.68rem;color:var(--text-muted);margin-left:auto;">Baseado no role: ${this._esc(p.rbacLabel || p.rbacRole)}</span>
          </div>
          <div id="ppPermMatrix">
            <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.78rem;">
              <i data-lucide="loader" style="width:20px;height:20px;animation:spin 1s linear infinite;"></i>
              <div style="margin-top:8px;">Carregando permissoes...</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Carrega permissoes async e popula matrix
  async _loadPermissions() {
    const container = document.getElementById('ppPermMatrix');
    if (!container || !this._personData?.supabaseId) return;

    const modules = [
      { key: 'projects', label: 'Projetos', icon: 'folder' },
      { key: 'tasks', label: 'Tarefas', icon: 'check-square' },
      { key: 'users', label: 'Pessoas', icon: 'users' },
      { key: 'finance', label: 'Financeiro', icon: 'dollar-sign' },
      { key: 'crm', label: 'CRM', icon: 'briefcase' },
      { key: 'meetings', label: 'Reunioes', icon: 'video' },
      { key: 'reports', label: 'Relatorios', icon: 'bar-chart-3' },
      { key: 'settings', label: 'Configuracoes', icon: 'settings' }
    ];
    const actions = ['view', 'create', 'edit', 'delete'];
    const actionLabels = { view: 'Ver', create: 'Criar', edit: 'Editar', delete: 'Excluir' };

    try {
      // Tentar carregar permissoes via TBO_AUTH (check canDo para cada combo)
      const perms = {};
      modules.forEach(m => {
        perms[m.key] = {};
        actions.forEach(a => {
          // Usar TBO_PERMISSIONS se disponivel (resolve para o usuario target)
          if (typeof TBO_PERMISSIONS !== 'undefined') {
            perms[m.key][a] = TBO_PERMISSIONS.canDo(m.key, a, this._personData.rbacRole);
          } else {
            // Fallback: roles admin tem tudo, artist tem view
            const r = this._personData.rbacRole;
            if (['owner', 'admin', 'founder', 'diretor'].includes(r)) perms[m.key][a] = true;
            else if (['coordinator', 'project_owner'].includes(r)) perms[m.key][a] = (a !== 'delete' || m.key === 'tasks');
            else perms[m.key][a] = (a === 'view');
          }
        });
      });

      container.innerHTML = `
        <div style="overflow-x:auto;">
          <table class="data-table" style="min-width:500px;font-size:0.78rem;">
            <thead>
              <tr>
                <th style="min-width:140px;">Modulo</th>
                ${actions.map(a => `<th style="text-align:center;min-width:65px;">${actionLabels[a]}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${modules.map(m => `
                <tr>
                  <td style="font-weight:500;">
                    <div style="display:flex;align-items:center;gap:6px;">
                      <i data-lucide="${m.icon}" style="width:13px;height:13px;color:var(--text-muted);"></i>
                      ${m.label}
                    </div>
                  </td>
                  ${actions.map(a => {
                    const allowed = perms[m.key][a];
                    return `<td style="text-align:center;">
                      <i data-lucide="${allowed ? 'check-circle' : 'x-circle'}" style="width:16px;height:16px;color:${allowed ? 'var(--color-success)' : 'var(--text-muted)'};"></i>
                    </td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.78rem;">Erro ao carregar permissoes</div>`;
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // SCOPED CSS
  // ══════════════════════════════════════════════════════════════════
  _getScopedCSS() {
    return `
      .pp-module { max-width: 1200px; }
      .pp-identity { padding: 24px; }
      .pp-info-item { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-secondary); }
      .pp-info-item i { color: var(--text-muted); flex-shrink: 0; }
      .pp-tabs .tab { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; }
      .pp-timeline-item:last-child { padding-bottom: 0; }
      .pp-colleague-link:hover div { background: var(--bg-tertiary) !important; }
      .pp-project-card { transition: border-color 0.2s; }
      .pp-project-card:hover { border-color: var(--accent-gold); }
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // INIT (Event Bindings)
  // ══════════════════════════════════════════════════════════════════
  async init() {
    // Voltar para equipe
    this._bind('ppBackBtn', () => TBO_ROUTER.navigate('rh'));

    // Tab switching
    document.querySelectorAll('#ppTabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const newTab = tab.dataset.tab;
        this._activeTab = newTab;

        // Update URL
        window.location.hash = `people/${this._personId}/${newTab}`;

        // Update visual
        document.querySelectorAll('#ppTabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Re-render tab content
        const content = document.getElementById('ppTabContent');
        if (content) {
          content.innerHTML = this._renderActiveTab();
          this._initActiveTab();
        }
      });
    });

    // Init tab-specific bindings
    await this._initActiveTab();
  },

  async _initActiveTab() {
    // Carregar tarefas se na tab tasks
    if (this._activeTab === 'tasks') {
      await this._loadTasks();
    }
    // Carregar historico de custos async
    if (this._activeTab === 'custos') {
      this._loadCostHistory();
    }
    // Carregar permissoes async
    if (this._activeTab === 'acesso') {
      this._loadPermissions();
    }
    // Hover Card — bind em data-person-id
    if (typeof TBO_HOVER_CARD !== 'undefined') {
      const ppModule = document.querySelector('.pp-module');
      if (ppModule) TBO_HOVER_CARD.bind(ppModule);
    }
    // Lucide icons
    if (window.lucide) lucide.createIcons();
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  // Skeleton para loading inicial
  _renderSkeleton() {
    return `
      <div style="padding:24px;">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:24px;">
          <div class="rh-skeleton" style="width:80px;height:80px;border-radius:50%;"></div>
          <div>
            <div class="rh-skeleton" style="width:200px;height:18px;border-radius:4px;margin-bottom:8px;"></div>
            <div class="rh-skeleton" style="width:140px;height:12px;border-radius:4px;margin-bottom:6px;"></div>
            <div class="rh-skeleton" style="width:180px;height:10px;border-radius:4px;"></div>
          </div>
        </div>
        <div class="rh-skeleton" style="width:100%;height:36px;border-radius:4px;margin-bottom:16px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="rh-skeleton" style="width:100%;height:300px;border-radius:8px;"></div>
          <div class="rh-skeleton" style="width:100%;height:300px;border-radius:8px;"></div>
        </div>
      </div>`;
  },

  destroy() {
    // Limpar state ao sair
    this._personData = null;
    this._personId = null;
  }
};
