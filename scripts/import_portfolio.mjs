#!/usr/bin/env node
// Portfolio import script — reads projetos-data and imports all images to Supabase Storage
// then outputs JSON results for SQL upsert

const TENANT_ID = '89080d1a-bc79-4c3f-8fce-20aabc561c0d';
const BASE_URL = 'https://wearetbo.com.br';
const SUPABASE_URL = 'https://olnndpultyllyhzxuyxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbm5kcHVsdHlsbHloenh1eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTUxNjMsImV4cCI6MjA4Njg3MTE2M30.PPhMqKsYKcRB6GFmWxogcc0HIggkojK0DumiB1NDAXU';
const BUCKET = 'marketing-assets';

async function importImage(path) {
  const url = BASE_URL + path;

  // Fetch original image
  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
  const contentType = imgRes.headers.get('content-type') ?? 'image/webp';
  const buffer = await imgRes.arrayBuffer();

  // Determine extension
  const extMap = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif' };
  const ext = extMap[contentType] ?? path.split('.').pop()?.split('?')[0] ?? 'webp';

  // Upload to Supabase Storage
  const objectPath = `${TENANT_ID}/website/${crypto.randomUUID()}.${ext}`;
  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'false',
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload failed (${uploadRes.status}): ${err}`);
  }

  // Return public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function mapCategory(tags) {
  const map = { branding: 'branding', 'digital-3d': 'archviz', marketing: 'campanha', audiovisual: 'outro' };
  return map[tags[0]] || 'outro';
}

// All 14 projects extracted from projetos-data.ts
const PROJECTS = [
  {
    slug: 'auma', name: 'AUMA', client: 'Grupo Thal', location: 'Curitiba, PR', year: 2025,
    tags: ['branding', 'digital-3d', 'marketing'], inPortfolio: true,
    services: ['Interiores', 'Branding', 'Digital 3D', 'Marketing'],
    heroImg: '/assets/portfolio/d3d/auma-fachada.webp',
    description: 'Naming, conceito de marca, identidade visual, logotipo, universo visual, paleta cromática e manual de aplicação. Perspectivas externas e internas, ambientação de áreas comuns e maquete eletrônica para o empreendimento AUMA.',
    challenge: 'O Grupo Thal precisava de um naming e de uma identidade visual que refletissem a singularidade do AUMA — um empreendimento de alto padrão concebido para um perfil de comprador exigente.',
    result: 'Criamos o naming, o universo visual completo e o manual de marca, além de perspectivas 3D de alta fidelidade de fachada, áreas comuns e internas.',
    galleryImages: [
      '/assets/portfolio/d3d/auma-fachada.webp',
      '/assets/portfolio/branding/auma-mockup1.webp',
      '/assets/portfolio/branding/auma-mockup2.webp',
      '/assets/portfolio/d3d/auma-piscina.webp',
      '/assets/portfolio/d3d/auma-fachada-detalhe.webp',
      '/assets/portfolio/d3d/auma-hall.webp',
      '/assets/portfolio/d3d/auma-salao-festas.webp',
      '/assets/portfolio/d3d/auma-academia.webp',
      '/assets/portfolio/d3d/auma-decorado-living.webp',
      '/assets/portfolio/branding/auma-etiqueta.webp',
      '/assets/portfolio/branding/auma-pdv.webp',
      '/assets/portfolio/branding/auma-sala.webp',
    ],
    metaTitle: 'AUMA — Case de Branding e Digital 3D',
    metaDesc: 'AUMA: identidade visual e renders 3D para empreendimento residencial do Grupo Thal em Curitiba, PR.',
  },
  {
    slug: 'giacomazzi', name: 'Giacomazzi', client: 'Construtora Giacomazzi', location: 'Curitiba, PR', year: null,
    tags: ['digital-3d'], inPortfolio: true,
    services: ['Digital 3D'],
    heroImg: '/assets/portfolio/d3d/giacomazzi-vero/fachada-frontal.webp',
    description: 'Renders estáticos e ambientação para o empreendimento Vero, da Construtora Giacomazzi.',
    challenge: 'A Construtora Giacomazzi precisava de visualizações arquitetônicas que permitissem ao comprador experimentar os espaços do Vero com total clareza antes da entrega das chaves.',
    result: 'Entregamos renders estáticos de alta fidelidade e ambientação completa dos espaços do empreendimento, com qualidade fotorrealista.',
    galleryImages: [
      '/assets/portfolio/d3d/giacomazzi-vero/fachada-frontal.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/fachada-arvore.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/fachada-noturna.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/fachada-detalhe.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/aerea_cam_09.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/aerea_cam02.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/aerea_cam10.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/cobertura.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/piscina_academia_r03.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/garden.webp',
      '/assets/portfolio/d3d/giacomazzi-vero/tipo-05.webp',
    ],
    metaTitle: 'Giacomazzi Vero — Case de Digital 3D',
    metaDesc: 'Giacomazzi Vero: renders 3D fotorrealistas para empreendimento residencial da Construtora Giacomazzi em Curitiba, PR.',
  },
  {
    slug: 'porto-alto', name: 'Porto Alto', client: 'Construtora Pessoa', location: 'Curitiba, PR', year: null,
    tags: ['branding', 'marketing', 'digital-3d', 'audiovisual'], inPortfolio: true,
    services: ['Branding', 'Marketing', 'Digital 3D', 'Audiovisual'],
    heroImg: '/assets/portfolio/d3d/porto-alto/porto-alto-fachada.webp',
    description: 'Projeto completo para o empreendimento residencial Porto Alto, da Construtora Pessoa. Conceito de marca, identidade visual, estratégia de marketing, visualização 3D e produção audiovisual para lançamento.',
    challenge: 'A Construtora Pessoa precisava de uma presença visual coesa para o Porto Alto — um residencial de alto padrão em Curitiba.',
    result: 'Entregamos um ecossistema completo de marca e comunicação que posicionou o Porto Alto como um dos lançamentos residenciais mais memoráveis da temporada em Curitiba.',
    galleryImages: [
      '/assets/portfolio/d3d/porto-alto/porto-alto-fachada.webp',
      '/assets/portfolio/d3d/porto-alto/porto-alto-hall.webp',
      '/assets/portfolio/d3d/porto-alto/porto-alto-living.webp',
      '/assets/portfolio/d3d/porto-alto/porto-alto-piscina.webp',
      '/assets/portfolio/d3d/porto-alto/porto-alto-patio-01.webp',
      '/assets/portfolio/d3d/porto-alto/porto-alto-patio-02.webp',
      '/assets/portfolio/d3d/porto-alto/porto-alto-playground.webp',
    ],
    metaTitle: 'Porto Alto — Case Completo de Branding e Digital 3D',
    metaDesc: 'Projeto completo de branding, marketing, Digital 3D e audiovisual para empreendimento residencial da Construtora Pessoa em Curitiba, PR.',
  },
  {
    slug: 'nura', name: 'NURA', client: 'GRP Construtora', location: 'Maringá, PR', year: null,
    tags: ['branding', 'marketing', 'digital-3d', 'audiovisual'], inPortfolio: true,
    services: ['Branding', 'Marketing', 'Digital 3D', 'Audiovisual'],
    heroImg: '/assets/portfolio/d3d/nura-fachada.webp',
    description: 'Conceito de marca, identidade visual, logotipo, universo visual e paleta cromática. Planejamento estratégico de lançamento, campanha digital, social media e gestão de tráfego. Perspectivas externas de fachada, áreas de lazer, piscina e ambientação. Filme de lançamento, teaser e conteúdo audiovisual.',
    challenge: 'A GRP Construtora queria lançar o NURA como um empreendimento de referência — com campanha integrada do naming ao audiovisual.',
    result: 'Entregamos naming, identidade visual completa, estratégia de marketing digital com gestão de tráfego, visualizações 3D e produção do filme de lançamento.',
    galleryImages: [
      '/assets/portfolio/d3d/nura-fachada.webp',
      '/assets/portfolio/d3d/nura-fachada-detalhe.webp',
      '/assets/portfolio/d3d/nura-piscina.webp',
      '/assets/portfolio/d3d/nura-piscina-02.webp',
      '/assets/portfolio/d3d/nura-gourmet-01.webp',
      '/assets/portfolio/d3d/nura-gourmet-02.webp',
      '/assets/portfolio/d3d/nura-lounge.webp',
      '/assets/portfolio/d3d/nura-festas.webp',
      '/assets/portfolio/d3d/nura-pub.webp',
      '/assets/portfolio/d3d/nura-fitness-outdoor.webp',
    ],
    metaTitle: 'NURA — Case de Branding, Marketing e Digital 3D',
    metaDesc: 'NURA: branding, marketing digital, renders 3D e audiovisual para lançamento imobiliário de alto padrão em Maringá, PR.',
  },
  {
    slug: 'mirage', name: 'Mirage Sky Houses', client: 'Base Empreendimentos', location: 'Sorriso, MT', year: 2025,
    tags: ['branding', 'digital-3d'], inPortfolio: true,
    services: ['Branding', 'Digital 3D'],
    heroImg: '/assets/portfolio/d3d/mirage-fachada.webp',
    description: 'Naming, conceito de marca, identidade visual, logotipo, universo visual, paleta cromática e manual de aplicação. Perspectivas externas e internas, ambientação de áreas comuns e maquete eletrônica para o empreendimento Mirage Sky Houses.',
    challenge: 'A Base Empreendimentos precisava lançar as Mirage Sky Houses com uma marca que comunicasse exclusividade absoluta.',
    result: 'Criamos o naming, o universo visual completo e visualizações 3D que capturaram a essência do produto.',
    galleryImages: [
      '/assets/portfolio/d3d/mirage-fachada.webp',
      '/assets/portfolio/d3d/mirage-diurna.webp',
      '/assets/portfolio/d3d/mirage-noturna1.webp',
      '/assets/portfolio/d3d/mirage-gourmet.webp',
      '/assets/portfolio/d3d/mirage-noturna2.webp',
      '/assets/portfolio/d3d/mirage-wine.webp',
    ],
    metaTitle: 'Mirage Sky Houses — Case de Branding e Digital 3D',
    metaDesc: 'Mirage Sky Houses: naming, branding e Digital 3D para empreendimento residencial de luxo em Sorriso, MT.',
  },
  {
    slug: 'construtora-pessoa', name: 'Construtora Pessoa', client: 'Construtora Pessoa', location: 'Curitiba, PR', year: null,
    tags: ['branding', 'audiovisual'], inPortfolio: true,
    services: ['Branding', 'Audiovisual'],
    heroImg: '/assets/portfolio/branding/copessoa-01.webp',
    description: 'Identidade visual institucional, logotipo, universo visual, paleta cromática e materiais de comunicação corporativa. Filme institucional, vídeo manifesto e conteúdo audiovisual para posicionamento de marca.',
    challenge: 'A Construtora Pessoa precisava de uma identidade institucional que refletisse sua tradição e credibilidade no mercado curitibano.',
    result: 'Criamos o sistema visual institucional completo além de filme institucional e vídeo manifesto que consolidaram a identidade da construtora.',
    galleryImages: [
      '/assets/portfolio/branding/copessoa-01.webp',
      '/assets/portfolio/branding/copessoa-02.webp',
      '/assets/portfolio/branding/copessoa-03.webp',
      '/assets/portfolio/branding/copessoa-04.webp',
    ],
    metaTitle: 'Construtora Pessoa — Case de Branding e Audiovisual',
    metaDesc: 'Construtora Pessoa: branding institucional completo e produção audiovisual para construtora de alto padrão em Curitiba, PR.',
  },
  {
    slug: 'bsa', name: 'Baggio Schiavon', client: 'BSA — Baggio Schiavon Arquitetura', location: 'Curitiba, PR', year: null,
    tags: ['audiovisual'], inPortfolio: true,
    services: ['Audiovisual'],
    heroImg: '/assets/portfolio/audiovisual/bsa/hero.webp',
    description: 'Minidocumentário institucional para o escritório de arquitetura Baggio Schiavon. O filme captura a essência do trabalho do escritório, sua filosofia projetual e o olhar sobre a arquitetura contemporânea em Curitiba.',
    challenge: 'O escritório Baggio Schiavon precisava de um filme institucional que fosse além do portfólio — um documento visual que capturasse a filosofia projetual.',
    result: 'Produzimos um minidocumentário em parceria com a Guanaco Filmes que traduz em imagens a essência do trabalho da BSA.',
    galleryImages: [
      '/assets/portfolio/audiovisual/bsa/hero.webp',
    ],
    metaTitle: 'Baggio Schiavon — Case de Audiovisual',
    metaDesc: 'Minidocumentário institucional para o escritório Baggio Schiavon Arquitetura — produção audiovisual de alto padrão em Curitiba, PR.',
  },
  {
    slug: 'viplan', name: 'Viplan', client: 'Viplan', location: 'Campo Alegre, SC', year: null,
    tags: ['digital-3d'], inPortfolio: true,
    services: ['Digital 3D'],
    heroImg: '/assets/portfolio/d3d/viplan-terrano/fachada-01.webp',
    description: 'Renders estáticos e ambientação para o empreendimento Terrano, da Viplan.',
    challenge: 'A Viplan precisava de visualizações arquitetônicas para o Terrano que comunicassem com fidelidade o projeto e o padrão construtivo.',
    result: 'Entregamos renders estáticos e ambientação de alta qualidade que permitiram à Viplan apresentar o Terrano com clareza e confiança.',
    galleryImages: [
      '/assets/portfolio/d3d/viplan-terrano/fachada-01.webp',
      '/assets/portfolio/d3d/viplan-terrano/fachada-02.webp',
      '/assets/portfolio/d3d/viplan-terrano/aerea.webp',
      '/assets/portfolio/d3d/viplan-terrano/fachada-03.webp',
      '/assets/portfolio/d3d/viplan-terrano/duplex-superior.webp',
      '/assets/portfolio/d3d/viplan-terrano/suite.webp',
      '/assets/portfolio/d3d/viplan-terrano/salao-festas.webp',
      '/assets/portfolio/d3d/viplan-terrano/wellness.webp',
    ],
    metaTitle: 'Viplan Terrano — Case de Digital 3D',
    metaDesc: 'Viplan Terrano: renders arquitetônicos e ambientação para empreendimento residencial em Campo Alegre, SC.',
  },
  {
    slug: 'san-gimignano', name: 'San Gimignano', client: 'Gessi Empreendimentos', location: 'Curitiba, PR', year: null,
    tags: ['digital-3d'], inPortfolio: true,
    services: ['Digital 3D'],
    heroImg: '/assets/portfolio/d3d/san-gimignano/living-3.webp',
    description: 'Visualização arquitetônica completa para o San Gimignano, empreendimento residencial de alto padrão da Gessi Empreendimentos em Curitiba.',
    challenge: 'A Gessi Empreendimentos precisava de visualizações fotorrealistas que transportassem o comprador para dentro dos espaços do San Gimignano antes do início da obra.',
    result: 'Entregamos visualização arquitetônica completa dos principais ambientes com qualidade fotorrealista que se tornou o principal ativo visual do lançamento.',
    galleryImages: [
      '/assets/portfolio/d3d/san-gimignano/living-1.webp',
      '/assets/portfolio/d3d/san-gimignano/living-2.webp',
      '/assets/portfolio/d3d/san-gimignano/living-3.webp',
      '/assets/portfolio/d3d/san-gimignano/gourmet-1.webp',
      '/assets/portfolio/d3d/san-gimignano/gourmet-2.webp',
      '/assets/portfolio/d3d/san-gimignano/pav_2_suite-master.webp',
      '/assets/portfolio/d3d/san-gimignano/pav_2_banheiro.webp',
      '/assets/portfolio/d3d/san-gimignano/pav_2_home.webp',
    ],
    metaTitle: 'San Gimignano — Case de Digital 3D',
    metaDesc: 'San Gimignano: visualização arquitetônica completa para empreendimento residencial de alto padrão da Gessi Empreendimentos em Curitiba, PR.',
  },
  {
    slug: 'the-balance', name: 'The Balance', client: 'O3 Empreendimentos', location: 'Curitiba, PR', year: null,
    tags: ['digital-3d'], inPortfolio: true,
    services: ['Digital 3D'],
    heroImg: '/assets/portfolio/d3d/balance-fachada.webp',
    description: 'Renders estáticos de fachada, perspectivas internas e ambientação de empreendimento para o projeto The Balance.',
    challenge: 'A O3 Empreendimentos precisava de visualizações 3D para o The Balance que comunicassem de forma clara a proposta arquitetônica.',
    result: 'Entregamos renders fotorrealistas de fachada, perspectivas internas e ambientação que geraram material visual de alto impacto.',
    galleryImages: [
      '/assets/portfolio/d3d/balance-fachada.webp',
    ],
    metaTitle: 'The Balance — Case de Digital 3D',
    metaDesc: 'The Balance: renders 3D fotorrealistas para empreendimento residencial da O3 Empreendimentos em Curitiba, PR.',
  },
  {
    slug: 'arthaus', name: 'Arthaus', client: 'Arthaus', location: 'Curitiba, PR', year: null,
    tags: ['branding', 'audiovisual', 'digital-3d'], inPortfolio: false,
    services: ['Branding', 'Audiovisual', 'Digital 3D'],
    heroImg: '/assets/portfolio/branding/arthaus-01.webp',
    description: 'Conceito de marca, identidade visual, logotipo, universo visual e paleta cromática. Filme de lançamento, teaser e conteúdo audiovisual. Perspectivas externas e internas e ambientação para o empreendimento Arthaus.',
    challenge: 'O empreendimento Arthaus precisava de uma marca que refletisse sua curadoria estética e sustentasse uma campanha de lançamento de alto impacto.',
    result: 'Entregamos conceito de marca, identidade visual completa, perspectivas 3D e produção audiovisual — um sistema visual coeso referência no segmento premium de Curitiba.',
    galleryImages: [
      '/assets/portfolio/branding/arthaus-01.webp',
    ],
    metaTitle: 'Arthaus — Case de Branding Imobiliário',
    metaDesc: 'Arthaus Incorporadora: branding completo, audiovisual e Digital 3D para construtora de alto padrão em Curitiba, PR.',
  },
  {
    slug: 'vero', name: 'VERO', client: 'Vero', location: 'Curitiba, PR', year: null,
    tags: ['digital-3d'], inPortfolio: false,
    services: ['Digital 3D'],
    heroImg: '/assets/portfolio/d3d/vero-fachada.webp',
    description: 'Renders estáticos de fachada, perspectivas internas e ambientação de empreendimento para o projeto Vero.',
    challenge: 'O projeto Vero precisava de visualizações que traduzissem sua sofisticação arquitetônica em imagens de alto impacto.',
    result: 'Desenvolvemos perspectivas internas e externas com acabamento fotográfico que evidenciaram os pontos fortes do projeto.',
    galleryImages: [
      '/assets/portfolio/d3d/vero-fachada.webp',
    ],
    metaTitle: 'VERO — Case de Digital 3D',
    metaDesc: 'Vero: renders 3D fotorrealistas para empreendimento residencial em Curitiba, PR.',
  },
  {
    slug: 'amaran', name: 'Amaran', client: 'Arthaus Incorporadora', location: 'Penha, SC', year: null,
    tags: ['branding', 'digital-3d', 'audiovisual'], inPortfolio: false,
    services: ['Branding', 'Digital 3D', 'Audiovisual'],
    heroImg: '/assets/portfolio/d3d/amaran-fachada.webp',
    description: 'Conceito de marca, identidade visual, materiais de comunicação, visualização 3D com renders de fachada e perspectivas internas, e produção audiovisual para o empreendimento Amaran.',
    challenge: 'A Arthaus Incorporadora buscava uma identidade que diferenciasse o Amaran no competitivo mercado catarinense.',
    result: 'Desenvolvemos o conceito de marca, identidade visual, visualizações 3D e coordenamos a produção audiovisual — uma comunicação integrada que antecipou o valor do empreendimento.',
    galleryImages: [
      '/assets/portfolio/d3d/amaran-fachada.webp',
      '/assets/portfolio/d3d/amaran-noturna.webp',
      '/assets/portfolio/d3d/amaran-entrada.webp',
      '/assets/portfolio/d3d/amaran-praia.webp',
      '/assets/portfolio/d3d/amaran-vista-mar.webp',
      '/assets/portfolio/d3d/amaran-praia-2.webp',
      '/assets/portfolio/d3d/amaran/piscina.webp',
      '/assets/portfolio/d3d/amaran/poolbar.webp',
      '/assets/portfolio/d3d/amaran/deck-molhado.webp',
      '/assets/portfolio/d3d/amaran/corredor-piscina.webp',
      '/assets/portfolio/d3d/amaran/festas-externo.webp',
      '/assets/portfolio/d3d/amaran/fire-pit.webp',
      '/assets/portfolio/d3d/amaran/playground.webp',
      '/assets/portfolio/branding/amaran/amaran-outdoor.webp',
      '/assets/portfolio/branding/amaran/amaran-sacola.webp',
      '/assets/portfolio/branding/amaran/amaran-bolsa.webp',
      '/assets/portfolio/branding/amaran/amaran-toalha.webp',
      '/assets/portfolio/branding/amaran/amaran-cadeira.webp',
      '/assets/portfolio/branding/amaran/amaran-guarda-sol.webp',
    ],
    metaTitle: 'Amaran — Case de Branding e Digital 3D',
    metaDesc: 'Amaran: branding, Digital 3D e audiovisual para empreendimento residencial da Arthaus Incorporadora em Penha, SC.',
  },
  {
    slug: 'axis', name: 'Axis', client: 'GRP Construtora', location: 'Maringá, PR', year: null,
    tags: ['branding', 'marketing', 'digital-3d'], inPortfolio: false,
    services: ['Branding', 'Marketing', 'Digital 3D'],
    heroImg: '/assets/portfolio/d3d/axis-fachada.webp',
    description: 'Conceito de marca, identidade visual, logotipo, paleta cromática e aplicações de marca. Estratégia de marketing digital com criativos para redes sociais. Perspectivas externas, fachada e ambientação de áreas comuns para o empreendimento Axis.',
    challenge: 'A GRP Construtora precisava lançar o Axis com uma estratégia de comunicação diferenciada — alcançando o mercado aberto mas também conquistando vizinhos.',
    result: 'Desenvolvemos a identidade visual do Axis, criativos para redes sociais e uma carta exclusiva para vizinhos — ação que ampliou o alcance da campanha e trouxe leads orgânicos de alta qualidade.',
    galleryImages: [
      '/assets/portfolio/d3d/axis-fachada.webp',
      '/assets/portfolio/d3d/axis-entrada.webp',
      '/assets/portfolio/d3d/axis-piscina.webp',
      '/assets/portfolio/d3d/axis-terraco.webp',
      '/assets/portfolio/d3d/axis-lounge.webp',
      '/assets/portfolio/branding/axis-01.webp',
      '/assets/portfolio/branding/axis-carta.webp',
      '/assets/portfolio/branding/axis-social-01.webp',
      '/assets/portfolio/branding/axis-social-02.webp',
      '/assets/portfolio/branding/axis-social-03.webp',
    ],
    metaTitle: 'Axis — Case de Branding e Marketing Digital',
    metaDesc: 'Axis: branding e Digital 3D para empreendimento residencial da GRP Construtora em Maringá, PR.',
  },
];

async function main() {
  const stats = { created: 0, updated: 0, skipped: 0, images: 0, errors: [] };
  const results = [];

  for (const [i, project] of PROJECTS.entries()) {
    console.error(`[${i + 1}/${PROJECTS.length}] Processing: ${project.slug}`);

    // Build unique image paths
    const uniquePaths = [...new Set([project.heroImg, ...project.galleryImages])];
    const urlMap = {};

    for (const imgPath of uniquePaths) {
      try {
        await sleep(500);
        const publicUrl = await importImage(imgPath);
        urlMap[imgPath] = publicUrl;
        stats.images++;
        console.error(`  ✓ ${imgPath.split('/').pop()}`);
      } catch (e) {
        const errMsg = `${project.slug}|${imgPath}: ${e.message}`;
        stats.errors.push(errMsg);
        console.error(`  ✗ ${imgPath.split('/').pop()}: ${e.message}`);
        urlMap[imgPath] = BASE_URL + imgPath; // fallback
      }
    }

    const coverUrl = urlMap[project.heroImg];
    const gallery = project.galleryImages.map((p) => urlMap[p]).filter(Boolean);

    results.push({
      slug: project.slug,
      name: project.name,
      client_name: project.client,
      location: project.location,
      year: project.year,
      category: mapCategory(project.tags),
      cover_url: coverUrl,
      gallery,
      description: project.description,
      challenge: project.challenge,
      result: project.result,
      services: project.services,
      status: project.inPortfolio ? 'publicado' : 'rascunho',
      sort_order: i,
      seo_title: project.metaTitle,
      seo_description: project.metaDesc,
      published_at: project.inPortfolio ? new Date().toISOString() : null,
    });
  }

  console.error('\n=== IMPORT COMPLETE ===');
  console.error(`Images imported: ${stats.images}`);
  console.error(`Errors: ${stats.errors.length}`);
  if (stats.errors.length > 0) {
    stats.errors.forEach((e) => console.error(`  ERROR: ${e}`));
  }

  // Output JSON to stdout for SQL generation
  console.log(JSON.stringify({ results, stats }, null, 2));
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
