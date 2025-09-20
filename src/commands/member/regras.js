/**
 *
 * @author Braga 
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "regras",
  description: "Exibe as regras do grupo e links de utilitários.",
  commands: ["regras", "rules"],
  usage: `${PREFIX}regras`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact }) => {
    try {
      await sendReact("📜");

      const message = `
📌 *Responsáveis:*    
👤 Braga & Administração 

📜 *Regras do grupo*    
1️⃣ 😏 Piadas de teor sexual apenas com moderação    
2️⃣ 😐 Ofensas, provocações e similares apenas com moderação    
3️⃣ 🚫 Proibidas piadas ou conteúdos envolvendo abuso ou nazismo    
4️⃣ 🛡️ Proibida a divulgação de malwares    

`;

      await sendReply(message);
    } catch (error) {
      console.error("[REGRAS COMMAND ERROR]", error);
      await sendReply("❌ *Ocorreu um erro ao executar o comando regras.*");
    }
  },
};
