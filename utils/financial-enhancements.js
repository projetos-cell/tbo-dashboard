// ============================================================================
// TBO OS -- Financial Enhancements Module
// Cashflow Stress Test, Pricing Calculator, Commission Tracker,
// Invoice Generator, Client Lifetime Value, Win/Loss Analysis
// ============================================================================

const TBO_FINANCIAL = {

  // =========================================================================
  // HELPERS
  // =========================================================================

  _fmt(v) {
    if (typeof TBO_FORMATTER !== 'undefined') return TBO_FORMATTER.currency(v);
    if (v == null || isNaN(v)) return 'R$ --';
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  _pct(v, d = 1) {
    if (typeof TBO_FORMATTER !== 'undefined') return TBO_FORMATTER.percent(v, d);
    if (v == null || isNaN(v)) return '--%';
    return Number(v).toFixed(d) + '%';
  },

  _ctx() {
    if (typeof TBO_STORAGE !== 'undefined') return TBO_STORAGE.get('context') || {};
    return {};
  },

  _market() {
    if (typeof TBO_STORAGE !== 'undefined') return TBO_STORAGE.get('market') || {};
    return {};
  },

  _crmDeals() {
    if (typeof TBO_STORAGE !== 'undefined' && TBO_STORAGE.getCrmDeals) return TBO_STORAGE.getCrmDeals();
    return [];
  },

  _months: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  _monthLabels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],

  _getFluxoCaixa() {
    const ctx = this._ctx();
    return ctx.dados_comerciais?.[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa || null;
  },

  _loadInvoices() {
    try { return JSON.parse(localStorage.getItem('tbo_invoices') || '[]'); } catch { return []; }
  },

  _saveInvoices(list) {
    try { localStorage.setItem('tbo_invoices', JSON.stringify(list)); } catch (e) { console.warn('[TBO Financial] Erro ao salvar invoices:', e); }
  },

  _loadCommissionConfig() {
    try { return JSON.parse(localStorage.getItem('tbo_commissions') || 'null'); } catch { return null; }
  },

  _saveCommissionConfig(cfg) {
    try { localStorage.setItem('tbo_commissions', JSON.stringify(cfg)); } catch (e) { console.warn('[TBO Financial] Erro ao salvar commissions:', e); }
  },

  // =========================================================================
  // 1. CASHFLOW STRESS TEST SIMULATOR
  // =========================================================================

  stressTest(scenarios = []) {
    try {
      const fc = this._getFluxoCaixa();
      if (!fc) return { error: 'Dados de fluxo de caixa 2026 nao disponiveis.' };

      const baseline = {};
      const stressed = {};
      let cumulativeImpact = {};

      this._months.forEach(m => {
        baseline[m] = {
          receita: fc.receita_mensal?.[m] || 0,
          despesa: fc.despesa_mensal?.[m] || 0,
          resultado: fc.resultado_mensal?.[m] || 0
        };
        cumulativeImpact[m] = 0;
      });

      // Apply each scenario
      scenarios.forEach(sc => {
        const amount = Number(sc.amount) || 0;
        if (sc.type === 'deal_loss') {
          // Spread revenue loss across next 3 months starting from current
          const startIdx = Math.max(0, new Date().getMonth());
          const spread = Math.ceil(amount / 3);
          for (let i = 0; i < 3 && (startIdx + i) < 12; i++) {
            const m = this._months[startIdx + i];
            cumulativeImpact[m] -= spread;
          }
        } else if (sc.type === 'payment_delay') {
          // Shift revenue forward by 2 months
          const startIdx = Math.max(0, new Date().getMonth());
          const m = this._months[startIdx];
          if (m) cumulativeImpact[m] -= amount;
          const delayIdx = Math.min(startIdx + 2, 11);
          cumulativeImpact[this._months[delayIdx]] += amount;
        } else if (sc.type === 'cost_increase') {
          // Add cost to all remaining months
          const startIdx = Math.max(0, new Date().getMonth());
          for (let i = startIdx; i < 12; i++) {
            cumulativeImpact[this._months[i]] -= amount;
          }
        }
      });

      let breakEvenMonth = null;
      let runningBalance = 0;
      let riskMonths = 0;

      this._months.forEach(m => {
        const stressedResultado = baseline[m].resultado + cumulativeImpact[m];
        stressed[m] = {
          receita: baseline[m].receita + Math.max(cumulativeImpact[m], -baseline[m].receita),
          despesa: baseline[m].despesa,
          resultado: stressedResultado,
          impacto: cumulativeImpact[m]
        };
        runningBalance += stressedResultado;
        if (runningBalance < 0 && !breakEvenMonth) {
          breakEvenMonth = m;
        }
        if (stressedResultado < 0) riskMonths++;
      });

      let riskLevel = 'safe';
      let recommendation = 'Fluxo de caixa saudavel sob os cenarios testados.';

      if (riskMonths >= 6) {
        riskLevel = 'critical';
        recommendation = 'CRITICO: Mais de 6 meses em deficit. Recomenda-se corte de custos imediato e aceleracao de vendas.';
      } else if (riskMonths >= 3) {
        riskLevel = 'warning';
        recommendation = 'ATENCAO: Meses consecutivos de deficit projetado. Revisar pipeline comercial e negociar prazos com fornecedores.';
      } else if (breakEvenMonth) {
        riskLevel = 'warning';
        recommendation = `Saldo acumulado fica negativo em ${breakEvenMonth.toUpperCase()}. Antecipar recebiveis ou reduzir despesas variaveis.`;
      }

      return { baseline, stressed, breakEvenMonth, riskLevel, recommendation, scenariosApplied: scenarios.length };
    } catch (e) {
      console.error('[TBO Financial] stressTest error:', e);
      return { error: 'Erro ao calcular stress test: ' + e.message };
    }
  },

  renderStressTestUI() {
    return `
    <div class="fin-panel">
      <h2 class="fin-title">Simulador de Stress Test - Fluxo de Caixa</h2>
      <div class="fin-description">Simule cenarios adversos e veja o impacto no fluxo de caixa 2026.</div>
      <div id="fin-stress-scenarios" class="fin-scenarios-list"></div>
      <div class="fin-row" style="gap:8px; margin-bottom:16px;">
        <select id="fin-stress-type" class="fin-select">
          <option value="deal_loss">Perda de Contrato</option>
          <option value="payment_delay">Atraso de Pagamento</option>
          <option value="cost_increase">Aumento de Custo</option>
        </select>
        <input type="number" id="fin-stress-amount" class="fin-input" placeholder="Valor R$" min="0" step="1000"/>
        <input type="text" id="fin-stress-desc" class="fin-input" placeholder="Descricao" style="flex:2"/>
        <button class="fin-btn fin-btn-primary" onclick="TBO_FINANCIAL._uiAddScenario()">+ Adicionar</button>
      </div>
      <button class="fin-btn fin-btn-accent" onclick="TBO_FINANCIAL._uiRunStress()">Executar Stress Test</button>
      <div id="fin-stress-result" class="fin-result-area"></div>
    </div>`;
  },

  _uiStressScenarios: [],

  _uiAddScenario() {
    const type = document.getElementById('fin-stress-type')?.value || 'deal_loss';
    const amount = Number(document.getElementById('fin-stress-amount')?.value) || 0;
    const desc = document.getElementById('fin-stress-desc')?.value || '';
    if (amount <= 0) return;
    this._uiStressScenarios.push({ type, amount, description: desc });
    const labels = { deal_loss: 'Perda de Contrato', payment_delay: 'Atraso Pagamento', cost_increase: 'Aumento Custo' };
    const container = document.getElementById('fin-stress-scenarios');
    if (container) {
      container.innerHTML = this._uiStressScenarios.map((s, i) =>
        `<div class="fin-scenario-tag"><span>${labels[s.type]}: ${this._fmt(s.amount)}</span><small>${s.description}</small><button class="fin-btn-remove" onclick="TBO_FINANCIAL._uiRemoveScenario(${i})">x</button></div>`
      ).join('');
    }
    if (document.getElementById('fin-stress-amount')) document.getElementById('fin-stress-amount').value = '';
    if (document.getElementById('fin-stress-desc')) document.getElementById('fin-stress-desc').value = '';
  },

  _uiRemoveScenario(idx) {
    this._uiStressScenarios.splice(idx, 1);
    const labels = { deal_loss: 'Perda de Contrato', payment_delay: 'Atraso Pagamento', cost_increase: 'Aumento Custo' };
    const container = document.getElementById('fin-stress-scenarios');
    if (container) {
      container.innerHTML = this._uiStressScenarios.map((s, i) =>
        `<div class="fin-scenario-tag"><span>${labels[s.type]}: ${this._fmt(s.amount)}</span><small>${s.description}</small><button class="fin-btn-remove" onclick="TBO_FINANCIAL._uiRemoveScenario(${i})">x</button></div>`
      ).join('');
    }
  },

  _uiRunStress() {
    const result = this.stressTest(this._uiStressScenarios);
    const container = document.getElementById('fin-stress-result');
    if (!container) return;
    if (result.error) { container.innerHTML = `<div class="fin-error">${result.error}</div>`; return; }

    const riskColors = { safe: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };
    const riskLabels = { safe: 'Seguro', warning: 'Atencao', critical: 'Critico' };

    let html = `<div class="fin-risk-badge" style="background:${riskColors[result.riskLevel]}">${riskLabels[result.riskLevel]}</div>`;
    html += `<p class="fin-recommendation">${result.recommendation}</p>`;
    if (result.breakEvenMonth) html += `<p><strong>Mes critico:</strong> ${result.breakEvenMonth.toUpperCase()}</p>`;

    html += `<table class="fin-table"><thead><tr><th>Mes</th><th>Receita Base</th><th>Resultado Base</th><th>Impacto</th><th>Resultado Estressado</th></tr></thead><tbody>`;
    this._months.forEach((m, i) => {
      const b = result.baseline[m];
      const s = result.stressed[m];
      const cls = s.resultado < 0 ? 'fin-negative' : 'fin-positive';
      html += `<tr><td>${this._monthLabels[i]}</td><td>${this._fmt(b.receita)}</td><td>${this._fmt(b.resultado)}</td><td class="${s.impacto < 0 ? 'fin-negative' : ''}">${this._fmt(s.impacto)}</td><td class="${cls}">${this._fmt(s.resultado)}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  },

  // =========================================================================
  // 2. PRICING CALCULATOR
  // =========================================================================

  // Pricing data now centralized in TBO_CONFIG.business.financial
  get _serviceCatalog()        { return TBO_CONFIG.business.financial.serviceCatalog; },
  get _complexityMultipliers() { return TBO_CONFIG.business.financial.complexityMultipliers; },
  get _clientDiscounts()       { return TBO_CONFIG.business.financial.clientDiscounts; },

  calculatePricing(services = [], complexity = 'media', clientType = 'novo') {
    try {
      const mult = this._complexityMultipliers[complexity]?.multiplier || 1.0;
      const disc = this._clientDiscounts[clientType]?.discount || 0;
      const breakdown = [];
      let totalSuggested = 0;
      let totalMinimum = 0;

      services.forEach(svcKey => {
        const svc = this._serviceCatalog[svcKey];
        if (!svc) return;
        const suggested = Math.round(svc.max * mult * (1 - disc));
        const minimum = Math.round(svc.min * mult * (1 - disc));
        const marketAvg = Math.round((svc.marketMin + svc.marketMax) / 2);
        const margin = marketAvg > 0 ? Math.round(((suggested - marketAvg) / marketAvg) * 100) : 0;

        breakdown.push({
          service: svc.label,
          key: svcKey,
          suggested,
          minimum,
          marketAvg,
          margin,
          unit: svc.unit
        });
        totalSuggested += suggested;
        totalMinimum += minimum;
      });

      const justParts = [];
      if (mult > 1) justParts.push(`Multiplicador de complexidade ${complexity}: x${mult}`);
      if (disc > 0) justParts.push(`Desconto cliente ${clientType}: -${(disc * 100).toFixed(0)}%`);
      justParts.push(`Posicionamento TBO premium: valores acima da media de mercado, justificados por qualidade e resultados mensuráveis.`);

      return {
        totalSuggested,
        totalMinimum,
        breakdown,
        complexity,
        clientType,
        justification: justParts.join(' | ')
      };
    } catch (e) {
      console.error('[TBO Financial] calculatePricing error:', e);
      return { error: 'Erro ao calcular precificacao: ' + e.message };
    }
  },

  renderPricingCalculator() {
    const serviceChecks = Object.entries(this._serviceCatalog).map(([k, v]) =>
      `<label class="fin-check-label"><input type="checkbox" class="fin-pricing-svc" value="${k}"/> ${v.label} <small>(${this._fmt(v.min)} - ${this._fmt(v.max)})</small></label>`
    ).join('');

    const complexOpts = Object.entries(this._complexityMultipliers).map(([k, v]) =>
      `<option value="${k}" ${k === 'media' ? 'selected' : ''}>x${v.multiplier} ${v.label}</option>`
    ).join('');

    const clientOpts = Object.entries(this._clientDiscounts).map(([k, v]) =>
      `<option value="${k}">${v.label} ${v.discount > 0 ? '(-' + (v.discount * 100) + '%)' : ''}</option>`
    ).join('');

    return `
    <div class="fin-panel">
      <h2 class="fin-title">Calculadora de Precificacao</h2>
      <div class="fin-description">Selecione servicos e parametros para gerar proposta de preco.</div>
      <div class="fin-section">
        <h3>Servicos</h3>
        <div class="fin-check-grid">${serviceChecks}</div>
      </div>
      <div class="fin-row" style="gap:12px;margin:16px 0">
        <div><label class="fin-label">Complexidade</label><select id="fin-pricing-complexity" class="fin-select">${complexOpts}</select></div>
        <div><label class="fin-label">Tipo de Cliente</label><select id="fin-pricing-client" class="fin-select">${clientOpts}</select></div>
      </div>
      <button class="fin-btn fin-btn-primary" onclick="TBO_FINANCIAL._uiCalcPricing()">Calcular Preco</button>
      <div id="fin-pricing-result" class="fin-result-area"></div>
    </div>`;
  },

  _uiCalcPricing() {
    const checks = document.querySelectorAll('.fin-pricing-svc:checked');
    const services = Array.from(checks).map(c => c.value);
    const complexity = document.getElementById('fin-pricing-complexity')?.value || 'media';
    const clientType = document.getElementById('fin-pricing-client')?.value || 'novo';

    if (services.length === 0) {
      const el = document.getElementById('fin-pricing-result');
      if (el) el.innerHTML = '<div class="fin-error">Selecione ao menos um servico.</div>';
      return;
    }

    const result = this.calculatePricing(services, complexity, clientType);
    const el = document.getElementById('fin-pricing-result');
    if (!el) return;

    let html = `<div class="fin-pricing-totals">
      <div class="fin-total-card"><span>Preco Sugerido</span><strong>${this._fmt(result.totalSuggested)}</strong></div>
      <div class="fin-total-card"><span>Preco Minimo</span><strong>${this._fmt(result.totalMinimum)}</strong></div>
    </div>`;

    html += `<table class="fin-table"><thead><tr><th>Servico</th><th>Sugerido</th><th>Minimo</th><th>Media Mercado</th><th>Margem vs Mercado</th></tr></thead><tbody>`;
    result.breakdown.forEach(item => {
      const cls = item.margin > 0 ? 'fin-positive' : 'fin-negative';
      html += `<tr><td>${item.service}<br><small>${item.unit}</small></td><td>${this._fmt(item.suggested)}</td><td>${this._fmt(item.minimum)}</td><td>${this._fmt(item.marketAvg)}</td><td class="${cls}">+${item.margin}%</td></tr>`;
    });
    html += '</tbody></table>';
    html += `<div class="fin-justification"><strong>Justificativa:</strong> ${result.justification}</div>`;
    el.innerHTML = html;
  },

  // =========================================================================
  // 3. COMMISSION TRACKER
  // =========================================================================

  getCommissionRules() {
    const saved = this._loadCommissionConfig();
    if (saved) return saved;
    const fin = TBO_CONFIG.business.financial;
    return {
      rates: { standard: 0.05, premium: 0.08 },
      premiumThreshold: fin.premiumThreshold,
      targets: { monthly: 50000, quarterly: fin.quarterlyTarget },
      team: ['Ruy', 'Gustavo']
    };
  },

  calculateCommissions(period = 'month') {
    try {
      const rules = this.getCommissionRules();
      const deals = this._crmDeals();
      const now = new Date();

      let startDate, endDate;
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === 'quarter') {
        const q = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), q * 3, 1);
        endDate = new Date(now.getFullYear(), q * 3 + 3, 0);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      }

      const wonDeals = deals.filter(d => {
        if (d.stage !== 'fechado_ganho') return false;
        const closeDate = new Date(d.updatedAt || d.createdAt);
        return closeDate >= startDate && closeDate <= endDate;
      });

      const byPerson = {};
      rules.team.forEach(name => {
        byPerson[name] = { name, deals: [], totalCommission: 0, totalValue: 0, target: rules.targets.monthly, achievement: 0 };
      });

      wonDeals.forEach(deal => {
        const owner = deal.owner || 'Nao atribuido';
        if (!byPerson[owner]) {
          byPerson[owner] = { name: owner, deals: [], totalCommission: 0, totalValue: 0, target: rules.targets.monthly, achievement: 0 };
        }
        const rate = deal.value >= rules.premiumThreshold ? rules.rates.premium : rules.rates.standard;
        const commission = Math.round(deal.value * rate);
        byPerson[owner].deals.push({ name: deal.name, value: deal.value, rate, commission, company: deal.company });
        byPerson[owner].totalCommission += commission;
        byPerson[owner].totalValue += deal.value;
      });

      let totalPaid = 0;
      let totalPending = 0;
      const target = period === 'quarter' ? rules.targets.quarterly : rules.targets.monthly;

      Object.values(byPerson).forEach(person => {
        person.target = target;
        person.achievement = target > 0 ? Math.round((person.totalValue / target) * 100) : 0;
        totalPaid += person.totalCommission;
      });

      totalPending = Math.max(0, Object.values(byPerson).length * target * rules.rates.standard - totalPaid);

      return {
        byPerson: Object.values(byPerson),
        totalPaid,
        totalPending,
        period,
        rules
      };
    } catch (e) {
      console.error('[TBO Financial] calculateCommissions error:', e);
      return { error: 'Erro ao calcular comissoes: ' + e.message };
    }
  },

  renderCommissionDashboard() {
    return `
    <div class="fin-panel">
      <h2 class="fin-title">Painel de Comissoes</h2>
      <div class="fin-description">Acompanhamento de comissoes da equipe comercial.</div>
      <div class="fin-row" style="gap:8px; margin-bottom:16px;">
        <button class="fin-btn fin-btn-primary" onclick="TBO_FINANCIAL._uiCalcCommissions('month')">Mensal</button>
        <button class="fin-btn" onclick="TBO_FINANCIAL._uiCalcCommissions('quarter')">Trimestral</button>
        <button class="fin-btn" onclick="TBO_FINANCIAL._uiCalcCommissions('year')">Anual</button>
      </div>
      <div id="fin-commission-result" class="fin-result-area"></div>
    </div>`;
  },

  _uiCalcCommissions(period) {
    const result = this.calculateCommissions(period);
    const el = document.getElementById('fin-commission-result');
    if (!el) return;
    if (result.error) { el.innerHTML = `<div class="fin-error">${result.error}</div>`; return; }

    const labels = { month: 'Mensal', quarter: 'Trimestral', year: 'Anual' };
    let html = `<h3>Periodo: ${labels[period] || period}</h3>`;
    html += `<div class="fin-pricing-totals">
      <div class="fin-total-card"><span>Total Pago</span><strong>${this._fmt(result.totalPaid)}</strong></div>
      <div class="fin-total-card"><span>Pendente Estimado</span><strong>${this._fmt(result.totalPending)}</strong></div>
    </div>`;

    result.byPerson.forEach(person => {
      const pctWidth = Math.min(person.achievement, 100);
      const barColor = person.achievement >= 100 ? '#22c55e' : person.achievement >= 60 ? '#f59e0b' : '#ef4444';
      html += `<div class="fin-person-card">
        <div class="fin-person-header"><strong>${person.name}</strong><span>${this._fmt(person.totalCommission)} em comissoes</span></div>
        <div class="fin-progress-bar"><div class="fin-progress-fill" style="width:${pctWidth}%;background:${barColor}"></div></div>
        <small>Meta: ${this._fmt(person.target)} | Vendido: ${this._fmt(person.totalValue)} | Atingimento: ${person.achievement}%</small>`;
      if (person.deals.length > 0) {
        html += '<div class="fin-deal-list">';
        person.deals.forEach(d => {
          html += `<div class="fin-deal-item"><span>${d.name} (${d.company})</span><span>${this._fmt(d.value)} &rarr; ${this._fmt(d.commission)} (${(d.rate * 100).toFixed(0)}%)</span></div>`;
        });
        html += '</div>';
      } else {
        html += '<small class="fin-muted">Nenhum deal fechado no periodo.</small>';
      }
      html += '</div>';
    });

    html += `<div class="fin-rules-info"><strong>Regras:</strong> Comissao padrao ${(result.rules.rates.standard * 100).toFixed(0)}% | Premium ${(result.rules.rates.premium * 100).toFixed(0)}% (deals acima de ${this._fmt(result.rules.premiumThreshold)})</div>`;
    el.innerHTML = html;
  },

  // =========================================================================
  // 4. INVOICE GENERATOR
  // =========================================================================

  _nextInvoiceNumber() {
    const invoices = this._loadInvoices();
    if (invoices.length === 0) return 'TBO-2026-001';
    const last = invoices[0].number || 'TBO-2026-000';
    const parts = last.split('-');
    const seq = (parseInt(parts[2] || '0', 10) + 1).toString().padStart(3, '0');
    return `TBO-${new Date().getFullYear()}-${seq}`;
  },

  generateInvoice(contractId, options = {}) {
    try {
      let deal = null;
      if (typeof TBO_STORAGE !== 'undefined') {
        const deals = TBO_STORAGE.getCrmDeals();
        deal = deals.find(d => d.id === contractId);
      }

      const invoiceNumber = this._nextInvoiceNumber();
      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + (options.dueDays || 30));

      const data = {
        number: invoiceNumber,
        date: now.toLocaleDateString('pt-BR'),
        dateISO: now.toISOString(),
        client: deal?.company || options.clientName || 'Cliente',
        clientContact: deal?.contact || options.contact || '',
        cnpj: options.cnpj || '',
        items: [],
        total: 0,
        dueDate: dueDate.toLocaleDateString('pt-BR'),
        dueDateISO: dueDate.toISOString(),
        paymentInstructions: options.paymentInstructions || 'Transferencia bancaria conforme dados em contrato.',
        notes: options.notes || '',
        installments: options.installments || 1
      };

      if (deal) {
        const services = deal.services || [];
        if (services.length > 0) {
          const perService = deal.value / services.length;
          services.forEach(svc => {
            data.items.push({ description: svc, quantity: 1, unitPrice: perService, total: perService });
          });
        } else {
          data.items.push({ description: deal.name || 'Servicos TBO', quantity: 1, unitPrice: deal.value || 0, total: deal.value || 0 });
        }
        data.total = deal.value || 0;
      } else if (options.items && Array.isArray(options.items)) {
        options.items.forEach(item => {
          const t = (item.quantity || 1) * (item.unitPrice || 0);
          data.items.push({ description: item.description, quantity: item.quantity || 1, unitPrice: item.unitPrice || 0, total: t });
          data.total += t;
        });
      }

      // Save to invoice history
      const invoices = this._loadInvoices();
      invoices.unshift({ ...data, createdAt: now.toISOString() });
      if (invoices.length > 200) invoices.pop();
      this._saveInvoices(invoices);

      const html = this._buildInvoiceHtml(data);
      return { html, data };
    } catch (e) {
      console.error('[TBO Financial] generateInvoice error:', e);
      return { error: 'Erro ao gerar fatura: ' + e.message };
    }
  },

  _buildInvoiceHtml(data) {
    const itemRows = data.items.map(item =>
      `<tr><td>${item.description}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">${this._fmt(item.unitPrice)}</td><td style="text-align:right">${this._fmt(item.total)}</td></tr>`
    ).join('');

    let installmentInfo = '';
    if (data.installments > 1) {
      const perInstallment = data.total / data.installments;
      installmentInfo = `<p><strong>Parcelamento:</strong> ${data.installments}x de ${this._fmt(perInstallment)}</p>`;
    }

    return `
    <div class="fin-invoice" id="fin-invoice-print">
      <div class="fin-invoice-header">
        <div class="fin-invoice-logo">
          <div class="fin-logo-placeholder">TBO</div>
          <div>
            <strong>TBO Estudio</strong><br/>
            <small>Visualizacao Arquitetonica & Marketing Imobiliario</small><br/>
            <small>Curitiba/PR</small>
          </div>
        </div>
        <div class="fin-invoice-meta">
          <h2>FATURA</h2>
          <p><strong>N:</strong> ${data.number}</p>
          <p><strong>Data:</strong> ${data.date}</p>
          <p><strong>Vencimento:</strong> ${data.dueDate}</p>
        </div>
      </div>
      <div class="fin-invoice-client">
        <h3>Faturar para:</h3>
        <p><strong>${data.client}</strong></p>
        ${data.cnpj ? `<p>CNPJ: ${data.cnpj}</p>` : ''}
        ${data.clientContact ? `<p>Contato: ${data.clientContact}</p>` : ''}
      </div>
      <table class="fin-table fin-invoice-table">
        <thead><tr><th>Descricao</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unitario</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${itemRows}</tbody>
        <tfoot><tr><td colspan="3" style="text-align:right"><strong>TOTAL</strong></td><td style="text-align:right"><strong>${this._fmt(data.total)}</strong></td></tr></tfoot>
      </table>
      ${installmentInfo}
      <div class="fin-invoice-footer">
        <div><strong>Instrucoes de Pagamento:</strong><p>${data.paymentInstructions}</p></div>
        ${data.notes ? `<div><strong>Observacoes:</strong><p>${data.notes}</p></div>` : ''}
      </div>
    </div>`;
  },

  renderInvoicePreview(invoiceData) {
    if (!invoiceData) return '<div class="fin-error">Dados da fatura nao fornecidos.</div>';
    const html = typeof invoiceData === 'string' ? invoiceData : this._buildInvoiceHtml(invoiceData);
    return `
    <div class="fin-panel">
      <div class="fin-row" style="justify-content:space-between;margin-bottom:12px;">
        <h2 class="fin-title" style="margin:0">Pre-visualizacao da Fatura</h2>
        <button class="fin-btn fin-btn-primary" onclick="window.print()">Imprimir / Salvar PDF</button>
      </div>
      ${html}
    </div>`;
  },

  // =========================================================================
  // 5. CLIENT LIFETIME VALUE (CLV)
  // =========================================================================

  calculateCLV(clientName) {
    try {
      const ctx = this._ctx();
      if (!clientName) return { error: 'Nome do cliente nao fornecido.' };

      const search = clientName.toLowerCase();
      let totalRevenue = 0;
      let projectCount = 0;
      let firstYear = null;
      const yearlyRevenue = {};

      // Count projects from projetos_finalizados
      const finalizados = ctx.projetos_finalizados || {};
      Object.entries(finalizados).forEach(([year, projects]) => {
        const matched = projects.filter(p => p.toLowerCase().includes(search));
        if (matched.length > 0) {
          projectCount += matched.length;
          if (!firstYear || parseInt(year) < parseInt(firstYear)) firstYear = year;
          yearlyRevenue[year] = (yearlyRevenue[year] || 0) + matched.length;
        }
      });

      // Count from active projects
      const ativos = ctx.projetos_ativos || [];
      const activeMatched = ativos.filter(p =>
        (p.construtora || '').toLowerCase().includes(search) ||
        (p.nome || '').toLowerCase().includes(search)
      );
      projectCount += activeMatched.length;
      const currentYear = new Date().getFullYear().toString();
      if (activeMatched.length > 0) {
        yearlyRevenue[currentYear] = (yearlyRevenue[currentYear] || 0) + activeMatched.length;
      }

      // Estimate revenue from commercial data (avg ticket per project)
      const dc = ctx.dados_comerciais || {};
      const tickets = [];
      ['2024', '2025'].forEach(yr => {
        if (dc[yr]?.ticket_medio) tickets.push(dc[yr].ticket_medio);
      });
      const avgTicket = tickets.length > 0 ? tickets.reduce((a, b) => a + b, 0) / tickets.length : 45000;
      totalRevenue = projectCount * avgTicket;

      // Calculate frequency
      const years = Object.keys(yearlyRevenue).sort();
      let frequency = 'esporadico';
      if (years.length >= 3) frequency = 'anual';
      else if (years.length === 2) frequency = 'semestral';
      else if (projectCount >= 3 && years.length === 1) frequency = 'trimestral';

      // Trend: compare last 2 years of activity
      let trend = 'estavel';
      if (years.length >= 2) {
        const prev = yearlyRevenue[years[years.length - 2]] || 0;
        const curr = yearlyRevenue[years[years.length - 1]] || 0;
        if (curr > prev) trend = 'crescente';
        else if (curr < prev) trend = 'decrescente';
      }

      // Predict next year
      let predictedNextYearValue = avgTicket;
      if (trend === 'crescente') predictedNextYearValue = avgTicket * 1.3;
      else if (trend === 'decrescente') predictedNextYearValue = avgTicket * 0.6;
      if (projectCount > 5) predictedNextYearValue *= 1.2;

      return {
        clientName,
        totalRevenue: Math.round(totalRevenue),
        projectCount,
        firstProject: firstYear || 'N/A',
        avgTicket: Math.round(avgTicket),
        frequency,
        trend,
        predictedNextYearValue: Math.round(predictedNextYearValue),
        yearlyBreakdown: yearlyRevenue
      };
    } catch (e) {
      console.error('[TBO Financial] calculateCLV error:', e);
      return { error: 'Erro ao calcular CLV: ' + e.message };
    }
  },

  getTopClientsByCLV(limit = 10) {
    try {
      const ctx = this._ctx();
      const clients = new Set();

      // Gather all client names
      (ctx.clientes_construtoras || []).forEach(c => clients.add(c));
      (ctx.projetos_ativos || []).forEach(p => { if (p.construtora) clients.add(p.construtora); });

      const results = [];
      clients.forEach(name => {
        const clv = this.calculateCLV(name);
        if (!clv.error && clv.projectCount > 0) {
          results.push({ clientName: name, clv: clv.totalRevenue, projectCount: clv.projectCount, trend: clv.trend, predicted: clv.predictedNextYearValue });
        }
      });

      results.sort((a, b) => b.clv - a.clv);
      return results.slice(0, limit).map((r, i) => ({ ...r, rank: i + 1 }));
    } catch (e) {
      console.error('[TBO Financial] getTopClientsByCLV error:', e);
      return [];
    }
  },

  renderCLVChart() {
    const top = this.getTopClientsByCLV(10);
    if (top.length === 0) return '<div class="fin-panel"><div class="fin-error">Nenhum dado de cliente disponivel.</div></div>';

    const maxVal = top[0]?.clv || 1;
    const trendIcons = { crescente: '&#9650;', decrescente: '&#9660;', estavel: '&#9654;' };
    const trendColors = { crescente: '#22c55e', decrescente: '#ef4444', estavel: '#94a3b8' };

    let bars = top.map(c => {
      const pct = Math.round((c.clv / maxVal) * 100);
      return `<div class="fin-clv-row">
        <div class="fin-clv-label">
          <span class="fin-clv-rank">#${c.rank}</span>
          <span class="fin-clv-name">${c.clientName}</span>
          <span class="fin-clv-trend" style="color:${trendColors[c.trend]}">${trendIcons[c.trend] || ''}</span>
        </div>
        <div class="fin-clv-bar-wrap">
          <div class="fin-clv-bar" style="width:${pct}%"></div>
          <span class="fin-clv-value">${this._fmt(c.clv)} <small>(${c.projectCount} proj.)</small></span>
        </div>
      </div>`;
    }).join('');

    return `
    <div class="fin-panel">
      <h2 class="fin-title">Top 10 Clientes por Valor Vitalicio (CLV)</h2>
      <div class="fin-description">Receita estimada acumulada por cliente ao longo dos anos.</div>
      <div class="fin-clv-chart">${bars}</div>
    </div>`;
  },

  // =========================================================================
  // 6. WIN/LOSS ANALYSIS
  // =========================================================================

  analyzeWinLoss(period = 'all') {
    try {
      const deals = this._crmDeals();
      const ctx = this._ctx();
      const dc = ctx.dados_comerciais || {};

      let filtered = deals;
      const now = new Date();
      if (period === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = deals.filter(d => new Date(d.updatedAt || d.createdAt) >= start);
      } else if (period === 'quarter') {
        const q = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), q * 3, 1);
        filtered = deals.filter(d => new Date(d.updatedAt || d.createdAt) >= start);
      } else if (period === 'year') {
        const start = new Date(now.getFullYear(), 0, 1);
        filtered = deals.filter(d => new Date(d.updatedAt || d.createdAt) >= start);
      }

      const won = filtered.filter(d => d.stage === 'fechado_ganho');
      const lost = filtered.filter(d => d.stage === 'fechado_perdido');
      const total = won.length + lost.length;
      const winRate = total > 0 ? Math.round((won.length / total) * 10000) / 100 : 0;

      // By BU (using services as proxy for BU)
      const buMap = {};
      [...won, ...lost].forEach(d => {
        const services = d.services || ['Geral'];
        services.forEach(svc => {
          if (!buMap[svc]) buMap[svc] = { bu: svc, won: 0, lost: 0 };
          if (d.stage === 'fechado_ganho') buMap[svc].won++;
          else buMap[svc].lost++;
        });
      });
      const byBU = Object.values(buMap).map(b => ({
        ...b,
        rate: (b.won + b.lost) > 0 ? Math.round((b.won / (b.won + b.lost)) * 100) : 0
      }));

      // By value range
      const ranges = [
        { label: 'Ate R$ 10k', min: 0, max: 10000, won: 0, lost: 0 },
        { label: 'R$ 10k-30k', min: 10000, max: 30000, won: 0, lost: 0 },
        { label: 'R$ 30k-80k', min: 30000, max: 80000, won: 0, lost: 0 },
        { label: 'Acima R$ 80k', min: 80000, max: Infinity, won: 0, lost: 0 }
      ];
      [...won, ...lost].forEach(d => {
        const r = ranges.find(r => d.value >= r.min && d.value < r.max);
        if (r) {
          if (d.stage === 'fechado_ganho') r.won++;
          else r.lost++;
        }
      });
      const byValueRange = ranges.map(r => ({
        range: r.label, won: r.won, lost: r.lost,
        rate: (r.won + r.lost) > 0 ? Math.round((r.won / (r.won + r.lost)) * 100) : 0
      }));

      // By service type
      const svcMap = {};
      [...won, ...lost].forEach(d => {
        (d.services || []).forEach(svc => {
          if (!svcMap[svc]) svcMap[svc] = { type: svc, won: 0, lost: 0 };
          if (d.stage === 'fechado_ganho') svcMap[svc].won++;
          else svcMap[svc].lost++;
        });
      });
      const byServiceType = Object.values(svcMap);

      // Monthly trend
      const monthlyMap = {};
      [...won, ...lost].forEach(d => {
        const date = new Date(d.updatedAt || d.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap[key]) monthlyMap[key] = { month: key, won: 0, lost: 0 };
        if (d.stage === 'fechado_ganho') monthlyMap[key].won++;
        else monthlyMap[key].lost++;
      });
      const trends = Object.values(monthlyMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(m => ({
          month: m.month,
          winRate: (m.won + m.lost) > 0 ? Math.round((m.won / (m.won + m.lost)) * 100) : 0
        }));

      // Historical rates from context
      const historicalRates = {};
      if (dc['2024']?.conversao_proposta) historicalRates['2024'] = dc['2024'].conversao_proposta;
      if (dc['2025']?.conversao_proposta) historicalRates['2025'] = dc['2025'].conversao_proposta;

      // Top reasons (inferred from notes)
      const winReasons = [];
      const lossReasons = [];
      won.forEach(d => { if (d.notes) winReasons.push(d.notes.substring(0, 80)); });
      lost.forEach(d => { if (d.notes) lossReasons.push(d.notes.substring(0, 80)); });

      return {
        winRate,
        totalWon: won.length,
        totalLost: lost.length,
        totalDeals: total,
        byBU,
        byValueRange,
        byServiceType,
        topReasons: {
          win: winReasons.length > 0 ? winReasons.slice(0, 5) : ['Qualidade TBO', 'Relacionamento', 'Portfolio'],
          loss: lossReasons.length > 0 ? lossReasons.slice(0, 5) : ['Preco acima do mercado', 'Orcamento do cliente', 'Concorrencia']
        },
        trends,
        historicalRates,
        period
      };
    } catch (e) {
      console.error('[TBO Financial] analyzeWinLoss error:', e);
      return { error: 'Erro ao analisar win/loss: ' + e.message };
    }
  },

  renderWinLossReport() {
    return `
    <div class="fin-panel">
      <h2 class="fin-title">Analise Win/Loss</h2>
      <div class="fin-description">Taxas de conversao por BU, faixa de valor e tipo de servico.</div>
      <div class="fin-row" style="gap:8px;margin-bottom:16px;">
        <button class="fin-btn fin-btn-primary" onclick="TBO_FINANCIAL._uiWinLoss('all')">Todos</button>
        <button class="fin-btn" onclick="TBO_FINANCIAL._uiWinLoss('year')">Ano</button>
        <button class="fin-btn" onclick="TBO_FINANCIAL._uiWinLoss('quarter')">Trimestre</button>
        <button class="fin-btn" onclick="TBO_FINANCIAL._uiWinLoss('month')">Mes</button>
      </div>
      <div id="fin-winloss-result" class="fin-result-area"></div>
    </div>`;
  },

  _uiWinLoss(period) {
    const r = this.analyzeWinLoss(period);
    const el = document.getElementById('fin-winloss-result');
    if (!el) return;
    if (r.error) { el.innerHTML = `<div class="fin-error">${r.error}</div>`; return; }

    const rateColor = r.winRate >= 50 ? '#22c55e' : r.winRate >= 30 ? '#f59e0b' : '#ef4444';

    let html = `<div class="fin-winloss-summary">
      <div class="fin-wl-card"><div class="fin-wl-big" style="color:${rateColor}">${this._pct(r.winRate)}</div><small>Taxa de Conversao</small></div>
      <div class="fin-wl-card"><div class="fin-wl-big" style="color:#22c55e">${r.totalWon}</div><small>Ganhos</small></div>
      <div class="fin-wl-card"><div class="fin-wl-big" style="color:#ef4444">${r.totalLost}</div><small>Perdidos</small></div>
      <div class="fin-wl-card"><div class="fin-wl-big">${r.totalDeals}</div><small>Total Deals</small></div>
    </div>`;

    // Historical reference
    if (r.historicalRates && Object.keys(r.historicalRates).length > 0) {
      html += '<div class="fin-historical"><strong>Historico:</strong> ';
      html += Object.entries(r.historicalRates).map(([yr, rate]) => `${yr}: ${rate}`).join(' | ');
      html += '</div>';
    }

    // By Value Range table
    html += `<h3 style="margin:16px 0 8px">Por Faixa de Valor</h3>`;
    html += `<table class="fin-table"><thead><tr><th>Faixa</th><th>Ganhos</th><th>Perdidos</th><th>Taxa</th></tr></thead><tbody>`;
    r.byValueRange.forEach(v => {
      html += `<tr><td>${v.range}</td><td class="fin-positive">${v.won}</td><td class="fin-negative">${v.lost}</td><td>${v.rate}%</td></tr>`;
    });
    html += '</tbody></table>';

    // By BU table
    if (r.byBU.length > 0) {
      html += `<h3 style="margin:16px 0 8px">Por BU / Servico</h3>`;
      html += `<table class="fin-table"><thead><tr><th>BU</th><th>Ganhos</th><th>Perdidos</th><th>Taxa</th></tr></thead><tbody>`;
      r.byBU.forEach(b => {
        html += `<tr><td>${b.bu}</td><td class="fin-positive">${b.won}</td><td class="fin-negative">${b.lost}</td><td>${b.rate}%</td></tr>`;
      });
      html += '</tbody></table>';
    }

    // Monthly trend as simple bar chart
    if (r.trends.length > 0) {
      html += `<h3 style="margin:16px 0 8px">Tendencia Mensal</h3>`;
      html += '<div class="fin-trend-chart">';
      r.trends.forEach(t => {
        const barH = Math.max(t.winRate, 4);
        const color = t.winRate >= 50 ? '#22c55e' : t.winRate >= 30 ? '#f59e0b' : '#ef4444';
        html += `<div class="fin-trend-bar-col"><div class="fin-trend-bar" style="height:${barH}px;background:${color}"></div><small>${t.month.split('-')[1]}</small><small>${t.winRate}%</small></div>`;
      });
      html += '</div>';
    }

    // Top reasons
    html += `<div class="fin-row" style="gap:16px;margin-top:16px">
      <div class="fin-reasons"><h4 style="color:#22c55e">Razoes de Ganho</h4><ul>${r.topReasons.win.map(r => `<li>${r}</li>`).join('')}</ul></div>
      <div class="fin-reasons"><h4 style="color:#ef4444">Razoes de Perda</h4><ul>${r.topReasons.loss.map(r => `<li>${r}</li>`).join('')}</ul></div>
    </div>`;

    el.innerHTML = html;
  }
};


// ===========================================================================
// CSS STYLES (Self-executing IIFE)
// ===========================================================================
(function() {
  if (document.getElementById('tbo-financial-styles')) return;
  const style = document.createElement('style');
  style.id = 'tbo-financial-styles';
  style.textContent = `

  /* ── Panel & Layout ─────────────────────────────────────────────────── */
  .fin-panel { background:#1a1a2e; border:1px solid #2a2a4a; border-radius:12px; padding:24px; margin-bottom:20px; color:#e0e0e0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
  .fin-title { margin:0 0 8px; font-size:1.3rem; color:#fff; font-weight:700; }
  .fin-description { color:#94a3b8; font-size:0.9rem; margin-bottom:16px; }
  .fin-row { display:flex; align-items:center; flex-wrap:wrap; }
  .fin-section { margin-bottom:16px; }
  .fin-section h3 { margin:0 0 8px; font-size:1rem; color:#cbd5e1; }
  .fin-result-area { margin-top:16px; }
  .fin-error { background:#2d1b1b; color:#fca5a5; border:1px solid #7f1d1d; border-radius:8px; padding:12px; font-size:0.9rem; }
  .fin-muted { color:#64748b; }
  .fin-label { display:block; font-size:0.8rem; color:#94a3b8; margin-bottom:4px; }

  /* ── Form Elements ──────────────────────────────────────────────────── */
  .fin-input, .fin-select { background:#0f0f23; border:1px solid #334155; border-radius:6px; padding:8px 12px; color:#e0e0e0; font-size:0.9rem; min-width:120px; }
  .fin-input:focus, .fin-select:focus { border-color:#6366f1; outline:none; }
  .fin-btn { background:#1e293b; border:1px solid #334155; border-radius:6px; padding:8px 16px; color:#e0e0e0; font-size:0.85rem; cursor:pointer; transition:all 0.2s; }
  .fin-btn:hover { background:#334155; border-color:#6366f1; }
  .fin-btn-primary { background:#4f46e5; border-color:#4f46e5; color:#fff; }
  .fin-btn-primary:hover { background:#6366f1; }
  .fin-btn-accent { background:#0891b2; border-color:#0891b2; color:#fff; }
  .fin-btn-accent:hover { background:#06b6d4; }
  .fin-btn-remove { background:none; border:none; color:#ef4444; cursor:pointer; font-size:1rem; padding:0 4px; margin-left:8px; }

  /* ── Checkboxes Grid ────────────────────────────────────────────────── */
  .fin-check-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:6px; }
  .fin-check-label { display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; font-size:0.88rem; cursor:pointer; transition:background 0.15s; }
  .fin-check-label:hover { background:#1e293b; }
  .fin-check-label small { color:#64748b; }
  .fin-check-label input[type="checkbox"] { accent-color:#6366f1; }

  /* ── Table ──────────────────────────────────────────────────────────── */
  .fin-table { width:100%; border-collapse:collapse; font-size:0.85rem; margin-top:12px; }
  .fin-table th { background:#0f0f23; color:#94a3b8; padding:10px 12px; text-align:left; font-weight:600; border-bottom:2px solid #2a2a4a; }
  .fin-table td { padding:8px 12px; border-bottom:1px solid #1e293b; }
  .fin-table tr:hover td { background:#1e293b; }
  .fin-table tfoot td { font-weight:700; border-top:2px solid #2a2a4a; background:#0f0f23; }
  .fin-positive { color:#4ade80; }
  .fin-negative { color:#f87171; }

  /* ── Stress Test Tags ──────────────────────────────────────────────── */
  .fin-scenarios-list { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
  .fin-scenario-tag { display:flex; align-items:center; gap:6px; background:#1e293b; border:1px solid #334155; border-radius:20px; padding:6px 12px; font-size:0.82rem; }
  .fin-scenario-tag small { color:#64748b; }
  .fin-risk-badge { display:inline-block; padding:6px 16px; border-radius:20px; color:#fff; font-weight:700; font-size:0.9rem; margin-bottom:12px; }
  .fin-recommendation { background:#1e293b; border-left:4px solid #6366f1; padding:12px 16px; border-radius:0 8px 8px 0; margin:12px 0; font-size:0.9rem; }

  /* ── Pricing Totals ────────────────────────────────────────────────── */
  .fin-pricing-totals { display:flex; gap:16px; margin-bottom:16px; flex-wrap:wrap; }
  .fin-total-card { background:#0f0f23; border:1px solid #2a2a4a; border-radius:10px; padding:16px 24px; text-align:center; min-width:180px; }
  .fin-total-card span { display:block; font-size:0.8rem; color:#94a3b8; margin-bottom:4px; }
  .fin-total-card strong { font-size:1.4rem; color:#4ade80; }
  .fin-justification { background:#1e293b; border-radius:8px; padding:12px 16px; margin-top:12px; font-size:0.85rem; color:#94a3b8; }

  /* ── Commission ────────────────────────────────────────────────────── */
  .fin-person-card { background:#0f0f23; border:1px solid #2a2a4a; border-radius:10px; padding:16px; margin-bottom:12px; }
  .fin-person-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .fin-person-header strong { font-size:1rem; }
  .fin-person-header span { color:#4ade80; font-weight:600; }
  .fin-progress-bar { background:#1e293b; height:8px; border-radius:4px; overflow:hidden; margin-bottom:6px; }
  .fin-progress-fill { height:100%; border-radius:4px; transition:width 0.4s; }
  .fin-deal-list { margin-top:10px; }
  .fin-deal-item { display:flex; justify-content:space-between; padding:4px 0; font-size:0.82rem; border-bottom:1px solid #1e293b; }
  .fin-deal-item:last-child { border-bottom:none; }
  .fin-rules-info { margin-top:12px; padding:10px 14px; background:#1e293b; border-radius:8px; font-size:0.82rem; color:#94a3b8; }

  /* ── Invoice ───────────────────────────────────────────────────────── */
  .fin-invoice { background:#fff; color:#1a1a2e; border-radius:10px; padding:32px; }
  .fin-invoice-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid #e2e8f0; }
  .fin-invoice-logo { display:flex; align-items:center; gap:16px; }
  .fin-logo-placeholder { width:56px; height:56px; background:#4f46e5; color:#fff; display:flex; align-items:center; justify-content:center; border-radius:10px; font-weight:900; font-size:1.2rem; letter-spacing:2px; }
  .fin-invoice-meta { text-align:right; }
  .fin-invoice-meta h2 { margin:0 0 8px; color:#4f46e5; font-size:1.5rem; }
  .fin-invoice-meta p { margin:2px 0; font-size:0.85rem; color:#475569; }
  .fin-invoice-client { margin-bottom:20px; background:#f8fafc; padding:16px; border-radius:8px; }
  .fin-invoice-client h3 { margin:0 0 8px; font-size:0.9rem; color:#64748b; text-transform:uppercase; letter-spacing:1px; }
  .fin-invoice-client p { margin:2px 0; color:#1a1a2e; }
  .fin-invoice-table { margin:16px 0; }
  .fin-invoice-table th { background:#f1f5f9; color:#475569; }
  .fin-invoice-table td { color:#1a1a2e; border-color:#e2e8f0; }
  .fin-invoice-table tfoot td { background:#f1f5f9; color:#1a1a2e; }
  .fin-invoice-footer { margin-top:24px; padding-top:16px; border-top:2px solid #e2e8f0; }
  .fin-invoice-footer div { margin-bottom:12px; }
  .fin-invoice-footer strong { color:#475569; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px; }
  .fin-invoice-footer p { margin:4px 0; color:#1a1a2e; font-size:0.9rem; }

  /* ── CLV Chart ─────────────────────────────────────────────────────── */
  .fin-clv-chart { display:flex; flex-direction:column; gap:10px; }
  .fin-clv-row { display:flex; align-items:center; gap:12px; }
  .fin-clv-label { min-width:180px; display:flex; align-items:center; gap:8px; font-size:0.88rem; }
  .fin-clv-rank { background:#4f46e5; color:#fff; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:0.75rem; font-weight:700; flex-shrink:0; }
  .fin-clv-name { font-weight:600; color:#e0e0e0; }
  .fin-clv-trend { font-size:0.7rem; }
  .fin-clv-bar-wrap { flex:1; background:#0f0f23; border-radius:6px; height:28px; position:relative; overflow:hidden; }
  .fin-clv-bar { height:100%; background:linear-gradient(90deg, #4f46e5, #06b6d4); border-radius:6px; transition:width 0.5s ease; }
  .fin-clv-value { position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:0.78rem; color:#e0e0e0; white-space:nowrap; }
  .fin-clv-value small { color:#94a3b8; }

  /* ── Win/Loss ──────────────────────────────────────────────────────── */
  .fin-winloss-summary { display:flex; gap:16px; margin-bottom:16px; flex-wrap:wrap; }
  .fin-wl-card { background:#0f0f23; border:1px solid #2a2a4a; border-radius:10px; padding:16px 24px; text-align:center; min-width:110px; }
  .fin-wl-big { font-size:1.8rem; font-weight:800; }
  .fin-wl-card small { color:#94a3b8; font-size:0.8rem; }
  .fin-historical { background:#1e293b; border-radius:8px; padding:10px 14px; margin-bottom:12px; font-size:0.85rem; color:#94a3b8; }
  .fin-trend-chart { display:flex; gap:6px; align-items:flex-end; min-height:120px; padding:8px 0; }
  .fin-trend-bar-col { display:flex; flex-direction:column; align-items:center; gap:2px; flex:1; }
  .fin-trend-bar { min-width:20px; border-radius:4px 4px 0 0; transition:height 0.3s; }
  .fin-trend-bar-col small { font-size:0.7rem; color:#64748b; }
  .fin-reasons { flex:1; background:#0f0f23; border-radius:8px; padding:12px 16px; }
  .fin-reasons h4 { margin:0 0 8px; font-size:0.9rem; }
  .fin-reasons ul { margin:0; padding-left:18px; font-size:0.82rem; color:#cbd5e1; }
  .fin-reasons li { margin-bottom:4px; }

  /* ── Print Styles ──────────────────────────────────────────────────── */
  @media print {
    body * { visibility:hidden; }
    .fin-invoice, .fin-invoice * { visibility:visible; }
    .fin-invoice { position:absolute; left:0; top:0; width:100%; background:#fff !important; }
    .fin-btn, .fin-panel > .fin-row, .fin-panel > h2, .fin-panel > .fin-description { display:none !important; }
  }

  /* ── Responsive ────────────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .fin-pricing-totals, .fin-winloss-summary { flex-direction:column; }
    .fin-clv-label { min-width:120px; }
    .fin-invoice-header { flex-direction:column; gap:16px; }
    .fin-invoice-meta { text-align:left; }
    .fin-check-grid { grid-template-columns:1fr; }
    .fin-row { flex-direction:column; align-items:stretch; }
    .fin-row > * { width:100%; }
  }
  `;
  document.head.appendChild(style);
})();
