/**
 * TBO OS — Block Editor (Notion-style)
 *
 * Orquestrador principal do editor de blocos.
 * Gerencia estado, eventos de teclado, autosave e integracao
 * com SlashCommandPalette, BlockContextMenu, BlockDragManager etc.
 *
 * API:
 *   TBO_BLOCK_EDITOR.mount(containerEl, pageId, page)
 *   TBO_BLOCK_EDITOR.unmount()
 */

const TBO_BLOCK_EDITOR = (() => {
  'use strict';

  // ── Estado ──────────────────────────────────────────────────────────────

  let _containerEl = null;
  let _pageId = null;
  let _page = null;
  let _blocks = [];
  let _mounted = false;
  let _saveTimers = {};         // blockId → timeout
  let _saving = false;
  let _lastSavedAt = null;
  let _statusInterval = null;
  let _focusedBlockId = null;

  // ── Undo / Redo ────────────────────────────────────────────────────────
  const MAX_HISTORY = 50;
  let _undoStack = [];   // array of snapshots
  let _redoStack = [];
  let _undoTimer = null; // debounce para agrupar edições rápidas

  function _snapshotBlocks() {
    return _blocks.map(b => ({
      id: b.id,
      type: b.type,
      content: JSON.parse(JSON.stringify(b.content)),
      props: JSON.parse(JSON.stringify(b.props)),
      position: b.position
    }));
  }

  function _pushUndo() {
    _undoStack.push(_snapshotBlocks());
    if (_undoStack.length > MAX_HISTORY) _undoStack.shift();
    _redoStack = []; // limpar redo ao fazer nova ação
  }

  function _pushUndoDebounced() {
    if (_undoTimer) clearTimeout(_undoTimer);
    _undoTimer = setTimeout(() => {
      _pushUndo();
    }, 800);
  }

  function _undo() {
    if (_undoStack.length === 0) return;
    // Salvar estado atual no redo
    _redoStack.push(_snapshotBlocks());
    // Restaurar último snapshot
    const snapshot = _undoStack.pop();
    _applySnapshot(snapshot);
  }

  function _redo() {
    if (_redoStack.length === 0) return;
    _undoStack.push(_snapshotBlocks());
    const snapshot = _redoStack.pop();
    _applySnapshot(snapshot);
  }

  function _applySnapshot(snapshot) {
    // Restaurar dados em memória
    snapshot.forEach(snap => {
      const block = _blocks.find(b => b.id === snap.id);
      if (block) {
        block.type = snap.type;
        block.content = snap.content;
        block.props = snap.props;
        block.position = snap.position;
      }
    });

    // Blocos que existiam no snapshot mas não em _blocks (foram deletados) — restaurar
    snapshot.forEach(snap => {
      if (!_blocks.find(b => b.id === snap.id)) {
        _blocks.push({ ...snap, tenant_id: _blocks[0]?.tenant_id, page_id: _pageId });
      }
    });

    // Blocos que existem em _blocks mas não no snapshot (foram criados) — remover
    const snapIds = new Set(snapshot.map(s => s.id));
    _blocks = _blocks.filter(b => snapIds.has(b.id));

    // Reordenar por position
    _blocks.sort((a, b) => a.position - b.position);

    // Re-render completo
    _render();

    // Salvar todos os blocos alterados
    _blocks.forEach(b => _scheduleSave(b.id));
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function _getUserId() {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    return user?.supabaseId || user?.id || null;
  }

  function _getUserName() {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    return user?.name || user?.email || 'Voce';
  }

  function _formatTimeAgo(dateInput) {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const diff = Date.now() - date.getTime();
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (min < 1) return 'agora';
    if (min < 60) return `ha ${min} min`;
    if (hr < 24) return `ha ${hr}h`;
    if (d === 1) return 'ontem';
    if (d < 7) return `ha ${d} dias`;
    return `ha ${Math.floor(d / 7)} sem`;
  }

  function _getBlockEl(blockId) {
    return _containerEl?.querySelector(`[data-block-id="${blockId}"]`);
  }

  function _getContentEl(blockId) {
    const blockEl = _getBlockEl(blockId);
    return blockEl?.querySelector('.be-block-content');
  }

  function _getBlockIdFromEl(el) {
    const blockEl = el.closest('[data-block-id]');
    return blockEl?.dataset.blockId || null;
  }

  function _getBlockIndex(blockId) {
    return _blocks.findIndex(b => b.id === blockId);
  }

  // ── Status indicator ───────────────────────────────────────────────────

  function _updateStatus(text, iconName) {
    const el = document.getElementById('peStatusText');
    if (!el) return;
    const icon = iconName || 'check-circle';
    el.innerHTML = `<i data-lucide="${icon}" class="pe-status-icon" style="width:13px;height:13px"></i> ${_esc(text)}`;
    if (window.lucide) lucide.createIcons({ root: el });
  }

  // ── Mount / Unmount ─────────────────────────────────────────────────────

  async function mount(containerEl, pageId, page) {
    if (_mounted) unmount();

    _containerEl = containerEl;
    _pageId = pageId;
    _page = page;
    _mounted = true;
    _lastSavedAt = new Date(page.updated_at || Date.now());

    // Fetch blocos
    try {
      _blocks = await PageBlocksRepo.listByPage(pageId);
    } catch (err) {
      console.error('[BlockEditor] Erro ao carregar blocos:', err);
      _blocks = [];
    }

    // Se nao tem blocos, criar um vazio
    if (_blocks.length === 0) {
      try {
        const newBlock = await PageBlocksRepo.create({
          page_id: pageId,
          type: 'text',
          content: { text: '', marks: [] },
          props: {},
          position: 1,
          created_by: _getUserId()
        });
        _blocks = [newBlock];
      } catch (err) {
        console.error('[BlockEditor] Erro ao criar bloco inicial:', err);
      }
    }

    // Snapshot inicial para undo
    _undoStack = [];
    _redoStack = [];
    _pushUndo();

    // Render
    _render();
    _bindEvents();

    // Drag & drop
    if (typeof BlockDragManager !== 'undefined') {
      BlockDragManager.bind(_containerEl);
    }

    // Focus no primeiro bloco
    if (_blocks.length > 0) {
      requestAnimationFrame(() => {
        _focusBlock(_blocks[0].id, 'end');
      });
    }

    // Status interval
    _statusInterval = setInterval(() => {
      if (_lastSavedAt && !_saving) {
        _updateStatus('Editada ' + _formatTimeAgo(_lastSavedAt));
      }
    }, 30000);

    // Scroll to block if URL has ?block= param
    _scrollToLinkedBlock();
  }

  function unmount() {
    _unbindEvents();
    if (typeof BlockDragManager !== 'undefined') {
      BlockDragManager.unbind();
    }
    clearInterval(_statusInterval);
    Object.values(_saveTimers).forEach(t => clearTimeout(t));
    _saveTimers = {};
    _containerEl = null;
    _pageId = null;
    _page = null;
    _blocks = [];
    _mounted = false;
    _saving = false;
    _lastSavedAt = null;
    _focusedBlockId = null;
  }

  // ── Render ──────────────────────────────────────────────────────────────

  function _render() {
    if (!_containerEl) return;
    _containerEl.innerHTML = BlockRenderer.renderBlockList(_blocks);
    _updateNumberedLists();
  }

  function _rerenderBlock(blockId) {
    const block = _blocks.find(b => b.id === blockId);
    if (!block) return;

    const el = _getBlockEl(blockId);
    if (!el) return;

    const temp = document.createElement('div');
    temp.innerHTML = BlockRenderer.renderBlock(block);
    const newEl = temp.firstElementChild;

    el.replaceWith(newEl);
    _updateNumberedLists();
  }

  function _updateNumberedLists() {
    if (!_containerEl) return;
    let counter = 0;
    _blocks.forEach(block => {
      if (block.type === 'numbered_list') {
        counter++;
        const numEl = _containerEl.querySelector(`[data-block-number="${block.id}"]`);
        if (numEl) numEl.textContent = counter + '.';
      } else {
        counter = 0;
      }
    });
  }

  // ── Save ────────────────────────────────────────────────────────────────

  function _scheduleSave(blockId) {
    clearTimeout(_saveTimers[blockId]);
    _saveTimers[blockId] = setTimeout(() => _saveBlock(blockId), 800);
    _updateStatus('Editando...', 'pencil');
  }

  async function _saveBlock(blockId) {
    const block = _blocks.find(b => b.id === blockId);
    if (!block) return;

    try {
      _saving = true;
      _updateStatus('Salvando...', 'loader');

      await PageBlocksRepo.update(blockId, {
        content: block.content,
        props: block.props,
        type: block.type
      });

      _lastSavedAt = new Date();
      _saving = false;
      _updateStatus('Salvo', 'check-circle');

      setTimeout(() => {
        if (!_saving) {
          _updateStatus('Editada ' + _formatTimeAgo(_lastSavedAt), 'check-circle');
        }
      }, 2000);
    } catch (err) {
      console.error('[BlockEditor] Erro ao salvar bloco:', err);
      _saving = false;
      _updateStatus('Erro ao salvar', 'alert-circle');
    }
  }

  // ── Block operations ─────────────────────────────────────────────────────

  async function _insertBlockAfter(afterBlockId, type, initialText) {
    _pushUndo();
    const afterIndex = _getBlockIndex(afterBlockId);
    const afterBlock = _blocks[afterIndex];
    const newPosition = afterBlock ? afterBlock.position + 0.5 : _blocks.length + 1;

    try {
      const newBlock = await PageBlocksRepo.create({
        page_id: _pageId,
        type: type || 'text',
        content: { text: initialText || '', marks: [] },
        props: {},
        position: newPosition,
        created_by: _getUserId()
      });

      // Inserir no array local
      _blocks.splice(afterIndex + 1, 0, newBlock);

      // Re-render
      const afterEl = _getBlockEl(afterBlockId);
      if (afterEl) {
        const temp = document.createElement('div');
        temp.innerHTML = BlockRenderer.renderBlock(newBlock);
        afterEl.insertAdjacentElement('afterend', temp.firstElementChild);
      } else {
        _render();
      }

      _updateNumberedLists();

      // Focus no novo bloco
      requestAnimationFrame(() => _focusBlock(newBlock.id, 'start'));

      return newBlock;
    } catch (err) {
      console.error('[BlockEditor] Erro ao inserir bloco:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', 'Nao foi possivel inserir bloco');
      }
      return null;
    }
  }

  async function _deleteBlock(blockId) {
    _pushUndo();
    const index = _getBlockIndex(blockId);
    if (index === -1) return;

    // Nao deletar se e o unico bloco
    if (_blocks.length <= 1) return;

    try {
      await PageBlocksRepo.delete(blockId);

      // Remover do array local
      _blocks.splice(index, 1);

      // Remover do DOM
      const el = _getBlockEl(blockId);
      if (el) el.remove();

      _updateNumberedLists();

      // Focus no bloco anterior (ou proximo)
      const focusIndex = Math.max(0, index - 1);
      if (_blocks[focusIndex]) {
        _focusBlock(_blocks[focusIndex].id, 'end');
      }
    } catch (err) {
      console.error('[BlockEditor] Erro ao deletar bloco:', err);
    }
  }

  async function _duplicateBlock(blockId) {
    _pushUndo();
    try {
      const duplicated = await PageBlocksRepo.duplicate(blockId);
      const index = _getBlockIndex(blockId);
      _blocks.splice(index + 1, 0, duplicated);

      const el = _getBlockEl(blockId);
      if (el) {
        const temp = document.createElement('div');
        temp.innerHTML = BlockRenderer.renderBlock(duplicated);
        el.insertAdjacentElement('afterend', temp.firstElementChild);
      } else {
        _render();
      }

      _updateNumberedLists();
      requestAnimationFrame(() => _focusBlock(duplicated.id, 'start'));
    } catch (err) {
      console.error('[BlockEditor] Erro ao duplicar:', err);
    }
  }

  function _transformBlock(blockId, newType) {
    _pushUndo();
    const block = _blocks.find(b => b.id === blockId);
    if (!block) return;

    // Preservar texto
    const oldType = block.type;
    block.type = newType;

    // Reset props especificas do tipo antigo
    if (newType === 'todo' && !block.props.checked) {
      block.props.checked = false;
    }
    if (newType === 'callout' && !block.props.emoji) {
      block.props.emoji = '💡';
    }
    if (newType === 'code' && !block.props.language) {
      block.props.language = '';
    }

    // Re-render e salvar
    _rerenderBlock(blockId);
    _scheduleSave(blockId);

    // Re-focus
    requestAnimationFrame(() => _focusBlock(blockId, 'end'));
  }

  function _setBlockColor(blockId, colorType, colorName) {
    const block = _blocks.find(b => b.id === blockId);
    if (!block) return;

    if (colorType === 'text') {
      block.props.textColor = colorName === 'default' ? null : colorName;
    } else {
      block.props.bgColor = colorName === 'default' ? null : colorName;
    }

    // Atualizar data attributes no DOM
    const el = _getBlockEl(blockId);
    if (el) {
      if (colorType === 'text') {
        if (colorName && colorName !== 'default') {
          el.setAttribute('data-text-color', colorName);
        } else {
          el.removeAttribute('data-text-color');
        }
      } else {
        if (colorName && colorName !== 'default') {
          el.setAttribute('data-bg-color', colorName);
        } else {
          el.removeAttribute('data-bg-color');
        }
      }
    }

    _scheduleSave(blockId);
  }

  // ── Focus ───────────────────────────────────────────────────────────────

  function _focusBlock(blockId, position) {
    const contentEl = _getContentEl(blockId);
    if (!contentEl) return;

    contentEl.focus();
    _focusedBlockId = blockId;

    if (position === 'end') {
      const range = document.createRange();
      const sel = window.getSelection();
      if (contentEl.childNodes.length > 0) {
        const lastNode = contentEl.childNodes[contentEl.childNodes.length - 1];
        range.setStartAfter(lastNode);
      } else {
        range.setStart(contentEl, 0);
      }
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (position === 'start') {
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(contentEl, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  // ── Scroll to linked block ──────────────────────────────────────────────

  async function _scrollToLinkedBlock() {
    const hash = window.location.hash;
    const match = hash.match(/[?&]block=([a-z0-9]+)/);
    if (!match) return;

    const slug = match[1];
    try {
      const link = await BlockLinksRepo.getBySlug(slug);
      if (!link) return;

      const blockEl = _getBlockEl(link.block_id);
      if (blockEl) {
        setTimeout(() => {
          blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          blockEl.classList.add('be-block--highlighted');
          setTimeout(() => blockEl.classList.remove('be-block--highlighted'), 2000);
        }, 300);
      }
    } catch (err) {
      console.warn('[BlockEditor] Erro ao resolver block link:', err);
    }
  }

  // ── Event binding ───────────────────────────────────────────────────────

  function _bindEvents() {
    if (!_containerEl) return;

    _containerEl.addEventListener('input', _onInput);
    _containerEl.addEventListener('keydown', _onKeydown);
    _containerEl.addEventListener('click', _onClick);
    _containerEl.addEventListener('contextmenu', _onContextMenu, true);
    _containerEl.addEventListener('focusin', _onFocusIn);

    // Checkbox changes
    _containerEl.addEventListener('change', _onChange);

    // Paste: limpar formatacao
    _containerEl.addEventListener('paste', _onPaste);

    // Keyboard shortcuts globais
    document.addEventListener('keydown', _onGlobalKeydown);
  }

  function _unbindEvents() {
    if (_containerEl) {
      _containerEl.removeEventListener('input', _onInput);
      _containerEl.removeEventListener('keydown', _onKeydown);
      _containerEl.removeEventListener('click', _onClick);
      _containerEl.removeEventListener('contextmenu', _onContextMenu, true);
      _containerEl.removeEventListener('focusin', _onFocusIn);
      _containerEl.removeEventListener('change', _onChange);
      _containerEl.removeEventListener('paste', _onPaste);
    }
    document.removeEventListener('keydown', _onGlobalKeydown);
  }

  // ── Event handlers ──────────────────────────────────────────────────────

  function _onInput(e) {
    const contentEl = e.target.closest('.be-block-content');
    if (!contentEl) return;

    const blockId = _getBlockIdFromEl(contentEl);
    if (!blockId) return;

    const block = _blocks.find(b => b.id === blockId);
    if (!block) return;

    // Atualizar conteudo em memoria
    block.content.text = contentEl.textContent || '';

    // Detectar slash command
    if (block.content.text === '/' && typeof SlashCommandPalette !== 'undefined') {
      const rect = contentEl.getBoundingClientRect();
      SlashCommandPalette.open({
        x: rect.left,
        y: rect.bottom + 4,
        blockId,
        onSelect: (type) => {
          // Limpar o / digitado
          block.content.text = '';
          contentEl.textContent = '';
          _transformBlock(blockId, type);
        }
      });
      return;
    }

    // Fechar slash palette se aberta e texto mudou
    if (typeof SlashCommandPalette !== 'undefined' && SlashCommandPalette.isOpen) {
      if (!block.content.text.startsWith('/')) {
        SlashCommandPalette.close();
      } else {
        SlashCommandPalette.filter(block.content.text.slice(1));
      }
    }

    _pushUndoDebounced();
    _scheduleSave(blockId);
  }

  function _onKeydown(e) {
    const contentEl = e.target.closest('.be-block-content');
    if (!contentEl) return;

    const blockId = _getBlockIdFromEl(contentEl);
    if (!blockId) return;

    // ── Enter → criar novo bloco ──
    if (e.key === 'Enter' && !e.shiftKey) {
      // Dentro de slash palette → deixar palette tratar
      if (typeof SlashCommandPalette !== 'undefined' && SlashCommandPalette.isOpen) return;

      e.preventDefault();

      // Obter texto apos cursor para mover ao novo bloco
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      const afterRange = document.createRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEndAfter(contentEl.lastChild || contentEl);
      const afterText = afterRange.toString();

      // Truncar texto do bloco atual
      if (afterText) {
        const block = _blocks.find(b => b.id === blockId);
        if (block) {
          block.content.text = contentEl.textContent.slice(0, contentEl.textContent.length - afterText.length);
          contentEl.textContent = block.content.text;
          _scheduleSave(blockId);
        }
      }

      // Novo bloco com texto remanescente
      const block = _blocks.find(b => b.id === blockId);
      const newType = (block && ['bulleted_list', 'numbered_list', 'todo'].includes(block.type))
        ? block.type : 'text';
      _insertBlockAfter(blockId, newType, afterText);
      return;
    }

    // ── Backspace no inicio → merge com bloco anterior ou transformar em texto ──
    if (e.key === 'Backspace') {
      const sel = window.getSelection();
      if (sel.isCollapsed && sel.anchorOffset === 0) {
        const index = _getBlockIndex(blockId);
        const block = _blocks[index];

        // Se nao e tipo texto, transformar em texto primeiro
        if (block && block.type !== 'text') {
          e.preventDefault();
          _transformBlock(blockId, 'text');
          return;
        }

        // Se e o primeiro bloco, nao fazer nada
        if (index <= 0) return;

        e.preventDefault();
        const prevBlock = _blocks[index - 1];
        const currentText = block.content.text || '';
        const prevText = prevBlock.content.text || '';

        // Merge com bloco anterior
        prevBlock.content.text = prevText + currentText;
        _scheduleSave(prevBlock.id);

        // Deletar bloco atual
        _deleteBlock(blockId);

        // Posicionar cursor no ponto de merge
        requestAnimationFrame(() => {
          const prevContentEl = _getContentEl(prevBlock.id);
          if (prevContentEl) {
            prevContentEl.textContent = prevBlock.content.text;
            _setCursorAt(prevContentEl, prevText.length);
          }
        });
        return;
      }
    }

    // ── Arrow Up no inicio → focus bloco anterior ──
    if (e.key === 'ArrowUp') {
      const sel = window.getSelection();
      if (sel.isCollapsed && sel.anchorOffset === 0) {
        const index = _getBlockIndex(blockId);
        if (index > 0) {
          e.preventDefault();
          _focusBlock(_blocks[index - 1].id, 'end');
        }
      }
    }

    // ── Arrow Down no final → focus bloco seguinte ──
    if (e.key === 'ArrowDown') {
      const sel = window.getSelection();
      const text = contentEl.textContent || '';
      if (sel.isCollapsed && sel.anchorOffset >= text.length) {
        const index = _getBlockIndex(blockId);
        if (index < _blocks.length - 1) {
          e.preventDefault();
          _focusBlock(_blocks[index + 1].id, 'start');
        }
      }
    }

    // ── Tab → indent (futuro: transformar em sub-bloco) ──
    if (e.key === 'Tab') {
      e.preventDefault();
      // Placeholder para indent/outdent futuro
    }
  }

  function _onGlobalKeydown(e) {
    if (!_mounted) return;

    // Ctrl/Cmd + Z → Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      _undo();
      return;
    }

    // Ctrl/Cmd + Shift+Z or Ctrl+Y → Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      _redo();
      return;
    }

    // Ctrl/Cmd + D → duplicar bloco focado
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      if (_focusedBlockId) {
        e.preventDefault();
        _duplicateBlock(_focusedBlockId);
      }
    }

    // Delete → deletar bloco focado (se vazio)
    if (e.key === 'Delete' && _focusedBlockId) {
      const block = _blocks.find(b => b.id === _focusedBlockId);
      if (block && !block.content.text) {
        e.preventDefault();
        _deleteBlock(_focusedBlockId);
      }
    }

    // Escape → fechar palettes
    if (e.key === 'Escape') {
      if (typeof SlashCommandPalette !== 'undefined' && SlashCommandPalette.isOpen) {
        SlashCommandPalette.close();
      }
      if (typeof BlockContextMenu !== 'undefined' && BlockContextMenu.isOpen) {
        BlockContextMenu.close();
      }
    }
  }

  function _onClick(e) {
    // Menu trigger (⋮)
    const menuBtn = e.target.closest('.be-block-menu-trigger');
    if (menuBtn) {
      e.preventDefault();
      e.stopPropagation();
      const blockId = _getBlockIdFromEl(menuBtn);
      if (blockId && typeof BlockContextMenu !== 'undefined') {
        const rect = menuBtn.getBoundingClientRect();
        BlockContextMenu.open({
          x: rect.right,
          y: rect.top,
          blockId,
          block: _blocks.find(b => b.id === blockId),
          pageId: _pageId,
          onAction: _handleContextAction
        });
      }
      return;
    }

    // Todo checkbox
    const checkbox = e.target.closest('.be-todo-checkbox');
    if (checkbox) return; // handled by _onChange
  }

  function _onContextMenu(e) {
    // Aceitar clique direito em qualquer parte do bloco (content, gutter, etc)
    const blockEl = e.target.closest('[data-block-id]');
    if (!blockEl) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const blockId = blockEl.dataset.blockId;
    if (blockId && typeof BlockContextMenu !== 'undefined') {
      BlockContextMenu.open({
        x: e.clientX,
        y: e.clientY,
        blockId,
        block: _blocks.find(b => b.id === blockId),
        pageId: _pageId,
        onAction: _handleContextAction
      });
    }
  }

  function _onChange(e) {
    // Todo checkbox
    const checkbox = e.target.closest('[data-block-checkbox]');
    if (checkbox) {
      const blockId = checkbox.dataset.blockCheckbox;
      const block = _blocks.find(b => b.id === blockId);
      if (block) {
        block.props.checked = checkbox.checked;
        const wrapEl = checkbox.closest('.be-todo-wrap');
        if (wrapEl) {
          wrapEl.classList.toggle('be-todo--checked', checkbox.checked);
        }
        _scheduleSave(blockId);
      }
      return;
    }

    // Code language
    const langSelect = e.target.closest('[data-block-lang]');
    if (langSelect) {
      const blockId = langSelect.dataset.blockLang;
      const block = _blocks.find(b => b.id === blockId);
      if (block) {
        block.props.language = langSelect.value;
        _scheduleSave(blockId);
      }
    }
  }

  function _onFocusIn(e) {
    const contentEl = e.target.closest('.be-block-content');
    if (!contentEl) return;
    _focusedBlockId = _getBlockIdFromEl(contentEl);
  }

  function _onPaste(e) {
    const contentEl = e.target.closest('.be-block-content');
    if (!contentEl) return;

    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  // ── Context menu action handler ─────────────────────────────────────────

  function _handleContextAction(action, blockId, extra) {
    switch (action) {
    case 'duplicate':
      _duplicateBlock(blockId);
      break;
    case 'delete':
      _deleteBlock(blockId);
      break;
    case 'transform':
      _transformBlock(blockId, extra.type);
      break;
    case 'color':
      _setBlockColor(blockId, extra.colorType, extra.colorName);
      break;
    case 'link':
      _linkToBlock(blockId);
      break;
    case 'moveTo':
      _openMoveTo(blockId);
      break;
    case 'askAI':
      _openAIPanel(blockId, 'ask');
      break;
    case 'suggestEdits':
      _openAIPanel(blockId, 'suggest');
      break;
    }
  }

  // ── Link to block ───────────────────────────────────────────────────────

  async function _linkToBlock(blockId) {
    try {
      const linkData = await BlockLinksRepo.createSlug(blockId);
      const baseUrl = window.location.origin + window.location.pathname;
      const url = `${baseUrl}#page/${_pageId}?block=${linkData.slug}`;

      await navigator.clipboard.writeText(url);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Link copiado', 'Link para o bloco copiado para a area de transferencia');
      }
    } catch (err) {
      console.error('[BlockEditor] Erro ao criar link:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', 'Nao foi possivel criar link para o bloco');
      }
    }
  }

  // ── Move to ─────────────────────────────────────────────────────────────

  async function _openMoveTo(blockId) {
    if (typeof BlockMoveToModal !== 'undefined') {
      BlockMoveToModal.open({
        blockId,
        currentPageId: _pageId,
        onSelect: async (targetPageId) => {
          try {
            const maxPos = await PageBlocksRepo.getMaxPosition(targetPageId);
            await PageBlocksRepo.moveToPage(blockId, targetPageId, maxPos + 1);

            // Remover do array e DOM local
            const index = _getBlockIndex(blockId);
            if (index !== -1) {
              _blocks.splice(index, 1);
              const el = _getBlockEl(blockId);
              if (el) el.remove();
              _updateNumberedLists();
            }

            if (typeof TBO_TOAST !== 'undefined') {
              TBO_TOAST.success('Bloco movido', 'Bloco movido para outra pagina');
            }
          } catch (err) {
            console.error('[BlockEditor] Erro ao mover bloco:', err);
            if (typeof TBO_TOAST !== 'undefined') {
              TBO_TOAST.error('Erro', 'Nao foi possivel mover o bloco');
            }
          }
        }
      });
    } else {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.info('Em breve', '"Mover para" sera implementado na proxima fase');
      }
    }
  }

  // ── AI Panel ────────────────────────────────────────────────────────────

  function _openAIPanel(blockId, mode) {
    if (typeof BlockAIPanel !== 'undefined') {
      const block = _blocks.find(b => b.id === blockId);
      BlockAIPanel.open({ blockId, block, mode });
    } else {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.info('Em breve', 'Recursos de IA serao implementados na proxima fase');
      }
    }
  }

  // ── Cursor helper ───────────────────────────────────────────────────────

  function _setCursorAt(el, charOffset) {
    const textNode = el.firstChild;
    if (!textNode) {
      el.focus();
      return;
    }
    const range = document.createRange();
    const offset = Math.min(charOffset, textNode.textContent.length);
    range.setStart(textNode, offset);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // ── Public API ──────────────────────────────────────────────────────────

  return {
    mount,
    unmount,
    get mounted() { return _mounted; },
    get blocks() { return _blocks; },
    get pageId() { return _pageId; },

    // Exposed for sub-components
    insertBlockAfter: (...args) => _insertBlockAfter(...args),
    deleteBlock: (...args) => _deleteBlock(...args),
    duplicateBlock: (...args) => _duplicateBlock(...args),
    transformBlock: (...args) => _transformBlock(...args),
    setBlockColor: (...args) => _setBlockColor(...args),
    focusBlock: (...args) => _focusBlock(...args),
    getBlocks: () => _blocks,
    getPageId: () => _pageId
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_BLOCK_EDITOR = TBO_BLOCK_EDITOR;
}
