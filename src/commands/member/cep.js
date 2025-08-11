const axios = require('axios');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, ServiceUnavailableError } = require(`${BASE_DIR}/errors`);

const CEP_API_NETWORK = [
  {
    name: 'ViaCEP',
    endpoint: cep => `https://viacep.com.br/ws/${cep}/json/`,
    validator: data => !data.erro,
    priority: 1,
    timeout: 3000
  },
  {
    name: 'BrasilAPI',
    endpoint: cep => `https://brasilapi.com.br/api/cep/v1/${cep}`,
    validator: data => data.cep,
    priority: 2,
    timeout: 4000,
    retry: 2
  }
].sort((a, b) => a.priority - b.priority);

class CEPValidator {
  static validate(cep) {
    const cleaned = this.clean(cep);
    if (cleaned.length !== 8) throw new InvalidParameterError('❌ CEP deve ter 8 dígitos');
    if (/^(\d)\1{7}$/.test(cleaned)) throw new InvalidParameterError('❌ CEP sequência repetida');
    return cleaned;
  }

  static clean(cep) {
    return cep.replace(/\D/g, '');
  }

  static format(cep) {
    const cleaned = this.clean(cep);
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
  }
}

class CEPConsultant {
  constructor() {
    this.cache = new Map();
  }

  async query(cep) {
    const cleanedCEP = CEPValidator.clean(cep);
    if (this.cache.has(cleanedCEP)) return this.cache.get(cleanedCEP);
    
    for (const api of CEP_API_NETWORK) {
      try {
        const data = await this._queryAPI(api, cleanedCEP);
        if (data && api.validator(data)) {
          const normalized = this._normalizeData(data, api.name);
          this.cache.set(cleanedCEP, normalized);
          return normalized;
        }
      } catch (error) {
        console.error(`[CEP] API ${api.name} falhou: ${error.message}`);
      }
    }
    throw new ServiceUnavailableError('🔴 Todas as APIs falharam');
  }

  async _queryAPI(api, cep) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), api.timeout);
    try {
      const response = await axios.get(api.endpoint(cep), {
        signal: controller.signal,
        headers: { 'User-Agent': 'CEPBot/2.0' }
      });
      return response.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  _normalizeData(data, source) {
    return {
      cep: data.cep || '🚫 Não informado',
      logradouro: data.logradouro || data.address || '🚫 Não informado',
      complemento: data.complemento || data.complement || '🚫 Nenhum',
      bairro: data.bairro || data.district || '🚫 Não informado',
      localidade: data.localidade || data.city || '🚫 Não informado',
      uf: data.uf || data.state || '🚫 --',
      ddd: data.ddd || '🚫 --',
      ibge: data.ibge || '🚫 --',
      source
    };
  }
}

module.exports = {
  name: "consultacep",
  commands: ["cep", "consultacep"],
  usage: `${PREFIX}cep <CEP>`,
  handle: async ({ args, sendReply, sendErrorReply }) => {
    try {
      if (!args[0]) return sendErrorReply(`📛 Informe um CEP\nEx: ${PREFIX}cep 01001000`);
      
      const cep = CEPValidator.validate(args[0]);
      const data = await new CEPConsultant().query(cep);
      
      await sendReply(`
📮 *CEP:* ${CEPValidator.format(data.cep)}
🏠 *Endereço:* ${data.logradouro}, ${data.complemento}
🏘️ *Bairro:* ${data.bairro}
🏙️ *Cidade/UF:* ${data.localidade}/${data.uf}
📞 *DDD:* ${data.ddd}
🔍 *Fonte:* ${data.source}
      `.trim());
    } catch (error) {
      sendErrorReply(error.message.includes('CEP') ? error.message : '🔴 Falha na consulta');
    }
  }
};