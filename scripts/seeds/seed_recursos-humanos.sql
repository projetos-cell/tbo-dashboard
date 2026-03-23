-- Seed: recursos-humanos (4 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-RH-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Recrutamento e Selecao', 'tbo-rh-001-recrutamento-e-selecao', 'recursos-humanos', 'checklist', 'Marco Andolfato (Dir. Operações)', 'Standard Operating Procedure

Recrutamento e Seleção

Código

TBO-RH-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Recursos Humanos (People)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Padronizar o processo de contratação para garantir alinhamento cultural, competência técnica e eficiência no tempo de preenchimento de vagas.

2. Escopo

2.1 O que está coberto

Abertura de vaga, descrição e divulgação, triagem com teste prático, entrevistas (2–3 etapas) e decisão de oferta.

2.2 Exclusões

Onboarding pós-contratação (SOP-RH-002), avaliação de performance (SOP-RH-003), contratação de freelancers pontuais (SOP-REL-001).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Triagem, entrevista cultural/técnica, decisão final

Executor

---

PO da BU

Entrevista técnica e validação de fit para a área

Consultor

---

Ruy

Entrevista final para cargos de liderança ou senioridade alta

Aprovador

---

Carol (Ops)

Logística de agenda, documentação, setup de contrato

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Requisição de vaga aprovada; faixa salarial validada; descrição de cargo; case de teste técnico preparado.

4.2 Ferramentas e Acessos

LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato), TBO OS (registro).

5. Procedimento Passo a Passo

5.1. Abertura de Vaga

Ação: PO preenche requisição no TBO OS: cargo, senioridade, regime (CLT/PJ), faixa salarial, justificativa. Marco valida necessidade e impacto financeiro. Acima de R$ 5.000/mês: aprovação conjunta.

Responsável: PO → Marco (→ Ruy)

Output: Vaga aprovada

Prazo referência: Até 48h

5.2. Descrição e Divulgação

Ação: Marco elabora descrição (responsabilidades, requisitos, diferenciais, benefícios). Divulgação em: LinkedIn, plataformas de nicho, indicação interna.

Responsável: Marco

Output: Vaga publicada

Prazo referência: Até 3 dias após aprovação

5.3. Triagem e Teste Prático

Ação: Marco faz triagem de portfólio/CV. Aprovados recebem case simulado do dia a dia TBO. Prazo de entrega: 5 dias úteis.

Responsável: Marco

Output: Candidatos pré-selecionados

Prazo referência: Até 10 dias após publicação

5.4. Entrevistas e Decisão

Ação: Etapa 1: fit cultural + técnica (Marco, 45 min). Etapa 2: validação com PO (30 min). Etapa 3: conversa com Ruy (liderança/sênior). Decisão registrada no TBO OS. Oferta enviada por e-mail.

Responsável: Marco + PO + Ruy

Output: Candidato selecionado e oferta enviada

Prazo referência: Até 5 dias após entrevistas

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Requisição preenchida e aprovada

[ ] Vaga publicada nos canais definidos

[ ] Triagem com teste prático realizada

[ ] Mínimo 2 entrevistas concluídas

[ ] Decisão registrada no TBO OS

[ ] Oferta enviada com condições claras

6.2 Erros Comuns a Evitar

Contratar sem teste prático → descobre incompatibilidade técnica tarde demais

Pular entrevista cultural → contratação desalinhada com valores TBO

Processo > 30 dias → perde candidatos bons para concorrência

7. Ferramentas e Templates

TBO OS (requisição, registro), LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato).

8. SLAs e Prazos

Aprovação de vaga: até 48h

Publicação: até 3 dias

Triagem + teste: até 10 dias

Entrevistas + decisão: até 5 dias

Processo total ideal: até 25 dias úteis

9. Fluxograma

Requisição de Vaga → Aprovação → Descrição + Divulgação → Triagem + Teste → Entrevistas (2–3) → Decisão → Oferta Enviada → Aceite? → Sim: SOP-RH-002 (Onboarding) → Fim / Não: Retomar triagem → Fim

