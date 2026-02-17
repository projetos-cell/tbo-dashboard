// TBO OS — Placeholder Module
// Generic "Em desenvolvimento" page for routes not yet implemented.
const TBO_PLACEHOLDER = {
  _currentRoute: '',

  _labels: {
    'timeline': 'Timeline',
    'alerts': 'Alertas',
    'pipeline': 'Pipeline',
    'clientes': 'Clientes',
    'contratos': 'Contratos',
    'entregas': 'Entregas',
    'tarefas': 'Tarefas Globais',
    'revisoes': 'Revisoes',
    'entregas-pendentes': 'Entregas Pendentes',
    'revisoes-pendentes': 'Revisoes Pendentes',
    'decisoes': 'Decisoes',
    'biblioteca': 'Biblioteca',
    'carga-trabalho': 'Carga de Trabalho',
    'timesheets': 'Timesheets',
    'capacidade': 'Capacidade',
    'pagar': 'Contas a Pagar',
    'receber': 'Contas a Receber',
    'margens': 'Margens',
    'conciliacao': 'Conciliacao',
    'templates': 'Templates',
    'permissoes-config': 'Permissoes',
    'integracoes': 'Integracoes'
  },

  _descriptions: {
    'timeline': 'Visualize a linha do tempo dos projetos e marcos importantes.',
    'alerts': 'Central de alertas e notificacoes do sistema.',
    'pipeline': 'Funil de vendas e oportunidades importadas do CRM.',
    'clientes': 'Cadastro e historico de clientes e construtoras.',
    'contratos': 'Gestao de contratos, aditivos e vencimentos.',
    'entregas': 'Acompanhamento global de entregas por projeto.',
    'tarefas': 'Visao consolidada de todas as tarefas da equipe.',
    'revisoes': 'Ciclos de revisao e aprovacao de entregaveis.',
    'entregas-pendentes': 'Entregas aguardando conclusao ou envio.',
    'revisoes-pendentes': 'Revisoes aguardando feedback do cliente.',
    'decisoes': 'Registro e acompanhamento de decisoes de reunioes.',
    'biblioteca': 'Playbooks, templates e base de conhecimento.',
    'carga-trabalho': 'Visualizacao de carga por pessoa vs capacidade.',
    'timesheets': 'Lancamentos de horas e apontamentos por pessoa.',
    'capacidade': 'Configuracao e forecast de capacidade da equipe.',
    'pagar': 'Contas a pagar, fornecedores e vencimentos.',
    'receber': 'Contas a receber, faturamento e inadimplencia.',
    'margens': 'Analise de margem real por projeto e BU.',
    'conciliacao': 'Conciliacao bancaria e fluxo de caixa.',
    'templates': 'Templates de projetos, propostas e documentos.',
    'permissoes-config': 'Configuracao de permissoes e roles do sistema.',
    'integracoes': 'Conexoes com servicos externos (Drive, Fireflies, etc).'
  },

  render() {
    const label = this._labels[this._currentRoute] || this._currentRoute;
    const desc = this._descriptions[this._currentRoute] || 'Funcionalidade prevista para proximas versoes do TBO OS.';

    return `
      <div class="placeholder-page">
        <div class="placeholder-banner">
          <span class="placeholder-icon" aria-hidden="true">&#x1F6A7;</span>
          <h2 style="margin:0 0 8px;font-size:1.2rem;font-weight:700;color:var(--text-primary);">${label}</h2>
          <p style="margin:0 0 12px;font-size:0.9rem;color:var(--text-secondary);">Em desenvolvimento</p>
          <p style="margin:0;font-size:0.78rem;color:var(--text-muted);line-height:1.5;">${desc}</p>
          <div style="margin-top:20px;display:flex;gap:8px;justify-content:center;">
            <button class="btn btn-secondary" onclick="history.back()" style="font-size:0.78rem;">&#8592; Voltar</button>
            <button class="btn btn-primary" onclick="TBO_ROUTER.navigate('command-center')" style="font-size:0.78rem;">Dashboard</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // No events to bind for placeholders
  }
};
