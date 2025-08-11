const axios = require('axios');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

const PLACA_API_NETWORK = [
  {
    name: 'Placas.com.br',
    endpoint: placa => `https://placas.com.br/api/consultas/placa/${placa}`,
    validator: data => data.placa,
    priority: 1,
    timeout: 5000
  },
  {
    name: 'CarInfo',
    endpoint: placa => `https://carinfo.com.br/api/placa/${placa}`,
    validator: data => data.placa,
    priority: 2,
    timeout: 6000
  }
];

class PlacaConsultant {
  async query(placa) {
    for (const api of PLACA_API_NETWORK) {
      try {
        const data = await this._queryAPI(api, placa);
        if (data && api.validator(data)) {
          return this._normalizeData(data, api.name);
        }
      } catch (error) {
        console.error(`[PLACA] API ${api.name} falhou: ${error.message}`);
      }
    }
    throw new Error('🔴 Todas as APIs falharam');
  }

  async _queryAPI(api, placa) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), api.timeout);
    try {
      const response = await axios.get(api.endpoint(placa), {
        signal: controller.signal,
        headers: { 'User-Agent': 'PlacaBot/2.0' }
      });
      return response.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  _normalizeData(data, source) {
    return {
      placa: data.placa || '🚫 Não informada',
      marca: data.marca || data.brand || '🚫 Não informada',
      modelo: data.modelo || data.model || '🚫 Não informado',
      ano: data.ano || data.year || '🚫 Não informado',
      cor: data.cor || data.color || '🚫 Não informada',
      municipio: data.municipio || data.city || '🚫 Não informado',
      uf: data.uf || data.state || '🚫 --',
      situacao: data.situacao || data.status || '🚫 Não informada',
      chassi: data.chassi || '🚫 Não informado',
      source
    };
  }
}

module.exports = {
  name: "consultaplaca",
  commands: ["placa", "consultaplaca"],
  usage: `${PREFIX}placa <PLACA>`,
  handle: async ({ args, sendReply, sendErrorReply }) => {
    try {
      if (!args[0]) return sendErrorReply(`📛 Informe uma placa\nEx: ${PREFIX}placa ABC1234`);
      
      const placa = args[0].toUpperCase();
      if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa)) {
        throw new InvalidParameterError('❌ Formato de placa inválido');
      }
      
      const data = await new PlacaConsultant().query(placa);
      
      await sendReply(`
🚗 *Placa:* ${data.placa}
🏭 *Marca/Modelo:* ${data.marca} ${data.modelo}
📅 *Ano:* ${data.ano}
🎨 *Cor:* ${data.cor}
📍 *Local:* ${data.municipio}/${data.uf}
🔄 *Situação:* ${data.situacao}
🔢 *Chassi:* ${data.chassi}
🔍 *Fonte:* ${data.source}
      `.trim());
    } catch (error) {
      sendErrorReply(error.message.includes('placa') ? error.message : '🔴 Falha na consulta');
    }
  }
};