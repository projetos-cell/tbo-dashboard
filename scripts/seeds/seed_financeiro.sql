-- Seed: financeiro (3 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-FIN-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Contas a Receber e Faturamento', 'tbo-fin-001-contas-a-receber-e-faturamento', 'financeiro', 'checklist', 'Marco Andolfato (Dir. Operações)', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['financeiro']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo projeto contratado gere faturamento pontual, que inadimplências sejam tratadas proativamente e que a receita realizada esteja rastreada no TBO OS e Omie.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Emissão de NF via Omie, envio ao cliente, conciliação bancária semanal, cobrança de inadimplência (D+1 a D+30) e bloqueio de entregas.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Precificação de propostas (SOP-OPS-006), gestão de contas a pagar (SOP-FIN-002), fluxo de caixa projetado (SOP-FIN-003).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado com cronograma de pagamento; Omie ERP configurado com dados fiscais; extrato BB Empresarial.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Omie ERP (NFs), TBO OS (módulo financeiro), BB Empresarial (conciliação), E-mail.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Emissão de NF', 'Ação: Carol solicita emissão no Omie com 3 dias úteis de antecedência do vencimento. Marco valida valores e centro de custo antes da emissão.

Responsável: Carol (Ops) + Marco

Output: NF emitida no Omie

Prazo referência: 3 dias antes do vencimento', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Envio ao Cliente', 'Ação: NF enviada por e-mail com boleto/dados bancários. Clientes recorrentes recebem envio automático via Omie.

Responsável: Carol (Ops)

Output: NF enviada

Prazo referência: No dia da emissão', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Conciliação Bancária', 'Ação: Marco faz conciliação semanal (sexta-feira) via extrato BB. Registra no TBO OS: Faturado, Pago, Atrasado.

Responsável: Marco

Output: Conciliação registrada

Prazo referência: Toda sexta-feira', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Cobrança de Inadimplência', 'Ação: D+1: lembrete automático por e-mail. D+5: Carol contata por WhatsApp/telefone. D+15: Marco ou Ruy fazem contato direto. D+30: avaliação de medidas (suspensão de entregas, negociação, assessoria jurídica).

Responsável: Carol → Marco/Ruy

Output: Inadimplência resolvida ou medida aplicada

Prazo referência: Escalonamento conforme dias de atraso', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] NF emitida com antecedência de 3 dias

[ ] NF enviada ao cliente no dia da emissão

[ ] Conciliação bancária semanal realizada

[ ] Inadimplências tratadas conforme SLA

[ ] Nenhuma entrega final com parcela atrasada > 15 dias', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Emitir NF com valor errado → retrabalho fiscal e desconfiança

Não conciliar semanalmente → perda de controle do fluxo de caixa

Entregar projeto final com parcelas em atraso → perda de leverage', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Omie ERP, TBO OS (financeiro), BB Empresarial, E-mail, WhatsApp Business.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Emissão de NF: 3 dias antes do vencimento

Conciliação: toda sexta-feira

Cobrança: D+1 (auto), D+5 (Carol), D+15 (sócio), D+30 (medida formal)

Regra: nenhuma entrega final com parcela atrasada > 15 dias sem autorização dos sócios', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Vencimento se Aproxima → Emissão de NF (D-3) → Envio ao Cliente → Conciliação Semanal → Pago? → Sim: Registro no TBO OS → Fim / Não: Cobrança Escalonada (D+1→D+5→D+15→D+30) → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'NF: Nota Fiscal de serviço emitida via Omie.

Conciliação bancária: cruzamento entre registros internos e extrato bancário.

Centro de custo: classificação da receita por projeto/cliente.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-FIN-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Contas a Pagar e Controle de Despesas', 'tbo-fin-002-contas-a-pagar-e-controle-de-despesas', 'financeiro', 'checklist', 'Contas a Pagar e Controle de Despesas', 'Standard Operating Procedure

Contas a Pagar e Controle de Despesas

Código

TBO-FIN-002

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

Controlar todas as saídas financeiras da TBO com rastreabilidade por centro de custo, aprovação prévia e registro no sistema, garantindo disciplina de caixa.

2. Escopo

2.1 O que está coberto

Solicitação de pagamento, classificação por centro de custo (Infraestrutura, Financeiro, Projetos, Passivo de Giro, Pessoas), janela de pagamento, controle de cartão corporativo BB.

2.2 Exclusões

Faturamento de clientes (SOP-FIN-001), fluxo de caixa projetado (SOP-FIN-003), folha de pagamento e encargos CLT (contabilidade externa).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Registrar despesas e solicitar pagamentos

Executor

---

Marco

Aprovar despesas, executar pagamentos, conciliar cartão

Aprovador

---

Ruy

Co-aprovar despesas acima de R$ 5.000

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Omie ERP configurado com centros de custo; extrato do Cartão BB Empresarial; lista de despesas recorrentes; alçadas de aprovação definidas.

4.2 Ferramentas e Acessos

Omie ERP, TBO OS (módulo financeiro), BB Empresarial, Google Drive (comprovantes).

5. Procedimento Passo a Passo

5.1. Solicitação de Pagamento

Ação: Qualquer despesa não recorrente acima de R$ 500 requer solicitação prévia no TBO OS com justificativa, centro de custo e valor. Marco aprova até R$ 5.000; acima, aprovação conjunta.

Responsável: Solicitante → Marco (→ Ruy se > R$ 5k)

Output: Despesa aprovada ou rejeitada

Prazo referência: Até 24h para aprovação

5.2. Registro e Classificação

Ação: Toda despesa registrada no Omie com: data, fornecedor, centro de custo, projeto vinculado (quando aplicável), comprovante anexo.

Responsável: Carol (Ops)

Output: Despesa registrada e classificada

Prazo referência: Até 48h após pagamento

5.3. Janela de Pagamento

Ação: Pagamentos executados às terças e quintas. Marco valida a lista de pagamentos do dia antes da execução bancária.

Responsável: Marco

Output: Pagamentos executados

Prazo referência: Terças e quintas

5.4. Conciliação do Cartão Corporativo

Ação: Fatura do Cartão BB Empresarial conciliada mensalmente. Cada lançamento classificado por centro de custo. Gastos sem classificação são bloqueados para o mês seguinte.

Responsável: Marco

Output: Fatura conciliada e classificada

Prazo referência: Até dia 10 de cada mês

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Toda despesa com comprovante e centro de custo

[ ] Despesas acima de R$ 500 com aprovação prévia

[ ] Pagamentos executados na janela (terças/quintas)

[ ] Cartão corporativo conciliado mensalmente

[ ] Nenhum gasto sem classificação pendente

6.2 Erros Comuns a Evitar

Pagar sem aprovação → perda de controle financeiro

Despesa sem centro de custo → impossível analisar rentabilidade

Não conciliar cartão → surpresas na fatura e descontrole

7. Ferramentas e Templates

Omie ERP, TBO OS (financeiro), BB Empresarial, Google Drive (comprovantes).

8. SLAs e Prazos

Aprovação de despesa: até 24h

Registro no Omie: até 48h após pagamento

Janela de pagamento: terças e quintas

Conciliação do cartão: até dia 10 de cada mês

9. Fluxograma

Despesa Identificada → Recorrente? → Sim: Registro direto → Não: Solicitação no TBO OS → Aprovação (Marco / Marco+Ruy) → Janela de Pagamento → Registro no Omie → Conciliação → Fim

10. Glossário

Centro de custo: categoria que agrupa despesas por natureza (Infraestrutura, Projetos, Pessoas, etc.).

Janela de pagamento: dias específicos da semana em que pagamentos são processados.

Alçada: limite de valor até o qual uma pessoa pode aprovar despesas autonomamente.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'high', ARRAY['financeiro']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Controlar todas as saídas financeiras da TBO com rastreabilidade por centro de custo, aprovação prévia e registro no sistema, garantindo disciplina de caixa.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Solicitação de pagamento, classificação por centro de custo (Infraestrutura, Financeiro, Projetos, Passivo de Giro, Pessoas), janela de pagamento, controle de cartão corporativo BB.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Faturamento de clientes (SOP-FIN-001), fluxo de caixa projetado (SOP-FIN-003), folha de pagamento e encargos CLT (contabilidade externa).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Registrar despesas e solicitar pagamentos

Executor

---

Marco

Aprovar despesas, executar pagamentos, conciliar cartão

Aprovador

---

Ruy

Co-aprovar despesas acima de R$ 5.000

Aprovador

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Omie ERP configurado com centros de custo; extrato do Cartão BB Empresarial; lista de despesas recorrentes; alçadas de aprovação definidas.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Omie ERP, TBO OS (módulo financeiro), BB Empresarial, Google Drive (comprovantes).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Solicitação de Pagamento', 'Ação: Qualquer despesa não recorrente acima de R$ 500 requer solicitação prévia no TBO OS com justificativa, centro de custo e valor. Marco aprova até R$ 5.000; acima, aprovação conjunta.

Responsável: Solicitante → Marco (→ Ruy se > R$ 5k)

Output: Despesa aprovada ou rejeitada

Prazo referência: Até 24h para aprovação', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Registro e Classificação', 'Ação: Toda despesa registrada no Omie com: data, fornecedor, centro de custo, projeto vinculado (quando aplicável), comprovante anexo.

Responsável: Carol (Ops)

Output: Despesa registrada e classificada

Prazo referência: Até 48h após pagamento', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Janela de Pagamento', 'Ação: Pagamentos executados às terças e quintas. Marco valida a lista de pagamentos do dia antes da execução bancária.

Responsável: Marco

Output: Pagamentos executados

Prazo referência: Terças e quintas', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Conciliação do Cartão Corporativo', 'Ação: Fatura do Cartão BB Empresarial conciliada mensalmente. Cada lançamento classificado por centro de custo. Gastos sem classificação são bloqueados para o mês seguinte.

Responsável: Marco

Output: Fatura conciliada e classificada

Prazo referência: Até dia 10 de cada mês', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Toda despesa com comprovante e centro de custo

[ ] Despesas acima de R$ 500 com aprovação prévia

[ ] Pagamentos executados na janela (terças/quintas)

[ ] Cartão corporativo conciliado mensalmente

[ ] Nenhum gasto sem classificação pendente', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Pagar sem aprovação → perda de controle financeiro

Despesa sem centro de custo → impossível analisar rentabilidade

Não conciliar cartão → surpresas na fatura e descontrole', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Omie ERP, TBO OS (financeiro), BB Empresarial, Google Drive (comprovantes).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Aprovação de despesa: até 24h

Registro no Omie: até 48h após pagamento

Janela de pagamento: terças e quintas

Conciliação do cartão: até dia 10 de cada mês', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Despesa Identificada → Recorrente? → Sim: Registro direto → Não: Solicitação no TBO OS → Aprovação (Marco / Marco+Ruy) → Janela de Pagamento → Registro no Omie → Conciliação → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Centro de custo: categoria que agrupa despesas por natureza (Infraestrutura, Projetos, Pessoas, etc.).

Janela de pagamento: dias específicos da semana em que pagamentos são processados.

Alçada: limite de valor até o qual uma pessoa pode aprovar despesas autonomamente.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-FIN-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Fluxo de Caixa e DRE Mensal', 'tbo-fin-003-fluxo-de-caixa-e-dre-mensal', 'financeiro', 'checklist', 'Marco Andolfato (Dir. Operações)', 'Standard Operating Procedure

Fluxo de Caixa e DRE Mensal

Código

TBO-FIN-003

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

Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.

2. Escopo

2.1 O que está coberto

Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.

2.2 Exclusões

Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Atualizar fluxo de caixa, consolidar DRE, acionar contingência

Executor

---

Ruy

Revisar DRE e participar de decisões estratégicas

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.

4.2 Ferramentas e Acessos

TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.

5. Procedimento Passo a Passo

5.1. Fluxo de Caixa Projetado (semanal)

Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).

