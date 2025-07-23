const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "consultaip",
  description: "Consulta informações de um endereço IP",
  commands: ["ip", "consultaip"],
  usage: `${PREFIX}ip <endereço IP>\nExemplo: ${PREFIX}ip 8.8.8.8`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    remoteJid,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
    sendReply,
  }) => {
    if (args.length < 1) {
      return sendErrorReply("Por favor, informe um endereço IP. Exemplo: " + this.usage);
    }

    const ip = args[0];
    await sendWaitReply("Consultando IP...");

    try {
      // Verificação básica de formato IP
      if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
        throw new InvalidParameterError('Formato de IP inválido');
      }

      const response = await axios.get(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN || 'YOUR_TOKEN'}`);
      const { hostname, city, region, country, org, postal, timezone } = response.data;
      
      const resultado = `
🌐 *Resultado da consulta de IP* 🌐
🔢 *IP:* ${ip}
🏷️ *Hostname:* ${hostname || 'Não disponível'}
🏙️ *Cidade/Região:* ${city || 'Desconhecida'}/${region || 'Desconhecida'}
🇧🇷 *País:* ${country || 'Desconhecido'}
🏢 *Provedor:* ${org ? org.split(' ').slice(1).join(' ') : 'Desconhecido'}
📮 *CEP:* ${postal || 'Não disponível'}
⏰ *Fuso Horário:* ${timezone || 'Não disponível'}
      `.trim();

      await sendSuccessReact();
      await sendReply(resultado);
    } catch (error) {
      errorLog(`Erro na consulta de IP ${ip}: ${error.message}`);
      sendErrorReply(error.message || "Erro ao consultar IP. Verifique o endereço e tente novamente.");
    }
  },
};
