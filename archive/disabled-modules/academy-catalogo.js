// ============================================================================
// TBO OS — Modulo: TBO Academy — Catalogo de Cursos
// Rota: #academy ou #academy/catalogo
// Subsistema Academy com navegacao propria
// ============================================================================

const TBO_ACADEMY_CATALOGO = {
  _courses: [],
  _enrollments: [],
  _filter: 'todos',
  _loading: true,

  render() {
    const filtered = this._getFilteredCourses();
    const enrolled = this._enrollments.length;
    const completed = this._enrollments.filter(e => e.status === 'completed').length;
    const categories = [...new Set(this._courses.map(c => c.category).filter(Boolean))];

    return `
      <div class="academy-module">
        <!-- Banner -->
        <div style="background:linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);color:#fff;padding:24px 32px;border-radius:var(--radius-lg);margin-bottom:24px;display:flex;align-items:center;gap:20px;">
          <i data-lucide="graduation-cap" style="width:40px;height:40px;flex-shrink:0;opacity:0.9;"></i>
          <div>
            <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;">TBO Academy</div>
            <div style="font-size:0.82rem;opacity:0.8;">Plataforma de aprendizado interno — cursos, trilhas e certificados.</div>
          </div>
        </div>

        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Cursos Disponiveis</div>
            <div class="kpi-value">${this._courses.filter(c => c.is_published).length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Meus Cursos</div>
            <div class="kpi-value" style="color:var(--brand-primary);">${enrolled}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Concluidos</div>
            <div class="kpi-value" style="color:var(--color-success);">${completed}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Categorias</div>
            <div class="kpi-value">${categories.length}</div>
          </div>
        </div>

        <!-- Filtros -->
        <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
          <button class="btn ${this._filter === 'todos' ? 'btn-primary' : 'btn-ghost'} acad-filter-btn" data-filter="todos" style="font-size:0.78rem;">Todos</button>
          <button class="btn ${this._filter === 'meus' ? 'btn-primary' : 'btn-ghost'} acad-filter-btn" data-filter="meus" style="font-size:0.78rem;">Meus Cursos</button>
          ${categories.map(c => `
            <button class="btn ${this._filter === c ? 'btn-primary' : 'btn-ghost'} acad-filter-btn" data-filter="${c}" style="font-size:0.78rem;">${this._categoryLabel(c)}</button>
          `).join('')}
        </div>

        ${this._loading ? `
          <div style="text-align:center;padding:48px;">
            <p style="color:var(--text-muted);">Carregando cursos...</p>
          </div>
        ` : `
          <!-- Cursos Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
            ${filtered.map(course => this._renderCourseCard(course)).join('')}
          </div>

          ${!filtered.length ? `
            <div style="text-align:center;padding:48px;">
              <i data-lucide="book-x" style="width:40px;height:40px;color:var(--text-muted);margin-bottom:8px;"></i>
              <p style="color:var(--text-muted);font-size:0.88rem;">Nenhum curso encontrado nesta categoria.</p>
            </div>
          ` : ''}
        `}
      </div>
    `;
  },

  _renderCourseCard(course) {
    const enrollment = this._enrollments.find(e => e.course_id === course.id);
    const isEnrolled = !!enrollment;
    const progress = enrollment ? (enrollment._progressPct || 0) : 0;
    const statusLabel = enrollment?.status === 'completed' ? 'Concluido' :
                        enrollment?.status === 'in_progress' ? `${Math.round(progress)}%` :
                        isEnrolled ? 'Matriculado' : '';

    return `
      <div class="card" style="position:relative;overflow:hidden;cursor:pointer;" data-course-id="${course.id}">
        ${course.is_featured ? '<div style="position:absolute;top:8px;right:8px;"><span class="tag gold" style="font-size:0.62rem;">Destaque</span></div>' : ''}

        <!-- Thumbnail placeholder -->
        <div style="height:120px;background:linear-gradient(135deg, ${this._categoryColor(course.category)}22, ${this._categoryColor(course.category)}44);border-radius:var(--radius-md);margin-bottom:12px;display:flex;align-items:center;justify-content:center;">
          <i data-lucide="${this._categoryIcon(course.category)}" style="width:32px;height:32px;color:${this._categoryColor(course.category)};opacity:0.6;"></i>
        </div>

        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span class="tag" style="font-size:0.62rem;">${this._categoryLabel(course.category)}</span>
          <span class="tag" style="font-size:0.62rem;">${this._levelLabel(course.level)}</span>
          ${course.duration_hours ? `<span style="font-size:0.68rem;color:var(--text-muted);">${course.duration_hours}h</span>` : ''}
        </div>

        <h3 style="margin:0 0 4px;font-size:0.92rem;line-height:1.3;">${this._esc(course.title)}</h3>
        <p style="font-size:0.75rem;color:var(--text-secondary);margin:0 0 12px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${this._esc(course.description || '')}</p>

        ${isEnrolled ? `
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="flex:1;height:4px;background:var(--bg-elevated);border-radius:2px;overflow:hidden;">
              <div style="height:100%;width:${progress}%;background:${enrollment?.status === 'completed' ? 'var(--color-success)' : 'var(--brand-primary)'};border-radius:2px;"></div>
            </div>
            <span style="font-size:0.68rem;color:${enrollment?.status === 'completed' ? 'var(--color-success)' : 'var(--brand-primary)'};font-weight:600;">${statusLabel}</span>
          </div>
        ` : `
          <button class="btn btn-primary acad-enroll-btn" data-course-id="${course.id}" style="font-size:0.78rem;width:100%;">Matricular-se</button>
        `}
      </div>
    `;
  },

  _getFilteredCourses() {
    let courses = this._courses.filter(c => c.is_published);

    if (this._filter === 'meus') {
      const enrolledIds = new Set(this._enrollments.map(e => e.course_id));
      courses = courses.filter(c => enrolledIds.has(c.id));
    } else if (this._filter !== 'todos') {
      courses = courses.filter(c => c.category === this._filter);
    }

    // Featured first, then by order_index
    return courses.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return b.is_featured ? 1 : -1;
      return (a.order_index || 0) - (b.order_index || 0);
    });
  },

  async init() {
    // Filtros
    document.querySelectorAll('.acad-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._filter = btn.dataset.filter;
        this._rerender();
      });
    });

    // Enroll
    document.querySelectorAll('.acad-enroll-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this._enroll(btn.dataset.courseId);
      });
    });

    // Load data
    if (this._loading) await this._loadData();
  },

  async _loadData() {
    try {
      if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.getClient()) {
        this._courses = this._getMockCourses();
        this._loading = false;
        this._rerender();
        return;
      }

      const client = TBO_SUPABASE.getClient();

      const { data: courses } = await client.from('academy_courses').select('*').order('order_index');
      this._courses = courses || this._getMockCourses();

      const { data: enrollments } = await client.from('academy_enrollments').select('*');
      this._enrollments = enrollments || [];

      this._loading = false;
      this._rerender();
    } catch (e) {
      console.warn('[Academy] Erro ao carregar:', e.message);
      this._courses = this._getMockCourses();
      this._loading = false;
      this._rerender();
    }
  },

  async _enroll(courseId) {
    try {
      const client = TBO_SUPABASE?.getClient();
      const { data: { user } } = await client.auth.getUser();
      if (!user || !client) return;

      const { error } = await client.from('academy_enrollments').insert({
        course_id: courseId,
        user_id: user.id,
        status: 'enrolled'
      });

      if (error) throw error;

      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Academy', 'Matricula realizada!');
      this._loading = true;
      this._rerender();
    } catch (e) {
      console.warn('[Academy] Enroll error:', e.message);
      // Fallback: adicionar localmente
      this._enrollments.push({ course_id: courseId, status: 'enrolled' });
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Academy', 'Matricula registrada (offline).');
      this._rerender();
    }
  },

  _getMockCourses() {
    return [
      { id: 'mock-1', title: 'Fundamentos de 3D para Arquitetura', slug: 'fundamentos-3d', description: 'Aprenda os conceitos basicos de modelagem 3D aplicados a projetos de arquitetura e interiores.', category: '3d', level: 'iniciante', duration_hours: 40, is_published: true, is_featured: true, order_index: 1 },
      { id: 'mock-2', title: 'Branding Estrategico', slug: 'branding-estrategico', description: 'Metodologia TBO para criacao de marcas com posicionamento forte.', category: 'branding', level: 'intermediario', duration_hours: 24, is_published: true, is_featured: true, order_index: 2 },
      { id: 'mock-3', title: 'Marketing Digital para Imobiliario', slug: 'marketing-digital-imob', description: 'Estrategias de marketing digital aplicadas ao mercado imobiliario.', category: 'marketing', level: 'iniciante', duration_hours: 16, is_published: true, is_featured: false, order_index: 3 },
      { id: 'mock-4', title: 'Gestao de Projetos Criativos', slug: 'gestao-projetos', description: 'Metodologias ageis aplicadas a projetos criativos em agencias.', category: 'gestao', level: 'intermediario', duration_hours: 20, is_published: true, is_featured: false, order_index: 4 },
      { id: 'mock-5', title: 'Producao Audiovisual', slug: 'producao-audiovisual', description: 'Do briefing a entrega: producao de videos profissionais para marcas.', category: 'audiovisual', level: 'avancado', duration_hours: 32, is_published: true, is_featured: false, order_index: 5 }
    ];
  },

  _categoryLabel(cat) {
    return { '3d': '3D', branding: 'Branding', marketing: 'Marketing', audiovisual: 'Audiovisual', interiores: 'Interiores', gamificacao: 'Gamificacao', gestao: 'Gestao', ferramentas: 'Ferramentas', geral: 'Geral' }[cat] || cat || 'Geral';
  },

  _categoryIcon(cat) {
    return { '3d': 'box', branding: 'palette', marketing: 'megaphone', audiovisual: 'video', interiores: 'home', gamificacao: 'gamepad-2', gestao: 'kanban', ferramentas: 'wrench', geral: 'book-open' }[cat] || 'book-open';
  },

  _categoryColor(cat) {
    return { '3d': '#8b5cf6', branding: '#ec4899', marketing: '#f59e0b', audiovisual: '#ef4444', interiores: '#10b981', gamificacao: '#6366f1', gestao: '#3b82f6', ferramentas: '#6b7280', geral: '#E85102' }[cat] || '#E85102';
  },

  _levelLabel(level) {
    return { iniciante: 'Iniciante', intermediario: 'Intermediario', avancado: 'Avancado' }[level] || level || '';
  },

  _rerender() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  _esc(str) {
    if (typeof _escapeHtml === 'function') return _escapeHtml(String(str || ''));
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