Responsável: Marco

Output: Fluxo de caixa atualizado

Prazo referência: Toda sexta-feira

5.2. DRE Mensal

Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.

Responsável: Marco

Output: DRE mensal consolidada

Prazo referência: Até dia 10 de cada mês

5.3. Reunião Financeira Mensal

Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.

Responsável: Marco + Ruy

Output: Ata com decisões financeiras registrada

Prazo referência: Até dia 15 de cada mês

5.4. Plano de Contingência

Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.

Responsável: Marco

Output: Plano de contingência ativado

Prazo referência: Imediato quando detectado

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Fluxo de caixa atualizado semanalmente

[ ] DRE mensal consolidada até dia 10

[ ] Reunião financeira mensal realizada até dia 15

[ ] Plano de contingência acionado quando necessário

6.2 Erros Comuns a Evitar

Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação

DRE atrasada → decisões baseadas em feeling, não em dados

Ignorar saldo negativo projetado → crise de liquidez evitável

7. Ferramentas e Templates

TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).

8. SLAs e Prazos

Fluxo de caixa: atualização semanal (sexta)

DRE: até dia 10

Reunião financeira: até dia 15

Contingência: imediato se projeção 30d for negativa

9. Fluxograma

Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim

10. Glossário

DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.

EBITDA: lucro antes de juros, impostos, depreciação e amortização.

Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.