10. Glossário

Case/teste prático: simulação de tarefa real da TBO para avaliar competência técnica.

Fit cultural: alinhamento do candidato com valores e forma de trabalhar da TBO.

PJ: Pessoa Jurídica — regime de contratação como prestador de serviço.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['rh','pessoas']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Padronizar o processo de contratação para garantir alinhamento cultural, competência técnica e eficiência no tempo de preenchimento de vagas.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Abertura de vaga, descrição e divulgação, triagem com teste prático, entrevistas (2–3 etapas) e decisão de oferta.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Onboarding pós-contratação (SOP-RH-002), avaliação de performance (SOP-RH-003), contratação de freelancers pontuais (SOP-REL-001).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Triagem, entrevista cultural/técnica, decisão final

Executor

---

PO da BU

Entrevista técnica e validação de fit para a área

Consultor

---

Ruy

Entrevista final para cargos de liderança ou senioridade alta

Aprovador

---

Carol (Ops)

Logística de agenda, documentação, setup de contrato

Executor

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Requisição de vaga aprovada; faixa salarial validada; descrição de cargo; case de teste técnico preparado.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato), TBO OS (registro).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Abertura de Vaga', 'Ação: PO preenche requisição no TBO OS: cargo, senioridade, regime (CLT/PJ), faixa salarial, justificativa. Marco valida necessidade e impacto financeiro. Acima de R$ 5.000/mês: aprovação conjunta.

Responsável: PO → Marco (→ Ruy)

Output: Vaga aprovada

Prazo referência: Até 48h', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Descrição e Divulgação', 'Ação: Marco elabora descrição (responsabilidades, requisitos, diferenciais, benefícios). Divulgação em: LinkedIn, plataformas de nicho, indicação interna.

Responsável: Marco

Output: Vaga publicada

Prazo referência: Até 3 dias após aprovação', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Triagem e Teste Prático', 'Ação: Marco faz triagem de portfólio/CV. Aprovados recebem case simulado do dia a dia TBO. Prazo de entrega: 5 dias úteis.

Responsável: Marco

Output: Candidatos pré-selecionados

Prazo referência: Até 10 dias após publicação', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Entrevistas e Decisão', 'Ação: Etapa 1: fit cultural + técnica (Marco, 45 min). Etapa 2: validação com PO (30 min). Etapa 3: conversa com Ruy (liderança/sênior). Decisão registrada no TBO OS. Oferta enviada por e-mail.

Responsável: Marco + PO + Ruy

Output: Candidato selecionado e oferta enviada

Prazo referência: Até 5 dias após entrevistas', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Requisição preenchida e aprovada

[ ] Vaga publicada nos canais definidos

[ ] Triagem com teste prático realizada

[ ] Mínimo 2 entrevistas concluídas

[ ] Decisão registrada no TBO OS

[ ] Oferta enviada com condições claras', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Contratar sem teste prático → descobre incompatibilidade técnica tarde demais

Pular entrevista cultural → contratação desalinhada com valores TBO

Processo > 30 dias → perde candidatos bons para concorrência', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (requisição, registro), LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Aprovação de vaga: até 48h

Publicação: até 3 dias

Triagem + teste: até 10 dias

Entrevistas + decisão: até 5 dias

Processo total ideal: até 25 dias úteis', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Requisição de Vaga → Aprovação → Descrição + Divulgação → Triagem + Teste → Entrevistas (2–3) → Decisão → Oferta Enviada → Aceite? → Sim: SOP-RH-002 (Onboarding) → Fim / Não: Retomar triagem → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Case/teste prático: simulação de tarefa real da TBO para avaliar competência técnica.

Fit cultural: alinhamento do candidato com valores e forma de trabalhar da TBO.

PJ: Pessoa Jurídica — regime de contratação como prestador de serviço.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-RH-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Onboarding de Colaborador', 'tbo-rh-002-onboarding-de-colaborador', 'recursos-humanos', 'checklist', 'Onboarding de Colaborador (People)', 'Standard Operating Procedure

