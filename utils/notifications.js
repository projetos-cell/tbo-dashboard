// ============================================================================
// TBO OS — Notification System
// Supabase Realtime subscriptions, bell icon, dropdown panel
// Types: task_assigned, deadline_warning, review_requested, state_changed
// ============================================================================

const TBO_NOTIFICATIONS = {
  _channel: null,
  _unread: [],
  _all: [],
  _panelOpen: false,
  _pollInterval: null,
  _initialized: false,
  _maxLocal: 50,

  // ── Init: subscribe to Realtime, render bell icon ──────────────────────
  async init() {
    if (this._initialized) return;
    this._initialized = true;

    this._renderBellIcon();
    await this._loadNotifications();
    this._subscribeRealtime();
    this._startPollingFallback();
    this._bindEvents();
  },

  // ── Load notifications from Supabase ──────────────────────────────────
  async _loadNotifications() {
    try {
      const client = TBO_SUPABASE.getClient();
      const session = await TBO_SUPABASE.getSession();
      if (!client || !session) {
        this._loadFromLocal();
        return;
      }

      const { data, error } = await client
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('[TBO Notifications] Load error:', error.message);
        this._loadFromLocal();
        return;
      }

      this._all = (data || []).map(n => this._fromRow(n));
      this._unread = this._all.filter(n => !n.read);
      this._saveToLocal();
      this._updateBadge();
    } catch (e) {
      console.warn('[TBO Notifications] Load failed:', e);
      this._loadFromLocal();
    }
  },

  _loadFromLocal() {
    try {
      const raw = localStorage.getItem('tbo_notifications');
      this._all = raw ? JSON.parse(raw) : [];
      this._unread = this._all.filter(n => !n.read);
      this._updateBadge();
    } catch { this._all = []; this._unread = []; }
  },

  _saveToLocal() {
    try {
      const trimmed = this._all.slice(0, this._maxLocal);
      localStorage.setItem('tbo_notifications', JSON.stringify(trimmed));
    } catch { /* quota exceeded */ }
  },

  // ── Supabase Realtime subscription ────────────────────────────────────
  _subscribeRealtime() {
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return;

      const session = TBO_SUPABASE.isOnline() ? true : false;
      if (!session) return;

      this._channel = client
        .channel('notifications-changes')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            const notif = this._fromRow(payload.new);
            // Only process if it's for the current user
            const currentSession = TBO_AUTH?.getCurrentUserSync?.();
            if (currentSession && payload.new.user_id !== currentSession.supabaseUserId) return;

            this._all.unshift(notif);
            this._unread.unshift(notif);
            this._saveToLocal();
            this._updateBadge();
            this._showToastForNotif(notif);

            // If panel is open, re-render
            if (this._panelOpen) this._renderPanel();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[TBO Notifications] Realtime connected');
          }
        });
    } catch (e) {
      console.warn('[TBO Notifications] Realtime subscribe failed:', e);
    }
  },

  // ── Polling fallback (every 5min) ─────────────────────────────────────
  _startPollingFallback() {
    this._pollInterval = setInterval(() => {
      if (TBO_SUPABASE.isOnline()) {
        this._loadNotifications();
      }
    }, 5 * 60 * 1000);
  },

  destroy() {
    if (this._channel) {
      TBO_SUPABASE.getClient()?.removeChannel(this._channel);
      this._channel = null;
    }
    if (this._pollInterval) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
    this._initialized = false;
  },

  // ── Create notification ───────────────────────────────────────────────
  async create(userId, { title, body, type, entityType, entityId, actionUrl, tenantId }) {
    const notif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      userId,
      title,
      body: body || '',
      type: type || 'info',
      entityType: entityType || null,
      entityId: entityId || null,
      actionUrl: actionUrl || null,
      read: false,
      createdAt: new Date().toISOString()
    };

    // Resolve tenant_id se nao fornecido
    const resolvedTenantId = tenantId
      || (typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getCurrentTenantId?.() : null)
      || null;

    // Save to Supabase
    try {
      const client = TBO_SUPABASE.getClient();
      if (client && TBO_SUPABASE.isOnline()) {
        const row = {
          user_id: userId,
          title,
          body: body || '',
          type: type || 'info',
          entity_type: entityType || null,
          entity_id: entityId || null,
          action_url: actionUrl || null,
          read: false
        };
        if (resolvedTenantId) row.tenant_id = resolvedTenantId;

        const { data, error } = await client.from('notifications').insert(row).select().single();

        if (!error && data) {
          notif.id = data.id;
        }
      }
    } catch (e) {
      console.warn('[TBO Notifications] Create failed on Supabase:', e);
    }

    // Also save locally
    this._all.unshift(notif);
    this._unread.unshift(notif);
    this._saveToLocal();
    this._updateBadge();

    return notif;
  },

  // ── Convenience creators (trigger from modules) ───────────────────────
  async notifyTaskAssigned(taskTitle, assigneeUserId, projectName, taskId) {
    return this.create(assigneeUserId, {
      title: 'Nova tarefa atribuida',
      body: `"${taskTitle}" em ${projectName || 'projeto'}`,
      type: 'task_assigned',
      entityType: 'task',
      entityId: taskId,
      actionUrl: '#tarefas'
    });
  },

  async notifyDeadlineWarning(entityTitle, userId, daysLeft, entityType, entityId) {
    return this.create(userId, {
      title: `Prazo em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`,
      body: `"${entityTitle}" vence em breve`,
      type: 'deadline_warning',
      entityType,
      entityId,
      actionUrl: entityType === 'task' ? '#tarefas' : '#entregas'
    });
  },

  async notifyReviewRequested(deliverableName, reviewerUserId, deliverableId) {
    return this.create(reviewerUserId, {
      title: 'Revisao solicitada',
      body: `"${deliverableName}" aguarda sua revisao`,
      type: 'review_requested',
      entityType: 'deliverable',
      entityId: deliverableId,
      actionUrl: '#revisoes'
    });
  },

  async notifyStateChanged(entityTitle, userId, oldState, newState, entityType, entityId) {
    return this.create(userId, {
      title: 'Status alterado',
      body: `"${entityTitle}": ${oldState} → ${newState}`,
      type: 'state_changed',
      entityType,
      entityId
    });
  },

  // ── Read / mark ───────────────────────────────────────────────────────
  async markAsRead(notifId) {
    const notif = this._all.find(n => n.id === notifId);
    if (!notif || notif.read) return;

    notif.read = true;
    this._unread = this._all.filter(n => !n.read);
    this._saveToLocal();
    this._updateBadge();

    try {
      const client = TBO_SUPABASE.getClient();
      if (client && TBO_SUPABASE.isOnline()) {
        await client.from('notifications').update({ read: true }).eq('id', notifId);
      }
    } catch { /* fire and forget */ }
  },

  async markAllRead() {
    this._all.forEach(n => n.read = true);
    this._unread = [];
    this._saveToLocal();
    this._updateBadge();

    try {
      const client = TBO_SUPABASE.getClient();
      const session = await TBO_SUPABASE.getSession();
      if (client && session && TBO_SUPABASE.isOnline()) {
        await client.from('notifications')
          .update({ read: true })
          .eq('user_id', session.user.id)
          .eq('read', false);
      }
    } catch { /* fire and forget */ }

    if (this._panelOpen) this._renderPanel();
  },

  getUnread() {
    return this._unread;
  },

  getAll() {
    return this._all;
  },

  // ── Row mapping ───────────────────────────────────────────────────────
  _fromRow(row) {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      body: row.body || '',
      type: row.type || 'info',
      entityType: row.entity_type,
      entityId: row.entity_id,
      actionUrl: row.action_url,
      read: !!row.read,
      createdAt: row.created_at || row.createdAt
    };
  },

  // ── UI: Bell icon in header ───────────────────────────────────────────
  _renderBellIcon() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;

    // Insert before user menu
    const userMenu = document.getElementById('userMenu');
    if (!userMenu) return;

    const bellWrapper = document.createElement('div');
    bellWrapper.className = 'notif-bell-wrapper';
    bellWrapper.id = 'notifBellWrapper';
    bellWrapper.innerHTML = `
      <button class="header-action-btn notif-bell-btn" id="notifBellBtn" title="Notificacoes" aria-label="Ver notificacoes">
        <i data-lucide="bell" aria-hidden="true"></i>
        <span class="notif-badge" id="notifBadge" style="display:none;">0</span>
      </button>
      <div class="notif-panel" id="notifPanel" style="display:none;">
        <div class="notif-panel-header">
          <span class="notif-panel-title">Notificacoes</span>
          <button class="btn btn-sm btn-ghost notif-mark-all" id="notifMarkAll">Marcar todas como lidas</button>
        </div>
        <div class="notif-panel-list" id="notifPanelList">
          <div class="notif-empty">Nenhuma notificacao</div>
        </div>
      </div>
    `;

    headerRight.insertBefore(bellWrapper, userMenu);

    // Re-initialize Lucide icons for the new bell
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _updateBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    const count = this._unread.length;
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  },

  _bindEvents() {
    // Bell click → toggle panel
    document.getElementById('notifBellBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._togglePanel();
    });

    // Mark all read
    document.getElementById('notifMarkAll')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.markAllRead();
    });

    // Close panel on outside click
    document.addEventListener('click', (e) => {
      if (this._panelOpen && !e.target.closest('#notifBellWrapper')) {
        this._closePanel();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._panelOpen) this._closePanel();
    });
  },

  _togglePanel() {
    if (this._panelOpen) {
      this._closePanel();
    } else {
      this._openPanel();
    }
  },

  _openPanel() {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;
    this._panelOpen = true;
    panel.style.display = 'block';
    this._renderPanel();
  },

  _closePanel() {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;
    this._panelOpen = false;
    panel.style.display = 'none';
  },

  _renderPanel() {
    const list = document.getElementById('notifPanelList');
    if (!list) return;

    if (this._all.length === 0) {
      list.innerHTML = '<div class="notif-empty">Nenhuma notificacao</div>';
      return;
    }

    const items = this._all.slice(0, 30).map(n => {
      const icon = this._typeIcon(n.type);
      const timeAgo = this._timeAgo(n.createdAt);
      const unreadClass = n.read ? '' : 'notif-item-unread';

      return `<div class="notif-item ${unreadClass}" data-notif-id="${n.id}" ${n.actionUrl ? `data-action-url="${n.actionUrl}"` : ''}>
        <div class="notif-item-icon">${icon}</div>
        <div class="notif-item-content">
          <div class="notif-item-title">${this._esc(n.title)}</div>
          ${n.body ? `<div class="notif-item-body">${this._esc(n.body)}</div>` : ''}
          <div class="notif-item-time">${timeAgo}</div>
        </div>
      </div>`;
    }).join('');

    list.innerHTML = items;

    // Bind click on each item
    list.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.notifId;
        const url = el.dataset.actionUrl;
        this.markAsRead(id);
        el.classList.remove('notif-item-unread');
        if (url) {
          this._closePanel();
          window.location.hash = url.replace('#', '');
        }
      });
    });
  },

  _typeIcon(type) {
    switch (type) {
      case 'task_assigned':     return '<i data-lucide="clipboard-list" style="width:16px;height:16px;color:var(--accent-blue);"></i>';
      case 'deadline_warning':  return '<i data-lucide="alert-triangle" style="width:16px;height:16px;color:var(--color-warning);"></i>';
      case 'review_requested':  return '<i data-lucide="eye" style="width:16px;height:16px;color:var(--color-purple);"></i>';
      case 'state_changed':     return '<i data-lucide="arrow-right-circle" style="width:16px;height:16px;color:var(--color-success);"></i>';
      default:                  return '<i data-lucide="bell" style="width:16px;height:16px;color:var(--text-muted);"></i>';
    }
  },

  _timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  },

  _showToastForNotif(notif) {
    if (typeof TBO_TOAST !== 'undefined') {
      const toastType = notif.type === 'deadline_warning' ? 'warning' : 'info';
      TBO_TOAST[toastType](notif.title, notif.body);
    }
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};
