-- ============================================================================
-- TBO OS -- Migration 031: Seed "Biblioteca de Abordagens" page
--
-- Importa o conteudo da pagina Notion "Biblioteca de Abordagens" para a
-- tabela pages, vinculada ao workspace Comercial (ws-comercial).
-- Conteudo convertido de Notion para HTML nativo com <details>/<summary>.
-- ============================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_user_id   UUID;
BEGIN
  -- Buscar o primeiro tenant (TBO e unico tenant)
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'Nenhum tenant encontrado — pulando seed.';
    RETURN;
  END IF;

  -- Buscar um usuario owner/admin para created_by
  SELECT p.supabase_user_id INTO v_user_id
  FROM people p
  WHERE p.tenant_id = v_tenant_id
    AND p.role_slug IN ('owner', 'admin', 'socio', 'founder')
    AND p.supabase_user_id IS NOT NULL
  LIMIT 1;

  IF v_user_id IS NULL THEN
    -- Fallback: qualquer usuario do tenant
    SELECT p.supabase_user_id INTO v_user_id
    FROM people p
    WHERE p.tenant_id = v_tenant_id
      AND p.supabase_user_id IS NOT NULL
    LIMIT 1;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuario encontrado — pulando seed.';
    RETURN;
  END IF;

  -- Inserir pagina (idempotente: verifica se ja existe pelo titulo + space)
  INSERT INTO pages (tenant_id, space_id, title, icon, content, created_by, updated_by)
  SELECT
    v_tenant_id,
    'ws-comercial',
    'Biblioteca de Abordagens',
    '💬',
    jsonb_build_object('html', E'<h2>Pitch de Prospecção por Telefone</h2>\n\n<details>\n<summary><strong>\U0001F7E2 Abordagem fria - LinkedIn</strong></summary>\n<p>Olá, ! Bom dia, tudo bem?<br>Agradeço pela conexão, é um prazer em tê-la na minha rede de contatos do LinkedIn.</p>\n<p>Me chamo Gustavo Bientinezi, sou gestor comercial na TBO. Somos um hub de soluções para lançamentos imobiliários, com forte atuação em Renderização.</p>\n<p>Gostaria de verificar se você pode me auxiliar numa questão por gentileza. Sabe me dizer qual é a pessoa correta que eu devo falar na {Empresa} responsável pela análise e contratação de novos fornecedores de Render 3D?</p>\n</details>\n\n<details>\n<summary><strong>\U0001F7E2 Abordagem fria - Setor de Marketing (Mkt, Branding e Produções Audiovisuais)</strong></summary>\n<p>Olá, {Nome}! Bom dia, tudo bem?<br>Obrigado pela conexão.</p>\n<p>Me chamo Gustavo Bientinezi e sou gestor comercial na TBO. Atuamos como um hub de soluções para lançamentos imobiliários, apoiando incorporadoras desde a concepção e execução das campanhas de lançamento até a criação dos materiais estratégicos para a divulgação dos projetos.</p>\n<p>Trabalhamos de forma integrada em cinco frentes — <strong>Renderização 3D, Marketing, Produções Audiovisuais, Branding Imobiliário e Projeto de Interiores</strong> — sempre com foco em aumentar a percepção de valor do empreendimento e dar eficiência ao processo de vendas.</p>\n<p>Entrei em contato porque vi que você atua como Analista de Marketing na {Empresa}, uma área que conversa diretamente com o que fazemos hoje.</p>\n<p>Imagino que vocês já possuam parceiros ou estrutura interna. Ainda assim, achei válido me apresentar e compartilhar alguns cases do nosso portfólio, para que, caso surja alguma demanda futura, você já conheça nosso trabalho.</p>\n<p><strong>Faz sentido para você receber nosso material?</strong></p>\n</details>\n\n<details>\n<summary><strong>\U0001F7E2 Abordagem fria - Setor de Arquitetura (Render)</strong></summary>\n<p>Olá, ! Tudo bem?<br>Agradeço pela conexão, é um prazer em tê-la na minha rede de contatos do LinkedIn.</p>\n<p>Me chamo Gustavo Bientinezi, sou gestor comercial na TBO. Somos um hub de soluções para lançamentos imobiliários, com forte atuação em Renderização 3D.</p>\n<p>Gostaria de verificar se você pode me auxiliar numa questão. Sabe me dizer qual é a pessoa correta que eu devo falar na {Empresa} responsável pela análise e contratação de novos fornecedores de Render 3D?</p>\n</details>\n\n<details>\n<summary><strong>\U0001F7E2 Abordagem fria - Arquiteta de Personalização (Gamificação)</strong></summary>\n<p>Olá, {Nome}! Bom dia, tudo bem?<br>Obrigado pela conexão.</p>\n<p>Me chamo Gustavo Bientinezi, sou gestor comercial na TBO. Atuamos como um hub de soluções para lançamentos imobiliários e, nos últimos anos, desenvolvemos a nossa <strong>Plataforma Interativa de Personalização</strong> voltada ao processo de escolha e validação de acabamentos e layout.</p>\n<p>A plataforma permite que o cliente visualize, compare e personalize ambientes em tempo real, facilitando decisões, reduzindo retrabalhos e trazendo mais clareza para o processo de personalização.</p>\n<p>Entrei em contato porque vi que você atua com personalização na {Empresa}, uma etapa em que a experiência do cliente e a eficiência do processo fazem toda a diferença.</p>\n<p>Imagino que vocês já tenham métodos e ferramentas consolidadas. Ainda assim, achei válido me apresentar e compartilhar alguns exemplos de como a plataforma tem sido utilizada.</p>\n<p><strong>Faz sentido para você conhecer nosso material de apresentação?</strong></p>\n</details>\n\n<details>\n<summary><strong>\U0001F7E2 Abordagem fria - Setor Comercial</strong></summary>\n<p>Olá, ! Bom dia, tudo bem?<br>Agradeço pela conexão, é um prazer em tê-la na minha rede de contatos do LinkedIn.</p>\n<p>Me chamo Gustavo Bientinezi, sou gestor comercial na TBO. Atuamos como um hub de soluções para lançamentos imobiliários, apoiando incorporadoras na estruturação completa do lançamento — da estratégia, execução e criação de materiais.</p>\n<p>Hoje integramos cinco frentes que atuam diretamente no sucesso do lançamento: <strong>Renderização 3D, Marketing, Produções Audiovisuais, Branding Imobiliário e Projeto de Interiores</strong>. Tudo pensado para aumentar a percepção de valor do produto e dar eficiência ao processo de vendas.</p>\n<p>Entrei em contato porque vi que você atua na área comercial da {Empresa}, um setor que sente na prática os impactos de uma comunicação bem estruturada e na qualificação dos leads.</p>\n<p>Imagino que vocês já contem com parceiros ou estrutura interna. Ainda assim, achei válido me apresentar e compartilhar alguns cases onde essa integração de serviços ajudou a acelerar vendas.</p>\n<p><strong>Faz sentido para você conhecer esse material? Se sim, qual o melhor contato para seguirmos?</strong></p>\n</details>\n\n<hr>\n\n<h2>WhatsApp</h2>\n\n<details>\n<summary><strong>\U0001F7E2 Lead Frio (WhatsApp)</strong></summary>\n<p>Olá, {Nome}<br>bom dia!</p>\n<p>Uma dúvida, esse contato é do comercial da {Nome da Incorporadora}?</p>\n<p>Encontrei seu contato através do Órulo, entretanto eu gostaria de falar com o setor de marketing ou projetos da {Empresa}, sabe me informar qual é o contato correto?</p>\n<p>Me chamo Gustavo Bientinezi, sou gestor comercial da TBO - Ecossistema de Soluções para Lançamentos Imobiliários.</p>\n<p>Contamos com um time de especialistas que desenvolvem, em um só ecossistema, 5 frentes essenciais para o sucesso de um lançamento: <strong>Marketing &amp; Inteligência, Branding, Renderização 3D, Produções Audiovisuais e Projeto de Interiores</strong>.</p>\n<p>A pauta de marketing/branding ou contratação de Renderização 3D da incorporadora é através desse contato? Caso não seja, poderia me orientar por gentileza qual seria o contato correto?</p>\n</details>\n\n<details>\n<summary><strong>\U0001F7E2 Envio de Case (Imagem 3D)</strong></summary>\n<p>Olá, {Nome}! Boa tarde, tudo bem?</p>\n<p>Gostaria de compartilhar duas entregas recentes para que você possa ter uma percepção mais ampla da qualidade e da abordagem que aplicamos em nossos projetos.</p>\n<p><strong>Teaser de Lançamento</strong> (vídeo conceitual do empreendimento):<br>Nesta etapa, optamos por uma composição que reúne banco de imagens, takes de drone e algumas imagens em 3D. As animações em 3D ficarão concentradas na próxima entrega, com uma proposta mais robusta e completa.</p>\n<p>E as nossas imagens 3D:</p>\n</details>\n\n<hr>\n\n<h2>Follow-ups</h2>\n\n<details>\n<summary><strong>\U0001F7E2 Follow Up (Sem retorno)</strong></summary>\n<p>Olá {Nome},</p>\n<p>Espero que esteja tudo bem por aí.</p>\n<p>Só estou passando para confirmar se você teve a oportunidade de ver minha mensagem anterior. Fico à disposição para agendarmos uma conversa rápida e entender melhor como podemos colaborar nos projetos da {Incorporadora}.</p>\n<p>Se preferir, podemos ajustar para um outro momento que seja mais conveniente para você.</p>\n<p>Fico no aguardo e à disposição!</p>\n<p>Um abraço,<br>Gustavo</p>\n</details>\n\n<details>\n<summary><strong>\U0001F7E2 Envio da Proposta</strong></summary>\n<p>Olá {Nome},<br>Tudo bem?</p>\n<p>Conforme nossa conversa, estou enviando em anexo a proposta detalhada para a {Incorporadora}. Nela, você encontrará todas as informações sobre os serviços que discutimos, bem como a nossa abordagem integrada para otimizar os lançamentos imobiliários.</p>\n<p>Fico à disposição para esclarecer qualquer dúvida ou ajustar algum ponto que julgar necessário.</p>\n<p>Aguardo seu retorno!</p>\n<p>Um abraço,<br>Gustavo</p>\n</details>\n\n<details>\n<summary><strong>\U0001F7E2 Acompanhamento de Proposta (Status)</strong></summary>\n<p>Estou entrando em contato para acompanhar a evolução da proposta comercial que enviamos. Você saberia me informar se houve algum avanço no processo?</p>\n<p>Mesmo que não tenhamos sido a escolha final, o feedback de vocês é extremamente valioso para nós e ajuda a aprimorarmos constantemente nosso trabalho.</p>\n</details>\n\n<hr>\n\n<h2>Telefone</h2>\n\n<details>\n<summary><strong>\U0001F7E2 Telefone - Recepcionista</strong></summary>\n<p><strong>Gustavo:</strong><br>Oi, tudo bem? Aqui é o Gustavo, da Agência TBO — a gente trabalha exclusivamente com lançamentos imobiliários.</p>\n<p>Estou entrando em contato porque o <strong>perfil dos empreendimentos da {Empresa}</strong> tem total sinergia com os projetos que a gente costuma potencializar.</p>\n<p>Você pode me ajudar, por gentileza? Gostaria de falar com a pessoa responsável pelo marketing ou pela área de produto/lançamento.</p>\n<hr>\n<p><strong>Dicas para aumentar a chance de passar:</strong></p>\n<ol>\n<li><strong>Evite dizer \"gostaria de apresentar um serviço\"</strong> logo de cara — isso costuma ativar o bloqueio imediato.</li>\n<li><strong>Use termos do universo deles</strong> (\"produto\", \"posicionamento\", \"lançamento\") — isso gera familiaridade.</li>\n<li><strong>Peça ajuda com educação:</strong> frases como \"Você consegue me direcionar?\" costumam funcionar bem.</li>\n<li><strong>Se perguntarem do que se trata:</strong> \"É uma conversa bem breve — acreditamos que temos uma proposta que pode facilitar a gestão dos lançamentos, com soluções integradas que outras incorporadoras já estão utilizando com bons resultados.\"</li>\n</ol>\n</details>\n\n<details>\n<summary><strong>\U0001F7E2 Telefone - Tomador de Decisão</strong></summary>\n<p><strong>Gustavo:</strong><br>Olá, tudo certo? Aqui é o Gustavo, da Agência TBO. Obrigado por me atender!</p>\n<p>Eu estou entrando em contato porque a {Empresa} tem um perfil de empreendimentos que conversa muito com o tipo de trabalho que desenvolvemos — somos especialistas em lançamentos imobiliários e atuamos como um <strong>hub de soluções</strong>, com foco em <strong>branding, renderização 3D, audiovisual, marketing e projetos de interiores</strong>.</p>\n<p>A nossa proposta é facilitar a gestão dos lançamentos, centralizando entregas que geralmente ficam pulverizadas em vários fornecedores — e isso com um nível de qualidade que tem se destacado no mercado.</p>\n<p>Queria entender um pouco como vocês têm estruturado essa parte hoje. <strong>Faz sentido conversarmos sobre isso?</strong></p>\n<hr>\n<p><strong>Objetivo:</strong></p>\n<ul>\n<li>Chamar atenção com a proposta de valor (hub + foco em lançamentos)</li>\n<li>Gerar identificação com o perfil dos empreendimentos</li>\n<li>Mostrar diferencial (centralização + qualidade)</li>\n<li>Abrir o diálogo com uma pergunta consultiva</li>\n</ul>\n</details>'),
    v_user_id,
    v_user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM pages
    WHERE tenant_id = v_tenant_id
      AND space_id = 'ws-comercial'
      AND title = 'Biblioteca de Abordagens'
      AND is_deleted = FALSE
  );

  IF FOUND THEN
    RAISE NOTICE 'Pagina "Biblioteca de Abordagens" criada com sucesso.';
  ELSE
    RAISE NOTICE 'Pagina "Biblioteca de Abordagens" ja existe — pulando.';
  END IF;
END
$$;