Onboarding de Colaborador (People)

Código

TBO-RH-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Recursos Humanos (People)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato



1. Objetivo

Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.

2. Escopo

2.1 O que está coberto

Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).

2.2 Exclusões

Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Configurar acessos, contrato, logística do onboarding

Executor

---

Marco

Apresentação cultural, check-ins quinzenais, avaliação de 30 dias

Executor

---

PO da BU

Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias

Consultor

---

Novo Colaborador

Participar ativamente, completar checklist

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.

4.2 Ferramentas e Acessos

TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.

5. Procedimento Passo a Passo

5.1. Pré-Onboarding (D-2)

Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.

Responsável: Carol (Ops)

Output: Acessos configurados, kit preparado

Prazo referência: 2 dias antes da entrada

5.2. Dia 1 — Cultura e Ferramentas

Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.

Responsável: Marco + Carol + PO

Output: Colaborador ambientado

Prazo referência: Dia 1

5.3. Semana 1 — Processos

Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.

Responsável: PO + Carol

Output: Checklist de ferramentas concluído

Prazo referência: Dias 2–5

5.4. Semanas 2–4 — Imersão e Avaliação

Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.

Responsável: PO + Marco

Output: Avaliação de 30 dias registrada no TBO OS

Prazo referência: Até dia 30

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Acessos configurados antes do Dia 1

[ ] Kit de boas-vindas entregue

[ ] Apresentação cultural realizada

[ ] Checklist de ferramentas concluído

[ ] Buddy designado

[ ] Avaliação de 30 dias realizada e registrada

6.2 Erros Comuns a Evitar

Colaborador sem acesso no Dia 1 → primeira impressão negativa

Onboarding informal → não internaliza processos, gera retrabalho

Sem avaliação de 30 dias → problemas de performance descobertos tarde

7. Ferramentas e Templates

TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.

8. SLAs e Prazos

Acessos: D-2

Dia 1: cultura + ferramentas

Semana 1: processos e check-ins diários

Avaliação: até dia 30

Regra: nenhum colaborador inicia sem contrato e acessos configurados

9. Fluxograma

Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim

10. Glossário

Buddy: colega designado para apoiar o novo membro nas primeiras semanas.

Role: nível de permissão no TBO OS (colaborador = nível 3).

Check-in: conversa curta de acompanhamento entre gestor e colaborador.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['rh','pessoas']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Configurar acessos, contrato, logística do onboarding

Executor

---

Marco

Apresentação cultural, check-ins quinzenais, avaliação de 30 dias

Executor

---

PO da BU

Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias

Consultor

---

Novo Colaborador

Participar ativamente, completar checklist

Executor

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Pré-Onboarding (D-2)', 'Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.

Responsável: Carol (Ops)

Output: Acessos configurados, kit preparado

Prazo referência: 2 dias antes da entrada', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Dia 1 — Cultura e Ferramentas', 'Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.

Responsável: Marco + Carol + PO

Output: Colaborador ambientado

Prazo referência: Dia 1', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Semana 1 — Processos', 'Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.

Responsável: PO + Carol

Output: Checklist de ferramentas concluído

Prazo referência: Dias 2–5', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Semanas 2–4 — Imersão e Avaliação', 'Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.

Responsável: PO + Marco

Output: Avaliação de 30 dias registrada no TBO OS

Prazo referência: Até dia 30', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Acessos configurados antes do Dia 1

[ ] Kit de boas-vindas entregue

[ ] Apresentação cultural realizada

[ ] Checklist de ferramentas concluído

[ ] Buddy designado

[ ] Avaliação de 30 dias realizada e registrada', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Colaborador sem acesso no Dia 1 → primeira impressão negativa

Onboarding informal → não internaliza processos, gera retrabalho

Sem avaliação de 30 dias → problemas de performance descobertos tarde', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Acessos: D-2

Dia 1: cultura + ferramentas

Semana 1: processos e check-ins diários

Avaliação: até dia 30

