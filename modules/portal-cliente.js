// TBO OS — Module: Portal do Cliente (Client Portal — Admin View)
// Task #21: Client-facing restricted area for project tracking, deliveries, approvals, messages
const TBO_PORTAL_CLIENTE = {
  _selectedClient: null,
  _activeTab: 'overview',
  _clients: [],
  _deliveries: [],
  _messages: [],
  _activity: [],
  _loading: false,

  // ── Render ─────────────────────────────────────────────────────────────────
  render() {
    return `
      <div class="portal-cliente">
        <div class="portal-header">
          <div class="portal-header-left">
            <h1 class="portal-title">
              <i data-lucide="monitor-smartphone" class="portal-title-icon"></i>
              Portal do Cliente
            </h1>
            <p class="portal-subtitle">Gerencie entregas, aprovacoes e comunicacao com clientes</p>
          </div>
          <div class="portal-header-actions">
            <select class="portal-client-select" id="portalClientSelect">
              <option value="">Selecionar cliente...</option>
            </select>
            <button class="btn btn-primary portal-btn-new-client" id="portalBtnNewClient">
              <i data-lucide="user-plus"></i>
              <span>Novo Cliente</span>
            </button>
          </div>
        </div>

        <!-- Client List (when no client selected) -->
        <div class="portal-client-list" id="portalClientList">
          <div class="portal-section-header">
            <h2>Clientes com Acesso</h2>
            <span class="portal-count" id="portalClientCount">0</span>
          </div>
          <div class="portal-clients-grid" id="portalClientsGrid">
            <div class="portal-empty">
              <i data-lucide="users" class="portal-empty-icon"></i>
              <p>Nenhum cliente cadastrado ainda.</p>
              <p class="portal-empty-hint">Clique em "Novo Cliente" para criar o primeiro acesso.</p>
            </div>
          </div>
        </div>

        <!-- Client Detail (when client selected) -->
        <div class="portal-client-detail" id="portalClientDetail" style="display:none;">
          <!-- Tabs -->
          <div class="portal-tabs" id="portalTabs">
            <button class="portal-tab active" data-tab="overview">
              <i data-lucide="layout-dashboard"></i>
              <span>Overview</span>
            </button>
            <button class="portal-tab" data-tab="entregas">
              <i data-lucide="package"></i>
              <span>Entregas</span>
            </button>
            <button class="portal-tab" data-tab="mensagens">
              <i data-lucide="message-circle"></i>
              <span>Mensagens</span>
            </button>
            <button class="portal-tab" data-tab="historico">
              <i data-lucide="clock"></i>
              <span>Historico</span>
            </button>
          </div>

          <!-- Tab Content -->
          <div class="portal-tab-content" id="portalTabContent">
            <!-- Dynamically rendered -->
          </div>
        </div>

        <!-- New Client Modal -->
        <div class="portal-modal-overlay" id="portalModalOverlay" style="display:none;">
          <div class="portal-modal">
            <div class="portal-modal-header">
              <h3 id="portalModalTitle">Novo Cliente</h3>
              <button class="portal-modal-close" id="portalModalClose">&times;</button>
            </div>
            <div class="portal-modal-body" id="portalModalBody">
              <!-- Dynamic form content -->
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ── Init ───────────────────────────────────────────────────────────────────
  async init() {
    if (window.lucide) lucide.createIcons();
    this._bindEvents();
    await this._loadClients();
  },

  // ── Bind Events ────────────────────────────────────────────────────────────
  _bindEvents() {
    // Client selector
    const select = document.getElementById('portalClientSelect');
    if (select) {
      select.addEventListener('change', (e) => {
        const id = e.target.value;
        if (id) {
          this._selectClient(id);
        } else {
          this._deselectClient();
        }
      });
    }

    // New client button
    const newBtn = document.getElementById('portalBtnNewClient');
    if (newBtn) {
      newBtn.addEventListener('click', () => this._showNewClientModal());
    }

    // Tabs
    const tabs = document.getElementById('portalTabs');
    if (tabs) {
      tabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.portal-tab');
        if (!tab) return;
        const tabName = tab.dataset.tab;
        this._switchTab(tabName);
      });
    }

    // Modal close
    const overlay = document.getElementById('portalModalOverlay');
    const closeBtn = document.getElementById('portalModalClose');
    if (closeBtn) closeBtn.addEventListener('click', () => this._closeModal());
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this._closeModal();
    });
  },

  // ── Load Clients ───────────────────────────────────────────────────────────
  async _loadClients() {
    try {
      this._loading = true;
      if (typeof ClientPortalRepo === 'undefined') {
        console.warn('[Portal Cliente] ClientPortalRepo nao disponivel');
        this._renderClientList([]);
        return;
      }
      const clients = await ClientPortalRepo.listClients();
      this._clients = clients;
      this._renderClientList(clients);
      this._populateClientSelect(clients);
    } catch (e) {
      console.error('[Portal Cliente] Erro ao carregar clientes:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao carregar clientes');
      this._renderClientList([]);
    } finally {
      this._loading = false;
    }
  },

  // ── Populate Client Select ─────────────────────────────────────────────────
  _populateClientSelect(clients) {
    const select = document.getElementById('portalClientSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Selecionar cliente...</option>';
    (clients || []).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.client_name} (${c.client_email})`;
      if (this._selectedClient && this._selectedClient.id === c.id) opt.selected = true;
      select.appendChild(opt);
    });
  },

  // ── Render Client List ─────────────────────────────────────────────────────
  _renderClientList(clients) {
    const grid = document.getElementById('portalClientsGrid');
    const count = document.getElementById('portalClientCount');
    if (count) count.textContent = (clients || []).length;
    if (!grid) return;

    if (!clients || clients.length === 0) {
      grid.innerHTML = `
        <div class="portal-empty">
          <i data-lucide="users" class="portal-empty-icon"></i>
          <p>Nenhum cliente cadastrado ainda.</p>
          <p class="portal-empty-hint">Clique em "Novo Cliente" para criar o primeiro acesso.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons({ root: grid });
      return;
    }

    grid.innerHTML = clients.map(c => {
      const initials = (c.client_name || 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const statusClass = c.is_active ? 'active' : 'inactive';
      const statusLabel = c.is_active ? 'Ativo' : 'Inativo';
      const lastLogin = c.last_login ? new Date(c.last_login).toLocaleDateString('pt-BR') : 'Nunca';
      return `
        <div class="portal-client-card" data-client-id="${c.id}">
          <div class="portal-client-card-header">
            <div class="portal-client-avatar">${this._esc(initials)}</div>
            <div class="portal-client-info">
              <h3 class="portal-client-name">${this._esc(c.client_name)}</h3>
              <span class="portal-client-email">${this._esc(c.client_email)}</span>
            </div>
            <span class="portal-status-badge portal-status-${statusClass}">${statusLabel}</span>
          </div>
          <div class="portal-client-card-body">
            <div class="portal-client-meta">
              <span><i data-lucide="clock" class="portal-meta-icon"></i> Ultimo login: ${lastLogin}</span>
            </div>
          </div>
          <div class="portal-client-card-footer">
            <button class="portal-card-btn portal-card-btn-view" data-action="view" data-id="${c.id}">
              <i data-lucide="eye"></i> Detalhes
            </button>
            <button class="portal-card-btn portal-card-btn-link" data-action="link" data-id="${c.id}">
              <i data-lucide="link"></i> Link
            </button>
            <button class="portal-card-btn portal-card-btn-toggle" data-action="toggle" data-id="${c.id}" data-active="${c.is_active}">
              <i data-lucide="${c.is_active ? 'pause' : 'play'}"></i> ${c.is_active ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons({ root: grid });

    // Card action buttons
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'view') this._selectClient(id);
      else if (action === 'link') this._copyAccessLink(id);
      else if (action === 'toggle') this._toggleClientActive(id, btn.dataset.active === 'true');
    });
  },

  // ── Select Client ──────────────────────────────────────────────────────────
  async _selectClient(id) {
    const client = this._clients.find(c => c.id === id);
    if (!client) return;
    this._selectedClient = client;
    this._activeTab = 'overview';

    // Update select dropdown
    const select = document.getElementById('portalClientSelect');
    if (select) select.value = id;

    // Show detail, hide list
    const list = document.getElementById('portalClientList');
    const detail = document.getElementById('portalClientDetail');
    if (list) list.style.display = 'none';
    if (detail) detail.style.display = 'block';

    // Update active tab
    document.querySelectorAll('.portal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'overview'));

    // Load data
    await this._loadClientData(id);
    this._renderTab('overview');
  },

  _deselectClient() {
    this._selectedClient = null;
    const list = document.getElementById('portalClientList');
    const detail = document.getElementById('portalClientDetail');
    if (list) list.style.display = 'block';
    if (detail) detail.style.display = 'none';
  },

  // ── Load Client Data ───────────────────────────────────────────────────────
  async _loadClientData(clientId) {
    try {
      if (typeof ClientPortalRepo === 'undefined') return;
      const [deliveries, messages, activity] = await Promise.all([
        ClientPortalRepo.listDeliveries(clientId),
        ClientPortalRepo.listMessages(clientId),
        ClientPortalRepo.listActivity(clientId)
      ]);
      this._deliveries = deliveries;
      this._messages = messages;
      this._activity = activity;
    } catch (e) {
      console.error('[Portal Cliente] Erro ao carregar dados do cliente:', e);
    }
  },

  // ── Switch Tab ─────────────────────────────────────────────────────────────
  _switchTab(tabName) {
    this._activeTab = tabName;
    document.querySelectorAll('.portal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    this._renderTab(tabName);
  },

  // ── Render Tab ─────────────────────────────────────────────────────────────
  _renderTab(tabName) {
    const content = document.getElementById('portalTabContent');
    if (!content) return;

    switch (tabName) {
      case 'overview': content.innerHTML = this._renderOverview(); break;
      case 'entregas': content.innerHTML = this._renderEntregas(); break;
      case 'mensagens': content.innerHTML = this._renderMensagens(); break;
      case 'historico': content.innerHTML = this._renderHistorico(); break;
      default: content.innerHTML = '';
    }

    if (window.lucide) lucide.createIcons({ root: content });

    // Bind tab-specific events
    if (tabName === 'entregas') this._bindEntregasEvents(content);
    if (tabName === 'mensagens') this._bindMensagensEvents(content);
  },

  // ── Tab: Overview ──────────────────────────────────────────────────────────
  _renderOverview() {
    const client = this._selectedClient;
    if (!client) return '';

    const totalDeliveries = this._deliveries.length;
    const approved = this._deliveries.filter(d => d.status === 'approved').length;
    const pending = this._deliveries.filter(d => d.status === 'pending').length;
    const revision = this._deliveries.filter(d => d.status === 'revision').length;
    const totalMessages = this._messages.length;
    const lastLogin = client.last_login ? new Date(client.last_login).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca';

    return `
      <div class="portal-overview">
        <!-- Client Info Card -->
        <div class="portal-info-card">
          <div class="portal-info-card-header">
            <div class="portal-info-avatar">${this._esc((client.client_name || 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}</div>
            <div>
              <h2 class="portal-info-name">${this._esc(client.client_name)}</h2>
              <p class="portal-info-email">${this._esc(client.client_email)}</p>
            </div>
            <span class="portal-status-badge portal-status-${client.is_active ? 'active' : 'inactive'}">${client.is_active ? 'Ativo' : 'Inativo'}</span>
          </div>
          <div class="portal-info-meta">
            <span><i data-lucide="clock"></i> Ultimo login: ${lastLogin}</span>
            <span><i data-lucide="calendar"></i> Criado em: ${new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <!-- Metrics -->
        <div class="portal-metrics-grid">
          <div class="portal-metric-card">
            <div class="portal-metric-icon" style="background: var(--color-primary-light, #eff6ff);">
              <i data-lucide="package"></i>
            </div>
            <div class="portal-metric-data">
              <span class="portal-metric-value">${totalDeliveries}</span>
              <span class="portal-metric-label">Entregas</span>
            </div>
          </div>
          <div class="portal-metric-card">
            <div class="portal-metric-icon" style="background: #f0fdf4;">
              <i data-lucide="check-circle-2"></i>
            </div>
            <div class="portal-metric-data">
              <span class="portal-metric-value">${approved}</span>
              <span class="portal-metric-label">Aprovadas</span>
            </div>
          </div>
          <div class="portal-metric-card">
            <div class="portal-metric-icon" style="background: #fef9c3;">
              <i data-lucide="clock"></i>
            </div>
            <div class="portal-metric-data">
              <span class="portal-metric-value">${pending}</span>
              <span class="portal-metric-label">Pendentes</span>
            </div>
          </div>
          <div class="portal-metric-card">
            <div class="portal-metric-icon" style="background: #fef2f2;">
              <i data-lucide="rotate-ccw"></i>
            </div>
            <div class="portal-metric-data">
              <span class="portal-metric-value">${revision}</span>
              <span class="portal-metric-label">Em Revisao</span>
            </div>
          </div>
        </div>

        <!-- Recent Deliveries -->
        <div class="portal-section">
          <h3 class="portal-section-title">Entregas Recentes</h3>
          ${this._deliveries.length === 0
            ? '<p class="portal-muted">Nenhuma entrega registrada.</p>'
            : `<div class="portal-recent-list">
                ${this._deliveries.slice(0, 5).map(d => `
                  <div class="portal-recent-item">
                    <div class="portal-recent-icon">
                      <i data-lucide="${d.status === 'approved' ? 'check-circle-2' : d.status === 'revision' ? 'rotate-ccw' : 'clock'}"></i>
                    </div>
                    <div class="portal-recent-info">
                      <span class="portal-recent-title">${this._esc(d.title)}</span>
                      <span class="portal-recent-date">${new Date(d.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span class="portal-delivery-badge portal-delivery-${d.status}">${this._statusLabel(d.status)}</span>
                  </div>
                `).join('')}
              </div>`
          }
        </div>

        <!-- Recent Messages -->
        <div class="portal-section">
          <h3 class="portal-section-title">Mensagens Recentes</h3>
          ${this._messages.length === 0
            ? '<p class="portal-muted">Nenhuma mensagem.</p>'
            : `<div class="portal-recent-list">
                ${this._messages.slice(-3).reverse().map(m => `
                  <div class="portal-recent-item">
                    <div class="portal-recent-icon portal-msg-icon-${m.sender_type}">
                      <i data-lucide="${m.sender_type === 'team' ? 'headphones' : 'user'}"></i>
                    </div>
                    <div class="portal-recent-info">
                      <span class="portal-recent-title">${this._esc(m.sender_name)}</span>
                      <span class="portal-recent-subtitle">${this._esc(m.content).substring(0, 80)}${m.content.length > 80 ? '...' : ''}</span>
                    </div>
                    <span class="portal-recent-date">${this._timeAgo(m.created_at)}</span>
                  </div>
                `).join('')}
              </div>`
          }
        </div>
      </div>
    `;
  },

  // ── Tab: Entregas ──────────────────────────────────────────────────────────
  _renderEntregas() {
    return `
      <div class="portal-entregas">
        <div class="portal-section-header">
          <h3>Entregas</h3>
          <button class="btn btn-primary portal-btn-sm" id="portalBtnNewDelivery">
            <i data-lucide="plus"></i> Nova Entrega
          </button>
        </div>
        <div class="portal-delivery-grid" id="portalDeliveryGrid">
          ${this._deliveries.length === 0
            ? `<div class="portal-empty-sm">
                <i data-lucide="package" class="portal-empty-icon-sm"></i>
                <p>Nenhuma entrega registrada.</p>
              </div>`
            : this._deliveries.map(d => this._renderDeliveryCard(d)).join('')
          }
        </div>
      </div>
    `;
  },

  _renderDeliveryCard(d) {
    const files = (d.files || []);
    const hasThumb = files.length > 0 && files[0].url;
    return `
      <div class="portal-delivery-card" data-delivery-id="${d.id}">
        <div class="portal-delivery-thumb">
          ${hasThumb
            ? `<img src="${this._esc(files[0].url)}" alt="${this._esc(d.title)}" class="portal-delivery-img">`
            : `<div class="portal-delivery-placeholder"><i data-lucide="file-image"></i></div>`
          }
          <span class="portal-delivery-badge portal-delivery-${d.status}">${this._statusLabel(d.status)}</span>
        </div>
        <div class="portal-delivery-body">
          <h4 class="portal-delivery-title">${this._esc(d.title)}</h4>
          <p class="portal-delivery-desc">${this._esc(d.description || '').substring(0, 100)}</p>
          <div class="portal-delivery-meta">
            <span><i data-lucide="calendar"></i> ${new Date(d.delivered_at || d.created_at).toLocaleDateString('pt-BR')}</span>
            <span><i data-lucide="paperclip"></i> ${files.length} arquivo${files.length !== 1 ? 's' : ''}</span>
          </div>
          ${d.review_notes ? `<div class="portal-delivery-notes"><strong>Notas:</strong> ${this._esc(d.review_notes)}</div>` : ''}
        </div>
        <div class="portal-delivery-actions">
          ${d.status === 'pending' ? `
            <button class="portal-action-btn portal-action-approve" data-delivery-action="approve" data-id="${d.id}">
              <i data-lucide="check"></i> Aprovar
            </button>
            <button class="portal-action-btn portal-action-revision" data-delivery-action="revision" data-id="${d.id}">
              <i data-lucide="rotate-ccw"></i> Revisao
            </button>
          ` : d.status === 'revision' ? `
            <button class="portal-action-btn portal-action-approve" data-delivery-action="approve" data-id="${d.id}">
              <i data-lucide="check"></i> Aprovar
            </button>
            <button class="portal-action-btn portal-action-reset" data-delivery-action="reset" data-id="${d.id}">
              <i data-lucide="undo-2"></i> Reabrir
            </button>
          ` : `
            <span class="portal-approved-label"><i data-lucide="check-circle-2"></i> Aprovada</span>
          `}
        </div>
      </div>
    `;
  },

  _bindEntregasEvents(container) {
    // New delivery
    const newBtn = container.querySelector('#portalBtnNewDelivery');
    if (newBtn) newBtn.addEventListener('click', () => this._showNewDeliveryModal());

    // Delivery actions
    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-delivery-action]');
      if (!btn) return;
      const action = btn.dataset.deliveryAction;
      const id = btn.dataset.id;
      if (action === 'approve') await this._approveDelivery(id);
      else if (action === 'revision') await this._requestRevision(id);
      else if (action === 'reset') await this._resetDelivery(id);
    });
  },

  // ── Tab: Mensagens ─────────────────────────────────────────────────────────
  _renderMensagens() {
    const msgs = this._messages || [];
    return `
      <div class="portal-mensagens">
        <div class="portal-chat-container" id="portalChatContainer">
          <div class="portal-chat-messages" id="portalChatMessages">
            ${msgs.length === 0
              ? '<div class="portal-chat-empty"><p>Nenhuma mensagem ainda. Inicie a conversa!</p></div>'
              : msgs.map(m => `
                <div class="portal-chat-bubble portal-chat-${m.sender_type}">
                  <div class="portal-chat-bubble-header">
                    <span class="portal-chat-sender">${this._esc(m.sender_name)}</span>
                    <span class="portal-chat-time">${this._timeAgo(m.created_at)}</span>
                  </div>
                  <div class="portal-chat-content">${this._esc(m.content)}</div>
                </div>
              `).join('')
            }
          </div>
          <div class="portal-chat-input-area">
            <textarea class="portal-chat-input" id="portalChatInput" placeholder="Escreva uma mensagem..." rows="2"></textarea>
            <button class="btn btn-primary portal-chat-send" id="portalChatSend">
              <i data-lucide="send"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  _bindMensagensEvents(container) {
    const input = container.querySelector('#portalChatInput');
    const sendBtn = container.querySelector('#portalChatSend');
    const chatArea = container.querySelector('#portalChatMessages');

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this._sendTeamMessage(input, chatArea));
    }
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this._sendTeamMessage(input, chatArea);
        }
      });
    }

    // Scroll to bottom
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
  },

  async _sendTeamMessage(input, chatArea) {
    if (!input || !this._selectedClient) return;
    const content = input.value.trim();
    if (!content) return;

    try {
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      const senderName = user?.name || user?.full_name || 'Equipe TBO';

      if (typeof ClientPortalRepo !== 'undefined') {
        await ClientPortalRepo.sendMessage({
          client_id: this._selectedClient.id,
          sender_type: 'team',
          sender_name: senderName,
          content
        });
      }

      // Add to local messages
      this._messages.push({
        id: Date.now().toString(),
        sender_type: 'team',
        sender_name: senderName,
        content,
        created_at: new Date().toISOString()
      });

      // Re-render chat
      input.value = '';
      this._renderTab('mensagens');
    } catch (e) {
      console.error('[Portal Cliente] Erro ao enviar mensagem:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao enviar mensagem');
    }
  },

  // ── Tab: Historico ─────────────────────────────────────────────────────────
  _renderHistorico() {
    const activities = this._activity || [];
    return `
      <div class="portal-historico">
        <div class="portal-section-header">
          <h3>Historico de Atividades</h3>
        </div>
        ${activities.length === 0
          ? '<p class="portal-muted">Nenhuma atividade registrada.</p>'
          : `<div class="portal-timeline">
              ${activities.map(a => {
                const iconMap = {
                  access_created: 'user-plus',
                  link_generated: 'link',
                  delivery_created: 'package',
                  delivery_approved: 'check-circle-2',
                  delivery_revision: 'rotate-ccw',
                  delivery_reset: 'undo-2',
                  message_sent: 'message-circle'
                };
                const icon = iconMap[a.action] || 'activity';
                return `
                  <div class="portal-timeline-item">
                    <div class="portal-timeline-dot">
                      <i data-lucide="${icon}"></i>
                    </div>
                    <div class="portal-timeline-content">
                      <span class="portal-timeline-action">${this._esc(a.description || a.action)}</span>
                      <span class="portal-timeline-time">${this._timeAgo(a.created_at)}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>`
        }
      </div>
    `;
  },

  // ── Actions ────────────────────────────────────────────────────────────────
  async _approveDelivery(id) {
    try {
      if (typeof ClientPortalRepo !== 'undefined') {
        await ClientPortalRepo.updateDeliveryStatus(id, 'approved');
      }
      const d = this._deliveries.find(x => x.id === id);
      if (d) { d.status = 'approved'; d.reviewed_at = new Date().toISOString(); }
      this._renderTab('entregas');
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Aprovada', 'Entrega aprovada com sucesso');
    } catch (e) {
      console.error('[Portal Cliente] Erro ao aprovar entrega:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao aprovar entrega');
    }
  },

  async _requestRevision(id) {
    const notes = prompt('Observacoes para revisao (opcional):');
    try {
      if (typeof ClientPortalRepo !== 'undefined') {
        await ClientPortalRepo.updateDeliveryStatus(id, 'revision', notes || '');
      }
      const d = this._deliveries.find(x => x.id === id);
      if (d) { d.status = 'revision'; d.review_notes = notes || ''; d.reviewed_at = new Date().toISOString(); }
      this._renderTab('entregas');
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Revisao', 'Revisao solicitada');
    } catch (e) {
      console.error('[Portal Cliente] Erro ao solicitar revisao:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao solicitar revisao');
    }
  },

  async _resetDelivery(id) {
    try {
      if (typeof ClientPortalRepo !== 'undefined') {
        await ClientPortalRepo.updateDeliveryStatus(id, 'pending');
      }
      const d = this._deliveries.find(x => x.id === id);
      if (d) { d.status = 'pending'; }
      this._renderTab('entregas');
    } catch (e) {
      console.error('[Portal Cliente] Erro ao resetar entrega:', e);
    }
  },

  async _toggleClientActive(id, currentlyActive) {
    try {
      if (typeof ClientPortalRepo !== 'undefined') {
        await ClientPortalRepo.updateAccess(id, { is_active: !currentlyActive });
      }
      const c = this._clients.find(x => x.id === id);
      if (c) c.is_active = !currentlyActive;
      this._renderClientList(this._clients);
      this._populateClientSelect(this._clients);
      const label = !currentlyActive ? 'ativado' : 'desativado';
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Atualizado', `Cliente ${label}`);
    } catch (e) {
      console.error('[Portal Cliente] Erro ao alternar status:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao alterar status');
    }
  },

  async _copyAccessLink(id) {
    try {
      const client = this._clients.find(c => c.id === id);
      if (!client) return;
      const link = `${window.location.origin}/portal?token=${client.access_token}`;
      await navigator.clipboard.writeText(link);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Copiado', 'Link de acesso copiado');
    } catch (e) {
      console.error('[Portal Cliente] Erro ao copiar link:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao copiar link');
    }
  },

  // ── Modals ─────────────────────────────────────────────────────────────────
  _showNewClientModal() {
    const overlay = document.getElementById('portalModalOverlay');
    const title = document.getElementById('portalModalTitle');
    const body = document.getElementById('portalModalBody');
    if (!overlay || !body) return;

    if (title) title.textContent = 'Novo Cliente';
    body.innerHTML = `
      <form id="portalNewClientForm" class="portal-form">
        <div class="portal-form-group">
          <label class="portal-form-label">Nome do Cliente</label>
          <input type="text" class="portal-form-input" id="portalClientName" required placeholder="Ex: Arthaus Incorporadora">
        </div>
        <div class="portal-form-group">
          <label class="portal-form-label">Email</label>
          <input type="email" class="portal-form-input" id="portalClientEmail" required placeholder="contato@empresa.com">
        </div>
        <div class="portal-form-actions">
          <button type="button" class="btn portal-btn-cancel" id="portalFormCancel">Cancelar</button>
          <button type="submit" class="btn btn-primary">Criar Acesso</button>
        </div>
      </form>
    `;
    overlay.style.display = 'flex';

    const form = document.getElementById('portalNewClientForm');
    const cancelBtn = document.getElementById('portalFormCancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeModal());
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('portalClientName')?.value?.trim();
      const email = document.getElementById('portalClientEmail')?.value?.trim();
      if (!name || !email) return;
      try {
        if (typeof ClientPortalRepo !== 'undefined') {
          await ClientPortalRepo.createAccess({ client_name: name, client_email: email });
        }
        this._closeModal();
        await this._loadClients();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Criado', `Acesso criado para ${name}`);
      } catch (err) {
        console.error('[Portal Cliente] Erro ao criar acesso:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao criar acesso');
      }
    });
  },

  _showNewDeliveryModal() {
    if (!this._selectedClient) return;
    const overlay = document.getElementById('portalModalOverlay');
    const title = document.getElementById('portalModalTitle');
    const body = document.getElementById('portalModalBody');
    if (!overlay || !body) return;

    if (title) title.textContent = 'Nova Entrega';
    body.innerHTML = `
      <form id="portalNewDeliveryForm" class="portal-form">
        <div class="portal-form-group">
          <label class="portal-form-label">Titulo</label>
          <input type="text" class="portal-form-input" id="portalDeliveryTitle" required placeholder="Ex: Render Fachada v2">
        </div>
        <div class="portal-form-group">
          <label class="portal-form-label">Descricao</label>
          <textarea class="portal-form-textarea" id="portalDeliveryDesc" rows="3" placeholder="Descricao da entrega..."></textarea>
        </div>
        <div class="portal-form-group">
          <label class="portal-form-label">URL do Arquivo (opcional)</label>
          <input type="url" class="portal-form-input" id="portalDeliveryFileUrl" placeholder="https://drive.google.com/...">
        </div>
        <div class="portal-form-actions">
          <button type="button" class="btn portal-btn-cancel" id="portalFormCancel2">Cancelar</button>
          <button type="submit" class="btn btn-primary">Criar Entrega</button>
        </div>
      </form>
    `;
    overlay.style.display = 'flex';

    const form = document.getElementById('portalNewDeliveryForm');
    const cancelBtn = document.getElementById('portalFormCancel2');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeModal());
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleVal = document.getElementById('portalDeliveryTitle')?.value?.trim();
      const desc = document.getElementById('portalDeliveryDesc')?.value?.trim();
      const fileUrl = document.getElementById('portalDeliveryFileUrl')?.value?.trim();
      if (!titleVal) return;
      const files = fileUrl ? [{ name: titleVal, url: fileUrl }] : [];
      try {
        if (typeof ClientPortalRepo !== 'undefined') {
          const created = await ClientPortalRepo.createDelivery({
            client_id: this._selectedClient.id,
            title: titleVal,
            description: desc || '',
            files
          });
          if (created) this._deliveries.unshift(created);
        }
        this._closeModal();
        this._renderTab('entregas');
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Criada', `Entrega "${titleVal}" registrada`);
      } catch (err) {
        console.error('[Portal Cliente] Erro ao criar entrega:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao criar entrega');
      }
    });
  },

  _closeModal() {
    const overlay = document.getElementById('portalModalOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  // ── Helpers ────────────────────────────────────────────────────────────────
  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  _statusLabel(status) {
    const map = { pending: 'Pendente', approved: 'Aprovada', revision: 'Em Revisao' };
    return map[status] || status;
  },

  _timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin}min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `${diffD}d`;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }
};

if (typeof window !== 'undefined') {
  window.TBO_PORTAL_CLIENTE = TBO_PORTAL_CLIENTE;
}
