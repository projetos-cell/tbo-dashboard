/**
 * TBO OS — Hover Card de Pessoa (PRD People v1.0)
 *
 * Componente reutilizável que exibe mini-perfil ao hover em qualquer
 * elemento com atributo data-person-id.
 *
 * Uso: após innerHTML, chamar TBO_HOVER_CARD.bind(container).
 * Dados: TBO_RH cache → PeopleRepo fallback.
 * XSS: usa TBO_SANITIZE.html() para todo dado do usuário.
 */

const TBO_HOVER_CARD = (() => {
  let _cardEl = null;
  let _showTimer = null;
  let _hideTimer = null;
  let _currentPersonId = null;
  const SHOW_DELAY = 300;
  const HIDE_DELAY = 250;

  // ── Helpers ──────────────────────────────────────────────

  function _esc(s) {
    if (typeof TBO_SANITIZE !== 'undefined' && TBO_SANITIZE.html) return TBO_SANITIZE.html(s);
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  }

  const _buColors = { 'Branding': '#8B5CF6', 'Digital 3D': '#3A7BD5', 'Marketing': '#F59E0B', 'Vendas': '#2ECC71' };

  const _statusLabels = {
    'active': { label: 'Ativo', color: '#10B981' },
    'inactive': { label: 'Inativo', color: '#EF4444' },
    'vacation': { label: 'Férias', color: '#F59E0B' },
    'away': { label: 'Ausente', color: '#8B5CF6' },
    'onboarding': { label: 'Onboarding', color: '#3B82F6' },
    'suspended': { label: 'Suspenso', color: '#DC2626' }
  };

  // ── Buscar dados da pessoa ────────────────────────────────

  function _findPerson(personId) {
    // 1. Tentar TBO_RH cache (rápido)
    if (typeof TBO_RH !== 'undefined' && TBO_RH._teamLoaded) {
      const p = TBO_RH._team.find(t =>
        t.id === personId || t.supabaseId === personId
      );
      if (p) return p;
    }
    return null;
  }

  async function _fetchPerson(personId) {
    // 2. Fallback: PeopleRepo
    if (typeof PeopleRepo !== 'undefined') {
      try {
        return await PeopleRepo.getById(personId);
      } catch { /* ignorar */ }
    }
    return null;
  }

  // ── Render ────────────────────────────────────────────────

  function _renderCard(person) {
    const name = person.nome || person.full_name || '';
    const cargo = person.cargo || '';
    const email = person.email || '';
    const bu = person.bu || '';
    const status = person.status || (person.is_active !== false ? 'active' : 'inactive');
    const avatarUrl = person.avatarUrl || person.avatar_url || '';
    const personRoute = person.supabaseId || person.id || '';
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const buColor = _buColors[bu] || '#64748B';
    const statusInfo = _statusLabels[status] || _statusLabels['active'];

    const avatarHTML = avatarUrl
      ? `<img src="${_esc(avatarUrl)}" alt="${_esc(initials)}" class="tbo-hover-card__avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        + `<div class="tbo-hover-card__avatar-initials" style="background:${buColor}20;color:${buColor};display:none;">${initials}</div>`
      : `<div class="tbo-hover-card__avatar-initials" style="background:${buColor}20;color:${buColor};">${initials}</div>`;

    return `
      <div class="tbo-hover-card__header">
        ${avatarHTML}
        <div class="tbo-hover-card__info">
          <div class="tbo-hover-card__name">${_esc(name)}</div>
          <div class="tbo-hover-card__role">${_esc(cargo)}</div>
        </div>
      </div>
      <div class="tbo-hover-card__tags">
        ${bu ? `<span class="tbo-hover-card__tag" style="background:${buColor}18;color:${buColor};">${_esc(bu)}</span>` : ''}
        <span class="tbo-hover-card__tag" style="background:${statusInfo.color}18;color:${statusInfo.color};">
          <span style="width:6px;height:6px;border-radius:50%;background:${statusInfo.color};display:inline-block;"></span>
          ${statusInfo.label}
        </span>
      </div>
      <div class="tbo-hover-card__email">${_esc(email)}</div>
      <div class="tbo-hover-card__actions">
        <a href="#people/${_esc(personRoute)}/overview" class="btn btn-primary" onclick="TBO_HOVER_CARD.hide()">
          <i data-lucide="user" style="width:12px;height:12px;"></i> Ver Perfil
        </a>
        <a href="#chat" class="btn btn-secondary" onclick="TBO_HOVER_CARD.hide()">
          <i data-lucide="message-circle" style="width:12px;height:12px;"></i> Mensagem
        </a>
      </div>`;
  }

  function _renderSkeleton() {
    return `
      <div class="tbo-hover-card__header">
        <div class="tbo-hover-card__avatar-initials" style="background:rgba(255,255,255,0.05);"></div>
        <div class="tbo-hover-card__info">
          <div style="width:70%;height:12px;background:rgba(255,255,255,0.06);border-radius:4px;margin-bottom:6px;"></div>
          <div style="width:50%;height:10px;background:rgba(255,255,255,0.04);border-radius:4px;"></div>
        </div>
      </div>`;
  }

  // ── Posicionamento viewport-aware ──────────────────────────

  function _position(anchor) {
    if (!_cardEl) return;
    const rect = anchor.getBoundingClientRect();
    const cardW = 280;
    const cardH = _cardEl.offsetHeight || 200;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = rect.bottom + 8;
    let left = rect.left;

    // Se sai pela direita
    if (left + cardW > vw - 16) left = vw - cardW - 16;
    // Se sai por baixo → mostrar acima
    if (top + cardH > vh - 16) top = rect.top - cardH - 8;
    // Clamp mínimos
    if (left < 8) left = 8;
    if (top < 8) top = 8;

    _cardEl.style.top = `${top}px`;
    _cardEl.style.left = `${left}px`;
  }

  // ── Criar/destruir card DOM ─────────────────────────────

  function _ensureCardEl() {
    if (_cardEl) return;
    _cardEl = document.createElement('div');
    _cardEl.className = 'tbo-hover-card';
    _cardEl.addEventListener('mouseenter', () => clearTimeout(_hideTimer));
    _cardEl.addEventListener('mouseleave', () => _scheduleHide());
    document.body.appendChild(_cardEl);
  }

  function _scheduleHide() {
    _hideTimer = setTimeout(() => {
      if (_cardEl) _cardEl.classList.remove('visible');
      _currentPersonId = null;
    }, HIDE_DELAY);
  }

  // ── API pública ────────────────────────────────────────────

  return {

    /**
     * Vincula hover em todos os [data-person-id] dentro do container.
     * Chamar após qualquer innerHTML que renderize nomes de pessoas.
     */
    bind(container) {
      const root = container || document;
      root.querySelectorAll('[data-person-id]').forEach(el => {
        // Evitar duplo-bind
        if (el._hoverCardBound) return;
        el._hoverCardBound = true;
        el.style.cursor = 'pointer';

        el.addEventListener('mouseenter', () => {
          const pid = el.dataset.personId;
          if (!pid) return;
          clearTimeout(_hideTimer);
          _showTimer = setTimeout(() => this.show(el, pid), SHOW_DELAY);
        });

        el.addEventListener('mouseleave', () => {
          clearTimeout(_showTimer);
          _scheduleHide();
        });
      });
    },

    /**
     * Mostra hover card para uma pessoa (chamado internamente ou manualmente).
     */
    async show(anchor, personId) {
      _ensureCardEl();
      _currentPersonId = personId;

      // Mostrar skeleton imediatamente
      _cardEl.innerHTML = _renderSkeleton();
      _position(anchor);
      _cardEl.classList.add('visible');

      // Tentar cache primeiro
      let person = _findPerson(personId);

      if (!person) {
        person = await _fetchPerson(personId);
      }

      // Se mudou de pessoa durante o fetch, ignorar
      if (_currentPersonId !== personId) return;

      if (person) {
        _cardEl.innerHTML = _renderCard(person);
        _position(anchor);
        if (window.lucide) lucide.createIcons({ attrs: { class: '' } });
      } else {
        _cardEl.classList.remove('visible');
      }
    },

    /**
     * Esconde o hover card imediatamente.
     */
    hide() {
      clearTimeout(_showTimer);
      clearTimeout(_hideTimer);
      if (_cardEl) _cardEl.classList.remove('visible');
      _currentPersonId = null;
    },

    /**
     * Remove o card do DOM (cleanup).
     */
    destroy() {
      this.hide();
      if (_cardEl && _cardEl.parentNode) {
        _cardEl.parentNode.removeChild(_cardEl);
      }
      _cardEl = null;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_HOVER_CARD = TBO_HOVER_CARD;
}
