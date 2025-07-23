const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX, BOT_NAME } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const fs = require('fs');
const path = require('path');

// ==============================================
// 🏰 RPG DATABASE & CORE SYSTEM
// ==============================================

const RPG_DB_PATH = path.join(BASE_DIR, 'database', 'rpg-data.json');

class RPGSystem {
  constructor() {
    this.players = new Map();
    this.loadData();
    this.professions = {
      fazendeiro: { min: 10, max: 20, emoji: '👨‍🌾' },
      minerador: { min: 15, max: 25, emoji: '⛏️' },
      construtor: { min: 20, max: 30, emoji: '👷' },
      mercador: { min: 12, max: 22, emoji: '💼', premium: true },
      alquimista: { min: 18, max: 28, emoji: '🧪', premium: true }
    };
    this.ranks = ['👑 Rei', '👸 Rainha', '🤴 Príncipe', '👧 Princesa'];
    this.specialItems = ['Potion', 'Amulet', 'Sword', 'Shield'];
  }

  loadData() {
    try {
      if (fs.existsSync(RPG_DB_PATH)) {
        const data = JSON.parse(fs.readFileSync(RPG_DB_PATH, 'utf8'));
        data.players.forEach(player => {
          this.players.set(player.userJid, player);
        });
        console.log('✅ RPG data loaded successfully');
      }
    } catch (error) {
      errorLog(`Error loading RPG data: ${error}`);
    }
  }

