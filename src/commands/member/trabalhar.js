const path = require('path');
const fs = require('fs').promises;
const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

const EMPREGOS = {
  FAZENDEIRO: { nome: "👨‍🌾 Fazendeiro", cooldown: 10, min: 15, max: 30, xp: 2 },
  MINEIRO: { nome: "⛏️ Mineiro", cooldown: 15, min: 20, max: 40, xp: 3 },
  PESCADOR: { nome: "🎣 Pescador", cooldown: 12, min: 18, max: 35, xp: 2 },
  ALQUIMISTA: { nome: "🧪 Alquimista", cooldown: 25, min: 30, max: 60, xp: 5, requisito: { nivel: 5 } },
  CAÇADOR: { nome: "🏹 Caçador", cooldown: 20, min: 25, max: 50, xp: 4 },
  FERREIRO: { nome: "⚒️ Ferreiro", cooldown: 18, min: 22, max: 45, xp: 4 }
};

const CURSOS = {
  BRUXO: { nome: "🧙‍♂️ Bruxo", custo: 1000, maldicoes: 3 },
  SACERDOTE: { nome: "🙏 Sacerdote", custo: 800, cura: 2 }
};

async function loadData() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'rpg_data.json'), 'utf8');
    return JSON.parse(data);
  } catch {
    return { users: {}, lastReset: Date.now() };
  }
}

async function saveData(data) {
  await fs.writeFile(path.join(__dirname, 'rpg_data.json'), JSON.stringify(data, null, 2));
}

module.exports = {
  name: "trabalhar",
  description: "Trabalhe para ganhar recursos",
  commands: ["trabalhar", "work"],
  usage: `${PREFIX}trabalhar <emprego>`,
  
  handle: async ({ sendText, userJid, args }) => {
    const userId = onlyNumbers(userJid);
    const data = await loadData();
    const user = data.users[userId] || initUser(userId);

    if (!args[0]) {
      const lista = Object.values(EMPREGOS).map(e => 
        `${e.nome} - ${e.min}-${e.max} golds (${e.cooldown}s)${e.requisito ? ` [Nv.${e.requisito.nivel}]` : ''}`
      ).join('\n');
      
      await sendText(`EMPREGOS:\n${lista}\n\nNível: ${user.nivel} | Gold: ${user.gold}`);
      return;
    }

    const emprego = Object.values(EMPREGOS).find(e => 
      e.nome.toLowerCase().includes(args[0].toLowerCase())
    );

    if (!emprego) {
      await sendText("Emprego não encontrado!");
      return;
    }

    if (emprego.requisito && user.nivel < emprego.requisito.nivel) {
      await sendText(`Requer nível ${emprego.requisito.nivel} para este trabalho!`);
      return;
    }

    if (user.cooldowns?.trabalho > Date.now()) {
      const remaining = Math.ceil((user.cooldowns.trabalho - Date.now()) / 1000);
      await sendText(`Aguarde ${remaining}s para trabalhar novamente!`);
      return;
    }

    const ganho = Math.floor(Math.random() * (emprego.max - emprego.min + 1)) + emprego.min;
    const bonus = Math.floor(ganho * (user.nivel * 0.01));
    
    user.gold += ganho + bonus;
    user.xp += emprego.xp;
    user.cooldowns = { ...user.cooldowns, trabalho: Date.now() + (emprego.cooldown * 1000) };
    
    const novoNivel = Math.floor(Math.sqrt(user.xp / 10)) + 1;
    if (novoNivel > user.nivel) {
      user.nivel = novoNivel;
      await sendText(`🎉 Nível ${user.nivel} alcançado! +${ganho + bonus} golds (${bonus} bônus)`);
    } else {
      await sendText(`+${ganho + bonus} golds recebidos!`);
    }

    data.users[userId] = user;
    await saveData(data);
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
    curses: 0,
    class: null
  };
}
