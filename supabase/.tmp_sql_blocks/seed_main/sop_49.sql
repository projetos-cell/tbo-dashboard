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
    'Onboarding de Novo Colaborador',
    'tbo-ops-001-onboarding-de-novo-colaborador',
    'operacoes',
    'checklist',
    'Carol (Coordenadora de Operações)',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Onboarding de Novo Colaborador</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que todo novo colaborador da TBO seja integrado de forma estruturada nos primeiros 30 dias, compreendendo cultura, ferramentas, processos e responsabilidades antes de assumir projetos de forma independente.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Processo de integração do momento da contratação até o fim do período de onboarding (30 dias), cobrindo cultura TBO, stack de ferramentas, acompanhamento por mentor e avaliação de conclusão.</p><p><strong>2.2 Exclusões</strong></p><p>Processo seletivo e contratação (pré-onboarding), treinamentos técnicos específicos de BU (responsabilidade de cada líder de área), férias e benefícios (RH).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar todo o processo de onboarding, materiais e agenda</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Apresentar cultura, valores TBO e missão estratégica</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Mentor técnico do novo colaborador</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Novo Colaborador</p></td><td><p>Participar ativamente, completar checklist, tirar dúvidas</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado; e-mail corporativo criado; acesso ao Google Workspace, Asana e Supabase configurado; kit de boas-vindas preparado; agenda dos primeiros 5 dias montada.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Workspace (Drive, Agenda, Meet), Asana, Supabase (acesso por role), Slack (ou WhatsApp corporativo), plataforma de documentação interna.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Preparação Pré-chegada (D-2)</strong></p><p>Ação: Carol configura acessos (e-mail, Asana, Drive, Supabase com role correto); prepara pasta de onboarding no Drive com: contrato de trabalho, guia de cultura, organograma, lista de ferramentas e credenciais; agenda reunião de boas-vindas com Marco.</p><p>Responsável: Carol (Ops)</p><p>Output: Acessos configurados, pasta Drive pronta, agenda bloqueada</p><p>Prazo referência: 2 dias antes da entrada</p><p><strong>5.2. Dia 1 — Boas-vindas e Cultura</strong></p><p>Ação: Marco apresenta a TBO: história, missão ''think, build, own'', valores, clientes atuais, posicionamento no mercado imobiliário e o que diferencia a agência. Tour pelo espaço (presencial ou virtual). Carol apresenta equipe e ferramentas.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Colaborador ambientado culturalmente</p><p>Prazo referência: Dia 1</p><p><strong>5.3. Semana 1 — Ferramentas e Processos</strong></p><p>Ação: Líder de BU conduz treinamento de ferramentas da área (Premiere, Unreal, Asana etc.); Carol orienta sobre processos operacionais: abertura de projeto, comunicação com cliente, registro de horas, gestão de arquivos no Drive.</p><p>Responsável: Líder de BU + Carol (Ops)</p><p>Output: Checklist de ferramentas concluído</p><p>Prazo referência: Dia 2–5</p><p><strong>5.4. Semana 2–3 — Imersão em Projeto Real</strong></p><p>Ação: Novo colaborador participa de projeto real em andamento como observador/apoio (não responsável); líder de BU realiza daily check-in de 15min; Carol acompanha registro no Asana.</p><p>Responsável: Líder de BU + Novo Colaborador</p><p>Output: Participação documentada em projeto real</p><p>Prazo referência: Dia 6–15</p><p><strong>5.5. Semana 4 — Avaliação e Feedback</strong></p><p>Ação: Carol e líder de BU realizam avaliação formal: checklist de competências esperadas, feedback 360° (Marco incluso), alinhamento de expectativas para o período pós-onboarding; registrar no Supabase.</p><p>Responsável: Carol (Ops) + Líder de BU + Marco</p><p>Output: Avaliação registrada, plano de desenvolvimento definido</p><p>Prazo referência: Dia 25–30</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todos os acessos configurados antes do Dia 1; [ ] Agenda da primeira semana montada e enviada ao colaborador; [ ] Guia de cultura entregue e discutido; [ ] Checklist de ferramentas 100% concluído; [ ] Avaliação de 30 dias realizada e registrada no sistema.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Colaborador sem acesso às ferramentas no Dia 1 → primeira impressão negativa e improdutividade. Onboarding apenas informal → não internaliza processos, gera retrabalho futuro. Sem mentor definido → colaborador perdido nas primeiras semanas.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Workspace, Asana, Supabase, Slack/WhatsApp corporativo, documentação interna.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Configuração de acessos: 2 dias antes da entrada. Avaliação formal: até 30 dias após início. Duração total do onboarding: 30 dias corridos.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Preparação D-2 (acessos + pasta Drive) → Dia 1 (boas-vindas + cultura) → Semana 1 (ferramentas + processos) → Semanas 2–3 (imersão em projeto real) → Semana 4 (avaliação + feedback) → Onboarding Concluído → Fim</p><p><strong>  10. Glossário</strong></p><p>Role: permissão de acesso no sistema (ex.: colaborador, diretoria, founder). Checklist de ferramentas: lista de ferramentas que o colaborador deve dominar ao fim do onboarding. 360°: feedback dado por pares, líderes e liderados simultaneamente.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-OPS-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo novo colaborador da TBO seja integrado de forma estruturada nos primeiros 30 dias, compreendendo cultura, ferramentas, processos e responsabilidades antes de assumir projetos de forma independente.', '<p>Garantir que todo novo colaborador da TBO seja integrado de forma estruturada nos primeiros 30 dias, compreendendo cultura, ferramentas, processos e responsabilidades antes de assumir projetos de forma independente.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Processo de integração do momento da contratação até o fim do período de onboarding (30 dias), cobrindo cultura TBO, stack de ferramentas, acompanhamento por mentor e avaliação de conclusão.', '<p>Processo de integração do momento da contratação até o fim do período de onboarding (30 dias), cobrindo cultura TBO, stack de ferramentas, acompanhamento por mentor e avaliação de conclusão.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Processo seletivo e contratação (pré-onboarding), treinamentos técnicos específicos de BU (responsabilidade de cada líder de área), férias e benefícios (RH).', '<p>Processo seletivo e contratação (pré-onboarding), treinamentos técnicos específicos de BU (responsabilidade de cada líder de área), férias e benefícios (RH).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar todo o processo de onboarding, materiais e agenda</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Apresentar cultura, valores TBO e missão estratégica</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Mentor técnico do novo colaborador</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Novo Colaborador</p></td><td><p>Participar ativamente, completar checklist, tirar dúvidas</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; e-mail corporativo criado; acesso ao Google Workspace, Asana e Supabase configurado; kit de boas-vindas preparado; agenda dos primeiros 5 dias montada.', '<p>Contrato assinado; e-mail corporativo criado; acesso ao Google Workspace, Asana e Supabase configurado; kit de boas-vindas preparado; agenda dos primeiros 5 dias montada.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Workspace (Drive, Agenda, Meet), Asana, Supabase (acesso por role), Slack (ou WhatsApp corporativo), plataforma de documentação interna.', '<p>Google Workspace (Drive, Agenda, Meet), Asana, Supabase (acesso por role), Slack (ou WhatsApp corporativo), plataforma de documentação interna.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Preparação Pré-chegada (D-2)', 'Ação: Carol configura acessos (e-mail, Asana, Drive, Supabase com role correto); prepara pasta de onboarding no Drive com: contrato de trabalho, guia de cultura, organograma, lista de ferramentas e credenciais; agenda reunião de boas-vindas com Marco.

