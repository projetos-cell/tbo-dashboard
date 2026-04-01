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
    'Tour 360',
    'tbo-3d-008-tour-360',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Tour 360°

Código

TBO-3D-008

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Digital 3D

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.

  2. Escopo

2.1 O que está coberto

Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.

2.2 Exclusões

Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Renderizar panoramas 360° e configurar o tour virtual

Responsável

—

Pós-produtor

Tratar imagens equiretangulares e corrigir costuras

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar qualidade visual, navegação e fluxo do tour

Aprovador

—

Gerente de Projetos

Briefing de ambientes, entrega do link ao cliente e suporte ao acesso

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.

4.2 Ferramentas e Acessos

3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.



  5. Procedimento Passo a Passo

5.1. Planejamento do tour e mapeamento de ambientes

Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).

Responsável: Visualizador 3D Sênior

Output: Mapa de navegação do tour documentado

Prazo referência: 30 min

5.2. Configuração e render de panoramas 360°

Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.

Responsável: Visualizador 3D Sênior

Output: Panoramas EXR 360° de todos os ambientes renderizados

Prazo referência: 4–12 h (por quantidade de ambientes)

[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.

5.3. Pós-produção das imagens equiretangulares

Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.

Responsável: Pós-produtor

Output: Panoramas finalizados em JPEG 90%+ prontos para upload

Prazo referência: 1–2 h por ambiente

5.4. Montagem do tour na plataforma

Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.

Responsável: Visualizador 3D Sênior

Output: Tour virtual montado e funcionando na plataforma

Prazo referência: 2–3 h

5.5. QA, aprovação e publicação

Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.

Responsável: Visualizador 3D Sênior

Output: Tour virtual publicado, link final entregue ao cliente

Prazo referência: 1 h QA + ciclo revisão 24 h

[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.

6.2 Erros Comuns a Evitar

Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.

  7. Ferramentas e Templates

3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.

  8. SLAs e Prazos

Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.

  9. Fluxograma

Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim

  10. Glossário

Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Tour 360°</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-008</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.</p><p><strong>2.2 Exclusões</strong></p><p>Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Renderizar panoramas 360° e configurar o tour virtual</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Pós-produtor</p></td><td><p>Tratar imagens equiretangulares e corrigir costuras</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar qualidade visual, navegação e fluxo do tour</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Briefing de ambientes, entrega do link ao cliente e suporte ao acesso</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Planejamento do tour e mapeamento de ambientes</strong></p><p>Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Mapa de navegação do tour documentado</p><p>Prazo referência: 30 min</p><p><strong>5.2. Configuração e render de panoramas 360°</strong></p><p>Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Panoramas EXR 360° de todos os ambientes renderizados</p><p>Prazo referência: 4–12 h (por quantidade de ambientes)</p><p><strong>[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.</strong></p><p><strong>5.3. Pós-produção das imagens equiretangulares</strong></p><p>Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.</p><p>Responsável: Pós-produtor</p><p>Output: Panoramas finalizados em JPEG 90%+ prontos para upload</p><p>Prazo referência: 1–2 h por ambiente</p><p><strong>5.4. Montagem do tour na plataforma</strong></p><p>Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Tour virtual montado e funcionando na plataforma</p><p>Prazo referência: 2–3 h</p><p><strong>5.5. QA, aprovação e publicação</strong></p><p>Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Tour virtual publicado, link final entregue ao cliente</p><p>Prazo referência: 1 h QA + ciclo revisão 24 h</p><p><strong>[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim</p><p><strong>  10. Glossário</strong></p><p>Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    7,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-008
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.', '<p>Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.', '<p>Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).', '<p>Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Renderizar panoramas 360° e configurar o tour virtual

Responsável

—

Pós-produtor

Tratar imagens equiretangulares e corrigir costuras

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar qualidade visual, navegação e fluxo do tour

Aprovador

—

Gerente de Projetos

Briefing de ambientes, entrega do link ao cliente e suporte ao acesso

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Renderizar panoramas 360° e configurar o tour virtual</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Pós-produtor</p></td><td><p>Tratar imagens equiretangulares e corrigir costuras</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar qualidade visual, navegação e fluxo do tour</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Briefing de ambientes, entrega do link ao cliente e suporte ao acesso</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.', '<p>Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.', '<p>3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Planejamento do tour e mapeamento de ambientes', 'Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).

Responsável: Visualizador 3D Sênior

Output: Mapa de navegação do tour documentado

Prazo referência: 30 min', '<p>Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Mapa de navegação do tour documentado</p><p>Prazo referência: 30 min</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Configuração e render de panoramas 360°', 'Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.

Responsável: Visualizador 3D Sênior

Output: Panoramas EXR 360° de todos os ambientes renderizados

Prazo referência: 4–12 h (por quantidade de ambientes)

[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.', '<p>Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Panoramas EXR 360° de todos os ambientes renderizados</p><p>Prazo referência: 4–12 h (por quantidade de ambientes)</p><p><strong>[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Pós-produção das imagens equiretangulares', 'Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.

Responsável: Pós-produtor

Output: Panoramas finalizados em JPEG 90%+ prontos para upload

Prazo referência: 1–2 h por ambiente', '<p>Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.</p><p>Responsável: Pós-produtor</p><p>Output: Panoramas finalizados em JPEG 90%+ prontos para upload</p><p>Prazo referência: 1–2 h por ambiente</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Montagem do tour na plataforma', 'Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.

Responsável: Visualizador 3D Sênior

Output: Tour virtual montado e funcionando na plataforma

Prazo referência: 2–3 h', '<p>Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Tour virtual montado e funcionando na plataforma</p><p>Prazo referência: 2–3 h</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. QA, aprovação e publicação', 'Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.

Responsável: Visualizador 3D Sênior

Output: Tour virtual publicado, link final entregue ao cliente

Prazo referência: 1 h QA + ciclo revisão 24 h

[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.', '<p>Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Tour virtual publicado, link final entregue ao cliente</p><p>Prazo referência: 1 h QA + ciclo revisão 24 h</p><p><strong>[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.', '<p>[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.', '<p>Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.', '<p>3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.', '<p>Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim', '<p>Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.', '<p>Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-009: Animações 3D Pré produção ──
END $$;