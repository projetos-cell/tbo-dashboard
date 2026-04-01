#!/usr/bin/env node
// TBO OS — Training Presentation Generator
// Run: NODE_PATH="C:/Users/marco/AppData/Roaming/npm/node_modules" node scripts/gen-treinamento-pptx.js

const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author = "TBO";
pres.title = "TBO OS — Manual de Implementação";

// ─── BRAND TOKENS ───────────────────────────────────────────────────
const C = {
  dark: "0F172A",
  darkAlt: "1E293B",
  purple: "5B21B6",
  purpleLight: "7C3AED",
  blue: "3B82F6",
  blueLight: "60A5FA",
  green: "22C55E",
  yellow: "F59E0B",
  red: "EF4444",
  orange: "F97316",
  cyan: "06B6D4",
  white: "FFFFFF",
  gray50: "F8FAFC",
  gray100: "F1F5F9",
  gray200: "E2E8F0",
  gray300: "CBD5E1",
  gray400: "94A3B8",
  gray500: "64748B",
  gray600: "475569",
  gray700: "334155",
  gray800: "1E293B",
};

const FONT = { head: "Calibri", body: "Calibri" };

// ─── HELPERS ────────────────────────────────────────────────────────
function mkShadow() {
  return { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.18 };
}

function addSectionSlide(title, subtitle) {
  const s = pres.addSlide();
  s.background = { color: C.dark };
  // Left accent bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.purple } });
  // Section title
  s.addText(title.toUpperCase(), {
    x: 0.8, y: 1.5, w: 8.4, h: 1.2,
    fontSize: 40, fontFace: FONT.head, color: C.white, bold: true,
    charSpacing: 3,
  });
  // Subtitle
  if (subtitle) {
    s.addText(subtitle, {
      x: 0.8, y: 2.8, w: 8.4, h: 0.8,
      fontSize: 18, fontFace: FONT.body, color: C.gray400,
    });
  }
  // Decorative circle
  s.addShape(pres.shapes.OVAL, {
    x: 8.5, y: 3.8, w: 1.8, h: 1.8,
    fill: { color: C.purple, transparency: 85 },
  });
  return s;
}

function addContentSlide(title, bodyFn) {
  const s = pres.addSlide();
  s.background = { color: C.gray50 };
  // Top bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.purple } });
  // Title
  s.addText(title, {
    x: 0.6, y: 0.25, w: 8.8, h: 0.55,
    fontSize: 24, fontFace: FONT.head, color: C.dark, bold: true, margin: 0,
  });
  // Thin separator
  s.addShape(pres.shapes.LINE, {
    x: 0.6, y: 0.85, w: 2.5, h: 0,
    line: { color: C.purple, width: 2.5 },
  });
  bodyFn(s);
  // Footer
  s.addText("TBO OS — Treinamento de Implementacao", {
    x: 0.6, y: 5.25, w: 6, h: 0.3,
    fontSize: 8, fontFace: FONT.body, color: C.gray400,
  });
  return s;
}

function card(s, x, y, w, h, opts = {}) {
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: opts.fill || C.white },
    shadow: mkShadow(),
    line: { color: C.gray200, width: 0.5 },
  });
  if (opts.accent) {
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.06, h,
      fill: { color: opts.accent },
    });
  }
}

function badge(s, x, y, label, color, bg) {
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w: label.length * 0.095 + 0.3, h: 0.32,
    fill: { color: bg || color, transparency: bg ? 0 : 85 },
  });
  s.addText(label, {
    x, y, w: label.length * 0.095 + 0.3, h: 0.32,
    fontSize: 10, fontFace: FONT.body, color: color, bold: true,
    align: "center", valign: "middle",
  });
}

function iconCircle(s, x, y, size, emoji, bgColor) {
  s.addShape(pres.shapes.OVAL, {
    x, y, w: size, h: size,
    fill: { color: bgColor, transparency: 15 },
  });
  s.addText(emoji, {
    x, y, w: size, h: size,
    fontSize: size * 20, align: "center", valign: "middle",
  });
}

function bullets(s, items, x, y, w, h, opts = {}) {
  const textItems = items.map((item, i) => ({
    text: item,
    options: {
      bullet: true,
      breakLine: i < items.length - 1,
      fontSize: opts.fontSize || 13,
      color: opts.color || C.gray700,
      fontFace: FONT.body,
      paraSpaceAfter: 6,
    },
  }));
  s.addText(textItems, { x, y, w, h, valign: "top" });
}

// =====================================================================
// BLOCO 1 — VISAO GERAL
// =====================================================================

// --- Slide 1: Capa ---
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };
  // Large decorative shapes
  s.addShape(pres.shapes.OVAL, { x: -1.5, y: -1.5, w: 5, h: 5, fill: { color: C.purple, transparency: 90 } });
  s.addShape(pres.shapes.OVAL, { x: 7, y: 3, w: 4, h: 4, fill: { color: C.blue, transparency: 90 } });
  // Left accent
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.6, w: 0.08, h: 2.4, fill: { color: C.purple } });
  // Title
  s.addText("TBO OS", {
    x: 1.0, y: 1.3, w: 8, h: 1.2,
    fontSize: 56, fontFace: FONT.head, color: C.white, bold: true,
    charSpacing: 5, margin: 0,
  });
  s.addText("Manual de Implementacao", {
    x: 1.0, y: 2.4, w: 8, h: 0.7,
    fontSize: 28, fontFace: FONT.head, color: C.purpleLight,
    margin: 0,
  });
  s.addText("Sistema Operacional da TBO", {
    x: 1.0, y: 3.2, w: 8, h: 0.5,
    fontSize: 16, fontFace: FONT.body, color: C.gray400,
    margin: 0,
  });
  // Date badge
  s.addShape(pres.shapes.RECTANGLE, { x: 1.0, y: 4.2, w: 1.8, h: 0.35, fill: { color: C.purple, transparency: 70 } });
  s.addText("Marco 2026", {
    x: 1.0, y: 4.2, w: 1.8, h: 0.35,
    fontSize: 11, fontFace: FONT.body, color: C.gray300, align: "center", valign: "middle",
  });
})();

// --- Slide 2: O que e o TBO OS ---
addContentSlide("O que e o TBO OS", (s) => {
  // Main description card
  card(s, 0.6, 1.1, 5.5, 2.0, { accent: C.purple });
  s.addText("Sistema de gestao completo e 100% nativo da TBO", {
    x: 0.85, y: 1.2, w: 5.1, h: 0.5,
    fontSize: 16, fontFace: FONT.head, color: C.dark, bold: true,
  });
  s.addText([
    { text: "Substitui planilhas, ferramentas dispersas e processos manuais.", options: { breakLine: true, fontSize: 13, color: C.gray600, fontFace: FONT.body, paraSpaceAfter: 4 } },
    { text: "Single-tenant: acesso restrito @agenciatbo.com.br e @wearetbo.com.br", options: { breakLine: true, fontSize: 13, color: C.gray600, fontFace: FONT.body, paraSpaceAfter: 4 } },
    { text: "Tudo em um lugar so — do briefing a entrega final.", options: { fontSize: 13, color: C.gray600, fontFace: FONT.body } },
  ], { x: 0.85, y: 1.75, w: 5.1, h: 1.2 });

  // Tech stack cards
  const techs = [
    { label: "Next.js 14", desc: "App Router + SSR", color: C.dark },
    { label: "Supabase", desc: "PostgreSQL + RLS", color: C.green },
    { label: "Vercel", desc: "Deploy & Edge", color: C.dark },
    { label: "React Query", desc: "Data Fetching", color: C.red },
  ];
  techs.forEach((t, i) => {
    const tx = 6.5;
    const ty = 1.1 + i * 0.55;
    card(s, tx, ty, 3.0, 0.45, { accent: t.color });
    s.addText(t.label, { x: tx + 0.2, y: ty + 0.03, w: 1.3, h: 0.4, fontSize: 11, fontFace: FONT.head, color: C.dark, bold: true });
    s.addText(t.desc, { x: tx + 1.5, y: ty + 0.03, w: 1.4, h: 0.4, fontSize: 10, fontFace: FONT.body, color: C.gray500 });
  });

  // Bottom highlights
  const highlights = [
    { emoji: "🔒", label: "RBAC 4 niveis", desc: "Permissoes por role" },
    { emoji: "⚡", label: "Realtime", desc: "Atualizacoes ao vivo" },
    { emoji: "🔗", label: "Integracoes", desc: "OMIE + Fireflies" },
    { emoji: "📊", label: "18 tipos campo", desc: "Tabelas estilo Notion" },
  ];
  highlights.forEach((h, i) => {
    const hx = 0.6 + i * 2.35;
    card(s, hx, 3.4, 2.15, 1.5);
    s.addText(h.emoji, { x: hx, y: 3.5, w: 2.15, h: 0.5, fontSize: 24, align: "center" });
    s.addText(h.label, { x: hx, y: 3.95, w: 2.15, h: 0.35, fontSize: 12, fontFace: FONT.head, color: C.dark, bold: true, align: "center" });
    s.addText(h.desc, { x: hx, y: 4.25, w: 2.15, h: 0.3, fontSize: 10, fontFace: FONT.body, color: C.gray500, align: "center" });
  });
});