Contingência: ações emergenciais para evitar crise de liquidez.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['financeiro']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Atualizar fluxo de caixa, consolidar DRE, acionar contingência

Executor

---

Ruy

Revisar DRE e participar de decisões estratégicas

Aprovador

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Fluxo de Caixa Projetado (semanal)', 'Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).

Responsável: Marco

Output: Fluxo de caixa atualizado

Prazo referência: Toda sexta-feira', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. DRE Mensal', 'Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.

Responsável: Marco

Output: DRE mensal consolidada

Prazo referência: Até dia 10 de cada mês', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Reunião Financeira Mensal', 'Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.

Responsável: Marco + Ruy

Output: Ata com decisões financeiras registrada

Prazo referência: Até dia 15 de cada mês', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Plano de Contingência', 'Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.

Responsável: Marco

Output: Plano de contingência ativado

Prazo referência: Imediato quando detectado', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Fluxo de caixa atualizado semanalmente

[ ] DRE mensal consolidada até dia 10

[ ] Reunião financeira mensal realizada até dia 15

[ ] Plano de contingência acionado quando necessário', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação

DRE atrasada → decisões baseadas em feeling, não em dados

Ignorar saldo negativo projetado → crise de liquidez evitável', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Fluxo de caixa: atualização semanal (sexta)

DRE: até dia 10

Reunião financeira: até dia 15

Contingência: imediato se projeção 30d for negativa', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.

EBITDA: lucro antes de juros, impostos, depreciação e amortização.

Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.

Contingência: ações emergenciais para evitar crise de liquidez.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

END $$;
