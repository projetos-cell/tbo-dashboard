# Fase 2 — Gestão de Pessoas & Performance

**Semanas 4-7 | 3 Sprints | Prioridade: Alta**

Construir o ecossistema completo de gestão de performance: OKRs, 1:1s integrados com Fireflies, PDI, e sistema de reconhecimento. Estes módulos são **interdependentes** e formam o 'ciclo de performance' da TBO.

---

## Sprint 2.1 — Sistema de OKRs Nativo

### Contexto
Remover embed Notion da página OKRs. Construir sistema nativo com:
- Hierarchy: Company → BU → Pessoa
- Check-ins semanais
- Scoring automático
- Alert quando em risco

### Referências de Mercado
Lattice (hierarchy + check-ins), Weekdone (scoring automático), Gtmhub (OKR analytics), 15Five (OKR + 1:1 integrado), Perdoo (alignment tree)

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 2.1.1 | Remover embed Notion da página OKRs | Eliminar iframe Notion da rota #okrs-2026. Substituir por container vazio que receberá o novo módulo. Manter dados históricos acessíveis via link Notion externo durante transição. | Baixo | ● |
| 2.1.2 | Schema Supabase: OKR tables | Criar: `okr_objectives` (id, title, owner_id, period, level [company/bu/personal], parent_id, status, bu), `okr_key_results` (objective_id, title, metric_type, target_value, current_value, unit, owner_id), `okr_checkins` (key_result_id, value, notes, author_id, confidence_level). RLS por tenant + role. | Alto | ● |
| 2.1.3 | UI: Alignment Tree View | Visão hierárquica tipo Perdoo: Empresa → BU → Pessoa. Expandir/colapsar objetivos. Progress bar composta calculada pela média ponderada dos KRs. Filtros por período (Q1-Q4), BU, e owner. | Alto | ● |
| 2.1.4 | UI: Check-in Flow | Modal de check-in semanal: atualizar current_value de cada KR, adicionar nota de contexto, definir confidence level (on track / at risk / behind). Histórico de check-ins visível em timeline lateral. | Médio | ● |
| 2.1.5 | UI: Dashboard de OKRs | Vista consolidada: % geral da empresa, top 3 OKRs em risco, próximos check-ins pendentes, gráfico de evolução temporal. Widget para Command Center. | Médio | ● |
| 2.1.6 | Scoring automático + alertas | Calcular % de progresso automaticamente (current/target). Alertar quando KR está < 25% na metade do quarter. Notificação para owner + líder. Flag automático 'at_risk' quando progresso < expected_by_date. | Médio | ● |

### Critérios de Aceitação

- [ ] OKR tree renderiza corretamente com 3+ níveis hierárquicos
- [ ] Check-in semanal funciona sem erros
- [ ] Scoring automático atualiza em < 1s
- [ ] Alertas de risco disparam corretamente
- [ ] Dados históricos acessíveis via Notion durante transição
- [ ] Dashboard carrega em < 2s com 100+ OKRs

---

## Sprint 2.2 — 1:1 Integrado com Fireflies + PDI