Responsável: Carol (Ops)

Output: Acessos configurados, pasta Drive pronta, agenda bloqueada

Prazo referência: 2 dias antes da entrada', '<p>Ação: Carol configura acessos (e-mail, Asana, Drive, Supabase com role correto); prepara pasta de onboarding no Drive com: contrato de trabalho, guia de cultura, organograma, lista de ferramentas e credenciais; agenda reunião de boas-vindas com Marco.</p><p>Responsável: Carol (Ops)</p><p>Output: Acessos configurados, pasta Drive pronta, agenda bloqueada</p><p>Prazo referência: 2 dias antes da entrada</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Dia 1 — Boas-vindas e Cultura', 'Ação: Marco apresenta a TBO: história, missão ''think, build, own'', valores, clientes atuais, posicionamento no mercado imobiliário e o que diferencia a agência. Tour pelo espaço (presencial ou virtual). Carol apresenta equipe e ferramentas.

Responsável: Marco Andolfato + Carol (Ops)

Output: Colaborador ambientado culturalmente

Prazo referência: Dia 1', '<p>Ação: Marco apresenta a TBO: história, missão ''think, build, own'', valores, clientes atuais, posicionamento no mercado imobiliário e o que diferencia a agência. Tour pelo espaço (presencial ou virtual). Carol apresenta equipe e ferramentas.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Colaborador ambientado culturalmente</p><p>Prazo referência: Dia 1</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Semana 1 — Ferramentas e Processos', 'Ação: Líder de BU conduz treinamento de ferramentas da área (Premiere, Unreal, Asana etc.); Carol orienta sobre processos operacionais: abertura de projeto, comunicação com cliente, registro de horas, gestão de arquivos no Drive.

Responsável: Líder de BU + Carol (Ops)

