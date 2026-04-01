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
    'Elaboracao e Envio de Proposta Comercial',
    'tbo-com-002-elaboracao-e-envio-de-proposta-comercial',
    'comercial',
    'checklist',
    'Elaboração e Envio de Proposta Comercial',
    'Standard Operating Procedure

Elaboração e Envio de Proposta Comercial

Código

TBO-COM-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Comercial (Vendas / BD)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Padronizar a elaboração de propostas comerciais, garantindo consistência na apresentação, precificação e termos, com revisão obrigatória dos sócios antes do envio.

2. Escopo

2.1 O que está coberto

Composição da proposta (template padrão TBO), revisão de sócios, envio, versionamento e negociação.

2.2 Exclusões

Diagnóstico comercial (SOP-COM-001), contratação pós-aceite (SOP-COM-003), precificação unitária de serviços (SOP-OPS-006).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy Lima

Definir escopo e precificação, conduzir negociação

Executor

---

Marco

Validar escopo operacional e viabilidade de cronograma

Aprovador

---

Carol (Ops)

Formatar proposta no template TBO

Consultor

---



4. Pré-requisitos

4.1 Inputs necessários

Diagnóstico concluído (SOP-COM-001); tabela de preços atualizada; template de proposta TBO (papel timbrado, Plus Jakarta Sans); capacidade operacional validada.

4.2 Ferramentas e Acessos

Google Drive (template e versionamento), TBO OS, RD Station CRM, E-mail corporativo.

5. Procedimento Passo a Passo

5.1. Composição da Proposta

Ação: Ruy monta a proposta com base no diagnóstico, seguindo template padrão: capa TBO, contexto/diagnóstico do empreendimento, escopo detalhado por BU com entregáveis, cronograma macro, investimento (valores por BU ou pacote, condições de pagamento), termos e condições.

Responsável: Ruy Lima

Output: Proposta em PDF no template TBO

Prazo referência: Até 3 dias úteis após diagnóstico

5.2. Revisão dos Sócios

Ação: Marco valida escopo criativo/operacional e cronograma. Ruy valida estratégia e precificação. Para propostas acima de R$ 50.000, ambos revisam em conjunto.

Responsável: Marco + Ruy

Output: Proposta aprovada para envio

Prazo referência: Até 24h após composição

5.3. Envio ao Cliente

Ação: Proposta enviada por e-mail com PDF anexo. Status atualizado no RD Station CRM para Proposta Enviada. Follow-up agendado para D+3.

Responsável: Ruy Lima

Output: Proposta enviada e CRM atualizado

Prazo referência: No mesmo dia da aprovação

5.4. Negociação e Versionamento

Ação: Ruy conduz a negociação. Alterações de escopo ou preço geram nova versão (v2, v3). Desconto acima de 10% requer aprovação conjunta dos sócios. Versão final salva no Drive.

Responsável: Ruy Lima

Output: Versão final aceita ou oportunidade perdida

Prazo referência: Até 15 dias úteis (prazo máximo de negociação)

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Proposta no template padrão TBO com todas as seções

[ ] Escopo detalhado por BU com entregáveis claros

[ ] Revisão de pelo menos um sócio realizada

[ ] PDF enviado e status atualizado no CRM

[ ] Versão final salva no Google Drive

6.2 Erros Comuns a Evitar

Enviar proposta sem revisão de sócio → risco de escopo sub ou superdimensionado

Não versionar alterações → confusão sobre o que foi acordado

Desconto sem aprovação → margem comprometida sem decisão informada

7. Ferramentas e Templates

Google Drive (template, versionamento), RD Station CRM (funil), E-mail (envio), TBO OS (referência de capacidade).

8. SLAs e Prazos

Composição: até 3 dias úteis após diagnóstico

Revisão: até 24h

Follow-up pós-envio: D+3

Prazo máximo de negociação: 15 dias úteis (após, reclassificar no pipeline)

Regra: nenhuma proposta sai sem revisão de pelo menos um sócio

9. Fluxograma

Diagnóstico Concluído → Composição da Proposta (template TBO) → Revisão Marco/Ruy → Aprovada? → Sim: Envio ao Cliente → Follow-up D+3 → Negociação → Aceita? → SOP-COM-003 / Não: Registro como Perdida → Fim

