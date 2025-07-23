const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "consultaddd",
  description: "Consulta informações de um DDD",
  commands: ["ddd", "consultaddd"],
  usage: `${PREFIX}ddd <número do DDD>\nExemplo: ${PREFIX}ddd 11`,
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
      return sendErrorReply("Por favor, informe um DDD. Exemplo: " + this.usage);
    }

    const ddd = args[0];
    await sendWaitReply("Consultando DDD...");

    try {
      const cleanedDDD = ddd.replace(/\D/g, '');
      
      if (cleanedDDD.length !== 2) {
        throw new InvalidParameterError('DDD deve conter exatamente 2 dígitos');
      }

      const response = await axios.get(`https://brasilapi.com.br/api/ddd/v1/${cleanedDDD}`);
      const { state, cities } = response.data;
      
      const resultado = `
📞 *Resultado da consulta de DDD* 📞
🔢 *DDD:* ${cleanedDDD}
🏙️ *Estado:* ${state}
🏘️ *Cidades:* ${cities.join(', ')}
      `.trim();

      await sendSuccessReact();
      await sendReply(resultado);
    } catch (error) {
      errorLog(`Erro na consulta de DDD ${ddd}: ${error.message}`);
      sendErrorReply(error.message || "Erro ao consultar DDD. Verifique o número e tente novamente.");
    }
  },
};