Regra: nenhum colaborador inicia sem contrato e acessos configurados', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Buddy: colega designado para apoiar o novo membro nas primeiras semanas.

Role: nível de permissão no TBO OS (colaborador = nível 3).

Check-in: conversa curta de acompanhamento entre gestor e colaborador.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-RH-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Avaliacao de Performance e Desenvolvimento', 'tbo-rh-003-avaliacao-de-performance-e-desenvolvimento', 'recursos-humanos', 'checklist', 'Avaliação de Performance e Desenvolvimento', 'Standard Operating Procedure

Avaliação de Performance e Desenvolvimento

Código

TBO-RH-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Recursos Humanos (People)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato



1. Objetivo

Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.

2. Escopo

2.1 O que está coberto

1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.

2.2 Exclusões

Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

PO da BU

Conduzir 1:1 mensal e preencher avaliação

Executor

---

Marco

Avaliação trimestral e anual, decisões de performance

Aprovador

---

Colaborador

Participar, dar e receber feedback, cumprir plano de ação

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.

4.2 Ferramentas e Acessos

TBO OS (módulo People), Google Meet.

5. Procedimento Passo a Passo

5.1. 1:1 Mensal (PO ↔ Colaborador)

Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.

Responsável: PO da BU

Output: Registro de 1:1 no TBO OS

Prazo referência: Mensal

5.2. Avaliação Trimestral

Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.

Responsável: Marco

Output: Avaliação trimestral registrada com plano de ação

Prazo referência: Trimestral

5.3. Avaliação Anual

Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.

Responsável: Marco + Ruy

Output: Avaliação anual registrada, decisões formalizadas

Prazo referência: Dezembro/Janeiro

5.4. Gestão de Baixa Performance

Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).

Responsável: Marco

Output: Plano de melhoria ou decisão de desligamento

Prazo referência: Conforme ciclo

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] 1:1 mensal realizada e registrada

[ ] Avaliação trimestral concluída

[ ] Avaliação anual com decisões formalizadas

[ ] Plano de melhoria documentado (quando aplicável)

6.2 Erros Comuns a Evitar

1:1 sem registro → feedback se perde, padrões não aparecem

Avaliar sem exemplos concretos → feedback genérico não gera ação

Demitir sem feedback documentado → risco trabalhista e cultural

7. Ferramentas e Templates

TBO OS (People), Google Meet.

8. SLAs e Prazos

1:1: mensal

Avaliação trimestral: a cada 3 meses

Avaliação anual: dezembro/janeiro

Plano de melhoria: mínimo 30 dias antes de decisão de desligamento

9. Fluxograma

Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004

10. Glossário

1:1: reunião individual entre gestor e colaborador para feedback.

Plano de melhoria: documento formal com metas específicas e prazo para evolução.

Feedback 360°: avaliação coletada de pares, líderes e liderados.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['rh','pessoas']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', '1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

PO da BU

Conduzir 1:1 mensal e preencher avaliação

Executor

---

Marco

Avaliação trimestral e anual, decisões de performance

Aprovador

---

Colaborador

Participar, dar e receber feedback, cumprir plano de ação

Executor

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (módulo People), Google Meet.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. 1:1 Mensal (PO ↔ Colaborador)', 'Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.

Responsável: PO da BU

Output: Registro de 1:1 no TBO OS

Prazo referência: Mensal', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Avaliação Trimestral', 'Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.

Responsável: Marco

Output: Avaliação trimestral registrada com plano de ação

Prazo referência: Trimestral', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Avaliação Anual', 'Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.

Responsável: Marco + Ruy

Output: Avaliação anual registrada, decisões formalizadas

Prazo referência: Dezembro/Janeiro', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Gestão de Baixa Performance', 'Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).

Responsável: Marco

Output: Plano de melhoria ou decisão de desligamento

Prazo referência: Conforme ciclo', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] 1:1 mensal realizada e registrada

[ ] Avaliação trimestral concluída

[ ] Avaliação anual com decisões formalizadas

[ ] Plano de melhoria documentado (quando aplicável)', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', '1:1 sem registro → feedback se perde, padrões não aparecem

