const path = require('path');
const fs = require('fs').promises;
const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

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
  name: "bruxo",
  description: "Torne-se um bruxo (custo: 1000 golds)",
  commands: ["bruxo", "virarbruxo"],
  usage: `${PREFIX}bruxo`,
  
  handle: async ({ sendText, userJid }) => {
    const userId = onlyNumbers(userJid);
    const data = await loadData();
    const user = data.users[userId] || initUser(userId);

    if (user.class) {
      return await sendText(`Você já é um ${user.class === 'BRUXO' ? 'bruxo' : 'sacerdote'}!`);
    }

    if (user.gold < 1000) {
      return await sendText(`Necessário 1000 golds (você tem ${user.gold})!`);
    }

    user.class = 'BRUXO';
    user.gold -= 1000;
    
    data.users[userId] = user;
    await saveData(data);

    await sendText(
      "🧙‍♂️ Você agora é um Bruxo!\n\n" +
      "Você pode:\n" +
      `- Usar ${PREFIX}maldicao em jogadores\n` +
      "- Roubar 15% dos golds do alvo\n" +
      "- 1 maldição por hora\n\n" +
      "Restrições:\n" +
      "- Não pode atacar a realeza\n" +
      "- Vulnerável a sacerdotes"
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
    cooldowns: {}
  };
}
