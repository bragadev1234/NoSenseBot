const { PREFIX } = require('../../config');

module.exports = {
  name: "rpg",
  description: "Ajuda do sistema RPG",
  commands: ["rpg"],
  usage: `${PREFIX}rpg`,
  
  handle: async ({ sendText }) => {
    return await sendText(
      `✨ *🏰 SISTEMA RPG DO REINO* ✨\n\n` +
      `📜 **COMANDOS DISPONÍVEIS:**\n\n` +
      `🛠️ *${PREFIX}trabalhar* - Lista de empregos\n` +
      `🛠️ *${PREFIX}trabalhar <emprego>* - Trabalha\n` +
      `🏆 *${PREFIX}rank* - Mostra o ranking\n\n` +
      `💡 Use *${PREFIX}trabalhar* para ver todos os empregos detalhados.`
    );
  }
};
