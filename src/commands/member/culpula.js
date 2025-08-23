/**
 *
 * @author Braga 
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "culpula",
  description: "  ",
  commands: ["cemiterio", "culpula"],
  usage: `${PREFIX}culpula`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact }) => {
    try {
      await sendReact("📜");

      const message = `
📌 *RESPONSÁVEL / FUNDADOR*  
👤 *Reaper* — acima da cobra, do leão e do zumbi.  

━━━━━━━━━━━━━━━━━━━  

📜 *REGRAS DA CÚPULA*  
⚔️ Ninguém está acima de *Reaper*.  
📌 Líderes devem respeitar a hierarquia:  

1️⃣ Mr. S, Luiz  
2️⃣ Monarca, Crawley  
3️⃣ NT, Zero (Membro Honorário)  

━━━━━━━━━━━━━━━━━━━  

🛠️ *RECURSOS & UTILITÁRIOS*  

🤖 *Projeto para derrubar contas do Instagram*  
❌ Indisponível (aguarde PasteBin).  

📱 *Método para desbanir WhatsApp* (ban natural, 5 passos)  
*https://pastebin.com/Qe8Pi20Z* 
📅 Última revisão: Agosto de 2025  

🔫 *Script para banir Instagram*  
❌ Indisponível  

💀 *Vazio* — ferramenta base de DoS  
❌ Indisponível  

📞 *Telegram Bot para banir números WPN*  
❌ Indisponível  

🇵🇹 *Telegram — Painéis de consulta de dados (Portugal)*  
❌ Indisponível  

🇧🇷 *Telegram — Painéis de consulta de dados (Brasil)*  
❌ Indisponível  

👼 *Fallen Angel* — Painel multifuncional  
❌ Indisponível  

💬 *Reaper Bot WhatsApp*  
🔗 https://github.com/ProfaneReaper/Reaper-Bot  

🕵️ *UnderStallker* — Telegram Bot para obter dados de Instagram via Google Hacking  
❌ Indisponível
`;

      await sendReply(message);
    } catch (error) {
      console.error("[REGRAS COMMAND ERROR]", error);
      await sendReply("❌ *Ocorreu um erro ao executar o comando regras.*");
    }
  },
};
