// TBO OS — People Tab: Cultura & Reconhecimento
// Sub-modulo lazy-loaded: valores, reconhecimentos, rituais, feedbacks, historico, onboarding

(function() {
  const S = TBO_PEOPLE_SHARED;

  const TabCultura = {
    // Cache de dados Supabase para Cultura (evita re-fetch durante subtab switch)
    _culturaElogiosCache: null,
    _culturaFeedbacksCache: null,

    // ── Render principal ──
    render() {
      const elogios = this._culturaElogiosCache || S._getStore('elogios');
      const feedbacks = this._culturaFeedbacksCache || S._getStore('feedbacks');
      const userId = S._currentUserId();
      const isAdmin = S._isAdmin();
      const sub = S._culturaSubTab || 'valores';

      // Carregar dados do Supabase async (atualiza cache e re-renderiza)
      this._loadCulturaFromSupabase();

      return `
        ${S._pageHeader('Cultura & Reconhecimento', 'Valores, reconhecimentos, rituais e feedbacks')}
        <div class="tab-bar tab-bar--sub" id="rhCulturaSubtabs" style="margin-bottom:16px;">
          <button class="tab tab--sub ${sub === 'valores' ? 'active' : ''}" data-cultura-tab="valores"><i data-lucide="gem" style="width:14px;height:14px;"></i> Valores TBO</button>
          <button class="tab tab--sub ${sub === 'reconhecimentos' ? 'active' : ''}" data-cultura-tab="reconhecimentos"><i data-lucide="award" style="width:14px;height:14px;"></i> Reconhecimentos</button>
          <button class="tab tab--sub ${sub === 'rituais' ? 'active' : ''}" data-cultura-tab="rituais"><i data-lucide="repeat" style="width:14px;height:14px;"></i> Rituais</button>
          <button class="tab tab--sub ${sub === 'feedbacks' ? 'active' : ''}" data-cultura-tab="feedbacks"><i data-lucide="message-square" style="width:14px;height:14px;"></i> Feedbacks</button>
          <button class="tab tab--sub ${sub === 'historico' ? 'active' : ''}" data-cultura-tab="historico"><i data-lucide="clock" style="width:14px;height:14px;"></i> Historico</button>
          <button class="tab tab--sub ${sub === 'onboarding' ? 'active' : ''}" data-cultura-tab="onboarding"><i data-lucide="book-open" style="width:14px;height:14px;"></i> Onboarding</button>
        </div>
        <div id="rhCulturaContent">
          ${this._renderCulturaSubTab(sub, elogios, feedbacks, userId, isAdmin)}
        </div>
      `;
    },

    // ── Init (bindings apos render) ──
    init() {
      // Cultura subtab switching
      document.querySelectorAll('#rhCulturaSubtabs .tab--sub').forEach(tab => {
        tab.addEventListener('click', () => {
          const subTab = tab.dataset.culturaTab;
          S._culturaSubTab = subTab;
          // Atualizar visual das subtabs
          document.querySelectorAll('#rhCulturaSubtabs .tab--sub').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          // Re-renderizar conteudo da subtab
          const content = document.getElementById('rhCulturaContent');
          if (content) {
            content.innerHTML = this._renderCulturaSubTab(subTab);
            if (window.lucide) lucide.createIcons({ root: content });
            this._bindCulturaContent();
            // Carregar dados async de onboarding se subtab onboarding
            if (subTab === 'onboarding') this._loadOnboardingData();
          }
          // Atualizar hash para deep link do sidebar
          const newHash = `rh/cultura/${subTab}`;
          history.replaceState(null, '', '#' + newHash);
          if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
            TBO_SIDEBAR_RENDERER.setActive(newHash);
          }
        });
      });
      // Bind interacoes da tab Cultura (elogios, feedbacks)
      this._bindCulturaContent();
    },

    /**
     * Carrega elogios e feedbacks do Supabase e atualiza cache.
     * Re-renderiza conteudo Cultura quando dados chegam.
     */
    async _loadCulturaFromSupabase() {
      try {
        // Carregar elogios do Supabase
        if (typeof RecognitionsRepo !== 'undefined') {
          const { data: recs } = await RecognitionsRepo.list({ limit: 200 });
          // Mapear para formato compativel com render existente
          this._culturaElogiosCache = (recs || []).map(r => ({
            id: r.id,
            de: this._findUsernameBySupabaseId(r.from_user) || r.from_user,
            para: this._findUsernameBySupabaseId(r.to_user) || r.to_user,
            valor: r.value_id,
            mensagem: r.message,
            curtidas: r.likes || 0,
            data: r.created_at,
            _supabase: true
          }));
        }

        // Carregar feedbacks do Supabase
        if (typeof FeedbacksRepo !== 'undefined') {
          const { data: fbs } = await FeedbacksRepo.list({ limit: 200 });
          this._culturaFeedbacksCache = (fbs || []).map(f => ({
            id: f.id,
            de: this._findUsernameBySupabaseId(f.from_user) || f.from_user,
            para: this._findUsernameBySupabaseId(f.to_user) || f.to_user,
            tipo: f.type,
            visibilidade: f.visibility === 'public' ? 'publico' : 'privado',
            mensagem: f.message,
            data: f.created_at,
            _supabase: true
          }));
        }

        // Re-renderizar conteudo se estiver na tab cultura
        if (S._activeTab === 'cultura') {
          const content = document.getElementById('rhCulturaContent');
          if (content) {
            const sub = S._culturaSubTab || 'valores';
            content.innerHTML = this._renderCulturaSubTab(sub);
            if (window.lucide) lucide.createIcons({ root: content });
            this._bindCulturaContent();
            if (sub === 'onboarding') this._loadOnboardingData();
          }
        }
      } catch (e) {
        console.warn('[RH] Erro ao carregar dados de Cultura do Supabase:', e.message);
        // Fallback silencioso — usa localStorage
      }
    },

    /**
     * Helper: encontra username a partir de supabaseId
     */
    _findUsernameBySupabaseId(supabaseId) {
      const person = S._team.find(t => t.supabaseId === supabaseId);
      return person ? person.id : null;
    },

    /**
     * Helper: encontra supabaseId a partir de username
     */
    _findSupabaseIdByUsername(username) {
      const person = S._team.find(t => t.id === username);
      return person ? person.supabaseId : null;
    },

    _renderCulturaSubTab(sub, elogios, feedbacks, userId, isAdmin) {
      // Carregar dados: preferir cache Supabase, fallback localStorage
      if (!elogios) elogios = this._culturaElogiosCache || S._getStore('elogios');
      if (!feedbacks) feedbacks = this._culturaFeedbacksCache || S._getStore('feedbacks');
      if (!userId) userId = S._currentUserId();
      if (isAdmin === undefined) isAdmin = S._isAdmin();

      switch (sub) {
        case 'valores': return this._renderCulturaValores(elogios);
        case 'reconhecimentos': return this._renderCulturaReconhecimentos(elogios);
        case 'rituais': return this._renderCulturaRituais();
        case 'feedbacks': return this._renderCulturaFeedbacks(feedbacks, userId, isAdmin);
        case 'historico': return this._renderCulturaHistorico(elogios, feedbacks);
        case 'onboarding': return this._renderCulturaOnboarding(userId);
        default: return this._renderCulturaValores(elogios);
      }
    },

    // ── Sub: Valores TBO ──
    _renderCulturaValores(elogios) {
      const valorCount = {};
      elogios.forEach(e => { valorCount[e.valor] = (valorCount[e.valor] || 0) + 1; });
      const totalElogios = elogios.length;

      return `
        <div class="card" style="padding:20px;margin-bottom:16px;">
          <h3 style="font-size:1rem;margin-bottom:16px;">Nossos Valores</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;">
            ${S._valores.map(v => {
              const count = valorCount[v.id] || 0;
              const pct = totalElogios ? Math.round((count / totalElogios) * 100) : 0;
              return `<div style="background:var(--bg-elevated);border-radius:12px;padding:16px;text-align:center;border:1px solid var(--border-subtle);">
                <div style="font-size:2.2rem;margin-bottom:8px;">${v.emoji}</div>
                <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">${v.nome}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">${count} reconhecimento${count !== 1 ? 's' : ''}</div>
                <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                  <div style="height:100%;width:${pct}%;background:var(--accent-gold);border-radius:2px;transition:width 0.5s;"></div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.9rem;margin-bottom:12px;">O que cada valor significa</h4>
          <div style="display:grid;gap:12px;">
            ${[
              { v: S._valores[0], desc: 'Buscamos a melhor qualidade em cada entrega. Detalhes importam.' },
              { v: S._valores[1], desc: 'O sucesso do cliente e o nosso sucesso. Entendemos antes de executar.' },
              { v: S._valores[2], desc: 'Trabalhamos juntos, compartilhamos conhecimento e celebramos conquistas.' },
              { v: S._valores[3], desc: 'Experimentamos, erramos rapido e melhoramos. Status quo e nosso inimigo.' },
              { v: S._valores[4], desc: 'Cada um e dono do seu trabalho. Assumimos responsabilidades com orgulho.' },
              { v: S._valores[5], desc: 'Vamos alem do esperado. Entregamos mais do que foi pedido.' }
            ].map(({ v, desc }) => `<div style="display:flex;gap:12px;align-items:flex-start;padding:12px;background:var(--bg-elevated);border-radius:8px;">
              <span style="font-size:1.4rem;">${v.emoji}</span>
              <div><div style="font-weight:600;font-size:0.85rem;margin-bottom:2px;">${v.nome}</div><div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">${desc}</div></div>
            </div>`).join('')}
          </div>
        </div>
      `;
    },

    // ── Sub: Reconhecimentos (mural de elogios) ──
    _renderCulturaReconhecimentos(elogios) {
      const personCount = {};
      elogios.forEach(e => { personCount[e.para] = (personCount[e.para] || 0) + 1; });
      const topPeople = Object.entries(personCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

      return `
        <div class="card" style="padding:16px;margin-bottom:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:10px;">Mais Reconhecidos</h4>
          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            ${topPeople.map(([id, count], i) => {
              const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
              const p = S._getPerson(id);
              const avatar = S._profileMap[p?.supabaseId]?.avatar_url;
              return `<div style="text-align:center;min-width:80px;">
                <div style="width:48px;height:48px;border-radius:50%;background:var(--bg-tertiary);margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;overflow:hidden;">
                  ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;">` : medals[i] || (i + 1)}
                </div>
                <div style="font-size:0.78rem;font-weight:600;">${S._getPersonName(id)}</div>
                <div style="font-size:0.68rem;color:var(--accent-gold);">${count} elogio${count !== 1 ? 's' : ''}</div>
              </div>`;
            }).join('') || '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhum elogio ainda</div>'}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Mural de Elogios</h3><button class="btn btn-primary btn-sm" id="rhNewElogio">+ Elogiar</button></div>
          <div id="rhElogioForm" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Para</label><select class="form-input" id="elPara">${S._team.filter(t => !t.terceirizado).map(t => `<option value="${t.supabaseId || t.id}" data-username="${t.id}">${t.nome}</option>`).join('')}</select></div>
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Valor TBO</label><select class="form-input" id="elValor">${S._valores.map(v => `<option value="${v.id}">${v.emoji} ${v.nome}</option>`).join('')}</select></div>
            </div>
            <div class="form-group" style="margin-bottom:12px;"><label class="form-label">Mensagem</label><textarea class="form-input" id="elTexto" rows="2" placeholder="Por que esta pessoa merece reconhecimento?"></textarea></div>
            <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" id="elSave">Publicar</button><button class="btn btn-secondary btn-sm" id="elCancel">Cancelar</button></div>
          </div>
          <div id="rhElogioList" style="max-height:500px;overflow-y:auto;">
            ${this._renderElogioItems(elogios)}
          </div>
        </div>
      `;
    },

    // ── Sub: Rituais ──
    _renderCulturaRituais() {
      const rituais = [
        { nome: 'Daily Socios', freq: 'Diaria', desc: 'Alinhamento rapido entre fundadores sobre prioridades do dia.', icon: 'sun', color: '#F59E0B' },
        { nome: '1:1 Mensal', freq: 'Mensal', desc: 'Conversa individual de PDI e feedback bidirecional entre gestor e liderado.', icon: 'users', color: '#3B82F6' },
        { nome: 'Review Semanal', freq: 'Semanal', desc: 'Revisao de entregas por BU com alinhamento de qualidade e prazos.', icon: 'check-circle', color: '#10B981' },
        { nome: 'Retrospectiva', freq: 'Mensal', desc: 'O que foi bem, o que melhorar e acoes concretas para o proximo ciclo.', icon: 'refresh-ccw', color: '#8B5CF6' },
        { nome: 'All Hands', freq: 'Trimestral', desc: 'Reuniao geral: resultados do trimestre, visao e proximos passos.', icon: 'megaphone', color: '#EC4899' },
        { nome: 'Celebracao de Entregas', freq: 'Semanal', desc: 'Reconhecimento publico das melhores entregas da semana.', icon: 'party-popper', color: '#F59E0B' },
        { nome: 'Cafe com a Diretoria', freq: 'Mensal', desc: 'Conversa informal entre qualquer membro e os co-CEOs, sem pauta fixa.', icon: 'coffee', color: '#92400E' }
      ];

      return `
        <div class="card" style="padding:20px;">
          <h3 style="font-size:1rem;margin-bottom:16px;">Rituais da TBO</h3>
          <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:20px;line-height:1.5;">
            Rituais sao a espinha dorsal da nossa cultura. Eles garantem alinhamento, feedback continuo e celebracao de conquistas.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
            ${rituais.map(r => `<div style="padding:16px;background:var(--bg-elevated);border-radius:12px;border-left:4px solid ${r.color};">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="width:36px;height:36px;border-radius:8px;background:${r.color}15;display:flex;align-items:center;justify-content:center;">
                  <i data-lucide="${r.icon}" style="width:18px;height:18px;color:${r.color};"></i>
                </div>
                <div>
                  <div style="font-weight:700;font-size:0.88rem;">${r.nome}</div>
                  <span class="tag" style="font-size:0.62rem;background:${r.color}20;color:${r.color};">${r.freq}</span>
                </div>
              </div>
              <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">${r.desc}</div>
            </div>`).join('')}
          </div>
        </div>
      `;
    },

    // ── Sub: Feedbacks ──
    _renderCulturaFeedbacks(feedbacks, userId, isAdmin) {
      let filteredFb = feedbacks;
      if (!isAdmin) filteredFb = feedbacks.filter(f => f.de === userId || f.para === userId || f.visibilidade === 'publico');

      const positivos = filteredFb.filter(f => f.tipo === 'positivo').length;
      const construtivos = filteredFb.filter(f => f.tipo === 'construtivo').length;

      return `
        <div class="grid-3" style="gap:12px;margin-bottom:16px;">
          <div class="kpi-card"><div class="kpi-label">Total Feedbacks</div><div class="kpi-value">${filteredFb.length}</div></div>
          <div class="kpi-card kpi-card--success"><div class="kpi-label">Positivos</div><div class="kpi-value">${positivos}</div></div>
          <div class="kpi-card kpi-card--warning"><div class="kpi-label">Construtivos</div><div class="kpi-value">${construtivos}</div></div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Feedbacks</h3><button class="btn btn-primary btn-sm" id="rhNewFeedback">+ Feedback</button></div>
          <div id="rhFeedbackForm" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Para</label><select class="form-input" id="fbPara">${S._team.filter(t => !t.terceirizado).map(t => `<option value="${t.supabaseId || t.id}" data-username="${t.id}">${t.nome}</option>`).join('')}</select></div>
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Tipo</label><select class="form-input" id="fbTipo"><option value="positivo">Positivo</option><option value="construtivo">Construtivo</option></select></div>
            </div>
            <div class="form-group" style="margin-bottom:12px;"><label class="form-label">Mensagem</label><textarea class="form-input" id="fbTexto" rows="2" placeholder="Descreva o feedback..."></textarea></div>
            <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" id="fbSave">Enviar</button><button class="btn btn-secondary btn-sm" id="fbCancel">Cancelar</button></div>
          </div>
          <div id="rhFeedbackList" style="max-height:500px;overflow-y:auto;">
            ${this._renderFeedbackItems(filteredFb)}
          </div>
        </div>
      `;
    },

    // ── Sub: Historico Cultural ──
    _renderCulturaHistorico(elogios, feedbacks) {
      // Unificar elogios e feedbacks em timeline
      const events = [];
      elogios.forEach(e => {
        const v = S._valores.find(v2 => v2.id === e.valor);
        events.push({
          type: 'elogio',
          date: new Date(e.data),
          emoji: v?.emoji || '\u2B50',
          title: `${S._getPersonName(e.de)} reconheceu ${S._getPersonName(e.para)}`,
          detail: `${v?.nome || 'Valor'}: ${S._esc(e.mensagem)}`,
          color: '#F59E0B'
        });
      });
      feedbacks.forEach(f => {
        events.push({
          type: 'feedback',
          date: new Date(f.data),
          emoji: f.tipo === 'positivo' ? '\u{1F44D}' : '\u{1F4AC}',
          title: `Feedback ${f.tipo} de ${S._getPersonName(f.de)} para ${S._getPersonName(f.para)}`,
          detail: S._esc(f.mensagem),
          color: f.tipo === 'positivo' ? '#10B981' : '#F59E0B'
        });
      });
      events.sort((a, b) => b.date - a.date);

      // Agrupar por mes
      const byMonth = {};
      events.forEach(ev => {
        const key = ev.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        if (!byMonth[key]) byMonth[key] = [];
        byMonth[key].push(ev);
      });

      return `
        <div class="card" style="padding:20px;">
          <h3 style="font-size:1rem;margin-bottom:16px;">Timeline Cultural</h3>
          ${Object.entries(byMonth).length ? Object.entries(byMonth).map(([month, items]) => `
            <div style="margin-bottom:20px;">
              <div style="font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px;letter-spacing:0.5px;">${month}</div>
              ${items.map(ev => `<div style="display:flex;gap:12px;margin-bottom:12px;padding-left:8px;border-left:3px solid ${ev.color};">
                <div style="font-size:1.2rem;flex-shrink:0;margin-top:2px;">${ev.emoji}</div>
                <div style="flex:1;">
                  <div style="font-size:0.82rem;font-weight:600;">${ev.title}</div>
                  <div style="font-size:0.75rem;color:var(--text-secondary);line-height:1.5;margin-top:2px;">${ev.detail}</div>
                  <div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">${ev.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>`).join('')}
            </div>
          `).join('') : '<div style="font-size:0.82rem;color:var(--text-muted);padding:20px;text-align:center;">Nenhum evento cultural registrado ainda.</div>'}
        </div>
      `;
    },

    // ── Sub: Onboarding Cultural (dinamico via OnboardingRepo) ──
    _renderCulturaOnboarding(userId) {
      // Container placeholder — dados carregados async
      return `
        <div id="rhOnboardingContainer">
          <div class="card" style="padding:20px;margin-bottom:16px;">
            <h3 style="font-size:1rem;margin-bottom:8px;">Bem-vindo(a) a Cultura TBO</h3>
            <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:16px;">
              A TBO e movida por pessoas que se importam com qualidade, colaboracao e inovacao.
              Este guia te ajuda a entender e viver nossa cultura desde o primeiro dia.
            </p>
            <div id="rhOnboardingProgress" style="margin-bottom:8px;">
              <div style="font-size:0.72rem;color:var(--text-muted);">Carregando etapas...</div>
            </div>
          </div>
          <div id="rhOnboardingSteps" class="card" style="padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h4 style="font-size:0.9rem;">Jornada de Onboarding</h4>
              ${S._isAdmin() ? '<button id="rhOnboardingManage" class="btn-secondary" style="font-size:0.72rem;padding:4px 10px;"><i data-lucide="settings" style="width:12px;height:12px;"></i> Gerenciar Templates</button>' : ''}
            </div>
            <div id="rhOnboardingStepsList" style="display:grid;gap:12px;">
              <div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:20px;">
                <i data-lucide="loader" style="width:20px;height:20px;animation:spin 1s linear infinite;"></i>
                <div style="margin-top:8px;">Carregando etapas de onboarding...</div>
              </div>
            </div>
          </div>

          <!-- Offboarding Section (admin only) -->
          ${S._isAdmin() ? `
          <div class="card" style="padding:20px;margin-top:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h4 style="font-size:0.9rem;"><i data-lucide="user-minus" style="width:16px;height:16px;"></i> Offboarding Ativo</h4>
            </div>
            <div id="rhOffboardingList" style="display:grid;gap:12px;">
              <div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:10px;">Carregando...</div>
            </div>
          </div>
          ` : ''}
        </div>
      `;
    },

    // ── Carregar dados de onboarding async apos render ──
    async _loadOnboardingData() {
      if (typeof OnboardingRepo === 'undefined') {
        const container = document.getElementById('rhOnboardingStepsList');
        if (container) container.innerHTML = '<div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:20px;">OnboardingRepo nao disponivel</div>';
        return;
      }

      try {
        // Buscar pessoas em onboarding
        const onboardingPeople = S._team.filter(p => p.status === 'onboarding');
        const offboardingPeople = S._team.filter(p => p.status === 'offboarding');

        // Se nao ha ninguem em onboarding, mostrar template de preview
        if (!onboardingPeople.length) {
          await this._renderOnboardingTemplate();
        } else {
          // Mostrar progresso real de cada pessoa em onboarding
          await this._renderOnboardingActive(onboardingPeople);
        }

        // Offboarding (admin)
        if (S._isAdmin() && offboardingPeople.length) {
          await this._renderOffboardingActive(offboardingPeople);
        } else {
          const offList = document.getElementById('rhOffboardingList');
          if (offList) offList.innerHTML = '<div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:10px;">Nenhum offboarding ativo</div>';
        }

        // Progresso geral
        await this._renderOnboardingKPIs();

        // Bind: Gerenciar Templates
        S._bind('rhOnboardingManage', () => this._openOnboardingTemplateEditor());

      } catch (e) {
        console.warn('[RH Onboarding] Erro ao carregar:', e.message);
      }

      if (window.lucide) lucide.createIcons();
    },

    // ── Renderizar template de preview (quando ninguem esta em onboarding) ──
    async _renderOnboardingTemplate() {
      const stepsList = document.getElementById('rhOnboardingStepsList');
      if (!stepsList) return;

      let template = null;
      try {
        template = await OnboardingRepo.getDefaultTemplate('onboarding');
      } catch { /* sem template */ }

      if (!template || !template.steps?.length) {
        // Fallback: steps culturais estaticos
        const fallbackSteps = [
          { title: 'Conheca os Valores', description: 'Leia e entenda os 6 valores que guiam tudo na TBO.', order: 1 },
          { title: 'Mural de Reconhecimento', description: 'Veja como reconhecemos colegas. Voce tambem pode elogiar desde o dia 1!', order: 2 },
          { title: 'Participe dos Rituais', description: 'Dailys, reviews e retrospectivas — sua presenca faz a diferenca.', order: 3 },
          { title: 'Primeira 1:1 com seu Gestor', description: 'Conversa para alinhar expectativas, PDI e crescimento.', order: 4 },
          { title: 'De seu Primeiro Feedback', description: 'Cultura de feedback comeca no dia 1.', order: 5 },
          { title: 'Celebre uma Conquista', description: 'Quando terminar seu primeiro projeto, celebrate!', order: 6 }
        ];
        template = { steps: fallbackSteps, name: 'Onboarding Padrao' };
      }

      const steps = (template.steps || []).sort((a, b) => (a.order || 0) - (b.order || 0));

      // Progress
      const progEl = document.getElementById('rhOnboardingProgress');
      if (progEl) {
        progEl.innerHTML = `
          <div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:8px;">
            <i data-lucide="info" style="width:14px;height:14px;vertical-align:-2px;"></i>
            Nenhuma pessoa em onboarding no momento. Preview do template "${S._esc(template.name)}":
          </div>
        `;
      }

      stepsList.innerHTML = steps.map((s, i) => `
        <div style="display:flex;gap:14px;align-items:flex-start;padding:14px;background:var(--bg-elevated);border-radius:10px;border:1px solid var(--border-subtle);opacity:0.7;">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="font-size:0.85rem;font-weight:700;color:var(--text-muted);">${i + 1}</span>
          </div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:2px;">${S._esc(s.title)}</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">${S._esc(s.description || '')}</div>
            ${s.default_role ? `<div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">Responsavel: ${S._esc(s.default_role)}</div>` : ''}
          </div>
        </div>
      `).join('');
    },

    // ── Renderizar onboarding ativo (pessoas em onboarding com progresso real) ──
    async _renderOnboardingActive(people) {
      const stepsList = document.getElementById('rhOnboardingStepsList');
      if (!stepsList) return;

      let html = '';
      for (const person of people) {
        const uid = person.supabaseId || person.id;
        let progress = { tasks: [], total: 0, completed: 0, percentage: 0 };

        try {
          progress = await OnboardingRepo.getProgress(uid, 'onboarding');
        } catch { /* sem dados */ }

        // Se nao tem tasks, disparar automacao
        if (!progress.tasks.length) {
          try {
            await OnboardingRepo.triggerAutomation(uid, 'onboarding');
            progress = await OnboardingRepo.getProgress(uid, 'onboarding');
          } catch (e) {
            console.warn(`[RH Onboarding] Falha ao disparar automacao para ${person.nome}:`, e.message);
          }
        }

        const pct = progress.percentage || 0;
        const tasks = progress.tasks || [];

        html += `
          <div class="card" style="padding:16px;margin-bottom:12px;border-left:4px solid ${pct === 100 ? 'var(--color-success)' : 'var(--accent-gold)'};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <div>
                <div style="font-weight:700;font-size:0.9rem;">${S._esc(person.nome)}</div>
                <div style="font-size:0.72rem;color:var(--text-secondary);">${S._esc(person.cargo || '')} — ${S._esc(person.bu || '')}</div>
              </div>
              <span style="font-size:0.78rem;font-weight:700;color:${pct === 100 ? 'var(--color-success)' : 'var(--accent-gold)'};">${pct}%</span>
            </div>
            <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;margin-bottom:12px;">
              <div style="height:100%;width:${pct}%;background:${pct === 100 ? 'var(--color-success)' : 'var(--accent-gold)'};border-radius:3px;transition:width 0.5s;"></div>
            </div>
            <div style="display:grid;gap:8px;">
              ${tasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(t => `
                <div style="display:flex;gap:10px;align-items:center;padding:8px;background:${t.completed ? 'var(--color-success-dim)' : 'var(--bg-elevated)'};border-radius:8px;cursor:pointer;"
                     onclick="TBO_RH._toggleOnboardingTask('${t.id}', ${!t.completed}, '${uid}')">
                  <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${t.completed ? 'var(--color-success)' : 'var(--border-muted)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${t.completed ? 'var(--color-success)' : 'transparent'};">
                    ${t.completed ? '<i data-lucide="check" style="width:12px;height:12px;color:white;"></i>' : ''}
                  </div>
                  <div style="flex:1;">
                    <div style="font-size:0.82rem;font-weight:500;${t.completed ? 'text-decoration:line-through;opacity:0.6;' : ''}">${S._esc(t.text || t.title || '')}</div>
                    ${t.due_date ? `<div style="font-size:0.68rem;color:var(--text-muted);">Prazo: ${new Date(t.due_date).toLocaleDateString('pt-BR')}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            ${pct === 100 ? `<div style="margin-top:12px;padding:10px;background:var(--color-success-dim);border-radius:8px;text-align:center;">
              <i data-lucide="check-circle-2" style="width:16px;height:16px;color:var(--color-success);vertical-align:-3px;"></i>
              <span style="font-size:0.82rem;font-weight:600;color:var(--color-success);margin-left:6px;">Onboarding completo!</span>
              <button class="btn-primary" style="font-size:0.72rem;padding:4px 12px;margin-left:12px;" onclick="TBO_RH._activatePerson('${uid}')">Ativar Pessoa</button>
            </div>` : ''}
          </div>
        `;
      }

      stepsList.innerHTML = html || '<div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:20px;">Nenhuma pessoa em onboarding</div>';
    },

    // ── Renderizar offboarding ativo ──
    async _renderOffboardingActive(people) {
      const container = document.getElementById('rhOffboardingList');
      if (!container) return;

      let html = '';
      for (const person of people) {
        const uid = person.supabaseId || person.id;
        let progress = { tasks: [], total: 0, completed: 0, percentage: 0 };

        try {
          progress = await OnboardingRepo.getProgress(uid, 'offboarding');
        } catch { /* sem dados */ }

        // Se nao tem tasks, disparar automacao
        if (!progress.tasks.length) {
          try {
            await OnboardingRepo.triggerAutomation(uid, 'offboarding');
            progress = await OnboardingRepo.getProgress(uid, 'offboarding');
          } catch (e) {
            console.warn(`[RH Offboarding] Falha ao disparar automacao para ${person.nome}:`, e.message);
          }
        }

        const pct = progress.percentage || 0;
        const tasks = progress.tasks || [];

        html += `
          <div style="padding:14px;background:var(--bg-elevated);border-radius:10px;border-left:4px solid ${pct === 100 ? 'var(--color-success)' : 'var(--color-danger)'};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <div>
                <div style="font-weight:700;font-size:0.85rem;">${S._esc(person.nome)}</div>
                <div style="font-size:0.68rem;color:var(--text-secondary);">${S._esc(person.cargo || '')}</div>
              </div>
              <span style="font-size:0.75rem;font-weight:700;color:${pct === 100 ? 'var(--color-success)' : 'var(--color-danger)'};">${pct}%</span>
            </div>
            <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;margin-bottom:10px;">
              <div style="height:100%;width:${pct}%;background:${pct === 100 ? 'var(--color-success)' : 'var(--color-danger)'};border-radius:2px;"></div>
            </div>
            <div style="display:grid;gap:6px;">
              ${tasks.map(t => `
                <div style="display:flex;gap:8px;align-items:center;padding:6px;cursor:pointer;" onclick="TBO_RH._toggleOnboardingTask('${t.id}', ${!t.completed}, '${uid}', 'offboarding')">
                  <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${t.completed ? 'var(--color-success)' : 'var(--border-muted)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${t.completed ? 'var(--color-success)' : 'transparent'};">
                    ${t.completed ? '<i data-lucide="check" style="width:10px;height:10px;color:white;"></i>' : ''}
                  </div>
                  <span style="font-size:0.78rem;${t.completed ? 'text-decoration:line-through;opacity:0.6;' : ''}">${S._esc(t.text || t.title || '')}</span>
                </div>
              `).join('')}
            </div>
            ${pct === 100 ? `
              <div style="margin-top:10px;display:flex;gap:8px;">
                <button class="btn-secondary" style="font-size:0.72rem;padding:4px 10px;" onclick="TBO_RH._openExitInterview('${uid}')">
                  <i data-lucide="clipboard-list" style="width:12px;height:12px;"></i> Entrevista de Saida
                </button>
                <button class="btn-primary" style="font-size:0.72rem;padding:4px 10px;background:var(--color-danger);" onclick="TBO_RH._finishOffboarding('${uid}')">
                  <i data-lucide="user-x" style="width:12px;height:12px;"></i> Finalizar Desligamento
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }

      container.innerHTML = html || '<div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:10px;">Nenhum offboarding ativo</div>';
    },

    // ── KPIs de Onboarding/Offboarding ──
    async _renderOnboardingKPIs() {
      const progEl = document.getElementById('rhOnboardingProgress');
      if (!progEl) return;

      try {
        const onbPeople = S._team.filter(p => p.status === 'onboarding');
        const offPeople = S._team.filter(p => p.status === 'offboarding');

        if (!onbPeople.length && !offPeople.length) return; // preview mode, nao mostrar KPIs

        const kpis = [];
        if (onbPeople.length) kpis.push(`<span style="color:var(--accent-gold);font-weight:700;">${onbPeople.length}</span> em onboarding`);
        if (offPeople.length) kpis.push(`<span style="color:var(--color-danger);font-weight:700;">${offPeople.length}</span> em offboarding`);

        progEl.innerHTML = `
          <div style="display:flex;gap:16px;font-size:0.82rem;color:var(--text-secondary);">
            ${kpis.join(' | ')}
          </div>
        `;
      } catch { /* silencioso */ }
    },

    // ── Toggle task de onboarding/offboarding ──
    async _toggleOnboardingTask(taskId, completed, personId, type = 'onboarding') {
      if (typeof OnboardingRepo === 'undefined') return;
      try {
        if (completed) {
          await OnboardingRepo.completeTask(taskId);
        } else {
          await OnboardingRepo.reopenTask(taskId);
        }

        // Verificar auto-complete
        await OnboardingRepo.checkAndAutoComplete(personId, type);

        // Re-renderizar
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success(completed ? 'Etapa concluida!' : 'Etapa reaberta');
        await this._loadOnboardingData();
      } catch (e) {
        console.warn('[RH Onboarding] Erro ao toggle task:', e.message);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao atualizar etapa');
      }
    },

    // ── Ativar pessoa (conclusao do onboarding) ──
    async _activatePerson(personId) {
      try {
        if (typeof PeopleRepo !== 'undefined') {
          await PeopleRepo.update(personId, { status: 'ativo' });
        }
        // Atualizar cache local
        const person = S._team.find(p => p.supabaseId === personId || p.id === personId);
        if (person) person.status = 'ativo';

        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Pessoa ativada com sucesso!');
        await this._loadOnboardingData();
      } catch (e) {
        console.warn('[RH Onboarding] Erro ao ativar pessoa:', e.message);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao ativar pessoa');
      }
    },

    // ── Finalizar offboarding (mudar status para desligado) ──
    async _finishOffboarding(personId) {
      try {
        if (typeof PeopleRepo !== 'undefined') {
          await PeopleRepo.update(personId, {
            status: 'desligado',
            exit_date: new Date().toISOString().split('T')[0]
          });
        }
        const person = S._team.find(p => p.supabaseId === personId || p.id === personId);
        if (person) person.status = 'desligado';

        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Desligamento finalizado');
        await this._loadOnboardingData();
      } catch (e) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao finalizar offboarding');
      }
    },

    // ── Entrevista de Saida modal ──
    _openExitInterview(personId) {
      const person = S._team.find(p => p.supabaseId === personId || p.id === personId);
      const name = person?.nome || 'Colaborador';

      const overlay = document.createElement('div');
      overlay.id = 'rhExitInterviewOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
      overlay.innerHTML = `
        <div style="background:var(--bg-primary);border-radius:12px;padding:24px;max-width:520px;width:95%;max-height:80vh;overflow-y:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="font-size:1rem;">Entrevista de Saida — ${S._esc(name)}</h3>
            <button onclick="document.getElementById('rhExitInterviewOverlay')?.remove()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;">\u2715</button>
          </div>

          <div style="display:grid;gap:16px;">
            <div>
              <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:4px;">Motivo da Saida</label>
              <select id="exitMotivo" class="input" style="width:100%;">
                <option value="">Selecione...</option>
                <option value="voluntario_mercado">Voluntario — Proposta de mercado</option>
                <option value="voluntario_pessoal">Voluntario — Motivos pessoais</option>
                <option value="voluntario_insatisfacao">Voluntario — Insatisfacao</option>
                <option value="involuntario_performance">Involuntario — Performance</option>
                <option value="involuntario_reestruturacao">Involuntario — Reestruturacao</option>
                <option value="contrato_encerrado">Encerramento de contrato</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:4px;">Satisfacao Geral (1-5)</label>
              <div id="exitSatisfacao" style="display:flex;gap:8px;">
                ${[1, 2, 3, 4, 5].map(n => `<button class="btn-secondary exitSatBtn" data-val="${n}" style="width:36px;height:36px;font-size:0.9rem;" onclick="document.querySelectorAll('.exitSatBtn').forEach(b=>b.style.background='');this.style.background='var(--accent-gold)';this.style.color='white';">${n}</button>`).join('')}
              </div>
            </div>
            <div>
              <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:4px;">Feedback / Comentarios</label>
              <textarea id="exitFeedback" class="input" rows="4" placeholder="O que poderiamos ter feito melhor?" style="width:100%;resize:vertical;"></textarea>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="checkbox" id="exitRecomendaria">
              <label for="exitRecomendaria" style="font-size:0.82rem;">Recomendaria a TBO como lugar para trabalhar?</label>
            </div>
          </div>

          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;">
            <button class="btn-secondary" onclick="document.getElementById('rhExitInterviewOverlay')?.remove()">Cancelar</button>
            <button class="btn-primary" onclick="TBO_RH._saveExitInterview('${personId}')">Salvar Entrevista</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    },

    async _saveExitInterview(personId) {
      const motivo = document.getElementById('exitMotivo')?.value;
      const satisfacaoBtn = document.querySelector('.exitSatBtn[style*="accent-gold"]');
      const satisfacao = satisfacaoBtn ? parseInt(satisfacaoBtn.dataset.val) : null;
      const feedback = document.getElementById('exitFeedback')?.value || '';
      const recomendaria = document.getElementById('exitRecomendaria')?.checked || false;

      if (!motivo) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Selecione o motivo da saida');
        return;
      }

      try {
        if (typeof OnboardingRepo !== 'undefined') {
          await OnboardingRepo.saveExitInterview(personId, {
            motivo,
            satisfacao,
            feedback,
            recomendaria,
            data: new Date().toISOString()
          });
        }
        document.getElementById('rhExitInterviewOverlay')?.remove();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Entrevista de saida salva!');
      } catch (e) {
        console.warn('[RH] Erro ao salvar entrevista:', e.message);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao salvar entrevista');
      }
    },

    // ── Editor de Templates de Onboarding ──
    async _openOnboardingTemplateEditor() {
      if (typeof OnboardingRepo === 'undefined') return;

      let templates = [];
      try {
        templates = await OnboardingRepo.listTemplates();
      } catch { /* sem templates */ }

      const overlay = document.createElement('div');
      overlay.id = 'rhTemplateEditorOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
      overlay.innerHTML = `
        <div style="background:var(--bg-primary);border-radius:12px;padding:24px;max-width:700px;width:95%;max-height:85vh;overflow-y:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="font-size:1rem;"><i data-lucide="layout-template" style="width:18px;height:18px;vertical-align:-3px;"></i> Templates de Onboarding/Offboarding</h3>
            <button onclick="document.getElementById('rhTemplateEditorOverlay')?.remove()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;">\u2715</button>
          </div>
          <div style="display:grid;gap:16px;">
            ${templates.map(t => `
              <div class="card" style="padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <div>
                    <span style="font-weight:700;font-size:0.9rem;">${S._esc(t.name)}</span>
                    <span class="tag" style="font-size:0.6rem;margin-left:8px;background:${t.type === 'onboarding' ? 'var(--accent-gold)20' : 'var(--color-danger)20'};color:${t.type === 'onboarding' ? 'var(--accent-gold)' : 'var(--color-danger)'};">${t.type}</span>
                    ${t.is_default ? '<span class="tag" style="font-size:0.6rem;margin-left:4px;">Padrao</span>' : ''}
                  </div>
                  <span style="font-size:0.72rem;color:var(--text-muted);">${(t.steps || []).length} etapas</span>
                </div>
                <div style="display:grid;gap:4px;">
                  ${(t.steps || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((s, i) => `
                    <div style="font-size:0.78rem;color:var(--text-secondary);padding:4px 0;border-bottom:1px solid var(--border-subtle);">
                      ${i + 1}. ${S._esc(s.title)} ${s.default_role ? `<span style="color:var(--text-muted);font-size:0.68rem;">(${S._esc(s.default_role)})</span>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
            ${!templates.length ? '<div style="text-align:center;color:var(--text-muted);padding:20px;">Nenhum template encontrado. Execute a migration 027 para criar os templates padrao.</div>' : ''}
          </div>
          <div style="margin-top:16px;text-align:right;">
            <button class="btn-secondary" onclick="document.getElementById('rhTemplateEditorOverlay')?.remove()">Fechar</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      if (window.lucide) lucide.createIcons();
    },

    // Bind interacoes da subtab ativa de Cultura (elogios, feedbacks)
    _bindCulturaContent() {
      // Elogios CRUD — bind apenas se os elementos existem na subtab ativa
      S._bindToggle('rhNewElogio', 'rhElogioForm');
      S._bindToggle('elCancel', 'rhElogioForm', false);
      S._bind('elSave', async () => {
        const paraValue = document.getElementById('elPara')?.value;
        const valorId = document.getElementById('elValor')?.value;
        const mensagem = document.getElementById('elTexto')?.value;
        if (!mensagem) { if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Escreva uma mensagem'); return; }

        // Resolver valor TBO
        const valorObj = S._valores.find(v => v.id === valorId);

        // Tentar salvar no Supabase
        if (typeof RecognitionsRepo !== 'undefined') {
          try {
            await RecognitionsRepo.create({
              to_user: paraValue,
              value_id: valorId,
              value_name: valorObj?.nome || '',
              value_emoji: valorObj?.emoji || '',
              message: mensagem
            });
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Elogio publicado!');
            // Recarregar dados e re-renderizar
            this._culturaElogiosCache = null;
            await this._loadCulturaFromSupabase();
            const form = document.getElementById('rhElogioForm');
            if (form) form.style.display = 'none';
            const txt = document.getElementById('elTexto');
            if (txt) txt.value = '';
            return;
          } catch (e) {
            console.warn('[RH] Erro ao salvar elogio no Supabase:', e.message);
          }
        }

        // Fallback: localStorage
        const paraUsername = document.getElementById('elPara')?.selectedOptions?.[0]?.dataset?.username || paraValue;
        const el = { id: S._genId(), de: S._currentUserId(), para: paraUsername, valor: valorId, mensagem, curtidas: 0, data: new Date().toISOString() };
        const items = S._getStore('elogios'); items.push(el); S._setStore('elogios', items);
        const list = document.getElementById('rhElogioList');
        if (list) list.innerHTML = this._renderElogioItems(items);
        const form = document.getElementById('rhElogioForm');
        if (form) form.style.display = 'none';
        const txt = document.getElementById('elTexto');
        if (txt) txt.value = '';
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Elogio publicado!');
        this._bindCurtirElogios();
      });
      this._bindCurtirElogios();

      // Feedbacks CRUD
      S._bindToggle('rhNewFeedback', 'rhFeedbackForm');
      S._bindToggle('fbCancel', 'rhFeedbackForm', false);
      S._bind('fbSave', async () => {
        const paraValue = document.getElementById('fbPara')?.value;
        const tipo = document.getElementById('fbTipo')?.value;
        const mensagem = document.getElementById('fbTexto')?.value;
        if (!mensagem) { if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Preencha a mensagem'); return; }

        // Tentar salvar no Supabase
        if (typeof FeedbacksRepo !== 'undefined') {
          try {
            await FeedbacksRepo.create({
              to_user: paraValue,
              type: tipo,
              visibility: 'public',
              message: mensagem
            });
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Feedback enviado!');
            this._culturaFeedbacksCache = null;
            await this._loadCulturaFromSupabase();
            const form = document.getElementById('rhFeedbackForm');
            if (form) form.style.display = 'none';
            const txt = document.getElementById('fbTexto');
            if (txt) txt.value = '';
            return;
          } catch (e) {
            console.warn('[RH] Erro ao salvar feedback no Supabase:', e.message);
          }
        }

        // Fallback: localStorage
        const paraUsername = document.getElementById('fbPara')?.selectedOptions?.[0]?.dataset?.username || paraValue;
        const fb = { id: S._genId(), de: S._currentUserId(), para: paraUsername, tipo, visibilidade: 'publico', mensagem, data: new Date().toISOString() };
        const items = S._getStore('feedbacks'); items.push(fb); S._setStore('feedbacks', items);
        const list = document.getElementById('rhFeedbackList');
        if (list) list.innerHTML = this._renderFeedbackItems(items);
        const form = document.getElementById('rhFeedbackForm');
        if (form) form.style.display = 'none';
        const txt = document.getElementById('fbTexto');
        if (txt) txt.value = '';
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Feedback enviado!');
      });
    },

    _renderElogioItems(elogios) {
      if (!elogios.length) return '<div class="empty-state" style="padding:24px;"><div class="empty-state-text">Nenhum elogio no mural</div></div>';
      return elogios.sort((a, b) => new Date(b.data) - new Date(a.data)).map(e => {
        const v = S._valores.find(v2 => v2.id === e.valor) || S._valores[0];
        return `<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><span style="font-size:1.6rem;">${v.emoji}</span><div><div style="font-size:0.82rem;"><strong>${S._getPersonName(e.de)}</strong> elogiou <strong>${S._getPersonName(e.para)}</strong></div><div style="font-size:0.68rem;color:var(--text-muted);">${v.nome} \u2022 ${new Date(e.data).toLocaleDateString('pt-BR')}</div></div></div>
          <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;padding-left:40px;">${S._esc(e.mensagem)}</div>
          <div style="padding-left:40px;margin-top:4px;"><button class="btn btn-sm btn-ghost rh-curtir" data-id="${e.id}" style="font-size:0.72rem;">\u2764\uFE0F ${e.curtidas || 0}</button></div>
        </div>`;
      }).join('');
    },

    _renderFeedbackItems(feedbacks, filter) {
      const userId = S._currentUserId();
      let items = [...feedbacks];
      if (filter === 'recebidos') items = items.filter(f => f.para === userId);
      else if (filter === 'enviados') items = items.filter(f => f.de === userId);
      if (!items.length) return '<div class="empty-state" style="padding:24px;"><div class="empty-state-text">Nenhum feedback</div></div>';
      return items.sort((a, b) => new Date(b.data) - new Date(a.data)).map(f => {
        const tipo = f.tipo === 'positivo';
        return `<div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:12px;">
          <div style="width:4px;min-height:36px;border-radius:2px;background:${tipo ? 'var(--color-success)' : 'var(--color-warning)'};flex-shrink:0;"></div>
          <div style="flex:1;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><div><strong style="font-size:0.82rem;">${S._getPersonName(f.de)}</strong> <span style="color:var(--text-muted);">\u2192</span> <strong style="font-size:0.82rem;">${S._getPersonName(f.para)}</strong></div><span class="tag" style="font-size:0.65rem;background:${tipo ? 'var(--color-success-dim)' : 'var(--color-warning-dim)'};color:${tipo ? 'var(--color-success)' : 'var(--color-warning)'};">${f.tipo}</span></div>
          <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;">${S._esc(f.mensagem)}</div>
          <div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px;">${new Date(f.data).toLocaleDateString('pt-BR')}</div></div>
        </div>`;
      }).join('');
    },

    _bindCurtirElogios() {
      document.querySelectorAll('.rh-curtir').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const items = S._getStore('elogios');
          const item = items.find(el => el.id === btn.dataset.id);
          if (item) { item.curtidas = (item.curtidas || 0) + 1; S._setStore('elogios', items); }
          const list = document.getElementById('rhElogioList');
          if (list) { list.innerHTML = this._renderElogioItems(items); this._bindCurtirElogios(); }
        });
      });
    },

    // ── Destroy (cleanup ao sair) ──
    destroy() {
      this._culturaElogiosCache = null;
      this._culturaFeedbacksCache = null;
    }
  };

  TBO_PEOPLE.registerTab('cultura', TabCultura);
})();
