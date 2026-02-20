/**
 * TBO OS — Details Panel (Painel contextual lateral)
 *
 * Abre à direita ao clicar em qualquer item de lista.
 * Exibe título editável, campos, descrição, seções (comentários, atividade).
 * Fecha sem perder contexto do módulo.
 *
 * API:
 *   TBO_DETAILS_PANEL.open({ entity, entityId, title, fields, description, sections, onSave })
 *   TBO_DETAILS_PANEL.close()
 *   TBO_DETAILS_PANEL.update(data)
 */

const TBO_DETAILS_PANEL = (() => {
  'use strict';

  let _panel = null;
  let _isOpen = false;
  let _currentData = null;
  let _saveTimer = null;

  const AUTOSAVE_DELAY = 800; // ms

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /**
   * Cria o DOM do painel (singleton)
   */
  function _createPanel() {
    if (_panel) return;

    _panel = document.createElement('div');
    _panel.className = 'dp-panel';
    _panel.setAttribute('role', 'complementary');
    _panel.setAttribute('aria-label', 'Detalhes');

    _panel.innerHTML = `
      <div class="dp-header">
        <span class="dp-header-entity" id="dpEntity"></span>
        <span class="dp-header-spacer"></span>
        <div class="dp-header-actions">
          <button class="dp-header-btn" id="dpExpandBtn" title="Abrir em tela cheia">
            <i data-lucide="maximize-2"></i>
          </button>
          <button class="dp-header-btn" id="dpCloseBtn" title="Fechar (Esc)">
            <i data-lucide="x"></i>
          </button>
        </div>
      </div>
      <div class="dp-body" id="dpBody">
        <input class="dp-title" id="dpTitle" type="text" placeholder="Sem título" autocomplete="off" spellcheck="false">
        <div class="dp-fields" id="dpFields"></div>
        <div class="dp-description">
          <div class="dp-description-content" id="dpDescription" contenteditable="true" role="textbox" aria-label="Descrição"></div>
        </div>
        <div id="dpSections"></div>
      </div>
    `;

    document.body.appendChild(_panel);

    // Eventos
    _panel.querySelector('#dpCloseBtn').addEventListener('click', close);
    _panel.querySelector('#dpExpandBtn').addEventListener('click', _expandToRoute);

    // Autosave no título
    _panel.querySelector('#dpTitle').addEventListener('input', () => _scheduleAutosave('title'));

    // Autosave na descrição
    _panel.querySelector('#dpDescription').addEventListener('input', () => _scheduleAutosave('description'));

    // Escape para fechar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _isOpen) close();
    });

    if (window.lucide) lucide.createIcons({ root: _panel });
  }

  /**
   * Agendar autosave
   */
  function _scheduleAutosave(field) {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
      if (!_currentData || !_currentData.onSave) return;

      const titleEl = _panel.querySelector('#dpTitle');
      const descEl = _panel.querySelector('#dpDescription');

      const changes = {};
      if (field === 'title' && titleEl) changes.title = titleEl.value;
      if (field === 'description' && descEl) changes.description = descEl.innerText;

      _currentData.onSave(changes, _currentData.entityId);
    }, AUTOSAVE_DELAY);
  }

  /**
   * Navegar para a rota completa do item (expandir)
   */
  function _expandToRoute() {
    if (!_currentData) return;
    const { entity, entityId } = _currentData;
    if (entity && entityId) {
      window.location.hash = `${entity}/${entityId}`;
      close();
    }
  }

  /**
   * Renderiza os campos de metadados
   * @param {Array} fields - [{ label, value, type, key, options? }]
   */
  function _renderFields(fields) {
    const container = _panel.querySelector('#dpFields');
    if (!container || !fields) {
      if (container) container.innerHTML = '';
      return;
    }

    container.innerHTML = fields.map(f => {
      const isEmpty = !f.value && f.value !== 0;
      const displayValue = isEmpty
        ? 'Adicionar...'
        : _escHtml(String(f.value));

      const valueClass = isEmpty
        ? 'dp-field-value dp-field-value--empty'
        : 'dp-field-value';

      return `<div class="dp-field" data-field-key="${_escHtml(f.key || '')}">
        <span class="dp-field-label">${_escHtml(f.label)}</span>
        <span class="${valueClass}" data-editable="${_escHtml(f.key || '')}" data-type="${_escHtml(f.type || 'text')}">${displayValue}</span>
      </div>`;
    }).join('');

    // Bind click-to-edit em cada campo
    container.querySelectorAll('.dp-field-value[data-editable]').forEach(el => {
      el.addEventListener('click', () => _startFieldEdit(el));
    });
  }

  /**
   * Inicia edição inline de um campo
   */
  function _startFieldEdit(el) {
    const key = el.dataset.editable;
    const type = el.dataset.type;
    if (!key) return;

    // Pegar valor atual (sem o placeholder)
    const currentValue = el.classList.contains('dp-field-value--empty')
      ? ''
      : el.textContent;

    if (type === 'select') {
      // Selects seriam implementados com dropdown customizado
      // Por ora, usar prompt simples
      return;
    }

    // Criar input inline
    const input = document.createElement('input');
    input.type = type === 'date' ? 'date' : 'text';
    input.value = currentValue;
    input.className = 'dp-field-input';
    input.style.cssText = 'width:100%;padding:2px 6px;font-size:13px;border:1px solid var(--brand-orange,#E85102);border-radius:3px;outline:none;font-family:inherit;';

    el.replaceWith(input);
    input.focus();
    input.select();

    const _finish = () => {
      const newValue = input.value.trim();
      const newEl = document.createElement('span');
      const isEmpty = !newValue;
      newEl.className = isEmpty ? 'dp-field-value dp-field-value--empty' : 'dp-field-value';
      newEl.dataset.editable = key;
      newEl.dataset.type = type;
      newEl.textContent = isEmpty ? 'Adicionar...' : newValue;

      input.replaceWith(newEl);
      newEl.addEventListener('click', () => _startFieldEdit(newEl));

      // Autosave
      if (newValue !== currentValue && _currentData?.onSave) {
        _currentData.onSave({ [key]: newValue }, _currentData.entityId);
      }
    };

    input.addEventListener('blur', _finish);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = currentValue; input.blur(); }
    });
  }

  /**
   * Renderiza seções customizáveis (comentários, atividade, etc.)
   * @param {Array} sections - [{ id, label, icon, html }]
   */
  function _renderSections(sections) {
    const container = _panel.querySelector('#dpSections');
    if (!container || !sections) {
      if (container) container.innerHTML = '';
      return;
    }

    container.innerHTML = sections.map(s =>
      `<div class="dp-section" id="dpSection_${_escHtml(s.id)}">
        <div class="dp-section-header">
          ${s.icon ? `<i data-lucide="${_escHtml(s.icon)}"></i>` : ''}
          ${_escHtml(s.label)}
        </div>
        <div class="dp-section-content">${s.html || ''}</div>
      </div>`
    ).join('');

    if (window.lucide) lucide.createIcons({ root: container });
  }

  /**
   * Abre o painel com dados
   */
  function open(data) {
    _createPanel();
    _currentData = data;

    // Entity label
    const entityEl = _panel.querySelector('#dpEntity');
    if (entityEl) {
      entityEl.innerHTML = `${data.entityIcon ? `<i data-lucide="${_escHtml(data.entityIcon)}"></i>` : ''} ${_escHtml(data.entity || 'Item')}`;
    }

    // Título
    const titleEl = _panel.querySelector('#dpTitle');
    if (titleEl) titleEl.value = data.title || '';

    // Campos
    _renderFields(data.fields);

    // Descrição
    const descEl = _panel.querySelector('#dpDescription');
    if (descEl) descEl.innerText = data.description || '';

    // Seções
    _renderSections(data.sections);

    // Abrir com animação
    requestAnimationFrame(() => {
      _panel.classList.add('dp-panel--open');
    });
    _isOpen = true;

    if (window.lucide) lucide.createIcons({ root: _panel });
  }

  /**
   * Fecha o painel
   */
  function close() {
    if (!_panel || !_isOpen) return;
    clearTimeout(_saveTimer);
    _panel.classList.remove('dp-panel--open');
    _isOpen = false;
    _currentData = null;
  }

  /**
   * Atualiza dados sem re-abrir
   */
  function update(data) {
    if (!_isOpen || !_panel) return;

    if (data.title !== undefined) {
      const titleEl = _panel.querySelector('#dpTitle');
      if (titleEl) titleEl.value = data.title;
    }

    if (data.fields) _renderFields(data.fields);
    if (data.description !== undefined) {
      const descEl = _panel.querySelector('#dpDescription');
      if (descEl) descEl.innerText = data.description;
    }
    if (data.sections) _renderSections(data.sections);
  }

  /**
   * Atualiza conteúdo de uma seção específica
   */
  function updateSection(sectionId, html) {
    if (!_panel) return;
    const section = _panel.querySelector(`#dpSection_${sectionId} .dp-section-content`);
    if (section) section.innerHTML = html;
  }

  return {
    open,
    close,
    update,
    updateSection,
    get isOpen() { return _isOpen; },
    get currentData() { return _currentData ? { ..._currentData } : null; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_DETAILS_PANEL = TBO_DETAILS_PANEL;
}
