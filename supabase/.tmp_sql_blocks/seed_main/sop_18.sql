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
    'Tapume PDV',
    'tbo-brd-004-tapume-pdv',
    'branding',
    'checklist',
    'Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.',
    'Standard Operating Procedure

Tapume & PDV

Código

TBO-BRD-004

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Branding

Responsável

Nelson (PO Branding)

Aprovador

Marco Andolfato



  1. Objetivo

Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.

  2. Escopo

2.1 O que está coberto

Layout do tapume (arte final), materiais de PDV (banner, stand, totem, planta decorada, display de mesa), envio para produção gráfica e acompanhamento de aprovação.

2.2 Exclusões

Montagem física do tapume ou stand (responsabilidade da construtora/produtora), compra de insumos (responsabilidade do cliente), decoração de apartamento decorado.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Criação dos layouts e arte final

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação final antes do cliente

Aprovador



Cliente/Incorporadora

Fornecimento de dados técnicos (metragem do tapume, regulamentação local) e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing com medidas exatas do tapume (em metros lineares e altura), regulamentação da prefeitura local, planta do empreendimento (para PDV), fotos do terreno.

4.2 Ferramentas e Acessos

Adobe Illustrator (arte final), Adobe Photoshop (composições e KVs), Adobe InDesign (materiais multipágina), Fornecedor gráfico homologado (para template de arquivo de impressão).



  5. Procedimento Passo a Passo

5.1. Levantamento técnico

Ação: Coletar medidas exatas do tapume (comprimento total, altura, número de painéis), especificações de impressão do fornecedor (template, sangria, resolução mínima em dpi por metro linear), e regulamentação da prefeitura sobre dizeres obrigatórios (CNPJ, responsável técnico, memorial descritivo).

Responsável: Designer Senior + Atendimento

Output: Briefing técnico completo validado com fornecedor gráfico

Prazo referência: 1 dia útil

5.2. Definição de conceito visual e layout

Ação: Criar 2 propostas de layout para o tapume, explorando diferentes formas de dividir o espaço (zonas de atenção, hierarquia visual, renderizações do empreendimento, área de contato/QR Code). Definir grid e hierarquia de informação.

Responsável: Designer Senior + Nelson

Output: 2 sketches/mockups de layout aprovados internamente

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson aprova layout antes do desenvolvimento em arte final

5.3. Desenvolvimento da arte final do tapume

Ação: Produzir arte final em Illustrator/Photoshop conforme template do fornecedor. Incluir: KV do empreendimento, nome e tagline, renderização ou ilustração do empreendimento, diferenciais em destaque, logo da incorporadora, dados legais obrigatórios, QR Code para landing page, dados de contato.

Responsável: Designer Senior

Output: Arte final em PDF de alta resolução + arquivo editável AI

Prazo referência: 3 dias úteis

5.4. Materiais de PDV

Ação: Criar layouts dos materiais complementares do PDV conforme briefing: banner stand (850x2000mm padrão), totem de exposição, display de mesa (A3/A4), mapa de implantação decorado (planta do empreendimento com áreas identificadas), pasta para documentação.

Responsável: Designer Senior

Output: Layouts de todos os materiais PDV em arquivos separados prontos para impressão

Prazo referência: 3 dias úteis

5.5. Aprovação interna e do cliente

Ação: Marco Andolfato revisa toda a arte final (tapume + PDV). Enviar ao cliente em PDF para aprovação com roteiro de verificação (checklist de itens obrigatórios). Registrar aprovação por e-mail.

Responsável: Marco Andolfato / Nelson

Output: E-mail de aprovação do cliente arquivado, arquivos prontos para envio ao gráfico

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato e cliente assinam aprovação antes do envio para produção

5.6. Envio para produção e acompanhamento

Ação: Enviar arquivos aprovados ao fornecedor gráfico com especificações técnicas. Acompanhar prazo de produção. Conferir prova (quando possível) antes da impressão final. Comunicar cliente sobre prazo de entrega.

Responsável: Nelson / Atendimento

Output: Confirmação de envio ao gráfico, prazo de entrega comunicado ao cliente

Prazo referência: 1 dia útil após aprovação

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Arte final no formato exato especificado pelo fornecedor (com sangria e área segura); resolução mínima de 100dpi no tamanho final de impressão; dados legais obrigatórios presentes (CNPJ, RT, registro de imóveis); QR Code testado e funcional; cores em CMYK ou Pantone (não RGB); aprovação do cliente registrada por e-mail antes do envio para gráfica.

