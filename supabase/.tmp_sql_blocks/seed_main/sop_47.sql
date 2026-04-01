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
    'Maquete Interativa para Vendas',
    'tbo-gam-001-maquete-interativa-para-vendas',
    'gamificacao',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Maquete Interativa para Vendas

Código

TBO-GAM-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Gamificação

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.

  2. Escopo

2.1 O que está coberto

Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.

2.2 Exclusões

Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução, aprovação final

Aprovador

—

Dev 3D / Artista Técnico

Modelagem, texturização, desenvolvimento da aplicação

Executor

—

Cliente / Incorporadora

Plantas, tabelas de disponibilidade, aprovações

Consultado

Informado

Carol (Ops)

Cronograma, entrega de assets, aceite formal

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).

4.2 Ferramentas e Acessos

Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.



  5. Procedimento Passo a Passo

5.1. Discovery Técnico e Briefing

Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.

Responsável: Marco Andolfato + Cliente

Output: Documento de escopo técnico aprovado

Prazo referência: Dia 1–3

5.2. Modelagem 3D do Empreendimento

Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.

Responsável: Dev 3D

Output: Modelos 3D aprovados esteticamente por Marco

Prazo referência: Dia 4–15

5.3. Desenvolvimento da Aplicação Interativa

Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).

Responsável: Dev 3D + Marco

Output: Build alpha funcional para testes internos

Prazo referência: Dia 16–30

5.4. Integração da Tabela de Disponibilidade

Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.

Responsável: Dev 3D

Output: Disponibilidade integrada e testada

Prazo referência: Dia 28–33

5.5. Testes em Hardware Real e Ajustes de Performance

Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.

Responsável: Dev 3D + Marco

Output: Build beta aprovada em hardware real

Prazo referência: Dia 34–38

5.6. Treinamento e Entrega

Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.

Responsável: Marco Andolfato + Carol (Ops)

Output: Stand operacional, equipe treinada, aceite assinado

Prazo referência: Dia 39–40

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.

6.2 Erros Comuns a Evitar

Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.

  7. Ferramentas e Templates

Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.

  8. SLAs e Prazos

Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.

  9. Fluxograma

Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim

  10. Glossário

LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Maquete Interativa para Vendas</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-GAM-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Gamificação</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.</p><p><strong>2.2 Exclusões</strong></p><p>Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, arquitetura da solução, aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Dev 3D / Artista Técnico</p></td><td><p>Modelagem, texturização, desenvolvimento da aplicação</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Plantas, tabelas de disponibilidade, aprovações</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Cronograma, entrega de assets, aceite formal</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Discovery Técnico e Briefing</strong></p><p>Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Documento de escopo técnico aprovado</p><p>Prazo referência: Dia 1–3</p><p><strong>5.2. Modelagem 3D do Empreendimento</strong></p><p>Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.</p><p>Responsável: Dev 3D</p><p>Output: Modelos 3D aprovados esteticamente por Marco</p><p>Prazo referência: Dia 4–15</p><p><strong>5.3. Desenvolvimento da Aplicação Interativa</strong></p><p>Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).</p><p>Responsável: Dev 3D + Marco</p><p>Output: Build alpha funcional para testes internos</p><p>Prazo referência: Dia 16–30</p><p><strong>5.4. Integração da Tabela de Disponibilidade</strong></p><p>Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.</p><p>Responsável: Dev 3D</p><p>Output: Disponibilidade integrada e testada</p><p>Prazo referência: Dia 28–33</p><p><strong>5.5. Testes em Hardware Real e Ajustes de Performance</strong></p><p>Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.</p><p>Responsável: Dev 3D + Marco</p><p>Output: Build beta aprovada em hardware real</p><p>Prazo referência: Dia 34–38</p><p><strong>5.6. Treinamento e Entrega</strong></p><p>Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Stand operacional, equipe treinada, aceite assinado</p><p>Prazo referência: Dia 39–40</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim</p><p><strong>  10. Glossário</strong></p><p>LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['interativo','gamificacao','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-GAM-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.', '<p>Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.', '<p>Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.', '<p>Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução, aprovação final

Aprovador

—

Dev 3D / Artista Técnico

Modelagem, texturização, desenvolvimento da aplicação

Executor

—

Cliente / Incorporadora

Plantas, tabelas de disponibilidade, aprovações

Consultado

Informado

Carol (Ops)

Cronograma, entrega de assets, aceite formal

Executor

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, arquitetura da solução, aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Dev 3D / Artista Técnico</p></td><td><p>Modelagem, texturização, desenvolvimento da aplicação</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Plantas, tabelas de disponibilidade, aprovações</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Cronograma, entrega de assets, aceite formal</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).', '<p>Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.', '<p>Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Discovery Técnico e Briefing', 'Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.

Responsável: Marco Andolfato + Cliente

Output: Documento de escopo técnico aprovado

Prazo referência: Dia 1–3', '<p>Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Documento de escopo técnico aprovado</p><p>Prazo referência: Dia 1–3</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Modelagem 3D do Empreendimento', 'Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.

Responsável: Dev 3D

Output: Modelos 3D aprovados esteticamente por Marco

Prazo referência: Dia 4–15', '<p>Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.</p><p>Responsável: Dev 3D</p><p>Output: Modelos 3D aprovados esteticamente por Marco</p><p>Prazo referência: Dia 4–15</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Desenvolvimento da Aplicação Interativa', 'Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).

Responsável: Dev 3D + Marco

Output: Build alpha funcional para testes internos

Prazo referência: Dia 16–30', '<p>Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).</p><p>Responsável: Dev 3D + Marco</p><p>Output: Build alpha funcional para testes internos</p><p>Prazo referência: Dia 16–30</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Integração da Tabela de Disponibilidade', 'Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.

Responsável: Dev 3D

Output: Disponibilidade integrada e testada

Prazo referência: Dia 28–33', '<p>Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.</p><p>Responsável: Dev 3D</p><p>Output: Disponibilidade integrada e testada</p><p>Prazo referência: Dia 28–33</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Testes em Hardware Real e Ajustes de Performance', 'Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.

Responsável: Dev 3D + Marco

Output: Build beta aprovada em hardware real

Prazo referência: Dia 34–38', '<p>Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.</p><p>Responsável: Dev 3D + Marco</p><p>Output: Build beta aprovada em hardware real</p><p>Prazo referência: Dia 34–38</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Treinamento e Entrega', 'Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.

Responsável: Marco Andolfato + Carol (Ops)

Output: Stand operacional, equipe treinada, aceite assinado

Prazo referência: Dia 39–40', '<p>Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Stand operacional, equipe treinada, aceite assinado</p><p>Prazo referência: Dia 39–40</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.', '<p>[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.', '<p>Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.', '<p>Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.', '<p>Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim', '<p>Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.', '<p>LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-GAM-002: Plataforma de Personalização de Unidades ──
END $$;