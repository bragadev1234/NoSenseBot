const { PREFIX } = require(`${BASE_DIR}/config`);
const fs = require('node:fs').promises;
const path = require('node:path');
const { DB_DIR } = require(`${BASE_DIR}/config`);

const JOBS = {
  FARMER: {
    name: '👨‍🌾 Fazendeiro',
    cooldown: 10, // segundos
    min: 15,
    max: 30
  },
  MINER: {
    name: '⛏️ Mineiro',
    cooldown: 10,
    min: 10,
    max: 20
  },
  HUNTER: {
    name: '🏹 Caçador de Monstros',
    cooldown: 30,
    min: 20,
    max: 50
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
    
    if (!jobName || !['fazendeiro', 'mineiro', 'caçador'].includes(jobName)) {
      await sendText(
        `Escolha um trabalho:\n` +
        `- ${PREFIX}trabalhar fazendeiro (10s) - Ganha 15-30 golds\n` +
        `- ${PREFIX}trabalhar mineiro (10s) - Ganha 10-20 golds\n` +
        `- ${PREFIX}trabalhar caçador (30s) - Ganha 20-50 golds`
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
      const userData = rpgData[userId] || { gold: 0, lastWork: 0 };
      
      let job;
      switch(jobName) {
        case 'fazendeiro': job = JOBS.FARMER; break;
        case 'mineiro': job = JOBS.MINER; break;
        case 'caçador': job = JOBS.HUNTER; break;
      }
      
      if (now - userData.lastWork < job.cooldown * 1000) {
        const remaining = Math.ceil((job.cooldown * 1000 - (now - userData.lastWork)) / 1000);
        await sendText(`⏳ Aguarde ${remaining} segundos para trabalhar novamente como ${job.name}.`);
        return;
      }
      
      // Ganhar gold
      const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
      userData.gold = (userData.gold || 0) + earned;
      userData.lastWork = now;
      
      rpgData[userId] = userData;
      await fs.writeFile(dbPath, JSON.stringify(rpgData, null, 2));
      
      await sendText(`💰 Você trabalhou como ${job.name} e ganhou ${earned} golds! Total: ${userData.gold} golds.`);
    } catch (error) {
      console.error('Error in work command:', error);
      await sendText('Ocorreu um erro ao processar seu trabalho.');
    }
  },
};
