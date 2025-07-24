const path = require('path');
const fs = require('fs').promises;
const { PREFIX } = require('../../config');
const { toUserJid, onlyNumbers } = require('../../utils');

async function loadData() {
  try {
    return JSON.parse(await fs.readFile(path.join(__dirname, 'rpg_data.json'), 'utf8'));
  } catch {
    return { users: {} };
  }
}

async function saveData(data) {
  await fs.writeFile(path.join(__dirname, 'rpg_data.json'), JSON.stringify(data, null, 2));
}

module.exports = {
  name: "duelar",
  description: "Desafie alguém para um duelo",
  commands: ["duelar", "duelo"],
  usage: `${PREFIX}duelar @usuario`,
  
  handle: async ({ sendText, userJid, replyJid, args, isReply }) => {
    const challengerId = onlyNumbers(userJid);
    const targetJid = isReply ? replyJid : toUserJid(args[0]);
    const targetId = onlyNumbers(targetJid);
    
    if (!targetId) return await sendText("Mencione um usuário!");
    if (challengerId === targetId) return await sendText("Não pode duelar consigo mesmo!");

    const data = await loadData();
    const challenger = data.users[challengerId] || initUser(challengerId);
    const target = data.users[targetId] || initUser(targetId);

    if (challenger.cooldowns?.duelo > Date.now()) {
      const remaining = Math.ceil((challenger.cooldowns.duelo - Date.now()) / 1000);
      return await sendText(`Aguarde ${remaining}s para duelar novamente!`);
    }

    await sendText(`⚔️ Duelo entre @${challengerId} e @${targetId} começando em 10s...`);

    setTimeout(async () => {
      let winner, loser;
      const challengerWinChance = 0.5 + (challenger.nivel - target.nivel) * 0.05;
      const isChallengerWinner = Math.random() < challengerWinChance;

      if (isChallengerWinner) {
        winner = challenger;
        loser = target;
      } else {
        winner = target;
        loser = challenger;
      }

      // Recompensas e punições
      const reward = Math.floor(loser.gold * 0.1);
      winner.gold += reward;
      loser.gold -= reward;
      
      // Atualizar cargos para escravo se perder
      if (loser.role === 'REI' || loser.role === 'RAINHA') {
        loser.role = 'PLEBEU';
      } else {
        loser.role = 'ESCRAVO';
        loser.owner = winner.id;
      }

      winner.cooldowns = { ...winner.cooldowns, duelo: Date.now() + 300000 }; // 5min cooldown
      
      data.users[challengerId] = challenger;
      data.users[targetId] = target;
      await saveData(data);

      await sendText(
        `🏆 @${winner.id} venceu o duelo!\n` +
        `💰 Recebeu ${reward} golds\n` +
        `👑 @${loser.id} agora é ${loser.role === 'ESCRAVO' ? 'escravo' : 'plebeu'}`
      );
    }, 10000);
  }
};

function initUser(id) {
  return {
    id,
    gold: 100,
    xp: 0,
    nivel: 1,
    role: 'PLEBEU',
    cooldowns: {}
  };
}
