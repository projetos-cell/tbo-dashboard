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
    'Fechamento e Contratacao',
    'tbo-com-003-fechamento-e-contratacao',
    'comercial',
    'checklist',
    'Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.',
    'Standard Operating Procedure

Fechamento e Contratação

Código

TBO-COM-003

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

Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.

2. Escopo

2.1 O que está coberto

Aceite formal, geração de contrato, assinatura via ClickSign, confirmação de pagamento e trigger de onboarding.

2.2 Exclusões

Negociação (SOP-COM-002), onboarding de cliente (SOP-ATD-001), faturamento recorrente (SOP-FIN-001).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy Lima

Formalizar aceite e alinhar condições finais

Executor

---

Carol (Ops)

Gerar contrato, enviar via ClickSign, confirmar pagamento

Executor

---

Marco

Confirmar recebimento e autorizar início da produção

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Proposta aceita formalmente (e-mail ou mensagem escrita); versão final da proposta no Drive; template de contrato jurídico TBO atualizado.

4.2 Ferramentas e Acessos

ClickSign (assinatura digital), Google Drive (contrato), TBO OS (módulo financeiro), Banco do Brasil Empresarial.

5. Procedimento Passo a Passo

5.1. Aceite Formal

Ação: Ruy obtém aceite por escrito (e-mail ou mensagem) do decisor do cliente. Registra no RD Station CRM como Ganho.

Responsável: Ruy Lima

Output: Aceite registrado no CRM

Prazo referência: Imediato após confirmação verbal

5.2. Geração do Contrato

Ação: Carol gera contrato com base no template jurídico TBO, inserindo dados específicos: escopo conforme proposta final, valores, condições de pagamento, prazos, cláusulas de revisão e cancelamento.

Responsável: Carol (Ops)

Output: Contrato em PDF pronto para assinatura

Prazo referência: Até 2 dias úteis após aceite

5.3. Assinatura Digital

Ação: Contrato enviado via ClickSign para assinatura do cliente e dos sócios da TBO. Documento assinado armazenado no Drive (pasta restrita).

Responsável: Carol (Ops)

Output: Contrato assinado digitalmente por todas as partes

Prazo referência: Até 5 dias úteis

5.4. Confirmação Financeira e Trigger de Onboarding

Ação: Marco confirma recebimento do sinal ou primeira parcela via extrato BB Empresarial. Registro no TBO OS (módulo financeiro). Com contrato assinado e pagamento confirmado, Carol inicia SOP-ATD-001.

Responsável: Marco + Carol (Ops)

Output: Pagamento confirmado, onboarding iniciado

Prazo referência: Até 48h após assinatura

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Aceite formal documentado (e-mail/mensagem)

[ ] CRM atualizado como Ganho

[ ] Contrato gerado com dados da proposta final

[ ] Assinatura digital concluída por todas as partes

[ ] Contrato armazenado na pasta restrita do Drive

[ ] Primeiro pagamento confirmado

[ ] Onboarding iniciado (SOP-ATD-001)

6.2 Erros Comuns a Evitar

Iniciar produção antes do contrato assinado → risco jurídico e financeiro

Aceite verbal sem documentação → disputa futura sobre escopo

Não confirmar pagamento → entrega sem garantia de recebimento

7. Ferramentas e Templates

ClickSign (assinatura digital), RD Station CRM (funil), Google Drive (armazenamento), TBO OS (financeiro), BB Empresarial (conciliação).

8. SLAs e Prazos

Aceite formal: imediato após confirmação

Contrato gerado: até 2 dias úteis

Assinatura digital: até 5 dias úteis

Confirmação de pagamento: até 48h após assinatura

Regra: nenhuma produção inicia sem contrato + pagamento. Exceções requerem aprovação escrita de ambos os sócios.

9. Fluxograma

Proposta Aceita → Aceite Formal Documentado → Carol Gera Contrato → ClickSign (assinatura) → Pagamento Confirmado? → Sim: Trigger SOP-ATD-001 (Onboarding) → Fim / Não: Follow-up de Cobrança → Fim

