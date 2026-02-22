/**
 * TBO OS — Block Move To Modal
 *
 * Modal para mover um bloco para outra pagina.
 * Lista paginas do space atual e permite busca.
 * Delega a acao de mover ao callback onSelect.
 */

const BlockMoveToModal = (() => {
  'use strict';

  let _el = null;
  let _isOpen = false;
  let _blockId = null;
  let _currentPageId = null;
  let _onSelect = null;
  let _pages = [];

  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function _createEl() {
    if (_el) return;
    _el = document.createElement('div');
    _el.className = 'be-moveto-overlay';
    _el.style.display = 'none';
    document.body.appendChild(_el);
  }

  function _render() {
    if (!_el) return;

    _el.innerHTML = `
      <div class="be-moveto-backdrop" data-moveto-close></div>
      <div class="be-moveto-modal">
        <div class="be-moveto-header">
          <span class="be-moveto-title">Mover bloco para</span>
          <button class="be-moveto-close" data-moveto-close>
            <i data-lucide="x" style="width:16px;height:16px"></i>
          </button>
        </div>
        <div class="be-moveto-search-wrap">
          <i data-lucide="search" class="be-moveto-search-icon"></i>
          <input type="text" class="be-moveto-search" placeholder="Buscar pagina..." data-moveto-search>
        </div>
        <div class="be-moveto-list" data-moveto-list>
          <div class="be-moveto-loading">Carregando paginas...</div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons({ root: _el });

    // Bind
    _el.querySelectorAll('[data-moveto-close]').forEach(btn => {
      btn.addEventListener('click', close);
    });

    const searchInput = _el.querySelector('[data-moveto-search]');
    if (searchInput) {
      searchInput.addEventListener('input', () => _filterPages(searchInput.value));
    }
  }

  async function _loadPages() {
    const listEl = _el.querySelector('[data-moveto-list]');
    if (!listEl) return;

    try {
      // Obter space_id da pagina atual
      const currentPage = typeof TBO_BLOCK_EDITOR !== 'undefined'
        ? TBO_BLOCK_EDITOR.blocks?.find(() => true) // qualquer bloco para confirmar que esta montado
        : null;

      // Buscar todas as paginas do espaço
      const pages = await PagesRepo.listBySpace(null); // null = todos os espacos do tenant
      _pages = (pages || []).filter(p => p.id !== _currentPageId && !p.is_deleted);

      _renderPageList(_pages);
    } catch (err) {
      console.error('[MoveToModal] Erro ao carregar paginas:', err);
      listEl.innerHTML = '<div class="be-moveto-empty">Erro ao carregar paginas</div>';
    }
  }

  function _renderPageList(pages) {
    const listEl = _el?.querySelector('[data-moveto-list]');
    if (!listEl) return;

    if (pages.length === 0) {
      listEl.innerHTML = '<div class="be-moveto-empty">Nenhuma pagina encontrada</div>';
      return;
    }

    listEl.innerHTML = pages.map(p => {
      const icon = p.icon || '📄';
      const title = p.title || 'Sem titulo';
      return `<div class="be-moveto-item" data-page-id="${_esc(p.id)}">
        <span class="be-moveto-item-icon">${icon}</span>
        <span class="be-moveto-item-title">${_esc(title)}</span>
      </div>`;
    }).join('');

    // Bind cliques
    listEl.querySelectorAll('.be-moveto-item').forEach(item => {
      item.addEventListener('click', () => {
        const pageId = item.dataset.pageId;
        close();
        if (_onSelect) _onSelect(pageId);
      });
    });
  }

  function _filterPages(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      _renderPageList(_pages);
      return;
    }
    const filtered = _pages.filter(p =>
      (p.title || '').toLowerCase().includes(q)
    );
    _renderPageList(filtered);
  }

  function open({ blockId, currentPageId, onSelect }) {
    _createEl();
    _blockId = blockId;
    _currentPageId = currentPageId;
    _onSelect = onSelect;
    _isOpen = true;

    _render();
    _el.style.display = 'flex';

    // Focus na busca
    requestAnimationFrame(() => {
      const search = _el.querySelector('[data-moveto-search]');
      if (search) search.focus();
    });

    _loadPages();
  }

  function close() {
    if (!_isOpen) return;
    _isOpen = false;
    if (_el) _el.style.display = 'none';
    _onSelect = null;
    _blockId = null;
    _pages = [];
  }

  return {
    open,
    close,
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.BlockMoveToModal = BlockMoveToModal;
}
