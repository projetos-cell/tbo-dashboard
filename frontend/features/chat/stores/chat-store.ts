import { create } from "zustand";

interface TypingUser {
  userId: string;
  name: string;
}

interface PresenceUser {
  userId: string;
  name: string;
  avatarUrl?: string;
  onlineAt: string;
}

interface ChatState {
  // Channel selection
  selectedChannelId: string | null;
  setSelectedChannelId: (id: string | null) => void;

  // Typing indicators (per channel, ephemeral)
  typingUsers: Record<string, TypingUser[]>;
  setTypingUsers: (channelId: string, users: TypingUser[]) => void;
  addTypingUser: (channelId: string, user: TypingUser) => void;
  removeTypingUser: (channelId: string, userId: string) => void;

  // Online presence (global per tenant)
  onlineUsers: PresenceUser[];
  setOnlineUsers: (users: PresenceUser[]) => void;
  isOnline: (userId: string) => boolean;

  // Unread counts (synced from RPC)
  unreadCounts: Record<string, number>;
  setUnreadCounts: (counts: Record<string, number>) => void;
  setUnreadCount: (channelId: string, count: number) => void;
  clearUnread: (channelId: string) => void;
  totalUnread: () => number;

  // UI dialogs
  isCreateChannelOpen: boolean;
  setCreateChannelOpen: (open: boolean) => void;
  isCreateDMOpen: boolean;
  setCreateDMOpen: (open: boolean) => void;
  isChannelSettingsOpen: boolean;
  setChannelSettingsOpen: (open: boolean) => void;

  // Search
  isSearchOpen: boolean;
  toggleSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Collapsible sections
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
  isSectionCollapsed: (sectionId: string) => boolean;

  // Archived channels
  showArchivedChannels: boolean;
  setShowArchivedChannels: (show: boolean) => void;

  // Create section dialog
  isCreateSectionOpen: boolean;
  setCreateSectionOpen: (open: boolean) => void;

  // Inline rename
  renamingSectionId: string | null;
  setRenamingSectionId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // ── Channel selection ─────────────────────────────────────────
  selectedChannelId: null,
  setSelectedChannelId: (id) => set({ selectedChannelId: id }),

  // ── Typing ────────────────────────────────────────────────────
  typingUsers: {},
  setTypingUsers: (channelId, users) =>
    set((s) => ({ typingUsers: { ...s.typingUsers, [channelId]: users } })),
  addTypingUser: (channelId, user) =>
    set((s) => {
      const current = s.typingUsers[channelId] ?? [];
      if (current.some((u) => u.userId === user.userId)) return s;
      return { typingUsers: { ...s.typingUsers, [channelId]: [...current, user] } };
    }),
  removeTypingUser: (channelId, userId) =>
    set((s) => {
      const current = s.typingUsers[channelId] ?? [];
      return {
        typingUsers: {
          ...s.typingUsers,
          [channelId]: current.filter((u) => u.userId !== userId),
        },
      };
    }),

  // ── Presence ──────────────────────────────────────────────────
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  isOnline: (userId) => get().onlineUsers.some((u) => u.userId === userId),

  // ── Unread ────────────────────────────────────────────────────
  unreadCounts: {},
  setUnreadCounts: (counts) => set({ unreadCounts: counts }),
  setUnreadCount: (channelId, count) =>
    set((s) => ({ unreadCounts: { ...s.unreadCounts, [channelId]: count } })),
  clearUnread: (channelId) =>
    set((s) => ({ unreadCounts: { ...s.unreadCounts, [channelId]: 0 } })),
  totalUnread: () =>
    Object.values(get().unreadCounts).reduce((sum, n) => sum + n, 0),

  // ── Dialogs ───────────────────────────────────────────────────
  isCreateChannelOpen: false,
  setCreateChannelOpen: (open) => set({ isCreateChannelOpen: open }),
  isCreateDMOpen: false,
  setCreateDMOpen: (open) => set({ isCreateDMOpen: open }),
  isChannelSettingsOpen: false,
  setChannelSettingsOpen: (open) => set({ isChannelSettingsOpen: open }),

  // ── Search ────────────────────────────────────────────────────
  isSearchOpen: false,
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // ── Collapsible sections ───────────────────────────────────
  collapsedSections: new Set<string>(),
  toggleSection: (sectionId) =>
    set((s) => {
      const next = new Set(s.collapsedSections);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return { collapsedSections: next };
    }),
  isSectionCollapsed: (sectionId) => get().collapsedSections.has(sectionId),

  // ── Archived channels ────────────────────────────────────────
  showArchivedChannels: false,
  setShowArchivedChannels: (show) => set({ showArchivedChannels: show }),

  // ── Create section dialog ────────────────────────────────────
  isCreateSectionOpen: false,
  setCreateSectionOpen: (open) => set({ isCreateSectionOpen: open }),

  // ── Inline rename ────────────────────────────────────────────
  renamingSectionId: null,
  setRenamingSectionId: (id) => set({ renamingSectionId: id }),
}));