Avaliar sem exemplos concretos → feedback genérico não gera ação

Demitir sem feedback documentado → risco trabalhista e cultural', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (People), Google Meet.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', '1:1: mensal

Avaliação trimestral: a cada 3 meses

Avaliação anual: dezembro/janeiro

Plano de melhoria: mínimo 30 dias antes de decisão de desligamento', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', '1:1: reunião individual entre gestor e colaborador para feedback.

Plano de melhoria: documento formal com metas específicas e prazo para evolução.

Feedback 360°: avaliação coletada de pares, líderes e liderados.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-RH-004
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Desligamento e Offboarding', 'tbo-rh-004-desligamento-e-offboarding', 'recursos-humanos', 'checklist', 'Marco Andolfato (Dir. Operações)', 'Standard Operating Procedure

Desligamento e Offboarding

Código

TBO-RH-004

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Recursos Humanos (People)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Padronizar o processo de desligamento para garantir transição adequada de conhecimento, revogação imediata de acessos e conformidade legal.

2. Escopo

2.1 O que está coberto

Decisão e comunicação, transição de conhecimento, revogação de acessos, aspectos legais e entrevista de saída.

2.2 Exclusões

Avaliação de performance (SOP-RH-003), contratação de substituto (SOP-RH-001).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Comunicar desligamento, conduzir entrevista de saída

Executor

---

Ruy

Participar da decisão de desligamento

Aprovador

---

Carol (Ops)

Revogar acessos, coordenar aspectos legais

Executor

---

PO da BU

Redistribuir projetos e garantir handoff de conhecimento

Consultor

---



4. Pré-requisitos

4.1 Inputs necessários

Decisão de desligamento validada pelos sócios; feedbacks documentados (SOP-RH-003); lista de projetos em andamento do colaborador.

4.2 Ferramentas e Acessos

TBO OS (People, acessos), Google Workspace (revogar), ClickSign (rescisão), Google Meet.

5. Procedimento Passo a Passo

5.1. Decisão e Comunicação

Ação: Decisão conjunta Marco + Ruy (com input do PO). Comunicação ao colaborador por Marco em reunião privada (presencial ou call).

Responsável: Marco + Ruy

Output: Colaborador comunicado

Prazo referência: Conforme decisão

5.2. Transição de Conhecimento

Ação: PO mapeia projetos em andamento e redistribui. Colaborador documenta status de cada tarefa no TBO OS. Handoff de arquivos e acessos de cliente.

Responsável: PO + Colaborador

Output: Projetos redistribuídos e documentados

Prazo referência: Até o último dia

5.3. Revogação de Acessos

Ação: Carol revoga no dia do desligamento efetivo: TBO OS, Google Workspace, ferramentas de design, repositórios, canais de comunicação.

Responsável: Carol (Ops)

Output: Todos os acessos revogados

Prazo referência: Até 2h após comunicação

5.4. Aspectos Legais e Entrevista de Saída

Ação: Carol coordena rescisão com contabilidade (CLT) ou encerramento de contrato (PJ) via ClickSign. Marco conduz entrevista de saída para captar feedback. Registro no TBO OS.

Responsável: Carol + Marco

Output: Documentação legal concluída, feedback registrado

Prazo referência: Até 5 dias úteis após desligamento

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Decisão documentada com feedbacks anteriores

[ ] Comunicação realizada pessoalmente

[ ] Projetos redistribuídos e documentados no TBO OS

[ ] Acessos revogados em até 2h

[ ] Rescisão/encerramento de contrato formalizado

[ ] Entrevista de saída realizada e registrada

6.2 Erros Comuns a Evitar

Acessos não revogados imediatamente → risco de segurança da informação

Desligamento sem feedbacks documentados → risco trabalhista

Não fazer entrevista de saída → perda de aprendizado organizacional

7. Ferramentas e Templates

TBO OS (People), Google Workspace, ClickSign, Google Meet.

8. SLAs e Prazos

