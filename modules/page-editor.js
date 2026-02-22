/**
 * TBO OS — Module: Page Editor (Notion-style)
 *
 * Editor de pagina com titulo editavel e editor de blocos.
 * Rota parametrizada: #page/{pageId}
 *
 * Se page.has_blocks = true → delega para TBO_BLOCK_EDITOR (blocos)
 * Se page.has_blocks = false → fallback legado (contenteditable simples)
 *
 * Lifecycle: setParams → render → init → destroy
 *
 * API:
 *   TBO_PAGE_EDITOR.setParams({ id })
 *   TBO_PAGE_EDITOR.render()    → HTML string
 *   TBO_PAGE_EDITOR.init()      → bind eventos
 *   TBO_PAGE_EDITOR.destroy()   → cleanup
 */

const TBO_PAGE_EDITOR = {

  // ── Estado ──────────────────────────────────────────────────────────────
  _pageId: null,
  _page: null,
  _loading: true,
  _saving: false,
  _lastSavedAt: null,
  _titleDebounce: null,
  _contentDebounce: null,
  _statusInterval: null,
  _breadcrumbLabel: 'Página',
  _useBlockEditor: false,

  // ── Lifecycle ───────────────────────────────────────────────────────────

  setParams(params) {
    this._pageId = params.id;
  },

  async render() {
    if (!this._pageId) return this._renderNotFound();

    try {
      this._page = await PagesRepo.getById(this._pageId);
    } catch (err) {
      console.error('[TBO PageEditor] Erro ao carregar pagina:', err);
      this._page = null;
    }

    if (!this._page) return this._renderNotFound();

    this._loading = false;
    this._lastSavedAt = new Date(this._page.updated_at);
    this._breadcrumbLabel = this._page.title || 'Página';
    this._useBlockEditor = !!this._page.has_blocks;

    return this._renderEditor();
  },

  async init() {
    if (!this._page) return;

    // Bind titulo e meta actions (sempre)
    this._bindTitleEvents();
    this._bindMetaActions();
    this._bindNavigation();

    // Se tem blocos → montar editor de blocos
    if (this._useBlockEditor && typeof TBO_BLOCK_EDITOR !== 'undefined') {
      const container = document.getElementById('peBlocksContainer');
      if (container) {
        await TBO_BLOCK_EDITOR.mount(container, this._pageId, this._page);
      }
    } else {
      // Fallback legado
      this._bindLegacyContentEvents();
      this._enhanceContent();
    }

    // Se titulo padrao, selecionar para facilitar edicao
    if (this._page.title === 'Nova página') {
      requestAnimationFrame(() => {
        const titleEl = document.getElementById('peTitle');
        if (titleEl) {
          titleEl.focus();
          const range = document.createRange();
          range.selectNodeContents(titleEl);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
    }

    // Atualizar status "Editada ha X min" a cada 30s (para legado; blocos tem proprio)
    if (!this._useBlockEditor) {
      this._statusInterval = setInterval(() => {
        if (this._lastSavedAt && !this._saving) {
          this._updateStatus('Editada ' + this._formatTimeAgo(this._lastSavedAt));
        }
      }, 30000);
    }

    // Bind botao de migrar (se legado)
    const migrateBtn = document.getElementById('peMigrateBtn');
    if (migrateBtn) {
      migrateBtn.addEventListener('click', () => this._migrateToBlocks());
    }
  },

  destroy() {
    clearTimeout(this._titleDebounce);
    clearTimeout(this._contentDebounce);
    clearInterval(this._statusInterval);

    // Desmontar editor de blocos
    if (typeof TBO_BLOCK_EDITOR !== 'undefined' && TBO_BLOCK_EDITOR.mounted) {
      TBO_BLOCK_EDITOR.unmount();
    }

    this._pageId = null;
    this._page = null;
    this._loading = true;
    this._saving = false;
    this._lastSavedAt = null;
    this._useBlockEditor = false;
  },

  // ── Skeleton ────────────────────────────────────────────────────────────

  _renderSkeleton() {
    return `
      <div class="pe-container">
        <div class="pe-topbar">
          <div class="pe-breadcrumb">
            <span class="pe-skeleton-text" style="width:60px;height:14px"></span>
            <span class="pe-skeleton-text" style="width:100px;height:14px"></span>
          </div>
          <span class="pe-skeleton-text" style="width:120px;height:14px"></span>
        </div>
        <div class="pe-editor-area">
          <div class="pe-skeleton-text" style="width:50%;height:40px;margin-bottom:24px"></div>
          <div class="pe-skeleton-text" style="width:100%;height:16px;margin-bottom:8px"></div>
          <div class="pe-skeleton-text" style="width:80%;height:16px;margin-bottom:8px"></div>
          <div class="pe-skeleton-text" style="width:60%;height:16px"></div>
        </div>
      </div>
    `;
  },

  // ── Render: Pagina nao encontrada ───────────────────────────────────────

  _renderNotFound() {
    return `
      <div class="pe-container">
        <div class="pe-not-found">
          <i data-lucide="file-x" class="pe-not-found-icon"></i>
          <h2 class="pe-not-found-title">Página não encontrada</h2>
          <p class="pe-not-found-text">A página solicitada não existe ou foi removida.</p>
          <button class="btn btn-primary" onclick="window.location.hash='dashboard'">
            <i data-lucide="arrow-left"></i>
            Voltar ao início
          </button>
        </div>
      </div>
    `;
  },

  // ── Render: Editor principal ────────────────────────────────────────────

  _renderEditor() {
    const page = this._page;
    const spaceName = this._resolveSpaceName(page.space_id);
    const timeAgo = this._formatTimeAgo(page.updated_at);
    const titleText = page.title === 'Nova página' ? '' : this._esc(page.title);

    let contentArea = '';

    if (this._useBlockEditor) {
      // Container para o editor de blocos (montado via JS no init)
      contentArea = `<div id="peBlocksContainer" class="be-container"></div>`;
    } else {
      // Fallback legado: contenteditable simples
      const contentHtml = (page.content && page.content.html) ? page.content.html : '';
      contentArea = `
        <div class="pe-legacy-banner" id="peLegacyBanner">
          <i data-lucide="info" style="width:14px;height:14px"></i>
          <span>Esta pagina usa o editor antigo.</span>
          <button class="pe-migrate-btn" id="peMigrateBtn">Migrar para blocos</button>
        </div>
        <div class="pe-content"
             contenteditable="true"
             data-placeholder="Comece a escrever ou pressione '/' para comandos..."
             id="peContent"
             spellcheck="true">${contentHtml}</div>
      `;
    }

    return `
      <div class="pe-container">
        <!-- Topbar com breadcrumb e status -->
        <div class="pe-topbar">
          <div class="pe-breadcrumb">
            <button class="pe-breadcrumb-link" data-pe-nav="back" title="Voltar">
              <i data-lucide="arrow-left" style="width:14px;height:14px"></i>
            </button>
            <span class="pe-breadcrumb-space">${this._esc(spaceName)}</span>
            <i data-lucide="chevron-right" class="pe-breadcrumb-sep"></i>
            <span class="pe-breadcrumb-page" id="peBreadcrumbTitle">${this._esc(page.title)}</span>
          </div>
          <div class="pe-topbar-right">
            <span class="pe-status" id="peStatusText">
              <i data-lucide="check-circle" class="pe-status-icon" style="width:13px;height:13px"></i>
              Editada ${timeAgo}
            </span>
          </div>
        </div>

        <!-- Area do editor -->
        <div class="pe-editor-area">
          <!-- Capa (se existir) -->
          ${page.cover_url ? `<div class="pe-cover" style="background-image:url(${this._esc(page.cover_url)})"></div>` : ''}

          <!-- Acoes de meta (icone, capa) — aparecem no hover -->
          <div class="pe-meta-actions" id="peMetaActions">
            ${!page.icon ? '<button class="pe-meta-btn" data-pe-action="add-icon"><i data-lucide="smile-plus"></i><span>Adicionar ícone</span></button>' : ''}
            ${!page.cover_url ? '<button class="pe-meta-btn" data-pe-action="add-cover"><i data-lucide="image-plus"></i><span>Adicionar capa</span></button>' : ''}
          </div>

          <!-- Icone da pagina (se existir) -->
          ${page.icon ? `<div class="pe-icon" id="peIcon" data-pe-action="change-icon" title="Trocar icone">${page.icon}</div>` : ''}

          <!-- Titulo editavel -->
          <h1 class="pe-title"
              contenteditable="true"
              data-placeholder="Nova página"
              id="peTitle"
              spellcheck="false">${titleText}</h1>

          <!-- Conteudo (blocos ou legado) -->
          ${contentArea}
        </div>
      </div>
    `;
  },

  // ── Bind: Titulo ────────────────────────────────────────────────────────

  _bindTitleEvents() {
    const titleEl = document.getElementById('peTitle');
    if (!titleEl) return;

    titleEl.addEventListener('input', () => {
      clearTimeout(this._titleDebounce);
      this._titleDebounce = setTimeout(() => {
        const newTitle = titleEl.textContent.trim() || 'Nova página';
        this._saveField('title', newTitle);
        const bc = document.getElementById('peBreadcrumbTitle');
        if (bc) bc.textContent = newTitle;
      }, 800);
    });

    // Enter no titulo → focar no conteudo (blocos ou legado)
    titleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this._useBlockEditor) {
          // Focus primeiro bloco
          const blocks = typeof TBO_BLOCK_EDITOR !== 'undefined' ? TBO_BLOCK_EDITOR.blocks : [];
          if (blocks.length > 0) {
            TBO_BLOCK_EDITOR.focusBlock(blocks[0].id, 'start');
          }
        } else {
          const contentEl = document.getElementById('peContent');
          if (contentEl) contentEl.focus();
        }
      }
    });

    // Colar como texto puro
    titleEl.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text.replace(/\n/g, ' '));
    });
  },

  // ── Bind: Meta Actions ──────────────────────────────────────────────────

  _bindMetaActions() {
    document.querySelectorAll('[data-pe-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.peAction || e.currentTarget.dataset.peAction;
        this._handleMetaAction(action);
      });
    });
  },

  // ── Bind: Navigation ────────────────────────────────────────────────────

  _bindNavigation() {
    document.querySelectorAll('[data-pe-nav="back"]').forEach(btn => {
      btn.addEventListener('click', () => window.history.back());
    });
  },

  // ── Bind: Legacy content (fallback) ─────────────────────────────────────

  _bindLegacyContentEvents() {
    const contentEl = document.getElementById('peContent');
    if (!contentEl) return;

    contentEl.addEventListener('input', () => {
      clearTimeout(this._contentDebounce);
      this._contentDebounce = setTimeout(() => {
        const html = contentEl.innerHTML;
        this._saveField('content', { html });
      }, 1200);
    });
  },

  // ── Migrate to blocks ───────────────────────────────────────────────────

  async _migrateToBlocks() {
    if (!this._pageId) return;
    try {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.info('Migrando...', 'Convertendo pagina para editor de blocos');
      }
      await PageService.migrateToBlocks(this._pageId);
      // Recarregar pagina
      window.location.reload();
    } catch (err) {
      console.error('[TBO PageEditor] Erro ao migrar:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', 'Nao foi possivel migrar a pagina');
      }
    }
  },

  // ── Salvar campo ────────────────────────────────────────────────────────

  async _saveField(field, value) {
    if (!this._pageId) return;
    try {
      this._saving = true;
      this._updateStatus('Salvando...', 'loader');
      await PagesRepo.update(this._pageId, { [field]: value });
      this._lastSavedAt = new Date();
      this._saving = false;
      this._updateStatus('Salvo', 'check-circle');
      setTimeout(() => {
        if (!this._saving) {
          this._updateStatus('Editada ' + this._formatTimeAgo(this._lastSavedAt), 'check-circle');
        }
      }, 2000);
    } catch (err) {
      console.error('[TBO PageEditor] Erro ao salvar:', err);
      this._saving = false;
      this._updateStatus('Erro ao salvar', 'alert-circle');
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro', 'Não foi possível salvar. Tente novamente.');
      }
    }
  },

  // ── Atualizar status na topbar ──────────────────────────────────────────

  _updateStatus(text, iconName) {
    const el = document.getElementById('peStatusText');
    if (!el) return;
    el.innerHTML = `<i data-lucide="${iconName || 'check-circle'}" class="pe-status-icon" style="width:13px;height:13px"></i> ${this._esc(text)}`;
    if (window.lucide) lucide.createIcons({ root: el });
  },

  // ── Meta acoes ──────────────────────────────────────────────────────────

  _handleMetaAction(action) {
    switch (action) {
    case 'add-icon':
    case 'change-icon':
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.info('Em breve', 'Seleção de ícones será implementada na Fase 2');
      }
      break;
    case 'add-cover':
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.info('Em breve', 'Upload de capa será implementado na Fase 2');
      }
      break;
    default:
      console.log('[TBO PageEditor] Acao desconhecida:', action);
    }
  },

  // ── Content Enhancements (legacy fallback) ──────────────────────────────

  _enhanceContent() {
    const contentEl = document.getElementById('peContent');
    if (!contentEl) return;

    if (contentEl.innerHTML.includes('<!-- pe-layout:grid -->')) {
      const container = contentEl.closest('.pe-container');
      if (container) container.setAttribute('data-pe-layout', 'grid');
    }

    contentEl.querySelectorAll('details').forEach(det => {
      if (det.querySelector('.pe-copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'pe-copy-btn';
      btn.setAttribute('contenteditable', 'false');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copiar</span>';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._copyCardText(det, btn);
      });
      det.appendChild(btn);
    });

    this._highlightPlaceholders(contentEl);
  },

  _copyCardText(detailsEl, btn) {
    const paragraphs = detailsEl.querySelectorAll('p');
    const text = Array.from(paragraphs).map(p => p.innerText).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add('pe-copy-btn--copied');
      btn.querySelector('span').textContent = 'Copiado!';
      setTimeout(() => {
        btn.classList.remove('pe-copy-btn--copied');
        btn.querySelector('span').textContent = 'Copiar';
      }, 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.querySelector('span').textContent = 'Copiado!';
      setTimeout(() => { btn.querySelector('span').textContent = 'Copiar'; }, 2000);
    });
  },

  _highlightPlaceholders(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.parentElement.closest('summary, button, .pe-copy-btn, .pe-placeholder')) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.textContent.match(/\{[^}]+\}/) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(textNode => {
      const frag = document.createDocumentFragment();
      textNode.textContent.split(/(\{[^}]+\})/g).forEach(part => {
        if (part.match(/^\{[^}]+\}$/)) {
          const span = document.createElement('span');
          span.className = 'pe-placeholder';
          span.textContent = part;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  },

  // ── Helpers ─────────────────────────────────────────────────────────────

  _resolveSpaceName(spaceId) {
    if (typeof TBO_SIDEBAR_SERVICE !== 'undefined' && TBO_SIDEBAR_SERVICE.initialized) {
      const items = TBO_SIDEBAR_SERVICE.getItems();
      const ws = items.find(i => i.id === spaceId);
      if (ws) return ws.name;
    }
    if (spaceId && spaceId.startsWith('ws-')) {
      const name = spaceId.replace('ws-', '').replace(/-/g, ' ');
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Espaço';
  },

  _formatTimeAgo(dateInput) {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const diff = Date.now() - date.getTime();
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (min < 1) return 'agora';
    if (min < 60) return `há ${min} min`;
    if (hr < 24) return `há ${hr}h`;
    if (d === 1) return 'ontem';
    if (d < 7) return `há ${d} dias`;
    if (d < 30) return `há ${Math.floor(d / 7)} sem`;
    return `há ${Math.floor(d / 30)} meses`;
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};

if (typeof window !== 'undefined') {
  window.TBO_PAGE_EDITOR = TBO_PAGE_EDITOR;
}
