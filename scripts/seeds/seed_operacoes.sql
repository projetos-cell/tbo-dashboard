-- Seed: operacoes (8 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-OPS-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Onboarding de Novo Colaborador', 'tbo-ops-001-onboarding-de-novo-colaborador', 'operacoes', 'checklist', 'Carol (Coordenadora de Operações)', 'Standard Operating Procedure

Onboarding de Novo Colaborador

Código

TBO-OPS-001

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

Garantir que todo novo colaborador da TBO seja integrado de forma estruturada nos primeiros 30 dias, compreendendo cultura, ferramentas, processos e responsabilidades antes de assumir projetos de forma independente.

  2. Escopo

2.1 O que está coberto

Processo de integração do momento da contratação até o fim do período de onboarding (30 dias), cobrindo cultura TBO, stack de ferramentas, acompanhamento por mentor e avaliação de conclusão.

2.2 Exclusões

Processo seletivo e contratação (pré-onboarding), treinamentos técnicos específicos de BU (responsabilidade de cada líder de área), férias e benefícios (RH).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar todo o processo de onboarding, materiais e agenda

Executor

—

Marco Andolfato

Apresentar cultura, valores TBO e missão estratégica

Aprovador

—

Líder de BU

Mentor técnico do novo colaborador

Executor

—

Novo Colaborador

Participar ativamente, completar checklist, tirar dúvidas

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado; e-mail corporativo criado; acesso ao Google Workspace, Asana e Supabase configurado; kit de boas-vindas preparado; agenda dos primeiros 5 dias montada.

4.2 Ferramentas e Acessos

Google Workspace (Drive, Agenda, Meet), Asana, Supabase (acesso por role), Slack (ou WhatsApp corporativo), plataforma de documentação interna.



  5. Procedimento Passo a Passo

5.1. Preparação Pré-chegada (D-2)

Ação: Carol configura acessos (e-mail, Asana, Drive, Supabase com role correto); prepara pasta de onboarding no Drive com: contrato de trabalho, guia de cultura, organograma, lista de ferramentas e credenciais; agenda reunião de boas-vindas com Marco.

Responsável: Carol (Ops)

Output: Acessos configurados, pasta Drive pronta, agenda bloqueada

Prazo referência: 2 dias antes da entrada

5.2. Dia 1 — Boas-vindas e Cultura

Ação: Marco apresenta a TBO: história, missão ''think, build, own'', valores, clientes atuais, posicionamento no mercado imobiliário e o que diferencia a agência. Tour pelo espaço (presencial ou virtual). Carol apresenta equipe e ferramentas.

Responsável: Marco Andolfato + Carol (Ops)

Output: Colaborador ambientado culturalmente

Prazo referência: Dia 1

5.3. Semana 1 — Ferramentas e Processos

Ação: Líder de BU conduz treinamento de ferramentas da área (Premiere, Unreal, Asana etc.); Carol orienta sobre processos operacionais: abertura de projeto, comunicação com cliente, registro de horas, gestão de arquivos no Drive.

Responsável: Líder de BU + Carol (Ops)

Output: Checklist de ferramentas concluído

Prazo referência: Dia 2–5

5.4. Semana 2–3 — Imersão em Projeto Real

Ação: Novo colaborador participa de projeto real em andamento como observador/apoio (não responsável); líder de BU realiza daily check-in de 15min; Carol acompanha registro no Asana.

Responsável: Líder de BU + Novo Colaborador

Output: Participação documentada em projeto real

Prazo referência: Dia 6–15

5.5. Semana 4 — Avaliação e Feedback

Ação: Carol e líder de BU realizam avaliação formal: checklist de competências esperadas, feedback 360° (Marco incluso), alinhamento de expectativas para o período pós-onboarding; registrar no Supabase.

Responsável: Carol (Ops) + Líder de BU + Marco

Output: Avaliação registrada, plano de desenvolvimento definido

Prazo referência: Dia 25–30

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todos os acessos configurados antes do Dia 1; [ ] Agenda da primeira semana montada e enviada ao colaborador; [ ] Guia de cultura entregue e discutido; [ ] Checklist de ferramentas 100% concluído; [ ] Avaliação de 30 dias realizada e registrada no sistema.

6.2 Erros Comuns a Evitar

Colaborador sem acesso às ferramentas no Dia 1 → primeira impressão negativa e improdutividade. Onboarding apenas informal → não internaliza processos, gera retrabalho futuro. Sem mentor definido → colaborador perdido nas primeiras semanas.

  7. Ferramentas e Templates

Google Workspace, Asana, Supabase, Slack/WhatsApp corporativo, documentação interna.

  8. SLAs e Prazos

Configuração de acessos: 2 dias antes da entrada. Avaliação formal: até 30 dias após início. Duração total do onboarding: 30 dias corridos.

  9. Fluxograma

Início → Preparação D-2 (acessos + pasta Drive) → Dia 1 (boas-vindas + cultura) → Semana 1 (ferramentas + processos) → Semanas 2–3 (imersão em projeto real) → Semana 4 (avaliação + feedback) → Onboarding Concluído → Fim

  10. Glossário

Role: permissão de acesso no sistema (ex.: colaborador, diretoria, founder). Checklist de ferramentas: lista de ferramentas que o colaborador deve dominar ao fim do onboarding. 360°: feedback dado por pares, líderes e liderados simultaneamente.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['operacoes','gestao']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo novo colaborador da TBO seja integrado de forma estruturada nos primeiros 30 dias, compreendendo cultura, ferramentas, processos e responsabilidades antes de assumir projetos de forma independente.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Processo de integração do momento da contratação até o fim do período de onboarding (30 dias), cobrindo cultura TBO, stack de ferramentas, acompanhamento por mentor e avaliação de conclusão.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Processo seletivo e contratação (pré-onboarding), treinamentos técnicos específicos de BU (responsabilidade de cada líder de área), férias e benefícios (RH).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar todo o processo de onboarding, materiais e agenda

Executor

—

Marco Andolfato

Apresentar cultura, valores TBO e missão estratégica

Aprovador

—

Líder de BU

Mentor técnico do novo colaborador

Executor

—

Novo Colaborador

Participar ativamente, completar checklist, tirar dúvidas

Executor

—', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; e-mail corporativo criado; acesso ao Google Workspace, Asana e Supabase configurado; kit de boas-vindas preparado; agenda dos primeiros 5 dias montada.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Workspace (Drive, Agenda, Meet), Asana, Supabase (acesso por role), Slack (ou WhatsApp corporativo), plataforma de documentação interna.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Preparação Pré-chegada (D-2)', 'Ação: Carol configura acessos (e-mail, Asana, Drive, Supabase com role correto); prepara pasta de onboarding no Drive com: contrato de trabalho, guia de cultura, organograma, lista de ferramentas e credenciais; agenda reunião de boas-vindas com Marco.

Responsável: Carol (Ops)

Output: Acessos configurados, pasta Drive pronta, agenda bloqueada

Prazo referência: 2 dias antes da entrada', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Dia 1 — Boas-vindas e Cultura', 'Ação: Marco apresenta a TBO: história, missão ''think, build, own'', valores, clientes atuais, posicionamento no mercado imobiliário e o que diferencia a agência. Tour pelo espaço (presencial ou virtual). Carol apresenta equipe e ferramentas.

Responsável: Marco Andolfato + Carol (Ops)

Output: Colaborador ambientado culturalmente

Prazo referência: Dia 1', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Semana 1 — Ferramentas e Processos', 'Ação: Líder de BU conduz treinamento de ferramentas da área (Premiere, Unreal, Asana etc.); Carol orienta sobre processos operacionais: abertura de projeto, comunicação com cliente, registro de horas, gestão de arquivos no Drive.

Responsável: Líder de BU + Carol (Ops)

Output: Checklist de ferramentas concluído

Prazo referência: Dia 2–5', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Semana 2–3 — Imersão em Projeto Real', 'Ação: Novo colaborador participa de projeto real em andamento como observador/apoio (não responsável); líder de BU realiza daily check-in de 15min; Carol acompanha registro no Asana.

Responsável: Líder de BU + Novo Colaborador

Output: Participação documentada em projeto real

Prazo referência: Dia 6–15', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Semana 4 — Avaliação e Feedback', 'Ação: Carol e líder de BU realizam avaliação formal: checklist de competências esperadas, feedback 360° (Marco incluso), alinhamento de expectativas para o período pós-onboarding; registrar no Supabase.

Responsável: Carol (Ops) + Líder de BU + Marco

Output: Avaliação registrada, plano de desenvolvimento definido

Prazo referência: Dia 25–30', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os acessos configurados antes do Dia 1; [ ] Agenda da primeira semana montada e enviada ao colaborador; [ ] Guia de cultura entregue e discutido; [ ] Checklist de ferramentas 100% concluído; [ ] Avaliação de 30 dias realizada e registrada no sistema.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Colaborador sem acesso às ferramentas no Dia 1 → primeira impressão negativa e improdutividade. Onboarding apenas informal → não internaliza processos, gera retrabalho futuro. Sem mentor definido → colaborador perdido nas primeiras semanas.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Workspace, Asana, Supabase, Slack/WhatsApp corporativo, documentação interna.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Configuração de acessos: 2 dias antes da entrada. Avaliação formal: até 30 dias após início. Duração total do onboarding: 30 dias corridos.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Preparação D-2 (acessos + pasta Drive) → Dia 1 (boas-vindas + cultura) → Semana 1 (ferramentas + processos) → Semanas 2–3 (imersão em projeto real) → Semana 4 (avaliação + feedback) → Onboarding Concluído → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Role: permissão de acesso no sistema (ex.: colaborador, diretoria, founder). Checklist de ferramentas: lista de ferramentas que o colaborador deve dominar ao fim do onboarding. 360°: feedback dado por pares, líderes e liderados simultaneamente.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-OPS-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Onboarding de Novo Cliente', 'tbo-ops-002-onboarding-de-novo-cliente', 'operacoes', 'checklist', 'Carol (Coordenadora de Operações)', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['operacoes','gestao']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Estruturar a entrada de um novo cliente na TBO de forma organizada e profissional, garantindo alinhamento de expectativas, configuração de canais de comunicação, acesso a plataformas e kick-off do primeiro projeto contratado.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Do momento da assinatura do contrato até o início do primeiro projeto: configuração de pasta no Drive, cadastro no Asana, apresentação da equipe, reunião de alinhamento e entrega do guia do cliente.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Processo comercial e negociação (pré-contrato), execução dos projetos em si (cobertos pelos SOPs de cada BU).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; proposta comercial aprovada; contato principal do cliente (nome, e-mail, WhatsApp); escopo inicial dos projetos contratados.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive (estrutura de pastas padrão TBO), Asana (projeto criado por template), WhatsApp Business, Google Meet, planilha de controle de projetos.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Configuração de Infraestrutura do Cliente', 'Ação: Carol cria pasta padrão no Google Drive (/_clientes/NOME_CLIENTE com subpastas: /briefings, /aprovações, /entregas, /financeiro); cria projeto no Asana a partir do template TBO; adiciona cliente como colaborador externo nas plataformas pertinentes.

Responsável: Carol (Ops)

Output: Infraestrutura de projeto configurada

Prazo referência: Dia 1 (após contrato assinado)', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Envio do Guia do Cliente', 'Ação: Carol envia e-mail de boas-vindas com: guia do cliente TBO (como trabalhamos, prazos, canais de comunicação, processo de aprovação, política de revisões), agenda da reunião de kick-off e link do Asana.

Responsável: Carol (Ops)

Output: E-mail de boas-vindas enviado

Prazo referência: Dia 1', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Reunião de Apresentação da Equipe', 'Ação: Marco e líder de BU se apresentam ao cliente; apresentar estrutura da agência, cases relevantes para o segmento, equipe que atenderá a conta; alinhamento de canais de comunicação preferenciais e cadência de reuniões.

Responsável: Marco Andolfato + Carol (Ops)

Output: Equipe e processos apresentados ao cliente

Prazo referência: Dia 2–3', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Coleta de Assets e Materiais', 'Ação: Carol envia checklist de materiais necessários para início dos projetos (logo em vetor, brandbook, fotos/renders, plantas, textos institucionais, credenciais de plataformas se houver); monitorar recebimento via Drive.

Responsável: Carol (Ops)

Output: Checklist de assets enviado e controlado

Prazo referência: Dia 2–5', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Kick-off do Primeiro Projeto', 'Ação: Executar SOP OPS-03 (Briefing e Kick-off de Projeto) para o primeiro projeto; registrar todas as decisões no Asana; confirmar prazo de entrega e responsáveis; iniciar produção.

Responsável: Carol (Ops) + Líder de BU

Output: Primeiro projeto em andamento no Asana

Prazo referência: Dia 5–7', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Pasta no Drive criada com estrutura padrão; [ ] Asana configurado com projeto e responsáveis; [ ] Guia do cliente enviado no Dia 1; [ ] Reunião de apresentação realizada; [ ] Checklist de assets enviado ao cliente; [ ] Primeiro projeto com data de início registrada.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Início de projeto sem folder de cliente → arquivos perdidos em pastas genéricas. Cliente sem guia de processo → expectativas desalinhadas, conflitos futuros. Assets não coletados antes do kick-off → project delay imediato.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive, Asana, Google Meet, WhatsApp Business, Gmail.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Configuração de infraestrutura: Dia 1 após contrato. Guia do cliente: Dia 1. Reunião de apresentação: até 3 dias úteis. Kick-off do primeiro projeto: até 7 dias úteis.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início (contrato assinado) → Configuração Drive + Asana → E-mail de Boas-vindas + Guia → Reunião de Apresentação → Coleta de Assets → Kick-off Primeiro Projeto → Cliente Ativo → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Onboarding de cliente: processo estruturado de entrada de um novo cliente na agência. Guia do cliente: documento que explica como a TBO trabalha, prazos e processos. Cadência: frequência definida de reuniões de acompanhamento.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-OPS-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Briefing e Kick off de Projeto', 'tbo-ops-003-briefing-e-kick-off-de-projeto', 'operacoes', 'checklist', 'Carol (Coordenadora de Operações)', 'Standard Operating Procedure

Briefing e Kick-off de Projeto

Código

TBO-OPS-003

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

Garantir que todo projeto seja iniciado com briefing completo, escopo definido, responsáveis atribuídos e prazo acordado, evitando retrabalho por alinhamento insuficiente.

  2. Escopo

2.1 O que está coberto

Coleta de briefing, validação de escopo, reunião de kick-off, abertura formal do projeto no Asana e comunicação de início à equipe.

2.2 Exclusões

Negociação comercial e precificação (SOP OPS-06), execução técnica do projeto (SOPs de cada BU).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Conduzir sessão de briefing, registrar no Asana, abrir projeto formal

Executor

—

Marco Andolfato

Validar viabilidade criativa e técnica do escopo

Aprovador

—

Líder de BU

Confirmar capacidade de execução e prazo

Consultado

—

Cliente

Fornecer todas as informações e aprovar escopo

Consultado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Proposta comercial aprovada; cliente ativo no sistema (onboarding concluído); contato do cliente para agendamento da reunião de briefing.

4.2 Ferramentas e Acessos

Formulário de briefing TBO (Google Forms ou Notion), Asana (template de projeto por tipo de entrega), Google Meet, Google Drive.



  5. Procedimento Passo a Passo

5.1. Envio e Preenchimento do Briefing

Ação: Carol envia formulário de briefing padrão TBO ao cliente com prazo de 48h para resposta; o formulário cobre: objetivo do projeto, público-alvo, referências, diferenciais, prazo desejado, assets disponíveis e pontos de atenção.

Responsável: Carol (Ops) + Cliente

Output: Briefing preenchido e recebido

Prazo referência: Dia 1–2

5.2. Análise Interna do Briefing

Ação: Carol e Marco analisam o briefing: identificar lacunas de informação, validar viabilidade do prazo solicitado pelo cliente, estimar esforço por BU e confirmar disponibilidade de equipe.

Responsável: Carol (Ops) + Marco Andolfato

Output: Lista de perguntas complementares e estimativa de prazo

Prazo referência: Dia 3

5.3. Reunião de Kick-off

Ação: Reunião com cliente (45–60min): apresentar entendimento do briefing, esclarecer dúvidas, confirmar escopo final, definir milestone de aprovação intermediária, alinhar prazo de entrega e canal de comunicação do projeto.

Responsável: Carol (Ops) + Líder de BU + Cliente

Output: Ata de kick-off com escopo, prazo e responsáveis

Prazo referência: Dia 4

5.4. Abertura Formal no Asana

Ação: Carol cria projeto no Asana a partir do template correto por tipo de entrega; preenche todas as tasks com responsável, prazo e descrição; adiciona cliente como colaborador; envia link do Asana ao cliente.

Responsável: Carol (Ops)

Output: Projeto aberto no Asana com todas as tasks

Prazo referência: Dia 4 (pós-kick-off)

5.5. Comunicação de Início à Equipe

Ação: Carol envia mensagem no canal do projeto (Slack/WhatsApp) com: resumo do briefing, prazo, cliente, responsáveis por fase e link do Asana; confirma disponibilidade de todos os envolvidos.

Responsável: Carol (Ops)

Output: Equipe informada e projeto iniciado

Prazo referência: Dia 4

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Briefing preenchido pelo cliente antes do kick-off; [ ] Ata de kick-off redigida e enviada ao cliente em até 24h; [ ] Projeto no Asana com 100% das tasks preenchidas; [ ] Prazo confirmado e registrado; [ ] Cliente adicionado ao Asana como colaborador.

6.2 Erros Comuns a Evitar

Projeto iniciado sem briefing formal → retrabalho e conflito de expectativas. Kick-off sem ata → cliente e equipe com entendimentos diferentes. Asana não atualizado → gestão do projeto fica na cabeça das pessoas.

  7. Ferramentas e Templates

Google Forms, Asana, Google Meet, Google Drive, Slack/WhatsApp.

  8. SLAs e Prazos

Formulário de briefing: 48h de prazo para cliente. Análise interna: 1 dia útil. Reunião de kick-off: até 4 dias úteis pós-briefing. Ata: enviada em até 24h após reunião.

  9. Fluxograma

Início → Envio de Briefing ao Cliente → Preenchimento (48h) → Análise Interna → Reunião de Kick-off → Ata de Kick-off → Abertura no Asana → Comunicação à Equipe → Projeto em Execução → Fim

  10. Glossário

Briefing: documento com todas as informações necessárias para execução do projeto. Kick-off: reunião de início formal. Ata: registro escrito das decisões e acordos de uma reunião. Milestone: marco intermediário de entrega ou aprovação.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['operacoes','gestao']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo projeto seja iniciado com briefing completo, escopo definido, responsáveis atribuídos e prazo acordado, evitando retrabalho por alinhamento insuficiente.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Coleta de briefing, validação de escopo, reunião de kick-off, abertura formal do projeto no Asana e comunicação de início à equipe.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Negociação comercial e precificação (SOP OPS-06), execução técnica do projeto (SOPs de cada BU).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Conduzir sessão de briefing, registrar no Asana, abrir projeto formal

Executor

—

Marco Andolfato

Validar viabilidade criativa e técnica do escopo

Aprovador

—

Líder de BU

Confirmar capacidade de execução e prazo

Consultado

—

Cliente

Fornecer todas as informações e aprovar escopo

Consultado

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Proposta comercial aprovada; cliente ativo no sistema (onboarding concluído); contato do cliente para agendamento da reunião de briefing.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Formulário de briefing TBO (Google Forms ou Notion), Asana (template de projeto por tipo de entrega), Google Meet, Google Drive.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Envio e Preenchimento do Briefing', 'Ação: Carol envia formulário de briefing padrão TBO ao cliente com prazo de 48h para resposta; o formulário cobre: objetivo do projeto, público-alvo, referências, diferenciais, prazo desejado, assets disponíveis e pontos de atenção.

Responsável: Carol (Ops) + Cliente

Output: Briefing preenchido e recebido

Prazo referência: Dia 1–2', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Análise Interna do Briefing', 'Ação: Carol e Marco analisam o briefing: identificar lacunas de informação, validar viabilidade do prazo solicitado pelo cliente, estimar esforço por BU e confirmar disponibilidade de equipe.

Responsável: Carol (Ops) + Marco Andolfato

Output: Lista de perguntas complementares e estimativa de prazo

Prazo referência: Dia 3', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Reunião de Kick-off', 'Ação: Reunião com cliente (45–60min): apresentar entendimento do briefing, esclarecer dúvidas, confirmar escopo final, definir milestone de aprovação intermediária, alinhar prazo de entrega e canal de comunicação do projeto.

Responsável: Carol (Ops) + Líder de BU + Cliente

Output: Ata de kick-off com escopo, prazo e responsáveis

Prazo referência: Dia 4', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Abertura Formal no Asana', 'Ação: Carol cria projeto no Asana a partir do template correto por tipo de entrega; preenche todas as tasks com responsável, prazo e descrição; adiciona cliente como colaborador; envia link do Asana ao cliente.

Responsável: Carol (Ops)

Output: Projeto aberto no Asana com todas as tasks

Prazo referência: Dia 4 (pós-kick-off)', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Comunicação de Início à Equipe', 'Ação: Carol envia mensagem no canal do projeto (Slack/WhatsApp) com: resumo do briefing, prazo, cliente, responsáveis por fase e link do Asana; confirma disponibilidade de todos os envolvidos.

Responsável: Carol (Ops)

Output: Equipe informada e projeto iniciado

Prazo referência: Dia 4', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Briefing preenchido pelo cliente antes do kick-off; [ ] Ata de kick-off redigida e enviada ao cliente em até 24h; [ ] Projeto no Asana com 100% das tasks preenchidas; [ ] Prazo confirmado e registrado; [ ] Cliente adicionado ao Asana como colaborador.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Projeto iniciado sem briefing formal → retrabalho e conflito de expectativas. Kick-off sem ata → cliente e equipe com entendimentos diferentes. Asana não atualizado → gestão do projeto fica na cabeça das pessoas.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Forms, Asana, Google Meet, Google Drive, Slack/WhatsApp.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Formulário de briefing: 48h de prazo para cliente. Análise interna: 1 dia útil. Reunião de kick-off: até 4 dias úteis pós-briefing. Ata: enviada em até 24h após reunião.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Envio de Briefing ao Cliente → Preenchimento (48h) → Análise Interna → Reunião de Kick-off → Ata de Kick-off → Abertura no Asana → Comunicação à Equipe → Projeto em Execução → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Briefing: documento com todas as informações necessárias para execução do projeto. Kick-off: reunião de início formal. Ata: registro escrito das decisões e acordos de uma reunião. Milestone: marco intermediário de entrega ou aprovação.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-OPS-004
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestão de Projetos Fluxo Kanban', 'tbo-ops-004-gestao-de-projetos-fluxo-kanban', 'operacoes', 'checklist', 'Gestão de Projetos (Fluxo Kanban)', 'Standard Operating Procedure

Gestão de Projetos (Fluxo Kanban)

Código

TBO-OPS-004

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

Garantir que todos os projetos em andamento sejam geridos com visibilidade, rastreabilidade e previsibilidade através do fluxo Kanban no Asana, com reuniões de acompanhamento semanais e alertas de risco proativos.

  2. Escopo

2.1 O que está coberto

Gestão do ciclo de vida do projeto do kick-off ao encerramento, incluindo atualizações de status, gestão de bloqueios, comunicação com cliente e controle de prazo.

2.2 Exclusões

Execução técnica (responsabilidade de cada BU), negociação comercial de novos escopos (SOP OPS-06), onboarding inicial (SOP OPS-03).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Manter Asana atualizado, conduzir reuniões de acompanhamento, reportar riscos

Executor

—

Marco Andolfato

Aprovar decisões de re-escopo, desbloquear impedimentos estratégicos

Aprovador

—

Responsável de BU

Atualizar tasks, reportar bloqueios, entregar no prazo

Executor

—

Cliente

Aprovar entregas intermediárias no prazo combinado

Consultado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Projeto aberto no Asana com tasks e prazos definidos (SOP OPS-03 concluído); equipe responsável definida; canal de comunicação do projeto ativo.

4.2 Ferramentas e Acessos

Asana (board Kanban por projeto), Google Drive, Google Meet, planilha de controle geral de projetos TBO (status semanal).



  5. Procedimento Passo a Passo

5.1. Manutenção Diária do Kanban

Ação: Cada responsável atualiza suas tasks no Asana diariamente: mover entre colunas (A fazer → Em andamento → Revisão interna → Aguardando cliente → Concluído), adicionar comentários de progresso e sinalizar bloqueios com tag [BLOQUEIO].

Responsável: Equipe de BU

Output: Asana atualizado diariamente

Prazo referência: Diário

5.2. Reunião Semanal de Acompanhamento (Interna)

Ação: Carol conduz reunião semanal de 30min com responsáveis de BU: revisar status de todos os projetos ativos, identificar projetos em risco de atraso (>2 dias do prazo original), definir ação corretiva para cada bloqueio.

Responsável: Carol (Ops) + Líderes de BU

Output: Ata semanal com status e ações corretivas

Prazo referência: Toda segunda-feira

5.3. Atualização de Status ao Cliente

Ação: Carol envia update semanal ao cliente para projetos com prazo de entrega em até 2 semanas: resumo do andamento, próxima entrega intermediária esperada, eventuais ajustes de prazo justificados.

Responsável: Carol (Ops)

Output: Cliente informado semanalmente

Prazo referência: Toda sexta-feira

5.4. Gestão de Entregas para Aprovação do Cliente

Ação: Quando task atinge coluna ''Aguardando cliente'', Carol notifica cliente com link de acesso (frame.io, Drive ou Asana), prazo de resposta (48–72h) e instrução de como aprovar ou comentar. Registrar data de envio.

Responsável: Carol (Ops)

Output: Aprovação do cliente rastreada

Prazo referência: No momento da entrega intermediária

5.5. Gestão de Riscos e Re-escopo

Ação: Quando projeto sinaliza risco de atraso >3 dias úteis ou mudança de escopo pelo cliente, Carol aciona Marco; juntos avaliam impacto, comunicam ao cliente e registram no Asana o motivo do ajuste de prazo ou custo adicional.

Responsável: Carol (Ops) + Marco Andolfato

Output: Risco registrado e plano de ação documentado

Prazo referência: Assim que identificado

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Nenhum projeto com task sem atualização há mais de 2 dias; [ ] Reunião semanal realizada e ata registrada; [ ] Cliente com entregas pendentes avisado com prazo claro; [ ] Todo re-escopo documentado no Asana; [ ] Projetos em risco sinalizados com cor/tag no Asana.

6.2 Erros Comuns a Evitar

Asana não atualizado → gestão cega, surpresas negativas. Sem reunião semanal → problemas acumulam sem solução. Cliente sem update → ansiedade e desconfiança. Re-escopo sem registro → conflito sobre o que foi ou não acordado.

  7. Ferramentas e Templates

Asana, Google Drive, Google Meet, frame.io, planilha de controle de projetos.

  8. SLAs e Prazos

Atualização de task no Asana: diária. Reunião semanal: toda segunda-feira. Update ao cliente: toda sexta para projetos ativos. Prazo de resposta do cliente: 48–72h.

  9. Fluxograma

Início → Projeto Aberto no Asana → Execução Diária (tasks) → Reunião Semanal → Update ao Cliente (sextas) → Entrega Intermediária → Aprovação do Cliente → Próxima Fase → ... → Encerramento (SOP OPS-08) → Fim

  10. Glossário

Kanban: método de gestão visual de fluxo de trabalho por colunas. Bloqueio: impedimento que impede avanço de uma task. Re-escopo: mudança formal no escopo original do projeto. SLA: Service Level Agreement — prazo acordado de resposta ou entrega.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['operacoes','gestao']::TEXT[], 3, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que todos os projetos em andamento sejam geridos com visibilidade, rastreabilidade e previsibilidade através do fluxo Kanban no Asana, com reuniões de acompanhamento semanais e alertas de risco proativos.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Gestão do ciclo de vida do projeto do kick-off ao encerramento, incluindo atualizações de status, gestão de bloqueios, comunicação com cliente e controle de prazo.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Execução técnica (responsabilidade de cada BU), negociação comercial de novos escopos (SOP OPS-06), onboarding inicial (SOP OPS-03).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Manter Asana atualizado, conduzir reuniões de acompanhamento, reportar riscos

Executor

—

Marco Andolfato

Aprovar decisões de re-escopo, desbloquear impedimentos estratégicos

Aprovador

—

Responsável de BU

Atualizar tasks, reportar bloqueios, entregar no prazo

Executor

—

Cliente

Aprovar entregas intermediárias no prazo combinado

Consultado

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Projeto aberto no Asana com tasks e prazos definidos (SOP OPS-03 concluído); equipe responsável definida; canal de comunicação do projeto ativo.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Asana (board Kanban por projeto), Google Drive, Google Meet, planilha de controle geral de projetos TBO (status semanal).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Manutenção Diária do Kanban', 'Ação: Cada responsável atualiza suas tasks no Asana diariamente: mover entre colunas (A fazer → Em andamento → Revisão interna → Aguardando cliente → Concluído), adicionar comentários de progresso e sinalizar bloqueios com tag [BLOQUEIO].

Responsável: Equipe de BU

Output: Asana atualizado diariamente

Prazo referência: Diário', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Reunião Semanal de Acompanhamento (Interna)', 'Ação: Carol conduz reunião semanal de 30min com responsáveis de BU: revisar status de todos os projetos ativos, identificar projetos em risco de atraso (>2 dias do prazo original), definir ação corretiva para cada bloqueio.

Responsável: Carol (Ops) + Líderes de BU

Output: Ata semanal com status e ações corretivas

Prazo referência: Toda segunda-feira', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Atualização de Status ao Cliente', 'Ação: Carol envia update semanal ao cliente para projetos com prazo de entrega em até 2 semanas: resumo do andamento, próxima entrega intermediária esperada, eventuais ajustes de prazo justificados.

Responsável: Carol (Ops)

Output: Cliente informado semanalmente

Prazo referência: Toda sexta-feira', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Gestão de Entregas para Aprovação do Cliente', 'Ação: Quando task atinge coluna ''Aguardando cliente'', Carol notifica cliente com link de acesso (frame.io, Drive ou Asana), prazo de resposta (48–72h) e instrução de como aprovar ou comentar. Registrar data de envio.

Responsável: Carol (Ops)

Output: Aprovação do cliente rastreada

Prazo referência: No momento da entrega intermediária', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Gestão de Riscos e Re-escopo', 'Ação: Quando projeto sinaliza risco de atraso >3 dias úteis ou mudança de escopo pelo cliente, Carol aciona Marco; juntos avaliam impacto, comunicam ao cliente e registram no Asana o motivo do ajuste de prazo ou custo adicional.

Responsável: Carol (Ops) + Marco Andolfato

Output: Risco registrado e plano de ação documentado

Prazo referência: Assim que identificado', 10, 'warning');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Nenhum projeto com task sem atualização há mais de 2 dias; [ ] Reunião semanal realizada e ata registrada; [ ] Cliente com entregas pendentes avisado com prazo claro; [ ] Todo re-escopo documentado no Asana; [ ] Projetos em risco sinalizados com cor/tag no Asana.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Asana não atualizado → gestão cega, surpresas negativas. Sem reunião semanal → problemas acumulam sem solução. Cliente sem update → ansiedade e desconfiança. Re-escopo sem registro → conflito sobre o que foi ou não acordado.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Asana, Google Drive, Google Meet, frame.io, planilha de controle de projetos.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Atualização de task no Asana: diária. Reunião semanal: toda segunda-feira. Update ao cliente: toda sexta para projetos ativos. Prazo de resposta do cliente: 48–72h.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Projeto Aberto no Asana → Execução Diária (tasks) → Reunião Semanal → Update ao Cliente (sextas) → Entrega Intermediária → Aprovação do Cliente → Próxima Fase → ... → Encerramento (SOP OPS-08) → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Kanban: método de gestão visual de fluxo de trabalho por colunas. Bloqueio: impedimento que impede avanço de uma task. Re-escopo: mudança formal no escopo original do projeto. SLA: Service Level Agreement — prazo acordado de resposta ou entrega.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-OPS-005
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Controle Financeiro Faturas e Centros de Custo', 'tbo-ops-005-controle-financeiro-faturas-e-centros-de-custo', 'operacoes', 'checklist', 'Controle Financeiro (Faturas e Centros de Custo)', 'Standard Operating Procedure

Controle Financeiro (Faturas e Centros de Custo)

Código

TBO-OPS-005

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

Garantir a emissão correta e pontual de notas fiscais, controle de contas a receber, categorização de despesas por centro de custo e disponibilidade de relatório financeiro mensal para tomada de decisão.

  2. Escopo

2.1 O que está coberto

Emissão de NF-e, controle de recebíveis, categorização de despesas por BU/projeto, conciliação bancária básica e relatório mensal de resultado por centro de custo.

2.2 Exclusões

Contabilidade fiscal e apuração de impostos (responsabilidade do contador externo), folha de pagamento (RH), investimentos e captação de recursos.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Emitir NFs, controlar recebíveis, categorizar despesas, preparar relatório

Executor

—

Marco Andolfato

Aprovar despesas acima de R$500, revisar relatório mensal

Aprovador

—

Contador Externo

Apuração fiscal, obrigações acessórias, SPED

Consultado

Informado

Líderes de BU

Informar despesas de projeto e aprovações de compra

Executor

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Contrato do cliente com valores e condições de pagamento; notas de despesas e recibos organizados por BU; acesso ao sistema de emissão de NF (Prefeitura ou emissor como NFE.io); planilha financeira TBO atualizada.

4.2 Ferramentas e Acessos

NFE.io ou sistema municipal de emissão de NFS-e, planilha financeira Google Sheets (modelo TBO), Supabase (registro de transações), internet banking, Google Drive (/financeiro).



  5. Procedimento Passo a Passo

5.1. Emissão de Nota Fiscal

Ação: Ao concluir entrega faturável (conforme contrato), Carol emite NFS-e no sistema municipal informando: tomador, descrição do serviço, valor, alíquotas de imposto. Envia PDF ao cliente por e-mail. Registra na planilha de recebíveis.

Responsável: Carol (Ops)

Output: NF emitida, enviada ao cliente e registrada

Prazo referência: Até 2 dias úteis após entrega aprovada

5.2. Controle de Recebíveis

Ação: Carol atualiza planilha de recebíveis semanalmente: marcar NFs pagas, identificar NFs em atraso (>5 dias do vencimento), acionar cliente via WhatsApp para cobrança amigável; escalar para Marco se atraso >15 dias.

Responsável: Carol (Ops)

Output: Planilha de recebíveis atualizada

Prazo referência: Toda sexta-feira

5.3. Categorização de Despesas

Ação: Ao realizar qualquer despesa de projeto, Carol (ou líder de BU) registra na planilha: data, valor, fornecedor, centro de custo (BU: AV / GAM / OPS / ADM), projeto vinculado, comprovante no Drive. Despesas >R$500 exigem aprovação de Marco.

Responsável: Carol (Ops) + Líderes de BU

Output: Despesas categorizadas em tempo real

Prazo referência: No mesmo dia da despesa

5.4. Conciliação Bancária (Quinzenal)

Ação: Carol compara extrato bancário com planilha de recebíveis e despesas: identificar recebimentos não registrados, despesas não categorizadas e transferências internas; ajustar planilha.

Responsável: Carol (Ops)

Output: Planilha conciliada com extrato bancário

Prazo referência: Dias 15 e último dia do mês

5.5. Relatório Mensal de Resultado

Ação: Nos primeiros 5 dias úteis do mês seguinte, Carol prepara relatório: receita por cliente e BU, despesas por centro de custo, margem por BU, inadimplência, comparativo com mês anterior. Apresentar a Marco em reunião de 30min.

Responsável: Carol (Ops) + Marco Andolfato

Output: Relatório mensal aprovado por Marco

Prazo referência: Até o 5º dia útil do mês seguinte

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] NF emitida em até 2 dias após entrega aprovada; [ ] Zero NFs enviadas com dados do cliente incorretos; [ ] Todas as despesas com comprovante no Drive; [ ] Conciliação bancária realizada 2x por mês; [ ] Relatório mensal entregue até o 5º dia útil.

