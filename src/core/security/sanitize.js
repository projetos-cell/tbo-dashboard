/**
 * TBO OS — Sanitização e Segurança (client-side)
 *
 * Centraliza todas as funções de escape/sanitização.
 * Substitui _escapeHtml() espalhado pelo código.
 */

const TBO_SANITIZE = (() => {
  const HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;'
  };

  const ENTITY_RE = /[&<>"'\/`]/g;

  return {
    /**
     * Escapa HTML para prevenir XSS
     * @param {string} str - String a escapar
     * @returns {string} String segura para innerHTML
     */
    html(str) {
      if (str == null) return '';
      return String(str).replace(ENTITY_RE, ch => HTML_ENTITIES[ch]);
    },

    /**
     * Escapa para uso em atributos HTML
     * @param {string} str
     * @returns {string}
     */
    attr(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },

    /**
     * Sanitiza URL (previne javascript: e data: protocols)
     * @param {string} url
     * @returns {string} URL segura ou string vazia
     */
    url(url) {
      if (!url) return '';
      const trimmed = String(url).trim().toLowerCase();
      if (trimmed.startsWith('javascript:') ||
          trimmed.startsWith('data:') ||
          trimmed.startsWith('vbscript:')) {
        return '';
      }
      return String(url).trim();
    },

    /**
     * Escapa para uso em SQL LIKE (client-side, para buscas)
     * @param {string} str
     * @returns {string}
     */
    sqlLike(str) {
      if (!str) return '';
      return String(str).replace(/[%_\\]/g, '\\$&');
    },

    /**
     * Remove tags HTML completamente
     * @param {string} str
     * @returns {string} Texto puro
     */
    stripTags(str) {
      if (!str) return '';
      return String(str).replace(/<[^>]*>/g, '');
    },

    /**
     * Trunca texto com segurança (não quebra entidades HTML)
     * @param {string} str
     * @param {number} maxLen
     * @param {string} suffix
     * @returns {string}
     */
    truncate(str, maxLen = 100, suffix = '...') {
      if (!str || str.length <= maxLen) return str || '';
      return str.substring(0, maxLen - suffix.length) + suffix;
    },

    /**
     * Valida e sanitiza input de email
     * @param {string} email
     * @returns {string|null} Email válido ou null
     */
    email(email) {
      if (!email) return null;
      const cleaned = String(email).trim().toLowerCase();
      const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return re.test(cleaned) ? cleaned : null;
    },

    /**
     * Sanitiza nome (remove caracteres perigosos, mantém acentos)
     * @param {string} name
     * @returns {string}
     */
    name(name) {
      if (!name) return '';
      return String(name)
        .trim()
        .replace(/[<>"'`;(){}[\]\\]/g, '')
        .substring(0, 200);
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_SANITIZE = TBO_SANITIZE;
}
