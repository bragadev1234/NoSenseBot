const path = require("node:path");
const fs = require("node:fs").promises;
const { PREFIX } = require("../config");
const { onlyNumbers } = require("../utils");

const JOBS = {
  FAZENDEIRO: {
    name: "👨‍🌾 Fazendeiro",
    cooldown: 10, // segundos
    min: 15,
    max: 30,
    emoji: "👨‍🌾"
  },
  MINEIRO: {
    name: "⛏️ Mineiro",
    cooldown: 10,
    min: 10,
    max: 20,
    emoji: "⛏️"
  },
  CAÇADOR: {
    name: "🏹 Caçador",
    cooldown: 30,
    min: 20,
    max: 50,
    emoji: "🏹"
  }
};

module.exports = {
  name: "trabalhar",
  description: "Trabalhe para ganhar golds",
  commands: ["trabalhar", "work"],
  usage: `${PREFIX}trabalhar <emprego>`,
  
  handle: async ({ sendText, userJid, args }) => {
    const jobArg = args[0]?.toLowerCase();
    const userId = onlyNumbers(userJid);

    // Verificar se o emprego foi especificado
    if (!jobArg || !["fazendeiro", "mineiro", "caçador"].includes(jobArg)) {
      const jobsList = Object.values(JOBS).map(job => 
        `${job.emoji} *${job.name.split(" ")[1]}* - ${PREFIX}trabalhar ${job.name.split(" ")[1].toLowerCase()}\n` +
        `   ⏳ ${job.cooldown}s | 🪙 ${job.min}-${job.max} golds`
      ).join("\n\n");

      await sendText(
        `*🚜 Escolha um emprego:*\n\n${jobsList}\n\n` +
        `Exemplo: ${PREFIX}trabalhar fazendeiro`
      );
      return;
    }

    try {
      // Definir caminho do banco de dados
      const dbPath = path.join(__dirname, "..", "..", "database", "rpg_data.json");
      
      // Criar diretório se não existir
      await fs.mkdir(path.dirname(dbPath), { recursive: true });

      let rpgData = {};
      try {
        const data = await fs.readFile(dbPath, "utf8");
        rpgData = JSON.parse(data);
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }

      const userData = rpgData[userId] || { gold: 0, lastWork: 0 };
      const job = Object.values(JOBS).find(j => j.name.split(" ")[1].toLowerCase() === jobArg);

      // Verificar cooldown - CORREÇÃO APLICADA AQUI
      const now = Date.now();
      const remaining = Math.ceil((job.cooldown * 1000 - (now - userData.lastWork)) / 1000);

      if (now - userData.lastWork < job.cooldown * 1000) {
        await sendText(
          `⏳ *Aguarde ${remaining}s*\n` +
          `Você pode trabalhar novamente como ${job.emoji} ${job.name} em ${remaining} segundos.`
        );
        return;
      }

      // Calcular ganhos
      const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
      userData.gold = (userData.gold || 0) + earned;
      userData.lastWork = now;

      rpgData[userId] = userData;
      await fs.writeFile(dbPath, JSON.stringify(rpgData, null, 2));

      await sendText(
        `💰 *Trabalho concluído!*\n\n` +
        `${job.emoji} ${job.name}\n` +
        `🪙 Ganho: +${earned} golds\n` +
        `💵 Total: ${userData.gold} golds\n\n` +
        `⏳ Próximo trabalho em ${job.cooldown}s`
      );
    } catch (error) {
      console.error("Erro no comando trabalhar:", error);
      await sendText(
        `❌ *Erro ao trabalhar!*\n` +
        `Tente novamente mais tarde.\n\n` +
        `📄 Detalhes: ${error.message}`
      );
    }
  }
};
