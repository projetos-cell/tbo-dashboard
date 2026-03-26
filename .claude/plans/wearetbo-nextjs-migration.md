# Migracao wearetbo.com.br → Next.js

## Escopo Total
Site estatico HTML/CSS/JS → Next.js 14 (App Router) + Supabase (blog CMS)

### Paginas a migrar:
- index.html (homepage, 2798 linhas)
- sobre.html (1719 linhas)
- contato.html (659 linhas)
- portfolio.html (604 linhas)
- servicos.html (593 linhas)
- blog.html (920 linhas) + 13 artigos individuais
- 14 paginas de projetos (projetos/*.html)
- 5 paginas de servicos (servicos/*.html)
- 404.html, cookies.html, privacidade.html, termos.html, processos.html
- em-breve.html, iconografia.html

### Assets:
- css/common.css, css/tokens.css, css/cookie-consent.css
- js/main.js, js/i18n.js, js/footer.js, js/analytics.js, js/cookie-consent.js, js/perf.js
- assets/ (imagens, videos, fontes)

---

## FASE 1 — Scaffold Next.js + Infraestrutura (microfases 1.1–1.5)

### 1.1 — Criar projeto Next.js dentro de wearetbo-site
- `npx create-next-app@latest wearetbo-next --typescript --tailwind --app --src-dir`
- Configurar: next.config.ts, tailwind.config, tsconfig
- Copiar assets/ para public/assets/
- Instalar dependencias: framer-motion, @tabler/icons-react

### 1.2 — Design tokens + CSS global
- Converter css/tokens.css → tailwind theme (cores, fontes, espacamentos)
- Converter css/common.css → globals.css + tailwind utilities
- Garantir dark mode se aplicavel

### 1.3 — Layout raiz + Head/SEO
- Criar app/layout.tsx com GTM, meta tags globais, fonts
- Criar componentes: Header, Footer, CookieConsent
- Migrar js/analytics.js → componente Analytics
- Migrar js/cookie-consent.js → componente CookieConsent

### 1.4 — Componentes compartilhados
- Migrar footer (js/footer.js → Footer component)
- Migrar i18n (js/i18n.js → hook useI18n ou next-intl)
- Criar componentes reutilizaveis: Button, Section, Container, AnimatedSection

### 1.5 — Vercel config + deploy inicial
- Configurar vercel.json com headers (CSP, HSTS, etc.)
- Configurar redirects de URLs antigas
- Deploy de teste (pagina placeholder)

---

## FASE 2 — Paginas principais (microfases 2.1–2.5)

### 2.1 — Homepage (index.html)
- Converter hero section (video + preloader)
- Converter secoes: servicos, portfolio highlight, depoimentos, CTA
- Animacoes com framer-motion (scroll-triggered)

### 2.2 — Sobre (sobre.html)
- Converter todas as secoes
- Timeline, equipe, valores

### 2.3 — Contato (contato.html)
- Formulario com Formspree
- Mapa, informacoes de contato

### 2.4 — Servicos (servicos.html + servicos/*.html)
- Pagina index de servicos
- 5 sub-paginas: audiovisual, branding, digital-3d, gamificacao, marketing
- Rotas dinamicas: app/servicos/[slug]/page.tsx

### 2.5 — Portfolio (portfolio.html + projetos/*.html)
- Grid de projetos
- 14 paginas individuais de projetos
- Rotas dinamicas: app/projetos/[slug]/page.tsx

---

## FASE 3 — Blog CMS + integracao Supabase (microfases 3.1–3.4)

### 3.1 — Blog listing (blog.html → app/blog/page.tsx)
- Conectar com Supabase (tabela blog_posts)
- SSG com revalidate para SEO
- Grid de artigos, filtros por tag
- Policy publica para SELECT de posts publicados

### 3.2 — Blog post individual (blog/*.html → app/blog/[slug]/page.tsx)
- Migrar 13 artigos existentes para Supabase (INSERT)
- Renderizar body HTML do TipTap
- Meta tags dinamicas (OG, Twitter Cards)
- generateStaticParams para SSG

### 3.3 — Migrar artigos existentes
- Script para parsear os 13 HTMLs de blog e inserir no Supabase
- Extrair: titulo, slug, excerpt, body, tags, data

### 3.4 — Sitemap + RSS
- Gerar sitemap.xml dinamico
- RSS feed opcional

---

## FASE 4 — Paginas secundarias + polish (microfases 4.1–4.4)

### 4.1 — Paginas legais
- privacidade.html, termos.html, cookies.html → app/(legal)/

### 4.2 — Paginas utilitarias
- 404.html → app/not-found.tsx
- em-breve.html, iconografia.html, processos.html

### 4.3 — Performance + Lighthouse
- Image optimization (next/image)
- Font optimization (next/font)
- Core Web Vitals audit
- Lazy loading, code splitting

### 4.4 — DNS cutover
- Apontar wearetbo.com.br para novo deploy Vercel
- Redirects 301 de URLs antigas
- Validar indexacao Google

### 4.5 — Cleanup pos-migracao
- Deletar arquivos HTML estaticos que foram migrados (index.html, sobre.html, contato.html, portfolio.html, servicos.html, blog.html, etc.)
- Deletar pasta blog/ (artigos HTML — agora vivem no Supabase)
- Deletar pasta projetos/ e servicos/ (HTMLs individuais — agora sao rotas dinamicas Next.js)
- Deletar css/common.css, css/tokens.css (substituidos por Tailwind + globals.css)
- Deletar js/main.js, js/i18n.js, js/footer.js, js/analytics.js, js/cookie-consent.js, js/perf.js (substituidos por componentes React)
- Deletar 404.html, cookies.html, privacidade.html, termos.html, em-breve.html, iconografia.html, processos.html
- Deletar vercel.json antigo (substituido por next.config)
- Manter apenas: pasta assets/ (agora em public/assets), .git, .vercel, e o projeto Next.js
- Limpar package.json de dependencias nao usadas
- Confirmar que build passa limpo e deploy funciona apos cleanup
- Notificar Marco que a migracao esta 100% encerrada
