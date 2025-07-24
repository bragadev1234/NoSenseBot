const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

// Dados compartilhados
const rpgData = {};

module.exports = {
  name: "rank",
  description: "Mostra o ranking de golds e níveis",
  commands: ["rank", "ranking", "top"],
  usage: `${PREFIX}rank`,
  
  handle: async ({ sendText }) => {
    // Converter objeto em array e ordenar
    const ranking = Object.entries(rpgData)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.gold - a.gold || b.nivel - a.nivel);

    if (ranking.length === 0) {
      await sendText("📊 Nenhum jogador registrado ainda! Use !trabalhar para começar.");
      return;
    }

    // Atribuir cargos aos top players
    ranking.forEach((user, index) => {
      if (index === 0) user.cargo = "👑 Rei";
      else if (index === 1) user.cargo = "👸 Rainha";
      else if (user.owner) user.cargo = "🪤 Escravo";
      else if (user.monstro) user.cargo = "👹 Monstro";
      else user.cargo = "🧑 Plebeu";
    });

    // Construir mensagem
    let mensagem = "🏆 *RANKING RPG* 🏆\n\n";
    ranking.slice(0, 10).forEach((user, index) => {
      mensagem += `${index + 1}. ${user.cargo} @${user.userId}\n`;
      mensagem += `   💰 ${user.gold} golds | ✨ Nível ${user.nivel}`;
      if (user.owner) mensagem += ` | Dono: @${user.owner}`;
      mensagem += "\n\n";
    });

    await sendText(mensagem);
  }
};
