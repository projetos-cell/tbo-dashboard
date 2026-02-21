/**
 * TBO OS — Delete Confirm Modal
 *
 * Modal de confirmação dupla para exclusão de workspace.
 * Exige que o usuário digite o nome exato do espaço para confirmar.
 * Substitui window.prompt() com UX nativa e bonita.
 *
 * API:
 *   TBO_DELETE_CONFIRM.open({ name, onConfirm, onCancel })
 *   TBO_DELETE_CONFIRM.close()
 *   TBO_DELETE_CONFIRM.isOpen
 */

const TBO_DELETE_CONFIRM = (() => {
  'use strict';

  let _overlay = null;
  let _isOpen = false;
  let _triggerEl = null;
  let _spaceName = '';
  let _onConfirmCb = null;
  let _onCancelCb = null;

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  // ── Build HTML ──────────────────────────────────────────────────────────

  function _buildHTML() {
    return `
      <div class="dcm-overlay" role="alertdialog" aria-modal="true" aria-label="Confirmar exclusão">
        <div class="dcm-backdrop"></div>
        <div class="dcm-container">
          <div class="dcm-header">
            <div class="dcm-header-icon">
              <i data-lucide="triangle-alert"></i>
            </div>
            <div class="dcm-title">Excluir espaço de equipe</div>
          </div>

          <div class="dcm-body">
            <p class="dcm-description">
              Você está prestes a excluir o espaço <strong>"${_esc(_spaceName)}"</strong>.
              Todas as páginas, membros e configurações serão removidos.
            </p>

            <div class="dcm-warning">
              <i data-lucide="alert-circle"></i>
              <span class="dcm-warning-text">
                Esta ação não pode ser desfeita. O espaço ficará inacessível imediatamente.
              </span>
            </div>

            <label class="dcm-input-label">
              Para confirmar, digite <code>${_esc(_spaceName)}</code> abaixo:
            </label>
            <input type="text" class="dcm-input" data-dcm-input
              placeholder="Digite o nome do espaço"
              autocomplete="off" spellcheck="false" />
          </div>

          <div class="dcm-footer">
            <button class="dcm-btn" data-dcm-cancel>Cancelar</button>
            <button class="dcm-btn dcm-btn--danger" data-dcm-confirm disabled>
              Excluir permanentemente
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Events ──────────────────────────────────────────────────────────────

  function _onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
      if (typeof _onCancelCb === 'function') _onCancelCb();
    }
  }

  function _bindEvents() {
    if (!_overlay) return;

    // Backdrop
    const backdrop = _overlay.querySelector('.dcm-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        close();
        if (typeof _onCancelCb === 'function') _onCancelCb();
      });
    }

    // Input — habilitar botão quando nome confere
    const input = _overlay.querySelector('[data-dcm-input]');
    const confirmBtn = _overlay.querySelector('[data-dcm-confirm]');

    if (input && confirmBtn) {
      input.addEventListener('input', () => {
        const matches = input.value.trim() === _spaceName;
        confirmBtn.disabled = !matches;
        input.classList.remove('dcm-input--error');
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (input.value.trim() === _spaceName) {
            _handleConfirm();
          } else {
            input.classList.add('dcm-input--error');
            setTimeout(() => input.classList.remove('dcm-input--error'), 400);
          }
        }
      });
    }

    // Botão confirmar
    if (confirmBtn) {
      confirmBtn.addEventListener('click', _handleConfirm);
    }

    // Botão cancelar
    const cancelBtn = _overlay.querySelector('[data-dcm-cancel]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        close();
        if (typeof _onCancelCb === 'function') _onCancelCb();
      });
    }

    // ESC
    document.addEventListener('keydown', _onKeydown);
  }

  function _handleConfirm() {
    const cb = _onConfirmCb;
    close();
    if (typeof cb === 'function') cb();
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  /**
   * Abre o modal de confirmação de exclusão
   * @param {Object} opts
   * @param {string} opts.name - Nome do espaço (deve ser digitado para confirmar)
   * @param {Function} opts.onConfirm - Callback ao confirmar
   * @param {Function} opts.onCancel - Callback ao cancelar
   */
  function open(opts = {}) {
    if (_isOpen) close();

    _spaceName = opts.name || '';
    _onConfirmCb = opts.onConfirm || null;
    _onCancelCb = opts.onCancel || null;
    _triggerEl = document.activeElement;

    // Criar DOM
    const wrapper = document.createElement('div');
    wrapper.id = 'dcmOverlayRoot';
    wrapper.innerHTML = _buildHTML();
    document.body.appendChild(wrapper);

    _overlay = wrapper.querySelector('.dcm-overlay');
    _isOpen = true;

    // Ícones Lucide
    if (window.lucide) lucide.createIcons({ root: _overlay });

    // Bind events
    _bindEvents();

    // Block body scroll
    document.body.style.overflow = 'hidden';

    // Animar entrada
    requestAnimationFrame(() => {
      _overlay.classList.add('dcm-overlay--open');
      // Focar no input
      setTimeout(() => {
        const input = _overlay?.querySelector('[data-dcm-input]');
        if (input) input.focus();
      }, 50);
    });
  }

  function close() {
    if (!_isOpen || !_overlay) return;

    document.removeEventListener('keydown', _onKeydown);
    document.body.style.overflow = '';

    _overlay.classList.remove('dcm-overlay--open');

    setTimeout(() => {
      const root = document.getElementById('dcmOverlayRoot');
      if (root) root.remove();
      _overlay = null;
      _isOpen = false;
      _spaceName = '';
      _onConfirmCb = null;
      _onCancelCb = null;

      // Devolver foco
      if (_triggerEl && _triggerEl.isConnected) {
        _triggerEl.focus();
        _triggerEl = null;
      }
    }, 150);
  }

  return {
    open,
    close,
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_DELETE_CONFIRM = TBO_DELETE_CONFIRM;
}
