/**
 * Consulta avançada de IP
 * @author braga
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "ip2",
  description: "Consulta detalhada de endereço IP",
  commands: ["ip2", "consultaip"],
  usage: `${PREFIX}ip2 <endereço ip>`,
  handle: async ({ sendReply, sendReact, args }) => {
    if (!args[0]) return sendReply("Por favor, informe um IP. Ex: /ip2 8.8.8.8");
    
    await sendReact("🌐");
    const ip = args[0];
    
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await response.json();
      
      if (data.status === "fail") {
        return sendReply("❌ IP inválido ou não encontrado");
      }
      
      let info = `*IP*: ${data.query}\n`;
      info += `*País*: ${data.country} (${data.countryCode})\n`;
      info += `*Região*: ${data.regionName} (${data.region})\n`;
      info += `*Cidade*: ${data.city}\n`;
      info += `*CEP*: ${data.zip || 'Não disponível'}\n`;
      info += `*Provedor*: ${data.isp || 'Não disponível'}\n`;
      info += `*Lat/Lon*: ${data.lat}, ${data.lon}\n`;
      
      await sendReply(`📍 *Informações do IP*:\n\n${info}`);
      
    } catch (error) {
      await sendReply("⚠️ Ocorreu um erro ao consultar o IP. Tente novamente mais tarde.");
    }
  },
};
