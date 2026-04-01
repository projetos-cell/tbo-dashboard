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