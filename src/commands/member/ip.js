// ipfull.js - Informações completas de IP com emojis
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "ipfull",
  description: "Obtém informações detalhadas de qualquer IP usando APIs públicas com emojis e dezenas de dados",
  commands: ["ip", "ipinfo", "iplookup", "ipdetalhado"],
  usage: `${PREFIX}ipfull <IP>`,
  handle: async ({ sendReply, sendReact, args }) => {
    await sendReact("🌐");

    if (!args || args.length === 0) {
      return sendReply("❌ Digite um IP! Ex: /ipfull 8.8.8.8");
    }

    const ip = args[0];

    try {
      const res1 = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,continent,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
      const data1 = res1.data;

      if (data1.status !== "success") {
        return sendReply(`❌ Não foi possível obter informações do IP: ${data1.message}`);
      }

      const res2 = await axios.get(`https://ipwho.is/${ip}`);
      const data2 = res2.data;

      const ipTipo = ip.includes(":") ? "IPv6" : "IPv4";
      const hostname = data2.hostname || "N/A";
      const proxyStatus = data2.security ? (data2.security.is_proxy ? "Sim" : "Não") : "N/A";
      const vpnStatus = data2.security ? (data2.security.is_vpn ? "Sim" : "Não") : "N/A";
      const torStatus = data2.security ? (data2.security.is_tor ? "Sim" : "Não") : "N/A";
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${data1.lat},${data1.lon}`;

      const mensagem = `
🌐 *INFORMAÇÕES COMPLETAS DO IP: ${ip}*

🔢 Tipo de IP: ${ipTipo}
💻 Hostname: ${hostname}
🇺🇳 País: ${data1.country} (${data1.countryCode})
🌍 Continente: ${data1.continent}
🏙️ Região: ${data1.regionName}
🌆 Cidade: ${data1.city}
📮 CEP: ${data1.zip || "N/A"}
🗺️ Latitude: ${data1.lat}
🧭 Longitude: ${data1.lon}
⏰ Fuso horário: ${data1.timezone}
💼 ISP: ${data1.isp || data1.org || "N/A"}
📡 ASN: ${data1.as || "N/A"}
🔗 IP verificado: ${data1.query}

🔒 Segurança:
🛡️ Proxy: ${proxyStatus}
🛡️ VPN: ${vpnStatus}
🛡️ TOR: ${torStatus}

🖥️ Conexão:
📶 Tipo de IP: ${ipTipo}
🌐 Domínio associado: ${data2.domain || "N/A"}

🗺️ Localização:
🗺️ Google Maps: ${mapsLink}
🏞️ Cidade aproximada: ${data2.city || "N/A"}
🗺️ Região aproximada: ${data2.region || "N/A"}
🌍 País aproximado: ${data2.country || "N/A"}
🧭 Continente aproximado: ${data2.continent || "N/A"}

📊 Dados adicionais:
⚡ Velocidade estimada: ${data2.connection ? data2.connection.speed : "N/A"}
🔢 Organização: ${data2.org || "N/A"}
💾 ASN: ${data2.asn || "N/A"}
🛑 Lista negra: ${data2.security ? (data2.security.is_blacklisted ? "Sim" : "Não") : "N/A"}
🔬 IP público detectado: ${data2.ip || "N/A"}

🌐 Fontes: ip-api.com + ipwho.is
`;

      await sendReply(mensagem);

    } catch (error) {
      console.error(error);
      await sendReply("❌ Erro ao buscar informações do IP.");
    }
  },
};
