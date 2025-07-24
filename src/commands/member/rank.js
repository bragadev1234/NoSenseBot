const path = require('path');
const fs = require('fs').promises;
const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

const ROLES = {
  REI: { title: "👑 Rei", tax: 0.1 },
  RAINHA: { title: "👸 Rainha", tax: 0.05 },
  BRUXO: { title: "🧙‍♂️ Bruxo", canCurse: true },
  MONSTRO: { title: "👹 Monstro", tax: 0.3 },
  ESCRAVO: { title: "🪤 Escravo", tax: 0.2 },
  PLEBEU: { title: "🧑 Plebeu", tax: 0 }
};

async function loadData() {
  try {
    return JSON.parse(await fs.readFile(path.join(__dirname, 'rpg_data.json'), 'utf8');
  } catch {
    return { users: {} };
  }
}

module.exports = {
  name: "rank",
  description: "Mostra o ranking do RPG",
  commands: ["rank", "ranking"],
  usage: `${PREFIX}rank`,
  
  handle: async ({ sendText }) => {
    const data = await loadData();
    const ranked = Object.values(data.users)
      .sort((a, b) => b.gold - a.gold)
      .slice(0, 10);
    
    let message = "🏆 TOP 10 🏆\n\n";
    ranked.forEach((user, i) => {
      const role = ROLES[user.role] || ROLES.PLEBEU;
      message += `${i+1}. ${role.title} @${user.id}\n   💰 ${user.gold} golds | 🎚️ Nv.${user.nivel}\n`;
    });
    
    await sendText(message);
  }
};
