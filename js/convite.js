// ============================================================================
// TBO OS — Pagina de Aceite de Convite
// Valida token, exibe formulario, cria usuario no Supabase Auth
// ============================================================================

const TBO_CONVITE = {
  _token: null,
  _convite: null,
  _colaborador: null,
  _fotoFile: null,
  _tentativas: 0,
  _maxTentativas: 5,

  // ── Validacao de formato do token (hex 64 chars) ──────────────────────────
  _isTokenValido(token) {
    return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
  },

  // ── Rate limiting local (anti brute-force) ────────────────────────────────
  _checkRateLimit() {
    const key = 'tbo_convite_attempts';
    try {
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : { count: 0, resetAt: 0 };
      const now = Date.now();

      // Reset apos 15 minutos
      if (now > data.resetAt) {
        data.count = 0;
        data.resetAt = now + (15 * 60 * 1000);
      }

      data.count++;
      localStorage.setItem(key, JSON.stringify(data));

      // Bloquear apos 10 tentativas em 15 min
      if (data.count > 10) return false;
    } catch { /* localStorage indisponivel — permitir */ }
    return true;
  },

  // ── Inicializacao ───────────────────────────────────────────────────────────
  async init() {
    // Extrair token da URL
    const params = new URLSearchParams(window.location.search);
    this._token = params.get('token');

    if (!this._token) {
      this._showError('Link invalido. Nenhum token de convite encontrado.');
      return;
    }

    // Validar formato do token (previne buscas desnecessarias)
    if (!this._isTokenValido(this._token)) {
      this._showError('Link invalido. O token de convite esta mal-formado.');
      return;
    }

    // Rate limiting local
    if (!this._checkRateLimit()) {
      this._showError('Muitas tentativas. Aguarde 15 minutos e tente novamente.');
      return;
    }

    await this._validarToken();
  },

  // ── Validar token ───────────────────────────────────────────────────────────
  async _validarToken() {
    try {
      const client = TBO_ONBOARDING_DB.getClient();
      if (!client) {
        this._showError('Erro de conexao. Tente novamente mais tarde.');
        return;
      }

      // Buscar convite pelo token
      const { data: convite, error } = await client
        .from('convites')
        .select('*, colaborador:colaboradores(*)')
        .eq('token', this._token)
        .single();

      if (error || !convite) {
        this._showError('Convite nao encontrado. Verifique o link ou solicite um novo convite.');
        return;
      }

      // Verificar se ja foi usado
      if (convite.usado_em) {
        this._showError('Este convite ja foi utilizado. Se precisar de acesso, solicite um novo convite.');
        return;
      }

      // Verificar validade
      if (new Date(convite.expira_em) < new Date()) {
        this._showError('Este convite expirou. Solicite um novo convite ao administrador.');
        return;
      }

      this._convite = convite;
      this._colaborador = convite.colaborador;
      this._renderFormulario();

    } catch (e) {
      console.error('[TBO Convite] Erro ao validar token:', e);
      this._showError('Erro ao validar convite. Tente novamente.');
    }
  },

  // ── Renderizar formulario ───────────────────────────────────────────────────
  _renderFormulario() {
    const container = document.getElementById('conviteContent');
    if (!container) return;

    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    const colab = this._colaborador;

    container.innerHTML = `
      <h2>Bem-vindo(a) a TBO!</h2>
      <p class="subtitle">Complete seu cadastro para acessar o sistema</p>

      <div class="convite-avatar-upload">
        <div class="convite-avatar-preview" id="avatarPreview" title="Clique para adicionar uma foto">
          <span class="placeholder-icon"><i data-lucide="camera" style="width:24px;height:24px;"></i></span>
        </div>
        <input type="file" id="avatarInput" accept="image/*" style="display:none;">
        <small style="color:var(--text-muted);">Clique para adicionar foto (opcional)</small>
      </div>

      <div class="form-group">
        <label class="form-label">Nome</label>
        <input type="text" class="form-input" value="${esc(colab.nome)}" disabled>
      </div>

      <div class="form-group">
        <label class="form-label">E-mail</label>
        <input type="email" class="form-input" value="${esc(colab.email)}" disabled>
      </div>

      <div class="form-group">
        <label class="form-label">Cargo</label>
        <input type="text" class="form-input" value="${esc(colab.cargo)}" disabled>
      </div>

      <div class="form-group">
        <label class="form-label">Telefone</label>
        <input type="tel" class="form-input" id="conviteTelefone" placeholder="(41) 99999-9999" value="${esc(colab.telefone)}">
      </div>

      <div class="form-group">
        <label class="form-label">Senha <span style="color:var(--brand-orange);">*</span></label>
        <input type="password" class="form-input" id="conviteSenha" placeholder="Minimo 8 caracteres" minlength="8">
        <span class="form-hint">Minimo 8 caracteres, incluindo letra e numero</span>
      </div>

      <div class="form-group">
        <label class="form-label">Confirmar senha <span style="color:var(--brand-orange);">*</span></label>
        <input type="password" class="form-input" id="conviteSenhaConfirm" placeholder="Repita a senha">
      </div>

      <div id="conviteErroMsg" style="color:var(--danger);font-size:13px;margin-bottom:12px;display:none;"></div>

      <button class="btn btn-primary" id="conviteSalvarBtn" style="width:100%;margin-top:8px;">
        <i data-lucide="check" style="width:16px;height:16px;margin-right:6px;"></i>
        Criar minha conta
      </button>

      <div class="convite-footer">
        <a href="../index.html">Ja tenho conta — Fazer login</a>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    this._bindEvents();
  },

  // ── Bind de eventos ─────────────────────────────────────────────────────────
  _bindEvents() {
    // Upload de foto
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarInput = document.getElementById('avatarInput');

    if (avatarPreview && avatarInput) {
      avatarPreview.addEventListener('click', () => avatarInput.click());
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo (apenas imagens)
        if (!file.type.startsWith('image/')) {
          this._showFormError('Selecione um arquivo de imagem (JPG, PNG, etc.).');
          return;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this._showFormError('A foto deve ter no maximo 5MB.');
          return;
        }

        this._fotoFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
          avatarPreview.innerHTML = `<img src="${ev.target.result}" alt="Foto">`;
        };
        reader.readAsDataURL(file);
      });
    }

    // Mascara de telefone
    const telInput = document.getElementById('conviteTelefone');
    if (telInput) {
      telInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 11) val = val.substring(0, 11);
        if (val.length > 6) {
          e.target.value = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
        } else if (val.length > 2) {
          e.target.value = `(${val.substring(0, 2)}) ${val.substring(2)}`;
        } else if (val.length > 0) {
          e.target.value = `(${val}`;
        }
      });
    }

    // Indicador de forca de senha
    const senhaInput = document.getElementById('conviteSenha');
    if (senhaInput) {
      senhaInput.addEventListener('input', () => this._atualizarForcaSenha(senhaInput.value));
    }

    // Botao salvar
    const salvarBtn = document.getElementById('conviteSalvarBtn');
    if (salvarBtn) {
      salvarBtn.addEventListener('click', () => this._salvar());
    }

    // Enter no campo de confirmar senha
    const confirmInput = document.getElementById('conviteSenhaConfirm');
    if (confirmInput) {
      confirmInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this._salvar();
      });
    }
  },

  // ── Indicador de forca de senha ─────────────────────────────────────────────
  _atualizarForcaSenha(senha) {
    let hint = document.getElementById('conviteSenhaStrength');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'conviteSenhaStrength';
      hint.style.cssText = 'margin-top:4px;font-size:12px;transition:color 200ms;';
      const senhaInput = document.getElementById('conviteSenha');
      if (senhaInput?.parentElement) senhaInput.parentElement.appendChild(hint);
    }

    if (!senha || senha.length === 0) { hint.textContent = ''; return; }

    let score = 0;
    if (senha.length >= 8) score++;
    if (senha.length >= 12) score++;
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) score++;
    if (/[0-9]/.test(senha)) score++;
    if (/[^a-zA-Z0-9]/.test(senha)) score++;

    const levels = [
      { label: 'Muito fraca', color: 'var(--danger, #dc3545)' },
      { label: 'Fraca', color: 'var(--danger, #dc3545)' },
      { label: 'Razoavel', color: 'var(--warning, #f59e0b)' },
      { label: 'Boa', color: 'var(--success, #2ecc71)' },
      { label: 'Forte', color: 'var(--success, #2ecc71)' },
      { label: 'Excelente', color: 'var(--success, #2ecc71)' }
    ];
    const level = levels[Math.min(score, 5)];
    hint.textContent = `Forca: ${level.label}`;
    hint.style.color = level.color;
  },

  // ── Salvar (criar conta) ────────────────────────────────────────────────────
  async _salvar() {
    const senha = document.getElementById('conviteSenha')?.value;
    const senhaConfirm = document.getElementById('conviteSenhaConfirm')?.value;
    const telefone = document.getElementById('conviteTelefone')?.value;
    const btn = document.getElementById('conviteSalvarBtn');

    // Validacoes
    if (!senha || senha.length < 8) {
      this._showFormError('A senha deve ter no minimo 8 caracteres.');
      return;
    }

    if (!/[a-zA-Z]/.test(senha) || !/[0-9]/.test(senha)) {
      this._showFormError('A senha deve conter pelo menos uma letra e um numero.');
      return;
    }

    if (senha !== senhaConfirm) {
      this._showFormError('As senhas nao coincidem.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Criando conta...';
    }

    try {
      const client = TBO_ONBOARDING_DB.getClient();
      if (!client) throw new Error('Conexao indisponivel');

      // 1. Criar usuario no Supabase Auth
      const { data: authData, error: authError } = await client.auth.signUp({
        email: this._colaborador.email,
        password: senha,
        options: {
          data: {
            full_name: this._colaborador.nome,
            role: this._colaborador.perfil_acesso
          }
        }
      });

      if (authError) {
        throw new Error(`Erro ao criar conta: ${authError.message}`);
      }

      // 2. Upload de foto (se selecionada)
      let fotoUrl = null;
      if (this._fotoFile && authData.user) {
        try {
          const ext = this._fotoFile.name.split('.').pop();
          const path = `avatars/${authData.user.id}.${ext}`;

          const { error: uploadError } = await client.storage
            .from('onboarding-files')
            .upload(path, this._fotoFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (!uploadError) {
            const { data: urlData } = client.storage
              .from('onboarding-files')
              .getPublicUrl(path);
            fotoUrl = urlData?.publicUrl;
          }
        } catch (e) {
          console.warn('[TBO Convite] Erro no upload da foto:', e);
          // Nao impedir o cadastro se a foto falhar
        }
      }

      // 3. Atualizar colaborador (auth_user_id, telefone, foto)
      const updates = {};
      if (authData.user) updates.auth_user_id = authData.user.id;
      if (telefone) updates.telefone = telefone;
      if (fotoUrl) updates.foto_url = fotoUrl;

      if (Object.keys(updates).length > 0) {
        await client
          .from('colaboradores')
          .update(updates)
          .eq('id', this._colaborador.id);
      }

      // 4. Marcar convite como usado
      await client
        .from('convites')
        .update({ usado_em: new Date().toISOString() })
        .eq('id', this._convite.id);

      // 5. Exibir sucesso
      this._showSuccess();

    } catch (e) {
      console.error('[TBO Convite] Erro ao salvar:', e);
      this._showFormError(e.message || 'Erro ao criar conta. Tente novamente.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;margin-right:6px;"></i> Criar minha conta';
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  // ── Exibir mensagens ────────────────────────────────────────────────────────
  _showError(msg) {
    const container = document.getElementById('conviteContent');
    if (!container) return;
    container.innerHTML = `
      <div class="convite-error">
        <i data-lucide="alert-circle" style="width:48px;height:48px;color:var(--danger);margin-bottom:16px;"></i>
        <h3 style="margin:0 0 8px;">${msg}</h3>
        <p style="color:var(--text-muted);font-size:14px;">
          Entre em contato com o administrador para obter um novo convite.
        </p>
        <a href="../index.html" class="btn btn-secondary" style="margin-top:16px;">Ir para login</a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  _showFormError(msg) {
    const el = document.getElementById('conviteErroMsg');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  },

  _showSuccess() {
    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    const container = document.getElementById('conviteContent');
    if (!container) return;
    container.innerHTML = `
      <div class="convite-success">
        <i data-lucide="check-circle"></i>
        <h3 style="margin:0 0 8px;">Conta criada com sucesso!</h3>
        <p style="color:var(--text-muted);font-size:14px;">
          Bem-vindo(a) a TBO, ${esc(this._colaborador.nome)}!<br>
          Redirecionando para o login...
        </p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    // Redirecionar apos 2 segundos
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 2000);
  }
};

// Inicializar quando a pagina carregar
document.addEventListener('DOMContentLoaded', () => TBO_CONVITE.init());
