/**
 * TBO OS Dashboard - Modulo de Performance e Melhorias Tecnicas
 *
 * Singleton global que fornece:
 * - Virtual Scrolling para listas longas
 * - Carregamento lazy de modulos
 * - Configuracao PWA (manifest + service worker)
 * - Estrategia de cache via Service Worker
 * - Atualizacoes otimistas de UI
 * - Monitor de performance
 * - Otimizacao de imagens no client
 * - Analisador de bundle
 * - Deduplicacao de requests
 * - Preload de modulos
 *
 * Uso: TBO_PERFORMANCE.init() para inicializar o sistema completo.
 */

const TBO_PERFORMANCE = {

  // =========================================================================
  // ESTADO INTERNO
  // =========================================================================

  _initialized: false,
  _dedupCache: new Map(),
  _pendingOps: [],
  _moduleRegistry: {},
  _perfMetrics: [],
  _navigationHistory: [],
  _preloadedModules: new Set(),
  _installPromptEvent: null,

  // =========================================================================
  // 1. VIRTUAL SCROLLING
  // =========================================================================

  /**
   * Cria uma lista virtualizada que renderiza apenas os itens visiveis.
   * Ideal para listas com centenas ou milhares de itens.
   *
   * @param {HTMLElement} container - Elemento container da lista
   * @param {Array} items - Array de dados dos itens
   * @param {Function} renderItem - Funcao (item, index) => HTMLElement
   * @param {number} itemHeight - Altura padrao de cada item em pixels
   * @returns {Object} Controlador com metodos scrollToIndex, updateItems, destroy
   */
  createVirtualList(container, items, renderItem, itemHeight = 50) {
    if (!container || !items || !renderItem) {
      console.error('[TBO Performance] createVirtualList: parametros obrigatorios ausentes.');
      return null;
    }

    const BUFFER_SIZE = 5; // Itens extras renderizados acima e abaixo da area visivel
    let currentItems = [...items];
    let scrollTop = 0;
    let destroyed = false;

    // Cache de alturas reais para suporte a alturas variaveis
    const heightCache = new Map();

    // Calcular altura total estimada da lista
    function getTotalHeight() {
      let total = 0;
      for (let i = 0; i < currentItems.length; i++) {
        total += heightCache.get(i) || itemHeight;
      }
      return total;
    }

    // Encontrar o indice do primeiro item visivel dado o scrollTop
    function getStartIndex(scrollOffset) {
      let accumulated = 0;
      for (let i = 0; i < currentItems.length; i++) {
        const h = heightCache.get(i) || itemHeight;
        if (accumulated + h > scrollOffset) {
          return Math.max(0, i - BUFFER_SIZE);
        }
        accumulated += h;
      }
      return Math.max(0, currentItems.length - 1);
    }

    // Calcular offset vertical ate um determinado indice
    function getOffsetForIndex(index) {
      let offset = 0;
      for (let i = 0; i < index && i < currentItems.length; i++) {
        offset += heightCache.get(i) || itemHeight;
      }
      return offset;
    }

    // Construir estrutura do DOM
    container.style.overflow = 'auto';
    container.style.position = 'relative';

    const scrollContent = document.createElement('div');
    scrollContent.style.position = 'relative';
    scrollContent.style.width = '100%';

    const viewport = document.createElement('div');
    viewport.style.position = 'absolute';
    viewport.style.top = '0';
    viewport.style.left = '0';
    viewport.style.width = '100%';

    scrollContent.appendChild(viewport);
    container.innerHTML = '';
    container.appendChild(scrollContent);

    // Renderizar os itens visiveis
    function render() {
      if (destroyed) return;

      const containerHeight = container.clientHeight;
      const totalHeight = getTotalHeight();
      scrollContent.style.height = totalHeight + 'px';

      const startIdx = getStartIndex(scrollTop);
      const startOffset = getOffsetForIndex(startIdx);

      // Determinar quantos itens cabem na tela + buffer
      let visibleHeight = 0;
      let endIdx = startIdx;
      while (endIdx < currentItems.length && visibleHeight < containerHeight + (BUFFER_SIZE * itemHeight)) {
        visibleHeight += heightCache.get(endIdx) || itemHeight;
        endIdx++;
      }
      endIdx = Math.min(endIdx + BUFFER_SIZE, currentItems.length);

      // Limpar viewport e renderizar itens
      viewport.innerHTML = '';
      viewport.style.transform = `translateY(${startOffset}px)`;

      for (let i = startIdx; i < endIdx; i++) {
        const el = renderItem(currentItems[i], i);
        if (el) {
          el.style.boxSizing = 'border-box';
          viewport.appendChild(el);

          // Medir altura real apos renderizacao
          requestAnimationFrame(() => {
            const realHeight = el.getBoundingClientRect().height;
            if (realHeight > 0 && realHeight !== (heightCache.get(i) || itemHeight)) {
              heightCache.set(i, realHeight);
            }
          });
        }
      }
    }

    // Listener de scroll com throttle
    let scrollRafId = null;
    function onScroll() {
      scrollTop = container.scrollTop;
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
      scrollRafId = requestAnimationFrame(render);
    }

    container.addEventListener('scroll', onScroll, { passive: true });

    // Renderizacao inicial
    render();

    // Controlador retornado
    const controller = {
      /**
       * Rolar ate um indice especifico
       * @param {number} idx - Indice do item
       */
      scrollToIndex(idx) {
        if (destroyed) return;
        const clampedIdx = Math.max(0, Math.min(idx, currentItems.length - 1));
        const offset = getOffsetForIndex(clampedIdx);
        container.scrollTo({ top: offset, behavior: 'smooth' });
      },

      /**
       * Atualizar a lista de itens
       * @param {Array} newItems - Nova lista de itens
       */
      updateItems(newItems) {
        if (destroyed) return;
        currentItems = [...newItems];
        heightCache.clear();
        render();
      },

      /**
       * Destruir a lista virtual e limpar listeners
       */
      destroy() {
        destroyed = true;
        container.removeEventListener('scroll', onScroll);
        if (scrollRafId) cancelAnimationFrame(scrollRafId);
        container.innerHTML = '';
      }
    };

    return controller;
  },

  // =========================================================================
  // 2. LAZY MODULE LOADING
  // =========================================================================

  /**
   * Carrega um modulo de forma lazy, exibindo skeleton enquanto carrega.
   * Mantem registro do estado de cada modulo e pre-busca modulos
   * baseado em padroes de navegacao do usuario.
   *
   * @param {string} moduleName - Nome do modulo a carregar
   * @param {Function} callback - Funcao chamada quando o modulo estiver pronto
   */
  lazyLoad(moduleName, callback) {
    // Verificar se o modulo ja esta carregado
    if (this._moduleRegistry[moduleName] && this._moduleRegistry[moduleName].status === 'loaded') {
      if (callback) callback(this._moduleRegistry[moduleName].module);
      return;
    }

    // Registrar modulo como carregando
    this._moduleRegistry[moduleName] = {
      status: 'loading',
      module: null,
      timestamp: Date.now()
    };

    // Registrar navegacao para previsao de proximos modulos
    this._navigationHistory.push({
      module: moduleName,
      timestamp: Date.now()
    });
    this._saveNavigationPatterns();

    // Exibir skeleton placeholder
    const skeletonId = `tbo-skeleton-${moduleName}`;
    this._showSkeleton(skeletonId, moduleName);

    // Simular carregamento do modulo (em producao, seria um fetch real)
    const startTime = performance.now();

    // Verificar se existe um script correspondente ao modulo
    const scriptPath = this._resolveModulePath(moduleName);

    const script = document.createElement('script');
    script.src = scriptPath;
    script.async = true;

    script.onload = () => {
      const loadTime = performance.now() - startTime;

      this._moduleRegistry[moduleName] = {
        status: 'loaded',
        module: window[moduleName] || null,
        timestamp: Date.now(),
        loadTime: loadTime
      };

      // Registrar metrica de carregamento
      this._recordMetric('module_load', {
        module: moduleName,
        duration: loadTime
      });

      // Remover skeleton
      this._removeSkeleton(skeletonId);

      // Pre-buscar modulos que provavelmente serao necessarios
      this._prefetchPredictedModules(moduleName);

      if (callback) callback(this._moduleRegistry[moduleName].module);
    };

    script.onerror = () => {
      this._moduleRegistry[moduleName] = {
        status: 'error',
        module: null,
        timestamp: Date.now()
      };

      this._removeSkeleton(skeletonId);
      console.warn(`[TBO Performance] Falha ao carregar modulo: ${moduleName}`);

      if (callback) callback(null);
    };

    document.head.appendChild(script);
  },

  /**
   * Resolver caminho do script para um modulo
   */
  _resolveModulePath(moduleName) {
    const moduleMap = {
      'projects': './modules/projects.js',
      'finance': './modules/finance.js',
      'people': './modules/people.js',
      'calendar': './modules/calendar.js',
      'settings': './modules/settings.js',
      'reports': './modules/reports.js',
      'erp': './modules/erp.js'
    };
    return moduleMap[moduleName] || `./modules/${moduleName}.js`;
  },

  /**
   * Exibir placeholder skeleton enquanto modulo carrega
   */
  _showSkeleton(id, moduleName) {
    let skeleton = document.getElementById(id);
    if (skeleton) return;

    skeleton = document.createElement('div');
    skeleton.id = id;
    skeleton.className = 'tbo-skeleton-placeholder';
    skeleton.innerHTML = `
      <div style="padding: 24px; animation: tbo-skeleton-pulse 1.5s ease-in-out infinite;">
        <div style="background: rgba(232,81,2,0.1); border-radius: 8px; height: 24px; width: 40%; margin-bottom: 16px;"></div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 6px; height: 16px; width: 80%; margin-bottom: 12px;"></div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 6px; height: 16px; width: 65%; margin-bottom: 12px;"></div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 6px; height: 16px; width: 70%; margin-bottom: 24px;"></div>
        <div style="background: rgba(255,255,255,0.03); border-radius: 8px; height: 120px; width: 100%;"></div>
      </div>
    `;

    // Injetar animacao CSS se ainda nao existir
    if (!document.getElementById('tbo-skeleton-styles')) {
      const style = document.createElement('style');
      style.id = 'tbo-skeleton-styles';
      style.textContent = `
        @keyframes tbo-skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `;
      document.head.appendChild(style);
    }

    // Inserir no container principal ou body
    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.appendChild(skeleton);
  },

  /**
   * Remover skeleton placeholder
   */
  _removeSkeleton(id) {
    const skeleton = document.getElementById(id);
    if (skeleton) {
      skeleton.style.transition = 'opacity 0.3s ease';
      skeleton.style.opacity = '0';
      setTimeout(() => skeleton.remove(), 300);
    }
  },

  /**
   * Salvar padroes de navegacao no localStorage
   */
  _saveNavigationPatterns() {
    try {
      // Manter apenas as ultimas 100 entradas
      const history = this._navigationHistory.slice(-100);
      localStorage.setItem('tbo_nav_patterns', JSON.stringify(history));
    } catch (e) {
      // localStorage pode estar cheio ou indisponivel
    }
  },

  /**
   * Pre-buscar modulos previstos baseado em padroes de navegacao
   */
  _prefetchPredictedModules(currentModule) {
    try {
      const patterns = JSON.parse(localStorage.getItem('tbo_nav_patterns') || '[]');

      // Contar transicoes: qual modulo geralmente vem depois do atual
      const transitions = {};
      for (let i = 0; i < patterns.length - 1; i++) {
        if (patterns[i].module === currentModule) {
          const nextMod = patterns[i + 1].module;
          transitions[nextMod] = (transitions[nextMod] || 0) + 1;
        }
      }

      // Ordenar por frequencia e pre-carregar o mais provavel
      const predicted = Object.entries(transitions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(entry => entry[0]);

      predicted.forEach(mod => {
        if (!this._moduleRegistry[mod] || this._moduleRegistry[mod].status === 'error') {
          this.preloadModule(mod);
        }
      });
    } catch (e) {
      // Falha silenciosa na previsao
    }
  },

  // =========================================================================
  // 3. PWA SETUP
  // =========================================================================

  /**
   * Gera o objeto manifest para PWA do TBO OS.
   * @returns {Object} Manifest compativel com Web App Manifest spec
   */
  generateManifest() {
    return {
      name: 'TBO OS - Studio de Visualizacao Arquitetonica',
      short_name: 'TBO',
      description: 'Dashboard de gestao para studio de visualizacao arquitetonica',
      start_url: '/',
      display: 'standalone',
      orientation: 'any',
      theme_color: '#E85102',
      background_color: '#0e0e12',
      lang: 'pt-BR',
      categories: ['business', 'productivity'],
      icons: [
        {
          src: '/assets/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/assets/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/assets/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/assets/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/assets/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/assets/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/assets/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/assets/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        }
      ],
      shortcuts: [
        {
          name: 'Projetos',
          short_name: 'Projetos',
          url: '/#/projects',
          icons: [{ src: '/assets/icons/shortcut-projects.png', sizes: '96x96' }]
        },
        {
          name: 'Financeiro',
          short_name: 'Financas',
          url: '/#/finance',
          icons: [{ src: '/assets/icons/shortcut-finance.png', sizes: '96x96' }]
        }
      ]
    };
  },

  /**
   * Registra o Service Worker se o navegador suportar
   * @returns {Promise} Promise que resolve com o registro do SW
   */
  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[TBO Performance] Service Worker nao suportado neste navegador.');
      return Promise.resolve(null);
    }

    return navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('[TBO Performance] Service Worker registrado com sucesso. Escopo:', registration.scope);

        // Verificar atualizacoes periodicamente
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('[TBO Performance] Nova versao do Service Worker ativada.');
              if (typeof TBO_TOAST !== 'undefined') {
                TBO_TOAST.show('Aplicacao atualizada! Recarregue para ver as novidades.', 'info');
              }
            }
          });
        });

        return registration;
      })
      .catch(err => {
        console.error('[TBO Performance] Falha ao registrar Service Worker:', err);
        return null;
      });
  },

  /**
   * Escuta o evento beforeinstallprompt e exibe banner personalizado de instalacao
   */
  checkInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Impedir o prompt padrao do navegador
      e.preventDefault();
      this._installPromptEvent = e;

      // Criar banner personalizado de instalacao
      this._showInstallBanner();
    });

    // Detectar quando o app foi instalado
    window.addEventListener('appinstalled', () => {
      this._hideInstallBanner();
      this._installPromptEvent = null;
      console.log('[TBO Performance] TBO OS instalado com sucesso!');

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.show('TBO OS instalado com sucesso!', 'success');
      }
    });
  },

  /**
   * Exibir banner de instalacao personalizado
   */
  _showInstallBanner() {
    if (document.getElementById('tbo-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'tbo-install-banner';
    banner.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #E85102, #c44400);
      color: #fff; padding: 16px 24px; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(232,81,2,0.4);
      display: flex; align-items: center; gap: 16px;
      z-index: 10000; font-family: inherit;
      animation: tbo-banner-slide-up 0.5s ease;
      max-width: 480px; width: calc(100% - 40px);
    `;

    banner.innerHTML = `
      <div style="flex: 1;">
        <strong style="font-size: 14px; display: block; margin-bottom: 4px;">Instalar TBO OS</strong>
        <span style="font-size: 12px; opacity: 0.9;">Acesse o dashboard diretamente da area de trabalho</span>
      </div>
      <button id="tbo-install-btn" style="
        background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
        color: #fff; padding: 8px 20px; border-radius: 8px; cursor: pointer;
        font-weight: 600; font-size: 13px; white-space: nowrap;
      ">Instalar</button>
      <button id="tbo-install-dismiss" style="
        background: none; border: none; color: rgba(255,255,255,0.7);
        cursor: pointer; font-size: 18px; padding: 4px; line-height: 1;
      ">&times;</button>
    `;

    // Injetar animacao
    if (!document.getElementById('tbo-install-banner-styles')) {
      const style = document.createElement('style');
      style.id = 'tbo-install-banner-styles';
      style.textContent = `
        @keyframes tbo-banner-slide-up {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(banner);

    // Listener do botao instalar
    document.getElementById('tbo-install-btn').addEventListener('click', () => {
      if (this._installPromptEvent) {
        this._installPromptEvent.prompt();
        this._installPromptEvent.userChoice.then(choice => {
          if (choice.outcome === 'accepted') {
            console.log('[TBO Performance] Usuario aceitou a instalacao.');
          }
          this._installPromptEvent = null;
        });
      }
      this._hideInstallBanner();
    });

    // Listener do botao fechar
    document.getElementById('tbo-install-dismiss').addEventListener('click', () => {
      this._hideInstallBanner();
    });
  },

  /**
   * Esconder banner de instalacao
   */
  _hideInstallBanner() {
    const banner = document.getElementById('tbo-install-banner');
    if (banner) {
      banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      banner.style.opacity = '0';
      banner.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => banner.remove(), 300);
    }
  },

  // =========================================================================
  // 4. SERVICE WORKER CACHE STRATEGY
  // =========================================================================

  /**
   * Retorna o codigo completo do Service Worker como string.
   * Implementa cache-first para assets estaticos e network-first para APIs.
   * @returns {string} Codigo JS do Service Worker
   */
  getServiceWorkerCode() {
    return `
// ==========================================================================
// TBO OS - Service Worker
// Estrategia de cache: cache-first para estaticos, network-first para APIs
// ==========================================================================

const CACHE_V1 = 'tbo-cache-v1';
const API_CACHE = 'tbo-api-cache-v1';
const OFFLINE_PAGE = '/offline.html';

// Recursos estaticos para pre-cache na instalacao
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/themes.css',
  '/app.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  OFFLINE_PAGE
];

// Extensoes de arquivos estaticos
const STATIC_EXTENSIONS = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf'];

// ---- INSTALACAO ----
self.addEventListener('install', (event) => {
  console.log('[TBO SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_V1)
      .then(cache => {
        console.log('[TBO SW] Pre-cacheando recursos estaticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('[TBO SW] Erro no pre-cache:', err);
      })
  );
});

// ---- ATIVACAO ----
self.addEventListener('activate', (event) => {
  console.log('[TBO SW] Service Worker ativado.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Remover caches antigos
          if (cacheName !== CACHE_V1 && cacheName !== API_CACHE) {
            console.log('[TBO SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ---- ESTRATEGIA DE FETCH ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisicoes nao-GET (exceto para background sync)
  if (request.method !== 'GET') {
    return;
  }

  // Verificar se e uma chamada de API
  const isApiCall = url.pathname.startsWith('/api/') ||
                    url.hostname.includes('supabase') ||
                    url.hostname.includes('api.');

  if (isApiCall) {
    // Network-first para chamadas de API
    event.respondWith(networkFirst(request));
  } else if (isStaticAsset(url.pathname)) {
    // Cache-first para recursos estaticos
    event.respondWith(cacheFirst(request));
  } else {
    // Network-first com fallback para outras requisicoes
    event.respondWith(networkFirst(request));
  }
});

/**
 * Verifica se a URL e de um recurso estatico
 */
function isStaticAsset(pathname) {
  return STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext));
}

/**
 * Estrategia Cache-First: tenta o cache primeiro, depois a rede
 */
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      // Atualizar cache em background (stale-while-revalidate)
      fetchAndUpdate(request).catch(() => {});
      return cached;
    }
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_V1);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_PAGE);
  }
}

/**
 * Estrategia Network-First: tenta a rede primeiro, depois o cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Se nenhum cache disponivel e e uma pagina, mostrar offline
    if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
      return caches.match(OFFLINE_PAGE);
    }
    return new Response(JSON.stringify({ error: 'Voce esta offline. Dados do cache indisponiveis.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Buscar e atualizar cache em background
 */
async function fetchAndUpdate(request) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_V1);
    await cache.put(request, response.clone());
  }
  return response;
}

// ---- BACKGROUND SYNC ----
self.addEventListener('sync', (event) => {
  if (event.tag === 'tbo-sync-pending') {
    console.log('[TBO SW] Executando sincronizacao em background...');
    event.waitUntil(syncPendingRequests());
  }
});

/**
 * Reenviar requisicoes POST que falharam enquanto offline
 */
async function syncPendingRequests() {
  try {
    const cache = await caches.open('tbo-pending-requests');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const cachedResponse = await cache.match(request);
        const body = await cachedResponse.text();

        const response = await fetch(request.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body
        });

        if (response.ok) {
          await cache.delete(request);
          console.log('[TBO SW] Requisicao pendente sincronizada:', request.url);
        }
      } catch (err) {
        console.warn('[TBO SW] Falha ao sincronizar:', request.url);
      }
    }
  } catch (error) {
    console.error('[TBO SW] Erro na sincronizacao:', error);
  }
}

// ---- NOTIFICACOES PUSH ----
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'TBO OS', body: 'Nova notificacao' };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TBO OS', {
      body: data.body || '',
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      tag: data.tag || 'tbo-notification',
      data: data
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

console.log('[TBO SW] Service Worker carregado.');
`;
  },

  // =========================================================================
  // 5. OPTIMISTIC UI HELPER
  // =========================================================================

  /**
   * Realiza atualizacao otimista da UI: aplica a mudanca imediatamente,
   * depois confirma com a API. Reverte se houver falha.
   *
   * @param {Object} options - Configuracao da operacao
   * @param {HTMLElement} options.target - Elemento alvo da atualizacao
   * @param {string} options.action - Descricao da acao (para log)
   * @param {*} options.data - Dados a serem aplicados na UI
   * @param {Function} options.rollback - Funcao para reverter a UI em caso de erro
   * @param {Function} options.apiCall - Funcao que retorna Promise da chamada API
   * @returns {Promise} Promise que resolve quando a operacao completa
   */
  optimisticUpdate(options) {
    const { target, action, data, rollback, apiCall } = options;

    if (!apiCall || typeof apiCall !== 'function') {
      console.error('[TBO Performance] optimisticUpdate: apiCall e obrigatoria.');
      return Promise.reject(new Error('apiCall e obrigatoria'));
    }

    // Gerar ID unico para a operacao
    const opId = 'op_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    // Registrar operacao pendente
    const operation = {
      id: opId,
      action: action || 'Atualizacao',
      data: data,
      timestamp: Date.now(),
      status: 'pending'
    };
    this._pendingOps.push(operation);

    // Salvar estado anterior para rollback
    let previousState = null;
    if (target && target instanceof HTMLElement) {
      previousState = target.innerHTML;
    }

    // Aplicar atualizacao otimista na UI (se data for uma funcao, executar)
    if (typeof data === 'function') {
      try {
        data(target);
      } catch (e) {
        console.warn('[TBO Performance] Erro ao aplicar atualizacao otimista:', e);
      }
    }

    // Indicador visual de operacao em andamento
    if (target && target instanceof HTMLElement) {
      target.style.transition = 'opacity 0.2s ease';
      target.style.opacity = '0.85';
    }

    // Executar chamada API
    return apiCall()
      .then(result => {
        // Sucesso: remover da lista de pendentes
        operation.status = 'completed';
        this._pendingOps = this._pendingOps.filter(op => op.id !== opId);

        // Restaurar opacidade
        if (target && target instanceof HTMLElement) {
          target.style.opacity = '1';
        }

        return result;
      })
      .catch(error => {
        // Falha: reverter UI
        operation.status = 'failed';
        this._pendingOps = this._pendingOps.filter(op => op.id !== opId);

        // Executar rollback
        if (rollback && typeof rollback === 'function') {
          try {
            rollback(target, previousState);
          } catch (e) {
            console.error('[TBO Performance] Erro ao executar rollback:', e);
          }
        } else if (target && target instanceof HTMLElement && previousState !== null) {
          // Rollback padrao: restaurar innerHTML anterior
          target.innerHTML = previousState;
        }

        // Restaurar opacidade
        if (target && target instanceof HTMLElement) {
          target.style.opacity = '1';
        }

        // Mostrar erro via toast
        const errorMsg = `Falha na operacao "${action || 'atualizacao'}". Alteracoes revertidas.`;
        if (typeof TBO_TOAST !== 'undefined' && TBO_TOAST.show) {
          TBO_TOAST.show(errorMsg, 'error');
        } else {
          console.error('[TBO Performance]', errorMsg, error);
        }

        throw error;
      });
  },

  /**
   * Retorna lista de operacoes em andamento
   * @returns {Array} Lista de operacoes pendentes
   */
  getPendingOps() {
    return this._pendingOps.filter(op => op.status === 'pending');
  },

  // =========================================================================
  // 6. PERFORMANCE MONITOR
  // =========================================================================

  /**
   * Inicializa o monitor de performance.
   * Rastreia FCP, tempos de renderizacao, respostas de API e uso de memoria.
   */
  initPerfMonitor() {
    // Observar First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this._recordMetric('fcp', {
                value: entry.startTime,
                timestamp: Date.now()
              });
            }
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
      } catch (e) {
        // Observer nao suportado
      }

      // Observar Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            this._recordMetric('lcp', {
              value: lastEntry.startTime,
              timestamp: Date.now()
            });
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // Observer nao suportado
      }

      // Observar Long Tasks (tarefas longas que bloqueiam a thread principal)
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              this._recordMetric('long_task', {
                duration: entry.duration,
                timestamp: Date.now()
              });
            }
          }
        });
        longTaskObserver.observe({ type: 'longtask', buffered: true });
      } catch (e) {
        // Observer nao suportado
      }
    }

    // Monitorar uso de memoria periodicamente
    if (performance.memory) {
      setInterval(() => {
        this._recordMetric('memory', {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }, 30000); // A cada 30 segundos
    }

    // Carregar metricas salvas do localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('tbo_perf_metrics') || '[]');
      this._perfMetrics = saved;
    } catch (e) {
      this._perfMetrics = [];
    }

    console.log('[TBO Performance] Monitor de performance inicializado.');
  },

  /**
   * Registrar uma metrica de performance
   * @param {string} type - Tipo da metrica
   * @param {Object} data - Dados da metrica
   */
  _recordMetric(type, data) {
    const metric = {
      type: type,
      data: data,
      timestamp: Date.now(),
      url: window.location.hash || window.location.pathname
    };

    this._perfMetrics.push(metric);

    // Manter apenas as ultimas 50 entradas
    if (this._perfMetrics.length > 50) {
      this._perfMetrics = this._perfMetrics.slice(-50);
    }

    // Persistir no localStorage
    try {
      localStorage.setItem('tbo_perf_metrics', JSON.stringify(this._perfMetrics));
    } catch (e) {
      // localStorage cheio
    }
  },

  /**
   * Registrar tempo de resposta de uma chamada API
   * @param {string} url - URL da API
   * @param {number} duration - Duracao em ms
   * @param {number} status - Status HTTP
   */
  recordApiTime(url, duration, status) {
    this._recordMetric('api_response', {
      url: url,
      duration: duration,
      status: status,
      timestamp: Date.now()
    });
  },

  /**
   * Registrar tempo de renderizacao de um modulo
   * @param {string} moduleName - Nome do modulo
   * @param {number} duration - Duracao em ms
   */
  recordRenderTime(moduleName, duration) {
    this._recordMetric('render_time', {
      module: moduleName,
      duration: duration,
      timestamp: Date.now()
    });
  },

  /**
   * Retorna resumo das metricas coletadas
   * @returns {Object} Resumo das metricas
   */
  getMetrics() {
    const metrics = this._perfMetrics;

    // Calcular medias por tipo
    const fcpEntries = metrics.filter(m => m.type === 'fcp');
    const apiEntries = metrics.filter(m => m.type === 'api_response');
    const renderEntries = metrics.filter(m => m.type === 'render_time');
    const memoryEntries = metrics.filter(m => m.type === 'memory');
    const longTaskEntries = metrics.filter(m => m.type === 'long_task');

    const avgApiTime = apiEntries.length > 0
      ? apiEntries.reduce((sum, m) => sum + m.data.duration, 0) / apiEntries.length
      : 0;

    const avgRenderTime = renderEntries.length > 0
      ? renderEntries.reduce((sum, m) => sum + m.data.duration, 0) / renderEntries.length
      : 0;

    const latestMemory = memoryEntries.length > 0
      ? memoryEntries[memoryEntries.length - 1].data
      : null;

    return {
      fcp: fcpEntries.length > 0 ? fcpEntries[0].data.value : null,
      mediaTempoApi: Math.round(avgApiTime),
      mediaTempoRenderizacao: Math.round(avgRenderTime),
      tarefasLongas: longTaskEntries.length,
      memoriaAtual: latestMemory ? {
        usadoMB: Math.round(latestMemory.usedJSHeapSize / 1048576),
        totalMB: Math.round(latestMemory.totalJSHeapSize / 1048576),
        limiteMB: Math.round(latestMemory.jsHeapSizeLimit / 1048576)
      } : null,
      totalMetricas: metrics.length,
      chamadasApi: apiEntries.length,
      renderizacoes: renderEntries.length
    };
  },

  /**
   * Renderiza dashboard visual de performance no container especificado
   * @param {string} containerId - ID do elemento container
   */
  renderPerfDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('[TBO Performance] Container nao encontrado:', containerId);
      return;
    }

    const metrics = this.getMetrics();
    const apiEntries = this._perfMetrics.filter(m => m.type === 'api_response').slice(-10);
    const renderEntries = this._perfMetrics.filter(m => m.type === 'render_time').slice(-10);

    // Funcao auxiliar para criar barras do grafico
    function createBar(label, value, maxValue, color) {
      const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
      return `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 11px; color: #aaa; width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${label}">${label}</span>
          <div style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 4px; height: 18px; overflow: hidden;">
            <div style="width: ${percentage}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.5s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 6px;">
              <span style="font-size: 10px; color: #fff; font-weight: 600;">${Math.round(value)}ms</span>
            </div>
          </div>
        </div>
      `;
    }

    // Determinar valor maximo para escala dos graficos
    const maxApiTime = apiEntries.length > 0
      ? Math.max(...apiEntries.map(m => m.data.duration), 100)
      : 100;
    const maxRenderTime = renderEntries.length > 0
      ? Math.max(...renderEntries.map(m => m.data.duration), 100)
      : 100;

    // Construir barras de API
    let apiBars = '';
    apiEntries.forEach(entry => {
      const urlShort = (entry.data.url || '').split('/').pop() || 'API';
      const color = entry.data.duration > 1000 ? '#e74c3c' : entry.data.duration > 500 ? '#f39c12' : '#27ae60';
      apiBars += createBar(urlShort, entry.data.duration, maxApiTime, color);
    });

    // Construir barras de renderizacao
    let renderBars = '';
    renderEntries.forEach(entry => {
      const color = entry.data.duration > 500 ? '#e74c3c' : entry.data.duration > 200 ? '#f39c12' : '#27ae60';
      renderBars += createBar(entry.data.module || 'Modulo', entry.data.duration, maxRenderTime, color);
    });

    // Memoria
    let memorySection = '';
    if (metrics.memoriaAtual) {
      const usedPct = Math.round((metrics.memoriaAtual.usadoMB / metrics.memoriaAtual.limiteMB) * 100);
      const memColor = usedPct > 80 ? '#e74c3c' : usedPct > 60 ? '#f39c12' : '#27ae60';
      memorySection = `
        <div style="margin-top: 16px;">
          <h4 style="color: #E85102; font-size: 13px; margin-bottom: 8px;">Uso de Memoria</h4>
          <div style="background: rgba(255,255,255,0.05); border-radius: 6px; height: 24px; overflow: hidden;">
            <div style="width: ${usedPct}%; height: 100%; background: ${memColor}; border-radius: 6px; display: flex; align-items: center; padding: 0 10px;">
              <span style="font-size: 11px; color: #fff; font-weight: 600;">${metrics.memoriaAtual.usadoMB}MB / ${metrics.memoriaAtual.limiteMB}MB</span>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="background: #1a1a24; border-radius: 12px; padding: 20px; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h3 style="color: #E85102; margin: 0 0 16px 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
          Monitor de Performance - TBO OS
        </h3>

        <!-- Metricas resumidas -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #888; margin-bottom: 4px;">FCP</div>
            <div style="font-size: 20px; font-weight: 700; color: ${metrics.fcp && metrics.fcp < 2000 ? '#27ae60' : '#f39c12'};">
              ${metrics.fcp ? Math.round(metrics.fcp) + 'ms' : 'N/A'}
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Media API</div>
            <div style="font-size: 20px; font-weight: 700; color: ${metrics.mediaTempoApi < 500 ? '#27ae60' : '#f39c12'};">
              ${metrics.mediaTempoApi}ms
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Media Render</div>
            <div style="font-size: 20px; font-weight: 700; color: ${metrics.mediaTempoRenderizacao < 200 ? '#27ae60' : '#f39c12'};">
              ${metrics.mediaTempoRenderizacao}ms
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Tarefas Longas</div>
            <div style="font-size: 20px; font-weight: 700; color: ${metrics.tarefasLongas > 5 ? '#e74c3c' : '#27ae60'};">
              ${metrics.tarefasLongas}
            </div>
          </div>
        </div>

        <!-- Grafico de tempos de API -->
        <div style="margin-bottom: 20px;">
          <h4 style="color: #E85102; font-size: 13px; margin-bottom: 8px;">Ultimas Chamadas API (${apiEntries.length})</h4>
          ${apiBars || '<p style="font-size: 12px; color: #666;">Nenhuma chamada registrada</p>'}
        </div>

        <!-- Grafico de tempos de renderizacao -->
        <div style="margin-bottom: 20px;">
          <h4 style="color: #E85102; font-size: 13px; margin-bottom: 8px;">Tempos de Renderizacao (${renderEntries.length})</h4>
          ${renderBars || '<p style="font-size: 12px; color: #666;">Nenhuma renderizacao registrada</p>'}
        </div>

        ${memorySection}

        <div style="margin-top: 16px; font-size: 11px; color: #555; text-align: right;">
          Total de metricas coletadas: ${metrics.totalMetricas}
        </div>
      </div>
    `;
  },

  // =========================================================================
  // 7. IMAGE OPTIMIZATION
  // =========================================================================

  /**
   * Otimiza uma imagem no client-side antes do upload.
   * Redimensiona mantendo a proporcao e comprime com qualidade ajustavel.
   *
   * @param {File} file - Arquivo de imagem selecionado pelo usuario
   * @param {number} maxWidth - Largura maxima em pixels (padrao: 1920)
   * @param {number} quality - Qualidade de compressao 0-1 (padrao: 0.8)
   * @returns {Promise<Blob>} Promise que resolve com o Blob otimizado
   */
  optimizeImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Arquivo fornecido nao e uma imagem valida.'));
        return;
      }

      const startTime = performance.now();
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Calcular dimensoes mantendo a proporcao
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = Math.round(height * ratio);
          }

          // Criar canvas para redimensionamento
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');

          // Aplicar suavizacao para melhor qualidade
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Desenhar imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Determinar formato de saida
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const outputQuality = outputType === 'image/png' ? undefined : quality;

          canvas.toBlob((blob) => {
            if (blob) {
              const duration = performance.now() - startTime;
              const reduction = Math.round((1 - blob.size / file.size) * 100);

              console.log(
                `[TBO Performance] Imagem otimizada: ${file.name} | ` +
                `${img.width}x${img.height} -> ${width}x${height} | ` +
                `${(file.size / 1024).toFixed(1)}KB -> ${(blob.size / 1024).toFixed(1)}KB | ` +
                `Reducao: ${reduction}% | Tempo: ${Math.round(duration)}ms`
              );

              this._recordMetric('image_optimization', {
                filename: file.name,
                originalSize: file.size,
                optimizedSize: blob.size,
                reduction: reduction,
                duration: duration
              });

              resolve(blob);
            } else {
              reject(new Error('Falha ao gerar blob da imagem otimizada.'));
            }
          }, outputType, outputQuality);
        };

        img.onerror = () => {
          reject(new Error('Falha ao carregar a imagem para otimizacao.'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Falha ao ler o arquivo de imagem.'));
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * Cria uma thumbnail (miniatura) quadrada de uma imagem.
   *
   * @param {File} file - Arquivo de imagem
   * @param {number} size - Dimensao da thumbnail em pixels (padrao: 150)
   * @returns {Promise<Blob>} Promise que resolve com o Blob da thumbnail
   */
  createThumbnail(file, size = 150) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Arquivo fornecido nao e uma imagem valida.'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Calcular crop centralizado para manter proporcao em formato quadrado
          let sx, sy, sWidth, sHeight;
          if (img.width > img.height) {
            // Imagem paisagem: cortar laterais
            sHeight = img.height;
            sWidth = img.height;
            sx = (img.width - sWidth) / 2;
            sy = 0;
          } else {
            // Imagem retrato: cortar topo/base
            sWidth = img.width;
            sHeight = img.width;
            sx = 0;
            sy = (img.height - sHeight) / 2;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Falha ao gerar thumbnail.'));
            }
          }, 'image/jpeg', 0.75);
        };

        img.onerror = () => {
          reject(new Error('Falha ao carregar imagem para thumbnail.'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Falha ao ler arquivo para thumbnail.'));
      };

      reader.readAsDataURL(file);
    });
  },

  // =========================================================================
  // 8. BUNDLE ANALYZER
  // =========================================================================

  /**
   * Analisa todos os scripts carregados na pagina.
   * Reporta tamanhos estimados, identifica duplicatas e sugere otimizacoes.
   *
   * @returns {Object} Relatorio da analise do bundle
   */
  analyzeBundle() {
    const scripts = document.querySelectorAll('script[src]');
    const inlineScripts = document.querySelectorAll('script:not([src])');
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

    const report = {
      scripts: [],
      inlineScripts: [],
      stylesheets: [],
      duplicatas: [],
      sugestoes: [],
      totalEstimado: 0,
      timestamp: Date.now()
    };

    // Analisar scripts externos
    const scriptSources = new Map();
    scripts.forEach(script => {
      const src = script.src;
      const filename = src.split('/').pop().split('?')[0];

      // Estimar tamanho baseado no conteudo (se acessivel via performance API)
      let estimatedSize = 0;
      const perfEntries = performance.getEntriesByName(src);
      if (perfEntries.length > 0) {
        estimatedSize = perfEntries[0].transferSize || perfEntries[0].encodedBodySize || 0;
      }

      const entry = {
        src: src,
        filename: filename,
        tamanhoEstimado: estimatedSize,
        tamanhoFormatado: this._formatBytes(estimatedSize),
        async: script.async,
        defer: script.defer,
        tipo: script.type || 'text/javascript'
      };

      report.scripts.push(entry);
      report.totalEstimado += estimatedSize;

      // Detectar duplicatas pelo nome do arquivo
      if (scriptSources.has(filename)) {
        report.duplicatas.push({
          arquivo: filename,
          ocorrencias: [scriptSources.get(filename), src]
        });
      } else {
        scriptSources.set(filename, src);
      }
    });

    // Analisar scripts inline
    inlineScripts.forEach((script, index) => {
      const content = script.textContent || '';
      const size = new Blob([content]).size;

      report.inlineScripts.push({
        indice: index,
        tamanho: size,
        tamanhoFormatado: this._formatBytes(size),
        previewConteudo: content.substring(0, 80).trim() + (content.length > 80 ? '...' : '')
      });

      report.totalEstimado += size;
    });

    // Analisar folhas de estilo
    stylesheets.forEach(link => {
      const href = link.href;
      let estimatedSize = 0;
      const perfEntries = performance.getEntriesByName(href);
      if (perfEntries.length > 0) {
        estimatedSize = perfEntries[0].transferSize || perfEntries[0].encodedBodySize || 0;
      }

      report.stylesheets.push({
        href: href,
        filename: href.split('/').pop().split('?')[0],
        tamanhoEstimado: estimatedSize,
        tamanhoFormatado: this._formatBytes(estimatedSize)
      });

      report.totalEstimado += estimatedSize;
    });

    // Gerar sugestoes de otimizacao
    if (report.duplicatas.length > 0) {
      report.sugestoes.push(
        `Encontradas ${report.duplicatas.length} duplicata(s) de scripts. Remova as copias extras.`
      );
    }

    const nonAsyncScripts = report.scripts.filter(s => !s.async && !s.defer);
    if (nonAsyncScripts.length > 2) {
      report.sugestoes.push(
        `${nonAsyncScripts.length} scripts sem async/defer. Considere adicionar esses atributos para nao bloquear a renderizacao.`
      );
    }

    const largeScripts = report.scripts.filter(s => s.tamanhoEstimado > 100000);
    if (largeScripts.length > 0) {
      report.sugestoes.push(
        `${largeScripts.length} script(s) acima de 100KB. Considere code-splitting ou carregamento lazy.`
      );
    }

    const largeInline = report.inlineScripts.filter(s => s.tamanho > 5000);
    if (largeInline.length > 0) {
      report.sugestoes.push(
        `${largeInline.length} script(s) inline acima de 5KB. Considere externalizar para melhor cacheamento.`
      );
    }

    if (report.totalEstimado > 500000) {
      report.sugestoes.push(
        `Tamanho total estimado de ${this._formatBytes(report.totalEstimado)}. Considere otimizar o bundle para melhor tempo de carregamento.`
      );
    }

    report.totalFormatado = this._formatBytes(report.totalEstimado);

    return report;
  },

  /**
   * Renderiza relatorio visual do bundle no estilo treemap
   * @param {string} containerId - ID do elemento container
   */
  renderBundleReport(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('[TBO Performance] Container nao encontrado:', containerId);
      return;
    }

    const report = this.analyzeBundle();

    // Combinar todos os recursos e ordenar por tamanho
    const allResources = [
      ...report.scripts.map(s => ({
        nome: s.filename,
        tamanho: s.tamanhoEstimado,
        tipo: 'Script',
        cor: '#E85102'
      })),
      ...report.stylesheets.map(s => ({
        nome: s.filename,
        tamanho: s.tamanhoEstimado,
        tipo: 'CSS',
        cor: '#3498db'
      })),
      ...report.inlineScripts.map(s => ({
        nome: `inline-${s.indice}`,
        tamanho: s.tamanho,
        tipo: 'Inline',
        cor: '#9b59b6'
      }))
    ].filter(r => r.tamanho > 0)
      .sort((a, b) => b.tamanho - a.tamanho);

    const maxSize = allResources.length > 0 ? allResources[0].tamanho : 1;

    // Construir blocos do treemap
    let treemapBlocks = '';
    allResources.forEach(resource => {
      // Tamanho proporcional do bloco (minimo 8% para visibilidade)
      const percentage = Math.max((resource.tamanho / maxSize) * 100, 8);

      treemapBlocks += `
        <div style="
          display: inline-flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 2px;
          background: ${resource.cor}22; border: 1px solid ${resource.cor}44;
          border-radius: 6px; padding: 8px; margin: 3px;
          min-width: ${Math.max(percentage * 1.5, 60)}px;
          height: ${Math.max(percentage * 0.6, 40)}px;
          overflow: hidden; cursor: default;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        " title="${resource.nome} - ${this._formatBytes(resource.tamanho)} (${resource.tipo})"
           onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px ${resource.cor}33';"
           onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
          <span style="font-size: 10px; font-weight: 600; color: ${resource.cor}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 100%;">${resource.nome}</span>
          <span style="font-size: 9px; color: #888;">${this._formatBytes(resource.tamanho)}</span>
        </div>
      `;
    });

    // Construir lista de sugestoes
    let suggestionsHtml = '';
    if (report.sugestoes.length > 0) {
      suggestionsHtml = report.sugestoes.map(s => `
        <div style="padding: 8px 12px; background: rgba(243,156,18,0.1); border-left: 3px solid #f39c12; border-radius: 0 6px 6px 0; margin-bottom: 6px; font-size: 12px; color: #ddd;">
          ${s}
        </div>
      `).join('');
    }

    // Construir lista de duplicatas
    let duplicatesHtml = '';
    if (report.duplicatas.length > 0) {
      duplicatesHtml = `
        <div style="margin-top: 16px;">
          <h4 style="color: #e74c3c; font-size: 13px; margin-bottom: 8px;">Scripts Duplicados</h4>
          ${report.duplicatas.map(d => `
            <div style="padding: 8px 12px; background: rgba(231,76,60,0.1); border-left: 3px solid #e74c3c; border-radius: 0 6px 6px 0; margin-bottom: 4px; font-size: 12px; color: #ddd;">
              <strong>${d.arquivo}</strong> - ${d.ocorrencias.length} ocorrencias
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div style="background: #1a1a24; border-radius: 12px; padding: 20px; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h3 style="color: #E85102; margin: 0 0 4px 0; font-size: 16px;">Analise do Bundle</h3>
        <p style="margin: 0 0 16px 0; font-size: 12px; color: #888;">
          ${report.scripts.length} scripts | ${report.stylesheets.length} CSS | ${report.inlineScripts.length} inline | Total: ${report.totalFormatado}
        </p>

        <!-- Legenda -->
        <div style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 11px;">
          <span style="color: #E85102;">&#9632; Scripts</span>
          <span style="color: #3498db;">&#9632; CSS</span>
          <span style="color: #9b59b6;">&#9632; Inline</span>
        </div>

        <!-- Treemap -->
        <div style="display: flex; flex-wrap: wrap; background: rgba(255,255,255,0.02); border-radius: 8px; padding: 6px; min-height: 80px; margin-bottom: 16px;">
          ${treemapBlocks || '<p style="font-size: 12px; color: #666; padding: 12px;">Nenhum recurso com tamanho mensuravel encontrado.</p>'}
        </div>

        <!-- Sugestoes de otimizacao -->
        ${report.sugestoes.length > 0 ? `
          <div style="margin-top: 16px;">
            <h4 style="color: #f39c12; font-size: 13px; margin-bottom: 8px;">Sugestoes de Otimizacao</h4>
            ${suggestionsHtml}
          </div>
        ` : ''}

        ${duplicatesHtml}
      </div>
    `;
  },

  /**
   * Formatar bytes em unidade legivel
   * @param {number} bytes - Valor em bytes
   * @returns {string} Valor formatado (ex: "15.3KB")
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  // =========================================================================
  // 9. REQUEST DEDUPLICATION
  // =========================================================================

  /**
   * Wrapper de fetch que previne requisicoes duplicadas concorrentes.
   * Se uma requisicao para a mesma URL ja esta em andamento, retorna a
   * mesma Promise ao inves de disparar outra.
   *
   * @param {string} url - URL da requisicao
   * @param {Object} options - Opcoes do fetch
   * @param {number} options.cacheTTL - Tempo de vida do cache em ms (padrao: 5000)
   * @returns {Promise<Response>} Promise com a resposta
   */
  dedupFetch(url, options = {}) {
    const { cacheTTL = 5000, ...fetchOptions } = options;

    // Gerar chave unica baseada na URL e metodo
    const method = (fetchOptions.method || 'GET').toUpperCase();
    const cacheKey = `${method}:${url}`;

    // Verificar se ja existe uma requisicao em andamento ou resposta cacheada
    const cached = this._dedupCache.get(cacheKey);
    if (cached) {
      // Verificar se o cache ainda e valido
      if (Date.now() - cached.timestamp < cacheTTL) {
        // Se a Promise original ainda esta pendente, retornar a mesma
        if (cached.pending) {
          return cached.promise;
        }
        // Se ja resolveu e esta dentro do TTL, retornar clone da resposta
        if (cached.response) {
          return Promise.resolve(cached.response.clone());
        }
      } else {
        // Cache expirado, remover
        this._dedupCache.delete(cacheKey);
      }
    }

    // Medir tempo de resposta
    const startTime = performance.now();

    // Criar nova requisicao
    const promise = fetch(url, fetchOptions)
      .then(response => {
        const duration = performance.now() - startTime;

        // Registrar metrica de API
        this.recordApiTime(url, duration, response.status);

        // Atualizar cache com a resposta
        const entry = this._dedupCache.get(cacheKey);
        if (entry) {
          entry.pending = false;
          entry.response = response.clone();
          entry.timestamp = Date.now();
        }

        return response;
      })
      .catch(error => {
        // Remover do cache em caso de erro
        this._dedupCache.delete(cacheKey);
        throw error;
      });

    // Armazenar no cache como pendente
    this._dedupCache.set(cacheKey, {
      promise: promise,
      pending: true,
      response: null,
      timestamp: Date.now()
    });

    return promise;
  },

  /**
   * Limpar todo o cache de deduplicacao
   */
  clearDedupCache() {
    this._dedupCache.clear();
    console.log('[TBO Performance] Cache de deduplicacao limpo.');
  },

  /**
   * Iniciar limpeza automatica do cache de deduplicacao
   */
  _startDedupCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this._dedupCache.entries()) {
        // Remover entradas com mais de 30 segundos
        if (now - entry.timestamp > 30000 && !entry.pending) {
          this._dedupCache.delete(key);
        }
      }
    }, 15000); // Limpar a cada 15 segundos
  },

  // =========================================================================
  // 10. PRELOAD HINTS
  // =========================================================================

  /**
   * Pre-carrega recursos de um modulo antes do usuario navegar ate ele.
   * Utiliza <link rel="prefetch"> para scripts e requestIdleCallback para dados.
   *
   * @param {string} moduleName - Nome do modulo a pre-carregar
   */
  preloadModule(moduleName) {
    // Evitar pre-carregar se ja foi feito
    if (this._preloadedModules.has(moduleName)) {
      return;
    }

    this._preloadedModules.add(moduleName);

    const scriptPath = this._resolveModulePath(moduleName);

    // Criar link de prefetch para o script do modulo
    const existingLink = document.querySelector(`link[href="${scriptPath}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = scriptPath;
      link.as = 'script';
      document.head.appendChild(link);
    }

    // Pre-buscar dados do modulo em idle time
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));

    idleCallback(() => {
      // Mapear modulos para endpoints de dados que podem ser pre-buscados
      const dataEndpoints = {
        'projects': '/api/projects?limit=10',
        'finance': '/api/finance/summary',
        'people': '/api/people?limit=20',
        'calendar': '/api/calendar/upcoming',
        'reports': '/api/reports/recent'
      };

      const endpoint = dataEndpoints[moduleName];
      if (endpoint) {
        // Pre-buscar dados usando dedupFetch (evitar duplicacao)
        this.dedupFetch(endpoint, { cacheTTL: 60000 })
          .then(() => {
            console.log(`[TBO Performance] Dados pre-carregados para: ${moduleName}`);
          })
          .catch(() => {
            // Falha silenciosa no prefetch de dados
          });
      }
    }, { timeout: 5000 });

    console.log(`[TBO Performance] Preload iniciado para modulo: ${moduleName}`);
  },

  /**
   * Prever e pre-carregar proximo modulo baseado em padroes de navegacao
   */
  _predictAndPreload() {
    try {
      const patterns = JSON.parse(localStorage.getItem('tbo_nav_patterns') || '[]');
      const currentHash = window.location.hash.replace('#/', '').replace('/', '') || 'dashboard';

      // Contar transicoes a partir da pagina atual
      const transitions = {};
      for (let i = 0; i < patterns.length - 1; i++) {
        if (patterns[i].module === currentHash) {
          const nextMod = patterns[i + 1].module;
          transitions[nextMod] = (transitions[nextMod] || 0) + 1;
        }
      }

      // Pre-carregar o modulo mais provavel
      const predicted = Object.entries(transitions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 1);

      if (predicted.length > 0) {
        this.preloadModule(predicted[0][0]);
      }
    } catch (e) {
      // Falha silenciosa na previsao
    }
  },

  /**
   * Configurar preload automatico baseado em eventos de navegacao
   */
  _setupPreloadListeners() {
    // Escutar mudancas de hash (navegacao SPA)
    window.addEventListener('hashchange', () => {
      // Registrar navegacao
      const currentModule = window.location.hash.replace('#/', '').replace('/', '') || 'dashboard';
      this._navigationHistory.push({
        module: currentModule,
        timestamp: Date.now()
      });
      this._saveNavigationPatterns();

      // Prever e pre-carregar proximo modulo
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
      idleCallback(() => {
        this._predictAndPreload();
      });
    });

    // Pre-carregar ao passar o mouse sobre links de navegacao
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href^="#/"], [data-module]');
      if (link) {
        const moduleName = link.dataset.module ||
          link.getAttribute('href').replace('#/', '').replace('/', '');
        if (moduleName) {
          this.preloadModule(moduleName);
        }
      }
    }, { passive: true });
  },

  // =========================================================================
  // INICIALIZACAO
  // =========================================================================

  /**
   * Inicializa o sistema completo de performance.
   * Configura monitoramento, deduplicacao e preload hints.
   */
  init() {
    if (this._initialized) {
      console.warn('[TBO Performance] Ja inicializado.');
      return;
    }

    console.log('[TBO Performance] Inicializando sistema de performance TBO OS...');

    // Carregar historico de navegacao
    try {
      const savedHistory = JSON.parse(localStorage.getItem('tbo_nav_patterns') || '[]');
      this._navigationHistory = savedHistory;
    } catch (e) {
      this._navigationHistory = [];
    }

    // 1. Iniciar monitor de performance
    this.initPerfMonitor();

    // 2. Configurar limpeza automatica do cache de deduplicacao
    this._startDedupCleanup();

    // 3. Configurar preload listeners
    this._setupPreloadListeners();

    // 4. Verificar prompt de instalacao PWA
    this.checkInstallPrompt();

    // 5. Injetar manifest PWA se nao existir
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifest = this.generateManifest();
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(blob);
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = manifestUrl;
      document.head.appendChild(link);
    }

    // 6. Prever modulo inicial apos carregamento da pagina
    window.addEventListener('load', () => {
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 500));
      idleCallback(() => {
        this._predictAndPreload();
      });
    });

    this._initialized = true;
    console.log('[TBO Performance] Sistema de performance inicializado com sucesso.');
  }
};
