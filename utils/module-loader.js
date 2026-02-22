// TBO OS — Module Loader (Lazy-load de scripts sob demanda)
// Injeta <script> dinamicamente e garante que cada modulo carrega apenas 1 vez.
// Usado pelo router para carregar modulos pesados apenas quando acessados.

const TBO_MODULE_LOADER = {
  // Cache: URL → Promise<void> (resolve quando script carregou)
  _loaded: {},
  // Cache: URL → status ('loading' | 'loaded' | 'error')
  _status: {},

  /**
   * Carrega um script JS sob demanda.
   * Se ja carregou, resolve imediatamente.
   * @param {string} url - Caminho do script (ex: 'modules/people/index.js')
   * @param {object} opts - Opcoes: { cacheBust: string, timeout: number }
   * @returns {Promise<void>}
   */
  load(url, opts = {}) {
    const key = url.split('?')[0]; // Normalizar sem query string

    // Ja carregado — resolver imediato
    if (this._status[key] === 'loaded') {
      return Promise.resolve();
    }

    // Em carregamento — retornar promise existente
    if (this._status[key] === 'loading' && this._loaded[key]) {
      return this._loaded[key];
    }

    // Carregar novo script
    this._status[key] = 'loading';
    const fullUrl = opts.cacheBust ? `${url}?v=${opts.cacheBust}` : url;
    const timeout = opts.timeout || 15000;

    this._loaded[key] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = fullUrl;
      script.defer = true;

      const timer = setTimeout(() => {
        this._status[key] = 'error';
        reject(new Error(`[ModuleLoader] Timeout ao carregar ${url}`));
      }, timeout);

      script.onload = () => {
        clearTimeout(timer);
        this._status[key] = 'loaded';
        console.log(`[ModuleLoader] Carregado: ${key}`);
        resolve();
      };

      script.onerror = (err) => {
        clearTimeout(timer);
        this._status[key] = 'error';
        delete this._loaded[key];
        reject(new Error(`[ModuleLoader] Erro ao carregar ${url}`));
      };

      document.head.appendChild(script);
    });

    return this._loaded[key];
  },

  /**
   * Carrega multiplos scripts em sequencia (ordem garantida).
   * @param {string[]} urls - Array de caminhos
   * @param {object} opts - Opcoes comuns
   * @returns {Promise<void>}
   */
  async loadSequential(urls, opts = {}) {
    for (const url of urls) {
      await this.load(url, opts);
    }
  },

  /**
   * Carrega multiplos scripts em paralelo.
   * @param {string[]} urls - Array de caminhos
   * @param {object} opts - Opcoes comuns
   * @returns {Promise<void>}
   */
  async loadParallel(urls, opts = {}) {
    await Promise.all(urls.map(url => this.load(url, opts)));
  },

  /**
   * Verifica se um modulo ja foi carregado.
   * @param {string} url - Caminho do script
   * @returns {boolean}
   */
  isLoaded(url) {
    const key = url.split('?')[0];
    return this._status[key] === 'loaded';
  },

  /**
   * Marca um modulo como ja carregado (para scripts que vem no boot).
   * @param {string} url - Caminho do script
   */
  markLoaded(url) {
    const key = url.split('?')[0];
    this._status[key] = 'loaded';
    this._loaded[key] = Promise.resolve();
  }
};
