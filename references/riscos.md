# Riscos Principais & Mitigações

## Matriz de Riscos

| Risco | Probabilidade | Impacto | Sprints afetadas | Mitigação |
|-------|:------------:|:-------:|:----------------:|-----------|
| Fireflies API instável ou limitada | Alto | Alto | 2.2, 2.3, 3.3 | Testar endpoints antes do sprint 2.2. Implementar retry + fallback (upload manual de transcrição). Cache de transcrições no Supabase. |
| Reportei API descontinuada ou alterada | Médio | Médio | 3.2 | ETL salva tudo no Supabase. Se Reportei cair, dashboard continua com dados históricos. Avaliar Meta API direta como plan B. |
| Performance do chat com muitos usuários | Médio | Alto | 4.1, 4.2, 4.3 | Supabase Realtime tem limites de conexão. Implementar message batching, lazy loading de canais, cleanup de subscriptions. Monitorar no System Health. |
| Complexidade do parsing de elogios (Fireflies) | Médio | Baixo | 2.3 | Começar com regras simples (keywords). Evoluir para classificação com LLM. Sempre ter review humano antes de publicar reconhecimento automático. |
| Adoção do time (resistência a novo sistema) | Baixo | Alto | Todas | OKRs e reconhecimentos geram valor visível imediatamente. Chat interno só faz sentido se WhatsApp for migrado gradualmente. Treinamento por BU. |

## Planos de contingência por fase

### Fase 1
- **Se RLS do Supabase causar performance issues:** Implementar caching layer com React Query (staleTime: 5min) para reduzir queries diretas ao banco.
- **Se módulo cultura tiver mais problemas que o mapeado:** Delimitar escopo a "navegável sem erros" e deixar melhorias cosméticas para sprint futura.

### Fase 2
- **Se Fireflies webhook não funcionar:** Implementar polling como alternativa (cron a cada 15min busca novas transcrições). Upload manual como fallback final.
- **Se extração de ações por IA tiver accuracy baixa:** Manter fluxo semi-automático (IA sugere, humano confirma) em vez de automação total.

### Fase 3
- **Se Reportei API mudar:** Priorizar Meta Graph API direta como fonte alternativa. Schema do Supabase é agnóstico à fonte.
- **Se Google Calendar API tiver rate limits:** Implementar batch operations e sync incremental (apenas mudanças desde último sync).

### Fase 4
- **Se Supabase Realtime atingir limite de conexões:** Implementar connection pooling e unsubscribe de canais inativos. Considerar upgrade do plano Supabase.
- **Se performance degradar com muitas mensagens:** Implementar virtual scrolling e message windowing. Arquivar mensagens > 90 dias para tabela separada.

## Próximos passos imediatos

1. **Semana 1:** Kickoff com time dev. Validar ambiente e dependências (Fireflies webhook, Google Calendar API, Supabase setup).
2. **Sprint 1.1:** Executar com Claude Code usando Agent Skills (10 skills sequenciais, 3 dias, commits após cada skill).
3. **Sprint 1.2 (paralelo):** Audit do módulo cultura enquanto 1.1 roda.
4. **Review & Retrospective:** Ajustar estimativas e dependências baseado em learnings de Fase 1.
5. **Fase 2:** Iniciar assim que 1.1 estiver estável.