6.2 Erros Comuns a Evitar

Enviar arquivo RGB para impressão (causa variação de cor); esquecer dizeres obrigatórios da prefeitura; QR Code não testado; arte final com resolução insuficiente para o tamanho de impressão; enviar para gráfica sem aprovação formal do cliente.

  7. Ferramentas e Templates

Adobe Illustrator CC, Adobe Photoshop CC, Adobe InDesign CC, QR Code Generator (qr.io ou similar), Fornecedor gráfico homologado (Lonas e Faixas, Gráfica Lira, etc.).

  8. SLAs e Prazos

Levantamento técnico: 1 dia útil. Layout: 2 dias úteis. Arte final tapume: 3 dias úteis. PDV: 3 dias úteis. Aprovações: 2 dias úteis. Envio para produção: 1 dia útil. Total: 12–15 dias úteis (antes da data de instalação).

  9. Fluxograma

Início → Briefing com medidas e especificações → Levantamento técnico com fornecedor → Definir layout (2 opções) → [NELSON APROVA LAYOUT?] → Não: revisar → Sim: Desenvolver arte final tapume → Criar materiais PDV → [MARCO VALIDA?] → Não: corrigir → Sim: Enviar ao cliente para aprovação → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Enviar para produção gráfica → Acompanhar prazo → Fim

  10. Glossário

