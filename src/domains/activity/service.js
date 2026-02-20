/**
 * TBO OS — Activity Service
 *
 * Transforma dados crus de auditoria em itens legíveis
 * para o Activity Feed.
 */

const TBO_ACTIVITY = (() => {
  let _pollingTimer = null;
  let _listeners = [];
  let _lastItems = [];

  // Mapa de ações → verbos em português
  const ACTION_LABELS = {
    'INSERT': 'criou',
    'UPDATE': 'atualizou',
    'DELETE': 'removeu',
    'create': 'criou',
    'update': 'atualizou',
    'delete': 'removeu',
    'archive': 'arquivou',
    'restore': 'restaurou',
    'login': 'fez login',
    'logout': 'fez logout',
    'assign': 'atribuiu',
    'complete': 'concluiu',
    'approve': 'aprovou',
    'reject': 'rejeitou',
    'comment': 'comentou em',
    'upload': 'enviou arquivo para',
    'send_message': 'enviou mensagem em'
  };

  // Mapa de entidades → nomes em português
  const ENTITY_LABELS = {
    'projects': 'projeto',
    'tasks': 'tarefa',
    'profiles': 'perfil',
    'crm_deals': 'deal',
    'clients': 'contato',
    'financial_transactions': 'transação',
    'chat_messages': 'mensagem',
    'deliverables': 'entrega',
    'proposals': 'proposta',
    'contracts': 'contrato'
  };

  /**
   * Transforma item de audit_log em item legível
   */
  function _formatItem(raw) {
    const actor = raw.actor?.full_name || 'Alguém';
    const avatar = raw.actor?.avatar_url || null;
    const verb = ACTION_LABELS[raw.action] || raw.action;
    const entityLabel = ENTITY_LABELS[raw.entity] || raw.entity;
    const entityName = raw.payload?.name || raw.payload?.title || raw.entity_id || '';

    return {
      id: raw.id,
      actor,
      avatar,
      actorId: raw.actor?.id,
      verb,
      entity: entityLabel,
      entityName,
      entityId: raw.entity_id,
      rawAction: raw.action,
      rawEntity: raw.entity,
      timestamp: raw.created_at,
      // Texto legível: "Tiago criou projeto Horizon"
      text: entityName
        ? `${actor} ${verb} ${entityLabel} ${entityName}`
        : `${actor} ${verb} ${entityLabel}`
    };
  }

  return {
    /**
     * Busca atividades recentes formatadas
     * @returns {Promise<Array>}
     */
    async getRecent(opts = {}) {
      if (typeof ActivityRepo === 'undefined') return [];

      try {
        const raw = await ActivityRepo.listRecent(opts);
        _lastItems = raw.map(_formatItem);
        return _lastItems;
      } catch (err) {
        console.warn('[Activity] Erro ao buscar atividades:', err);
        return _lastItems; // Retorna cache
      }
    },

    /**
     * Inicia polling de atividades
     * @param {number} intervalMs - Intervalo em ms (padrão 45s)
     */
    startPolling(intervalMs = 45000) {
      this.stopPolling();
      _pollingTimer = setInterval(async () => {
        const items = await this.getRecent({ limit: 10 });
        _listeners.forEach(fn => fn(items));
      }, intervalMs);
    },

    /**
     * Para o polling
     */
    stopPolling() {
      if (_pollingTimer) {
        clearInterval(_pollingTimer);
        _pollingTimer = null;
      }
    },

    /**
     * Adiciona listener para atualizações
     * @param {function} fn - Callback que recebe array de items
     * @returns {function} Unsubscribe function
     */
    onUpdate(fn) {
      _listeners.push(fn);
      return () => {
        _listeners = _listeners.filter(l => l !== fn);
      };
    },

    /**
     * Retorna última lista carregada (cache)
     */
    getCached() {
      return _lastItems;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_ACTIVITY = TBO_ACTIVITY;
}
