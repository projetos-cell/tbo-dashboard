/**
 * TBO OS — Module: Caixa de Entrada (Inbox Notifications)
 * Task #14 — Notification center with Supabase backend
 *
 * Lifecycle: render() → init()
 * Repo: InboxRepo (src/infra/supabase/queries/inbox.js)
 */
const TBO_INBOX = {
  _notifications: [],
  _filter: 'all', // 'all' | 'unread'
  _loading: false,

  render() {
    return `
    <div class="module-page">
      <div class="page-header" style="margin-bottom:24px;">
        <div>
          <h1 class="page-title">Caixa de Entrada</h1>
          <p class="page-subtitle">Notificacoes e atualizacoes</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="btn btn-ghost btn-sm ${this._filter === 'all' ? 'active' : ''}" id="inboxFilterAll">Todas</button>
          <button class="btn btn-ghost btn-sm ${this._filter === 'unread' ? 'active' : ''}" id="inboxFilterUnread">Nao lidas</button>
          <button class="btn btn-secondary btn-sm" id="inboxMarkAllRead">
            <i data-lucide="check-check"></i> Marcar tudo como lido
          </button>
        </div>
      </div>
      <div id="inboxList" class="inbox-list">
        <div class="loading-spinner"></div>
      </div>
    </div>`;
  },

  async init() {
    await this._load();

    document.getElementById('inboxFilterAll')?.addEventListener('click', () => {
      this._filter = 'all';
      this._updateFilterButtons();
      this._load();
    });

    document.getElementById('inboxFilterUnread')?.addEventListener('click', () => {
      this._filter = 'unread';
      this._updateFilterButtons();
      this._load();
    });

    document.getElementById('inboxMarkAllRead')?.addEventListener('click', async () => {
      if (typeof InboxRepo === 'undefined') return;
      try {
        await InboxRepo.markAllRead();
        this._notifications.forEach(n => { n.is_read = true; n.read_at = new Date().toISOString(); });
        this._renderList();
        this._updateBadge();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Caixa de Entrada', 'Todas as notificacoes foram marcadas como lidas.');
      } catch (e) {
        console.error('[Inbox] markAllRead error:', e);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Nao foi possivel marcar como lidas.');
      }
    });

    // Lucide icons for header buttons
    if (window.lucide) lucide.createIcons();
  },

  /**
   * Carrega notificacoes do Supabase via InboxRepo
   */
  async _load() {
    const container = document.getElementById('inboxList');
    if (!container) return;

    this._loading = true;
    container.innerHTML = '<div style="text-align:center;padding:32px;"><div class="loading-spinner"></div></div>';

    try {
      if (typeof InboxRepo === 'undefined') {
        this._notifications = [];
      } else {
        this._notifications = await InboxRepo.list({
          unreadOnly: this._filter === 'unread'
        });
      }
      this._renderList();
    } catch (e) {
      console.error('[Inbox] load error:', e);
      container.innerHTML = `
        <div style="text-align:center;padding:48px;color:var(--text-muted);">
          <i data-lucide="alert-circle" style="width:32px;height:32px;margin-bottom:8px;opacity:0.4;"></i>
          <p>Erro ao carregar notificacoes.</p>
          <button class="btn btn-ghost btn-sm" id="inboxRetry" style="margin-top:8px;">Tentar novamente</button>
        </div>`;
      document.getElementById('inboxRetry')?.addEventListener('click', () => this._load());
      if (window.lucide) lucide.createIcons();
    } finally {
      this._loading = false;
    }
  },

  /**
   * Renderiza a lista de notificacoes no DOM
   */
  _renderList() {
    const container = document.getElementById('inboxList');
    if (!container) return;

    if (!this._notifications.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px;color:var(--text-muted);">
          <i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3;display:inline-block;"></i>
          <p style="font-size:0.9rem;">Nenhuma notificacao${this._filter === 'unread' ? ' nao lida' : ''}</p>
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const typeIcons = {
      recognition: 'award',
      mention: 'at-sign',
      update: 'bell',
      report: 'file-text',
      system: 'settings',
      general: 'bell'
    };
    const typeColors = {
      recognition: '#f59e0b',
      mention: '#3b82f6',
      update: '#10b981',
      report: '#8b5cf6',
      system: '#6b7280',
      general: '#6b7280'
    };

    container.innerHTML = this._notifications.map(n => {
      const icon = typeIcons[n.type] || typeIcons.general;
      const color = typeColors[n.type] || typeColors.general;
      const unreadClass = n.is_read ? '' : ' inbox-item--unread';
      const unreadDot = !n.is_read
        ? '<span class="inbox-unread-dot" style="width:8px;height:8px;border-radius:50%;background:#3b82f6;flex-shrink:0;"></span>'
        : '';
      const fontWeight = n.is_read ? '400' : '600';

      return `
      <div class="inbox-item${unreadClass}" data-id="${this._esc(n.id)}" style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border-subtle);cursor:pointer;transition:background 0.15s;">
        <div style="width:32px;height:32px;border-radius:50%;background:${color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i data-lucide="${icon}" style="width:16px;height:16px;color:${color};"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
            <span style="font-weight:${fontWeight};font-size:0.88rem;color:var(--text-primary);">${this._esc(n.title)}</span>
            ${unreadDot}
          </div>
          ${n.body ? `<p style="font-size:0.8rem;color:var(--text-secondary);margin:0;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this._esc(n.body)}</p>` : ''}
          <span style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;display:block;">${this._timeAgo(n.created_at)}</span>
        </div>
      </div>`;
    }).join('');

    // Click to mark as read
    container.querySelectorAll('.inbox-item').forEach(item => {
      item.addEventListener('click', async () => {
        const id = item.dataset.id;
        const notif = this._notifications.find(n => n.id === id);
        if (notif && !notif.is_read && typeof InboxRepo !== 'undefined') {
          try {
            await InboxRepo.markRead(id);
            notif.is_read = true;
            notif.read_at = new Date().toISOString();
            item.classList.remove('inbox-item--unread');
            const dot = item.querySelector('.inbox-unread-dot');
            if (dot) dot.remove();
            // Update title font weight
            const titleEl = item.querySelector('span[style*="font-weight"]');
            if (titleEl) titleEl.style.fontWeight = '400';
            this._updateBadge();
          } catch (e) {
            console.error('[Inbox] markRead error:', e);
          }
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  },

  /**
   * Atualiza os botoes de filtro (active state)
   */
  _updateFilterButtons() {
    const allBtn = document.getElementById('inboxFilterAll');
    const unreadBtn = document.getElementById('inboxFilterUnread');
    if (allBtn) allBtn.classList.toggle('active', this._filter === 'all');
    if (unreadBtn) unreadBtn.classList.toggle('active', this._filter === 'unread');
  },

  /**
   * Atualiza o badge no header (contador de nao lidas)
   */
  _updateBadge() {
    const unread = this._notifications.filter(n => !n.is_read).length;
    const badge = document.getElementById('inboxBadge');
    if (badge) {
      badge.textContent = unread > 0 ? (unread > 99 ? '99+' : unread) : '';
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }
  },

  /**
   * Escapa HTML para prevenir XSS
   */
  _esc(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  },

  /**
   * Formata data relativa (pt-BR)
   */
  _timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return mins + 'min atras';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h atras';
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + 'd atras';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }
};

if (typeof window !== 'undefined') window.TBO_INBOX = TBO_INBOX;