Tapume: estrutura de vedação do canteiro de obras, utilizada como suporte de comunicação visual. PDV (Ponto de Venda): espaço físico de atendimento e venda do empreendimento (stand de vendas). Arte final: arquivo gráfico preparado para impressão, com todas as especificações técnicas. Sangria: área extra além do limite de corte para evitar bordas brancas na impressão. Registro de Incorporação: documento legal obrigatório nas comunicações de empreendimentos imobiliários.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Tapume &amp; PDV</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Layout do tapume (arte final), materiais de PDV (banner, stand, totem, planta decorada, display de mesa), envio para produção gráfica e acompanhamento de aprovação.</p><p><strong>2.2 Exclusões</strong></p><p>Montagem física do tapume ou stand (responsabilidade da construtora/produtora), compra de insumos (responsabilidade do cliente), decoração de apartamento decorado.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Criação dos layouts e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes do cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de dados técnicos (metragem do tapume, regulamentação local) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing com medidas exatas do tapume (em metros lineares e altura), regulamentação da prefeitura local, planta do empreendimento (para PDV), fotos do terreno.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Illustrator (arte final), Adobe Photoshop (composições e KVs), Adobe InDesign (materiais multipágina), Fornecedor gráfico homologado (para template de arquivo de impressão).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Levantamento técnico</strong></p><p>Ação: Coletar medidas exatas do tapume (comprimento total, altura, número de painéis), especificações de impressão do fornecedor (template, sangria, resolução mínima em dpi por metro linear), e regulamentação da prefeitura sobre dizeres obrigatórios (CNPJ, responsável técnico, memorial descritivo).</p><p>Responsável: Designer Senior + Atendimento</p><p>Output: Briefing técnico completo validado com fornecedor gráfico</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Definição de conceito visual e layout</strong></p><p>Ação: Criar 2 propostas de layout para o tapume, explorando diferentes formas de dividir o espaço (zonas de atenção, hierarquia visual, renderizações do empreendimento, área de contato/QR Code). Definir grid e hierarquia de informação.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: 2 sketches/mockups de layout aprovados internamente</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova layout antes do desenvolvimento em arte final</strong></p><p><strong>5.3. Desenvolvimento da arte final do tapume</strong></p><p>Ação: Produzir arte final em Illustrator/Photoshop conforme template do fornecedor. Incluir: KV do empreendimento, nome e tagline, renderização ou ilustração do empreendimento, diferenciais em destaque, logo da incorporadora, dados legais obrigatórios, QR Code para landing page, dados de contato.</p><p>Responsável: Designer Senior</p><p>Output: Arte final em PDF de alta resolução + arquivo editável AI</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.4. Materiais de PDV</strong></p><p>Ação: Criar layouts dos materiais complementares do PDV conforme briefing: banner stand (850x2000mm padrão), totem de exposição, display de mesa (A3/A4), mapa de implantação decorado (planta do empreendimento com áreas identificadas), pasta para documentação.</p><p>Responsável: Designer Senior</p><p>Output: Layouts de todos os materiais PDV em arquivos separados prontos para impressão</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.5. Aprovação interna e do cliente</strong></p><p>Ação: Marco Andolfato revisa toda a arte final (tapume + PDV). Enviar ao cliente em PDF para aprovação com roteiro de verificação (checklist de itens obrigatórios). Registrar aprovação por e-mail.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: E-mail de aprovação do cliente arquivado, arquivos prontos para envio ao gráfico</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato e cliente assinam aprovação antes do envio para produção</strong></p><p><strong>5.6. Envio para produção e acompanhamento</strong></p><p>Ação: Enviar arquivos aprovados ao fornecedor gráfico com especificações técnicas. Acompanhar prazo de produção. Conferir prova (quando possível) antes da impressão final. Comunicar cliente sobre prazo de entrega.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Confirmação de envio ao gráfico, prazo de entrega comunicado ao cliente</p><p>Prazo referência: 1 dia útil após aprovação</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Arte final no formato exato especificado pelo fornecedor (com sangria e área segura); resolução mínima de 100dpi no tamanho final de impressão; dados legais obrigatórios presentes (CNPJ, RT, registro de imóveis); QR Code testado e funcional; cores em CMYK ou Pantone (não RGB); aprovação do cliente registrada por e-mail antes do envio para gráfica.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Enviar arquivo RGB para impressão (causa variação de cor); esquecer dizeres obrigatórios da prefeitura; QR Code não testado; arte final com resolução insuficiente para o tamanho de impressão; enviar para gráfica sem aprovação formal do cliente.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Illustrator CC, Adobe Photoshop CC, Adobe InDesign CC, QR Code Generator (qr.io ou similar), Fornecedor gráfico homologado (Lonas e Faixas, Gráfica Lira, etc.).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Levantamento técnico: 1 dia útil. Layout: 2 dias úteis. Arte final tapume: 3 dias úteis. PDV: 3 dias úteis. Aprovações: 2 dias úteis. Envio para produção: 1 dia útil. Total: 12–15 dias úteis (antes da data de instalação).</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing com medidas e especificações → Levantamento técnico com fornecedor → Definir layout (2 opções) → [NELSON APROVA LAYOUT?] → Não: revisar → Sim: Desenvolver arte final tapume → Criar materiais PDV → [MARCO VALIDA?] → Não: corrigir → Sim: Enviar ao cliente para aprovação → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Enviar para produção gráfica → Acompanhar prazo → Fim</p><p><strong>  10. Glossário</strong></p><p>Tapume: estrutura de vedação do canteiro de obras, utilizada como suporte de comunicação visual. PDV (Ponto de Venda): espaço físico de atendimento e venda do empreendimento (stand de vendas). Arte final: arquivo gráfico preparado para impressão, com todas as especificações técnicas. Sangria: área extra além do limite de corte para evitar bordas brancas na impressão. Registro de Incorporação: documento legal obrigatório nas comunicações de empreendimentos imobiliários.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-BRD-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.', '<p>Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Layout do tapume (arte final), materiais de PDV (banner, stand, totem, planta decorada, display de mesa), envio para produção gráfica e acompanhamento de aprovação.', '<p>Layout do tapume (arte final), materiais de PDV (banner, stand, totem, planta decorada, display de mesa), envio para produção gráfica e acompanhamento de aprovação.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Montagem física do tapume ou stand (responsabilidade da construtora/produtora), compra de insumos (responsabilidade do cliente), decoração de apartamento decorado.', '<p>Montagem física do tapume ou stand (responsabilidade da construtora/produtora), compra de insumos (responsabilidade do cliente), decoração de apartamento decorado.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Criação dos layouts e arte final

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação final antes do cliente

Aprovador

Cliente/Incorporadora

Fornecimento de dados técnicos (metragem do tapume, regulamentação local) e aprovação

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Criação dos layouts e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes do cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de dados técnicos (metragem do tapume, regulamentação local) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing com medidas exatas do tapume (em metros lineares e altura), regulamentação da prefeitura local, planta do empreendimento (para PDV), fotos do terreno.', '<p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing com medidas exatas do tapume (em metros lineares e altura), regulamentação da prefeitura local, planta do empreendimento (para PDV), fotos do terreno.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator (arte final), Adobe Photoshop (composições e KVs), Adobe InDesign (materiais multipágina), Fornecedor gráfico homologado (para template de arquivo de impressão).', '<p>Adobe Illustrator (arte final), Adobe Photoshop (composições e KVs), Adobe InDesign (materiais multipágina), Fornecedor gráfico homologado (para template de arquivo de impressão).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Levantamento técnico', 'Ação: Coletar medidas exatas do tapume (comprimento total, altura, número de painéis), especificações de impressão do fornecedor (template, sangria, resolução mínima em dpi por metro linear), e regulamentação da prefeitura sobre dizeres obrigatórios (CNPJ, responsável técnico, memorial descritivo).

