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
    'Onboarding de Novo Cliente',
    'tbo-ops-002-onboarding-de-novo-cliente',
    'operacoes',
    'checklist',
    'Carol (Coordenadora de Operações)',
    'Standard Operating Procedure

Onboarding de Novo Cliente

Código

TBO-OPS-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Operações

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



  1. Objetivo

Estruturar a entrada de um novo cliente na TBO de forma organizada e profissional, garantindo alinhamento de expectativas, configuração de canais de comunicação, acesso a plataformas e kick-off do primeiro projeto contratado.

  2. Escopo

2.1 O que está coberto

Do momento da assinatura do contrato até o início do primeiro projeto: configuração de pasta no Drive, cadastro no Asana, apresentação da equipe, reunião de alinhamento e entrega do guia do cliente.

2.2 Exclusões

Processo comercial e negociação (pré-contrato), execução dos projetos em si (cobertos pelos SOPs de cada BU).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar todo o processo, configurar plataformas, conduzir reuniões

Executor

—

Marco Andolfato

Apresentar TBO, validar estratégia inicial, relação de confiança

Consultado

Informado

Líder de BU responsável

Apresentar equipe técnica e metodologia

Executor

—

Cliente

Participar das reuniões, fornecer materiais e acessos solicitados

Consultado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado; proposta comercial aprovada; contato principal do cliente (nome, e-mail, WhatsApp); escopo inicial dos projetos contratados.

4.2 Ferramentas e Acessos

Google Drive (estrutura de pastas padrão TBO), Asana (projeto criado por template), WhatsApp Business, Google Meet, planilha de controle de projetos.



  5. Procedimento Passo a Passo

5.1. Configuração de Infraestrutura do Cliente

Ação: Carol cria pasta padrão no Google Drive (/_clientes/NOME_CLIENTE com subpastas: /briefings, /aprovações, /entregas, /financeiro); cria projeto no Asana a partir do template TBO; adiciona cliente como colaborador externo nas plataformas pertinentes.

Responsável: Carol (Ops)

Output: Infraestrutura de projeto configurada

Prazo referência: Dia 1 (após contrato assinado)

5.2. Envio do Guia do Cliente

Ação: Carol envia e-mail de boas-vindas com: guia do cliente TBO (como trabalhamos, prazos, canais de comunicação, processo de aprovação, política de revisões), agenda da reunião de kick-off e link do Asana.

Responsável: Carol (Ops)

Output: E-mail de boas-vindas enviado

Prazo referência: Dia 1

5.3. Reunião de Apresentação da Equipe

Ação: Marco e líder de BU se apresentam ao cliente; apresentar estrutura da agência, cases relevantes para o segmento, equipe que atenderá a conta; alinhamento de canais de comunicação preferenciais e cadência de reuniões.

Responsável: Marco Andolfato + Carol (Ops)

Output: Equipe e processos apresentados ao cliente

Prazo referência: Dia 2–3

5.4. Coleta de Assets e Materiais

Ação: Carol envia checklist de materiais necessários para início dos projetos (logo em vetor, brandbook, fotos/renders, plantas, textos institucionais, credenciais de plataformas se houver); monitorar recebimento via Drive.

Responsável: Carol (Ops)

Output: Checklist de assets enviado e controlado

Prazo referência: Dia 2–5

5.5. Kick-off do Primeiro Projeto

Ação: Executar SOP OPS-03 (Briefing e Kick-off de Projeto) para o primeiro projeto; registrar todas as decisões no Asana; confirmar prazo de entrega e responsáveis; iniciar produção.

Responsável: Carol (Ops) + Líder de BU

Output: Primeiro projeto em andamento no Asana

Prazo referência: Dia 5–7

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Pasta no Drive criada com estrutura padrão; [ ] Asana configurado com projeto e responsáveis; [ ] Guia do cliente enviado no Dia 1; [ ] Reunião de apresentação realizada; [ ] Checklist de assets enviado ao cliente; [ ] Primeiro projeto com data de início registrada.

6.2 Erros Comuns a Evitar

Início de projeto sem folder de cliente → arquivos perdidos em pastas genéricas. Cliente sem guia de processo → expectativas desalinhadas, conflitos futuros. Assets não coletados antes do kick-off → project delay imediato.

  7. Ferramentas e Templates

Google Drive, Asana, Google Meet, WhatsApp Business, Gmail.

  8. SLAs e Prazos

Configuração de infraestrutura: Dia 1 após contrato. Guia do cliente: Dia 1. Reunião de apresentação: até 3 dias úteis. Kick-off do primeiro projeto: até 7 dias úteis.

  9. Fluxograma

