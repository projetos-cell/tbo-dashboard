/**
 * TBO OS — Feedback Provider
 *
 * Camada unificada de feedback:
 * - Loading states com skeleton automático
 * - Confirmação de ações
 * - Progress bar global
 * - Integração com TBO_TOAST existente
 */

const TBO_FEEDBACK = (() => {
  let _progressBar = null;
  let _progressTimer = null;

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /**
   * Cria/retorna barra de progresso global (no topo)
   */
  function _getProgressBar() {
    if (_progressBar) return _progressBar;

    _progressBar = document.createElement('div');
    _progressBar.className = 'fb-progress';
    _progressBar.innerHTML = '<div class="fb-progress-bar"></div>';
    document.body.appendChild(_progressBar);
    return _progressBar;
  }

  return {
    /**
     * Mostra progresso global (barra no topo)
     * Simula progresso se duration fornecido
     * @param {object} opts - { duration?, value? }
     */
    startProgress(opts = {}) {
      const bar = _getProgressBar();
      const inner = bar.querySelector('.fb-progress-bar');
      bar.classList.add('fb-progress--active');

      if (opts.value != null) {
        // Valor fixo (0-100)
        inner.style.transition = 'width 0.3s ease';
        inner.style.width = `${opts.value}%`;
      } else {
        // Simulação: cresce rápido até 80%, depois lento
        inner.style.transition = 'none';
        inner.style.width = '0%';
        requestAnimationFrame(() => {
          inner.style.transition = 'width 0.8s ease-out';
          inner.style.width = '30%';
        });

        clearTimeout(_progressTimer);
        _progressTimer = setTimeout(() => {
          inner.style.transition = 'width 3s ease-out';
          inner.style.width = '80%';
        }, 800);
      }
    },

    /**
     * Completa o progresso (chega a 100% e some)
     */
    endProgress() {
      const bar = _getProgressBar();
      const inner = bar.querySelector('.fb-progress-bar');
      clearTimeout(_progressTimer);

      inner.style.transition = 'width 0.2s ease';
      inner.style.width = '100%';

      setTimeout(() => {
        bar.classList.remove('fb-progress--active');
        inner.style.width = '0%';
      }, 400);
    },

    /**
     * Toast de sucesso para ações CRUD
     * @param {string} action - 'criado' | 'atualizado' | 'removido'
     * @param {string} entity - Nome da entidade
     */
    actionSuccess(action, entity) {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Sucesso', `${_escHtml(entity)} ${_escHtml(action)} com sucesso`);
      }
    },

    /**
     * Toast de erro para ações CRUD
     * @param {string} action - 'criar' | 'atualizar' | 'remover'
     * @param {string} entity - Nome da entidade
     * @param {Error} err - Erro original
     */
    actionError(action, entity, err) {
      const msg = err?.message || 'Erro desconhecido';
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', `Falha ao ${_escHtml(action)} ${_escHtml(entity)}: ${_escHtml(msg)}`);
      }
      if (typeof TBO_LOGGER !== 'undefined') {
        TBO_LOGGER.error(`Falha ao ${action} ${entity}`, { error: msg });
      }
    },

    /**
     * Mostra diálogo de confirmação
     * @param {string} message - Mensagem de confirmação
     * @param {object} opts - { title?, confirmLabel?, cancelLabel?, danger? }
     * @returns {Promise<boolean>}
     */
    confirm(message, opts = {}) {
      return new Promise((resolve) => {
        const {
          title = 'Confirmar',
          confirmLabel = 'Confirmar',
          cancelLabel = 'Cancelar',
          danger = false
        } = opts;

        const overlay = document.createElement('div');
        overlay.className = 'fb-confirm-overlay';
        overlay.innerHTML = `
          <div class="fb-confirm-modal" role="alertdialog" aria-modal="true" aria-label="${_escHtml(title)}">
            <div class="fb-confirm-title">${_escHtml(title)}</div>
            <div class="fb-confirm-message">${_escHtml(message)}</div>
            <div class="fb-confirm-actions">
              <button class="fb-confirm-btn fb-confirm-cancel">${_escHtml(cancelLabel)}</button>
              <button class="fb-confirm-btn fb-confirm-ok${danger ? ' fb-confirm-danger' : ''}">${_escHtml(confirmLabel)}</button>
            </div>
          </div>
        `;

        function _cleanup(result) {
          overlay.classList.remove('fb-confirm-overlay--visible');
          setTimeout(() => overlay.remove(), 150);
          resolve(result);
        }

        overlay.querySelector('.fb-confirm-cancel').addEventListener('click', () => _cleanup(false));
        overlay.querySelector('.fb-confirm-ok').addEventListener('click', () => _cleanup(true));
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) _cleanup(false);
        });
        overlay.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') _cleanup(false);
        });

        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
          overlay.classList.add('fb-confirm-overlay--visible');
          overlay.querySelector('.fb-confirm-ok').focus();
        });
      });
    },

    /**
     * Loading wrapper: mostra skeleton, executa fn, mostra resultado
     * @param {HTMLElement|string} container
     * @param {string} skeletonType - 'card' | 'table' | 'kpi'
     * @param {function} fn - Async function que carrega dados
     * @param {object} opts - Opções do skeleton
     */
    async withLoading(container, skeletonType, fn, opts = {}) {
      const el = typeof container === 'string'
        ? document.querySelector(container)
        : container;
      if (!el) return undefined;

      // Mostrar skeleton
      if (typeof TBO_SKELETON !== 'undefined') {
        TBO_SKELETON.render(el, skeletonType, opts);
      }

      try {
        const result = await fn();
        return result;
      } catch (err) {
        el.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted)">
          <p>Erro ao carregar dados</p>
        </div>`;
        throw err;
      }
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_FEEDBACK = TBO_FEEDBACK;
}
