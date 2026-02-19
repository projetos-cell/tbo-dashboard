// TBO OS — Module: Chat em Tempo Real (Slack-style)
// Supabase: chat_channels, chat_messages, chat_channel_members, chat_reactions
// Realtime: postgres_changes + presence para typing indicators

const TBO_CHAT = {

  _channels: [],
  _activeChannel: null,
  _messages: [],
  _members: {},
  _currentUser: null,
  _subscription: null,
  _presenceChannel: null,
  _typingUsers: [],
  _messageOffset: 0,
  _messagesPerPage: 50,
  _loadingMore: false,
  _allLoaded: false,
  _unreadCounts: {},

  // ── Helpers ──────────────────────────────────────────────────────
  _esc(s) { return typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.escapeHtml(s) : String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c])); },
  _getClient() { return typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null; },
  _getTenantId() { return typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getCurrentTenantId() : null; },

  async _getCurrentUser() {
    if (this._currentUser) return this._currentUser;
    if (typeof TBO_SUPABASE !== 'undefined') {
      const session = await TBO_SUPABASE.getSession();
      if (session?.user) {
        this._currentUser = session.user;
        return session.user;
      }
    }
    return null;
  },

  _formatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return time;
    if (isYesterday) return `Ontem ${time}`;
    return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${time}`;
  },

  _getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  },

  _getUserName(userId) {
    const m = this._members[userId];
    if (m) return m.name || m.email || 'Usuario';
    return 'Usuario';
  },

  _getUserColor(userId) {
    const colors = ['#E85102', '#8b5cf6', '#3a7bd5', '#2ecc71', '#f59e0b', '#e74c3c', '#1abc9c', '#9b59b6'];
    let hash = 0;
    for (let i = 0; i < (userId || '').length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  render() {
    return `
      <div class="chat-module">
        <style>${this._getScopedCSS()}</style>
        <div class="chat-layout">
          <!-- Sidebar -->
          <div class="chat-sidebar" id="chatSidebar">
            <div class="chat-sidebar-header">
              <h3 style="margin:0;font-size:0.95rem;font-weight:700;">Mensagens</h3>
              <button class="btn btn-primary btn-sm" id="chatNewChannel" title="Novo canal" style="font-size:0.68rem;padding:4px 10px;">
                <i data-lucide="plus" style="width:14px;height:14px;"></i>
              </button>
            </div>
            <div class="chat-channel-list" id="chatChannelList">
              <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.78rem;">
                Carregando canais...
              </div>
            </div>
          </div>

          <!-- Main area -->
          <div class="chat-main" id="chatMain">
            <div class="chat-empty-state" id="chatEmptyState">
              <div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
                <i data-lucide="message-circle" style="width:48px;height:48px;margin-bottom:16px;opacity:0.3;"></i>
                <div style="font-size:1rem;font-weight:600;margin-bottom:8px;">Bem-vindo ao Chat TBO</div>
                <div style="font-size:0.82rem;">Selecione um canal ou crie um novo para comecar</div>
              </div>
            </div>

            <!-- Channel header (hidden until channel selected) -->
            <div class="chat-channel-header" id="chatChannelHeader" style="display:none;">
              <div style="display:flex;align-items:center;gap:10px;">
                <button class="btn btn-secondary btn-sm chat-back-btn" id="chatBackBtn" style="display:none;">
                  <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
                </button>
                <div>
                  <div class="chat-channel-name" id="chatChannelName"></div>
                  <div class="chat-channel-desc" id="chatChannelDesc"></div>
                </div>
              </div>
              <div class="chat-channel-members-count" id="chatMembersCount"></div>
            </div>

            <!-- Messages area (hidden until channel selected) -->
            <div class="chat-messages-area" id="chatMessagesArea" style="display:none;">
              <div class="chat-messages-scroll" id="chatMessagesScroll">
                <div id="chatLoadMore" style="display:none;text-align:center;padding:12px;">
                  <button class="btn btn-secondary btn-sm" id="chatLoadMoreBtn" style="font-size:0.72rem;">Carregar mensagens anteriores</button>
                </div>
                <div class="chat-messages-list" id="chatMessagesList"></div>
              </div>
              <div class="chat-typing" id="chatTyping" style="display:none;">
                <span class="chat-typing-dots"><span></span><span></span><span></span></span>
                <span id="chatTypingText"></span>
              </div>
            </div>

            <!-- Input area (hidden until channel selected) -->
            <div class="chat-input-area" id="chatInputArea" style="display:none;">
              <textarea class="chat-input" id="chatInput" placeholder="Escreva uma mensagem..." rows="1"></textarea>
              <button class="chat-send-btn" id="chatSendBtn" title="Enviar">
                <i data-lucide="send" style="width:18px;height:18px;"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal novo canal -->
        <div class="chat-modal-overlay" id="chatNewChannelModal" style="display:none;">
          <div class="chat-modal">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h4 style="margin:0;">Novo Canal</h4>
              <button class="btn btn-secondary btn-sm" id="chatModalClose"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
            </div>
            <input type="text" class="form-input" id="chatChannelNameInput" placeholder="Nome do canal (ex: marketing)" style="margin-bottom:12px;">
            <input type="text" class="form-input" id="chatChannelDescInput" placeholder="Descricao (opcional)" style="margin-bottom:16px;">
            <button class="btn btn-primary" id="chatCreateChannel" style="width:100%;">Criar Canal</button>
          </div>
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════════
  async init() {
    if (window.lucide) lucide.createIcons();

    const user = await this._getCurrentUser();
    if (!user) {
      document.getElementById('chatChannelList').innerHTML = '<div style="padding:20px;text-align:center;font-size:0.78rem;color:var(--text-muted);">Faca login para usar o chat</div>';
      return;
    }

    // Carregar canais
    await this._loadChannels();

    // Bind: novo canal
    const newChannelBtn = document.getElementById('chatNewChannel');
    if (newChannelBtn) newChannelBtn.addEventListener('click', () => {
      document.getElementById('chatNewChannelModal').style.display = 'flex';
    });
    const modalClose = document.getElementById('chatModalClose');
    if (modalClose) modalClose.addEventListener('click', () => {
      document.getElementById('chatNewChannelModal').style.display = 'none';
    });
    const createBtn = document.getElementById('chatCreateChannel');
    if (createBtn) createBtn.addEventListener('click', () => this._createChannel());

    // Fechar modal com Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('chatNewChannelModal');
        if (modal && modal.style.display !== 'none') modal.style.display = 'none';
      }
    });

    // Back button (mobile)
    const backBtn = document.getElementById('chatBackBtn');
    if (backBtn) backBtn.addEventListener('click', () => this._showSidebar());

    // Input: auto-resize + send
    const input = document.getElementById('chatInput');
    if (input) {
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        this._sendTypingIndicator();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this._sendMessage();
        }
      });
    }

    // Send button
    const sendBtn = document.getElementById('chatSendBtn');
    if (sendBtn) sendBtn.addEventListener('click', () => this._sendMessage());

    // Scroll load more
    const scroll = document.getElementById('chatMessagesScroll');
    if (scroll) {
      scroll.addEventListener('scroll', () => {
        if (scroll.scrollTop < 50 && !this._loadingMore && !this._allLoaded) {
          this._loadOlderMessages();
        }
      });
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // CHANNELS
  // ══════════════════════════════════════════════════════════════════
  async _loadChannels() {
    const client = this._getClient();
    const list = document.getElementById('chatChannelList');
    if (!client || !list) {
      if (list) list.innerHTML = '<div style="padding:20px;text-align:center;font-size:0.78rem;color:var(--text-muted);">Conecte ao Supabase para usar o chat</div>';
      return;
    }

    try {
      const user = await this._getCurrentUser();
      const { data: memberships, error: memErr } = await client
        .from('chat_channel_members')
        .select('channel_id')
        .eq('user_id', user.id);

      if (memErr) throw memErr;
      if (!memberships?.length) {
        list.innerHTML = '<div style="padding:20px;text-align:center;font-size:0.78rem;color:var(--text-muted);">Nenhum canal ainda. Crie um!</div>';
        return;
      }

      const channelIds = memberships.map(m => m.channel_id);
      const { data: channels, error: chErr } = await client
        .from('chat_channels')
        .select('*')
        .in('id', channelIds)
        .eq('is_archived', false)
        .order('created_at', { ascending: true });

      if (chErr) throw chErr;
      this._channels = channels || [];

      // Carregar contagem de unread para cada canal
      for (const ch of this._channels) {
        const mem = memberships.find(m => m.channel_id === ch.id);
        if (mem) {
          const { count } = await client
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('channel_id', ch.id)
            .is('deleted_at', null);
          // Simplificar: usar count total como placeholder (unread real requer last_read_at)
          this._unreadCounts[ch.id] = 0; // Para implementacao futura
        }
      }

      this._renderChannelList();
    } catch (e) {
      console.error('[Chat] Erro ao carregar canais:', e);
      if (list) list.innerHTML = '<div style="padding:20px;text-align:center;font-size:0.78rem;color:var(--color-danger);">Erro ao carregar canais. A tabela chat_channels existe no Supabase?</div>';
    }
  },

  _renderChannelList() {
    const list = document.getElementById('chatChannelList');
    if (!list) return;

    list.innerHTML = this._channels.map(ch => {
      const isActive = this._activeChannel?.id === ch.id;
      const typeIcon = ch.type === 'direct' ? 'user' : 'hash';
      const unread = this._unreadCounts[ch.id] || 0;
      return `
        <div class="chat-channel-item ${isActive ? 'active' : ''}" data-channel-id="${ch.id}">
          <i data-lucide="${typeIcon}" style="width:16px;height:16px;flex-shrink:0;opacity:0.6;"></i>
          <span class="chat-channel-item-name">${this._esc(ch.name)}</span>
          ${unread > 0 ? `<span class="chat-unread-badge">${unread}</span>` : ''}
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    // Bind channel clicks
    list.querySelectorAll('.chat-channel-item').forEach(item => {
      item.addEventListener('click', () => {
        const channelId = item.dataset.channelId;
        const channel = this._channels.find(c => c.id === channelId);
        if (channel) this._selectChannel(channel);
      });
    });
  },

  async _selectChannel(channel) {
    // Limpar subscription anterior
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
    if (this._presenceChannel) {
      this._presenceChannel.unsubscribe();
      this._presenceChannel = null;
    }

    this._activeChannel = channel;
    this._messages = [];
    this._messageOffset = 0;
    this._allLoaded = false;

    // Atualizar UI
    document.getElementById('chatEmptyState').style.display = 'none';
    document.getElementById('chatChannelHeader').style.display = 'flex';
    document.getElementById('chatMessagesArea').style.display = 'flex';
    document.getElementById('chatInputArea').style.display = 'flex';
    document.getElementById('chatChannelName').textContent = (channel.type === 'direct' ? '' : '# ') + channel.name;
    document.getElementById('chatChannelDesc').textContent = channel.description || '';

    // Mostrar back button mobile
    if (window.innerWidth <= 768) {
      document.getElementById('chatBackBtn').style.display = 'block';
      document.getElementById('chatSidebar').classList.add('chat-sidebar-hidden');
    }

    // Highlight canal ativo
    this._renderChannelList();

    // Carregar membros e mensagens
    await this._loadChannelMembers(channel.id);
    await this._loadMessages(channel.id);

    // Subscrever a novos mensagens
    this._subscribeToChannel(channel.id);
    this._initPresence(channel.id);

    // Focar no input
    document.getElementById('chatInput')?.focus();
  },

  async _loadChannelMembers(channelId) {
    const client = this._getClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from('chat_channel_members')
        .select('user_id')
        .eq('channel_id', channelId);

      if (error) throw error;

      // Carregar perfis dos membros
      const memberCount = document.getElementById('chatMembersCount');
      if (memberCount) memberCount.textContent = `${data?.length || 0} membros`;

      // Carregar nomes dos usuarios
      if (data?.length) {
        const { data: users } = await client
          .from('profiles')
          .select('id, full_name, email')
          .in('id', data.map(m => m.user_id));

        if (users) {
          users.forEach(u => {
            this._members[u.id] = { name: u.full_name, email: u.email };
          });
        }

        // Fallback: tentar auth.users metadata se profiles nao funcionar
        if (!users || !users.length) {
          for (const m of data) {
            if (!this._members[m.user_id]) {
              this._members[m.user_id] = { name: 'Usuario', email: '' };
            }
          }
        }
      }
    } catch (e) { console.warn('[Chat] Erro ao carregar membros:', e.message); }
  },

  // ══════════════════════════════════════════════════════════════════
  // MESSAGES
  // ══════════════════════════════════════════════════════════════════
  async _loadMessages(channelId) {
    const client = this._getClient();
    const list = document.getElementById('chatMessagesList');
    if (!client || !list) return;

    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.78rem;">Carregando mensagens...</div>';

    try {
      const { data, error } = await client
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(0, this._messagesPerPage - 1);

      if (error) throw error;

      this._messages = (data || []).reverse();
      this._renderMessages();

      // Scroll to bottom
      const scroll = document.getElementById('chatMessagesScroll');
      if (scroll) scroll.scrollTop = scroll.scrollHeight;

      // Marcar como lido
      this._markAsRead(channelId);

      // Mostrar load more se houver mais
      const loadMore = document.getElementById('chatLoadMore');
      if (loadMore) loadMore.style.display = (data?.length >= this._messagesPerPage) ? 'block' : 'none';

    } catch (e) {
      console.error('[Chat] Erro ao carregar mensagens:', e);
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--color-danger);font-size:0.78rem;">Erro ao carregar mensagens</div>';
    }
  },

  async _loadOlderMessages() {
    if (this._loadingMore || this._allLoaded || !this._activeChannel) return;
    this._loadingMore = true;

    const client = this._getClient();
    if (!client) { this._loadingMore = false; return; }

    const scroll = document.getElementById('chatMessagesScroll');
    const prevHeight = scroll?.scrollHeight || 0;

    try {
      this._messageOffset += this._messagesPerPage;
      const { data, error } = await client
        .from('chat_messages')
        .select('*')
        .eq('channel_id', this._activeChannel.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(this._messageOffset, this._messageOffset + this._messagesPerPage - 1);

      if (error) throw error;

      if (!data?.length || data.length < this._messagesPerPage) this._allLoaded = true;
      if (data?.length) {
        this._messages = [...data.reverse(), ...this._messages];
        this._renderMessages();
        // Manter posicao de scroll
        if (scroll) scroll.scrollTop = scroll.scrollHeight - prevHeight;
      }

      const loadMore = document.getElementById('chatLoadMore');
      if (loadMore) loadMore.style.display = this._allLoaded ? 'none' : 'block';
    } catch (e) {
      console.error('[Chat] Erro ao carregar mais mensagens:', e);
    }
    this._loadingMore = false;
  },

  _renderMessages() {
    const list = document.getElementById('chatMessagesList');
    if (!list) return;

    if (!this._messages.length) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:0.82rem;">Nenhuma mensagem ainda. Comece a conversa!</div>';
      return;
    }

    let html = '';
    let lastSender = null;
    let lastDate = '';

    this._messages.forEach((msg, i) => {
      const date = new Date(msg.created_at).toLocaleDateString('pt-BR');
      if (date !== lastDate) {
        html += `<div class="chat-date-separator"><span>${date === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : date}</span></div>`;
        lastDate = date;
        lastSender = null;
      }

      const isOwn = msg.sender_id === this._currentUser?.id;
      const isSameAuthor = msg.sender_id === lastSender;
      const name = this._getUserName(msg.sender_id);
      const initials = this._getInitials(name);
      const color = this._getUserColor(msg.sender_id);
      const time = this._formatTime(msg.created_at);

      // Processar conteudo (markdown basico: **bold**, *italic*, `code`, \n)
      const content = this._esc(msg.content)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

      html += `
        <div class="chat-message ${isOwn ? 'chat-message-own' : ''} ${isSameAuthor ? 'chat-message-grouped' : ''}">
          ${!isSameAuthor ? `
            <div class="chat-message-avatar" style="background:${color}20;color:${color};">${initials}</div>
          ` : '<div class="chat-message-avatar-spacer"></div>'}
          <div class="chat-message-body">
            ${!isSameAuthor ? `
              <div class="chat-message-header">
                <span class="chat-message-author" style="color:${color};">${this._esc(name)}</span>
                <span class="chat-message-time">${time}</span>
              </div>
            ` : ''}
            <div class="chat-message-content">${content}</div>
          </div>
        </div>
      `;
      lastSender = msg.sender_id;
    });

    list.innerHTML = html;
  },

  // ══════════════════════════════════════════════════════════════════
  // SEND MESSAGE
  // ══════════════════════════════════════════════════════════════════
  async _sendMessage() {
    const input = document.getElementById('chatInput');
    const content = input?.value?.trim();
    if (!content || !this._activeChannel) return;

    const client = this._getClient();
    const user = this._currentUser;
    if (!client || !user) return;

    // Limpar input imediatamente
    input.value = '';
    input.style.height = 'auto';

    try {
      const { data, error } = await client.from('chat_messages').insert({
        channel_id: this._activeChannel.id,
        sender_id: user.id,
        content
      }).select().single();

      if (error) {
        TBO_TOAST.error('Erro ao enviar', error.message);
        input.value = content; // Restaurar
        return;
      }

      // A mensagem vai chegar via realtime, mas adicionar localmente para feedback imediato
      if (data && !this._messages.find(m => m.id === data.id)) {
        this._messages.push(data);
        this._renderMessages();
        const scroll = document.getElementById('chatMessagesScroll');
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      }
    } catch (e) {
      TBO_TOAST.error('Erro ao enviar', e.message);
      input.value = content;
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // REALTIME
  // ══════════════════════════════════════════════════════════════════
  _subscribeToChannel(channelId) {
    const client = this._getClient();
    if (!client) return;

    this._subscription = client
      .channel(`chat:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        const msg = payload.new;
        if (msg && !this._messages.find(m => m.id === msg.id)) {
          this._messages.push(msg);
          this._renderMessages();
          const scroll = document.getElementById('chatMessagesScroll');
          if (scroll) {
            // Auto-scroll se usuario esta no fundo
            const isNearBottom = (scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight) < 100;
            if (isNearBottom) scroll.scrollTop = scroll.scrollHeight;
          }
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        this._messages = this._messages.filter(m => m.id !== payload.old.id);
        this._renderMessages();
      })
      .subscribe();
  },

  _initPresence(channelId) {
    const client = this._getClient();
    if (!client || !this._currentUser) return;

    this._presenceChannel = client.channel(`presence:chat:${channelId}`);

    this._presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = this._presenceChannel.presenceState();
        const typingUsers = [];
        Object.values(state).forEach(presences => {
          presences.forEach(p => {
            if (p.typing && p.user_id !== this._currentUser.id) {
              typingUsers.push(p.name || 'Alguem');
            }
          });
        });
        this._updateTypingIndicator(typingUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this._presenceChannel.track({
            user_id: this._currentUser.id,
            name: this._currentUser.user_metadata?.full_name || this._currentUser.email?.split('@')[0] || 'Usuario',
            typing: false
          });
        }
      });
  },

  _typingTimeout: null,
  async _sendTypingIndicator() {
    if (!this._presenceChannel || !this._currentUser) return;

    try {
      await this._presenceChannel.track({
        user_id: this._currentUser.id,
        name: this._currentUser.user_metadata?.full_name || this._currentUser.email?.split('@')[0] || 'Usuario',
        typing: true
      });
    } catch (e) { /* silenciar */ }

    // Parar de digitar apos 3 segundos
    clearTimeout(this._typingTimeout);
    this._typingTimeout = setTimeout(async () => {
      try {
        await this._presenceChannel?.track({
          user_id: this._currentUser.id,
          name: this._currentUser.user_metadata?.full_name || this._currentUser.email?.split('@')[0] || 'Usuario',
          typing: false
        });
      } catch (e) { /* silenciar */ }
    }, 3000);
  },

  _updateTypingIndicator(users) {
    const el = document.getElementById('chatTyping');
    const text = document.getElementById('chatTypingText');
    if (!el || !text) return;

    if (users.length === 0) {
      el.style.display = 'none';
    } else {
      el.style.display = 'flex';
      if (users.length === 1) text.textContent = `${users[0]} esta digitando...`;
      else if (users.length === 2) text.textContent = `${users[0]} e ${users[1]} estao digitando...`;
      else text.textContent = `${users.length} pessoas estao digitando...`;
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // CREATE CHANNEL
  // ══════════════════════════════════════════════════════════════════
  async _createChannel() {
    const name = document.getElementById('chatChannelNameInput')?.value?.trim();
    if (!name) { TBO_TOAST.warning('Digite o nome do canal'); return; }

    const client = this._getClient();
    const tenantId = this._getTenantId();
    const user = this._currentUser;
    if (!client || !tenantId || !user) { TBO_TOAST.error('Erro', 'Nao conectado'); return; }

    try {
      // Criar canal
      const { data: channel, error: chErr } = await client
        .from('chat_channels')
        .insert({
          tenant_id: tenantId,
          name: name.toLowerCase().replace(/\s+/g, '-'),
          type: 'channel',
          description: document.getElementById('chatChannelDescInput')?.value?.trim() || '',
          created_by: user.id
        })
        .select()
        .single();

      if (chErr) throw chErr;

      // Adicionar criador como admin
      const { error: memErr } = await client
        .from('chat_channel_members')
        .insert({ channel_id: channel.id, user_id: user.id, role: 'admin' });

      if (memErr) throw memErr;

      TBO_TOAST.success('Canal criado!', `#${channel.name}`);
      document.getElementById('chatNewChannelModal').style.display = 'none';
      document.getElementById('chatChannelNameInput').value = '';
      document.getElementById('chatChannelDescInput').value = '';

      // Recarregar e selecionar
      await this._loadChannels();
      this._selectChannel(channel);
    } catch (e) {
      TBO_TOAST.error('Erro ao criar canal', e.message);
    }
  },

  async _markAsRead(channelId) {
    const client = this._getClient();
    const user = this._currentUser;
    if (!client || !user) return;

    try {
      await client.from('chat_channel_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('channel_id', channelId)
        .eq('user_id', user.id);
    } catch (e) { /* silenciar */ }
  },

  _showSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    if (sidebar) sidebar.classList.remove('chat-sidebar-hidden');
  },

  // ══════════════════════════════════════════════════════════════════
  // CSS
  // ══════════════════════════════════════════════════════════════════
  _getScopedCSS() {
    return `
      .chat-module { height: calc(100vh - 120px); overflow: hidden; }
      .chat-layout { display: flex; height: 100%; border-radius: var(--radius-lg, 12px); border: 1px solid var(--border-subtle); overflow: hidden; background: var(--bg-primary); }

      /* Sidebar */
      .chat-sidebar { width: 280px; min-width: 280px; border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; background: var(--bg-secondary, var(--bg-elevated)); }
      .chat-sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--border-subtle); }
      .chat-channel-list { flex: 1; overflow-y: auto; padding: 8px; }
      .chat-channel-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-md, 8px); cursor: pointer; font-size: 0.82rem; transition: background 0.15s; }
      .chat-channel-item:hover { background: var(--bg-elevated); }
      .chat-channel-item.active { background: var(--accent, #E85102)15; color: var(--accent, #E85102); font-weight: 600; }
      .chat-channel-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .chat-unread-badge { background: var(--accent, #E85102); color: #fff; font-size: 0.6rem; font-weight: 700; padding: 2px 6px; border-radius: 10px; min-width: 18px; text-align: center; }

      /* Main area */
      .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
      .chat-empty-state { flex: 1; display: flex; align-items: center; justify-content: center; }
      .chat-channel-header { display: none; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-primary); }
      .chat-channel-name { font-weight: 700; font-size: 0.95rem; }
      .chat-channel-desc { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
      .chat-channel-members-count { font-size: 0.72rem; color: var(--text-muted); }

      /* Messages */
      .chat-messages-area { flex: 1; display: none; flex-direction: column; overflow: hidden; }
      .chat-messages-scroll { flex: 1; overflow-y: auto; padding: 16px 20px; }
      .chat-messages-list { display: flex; flex-direction: column; gap: 2px; }

      .chat-date-separator { display: flex; align-items: center; gap: 12px; margin: 16px 0 8px; }
      .chat-date-separator::before, .chat-date-separator::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle); }
      .chat-date-separator span { font-size: 0.68rem; color: var(--text-muted); font-weight: 600; white-space: nowrap; }

      .chat-message { display: flex; gap: 10px; padding: 4px 0; }
      .chat-message-grouped { padding-top: 0; }
      .chat-message-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
      .chat-message-avatar-spacer { width: 36px; flex-shrink: 0; }
      .chat-message-body { flex: 1; min-width: 0; }
      .chat-message-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 2px; }
      .chat-message-author { font-weight: 700; font-size: 0.82rem; }
      .chat-message-time { font-size: 0.62rem; color: var(--text-muted); }
      .chat-message-content { font-size: 0.82rem; line-height: 1.5; word-break: break-word; }
      .chat-message-content code { background: var(--bg-elevated); padding: 1px 4px; border-radius: 3px; font-size: 0.78rem; }

      /* Typing indicator */
      .chat-typing { display: none; align-items: center; gap: 8px; padding: 4px 20px 8px; font-size: 0.72rem; color: var(--text-muted); }
      .chat-typing-dots { display: flex; gap: 3px; }
      .chat-typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: chatTypingBounce 1.4s ease-in-out infinite; }
      .chat-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .chat-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes chatTypingBounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }

      /* Input */
      .chat-input-area { display: none; align-items: flex-end; gap: 10px; padding: 12px 20px 16px; border-top: 1px solid var(--border-subtle); background: var(--bg-primary); }
      .chat-input { flex: 1; resize: none; border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); padding: 10px 14px; font-size: 0.82rem; font-family: inherit; background: var(--bg-elevated); color: var(--text-primary); max-height: 120px; outline: none; transition: border-color 0.2s; }
      .chat-input:focus { border-color: var(--accent, #E85102); }
      .chat-input::placeholder { color: var(--text-muted); }
      .chat-send-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--accent, #E85102); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s, transform 0.1s; }
      .chat-send-btn:hover { background: #d04900; }
      .chat-send-btn:active { transform: scale(0.95); }

      /* Modal */
      .chat-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1100; display: none; align-items: center; justify-content: center; }
      .chat-modal { background: var(--bg-primary); border-radius: var(--radius-lg, 12px); padding: 24px; width: 90%; max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }

      /* Mobile */
      @media (max-width: 768px) {
        .chat-layout { flex-direction: column; }
        .chat-sidebar { width: 100%; min-width: 100%; max-height: 100%; border-right: none; border-bottom: 1px solid var(--border-subtle); }
        .chat-sidebar-hidden { display: none; }
        .chat-back-btn { display: block !important; }
        .chat-module { height: calc(100vh - 80px); }
      }

      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
  }
};
