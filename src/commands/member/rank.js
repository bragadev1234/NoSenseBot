const { PREFIX } = require(`${BASE_DIR}/config`);
const fs = require('node:fs').promises;
const path = require('node:path');
const { DB_DIR } = require(`${BASE_DIR}/config`);

const ROLES = {
  KING: '👑 Rei',
  QUEEN: '👸 Rainha',
  COMMONER: '🧑 Plebeu',
  SLAVE: '🪤 Escravo',
  MONSTER: '👹 Monstro'
};

module.exports = {
  name: "rank",
  description: "Mostra o ranking de golds e cargos",
  commands: ["rank", "ranking"],
  usage: `${PREFIX}rank`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendText, userJid }) => {
    try {
      const dbPath = path.resolve(DB_DIR, 'rpg_rank.json');
      let rankData = [];
      
      try {
        const data = await fs.readFile(dbPath, 'utf8');
        rankData = JSON.parse(data);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }

      // Ordenar por gold (decrescente)
      rankData.sort((a, b) => b.gold - a.gold);
      
      // Atualizar cargos
      if (rankData.length > 0) rankData[0].role = ROLES.KING;
      if (rankData.length > 1) rankData[1].role = ROLES.QUEEN;
      
      // Construir mensagem
      let message = '🏆 Ranking RPG 🏆\n\n';
      rankData.slice(0, 10).forEach((user, index) => {
        message += `${index + 1}. ${user.role || ROLES.COMMONER} @${user.id} - ${user.gold} golds\n`;
      });
      
      await sendText(message);
    } catch (error) {
      console.error('Error in rank command:', error);
      await sendText('Ocorreu um erro ao mostrar o ranking.');
    }
  },
};