### Contexto
Fluxo end-to-end:
1. Agendar 1:1
2. Reunião gravada no Fireflies
3. Transcrição processada
4. Ações extraídas e distribuídas
5. Ações vinculadas ao PDI individual
6. Tracking de progresso

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 2.2.1 | Schema: 1:1 meetings + actions | Tabelas: `one_on_one_meetings` (id, leader_id, member_id, scheduled_at, fireflies_meeting_id, status, type [po_liderado, socio_po]), `one_on_one_actions` (meeting_id, assignee_id, description, due_date, status, pdi_link_id). FK para pdi_goals. | Alto | ● |
| 2.2.2 | Agendamento de 1:1 com tipo de ritual | UI para agendar 1:1 no módulo 'Rituais'. Tipos: PO + Liderado, Sócios + POs. Criar evento Google Calendar via API. Adicionar link Fireflies para gravação automática. | Alto | ● |
| 2.2.3 | Webhook Fireflies: captura de transcrição | Endpoint `/api/webhooks/fireflies` que recebe callback quando gravação finaliza. Extrair: transcript_id, meeting_id, summary, action_items. Match automático com one_on_one_meetings via participantes ou meeting_id. | Alto | ● |
| 2.2.4 | Processamento de ações com IA | Usar Claude API (ou GPT) para extrair action items da transcrição Fireflies. Classificar cada ação: assignee (líder ou liderado), deadline sugerido, categoria (feedback, desenvolvimento, operacional). Salvar em one_on_one_actions. | Alto | ● |
| 2.2.5 | Distribuição automática de ações | Após processamento, notificar líder e liderado das suas ações. Cada ação aparece no dashboard pessoal do assignee. Status tracking: pendente → em andamento → concluída. | Médio | ● |
| 2.2.6 | Vínculo ações ↔ PDI | Permitir linkar uma ação de 1:1 a uma meta do PDI (trilha-aprendizagem.js). Quando ação é concluída, atualiza progresso do PDI automaticamente. Visão consolidada: PDI mostra ações originadas de 1:1s. | Médio | ● |

### Critérios de Aceitação

- [ ] Agendar 1:1 cria evento Google Calendar + Fireflies link
- [ ] Webhook Fireflies recebe transcrição corretamente
- [ ] Claude API extrai 3+ ações por transcrição (com accuracy > 80%)
- [ ] Ações distribuídas automaticamente aos assignees
- [ ] PDI atualiza quando ação vinculada é concluída
- [ ] Nenhuma ação perdida no pipeline

### Risco Alto
Fireflies API instável ou limitada. **Mitigação:** testar endpoints antes. Implementar retry + fallback (upload manual de transcrição). Cache de transcrições no Supabase.

---

## Sprint 2.3 — Sistema de Reconhecimentos + Pontuação

### Contexto
Detectar elogios no Fireflies automaticamente. Criar feed de reconhecimentos. Sistema de pontuação com recompensas (vouchers, ingressos).

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 2.3.1 | Schema: reconhecimentos + pontuação | Tabelas: `recognitions` (id, from_user_id, to_user_id, message, source [manual, fireflies, chat], value_tag, points, created_at), `recognition_rewards` (id, name, description, points_required, type [voucher, experience], active), `recognition_redemptions` (user_id, reward_id, redeemed_at, status). | Médio | ● |
| 2.3.2 | Detecção de elogios no Fireflies | No webhook de transcrição (2.2.3), parser que detecta menções de elogio (patterns: 'parabéns', 'excelente trabalho', 'mandou bem', etc.). Cada elogio detectado cria recognition automático com source='fireflies'. Review manual opcional antes de publicar. | Alto | ● |
| 2.3.3 | Página de reconhecimentos | Feed tipo LinkedIn: cards com quem elogiou, quem recebeu, mensagem, e tag de valor TBO associado. Filtros por período, pessoa, e valor. Contador de pontos por pessoa. | Médio | ● |
| 2.3.4 | Sistema de pontuação e recompensas | Regras: cada reconhecimento genuíno = X pontos (configurável). Tiers de recompensa: 20 reconhecimentos = R$200 voucher restaurante OU ingresso Cinemark. Admin configura rewards disponíveis, pontos necessários, budget trimestral. | Médio | ● |
| 2.3.5 | Dashboard de reconhecimentos (Diretoria) | Visão executiva: top reconhecidos do mês, distribuição por BU, custo acumulado de rewards, tendências. Dentro do workspace Diretoria (acesso founders). | Baixo | ● |

### Critérios de Aceitação

- [ ] Parser de elogios identifica > 80% de menções genuínas
- [ ] Feed carrega em < 1s
- [ ] Pontuação calcula automaticamente sem erros
- [ ] Admin consegue criar/editar rewards
- [ ] Redemptions registram corretamente
- [ ] Dashboard Diretoria reflete pontuação em tempo real
