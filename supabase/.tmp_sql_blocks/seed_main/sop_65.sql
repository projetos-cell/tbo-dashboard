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
    'Contas a Receber e Faturamento',
    'tbo-fin-001-contas-a-receber-e-faturamento',
    'financeiro',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Contas a Receber e Faturamento

Código

TBO-FIN-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Financeiro (Controladoria)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Garantir que todo projeto contratado gere faturamento pontual, que inadimplências sejam tratadas proativamente e que a receita realizada esteja rastreada no TBO OS e Omie.

2. Escopo

2.1 O que está coberto

Emissão de NF via Omie, envio ao cliente, conciliação bancária semanal, cobrança de inadimplência (D+1 a D+30) e bloqueio de entregas.

2.2 Exclusões

Precificação de propostas (SOP-OPS-006), gestão de contas a pagar (SOP-FIN-002), fluxo de caixa projetado (SOP-FIN-003).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Solicitar emissão de NF, enviar ao cliente, cobrar inadimplência

Executor

---

Marco

Validar valores, executar pagamentos, conciliar banco

Aprovador

---

Ruy

Contato direto em inadimplência D+15

Consultor

---



4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado com cronograma de pagamento; Omie ERP configurado com dados fiscais; extrato BB Empresarial.

4.2 Ferramentas e Acessos

Omie ERP (NFs), TBO OS (módulo financeiro), BB Empresarial (conciliação), E-mail.

5. Procedimento Passo a Passo

5.1. Emissão de NF

Ação: Carol solicita emissão no Omie com 3 dias úteis de antecedência do vencimento. Marco valida valores e centro de custo antes da emissão.

Responsável: Carol (Ops) + Marco

Output: NF emitida no Omie

Prazo referência: 3 dias antes do vencimento

5.2. Envio ao Cliente

Ação: NF enviada por e-mail com boleto/dados bancários. Clientes recorrentes recebem envio automático via Omie.

Responsável: Carol (Ops)

Output: NF enviada

Prazo referência: No dia da emissão

5.3. Conciliação Bancária

Ação: Marco faz conciliação semanal (sexta-feira) via extrato BB. Registra no TBO OS: Faturado, Pago, Atrasado.

Responsável: Marco

Output: Conciliação registrada

Prazo referência: Toda sexta-feira

5.4. Cobrança de Inadimplência

Ação: D+1: lembrete automático por e-mail. D+5: Carol contata por WhatsApp/telefone. D+15: Marco ou Ruy fazem contato direto. D+30: avaliação de medidas (suspensão de entregas, negociação, assessoria jurídica).

Responsável: Carol → Marco/Ruy

Output: Inadimplência resolvida ou medida aplicada

Prazo referência: Escalonamento conforme dias de atraso

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] NF emitida com antecedência de 3 dias

[ ] NF enviada ao cliente no dia da emissão

[ ] Conciliação bancária semanal realizada

[ ] Inadimplências tratadas conforme SLA

[ ] Nenhuma entrega final com parcela atrasada > 15 dias

6.2 Erros Comuns a Evitar

Emitir NF com valor errado → retrabalho fiscal e desconfiança

Não conciliar semanalmente → perda de controle do fluxo de caixa

Entregar projeto final com parcelas em atraso → perda de leverage

7. Ferramentas e Templates

Omie ERP, TBO OS (financeiro), BB Empresarial, E-mail, WhatsApp Business.

8. SLAs e Prazos

Emissão de NF: 3 dias antes do vencimento

Conciliação: toda sexta-feira

Cobrança: D+1 (auto), D+5 (Carol), D+15 (sócio), D+30 (medida formal)

Regra: nenhuma entrega final com parcela atrasada > 15 dias sem autorização dos sócios

9. Fluxograma

Vencimento se Aproxima → Emissão de NF (D-3) → Envio ao Cliente → Conciliação Semanal → Pago? → Sim: Registro no TBO OS → Fim / Não: Cobrança Escalonada (D+1→D+5→D+15→D+30) → Fim

