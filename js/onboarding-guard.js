// ============================================================================
// TBO OS — Onboarding Guard (Middleware de Rota)
// Verifica o status do colaborador ao carregar qualquer pagina do sistema
// e redireciona/exibe banner conforme necessario.
// Deve ser carregado APOS utils/supabase.js e utils/auth.js
// ============================================================================

const TBO_ONBOARDING_GUARD = {
  _bannerInjetado: false,
  _statusCache: null,

  // ── Verificar status do colaborador ─────────────────────────────────────────
  // Chamado apos login bem-sucedido ou ao carregar a pagina
  async verificar() {
    try {
      // Verificar se tem sessao Supabase ativa
      if (typeof TBO_SUPABASE === 'undefined') return;
      const client = TBO_SUPABASE.getClient();
      if (!client) return;

      const session = await TBO_SUPABASE.getSession();
      if (!session) return;

      // Buscar status do colaborador
      const { data: colab, error } = await client
        .from('colaboradores')
        .select('id, status, tipo_onboarding, data_inicio, nome')
        .eq('auth_user_id', session.user.id)
        .single();

      // Se nao encontrou colaborador, pode ser usuario legado — nao bloquear
      if (error || !colab) return;

      this._statusCache = colab;

      switch (colab.status) {
        case 'onboarding':
          if (colab.tipo_onboarding === 'completo') {
            // Onboarding completo: redireciona para pagina exclusiva
            this._redirecionarOnboarding();
          } else {
            // Onboarding reduzido: exibe banner persistente, nao redireciona
            this._exibirBannerReduzido(colab);
          }
          break;

        case 'aguardando_inicio':
          // Exibe pagina de espera
          this._exibirPaginaEspera(colab);
          break;

        case 'pre-onboarding':
          // Ainda nao comecou — exibir mensagem generica
          this._exibirPaginaEspera(colab);
          break;

        case 'ativo':
        case 'inativo':
          // Verificar se tem onboarding reduzido pendente
          if (colab.tipo_onboarding === 'reduzido') {
            const { data: progresso } = await client
              .from('vw_progresso_onboarding')
              .select('percentual_conclusao')
              .eq('colaborador_id', colab.id)
              .single();

            // Se nao completou 100%, exibir banner sutil
            if (progresso && progresso.percentual_conclusao < 100) {
              this._exibirBannerReduzido(colab, progresso.percentual_conclusao);
            }
          }
          break;
      }
    } catch (e) {
      // Guard nao deve impedir o uso do sistema em caso de erro
      console.warn('[TBO Onboarding Guard] Erro na verificacao:', e);
    }
  },

  // ── Redirecionar para pagina de onboarding ──────────────────────────────────
  _redirecionarOnboarding() {
    // So redirecionar se NAO estiver ja na pagina de onboarding
    if (window.location.pathname.includes('/pages/onboarding.html')) return;

    window.location.href = 'pages/onboarding.html';
  },

  // ── Exibir banner para onboarding reduzido ──────────────────────────────────
  _exibirBannerReduzido(colab, percentual) {
    if (this._bannerInjetado) return;
    this._bannerInjetado = true;

    const banner = document.createElement('div');
    banner.id = 'onboardingBannerReduzido';
    banner.style.cssText = `
      background: linear-gradient(135deg, var(--brand-orange, #E85102) 0%, var(--brand-orange-dark, #BE4202) 100%);
      color: #fff;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;

    const progressText = percentual !== undefined ? ` (${Math.round(percentual)}% concluido)` : '';

    banner.innerHTML = `
      <span>
        <strong>Onboarding pendente:</strong> Complete o onboarding rapido para liberar todos os recursos${progressText}.
      </span>
      <div style="display:flex;gap:8px;align-items:center;">
        <a href="pages/onboarding.html" style="color:#fff;background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">
          Completar agora
        </a>
        <button id="onbBannerClose" style="background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;padding:4px;font-size:18px;" title="Fechar">
          &times;
        </button>
      </div>
    `;

    // Inserir no topo do body
    document.body.insertBefore(banner, document.body.firstChild);

    // Ajustar padding do conteudo para nao ficar coberto
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
      appContainer.style.paddingTop = '44px';
    }
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.style.paddingTop = '44px';
    }

    // Fechar banner (sessao apenas — volta no proximo load)
    document.getElementById('onbBannerClose')?.addEventListener('click', () => {
      banner.remove();
      if (appContainer) appContainer.style.paddingTop = '';
      if (sidebar) sidebar.style.paddingTop = '';
      this._bannerInjetado = false;
    });
  },

  // ── Pagina de espera (aguardando inicio) ────────────────────────────────────
  _exibirPaginaEspera(colab) {
    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    const container = document.getElementById('moduleContainer') || document.getElementById('main-content');
    if (!container) return;

    const dataInicio = colab.data_inicio
      ? new Date(colab.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
      : 'em breve';

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:60vh;padding:24px;">
        <div style="text-align:center;max-width:480px;">
          <div style="font-size:64px;margin-bottom:16px;">👋</div>
          <h2 style="margin:0 0 8px;font-size:24px;color:var(--text-primary);">
            Ola, ${esc(colab.nome)}!
          </h2>
          <p style="color:var(--text-muted);font-size:16px;margin-bottom:24px;">
            Seu onboarding comeca em <strong style="color:var(--brand-orange);">${dataInicio}</strong>.
          </p>
          <p style="color:var(--text-muted);font-size:14px;">
            Nesse dia voce tera acesso a plataforma e podera iniciar suas atividades.
            Ate la, fique tranquilo(a) — estamos preparando tudo para voce!
          </p>
          <div style="margin-top:32px;padding:16px;background:var(--bg-secondary);border-radius:8px;">
            <p style="font-size:13px;color:var(--text-muted);margin:0;">
              Duvidas? Entre em contato com seu gestor ou envie um e-mail para
              <strong>rh@agenciatbo.com.br</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    // Esconder sidebar e header para dar foco na mensagem
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none';
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.style.marginLeft = '0';
  }
};