Revogação de acessos: até 2h após comunicação

Transição de conhecimento: até último dia

Documentação legal: até 5 dias úteis

Regra: acessos revogados antes de qualquer outra etapa

9. Fluxograma

Decisão de Desligamento → Comunicação (Marco) → Revogação de Acessos (2h) → Transição de Conhecimento → Aspectos Legais (ClickSign) → Entrevista de Saída → Registro no TBO OS → Fim

10. Glossário

Offboarding: processo estruturado de saída de um colaborador.

Revogação: remoção imediata de todos os acessos a sistemas e dados.

Entrevista de saída: conversa final para captar feedback sobre processos e cultura.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['rh','pessoas']::TEXT[], 3, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Padronizar o processo de desligamento para garantir transição adequada de conhecimento, revogação imediata de acessos e conformidade legal.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Decisão e comunicação, transição de conhecimento, revogação de acessos, aspectos legais e entrevista de saída.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Avaliação de performance (SOP-RH-003), contratação de substituto (SOP-RH-001).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Comunicar desligamento, conduzir entrevista de saída

Executor

---

Ruy

Participar da decisão de desligamento

Aprovador

---

Carol (Ops)

Revogar acessos, coordenar aspectos legais

Executor

---

PO da BU

Redistribuir projetos e garantir handoff de conhecimento

Consultor

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Decisão de desligamento validada pelos sócios; feedbacks documentados (SOP-RH-003); lista de projetos em andamento do colaborador.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (People, acessos), Google Workspace (revogar), ClickSign (rescisão), Google Meet.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Decisão e Comunicação', 'Ação: Decisão conjunta Marco + Ruy (com input do PO). Comunicação ao colaborador por Marco em reunião privada (presencial ou call).

Responsável: Marco + Ruy

Output: Colaborador comunicado

Prazo referência: Conforme decisão', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Transição de Conhecimento', 'Ação: PO mapeia projetos em andamento e redistribui. Colaborador documenta status de cada tarefa no TBO OS. Handoff de arquivos e acessos de cliente.

Responsável: PO + Colaborador

Output: Projetos redistribuídos e documentados

Prazo referência: Até o último dia', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Revogação de Acessos', 'Ação: Carol revoga no dia do desligamento efetivo: TBO OS, Google Workspace, ferramentas de design, repositórios, canais de comunicação.

Responsável: Carol (Ops)

Output: Todos os acessos revogados

Prazo referência: Até 2h após comunicação', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Aspectos Legais e Entrevista de Saída', 'Ação: Carol coordena rescisão com contabilidade (CLT) ou encerramento de contrato (PJ) via ClickSign. Marco conduz entrevista de saída para captar feedback. Registro no TBO OS.

Responsável: Carol + Marco

Output: Documentação legal concluída, feedback registrado

Prazo referência: Até 5 dias úteis após desligamento', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Decisão documentada com feedbacks anteriores

[ ] Comunicação realizada pessoalmente

[ ] Projetos redistribuídos e documentados no TBO OS

[ ] Acessos revogados em até 2h

[ ] Rescisão/encerramento de contrato formalizado

[ ] Entrevista de saída realizada e registrada', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Acessos não revogados imediatamente → risco de segurança da informação

Desligamento sem feedbacks documentados → risco trabalhista

Não fazer entrevista de saída → perda de aprendizado organizacional', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (People), Google Workspace, ClickSign, Google Meet.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Revogação de acessos: até 2h após comunicação

Transição de conhecimento: até último dia

Documentação legal: até 5 dias úteis

Regra: acessos revogados antes de qualquer outra etapa', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Decisão de Desligamento → Comunicação (Marco) → Revogação de Acessos (2h) → Transição de Conhecimento → Aspectos Legais (ClickSign) → Entrevista de Saída → Registro no TBO OS → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Offboarding: processo estruturado de saída de um colaborador.

Revogação: remoção imediata de todos os acessos a sistemas e dados.

Entrevista de saída: conversa final para captar feedback sobre processos e cultura.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

END $$;
