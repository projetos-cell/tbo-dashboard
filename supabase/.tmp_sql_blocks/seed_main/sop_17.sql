DO $$
DECLARE
  v_tenant_id UUID;
  v_sop_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'No tenant found.';
    RETURN;
  END IF;
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Storytelling de Empreendimento',
    'tbo-brd-003-storytelling-de-empreendimento',
    'branding',
    'checklist',
    'Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.',
    'Standard Operating Procedure

Storytelling de Empreendimento

Código

TBO-BRD-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Branding

Responsável

Nelson (PO Branding)

Aprovador

Marco Andolfato



  1. Objetivo

Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.

  2. Escopo

2.1 O que está coberto

Definição do conceito narrativo, desenvolvimento do texto de posicionamento, manifesto de marca, argumento de venda central (elevator pitch), diretrizes de tom de voz e vocabulário.

2.2 Exclusões

Roteiros de vídeo (produção audiovisual), textos de mídia paga (tráfego), copy de anúncios, conteúdo de redes sociais.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Conteúdo

Criação do storytelling e entrega de textos

Responsável



Nelson (PO Branding)

Alinhamento com identidade visual e conceito

Aprovador



Marco Andolfato

Aprovação estratégica final

Aprovador



Cliente/Incorporadora

Validação de dados técnicos e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Naming aprovado (BRD-01), identidade visual em andamento ou aprovada (BRD-02), briefing com dados do empreendimento (localização, metragem, diferenciais, público-alvo, VGV, prazo de entrega), pesquisa de buyer persona.

4.2 Ferramentas e Acessos

Notion (documentação), Google Docs (redação colaborativa), ChatGPT/Claude (apoio à ideação — nunca entrega final sem revisão humana).



  5. Procedimento Passo a Passo

5.1. Análise do empreendimento e do público

Ação: Revisar briefing, dados técnicos do empreendimento e perfil do público-alvo. Identificar os 3 principais diferenciais competitivos (localização, projeto arquitetônico, estilo de vida, infraestrutura). Mapear as dores e aspirações do comprador-alvo.

Responsável: Redator/Estrategista

Output: Mapa de diferenciais e insights do público (1 página)

Prazo referência: 1 dia útil

5.2. Definição do conceito narrativo central

Ação: Criar o conceito que ancora toda a comunicação — uma ideia-força que vai além das características físicas do imóvel (ex: ''Viver com intenção'', ''O endereço que transforma rotina em estilo''). O conceito deve ter: nome ou expressão, descrição em 3 linhas, e 3 pilares de comunicação.

Responsável: Redator + Nelson

Output: Conceito narrativo documentado com nome, descrição e pilares

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson valida conceito internamente antes de desenvolver textos

5.3. Manifesto de marca

Ação: Redigir o manifesto do empreendimento — texto de 150 a 250 palavras que traduz o conceito em emoção e aspiração. Deve ser escrito para o comprador, não para o incorporador. Tom: empático, inspirador, verdadeiro. Evitar clichês do setor (''sofisticado'', ''exclusivo'', ''conforto e lazer'').

Responsável: Redator/Estrategista

Output: Manifesto revisado e formatado

Prazo referência: 1 dia útil

5.4. Textos de posicionamento e elevator pitch

Ação: Criar: (a) Tagline do empreendimento (até 7 palavras); (b) Elevator pitch de 30 segundos para corretores; (c) Descrição curta (50 palavras) para material digital; (d) Descrição longa (150 palavras) para book e folder.

Responsável: Redator/Estrategista

Output: Documento com os 4 formatos de texto aprovados

Prazo referência: 2 dias úteis

5.5. Tom de voz e guia de vocabulário

Ação: Definir o tom de voz da marca do empreendimento em 4 atributos (ex: ''sofisticado mas acessível, preciso mas caloroso''). Criar lista de palavras a usar e palavras a evitar. Incluir exemplos de como escrever sobre o empreendimento em diferentes contextos (anúncio, e-mail, legenda).

Responsável: Redator/Estrategista + Nelson

Output: Guia de tom de voz (2–3 páginas) integrado ao manual de marca

Prazo referência: 1 dia útil

5.6. Aprovação final e integração ao manual

Ação: Marco Andolfato revisa todo o storytelling. Cliente valida dados técnicos e aprova. Integrar os textos ao manual de identidade visual (SOP BRD-02) como seção de voz e narrativa.

Responsável: Marco Andolfato / Nelson

Output: Storytelling aprovado, integrado ao manual, arquivado no Notion do projeto

Prazo referência: 1 dia útil após aprovação do cliente

