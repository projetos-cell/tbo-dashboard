/**
 * TBO OS — Módulo Agenda (Integrado com Google Calendar)
 *
 * Exibe eventos do Google Calendar de cada usuário autenticado via Google OAuth.
 * Usa TBO_GOOGLE_CALENDAR (utils/google-calendar.js) como camada de dados.
 * Usa TBO_ASANA_LAYOUT para layout 3 painéis.
 * Usa TBO_DETAILS_PANEL para detalhes de eventos.
 *
 * Fluxo:
 *   1. Usuário faz login com Google OAuth → Supabase armazena provider_token
 *   2. TBO_GOOGLE_CALENDAR usa provider_token para chamar Google Calendar API
 *   3. Este módulo renderiza eventos em visualização dia/semana/mês
 *
 * API:
 *   TBO_AGENDA.render() → HTML
 *   TBO_AGENDA.init()   → Bind eventos + fetch dados
 */

const TBO_AGENDA = (() => {
  'use strict';

  // ── Estado ──────────────────────────────────────────────────────────────
  let _events = [];
  let _selectedDate = new Date();
  let _view = 'week'; // day | week | month
  let _loading = false;
  let _error = null;
  let _hasGoogleToken = false;
  let _syncInterval = null;

  const SYNC_INTERVAL = 3 * 60 * 1000; // 3 minutos
  const COLORS = [
    '#E85102', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6',
    '#EC4899', '#F59E0B', '#0EA5E9', '#6366F1', '#10B981'
  ];

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function _formatTime(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (_e) {
      return '';
    }
  }

  function _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        weekday: 'short', day: '2-digit', month: 'short'
      });
    } catch (_e) {
      return '';
    }
  }

  function _formatDateFull(date) {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  function _isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function _getWeekDays(date) {
    const start = new Date(date);
    const day = start.getDay();
    // Segunda-feira como início da semana
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }

  function _getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Preencher dias antes do mês (para alinhar com dia da semana)
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days = [];

    for (let i = startDay; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Preencher dias após o mês
    const remaining = 42 - days.length; // 6 semanas completas
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }

  function _getEventsForDate(dateStr) {
    return _events.filter(e => {
      const eventDate = (e.startAt || '').split('T')[0];
      return eventDate === dateStr;
    });
  }

  function _getEventsForRange(startDate, endDate) {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    return _events.filter(e => {
      return e.startAt >= start && e.startAt < end;
    });
  }

  function _getEventColor(index) {
    return COLORS[index % COLORS.length];
  }

  // ── Token check ─────────────────────────────────────────────────────────

  async function _checkGoogleToken() {
    try {
      if (typeof TBO_GOOGLE_CALENDAR === 'undefined') return false;
      const token = await TBO_GOOGLE_CALENDAR._getAccessToken();
      _hasGoogleToken = !!token;
      return _hasGoogleToken;
    } catch (_e) {
      _hasGoogleToken = false;
      return false;
    }
  }

  // ── Data loading ────────────────────────────────────────────────────────

  async function _loadEvents() {
    if (typeof TBO_GOOGLE_CALENDAR === 'undefined') {
      _error = 'Google Calendar não configurado';
      return;
    }

    _loading = true;
    _error = null;
    _renderContent();

    try {
      const hasToken = await _checkGoogleToken();
      if (!hasToken) {
        _loading = false;
        _error = 'auth_required';
        _renderContent();
        return;
      }

      // Calcular range baseado na view
      const now = new Date(_selectedDate);
      let timeMin, timeMax;

      if (_view === 'day') {
        timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      } else if (_view === 'week') {
        const weekDays = _getWeekDays(now);
        timeMin = weekDays[0].toISOString();
        timeMax = new Date(weekDays[6].getTime() + 86400000).toISOString();
      } else {
        // month — buscar mês inteiro + margem
        timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
      }

      const rawEvents = await TBO_GOOGLE_CALENDAR.fetchEvents('primary', {
        timeMin,
        timeMax,
        maxResults: 500
      });

      _events = rawEvents.map(e => TBO_GOOGLE_CALENDAR._normalizeEvent(e));
      _loading = false;
      _renderContent();

    } catch (e) {
      console.warn('[TBO Agenda] Erro ao carregar eventos:', e.message);
      _loading = false;

      if (e.message.includes('token') || e.message.includes('401') || e.message.includes('autentiqu')) {
        _error = 'auth_required';
      } else {
        _error = e.message;
      }
      _renderContent();
    }
  }

  // ── Render: Estado sem token ────────────────────────────────────────────

  function _renderAuthRequired() {
    return `<div class="agenda-auth-required">
      <div class="agenda-auth-icon">
        <i data-lucide="calendar-x"></i>
      </div>
      <h3 class="agenda-auth-title">Google Calendar indisponivel</h3>
      <p class="agenda-auth-text">
        A integracao com Google Calendar requer configuracao de API externa.
        Entre em contato com o administrador para habilitar este recurso.
      </p>
    </div>`;
  }

  // ── Render: Loading ─────────────────────────────────────────────────────

  function _renderLoading() {
    if (typeof TBO_SKELETON !== 'undefined') {
      return TBO_SKELETON.table(5, 4);
    }
    return `<div class="agenda-loading">
      <div class="agenda-loading-spinner"></div>
      <span>Carregando eventos...</span>
    </div>`;
  }

  // ── Render: Erro genérico ───────────────────────────────────────────────

  function _renderError() {
    return `<div class="agenda-error">
      <i data-lucide="alert-triangle"></i>
      <p>${_escHtml(_error)}</p>
      <button class="asana-toolbar-btn" id="agendaRetryBtn">
        <i data-lucide="refresh-cw"></i> Tentar novamente
      </button>
    </div>`;
  }

  // ── Render: Vista Dia ───────────────────────────────────────────────────

  function _renderDayView() {
    const dateStr = _selectedDate.toISOString().split('T')[0];
    const dayEvents = _getEventsForDate(dateStr);

    if (dayEvents.length === 0) {
      return `<div class="asana-empty">
        <i data-lucide="calendar-off"></i>
        <div class="asana-empty-title">Nenhum evento</div>
        <div class="asana-empty-text">Nada agendado para ${_formatDateFull(_selectedDate)}</div>
      </div>`;
    }

    // Separar all-day e horários
    const allDay = dayEvents.filter(e => e.isAllDay);
    const timed = dayEvents.filter(e => !e.isAllDay).sort((a, b) => a.startAt.localeCompare(b.startAt));

    let html = '';

    // Eventos de dia inteiro
    if (allDay.length) {
      html += '<div class="agenda-allday">';
      html += '<div class="agenda-allday-label">Dia inteiro</div>';
      html += allDay.map((e, i) => `
        <div class="agenda-event agenda-event--allday" data-event-id="${_escHtml(e.googleEventId)}" style="border-left-color:${_getEventColor(i)}">
          <span class="agenda-event-title">${_escHtml(e.title)}</span>
        </div>
      `).join('');
      html += '</div>';
    }

    // Timeline horária
    html += '<div class="agenda-timeline">';
    const hours = [];
    for (let h = 6; h <= 22; h++) {
      hours.push(h);
    }

    hours.forEach(hour => {
      const hourStr = `${String(hour).padStart(2, '0')}:00`;
      const hourEvents = timed.filter(e => {
        const h = new Date(e.startAt).getHours();
        return h === hour;
      });

      html += `<div class="agenda-hour-row">
        <div class="agenda-hour-label">${hourStr}</div>
        <div class="agenda-hour-content">
          ${hourEvents.map((e, i) => {
            const startTime = _formatTime(e.startAt);
            const endTime = _formatTime(e.endAt);
            const color = _getEventColor(i + allDay.length);
            return `<div class="agenda-event" data-event-id="${_escHtml(e.googleEventId)}" style="border-left-color:${color}">
              <span class="agenda-event-time">${startTime} — ${endTime}</span>
              <span class="agenda-event-title">${_escHtml(e.title)}</span>
              ${e.location ? `<span class="agenda-event-location"><i data-lucide="map-pin"></i> ${_escHtml(e.location)}</span>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>`;
    });

    html += '</div>';
    return html;
  }

  // ── Render: Vista Semana ────────────────────────────────────────────────

  function _renderWeekView() {
    const weekDays = _getWeekDays(_selectedDate);
    const today = new Date();
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    let html = '<div class="agenda-week">';

    // Header com dias da semana
    html += '<div class="agenda-week-header">';
    weekDays.forEach((day, i) => {
      const isToday = _isSameDay(day, today);
      const dateStr = day.toISOString().split('T')[0];
      const dayEvents = _getEventsForDate(dateStr);

      html += `<div class="agenda-week-day-header${isToday ? ' agenda-week-day-header--today' : ''}" data-date="${dateStr}">
        <span class="agenda-week-day-name">${dayNames[i]}</span>
        <span class="agenda-week-day-number${isToday ? ' agenda-week-day-number--today' : ''}">${day.getDate()}</span>
        ${dayEvents.length > 0 ? `<span class="agenda-week-day-count">${dayEvents.length}</span>` : ''}
      </div>`;
    });
    html += '</div>';

    // Colunas com eventos
    html += '<div class="agenda-week-body">';
    weekDays.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      const dayEvents = _getEventsForDate(dateStr);
      const isToday = _isSameDay(day, today);

      html += `<div class="agenda-week-column${isToday ? ' agenda-week-column--today' : ''}" data-date="${dateStr}">`;

      if (dayEvents.length === 0) {
        html += '<div class="agenda-week-empty">—</div>';
      } else {
        // All-day primeiro
        const allDay = dayEvents.filter(e => e.isAllDay);
        const timed = dayEvents.filter(e => !e.isAllDay).sort((a, b) => a.startAt.localeCompare(b.startAt));

        allDay.forEach((e, i) => {
          html += `<div class="agenda-event agenda-event--compact agenda-event--allday" data-event-id="${_escHtml(e.googleEventId)}" style="border-left-color:${_getEventColor(i)}">
            <span class="agenda-event-title">${_escHtml(e.title)}</span>
          </div>`;
        });

        timed.forEach((e, i) => {
          const startTime = _formatTime(e.startAt);
          const color = _getEventColor(i + allDay.length);
          html += `<div class="agenda-event agenda-event--compact" data-event-id="${_escHtml(e.googleEventId)}" style="border-left-color:${color}">
            <span class="agenda-event-time">${startTime}</span>
            <span class="agenda-event-title">${_escHtml(e.title)}</span>
          </div>`;
        });
      }

      html += '</div>';
    });
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ── Render: Vista Mês ───────────────────────────────────────────────────

  function _renderMonthView() {
    const monthDays = _getMonthDays(_selectedDate);
    const today = new Date();
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    let html = '<div class="agenda-month">';

    // Header
    html += '<div class="agenda-month-header">';
    dayNames.forEach(name => {
      html += `<div class="agenda-month-day-name">${name}</div>`;
    });
    html += '</div>';

    // Grid de dias
    html += '<div class="agenda-month-grid">';
    monthDays.forEach(({ date, isCurrentMonth }) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = _getEventsForDate(dateStr);
      const isToday = _isSameDay(date, today);
      const classes = [
        'agenda-month-cell',
        !isCurrentMonth ? 'agenda-month-cell--other' : '',
        isToday ? 'agenda-month-cell--today' : ''
      ].filter(Boolean).join(' ');

      html += `<div class="${classes}" data-date="${dateStr}">
        <span class="agenda-month-cell-day${isToday ? ' agenda-month-cell-day--today' : ''}">${date.getDate()}</span>
        <div class="agenda-month-cell-events">
          ${dayEvents.slice(0, 3).map((e, i) => `
            <div class="agenda-event agenda-event--dot" data-event-id="${_escHtml(e.googleEventId)}" style="--event-color:${_getEventColor(i)}">
              ${_escHtml(e.title)}
            </div>
          `).join('')}
          ${dayEvents.length > 3 ? `<span class="agenda-month-cell-more">+${dayEvents.length - 3} mais</span>` : ''}
        </div>
      </div>`;
    });
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ── Render: Conteúdo dinâmico ───────────────────────────────────────────

  function _renderContent() {
    const container = document.getElementById('agendaContent');
    if (!container) return;

    let html = '';

    if (_loading) {
      html = _renderLoading();
    } else if (_error === 'auth_required') {
      html = _renderAuthRequired();
    } else if (_error) {
      html = _renderError();
    } else if (_view === 'day') {
      html = _renderDayView();
    } else if (_view === 'week') {
      html = _renderWeekView();
    } else {
      html = _renderMonthView();
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons({ root: container });
    _bindContentEvents(container);
  }

  // ── Render: Toolbar de navegação ────────────────────────────────────────

  function _renderNavigation() {
    const monthYear = _selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const capitalizedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

    return `<div class="agenda-nav">
      <div class="agenda-nav-left">
        <button class="agenda-nav-btn" id="agendaPrev" title="Anterior">
          <i data-lucide="chevron-left"></i>
        </button>
        <button class="agenda-nav-btn" id="agendaNext" title="Próximo">
          <i data-lucide="chevron-right"></i>
        </button>
        <button class="agenda-nav-btn agenda-nav-today" id="agendaToday">Hoje</button>
        <span class="agenda-nav-period">${_escHtml(capitalizedMonth)}</span>
      </div>
      <div class="agenda-nav-right">
        <div class="asana-views">
          <button class="asana-view-btn${_view === 'day' ? ' asana-view-btn--active' : ''}" data-agenda-view="day">Dia</button>
          <button class="asana-view-btn${_view === 'week' ? ' asana-view-btn--active' : ''}" data-agenda-view="week">Semana</button>
          <button class="asana-view-btn${_view === 'month' ? ' asana-view-btn--active' : ''}" data-agenda-view="month">Mês</button>
        </div>
        <button class="asana-toolbar-btn" id="agendaSyncBtn" title="Sincronizar com Google Calendar">
          <i data-lucide="refresh-cw"></i>
          Sincronizar
        </button>
      </div>
    </div>`;
  }

  // ── Bind eventos ────────────────────────────────────────────────────────

  function _bindContentEvents(container) {
    if (!container) return;

    // Click em evento → abrir detalhes
    container.querySelectorAll('.agenda-event[data-event-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = el.dataset.eventId;
        const event = _events.find(ev => ev.googleEventId === eventId);
        if (event) _openEventDetails(event);
      });
    });

    // Click em dia (month view) → ir para vista dia
    container.querySelectorAll('.agenda-month-cell[data-date]').forEach(cell => {
      cell.addEventListener('dblclick', () => {
        const dateStr = cell.dataset.date;
        _selectedDate = new Date(dateStr + 'T12:00:00');
        _view = 'day';
        _loadEvents();
      });
    });

    // Click em coluna (week view header) → ir para vista dia
    container.querySelectorAll('.agenda-week-day-header[data-date]').forEach(header => {
      header.addEventListener('click', () => {
        const dateStr = header.dataset.date;
        _selectedDate = new Date(dateStr + 'T12:00:00');
        _view = 'day';
        _loadEvents();
      });
    });

    // Botão retry
    const retryBtn = container.querySelector('#agendaRetryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => _loadEvents());
    }
  }

  function _bindNavEvents() {
    const moduleContainer = document.getElementById('moduleContainer');
    if (!moduleContainer) return;

    // Navegação prev/next
    const prevBtn = moduleContainer.querySelector('#agendaPrev');
    const nextBtn = moduleContainer.querySelector('#agendaNext');
    const todayBtn = moduleContainer.querySelector('#agendaToday');
    const syncBtn = moduleContainer.querySelector('#agendaSyncBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        _navigate(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        _navigate(1);
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        _selectedDate = new Date();
        _loadEvents();
      });
    }

    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        syncBtn.classList.add('agenda-syncing');
        try {
          await TBO_GOOGLE_CALENDAR.forceRefresh();
          await _loadEvents();
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.success('Agenda', 'Eventos sincronizados com Google Calendar');
          }
        } catch (e) {
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.error('Agenda', 'Falha ao sincronizar: ' + e.message);
          }
        } finally {
          syncBtn.classList.remove('agenda-syncing');
        }
      });
    }

    // View switcher
    moduleContainer.querySelectorAll('[data-agenda-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        _view = btn.dataset.agendaView;
        moduleContainer.querySelectorAll('[data-agenda-view]').forEach(b =>
          b.classList.toggle('asana-view-btn--active', b === btn)
        );
        _loadEvents();
      });
    });
  }

  function _navigate(direction) {
    if (_view === 'day') {
      _selectedDate.setDate(_selectedDate.getDate() + direction);
    } else if (_view === 'week') {
      _selectedDate.setDate(_selectedDate.getDate() + (7 * direction));
    } else {
      _selectedDate.setMonth(_selectedDate.getMonth() + direction);
    }
    _loadEvents();
  }

  // ── Abrir detalhes de evento ────────────────────────────────────────────

  function _openEventDetails(event) {
    if (typeof TBO_DETAILS_PANEL === 'undefined') return;

    const startDate = event.startAt ? new Date(event.startAt) : null;
    const endDate = event.endAt ? new Date(event.endAt) : null;

    const fields = [
      {
        label: 'Data',
        key: 'date',
        type: 'text',
        value: startDate ? startDate.toLocaleDateString('pt-BR', {
          weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
        }) : '—'
      },
      {
        label: 'Horário',
        key: 'time',
        type: 'text',
        value: event.isAllDay
          ? 'Dia inteiro'
          : `${_formatTime(event.startAt)} — ${_formatTime(event.endAt)}`
      },
      {
        label: 'Duração',
        key: 'duration',
        type: 'text',
        value: startDate && endDate && !event.isAllDay
          ? _formatDuration(endDate - startDate)
          : event.isAllDay ? 'Dia inteiro' : '—'
      },
      {
        label: 'Local',
        key: 'location',
        type: 'text',
        value: event.location || ''
      },
      {
        label: 'Organizador',
        key: 'organizer',
        type: 'text',
        value: event.organizer || ''
      },
      {
        label: 'Status',
        key: 'status',
        type: 'text',
        value: event.status === 'confirmed' ? 'Confirmado'
             : event.status === 'tentative' ? 'Tentativa'
             : event.status === 'cancelled' ? 'Cancelado'
             : event.status || '—'
      }
    ];

    // Seção de participantes
    const sections = [];

    if (event.attendees && event.attendees.length > 0) {
      const attendeesHtml = event.attendees.map(a => {
        const statusIcon = a.responseStatus === 'accepted' ? '✓'
                         : a.responseStatus === 'declined' ? '✗'
                         : a.responseStatus === 'tentative' ? '?'
                         : '—';
        const statusClass = a.responseStatus === 'accepted' ? 'agenda-attendee--accepted'
                          : a.responseStatus === 'declined' ? 'agenda-attendee--declined'
                          : '';
        return `<div class="agenda-attendee ${statusClass}">
          <span class="agenda-attendee-status">${statusIcon}</span>
          <span class="agenda-attendee-name">${_escHtml(a.name || a.email)}</span>
          ${a.name && a.email ? `<span class="agenda-attendee-email">${_escHtml(a.email)}</span>` : ''}
        </div>`;
      }).join('');

      sections.push({
        id: 'attendees',
        label: `Participantes (${event.attendees.length})`,
        icon: 'users',
        html: attendeesHtml
      });
    }

    // Link para Google Calendar
    if (event.htmlLink) {
      sections.push({
        id: 'actions',
        label: 'Ações',
        icon: 'external-link',
        html: `<a href="${_escHtml(event.htmlLink)}" target="_blank" rel="noopener noreferrer" class="agenda-gcal-link">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Abrir no Google Calendar
        </a>`
      });
    }

    TBO_DETAILS_PANEL.open({
      entity: 'Evento',
      entityIcon: 'calendar',
      entityId: event.googleEventId,
      title: event.title,
      fields,
      description: event.description || '',
      sections,
      onSave: null // Read-only — Google Calendar API é somente leitura neste contexto
    });
  }

  function _formatDuration(ms) {
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  function render() {
    // Ativar layout Asana
    if (typeof TBO_ASANA_LAYOUT !== 'undefined') {
      TBO_ASANA_LAYOUT.activate();
    }

    return `<div class="agenda-module">
      ${_renderNavigation()}
      <div class="agenda-content" id="agendaContent">
        ${_renderLoading()}
      </div>
    </div>`;
  }

  function init() {
    _bindNavEvents();

    // Renderizar ícones lucide
    const moduleContainer = document.getElementById('moduleContainer');
    if (moduleContainer && window.lucide) {
      lucide.createIcons({ root: moduleContainer });
    }

    // Carregar eventos
    _loadEvents();

    // Auto-sync periódico
    if (_syncInterval) clearInterval(_syncInterval);
    _syncInterval = setInterval(() => {
      if (_hasGoogleToken && document.visibilityState === 'visible') {
        _loadEvents();
      }
    }, SYNC_INTERVAL);
  }

  function destroy() {
    if (_syncInterval) {
      clearInterval(_syncInterval);
      _syncInterval = null;
    }
    if (typeof TBO_ASANA_LAYOUT !== 'undefined') {
      TBO_ASANA_LAYOUT.deactivate();
    }
    if (typeof TBO_DETAILS_PANEL !== 'undefined') {
      TBO_DETAILS_PANEL.close();
    }
  }

  return {
    render,
    init,
    destroy,
    get currentView() { return _view; },
    get selectedDate() { return new Date(_selectedDate); },
    get events() { return [..._events]; },
    get hasGoogleToken() { return _hasGoogleToken; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_AGENDA = TBO_AGENDA;
}
