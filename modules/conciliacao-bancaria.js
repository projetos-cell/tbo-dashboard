// ============================================================================
// TBO OS — Modulo: Conciliacao Bancaria
// Upload OFX/CSV → Preview → Match automatico → Aprovar/Rejeitar
// ============================================================================

const TBO_CONCILIACAO_BANCARIA = {
  _importData: null,    // { account, transactions, bank }
  _matches: [],         // sugestoes de match
  _tab: 'upload',       // upload | preview | match | historico

  render() {
    return `
      <div class="conciliacao-bancaria-module">
        <div class="module-header" style="margin-bottom:24px;">
          <div>
            <h2 class="module-title" style="margin:0;">Conciliacao Bancaria</h2>
            <p style="color:var(--text-tertiary);font-size:0.82rem;margin-top:4px;">Importe extratos e concilie com lancamentos do sistema</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" id="cbNewImport" style="font-size:0.82rem;">
              <i data-lucide="upload" style="width:14px;height:14px;"></i> Nova Importacao
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div style="display:flex;gap:4px;margin-bottom:20px;border-bottom:1px solid var(--border-default);">
          ${['upload', 'preview', 'match', 'historico'].map(t => `
            <button class="btn btn-ghost cb-tab-btn" data-tab="${t}" style="border-radius:var(--radius-md) var(--radius-md) 0 0;border-bottom:2px solid ${this._tab === t ? 'var(--brand-primary)' : 'transparent'};font-weight:${this._tab === t ? '600' : '400'};font-size:0.82rem;padding:8px 16px;">
              ${{ upload: 'Upload', preview: 'Preview', match: 'Conciliacao', historico: 'Historico' }[t]}
            </button>
          `).join('')}
        </div>

        <div id="cbTabContent">
          ${this._renderTab()}
        </div>
      </div>
    `;
  },

  _renderTab() {
    switch (this._tab) {
      case 'upload': return this._renderUpload();
      case 'preview': return this._renderPreview();
      case 'match': return this._renderMatch();
      case 'historico': return this._renderHistorico();
      default: return '';
    }
  },

  _renderUpload() {
    const banks = typeof TBO_CSV_PARSER !== 'undefined' ? TBO_CSV_PARSER.getSupportedBanks() : [];

    return `
      <div class="card" style="text-align:center;padding:48px 24px;">
        <i data-lucide="file-up" style="width:48px;height:48px;color:var(--text-tertiary);margin-bottom:16px;"></i>
        <h3 style="margin:0 0 8px;font-size:1rem;">Importar Extrato Bancario</h3>
        <p style="color:var(--text-secondary);font-size:0.82rem;margin:0 0 24px;">Arraste ou selecione um arquivo OFX ou CSV do seu banco.</p>

        <div id="cbDropZone" style="border:2px dashed var(--border-default);border-radius:var(--radius-lg);padding:32px;margin:0 auto 16px;max-width:500px;cursor:pointer;transition:border-color 0.2s;">
          <input type="file" id="cbFileInput" accept=".ofx,.qfx,.csv,.txt" style="display:none;">
          <p style="margin:0;color:var(--text-muted);font-size:0.82rem;">Clique ou arraste um arquivo .ofx, .qfx ou .csv</p>
        </div>

        ${banks.length ? `
        <div style="margin-top:16px;">
          <label style="font-size:0.78rem;color:var(--text-secondary);">Forcar layout de banco:</label>
          <select id="cbBankSelect" style="margin-left:8px;font-size:0.78rem;padding:4px 8px;border-radius:var(--radius-sm);border:1px solid var(--border-default);background:var(--bg-primary);">
            <option value="">Auto-detectar</option>
            ${banks.map(b => `<option value="${b.slug}">${b.name}</option>`).join('')}
          </select>
        </div>
        ` : ''}
      </div>
    `;
  },

  _renderPreview() {
    if (!this._importData || !this._importData.transactions.length) {
      return `<div class="card" style="text-align:center;padding:32px;"><p style="color:var(--text-muted);">Nenhum extrato importado. Faca upload primeiro.</p></div>`;
    }

    const txns = this._importData.transactions;
    const credits = txns.filter(t => t.isCredit);
    const debits = txns.filter(t => !t.isCredit);
    const totalCredits = credits.reduce((s, t) => s + t.absAmount, 0);
    const totalDebits = debits.reduce((s, t) => s + t.absAmount, 0);

    return `
      <!-- KPIs -->
      <div class="grid-4" style="margin-bottom:20px;">
        <div class="kpi-card">
          <div class="kpi-label">Transacoes</div>
          <div class="kpi-value">${txns.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Creditos</div>
          <div class="kpi-value" style="color:var(--color-success);">${this._fmt(totalCredits)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Debitos</div>
          <div class="kpi-value" style="color:var(--color-danger);">${this._fmt(totalDebits)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Saldo</div>
          <div class="kpi-value">${this._fmt(totalCredits - totalDebits)}</div>
        </div>
      </div>

      ${this._importData.account ? `
      <div class="card" style="margin-bottom:16px;">
        <div style="font-size:0.78rem;color:var(--text-secondary);">
          Banco: <strong>${this._importData.bank || this._importData.account.bankId || '—'}</strong>
          | Conta: <strong>${this._importData.account.accountId || '—'}</strong>
          | Periodo: <strong>${txns[txns.length - 1]?.date || '?'}</strong> a <strong>${txns[0]?.date || '?'}</strong>
        </div>
      </div>
      ` : ''}

      <!-- Tabela -->
      <div class="card" style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.78rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);">
              <th style="text-align:left;padding:8px;">Data</th>
              <th style="text-align:left;padding:8px;">Descricao</th>
              <th style="text-align:left;padding:8px;">Tipo</th>
              <th style="text-align:right;padding:8px;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${txns.slice(0, 100).map(t => `
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:6px 8px;white-space:nowrap;">${t.date}</td>
                <td style="padding:6px 8px;max-width:300px;overflow:hidden;text-overflow:ellipsis;">${this._esc(t.description || t.name || t.memo || '')}</td>
                <td style="padding:6px 8px;">${t.typeLabel}</td>
                <td style="padding:6px 8px;text-align:right;font-weight:600;color:${t.isCredit ? 'var(--color-success)' : 'var(--color-danger)'};">
                  ${t.isCredit ? '+' : '-'} ${this._fmt(t.absAmount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${txns.length > 100 ? `<p style="text-align:center;color:var(--text-muted);font-size:0.72rem;padding:8px;">Mostrando 100 de ${txns.length} transacoes</p>` : ''}
      </div>

      <div style="margin-top:16px;display:flex;gap:12px;">
        <button class="btn btn-primary" id="cbStartMatch">Iniciar Conciliacao</button>
        <button class="btn btn-ghost" id="cbClearImport">Limpar</button>
      </div>
    `;
  },

  _renderMatch() {
    if (!this._importData?.transactions.length) {
      return `<div class="card" style="text-align:center;padding:32px;"><p style="color:var(--text-muted);">Importe um extrato primeiro.</p></div>`;
    }

    const txns = this._importData.transactions;
    const matched = txns.filter(t => t._matchStatus === 'matched').length;
    const ignored = txns.filter(t => t._matchStatus === 'ignored').length;
    const unmatched = txns.length - matched - ignored;

    return `
      <div class="grid-4" style="margin-bottom:20px;">
        <div class="kpi-card">
          <div class="kpi-label">Total</div>
          <div class="kpi-value">${txns.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Conciliados</div>
          <div class="kpi-value" style="color:var(--color-success);">${matched}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pendentes</div>
          <div class="kpi-value" style="color:var(--color-warning);">${unmatched}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Ignorados</div>
          <div class="kpi-value" style="color:var(--text-muted);">${ignored}</div>
        </div>
      </div>

      <div class="card" style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.78rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);">
              <th style="padding:8px;">Status</th>
              <th style="text-align:left;padding:8px;">Data</th>
              <th style="text-align:left;padding:8px;">Descricao (Extrato)</th>
              <th style="text-align:right;padding:8px;">Valor</th>
              <th style="text-align:left;padding:8px;">Match Sugerido</th>
              <th style="padding:8px;">Acoes</th>
            </tr>
          </thead>
          <tbody>
            ${txns.slice(0, 50).map((t, i) => {
              const status = t._matchStatus || 'unmatched';
              const statusIcon = status === 'matched' ? 'check-circle' : status === 'ignored' ? 'minus-circle' : 'circle';
              const statusColor = status === 'matched' ? 'var(--color-success)' : status === 'ignored' ? 'var(--text-muted)' : 'var(--color-warning)';

              return `
                <tr style="border-bottom:1px solid var(--border-subtle);opacity:${status === 'ignored' ? '0.5' : '1'};">
                  <td style="padding:6px 8px;text-align:center;"><i data-lucide="${statusIcon}" style="width:14px;height:14px;color:${statusColor};"></i></td>
                  <td style="padding:6px 8px;white-space:nowrap;">${t.date}</td>
                  <td style="padding:6px 8px;max-width:200px;overflow:hidden;text-overflow:ellipsis;">${this._esc(t.description || '')}</td>
                  <td style="padding:6px 8px;text-align:right;font-weight:600;color:${t.isCredit ? 'var(--color-success)' : 'var(--color-danger)'};">
                    ${t.isCredit ? '+' : '-'} ${this._fmt(t.absAmount)}
                  </td>
                  <td style="padding:6px 8px;font-size:0.72rem;color:var(--text-secondary);">
                    ${t._matchSuggestion ? this._esc(t._matchSuggestion) : '<em>Nenhum match</em>'}
                  </td>
                  <td style="padding:6px 8px;white-space:nowrap;">
                    ${status === 'unmatched' ? `
                      <button class="btn btn-ghost cb-match-btn" data-idx="${i}" style="font-size:0.68rem;padding:2px 8px;">Aceitar</button>
                      <button class="btn btn-ghost cb-ignore-btn" data-idx="${i}" style="font-size:0.68rem;padding:2px 8px;color:var(--text-muted);">Ignorar</button>
                    ` : `<span style="font-size:0.68rem;color:${statusColor};">${status === 'matched' ? 'Conciliado' : 'Ignorado'}</span>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderHistorico() {
    const history = this._getImportHistory();

    if (!history.length) {
      return `<div class="card" style="text-align:center;padding:32px;"><p style="color:var(--text-muted);">Nenhuma importacao anterior registrada.</p></div>`;
    }

    return `
      <div class="card" style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);">
              <th style="text-align:left;padding:8px;">Data</th>
              <th style="text-align:left;padding:8px;">Arquivo</th>
              <th style="text-align:left;padding:8px;">Banco</th>
              <th style="text-align:right;padding:8px;">Transacoes</th>
              <th style="text-align:right;padding:8px;">Conciliadas</th>
              <th style="text-align:left;padding:8px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(h => `
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:6px 8px;">${new Date(h.date).toLocaleDateString('pt-BR')}</td>
                <td style="padding:6px 8px;">${this._esc(h.filename)}</td>
                <td style="padding:6px 8px;">${this._esc(h.bank)}</td>
                <td style="padding:6px 8px;text-align:right;">${h.total}</td>
                <td style="padding:6px 8px;text-align:right;">${h.matched}</td>
                <td style="padding:6px 8px;">
                  <span class="tag ${h.matched === h.total ? 'gold' : ''}">${h.matched === h.total ? 'Completa' : 'Parcial'}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  init() {
    // Tab navigation
    document.querySelectorAll('.cb-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        this._rerender();
      });
    });

    // New import button
    document.getElementById('cbNewImport')?.addEventListener('click', () => {
      this._tab = 'upload';
      this._importData = null;
      this._rerender();
    });

    // File upload
    this._setupDropZone();

    // Start match
    document.getElementById('cbStartMatch')?.addEventListener('click', () => {
      this._runAutoMatch();
      this._tab = 'match';
      this._rerender();
    });

    // Clear
    document.getElementById('cbClearImport')?.addEventListener('click', () => {
      this._importData = null;
      this._tab = 'upload';
      this._rerender();
    });

    // Match/Ignore buttons
    document.querySelectorAll('.cb-match-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (this._importData?.transactions[idx]) {
          this._importData.transactions[idx]._matchStatus = 'matched';
          this._rerender();
        }
      });
    });
    document.querySelectorAll('.cb-ignore-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (this._importData?.transactions[idx]) {
          this._importData.transactions[idx]._matchStatus = 'ignored';
          this._rerender();
        }
      });
    });
  },

  _setupDropZone() {
    const zone = document.getElementById('cbDropZone');
    const input = document.getElementById('cbFileInput');
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.style.borderColor = 'var(--brand-primary)';
    });
    zone.addEventListener('dragleave', () => {
      zone.style.borderColor = 'var(--border-default)';
    });
    zone.addEventListener('drop', async (e) => {
      e.preventDefault();
      zone.style.borderColor = 'var(--border-default)';
      const file = e.dataTransfer.files[0];
      if (file) await this._processFile(file);
    });
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (file) await this._processFile(file);
    });
  },

  async _processFile(file) {
    try {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Importando', `Processando ${file.name}...`);

      const ext = file.name.split('.').pop().toLowerCase();
      const bankSelect = document.getElementById('cbBankSelect');
      const forceLayout = bankSelect?.value || undefined;

      if (ext === 'ofx' || ext === 'qfx') {
        if (typeof TBO_OFX_PARSER === 'undefined') throw new Error('Parser OFX nao carregado.');
        const result = await TBO_OFX_PARSER.parseFile(file);
        this._importData = {
          ...result,
          bank: result.account?.bankId || 'OFX',
          filename: file.name
        };
      } else {
        if (typeof TBO_CSV_PARSER === 'undefined') throw new Error('Parser CSV nao carregado.');
        const result = await TBO_CSV_PARSER.parseFile(file, forceLayout);
        this._importData = {
          account: null,
          transactions: result.transactions,
          bank: result.bank,
          filename: file.name
        };
      }

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Importado', `${this._importData.transactions.length} transacoes de ${this._importData.bank}`);
      }

      this._tab = 'preview';
      this._rerender();

    } catch (e) {
      console.error('[Conciliacao] Erro ao processar arquivo:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message);
    }
  },

  /**
   * Auto-match: cruza transacoes bancarias com lancamentos do sistema
   * (por data + valor + descricao parcial)
   */
  _runAutoMatch() {
    if (!this._importData?.transactions) return;

    // Buscar lancamentos financeiros existentes do contexto
    const ctx = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.get('context') : null;
    const fc = ctx?.dados_comerciais?.[2026]?.fluxo_caixa || {};

    for (const txn of this._importData.transactions) {
      // Tentativa simples: match por valor exato no mes correspondente
      const month = txn.date ? parseInt(txn.date.split('-')[1]) - 1 : -1;
      const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const mesKey = meses[month];

      if (mesKey && fc.receita_mensal && txn.isCredit) {
        const receitaMes = fc.receita_mensal[mesKey];
        if (receitaMes && Math.abs(receitaMes - txn.absAmount) < 0.01) {
          txn._matchStatus = 'matched';
          txn._matchSuggestion = `Receita ${mesKey.toUpperCase()} (R$ ${this._fmt(receitaMes)})`;
          continue;
        }
      }

      if (mesKey && fc.despesa_mensal && !txn.isCredit) {
        const despesaMes = fc.despesa_mensal[mesKey];
        if (despesaMes && Math.abs(despesaMes - txn.absAmount) < 0.01) {
          txn._matchStatus = 'matched';
          txn._matchSuggestion = `Despesa ${mesKey.toUpperCase()} (R$ ${this._fmt(despesaMes)})`;
          continue;
        }
      }

      // Sem match
      txn._matchStatus = txn._matchStatus || 'unmatched';
    }
  },

  _getImportHistory() {
    try {
      return JSON.parse(localStorage.getItem('tbo_bank_import_history') || '[]');
    } catch { return []; }
  },

  _saveToHistory() {
    if (!this._importData) return;
    const txns = this._importData.transactions;
    const history = this._getImportHistory();
    history.unshift({
      date: new Date().toISOString(),
      filename: this._importData.filename || 'extrato',
      bank: this._importData.bank || '—',
      total: txns.length,
      matched: txns.filter(t => t._matchStatus === 'matched').length
    });
    // Manter apenas ultimos 50
    localStorage.setItem('tbo_bank_import_history', JSON.stringify(history.slice(0, 50)));
  },

  _rerender() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  _fmt(val) {
    return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  _esc(str) {
    if (typeof _escapeHtml === 'function') return _escapeHtml(str);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