10. Glossário

NF: Nota Fiscal de serviço emitida via Omie.

Conciliação bancária: cruzamento entre registros internos e extrato bancário.

Centro de custo: classificação da receita por projeto/cliente.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Contas a Receber e Faturamento</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-FIN-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Financeiro (Controladoria)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Garantir que todo projeto contratado gere faturamento pontual, que inadimplências sejam tratadas proativamente e que a receita realizada esteja rastreada no TBO OS e Omie.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Emissão de NF via Omie, envio ao cliente, conciliação bancária semanal, cobrança de inadimplência (D+1 a D+30) e bloqueio de entregas.</p><p><strong>2.2 Exclusões</strong></p><p>Precificação de propostas (SOP-OPS-006), gestão de contas a pagar (SOP-FIN-002), fluxo de caixa projetado (SOP-FIN-003).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Solicitar emissão de NF, enviar ao cliente, cobrar inadimplência</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar valores, executar pagamentos, conciliar banco</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Contato direto em inadimplência D+15</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado com cronograma de pagamento; Omie ERP configurado com dados fiscais; extrato BB Empresarial.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Omie ERP (NFs), TBO OS (módulo financeiro), BB Empresarial (conciliação), E-mail.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Emissão de NF</strong></p><p>Ação: Carol solicita emissão no Omie com 3 dias úteis de antecedência do vencimento. Marco valida valores e centro de custo antes da emissão.</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: NF emitida no Omie</p><p>Prazo referência: 3 dias antes do vencimento</p><p><strong>5.2. Envio ao Cliente</strong></p><p>Ação: NF enviada por e-mail com boleto/dados bancários. Clientes recorrentes recebem envio automático via Omie.</p><p>Responsável: Carol (Ops)</p><p>Output: NF enviada</p><p>Prazo referência: No dia da emissão</p><p><strong>5.3. Conciliação Bancária</strong></p><p>Ação: Marco faz conciliação semanal (sexta-feira) via extrato BB. Registra no TBO OS: Faturado, Pago, Atrasado.</p><p>Responsável: Marco</p><p>Output: Conciliação registrada</p><p>Prazo referência: Toda sexta-feira</p><p><strong>5.4. Cobrança de Inadimplência</strong></p><p>Ação: D+1: lembrete automático por e-mail. D+5: Carol contata por WhatsApp/telefone. D+15: Marco ou Ruy fazem contato direto. D+30: avaliação de medidas (suspensão de entregas, negociação, assessoria jurídica).</p><p>Responsável: Carol → Marco/Ruy</p><p>Output: Inadimplência resolvida ou medida aplicada</p><p>Prazo referência: Escalonamento conforme dias de atraso</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] NF emitida com antecedência de 3 dias</li><li>[ ] NF enviada ao cliente no dia da emissão</li><li>[ ] Conciliação bancária semanal realizada</li><li>[ ] Inadimplências tratadas conforme SLA</li><li>[ ] Nenhuma entrega final com parcela atrasada &gt; 15 dias</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Emitir NF com valor errado → retrabalho fiscal e desconfiança</li><li>Não conciliar semanalmente → perda de controle do fluxo de caixa</li><li>Entregar projeto final com parcelas em atraso → perda de leverage</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>Omie ERP, TBO OS (financeiro), BB Empresarial, E-mail, WhatsApp Business.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Emissão de NF: 3 dias antes do vencimento</li><li>Conciliação: toda sexta-feira</li><li>Cobrança: D+1 (auto), D+5 (Carol), D+15 (sócio), D+30 (medida formal)</li><li>Regra: nenhuma entrega final com parcela atrasada &gt; 15 dias sem autorização dos sócios</li></ul><p><strong>9. Fluxograma</strong></p><p>Vencimento se Aproxima → Emissão de NF (D-3) → Envio ao Cliente → Conciliação Semanal → Pago? → Sim: Registro no TBO OS → Fim / Não: Cobrança Escalonada (D+1→D+5→D+15→D+30) → Fim</p><p><strong>10. Glossário</strong></p><p>NF: Nota Fiscal de serviço emitida via Omie.</p><p>Conciliação bancária: cruzamento entre registros internos e extrato bancário.</p><p>Centro de custo: classificação da receita por projeto/cliente.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['financeiro','fiscal','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-FIN-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo projeto contratado gere faturamento pontual, que inadimplências sejam tratadas proativamente e que a receita realizada esteja rastreada no TBO OS e Omie.', '<p>Garantir que todo projeto contratado gere faturamento pontual, que inadimplências sejam tratadas proativamente e que a receita realizada esteja rastreada no TBO OS e Omie.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Emissão de NF via Omie, envio ao cliente, conciliação bancária semanal, cobrança de inadimplência (D+1 a D+30) e bloqueio de entregas.', '<p>Emissão de NF via Omie, envio ao cliente, conciliação bancária semanal, cobrança de inadimplência (D+1 a D+30) e bloqueio de entregas.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Precificação de propostas (SOP-OPS-006), gestão de contas a pagar (SOP-FIN-002), fluxo de caixa projetado (SOP-FIN-003).', '<p>Precificação de propostas (SOP-OPS-006), gestão de contas a pagar (SOP-FIN-002), fluxo de caixa projetado (SOP-FIN-003).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Solicitar emissão de NF, enviar ao cliente, cobrar inadimplência

Executor

---

Marco

Validar valores, executar pagamentos, conciliar banco

Aprovador

---

Ruy

Contato direto em inadimplência D+15

Consultor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Solicitar emissão de NF, enviar ao cliente, cobrar inadimplência</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar valores, executar pagamentos, conciliar banco</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Contato direto em inadimplência D+15</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado com cronograma de pagamento; Omie ERP configurado com dados fiscais; extrato BB Empresarial.', '<p>Contrato assinado com cronograma de pagamento; Omie ERP configurado com dados fiscais; extrato BB Empresarial.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Omie ERP (NFs), TBO OS (módulo financeiro), BB Empresarial (conciliação), E-mail.', '<p>Omie ERP (NFs), TBO OS (módulo financeiro), BB Empresarial (conciliação), E-mail.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Emissão de NF', 'Ação: Carol solicita emissão no Omie com 3 dias úteis de antecedência do vencimento. Marco valida valores e centro de custo antes da emissão.

Responsável: Carol (Ops) + Marco

Output: NF emitida no Omie

Prazo referência: 3 dias antes do vencimento', '<p>Ação: Carol solicita emissão no Omie com 3 dias úteis de antecedência do vencimento. Marco valida valores e centro de custo antes da emissão.</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: NF emitida no Omie</p><p>Prazo referência: 3 dias antes do vencimento</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Envio ao Cliente', 'Ação: NF enviada por e-mail com boleto/dados bancários. Clientes recorrentes recebem envio automático via Omie.

Responsável: Carol (Ops)

Output: NF enviada

Prazo referência: No dia da emissão', '<p>Ação: NF enviada por e-mail com boleto/dados bancários. Clientes recorrentes recebem envio automático via Omie.</p><p>Responsável: Carol (Ops)</p><p>Output: NF enviada</p><p>Prazo referência: No dia da emissão</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Conciliação Bancária', 'Ação: Marco faz conciliação semanal (sexta-feira) via extrato BB. Registra no TBO OS: Faturado, Pago, Atrasado.

Responsável: Marco

Output: Conciliação registrada

Prazo referência: Toda sexta-feira', '<p>Ação: Marco faz conciliação semanal (sexta-feira) via extrato BB. Registra no TBO OS: Faturado, Pago, Atrasado.</p><p>Responsável: Marco</p><p>Output: Conciliação registrada</p><p>Prazo referência: Toda sexta-feira</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Cobrança de Inadimplência', 'Ação: D+1: lembrete automático por e-mail. D+5: Carol contata por WhatsApp/telefone. D+15: Marco ou Ruy fazem contato direto. D+30: avaliação de medidas (suspensão de entregas, negociação, assessoria jurídica).

Responsável: Carol → Marco/Ruy

Output: Inadimplência resolvida ou medida aplicada

Prazo referência: Escalonamento conforme dias de atraso', '<p>Ação: D+1: lembrete automático por e-mail. D+5: Carol contata por WhatsApp/telefone. D+15: Marco ou Ruy fazem contato direto. D+30: avaliação de medidas (suspensão de entregas, negociação, assessoria jurídica).</p><p>Responsável: Carol → Marco/Ruy</p><p>Output: Inadimplência resolvida ou medida aplicada</p><p>Prazo referência: Escalonamento conforme dias de atraso</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] NF emitida com antecedência de 3 dias

