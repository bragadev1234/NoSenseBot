const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "validartitulo",
  description: "Valida um número de Título de Eleitor",
  commands: ["titulo", "validartitulo"],
  usage: `${PREFIX}titulo <número do título>\nExemplo: ${PREFIX}titulo 123456789012`,
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
      return sendErrorReply("Por favor, informe um título. Exemplo: " + this.usage);
    }

    const titulo = args[0];
    await sendWaitReply("Validando Título de Eleitor...");

    try {
      const cleanedTitulo = titulo.replace(/\D/g, '');
      
      if (cleanedTitulo.length !== 12) {
        throw new InvalidParameterError('Título deve conter 12 dígitos');
      }

      // Extrai os dígitos verificadores
      const digitoUF = parseInt(cleanedTitulo.substring(10, 12));
      const tituloSemDV = cleanedTitulo.substring(0, 10);
      
      // Validação do Título de Eleitor
      let sum = 0;
      
      // Cálculo do primeiro dígito verificador (posição 9)
      for (let i = 0; i < 8; i++) {
        sum += parseInt(tituloSemDV.charAt(i)) * (9 - i);
      }
      const dv1 = sum % 11;
      const checkDV1 = dv1 < 10 ? dv1 : 0;
      
      if (checkDV1 !== parseInt(tituloSemDV.charAt(8))) {
        throw new InvalidParameterError('Título inválido (primeiro dígito verificador incorreto)');
      }

      // Cálculo do dígito UF (posições 10-11)
      if (digitoUF < 1 || digitoUF > 28) {
        throw new InvalidParameterError('Código de UF inválido no título');
      }

      const formattedTitulo = cleanedTitulo.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
      
      const resultado = `
🗳️ *Resultado da validação de Título de Eleitor* 🗳️
🔢 *Título:* ${formattedTitulo}
✅ *Status:* Válido
📌 *Observação:* A validação é apenas matemática. Não verifica existência no TSE.
      `.trim();

      await sendSuccessReact();
      await sendReply(resultado);
    } catch (error) {
      errorLog(`Erro na validação de título ${titulo}: ${error.message}`);
      sendErrorReply(error.message || "Título de Eleitor inválido. Verifique o número e tente novamente.");
    }
  },
};
