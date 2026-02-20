/**
 * TBO OS — Skeleton Loading System
 *
 * Gera placeholders animados enquanto dados carregam.
 * Uso: TBO_SKELETON.card(), .table(rows), .kpiGrid(n), .text(lines), .render(container, type)
 */

const TBO_SKELETON = (() => {
  /**
   * Gera linhas de texto skeleton
   * @param {number} lines - Número de linhas
   * @param {object} opts - { widths: ['80%','60%','90%'] }
   * @returns {string} HTML
   */
  function text(lines = 3, opts = {}) {
    const widths = opts.widths || [];
    const defaultWidths = ['95%', '80%', '65%', '90%', '50%', '70%'];
    return Array.from({ length: lines }, (_, i) => {
      const w = widths[i] || defaultWidths[i % defaultWidths.length];
      return `<div class="skeleton skeleton-text" style="width:${w}"></div>`;
    }).join('');
  }

  /**
   * Gera um card skeleton
   * @param {object} opts - { hasAvatar, lines, hasImage }
   * @returns {string} HTML
   */
  function card(opts = {}) {
    const { hasAvatar = true, lines = 3, hasImage = false } = opts;
    let html = '<div class="skeleton-card">';

    // Header com avatar
    html += '<div class="skeleton-header">';
    if (hasAvatar) {
      html += '<div class="skeleton skeleton-circle" style="width:36px;height:36px;flex-shrink:0"></div>';
    }
    html += '<div style="flex:1;display:flex;flex-direction:column;gap:6px">';
    html += '<div class="skeleton skeleton-text" style="width:50%"></div>';
    html += '<div class="skeleton skeleton-text--sm skeleton-text" style="width:30%"></div>';
    html += '</div></div>';

    // Imagem placeholder
    if (hasImage) {
      html += '<div class="skeleton skeleton-rect" style="width:100%;height:120px"></div>';
    }

    // Body
    html += '<div class="skeleton-body">';
    html += text(lines);
    html += '</div></div>';

    return html;
  }

  /**
   * Gera grid de cards skeleton
   * @param {number} count - Número de cards
   * @param {object} opts - Opções do card
   * @returns {string} HTML
   */
  function cardGrid(count = 3, opts = {}) {
    return `<div class="skeleton-grid">${
      Array.from({ length: count }, () => card(opts)).join('')
    }</div>`;
  }

  /**
   * Gera tabela skeleton
   * @param {number} rows - Número de linhas
   * @param {number} cols - Número de colunas
   * @returns {string} HTML
   */
  function table(rows = 5, cols = 4) {
    const colWidths = ['20%', '30%', '25%', '15%', '10%'];
    let html = '<div class="skeleton-table">';

    // Header
    html += '<div class="skeleton-table-row">';
    for (let c = 0; c < cols; c++) {
      html += `<div class="skeleton-table-cell"><div class="skeleton skeleton-text" style="width:${colWidths[c % colWidths.length]}"></div></div>`;
    }
    html += '</div>';

    // Rows
    for (let r = 0; r < rows; r++) {
      html += '<div class="skeleton-table-row">';
      for (let c = 0; c < cols; c++) {
        const w = Math.floor(Math.random() * 40) + 40; // 40-80%
        html += `<div class="skeleton-table-cell"><div class="skeleton skeleton-text" style="width:${w}%"></div></div>`;
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Gera KPIs skeleton
   * @param {number} count - Número de KPIs
   * @returns {string} HTML
   */
  function kpiGrid(count = 4) {
    const kpis = Array.from({ length: count }, () => `
      <div class="skeleton-kpi">
        <div class="skeleton skeleton-text--sm skeleton-text" style="width:45%"></div>
        <div class="skeleton skeleton-text--lg skeleton-text" style="width:60%"></div>
        <div class="skeleton skeleton-text--sm skeleton-text" style="width:35%"></div>
      </div>
    `).join('');

    return `<div class="skeleton-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">${kpis}</div>`;
  }

  /**
   * Renderiza skeleton em um container
   * @param {HTMLElement|string} container - Elemento ou seletor
   * @param {string} type - 'card' | 'table' | 'kpi' | 'text' | 'cardGrid'
   * @param {object} opts - Opções do tipo
   */
  function render(container, type = 'card', opts = {}) {
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    if (!el) return;

    const generators = {
      text: () => text(opts.lines || 3, opts),
      card: () => card(opts),
      cardGrid: () => cardGrid(opts.count || 3, opts),
      table: () => table(opts.rows || 5, opts.cols || 4),
      kpi: () => kpiGrid(opts.count || 4)
    };

    const generator = generators[type] || generators.card;
    el.innerHTML = generator();
  }

  /**
   * Remove skeleton de um container (substitui por conteúdo)
   * @param {HTMLElement|string} container
   */
  function clear(container) {
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    if (!el) return;
    el.querySelectorAll('.skeleton, .skeleton-card, .skeleton-table, .skeleton-kpi, .skeleton-grid').forEach(s => s.remove());
  }

  return { text, card, cardGrid, table, kpiGrid, render, clear };
})();

if (typeof window !== 'undefined') {
  window.TBO_SKELETON = TBO_SKELETON;
}