Início (contrato assinado) → Configuração Drive + Asana → E-mail de Boas-vindas + Guia → Reunião de Apresentação → Coleta de Assets → Kick-off Primeiro Projeto → Cliente Ativo → Fim

  10. Glossário

Onboarding de cliente: processo estruturado de entrada de um novo cliente na agência. Guia do cliente: documento que explica como a TBO trabalha, prazos e processos. Cadência: frequência definida de reuniões de acompanhamento.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Onboarding de Novo Cliente</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Estruturar a entrada de um novo cliente na TBO de forma organizada e profissional, garantindo alinhamento de expectativas, configuração de canais de comunicação, acesso a plataformas e kick-off do primeiro projeto contratado.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Do momento da assinatura do contrato até o início do primeiro projeto: configuração de pasta no Drive, cadastro no Asana, apresentação da equipe, reunião de alinhamento e entrega do guia do cliente.</p><p><strong>2.2 Exclusões</strong></p><p>Processo comercial e negociação (pré-contrato), execução dos projetos em si (cobertos pelos SOPs de cada BU).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar todo o processo, configurar plataformas, conduzir reuniões</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Apresentar TBO, validar estratégia inicial, relação de confiança</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Líder de BU responsável</p></td><td><p>Apresentar equipe técnica e metodologia</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Participar das reuniões, fornecer materiais e acessos solicitados</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado; proposta comercial aprovada; contato principal do cliente (nome, e-mail, WhatsApp); escopo inicial dos projetos contratados.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Drive (estrutura de pastas padrão TBO), Asana (projeto criado por template), WhatsApp Business, Google Meet, planilha de controle de projetos.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Configuração de Infraestrutura do Cliente</strong></p><p>Ação: Carol cria pasta padrão no Google Drive (/_clientes/NOME_CLIENTE com subpastas: /briefings, /aprovações, /entregas, /financeiro); cria projeto no Asana a partir do template TBO; adiciona cliente como colaborador externo nas plataformas pertinentes.</p><p>Responsável: Carol (Ops)</p><p>Output: Infraestrutura de projeto configurada</p><p>Prazo referência: Dia 1 (após contrato assinado)</p><p><strong>5.2. Envio do Guia do Cliente</strong></p><p>Ação: Carol envia e-mail de boas-vindas com: guia do cliente TBO (como trabalhamos, prazos, canais de comunicação, processo de aprovação, política de revisões), agenda da reunião de kick-off e link do Asana.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail de boas-vindas enviado</p><p>Prazo referência: Dia 1</p><p><strong>5.3. Reunião de Apresentação da Equipe</strong></p><p>Ação: Marco e líder de BU se apresentam ao cliente; apresentar estrutura da agência, cases relevantes para o segmento, equipe que atenderá a conta; alinhamento de canais de comunicação preferenciais e cadência de reuniões.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Equipe e processos apresentados ao cliente</p><p>Prazo referência: Dia 2–3</p><p><strong>5.4. Coleta de Assets e Materiais</strong></p><p>Ação: Carol envia checklist de materiais necessários para início dos projetos (logo em vetor, brandbook, fotos/renders, plantas, textos institucionais, credenciais de plataformas se houver); monitorar recebimento via Drive.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de assets enviado e controlado</p><p>Prazo referência: Dia 2–5</p><p><strong>5.5. Kick-off do Primeiro Projeto</strong></p><p>Ação: Executar SOP OPS-03 (Briefing e Kick-off de Projeto) para o primeiro projeto; registrar todas as decisões no Asana; confirmar prazo de entrega e responsáveis; iniciar produção.</p><p>Responsável: Carol (Ops) + Líder de BU</p><p>Output: Primeiro projeto em andamento no Asana</p><p>Prazo referência: Dia 5–7</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Pasta no Drive criada com estrutura padrão; [ ] Asana configurado com projeto e responsáveis; [ ] Guia do cliente enviado no Dia 1; [ ] Reunião de apresentação realizada; [ ] Checklist de assets enviado ao cliente; [ ] Primeiro projeto com data de início registrada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Início de projeto sem folder de cliente → arquivos perdidos em pastas genéricas. Cliente sem guia de processo → expectativas desalinhadas, conflitos futuros. Assets não coletados antes do kick-off → project delay imediato.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Drive, Asana, Google Meet, WhatsApp Business, Gmail.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Configuração de infraestrutura: Dia 1 após contrato. Guia do cliente: Dia 1. Reunião de apresentação: até 3 dias úteis. Kick-off do primeiro projeto: até 7 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início (contrato assinado) → Configuração Drive + Asana → E-mail de Boas-vindas + Guia → Reunião de Apresentação → Coleta de Assets → Kick-off Primeiro Projeto → Cliente Ativo → Fim</p><p><strong>  10. Glossário</strong></p><p>Onboarding de cliente: processo estruturado de entrada de um novo cliente na agência. Guia do cliente: documento que explica como a TBO trabalha, prazos e processos. Cadência: frequência definida de reuniões de acompanhamento.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
    1,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-OPS-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estruturar a entrada de um novo cliente na TBO de forma organizada e profissional, garantindo alinhamento de expectativas, configuração de canais de comunicação, acesso a plataformas e kick-off do primeiro projeto contratado.', '<p>Estruturar a entrada de um novo cliente na TBO de forma organizada e profissional, garantindo alinhamento de expectativas, configuração de canais de comunicação, acesso a plataformas e kick-off do primeiro projeto contratado.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Do momento da assinatura do contrato até o início do primeiro projeto: configuração de pasta no Drive, cadastro no Asana, apresentação da equipe, reunião de alinhamento e entrega do guia do cliente.', '<p>Do momento da assinatura do contrato até o início do primeiro projeto: configuração de pasta no Drive, cadastro no Asana, apresentação da equipe, reunião de alinhamento e entrega do guia do cliente.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Processo comercial e negociação (pré-contrato), execução dos projetos em si (cobertos pelos SOPs de cada BU).', '<p>Processo comercial e negociação (pré-contrato), execução dos projetos em si (cobertos pelos SOPs de cada BU).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar todo o processo, configurar plataformas, conduzir reuniões

