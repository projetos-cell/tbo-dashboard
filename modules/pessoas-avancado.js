// TBO OS — Module: Pessoas Avancado
// Pulse Surveys, Churn Prediction, Succession Plan, Benefits TCO,
// Sociogram, Career Path, Vacation Coverage, Feedback→PDP integration
const TBO_PESSOAS_AVANCADO = {

  _storageKeys: {
    pulse: 'tbo_pulse_surveys',
    absences: 'tbo_absences',
    succession: 'tbo_succession',
    benefits: 'tbo_benefits',
    career: 'tbo_career_paths'
  },

  // Career ladder definition
  _careerLadder: {
    'Jr. II':    { level: 1, next: 'Jr. III',   criteria: ['Dominar ferramentas basicas', 'Entregar com supervisao', 'Feedback positivo do lider'] },
    'Jr. III':   { level: 2, next: 'Pleno I',   criteria: ['Autonomia em tarefas simples', 'Qualidade consistente', 'Participar de 3+ projetos'] },
    'Pleno I':   { level: 3, next: 'Pleno II',  criteria: ['Entregar sem supervisao', 'Mentoria de Jr', 'Nota avaliacao >= 3.5'] },
    'Pleno II':  { level: 4, next: 'Pleno III', criteria: ['Liderar frentes de projeto', 'Referencia tecnica na BU', 'Nota >= 3.8'] },
    'Pleno III': { level: 5, next: 'Senior I',  criteria: ['Gestao de equipe pequena', 'Impacto cross-BU', 'Nota >= 4.0'] },
    'Senior I':  { level: 6, next: 'Senior II',  criteria: ['Lideranca estrategica', 'Resultados de BU', 'Nota >= 4.2'] },
    'Senior II': { level: 7, next: 'Senior III', criteria: ['Gestao de multiplos projetos', 'Influencia cross-BU', 'Nota >= 4.4'] },
    'Senior III':{ level: 8, next: 'Socio',     criteria: ['Visao de negocio', 'P&L ownership', 'Crescimento do time'] }
  },

  render() {
    return `
      <div class="pessoas-adv-module">
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="pa-pulse">Pulse Surveys</button>
          <button class="tab" data-tab="pa-churn">Risco de Evasao</button>
          <button class="tab" data-tab="pa-sucessao">Sucessao</button>
          <button class="tab" data-tab="pa-beneficios">Beneficios TCO</button>
          <button class="tab" data-tab="pa-sociograma">Sociograma</button>
          <button class="tab" data-tab="pa-carreira">Carreira</button>
          <button class="tab" data-tab="pa-ferias">Ferias & Cobertura</button>
          <button class="tab" data-tab="pa-feedback-pdp">Feedback → PDP</button>
        </div>

        <div class="tab-content active" id="tab-pa-pulse">${this._renderPulse()}</div>
        <div class="tab-content" id="tab-pa-churn">${this._renderChurn()}</div>
        <div class="tab-content" id="tab-pa-sucessao">${this._renderSucessao()}</div>
        <div class="tab-content" id="tab-pa-beneficios">${this._renderBeneficios()}</div>
        <div class="tab-content" id="tab-pa-sociograma">${this._renderSociograma()}</div>
        <div class="tab-content" id="tab-pa-carreira">${this._renderCarreira()}</div>
        <div class="tab-content" id="tab-pa-ferias">${this._renderFerias()}</div>
        <div class="tab-content" id="tab-pa-feedback-pdp">${this._renderFeedbackPDP()}</div>
      </div>
    `;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.pessoas-adv-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.pessoas-adv-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.pessoas-adv-module .tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // Pulse mood emoji selection
    document.querySelectorAll('.pulse-mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pulse-mood-btn').forEach(b => b.style.borderColor = 'transparent');
        btn.style.borderColor = 'var(--accent, #e85102)';
        const hiddenInput = document.getElementById('pulseMoodVal');
        if (hiddenInput) hiddenInput.value = btn.dataset.mood;
      });
    });
    // Pulse submit
    this._bind('pulseSubmit', () => this._submitPulse());
    // Absence add
    this._bind('absenceSubmit', () => this._addAbsence());
    // Succession save
    this._bind('successionSave', () => this._saveSuccession());
    // Benefits save
    this._bind('benefitsSave', () => this._saveBenefits());
    // Feedback→PDP convert
    document.querySelectorAll('.pa-convert-feedback').forEach(btn => {
      btn.addEventListener('click', () => this._convertFeedbackToPDP(btn.dataset.fbid));
    });
  },

  // ══════════════════════════════════════════════════════════════════
  // 1. PULSE SURVEYS (Mood Tracking)
  // ══════════════════════════════════════════════════════════════════
  _renderPulse() {
    const surveys = this._getStore('pulse');
    const team = this._getTeam();
    const thisWeek = this._getWeekKey(new Date());

    // Calculate sentiment by BU
    const buSentiment = {};
    const personSentiment = {};
    surveys.forEach(s => {
      const person = team.find(t => t.id === s.personId);
      const bu = person?.bu || 'Outros';
      if (!buSentiment[bu]) buSentiment[bu] = [];
      buSentiment[bu].push(s.mood);
      if (!personSentiment[s.personId]) personSentiment[s.personId] = [];
      personSentiment[s.personId].push({ mood: s.mood, week: s.week });
    });

    const buAvg = Object.entries(buSentiment).map(([bu, moods]) => ({
      bu, avg: +(moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1), count: moods.length
    }));

    // Trend detection
    const trends = Object.entries(personSentiment).map(([id, entries]) => {
      const sorted = entries.sort((a, b) => a.week.localeCompare(b.week));
      const recent = sorted.slice(-4);
      if (recent.length < 2) return null;
      const trend = recent[recent.length - 1].mood - recent[0].mood;
      return { id, trend, current: recent[recent.length - 1].mood };
    }).filter(Boolean).filter(t => Math.abs(t.trend) >= 1);

    const avgMood = surveys.length ? +(surveys.reduce((s, x) => s + x.mood, 0) / surveys.length).toFixed(1) : 0;
    const moodEmojis = { 1: '\u{1F61E}', 2: '\u{1F615}', 3: '\u{1F610}', 4: '\u{1F642}', 5: '\u{1F60A}' };

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Mood Medio</div><div class="kpi-value">${avgMood ? moodEmojis[Math.round(avgMood)] + ' ' + avgMood : '-'}/5</div></div>
        <div class="kpi-card"><div class="kpi-label">Respostas Totais</div><div class="kpi-value">${surveys.length}</div></div>
        <div class="kpi-card kpi-card--warning"><div class="kpi-label">Tendencias Queda</div><div class="kpi-value">${trends.filter(t => t.trend < 0).length}</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Tendencias Alta</div><div class="kpi-value">${trends.filter(t => t.trend > 0).length}</div></div>
      </div>

      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:12px;">Responder Pulse (semana ${thisWeek})</h4>
          <div class="form-group" style="margin-bottom:10px;">
            <label class="form-label">Como voce esta se sentindo?</label>
            <div style="display:flex;gap:12px;font-size:1.6rem;" id="pulseEmojis">
              ${[1,2,3,4,5].map(n => `<button class="pulse-mood-btn" data-mood="${n}" style="cursor:pointer;border:2px solid transparent;border-radius:8px;padding:4px 8px;background:none;font-size:1.6rem;transition:border-color 0.2s;">${moodEmojis[n]}</button>`).join('')}
            </div>
            <input type="hidden" id="pulseMoodVal" value="3">
          </div>
          <div class="form-group" style="margin-bottom:10px;">
            <label class="form-label">Comentario (opcional)</label>
            <input class="form-input" id="pulseComment" placeholder="O que esta influenciando seu humor?">
          </div>
          <button class="btn btn-primary btn-sm" id="pulseSubmit">Enviar Pulse</button>
        </div>

        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:12px;">Sentiment por BU</h4>
          ${buAvg.length ? buAvg.map(b => `
            <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border-subtle);">
              <span style="font-size:0.82rem;width:80px;font-weight:500;">${b.bu}</span>
              <div style="flex:1;height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                <div style="height:100%;width:${(b.avg / 5) * 100}%;background:${b.avg >= 4 ? 'var(--color-success)' : b.avg >= 3 ? 'var(--color-info)' : 'var(--color-danger)'};border-radius:4px;"></div>
              </div>
              <span style="font-size:0.78rem;font-weight:600;">${b.avg}/5</span>
              <span style="font-size:0.72rem;color:var(--text-muted);">(${b.count})</span>
            </div>
          `).join('') : '<div style="font-size:0.78rem;color:var(--text-muted);">Sem dados ainda. Responda o pulse acima!</div>'}
        </div>
      </div>

      ${trends.length > 0 ? `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Alertas de Tendencia</h3></div>
          ${trends.sort((a, b) => a.trend - b.trend).map(t => `
            <div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.2rem;">${t.trend < 0 ? '\u{1F534}' : '\u{1F7E2}'}</span>
              <span style="font-size:0.82rem;font-weight:500;">${this._getPersonName(t.id)}</span>
              <span style="font-size:0.78rem;color:${t.trend < 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${t.trend > 0 ? '+' : ''}${t.trend} pontos nas ultimas 4 semanas</span>
              <span style="font-size:0.72rem;color:var(--text-muted);margin-left:auto;">Atual: ${moodEmojis[Math.round(t.current)] || ''} ${t.current}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  _submitPulse() {
    const mood = parseInt(document.getElementById('pulseMoodVal')?.value) || 3;
    const comment = document.getElementById('pulseComment')?.value || '';
    const userId = this._currentUserId();
    const week = this._getWeekKey(new Date());

    const surveys = this._getStore('pulse');
    surveys.push({ id: this._genId(), personId: userId, mood, comment, week, date: new Date().toISOString() });
    this._setStore('pulse', surveys);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Pulse enviado!', `Mood: ${mood}/5`);
    this._refresh();
  },

  // ══════════════════════════════════════════════════════════════════
  // 2. CHURN PREDICTION (Talent Evasion Risk)
  // ══════════════════════════════════════════════════════════════════
  _renderChurn() {
    const team = this._getTeam();
    const surveys = this._getStore('pulse');
    const feedbacks = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('feedbacks') : [];
    const oneOnOnes = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('1on1s') : [];
    const reviews = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('avaliacoes_people') : [];

    const risks = team.map(person => {
      let riskScore = 0;
      let signals = [];

      // Signal 1: Low pulse sentiment
      const personPulses = surveys.filter(s => s.personId === person.id);
      if (personPulses.length) {
        const recentMood = personPulses.slice(-3).reduce((s, x) => s + x.mood, 0) / Math.min(personPulses.length, 3);
        if (recentMood <= 2) { riskScore += 30; signals.push('Humor baixo (pulse)'); }
        else if (recentMood <= 3) { riskScore += 10; signals.push('Humor medio'); }
      } else {
        riskScore += 15; signals.push('Sem respostas pulse');
      }

      // Signal 2: Fewer received feedbacks
      const receivedFeedbacks = feedbacks.filter(f => f.para === person.id);
      const positiveFeedbacks = receivedFeedbacks.filter(f => f.tipo === 'positivo');
      if (receivedFeedbacks.length === 0) { riskScore += 20; signals.push('Sem feedbacks recebidos'); }
      else if (positiveFeedbacks.length / receivedFeedbacks.length < 0.5) { riskScore += 15; signals.push('Maioria feedbacks construtivos'); }

      // Signal 3: No 1:1s recently
      const person1on1s = oneOnOnes.filter(o => o.colaborador === person.id && o.status === 'concluida');
      if (person1on1s.length === 0) { riskScore += 20; signals.push('Sem 1:1s realizadas'); }

      // Signal 4: Low evaluation score
      const review = reviews.find(r => r.pessoaId === person.id);
      if (review && review.mediaGeral < 3) { riskScore += 15; signals.push('Nota avaliacao < 3.0'); }

      // Signal 5: Junior with high tenure (stuck)
      if (person.nivel && person.nivel.includes('Jr') && person.nivel.includes('II')) {
        riskScore += 10; signals.push('Nivel Jr. II (possivel estagnacao)');
      }

      const riskLevel = riskScore >= 50 ? 'alto' : riskScore >= 25 ? 'medio' : 'baixo';
      return { ...person, riskScore, riskLevel, signals, evalScore: review?.mediaGeral || 0 };
    }).sort((a, b) => b.riskScore - a.riskScore);

    const highRisk = risks.filter(r => r.riskLevel === 'alto');
    const medRisk = risks.filter(r => r.riskLevel === 'medio');

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Equipe Analisada</div><div class="kpi-value">${team.length}</div></div>
        <div class="kpi-card kpi-card--warning"><div class="kpi-label">Risco Alto</div><div class="kpi-value" style="color:var(--color-danger);">${highRisk.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Risco Medio</div><div class="kpi-value" style="color:var(--color-warning);">${medRisk.length}</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Risco Baixo</div><div class="kpi-value">${risks.length - highRisk.length - medRisk.length}</div></div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Mapa de Risco de Evasao</h3></div>
        <div style="padding:0;">
          ${risks.map(r => {
            const riskColors = { alto: 'var(--color-danger)', medio: 'var(--color-warning)', baixo: 'var(--color-success)' };
            return `
              <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;">
                <div style="width:8px;height:40px;border-radius:4px;background:${riskColors[r.riskLevel]};flex-shrink:0;"></div>
                <div style="width:120px;">
                  <div style="font-weight:600;font-size:0.85rem;">${r.name}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);">${r.bu || '-'} \u2022 ${r.nivel || '-'}</div>
                </div>
                <div style="flex:1;display:flex;gap:4px;flex-wrap:wrap;">
                  ${r.signals.map(s => `<span class="tag" style="font-size:0.62rem;background:${riskColors[r.riskLevel]}15;color:${riskColors[r.riskLevel]};">${s}</span>`).join('')}
                </div>
                <div style="text-align:right;width:80px;">
                  <div style="font-size:0.9rem;font-weight:700;color:${riskColors[r.riskLevel]};">${r.riskScore}%</div>
                  <div style="font-size:0.68rem;color:var(--text-muted);">${r.riskLevel}</div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // 3. SUCCESSION PLANNING
  // ══════════════════════════════════════════════════════════════════
  _renderSucessao() {
    const team = this._getTeam();
    const succession = this._getStore('succession') || {};
    const reviews = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('avaliacoes_people') : [];

    // Critical positions: Directors + POs + Tech Leads
    const criticalRoles = team.filter(m => !m.lider || m.cargo.includes('PO') || m.cargo.includes('Coord') || m.cargo.includes('Lider') || m.cargo.includes('Diretor'));

    return `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Posicoes Criticas & Plano de Contingencia</h3></div>
        <div style="padding:0;">
          ${criticalRoles.map(person => {
            const succ = succession[person.id] || {};
            const successor = succ.successorId ? team.find(t => t.id === succ.successorId) : null;
            const review = reviews.find(r => r.pessoaId === succ.successorId);
            const readiness = succ.readinessPct || 0;
            const readinessColor = readiness >= 80 ? 'var(--color-success)' : readiness >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';

            return `
              <div style="padding:16px;border-bottom:1px solid var(--border-subtle);">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                  <div style="width:40px;height:40px;border-radius:50%;background:var(--accent-gold);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;">
                    ${person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style="flex:1;">
                    <div style="font-weight:700;font-size:0.9rem;">${person.name}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${person.cargo} \u2022 ${person.bu || '-'}</div>
                  </div>
                  <span class="tag" style="font-size:0.68rem;background:var(--color-danger-dim,#fef2f2);color:var(--color-danger);">Posicao Critica</span>
                </div>
                <div style="display:flex;gap:12px;align-items:center;padding:8px 0 0 52px;">
                  ${successor ? `
                    <span style="font-size:0.78rem;">Substituto: <strong>${successor.name}</strong></span>
                    <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;max-width:200px;">
                      <div style="height:100%;width:${readiness}%;background:${readinessColor};border-radius:3px;"></div>
                    </div>
                    <span style="font-size:0.78rem;font-weight:600;color:${readinessColor};">${readiness}% pronto</span>
                    ${succ.gaps ? `<span style="font-size:0.72rem;color:var(--text-muted);">Gaps: ${succ.gaps}</span>` : ''}
                  ` : `
                    <span style="font-size:0.78rem;color:var(--color-danger);">Sem substituto definido</span>
                    <span style="font-size:0.72rem;color:var(--text-muted);">Se ${person.name.split(' ')[0]} sair, quem assume?</span>
                  `}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Definir Sucessor</h3></div>
        <div style="padding:16px;">
          <div class="grid-3" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Posicao</label>
              <select class="form-input" id="succPosition">${criticalRoles.map(t => `<option value="${t.id}">${t.name} — ${t.cargo}</option>`).join('')}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Sucessor</label>
              <select class="form-input" id="succSuccessor">${team.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Prontidao (%)</label>
              <input type="number" class="form-input" id="succReadiness" min="0" max="100" value="50">
            </div>
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label">Gaps a desenvolver</label>
            <input class="form-input" id="succGaps" placeholder="Ex: Gestao de P&L, Lideranca estrategica...">
          </div>
          <button class="btn btn-primary btn-sm" id="successionSave">Salvar Plano</button>
        </div>
      </div>
    `;
  },

  _saveSuccession() {
    const posId = document.getElementById('succPosition')?.value;
    const succId = document.getElementById('succSuccessor')?.value;
    const readiness = parseInt(document.getElementById('succReadiness')?.value) || 0;
    const gaps = document.getElementById('succGaps')?.value || '';
    if (!posId || !succId) return;

    const data = this._getStore('succession') || {};
    data[posId] = { successorId: succId, readinessPct: readiness, gaps, updatedAt: new Date().toISOString() };
    this._setStore('succession', data);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Plano de sucessao atualizado!');
    this._refresh();
  },

  // ══════════════════════════════════════════════════════════════════
  // 4. BENEFITS TCO
  // ══════════════════════════════════════════════════════════════════
  _renderBeneficios() {
    const team = this._getTeam();
    const benefits = this._getStore('benefits') || {};
    const defaults = benefits._defaults || { vale_refeicao: 800, plano_saude: 500, vale_transporte: 300, cursos: 200, equipamentos: 150 };
    const benefitLabels = { vale_refeicao: 'Vale Refeicao', plano_saude: 'Plano de Saude', vale_transporte: 'Vale Transporte', cursos: 'Cursos & Capacitacao', equipamentos: 'Equipamentos' };

    const rows = team.map(m => {
      const personal = benefits[m.id] || {};
      const salary = personal.salary || 0;
      const totalBenefits = Object.keys(defaults).reduce((s, k) => s + (personal[k] || defaults[k] || 0), 0);
      const tco = salary + totalBenefits;
      return { ...m, salary, totalBenefits, tco, personal };
    });

    const totalTCO = rows.reduce((s, r) => s + r.tco, 0);

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">TCO Total/Mes</div><div class="kpi-value">R$ ${this._fmtCurrency(totalTCO)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Custo Medio/Pessoa</div><div class="kpi-value">R$ ${this._fmtCurrency(team.length ? totalTCO / team.length : 0)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Membros</div><div class="kpi-value">${team.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">TCO Anual</div><div class="kpi-value">R$ ${this._fmtCurrency(totalTCO * 12)}</div></div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Pacote Completo por Pessoa</h3></div>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:0.78rem;">
            <thead><tr style="border-bottom:2px solid var(--border-default);">
              <th style="text-align:left;padding:8px;">Membro</th>
              <th style="text-align:left;padding:8px;">BU</th>
              <th style="text-align:right;padding:8px;">Salario</th>
              ${Object.values(benefitLabels).map(l => `<th style="text-align:right;padding:8px;">${l.split(' ')[0]}</th>`).join('')}
              <th style="text-align:right;padding:8px;font-weight:700;">TCO</th>
            </tr></thead>
            <tbody>
              ${rows.map(r => `
                <tr style="border-bottom:1px solid var(--border-subtle);">
                  <td style="padding:8px;font-weight:500;">${r.name}</td>
                  <td style="padding:8px;color:var(--text-muted);">${r.bu || '-'}</td>
                  <td style="padding:8px;text-align:right;">${r.salary ? 'R$ ' + this._fmtCurrency(r.salary) : '-'}</td>
                  ${Object.keys(defaults).map(k => `<td style="padding:8px;text-align:right;color:var(--text-muted);">R$ ${this._fmtCurrency(r.personal[k] || defaults[k])}</td>`).join('')}
                  <td style="padding:8px;text-align:right;font-weight:700;color:var(--accent-gold);">R$ ${this._fmtCurrency(r.tco)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Editar Beneficios Padrao (R$/mes)</h3></div>
        <div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
          ${Object.entries(benefitLabels).map(([k, label]) => `
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">${label}</label>
              <input type="number" class="form-input benefit-default" data-key="${k}" value="${defaults[k]}" min="0" step="50">
            </div>
          `).join('')}
          <div style="display:flex;align-items:flex-end;"><button class="btn btn-primary btn-sm" id="benefitsSave">Salvar</button></div>
        </div>
      </div>
    `;
  },

  _saveBenefits() {
    const data = this._getStore('benefits') || {};
    if (!data._defaults) data._defaults = {};
    document.querySelectorAll('.benefit-default').forEach(input => {
      data._defaults[input.dataset.key] = parseFloat(input.value) || 0;
    });
    this._setStore('benefits', data);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Beneficios atualizados!');
  },

  // ══════════════════════════════════════════════════════════════════
  // 5. SOCIOGRAMA (Organizational Network)
  // ══════════════════════════════════════════════════════════════════
  _renderSociograma() {
    const team = this._getTeam();
    const feedbacks = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('feedbacks') : [];
    const elogios = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('elogios') : [];
    const oneOnOnes = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('1on1s') : [];

    // Build connection matrix
    const connections = {};
    const addConnection = (a, b, type) => {
      const key = [a, b].sort().join('-');
      if (!connections[key]) connections[key] = { a, b, strength: 0, types: [] };
      connections[key].strength++;
      if (!connections[key].types.includes(type)) connections[key].types.push(type);
    };

    feedbacks.forEach(f => addConnection(f.de, f.para, 'feedback'));
    elogios.forEach(e => addConnection(e.de, e.para, 'elogio'));
    oneOnOnes.forEach(o => addConnection(o.lider, o.colaborador, '1:1'));

    const conns = Object.values(connections).sort((a, b) => b.strength - a.strength);

    // Find isolated people
    const connected = new Set();
    conns.forEach(c => { connected.add(c.a); connected.add(c.b); });
    const isolated = team.filter(m => !connected.has(m.id));

    // BU clusters
    const buGroups = {};
    team.forEach(m => {
      const bu = m.bu || 'Outros';
      if (!buGroups[bu]) buGroups[bu] = [];
      buGroups[bu].push(m);
    });

    // Cross-BU connections
    const crossBU = conns.filter(c => {
      const aTeam = team.find(t => t.id === c.a);
      const bTeam = team.find(t => t.id === c.b);
      return aTeam && bTeam && aTeam.bu && bTeam.bu && aTeam.bu !== bTeam.bu;
    });

    // Pairs without interaction
    const missingPairs = [];
    const bus = Object.keys(buGroups);
    for (let i = 0; i < bus.length; i++) {
      for (let j = i + 1; j < bus.length; j++) {
        const cross = crossBU.filter(c => {
          const aTeam = team.find(t => t.id === c.a);
          const bTeam = team.find(t => t.id === c.b);
          return (aTeam?.bu === bus[i] && bTeam?.bu === bus[j]) || (aTeam?.bu === bus[j] && bTeam?.bu === bus[i]);
        });
        if (cross.length === 0 && buGroups[bus[i]].length && buGroups[bus[j]].length) {
          missingPairs.push({ bu1: bus[i], bu2: bus[j] });
        }
      }
    }

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Conexoes</div><div class="kpi-value">${conns.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Cross-BU</div><div class="kpi-value">${crossBU.length}</div></div>
        <div class="kpi-card kpi-card--warning"><div class="kpi-label">Isolados</div><div class="kpi-value">${isolated.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">BUs</div><div class="kpi-value">${bus.length}</div></div>
      </div>

      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:12px;">Conexoes Mais Fortes</h4>
          ${conns.slice(0, 10).map(c => `
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border-subtle);font-size:0.82rem;">
              <strong>${this._getPersonName(c.a)}</strong>
              <span style="color:var(--text-muted);">\u2194</span>
              <strong>${this._getPersonName(c.b)}</strong>
              <span style="margin-left:auto;font-size:0.72rem;color:var(--color-info);">${c.strength} interacoes</span>
              <span style="font-size:0.68rem;color:var(--text-muted);">${c.types.join(', ')}</span>
            </div>
          `).join('')}
        </div>

        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:12px;">Clusters por BU</h4>
          ${Object.entries(buGroups).map(([bu, members]) => `
            <div style="margin-bottom:10px;">
              <div style="font-size:0.82rem;font-weight:600;margin-bottom:4px;">${bu} (${members.length})</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;">
                ${members.map(m => `<span class="tag" style="font-size:0.7rem;">${m.name.split(' ')[0]}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${missingPairs.length > 0 || isolated.length > 0 ? `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Alertas de Sinergia</h3></div>
          ${missingPairs.map(p => `
            <div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
              <span style="font-size:1rem;">\u26A0\uFE0F</span>
              <span style="font-size:0.82rem;"><strong>${p.bu1}</strong> nunca colaborou com <strong>${p.bu2}</strong> — oportunidade de sinergia</span>
            </div>
          `).join('')}
          ${isolated.map(m => `
            <div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
              <span style="font-size:1rem;">\u{1F6A8}</span>
              <span style="font-size:0.82rem;"><strong>${m.name}</strong> sem interacoes registradas — risco de isolamento</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // 6. CAREER PATH (Progression)
  // ══════════════════════════════════════════════════════════════════
  _renderCarreira() {
    const team = this._getTeam();
    const reviews = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('avaliacoes_people') : [];

    return `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Trilha de Progressao TBO</h3></div>
        <div style="padding:16px;display:flex;gap:4px;align-items:center;overflow-x:auto;margin-bottom:16px;">
          ${Object.keys(this._careerLadder).map((level, i) => `
            <div style="text-align:center;min-width:90px;">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--accent-gold);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;margin:0 auto 4px;">${i + 1}</div>
              <div style="font-size:0.72rem;font-weight:600;">${level}</div>
            </div>
            ${i < Object.keys(this._careerLadder).length - 1 ? '<div style="width:20px;height:2px;background:var(--border-default);flex-shrink:0;"></div>' : ''}
          `).join('')}
        </div>
      </div>

      ${team.filter(m => m.nivel).map(person => {
        const ladder = this._careerLadder[person.nivel];
        const review = reviews.find(r => r.pessoaId === person.id);
        const score = review?.mediaGeral || 0;
        const currentLevel = ladder?.level || 0;
        const totalLevels = Object.keys(this._careerLadder).length;
        const progressPct = totalLevels ? Math.round((currentLevel / totalLevels) * 100) : 0;

        return `
          <div class="card" style="margin-bottom:12px;padding:16px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--color-info);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;">
                ${person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:0.88rem;">${person.name}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);">${person.cargo} \u2022 ${person.bu || '-'}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.85rem;font-weight:700;color:var(--accent-gold);">${person.nivel}</div>
                <div style="font-size:0.68rem;color:var(--text-muted);">Nota: ${score ? score.toFixed(1) : '-'}</div>
              </div>
            </div>
            <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;margin-bottom:8px;">
              <div style="height:100%;width:${progressPct}%;background:var(--accent-gold);border-radius:3px;"></div>
            </div>
            ${ladder?.next ? `
              <div style="font-size:0.78rem;color:var(--text-secondary);">
                Proximo nivel: <strong>${ladder.next}</strong>
              </div>
              <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
                ${(ladder.criteria || []).map(c => `<span class="tag" style="font-size:0.65rem;">${c}</span>`).join('')}
              </div>
            ` : '<div style="font-size:0.78rem;color:var(--color-success);font-weight:600;">Nivel maximo alcancado</div>'}
          </div>`;
      }).join('')}
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // 7. VACATION & COVERAGE
  // ══════════════════════════════════════════════════════════════════
  _renderFerias() {
    const team = this._getTeam();
    const absences = this._getStore('absences') || [];
    const now = new Date();

    const upcoming = absences.filter(a => new Date(a.end) >= now).sort((a, b) => new Date(a.start) - new Date(b.start));
    const current = absences.filter(a => new Date(a.start) <= now && new Date(a.end) >= now);

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Ausencias Proximas</div><div class="kpi-value">${upcoming.length}</div></div>
        <div class="kpi-card kpi-card--warning"><div class="kpi-label">Ausentes Hoje</div><div class="kpi-value">${current.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Equipe Ativa</div><div class="kpi-value">${team.length - current.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Cobertura Definida</div><div class="kpi-value">${absences.filter(a => a.coveredBy).length}/${absences.length}</div></div>
      </div>

      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Registrar Ausencia</h3></div>
          <div style="padding:16px;">
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Colaborador</label>
                <select class="form-input" id="absencePerson">${team.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Tipo</label>
                <select class="form-input" id="absenceType">
                  <option value="ferias">Ferias</option><option value="folga">Folga</option>
                  <option value="licenca">Licenca</option><option value="atestado">Atestado</option>
                </select>
              </div>
            </div>
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Inicio</label>
                <input type="date" class="form-input" id="absenceStart">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Fim</label>
                <input type="date" class="form-input" id="absenceEnd">
              </div>
            </div>
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label">Cobertura (quem substitui)</label>
              <select class="form-input" id="absenceCover"><option value="">Ninguem definido</option>${team.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select>
            </div>
            <button class="btn btn-primary btn-sm" id="absenceSubmit">Registrar</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">Calendario de Ausencias</h3></div>
          <div style="max-height:400px;overflow-y:auto;">
            ${upcoming.length > 0 ? upcoming.map(a => {
              const person = team.find(t => t.id === a.personId);
              const cover = a.coveredBy ? team.find(t => t.id === a.coveredBy) : null;
              const isCurrent = new Date(a.start) <= now && new Date(a.end) >= now;
              const typeLabels = { ferias: 'Ferias', folga: 'Folga', licenca: 'Licenca', atestado: 'Atestado' };
              const days = Math.ceil((new Date(a.end) - new Date(a.start)) / (1000 * 60 * 60 * 24)) + 1;
              return `
                <div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
                  ${isCurrent ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--color-danger);flex-shrink:0;"></span>' : '<span style="width:8px;height:8px;border-radius:50%;background:var(--color-info);flex-shrink:0;"></span>'}
                  <div style="flex:1;">
                    <div style="font-size:0.82rem;font-weight:500;">${person?.name || a.personId}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${typeLabels[a.type] || a.type} \u2022 ${days} dia(s)</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:0.78rem;">${new Date(a.start + 'T12:00').toLocaleDateString('pt-BR')} — ${new Date(a.end + 'T12:00').toLocaleDateString('pt-BR')}</div>
                    <div style="font-size:0.72rem;color:${cover ? 'var(--color-success)' : 'var(--color-warning)'};">${cover ? 'Cobertura: ' + cover.name : 'Sem cobertura'}</div>
                  </div>
                </div>`;
            }).join('') : '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma ausencia registrada.</div>'}
          </div>
        </div>
      </div>

      ${current.length > 0 ? `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Alertas de Cobertura</h3></div>
          ${current.filter(a => !a.coveredBy).map(a => {
            const person = team.find(t => t.id === a.personId);
            return `<div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
              <span style="font-size:1rem;">\u26A0\uFE0F</span>
              <span style="font-size:0.82rem;"><strong>${person?.name || ''}</strong> ausente ate ${new Date(a.end + 'T12:00').toLocaleDateString('pt-BR')} sem cobertura definida</span>
            </div>`;
          }).join('')}
        </div>
      ` : ''}
    `;
  },

  _addAbsence() {
    const personId = document.getElementById('absencePerson')?.value;
    const type = document.getElementById('absenceType')?.value;
    const start = document.getElementById('absenceStart')?.value;
    const end = document.getElementById('absenceEnd')?.value;
    const coveredBy = document.getElementById('absenceCover')?.value || '';
    if (!personId || !start || !end) { if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Preencha todos os campos'); return; }

    const absences = this._getStore('absences') || [];
    absences.push({ id: this._genId(), personId, type, start, end, coveredBy, createdAt: new Date().toISOString() });
    this._setStore('absences', absences);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Ausencia registrada!');
    this._refresh();
  },

  // ══════════════════════════════════════════════════════════════════
  // 8. FEEDBACK → PDP Integration
  // ══════════════════════════════════════════════════════════════════
  _renderFeedbackPDP() {
    const feedbacks = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('feedbacks') : [];
    const constructive = feedbacks.filter(f => f.tipo === 'construtivo');
    const pdiData = typeof TBO_TRILHA_APRENDIZAGEM !== 'undefined' ? TBO_TRILHA_APRENDIZAGEM._loadPDI() : {};

    return `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3 class="card-title">Feedbacks Construtivos → Metas de Desenvolvimento</h3>
          <span style="font-size:0.72rem;color:var(--text-muted);">${constructive.length} feedbacks construtivos registrados</span>
        </div>
        <div style="max-height:500px;overflow-y:auto;">
          ${constructive.length ? constructive.sort((a, b) => new Date(b.data) - new Date(a.data)).map(f => {
            const hasGoal = Object.values(pdiData).some(d => (d.goals || []).some(g => g.linkedFeedback === f.id));
            return `
              <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:flex-start;gap:10px;">
                <div style="width:4px;min-height:40px;border-radius:2px;background:var(--color-warning);flex-shrink:0;"></div>
                <div style="flex:1;">
                  <div style="font-size:0.82rem;margin-bottom:4px;">
                    <strong>${this._getPersonName(f.de)}</strong>
                    <span style="color:var(--text-muted);"> → </span>
                    <strong>${this._getPersonName(f.para)}</strong>
                    <span style="font-size:0.68rem;color:var(--text-muted);margin-left:8px;">${new Date(f.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:6px;">${f.mensagem}</div>
                  ${hasGoal ? `
                    <span class="tag" style="font-size:0.65rem;background:var(--color-success-dim);color:var(--color-success);">Ja convertido em meta</span>
                  ` : `
                    <button class="btn btn-sm btn-secondary pa-convert-feedback" data-fbid="${f.id}" data-person="${f.para}" data-text="${f.mensagem.substring(0, 80)}">Converter em meta PDI</button>
                  `}
                </div>
              </div>`;
          }).join('') : '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhum feedback construtivo encontrado.</div>'}
        </div>
      </div>
    `;
  },

  _convertFeedbackToPDP(fbId) {
    if (typeof TBO_TRILHA_APRENDIZAGEM === 'undefined') return;
    const feedbacks = typeof TBO_RH !== 'undefined' ? TBO_RH._getStore('feedbacks') : [];
    const fb = feedbacks.find(f => f.id === fbId);
    if (!fb) return;

    const pdiData = TBO_TRILHA_APRENDIZAGEM._loadPDI();
    if (!pdiData[fb.para]) pdiData[fb.para] = { goals: [], competencyLevels: {} };

    pdiData[fb.para].goals.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: `[Feedback] ${fb.mensagem.substring(0, 100)}`,
      status: 'pendente',
      prazo: '',
      linkedGap: '',
      linkedFeedback: fb.id,
      createdAt: new Date().toISOString()
    });

    TBO_TRILHA_APRENDIZAGEM._savePDI(pdiData);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Meta criada!', `Feedback convertido em meta para ${this._getPersonName(fb.para)}`);
    this._refresh();
  },

  // ══════════════════════════════════════════════════════════════════
  // SHARED HELPERS
  // ══════════════════════════════════════════════════════════════════
  _genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },

  _getStore(key) {
    try { return JSON.parse(localStorage.getItem('tbo_pa_' + key) || (key === 'absences' || key === 'pulse' ? '[]' : '{}')); }
    catch { return key === 'absences' || key === 'pulse' ? [] : {}; }
  },
  _setStore(key, data) { localStorage.setItem('tbo_pa_' + key, JSON.stringify(data)); },

  _bind(id, fn) { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); },

  _getTeam() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) {
      return TBO_RH._team.filter(m => !m.terceirizado).map(m => ({
        id: m.id, name: m.nome || m.id, bu: m.bu || '', cargo: m.cargo || '', nivel: m.nivel || '', lider: m.lider || ''
      }));
    }
    return [];
  },

  _getPersonName(id) {
    if (typeof TBO_RH !== 'undefined') {
      const p = TBO_RH._team.find(t => t.id === id);
      if (p) return p.nome;
    }
    return id || '-';
  },

  _currentUserId() {
    if (typeof TBO_AUTH !== 'undefined') { const u = TBO_AUTH.getCurrentUser(); return u ? u.id : 'marco'; }
    return 'marco';
  },

  _getWeekKey(date) {
    const d = new Date(date);
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  },

  _fmtCurrency(val) {
    if (!val) return '0';
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  }
};
