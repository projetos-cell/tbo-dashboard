/**
 * TBO OS — Command Registry
 *
 * Registro centralizado de comandos para o Command Palette.
 * Módulos podem registrar comandos em qualquer momento.
 */

const TBO_COMMAND_REGISTRY = (() => {
  const _commands = [];

  return {
    /**
     * Registra um comando
     * @param {object} cmd - { id, label, icon, category, action, keywords?, shortcut?, hidden? }
     */
    register(cmd) {
      if (!cmd.id || !cmd.label || !cmd.action) {
        console.warn('[CommandRegistry] Comando inválido:', cmd);
        return;
      }
      // Evitar duplicatas
      const idx = _commands.findIndex(c => c.id === cmd.id);
      if (idx >= 0) {
        _commands[idx] = cmd;
      } else {
        _commands.push(cmd);
      }
    },

    /**
     * Registra múltiplos comandos
     */
    registerMany(cmds) {
      cmds.forEach(c => this.register(c));
    },

    /**
     * Busca comandos por query
     * @param {string} query
     * @returns {Array}
     */
    search(query) {
      if (!query) return _commands.filter(c => !c.hidden);

      const q = query.toLowerCase().trim();
      return _commands
        .filter(c => !c.hidden)
        .filter(c => {
          const haystack = [
            c.label,
            c.category || '',
            ...(c.keywords || [])
          ].join(' ').toLowerCase();
          return haystack.includes(q);
        })
        .sort((a, b) => {
          // Prioridade: match no label > category > keywords
          const aLabel = a.label.toLowerCase().includes(q) ? 0 : 1;
          const bLabel = b.label.toLowerCase().includes(q) ? 0 : 1;
          return aLabel - bLabel;
        });
    },

    /**
     * Retorna todos os comandos visíveis
     */
    getAll() {
      return _commands.filter(c => !c.hidden);
    },

    /**
     * Retorna comandos por categoria
     */
    getByCategory(category) {
      return _commands.filter(c => c.category === category && !c.hidden);
    },

    /**
     * Total de comandos registrados
     */
    get count() {
      return _commands.length;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_COMMAND_REGISTRY = TBO_COMMAND_REGISTRY;
}
