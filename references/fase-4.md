# Fase 4 — Comunicação Interna (Chat TBO)

**Semanas 12-16 | 3 Sprints | Prioridade: Média**

Módulo mais complexo do roadmap. O chat.js existente (139KB) já tem base de mensagens em tempo real via Supabase Realtime. Esta fase evolui para um chat completo estilo Slack/Discord com todas as funcionalidades.

---

## Sprint 4.1 — Infraestrutura de Chat

### Contexto
Expandir schema de chat. Implementar engine core: envio, edição, threading, presença.

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 4.1.1 | Schema expandido de chat | Tabelas: `chat_channels` (id, name, type [public, private, dm, group], topic, created_by), `chat_members` (channel_id, user_id, role, last_read_at), `chat_messages` (id, channel_id, author_id, content, reply_to_id, edited_at, deleted_at, attachments_json), `chat_reactions` (message_id, user_id, emoji). Supabase Realtime subscription por channel. | Alto | ● |
| 4.1.2 | Engine de mensagens core | Envio com Ctrl+Enter (configurável). Edição e deleção de mensagens próprias (soft delete). Threading via reply_to_id. Indicador de typing (Supabase Presence). Scroll infinito com paginação de mensagens. | Alto | ● |
| 4.1.3 | Menções (@user, @channel) | Parser de menções no input: ao digitar @, autocomplete com lista de membros do canal. Menções geram notificação push (inbox + badge). Highlight visual da menção no corpo da mensagem. | Médio | ● |

### Critérios de Aceitação

- [ ] Enviar mensagem em < 200ms
- [ ] Editar/deletar funciona sem lag
- [ ] Typing indicator aparece em < 500ms
- [ ] Threading renderiza corretamente
- [ ] Menções geram notificação push
- [ ] Scroll infinito em canais com 1000+ mensagens

### Risco Médio
Performance do chat com muitos usuários. **Mitigação:** Supabase Realtime tem limites de conexão. Implementar message batching, lazy loading de canais, cleanup de subscriptions. Monitorar no System Health.

---

## Sprint 4.2 — Rich Media & Anexos

### Contexto
Suportar upload de arquivos, GIFs, áudio. Reações com emojis.

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 4.2.1 | Upload de anexos | Supabase Storage bucket 'chat-attachments' com RLS por channel membership. Upload de imagens, PDFs, documentos. Preview inline para imagens. Download link para outros tipos. Limite: 25MB por arquivo. | Alto | ● |
| 4.2.2 | Emojis e reações | Emoji picker (emoji-mart ou similar). Reações em mensagens (clicar + adicionar emoji). Contador de reações agrupado. Shortcodes :emoji_name: no input. | Médio | ● |
| 4.2.3 | GIFs (Giphy/Tenor) | Integrar Giphy API ou Tenor API. Botão GIF no composer abre picker com busca. Preview antes de enviar. Renderizar GIF inline na mensagem. | Médio | ● |
| 4.2.4 | Gravação de áudio | MediaRecorder API do browser para gravar áudio. Upload para Supabase Storage. Player inline na mensagem com waveform visual. Limite: 5 min por áudio. | Alto | ● |

### Critérios de Aceitação

- [ ] Upload < 25MB em < 5s
- [ ] Preview imagem carrega em < 1s
- [ ] Emoji picker abre em < 300ms
- [ ] GIFs renderizam sem lag
- [ ] Gravação de áudio funciona em Chrome/Safari/Firefox
- [ ] Waveform visual renderiza corretamente

---

## Sprint 4.3 — Grupos, DMs & Tópicos

### Contexto
Completar funcionalidades de canais: mensagens privadas, grupos customizados, threads (tópicos).

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 4.3.1 | Mensagens particulares (DMs) | Criar canal type='dm' automaticamente quando usuário inicia conversa privada. Sidebar separada: Canais \| DMs. Lista de DMs com avatar, nome, última mensagem, badge de unread. | Médio | ● |
| 4.3.2 | Grupos customizados | Criar canal type='group' com nome, descrição, membros selecionados. Admin do grupo pode adicionar/remover membros. Notificações configuráveis por grupo (all, mentions, none). | Médio | ● |
| 4.3.3 | Tópicos (threads) | Clicar em mensagem → abrir thread lateral (estilo Slack). Mensagens na thread vinculadas via parent_message_id. Indicador '3 replies' na mensagem original. Thread não polui o canal principal. | Alto | ● |
| 4.3.4 | Busca global de mensagens | Full-text search no Supabase (tsvector). Buscar por conteúdo, autor, canal, e data. Resultados com highlight do termo e link para a mensagem no contexto. | Médio | ● |

### Critérios de Aceitação

- [ ] DM com qualquer usuário abre em < 500ms
- [ ] Criar grupo customizado funciona
- [ ] Adicionar/remover membros em tempo real
- [ ] Thread lateral não causa lag no canal principal
- [ ] Busca global retorna resultados em < 1s (mesmo com 10k+ mensagens)
- [ ] Highlight de termo visível nos resultados
