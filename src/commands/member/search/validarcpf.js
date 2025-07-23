const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "validarcpf",
  description: "Valida um número de CPF",
  commands: ["cpf", "validarcpf"],
  usage: `${PREFIX}cpf <número do CPF>\nExemplo: ${PREFIX}cpf 12345678909`,
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
      return sendErrorReply("Por favor, informe um CPF. Exemplo: " + this.usage);
    }

    const cpf = args[0];
    await sendWaitReply("Validando CPF...");

    try {
      const cleanedCPF = cpf.replace(/\D/g, '');
      
      if (cleanedCPF.length !== 11) {
        throw new InvalidParameterError('CPF deve conter 11 dígitos');
      }

      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cleanedCPF)) {
        throw new InvalidParameterError('CPF inválido (dígitos repetidos)');
      }

      // Validação do CPF
      let sum = 0;
      let remainder;
      
      // Valida primeiro dígito verificador
      for (let i = 1; i <= 9; i++) {
        sum += parseInt(cleanedCPF.substring(i-1, i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if ((remainder === 10) || (remainder === 11)) remainder = 0;
      if (remainder !== parseInt(cleanedCPF.substring(9, 10))) {
        throw new InvalidParameterError('CPF inválido');
      }

      // Valida segundo dígito verificador
      sum = 0;
      for (let i = 1; i <= 10; i++) {
        sum += parseInt(cleanedCPF.substring(i-1, i)) * (12 - i);
      }
      remainder = (sum * 10) % 11;
      if ((remainder === 10) || (remainder === 11)) remainder = 0;
      if (remainder !== parseInt(cleanedCPF.substring(10, 11))) {
        throw new InvalidParameterError('CPF inválido');
      }

      const formattedCPF = cleanedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      
      const resultado = `
📝 *Resultado da validação de CPF* 📝
🔢 *CPF:* ${formattedCPF}
✅ *Status:* Válido
📌 *Observação:* A validação é apenas matemática. Não verifica existência na Receita Federal.
      `.trim();

      await sendSuccessReact();
      await sendReply(resultado);
    } catch (error) {
      errorLog(`Erro na validação de CPF ${cpf}: ${error.message}`);
      sendErrorReply(error.message || "CPF inválido. Verifique o número e tente novamente.");
    }
  },
};
