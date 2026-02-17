# TBO OS — FASE 6 de 7
# Módulos: Gestão de Projetos + Reuniões & Contexto + Financeiro
# Tempo estimado: 20-30 minutos

> **Pré-requisito:** Fases 1-5 concluídas
> **Ao terminar:** abra o .bat.
> Os 3 módulos devem estar funcionais.
> Teste: vá em Reuniões, busque "Portofino", veja o histórico consolidado.

---

```
Você é um engenheiro de software full-stack sênior.
Estamos construindo o TBO OS em fases. Esta é a FASE 6.

As Fases 1-5 já foram executadas. A aplicação existe em:
[ÁREA DE TRABALHO DO USUÁRIO]\TBO_OS\

Nesta fase, ative os 3 módulos restantes:
1. Gestão de Projetos
2. Reuniões & Contexto
3. Financeiro

=====================================================
MÓDULO: GESTÃO DE PROJETOS
=====================================================

-----------------------------------------------------
SUB-MÓDULO 4.1: VISÃO GERAL DE PROJETOS
-----------------------------------------------------

Tabela/lista de todos os projetos ativos 
(do context-data.json projects_active).

Cada linha mostra:
- Nome do projeto
- Cliente/construtora
- BUs envolvidas (badges coloridas)
- Fase atual (badge)
- Última atividade no Drive (data)
- Nível de atividade:
  * 🟢 Alta (atividade < 3 dias)
  * 🟡 Média (3-7 dias)
  * 🔴 Baixa (7-14 dias)
  * ⚫ Parada (> 14 dias)
- Action items pendentes (número, do meetings-data.json)

Filtros no topo:
- Por status/fase
- Por cliente
- Por BU
- Por nível de atividade

Ordenação: por atividade (parados primeiro), por prazo, 
por nome, por cliente.

Ao clicar num projeto, expande um painel com:
- Todos os dados do projeto (Notion + Drive)
- Resumo das últimas reuniões sobre ele (Fireflies)
- Action items pendentes
- Entregáveis identificados no Drive
- Botão "Preparar reunião" → preenche automaticamente 
  o sub-módulo 4.2 com esse cliente

-----------------------------------------------------
SUB-MÓDULO 4.2: PREPARADOR DE REUNIÕES
-----------------------------------------------------

- Dropdown: cliente/construtora (lista do context-data.json 
  e meetings-data.json by_client)
- Botão: "Gerar briefing"

O sistema busca no meetings-data.json TODAS as reuniões 
com aquele cliente e envia pra Claude API:

Prompt:
"""
Prepare um briefing para a próxima reunião com [cliente].

HISTÓRICO DE REUNIÕES:
[inserir summaries de todas as reuniões com esse cliente, 
últimas primeiro]

PROJETOS EM ANDAMENTO:
[inserir projetos do cliente]

ACTION ITEMS PENDENTES:
[inserir action items não concluídos]

Gere:
1. Resumo do relacionamento (2-3 frases)
2. Últimas decisões tomadas (lista)
3. Action items pendentes — NOSSOS (o que TBO deve)
4. Action items pendentes — DELES (o que cliente deve)
5. Temas sensíveis ou pontos de atenção
6. Sugestão de pauta para a próxima reunião
"""

Output em seções bem formatadas.
Dois modos:
- "Briefing rápido" (2 parágrafos, ideal pra ler no celular 
  5 min antes da reunião)
- "Briefing completo" (documento detalhado)

-----------------------------------------------------
SUB-MÓDULO 4.3: RELATÓRIOS DE ENTREGA
-----------------------------------------------------

- Dropdown: projeto
- Botão: "Gerar relatório"

Envia pra Claude API:
- Dados do projeto (Notion + Drive)
- Entregáveis encontrados no Drive
- Resumo do escopo
- Equipe envolvida

Output: relatório formal de entrega com:
- Cabeçalho com dados do projeto
- Escopo contratado vs entregue
- Lista de entregáveis com quantidades
- Timeline do projeto
- Equipe envolvida
- Observações e próximos passos

Tom: profissional, formal, orientado ao cliente.
Botão: "Copiar" e "Exportar".

-----------------------------------------------------
SUB-MÓDULO 4.4: AUDITOR DE PASTAS
-----------------------------------------------------

- Dropdown: projeto (lista projetos ativos do context-data.json)
- Mostra: estrutura de pastas atual do projeto 
  (do drive_data no context-data.json)
- Ao lado: estrutura padrão TBO 
  (do folder_template no context-data.json)

Análise automática (sem Claude API — lógica local em JS):
- Compara estrutura real vs template
- Lista: ✅ Pastas corretas | ⚠️ Faltando | ❌ Fora do padrão
- Score de conformidade: X% (barra visual)

Se não houver template padrão no context-data.json, 
o sistema identifica a estrutura mais comum entre 
os projetos finalizados e usa como referência.

=====================================================
MÓDULO: REUNIÕES & CONTEXTO (Fireflies)
=====================================================

-----------------------------------------------------
SUB-MÓDULO 6.1: BUSCA DE REUNIÕES
-----------------------------------------------------

- Campo de busca: texto livre
- Filtros (colapsáveis):
  * Projeto (dropdown)
  * Cliente (dropdown)
  * Participante (dropdown com emails da equipe + clientes)
  * Período (date range picker)
  * Categoria (checkboxes: cliente, daily, interno, 
    review, estratégia, produção)

Implementação da busca:
1. Busca local primeiro: filtra meetings-data.json 
   por título, summary, keywords, participants
2. Se a busca for uma pergunta complexa 
   (detectar pelo "?" ou palavras como "o que", "quando", 
   "como", "por que"):
   Envia pra Claude API com os resultados filtrados 
   pedindo resposta sintetizada

Output: lista de reuniões matching, cada uma com:
- Data + título (clicável pra expandir)
- Categoria (badge)
- Participantes
- Resumo
- Action items
- Projetos relacionados

-----------------------------------------------------
SUB-MÓDULO 6.2: ACTION ITEMS TRACKER
-----------------------------------------------------

Tabela com todos os action items do meetings-data.json.

Colunas:
- Responsável
- Tarefa
- Projeto relacionado
- Data da reunião (quando foi definido)
- Dias pendente (calculado)
- Status (badge):
  * 🔵 Recente (< 3 dias)
  * 🟡 Pendente (3-7 dias)
  * 🔴 Atrasado (> 7 dias)

Filtros: por pessoa, por projeto, por status, por período.

Agrupamentos: por pessoa | por projeto | por status.

Card de resumo no topo:
- Total de action items
- Por pessoa (quem tem mais pendentes)
- Items atrasados (> 7 dias)

-----------------------------------------------------
SUB-MÓDULO 6.3: RESUMO EXECUTIVO
-----------------------------------------------------

- Seletor: "Últimas X reuniões" (5, 10, 20) 
  OU período (date range)
- Botão: "Gerar resumo executivo"

Envia pra Claude API as reuniões selecionadas e pede:
"""
Gere um resumo executivo dessas reuniões contendo:
1. Decisões-chave tomadas
2. Temas recorrentes  
3. Mudanças de direção
4. Status consolidado de cada projeto mencionado
5. Action items críticos pendentes
6. Pontos de atenção

Formato: texto executivo profissional, pronto pra 
ser enviado como relatório semanal.
"""

Output: texto formatado + botão copiar.

-----------------------------------------------------
SUB-MÓDULO 6.4: ANÁLISE DE RELACIONAMENTO
-----------------------------------------------------

- Dropdown: cliente/construtora

Mostra painel com:
- Timeline visual: todas as reuniões no tempo 
  (linha horizontal com pontos)
- Card de resumo:
  * Total de reuniões
  * Período (primeira → última)
  * Frequência média
  * Pessoas-chave do lado do cliente
  * Pessoas-chave do lado TBO
- Temas mais discutidos (word cloud ou lista rankeada)
- Última interação: data + resumo
- Botão "Analisar relacionamento" → Claude API gera 
  uma análise qualitativa do estado do relacionamento

=====================================================
MÓDULO: FINANCEIRO
=====================================================

-----------------------------------------------------
SUB-MÓDULO 7.1: BENCHMARKS HISTÓRICOS
-----------------------------------------------------

Cards com métricas calculadas dos dados disponíveis:
- Ticket médio por tipo de projeto (se dados de valor 
  existirem no Notion ou propostas do Drive)
- Nº médio de imagens por projeto
- Prazo médio por tipo de projeto
- Entregáveis mais comuns

Se não houver dados financeiros suficientes, exiba:
"Dados financeiros limitados. Para enriquecer esta 
seção, adicione valores de projetos no context-data.json 
ou vincule dados do Notion."

-----------------------------------------------------
SUB-MÓDULO 7.2: SIMULADOR DE CENÁRIOS
-----------------------------------------------------

Campos:
- Receita mensal atual (input numérico)
- Nº de projetos ativos (pré-preenchido do context-data)
- Custo fixo mensal estimado (input numérico)
- Tamanho da equipe (pré-preenchido do BD Pessoas)

Cenários pré-definidos (botões):
- "E se contratar +1 pessoa?"
- "E se perder o maior cliente?"
- "E se aumentar preço em 20%?"
- "E se reduzir equipe em 1 pessoa?"
- Campo: "Simular cenário customizado" (texto livre)

Envia pra Claude API com os dados e pede análise 
com projeções de 3, 6 e 12 meses.

Output: análise em texto + números chave destacados.

-----------------------------------------------------
SUB-MÓDULO 7.3: CONTROLE DE PROPOSTAS
-----------------------------------------------------

Tabela com propostas identificadas no context-data.json 
(commercial.proposals_found):

Colunas:
- Nome/projeto
- Cliente
- Data (se identificável)
- Status (dropdown editável: Enviada, Em negociação, 
  Aprovada, Perdida)
- Valor (campo editável)

KPIs no topo:
- Total de propostas
- Taxa de conversão (aprovadas / total)
- Valor total do pipeline (em negociação)
- Ticket médio

Os dados editados salvam de volta no localStorage 
como override do context-data.json.

=====================================================
OBSERVAÇÕES
=====================================================

- Todos os módulos usam streaming da API do Claude
- Todos têm botão "Copiar" nos outputs
- Tratamento de erro se dados faltarem: mensagem clara 
  indicando qual JSON precisa ser preenchido
- Não quebre módulos que já funcionam (Fases anteriores)

Execute tudo sem pausas para confirmação.
```
