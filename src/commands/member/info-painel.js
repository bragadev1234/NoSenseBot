const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "info-painel",
  description: "Exibe informações do painel de ferramentas",
  commands: ["info-painel", "painel", "info"],
  usage: `${PREFIX}info-painel`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendImageFromURL, sendReact }) => {
    try {
      await sendReact("📦");
      
      const imageUrl = "https://profanereaper.neocities.org/9bbe7c0ffb9de5e82d787d03ad01d9f2.jpg";
      
      const caption = `
*╭━━━┤📦 Pacote de Ferramentas ├━━━╮*

*🔧 Script: Derrubar Instagram Em breve*
*🧨 DoS Tool: Monster: Em breve*
*🤖 Ken-StalkerBot: Bot Telegram para extrair dados de contas do instagram*
*📄 Pastebin: [Acesso não especificado]*
*╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯*

*📌 Comandos de Coleta:*
*🔍 /cpf 123455567 (Basicio)*
*📞 /loctel 243464578  (Basicio)*
*🌐 /ip 888  (Completa)*
*📍 /cep 76434678  (Completa)*
*🏢 /cnpj 457845 (Completo)*
*🌦️ /clima cidade (Completo)*
*🧠/bin 123456 (Completo)*
      `.trim();

      await sendImageFromURL(imageUrl, caption);

    } catch (error) {
      console.error("[INFO-PAINEL COMMAND ERROR]", error);
      await sendReply("❌ *Erro ao exibir informações do painel. Tente novamente.*");
    }
  },
};
