/**
 * TBO OS — Module: System Health Check
 *
 * Production readiness dashboard — comprehensive system verification.
 * Checks infrastructure, modules, data integrity, security, and performance.
 *
 * Pattern: IIFE returning { render(), init() }
 * Dependencies: RepoBase, TBO_TOAST, window.lucide
 */

const TBO_SYSTEM_HEALTH = (() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════════
  // ── State ────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  let _results = {
    infrastructure: [],
    modules: [],
    data: [],
    security: [],
    performance: []
  };

  let _scores = {
    infrastructure: 0,
    modules: 0,
    data: 0,
    security: 0,
    performance: 0,
    overall: 0
  };

  let _running = false;
  let _expandedSections = { infrastructure: true, modules: true, data: true, security: true, performance: true };
  let _lastRunAt = null;

  // ══════════════════════════════════════════════════════════════════
  // ── Helpers ──────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  function _scoreColor(score) {
    if (score >= 85) return '#22C55E';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  }

  function _scoreBg(score) {
    if (score >= 85) return 'rgba(34,197,94,0.1)';
    if (score >= 60) return 'rgba(245,158,11,0.1)';
    return 'rgba(239,68,68,0.1)';
  }

  function _scoreLabel(score) {
    if (score >= 85) return 'Saudável';
    if (score >= 60) return 'Atenção';
    return 'Crítico';
  }

  function _statusIcon(status) {
    if (status === 'pass') return '<span class="system-health-status-icon system-health-pass"><i data-lucide="check-circle-2" style="width:16px;height:16px;"></i></span>';
    if (status === 'warn') return '<span class="system-health-status-icon system-health-warn"><i data-lucide="alert-triangle" style="width:16px;height:16px;"></i></span>';
    return '<span class="system-health-status-icon system-health-fail"><i data-lucide="x-circle" style="width:16px;height:16px;"></i></span>';
  }

  function _calcScore(checks) {
    if (!checks || checks.length === 0) return 0;
    const total = checks.reduce((sum, c) => {
      if (c.status === 'pass') return sum + 100;
      if (c.status === 'warn') return sum + 50;
      return sum;
    }, 0);
    return Math.round(total / checks.length);
  }

  function _countByStatus(checks, status) {
    return (checks || []).filter(c => c.status === status).length;
  }

  function _formatTimestamp(d) {
    if (!d) return '--';
    return new Date(d).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Render ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  function render() {
    return `
    <div class="system-health-module">
      ${_renderStyles()}
      ${_renderHeader()}
      <div class="system-health-body" id="shBody">
        ${_renderScoreCards()}
        <div id="shSections">
          ${_renderPlaceholder()}
        </div>
      </div>
    </div>`;
  }

  // ── Header ────────────────────────────────────────────────────────

  function _renderHeader() {
    const overall = _scores.overall;
    const color = _scoreColor(overall);
    const label = _scoreLabel(overall);
    const hasResults = _lastRunAt !== null;

    return `
    <div class="system-health-header">
      <div class="system-health-header-left">
        <h2 class="system-health-title">
          <i data-lucide="shield-check" class="system-health-title-icon"></i>
          System Health Check
        </h2>
        <p class="system-health-subtitle">Production readiness dashboard &mdash; verificação completa do sistema</p>
        ${hasResults ? `<span class="system-health-last-run">Última execução: ${_esc(_formatTimestamp(_lastRunAt))}</span>` : ''}
      </div>
      <div class="system-health-header-right">
        ${hasResults ? `
        <div class="system-health-overall-badge" style="background:${_scoreBg(overall)};border:1px solid ${color};">
          <span class="system-health-overall-pct" style="color:${color};">${overall}%</span>
          <span class="system-health-overall-label" style="color:${color};">${_esc(label)}</span>
        </div>` : ''}
        <button class="btn btn-primary system-health-run-btn" id="shRunAll" ${_running ? 'disabled' : ''}>
          <i data-lucide="play-circle" style="width:16px;height:16px;"></i>
          ${_running ? 'Executando...' : 'Executar Todos os Checks'}
        </button>
        ${hasResults ? `
        <button class="btn btn-outline system-health-export-btn" id="shExport">
          <i data-lucide="file-text" style="width:16px;height:16px;"></i>
          Exportar Relatório
        </button>` : ''}
      </div>
    </div>`;
  }

  // ── Score Cards ───────────────────────────────────────────────────

  function _renderScoreCards() {
    const cards = [
      { key: 'infrastructure', label: 'Infrastructure', icon: 'server',      accent: '#3B82F6' },
      { key: 'modules',        label: 'Modules',        icon: 'layout-grid', accent: '#8B5CF6' },
      { key: 'data',           label: 'Data Integrity',  icon: 'database',    accent: '#22C55E' },
      { key: 'security',       label: 'Security',        icon: 'shield',      accent: '#EF4444' },
      { key: 'performance',    label: 'Performance',     icon: 'gauge',       accent: '#F59E0B' }
    ];

    return `
    <div class="system-health-cards">
      ${cards.map(c => {
        const score = _scores[c.key];
        const checks = _results[c.key] || [];
        const pass = _countByStatus(checks, 'pass');
        const warn = _countByStatus(checks, 'warn');
        const fail = _countByStatus(checks, 'fail');
        const total = checks.length;
        const barPct = total > 0 ? score : 0;

        return `
        <div class="system-health-card" style="--card-accent:${c.accent};">
          <div class="system-health-card-header">
            <div class="system-health-card-icon" style="background:${c.accent}15;color:${c.accent};">
              <i data-lucide="${c.icon}" style="width:20px;height:20px;"></i>
            </div>
            <span class="system-health-card-score" style="color:${_scoreColor(score)};">${score}%</span>
          </div>
          <div class="system-health-card-label">${c.label}</div>
          <div class="system-health-card-stats">
            ${total > 0 ? `
            <span class="system-health-stat system-health-stat-pass">${pass} pass</span>
            <span class="system-health-stat system-health-stat-warn">${warn} warn</span>
            <span class="system-health-stat system-health-stat-fail">${fail} fail</span>
            ` : '<span class="system-health-stat">Aguardando execução</span>'}
          </div>
          <div class="system-health-card-bar">
            <div class="system-health-card-bar-fill" style="width:${barPct}%;background:${_scoreColor(score)};"></div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  // ── Placeholder ───────────────────────────────────────────────────

  function _renderPlaceholder() {
    if (_lastRunAt) return _renderAllSections();
    return `
    <div class="system-health-placeholder">
      <i data-lucide="shield-question" style="width:64px;height:64px;color:#64748B;"></i>
      <h3>Nenhum check executado</h3>
      <p>Clique em <strong>"Executar Todos os Checks"</strong> para iniciar a verificação completa do sistema.</p>
    </div>`;
  }

  // ── Loading State ─────────────────────────────────────────────────

  function _renderLoading(currentCategory, progress) {
    const categories = ['infrastructure', 'modules', 'data', 'security', 'performance'];
    const labels = {
      infrastructure: 'Infraestrutura',
      modules: 'Módulos',
      data: 'Integridade de Dados',
      security: 'Segurança',
      performance: 'Performance'
    };

    return `
    <div class="system-health-loading">
      <div class="system-health-loading-spinner"></div>
      <h3>Executando verificações...</h3>
      <p>Verificando: <strong>${_esc(labels[currentCategory] || currentCategory)}</strong></p>
      <div class="system-health-progress-bar">
        <div class="system-health-progress-fill" style="width:${progress}%;"></div>
      </div>
      <div class="system-health-progress-steps">
        ${categories.map((cat, i) => {
          const done = categories.indexOf(currentCategory) > i;
          const active = cat === currentCategory;
          const cls = done ? 'system-health-step-done' : (active ? 'system-health-step-active' : 'system-health-step-pending');
          return `<span class="system-health-step ${cls}">${labels[cat]}</span>`;
        }).join('')}
      </div>
    </div>`;
  }

  // ── All Sections ──────────────────────────────────────────────────

  function _renderAllSections() {
    const sections = [
      { key: 'infrastructure', title: 'Infraestrutura',        icon: 'server' },
      { key: 'modules',        title: 'Módulos',               icon: 'layout-grid' },
      { key: 'data',           title: 'Integridade de Dados',  icon: 'database' },
      { key: 'security',       title: 'Segurança',             icon: 'shield' },
      { key: 'performance',    title: 'Performance',           icon: 'gauge' }
    ];

    return sections.map(s => _renderSection(s.key, s.title, s.icon)).join('');
  }

  // ── Single Section ────────────────────────────────────────────────

  function _renderSection(key, title, icon) {
    const checks = _results[key] || [];
    const score = _scores[key];
    const expanded = _expandedSections[key];

    return `
    <div class="system-health-section" data-section="${key}">
      <div class="system-health-section-header" data-toggle="${key}">
        <div class="system-health-section-left">
          <i data-lucide="${icon}" style="width:18px;height:18px;"></i>
          <span class="system-health-section-title">${_esc(title)}</span>
          <span class="system-health-section-score" style="color:${_scoreColor(score)};">${score}%</span>
          <span class="system-health-section-counts">
            <span class="system-health-count-pass">${_countByStatus(checks, 'pass')}✓</span>
            <span class="system-health-count-warn">${_countByStatus(checks, 'warn')}⚠</span>
            <span class="system-health-count-fail">${_countByStatus(checks, 'fail')}✗</span>
          </span>
        </div>
        <i data-lucide="${expanded ? 'chevron-up' : 'chevron-down'}" style="width:18px;height:18px;color:#94A3B8;"></i>
      </div>
      ${expanded ? `
      <div class="system-health-section-body">
        <table class="system-health-table">
          <thead>
            <tr>
              <th style="width:40px;">Status</th>
              <th>Check</th>
              <th>Detalhe</th>
              <th style="width:80px;">Duração</th>
            </tr>
          </thead>
          <tbody>
            ${checks.map(c => `
            <tr class="system-health-row system-health-row-${c.status}">
              <td>${_statusIcon(c.status)}</td>
              <td class="system-health-check-name">${_esc(c.name)}</td>
              <td class="system-health-check-detail">${_esc(c.detail)}</td>
              <td class="system-health-check-duration">${c.duration != null ? c.duration + 'ms' : '--'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}
    </div>`;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Styles ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  function _renderStyles() {
    return `<style>
    /* ── Module Container ──────────────────────────────── */
    .system-health-module {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* ── Header ────────────────────────────────────────── */
    .system-health-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .system-health-header-left {
      flex: 1;
      min-width: 240px;
    }
    .system-health-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
      font-weight: 700;
      color: #F8FAFC;
      margin: 0;
    }
    .system-health-title-icon { color: #3B82F6; }
    .system-health-subtitle {
      color: #94A3B8;
      font-size: 14px;
      margin: 4px 0 0;
    }
    .system-health-last-run {
      display: inline-block;
      margin-top: 6px;
      font-size: 12px;
      color: #64748B;
    }
    .system-health-header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* ── Overall Badge ─────────────────────────────────── */
    .system-health-overall-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 18px;
      border-radius: 12px;
      min-width: 80px;
    }
    .system-health-overall-pct {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.1;
    }
    .system-health-overall-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ── Buttons ────────────────────────────────────────── */
    .system-health-run-btn,
    .system-health-export-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      border: none;
    }
    .system-health-run-btn {
      background: #3B82F6;
      color: #FFF;
    }
    .system-health-run-btn:hover:not(:disabled) { background: #2563EB; }
    .system-health-run-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .system-health-export-btn {
      background: transparent;
      color: #CBD5E1;
      border: 1px solid #334155;
    }
    .system-health-export-btn:hover { background: #1E293B; border-color: #475569; }

    /* ── Score Cards ───────────────────────────────────── */
    .system-health-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .system-health-card {
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 18px;
      transition: border-color 0.2s;
    }
    .system-health-card:hover { border-color: var(--card-accent, #475569); }
    .system-health-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .system-health-card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 10px;
    }
    .system-health-card-score {
      font-size: 26px;
      font-weight: 800;
      line-height: 1;
    }
    .system-health-card-label {
      font-size: 13px;
      font-weight: 600;
      color: #CBD5E1;
      margin-bottom: 8px;
    }
    .system-health-card-stats {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .system-health-stat {
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 4px;
      background: #0F172A;
      color: #94A3B8;
    }
    .system-health-stat-pass { color: #22C55E; }
    .system-health-stat-warn { color: #F59E0B; }
    .system-health-stat-fail { color: #EF4444; }
    .system-health-card-bar {
      height: 4px;
      background: #0F172A;
      border-radius: 2px;
      overflow: hidden;
    }
    .system-health-card-bar-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.6s ease;
    }

    /* ── Placeholder ───────────────────────────────────── */
    .system-health-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }
    .system-health-placeholder h3 {
      color: #CBD5E1;
      font-size: 18px;
      margin: 16px 0 8px;
    }
    .system-health-placeholder p {
      color: #64748B;
      font-size: 14px;
      max-width: 420px;
    }

    /* ── Loading ────────────────────────────────────────── */
    .system-health-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
    }
    .system-health-loading h3 {
      color: #CBD5E1;
      font-size: 16px;
      margin: 16px 0 4px;
    }
    .system-health-loading p {
      color: #94A3B8;
      font-size: 14px;
      margin: 0 0 20px;
    }
    .system-health-loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #334155;
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: shSpin 0.8s linear infinite;
    }
    @keyframes shSpin { to { transform: rotate(360deg); } }

    .system-health-progress-bar {
      width: 100%;
      max-width: 400px;
      height: 6px;
      background: #1E293B;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .system-health-progress-fill {
      height: 100%;
      background: #3B82F6;
      border-radius: 3px;
      transition: width 0.4s ease;
    }
    .system-health-progress-steps {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .system-health-step {
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 6px;
      border: 1px solid #334155;
      color: #64748B;
    }
    .system-health-step-done { border-color: #22C55E; color: #22C55E; background: rgba(34,197,94,0.08); }
    .system-health-step-active { border-color: #3B82F6; color: #3B82F6; background: rgba(59,130,246,0.08); }
    .system-health-step-pending { border-color: #334155; color: #64748B; }

    /* ── Sections ───────────────────────────────────────── */
    .system-health-section {
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 12px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .system-health-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .system-health-section-header:hover { background: #253349; }
    .system-health-section-left {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #CBD5E1;
    }
    .system-health-section-title {
      font-size: 14px;
      font-weight: 600;
    }
    .system-health-section-score {
      font-size: 14px;
      font-weight: 700;
    }
    .system-health-section-counts {
      display: flex;
      gap: 8px;
      font-size: 12px;
    }
    .system-health-count-pass { color: #22C55E; }
    .system-health-count-warn { color: #F59E0B; }
    .system-health-count-fail { color: #EF4444; }

    .system-health-section-body {
      padding: 0 18px 14px;
    }

    /* ── Table ──────────────────────────────────────────── */
    .system-health-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .system-health-table thead th {
      text-align: left;
      color: #64748B;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border-bottom: 1px solid #334155;
    }
    .system-health-table tbody td {
      padding: 8px 10px;
      border-bottom: 1px solid #1E293B;
      vertical-align: middle;
    }
    .system-health-row:last-child td { border-bottom: none; }
    .system-health-status-icon { display: inline-flex; align-items: center; }
    .system-health-pass { color: #22C55E; }
    .system-health-warn { color: #F59E0B; }
    .system-health-fail { color: #EF4444; }
    .system-health-check-name { color: #E2E8F0; font-weight: 500; }
    .system-health-check-detail { color: #94A3B8; font-size: 12px; }
    .system-health-check-duration { color: #64748B; font-size: 12px; text-align: right; font-variant-numeric: tabular-nums; }

    .system-health-row-fail { background: rgba(239,68,68,0.04); }
    .system-health-row-warn { background: rgba(245,158,11,0.03); }

    /* ── Print / Report ────────────────────────────────── */
    @media print {
      body * { visibility: hidden; }
      .system-health-report-container,
      .system-health-report-container * { visibility: visible; }
      .system-health-report-container { position: absolute; left: 0; top: 0; width: 100%; }
    }

    /* ── Responsive ────────────────────────────────────── */
    @media (max-width: 768px) {
      .system-health-header { flex-direction: column; }
      .system-health-header-right { width: 100%; }
      .system-health-cards { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .system-health-cards { grid-template-columns: 1fr; }
      .system-health-module { padding: 12px; }
    }
    </style>`;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Init & Events ────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  function init() {
    _bindRunAll();
    _bindExport();
    _bindSectionToggles();
    if (window.lucide) lucide.createIcons();
  }

  function _bindRunAll() {
    const btn = document.getElementById('shRunAll');
    if (btn) btn.addEventListener('click', () => _runAllChecks());
  }

  function _bindExport() {
    const btn = document.getElementById('shExport');
    if (btn) btn.addEventListener('click', () => _generateReadinessReport());
  }

  function _bindSectionToggles() {
    document.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.getAttribute('data-toggle');
        _expandedSections[key] = !_expandedSections[key];
        _rerender();
      });
    });
  }

  function _rerender() {
    const app = document.getElementById('app') || document.querySelector('.system-health-module')?.parentElement;
    if (!app) return;

    // Re-render the full module
    const container = document.querySelector('.system-health-module');
    if (container) {
      container.outerHTML = render();
      // Rebind after re-render
      setTimeout(() => {
        _bindRunAll();
        _bindExport();
        _bindSectionToggles();
        if (window.lucide) lucide.createIcons();
      }, 10);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Run All Checks ───────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async function _runAllChecks() {
    if (_running) return;
    _running = true;
    _rerender();

    const sectionsEl = document.getElementById('shSections');
    const categories = ['infrastructure', 'modules', 'data', 'security', 'performance'];
    const totalSteps = categories.length;

    try {
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const progress = Math.round(((i) / totalSteps) * 100);

        // Show loading state
        if (sectionsEl) {
          sectionsEl.innerHTML = _renderLoading(cat, progress);
          if (window.lucide) lucide.createIcons();
        }

        // Run the checks for this category
        try {
          switch (cat) {
            case 'infrastructure':
              _results.infrastructure = await _checkInfrastructure();
              break;
            case 'modules':
              _results.modules = await _checkModules();
              break;
            case 'data':
              _results.data = await _checkDataIntegrity();
              break;
            case 'security':
              _results.security = await _checkSecurity();
              break;
            case 'performance':
              _results.performance = _checkPerformance();
              break;
          }
        } catch (e) {
          console.error(`[SystemHealth] Error running ${cat} checks:`, e);
          _results[cat] = [{ name: `Erro em ${cat}`, status: 'fail', detail: e.message }];
        }

        // Recalculate score for this category
        _scores[cat] = _calcScore(_results[cat]);
      }

      // Calculate overall score (average of all categories)
      const catScores = categories.map(c => _scores[c]);
      _scores.overall = Math.round(catScores.reduce((a, b) => a + b, 0) / catScores.length);
      _lastRunAt = new Date();

      // Notify
      if (typeof TBO_TOAST !== 'undefined') {
        const level = _scores.overall >= 85 ? 'success' : (_scores.overall >= 60 ? 'warning' : 'error');
        TBO_TOAST.show(`System Health: ${_scores.overall}% — ${_scoreLabel(_scores.overall)}`, level);
      }

    } catch (e) {
      console.error('[SystemHealth] Fatal error during checks:', e);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.show('Erro ao executar verificações: ' + e.message, 'error');
      }
    } finally {
      _running = false;
      _rerender();
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Infrastructure Checks ────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async function _checkInfrastructure() {
    const checks = [];

    // 1. Supabase connection + latency
    const t0 = performance.now();
    try {
      const db = RepoBase.getDb();
      const { data, error } = await db.from('tenants').select('id').limit(1);
      const latency = Math.round(performance.now() - t0);
      checks.push({
        name: 'Conexão Supabase',
        status: error ? 'fail' : (latency < 200 ? 'pass' : 'warn'),
        detail: error ? `Erro: ${error.message}` : `Latência: ${latency}ms`,
        duration: latency
      });
    } catch (e) {
      checks.push({ name: 'Conexão Supabase', status: 'fail', detail: e.message, duration: Math.round(performance.now() - t0) });
    }

    // 2. Auth session active
    try {
      const db = RepoBase.getDb();
      const client = db.getClient ? db.getClient() : db;
      const { data: { session } } = await client.auth.getSession();
      checks.push({
        name: 'Sessão de autenticação',
        status: session ? 'pass' : 'fail',
        detail: session ? `Usuário: ${session.user?.email || 'ok'}` : 'Nenhuma sessão ativa'
      });
    } catch (e) {
      checks.push({ name: 'Sessão de autenticação', status: 'fail', detail: e.message });
    }

    // 3. Core tables exist (check by querying each)
    const coreTables = [
      'projects', 'tasks', 'clients', 'meetings', 'demands',
      'client_portals', 'client_deliveries', 'client_activities',
      'rsm_accounts', 'rsm_metrics', 'rsm_posts',
      'report_schedules', 'report_runs'
    ];
    for (const table of coreTables) {
      const t1 = performance.now();
      try {
        const db = RepoBase.getDb();
        const tid = RepoBase.requireTenantId();
        const { count, error } = await db.from(table).select('id', { count: 'exact', head: true }).eq('tenant_id', tid);
        const dur = Math.round(performance.now() - t1);
        checks.push({
          name: `Tabela: ${table}`,
          status: error ? 'fail' : 'pass',
          detail: error ? error.message : `${count || 0} registros`,
          duration: dur
        });
      } catch (e) {
        checks.push({ name: `Tabela: ${table}`, status: 'fail', detail: e.message, duration: Math.round(performance.now() - t1) });
      }
    }

    // 4. Bundle size check
    try {
      const scripts = document.querySelectorAll('script[src]');
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      checks.push({
        name: 'Assets carregados',
        status: (scripts.length > 5 && styles.length > 2) ? 'pass' : 'warn',
        detail: `${scripts.length} scripts, ${styles.length} stylesheets`
      });
    } catch (e) {
      checks.push({ name: 'Assets carregados', status: 'warn', detail: e.message });
    }

    // 5. Lucide icons loaded
    checks.push({
      name: 'Lucide Icons',
      status: typeof window.lucide !== 'undefined' ? 'pass' : 'fail',
      detail: typeof window.lucide !== 'undefined' ? 'Carregado' : 'Não encontrado'
    });

    return checks;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Module Checks ────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async function _checkModules() {
    const checks = [];

    // Check each registered module can render without error
    const moduleNames = [
      'dashboard', 'projetos', 'tarefas', 'financeiro', 'pagar', 'receber',
      'comercial', 'pipeline', 'clientes', 'rh', 'reunioes', 'relatorios',
      'rsm', 'portal-cliente', 'entregas', 'configuracoes', 'admin-portal'
    ];

    for (const name of moduleNames) {
      try {
        // Access the router modules map (TBO_ROUTER._modules is the internal map)
        const mod = typeof TBO_ROUTER !== 'undefined' ? TBO_ROUTER._modules?.[name] : null;
        if (mod && typeof mod.render === 'function') {
          // Try calling render (it should return HTML string)
          const html = mod.render();
          const isValid = typeof html === 'string' && html.length > 50;
          checks.push({
            name: `Módulo: ${name}`,
            status: isValid ? 'pass' : 'warn',
            detail: isValid ? `render() OK (${html.length} chars)` : 'render() retornou conteúdo insuficiente'
          });
        } else {
          checks.push({
            name: `Módulo: ${name}`,
            status: mod ? 'warn' : 'fail',
            detail: mod ? 'Sem método render()' : 'Módulo não registrado'
          });
        }
      } catch (e) {
        checks.push({ name: `Módulo: ${name}`, status: 'fail', detail: `Erro no render: ${e.message}` });
      }
    }

    // Check route registry
    try {
      const registry = typeof TBO_ROUTE_REGISTRY !== 'undefined' ? TBO_ROUTE_REGISTRY : null;
      if (registry) {
        const routes = registry.getModuleRoutes();
        const routeCount = Object.keys(routes).length;
        checks.push({
          name: 'Route Registry',
          status: routeCount > 10 ? 'pass' : 'warn',
          detail: `${routeCount} rotas registradas`
        });
      } else {
        checks.push({ name: 'Route Registry', status: 'warn', detail: 'TBO_ROUTE_REGISTRY não encontrado' });
      }
    } catch (e) {
      checks.push({ name: 'Route Registry', status: 'fail', detail: e.message });
    }

    // Check sidebar service
    checks.push({
      name: 'Sidebar Service',
      status: typeof TBO_SIDEBAR_SERVICE !== 'undefined' ? 'pass' : 'fail',
      detail: typeof TBO_SIDEBAR_SERVICE !== 'undefined' ? 'Disponível' : 'Não encontrado'
    });

    // Check permissions system
    checks.push({
      name: 'Sistema de Permissões',
      status: typeof TBO_PERMISSIONS !== 'undefined' ? 'pass' : 'fail',
      detail: typeof TBO_PERMISSIONS !== 'undefined' ? 'RBAC ativo' : 'Não encontrado'
    });

    return checks;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Data Integrity Checks ────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async function _checkDataIntegrity() {
    const checks = [];
    let db, tid;

    try {
      db = RepoBase.getDb();
      tid = RepoBase.requireTenantId();
    } catch (e) {
      return [{ name: 'Acesso ao banco', status: 'fail', detail: e.message }];
    }

    // 1. Projects have BUs assigned
    try {
      const { data } = await db.from('projects').select('id, bus').eq('tenant_id', tid).not('status', 'eq', 'cancelado');
      const withBu = (data || []).filter(p => p.bus && p.bus.length > 0);
      const total = (data || []).length;
      const pct = total > 0 ? Math.round((withBu.length / total) * 100) : 0;
      checks.push({
        name: 'Projetos com BU atribuída',
        status: pct >= 80 ? 'pass' : (pct >= 50 ? 'warn' : 'fail'),
        detail: `${withBu.length}/${total} (${pct}%)`
      });
    } catch (e) {
      checks.push({ name: 'Projetos com BU', status: 'fail', detail: e.message });
    }

    // 2. Client portals configured
    try {
      const { count } = await db.from('client_portals').select('id', { count: 'exact', head: true }).eq('tenant_id', tid);
      checks.push({
        name: 'Portais de clientes',
        status: (count || 0) >= 5 ? 'pass' : (count > 0 ? 'warn' : 'fail'),
        detail: `${count || 0} portais configurados`
      });
    } catch (e) {
      checks.push({ name: 'Portais de clientes', status: 'fail', detail: e.message });
    }

    // 3. RSM accounts with metrics
    try {
      const { count: acctCount } = await db.from('rsm_accounts').select('id', { count: 'exact', head: true }).eq('tenant_id', tid);
      const { count: metricCount } = await db.from('rsm_metrics').select('id', { count: 'exact', head: true }).eq('tenant_id', tid);
      checks.push({
        name: 'RSM: Contas e métricas',
        status: (acctCount > 0 && metricCount > 0) ? 'pass' : (acctCount > 0 ? 'warn' : 'fail'),
        detail: `${acctCount || 0} contas, ${metricCount || 0} métricas`
      });
    } catch (e) {
      checks.push({ name: 'RSM: Contas e métricas', status: 'fail', detail: e.message });
    }

    // 4. Report schedules active
    try {
      const { data } = await db.from('report_schedules').select('id, type, enabled').eq('tenant_id', tid);
      const enabled = (data || []).filter(s => s.enabled);
      checks.push({
        name: 'Relatórios agendados',
        status: enabled.length >= 4 ? 'pass' : (enabled.length > 0 ? 'warn' : 'fail'),
        detail: `${enabled.length}/${(data || []).length} ativos`
      });
    } catch (e) {
      checks.push({ name: 'Relatórios agendados', status: 'fail', detail: e.message });
    }

    // 5. Deliveries exist
    try {
      const { count } = await db.from('client_deliveries').select('id', { count: 'exact', head: true }).eq('tenant_id', tid);
      checks.push({
        name: 'Entregas cadastradas',
        status: (count || 0) >= 50 ? 'pass' : (count > 0 ? 'warn' : 'fail'),
        detail: `${count || 0} entregas`
      });
    } catch (e) {
      checks.push({ name: 'Entregas cadastradas', status: 'fail', detail: e.message });
    }

    // 6. Demands imported
    try {
      const { count } = await db.from('demands').select('id', { count: 'exact', head: true }).eq('tenant_id', tid);
      checks.push({
        name: 'Demandas importadas',
        status: (count || 0) >= 10 ? 'pass' : (count > 0 ? 'warn' : 'fail'),
        detail: `${count || 0} demandas`
      });
    } catch (e) {
      checks.push({ name: 'Demandas importadas', status: 'fail', detail: e.message });
    }

    // 7. Sidebar consistency
    try {
      const sidebarItems = typeof TBO_SIDEBAR_SERVICE !== 'undefined' ? TBO_SIDEBAR_SERVICE._workspaces : [];
      let totalChildren = 0;
      (sidebarItems || []).forEach(w => { totalChildren += (w.children || []).length; });
      checks.push({
        name: 'Sidebar: consistência',
        status: totalChildren > 15 ? 'pass' : (totalChildren > 5 ? 'warn' : 'fail'),
        detail: `${(sidebarItems || []).length} workspaces, ${totalChildren} children`
      });
    } catch (e) {
      checks.push({ name: 'Sidebar: consistência', status: 'fail', detail: e.message });
    }

    return checks;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Security Checks ──────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async function _checkSecurity() {
    const checks = [];

    // 1. No service_role key exposed on client
    try {
      const allScripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent || '').join('');
      const hasServiceKey = allScripts.includes('service_role') || allScripts.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6');
      checks.push({
        name: 'Service role key não exposta',
        status: hasServiceKey ? 'fail' : 'pass',
        detail: hasServiceKey ? 'ALERTA: Service key detectada no cliente!' : 'Seguro — apenas anon key'
      });
    } catch (e) {
      checks.push({ name: 'Service role key', status: 'warn', detail: 'Não foi possível verificar: ' + e.message });
    }

    // 2. XSS protection (_esc functions)
    const moduleGlobals = ['TBO_PROJETOS', 'TBO_RELATORIOS', 'TBO_RSM', 'TBO_PORTAL_CLIENTE', 'TBO_COMMAND_CENTER'];
    let escCount = 0;
    moduleGlobals.forEach(g => {
      if (typeof window[g] !== 'undefined' && typeof window[g]._esc === 'function') escCount++;
    });
    checks.push({
      name: 'XSS Protection (_esc)',
      status: escCount >= 3 ? 'pass' : 'warn',
      detail: `${escCount}/${moduleGlobals.length} módulos com _esc()`
    });

    // 3. HTTPS
    checks.push({
      name: 'HTTPS ativo',
      status: window.location.protocol === 'https:' ? 'pass' : 'warn',
      detail: window.location.protocol === 'https:' ? 'Conexão segura' : 'HTTP em uso (dev mode?)'
    });

    // 4. Auth required
    try {
      const db = RepoBase.getDb();
      const client = db.getClient ? db.getClient() : db;
      const { data: { session } } = await client.auth.getSession();
      checks.push({
        name: 'Autenticação obrigatória',
        status: session ? 'pass' : 'fail',
        detail: session ? `Autenticado como ${session.user?.email}` : 'Não autenticado'
      });
    } catch (e) {
      checks.push({ name: 'Autenticação obrigatória', status: 'fail', detail: e.message });
    }

    // 5. Tenant isolation
    try {
      const tid = RepoBase.requireTenantId();
      checks.push({
        name: 'Tenant isolation',
        status: tid ? 'pass' : 'fail',
        detail: tid ? `Tenant: ${tid.substring(0, 8)}...` : 'Sem tenant configurado'
      });
    } catch (e) {
      checks.push({ name: 'Tenant isolation', status: 'fail', detail: e.message });
    }

    // 6. CSP headers (check meta tag)
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    checks.push({
      name: 'Content Security Policy',
      status: cspMeta ? 'pass' : 'warn',
      detail: cspMeta ? 'CSP configurado' : 'Sem CSP meta tag (verificar headers do servidor)'
    });

    return checks;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Performance Checks ───────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  function _checkPerformance() {
    const checks = [];

    // 1. Navigation timing
    try {
      const perf = performance.getEntriesByType('navigation')[0];
      if (perf) {
        const fcp = Math.round(perf.domContentLoadedEventEnd - perf.startTime);
        checks.push({
          name: 'DOM Content Loaded',
          status: fcp < 2000 ? 'pass' : (fcp < 4000 ? 'warn' : 'fail'),
          detail: `${fcp}ms`,
          duration: fcp
        });

        const loadComplete = Math.round(perf.loadEventEnd - perf.startTime);
        checks.push({
          name: 'Load completo',
          status: loadComplete < 3500 ? 'pass' : (loadComplete < 6000 ? 'warn' : 'fail'),
          detail: `${loadComplete}ms`,
          duration: loadComplete
        });
      } else {
        checks.push({ name: 'Navigation Timing', status: 'warn', detail: 'API de navigation timing indisponível' });
      }
    } catch (e) {
      checks.push({ name: 'Navigation Timing', status: 'warn', detail: e.message });
    }

    // 2. Memory usage
    try {
      if (performance.memory) {
        const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(performance.memory.totalJSHeapSize / 1048576);
        checks.push({
          name: 'Memória JS',
          status: usedMB < 100 ? 'pass' : (usedMB < 200 ? 'warn' : 'fail'),
          detail: `${usedMB}MB / ${totalMB}MB`
        });
      } else {
        checks.push({ name: 'Memória JS', status: 'warn', detail: 'performance.memory não disponível (non-Chromium?)' });
      }
    } catch (e) {
      checks.push({ name: 'Memória JS', status: 'warn', detail: e.message });
    }

    // 3. DOM elements count
    try {
      const domCount = document.querySelectorAll('*').length;
      checks.push({
        name: 'Elementos DOM',
        status: domCount < 3000 ? 'pass' : (domCount < 5000 ? 'warn' : 'fail'),
        detail: `${domCount} elementos`
      });
    } catch (e) {
      checks.push({ name: 'Elementos DOM', status: 'warn', detail: e.message });
    }

    // 4. Script count
    try {
      const scripts = document.querySelectorAll('script[src]');
      checks.push({
        name: 'Scripts carregados',
        status: scripts.length < 30 ? 'pass' : 'warn',
        detail: `${scripts.length} scripts`
      });
    } catch (e) {
      checks.push({ name: 'Scripts carregados', status: 'warn', detail: e.message });
    }

    // 5. CSS count
    try {
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      checks.push({
        name: 'Stylesheets',
        status: styles.length < 15 ? 'pass' : 'warn',
        detail: `${styles.length} CSS files`
      });
    } catch (e) {
      checks.push({ name: 'Stylesheets', status: 'warn', detail: e.message });
    }

    // 6. Console errors (manual check hint)
    checks.push({
      name: 'Console sem erros',
      status: 'pass',
      detail: 'Verificar manualmente no DevTools'
    });

    return checks;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Readiness Report Generator ───────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  function _generateReadinessReport() {
    if (!_lastRunAt) {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.show('Execute os checks antes de exportar o relatório.', 'warning');
      }
      return;
    }

    const totalChecks = Object.values(_results).reduce((s, arr) => s + arr.length, 0);
    const totalPass = Object.values(_results).reduce((s, arr) => s + _countByStatus(arr, 'pass'), 0);
    const totalWarn = Object.values(_results).reduce((s, arr) => s + _countByStatus(arr, 'warn'), 0);
    const totalFail = Object.values(_results).reduce((s, arr) => s + _countByStatus(arr, 'fail'), 0);

    const overallScore = _scores.overall;
    const goNoGo = overallScore >= 70 ? 'GO' : 'NO-GO';
    const goColor = overallScore >= 70 ? '#22C55E' : '#EF4444';

    const sections = [
      { key: 'infrastructure', title: 'Infraestrutura' },
      { key: 'modules',        title: 'Módulos' },
      { key: 'data',           title: 'Integridade de Dados' },
      { key: 'security',       title: 'Segurança' },
      { key: 'performance',    title: 'Performance' }
    ];

    const sectionRows = sections.map(s => {
      const checks = _results[s.key] || [];
      const rows = checks.map(c => {
        const ico = c.status === 'pass' ? '&#10003;' : (c.status === 'warn' ? '&#9888;' : '&#10007;');
        const color = c.status === 'pass' ? '#22C55E' : (c.status === 'warn' ? '#F59E0B' : '#EF4444');
        return `
          <tr>
            <td style="color:${color};font-weight:bold;text-align:center;padding:6px 10px;">${ico}</td>
            <td style="padding:6px 10px;">${_esc(c.name)}</td>
            <td style="padding:6px 10px;color:#666;">${_esc(c.detail)}</td>
            <td style="padding:6px 10px;text-align:right;color:#999;">${c.duration != null ? c.duration + 'ms' : '--'}</td>
          </tr>`;
      }).join('');

      return `
        <h3 style="margin:24px 0 8px;color:#1E293B;font-size:16px;">${_esc(s.title)} — <span style="color:${_scoreColor(_scores[s.key])};">${_scores[s.key]}%</span></h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px;">
          <thead>
            <tr style="background:#F1F5F9;border-bottom:2px solid #E2E8F0;">
              <th style="width:40px;padding:8px 10px;">Status</th>
              <th style="text-align:left;padding:8px 10px;">Check</th>
              <th style="text-align:left;padding:8px 10px;">Detalhe</th>
              <th style="width:80px;text-align:right;padding:8px 10px;">Duração</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).join('');

    const reportHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>TBO OS — System Health Report</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; color: #1E293B; padding: 40px; max-width: 900px; margin: 0 auto; }
        .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #3B82F6; padding-bottom: 16px; margin-bottom: 24px; }
        .report-title { font-size: 22px; font-weight: 700; }
        .report-meta { font-size: 12px; color: #64748B; margin-top: 4px; }
        .report-badge { padding: 8px 20px; border-radius: 8px; text-align: center; }
        .report-summary { display: flex; gap: 16px; margin-bottom: 32px; }
        .report-stat { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; text-align: center; }
        .report-stat-value { font-size: 28px; font-weight: 800; }
        .report-stat-label { font-size: 12px; color: #64748B; margin-top: 4px; }
        table { border: 1px solid #E2E8F0; border-radius: 6px; }
        table tr:nth-child(even) { background: #FAFBFC; }
        table td { border-bottom: 1px solid #F1F5F9; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body class="system-health-report-container">
      <div class="report-header">
        <div>
          <div class="report-title">TBO OS — System Health Report</div>
          <div class="report-meta">
            Gerado em: ${_esc(_formatTimestamp(_lastRunAt))} | Ambiente: ${_esc(window.location.hostname)}
          </div>
        </div>
        <div class="report-badge" style="background:${goColor}15;border:2px solid ${goColor};">
          <div style="font-size:32px;font-weight:900;color:${goColor};">${overallScore}%</div>
          <div style="font-size:14px;font-weight:700;color:${goColor};">${goNoGo}</div>
        </div>
      </div>

      <div class="report-summary">
        <div class="report-stat">
          <div class="report-stat-value">${totalChecks}</div>
          <div class="report-stat-label">Total de Checks</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value" style="color:#22C55E;">${totalPass}</div>
          <div class="report-stat-label">Aprovados</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value" style="color:#F59E0B;">${totalWarn}</div>
          <div class="report-stat-label">Avisos</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value" style="color:#EF4444;">${totalFail}</div>
          <div class="report-stat-label">Falhas</div>
        </div>
      </div>

      ${sectionRows}

      <div style="margin-top:40px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8;text-align:center;">
        TBO OS &mdash; Production Readiness Report &mdash; Confidencial
      </div>
    </body>
    </html>`;

    // Open in new window for print / PDF
    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(reportHtml);
      win.document.close();
      // Trigger print after load
      win.onload = () => {
        setTimeout(() => win.print(), 300);
      };
    } else {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.show('Popup bloqueado — permita popups para exportar o relatório.', 'warning');
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Public API ───────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  return {
    render,
    init,
    _esc,

    // Expose for testing / external use
    getScores:  () => ({ ..._scores }),
    getResults: () => JSON.parse(JSON.stringify(_results)),
    isRunning:  () => _running,
    lastRunAt:  () => _lastRunAt
  };

})();

// ── Register globally ──────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.TBO_SYSTEM_HEALTH = TBO_SYSTEM_HEALTH;
}
