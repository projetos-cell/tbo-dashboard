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
    'Entrega e Handoff ao Cliente',
    'tbo-3d-013-entrega-e-handoff-ao-cliente',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Entrega e Handoff ao Cliente

Código

TBO-3D-013

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

Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.

  2. Escopo

2.1 O que está coberto

Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.

2.2 Exclusões

Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Gerente de Projetos

Organizar entrega, comunicar cliente e coletar aceite formal

Responsável

—

Visualizador 3D Sênior

Organizar e nomear arquivos conforme padrão TBO

Responsável

—

Diretor Criativo (Marco Andolfato)

Confirmar que todos os itens do escopo foram entregues

Aprovador

—

Cliente / Incorporadora

Confirmar recebimento, revisar e emitir aceite formal

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).

4.2 Ferramentas e Acessos

Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.



  5. Procedimento Passo a Passo

5.1. Conferência final do escopo entregue

Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.

Responsável: Gerente de Projetos

Output: Checklist de escopo 100% concluído documentado

Prazo referência: 30 min

[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.

5.2. Organização e nomenclatura dos arquivos

Ação: Criar estrutura de pastas padrão: [PROJETO] > [DATA_ENTREGA] > [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.

Responsável: Visualizador 3D Sênior

Output: Pasta de entrega organizada e nomeada conforme padrão TBO

Prazo referência: 30–60 min

5.3. Upload e geração de link de entrega

Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.

Responsável: Gerente de Projetos

Output: Link de entrega funcional e verificado

Prazo referência: 30–60 min

5.4. Comunicação formal de entrega ao cliente

Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.

Responsável: Gerente de Projetos

Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS

Prazo referência: 1 h

5.5. Coleta de aceite e encerramento do projeto

Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.

Responsável: Gerente de Projetos

Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO

Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite

[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.

6.2 Erros Comuns a Evitar

Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.

  7. Ferramentas e Templates

Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.

  8. SLAs e Prazos

Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.

  9. Fluxograma

Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim

  10. Glossário

Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Entrega e Handoff ao Cliente</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-013</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.</p><p><strong>2.2 Exclusões</strong></p><p>Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Organizar entrega, comunicar cliente e coletar aceite formal</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Organizar e nomear arquivos conforme padrão TBO</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Confirmar que todos os itens do escopo foram entregues</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Confirmar recebimento, revisar e emitir aceite formal</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Conferência final do escopo entregue</strong></p><p>Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.</p><p>Responsável: Gerente de Projetos</p><p>Output: Checklist de escopo 100% concluído documentado</p><p>Prazo referência: 30 min</p><p><strong>[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.</strong></p><p><strong>5.2. Organização e nomenclatura dos arquivos</strong></p><p>Ação: Criar estrutura de pastas padrão: [PROJETO] &gt; [DATA_ENTREGA] &gt; [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Pasta de entrega organizada e nomeada conforme padrão TBO</p><p>Prazo referência: 30–60 min</p><p><strong>5.3. Upload e geração de link de entrega</strong></p><p>Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.</p><p>Responsável: Gerente de Projetos</p><p>Output: Link de entrega funcional e verificado</p><p>Prazo referência: 30–60 min</p><p><strong>5.4. Comunicação formal de entrega ao cliente</strong></p><p>Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.</p><p>Responsável: Gerente de Projetos</p><p>Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS</p><p>Prazo referência: 1 h</p><p><strong>5.5. Coleta de aceite e encerramento do projeto</strong></p><p>Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.</p><p>Responsável: Gerente de Projetos</p><p>Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO</p><p>Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite</p><p><strong>[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim</p><p><strong>  10. Glossário</strong></p><p>Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'high',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    12,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-013
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.', '<p>Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.', '<p>Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).', '<p>Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Gerente de Projetos

Organizar entrega, comunicar cliente e coletar aceite formal

Responsável

—

Visualizador 3D Sênior

Organizar e nomear arquivos conforme padrão TBO

Responsável

—

Diretor Criativo (Marco Andolfato)

Confirmar que todos os itens do escopo foram entregues

Aprovador

—

Cliente / Incorporadora

Confirmar recebimento, revisar e emitir aceite formal

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Organizar entrega, comunicar cliente e coletar aceite formal</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Organizar e nomear arquivos conforme padrão TBO</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Confirmar que todos os itens do escopo foram entregues</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Confirmar recebimento, revisar e emitir aceite formal</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).', '<p>Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.', '<p>Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Conferência final do escopo entregue', 'Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.

Responsável: Gerente de Projetos

Output: Checklist de escopo 100% concluído documentado

Prazo referência: 30 min

[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.', '<p>Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.</p><p>Responsável: Gerente de Projetos</p><p>Output: Checklist de escopo 100% concluído documentado</p><p>Prazo referência: 30 min</p><p><strong>[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.</strong></p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Organização e nomenclatura dos arquivos', 'Ação: Criar estrutura de pastas padrão: [PROJETO] > [DATA_ENTREGA] > [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.

Responsável: Visualizador 3D Sênior

Output: Pasta de entrega organizada e nomeada conforme padrão TBO

Prazo referência: 30–60 min', '<p>Ação: Criar estrutura de pastas padrão: [PROJETO] &gt; [DATA_ENTREGA] &gt; [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Pasta de entrega organizada e nomeada conforme padrão TBO</p><p>Prazo referência: 30–60 min</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Upload e geração de link de entrega', 'Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.

Responsável: Gerente de Projetos

Output: Link de entrega funcional e verificado

Prazo referência: 30–60 min', '<p>Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.</p><p>Responsável: Gerente de Projetos</p><p>Output: Link de entrega funcional e verificado</p><p>Prazo referência: 30–60 min</p>', 8, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Comunicação formal de entrega ao cliente', 'Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.

Responsável: Gerente de Projetos

Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS

Prazo referência: 1 h', '<p>Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.</p><p>Responsável: Gerente de Projetos</p><p>Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS</p><p>Prazo referência: 1 h</p>', 9, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Coleta de aceite e encerramento do projeto', 'Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.

Responsável: Gerente de Projetos

Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO

Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite

[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.', '<p>Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.</p><p>Responsável: Gerente de Projetos</p><p>Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO</p><p>Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite</p><p><strong>[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.', '<p>[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.', '<p>Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.', '<p>Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.', '<p>Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim', '<p>Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.', '<p>Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-014: Gestão de Assets e Biblioteca 3D ──
END $$;