6.2 Erros Comuns a Evitar

NF emitida com CNPJ errado do cliente → cancelamento e reemissão, atraso no pagamento. Despesa sem comprovante → impossibilidade de dedução fiscal. Recebível em atraso não cobrado → fluxo de caixa negativo. Relatório mensal atrasado → decisões sem base financeira.

  7. Ferramentas e Templates

NFE.io, Google Sheets, Supabase, Internet Banking, Google Drive.

  8. SLAs e Prazos

Emissão de NF: 2 dias úteis pós-entrega. Atualização de recebíveis: semanal (sextas). Categorização de despesa: no mesmo dia. Relatório mensal: até 5º dia útil.

  9. Fluxograma

Início → Entrega Aprovada → Emissão de NF → Envio ao Cliente → Controle de Recebível → Pagamento Recebido (ou Cobrança) → Despesas Categorizadas → Conciliação Quinzenal → Relatório Mensal → Marco Revisa → Fim

  10. Glossário

NFS-e: Nota Fiscal de Serviços eletrônica. Recebível: valor a receber de cliente já faturado. Centro de custo: categoria de agrupamento de despesas por área ou projeto. Conciliação bancária: processo de comparar registros internos com extrato bancário.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'high', ARRAY['operacoes','gestao']::TEXT[], 4, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir a emissão correta e pontual de notas fiscais, controle de contas a receber, categorização de despesas por centro de custo e disponibilidade de relatório financeiro mensal para tomada de decisão.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Emissão de NF-e, controle de recebíveis, categorização de despesas por BU/projeto, conciliação bancária básica e relatório mensal de resultado por centro de custo.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Contabilidade fiscal e apuração de impostos (responsabilidade do contador externo), folha de pagamento (RH), investimentos e captação de recursos.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Emitir NFs, controlar recebíveis, categorizar despesas, preparar relatório

