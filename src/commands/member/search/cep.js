const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, ServiceUnavailableError } = require(`${BASE_DIR}/errors`);

// 🌐 Constelação de APIs CEP
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
    timeout: 4000
  },
  {
    name: 'Postmon',
    endpoint: cep => `https://api.postmon.com.br/v1/cep/${cep}`,
    validator: data => data.cep,
    priority: 3,
    timeout: 5000
  },
  {
    name: 'OpenCEP',
    endpoint: cep => `https://opencep.com/v1/${cep}`,
    validator: data => data.cep,
    priority: 4,
    timeout: 4500
  },
  {
    name: 'WideCEP',
    endpoint: cep => `https://cep.awesomeapi.com.br/json/${cep}`,
    validator: data => data.cep,
    priority: 5,
    timeout: 4000,
    fallbackOnly: true
  }
].sort((a, b) => a.priority - b.priority);

// 🛡️ Validador de CEP
class CEPValidator {
  static validate(cep) {
    const cleaned = this.clean(cep);
    
    if (cleaned.length !== 8) {
      throw new InvalidParameterError('CEP deve conter 8 dígitos');
    }

    if (/^(\d)\1{7}$/.test(cleaned)) {
      throw new InvalidParameterError('CEP inválido (sequência repetida)');
    }

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

// 🔄 Sistema de Tentativas Adaptáveis
class CEPRetryManager {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async executeWithRetry(fn, retriesLeft = this.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (retriesLeft <= 0) throw error;
      
      const delay = this.baseDelay * (this.maxRetries - retriesLeft + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.executeWithRetry(fn, retriesLeft - 1);
    }
  }
}

// 🌐 Consultor Multi-API
class CEPConsultant {
  constructor() {
    this.retryManager = new CEPRetryManager();
    this.cache = new Map();
  }

  async query(cep) {
    const cleanedCEP = CEPValidator.clean(cep);
    const cached = this.cache.get(cleanedCEP);
    if (cached) {
      console.log(`[CEP] Retornando do cache: ${cleanedCEP}`);
      return cached;
    }

    let lastError;
    
    for (const api of CEP_API_NETWORK) {
      if (api.fallbackOnly && !lastError) continue;
      
      try {
        console.log(`[CEP] Tentando ${api.name} para ${cleanedCEP}`);
        
        const data = await this.retryManager.executeWithRetry(
          () => this._queryAPI(api, cleanedCEP),
          api.retry || 1
        );

        if (data && api.validator(data)) {
          const normalized = this._normalizeData(data, api.name);
          this.cache.set(cleanedCEP, normalized);
          return normalized;
        }
      } catch (error) {
        console.error(`[CEP] API ${api.name} falhou: ${error.message}`);
        lastError = error;
      }
    }

    throw lastError || new ServiceUnavailableError('Todas as APIs de CEP falharam');
  }

  async _queryAPI(api, cep) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), api.timeout);

    try {
      const response = await axios.get(api.endpoint(cep), {
        signal: controller.signal,
        headers: { 
          'User-Agent': 'CEPBot/2.0',
          'Accept': 'application/json'
        }
      });

      return response.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  _normalizeData(data, source) {
    // Padroniza dados de diferentes APIs
    return {
      cep: data.cep || Object.values(data).find(v => typeof v === 'string' && v.match(/\d{5}-?\d{3}/)) || '',
      logradouro: data.logradouro || data.address || data.street || '',
      complemento: data.complemento || data.complement || '',
      bairro: data.bairro || data.district || data.neighborhood || '',
      localidade: data.localidade || data.city || data.cidade || '',
      uf: data.uf || data.state || '',
      ddd: data.ddd || '',
      ibge: data.ibge || data.city_ibge || '',
      gia: data.gia || '',
      siafi: data.siafi || '',
      source
    };
  }
}

// 🗺️ Serviço de Georreferenciamento
class GeoService {
  static async getCoordinates(address) {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'CEPBot/2.0'
        }
      });

      return response.data[0] ? {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      } : null;
    } catch (error) {
      console.error(`GeoService error: ${error.message}`);
      return null;
    }
  }

  static getGoogleMapsLink(lat, lon) {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  }

  static getStreetViewLink(lat, lon) {
    return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`;
  }
}

// 📊 Gerador de Relatórios
class CEPReport {
  static async generate(cepData) {
    const coordinates = await GeoService.getCoordinates(
      `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}`
    );

    const formatField = (value, fallback = 'Não informado') => 
      value ? value : fallback;

    return `
📮 *RELATÓRIO CEP COMPLETO* 📮

📍 *CEP:* ${CEPValidator.format(cepData.cep)}

🏠 *Endereço:*
▸ Logradouro: ${formatField(cepData.logradouro)}
▸ Complemento: ${formatField(cepData.complemento, 'Nenhum')}
▸ Bairro: ${formatField(cepData.bairro)}

🏙️ *Localidade:*
▸ Cidade: ${formatField(cepData.localidade)}
▸ UF: ${formatField(cepData.uf)}
▸ Código IBGE: ${formatField(cepData.ibge)}

📞 *Telefonia:*
▸ DDD: ${formatField(cepData.ddd)}

🌐 *Geolocalização:*
${
  coordinates 
    ? `▸ Coordenadas: ${coordinates.lat}, ${coordinates.lon}\n` +
      `▸ Google Maps: ${GeoService.getGoogleMapsLink(coordinates.lat, coordinates.lon)}\n` +
      `▸ Street View: ${GeoService.getStreetViewLink(coordinates.lat, coordinates.lon)}`
    : '▸ Localização não disponível'
}

🔍 *Metadados:*
▸ Fonte: ${formatField(cepData.source)}
▸ Consulta em: ${new Date().toLocaleString('pt-BR')}

💡 *Dica:* Use o Street View para visualizar o local!
`.trim();
  }
}

// Módulo principal
const consultant = new CEPConsultant();

module.exports = {
  name: "consultacep",
  description: "Consulta CEP com múltiplas fontes e geolocalização",
  commands: ["cep", "consultacep", "endereco"],
  usage: `${PREFIX}cep <CEP>\nEx: ${PREFIX}cep 01001000`,

  handle: async ({ args, sendReply, sendErrorReply, sendWaitReply, sendSuccessReact }) => {
    try {
      if (!args[0]) {
        return sendErrorReply(`Informe um CEP\nEx: ${PREFIX}cep 01001000`);
      }

      await sendWaitReply("📡 Consultando em 5 bases de dados...");

      const cep = CEPValidator.validate(args[0]);
      const cepData = await consultant.query(cep);
      const report = await CEPReport.generate(cepData);

      await sendSuccessReact();
      return sendReply(report);

    } catch (error) {
      console.error(`Falha CEP: ${error.stack}`);
      
      const message = error instanceof InvalidParameterError
        ? error.message
        : 'Falha ao consultar CEP. Tente novamente mais tarde.';

      return sendErrorReply(`❌ ${message}`);
    }
  }
};
