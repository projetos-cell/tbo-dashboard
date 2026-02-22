// TBO OS — People Tab: Performance & PDI
// Sub-modulo lazy-loaded: ciclos, ranking, 9-box, formulario de avaliacao

(function() {
  const S = TBO_PEOPLE_SHARED;

  const TabPerformance = {
    render() {
      const ciclos = S._getStore('ciclos');
      const reviews = S._getStore('avaliacoes_people');
      const activeCycle = ciclos.find(c => c.status === 'em_andamento') || ciclos[0];

      return `
        ${S._pageHeader('Performance & PDI', 'Ciclos de avaliacao, ranking e planos de desenvolvimento')}
        <div class="tab-bar tab-bar--sub" id="rhPerfSubtabs" style="margin-bottom:16px;">
          <button class="tab tab--sub active" data-subtab="perf-ciclo">Ciclo</button>
          <button class="tab tab--sub" data-subtab="perf-ranking">Ranking</button>
          <button class="tab tab--sub" data-subtab="perf-9box">9-Box</button>
          <button class="tab tab--sub" data-subtab="perf-avaliar">Avaliar</button>
        </div>
        <div class="subtab-content active" id="subtab-perf-ciclo">${this._renderCiclo(activeCycle, reviews)}</div>
        <div class="subtab-content" id="subtab-perf-ranking">${this._renderRanking(activeCycle, reviews)}</div>
        <div class="subtab-content" id="subtab-perf-9box">${this._renderNineBox(reviews)}</div>
        <div class="subtab-content" id="subtab-perf-avaliar">${this._renderAvaliarForm(activeCycle, reviews)}</div>
        <div id="rhDetailOverlay" style="display:none;"></div>
      `;
    },

    init() {
      // Performance subtab switching
      document.querySelectorAll('#rhPerfSubtabs .tab--sub').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('#rhPerfSubtabs .tab--sub').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('#rhPerfSubtabs ~ .subtab-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          const target = document.getElementById(`subtab-${tab.dataset.subtab}`);
          if (target) target.classList.add('active');
        });
      });

      // Person detail (ranking)
      this._bindPersonDetailClicks();

      // Avaliar form
      const avalTarget = document.getElementById('avalTarget');
      if (avalTarget) {
        avalTarget.addEventListener('change', () => {
          const fields = document.getElementById('avalFormFields');
          if (fields) fields.style.display = avalTarget.value ? 'block' : 'none';
        });
      }
      document.querySelectorAll('.aval-score-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll(`.aval-score-btn[data-comp="${btn.dataset.comp}"]`).forEach(b => { b.classList.remove('active'); b.style.background = 'var(--bg-primary)'; b.style.color = ''; });
          btn.classList.add('active'); btn.style.background = 'var(--accent-gold)'; btn.style.color = '#fff';
        });
      });
      S._bind('avalSubmit', () => {
        const ciclos = S._getStore('ciclos');
        const cycle = ciclos.find(c => c.status === 'em_andamento') || ciclos[0];
        if (cycle) this._submitAvaliacao(cycle.id);
      });

      if (window.lucide) lucide.createIcons();
    },

    // ── Ciclo ──────────────────────────────────────────────────────
    _renderCiclo(cycle, reviews) {
      if (!cycle) return '<div class="empty-state"><div class="empty-state-text">Nenhum ciclo de avaliacao</div></div>';
      const respondidos = reviews.filter(r => r.cicloId === cycle.id).length;
      const total = S._team.filter(t => t.lider && !t.terceirizado).length;
      const medias = reviews.filter(r => r.cicloId === cycle.id).map(r => r.mediaGeral);
      const mediaGeral = medias.length ? (medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(2) : '0';
      const progresso = cycle.fases ? Math.round(cycle.fases.reduce((s, f) => s + f.progresso, 0) / cycle.fases.length) : 0;
      const statusColor = cycle.status === 'em_andamento' ? 'var(--color-info)' : 'var(--color-success)';

      return `
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header">
            <div>
              <h3 class="card-title" style="margin-bottom:4px;">${cycle.nome}</h3>
              <div style="display:flex;gap:8px;align-items:center;">
                <span class="tag" style="font-size:0.68rem;background:var(--color-info-dim);color:var(--color-info);">${cycle.tipo}</span>
                <span style="font-size:0.72rem;color:var(--text-muted);">${new Date(cycle.inicio).toLocaleDateString('pt-BR')} \u2014 ${new Date(cycle.fim).toLocaleDateString('pt-BR')}</span>
                <span class="tag" style="font-size:0.68rem;background:${statusColor}20;color:${statusColor};">${cycle.status === 'em_andamento' ? 'Em andamento' : 'Finalizado'}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-4" style="margin-bottom:20px;">
          <div class="kpi-card kpi-card--blue"><div class="kpi-label">Participantes</div><div class="kpi-value">${total}</div></div>
          <div class="kpi-card kpi-card--success"><div class="kpi-label">Avaliados</div><div class="kpi-value">${respondidos}</div></div>
          <div class="kpi-card kpi-card--gold"><div class="kpi-label">Media Geral</div><div class="kpi-value">${mediaGeral}</div></div>
          <div class="kpi-card"><div class="kpi-label">Progresso</div><div class="kpi-value">${progresso}%</div></div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Fases do Ciclo</h3></div>
          <div style="padding:16px;">
            ${(cycle.fases || []).map(f => {
              const pColor = f.progresso >= 100 ? 'var(--color-success)' : f.progresso > 0 ? 'var(--color-info)' : 'var(--text-muted)';
              return `<div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--border-subtle);">
                <div style="width:180px;font-weight:600;font-size:0.82rem;">${f.nome}</div>
                <div style="flex:1;"><div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${f.progresso}%;background:${pColor};border-radius:4px;"></div></div></div>
                <div style="width:50px;text-align:right;font-size:0.82rem;font-weight:600;color:${pColor};">${f.progresso}%</div>
                <div style="width:160px;font-size:0.68rem;color:var(--text-muted);text-align:right;">${new Date(f.inicio).toLocaleDateString('pt-BR')} \u2014 ${new Date(f.fim).toLocaleDateString('pt-BR')}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      `;
    },

    // ── Ranking ────────────────────────────────────────────────────
    _renderRanking(cycle, reviews) {
      if (!cycle) return '<div class="empty-state"><div class="empty-state-text">Nenhum ciclo ativo</div></div>';
      const isAdmin = S._isAdmin();
      const userId = S._currentUserId();
      let cycleReviews = reviews.filter(r => r.cicloId === cycle.id);
      if (!isAdmin) cycleReviews = cycleReviews.filter(r => r.pessoaId === userId);
      cycleReviews.sort((a, b) => b.mediaGeral - a.mediaGeral);
      if (!cycleReviews.length) return '<div class="empty-state"><div class="empty-state-text">Sem avaliacoes disponiveis</div></div>';

      return `<div class="card">
        <div class="card-header"><h3 class="card-title">Ranking \u2014 ${cycle.nome}</h3></div>
        <table class="data-table"><thead><tr><th>#</th><th>Colaborador(a)</th><th>Destaques</th><th style="text-align:center;">Nota</th><th></th></tr></thead>
        <tbody>${cycleReviews.map((r, i) => {
          const p = S._getPerson(r.pessoaId);
          if (!p) return '';
          const mc = ['var(--accent-gold)', 'var(--text-secondary)', '#cd7f32'];
          return `<tr>
            <td style="font-weight:700;color:${i < 3 ? mc[i] : 'var(--text-muted)'};">${i + 1}</td>
            <td><div style="font-weight:600;font-size:0.85rem;">${p.nome}</div><div style="font-size:0.72rem;color:var(--text-muted);">${p.cargo}</div></td>
            <td>${(r.destaques || []).map(d => `<span class="tag" style="font-size:0.65rem;">${d}</span>`).join(' ')}</td>
            <td style="text-align:center;"><span style="font-size:1.1rem;font-weight:700;color:${r.mediaGeral >= 4 ? 'var(--color-success)' : r.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${r.mediaGeral.toFixed(1)}</span></td>
            <td><button class="btn btn-sm btn-secondary rh-view-person" data-person="${r.pessoaId}" data-cycle="${cycle.id}">Ver</button></td>
          </tr>`;
        }).join('')}</tbody></table></div>`;
    },

    // ── Person Detail (overlay) ───────────────────────────────────
    _renderPersonDetail(personId, cycleId) {
      const reviews = S._getStore('avaliacoes_people');
      const review = reviews.find(r => r.pessoaId === personId && r.cicloId === cycleId);
      const person = S._getPerson(personId);
      if (!review || !person) return '<div class="empty-state"><div class="empty-state-text">Avaliacao nao encontrada</div></div>';
      const radarSvg = this._renderRadarSVG(review);

      return `
        <button class="btn btn-secondary btn-sm" id="rhBackToList" style="margin-bottom:12px;"><i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Voltar</button>
        <div class="grid-3" style="gap:16px;margin-bottom:20px;align-items:start;">
          <div class="card" style="padding:20px;text-align:center;">
            <div style="display:flex;justify-content:center;margin-bottom:12px;">${S._getAvatarHTML(person, 56, '1.2rem')}</div>
            <div style="font-weight:700;">${S._esc(person.nome)}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:12px;">${S._esc(person.cargo)}</div>
            <div style="font-size:2rem;font-weight:800;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${review.mediaGeral.toFixed(1)}</div>
          </div>
          <div class="card" style="padding:20px;">
            <h4 style="font-size:0.85rem;margin-bottom:16px;">Notas por Fonte</h4>
            ${['Auto|autoMedia|var(--color-info)', 'Gestor|gestorMedia|var(--accent-gold)', 'Pares|paresMedia|var(--color-purple)'].map(s => { const [l, k, c] = s.split('|'); return `<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;"><span>${l}</span><strong>${review[k].toFixed(1)}</strong></div><div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${(review[k] / 5) * 100}%;background:${c};border-radius:3px;"></div></div></div>`; }).join('')}
          </div>
          <div class="card" style="padding:20px;"><h4 style="font-size:0.85rem;margin-bottom:12px;">Radar</h4>${radarSvg}</div>
        </div>
        <div class="grid-2" style="gap:16px;margin-bottom:16px;">
          <div class="card" style="padding:20px;"><h4 style="font-size:0.85rem;margin-bottom:10px;color:var(--color-success);">Destaques</h4><div style="display:flex;flex-wrap:wrap;gap:6px;">${(review.destaques || []).map(d => `<span class="tag" style="background:var(--color-success-dim);color:var(--color-success);">${d}</span>`).join('')}</div></div>
          <div class="card" style="padding:20px;"><h4 style="font-size:0.85rem;margin-bottom:10px;color:var(--color-warning);">Gaps</h4><div style="display:flex;flex-wrap:wrap;gap:6px;">${(review.gaps || []).map(g => `<span class="tag" style="background:var(--color-warning-dim);color:var(--color-warning);">${g}</span>`).join('')}</div></div>
        </div>
        <div class="card" style="padding:20px;"><h4 style="font-size:0.85rem;margin-bottom:8px;">Parecer do Gestor</h4><p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin:0;">${S._esc(review.parecer)}</p></div>
      `;
    },

    // ── Radar SVG ──────────────────────────────────────────────────
    _renderRadarSVG(review) {
      const size = 200, cx = 100, cy = 100, r = 70;
      const comps = S._competenciasRadar;
      const n = comps.length;
      const step = (2 * Math.PI) / n;
      const pt = (i, v) => { const a = -Math.PI / 2 + i * step; return { x: cx + (v / 5) * r * Math.cos(a), y: cy + (v / 5) * r * Math.sin(a) }; };
      let grid = '', axes = '';
      for (let l = 1; l <= 5; l++) { const ps = []; for (let i = 0; i < n; i++) ps.push(pt(i, l)); grid += `<polygon points="${ps.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="var(--border-subtle)" stroke-width="0.5"/>`; }
      for (let i = 0; i < n; i++) { const p = pt(i, 5.5); const p2 = pt(i, 5); axes += `<line x1="${cx}" y1="${cy}" x2="${p2.x}" y2="${p2.y}" stroke="var(--border-subtle)" stroke-width="0.5"/><text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-muted)" font-size="7">${comps[i].nome}</text>`; }
      const gPts = comps.map((c, i) => pt(i, review.gestorScores.find(s => s.comp === c.id)?.nota || 0));
      const aPts = comps.map((c, i) => pt(i, review.autoScores.find(s => s.comp === c.id)?.nota || 0));
      return `<svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:220px;margin:0 auto;display:block;">${grid}${axes}<polygon points="${aPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(58,123,213,0.15)" stroke="var(--color-info)" stroke-width="1.5"/><polygon points="${gPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(232,81,2,0.15)" stroke="var(--accent-gold)" stroke-width="1.5"/>${gPts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="var(--accent-gold)"/>`).join('')}</svg>
      <div style="display:flex;justify-content:center;gap:16px;margin-top:8px;font-size:0.68rem;"><span><span style="display:inline-block;width:10px;height:3px;background:var(--accent-gold);border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Gestor</span><span><span style="display:inline-block;width:10px;height:3px;background:var(--color-info);border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Auto</span></div>`;
    },

    // ── 9-Box ──────────────────────────────────────────────────────
    _renderNineBox(reviews) {
      if (!S._isAdmin()) return '<div class="empty-state"><div class="empty-state-text">Acesso restrito a gestores</div></div>';
      const ciclos = S._getStore('ciclos');
      const activeCycle = ciclos.find(c => c.status === 'em_andamento') || ciclos[0];
      if (!activeCycle) return '<div class="empty-state"><div class="empty-state-text">Nenhum ciclo ativo</div></div>';
      const cr = reviews.filter(r => r.cicloId === activeCycle.id);
      const data = cr.map(r => {
        const p = S._getPerson(r.pessoaId);
        const potComps = ['criatividade', 'aprendizado', 'produtividade'];
        const potScores = r.gestorScores.filter(s => potComps.includes(s.comp));
        const pot = potScores.length ? +(potScores.reduce((a, b) => a + b.nota, 0) / potScores.length).toFixed(1) : r.gestorMedia;
        return { person: p, desemp: r.gestorMedia, potencial: pot };
      });
      const cls = (v) => v >= 4 ? 'high' : v >= 3 ? 'med' : 'low';
      const boxes = {
        'high-low': { label: 'Enigma', color: 'var(--color-warning)', people: [] }, 'high-med': { label: 'Forte Desemp.', color: 'var(--color-info)', people: [] }, 'high-high': { label: 'Estrela', color: 'var(--color-success)', people: [] },
        'med-low': { label: 'Questionavel', color: 'var(--color-danger)', people: [] }, 'med-med': { label: 'Mantenedor', color: 'var(--text-secondary)', people: [] }, 'med-high': { label: 'Futuro Lider', color: 'var(--color-purple)', people: [] },
        'low-low': { label: 'Insuficiente', color: 'var(--color-danger)', people: [] }, 'low-med': { label: 'Eficaz', color: 'var(--color-warning)', people: [] }, 'low-high': { label: 'Especialista', color: 'var(--color-info)', people: [] }
      };
      data.forEach(d => { const k = `${cls(d.potencial)}-${cls(d.desemp)}`; if (boxes[k]) boxes[k].people.push(d.person); });
      const rows = ['high', 'med', 'low'], cols = ['low', 'med', 'high'];
      const potL = { high: 'Alto', med: 'Medio', low: 'Baixo' }, desL = { low: 'Baixo', med: 'Medio', high: 'Alto' };
      return `<div class="card"><div class="card-header"><h3 class="card-title">Matriz 9-Box \u2014 ${activeCycle.nome}</h3></div><div style="padding:16px;">
        <div style="display:flex;margin-bottom:8px;"><div style="width:60px;"></div>${cols.map(c => `<div style="flex:1;text-align:center;font-size:0.72rem;font-weight:600;color:var(--text-muted);">${desL[c]}</div>`).join('')}</div>
        <div style="font-size:0.68rem;color:var(--text-muted);text-align:center;margin-bottom:4px;">\u2192 Desempenho</div>
        ${rows.map(row => `<div style="display:flex;margin-bottom:2px;"><div style="width:60px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:600;color:var(--text-muted);writing-mode:vertical-rl;transform:rotate(180deg);">Pot. ${potL[row]}</div>
          ${cols.map(col => { const b = boxes[`${row}-${col}`]; return `<div style="flex:1;min-height:80px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);margin:1px;padding:8px;background:${b.color}10;"><div style="font-size:0.65rem;font-weight:600;color:${b.color};margin-bottom:4px;">${b.label}</div>${b.people.map(p => `<div style="font-size:0.72rem;">${p ? p.nome : ''}</div>`).join('')}${!b.people.length ? '<div style="font-size:0.65rem;color:var(--text-muted);">\u2014</div>' : ''}</div>`; }).join('')}
        </div>`).join('')}
      </div></div>`;
    },

    // ── Formulario de Avaliacao ────────────────────────────────────
    _renderAvaliarForm(cycle, reviews) {
      if (!cycle || cycle.status === 'finalizado') return '<div class="empty-state"><div class="empty-state-text">Ciclo finalizado.</div></div>';
      const targets = S._isAdmin() ? S._team.filter(t => t.lider && !t.terceirizado) : S._team.filter(t => t.lider && !t.terceirizado && t.lider === S._currentUserId());
      return `<div class="card"><div class="card-header"><h3 class="card-title">Formulario de Avaliacao</h3></div><div style="padding:16px;">
        <div class="form-group" style="max-width:400px;margin-bottom:16px;"><label class="form-label">Colaborador(a)</label><select class="form-input" id="avalTarget"><option value="">Selecione...</option>${targets.map(t => `<option value="${t.supabaseId || t.id}" data-username="${t.id}">${t.nome} \u2014 ${t.cargo}</option>`).join('')}</select></div>
        <div id="avalFormFields" style="display:none;">
          <div style="font-size:0.82rem;font-weight:600;margin-bottom:12px;">Notas por Competencia (1 a 5)</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:16px;">
            ${S._competenciasRadar.map(c => `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-elevated);border-radius:8px;"><span style="font-size:0.82rem;flex:1;font-weight:500;">${c.nome}</span><div style="display:flex;gap:3px;">${[1,2,3,4,5].map(n => `<button class="aval-score-btn" data-comp="${c.id}" data-score="${n}" style="width:30px;height:30px;border:1px solid var(--border-default);border-radius:4px;background:var(--bg-primary);font-size:0.75rem;cursor:pointer;">${n}</button>`).join('')}</div></div>`).join('')}
          </div>
          <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Parecer</label><textarea class="form-input" id="avalParecer" rows="3" placeholder="Parecer descritivo..."></textarea></div>
          <button class="btn btn-primary" id="avalSubmit">Submeter</button>
        </div>
      </div></div>`;
    },

    // ── Bind clicks de "Ver" no ranking ───────────────────────────
    _bindPersonDetailClicks() {
      document.querySelectorAll('.rh-view-person').forEach(btn => {
        btn.addEventListener('click', () => {
          const personId = btn.dataset.person;
          const cycleId = btn.dataset.cycle;
          if (!S._isAdmin() && personId !== S._currentUserId()) { TBO_TOAST.warning('Acesso restrito.'); return; }
          const overlay = document.getElementById('rhDetailOverlay');
          if (overlay) {
            document.querySelectorAll('#rhPerfSubtabs, #rhPerfSubtabs ~ .subtab-content').forEach(el => el.style.display = 'none');
            overlay.style.display = 'block';
            overlay.innerHTML = this._renderPersonDetail(personId, cycleId);
            if (window.lucide) lucide.createIcons();
            S._bind('rhBackToList', () => {
              overlay.style.display = 'none'; overlay.innerHTML = '';
              document.querySelectorAll('#rhPerfSubtabs').forEach(el => el.style.display = '');
              document.querySelectorAll('#rhPerfSubtabs ~ .subtab-content.active').forEach(el => el.style.display = 'block');
            });
          }
        });
      });
    },

    // ── Submeter avaliacao ─────────────────────────────────────────
    async _submitAvaliacao(cycleId) {
      const targetId = document.getElementById('avalTarget')?.value;
      const targetUsername = document.getElementById('avalTarget')?.selectedOptions?.[0]?.dataset?.username;
      if (!targetId) { TBO_TOAST.warning('Selecione um colaborador'); return; }
      const scores = S._competenciasRadar.map(c => {
        const active = document.querySelector(`.aval-score-btn[data-comp="${c.id}"].active`);
        return { comp: c.id, nota: active ? parseFloat(active.dataset.score) : 3 };
      });
      if (!scores.some(s => document.querySelector(`.aval-score-btn[data-comp="${s.comp}"].active`))) { TBO_TOAST.warning('Avalie pelo menos uma competencia'); return; }
      const parecer = document.getElementById('avalParecer')?.value || '';
      const avg = (arr) => arr.length ? +(arr.reduce((s, x) => s + x.nota, 0) / arr.length).toFixed(2) : 0;
      const gestorAvg = avg(scores);

      // Tentar salvar no Supabase
      if (typeof PerformanceRepo !== 'undefined') {
        try {
          // Buscar ciclo ativo
          const cycle = await PerformanceRepo.getActiveCycle();
          if (cycle) {
            await PerformanceRepo.submitReview({
              cycle_id: cycle.id,
              target_user: targetId,
              review_type: 'manager',
              scores: scores,
              average: gestorAvg,
              highlights: [],
              gaps: [],
              comment: parecer
            });
            const personName = targetUsername ? S._getPersonName(targetUsername) : targetId;
            TBO_TOAST.success('Avaliacao submetida!', `${personName} — ${gestorAvg.toFixed(1)}`);
            const tabContent = document.getElementById('rhTabContent');
            if (tabContent) { tabContent.innerHTML = TBO_PEOPLE._renderActiveTab(); TBO_PEOPLE._initActiveTab(); }
            return;
          }
        } catch (e) {
          console.warn('[RH] Erro ao salvar avaliacao no Supabase:', e.message);
        }
      }

      // Fallback: localStorage
      const localTargetId = targetUsername || targetId;
      const reviews = S._getStore('avaliacoes_people');
      let review = reviews.find(r => r.pessoaId === localTargetId && r.cicloId === cycleId);
      if (review) { review.gestorScores = scores; if (parecer) review.parecer = parecer; }
      else {
        const def = S._competenciasRadar.map(c => ({ comp: c.id, nota: 3 }));
        review = { id: S._genId(), cicloId: cycleId, pessoaId: localTargetId, autoScores: def.map(s => ({ ...s })), gestorScores: scores, paresScores: def.map(s => ({ ...s })), destaques: [], gaps: [], parecer };
        reviews.push(review);
      }
      review.autoMedia = avg(review.autoScores); review.gestorMedia = avg(review.gestorScores); review.paresMedia = avg(review.paresScores);
      review.mediaGeral = +((review.autoMedia * 0.2 + review.gestorMedia * 0.5 + review.paresMedia * 0.3)).toFixed(2);
      S._setStore('avaliacoes_people', reviews);
      TBO_TOAST.success('Avaliacao submetida!', `${S._getPersonName(localTargetId)} — ${review.mediaGeral.toFixed(1)}`);
      const tabContent = document.getElementById('rhTabContent');
      if (tabContent) { tabContent.innerHTML = TBO_PEOPLE._renderActiveTab(); TBO_PEOPLE._initActiveTab(); }
    },

    destroy() {}
  };

  TBO_PEOPLE.registerTab('performance', TabPerformance);
})();
