/**
 * TBO OS — Comandos Padrão
 *
 * Registra comandos de navegação, criação e ações rápidas
 * baseados no TBO_ROUTE_REGISTRY e módulos existentes.
 */

(function () {
  'use strict';

  function _registerDefaultCommands() {
    if (typeof TBO_COMMAND_REGISTRY === 'undefined') return;
    if (typeof TBO_ROUTE_REGISTRY === 'undefined') return;

    const meta = TBO_ROUTE_REGISTRY.getModuleMeta();
    const routes = TBO_ROUTE_REGISTRY.getModuleRoutes();

    // ── Comandos de navegação (baseados no MODULE_META) ──
    for (const [key, m] of Object.entries(meta)) {
      const route = Object.entries(routes).find(([, v]) => v === key)?.[0] || key;
      TBO_COMMAND_REGISTRY.register({
        id: `nav:${key}`,
        label: `Ir para ${m.label}`,
        icon: m.icon,
        category: 'Navegação',
        keywords: [key, route, m.group],
        action() {
          if (typeof TBO_ROUTER !== 'undefined') {
            TBO_ROUTER.navigate(route);
          } else {
            window.location.hash = route;
          }
        }
      });
    }

    // ── Comandos de criação rápida ──
    const createCommands = [
      {
        id: 'create:projeto',
        label: 'Novo Projeto',
        icon: 'folder-plus',
        keywords: ['criar', 'projeto', 'new', 'project'],
        action() {
          if (typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate('projetos');
          // Dispara evento para o módulo abrir modal de criação
          window.dispatchEvent(new CustomEvent('tbo:create', { detail: { type: 'projeto' } }));
        }
      },
      {
        id: 'create:tarefa',
        label: 'Nova Tarefa',
        icon: 'plus-square',
        keywords: ['criar', 'tarefa', 'new', 'task'],
        action() {
          if (typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate('tarefas');
          window.dispatchEvent(new CustomEvent('tbo:create', { detail: { type: 'tarefa' } }));
        }
      },
      {
        id: 'create:deal',
        label: 'Novo Deal',
        icon: 'handshake',
        keywords: ['criar', 'deal', 'negócio', 'pipeline'],
        action() {
          if (typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate('pipeline');
          window.dispatchEvent(new CustomEvent('tbo:create', { detail: { type: 'deal' } }));
        }
      },
      {
        id: 'create:contato',
        label: 'Novo Contato',
        icon: 'user-plus',
        keywords: ['criar', 'contato', 'cliente', 'new', 'contact'],
        action() {
          if (typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate('clientes');
          window.dispatchEvent(new CustomEvent('tbo:create', { detail: { type: 'contato' } }));
        }
      }
    ];

    createCommands.forEach(c => {
      c.category = 'Criar';
      TBO_COMMAND_REGISTRY.register(c);
    });

    // ── Ações rápidas ──
    const quickActions = [
      {
        id: 'action:theme',
        label: 'Alternar tema escuro',
        icon: 'moon',
        keywords: ['tema', 'dark', 'mode', 'escuro', 'claro'],
        action() {
          document.body.classList.toggle('dark-mode');
          const isDark = document.body.classList.contains('dark-mode');
          localStorage.setItem('tbo_theme', isDark ? 'dark' : 'light');
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.info('Tema', isDark ? 'Modo escuro ativado' : 'Modo claro ativado');
          }
        }
      },
      {
        id: 'action:sidebar-toggle',
        label: 'Recolher/Expandir sidebar',
        icon: 'panel-left-close',
        keywords: ['sidebar', 'menu', 'recolher', 'expandir'],
        action() {
          const sidebar = document.getElementById('sidebar');
          if (sidebar) sidebar.classList.toggle('collapsed');
        }
      },
      {
        id: 'action:fullscreen',
        label: 'Tela cheia',
        icon: 'maximize',
        keywords: ['fullscreen', 'tela', 'cheia', 'maximizar'],
        action() {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
      },
      {
        id: 'action:reload',
        label: 'Recarregar dados',
        icon: 'refresh-cw',
        keywords: ['reload', 'refresh', 'recarregar', 'atualizar'],
        action() {
          window.dispatchEvent(new CustomEvent('tbo:reload'));
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.info('Atualizar', 'Recarregando dados...');
          }
        }
      }
    ];

    quickActions.forEach(c => {
      c.category = 'Ações';
      TBO_COMMAND_REGISTRY.register(c);
    });

    console.log(`[Commands] ${TBO_COMMAND_REGISTRY.count} comandos registrados`);
  }

  // Registrar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _registerDefaultCommands);
  } else {
    // Aguardar próximo tick para garantir que registros estejam prontos
    setTimeout(_registerDefaultCommands, 0);
  }
})();
