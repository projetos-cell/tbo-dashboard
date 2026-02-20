/**
 * TBO OS — Validação de inputs (client-side)
 *
 * Schema-based validation leve (sem dependência externa).
 * Para validar inputs antes de enviar ao Supabase.
 *
 * Uso:
 *   const result = TBO_VALIDATE.run(data, TBO_VALIDATE.schemas.project);
 *   if (!result.ok) { console.error(result.errors); }
 */

const TBO_VALIDATE = (() => {
  // Helpers internos
  const _isString = v => typeof v === 'string';
  const _isNumber = v => typeof v === 'number' && !isNaN(v);
  const _isBoolean = v => typeof v === 'boolean';
  const _isArray = v => Array.isArray(v);
  const _isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const _isUUID = v => _isString(v) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const _isEmail = v => _isString(v) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const _isDate = v => _isString(v) && !isNaN(Date.parse(v));

  /**
   * Valida um objeto contra um schema
   * @param {object} data - Dados a validar
   * @param {object} schema - Definição do schema {campo: {type, required, min, max, pattern, ...}}
   * @returns {{ok: boolean, errors: string[], cleaned: object}}
   */
  function run(data, schema) {
    const errors = [];
    const cleaned = {};

    if (!_isObject(data)) {
      return { ok: false, errors: ['Data deve ser um objeto'], cleaned: {} };
    }

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field}: campo obrigatório`);
        continue;
      }

      // Skip optional empty
      if (value === undefined || value === null || value === '') {
        if (rules.default !== undefined) {
          cleaned[field] = rules.default;
        }
        continue;
      }

      // Type check
      let valid = true;
      switch (rules.type) {
        case 'string':
          valid = _isString(value);
          break;
        case 'number':
          valid = _isNumber(value) || (_isString(value) && !isNaN(Number(value)));
          if (valid && _isString(value)) cleaned[field] = Number(value);
          break;
        case 'boolean':
          valid = _isBoolean(value);
          break;
        case 'array':
          valid = _isArray(value);
          break;
        case 'object':
          valid = _isObject(value);
          break;
        case 'uuid':
          valid = _isUUID(value);
          break;
        case 'email':
          valid = _isEmail(value);
          break;
        case 'date':
          valid = _isDate(value);
          break;
      }

      if (!valid) {
        errors.push(`${field}: tipo inválido (esperado: ${rules.type})`);
        continue;
      }

      // Min/Max for strings
      if (_isString(value)) {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field}: mínimo ${rules.minLength} caracteres`);
          continue;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field}: máximo ${rules.maxLength} caracteres`);
          continue;
        }
      }

      // Min/Max for numbers
      if (_isNumber(value) || (rules.type === 'number' && !isNaN(Number(value)))) {
        const num = Number(value);
        if (rules.min !== undefined && num < rules.min) {
          errors.push(`${field}: valor mínimo ${rules.min}`);
          continue;
        }
        if (rules.max !== undefined && num > rules.max) {
          errors.push(`${field}: valor máximo ${rules.max}`);
          continue;
        }
      }

      // Pattern
      if (rules.pattern && _isString(value) && !rules.pattern.test(value)) {
        errors.push(`${field}: formato inválido`);
        continue;
      }

      // Enum
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field}: valor deve ser um de [${rules.enum.join(', ')}]`);
        continue;
      }

      // Passou validação
      if (cleaned[field] === undefined) cleaned[field] = value;
    }

    return {
      ok: errors.length === 0,
      errors,
      cleaned: errors.length === 0 ? { ...data, ...cleaned } : cleaned
    };
  }

  // Schemas pré-definidos por domínio
  const schemas = {
    project: {
      name: { type: 'string', required: true, minLength: 2, maxLength: 200 },
      status: { type: 'string', enum: ['active', 'paused', 'completed', 'archived'], default: 'active' },
      client_id: { type: 'uuid' },
      tenant_id: { type: 'uuid', required: true },
      start_date: { type: 'date' },
      due_date: { type: 'date' },
      budget: { type: 'number', min: 0 }
    },

    task: {
      title: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      project_id: { type: 'uuid', required: true },
      assignee_id: { type: 'uuid' },
      status: { type: 'string', enum: ['todo', 'in_progress', 'review', 'done'], default: 'todo' },
      priority: { type: 'number', min: 0, max: 4, default: 0 },
      due_date: { type: 'date' }
    },

    profile: {
      full_name: { type: 'string', required: true, minLength: 2, maxLength: 200 },
      email: { type: 'email', required: true },
      role: { type: 'string', required: true },
      tenant_id: { type: 'uuid', required: true }
    },

    chatMessage: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      channel_id: { type: 'uuid', required: true },
      sender_id: { type: 'uuid', required: true }
    },

    financialTransaction: {
      amount: { type: 'number', required: true },
      type: { type: 'string', required: true, enum: ['income', 'expense'] },
      category_id: { type: 'uuid' },
      description: { type: 'string', maxLength: 500 },
      date: { type: 'date', required: true },
      tenant_id: { type: 'uuid', required: true }
    }
  };

  return { run, schemas };
})();

if (typeof window !== 'undefined') {
  window.TBO_VALIDATE = TBO_VALIDATE;
}
