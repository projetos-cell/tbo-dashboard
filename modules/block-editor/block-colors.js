/**
 * TBO OS — Block Colors
 *
 * Submenu de cores para blocos: 10 cores de texto + 10 cores de fundo.
 * Renderiza o picker como HTML que o BlockContextMenu exibe no submenu.
 * O BlockContextMenu lida com o bind de eventos.
 */

const BlockColors = (() => {
  'use strict';

  // ── Paleta de cores (estilo Notion) ────────────────────────────────────

  const TEXT_COLORS = [
    { name: 'default', label: 'Padrao',   hex: 'inherit' },
    { name: 'gray',    label: 'Cinza',    hex: '#9B9A97' },
    { name: 'brown',   label: 'Marrom',   hex: '#64473A' },
    { name: 'orange',  label: 'Laranja',  hex: '#D9730D' },
    { name: 'yellow',  label: 'Amarelo',  hex: '#DFAB01' },
    { name: 'green',   label: 'Verde',    hex: '#0F7B6C' },
    { name: 'blue',    label: 'Azul',     hex: '#0B6E99' },
    { name: 'purple',  label: 'Roxo',     hex: '#6940A5' },
    { name: 'pink',    label: 'Rosa',     hex: '#AD1A72' },
    { name: 'red',     label: 'Vermelho', hex: '#E03E3E' }
  ];

  const BG_COLORS = [
    { name: 'default', label: 'Padrao',   hex: 'transparent' },
    { name: 'gray',    label: 'Cinza',    hex: '#EBECED' },
    { name: 'brown',   label: 'Marrom',   hex: '#E9E5E3' },
    { name: 'orange',  label: 'Laranja',  hex: '#FAEBDD' },
    { name: 'yellow',  label: 'Amarelo',  hex: '#FBF3DB' },
    { name: 'green',   label: 'Verde',    hex: '#DDEDEA' },
    { name: 'blue',    label: 'Azul',     hex: '#DDEBF1' },
    { name: 'purple',  label: 'Roxo',     hex: '#EAE4F2' },
    { name: 'pink',    label: 'Rosa',     hex: '#F4DFEB' },
    { name: 'red',     label: 'Vermelho', hex: '#FBE4E4' }
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  function renderPicker(currentTextColor, currentBgColor) {
    let html = '';

    // Cores de texto
    html += '<div class="be-colors-section">';
    html += '<div class="be-colors-title">Cor do texto</div>';
    html += '<div class="be-colors-grid">';
    TEXT_COLORS.forEach(c => {
      const active = (c.name === (currentTextColor || 'default')) ? ' be-color--active' : '';
      const swatch = c.name === 'default'
        ? '<span class="be-color-swatch be-color-swatch--default">A</span>'
        : `<span class="be-color-swatch" style="color:${c.hex}">A</span>`;
      html += `<div class="be-color-item${active}"
        data-color-action="true"
        data-color-type="text"
        data-color-name="${c.name}"
        title="${c.label}">
        ${swatch}
      </div>`;
    });
    html += '</div></div>';

    // Cores de fundo
    html += '<div class="be-colors-section">';
    html += '<div class="be-colors-title">Cor de fundo</div>';
    html += '<div class="be-colors-grid">';
    BG_COLORS.forEach(c => {
      const active = (c.name === (currentBgColor || 'default')) ? ' be-color--active' : '';
      const bg = c.name === 'default' ? 'transparent' : c.hex;
      const border = c.name === 'default' ? 'border:1px dashed var(--border-secondary,#d0d0d0);' : '';
      html += `<div class="be-color-item${active}"
        data-color-action="true"
        data-color-type="bg"
        data-color-name="${c.name}"
        title="${c.label}">
        <span class="be-color-swatch be-color-swatch--bg" style="background:${bg};${border}"></span>
      </div>`;
    });
    html += '</div></div>';

    return html;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  return {
    renderPicker,
    TEXT_COLORS,
    BG_COLORS
  };
})();

if (typeof window !== 'undefined') {
  window.BlockColors = BlockColors;
}
