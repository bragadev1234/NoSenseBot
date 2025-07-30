const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "ipinfo",
  description: "Consulta avançada de informações de IP",
  commands: ["ip", "ipinfo", "geoip"],
  usage: `${PREFIX}ip <endereço>\nExemplo: ${PREFIX}ip 1.1.1.1`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
    sendReply,
  }) => {
    if (!args[0]) {
      return sendErrorReply(`📛 Formato incorreto!\nUso correto: ${this.usage}`);
    }

    const ip = args[0].trim();
    await sendWaitReply("🛰️ Varrendo redes globais...");

    try {
      // Filtro de IP rigoroso
      if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/.test(ip)) {
        throw new InvalidParameterError('🛑 IP inválido! Use IPv4 (ex: 8.8.8.8) ou IPv6 (ex: 2606:4700:4700::1111)');
      }

      const { data } = await axios.get(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN || ''}`, {
        timeout: 8000,
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'pt-BR'
        }
      });

      // Processamento inteligente dos dados
      const formatField = (value, fallback = '🔍 Não detectado') => 
        value?.toString().trim() || fallback;

      const getISP = (org) => 
        org ? org.replace(/^AS\d+\s/, '').replace(/,.+$/, '') : '🌐 Provedor desconhecido';

      const getCoordinates = (loc) => {
        if (!loc) return null;
        const [lat, lon] = loc.split(',');
        return { lat, lon, maps: `https://www.google.com/maps?q=${lat},${lon}` };
      };

      // Dados estruturados
      const geoData = {
        ip: formatField(ip),
        hostname: formatField(data.hostname),
        isp: getISP(data.org),
        location: {
          city: formatField(data.city),
          region: formatField(data.region),
          country: `${getCountryFlag(data.country)} ${data.country || 'XX'}`,
          postal: formatField(data.postal),
          coords: getCoordinates(data.loc)
        },
        network: {
          asn: data.asn?.asn ? `AS${data.asn.asn}` : '🚫 Não disponível',
          domain: formatField(data.company?.domain),
          type: formatField(data.company?.type)
        },
        timezone: formatField(data.timezone),
        privacy: data.privacy ? {
          vpn: data.privacy.vpn ? '✅' : '❌',
          proxy: data.privacy.proxy ? '✅' : '❌',
          tor: data.privacy.tor ? '✅' : '❌',
          hosting: data.privacy.hosting ? '✅' : '❌'
        } : null
      };

      // Template de saída premium
      const output = `
🌐 *ANÁLISE DE REDE PROFISSIONAL* 🌐

🔷 *Endereço IP:* ${geoData.ip}
📡 *Hostname:* ${geoData.hostname}

🏢 *Provedor:* ${geoData.isp}
📶 *ASN:* ${geoData.network.asn}
🌍 *Tipo:* ${geoData.network.type}
🔗 *Domínio:* ${geoData.network.domain}

📍 *Localização Física:*
   🏙️ Cidade: ${geoData.location.city}
   🏔️ Região: ${geoData.location.region}
   🏳️ País: ${geoData.location.country}
   📮 CEP: ${geoData.location.postal}
   🧭 Coordenadas: ${geoData.location.coords ? 
     `${geoData.location.coords.lat}, ${geoData.location.coords.lon}\n   🗺️ Maps: ${geoData.location.coords.maps}` : 
     'Indisponíveis'}

⏱️ *Fuso Horário:* ${geoData.timezone}

🛡️ *Análise de Privacidade:*
   VPN: ${geoData.privacy?.vpn || '❓'}
   Proxy: ${geoData.privacy?.proxy || '❓'}
   Tor: ${geoData.privacy?.tor || '❓'}
   Hosting: ${geoData.privacy?.hosting || '❓'}
      `.trim();

      await sendSuccessReact();
      return sendReply(output);

    } catch (error) {
      errorLog(`Falha na consulta IP: ${error.message}`);
      
      const errorMap = {
        ENOTFOUND: 'Servidor DNS não respondeu',
        ECONNABORTED: 'Tempo de conexão esgotado',
        ECONNREFUSED: 'Conexão rejeitada',
        403: 'Acesso não autorizado à API',
        404: 'IP não encontrado',
        429: 'Limite de requisições excedido'
      };

      const errorMsg = errorMap[error.code] || 
                      errorMap[error.response?.status] || 
                      'Falha na análise do endereço';

      return sendErrorReply(`💢 Erro crítico: ${errorMsg}\nCódigo: ${error.code || error.response?.status || 'N/A'}`);
    }
  }
};

// Otimização para emojis de bandeira
function getCountryFlag(countryCode) {
  return countryCode 
    ? String.fromCodePoint(...[...countryCode.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
    : '🏴';
}