Executor

—

Marco Andolfato

Aprovar despesas acima de R$500, revisar relatório mensal

Aprovador

—

Contador Externo

Apuração fiscal, obrigações acessórias, SPED

Consultado

Informado

Líderes de BU

Informar despesas de projeto e aprovações de compra

Executor

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato do cliente com valores e condições de pagamento; notas de despesas e recibos organizados por BU; acesso ao sistema de emissão de NF (Prefeitura ou emissor como NFE.io); planilha financeira TBO atualizada.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'NFE.io ou sistema municipal de emissão de NFS-e, planilha financeira Google Sheets (modelo TBO), Supabase (registro de transações), internet banking, Google Drive (/financeiro).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Emissão de Nota Fiscal', 'Ação: Ao concluir entrega faturável (conforme contrato), Carol emite NFS-e no sistema municipal informando: tomador, descrição do serviço, valor, alíquotas de imposto. Envia PDF ao cliente por e-mail. Registra na planilha de recebíveis.

Responsável: Carol (Ops)

Output: NF emitida, enviada ao cliente e registrada

Prazo referência: Até 2 dias úteis após entrega aprovada', 6, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Controle de Recebíveis', 'Ação: Carol atualiza planilha de recebíveis semanalmente: marcar NFs pagas, identificar NFs em atraso (>5 dias do vencimento), acionar cliente via WhatsApp para cobrança amigável; escalar para Marco se atraso >15 dias.

