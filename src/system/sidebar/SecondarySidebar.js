/**
 * TBO OS — SecondarySidebar (Painel Lateral Complementar)
 *
 * Sistema genérico de sidebar complementar que abre ao lado da sidebar principal.
 * Layout: [ Sidebar Principal ] [ Secondary Sidebar ] [ Main Content ]
 *
 * Painéis disponíveis:
 *   - 'inbox'  → Caixa de entrada (notificações)
 *   - 'search' → Busca (futuro)
 *
 * API:
 *   TBO_SECONDARY_SIDEBAR.open('inbox')
 *   TBO_SECONDARY_SIDEBAR.close()
 *   TBO_SECONDARY_SIDEBAR.toggle('inbox')
 *   TBO_SECONDARY_SIDEBAR.isOpen
 *   TBO_SECONDARY_SIDEBAR.currentView
 */

const TBO_SECONDARY_SIDEBAR = (() => {
  'use strict';

  let _container = null;
  let _isOpen = false;
  let _currentView = null;
  let _triggerEl = null;

  // ── Mock de notificações (até integrar com Supabase real) ───────────────

  function _getMockNotifications() {
    const now = Date.now();
    const hour = 3600000;
    const day = 86400000;

    return [
      {
        id: 'n1',
        type: 'comment',
        user: { name: 'Ana Costa', initials: 'AC', color: '#E85102' },
        action: 'comentou em',
        target: 'Agência TBO_Sede — Conceituação',
        preview: 'Precisamos revisar o layout do pavimento térreo antes da próxima entrega.',
        timestamp: now - hour * 2,
        read: false
      },
      {
        id: 'n2',
        type: 'mention',
        user: { name: 'Pedro Lima', initials: 'PL', color: '#0EA5E9' },
        action: 'mencionou você em',
        target: 'Sprint Board — Semana 8',
        preview: '@Marco pode validar os renders do Arthaus?',
        timestamp: now - hour * 5,
        read: false
      },
      {
        id: 'n3',
        type: 'assign',
        user: { name: 'Julia Santos', initials: 'JS', color: '#A855F7' },
        action: 'atribuiu a tarefa',
        target: 'Revisão de materiais — Arquitetare',
        preview: 'Prazo: sexta-feira. Prioridade alta.',
        timestamp: now - day,
        read: false
      },
      {
        id: 'n4',
        type: 'reaction',
        user: { name: 'Carlos Mendes', initials: 'CM', color: '#22C55E' },
        action: 'reagiu 👍 em',
        target: 'Ata de reunião — Waves | Amaran',
        preview: '',
        timestamp: now - day * 2,
        read: true
      },
      {
        id: 'n5',
        type: 'comment',
        user: { name: 'Mariana Alves', initials: 'MA', color: '#F59E0B' },
        action: 'comentou em',
        target: 'Pipeline Comercial — Construtora Pessoa',
        preview: 'Proposta atualizada com novo escopo conforme alinhamento de ontem.',
        timestamp: now - day * 3,
        read: true
      },
      {
        id: 'n6',
        type: 'assign',
        user: { name: 'Rafael Oliveira', initials: 'RO', color: '#EC4899' },
        action: 'completou',
        target: 'Render final — Arthaus fachada',
        preview: 'Imagens entregues no Drive, pasta /Arthaus/Renders/Final.',
        timestamp: now - day * 5,
        read: true
      },
      {
        id: 'n7',
        type: 'mention',
        user: { name: 'Beatriz Rocha', initials: 'BR', color: '#14B8A6' },
        action: 'mencionou você em',
        target: 'Brainstorming — Campanha Q2',
        preview: '@Marco, o conceito visual ficou aprovado pelo cliente.',
        timestamp: now - day * 8,
        read: true
      }
    ];
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function _timeAgo(ts) {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);

    if (min < 1) return 'agora';
    if (min < 60) return `${min}min`;
    if (hr < 24) return `${hr}h`;
    if (d === 1) return 'ontem';
    if (d < 7) return `${d}d`;
    if (d < 30) return `${Math.floor(d / 7)}sem`;
    return `${Math.floor(d / 30)}m`;
  }

  function _groupNotifications(notifs) {
    const now = Date.now();
    const day = 86400000;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const weekStart = todayStart.getTime() - todayStart.getDay() * day;
    const lastWeekStart = weekStart - 7 * day;

    const groups = { today: [], thisWeek: [], lastWeek: [], older: [] };

    notifs.forEach(n => {
      if (n.timestamp >= todayStart.getTime()) groups.today.push(n);
      else if (n.timestamp >= weekStart) groups.thisWeek.push(n);
      else if (n.timestamp >= lastWeekStart) groups.lastWeek.push(n);
      else groups.older.push(n);
    });

    return groups;
  }

  // ── Render ──────────────────────────────────────────────────────────────

  function _getOrCreateContainer() {
    let el = document.getElementById('secondarySidebar');
    if (!el) {
      el = document.createElement('aside');
      el.id = 'secondarySidebar';
      el.className = 'ss-panel';
      el.setAttribute('role', 'complementary');
      el.setAttribute('aria-label', 'Painel complementar');

      // Inserir entre sidebar e app-container
      const appContainer = document.getElementById('app-container');
      if (appContainer && appContainer.parentNode) {
        appContainer.parentNode.insertBefore(el, appContainer);
      } else {
        document.body.appendChild(el);
      }
    }
    return el;
  }

  function _renderInbox() {
    const notifs = _getMockNotifications();
    const groups = _groupNotifications(notifs);
    const unreadCount = notifs.filter(n => !n.read).length;

    let html = `
      <header class="ss-header">
        <div class="ss-header-left">
          <h2 class="ss-title">Caixa de entrada</h2>
          ${unreadCount > 0 ? `<span class="ss-unread-badge">${unreadCount}</span>` : ''}
        </div>
        <div class="ss-header-actions">
          ${unreadCount > 0 ? `<button class="ss-action-btn" data-ss-action="mark-all-read" title="Marcar tudo como lido">
            <i data-lucide="check-check"></i>
            <span>Marcar lidas</span>
          </button>` : ''}
          <button class="ss-close-btn" data-ss-close aria-label="Fechar painel">
            <i data-lucide="x"></i>
          </button>
        </div>
      </header>
      <div class="ss-body">
    `;

    const renderGroup = (label, items) => {
      if (items.length === 0) return '';
      let g = `<div class="ss-group">
        <h3 class="ss-group-title">${_esc(label)}</h3>`;
      items.forEach(n => {
        g += _renderNotifItem(n);
      });
      g += '</div>';
      return g;
    };

    html += renderGroup('Hoje', groups.today);
    html += renderGroup('Esta semana', groups.thisWeek);
    html += renderGroup('Semana passada', groups.lastWeek);
    html += renderGroup('Mais antigas', groups.older);

    if (notifs.length === 0) {
      html += `<div class="ss-empty">
        <i data-lucide="inbox" class="ss-empty-icon"></i>
        <p class="ss-empty-text">Nenhuma notificação</p>
      </div>`;
    }

    html += '</div>';
    return html;
  }

  function _renderNotifItem(n) {
    const typeIcons = {
      comment: 'message-circle',
      mention: 'at-sign',
      assign: 'user-check',
      reaction: 'heart'
    };

    return `
      <div class="ss-notif${n.read ? '' : ' ss-notif--unread'}" data-notif-id="${_esc(n.id)}" tabindex="0" role="article">
        <div class="ss-notif-avatar" style="background:${n.user.color}">
          <span>${_esc(n.user.initials)}</span>
        </div>
        <div class="ss-notif-content">
          <div class="ss-notif-header">
            <span class="ss-notif-user">${_esc(n.user.name)}</span>
            <span class="ss-notif-time">${_timeAgo(n.timestamp)}</span>
          </div>
          <div class="ss-notif-action">
            <i data-lucide="${typeIcons[n.type] || 'bell'}" class="ss-notif-type-icon"></i>
            <span>${_esc(n.action)}</span>
          </div>
          <div class="ss-notif-target">${_esc(n.target)}</div>
          ${n.preview ? `<p class="ss-notif-preview">${_esc(n.preview)}</p>` : ''}
        </div>
        ${!n.read ? '<div class="ss-notif-dot"></div>' : ''}
      </div>
    `;
  }

  // ── Bind ────────────────────────────────────────────────────────────────

  function _bindEvents() {
    if (!_container) return;

    // Fechar
    _container.querySelectorAll('[data-ss-close]').forEach(btn => {
      btn.addEventListener('click', close);
    });

    // Marcar tudo como lido
    _container.querySelectorAll('[data-ss-action="mark-all-read"]').forEach(btn => {
      btn.addEventListener('click', () => {
        _container.querySelectorAll('.ss-notif--unread').forEach(el => {
          el.classList.remove('ss-notif--unread');
          const dot = el.querySelector('.ss-notif-dot');
          if (dot) dot.remove();
        });
        const badge = _container.querySelector('.ss-unread-badge');
        if (badge) badge.remove();
        const markBtn = _container.querySelector('[data-ss-action="mark-all-read"]');
        if (markBtn) markBtn.remove();

        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.success('Caixa de entrada', 'Todas marcadas como lidas');
        }
      });
    });

    // ESC fecha
    document.addEventListener('keydown', _onKeydown);
  }

  function _unbindEvents() {
    document.removeEventListener('keydown', _onKeydown);
  }

  function _onKeydown(e) {
    if (e.key === 'Escape' && _isOpen) {
      e.preventDefault();
      close();
    }
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  function open(view = 'inbox') {
    // Se já aberto no mesmo view, fechar (toggle)
    if (_isOpen && _currentView === view) {
      close();
      return;
    }

    _triggerEl = document.activeElement;
    _container = _getOrCreateContainer();
    _currentView = view;

    // Renderizar conteúdo por view
    let content = '';
    switch (view) {
    case 'inbox':
      content = _renderInbox();
      _container.setAttribute('aria-label', 'Caixa de entrada');
      break;
    default:
      content = `<div class="ss-empty"><p>Painel "${_esc(view)}" em desenvolvimento</p></div>`;
    }

    _container.innerHTML = content;

    // Ícones lucide
    if (window.lucide) lucide.createIcons({ root: _container });

    // Marcar body com classe para reflow do layout
    document.body.classList.add('ss-open');
    _container.classList.add('ss-panel--open');
    _isOpen = true;

    // Bind eventos
    _bindEvents();

    // Foco no primeiro item ou no corpo
    requestAnimationFrame(() => {
      const firstFocusable = _container.querySelector('.ss-close-btn, .ss-notif');
      if (firstFocusable) firstFocusable.focus();
    });
  }

  function close() {
    if (!_isOpen) return;

    _unbindEvents();

    document.body.classList.remove('ss-open');
    if (_container) {
      _container.classList.remove('ss-panel--open');
    }

    _isOpen = false;
    _currentView = null;

    // Devolver foco ao trigger
    if (_triggerEl && _triggerEl.isConnected) {
      _triggerEl.focus();
      _triggerEl = null;
    }

    // Limpar conteúdo após transição
    setTimeout(() => {
      if (_container) _container.innerHTML = '';
    }, 200);
  }

  function toggle(view = 'inbox') {
    if (_isOpen && _currentView === view) {
      close();
    } else {
      open(view);
    }
  }

  return {
    open,
    close,
    toggle,
    get isOpen() { return _isOpen; },
    get currentView() { return _currentView; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_SECONDARY_SIDEBAR = TBO_SECONDARY_SIDEBAR;
}
