# TBO OS — FASE 1 de 7
# Fundação: Estrutura, UI, Navegação e Configurações
# Tempo estimado: 15-20 minutos

> **Ao terminar:** abra o TBO_OS.bat na área de trabalho.
> Você deve ver a aplicação com sidebar, 8 módulos na navegação,
> e o módulo de Configurações funcionando (salvar API key).
> Os outros módulos mostram tela placeholder "Em construção".

---

```
Você é um engenheiro de software full-stack sênior. 
Estamos construindo o TBO OS em fases. Esta é a FASE 1.

O TBO OS é uma plataforma operacional completa para a TBO, 
um estúdio de visualização arquitetônica e marketing 
imobiliário de Curitiba, fundado em 2019, com 115+ projetos.

Sócios: Marco Andolfato (Dir. Criativo/Estratégia) e 
Ruy Lima (Dir. Comercial).

=====================================================
FASE 1 — FUNDAÇÃO E ESTRUTURA
=====================================================

Crie a aplicação base com:

1. ESTRUTURA DE ARQUIVOS

Salve na área de trabalho do usuário atual do Windows 
em pasta "TBO_OS":

/TBO_OS/
├── index.html
├── styles.css
├── app.js              — Roteamento e lógica principal
├── modules/
│   ├── command-center.js
│   ├── content.js
│   ├── commercial.js
│   ├── projects.js
│   ├── market.js
│   ├── meetings.js
│   ├── financial.js
│   └── settings.js
├── config.js           — System prompts e configurações
├── data/
│   ├── context-data.json    — {} (vazio, será preenchido)
│   ├── meetings-data.json   — {} (vazio, será preenchido)
│   ├── market-data.json     — {} (vazio, será preenchido)
│   ├── news-data.json       — {} (vazio, será preenchido)
│   └── sources.json         — Lista de fontes pré-configurada
├── utils/
│   ├── api.js          — Wrapper da API do Claude
│   ├── scraper.js      — Placeholder
│   ├── search.js       — Placeholder
│   └── storage.js      — Gerenciamento de localStorage
├── README.md
└── TBO_OS.bat

Crie também TBO_OS.bat na área de trabalho (fora da pasta).

2. DESIGN E ESTÉTICA

A aplicação deve ter personalidade visual forte. 
NÃO use estética genérica de IA (gradientes roxos, 
Inter/Roboto, cards genéricos).

Direção estética: INDUSTRIAL-EDITORIAL
- Tema escuro por padrão (fundo #0a0a0a ou similar)
- Accent color: um tom de âmbar/dourado sutil 
  (comunica "estúdio de alto padrão")
- Tipografia: escolha uma fonte display sofisticada 
  e com caráter via Google Fonts pra headings. 
  Corpo em fonte clean e legível. NÃO use Inter, 
  Roboto, Arial, Space Grotesk.
- Layout: sidebar fixa à esquerda (estreita, ~60-70px 
  colapsada, expandível a ~240px) com ícones + labels
- Área principal com padding generoso
- Micro-animações sutis nas transições de módulo
- Bordas sutis, sem box-shadows pesados
- Toggle dark/light mode no header

Header fixo com:
- Logo/nome "TBO OS" à esquerda (estilizado)
- Indicadores de status (com ícones):
  * Dados TBO: "Não sincronizado" (em vermelho sutil)
  * Fireflies: "Não sincronizado"
  * Mercado: "Não sincronizado"
  * API Claude: "Não configurada" / "Ativa ✓"
- Toggle dark/light mode
- Relógio com data atual

3. SIDEBAR — NAVEGAÇÃO

8 módulos com ícones (use emojis ou SVG inline):

📊 Command Center
✍️ Conteúdo & Redação
💼 Comercial & Propostas
📋 Gestão de Projetos
📈 Inteligência de Mercado
🎯 Reuniões & Contexto
💰 Financeiro
⚙️ Configurações

A sidebar deve:
- Mostrar ícone sempre (modo colapsado)
- Expandir ao hover ou clique mostrando label
- Highlight no módulo ativo
- Animação suave de transição

4. ROTEAMENTO

Cada módulo carrega seu .js correspondente.
Ao clicar num módulo, a área principal muda.
Use hash routing (#command-center, #content, etc.)
O módulo padrão ao abrir é Command Center.

5. MÓDULOS PLACEHOLDER

Para TODOS os módulos exceto Configurações, mostre 
uma tela placeholder elegante com:
- Ícone grande do módulo
- Nome do módulo
- Texto: "Módulo será ativado na próxima fase"
- Subtexto com preview do que o módulo fará, ex:
  "Command Center: Dashboard com KPIs, alertas 
  inteligentes e feed de notícias do mercado"

Liste os sub-módulos que virão, ex:
"Em breve:
 · Dashboard de KPIs
 · Alertas inteligentes
 · Feed de notícias
 · Briefing semanal"

6. MÓDULO DE CONFIGURAÇÕES (FUNCIONAL)

Este módulo deve funcionar COMPLETO nesta fase:

SUB-MÓDULO: API & Conexões
- Campo pra API key do Claude
- Botão "Salvar" (grava no localStorage)
- Botão "Testar conexão" (faz uma chamada simples 
  à API e confirma se funciona)
- Seletor de modelo (padrão: claude-sonnet-4-20250514,
  opções: claude-sonnet-4-20250514, claude-sonnet-4-5-20250514)
- Status visual: "Conectado ✓" ou "Erro: [mensagem]"

SUB-MÓDULO: Contexto & Dados
- Cards mostrando cada JSON de dados:
  * context-data.json — "Vazio — Execute Fase 2"
  * meetings-data.json — "Vazio — Execute Fase 3"  
  * market-data.json — "Vazio — Execute Fase 4"
  * news-data.json — "Vazio — Execute Fase 4"
- Pra cada JSON: botão "Visualizar", botão "Editar" 
  (abre editor inline), botão "Exportar"
- Contador: "0 projetos | 0 reuniões | 0 notícias"

SUB-MÓDULO: Tom de Voz & Prompts
- Textarea com system prompt base (editável)
- Carregue um system prompt default razoável 
  (com a identidade da TBO que descrevi acima)
- Botão "Restaurar padrão"
- Preview: "Testar prompt" que envia ao Claude 
  e mostra a resposta

SUB-MÓDULO: Fontes de Mercado & Notícias
- Lista pré-configurada de fontes (não funcional ainda):
  * Cúpola (cupola.com.br) — Dados ✗
  * Brain (brain.srv.br) — Dados ✗
  * Datastore (mundodatastore.com.br) — Dados ✗
  * ABRAINC (abrainc.org.br) — Dados ✗
  * Valor Econômico — Notícias ✗
  * InfoMoney — Notícias ✗
  * Imobi Report — Notícias ✗
- Toggle ativo/inativo por fonte
- Campos pra adicionar nova fonte (URL + tipo)

SUB-MÓDULO: Fireflies
- Status: "Não sincronizado"
- Preview: "A sincronização com Fireflies será 
  ativada na Fase 3"

7. UTILITÁRIOS

utils/api.js:
- Função sendToClaudeAPI(systemPrompt, userMessage, options)
- Usa a API key do localStorage
- Modelo do localStorage
- Streaming support (mostra resposta chegando)
- Tratamento de erros completo
- Retry com backoff exponencial (max 3 tentativas)

utils/storage.js:
- getApiKey(), setApiKey()
- getData(filename), setData(filename, data)
- getHistory(module), addToHistory(module, entry)
- getSettings(), updateSettings(partial)

config.js:
- System prompt base default com identidade da TBO
- Prompts por módulo (placeholders por enquanto)
- Lista de fontes de mercado e notícias
- Configurações default

8. RESPONSIVIDADE

A aplicação deve funcionar em:
- Desktop (principal)
- Tablet (sidebar colapsa)
- Mobile (sidebar vira menu hamburger, layout single column)

9. ATALHOS DE TECLADO

- Ctrl+1 a Ctrl+8: navegar entre módulos
- Ctrl+K: busca rápida (abre um modal de busca)
  Por enquanto o modal existe mas mostra "Busca 
  será ativada quando dados forem carregados"
- Esc: fechar modais
- Ctrl+D: toggle dark/light mode

10. README.md

Em português. Explique:
- O que é o TBO OS
- Como usar (abrir o .bat)
- Estrutura das fases
- Como configurar a API key
- Estrutura de arquivos
- Como editar dados manualmente

11. .BAT LAUNCHER

TBO_OS.bat deve:
@echo off
REM TBO OS — Plataforma Operacional da TBO
REM Abre a aplicação no navegador padrão
start "" "%~dp0index.html"

Copie também pra área de trabalho do usuário.

=====================================================
RESULTADO ESPERADO
=====================================================

Ao abrir o TBO_OS.bat, o usuário vê:
- Aplicação escura, sofisticada, profissional
- Sidebar com 8 módulos navegáveis
- Command Center como tela inicial (placeholder bonito)
- Módulo de Configurações totalmente funcional
- Pode salvar API key, testar conexão, ver JSONs vazios
- Todos os outros módulos mostram preview do que virá
- Responsivo, com atalhos funcionando
- Toggle dark/light mode

Execute tudo sem pausas para confirmação.
Priorize: funcionalidade > estética, mas ambas importam.
```
