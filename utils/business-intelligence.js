// ============================================================================
// TBO OS — Business Intelligence Engine
// Predictive scoring, forecasting, client health, pricing, meeting ROI,
// follow-up generation, churn prediction, seasonal planning
// ============================================================================

const TBO_BI = {

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  _safeGet(key) {
    try {
      return (typeof TBO_STORAGE !== 'undefined') ? TBO_STORAGE.get(key) : {};
    } catch (e) { return {}; }
  },

  _safeGetDeals() {
    try {
      return (typeof TBO_STORAGE !== 'undefined' && TBO_STORAGE.getCrmDeals) ? TBO_STORAGE.getCrmDeals() : [];
    } catch (e) { return []; }
  },

  _safeGetErp(type) {
    try {
      return (typeof TBO_STORAGE !== 'undefined' && TBO_STORAGE.getAllErpEntities) ? TBO_STORAGE.getAllErpEntities(type) : [];
    } catch (e) { return []; }
  },

  _daysBetween(dateA, dateB) {
    const a = new Date(dateA);
    const b = dateB ? new Date(dateB) : new Date();
    return Math.floor((b - a) / 86400000);
  },

  _monthName(idx) {
    const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return nomes[idx] || '?';
  },

  _clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  _mean(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((s, v) => s + v, 0) / arr.length;
  },

  _stdDev(arr) {
    if (!arr || arr.length < 2) return 0;
    const m = this._mean(arr);
    const variance = arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
  },

  // Simple linear regression: returns { slope, intercept, r2 }
  _linearRegression(xs, ys) {
    const n = xs.length;
    if (n < 2) return { slope: 0, intercept: ys[0] || 0, r2: 0 };
    let sX = 0, sY = 0, sXY = 0, sX2 = 0, sY2 = 0;
    for (let i = 0; i < n; i++) { sX += xs[i]; sY += ys[i]; sXY += xs[i]*ys[i]; sX2 += xs[i]*xs[i]; sY2 += ys[i]*ys[i]; }
    const denom = n * sX2 - sX * sX;
    if (denom === 0) return { slope: 0, intercept: sY / n, r2: 0 };
    const slope = (n * sXY - sX * sY) / denom;
    const intercept = (sY - slope * sX) / n;
    const ssTot = sY2 - (sY * sY) / n;
    const ssRes = ssTot - slope * (sXY - (sX * sY) / n);
    return { slope, intercept, r2: Math.max(0, ssTot > 0 ? 1 - ssRes / ssTot : 0) };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PREDICTIVE DEAL SCORING
  // ═══════════════════════════════════════════════════════════════════════════

  predictDealScore(deal) {
    if (!deal) return { score: 0, factors: ['Deal nao informado'], recommendation: 'Nenhum deal fornecido.' };

    const factors = [];
    const ds = TBO_CONFIG.business.biScoring.dealScoring;
    let score = ds.baseScore;

    const context = this._safeGet('context');
    const dc = context.dados_comerciais || {};
    const allDeals = this._safeGetDeals();

    // Factor 1: Time in current stage (penalizes stale deals)
    const ageDays = TBO_CONFIG.business.biScoring.dealAgingDays;
    const actB = ds.activityBonuses;
    const inactP = ds.inactivityPenalties;
    if (deal.updatedAt) {
      const daysInStage = this._daysBetween(deal.updatedAt);
      if (daysInStage <= actB.recentDays) { score += actB.recentPts; factors.push(`Atividade recente (+${actB.recentPts})`); }
      else if (daysInStage <= actB.weekDays) { score += actB.weekPts; factors.push(`Atividade na ultima semana (+${actB.weekPts})`); }
      else if (daysInStage <= ageDays.biweekly) { factors.push('7-14 dias sem atividade (neutro)'); }
      else if (daysInStage <= ageDays.month) { score += inactP.twoWeeksPts; factors.push(`${daysInStage} dias parado (${inactP.twoWeeksPts})`); }
      else { score += inactP.monthPts; factors.push(`${daysInStage} dias estagnado (${inactP.monthPts})`); }
    }

    // Factor 2: Deal value vs average ticket
    const avgTicket = dc['2025']?.ticket_medio || TBO_CONFIG.business.financial.averageTicket2025;
    const valRanges = TBO_CONFIG.business.biScoring.dealValueRanges;
    const valB = ds.valueBonuses;
    if (deal.value > 0) {
      const ratio = deal.value / avgTicket;
      if (ratio >= valRanges.optimalMin && ratio <= valRanges.optimalMax) { score += valB.optimal; factors.push(`Valor dentro da faixa ideal (+${valB.optimal})`); }
      else if (ratio > valRanges.optimalMax && ratio <= valRanges.strongMax) { score += valB.strong; factors.push(`Valor acima da media, bom potencial (+${valB.strong})`); }
      else if (ratio > valRanges.strongMax) { score += valB.tooHigh; factors.push(`Valor muito alto, maior risco de negociacao (${valB.tooHigh})`); }
      else { score += valB.tooLow; factors.push(`Valor abaixo do ticket medio (${valB.tooLow})`); }
    } else {
      score -= 10;
      factors.push('Sem valor definido (-10)');
    }

    // Factor 3: Service type win rate estimate
    const biCfg = TBO_CONFIG.business.biScoring;
    const serviceWinRates = biCfg.serviceWinRates;
    const baseWinRate = biCfg.baseWinRate;

    const services = deal.services || [];
    if (services.length > 0) {
      const rates = services.map(s => serviceWinRates[s] || baseWinRate);
      const avgRate = this._mean(rates);
      const boost = Math.round((avgRate - baseWinRate) / 3);
      score += boost;
      factors.push(`Servicos (${services.join(', ')}): taxa estimada ${avgRate.toFixed(0)}% (${boost >= 0 ? '+' : ''}${boost})`);
    }

    // Factor 4: Client history (returning clients convert more)
    const clientes = context.clientes_construtoras || [];
    const finalizados = context.projetos_finalizados || {};
    const company = (deal.company || '').toLowerCase();

    const cliB = ds.clientBonuses;
    if (company) {
      const isExisting = clientes.some(c => c.toLowerCase().includes(company) || company.includes(c.toLowerCase()));
      if (isExisting) { score += cliB.existing; factors.push(`Cliente existente na base (+${cliB.existing})`); }

      let totalProjetos = 0;
      Object.values(finalizados).forEach(arr => {
        if (Array.isArray(arr)) {
          totalProjetos += arr.filter(p => p.toLowerCase().includes(company)).length;
        }
      });
      if (totalProjetos >= cliB.repeatThreshold) { score += cliB.repeatPts; factors.push(`${totalProjetos} projetos historicos (+${cliB.repeatPts})`); }
    }

    // Factor 5: Stage proximity to close
    const stageBonuses = biCfg.stageBonuses;
    const stageB = stageBonuses[deal.stage] || 0;
    score += stageB;
    if (stageB !== 0) factors.push(`Estagio ${deal.stage} (${stageB >= 0 ? '+' : ''}${stageB})`);

    // Factor 6: Seasonal pattern (S1 weaker, S2 stronger)
    const currentMonth = new Date().getMonth();
    const sB = ds.seasonalBonuses;
    if (currentMonth >= biCfg.seasonalMonths.start) { score += sB.favorable; factors.push(`Periodo S2 favoravel (+${sB.favorable})`); }
    else if (currentMonth <= biCfg.seasonalMonths.end) { score += sB.slow; factors.push(`Inicio de ano, mercado mais lento (${sB.slow})`); }

    // Factor 7: Probability already set by user
    if (deal.probability > 0) {
      const probAdjust = Math.round((deal.probability - biCfg.probabilityBase) / biCfg.probabilityDivisor);
      score += probAdjust;
      factors.push(`Probabilidade manual ${deal.probability}% (${probAdjust >= 0 ? '+' : ''}${probAdjust})`);
    }

    score = this._clamp(Math.round(score), ds.minScore, ds.maxScore);

    // Recommendation
    const recTh = biCfg.recommendationThresholds;
    let recommendation;
    if (score >= recTh.excellent) recommendation = 'Alta probabilidade de fechamento. Priorizar follow-up e proposta final.';
    else if (score >= recTh.good) recommendation = 'Bom potencial. Manter contato regular e agendar reuniao de alinhamento.';
    else if (score >= recTh.moderate) recommendation = 'Potencial moderado. Requalificar necessidades e ajustar proposta.';
    else if (score >= recTh.low) recommendation = 'Baixo potencial. Avaliar se vale manter esforco comercial.';
    else recommendation = 'Muito baixo. Considerar descontinuar ou redirecionar abordagem.';

    return { score, factors, recommendation };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. REVENUE FORECASTING ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  forecastRevenue(months = 6) {
    const context = this._safeGet('context');
    const dc = context.dados_comerciais || {};

    // Gather historical monthly revenue data
    const historicalMonths = [];
    const historicalValues = [];

    // 2024: total_vendido distributed across 7 months (Jun-Dec)
    const total2024 = dc['2024']?.total_vendido || TBO_CONFIG.business.financial.totalRevenue2024;
    const monthly2024 = total2024 / 7;
    for (let i = 5; i <= 11; i++) { // Jun=5 to Dec=11
      historicalMonths.push(2024 * 12 + i);
      historicalValues.push(monthly2024);
    }

    // 2025: total_vendido distributed across 12 months
    const total2025 = dc['2025']?.total_vendido || 746467;
    const monthly2025 = total2025 / 12;
    for (let i = 0; i <= 11; i++) {
      historicalMonths.push(2025 * 12 + i);
      // Apply seasonality: S1 weaker (-20%), S2 stronger (+20%)
      const seasonFactor = i < 6 ? 0.8 : 1.2;
      historicalValues.push(monthly2025 * seasonFactor);
    }

    // Current year: actual cash flow data from fluxo_caixa
    const fc = dc[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa;
    const receitaMensal2026 = fc?.receita_mensal || {};
    const monthKeys = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const realized = fc?.meses_realizados || ['jan', 'fev'];

    realized.forEach(mKey => {
      const idx = monthKeys.indexOf(mKey);
      if (idx >= 0 && receitaMensal2026[mKey]) {
        historicalMonths.push(2026 * 12 + idx);
        historicalValues.push(receitaMensal2026[mKey]);
      }
    });

    // Linear regression
    const xs = historicalMonths.map((v, i) => i);
    const reg = this._linearRegression(xs, historicalValues);

    // Seasonal adjustment factors (based on real TBO data: S1 2025 had -41% contraction)
    const seasonFactors = [0.70, 0.75, 0.65, 0.55, 0.50, 0.45, 1.10, 1.15, 1.15, 1.10, 1.05, 1.00];

    // Generate forecast from current month forward
    const now = new Date();
    const currentMonthAbs = now.getFullYear() * 12 + now.getMonth();
    const forecast = [];
    const stdDev = this._stdDev(historicalValues);

    for (let i = 0; i < months; i++) {
      const targetMonthAbs = currentMonthAbs + i;
      const monthIdx = targetMonthAbs % 12;
      const year = Math.floor(targetMonthAbs / 12);

      // Check if we have actual data for this month
      const mKey = monthKeys[monthIdx];
      const isRealized = year === 2026 && realized.includes(mKey);

      let predicted;
      if (isRealized && receitaMensal2026[mKey]) {
        predicted = receitaMensal2026[mKey];
      } else if (year === 2026 && receitaMensal2026[mKey]) {
        // Projected by the company itself
        predicted = receitaMensal2026[mKey];
      } else {
        // Regression + seasonal
        const xVal = xs.length + i;
        predicted = Math.max(0, (reg.slope * xVal + reg.intercept) * seasonFactors[monthIdx]);
      }

      const confidence = isRealized ? 1.0 : Math.max(0.3, 0.85 - i * 0.08);
      const margin = stdDev * (1 - confidence) * 1.5;

      forecast.push({
        month: `${this._monthName(monthIdx)} ${year}`,
        monthIndex: monthIdx,
        year,
        predicted: Math.round(predicted),
        lower: Math.round(Math.max(0, predicted - margin)),
        upper: Math.round(predicted + margin),
        realized: isRealized,
        confidence: Math.round(confidence * 100)
      });
    }

    // Determine trend
    const firstHalf = forecast.slice(0, Math.ceil(forecast.length / 2));
    const secondHalf = forecast.slice(Math.ceil(forecast.length / 2));
    const avgFirst = this._mean(firstHalf.map(f => f.predicted));
    const avgSecond = this._mean(secondHalf.map(f => f.predicted));
    const trendPct = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;

    let trend;
    if (trendPct > 10) trend = 'up';
    else if (trendPct < -10) trend = 'down';
    else trend = 'stable';

    return {
      forecast,
      trend,
      trendPercent: Math.round(trendPct),
      confidence: Math.round(this._mean(forecast.map(f => f.confidence))),
      regression: { slope: Math.round(reg.slope), r2: Math.round(reg.r2 * 100) / 100 },
      meta: {
        metaMensal: fc?.meta_vendas_mensal || TBO_CONFIG.business.financial.monthlyTarget,
        metaAnual: fc?.meta_vendas_anual || (TBO_CONFIG.business.financial.monthlyTarget * 12),
        resultadoProjetado: fc?.resultado_liquido_projetado || 0
      }
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CLIENT HEALTH SCORE
  // ═══════════════════════════════════════════════════════════════════════════

  getClientHealth(clientName) {
    if (!clientName) return { score: 0, factors: {}, risk: 'high', suggestion: 'Nome do cliente nao informado.' };

    const context = this._safeGet('context');
    const meetings = this._safeGet('meetings');
    const cn = clientName.toLowerCase();

    // Active projects
    const ativos = (context.projetos_ativos || []).filter(p =>
      (p.construtora || '').toLowerCase().includes(cn) || cn.includes((p.construtora || '').toLowerCase())
    );

    // Finished projects count by year
    const finalizados = context.projetos_finalizados || {};
    let totalFinalizados = 0, lastFinYear = 0;
    const yearCounts = {};
    Object.entries(finalizados).forEach(([year, projs]) => {
      if (!Array.isArray(projs)) return;
      const count = projs.filter(p => p.toLowerCase().includes(cn)).length;
      if (count > 0) { totalFinalizados += count; yearCounts[year] = count; lastFinYear = Math.max(lastFinYear, parseInt(year)); }
    });

    // Meetings
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    const clientMeetings = meetingsArr.filter(m => {
      const title = (m.title || m.titulo || '').toLowerCase();
      const parts = (m.participants || m.participantes || []).map(p => typeof p === 'string' ? p.toLowerCase() : (p.name || p.email || '').toLowerCase());
      return title.includes(cn) || parts.some(p => p.includes(cn));
    });
    let lastMeetingDate = null;
    if (clientMeetings.length > 0) {
      clientMeetings.sort((a, b) => new Date(b.date || b.data) - new Date(a.date || a.data));
      lastMeetingDate = clientMeetings[0].date || clientMeetings[0].data;
    }

    // Factors (each 0-100)
    const yearsActive = Object.keys(yearCounts).length || 1;
    const frequency = this._clamp(Math.round(((totalFinalizados + ativos.length) / Math.max(1, yearsActive)) * 25), 0, 100);

    const avgServices = ativos.length > 0 ? this._mean(ativos.map(p => (p.bus || []).length)) : 0;
    const ticketTrend = this._clamp(Math.round(avgServices * 20), 0, 100);

    const daysSinceLastMeeting = lastMeetingDate ? this._daysBetween(lastMeetingDate) : 999;
    const engLevels = TBO_CONFIG.business.biScoring.engagementLevels;
    const engagement = (engLevels.find(l => daysSinceLastMeeting <= l.maxDays) || engLevels[engLevels.length - 1]).score;

    // Revision rate from ERP deliverables
    const erpProjects = this._safeGetErp('project').filter(p => (p.client || '').toLowerCase().includes(cn) || (p.client_company || '').toLowerCase().includes(cn));
    let revisionRate = 70;
    if (erpProjects.length > 0) {
      const cDelivs = this._safeGetErp('deliverable').filter(d => erpProjects.some(p => p.id === d.project_id));
      if (cDelivs.length > 0) revisionRate = this._clamp(Math.round(100 - this._mean(cDelivs.map(d => (d.versions || []).length)) * 15), 0, 100);
    }

    // Payment speed from contas_a_receber
    let paymentSpeed = 60;
    const fc = (context.dados_comerciais || {})[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa;
    if (fc?.contas_a_receber?.fevereiro?.clientes) {
      const entry = fc.contas_a_receber.fevereiro.clientes.find(c => c.nome.toLowerCase().includes(cn));
      const pss = TBO_CONFIG.business.financial.paymentSpeedScoring;
      if (entry) paymentSpeed = pss[entry.status] || 60;
    }

    const factors = { frequency, ticketTrend, paymentSpeed, revisionRate, engagement };
    const hw = TBO_CONFIG.business.biScoring.healthWeights;
    const weights = { frequency: hw.frequency, ticketTrend: hw.ticket, paymentSpeed: hw.paymentSpeed, revisionRate: hw.revisionRate, engagement: hw.engagement };

    let score = 0;
    Object.entries(factors).forEach(([key, val]) => {
      score += val * (weights[key] || 0.2);
    });
    score = this._clamp(Math.round(score), 0, 100);

    let risk;
    const rt = TBO_CONFIG.business.scoring.risk;
    if (score >= rt.low) risk = 'low';
    else if (score >= rt.medium) risk = 'medium';
    else risk = 'high';

    // Find last project date
    let lastProject = null;
    if (lastFinYear > 0) lastProject = `${lastFinYear}-12-31`;
    if (ativos.length > 0) lastProject = new Date().toISOString().split('T')[0];

    // Suggestion
    let suggestion;
    if (risk === 'high') suggestion = `Cliente com risco alto de churn. Agendar reuniao de relacionamento e apresentar novos servicos.`;
    else if (risk === 'medium') suggestion = `Manter contato proativo. Enviar cases recentes e propor reuniao de alinhamento.`;
    else suggestion = `Cliente saudavel. Buscar upsell em novas BUs (${['Branding', 'Marketing', 'Audiovisual'].filter(s => !ativos.some(p => (p.bus || []).includes(s))).join(', ') || 'manter pacote atual'}).`;

    return {
      score, factors, risk, lastProject, suggestion,
      activeProjects: ativos.length,
      totalProjects: totalFinalizados + ativos.length,
      daysSinceLastMeeting,
      meetingsCount: clientMeetings.length
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. AUTO PRICING SUGGESTION
  // ═══════════════════════════════════════════════════════════════════════════

  suggestPricing(serviceType, complexity, clientId) {
    complexity = complexity || 'media'; // 'baixa', 'media', 'alta'
    const market = this._safeGet('market');
    const context = this._safeGet('context');
    const precos = (context.dados_comerciais || {}).precos || {};
    const concorrentes = market.concorrentes_precos_mercado || {};

    // Base pricing by service type
    const basePricing = {
      render_fachada: { min: 1300, base: 1500, max: 1800, unit: 'por imagem' },
      render_interno: { min: 1300, base: 1500, max: 1800, unit: 'por imagem' },
      video: { min: 18000, base: 20000, max: 25000, unit: 'por filme' },
      tour_virtual: { min: 8000, base: 12000, max: 18000, unit: 'por tour' },
      branding: { min: 15000, base: 25000, max: 45000, unit: 'por projeto' },
      pack_social: { min: 5000, base: 8000, max: 15000, unit: 'por mes' },
      animacao: { min: 12000, base: 18000, max: 28000, unit: 'por animacao' }
    };

    const base = basePricing[serviceType] || basePricing.render_fachada;

    // Complexity multiplier
    const complexityMultiplier = { baixa: 0.85, media: 1.0, alta: 1.35 };
    const mult = complexityMultiplier[complexity] || 1.0;

    // Client relationship discount
    let clientDiscount = 0;
    if (clientId) {
      const health = this.getClientHealth(clientId);
      if (health.totalProjects >= 5) clientDiscount = 0.05; // 5% loyalty
      else if (health.totalProjects >= 3) clientDiscount = 0.03;
    }

    const suggested = Math.round(base.base * mult * (1 - clientDiscount));
    const minimum = Math.round(base.min * mult * 0.95);

    // Market price from concorrentes
    let marketPrice = 0;
    if (serviceType.includes('render') || serviceType.includes('fachada') || serviceType.includes('interno')) {
      const img = concorrentes.imagens_3d || {};
      marketPrice = Math.round(((img.minimo || 450) + (img.maximo || 900)) / 2);
    } else if (serviceType === 'video' || serviceType === 'animacao') {
      const film = concorrentes.filmes || {};
      marketPrice = Math.round(((film.minimo || 3000) + (film.maximo || 5000)) / 2);
    } else if (serviceType === 'branding') {
      const book = concorrentes.books || {};
      marketPrice = Math.round(((book.minimo || 3000) + (book.maximo || 6000)) / 2);
    } else {
      marketPrice = Math.round(base.base * 0.45);
    }

    const margin = suggested > 0 ? Math.round(((suggested - marketPrice) / suggested) * 100) : 0;

    // Reasoning
    const serviceLabel = {
      render_fachada: 'Render de Fachada',
      render_interno: 'Render de Interior',
      video: 'Filme/Video',
      tour_virtual: 'Tour Virtual',
      branding: 'Branding Completo',
      pack_social: 'Pack Social Media',
      animacao: 'Animacao 3D'
    };

    const reasoning = [
      `Servico: ${serviceLabel[serviceType] || serviceType} (${base.unit})`,
      `Complexidade: ${complexity} (multiplicador ${mult}x)`,
      `Mercado cobra entre R$${marketPrice} (media concorrentes)`,
      `TBO cobra 2-3x acima do mercado justificado por: qualidade premium, prazo confiavel, suporte estrategico, ROAS comprovado (173.9x Porto Batel)`,
      clientDiscount > 0 ? `Desconto fidelidade aplicado: ${(clientDiscount * 100).toFixed(0)}%` : null,
      `Margem sobre mercado: ${margin}%`
    ].filter(Boolean).join('. ');

    return {
      suggested,
      minimum,
      market: marketPrice,
      margin,
      unit: base.unit,
      reasoning
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. MEETING ROI CALCULATOR
  // ═══════════════════════════════════════════════════════════════════════════

  calculateMeetingROI(meetingData) {
    if (!meetingData) return { cost: 0, actionItemsGenerated: 0, completedActions: 0, roi: 0, verdict: 'neutra' };

    // Hourly rates by role
    const hourRates = {
      founder: 150, socio: 150, coo: 150, diretor: 150,
      po: 80, coordenador: 80,
      artista: 50, designer: 50, analista: 50, assistente: 35,
      terceiro: 40, externo: 0
    };

    const durationHours = (meetingData.duration_minutes || meetingData.duracao_min || 30) / 60;
    const participants = meetingData.participants || meetingData.participantes || [];

    // Calculate cost
    let totalCost = 0;
    let tboParticipants = 0;

    participants.forEach(p => {
      const isTbo = p.is_tbo || (typeof p === 'string' && p.includes('@agenciatbo.com.br'));
      if (!isTbo) return;

      tboParticipants++;
      const email = (typeof p === 'string' ? p : p.email || '').toLowerCase();
      const name = (typeof p === 'string' ? p : p.name || '').toLowerCase();

      let rate = hourRates.artista; // default
      if (email.includes('marco') || email.includes('ruy') || name.includes('marco') || name.includes('ruy')) {
        rate = hourRates.founder;
      } else if (name.includes('nathalia') || name.includes('rafa') || name.includes('nelson')) {
        rate = hourRates.po;
      } else if (name.includes('celso')) {
        rate = hourRates.assistente;
      }

      totalCost += rate * durationHours;
    });

    // If no TBO participants detected, estimate with 2 people avg
    if (tboParticipants === 0) {
      totalCost = hourRates.po * durationHours * 2;
      tboParticipants = 2;
    }

    // Action items
    const actionItems = meetingData.action_items || [];
    const actionItemsGenerated = actionItems.length;
    const completedActions = actionItems.filter(a =>
      a.status === 'completed' || a.status === 'concluido' || a.completed
    ).length;

    // ROI calculation
    // Each action item has an estimated value of R$200 (time saved, progress made)
    const actionValue = 200;
    const totalValue = completedActions * actionValue + (actionItemsGenerated - completedActions) * (actionValue * 0.3);
    const roi = totalCost > 0 ? Math.round(((totalValue - totalCost) / totalCost) * 100) : 0;

    // Verdict
    let verdict;
    if (actionItemsGenerated === 0 && durationHours > 0.25) verdict = 'improdutiva';
    else if (roi >= 50 || (actionItemsGenerated >= 3 && durationHours <= 0.5)) verdict = 'produtiva';
    else if (roi >= 0 || actionItemsGenerated >= 1) verdict = 'neutra';
    else verdict = 'improdutiva';

    // Additional metrics
    const costPerAction = actionItemsGenerated > 0 ? Math.round(totalCost / actionItemsGenerated) : totalCost;
    const minutesPerAction = actionItemsGenerated > 0 ? Math.round((meetingData.duration_minutes || 30) / actionItemsGenerated) : 0;

    return {
      cost: Math.round(totalCost),
      actionItemsGenerated,
      completedActions,
      roi,
      verdict,
      tboParticipants,
      durationMinutes: meetingData.duration_minutes || 30,
      costPerAction,
      minutesPerAction
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SMART FOLLOW-UP GENERATOR
  // ═══════════════════════════════════════════════════════════════════════════

  generateFollowUp(dealId) {
    const deals = this._safeGetDeals();
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return { subject: '', body: '', urgency: 'low', daysSinceLastContact: 0 };

    const daysSince = deal.updatedAt ? this._daysBetween(deal.updatedAt) : 30;
    const clientName = deal.company || deal.contact || 'Cliente';
    const dealName = deal.name || 'projeto';
    const services = (deal.services || []).join(', ') || 'servicos';
    const value = deal.value || 0;

    let subject, body, urgency;

    // Template selection based on stage and days
    if (deal.stage === 'proposta' && daysSince >= 5) {
      urgency = daysSince >= TBO_CONFIG.business.thresholds.followUp.highUrgencyDays ? 'high' : daysSince >= TBO_CONFIG.business.thresholds.followUp.mediumUrgencyDays ? 'medium' : 'low';
      subject = `Proposta TBO x ${clientName} — ${dealName}`;
      body = `Ola!\n\nEstou fazendo um follow-up referente a proposta que enviamos ${daysSince > 7 ? 'ha ' + daysSince + ' dias' : 'recentemente'} para o projeto ${dealName}.\n\nFicamos empolgados com a possibilidade de trabalhar juntos nesse projeto (${services}). Gostariamos de saber se houve a oportunidade de avaliar a proposta e se tem alguma duvida.${value > 0 ? '\n\nO investimento proposto de ' + this._formatCurrency(value) + ' inclui nosso pacote completo com acompanhamento dedicado.' : ''}\n\nEstamos a disposicao para uma call rapida de alinhamento.\n\nAbracos,\nEquipe TBO`;
    } else if (deal.stage === 'negociacao' && daysSince >= 10) {
      urgency = daysSince >= 21 ? 'high' : 'medium';
      subject = `Alinhamento — ${dealName} | TBO x ${clientName}`;
      body = `Ola!\n\nQueria retomar a conversa sobre o ${dealName}. Faz ${daysSince} dias desde nosso ultimo contato e gostavamos de entender como podemos avancar.\n\nEstamos com janela de producao favoravel neste momento, o que garante agilidade na entrega.\n\nPontos que podemos flexibilizar:\n- Escopo: iniciar com fase piloto\n- Prazo: capacidade para iniciar em breve\n- Condicoes: abertos a conversar sobre pagamento\n\nQue tal agendarmos 15 minutos para alinhar?\n\nAbracos,\nEquipe TBO`;
    } else if (daysSince >= 2 && daysSince <= 5) {
      urgency = 'low';
      subject = `Resumo reuniao — ${dealName} | TBO`;
      body = `Ola!\n\nObrigado pela reuniao sobre o ${dealName}! Foi muito produtiva.\n\nProximos passos alinhados:\n- [Inserir action items da reuniao]\n- Enviar proposta atualizada ate [data]\n- Agendar proxima reuniao de acompanhamento\n\nNos avise se algo ficou em aberto.\n\nAbracos,\nEquipe TBO`;
    } else {
      urgency = daysSince >= 30 ? 'high' : 'low';
      subject = `TBO x ${clientName} — Novidades e oportunidades`;
      body = `Ola!\n\nEstamos com projetos incriveis em andamento e lembrei do ${dealName}. Gostaria de compartilhar cases recentes que podem ser relevantes.\n\nNosso time esta com disponibilidade para novos projetos de ${services}, e adorariamos explorar como podemos agregar valor.\n\nPosso enviar nossa apresentacao atualizada?\n\nAbracos,\nEquipe TBO`;
    }

    return { subject, body, urgency, daysSinceLastContact: daysSince };
  },

  _formatCurrency(val) {
    if (typeof TBO_FINANCE_MASK !== 'undefined' && TBO_FINANCE_MASK.isMasked()) return 'R$ ••••••';
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.currency) {
      return TBO_FORMATTER.currency(val);
    }
    return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. CHURN PREDICTION
  // ═══════════════════════════════════════════════════════════════════════════

  predictChurn(clientName) {
    if (!clientName) return { risk: 100, signals: ['Cliente nao informado'], lastActivity: null, recommendedAction: '' };

    const context = this._safeGet('context');
    const meetings = this._safeGet('meetings');
    const cn = clientName.toLowerCase();

    const signals = [];
    const cr = TBO_CONFIG.business.biScoring.churnRisk;
    let risk = cr.baseRisk;

    // Signal 1: No active projects
    const ativos = (context.projetos_ativos || []).filter(p =>
      (p.construtora || '').toLowerCase().includes(cn)
    );
    if (ativos.length === 0) {
      risk += cr.lowFrequency;
      signals.push('Nenhum projeto ativo no momento');
    }

    // Signal 2: Decreasing project frequency
    const finalizados = context.projetos_finalizados || {};
    const yearCounts = {};
    Object.entries(finalizados).forEach(([year, projs]) => {
      if (!Array.isArray(projs)) return;
      const count = projs.filter(p => p.toLowerCase().includes(cn)).length;
      if (count > 0) yearCounts[year] = count;
    });
    const years = Object.keys(yearCounts).map(Number).sort();
    if (years.length >= 2) {
      const last = yearCounts[years[years.length - 1]] || 0;
      const prev = yearCounts[years[years.length - 2]] || 0;
      if (last < prev) { risk += cr.lowRevisionRate; signals.push(`Frequencia decrescente: ${prev} projetos em ${years[years.length - 2]} vs ${last} em ${years[years.length - 1]}`); }
    }

    // Signal 3: No recent meetings
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    const clientMeetings = meetingsArr.filter(m => (m.title || m.titulo || '').toLowerCase().includes(cn));
    let lastActivity = null;
    if (clientMeetings.length > 0) {
      clientMeetings.sort((a, b) => new Date(b.date || b.data) - new Date(a.date || a.data));
      lastActivity = clientMeetings[0].date || clientMeetings[0].data;
    }
    if (!lastActivity && years.length > 0) lastActivity = `${years[years.length - 1]}-12-31`;

    const daysSinceActivity = lastActivity ? this._daysBetween(lastActivity) : 365;
    if (daysSinceActivity > 90) { risk += cr.inactivity90d; signals.push(`${daysSinceActivity} dias sem contato registrado`); }
    else if (daysSinceActivity > 30) { risk += cr.inactivity30d; signals.push(`${daysSinceActivity} dias desde ultimo contato`); }

    // Signal 4: Low project count
    const totalProjects = Object.values(yearCounts).reduce((s, v) => s + v, 0) + ativos.length;
    if (totalProjects <= 1) { risk += cr.approvalDelay; signals.push('Apenas 1 projeto no historico (baixa fidelizacao)'); }

    // Signal 5: Single BU (low switching cost)
    if (ativos.length > 0) {
      const allBus = new Set(); ativos.forEach(p => (p.bus || []).forEach(b => allBus.add(b)));
      if (allBus.size <= 1) { risk += cr.singleBU; signals.push(`Usa apenas 1 BU (${[...allBus].join(', ')}), facil de substituir`); }
    }

    // Signal 6: Long approval times from ERP
    const erpProjs = this._safeGetErp('project').filter(p => (p.client || '').toLowerCase().includes(cn));
    const reviewDelivs = this._safeGetErp('deliverable').filter(d => d.status === 'em_revisao' && erpProjs.some(p => p.id === d.project_id));
    if (reviewDelivs.length > 0) {
      const avgDays = this._mean(reviewDelivs.map(d => this._daysBetween(d.updatedAt || d.createdAt)));
      if (avgDays > 7) { risk += cr.approvalDelay; signals.push(`Tempo medio de aprovacao: ${Math.round(avgDays)} dias`); }
    }

    risk = this._clamp(risk, 0, 100);

    // Recommended action
    const cTh = cr.thresholds;
    let recommendedAction;
    if (risk >= cTh.urgent) recommendedAction = 'Urgente: agendar reuniao de relacionamento. Oferecer condicoes especiais para novo projeto.';
    else if (risk >= cTh.medium) recommendedAction = 'Enviar case study relevante e propor reuniao de alinhamento para proximos projetos.';
    else if (risk >= cTh.low) recommendedAction = 'Manter comunicacao regular. Incluir em newsletters e eventos TBO.';
    else recommendedAction = 'Baixo risco de churn. Focar em upsell e expansion.';

    if (signals.length === 0) signals.push('Nenhum sinal de churn detectado');

    return { risk, signals, lastActivity, recommendedAction };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. SEASONAL BUSINESS PLANNER
  // ═══════════════════════════════════════════════════════════════════════════

  getSeasonalInsights(month) {
    if (month === undefined || month === null) month = new Date().getMonth();

    const context = this._safeGet('context');
    const dc = context.dados_comerciais || {};
    const fc = dc[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa || {};
    const receitaMensal = fc.receita_mensal || {};
    const monthKeys = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const mKey = monthKeys[month] || 'jan';

    // Seasonal patterns for real estate marketing in Curitiba
    // [outlook, opportunityScore, [recommended actions]]
    const seasonalRaw = [
      ['Inicio de ano conservador. Construtoras definindo orcamentos.', 35, ['Prospectar construtoras para S1', 'Renovar contratos anuais', 'Revisar portfolio e cases']],
      ['Fevereiro curto (carnaval). Bom para planejamento e alinhamento.', 40, ['Enviar propostas para Q1', 'Finalizar entregas pendentes', 'Alinhar pipeline comercial']],
      ['Marco: mes de decisao. Construtoras comecam a contratar.', 55, ['Intensificar prospecao outbound', 'Apresentar novos servicos', 'Participar de eventos do setor']],
      ['Abril: pre-lancamentos S1. Demanda por renders e materiais.', 60, ['Priorizar entregas de lancamentos', 'Ofertar pacotes de lancamento', 'Preparar capacidade de producao']],
      ['Maio: fluxo moderado. Preparacao para lancamentos tardios.', 50, ['Follow-up de propostas abertas', 'Producao intensiva', 'Nurturing de leads frios']],
      ['Junho encerra S1. Historicamente o mes mais fraco.', 30, ['Focar em entregas e faturamento', 'Planejar estrategia S2', 'Investir em capacitacao da equipe']],
      ['Julho inicia S2. Mercado aquece para lancamentos.', 70, ['Retomar prospecao intensiva', 'Enviar propostas S2', 'Preparar equipe para alta demanda']],
      ['Agosto: pico de contratacoes para SET-NOV.', 80, ['Maximizar conversao de propostas', 'Contratar freelancers se necessario', 'Garantir capacidade de entrega']],
      ['Setembro: alta demanda. Lancamentos em ritmo forte.', 85, ['Priorizar entregas de qualidade', 'Upsell para clientes ativos', 'Documentar cases para portfolio']],
      ['Outubro: continuidade da alta. Black month de lancamentos.', 80, ['Manter ritmo de producao', 'Prospectar para Q1 do proximo ano', 'Revisar precos']],
      ['Novembro: ultimos lancamentos. Corrida para entregas.', 65, ['Finalizar entregas do ano', 'Renegociar contratos anuais', 'Planejar portfolio proximo ano']],
      ['Dezembro: encerramento. Foco em faturamento e cobranca.', 40, ['Cobrar contas a receber', 'Fechamento financeiro do ano', 'Retrospectiva e planejamento']]
    ];
    const sr = seasonalRaw[month] || seasonalRaw[0];
    const season = { outlook: sr[0], opportunity: sr[1], actions: sr[2] };
    const historicalRevenue = receitaMensal[mKey] || 0;
    const metaMensal = fc.meta_vendas_mensal || TBO_CONFIG.business.financial.monthlyTarget;

    return {
      month: month,
      monthName: this._monthName(month),
      marketOutlook: season.outlook,
      recommendedActions: season.actions,
      historicalRevenue,
      metaMensal,
      gapToMeta: metaMensal - historicalRevenue,
      opportunityScore: season.opportunity,
      semester: month < 6 ? 'S1' : 'S2',
      semesterNote: month < 6
        ? 'S1 2025 teve retracao de -41% em lancamentos. Cautela recomendada.'
        : 'S2 historicamente mais forte. Aproveitar janela de oportunidade.'
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTIVE SUMMARY (improvement #47)
  // ═══════════════════════════════════════════════════════════════════════════

  generateExecutiveSummary() {
    const context = this._safeGet('context');
    const deals = this._safeGetDeals();
    const dc = context.dados_comerciais || {};
    const L = (s) => lines.push(s);
    const lines = [];

    L('=== RESUMO EXECUTIVO TBO — BUSINESS INTELLIGENCE ===');
    L(`Data: ${new Date().toLocaleDateString('pt-BR')}\n`);

    // Revenue forecast
    try {
      const forecast = this.forecastRevenue(3);
      L('--- PREVISAO DE RECEITA (3 meses) ---');
      forecast.forecast.forEach(f => {
        L(`  ${f.month}: R$${f.predicted.toLocaleString('pt-BR')}${f.realized ? ' [REALIZADO]' : ''} (${f.confidence}%)`);
      });
      L(`  Tendencia: ${forecast.trend === 'up' ? 'ALTA' : forecast.trend === 'down' ? 'QUEDA' : 'ESTAVEL'} (${forecast.trendPercent > 0 ? '+' : ''}${forecast.trendPercent}%)`);
      L(`  Meta mensal: R$${(forecast.meta.metaMensal || 0).toLocaleString('pt-BR')}\n`);
    } catch (e) { L('  [Erro ao gerar previsao de receita]\n'); }

    // Pipeline
    if (deals.length > 0) {
      L('--- PIPELINE CRM ---');
      const stages = {};
      let totalPipeline = 0;
      deals.forEach(d => {
        const st = d.stage || 'lead';
        if (!stages[st]) stages[st] = { count: 0, value: 0 };
        stages[st].count++;
        stages[st].value += d.value || 0;
        if (!['fechado_ganho', 'fechado_perdido'].includes(st)) totalPipeline += d.value || 0;
      });
      Object.entries(stages).forEach(([stage, data]) => L(`  ${stage}: ${data.count} deals (R$${data.value.toLocaleString('pt-BR')})`));
      L(`  Pipeline aberto: R$${totalPipeline.toLocaleString('pt-BR')}`);

      const scored = deals.filter(d => !['fechado_ganho', 'fechado_perdido'].includes(d.stage))
        .map(d => ({ ...d, biScore: this.predictDealScore(d).score }))
        .sort((a, b) => b.biScore - a.biScore).slice(0, 3);
      if (scored.length > 0) {
        L('\n--- TOP DEALS (por score BI) ---');
        scored.forEach(d => L(`  [${d.biScore}/100] ${d.name} — ${d.company} — R$${(d.value || 0).toLocaleString('pt-BR')}`));
      }
      L('');
    }

    // Client health
    const clientes = context.clientes_construtoras || [];
    if (clientes.length > 0) {
      L('--- SAUDE DOS PRINCIPAIS CLIENTES ---');
      clientes.slice(0, 8).map(c => {
        try { const h = this.getClientHealth(c); return { name: c, score: h.score, risk: h.risk, active: h.activeProjects }; }
        catch (e) { return { name: c, score: 0, risk: 'unknown', active: 0 }; }
      }).sort((a, b) => a.score - b.score).forEach(h => {
        const rl = h.risk === 'high' ? 'ALTO RISCO' : h.risk === 'medium' ? 'ATENCAO' : 'OK';
        L(`  ${h.name}: ${h.score}/100 [${rl}] — ${h.active} projeto(s) ativo(s)`);
      });
      L('');
    }

    // Seasonal + Churn
    try { const s = this.getSeasonalInsights(); L(`--- PERSPECTIVA SAZONAL ---\n  ${s.monthName} (${s.semester}) | Oportunidade: ${s.opportunityScore}/100\n  ${s.marketOutlook}\n`); } catch (e) { /* skip */ }

    if (clientes.length > 0) {
      const churn = clientes.map(c => { try { return { name: c, ...this.predictChurn(c) }; } catch (e) { return null; } })
        .filter(c => c && c.risk >= 50).sort((a, b) => b.risk - a.risk);
      if (churn.length > 0) { L('--- ALERTAS DE CHURN ---'); churn.slice(0, 5).forEach(c => L(`  ${c.name}: risco ${c.risk}% — ${c.signals[0] || ''}`)); L(''); }
    }

    // Commercial comparison
    if (dc['2024'] && dc['2025']) {
      L('--- COMPARATIVO COMERCIAL ---');
      L(`  2024: ${dc['2024'].propostas} propostas, ${dc['2024'].contratos} contratos, ticket R$${(dc['2024'].ticket_medio || 0).toLocaleString('pt-BR')}`);
      L(`  2025: ${dc['2025'].propostas} propostas, ${dc['2025'].contratos} contratos, ticket R$${(dc['2025'].ticket_medio || 0).toLocaleString('pt-BR')}`);
      const evol = dc.evolucao_anual || {};
      if (evol['2024_vs_2025_topo_funil']) L(`  Topo de funil: ${evol['2024_vs_2025_topo_funil']}`);
      L('');
    }

    L('=== FIM DO RESUMO EXECUTIVO ===');
    return lines.join('\n');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOP INSIGHTS — Actionable insights across all 8 engines
  // ═══════════════════════════════════════════════════════════════════════════

  getTopInsights(limit = 5) {
    const insights = [];

    // Revenue forecast insights
    try {
      const forecast = this.forecastRevenue(3);
      const meta = this._safeGet('context').dados_comerciais?.[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa?.meta_vendas_mensal || TBO_CONFIG.business.financial.monthlyTarget;
      const next = forecast.forecast.find(f => !f.realized);
      if (next) {
        const gap = meta - next.predicted;
        if (gap > 0) insights.push({ category: 'receita', priority: gap > meta * 0.5 ? 'critical' : 'warning', title: `Gap de receita em ${next.month}`, detail: (typeof TBO_FINANCE_MASK !== 'undefined' && TBO_FINANCE_MASK.isMasked()) ? 'Previsao R$ •••••• vs meta R$ ••••••' : `Previsao R$${next.predicted.toLocaleString('pt-BR')} vs meta R$${meta.toLocaleString('pt-BR')}`, action: 'Intensificar prospecao e conversao' });
      }
      if (forecast.trend === 'down') insights.push({ category: 'receita', priority: 'critical', title: 'Tendencia de queda na receita', detail: `${forecast.trendPercent}% nos proximos meses`, action: 'Revisar estrategia comercial' });
    } catch (e) { /* skip */ }

    // Deal scoring insights
    try {
      const deals = this._safeGetDeals().filter(d => !['fechado_ganho', 'fechado_perdido'].includes(d.stage));
      const hot = deals.filter(d => this.predictDealScore(d).score >= TBO_CONFIG.business.scoring.dealQuality.hot);
      if (hot.length > 0) insights.push({ category: 'pipeline', priority: 'info', title: `${hot.length} deal(s) com alta probabilidade`, detail: hot.map(d => d.name).join(', '), action: 'Priorizar follow-up e propostas finais' });
      const stale = deals.filter(d => d.updatedAt && this._daysBetween(d.updatedAt) > TBO_CONFIG.business.thresholds.staleDeal.noActivityDays);
      if (stale.length > 0) insights.push({ category: 'pipeline', priority: 'warning', title: `${stale.length} deal(s) estagnado(s)`, detail: stale.map(d => `${d.name} (${this._daysBetween(d.updatedAt)}d)`).join(', '), action: 'Reativar contato ou mover para perdido' });
    } catch (e) { /* skip */ }

    // Churn insights
    try {
      const clientes = (this._safeGet('context').clientes_construtoras || []).slice(0, 15);
      const atRisk = clientes.map(c => { try { return { name: c, churn: this.predictChurn(c) }; } catch (e) { return null; } }).filter(c => c && c.churn.risk >= 60);
      if (atRisk.length > 0) insights.push({ category: 'clientes', priority: 'critical', title: `${atRisk.length} cliente(s) com risco de churn`, detail: atRisk.map(c => `${c.name} (${c.churn.risk}%)`).join(', '), action: 'Reuniao de retencao urgente' });
    } catch (e) { /* skip */ }

    // Seasonal insights
    try {
      const s = this.getSeasonalInsights();
      if (s.opportunityScore >= 70) insights.push({ category: 'mercado', priority: 'info', title: `Alta oportunidade (${s.monthName})`, detail: s.marketOutlook, action: s.recommendedActions[0] || 'Aproveitar janela' });
      else if (s.opportunityScore <= 35) insights.push({ category: 'mercado', priority: 'warning', title: `Baixa oportunidade (${s.monthName})`, detail: s.marketOutlook, action: s.recommendedActions[0] || 'Focar em entregas' });
    } catch (e) { /* skip */ }

    // Meeting productivity insights
    try {
      const arr = (this._safeGet('meetings').meetings || []).slice(0, 10);
      const rois = arr.map(m => { try { return this.calculateMeetingROI(m); } catch (e) { return null; } }).filter(Boolean);
      const bad = rois.filter(r => r.verdict === 'improdutiva');
      if (bad.length >= 3) insights.push({ category: 'produtividade', priority: 'warning', title: `${bad.length} reunioes improdutivas`, detail: `Custo desperdicado: R$${bad.reduce((s, r) => s + r.cost, 0).toLocaleString('pt-BR')}`, action: 'Revisar pauta e necessidade de reunioes' });
    } catch (e) { /* skip */ }

    // Sort by priority and limit
    const priorityOrder = { critical: 0, warning: 1, info: 2 };
    insights.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

    return insights.slice(0, limit);
  }
};
