# TBO OS — FASE 4 de 7
# Coleta de Mercado + Módulos: Command Center, Inteligência de Mercado
# Tempo estimado: 20-35 minutos

> **Pré-requisito:** Fases 1-3 concluídas
> **Ao terminar:** abra o .bat.
> O Command Center deve estar funcional com KPIs, alertas e feed de notícias.
> O módulo Inteligência de Mercado deve estar funcional.

---

```
Você é um engenheiro de software full-stack sênior.
Estamos construindo o TBO OS em fases. Esta é a FASE 4.

As Fases 1-3 já foram executadas. A aplicação existe em:
[ÁREA DE TRABALHO DO USUÁRIO]\TBO_OS\

Os JSONs context-data.json e meetings-data.json já 
estão preenchidos com dados reais.

Nesta fase:
1. Colete dados de mercado e notícias (web scraping)
2. Ative o módulo COMMAND CENTER completo
3. Ative o módulo INTELIGÊNCIA DE MERCADO completo

=====================================================
COLETA — WEB SCRAPING MERCADO E NOTÍCIAS
=====================================================

FONTES DE DADOS (market-data.json):

A) CÚPOLA (cupola.com.br)
   - Blog e artigos sobre marketing imobiliário
   - Cases, metodologias, tendências
   - Foco: últimos 6 meses

B) BRAIN INTELIGÊNCIA ESTRATÉGICA (brain.srv.br)
   - Pesquisas de mercado imobiliário
   - Indicadores e dados do setor
   - Dados específicos Curitiba/PR

C) DATASTORE (mundodatastore.com.br)
   - Lançamentos imobiliários, VGV
   - Rankings de incorporadoras
   - Dados Curitiba

D) ABRAINC (abrainc.org.br)
   - Indicadores nacionais
   - Vendas, lançamentos, financiamento

E) COMPLEMENTARES (se acessíveis):
   CBIC, SECOVI-PR, ADEMI-PR, Sinduscon-PR

FONTES DE NOTÍCIAS (news-data.json):

F) Valor Econômico — seção imobiliário/construção
G) Estadão — caderno imóveis  
H) InfoMoney — setor imobiliário
I) Imobi Report
J) Buildings / GRI Club / Smartus

REGRAS DE SCRAPING:
- Respeite robots.txt de cada site
- Rate limiting: mínimo 2s entre requests ao mesmo domínio
- User-Agent: "TBO-OS-MarketIntel/1.0"
- Se fonte bloquear: tente sitemap.xml → RSS → 
  registre como "não acessível" e siga
- Extraia: título, data, URL, resumo/conteúdo, categoria
- Priorize dados quantitativos quando encontrar

=====================================================
ESTRUTURA market-data.json
=====================================================

{
  "metadata": {
    "collected_at": "ISO date",
    "sources_accessed": N,
    "sources_failed": N,
    "total_entries": N
  },
  "sources_status": [
    { "name": "Cúpola", "url": "...", "status": "ok|failed|partial", 
      "entries_collected": N, "last_access": "ISO" }
  ],
  "data": [
    {
      "source": "Cúpola",
      "url": "URL da página",
      "title": "...",
      "date": "ISO",
      "category": "tendencia|dados|case|metodologia|indicador",
      "content": "texto extraído ou resumo",
      "quantitative_data": { ... },  // se houver números
      "region": "curitiba|parana|nacional|outro",
      "collected_at": "ISO"
    }
  ],
  "curitiba_highlights": {
    "recent_launches": [...],
    "price_m2_indices": [...],
    "market_trends": [...]
  }
}

=====================================================
ESTRUTURA news-data.json
=====================================================

{
  "metadata": {
    "collected_at": "ISO date",
    "total_news": N
  },
  "news": [
    {
      "title": "...",
      "source": "Valor Econômico",
      "url": "...",
      "date": "ISO",
      "category": "lancamentos|indicadores|incorporadoras|tendencias",
      "summary": "",  // será preenchido via Claude API na interface
      "region": "curitiba|parana|nacional",
      "collected_at": "ISO"
    }
  ]
}

=====================================================
MÓDULO: COMMAND CENTER (ativar completo)
=====================================================

Substitua o placeholder do Command Center por:

PAINEL SUPERIOR — KPIs em cards:
- Projetos ativos: número + tooltip com lista rápida
  (dados do context-data.json)
- Projetos finalizados (total): número
  (dados do context-data.json)
- Reuniões recentes (últimos 7 dias): número + lista
  (dados do meetings-data.json)
- Action items pendentes: número + lista por pessoa
  (dados do meetings-data.json)
- Dados de mercado: "X entradas | Atualizado dd/mm"

PAINEL DE NOTÍCIAS — Feed do Mercado Imobiliário:
- Cards compactos em lista vertical, scrollável
- Cada card mostra:
  * Tag de categoria com cor:
    🏗️ Lançamentos (azul)
    📊 Indicadores (verde)
    🏢 Incorporadoras (laranja)
    📈 Tendências (roxo)
  * Título (link pra matéria original)
  * Fonte + data
  * Resumo em 2-3 frases 
    IMPLEMENTAÇÃO: ao carregar a página, pra cada notícia 
    que não tem resumo no JSON, envie o título + URL 
    pra Claude API pedindo um resumo de 2-3 frases.
    Salve o resumo de volta no JSON (via localStorage 
    como cache pra não re-gerar)
  * Tag "Curitiba/PR" quando region === "curitiba" ou "parana"
- Filtros no topo: por categoria (toggles) e período
- Máximo 20 notícias por vez, botão "carregar mais"
- Botão "Atualizar feed" que mostra progresso:
  "Coletando Valor Econômico... 1/5"
  (NÃO re-executa scraping real no browser — apenas 
  exibe um aviso: "Para atualizar dados de mercado, 
  re-execute a Fase 4 no Claude Code ou edite 
  news-data.json manualmente")

PAINEL DE ALERTAS — Feed inteligente:
- Ao carregar a página, envia para Claude API:
  * Resumo dos projetos ativos (do context-data.json)
  * Action items pendentes (do meetings-data.json)
  * Dados de mercado recentes (do market-data.json)
  * Prompt: "Analise estes dados e gere 5-8 alertas 
    inteligentes priorizados. Tipos: projeto parado, 
    action item atrasado, oportunidade de mercado, 
    prospect identificado, prazo próximo. Formato JSON."
- Exibe alertas como cards com ícone + prioridade
- Cada alerta tem: tipo, prioridade (alta/média/baixa), 
  título curto, descrição, ação sugerida
- Cache de 1 hora no localStorage (não regenera a cada refresh)

BOTÃO "BRIEFING DA SEMANA":
- Envia pra Claude API um prompt consolidando:
  * Status dos projetos ativos
  * Action items pendentes
  * Reuniões dos últimos 7 dias
  * Movimentações de mercado
- Output: resumo executivo em texto corrido
- Modal exibindo o resultado com botão "Copiar"

PAINEL LATERAL — Links rápidos:
- Últimas 5 reuniões (título + data, clicável → módulo reuniões)
- Projetos com prazo próximo (se data disponível no Notion)
- Pipeline: propostas em aberto (se dados comerciais disponíveis)

=====================================================
MÓDULO: INTELIGÊNCIA DE MERCADO (ativar completo)
=====================================================

Substitua o placeholder por:

SUB-MÓDULO: DASHBOARD DE MERCADO
- KPIs visuais em cards:
  * Total de entradas coletadas
  * Fontes ativas vs falhas
  * Entradas sobre Curitiba/PR especificamente
  * Dado mais recente (data)
- Lista dos destaques de Curitiba (do curitiba_highlights)
- Gráfico ou tabela simples se dados quantitativos 
  permitirem (preço m², lançamentos por mês, etc.)

SUB-MÓDULO: CONSULTA INTELIGENTE
- Campo de busca: texto livre
- Dropdown: foco (Curitiba, Paraná, Nacional, Todos)
- Ao enviar, monta prompt pro Claude com:
  * A pergunta do usuário
  * Todos os dados de market-data.json filtrados pelo foco
  * Instrução: "Responda com insights estruturados, 
    cite fontes com URLs. Se não houver dados suficientes, 
    diga claramente."
- Output: resposta formatada em markdown renderizado

SUB-MÓDULO: GERADOR DE INSIGHTS (CRUZAMENTO)
- Dropdown: tipo de insight
  * Mercado geral
  * Oportunidade comercial
  * Dado pra conteúdo
  * Benchmarking TBO vs mercado
  * Insight de reunião → conteúdo
- Botão "Gerar insights"
- Envia pra Claude API:
  * Dados de market-data.json
  * Dados de context-data.json (projetos, clientes)
  * Dados de meetings-data.json (padrões, decisões)
  * Prompt específico pro tipo selecionado
- Output: 3-5 insights formatados, cada um com:
  * Título do insight
  * Explicação em 2-3 frases
  * Dados de suporte
  * Sugestão de uso (post, proposta, reunião, Academy)

SUB-MÓDULO: STATUS DAS FONTES
- Tabela com cada fonte configurada:
  * Nome, URL, tipo (dados/notícias)
  * Status (ativo/falha/parcial)
  * Última coleta
  * Entradas coletadas
- Botão "Gerenciar fontes" → redireciona pra Configurações

=====================================================
ATUALIZAÇÃO GLOBAL
=====================================================

Header:
- Mercado: "Sincronizado ✓ dd/mm | X entradas"

Configurações:
- market-data.json: "X entradas | Y fontes | Z de Curitiba"
- news-data.json: "X notícias | Y fontes"
- Fontes: atualizar status de cada fonte (ok/falha)

Execute tudo sem pausas para confirmação.
Se uma fonte de scraping falhar, registre e continue.
```