Responsável: Carol (Ops)

Output: Planilha de recebíveis atualizada

Prazo referência: Toda sexta-feira', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Categorização de Despesas', 'Ação: Ao realizar qualquer despesa de projeto, Carol (ou líder de BU) registra na planilha: data, valor, fornecedor, centro de custo (BU: AV / GAM / OPS / ADM), projeto vinculado, comprovante no Drive. Despesas >R$500 exigem aprovação de Marco.

Responsável: Carol (Ops) + Líderes de BU

Output: Despesas categorizadas em tempo real

Prazo referência: No mesmo dia da despesa', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Conciliação Bancária (Quinzenal)', 'Ação: Carol compara extrato bancário com planilha de recebíveis e despesas: identificar recebimentos não registrados, despesas não categorizadas e transferências internas; ajustar planilha.

Responsável: Carol (Ops)

Output: Planilha conciliada com extrato bancário

Prazo referência: Dias 15 e último dia do mês', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Relatório Mensal de Resultado', 'Ação: Nos primeiros 5 dias úteis do mês seguinte, Carol prepara relatório: receita por cliente e BU, despesas por centro de custo, margem por BU, inadimplência, comparativo com mês anterior. Apresentar a Marco em reunião de 30min.

Responsável: Carol (Ops) + Marco Andolfato

