const { PREFIX } = require(`${BASE_DIR}/config`);
const fs = require('node:fs').promises;
const path = require('node:path');
const { DB_DIR } = require(`${BASE_DIR}/config`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`); // Adicionando a importação faltante

const JOBS = {
  FARMER: {
    name: '👨‍🌾 Fazendeiro',
    cooldown: 10, // segundos
    min: 15,
    max: 30,
    emoji: '👨‍🌾'
  },
  MINER: {
    name: '⛏️ Mineiro',
    cooldown: 10,
    min: 10,
    max: 20,
    emoji: '⛏️'
  },
  HUNTER: {
    name: '🏹 Caçador de Monstros',
    cooldown: 30,
    min: 20,
    max: 50,
    emoji: '🏹'
  }
};

module.exports = {
  name: "trabalhar",
  description: "Trabalhe para ganhar golds",
  commands: ["trabalhar", "work"],
  usage: `${PREFIX}trabalhar <fazendeiro|mineiro|caçador>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendText, userJid, args }) => {
    const jobName = args[0]?.toLowerCase();
    const userId = onlyNumbers(userJid);
    
    if (!jobName || !['fazendeiro', 'mineiro', 'caçador', 'caçador'].includes(jobName)) {
      await sendText(
        `*Escolha um trabalho:*\n\n` +
        `${JOBS.FARMER.emoji} *Fazendeiro* - ${PREFIX}trabalhar fazendeiro\n` +
        `   ⏳ 10s | 🪙 15-30 golds\n\n` +
        `${JOBS.MINER.emoji} *Mineiro* - ${PREFIX}trabalhar mineiro\n` +
        `   ⏳ 10s | 🪙 10-20 golds\n\n` +
        `${JOBS.HUNTER.emoji} *Caçador* - ${PREFIX}trabalhar caçador\n` +
        `   ⏳ 30s | 🪙 20-50 golds`
      );
      return;
    }
    
    try {
      const dbPath = path.resolve(DB_DIR, 'rpg_data.json');
      let rpgData = {};
      
      try {
        const data = await fs.readFile(dbPath, 'utf8');
        rpgData = JSON.parse(data);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      
      // Verificar cooldown
      const now = Date.now();
      const userData = rpgData[userId] || { 
        gold: 0, 
        lastWork: 0,
        job: null
      };
      
      let job;
      switch(jobName) {
        case 'fazendeiro': job = JOBS.FARMER; break;
        case 'mineiro': job = JOBS.MINER; break;
        case 'caçador': 
        case 'caçador': job = JOBS.HUNTER; break;
      }
      
      if (now - userData.lastWork < job.cooldown * 1000) {
        const remaining = Math.ceil((job.cooldown * 1000 - (now - userData.lastWork)) / 1000);
        await sendText(
          `⏳ *Aguarde ${remaining}s*\n` +
          `Você pode trabalhar novamente como ${job.emoji} *${job.name}* em ${remaining} segundos.`
        );
        return;
      }
      
      // Ganhar gold
      const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
      userData.gold = (userData.gold || 0) + earned;
      userData.lastWork = now;
      userData.job = jobName;
      
      rpgData[userId] = userData;
      await fs.writeFile(dbPath, JSON.stringify(rpgData, null, 2));
      
      await sendText(
        `💰 *Trabalho concluído!*\n\n` +
        `${job.emoji} *${job.name}*\n` +
        `🪙 Ganho: +${earned} golds\n` +
        `💵 Total: ${userData.gold} golds\n\n` +
        `⏳ Próximo trabalho em ${job.cooldown}s`
      );
    } catch (error) {
      console.error('Error in work command:', error);
      await sendText(
        `ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧ ❌ *Erro!*\n` +
        `Ocorreu um erro ao executar o comando trabalhar!\n` +
        `O desenvolvedor foi notificado!\n\n` +
        `📄 *Detalhes*: ${error.message}`
      );
    }
  },
};
