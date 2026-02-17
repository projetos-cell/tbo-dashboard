# TBO OS — Guia de Execução por Fases

## Visão Geral

O TBO OS é construído em **7 fases sequenciais**.
Cada fase produz um .bat funcional que você pode abrir e testar.
Se algo der errado numa fase, as anteriores continuam funcionando.

---

## Sequência de Execução

| Fase | O que faz | Tempo est. | O que testar no .bat |
|------|-----------|------------|---------------------|
| **1** | Estrutura, UI, sidebar, Configurações | 15-20 min | App abre, navega, salva API key |
| **2** | Coleta Drive + Notion | 25-45 min | Configurações mostra dados de projetos |
| **3** | Coleta Fireflies | 15-30 min | Configurações mostra reuniões |
| **4** | Coleta mercado + Command Center + Intel. Mercado | 20-35 min | Dashboard com KPIs, notícias, mercado |
| **5** | Conteúdo & Redação + Comercial | 20-30 min | Gerar post LinkedIn, gerar proposta |
| **6** | Projetos + Reuniões + Financeiro | 20-30 min | Buscar reuniões, ver projetos |
| **7** | Busca global, integração, polimento, testes | 15-25 min | Ctrl+K funciona, tudo integrado |

**Total estimado: 2h a 3h30**
**Cenário provável: ~2h30**

---

## Como Executar Cada Fase

### Preparação (fazer uma vez):

1. Abra o Claude Code
2. Configure o diretório raiz como `I:\Meu Drive`
3. Ative "Accept edits automatically" (recomendado)
4. Tenha sua API key do Claude em mãos

### Para cada fase:

1. Abra o arquivo da fase (TBO_OS_FaseX.md)
2. Copie APENAS o conteúdo entre os ``` (o prompt)
3. Cole no Claude Code e execute
4. Aguarde conclusão
5. Teste abrindo o TBO_OS.bat na área de trabalho
6. Se tudo ok, prossiga pra próxima fase
7. Se algo deu errado, informe o Claude Code o erro 
   e peça pra corrigir antes de prosseguir

### Dicas:

- **Não pule fases** — cada uma depende da anterior
- **Teste entre fases** — abra o .bat e verifique
- **Se o Claude Code travar** — copie o erro, abra uma 
  nova sessão, cole o erro e peça pra continuar
- **Pastas offline** — antes da Fase 2, garanta que as 
  pastas de projetos do Drive estejam disponíveis offline
- **Fase 4 pode falhar parcialmente** — sites de mercado 
  podem bloquear scraping. Normal. O resto funciona.

---

## Resultado Final

Ao completar a Fase 7, você terá na área de trabalho:

📁 **TBO_OS/** (pasta com todos os arquivos)
🖥️ **TBO_OS.bat** (atalho direto — clique pra abrir)

A plataforma completa com 8 módulos:
1. 📊 Command Center — Dashboard, KPIs, alertas, notícias
2. ✍️ Conteúdo & Redação — LinkedIn, Instagram, emails, Academy
3. 💼 Comercial & Propostas — Propostas, cases, pricing, pipeline
4. 📋 Gestão de Projetos — Visão geral, prep reuniões, auditor
5. 📈 Inteligência de Mercado — Dashboard, consulta, insights
6. 🎯 Reuniões & Contexto — Busca, action items, análise
7. 💰 Financeiro — Benchmarks, simulador, propostas
8. ⚙️ Configurações — API, dados, prompts, fontes

Tudo alimentado por: Drive + Notion + Fireflies + Web
Motor de IA: Claude API (Anthropic)
