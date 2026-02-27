// ============================================================================
// TBO OS — OKRs: Tab Check-ins
// Lista de KRs do usuario, flow de check-in, historico timeline
// ============================================================================

const TBO_OKRS_CHECKINS = {

  _portal: null,
  _myKRs: [],
  _checkinHistory: {},    // { krId: [checkins] }
  _activeCheckin: null,   // KR id being checked in
  _viewingHistory: null,  // KR id showing history
  _loading: false,

  setup(portal) {
    this._portal = portal;
  },

  render() {
    const p = this._portal;
    const objectives = p ? p._objectives : [];

    // Extrair todos KRs com objective info
    const allKRs = [];
    objectives.forEach(obj => {
      const krs = obj.okr_key_results || [];
      krs.forEach(kr => {
        allKRs.push({
          ...kr,
          _objTitle: obj.title,
          _objLevel: obj.level,
          _objBu: obj.bu
        });
      });
    });

    // Filtrar KRs ativos
    const activeKRs = allKRs.filter(kr => kr.status === 'active');

    return `
      <div class="card" style="padding:16px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h3 style="margin:0 0 4px;font-size:0.92rem;">Check-ins</h3>
            <p style="color:var(--text-muted);font-size:0.75rem;margin:0;">
              Atualize o progresso dos seus Key Results
            </p>
          </div>
          <div style="font-size:0.78rem;color:var(--text-muted);">
            ${activeKRs.length} KR${activeKRs.length !== 1 ? 's' : ''} ativo${activeKRs.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      ${activeKRs.length === 0 ? this._renderEmptyState() : ''}

      <!-- KR List -->
      <div id="okrCheckinsList">
        ${activeKRs.map(kr => this._renderKRCard(kr)).join('')}
      </div>

      <!-- Checkin Modal (inline) -->
      ${this._activeCheckin ? this._renderCheckinModal(allKRs.find(k => k.id === this._activeCheckin)) : ''}

      <!-- History Panel -->
      ${this._viewingHistory ? this._renderHistoryPanel() : ''}
    `;
  },

  bind() {
    // Check-in buttons
    document.querySelectorAll('.okr-checkin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._activeCheckin = btn.dataset.krId;
        this._portal._rerender();
      });
    });

    // History buttons
    document.querySelectorAll('.okr-history-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const krId = btn.dataset.krId;
        if (this._viewingHistory === krId) {
          this._viewingHistory = null;
          this._portal._rerender();
          return;
        }
        this._viewingHistory = krId;
        // Load history
        if (!this._checkinHistory[krId]) {
          try {
            if (typeof OkrsRepo !== 'undefined') {
              this._checkinHistory[krId] = await OkrsRepo.listCheckins(krId);
            }
          } catch (err) {
            console.warn('[OKR Checkins] Erro ao carregar historico:', err.message);
            this._checkinHistory[krId] = [];
          }
        }
        this._portal._rerender();
      });
    });

    // Modal submit
    const form = document.getElementById('okrCheckinForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this._handleCheckinSubmit();
      });
    }

    // Modal cancel
    const cancelBtn = document.getElementById('okrCheckinCancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this._activeCheckin = null;
        this._portal._rerender();
      });
    }

    // Close modal on overlay click
    const overlay = document.getElementById('okrCheckinOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this._activeCheckin = null;
          this._portal._rerender();
        }
      });
    }
  },

  _renderKRCard(kr) {
    const target = Number(kr.target_value || 1);
    const start = Number(kr.start_value || 0);
    const current = Number(kr.current_value || 0);
    const range = target - start;
    const pct = range > 0 ? Math.min(100, Math.max(0, ((current - start) / range) * 100)) : 0;

    const confStyles = {
      on_track: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', label: 'On Track', icon: 'check-circle-2' },
      at_risk:  { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Em Risco', icon: 'alert-triangle' },
      behind:   { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'Atrasado', icon: 'alert-circle' }
    };
    const cs = confStyles[kr.confidence] || confStyles.on_track;
    const isViewingHistory = this._viewingHistory === kr.id;

    return `
      <div class="card" style="padding:14px 16px;margin-bottom:8px;border-left:3px solid ${cs.color};">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">${this._esc(kr.title)}</span>
              <span style="font-size:0.62rem;padding:1px 6px;border-radius:10px;background:${cs.bg};color:${cs.color};font-weight:600;">
                <i data-lucide="${cs.icon}" style="width:10px;height:10px;vertical-align:-1px;"></i>
                ${cs.label}
              </span>
            </div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:6px;">
              <i data-lucide="target" style="width:10px;height:10px;vertical-align:-1px;"></i>
              ${this._esc(kr._objTitle)}
              ${kr._objBu ? ' · ' + this._esc(kr._objBu) : ''}
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="flex:1;max-width:200px;height:5px;background:var(--bg-tertiary);border-radius:3px;">
                <div style="width:${pct}%;height:100%;background:${cs.color};border-radius:3px;transition:width 0.5s;"></div>
              </div>
              <span style="font-size:0.75rem;font-weight:600;color:${cs.color};">${pct.toFixed(0)}%</span>
              <span style="font-size:0.72rem;color:var(--text-muted);">
                ${current}${kr.unit ? ' ' + kr.unit : ''} / ${target}${kr.unit ? ' ' + kr.unit : ''}
              </span>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            <button class="btn btn-sm okr-history-btn" data-kr-id="${kr.id}" style="font-size:0.72rem;padding:4px 8px;${isViewingHistory ? 'background:var(--bg-tertiary);' : ''}">
              <i data-lucide="clock" style="width:12px;height:12px;"></i>
            </button>
            <button class="btn btn-primary btn-sm okr-checkin-btn" data-kr-id="${kr.id}" style="font-size:0.72rem;padding:4px 10px;">
              <i data-lucide="check-square" style="width:12px;height:12px;"></i> Check-in
            </button>
          </div>
        </div>
      </div>
    `;
  },

  _renderCheckinModal(kr) {
    if (!kr) return '';
    const current = Number(kr.current_value || 0);

    return `
      <div id="okrCheckinOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:999;display:flex;align-items:center;justify-content:center;">
        <div style="background:var(--bg-primary);border-radius:12px;padding:24px;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
          <h3 style="margin:0 0 4px;font-size:0.95rem;">Check-in: ${this._esc(kr.title)}</h3>
          <p style="color:var(--text-muted);font-size:0.75rem;margin:0 0 16px;">
            Objetivo: ${this._esc(kr._objTitle)} · Atual: ${current}${kr.unit ? ' ' + kr.unit : ''}
          </p>

          <form id="okrCheckinForm">
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label" style="font-size:0.78rem;">Novo Valor</label>
              <input type="number" step="any" id="okrCiNewValue" class="form-input"
                     value="${current}" required
                     style="font-size:0.85rem;">
              <span style="font-size:0.68rem;color:var(--text-muted);">
                Meta: ${kr.target_value}${kr.unit ? ' ' + kr.unit : ''}
              </span>
            </div>

            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label" style="font-size:0.78rem;">Confianca</label>
              <select id="okrCiConfidence" class="form-input" style="font-size:0.85rem;">
                <option value="on_track" ${kr.confidence === 'on_track' ? 'selected' : ''}>On Track — No caminho</option>
                <option value="at_risk" ${kr.confidence === 'at_risk' ? 'selected' : ''}>Em Risco — Precisamos atentar</option>
                <option value="behind" ${kr.confidence === 'behind' ? 'selected' : ''}>Atrasado — Abaixo do esperado</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-size:0.78rem;">Notas (opcional)</label>
              <textarea id="okrCiNotes" class="form-input" rows="3"
                        placeholder="O que mudou? Bloqueios? Proximos passos..."
                        style="font-size:0.82rem;resize:vertical;"></textarea>
            </div>

            <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button type="button" id="okrCheckinCancel" class="btn" style="font-size:0.82rem;">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="font-size:0.82rem;">
                <i data-lucide="check" style="width:14px;height:14px;"></i> Salvar Check-in
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  _renderHistoryPanel() {
    const history = this._checkinHistory[this._viewingHistory] || [];

    if (history.length === 0) {
      return `
        <div class="card" style="padding:16px;margin-top:8px;text-align:center;">
          <p style="color:var(--text-muted);font-size:0.8rem;margin:0;">
            <i data-lucide="clock" style="width:14px;height:14px;vertical-align:-2px;"></i>
            Nenhum check-in registrado ainda
          </p>
        </div>
      `;
    }

    return `
      <div class="card" style="padding:16px;margin-top:8px;">
        <h4 style="margin:0 0 12px;font-size:0.85rem;">
          <i data-lucide="clock" style="width:14px;height:14px;vertical-align:-2px;"></i>
          Historico de Check-ins
        </h4>
        <div style="border-left:2px solid var(--border-default);padding-left:16px;margin-left:6px;">
          ${history.map(ci => {
            const date = new Date(ci.created_at);
            const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            const confStyles = {
              on_track: '#22C55E',
              at_risk: '#F59E0B',
              behind: '#EF4444'
            };
            const color = confStyles[ci.confidence] || '#999';
            const delta = Number(ci.new_value) - Number(ci.previous_value || 0);
            const deltaStr = delta >= 0 ? '+' + delta : '' + delta;

            return `
              <div style="position:relative;margin-bottom:12px;">
                <div style="position:absolute;left:-22px;top:2px;width:12px;height:12px;border-radius:50%;background:${color};border:2px solid var(--bg-primary);"></div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:2px;">${dateStr}</div>
                <div style="font-size:0.82rem;">
                  <span style="font-weight:600;">${ci.new_value}</span>
                  <span style="font-size:0.72rem;color:${delta >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};margin-left:4px;">(${deltaStr})</span>
                </div>
                ${ci.notes ? `<p style="font-size:0.72rem;color:var(--text-muted);margin:2px 0 0;">${this._esc(ci.notes)}</p>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  async _handleCheckinSubmit() {
    const newValue = parseFloat(document.getElementById('okrCiNewValue')?.value);
    const confidence = document.getElementById('okrCiConfidence')?.value || 'on_track';
    const notes = document.getElementById('okrCiNotes')?.value || '';

    if (isNaN(newValue)) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Informe um valor valido');
      return;
    }

    try {
      if (typeof OkrsRepo === 'undefined') throw new Error('OkrsRepo nao disponivel');

      await OkrsRepo.createCheckin({
        key_result_id: this._activeCheckin,
        new_value: newValue,
        confidence,
        notes
      });

      // Clear cache
      delete this._checkinHistory[this._activeCheckin];
      this._activeCheckin = null;

      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Check-in', 'Salvo com sucesso');

      // Reload data
      if (this._portal && this._portal._loadData) {
        await this._portal._loadData();
      }
      this._portal._rerender();

    } catch (err) {
      console.error('[OKR Checkin] Erro:', err);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', err.message || 'Falha ao salvar check-in');
    }
  },

  _renderEmptyState() {
    return `
      <div class="card" style="padding:48px;text-align:center;">
        <i data-lucide="check-square" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
        <h3 style="margin:0 0 8px;font-size:1rem;">Sem Key Results para check-in</h3>
        <p style="color:var(--text-muted);font-size:0.82rem;margin:0 0 16px;">
          Crie OKRs com Key Results para comecar a registrar check-ins.
        </p>
        <button class="btn btn-primary okr-new-btn">
          <i data-lucide="plus" style="width:14px;height:14px;"></i> Criar OKR
        </button>
      </div>
    `;
  },

  _esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  destroy() {
    this._myKRs = [];
    this._checkinHistory = {};
    this._activeCheckin = null;
    this._viewingHistory = null;
    this._loading = false;
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS_CHECKINS = TBO_OKRS_CHECKINS;
}
