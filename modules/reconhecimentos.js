// ============================================================================
// TBO OS — Modulo: Reconhecimentos (Feed + Pontuacao + Recompensas)
// Sprint 2.3 — Sistema de Reconhecimentos + Pontuacao
//
// Tabs:
//   - Feed: timeline tipo LinkedIn de reconhecimentos
//   - Recompensas: catalogo + resgate de rewards
//   - Admin: gestao de rewards (admin/owner only)
// ============================================================================

const TBO_RECONHECIMENTOS = {
  _tab: 'feed',
  _loading: false,
  _recognitions: [],
  _rewards: [],
  _pointsBalance: null,
  _kpis: null,
  _showModal: null,
  _modalData: {},
  _profiles: [],
  _filter: { period: 'all', person: '', value: '' },

  _tabConfig: [
    { id: 'feed',        icon: 'heart',      label: 'Feed' },
    { id: 'recompensas', icon: 'gift',        label: 'Recompensas' },
    { id: 'admin',       icon: 'settings',    label: 'Gestao', adminOnly: true }
  ],

  // ── Valores TBO (configuravel) ──
  _values: [
    { id: 'qualidade',     name: 'Qualidade',          emoji: '🎯' },
    { id: 'colaboracao',   name: 'Colaboracao',         emoji: '🤝' },
    { id: 'inovacao',      name: 'Inovacao',            emoji: '💡' },
    { id: 'compromisso',   name: 'Compromisso',         emoji: '🔥' },
    { id: 'transparencia', name: 'Transparencia',       emoji: '🪟' },
    { id: 'protagonismo',  name: 'Protagonismo',        emoji: '🚀' }
  ],

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  render() {
    const isAdmin = this._isAdmin();
    const visibleTabs = this._tabConfig.filter(t => !t.adminOnly || isAdmin);

    return `
      <style>${this._getStyles()}</style>
      <div class="ap-module">
        <div class="module-header" style="margin-bottom:24px;">
          <div>
            <h2 class="module-title" style="margin:0;">Reconhecimentos</h2>
            <p style="color:var(--text-tertiary);font-size:0.82rem;margin-top:4px;">Valorize seus colegas e acumule pontos para recompensas</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <div id="recPointsBadge" class="rec-points-badge" style="display:none;"></div>
            <button class="btn btn-primary" id="recNewBtn" style="font-size:0.82rem;padding:6px 14px;">
              <i data-lucide="heart" style="width:14px;height:14px;"></i> Reconhecer
            </button>
          </div>
        </div>

        <div class="ap-tabs">
          ${visibleTabs.map(t => `
            <button class="ap-tab-btn ${this._tab === t.id ? 'active' : ''}" data-tab="${t.id}">
              <i data-lucide="${t.icon}" style="width:14px;height:14px;"></i>
              ${t.label}
            </button>
          `).join('')}
        </div>

        <div id="recTabContent" style="margin-top:20px;">
          <div style="text-align:center;padding:40px;color:var(--text-muted);">Carregando...</div>
        </div>
      </div>

      <!-- Modal de novo reconhecimento -->
      <div id="recModal" class="rec-modal-overlay" style="display:none;">
        <div class="rec-modal">
          <div class="rec-modal-header">
            <h3 id="recModalTitle">Novo Reconhecimento</h3>
            <button class="rec-modal-close" id="recModalClose">&times;</button>
          </div>
          <div id="recModalBody" class="rec-modal-body"></div>
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════

  async init() {
    // Tab switching
    document.querySelectorAll('.ap-tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        document.querySelectorAll('.ap-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._renderTab();
      });
    });

    // New recognition button
    document.getElementById('recNewBtn')?.addEventListener('click', () => this._openNewRecognitionModal());

    // Modal close
    document.getElementById('recModalClose')?.addEventListener('click', () => this._closeModal());
    document.getElementById('recModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'recModal') this._closeModal();
    });

    // Load data
    await this._loadData();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  async _loadData() {
    this._loading = true;
    this._renderTab();

    try {
      const [recs, rewards, balance, profiles] = await Promise.all([
        typeof RecognitionsRepo !== 'undefined' ? RecognitionsRepo.list({ limit: 100 }) : { data: [] },
        typeof RecognitionRewardsRepo !== 'undefined' ? RecognitionRewardsRepo.listRewards() : [],
        typeof RecognitionRewardsRepo !== 'undefined' ? RecognitionRewardsRepo.getPointsBalance() : { earned: 0, spent: 0, available: 0 },
        typeof PeopleRepo !== 'undefined' ? PeopleRepo.listProfiles() : []
      ]);

      this._recognitions = recs.data || recs || [];
      this._rewards = rewards || [];
      this._pointsBalance = balance;
      this._profiles = profiles || [];
    } catch (e) {
      console.error('[Reconhecimentos] Erro ao carregar:', e);
    }

    this._loading = false;
    this._renderPointsBadge();
    this._renderTab();
  },

  // ══════════════════════════════════════════════════════════════
  // TAB RENDERERS
  // ══════════════════════════════════════════════════════════════

  _renderTab() {
    const el = document.getElementById('recTabContent');
    if (!el) return;

    if (this._loading) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Carregando...</div>';
      return;
    }

    switch (this._tab) {
      case 'feed': el.innerHTML = this._renderFeed(); break;
      case 'recompensas': el.innerHTML = this._renderRewards(); break;
      case 'admin': el.innerHTML = this._renderAdmin(); break;
    }

    this._bindTabEvents();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ── FEED TAB ──────────────────────────────────────────────

  _renderFeed() {
    const items = this._recognitions;
    if (!items.length) {
      return `<div style="text-align:center;padding:60px;color:var(--text-muted);">
        <i data-lucide="heart" style="width:40px;height:40px;margin-bottom:12px;opacity:0.3;"></i>
        <p>Nenhum reconhecimento ainda.</p>
        <p style="font-size:0.8rem;">Seja o primeiro a reconhecer um colega!</p>
      </div>`;
    }

    // Filters
    const filterHtml = `
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
        <select class="form-input rec-filter" data-filter="value" style="width:auto;padding:4px 8px;font-size:0.78rem;">
          <option value="">Todos os valores</option>
          ${this._values.map(v => `<option value="${v.id}" ${this._filter.value === v.id ? 'selected' : ''}>${v.emoji} ${v.name}</option>`).join('')}
        </select>
        <select class="form-input rec-filter" data-filter="period" style="width:auto;padding:4px 8px;font-size:0.78rem;">
          <option value="all" ${this._filter.period === 'all' ? 'selected' : ''}>Todos os periodos</option>
          <option value="month" ${this._filter.period === 'month' ? 'selected' : ''}>Este mes</option>
          <option value="quarter" ${this._filter.period === 'quarter' ? 'selected' : ''}>Este trimestre</option>
        </select>
      </div>
    `;

    // Apply filters
    let filtered = [...items];
    if (this._filter.value) {
      filtered = filtered.filter(r => r.value_id === this._filter.value);
    }
    if (this._filter.period === 'month') {
      const first = new Date(); first.setDate(1); first.setHours(0,0,0,0);
      filtered = filtered.filter(r => new Date(r.created_at) >= first);
    } else if (this._filter.period === 'quarter') {
      const now = new Date();
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      filtered = filtered.filter(r => new Date(r.created_at) >= qStart);
    }

    const cards = filtered.map(r => {
      const from = this._getProfileName(r.from_user);
      const to = this._getProfileName(r.to_user);
      const fromAvatar = this._getAvatar(r.from_user);
      const toAvatar = this._getAvatar(r.to_user);
      const ago = this._timeAgo(r.created_at);
      const valueObj = this._values.find(v => v.id === r.value_id);

      return `
        <div class="rec-card">
          <div class="rec-card-header">
            <div class="rec-avatar-group">
              <div class="rec-avatar" style="background:var(--color-primary-light);" title="${from}">
                ${fromAvatar ? `<img src="${fromAvatar}" alt="${from}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : from.charAt(0).toUpperCase()}
              </div>
              <i data-lucide="arrow-right" style="width:12px;height:12px;color:var(--text-muted);margin:0 4px;"></i>
              <div class="rec-avatar" style="background:var(--color-success-light);" title="${to}">
                ${toAvatar ? `<img src="${toAvatar}" alt="${to}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : to.charAt(0).toUpperCase()}
              </div>
            </div>
            <div class="rec-card-meta">
              <span class="rec-card-names"><strong>${from}</strong> reconheceu <strong>${to}</strong></span>
              <span class="rec-card-time">${ago}</span>
            </div>
          </div>
          <div class="rec-card-body">
            ${valueObj ? `<span class="rec-value-tag">${valueObj.emoji} ${valueObj.name}</span>` : ''}
            <p class="rec-message">${this._escapeHtml(r.message)}</p>
          </div>
          <div class="rec-card-footer">
            <button class="rec-like-btn" data-id="${r.id}" title="Curtir">
              <i data-lucide="thumbs-up" style="width:13px;height:13px;"></i>
              <span>${r.likes || 0}</span>
            </button>
            <span class="rec-points-label">+${r.points || 1} pts</span>
          </div>
        </div>
      `;
    }).join('');

    return filterHtml + (filtered.length ? cards : '<p style="text-align:center;color:var(--text-muted);padding:20px;">Nenhum reconhecimento neste filtro.</p>');
  },

  // ── REWARDS TAB ───────────────────────────────────────────

  _renderRewards() {
    const balance = this._pointsBalance || { earned: 0, spent: 0, available: 0 };

    const balanceHtml = `
      <div class="rec-balance-bar">
        <div class="rec-balance-item">
          <div class="rec-balance-value" style="color:var(--color-success);">${balance.earned}</div>
          <div class="rec-balance-label">Recebidos</div>
        </div>
        <div class="rec-balance-item">
          <div class="rec-balance-value" style="color:var(--color-warning);">${balance.spent}</div>
          <div class="rec-balance-label">Gastos</div>
        </div>
        <div class="rec-balance-item">
          <div class="rec-balance-value" style="color:var(--color-primary);">${balance.available}</div>
          <div class="rec-balance-label">Disponiveis</div>
        </div>
      </div>
    `;

    if (!this._rewards.length) {
      return balanceHtml + `<p style="text-align:center;padding:40px;color:var(--text-muted);">Nenhuma recompensa disponivel ainda.</p>`;
    }

    const rewardCards = this._rewards.map(r => {
      const canRedeem = balance.available >= r.points_required;
      return `
        <div class="rec-reward-card ${canRedeem ? '' : 'rec-reward-disabled'}">
          <div class="rec-reward-icon">${this._getRewardIcon(r.type)}</div>
          <div class="rec-reward-info">
            <h4>${this._escapeHtml(r.name)}</h4>
            <p>${this._escapeHtml(r.description || '')}</p>
            ${r.value_brl ? `<span class="rec-reward-value">R$ ${Number(r.value_brl).toFixed(2)}</span>` : ''}
          </div>
          <div class="rec-reward-action">
            <div class="rec-reward-points">${r.points_required} pts</div>
            <button class="btn btn-sm ${canRedeem ? 'btn-primary' : 'btn-secondary'}"
                    ${canRedeem ? '' : 'disabled'}
                    data-redeem="${r.id}" data-pts="${r.points_required}">
              ${canRedeem ? 'Resgatar' : 'Pts insuficientes'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    return balanceHtml + '<div class="rec-rewards-grid">' + rewardCards + '</div>';
  },

  // ── ADMIN TAB ─────────────────────────────────────────────

  _renderAdmin() {
    if (!this._isAdmin()) return '<p style="color:var(--text-muted);padding:20px;">Acesso restrito a administradores.</p>';

    const rewards = this._rewards;
    const rows = rewards.map(r => `
      <tr>
        <td>${this._escapeHtml(r.name)}</td>
        <td>${r.type}</td>
        <td>${r.points_required}</td>
        <td>${r.value_brl ? 'R$ ' + Number(r.value_brl).toFixed(2) : '-'}</td>
        <td><span class="badge ${r.active ? 'badge-success' : 'badge-neutral'}">${r.active ? 'Ativo' : 'Inativo'}</span></td>
        <td>
          <button class="btn btn-ghost btn-sm" data-edit-reward="${r.id}" title="Editar">
            <i data-lucide="edit-2" style="width:13px;height:13px;"></i>
          </button>
        </td>
      </tr>
    `).join('');

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;font-size:0.95rem;">Catalogo de Recompensas</h3>
        <button class="btn btn-primary btn-sm" id="recAddReward">
          <i data-lucide="plus" style="width:13px;height:13px;"></i> Nova Recompensa
        </button>
      </div>
      <table class="ap-table">
        <thead>
          <tr><th>Nome</th><th>Tipo</th><th>Pontos</th><th>Valor</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Nenhuma recompensa cadastrada</td></tr>'}</tbody>
      </table>

      <h3 style="margin:24px 0 12px;font-size:0.95rem;">Resgates Pendentes</h3>
      <div id="recPendingRedemptions">Carregando...</div>
    `;
  },

  // ══════════════════════════════════════════════════════════════
  // EVENTS
  // ══════════════════════════════════════════════════════════════

  _bindTabEvents() {
    // Filter change
    document.querySelectorAll('.rec-filter').forEach(sel => {
      sel.addEventListener('change', () => {
        this._filter[sel.dataset.filter] = sel.value;
        this._renderTab();
      });
    });

    // Like
    document.querySelectorAll('.rec-like-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        try {
          await RecognitionsRepo.like(id);
          const span = btn.querySelector('span');
          span.textContent = Number(span.textContent) + 1;
        } catch (e) { console.error('Erro ao curtir:', e); }
      });
    });

    // Redeem
    document.querySelectorAll('[data-redeem]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const rewardId = btn.dataset.redeem;
        const pts = Number(btn.dataset.pts);
        if (!confirm(`Resgatar esta recompensa por ${pts} pontos?`)) return;
        try {
          await RecognitionRewardsRepo.createRedemption(rewardId, pts);
          TBO_TOAST?.success('Resgate solicitado! Aguarde aprovacao.');
          await this._loadData();
        } catch (e) {
          TBO_TOAST?.error('Erro ao resgatar: ' + e.message);
        }
      });
    });

    // Admin: add reward
    document.getElementById('recAddReward')?.addEventListener('click', () => this._openRewardModal());

    // Admin: edit reward
    document.querySelectorAll('[data-edit-reward]').forEach(btn => {
      btn.addEventListener('click', () => {
        const reward = this._rewards.find(r => r.id === btn.dataset.editReward);
        if (reward) this._openRewardModal(reward);
      });
    });

    // Load pending redemptions for admin
    if (this._tab === 'admin' && this._isAdmin()) {
      this._loadPendingRedemptions();
    }
  },

  async _loadPendingRedemptions() {
    const el = document.getElementById('recPendingRedemptions');
    if (!el) return;

    try {
      const pending = await RecognitionRewardsRepo.listRedemptions({ status: 'pending' });
      if (!pending.length) {
        el.innerHTML = '<p style="color:var(--text-muted);">Nenhum resgate pendente.</p>';
        return;
      }

      el.innerHTML = pending.map(r => `
        <div class="rec-pending-item">
          <div>
            <strong>${this._getProfileName(r.user_id)}</strong> quer resgatar
            <strong>${r.recognition_rewards?.name || 'Recompensa'}</strong> (${r.points_spent} pts)
            <span style="color:var(--text-muted);font-size:0.78rem;margin-left:8px;">${this._timeAgo(r.redeemed_at)}</span>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm btn-primary" data-approve="${r.id}">Aprovar</button>
            <button class="btn btn-sm btn-ghost" data-reject="${r.id}">Rejeitar</button>
          </div>
        </div>
      `).join('');

      el.querySelectorAll('[data-approve]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await RecognitionRewardsRepo.approveRedemption(btn.dataset.approve, true);
          TBO_TOAST?.success('Resgate aprovado!');
          this._loadPendingRedemptions();
        });
      });

      el.querySelectorAll('[data-reject]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await RecognitionRewardsRepo.approveRedemption(btn.dataset.reject, false);
          TBO_TOAST?.info('Resgate rejeitado.');
          this._loadPendingRedemptions();
        });
      });
    } catch (e) {
      el.innerHTML = '<p style="color:var(--color-error);">Erro ao carregar resgates.</p>';
    }
  },

  // ══════════════════════════════════════════════════════════════
  // MODALS
  // ══════════════════════════════════════════════════════════════

  _openNewRecognitionModal() {
    const profileOptions = this._profiles.map(p =>
      `<option value="${p.supabase_uid || p.id}">${p.name || p.full_name || p.id}</option>`
    ).join('');

    const valueOptions = this._values.map(v =>
      `<option value="${v.id}">${v.emoji} ${v.name}</option>`
    ).join('');

    document.getElementById('recModalTitle').textContent = 'Novo Reconhecimento';
    document.getElementById('recModalBody').innerHTML = `
      <form id="recForm" class="rec-form">
        <div class="form-group">
          <label>Quem voce quer reconhecer?</label>
          <select name="to_user" class="form-input" required>
            <option value="">Selecione...</option>
            ${profileOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Valor TBO</label>
          <select name="value_id" class="form-input" required>
            ${valueOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Mensagem</label>
          <textarea name="message" class="form-input" rows="3" required placeholder="Descreva por que essa pessoa merece ser reconhecida..."></textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
          <button type="button" class="btn btn-ghost" id="recFormCancel">Cancelar</button>
          <button type="submit" class="btn btn-primary">Enviar Reconhecimento</button>
        </div>
      </form>
    `;

    document.getElementById('recModal').style.display = 'flex';
    document.getElementById('recFormCancel')?.addEventListener('click', () => this._closeModal());

    document.getElementById('recForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const toUser = form.to_user.value;
      const valueId = form.value_id.value;
      const message = form.message.value;
      const valueObj = this._values.find(v => v.id === valueId);

      try {
        await RecognitionsRepo.create({
          to_user: toUser,
          value_id: valueId,
          value_name: valueObj?.name || valueId,
          value_emoji: valueObj?.emoji || '',
          message,
          points: 1
        });

        // Send inbox notification to recipient
        if (typeof InboxRepo !== 'undefined') {
          const tid = typeof RepoBase !== 'undefined' ? RepoBase.requireTenantId() : null;
          const fromName = this._getProfileName(typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.supabaseId : null);
          if (tid) {
            await InboxRepo.create({
              tenant_id: tid,
              user_id: toUser,
              type: 'recognition',
              title: `${valueObj?.emoji || ''} Voce foi reconhecido!`,
              body: `${fromName} reconheceu voce por ${valueObj?.name || 'valor'}: "${message.substring(0, 100)}"`,
              metadata: { value_id: valueId }
            });
          }
        }

        TBO_TOAST?.success('Reconhecimento enviado!');
        this._closeModal();
        await this._loadData();
      } catch (err) {
        TBO_TOAST?.error('Erro: ' + err.message);
      }
    });
  },

  _openRewardModal(existing) {
    const isEdit = !!existing;
    document.getElementById('recModalTitle').textContent = isEdit ? 'Editar Recompensa' : 'Nova Recompensa';
    document.getElementById('recModalBody').innerHTML = `
      <form id="recRewardForm" class="rec-form">
        <div class="form-group">
          <label>Nome</label>
          <input type="text" name="name" class="form-input" required value="${isEdit ? this._escapeHtml(existing.name) : ''}">
        </div>
        <div class="form-group">
          <label>Descricao</label>
          <textarea name="description" class="form-input" rows="2">${isEdit ? this._escapeHtml(existing.description || '') : ''}</textarea>
        </div>
        <div style="display:flex;gap:12px;">
          <div class="form-group" style="flex:1;">
            <label>Tipo</label>
            <select name="type" class="form-input">
              ${['voucher', 'experience', 'gift', 'custom'].map(t =>
                `<option value="${t}" ${isEdit && existing.type === t ? 'selected' : ''}>${t}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group" style="flex:1;">
            <label>Pontos necessarios</label>
            <input type="number" name="points_required" class="form-input" required min="1" value="${isEdit ? existing.points_required : 10}">
          </div>
        </div>
        <div class="form-group">
          <label>Valor em R$ (opcional)</label>
          <input type="number" name="value_brl" class="form-input" step="0.01" min="0" value="${isEdit && existing.value_brl ? existing.value_brl : ''}">
        </div>
        ${isEdit ? `
          <div class="form-group">
            <label><input type="checkbox" name="active" ${existing.active ? 'checked' : ''}> Ativo</label>
          </div>
        ` : ''}
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
          <button type="button" class="btn btn-ghost" id="recRewardCancel">Cancelar</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar' : 'Criar'}</button>
        </div>
      </form>
    `;

    document.getElementById('recModal').style.display = 'flex';
    document.getElementById('recRewardCancel')?.addEventListener('click', () => this._closeModal());

    document.getElementById('recRewardForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {
        name: form.name.value,
        description: form.description.value,
        type: form.type.value,
        points_required: Number(form.points_required.value),
        value_brl: form.value_brl.value ? Number(form.value_brl.value) : null
      };
      if (isEdit && form.active) payload.active = form.active.checked;

      try {
        if (isEdit) {
          await RecognitionRewardsRepo.updateReward(existing.id, payload);
          TBO_TOAST?.success('Recompensa atualizada!');
        } else {
          payload.active = true;
          await RecognitionRewardsRepo.createReward(payload);
          TBO_TOAST?.success('Recompensa criada!');
        }
        this._closeModal();
        await this._loadData();
      } catch (err) {
        TBO_TOAST?.error('Erro: ' + err.message);
      }
    });
  },

  _closeModal() {
    const modal = document.getElementById('recModal');
    if (modal) modal.style.display = 'none';
  },

  // ══════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════

  _renderPointsBadge() {
    const el = document.getElementById('recPointsBadge');
    if (!el || !this._pointsBalance) return;
    el.style.display = 'flex';
    el.innerHTML = `<i data-lucide="star" style="width:14px;height:14px;color:#F59E0B;"></i> ${this._pointsBalance.available} pts`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _getProfileName(userId) {
    if (!userId) return 'Desconhecido';
    const p = this._profiles.find(p => (p.supabase_uid || p.id) === userId);
    return p?.name || p?.full_name || userId.substring(0, 8);
  },

  _getAvatar(userId) {
    const p = this._profiles.find(p => (p.supabase_uid || p.id) === userId);
    return p?.avatar_url || null;
  },

  _isAdmin() {
    if (typeof TBO_AUTH === 'undefined') return false;
    const u = TBO_AUTH.getCurrentUser();
    return u?.role === 'owner' || u?.role === 'admin';
  },

  _getRewardIcon(type) {
    const icons = { voucher: '🎫', experience: '🎬', gift: '🎁', custom: '⭐' };
    return icons[type] || '🎁';
  },

  _escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    if (days < 30) return `${days}d`;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  },

  // ══════════════════════════════════════════════════════════════
  // STYLES
  // ══════════════════════════════════════════════════════════════

  _getStyles() {
    return `
      .rec-points-badge {
        display:flex; align-items:center; gap:4px;
        background:rgba(245,158,11,0.1); color:#F59E0B;
        padding:6px 12px; border-radius:20px; font-weight:600; font-size:0.82rem;
      }
      .rec-card {
        background:var(--bg-card); border:1px solid var(--border); border-radius:12px;
        padding:16px; margin-bottom:12px; transition:box-shadow 0.2s;
      }
      .rec-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      .rec-card-header { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
      .rec-avatar-group { display:flex; align-items:center; }
      .rec-avatar {
        width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center;
        font-weight:600; font-size:0.78rem; color:var(--text-primary); flex-shrink:0;
      }
      .rec-card-meta { display:flex; flex-direction:column; }
      .rec-card-names { font-size:0.82rem; }
      .rec-card-time { font-size:0.72rem; color:var(--text-muted); }
      .rec-value-tag {
        display:inline-block; background:var(--bg-hover); padding:2px 10px; border-radius:12px;
        font-size:0.75rem; font-weight:500; margin-bottom:6px;
      }
      .rec-message { font-size:0.85rem; color:var(--text-secondary); margin:4px 0 0; line-height:1.4; }
      .rec-card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
      .rec-like-btn {
        display:flex; align-items:center; gap:4px; background:none; border:1px solid var(--border);
        border-radius:16px; padding:3px 10px; font-size:0.75rem; cursor:pointer; color:var(--text-muted);
        transition: all 0.2s;
      }
      .rec-like-btn:hover { border-color:var(--color-primary); color:var(--color-primary); }
      .rec-points-label { font-size:0.72rem; color:var(--color-success); font-weight:600; }

      /* Balance bar */
      .rec-balance-bar {
        display:flex; gap:16px; margin-bottom:24px; padding:16px;
        background:var(--bg-card); border:1px solid var(--border); border-radius:12px;
      }
      .rec-balance-item { flex:1; text-align:center; }
      .rec-balance-value { font-size:1.4rem; font-weight:700; }
      .rec-balance-label { font-size:0.72rem; color:var(--text-muted); margin-top:2px; }

      /* Rewards */
      .rec-rewards-grid { display:flex; flex-direction:column; gap:12px; }
      .rec-reward-card {
        display:flex; align-items:center; gap:16px; padding:16px;
        background:var(--bg-card); border:1px solid var(--border); border-radius:12px;
      }
      .rec-reward-disabled { opacity:0.5; }
      .rec-reward-icon { font-size:2rem; }
      .rec-reward-info { flex:1; }
      .rec-reward-info h4 { margin:0; font-size:0.9rem; }
      .rec-reward-info p { margin:2px 0 0; font-size:0.78rem; color:var(--text-muted); }
      .rec-reward-value { font-size:0.72rem; color:var(--color-success); font-weight:600; }
      .rec-reward-action { text-align:center; }
      .rec-reward-points { font-size:1.1rem; font-weight:700; color:var(--color-primary); margin-bottom:6px; }

      /* Admin pending */
      .rec-pending-item {
        display:flex; align-items:center; justify-content:space-between;
        padding:12px; border:1px solid var(--border); border-radius:8px; margin-bottom:8px;
        font-size:0.82rem;
      }

      /* Modal */
      .rec-modal-overlay {
        position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000;
        display:flex; align-items:center; justify-content:center;
      }
      .rec-modal {
        background:var(--bg-card); border-radius:16px; width:480px; max-width:90vw;
        max-height:85vh; overflow-y:auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      .rec-modal-header {
        display:flex; justify-content:space-between; align-items:center;
        padding:16px 20px; border-bottom:1px solid var(--border);
      }
      .rec-modal-header h3 { margin:0; font-size:1rem; }
      .rec-modal-close { background:none; border:none; font-size:1.3rem; cursor:pointer; color:var(--text-muted); }
      .rec-modal-body { padding:20px; }
      .rec-form .form-group { margin-bottom:14px; }
      .rec-form label { display:block; font-size:0.78rem; font-weight:500; margin-bottom:4px; color:var(--text-secondary); }
    `;
  }
};

if (typeof window !== 'undefined') {
  window.TBO_RECONHECIMENTOS = TBO_RECONHECIMENTOS;
}
