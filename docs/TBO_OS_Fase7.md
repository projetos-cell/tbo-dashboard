# TBO OS — FASE 7 de 7
# Polimento: Integração, Busca Global, Testes, Ajustes
# Tempo estimado: 15-25 minutos

> **Pré-requisito:** Fases 1-6 concluídas, todos os módulos funcionais
> **Ao terminar:** o TBO OS está completo e pronto pra uso diário.
> Teste: Ctrl+K abre busca global. Navegue por todos os módulos.
> Verifique que tudo funciona no celular (responsividade).

---

```
Você é um engenheiro de software full-stack sênior.
Estamos construindo o TBO OS em fases. Esta é a FASE 7 — FINAL.

As Fases 1-6 já foram executadas. A aplicação existe em:
[ÁREA DE TRABALHO DO USUÁRIO]\TBO_OS\

Todos os 8 módulos estão construídos e funcionais.
Nesta fase final:
1. Ative a busca global (Ctrl+K)
2. Integre e teste todos os módulos
3. Polimento visual e de UX
4. Atualize o README final
5. Teste completo

=====================================================
1. BUSCA GLOBAL (Ctrl+K)
=====================================================

Implemente o modal de busca rápida (command palette):

Ao pressionar Ctrl+K ou clicar no ícone de busca no header:
- Modal overlay escuro com campo de busca central
- Placeholder: "Buscar projetos, reuniões, clientes, dados..."
- Busca enquanto digita (debounce 300ms)

Fontes de busca (busca local nos JSONs):
1. Projetos (context-data.json) — por nome, cliente, BU
2. Reuniões (meetings-data.json) — por título, participante, 
   keywords, summary
3. Clientes (by_client no meetings-data.json) — por nome
4. Dados de mercado (market-data.json) — por título, categoria
5. Notícias (news-data.json) — por título
6. Action items (meetings-data.json) — por tarefa, pessoa
7. Módulos do sistema — por nome

Resultados agrupados por categoria com ícones:
📁 Projetos
🎯 Reuniões  
🏢 Clientes
📈 Mercado
📰 Notícias
✅ Action Items
⚡ Ações (navegar para módulo)

Cada resultado clicável:
- Projeto → abre Gestão de Projetos com projeto expandido
- Reunião → abre Reuniões & Contexto com a reunião
- Cliente → abre Reuniões com filtro do cliente
- Mercado/Notícia → abre Inteligência de Mercado
- Action item → abre Action Items Tracker filtrado
- Módulo → navega pro módulo

Esc ou clicar fora fecha o modal.
Máximo 5 resultados por categoria.

Implemente em utils/search.js como módulo reutilizável.

=====================================================
2. INTEGRAÇÃO ENTRE MÓDULOS
=====================================================

Adicione links cruzados entre módulos:

A) No Command Center:
- KPI "Projetos ativos" clicável → Gestão de Projetos
- KPI "Reuniões recentes" → Reuniões & Contexto
- KPI "Action items" → Action Items Tracker
- KPI "Dados de mercado" → Inteligência de Mercado
- Cada alerta com link pro módulo relevante
- Cada reunião no painel lateral → Reuniões

B) Na Gestão de Projetos:
- Botão "Gerar post sobre este projeto" → Content, 
  pré-preenchendo o dropdown de projeto
- Botão "Ver reuniões deste projeto" → Reuniões, 
  pré-filtrando por projeto
- Botão "Gerar case deste projeto" → Comercial > Cases

C) Nas Reuniões:
- Ao ver reunião com cliente, botão "Preparar email" 
  → Content > Emails, pré-preenchendo cliente e contexto
- Botão "Gerar proposta pra este cliente" → Comercial

D) Na Inteligência de Mercado:
- Cada insight com botão "Transformar em post" 
  → Content > LinkedIn, pré-preenchendo
- Insights de prospecção com botão "Ir pro pipeline" 
  → Comercial > Pipeline

E) No Comercial:
- Proposta gerada com botão "Gerar email de envio" 
  → Content > Emails

Implementação: funções de navegação que aceitam 
parâmetros de pré-preenchimento.
Ex: navigateTo('content', 'linkedin', { project: 'Portofino' })

=====================================================
3. POLIMENTO VISUAL E UX
=====================================================

Revise e ajuste:

A) Consistência visual:
- Mesma linguagem de cores em todos os módulos
- Badges e tags com estilo consistente
- Espaçamento uniforme
- Fontes consistentes (heading vs body)

B) Estados vazios:
- Quando um sub-módulo não tem dados, mostre ilustração 
  ou ícone + texto amigável explicando o que fazer
- Ex: "Nenhum action item encontrado. Os action items 
  são extraídos automaticamente das reuniões do Fireflies."

C) Loading states:
- Skeleton loading enquanto chama Claude API
- Texto "Gerando..." com animação sutil
- Streaming: mostrar texto aparecendo letra a letra

D) Toasts / notificações:
- "Copiado!" ao clicar em botão Copiar
- "Configurações salvas" ao salvar API key
- "Erro: [mensagem]" quando API falhar

E) Responsividade final:
- Teste todos os módulos em viewport mobile (375px)
- Sidebar → hamburger menu no mobile
- Tabelas → cards empilhados no mobile
- Modais → fullscreen no mobile

F) Animações:
- Transição suave ao trocar de módulo (fade ou slide)
- Cards de KPI com hover sutil
- Sidebar com animação de expand/collapse
- Modal de busca com fade in/out

=====================================================
4. TESTES
=====================================================

Para cada módulo, verifique:

□ Command Center
  - KPIs mostram números corretos dos JSONs
  - Feed de notícias carrega e exibe
  - Alertas geram via API (se API key configurada) 
    OU mostram "Configure API key" se não
  - Briefing da semana gera corretamente
  - Links cruzados funcionam

□ Conteúdo & Redação
  - Todos os 5 sub-módulos carregam
  - Dropdowns populam com dados dos JSONs
  - Geração funciona (se API key configurada)
  - Copiar funciona
  - Refinar funciona (mantém contexto)
  - Histórico salva e é acessível

□ Comercial & Propostas
  - Gerador de propostas inclui contexto do Fireflies
  - Cases puxam dados corretos do projeto
  - Calculadora mostra ranges ou mensagem de dados insuficientes
  - Pipeline lista prospects identificados

□ Gestão de Projetos
  - Lista todos os projetos ativos
  - Indicadores de atividade calculam corretamente
  - Preparador de reuniões funciona por cliente
  - Auditor compara estruturas

□ Inteligência de Mercado
  - Dashboard mostra dados do market-data.json
  - Consulta inteligente funciona com API
  - Insights cruzam dados das 3 fontes

□ Reuniões & Contexto
  - Busca encontra reuniões por texto
  - Filtros funcionam (projeto, cliente, período)
  - Action Items tracker lista e filtra corretamente
  - Resumo executivo gera via API
  - Análise de relacionamento funciona por cliente

□ Financeiro
  - Benchmarks calculam com dados disponíveis
  - Simulador de cenários funciona
  - Controle de propostas é editável

□ Configurações
  - API key salva e testa
  - JSONs visualizáveis e editáveis
  - System prompt editável
  - Fontes de mercado listadas com status

□ Geral
  - Ctrl+K abre busca global
  - Ctrl+1 a Ctrl+8 navega entre módulos
  - Ctrl+D toggle dark/light
  - Esc fecha modais
  - Responsivo em mobile
  - Dark e light mode consistentes

Se encontrar erros, corrija-os imediatamente.

=====================================================
5. README.md FINAL
=====================================================

Atualize o README.md com instruções completas:

# TBO OS — Plataforma Operacional da TBO

## O que é
[descrição em 2-3 parágrafos]

## Como usar
1. Clique em TBO_OS.bat na área de trabalho
2. Configure sua API key em ⚙️ Configurações > API
3. Navegue pelos módulos na sidebar

## Módulos
[lista dos 8 módulos com breve descrição de cada]

## Atalhos de teclado
- Ctrl+K: Busca global
- Ctrl+1 a Ctrl+8: Navegar entre módulos
- Ctrl+D: Alternar dark/light mode
- Esc: Fechar modais e painéis

## Dados
Os dados da TBO estão em /data/:
- context-data.json: Projetos, metodologias, equipe
- meetings-data.json: Reuniões do Fireflies
- market-data.json: Dados do mercado imobiliário
- news-data.json: Feed de notícias
- sources.json: Configuração das fontes

Todos os arquivos JSON são editáveis manualmente 
ou via interface em Configurações.

## Atualização de dados
Para atualizar os dados, re-execute as fases 
correspondentes no Claude Code:
- Dados TBO: Fase 2
- Reuniões: Fase 3
- Mercado/Notícias: Fase 4

## Solução de problemas
[erros comuns e soluções]

## Construído com
- HTML, CSS, JavaScript
- Claude API (Anthropic)
- Dados: Google Drive, Notion, Fireflies, Web scraping

=====================================================
6. VERIFICAÇÃO FINAL
=====================================================

Abra o TBO_OS.bat e faça uma verificação visual 
completa. Se algo estiver quebrado ou faltando, 
corrija antes de finalizar.

O TBO OS deve estar 100% funcional ao fim desta fase.

Execute tudo sem pausas para confirmação.
```