Responsável: Designer Senior + Atendimento

Output: Briefing técnico completo validado com fornecedor gráfico

Prazo referência: 1 dia útil', '<p>Ação: Coletar medidas exatas do tapume (comprimento total, altura, número de painéis), especificações de impressão do fornecedor (template, sangria, resolução mínima em dpi por metro linear), e regulamentação da prefeitura sobre dizeres obrigatórios (CNPJ, responsável técnico, memorial descritivo).</p><p>Responsável: Designer Senior + Atendimento</p><p>Output: Briefing técnico completo validado com fornecedor gráfico</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Definição de conceito visual e layout', 'Ação: Criar 2 propostas de layout para o tapume, explorando diferentes formas de dividir o espaço (zonas de atenção, hierarquia visual, renderizações do empreendimento, área de contato/QR Code). Definir grid e hierarquia de informação.

Responsável: Designer Senior + Nelson

Output: 2 sketches/mockups de layout aprovados internamente

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson aprova layout antes do desenvolvimento em arte final', '<p>Ação: Criar 2 propostas de layout para o tapume, explorando diferentes formas de dividir o espaço (zonas de atenção, hierarquia visual, renderizações do empreendimento, área de contato/QR Code). Definir grid e hierarquia de informação.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: 2 sketches/mockups de layout aprovados internamente</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova layout antes do desenvolvimento em arte final</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Desenvolvimento da arte final do tapume', 'Ação: Produzir arte final em Illustrator/Photoshop conforme template do fornecedor. Incluir: KV do empreendimento, nome e tagline, renderização ou ilustração do empreendimento, diferenciais em destaque, logo da incorporadora, dados legais obrigatórios, QR Code para landing page, dados de contato.

Responsável: Designer Senior

Output: Arte final em PDF de alta resolução + arquivo editável AI

Prazo referência: 3 dias úteis', '<p>Ação: Produzir arte final em Illustrator/Photoshop conforme template do fornecedor. Incluir: KV do empreendimento, nome e tagline, renderização ou ilustração do empreendimento, diferenciais em destaque, logo da incorporadora, dados legais obrigatórios, QR Code para landing page, dados de contato.</p><p>Responsável: Designer Senior</p><p>Output: Arte final em PDF de alta resolução + arquivo editável AI</p><p>Prazo referência: 3 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Materiais de PDV', 'Ação: Criar layouts dos materiais complementares do PDV conforme briefing: banner stand (850x2000mm padrão), totem de exposição, display de mesa (A3/A4), mapa de implantação decorado (planta do empreendimento com áreas identificadas), pasta para documentação.

Responsável: Designer Senior

Output: Layouts de todos os materiais PDV em arquivos separados prontos para impressão

Prazo referência: 3 dias úteis', '<p>Ação: Criar layouts dos materiais complementares do PDV conforme briefing: banner stand (850x2000mm padrão), totem de exposição, display de mesa (A3/A4), mapa de implantação decorado (planta do empreendimento com áreas identificadas), pasta para documentação.</p><p>Responsável: Designer Senior</p><p>Output: Layouts de todos os materiais PDV em arquivos separados prontos para impressão</p><p>Prazo referência: 3 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aprovação interna e do cliente', 'Ação: Marco Andolfato revisa toda a arte final (tapume + PDV). Enviar ao cliente em PDF para aprovação com roteiro de verificação (checklist de itens obrigatórios). Registrar aprovação por e-mail.

Responsável: Marco Andolfato / Nelson

Output: E-mail de aprovação do cliente arquivado, arquivos prontos para envio ao gráfico

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato e cliente assinam aprovação antes do envio para produção', '<p>Ação: Marco Andolfato revisa toda a arte final (tapume + PDV). Enviar ao cliente em PDF para aprovação com roteiro de verificação (checklist de itens obrigatórios). Registrar aprovação por e-mail.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: E-mail de aprovação do cliente arquivado, arquivos prontos para envio ao gráfico</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato e cliente assinam aprovação antes do envio para produção</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Envio para produção e acompanhamento', 'Ação: Enviar arquivos aprovados ao fornecedor gráfico com especificações técnicas. Acompanhar prazo de produção. Conferir prova (quando possível) antes da impressão final. Comunicar cliente sobre prazo de entrega.

Responsável: Nelson / Atendimento

