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
    'Controle Financeiro Faturas e Centros de Custo',
    'tbo-ops-005-controle-financeiro-faturas-e-centros-de-custo',
    'operacoes',
    'checklist',
    'Controle Financeiro (Faturas e Centros de Custo)',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Controle Financeiro (Faturas e Centros de Custo)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-005</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir a emissão correta e pontual de notas fiscais, controle de contas a receber, categorização de despesas por centro de custo e disponibilidade de relatório financeiro mensal para tomada de decisão.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Emissão de NF-e, controle de recebíveis, categorização de despesas por BU/projeto, conciliação bancária básica e relatório mensal de resultado por centro de custo.</p><p><strong>2.2 Exclusões</strong></p><p>Contabilidade fiscal e apuração de impostos (responsabilidade do contador externo), folha de pagamento (RH), investimentos e captação de recursos.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Emitir NFs, controlar recebíveis, categorizar despesas, preparar relatório</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovar despesas acima de R$500, revisar relatório mensal</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Contador Externo</p></td><td><p>Apuração fiscal, obrigações acessórias, SPED</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Líderes de BU</p></td><td><p>Informar despesas de projeto e aprovações de compra</p></td><td><p>Executor</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato do cliente com valores e condições de pagamento; notas de despesas e recibos organizados por BU; acesso ao sistema de emissão de NF (Prefeitura ou emissor como NFE.io); planilha financeira TBO atualizada.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>NFE.io ou sistema municipal de emissão de NFS-e, planilha financeira Google Sheets (modelo TBO), Supabase (registro de transações), internet banking, Google Drive (/financeiro).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Emissão de Nota Fiscal</strong></p><p>Ação: Ao concluir entrega faturável (conforme contrato), Carol emite NFS-e no sistema municipal informando: tomador, descrição do serviço, valor, alíquotas de imposto. Envia PDF ao cliente por e-mail. Registra na planilha de recebíveis.</p><p>Responsável: Carol (Ops)</p><p>Output: NF emitida, enviada ao cliente e registrada</p><p>Prazo referência: Até 2 dias úteis após entrega aprovada</p><p><strong>5.2. Controle de Recebíveis</strong></p><p>Ação: Carol atualiza planilha de recebíveis semanalmente: marcar NFs pagas, identificar NFs em atraso (&gt;5 dias do vencimento), acionar cliente via WhatsApp para cobrança amigável; escalar para Marco se atraso &gt;15 dias.</p><p>Responsável: Carol (Ops)</p><p>Output: Planilha de recebíveis atualizada</p><p>Prazo referência: Toda sexta-feira</p><p><strong>5.3. Categorização de Despesas</strong></p><p>Ação: Ao realizar qualquer despesa de projeto, Carol (ou líder de BU) registra na planilha: data, valor, fornecedor, centro de custo (BU: AV / GAM / OPS / ADM), projeto vinculado, comprovante no Drive. Despesas &gt;R$500 exigem aprovação de Marco.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Despesas categorizadas em tempo real</p><p>Prazo referência: No mesmo dia da despesa</p><p><strong>5.4. Conciliação Bancária (Quinzenal)</strong></p><p>Ação: Carol compara extrato bancário com planilha de recebíveis e despesas: identificar recebimentos não registrados, despesas não categorizadas e transferências internas; ajustar planilha.</p><p>Responsável: Carol (Ops)</p><p>Output: Planilha conciliada com extrato bancário</p><p>Prazo referência: Dias 15 e último dia do mês</p><p><strong>5.5. Relatório Mensal de Resultado</strong></p><p>Ação: Nos primeiros 5 dias úteis do mês seguinte, Carol prepara relatório: receita por cliente e BU, despesas por centro de custo, margem por BU, inadimplência, comparativo com mês anterior. Apresentar a Marco em reunião de 30min.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Relatório mensal aprovado por Marco</p><p>Prazo referência: Até o 5º dia útil do mês seguinte</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] NF emitida em até 2 dias após entrega aprovada; [ ] Zero NFs enviadas com dados do cliente incorretos; [ ] Todas as despesas com comprovante no Drive; [ ] Conciliação bancária realizada 2x por mês; [ ] Relatório mensal entregue até o 5º dia útil.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>NF emitida com CNPJ errado do cliente → cancelamento e reemissão, atraso no pagamento. Despesa sem comprovante → impossibilidade de dedução fiscal. Recebível em atraso não cobrado → fluxo de caixa negativo. Relatório mensal atrasado → decisões sem base financeira.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>NFE.io, Google Sheets, Supabase, Internet Banking, Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Emissão de NF: 2 dias úteis pós-entrega. Atualização de recebíveis: semanal (sextas). Categorização de despesa: no mesmo dia. Relatório mensal: até 5º dia útil.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Entrega Aprovada → Emissão de NF → Envio ao Cliente → Controle de Recebível → Pagamento Recebido (ou Cobrança) → Despesas Categorizadas → Conciliação Quinzenal → Relatório Mensal → Marco Revisa → Fim</p><p><strong>  10. Glossário</strong></p><p>NFS-e: Nota Fiscal de Serviços eletrônica. Recebível: valor a receber de cliente já faturado. Centro de custo: categoria de agrupamento de despesas por área ou projeto. Conciliação bancária: processo de comparar registros internos com extrato bancário.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'high',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
    4,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-OPS-005
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir a emissão correta e pontual de notas fiscais, controle de contas a receber, categorização de despesas por centro de custo e disponibilidade de relatório financeiro mensal para tomada de decisão.', '<p>Garantir a emissão correta e pontual de notas fiscais, controle de contas a receber, categorização de despesas por centro de custo e disponibilidade de relatório financeiro mensal para tomada de decisão.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Emissão de NF-e, controle de recebíveis, categorização de despesas por BU/projeto, conciliação bancária básica e relatório mensal de resultado por centro de custo.', '<p>Emissão de NF-e, controle de recebíveis, categorização de despesas por BU/projeto, conciliação bancária básica e relatório mensal de resultado por centro de custo.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Contabilidade fiscal e apuração de impostos (responsabilidade do contador externo), folha de pagamento (RH), investimentos e captação de recursos.', '<p>Contabilidade fiscal e apuração de impostos (responsabilidade do contador externo), folha de pagamento (RH), investimentos e captação de recursos.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Emitir NFs, controlar recebíveis, categorizar despesas, preparar relatório</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovar despesas acima de R$500, revisar relatório mensal</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Contador Externo</p></td><td><p>Apuração fiscal, obrigações acessórias, SPED</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Líderes de BU</p></td><td><p>Informar despesas de projeto e aprovações de compra</p></td><td><p>Executor</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato do cliente com valores e condições de pagamento; notas de despesas e recibos organizados por BU; acesso ao sistema de emissão de NF (Prefeitura ou emissor como NFE.io); planilha financeira TBO atualizada.', '<p>Contrato do cliente com valores e condições de pagamento; notas de despesas e recibos organizados por BU; acesso ao sistema de emissão de NF (Prefeitura ou emissor como NFE.io); planilha financeira TBO atualizada.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'NFE.io ou sistema municipal de emissão de NFS-e, planilha financeira Google Sheets (modelo TBO), Supabase (registro de transações), internet banking, Google Drive (/financeiro).', '<p>NFE.io ou sistema municipal de emissão de NFS-e, planilha financeira Google Sheets (modelo TBO), Supabase (registro de transações), internet banking, Google Drive (/financeiro).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Emissão de Nota Fiscal', 'Ação: Ao concluir entrega faturável (conforme contrato), Carol emite NFS-e no sistema municipal informando: tomador, descrição do serviço, valor, alíquotas de imposto. Envia PDF ao cliente por e-mail. Registra na planilha de recebíveis.

