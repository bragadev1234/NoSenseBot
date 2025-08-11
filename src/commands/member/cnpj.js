const axios = require('axios');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, ServiceUnavailableError } = require(`${BASE_DIR}/errors`);

const CNPJ_API_NETWORK = [
  {
    name: 'BrasilAPI',
    endpoint: cnpj => `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
    validator: data => data.razao_social,
    priority: 1,
    timeout: 4000
  },
  {
    name: 'MinhaReceita',
    endpoint: cnpj => `https://minhareceita.org/api/v1/cnpj/${cnpj}`,
    validator: data => data.razao_social,
    priority: 2,
    timeout: 5000,
    retry: 2
  }
].sort((a, b) => a.priority - b.priority);

class CNPJValidator {
  static clean(cnpj) {
    return cnpj.replace(/\D/g, '');
  }

  static validate(cnpj) {
    const cleaned = this.clean(cnpj);
    if (cleaned.length !== 14) throw new InvalidParameterError('❌ CNPJ deve ter 14 dígitos');
    if (/^(\d)\1{13}$/.test(cleaned)) throw new InvalidParameterError('❌ CNPJ sequência repetida');
    
    const digits = cleaned.split('').map(Number);
    const [d1, d2] = this.calculateCheckDigits(digits.slice(0, 12));
    if (digits[12] !== d1 || digits[13] !== d2) throw new InvalidParameterError('❌ CNPJ dígitos inválidos');
    
    return cleaned;
  }

  static calculateCheckDigits(numbers) {
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, ...weights1];
    const mod11 = (nums, weights) => {
      const sum = nums.reduce((acc, num, i) => acc + (num * weights[i]), 0);
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };
    return [mod11(numbers, weights1), mod11([...numbers, mod11(numbers, weights1)], weights2)];
  }
}

class CNPJConsultant {
  constructor() {
    this.cache = new Map();
  }

  async query(cnpj) {
    if (this.cache.has(cnpj)) return this.cache.get(cnpj);
    
    for (const api of CNPJ_API_NETWORK) {
      try {
        const data = await this._queryAPI(api, cnpj);
        if (data && api.validator(data)) {
          const normalized = this._normalizeData(data, api.name);
          this.cache.set(cnpj, normalized);
          return normalized;
        }
      } catch (error) {
        console.error(`[CNPJ] API ${api.name} falhou: ${error.message}`);
      }
    }
    throw new ServiceUnavailableError('🔴 Todas as APIs falharam');
  }

  async _queryAPI(api, cnpj) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), api.timeout);
    try {
      const response = await axios.get(api.endpoint(cnpj), {
        signal: controller.signal,
        headers: { 'User-Agent': 'CNPJBot/2.0' }
      });
      return response.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  _normalizeData(data, source) {
    return {
      razaoSocial: data.razao_social || data.nome || '🚫 Não informado',
      nomeFantasia: data.nome_fantasia || data.fantasia || '🚫 Não informado',
      cnae: data.cnae_fiscal_descricao || data.atividade_principal?.[0]?.text || '🚫 Não informado',
      dataAbertura: data.data_inicio_atividade || data.abertura || '🚫 Não informado',
      municipio: data.municipio || data.city || '🚫 Não informado',
      uf: data.uf || data.state || '🚫 Não informado',
      telefone: data.ddd_telefone_1 || data.telefone || '🚫 Não informado',
      situacao: data.descricao_situacao_cadastral || data.situacao || '🚫 Não informado',
      porte: data.porte || '🚫 Não informado',
      naturezaJuridica: data.natureza_juridica || '🚫 Não informado',
      source
    };
  }
}

module.exports = {
  name: "consultacnpj",
  commands: ["cnpj", "consultacnpj"],
  usage: `${PREFIX}cnpj <CNPJ>`,
  handle: async ({ args, sendReply, sendErrorReply }) => {
    try {
      if (!args[0]) return sendErrorReply(`📛 Informe um CNPJ\nEx: ${PREFIX}cnpj 12345678000195`);
      
      const cnpj = CNPJValidator.validate(args[0]);
      const data = await new CNPJConsultant().query(cnpj);
      
      await sendReply(`
📋 *CNPJ:* ${cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
🏢 *Razão Social:* ${data.razaoSocial}
🏷️ *Nome Fantasia:* ${data.nomeFantasia}
📅 *Abertura:* ${data.dataAbertura}
📍 *Local:* ${data.municipio}/${data.uf}
📞 *Tel:* ${data.telefone}
⚖️ *Situação:* ${data.situacao}
📊 *Porte:* ${data.porte}
🔍 *Fonte:* ${data.source}
      `.trim());
    } catch (error) {
      sendErrorReply(error.message.includes('CNPJ') ? error.message : '🔴 Falha na consulta');
    }
  }
};