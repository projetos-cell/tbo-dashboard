# TBO OS — Sistema de Onboarding

Sistema completo de onboarding para novos colaboradores (10 dias) e usuarios existentes (3 dias), com gestao de convites, progresso, notificacoes e painel administrativo.

---

## Arquivos Criados

### Banco de Dados
| Arquivo | Descricao |
|---------|-----------|
| `database/schema.sql` | Schema completo: 10 tabelas, 5 triggers, 2 views, RLS, pg_cron, seed data |
| `database/migrate_existing_users.sql` | Migracao dos 15 usuarios existentes da TBO |

### Edge Functions (Supabase)
| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/fn_liberar_dia_1/index.ts` | Libera dia 1 para colaboradores com data_inicio = hoje |
| `supabase/functions/fn_verificar_inatividade/index.ts` | Detecta inatividade e notifica buddy/admin |
| `supabase/functions/fn_email_dia_anterior/index.ts` | Notificacao de preparacao no dia anterior ao inicio |
| `supabase/functions/fn_conclusao_onboarding/index.ts` | Notificacoes de conclusao e agendamento de check-ins |

### Frontend — Paginas
| Arquivo | Descricao |
|---------|-----------|
| `pages/convite.html` + `js/convite.js` | Pagina standalone de aceite de convite (cria conta Supabase Auth) |
| `pages/onboarding.html` + `js/onboarding.js` | Pagina exclusiva de onboarding (dias, atividades, progresso) |
| `pages/admin-onboarding.html` + `js/admin-onboarding.js` | Pagina standalone admin OU modulo SPA (duplo uso) |
| `pages/novo-colaborador.html` + `js/novo-colaborador.js` | Formulario admin para cadastrar novo colaborador |

### Frontend — Modulos JS
| Arquivo | Descricao |
|---------|-----------|
| `js/supabase-client.js` | Wrapper `TBO_ONBOARDING_DB` que reutiliza `TBO_SUPABASE` |
| `js/onboarding-guard.js` | Verifica status do colaborador e redireciona/mostra banner |
| `js/notificacoes.js` | Badge no header + dropdown de notificacoes com Realtime |
| `js/admin-onboarding.js` | Modulo admin registrado no router do SPA |

### Configuracao
| Arquivo | Descricao |
|---------|-----------|
| `config.example.js` | Template de configuracao com placeholders |

### Integracao
| Arquivo | Alteracao |
|---------|-----------|
| `index.html` | Adicionados 4 `<script>` tags para os novos JS |
| `app.js` | Registrado modulo `admin-onboarding`, adicionado guard + notificacoes no boot |
| `styles.css` | ~350 linhas de CSS adicionadas ao final para onboarding |
| `.gitignore` | Adicionado `config.js` |

---

## Configuracao do Supabase

### 1. Criar projeto no Supabase
- Acesse [supabase.com](https://supabase.com) e crie um projeto
- Anote a **URL** e a **anon key**

### 2. Executar o schema
1. Abra o **SQL Editor** no dashboard do Supabase
2. Cole e execute o conteudo de `database/schema.sql`
3. Verifique que todas as tabelas foram criadas:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' ORDER BY table_name;
   ```

### 3. Migrar usuarios existentes
1. No SQL Editor, cole e execute `database/migrate_existing_users.sql`
2. Verifique:
   ```sql
   SELECT nome, email, cargo, perfil_acesso, status FROM colaboradores ORDER BY nome;
   ```

### 4. Configurar Storage
1. Va em **Storage** no dashboard do Supabase
2. Crie um bucket chamado `onboarding-files`
3. Defina como **publico** (para URLs de avatar)
4. Adicione policy de upload para usuarios autenticados

### 5. Configurar Edge Functions
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Deploy das functions
supabase functions deploy fn_liberar_dia_1
supabase functions deploy fn_verificar_inatividade
supabase functions deploy fn_email_dia_anterior
supabase functions deploy fn_conclusao_onboarding
```

### 6. Configurar pg_cron (opcional)
No SQL Editor do Supabase, habilite a extensao e agende os jobs:
```sql
-- Habilitar pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Liberar dia 1 para novos colaboradores (diariamente as 7h BRT)
SELECT cron.schedule('liberar-dia-1', '0 10 * * *',
  $$SELECT net.http_post('SUA_SUPABASE_URL/functions/v1/fn_liberar_dia_1',
    '{}', '{"Authorization": "Bearer SUA_SERVICE_ROLE_KEY"}')$$);

-- Verificar inatividade (diariamente as 9h BRT)
SELECT cron.schedule('verificar-inatividade', '0 12 * * *',
  $$SELECT net.http_post('SUA_SUPABASE_URL/functions/v1/fn_verificar_inatividade',
    '{}', '{"Authorization": "Bearer SUA_SERVICE_ROLE_KEY"}')$$);

