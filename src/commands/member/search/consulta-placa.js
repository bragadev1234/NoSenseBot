const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "consultaplaca",
  description: "Consulta informações de uma placa de veículo",
  commands: ["placa", "consultaplaca"],
  usage: `${PREFIX}placa <número da placa>\nExemplo: ${PREFIX}placa ABC1234`,
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
      return sendErrorReply("Por favor, informe uma placa. Exemplo: " + this.usage);
    }

    const placa = args[0].toUpperCase();
    await sendWaitReply("Consultando placa...");

    try {
      // Verificação básica de formato de placa (aceita Mercosul ou modelo antigo)
      if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa)) {
        throw new InvalidParameterError('Formato de placa inválido');
      }

      const response = await axios.get(`https://placas.com.br/api/consultas/placa/${placa}`);
      const { marca, modelo, ano, cor, municipio, uf, situacao } = response.data;
      
      const resultado = `
🚗 *Resultado da consulta de placa* 🚗
🔢 *Placa:* ${placa}
🏭 *Marca/Modelo:* ${marca} ${modelo}
📅 *Ano:* ${ano}
🎨 *Cor:* ${cor}
📍 *Município/UF:* ${municipio}/${uf}
🔄 *Situação:* ${situacao}
      `.trim();

      await sendSuccessReact();
      await sendReply(resultado);
    } catch (error) {
      errorLog(`Erro na consulta de placa ${placa}: ${error.message}`);
      sendErrorReply(error.message || "Erro ao consultar placa. Verifique o número e tente novamente.");
    }
  },
};
