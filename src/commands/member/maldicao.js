const path = require('path');
const fs = require('fs').promises;
const { PREFIX } = require('../../config');
const { toUserJid, onlyNumbers } = require('../../utils');

async function loadData() {
  try {
    return JSON.parse(await fs.readFile(path.join(__dirname, 'rpg_data.json'), 'utf8');
  } catch {
    return { users: {} };
  }
}

async function saveData(data) {
  await fs.writeFile(path.join(__dirname, 'rpg_data.json'), JSON.stringify(data, null, 2));
}

module.exports = {
  name: "maldicao",
  description: "Amaldiçoe um jogador (apenas bruxos)",
  commands: ["maldicao", "amaldicoar"],
  usage: `${PREFIX}maldicao @usuario`,
  
  handle: async ({ sendText, userJid, replyJid, args, isReply }) => {
    const casterId = onlyNumbers(userJid);
    const targetJid = isReply ? replyJid : toUserJid(args[0]);
    const targetId = onlyNumbers(targetJid);
    
    if (!targetId) return await sendText("Mencione um usuário!");
    if (casterId === targetId) return await sendText("Não pode amaldiçoar a si mesmo!");

    const data = await loadData();
    const caster = data.users[casterId] || initUser(casterId);
    const target = data.users[targetId] || initUser(targetId);

    if (caster.class !== 'BRUXO') {
      return await sendText("Apenas bruxos podem lançar maldições!");
    }

    if (caster.cooldowns?.maldicao > Date.now()) {
      const remaining = Math.ceil((caster.cooldowns.maldicao - Date.now()) / 1000);
      return await sendText(`Aguarde ${remaining}s para usar novamente!`);
    }

    if (target.role === 'REI' || target.role === 'RAINHA') {
      return await sendText("Não pode amaldiçoar a realeza!");
    }

    // Efeito da maldição
    target.curses = (target.curses || 0) + 1;
    const penalty = Math.floor(target.gold * 0.15);
    target.gold -= penalty;
    caster.gold += penalty;
    
    caster.cooldowns = { ...caster.cooldowns, maldicao: Date.now() + 3600000 }; // 1h cooldown
    
    data.users[casterId] = caster;
    data.users[targetId] = target;
    await saveData(data);

    await sendText(
      `🌀 @${casterId} amaldiçoou @${targetId}!\n` +
      `💀 +1 maldição (total: ${target.curses})\n` +
      `💰 ${penalty} golds transferidos`
    );
  }
};

function initUser(id) {
  return {
    id,
    gold: 0,
    xp: 0,
    nivel: 1,
    role: 'PLEBEU',
    cooldowns: {},
    curses: 0
  };
}