// --- Slide 3: Arquitetura de Modulos ---
addContentSlide("Arquitetura de Modulos", (s) => {
  // Pinned items bar at top
  card(s, 0.6, 1.05, 8.8, 0.7, { accent: C.purple });
  s.addText("FIXO NO TOPO", { x: 0.85, y: 1.08, w: 1.5, h: 0.3, fontSize: 9, fontFace: FONT.head, color: C.purple, bold: true });
  const pinned = ["Dashboard", "Projetos", "Tarefas", "Chat", "Atividades", "Favoritos"];
  pinned.forEach((p, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 2.4 + i * 1.15, y: 1.15, w: 1.05, h: 0.3, fill: { color: C.purple, transparency: 88 } });
    s.addText(p, { x: 2.4 + i * 1.15, y: 1.15, w: 1.05, h: 0.3, fontSize: 9, fontFace: FONT.body, color: C.purple, align: "center", valign: "middle", bold: true });
  });

  // Module groups
  const groups = [
    { name: "Receita & Caixa", color: C.green, items: ["Pipeline", "Clientes", "Contratos", "Financeiro", "Compras"] },
    { name: "Pessoas & Cultura", color: C.blue, items: ["Pessoas", "Cultura", "Pesquisa de Clima"] },
    { name: "Estrategia", color: C.purple, items: ["OKRs", "Marketing", "Blog", "Relatorios"] },
    { name: "Conhecimento", color: C.yellow, items: ["SOPs", "Templates", "Guias"] },
    { name: "Sistema", color: C.gray500, items: ["Website Admin", "Usuarios", "Config", "Audit", "Changelog"] },
  ];
  groups.forEach((g, i) => {
    const gx = i < 3 ? 0.6 + i * 3.1 : 0.6 + (i - 3) * 4.7;
    const gy = i < 3 ? 2.0 : 3.85;
    const gw = i < 3 ? 2.9 : 4.5;
    const gh = i < 3 ? 1.6 : 1.2;
    card(s, gx, gy, gw, gh, { accent: g.color });
    s.addText(g.name.toUpperCase(), { x: gx + 0.15, y: gy + 0.08, w: gw - 0.3, h: 0.3, fontSize: 10, fontFace: FONT.head, color: g.color, bold: true });
    g.items.forEach((item, j) => {
      const ix = gx + 0.15 + (j % 3) * ((gw - 0.3) / 3);
      const iy = gy + 0.42 + Math.floor(j / 3) * 0.35;
      s.addShape(pres.shapes.RECTANGLE, { x: ix, y: iy, w: (gw - 0.5) / 3, h: 0.28, fill: { color: g.color, transparency: 90 } });
      s.addText(item, { x: ix, y: iy, w: (gw - 0.5) / 3, h: 0.28, fontSize: 8.5, fontFace: FONT.body, color: C.gray700, align: "center", valign: "middle" });
    });
  });
});

// --- Slide 4: Roles RBAC ---
addContentSlide("Controle de Acesso (RBAC)", (s) => {
  const roles = [
    { name: "Founder", level: 4, color: C.purple, desc: "Acesso total. Gestao de RBAC. Audit logs.", tag: "ADMIN" },
    { name: "Diretoria", level: 3, color: C.purple, desc: "Mesmo tier do founder. Financeiro, Intelligence, DRE.", tag: "ADMIN" },
    { name: "Lider", level: 2, color: C.blue, desc: "Cria projetos. Conduz 1:1s. OKRs parcial.", tag: "GESTAO" },
    { name: "Colaborador", level: 1, color: C.gray500, desc: "Ve projetos atribuidos. Check-in OKRs proprios.", tag: "OPERACAO" },
  ];
  roles.forEach((r, i) => {
    const ry = 1.15 + i * 1.05;
    card(s, 0.6, ry, 8.8, 0.9, { accent: r.color });
    // Level badge
    s.addShape(pres.shapes.OVAL, { x: 0.9, y: ry + 0.15, w: 0.6, h: 0.6, fill: { color: r.color } });
    s.addText(String(r.level), { x: 0.9, y: ry + 0.15, w: 0.6, h: 0.6, fontSize: 20, fontFace: FONT.head, color: C.white, bold: true, align: "center", valign: "middle" });
    // Name
    s.addText(r.name, { x: 1.7, y: ry + 0.12, w: 2.5, h: 0.35, fontSize: 18, fontFace: FONT.head, color: C.dark, bold: true, margin: 0 });
    // Tag
    s.addShape(pres.shapes.RECTANGLE, { x: 1.7, y: ry + 0.52, w: r.tag.length * 0.1 + 0.2, h: 0.25, fill: { color: r.color, transparency: 85 } });
    s.addText(r.tag, { x: 1.7, y: ry + 0.52, w: r.tag.length * 0.1 + 0.2, h: 0.25, fontSize: 8, fontFace: FONT.head, color: r.color, bold: true, align: "center", valign: "middle" });
    // Desc
    s.addText(r.desc, { x: 4.0, y: ry + 0.2, w: 5.2, h: 0.5, fontSize: 12, fontFace: FONT.body, color: C.gray600 });
  });
  // Note
  s.addText("Dupla camada obrigatoria: RBACGuard (frontend) + RLS Policy (Supabase backend)", {
    x: 0.6, y: 5.0, w: 8.8, h: 0.3,
    fontSize: 10, fontFace: FONT.body, color: C.purple, italic: true,
  });
});

// --- Slide 5: Business Units ---
addContentSlide("Business Units (BUs)", (s) => {
  const bus = [
    { name: "Digital 3D", color: "5B21B6", icon: "🎲", phases: "Briefing > Dir. Visual > Modelagem > Clay > Emissao > Revisoes > Entrega" },
    { name: "Branding", color: "92400E", icon: "🎨", phases: "Briefing > Pesquisa > Conceito > Design > Revisao > Entrega" },
    { name: "Marketing", color: "065F46", icon: "📢", phases: "Briefing > Estrategia > Producao > Revisao > Publicacao" },
    { name: "Audiovisual", color: "9D174D", icon: "🎬", phases: "Briefing > Pre-Producao > Captacao > Pos-Producao > Revisao > Entrega" },
    { name: "Gamificacao", color: "B45309", icon: "🎮", phases: "Fluxo customizado por projeto" },
    { name: "Interiores", color: "0C4A6E", icon: "🏠", phases: "Fluxo customizado por projeto" },
  ];
  bus.forEach((b, i) => {
    const bx = (i % 3) * 3.1 + 0.6;
    const by = Math.floor(i / 3) * 2.1 + 1.1;
    card(s, bx, by, 2.9, 1.9, { accent: b.color });
    s.addText(b.icon, { x: bx + 0.15, y: by + 0.12, w: 0.5, h: 0.5, fontSize: 24 });
    s.addText(b.name, { x: bx + 0.65, y: by + 0.15, w: 2.0, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true, margin: 0 });
    s.addText("Fases do fluxo:", { x: bx + 0.15, y: by + 0.6, w: 2.6, h: 0.25, fontSize: 9, fontFace: FONT.head, color: b.color, bold: true });
    s.addText(b.phases, { x: bx + 0.15, y: by + 0.85, w: 2.6, h: 0.9, fontSize: 9, fontFace: FONT.body, color: C.gray600 });
  });
});

// =====================================================================
// BLOCO 2 — MODULOS CORE
// =====================================================================
addSectionSlide("Modulos Core", "Dashboard, Projetos, Tarefas, Chat, Atividades & Favoritos");

// --- Slide 6: Meu Dashboard ---
addContentSlide("Meu Dashboard", (s) => {
  s.addText("Dashboard dinamico — cada role ve metricas diferentes", {
    x: 0.6, y: 1.05, w: 8.8, h: 0.35, fontSize: 13, fontFace: FONT.body, color: C.gray600,
  });
  const widgets = [
    { name: "Tarefas Pendentes", icon: "📋", desc: "Contagem e lista das tarefas atribuidas ao usuario", role: "Todos" },
    { name: "Projetos Ativos", icon: "📁", desc: "Board resumido com health status dos projetos", role: "Todos" },
    { name: "Pipeline CRM", icon: "💰", desc: "Funil de vendas com valor total por estagio", role: "Admin" },
    { name: "Alertas & Prazos", icon: "🔔", desc: "Contratos vencendo, tarefas atrasadas, revisoes pendentes", role: "Todos" },
    { name: "KPIs Financeiros", icon: "📊", desc: "DRE resumido, fluxo de caixa, contas a receber", role: "Admin" },
    { name: "OKRs em Andamento", icon: "🎯", desc: "Progresso dos OKRs do trimestre atual", role: "Admin + Lider" },
  ];
  widgets.forEach((w, i) => {
    const wx = (i % 3) * 3.1 + 0.6;
    const wy = Math.floor(i / 3) * 1.65 + 1.55;
    card(s, wx, wy, 2.9, 1.45);
    s.addText(w.icon, { x: wx + 0.15, y: wy + 0.12, w: 0.5, h: 0.4, fontSize: 20 });
    s.addText(w.name, { x: wx + 0.6, y: wy + 0.12, w: 2.1, h: 0.35, fontSize: 12, fontFace: FONT.head, color: C.dark, bold: true, margin: 0 });
    s.addText(w.desc, { x: wx + 0.15, y: wy + 0.55, w: 2.6, h: 0.5, fontSize: 10, fontFace: FONT.body, color: C.gray500 });
    badge(s, wx + 0.15, wy + 1.05, w.role, C.purple);
  });
});