-- Email dia anterior (diariamente as 14h BRT)
SELECT cron.schedule('email-dia-anterior', '0 17 * * *',
  $$SELECT net.http_post('SUA_SUPABASE_URL/functions/v1/fn_email_dia_anterior',
    '{}', '{"Authorization": "Bearer SUA_SERVICE_ROLE_KEY"}')$$);
```

### 7. Configurar credenciais no frontend
Certifique-se de que `utils/supabase.js` (TBO_SUPABASE) tem a URL e anonKey corretas. O `js/supabase-client.js` reutiliza automaticamente as credenciais existentes.

---

## Fluxo Completo — Passo a Passo

### 1. Cadastrar novo colaborador
1. Login como **admin** ou **gestor**
2. Acesse `#admin-onboarding` na sidebar (Gestao de Onboarding)
3. Clique em **Novo Colaborador**
4. Preencha: nome, email, cargo, tipo contrato, data inicio, buddy, tipo onboarding
5. Ao salvar, o sistema:
   - Insere na tabela `colaboradores` (status = `pre-onboarding`)
   - Trigger `gerar_convite` cria automaticamente um convite com token e validade de 7 dias
   - Exibe tela de confirmacao com link do convite

### 2. Aceite do convite
1. Envie o link `pages/convite.html?token=XXX` para o novo colaborador
2. A pagina valida o token (existencia, validade, uso)
3. O colaborador define senha, telefone e foto
4. Ao salvar:
   - Cria usuario no Supabase Auth
   - Upload de foto no Storage
   - Atualiza telefone/foto na tabela colaboradores
   - Marca convite como usado

### 3. Primeiro acesso / Onboarding
1. No dia de inicio (data_inicio), o pg_cron job `fn_liberar_dia_1`:
   - Muda status para `onboarding`
   - Libera o Dia 1
2. Ao fazer login, o `onboarding-guard.js` detecta status = `onboarding`:
   - **Completo**: redireciona para `pages/onboarding.html`
   - **Reduzido**: mostra banner laranja no topo com link para onboarding
3. Na pagina de onboarding, o colaborador:
   - Ve a lista de dias com status (cadeado/disponivel/concluido)
   - Clica em um dia para ver atividades
   - Completa atividades (video, documento, quiz, tarefa, aceite, formulario)
   - Quando todas as atividades de um dia sao concluidas, trigger `liberar_proximo_dia` libera o dia seguinte

### 4. Conclusao
1. Ao completar o ultimo dia:
   - Status muda para `ativo`
   - Edge Function `fn_conclusao_onboarding` envia notificacoes
   - Check-ins do Dia 30 e Dia 90 sao agendados
2. Admin ve a conclusao em tempo real no painel

### 5. Acompanhamento admin
1. Painel `#admin-onboarding` exibe:
   - KPIs: total em onboarding, concluidos, atrasados, aguardando
   - Tabela com progresso de cada colaborador
   - Filtros: todos, em onboarding, concluidos, atrasados
2. Ao clicar em um colaborador, abre detalhe com:
   - Informacoes pessoais
   - Atividades concluidas/pendentes
   - Check-ins realizados/agendados
   - Botoes: reenviar convite, marcar check-in

---

## Tipos de Onboarding

| Tipo | Dias | Descricao |
|------|------|-----------|
| **Completo** | 10 dias | Para novos colaboradores que nunca usaram o sistema |
| **Reduzido** | 3 dias | Para usuarios existentes que precisam conhecer o novo TBO OS |

O onboarding **reduzido** nao bloqueia o acesso ao sistema — exibe apenas um banner incentivando a conclusao.

---

## Tabelas do Banco

| Tabela | Descricao |
|--------|-----------|
| `colaboradores` | Dados do colaborador (nome, email, cargo, status, buddy, etc.) |
| `convites` | Tokens de convite com validade e controle de uso |
| `onboarding_dias` | Definicao dos dias de onboarding (numero, titulo, tipo) |
| `onboarding_atividades` | Atividades dentro de cada dia (video, quiz, tarefa, etc.) |
| `onboarding_progresso` | Registro de conclusao de atividades por colaborador |
| `onboarding_dias_liberados` | Controle de quais dias cada colaborador pode acessar |
| `onboarding_checkins` | Check-ins do Dia 30 e Dia 90 |
| `onboarding_notificacoes` | Notificacoes in-app e por email |
| `colaboradores_status_log` | Historico de mudancas de status |

---

## Verificacao Rapida

```sql
-- Colaboradores cadastrados
SELECT nome, email, status, tipo_onboarding FROM colaboradores ORDER BY created_at DESC;

-- Convites pendentes
SELECT c.nome, cv.token, cv.expira_em, cv.usado_em
FROM convites cv
JOIN colaboradores c ON c.id = cv.colaborador_id
ORDER BY cv.created_at DESC;

-- Progresso de onboarding
SELECT * FROM vw_progresso_onboarding;

-- Colaboradores inativos
SELECT * FROM vw_colaboradores_inativos;
```
