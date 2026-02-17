// TBO OS — Module: Conteudo & Redacao
const TBO_CONTEUDO = {
  render() {
    const projects = TBO_SEARCH.getProjectList('ativos');
    const clients = TBO_SEARCH.getClientList();

    return `
      <div class="conteudo-module">
        <!-- Tabs -->
        <div class="tabs">
          <button class="tab active" data-tab="linkedin">LinkedIn</button>
          <button class="tab" data-tab="instagram">Instagram</button>
          <button class="tab" data-tab="email">Email / Comunicacao</button>
          <button class="tab" data-tab="institucional">Institucional</button>
          <button class="tab" data-tab="academy">TBO Academy</button>
        </div>

        <div id="conteudoTabContent">
          <!-- LinkedIn Tab (default) -->
          <div class="tab-panel" id="tab-linkedin">
            <div class="grid-2" style="gap:24px;">
              <!-- Form -->
              <div>
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">Gerar Post LinkedIn</h3>
                    <span class="tag gold">Marco Andolfato</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Tema / Assunto</label>
                    <input type="text" class="form-input" id="ctTema" placeholder="Ex: O valor do archviz na decisao de compra">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Projeto Relacionado (opcional)</label>
                    <select class="form-input" id="ctProjeto">
                      <option value="">Nenhum projeto especifico</option>
                      ${projects.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Formato</label>
                    <select class="form-input" id="ctFormato">
                      <option value="texto-longo">Texto Longo (reflexivo)</option>
                      <option value="carrossel">Carrossel Educativo</option>
                      <option value="storytelling">Storytelling / Case</option>
                      <option value="provocacao">Provocacao / Debate</option>
                      <option value="dados">Dados / Insights de Mercado</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Tom</label>
                    <select class="form-input" id="ctTom">
                      <option value="marco">Marco Andolfato (reflexivo, provocador)</option>
                      <option value="institucional">TBO Institucional</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Instrucoes adicionais (opcional)</label>
                    <textarea class="form-input" id="ctInstrucoes" rows="3" placeholder="Contexto extra, referencia a evento, dados especificos..."></textarea>
                  </div>

                  <button class="btn btn-primary btn-lg" id="ctGerarLinkedin" style="width:100%;">
                    Gerar Conteudo
                  </button>
                </div>
              </div>

              <!-- Output -->
              <div>
                <div id="ctOutput" class="ai-response" style="min-height:300px;">
                  <div class="empty-state">
                    <div class="empty-state-icon">\u270D\uFE0F</div>
                    <div class="empty-state-text">Preencha os campos e clique em "Gerar Conteudo"</div>
                  </div>
                </div>
                <div class="gen-actions" id="ctActions" style="display:none;">
                  <button class="btn btn-sm btn-secondary" id="ctCopy">Copiar</button>
                  <button class="btn btn-sm btn-secondary" id="ctRefine">Refinar</button>
                  <button class="btn btn-sm btn-ghost" id="ctNewVersion">Nova versao</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Instagram Tab -->
          <div class="tab-panel" id="tab-instagram" style="display:none;">
            <div class="grid-2" style="gap:24px;">
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Gerar Conteudo Instagram</h3>
                  <span class="tag gold">@tbo.arq</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Tipo de Conteudo</label>
                  <select class="form-input" id="ctIgTipo">
                    <option value="feed">Post Feed (legenda)</option>
                    <option value="carrossel">Carrossel Educativo</option>
                    <option value="reels">Reels Script</option>
                    <option value="stories">Stories Sequence</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tema</label>
                  <input type="text" class="form-input" id="ctIgTema" placeholder="Ex: Bastidores do projeto Porto Batel">
                </div>
                <div class="form-group">
                  <label class="form-label">Projeto (opcional)</label>
                  <select class="form-input" id="ctIgProjeto">
                    <option value="">Nenhum</option>
                    ${projects.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
                  </select>
                </div>
                <button class="btn btn-primary" id="ctGerarInstagram" style="width:100%;">Gerar</button>
              </div>
              <div id="ctIgOutput" class="ai-response" style="min-height:200px;">
                <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
              </div>
            </div>
          </div>

          <!-- Email Tab -->
          <div class="tab-panel" id="tab-email" style="display:none;">
            <div class="grid-2" style="gap:24px;">
              <div class="card">
                <div class="card-header"><h3 class="card-title">Gerar Email</h3></div>
                <div class="form-group">
                  <label class="form-label">Tipo</label>
                  <select class="form-input" id="ctEmailTipo">
                    <option value="prospecao">Prospecao Comercial</option>
                    <option value="followup">Follow-up</option>
                    <option value="proposta">Envio de Proposta</option>
                    <option value="agradecimento">Agradecimento pos-reuniao</option>
                    <option value="apresentacao">Apresentacao TBO</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Destinatario / Empresa</label>
                  <input type="text" class="form-input" id="ctEmailDest" placeholder="Nome da construtora ou pessoa">
                </div>
                <div class="form-group">
                  <label class="form-label">Contexto adicional</label>
                  <textarea class="form-input" id="ctEmailCtx" rows="3" placeholder="Reuniao recente, projeto em discussao, etc."></textarea>
                </div>
                <button class="btn btn-primary" id="ctGerarEmail" style="width:100%;">Gerar Email</button>
              </div>
              <div id="ctEmailOutput" class="ai-response" style="min-height:200px;">
                <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
              </div>
            </div>
          </div>

          <!-- Institucional Tab -->
          <div class="tab-panel" id="tab-institucional" style="display:none;">
            <div class="card">
              <div class="card-header"><h3 class="card-title">Texto Institucional</h3></div>
              <div class="form-group">
                <label class="form-label">Tipo de texto</label>
                <select class="form-input" id="ctInstTipo">
                  <option value="bio">Bio / Sobre a TBO</option>
                  <option value="servico">Descricao de Servico/BU</option>
                  <option value="case">Texto de Case</option>
                  <option value="manifesto">Manifesto / Posicionamento</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Instrucoes</label>
                <textarea class="form-input" id="ctInstInstr" rows="3" placeholder="O que precisa ser comunicado..."></textarea>
              </div>
              <button class="btn btn-primary" id="ctGerarInst" style="width:100%;">Gerar</button>
            </div>
            <div id="ctInstOutput" class="ai-response" style="min-height:200px; margin-top:16px;">
              <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
            </div>
          </div>

          <!-- TBO Academy Tab -->
          <div class="tab-panel" id="tab-academy" style="display:none;">
            <div class="card">
              <div class="card-header"><h3 class="card-title">TBO Academy</h3></div>
              <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:16px;">
                Gere conteudo educacional sobre archviz, marketing imobiliario e as metodologias TBO.
              </p>
              <div class="form-group">
                <label class="form-label">Topico</label>
                <input type="text" class="form-input" id="ctAcademyTopic" placeholder="Ex: Como funciona o processo de branding da TBO">
              </div>
              <div class="form-group">
                <label class="form-label">Formato</label>
                <select class="form-input" id="ctAcademyFormat">
                  <option value="artigo">Artigo completo</option>
                  <option value="roteiro">Roteiro de video</option>
                  <option value="slides">Slides / Apresentacao</option>
                  <option value="faq">FAQ / Perguntas Frequentes</option>
                </select>
              </div>
              <button class="btn btn-primary" id="ctGerarAcademy" style="width:100%;">Gerar</button>
            </div>
            <div id="ctAcademyOutput" class="ai-response" style="min-height:200px; margin-top:16px;">
              <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
            </div>
          </div>
        </div>

        <!-- History -->
        <section class="section" style="margin-top:32px;">
          <div class="section-header">
            <h2 class="section-title">Historico de Geracoes</h2>
            <button class="btn btn-sm btn-ghost" id="ctClearHistory">Limpar</button>
          </div>
          <div id="ctHistory" class="history-panel"></div>
        </section>
      </div>
    `;
  },

  init() {
    // Tab switching with breadcrumb + deep link
    document.querySelectorAll('.tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
        const panel = document.getElementById(`tab-${tab.dataset.tab}`);
        if (panel) panel.style.display = 'block';
        if (typeof TBO_UX !== 'undefined') {
          TBO_UX.updateBreadcrumb('conteudo', tab.textContent.trim());
          TBO_UX.setTabHash('conteudo', tab.dataset.tab);
        }
      });
    });

    // Generate buttons
    this._bindGenerateBtn('ctGerarLinkedin', () => this._generateLinkedin());
    this._bindGenerateBtn('ctGerarInstagram', () => this._generateInstagram());
    this._bindGenerateBtn('ctGerarEmail', () => this._generateEmail());
    this._bindGenerateBtn('ctGerarInst', () => this._generateInstitucional());
    this._bindGenerateBtn('ctGerarAcademy', () => this._generateAcademy());

    // Copy button
    const copyBtn = document.getElementById('ctCopy');
    if (copyBtn) copyBtn.addEventListener('click', () => {
      const output = document.getElementById('ctOutput');
      if (output) { navigator.clipboard.writeText(output.textContent); TBO_TOAST.success('Copiado!'); }
    });

    // Clear history with confirmation
    const clearBtn = document.getElementById('ctClearHistory');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.confirm('Limpar historico', 'Tem certeza que deseja limpar todo o historico de geracoes?', () => {
          TBO_STORAGE.clearHistory('conteudo');
          document.getElementById('ctHistory').innerHTML = '';
          TBO_TOAST.success('Historico limpo');
        }, { danger: true, confirmText: 'Limpar' });
      } else {
        TBO_STORAGE.clearHistory('conteudo');
        document.getElementById('ctHistory').innerHTML = '';
      }
    });

    this._loadHistory();
  },

  _bindGenerateBtn(id, handler) {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handler);
  },

  async _callAI(userMsg, outputId, additionalCtx = '', btnId = null) {
    if (!TBO_API.isConfigured()) {
      TBO_TOAST.warning('API nao configurada', 'Acesse Configuracoes.');
      return;
    }

    const output = document.getElementById(outputId);
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(output, 'Gerando conteudo...');
      if (btnId) TBO_UX.btnLoading(btnId, true, 'Gerando...');
    } else if (output) {
      output.textContent = 'Gerando...';
    }

    try {
      let ctx = additionalCtx;
      const result = await TBO_API.callWithContext('content', userMsg, ctx);
      if (output) output.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);

      const actions = document.getElementById('ctActions');
      if (actions) actions.style.display = 'flex';

      TBO_STORAGE.addToHistory('conteudo', { type: 'content', preview: TBO_FORMATTER.truncate(result.text, 80) });
      this._loadHistory();
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(output, e.message, () => this._callAI(userMsg, outputId, additionalCtx, btnId));
      } else if (output) {
        output.textContent = 'Erro: ' + e.message;
      }
      TBO_TOAST.error('Erro', e.message);
    } finally {
      if (typeof TBO_UX !== 'undefined' && btnId) TBO_UX.btnLoading(btnId, false);
    }
  },

  async _generateLinkedin() {
    const tema = document.getElementById('ctTema')?.value || '';
    const projeto = document.getElementById('ctProjeto')?.value || '';
    const formato = document.getElementById('ctFormato')?.value || '';
    const tom = document.getElementById('ctTom')?.value || 'marco';
    const instrucoes = document.getElementById('ctInstrucoes')?.value || '';

    if (!tema) { TBO_TOAST.warning('Preencha o tema'); return; }

    let ctx = TBO_CONFIG.getTomDeVoz(tom) + '\n' + TBO_CONFIG.getTomDeVoz('linkedin');
    if (projeto) ctx += '\n' + TBO_STORAGE.getProjectContext(projeto);

    const msg = `Crie um post para LinkedIn sobre: "${tema}".
Formato: ${formato}.
${projeto ? `Projeto relacionado: ${projeto}.` : ''}
${instrucoes ? `Instrucoes adicionais: ${instrucoes}` : ''}
Siga rigorosamente as diretrizes de tom de voz fornecidas.`;

    await this._callAI(msg, 'ctOutput', ctx, 'ctGerarLinkedin');
  },

  async _generateInstagram() {
    const tipo = document.getElementById('ctIgTipo')?.value || 'feed';
    const tema = document.getElementById('ctIgTema')?.value || '';
    const projeto = document.getElementById('ctIgProjeto')?.value || '';
    if (!tema) { TBO_TOAST.warning('Preencha o tema'); return; }

    let ctx = TBO_CONFIG.getTomDeVoz('instagram');
    if (projeto) ctx += '\n' + TBO_STORAGE.getProjectContext(projeto);

    await this._callAI(`Crie conteudo para Instagram (${tipo}) sobre: "${tema}". ${projeto ? 'Projeto: ' + projeto : ''}`, 'ctIgOutput', ctx, 'ctGerarInstagram');
  },

  async _generateEmail() {
    const tipo = document.getElementById('ctEmailTipo')?.value || '';
    const dest = document.getElementById('ctEmailDest')?.value || '';
    const ctxExtra = document.getElementById('ctEmailCtx')?.value || '';
    if (!dest) { TBO_TOAST.warning('Preencha o destinatario'); return; }

    let ctx = TBO_CONFIG.getTomDeVoz('email');
    ctx += '\n' + TBO_STORAGE.getClientContext(dest);

    await this._callAI(`Crie um email de ${tipo} para ${dest}. ${ctxExtra ? 'Contexto: ' + ctxExtra : ''}`, 'ctEmailOutput', ctx, 'ctGerarEmail');
  },

  async _generateInstitucional() {
    const tipo = document.getElementById('ctInstTipo')?.value || '';
    const instr = document.getElementById('ctInstInstr')?.value || '';
    await this._callAI(`Crie um texto institucional do tipo "${tipo}" para a TBO. ${instr ? 'Instrucoes: ' + instr : ''}`, 'ctInstOutput', TBO_CONFIG.getTomDeVoz('institucional'), 'ctGerarInst');
  },

  async _generateAcademy() {
    const topic = document.getElementById('ctAcademyTopic')?.value || '';
    const format = document.getElementById('ctAcademyFormat')?.value || 'artigo';
    if (!topic) { TBO_TOAST.warning('Preencha o topico'); return; }
    await this._callAI(`Crie conteudo educacional (${format}) sobre: "${topic}". Use as metodologias TBO como referencia quando relevante.`, 'ctAcademyOutput', '', 'ctGerarAcademy');
  },

  _loadHistory() {
    const container = document.getElementById('ctHistory');
    if (!container) return;
    const history = TBO_STORAGE.getHistory('conteudo');
    if (history.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Nenhuma geracao ainda</div></div>';
      return;
    }
    container.innerHTML = history.slice(0, 10).map(h => `
      <div class="history-item">
        <div class="history-time">${TBO_FORMATTER.relativeTime(h.timestamp)}</div>
        <div class="history-preview">${h.preview || '—'}</div>
      </div>
    `).join('');
  }
};
