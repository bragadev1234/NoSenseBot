const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "consultacnpj",
  description: "Consulta informações de um CNPJ",
  commands: ["cnpj", "consultacnpj"],
  usage: `${PREFIX}cnpj <número do CNPJ>\nExemplo: ${PREFIX}cnpj 12345678000195`,
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
      return sendErrorReply("Por favor, informe um CNPJ. Exemplo: " + this.usage);
    }

    const cnpj = args[0];
    await sendWaitReply("Consultando CNPJ...");

    try {
      const cleanedCNPJ = cnpj.replace(/\D/g, '');
      
      if (cleanedCNPJ.length !== 14) {
        throw new InvalidParameterError('CNPJ deve conter exatamente 14 dígitos');
      }

      const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanedCNPJ}`);
      const { razao_social, nome_fantasia, cnae_fiscal_descricao, data_inicio_atividade, municipio, uf, ddd_telefone_1 } = response.data;
      
      const resultado = `
🏢 *Resultado da consulta de CNPJ* 🏢
📝 *Razão Social:* ${razao_social}
🏷️ *Nome Fantasia:* ${nome_fantasia || 'Não informado'}
📊 *Atividade Principal:* ${cnae_fiscal_descricao}
📅 *Data de Abertura:* ${new Date(data_inicio_atividade).toLocaleDateString()}
📍 *Localização:* ${municipio}/${uf}
📞 *Telefone:* ${ddd_telefone_1 ? `(${ddd_telefone_1.substring(0,2)}) ${ddd_telefone_1.substring(2)}` : 'Não informado'}
      `.trim();

      await sendSuccessReact();
      await sendReply(resultado);
    } catch (error) {
      errorLog(`Erro na consulta de CNPJ ${cnpj}: ${error.message}`);
      sendErrorReply(error.message || "Erro ao consultar CNPJ. Verifique o número e tente novamente.");
    }
  },
};