Responsável: Carol (Ops)

Output: NF emitida, enviada ao cliente e registrada

Prazo referência: Até 2 dias úteis após entrega aprovada', '<p>Ação: Ao concluir entrega faturável (conforme contrato), Carol emite NFS-e no sistema municipal informando: tomador, descrição do serviço, valor, alíquotas de imposto. Envia PDF ao cliente por e-mail. Registra na planilha de recebíveis.</p><p>Responsável: Carol (Ops)</p><p>Output: NF emitida, enviada ao cliente e registrada</p><p>Prazo referência: Até 2 dias úteis após entrega aprovada</p>', 6, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Controle de Recebíveis', 'Ação: Carol atualiza planilha de recebíveis semanalmente: marcar NFs pagas, identificar NFs em atraso (>5 dias do vencimento), acionar cliente via WhatsApp para cobrança amigável; escalar para Marco se atraso >15 dias.

Responsável: Carol (Ops)

Output: Planilha de recebíveis atualizada

Prazo referência: Toda sexta-feira', '<p>Ação: Carol atualiza planilha de recebíveis semanalmente: marcar NFs pagas, identificar NFs em atraso (&gt;5 dias do vencimento), acionar cliente via WhatsApp para cobrança amigável; escalar para Marco se atraso &gt;15 dias.</p><p>Responsável: Carol (Ops)</p><p>Output: Planilha de recebíveis atualizada</p><p>Prazo referência: Toda sexta-feira</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Categorização de Despesas', 'Ação: Ao realizar qualquer despesa de projeto, Carol (ou líder de BU) registra na planilha: data, valor, fornecedor, centro de custo (BU: AV / GAM / OPS / ADM), projeto vinculado, comprovante no Drive. Despesas >R$500 exigem aprovação de Marco.

Responsável: Carol (Ops) + Líderes de BU

Output: Despesas categorizadas em tempo real

