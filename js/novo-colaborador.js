// ============================================================================
// TBO OS — Formulario de Cadastro de Novo Colaborador
// Acessivel apenas para admin e gestor
// ============================================================================

const TBO_NOVO_COLABORADOR = {
  _buddies: [],

  // ── Inicializacao ───────────────────────────────────────────────────────────
  async init() {
    try {
      const client = TBO_ONBOARDING_DB.getClient();
      if (!client) {
        this._showError('Erro de conexao.');
        return;
      }

      // Buscar colaboradores ativos para o select de buddy
      const { data: buddies } = await client
        .from('colaboradores')
        .select('id, nome, cargo')
        .eq('status', 'ativo')
        .order('nome');

      this._buddies = buddies || [];
      this._renderFormulario();

    } catch (e) {
      console.error('[TBO Novo Colaborador] Erro:', e);
      this._showError('Erro ao carregar formulario.');
    }
  },

  // ── Renderizar formulario ───────────────────────────────────────────────────
  _renderFormulario() {
    const container = document.getElementById('novoColabContent');
    if (!container) return;

    const buddyOptions = this._buddies.map(b =>
      `<option value="${b.id}">${b.nome} (${b.cargo})</option>`
    ).join('');

    // Data minima: hoje
    const hoje = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Dados do Colaborador</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Nome completo <span style="color:var(--brand-orange);">*</span></label>
            <input type="text" class="form-input" id="ncNome" placeholder="Nome e sobrenome">
            <span class="form-error" id="ncNomeError" style="display:none;"></span>
          </div>

          <div class="form-group">
            <label class="form-label">E-mail <span style="color:var(--brand-orange);">*</span></label>
            <input type="email" class="form-input" id="ncEmail" placeholder="nome@agenciatbo.com.br">
            <span class="form-error" id="ncEmailError" style="display:none;"></span>
          </div>

          <div class="form-group">
            <label class="form-label">Cargo <span style="color:var(--brand-orange);">*</span></label>
            <input type="text" class="form-input" id="ncCargo" placeholder="Ex: Artista 3D, PO Marketing">
            <span class="form-error" id="ncCargoError" style="display:none;"></span>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div class="form-group">
              <label class="form-label">Tipo de contrato</label>
              <select class="form-input" id="ncTipoContrato">
                <option value="PJ">PJ</option>
                <option value="CLT">CLT</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Data de inicio <span style="color:var(--brand-orange);">*</span></label>
              <input type="date" class="form-input" id="ncDataInicio" min="${hoje}">
              <span class="form-error" id="ncDataError" style="display:none;"></span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Buddy (mentor)</label>
            <select class="form-input" id="ncBuddy">
              <option value="">Selecionar buddy...</option>
              ${buddyOptions}
            </select>
            <span class="form-hint">Quem vai acompanhar este colaborador durante o onboarding</span>
          </div>

          <div class="form-group">
            <label class="form-label">Tipo de onboarding</label>
            <select class="form-input" id="ncTipoOnboarding">
              <option value="completo">Completo (10 dias — novo colaborador)</option>
              <option value="reduzido">Reduzido (3 dias — usuario existente)</option>
            </select>
          </div>

          <div id="ncErroGeral" style="color:var(--danger);font-size:13px;margin-bottom:12px;display:none;"></div>
        </div>
        <div class="card-footer" style="display:flex;justify-content:flex-end;gap:8px;">
          <a href="../index.html#admin-onboarding" class="btn btn-secondary">Cancelar</a>
          <button class="btn btn-primary" id="ncSalvarBtn">
            <i data-lucide="user-plus" style="width:16px;height:16px;margin-right:6px;"></i>
            Cadastrar
          </button>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    this._bindEvents();
  },

  // ── Bind de eventos ─────────────────────────────────────────────────────────
  _bindEvents() {
    // Validacao em tempo real
    document.getElementById('ncNome')?.addEventListener('blur', () => this._validarCampo('ncNome', 'ncNomeError', 'Nome e obrigatorio'));
    document.getElementById('ncEmail')?.addEventListener('blur', () => {
      const email = document.getElementById('ncEmail')?.value;
      if (!email) {
        this._showFieldError('ncEmailError', 'E-mail e obrigatorio');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this._showFieldError('ncEmailError', 'E-mail invalido');
      } else {
        this._hideFieldError('ncEmailError');
      }
    });
    document.getElementById('ncCargo')?.addEventListener('blur', () => this._validarCampo('ncCargo', 'ncCargoError', 'Cargo e obrigatorio'));
    document.getElementById('ncDataInicio')?.addEventListener('blur', () => this._validarCampo('ncDataInicio', 'ncDataError', 'Data de inicio e obrigatoria'));

    // Salvar
    document.getElementById('ncSalvarBtn')?.addEventListener('click', () => this._salvar());
  },

  // ── Validacao de campo ──────────────────────────────────────────────────────
  _validarCampo(inputId, errorId, msg) {
    const val = document.getElementById(inputId)?.value?.trim();
    if (!val) {
      this._showFieldError(errorId, msg);
      return false;
    }
    this._hideFieldError(errorId);
    return true;
  },

  _showFieldError(errorId, msg) {
    const el = document.getElementById(errorId);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  },

  _hideFieldError(errorId) {
    const el = document.getElementById(errorId);
    if (el) el.style.display = 'none';
  },

  // ── Salvar colaborador ──────────────────────────────────────────────────────
  async _salvar() {
    // Validar todos os campos
    const nome = document.getElementById('ncNome')?.value?.trim();
    const email = document.getElementById('ncEmail')?.value?.trim();
    const cargo = document.getElementById('ncCargo')?.value?.trim();
    const dataInicio = document.getElementById('ncDataInicio')?.value;
    const tipoContrato = document.getElementById('ncTipoContrato')?.value;
    const buddyId = document.getElementById('ncBuddy')?.value || null;
    const tipoOnboarding = document.getElementById('ncTipoOnboarding')?.value;

    let valido = true;
    if (!nome) { this._showFieldError('ncNomeError', 'Nome e obrigatorio'); valido = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this._showFieldError('ncEmailError', 'E-mail valido e obrigatorio'); valido = false; }
    if (!cargo) { this._showFieldError('ncCargoError', 'Cargo e obrigatorio'); valido = false; }
    if (!dataInicio) { this._showFieldError('ncDataError', 'Data de inicio e obrigatoria'); valido = false; }

    if (!valido) return;

    const btn = document.getElementById('ncSalvarBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Cadastrando...'; }

    try {
      const client = TBO_ONBOARDING_DB.getClient();
      if (!client) throw new Error('Conexao indisponivel');

      // Verificar se ja existe colaborador com este email
      const { data: existente } = await client
        .from('colaboradores')
        .select('id')
        .eq('email', email)
        .single();

      if (existente) {
        this._showFieldError('ncEmailError', 'Ja existe um colaborador com este e-mail');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="user-plus" style="width:16px;height:16px;margin-right:6px;"></i> Cadastrar'; if (window.lucide) lucide.createIcons(); }
        return;
      }

      // Buscar quem esta cadastrando (colaborador logado)
      let cadastradoPor = null;
      const session = await TBO_ONBOARDING_DB.getSession();
      if (session) {
        const { data: logado } = await client
          .from('colaboradores')
          .select('id')
          .eq('auth_user_id', session.user.id)
          .single();
        if (logado) cadastradoPor = logado.id;
      }

      // Inserir colaborador
      const { data: novoColab, error } = await client
        .from('colaboradores')
        .insert({
          nome,
          email,
          cargo,
          tipo_contrato: tipoContrato,
          data_inicio: dataInicio,
          buddy_id: buddyId || null,
          cadastrado_por: cadastradoPor,
          tipo_onboarding: tipoOnboarding,
          perfil_acesso: 'colaborador',
          status: 'pre-onboarding'
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Buscar o convite gerado automaticamente pelo trigger
      const { data: convite } = await client
        .from('convites')
        .select('token')
        .eq('colaborador_id', novoColab.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const link = convite
        ? `${window.location.origin}/pages/convite.html?token=${convite.token}`
        : 'Convite sera gerado em instantes.';

      // Formatar data para exibicao
      const dataFormatada = new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      // Exibir confirmacao
      this._showConfirmacao(nome, email, cargo, dataFormatada, link);

    } catch (e) {
      console.error('[TBO Novo Colaborador] Erro ao salvar:', e);
      const erroEl = document.getElementById('ncErroGeral');
      if (erroEl) {
        erroEl.textContent = `Erro ao cadastrar: ${e.message}`;
        erroEl.style.display = 'block';
      }
      if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="user-plus" style="width:16px;height:16px;margin-right:6px;"></i> Cadastrar'; if (window.lucide) lucide.createIcons(); }
    }
  },

  // ── Confirmacao de cadastro ─────────────────────────────────────────────────
  _showConfirmacao(nome, email, cargo, data, link) {
    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    const container = document.getElementById('novoColabContent');
    if (!container) return;

    container.innerHTML = `
      <div class="card">
        <div class="card-body" style="text-align:center;padding:40px;">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--success);color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <i data-lucide="check" style="width:32px;height:32px;"></i>
          </div>
          <h2 style="margin:0 0 8px;font-size:20px;">Colaborador cadastrado!</h2>
          <p style="color:var(--text-muted);margin-bottom:24px;">
            O convite foi gerado automaticamente.
          </p>

          <div style="text-align:left;background:var(--bg-secondary);padding:16px;border-radius:8px;margin-bottom:20px;">
            <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:14px;">
              <strong>Nome:</strong><span>${esc(nome)}</span>
              <strong>E-mail:</strong><span>${esc(email)}</span>
              <strong>Cargo:</strong><span>${esc(cargo)}</span>
              <strong>Inicio:</strong><span>${esc(data)}</span>
            </div>
          </div>

          <div style="background:var(--bg-secondary);padding:12px;border-radius:8px;margin-bottom:20px;">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Link do convite:</div>
            <div style="font-size:13px;word-break:break-all;font-family:monospace;" id="ncLinkConvite">${esc(link)}</div>
            <button class="btn btn-sm btn-secondary" id="ncCopyLinkBtn" style="margin-top:8px;">
              <i data-lucide="copy" style="width:14px;height:14px;margin-right:4px;"></i>Copiar link
            </button>
          </div>

          <div style="display:flex;gap:8px;justify-content:center;">
            <button class="btn btn-secondary" onclick="TBO_NOVO_COLABORADOR._renderFormulario(); TBO_NOVO_COLABORADOR._bindEvents();">
              Cadastrar outro
            </button>
            <a href="../index.html#admin-onboarding" class="btn btn-primary">
              Ver painel de onboarding
            </a>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Bind copy button
    document.getElementById('ncCopyLinkBtn')?.addEventListener('click', () => {
      const linkText = document.getElementById('ncLinkConvite')?.textContent;
      if (linkText && navigator.clipboard) {
        navigator.clipboard.writeText(linkText).then(() => {
          const btn = document.getElementById('ncCopyLinkBtn');
          if (btn) { btn.textContent = 'Copiado!'; setTimeout(() => { btn.innerHTML = '<i data-lucide="copy" style="width:14px;height:14px;margin-right:4px;"></i>Copiar link'; if (window.lucide) lucide.createIcons(); }, 2000); }
        });
      }
    });
  },

  // ── Erro generico ───────────────────────────────────────────────────────────
  _showError(msg) {
    const container = document.getElementById('novoColabContent');
    if (!container) return;
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--danger);">
        <p>${msg}</p>
        <button class="btn btn-secondary" onclick="location.reload()">Tentar novamente</button>
      </div>
    `;
  }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => TBO_NOVO_COLABORADOR.init());
