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
    'Naming',
    'tbo-brd-001-naming',
    'branding',
    'checklist',
    'Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.',
    'Standard Operating Procedure

Naming

Código

TBO-BRD-001

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

Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.

  2. Escopo

2.1 O que está coberto

Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.

2.2 Exclusões

Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Naming

Pesquisa e geração de alternativas

Aprovador

Informado

Nelson (PO Branding)

Curadoria e alinhamento estratégico

Aprovador

Informado

Marco Andolfato

Aprovação final antes da entrega ao cliente

Aprovador



Cliente/Incorporadora

Briefing e aprovação do nome



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.

4.2 Ferramentas e Acessos

Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.



  5. Procedimento Passo a Passo

5.1. Imersão e análise de briefing

Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.

Responsável: Estrategista de Naming

Output: Mapa conceitual e painel de referências de naming

Prazo referência: 1 dia útil

5.2. Geração de alternativas

Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.

Responsável: Estrategista de Naming

Output: Planilha com 30+ opções categorizadas e avaliadas

Prazo referência: 2 dias úteis

5.3. Curadoria interna e seleção de finalistas

Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.

Responsável: Nelson (PO Branding)

Output: Lista curada de 6–10 finalistas

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova lista antes da verificação formal

5.4. Verificação de disponibilidade

Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.

Responsável: Estrategista de Naming

Output: Relatório de disponibilidade por nome

Prazo referência: 1 dia útil

[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.

5.5. Apresentação ao cliente

Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.

Responsável: Nelson (PO Branding)

Output: Deck de naming apresentado ao cliente

Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)

5.6. Aprovação e documentação

Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.

Responsável: Marco Andolfato / Nelson

Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado

Prazo referência: 1 dia útil após apresentação

[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.

6.2 Erros Comuns a Evitar

Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.

  7. Ferramentas e Templates

INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.

  8. SLAs e Prazos

Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).

  9. Fluxograma

Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim

  10. Glossário

INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Naming</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.</p><p><strong>2.2 Exclusões</strong></p><p>Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator/Estrategista de Naming</p></td><td><p>Pesquisa e geração de alternativas</p></td><td><p>Aprovador</p></td><td><p>Informado</p></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Curadoria e alinhamento estratégico</p></td><td><p>Aprovador</p></td><td><p>Informado</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes da entrega ao cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Briefing e aprovação do nome</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Imersão e análise de briefing</strong></p><p>Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.</p><p>Responsável: Estrategista de Naming</p><p>Output: Mapa conceitual e painel de referências de naming</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Geração de alternativas</strong></p><p>Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.</p><p>Responsável: Estrategista de Naming</p><p>Output: Planilha com 30+ opções categorizadas e avaliadas</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.3. Curadoria interna e seleção de finalistas</strong></p><p>Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Lista curada de 6–10 finalistas</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova lista antes da verificação formal</strong></p><p><strong>5.4. Verificação de disponibilidade</strong></p><p>Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.</p><p>Responsável: Estrategista de Naming</p><p>Output: Relatório de disponibilidade por nome</p><p>Prazo referência: 1 dia útil</p><p><strong>[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.</strong></p><p><strong>5.5. Apresentação ao cliente</strong></p><p>Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Deck de naming apresentado ao cliente</p><p>Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)</p><p><strong>5.6. Aprovação e documentação</strong></p><p>Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado</p><p>Prazo referência: 1 dia útil após apresentação</p><p><strong>[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).</p><p><strong>  9. Fluxograma</strong></p><p>Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim</p><p><strong>  10. Glossário</strong></p><p>INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    0,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.', '<p>Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.', '<p>Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.', '<p>Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Naming

Pesquisa e geração de alternativas

Aprovador

Informado

Nelson (PO Branding)

Curadoria e alinhamento estratégico

Aprovador

Informado

Marco Andolfato

Aprovação final antes da entrega ao cliente

Aprovador

Cliente/Incorporadora

Briefing e aprovação do nome

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator/Estrategista de Naming</p></td><td><p>Pesquisa e geração de alternativas</p></td><td><p>Aprovador</p></td><td><p>Informado</p></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Curadoria e alinhamento estratégico</p></td><td><p>Aprovador</p></td><td><p>Informado</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes da entrega ao cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Briefing e aprovação do nome</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.', '<p>Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.', '<p>Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Imersão e análise de briefing', 'Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.

Responsável: Estrategista de Naming

Output: Mapa conceitual e painel de referências de naming

Prazo referência: 1 dia útil', '<p>Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.</p><p>Responsável: Estrategista de Naming</p><p>Output: Mapa conceitual e painel de referências de naming</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Geração de alternativas', 'Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.

Responsável: Estrategista de Naming

Output: Planilha com 30+ opções categorizadas e avaliadas

Prazo referência: 2 dias úteis', '<p>Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.</p><p>Responsável: Estrategista de Naming</p><p>Output: Planilha com 30+ opções categorizadas e avaliadas</p><p>Prazo referência: 2 dias úteis</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Curadoria interna e seleção de finalistas', 'Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.

Responsável: Nelson (PO Branding)

Output: Lista curada de 6–10 finalistas

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova lista antes da verificação formal', '<p>Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Lista curada de 6–10 finalistas</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova lista antes da verificação formal</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Verificação de disponibilidade', 'Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.

Responsável: Estrategista de Naming

Output: Relatório de disponibilidade por nome

Prazo referência: 1 dia útil

[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.', '<p>Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.</p><p>Responsável: Estrategista de Naming</p><p>Output: Relatório de disponibilidade por nome</p><p>Prazo referência: 1 dia útil</p><p><strong>[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Apresentação ao cliente', 'Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.

Responsável: Nelson (PO Branding)

Output: Deck de naming apresentado ao cliente

Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)', '<p>Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Deck de naming apresentado ao cliente</p><p>Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Aprovação e documentação', 'Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.

Responsável: Marco Andolfato / Nelson

Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado

Prazo referência: 1 dia útil após apresentação

[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP', '<p>Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado</p><p>Prazo referência: 1 dia útil após apresentação</p><p><strong>[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP</strong></p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.', '<p>Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.', '<p>Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.', '<p>INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).', '<p>Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim', '<p>Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.', '<p>INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-002: Identidade Visual Logo Manual KVs ──
END $$;