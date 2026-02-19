// TBO OS — Module: Trilha de Aprendizagem (Learning Path / PDI)
// PDI with status, deadlines, gap linkage, gamification, ROI tracking, mentoring, learning paths
const TBO_TRILHA_APRENDIZAGEM = {

  // Competencies, levels, badges, XP — from centralized config
  get _buCompetencies() { return TBO_CONFIG.business.competencies; },
  get _levels() { return TBO_CONFIG.business.gamification.competencyLevels; },
  get _badges() { return TBO_CONFIG.business.gamification.badges.map(b => ({ id: b.id, nome: b.name, icon: b.icon, threshold: b.threshold, desc: b.desc })); },
  get _xpRules() { return TBO_CONFIG.business.gamification.xpPoints; },
  get _xpLevels() { return TBO_CONFIG.business.gamification.levels; },

  // Default learning paths
  _defaultPaths: [
    {
      id: 'path-3d-jr-sr',
      name: 'Trilha 3D Artist Jr \u2192 Sr',
      bu: 'Digital 3D',
      steps: [
        { id: 'step-3d-1', title: 'Dominar SketchUp', description: 'Modelagem 3D com proficiencia em SketchUp', resources: [{ title: 'SketchUp Essentials', url: 'https://learn.sketchup.com', type: 'course', duration: '40h' }], isCompleted: false },
        { id: 'step-3d-2', title: 'Certificacao V-Ray', description: 'Render fotorrealista com V-Ray', resources: [{ title: 'V-Ray Academy', url: 'https://www.chaosgroup.com/learn', type: 'course', duration: '30h' }], isCompleted: false },
        { id: 'step-3d-3', title: 'Dominar Lumion', description: 'Animacoes e walkthroughs em Lumion', resources: [{ title: 'Lumion Training', url: 'https://lumion.com/learning', type: 'video', duration: '20h' }], isCompleted: false },
        { id: 'step-3d-4', title: 'Pos-producao Avancada', description: 'Photoshop e After Effects para renders', resources: [{ title: 'Post-Production for Arch Viz', url: '#', type: 'article', duration: '15h' }], isCompleted: false },
        { id: 'step-3d-5', title: 'Liderar projeto de render', description: 'Conduzir um projeto completo de visualizacao', resources: [], isCompleted: false }
      ],
      assignedMembers: []
    },
    {
      id: 'path-branding',
      name: 'Trilha Branding Designer',
      bu: 'Branding',
      steps: [
        { id: 'step-br-1', title: 'Fundamentos de Tipografia', description: 'Dominar selecao e pareamento tipografico', resources: [{ title: 'Thinking with Type', url: '#', type: 'book', duration: '10h' }], isCompleted: false },
        { id: 'step-br-2', title: 'Identidade Visual Completa', description: 'Criar manual de identidade do zero', resources: [{ title: 'Brand Identity Design', url: '#', type: 'course', duration: '25h' }], isCompleted: false },
        { id: 'step-br-3', title: 'Naming e Estrategia', description: 'Processo de naming e brand strategy', resources: [{ title: 'Brand Strategy Course', url: '#', type: 'course', duration: '20h' }], isCompleted: false },
        { id: 'step-br-4', title: 'Packaging Design', description: 'Design de embalagens e mockups', resources: [{ title: 'Packaging Dielines', url: '#', type: 'article', duration: '15h' }], isCompleted: false },
        { id: 'step-br-5', title: 'Motion Graphics', description: 'Animacao de logos e brand motion', resources: [{ title: 'After Effects for Branding', url: '#', type: 'video', duration: '20h' }], isCompleted: false }
      ],
      assignedMembers: []
    },
    {
      id: 'path-mkt-digital',
      name: 'Trilha Marketing Digital',
      bu: 'Marketing',
      steps: [
        { id: 'step-mk-1', title: 'Fundamentos de Copywriting', description: 'Escrita persuasiva para web', resources: [{ title: 'Copywriting Fundamentals', url: '#', type: 'course', duration: '15h' }], isCompleted: false },
        { id: 'step-mk-2', title: 'SEO e Analytics', description: 'Otimizacao para buscadores e Google Analytics', resources: [{ title: 'Google Analytics Academy', url: 'https://analytics.google.com/analytics/academy/', type: 'course', duration: '20h' }], isCompleted: false },
        { id: 'step-mk-3', title: 'Social Media Strategy', description: 'Planejamento e gestao de redes sociais', resources: [{ title: 'Social Media Marketing', url: '#', type: 'course', duration: '18h' }], isCompleted: false },
        { id: 'step-mk-4', title: 'Paid Ads (Meta & Google)', description: 'Campanhas de trafego pago', resources: [{ title: 'Google Ads Certification', url: 'https://skillshop.withgoogle.com/', type: 'course', duration: '25h' }], isCompleted: false },
        { id: 'step-mk-5', title: 'Email Marketing Avancado', description: 'Automacao e segmentacao de campanhas', resources: [{ title: 'Email Marketing Mastery', url: '#', type: 'course', duration: '12h' }], isCompleted: false }
      ],
      assignedMembers: []
    },
    {
      id: 'path-vendas',
      name: 'Trilha Consultor de Vendas',
      bu: 'Vendas',
      steps: [
        { id: 'step-vd-1', title: 'Tecnicas de Negociacao', description: 'Metodologias de negociacao consultiva', resources: [{ title: 'SPIN Selling', url: '#', type: 'book', duration: '8h' }], isCompleted: false },
        { id: 'step-vd-2', title: 'Dominar CRM', description: 'Gestao avancada de pipeline no CRM', resources: [{ title: 'CRM Best Practices', url: '#', type: 'article', duration: '10h' }], isCompleted: false },
        { id: 'step-vd-3', title: 'Proposta Comercial', description: 'Elaborar propostas de alto impacto', resources: [{ title: 'Proposta que Vende', url: '#', type: 'video', duration: '6h' }], isCompleted: false },
        { id: 'step-vd-4', title: 'Follow-up Estrategico', description: 'Cadencias de follow-up e nurturing', resources: [], isCompleted: false },
        { id: 'step-vd-5', title: 'Networking e Indicacoes', description: 'Construir rede de indicacoes', resources: [], isCompleted: false }
      ],
      assignedMembers: []
    }
  ],

  // Resource type icons
  _resourceIcons: {
    video: '\u{1F3AC}',
    article: '\u{1F4F0}',
    course: '\u{1F393}',
    book: '\u{1F4DA}'
  },

  render() {
    const team = this._getTeam();
    const pdiData = this._loadPDI();
    const withPDI = team.filter(m => {
      const goals = pdiData[m.id]?.goals || [];
      return goals.length > 0;
    });
    const allGoals = team.flatMap(m => (pdiData[m.id]?.goals || []));
    const completed = allGoals.filter(g => g.status === 'concluido');
    const inProgress = allGoals.filter(g => g.status === 'em_andamento');
    const overdue = allGoals.filter(g => g.prazo && g.status !== 'concluido' && new Date(g.prazo) < new Date());

    return `
      <div class="trilha-module">
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card"><div class="kpi-label">Com PDI Ativo</div><div class="kpi-value" style="color:var(--color-success);">${withPDI.length}/${team.length}</div></div>
          <div class="kpi-card"><div class="kpi-label">Metas em Andamento</div><div class="kpi-value" style="color:var(--color-info);">${inProgress.length}</div></div>
          <div class="kpi-card kpi-card--success"><div class="kpi-label">Concluidas</div><div class="kpi-value">${completed.length}</div></div>
          <div class="kpi-card kpi-card--warning"><div class="kpi-label">Atrasadas</div><div class="kpi-value">${overdue.length}</div></div>
        </div>

        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="trilha-pdi">PDI por Membro</button>
          <button class="tab" data-tab="trilha-competencias">Competencias por BU</button>
          <button class="tab" data-tab="trilha-paths">Trilhas</button>
          <button class="tab" data-tab="trilha-gamification">Gamification</button>
          <button class="tab" data-tab="trilha-roi">ROI & Impacto</button>
          <button class="tab" data-tab="trilha-mentoria">Mentoria</button>
        </div>

        <div class="tab-content active" id="tab-trilha-pdi">
          ${team.map(m => this._renderMemberCard(m, pdiData[m.id])).join('')}
        </div>

        <div class="tab-content" id="tab-trilha-competencias">
          ${this._renderCompetencias(team, pdiData)}
        </div>

        <div class="tab-content" id="tab-trilha-paths">
          ${this._renderLearningPaths(team)}
        </div>

        <div class="tab-content" id="tab-trilha-gamification">
          ${this._renderGamification(team, pdiData)}
        </div>

        <div class="tab-content" id="tab-trilha-roi">
          ${this._renderROI(team, pdiData)}
        </div>

        <div class="tab-content" id="tab-trilha-mentoria">
          ${this._renderMentoria(team, pdiData)}
        </div>
      </div>
    `;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.trilha-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.trilha-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.trilha-module .tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // Add goal buttons
    document.querySelectorAll('.trilha-add-goal-btn').forEach(btn => {
      btn.addEventListener('click', () => this._addGoal(btn.dataset.member));
    });

    // Remove goal buttons
    document.querySelectorAll('.trilha-remove-goal').forEach(btn => {
      btn.addEventListener('click', () => this._removeGoal(btn.dataset.member, btn.dataset.goalid));
    });

    // Status change
    document.querySelectorAll('.trilha-goal-status').forEach(sel => {
      sel.addEventListener('change', () => this._updateGoalStatus(sel.dataset.member, sel.dataset.goalid, sel.value));
    });

    // Priority change
    document.querySelectorAll('.trilha-goal-priority').forEach(sel => {
      sel.addEventListener('change', () => this._updateGoalPriority(sel.dataset.member, sel.dataset.goalid, sel.value));
    });

    // Progress notes
    document.querySelectorAll('.trilha-goal-notes').forEach(ta => {
      ta.addEventListener('blur', () => this._updateGoalNotes(ta.dataset.member, ta.dataset.goalid, ta.value));
    });

    // Level selects
    document.querySelectorAll('.trilha-level-select').forEach(sel => {
      sel.addEventListener('change', () => this._updateLevel(sel.dataset.member, sel.dataset.comp, sel.value));
    });

    // Import gaps from evaluation
    document.querySelectorAll('.trilha-import-gaps').forEach(btn => {
      btn.addEventListener('click', () => this._importGaps(btn.dataset.member));
    });

    // Mentoring save
    this._bind('mentoriaSave', () => this._saveMentoring());

    // ── Learning Paths bindings ──
    // Toggle step completion
    document.querySelectorAll('.trilha-step-toggle').forEach(btn => {
      btn.addEventListener('click', () => this._togglePathStep(btn.dataset.pathid, btn.dataset.stepid));
    });

    // Assign member to path
    document.querySelectorAll('.trilha-assign-member-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sel = document.querySelector(`.trilha-assign-member-select[data-pathid="${btn.dataset.pathid}"]`);
        if (sel && sel.value) this._assignMemberToPath(btn.dataset.pathid, sel.value);
      });
    });

    // Remove member from path
    document.querySelectorAll('.trilha-remove-member-path').forEach(btn => {
      btn.addEventListener('click', () => this._removeMemberFromPath(btn.dataset.pathid, btn.dataset.memberid));
    });

    // Create new path
    this._bind('trilhaCreatePathBtn', () => this._createNewPath());

    // Add step to path
    document.querySelectorAll('.trilha-add-step-btn').forEach(btn => {
      btn.addEventListener('click', () => this._addStepToPath(btn.dataset.pathid));
    });

    // Remove step from path
    document.querySelectorAll('.trilha-remove-step').forEach(btn => {
      btn.addEventListener('click', () => this._removeStepFromPath(btn.dataset.pathid, btn.dataset.stepid));
    });

    // Add resource to step
    document.querySelectorAll('.trilha-add-resource-btn').forEach(btn => {
      btn.addEventListener('click', () => this._addResourceToStep(btn.dataset.pathid, btn.dataset.stepid));
    });

    // ── Drag and drop for goal reordering ──
    this._initDragAndDrop();
  },

  // ══════════════════════════════════════════════════════════════════════
  //  LEARNING PATHS TAB (Trilhas)
  // ══════════════════════════════════════════════════════════════════════
  _renderLearningPaths(team) {
    const paths = this._loadLearningPaths();

    return `
      <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;">
        <h3 style="margin:0;font-size:0.95rem;color:var(--text-primary);">Trilhas de Aprendizagem</h3>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('trilhaNewPathForm').style.display=document.getElementById('trilhaNewPathForm').style.display==='none'?'block':'none';">+ Nova Trilha</button>
      </div>

      <div id="trilhaNewPathForm" class="card" style="display:none;margin-bottom:16px;padding:16px;">
        <h4 style="margin:0 0 12px;font-size:0.85rem;">Criar Nova Trilha</h4>
        <div class="grid-2" style="gap:12px;margin-bottom:12px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Nome da Trilha</label>
            <input class="form-input" id="trilhaNewPathName" placeholder="Ex: Trilha UX Designer Jr">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">BU</label>
            <select class="form-input" id="trilhaNewPathBU">
              ${Object.keys(this._buCompetencies).map(bu => `<option value="${bu}">${bu}</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="trilhaCreatePathBtn">Criar Trilha</button>
      </div>

      ${paths.length === 0 ? '<div class="card" style="padding:24px;text-align:center;color:var(--text-muted);font-size:0.82rem;">Nenhuma trilha cadastrada. Clique em "+ Nova Trilha" para comecar.</div>' : ''}

      ${paths.map(path => this._renderPathCard(path, team)).join('')}
    `;
  },

  _renderPathCard(path, team) {
    const totalSteps = path.steps.length;
    const completedSteps = path.steps.filter(s => s.isCompleted).length;
    const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const assignedNames = (path.assignedMembers || []).map(id => this._getPersonName(id));

    return `
      <div class="card trilha-path-card" style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div>
            <h4 style="margin:0;font-size:0.92rem;">${this._esc(path.name)}</h4>
            <span style="font-size:0.72rem;color:var(--text-muted);">BU: ${this._esc(path.bu)} \u2022 ${totalSteps} etapas \u2022 ${completedSteps} concluida(s)</span>
          </div>
          <span style="font-size:0.82rem;font-weight:700;color:${progressPct >= 80 ? 'var(--color-success)' : progressPct >= 40 ? 'var(--color-info)' : 'var(--text-muted)'};">${progressPct}%</span>
        </div>

        <!-- Progress bar -->
        <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;margin-bottom:16px;">
          <div style="height:100%;width:${progressPct}%;background:var(--color-success);border-radius:3px;transition:width 0.4s;"></div>
        </div>

        <!-- Steps timeline -->
        <div style="margin-bottom:16px;">
          <div style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:10px;">Etapas da Trilha</div>
          ${path.steps.map((step, idx) => {
            const isActive = !step.isCompleted && (idx === 0 || path.steps[idx - 1]?.isCompleted);
            const stateClass = step.isCompleted ? 'trilha-step--done' : isActive ? 'trilha-step--active' : 'trilha-step--pending';
            return `
              <div class="trilha-step ${stateClass}" style="position:relative;padding-left:36px;padding-bottom:${idx < path.steps.length - 1 ? '20' : '0'}px;margin-bottom:0;">
                ${idx < path.steps.length - 1 ? `<div style="position:absolute;left:13px;top:28px;bottom:0;width:2px;background:${step.isCompleted ? 'var(--color-success)' : 'var(--border-subtle)'};"></div>` : ''}
                <div style="position:absolute;left:4px;top:2px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;
                  background:${step.isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-info)' : 'var(--bg-tertiary)'};
                  color:${step.isCompleted || isActive ? '#fff' : 'var(--text-muted)'};
                  border:2px solid ${step.isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-info)' : 'var(--border-default)'};">
                  ${step.isCompleted ? '\u2713' : (idx + 1)}
                </div>
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
                  <div style="flex:1;">
                    <div style="font-size:0.82rem;font-weight:${isActive ? '600' : '400'};color:${step.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)'};${step.isCompleted ? 'text-decoration:line-through;' : ''}">${this._esc(step.title)}</div>
                    ${step.description ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${this._esc(step.description)}</div>` : ''}

                    ${(step.resources && step.resources.length > 0) ? `
                      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                        ${step.resources.map(r => `
                          <a href="${this._esc(r.url)}" target="_blank" rel="noopener" class="trilha-resource-card" style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:0.68rem;text-decoration:none;background:var(--bg-tertiary);color:var(--text-secondary);border:1px solid var(--border-subtle);">
                            <span>${this._resourceIcons[r.type] || '\u{1F4C4}'}</span>
                            <span>${this._esc(r.title)}</span>
                            ${r.duration ? `<span style="color:var(--text-muted);margin-left:2px;">${r.duration}</span>` : ''}
                          </a>
                        `).join('')}
                      </div>
                    ` : ''}

                    <!-- Add resource inline form -->
                    <div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;">
                      <input class="form-input trilha-res-title" data-pathid="${path.id}" data-stepid="${step.id}" placeholder="Titulo recurso" style="width:120px;font-size:0.68rem;padding:2px 6px;">
                      <input class="form-input trilha-res-url" data-pathid="${path.id}" data-stepid="${step.id}" placeholder="URL" style="width:140px;font-size:0.68rem;padding:2px 6px;">
                      <select class="form-input trilha-res-type" data-pathid="${path.id}" data-stepid="${step.id}" style="width:80px;font-size:0.68rem;padding:2px 4px;">
                        <option value="course">Curso</option>
                        <option value="video">Video</option>
                        <option value="article">Artigo</option>
                        <option value="book">Livro</option>
                      </select>
                      <input class="form-input trilha-res-duration" data-pathid="${path.id}" data-stepid="${step.id}" placeholder="Duracao" style="width:60px;font-size:0.68rem;padding:2px 6px;">
                      <button class="btn btn-sm btn-ghost trilha-add-resource-btn" data-pathid="${path.id}" data-stepid="${step.id}" style="font-size:0.65rem;padding:2px 6px;color:var(--color-info);">+ Recurso</button>
                    </div>
                  </div>
                  <div style="display:flex;gap:4px;align-items:center;flex-shrink:0;">
                    <button class="btn btn-sm btn-ghost trilha-step-toggle" data-pathid="${path.id}" data-stepid="${step.id}" style="font-size:0.68rem;padding:2px 8px;color:${step.isCompleted ? 'var(--color-warning)' : 'var(--color-success)'};">
                      ${step.isCompleted ? 'Reabrir' : 'Concluir'}
                    </button>
                    <button class="btn btn-sm btn-ghost trilha-remove-step" data-pathid="${path.id}" data-stepid="${step.id}" style="font-size:0.68rem;padding:2px 6px;color:var(--color-danger);">x</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}

          <!-- Add step form -->
          <div style="padding-left:36px;margin-top:12px;display:flex;gap:6px;align-items:center;">
            <input class="form-input trilha-new-step-title" data-pathid="${path.id}" placeholder="Nova etapa..." style="flex:1;font-size:0.75rem;">
            <input class="form-input trilha-new-step-desc" data-pathid="${path.id}" placeholder="Descricao (opcional)" style="flex:1;font-size:0.75rem;">
            <button class="btn btn-sm btn-primary trilha-add-step-btn" data-pathid="${path.id}" style="font-size:0.72rem;">+ Etapa</button>
          </div>
        </div>

        <!-- Assigned members -->
        <div style="border-top:1px solid var(--border-subtle);padding-top:12px;">
          <div style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">Membros Atribuidos</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
            ${assignedNames.length > 0 ? (path.assignedMembers || []).map(mid => `
              <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:0.72rem;background:var(--color-info-dim);color:var(--color-info);">
                ${this._esc(this._getPersonName(mid))}
                <button class="btn btn-sm btn-ghost trilha-remove-member-path" data-pathid="${path.id}" data-memberid="${mid}" style="padding:0 2px;font-size:0.65rem;color:var(--color-danger);line-height:1;">x</button>
              </span>
            `).join('') : '<span style="font-size:0.72rem;color:var(--text-muted);">Nenhum membro atribuido.</span>'}
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <select class="form-input trilha-assign-member-select" data-pathid="${path.id}" style="font-size:0.72rem;padding:3px 6px;max-width:200px;">
              <option value="">Selecionar membro...</option>
              ${team.filter(m => !(path.assignedMembers || []).includes(m.id)).map(m => `<option value="${m.id}">${m.name} (${m.bu || '-'})</option>`).join('')}
            </select>
            <button class="btn btn-sm btn-ghost trilha-assign-member-btn" data-pathid="${path.id}" style="font-size:0.72rem;color:var(--color-info);">Atribuir</button>
          </div>
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  ENHANCED PDI MEMBER CARD (with priority, notes, time elapsed, DnD)
  // ══════════════════════════════════════════════════════════════════════
  _renderMemberCard(member, pdi) {
    const goals = pdi?.goals || [];
    const buComps = this._buCompetencies[member.bu] || [];
    const levels = pdi?.competencyLevels || {};
    const completedCount = goals.filter(g => g.status === 'concluido').length;
    const progressPct = goals.length ? Math.round((completedCount / goals.length) * 100) : 0;

    // XP calculation
    const xpData = this._calculateXP(member.id, pdi);

    // Get gaps from evaluation
    const gaps = this._getPersonGaps(member.id);

    return `
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div>
            <strong style="font-size:0.9rem;">${this._esc(member.name)}</strong>
            <span style="font-size:0.72rem;color:var(--text-muted);margin-left:8px;">${member.bu || 'Sem BU'} \u2022 ${member.cargo}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <!-- XP Level Badge -->
            <span title="${xpData.xp} XP - ${xpData.level.name}" style="font-size:0.72rem;padding:2px 8px;border-radius:999px;background:${xpData.level.color}22;color:${xpData.level.color};font-weight:600;">
              ${xpData.level.icon} ${xpData.level.name} (${xpData.xp} XP)
            </span>
            ${this._renderBadges(completedCount)}
            <span style="font-size:0.72rem;padding:2px 8px;border-radius:999px;background:${goals.length > 0 ? 'var(--color-success-dim)' : 'var(--color-warning-dim)'};color:${goals.length > 0 ? 'var(--color-success)' : 'var(--color-warning)'};">
              ${goals.length > 0 ? `${completedCount}/${goals.length} metas` : 'Sem PDI'}
            </span>
          </div>
        </div>

        ${goals.length > 0 ? `
          <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;margin-bottom:12px;">
            <div style="height:100%;width:${progressPct}%;background:var(--color-success);border-radius:2px;transition:width 0.3s;"></div>
          </div>
        ` : ''}

        ${gaps.length > 0 ? `
          <div style="margin-bottom:10px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-size:0.72rem;color:var(--color-warning);font-weight:600;">Gaps (avaliacao):</span>
            ${gaps.map(g => `<span class="tag" style="font-size:0.65rem;background:var(--color-warning-dim);color:var(--color-warning);">${g}</span>`).join('')}
            <button class="btn btn-sm btn-ghost trilha-import-gaps" data-member="${member.id}" style="font-size:0.68rem;color:var(--color-info);">Importar como metas</button>
          </div>
        ` : ''}

        <div style="margin-bottom:12px;">
          <div style="font-size:0.78rem;font-weight:600;margin-bottom:6px;color:var(--text-secondary);">Metas de Desenvolvimento</div>
          <div class="trilha-goals-container" data-member="${member.id}">
            ${goals.length > 0 ? goals.map((g, idx) => {
              const isOverdue = g.prazo && g.status !== 'concluido' && new Date(g.prazo) < new Date();
              const statusColors = { pendente: 'var(--text-muted)', em_andamento: 'var(--color-info)', concluido: 'var(--color-success)' };
              const priorityBadge = g.priority ? `<span class="trilha-priority-${g.priority}" style="font-size:0.6rem;padding:1px 6px;border-radius:999px;font-weight:600;">${g.priority === 'alta' ? 'Alta' : g.priority === 'media' ? 'Media' : 'Baixa'}</span>` : '';
              const elapsed = g.createdAt ? this._timeElapsed(g.createdAt) : '';
              return `
                <div class="trilha-goal-item" draggable="true" data-member="${member.id}" data-goalid="${g.id}" data-index="${idx}" style="padding:8px 0;border-bottom:1px solid var(--border-subtle);${g.status === 'concluido' ? 'opacity:0.6;' : ''}cursor:grab;">
                  <div style="display:flex;align-items:center;gap:8px;font-size:0.8rem;">
                    <span style="cursor:grab;color:var(--text-muted);font-size:0.72rem;" title="Arrastar para reordenar">\u2261</span>
                    <select class="form-input trilha-goal-status" data-member="${member.id}" data-goalid="${g.id}" style="width:110px;font-size:0.7rem;padding:2px 4px;color:${statusColors[g.status] || 'var(--text-muted)'};">
                      <option value="pendente" ${g.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                      <option value="em_andamento" ${g.status === 'em_andamento' ? 'selected' : ''}>Em andamento</option>
                      <option value="concluido" ${g.status === 'concluido' ? 'selected' : ''}>Concluido</option>
                    </select>
                    <select class="form-input trilha-goal-priority" data-member="${member.id}" data-goalid="${g.id}" style="width:80px;font-size:0.68rem;padding:2px 4px;">
                      <option value="" ${!g.priority ? 'selected' : ''}>-</option>
                      <option value="alta" ${g.priority === 'alta' ? 'selected' : ''}>Alta</option>
                      <option value="media" ${g.priority === 'media' ? 'selected' : ''}>Media</option>
                      <option value="baixa" ${g.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
                    </select>
                    ${priorityBadge}
                    <span style="flex:1;${g.status === 'concluido' ? 'text-decoration:line-through;' : ''}">${this._esc(g.text)}</span>
                    ${g.linkedGap ? `<span class="tag" style="font-size:0.6rem;background:var(--color-warning-dim);color:var(--color-warning);">Gap</span>` : ''}
                    ${g.prazo ? `<span style="font-size:0.68rem;color:${isOverdue ? 'var(--color-danger)' : 'var(--text-muted)'};">${new Date(g.prazo + 'T12:00').toLocaleDateString('pt-BR')}</span>` : ''}
                    ${elapsed ? `<span style="font-size:0.62rem;color:var(--text-muted);" title="Criada ha ${elapsed}">\u{1F551}${elapsed}</span>` : ''}
                    <button class="btn btn-sm btn-ghost trilha-remove-goal" data-member="${member.id}" data-goalid="${g.id}" style="color:var(--color-danger);padding:2px 6px;">x</button>
                  </div>
                  <!-- Progress notes -->
                  <div style="padding-left:28px;margin-top:4px;">
                    <textarea class="form-input trilha-goal-notes" data-member="${member.id}" data-goalid="${g.id}" rows="1" placeholder="Notas de progresso..." style="width:100%;font-size:0.7rem;padding:3px 6px;resize:vertical;min-height:24px;border:1px dashed var(--border-subtle);background:transparent;">${this._esc(g.notes || '')}</textarea>
                  </div>
                </div>`;
            }).join('') : '<div style="font-size:0.78rem;color:var(--text-muted);padding:8px 0;">Nenhuma meta definida.</div>'}
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <input type="text" class="form-input trilha-goal-input" data-member="${member.id}" placeholder="Nova meta..." style="flex:1;font-size:0.78rem;">
            <input type="date" class="form-input trilha-goal-date" data-member="${member.id}" style="width:130px;font-size:0.72rem;">
            <select class="form-input trilha-goal-priority-new" data-member="${member.id}" style="width:80px;font-size:0.72rem;">
              <option value="">Prioridade</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baixa">Baixa</option>
            </select>
            <button class="btn btn-sm btn-primary trilha-add-goal-btn" data-member="${member.id}">Adicionar</button>
          </div>
        </div>

        ${buComps.length > 0 ? `
          <div>
            <div style="font-size:0.78rem;font-weight:600;margin-bottom:6px;color:var(--text-secondary);">Competencias (${member.bu})</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;">
              ${buComps.map(comp => {
                const level = levels[comp] || 'Iniciante';
                return `
                  <div style="display:flex;align-items:center;gap:8px;font-size:0.78rem;">
                    <span style="flex:1;">${this._esc(comp)}</span>
                    <select class="form-input trilha-level-select" data-member="${member.id}" data-comp="${comp}" style="width:120px;font-size:0.72rem;padding:3px 6px;">
                      ${this._levels.map(l => `<option value="${l}" ${l === level ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                  </div>`;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  // ── Competencias tab ──────────────────────────────────────────────
  _renderCompetencias(team, pdiData) {
    return Object.entries(this._buCompetencies).map(([bu, comps]) => {
      const buMembers = team.filter(m => m.bu === bu);
      return `
        <div class="card" style="margin-bottom:16px;">
          <h3 style="margin:0 0 12px;font-size:0.92rem;">${bu}</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${comps.map(c => `<span class="badge">${this._esc(c)}</span>`).join('')}
          </div>
          <div style="margin-top:12px;font-size:0.78rem;color:var(--text-muted);">
            ${buMembers.length} membro(s) nesta BU
          </div>
          ${buMembers.length > 0 ? `
            <div style="margin-top:8px;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:0.75rem;">
                <thead><tr style="border-bottom:1px solid var(--border-default);">
                  <th style="text-align:left;padding:4px;">Membro</th>
                  ${comps.map(c => `<th style="text-align:center;padding:4px;max-width:80px;">${c.split(' ')[0]}</th>`).join('')}
                </tr></thead>
                <tbody>${buMembers.map(m => {
                  const levels = pdiData[m.id]?.competencyLevels || {};
                  return `<tr style="border-bottom:1px solid var(--border-subtle);">
                    <td style="padding:4px;font-weight:500;">${m.name}</td>
                    ${comps.map(c => {
                      const lvl = levels[c] || 'Iniciante';
                      const lvlIdx = this._levels.indexOf(lvl);
                      const colors = ['var(--color-danger)', 'var(--color-warning)', 'var(--text-muted)', 'var(--color-info)', 'var(--color-success)'];
                      return `<td style="text-align:center;padding:4px;color:${colors[lvlIdx] || 'var(--text-muted)'};">${lvl.substring(0, 4)}</td>`;
                    }).join('')}
                  </tr>`;
                }).join('')}</tbody>
              </table>
            </div>
          ` : ''}
        </div>`;
    }).join('');
  },

  // ══════════════════════════════════════════════════════════════════════
  //  ENHANCED GAMIFICATION TAB (XP, levels, history, team progress)
  // ══════════════════════════════════════════════════════════════════════
  _renderGamification(team, pdiData) {
    const leaderboard = team.map(m => {
      const goals = pdiData[m.id]?.goals || [];
      const completed = goals.filter(g => g.status === 'concluido').length;
      const streak = pdiData[m.id]?.streak || 0;
      const xpData = this._calculateXP(m.id, pdiData[m.id]);
      return { ...m, completed, streak, total: goals.length, xp: xpData.xp, level: xpData.level, xpHistory: xpData.history };
    }).sort((a, b) => b.xp - a.xp);

    // Team-wide stats
    const teamTotalGoals = leaderboard.reduce((s, m) => s + m.total, 0);
    const teamCompleted = leaderboard.reduce((s, m) => s + m.completed, 0);
    const teamAvgPct = teamTotalGoals > 0 ? Math.round((teamCompleted / teamTotalGoals) * 100) : 0;
    const teamTotalXP = leaderboard.reduce((s, m) => s + m.xp, 0);
    const teamAvgXP = leaderboard.length > 0 ? Math.round(teamTotalXP / leaderboard.length) : 0;

    return `
      <!-- Team Progress Summary -->
      <div class="card" style="margin-bottom:16px;padding:16px;">
        <h4 style="font-size:0.85rem;margin-bottom:12px;">Progresso Geral da Equipe</h4>
        <div class="grid-4" style="gap:12px;margin-bottom:12px;">
          <div style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:700;color:var(--color-success);">${teamCompleted}</div>
            <div style="font-size:0.68rem;color:var(--text-muted);">Metas Concluidas</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:700;color:var(--color-info);">${teamTotalXP}</div>
            <div style="font-size:0.68rem;color:var(--text-muted);">XP Total Equipe</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:700;color:var(--text-primary);">${teamAvgXP}</div>
            <div style="font-size:0.68rem;color:var(--text-muted);">XP Medio/Pessoa</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:700;color:var(--color-warning);">${teamAvgPct}%</div>
            <div style="font-size:0.68rem;color:var(--text-muted);">Conclusao Media</div>
          </div>
        </div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">Progresso medio da equipe</div>
        <div class="trilha-xp-bar" style="height:10px;background:var(--bg-tertiary);border-radius:5px;overflow:hidden;">
          <div style="height:100%;width:${teamAvgPct}%;background:linear-gradient(90deg, var(--color-info), var(--color-success));border-radius:5px;transition:width 0.4s;"></div>
        </div>
      </div>

      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:12px;">Leaderboard XP</h4>
          ${leaderboard.map((m, i) => {
            const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
            const xpForNextLevel = m.level.max === Infinity ? null : m.level.max;
            const xpPctInLevel = xpForNextLevel ? Math.min(100, Math.round(((m.xp - m.level.min) / (m.level.max - m.level.min)) * 100)) : 100;
            return `<div style="padding:8px 0;border-bottom:1px solid var(--border-subtle);">
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="width:24px;text-align:center;font-size:${i < 3 ? '1.1rem' : '0.78rem'};">${medals[i] || (i + 1) + '.'}</span>
                <span style="flex:1;font-size:0.82rem;font-weight:${i === 0 ? '700' : '400'};">${m.name}</span>
                <span style="font-size:0.72rem;padding:2px 8px;border-radius:999px;background:${m.level.color}22;color:${m.level.color};font-weight:600;">${m.level.icon} ${m.level.name}</span>
                <span style="font-size:0.78rem;font-weight:700;color:var(--color-info);min-width:60px;text-align:right;">${m.xp} XP</span>
                ${this._renderBadges(m.completed)}
                ${m.streak >= 3 ? `<span style="font-size:0.75rem;">\u{1F525}${m.streak}sem</span>` : ''}
              </div>
              <div style="margin-left:34px;margin-top:4px;">
                <div class="trilha-xp-bar" style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                  <div style="height:100%;width:${xpPctInLevel}%;background:${m.level.color};border-radius:2px;transition:width 0.3s;"></div>
                </div>
                <div style="font-size:0.62rem;color:var(--text-muted);margin-top:2px;">${m.xp}/${xpForNextLevel || '\u221E'} XP para proximo nivel</div>
              </div>
            </div>`;
          }).join('')}
        </div>

        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:12px;">Sistema de XP</h4>
          <div style="margin-bottom:16px;">
            <div style="font-size:0.78rem;font-weight:600;margin-bottom:8px;">Como ganhar XP:</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;align-items:center;gap:8px;font-size:0.78rem;padding:6px 10px;background:var(--bg-tertiary);border-radius:6px;">
                <span style="font-size:1rem;">\u2705</span>
                <span style="flex:1;">Meta concluida</span>
                <span style="font-weight:700;color:var(--color-success);">+${this._xpRules.goalCompleted} XP</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;font-size:0.78rem;padding:6px 10px;background:var(--bg-tertiary);border-radius:6px;">
                <span style="font-size:1rem;">\u2B06\uFE0F</span>
                <span style="flex:1;">Subir nivel de competencia</span>
                <span style="font-weight:700;color:var(--color-info);">+${this._xpRules.levelUp} XP</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;font-size:0.78rem;padding:6px 10px;background:var(--bg-tertiary);border-radius:6px;">
                <span style="font-size:1rem;">\u{1F91D}</span>
                <span style="flex:1;">Sessao de mentoria</span>
                <span style="font-weight:700;color:var(--color-purple, #8b5cf6);">+${this._xpRules.mentorSession} XP</span>
              </div>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <div style="font-size:0.78rem;font-weight:600;margin-bottom:8px;">Niveis:</div>
            ${this._xpLevels.map(l => `
              <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:0.78rem;">
                <span style="font-size:1.1rem;">${l.icon}</span>
                <span style="font-weight:600;color:${l.color};min-width:70px;">${l.name}</span>
                <span style="font-size:0.72rem;color:var(--text-muted);">${l.min} - ${l.max === Infinity ? '\u221E' : l.max} XP</span>
              </div>
            `).join('')}
          </div>

          <h4 style="font-size:0.85rem;margin-bottom:8px;">Badges Disponiveis</h4>
          ${this._badges.filter(b => b.threshold > 0).map(b => `
            <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border-subtle);">
              <span style="font-size:1.2rem;">${b.icon}</span>
              <div style="flex:1;">
                <div style="font-size:0.78rem;font-weight:600;">${b.nome}</div>
                <div style="font-size:0.68rem;color:var(--text-muted);">${b.desc}</div>
              </div>
              <span style="font-size:0.68rem;color:var(--text-muted);">${b.threshold} metas</span>
            </div>
          `).join('')}
          <div style="padding:6px 0;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.2rem;">\u{1F680}</span>
            <div style="flex:1;"><div style="font-size:0.78rem;font-weight:600;">Aplicador</div><div style="font-size:0.68rem;color:var(--text-muted);">Aplicou learning em projeto real</div></div>
          </div>
          <div style="padding:6px 0;display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.2rem;">\u{1F525}</span>
            <div style="flex:1;"><div style="font-size:0.78rem;font-weight:600;">Streak 3 sem</div><div style="font-size:0.68rem;color:var(--text-muted);">3 semanas consecutivas com progresso</div></div>
          </div>
        </div>
      </div>

      <!-- XP History Log -->
      <div class="card" style="padding:16px;">
        <h4 style="font-size:0.85rem;margin-bottom:12px;">Historico de XP Recente</h4>
        ${this._renderXPHistory(team, pdiData)}
      </div>
    `;
  },

  _renderXPHistory(team, pdiData) {
    // Collect all XP events from all members
    const allEvents = [];
    team.forEach(m => {
      const xpLog = this._loadXPLog(m.id);
      xpLog.forEach(evt => {
        allEvents.push({ ...evt, memberId: m.id, memberName: m.name });
      });
    });

    allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentEvents = allEvents.slice(0, 20);

    if (recentEvents.length === 0) {
      return '<div style="font-size:0.78rem;color:var(--text-muted);padding:8px 0;">Nenhum evento de XP registrado ainda. Complete metas para ganhar XP!</div>';
    }

    return `<div style="max-height:300px;overflow-y:auto;">
      ${recentEvents.map(evt => `
        <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:0.75rem;">
          <span style="font-size:0.68rem;color:var(--text-muted);min-width:80px;">${new Date(evt.date).toLocaleDateString('pt-BR')}</span>
          <span style="font-weight:500;min-width:80px;">${this._esc(evt.memberName)}</span>
          <span style="flex:1;color:var(--text-secondary);">${this._esc(evt.reason)}</span>
          <span style="font-weight:700;color:var(--color-success);">+${evt.xp} XP</span>
        </div>
      `).join('')}
    </div>`;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  ENHANCED ROI & IMPACT TAB (trends, avg days, BU comparison)
  // ══════════════════════════════════════════════════════════════════════
  _renderROI(team, pdiData) {
    const stats = team.map(m => {
      const goals = pdiData[m.id]?.goals || [];
      const completed = goals.filter(g => g.status === 'concluido').length;
      const levels = pdiData[m.id]?.competencyLevels || {};
      const avgLevel = Object.values(levels).length ? +(Object.values(levels).map(l => this._levels.indexOf(l)).reduce((a, b) => a + b, 0) / Object.values(levels).length).toFixed(1) : 0;
      const investmentHours = pdiData[m.id]?.investmentHours || 0;
      return { ...m, completed, avgLevel, investmentHours, totalGoals: goals.length, goals };
    });

    const totalCompleted = stats.reduce((s, m) => s + m.completed, 0);
    const totalGoals = stats.reduce((s, m) => s + m.totalGoals, 0);
    const completionRate = totalGoals ? Math.round((totalCompleted / totalGoals) * 100) : 0;
    const avgLevelAll = stats.length ? +(stats.reduce((s, m) => s + m.avgLevel, 0) / stats.length).toFixed(1) : 0;

    // Average days to complete a goal
    const allCompletedGoals = stats.flatMap(m => m.goals.filter(g => g.status === 'concluido' && g.createdAt && g.completedAt));
    let avgDays = 0;
    if (allCompletedGoals.length > 0) {
      const totalDays = allCompletedGoals.reduce((sum, g) => {
        const diff = (new Date(g.completedAt) - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
        return sum + Math.max(0, diff);
      }, 0);
      avgDays = Math.round(totalDays / allCompletedGoals.length);
    }

    // Month-over-month trend
    const monthlyData = this._getMonthlyCompletionTrend(stats);

    // BU comparison
    const buComparison = this._getBUComparison(stats);

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Taxa de Conclusao</div><div class="kpi-value">${completionRate}%</div></div>
        <div class="kpi-card"><div class="kpi-label">Nivel Medio Equipe</div><div class="kpi-value">${avgLevelAll}/4</div></div>
        <div class="kpi-card"><div class="kpi-label">Metas Concluidas</div><div class="kpi-value">${totalCompleted}</div></div>
        <div class="kpi-card"><div class="kpi-label">Dias Medio p/ Concluir</div><div class="kpi-value">${avgDays > 0 ? avgDays + 'd' : '-'}</div></div>
      </div>

      <!-- Month-over-month trend -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Metas Concluidas por Mes</h3></div>
        <div style="padding:16px;">
          ${monthlyData.length > 0 ? `
            <div style="display:flex;align-items:flex-end;gap:8px;height:150px;padding-bottom:24px;position:relative;">
              ${monthlyData.map(md => {
                const maxVal = Math.max(...monthlyData.map(d => d.count), 1);
                const barH = Math.max(4, Math.round((md.count / maxVal) * 120));
                return `
                  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
                    <div style="font-size:0.68rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;">${md.count}</div>
                    <div style="width:100%;max-width:48px;height:${barH}px;background:var(--color-info);border-radius:4px 4px 0 0;transition:height 0.3s;"></div>
                    <div style="font-size:0.62rem;color:var(--text-muted);margin-top:6px;white-space:nowrap;">${md.label}</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : '<div style="font-size:0.78rem;color:var(--text-muted);padding:8px 0;">Sem dados de tendencia disponiveis.</div>'}
        </div>
      </div>

      <!-- BU Comparison -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Comparativo por BU</h3></div>
        <div style="padding:16px;">
          ${buComparison.length > 0 ? buComparison.map(bu => {
            const pct = bu.total > 0 ? Math.round((bu.completed / bu.total) * 100) : 0;
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border-subtle);">
                <div style="width:100px;font-weight:600;font-size:0.82rem;">${this._esc(bu.bu)}</div>
                <div style="width:50px;font-size:0.72rem;color:var(--text-muted);">${bu.members} membros</div>
                <div style="flex:1;height:10px;background:var(--bg-tertiary);border-radius:5px;overflow:hidden;">
                  <div style="height:100%;width:${pct}%;background:${pct >= 75 ? 'var(--color-success)' : pct >= 40 ? 'var(--color-info)' : 'var(--color-warning)'};border-radius:5px;"></div>
                </div>
                <span style="width:40px;text-align:right;font-size:0.82rem;font-weight:700;">${pct}%</span>
                <span style="width:60px;text-align:right;font-size:0.72rem;color:var(--text-muted);">${bu.completed}/${bu.total}</span>
              </div>
            `;
          }).join('') : '<div style="font-size:0.78rem;color:var(--text-muted);">Sem dados de BU.</div>'}
        </div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Impacto por Membro</h3></div>
        <div style="padding:16px;">
          ${stats.map(m => {
            const pct = m.totalGoals ? Math.round((m.completed / m.totalGoals) * 100) : 0;
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border-subtle);">
                <div style="width:120px;font-weight:500;font-size:0.82rem;">${m.name}</div>
                <div style="width:60px;font-size:0.72rem;color:var(--text-muted);">${m.bu || '-'}</div>
                <div style="flex:1;height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                  <div style="height:100%;width:${pct}%;background:${pct >= 80 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-info)' : 'var(--color-warning)'};border-radius:4px;"></div>
                </div>
                <span style="width:40px;text-align:right;font-size:0.78rem;font-weight:600;">${pct}%</span>
                <span style="width:50px;text-align:right;font-size:0.72rem;color:var(--text-muted);">${m.completed}/${m.totalGoals}</span>
                <span style="width:60px;text-align:right;font-size:0.72rem;color:var(--color-info);">Nv ${m.avgLevel.toFixed(0)}</span>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Fluxo: Conclusao \u2192 Habilidade \u2192 Impacto</h3></div>
        <div style="padding:16px;font-size:0.82rem;color:var(--text-secondary);line-height:1.8;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <span style="width:40px;height:40px;border-radius:50%;background:var(--color-info-dim);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">1</span>
            <span><strong>Meta concluida</strong> \u2192 ${totalCompleted} metas fechadas no ciclo</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <span style="width:40px;height:40px;border-radius:50%;background:var(--color-success-dim);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">2</span>
            <span><strong>Habilidade sobe</strong> \u2192 Nivel medio da equipe: ${avgLevelAll}/4</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="width:40px;height:40px;border-radius:50%;background:var(--accent-gold);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">3</span>
            <span><strong>Impacto em projeto</strong> \u2192 Contribuicao qualificada (tracked via feedbacks e entregas)</span>
          </div>
        </div>
      </div>
    `;
  },

  // ── Mentoring tab ──────────────────────────────────────────────────
  _renderMentoria(team, pdiData) {
    const mentoring = this._loadMentoring();
    const pairs = mentoring.pairs || [];

    // Auto-suggest pairs based on complementary skills
    const suggestions = this._suggestMentorPairs(team, pdiData);

    return `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3 class="card-title">Programa de Mentoria</h3>
          <button class="btn btn-primary btn-sm" id="mentoriaNew" onclick="document.getElementById('mentoriaForm').style.display=document.getElementById('mentoriaForm').style.display==='none'?'block':'none';">+ Novo Par</button>
        </div>
        <div id="mentoriaForm" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Mentor</label>
              <select class="form-input" id="mentorMentor">${team.map(t => `<option value="${t.id}">${t.name} (${t.bu || '-'})</option>`).join('')}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Mentorado</label>
              <select class="form-input" id="mentorMentorado">${team.map(t => `<option value="${t.id}">${t.name} (${t.bu || '-'})</option>`).join('')}</select>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label">Foco da mentoria</label>
            <input class="form-input" id="mentorFoco" placeholder="Ex: Lideranca, Ferramentas 3D, Comunicacao...">
          </div>
          <button class="btn btn-primary btn-sm" id="mentoriaSave">Criar Par</button>
        </div>
        ${pairs.length > 0 ? pairs.map(p => `
          <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--color-purple);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;">${this._getInitials(p.mentor)}</div>
            <span style="font-size:0.72rem;color:var(--text-muted);">\u2192</span>
            <div style="width:32px;height:32px;border-radius:50%;background:var(--color-info);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;">${this._getInitials(p.mentorado)}</div>
            <div style="flex:1;">
              <div style="font-size:0.82rem;font-weight:500;">${this._getPersonName(p.mentor)} \u2192 ${this._getPersonName(p.mentorado)}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">Foco: ${p.foco || '-'} \u2022 ${p.sessions || 0} sessoes</div>
            </div>
            <span class="tag" style="font-size:0.65rem;background:var(--color-success-dim);color:var(--color-success);">Ativo</span>
          </div>
        `).join('') : '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma mentoria ativa.</div>'}
      </div>

      ${suggestions.length > 0 ? `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Sugestoes de Pares (por complementaridade)</h3></div>
          ${suggestions.map(s => `
            <div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
              <span style="font-size:0.82rem;font-weight:500;">${this._getPersonName(s.mentor)}</span>
              <span style="font-size:0.72rem;color:var(--text-muted);">pode mentorar</span>
              <span style="font-size:0.82rem;font-weight:500;">${this._getPersonName(s.mentorado)}</span>
              <span style="font-size:0.72rem;color:var(--text-muted);">em ${s.skill}</span>
              <span style="font-size:0.72rem;color:var(--color-info);margin-left:auto;">${s.score}% match</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════════════════════════════════
  _renderBadges(completedCount) {
    const earned = this._badges.filter(b => b.threshold > 0 && completedCount >= b.threshold);
    if (!earned.length) return '';
    return earned.map(b => `<span title="${b.nome}: ${b.desc}" style="font-size:0.9rem;">${b.icon}</span>`).join('');
  },

  _getPersonGaps(memberId) {
    if (typeof TBO_RH === 'undefined') return [];
    const reviews = TBO_RH._getStore('avaliacoes_people');
    const ciclos = TBO_RH._getStore('ciclos');
    const activeCycle = ciclos.find(c => c.status === 'em_andamento') || ciclos[0];
    if (!activeCycle) return [];
    const review = reviews.find(r => r.pessoaId === memberId && r.cicloId === activeCycle.id);
    return review?.gaps || [];
  },

  _importGaps(memberId) {
    const gaps = this._getPersonGaps(memberId);
    if (!gaps.length) { if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Sem gaps', 'Nenhum gap de avaliacao encontrado.'); return; }

    const pdiData = this._loadPDI();
    if (!pdiData[memberId]) pdiData[memberId] = { goals: [], competencyLevels: {} };
    const existingTexts = pdiData[memberId].goals.map(g => g.text?.toLowerCase());

    let added = 0;
    gaps.forEach(gap => {
      if (!existingTexts.includes(gap.toLowerCase())) {
        pdiData[memberId].goals.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          text: `Desenvolver: ${gap}`,
          status: 'pendente',
          prazo: '',
          priority: '',
          notes: '',
          linkedGap: gap,
          createdAt: new Date().toISOString()
        });
        added++;
      }
    });

    this._savePDI(pdiData);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Gaps importados', `${added} meta(s) criada(s) a partir dos gaps.`);
    this._rerender();
  },

  _suggestMentorPairs(team, pdiData) {
    const suggestions = [];
    const seniors = team.filter(m => m.nivel && (m.nivel.includes('Senior') || m.nivel.includes('Pleno III') || m.nivel.includes('Pleno II')));
    const juniors = team.filter(m => m.nivel && (m.nivel.includes('Jr') || m.nivel.includes('Pleno I')));

    seniors.forEach(s => {
      const sLevels = pdiData[s.id]?.competencyLevels || {};
      juniors.forEach(j => {
        if (s.id === j.id) return;
        const jLevels = pdiData[j.id]?.competencyLevels || {};
        Object.keys(sLevels).forEach(skill => {
          const sIdx = this._levels.indexOf(sLevels[skill]);
          const jIdx = this._levels.indexOf(jLevels[skill] || 'Iniciante');
          if (sIdx >= 3 && jIdx <= 1) {
            suggestions.push({ mentor: s.id, mentorado: j.id, skill, score: Math.round(((sIdx - jIdx) / 4) * 100) });
          }
        });
      });
    });

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 6);
  },

  _getInitials(id) {
    const name = this._getPersonName(id);
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  },

  _getPersonName(id) {
    if (typeof TBO_RH !== 'undefined') {
      const p = TBO_RH._team.find(t => t.id === id);
      if (p) return p.nome;
    }
    return id || '-';
  },

  _timeElapsed(isoDate) {
    if (!isoDate) return '';
    const now = new Date();
    const then = new Date(isoDate);
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'hoje';
    if (diffDays === 1) return '1 dia';
    if (diffDays < 7) return diffDays + ' dias';
    const weeks = Math.floor(diffDays / 7);
    if (weeks < 4) return weeks + ' sem';
    const months = Math.floor(diffDays / 30);
    if (months < 12) return months + ' mes' + (months > 1 ? 'es' : '');
    return Math.floor(diffDays / 365) + ' ano(s)';
  },

  // ══════════════════════════════════════════════════════════════════════
  //  XP SYSTEM
  // ══════════════════════════════════════════════════════════════════════
  _calculateXP(memberId, pdi) {
    const goals = pdi?.goals || [];
    const completedGoals = goals.filter(g => g.status === 'concluido').length;
    const xpLog = this._loadXPLog(memberId);

    // Calculate from log if available, otherwise estimate from completed goals
    let totalXP = 0;
    if (xpLog.length > 0) {
      totalXP = xpLog.reduce((sum, evt) => sum + (evt.xp || 0), 0);
    } else {
      totalXP = completedGoals * this._xpRules.goalCompleted;
    }

    // Determine level
    let level = this._xpLevels[0];
    for (const l of this._xpLevels) {
      if (totalXP >= l.min) level = l;
    }

    return { xp: totalXP, level, history: xpLog };
  },

  _loadXPLog(memberId) {
    try {
      const data = JSON.parse(localStorage.getItem('tbo_xp_log') || '{}');
      return data[memberId] || [];
    } catch { return []; }
  },

  _addXPEvent(memberId, xp, reason) {
    try {
      const data = JSON.parse(localStorage.getItem('tbo_xp_log') || '{}');
      if (!data[memberId]) data[memberId] = [];

      // Check for previous level
      const prevXP = data[memberId].reduce((sum, e) => sum + (e.xp || 0), 0);
      const prevLevel = this._getXPLevel(prevXP);

      data[memberId].push({ xp, reason, date: new Date().toISOString() });

      const newXP = prevXP + xp;
      const newLevel = this._getXPLevel(newXP);

      // Level up bonus
      if (newLevel.name !== prevLevel.name) {
        data[memberId].push({ xp: this._xpRules.levelUp, reason: `Level up: ${prevLevel.name} \u2192 ${newLevel.name}`, date: new Date().toISOString() });
      }

      localStorage.setItem('tbo_xp_log', JSON.stringify(data));
    } catch { /* silent */ }
  },

  _getXPLevel(xp) {
    let level = this._xpLevels[0];
    for (const l of this._xpLevels) {
      if (xp >= l.min) level = l;
    }
    return level;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  ROI ANALYTICS HELPERS
  // ══════════════════════════════════════════════════════════════════════
  _getMonthlyCompletionTrend(stats) {
    const monthMap = {};
    stats.forEach(m => {
      (m.goals || []).filter(g => g.status === 'concluido' && g.completedAt).forEach(g => {
        const d = new Date(g.completedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = (monthMap[key] || 0) + 1;
      });
    });

    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      months.push({ key, label: `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, count: monthMap[key] || 0 });
    }
    return months;
  },

  _getBUComparison(stats) {
    const buMap = {};
    stats.forEach(m => {
      const bu = m.bu || 'Sem BU';
      if (!buMap[bu]) buMap[bu] = { bu, members: 0, completed: 0, total: 0 };
      buMap[bu].members++;
      buMap[bu].completed += m.completed;
      buMap[bu].total += m.totalGoals;
    });
    return Object.values(buMap).sort((a, b) => {
      const pctA = a.total > 0 ? a.completed / a.total : 0;
      const pctB = b.total > 0 ? b.completed / b.total : 0;
      return pctB - pctA;
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  //  DRAG AND DROP for goal reordering
  // ══════════════════════════════════════════════════════════════════════
  _initDragAndDrop() {
    document.querySelectorAll('.trilha-goals-container').forEach(container => {
      const memberId = container.dataset.member;
      let draggedEl = null;

      container.querySelectorAll('.trilha-goal-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
          draggedEl = item;
          item.style.opacity = '0.4';
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', item.dataset.goalid);
        });

        item.addEventListener('dragend', () => {
          if (draggedEl) draggedEl.style.opacity = '1';
          draggedEl = null;
          container.querySelectorAll('.trilha-goal-item').forEach(el => el.style.borderTop = '');
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          container.querySelectorAll('.trilha-goal-item').forEach(el => el.style.borderTop = '');
          item.style.borderTop = '2px solid var(--color-info)';
        });

        item.addEventListener('dragleave', () => {
          item.style.borderTop = '';
        });

        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.style.borderTop = '';
          if (!draggedEl || draggedEl === item) return;

          const fromId = draggedEl.dataset.goalid;
          const toId = item.dataset.goalid;
          this._reorderGoals(memberId, fromId, toId);
        });
      });
    });
  },

  _reorderGoals(memberId, fromGoalId, toGoalId) {
    const pdiData = this._loadPDI();
    const goals = pdiData[memberId]?.goals || [];
    const fromIdx = goals.findIndex(g => g.id === fromGoalId);
    const toIdx = goals.findIndex(g => g.id === toGoalId);
    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = goals.splice(fromIdx, 1);
    goals.splice(toIdx, 0, moved);
    pdiData[memberId].goals = goals;
    this._savePDI(pdiData);
    this._rerender();
  },

  // ══════════════════════════════════════════════════════════════════════
  //  CRUD
  // ══════════════════════════════════════════════════════════════════════
  _addGoal(memberId) {
    const input = document.querySelector(`.trilha-goal-input[data-member="${memberId}"]`);
    const dateInput = document.querySelector(`.trilha-goal-date[data-member="${memberId}"]`);
    const priorityInput = document.querySelector(`.trilha-goal-priority-new[data-member="${memberId}"]`);
    if (!input) return;
    const goalText = input.value.trim();
    if (!goalText) return;

    const pdiData = this._loadPDI();
    if (!pdiData[memberId]) pdiData[memberId] = { goals: [], competencyLevels: {} };
    // Migrate old string goals
    pdiData[memberId].goals = (pdiData[memberId].goals || []).map(g => typeof g === 'string' ? { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: g, status: 'pendente', prazo: '', priority: '', notes: '', createdAt: new Date().toISOString() } : g);

    pdiData[memberId].goals.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: goalText,
      status: 'pendente',
      prazo: dateInput?.value || '',
      priority: priorityInput?.value || '',
      notes: '',
      linkedGap: '',
      createdAt: new Date().toISOString()
    });
    this._savePDI(pdiData);
    input.value = '';
    if (dateInput) dateInput.value = '';
    if (priorityInput) priorityInput.value = '';
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Meta adicionada', goalText);
    this._rerender();
  },

  _removeGoal(memberId, goalId) {
    const pdiData = this._loadPDI();
    if (!pdiData[memberId]?.goals) return;
    pdiData[memberId].goals = pdiData[memberId].goals.filter(g => (g.id || '') !== goalId);
    this._savePDI(pdiData);
    this._rerender();
  },

  _updateGoalStatus(memberId, goalId, status) {
    const pdiData = this._loadPDI();
    const goal = (pdiData[memberId]?.goals || []).find(g => g.id === goalId);
    if (goal) {
      const wasNotCompleted = goal.status !== 'concluido';
      goal.status = status;
      if (status === 'concluido') {
        goal.completedAt = new Date().toISOString();
        // Award XP if newly completed
        if (wasNotCompleted) {
          this._addXPEvent(memberId, this._xpRules.goalCompleted, `Meta concluida: ${goal.text}`);
        }
      }
      this._savePDI(pdiData);
      if (status === 'concluido' && typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Meta concluida! +' + this._xpRules.goalCompleted + ' XP', goal.text);
    }
  },

  _updateGoalPriority(memberId, goalId, priority) {
    const pdiData = this._loadPDI();
    const goal = (pdiData[memberId]?.goals || []).find(g => g.id === goalId);
    if (goal) {
      goal.priority = priority;
      this._savePDI(pdiData);
    }
  },

  _updateGoalNotes(memberId, goalId, notes) {
    const pdiData = this._loadPDI();
    const goal = (pdiData[memberId]?.goals || []).find(g => g.id === goalId);
    if (goal) {
      goal.notes = notes;
      this._savePDI(pdiData);
    }
  },

  _updateLevel(memberId, comp, level) {
    const pdiData = this._loadPDI();
    if (!pdiData[memberId]) pdiData[memberId] = { goals: [], competencyLevels: {} };
    const oldLevel = pdiData[memberId].competencyLevels[comp] || 'Iniciante';
    const oldIdx = this._levels.indexOf(oldLevel);
    const newIdx = this._levels.indexOf(level);
    pdiData[memberId].competencyLevels[comp] = level;
    this._savePDI(pdiData);

    // Award XP for level-up
    if (newIdx > oldIdx) {
      this._addXPEvent(memberId, this._xpRules.levelUp, `Subiu competencia ${comp}: ${oldLevel} \u2192 ${level}`);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success(`Nivel subiu! +${this._xpRules.levelUp} XP`, `${comp}: ${oldLevel} \u2192 ${level}`);
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  //  LEARNING PATHS CRUD
  // ══════════════════════════════════════════════════════════════════════
  _learningPathsKey: 'tbo_learning_paths',

  _loadLearningPaths() {
    try {
      const raw = localStorage.getItem(this._learningPathsKey);
      if (raw) {
        const data = JSON.parse(raw);
        return data.paths || [];
      }
      // Initialize with default paths on first load
      const defaults = JSON.parse(JSON.stringify(this._defaultPaths));
      this._saveLearningPaths(defaults);
      return defaults;
    } catch { return []; }
  },

  _saveLearningPaths(paths) {
    localStorage.setItem(this._learningPathsKey, JSON.stringify({ paths }));
  },

  _createNewPath() {
    const nameEl = document.getElementById('trilhaNewPathName');
    const buEl = document.getElementById('trilhaNewPathBU');
    if (!nameEl || !nameEl.value.trim()) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Informe o nome da trilha');
      return;
    }

    const paths = this._loadLearningPaths();
    paths.push({
      id: 'path-' + Date.now().toString(36),
      name: nameEl.value.trim(),
      bu: buEl?.value || '',
      steps: [],
      assignedMembers: []
    });
    this._saveLearningPaths(paths);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Trilha criada!', nameEl.value.trim());
    this._rerender();
  },

  _addStepToPath(pathId) {
    const titleEl = document.querySelector(`.trilha-new-step-title[data-pathid="${pathId}"]`);
    const descEl = document.querySelector(`.trilha-new-step-desc[data-pathid="${pathId}"]`);
    if (!titleEl || !titleEl.value.trim()) return;

    const paths = this._loadLearningPaths();
    const path = paths.find(p => p.id === pathId);
    if (!path) return;

    path.steps.push({
      id: 'step-' + Date.now().toString(36),
      title: titleEl.value.trim(),
      description: descEl?.value?.trim() || '',
      resources: [],
      isCompleted: false
    });
    this._saveLearningPaths(paths);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Etapa adicionada!');
    this._rerender();
  },

  _removeStepFromPath(pathId, stepId) {
    const paths = this._loadLearningPaths();
    const path = paths.find(p => p.id === pathId);
    if (!path) return;
    path.steps = path.steps.filter(s => s.id !== stepId);
    this._saveLearningPaths(paths);
    this._rerender();
  },

  _togglePathStep(pathId, stepId) {
    const paths = this._loadLearningPaths();
    const path = paths.find(p => p.id === pathId);
    if (!path) return;
    const step = path.steps.find(s => s.id === stepId);
    if (!step) return;
    step.isCompleted = !step.isCompleted;
    this._saveLearningPaths(paths);

    if (step.isCompleted) {
      // Award XP for completing a step to all assigned members
      (path.assignedMembers || []).forEach(mid => {
        this._addXPEvent(mid, this._xpRules.goalCompleted, `Etapa concluida: ${step.title} (${path.name})`);
      });
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Etapa concluida!', step.title);
    }
    this._rerender();
  },

  _assignMemberToPath(pathId, memberId) {
    const paths = this._loadLearningPaths();
    const path = paths.find(p => p.id === pathId);
    if (!path) return;
    if (!path.assignedMembers) path.assignedMembers = [];
    if (path.assignedMembers.includes(memberId)) return;
    path.assignedMembers.push(memberId);
    this._saveLearningPaths(paths);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Membro atribuido!', this._getPersonName(memberId));
    this._rerender();
  },

  _removeMemberFromPath(pathId, memberId) {
    const paths = this._loadLearningPaths();
    const path = paths.find(p => p.id === pathId);
    if (!path) return;
    path.assignedMembers = (path.assignedMembers || []).filter(id => id !== memberId);
    this._saveLearningPaths(paths);
    this._rerender();
  },

  _addResourceToStep(pathId, stepId) {
    const titleEl = document.querySelector(`.trilha-res-title[data-pathid="${pathId}"][data-stepid="${stepId}"]`);
    const urlEl = document.querySelector(`.trilha-res-url[data-pathid="${pathId}"][data-stepid="${stepId}"]`);
    const typeEl = document.querySelector(`.trilha-res-type[data-pathid="${pathId}"][data-stepid="${stepId}"]`);
    const durationEl = document.querySelector(`.trilha-res-duration[data-pathid="${pathId}"][data-stepid="${stepId}"]`);

    if (!titleEl || !titleEl.value.trim()) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Informe o titulo do recurso');
      return;
    }

    const paths = this._loadLearningPaths();
    const path = paths.find(p => p.id === pathId);
    if (!path) return;
    const step = path.steps.find(s => s.id === stepId);
    if (!step) return;
    if (!step.resources) step.resources = [];

    step.resources.push({
      title: titleEl.value.trim(),
      url: urlEl?.value?.trim() || '#',
      type: typeEl?.value || 'course',
      duration: durationEl?.value?.trim() || ''
    });

    this._saveLearningPaths(paths);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Recurso adicionado!');
    this._rerender();
  },

  // ── Mentoring ────────────────────────────────────────────────────
  _loadMentoring() {
    try { return JSON.parse(localStorage.getItem('tbo_mentoring') || '{}'); } catch { return {}; }
  },

  _saveMentoring() {
    const mentor = document.getElementById('mentorMentor')?.value;
    const mentorado = document.getElementById('mentorMentorado')?.value;
    const foco = document.getElementById('mentorFoco')?.value;
    if (!mentor || !mentorado || mentor === mentorado) { if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Selecione mentor e mentorado diferentes'); return; }

    const data = this._loadMentoring();
    if (!data.pairs) data.pairs = [];
    data.pairs.push({ mentor, mentorado, foco, sessions: 0, createdAt: new Date().toISOString() });
    localStorage.setItem('tbo_mentoring', JSON.stringify(data));

    // Award XP for mentoring session creation
    this._addXPEvent(mentor, this._xpRules.mentorSession, `Sessao de mentoria criada com ${this._getPersonName(mentorado)}`);
    this._addXPEvent(mentorado, this._xpRules.mentorSession, `Sessao de mentoria criada com ${this._getPersonName(mentor)}`);

    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Mentoria criada! +' + this._xpRules.mentorSession + ' XP');
    this._rerender();
  },

  // ── Data persistence ────────────────────────────────────────────────────
  _pdiKey: 'tbo_pdi_data',

  _loadPDI() {
    try {
      const raw = localStorage.getItem(this._pdiKey);
      const data = raw ? JSON.parse(raw) : {};
      // Migrate old string-based goals to object format
      Object.keys(data).forEach(memberId => {
        if (data[memberId]?.goals) {
          data[memberId].goals = data[memberId].goals.map(g =>
            typeof g === 'string' ? { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: g, status: 'pendente', prazo: '', priority: '', notes: '', createdAt: new Date().toISOString() } : g
          );
        }
      });
      return data;
    } catch { return {}; }
  },

  _savePDI(data) {
    localStorage.setItem(this._pdiKey, JSON.stringify(data));
    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog({
        entityType: 'system', entityId: 'pdi',
        action: 'pdi_updated',
        userId: TBO_AUTH?.getCurrentUser?.()?.id || 'unknown',
        reason: 'PDI atualizado'
      });
    }
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  _rerender() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  },

  _getTeam() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) {
      return TBO_RH._team.filter(m => !m.terceirizado).map(m => ({
        id: m.id,
        name: m.nome || m.id,
        bu: m.bu || '',
        cargo: m.cargo || '',
        nivel: m.nivel || '',
        lider: m.lider || ''
      }));
    }
    if (typeof TBO_PERMISSIONS !== 'undefined') {
      return Object.entries(TBO_PERMISSIONS._userRoles).map(([id, info]) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        bu: info.bu || '',
        cargo: '',
        nivel: '',
        lider: ''
      }));
    }
    return [];
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};

// ── Scoped Styles ─────────────────────────────────────────────────────────────
(function() {
  if (document.getElementById('trilha-aprendizagem-styles')) return;
  const style = document.createElement('style');
  style.id = 'trilha-aprendizagem-styles';
  style.textContent = `
    /* ── Trilha de Aprendizagem Module Styles ──────────────────────────── */

    .trilha-module {
      max-width: 1400px;
    }

    /* ── Path Cards ──────────────────────────────────────────────────── */
    .trilha-path-card {
      border-left: 4px solid var(--color-info);
      transition: box-shadow 0.2s;
    }
    .trilha-path-card:hover {
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    /* ── Steps with connecting lines ────────────────────────────────── */
    .trilha-step {
      transition: background 0.2s;
      padding-right: 8px;
      border-radius: 6px;
    }
    .trilha-step:hover {
      background: var(--bg-tertiary);
    }

    .trilha-step--done {
      opacity: 0.7;
    }
    .trilha-step--done:hover {
      opacity: 1;
    }

    .trilha-step--active {
      background: var(--color-info-dim, rgba(59,130,246,0.06));
      border-radius: 6px;
      padding-right: 8px;
    }

    .trilha-step--pending {
      opacity: 0.85;
    }

    /* ── XP Progress Bars ───────────────────────────────────────────── */
    .trilha-xp-bar {
      position: relative;
      overflow: hidden;
    }
    .trilha-xp-bar > div {
      transition: width 0.6s ease;
    }

    /* ── Resource Cards ─────────────────────────────────────────────── */
    .trilha-resource-card {
      transition: background 0.2s, border-color 0.2s;
    }
    .trilha-resource-card:hover {
      background: var(--bg-secondary) !important;
      border-color: var(--color-info) !important;
      color: var(--color-info) !important;
    }

    /* ── Priority Badges ────────────────────────────────────────────── */
    .trilha-priority-alta {
      background: var(--color-danger-dim, rgba(239,68,68,0.12));
      color: var(--color-danger, #ef4444);
    }
    .trilha-priority-media {
      background: var(--color-warning-dim, rgba(245,158,11,0.12));
      color: var(--color-warning, #f59e0b);
    }
    .trilha-priority-baixa {
      background: var(--color-info-dim, rgba(59,130,246,0.08));
      color: var(--color-info, #3b82f6);
    }

    /* ── Goal Drag & Drop ───────────────────────────────────────────── */
    .trilha-goal-item {
      transition: opacity 0.2s, border-top 0.2s;
    }
    .trilha-goal-item[draggable="true"]:hover {
      background: var(--bg-tertiary);
    }
    .trilha-goal-item.dragging {
      opacity: 0.4;
    }

    /* ── Goal notes textarea ────────────────────────────────────────── */
    .trilha-goal-notes {
      transition: border-color 0.2s;
    }
    .trilha-goal-notes:focus {
      border-color: var(--color-info) !important;
      border-style: solid !important;
      outline: none;
    }

    /* ── Responsive adjustments ─────────────────────────────────────── */
    @media (max-width: 768px) {
      .trilha-module .grid-4 {
        grid-template-columns: repeat(2, 1fr);
      }
      .trilha-module .grid-2 {
        grid-template-columns: 1fr;
      }
      .trilha-path-card .trilha-step {
        padding-left: 28px !important;
      }
    }

    /* ── Tab animation ──────────────────────────────────────────────── */
    .trilha-module .tab-content {
      animation: trilhaFadeIn 0.2s ease;
    }
    @keyframes trilhaFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();