Prazo referência: No mesmo dia da despesa', '<p>Ação: Ao realizar qualquer despesa de projeto, Carol (ou líder de BU) registra na planilha: data, valor, fornecedor, centro de custo (BU: AV / GAM / OPS / ADM), projeto vinculado, comprovante no Drive. Despesas &gt;R$500 exigem aprovação de Marco.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Despesas categorizadas em tempo real</p><p>Prazo referência: No mesmo dia da despesa</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Conciliação Bancária (Quinzenal)', 'Ação: Carol compara extrato bancário com planilha de recebíveis e despesas: identificar recebimentos não registrados, despesas não categorizadas e transferências internas; ajustar planilha.

Responsável: Carol (Ops)

Output: Planilha conciliada com extrato bancário

Prazo referência: Dias 15 e último dia do mês', '<p>Ação: Carol compara extrato bancário com planilha de recebíveis e despesas: identificar recebimentos não registrados, despesas não categorizadas e transferências internas; ajustar planilha.</p><p>Responsável: Carol (Ops)</p><p>Output: Planilha conciliada com extrato bancário</p><p>Prazo referência: Dias 15 e último dia do mês</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Relatório Mensal de Resultado', 'Ação: Nos primeiros 5 dias úteis do mês seguinte, Carol prepara relatório: receita por cliente e BU, despesas por centro de custo, margem por BU, inadimplência, comparativo com mês anterior. Apresentar a Marco em reunião de 30min.

Responsável: Carol (Ops) + Marco Andolfato

Output: Relatório mensal aprovado por Marco

Prazo referência: Até o 5º dia útil do mês seguinte', '<p>Ação: Nos primeiros 5 dias úteis do mês seguinte, Carol prepara relatório: receita por cliente e BU, despesas por centro de custo, margem por BU, inadimplência, comparativo com mês anterior. Apresentar a Marco em reunião de 30min.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Relatório mensal aprovado por Marco</p><p>Prazo referência: Até o 5º dia útil do mês seguinte</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] NF emitida em até 2 dias após entrega aprovada; [ ] Zero NFs enviadas com dados do cliente incorretos; [ ] Todas as despesas com comprovante no Drive; [ ] Conciliação bancária realizada 2x por mês; [ ] Relatório mensal entregue até o 5º dia útil.', '<p>[ ] NF emitida em até 2 dias após entrega aprovada; [ ] Zero NFs enviadas com dados do cliente incorretos; [ ] Todas as despesas com comprovante no Drive; [ ] Conciliação bancária realizada 2x por mês; [ ] Relatório mensal entregue até o 5º dia útil.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'NF emitida com CNPJ errado do cliente → cancelamento e reemissão, atraso no pagamento. Despesa sem comprovante → impossibilidade de dedução fiscal. Recebível em atraso não cobrado → fluxo de caixa negativo. Relatório mensal atrasado → decisões sem base financeira.', '<p>NF emitida com CNPJ errado do cliente → cancelamento e reemissão, atraso no pagamento. Despesa sem comprovante → impossibilidade de dedução fiscal. Recebível em atraso não cobrado → fluxo de caixa negativo. Relatório mensal atrasado → decisões sem base financeira.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'NFE.io, Google Sheets, Supabase, Internet Banking, Google Drive.', '<p>NFE.io, Google Sheets, Supabase, Internet Banking, Google Drive.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Emissão de NF: 2 dias úteis pós-entrega. Atualização de recebíveis: semanal (sextas). Categorização de despesa: no mesmo dia. Relatório mensal: até 5º dia útil.', '<p>Emissão de NF: 2 dias úteis pós-entrega. Atualização de recebíveis: semanal (sextas). Categorização de despesa: no mesmo dia. Relatório mensal: até 5º dia útil.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Entrega Aprovada → Emissão de NF → Envio ao Cliente → Controle de Recebível → Pagamento Recebido (ou Cobrança) → Despesas Categorizadas → Conciliação Quinzenal → Relatório Mensal → Marco Revisa → Fim', '<p>Início → Entrega Aprovada → Emissão de NF → Envio ao Cliente → Controle de Recebível → Pagamento Recebido (ou Cobrança) → Despesas Categorizadas → Conciliação Quinzenal → Relatório Mensal → Marco Revisa → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'NFS-e: Nota Fiscal de Serviços eletrônica. Recebível: valor a receber de cliente já faturado. Centro de custo: categoria de agrupamento de despesas por área ou projeto. Conciliação bancária: processo de comparar registros internos com extrato bancário.', '<p>NFS-e: Nota Fiscal de Serviços eletrônica. Recebível: valor a receber de cliente já faturado. Centro de custo: categoria de agrupamento de despesas por área ou projeto. Conciliação bancária: processo de comparar registros internos com extrato bancário.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-006: Precificação e Proposta Comercial ──
END $$;