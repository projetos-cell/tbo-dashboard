/**
 * TBO OS — Shared Utils (helpers leves)
 *
 * Apenas funções puras e utilitárias.
 * NÃO é dumping ground — cada helper tem propósito claro.
 */

const TBO_UTILS = {
  /**
   * Debounce
   */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Throttle
   */
  throttle(fn, limit = 200) {
    let inThrottle = false;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Deep clone (estrutural)
   */
  deepClone(obj) {
    return structuredClone ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
  },

  /**
   * Formata data BR
   */
  formatDate(date, options = {}) {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options
    }).format(new Date(date));
  },

  /**
   * Formata moeda BRL
   */
  formatCurrency(value) {
    if (value == null || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Gera ID único simples
   */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Capitaliza primeira letra
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Agrupa array por chave
   */
  groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const group = typeof key === 'function' ? key(item) : item[key];
      (acc[group] = acc[group] || []).push(item);
      return acc;
    }, {});
  },

  /**
   * Sleep
   */
  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  },

  /**
   * Normaliza string (remove acentos, lowercase)
   */
  normalize(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  },

  /**
   * Verifica se string é UUID
   */
  isUUID(str) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  }
};

if (typeof window !== 'undefined') {
  window.TBO_UTILS = TBO_UTILS;
}
