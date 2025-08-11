const axios = require('axios');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

const IP_API_NETWORK = [
  {
    name: 'IPInfo',
    endpoint: ip => `https://ipinfo.io/${ip}/json${process.env.IPINFO_TOKEN ? `?token=${process.env.IPINFO_TOKEN}` : ''}`,
    validator: data => data.ip,
    priority: 1,
    timeout: 5000
  },
  {
    name: 'IPAPI',
    endpoint: ip => `https://ipapi.co/${ip}/json/`,
    validator: data => data.ip,
    priority: 2,
    timeout: 6000
  }
];

class IPConsultant {
  async query(ip) {
    for (const api of IP_API_NETWORK) {
      try {
        const data = await this._queryAPI(api, ip);
        if (data && api.validator(data)) {
          return this._normalizeData(data, api.name);
        }
      } catch (error) {
        console.error(`[IP] API ${api.name} falhou: ${error.message}`);
      }
    }
    throw new Error('🔴 Todas as APIs falharam');
  }

  async _queryAPI(api, ip) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), api.timeout);
    try {
      const response = await axios.get(api.endpoint(ip), {
        signal: controller.signal,
        headers: { 'User-Agent': 'IPBot/2.0' }
      });
      return response.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  _normalizeData(data, source) {
    const getFlag = (country) => country ? String.fromCodePoint(...[...country.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '🏴';
    return {
      ip: data.ip || '🚫 Não informado',
      hostname: data.hostname || '🚫 Não informado',
      cidade: data.city || data.city_name || '🚫 Não informado',
      região: data.region || data.region_name || '🚫 Não informado',
      país: `${getFlag(data.country)} ${data.country_name || '🚫 Não informado'}`,
      localização: data.loc || (data.latitude && data.longitude ? `${data.latitude},${data.longitude}` : '🚫 Não informado'),
      provedor: data.org || data.asn?.org || '🚫 Não informado',
      asn: data.asn?.asn ? `AS${data.asn.asn}` : data.asn || '🚫 Não informado',
      postal: data.postal || '🚫 Não informado',
      timezone: data.timezone || '🚫 Não informado',
      source
    };
  }
}

module.exports = {
  name: "ipinfo",
  commands: ["ip", "ipinfo"],
  usage: `${PREFIX}ip <IP>`,
  handle: async ({ args, sendReply, sendErrorReply }) => {
    try {
      if (!args[0]) return sendErrorReply(`📛 Informe um IP\nEx: ${PREFIX}ip 8.8.8.8`);
      
      const ip = args[0];
      if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
        throw new InvalidParameterError('❌ IP inválido');
      }
      
      const data = await new IPConsultant().query(ip);
      
      await sendReply(`
🌐 *IP:* ${data.ip}
🏷️ *Hostname:* ${data.hostname}
📍 *Local:* ${data.cidade}, ${data.região}, ${data.país}
📮 *CEP:* ${data.postal}
🕒 *Timezone:* ${data.timezone}
🖥️ *Provedor:* ${data.provedor} (${data.asn})
🗺️ *Coords:* ${data.localização}
🔍 *Fonte:* ${data.source}
      `.trim());
    } catch (error) {
      sendErrorReply(error.message.includes('IP') ? error.message : '🔴 Falha na consulta');
    }
  }
};