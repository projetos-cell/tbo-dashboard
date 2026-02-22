/**
 * TBO OS — Block Renderer
 *
 * Renderiza blocos como HTML para o editor.
 * Cada tipo de bloco tem seu proprio template.
 * Nao faz bind de eventos — isso e responsabilidade do TBO_BLOCK_EDITOR.
 */

const BlockRenderer = (() => {
  'use strict';

  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Mapa de tipos → config ──────────────────────────────────────────────

  const BLOCK_TYPES = {
    text:           { tag: 'div',  className: 'be-text',         placeholder: 'Digite \'/\' para comandos...' },
    heading_1:      { tag: 'h1',   className: 'be-heading-1',    placeholder: 'Titulo 1' },
    heading_2:      { tag: 'h2',   className: 'be-heading-2',    placeholder: 'Titulo 2' },
    heading_3:      { tag: 'h3',   className: 'be-heading-3',    placeholder: 'Titulo 3' },
    bulleted_list:  { tag: 'div',  className: 'be-bulleted-list', placeholder: 'Item da lista' },
    numbered_list:  { tag: 'div',  className: 'be-numbered-list', placeholder: 'Item da lista' },
    todo:           { tag: 'div',  className: 'be-todo',          placeholder: 'Tarefa' },
    toggle:         { tag: 'div',  className: 'be-toggle',        placeholder: 'Clique para expandir' },
    code:           { tag: 'pre',  className: 'be-code',          placeholder: 'Codigo...' },
    quote:          { tag: 'blockquote', className: 'be-quote',   placeholder: 'Citacao...' },
    callout:        { tag: 'div',  className: 'be-callout',       placeholder: 'Destaque...' },
    divider:        { tag: 'hr',   className: 'be-divider',       placeholder: '' },
    page_link:      { tag: 'div',  className: 'be-page-link',     placeholder: '' },
    columns_2:      { tag: 'div',  className: 'be-columns be-columns-2', placeholder: '' },
    columns_3:      { tag: 'div',  className: 'be-columns be-columns-3', placeholder: '' },
    columns_4:      { tag: 'div',  className: 'be-columns be-columns-4', placeholder: '' },
    columns_5:      { tag: 'div',  className: 'be-columns be-columns-5', placeholder: '' }
  };

  // ── Render individual ─────────────────────────────────────────────────

  function renderBlock(block) {
    const config = BLOCK_TYPES[block.type] || BLOCK_TYPES.text;
    const text = block.content?.text || '';
    const props = block.props || {};

    // Data attributes para cores
    const textColor = props.textColor ? ` data-text-color="${_esc(props.textColor)}"` : '';
    const bgColor = props.bgColor ? ` data-bg-color="${_esc(props.bgColor)}"` : '';

    // Wrapper do bloco
    let html = `<div class="be-block be-block--${_esc(block.type)}"
      data-block-id="${_esc(block.id)}"
      data-block-type="${_esc(block.type)}"
      ${textColor}${bgColor}>`;

    // Handle de arraste (visivel no hover)
    html += `<div class="be-block-gutter">
      <button class="be-block-handle" draggable="true" title="Arraste para mover" tabindex="-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
          <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
          <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
        </svg>
      </button>
      <button class="be-block-menu-trigger" title="Menu do bloco" tabindex="-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
    </div>`;

    // Conteudo do bloco — depende do tipo
    html += `<div class="be-block-body">`;
    html += _renderBlockContent(block, config, text, props);
    html += `</div>`;

    html += `</div>`;
    return html;
  }

  function _renderBlockContent(block, config, text, props) {
    switch (block.type) {
    case 'todo':
      return _renderTodo(block, text, props);
    case 'toggle':
      return _renderToggle(block, text, props);
    case 'bulleted_list':
      return _renderBulletedList(block, text, config);
    case 'numbered_list':
      return _renderNumberedList(block, text, config);
    case 'code':
      return _renderCode(block, text, props);
    case 'callout':
      return _renderCallout(block, text, props);
    case 'divider':
      return '<hr class="be-divider-line">';
    case 'columns_2':
    case 'columns_3':
    case 'columns_4':
    case 'columns_5':
      return _renderColumns(block);
    default:
      return _renderEditable(block, config, text);
    }
  }

  function _renderEditable(block, config, text) {
    const tag = (config.tag === 'blockquote') ? 'blockquote' : config.tag;
    const isBlock = ['h1', 'h2', 'h3', 'blockquote'].includes(tag);
    const el = isBlock ? tag : 'div';
    return `<${el} class="be-block-content ${config.className}"
      contenteditable="true"
      data-placeholder="${_esc(config.placeholder)}"
      spellcheck="true">${_esc(text)}</${el}>`;
  }

  function _renderTodo(block, text, props) {
    const checked = props.checked ? 'checked' : '';
    const checkedClass = props.checked ? ' be-todo--checked' : '';
    return `<div class="be-todo-wrap${checkedClass}">
      <input type="checkbox" class="be-todo-checkbox" ${checked} data-block-checkbox="${_esc(block.id)}">
      <div class="be-block-content be-todo-text"
        contenteditable="true"
        data-placeholder="Tarefa"
        spellcheck="true">${_esc(text)}</div>
    </div>`;
  }

  function _renderToggle(block, text, props) {
    const open = props.open ? ' open' : '';
    return `<details class="be-toggle-details"${open}>
      <summary class="be-toggle-summary">
        <div class="be-block-content be-toggle-text"
          contenteditable="true"
          data-placeholder="Clique para expandir"
          spellcheck="true">${_esc(text)}</div>
      </summary>
      <div class="be-toggle-children" data-toggle-children="${_esc(block.id)}"></div>
    </details>`;
  }

  function _renderBulletedList(block, text, config) {
    return `<div class="be-list-wrap be-bulleted-wrap">
      <span class="be-list-bullet">&bull;</span>
      <div class="be-block-content be-bulleted-text"
        contenteditable="true"
        data-placeholder="${_esc(config.placeholder)}"
        spellcheck="true">${_esc(text)}</div>
    </div>`;
  }

  function _renderNumberedList(block, text, config) {
    return `<div class="be-list-wrap be-numbered-wrap">
      <span class="be-list-number" data-block-number="${_esc(block.id)}">1.</span>
      <div class="be-block-content be-numbered-text"
        contenteditable="true"
        data-placeholder="${_esc(config.placeholder)}"
        spellcheck="true">${_esc(text)}</div>
    </div>`;
  }

  function _renderCode(block, text, props) {
    const lang = props.language || '';
    return `<div class="be-code-wrap">
      <div class="be-code-header">
        <select class="be-code-lang" data-block-lang="${_esc(block.id)}">
          <option value="">Linguagem</option>
          <option value="javascript"${lang === 'javascript' ? ' selected' : ''}>JavaScript</option>
          <option value="python"${lang === 'python' ? ' selected' : ''}>Python</option>
          <option value="html"${lang === 'html' ? ' selected' : ''}>HTML</option>
          <option value="css"${lang === 'css' ? ' selected' : ''}>CSS</option>
          <option value="sql"${lang === 'sql' ? ' selected' : ''}>SQL</option>
          <option value="json"${lang === 'json' ? ' selected' : ''}>JSON</option>
          <option value="bash"${lang === 'bash' ? ' selected' : ''}>Bash</option>
          <option value="typescript"${lang === 'typescript' ? ' selected' : ''}>TypeScript</option>
        </select>
      </div>
      <pre class="be-code-block"><code class="be-block-content be-code-text"
        contenteditable="true"
        data-placeholder="Codigo..."
        spellcheck="false">${_esc(text)}</code></pre>
    </div>`;
  }

  function _renderCallout(block, text, props) {
    const emoji = props.emoji || '💡';
    return `<div class="be-callout-wrap">
      <span class="be-callout-emoji" data-block-emoji="${_esc(block.id)}">${emoji}</span>
      <div class="be-block-content be-callout-text"
        contenteditable="true"
        data-placeholder="Destaque..."
        spellcheck="true">${_esc(text)}</div>
    </div>`;
  }

  function _renderColumns(block) {
    const colCount = parseInt(block.type.replace('columns_', ''), 10) || 2;
    let html = '<div class="be-columns-grid" style="grid-template-columns: repeat(' + colCount + ', 1fr)">';
    for (let i = 0; i < colCount; i++) {
      html += `<div class="be-column" data-column-index="${i}">
        <div class="be-column-placeholder">Coluna ${i + 1}</div>
      </div>`;
    }
    html += '</div>';
    return html;
  }

  // ── Render lista ──────────────────────────────────────────────────────

  function renderBlockList(blocks) {
    if (!blocks || blocks.length === 0) {
      return '<div class="be-empty">Nenhum bloco</div>';
    }

    // Numerar listas numeradas sequencialmente
    let numCounter = 0;
    return blocks.map(block => {
      if (block.type === 'numbered_list') {
        numCounter++;
      } else {
        numCounter = 0;
      }
      const html = renderBlock(block);
      // Injetar numero correto para listas numeradas
      if (block.type === 'numbered_list' && numCounter > 0) {
        return html.replace(
          `data-block-number="${_esc(block.id)}">1.`,
          `data-block-number="${_esc(block.id)}">${numCounter}.`
        );
      }
      return html;
    }).join('');
  }

  // ── API ───────────────────────────────────────────────────────────────

  return {
    renderBlock,
    renderBlockList,
    BLOCK_TYPES,
    _esc
  };
})();

if (typeof window !== 'undefined') {
  window.BlockRenderer = BlockRenderer;
}
