-- ============================================================================
-- TBO OS — Migration 032: Biblioteca de Abordagens — Grid layout
--
-- Atualiza o conteudo da pagina "Biblioteca de Abordagens" para usar
-- layout em grid com secoes categorizadas, badges e cards lado a lado.
-- ============================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_page_id   UUID;
  v_html      TEXT;
BEGIN
  -- Buscar o tenant
  SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'Nenhum tenant encontrado — pulando.';
    RETURN;
  END IF;

  -- Buscar a pagina existente
  SELECT id INTO v_page_id
  FROM public.pages
  WHERE tenant_id = v_tenant_id
    AND space_id = 'ws-comercial'
    AND title = 'Biblioteca de Abordagens'
    AND is_deleted = FALSE
  LIMIT 1;

  IF v_page_id IS NULL THEN
    RAISE NOTICE 'Pagina "Biblioteca de Abordagens" nao encontrada — pulando.';
    RETURN;
  END IF;

  -- Montar HTML com grid layout
  v_html := '<!-- pe-layout:grid -->'

  -- ════ SEÇÃO: LinkedIn ════
  || '<div class="pe-grid-section">'
  || '<div class="pe-grid-section-header">'
  || '<h2>LinkedIn</h2>'
  || '<span class="pe-section-badge pe-section-badge--linkedin">LinkedIn</span>'
  || '</div>'
  || '<div class="pe-grid-cards">'

  -- Card 1: Abordagem fria - LinkedIn
  || '<details>'
  || '<summary><strong>🟢 Abordagem fria - LinkedIn</strong></summary>'
  || '<p>Olá, ! Bom dia, tudo bem?<br>Agradeço pela conexão, é um prazer em tê-la na minha rede de contatos do LinkedIn.</p>'
  || '<p>Me chamo Gustavo Bientinezi, sou gestor comercial na TBO. Somos um hub de soluções para lançamentos imobiliários, com forte atuação em Renderização.</p>'
  || '<p>Gostaria de verificar se você pode me auxiliar numa questão por gentileza. Sabe me dizer qual é a pessoa correta que eu devo falar na {Empresa} responsável pela análise e contratação de novos fornecedores de Render 3D?</p>'
  || '</details>'

  -- Card 2: Setor de Marketing
  || '<details>'
  || '<summary><strong>🟢 Setor de Marketing</strong></summary>'
  || '<p>Olá, {Nome}! Bom dia, tudo bem?<br>Obrigado pela conexão.</p>'
  || '<p>Me chamo Gustavo Bientinezi e sou gestor comercial na TBO. Atuamos como um hub de soluções para lançamentos imobiliários, apoiando incorporadoras desde a concepção e execução das campanhas de lançamento até a criação dos materiais estratégicos para a divulgação dos projetos.</p>'
  || '<p>Trabalhamos de forma integrada em cinco frentes — <strong>Renderização 3D, Marketing, Produções Audiovisuais, Branding Imobiliário e Projeto de Interiores</strong> — sempre com foco em aumentar a percepção de valor do empreendimento e dar eficiência ao processo de vendas.</p>'
  || '<p>Entrei em contato porque vi que você atua como Analista de Marketing na {Empresa}, uma área que conversa diretamente com o que fazemos hoje.</p>'
  || '<p>Imagino que vocês já possuam parceiros ou estrutura interna. Ainda assim, achei válido me apresentar e compartilhar alguns cases do nosso portfólio, para que, caso surja alguma demanda futura, você já conheça nosso trabalho.</p>'
  || '<p><strong>Faz sentido para você receber nosso material?</strong></p>'
  || '</details>'

  -- Card 3: Setor de Arquitetura
  || '<details>'
  || '<summary><strong>🟢 Setor de Arquitetura (Render)</strong></summary>'
  || '<p>Olá, ! Tudo bem?<br>Agradeço pela conexão, é um prazer em tê-la na minha rede de contatos do LinkedIn.</p>'
  || '<p>Me chamo Gustavo Bientinezi, sou gestor comercial na TBO. Somos um hub de soluções para lançamentos imobiliários, com forte atuação em Renderização 3D.</p>'
  || '<p>Gostaria de verificar se você pode me auxiliar numa questão. Sabe me dizer qual é a pessoa correta que eu devo falar na {Empresa} responsável pela análise e contratação de novos fornecedores de Render 3D?</p>'
  || '</details>'

  -- Card 4: Arquiteta de Personalização
  || '<details>'
  || '<summary><strong>🟢 Personalização (Gamificação)</strong></summary>'
  || '<p>Olá, {Nome}! Bom dia, tudo bem?<br>Obrigado pela conexão.</p>'
  || '<p>Me chamo Gustavo Bientinezi, sou gestor comercial na TBO. Atuamos como um hub de soluções para lançamentos imobiliários e, nos últimos anos, desenvolvemos a nossa <strong>Plataforma Interativa de Personalização</strong> voltada ao processo de escolha e validação de acabamentos e layout.</p>'
  || '<p>A plataforma permite que o cliente visualize, compare e personalize ambientes em tempo real, facilitando decisões, reduzindo retrabalhos e trazendo mais clareza para o processo de personalização.</p>'
  || '<p>Entrei em contato porque vi que você atua com personalização na {Empresa}, uma etapa em que a experiência do cliente e a eficiência do processo fazem toda a diferença.</p>'
  || '<p>Imagino que vocês já tenham métodos e ferramentas consolidadas. Ainda assim, achei válido me apresentar e compartilhar alguns exemplos de como a plataforma tem sido utilizada.</p>'
  || '<p><strong>Faz sentido para você conhecer nosso material de apresentação?</strong></p>'
  || '</details>'

  -- Card 5: Setor Comercial
  || '<details>'
  || '<summary><strong>🟢 Setor Comercial</strong></summary>'
  || '<p>Olá, ! Bom dia, tudo bem?<br>Agradeço pela conexão, é um prazer em tê-la na minha rede de contatos do LinkedIn.</p>'
  || '<p>Me chamo Gustavo Bientinezi, sou gestor comercial na TBO. Atuamos como um hub de soluções para lançamentos imobiliários, apoiando incorporadoras na estruturação completa do lançamento — da estratégia, execução e criação de materiais.</p>'
  || '<p>Hoje integramos cinco frentes que atuam diretamente no sucesso do lançamento: <strong>Renderização 3D, Marketing, Produções Audiovisuais, Branding Imobiliário e Projeto de Interiores</strong>. Tudo pensado para aumentar a percepção de valor do produto e dar eficiência ao processo de vendas.</p>'
  || '<p>Entrei em contato porque vi que você atua na área comercial da {Empresa}, um setor que sente na prática os impactos de uma comunicação bem estruturada e na qualificação dos leads.</p>'
  || '<p>Imagino que vocês já contem com parceiros ou estrutura interna. Ainda assim, achei válido me apresentar e compartilhar alguns cases onde essa integração de serviços ajudou a acelerar vendas.</p>'
  || '<p><strong>Faz sentido para você conhecer esse material? Se sim, qual o melhor contato para seguirmos?</strong></p>'
  || '</details>'

  || '</div>' -- fecha pe-grid-cards
  || '</div>' -- fecha pe-grid-section

  -- ════ SEÇÃO: WhatsApp ════
  || '<div class="pe-grid-section">'
  || '<div class="pe-grid-section-header">'
  || '<h2>WhatsApp</h2>'
  || '<span class="pe-section-badge pe-section-badge--whatsapp">WhatsApp</span>'
  || '</div>'
  || '<div class="pe-grid-cards">'

  -- Card 6: Lead Frio (WhatsApp)
  || '<details>'
  || '<summary><strong>🟢 Lead Frio</strong></summary>'
  || '<p>Olá, {Nome}<br>bom dia!</p>'
  || '<p>Uma dúvida, esse contato é do comercial da {Nome da Incorporadora}?</p>'
  || '<p>Encontrei seu contato através do Órulo, entretanto eu gostaria de falar com o setor de marketing ou projetos da {Empresa}, sabe me informar qual é o contato correto?</p>'
  || '<p>Me chamo Gustavo Bientinezi, sou gestor comercial da TBO - Ecossistema de Soluções para Lançamentos Imobiliários.</p>'
  || '<p>Contamos com um time de especialistas que desenvolvem, em um só ecossistema, 5 frentes essenciais para o sucesso de um lançamento: <strong>Marketing &amp; Inteligência, Branding, Renderização 3D, Produções Audiovisuais e Projeto de Interiores</strong>.</p>'
  || '<p>A pauta de marketing/branding ou contratação de Renderização 3D da incorporadora é através desse contato? Caso não seja, poderia me orientar por gentileza qual seria o contato correto?</p>'
  || '</details>'

  -- Card 7: Envio de Case
  || '<details>'
  || '<summary><strong>🟢 Envio de Case (Imagem 3D)</strong></summary>'
  || '<p>Olá, {Nome}! Boa tarde, tudo bem?</p>'
  || '<p>Gostaria de compartilhar duas entregas recentes para que você possa ter uma percepção mais ampla da qualidade e da abordagem que aplicamos em nossos projetos.</p>'
  || '<p><strong>Teaser de Lançamento</strong> (vídeo conceitual do empreendimento):<br>Nesta etapa, optamos por uma composição que reúne banco de imagens, takes de drone e algumas imagens em 3D. As animações em 3D ficarão concentradas na próxima entrega, com uma proposta mais robusta e completa.</p>'
  || '<p>E as nossas imagens 3D:</p>'
  || '</details>'

  || '</div>' -- fecha pe-grid-cards
  || '</div>' -- fecha pe-grid-section

  -- ════ SEÇÃO: Follow-ups ════
  || '<div class="pe-grid-section">'
  || '<div class="pe-grid-section-header">'
  || '<h2>Follow-ups</h2>'
  || '<span class="pe-section-badge pe-section-badge--followup">Follow-up</span>'
  || '</div>'
  || '<div class="pe-grid-cards">'

  -- Card 8: Follow Up (Sem retorno)
  || '<details>'
  || '<summary><strong>🟢 Follow Up (Sem retorno)</strong></summary>'
  || '<p>Olá {Nome},</p>'
  || '<p>Espero que esteja tudo bem por aí.</p>'
  || '<p>Só estou passando para confirmar se você teve a oportunidade de ver minha mensagem anterior. Fico à disposição para agendarmos uma conversa rápida e entender melhor como podemos colaborar nos projetos da {Incorporadora}.</p>'
  || '<p>Se preferir, podemos ajustar para um outro momento que seja mais conveniente para você.</p>'
  || '<p>Fico no aguardo e à disposição!</p>'
  || '<p>Um abraço,<br>Gustavo</p>'
  || '</details>'

  -- Card 9: Envio da Proposta
  || '<details>'
  || '<summary><strong>🟢 Envio da Proposta</strong></summary>'
  || '<p>Olá {Nome},<br>Tudo bem?</p>'
  || '<p>Conforme nossa conversa, estou enviando em anexo a proposta detalhada para a {Incorporadora}. Nela, você encontrará todas as informações sobre os serviços que discutimos, bem como a nossa abordagem integrada para otimizar os lançamentos imobiliários.</p>'
  || '<p>Fico à disposição para esclarecer qualquer dúvida ou ajustar algum ponto que julgar necessário.</p>'
  || '<p>Aguardo seu retorno!</p>'
  || '<p>Um abraço,<br>Gustavo</p>'
  || '</details>'

  -- Card 10: Acompanhamento de Proposta
  || '<details>'
  || '<summary><strong>🟢 Acompanhamento de Proposta</strong></summary>'
  || '<p>Estou entrando em contato para acompanhar a evolução da proposta comercial que enviamos. Você saberia me informar se houve algum avanço no processo?</p>'
  || '<p>Mesmo que não tenhamos sido a escolha final, o feedback de vocês é extremamente valioso para nós e ajuda a aprimorarmos constantemente nosso trabalho.</p>'
  || '</details>'

  || '</div>' -- fecha pe-grid-cards
  || '</div>' -- fecha pe-grid-section

  -- ════ SEÇÃO: Telefone ════
  || '<div class="pe-grid-section">'
  || '<div class="pe-grid-section-header">'
  || '<h2>Telefone</h2>'
  || '<span class="pe-section-badge pe-section-badge--phone">Telefone</span>'
  || '</div>'
  || '<div class="pe-grid-cards">'

  -- Card 11: Telefone - Recepcionista
  || '<details>'
  || '<summary><strong>🟢 Recepcionista</strong></summary>'
  || '<p><strong>Gustavo:</strong><br>Oi, tudo bem? Aqui é o Gustavo, da Agência TBO — a gente trabalha exclusivamente com lançamentos imobiliários.</p>'
  || '<p>Estou entrando em contato porque o <strong>perfil dos empreendimentos da {Empresa}</strong> tem total sinergia com os projetos que a gente costuma potencializar.</p>'
  || '<p>Você pode me ajudar, por gentileza? Gostaria de falar com a pessoa responsável pelo marketing ou pela área de produto/lançamento.</p>'
  || '<hr>'
  || '<p><strong>Dicas para aumentar a chance de passar:</strong></p>'
  || '<ol>'
  || '<li><strong>Evite dizer "gostaria de apresentar um serviço"</strong> logo de cara — isso costuma ativar o bloqueio imediato.</li>'
  || '<li><strong>Use termos do universo deles</strong> ("produto", "posicionamento", "lançamento") — isso gera familiaridade.</li>'
  || '<li><strong>Peça ajuda com educação:</strong> frases como "Você consegue me direcionar?" costumam funcionar bem.</li>'
  || '<li><strong>Se perguntarem do que se trata:</strong> "É uma conversa bem breve — acreditamos que temos uma proposta que pode facilitar a gestão dos lançamentos, com soluções integradas que outras incorporadoras já estão utilizando com bons resultados."</li>'
  || '</ol>'
  || '</details>'

  -- Card 12: Telefone - Tomador de Decisão
  || '<details>'
  || '<summary><strong>🟢 Tomador de Decisão</strong></summary>'
  || '<p><strong>Gustavo:</strong><br>Olá, tudo certo? Aqui é o Gustavo, da Agência TBO. Obrigado por me atender!</p>'
  || '<p>Eu estou entrando em contato porque a {Empresa} tem um perfil de empreendimentos que conversa muito com o tipo de trabalho que desenvolvemos — somos especialistas em lançamentos imobiliários e atuamos como um <strong>hub de soluções</strong>, com foco em <strong>branding, renderização 3D, audiovisual, marketing e projetos de interiores</strong>.</p>'
  || '<p>A nossa proposta é facilitar a gestão dos lançamentos, centralizando entregas que geralmente ficam pulverizadas em vários fornecedores — e isso com um nível de qualidade que tem se destacado no mercado.</p>'
  || '<p>Queria entender um pouco como vocês têm estruturado essa parte hoje. <strong>Faz sentido conversarmos sobre isso?</strong></p>'
  || '<hr>'
  || '<p><strong>Objetivo:</strong></p>'
  || '<ul>'
  || '<li>Chamar atenção com a proposta de valor (hub + foco em lançamentos)</li>'
  || '<li>Gerar identificação com o perfil dos empreendimentos</li>'
  || '<li>Mostrar diferencial (centralização + qualidade)</li>'
  || '<li>Abrir o diálogo com uma pergunta consultiva</li>'
  || '</ul>'
  || '</details>'

  || '</div>' -- fecha pe-grid-cards
  || '</div>'; -- fecha pe-grid-section

  -- Atualizar a pagina com o novo HTML
  UPDATE public.pages
  SET content = jsonb_build_object('html', v_html),
      updated_at = NOW()
  WHERE id = v_page_id;

  RAISE NOTICE 'Pagina "Biblioteca de Abordagens" atualizada com grid layout.';
END
$$;
