// ============================================================================
// TBO OS — Integrations Enhancements Module
// Google Drive Browser, WhatsApp Business, Notion Sync, Google Calendar,
// Slack Webhook Notifications
// ============================================================================

const TBO_INTEGRATIONS = {

  _stylesInjected: false,

  // =========================================================================
  // HELPERS
  // =========================================================================

  _ts(date) {
    if (!date) return '--';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'agora';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
    if (diff < 172800000) return 'ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  },

  _fullDate(date) {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  _uid() {
    return 'int_' + Math.random().toString(36).slice(2, 10);
  },

  _el(id) {
    return document.getElementById(id);
  },

  // =========================================================================
  // STYLE INJECTION
  // =========================================================================

  _injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;
    const style = document.createElement('style');
    style.id = 'tbo-integrations-styles';
    style.textContent = `
      /* Hub Cards */
      .int-hub { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; padding: 16px 0; }
      .int-hub-card { background: var(--bg-card, #1e1e2e); border: 1px solid var(--border-color, #2e2e3e); border-radius: 12px; padding: 20px; cursor: pointer; transition: all .2s; }
      .int-hub-card:hover { border-color: var(--accent, #E85102); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(232,81,2,.15); }
      .int-hub-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 12px; }
      .int-hub-card h3 { margin: 0 0 6px; font-size: 15px; color: var(--text-primary, #e0e0e0); }
      .int-hub-card p { margin: 0; font-size: 12px; color: var(--text-muted, #888); line-height: 1.4; }
      .int-hub-card .int-status { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; margin-top: 10px; }
      .int-status-active { background: rgba(34,197,94,.15); color: #22c55e; }
      .int-status-config { background: rgba(251,191,36,.15); color: #fbbf24; }

      /* Shared Panel */
      .int-panel { background: var(--bg-card, #1e1e2e); border: 1px solid var(--border-color, #2e2e3e); border-radius: 12px; overflow: hidden; }
      .int-panel-header { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-bottom: 1px solid var(--border-color, #2e2e3e); }
      .int-panel-header h3 { margin: 0; font-size: 15px; color: var(--text-primary, #e0e0e0); flex: 1; }
      .int-panel-body { padding: 16px 18px; }
      .int-btn { background: var(--accent, #E85102); color: #fff; border: none; padding: 7px 16px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; transition: opacity .2s; }
      .int-btn:hover { opacity: .85; }
      .int-btn-sm { padding: 4px 10px; font-size: 11px; }
      .int-btn-ghost { background: transparent; border: 1px solid var(--border-color, #2e2e3e); color: var(--text-primary, #e0e0e0); }
      .int-btn-ghost:hover { border-color: var(--accent, #E85102); color: var(--accent, #E85102); }
      .int-input { background: rgba(255,255,255,.05); border: 1px solid var(--border-color, #2e2e3e); border-radius: 6px; padding: 7px 12px; font-size: 12px; color: var(--text-primary, #e0e0e0); width: 100%; outline: none; box-sizing: border-box; }
      .int-input:focus { border-color: var(--accent, #E85102); }
      .int-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; border-radius: 9px; font-size: 10px; font-weight: 700; padding: 0 5px; }

      /* Drive Browser */
      .drive-breadcrumb { display: flex; align-items: center; gap: 4px; padding: 10px 18px; font-size: 12px; color: var(--text-muted, #888); border-bottom: 1px solid var(--border-color, #2e2e3e); flex-wrap: wrap; }
      .drive-breadcrumb span { cursor: pointer; transition: color .15s; }
      .drive-breadcrumb span:hover { color: var(--accent, #E85102); }
      .drive-breadcrumb .drive-bc-sep { color: var(--text-muted, #888); cursor: default; opacity: .5; }
      .drive-search-bar { padding: 10px 18px; border-bottom: 1px solid var(--border-color, #2e2e3e); }
      .drive-table { width: 100%; border-collapse: collapse; }
      .drive-table th { text-align: left; padding: 8px 14px; font-size: 11px; color: var(--text-muted, #888); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid var(--border-color, #2e2e3e); }
      .drive-table td { padding: 9px 14px; font-size: 13px; color: var(--text-primary, #e0e0e0); border-bottom: 1px solid rgba(255,255,255,.03); }
      .drive-table tr { cursor: pointer; transition: background .15s; }
      .drive-table tbody tr:hover { background: rgba(232,81,2,.06); }
      .drive-file-icon { display: inline-flex; align-items: center; gap: 8px; }
      .drive-file-icon .fi { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
      .fi-folder { background: rgba(251,191,36,.15); color: #fbbf24; }
      .fi-doc { background: rgba(59,130,246,.15); color: #3b82f6; }
      .fi-sheet { background: rgba(34,197,94,.15); color: #22c55e; }
      .fi-slide { background: rgba(249,115,22,.15); color: #f97316; }
      .fi-pdf { background: rgba(239,68,68,.15); color: #ef4444; }
      .fi-image { background: rgba(168,85,247,.15); color: #a855f7; }
      .fi-other { background: rgba(148,163,184,.15); color: #94a3b8; }

      /* WhatsApp Panel */
      .wa-layout { display: flex; height: 480px; }
      .wa-sidebar { width: 260px; border-right: 1px solid var(--border-color, #2e2e3e); overflow-y: auto; flex-shrink: 0; }
      .wa-chat-area { flex: 1; display: flex; flex-direction: column; }
      .wa-conv { display: flex; align-items: center; gap: 10px; padding: 12px 14px; cursor: pointer; transition: background .15s; border-bottom: 1px solid rgba(255,255,255,.03); }
      .wa-conv:hover, .wa-conv.active { background: rgba(232,81,2,.08); }
      .wa-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
      .wa-conv-info { flex: 1; min-width: 0; }
      .wa-conv-name { font-size: 13px; font-weight: 600; color: var(--text-primary, #e0e0e0); display: flex; justify-content: space-between; }
      .wa-conv-preview { font-size: 11px; color: var(--text-muted, #888); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
      .wa-conv-time { font-size: 10px; color: var(--text-muted, #888); }
      .wa-unread { background: #25d366; color: #fff; }
      .wa-messages { flex: 1; overflow-y: auto; padding: 14px 18px; display: flex; flex-direction: column; gap: 6px; }
      .wa-msg { max-width: 75%; padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.4; position: relative; }
      .wa-msg-in { background: rgba(255,255,255,.07); color: var(--text-primary, #e0e0e0); align-self: flex-start; border-bottom-left-radius: 2px; }
      .wa-msg-out { background: rgba(37,211,102,.15); color: var(--text-primary, #e0e0e0); align-self: flex-end; border-bottom-right-radius: 2px; }
      .wa-msg-time { font-size: 9px; color: var(--text-muted, #888); text-align: right; margin-top: 3px; }
      .wa-msg-status { font-size: 10px; margin-left: 4px; }
      .wa-compose { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--border-color, #2e2e3e); }
      .wa-compose input { flex: 1; }
      .wa-templates { display: flex; gap: 6px; padding: 6px 14px; border-top: 1px solid var(--border-color, #2e2e3e); flex-wrap: wrap; }
      .wa-tpl-btn { font-size: 10px; padding: 3px 8px; border-radius: 12px; border: 1px solid var(--border-color, #2e2e3e); background: none; color: var(--text-muted, #888); cursor: pointer; transition: all .15s; }
      .wa-tpl-btn:hover { border-color: #25d366; color: #25d366; }
      .wa-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted, #888); font-size: 13px; }

      /* Notion Sync */
      .ns-items { display: flex; flex-direction: column; gap: 10px; }
      .ns-item { background: rgba(255,255,255,.03); border: 1px solid var(--border-color, #2e2e3e); border-radius: 8px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; }
      .ns-item-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
      .ns-item-info { flex: 1; }
      .ns-item-name { font-size: 13px; font-weight: 600; color: var(--text-primary, #e0e0e0); }
      .ns-item-meta { font-size: 11px; color: var(--text-muted, #888); margin-top: 2px; display: flex; gap: 12px; flex-wrap: wrap; }
      .ns-dir { font-size: 16px; }
      .ns-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
      .ns-synced { background: #22c55e; }
      .ns-pending { background: #fbbf24; }
      .ns-error { background: #ef4444; }
      .ns-log { max-height: 200px; overflow-y: auto; margin-top: 14px; border: 1px solid var(--border-color, #2e2e3e); border-radius: 8px; }
      .ns-log-item { padding: 8px 14px; font-size: 11px; color: var(--text-muted, #888); border-bottom: 1px solid rgba(255,255,255,.03); display: flex; gap: 10px; }
      .ns-log-item:last-child { border-bottom: none; }
      .ns-log-time { color: var(--text-muted, #888); flex-shrink: 0; width: 110px; }
      .ns-log-msg { flex: 1; color: var(--text-primary, #e0e0e0); }

      /* Calendar */
      .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
      .cal-header-cell { text-align: center; font-size: 10px; color: var(--text-muted, #888); padding: 6px 0; font-weight: 600; text-transform: uppercase; }
      .cal-cell { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; border-radius: 6px; cursor: pointer; transition: all .15s; color: var(--text-primary, #e0e0e0); position: relative; }
      .cal-cell:hover { background: rgba(232,81,2,.1); }
      .cal-cell.today { background: rgba(232,81,2,.15); font-weight: 700; }
      .cal-cell.selected { background: var(--accent, #E85102); color: #fff; }
      .cal-cell.other-month { opacity: .3; }
      .cal-dots { display: flex; gap: 2px; margin-top: 2px; }
      .cal-dot { width: 4px; height: 4px; border-radius: 50%; }
      .cal-dot-meeting { background: #3b82f6; }
      .cal-dot-deadline { background: #ef4444; }
      .cal-dot-review { background: #f97316; }
      .cal-dot-presentation { background: #22c55e; }
      .cal-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; }
      .cal-nav-title { font-size: 14px; font-weight: 600; color: var(--text-primary, #e0e0e0); }
      .cal-nav-btn { background: none; border: none; color: var(--text-muted, #888); cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 4px; }
      .cal-nav-btn:hover { color: var(--accent, #E85102); background: rgba(232,81,2,.08); }
      .cal-events { margin-top: 14px; }
      .cal-event { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; background: rgba(255,255,255,.03); border-left: 3px solid transparent; font-size: 12px; }
      .cal-event-meeting { border-left-color: #3b82f6; }
      .cal-event-deadline { border-left-color: #ef4444; }
      .cal-event-review { border-left-color: #f97316; }
      .cal-event-presentation { border-left-color: #22c55e; }
      .cal-event-time { color: var(--text-muted, #888); width: 42px; flex-shrink: 0; }
      .cal-event-title { color: var(--text-primary, #e0e0e0); flex: 1; }
      .cal-add-form { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; padding: 12px; border: 1px solid var(--border-color, #2e2e3e); border-radius: 8px; }
      .cal-form-row { display: flex; gap: 8px; }
      .cal-form-row > * { flex: 1; }

      /* Slack Config */
      .sl-channels { display: flex; flex-direction: column; gap: 10px; }
      .sl-channel { background: rgba(255,255,255,.03); border: 1px solid var(--border-color, #2e2e3e); border-radius: 8px; padding: 14px; }
      .sl-channel-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .sl-channel-name { font-size: 14px; font-weight: 600; color: var(--text-primary, #e0e0e0); flex: 1; }
      .sl-toggle { width: 36px; height: 20px; border-radius: 10px; background: rgba(255,255,255,.1); position: relative; cursor: pointer; transition: background .2s; flex-shrink: 0; }
      .sl-toggle.active { background: #22c55e; }
      .sl-toggle::after { content: ''; position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: transform .2s; }
      .sl-toggle.active::after { transform: translateX(16px); }
      .sl-channel-desc { font-size: 11px; color: var(--text-muted, #888); margin-bottom: 8px; }
      .sl-webhook-row { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
      .sl-webhook-row input { flex: 1; }
      .sl-last-sent { font-size: 10px; color: var(--text-muted, #888); }
      .sl-log { max-height: 220px; overflow-y: auto; margin-top: 14px; }
      .sl-log-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.03); font-size: 12px; }
      .sl-log-item:last-child { border-bottom: none; }
      .sl-log-channel { color: var(--accent, #E85102); font-weight: 600; flex-shrink: 0; min-width: 90px; }
      .sl-log-msg { color: var(--text-primary, #e0e0e0); flex: 1; }
      .sl-log-time { color: var(--text-muted, #888); flex-shrink: 0; font-size: 11px; }
    `;
    document.head.appendChild(style);
  },

  // =========================================================================
  // DEMO DATA
  // =========================================================================

  _driveData: {
    root: { id: 'root', name: 'TBO Arquitetura', parent: null, type: 'folder' },
    folders: [
      { id: 'f1', name: 'Projetos', parent: 'root', type: 'folder' },
      { id: 'f2', name: 'Contratos', parent: 'root', type: 'folder' },
      { id: 'f3', name: 'Templates', parent: 'root', type: 'folder' },
      { id: 'f4', name: 'Entregas', parent: 'root', type: 'folder' },
      { id: 'f1a', name: 'Arthaus - Fachada Digital', parent: 'f1', type: 'folder' },
      { id: 'f1b', name: 'Fontanive - Interior 3D', parent: 'f1', type: 'folder' },
      { id: 'f1c', name: 'GRP - Masterplan', parent: 'f1', type: 'folder' },
      { id: 'f1d', name: 'MDI Brasil - Tour Virtual', parent: 'f1', type: 'folder' },
      { id: 'f4a', name: 'Arthaus - Final', parent: 'f4', type: 'folder' },
      { id: 'f4b', name: 'Tekton - Entrega Parcial', parent: 'f4', type: 'folder' }
    ],
    files: [
      { id: 'd1', name: 'Briefing Arthaus.docx', parent: 'f1a', type: 'doc', size: '245 KB', modified: '2026-02-14T10:30:00' },
      { id: 'd2', name: 'Referências Visuais.pptx', parent: 'f1a', type: 'slide', size: '12.4 MB', modified: '2026-02-12T15:00:00' },
      { id: 'd3', name: 'Planta Baixa.pdf', parent: 'f1a', type: 'pdf', size: '3.8 MB', modified: '2026-02-10T09:00:00' },
      { id: 'd4', name: 'Render Fachada_v3.png', parent: 'f1a', type: 'image', size: '18.7 MB', modified: '2026-02-15T17:45:00' },
      { id: 'd5', name: 'Cronograma Fontanive.xlsx', parent: 'f1b', type: 'sheet', size: '87 KB', modified: '2026-02-13T11:20:00' },
      { id: 'd6', name: 'Moodboard Interior.pptx', parent: 'f1b', type: 'slide', size: '8.3 MB', modified: '2026-02-11T14:30:00' },
      { id: 'd7', name: 'Masterplan_GRP_v2.pdf', parent: 'f1c', type: 'pdf', size: '15.2 MB', modified: '2026-02-09T16:00:00' },
      { id: 'd8', name: 'Implantacao_GRP.png', parent: 'f1c', type: 'image', size: '22.1 MB', modified: '2026-02-08T10:00:00' },
      { id: 'd9', name: 'Roteiro Tour MDI.docx', parent: 'f1d', type: 'doc', size: '156 KB', modified: '2026-02-14T09:15:00' },
      { id: 'd10', name: 'Contrato Arthaus 2026.pdf', parent: 'f2', type: 'pdf', size: '420 KB', modified: '2026-01-15T10:00:00' },
      { id: 'd11', name: 'Contrato Fontanive.pdf', parent: 'f2', type: 'pdf', size: '380 KB', modified: '2026-01-20T11:30:00' },
      { id: 'd12', name: 'Contrato GRP Masterplan.pdf', parent: 'f2', type: 'pdf', size: '512 KB', modified: '2026-02-01T08:00:00' },
      { id: 'd13', name: 'Contrato Tekton.pdf', parent: 'f2', type: 'pdf', size: '390 KB', modified: '2025-12-10T14:00:00' },
      { id: 'd14', name: 'Template Proposta.docx', parent: 'f3', type: 'doc', size: '95 KB', modified: '2025-11-05T09:00:00' },
      { id: 'd15', name: 'Template Briefing.docx', parent: 'f3', type: 'doc', size: '78 KB', modified: '2025-11-05T09:30:00' },
      { id: 'd16', name: 'Template Contrato.docx', parent: 'f3', type: 'doc', size: '102 KB', modified: '2025-10-20T10:00:00' },
      { id: 'd17', name: 'Checklist Entrega.xlsx', parent: 'f3', type: 'sheet', size: '45 KB', modified: '2025-11-12T16:00:00' },
      { id: 'd18', name: 'Apresentacao Comercial TBO.pptx', parent: 'f3', type: 'slide', size: '5.6 MB', modified: '2025-12-01T13:00:00' },
      { id: 'd19', name: 'Fachada_Final_01.png', parent: 'f4a', type: 'image', size: '24.5 MB', modified: '2026-02-15T18:00:00' },
      { id: 'd20', name: 'Fachada_Final_02.png', parent: 'f4a', type: 'image', size: '21.8 MB', modified: '2026-02-15T18:10:00' },
      { id: 'd21', name: 'Perspectiva Tekton_draft.png', parent: 'f4b', type: 'image', size: '19.3 MB', modified: '2026-02-13T12:00:00' },
      { id: 'd22', name: 'Relatorio Entregas.xlsx', parent: 'f4', type: 'sheet', size: '134 KB', modified: '2026-02-14T16:30:00' }
    ]
  },

  _waData: {
    conversations: [
      { id: 'c1', name: 'Arthaus - Renata', avatar: '#E85102', lastMsg: 'Perfeito, aguardamos o render final!', time: '2026-02-17T09:30:00', unread: 2 },
      { id: 'c2', name: 'Fontanive - Carlos', avatar: '#3b82f6', lastMsg: 'Podemos agendar uma call para revisar?', time: '2026-02-17T08:15:00', unread: 0 },
      { id: 'c3', name: 'Co.Pessoa - Mariana', avatar: '#22c55e', lastMsg: 'Aprovado! Podem seguir com a producao.', time: '2026-02-16T18:40:00', unread: 1 },
      { id: 'c4', name: 'GRP - Felipe', avatar: '#a855f7', lastMsg: 'Quando sai a revisao do masterplan?', time: '2026-02-16T16:20:00', unread: 3 },
      { id: 'c5', name: 'Tekton - Amanda', avatar: '#f97316', lastMsg: 'Recebi a proposta, vou analisar.', time: '2026-02-16T14:00:00', unread: 0 },
      { id: 'c6', name: 'MDI Brasil - Roberto', avatar: '#ef4444', lastMsg: 'O tour virtual ficou incrivel!', time: '2026-02-15T11:30:00', unread: 0 }
    ],
    messages: {
      c1: [
        { from: 'them', text: 'Bom dia! Temos novidades sobre o projeto da fachada?', time: '2026-02-17T08:45:00' },
        { from: 'me', text: 'Bom dia Renata! Sim, o render v3 ficou pronto ontem. Estou enviando agora.', time: '2026-02-17T09:00:00', status: 'read' },
        { from: 'me', text: 'Segue o link para visualizacao: drive.google.com/tbo/arthaus-v3', time: '2026-02-17T09:01:00', status: 'delivered' },
        { from: 'them', text: 'Perfeito, aguardamos o render final!', time: '2026-02-17T09:30:00' }
      ],
      c2: [
        { from: 'me', text: 'Ola Carlos, o moodboard do interior esta pronto para revisao.', time: '2026-02-17T07:30:00', status: 'read' },
        { from: 'them', text: 'Otimo! Vi rapidamente e gostei muito da direcao.', time: '2026-02-17T07:50:00' },
        { from: 'them', text: 'Podemos agendar uma call para revisar?', time: '2026-02-17T08:15:00' }
      ],
      c3: [
        { from: 'me', text: 'Mariana, a revisao do projeto esta disponivel no Drive.', time: '2026-02-16T17:00:00', status: 'read' },
        { from: 'them', text: 'Deixa eu dar uma olhada...', time: '2026-02-16T17:30:00' },
        { from: 'them', text: 'Aprovado! Podem seguir com a producao.', time: '2026-02-16T18:40:00' }
      ],
      c4: [
        { from: 'them', text: 'E ai pessoal, tudo bem?', time: '2026-02-16T15:00:00' },
        { from: 'me', text: 'Tudo otimo Felipe! Estamos finalizando o masterplan.', time: '2026-02-16T15:30:00', status: 'read' },
        { from: 'them', text: 'Legal! Precisamos apresentar na proxima semana.', time: '2026-02-16T15:45:00' },
        { from: 'them', text: 'Quando sai a revisao do masterplan?', time: '2026-02-16T16:20:00' }
      ],
      c5: [
        { from: 'me', text: 'Amanda, segue a proposta comercial para o projeto Tekton.', time: '2026-02-16T13:00:00', status: 'read' },
        { from: 'them', text: 'Recebi a proposta, vou analisar.', time: '2026-02-16T14:00:00' }
      ],
      c6: [
        { from: 'me', text: 'Roberto, o tour virtual do empreendimento esta no ar!', time: '2026-02-15T10:00:00', status: 'read' },
        { from: 'them', text: 'O tour virtual ficou incrivel!', time: '2026-02-15T11:30:00' }
      ]
    }
  },

  _notionData: {
    syncItems: [
      { id: 'ns1', name: 'Projetos', icon: '📋', notionTarget: 'Notion Database', direction: 'bi', status: 'synced', lastSync: '2026-02-17T09:00:00', itemCount: 12, pending: 0 },
      { id: 'ns2', name: 'Atas de Reuniao', icon: '📝', notionTarget: 'Notion Pages', direction: 'push', status: 'pending', lastSync: '2026-02-17T08:30:00', itemCount: 34, pending: 2 },
      { id: 'ns3', name: 'Base de Conhecimento', icon: '📚', notionTarget: 'Notion Wiki', direction: 'bi', status: 'synced', lastSync: '2026-02-17T08:45:00', itemCount: 56, pending: 0 },
      { id: 'ns4', name: 'Pipeline CRM', icon: '💰', notionTarget: 'Notion Database', direction: 'push', status: 'synced', lastSync: '2026-02-17T09:05:00', itemCount: 8, pending: 0 },
      { id: 'ns5', name: 'Tarefas', icon: '✅', notionTarget: 'Notion Database', direction: 'pull', status: 'error', lastSync: '2026-02-17T07:00:00', itemCount: 89, pending: 5 }
    ],
    log: [
      { time: '2026-02-17T09:05:00', msg: 'Pipeline CRM sincronizado com sucesso (8 itens)', type: 'success' },
      { time: '2026-02-17T09:00:00', msg: 'Projetos sincronizados com Notion Database', type: 'success' },
      { time: '2026-02-17T08:45:00', msg: 'Base de Conhecimento atualizada (3 paginas novas)', type: 'success' },
      { time: '2026-02-17T08:30:00', msg: '2 atas de reuniao pendentes para sincronizar', type: 'warning' },
      { time: '2026-02-17T07:00:00', msg: 'Erro ao sincronizar Tarefas: timeout na API do Notion', type: 'error' },
      { time: '2026-02-16T22:00:00', msg: 'Sincronizacao automatica noturna concluida', type: 'success' },
      { time: '2026-02-16T18:30:00', msg: 'Novo projeto adicionado: GRP - Masterplan', type: 'info' },
      { time: '2026-02-16T15:00:00', msg: 'Base de Conhecimento: artigo atualizado por Marco', type: 'info' }
    ]
  },

  _calendarData: [
    { id: 'ev1', title: 'Revisao Arthaus - Fachada v3', date: '2026-02-17', time: '10:00', type: 'review', client: 'Arthaus' },
    { id: 'ev2', title: 'Call Fontanive - Moodboard', date: '2026-02-17', time: '14:00', type: 'meeting', client: 'Fontanive' },
    { id: 'ev3', title: 'Deadline: Render GRP', date: '2026-02-18', time: '18:00', type: 'deadline', client: 'GRP' },
    { id: 'ev4', title: 'Apresentacao MDI Tour Virtual', date: '2026-02-19', time: '09:30', type: 'presentation', client: 'MDI Brasil' },
    { id: 'ev5', title: 'Reuniao Interna - Sprint Review', date: '2026-02-19', time: '15:00', type: 'meeting', client: null },
    { id: 'ev6', title: 'Entrega Parcial Tekton', date: '2026-02-20', time: '12:00', type: 'deadline', client: 'Tekton' },
    { id: 'ev7', title: 'Revisao Co.Pessoa - Producao', date: '2026-02-21', time: '11:00', type: 'review', client: 'Co.Pessoa' },
    { id: 'ev8', title: 'Apresentacao Proposta GRP Fase 2', date: '2026-02-24', time: '10:00', type: 'presentation', client: 'GRP' },
    { id: 'ev9', title: 'Deadline: Branding Fontanive', date: '2026-02-25', time: '18:00', type: 'deadline', client: 'Fontanive' },
    { id: 'ev10', title: 'Alinhamento Equipe', date: '2026-02-17', time: '08:30', type: 'meeting', client: null },
    { id: 'ev11', title: 'Revisao Final Arthaus', date: '2026-02-26', time: '14:00', type: 'review', client: 'Arthaus' },
    { id: 'ev12', title: 'Workshop 3D - Equipe', date: '2026-02-28', time: '09:00', type: 'presentation', client: null }
  ],

  _slackData: {
    channels: [
      { id: 'sl1', name: '#projetos', desc: 'Novo projeto, mudanca de status, entrega concluida', enabled: true, webhook: 'https://hooks.slack.com/services/T0****/B0****/xxxx', lastSent: '2026-02-17T09:05:00' },
      { id: 'sl2', name: '#financeiro', desc: 'Novo contrato, pagamento recebido, fatura emitida', enabled: true, webhook: 'https://hooks.slack.com/services/T0****/B0****/yyyy', lastSent: '2026-02-16T16:30:00' },
      { id: 'sl3', name: '#geral', desc: 'Anuncios da equipe, novidades, celebracoes', enabled: true, webhook: 'https://hooks.slack.com/services/T0****/B0****/zzzz', lastSent: '2026-02-16T12:00:00' },
      { id: 'sl4', name: '#alertas', desc: 'Deadline proximo, violacao de SLA, urgencias', enabled: false, webhook: '', lastSent: null }
    ],
    log: [
      { channel: '#projetos', msg: 'Novo projeto criado: GRP - Masterplan Fase 2', time: '2026-02-17T09:05:00' },
      { channel: '#projetos', msg: 'Status atualizado: Arthaus Fachada -> Em Revisao', time: '2026-02-17T08:30:00' },
      { channel: '#financeiro', msg: 'Pagamento recebido: Fontanive - R$ 28.000,00', time: '2026-02-16T16:30:00' },
      { channel: '#geral', msg: 'Bem-vindo ao time: Lucas Mendes (3D Artist)', time: '2026-02-16T12:00:00' },
      { channel: '#projetos', msg: 'Entrega concluida: MDI Brasil - Tour Virtual', time: '2026-02-15T17:00:00' },
      { channel: '#financeiro', msg: 'Fatura emitida: Tekton - NF #2026-042', time: '2026-02-15T14:20:00' },
      { channel: '#alertas', msg: 'Deadline em 48h: Render GRP Masterplan', time: '2026-02-15T10:00:00' },
      { channel: '#projetos', msg: 'Novo projeto criado: Co.Pessoa - Branding Visual', time: '2026-02-14T11:00:00' },
      { channel: '#financeiro', msg: 'Contrato assinado: GRP Masterplan (R$ 85.000)', time: '2026-02-14T09:30:00' },
      { channel: '#alertas', msg: 'SLA em risco: Tekton (prazo entrega em 3 dias)', time: '2026-02-13T15:00:00' }
    ]
  },

  // =========================================================================
  // 0. INTEGRATIONS HUB
  // =========================================================================

  renderIntegrationsHub(containerId) {
    this._injectStyles();
    const ct = this._el(containerId);
    if (!ct) return;

    const integrations = [
      { key: 'drive', icon: '📁', bg: 'rgba(251,191,36,.12)', name: 'Google Drive', desc: 'Navegue, pesquise e acesse arquivos do projeto diretamente no Drive.', status: 'active' },
      { key: 'whatsapp', icon: '💬', bg: 'rgba(37,211,102,.12)', name: 'WhatsApp Business', desc: 'Comunicacao com clientes, templates de resposta rapida e fila de mensagens.', status: 'active' },
      { key: 'notion', icon: '📓', bg: 'rgba(100,100,100,.12)', name: 'Notion Sync', desc: 'Sincronize projetos, atas e base de conhecimento com o workspace Notion.', status: 'active' },
      { key: 'calendar', icon: '📅', bg: 'rgba(59,130,246,.12)', name: 'Google Calendar', desc: 'Visualize reunioes, deadlines e apresentacoes em um calendario integrado.', status: 'active' },
      { key: 'slack', icon: '🔔', bg: 'rgba(232,81,2,.12)', name: 'Slack Webhooks', desc: 'Notificacoes automaticas em canais Slack para eventos do TBO OS.', status: 'config' }
    ];

    ct.innerHTML = `
      <div class="int-panel">
        <div class="int-panel-header">
          <h3>Central de Integracoes</h3>
          <span style="font-size:11px;color:var(--text-muted)">${integrations.filter(i => i.status === 'active').length} ativas</span>
        </div>
        <div class="int-panel-body">
          <div class="int-hub">
            ${integrations.map(ig => `
              <div class="int-hub-card" data-integration="${ig.key}">
                <div class="int-hub-card-icon" style="background:${ig.bg}">${ig.icon}</div>
                <h3>${ig.name}</h3>
                <p>${ig.desc}</p>
                <span class="int-status ${ig.status === 'active' ? 'int-status-active' : 'int-status-config'}">
                  ${ig.status === 'active' ? 'Conectado' : 'Configurar'}
                </span>
              </div>
            `).join('')}
          </div>
          <div id="intDetailPanel" style="margin-top:16px"></div>
        </div>
      </div>
    `;

    ct.querySelectorAll('.int-hub-card').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.dataset.integration;
        const detail = this._el('intDetailPanel');
        detail.innerHTML = '';
        const wrapperId = 'intDetail_' + key;
        detail.innerHTML = `<div id="${wrapperId}"></div>`;
        if (key === 'drive') this.renderDriveBrowser(wrapperId);
        else if (key === 'whatsapp') this.renderWhatsAppPanel(wrapperId);
        else if (key === 'notion') this.renderNotionSync(wrapperId);
        else if (key === 'calendar') this.renderCalendarWidget(wrapperId);
        else if (key === 'slack') this.renderSlackConfig(wrapperId);
      });
    });
  },

  // =========================================================================
  // 1. GOOGLE DRIVE BROWSER
  // =========================================================================

  _driveCurrentFolder: 'root',
  _driveSearchQuery: '',

  listFiles(folderId) {
    const items = [];
    this._driveData.folders.filter(f => f.parent === folderId).forEach(f => items.push({ ...f }));
    this._driveData.files.filter(f => f.parent === folderId).forEach(f => items.push({ ...f }));
    return items;
  },

  searchFiles(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    const results = [];
    this._driveData.files.filter(f => f.name.toLowerCase().includes(q)).forEach(f => results.push({ ...f }));
    this._driveData.folders.filter(f => f.name.toLowerCase().includes(q)).forEach(f => results.push({ ...f }));
    return results;
  },

  getFileUrl(fileId) {
    const file = this._driveData.files.find(f => f.id === fileId);
    if (!file) return '#';
    return `https://drive.google.com/file/d/${fileId}/view`;
  },

  _driveBreadcrumb(folderId) {
    const path = [];
    let current = folderId;
    while (current) {
      if (current === 'root') {
        path.unshift({ id: 'root', name: 'TBO Arquitetura' });
        break;
      }
      const folder = this._driveData.folders.find(f => f.id === current);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        current = folder.parent;
      } else { break; }
    }
    return path;
  },

  _driveIcon(type) {
    const icons = { folder: ['fi fi-folder', '📁'], doc: ['fi fi-doc', '📄'], sheet: ['fi fi-sheet', '📊'], slide: ['fi fi-slide', '📊'], pdf: ['fi fi-pdf', '📕'], image: ['fi fi-image', '🖼'] };
    return icons[type] || ['fi fi-other', '📎'];
  },

  renderDriveBrowser(containerId) {
    this._injectStyles();
    const ct = this._el(containerId);
    if (!ct) return;
    this._driveCurrentFolder = 'root';
    this._driveSearchQuery = '';
    this._driveContainerId = containerId;
    this._renderDriveView();
  },

  _renderDriveView() {
    const ct = this._el(this._driveContainerId);
    if (!ct) return;

    const bc = this._driveBreadcrumb(this._driveCurrentFolder);
    const items = this._driveSearchQuery ? this.searchFiles(this._driveSearchQuery) : this.listFiles(this._driveCurrentFolder);

    ct.innerHTML = `
      <div class="int-panel">
        <div class="int-panel-header">
          <span style="font-size:18px">📁</span>
          <h3>Google Drive</h3>
          <span style="font-size:11px;color:var(--text-muted)">${items.length} itens</span>
        </div>
        <div class="drive-search-bar">
          <input class="int-input" type="text" placeholder="Pesquisar arquivos..." value="${this._driveSearchQuery}" id="driveSearchInput">
        </div>
        <div class="drive-breadcrumb" id="driveBreadcrumb">
          ${bc.map((b, i) => `
            <span data-folder="${b.id}">${b.name}</span>
            ${i < bc.length - 1 ? '<span class="drive-bc-sep">/</span>' : ''}
          `).join('')}
        </div>
        <div style="overflow-x:auto">
          <table class="drive-table">
            <thead>
              <tr><th style="width:50%">Nome</th><th>Tamanho</th><th>Modificado</th></tr>
            </thead>
            <tbody id="driveTableBody">
              ${items.length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum arquivo encontrado</td></tr>' : ''}
              ${items.map(item => {
                const icon = this._driveIcon(item.type);
                return `
                  <tr data-id="${item.id}" data-type="${item.type}">
                    <td>
                      <span class="drive-file-icon">
                        <span class="${icon[0]}">${icon[1]}</span>
                        ${item.name}
                      </span>
                    </td>
                    <td style="color:var(--text-muted);font-size:12px">${item.size || '--'}</td>
                    <td style="color:var(--text-muted);font-size:12px">${item.modified ? this._ts(item.modified) : '--'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const searchInput = this._el('driveSearchInput');
    searchInput.addEventListener('input', (e) => {
      this._driveSearchQuery = e.target.value.trim();
      this._renderDriveView();
    });

    this._el('driveBreadcrumb').querySelectorAll('span[data-folder]').forEach(s => {
      s.addEventListener('click', () => {
        this._driveCurrentFolder = s.dataset.folder;
        this._driveSearchQuery = '';
        this._renderDriveView();
      });
    });

    this._el('driveTableBody').querySelectorAll('tr[data-id]').forEach(row => {
      row.addEventListener('dblclick', () => {
        if (row.dataset.type === 'folder') {
          this._driveCurrentFolder = row.dataset.id;
          this._driveSearchQuery = '';
          this._renderDriveView();
        } else {
          window.open(this.getFileUrl(row.dataset.id), '_blank');
        }
      });
    });
  },

  // =========================================================================
  // 2. WHATSAPP BUSINESS INTEGRATION
  // =========================================================================

  _waActiveConv: null,

  _waTemplates: [
    'Proposta enviada com sucesso!',
    'Revisao disponivel para aprovacao.',
    'Reuniao confirmada. Ate la!',
    'Obrigado pelo feedback!',
    'Projeto em andamento, enviaremos atualizacao em breve.'
  ],

  _waGetQueue() {
    try { return JSON.parse(localStorage.getItem('tbo_wa_queue') || '[]'); } catch { return []; }
  },

  _waSaveQueue(q) {
    try { localStorage.setItem('tbo_wa_queue', JSON.stringify(q)); } catch (e) { /* noop */ }
  },

  _waSendMessage(convId, text) {
    if (!text || !text.trim()) return;
    const conv = this._waData.conversations.find(c => c.id === convId);
    if (!conv) return;
    const msg = { from: 'me', text: text.trim(), time: new Date().toISOString(), status: 'sent' };
    if (!this._waData.messages[convId]) this._waData.messages[convId] = [];
    this._waData.messages[convId].push(msg);
    conv.lastMsg = text.trim();
    conv.time = msg.time;
    const queue = this._waGetQueue();
    queue.push({ to: conv.name, text: text.trim(), time: msg.time });
    this._waSaveQueue(queue);
    this._renderWaChat(convId);
    this._renderWaSidebar();
  },

  renderWhatsAppPanel(containerId) {
    this._injectStyles();
    const ct = this._el(containerId);
    if (!ct) return;
    this._waActiveConv = null;
    this._waContainerId = containerId;

    ct.innerHTML = `
      <div class="int-panel">
        <div class="int-panel-header">
          <span style="font-size:18px">💬</span>
          <h3>WhatsApp Business</h3>
          <span style="font-size:11px;color:var(--text-muted)">${this._waGetQueue().length} na fila</span>
        </div>
        <div class="wa-layout">
          <div class="wa-sidebar" id="waSidebar"></div>
          <div class="wa-chat-area" id="waChatArea">
            <div class="wa-empty">Selecione uma conversa</div>
          </div>
        </div>
      </div>
    `;
    this._renderWaSidebar();
  },

  _renderWaSidebar() {
    const sb = this._el('waSidebar');
    if (!sb) return;
    const sorted = [...this._waData.conversations].sort((a, b) => new Date(b.time) - new Date(a.time));
    sb.innerHTML = sorted.map(c => `
      <div class="wa-conv ${this._waActiveConv === c.id ? 'active' : ''}" data-conv="${c.id}">
        <div class="wa-avatar" style="background:${c.avatar}">${c.name.charAt(0)}</div>
        <div class="wa-conv-info">
          <div class="wa-conv-name">
            <span>${c.name}</span>
            <span class="wa-conv-time">${this._ts(c.time)}</span>
          </div>
          <div class="wa-conv-preview">${c.lastMsg}</div>
        </div>
        ${c.unread > 0 ? `<span class="int-badge wa-unread">${c.unread}</span>` : ''}
      </div>
    `).join('');

    sb.querySelectorAll('.wa-conv').forEach(el => {
      el.addEventListener('click', () => {
        const convId = el.dataset.conv;
        this._waActiveConv = convId;
        const conv = this._waData.conversations.find(c => c.id === convId);
        if (conv) conv.unread = 0;
        this._renderWaSidebar();
        this._renderWaChat(convId);
      });
    });
  },

  _renderWaChat(convId) {
    const area = this._el('waChatArea');
    if (!area) return;
    const msgs = this._waData.messages[convId] || [];
    const statusIcon = (s) => {
      if (s === 'sent') return '<span class="wa-msg-status" style="color:#888">&#10003;</span>';
      if (s === 'delivered') return '<span class="wa-msg-status" style="color:#888">&#10003;&#10003;</span>';
      if (s === 'read') return '<span class="wa-msg-status" style="color:#53bdeb">&#10003;&#10003;</span>';
      return '';
    };

    area.innerHTML = `
      <div class="wa-messages" id="waMessages">
        ${msgs.map(m => `
          <div class="wa-msg ${m.from === 'me' ? 'wa-msg-out' : 'wa-msg-in'}">
            <div>${m.text}</div>
            <div class="wa-msg-time">
              ${new Date(m.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              ${m.from === 'me' ? statusIcon(m.status) : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="wa-templates" id="waTemplates">
        ${this._waTemplates.map(t => `<button class="wa-tpl-btn" data-tpl="${t}">${t.substring(0, 25)}${t.length > 25 ? '...' : ''}</button>`).join('')}
      </div>
      <div class="wa-compose">
        <input class="int-input" type="text" placeholder="Digite uma mensagem..." id="waComposeInput">
        <button class="int-btn" id="waSendBtn">Enviar</button>
      </div>
    `;

    const msgContainer = this._el('waMessages');
    if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;

    const input = this._el('waComposeInput');
    const sendBtn = this._el('waSendBtn');

    const send = () => {
      const text = input.value;
      if (text.trim()) {
        this._waSendMessage(convId, text);
        input.value = '';
      }
    };

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

    this._el('waTemplates').querySelectorAll('.wa-tpl-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.tpl;
        input.focus();
      });
    });
  },

  // =========================================================================
  // 3. NOTION SYNC DASHBOARD
  // =========================================================================

  renderNotionSync(containerId) {
    this._injectStyles();
    const ct = this._el(containerId);
    if (!ct) return;
    this._notionContainerId = containerId;
    this._renderNotionView();
  },

  _renderNotionView() {
    const ct = this._el(this._notionContainerId);
    if (!ct) return;

    const dirLabel = (d) => {
      if (d === 'bi') return '&#8596;';
      if (d === 'push') return '&#8594;';
      if (d === 'pull') return '&#8592;';
      return '?';
    };
    const dirText = (d) => {
      if (d === 'bi') return 'Bidirecional';
      if (d === 'push') return 'TBO OS &#8594; Notion';
      if (d === 'pull') return 'Notion &#8594; TBO OS';
      return '';
    };
    const statusLabel = (s) => {
      if (s === 'synced') return '<span class="ns-status-dot ns-synced"></span>Sincronizado';
      if (s === 'pending') return '<span class="ns-status-dot ns-pending"></span>Pendente';
      if (s === 'error') return '<span class="ns-status-dot ns-error"></span>Erro';
      return s;
    };
    const logIcon = (type) => {
      if (type === 'success') return '&#10003;';
      if (type === 'warning') return '&#9888;';
      if (type === 'error') return '&#10007;';
      return '&#8226;';
    };
    const logColor = (type) => {
      if (type === 'success') return '#22c55e';
      if (type === 'warning') return '#fbbf24';
      if (type === 'error') return '#ef4444';
      return 'var(--text-muted)';
    };

    const totalSynced = this._notionData.syncItems.reduce((a, i) => a + i.itemCount, 0);
    const totalPending = this._notionData.syncItems.reduce((a, i) => a + i.pending, 0);

    ct.innerHTML = `
      <div class="int-panel">
        <div class="int-panel-header">
          <span style="font-size:18px">📓</span>
          <h3>Notion Sync</h3>
          <span style="font-size:11px;color:var(--text-muted)">${totalSynced} itens sincronizados | ${totalPending} pendentes</span>
          <button class="int-btn int-btn-sm" id="notionSyncAllBtn">Sincronizar Tudo</button>
        </div>
        <div class="int-panel-body">
          <div class="ns-items">
            ${this._notionData.syncItems.map(item => `
              <div class="ns-item">
                <div class="ns-item-icon" style="background:rgba(255,255,255,.05);font-size:20px">${item.icon}</div>
                <div class="ns-item-info">
                  <div class="ns-item-name">${item.name} <span class="ns-dir" title="${dirText(item.direction)}">${dirLabel(item.direction)}</span> ${item.notionTarget}</div>
                  <div class="ns-item-meta">
                    <span>${statusLabel(item.status)}</span>
                    <span>${item.itemCount} itens</span>
                    ${item.pending > 0 ? `<span style="color:#fbbf24">${item.pending} pendente(s)</span>` : ''}
                    <span>Ultimo sync: ${this._fullDate(item.lastSync)}</span>
                  </div>
                </div>
                <button class="int-btn int-btn-sm int-btn-ghost" data-sync-id="${item.id}">Sync</button>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:18px">
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:8px">Historico de Sincronizacao</div>
            <div class="ns-log">
              ${this._notionData.log.map(entry => `
                <div class="ns-log-item">
                  <span class="ns-log-time">${this._fullDate(entry.time)}</span>
                  <span style="color:${logColor(entry.type)};width:16px;text-align:center;flex-shrink:0">${logIcon(entry.type)}</span>
                  <span class="ns-log-msg">${entry.msg}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this._el('notionSyncAllBtn').addEventListener('click', () => {
      this._notionData.syncItems.forEach(item => {
        item.status = 'synced';
        item.pending = 0;
        item.lastSync = new Date().toISOString();
      });
      this._notionData.log.unshift({
        time: new Date().toISOString(),
        msg: 'Sincronizacao manual completa realizada com sucesso',
        type: 'success'
      });
      this._renderNotionView();
    });

    ct.querySelectorAll('[data-sync-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.syncId;
        const item = this._notionData.syncItems.find(i => i.id === id);
        if (item) {
          item.status = 'synced';
          item.pending = 0;
          item.lastSync = new Date().toISOString();
          this._notionData.log.unshift({
            time: new Date().toISOString(),
            msg: `${item.name} sincronizado manualmente com sucesso`,
            type: 'success'
          });
          this._renderNotionView();
        }
      });
    });
  },

  // =========================================================================
  // 4. GOOGLE CALENDAR INTEGRATION
  // =========================================================================

  _calYear: new Date().getFullYear(),
  _calMonth: new Date().getMonth(),
  _calSelectedDate: null,
  _calShowAddForm: false,

  getEventsForDate(date) {
    const d = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
    return this._calendarData.filter(e => e.date === d);
  },

  getUpcomingEvents(limit) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    return this._calendarData
      .filter(e => e.date >= todayStr)
      .sort((a, b) => {
        const da = new Date(a.date + 'T' + a.time);
        const db = new Date(b.date + 'T' + b.time);
        return da - db;
      })
      .slice(0, limit || 5);
  },

  renderCalendarWidget(containerId) {
    this._injectStyles();
    const ct = this._el(containerId);
    if (!ct) return;
    this._calContainerId = containerId;
    this._calYear = new Date().getFullYear();
    this._calMonth = new Date().getMonth();
    this._calSelectedDate = new Date().toISOString().slice(0, 10);
    this._calShowAddForm = false;
    this._renderCalendarView();
  },

  _renderCalendarView() {
    const ct = this._el(this._calContainerId);
    if (!ct) return;

    const year = this._calYear;
    const month = this._calMonth;
    const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const todayStr = new Date().toISOString().slice(0, 10);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let cells = '';
    for (let i = 0; i < firstDay; i++) {
      const d = daysInPrevMonth - firstDay + 1 + i;
      cells += `<div class="cal-cell other-month">${d}</div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const events = this.getEventsForDate(dateStr);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === this._calSelectedDate;
      let dotHtml = '';
      if (events.length > 0) {
        const types = [...new Set(events.map(e => e.type))];
        dotHtml = `<div class="cal-dots">${types.slice(0, 3).map(t => `<span class="cal-dot cal-dot-${t}"></span>`).join('')}</div>`;
      }
      cells += `<div class="cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateStr}">${d}${dotHtml}</div>`;
    }
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainingCells; i++) {
      cells += `<div class="cal-cell other-month">${i}</div>`;
    }

    const upcoming = this.getUpcomingEvents(5);
    const selectedEvents = this._calSelectedDate ? this.getEventsForDate(this._calSelectedDate) : [];
    const typeLabel = (t) => { const m = { meeting: 'Reuniao', deadline: 'Deadline', review: 'Revisao', presentation: 'Apresentacao' }; return m[t] || t; };

    ct.innerHTML = `
      <div class="int-panel">
        <div class="int-panel-header">
          <span style="font-size:18px">📅</span>
          <h3>Google Calendar</h3>
          <button class="int-btn int-btn-sm int-btn-ghost" id="calAddToggle">${this._calShowAddForm ? 'Fechar' : '+ Evento'}</button>
        </div>
        <div class="int-panel-body">
          <div class="cal-nav">
            <button class="cal-nav-btn" id="calPrev">&larr;</button>
            <span class="cal-nav-title">${monthNames[month]} ${year}</span>
            <button class="cal-nav-btn" id="calNext">&rarr;</button>
          </div>
          <div class="cal-grid">
            ${dayNames.map(dn => `<div class="cal-header-cell">${dn}</div>`).join('')}
            ${cells}
          </div>

          ${this._calShowAddForm ? `
            <div class="cal-add-form" id="calAddForm">
              <div style="font-size:12px;font-weight:600;color:var(--text-primary)">Novo Evento</div>
              <input class="int-input" type="text" placeholder="Titulo do evento" id="calNewTitle">
              <div class="cal-form-row">
                <input class="int-input" type="date" id="calNewDate" value="${this._calSelectedDate || todayStr}">
                <input class="int-input" type="time" id="calNewTime" value="10:00">
              </div>
              <div class="cal-form-row">
                <select class="int-input" id="calNewType">
                  <option value="meeting">Reuniao</option>
                  <option value="deadline">Deadline</option>
                  <option value="review">Revisao</option>
                  <option value="presentation">Apresentacao</option>
                </select>
                <input class="int-input" type="text" placeholder="Cliente (opcional)" id="calNewClient">
              </div>
              <button class="int-btn" id="calAddSubmit">Adicionar Evento</button>
            </div>
          ` : ''}

          ${selectedEvents.length > 0 ? `
            <div class="cal-events" style="margin-top:14px">
              <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:8px">
                Eventos em ${new Date(this._calSelectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
              </div>
              ${selectedEvents.map(ev => `
                <div class="cal-event cal-event-${ev.type}">
                  <span class="cal-event-time">${ev.time}</span>
                  <span class="cal-event-title">${ev.title}</span>
                  <span style="font-size:10px;color:var(--text-muted)">${typeLabel(ev.type)}</span>
                </div>
              `).join('')}
            </div>
          ` : this._calSelectedDate ? `<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px">Nenhum evento nesta data</div>` : ''}

          <div class="cal-events" style="margin-top:18px">
            <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:8px">Proximos Eventos</div>
            ${upcoming.length === 0 ? '<div style="color:var(--text-muted);font-size:12px;padding:10px">Nenhum evento futuro</div>' : ''}
            ${upcoming.map(ev => `
              <div class="cal-event cal-event-${ev.type}">
                <span class="cal-event-time">${ev.time}</span>
                <span class="cal-event-title">${ev.title}</span>
                <span style="font-size:10px;color:var(--text-muted)">${new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${typeLabel(ev.type)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Event listeners
    this._el('calPrev').addEventListener('click', () => {
      this._calMonth--;
      if (this._calMonth < 0) { this._calMonth = 11; this._calYear--; }
      this._renderCalendarView();
    });
    this._el('calNext').addEventListener('click', () => {
      this._calMonth++;
      if (this._calMonth > 11) { this._calMonth = 0; this._calYear++; }
      this._renderCalendarView();
    });

    ct.querySelectorAll('.cal-cell[data-date]').forEach(cell => {
      cell.addEventListener('click', () => {
        this._calSelectedDate = cell.dataset.date;
        this._renderCalendarView();
      });
    });

    this._el('calAddToggle').addEventListener('click', () => {
      this._calShowAddForm = !this._calShowAddForm;
      this._renderCalendarView();
    });

    if (this._calShowAddForm) {
      this._el('calAddSubmit').addEventListener('click', () => {
        const title = this._el('calNewTitle').value.trim();
        const date = this._el('calNewDate').value;
        const time = this._el('calNewTime').value;
        const type = this._el('calNewType').value;
        const client = this._el('calNewClient').value.trim() || null;
        if (!title || !date || !time) return;
        this._calendarData.push({ id: this._uid(), title, date, time, type, client });
        this._calShowAddForm = false;
        this._calSelectedDate = date;
        this._renderCalendarView();
      });
    }
  },

  // =========================================================================
  // 5. SLACK WEBHOOK NOTIFICATIONS
  // =========================================================================

  renderSlackConfig(containerId) {
    this._injectStyles();
    const ct = this._el(containerId);
    if (!ct) return;
    this._slackContainerId = containerId;
    this._renderSlackView();
  },

  _renderSlackView() {
    const ct = this._el(this._slackContainerId);
    if (!ct) return;

    const enabledCount = this._slackData.channels.filter(c => c.enabled).length;

    ct.innerHTML = `
      <div class="int-panel">
        <div class="int-panel-header">
          <span style="font-size:18px">🔔</span>
          <h3>Slack Webhooks</h3>
          <span style="font-size:11px;color:var(--text-muted)">${enabledCount}/${this._slackData.channels.length} canais ativos</span>
        </div>
        <div class="int-panel-body">
          <div class="sl-channels">
            ${this._slackData.channels.map(ch => `
              <div class="sl-channel" data-channel="${ch.id}">
                <div class="sl-channel-header">
                  <span class="sl-channel-name">${ch.name}</span>
                  <div class="sl-toggle ${ch.enabled ? 'active' : ''}" data-toggle="${ch.id}"></div>
                </div>
                <div class="sl-channel-desc">${ch.desc}</div>
                <div class="sl-webhook-row">
                  <input class="int-input" type="password" placeholder="Webhook URL" value="${ch.webhook}" data-webhook="${ch.id}" ${!ch.enabled ? 'disabled' : ''}>
                  <button class="int-btn int-btn-sm int-btn-ghost" data-test="${ch.id}" ${!ch.enabled ? 'disabled' : ''}>Testar</button>
                </div>
                <div class="sl-last-sent">
                  ${ch.lastSent ? 'Ultima notificacao: ' + this._fullDate(ch.lastSent) : 'Nenhuma notificacao enviada'}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:18px">
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:10px">Log de Notificacoes</div>
            <div class="sl-log">
              ${this._slackData.log.map(entry => `
                <div class="sl-log-item">
                  <span class="sl-log-channel">${entry.channel}</span>
                  <span class="sl-log-msg">${entry.msg}</span>
                  <span class="sl-log-time">${this._ts(entry.time)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Toggle listeners
    ct.querySelectorAll('.sl-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const id = toggle.dataset.toggle;
        const ch = this._slackData.channels.find(c => c.id === id);
        if (ch) {
          ch.enabled = !ch.enabled;
          this._renderSlackView();
        }
      });
    });

    // Webhook URL update listeners
    ct.querySelectorAll('input[data-webhook]').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.dataset.webhook;
        const ch = this._slackData.channels.find(c => c.id === id);
        if (ch) ch.webhook = input.value;
      });
    });

    // Test button listeners
    ct.querySelectorAll('button[data-test]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.test;
        const ch = this._slackData.channels.find(c => c.id === id);
        if (!ch || !ch.enabled) return;
        btn.textContent = 'Enviando...';
        btn.disabled = true;
        setTimeout(() => {
          ch.lastSent = new Date().toISOString();
          this._slackData.log.unshift({
            channel: ch.name,
            msg: 'Mensagem de teste enviada com sucesso',
            time: new Date().toISOString()
          });
          this._renderSlackView();
        }, 1200);
      });
    });
  },

  // =========================================================================
  // INIT
  // =========================================================================

  init() {
    this._injectStyles();
    console.log('[TBO Integrations] Modulo inicializado com sucesso.');
    return this;
  }
};