// --- Slide 7: Projetos Visao Geral ---
addContentSlide("Projetos — Hub Central", (s) => {
  s.addText("10 views disponiveis para gestao completa de projetos", {
    x: 0.6, y: 1.05, w: 8.8, h: 0.35, fontSize: 13, fontFace: FONT.body, color: C.gray600,
  });
  const views = [
    { name: "Board (Kanban)", icon: "📋", desc: "Colunas por status com drag & drop" },
    { name: "Lista", icon: "📃", desc: "Tabela completa com filtros e ordenacao" },
    { name: "Gantt", icon: "📊", desc: "Timeline visual com dependencias" },
    { name: "Calendario", icon: "📅", desc: "Visualizacao mensal de entregas" },
    { name: "Timeline", icon: "⏱️", desc: "Linha do tempo de atividades" },
    { name: "Workload", icon: "👥", desc: "Carga de trabalho por pessoa" },
    { name: "Decisoes", icon: "⚖️", desc: "Log de decisoes do projeto" },
    { name: "Fluxo 3D", icon: "🎲", desc: "Visualizacao especifica D3D" },
    { name: "Templates", icon: "📑", desc: "Templates reutilizaveis" },
    { name: "Config", icon: "⚙️", desc: "Campos customizados e regras" },
  ];
  views.forEach((v, i) => {
    const vx = (i % 5) * 1.85 + 0.6;
    const vy = Math.floor(i / 5) * 1.65 + 1.55;
    card(s, vx, vy, 1.7, 1.45);
    s.addText(v.icon, { x: vx, y: vy + 0.1, w: 1.7, h: 0.4, fontSize: 22, align: "center" });
    s.addText(v.name, { x: vx + 0.08, y: vy + 0.52, w: 1.54, h: 0.35, fontSize: 10, fontFace: FONT.head, color: C.dark, bold: true, align: "center" });
    s.addText(v.desc, { x: vx + 0.08, y: vy + 0.85, w: 1.54, h: 0.5, fontSize: 8, fontFace: FONT.body, color: C.gray500, align: "center" });
  });
});

// --- Slide 8: Status & Health ---
addContentSlide("Projetos — Status & Health", (s) => {
  // Status column
  s.addText("STATUS", { x: 0.6, y: 1.15, w: 3, h: 0.3, fontSize: 11, fontFace: FONT.head, color: C.gray500, bold: true });
  const statuses = [
    { name: "Em Andamento", color: C.blue, icon: "▶" },
    { name: "Em Revisao", color: C.yellow, icon: "👁" },
    { name: "Concluido", color: C.green, icon: "✓" },
  ];
  statuses.forEach((st, i) => {
    card(s, 0.6, 1.55 + i * 0.75, 4.2, 0.6, { accent: st.color });
    s.addText(st.icon + "  " + st.name, { x: 0.85, y: 1.55 + i * 0.75, w: 3.5, h: 0.6, fontSize: 16, fontFace: FONT.head, color: st.color, bold: true, valign: "middle" });
  });

  // Health column
  s.addText("HEALTH (automatico)", { x: 5.2, y: 1.15, w: 4, h: 0.3, fontSize: 11, fontFace: FONT.head, color: C.gray500, bold: true });
  const healths = [
    { name: "No Prazo", color: C.green, rule: "< 20% tarefas atrasadas" },
    { name: "Em Risco", color: C.yellow, rule: "20-50% tarefas atrasadas" },
    { name: "Atrasado", color: C.red, rule: "> 50% tarefas atrasadas" },
  ];
  healths.forEach((h, i) => {
    card(s, 5.2, 1.55 + i * 0.75, 4.2, 0.6, { accent: h.color });
    s.addText(h.name, { x: 5.45, y: 1.55 + i * 0.75, w: 1.8, h: 0.6, fontSize: 14, fontFace: FONT.head, color: h.color, bold: true, valign: "middle" });
    s.addText(h.rule, { x: 7.2, y: 1.55 + i * 0.75, w: 2.0, h: 0.6, fontSize: 11, fontFace: FONT.body, color: C.gray500, valign: "middle" });
  });

  // Priority
  s.addText("PRIORIDADES", { x: 0.6, y: 3.9, w: 4, h: 0.3, fontSize: 11, fontFace: FONT.head, color: C.gray500, bold: true });
  const prios = [
    { name: "Urgente", color: C.red },
    { name: "Alta", color: C.yellow },
    { name: "Media", color: C.blue },
    { name: "Baixa", color: C.gray500 },
  ];
  prios.forEach((p, i) => {
    const px = 0.6 + i * 2.35;
    s.addShape(pres.shapes.RECTANGLE, { x: px, y: 4.3, w: 2.15, h: 0.5, fill: { color: p.color, transparency: 85 } });
    s.addShape(pres.shapes.RECTANGLE, { x: px, y: 4.3, w: 2.15, h: 0.06, fill: { color: p.color } });
    s.addText(p.name, { x: px, y: 4.3, w: 2.15, h: 0.5, fontSize: 13, fontFace: FONT.head, color: p.color, bold: true, align: "center", valign: "middle" });
  });
});

