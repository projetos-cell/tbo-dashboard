/**
 * TBO OS — Block Drag Manager
 *
 * Gerencia drag & drop de blocos usando HTML5 Drag API.
 * O drag handle (.be-block-handle) e o ponto de inicio.
 * Mostra indicador de insercao entre blocos durante o arraste.
 *
 * Uso:
 *   BlockDragManager.bind(containerEl)
 *   BlockDragManager.unbind()
 */

const BlockDragManager = (() => {
  'use strict';

  let _containerEl = null;
  let _draggedBlockId = null;
  let _indicatorEl = null;
  let _dropTargetBlockId = null;
  let _dropPosition = null; // 'before' | 'after'

  // ── Bind / Unbind ──────────────────────────────────────────────────────

  function bind(containerEl) {
    if (_containerEl) unbind();
    _containerEl = containerEl;

    _containerEl.addEventListener('dragstart', _onDragStart);
    _containerEl.addEventListener('dragover', _onDragOver);
    _containerEl.addEventListener('dragleave', _onDragLeave);
    _containerEl.addEventListener('drop', _onDrop);
    _containerEl.addEventListener('dragend', _onDragEnd);
  }

  function unbind() {
    if (_containerEl) {
      _containerEl.removeEventListener('dragstart', _onDragStart);
      _containerEl.removeEventListener('dragover', _onDragOver);
      _containerEl.removeEventListener('dragleave', _onDragLeave);
      _containerEl.removeEventListener('drop', _onDrop);
      _containerEl.removeEventListener('dragend', _onDragEnd);
    }
    _removeIndicator();
    _containerEl = null;
  }

  // ── Drag events ────────────────────────────────────────────────────────

  function _onDragStart(e) {
    const handle = e.target.closest('.be-block-handle');
    if (!handle) return;

    const blockEl = handle.closest('[data-block-id]');
    if (!blockEl) return;

    _draggedBlockId = blockEl.dataset.blockId;

    // Estilo do ghost
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', _draggedBlockId);

    // Adicionar classe de arraste com delay para nao afetar o ghost
    requestAnimationFrame(() => {
      blockEl.classList.add('be-block--dragging');
    });
  }

  function _onDragOver(e) {
    if (!_draggedBlockId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const blockEl = _getClosestBlockEl(e.target);
    if (!blockEl) return;

    const targetId = blockEl.dataset.blockId;
    if (targetId === _draggedBlockId) {
      _removeIndicator();
      return;
    }

    // Determinar se e antes ou depois baseado na posicao do mouse
    const rect = blockEl.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'before' : 'after';

    _dropTargetBlockId = targetId;
    _dropPosition = position;

    _showIndicator(blockEl, position);
  }

  function _onDragLeave(e) {
    // So remover se saiu do container
    if (_containerEl && !_containerEl.contains(e.relatedTarget)) {
      _removeIndicator();
      _dropTargetBlockId = null;
      _dropPosition = null;
    }
  }

  function _onDrop(e) {
    e.preventDefault();
    if (!_draggedBlockId || !_dropTargetBlockId || !_dropPosition) {
      _cleanup();
      return;
    }

    // Delegar reordenacao ao TBO_BLOCK_EDITOR
    if (typeof TBO_BLOCK_EDITOR !== 'undefined') {
      const blocks = TBO_BLOCK_EDITOR.getBlocks();
      const draggedIndex = blocks.findIndex(b => b.id === _draggedBlockId);
      const targetIndex = blocks.findIndex(b => b.id === _dropTargetBlockId);

      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        _cleanup();
        return;
      }

      // Calcular novo indice
      let newIndex = targetIndex;
      if (_dropPosition === 'after') newIndex++;
      if (draggedIndex < newIndex) newIndex--;

      // Mover bloco no array
      const [block] = blocks.splice(draggedIndex, 1);
      blocks.splice(newIndex, 0, block);

      // Atualizar posicoes
      blocks.forEach((b, i) => { b.position = i + 1; });

      // Re-render
      _reorderDOM(blocks);

      // Persistir
      _saveOrder(blocks);
    }

    _cleanup();
  }

  function _onDragEnd(e) {
    _cleanup();
  }

  // ── DOM helpers ────────────────────────────────────────────────────────

  function _getClosestBlockEl(el) {
    return el.closest ? el.closest('[data-block-id]') : null;
  }

  function _showIndicator(blockEl, position) {
    if (!_indicatorEl) {
      _indicatorEl = document.createElement('div');
      _indicatorEl.className = 'be-drag-indicator';
    }

    const rect = blockEl.getBoundingClientRect();
    const containerRect = _containerEl.getBoundingClientRect();

    _indicatorEl.style.position = 'absolute';
    _indicatorEl.style.left = '0';
    _indicatorEl.style.right = '0';
    _indicatorEl.style.height = '3px';

    if (position === 'before') {
      _indicatorEl.style.top = (blockEl.offsetTop - 1) + 'px';
    } else {
      _indicatorEl.style.top = (blockEl.offsetTop + blockEl.offsetHeight - 1) + 'px';
    }

    if (!_indicatorEl.parentNode) {
      _containerEl.style.position = 'relative';
      _containerEl.appendChild(_indicatorEl);
    }
  }

  function _removeIndicator() {
    if (_indicatorEl && _indicatorEl.parentNode) {
      _indicatorEl.remove();
    }
  }

  function _reorderDOM(blocks) {
    if (!_containerEl) return;

    // Re-render completo (mais simples e seguro)
    if (typeof BlockRenderer !== 'undefined') {
      _containerEl.innerHTML = BlockRenderer.renderBlockList(blocks);
    }
  }

  async function _saveOrder(blocks) {
    try {
      const pageId = typeof TBO_BLOCK_EDITOR !== 'undefined'
        ? TBO_BLOCK_EDITOR.getPageId()
        : null;
      if (!pageId) return;

      const orderedIds = blocks.map(b => b.id);
      await PageBlocksRepo.reorder(pageId, orderedIds);
    } catch (err) {
      console.error('[BlockDrag] Erro ao salvar ordem:', err);
    }
  }

  function _cleanup() {
    // Remover classe de arraste
    if (_draggedBlockId && _containerEl) {
      const el = _containerEl.querySelector(`[data-block-id="${_draggedBlockId}"]`);
      if (el) el.classList.remove('be-block--dragging');
    }

    _removeIndicator();
    _draggedBlockId = null;
    _dropTargetBlockId = null;
    _dropPosition = null;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  return { bind, unbind };
})();

if (typeof window !== 'undefined') {
  window.BlockDragManager = BlockDragManager;
}
