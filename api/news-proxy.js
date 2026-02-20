// Vercel Serverless Function — CORS Proxy para noticias de mercado imobiliario
// Routes: /api/news-proxy?source=google_news | infomoney | valor
// Busca noticias reais via Google News RSS + APIs publicas
// Seguranca: CORS whitelist, rate limiting

const ALLOWED_ORIGINS = [
  'https://tbo-dashboard-main.vercel.app',
  'https://tbo-os.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// Rate limiting em memoria
const rateLimiter = {};
const RATE_LIMIT = 30; // requisicoes por minuto
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(identifier) {
  const now = Date.now();
  if (!rateLimiter[identifier]) {
    rateLimiter[identifier] = { count: 1, resetAt: now + RATE_WINDOW };
    return true;
  }
  if (now > rateLimiter[identifier].resetAt) {
    rateLimiter[identifier] = { count: 1, resetAt: now + RATE_WINDOW };
    return true;
  }
  rateLimiter[identifier].count++;
  return rateLimiter[identifier].count <= RATE_LIMIT;
}

// ── Fontes de noticias via Google News RSS ──
const NEWS_QUERIES = {
  'mercado_imobiliario': 'mercado+imobiliário+Brasil',
  'lancamentos_curitiba': 'lançamentos+imobiliários+Curitiba',
  'incorporadoras': 'incorporadoras+imobiliárias+Brasil',
  'selic_imoveis': 'Selic+mercado+imobiliário',
  'construcao_civil': 'construção+civil+Brasil+custos',
  'curitiba_imoveis': 'imóveis+Curitiba+Paraná',
  'archviz_3d': 'visualização+3D+arquitetura+mercado',
  'real_estate_tech': 'proptech+Brasil+imobiliário'
};

// Parsear XML RSS do Google News de forma simples (sem dependencias)
function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const getTag = (tag) => {
      const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const m = itemXml.match(r);
      return m ? (m[1] || m[2] || '').trim() : '';
    };

    const title = getTag('title');
    const link = getTag('link');
    const pubDate = getTag('pubDate');
    const description = getTag('description');
    const source = getTag('source');

    if (title) {
      // Limpar HTML do description
      const cleanDesc = description.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

      items.push({
        title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
        url: link,
        date: pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        summary: cleanDesc.substring(0, 300),
        source: source || _extractSourceFromUrl(link),
        category: 'mercado'
      });
    }
  }
  return items;
}

function _extractSourceFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const nameMap = {
      'valor.globo.com': 'Valor Econômico',
      'infomoney.com.br': 'InfoMoney',
      'folha.uol.com.br': 'Folha de São Paulo',
      'estadao.com.br': 'Estadão',
      'exame.com': 'Exame',
      'bloomberg.com': 'Bloomberg',
      'reuters.com': 'Reuters',
      'g1.globo.com': 'G1',
      'uol.com.br': 'UOL',
      'terra.com.br': 'Terra',
      'secovipr.com.br': 'SECOVI-PR',
      'abrainc.org.br': 'ABRAINC',
      'cbic.org.br': 'CBIC',
      'brain.srv.br': 'Brain',
      'cupola.com.br': 'Cúpola',
      'imobireport.com.br': 'Imobi Report'
    };
    return nameMap[hostname] || hostname;
  } catch {
    return 'Fonte';
  }
}

// Categorizar noticia baseado no titulo/conteudo
function categorizeNews(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  if (/lanc|empreendimento|residencial|apartamento|studio|flat/i.test(text)) return 'lancamentos';
  if (/selic|juros|ipca|incc|inflacao|indicador|pib/i.test(text)) return 'indicadores';
  if (/incorporadora|construtora|mrv|cyrela|eztec|tenda|gafisa|direcional/i.test(text)) return 'incorporadoras';
  if (/tendencia|futuro|projec|inovac|proptech|tech|digital|ia|inteligencia/i.test(text)) return 'tendencias';
  if (/custo|material|mao.de.obra|cub|ciment|aco|ferro/i.test(text)) return 'custos';
  if (/financiamento|credito|sbpe|fgts|habitac/i.test(text)) return 'financiamento';
  if (/curitiba|parana|parana|cwb|rmc/i.test(text)) return 'curitiba';
  return 'mercado';
}

// Detectar regiao
function detectRegion(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  if (/curitiba|cwb|parana|paraná/i.test(text)) return 'curitiba';
  if (/são paulo|sp|paulista/i.test(text)) return 'sao_paulo';
  if (/rio de janeiro|carioca/i.test(text)) return 'rio_de_janeiro';
  return 'nacional';
}

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting por IP
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { queries, limit } = req.query;
  const maxItems = Math.min(parseInt(limit) || 30, 50);

  // Determinar quais queries buscar
  const queryKeys = queries ? queries.split(',').filter(k => NEWS_QUERIES[k]) : Object.keys(NEWS_QUERIES);

  try {
    let allNews = [];

    // Buscar de multiplas queries em paralelo
    const fetchPromises = queryKeys.slice(0, 6).map(async (key) => {
      const query = NEWS_QUERIES[key];
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(rssUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'TBO-OS-NewsProxy/1.0'
          }
        });
        clearTimeout(timeout);

        if (!response.ok) return [];

        const xml = await response.text();
        const items = parseRSSItems(xml);

        // Enriquecer com categoria e regiao
        return items.map(item => ({
          ...item,
          category: categorizeNews(item.title, item.summary),
          region: detectRegion(item.title, item.summary),
          query_source: key
        }));
      } catch (e) {
        console.warn(`Falha ao buscar ${key}:`, e.message);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    results.forEach(items => { allNews = allNews.concat(items); });

    // Deduplicar por titulo similar (fuzzy)
    const seen = new Set();
    allNews = allNews.filter(item => {
      const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Ordenar por data (mais recente primeiro)
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limitar
    allNews = allNews.slice(0, maxItems);

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800'); // 15min cache
    return res.status(200).json({
      success: true,
      count: allNews.length,
      updated_at: new Date().toISOString(),
      news: allNews
    });
  } catch (e) {
    console.error('News proxy error:', e);
    return res.status(500).json({ error: 'Falha ao buscar noticias', details: e.message });
  }
}
