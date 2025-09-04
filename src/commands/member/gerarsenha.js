// gerarsenha.js
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "gerarsenha",
  description: "Gera senhas seguras",
  commands: ["gerarsenha", "password", "senha"],
  usage: `${PREFIX}gerarsenha <tamanho>`,
  
  handle: async ({ args, sendReply }) => {
    const length = parseInt(args[0]) || 12;
    
    if (length > 50) {
      return await sendReply("❌ Tamanho máximo é 50 caracteres!");
    }
    
    if (length < 6) {
      return await sendReply("❌ Tamanho mínimo é 6 caracteres!");
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    await sendReply(`🔐 *Senha Gerada (${length} caracteres):*\n\`${password}\``);
  },
};
