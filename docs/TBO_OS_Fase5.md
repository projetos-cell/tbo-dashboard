# TBO OS — FASE 5 de 7
# Módulos: Conteúdo & Redação + Comercial & Propostas
# Tempo estimado: 20-30 minutos

> **Pré-requisito:** Fases 1-4 concluídas
> **Ao terminar:** abra o .bat.
> Os módulos Conteúdo e Comercial devem estar funcionais.
> Teste: vá em LinkedIn, selecione um projeto, gere um post.

---

```
Você é um engenheiro de software full-stack sênior.
Estamos construindo o TBO OS em fases. Esta é a FASE 5.

As Fases 1-4 já foram executadas. A aplicação existe em:
[ÁREA DE TRABALHO DO USUÁRIO]\TBO_OS\

Todos os JSONs de dados estão preenchidos.
O Command Center e Inteligência de Mercado já funcionam.

Nesta fase, ative dois módulos:
1. Conteúdo & Redação (5 sub-módulos)
2. Comercial & Propostas (4 sub-módulos)

=====================================================
MÓDULO: CONTEÚDO & REDAÇÃO
=====================================================

Layout: tabs horizontais pra cada sub-módulo.
Todos os sub-módulos compartilham:
- Botão "Gerar" que envia pra Claude API
- Output com renderização markdown
- Botão "Copiar" em cada output
- Botão "Refinar" que abre campo de feedback 
  e re-envia mantendo contexto (mensagem anterior 
  + feedback como nova mensagem)
- Histórico de gerações (localStorage, acessível 
  via ícone de relógio)

-----------------------------------------------------
SUB-MÓDULO 2.1: LINKEDIN (Marco pessoal)
-----------------------------------------------------

Interface:
- Dropdown "Tipo de post":
  * Case de projeto
  * Insight estratégico
  * Bastidores do processo
  * Provocação / opinião
  * Carrossel (gera slides em texto)
  * Tendência de mercado
  * Metodologia TBO
  * Análise de mercado
- Dropdown "Projeto relacionado":
  * Opção "Nenhum (tema livre)"
  * Lista de todos os projetos (ativos + finalizados) 
    do context-data.json
- Campo de texto: "Sobre o que quer falar?" (textarea)
- Toggle: Tom
  * Reflexivo (default)
  * Provocativo
  * Técnico
- Toggle: "Incluir dados de mercado" (sim/não)
- Botão: "Gerar 3 variações"

System prompt específico do LinkedIn:
"""
Você é o Marco Andolfato escrevendo no LinkedIn.
Marco é Diretor Criativo e de Estratégia da TBO.

TOM DE VOZ:
- Reflexivo e estratégico, nunca superficial
- Mistura bastidores do processo criativo com visão de negócio
- Defende a evolução do archviz de commodity pra estratégico
- Provocativo sem ser arrogante
- Usa experiências reais como base, nunca inventa
- Evita clichês: "nesse sentido", "é sobre", 
  "não é sobre X é sobre Y" (a menos que funcione)

[Inserir vocabulário do Marco do meetings-data.json patterns]

DADOS DO PROJETO (se selecionado):
[Inserir dados do projeto do context-data.json]
[Inserir resumo de reuniões sobre o projeto do meetings-data.json]

DADOS DE MERCADO (se toggle ativo):
[Inserir dados relevantes do market-data.json]

REGRAS:
- Gere 3 variações com abordagens diferentes
- Máximo 3000 caracteres por post (LinkedIn limit)
- Inclua contador de caracteres
- Nunca invente dados ou resultados
- Se mencionar um projeto, use dados reais
- Português brasileiro
"""

Output: 3 cards lado a lado (ou empilhados no mobile), 
cada um com:
- Label: "Variação 1: [abordagem]"
- Texto do post
- Contador: "1.847 / 3.000 caracteres"
- Botão "Copiar"
- Botão "Refinar esta"

-----------------------------------------------------
SUB-MÓDULO 2.2: INSTAGRAM / REDES TBO
-----------------------------------------------------

- Dropdown: formato (Feed, Stories, Reels Script, Carrossel)
- Dropdown: projeto
- Campo: briefing do post
- Botão: "Gerar"

System prompt inclui tom institucional da TBO.
Output: copy formatada pro formato + sugestão visual 
(descrição da imagem/vídeo ideal) + 15-20 hashtags 
relevantes organizadas por relevância.

-----------------------------------------------------
SUB-MÓDULO 2.3: EMAILS
-----------------------------------------------------

- Dropdown: situação
  * Apresentação de renders
  * Envio de revisão
  * Follow-up comercial
  * Formalização de entrega
  * Pós-projeto / relacionamento
  * Prospecção (novo cliente)
- Dropdown: projeto (ou "Novo/Geral")
- Campo: nome do destinatário
- Campo: contexto específico (textarea)
- Botão: "Gerar email"

IMPORTANTE: Quando um projeto é selecionado, o system 
prompt injeta automaticamente:
- Dados do projeto (context-data.json)
- Resumo das últimas reuniões com aquele cliente 
  (meetings-data.json → by_client)
- Action items pendentes relacionados
Isso permite emails extremamente personalizados.

Output: email completo com assunto + corpo.
Botão "Copiar" e "Copiar só o corpo".

-----------------------------------------------------
SUB-MÓDULO 2.4: CONTEÚDO INSTITUCIONAL
-----------------------------------------------------

- Dropdown: tipo
  * Texto para site
  * Descrição de portfólio
  * Press release
  * Apresentação institucional
  * Bio (Marco ou Ruy)
- Campo: briefing
- Botão: "Gerar"

System prompt usa tom institucional extraído dos 
materiais do Drive (03.AGÊNCIA_TBO).

-----------------------------------------------------
SUB-MÓDULO 2.5: TBO ACADEMY
-----------------------------------------------------

- Dropdown: tipo
  * Artigo / blog post
  * Roteiro de aula (vídeo)
  * Email de nutrição
  * Checklist / template
  * Post de divulgação
  * Diagnóstico / assessment
- Campo: tema ou anotações brutas (textarea grande)
- Botão: "Gerar"

System prompt inclui metodologias completas 
(Branding, Marketing, Lançamentos, Sexy Canvas, 
Gamificação) + dados de mercado como exemplo.

Os 3 sócios da Academy: Marco, Ruy e Rafaela.

=====================================================
MÓDULO: COMERCIAL & PROPOSTAS
=====================================================

Layout: tabs horizontais.

-----------------------------------------------------
SUB-MÓDULO 3.1: GERADOR DE PROPOSTAS
-----------------------------------------------------

Campos do formulário:
- Empreendimento (nome)
- Construtora / incorporadora
- Localização (bairro + cidade)
- Padrão: radio buttons (Standard | Médio | Alto | Luxo)
- Escopo estimado: checkboxes
  * Imagens estáticas
  * Tour virtual
  * Animação / filme
  * Branding
  * Marketing digital
  * Interiores
- Campo: diferenciais do projeto (textarea)
- Campo: observações adicionais (textarea)
- Botão: "Gerar proposta"

System prompt inclui:
- Sexy Canvas completo (como abordar o prospect)
- Metodologias TBO relevantes pro escopo
- Cases similares (projetos do mesmo padrão/região)
- Dados de mercado da região do empreendimento
- SE a construtora já é cliente: histórico completo 
  de reuniões do Fireflies + projetos anteriores
- SE é prospect novo: dados públicos + lançamentos 
  recentes da construtora (se encontrados no market-data)

Seções da proposta gerada:
1. Contexto de Mercado (dados atuais da região)
2. Entendimento do Projeto
3. Solução Proposta (escopo detalhado)
4. Metodologia TBO aplicada
5. Cases Relevantes (projetos similares com resultados)
6. Investimento (faixa — baseado no pricing histórico)
7. Cronograma estimado
8. Próximos passos

Output: proposta formatada em markdown.
Botão "Copiar" e "Exportar como texto".

-----------------------------------------------------
SUB-MÓDULO 3.2: GERADOR DE CASES
-----------------------------------------------------

- Dropdown: projeto finalizado (do context-data.json)
- Dropdown: formato
  * Texto longo (blog / site)
  * Resumo (LinkedIn)
  * One-pager (apresentação)
- Botão: "Gerar case"

O sistema puxa: dados do Notion, contagem de imagens 
do Drive, resultados mencionados em reuniões, 
feedback do cliente (do Fireflies).

Output: case study formatado.

-----------------------------------------------------
SUB-MÓDULO 3.3: CALCULADORA DE PRICING
-----------------------------------------------------

Campos:
- Tipo de projeto: dropdown
  * Imagens estáticas (residencial)
  * Imagens estáticas (comercial)
  * Animação / filme
  * Branding completo
  * Campanha de marketing
  * Pacote completo (3D + branding + marketing)
- Nº de imagens (se aplicável): input numérico
- Nível de complexidade: slider (1-5)
- Prazo: dropdown (Urgente <15d | Normal 15-30d | 
  Confortável 30-60d | Flexível 60d+)
- BUs envolvidas: checkboxes

Ao preencher, o sistema:
1. Busca projetos similares no context-data.json
2. Busca dados de propostas no commercial.proposals_found
3. Calcula faixas baseadas nos históricos

Output em 3 cards:
- 💚 Mínimo: R$ X.XXX (justificativa)
- 💛 Ideal: R$ X.XXX (justificativa)
- 🔴 Premium: R$ X.XXX (justificativa)

+ Benchmarks: preço/imagem médio, preço/dia médio,
  comparativo com projetos similares listados.

Se não houver dados históricos suficientes, exiba:
"Dados insuficientes para cálculo automático. 
Adicione mais propostas ao context-data.json."

-----------------------------------------------------
SUB-MÓDULO 3.4: PIPELINE & PROSPECÇÃO
-----------------------------------------------------

Interface em duas colunas:

COLUNA 1: Oportunidades identificadas
- Lista incorporadoras/construtoras que aparecem nos 
  dados de mercado (lançamentos recentes) mas NÃO 
  estão no context-data.json como clientes
- Cada card mostra: nome, lançamento identificado, 
  fonte, link

COLUNA 2: Sugestão de abordagem
- Ao clicar num prospect, envia pra Claude API:
  * Dados do lançamento encontrado
  * Sexy Canvas da TBO
  * Cases relevantes
  * Prompt: "Sugira uma abordagem de primeiro contato 
    para este prospect"
- Output: texto da abordagem sugerida

Topo da página: campo "Já falamos com eles?"
- Busca no meetings-data.json por menções ao nome 
  da construtora
- Se encontrar: "Sim — última menção em dd/mm na 
  reunião [título]"

=====================================================
OBSERVAÇÕES TÉCNICAS
=====================================================

Context windowing por módulo:
- Conteúdo LinkedIn: system base + projeto selecionado 
  + reuniões do projeto + vocabulário do Marco + 
  mercado (se toggle ativo)
- Proposta: system base + Sexy Canvas + metodologias 
  + cases similares + histórico do cliente + mercado
- Emails: system base + projeto + reuniões com cliente
- Academy: system base + metodologias completas + mercado

Streaming:
- Todas as gerações devem usar streaming da API 
  (mostrar texto aparecendo progressivamente)

Histórico:
- Cada geração salva no localStorage:
  { module, submodule, input, output, timestamp }
- Acessível via ícone de relógio em cada sub-módulo
- Máximo 100 entradas (FIFO)

Execute tudo sem pausas para confirmação.
```
