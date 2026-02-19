# TBO OS — Guia de Onboarding

## Visao Geral

O sistema de onboarding do TBO OS conduz novos colaboradores em um fluxo estruturado de **10 dias** (onboarding completo) ou **3 dias** (onboarding reduzido), com atividades diarias que apresentam a empresa, cultura, processos e ferramentas.

**URL**: `https://tbo-dashboard-main.vercel.app/pages/onboarding.html`

---

## Arquitetura Tecnica

### Stack
- **Frontend**: Vanilla JS (singleton `TBO_ONBOARDING` em `js/onboarding.js`)
- **Backend**: Supabase PostgreSQL + Realtime
- **Auth**: Supabase Auth (email/senha + Google OAuth)
- **Deploy**: Vercel (tbo-dashboard-main.vercel.app)
- **Pagina**: `pages/onboarding.html` — standalone, sem sidebar

### Tabelas do Banco (Supabase)
| Tabela | Descricao |
|--------|-----------|
| `colaboradores` | Dados do colaborador (nome, email, status, tipo_onboarding, auth_user_id, cargo) |
| `onboarding_dias` | Definicao dos dias (numero, titulo, tema, carga, tipo_onboarding) |
| `onboarding_atividades` | Atividades de cada dia (titulo, descricao, tipo, ordem, obrigatorio, url_conteudo, score_minimo, tempo_estimado_min) |
| `onboarding_dias_liberados` | Quais dias cada colaborador pode acessar (colaborador_id, dia_id, concluido) |
| `onboarding_progresso` | Progresso individual (colaborador_id, atividade_id, concluido, concluido_em, tentativas, score, resposta_tarefa, tempo_gasto_seg, feedback_rating) |
| `onboarding_buddies` | Relacao colaborador-buddy |
| `onboarding_quizzes` | Perguntas e opcoes de quiz |
| `onboarding_notificacoes` | Notificacoes enviadas |
| `onboarding_feedbacks` | Feedbacks do onboarding |
| `vw_progresso_onboarding` | View com percentual de conclusao por colaborador |

### Arquivos Principais
| Arquivo | Funcao |
|---------|--------|
| `pages/onboarding.html` | Pagina standalone do onboarding (HTML + CSS completo) |
| `js/onboarding.js` | Logica principal — singleton `TBO_ONBOARDING` |
| `js/onboarding-guard.js` | Middleware que redireciona/bloqueia baseado no status |
| `js/supabase-client.js` | Cliente Supabase standalone (`TBO_ONBOARDING_DB`) |
| `config.js` | Credenciais Supabase (gitignored) |

---

## Fluxo do Colaborador

### 1. Cadastro (Admin)
O admin cadastra o colaborador via modulo `admin-onboarding`:
- Nome, email, cargo, tipo_onboarding (completo/reduzido)
- Sistema gera convite com link unico

### 2. Aceite do Convite
- Colaborador recebe email com link
- Cria conta (Supabase Auth)
- Status muda para `aguardando_inicio`

### 3. Inicio do Onboarding
- Na data de inicio, status muda para `onboarding`
- `onboarding-guard.js` detecta e redireciona para `pages/onboarding.html`
- Dia 1 e liberado automaticamente em `onboarding_dias_liberados`

### 4. Progresso Diario
- Colaborador completa atividades do dia atual
- Ao concluir todas as atividades obrigatorias do dia:
  - O dia e marcado como `concluido` em `onboarding_dias_liberados`
  - O proximo dia e liberado automaticamente
  - Mini-celebracao e exibida
- Dias bloqueados nao podem ser acessados (feedback visual ao clicar)

### 5. Conclusao
- Ao completar 100% das atividades, botao "Estou pronto para comecar!" aparece
- Clique chama Edge Function `fn_conclusao_onboarding`
- Status do colaborador muda para `ativo`
- Celebracao final com confetti

---

## Tipos de Atividade

| Tipo | Botao | Comportamento |
|------|-------|--------------|
| `video` | Assistir | Exibe player de video (ou placeholder se sem URL) |
| `documento` | Ler | Exibe link para documento (ou placeholder se sem URL) |
| `sop` | Ler | Igual a documento |
| `quiz` | Iniciar | Quiz com perguntas (placeholder — ainda nao implementado) |
| `tarefa` | Fazer | Textarea para resposta escrita (minimo 10 caracteres) |
| `aceite` | Aceitar | Checkbox de concordancia + link para documento |
| `formulario` | Preencher | Textarea para respostas |

### Campos Importantes em `onboarding_atividades`
- `url_conteudo` — URL do video, PDF ou documento externo. Se NULL, mostra placeholder
- `obrigatorio` — Se true, conta para o percentual de progresso
- `score_minimo` — Para quizzes, score minimo para aprovacao
- `tempo_estimado_min` — Tempo estimado exibido ao colaborador

---

## Onboarding Guard (Middleware)

O arquivo `js/onboarding-guard.js` funciona como middleware de rota. Ele verifica o status do colaborador apos o login:

