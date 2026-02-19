// ============================================================================
// TBO OS — Parser OFX (Open Financial Exchange)
// Converte arquivos .ofx/.qfx em array de transacoes bancarias.
// Parsing client-side — nenhum dado enviado ao servidor.
// ============================================================================

const TBO_OFX_PARSER = {

  /**
   * Parseia conteudo OFX/QFX e retorna transacoes normalizadas.
   * @param {string} rawText - Conteudo do arquivo OFX
   * @returns {{ account: object, transactions: Array, meta: object }}
   */
  parse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('OFX: conteudo vazio ou invalido.');
    }

    // OFX pode ter header SGML antes do XML
    const xmlStart = rawText.indexOf('<OFX>');
    if (xmlStart === -1) throw new Error('OFX: tag <OFX> nao encontrada.');

    const headerText = rawText.substring(0, xmlStart);
    const xmlText = rawText.substring(xmlStart);

    const meta = this._parseHeader(headerText);
    const account = this._parseAccount(xmlText);
    const transactions = this._parseTransactions(xmlText);

    return { account, transactions, meta };
  },

  /**
   * Parseia header SGML do OFX (linhas chave:valor antes do XML)
   */
  _parseHeader(text) {
    const headers = {};
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^(\w+):(.*)$/);
      if (match) headers[match[1].trim()] = match[2].trim();
    }
    return {
      ofxVersion: headers.VERSION || headers.OFXHEADER || '',
      charset: headers.CHARSET || 'UTF-8',
      encoding: headers.ENCODING || ''
    };
  },

  /**
   * Extrai dados da conta bancaria do OFX
   */
  _parseAccount(xml) {
    return {
      bankId: this._extractTag(xml, 'BANKID'),
      accountId: this._extractTag(xml, 'ACCTID'),
      accountType: this._extractTag(xml, 'ACCTTYPE'),
      currency: this._extractTag(xml, 'CURDEF') || 'BRL',
      balanceAmount: this._parseNumber(this._extractTag(xml, 'BALAMT')),
      balanceDate: this._parseOFXDate(this._extractTag(xml, 'DTASOF'))
    };
  },

  /**
   * Extrai e normaliza todas as transacoes <STMTTRN>
   */
  _parseTransactions(xml) {
    const transactions = [];
    // Regex para capturar cada bloco STMTTRN
    const trnRegex = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>|<\/BANKTRANLIST>))/gi;
    let match;

    while ((match = trnRegex.exec(xml)) !== null) {
      const block = match[1];
      const trn = {
        type: this._extractTag(block, 'TRNTYPE') || '',
        date: this._parseOFXDate(this._extractTag(block, 'DTPOSTED')),
        amount: this._parseNumber(this._extractTag(block, 'TRNAMT')),
        fitid: this._extractTag(block, 'FITID') || '',
        checkNum: this._extractTag(block, 'CHECKNUM') || '',
        refNum: this._extractTag(block, 'REFNUM') || '',
        name: (this._extractTag(block, 'NAME') || '').trim(),
        memo: (this._extractTag(block, 'MEMO') || '').trim(),
        description: ''
      };

      // Descricao composta: NAME + MEMO
      trn.description = [trn.name, trn.memo].filter(Boolean).join(' — ');

      // Tipo legivel
      trn.typeLabel = this._typeLabel(trn.type);

      // Valor absoluto e direcao
      trn.isCredit = trn.amount > 0;
      trn.absAmount = Math.abs(trn.amount);

      transactions.push(trn);
    }

    // Ordenar por data (mais recente primeiro)
    transactions.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return transactions;
  },

  /**
   * Extrai valor de uma tag SGML-style (sem closing tags)
   * Ex: <TRNAMT>-150.00 => "-150.00"
   */
  _extractTag(text, tagName) {
    // Tenta formato XML primeiro: <TAG>value</TAG>
    const xmlRegex = new RegExp(`<${tagName}>([^<]*)</${tagName}>`, 'i');
    const xmlMatch = text.match(xmlRegex);
    if (xmlMatch) return xmlMatch[1].trim();

    // SGML-style: <TAG>value\n
    const sgmlRegex = new RegExp(`<${tagName}>([^\\n<]*)`, 'i');
    const sgmlMatch = text.match(sgmlRegex);
    return sgmlMatch ? sgmlMatch[1].trim() : '';
  },

  /**
   * Converte data OFX (YYYYMMDDHHMMSS ou YYYYMMDD) para ISO
   */
  _parseOFXDate(dateStr) {
    if (!dateStr) return '';
    // Remove timezone bracket [x:GMT]
    const clean = dateStr.replace(/\[.*\]/, '').trim();
    if (clean.length >= 8) {
      const y = clean.substring(0, 4);
      const m = clean.substring(4, 6);
      const d = clean.substring(6, 8);
      return `${y}-${m}-${d}`;
    }
    return '';
  },

  /**
   * Parse numero OFX (pode usar ponto ou virgula)
   */
  _parseNumber(str) {
    if (!str) return 0;
    const clean = str.replace(/[^\d.,-]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  },

  /**
   * Label legivel para tipo de transacao OFX
   */
  _typeLabel(type) {
    const map = {
      'CREDIT': 'Credito',
      'DEBIT': 'Debito',
      'INT': 'Juros',
      'DIV': 'Dividendos',
      'FEE': 'Taxa',
      'SRVCHG': 'Tarifa',
      'DEP': 'Deposito',
      'ATM': 'Saque ATM',
      'POS': 'Compra Debito',
      'XFER': 'Transferencia',
      'CHECK': 'Cheque',
      'PAYMENT': 'Pagamento',
      'CASH': 'Dinheiro',
      'DIRECTDEP': 'Deposito Direto',
      'DIRECTDEBIT': 'Debito Direto',
      'REPEATPMT': 'Pagamento Recorrente',
      'OTHER': 'Outro'
    };
    return map[type?.toUpperCase()] || type || 'Outro';
  },

  /**
   * Utilitario: ler arquivo File como texto
   * @param {File} file
   * @returns {Promise<string>}
   */
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      // OFX pode ser latin-1 ou utf-8
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo OFX.'));
      reader.readAsText(file, 'ISO-8859-1');
    });
  },

  /**
   * Pipeline completo: File -> transacoes
   * @param {File} file
   * @returns {Promise<{ account, transactions, meta }>}
   */
  async parseFile(file) {
    const text = await this.readFile(file);
    return this.parse(text);
  }
};