10. Glossário

ClickSign: plataforma de assinatura digital com validade jurídica.

Sinal: primeira parcela paga antes do início da produção.

Trigger: evento que dispara automaticamente o próximo processo.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Fechamento e Contratação</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-COM-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Comercial (Vendas / BD)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Aceite formal, geração de contrato, assinatura via ClickSign, confirmação de pagamento e trigger de onboarding.</p><p><strong>2.2 Exclusões</strong></p><p>Negociação (SOP-COM-002), onboarding de cliente (SOP-ATD-001), faturamento recorrente (SOP-FIN-001).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Formalizar aceite e alinhar condições finais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Gerar contrato, enviar via ClickSign, confirmar pagamento</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Confirmar recebimento e autorizar início da produção</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Proposta aceita formalmente (e-mail ou mensagem escrita); versão final da proposta no Drive; template de contrato jurídico TBO atualizado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>ClickSign (assinatura digital), Google Drive (contrato), TBO OS (módulo financeiro), Banco do Brasil Empresarial.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Aceite Formal</strong></p><p>Ação: Ruy obtém aceite por escrito (e-mail ou mensagem) do decisor do cliente. Registra no RD Station CRM como Ganho.</p><p>Responsável: Ruy Lima</p><p>Output: Aceite registrado no CRM</p><p>Prazo referência: Imediato após confirmação verbal</p><p><strong>5.2. Geração do Contrato</strong></p><p>Ação: Carol gera contrato com base no template jurídico TBO, inserindo dados específicos: escopo conforme proposta final, valores, condições de pagamento, prazos, cláusulas de revisão e cancelamento.</p><p>Responsável: Carol (Ops)</p><p>Output: Contrato em PDF pronto para assinatura</p><p>Prazo referência: Até 2 dias úteis após aceite</p><p><strong>5.3. Assinatura Digital</strong></p><p>Ação: Contrato enviado via ClickSign para assinatura do cliente e dos sócios da TBO. Documento assinado armazenado no Drive (pasta restrita).</p><p>Responsável: Carol (Ops)</p><p>Output: Contrato assinado digitalmente por todas as partes</p><p>Prazo referência: Até 5 dias úteis</p><p><strong>5.4. Confirmação Financeira e Trigger de Onboarding</strong></p><p>Ação: Marco confirma recebimento do sinal ou primeira parcela via extrato BB Empresarial. Registro no TBO OS (módulo financeiro). Com contrato assinado e pagamento confirmado, Carol inicia SOP-ATD-001.</p><p>Responsável: Marco + Carol (Ops)</p><p>Output: Pagamento confirmado, onboarding iniciado</p><p>Prazo referência: Até 48h após assinatura</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Aceite formal documentado (e-mail/mensagem)</li><li>[ ] CRM atualizado como Ganho</li><li>[ ] Contrato gerado com dados da proposta final</li><li>[ ] Assinatura digital concluída por todas as partes</li><li>[ ] Contrato armazenado na pasta restrita do Drive</li><li>[ ] Primeiro pagamento confirmado</li><li>[ ] Onboarding iniciado (SOP-ATD-001)</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Iniciar produção antes do contrato assinado → risco jurídico e financeiro</li><li>Aceite verbal sem documentação → disputa futura sobre escopo</li><li>Não confirmar pagamento → entrega sem garantia de recebimento</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>ClickSign (assinatura digital), RD Station CRM (funil), Google Drive (armazenamento), TBO OS (financeiro), BB Empresarial (conciliação).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Aceite formal: imediato após confirmação</li><li>Contrato gerado: até 2 dias úteis</li><li>Assinatura digital: até 5 dias úteis</li><li>Confirmação de pagamento: até 48h após assinatura</li><li>Regra: nenhuma produção inicia sem contrato + pagamento. Exceções requerem aprovação escrita de ambos os sócios.</li></ul><p><strong>9. Fluxograma</strong></p><p>Proposta Aceita → Aceite Formal Documentado → Carol Gera Contrato → ClickSign (assinatura) → Pagamento Confirmado? → Sim: Trigger SOP-ATD-001 (Onboarding) → Fim / Não: Follow-up de Cobrança → Fim</p><p><strong>10. Glossário</strong></p><p>ClickSign: plataforma de assinatura digital com validade jurídica.</p><p>Sinal: primeira parcela paga antes do início da produção.</p><p>Trigger: evento que dispara automaticamente o próximo processo.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['comercial','vendas','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-COM-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.', '<p>Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Aceite formal, geração de contrato, assinatura via ClickSign, confirmação de pagamento e trigger de onboarding.', '<p>Aceite formal, geração de contrato, assinatura via ClickSign, confirmação de pagamento e trigger de onboarding.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Negociação (SOP-COM-002), onboarding de cliente (SOP-ATD-001), faturamento recorrente (SOP-FIN-001).', '<p>Negociação (SOP-COM-002), onboarding de cliente (SOP-ATD-001), faturamento recorrente (SOP-FIN-001).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy Lima

Formalizar aceite e alinhar condições finais

Executor

---

Carol (Ops)

Gerar contrato, enviar via ClickSign, confirmar pagamento

Executor

---

Marco

Confirmar recebimento e autorizar início da produção

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Formalizar aceite e alinhar condições finais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Gerar contrato, enviar via ClickSign, confirmar pagamento</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Confirmar recebimento e autorizar início da produção</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Proposta aceita formalmente (e-mail ou mensagem escrita); versão final da proposta no Drive; template de contrato jurídico TBO atualizado.', '<p>Proposta aceita formalmente (e-mail ou mensagem escrita); versão final da proposta no Drive; template de contrato jurídico TBO atualizado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'ClickSign (assinatura digital), Google Drive (contrato), TBO OS (módulo financeiro), Banco do Brasil Empresarial.', '<p>ClickSign (assinatura digital), Google Drive (contrato), TBO OS (módulo financeiro), Banco do Brasil Empresarial.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Aceite Formal', 'Ação: Ruy obtém aceite por escrito (e-mail ou mensagem) do decisor do cliente. Registra no RD Station CRM como Ganho.

Responsável: Ruy Lima

Output: Aceite registrado no CRM

Prazo referência: Imediato após confirmação verbal', '<p>Ação: Ruy obtém aceite por escrito (e-mail ou mensagem) do decisor do cliente. Registra no RD Station CRM como Ganho.</p><p>Responsável: Ruy Lima</p><p>Output: Aceite registrado no CRM</p><p>Prazo referência: Imediato após confirmação verbal</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Geração do Contrato', 'Ação: Carol gera contrato com base no template jurídico TBO, inserindo dados específicos: escopo conforme proposta final, valores, condições de pagamento, prazos, cláusulas de revisão e cancelamento.

Responsável: Carol (Ops)

Output: Contrato em PDF pronto para assinatura

Prazo referência: Até 2 dias úteis após aceite', '<p>Ação: Carol gera contrato com base no template jurídico TBO, inserindo dados específicos: escopo conforme proposta final, valores, condições de pagamento, prazos, cláusulas de revisão e cancelamento.</p><p>Responsável: Carol (Ops)</p><p>Output: Contrato em PDF pronto para assinatura</p><p>Prazo referência: Até 2 dias úteis após aceite</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Assinatura Digital', 'Ação: Contrato enviado via ClickSign para assinatura do cliente e dos sócios da TBO. Documento assinado armazenado no Drive (pasta restrita).

Responsável: Carol (Ops)

Output: Contrato assinado digitalmente por todas as partes

Prazo referência: Até 5 dias úteis', '<p>Ação: Contrato enviado via ClickSign para assinatura do cliente e dos sócios da TBO. Documento assinado armazenado no Drive (pasta restrita).</p><p>Responsável: Carol (Ops)</p><p>Output: Contrato assinado digitalmente por todas as partes</p><p>Prazo referência: Até 5 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Confirmação Financeira e Trigger de Onboarding', 'Ação: Marco confirma recebimento do sinal ou primeira parcela via extrato BB Empresarial. Registro no TBO OS (módulo financeiro). Com contrato assinado e pagamento confirmado, Carol inicia SOP-ATD-001.

Responsável: Marco + Carol (Ops)

Output: Pagamento confirmado, onboarding iniciado

Prazo referência: Até 48h após assinatura', '<p>Ação: Marco confirma recebimento do sinal ou primeira parcela via extrato BB Empresarial. Registro no TBO OS (módulo financeiro). Com contrato assinado e pagamento confirmado, Carol inicia SOP-ATD-001.</p><p>Responsável: Marco + Carol (Ops)</p><p>Output: Pagamento confirmado, onboarding iniciado</p><p>Prazo referência: Até 48h após assinatura</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Aceite formal documentado (e-mail/mensagem)

[ ] CRM atualizado como Ganho

[ ] Contrato gerado com dados da proposta final

[ ] Assinatura digital concluída por todas as partes

[ ] Contrato armazenado na pasta restrita do Drive

[ ] Primeiro pagamento confirmado

[ ] Onboarding iniciado (SOP-ATD-001)', '<ul><li>[ ] Aceite formal documentado (e-mail/mensagem)</li><li>[ ] CRM atualizado como Ganho</li><li>[ ] Contrato gerado com dados da proposta final</li><li>[ ] Assinatura digital concluída por todas as partes</li><li>[ ] Contrato armazenado na pasta restrita do Drive</li><li>[ ] Primeiro pagamento confirmado</li><li>[ ] Onboarding iniciado (SOP-ATD-001)</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Iniciar produção antes do contrato assinado → risco jurídico e financeiro

Aceite verbal sem documentação → disputa futura sobre escopo

Não confirmar pagamento → entrega sem garantia de recebimento', '<ul><li>Iniciar produção antes do contrato assinado → risco jurídico e financeiro</li><li>Aceite verbal sem documentação → disputa futura sobre escopo</li><li>Não confirmar pagamento → entrega sem garantia de recebimento</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'ClickSign (assinatura digital), RD Station CRM (funil), Google Drive (armazenamento), TBO OS (financeiro), BB Empresarial (conciliação).', '<p>ClickSign (assinatura digital), RD Station CRM (funil), Google Drive (armazenamento), TBO OS (financeiro), BB Empresarial (conciliação).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Aceite formal: imediato após confirmação

Contrato gerado: até 2 dias úteis

Assinatura digital: até 5 dias úteis

Confirmação de pagamento: até 48h após assinatura

Regra: nenhuma produção inicia sem contrato + pagamento. Exceções requerem aprovação escrita de ambos os sócios.', '<ul><li>Aceite formal: imediato após confirmação</li><li>Contrato gerado: até 2 dias úteis</li><li>Assinatura digital: até 5 dias úteis</li><li>Confirmação de pagamento: até 48h após assinatura</li><li>Regra: nenhuma produção inicia sem contrato + pagamento. Exceções requerem aprovação escrita de ambos os sócios.</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Proposta Aceita → Aceite Formal Documentado → Carol Gera Contrato → ClickSign (assinatura) → Pagamento Confirmado? → Sim: Trigger SOP-ATD-001 (Onboarding) → Fim / Não: Follow-up de Cobrança → Fim', '<p>Proposta Aceita → Aceite Formal Documentado → Carol Gera Contrato → ClickSign (assinatura) → Pagamento Confirmado? → Sim: Trigger SOP-ATD-001 (Onboarding) → Fim / Não: Follow-up de Cobrança → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'ClickSign: plataforma de assinatura digital com validade jurídica.

Sinal: primeira parcela paga antes do início da produção.

Trigger: evento que dispara automaticamente o próximo processo.', '<p>ClickSign: plataforma de assinatura digital com validade jurídica.</p><p>Sinal: primeira parcela paga antes do início da produção.</p><p>Trigger: evento que dispara automaticamente o próximo processo.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-COM-004: Pipeline e Forecast Comercial ──
END $$;