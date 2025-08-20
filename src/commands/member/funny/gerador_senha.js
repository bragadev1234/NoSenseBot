// geradorsenha.js
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "geradorsenha",
  description: "Gera uma senha aleatória",
  commands: ["geradorsenha", "password", "senha"],
  usage: `${PREFIX}geradorsenha <tamanho>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, args }) => {
    await sendReact("🔐");
    
    const tamanho = args && args.length > 0 ? parseInt(args[0]) : 12;
    
    if (isNaN(tamanho) || tamanho < 6 || tamanho > 32) {
      return sendErrorReply("Tamanho inválido! Use entre 6 e 32 caracteres.");
    }
    
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let senha = "";
    
    for (let i = 0; i < tamanho; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    await sendReply(`🔐 *SENHA GERADA*
    
Tamanho: ${tamanho} caracteres
Senha: ||${senha}||
    
⚠️ *Use com cuidado e não compartilhe!*`);
  },
};