Output: Relatório mensal aprovado por Marco

Prazo referência: Até o 5º dia útil do mês seguinte', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] NF emitida em até 2 dias após entrega aprovada; [ ] Zero NFs enviadas com dados do cliente incorretos; [ ] Todas as despesas com comprovante no Drive; [ ] Conciliação bancária realizada 2x por mês; [ ] Relatório mensal entregue até o 5º dia útil.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'NF emitida com CNPJ errado do cliente → cancelamento e reemissão, atraso no pagamento. Despesa sem comprovante → impossibilidade de dedução fiscal. Recebível em atraso não cobrado → fluxo de caixa negativo. Relatório mensal atrasado → decisões sem base financeira.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'NFE.io, Google Sheets, Supabase, Internet Banking, Google Drive.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Emissão de NF: 2 dias úteis pós-entrega. Atualização de recebíveis: semanal (sextas). Categorização de despesa: no mesmo dia. Relatório mensal: até 5º dia útil.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Entrega Aprovada → Emissão de NF → Envio ao Cliente → Controle de Recebível → Pagamento Recebido (ou Cobrança) → Despesas Categorizadas → Conciliação Quinzenal → Relatório Mensal → Marco Revisa → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'NFS-e: Nota Fiscal de Serviços eletrônica. Recebível: valor a receber de cliente já faturado. Centro de custo: categoria de agrupamento de despesas por área ou projeto. Conciliação bancária: processo de comparar registros internos com extrato bancário.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-OPS-006
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Precificação e Proposta Comercial', 'tbo-ops-006-precificacao-e-proposta-comercial', 'operacoes', 'checklist', 'Precificação e Proposta Comercial', 'Standard Operating Procedure

