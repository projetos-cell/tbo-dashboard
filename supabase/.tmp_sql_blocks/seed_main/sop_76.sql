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
END $$;