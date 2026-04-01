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
    'Seguranca da Informacao',
    'tbo-pol-002-seguranca-da-informacao',
    'politicas',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Segurança da Informação</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-POL-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Políticas (Compliance)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Proteger dados da TBO, clientes e colaboradores contra acesso não autorizado, perda ou vazamento, com práticas mínimas de segurança.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Classificação de dados (público, interno, confidencial, restrito), gestão de acessos RBAC, autenticação, proteção de dados de clientes e backup.</p><p><strong>2.2 Exclusões</strong></p><p>Código de conduta (SOP-POL-001), propriedade intelectual (SOP-POL-003), infraestrutura de TI avançada (responsabilidade de fornecedor).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir políticas, revisar acessos, monitorar compliance</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Executar configurações de acesso e backup operacional</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir as políticas de segurança</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Modelo RBAC do TBO OS definido (sócio=5, PO=4, colaborador=3, viewer=2, guest=1); Google Workspace configurado; lista de ferramentas com credenciais.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (RBAC), Google Workspace (2FA), Supabase (backup), Google Drive.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Classificação de Dados</strong></p><p>Ação: Toda informação é classificada: Público (portfolio publicado), Interno (SOPs, processos), Confidencial (contratos, financeiro, dados de clientes pré-lançamento), Restrito (senhas, tokens, dados bancários, dados pessoais).</p><p>Responsável: Marco</p><p>Output: Classificação documentada</p><p>Prazo referência: Versão inicial + revisão anual</p><p><strong>5.2. Gestão de Acessos</strong></p><p>Ação: TBO OS segue RBAC com princípio do menor privilégio. Carol configura acessos conforme role. Marco faz revisão trimestral de acessos.</p><p>Responsável: Carol + Marco</p><p>Output: Acessos configurados e revisados</p><p>Prazo referência: Contínuo + revisão trimestral</p><p><strong>5.3. Autenticação e Senhas</strong></p><p>Ação: Google OAuth para TBO OS e Workspace. 2FA obrigatório para contas críticas (e-mail, Omie, RD Station). Senhas em gerenciador — nunca em planilhas.</p><p>Responsável: Todos</p><p>Output: Autenticação segura configurada</p><p>Prazo referência: Contínuo</p><p><strong>5.4. Backup</strong></p><p>Ação: Google Drive: backup automático. Projetos 3D (pesados): backup semanal em HD externo. Supabase: backup diário automático.</p><p>Responsável: Carol (Ops)</p><p>Output: Backups executados conforme política</p><p>Prazo referência: Semanal (3D) / Diário (Supabase)</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Classificação de dados documentada</li><li>[ ] RBAC configurado e revisado trimestralmente</li><li>[ ] 2FA ativo em contas críticas</li><li>[ ] Senhas em gerenciador (nunca em planilhas)</li><li>[ ] Backups executados conforme cronograma</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Compartilhar credenciais por chat → risco de vazamento</li><li>Não revogar acessos de ex-colaboradores → porta aberta</li><li>Backup manual sem verificação → falsa sensação de segurança</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (RBAC), Google Workspace (2FA, Drive), Supabase, gerenciador de senhas.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Revisão de acessos: trimestral</li><li>Revogação pós-desligamento: até 2h</li><li>Backup 3D: semanal</li><li>Backup Supabase: diário</li><li>Regra: violação de segurança = falta grave</li></ul><p><strong>9. Fluxograma</strong></p><p>Classificação Definida → Acessos RBAC Configurados → 2FA Ativo → Backup Operacional → Revisão Trimestral → Incidente? → Sim: Investigação → Medida → Fim / Não: Próxima Revisão → Fim</p><p><strong>10. Glossário</strong></p><p>RBAC: Role-Based Access Control — controle de acesso por papéis.</p><p>2FA: autenticação em dois fatores para segurança adicional.</p><p>Menor privilégio: princípio de conceder apenas o acesso mínimo necessário.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['politica','compliance','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-POL-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Proteger dados da TBO, clientes e colaboradores contra acesso não autorizado, perda ou vazamento, com práticas mínimas de segurança.', '<p>Proteger dados da TBO, clientes e colaboradores contra acesso não autorizado, perda ou vazamento, com práticas mínimas de segurança.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Classificação de dados (público, interno, confidencial, restrito), gestão de acessos RBAC, autenticação, proteção de dados de clientes e backup.', '<p>Classificação de dados (público, interno, confidencial, restrito), gestão de acessos RBAC, autenticação, proteção de dados de clientes e backup.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Código de conduta (SOP-POL-001), propriedade intelectual (SOP-POL-003), infraestrutura de TI avançada (responsabilidade de fornecedor).', '<p>Código de conduta (SOP-POL-001), propriedade intelectual (SOP-POL-003), infraestrutura de TI avançada (responsabilidade de fornecedor).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir políticas, revisar acessos, monitorar compliance</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Executar configurações de acesso e backup operacional</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir as políticas de segurança</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Modelo RBAC do TBO OS definido (sócio=5, PO=4, colaborador=3, viewer=2, guest=1); Google Workspace configurado; lista de ferramentas com credenciais.', '<p>Modelo RBAC do TBO OS definido (sócio=5, PO=4, colaborador=3, viewer=2, guest=1); Google Workspace configurado; lista de ferramentas com credenciais.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (RBAC), Google Workspace (2FA), Supabase (backup), Google Drive.', '<p>TBO OS (RBAC), Google Workspace (2FA), Supabase (backup), Google Drive.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Classificação de Dados', 'Ação: Toda informação é classificada: Público (portfolio publicado), Interno (SOPs, processos), Confidencial (contratos, financeiro, dados de clientes pré-lançamento), Restrito (senhas, tokens, dados bancários, dados pessoais).

Responsável: Marco

Output: Classificação documentada

Prazo referência: Versão inicial + revisão anual', '<p>Ação: Toda informação é classificada: Público (portfolio publicado), Interno (SOPs, processos), Confidencial (contratos, financeiro, dados de clientes pré-lançamento), Restrito (senhas, tokens, dados bancários, dados pessoais).</p><p>Responsável: Marco</p><p>Output: Classificação documentada</p><p>Prazo referência: Versão inicial + revisão anual</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Gestão de Acessos', 'Ação: TBO OS segue RBAC com princípio do menor privilégio. Carol configura acessos conforme role. Marco faz revisão trimestral de acessos.

Responsável: Carol + Marco

Output: Acessos configurados e revisados

Prazo referência: Contínuo + revisão trimestral', '<p>Ação: TBO OS segue RBAC com princípio do menor privilégio. Carol configura acessos conforme role. Marco faz revisão trimestral de acessos.</p><p>Responsável: Carol + Marco</p><p>Output: Acessos configurados e revisados</p><p>Prazo referência: Contínuo + revisão trimestral</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Autenticação e Senhas', 'Ação: Google OAuth para TBO OS e Workspace. 2FA obrigatório para contas críticas (e-mail, Omie, RD Station). Senhas em gerenciador — nunca em planilhas.

Responsável: Todos

Output: Autenticação segura configurada

Prazo referência: Contínuo', '<p>Ação: Google OAuth para TBO OS e Workspace. 2FA obrigatório para contas críticas (e-mail, Omie, RD Station). Senhas em gerenciador — nunca em planilhas.</p><p>Responsável: Todos</p><p>Output: Autenticação segura configurada</p><p>Prazo referência: Contínuo</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Backup', 'Ação: Google Drive: backup automático. Projetos 3D (pesados): backup semanal em HD externo. Supabase: backup diário automático.

Responsável: Carol (Ops)

Output: Backups executados conforme política

Prazo referência: Semanal (3D) / Diário (Supabase)', '<p>Ação: Google Drive: backup automático. Projetos 3D (pesados): backup semanal em HD externo. Supabase: backup diário automático.</p><p>Responsável: Carol (Ops)</p><p>Output: Backups executados conforme política</p><p>Prazo referência: Semanal (3D) / Diário (Supabase)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Classificação de dados documentada

[ ] RBAC configurado e revisado trimestralmente

[ ] 2FA ativo em contas críticas

[ ] Senhas em gerenciador (nunca em planilhas)

[ ] Backups executados conforme cronograma', '<ul><li>[ ] Classificação de dados documentada</li><li>[ ] RBAC configurado e revisado trimestralmente</li><li>[ ] 2FA ativo em contas críticas</li><li>[ ] Senhas em gerenciador (nunca em planilhas)</li><li>[ ] Backups executados conforme cronograma</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Compartilhar credenciais por chat → risco de vazamento

Não revogar acessos de ex-colaboradores → porta aberta

Backup manual sem verificação → falsa sensação de segurança', '<ul><li>Compartilhar credenciais por chat → risco de vazamento</li><li>Não revogar acessos de ex-colaboradores → porta aberta</li><li>Backup manual sem verificação → falsa sensação de segurança</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (RBAC), Google Workspace (2FA, Drive), Supabase, gerenciador de senhas.', '<p>TBO OS (RBAC), Google Workspace (2FA, Drive), Supabase, gerenciador de senhas.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Revisão de acessos: trimestral

Revogação pós-desligamento: até 2h

Backup 3D: semanal

Backup Supabase: diário

Regra: violação de segurança = falta grave', '<ul><li>Revisão de acessos: trimestral</li><li>Revogação pós-desligamento: até 2h</li><li>Backup 3D: semanal</li><li>Backup Supabase: diário</li><li>Regra: violação de segurança = falta grave</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Classificação Definida → Acessos RBAC Configurados → 2FA Ativo → Backup Operacional → Revisão Trimestral → Incidente? → Sim: Investigação → Medida → Fim / Não: Próxima Revisão → Fim', '<p>Classificação Definida → Acessos RBAC Configurados → 2FA Ativo → Backup Operacional → Revisão Trimestral → Incidente? → Sim: Investigação → Medida → Fim / Não: Próxima Revisão → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'RBAC: Role-Based Access Control — controle de acesso por papéis.

2FA: autenticação em dois fatores para segurança adicional.

Menor privilégio: princípio de conceder apenas o acesso mínimo necessário.', '<p>RBAC: Role-Based Access Control — controle de acesso por papéis.</p><p>2FA: autenticação em dois fatores para segurança adicional.</p><p>Menor privilégio: princípio de conceder apenas o acesso mínimo necessário.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-POL-003: Propriedade Intelectual e Direitos Autorais ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Propriedade Intelectual e Direitos Autorais',
    'tbo-pol-003-propriedade-intelectual-e-direitos-autorais',
    'politicas',
    'checklist',
    'Propriedade Intelectual e Direitos Autorais',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Propriedade Intelectual e Direitos Autorais</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-POL-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Políticas (Compliance)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Definir regras de propriedade intelectual para proteger ativos criativos da TBO e direitos dos clientes sobre materiais produzidos.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Propriedade de trabalhos para clientes, ativos internos da TBO, uso de stock e licenças, e cessão de direitos de freelancers.</p><p><strong>2.2 Exclusões</strong></p><p>Código de conduta (SOP-POL-001), segurança da informação (SOP-POL-002), gestão de contratos (SOP-POL-004).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir políticas e garantir cláusulas em contratos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Manter registro de licenças, incluir cláusulas em contratos de freelancer</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir as políticas de PI</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Templates de contrato com cláusulas de PI; registro de licenças de software e stock; política de uso de portfólio.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS, Google Drive (registro de licenças), ClickSign.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Trabalho para Clientes</strong></p><p>Ação: Materiais produzidos para cliente são de propriedade do cliente após pagamento integral. TBO retém direito de uso para portfólio, desde que autorizado (por escrito).</p><p>Responsável: Marco</p><p>Output: Cláusula em contrato</p><p>Prazo referência: Em todo contrato</p><p><strong>5.2. Ativos Internos da TBO</strong></p><p>Ação: Templates, processos, metodologias, ferramentas (TBO OS, Bia, skills) são propriedade exclusiva. Nenhum colaborador pode reproduzir ou utilizar fora do contexto de trabalho.</p><p>Responsável: Marco</p><p>Output: Política documentada e comunicada</p><p>Prazo referência: No onboarding</p><p><strong>5.3. Stock e Licenças</strong></p><p>Ação: Imagens de stock, fontes e plugins devem ter licença válida. Carol mantém registro de licenças ativas. Uso de material sem licença é proibido.</p><p>Responsável: Carol (Ops)</p><p>Output: Registro de licenças atualizado</p><p>Prazo referência: Contínuo</p><p><strong>5.4. Contratos de Freelancer</strong></p><p>Ação: Todo contrato com freelancer inclui cláusula de cessão de direitos autorais sobre material produzido para TBO/cliente.</p><p>Responsável: Carol (Ops)</p><p>Output: Cláusula de cessão em contrato</p><p>Prazo referência: Em todo contrato de freelancer</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Cláusula de PI em todos os contratos de cliente</li><li>[ ] Cláusula de cessão em todos os contratos de freelancer</li><li>[ ] Registro de licenças de stock e software atualizado</li><li>[ ] Política de portfólio comunicada a toda equipe</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Material de cliente em portfólio sem autorização → violação de confiança e possível ação legal</li><li>Freelancer sem cessão de direitos → disputa sobre autoria</li><li>Software/stock pirata → risco legal e reputacional</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS, Google Drive, ClickSign.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Cláusula de PI: em todo contrato</li><li>Registro de licenças: atualização contínua</li><li>Autorização de portfólio: antes de qualquer publicação</li><li>Regra: material pré-lançamento é especialmente sensível — publicação proibida sem autorização</li></ul><p><strong>9. Fluxograma</strong></p><p>Projeto Iniciado → Contrato com Cláusula de PI → Produção (licenças verificadas) → Entrega + Pagamento → Propriedade transferida ao cliente → Usar em portfólio? → Autorização por escrito → Publicar / Não publicar → Fim</p><p><strong>10. Glossário</strong></p><p>PI: Propriedade Intelectual — direitos sobre criações do intelecto.</p><p>Cessão de direitos: transferência formal da autoria de um material.</p><p>Stock: banco de imagens, vídeos ou áudio licenciados para uso comercial.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['politica','compliance','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-POL-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Definir regras de propriedade intelectual para proteger ativos criativos da TBO e direitos dos clientes sobre materiais produzidos.', '<p>Definir regras de propriedade intelectual para proteger ativos criativos da TBO e direitos dos clientes sobre materiais produzidos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Propriedade de trabalhos para clientes, ativos internos da TBO, uso de stock e licenças, e cessão de direitos de freelancers.', '<p>Propriedade de trabalhos para clientes, ativos internos da TBO, uso de stock e licenças, e cessão de direitos de freelancers.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Código de conduta (SOP-POL-001), segurança da informação (SOP-POL-002), gestão de contratos (SOP-POL-004).', '<p>Código de conduta (SOP-POL-001), segurança da informação (SOP-POL-002), gestão de contratos (SOP-POL-004).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir políticas e garantir cláusulas em contratos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Manter registro de licenças, incluir cláusulas em contratos de freelancer</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir as políticas de PI</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Templates de contrato com cláusulas de PI; registro de licenças de software e stock; política de uso de portfólio.', '<p>Templates de contrato com cláusulas de PI; registro de licenças de software e stock; política de uso de portfólio.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Drive (registro de licenças), ClickSign.', '<p>TBO OS, Google Drive (registro de licenças), ClickSign.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Trabalho para Clientes', 'Ação: Materiais produzidos para cliente são de propriedade do cliente após pagamento integral. TBO retém direito de uso para portfólio, desde que autorizado (por escrito).

Responsável: Marco

Output: Cláusula em contrato

Prazo referência: Em todo contrato', '<p>Ação: Materiais produzidos para cliente são de propriedade do cliente após pagamento integral. TBO retém direito de uso para portfólio, desde que autorizado (por escrito).</p><p>Responsável: Marco</p><p>Output: Cláusula em contrato</p><p>Prazo referência: Em todo contrato</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Ativos Internos da TBO', 'Ação: Templates, processos, metodologias, ferramentas (TBO OS, Bia, skills) são propriedade exclusiva. Nenhum colaborador pode reproduzir ou utilizar fora do contexto de trabalho.

Responsável: Marco

Output: Política documentada e comunicada

Prazo referência: No onboarding', '<p>Ação: Templates, processos, metodologias, ferramentas (TBO OS, Bia, skills) são propriedade exclusiva. Nenhum colaborador pode reproduzir ou utilizar fora do contexto de trabalho.</p><p>Responsável: Marco</p><p>Output: Política documentada e comunicada</p><p>Prazo referência: No onboarding</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Stock e Licenças', 'Ação: Imagens de stock, fontes e plugins devem ter licença válida. Carol mantém registro de licenças ativas. Uso de material sem licença é proibido.

Responsável: Carol (Ops)

Output: Registro de licenças atualizado

Prazo referência: Contínuo', '<p>Ação: Imagens de stock, fontes e plugins devem ter licença válida. Carol mantém registro de licenças ativas. Uso de material sem licença é proibido.</p><p>Responsável: Carol (Ops)</p><p>Output: Registro de licenças atualizado</p><p>Prazo referência: Contínuo</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Contratos de Freelancer', 'Ação: Todo contrato com freelancer inclui cláusula de cessão de direitos autorais sobre material produzido para TBO/cliente.

Responsável: Carol (Ops)

Output: Cláusula de cessão em contrato

Prazo referência: Em todo contrato de freelancer', '<p>Ação: Todo contrato com freelancer inclui cláusula de cessão de direitos autorais sobre material produzido para TBO/cliente.</p><p>Responsável: Carol (Ops)</p><p>Output: Cláusula de cessão em contrato</p><p>Prazo referência: Em todo contrato de freelancer</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Cláusula de PI em todos os contratos de cliente

[ ] Cláusula de cessão em todos os contratos de freelancer

[ ] Registro de licenças de stock e software atualizado

[ ] Política de portfólio comunicada a toda equipe', '<ul><li>[ ] Cláusula de PI em todos os contratos de cliente</li><li>[ ] Cláusula de cessão em todos os contratos de freelancer</li><li>[ ] Registro de licenças de stock e software atualizado</li><li>[ ] Política de portfólio comunicada a toda equipe</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Material de cliente em portfólio sem autorização → violação de confiança e possível ação legal

Freelancer sem cessão de direitos → disputa sobre autoria

Software/stock pirata → risco legal e reputacional', '<ul><li>Material de cliente em portfólio sem autorização → violação de confiança e possível ação legal</li><li>Freelancer sem cessão de direitos → disputa sobre autoria</li><li>Software/stock pirata → risco legal e reputacional</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS, Google Drive, ClickSign.', '<p>TBO OS, Google Drive, ClickSign.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Cláusula de PI: em todo contrato

Registro de licenças: atualização contínua

Autorização de portfólio: antes de qualquer publicação

Regra: material pré-lançamento é especialmente sensível — publicação proibida sem autorização', '<ul><li>Cláusula de PI: em todo contrato</li><li>Registro de licenças: atualização contínua</li><li>Autorização de portfólio: antes de qualquer publicação</li><li>Regra: material pré-lançamento é especialmente sensível — publicação proibida sem autorização</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Projeto Iniciado → Contrato com Cláusula de PI → Produção (licenças verificadas) → Entrega + Pagamento → Propriedade transferida ao cliente → Usar em portfólio? → Autorização por escrito → Publicar / Não publicar → Fim', '<p>Projeto Iniciado → Contrato com Cláusula de PI → Produção (licenças verificadas) → Entrega + Pagamento → Propriedade transferida ao cliente → Usar em portfólio? → Autorização por escrito → Publicar / Não publicar → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'PI: Propriedade Intelectual — direitos sobre criações do intelecto.

Cessão de direitos: transferência formal da autoria de um material.

Stock: banco de imagens, vídeos ou áudio licenciados para uso comercial.', '<p>PI: Propriedade Intelectual — direitos sobre criações do intelecto.</p><p>Cessão de direitos: transferência formal da autoria de um material.</p><p>Stock: banco de imagens, vídeos ou áudio licenciados para uso comercial.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-POL-004: Gestao de Contratos e Documentos Legais ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestao de Contratos e Documentos Legais',
    'tbo-pol-004-gestao-de-contratos-e-documentos-legais',
    'politicas',
    'checklist',
    'Gestão de Contratos e Documentos Legais',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Contratos e Documentos Legais</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-POL-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Políticas (Compliance)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Garantir que todos os documentos legais sejam padronizados, assinados digitalmente, armazenados com segurança e rastreáveis, com controle de vencimentos.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Templates jurídicos, assinatura via ClickSign, armazenamento seguro, nomenclatura padrão e controle de vencimentos/renovações.</p><p><strong>2.2 Exclusões</strong></p><p>Elaboração de propostas comerciais (SOP-COM-002), código de conduta (SOP-POL-001), contratos de trabalho CLT (contabilidade externa).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Gerar contratos, enviar para assinatura, controlar vencimentos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Revisar termos, aprovar contratos, decidir renovações</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Co-aprovar contratos estratégicos</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Templates jurídicos revisados; ClickSign configurado; pasta segura no Drive; nomenclatura padrão definida.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>ClickSign, Google Drive (pasta restrita), TBO OS (vencimentos).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Templates Padronizados</strong></p><p>Ação: TBO mantém templates para: contrato de prestação de serviços, NDA, contrato PJ, termo de parceria, proposta comercial. Revisão semestral ou quando houver mudança legal.</p><p>Responsável: Marco + Carol</p><p>Output: Templates atualizados no Drive</p><p>Prazo referência: Semestral</p><p><strong>5.2. Assinatura Digital</strong></p><p>Ação: Todo documento legal é assinado via ClickSign. Assinaturas físicas aceitas apenas como exceção com autorização de Marco.</p><p>Responsável: Carol (Ops)</p><p>Output: Documento assinado digitalmente</p><p>Prazo referência: Conforme necessidade</p><p><strong>5.3. Armazenamento Seguro</strong></p><p>Ação: Documentos assinados armazenados em pasta restrita no Drive (acesso: sócios + Carol). Nomenclatura: [TIPO]_[CLIENTE/NOME]_[DATA]_v[VERSÃO].</p><p>Responsável: Carol (Ops)</p><p>Output: Documento armazenado conforme padrão</p><p>Prazo referência: Imediato após assinatura</p><p><strong>5.4. Controle de Vencimentos</strong></p><p>Ação: Carol mantém controle no TBO OS. Alerta 30 dias antes do vencimento para decisão de renovação, renegociação ou encerramento.</p><p>Responsável: Carol (Ops)</p><p>Output: Alerta enviado, decisão registrada</p><p>Prazo referência: 30 dias antes do vencimento</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Templates revisados semestralmente</li><li>[ ] Todos os contratos assinados via ClickSign</li><li>[ ] Documentos armazenados na pasta restrita com nomenclatura padrão</li><li>[ ] Vencimentos controlados com alertas de 30 dias</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Compromisso verbal sem contrato → risco jurídico e financeiro</li><li>Documento salvo fora da pasta restrita → acesso indevido</li><li>Contrato vencido sem renovação → operação sem cobertura legal</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>ClickSign, Google Drive, TBO OS.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Revisão de templates: semestral</li><li>Armazenamento: imediato após assinatura</li><li>Alerta de vencimento: 30 dias antes</li><li>Regra: nenhum compromisso financeiro/legal é assumido verbalmente</li></ul><p><strong>9. Fluxograma</strong></p><p>Necessidade de Contrato → Selecionar Template → Personalizar → Revisão (Marco) → ClickSign (assinatura) → Armazenamento (pasta restrita) → Controle de Vencimento → 30 dias antes: Alerta → Renovar / Renegociar / Encerrar → Fim</p><p><strong>10. Glossário</strong></p><p>ClickSign: plataforma de assinatura digital com validade jurídica.</p><p>NDA: Non-Disclosure Agreement — acordo de confidencialidade.</p><p>Nomenclatura padrão: formato de nomeação de arquivos para rastreabilidade.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['politica','compliance','entrega','qualidade','cliente','aprovacao']::TEXT[],
    3,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-POL-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todos os documentos legais sejam padronizados, assinados digitalmente, armazenados com segurança e rastreáveis, com controle de vencimentos.', '<p>Garantir que todos os documentos legais sejam padronizados, assinados digitalmente, armazenados com segurança e rastreáveis, com controle de vencimentos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Templates jurídicos, assinatura via ClickSign, armazenamento seguro, nomenclatura padrão e controle de vencimentos/renovações.', '<p>Templates jurídicos, assinatura via ClickSign, armazenamento seguro, nomenclatura padrão e controle de vencimentos/renovações.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Elaboração de propostas comerciais (SOP-COM-002), código de conduta (SOP-POL-001), contratos de trabalho CLT (contabilidade externa).', '<p>Elaboração de propostas comerciais (SOP-COM-002), código de conduta (SOP-POL-001), contratos de trabalho CLT (contabilidade externa).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Gerar contratos, enviar para assinatura, controlar vencimentos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Revisar termos, aprovar contratos, decidir renovações</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Co-aprovar contratos estratégicos</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Templates jurídicos revisados; ClickSign configurado; pasta segura no Drive; nomenclatura padrão definida.', '<p>Templates jurídicos revisados; ClickSign configurado; pasta segura no Drive; nomenclatura padrão definida.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'ClickSign, Google Drive (pasta restrita), TBO OS (vencimentos).', '<p>ClickSign, Google Drive (pasta restrita), TBO OS (vencimentos).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Templates Padronizados', 'Ação: TBO mantém templates para: contrato de prestação de serviços, NDA, contrato PJ, termo de parceria, proposta comercial. Revisão semestral ou quando houver mudança legal.

Responsável: Marco + Carol

Output: Templates atualizados no Drive

Prazo referência: Semestral', '<p>Ação: TBO mantém templates para: contrato de prestação de serviços, NDA, contrato PJ, termo de parceria, proposta comercial. Revisão semestral ou quando houver mudança legal.</p><p>Responsável: Marco + Carol</p><p>Output: Templates atualizados no Drive</p><p>Prazo referência: Semestral</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Assinatura Digital', 'Ação: Todo documento legal é assinado via ClickSign. Assinaturas físicas aceitas apenas como exceção com autorização de Marco.

Responsável: Carol (Ops)

Output: Documento assinado digitalmente

Prazo referência: Conforme necessidade', '<p>Ação: Todo documento legal é assinado via ClickSign. Assinaturas físicas aceitas apenas como exceção com autorização de Marco.</p><p>Responsável: Carol (Ops)</p><p>Output: Documento assinado digitalmente</p><p>Prazo referência: Conforme necessidade</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Armazenamento Seguro', 'Ação: Documentos assinados armazenados em pasta restrita no Drive (acesso: sócios + Carol). Nomenclatura: [TIPO]_[CLIENTE/NOME]_[DATA]_v[VERSÃO].

Responsável: Carol (Ops)

Output: Documento armazenado conforme padrão

Prazo referência: Imediato após assinatura', '<p>Ação: Documentos assinados armazenados em pasta restrita no Drive (acesso: sócios + Carol). Nomenclatura: [TIPO]_[CLIENTE/NOME]_[DATA]_v[VERSÃO].</p><p>Responsável: Carol (Ops)</p><p>Output: Documento armazenado conforme padrão</p><p>Prazo referência: Imediato após assinatura</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Controle de Vencimentos', 'Ação: Carol mantém controle no TBO OS. Alerta 30 dias antes do vencimento para decisão de renovação, renegociação ou encerramento.

Responsável: Carol (Ops)

Output: Alerta enviado, decisão registrada

Prazo referência: 30 dias antes do vencimento', '<p>Ação: Carol mantém controle no TBO OS. Alerta 30 dias antes do vencimento para decisão de renovação, renegociação ou encerramento.</p><p>Responsável: Carol (Ops)</p><p>Output: Alerta enviado, decisão registrada</p><p>Prazo referência: 30 dias antes do vencimento</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Templates revisados semestralmente

[ ] Todos os contratos assinados via ClickSign

[ ] Documentos armazenados na pasta restrita com nomenclatura padrão

[ ] Vencimentos controlados com alertas de 30 dias', '<ul><li>[ ] Templates revisados semestralmente</li><li>[ ] Todos os contratos assinados via ClickSign</li><li>[ ] Documentos armazenados na pasta restrita com nomenclatura padrão</li><li>[ ] Vencimentos controlados com alertas de 30 dias</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Compromisso verbal sem contrato → risco jurídico e financeiro

Documento salvo fora da pasta restrita → acesso indevido

Contrato vencido sem renovação → operação sem cobertura legal', '<ul><li>Compromisso verbal sem contrato → risco jurídico e financeiro</li><li>Documento salvo fora da pasta restrita → acesso indevido</li><li>Contrato vencido sem renovação → operação sem cobertura legal</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'ClickSign, Google Drive, TBO OS.', '<p>ClickSign, Google Drive, TBO OS.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Revisão de templates: semestral

Armazenamento: imediato após assinatura

Alerta de vencimento: 30 dias antes

Regra: nenhum compromisso financeiro/legal é assumido verbalmente', '<ul><li>Revisão de templates: semestral</li><li>Armazenamento: imediato após assinatura</li><li>Alerta de vencimento: 30 dias antes</li><li>Regra: nenhum compromisso financeiro/legal é assumido verbalmente</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Necessidade de Contrato → Selecionar Template → Personalizar → Revisão (Marco) → ClickSign (assinatura) → Armazenamento (pasta restrita) → Controle de Vencimento → 30 dias antes: Alerta → Renovar / Renegociar / Encerrar → Fim', '<p>Necessidade de Contrato → Selecionar Template → Personalizar → Revisão (Marco) → ClickSign (assinatura) → Armazenamento (pasta restrita) → Controle de Vencimento → 30 dias antes: Alerta → Renovar / Renegociar / Encerrar → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'ClickSign: plataforma de assinatura digital com validade jurídica.

NDA: Non-Disclosure Agreement — acordo de confidencialidade.

Nomenclatura padrão: formato de nomeação de arquivos para rastreabilidade.', '<p>ClickSign: plataforma de assinatura digital com validade jurídica.</p><p>NDA: Non-Disclosure Agreement — acordo de confidencialidade.</p><p>Nomenclatura padrão: formato de nomeação de arquivos para rastreabilidade.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  RAISE NOTICE 'Seed completo: 78 SOPs inseridos.';
END $$;

END $$;