Precificação e Proposta Comercial

Código

TBO-OPS-006

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

Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.

  2. Escopo

2.1 O que está coberto

Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.

2.2 Exclusões

Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coletar informações, calcular estimativa, montar documento de proposta

Executor

—

Marco Andolfato

Validar escopo, aprovar precificação, assinar proposta final

Aprovador

—

Líder de BU

Estimar esforço técnico e prazo realista por tipo de entrega

Consultado

—

Cliente / Prospect

Fornecer briefing comercial, receber e analisar proposta

Informado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.

4.2 Ferramentas e Acessos

Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.



  5. Procedimento Passo a Passo

5.1. Recebimento e Análise do Briefing Comercial

Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.

Responsável: Carol (Ops) + Marco Andolfato

Output: Briefing comercial registrado

Prazo referência: Dia 1

5.2. Estimativa de Esforço por BU

Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.

Responsável: Carol (Ops) + Líderes de BU

Output: Estimativa de esforço por BU validada

Prazo referência: Dia 2

5.3. Cálculo de Preço

Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).

Responsável: Carol (Ops) + Marco Andolfato

Output: Preço calculado e aprovado por Marco

Prazo referência: Dia 2–3

5.4. Elaboração da Proposta

Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).

Responsável: Carol (Ops)

Output: Proposta elaborada em PDF

Prazo referência: Dia 3–4

5.5. Aprovação Interna e Envio

Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.

Responsável: Marco Andolfato + Carol (Ops)

Output: Proposta enviada ao cliente

Prazo referência: Dia 4–5

5.6. Follow-up e Fechamento

Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.

Responsável: Carol (Ops) + Marco Andolfato

Output: Proposta aceita → contrato iniciado / Negada → motivo registrado

Prazo referência: Dia 7 (2 dias após envio)

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.

6.2 Erros Comuns a Evitar

Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.

  7. Ferramentas e Templates

Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).

  8. SLAs e Prazos

Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.

  9. Fluxograma

Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim

  10. Glossário

Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['operacoes','gestao']::TEXT[], 5, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coletar informações, calcular estimativa, montar documento de proposta

Executor

—

Marco Andolfato

Validar escopo, aprovar precificação, assinar proposta final

Aprovador

—

Líder de BU

