// ============================================================================
// TBO OS — PDF Export (via html2pdf.js CDN)
// Gera relatorios PDF a partir de conteudo do dashboard.
// Respeita RBAC e contexto do tenant.
// ============================================================================

const TBO_PDF_EXPORT = {

  _lib: null, // html2pdf instance (loaded on demand)
  _cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js',

  /**
   * Carrega html2pdf.js do CDN se ainda nao carregado
   */
  async _loadLib() {
    if (this._lib) return this._lib;
    if (window.html2pdf) {
      this._lib = window.html2pdf;
      return this._lib;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this._cdnUrl;
      script.onload = () => {
        this._lib = window.html2pdf;
        resolve(this._lib);
      };
      script.onerror = () => reject(new Error('Falha ao carregar html2pdf.js'));
      document.head.appendChild(script);
    });
  },

  /**
   * Exporta elemento HTML como PDF
   * @param {HTMLElement|string} source - Elemento ou seletor CSS
   * @param {object} [options]
   * @param {string} [options.filename] - Nome do arquivo
   * @param {string} [options.title] - Titulo no cabecalho
   * @param {boolean} [options.landscape] - Orientacao paisagem
   * @param {string} [options.pageSize] - Tamanho (a4, letter)
   */
  async exportElement(source, options = {}) {
    const html2pdf = await this._loadLib();
    const element = typeof source === 'string' ? document.querySelector(source) : source;
    if (!element) throw new Error('Elemento nao encontrado para exportar.');

    // Clonar e preparar para impressao
    const clone = element.cloneNode(true);
    const wrapper = document.createElement('div');

    // Cabecalho do relatorio
    const tenant = this._getCurrentTenant();
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0 0 16px;border-bottom:2px solid #E85102;margin-bottom:20px;">
        <div>
          <div style="font-size:20px;font-weight:700;color:#1a1a1a;">${this._escapeHtml(options.title || 'Relatorio TBO OS')}</div>
          <div style="font-size:11px;color:#666;margin-top:4px;">${tenant} — Gerado em ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div style="font-size:14px;font-weight:700;color:#E85102;">TBO</div>
      </div>
    `;

    wrapper.appendChild(header);
    wrapper.appendChild(clone);

    // Estilizar para impressao
    wrapper.style.fontFamily = 'Helvetica, Arial, sans-serif';
    wrapper.style.fontSize = '11px';
    wrapper.style.color = '#333';
    wrapper.style.padding = '10px';

    // Remover interacoes (botoes, inputs)
    wrapper.querySelectorAll('button, input, select, .btn, [onclick]').forEach(el => el.remove());
    // Remover backgrounds escuros
    wrapper.querySelectorAll('[style*="background"]').forEach(el => {
      el.style.background = 'none';
      el.style.backgroundColor = '#fff';
      el.style.color = '#333';
    });

    const config = {
      margin: [10, 10, 15, 10],
      filename: options.filename || `tbo-relatorio-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: options.pageSize || 'a4',
        orientation: options.landscape ? 'landscape' : 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Exportando', 'Gerando PDF...');

    try {
      await html2pdf().set(config).from(wrapper).save();
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('PDF', 'Relatorio exportado!');
    } catch (e) {
      console.error('[TBO PDF] Erro:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('PDF', 'Erro ao gerar PDF: ' + e.message);
    }
  },

  /**
   * Exporta o modulo atualmente visivel no moduleContainer
   */
  async exportCurrentModule(options = {}) {
    const container = document.getElementById('moduleContainer');
    if (!container) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('PDF', 'Nenhum modulo visivel.');
      return;
    }

    // Titulo automatico a partir do modulo
    const moduleTitle = container.querySelector('.module-title, h2, h1');
    const title = options.title || moduleTitle?.textContent || 'Relatorio';

    await this.exportElement(container, { ...options, title });
  },

  /**
   * Gera relatorio executivo do dashboard (Command Center)
   */
  async exportDashboard() {
    await this.exportCurrentModule({
      title: 'Dashboard Executivo — TBO OS',
      filename: `tbo-dashboard-${new Date().toISOString().split('T')[0]}.pdf`
    });
  },

  /**
   * Gera relatorio financeiro (fluxo de caixa)
   */
  async exportFinanceiro() {
    await this.exportCurrentModule({
      title: 'Relatorio Financeiro — TBO OS',
      filename: `tbo-financeiro-${new Date().toISOString().split('T')[0]}.pdf`,
      landscape: true
    });
  },

  /**
   * Retorna nome do tenant atual
   */
  _getCurrentTenant() {
    try {
      const ws = localStorage.getItem('tbo_current_workspace');
      if (ws) {
        const parsed = JSON.parse(ws);
        return parsed.name || 'TBO';
      }
    } catch (e) { /* ignore */ }
    return 'TBO';
  },

  /**
   * Escape HTML para prevenir XSS
   */
  _escapeHtml(str) {
    if (typeof _escapeHtml === 'function') return _escapeHtml(str);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