Output: Confirmação de envio ao gráfico, prazo de entrega comunicado ao cliente

Prazo referência: 1 dia útil após aprovação', '<p>Ação: Enviar arquivos aprovados ao fornecedor gráfico com especificações técnicas. Acompanhar prazo de produção. Conferir prova (quando possível) antes da impressão final. Comunicar cliente sobre prazo de entrega.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Confirmação de envio ao gráfico, prazo de entrega comunicado ao cliente</p><p>Prazo referência: 1 dia útil após aprovação</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Arte final no formato exato especificado pelo fornecedor (com sangria e área segura); resolução mínima de 100dpi no tamanho final de impressão; dados legais obrigatórios presentes (CNPJ, RT, registro de imóveis); QR Code testado e funcional; cores em CMYK ou Pantone (não RGB); aprovação do cliente registrada por e-mail antes do envio para gráfica.', '<p>Arte final no formato exato especificado pelo fornecedor (com sangria e área segura); resolução mínima de 100dpi no tamanho final de impressão; dados legais obrigatórios presentes (CNPJ, RT, registro de imóveis); QR Code testado e funcional; cores em CMYK ou Pantone (não RGB); aprovação do cliente registrada por e-mail antes do envio para gráfica.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar arquivo RGB para impressão (causa variação de cor); esquecer dizeres obrigatórios da prefeitura; QR Code não testado; arte final com resolução insuficiente para o tamanho de impressão; enviar para gráfica sem aprovação formal do cliente.', '<p>Enviar arquivo RGB para impressão (causa variação de cor); esquecer dizeres obrigatórios da prefeitura; QR Code não testado; arte final com resolução insuficiente para o tamanho de impressão; enviar para gráfica sem aprovação formal do cliente.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe Photoshop CC, Adobe InDesign CC, QR Code Generator (qr.io ou similar), Fornecedor gráfico homologado (Lonas e Faixas, Gráfica Lira, etc.).', '<p>Adobe Illustrator CC, Adobe Photoshop CC, Adobe InDesign CC, QR Code Generator (qr.io ou similar), Fornecedor gráfico homologado (Lonas e Faixas, Gráfica Lira, etc.).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Levantamento técnico: 1 dia útil. Layout: 2 dias úteis. Arte final tapume: 3 dias úteis. PDV: 3 dias úteis. Aprovações: 2 dias úteis. Envio para produção: 1 dia útil. Total: 12–15 dias úteis (antes da data de instalação).', '<p>Levantamento técnico: 1 dia útil. Layout: 2 dias úteis. Arte final tapume: 3 dias úteis. PDV: 3 dias úteis. Aprovações: 2 dias úteis. Envio para produção: 1 dia útil. Total: 12–15 dias úteis (antes da data de instalação).</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing com medidas e especificações → Levantamento técnico com fornecedor → Definir layout (2 opções) → [NELSON APROVA LAYOUT?] → Não: revisar → Sim: Desenvolver arte final tapume → Criar materiais PDV → [MARCO VALIDA?] → Não: corrigir → Sim: Enviar ao cliente para aprovação → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Enviar para produção gráfica → Acompanhar prazo → Fim', '<p>Início → Briefing com medidas e especificações → Levantamento técnico com fornecedor → Definir layout (2 opções) → [NELSON APROVA LAYOUT?] → Não: revisar → Sim: Desenvolver arte final tapume → Criar materiais PDV → [MARCO VALIDA?] → Não: corrigir → Sim: Enviar ao cliente para aprovação → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Enviar para produção gráfica → Acompanhar prazo → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Tapume: estrutura de vedação do canteiro de obras, utilizada como suporte de comunicação visual. PDV (Ponto de Venda): espaço físico de atendimento e venda do empreendimento (stand de vendas). Arte final: arquivo gráfico preparado para impressão, com todas as especificações técnicas. Sangria: área extra além do limite de corte para evitar bordas brancas na impressão. Registro de Incorporação: documento legal obrigatório nas comunicações de empreendimentos imobiliários.', '<p>Tapume: estrutura de vedação do canteiro de obras, utilizada como suporte de comunicação visual. PDV (Ponto de Venda): espaço físico de atendimento e venda do empreendimento (stand de vendas). Arte final: arquivo gráfico preparado para impressão, com todas as especificações técnicas. Sangria: área extra além do limite de corte para evitar bordas brancas na impressão. Registro de Incorporação: documento legal obrigatório nas comunicações de empreendimentos imobiliários.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-006: Book de Vendas ──
END $$;