Estimar esforço técnico e prazo realista por tipo de entrega

Consultado

—

Cliente / Prospect

Fornecer briefing comercial, receber e analisar proposta

Informado

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Recebimento e Análise do Briefing Comercial', 'Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.

Responsável: Carol (Ops) + Marco Andolfato

Output: Briefing comercial registrado

Prazo referência: Dia 1', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Estimativa de Esforço por BU', 'Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.

Responsável: Carol (Ops) + Líderes de BU

Output: Estimativa de esforço por BU validada

Prazo referência: Dia 2', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Cálculo de Preço', 'Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).

Responsável: Carol (Ops) + Marco Andolfato

Output: Preço calculado e aprovado por Marco

Prazo referência: Dia 2–3', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Elaboração da Proposta', 'Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).

Responsável: Carol (Ops)

Output: Proposta elaborada em PDF

Prazo referência: Dia 3–4', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Aprovação Interna e Envio', 'Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.

Responsável: Marco Andolfato + Carol (Ops)

Output: Proposta enviada ao cliente

Prazo referência: Dia 4–5', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Follow-up e Fechamento', 'Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.

Responsável: Carol (Ops) + Marco Andolfato

Output: Proposta aceita → contrato iniciado / Negada → motivo registrado

Prazo referência: Dia 7 (2 dias após envio)', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-OPS-007
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Controle de Qualidade Geral QA Cross BU', 'tbo-ops-007-controle-de-qualidade-geral-qa-cross-bu', 'operacoes', 'checklist', 'Controle de Qualidade Geral (QA Cross-BU)', 'Standard Operating Procedure

Controle de Qualidade Geral (QA Cross-BU)

Código

TBO-OPS-007

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

Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.

  2. Escopo

2.1 O que está coberto

Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.

2.2 Exclusões

Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o processo de QA, aplicar checklist, registrar não conformidades

Executor

—

Marco Andolfato

Revisão criativa final (vídeos, peças visuais, aplicações 3D)

Aprovador

—

Responsável de BU

Corrigir não conformidades identificadas no QA

Executor

—

Cliente

Aprovação final após QA interno aprovado

Informado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).

4.2 Ferramentas e Acessos

Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.



  5. Procedimento Passo a Passo

5.1. Sinalização de Prontidão para QA

Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.

Responsável: Responsável de BU

Output: Material disponível para QA com contexto

Prazo referência: Antes do envio ao cliente

5.2. Aplicação do Checklist de QA

Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.

Responsável: Carol (Ops)

Output: Checklist de QA preenchido com resultado

Prazo referência: Até 1 dia útil após sinalização

5.3. Revisão Criativa por Marco (entregas AV e GAM)

Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.

Responsável: Marco Andolfato

Output: Pontos de ajuste criativos registrados

Prazo referência: Até 1 dia útil após checklist de Carol

5.4. Correção de Não Conformidades

Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.

Responsável: Responsável de BU + Carol (Ops)

Output: Não conformidades corrigidas e verificadas

Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)

5.5. Liberação para Envio ao Cliente

Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).

Responsável: Carol (Ops)

Output: Entrega enviada ao cliente com QA aprovado

Prazo referência: Após aprovação do QA

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.

6.2 Erros Comuns a Evitar

Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.

  7. Ferramentas e Templates

Google Sheets (checklists), frame.io, Asana, Google Drive.

  8. SLAs e Prazos

QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.

  9. Fluxograma

Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim

  10. Glossário

QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'critical', ARRAY['operacoes','gestao']::TEXT[], 6, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o processo de QA, aplicar checklist, registrar não conformidades

Executor

—

Marco Andolfato

Revisão criativa final (vídeos, peças visuais, aplicações 3D)

Aprovador

—

Responsável de BU

Corrigir não conformidades identificadas no QA

Executor

—

Cliente

Aprovação final após QA interno aprovado

Informado

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Sinalização de Prontidão para QA', 'Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.

Responsável: Responsável de BU

Output: Material disponível para QA com contexto

Prazo referência: Antes do envio ao cliente', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Aplicação do Checklist de QA', 'Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.

Responsável: Carol (Ops)

Output: Checklist de QA preenchido com resultado

Prazo referência: Até 1 dia útil após sinalização', 7, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Revisão Criativa por Marco (entregas AV e GAM)', 'Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.

Responsável: Marco Andolfato

Output: Pontos de ajuste criativos registrados

Prazo referência: Até 1 dia útil após checklist de Carol', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Correção de Não Conformidades', 'Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.

Responsável: Responsável de BU + Carol (Ops)

Output: Não conformidades corrigidas e verificadas

Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Liberação para Envio ao Cliente', 'Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).

Responsável: Carol (Ops)

Output: Entrega enviada ao cliente com QA aprovado

Prazo referência: Após aprovação do QA', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Sheets (checklists), frame.io, Asana, Google Drive.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-OPS-008
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Encerramento e Pós entrega', 'tbo-ops-008-encerramento-e-pos-entrega', 'operacoes', 'checklist', 'Carol (Coordenadora de Operações)', 'Standard Operating Procedure

Encerramento e Pós-entrega

Código

TBO-OPS-008

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

Garantir que todo projeto seja formalmente encerrado com aceite do cliente, arquivamento completo dos arquivos, coleta de feedback estruturado, registro de aprendizados e ações de relacionamento pós-entrega.

  2. Escopo

2.1 O que está coberto

Processo de encerramento formal após aprovação final do cliente: aceite, arquivamento, pesquisa de satisfação, reunião de retrospectiva interna e ação de relacionamento.

2.2 Exclusões

Suporte e manutenção pós-entrega (definidos no contrato separadamente), renovação ou novo escopo (inicia novo SOP OPS-03).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar encerramento, arquivamento, pesquisa de satisfação

Executor

—

Marco Andolfato

Conduzir retrospectiva interna, aprovar aprendizados

Aprovador

—

Responsável de BU

Participar da retrospectiva, arquivar projeto técnico

Executor

—

Cliente

Assinar aceite, responder pesquisa de satisfação

Consultado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Aprovação final do cliente documentada (e-mail ou assinatura); todos os arquivos finais entregues e confirmados; histórico de tasks no Asana concluído.

4.2 Ferramentas e Acessos

Google Drive (estrutura de arquivamento), Asana, Google Forms (pesquisa de NPS), planilha de histórico de projetos TBO, Gmail.



  5. Procedimento Passo a Passo

5.1. Confirmação de Aceite Final

Ação: Carol confirma com o cliente por escrito (e-mail) que todos os entregáveis foram recebidos, aprovados e não há pendências; solicita resposta de aceite formal. Registrar data de aceite no Asana e planilha de projetos.

Responsável: Carol (Ops) + Cliente

Output: Aceite formal registrado

Prazo referência: Até 2 dias após última entrega aprovada

5.2. Arquivamento Completo

Ação: Responsável de BU organiza pasta final do projeto no Drive: /entregas (arquivos finais aprovados), /projeto (arquivos de trabalho: Premiere, Unreal, Figma etc.), /aprovações (histórico de aprovações do cliente), /financeiro (NFs emitidas); confirmar com Carol.

Responsável: Responsável de BU + Carol (Ops)

Output: Projeto arquivado com estrutura completa

Prazo referência: Até 3 dias após aceite

5.3. Pesquisa de Satisfação (NPS)

Ação: Carol envia Google Forms de NPS ao cliente (10 perguntas: qualidade, prazo, comunicação, relação custo-benefício, recomendaria a TBO, comentário livre); aguardar resposta por 5 dias; registrar resultado na planilha de NPS.

Responsável: Carol (Ops)

Output: NPS registrado