| Status | Tipo Onboarding | Comportamento |
|--------|----------------|--------------|
| `onboarding` | `completo` | Redireciona para `pages/onboarding.html` |
| `onboarding` | `reduzido` | Exibe banner persistente no topo (nao redireciona) |
| `aguardando_inicio` | qualquer | Exibe pagina de espera com data de inicio |
| `pre-onboarding` | qualquer | Exibe pagina de espera |
| `ativo` | `reduzido` | Se progresso < 100%, exibe banner sutil |
| `ativo` | `completo` | Acesso normal ao sistema |
| `inativo` | qualquer | Acesso normal (admin desativou) |

---

## Funcionalidades Tecnicas

### Cache Local (localStorage)
- Dias e atividades sao cacheados por 10 minutos (`tbo_onboarding_cache`)
- Progresso e dias liberados sao SEMPRE buscados do servidor
- Snapshots do progresso sao salvos para recovery (`tbo_onboarding_snapshot`)

### Realtime (WebSocket)
- Escuta `INSERT` em `onboarding_dias_liberados` — exibe mini-celebracao de dia desbloqueado
- Escuta `UPDATE` em `onboarding_dias_liberados` — atualiza interface
- Escuta `*` em `onboarding_progresso` — sincroniza com updates do admin

### Acessibilidade
- Modal com `role="dialog"` e `aria-modal="true"`
- Focus management ao abrir modal
- Fechamento com tecla Escape
- Estrelas de feedback com `aria-label`

### Responsividade
- Breakpoints: 600px (mobile) e 400px (small mobile)
- Layout adapta: botoes full-width, modal 95vw, icons menores
- Dark mode via `prefers-color-scheme` e `data-theme="dark"`

---

## Configuracao de um Novo Onboarding

### 1. Criar os Dias
Inserir na tabela `onboarding_dias`:
```sql
INSERT INTO onboarding_dias (titulo, tema, numero, carga, tipo_onboarding)
VALUES
  ('Chegada', 'Boas-vindas e primeiros passos', 1, 'leve', 'completo'),
  ('Cultura e Identidade', 'Quem somos e como nos posicionamos', 2, 'leve', 'completo');
  -- ... ate o dia 10
```

### 2. Criar as Atividades
Inserir na tabela `onboarding_atividades`:
```sql
INSERT INTO onboarding_atividades (dia_id, titulo, descricao, tipo, ordem, obrigatorio, url_conteudo, tempo_estimado_min)
VALUES
  ('uuid-dia-1', 'Video de boas-vindas', 'Assista ao video dos socios da TBO', 'video', 1, true, 'https://...mp4', 5),
  ('uuid-dia-1', 'Criar seu perfil', 'Preencha seus dados pessoais', 'formulario', 2, true, NULL, 10);
```

### 3. Cadastrar Colaborador
Via modulo admin ou SQL:
```sql
INSERT INTO colaboradores (nome, email, cargo, status, tipo_onboarding, data_inicio)
VALUES ('Nome', 'email@empresa.com', 'Designer', 'pre-onboarding', 'completo', '2026-03-01');
```

### 4. Liberar Dia 1
Ao iniciar o onboarding:
```sql
INSERT INTO onboarding_dias_liberados (colaborador_id, dia_id, concluido)
VALUES ('uuid-colaborador', 'uuid-dia-1', false);

UPDATE colaboradores SET status = 'onboarding' WHERE id = 'uuid-colaborador';
```

---

## Problemas Conhecidos e Pendencias

### Conteudo
- [ ] Adicionar URLs reais em `url_conteudo` para todos os videos, documentos e PDFs
- [ ] Criar conteudo do codigo de conduta para o aceite do Dia 2
- [ ] Configurar buddy real via tabela `onboarding_buddies`
- [ ] Implementar sistema de quiz funcional (perguntas, opcoes, score)
- [ ] Criar formulario de perfil real (campos: foto, bio, telefone, LinkedIn)

### Infraestrutura
- [ ] Deployar Edge Functions (fn_conclusao_onboarding, fn_liberar_dia, fn_enviar_notificacao, fn_gerar_convite)
- [ ] Configurar pg_cron para liberacao automatica de dias por data
- [ ] Configurar bucket de Storage para uploads de atividades
- [ ] Habilitar RLS nas tabelas de onboarding (atualmente desabilitado)

### UX/UI
- [x] Feedback visual ao clicar dia bloqueado (shake + toast)
- [x] Celebracao ao completar dia (mini-celebracao)
- [x] Botao re-habilitado apos validacao falhar (aceite, tarefa)
- [x] Estrelas de feedback com preenchimento visual (fill SVG)
- [x] Documentos sem URL mostram mensagem orientativa
- [x] Progresso mostra contagem de atividades alem de dias

---

## Cronograma Sugerido (Proximos Passos)

| Prioridade | Item | Esforco |
|-----------|------|---------|
| Alta | Subir conteudo real (videos, PDFs) em `url_conteudo` | 2-3h |
| Alta | Deployar Edge Functions | 1h |
| Alta | Habilitar RLS com policies corretas | 1-2h |
| Media | Implementar quiz funcional | 3-4h |
| Media | Formulario de perfil real (nao textarea) | 2-3h |
| Media | Configurar pg_cron | 1h |
| Baixa | Sistema de buddy (puxar nome/foto) | 1-2h |
| Baixa | Notificacoes por email (lembretes) | 2-3h |