Output: Checklist de ferramentas concluído

Prazo referência: Dia 2–5', '<p>Ação: Líder de BU conduz treinamento de ferramentas da área (Premiere, Unreal, Asana etc.); Carol orienta sobre processos operacionais: abertura de projeto, comunicação com cliente, registro de horas, gestão de arquivos no Drive.</p><p>Responsável: Líder de BU + Carol (Ops)</p><p>Output: Checklist de ferramentas concluído</p><p>Prazo referência: Dia 2–5</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Semana 2–3 — Imersão em Projeto Real', 'Ação: Novo colaborador participa de projeto real em andamento como observador/apoio (não responsável); líder de BU realiza daily check-in de 15min; Carol acompanha registro no Asana.

Responsável: Líder de BU + Novo Colaborador

Output: Participação documentada em projeto real

Prazo referência: Dia 6–15', '<p>Ação: Novo colaborador participa de projeto real em andamento como observador/apoio (não responsável); líder de BU realiza daily check-in de 15min; Carol acompanha registro no Asana.</p><p>Responsável: Líder de BU + Novo Colaborador</p><p>Output: Participação documentada em projeto real</p><p>Prazo referência: Dia 6–15</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Semana 4 — Avaliação e Feedback', 'Ação: Carol e líder de BU realizam avaliação formal: checklist de competências esperadas, feedback 360° (Marco incluso), alinhamento de expectativas para o período pós-onboarding; registrar no Supabase.

Responsável: Carol (Ops) + Líder de BU + Marco

Output: Avaliação registrada, plano de desenvolvimento definido

Prazo referência: Dia 25–30', '<p>Ação: Carol e líder de BU realizam avaliação formal: checklist de competências esperadas, feedback 360° (Marco incluso), alinhamento de expectativas para o período pós-onboarding; registrar no Supabase.</p><p>Responsável: Carol (Ops) + Líder de BU + Marco</p><p>Output: Avaliação registrada, plano de desenvolvimento definido</p><p>Prazo referência: Dia 25–30</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os acessos configurados antes do Dia 1; [ ] Agenda da primeira semana montada e enviada ao colaborador; [ ] Guia de cultura entregue e discutido; [ ] Checklist de ferramentas 100% concluído; [ ] Avaliação de 30 dias realizada e registrada no sistema.', '<p>[ ] Todos os acessos configurados antes do Dia 1; [ ] Agenda da primeira semana montada e enviada ao colaborador; [ ] Guia de cultura entregue e discutido; [ ] Checklist de ferramentas 100% concluído; [ ] Avaliação de 30 dias realizada e registrada no sistema.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Colaborador sem acesso às ferramentas no Dia 1 → primeira impressão negativa e improdutividade. Onboarding apenas informal → não internaliza processos, gera retrabalho futuro. Sem mentor definido → colaborador perdido nas primeiras semanas.', '<p>Colaborador sem acesso às ferramentas no Dia 1 → primeira impressão negativa e improdutividade. Onboarding apenas informal → não internaliza processos, gera retrabalho futuro. Sem mentor definido → colaborador perdido nas primeiras semanas.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Workspace, Asana, Supabase, Slack/WhatsApp corporativo, documentação interna.', '<p>Google Workspace, Asana, Supabase, Slack/WhatsApp corporativo, documentação interna.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Configuração de acessos: 2 dias antes da entrada. Avaliação formal: até 30 dias após início. Duração total do onboarding: 30 dias corridos.', '<p>Configuração de acessos: 2 dias antes da entrada. Avaliação formal: até 30 dias após início. Duração total do onboarding: 30 dias corridos.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Preparação D-2 (acessos + pasta Drive) → Dia 1 (boas-vindas + cultura) → Semana 1 (ferramentas + processos) → Semanas 2–3 (imersão em projeto real) → Semana 4 (avaliação + feedback) → Onboarding Concluído → Fim', '<p>Início → Preparação D-2 (acessos + pasta Drive) → Dia 1 (boas-vindas + cultura) → Semana 1 (ferramentas + processos) → Semanas 2–3 (imersão em projeto real) → Semana 4 (avaliação + feedback) → Onboarding Concluído → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Role: permissão de acesso no sistema (ex.: colaborador, diretoria, founder). Checklist de ferramentas: lista de ferramentas que o colaborador deve dominar ao fim do onboarding. 360°: feedback dado por pares, líderes e liderados simultaneamente.', '<p>Role: permissão de acesso no sistema (ex.: colaborador, diretoria, founder). Checklist de ferramentas: lista de ferramentas que o colaborador deve dominar ao fim do onboarding. 360°: feedback dado por pares, líderes e liderados simultaneamente.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-002: Onboarding de Novo Cliente ──
END $$;