  saveData() {
    try {
      const data = {
        players: Array.from(this.players.values())
      };
      fs.writeFileSync(RPG_DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
      errorLog(`Error saving RPG data: ${error}`);
    }
  }

  getPlayer(userJid, userName) {
    if (!this.players.has(userJid)) {
      this.players.set(userJid, {
        userJid,
        name: userName,
        golds: 100,
        profession: null,
        status: 'Normal',
        master: null,
        cursedRounds: 0,
        monsterRounds: 0,
        lastWorked: null,
        inventory: [],
        health: 100,
        level: 1,
        xp: 0
      });
    }
    return this.players.get(userJid);
  }

  getRankedPlayers() {
    return Array.from(this.players.values())
      .filter(p => p.status === 'Normal')
      .sort((a, b) => b.golds - a.golds);
  }

  updateStatuses() {
    this.players.forEach(player => {
      if (player.cursedRounds > 0) player.cursedRounds--;
      if (player.monsterRounds > 0) player.monsterRounds--;
      
      if (player.cursedRounds === 0 && player.status === 'Amaldiçoado') {
        player.status = 'Normal';
      }
      if (player.monsterRounds === 0 && player.status === 'Monstro') {
        player.status = 'Normal';
      }
    });
    this.saveData();
  }

  addXP(player, amount) {
    player.xp += amount;
    const xpNeeded = player.level * 100;
    if (player.xp >= xpNeeded) {
      player.level++;
      player.xp = 0;
      player.health = 100; // Full heal on level up
      return true; // Level up occurred
    }
    return false;
  }
}

const rpg = new RPGSystem();

// ==============================================
// 🎮 RPG COMMANDS
// ==============================================

// 💼 PROFESSION COMMAND
module.exports.profissao = {
  name: "profissao",
  description: "Escolhe sua profissão no RPG",
  commands: ["profissao", "profissão", "prof", "setprof"],
  usage: `${PREFIX}profissao <tipo>`,
  handle: async ({ args, remoteJid, userJid, sendReply, sendErrorReply, userName }) => {
    try {
      const profession = args[0]?.toLowerCase();
      if (!profession || !rpg.professions[profession]) {
        const availableProfs = Object.keys(rpg.professions).join(', ');
        throw new InvalidParameterError(`Profissão inválida! Disponíveis: ${availableProfs}`);
      }

      const player = rpg.getPlayer(userJid, userName);
      player.profession = profession.charAt(0).toUpperCase() + profession.slice(1);
      rpg.saveData();

      const profEmoji = rpg.professions[profession].emoji;
      await sendReply(
        `${profEmoji} *${userName}* agora é um *${player.profession}*!\n` +
        `💼 Ganhos por trabalho: *${rpg.professions[profession].min}-${rpg.professions[profession].max} golds*`
      );
    } catch (error) {
      errorLog(`Profession error: ${error.message}`);
      sendErrorReply(error.message);
    }
  }
};

// ⛏️ WORK COMMAND
module.exports.trabalhar = {
  name: "trabalhar",
  description: "Trabalha para ganhar golds",
  commands: ["trabalhar", "work", "trabalho"],
  usage: `${PREFIX}trabalhar`,
  handle: async ({ remoteJid, userJid, sendReply, sendErrorReply, userName }) => {
    try {
      rpg.updateStatuses();
      const player = rpg.getPlayer(userJid, userName);
      const today = new Date().toDateString();

      if (!player.profession) {
        throw new InvalidParameterError("Escolha uma profissão primeiro com /profissao");
      }

      if (player.status === 'Amaldiçoado') {
        throw new InvalidParameterError("Você está amaldiçoado e não pode trabalhar! 😵");
      }

      if (player.status === 'Monstro') {
        throw new InvalidParameterError("Monstros não podem trabalhar! 👹");
      }

      if (player.lastWorked === today) {
        throw new InvalidParameterError("Você já trabalhou hoje. Descanse! 😴");
      }

      const profession = player.profession.toLowerCase();
      const { min, max, emoji } = rpg.professions[profession];
      const earnedGolds = Math.floor(Math.random() * (max - min + 1)) + min;
      let xpEarned = Math.floor(earnedGolds / 5);

      // Slave logic
      if (player.status === 'Escravo' && player.master) {
        const master = rpg.players.get(player.master);
        if (master) {
          const masterCut = Math.floor(earnedGolds * 0.3);
          master.golds += masterCut;
          player.golds += (earnedGolds - masterCut);
          
          const leveledUp = rpg.addXP(player, xpEarned);
          let xpMsg = leveledUp ? 
            `✨ *LEVEL UP!* Agora você é nível ${player.level}\n` : 
            `📈 XP: +${xpEarned} (${player.xp}/${player.level * 100})\n`;
          
          await sendReply(
            `${emoji} *${userName}* trabalhou como *${player.profession}*\n` +
            `💰 Ganhou: *${earnedGolds} golds* (${masterCut} para o mestre)\n` +
            xpMsg +
            `💵 Seus golds agora: *${player.golds}*`
          );
        }
      } else {
        player.golds += earnedGolds;
        const leveledUp = rpg.addXP(player, xpEarned);
        let xpMsg = leveledUp ? 
          `✨ *LEVEL UP!* Agora você é nível ${player.level}\n` : 
          `📈 XP: +${xpEarned} (${player.xp}/${player.level * 100})\n`;
        
        await sendReply(
          `${emoji} *${userName}* trabalhou como *${player.profession}*\n` +
          `💰 Ganhou: *${earnedGolds} golds*\n` +
          xpMsg +
          `💵 Seus golds agora: *${player.golds}*`
        );
      }

      player.lastWorked = today;
      rpg.saveData();
    } catch (error) {
      errorLog(`Work error: ${error.message}`);
      sendErrorReply(error.message);
    }
  }
};

// 🏆 RANKING COMMAND
module.exports.ranking = {
  name: "ranking",
  description: "Mostra o ranking de jogadores",
  commands: ["ranking", "rank", "top"],
  usage: `${PREFIX}ranking`,
  handle: async ({ sendReply }) => {
    try {
      rpg.updateStatuses();
      const rankedPlayers = rpg.getRankedPlayers();
      
      if (rankedPlayers.length === 0) {
        return sendReply("📊 Nenhum jogador no ranking ainda! Trabalhe para entrar!");
      }

      let message = "🏆 *RANKING DE JOGADORES* 🏆\n\n";
      
      // Top 4 with special emojis
      rankedPlayers.slice(0, 4).forEach((player, index) => {
        message += `${rpg.ranks[index]} - *${player.name}*: ${player.golds} golds (Nível ${player.level})\n`;
      });

      // Other players
      if (rankedPlayers.length > 4) {
        message += `\n👤 *Plebeus*:\n`;
        rankedPlayers.slice(4).forEach((player, index) => {
          message += `${index + 5}. ${player.name}: ${player.golds} golds (Nível ${player.level})\n`;
        });
      }

      await sendReply(message);
    } catch (error) {
      errorLog(`Ranking error: ${error.message}`);
      sendErrorReply("Erro ao gerar ranking. Tente novamente!");
    }
  }
};

// ⚔️ DUEL COMMAND
module.exports.duelo = {
  name: "duelo",
  description: "Desafia outro jogador para um duelo",
  commands: ["duelo", "duel", "desafiar"],
  usage: `${PREFIX}duelo @jogador`,
  handle: async ({ args, remoteJid, userJid, sendReply, sendErrorReply, userName, mentions }) => {
    try {
      if (!args[0] || !mentions || mentions.length === 0) {
        throw new InvalidParameterError("Marque um jogador para duelar! Ex: /duelo @amigo");
      }

      const challenger = rpg.getPlayer(userJid, userName);
      const targetJid = mentions[0];
      const targetPlayer = rpg.getPlayer(targetJid, targetJid.split('@')[0]);

      if (challenger.userJid === targetJid) {
        throw new InvalidParameterError("Você não pode duelar consigo mesmo! 🤨");
      }

      if (challenger.status !== 'Normal' || targetPlayer.status !== 'Normal') {
        throw new InvalidParameterError("Apenas jogadores normais podem duelar!");
      }

      if (challenger.golds < 50 || targetPlayer.golds < 50) {
        throw new InvalidParameterError("Ambos precisam ter pelo menos 50 golds para duelar!");
      }

      // Duel simulation with level consideration
      const challengerPower = challenger.level + Math.random();
      const targetPower = targetPlayer.level + Math.random();
      const challengerWins = challengerPower > targetPower;

      if (challengerWins) {
        // Challenger wins
        const goldsWon = Math.min(50, targetPlayer.golds);
        challenger.golds += goldsWon;
        targetPlayer.golds -= goldsWon;
        targetPlayer.status = 'Escravo';
        targetPlayer.master = challenger.userJid;
        rpg.addXP(challenger, 25);

        await sendReply(
          `⚔️ *DUELO FINALIZADO* ⚔️\n` +
          `🏆 *Vencedor:* ${challenger.name} (Nível ${challenger.level})\n` +
          `💀 *Perdedor:* ${targetPlayer.name} virou escravo!\n` +
          `💰 *Pilhagem:* ${goldsWon} golds transferidos\n` +
          `✨ ${challenger.name} ganhou +25 XP!`
        );
      } else {
        // Target wins
        const goldsWon = Math.min(50, challenger.golds);
        targetPlayer.golds += goldsWon;
        challenger.golds -= goldsWon;
        challenger.status = 'Escravo';
        challenger.master = targetPlayer.userJid;
        rpg.addXP(targetPlayer, 25);

        await sendReply(
          `⚔️ *DUELO FINALIZADO* ⚔️\n` +
          `🏆 *Vencedor:* ${targetPlayer.name} (Nível ${targetPlayer.level})\n` +
          `💀 *Perdedor:* ${challenger.name} virou escravo!\n` +
          `💰 *Pilhagem:* ${goldsWon} golds transferidos\n` +
          `✨ ${targetPlayer.name} ganhou +25 XP!`
        );
      }
      rpg.saveData();
    } catch (error) {
      errorLog(`Duel error: ${error.message}`);
      sendErrorReply(error.message);
    }
  }
};

// 🏃 ESCAPE COMMAND
module.exports.fugir = {
  name: "fugir",
  description: "Tenta fugir da escravidão",
  commands: ["fugir", "escape", "flee"],
  usage: `${PREFIX}fugir`,
  handle: async ({ remoteJid, userJid, sendReply, sendErrorReply, userName }) => {
    try {
      const player = rpg.getPlayer(userJid, userName);

      if (player.status !== 'Escravo') {
        throw new InvalidParameterError("Você não é escravo para fugir! 😅");
      }

      // Escape chance based on level
      const escapeChance = 0.3 + (player.level * 0.02);
      const escapeSuccess = Math.random() < escapeChance;

      if (escapeSuccess) {
        player.status = 'Normal';
        player.master = null;
        await sendReply(
          `🏃‍♂️ *${userName}* conseguiu fugir da escravidão!\n` +
          `🎉 Agora você está livre novamente!`
        );
      } else {
        await sendReply(
          `⛓️ *${userName}* tentou fugir mas falhou!\n` +
          `😰 O mestre ficou sabendo...`
        );
      }
      rpg.saveData();
    } catch (error) {
      errorLog(`Escape error: ${error.message}`);
      sendErrorReply(error.message);
    }
  }
};

// 🗝️ FREE COMMAND
module.exports.libertar = {
  name: "libertar",
  description: "Liberta um escravo (somente mestre)",
  commands: ["libertar", "free", "liberar"],
  usage: `${PREFIX}libertar @jogador`,
  handle: async ({ args, remoteJid, userJid, sendReply, sendErrorReply, userName, mentions }) => {
    try {
      if (!args[0] || !mentions || mentions.length === 0) {
        throw new InvalidParameterError("Marque um escravo para libertar!");
      }

      const master = rpg.getPlayer(userJid, userName);
      const targetJid = mentions[0];
      const slave = rpg.getPlayer(targetJid, targetJid.split('@')[0]);

      if (slave.status !== 'Escravo' || slave.master !== master.userJid) {
        throw new InvalidParameterError("Este jogador não é seu escravo!");
      }

      slave.status = 'Normal';
      slave.master = null;

      await sendReply(
        `🗝️ *${userName}* libertou *${slave.name}* da escravidão!\n` +
        `🤝 Que a paz reinte entre vocês!`
      );
      rpg.saveData();
    } catch (error) {
      errorLog(`Free error: ${error.message}`);
      sendErrorReply(error.message);
    }
  }
};

// 🧙 CURSE COMMAND (KING ONLY)
module.exports.amaldicoar = {
  name: "amaldicoar",
  description: "Amaldiçoa um jogador (somente Rei)",
  commands: ["amaldicoar", "curse", "amaldiçoar"],
  usage: `${PREFIX}amaldicoar @jogador`,
  handle: async ({ args, remoteJid, userJid, sendReply, sendErrorReply, userName, mentions }) => {
    try {
      rpg.updateStatuses();
      const rankedPlayers = rpg.getRankedPlayers();
      
      if (rankedPlayers.length === 0 || rankedPlayers[0].userJid !== userJid) {
        throw new InvalidParameterError("Apenas o Rei pode amaldiçoar! 👑");
      }

      if (!args[0] || !mentions || mentions.length === 0) {
        throw new InvalidParameterError("Marque um jogador para amaldiçoar!");
      }

      const targetJid = mentions[0];
      const targetPlayer = rpg.getPlayer(targetJid, targetJid.split('@')[0]);

      if (targetPlayer.status !== 'Normal') {
        throw new InvalidParameterError("Só pode amaldiçoar jogadores normais!");
      }

      targetPlayer.status = 'Amaldiçoado';
      targetPlayer.cursedRounds = 1;

      await sendReply(
        `🧙 *${userName}* amaldiçoou *${targetPlayer.name}*!\n` +
        `⚠️ Ele não poderá trabalhar na próxima rodada!\n` +
        `😈 O poder real foi exercido!`
      );
      rpg.saveData();
    } catch (error) {
      errorLog(`Curse error: ${error.message}`);
      sendErrorReply(error.message);
    }
  }
};

// 👹 MONSTER COMMAND (KING ONLY)
module.exports.monstro = {
  name: "monstro",
  description: "Transforma jogador em monstro (somente Rei)",
  commands: ["monstro", "monster", "transformar"],
  usage: `${PREFIX}monstro @jogador`,
  handle: async ({ args, remoteJid, userJid, sendReply, sendErrorReply, userName, mentions }) => {
    try {
      rpg.updateStatuses();
      const rankedPlayers = rpg.getRankedPlayers();
      
      if (rankedPlayers.length === 0 || rankedPlayers[0].userJid !== userJid) {
        throw new InvalidParameterError("Apenas o Rei pode transformar em monstro! 👑");
      }

      if (!args[0] || !mentions || mentions.length === 0) {
        throw new InvalidParameterError("Marque um jogador para transformar!");
      }

      const targetJid = mentions[0];
      const targetPlayer = rpg.getPlayer(targetJid, targetJid.split('@')[0]);

      if (targetPlayer.status !== 'Normal') {
        throw new InvalidParameterError("Só pode transformar jogadores normais!");
      }

      targetPlayer.status = 'Monstro';
      targetPlayer.monsterRounds = 2;

      await sendReply(
        `👹 *${userName}* transformou *${targetPlayer.name}* em um MONSTRO!\n` +
        `⚠️ Ele só poderá atacar por 2 rodadas!\n` +
        `😈 O poder real foi exercido!`
      );
      rpg.saveData();
    } catch (error) {
      errorLog(`Monster error: ${error.message}`);
      sendErrorReply(error.message);
    }
  }
};

// 🎯 ATTACK COMMAND (MONSTER ONLY)
module.exports.atacar = {
  name: "atacar",
  description: "Ataca um jogador (somente Monstro)",
  commands: ["atacar", "attack", "roubar"],
  usage: `${PREFIX}atacar @jogador`,
  handle: async ({ args, remoteJid, userJid, sendReply, sendErrorReply, userName, mentions }) => {
    try {
      const monster = rpg.getPlayer(userJid, userName);

      if (monster.status !== 'Monstro') {
        throw new InvalidParameterError("Apenas monstros podem atacar! 👹");
      }

      if (!args[0] || !mentions || mentions.length === 0) {
        throw new InvalidParameterError("Marque um jogador para atacar!");
      }

      const targetJid = mentions[0];
      const targetPlayer = rpg.getPlayer(targetJid, targetJid.split('@')[0]);

      if (targetPlayer.status === 'Monstro') {
        throw new InvalidParameterError("Monstros não podem atacar outros monstros!");
      }

      // Attack success based on level difference
      const levelDiff = monster.level - targetPlayer.level;
      const baseChance = 0.7 + (levelDiff * 0.05);
      const attackSuccess = Math.random() < baseChance;
      
      if (attackSuccess) {
        const goldsStolen = Math.floor(Math.random() * 30) + 1;
        const actualStolen = Math.min(goldsStolen, targetPlayer.golds);
        
        monster.golds += actualStolen;
        targetPlayer.golds -= actualStolen;
        rpg.addXP(monster, 15);

        await sendReply(
          `👹 *${userName}* atacou *${targetPlayer.name}* e roubou *${actualStolen} golds*!\n` +
          `💰 Seus golds agora: *${monster.golds}*\n` +
          `✨ Ganhou +15 XP!`
        );
      } else {
        await sendReply(
          `👹 *${userName}* tentou atacar *${targetPlayer.name}* mas falhou!\n` +
          `😅 O alvo escapou do seu ataque!`
        );
      }
      rpg.saveData();
    } catch (error) {
      errorLog(`Attack error: ${error.message}`);
      sendErrorReply(error.message);
    }
  }
};

// ℹ️ PLAYER INFO COMMAND
module.exports.perfil = {
  name: "perfil",
  description: "Mostra informações do jogador",
  commands: ["perfil", "profile", "info"],
  usage: `${PREFIX}perfil [@jogador]`,
  handle: async ({ args, remoteJid, userJid, sendReply, sendErrorReply, userName, mentions }) => {
    try {
      rpg.updateStatuses();
      let targetJid = userJid;
      
      if (args[0] && mentions && mentions.length > 0) {
        targetJid = mentions[0];
      }

      const player = rpg.getPlayer(targetJid, targetJid.split('@')[0]);
      const rankedPlayers = rpg.getRankedPlayers();
      const rankIndex = rankedPlayers.findIndex(p => p.userJid === targetJid);
      
      let rank;
      if (player.status === 'Monstro') rank = '👹 Monstro';
      else if (player.status === 'Escravo') rank = '🧎 Escravo';
      else if (rankIndex >= 0 && rankIndex < 4) rank = rpg.ranks[rankIndex];
      else rank = '👤 Plebeu';

      const professionEmoji = player.profession ? 
        rpg.professions[player.profession.toLowerCase()]?.emoji || '❓' : '❌';

      await sendReply(
        `🧑‍🎤 *PERFIL DE ${player.name.toUpperCase()}*\n\n` +
        `🎖️ *Rank:* ${rank}\n` +
        `${professionEmoji} *Profissão:* ${player.profession || 'Nenhuma'}\n` +
        `💰 *Golds:* ${player.golds}\n` +
        `🧪 *Nível:* ${player.level} (${player.xp}/${player.level * 100} XP)\n` +
        `💊 *Status:* ${player.status}\n` +
        `${player.master ? `⛓️ *Mestre:* @${player.master.split('@')[0]}\n` : ''}` +
        `📅 *Último trabalho:* ${player.lastWorked || 'Nunca'}\n`
      );
    } catch (error) {
      errorLog(`Profile error: ${error.message}`);
      sendErrorReply("Erro ao mostrar perfil. Tente novamente!");
    }
  }
};

// 🎮 RPG HELP COMMAND
module.exports.rpghelp = {
  name: "rpghelp",
  description: "Mostra ajuda sobre o sistema RPG",
  commands: ["rpghelp", "helprpg", "rpg"],
  usage: `${PREFIX}rpghelp`,
  handle: async ({ sendReply }) => {
    const helpMessage = `
🎮 *COMANDOS DO RPG* 🎮

💼 *Profissões*
${PREFIX}profissao <tipo> - Escolhe profissão (fazendeiro, minerador, construtor)
${PREFIX}trabalhar - Ganha golds (depende da profissão)

🏆 *Ranking*
${PREFIX}ranking - Mostra o top 4 jogadores

⚔️ *Duelos*
${PREFIX}duelo @jogador - Desafia para um duelo (50 golds)

🧎 *Escravidão*
${PREFIX}fugir - Tenta escapar (30% chance + nível)
${PREFIX}libertar @jogador - Liberta seu escravo

🧙 *Rei/Rainha*
${PREFIX}amaldicoar @jogador - Bloqueia trabalho (1 rodada)
${PREFIX}monstro @jogador - Transforma em monstro (2 rodadas)

👹 *Monstro*
${PREFIX}atacar @jogador - Tenta roubar golds (até 30)

ℹ️ *Informações*
${PREFIX}perfil - Mostra seu perfil
${PREFIX}perfil @jogador - Mostra perfil de outro jogador

📊 *Status*
Normal: Pode trabalhar e duelar
Escravo: Trabalha para mestre (70% dos golds)
Monstro: Só pode atacar (2 rodadas)
Amaldiçoado: Não pode trabalhar (1 rodada)
    `.trim();

    await sendReply(helpMessage);
  }
};