Executor

—

Marco Andolfato

Apresentar TBO, validar estratégia inicial, relação de confiança

Consultado

Informado

Líder de BU responsável

Apresentar equipe técnica e metodologia

Executor

—

Cliente

Participar das reuniões, fornecer materiais e acessos solicitados

Consultado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar todo o processo, configurar plataformas, conduzir reuniões</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Apresentar TBO, validar estratégia inicial, relação de confiança</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Líder de BU responsável</p></td><td><p>Apresentar equipe técnica e metodologia</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Participar das reuniões, fornecer materiais e acessos solicitados</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; proposta comercial aprovada; contato principal do cliente (nome, e-mail, WhatsApp); escopo inicial dos projetos contratados.', '<p>Contrato assinado; proposta comercial aprovada; contato principal do cliente (nome, e-mail, WhatsApp); escopo inicial dos projetos contratados.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive (estrutura de pastas padrão TBO), Asana (projeto criado por template), WhatsApp Business, Google Meet, planilha de controle de projetos.', '<p>Google Drive (estrutura de pastas padrão TBO), Asana (projeto criado por template), WhatsApp Business, Google Meet, planilha de controle de projetos.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Configuração de Infraestrutura do Cliente', 'Ação: Carol cria pasta padrão no Google Drive (/_clientes/NOME_CLIENTE com subpastas: /briefings, /aprovações, /entregas, /financeiro); cria projeto no Asana a partir do template TBO; adiciona cliente como colaborador externo nas plataformas pertinentes.

Responsável: Carol (Ops)

Output: Infraestrutura de projeto configurada

Prazo referência: Dia 1 (após contrato assinado)', '<p>Ação: Carol cria pasta padrão no Google Drive (/_clientes/NOME_CLIENTE com subpastas: /briefings, /aprovações, /entregas, /financeiro); cria projeto no Asana a partir do template TBO; adiciona cliente como colaborador externo nas plataformas pertinentes.</p><p>Responsável: Carol (Ops)</p><p>Output: Infraestrutura de projeto configurada</p><p>Prazo referência: Dia 1 (após contrato assinado)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Envio do Guia do Cliente', 'Ação: Carol envia e-mail de boas-vindas com: guia do cliente TBO (como trabalhamos, prazos, canais de comunicação, processo de aprovação, política de revisões), agenda da reunião de kick-off e link do Asana.

Responsável: Carol (Ops)

Output: E-mail de boas-vindas enviado

Prazo referência: Dia 1', '<p>Ação: Carol envia e-mail de boas-vindas com: guia do cliente TBO (como trabalhamos, prazos, canais de comunicação, processo de aprovação, política de revisões), agenda da reunião de kick-off e link do Asana.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail de boas-vindas enviado</p><p>Prazo referência: Dia 1</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Reunião de Apresentação da Equipe', 'Ação: Marco e líder de BU se apresentam ao cliente; apresentar estrutura da agência, cases relevantes para o segmento, equipe que atenderá a conta; alinhamento de canais de comunicação preferenciais e cadência de reuniões.

