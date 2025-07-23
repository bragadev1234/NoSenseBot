const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "validarpis",
  description: "Valida um número de PIS/PASEP/NIT",
  commands: ["pis", "validarpis", "pasep", "nit"],
  usage: `${PREFIX}pis <número do PIS>\nExemplo: ${PREFIX}pis 12345678901`,
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
      return sendErrorReply("Por favor, informe um PIS. Exemplo: " + this.usage);
    }

    const pis = args[0];
    await sendWaitReply("Validando PIS/PASEP/NIT...");

    try {
      const cleanedPIS = pis.replace(/\D/g, '');
      
      if (cleanedPIS.length !== 11) {
        throw new InvalidParameterError('PIS/PASEP/NIT deve conter 11 dígitos');
      }

      // Validação do PIS/PASEP/NIT
      const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanedPIS.charAt(i)) * weights[i];
      }
      
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      
      if (calculatedDV !== parseInt(cleanedPIS.charAt(10))) {
        throw new InvalidParameterError('PIS/PASEP/NIT inválido (dígito verificador incorreto)');
      }

      const formattedPIS = cleanedPIS.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/, '$1.$2.$3-$4');
      
      const resultado = `
📋 *Resultado da validação de PIS/PASEP/NIT* 📋
🔢 *Número:* ${formattedPIS}
✅ *Status:* Válido
📌 *Observação:* A validação é apenas matemática. Não verifica existência na base de dados oficial.
      `.trim();

      await sendSuccessReact();
      await sendReply(resultado);
    } catch (error) {
      errorLog(`Erro na validação de PIS ${pis}: ${error.message}`);
      sendErrorReply(error.message || "PIS/PASEP/NIT inválido. Verifique o número e tente novamente.");
    }
  },
};