Prazo referência: Enviado no dia do aceite, aguardar 5 dias

5.4. Retrospectiva Interna

Ação: Marco conduz reunião de retrospectiva de 45min com a equipe do projeto: o que funcionou bem, o que pode melhorar, gargalos identificados, aprendizados técnicos. Carol registra no documento de aprendizados TBO (Drive).

Responsável: Marco Andolfato + Equipe do Projeto

Output: Documento de aprendizados registrado

Prazo referência: Até 5 dias após aceite

5.5. Ação de Relacionamento Pós-entrega

Ação: Marco ou Carol realiza contato de follow-up 30 dias após entrega: verificar se a entrega está performando bem (vídeo gerando leads, app funcionando no stand), oferecer próximos passos (novas pílulas, atualização de disponibilidade, segunda fase). Registrar no CRM.

Responsável: Marco Andolfato + Carol (Ops)

Output: Follow-up 30 dias realizado e registrado

Prazo referência: 30 dias após aceite

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Aceite formal recebido por escrito; [ ] Pasta do Drive com todos os arquivos organizados; [ ] NPS enviado e resultado registrado; [ ] Retrospectiva realizada com documento de aprendizados; [ ] Projeto marcado como concluído no Asana; [ ] Follow-up 30 dias agendado no momento do aceite.

6.2 Erros Comuns a Evitar

Projeto encerrado sem aceite formal → cliente reabre demandas como se fossem do mesmo projeto. Arquivos desorganizados → impossibilidade de reutilizar assets em futuros projetos. Sem retrospectiva → mesmos erros se repetem nos próximos projetos. Follow-up não realizado → oportunidade de renovação perdida.

  7. Ferramentas e Templates

Google Drive, Asana, Google Forms, Gmail, planilha de NPS, planilha de histórico de projetos.

  8. SLAs e Prazos

Aceite formal: 2 dias após última entrega. Arquivamento: 3 dias após aceite. NPS enviado: no dia do aceite. Retrospectiva: até 5 dias após aceite. Follow-up 30 dias: agendado no momento do aceite.

  9. Fluxograma

Início → Aprovação Final do Cliente → Aceite Formal (e-mail) → Arquivamento Completo → NPS Enviado → Retrospectiva Interna → Documento de Aprendizados → Projeto Concluído no Asana → Follow-up 30 dias → Fim

  10. Glossário

NPS: Net Promoter Score — métrica de satisfação e lealdade do cliente (0–10). Aceite formal: confirmação escrita pelo cliente de que a entrega está completa e aprovada. Retrospectiva: reunião estruturada de revisão do projeto para gerar aprendizados. Follow-up pós-entrega: contato proativo após entrega para verificar resultado e identificar oportunidades.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'high', ARRAY['operacoes','gestao']::TEXT[], 7, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo projeto seja formalmente encerrado com aceite do cliente, arquivamento completo dos arquivos, coleta de feedback estruturado, registro de aprendizados e ações de relacionamento pós-entrega.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Processo de encerramento formal após aprovação final do cliente: aceite, arquivamento, pesquisa de satisfação, reunião de retrospectiva interna e ação de relacionamento.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Suporte e manutenção pós-entrega (definidos no contrato separadamente), renovação ou novo escopo (inicia novo SOP OPS-03).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar encerramento, arquivamento, pesquisa de satisfação

Executor

—

Marco Andolfato

Conduzir retrospectiva interna, aprovar aprendizados

Aprovador

—

Responsável de BU

Participar da retrospectiva, arquivar projeto técnico

Executor

—

Cliente

Assinar aceite, responder pesquisa de satisfação

Consultado

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Aprovação final do cliente documentada (e-mail ou assinatura); todos os arquivos finais entregues e confirmados; histórico de tasks no Asana concluído.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive (estrutura de arquivamento), Asana, Google Forms (pesquisa de NPS), planilha de histórico de projetos TBO, Gmail.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Confirmação de Aceite Final', 'Ação: Carol confirma com o cliente por escrito (e-mail) que todos os entregáveis foram recebidos, aprovados e não há pendências; solicita resposta de aceite formal. Registrar data de aceite no Asana e planilha de projetos.

Responsável: Carol (Ops) + Cliente

Output: Aceite formal registrado

Prazo referência: Até 2 dias após última entrega aprovada', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Arquivamento Completo', 'Ação: Responsável de BU organiza pasta final do projeto no Drive: /entregas (arquivos finais aprovados), /projeto (arquivos de trabalho: Premiere, Unreal, Figma etc.), /aprovações (histórico de aprovações do cliente), /financeiro (NFs emitidas); confirmar com Carol.

Responsável: Responsável de BU + Carol (Ops)

Output: Projeto arquivado com estrutura completa

Prazo referência: Até 3 dias após aceite', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Pesquisa de Satisfação (NPS)', 'Ação: Carol envia Google Forms de NPS ao cliente (10 perguntas: qualidade, prazo, comunicação, relação custo-benefício, recomendaria a TBO, comentário livre); aguardar resposta por 5 dias; registrar resultado na planilha de NPS.

Responsável: Carol (Ops)

Output: NPS registrado

Prazo referência: Enviado no dia do aceite, aguardar 5 dias', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Retrospectiva Interna', 'Ação: Marco conduz reunião de retrospectiva de 45min com a equipe do projeto: o que funcionou bem, o que pode melhorar, gargalos identificados, aprendizados técnicos. Carol registra no documento de aprendizados TBO (Drive).

Responsável: Marco Andolfato + Equipe do Projeto

Output: Documento de aprendizados registrado

Prazo referência: Até 5 dias após aceite', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Ação de Relacionamento Pós-entrega', 'Ação: Marco ou Carol realiza contato de follow-up 30 dias após entrega: verificar se a entrega está performando bem (vídeo gerando leads, app funcionando no stand), oferecer próximos passos (novas pílulas, atualização de disponibilidade, segunda fase). Registrar no CRM.

Responsável: Marco Andolfato + Carol (Ops)

Output: Follow-up 30 dias realizado e registrado

Prazo referência: 30 dias após aceite', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Aceite formal recebido por escrito; [ ] Pasta do Drive com todos os arquivos organizados; [ ] NPS enviado e resultado registrado; [ ] Retrospectiva realizada com documento de aprendizados; [ ] Projeto marcado como concluído no Asana; [ ] Follow-up 30 dias agendado no momento do aceite.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Projeto encerrado sem aceite formal → cliente reabre demandas como se fossem do mesmo projeto. Arquivos desorganizados → impossibilidade de reutilizar assets em futuros projetos. Sem retrospectiva → mesmos erros se repetem nos próximos projetos. Follow-up não realizado → oportunidade de renovação perdida.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive, Asana, Google Forms, Gmail, planilha de NPS, planilha de histórico de projetos.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Aceite formal: 2 dias após última entrega. Arquivamento: 3 dias após aceite. NPS enviado: no dia do aceite. Retrospectiva: até 5 dias após aceite. Follow-up 30 dias: agendado no momento do aceite.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Aprovação Final do Cliente → Aceite Formal (e-mail) → Arquivamento Completo → NPS Enviado → Retrospectiva Interna → Documento de Aprendizados → Projeto Concluído no Asana → Follow-up 30 dias → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'NPS: Net Promoter Score — métrica de satisfação e lealdade do cliente (0–10). Aceite formal: confirmação escrita pelo cliente de que a entrega está completa e aprovada. Retrospectiva: reunião estruturada de revisão do projeto para gerar aprendizados. Follow-up pós-entrega: contato proativo após entrega para verificar resultado e identificar oportunidades.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

END $$;
