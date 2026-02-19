// ============================================================================
// TBO OS — Modulo: Onboarding Wizard
// Wizard de primeiro acesso: perfil, empresa, preferencias, conclusao
// Tour contextual por modulo (baseado no role do usuario)
// ============================================================================

const TBO_ONBOARDING_WIZARD = {
  _step: 0,
  _totalSteps: 4,
  _formData: {},
  _completed: false,

  /**
   * Verifica se o wizard deve ser exibido
   */
  shouldShow() {
    try {
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      if (!user) return false;

      // Verificar flag no profile
      const profileFlag = localStorage.getItem('tbo_onboarding_wizard_completed');
      if (profileFlag === 'true') return false;

      return true;
    } catch { return false; }
  },

  render() {
    if (this._completed) return this._renderComplete();

    const steps = ['Seu Perfil', 'Sua Empresa', 'Preferencias', 'Pronto!'];

    return `
      <div class="onboarding-wizard-module" style="max-width:640px;margin:0 auto;">
        <!-- Progress Bar -->
        <div style="margin-bottom:32px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            ${steps.map((s, i) => `
              <div style="display:flex;align-items:center;gap:6px;">
                <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;
                  ${i < this._step ? 'background:var(--color-success);color:#fff;' : i === this._step ? 'background:var(--brand-primary);color:#fff;' : 'background:var(--bg-elevated);color:var(--text-muted);'}">
                  ${i < this._step ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : i + 1}
                </div>
                <span style="font-size:0.72rem;color:${i <= this._step ? 'var(--text-primary)' : 'var(--text-muted)'};font-weight:${i === this._step ? '600' : '400'};">${s}</span>
              </div>
            `).join('')}
          </div>
          <div style="height:4px;background:var(--bg-elevated);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${((this._step + 1) / this._totalSteps) * 100}%;background:var(--brand-primary);transition:width 0.3s;border-radius:2px;"></div>
          </div>
        </div>

        <!-- Step Content -->
        <div class="card" style="padding:32px;">
          ${this._renderStep()}
        </div>

        <!-- Navigation -->
        <div style="display:flex;justify-content:space-between;margin-top:20px;">
          <button class="btn btn-ghost" id="owPrev" ${this._step === 0 ? 'disabled style="opacity:0.3;"' : ''}>
            <i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Voltar
          </button>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost" id="owSkip" style="font-size:0.78rem;">Pular</button>
            <button class="btn btn-primary" id="owNext">
              ${this._step === this._totalSteps - 1 ? 'Concluir' : 'Proximo'} <i data-lucide="arrow-right" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  _renderStep() {
    switch (this._step) {
      case 0: return this._renderStepPerfil();
      case 1: return this._renderStepEmpresa();
      case 2: return this._renderStepPreferencias();
      case 3: return this._renderStepPronto();
      default: return '';
    }
  },

  _renderStepPerfil() {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : {};

    return `
      <div style="text-align:center;margin-bottom:24px;">
        <i data-lucide="user-circle" style="width:48px;height:48px;color:var(--brand-primary);margin-bottom:8px;"></i>
        <h3 style="margin:0;font-size:1.1rem;">Bem-vindo ao TBO OS!</h3>
        <p style="color:var(--text-secondary);font-size:0.82rem;">Confirme seus dados para comecarmos.</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px;">
        <label style="font-size:0.82rem;font-weight:500;">
          Nome completo
          <input type="text" id="owName" value="${this._esc(this._formData.name || user.name || '')}"
            style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);" placeholder="Seu nome">
        </label>

        <label style="font-size:0.82rem;font-weight:500;">
          Cargo / Funcao
          <input type="text" id="owCargo" value="${this._esc(this._formData.cargo || '')}"
            style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);" placeholder="Ex: Diretor de Arte, Project Owner">
        </label>

        <label style="font-size:0.82rem;font-weight:500;">
          Departamento
          <select id="owDepartment" style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);">
            <option value="">Selecione...</option>
            <option value="direcao" ${this._formData.department === 'direcao' ? 'selected' : ''}>Direcao</option>
            <option value="criacao" ${this._formData.department === 'criacao' ? 'selected' : ''}>Criacao</option>
            <option value="projetos" ${this._formData.department === 'projetos' ? 'selected' : ''}>Projetos</option>
            <option value="comercial" ${this._formData.department === 'comercial' ? 'selected' : ''}>Comercial</option>
            <option value="financeiro" ${this._formData.department === 'financeiro' ? 'selected' : ''}>Financeiro</option>
            <option value="marketing" ${this._formData.department === 'marketing' ? 'selected' : ''}>Marketing</option>
          </select>
        </label>
      </div>
    `;
  },

  _renderStepEmpresa() {
    return `
      <div style="text-align:center;margin-bottom:24px;">
        <i data-lucide="building-2" style="width:48px;height:48px;color:var(--brand-primary);margin-bottom:8px;"></i>
        <h3 style="margin:0;font-size:1.1rem;">Sua empresa</h3>
        <p style="color:var(--text-secondary);font-size:0.82rem;">Informacoes da empresa (opcional para PJ).</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px;">
        <label style="font-size:0.82rem;font-weight:500;">
          CNPJ (PJ)
          <input type="text" id="owCnpj" value="${this._esc(this._formData.cnpj || '')}"
            style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);" placeholder="00.000.000/0000-00">
        </label>

        <label style="font-size:0.82rem;font-weight:500;">
          Tipo de contrato
          <select id="owContractType" style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);">
            <option value="pj" ${this._formData.contractType === 'pj' ? 'selected' : ''}>PJ (Pessoa Juridica)</option>
            <option value="clt" ${this._formData.contractType === 'clt' ? 'selected' : ''}>CLT</option>
            <option value="freelancer" ${this._formData.contractType === 'freelancer' ? 'selected' : ''}>Freelancer</option>
            <option value="estagio" ${this._formData.contractType === 'estagio' ? 'selected' : ''}>Estagio</option>
          </select>
        </label>

        <label style="font-size:0.82rem;font-weight:500;">
          Data de inicio
          <input type="date" id="owStartDate" value="${this._formData.startDate || ''}"
            style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);">
        </label>
      </div>
    `;
  },

  _renderStepPreferencias() {
    return `
      <div style="text-align:center;margin-bottom:24px;">
        <i data-lucide="settings" style="width:48px;height:48px;color:var(--brand-primary);margin-bottom:8px;"></i>
        <h3 style="margin:0;font-size:1.1rem;">Preferencias</h3>
        <p style="color:var(--text-secondary);font-size:0.82rem;">Personalize sua experiencia no TBO OS.</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:20px;">
        <div>
          <label style="font-size:0.82rem;font-weight:500;display:block;margin-bottom:8px;">Tema</label>
          <div style="display:flex;gap:12px;">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px 16px;border:2px solid ${this._formData.theme === 'light' ? 'var(--brand-primary)' : 'var(--border-default)'};border-radius:var(--radius-md);flex:1;">
              <input type="radio" name="owTheme" value="light" ${(this._formData.theme || 'light') === 'light' ? 'checked' : ''}>
              <i data-lucide="sun" style="width:16px;height:16px;"></i>
              <span style="font-size:0.82rem;">Claro</span>
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px 16px;border:2px solid ${this._formData.theme === 'dark' ? 'var(--brand-primary)' : 'var(--border-default)'};border-radius:var(--radius-md);flex:1;">
              <input type="radio" name="owTheme" value="dark" ${this._formData.theme === 'dark' ? 'checked' : ''}>
              <i data-lucide="moon" style="width:16px;height:16px;"></i>
              <span style="font-size:0.82rem;">Escuro</span>
            </label>
          </div>
        </div>

        <div>
          <label style="font-size:0.82rem;font-weight:500;display:block;margin-bottom:8px;">Notificacoes</label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="owNotifications" ${this._formData.notifications !== false ? 'checked' : ''}>
            <span style="font-size:0.82rem;">Receber notificacoes in-app (tarefas, deadlines, sync)</span>
          </label>
        </div>

        <div>
          <label style="font-size:0.82rem;font-weight:500;display:block;margin-bottom:8px;">Modulo inicial</label>
          <select id="owDefaultModule" style="width:100%;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:0.88rem;background:var(--bg-primary);">
            <option value="command-center">Dashboard (Command Center)</option>
            <option value="projetos">Projetos</option>
            <option value="tarefas">Tarefas</option>
            <option value="pipeline">Pipeline</option>
          </select>
        </div>
      </div>
    `;
  },

  _renderStepPronto() {
    return `
      <div style="text-align:center;">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--color-success);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <i data-lucide="check" style="width:36px;height:36px;color:#fff;"></i>
        </div>
        <h3 style="margin:0 0 8px;font-size:1.2rem;">Tudo pronto!</h3>
        <p style="color:var(--text-secondary);font-size:0.88rem;margin:0 0 24px;">Seu perfil esta configurado. Voce pode acessar todos os modulos do TBO OS agora.</p>

        <div style="background:var(--bg-elevated);border-radius:var(--radius-lg);padding:20px;text-align:left;">
          <p style="font-size:0.82rem;font-weight:600;margin:0 0 12px;">Resumo:</p>
          <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.6;">
            ${this._formData.name ? `<div>Nome: <strong>${this._esc(this._formData.name)}</strong></div>` : ''}
            ${this._formData.cargo ? `<div>Cargo: <strong>${this._esc(this._formData.cargo)}</strong></div>` : ''}
            ${this._formData.department ? `<div>Departamento: <strong>${this._esc(this._formData.department)}</strong></div>` : ''}
            ${this._formData.contractType ? `<div>Contrato: <strong>${this._esc(this._formData.contractType)}</strong></div>` : ''}
            ${this._formData.theme ? `<div>Tema: <strong>${this._formData.theme === 'dark' ? 'Escuro' : 'Claro'}</strong></div>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  _renderComplete() {
    return `
      <div style="text-align:center;padding:48px;">
        <i data-lucide="sparkles" style="width:48px;height:48px;color:var(--brand-primary);margin-bottom:16px;"></i>
        <h3 style="margin:0 0 8px;">Onboarding concluido!</h3>
        <p style="color:var(--text-secondary);font-size:0.82rem;">Redirecionando para o dashboard...</p>
      </div>
    `;
  },

  init() {
    // Navigation
    document.getElementById('owPrev')?.addEventListener('click', () => {
      if (this._step > 0) {
        this._saveCurrentStep();
        this._step--;
        this._rerender();
      }
    });

    document.getElementById('owNext')?.addEventListener('click', () => {
      this._saveCurrentStep();
      if (this._step < this._totalSteps - 1) {
        this._step++;
        this._rerender();
      } else {
        this._complete();
      }
    });

    document.getElementById('owSkip')?.addEventListener('click', () => {
      this._complete();
    });
  },

  _saveCurrentStep() {
    switch (this._step) {
      case 0:
        this._formData.name = document.getElementById('owName')?.value || '';
        this._formData.cargo = document.getElementById('owCargo')?.value || '';
        this._formData.department = document.getElementById('owDepartment')?.value || '';
        break;
      case 1:
        this._formData.cnpj = document.getElementById('owCnpj')?.value || '';
        this._formData.contractType = document.getElementById('owContractType')?.value || 'pj';
        this._formData.startDate = document.getElementById('owStartDate')?.value || '';
        break;
      case 2:
        this._formData.theme = document.querySelector('input[name="owTheme"]:checked')?.value || 'light';
        this._formData.notifications = document.getElementById('owNotifications')?.checked !== false;
        this._formData.defaultModule = document.getElementById('owDefaultModule')?.value || 'command-center';
        break;
    }
  },

  async _complete() {
    this._completed = true;
    localStorage.setItem('tbo_onboarding_wizard_completed', 'true');

    // Salvar preferencias
    if (this._formData.theme) {
      document.documentElement.setAttribute('data-theme', this._formData.theme);
      localStorage.setItem('tbo_theme', this._formData.theme);
    }

    // Salvar perfil no Supabase
    if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getClient()) {
      try {
        const client = TBO_SUPABASE.getClient();
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          await client.from('profiles').upsert({
            id: user.id,
            full_name: this._formData.name || undefined,
            cargo: this._formData.cargo || undefined,
            department: this._formData.department || undefined,
            document_cnpj: this._formData.cnpj || undefined,
            contract_type: this._formData.contractType || undefined,
            start_date: this._formData.startDate || undefined,
            onboarding_wizard_completed: true,
            first_login_completed: true
          }, { onConflict: 'id' });
        }
      } catch (e) {
        console.warn('[Onboarding Wizard] Erro ao salvar perfil:', e.message);
      }
    }

    this._rerender();

    // Redirecionar apos 2s
    setTimeout(() => {
      if (typeof TBO_ROUTER !== 'undefined') {
        TBO_ROUTER.navigate(this._formData.defaultModule || 'command-center');
      }
    }, 2000);
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
