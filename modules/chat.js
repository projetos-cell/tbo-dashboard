// TBO OS — Module: Chat em Tempo Real (Slack/Discord-style)
// v2: Secoes, membros, emojis, reacoes, uploads, enquetes, mencoes
// Supabase: chat_channels, chat_messages, chat_channel_members, chat_reactions,
//           chat_channel_sections, chat_attachments, chat_polls, chat_poll_options, chat_poll_votes
// Realtime: postgres_changes + presence para typing indicators

const TBO_CHAT = {

  // ── State ────────────────────────────────────────────────────────
  _channels: [],
  _sections: [],
  _activeChannel: null,
  _messages: [],
  _members: {},
  _allUsers: [],
  _currentUser: null,
  _subscription: null,
  _presenceChannel: null,
  _typingUsers: [],
  _messageOffset: 0,
  _messagesPerPage: 50,
  _loadingMore: false,
  _allLoaded: false,
  _unreadCounts: {},
  _reactions: {},
  _collapsedSections: {},
  _showEmojiPicker: false,
  _showMentionSuggestions: false,
  _mentionQuery: '',
  _mentionStartPos: 0,

  // ── Emoji / Sticker Sets ─────────────────────────────────────────
  _emojiCategories: {
    'Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','😮‍💨','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😈','👿'],
    'Gestos': ['👍','👎','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚','🖐','🖖','👋','🤝','🙏','💪','🦾','🫶','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝'],
    'Objetos': ['🔥','⭐','💫','🌟','✨','⚡','💥','💯','🎉','🎊','🎯','🏆','🏅','🥇','🥈','🥉','🎪','🎨','🎬','🎤','🎧','🎵','🎶','📱','💻','⌨️','🖥','🖨','📁','📂','📊','📈','📉','📋','📌','📍','📎','🔗','📐','📏','🔑','🗝','🔐','🔒','🔓'],
    'Trabalho': ['💼','📁','📂','📊','📈','📉','📋','📌','📍','📎','🖇','📝','✏️','🖊','🖋','📆','📅','🗓','📇','🗃','🗄','🗑','📰','🏢','🏗','🔧','🔨','⚙️','🛠','✅','❌','⭕','🔴','🟠','🟡','🟢','🔵','🟣']
  },

  _stickerPacks: {
    'TBO Reactions': [
      { emoji: '🚀', label: 'Lancamento' },
      { emoji: '🎯', label: 'Na mosca' },
      { emoji: '💪', label: 'Forca' },
      { emoji: '🎉', label: 'Comemoracao' },
      { emoji: '🔥', label: 'Pegando fogo' },
      { emoji: '⭐', label: 'Estrela' },
      { emoji: '💡', label: 'Ideia' },
      { emoji: '👏', label: 'Aplausos' },
      { emoji: '✅', label: 'Feito' },
      { emoji: '🙌', label: 'Mãos pro alto' },
      { emoji: '❤️', label: 'Coracao' },
      { emoji: '😂', label: 'Rindo' },
    ]
  },

  // Reacoes rapidas para hover de mensagem
  _quickReactions: ['👍','❤️','😂','🎉','🔥','👀','🚀','✅'],

  // ── Helpers ──────────────────────────────────────────────────────
  _esc(s) { return typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.escapeHtml(s) : String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c])); },
  _getClient() { return typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null; },
  _getTenantId() {
    // Tentar varias fontes de tenant_id
    if (typeof TBO_SUPABASE !== 'undefined') {
      const fromMethod = TBO_SUPABASE.getCurrentTenantId?.();
      if (fromMethod) return fromMethod;
    }
    // Fallback: user_metadata
    if (this._currentUser?.user_metadata?.tenant_id) return this._currentUser.user_metadata.tenant_id;
    // Fallback: sessionStorage
    try {
      const auth = JSON.parse(sessionStorage.getItem('tbo_auth') || '{}');
      return auth?.user?.tenant_id || auth?.tenant_id || null;
    } catch (e) { return null; }
  },

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

  _getUserAvatar(userId) {
    const m = this._members[userId];
    return m?.avatar || null;
  },

  _getUserColor(userId) {
    const colors = ['#E85102', '#8b5cf6', '#3a7bd5', '#2ecc71', '#f59e0b', '#e74c3c', '#1abc9c', '#9b59b6'];
    let hash = 0;
    for (let i = 0; i < (userId || '').length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },

  _formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  // ══════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
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
              <div style="display:flex;gap:4px;">
                <button class="chat-sidebar-btn" id="chatNewSection" title="Nova secao">
                  <i data-lucide="folder-plus" style="width:15px;height:15px;"></i>
                </button>
                <button class="chat-sidebar-btn" id="chatNewChannel" title="Novo canal">
                  <i data-lucide="plus-circle" style="width:15px;height:15px;"></i>
                </button>
              </div>
            </div>
            <div class="chat-sidebar-search">
              <i data-lucide="search" style="width:14px;height:14px;color:var(--text-muted);position:absolute;left:12px;top:50%;transform:translateY(-50%);"></i>
              <input type="text" class="chat-search-input" id="chatSearchInput" placeholder="Buscar canais...">
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

            <!-- Channel header -->
            <div class="chat-channel-header" id="chatChannelHeader" style="display:none;">
              <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                <button class="chat-icon-btn chat-back-btn" id="chatBackBtn" style="display:none;">
                  <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
                </button>
                <div style="min-width:0;flex:1;">
                  <div class="chat-channel-name" id="chatChannelName"></div>
                  <div class="chat-channel-desc" id="chatChannelDesc"></div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <button class="chat-icon-btn" id="chatManageMembers" title="Gerenciar membros">
                  <i data-lucide="users" style="width:16px;height:16px;"></i>
                  <span class="chat-header-badge" id="chatMembersCount">0</span>
                </button>
                <button class="chat-icon-btn" id="chatChannelSettings" title="Configuracoes do canal">
                  <i data-lucide="settings" style="width:16px;height:16px;"></i>
                </button>
              </div>
            </div>

            <!-- Messages area -->
            <div class="chat-messages-area" id="chatMessagesArea" style="display:none;">
              <div class="chat-messages-scroll" id="chatMessagesScroll">
                <div id="chatLoadMore" style="display:none;text-align:center;padding:12px;">
                  <button class="btn btn-secondary btn-sm" id="chatLoadMoreBtn" style="font-size:0.72rem;">Carregar anteriores</button>
                </div>
                <div class="chat-messages-list" id="chatMessagesList"></div>
              </div>
              <div class="chat-typing" id="chatTyping" style="display:none;">
                <span class="chat-typing-dots"><span></span><span></span><span></span></span>
                <span id="chatTypingText"></span>
              </div>
            </div>

            <!-- Input area -->
            <div class="chat-input-area" id="chatInputArea" style="display:none;">
              <!-- Toolbar -->
              <div class="chat-toolbar">
                <button class="chat-toolbar-btn" id="chatAttachBtn" title="Anexar arquivo">
                  <i data-lucide="paperclip" style="width:16px;height:16px;"></i>
                </button>
                <button class="chat-toolbar-btn" id="chatEmojiBtn" title="Emoji">
                  <i data-lucide="smile" style="width:16px;height:16px;"></i>
                </button>
                <button class="chat-toolbar-btn" id="chatStickerBtn" title="Stickers">
                  <i data-lucide="sticker" style="width:16px;height:16px;"></i>
                </button>
                <button class="chat-toolbar-btn" id="chatPollBtn" title="Criar enquete">
                  <i data-lucide="bar-chart-3" style="width:16px;height:16px;"></i>
                </button>
                <button class="chat-toolbar-btn" id="chatMentionBtn" title="Mencionar alguem (@)">
                  <i data-lucide="at-sign" style="width:16px;height:16px;"></i>
                </button>
              </div>
              <!-- Attachment preview -->
              <div class="chat-attachment-preview" id="chatAttachPreview" style="display:none;"></div>
              <!-- Mention suggestions -->
              <div class="chat-mention-suggestions" id="chatMentionSuggestions" style="display:none;"></div>
              <!-- Emoji picker -->
              <div class="chat-emoji-picker" id="chatEmojiPicker" style="display:none;"></div>
              <!-- Sticker picker -->
              <div class="chat-sticker-picker" id="chatStickerPicker" style="display:none;"></div>
              <!-- Input row -->
              <div class="chat-input-row">
                <textarea class="chat-input" id="chatInput" placeholder="Escreva uma mensagem... (@ para mencionar)" rows="1"></textarea>
                <button class="chat-send-btn" id="chatSendBtn" title="Enviar (Enter)">
                  <i data-lucide="send" style="width:18px;height:18px;"></i>
                </button>
              </div>
              <input type="file" id="chatFileInput" multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" style="display:none;">
            </div>
          </div>
        </div>

        <!-- Modais -->
        <div class="chat-modal-overlay" id="chatNewChannelModal" style="display:none;">
          <div class="chat-modal" id="chatNewChannelModalContent"></div>
        </div>
        <div class="chat-modal-overlay" id="chatMembersModal" style="display:none;">
          <div class="chat-modal chat-modal-lg" id="chatMembersModalContent"></div>
        </div>
        <div class="chat-modal-overlay" id="chatPollModal" style="display:none;">
          <div class="chat-modal" id="chatPollModalContent"></div>
        </div>
        <div class="chat-modal-overlay" id="chatSectionModal" style="display:none;">
          <div class="chat-modal" id="chatSectionModalContent"></div>
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════════
  _bound: false,

  async init() {
    if (window.lucide) lucide.createIcons();

    const user = await this._getCurrentUser();
    if (!user) {
      const list = document.getElementById('chatChannelList');
      if (list) list.innerHTML = '<div style="padding:20px;text-align:center;font-size:0.78rem;color:var(--text-muted);">Faca login para usar o chat</div>';
      return;
    }

    // Bind events via delegation (uma unica vez)
    if (!this._bound) {
      this._bindEvents();
      this._bound = true;
    }

    // Carregar todos os usuarios do tenant (para mencoes)
    await this._loadAllUsers();

    // Carregar secoes e canais
    await this._loadSections();
    await this._loadChannels();
  },

  _bindEvents() {
    const self = this;

    // ═══ IMPORTANTE: usar document como alvo de delegation ═══
    // O .chat-module e substituido pelo render() a cada navegacao,
    // entao listeners no container antigo se perdem.
    // Usando document, os listeners sobrevivem a re-renders.

    // ── Event delegation: click ──
    document.addEventListener('click', (e) => {
      // Ignorar clicks fora do chat
      if (!e.target.closest('.chat-module')) return;
      const btn = e.target.closest('[id]');
      if (!btn) return;
      const id = btn.id;
      if (id === 'chatNewChannel') self._showNewChannelModal();
      else if (id === 'chatNewSection') self._showNewSectionModal();
      else if (id === 'chatBackBtn') self._showSidebar();
      else if (id === 'chatManageMembers') self._showMembersModal();
      else if (id === 'chatAttachBtn') document.getElementById('chatFileInput')?.click();
      else if (id === 'chatEmojiBtn') self._toggleEmojiPicker();
      else if (id === 'chatStickerBtn') self._toggleStickerPicker();
      else if (id === 'chatPollBtn') self._showPollModal();
      else if (id === 'chatMentionBtn') self._insertMentionTrigger();
      else if (id === 'chatSendBtn') self._sendMessage();
      else if (id === 'chatLoadMoreBtn') self._loadOlderMessages();
    });

    // ── Input: keydown (Enter to send) ──
    document.addEventListener('keydown', (e) => {
      if (e.target.id === 'chatInput') {
        // Mention suggestions navigation
        if (self._showMentionSuggestions) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            self._navigateMentionSuggestion(e.key === 'ArrowDown' ? 1 : -1);
            return;
          }
          if (e.key === 'Enter' || e.key === 'Tab') {
            const active = document.querySelector('.chat-mention-item.active');
            if (active) { e.preventDefault(); self._selectMention(active.dataset.userId); return; }
          }
          if (e.key === 'Escape') { self._hideMentionSuggestions(); return; }
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          self._sendMessage();
        }
      }
      // Fechar modais com Escape
      if (e.key === 'Escape') self._closeAllModals();
    });

    // ── Input: auto-resize + typing + mention check ──
    document.addEventListener('input', (e) => {
      if (e.target.id === 'chatInput') {
        const input = e.target;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        self._sendTypingIndicator();
        self._checkMentionTrigger(input);
      }
      if (e.target.id === 'chatSearchInput') {
        self._filterChannels(e.target.value);
      }
    });

    // ── File input change ──
    document.addEventListener('change', (e) => {
      if (e.target.id === 'chatFileInput') self._handleFileSelect(e);
    });

    // ── Fechar pickers ao clicar fora ──
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#chatEmojiPicker') && !e.target.closest('#chatEmojiBtn')) {
        const p = document.getElementById('chatEmojiPicker');
        if (p) p.style.display = 'none';
      }
      if (!e.target.closest('#chatStickerPicker') && !e.target.closest('#chatStickerBtn')) {
        const p = document.getElementById('chatStickerPicker');
        if (p) p.style.display = 'none';
      }
    });

    // ── Fechar modais ao clicar no overlay (delegation) ──
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('chat-modal-overlay')) {
        self._closeAllModals();
      }
    });
  },

  _closeAllModals() {
    document.querySelectorAll('.chat-modal-overlay').forEach(m => m.style.display = 'none');
    const pickers = ['chatEmojiPicker', 'chatStickerPicker', 'chatMentionSuggestions'];
    pickers.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  },

  // ══════════════════════════════════════════════════════════════════
  // LOAD ALL USERS (para mencoes e adicionar membros)
  // ══════════════════════════════════════════════════════════════════
  async _loadAllUsers() {
    const client = this._getClient();
    if (!client) return;
    try {
      // Tentar profiles primeiro
      const { data: profiles } = await client.from('profiles').select('id, full_name, email, avatar_url');
      if (profiles?.length) {
        this._allUsers = profiles.map(p => ({ id: p.id, name: p.full_name || p.email?.split('@')[0] || 'Usuario', email: p.email, avatar: p.avatar_url }));
        profiles.forEach(p => {
          this._members[p.id] = { name: p.full_name || p.email?.split('@')[0], email: p.email, avatar: p.avatar_url };
        });
        return;
      }
      // Fallback: buscar de colaboradores ou user_metadata
      const { data: colabs } = await client.from('colaboradores').select('id, nome, email');
      if (colabs?.length) {
        this._allUsers = colabs.map(c => ({ id: c.id, name: c.nome || c.email?.split('@')[0], email: c.email, avatar: null }));
      }
    } catch (e) { console.warn('[Chat] Nao foi possivel carregar usuarios:', e.message); }
  },

  // ══════════════════════════════════════════════════════════════════
  // SECTIONS (secoes colapsiveis)
  // ══════════════════════════════════════════════════════════════════
  async _loadSections() {
    const client = this._getClient();
    const tenantId = this._getTenantId();
    if (!client || !tenantId) return;
    try {
      const { data } = await client
        .from('chat_channel_sections')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order', { ascending: true });
      this._sections = data || [];
    } catch (e) { console.warn('[Chat] Erro ao carregar secoes:', e.message); }
  },

  _showNewSectionModal() {
    const modal = document.getElementById('chatSectionModal');
    const content = document.getElementById('chatSectionModalContent');
    if (!modal || !content) return;
    content.innerHTML = `
      <div class="chat-modal-header">
        <h4 style="margin:0;">Nova Secao</h4>
        <button class="chat-icon-btn" onclick="document.getElementById('chatSectionModal').style.display='none'">
          <i data-lucide="x" style="width:16px;height:16px;"></i>
        </button>
      </div>
      <input type="text" class="chat-form-input" id="chatSectionName" placeholder="Nome da secao (ex: Projetos)">
      <button class="btn btn-primary" style="width:100%;margin-top:12px;" id="chatCreateSectionBtn">Criar Secao</button>
    `;
    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
    document.getElementById('chatSectionName')?.focus();
    this._on('chatCreateSectionBtn', 'click', () => this._createSection());
  },

  async _createSection() {
    const name = document.getElementById('chatSectionName')?.value?.trim();
    if (!name) { TBO_TOAST.warning('Digite o nome da secao'); return; }
    const client = this._getClient();
    const user = this._currentUser;
    const tenantId = this._getTenantId();
    if (!client || !user || !tenantId) return;
    try {
      const { error } = await client.from('chat_channel_sections').insert({
        tenant_id: tenantId, name, sort_order: this._sections.length, created_by: user.id
      });
      if (error) throw error;
      TBO_TOAST.success('Secao criada!', name);
      document.getElementById('chatSectionModal').style.display = 'none';
      await this._loadSections();
      this._renderChannelList();
    } catch (e) { TBO_TOAST.error('Erro', e.message); }
  },

  _toggleSection(sectionId) {
    this._collapsedSections[sectionId] = !this._collapsedSections[sectionId];
    this._renderChannelList();
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
        .select('channel_id, last_read_at')
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

      // Calcular unread
      for (const ch of this._channels) {
        const mem = memberships.find(m => m.channel_id === ch.id);
        if (mem?.last_read_at) {
          try {
            const { count } = await client
              .from('chat_messages')
              .select('id', { count: 'exact', head: true })
              .eq('channel_id', ch.id)
              .is('deleted_at', null)
              .gt('created_at', mem.last_read_at);
            this._unreadCounts[ch.id] = count || 0;
          } catch (e) { this._unreadCounts[ch.id] = 0; }
        }
      }

      this._renderChannelList();
    } catch (e) {
      console.error('[Chat] Erro ao carregar canais:', e);
      if (list) list.innerHTML = '<div style="padding:20px;text-align:center;font-size:0.78rem;color:var(--color-danger);">Erro ao carregar canais</div>';
    }
  },

  _renderChannelList() {
    const list = document.getElementById('chatChannelList');
    if (!list) return;

    let html = '';

    // Organizar canais por secao
    const channelsBySection = {};
    const unsectioned = [];

    this._channels.forEach(ch => {
      if (ch.section_id && this._sections.find(s => s.id === ch.section_id)) {
        if (!channelsBySection[ch.section_id]) channelsBySection[ch.section_id] = [];
        channelsBySection[ch.section_id].push(ch);
      } else {
        unsectioned.push(ch);
      }
    });

    // Renderizar secoes
    this._sections.forEach(section => {
      const sectionChannels = channelsBySection[section.id] || [];
      const isCollapsed = this._collapsedSections[section.id];
      html += `
        <div class="chat-section">
          <div class="chat-section-header" data-section-id="${section.id}">
            <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" style="width:12px;height:12px;opacity:0.5;"></i>
            <span class="chat-section-name">${this._esc(section.name)}</span>
            <span class="chat-section-count">${sectionChannels.length}</span>
          </div>
          ${!isCollapsed ? `<div class="chat-section-channels">${sectionChannels.map(ch => this._renderChannelItem(ch)).join('')}</div>` : ''}
        </div>
      `;
    });

    // Canais sem secao
    if (unsectioned.length) {
      if (this._sections.length) {
        html += '<div class="chat-section"><div class="chat-section-header-plain">Outros</div>';
      }
      html += unsectioned.map(ch => this._renderChannelItem(ch)).join('');
      if (this._sections.length) html += '</div>';
    }

    // DMs em secao separada
    const dms = this._channels.filter(ch => ch.type === 'direct');
    if (dms.length) {
      html += `<div class="chat-section">
        <div class="chat-section-header-plain" style="margin-top:8px;">
          <i data-lucide="message-square" style="width:12px;height:12px;opacity:0.5;"></i>
          Mensagens Diretas
        </div>
        ${dms.map(ch => this._renderChannelItem(ch)).join('')}
      </div>`;
    }

    list.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Bind: section toggle
    list.querySelectorAll('.chat-section-header[data-section-id]').forEach(el => {
      el.addEventListener('click', () => this._toggleSection(el.dataset.sectionId));
    });

    // Bind: channel click
    list.querySelectorAll('.chat-channel-item').forEach(item => {
      item.addEventListener('click', () => {
        const ch = this._channels.find(c => c.id === item.dataset.channelId);
        if (ch) this._selectChannel(ch);
      });
    });
  },

  _renderChannelItem(ch) {
    const isActive = this._activeChannel?.id === ch.id;
    const typeIcon = ch.type === 'direct' ? 'user' : 'hash';
    const unread = this._unreadCounts[ch.id] || 0;
    return `
      <div class="chat-channel-item ${isActive ? 'active' : ''} ${unread > 0 ? 'has-unread' : ''}" data-channel-id="${ch.id}">
        <i data-lucide="${typeIcon}" style="width:14px;height:14px;flex-shrink:0;opacity:0.5;"></i>
        <span class="chat-channel-item-name">${this._esc(ch.name)}</span>
        ${unread > 0 ? `<span class="chat-unread-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
      </div>
    `;
  },

  _filterChannels(query) {
    const q = query.toLowerCase().trim();
    const items = document.querySelectorAll('.chat-channel-item');
    items.forEach(item => {
      const name = item.querySelector('.chat-channel-item-name')?.textContent?.toLowerCase() || '';
      item.style.display = !q || name.includes(q) ? '' : 'none';
    });
  },

  // ══════════════════════════════════════════════════════════════════
  // SELECT CHANNEL
  // ══════════════════════════════════════════════════════════════════
  async _selectChannel(channel) {
    // Limpar subscriptions anteriores
    if (this._subscription) { this._subscription.unsubscribe(); this._subscription = null; }
    if (this._presenceChannel) { this._presenceChannel.unsubscribe(); this._presenceChannel = null; }

    this._activeChannel = channel;
    this._messages = [];
    this._messageOffset = 0;
    this._allLoaded = false;
    this._reactions = {};
    this._pendingFiles = [];

    // Atualizar UI
    document.getElementById('chatEmptyState').style.display = 'none';
    document.getElementById('chatChannelHeader').style.display = 'flex';
    document.getElementById('chatMessagesArea').style.display = 'flex';
    document.getElementById('chatInputArea').style.display = 'flex';
    document.getElementById('chatChannelName').textContent = (channel.type === 'direct' ? '' : '# ') + channel.name;
    document.getElementById('chatChannelDesc').textContent = channel.description || '';

    // Mobile
    if (window.innerWidth <= 768) {
      document.getElementById('chatBackBtn').style.display = 'block';
      document.getElementById('chatSidebar').classList.add('chat-sidebar-hidden');
    }

    this._renderChannelList();
    await this._loadChannelMembers(channel.id);
    await this._loadMessages(channel.id);
    await this._loadReactionsForChannel(channel.id);

    this._subscribeToChannel(channel.id);
    this._initPresence(channel.id);
    document.getElementById('chatInput')?.focus();

    // Scroll listener para carregar mensagens antigas (re-bind pois o elemento muda)
    const scroll = document.getElementById('chatMessagesScroll');
    if (scroll) {
      scroll.addEventListener('scroll', () => {
        if (scroll.scrollTop < 50 && !this._loadingMore && !this._allLoaded) {
          this._loadOlderMessages();
        }
      });
    }
  },

  async _loadChannelMembers(channelId) {
    const client = this._getClient();
    if (!client) return;
    try {
      const { data, error } = await client
        .from('chat_channel_members')
        .select('user_id, role')
        .eq('channel_id', channelId);
      if (error) throw error;

      const memberCount = document.getElementById('chatMembersCount');
      if (memberCount) memberCount.textContent = data?.length || 0;

      // Carregar perfis
      if (data?.length) {
        const { data: users } = await client
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', data.map(m => m.user_id));

        if (users) {
          users.forEach(u => {
            this._members[u.id] = { name: u.full_name || u.email?.split('@')[0], email: u.email, avatar: u.avatar_url, role: data.find(m => m.user_id === u.id)?.role || 'member' };
          });
        }

        // Fallback
        data.forEach(m => {
          if (!this._members[m.user_id]) {
            this._members[m.user_id] = { name: 'Usuario', email: '', role: m.role };
          }
        });
      }
    } catch (e) { console.warn('[Chat] Erro ao carregar membros:', e.message); }
  },

  // ══════════════════════════════════════════════════════════════════
  // MEMBERS MODAL
  // ══════════════════════════════════════════════════════════════════
  _showMembersModal() {
    if (!this._activeChannel) return;
    const modal = document.getElementById('chatMembersModal');
    const content = document.getElementById('chatMembersModalContent');
    if (!modal || !content) return;

    const channelMembers = Object.entries(this._members).filter(([uid]) => {
      return true; // Ja filtramos na loadChannelMembers
    });

    content.innerHTML = `
      <div class="chat-modal-header">
        <h4 style="margin:0;">Membros do #${this._esc(this._activeChannel.name)}</h4>
        <button class="chat-icon-btn" onclick="document.getElementById('chatMembersModal').style.display='none'">
          <i data-lucide="x" style="width:16px;height:16px;"></i>
        </button>
      </div>

      <!-- Adicionar membro -->
      <div style="margin-bottom:16px;">
        <div style="font-size:0.78rem;font-weight:600;margin-bottom:8px;">Adicionar membro</div>
        <div style="display:flex;gap:8px;">
          <select class="chat-form-input" id="chatAddMemberSelect" style="flex:1;">
            <option value="">Selecionar usuario...</option>
            ${this._allUsers.filter(u => !this._members[u.id]?.role).map(u => `<option value="${u.id}">${this._esc(u.name)} (${this._esc(u.email || '')})</option>`).join('')}
          </select>
          <button class="btn btn-primary btn-sm" id="chatAddMemberBtn">Adicionar</button>
        </div>
      </div>

      <!-- Lista de membros -->
      <div class="chat-members-list" id="chatMembersList">
        ${this._renderMembersList()}
      </div>
    `;

    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons();

    this._on('chatAddMemberBtn', 'click', () => this._addMember());
  },

  _renderMembersList() {
    const client = this._getClient();
    // Pegar membros do canal ativo
    let html = '';
    Object.entries(this._members).forEach(([uid, m]) => {
      if (!m.role) return;
      const isOwn = uid === this._currentUser?.id;
      const color = this._getUserColor(uid);
      const initials = this._getInitials(m.name);
      html += `
        <div class="chat-member-item">
          <div class="chat-member-avatar" style="background:${color}20;color:${color};">${initials}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:0.82rem;">${this._esc(m.name)} ${isOwn ? '<span style="opacity:0.5;font-weight:400;">(voce)</span>' : ''}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">${this._esc(m.email || '')}</div>
          </div>
          <span class="chat-member-role">${m.role === 'admin' ? 'Admin' : 'Membro'}</span>
          ${!isOwn ? `<button class="chat-icon-btn chat-remove-member" data-user-id="${uid}" title="Remover"><i data-lucide="user-minus" style="width:14px;height:14px;color:var(--color-danger);"></i></button>` : ''}
        </div>
      `;
    });
    return html;
  },

  async _addMember() {
    const select = document.getElementById('chatAddMemberSelect');
    const userId = select?.value;
    if (!userId || !this._activeChannel) { TBO_TOAST.warning('Selecione um usuario'); return; }

    const client = this._getClient();
    if (!client) return;

    try {
      const { error } = await client.from('chat_channel_members').insert({
        channel_id: this._activeChannel.id, user_id: userId, role: 'member'
      });
      if (error) throw error;
      TBO_TOAST.success('Membro adicionado!');
      await this._loadChannelMembers(this._activeChannel.id);
      this._showMembersModal(); // Re-render
    } catch (e) { TBO_TOAST.error('Erro', e.message); }
  },

  async _removeMember(userId) {
    if (!this._activeChannel) return;
    const client = this._getClient();
    if (!client) return;
    try {
      const { error } = await client.from('chat_channel_members')
        .delete()
        .eq('channel_id', this._activeChannel.id)
        .eq('user_id', userId);
      if (error) throw error;
      delete this._members[userId];
      TBO_TOAST.success('Membro removido');
      await this._loadChannelMembers(this._activeChannel.id);
      this._showMembersModal();
    } catch (e) { TBO_TOAST.error('Erro', e.message); }
  },

  // ══════════════════════════════════════════════════════════════════
  // MESSAGES
  // ══════════════════════════════════════════════════════════════════
  async _loadMessages(channelId) {
    const client = this._getClient();
    const list = document.getElementById('chatMessagesList');
    if (!client || !list) return;

    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.78rem;"><div class="chat-spinner"></div>Carregando...</div>';

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

      const scroll = document.getElementById('chatMessagesScroll');
      if (scroll) scroll.scrollTop = scroll.scrollHeight;

      this._markAsRead(channelId);

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
        if (scroll) scroll.scrollTop = scroll.scrollHeight - prevHeight;
      }

      const loadMore = document.getElementById('chatLoadMore');
      if (loadMore) loadMore.style.display = this._allLoaded ? 'none' : 'block';
    } catch (e) { console.error('[Chat] Erro ao carregar mais:', e); }
    this._loadingMore = false;
  },

  // ══════════════════════════════════════════════════════════════════
  // RENDER MESSAGES
  // ══════════════════════════════════════════════════════════════════
  _renderMessages() {
    const list = document.getElementById('chatMessagesList');
    if (!list) return;

    if (!this._messages.length) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:0.82rem;"><div style="font-size:2rem;margin-bottom:8px;">💬</div>Nenhuma mensagem ainda. Comece a conversa!</div>';
      return;
    }

    let html = '';
    let lastSender = null;
    let lastDate = '';

    this._messages.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleDateString('pt-BR');
      if (date !== lastDate) {
        html += `<div class="chat-date-separator"><span>${date === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : date}</span></div>`;
        lastDate = date;
        lastSender = null;
      }

      const isOwn = msg.sender_id === this._currentUser?.id;
      const isSameAuthor = msg.sender_id === lastSender;
      const msgType = msg.message_type || 'text';

      // Mensagem de sistema
      if (msgType === 'system') {
        html += `<div class="chat-system-message"><span>${this._esc(msg.content)}</span></div>`;
        lastSender = null;
        return;
      }

      const name = this._getUserName(msg.sender_id);
      const initials = this._getInitials(name);
      const color = this._getUserColor(msg.sender_id);
      const time = this._formatTime(msg.created_at);

      // Processar conteudo
      let contentHtml = this._processMessageContent(msg);

      // Reacoes
      const reactionsHtml = this._renderReactions(msg.id);

      html += `
        <div class="chat-message ${isOwn ? 'chat-message-own' : ''} ${isSameAuthor ? 'chat-message-grouped' : ''}" data-msg-id="${msg.id}">
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
            <div class="chat-message-content">${contentHtml}</div>
            ${reactionsHtml}
            <!-- Hover actions -->
            <div class="chat-message-actions">
              ${this._quickReactions.map(e => `<button class="chat-reaction-btn" data-msg-id="${msg.id}" data-emoji="${e}" title="${e}">${e}</button>`).join('')}
              ${isOwn ? `<button class="chat-reaction-btn chat-delete-msg" data-msg-id="${msg.id}" title="Apagar"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>` : ''}
            </div>
          </div>
        </div>
      `;
      lastSender = msg.sender_id;
    });

    list.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Bind: reaction buttons
    list.querySelectorAll('.chat-reaction-btn[data-emoji]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleReaction(btn.dataset.msgId, btn.dataset.emoji);
      });
    });

    // Bind: existing reaction chips
    list.querySelectorAll('.chat-reaction-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleReaction(chip.dataset.msgId, chip.dataset.emoji);
      });
    });

    // Bind: delete
    list.querySelectorAll('.chat-delete-msg').forEach(btn => {
      btn.addEventListener('click', () => this._deleteMessage(btn.dataset.msgId));
    });

    // Bind: poll votes
    list.querySelectorAll('.chat-poll-option-btn').forEach(btn => {
      btn.addEventListener('click', () => this._voteOnPoll(btn.dataset.pollId, btn.dataset.optionId));
    });
  },

  _processMessageContent(msg) {
    const msgType = msg.message_type || 'text';
    let content = '';

    // Texto com markdown basico e mencoes
    if (msgType === 'text' || msgType === 'image' || msgType === 'file') {
      content = this._esc(msg.content)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

      // Processar @mencoes
      content = content.replace(/@(\w+(?:\s\w+)?)/g, (match, name) => {
        const user = this._allUsers.find(u => u.name.toLowerCase().startsWith(name.toLowerCase()));
        if (user) return `<span class="chat-mention">@${this._esc(user.name)}</span>`;
        return match;
      });
    }

    // Attachments
    if (msgType === 'image' || msgType === 'file') {
      const meta = msg.metadata || {};
      const attachments = meta.attachments || [];
      attachments.forEach(att => {
        if (att.file_type?.startsWith('image/')) {
          content += `<div class="chat-attachment-image"><img src="${this._esc(att.file_url)}" alt="${this._esc(att.file_name)}" loading="lazy" onclick="window.open('${this._esc(att.file_url)}','_blank')"></div>`;
        } else {
          content += `
            <div class="chat-attachment-file">
              <i data-lucide="file" style="width:20px;height:20px;color:var(--accent);"></i>
              <div>
                <a href="${this._esc(att.file_url)}" target="_blank" class="chat-attachment-name">${this._esc(att.file_name)}</a>
                <div class="chat-attachment-size">${this._formatFileSize(att.file_size || 0)}</div>
              </div>
            </div>
          `;
        }
      });
    }

    // Poll
    if (msgType === 'poll') {
      const meta = msg.metadata || {};
      content += this._renderPollInMessage(meta);
    }

    return content;
  },

  // ══════════════════════════════════════════════════════════════════
  // REACTIONS
  // ══════════════════════════════════════════════════════════════════
  async _loadReactionsForChannel(channelId) {
    const client = this._getClient();
    if (!client) return;
    try {
      const msgIds = this._messages.map(m => m.id);
      if (!msgIds.length) return;
      const { data } = await client
        .from('chat_reactions')
        .select('*')
        .in('message_id', msgIds);

      this._reactions = {};
      (data || []).forEach(r => {
        if (!this._reactions[r.message_id]) this._reactions[r.message_id] = [];
        this._reactions[r.message_id].push(r);
      });
    } catch (e) { console.warn('[Chat] Erro ao carregar reacoes:', e.message); }
  },

  _renderReactions(msgId) {
    const reactions = this._reactions[msgId] || [];
    if (!reactions.length) return '';

    // Agrupar por emoji
    const grouped = {};
    reactions.forEach(r => {
      if (!grouped[r.emoji]) grouped[r.emoji] = [];
      grouped[r.emoji].push(r.user_id);
    });

    let html = '<div class="chat-reactions-row">';
    Object.entries(grouped).forEach(([emoji, userIds]) => {
      const isOwn = userIds.includes(this._currentUser?.id);
      const names = userIds.map(uid => this._getUserName(uid)).join(', ');
      html += `<button class="chat-reaction-chip ${isOwn ? 'active' : ''}" data-msg-id="${msgId}" data-emoji="${emoji}" title="${names}">${emoji} <span>${userIds.length}</span></button>`;
    });
    html += '</div>';
    return html;
  },

  async _toggleReaction(msgId, emoji) {
    const client = this._getClient();
    const user = this._currentUser;
    if (!client || !user || !msgId || !emoji) return;

    try {
      // Verificar se ja reagiu
      const existing = (this._reactions[msgId] || []).find(r => r.user_id === user.id && r.emoji === emoji);
      if (existing) {
        await client.from('chat_reactions').delete().eq('id', existing.id);
        this._reactions[msgId] = (this._reactions[msgId] || []).filter(r => r.id !== existing.id);
      } else {
        const { data, error } = await client.from('chat_reactions').insert({
          message_id: msgId, user_id: user.id, emoji
        }).select().single();
        if (error) throw error;
        if (!this._reactions[msgId]) this._reactions[msgId] = [];
        this._reactions[msgId].push(data);
      }
      this._renderMessages();
    } catch (e) { console.warn('[Chat] Erro ao reagir:', e.message); }
  },

  // ══════════════════════════════════════════════════════════════════
  // EMOJI PICKER
  // ══════════════════════════════════════════════════════════════════
  _toggleEmojiPicker() {
    const picker = document.getElementById('chatEmojiPicker');
    if (!picker) return;
    const isVisible = picker.style.display !== 'none';
    // Fechar sticker picker
    const sp = document.getElementById('chatStickerPicker');
    if (sp) sp.style.display = 'none';

    if (isVisible) { picker.style.display = 'none'; return; }

    let html = '<div class="chat-picker-tabs">';
    const cats = Object.keys(this._emojiCategories);
    cats.forEach((cat, i) => {
      html += `<button class="chat-picker-tab ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`;
    });
    html += '</div><div class="chat-picker-grid" id="chatEmojiGrid">';
    // Mostrar primeira categoria
    this._emojiCategories[cats[0]].forEach(e => {
      html += `<button class="chat-emoji-item" data-emoji="${e}">${e}</button>`;
    });
    html += '</div>';

    picker.innerHTML = html;
    picker.style.display = 'block';

    // Bind tabs
    picker.querySelectorAll('.chat-picker-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        picker.querySelectorAll('.chat-picker-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const grid = document.getElementById('chatEmojiGrid');
        if (grid) {
          grid.innerHTML = this._emojiCategories[tab.dataset.cat].map(e => `<button class="chat-emoji-item" data-emoji="${e}">${e}</button>`).join('');
          grid.querySelectorAll('.chat-emoji-item').forEach(item => {
            item.addEventListener('click', () => this._insertEmoji(item.dataset.emoji));
          });
        }
      });
    });

    // Bind emoji click
    picker.querySelectorAll('.chat-emoji-item').forEach(item => {
      item.addEventListener('click', () => this._insertEmoji(item.dataset.emoji));
    });
  },

  _insertEmoji(emoji) {
    const input = document.getElementById('chatInput');
    if (!input || !emoji) return;
    const pos = input.selectionStart || input.value.length;
    input.value = input.value.slice(0, pos) + emoji + input.value.slice(pos);
    input.focus();
    input.selectionStart = input.selectionEnd = pos + emoji.length;
    document.getElementById('chatEmojiPicker').style.display = 'none';
  },

  // ══════════════════════════════════════════════════════════════════
  // STICKER PICKER
  // ══════════════════════════════════════════════════════════════════
  _toggleStickerPicker() {
    const picker = document.getElementById('chatStickerPicker');
    if (!picker) return;
    const isVisible = picker.style.display !== 'none';
    const ep = document.getElementById('chatEmojiPicker');
    if (ep) ep.style.display = 'none';

    if (isVisible) { picker.style.display = 'none'; return; }

    let html = '';
    Object.entries(this._stickerPacks).forEach(([pack, stickers]) => {
      html += `<div class="chat-sticker-pack-name">${this._esc(pack)}</div><div class="chat-sticker-grid">`;
      stickers.forEach(s => {
        html += `<button class="chat-sticker-item" data-emoji="${s.emoji}" title="${s.label}"><span style="font-size:1.8rem;">${s.emoji}</span><span class="chat-sticker-label">${this._esc(s.label)}</span></button>`;
      });
      html += '</div>';
    });

    picker.innerHTML = html;
    picker.style.display = 'block';

    picker.querySelectorAll('.chat-sticker-item').forEach(item => {
      item.addEventListener('click', () => {
        this._sendSticker(item.dataset.emoji);
        picker.style.display = 'none';
      });
    });
  },

  async _sendSticker(emoji) {
    if (!emoji || !this._activeChannel) return;
    const client = this._getClient();
    const user = this._currentUser;
    if (!client || !user) return;

    try {
      const { data, error } = await client.from('chat_messages').insert({
        channel_id: this._activeChannel.id,
        sender_id: user.id,
        content: emoji,
        message_type: 'text'
      }).select().single();

      if (error) throw error;
      if (data && !this._messages.find(m => m.id === data.id)) {
        this._messages.push(data);
        this._renderMessages();
        const scroll = document.getElementById('chatMessagesScroll');
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      }
    } catch (e) { TBO_TOAST.error('Erro ao enviar', e.message); }
  },

  // ══════════════════════════════════════════════════════════════════
  // MENTIONS (@)
  // ══════════════════════════════════════════════════════════════════
  _insertMentionTrigger() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const pos = input.selectionStart || input.value.length;
    const before = input.value.slice(0, pos);
    const after = input.value.slice(pos);
    // Inserir @ e mostrar suggestions
    input.value = before + '@' + after;
    input.focus();
    input.selectionStart = input.selectionEnd = pos + 1;
    this._mentionStartPos = pos + 1;
    this._showMentionSuggestions = true;
    this._mentionQuery = '';
    this._renderMentionSuggestions();
  },

  _checkMentionTrigger(input) {
    const pos = input.selectionStart;
    const text = input.value;

    // Buscar ultimo @ antes do cursor
    let atPos = -1;
    for (let i = pos - 1; i >= 0; i--) {
      if (text[i] === '@') { atPos = i; break; }
      if (text[i] === ' ' && i < pos - 1) break;
    }

    if (atPos >= 0 && (atPos === 0 || text[atPos - 1] === ' ' || text[atPos - 1] === '\n')) {
      this._mentionStartPos = atPos + 1;
      this._mentionQuery = text.slice(atPos + 1, pos).toLowerCase();
      this._showMentionSuggestions = true;
      this._renderMentionSuggestions();
    } else {
      this._hideMentionSuggestions();
    }
  },

  _renderMentionSuggestions() {
    const el = document.getElementById('chatMentionSuggestions');
    if (!el) return;

    const q = this._mentionQuery;
    const filtered = this._allUsers.filter(u =>
      u.name.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    ).slice(0, 8);

    if (!filtered.length) { el.style.display = 'none'; return; }

    el.innerHTML = filtered.map((u, i) => {
      const color = this._getUserColor(u.id);
      const initials = this._getInitials(u.name);
      return `<div class="chat-mention-item ${i === 0 ? 'active' : ''}" data-user-id="${u.id}" data-user-name="${this._esc(u.name)}">
        <div class="chat-mention-avatar" style="background:${color}20;color:${color};">${initials}</div>
        <div>
          <div style="font-weight:600;font-size:0.8rem;">${this._esc(u.name)}</div>
          <div style="font-size:0.68rem;color:var(--text-muted);">${this._esc(u.email || '')}</div>
        </div>
      </div>`;
    }).join('');
    el.style.display = 'block';

    // Bind clicks
    el.querySelectorAll('.chat-mention-item').forEach(item => {
      item.addEventListener('click', () => this._selectMention(item.dataset.userId));
    });
  },

  _navigateMentionSuggestion(dir) {
    const items = document.querySelectorAll('.chat-mention-item');
    if (!items.length) return;
    let activeIdx = -1;
    items.forEach((item, i) => { if (item.classList.contains('active')) activeIdx = i; });
    items.forEach(item => item.classList.remove('active'));
    let newIdx = activeIdx + dir;
    if (newIdx < 0) newIdx = items.length - 1;
    if (newIdx >= items.length) newIdx = 0;
    items[newIdx].classList.add('active');
    items[newIdx].scrollIntoView({ block: 'nearest' });
  },

  _selectMention(userId) {
    const user = this._allUsers.find(u => u.id === userId);
    if (!user) return;

    const input = document.getElementById('chatInput');
    if (!input) return;

    const text = input.value;
    const before = text.slice(0, this._mentionStartPos - 1); // Antes do @
    const after = text.slice(input.selectionStart);
    input.value = before + '@' + user.name + ' ' + after;
    input.focus();
    input.selectionStart = input.selectionEnd = before.length + user.name.length + 2;
    this._hideMentionSuggestions();
  },

  _hideMentionSuggestions() {
    this._showMentionSuggestions = false;
    const el = document.getElementById('chatMentionSuggestions');
    if (el) el.style.display = 'none';
  },

  // ══════════════════════════════════════════════════════════════════
  // FILE UPLOAD
  // ══════════════════════════════════════════════════════════════════
  _pendingFiles: [],

  _handleFileSelect(e) {
    const files = e.target.files;
    if (!files?.length) return;

    this._pendingFiles = [...files];
    const preview = document.getElementById('chatAttachPreview');
    if (!preview) return;

    let html = '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
    this._pendingFiles.forEach((f, i) => {
      const isImage = f.type.startsWith('image/');
      html += `
        <div class="chat-file-preview-item">
          ${isImage ? `<img src="${URL.createObjectURL(f)}" class="chat-file-thumb">` : `<i data-lucide="file" style="width:24px;height:24px;color:var(--accent);"></i>`}
          <div style="min-width:0;">
            <div style="font-size:0.72rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px;">${this._esc(f.name)}</div>
            <div style="font-size:0.62rem;color:var(--text-muted);">${this._formatFileSize(f.size)}</div>
          </div>
          <button class="chat-icon-btn" data-remove-file="${i}" style="margin-left:4px;"><i data-lucide="x" style="width:12px;height:12px;"></i></button>
        </div>
      `;
    });
    html += '</div>';
    preview.innerHTML = html;
    preview.style.display = 'block';
    if (window.lucide) lucide.createIcons();

    // Bind remove
    preview.querySelectorAll('[data-remove-file]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.removeFile);
        this._pendingFiles.splice(idx, 1);
        if (this._pendingFiles.length === 0) {
          preview.style.display = 'none';
          preview.innerHTML = '';
        } else {
          this._handleFileSelect({ target: { files: this._pendingFiles } });
        }
      });
    });

    // Reset input
    e.target.value = '';
  },

  async _uploadFiles() {
    if (!this._pendingFiles.length) return [];
    const client = this._getClient();
    if (!client) return [];

    const uploads = [];
    for (const file of this._pendingFiles) {
      try {
        const ext = file.name.split('.').pop();
        const path = `${this._activeChannel.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await client.storage.from('chat-files').upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
        if (error) throw error;

        const { data: urlData } = client.storage.from('chat-files').getPublicUrl(path);
        uploads.push({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: urlData.publicUrl,
          thumbnail_url: file.type.startsWith('image/') ? urlData.publicUrl : null
        });
      } catch (e) {
        console.error('[Chat] Erro ao fazer upload:', e);
        TBO_TOAST.error('Erro no upload', `${file.name}: ${e.message}`);
      }
    }

    this._pendingFiles = [];
    const preview = document.getElementById('chatAttachPreview');
    if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; }

    return uploads;
  },

  // ══════════════════════════════════════════════════════════════════
  // POLLS (Enquetes)
  // ══════════════════════════════════════════════════════════════════
  _showPollModal() {
    if (!this._activeChannel) return;
    const modal = document.getElementById('chatPollModal');
    const content = document.getElementById('chatPollModalContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="chat-modal-header">
        <h4 style="margin:0;">Criar Enquete</h4>
        <button class="chat-icon-btn" onclick="document.getElementById('chatPollModal').style.display='none'">
          <i data-lucide="x" style="width:16px;height:16px;"></i>
        </button>
      </div>
      <input type="text" class="chat-form-input" id="chatPollQuestion" placeholder="Pergunta da enquete">
      <div id="chatPollOptions" style="margin-top:12px;">
        <input type="text" class="chat-form-input chat-poll-option" placeholder="Opcao 1" style="margin-bottom:8px;">
        <input type="text" class="chat-form-input chat-poll-option" placeholder="Opcao 2" style="margin-bottom:8px;">
      </div>
      <button class="chat-link-btn" id="chatAddPollOption" style="margin-bottom:12px;">+ Adicionar opcao</button>
      <div style="display:flex;gap:12px;margin-bottom:16px;">
        <label class="chat-checkbox-label"><input type="checkbox" id="chatPollMultiple"> Multipla escolha</label>
        <label class="chat-checkbox-label"><input type="checkbox" id="chatPollAnon"> Anonima</label>
      </div>
      <button class="btn btn-primary" style="width:100%;" id="chatCreatePollBtn">Criar Enquete</button>
    `;

    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
    document.getElementById('chatPollQuestion')?.focus();

    this._on('chatAddPollOption', 'click', () => {
      const container = document.getElementById('chatPollOptions');
      if (!container) return;
      const count = container.querySelectorAll('.chat-poll-option').length;
      if (count >= 10) return;
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'chat-form-input chat-poll-option';
      inp.placeholder = `Opcao ${count + 1}`;
      inp.style.marginBottom = '8px';
      container.appendChild(inp);
    });

    this._on('chatCreatePollBtn', 'click', () => this._createPoll());
  },

  async _createPoll() {
    const question = document.getElementById('chatPollQuestion')?.value?.trim();
    if (!question) { TBO_TOAST.warning('Digite a pergunta'); return; }

    const optionEls = document.querySelectorAll('.chat-poll-option');
    const options = [];
    optionEls.forEach(el => {
      const v = el.value.trim();
      if (v) options.push(v);
    });
    if (options.length < 2) { TBO_TOAST.warning('Minimo 2 opcoes'); return; }

    const allowsMultiple = document.getElementById('chatPollMultiple')?.checked || false;
    const isAnonymous = document.getElementById('chatPollAnon')?.checked || false;

    const client = this._getClient();
    const user = this._currentUser;
    if (!client || !user || !this._activeChannel) return;

    try {
      // Criar mensagem tipo poll
      const { data: msg, error: msgErr } = await client.from('chat_messages').insert({
        channel_id: this._activeChannel.id,
        sender_id: user.id,
        content: `📊 Enquete: ${question}`,
        message_type: 'poll',
        metadata: {
          poll_question: question,
          poll_options: options.map((opt, i) => ({ text: opt, sort_order: i })),
          allows_multiple: allowsMultiple,
          is_anonymous: isAnonymous,
          votes: {}
        }
      }).select().single();

      if (msgErr) throw msgErr;

      // Criar poll no banco
      const { data: poll, error: pollErr } = await client.from('chat_polls').insert({
        message_id: msg.id, question, allows_multiple: allowsMultiple, is_anonymous: isAnonymous
      }).select().single();

      if (pollErr) throw pollErr;

      // Criar opcoes
      const optionInserts = options.map((text, i) => ({
        poll_id: poll.id, text, sort_order: i
      }));
      const { data: pollOpts, error: optErr } = await client.from('chat_poll_options').insert(optionInserts).select();
      if (optErr) throw optErr;

      // Atualizar metadata com IDs reais
      const updatedMeta = {
        poll_id: poll.id,
        poll_question: question,
        poll_options: pollOpts.map(o => ({ id: o.id, text: o.text, sort_order: o.sort_order })),
        allows_multiple: allowsMultiple,
        is_anonymous: isAnonymous,
        votes: {}
      };
      await client.from('chat_messages').update({ metadata: updatedMeta }).eq('id', msg.id);
      msg.metadata = updatedMeta;

      // Fechar modal e adicionar mensagem
      document.getElementById('chatPollModal').style.display = 'none';
      if (!this._messages.find(m => m.id === msg.id)) {
        this._messages.push(msg);
        this._renderMessages();
        const scroll = document.getElementById('chatMessagesScroll');
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      }
      TBO_TOAST.success('Enquete criada!');
    } catch (e) { TBO_TOAST.error('Erro ao criar enquete', e.message); }
  },

  _renderPollInMessage(meta) {
    if (!meta.poll_question) return '';
    const options = meta.poll_options || [];
    const votes = meta.votes || {};
    const pollId = meta.poll_id;
    const totalVotes = Object.values(votes).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

    let html = `<div class="chat-poll">
      <div class="chat-poll-question">📊 ${this._esc(meta.poll_question)}</div>
      <div class="chat-poll-options">`;

    options.forEach(opt => {
      const optVotes = votes[opt.id] || [];
      const count = optVotes.length;
      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      const hasVoted = optVotes.includes(this._currentUser?.id);
      html += `
        <button class="chat-poll-option-btn ${hasVoted ? 'voted' : ''}" data-poll-id="${pollId}" data-option-id="${opt.id}">
          <div class="chat-poll-option-bar" style="width:${pct}%"></div>
          <span class="chat-poll-option-text">${this._esc(opt.text)}</span>
          <span class="chat-poll-option-count">${count} (${pct}%)</span>
        </button>
      `;
    });

    html += `</div><div class="chat-poll-total">${totalVotes} voto${totalVotes !== 1 ? 's' : ''} ${meta.is_anonymous ? '• Anonima' : ''} ${meta.allows_multiple ? '• Multipla escolha' : ''}</div></div>`;
    return html;
  },

  async _voteOnPoll(pollId, optionId) {
    const client = this._getClient();
    const user = this._currentUser;
    if (!client || !user || !pollId || !optionId) return;

    try {
      // Verificar se ja votou nesta opcao
      const { data: existing } = await client.from('chat_poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('option_id', optionId)
        .eq('user_id', user.id);

      if (existing?.length) {
        // Remover voto
        await client.from('chat_poll_votes').delete()
          .eq('poll_id', pollId)
          .eq('option_id', optionId)
          .eq('user_id', user.id);
      } else {
        // Adicionar voto
        await client.from('chat_poll_votes').insert({
          poll_id: pollId, option_id: optionId, user_id: user.id
        });
      }

      // Recarregar votos e atualizar metadata
      const { data: allVotes } = await client.from('chat_poll_votes')
        .select('option_id, user_id')
        .eq('poll_id', pollId);

      const voteMap = {};
      (allVotes || []).forEach(v => {
        if (!voteMap[v.option_id]) voteMap[v.option_id] = [];
        voteMap[v.option_id].push(v.user_id);
      });

      // Atualizar metadata da mensagem localmente
      const msg = this._messages.find(m => m.metadata?.poll_id === pollId);
      if (msg) {
        msg.metadata.votes = voteMap;
        // Atualizar no banco tambem
        await client.from('chat_messages').update({ metadata: msg.metadata }).eq('id', msg.id);
        this._renderMessages();
      }
    } catch (e) { TBO_TOAST.error('Erro ao votar', e.message); }
  },

  // ══════════════════════════════════════════════════════════════════
  // SEND MESSAGE (com suporte a attachments)
  // ══════════════════════════════════════════════════════════════════
  async _sendMessage() {
    const input = document.getElementById('chatInput');
    const content = input?.value?.trim();
    const hasFiles = this._pendingFiles?.length > 0;

    if (!content && !hasFiles) return;
    if (!this._activeChannel) return;

    const client = this._getClient();
    const user = this._currentUser;
    if (!client || !user) return;

    // Limpar input
    if (input) { input.value = ''; input.style.height = 'auto'; }

    try {
      let messageType = 'text';
      let metadata = {};

      // Upload de arquivos
      if (hasFiles) {
        const uploads = await this._uploadFiles();
        if (uploads.length) {
          const hasImage = uploads.some(u => u.file_type.startsWith('image/'));
          messageType = hasImage ? 'image' : 'file';
          metadata = { attachments: uploads };
        }
      }

      const { data, error } = await client.from('chat_messages').insert({
        channel_id: this._activeChannel.id,
        sender_id: user.id,
        content: content || (messageType !== 'text' ? '📎 Arquivo anexado' : ''),
        message_type: messageType,
        metadata
      }).select().single();

      if (error) {
        TBO_TOAST.error('Erro ao enviar', error.message);
        if (input && content) input.value = content;
        return;
      }

      // Salvar attachments na tabela
      if (metadata.attachments?.length && data) {
        for (const att of metadata.attachments) {
          await client.from('chat_attachments').insert({
            message_id: data.id,
            file_name: att.file_name,
            file_type: att.file_type,
            file_size: att.file_size,
            file_url: att.file_url,
            thumbnail_url: att.thumbnail_url
          });
        }
      }

      if (data && !this._messages.find(m => m.id === data.id)) {
        this._messages.push(data);
        this._renderMessages();
        const scroll = document.getElementById('chatMessagesScroll');
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      }
    } catch (e) {
      TBO_TOAST.error('Erro ao enviar', e.message);
      if (input && content) input.value = content;
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // DELETE MESSAGE
  // ══════════════════════════════════════════════════════════════════
  async _deleteMessage(msgId) {
    const client = this._getClient();
    if (!client || !msgId) return;
    try {
      await client.from('chat_messages').update({ deleted_at: new Date().toISOString() }).eq('id', msgId);
      this._messages = this._messages.filter(m => m.id !== msgId);
      this._renderMessages();
    } catch (e) { TBO_TOAST.error('Erro', e.message); }
  },

  // ══════════════════════════════════════════════════════════════════
  // NEW CHANNEL MODAL
  // ══════════════════════════════════════════════════════════════════
  _showNewChannelModal() {
    const modal = document.getElementById('chatNewChannelModal');
    const content = document.getElementById('chatNewChannelModalContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="chat-modal-header">
        <h4 style="margin:0;">Novo Canal</h4>
        <button class="chat-icon-btn" onclick="document.getElementById('chatNewChannelModal').style.display='none'">
          <i data-lucide="x" style="width:16px;height:16px;"></i>
        </button>
      </div>
      <input type="text" class="chat-form-input" id="chatChannelNameInput" placeholder="Nome do canal (ex: marketing)">
      <input type="text" class="chat-form-input" id="chatChannelDescInput" placeholder="Descricao (opcional)" style="margin-top:8px;">
      <div style="margin-top:12px;">
        <label style="font-size:0.78rem;font-weight:600;">Secao:</label>
        <select class="chat-form-input" id="chatChannelSectionSelect" style="margin-top:4px;">
          <option value="">Nenhuma</option>
          ${this._sections.map(s => `<option value="${s.id}">${this._esc(s.name)}</option>`).join('')}
        </select>
      </div>
      <div style="margin-top:12px;">
        <label style="font-size:0.78rem;font-weight:600;">Tipo:</label>
        <div style="display:flex;gap:8px;margin-top:6px;">
          <label class="chat-radio-label"><input type="radio" name="chatChType" value="channel" checked> Canal</label>
          <label class="chat-radio-label"><input type="radio" name="chatChType" value="group"> Grupo</label>
          <label class="chat-radio-label"><input type="radio" name="chatChType" value="direct"> DM</label>
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:16px;" id="chatCreateChannelBtn">Criar Canal</button>
    `;

    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
    document.getElementById('chatChannelNameInput')?.focus();

    this._on('chatCreateChannelBtn', 'click', () => this._createChannel());
  },

  async _createChannel() {
    const name = document.getElementById('chatChannelNameInput')?.value?.trim();
    if (!name) { TBO_TOAST.warning('Digite o nome do canal'); return; }

    const client = this._getClient();
    const tenantId = this._getTenantId();
    const user = this._currentUser;
    if (!client || !tenantId || !user) { TBO_TOAST.error('Erro', 'Nao conectado'); return; }

    const desc = document.getElementById('chatChannelDescInput')?.value?.trim() || '';
    const sectionId = document.getElementById('chatChannelSectionSelect')?.value || null;
    const type = document.querySelector('input[name="chatChType"]:checked')?.value || 'channel';

    try {
      const { data: channel, error: chErr } = await client
        .from('chat_channels')
        .insert({
          tenant_id: tenantId,
          name: name.toLowerCase().replace(/\s+/g, '-'),
          type,
          description: desc,
          created_by: user.id,
          section_id: sectionId || null
        })
        .select()
        .single();

      if (chErr) throw chErr;

      // Adicionar criador como admin
      await client.from('chat_channel_members').insert({ channel_id: channel.id, user_id: user.id, role: 'admin' });

      TBO_TOAST.success('Canal criado!', `#${channel.name}`);
      document.getElementById('chatNewChannelModal').style.display = 'none';

      await this._loadChannels();
      this._selectChannel(channel);
    } catch (e) { TBO_TOAST.error('Erro ao criar canal', e.message); }
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
            const isNearBottom = (scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight) < 100;
            if (isNearBottom) scroll.scrollTop = scroll.scrollHeight;
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        const updated = payload.new;
        const idx = this._messages.findIndex(m => m.id === updated.id);
        if (idx >= 0) {
          if (updated.deleted_at) {
            this._messages.splice(idx, 1);
          } else {
            this._messages[idx] = updated;
          }
          this._renderMessages();
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_reactions',
      }, async () => {
        // Recarregar reacoes ao receber qualquer mudanca
        if (this._activeChannel) {
          await this._loadReactionsForChannel(this._activeChannel.id);
          this._renderMessages();
        }
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
    if (users.length === 0) { el.style.display = 'none'; return; }
    el.style.display = 'flex';
    if (users.length === 1) text.textContent = `${users[0]} esta digitando...`;
    else if (users.length === 2) text.textContent = `${users[0]} e ${users[1]} estao digitando...`;
    else text.textContent = `${users.length} pessoas estao digitando...`;
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
      this._unreadCounts[channelId] = 0;
      this._renderChannelList();
    } catch (e) { /* silenciar */ }
  },

  _showSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    if (sidebar) sidebar.classList.remove('chat-sidebar-hidden');
  },

  // ══════════════════════════════════════════════════════════════════
  // CSS COMPLETO
  // ══════════════════════════════════════════════════════════════════
  _getScopedCSS() {
    return `
      .chat-module { height: calc(100vh - 120px); overflow: hidden; }
      .chat-layout { display: flex; height: 100%; border-radius: var(--radius-lg, 12px); border: 1px solid var(--border-subtle); overflow: hidden; background: var(--bg-primary); }

      /* ── Sidebar ── */
      .chat-sidebar { width: 280px; min-width: 280px; border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; background: var(--bg-secondary, var(--bg-elevated)); }
      .chat-sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); }
      .chat-sidebar-btn { width: 30px; height: 30px; border-radius: var(--radius-md, 8px); background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all 0.15s; }
      .chat-sidebar-btn:hover { background: var(--bg-elevated); color: var(--accent, #E85102); }
      .chat-sidebar-search { position: relative; padding: 8px 12px; }
      .chat-search-input { width: 100%; padding: 7px 12px 7px 32px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); font-size: 0.78rem; background: var(--bg-primary); color: var(--text-primary); outline: none; }
      .chat-search-input:focus { border-color: var(--accent, #E85102); }
      .chat-channel-list { flex: 1; overflow-y: auto; padding: 4px 8px; }

      /* ── Sections ── */
      .chat-section { margin-bottom: 4px; }
      .chat-section-header { display: flex; align-items: center; gap: 6px; padding: 6px 10px; cursor: pointer; border-radius: var(--radius-md, 8px); font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.15s; user-select: none; }
      .chat-section-header:hover { background: var(--bg-elevated); }
      .chat-section-name { flex: 1; }
      .chat-section-count { font-size: 0.6rem; opacity: 0.6; }
      .chat-section-header-plain { display: flex; align-items: center; gap: 6px; padding: 6px 10px; font-size: 0.68rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
      .chat-section-channels { }

      /* ── Channel Items ── */
      .chat-channel-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px 6px 20px; border-radius: var(--radius-md, 8px); cursor: pointer; font-size: 0.8rem; transition: background 0.15s; }
      .chat-channel-item:hover { background: var(--bg-elevated); }
      .chat-channel-item.active { background: var(--accent, #E85102)15; color: var(--accent, #E85102); font-weight: 600; }
      .chat-channel-item.has-unread .chat-channel-item-name { font-weight: 700; color: var(--text-primary); }
      .chat-channel-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .chat-unread-badge { background: var(--accent, #E85102); color: #fff; font-size: 0.58rem; font-weight: 700; padding: 1px 5px; border-radius: 10px; min-width: 16px; text-align: center; line-height: 1.4; }

      /* ── Main Area ── */
      .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
      .chat-empty-state { flex: 1; display: flex; align-items: center; justify-content: center; }
      .chat-channel-header { display: none; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-primary); gap: 12px; }
      .chat-channel-name { font-weight: 700; font-size: 0.92rem; }
      .chat-channel-desc { font-size: 0.7rem; color: var(--text-muted); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .chat-icon-btn { width: 32px; height: 32px; border-radius: var(--radius-md, 8px); background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all 0.15s; position: relative; }
      .chat-icon-btn:hover { background: var(--bg-elevated); color: var(--accent, #E85102); }
      .chat-header-badge { font-size: 0.62rem; font-weight: 700; color: var(--text-muted); }

      /* ── Messages ── */
      .chat-messages-area { flex: 1; display: none; flex-direction: column; overflow: hidden; }
      .chat-messages-scroll { flex: 1; overflow-y: auto; padding: 12px 16px; }
      .chat-messages-list { display: flex; flex-direction: column; gap: 1px; }
      .chat-date-separator { display: flex; align-items: center; gap: 12px; margin: 12px 0 6px; }
      .chat-date-separator::before, .chat-date-separator::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle); }
      .chat-date-separator span { font-size: 0.66rem; color: var(--text-muted); font-weight: 600; white-space: nowrap; }
      .chat-system-message { text-align: center; padding: 4px 0; font-size: 0.72rem; color: var(--text-muted); font-style: italic; }

      .chat-message { display: flex; gap: 10px; padding: 4px 8px; border-radius: var(--radius-md, 8px); position: relative; transition: background 0.15s; }
      .chat-message:hover { background: var(--bg-elevated); }
      .chat-message:hover .chat-message-actions { opacity: 1; pointer-events: auto; }
      .chat-message-grouped { padding-top: 0; }
      .chat-message-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; font-weight: 700; flex-shrink: 0; }
      .chat-message-avatar-spacer { width: 34px; flex-shrink: 0; }
      .chat-message-body { flex: 1; min-width: 0; }
      .chat-message-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 1px; }
      .chat-message-author { font-weight: 700; font-size: 0.8rem; }
      .chat-message-time { font-size: 0.6rem; color: var(--text-muted); }
      .chat-message-content { font-size: 0.82rem; line-height: 1.5; word-break: break-word; }
      .chat-message-content code { background: var(--bg-elevated); padding: 1px 4px; border-radius: 3px; font-size: 0.78rem; }

      /* ── Message Hover Actions ── */
      .chat-message-actions { position: absolute; top: -12px; right: 8px; display: flex; gap: 2px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); padding: 2px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); opacity: 0; pointer-events: none; transition: opacity 0.15s; z-index: 10; }
      .chat-reaction-btn { width: 26px; height: 26px; border: none; background: transparent; border-radius: 4px; cursor: pointer; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; transition: background 0.1s; }
      .chat-reaction-btn:hover { background: var(--bg-elevated); }

      /* ── Reactions Row ── */
      .chat-reactions-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
      .chat-reaction-chip { display: flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-elevated); cursor: pointer; font-size: 0.72rem; transition: all 0.15s; }
      .chat-reaction-chip:hover { border-color: var(--accent, #E85102); }
      .chat-reaction-chip.active { background: var(--accent, #E85102)15; border-color: var(--accent, #E85102); }
      .chat-reaction-chip span { font-size: 0.65rem; font-weight: 600; color: var(--text-muted); }
      .chat-reaction-chip.active span { color: var(--accent, #E85102); }

      /* ── Mentions ── */
      .chat-mention { background: var(--accent, #E85102)20; color: var(--accent, #E85102); padding: 1px 4px; border-radius: 3px; font-weight: 600; }

      /* ── Attachments ── */
      .chat-attachment-image { margin-top: 6px; max-width: 320px; }
      .chat-attachment-image img { width: 100%; border-radius: var(--radius-md, 8px); cursor: pointer; transition: opacity 0.2s; }
      .chat-attachment-image img:hover { opacity: 0.9; }
      .chat-attachment-file { display: flex; align-items: center; gap: 10px; margin-top: 6px; padding: 8px 12px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); max-width: 300px; }
      .chat-attachment-name { font-size: 0.78rem; font-weight: 600; color: var(--accent, #E85102); text-decoration: none; }
      .chat-attachment-name:hover { text-decoration: underline; }
      .chat-attachment-size { font-size: 0.65rem; color: var(--text-muted); }

      /* ── Polls ── */
      .chat-poll { margin-top: 6px; padding: 12px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); max-width: 400px; }
      .chat-poll-question { font-weight: 700; font-size: 0.85rem; margin-bottom: 10px; }
      .chat-poll-options { display: flex; flex-direction: column; gap: 6px; }
      .chat-poll-option-btn { position: relative; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); background: var(--bg-primary); cursor: pointer; font-size: 0.78rem; overflow: hidden; transition: all 0.15s; }
      .chat-poll-option-btn:hover { border-color: var(--accent, #E85102); }
      .chat-poll-option-btn.voted { border-color: var(--accent, #E85102); background: var(--accent, #E85102)08; }
      .chat-poll-option-bar { position: absolute; left: 0; top: 0; height: 100%; background: var(--accent, #E85102)12; transition: width 0.3s; }
      .chat-poll-option-text { position: relative; z-index: 1; font-weight: 500; }
      .chat-poll-option-count { position: relative; z-index: 1; font-size: 0.68rem; color: var(--text-muted); font-weight: 600; }
      .chat-poll-total { font-size: 0.68rem; color: var(--text-muted); margin-top: 8px; }

      /* ── Typing Indicator ── */
      .chat-typing { display: none; align-items: center; gap: 8px; padding: 4px 16px 6px; font-size: 0.72rem; color: var(--text-muted); }
      .chat-typing-dots { display: flex; gap: 3px; }
      .chat-typing-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--text-muted); animation: chatTypingBounce 1.4s ease-in-out infinite; }
      .chat-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .chat-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes chatTypingBounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }

      /* ── Input Area ── */
      .chat-input-area { display: none; flex-direction: column; border-top: 1px solid var(--border-subtle); background: var(--bg-primary); }
      .chat-toolbar { display: flex; gap: 2px; padding: 6px 12px 0; }
      .chat-toolbar-btn { width: 30px; height: 30px; border-radius: var(--radius-md, 8px); background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: all 0.15s; }
      .chat-toolbar-btn:hover { background: var(--bg-elevated); color: var(--accent, #E85102); }
      .chat-input-row { display: flex; align-items: flex-end; gap: 8px; padding: 6px 12px 10px; }
      .chat-input { flex: 1; resize: none; border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); padding: 8px 12px; font-size: 0.82rem; font-family: inherit; background: var(--bg-elevated); color: var(--text-primary); max-height: 120px; outline: none; transition: border-color 0.2s; }
      .chat-input:focus { border-color: var(--accent, #E85102); }
      .chat-input::placeholder { color: var(--text-muted); }
      .chat-send-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--accent, #E85102); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s, transform 0.1s; }
      .chat-send-btn:hover { background: #d04900; }
      .chat-send-btn:active { transform: scale(0.95); }

      /* ── Attachment Preview ── */
      .chat-attachment-preview { padding: 6px 12px; border-top: 1px solid var(--border-subtle); }
      .chat-file-preview-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); }
      .chat-file-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 4px; }

      /* ── Emoji Picker ── */
      .chat-emoji-picker, .chat-sticker-picker { position: absolute; bottom: 100%; left: 0; right: 0; max-height: 280px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg, 12px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 100; overflow: hidden; display: flex; flex-direction: column; margin-bottom: 4px; }
      .chat-picker-tabs { display: flex; gap: 2px; padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); overflow-x: auto; flex-shrink: 0; }
      .chat-picker-tab { padding: 4px 10px; border: none; background: transparent; border-radius: var(--radius-md, 8px); cursor: pointer; font-size: 0.68rem; font-weight: 600; color: var(--text-muted); white-space: nowrap; transition: all 0.15s; }
      .chat-picker-tab.active { background: var(--accent, #E85102)15; color: var(--accent, #E85102); }
      .chat-picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(34px, 1fr)); gap: 2px; padding: 8px; overflow-y: auto; flex: 1; }
      .chat-emoji-item { width: 34px; height: 34px; border: none; background: transparent; border-radius: 6px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: background 0.1s; }
      .chat-emoji-item:hover { background: var(--bg-elevated); transform: scale(1.15); }

      /* ── Sticker Picker ── */
      .chat-sticker-pack-name { font-size: 0.68rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 12px 4px; }
      .chat-sticker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 4px; padding: 4px 8px 8px; overflow-y: auto; }
      .chat-sticker-item { display: flex; flex-direction: column; align-items: center; padding: 6px; border: 1px solid transparent; border-radius: var(--radius-md, 8px); background: transparent; cursor: pointer; transition: all 0.15s; }
      .chat-sticker-item:hover { border-color: var(--border-subtle); background: var(--bg-elevated); }
      .chat-sticker-label { font-size: 0.55rem; color: var(--text-muted); margin-top: 2px; }

      /* ── Mention Suggestions ── */
      .chat-mention-suggestions { position: absolute; bottom: 100%; left: 12px; right: 12px; max-height: 200px; overflow-y: auto; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg, 12px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 100; margin-bottom: 4px; }
      .chat-mention-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; transition: background 0.1s; }
      .chat-mention-item:hover, .chat-mention-item.active { background: var(--bg-elevated); }
      .chat-mention-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; flex-shrink: 0; }

      /* ── Modals ── */
      .chat-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1100; display: none; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
      .chat-modal { background: var(--bg-primary); border-radius: var(--radius-lg, 12px); padding: 24px; width: 90%; max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-height: 80vh; overflow-y: auto; }
      .chat-modal-lg { max-width: 520px; }
      .chat-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }

      /* ── Members List ── */
      .chat-members-list { display: flex; flex-direction: column; gap: 6px; }
      .chat-member-item { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: var(--radius-md, 8px); transition: background 0.15s; }
      .chat-member-item:hover { background: var(--bg-elevated); }
      .chat-member-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0; }
      .chat-member-role { font-size: 0.62rem; font-weight: 600; padding: 2px 8px; border-radius: 10px; background: var(--bg-elevated); color: var(--text-muted); }

      /* ── Forms ── */
      .chat-form-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); font-size: 0.82rem; background: var(--bg-elevated); color: var(--text-primary); outline: none; transition: border-color 0.2s; box-sizing: border-box; }
      .chat-form-input:focus { border-color: var(--accent, #E85102); }
      .chat-link-btn { background: none; border: none; color: var(--accent, #E85102); font-size: 0.78rem; font-weight: 600; cursor: pointer; padding: 4px 0; }
      .chat-link-btn:hover { text-decoration: underline; }
      .chat-checkbox-label, .chat-radio-label { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; cursor: pointer; }
      .chat-checkbox-label input, .chat-radio-label input { accent-color: var(--accent, #E85102); }

      /* ── Spinner ── */
      .chat-spinner { width: 24px; height: 24px; border: 2px solid var(--border-subtle); border-top-color: var(--accent, #E85102); border-radius: 50%; animation: chatSpin 0.6s linear infinite; margin: 0 auto 8px; }
      @keyframes chatSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        .chat-layout { flex-direction: column; }
        .chat-sidebar { width: 100%; min-width: 100%; max-height: 100%; border-right: none; border-bottom: 1px solid var(--border-subtle); }
        .chat-sidebar-hidden { display: none; }
        .chat-back-btn { display: block !important; }
        .chat-module { height: calc(100vh - 80px); }
        .chat-emoji-picker, .chat-sticker-picker { max-height: 220px; }
        .chat-modal { width: 95%; padding: 16px; }
      }
    `;
  }
};