Responsável: Marco Andolfato + Carol (Ops)

Output: Equipe e processos apresentados ao cliente

Prazo referência: Dia 2–3', '<p>Ação: Marco e líder de BU se apresentam ao cliente; apresentar estrutura da agência, cases relevantes para o segmento, equipe que atenderá a conta; alinhamento de canais de comunicação preferenciais e cadência de reuniões.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Equipe e processos apresentados ao cliente</p><p>Prazo referência: Dia 2–3</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Coleta de Assets e Materiais', 'Ação: Carol envia checklist de materiais necessários para início dos projetos (logo em vetor, brandbook, fotos/renders, plantas, textos institucionais, credenciais de plataformas se houver); monitorar recebimento via Drive.

Responsável: Carol (Ops)

Output: Checklist de assets enviado e controlado

Prazo referência: Dia 2–5', '<p>Ação: Carol envia checklist de materiais necessários para início dos projetos (logo em vetor, brandbook, fotos/renders, plantas, textos institucionais, credenciais de plataformas se houver); monitorar recebimento via Drive.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de assets enviado e controlado</p><p>Prazo referência: Dia 2–5</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Kick-off do Primeiro Projeto', 'Ação: Executar SOP OPS-03 (Briefing e Kick-off de Projeto) para o primeiro projeto; registrar todas as decisões no Asana; confirmar prazo de entrega e responsáveis; iniciar produção.

Responsável: Carol (Ops) + Líder de BU

Output: Primeiro projeto em andamento no Asana

Prazo referência: Dia 5–7', '<p>Ação: Executar SOP OPS-03 (Briefing e Kick-off de Projeto) para o primeiro projeto; registrar todas as decisões no Asana; confirmar prazo de entrega e responsáveis; iniciar produção.</p><p>Responsável: Carol (Ops) + Líder de BU</p><p>Output: Primeiro projeto em andamento no Asana</p><p>Prazo referência: Dia 5–7</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Pasta no Drive criada com estrutura padrão; [ ] Asana configurado com projeto e responsáveis; [ ] Guia do cliente enviado no Dia 1; [ ] Reunião de apresentação realizada; [ ] Checklist de assets enviado ao cliente; [ ] Primeiro projeto com data de início registrada.', '<p>[ ] Pasta no Drive criada com estrutura padrão; [ ] Asana configurado com projeto e responsáveis; [ ] Guia do cliente enviado no Dia 1; [ ] Reunião de apresentação realizada; [ ] Checklist de assets enviado ao cliente; [ ] Primeiro projeto com data de início registrada.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Início de projeto sem folder de cliente → arquivos perdidos em pastas genéricas. Cliente sem guia de processo → expectativas desalinhadas, conflitos futuros. Assets não coletados antes do kick-off → project delay imediato.', '<p>Início de projeto sem folder de cliente → arquivos perdidos em pastas genéricas. Cliente sem guia de processo → expectativas desalinhadas, conflitos futuros. Assets não coletados antes do kick-off → project delay imediato.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive, Asana, Google Meet, WhatsApp Business, Gmail.', '<p>Google Drive, Asana, Google Meet, WhatsApp Business, Gmail.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Configuração de infraestrutura: Dia 1 após contrato. Guia do cliente: Dia 1. Reunião de apresentação: até 3 dias úteis. Kick-off do primeiro projeto: até 7 dias úteis.', '<p>Configuração de infraestrutura: Dia 1 após contrato. Guia do cliente: Dia 1. Reunião de apresentação: até 3 dias úteis. Kick-off do primeiro projeto: até 7 dias úteis.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início (contrato assinado) → Configuração Drive + Asana → E-mail de Boas-vindas + Guia → Reunião de Apresentação → Coleta de Assets → Kick-off Primeiro Projeto → Cliente Ativo → Fim', '<p>Início (contrato assinado) → Configuração Drive + Asana → E-mail de Boas-vindas + Guia → Reunião de Apresentação → Coleta de Assets → Kick-off Primeiro Projeto → Cliente Ativo → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Onboarding de cliente: processo estruturado de entrada de um novo cliente na agência. Guia do cliente: documento que explica como a TBO trabalha, prazos e processos. Cadência: frequência definida de reuniões de acompanhamento.', '<p>Onboarding de cliente: processo estruturado de entrada de um novo cliente na agência. Guia do cliente: documento que explica como a TBO trabalha, prazos e processos. Cadência: frequência definida de reuniões de acompanhamento.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-003: Briefing e Kick off de Projeto ──
END $$;