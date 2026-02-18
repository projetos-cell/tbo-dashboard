// TBO OS — Multi-Provider AI API Wrapper (Claude + OpenAI/ChatGPT)
const TBO_API = {

  // ── Provider Management ─────────────────────────────────────────────
  getProvider() {
    return localStorage.getItem('tbo_api_provider') || 'openai'; // 'claude' or 'openai'
  },

  setProvider(provider) {
    localStorage.setItem('tbo_api_provider', provider);
  },

  // ── API Keys (per provider) ─────────────────────────────────────────
  getApiKey() {
    const provider = this.getProvider();
    return localStorage.getItem(`tbo_api_key_${provider}`) || localStorage.getItem('tbo_api_key') || '';
  },

  setApiKey(key) {
    const provider = this.getProvider();
    localStorage.setItem(`tbo_api_key_${provider}`, key);
    // Also keep legacy key for backwards compatibility
    localStorage.setItem('tbo_api_key', key);
  },

  getApiKeyFor(provider) {
    return localStorage.getItem(`tbo_api_key_${provider}`) || '';
  },

  setApiKeyFor(provider, key) {
    localStorage.setItem(`tbo_api_key_${provider}`, key);
  },

  // ── Model Management ────────────────────────────────────────────────
  getModel() {
    const provider = this.getProvider();
    if (provider === 'openai') {
      return localStorage.getItem('tbo_model_openai') || 'gpt-4o';
    }
    return localStorage.getItem('tbo_model') || 'claude-sonnet-4-20250514';
  },

  setModel(model) {
    const provider = this.getProvider();
    if (provider === 'openai') {
      localStorage.setItem('tbo_model_openai', model);
    } else {
      localStorage.setItem('tbo_model', model);
    }
  },

  getAvailableModels() {
    return {
      claude: [
        { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (recomendado)' },
        { id: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
        { id: 'claude-haiku-4-20250414', label: 'Claude Haiku 4 (rapido/economico)' }
      ],
      openai: [
        { id: 'gpt-4o', label: 'GPT-4o (recomendado)' },
        { id: 'gpt-4o-mini', label: 'GPT-4o Mini (rapido/economico)' },
        { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (mais barato)' }
      ]
    };
  },

  isConfigured() {
    return !!this.getApiKey();
  },

  getProviderLabel() {
    return this.getProvider() === 'openai' ? 'OpenAI (ChatGPT)' : 'Anthropic (Claude)';
  },

  // ── Unified Call (routes to correct provider) ───────────────────────
  async call(systemPrompt, userMessage, options = {}) {
    const provider = this.getProvider();
    if (provider === 'openai') {
      return this._callOpenAI(systemPrompt, userMessage, options);
    }
    return this._callClaude(systemPrompt, userMessage, options);
  },

  // ── Claude API Call ─────────────────────────────────────────────────
  async _callClaude(systemPrompt, userMessage, options = {}) {
    const apiKey = this.getApiKeyFor('claude') || this.getApiKey();
    if (!apiKey) {
      throw new Error('API key Claude nao configurada. Acesse Configuracoes para inserir sua chave.');
    }

    const model = options.model || localStorage.getItem('tbo_model') || 'claude-sonnet-4-20250514';
    const maxTokens = options.maxTokens || 4096;
    const temperature = options.temperature || 0.7;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model, max_tokens: maxTokens, temperature, system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('API key Claude invalida. Verifique nas Configuracoes.');
        if (response.status === 429) throw new Error('Limite de requisicoes atingido. Aguarde e tente novamente.');
        throw new Error(errorData.error?.message || `Erro ${response.status} na API Claude`);
      }

      const data = await response.json();
      return {
        text: data.content[0]?.text || '',
        usage: data.usage,
        model: data.model,
        provider: 'claude',
        stopReason: data.stop_reason
      };
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexao. Verifique sua internet.');
      }
      throw error;
    }
  },

  // ── OpenAI API Call ─────────────────────────────────────────────────
  async _callOpenAI(systemPrompt, userMessage, options = {}) {
    const apiKey = this.getApiKeyFor('openai');
    if (!apiKey) {
      throw new Error('API key OpenAI nao configurada. Acesse Configuracoes para inserir sua chave.');
    }

    const model = options.model || localStorage.getItem('tbo_model_openai') || 'gpt-4o';
    const maxTokens = options.maxTokens || 4096;
    const temperature = options.temperature || 0.7;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('API key OpenAI invalida. Verifique nas Configuracoes.');
        if (response.status === 429) throw new Error('Limite de requisicoes OpenAI atingido. Aguarde e tente novamente.');
        if (response.status === 402) throw new Error('Creditos OpenAI insuficientes. Verifique sua conta em platform.openai.com.');
        throw new Error(errorData.error?.message || `Erro ${response.status} na API OpenAI`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      return {
        text: choice?.message?.content || '',
        usage: data.usage ? {
          input_tokens: data.usage.prompt_tokens,
          output_tokens: data.usage.completion_tokens
        } : null,
        model: data.model,
        provider: 'openai',
        stopReason: choice?.finish_reason
      };
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexao. Verifique sua internet.');
      }
      throw error;
    }
  },

  // ── Context Call (with module prompts) ──────────────────────────────
  async callWithContext(moduleKey, userMessage, additionalContext = '', options = {}) {
    if (typeof TBO_CONFIG === 'undefined') {
      throw new Error('Configuracao nao carregada.');
    }

    let systemPrompt = TBO_CONFIG.systemPromptBase;

    // Add module-specific prompt
    if (TBO_CONFIG.modulePrompts[moduleKey]) {
      systemPrompt += '\n\n' + TBO_CONFIG.modulePrompts[moduleKey];
    }

    // Add additional context (project data, meeting data, etc.)
    if (additionalContext) {
      systemPrompt += '\n\n[CONTEXTO ADICIONAL]\n' + additionalContext;
    }

    // Context windowing: truncate if too long (keep under ~100k chars for Claude, ~60k for OpenAI)
    const maxLen = this.getProvider() === 'openai' ? 60000 : 100000;
    if (systemPrompt.length > maxLen) {
      systemPrompt = systemPrompt.substring(0, maxLen) + '\n\n[Contexto truncado por limite de tamanho]';
    }

    return this.call(systemPrompt, userMessage, options);
  },

  // ── Streaming Call ──────────────────────────────────────────────────
  async callStreaming(systemPrompt, userMessage, onChunk, options = {}) {
    const provider = this.getProvider();
    if (provider === 'openai') {
      return this._streamOpenAI(systemPrompt, userMessage, onChunk, options);
    }
    return this._streamClaude(systemPrompt, userMessage, onChunk, options);
  },

  async _streamClaude(systemPrompt, userMessage, onChunk, options = {}) {
    const apiKey = this.getApiKeyFor('claude') || this.getApiKey();
    if (!apiKey) throw new Error('API key Claude nao configurada.');

    const model = options.model || localStorage.getItem('tbo_model') || 'claude-sonnet-4-20250514';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model, max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        stream: true, system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!response.ok) throw new Error(`Erro ${response.status} na API Claude`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '', buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullText += parsed.delta.text;
              onChunk(parsed.delta.text, fullText);
            }
          } catch (e) { /* skip */ }
        }
      }
    }
    return { text: fullText, provider: 'claude' };
  },

  async _streamOpenAI(systemPrompt, userMessage, onChunk, options = {}) {
    const apiKey = this.getApiKeyFor('openai');
    if (!apiKey) throw new Error('API key OpenAI nao configurada.');

    const model = options.model || localStorage.getItem('tbo_model_openai') || 'gpt-4o';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model, max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!response.ok) throw new Error(`Erro ${response.status} na API OpenAI`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '', buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              onChunk(delta, fullText);
            }
          } catch (e) { /* skip */ }
        }
      }
    }
    return { text: fullText, provider: 'openai' };
  },

  // ── Cache ───────────────────────────────────────────────────────────
  _cache: new Map(),
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes

  async callCached(cacheKey, systemPrompt, userMessage, options = {}) {
    const cached = this._cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
      return cached.response;
    }
    const response = await this.call(systemPrompt, userMessage, options);
    this._cache.set(cacheKey, { response, timestamp: Date.now() });
    return response;
  },

  clearCache() {
    this._cache.clear();
  }
};