[ ] NF enviada ao cliente no dia da emissão

[ ] Conciliação bancária semanal realizada

[ ] Inadimplências tratadas conforme SLA

[ ] Nenhuma entrega final com parcela atrasada > 15 dias', '<ul><li>[ ] NF emitida com antecedência de 3 dias</li><li>[ ] NF enviada ao cliente no dia da emissão</li><li>[ ] Conciliação bancária semanal realizada</li><li>[ ] Inadimplências tratadas conforme SLA</li><li>[ ] Nenhuma entrega final com parcela atrasada &gt; 15 dias</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Emitir NF com valor errado → retrabalho fiscal e desconfiança

Não conciliar semanalmente → perda de controle do fluxo de caixa

Entregar projeto final com parcelas em atraso → perda de leverage', '<ul><li>Emitir NF com valor errado → retrabalho fiscal e desconfiança</li><li>Não conciliar semanalmente → perda de controle do fluxo de caixa</li><li>Entregar projeto final com parcelas em atraso → perda de leverage</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Omie ERP, TBO OS (financeiro), BB Empresarial, E-mail, WhatsApp Business.', '<p>Omie ERP, TBO OS (financeiro), BB Empresarial, E-mail, WhatsApp Business.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Emissão de NF: 3 dias antes do vencimento

