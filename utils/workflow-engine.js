// ============================================================================
// TBO OS — Workflow Engine
// Templates de fluxo de trabalho, conectores entre modulos, automacoes
// ============================================================================

const TBO_WORKFLOW = {

  // ══════════════════════════════════════════════════════════════════════
  // TEMPLATES DE FLUXO DE TRABALHO
  // ══════════════════════════════════════════════════════════════════════
  _templates: {
    'projeto-digital': {
      name: 'Projeto Digital',
      icon: 'monitor',
      description: 'Website, landing page ou plataforma digital',
      color: '#3498db',
      tasks: [
        { title: 'Briefing com cliente', status: 'pendente', estimate: 60 },
        { title: 'Pesquisa de referencias', status: 'pendente', estimate: 120 },
        { title: 'Wireframe', status: 'pendente', estimate: 240 },
        { title: 'Design UI', status: 'pendente', estimate: 480 },
        { title: 'Prototipo interativo', status: 'pendente', estimate: 180 },
        { title: 'Apresentacao ao cliente', status: 'pendente', estimate: 60 },
        { title: 'Ajustes pos-apresentacao', status: 'pendente', estimate: 120 },
        { title: 'Entrega final', status: 'pendente', estimate: 60 }
      ],
      deliverables: [
        { name: 'Wireframe aprovado', status: 'pendente' },
        { name: 'Layout final', status: 'pendente' },
        { name: 'Prototipo Figma', status: 'pendente' },
        { name: 'Assets exportados', status: 'pendente' }
      ]
    },
    'branding': {
      name: 'Branding',
      icon: 'palette',
      description: 'Identidade visual completa para marca',
      color: '#e74c3c',
      tasks: [
        { title: 'Imersao e briefing estrategico', status: 'pendente', estimate: 120 },
        { title: 'Pesquisa de mercado e concorrentes', status: 'pendente', estimate: 180 },
        { title: 'Moodboard e conceitos', status: 'pendente', estimate: 120 },
        { title: 'Desenvolvimento de logotipo', status: 'pendente', estimate: 480 },
        { title: 'Sistema de cores e tipografia', status: 'pendente', estimate: 120 },
        { title: 'Aplicacoes (papelaria, digital)', status: 'pendente', estimate: 360 },
        { title: 'Manual de identidade visual', status: 'pendente', estimate: 240 },
        { title: 'Apresentacao final', status: 'pendente', estimate: 60 }
      ],
      deliverables: [
        { name: 'Moodboard aprovado', status: 'pendente' },
        { name: 'Logotipo final (arquivos)', status: 'pendente' },
        { name: 'Manual de marca (PDF)', status: 'pendente' },
        { name: 'Templates de aplicacao', status: 'pendente' }
      ]
    },
    'campanha': {
      name: 'Campanha de Marketing',
      icon: 'megaphone',
      description: 'Campanha publicitaria ou de conteudo',
      color: '#f39c12',
      tasks: [
        { title: 'Planejamento estrategico', status: 'pendente', estimate: 120 },
        { title: 'Definicao de KPIs e metas', status: 'pendente', estimate: 60 },
        { title: 'Criacao de conteudo', status: 'pendente', estimate: 360 },
        { title: 'Design de pecas', status: 'pendente', estimate: 240 },
        { title: 'Revisao e aprovacao', status: 'pendente', estimate: 60 },
        { title: 'Publicacao e lancamento', status: 'pendente', estimate: 60 },
        { title: 'Monitoramento de performance', status: 'pendente', estimate: 120 },
        { title: 'Relatorio de resultados', status: 'pendente', estimate: 90 }
      ],
      deliverables: [
        { name: 'Plano de campanha', status: 'pendente' },
        { name: 'Pecas criativas finais', status: 'pendente' },
        { name: 'Relatorio de performance', status: 'pendente' }
      ]
    },
    'audiovisual': {
      name: 'Projeto Audiovisual',
      icon: 'video',
      description: 'Video institucional, animacao ou 3D',
      color: '#9b59b6',
      tasks: [
        { title: 'Briefing e roteiro', status: 'pendente', estimate: 120 },
        { title: 'Storyboard', status: 'pendente', estimate: 180 },
        { title: 'Producao / Captacao', status: 'pendente', estimate: 480 },
        { title: 'Edicao e montagem', status: 'pendente', estimate: 360 },
        { title: 'Motion graphics / VFX', status: 'pendente', estimate: 240 },
        { title: 'Color grading e finalizacao', status: 'pendente', estimate: 120 },
        { title: 'Revisao e ajustes', status: 'pendente', estimate: 120 },
        { title: 'Entrega final', status: 'pendente', estimate: 60 }
      ],
      deliverables: [
        { name: 'Roteiro aprovado', status: 'pendente' },
        { name: 'Storyboard', status: 'pendente' },
        { name: 'Video final (MP4)', status: 'pendente' },
        { name: 'Versoes para redes sociais', status: 'pendente' }
      ]
    },
    'interiores': {
      name: 'Projeto de Interiores',
      icon: 'sofa',
      description: 'Design de espacos e ambientes',
      color: '#1abc9c',
      tasks: [
        { title: 'Levantamento e medidas', status: 'pendente', estimate: 120 },
        { title: 'Programa de necessidades', status: 'pendente', estimate: 90 },
        { title: 'Conceito e moodboard', status: 'pendente', estimate: 120 },
        { title: 'Estudo preliminar (layout)', status: 'pendente', estimate: 240 },
        { title: 'Projeto executivo (3D)', status: 'pendente', estimate: 480 },
        { title: 'Detalhamento tecnico', status: 'pendente', estimate: 360 },
        { title: 'Orcamento e especificacoes', status: 'pendente', estimate: 180 },
        { title: 'Acompanhamento de obra', status: 'pendente', estimate: 480 }
      ],
      deliverables: [
        { name: 'Layout aprovado', status: 'pendente' },
        { name: 'Renders 3D', status: 'pendente' },
        { name: 'Projeto executivo (DWG/PDF)', status: 'pendente' },
        { name: 'Caderno de especificacoes', status: 'pendente' }
      ]
    }
  },

  getTemplates() {
    return Object.entries(this._templates).map(([id, t]) => ({ id, ...t }));
  },

  getTemplate(id) {
    return this._templates[id] || null;
  },

  // Renderiza modal de selecao de template
  renderTemplateSelector(onSelect) {
    const templates = this.getTemplates();
    const html = `
      <div class="tbo-template-selector" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
        ${templates.map(t => `
          <div class="card tbo-template-card" data-template="${t.id}" style="cursor:pointer;padding:16px;border:2px solid transparent;transition:all 200ms;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <div style="width:32px;height:32px;border-radius:8px;background:${t.color}20;display:flex;align-items:center;justify-content:center;">
                <i data-lucide="${t.icon}" style="width:16px;height:16px;color:${t.color};"></i>
              </div>
              <strong style="font-size:0.85rem;">${t.name}</strong>
            </div>
            <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 8px;">${t.description}</p>
            <div style="font-size:0.68rem;color:var(--text-secondary);">
              ${t.tasks.length} tarefas · ${t.deliverables.length} entregas · ~${Math.round(t.tasks.reduce((s, tk) => s + tk.estimate, 0) / 60)}h
            </div>
          </div>
        `).join('')}
        <div class="card tbo-template-card" data-template="blank" style="cursor:pointer;padding:16px;border:2px dashed var(--border-default);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:120px;">
          <i data-lucide="plus" style="width:24px;height:24px;color:var(--text-muted);margin-bottom:8px;"></i>
          <strong style="font-size:0.85rem;color:var(--text-muted);">Projeto em branco</strong>
        </div>
      </div>
    `;

    // Retornar HTML + bind function
    return {
      html,
      bind(container) {
        container.querySelectorAll('.tbo-template-card').forEach(card => {
          card.addEventListener('click', () => {
            container.querySelectorAll('.tbo-template-card').forEach(c => c.style.borderColor = 'transparent');
            card.style.borderColor = 'var(--brand-orange)';
            const templateId = card.dataset.template;
            if (onSelect) onSelect(templateId === 'blank' ? null : templateId);
          });
          card.addEventListener('mouseenter', () => {
            if (card.style.borderColor !== 'var(--brand-orange)') card.style.borderColor = 'var(--brand-orange-pale)';
          });
          card.addEventListener('mouseleave', () => {
            if (card.style.borderColor !== 'var(--brand-orange)') card.style.borderColor = 'transparent';
          });
        });
        if (window.lucide) lucide.createIcons();
      }
    };
  },

  // Aplicar template a um projeto
  applyTemplate(projectId, templateId) {
    const template = this._templates[templateId];
    if (!template || !projectId) return;

    // Criar tarefas a partir do template
    template.tasks.forEach((task, i) => {
      if (typeof TBO_STORAGE !== 'undefined') {
        TBO_STORAGE.addErpEntity('task', {
          project_id: projectId,
          title: task.title,
          status: task.status,
          estimate_minutes: task.estimate,
          order: i + 1
        });
      }
    });

    // Criar entregas
    template.deliverables.forEach((del, i) => {
      if (typeof TBO_STORAGE !== 'undefined') {
        TBO_STORAGE.addErpEntity('deliverable', {
          project_id: projectId,
          name: del.name,
          status: del.status,
          order: i + 1
        });
      }
    });

    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.success('Template aplicado', `${template.tasks.length} tarefas e ${template.deliverables.length} entregas criadas.`);
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // CONECTORES DE STATUS ENTRE MODULOS
  // ══════════════════════════════════════════════════════════════════════
  _connectors: {
    // Quando proposta e aprovada → criar projeto + contrato + tarefas
    'proposal_approved': {
      name: 'Proposta Aprovada → Projeto + Contrato',
      trigger: { entity: 'proposal', field: 'status', value: 'aprovada' },
      actions: [
        { type: 'create_project', data: { status: 'em_andamento' } },
        { type: 'notify', message: 'Proposta aprovada! Projeto criado automaticamente.' },
        { type: 'navigate', target: 'projetos' }
      ]
    },
    // Quando projeto concluido → notificar financeiro
    'project_completed': {
      name: 'Projeto Concluido → Notificar Financeiro',
      trigger: { entity: 'project', field: 'status', value: 'concluido' },
      actions: [
        { type: 'notify', message: 'Projeto concluido! Verificar faturamento pendente.' }
      ]
    },
    // Quando deal move para "Proposta Aceita" → criar proposta
    'deal_accepted': {
      name: 'Deal Aceito → Gerar Proposta',
      trigger: { entity: 'deal', field: 'stage', value: 'Proposta Aceita' },
      actions: [
        { type: 'create_proposal', data: { status: 'em_elaboracao' } },
        { type: 'notify', message: 'Deal aceito! Proposta gerada automaticamente.' }
      ]
    }
  },

  // Executar conector quando um status muda
  checkConnectors(entityType, entity, oldStatus, newStatus) {
    Object.entries(this._connectors).forEach(([id, connector]) => {
      const trigger = connector.trigger;
      if (trigger.entity !== entityType) return;
      if (trigger.value !== newStatus) return;

      console.log(`[TBO Workflow] Connector triggered: ${connector.name}`);

      connector.actions.forEach(action => {
        switch (action.type) {
          case 'create_project':
            if (typeof TBO_STORAGE !== 'undefined') {
              const projData = {
                name: entity.title || entity.name || 'Novo Projeto',
                client: entity.company || entity.client || '',
                status: action.data?.status || 'planejamento',
                source_entity: `${entityType}:${entity.id}`
              };
              TBO_STORAGE.addErpEntity('project', projData);
            }
            break;
          case 'create_proposal':
            if (typeof TBO_STORAGE !== 'undefined') {
              TBO_STORAGE.addErpEntity('proposal', {
                title: `Proposta - ${entity.name || entity.title || ''}`,
                value: entity.value || 0,
                status: action.data?.status || 'rascunho',
                source_deal: entity.id
              });
            }
            break;
          case 'notify':
            if (typeof TBO_TOAST !== 'undefined') {
              TBO_TOAST.info('Automacao', action.message);
            }
            break;
          case 'navigate':
            if (typeof TBO_ROUTER !== 'undefined') {
              setTimeout(() => TBO_ROUTER.navigate(action.target), 1000);
            }
            break;
        }
      });
    });
  },

  // Hook para interceptar updates — chamado pelo TBO_STORAGE
  hookEntityUpdate(entityType, entity, updates) {
    if (updates.status && entity.status !== updates.status) {
      this.checkConnectors(entityType, { ...entity, ...updates }, entity.status, updates.status);
    }
    if (updates.stage && entity.stage !== updates.stage) {
      this.checkConnectors(entityType, { ...entity, ...updates }, entity.stage, updates.stage);
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════════════
  init() {
    console.log('[TBO Workflow] Engine initialized with', Object.keys(this._connectors).length, 'connectors');
  }
};
