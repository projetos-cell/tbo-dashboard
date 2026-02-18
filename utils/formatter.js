// TBO OS — Formatting Utilities
const TBO_FORMATTER = {
  // Format currency in BRL
  currency(value) {
    if (value == null || isNaN(value)) return 'R$ —';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  },

  // Format percentage
  percent(value, decimals = 1) {
    if (value == null || isNaN(value)) return '—%';
    return `${Number(value).toFixed(decimals)}%`;
  },

  // Format number with locale
  number(value, decimals = 0) {
    if (value == null || isNaN(value)) return '—';
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals }).format(value);
  },

  // Format date to pt-BR
  date(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateStr; }
  },

  // Relative time (e.g., "há 2 dias")
  relativeTime(dateStr) {
    if (!dateStr) return '—';
    try {
      const now = new Date();
      const d = new Date(dateStr);
      const diffMs = now - d;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMin < 1) return 'agora';
      if (diffMin < 60) return `há ${diffMin}min`;
      if (diffHours < 24) return `há ${diffHours}h`;
      if (diffDays < 7) return `há ${diffDays}d`;
      if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} sem`;
      if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`;
      return `há ${Math.floor(diffDays / 365)} anos`;
    } catch { return dateStr; }
  },

  // Truncate text
  truncate(text, maxLen = 100) {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen).trimEnd() + '...';
  },

  // Capitalize first letter
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Slugify text
  slugify(str) {
    return (str || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Convert markdown-like text to HTML (basic)
  markdownToHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br>');
  },

  // Format duration in minutes to human-readable
  duration(minutes) {
    if (!minutes || isNaN(minutes)) return '—';
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  },

  // Format file size
  fileSize(bytes) {
    if (!bytes || isNaN(bytes)) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
  },

  // Generate initials from name
  initials(name) {
    if (!name) return '??';
    return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  },

  // ── HTML Escaping (XSS prevention) ──────────────────────────────────────
  // Use this whenever inserting user-generated or external data into innerHTML
  escapeHtml(str) {
    if (str == null) return '';
    if (typeof str !== 'string') str = String(str);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};
