// TBO OS — Claude API Wrapper
const TBO_API = {
  getApiKey() {
    return localStorage.getItem('tbo_api_key') || '';
  },

  setApiKey(key) {
    localStorage.setItem('tbo_api_key', key);
  },

  getModel() {
    return localStorage.getItem('tbo_model') || 'claude-sonnet-4-20250514';
  },

  setModel(model) {
    localStorage.setItem('tbo_model', model);
  },

  isConfigured() {
    return !!this.getApiKey();
  },

  async call(systemPrompt, userMessage, options = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key não configurada. Acesse Configurações para inserir sua chave.');
    }

    const model = options.model || this.getModel();
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
          model: model,
          max_tokens: maxTokens,
          temperature: temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('API key inválida. Verifique sua chave nas Configurações.');
        }
        if (response.status === 429) {
          throw new Error('Limite de requisições atingido. Aguarde alguns segundos e tente novamente.');
        }
        throw new Error(errorData.error?.message || `Erro ${response.status} na API`);
      }

      const data = await response.json();
      return {
        text: data.content[0]?.text || '',
        usage: data.usage,
        model: data.model,
        stopReason: data.stop_reason
      };
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique sua internet.');
      }
      throw error;
    }
  },

  async callWithContext(moduleKey, userMessage, additionalContext = '', options = {}) {
    if (typeof TBO_CONFIG === 'undefined') {
      throw new Error('Configuração não carregada.');
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

    // Context windowing: truncate if too long (keep under ~100k chars)
    if (systemPrompt.length > 100000) {
      systemPrompt = systemPrompt.substring(0, 100000) + '\n\n[Contexto truncado por limite de tamanho]';
    }

    return this.call(systemPrompt, userMessage, options);
  },

  async callStreaming(systemPrompt, userMessage, onChunk, options = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key não configurada.');
    }

    const model = options.model || this.getModel();

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
          model: model,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7,
          stream: true,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status} na API`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

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
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return { text: fullText };
    } catch (error) {
      throw error;
    }
  },

  // Cache recent responses
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
