// ============================================================================
// TBO OS — Pagina de Onboarding (colaborador)
// Exibe progresso, dias, atividades e permite concluir o onboarding
// ============================================================================

const TBO_ONBOARDING = {
  _colaborador: null,
  _dias: [],
  _diasLiberados: [],
  _atividades: [],
  _progresso: [],
  _realtimeChannel: null,
  _diaAberto: null,
  _atividadeInicioTs: null, // timestamp de quando o modal da atividade foi aberto (metricas de tempo)

  // ── Inicializacao ───────────────────────────────────────────────────────────
  async init() {
    try {
      const client = TBO_ONBOARDING_DB.getClient();
      if (!client) {
        this._showError('Erro de conexao com o servidor.');
        return;
      }

      // Verificar sessao
      const session = await TBO_ONBOARDING_DB.getSession();
      if (!session) {
        window.location.href = '../index.html';
        return;
      }

      // Buscar colaborador
      this._colaborador = await TBO_ONBOARDING_DB.getColaboradorLogado();
      if (!this._colaborador) {
        window.location.href = '../index.html';
        return;
      }

      // Exibir nome do usuario
      const nameEl = document.getElementById('onbUserName');
      if (nameEl) nameEl.textContent = this._colaborador.nome;

      // Banner para onboarding reduzido
      if (this._colaborador.tipo_onboarding === 'reduzido') {
        const banner = document.getElementById('onbBannerReduzido');
        if (banner) banner.style.display = 'block';
      }

      // Carregar dados
      await this._carregarDados();
      this._render();
      this._initRealtime();
      this._bindLogout();

    } catch (e) {
      console.error('[TBO Onboarding] Erro na inicializacao:', e);
      this._showError('Erro ao carregar onboarding. Tente recarregar a pagina.');
    }
  },

  // ── Cache localStorage (dias e atividades raramente mudam) ──────────────────
  _CACHE_KEY: 'tbo_onboarding_cache',
  _CACHE_TTL: 10 * 60 * 1000, // 10 minutos

  _getCache() {
    try {
      const raw = localStorage.getItem(this._CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (Date.now() - cache.ts > this._CACHE_TTL) {
        localStorage.removeItem(this._CACHE_KEY);
        return null;
      }
      return cache;
    } catch { return null; }
  },

  _setCache(dias, atividades) {
    try {
      localStorage.setItem(this._CACHE_KEY, JSON.stringify({
        ts: Date.now(),
        tipo: this._colaborador.tipo_onboarding,
        dias,
        atividades
      }));
    } catch { /* quota exceeded ou privado */ }
  },

  // ── Carregar dados do Supabase (com cache para dias/atividades) ────────────
  async _carregarDados() {
    const client = TBO_ONBOARDING_DB.getClient();
    const cache = this._getCache();

    // Dias (cacheaveis — raramente mudam)
    if (cache && cache.tipo === this._colaborador.tipo_onboarding && cache.dias) {
      this._dias = cache.dias;
      this._atividades = cache.atividades || [];
    } else {
      const { data: dias, error: diasError } = await client
        .from('onboarding_dias')
        .select('*')
        .eq('tipo_onboarding', this._colaborador.tipo_onboarding)
        .order('numero');

      if (diasError) throw new Error(`Erro ao carregar dias: ${diasError.message}`);
      this._dias = dias || [];

      // Buscar atividades de todos os dias
      const diaIds = this._dias.map(d => d.id);
      if (diaIds.length > 0) {
        const { data: atividades, error: atvError } = await client
          .from('onboarding_atividades')
          .select('*')
          .in('dia_id', diaIds)
          .order('ordem');

        if (atvError) throw new Error(`Erro ao carregar atividades: ${atvError.message}`);
        this._atividades = atividades || [];
      }

      // Salvar no cache
      this._setCache(this._dias, this._atividades);
    }

    // Dias liberados e progresso — sempre buscar do servidor (mudam frequentemente)
    const { data: diasLiberados, error: dlError } = await client
      .from('onboarding_dias_liberados')
      .select('*')
      .eq('colaborador_id', this._colaborador.id);

    if (dlError) throw new Error(`Erro ao carregar dias liberados: ${dlError.message}`);
    this._diasLiberados = diasLiberados || [];

    const { data: progresso, error: progError } = await client
      .from('onboarding_progresso')
      .select('*')
      .eq('colaborador_id', this._colaborador.id);

    if (progError) throw new Error(`Erro ao carregar progresso: ${progError.message}`);
    this._progresso = progresso || [];
  },

  // ── Render principal ────────────────────────────────────────────────────────
  _render() {
    const container = document.getElementById('onbContainer');
    if (!container) return;

    const totalAtividades = this._atividades.filter(a => a.obrigatorio).length;
    const concluidas = this._progresso.filter(p => p.concluido).length;
    const percentual = totalAtividades > 0 ? Math.round((concluidas / totalAtividades) * 100) : 0;
    const diasConcluidos = this._diasLiberados.filter(d => d.concluido).length;
    const totalDias = this._dias.length;

    container.innerHTML = `
      <!-- Barra de progresso geral -->
      <div class="onb-progress-section">
        <div class="onb-progress-header">
          <div>
            <div class="onb-progress-label">Seu progresso</div>
            <div class="onb-progress-days">${diasConcluidos} de ${totalDias} dias concluidos</div>
          </div>
          <div class="onb-progress-percent">${percentual}%</div>
        </div>
        <div class="onb-progress-bar">
          <div class="onb-progress-fill" style="width:${percentual}%;"></div>
        </div>
      </div>

      <!-- Lista de dias -->
      <div class="onb-dias-list" id="onbDiasList">
        ${this._dias.map(dia => this._renderDiaCard(dia)).join('')}
      </div>

      <!-- Detalhe do dia aberto -->
      <div id="onbDiaDetail"></div>

      <!-- Botao final -->
      <div class="onb-final-btn ${percentual >= 100 ? 'visible' : ''}" id="onbFinalBtn">
        <button class="btn btn-primary btn-lg" id="onbConcluirBtn" style="padding:16px 48px;font-size:16px;">
          <i data-lucide="rocket" style="width:20px;height:20px;margin-right:8px;"></i>
          Estou pronto para comecar!
        </button>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    this._bindDiaClicks();
    this._bindConcluir();
  },

  // ── Render card de dia ──────────────────────────────────────────────────────
  _renderDiaCard(dia) {
    const liberado = this._diasLiberados.find(dl => dl.dia_id === dia.id);
    const atividadesDia = this._atividades.filter(a => a.dia_id === dia.id && a.obrigatorio);
    const concluidasDia = atividadesDia.filter(a =>
      this._progresso.some(p => p.atividade_id === a.id && p.concluido)
    ).length;

    let statusClass, statusLabel, iconClass, iconContent;

    if (liberado && liberado.concluido) {
      statusClass = 'completed';
      statusLabel = 'Concluido';
      iconClass = 'completed';
      iconContent = '<i data-lucide="check" style="width:18px;height:18px;"></i>';
    } else if (liberado && concluidasDia > 0) {
      statusClass = 'in-progress';
      statusLabel = `${concluidasDia}/${atividadesDia.length}`;
      iconClass = 'in-progress';
      iconContent = `<span>${dia.numero}</span>`;
    } else if (liberado) {
      statusClass = 'available';
      statusLabel = 'Disponivel';
      iconClass = 'available';
      iconContent = `<span>${dia.numero}</span>`;
    } else {
      statusClass = 'locked';
      statusLabel = 'Bloqueado';
      iconClass = 'locked';
      iconContent = '<i data-lucide="lock" style="width:16px;height:16px;"></i>';
    }

    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    return `
      <div class="onb-dia-card ${statusClass}" data-dia-id="${esc(dia.id)}" data-locked="${!liberado}">
        <div class="onb-dia-icon ${iconClass}">${iconContent}</div>
        <div class="onb-dia-info">
          <div class="onb-dia-title">Dia ${dia.numero}: ${esc(dia.titulo)}</div>
          <div class="onb-dia-meta">${esc(dia.tema) || ''} ${dia.carga ? '· ' + esc(dia.carga) : ''} · ${atividadesDia.length} atividades</div>
        </div>
        <span class="onb-dia-status ${statusClass}">${statusLabel}</span>
      </div>
    `;
  },

  // ── Bind clicks nos dias ────────────────────────────────────────────────────
  _bindDiaClicks() {
    const list = document.getElementById('onbDiasList');
    if (!list) return;

    list.addEventListener('click', (e) => {
      const card = e.target.closest('.onb-dia-card');
      if (!card || card.dataset.locked === 'true') return;

      const diaId = card.dataset.diaId;
      this._abrirDia(diaId);
    });
  },

  // ── Abrir detalhes do dia ───────────────────────────────────────────────────
  _abrirDia(diaId) {
    this._diaAberto = diaId;
    const dia = this._dias.find(d => d.id === diaId);
    if (!dia) return;

    const atividadesDia = this._atividades.filter(a => a.dia_id === diaId);
    const detail = document.getElementById('onbDiaDetail');
    if (!detail) return;

    const escD = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    detail.innerHTML = `
      <div class="onb-dia-detail">
        <div class="onb-dia-detail-header">
          <h2>Dia ${dia.numero}: ${escD(dia.titulo)}</h2>
          <button class="btn btn-ghost btn-sm" id="onbFecharDia">
            <i data-lucide="x" style="width:16px;height:16px;"></i>
          </button>
        </div>
        <div id="onbAtividadesList">
          ${atividadesDia.map(atv => this._renderAtividade(atv)).join('')}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Fechar dia
    document.getElementById('onbFecharDia')?.addEventListener('click', () => {
      detail.innerHTML = '';
      this._diaAberto = null;
    });

    // Bind acoes nas atividades
    this._bindAtividadeActions();

    // Scroll para o detalhe
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // ── Render atividade ────────────────────────────────────────────────────────
  _renderAtividade(atv) {
    const prog = this._progresso.find(p => p.atividade_id === atv.id);
    const concluida = prog?.concluido || false;

    const tipoIcons = {
      video: 'play-circle',
      documento: 'file-text',
      sop: 'clipboard-list',
      quiz: 'help-circle',
      tarefa: 'edit-3',
      aceite: 'check-square',
      formulario: 'list'
    };

    const icon = tipoIcons[atv.tipo] || 'circle';

    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    return `
      <div class="onb-atividade-item ${concluida ? 'concluida' : ''}" data-atividade-id="${esc(atv.id)}">
        <div class="onb-atividade-icon ${esc(atv.tipo)}">
          <i data-lucide="${icon}" style="width:16px;height:16px;"></i>
        </div>
        <div class="onb-atividade-info">
          <div class="onb-atividade-title">${esc(atv.titulo)}</div>
          ${atv.descricao ? `<div class="onb-atividade-desc">${esc(atv.descricao)}</div>` : ''}
          ${atv.tempo_estimado_min ? `<div class="onb-atividade-time"><i data-lucide="clock" style="width:12px;height:12px;margin-right:4px;vertical-align:-2px;"></i>${atv.tempo_estimado_min} min</div>` : ''}
        </div>
        <div class="onb-atividade-action">
          ${concluida
            ? '<div class="onb-atividade-check done"><i data-lucide="check" style="width:14px;height:14px;"></i></div>'
            : `<button class="btn btn-sm ${atv.tipo === 'aceite' ? 'btn-secondary' : 'btn-primary'}" data-action="abrir" data-atv-id="${atv.id}">${this._getBotaoLabel(atv.tipo)}</button>`
          }
        </div>
      </div>
    `;
  },

  _getBotaoLabel(tipo) {
    const labels = {
      video: 'Assistir',
      documento: 'Ler',
      sop: 'Ler',
      quiz: 'Iniciar',
      tarefa: 'Fazer',
      aceite: 'Aceitar',
      formulario: 'Preencher'
    };
    return labels[tipo] || 'Abrir';
  },

  // ── Bind acoes de atividades ────────────────────────────────────────────────
  _bindAtividadeActions() {
    const list = document.getElementById('onbAtividadesList');
    if (!list) return;

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="abrir"]');
      if (!btn) return;

      const atvId = btn.dataset.atvId;
      const atv = this._atividades.find(a => a.id === atvId);
      if (!atv) return;

      this._abrirAtividade(atv);
    });
  },

  // ── Abrir modal de atividade ────────────────────────────────────────────────
  _abrirAtividade(atv) {
    const modalArea = document.getElementById('onbModalArea');
    if (!modalArea) return;

    // Registrar timestamp de inicio para metricas de tempo
    this._atividadeInicioTs = Date.now();

    let conteudoHtml = '';

    switch (atv.tipo) {
      case 'video':
        conteudoHtml = `
          <div style="text-align:center;">
            ${atv.url_conteudo
              ? `<video controls style="width:100%;border-radius:8px;"><source src="${atv.url_conteudo}"></video>`
              : `<div style="padding:40px;background:var(--bg-secondary);border-radius:8px;">
                  <i data-lucide="play-circle" style="width:48px;height:48px;color:var(--brand-orange);margin-bottom:12px;"></i>
                  <p style="color:var(--text-muted);">Video sera disponibilizado em breve.</p>
                  <p style="color:var(--text-muted);font-size:13px;">${atv.descricao || ''}</p>
                </div>`
            }
          </div>
        `;
        break;

      case 'documento':
      case 'sop':
        conteudoHtml = `
          <div style="padding:20px;background:var(--bg-secondary);border-radius:8px;">
            ${atv.url_conteudo
              ? `<p>Documento: <a href="${atv.url_conteudo}" target="_blank" class="btn btn-sm btn-secondary" style="margin-left:8px;">Abrir documento</a></p>`
              : `<p style="color:var(--text-muted);">${atv.descricao || 'Conteudo sera disponibilizado em breve.'}</p>`
            }
          </div>
        `;
        break;

      case 'quiz':
        conteudoHtml = `
          <div style="text-align:center;padding:20px;">
            <i data-lucide="help-circle" style="width:48px;height:48px;color:var(--brand-orange);margin-bottom:12px;"></i>
            <p>O quiz sera carregado aqui.</p>
            <p style="color:var(--text-muted);font-size:13px;">${atv.descricao || ''}</p>
            ${atv.score_minimo ? `<p style="font-size:13px;color:var(--text-muted);">Score minimo: ${atv.score_minimo}%</p>` : ''}
          </div>
        `;
        break;

      case 'tarefa':
        conteudoHtml = `
          <div>
            <p style="margin-bottom:12px;">${atv.descricao || ''}</p>
            <div class="form-group">
              <label class="form-label">Sua resposta</label>
              <textarea class="form-input" id="onbTarefaResposta" rows="6" placeholder="Escreva sua resposta aqui..."></textarea>
            </div>
          </div>
        `;
        break;

      case 'aceite':
        conteudoHtml = `
          <div>
            <p style="margin-bottom:16px;">${atv.descricao || ''}</p>
            <label class="form-check" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <input type="checkbox" id="onbAceiteCheck">
              <span style="font-size:14px;">Li e concordo com os termos acima</span>
            </label>
          </div>
        `;
        break;

      case 'formulario':
        conteudoHtml = `
          <div>
            <p style="margin-bottom:12px;">${atv.descricao || ''}</p>
            <div class="form-group">
              <label class="form-label">Preencha os campos</label>
              <textarea class="form-input" id="onbFormResposta" rows="4" placeholder="Suas respostas..."></textarea>
            </div>
          </div>
        `;
        break;
    }

    const escM = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    modalArea.innerHTML = `
      <div class="onb-modal-overlay" id="onbModal" role="dialog" aria-modal="true" aria-labelledby="onbModalTitle">
        <div class="onb-modal">
          <div class="onb-modal-header">
            <h3 id="onbModalTitle" style="margin:0;font-size:16px;">${escM(atv.titulo)}</h3>
            <button class="btn btn-ghost btn-sm" id="onbModalClose" aria-label="Fechar">
              <i data-lucide="x" style="width:16px;height:16px;"></i>
            </button>
          </div>
          <div class="onb-modal-body">
            ${conteudoHtml}
            <!-- Feedback do colaborador (1-5 estrelas) -->
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-light,#DFDFDF);">
              <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">Como voce avalia esta atividade?</div>
              <div id="onbFeedbackStars" style="display:flex;gap:4px;">
                ${[1,2,3,4,5].map(n => `
                  <button class="btn btn-icon btn-sm onb-star-btn" data-rating="${n}" style="color:var(--text-muted);transition:color 150ms;" aria-label="${n} estrela${n > 1 ? 's' : ''}">
                    <i data-lucide="star" style="width:20px;height:20px;"></i>
                  </button>
                `).join('')}
                <span id="onbFeedbackLabel" style="font-size:12px;color:var(--text-muted);margin-left:8px;align-self:center;"></span>
              </div>
              <input type="hidden" id="onbFeedbackRating" value="0">
            </div>
          </div>
          <div class="onb-modal-footer">
            <button class="btn btn-secondary" id="onbModalCancelBtn">Fechar</button>
            <button class="btn btn-primary" id="onbModalConcluirBtn" data-atv-id="${atv.id}">
              <i data-lucide="check" style="width:14px;height:14px;margin-right:4px;"></i>
              Marcar como concluida
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Focus management: focar no modal ao abrir
    const modalEl = document.querySelector('.onb-modal');
    if (modalEl) modalEl.focus();

    // Bind estrelas de feedback
    const feedbackLabels = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];
    const starsContainer = document.getElementById('onbFeedbackStars');
    if (starsContainer) {
      starsContainer.addEventListener('click', (ev) => {
        const starBtn = ev.target.closest('.onb-star-btn');
        if (!starBtn) return;
        const rating = parseInt(starBtn.dataset.rating);
        document.getElementById('onbFeedbackRating').value = rating;
        // Atualizar visual das estrelas
        starsContainer.querySelectorAll('.onb-star-btn').forEach(btn => {
          const r = parseInt(btn.dataset.rating);
          btn.style.color = r <= rating ? 'var(--brand-orange, #E85102)' : 'var(--text-muted, #9F9F9F)';
        });
        // Label descritivo
        const label = document.getElementById('onbFeedbackLabel');
        if (label) label.textContent = feedbackLabels[rating] || '';
      });
    }

    // Bind fechar
    const fechar = () => { modalArea.innerHTML = ''; };
    document.getElementById('onbModalClose')?.addEventListener('click', fechar);
    document.getElementById('onbModalCancelBtn')?.addEventListener('click', fechar);

    // Fechar com Escape
    const escHandler = (e) => { if (e.key === 'Escape') { fechar(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);

    // Bind concluir (com prevencao de double-click)
    document.getElementById('onbModalConcluirBtn')?.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-atv-id]');
      if (!btn) return;
      if (btn.disabled) return;
      btn.disabled = true;
      btn.textContent = 'Salvando...';
      const atvId = btn.dataset.atvId;
      if (!atvId) { btn.disabled = false; return; }

      // Validacoes especificas
      if (atv.tipo === 'aceite') {
        const check = document.getElementById('onbAceiteCheck');
        if (check && !check.checked) {
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Acao necessaria', 'Voce precisa aceitar os termos para continuar.');
          else alert('Voce precisa aceitar os termos para continuar.');
          return;
        }
      }

      // Coletar resposta (se aplicavel)
      let resposta = null;
      if (atv.tipo === 'tarefa') {
        resposta = document.getElementById('onbTarefaResposta')?.value;
        if (!resposta || resposta.trim().length < 10) {
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Resposta curta', 'Escreva uma resposta mais detalhada (minimo 10 caracteres).');
          else alert('Por favor, escreva uma resposta mais detalhada (minimo 10 caracteres).');
          return;
        }
      }
      if (atv.tipo === 'formulario') {
        resposta = document.getElementById('onbFormResposta')?.value;
      }

      // Coletar feedback (rating 1-5, opcional)
      const feedbackRating = parseInt(document.getElementById('onbFeedbackRating')?.value) || 0;

      await this._concluirAtividade(atvId, resposta, feedbackRating);
      fechar();
    });

    // Overlay click fecha
    document.getElementById('onbModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'onbModal') fechar();
    });
  },

  // ── Concluir atividade ──────────────────────────────────────────────────────
  async _concluirAtividade(atividadeId, resposta, feedbackRating) {
    try {
      const client = TBO_ONBOARDING_DB.getClient();

      // Snapshot do progresso antes da mudanca (backup para recovery)
      this._salvarSnapshot(atividadeId);

      // Calcular tempo gasto na atividade (segundos)
      let tempoGastoSeg = null;
      if (this._atividadeInicioTs) {
        tempoGastoSeg = Math.round((Date.now() - this._atividadeInicioTs) / 1000);
        this._atividadeInicioTs = null;
      }

      const upsertData = {
        colaborador_id: this._colaborador.id,
        atividade_id: atividadeId,
        concluido: true,
        concluido_em: new Date().toISOString(),
        tentativas: 1
      };

      if (resposta) upsertData.resposta_tarefa = resposta;
      if (tempoGastoSeg) upsertData.tempo_gasto_seg = tempoGastoSeg;
      if (feedbackRating > 0 && feedbackRating <= 5) upsertData.feedback_rating = feedbackRating;

      const { error } = await client
        .from('onboarding_progresso')
        .upsert(upsertData, { onConflict: 'colaborador_id,atividade_id' });

      if (error) {
        console.error('[TBO Onboarding] Erro ao concluir atividade:', error);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao salvar progresso. Tente novamente.');
        else alert('Erro ao salvar progresso. Tente novamente.');
        return;
      }

      // Atualizar dados locais e re-renderizar
      await this._carregarDados();
      this._render();

      // Se tinha um dia aberto, reabrir
      if (this._diaAberto) {
        this._abrirDia(this._diaAberto);
      }

    } catch (e) {
      console.error('[TBO Onboarding] Erro:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao salvar. Tente novamente.');
      else alert('Erro ao salvar. Tente novamente.');
    }
  },

  // ── Bind botao de conclusao ─────────────────────────────────────────────────
  _bindConcluir() {
    const btn = document.getElementById('onbConcluirBtn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Finalizando...';

      try {
        // Chamar edge function de conclusao
        const client = TBO_ONBOARDING_DB.getClient();
        await client.functions.invoke('fn_conclusao_onboarding', {
          body: { colaborador_id: this._colaborador.id }
        });

        // Exibir celebracao
        this._showCelebration();

      } catch (e) {
        console.error('[TBO Onboarding] Erro na conclusao:', e);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao finalizar. Tente novamente.');
        else alert('Erro ao finalizar. Tente novamente.');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="rocket" style="width:20px;height:20px;margin-right:8px;"></i> Estou pronto para comecar!';
        if (window.lucide) lucide.createIcons();
      }
    });
  },

  // ── Confetti engine (canvas leve, sem dependencias externas) ─────────────────
  _launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'onbConfettiCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2001;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#E85102', '#FD8241', '#FED5C0', '#2ecc71', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6'];
    const pieces = [];
    const total = 120;

    for (let i = 0; i < total; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1,
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.15,
        opacity: 1
      });
    }

    let frame = 0;
    const maxFrames = 180;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let active = 0;
      pieces.forEach(p => {
        if (p.opacity <= 0) return;
        active++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.rot += p.rotV;

        if (frame > maxFrames - 60) {
          p.opacity -= 0.016;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (active > 0 && frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    requestAnimationFrame(animate);
  },

  // ── Celebracao de conclusao ─────────────────────────────────────────────────
  _showCelebration() {
    const area = document.getElementById('onbCelebrationArea');
    if (!area) return;

    // Lancar confetti animado
    this._launchConfetti();

    area.innerHTML = `
      <div class="onb-celebration" id="onbCelebration">
        <div class="onb-celebration-content">
          <div class="onb-celebration-emoji">🎉</div>
          <div class="onb-celebration-title">Parabens, ${(typeof _escapeHtml === 'function' ? _escapeHtml : String)(this._colaborador.nome)}!</div>
          <div class="onb-celebration-msg">
            Voce concluiu o onboarding com sucesso.<br>
            Bem-vindo(a) oficialmente a equipe TBO!
          </div>
          <button class="btn btn-primary" id="onbGoToSystem" style="padding:12px 32px;">
            Acessar o TBO OS
          </button>
        </div>
      </div>
    `;

    document.getElementById('onbGoToSystem')?.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  },

  // ── Realtime: escutar liberacao de novos dias ───────────────────────────────
  _initRealtime() {
    const client = TBO_ONBOARDING_DB.getClient();
    if (!client) return;

    this._realtimeChannel = client
      .channel('onboarding-dias-liberados')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'onboarding_dias_liberados',
        filter: `colaborador_id=eq.${this._colaborador.id}`
      }, async (payload) => {
        console.log('[TBO Onboarding] Novo dia liberado:', payload);

        // Mostrar mini-celebracao
        const dia = this._dias.find(d => d.id === payload.new.dia_id);
        if (dia) {
          this._showDiaCelebration(dia);
        }

        // Recarregar dados
        await this._carregarDados();
        this._render();
      })
      // Escutar UPDATE nos dias liberados (ex: admin marca dia como concluido)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'onboarding_dias_liberados',
        filter: `colaborador_id=eq.${this._colaborador.id}`
      }, async () => {
        await this._carregarDados();
        this._render();
        if (this._diaAberto) this._abrirDia(this._diaAberto);
      })
      // Escutar mudancas no progresso (para sincronizar com admin updates)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'onboarding_progresso',
        filter: `colaborador_id=eq.${this._colaborador.id}`
      }, async () => {
        await this._carregarDados();
        this._render();
        if (this._diaAberto) this._abrirDia(this._diaAberto);
      })
      .subscribe();
  },

  _showDiaCelebration(dia) {
    const area = document.getElementById('onbCelebrationArea');
    if (!area) return;

    area.innerHTML = `
      <div class="onb-celebration" id="onbMiniCelebration">
        <div class="onb-celebration-content">
          <div class="onb-celebration-emoji">🔓</div>
          <div class="onb-celebration-title">Novo dia desbloqueado!</div>
          <div class="onb-celebration-msg">
            Dia ${dia.numero}: ${(typeof _escapeHtml === 'function' ? _escapeHtml : String)(dia.titulo)}<br>
            Continue seu progresso!
          </div>
          <button class="btn btn-primary" id="onbMiniCelebrationClose">Continuar</button>
        </div>
      </div>
    `;

    document.getElementById('onbMiniCelebrationClose')?.addEventListener('click', () => {
      area.innerHTML = '';
    });

    // Auto-fechar apos 5 segundos
    setTimeout(() => { area.innerHTML = ''; }, 5000);
  },

  // ── Logout ──────────────────────────────────────────────────────────────────
  _bindLogout() {
    document.getElementById('onbLogoutBtn')?.addEventListener('click', async () => {
      const client = TBO_ONBOARDING_DB.getClient();
      if (client) {
        await client.auth.signOut();
      }
      window.location.href = '../index.html';
    });
  },

  // ── Erro generico ───────────────────────────────────────────────────────────
  _showError(msg) {
    const container = document.getElementById('onbContainer');
    if (!container) return;
    container.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <i data-lucide="alert-circle" style="width:48px;height:48px;color:var(--danger);margin-bottom:16px;"></i>
        <p>${msg}</p>
        <button class="btn btn-secondary" onclick="location.reload()">Tentar novamente</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  // ── Snapshot do progresso (backup local para recovery) ──────────────────────
  _SNAPSHOT_KEY: 'tbo_onboarding_snapshot',
  _MAX_SNAPSHOTS: 10,

  _salvarSnapshot(atividadeId) {
    try {
      const snapshots = JSON.parse(localStorage.getItem(this._SNAPSHOT_KEY) || '[]');
      snapshots.push({
        ts: Date.now(),
        colaborador_id: this._colaborador.id,
        atividade_id: atividadeId,
        progresso: this._progresso.map(p => ({
          atividade_id: p.atividade_id,
          concluido: p.concluido,
          concluido_em: p.concluido_em
        })),
        dias_liberados: this._diasLiberados.map(dl => ({
          dia_id: dl.dia_id,
          concluido: dl.concluido
        }))
      });

      // Manter apenas os ultimos N snapshots
      while (snapshots.length > this._MAX_SNAPSHOTS) {
        snapshots.shift();
      }
      localStorage.setItem(this._SNAPSHOT_KEY, JSON.stringify(snapshots));
    } catch { /* localStorage indisponivel */ }
  },

  // ── Cleanup (remover realtime ao sair) ──────────────────────────────────────
  destroy() {
    if (this._realtimeChannel) {
      const client = TBO_ONBOARDING_DB.getClient();
      if (client) {
        client.removeChannel(this._realtimeChannel);
      }
      this._realtimeChannel = null;
    }
  }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => TBO_ONBOARDING.init());
// Cleanup ao sair
window.addEventListener('beforeunload', () => TBO_ONBOARDING.destroy());
