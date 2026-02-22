/**
 * TBO OS — Block AI Panel (Stub)
 *
 * Painel lateral stub para funcionalidades de IA.
 * "Peca a IA" e "Sugerir edicoes" abrem este painel com
 * uma textarea e botao que mostra "Em breve".
 */

const BlockAIPanel = (() => {
  'use strict';

  let _el = null;
  let _isOpen = false;
  let _blockId = null;
  let _mode = null; // 'ask' | 'suggest'

  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function _createEl() {
    if (_el) return;
    _el = document.createElement('div');
    _el.className = 'be-ai-panel';
    _el.style.display = 'none';
    document.body.appendChild(_el);
  }

  function _render() {
    if (!_el) return;

    const title = _mode === 'suggest' ? 'Sugerir edicoes' : 'Peca a IA';
    const placeholder = _mode === 'suggest'
      ? 'Descreva que tipo de edicao voce gostaria...'
      : 'Pergunte algo a IA sobre este bloco...';
    const btnLabel = _mode === 'suggest' ? 'Sugerir' : 'Gerar';

    _el.innerHTML = `
      <div class="be-ai-panel-header">
        <div class="be-ai-panel-title">
          <i data-lucide="sparkles" class="be-ai-panel-icon"></i>
          <span>${title}</span>
        </div>
        <button class="be-ai-panel-close" data-ai-close>
          <i data-lucide="x" style="width:16px;height:16px"></i>
        </button>
      </div>
      <div class="be-ai-panel-body">
        <textarea class="be-ai-textarea" placeholder="${_esc(placeholder)}" rows="4"></textarea>
        <button class="be-ai-btn" data-ai-submit>
          <i data-lucide="sparkles" style="width:14px;height:14px"></i>
          ${btnLabel}
        </button>
        <div class="be-ai-result" style="display:none"></div>
      </div>
    `;

    if (window.lucide) lucide.createIcons({ root: _el });

    // Bind
    _el.querySelector('[data-ai-close]').addEventListener('click', close);
    _el.querySelector('[data-ai-submit]').addEventListener('click', _onSubmit);
  }

  function _onSubmit() {
    const textarea = _el.querySelector('.be-ai-textarea');
    const resultEl = _el.querySelector('.be-ai-result');
    if (!textarea || !resultEl) return;

    const input = textarea.value.trim();
    if (!input) return;

    // Stub: mostrar mensagem "em breve"
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <div class="be-ai-stub">
        <i data-lucide="zap" style="width:20px;height:20px;color:var(--accent-color, #FF6B2B)"></i>
        <p><strong>Recurso em desenvolvimento</strong></p>
        <p>A integracao com IA sera disponibilizada em breve. Seu prompt foi: "${_esc(input)}"</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons({ root: resultEl });

    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.info('Em breve', 'Recursos de IA serao liberados na proxima atualizacao');
    }
  }

  function open({ blockId, block, mode }) {
    _createEl();
    _blockId = blockId;
    _mode = mode || 'ask';
    _isOpen = true;

    _render();
    _el.style.display = 'flex';

    // Focus na textarea
    requestAnimationFrame(() => {
      const textarea = _el.querySelector('.be-ai-textarea');
      if (textarea) textarea.focus();
    });
  }

  function close() {
    if (!_isOpen) return;
    _isOpen = false;
    if (_el) _el.style.display = 'none';
    _blockId = null;
    _mode = null;
  }

  return {
    open,
    close,
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.BlockAIPanel = BlockAIPanel;
}
