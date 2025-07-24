const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');
const rpgDB = require('./rpgSystem');

module.exports = {
  name: "rank",
  description: "Mostra o ranking de golds e níveis",
  commands: ["rank", "ranking", "top"],
  usage: `${PREFIX}rank`,

  handle: async ({ sendReply, userJid }) => {
    try {
      const ranking = rpgDB.getRanking();
      
      if (ranking.length === 0) {
        await sendReply("📊 Nenhum jogador registrado ainda! Use !trabalhar para começar.");
        return;
      }

      // Atribuir cargos
      ranking.forEach((user, index) => {
        if (index === 0) user.cargo = "👑 Rei";
        else if (index === 1) user.cargo = "👸 Rainha";
        else if (user.isMonster) user.cargo = "👹 Monstro";
        else if (user.owner) user.cargo = "🪤 Escravo";
        else user.cargo = "🧑 Plebeu";
      });

      // Construir mensagem
      let message = "🏆 *RANKING RPG* 🏆\n\n";
      ranking.slice(0, 10).forEach((user, index) => {
        message += `${index + 1}. ${user.cargo} @${user.id}\n`;
        message += `   💰 ${user.gold} golds | ✨ Nível ${user.nivel}`;
        if (user.owner) message += ` | Dono: @${user.owner}`;
        message += "\n\n";
      });

      // Adicionar posição do usuário se não estiver no top 10
      const userId = onlyNumbers(userJid);
      const userPos = ranking.findIndex(u => u.id === userId) + 1;
      if (userPos > 10) {
        const user = rpgDB.getUser(userId);
        message += `\nSua posição: #${userPos} (${user.gold} golds)`;
      }

      await sendReply(message);
    } catch (error) {
      console.error("Erro no comando rank:", error);
      await sendReply("❌ Ocorreu um erro ao gerar o ranking. Tente novamente mais tarde.");
    }
  }
};
