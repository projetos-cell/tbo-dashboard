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
    'Gestão de Assets e Biblioteca 3D',
    'tbo-3d-014-gestao-de-assets-e-biblioteca-3d',
    'digital-3d',
    'checklist',
    'Gestão de Assets e Biblioteca 3D',
    'Standard Operating Procedure

Gestão de Assets e Biblioteca 3D

Código

TBO-3D-014

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

Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.

  2. Escopo

2.1 O que está coberto

Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.

2.2 Exclusões

Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Curar, organizar e manter a biblioteca 3D; aprovar novos assets

Responsável

—

Diretor Criativo (Marco Andolfato)

Definir padrões de qualidade e estilo dos assets da biblioteca

Aprovador

—

Visualizador 3D Júnior

Contribuir com novos assets e seguir processos de admissão

Consultado

—

Gerente de Projetos

Garantir orçamento para aquisição de assets e licenças

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.

4.2 Ferramentas e Acessos

Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).



  5. Procedimento Passo a Passo

5.1. Estrutura e organização da biblioteca

Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.

Responsável: Visualizador 3D Sênior

Output: Estrutura de biblioteca documentada e mantida

Prazo referência: Manutenção contínua; revisão trimestral completa

5.2. Processo de admissão de novos assets

Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.

Responsável: Visualizador 3D Sênior

Output: Asset admitido, testado, nomeado e registrado no inventário

Prazo referência: 30–60 min por asset

[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.

5.3. Nomenclatura e tagging de assets

Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.

Responsável: Visualizador 3D Sênior

Output: Assets nomeados e com tags atualizadas

Prazo referência: 15 min por asset

5.4. Controle de licenças e conformidade

Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.

Responsável: Visualizador 3D Sênior

Output: Planilha de inventário de licenças atualizada

Prazo referência: Atualização contínua; revisão semestral em 1 dia útil

5.5. Manutenção, limpeza e expansão periódica

Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.

Responsável: Visualizador 3D Sênior

Output: Biblioteca limpa, atualizada e com plano de expansão

Prazo referência: 1 dia útil por ciclo trimestral

5.6. Onboarding e acesso do time

Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.

Responsável: Visualizador 3D Sênior

Output: Novo membro onboarded na biblioteca; acesso configurado

Prazo referência: 2 h por novo membro

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.

6.2 Erros Comuns a Evitar

Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).

  7. Ferramentas e Templates

Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).

  8. SLAs e Prazos

Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.

  9. Fluxograma

Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim

  10. Glossário

Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Assets e Biblioteca 3D</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-014</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.</p><p><strong>2.2 Exclusões</strong></p><p>Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Curar, organizar e manter a biblioteca 3D; aprovar novos assets</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Definir padrões de qualidade e estilo dos assets da biblioteca</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Contribuir com novos assets e seguir processos de admissão</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Garantir orçamento para aquisição de assets e licenças</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Estrutura e organização da biblioteca</strong></p><p>Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Estrutura de biblioteca documentada e mantida</p><p>Prazo referência: Manutenção contínua; revisão trimestral completa</p><p><strong>5.2. Processo de admissão de novos assets</strong></p><p>Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Asset admitido, testado, nomeado e registrado no inventário</p><p>Prazo referência: 30–60 min por asset</p><p><strong>[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.</strong></p><p><strong>5.3. Nomenclatura e tagging de assets</strong></p><p>Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Assets nomeados e com tags atualizadas</p><p>Prazo referência: 15 min por asset</p><p><strong>5.4. Controle de licenças e conformidade</strong></p><p>Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Planilha de inventário de licenças atualizada</p><p>Prazo referência: Atualização contínua; revisão semestral em 1 dia útil</p><p><strong>5.5. Manutenção, limpeza e expansão periódica</strong></p><p>Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Biblioteca limpa, atualizada e com plano de expansão</p><p>Prazo referência: 1 dia útil por ciclo trimestral</p><p><strong>5.6. Onboarding e acesso do time</strong></p><p>Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Novo membro onboarded na biblioteca; acesso configurado</p><p>Prazo referência: 2 h por novo membro</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.</p><p><strong>  9. Fluxograma</strong></p><p>Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim</p><p><strong>  10. Glossário</strong></p><p>Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','aprovacao']::TEXT[],
    13,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-014
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.', '<p>Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.', '<p>Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).', '<p>Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Curar, organizar e manter a biblioteca 3D; aprovar novos assets

Responsável

—

Diretor Criativo (Marco Andolfato)

Definir padrões de qualidade e estilo dos assets da biblioteca

Aprovador

—

Visualizador 3D Júnior

Contribuir com novos assets e seguir processos de admissão

Consultado

—

Gerente de Projetos

Garantir orçamento para aquisição de assets e licenças

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Curar, organizar e manter a biblioteca 3D; aprovar novos assets</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Definir padrões de qualidade e estilo dos assets da biblioteca</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Contribuir com novos assets e seguir processos de admissão</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Garantir orçamento para aquisição de assets e licenças</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.', '<p>Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).', '<p>Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Estrutura e organização da biblioteca', 'Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.

Responsável: Visualizador 3D Sênior

Output: Estrutura de biblioteca documentada e mantida

Prazo referência: Manutenção contínua; revisão trimestral completa', '<p>Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Estrutura de biblioteca documentada e mantida</p><p>Prazo referência: Manutenção contínua; revisão trimestral completa</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Processo de admissão de novos assets', 'Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.

Responsável: Visualizador 3D Sênior

Output: Asset admitido, testado, nomeado e registrado no inventário

Prazo referência: 30–60 min por asset

[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.', '<p>Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Asset admitido, testado, nomeado e registrado no inventário</p><p>Prazo referência: 30–60 min por asset</p><p><strong>[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Nomenclatura e tagging de assets', 'Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.

Responsável: Visualizador 3D Sênior

Output: Assets nomeados e com tags atualizadas

Prazo referência: 15 min por asset', '<p>Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Assets nomeados e com tags atualizadas</p><p>Prazo referência: 15 min por asset</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Controle de licenças e conformidade', 'Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.

Responsável: Visualizador 3D Sênior

Output: Planilha de inventário de licenças atualizada

Prazo referência: Atualização contínua; revisão semestral em 1 dia útil', '<p>Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Planilha de inventário de licenças atualizada</p><p>Prazo referência: Atualização contínua; revisão semestral em 1 dia útil</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Manutenção, limpeza e expansão periódica', 'Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.

Responsável: Visualizador 3D Sênior

Output: Biblioteca limpa, atualizada e com plano de expansão

Prazo referência: 1 dia útil por ciclo trimestral', '<p>Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Biblioteca limpa, atualizada e com plano de expansão</p><p>Prazo referência: 1 dia útil por ciclo trimestral</p>', 10, 'tip');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Onboarding e acesso do time', 'Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.

Responsável: Visualizador 3D Sênior

Output: Novo membro onboarded na biblioteca; acesso configurado

Prazo referência: 2 h por novo membro', '<p>Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Novo membro onboarded na biblioteca; acesso configurado</p><p>Prazo referência: 2 h por novo membro</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.', '<p>[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).', '<p>Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).', '<p>Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.', '<p>Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim', '<p>Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.', '<p>Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-001: Naming ──
END $$;