// --- Slide 9: Tarefas ---
addContentSlide("Tarefas — Sistema Completo", (s) => {
  // Status column
  s.addText("STATUS", { x: 0.6, y: 1.1, w: 3, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const taskStatuses = [
    { name: "Pendente", color: C.gray500 },
    { name: "Em Andamento", color: C.blue },
    { name: "Revisao", color: C.yellow },
    { name: "Concluida", color: C.green },
    { name: "Bloqueada", color: C.red },
    { name: "Cancelada", color: C.gray400 },
  ];
  taskStatuses.forEach((ts, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6 + (i % 3) * 1.55, y: 1.4 + Math.floor(i / 3) * 0.45, w: 1.4, h: 0.35, fill: { color: ts.color, transparency: 85 } });
    s.addText(ts.name, { x: 0.6 + (i % 3) * 1.55, y: 1.4 + Math.floor(i / 3) * 0.45, w: 1.4, h: 0.35, fontSize: 10, fontFace: FONT.body, color: ts.color, bold: true, align: "center", valign: "middle" });
  });

  // Approval
  s.addText("APROVACAO", { x: 5.3, y: 1.1, w: 4, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const approvals = ["Sem aprovacao", "Pendente", "Aprovado", "Revisao"];
  const appColors = [C.gray400, C.yellow, C.green, C.red];
  approvals.forEach((a, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 5.3 + (i % 2) * 2.3, y: 1.4 + Math.floor(i / 2) * 0.45, w: 2.1, h: 0.35, fill: { color: appColors[i], transparency: 85 } });
    s.addText(a, { x: 5.3 + (i % 2) * 2.3, y: 1.4 + Math.floor(i / 2) * 0.45, w: 2.1, h: 0.35, fontSize: 10, fontFace: FONT.body, color: appColors[i], bold: true, align: "center", valign: "middle" });
  });

  // Features
  s.addText("FUNCIONALIDADES", { x: 0.6, y: 2.6, w: 8, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const features = [
    { icon: "🔄", name: "Recorrencia", desc: "Diaria, Semanal, Mensal" },
    { icon: "📋", name: "Views", desc: "Lista, Calendario, Board" },
    { icon: "🏷️", name: "Tags & Labels", desc: "Organizacao customizada" },
    { icon: "👤", name: "Atribuicao", desc: "Multiplos responsaveis" },
    { icon: "📎", name: "Anexos", desc: "Arquivos e links" },
    { icon: "💬", name: "Comentarios", desc: "Discussao na tarefa" },
    { icon: "⏰", name: "Prazos", desc: "Data inicio e fim" },
    { icon: "🔗", name: "Relacoes", desc: "Subtarefas e dependencias" },
  ];
  features.forEach((f, i) => {
    const fx = (i % 4) * 2.35 + 0.6;
    const fy = Math.floor(i / 4) * 1.1 + 2.95;
    card(s, fx, fy, 2.15, 0.95);
    s.addText(f.icon + " " + f.name, { x: fx + 0.1, y: fy + 0.08, w: 1.95, h: 0.35, fontSize: 11, fontFace: FONT.head, color: C.dark, bold: true });
    s.addText(f.desc, { x: fx + 0.1, y: fy + 0.45, w: 1.95, h: 0.3, fontSize: 10, fontFace: FONT.body, color: C.gray500 });
  });
});

// --- Slide 10: Chat ---
addContentSlide("Chat — Comunicacao Interna", (s) => {
  s.addText("Comunicacao em tempo real — 100% nativo, sem dependencia externa", {
    x: 0.6, y: 1.05, w: 8.8, h: 0.35, fontSize: 13, fontFace: FONT.body, color: C.gray600,
  });
  const chatFeatures = [
    { icon: "💬", name: "Canais", desc: "Canais publicos e privados por projeto, equipe ou tema" },
    { icon: "🧵", name: "Threads", desc: "Respostas organizadas sem poluir o canal principal" },
    { icon: "📌", name: "Pins", desc: "Fixe mensagens importantes no topo do canal" },
    { icon: "⏰", name: "Agendamento", desc: "Programe mensagens para envio futuro" },
    { icon: "↗️", name: "Forward", desc: "Encaminhe mensagens entre canais" },
    { icon: "😀", name: "Reacoes", desc: "Reaja com emojis sem criar ruido" },
  ];
  chatFeatures.forEach((f, i) => {
    const fx = (i % 3) * 3.1 + 0.6;
    const fy = Math.floor(i / 3) * 1.55 + 1.6;
    card(s, fx, fy, 2.9, 1.35, { accent: C.blue });
    s.addText(f.icon, { x: fx + 0.15, y: fy + 0.12, w: 0.5, h: 0.4, fontSize: 22 });
    s.addText(f.name, { x: fx + 0.65, y: fy + 0.15, w: 2.0, h: 0.3, fontSize: 13, fontFace: FONT.head, color: C.dark, bold: true, margin: 0 });
    s.addText(f.desc, { x: fx + 0.15, y: fy + 0.55, w: 2.6, h: 0.6, fontSize: 10, fontFace: FONT.body, color: C.gray500 });
  });
});

// --- Slide 11: Atividades & Favoritos ---
addContentSlide("Atividades & Favoritos", (s) => {
  // Atividades
  card(s, 0.6, 1.1, 5.0, 3.8, { accent: C.orange });
  s.addText("📊 Feed de Atividades", { x: 0.85, y: 1.2, w: 4.5, h: 0.4, fontSize: 16, fontFace: FONT.head, color: C.dark, bold: true });
  s.addText("Tudo que acontece no sistema, centralizado.", { x: 0.85, y: 1.6, w: 4.5, h: 0.3, fontSize: 11, fontFace: FONT.body, color: C.gray500 });
  const actions = ["criou", "atualizou", "excluiu", "moveu", "comentou", "anexou", "atribuiu", "concluiu", "reabriu"];
  actions.forEach((a, i) => {
    const ax = 0.85 + (i % 3) * 1.55;
    const ay = 2.1 + Math.floor(i / 3) * 0.45;
    s.addShape(pres.shapes.RECTANGLE, { x: ax, y: ay, w: 1.4, h: 0.35, fill: { color: C.orange, transparency: 90 } });
    s.addText(a, { x: ax, y: ay, w: 1.4, h: 0.35, fontSize: 10, fontFace: FONT.body, color: C.orange, align: "center", valign: "middle", bold: true });
  });

  // Favoritos
  card(s, 5.9, 1.1, 3.5, 3.8, { accent: C.yellow });
  s.addText("⭐ Favoritos", { x: 6.1, y: 1.2, w: 3.1, h: 0.4, fontSize: 16, fontFace: FONT.head, color: C.dark, bold: true });
  s.addText("Bookmarks para acesso rapido", { x: 6.1, y: 1.6, w: 3.1, h: 0.3, fontSize: 11, fontFace: FONT.body, color: C.gray500 });
  bullets(s, [
    "Qualquer item pode ser favoritado",
    "Projetos, tarefas, contratos, deals...",
    "Acesso direto na sidebar",
    "Pessoal por usuario",
  ], 6.1, 2.1, 3.1, 2.5);
});

// =====================================================================
// BLOCO 3 — RECEITA & CAIXA
// =====================================================================
addSectionSlide("Receita & Caixa", "Pipeline CRM, Clientes, Contratos, Financeiro, Compras & Portal");

// --- Slide 12: Pipeline CRM ---
addContentSlide("Pipeline CRM — Visao Kanban", (s) => {
  s.addText("Dados migrados do RD Station — 100% nativo Supabase, sem dependencia externa", {
    x: 0.6, y: 1.05, w: 8.8, h: 0.35, fontSize: 12, fontFace: FONT.body, color: C.gray600,
  });
  // Pipeline stages
  const stages = [
    { name: "Lead", color: "6366F1" },
    { name: "Qualificacao", color: C.yellow },
    { name: "Proposta", color: C.blue },
    { name: "Negociacao", color: "8B5CF6" },
    { name: "Ganho", color: C.green },
    { name: "Perdido", color: C.red },
  ];
  // Draw pipeline flow
  stages.forEach((st, i) => {
    const sx = 0.4 + i * 1.58;
    s.addShape(pres.shapes.RECTANGLE, { x: sx, y: 1.6, w: 1.45, h: 2.0, fill: { color: st.color, transparency: 90 } });
    s.addShape(pres.shapes.RECTANGLE, { x: sx, y: 1.6, w: 1.45, h: 0.06, fill: { color: st.color } });
    s.addText(st.name, { x: sx, y: 1.7, w: 1.45, h: 0.4, fontSize: 11, fontFace: FONT.head, color: st.color, bold: true, align: "center" });
    // Placeholder deal cards
    for (let j = 0; j < 2; j++) {
      s.addShape(pres.shapes.RECTANGLE, { x: sx + 0.08, y: 2.2 + j * 0.52, w: 1.29, h: 0.42, fill: { color: C.white }, shadow: mkShadow() });
      s.addText("Deal " + (j + 1), { x: sx + 0.15, y: 2.2 + j * 0.52, w: 1.15, h: 0.42, fontSize: 9, fontFace: FONT.body, color: C.gray600, valign: "middle" });
    }
    // Arrow between stages
    if (i < stages.length - 2) {
      s.addText("→", { x: sx + 1.45, y: 2.3, w: 0.15, h: 0.4, fontSize: 14, color: C.gray400, align: "center", valign: "middle" });
    }
  });
  // Sources
  s.addText("FONTES", { x: 0.6, y: 3.9, w: 2, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const sources = ["Site", "Indicacao", "LinkedIn", "Evento", "Outbound", "Outro"];
  sources.forEach((src, i) => {
    badge(s, 0.6 + i * 1.55, 4.2, src, C.blue);
  });
  // Subpages
  s.addText("SUBPAGINAS", { x: 0.6, y: 4.7, w: 2, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const subpages = ["Leads", "Atividades", "Servicos", "Propostas", "Precificacao", "Relatorios", "Integracoes"];
  subpages.forEach((sp, i) => {
    badge(s, 0.6 + i * 1.3, 5.0, sp, C.purple);
  });
});

// --- Slide 13: Clientes ---
addContentSlide("Clientes", (s) => {
  // Status
  s.addText("STATUS DO CLIENTE", { x: 0.6, y: 1.1, w: 4, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const clientStatuses = [
    { name: "Lead", color: "8B5CF6" },
    { name: "Prospect", color: C.blue },
    { name: "Ativo", color: C.green },
    { name: "VIP", color: C.yellow },
    { name: "Inativo", color: C.gray400 },
  ];
  clientStatuses.forEach((cs, i) => {
    const cx = 0.6 + i * 1.85;
    card(s, cx, 1.45, 1.7, 0.8, { accent: cs.color });
    s.addText(cs.name, { x: cx + 0.15, y: 1.55, w: 1.4, h: 0.55, fontSize: 16, fontFace: FONT.head, color: cs.color, bold: true, valign: "middle" });
  });

  // Interaction types
  s.addText("TIPOS DE INTERACAO", { x: 0.6, y: 2.5, w: 4, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const interactions = [
    { name: "E-mail", icon: "📧" },
    { name: "Reuniao", icon: "📹" },
    { name: "Ligacao", icon: "📞" },
    { name: "WhatsApp", icon: "💬" },
    { name: "Presencial", icon: "👥" },
  ];
  interactions.forEach((int, i) => {
    card(s, 0.6 + i * 1.85, 2.85, 1.7, 0.9);
    s.addText(int.icon, { x: 0.6 + i * 1.85, y: 2.9, w: 1.7, h: 0.4, fontSize: 20, align: "center" });
    s.addText(int.name, { x: 0.6 + i * 1.85, y: 3.3, w: 1.7, h: 0.35, fontSize: 11, fontFace: FONT.head, color: C.dark, bold: true, align: "center" });
  });

  // Key info
  card(s, 0.6, 4.0, 8.8, 1.0, { accent: C.purple });
  bullets(s, [
    "Historico completo de interacoes com timeline",
    "Projetos vinculados ao cliente",
    "Contratos e valores associados",
    "Contatos, documentos e configuracoes por empresa",
  ], 0.85, 4.05, 8.3, 0.9, { fontSize: 11 });
});

// --- Slide 14: Contratos ---
addContentSlide("Contratos", (s) => {
  // Status
  s.addText("STATUS", { x: 0.6, y: 1.1, w: 2, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const cStatuses = [
    { name: "Rascunho", color: C.gray500 },
    { name: "Ativo", color: C.green },
    { name: "Expirado", color: C.gray400 },
    { name: "Cancelado", color: C.red },
    { name: "Renovado", color: C.blue },
  ];
  cStatuses.forEach((cs, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6 + i * 1.85, y: 1.4, w: 1.7, h: 0.35, fill: { color: cs.color, transparency: 85 } });
    s.addText(cs.name, { x: 0.6 + i * 1.85, y: 1.4, w: 1.7, h: 0.35, fontSize: 10, fontFace: FONT.body, color: cs.color, bold: true, align: "center", valign: "middle" });
  });

  // Categories and Types
  s.addText("CATEGORIAS", { x: 0.6, y: 2.0, w: 4, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const cats = [{ name: "Cliente", color: C.orange }, { name: "Equipe", color: "8B5CF6" }, { name: "Fornecedor", color: C.cyan }, { name: "Distrato", color: C.red }];
  cats.forEach((c, i) => {
    card(s, 0.6 + i * 2.35, 2.3, 2.15, 0.5, { accent: c.color });
    s.addText(c.name, { x: 0.8 + i * 2.35, y: 2.35, w: 1.8, h: 0.4, fontSize: 13, fontFace: FONT.head, color: C.dark, bold: true, valign: "middle" });
  });

  s.addText("TIPOS", { x: 0.6, y: 3.05, w: 4, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  ["PJ", "NDA", "Aditivo", "Freelancer", "CLT", "Outro"].forEach((t, i) => {
    badge(s, 0.6 + i * 1.5, 3.35, t, C.dark);
  });

  // Dynamic status
  s.addText("STATUS DINAMICOS (calculados)", { x: 0.6, y: 3.9, w: 5, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const dynStatuses = [
    { name: "Aguardando Assinatura", color: "EAB308", rule: "Draft + sem arquivo" },
    { name: "Revisao Juridica", color: "A855F7", rule: "Draft + com arquivo" },
    { name: "Arquivado", color: C.gray500, rule: "Expirado ou cancelado" },
  ];
  dynStatuses.forEach((ds, i) => {
    card(s, 0.6 + i * 3.1, 4.2, 2.9, 0.8, { accent: ds.color });
    s.addText(ds.name, { x: 0.8 + i * 3.1, y: 4.25, w: 2.5, h: 0.3, fontSize: 11, fontFace: FONT.head, color: ds.color, bold: true });
    s.addText(ds.rule, { x: 0.8 + i * 3.1, y: 4.55, w: 2.5, h: 0.3, fontSize: 10, fontFace: FONT.body, color: C.gray500 });
  });
});

// --- Slide 15: Financeiro ---
addContentSlide("Financeiro", (s) => {
  card(s, 0.6, 1.1, 8.8, 1.2, { accent: C.red });
  s.addText("🔒 Acesso restrito: Founder + Diretoria", {
    x: 0.85, y: 1.15, w: 8.3, h: 0.35, fontSize: 14, fontFace: FONT.head, color: C.red, bold: true,
  });
  s.addText("Modulo financeiro integrado com OMIE (ERP). Dados sincronizados automaticamente.", {
    x: 0.85, y: 1.55, w: 8.3, h: 0.5, fontSize: 12, fontFace: FONT.body, color: C.gray600,
  });

  const finModules = [
    { icon: "📊", name: "DRE", desc: "Demonstrativo de Resultado do Exercicio com visao mensal e anual" },
    { icon: "💰", name: "Fluxo de Caixa", desc: "Entradas e saidas com projecao futura e saldo acumulado" },
    { icon: "📥", name: "Contas a Receber", desc: "Faturas emitidas, vencimentos e status de pagamento" },
    { icon: "📤", name: "Contas a Pagar", desc: "Fornecedores, vencimentos e agendamento de pagamentos" },
  ];
  finModules.forEach((f, i) => {
    const fx = (i % 2) * 4.6 + 0.6;
    const fy = Math.floor(i / 2) * 1.3 + 2.6;
    card(s, fx, fy, 4.4, 1.1, { accent: C.green });
    s.addText(f.icon + " " + f.name, { x: fx + 0.2, y: fy + 0.1, w: 4.0, h: 0.35, fontSize: 14, fontFace: FONT.head, color: C.dark, bold: true });
    s.addText(f.desc, { x: fx + 0.2, y: fy + 0.5, w: 4.0, h: 0.45, fontSize: 11, fontFace: FONT.body, color: C.gray500 });
  });
});

// --- Slide 16: Compras & Portal ---
addContentSlide("Compras & Portal do Cliente", (s) => {
  // Compras
  card(s, 0.6, 1.1, 4.4, 3.8, { accent: C.cyan });
  s.addText("🚚 Compras & Fornecedores", { x: 0.85, y: 1.2, w: 4.0, h: 0.4, fontSize: 16, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, [
    "Cadastro completo de fornecedores",
    "Cotacoes e comparativos",
    "Ordens de compra",
    "Historico de aquisicoes",
    "Avaliacao de fornecedores",
    "Integrado com Financeiro",
  ], 0.85, 1.7, 3.9, 3.0);

  // Portal
  card(s, 5.3, 1.1, 4.1, 3.8, { accent: C.purple });
  s.addText("🌐 Portal do Cliente", { x: 5.5, y: 1.2, w: 3.7, h: 0.4, fontSize: 16, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, [
    "Acesso externo via token (sem login)",
    "Acompanhamento de fases por BU",
    "Timeline de atividades",
    "Envio de feedback direto",
    "Visualizacao de entregas",
    "Fases customizadas por tipo de projeto",
  ], 5.5, 1.7, 3.5, 3.0);
});

// =====================================================================
// BLOCO 4 — PESSOAS & CULTURA
// =====================================================================
addSectionSlide("Pessoas & Cultura", "Gestao de time, performance, PDI, cultura e reconhecimentos");

// --- Slide 17: Pessoas Visao Geral ---
addContentSlide("Pessoas — Visao Geral", (s) => {
  // Status
  s.addText("STATUS DO COLABORADOR", { x: 0.6, y: 1.1, w: 5, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const pStatuses = [
    { name: "Ativo", color: C.green },
    { name: "Inativo", color: C.gray400 },
    { name: "Ferias", color: C.blue },
    { name: "Afastado", color: C.yellow },
    { name: "Onboarding", color: "8B5CF6" },
    { name: "Offboarding", color: C.red },
  ];
  pStatuses.forEach((ps, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6 + i * 1.55, y: 1.4, w: 1.4, h: 0.35, fill: { color: ps.color, transparency: 85 } });
    s.addText(ps.name, { x: 0.6 + i * 1.55, y: 1.4, w: 1.4, h: 0.35, fontSize: 9, fontFace: FONT.body, color: ps.color, bold: true, align: "center", valign: "middle" });
  });

  // Subpages
  s.addText("SUBPAGINAS", { x: 0.6, y: 2.0, w: 5, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const subpages = [
    { icon: "👥", name: "Colaboradores", desc: "Diretorio completo do time" },
    { icon: "📊", name: "Performance", desc: "Scoring e radar de competencias" },
    { icon: "🎯", name: "PDI", desc: "Plano de Desenvolvimento Individual" },
    { icon: "🚀", name: "Carreira", desc: "Trilhas com paths customizaveis" },
    { icon: "🏢", name: "Organograma", desc: "Estrutura visual da empresa" },
    { icon: "📅", name: "Timeline", desc: "Historico de eventos do colaborador" },
    { icon: "🤝", name: "1:1s", desc: "Reunioes com transcricao Fireflies" },
    { icon: "🏆", name: "Reconhecimentos", desc: "Premiacoes e pontos" },
  ];
  subpages.forEach((sp, i) => {
    const sx = (i % 4) * 2.35 + 0.6;
    const sy = Math.floor(i / 4) * 1.35 + 2.4;
    card(s, sx, sy, 2.15, 1.15);
    s.addText(sp.icon + " " + sp.name, { x: sx + 0.1, y: sy + 0.1, w: 1.95, h: 0.35, fontSize: 11, fontFace: FONT.head, color: C.dark, bold: true });
    s.addText(sp.desc, { x: sx + 0.1, y: sy + 0.5, w: 1.95, h: 0.45, fontSize: 10, fontFace: FONT.body, color: C.gray500 });
  });
});

// --- Slide 18: Performance & PDI ---
addContentSlide("Performance, PDI & Carreira", (s) => {
  // Performance
  card(s, 0.6, 1.1, 4.4, 2.0, { accent: C.blue });
  s.addText("📊 Performance", { x: 0.85, y: 1.2, w: 4.0, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, [
    "Scoring por competencia",
    "Radar chart visual",
    "Historico de evolucao",
    "Comparativo por periodo",
  ], 0.85, 1.6, 3.9, 1.4);

  // PDI
  card(s, 5.3, 1.1, 4.1, 2.0, { accent: C.green });
  s.addText("🎯 PDI", { x: 5.5, y: 1.2, w: 3.7, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, [
    "Metas individuais com prazo",
    "Acompanhamento de progresso",
    "Vinculado a check-ins 1:1",
    "Evolucao por trimestre",
  ], 5.5, 1.6, 3.5, 1.4);

  // Carreira
  card(s, 0.6, 3.3, 8.8, 1.8, { accent: C.purple });
  s.addText("🚀 Carreira", { x: 0.85, y: 3.4, w: 8.3, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  s.addText("Trilhas de carreira customizaveis por BU e funcao. Paths com niveis, competencias exigidas e criterios claros.", {
    x: 0.85, y: 3.8, w: 8.3, h: 0.4, fontSize: 12, fontFace: FONT.body, color: C.gray600,
  });
  // Important note
  s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: 4.35, w: 8.3, h: 0.5, fill: { color: C.red, transparency: 92 } });
  s.addText("⚠️  Promocoes sao SEMPRE manuais — nunca automatizadas por score ou threshold", {
    x: 1.0, y: 4.35, w: 8.0, h: 0.5, fontSize: 12, fontFace: FONT.head, color: C.red, bold: true, valign: "middle",
  });
});

// --- Slide 19: 1:1s ---
addContentSlide("1:1s — Reunioes Individuais", (s) => {
  card(s, 0.6, 1.1, 8.8, 3.8, { accent: C.blue });
  s.addText("Reunioes 1:1 integradas com Fireflies (transcricao automatica por IA)", {
    x: 0.85, y: 1.2, w: 8.3, h: 0.4, fontSize: 14, fontFace: FONT.head, color: C.dark, bold: true,
  });

  const oneOnOneFeatures = [
    { icon: "🎤", name: "Transcricao IA", desc: "Fireflies grava e transcreve automaticamente" },
    { icon: "📝", name: "Action Items", desc: "Extraidos automaticamente da transcricao" },
    { icon: "👤", name: "Lider conduz", desc: "Founder, diretoria ou lider iniciam" },
    { icon: "📅", name: "Historico", desc: "Todas as 1:1 com timeline por colaborador" },
  ];
  oneOnOneFeatures.forEach((f, i) => {
    const fx = (i % 2) * 4.3 + 0.85;
    const fy = Math.floor(i / 2) * 1.2 + 1.85;
    s.addText(f.icon + " " + f.name, { x: fx, y: fy, w: 4.0, h: 0.35, fontSize: 13, fontFace: FONT.head, color: C.dark, bold: true });
    s.addText(f.desc, { x: fx, y: fy + 0.35, w: 4.0, h: 0.35, fontSize: 11, fontFace: FONT.body, color: C.gray500 });
  });
});

// --- Slide 20: Cultura ---
addContentSlide("Cultura — Visao Geral", (s) => {
  const culturaItems = [
    { icon: "❤️", name: "Valores & Pilares", desc: "6 valores que guiam a TBO", color: C.red },
    { icon: "🔄", name: "Rituais", desc: "Eventos recorrentes do time", color: C.blue },
    { icon: "🏆", name: "Reconhecimentos", desc: "Premiacoes entre colegas", color: C.green },
    { icon: "🎁", name: "Recompensas", desc: "16 tipos de premio", color: "8B5CF6" },
    { icon: "📚", name: "TBO Academy", desc: "Capacitacao interna", color: C.yellow },
    { icon: "📅", name: "Calendario RH", desc: "Datas e eventos de RH", color: C.cyan },
    { icon: "📋", name: "Pesquisa de Clima", desc: "Surveys de satisfacao", color: C.orange },
  ];
  culturaItems.forEach((ci, i) => {
    const cx = (i % 4) * 2.35 + 0.6;
    const cy = Math.floor(i / 4) * 1.7 + 1.1;
    card(s, cx, cy, 2.15, 1.5, { accent: ci.color });
    s.addText(ci.icon, { x: cx, y: cy + 0.1, w: 2.15, h: 0.45, fontSize: 24, align: "center" });
    s.addText(ci.name, { x: cx + 0.1, y: cy + 0.55, w: 1.95, h: 0.3, fontSize: 12, fontFace: FONT.head, color: C.dark, bold: true, align: "center" });
    s.addText(ci.desc, { x: cx + 0.1, y: cy + 0.85, w: 1.95, h: 0.35, fontSize: 10, fontFace: FONT.body, color: C.gray500, align: "center" });
  });
});

// --- Slide 21: Valores TBO ---
addContentSlide("Valores TBO", (s) => {
  const values = [
    { id: "ownership", name: "Ownership", emoji: "🏆", color: C.yellow, desc: "Dono do resultado. Iniciativa e responsabilidade." },
    { id: "excelencia", name: "Excelencia", emoji: "⭐", color: "8B5CF6", desc: "Padrao alto em tudo. Craft e atencao ao detalhe." },
    { id: "colaboracao", name: "Colaboracao", emoji: "🤝", color: C.blue, desc: "Melhor juntos. Sinergia entre BUs." },
    { id: "inovacao", name: "Inovacao", emoji: "💡", color: C.green, desc: "Questionar o status quo. Testar e evoluir." },
    { id: "transparencia", name: "Transparencia", emoji: "🔍", color: C.cyan, desc: "Informacao aberta. Feedback honesto." },
    { id: "cliente", name: "Foco no Cliente", emoji: "❤️", color: C.red, desc: "O cliente no centro de toda decisao." },
  ];
  values.forEach((v, i) => {
    const vx = (i % 3) * 3.1 + 0.6;
    const vy = Math.floor(i / 3) * 1.95 + 1.1;
    card(s, vx, vy, 2.9, 1.75, { accent: v.color });
    s.addText(v.emoji, { x: vx, y: vy + 0.1, w: 2.9, h: 0.5, fontSize: 28, align: "center" });
    s.addText(v.name, { x: vx + 0.15, y: vy + 0.6, w: 2.6, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true, align: "center" });
    s.addText(v.desc, { x: vx + 0.15, y: vy + 1.0, w: 2.6, h: 0.55, fontSize: 11, fontFace: FONT.body, color: C.gray500, align: "center" });
  });
});

// --- Slide 22: Reconhecimentos & Recompensas ---
addContentSlide("Reconhecimentos & Recompensas", (s) => {
  // Tiers
  s.addText("TIERS DE RECONHECIMENTO", { x: 0.6, y: 1.1, w: 5, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const tiers = [
    { name: "🥉 Bronze", range: "0-49 pts", color: "CD7F32" },
    { name: "🥈 Prata", range: "50-149 pts", color: "94A3B8" },
    { name: "🥇 Ouro", range: "150-299 pts", color: "F59E0B" },
    { name: "💎 Diamante", range: "300+ pts", color: "38BDF8" },
  ];
  tiers.forEach((t, i) => {
    card(s, 0.6 + i * 2.35, 1.45, 2.15, 0.9);
    s.addText(t.name, { x: 0.6 + i * 2.35, y: 1.5, w: 2.15, h: 0.35, fontSize: 14, fontFace: FONT.head, color: t.color, bold: true, align: "center" });
    s.addText(t.range, { x: 0.6 + i * 2.35, y: 1.85, w: 2.15, h: 0.3, fontSize: 12, fontFace: FONT.body, color: C.gray500, align: "center" });
  });

  // Sources
  s.addText("FONTES DE RECONHECIMENTO", { x: 0.6, y: 2.6, w: 5, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const sources = [
    { name: "Manual", desc: "Colegas reconhecem diretamente", color: C.blue },
    { name: "Fireflies (IA)", desc: "Extraido de reunioes por IA", color: "8B5CF6" },
    { name: "Slack", desc: "Integrado com canal de kudos", color: "E01E5A" },
  ];
  sources.forEach((src, i) => {
    card(s, 0.6 + i * 3.1, 2.95, 2.9, 0.8, { accent: src.color });
    s.addText(src.name, { x: 0.8 + i * 3.1, y: 3.0, w: 2.5, h: 0.3, fontSize: 12, fontFace: FONT.head, color: C.dark, bold: true });
    s.addText(src.desc, { x: 0.8 + i * 3.1, y: 3.3, w: 2.5, h: 0.3, fontSize: 10, fontFace: FONT.body, color: C.gray500 });
  });

  // Reward types
  s.addText("16 TIPOS DE RECOMPENSA", { x: 0.6, y: 4.0, w: 5, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const rewards = ["Experiencia", "Produto", "Beneficio", "Day Off", "Digital", "Bem-estar", "Aprendizado", "Gastronomia"];
  rewards.forEach((r, i) => {
    badge(s, 0.6 + (i % 8) * 1.18, 4.35, r, C.purple);
  });
  const rewards2 = ["Lifestyle", "Liberdade", "Saude", "Lazer", "Branding", "Utilidade", "Cultura", "Mimo"];
  rewards2.forEach((r, i) => {
    badge(s, 0.6 + (i % 8) * 1.18, 4.75, r, C.blue);
  });
});

// =====================================================================
// BLOCO 5 — ESTRATEGIA & CONHECIMENTO
// =====================================================================
addSectionSlide("Estrategia & Conhecimento", "OKRs, Marketing, Blog, Relatorios, SOPs & Templates");

// --- Slide 23: OKRs ---
addContentSlide("OKRs — Objetivos e Resultados-Chave", (s) => {
  // Levels
  s.addText("4 NIVEIS", { x: 0.6, y: 1.1, w: 3, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const levels = [
    { name: "Empresa", color: "7C3AED" },
    { name: "Diretoria", color: "2563EB" },
    { name: "Squad", color: "0891B2" },
    { name: "Individual", color: C.green },
  ];
  levels.forEach((l, i) => {
    card(s, 0.6 + i * 2.35, 1.4, 2.15, 0.7, { accent: l.color });
    s.addText(l.name, { x: 0.8 + i * 2.35, y: 1.45, w: 1.8, h: 0.55, fontSize: 16, fontFace: FONT.head, color: l.color, bold: true, valign: "middle" });
  });

  // Status
  s.addText("STATUS", { x: 0.6, y: 2.35, w: 3, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const okrStatuses = [
    { name: "No caminho", color: C.green },
    { name: "Atencao", color: C.yellow },
    { name: "Em risco", color: C.red },
    { name: "Atrasado", color: C.red },
  ];
  okrStatuses.forEach((os, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6 + i * 2.35, y: 2.65, w: 2.15, h: 0.4, fill: { color: os.color, transparency: 85 } });
    s.addText(os.name, { x: 0.6 + i * 2.35, y: 2.65, w: 2.15, h: 0.4, fontSize: 12, fontFace: FONT.body, color: os.color, bold: true, align: "center", valign: "middle" });
  });

  // Features
  s.addText("FUNCIONALIDADES", { x: 0.6, y: 3.3, w: 3, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const okrFeatures = [
    { icon: "📊", name: "Dashboard dedicado", desc: "Visao geral de todos os OKRs" },
    { icon: "📝", name: "Check-ins periodicos", desc: "Atualizacao de progresso por todos" },
    { icon: "🏢", name: "OKRs por empresa", desc: "Alinhamento estrategico top-down" },
    { icon: "👤", name: "OKRs individuais", desc: "Metas pessoais por trimestre" },
  ];
  okrFeatures.forEach((f, i) => {
    const fx = (i % 2) * 4.6 + 0.6;
    const fy = Math.floor(i / 2) * 0.9 + 3.65;
    card(s, fx, fy, 4.4, 0.75, { accent: C.purple });
    s.addText(f.icon + " " + f.name, { x: fx + 0.2, y: fy + 0.05, w: 2.5, h: 0.3, fontSize: 12, fontFace: FONT.head, color: C.dark, bold: true });
    s.addText(f.desc, { x: fx + 0.2, y: fy + 0.35, w: 4.0, h: 0.3, fontSize: 10, fontFace: FONT.body, color: C.gray500 });
  });
});

// --- Slide 24: Marketing ---
addContentSlide("Marketing — Suite Completa", (s) => {
  const marketingModules = [
    { name: "Campanhas", icon: "📣", items: ["Briefing", "Pecas", "Timeline", "Budget"], color: C.red },
    { name: "Conteudo", icon: "✍️", items: ["Calendario", "Briefs", "Assets", "Aprovacoes"], color: C.blue },
    { name: "Redes Sociais", icon: "📱", items: ["Contas", "Agendamento", "Relatorios", "Performance"], color: C.purple },
    { name: "Email Studio", icon: "📧", items: ["Campanhas", "Analytics", "Envios"], color: C.green },
  ];
  marketingModules.forEach((m, i) => {
    const mx = (i % 2) * 4.6 + 0.6;
    const my = Math.floor(i / 2) * 2.1 + 1.1;
    card(s, mx, my, 4.4, 1.9, { accent: m.color });
    s.addText(m.icon + " " + m.name, { x: mx + 0.2, y: my + 0.1, w: 4.0, h: 0.4, fontSize: 16, fontFace: FONT.head, color: C.dark, bold: true });
    m.items.forEach((item, j) => {
      s.addShape(pres.shapes.RECTANGLE, { x: mx + 0.2 + j * 1.05, y: my + 0.65, w: 0.95, h: 0.3, fill: { color: m.color, transparency: 88 } });
      s.addText(item, { x: mx + 0.2 + j * 1.05, y: my + 0.65, w: 0.95, h: 0.3, fontSize: 9, fontFace: FONT.body, color: m.color, bold: true, align: "center", valign: "middle" });
    });
  });
});

// --- Slide 25: Blog & Relatorios ---
addContentSlide("Blog, Relatorios & Conhecimento", (s) => {
  // Blog
  card(s, 0.6, 1.1, 4.4, 1.7, { accent: C.blue });
  s.addText("📝 Blog (CMS nativo)", { x: 0.85, y: 1.2, w: 4.0, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, ["Criar, editar e publicar artigos", "Editor rich text", "SEO e meta tags", "Categorias e tags"], 0.85, 1.6, 3.9, 1.1);

  // Relatorios
  card(s, 5.3, 1.1, 4.1, 1.7, { accent: C.orange });
  s.addText("📊 Relatorios", { x: 5.5, y: 1.2, w: 3.7, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, ["Filtros customizaveis", "Group by por qualquer campo", "Reordenacao com Drag & Drop", "Edicao inline"], 5.5, 1.6, 3.5, 1.1);

  // SOPs
  card(s, 0.6, 3.05, 4.4, 1.9, { accent: C.yellow });
  s.addText("📋 SOPs", { x: 0.85, y: 3.15, w: 4.0, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, ["Organizado por BU", "Navegacao: BU > SOP especifico", "Templates em PDF/DOCX", "Papel timbrado oficial TBO"], 0.85, 3.55, 3.9, 1.3);

  // Templates & Guias
  card(s, 5.3, 3.05, 4.1, 1.9, { accent: C.green });
  s.addText("📑 Templates & Guias", { x: 5.5, y: 3.15, w: 3.7, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, ["Biblioteca centralizada", "Templates reutilizaveis", "Guias de processos internos", "Versionamento e historico"], 5.5, 3.55, 3.5, 1.3);
});

// =====================================================================
// BLOCO 6 — SISTEMA & INTEGRACOES
// =====================================================================
addSectionSlide("Sistema & Integracoes", "OMIE, Fireflies, CRM nativo, Website Admin & Configuracoes");

// --- Slide 26: Integracoes ---
addContentSlide("Integracoes Ativas", (s) => {
  const integrations = [
    {
      icon: "🏢", name: "OMIE (ERP)", color: C.green, direction: "OMIE → TBO OS (leitura) + TBO OS → OMIE (escrita limitada)",
      items: ["Faturas e notas fiscais", "Contas a pagar e receber", "Fluxo de caixa", "Clientes e fornecedores"],
    },
    {
      icon: "🎤", name: "Fireflies (Transcricao)", color: "8B5CF6", direction: "Fireflies → TBO OS (leitura only)",
      items: ["Transcricao automatica de reunioes", "Action items extraidos por IA", "Alimenta modulo 1:1s", "Feeds para PDI"],
    },
    {
      icon: "💼", name: "CRM (Nativo)", color: C.blue, direction: "100% Supabase — dados migrados do RD Station",
      items: ["Pipeline de deals (kanban)", "Atividades comerciais", "Historico de interacoes", "Zero dependencia externa"],
    },
  ];
  integrations.forEach((int, i) => {
    card(s, 0.6, 1.1 + i * 1.45, 8.8, 1.3, { accent: int.color });
    s.addText(int.icon + " " + int.name, { x: 0.85, y: 1.15 + i * 1.45, w: 3.5, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
    s.addText(int.direction, { x: 4.5, y: 1.15 + i * 1.45, w: 4.8, h: 0.35, fontSize: 10, fontFace: FONT.body, color: int.color, italic: true });
    int.items.forEach((item, j) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 0.85 + j * 2.15, y: 1.6 + i * 1.45, w: 2.0, h: 0.3, fill: { color: int.color, transparency: 90 } });
      s.addText(item, { x: 0.85 + j * 2.15, y: 1.6 + i * 1.45, w: 2.0, h: 0.3, fontSize: 9, fontFace: FONT.body, color: C.gray700, align: "center", valign: "middle" });
    });
  });
  // Sync pattern note
  s.addText("Padrao: retry 3x com backoff exponencial | badge de status (synced/syncing/error) | fallback UI offline", {
    x: 0.6, y: 4.7, w: 8.8, h: 0.3, fontSize: 9, fontFace: FONT.body, color: C.gray400, italic: true,
  });
});

// --- Slide 27: Website Admin & Config ---
addContentSlide("Website Admin, Config & Audit", (s) => {
  // Website Admin
  card(s, 0.6, 1.1, 4.4, 1.6, { accent: C.blue });
  s.addText("🌐 Website Admin", { x: 0.85, y: 1.2, w: 4.0, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, ["Gestao de projetos do site", "Criar e editar paginas", "Configuracoes gerais"], 0.85, 1.6, 3.9, 1.0);

  // Configuracoes
  card(s, 5.3, 1.1, 4.1, 1.6, { accent: C.gray500 });
  s.addText("⚙️ Configuracoes", { x: 5.5, y: 1.2, w: 3.7, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  const tabs = ["Perfil", "Aparencia", "Notificacoes", "Workspace", "Integracoes", "Usuarios", "Audit"];
  tabs.forEach((t, i) => {
    badge(s, 5.5 + (i % 4) * 0.88, 1.65 + Math.floor(i / 4) * 0.4, t, C.gray600);
  });

  // Audit Log
  card(s, 0.6, 2.95, 4.4, 2.0, { accent: C.red });
  s.addText("🛡️ Audit Log", { x: 0.85, y: 3.05, w: 4.0, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  s.addText("Acesso: Founder + Diretoria", { x: 0.85, y: 3.4, w: 4.0, h: 0.25, fontSize: 10, fontFace: FONT.body, color: C.red, bold: true });
  bullets(s, ["Quem alterou", "Quando alterou", "O que mudou", "Estado anterior e posterior"], 0.85, 3.7, 3.9, 1.1);

  // Changelog
  card(s, 5.3, 2.95, 4.1, 2.0, { accent: C.purple });
  s.addText("📜 Changelog", { x: 5.5, y: 3.05, w: 3.7, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  s.addText("Tags:", { x: 5.5, y: 3.45, w: 1, h: 0.25, fontSize: 10, fontFace: FONT.body, color: C.gray500, bold: true });
  const tags = [
    { name: "Nova Funcionalidade", color: C.green },
    { name: "Correcao", color: C.red },
    { name: "Melhoria", color: C.blue },
    { name: "Breaking Change", color: C.yellow },
  ];
  tags.forEach((t, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 3.75 + i * 0.4, w: 3.3, h: 0.3, fill: { color: t.color, transparency: 88 } });
    s.addText(t.name, { x: 5.6, y: 3.75 + i * 0.4, w: 3.1, h: 0.3, fontSize: 10, fontFace: FONT.body, color: t.color, bold: true, valign: "middle" });
  });
});

// =====================================================================
// BLOCO 7 — UX & PADROES
// =====================================================================
addSectionSlide("UX & Padroes", "Drag & Drop, tabelas Notion-style, feedback visual e estados");

// --- Slide 28: Drag & Drop ---
addContentSlide("Drag & Drop Universal", (s) => {
  card(s, 0.6, 1.1, 8.8, 1.2, { accent: C.purple });
  s.addText("Todos os modulos suportam D&D. Ao mover para nova secao:", {
    x: 0.85, y: 1.15, w: 8.3, h: 0.35, fontSize: 14, fontFace: FONT.head, color: C.dark, bold: true,
  });
  const autoRules = [
    { icon: "📊", rule: "Status da secao destino aplicado" },
    { icon: "🏷️", rule: "Tags obrigatorias adicionadas" },
    { icon: "👤", rule: "Assignee padrao atribuido" },
    { icon: "🔒", rule: "Permissoes herdadas" },
  ];
  autoRules.forEach((r, i) => {
    s.addText(r.icon + " " + r.rule, { x: 0.85 + (i % 2) * 4.3, y: 1.6 + Math.floor(i / 2) * 0.3, w: 4.0, h: 0.3, fontSize: 11, fontFace: FONT.body, color: C.gray600 });
  });

  // Flow
  s.addText("FLUXO D&D", { x: 0.6, y: 2.6, w: 3, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const flow = ["Drag Item", "→", "Regras da secao", "→", "Update otimista", "→", "Salva Supabase", "→", "Broadcast Realtime"];
  flow.forEach((f, i) => {
    if (f === "→") {
      s.addText("→", { x: 0.55 + i * 1.08, y: 2.95, w: 0.3, h: 0.5, fontSize: 16, color: C.purple, align: "center", valign: "middle" });
    } else {
      s.addShape(pres.shapes.RECTANGLE, { x: 0.4 + i * 1.08, y: 2.95, w: 1.05, h: 0.5, fill: { color: C.purple, transparency: 88 } });
      s.addText(f, { x: 0.4 + i * 1.08, y: 2.95, w: 1.05, h: 0.5, fontSize: 9, fontFace: FONT.body, color: C.purple, bold: true, align: "center", valign: "middle" });
    }
  });

  // Undo
  card(s, 0.6, 3.7, 8.8, 0.8, { accent: C.yellow });
  s.addText("⌨️  Ctrl+Z obrigatorio — toda acao D&D tem undo stack para rollback", {
    x: 0.85, y: 3.75, w: 8.3, h: 0.7, fontSize: 14, fontFace: FONT.head, color: C.dark, bold: true, valign: "middle",
  });

  s.addText("Em caso de erro na persistencia: rollback automatico + toast de erro", {
    x: 0.6, y: 4.7, w: 8.8, h: 0.3, fontSize: 10, fontFace: FONT.body, color: C.red, italic: true,
  });
});

// --- Slide 29: Tabelas Notion-Style ---
addContentSlide("Tabelas Notion-Style", (s) => {
  s.addText("18 tipos de propriedade com edicao inline e filtros persistentes", {
    x: 0.6, y: 1.05, w: 8.8, h: 0.35, fontSize: 13, fontFace: FONT.body, color: C.gray600,
  });
  const types = [
    "text", "number", "select", "multi_select", "status", "person",
    "checkbox", "phone", "date", "files", "url", "email",
    "relation", "rollup", "formula", "id", "created_at", "updated_at",
  ];
  types.forEach((t, i) => {
    const tx = (i % 6) * 1.55 + 0.6;
    const ty = Math.floor(i / 6) * 0.45 + 1.55;
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: 1.4, h: 0.35, fill: { color: C.purple, transparency: 90 } });
    s.addText(t, { x: tx, y: ty, w: 1.4, h: 0.35, fontSize: 9, fontFace: "Consolas", color: C.purple, bold: true, align: "center", valign: "middle" });
  });

  // Features
  s.addText("FUNCIONALIDADES", { x: 0.6, y: 3.0, w: 3, h: 0.25, fontSize: 10, fontFace: FONT.head, color: C.gray500, bold: true });
  const features = [
    { icon: "🔀", name: "D&D de colunas", desc: "Reordene colunas arrastando" },
    { icon: "🔍", name: "Filtros persistentes", desc: "Salvos no Supabase por view" },
    { icon: "↕️", name: "Ordenacao combinavel", desc: "Sort A, depois B, asc/desc" },
    { icon: "✏️", name: "Edicao inline", desc: "Clique para editar na celula" },
  ];
  features.forEach((f, i) => {
    card(s, 0.6 + i * 2.35, 3.35, 2.15, 1.3);
    s.addText(f.icon, { x: 0.6 + i * 2.35, y: 3.4, w: 2.15, h: 0.4, fontSize: 22, align: "center" });
    s.addText(f.name, { x: 0.7 + i * 2.35, y: 3.8, w: 1.95, h: 0.3, fontSize: 11, fontFace: FONT.head, color: C.dark, bold: true, align: "center" });
    s.addText(f.desc, { x: 0.7 + i * 2.35, y: 4.1, w: 1.95, h: 0.4, fontSize: 10, fontFace: FONT.body, color: C.gray500, align: "center" });
  });
});

// --- Slide 30: Feedback Visual & Estados ---
addContentSlide("Feedback Visual & Estados", (s) => {
  // Feedback rules
  card(s, 0.6, 1.1, 4.4, 2.0, { accent: C.green });
  s.addText("⚡ Feedback Visual", { x: 0.85, y: 1.2, w: 4.0, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  bullets(s, [
    "Toda acao: feedback em <100ms",
    "Optimistic updates em toda mutacao",
    "Skeleton loading = layout real",
    "Empty states com CTA claro",
    "Toast: 3-5s auto-dismiss",
  ], 0.85, 1.6, 3.9, 1.4);

  // States
  card(s, 5.3, 1.1, 4.1, 2.0, { accent: C.blue });
  s.addText("🎨 Estados Obrigatorios", { x: 5.5, y: 1.2, w: 3.7, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  const states = [
    { name: "Loading", desc: "Skeleton content-aware", color: C.blue },
    { name: "Empty", desc: "Inspira acao + CTA", color: C.yellow },
    { name: "Error", desc: "Msg util + retry", color: C.red },
  ];
  states.forEach((st, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.65 + i * 0.4, w: 3.5, h: 0.32, fill: { color: st.color, transparency: 90 } });
    s.addText(st.name, { x: 5.6, y: 1.65 + i * 0.4, w: 1.2, h: 0.32, fontSize: 10, fontFace: FONT.head, color: st.color, bold: true, valign: "middle" });
    s.addText(st.desc, { x: 6.8, y: 1.65 + i * 0.4, w: 2.1, h: 0.32, fontSize: 10, fontFace: FONT.body, color: C.gray500, valign: "middle" });
  });

  // RBAC note
  card(s, 0.6, 3.4, 8.8, 1.5, { accent: C.red });
  s.addText("🔒 RBAC na Pratica", { x: 0.85, y: 3.5, w: 8.3, h: 0.35, fontSize: 15, fontFace: FONT.head, color: C.dark, bold: true });
  const rbacRules = [
    { rule: "Dupla camada: RBACGuard (frontend) + RLS (Supabase)", icon: "🛡️" },
    { rule: "Dados acima do nivel: ESCONDIDOS, nao desabilitados", icon: "👁️" },
    { rule: "Dashboard renderiza widgets diferentes por role", icon: "📊" },
    { rule: "Nunca confiar so no frontend para seguranca", icon: "⚠️" },
  ];
  rbacRules.forEach((r, i) => {
    s.addText(r.icon + " " + r.rule, {
      x: 0.85 + (i % 2) * 4.3, y: 3.95 + Math.floor(i / 2) * 0.35, w: 4.0, h: 0.3,
      fontSize: 11, fontFace: FONT.body, color: C.gray600,
    });
  });
});

// =====================================================================
// BLOCO 8 — ENCERRAMENTO
// =====================================================================

// --- Slide 31: Roadmap ---
addContentSlide("Roadmap & Melhoria Continua", (s) => {
  card(s, 0.6, 1.1, 8.8, 1.5, { accent: C.purple });
  s.addText("15 Agentes QA Automatizados", { x: 0.85, y: 1.2, w: 8.3, h: 0.4, fontSize: 18, fontFace: FONT.head, color: C.dark, bold: true });
  s.addText("Pipeline de melhoria continua em 4 camadas", { x: 0.85, y: 1.6, w: 8.3, h: 0.3, fontSize: 12, fontFace: FONT.body, color: C.gray500 });
  // Pipeline flow
  const pipeline = ["Orchestrator", "Auditor", "Implementor", "Validator", "Regression"];
  pipeline.forEach((p, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.85 + i * 1.8, y: 1.95, w: 1.6, h: 0.4, fill: { color: C.purple } });
    s.addText(p, { x: 0.85 + i * 1.8, y: 1.95, w: 1.6, h: 0.4, fontSize: 10, fontFace: FONT.head, color: C.white, bold: true, align: "center", valign: "middle" });
    if (i < pipeline.length - 1) {
      s.addText("→", { x: 0.85 + i * 1.8 + 1.6, y: 1.95, w: 0.2, h: 0.4, fontSize: 14, color: C.purple, align: "center", valign: "middle" });
    }
  });

  // Layers
  const layers = [
    { name: "Infraestrutura", desc: "Orchestrator, Auditor, Implementor, Validator", color: C.purple },
    { name: "Projetos", desc: "270 arquivos, 40.9k linhas — structural, UX, tasks, views, integrations", color: C.blue },
    { name: "Pessoas", desc: "87 arquivos, 15.4k linhas — structural, performance, growth, analytics", color: C.green },
    { name: "Cross-Module", desc: "Data contracts, regression guard, build health", color: C.orange },
  ];
  layers.forEach((l, i) => {
    card(s, 0.6 + (i % 2) * 4.6, 2.7 + Math.floor(i / 2) * 1.1, 4.4, 0.95, { accent: l.color });
    s.addText(l.name, { x: 0.85 + (i % 2) * 4.6, y: 2.75 + Math.floor(i / 2) * 1.1, w: 4.0, h: 0.3, fontSize: 13, fontFace: FONT.head, color: l.color, bold: true });
    s.addText(l.desc, { x: 0.85 + (i % 2) * 4.6, y: 3.05 + Math.floor(i / 2) * 1.1, w: 4.0, h: 0.4, fontSize: 10, fontFace: FONT.body, color: C.gray500 });
  });
});

// --- Slide 32: Suporte ---
addContentSlide("Suporte & Recursos", (s) => {
  const resources = [
    { icon: "💬", name: "Chat Interno", desc: "Canal dedicado para duvidas sobre o TBO OS. Resposta rapida do time de dev.", color: C.blue },
    { icon: "📋", name: "SOPs por Processo", desc: "Cada fluxo tem SOP detalhado com passo-a-passo. Organizado por BU.", color: C.yellow },
    { icon: "📜", name: "Changelog", desc: "Acompanhe todas as atualizacoes em tempo real. Tags por tipo de mudanca.", color: C.purple },
    { icon: "🎓", name: "TBO Academy", desc: "Treinamentos e capacitacoes internas para novos features.", color: C.green },
  ];
  resources.forEach((r, i) => {
    const rx = (i % 2) * 4.6 + 0.6;
    const ry = Math.floor(i / 2) * 2.0 + 1.1;
    card(s, rx, ry, 4.4, 1.8, { accent: r.color });
    s.addText(r.icon, { x: rx + 0.15, y: ry + 0.15, w: 0.6, h: 0.5, fontSize: 28 });
    s.addText(r.name, { x: rx + 0.8, y: ry + 0.2, w: 3.3, h: 0.35, fontSize: 16, fontFace: FONT.head, color: C.dark, bold: true, margin: 0 });
    s.addText(r.desc, { x: rx + 0.2, y: ry + 0.7, w: 4.0, h: 0.9, fontSize: 12, fontFace: FONT.body, color: C.gray500 });
  });
});

// --- Slide 33: Final ---
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };
  // Decorative shapes
  s.addShape(pres.shapes.OVAL, { x: -2, y: -2, w: 6, h: 6, fill: { color: C.purple, transparency: 92 } });
  s.addShape(pres.shapes.OVAL, { x: 6, y: 2, w: 5, h: 5, fill: { color: C.blue, transparency: 92 } });
  // Left accent
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.8, w: 0.08, h: 2.0, fill: { color: C.purple } });
  // Text
  s.addText("TBO OS", {
    x: 1.0, y: 1.5, w: 8, h: 1.0,
    fontSize: 48, fontFace: FONT.head, color: C.white, bold: true,
    charSpacing: 5, margin: 0,
  });
  s.addText("Construido pela TBO, para a TBO.", {
    x: 1.0, y: 2.5, w: 8, h: 0.6,
    fontSize: 22, fontFace: FONT.head, color: C.purpleLight,
    margin: 0,
  });
  s.addText("Duvidas? Fale no Chat.", {
    x: 1.0, y: 3.3, w: 8, h: 0.5,
    fontSize: 16, fontFace: FONT.body, color: C.gray400,
    margin: 0,
  });
})();

// ─── SAVE ───────────────────────────────────────────────────────────
const outPath = path.join(__dirname, "..", "frontend", "docs", "treinamento-tbo-os.pptx");
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Apresentacao gerada:", outPath);
  console.log("Total de slides:", pres.slides.length);
}).catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
