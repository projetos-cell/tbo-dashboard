// ============================================================================
// TBO OS — Project Management Enhancements
// Playbooks, Dependencies, Conflicts, Post-Mortem, Approvals, Sprints,
// Task Decomposition, Real-time Collaboration Presence
// ============================================================================

const TBO_PROJECT_ENHANCEMENTS = {

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PLAYBOOK AUTO-APPLY
  // Applies a structured playbook with tasks, deliverables and milestones
  // ═══════════════════════════════════════════════════════════════════════════

  _playbooks: {
    digital_3d: {
      name: 'Digital 3D',
      steps: [
        { title: 'Briefing',           dayOffset: 0,  type: 'task',        milestone: true  },
        { title: 'Moodboard',          dayOffset: 3,  type: 'task',        milestone: false },
        { title: 'Modelagem',          dayOffset: 10, type: 'task',        milestone: false },
        { title: 'Texturizacao',       dayOffset: 15, type: 'task',        milestone: false },
        { title: 'Iluminacao',         dayOffset: 18, type: 'task',        milestone: false },
        { title: 'Render Draft',       dayOffset: 22, type: 'task',        milestone: true  },
        { title: 'Revisao Cliente',    dayOffset: 25, type: 'task',        milestone: false },
        { title: 'Render Final',       dayOffset: 30, type: 'task',        milestone: true  },
        { title: 'Pos-producao',       dayOffset: 33, type: 'task',        milestone: false },
        { title: 'Entrega',            dayOffset: 35, type: 'task',        milestone: true  }
      ],
      deliverables: ['Imagens Externas', 'Imagens Internas', 'Implantacao'],
      defaultDependencies: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]]
    },
    branding: {
      name: 'Branding',
      steps: [
        { title: 'Pesquisa',           dayOffset: 0,  type: 'task',        milestone: true  },
        { title: 'Moodboard',          dayOffset: 5,  type: 'task',        milestone: false },
        { title: 'Conceito',           dayOffset: 10, type: 'task',        milestone: true  },
        { title: 'Apresentacao',       dayOffset: 15, type: 'task',        milestone: false },
        { title: 'Refinamento',        dayOffset: 20, type: 'task',        milestone: false },
        { title: 'Manual de Marca',    dayOffset: 30, type: 'task',        milestone: true  },
        { title: 'Templates',          dayOffset: 35, type: 'task',        milestone: false },
        { title: 'Entrega Final',      dayOffset: 40, type: 'task',        milestone: true  }
      ],
      deliverables: ['Manual de Marca', 'Logo (formatos)', 'Guia de Aplicacao', 'Templates de Papelaria'],
      defaultDependencies: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]
    },
    marketing: {
      name: 'Marketing',
      steps: [
        { title: 'Planejamento',       dayOffset: 0,  type: 'task',        milestone: true  },
        { title: 'Conteudo',           dayOffset: 7,  type: 'task',        milestone: false },
        { title: 'Design',             dayOffset: 14, type: 'task',        milestone: false },
        { title: 'Aprovacao',          dayOffset: 18, type: 'task',        milestone: true  },
        { title: 'Producao',           dayOffset: 21, type: 'task',        milestone: false },
        { title: 'Revisao',            dayOffset: 25, type: 'task',        milestone: false },
        { title: 'Publicacao',         dayOffset: 28, type: 'task',        milestone: true  }
      ],
      deliverables: ['Plano de Marketing', 'Kit de Criativos', 'Relatorio de Resultados'],
      defaultDependencies: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]
    },
    launch_campaign: {
      name: 'Campanha de Lancamento',
      steps: [
        { title: 'Briefing',           dayOffset: 0,  type: 'task',        milestone: true  },
        { title: 'Conceito Criativo',  dayOffset: 7,  type: 'task',        milestone: false },
        { title: 'Key Visual',         dayOffset: 14, type: 'task',        milestone: true  },
        { title: 'Renders',            dayOffset: 28, type: 'task',        milestone: false },
        { title: 'Video',              dayOffset: 35, type: 'task',        milestone: false },
        { title: 'Pack Digital',       dayOffset: 42, type: 'task',        milestone: true  },
        { title: 'Material PDV',       dayOffset: 49, type: 'task',        milestone: false },
        { title: 'Entrega Completa',   dayOffset: 56, type: 'task',        milestone: true  }
      ],
      deliverables: ['Key Visual', 'Video Campanha', 'Pack Digital', 'Material PDV', 'Plano de Midia'],
      defaultDependencies: [[0,1],[1,2],[2,3],[2,4],[3,5],[4,5],[5,6],[6,7]]
    }
  },

  applyPlaybook(projectId, playbookType) {
    try {
      const playbook = this._playbooks[playbookType];
      if (!playbook) return { error: `Playbook "${playbookType}" nao encontrado. Disponiveis: ${Object.keys(this._playbooks).join(', ')}` };

      const project = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.getErpEntity('project', projectId) : null;
      if (!project) return { error: 'Projeto nao encontrado' };

      const baseDate = new Date();
      const tasksCreated = [];
      const deliverablesCreated = [];
      const milestonesCreated = [];

      // Create tasks from playbook steps
      playbook.steps.forEach((step, idx) => {
        const dueDate = new Date(baseDate);
        dueDate.setDate(dueDate.getDate() + step.dayOffset);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        const task = TBO_STORAGE.addErpEntity('task', {
          title: step.title,
          project_id: projectId,
          project_name: project.name,
          owner: project.owner || '',
          status: 'pendente',
          priority: idx === 0 ? 'alta' : 'media',
          due_date: dueDateStr,
          start_date: idx === 0 ? dueDateStr : undefined,
          phase: step.title,
          order: idx * 10,
          source: 'playbook',
          playbook_type: playbookType,
          is_milestone: step.milestone
        });

        if (task) {
          tasksCreated.push(task);
          if (step.milestone) {
            milestonesCreated.push({ taskId: task.id, title: step.title, date: dueDateStr });
          }
        }
      });

      // Create deliverables
      (playbook.deliverables || []).forEach(name => {
        const deliv = TBO_STORAGE.addErpEntity('deliverable', {
          name: name,
          project_id: projectId,
          project_name: project.name,
          status: 'pendente',
          owner: project.owner || '',
          versions: [],
          current_version: null,
          source: 'playbook',
          playbook_type: playbookType
        });
        if (deliv) deliverablesCreated.push(deliv);
      });

      // Store dependency map in project metadata
      if (playbook.defaultDependencies && tasksCreated.length > 0) {
        const depMap = playbook.defaultDependencies.map(([fromIdx, toIdx]) => ({
          from: tasksCreated[fromIdx] ? tasksCreated[fromIdx].id : null,
          to: tasksCreated[toIdx] ? tasksCreated[toIdx].id : null,
          type: 'blocks'
        })).filter(d => d.from && d.to);

        TBO_STORAGE.updateErpEntity('project', projectId, {
          playbook: playbookType,
          playbook_name: playbook.name,
          dependency_map: depMap
        });
      }

      return { tasksCreated, deliverablesCreated, milestonesCreated };
    } catch (e) {
      console.warn('[TBO Enhancements] applyPlaybook error:', e);
      return { error: e.message, tasksCreated: [], deliverablesCreated: [], milestonesCreated: [] };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DEPENDENCY GRAPH BUILDER
  // Builds a graph of task dependencies and calculates critical path
  // ═══════════════════════════════════════════════════════════════════════════

  buildDependencyGraph(projectId) {
    try {
      const project = TBO_STORAGE.getErpEntity('project', projectId);
      if (!project) return { nodes: [], edges: [], criticalPath: [] };

      const tasks = TBO_STORAGE.getErpEntitiesByParent('task', projectId);
      if (tasks.length === 0) return { nodes: [], edges: [], criticalPath: [] };

      const nodes = tasks.map(t => ({
        id: t.id,
        name: t.title || t.name || 'Sem titulo',
        status: t.status,
        dates: { start: t.start_date || t.createdAt, end: t.due_date || null },
        owner: t.owner || '',
        estimateMinutes: t.estimate_minutes || 0,
        isMilestone: !!t.is_milestone
      }));

      // Edges from project dependency_map
      const depMap = project.dependency_map || [];
      const edges = depMap.map(d => ({
        from: d.from,
        to: d.to,
        type: d.type || 'blocks'
      }));

      // Calculate critical path (longest path by day offset)
      const criticalPath = this._calculateCriticalPath(nodes, edges);

      return { nodes, edges, criticalPath };
    } catch (e) {
      console.warn('[TBO Enhancements] buildDependencyGraph error:', e);
      return { nodes: [], edges: [], criticalPath: [] };
    }
  },

  _calculateCriticalPath(nodes, edges) {
    if (nodes.length === 0) return [];

    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    // Build adjacency list
    const adj = {};
    const inDegree = {};
    nodes.forEach(n => { adj[n.id] = []; inDegree[n.id] = 0; });
    edges.filter(e => e.type === 'blocks').forEach(e => {
      if (adj[e.from] && nodeMap[e.to]) {
        adj[e.from].push(e.to);
        inDegree[e.to] = (inDegree[e.to] || 0) + 1;
      }
    });

    // Topological sort + longest path
    const dist = {};
    const prev = {};
    nodes.forEach(n => { dist[n.id] = 0; prev[n.id] = null; });

    // Find start nodes (in-degree 0)
    const queue = nodes.filter(n => (inDegree[n.id] || 0) === 0).map(n => n.id);
    const sorted = [];

    while (queue.length > 0) {
      const curr = queue.shift();
      sorted.push(curr);
      (adj[curr] || []).forEach(next => {
        inDegree[next]--;
        if (inDegree[next] === 0) queue.push(next);
        const endDate = nodeMap[curr].dates.end;
        const weight = endDate ? Math.max(1, Math.ceil((new Date(endDate) - new Date(nodeMap[curr].dates.start || endDate)) / 86400000)) : 1;
        if (dist[curr] + weight > dist[next]) {
          dist[next] = dist[curr] + weight;
          prev[next] = curr;
        }
      });
    }

    // Find the node with the maximum distance
    let maxNode = sorted[0];
    let maxDist = 0;
    sorted.forEach(id => {
      if (dist[id] > maxDist) { maxDist = dist[id]; maxNode = id; }
    });

    // Trace back the critical path
    const path = [];
    let current = maxNode;
    while (current) {
      path.unshift(current);
      current = prev[current];
    }

    return path;
  },

  getDependencyImpact(taskId) {
    try {
      const task = TBO_STORAGE.getErpEntity('task', taskId);
      if (!task) return { blocked: [], delayDays: 0, affectedDeliverables: [] };

      const projectId = task.project_id;
      if (!projectId) return { blocked: [], delayDays: 0, affectedDeliverables: [] };

      const project = TBO_STORAGE.getErpEntity('project', projectId);
      const depMap = project ? (project.dependency_map || []) : [];

      // Find all tasks that depend on this one (direct + transitive)
      const blocked = [];
      const visited = new Set();
      const findDependents = (id) => {
        depMap.filter(d => d.from === id && d.type === 'blocks').forEach(d => {
          if (!visited.has(d.to)) {
            visited.add(d.to);
            const depTask = TBO_STORAGE.getErpEntity('task', d.to);
            if (depTask) blocked.push(depTask);
            findDependents(d.to);
          }
        });
      };
      findDependents(taskId);

      // Calculate delay days
      let delayDays = 0;
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const now = new Date();
        if (now > dueDate) {
          delayDays = Math.ceil((now - dueDate) / 86400000);
        }
      }

      // Affected deliverables
      const deliverables = TBO_STORAGE.getErpEntitiesByParent('deliverable', projectId);
      const affectedDeliverables = deliverables.filter(d =>
        d.status !== 'entregue' && d.status !== 'aprovado'
      );

      return { blocked, delayDays, affectedDeliverables };
    } catch (e) {
      console.warn('[TBO Enhancements] getDependencyImpact error:', e);
      return { blocked: [], delayDays: 0, affectedDeliverables: [] };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. RESOURCE CONFLICT DETECTOR
  // Detects overlapping task assignments for same person
  // ═══════════════════════════════════════════════════════════════════════════

  _conflictIdCounter: 0,

  detectConflicts(dateRange) {
    try {
      const tasks = TBO_STORAGE.getAllErpEntities('task').filter(t =>
        t.status !== 'concluida' && t.status !== 'cancelada' && t.owner && t.due_date
      );

      const fromDate = dateRange ? dateRange.from : null;
      const toDate = dateRange ? dateRange.to : null;

      // Group tasks by owner
      const byOwner = {};
      tasks.forEach(t => {
        const start = t.start_date || t.createdAt?.split('T')[0] || t.due_date;
        const end = t.due_date;
        if (fromDate && end < fromDate) return;
        if (toDate && start > toDate) return;
        if (!byOwner[t.owner]) byOwner[t.owner] = [];
        byOwner[t.owner].push({ ...t, _start: start, _end: end });
      });

      const results = [];

      Object.entries(byOwner).forEach(([person, personTasks]) => {
        if (personTasks.length < 2) return;

        const conflicts = [];
        for (let i = 0; i < personTasks.length; i++) {
          for (let j = i + 1; j < personTasks.length; j++) {
            const t1 = personTasks[i];
            const t2 = personTasks[j];

            const overlapStart = t1._start > t2._start ? t1._start : t2._start;
            const overlapEnd = t1._end < t2._end ? t1._end : t2._end;

            if (overlapStart <= overlapEnd) {
              const overlapDays = Math.max(1, Math.ceil((new Date(overlapEnd) - new Date(overlapStart)) / 86400000) + 1);
              const t1Duration = Math.max(1, Math.ceil((new Date(t1._end) - new Date(t1._start)) / 86400000) + 1);
              const overlapPct = Math.round((overlapDays / t1Duration) * 100);

              let severity = 'baixa';
              if (overlapPct > 75) severity = 'critica';
              else if (overlapPct > 40) severity = 'alta';
              else if (overlapPct > 20) severity = 'media';

              this._conflictIdCounter++;
              conflicts.push({
                id: 'conflict_' + this._conflictIdCounter,
                task1: { id: t1.id, title: t1.title, start: t1._start, end: t1._end, project: t1.project_name },
                task2: { id: t2.id, title: t2.title, start: t2._start, end: t2._end, project: t2.project_name },
                overlapDays,
                severity
              });
            }
          }
        }

        if (conflicts.length > 0) {
          // Build suggestion based on severity
          const criticalCount = conflicts.filter(c => c.severity === 'critica' || c.severity === 'alta').length;
          let suggestion = `${person} tem ${conflicts.length} conflito(s) de agenda`;
          if (criticalCount > 0) suggestion += `. ${criticalCount} com severidade alta/critica — considere redistribuir tarefas`;

          results.push({ person, conflicts, suggestion });
        }
      });

      return results;
    } catch (e) {
      console.warn('[TBO Enhancements] detectConflicts error:', e);
      return [];
    }
  },

  resolveConflictSuggestion(conflictId) {
    // Generate resolution options based on conflict data
    try {
      // Find the conflict across all results
      const allConflicts = this.detectConflicts();
      let targetConflict = null;
      let person = null;
      allConflicts.forEach(result => {
        const found = result.conflicts.find(c => c.id === conflictId);
        if (found) { targetConflict = found; person = result.person; }
      });

      if (!targetConflict) return { error: 'Conflito nao encontrado' };

      const t1Title = targetConflict.task1.title;
      const t2Title = targetConflict.task2.title;
      const days = targetConflict.overlapDays;

      // Check team availability if TBO_WORKLOAD is available
      let alternativePerson = null;
      if (typeof TBO_WORKLOAD !== 'undefined') {
        try {
          const teamUtil = TBO_WORKLOAD.getTeamUtilization();
          const available = teamUtil.filter(u => u.userName !== person && u.utilization_pct < 70);
          if (available.length > 0) {
            alternativePerson = available[0].userName;
          }
        } catch (_) { /* ignore */ }
      }

      return {
        option1: `Adiar "${t2Title}" em ${days + 2} dias para eliminar sobreposicao`,
        option2: alternativePerson
          ? `Reatribuir "${t2Title}" para ${alternativePerson} (menor carga atual)`
          : `Reatribuir "${t2Title}" para outro membro da equipe`,
        option3: `Dividir "${t1Title}" em subtarefas menores para paralelizar`
      };
    } catch (e) {
      return { error: e.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. PROJECT POST-MORTEM GENERATOR
  // Comprehensive analysis of completed or active projects
  // ═══════════════════════════════════════════════════════════════════════════

  generatePostMortem(projectId) {
    try {
      const project = TBO_STORAGE.getErpEntity('project', projectId);
      if (!project) return { error: 'Projeto nao encontrado' };

      const tasks = TBO_STORAGE.getErpEntitiesByParent('task', projectId);
      const deliverables = TBO_STORAGE.getErpEntitiesByParent('deliverable', projectId);
      const timeEntries = typeof TBO_WORKLOAD !== 'undefined'
        ? TBO_WORKLOAD.getTimeEntries({ projectId })
        : TBO_STORAGE.getAllErpEntities('time_entry').filter(e => e.project_id === projectId);

      // Calculate metrics
      const createdDate = new Date(project.createdAt || new Date());
      const endDate = project.status === 'finalizado'
        ? new Date(project.updatedAt || new Date())
        : new Date();
      const totalDays = Math.max(1, Math.ceil((endDate - createdDate) / 86400000));

      // Planned days from task dates
      const taskDates = tasks.map(t => t.due_date).filter(Boolean).sort();
      let plannedDays = totalDays;
      if (taskDates.length >= 2) {
        plannedDays = Math.max(1, Math.ceil((new Date(taskDates[taskDates.length - 1]) - new Date(taskDates[0])) / 86400000));
      }

      const delayDays = Math.max(0, totalDays - plannedDays);

      // Revision count from deliverable versions
      let totalRevisions = 0;
      deliverables.forEach(d => {
        totalRevisions += (d.versions || []).length;
      });

      // Hours
      const hoursLogged = timeEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      const hoursEstimated = tasks.reduce((s, t) => s + (t.estimate_minutes || 0), 0);

      // Health score average
      let healthScoreAvg = 0;
      if (typeof TBO_ERP !== 'undefined') {
        healthScoreAvg = TBO_ERP.calculateHealthScore(project).score;
      }

      const metrics = {
        totalDays,
        plannedDays,
        delayDays,
        totalRevisions,
        hoursLogged,
        hoursEstimated,
        healthScoreAvg,
        deliverableCount: deliverables.length
      };

      // Identify bottlenecks (phase that took longest)
      const phaseTimeMap = {};
      tasks.forEach(t => {
        const phase = t.phase || t.title || 'Sem fase';
        if (!phaseTimeMap[phase]) phaseTimeMap[phase] = 0;
        const tEntries = timeEntries.filter(e => e.task_id === t.id);
        phaseTimeMap[phase] += tEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      });

      const bottleneck = Object.entries(phaseTimeMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 1)
        .map(([phase, mins]) => `${phase} (${Math.round(mins / 60)}h)`);

      // Generate lessons learned
      const lessons = [];
      if (delayDays > 5) {
        lessons.push(`Projeto atrasou ${delayDays} dias em relacao ao planejado. Considere buffers maiores nas estimativas.`);
      }
      if (totalRevisions > deliverables.length * 3) {
        lessons.push(`Alto numero de revisoes (${totalRevisions}). Avaliar alinhamento de briefing e checkpoints intermediarios.`);
      }
      if (hoursEstimated > 0 && hoursLogged > hoursEstimated * 1.3) {
        lessons.push(`Horas reais excederam estimativa em ${Math.round(((hoursLogged - hoursEstimated) / hoursEstimated) * 100)}%. Refinar modelo de estimativas.`);
      }
      if (hoursEstimated === 0) {
        lessons.push('Nenhuma estimativa de horas foi definida. Implementar estimativas desde o inicio do projeto.');
      }
      if (bottleneck.length > 0) {
        lessons.push(`Fase com maior consumo de tempo: ${bottleneck[0]}. Analisar se e possivel otimizar.`);
      }
      if (lessons.length === 0) {
        lessons.push('Projeto dentro dos parametros esperados. Manter as boas praticas aplicadas.');
      }

      // Benchmark comparison against other completed projects
      const allProjects = TBO_STORAGE.getAllErpEntities('project').filter(p => p.status === 'finalizado' && p.id !== projectId);
      let vsBenchmark = 'Sem dados de benchmark (nenhum projeto finalizado para comparacao)';
      if (allProjects.length >= 2) {
        const avgDays = allProjects.reduce((s, p) => {
          const dur = Math.ceil((new Date(p.updatedAt || p.createdAt) - new Date(p.createdAt)) / 86400000);
          return s + dur;
        }, 0) / allProjects.length;

        if (totalDays < avgDays * 0.8) vsBenchmark = `Mais rapido que a media (${totalDays}d vs media ${Math.round(avgDays)}d)`;
        else if (totalDays > avgDays * 1.2) vsBenchmark = `Mais lento que a media (${totalDays}d vs media ${Math.round(avgDays)}d)`;
        else vsBenchmark = `Dentro da media (${totalDays}d vs media ${Math.round(avgDays)}d)`;
      }

      // Summary
      const statusLabel = project.status === 'finalizado' ? 'Finalizado' : 'Em andamento';
      const summary = `Post-mortem do projeto "${project.name}" (${statusLabel}). Duracao: ${totalDays} dias, ${deliverables.length} entregaveis, ${totalRevisions} revisoes, ${Math.round(hoursLogged / 60)}h registradas.`;

      return { summary, metrics, lessons, comparison: { vsBenchmark } };
    } catch (e) {
      console.warn('[TBO Enhancements] generatePostMortem error:', e);
      return { error: e.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CLIENT APPROVAL TRACKER
  // Scans deliverables in review and groups by client
  // ═══════════════════════════════════════════════════════════════════════════

  getPendingApprovals() {
    try {
      const deliverables = TBO_STORAGE.getAllErpEntities('deliverable').filter(d => d.status === 'em_revisao');
      if (deliverables.length === 0) return [];

      const byClient = {};

      deliverables.forEach(d => {
        const project = d.project_id ? TBO_STORAGE.getErpEntity('project', d.project_id) : null;
        const clientName = project ? (project.client || project.client_company || 'Cliente nao definido') : 'Cliente nao definido';
        const projectName = project ? project.name : (d.project_name || 'Projeto desconhecido');

        const daysPending = Math.max(0, Math.ceil((Date.now() - new Date(d.updatedAt || d.createdAt).getTime()) / 86400000));
        let urgency = 'normal';
        if (daysPending > 7) urgency = 'critica';
        else if (daysPending > 3) urgency = 'alta';

        if (!byClient[clientName]) byClient[clientName] = { clientName, deliverables: [], totalPending: 0 };
        byClient[clientName].deliverables.push({
          name: d.name,
          daysPending,
          project: projectName,
          urgency,
          deliverableId: d.id
        });
        byClient[clientName].totalPending++;
      });

      return Object.values(byClient).sort((a, b) => b.totalPending - a.totalPending);
    } catch (e) {
      console.warn('[TBO Enhancements] getPendingApprovals error:', e);
      return [];
    }
  },

  generateApprovalReminder(clientName) {
    try {
      const approvals = this.getPendingApprovals();
      const clientData = approvals.find(a => a.clientName === clientName);
      if (!clientData) return { error: 'Nenhuma aprovacao pendente para este cliente' };

      const deliverablesList = clientData.deliverables.map(d =>
        `  - ${d.name} (projeto: ${d.project}) — aguardando ha ${d.daysPending} dia(s)`
      ).join('\n');

      const subject = `TBO | Aprovacoes pendentes — ${clientData.totalPending} item(ns) aguardando seu retorno`;

      const body = `Prezado(a) ${clientName},

Esperamos que esteja bem!

Gostaríamos de lembrar que existem ${clientData.totalPending} entregavel(is) aguardando sua aprovacao:

${deliverablesList}

Seu retorno e muito importante para mantermos o cronograma do projeto em dia. Caso precise de mais tempo ou tenha alguma duvida sobre os materiais, estamos a disposicao.

Agradecemos a atencao!

Atenciosamente,
Equipe TBO`;

      return { subject, body };
    } catch (e) {
      return { error: e.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SPRINT PLANNING
  // Weekly sprints with velocity tracking
  // ═══════════════════════════════════════════════════════════════════════════

  _sprintsKey: 'tbo_sprints',

  _getSprints() {
    try {
      const raw = localStorage.getItem(this._sprintsKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  _saveSprints(sprints) {
    try {
      localStorage.setItem(this._sprintsKey, JSON.stringify(sprints));
    } catch (e) {
      console.warn('[TBO Enhancements] Falha ao salvar sprints:', e);
    }
  },

  createSprint(weekStart, taskIds) {
    try {
      if (!weekStart) return { error: 'Data de inicio da semana obrigatoria' };
      taskIds = taskIds || [];

      const ws = new Date(weekStart);
      const we = new Date(ws);
      we.setDate(we.getDate() + 4); // Friday
      const weekEnd = we.toISOString().split('T')[0];

      // Get task details and calculate estimated hours
      const committedTasks = [];
      let totalEstimatedHours = 0;
      taskIds.forEach(tid => {
        const task = TBO_STORAGE.getErpEntity('task', tid);
        if (task) {
          committedTasks.push({
            id: task.id,
            title: task.title || task.name,
            owner: task.owner || '',
            estimateMinutes: task.estimate_minutes || 0,
            status: task.status,
            project: task.project_name || ''
          });
          totalEstimatedHours += (task.estimate_minutes || 0) / 60;
        }
      });

      // Team capacity for the week
      let capacity = 0;
      if (typeof TBO_WORKLOAD !== 'undefined') {
        const team = TBO_WORKLOAD._getTeamList();
        team.forEach(m => {
          capacity += TBO_WORKLOAD.getUserWeeklyHours(m.id);
        });
      }
      if (capacity === 0) capacity = 200; // Default 5 people * 40h

      const sprintId = 'sprint_' + Date.now().toString(36);
      const sprint = {
        id: sprintId,
        weekStart,
        weekEnd,
        committedTasks,
        totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
        capacity,
        createdAt: new Date().toISOString()
      };

      const sprints = this._getSprints();
      sprints.unshift(sprint);
      if (sprints.length > 52) sprints.pop(); // Keep up to 1 year
      this._saveSprints(sprints);

      return sprint;
    } catch (e) {
      return { error: e.message };
    }
  },

  getSprintMetrics(sprintId) {
    try {
      const sprints = this._getSprints();
      const sprint = sprints.find(s => s.id === sprintId);
      if (!sprint) return { error: 'Sprint nao encontrado' };

      const committed = sprint.committedTasks.length;
      let completed = 0;
      let hoursLogged = 0;

      sprint.committedTasks.forEach(ct => {
        const task = TBO_STORAGE.getErpEntity('task', ct.id);
        if (task && task.status === 'concluida') completed++;
      });

      // Hours logged during sprint week
      if (typeof TBO_WORKLOAD !== 'undefined') {
        const entries = TBO_WORKLOAD.getTimeEntries({
          dateFrom: sprint.weekStart,
          dateTo: sprint.weekEnd
        });
        hoursLogged = entries.reduce((s, e) => s + (e.duration_minutes || 0), 0) / 60;
      }

      const completionRate = committed > 0 ? Math.round((completed / committed) * 100) : 0;

      // Velocity: average tasks completed over last 4 sprints
      const recentSprints = sprints.slice(0, 4);
      let velocitySum = 0;
      let velocityCount = 0;
      recentSprints.forEach(s => {
        let cnt = 0;
        (s.committedTasks || []).forEach(ct => {
          const t = TBO_STORAGE.getErpEntity('task', ct.id);
          if (t && t.status === 'concluida') cnt++;
        });
        velocitySum += cnt;
        velocityCount++;
      });
      const velocity = velocityCount > 0 ? Math.round((velocitySum / velocityCount) * 10) / 10 : 0;

      return {
        committed,
        completed,
        completionRate,
        hoursLogged: Math.round(hoursLogged * 10) / 10,
        velocity
      };
    } catch (e) {
      return { error: e.message };
    }
  },

  getCurrentSprint() {
    try {
      const sprints = this._getSprints();
      if (sprints.length === 0) return null;

      const today = new Date().toISOString().split('T')[0];
      return sprints.find(s => s.weekStart <= today && s.weekEnd >= today) || null;
    } catch (e) {
      return null;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. AUTO TASK DECOMPOSITION (Template-based)
  // Pattern matches task titles to suggest subtask breakdowns
  // ═══════════════════════════════════════════════════════════════════════════

  _decompositionPatterns: {
    branding: {
      keywords: ['branding', 'marca', 'identidade visual', 'logo', 'naming'],
      subtasks: [
        { title: 'Briefing e imersao',              estimateHours: 4,  priority: 'alta',  order: 1 },
        { title: 'Pesquisa de mercado e referencias', estimateHours: 6,  priority: 'alta',  order: 2 },
        { title: 'Moodboard e direcao criativa',     estimateHours: 3,  priority: 'media', order: 3 },
        { title: 'Desenvolvimento de conceito',       estimateHours: 8,  priority: 'alta',  order: 4 },
        { title: 'Apresentacao ao cliente',           estimateHours: 2,  priority: 'media', order: 5 },
        { title: 'Refinamento e ajustes',             estimateHours: 4,  priority: 'media', order: 6 },
        { title: 'Finalizacao de arquivos',           estimateHours: 3,  priority: 'media', order: 7 }
      ]
    },
    render: {
      keywords: ['render', '3d', 'modelagem', 'visualizacao', 'imagem 3d'],
      subtasks: [
        { title: 'Recebimento e analise de plantas',  estimateHours: 2,  priority: 'alta',  order: 1 },
        { title: 'Modelagem 3D',                      estimateHours: 12, priority: 'alta',  order: 2 },
        { title: 'Aplicacao de materiais e texturas',  estimateHours: 6,  priority: 'media', order: 3 },
        { title: 'Setup de iluminacao',               estimateHours: 4,  priority: 'media', order: 4 },
        { title: 'Render de teste',                    estimateHours: 2,  priority: 'media', order: 5 },
        { title: 'Revisao interna',                   estimateHours: 1,  priority: 'media', order: 6 },
        { title: 'Render final em alta',              estimateHours: 3,  priority: 'alta',  order: 7 },
        { title: 'Pos-producao',                      estimateHours: 4,  priority: 'media', order: 8 }
      ]
    },
    video: {
      keywords: ['video', 'animacao', 'motion', 'filmagem', 'edicao de video'],
      subtasks: [
        { title: 'Roteiro e storyboard',              estimateHours: 4,  priority: 'alta',  order: 1 },
        { title: 'Captacao / animacao',               estimateHours: 8,  priority: 'alta',  order: 2 },
        { title: 'Edicao do corte',                   estimateHours: 6,  priority: 'alta',  order: 3 },
        { title: 'Motion graphics e efeitos',          estimateHours: 6,  priority: 'media', order: 4 },
        { title: 'Trilha e sound design',              estimateHours: 3,  priority: 'media', order: 5 },
        { title: 'Revisao e ajustes',                 estimateHours: 2,  priority: 'media', order: 6 },
        { title: 'Export e entrega de formatos',       estimateHours: 1,  priority: 'baixa', order: 7 }
      ]
    },
    social_media: {
      keywords: ['social media', 'instagram', 'redes sociais', 'post', 'conteudo digital', 'feed'],
      subtasks: [
        { title: 'Planejamento de pauta',              estimateHours: 3,  priority: 'alta',  order: 1 },
        { title: 'Redacao de copys',                   estimateHours: 4,  priority: 'alta',  order: 2 },
        { title: 'Design de pecas graficas',           estimateHours: 6,  priority: 'alta',  order: 3 },
        { title: 'Aprovacao do cliente',               estimateHours: 1,  priority: 'media', order: 4 },
        { title: 'Agendamento de publicacoes',         estimateHours: 1,  priority: 'media', order: 5 },
        { title: 'Monitoramento de resultados',        estimateHours: 2,  priority: 'baixa', order: 6 }
      ]
    },
    lancamento: {
      keywords: ['lancamento', 'launch', 'campanha de lancamento', 'pre-lancamento'],
      subtasks: [
        { title: 'Diagnostico e estrategia',           estimateHours: 6,  priority: 'alta',  order: 1 },
        { title: 'Key visual e conceito criativo',     estimateHours: 8,  priority: 'alta',  order: 2 },
        { title: 'Producao de materiais',              estimateHours: 16, priority: 'alta',  order: 3 },
        { title: 'Setup de midia digital',             estimateHours: 4,  priority: 'media', order: 4 },
        { title: 'Material de ponto de venda',         estimateHours: 8,  priority: 'media', order: 5 },
        { title: 'Evento de lancamento',               estimateHours: 6,  priority: 'alta',  order: 6 },
        { title: 'Relatorio de resultados',            estimateHours: 3,  priority: 'media', order: 7 }
      ]
    },
    website: {
      keywords: ['site', 'website', 'landing page', 'pagina web', 'hotsite'],
      subtasks: [
        { title: 'Wireframe e arquitetura',            estimateHours: 4,  priority: 'alta',  order: 1 },
        { title: 'Design de interface (UI)',           estimateHours: 8,  priority: 'alta',  order: 2 },
        { title: 'Desenvolvimento front-end',          estimateHours: 12, priority: 'alta',  order: 3 },
        { title: 'Conteudo e textos',                  estimateHours: 4,  priority: 'media', order: 4 },
        { title: 'Testes e QA',                        estimateHours: 3,  priority: 'media', order: 5 },
        { title: 'Publicacao e deploy',                estimateHours: 2,  priority: 'media', order: 6 }
      ]
    }
  },

  decomposeTask(taskTitle, buType) {
    try {
      if (!taskTitle) return [];

      const titleLower = taskTitle.toLowerCase();
      const buLower = (buType || '').toLowerCase();

      // Try to match against patterns
      let bestMatch = null;
      let bestScore = 0;

      Object.entries(this._decompositionPatterns).forEach(([key, pattern]) => {
        let score = 0;
        pattern.keywords.forEach(kw => {
          if (titleLower.includes(kw)) score += 2;
          if (buLower.includes(kw)) score += 1;
        });
        if (score > bestScore) {
          bestScore = score;
          bestMatch = pattern;
        }
      });

      // Also check BU type mapping
      if (bestScore === 0 && buLower) {
        if (buLower.includes('3d') || buLower.includes('digital')) {
          bestMatch = this._decompositionPatterns.render;
        } else if (buLower.includes('branding')) {
          bestMatch = this._decompositionPatterns.branding;
        } else if (buLower.includes('marketing')) {
          bestMatch = this._decompositionPatterns.social_media;
        }
      }

      if (!bestMatch) return [];

      return bestMatch.subtasks.map(st => ({
        title: st.title,
        estimateHours: st.estimateHours,
        priority: st.priority,
        order: st.order
      }));
    } catch (e) {
      console.warn('[TBO Enhancements] decomposeTask error:', e);
      return [];
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. REAL-TIME COLLABORATION INDICATORS
  // Cross-tab presence awareness via localStorage events
  // ═══════════════════════════════════════════════════════════════════════════

  _presencePrefix: 'tbo_presence_',
  _heartbeatInterval: null,
  _staleThresholdMs: 60000, // 60 seconds
  _heartbeatMs: 30000,      // 30 seconds

  _getCurrentUser() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      if (u) return { id: u.id || u.name, name: u.name || u.id || 'Anonimo' };
    }
    // Fallback: generate a tab-unique id
    if (!this._tabUserId) {
      this._tabUserId = 'tab_' + Date.now().toString(36);
    }
    return { id: this._tabUserId, name: 'Usuario' };
  },

  announcePresence(moduleId) {
    try {
      const user = this._getCurrentUser();
      const data = {
        userId: user.id,
        userName: user.name,
        module: moduleId || 'desconhecido',
        since: new Date().toISOString(),
        lastHeartbeat: Date.now()
      };
      localStorage.setItem(this._presencePrefix + user.id, JSON.stringify(data));

      // Setup heartbeat if not already running
      if (!this._heartbeatInterval) {
        this._heartbeatInterval = setInterval(() => {
          this._sendHeartbeat(moduleId);
        }, this._heartbeatMs);

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
          this._cleanupPresence();
        });
      }
    } catch (e) {
      console.warn('[TBO Enhancements] announcePresence error:', e);
    }
  },

  _sendHeartbeat(moduleId) {
    try {
      const user = this._getCurrentUser();
      const key = this._presencePrefix + user.id;
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        data.lastHeartbeat = Date.now();
        if (moduleId) data.module = moduleId;
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) { /* ignore heartbeat errors */ }
  },

  _cleanupPresence() {
    try {
      const user = this._getCurrentUser();
      localStorage.removeItem(this._presencePrefix + user.id);
      if (this._heartbeatInterval) {
        clearInterval(this._heartbeatInterval);
        this._heartbeatInterval = null;
      }
    } catch (e) { /* ignore cleanup errors */ }
  },

  getActiveUsers() {
    try {
      const now = Date.now();
      const activeUsers = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this._presencePrefix)) continue;

        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const data = JSON.parse(raw);

          // Check if stale
          if (now - data.lastHeartbeat > this._staleThresholdMs) {
            localStorage.removeItem(key); // Cleanup stale entry
            continue;
          }

          activeUsers.push({
            userId: data.userId,
            userName: data.userName,
            module: data.module,
            since: data.since
          });
        } catch (e) { /* ignore parse errors for individual entries */ }
      }

      return activeUsers;
    } catch (e) {
      return [];
    }
  },

  renderPresenceIndicators() {
    try {
      const users = this.getActiveUsers();
      if (users.length === 0) return '';

      const currentUser = this._getCurrentUser();

      const indicators = users
        .filter(u => u.userId !== currentUser.id)
        .map(u => {
          const initials = (u.userName || '??').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
          const moduleLabel = this._getModuleLabel(u.module);
          return `<div class="tbo-presence-indicator" title="${u.userName} em ${moduleLabel}">
            <span class="tbo-presence-avatar">${initials}</span>
            <span class="tbo-presence-dot"></span>
          </div>`;
        })
        .join('');

      if (!indicators) return '';

      return `<div class="tbo-presence-bar">
        <span class="tbo-presence-label">${users.length - 1} pessoa(s) online:</span>
        ${indicators}
      </div>`;
    } catch (e) {
      return '';
    }
  },

  _getModuleLabel(moduleId) {
    const labels = {
      'dashboard': 'Dashboard',
      'projetos': 'Projetos',
      'pipeline': 'Pipeline',
      'comercial': 'Comercial',
      'financeiro': 'Financeiro',
      'reunioes': 'Reunioes',
      'rh': 'RH',
      'configuracoes': 'Configuracoes',
      'clientes': 'Clientes',
      'inteligencia': 'Inteligencia',
      'conteudo': 'Conteudo',
      'mercado': 'Mercado',
      'cultura': 'Cultura',
      'timeline': 'Timeline',
      'alerts': 'Alertas'
    };
    return labels[moduleId] || moduleId || 'Desconhecido';
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY: Cleanup and Initialization
  // ═══════════════════════════════════════════════════════════════════════════

  init() {
    // Listen for storage events (cross-tab presence)
    try {
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith(this._presencePrefix)) {
          // Another tab announced presence; UI can react
          const presenceBar = document.querySelector('.tbo-presence-bar');
          if (presenceBar) {
            presenceBar.outerHTML = this.renderPresenceIndicators();
          }
        }
      });
    } catch (e) {
      console.warn('[TBO Enhancements] Falha ao inicializar listener de presenca:', e);
    }
  },

  destroy() {
    this._cleanupPresence();
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SELF-EXECUTING CSS IIFE — UI Components
// Sprint cards, conflict indicators, presence avatars, approval badges
// ═══════════════════════════════════════════════════════════════════════════

(function injectProjectEnhancementsCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tbo-project-enhancements-css')) return;

  const style = document.createElement('style');
  style.id = 'tbo-project-enhancements-css';
  style.textContent = `
    /* ── Presence Indicators ────────────────────────────────────── */
    .tbo-presence-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      font-size: 12px;
      color: rgba(255,255,255,0.6);
    }
    .tbo-presence-label {
      white-space: nowrap;
      font-size: 11px;
      opacity: 0.7;
    }
    .tbo-presence-indicator {
      position: relative;
      display: inline-flex;
      cursor: default;
    }
    .tbo-presence-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255,255,255,0.15);
    }
    .tbo-presence-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      border: 2px solid #1a1a2e;
    }

    /* ── Sprint Card ────────────────────────────────────────────── */
    .tbo-sprint-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .tbo-sprint-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .tbo-sprint-card-title {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
    }
    .tbo-sprint-card-badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .tbo-sprint-card-badge.active {
      background: rgba(34,197,94,0.15);
      color: #22c55e;
    }
    .tbo-sprint-card-badge.completed {
      background: rgba(99,102,241,0.15);
      color: #6366f1;
    }
    .tbo-sprint-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 8px;
      margin-top: 12px;
    }
    .tbo-sprint-metric {
      text-align: center;
      padding: 8px;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
    }
    .tbo-sprint-metric-value {
      font-size: 18px;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
    }
    .tbo-sprint-metric-label {
      font-size: 10px;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      margin-top: 2px;
    }

    /* ── Conflict Indicators ────────────────────────────────────── */
    .tbo-conflict-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .tbo-conflict-badge.critica {
      background: rgba(239,68,68,0.15);
      color: #ef4444;
    }
    .tbo-conflict-badge.alta {
      background: rgba(245,158,11,0.15);
      color: #f59e0b;
    }
    .tbo-conflict-badge.media {
      background: rgba(59,130,246,0.15);
      color: #3b82f6;
    }
    .tbo-conflict-badge.baixa {
      background: rgba(148,163,184,0.15);
      color: #94a3b8;
    }
    .tbo-conflict-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 8px;
    }
    .tbo-conflict-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .tbo-conflict-person {
      font-weight: 600;
      font-size: 13px;
      color: rgba(255,255,255,0.9);
    }
    .tbo-conflict-detail {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      line-height: 1.5;
    }

    /* ── Approval Tracker ───────────────────────────────────────── */
    .tbo-approval-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(245,158,11,0.2);
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 8px;
    }
    .tbo-approval-client {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      margin-bottom: 8px;
    }
    .tbo-approval-count {
      display: inline-block;
      background: rgba(245,158,11,0.2);
      color: #f59e0b;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      margin-left: 6px;
    }
    .tbo-approval-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-size: 12px;
    }
    .tbo-approval-item:last-child {
      border-bottom: none;
    }
    .tbo-approval-item-name {
      color: rgba(255,255,255,0.8);
    }
    .tbo-approval-item-days {
      font-weight: 600;
    }
    .tbo-approval-item-days.critica {
      color: #ef4444;
    }
    .tbo-approval-item-days.alta {
      color: #f59e0b;
    }
    .tbo-approval-item-days.normal {
      color: #94a3b8;
    }

    /* ── Post-Mortem Report ─────────────────────────────────────── */
    .tbo-postmortem {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 20px;
    }
    .tbo-postmortem-title {
      font-size: 16px;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
      margin-bottom: 16px;
    }
    .tbo-postmortem-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 10px;
      margin-bottom: 16px;
    }
    .tbo-postmortem-stat {
      text-align: center;
      padding: 10px;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
    }
    .tbo-postmortem-stat-value {
      font-size: 20px;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
    }
    .tbo-postmortem-stat-label {
      font-size: 10px;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      margin-top: 4px;
    }
    .tbo-postmortem-lessons {
      list-style: none;
      padding: 0;
      margin: 12px 0 0 0;
    }
    .tbo-postmortem-lessons li {
      padding: 8px 12px;
      margin-bottom: 6px;
      background: rgba(99,102,241,0.08);
      border-left: 3px solid #6366f1;
      border-radius: 0 6px 6px 0;
      font-size: 12px;
      color: rgba(255,255,255,0.75);
      line-height: 1.5;
    }

    /* ── Dependency Graph (minimal) ─────────────────────────────── */
    .tbo-dep-node {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.85);
    }
    .tbo-dep-node.critical-path {
      border-color: #ef4444;
      background: rgba(239,68,68,0.08);
    }
    .tbo-dep-node.milestone {
      border-color: #f59e0b;
      background: rgba(245,158,11,0.08);
    }
    .tbo-dep-edge {
      display: inline-block;
      width: 24px;
      height: 2px;
      background: rgba(255,255,255,0.2);
      vertical-align: middle;
      margin: 0 4px;
      position: relative;
    }
    .tbo-dep-edge::after {
      content: '';
      position: absolute;
      right: 0;
      top: -3px;
      border-left: 6px solid rgba(255,255,255,0.2);
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
    }

    /* ── Playbook Selector ──────────────────────────────────────── */
    .tbo-playbook-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    .tbo-playbook-option {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tbo-playbook-option:hover {
      border-color: rgba(99,102,241,0.4);
      background: rgba(99,102,241,0.06);
    }
    .tbo-playbook-option.selected {
      border-color: #6366f1;
      background: rgba(99,102,241,0.1);
    }
    .tbo-playbook-name {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      margin-bottom: 6px;
    }
    .tbo-playbook-info {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
    }

    /* ── Decomposition Preview ──────────────────────────────────── */
    .tbo-decomp-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .tbo-decomp-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 4px;
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      font-size: 12px;
      color: rgba(255,255,255,0.8);
    }
    .tbo-decomp-item-title {
      flex: 1;
    }
    .tbo-decomp-item-hours {
      color: rgba(255,255,255,0.5);
      font-weight: 600;
      margin-left: 12px;
      white-space: nowrap;
    }
    .tbo-decomp-item-priority {
      margin-left: 8px;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    .tbo-decomp-item-priority.alta {
      background: rgba(239,68,68,0.15);
      color: #ef4444;
    }
    .tbo-decomp-item-priority.media {
      background: rgba(245,158,11,0.15);
      color: #f59e0b;
    }
    .tbo-decomp-item-priority.baixa {
      background: rgba(148,163,184,0.15);
      color: #94a3b8;
    }
  `;

  document.head.appendChild(style);
})();