10. Glossário

Template TBO: modelo padronizado de proposta com identidade visual da agência.

Versionamento: controle de alterações (v1, v2, v3) para rastreabilidade.

Fee mínimo: valor mínimo por projeto que viabiliza a operação da TBO.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Elaboração e Envio de Proposta Comercial</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-COM-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Comercial (Vendas / BD)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar a elaboração de propostas comerciais, garantindo consistência na apresentação, precificação e termos, com revisão obrigatória dos sócios antes do envio.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Composição da proposta (template padrão TBO), revisão de sócios, envio, versionamento e negociação.</p><p><strong>2.2 Exclusões</strong></p><p>Diagnóstico comercial (SOP-COM-001), contratação pós-aceite (SOP-COM-003), precificação unitária de serviços (SOP-OPS-006).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Definir escopo e precificação, conduzir negociação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar escopo operacional e viabilidade de cronograma</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Formatar proposta no template TBO</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Diagnóstico concluído (SOP-COM-001); tabela de preços atualizada; template de proposta TBO (papel timbrado, Plus Jakarta Sans); capacidade operacional validada.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Drive (template e versionamento), TBO OS, RD Station CRM, E-mail corporativo.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Composição da Proposta</strong></p><p>Ação: Ruy monta a proposta com base no diagnóstico, seguindo template padrão: capa TBO, contexto/diagnóstico do empreendimento, escopo detalhado por BU com entregáveis, cronograma macro, investimento (valores por BU ou pacote, condições de pagamento), termos e condições.</p><p>Responsável: Ruy Lima</p><p>Output: Proposta em PDF no template TBO</p><p>Prazo referência: Até 3 dias úteis após diagnóstico</p><p><strong>5.2. Revisão dos Sócios</strong></p><p>Ação: Marco valida escopo criativo/operacional e cronograma. Ruy valida estratégia e precificação. Para propostas acima de R$ 50.000, ambos revisam em conjunto.</p><p>Responsável: Marco + Ruy</p><p>Output: Proposta aprovada para envio</p><p>Prazo referência: Até 24h após composição</p><p><strong>5.3. Envio ao Cliente</strong></p><p>Ação: Proposta enviada por e-mail com PDF anexo. Status atualizado no RD Station CRM para Proposta Enviada. Follow-up agendado para D+3.</p><p>Responsável: Ruy Lima</p><p>Output: Proposta enviada e CRM atualizado</p><p>Prazo referência: No mesmo dia da aprovação</p><p><strong>5.4. Negociação e Versionamento</strong></p><p>Ação: Ruy conduz a negociação. Alterações de escopo ou preço geram nova versão (v2, v3). Desconto acima de 10% requer aprovação conjunta dos sócios. Versão final salva no Drive.</p><p>Responsável: Ruy Lima</p><p>Output: Versão final aceita ou oportunidade perdida</p><p>Prazo referência: Até 15 dias úteis (prazo máximo de negociação)</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Proposta no template padrão TBO com todas as seções</li><li>[ ] Escopo detalhado por BU com entregáveis claros</li><li>[ ] Revisão de pelo menos um sócio realizada</li><li>[ ] PDF enviado e status atualizado no CRM</li><li>[ ] Versão final salva no Google Drive</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Enviar proposta sem revisão de sócio → risco de escopo sub ou superdimensionado</li><li>Não versionar alterações → confusão sobre o que foi acordado</li><li>Desconto sem aprovação → margem comprometida sem decisão informada</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>Google Drive (template, versionamento), RD Station CRM (funil), E-mail (envio), TBO OS (referência de capacidade).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Composição: até 3 dias úteis após diagnóstico</li><li>Revisão: até 24h</li><li>Follow-up pós-envio: D+3</li><li>Prazo máximo de negociação: 15 dias úteis (após, reclassificar no pipeline)</li><li>Regra: nenhuma proposta sai sem revisão de pelo menos um sócio</li></ul><p><strong>9. Fluxograma</strong></p><p>Diagnóstico Concluído → Composição da Proposta (template TBO) → Revisão Marco/Ruy → Aprovada? → Sim: Envio ao Cliente → Follow-up D+3 → Negociação → Aceita? → SOP-COM-003 / Não: Registro como Perdida → Fim</p><p><strong>10. Glossário</strong></p><p>Template TBO: modelo padronizado de proposta com identidade visual da agência.</p><p>Versionamento: controle de alterações (v1, v2, v3) para rastreabilidade.</p><p>Fee mínimo: valor mínimo por projeto que viabiliza a operação da TBO.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['comercial','vendas','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-COM-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar a elaboração de propostas comerciais, garantindo consistência na apresentação, precificação e termos, com revisão obrigatória dos sócios antes do envio.', '<p>Padronizar a elaboração de propostas comerciais, garantindo consistência na apresentação, precificação e termos, com revisão obrigatória dos sócios antes do envio.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Composição da proposta (template padrão TBO), revisão de sócios, envio, versionamento e negociação.', '<p>Composição da proposta (template padrão TBO), revisão de sócios, envio, versionamento e negociação.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Diagnóstico comercial (SOP-COM-001), contratação pós-aceite (SOP-COM-003), precificação unitária de serviços (SOP-OPS-006).', '<p>Diagnóstico comercial (SOP-COM-001), contratação pós-aceite (SOP-COM-003), precificação unitária de serviços (SOP-OPS-006).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy Lima

Definir escopo e precificação, conduzir negociação

Executor

---

Marco

Validar escopo operacional e viabilidade de cronograma

Aprovador

---

Carol (Ops)

Formatar proposta no template TBO

Consultor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Definir escopo e precificação, conduzir negociação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar escopo operacional e viabilidade de cronograma</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Formatar proposta no template TBO</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Diagnóstico concluído (SOP-COM-001); tabela de preços atualizada; template de proposta TBO (papel timbrado, Plus Jakarta Sans); capacidade operacional validada.', '<p>Diagnóstico concluído (SOP-COM-001); tabela de preços atualizada; template de proposta TBO (papel timbrado, Plus Jakarta Sans); capacidade operacional validada.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive (template e versionamento), TBO OS, RD Station CRM, E-mail corporativo.', '<p>Google Drive (template e versionamento), TBO OS, RD Station CRM, E-mail corporativo.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Composição da Proposta', 'Ação: Ruy monta a proposta com base no diagnóstico, seguindo template padrão: capa TBO, contexto/diagnóstico do empreendimento, escopo detalhado por BU com entregáveis, cronograma macro, investimento (valores por BU ou pacote, condições de pagamento), termos e condições.

Responsável: Ruy Lima

Output: Proposta em PDF no template TBO

Prazo referência: Até 3 dias úteis após diagnóstico', '<p>Ação: Ruy monta a proposta com base no diagnóstico, seguindo template padrão: capa TBO, contexto/diagnóstico do empreendimento, escopo detalhado por BU com entregáveis, cronograma macro, investimento (valores por BU ou pacote, condições de pagamento), termos e condições.</p><p>Responsável: Ruy Lima</p><p>Output: Proposta em PDF no template TBO</p><p>Prazo referência: Até 3 dias úteis após diagnóstico</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Revisão dos Sócios', 'Ação: Marco valida escopo criativo/operacional e cronograma. Ruy valida estratégia e precificação. Para propostas acima de R$ 50.000, ambos revisam em conjunto.

Responsável: Marco + Ruy

Output: Proposta aprovada para envio

Prazo referência: Até 24h após composição', '<p>Ação: Marco valida escopo criativo/operacional e cronograma. Ruy valida estratégia e precificação. Para propostas acima de R$ 50.000, ambos revisam em conjunto.</p><p>Responsável: Marco + Ruy</p><p>Output: Proposta aprovada para envio</p><p>Prazo referência: Até 24h após composição</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Envio ao Cliente', 'Ação: Proposta enviada por e-mail com PDF anexo. Status atualizado no RD Station CRM para Proposta Enviada. Follow-up agendado para D+3.

Responsável: Ruy Lima

Output: Proposta enviada e CRM atualizado

Prazo referência: No mesmo dia da aprovação', '<p>Ação: Proposta enviada por e-mail com PDF anexo. Status atualizado no RD Station CRM para Proposta Enviada. Follow-up agendado para D+3.</p><p>Responsável: Ruy Lima</p><p>Output: Proposta enviada e CRM atualizado</p><p>Prazo referência: No mesmo dia da aprovação</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Negociação e Versionamento', 'Ação: Ruy conduz a negociação. Alterações de escopo ou preço geram nova versão (v2, v3). Desconto acima de 10% requer aprovação conjunta dos sócios. Versão final salva no Drive.

Responsável: Ruy Lima

Output: Versão final aceita ou oportunidade perdida

Prazo referência: Até 15 dias úteis (prazo máximo de negociação)', '<p>Ação: Ruy conduz a negociação. Alterações de escopo ou preço geram nova versão (v2, v3). Desconto acima de 10% requer aprovação conjunta dos sócios. Versão final salva no Drive.</p><p>Responsável: Ruy Lima</p><p>Output: Versão final aceita ou oportunidade perdida</p><p>Prazo referência: Até 15 dias úteis (prazo máximo de negociação)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Proposta no template padrão TBO com todas as seções

[ ] Escopo detalhado por BU com entregáveis claros

[ ] Revisão de pelo menos um sócio realizada

[ ] PDF enviado e status atualizado no CRM

[ ] Versão final salva no Google Drive', '<ul><li>[ ] Proposta no template padrão TBO com todas as seções</li><li>[ ] Escopo detalhado por BU com entregáveis claros</li><li>[ ] Revisão de pelo menos um sócio realizada</li><li>[ ] PDF enviado e status atualizado no CRM</li><li>[ ] Versão final salva no Google Drive</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar proposta sem revisão de sócio → risco de escopo sub ou superdimensionado

Não versionar alterações → confusão sobre o que foi acordado

Desconto sem aprovação → margem comprometida sem decisão informada', '<ul><li>Enviar proposta sem revisão de sócio → risco de escopo sub ou superdimensionado</li><li>Não versionar alterações → confusão sobre o que foi acordado</li><li>Desconto sem aprovação → margem comprometida sem decisão informada</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive (template, versionamento), RD Station CRM (funil), E-mail (envio), TBO OS (referência de capacidade).', '<p>Google Drive (template, versionamento), RD Station CRM (funil), E-mail (envio), TBO OS (referência de capacidade).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Composição: até 3 dias úteis após diagnóstico

Revisão: até 24h

Follow-up pós-envio: D+3

Prazo máximo de negociação: 15 dias úteis (após, reclassificar no pipeline)

Regra: nenhuma proposta sai sem revisão de pelo menos um sócio', '<ul><li>Composição: até 3 dias úteis após diagnóstico</li><li>Revisão: até 24h</li><li>Follow-up pós-envio: D+3</li><li>Prazo máximo de negociação: 15 dias úteis (após, reclassificar no pipeline)</li><li>Regra: nenhuma proposta sai sem revisão de pelo menos um sócio</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Diagnóstico Concluído → Composição da Proposta (template TBO) → Revisão Marco/Ruy → Aprovada? → Sim: Envio ao Cliente → Follow-up D+3 → Negociação → Aceita? → SOP-COM-003 / Não: Registro como Perdida → Fim', '<p>Diagnóstico Concluído → Composição da Proposta (template TBO) → Revisão Marco/Ruy → Aprovada? → Sim: Envio ao Cliente → Follow-up D+3 → Negociação → Aceita? → SOP-COM-003 / Não: Registro como Perdida → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Template TBO: modelo padronizado de proposta com identidade visual da agência.

Versionamento: controle de alterações (v1, v2, v3) para rastreabilidade.

Fee mínimo: valor mínimo por projeto que viabiliza a operação da TBO.', '<p>Template TBO: modelo padronizado de proposta com identidade visual da agência.</p><p>Versionamento: controle de alterações (v1, v2, v3) para rastreabilidade.</p><p>Fee mínimo: valor mínimo por projeto que viabiliza a operação da TBO.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-COM-003: Fechamento e Contratacao ──
END $$;