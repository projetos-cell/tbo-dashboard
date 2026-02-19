// ============================================================================
// TBO OS — Supabase Client para Modulos de Onboarding
// Reutiliza o TBO_SUPABASE existente em utils/supabase.js
// Este modulo fornece acesso simplificado ao cliente Supabase
// para os modulos de onboarding (convite, onboarding, admin, etc.)
// ============================================================================

// ── Constantes de tabelas do onboarding (evita magic strings) ─────────────────
const ONB_TABLES = {
  COLABORADORES: 'colaboradores',
  CONVITES: 'convites',
  DIAS: 'onboarding_dias',
  ATIVIDADES: 'onboarding_atividades',
  PROGRESSO: 'onboarding_progresso',
  DIAS_LIBERADOS: 'onboarding_dias_liberados',
  NOTIFICACOES: 'onboarding_notificacoes',
  CHECKINS: 'onboarding_checkins',
  VW_PROGRESSO: 'vw_progresso_onboarding'
};

// ── Constantes de status ──────────────────────────────────────────────────────
const ONB_STATUS = {
  PRE_ONBOARDING: 'pre-onboarding',
  AGUARDANDO_INICIO: 'aguardando_inicio',
  ONBOARDING: 'onboarding',
  ATIVO: 'ativo',
  INATIVO: 'inativo'
};

const ONB_TIPO = {
  COMPLETO: 'completo',
  REDUZIDO: 'reduzido'
};

// ── Sanitizacao HTML (previne XSS em dados do banco) ──────────────────────────
function _escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const TBO_ONBOARDING_DB = {
  _fallbackClient: null,

  // Retorna o cliente Supabase ja inicializado (singleton)
  getClient() {
    if (typeof TBO_SUPABASE !== 'undefined') {
      return TBO_SUPABASE.getClient();
    }
    // Fallback: inicializar uma unica vez (para paginas standalone como convite.html)
    if (this._fallbackClient) return this._fallbackClient;

    if (typeof supabase !== 'undefined' && supabase.createClient) {
      const url = (typeof ONBOARDING_CONFIG !== 'undefined' && ONBOARDING_CONFIG.SUPABASE_URL) || '';
      const key = (typeof ONBOARDING_CONFIG !== 'undefined' && ONBOARDING_CONFIG.SUPABASE_ANON_KEY) || '';
      if (!url || !key) {
        console.error('[TBO Onboarding] ONBOARDING_CONFIG nao encontrado. Adicione config.js antes de supabase-client.js');
        return null;
      }
      this._fallbackClient = supabase.createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      return this._fallbackClient;
    }
    console.error('[TBO Onboarding] Supabase nao disponivel');
    return null;
  },

  // Retorna a sessao atual
  async getSession() {
    const client = this.getClient();
    if (!client) return null;
    const { data: { session } } = await client.auth.getSession();
    return session;
  },

  // Retorna o colaborador logado a partir do auth.uid()
  async getColaboradorLogado() {
    try {
      const session = await this.getSession();
      if (!session) return null;

      const { data, error } = await this.getClient()
        .from('colaboradores')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error) {
        console.warn('[TBO Onboarding] Erro ao buscar colaborador:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('[TBO Onboarding] Erro ao buscar colaborador:', e);
      return null;
    }
  },

  // ── Query com timeout (previne travamentos na UI) ───────────────────────────
  async queryWithTimeout(queryFn, timeoutMs = 15000) {
    return Promise.race([
      queryFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: a requisicao demorou demais')), timeoutMs)
      )
    ]);
  },

  // ── Query com retry (backoff exponencial) ──────────────────────────────────
  async queryWithRetry(queryFn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.queryWithTimeout(queryFn);
      } catch (e) {
        lastError = e;
        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i) + Math.random() * 500;
          console.warn(`[TBO Onboarding] Retry ${i + 1}/${maxRetries} apos ${Math.round(delay)}ms:`, e.message);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }
};

// ── Validacao centralizada de inputs ─────────────────────────────────────────
const ONB_VALIDATORS = {
  email(val) {
    if (!val || typeof val !== 'string') return 'E-mail e obrigatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'E-mail invalido';
    return null;
  },
  nome(val, min = 3) {
    if (!val || typeof val !== 'string' || val.trim().length < min) return `Nome deve ter no minimo ${min} caracteres`;
    return null;
  },
  senha(val, min = 8) {
    if (!val || val.length < min) return `Senha deve ter no minimo ${min} caracteres`;
    if (!/[a-zA-Z]/.test(val)) return 'Senha deve conter pelo menos uma letra';
    if (!/[0-9]/.test(val)) return 'Senha deve conter pelo menos um numero';
    return null;
  },
  telefone(val) {
    if (!val) return null; // telefone e opcional
    const nums = val.replace(/\D/g, '');
    if (nums.length < 10 || nums.length > 11) return 'Telefone invalido (10 ou 11 digitos)';
    return null;
  },
  data(val) {
    if (!val) return 'Data e obrigatoria';
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return 'Data invalida';
    return null;
  },
  required(val, label = 'Campo') {
    if (!val || (typeof val === 'string' && !val.trim())) return `${label} e obrigatorio`;
    return null;
  }
};
