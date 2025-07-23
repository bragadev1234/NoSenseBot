const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "consultacep",
  description: "Consulta informações de um CEP",
  commands: ["cep", "consultacep"],
  usage: `${PREFIX}cep <número do CEP>\nExemplo: ${PREFIX}cep 01001000`,
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
      return sendErrorReply("Por favor, informe um CEP. Exemplo: " + this.usage);
    }

    const cep = args[0];
    await sendWaitReply("Consultando CEP...");

    try {
      const cleanedCEP = cep.replace(/\D/g, '');
      
      if (cleanedCEP.length !== 8) {
        throw new InvalidParameterError('CEP deve conter exatamente 8 dígitos');
      }

      const response = await axios.get(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
      
      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      const { logradouro, complemento, bairro, localidade, uf, ddd } = response.data;
      
      const resultado = `
📮 *Resultado da consulta de CEP* 📮
📍 *CEP:* ${cleanedCEP}
🏠 *Endereço:* ${logradouro || 'Não informado'}${complemento ? ` (${complemento})` : ''}
🏘️ *Bairro:* ${bairro || 'Não informado'}
🏙️ *Cidade/UF:* ${localidade}/${uf}
📞 *DDD:* ${ddd || 'Não informado'}
      `.trim();

      await sendSuccessReact();
      await sendReply(resultado);
    } catch (error) {
      errorLog(`Erro na consulta de CEP ${cep}: ${error.message}`);
      sendErrorReply(error.message || "Erro ao consultar CEP. Verifique o número e tente novamente.");
    }
  },
};
