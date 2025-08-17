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
👤 Reaper   

📜 *Regras do grupo*    
1️⃣ 😏 Piadas de teor sexual apenas com moderação    
2️⃣ 😐 Ofensas, provocações e similares apenas com moderação    
3️⃣ 🚫 Proibidas piadas ou conteúdos envolvendo abuso ou nazismo    
4️⃣ 🛡️ Proibida a divulgação de malwares    

🛠️ *Recursos e utilitários*    
🤖 *Projeto para derrubar contas do Instagram:*    
Em breve (PasteBin).  

💬 *Bot de Whatsapp* (open-source) + tutorial para execução local no Termux:    
https://github.com/ProfaneReaper/Reaper-Bot  

📱 *Método para desbanir WhatsApp* (apenas se o banimento foi natural), em 5 passos simples.  
📅 *(Última revisão: Agosto de 2025)*    
Em breve link atualizado.   

_Obs: não é 100% de chances de voltar. Se sua conta ainda está em análise, não faça este método.  
Não instale WhatsApp modificado. Espere confirmação do ban.  
Se o ban não foi natural, provavelmente não funcionará._  

🏫 *Link do grupo:*    
https://chat.whatsapp.com/GUlXiHubM5xH14HVc11YXT?mode=ac_t
`;

      await sendReply(message);
    } catch (error) {
      console.error("[REGRAS COMMAND ERROR]", error);
      await sendReply("❌ *Ocorreu um erro ao executar o comando regras.*");
    }
  },
};
