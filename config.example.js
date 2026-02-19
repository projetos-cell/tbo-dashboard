// ============================================================================
// TBO OS — Configuracao de Variaveis de Ambiente
// Copie este arquivo para config.js e preencha com suas credenciais
// NUNCA commite o config.js — ele esta no .gitignore
// ============================================================================

// (!) O TBO_CONFIG completo esta em config.js
// Aqui so mostramos as credenciais que precisam ser preenchidas

const ONBOARDING_CONFIG = {
  SUPABASE_URL: 'https://seu-projeto.supabase.co',
  SUPABASE_ANON_KEY: 'sua-anon-key'
};

// No TBO_CONFIG (dentro do arquivo completo config.js), as seguintes chaves
// tambem contem credenciais:
// - TBO_CONFIG.app.* (nao sensivel)
// - CLAUDE_API_KEY e OPENAI_API_KEY (usadas via utils/api.js)