Conciliação: toda sexta-feira

Cobrança: D+1 (auto), D+5 (Carol), D+15 (sócio), D+30 (medida formal)

Regra: nenhuma entrega final com parcela atrasada > 15 dias sem autorização dos sócios', '<ul><li>Emissão de NF: 3 dias antes do vencimento</li><li>Conciliação: toda sexta-feira</li><li>Cobrança: D+1 (auto), D+5 (Carol), D+15 (sócio), D+30 (medida formal)</li><li>Regra: nenhuma entrega final com parcela atrasada &gt; 15 dias sem autorização dos sócios</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Vencimento se Aproxima → Emissão de NF (D-3) → Envio ao Cliente → Conciliação Semanal → Pago? → Sim: Registro no TBO OS → Fim / Não: Cobrança Escalonada (D+1→D+5→D+15→D+30) → Fim', '<p>Vencimento se Aproxima → Emissão de NF (D-3) → Envio ao Cliente → Conciliação Semanal → Pago? → Sim: Registro no TBO OS → Fim / Não: Cobrança Escalonada (D+1→D+5→D+15→D+30) → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'NF: Nota Fiscal de serviço emitida via Omie.

Conciliação bancária: cruzamento entre registros internos e extrato bancário.

Centro de custo: classificação da receita por projeto/cliente.', '<p>NF: Nota Fiscal de serviço emitida via Omie.</p><p>Conciliação bancária: cruzamento entre registros internos e extrato bancário.</p><p>Centro de custo: classificação da receita por projeto/cliente.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-FIN-002: Contas a Pagar e Controle de Despesas ──
END $$;