[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Conceito diferente de todos os concorrentes diretos na praça; manifesto sem clichês do setor imobiliário; tagline testada com ao menos 3 pessoas do público-alvo; tom de voz coerente com identidade visual; textos aprovados pelo cliente por escrito; integrado ao manual.

6.2 Erros Comuns a Evitar

Manifesto escrito da perspectiva do incorporador (não do comprador); tagline genérica (''qualidade de vida'', ''bem-estar''); elevator pitch muito longo (mais de 45 segundos); tom de voz não documentado (cada material soa diferente); textos com dados técnicos não verificados pelo cliente.

  7. Ferramentas e Templates

Google Docs, Notion, Hemingway App (clareza textual), IA como apoio à ideação (Claude/ChatGPT — sempre revisão humana obrigatória).

  8. SLAs e Prazos

Análise e conceito: 3 dias úteis. Manifesto + textos: 3 dias úteis. Tom de voz: 1 dia útil. Aprovação: máx. 2 rodadas em 5 dias úteis. Total: 10–15 dias úteis.

  9. Fluxograma

Início → Briefing + naming + IV em andamento → Análise do empreendimento → Definir conceito narrativo → [NELSON VALIDA CONCEITO?] → Não: revisar → Sim: Desenvolver manifesto → Criar textos de posicionamento → Definir tom de voz → [MARCO APROVA?] → Não: revisar → Sim: Apresentar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Integrar ao manual → Arquivar no Notion → Fim

  10. Glossário

Conceito narrativo: ideia-força que ancora toda a comunicação de um empreendimento. Manifesto: texto emocional que expressa o propósito e o espírito da marca. Tagline: frase curta e memorável que sintetiza o posicionamento. Elevator pitch: argumentação de venda em até 30 segundos. Tom de voz: conjunto de atributos que definem como a marca fala.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Storytelling de Empreendimento</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Definição do conceito narrativo, desenvolvimento do texto de posicionamento, manifesto de marca, argumento de venda central (elevator pitch), diretrizes de tom de voz e vocabulário.</p><p><strong>2.2 Exclusões</strong></p><p>Roteiros de vídeo (produção audiovisual), textos de mídia paga (tráfego), copy de anúncios, conteúdo de redes sociais.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator/Estrategista de Conteúdo</p></td><td><p>Criação do storytelling e entrega de textos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Alinhamento com identidade visual e conceito</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Validação de dados técnicos e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Naming aprovado (BRD-01), identidade visual em andamento ou aprovada (BRD-02), briefing com dados do empreendimento (localização, metragem, diferenciais, público-alvo, VGV, prazo de entrega), pesquisa de buyer persona.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Notion (documentação), Google Docs (redação colaborativa), ChatGPT/Claude (apoio à ideação — nunca entrega final sem revisão humana).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Análise do empreendimento e do público</strong></p><p>Ação: Revisar briefing, dados técnicos do empreendimento e perfil do público-alvo. Identificar os 3 principais diferenciais competitivos (localização, projeto arquitetônico, estilo de vida, infraestrutura). Mapear as dores e aspirações do comprador-alvo.</p><p>Responsável: Redator/Estrategista</p><p>Output: Mapa de diferenciais e insights do público (1 página)</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Definição do conceito narrativo central</strong></p><p>Ação: Criar o conceito que ancora toda a comunicação — uma ideia-força que vai além das características físicas do imóvel (ex: ''Viver com intenção'', ''O endereço que transforma rotina em estilo''). O conceito deve ter: nome ou expressão, descrição em 3 linhas, e 3 pilares de comunicação.</p><p>Responsável: Redator + Nelson</p><p>Output: Conceito narrativo documentado com nome, descrição e pilares</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson valida conceito internamente antes de desenvolver textos</strong></p><p><strong>5.3. Manifesto de marca</strong></p><p>Ação: Redigir o manifesto do empreendimento — texto de 150 a 250 palavras que traduz o conceito em emoção e aspiração. Deve ser escrito para o comprador, não para o incorporador. Tom: empático, inspirador, verdadeiro. Evitar clichês do setor (''sofisticado'', ''exclusivo'', ''conforto e lazer'').</p><p>Responsável: Redator/Estrategista</p><p>Output: Manifesto revisado e formatado</p><p>Prazo referência: 1 dia útil</p><p><strong>5.4. Textos de posicionamento e elevator pitch</strong></p><p>Ação: Criar: (a) Tagline do empreendimento (até 7 palavras); (b) Elevator pitch de 30 segundos para corretores; (c) Descrição curta (50 palavras) para material digital; (d) Descrição longa (150 palavras) para book e folder.</p><p>Responsável: Redator/Estrategista</p><p>Output: Documento com os 4 formatos de texto aprovados</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.5. Tom de voz e guia de vocabulário</strong></p><p>Ação: Definir o tom de voz da marca do empreendimento em 4 atributos (ex: ''sofisticado mas acessível, preciso mas caloroso''). Criar lista de palavras a usar e palavras a evitar. Incluir exemplos de como escrever sobre o empreendimento em diferentes contextos (anúncio, e-mail, legenda).</p><p>Responsável: Redator/Estrategista + Nelson</p><p>Output: Guia de tom de voz (2–3 páginas) integrado ao manual de marca</p><p>Prazo referência: 1 dia útil</p><p><strong>5.6. Aprovação final e integração ao manual</strong></p><p>Ação: Marco Andolfato revisa todo o storytelling. Cliente valida dados técnicos e aprova. Integrar os textos ao manual de identidade visual (SOP BRD-02) como seção de voz e narrativa.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Storytelling aprovado, integrado ao manual, arquivado no Notion do projeto</p><p>Prazo referência: 1 dia útil após aprovação do cliente</p><p><strong>[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Conceito diferente de todos os concorrentes diretos na praça; manifesto sem clichês do setor imobiliário; tagline testada com ao menos 3 pessoas do público-alvo; tom de voz coerente com identidade visual; textos aprovados pelo cliente por escrito; integrado ao manual.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Manifesto escrito da perspectiva do incorporador (não do comprador); tagline genérica (''qualidade de vida'', ''bem-estar''); elevator pitch muito longo (mais de 45 segundos); tom de voz não documentado (cada material soa diferente); textos com dados técnicos não verificados pelo cliente.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Docs, Notion, Hemingway App (clareza textual), IA como apoio à ideação (Claude/ChatGPT — sempre revisão humana obrigatória).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Análise e conceito: 3 dias úteis. Manifesto + textos: 3 dias úteis. Tom de voz: 1 dia útil. Aprovação: máx. 2 rodadas em 5 dias úteis. Total: 10–15 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing + naming + IV em andamento → Análise do empreendimento → Definir conceito narrativo → [NELSON VALIDA CONCEITO?] → Não: revisar → Sim: Desenvolver manifesto → Criar textos de posicionamento → Definir tom de voz → [MARCO APROVA?] → Não: revisar → Sim: Apresentar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Integrar ao manual → Arquivar no Notion → Fim</p><p><strong>  10. Glossário</strong></p><p>Conceito narrativo: ideia-força que ancora toda a comunicação de um empreendimento. Manifesto: texto emocional que expressa o propósito e o espírito da marca. Tagline: frase curta e memorável que sintetiza o posicionamento. Elevator pitch: argumentação de venda em até 30 segundos. Tom de voz: conjunto de atributos que definem como a marca fala.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    2,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.', '<p>Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Definição do conceito narrativo, desenvolvimento do texto de posicionamento, manifesto de marca, argumento de venda central (elevator pitch), diretrizes de tom de voz e vocabulário.', '<p>Definição do conceito narrativo, desenvolvimento do texto de posicionamento, manifesto de marca, argumento de venda central (elevator pitch), diretrizes de tom de voz e vocabulário.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Roteiros de vídeo (produção audiovisual), textos de mídia paga (tráfego), copy de anúncios, conteúdo de redes sociais.', '<p>Roteiros de vídeo (produção audiovisual), textos de mídia paga (tráfego), copy de anúncios, conteúdo de redes sociais.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Conteúdo

Criação do storytelling e entrega de textos

Responsável

Nelson (PO Branding)

Alinhamento com identidade visual e conceito

Aprovador

Marco Andolfato

Aprovação estratégica final

Aprovador

Cliente/Incorporadora

Validação de dados técnicos e aprovação

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator/Estrategista de Conteúdo</p></td><td><p>Criação do storytelling e entrega de textos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Alinhamento com identidade visual e conceito</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Validação de dados técnicos e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Naming aprovado (BRD-01), identidade visual em andamento ou aprovada (BRD-02), briefing com dados do empreendimento (localização, metragem, diferenciais, público-alvo, VGV, prazo de entrega), pesquisa de buyer persona.', '<p>Naming aprovado (BRD-01), identidade visual em andamento ou aprovada (BRD-02), briefing com dados do empreendimento (localização, metragem, diferenciais, público-alvo, VGV, prazo de entrega), pesquisa de buyer persona.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion (documentação), Google Docs (redação colaborativa), ChatGPT/Claude (apoio à ideação — nunca entrega final sem revisão humana).', '<p>Notion (documentação), Google Docs (redação colaborativa), ChatGPT/Claude (apoio à ideação — nunca entrega final sem revisão humana).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Análise do empreendimento e do público', 'Ação: Revisar briefing, dados técnicos do empreendimento e perfil do público-alvo. Identificar os 3 principais diferenciais competitivos (localização, projeto arquitetônico, estilo de vida, infraestrutura). Mapear as dores e aspirações do comprador-alvo.

Responsável: Redator/Estrategista

Output: Mapa de diferenciais e insights do público (1 página)

Prazo referência: 1 dia útil', '<p>Ação: Revisar briefing, dados técnicos do empreendimento e perfil do público-alvo. Identificar os 3 principais diferenciais competitivos (localização, projeto arquitetônico, estilo de vida, infraestrutura). Mapear as dores e aspirações do comprador-alvo.</p><p>Responsável: Redator/Estrategista</p><p>Output: Mapa de diferenciais e insights do público (1 página)</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Definição do conceito narrativo central', 'Ação: Criar o conceito que ancora toda a comunicação — uma ideia-força que vai além das características físicas do imóvel (ex: ''Viver com intenção'', ''O endereço que transforma rotina em estilo''). O conceito deve ter: nome ou expressão, descrição em 3 linhas, e 3 pilares de comunicação.

Responsável: Redator + Nelson

Output: Conceito narrativo documentado com nome, descrição e pilares

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson valida conceito internamente antes de desenvolver textos', '<p>Ação: Criar o conceito que ancora toda a comunicação — uma ideia-força que vai além das características físicas do imóvel (ex: ''Viver com intenção'', ''O endereço que transforma rotina em estilo''). O conceito deve ter: nome ou expressão, descrição em 3 linhas, e 3 pilares de comunicação.</p><p>Responsável: Redator + Nelson</p><p>Output: Conceito narrativo documentado com nome, descrição e pilares</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson valida conceito internamente antes de desenvolver textos</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Manifesto de marca', 'Ação: Redigir o manifesto do empreendimento — texto de 150 a 250 palavras que traduz o conceito em emoção e aspiração. Deve ser escrito para o comprador, não para o incorporador. Tom: empático, inspirador, verdadeiro. Evitar clichês do setor (''sofisticado'', ''exclusivo'', ''conforto e lazer'').

Responsável: Redator/Estrategista

Output: Manifesto revisado e formatado

Prazo referência: 1 dia útil', '<p>Ação: Redigir o manifesto do empreendimento — texto de 150 a 250 palavras que traduz o conceito em emoção e aspiração. Deve ser escrito para o comprador, não para o incorporador. Tom: empático, inspirador, verdadeiro. Evitar clichês do setor (''sofisticado'', ''exclusivo'', ''conforto e lazer'').</p><p>Responsável: Redator/Estrategista</p><p>Output: Manifesto revisado e formatado</p><p>Prazo referência: 1 dia útil</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Textos de posicionamento e elevator pitch', 'Ação: Criar: (a) Tagline do empreendimento (até 7 palavras); (b) Elevator pitch de 30 segundos para corretores; (c) Descrição curta (50 palavras) para material digital; (d) Descrição longa (150 palavras) para book e folder.

Responsável: Redator/Estrategista

Output: Documento com os 4 formatos de texto aprovados

Prazo referência: 2 dias úteis', '<p>Ação: Criar: (a) Tagline do empreendimento (até 7 palavras); (b) Elevator pitch de 30 segundos para corretores; (c) Descrição curta (50 palavras) para material digital; (d) Descrição longa (150 palavras) para book e folder.</p><p>Responsável: Redator/Estrategista</p><p>Output: Documento com os 4 formatos de texto aprovados</p><p>Prazo referência: 2 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Tom de voz e guia de vocabulário', 'Ação: Definir o tom de voz da marca do empreendimento em 4 atributos (ex: ''sofisticado mas acessível, preciso mas caloroso''). Criar lista de palavras a usar e palavras a evitar. Incluir exemplos de como escrever sobre o empreendimento em diferentes contextos (anúncio, e-mail, legenda).

Responsável: Redator/Estrategista + Nelson

Output: Guia de tom de voz (2–3 páginas) integrado ao manual de marca

Prazo referência: 1 dia útil', '<p>Ação: Definir o tom de voz da marca do empreendimento em 4 atributos (ex: ''sofisticado mas acessível, preciso mas caloroso''). Criar lista de palavras a usar e palavras a evitar. Incluir exemplos de como escrever sobre o empreendimento em diferentes contextos (anúncio, e-mail, legenda).</p><p>Responsável: Redator/Estrategista + Nelson</p><p>Output: Guia de tom de voz (2–3 páginas) integrado ao manual de marca</p><p>Prazo referência: 1 dia útil</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Aprovação final e integração ao manual', 'Ação: Marco Andolfato revisa todo o storytelling. Cliente valida dados técnicos e aprova. Integrar os textos ao manual de identidade visual (SOP BRD-02) como seção de voz e narrativa.

Responsável: Marco Andolfato / Nelson

Output: Storytelling aprovado, integrado ao manual, arquivado no Notion do projeto

Prazo referência: 1 dia útil após aprovação do cliente

[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação', '<p>Ação: Marco Andolfato revisa todo o storytelling. Cliente valida dados técnicos e aprova. Integrar os textos ao manual de identidade visual (SOP BRD-02) como seção de voz e narrativa.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Storytelling aprovado, integrado ao manual, arquivado no Notion do projeto</p><p>Prazo referência: 1 dia útil após aprovação do cliente</p><p><strong>[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação</strong></p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Conceito diferente de todos os concorrentes diretos na praça; manifesto sem clichês do setor imobiliário; tagline testada com ao menos 3 pessoas do público-alvo; tom de voz coerente com identidade visual; textos aprovados pelo cliente por escrito; integrado ao manual.', '<p>Conceito diferente de todos os concorrentes diretos na praça; manifesto sem clichês do setor imobiliário; tagline testada com ao menos 3 pessoas do público-alvo; tom de voz coerente com identidade visual; textos aprovados pelo cliente por escrito; integrado ao manual.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Manifesto escrito da perspectiva do incorporador (não do comprador); tagline genérica (''qualidade de vida'', ''bem-estar''); elevator pitch muito longo (mais de 45 segundos); tom de voz não documentado (cada material soa diferente); textos com dados técnicos não verificados pelo cliente.', '<p>Manifesto escrito da perspectiva do incorporador (não do comprador); tagline genérica (''qualidade de vida'', ''bem-estar''); elevator pitch muito longo (mais de 45 segundos); tom de voz não documentado (cada material soa diferente); textos com dados técnicos não verificados pelo cliente.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Docs, Notion, Hemingway App (clareza textual), IA como apoio à ideação (Claude/ChatGPT — sempre revisão humana obrigatória).', '<p>Google Docs, Notion, Hemingway App (clareza textual), IA como apoio à ideação (Claude/ChatGPT — sempre revisão humana obrigatória).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Análise e conceito: 3 dias úteis. Manifesto + textos: 3 dias úteis. Tom de voz: 1 dia útil. Aprovação: máx. 2 rodadas em 5 dias úteis. Total: 10–15 dias úteis.', '<p>Análise e conceito: 3 dias úteis. Manifesto + textos: 3 dias úteis. Tom de voz: 1 dia útil. Aprovação: máx. 2 rodadas em 5 dias úteis. Total: 10–15 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing + naming + IV em andamento → Análise do empreendimento → Definir conceito narrativo → [NELSON VALIDA CONCEITO?] → Não: revisar → Sim: Desenvolver manifesto → Criar textos de posicionamento → Definir tom de voz → [MARCO APROVA?] → Não: revisar → Sim: Apresentar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Integrar ao manual → Arquivar no Notion → Fim', '<p>Início → Briefing + naming + IV em andamento → Análise do empreendimento → Definir conceito narrativo → [NELSON VALIDA CONCEITO?] → Não: revisar → Sim: Desenvolver manifesto → Criar textos de posicionamento → Definir tom de voz → [MARCO APROVA?] → Não: revisar → Sim: Apresentar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Integrar ao manual → Arquivar no Notion → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Conceito narrativo: ideia-força que ancora toda a comunicação de um empreendimento. Manifesto: texto emocional que expressa o propósito e o espírito da marca. Tagline: frase curta e memorável que sintetiza o posicionamento. Elevator pitch: argumentação de venda em até 30 segundos. Tom de voz: conjunto de atributos que definem como a marca fala.', '<p>Conceito narrativo: ideia-força que ancora toda a comunicação de um empreendimento. Manifesto: texto emocional que expressa o propósito e o espírito da marca. Tagline: frase curta e memorável que sintetiza o posicionamento. Elevator pitch: argumentação de venda em até 30 segundos. Tom de voz: conjunto de atributos que definem como a marca fala.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-004: Tapume PDV ──
END $$;