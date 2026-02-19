// ============================================================================
// TBO OS — Parser CSV Bancario
// Detecta layout de banco (Itau, Bradesco, BB, Nubank, Inter, Santander)
// e converte extrato CSV em transacoes normalizadas.
// ============================================================================

const TBO_CSV_PARSER = {

  // Layouts conhecidos de bancos brasileiros
  _layouts: {
    itau: {
      name: 'Itau',
      separator: ';',
      dateCol: 0,
      descCol: 1,
      amountCol: 2,
      dateFormat: 'DD/MM/YYYY',
      skipLines: 0,
      detectPattern: /itau|itaú/i
    },
    bradesco: {
      name: 'Bradesco',
      separator: ';',
      dateCol: 0,
      descCol: 1,
      amountCol: 3,
      dateFormat: 'DD/MM/YYYY',
      skipLines: 1,
      detectPattern: /bradesco/i
    },
    bb: {
      name: 'Banco do Brasil',
      separator: ',',
      dateCol: 0,
      descCol: 2,
      amountCol: 5,
      dateFormat: 'DD/MM/YYYY',
      skipLines: 1,
      detectPattern: /banco do brasil|bb\b/i
    },
    nubank: {
      name: 'Nubank',
      separator: ',',
      dateCol: 0,
      descCol: 1,
      amountCol: 2,
      dateFormat: 'YYYY-MM-DD',
      skipLines: 1,
      detectPattern: /nubank|nu\b|date,title,amount/i
    },
    inter: {
      name: 'Banco Inter',
      separator: ';',
      dateCol: 0,
      descCol: 1,
      amountCol: 2,
      dateFormat: 'DD/MM/YYYY',
      skipLines: 1,
      detectPattern: /inter|banco inter/i
    },
    santander: {
      name: 'Santander',
      separator: ';',
      dateCol: 0,
      descCol: 1,
      amountCol: 2,
      dateFormat: 'DD/MM/YYYY',
      skipLines: 3,
      detectPattern: /santander/i
    },
    generic: {
      name: 'Generico',
      separator: ',',
      dateCol: 0,
      descCol: 1,
      amountCol: 2,
      dateFormat: 'auto',
      skipLines: 1,
      detectPattern: null
    }
  },

  /**
   * Parseia CSV bancario com deteccao automatica de layout.
   * @param {string} rawText - Conteudo do arquivo CSV
   * @param {string} [forceLayout] - Slug do layout (ex: 'nubank')
   * @returns {{ bank: string, transactions: Array, rawLines: number }}
   */
  parse(rawText, forceLayout) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('CSV: conteudo vazio ou invalido.');
    }

    const layout = forceLayout
      ? this._layouts[forceLayout] || this._layouts.generic
      : this._detectLayout(rawText);

    const lines = rawText.split(/\r?\n/).filter(l => l.trim());
    const dataLines = lines.slice(layout.skipLines);
    const transactions = [];

    for (const line of dataLines) {
      const cols = this._splitCSV(line, layout.separator);
      if (!cols || cols.length < 3) continue;

      const dateRaw = (cols[layout.dateCol] || '').trim();
      const desc = (cols[layout.descCol] || '').trim();
      const amountRaw = (cols[layout.amountCol] || '').trim();

      // Pular linhas de totais, cabecalhos repetidos
      if (!dateRaw || !amountRaw) continue;
      if (/^(data|date|total|saldo)/i.test(dateRaw)) continue;

      const date = this._parseDate(dateRaw, layout.dateFormat);
      const amount = this._parseAmount(amountRaw);

      if (!date) continue; // linha invalida

      transactions.push({
        date,
        description: desc,
        amount,
        isCredit: amount > 0,
        absAmount: Math.abs(amount),
        typeLabel: amount > 0 ? 'Credito' : 'Debito',
        _rawLine: line
      });
    }

    // Ordenar por data (mais recente primeiro)
    transactions.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return {
      bank: layout.name,
      transactions,
      rawLines: lines.length
    };
  },

  /**
   * Detecta layout de banco pela analise do conteudo CSV
   */
  _detectLayout(text) {
    const firstLines = text.substring(0, 500).toLowerCase();

    for (const [, layout] of Object.entries(this._layouts)) {
      if (layout.detectPattern && layout.detectPattern.test(firstLines)) {
        return layout;
      }
    }

    // Tentar detectar por header
    if (/date,title,amount/i.test(firstLines)) return this._layouts.nubank;
    if (/data;histórico|data;descri/i.test(firstLines)) return this._layouts.itau;

    return this._layouts.generic;
  },

  /**
   * Split CSV respeitando aspas
   */
  _splitCSV(line, separator) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === separator && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result.map(s => s.replace(/^"|"$/g, '').trim());
  },

  /**
   * Parse data em diversos formatos
   */
  _parseDate(raw, format) {
    if (!raw) return '';

    // YYYY-MM-DD (ja ISO)
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    // DD/MM/YYYY ou DD-MM-YYYY
    const brMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (brMatch) {
      const d = brMatch[1].padStart(2, '0');
      const m = brMatch[2].padStart(2, '0');
      return `${brMatch[3]}-${m}-${d}`;
    }

    // MM/DD/YYYY (auto detect se format = 'auto')
    if (format === 'auto') {
      const usMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (usMatch) {
        const m = usMatch[1].padStart(2, '0');
        const d = usMatch[2].padStart(2, '0');
        // Se mes > 12, e provavelmente DD/MM
        if (parseInt(m) > 12) {
          return `${usMatch[3]}-${d}-${m}`;
        }
        return `${usMatch[3]}-${m}-${d}`;
      }
    }

    return '';
  },

  /**
   * Parse valor monetario (R$ 1.234,56 ou -1234.56)
   */
  _parseAmount(raw) {
    if (!raw) return 0;
    let clean = raw.replace(/[R$\s]/g, '');

    // Detectar formato brasileiro (1.234,56) vs americano (1,234.56)
    const hasCommaDec = /,\d{2}$/.test(clean);
    const hasDotDec = /\.\d{2}$/.test(clean);

    if (hasCommaDec) {
      // Formato BR: remover pontos de milhar, trocar virgula por ponto
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (!hasDotDec && clean.includes(',')) {
      // Se virgula mas sem 2 casas decimais, tentar como BR
      clean = clean.replace(/\./g, '').replace(',', '.');
    }

    return parseFloat(clean) || 0;
  },

  /**
   * Retorna lista de bancos suportados
   */
  getSupportedBanks() {
    return Object.entries(this._layouts)
      .filter(([k]) => k !== 'generic')
      .map(([slug, l]) => ({ slug, name: l.name }));
  },

  /**
   * Ler arquivo File como texto
   */
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo CSV.'));
      // Tentar UTF-8 primeiro, fallback para latin-1
      reader.readAsText(file, 'UTF-8');
    });
  },

  /**
   * Pipeline completo: File -> transacoes
   */
  async parseFile(file, forceLayout) {
    const text = await this.readFile(file);
    return this.parse(text, forceLayout);
  }
};
