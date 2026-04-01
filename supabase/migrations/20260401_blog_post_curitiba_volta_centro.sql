-- ============================================================
-- TBO OS — Publicar artigo: Curitiba de Volta ao Centro
-- ============================================================

INSERT INTO public.blog_posts (
  tenant_id,
  title,
  slug,
  excerpt,
  body,
  cover_url,
  status,
  author_id,
  published_at,
  tags
) VALUES (
  '89080d1a-bc79-4c3f-8fce-20aabc561c0d',
  'Curitiba de Volta ao Centro: o que o mercado imobiliário precisa entender agora',
  'curitiba-de-volta-ao-centro-o-que-o-mercado-imobiliario-precisa-entender-agora',
  'Com os decretos regulamentadores publicados e o edital PARS em consulta pública, o programa Curitiba de Volta ao Centro saiu do plano e entrou na fase operacional. Para o mercado imobiliário, esse é o momento de leitura técnica — não de espera.',
  E'<h2>Contexto</h2>
<p>O Programa Curitiba de Volta ao Centro tem como objetivo central devolver o coração da cidade aos curitibanos, por meio de estratégias de transformação da região central com foco em requalificação urbanística e ambiental — integrando moradia, trabalho, segurança, cultura e lazer.</p>
<p>Com liderança direta do Prefeito Eduardo Pimentel, o programa será implementado até 2050 e estabeleceu, de forma participativa, 15 objetivos para guiar projetos e ações entre poder público, setor produtivo e sociedade civil.</p>
<p>Agora, com os decretos regulamentadores publicados e o edital de subvenção econômica (PARS) em consulta pública, o programa saiu do plano e entrou na fase operacional. Para o mercado imobiliário curitibano, esse é o momento de leitura técnica — não de espera.</p>

<h2>O que foi regulamentado</h2>
<p>A publicação dos decretos estrutura os instrumentos de incentivo e dá segurança jurídica para operações de retrofit, reocupação e requalificação na região central. O edital de subvenção da PARS — atualmente em consulta pública entre 31/03 e 17/04/2026 — credencia propostas de intervenção que integrem moradia, trabalho, cultura e lazer. O mercado ainda tem janela para contribuir com o aprimoramento do edital.</p>

<h2>A lógica territorial do programa</h2>
<p>O programa definiu setores e eixos prioritários de intervenção com base em diagnóstico de produção imobiliária, estado de conservação dos imóveis, dinâmica demográfica, dados econômicos e de segurança pública. A estrutura territorial é a seguinte:</p>
<p><strong>Setor Histórico de Baixa Emissão (SHBE):</strong> abrange a zona histórica e o bairro São Francisco — áreas que concentram os principais ativos culturais e patrimoniais da região central. O conjunto de incentivos está direcionado a estimular moradia diversificada e reativar o território como polo gastronômico, hoteleiro, educacional e cultural.</p>
<p><strong>Setor de Baixa Emissão (SBE):</strong> compreende áreas estratégicas com amplas oportunidades para requalificação e novos investimentos, com incentivos que visam impulsionar a dinamização imobiliária com usos como moradia diversificada, hotelaria e atividades comerciais e empresariais.</p>
<p><strong>Setor Rodoferroviária (SRF):</strong> território com grande potencial de transformação urbana, que será estruturado por meio de um Plano Integrado de Desenvolvimento Urbano voltado a uso misto e moradia diversificada.</p>
<p><strong>Eixos Prioritários:</strong> foram definidos quatro eixos que concentram a maior parte dos imóveis históricos em estado de desocupação e degradação — Eixo XV de Novembro, Eixo Barão–Riachuelo, Eixo Teatro Guaíra–São Francisco–Jaime Reis e Eixo Saldanha Marinha.</p>

<h2>O que isso significa para o branding imobiliário</h2>
<p>Do ponto de vista estratégico, programas como o Volta ao Centro criam uma condição rara: o poder público financia parte da narrativa do produto. Segurança reforçada, infraestrutura sendo modernizada, valorização cultural em curso — tudo isso compõe o contexto que uma incorporadora normalmente precisaria construir sozinha no posicionamento do empreendimento.</p>
<p>Empreendimentos lançados nos eixos prioritários têm uma vantagem de comunicação que poucos mercados oferecem: a cidade está contando a mesma história que o produto precisa contar. O desafio — e o diferencial competitivo — está em quem souber fazer essa tradução de forma crível, com narrativa coerente e identidade visual alinhada ao perfil do comprador que o território começa a atrair.</p>
<p>Retrofit de edifícios históricos, em especial, exige uma camada de branding que o novo não precisa: há uma história real a ser preservada e recontada. Nome, identidade, materialidade, campanha — tudo precisa honrar o que aquele endereço já significa, enquanto propõe o que ele vai se tornar.</p>

<h2>Próximos passos para incorporadoras</h2>
<ul>
<li>Participar da consulta pública do edital PARS até 17/04/2026 — há espaço real para contribuições técnicas que moldam as regras do jogo</li>
<li>Mapear os eixos prioritários e cruzar com estoque de terrenos e imóveis disponíveis</li>
<li>Iniciar a construção de narrativa antes do produto estar fechado — o contexto urbano já está disponível como argumento</li>
<li>Acompanhar os GTs da Ademi-PR, que estão consolidando contribuições técnicas sobre os decretos e o edital</li>
</ul>

<h2>Referências</h2>
<ul>
<li>Site oficial do Programa Curitiba de Volta ao Centro</li>
<li>Consulta Pública nº 01/2026 — Edital de Subvenção Econômica (PARS)</li>
</ul>

<hr />
<p><em>TBO é um ecossistema de lançamentos imobiliário. Ajudamos incorporadoras a traduzir teses de produto em identidade, comunicação e imagem.</em></p>
<p><em>wearetbo.com.br</em></p>',
  NULL,
  'publicado',
  NULL,
  '2026-04-01T12:00:00Z',
  ARRAY['branding imobiliario', 'curitiba', 'retrofit', 'mercado imobiliario', 'urbanismo', 'volta ao centro']
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  tags = EXCLUDED.tags;
