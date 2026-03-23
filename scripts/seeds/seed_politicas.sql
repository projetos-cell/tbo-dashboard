-- Seed: politicas (4 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-POL-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Codigo de Conduta e Etica', 'tbo-pol-001-codigo-de-conduta-e-etica', 'politicas', 'checklist', 'Marco Andolfato (Dir. Operações)', 'Standard Operating Procedure

Código de Conduta e Ética

Código

TBO-POL-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Políticas (Compliance)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.

2. Escopo

2.1 O que está coberto

Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.

2.2 Exclusões

Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Definir, comunicar e fazer cumprir o código

Executor

---

Ruy

Aprovar e fazer cumprir

Aprovador

---

Todos os membros

Seguir o código, reportar violações

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Valores da TBO definidos; processos de onboarding atualizados para incluir o código.

4.2 Ferramentas e Acessos

TBO OS, Google Drive (documento do código), ClickSign (aceite formal).

5. Procedimento Passo a Passo

5.1. Definição e Documentação

Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.

Responsável: Marco

Output: Código de conduta documentado

Prazo referência: Versão inicial + revisão anual

5.2. Comunicação e Aceite

Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.

Responsável: Carol (Ops)

Output: Aceite assinado por todos

Prazo referência: No onboarding ou na revisão

5.3. Relato de Violações

Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.

Responsável: Marco + Ruy

Output: Investigação concluída

Prazo referência: Até 10 dias úteis

5.4. Consequências

Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.

Responsável: Marco + Ruy

Output: Medida aplicada e registrada

Prazo referência: Conforme gravidade

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Código documentado e aprovado

[ ] Aceite assinado por todos os membros

[ ] Canal de relato conhecido por todos

[ ] Investigações concluídas dentro do prazo

6.2 Erros Comuns a Evitar

Código apenas no papel → cultura não muda, apenas gera compliance fake

Não investigar relatos → perda de credibilidade do canal

Punição desproporcional → clima organizacional deteriora

7. Ferramentas e Templates

TBO OS, Google Drive, ClickSign.

8. SLAs e Prazos

Aceite: no onboarding

Investigação: até 10 dias úteis

Revisão do código: anual

9. Fluxograma

Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim

10. Glossário

Compliance: conformidade com regras, políticas e legislação aplicável.

Canal de relato: meio confidencial para reportar violações do código.

Advertência formal: registro documentado de violação com plano de correção.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['politica','compliance']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Definir, comunicar e fazer cumprir o código

Executor

---

Ruy

Aprovar e fazer cumprir

Aprovador

---

Todos os membros

Seguir o código, reportar violações

Executor

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Valores da TBO definidos; processos de onboarding atualizados para incluir o código.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Drive (documento do código), ClickSign (aceite formal).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Definição e Documentação', 'Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.

Responsável: Marco

Output: Código de conduta documentado

Prazo referência: Versão inicial + revisão anual', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Comunicação e Aceite', 'Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.

Responsável: Carol (Ops)

Output: Aceite assinado por todos

Prazo referência: No onboarding ou na revisão', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Relato de Violações', 'Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.

Responsável: Marco + Ruy

Output: Investigação concluída

Prazo referência: Até 10 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Consequências', 'Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.

Responsável: Marco + Ruy

Output: Medida aplicada e registrada

Prazo referência: Conforme gravidade', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Código documentado e aprovado

[ ] Aceite assinado por todos os membros

[ ] Canal de relato conhecido por todos

[ ] Investigações concluídas dentro do prazo', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Código apenas no papel → cultura não muda, apenas gera compliance fake

Não investigar relatos → perda de credibilidade do canal

Punição desproporcional → clima organizacional deteriora', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS, Google Drive, ClickSign.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Aceite: no onboarding

Investigação: até 10 dias úteis

Revisão do código: anual', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Compliance: conformidade com regras, políticas e legislação aplicável.

Canal de relato: meio confidencial para reportar violações do código.

Advertência formal: registro documentado de violação com plano de correção.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-POL-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Seguranca da Informacao', 'tbo-pol-002-seguranca-da-informacao', 'politicas', 'checklist', 'Marco Andolfato (Dir. Operações)', 'Standard Operating Procedure

Segurança da Informação

Código

TBO-POL-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Políticas (Compliance)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Proteger dados da TBO, clientes e colaboradores contra acesso não autorizado, perda ou vazamento, com práticas mínimas de segurança.

2. Escopo

2.1 O que está coberto

Classificação de dados (público, interno, confidencial, restrito), gestão de acessos RBAC, autenticação, proteção de dados de clientes e backup.

2.2 Exclusões

Código de conduta (SOP-POL-001), propriedade intelectual (SOP-POL-003), infraestrutura de TI avançada (responsabilidade de fornecedor).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Definir políticas, revisar acessos, monitorar compliance

Executor

---

Carol (Ops)

Executar configurações de acesso e backup operacional

Executor

---

Todos os membros

Seguir as políticas de segurança

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Modelo RBAC do TBO OS definido (sócio=5, PO=4, colaborador=3, viewer=2, guest=1); Google Workspace configurado; lista de ferramentas com credenciais.

4.2 Ferramentas e Acessos

TBO OS (RBAC), Google Workspace (2FA), Supabase (backup), Google Drive.

5. Procedimento Passo a Passo

5.1. Classificação de Dados

Ação: Toda informação é classificada: Público (portfolio publicado), Interno (SOPs, processos), Confidencial (contratos, financeiro, dados de clientes pré-lançamento), Restrito (senhas, tokens, dados bancários, dados pessoais).

Responsável: Marco

Output: Classificação documentada

Prazo referência: Versão inicial + revisão anual

5.2. Gestão de Acessos

Ação: TBO OS segue RBAC com princípio do menor privilégio. Carol configura acessos conforme role. Marco faz revisão trimestral de acessos.

Responsável: Carol + Marco

Output: Acessos configurados e revisados

Prazo referência: Contínuo + revisão trimestral

5.3. Autenticação e Senhas

Ação: Google OAuth para TBO OS e Workspace. 2FA obrigatório para contas críticas (e-mail, Omie, RD Station). Senhas em gerenciador — nunca em planilhas.

Responsável: Todos

Output: Autenticação segura configurada

Prazo referência: Contínuo

5.4. Backup

Ação: Google Drive: backup automático. Projetos 3D (pesados): backup semanal em HD externo. Supabase: backup diário automático.

Responsável: Carol (Ops)

Output: Backups executados conforme política

Prazo referência: Semanal (3D) / Diário (Supabase)

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Classificação de dados documentada

[ ] RBAC configurado e revisado trimestralmente

[ ] 2FA ativo em contas críticas

[ ] Senhas em gerenciador (nunca em planilhas)

[ ] Backups executados conforme cronograma

6.2 Erros Comuns a Evitar

Compartilhar credenciais por chat → risco de vazamento

Não revogar acessos de ex-colaboradores → porta aberta

Backup manual sem verificação → falsa sensação de segurança

7. Ferramentas e Templates

TBO OS (RBAC), Google Workspace (2FA, Drive), Supabase, gerenciador de senhas.

8. SLAs e Prazos

Revisão de acessos: trimestral

Revogação pós-desligamento: até 2h

Backup 3D: semanal

Backup Supabase: diário

Regra: violação de segurança = falta grave

9. Fluxograma

Classificação Definida → Acessos RBAC Configurados → 2FA Ativo → Backup Operacional → Revisão Trimestral → Incidente? → Sim: Investigação → Medida → Fim / Não: Próxima Revisão → Fim

10. Glossário

RBAC: Role-Based Access Control — controle de acesso por papéis.

2FA: autenticação em dois fatores para segurança adicional.

Menor privilégio: princípio de conceder apenas o acesso mínimo necessário.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['politica','compliance']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Proteger dados da TBO, clientes e colaboradores contra acesso não autorizado, perda ou vazamento, com práticas mínimas de segurança.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Classificação de dados (público, interno, confidencial, restrito), gestão de acessos RBAC, autenticação, proteção de dados de clientes e backup.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Código de conduta (SOP-POL-001), propriedade intelectual (SOP-POL-003), infraestrutura de TI avançada (responsabilidade de fornecedor).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Definir políticas, revisar acessos, monitorar compliance

Executor

---

Carol (Ops)

Executar configurações de acesso e backup operacional

Executor

---

Todos os membros

Seguir as políticas de segurança

Executor

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Modelo RBAC do TBO OS definido (sócio=5, PO=4, colaborador=3, viewer=2, guest=1); Google Workspace configurado; lista de ferramentas com credenciais.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (RBAC), Google Workspace (2FA), Supabase (backup), Google Drive.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Classificação de Dados', 'Ação: Toda informação é classificada: Público (portfolio publicado), Interno (SOPs, processos), Confidencial (contratos, financeiro, dados de clientes pré-lançamento), Restrito (senhas, tokens, dados bancários, dados pessoais).

Responsável: Marco

Output: Classificação documentada

Prazo referência: Versão inicial + revisão anual', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Gestão de Acessos', 'Ação: TBO OS segue RBAC com princípio do menor privilégio. Carol configura acessos conforme role. Marco faz revisão trimestral de acessos.

Responsável: Carol + Marco

Output: Acessos configurados e revisados

Prazo referência: Contínuo + revisão trimestral', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Autenticação e Senhas', 'Ação: Google OAuth para TBO OS e Workspace. 2FA obrigatório para contas críticas (e-mail, Omie, RD Station). Senhas em gerenciador — nunca em planilhas.

Responsável: Todos

Output: Autenticação segura configurada

Prazo referência: Contínuo', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Backup', 'Ação: Google Drive: backup automático. Projetos 3D (pesados): backup semanal em HD externo. Supabase: backup diário automático.

Responsável: Carol (Ops)

Output: Backups executados conforme política

Prazo referência: Semanal (3D) / Diário (Supabase)', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Classificação de dados documentada

[ ] RBAC configurado e revisado trimestralmente

[ ] 2FA ativo em contas críticas

[ ] Senhas em gerenciador (nunca em planilhas)

[ ] Backups executados conforme cronograma', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Compartilhar credenciais por chat → risco de vazamento

Não revogar acessos de ex-colaboradores → porta aberta

Backup manual sem verificação → falsa sensação de segurança', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (RBAC), Google Workspace (2FA, Drive), Supabase, gerenciador de senhas.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Revisão de acessos: trimestral

Revogação pós-desligamento: até 2h

Backup 3D: semanal

Backup Supabase: diário

Regra: violação de segurança = falta grave', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Classificação Definida → Acessos RBAC Configurados → 2FA Ativo → Backup Operacional → Revisão Trimestral → Incidente? → Sim: Investigação → Medida → Fim / Não: Próxima Revisão → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'RBAC: Role-Based Access Control — controle de acesso por papéis.

2FA: autenticação em dois fatores para segurança adicional.

Menor privilégio: princípio de conceder apenas o acesso mínimo necessário.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-POL-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Propriedade Intelectual e Direitos Autorais', 'tbo-pol-003-propriedade-intelectual-e-direitos-autorais', 'politicas', 'checklist', 'Propriedade Intelectual e Direitos Autorais', 'Standard Operating Procedure

Propriedade Intelectual e Direitos Autorais

Código

TBO-POL-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Políticas (Compliance)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Definir regras de propriedade intelectual para proteger ativos criativos da TBO e direitos dos clientes sobre materiais produzidos.

2. Escopo

2.1 O que está coberto

Propriedade de trabalhos para clientes, ativos internos da TBO, uso de stock e licenças, e cessão de direitos de freelancers.

2.2 Exclusões

Código de conduta (SOP-POL-001), segurança da informação (SOP-POL-002), gestão de contratos (SOP-POL-004).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Definir políticas e garantir cláusulas em contratos

Executor

---

Carol (Ops)

Manter registro de licenças, incluir cláusulas em contratos de freelancer

Executor

---

Todos os membros

Seguir as políticas de PI

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Templates de contrato com cláusulas de PI; registro de licenças de software e stock; política de uso de portfólio.

4.2 Ferramentas e Acessos

TBO OS, Google Drive (registro de licenças), ClickSign.

5. Procedimento Passo a Passo

5.1. Trabalho para Clientes

Ação: Materiais produzidos para cliente são de propriedade do cliente após pagamento integral. TBO retém direito de uso para portfólio, desde que autorizado (por escrito).

Responsável: Marco

Output: Cláusula em contrato

Prazo referência: Em todo contrato

5.2. Ativos Internos da TBO

Ação: Templates, processos, metodologias, ferramentas (TBO OS, Bia, skills) são propriedade exclusiva. Nenhum colaborador pode reproduzir ou utilizar fora do contexto de trabalho.

Responsável: Marco

Output: Política documentada e comunicada

Prazo referência: No onboarding

5.3. Stock e Licenças

Ação: Imagens de stock, fontes e plugins devem ter licença válida. Carol mantém registro de licenças ativas. Uso de material sem licença é proibido.

Responsável: Carol (Ops)

Output: Registro de licenças atualizado

Prazo referência: Contínuo

5.4. Contratos de Freelancer

Ação: Todo contrato com freelancer inclui cláusula de cessão de direitos autorais sobre material produzido para TBO/cliente.

Responsável: Carol (Ops)

Output: Cláusula de cessão em contrato

Prazo referência: Em todo contrato de freelancer

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Cláusula de PI em todos os contratos de cliente

[ ] Cláusula de cessão em todos os contratos de freelancer

[ ] Registro de licenças de stock e software atualizado

[ ] Política de portfólio comunicada a toda equipe

6.2 Erros Comuns a Evitar

Material de cliente em portfólio sem autorização → violação de confiança e possível ação legal

Freelancer sem cessão de direitos → disputa sobre autoria

Software/stock pirata → risco legal e reputacional

7. Ferramentas e Templates

TBO OS, Google Drive, ClickSign.

8. SLAs e Prazos

Cláusula de PI: em todo contrato

Registro de licenças: atualização contínua

Autorização de portfólio: antes de qualquer publicação

Regra: material pré-lançamento é especialmente sensível — publicação proibida sem autorização

9. Fluxograma

Projeto Iniciado → Contrato com Cláusula de PI → Produção (licenças verificadas) → Entrega + Pagamento → Propriedade transferida ao cliente → Usar em portfólio? → Autorização por escrito → Publicar / Não publicar → Fim

10. Glossário

PI: Propriedade Intelectual — direitos sobre criações do intelecto.

Cessão de direitos: transferência formal da autoria de um material.

Stock: banco de imagens, vídeos ou áudio licenciados para uso comercial.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['politica','compliance']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Definir regras de propriedade intelectual para proteger ativos criativos da TBO e direitos dos clientes sobre materiais produzidos.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Propriedade de trabalhos para clientes, ativos internos da TBO, uso de stock e licenças, e cessão de direitos de freelancers.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Código de conduta (SOP-POL-001), segurança da informação (SOP-POL-002), gestão de contratos (SOP-POL-004).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Definir políticas e garantir cláusulas em contratos

Executor

---

Carol (Ops)

Manter registro de licenças, incluir cláusulas em contratos de freelancer

Executor

---

Todos os membros

Seguir as políticas de PI

Executor

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Templates de contrato com cláusulas de PI; registro de licenças de software e stock; política de uso de portfólio.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Drive (registro de licenças), ClickSign.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Trabalho para Clientes', 'Ação: Materiais produzidos para cliente são de propriedade do cliente após pagamento integral. TBO retém direito de uso para portfólio, desde que autorizado (por escrito).

Responsável: Marco

Output: Cláusula em contrato

Prazo referência: Em todo contrato', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Ativos Internos da TBO', 'Ação: Templates, processos, metodologias, ferramentas (TBO OS, Bia, skills) são propriedade exclusiva. Nenhum colaborador pode reproduzir ou utilizar fora do contexto de trabalho.

Responsável: Marco

Output: Política documentada e comunicada

Prazo referência: No onboarding', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Stock e Licenças', 'Ação: Imagens de stock, fontes e plugins devem ter licença válida. Carol mantém registro de licenças ativas. Uso de material sem licença é proibido.

Responsável: Carol (Ops)

Output: Registro de licenças atualizado

Prazo referência: Contínuo', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Contratos de Freelancer', 'Ação: Todo contrato com freelancer inclui cláusula de cessão de direitos autorais sobre material produzido para TBO/cliente.

Responsável: Carol (Ops)

Output: Cláusula de cessão em contrato

Prazo referência: Em todo contrato de freelancer', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Cláusula de PI em todos os contratos de cliente

[ ] Cláusula de cessão em todos os contratos de freelancer

[ ] Registro de licenças de stock e software atualizado

[ ] Política de portfólio comunicada a toda equipe', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Material de cliente em portfólio sem autorização → violação de confiança e possível ação legal

Freelancer sem cessão de direitos → disputa sobre autoria

Software/stock pirata → risco legal e reputacional', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS, Google Drive, ClickSign.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Cláusula de PI: em todo contrato

Registro de licenças: atualização contínua

Autorização de portfólio: antes de qualquer publicação

Regra: material pré-lançamento é especialmente sensível — publicação proibida sem autorização', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Projeto Iniciado → Contrato com Cláusula de PI → Produção (licenças verificadas) → Entrega + Pagamento → Propriedade transferida ao cliente → Usar em portfólio? → Autorização por escrito → Publicar / Não publicar → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'PI: Propriedade Intelectual — direitos sobre criações do intelecto.

Cessão de direitos: transferência formal da autoria de um material.

Stock: banco de imagens, vídeos ou áudio licenciados para uso comercial.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-POL-004
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestao de Contratos e Documentos Legais', 'tbo-pol-004-gestao-de-contratos-e-documentos-legais', 'politicas', 'checklist', 'Gestão de Contratos e Documentos Legais', 'Standard Operating Procedure

Gestão de Contratos e Documentos Legais

Código

TBO-POL-004

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Políticas (Compliance)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Garantir que todos os documentos legais sejam padronizados, assinados digitalmente, armazenados com segurança e rastreáveis, com controle de vencimentos.

2. Escopo

2.1 O que está coberto

Templates jurídicos, assinatura via ClickSign, armazenamento seguro, nomenclatura padrão e controle de vencimentos/renovações.

2.2 Exclusões

Elaboração de propostas comerciais (SOP-COM-002), código de conduta (SOP-POL-001), contratos de trabalho CLT (contabilidade externa).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Gerar contratos, enviar para assinatura, controlar vencimentos

Executor

---

Marco

Revisar termos, aprovar contratos, decidir renovações

Aprovador

---

Ruy

Co-aprovar contratos estratégicos

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Templates jurídicos revisados; ClickSign configurado; pasta segura no Drive; nomenclatura padrão definida.

4.2 Ferramentas e Acessos

ClickSign, Google Drive (pasta restrita), TBO OS (vencimentos).

5. Procedimento Passo a Passo

5.1. Templates Padronizados

Ação: TBO mantém templates para: contrato de prestação de serviços, NDA, contrato PJ, termo de parceria, proposta comercial. Revisão semestral ou quando houver mudança legal.

Responsável: Marco + Carol

Output: Templates atualizados no Drive

Prazo referência: Semestral

5.2. Assinatura Digital

Ação: Todo documento legal é assinado via ClickSign. Assinaturas físicas aceitas apenas como exceção com autorização de Marco.

Responsável: Carol (Ops)

Output: Documento assinado digitalmente

Prazo referência: Conforme necessidade

5.3. Armazenamento Seguro

Ação: Documentos assinados armazenados em pasta restrita no Drive (acesso: sócios + Carol). Nomenclatura: [TIPO]_[CLIENTE/NOME]_[DATA]_v[VERSÃO].

Responsável: Carol (Ops)

Output: Documento armazenado conforme padrão

Prazo referência: Imediato após assinatura

5.4. Controle de Vencimentos

Ação: Carol mantém controle no TBO OS. Alerta 30 dias antes do vencimento para decisão de renovação, renegociação ou encerramento.

Responsável: Carol (Ops)

Output: Alerta enviado, decisão registrada

Prazo referência: 30 dias antes do vencimento

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Templates revisados semestralmente

[ ] Todos os contratos assinados via ClickSign

[ ] Documentos armazenados na pasta restrita com nomenclatura padrão

[ ] Vencimentos controlados com alertas de 30 dias

6.2 Erros Comuns a Evitar

Compromisso verbal sem contrato → risco jurídico e financeiro

Documento salvo fora da pasta restrita → acesso indevido

Contrato vencido sem renovação → operação sem cobertura legal

7. Ferramentas e Templates

ClickSign, Google Drive, TBO OS.

8. SLAs e Prazos

Revisão de templates: semestral

Armazenamento: imediato após assinatura

Alerta de vencimento: 30 dias antes

Regra: nenhum compromisso financeiro/legal é assumido verbalmente

9. Fluxograma

Necessidade de Contrato → Selecionar Template → Personalizar → Revisão (Marco) → ClickSign (assinatura) → Armazenamento (pasta restrita) → Controle de Vencimento → 30 dias antes: Alerta → Renovar / Renegociar / Encerrar → Fim

10. Glossário

ClickSign: plataforma de assinatura digital com validade jurídica.

NDA: Non-Disclosure Agreement — acordo de confidencialidade.

Nomenclatura padrão: formato de nomeação de arquivos para rastreabilidade.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['politica','compliance']::TEXT[], 3, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que todos os documentos legais sejam padronizados, assinados digitalmente, armazenados com segurança e rastreáveis, com controle de vencimentos.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Templates jurídicos, assinatura via ClickSign, armazenamento seguro, nomenclatura padrão e controle de vencimentos/renovações.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Elaboração de propostas comerciais (SOP-COM-002), código de conduta (SOP-POL-001), contratos de trabalho CLT (contabilidade externa).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Gerar contratos, enviar para assinatura, controlar vencimentos

Executor

---

Marco

Revisar termos, aprovar contratos, decidir renovações

Aprovador

---

Ruy

Co-aprovar contratos estratégicos

Aprovador

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Templates jurídicos revisados; ClickSign configurado; pasta segura no Drive; nomenclatura padrão definida.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'ClickSign, Google Drive (pasta restrita), TBO OS (vencimentos).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Templates Padronizados', 'Ação: TBO mantém templates para: contrato de prestação de serviços, NDA, contrato PJ, termo de parceria, proposta comercial. Revisão semestral ou quando houver mudança legal.

Responsável: Marco + Carol

Output: Templates atualizados no Drive

Prazo referência: Semestral', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Assinatura Digital', 'Ação: Todo documento legal é assinado via ClickSign. Assinaturas físicas aceitas apenas como exceção com autorização de Marco.

Responsável: Carol (Ops)

Output: Documento assinado digitalmente

Prazo referência: Conforme necessidade', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Armazenamento Seguro', 'Ação: Documentos assinados armazenados em pasta restrita no Drive (acesso: sócios + Carol). Nomenclatura: [TIPO]_[CLIENTE/NOME]_[DATA]_v[VERSÃO].

Responsável: Carol (Ops)

Output: Documento armazenado conforme padrão

Prazo referência: Imediato após assinatura', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Controle de Vencimentos', 'Ação: Carol mantém controle no TBO OS. Alerta 30 dias antes do vencimento para decisão de renovação, renegociação ou encerramento.

Responsável: Carol (Ops)

Output: Alerta enviado, decisão registrada

Prazo referência: 30 dias antes do vencimento', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Templates revisados semestralmente

[ ] Todos os contratos assinados via ClickSign

[ ] Documentos armazenados na pasta restrita com nomenclatura padrão

[ ] Vencimentos controlados com alertas de 30 dias', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Compromisso verbal sem contrato → risco jurídico e financeiro

Documento salvo fora da pasta restrita → acesso indevido

Contrato vencido sem renovação → operação sem cobertura legal', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'ClickSign, Google Drive, TBO OS.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Revisão de templates: semestral

Armazenamento: imediato após assinatura

Alerta de vencimento: 30 dias antes

Regra: nenhum compromisso financeiro/legal é assumido verbalmente', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Necessidade de Contrato → Selecionar Template → Personalizar → Revisão (Marco) → ClickSign (assinatura) → Armazenamento (pasta restrita) → Controle de Vencimento → 30 dias antes: Alerta → Renovar / Renegociar / Encerrar → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'ClickSign: plataforma de assinatura digital com validade jurídica.

NDA: Non-Disclosure Agreement — acordo de confidencialidade.

Nomenclatura padrão: formato de nomeação de arquivos para rastreabilidade.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

END $$;
