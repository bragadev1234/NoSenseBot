const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers, isGroup } = require(`${BASE_DIR}/utils`);
const path = require("node:path");
const fs = require("node:fs").promises;

// Banco de dados em memória (em produção, substituir por um banco real)
const RPG_DB = {
  users: {},
  monsters: {},
  shop: {},
  rankings: { gold: [], xp: [] },
  specialCharacters: {
    "553597816349@s.whatsapp.net": {
      name: "Rainha Feiticeira Lavs",
      title: "Deusa Suprema / Rainha Eterna",
      weapon: "Espada Astoria",
      powers: ["Dano infinito", "Corta qualquer coisa", "Queima almas eternamente", "Transcende o universo humano"],
      income: 1000000 // por hora
    },
    "5519981889986@s.whatsapp.net": {
      name: "Escriba Suprema Dany",
      title: "Escriba Suprema da Deusa Lavs",
      weapon: "Cajado mágico Instropecto La Varum Chtuvhulo",
      powers: ["Poderes transcendentes", "Mesmo nível da Espada Astoria"],
      income: 1000000 // por hora
    },
    "5521985886256@s.whatsapp.net": {
      name: "Magnata Maligno",
      title: "Controlador de Armas",
      powers: ["Modificar status de armas usando gold e XP"],
      income: 1000000 // por hora
    },
    "559984271816@s.whatsapp.net": {
      name: "Don de La Bragança",
      title: "Divindade Suprema",
      powers: ["Comando total sobre o sistema RPG"],
      adminCommands: true
    }
  }
};

// Inicializar monstros
const initializeMonsters = () => {
  RPG_DB.monsters = {
    goblin: {
      name: "Goblin",
      level: 1,
      health: 50,
      attack: 5,
      defense: 2,
      goldReward: 10,
      xpReward: 20,
      loot: ["Pele de Goblin", "Dente Afiado"]
    },
    orc: {
      name: "Orc",
      level: 3,
      health: 100,
      attack: 12,
      defense: 8,
      goldReward: 30,
      xpReward: 50,
      loot: ["Machado Orc", "Talismã de Guerra"]
    },
    dragon: {
      name: "Dragão",
      level: 10,
      health: 500,
      attack: 40,
      defense: 30,
      goldReward: 200,
      xpReward: 300,
      loot: ["Escama de Dragão", "Presa de Dragão", "Alma de Dragão"]
    }
  };
};

// Inicializar loja
const initializeShop = () => {
  RPG_DB.shop = {
    weapons: {
      dagger: {
        name: "Adaga Simples",
        price: 50,
        attack: 5,
        levelRequired: 1
      },
      sword: {
        name: "Espada Longa",
        price: 150,
        attack: 15,
        levelRequired: 3
      },
      axe: {
        name: "Machado de Batalha",
        price: 300,
        attack: 25,
        levelRequired: 5
      }
    },
    armor: {
      leather: {
        name: "Armadura de Couro",
        price: 80,
        defense: 5,
        levelRequired: 1
      },
      chainmail: {
        name: "Cota de Malha",
        price: 200,
        defense: 15,
        levelRequired: 3
      },
      plate: {
        name: "Armadura de Placa",
        price: 400,
        defense: 30,
        levelRequired: 6
      }
    },
    spells: {
      fireball: {
        name: "Bola de Fogo",
        price: 100,
        damage: 20,
        manaCost: 10,
        levelRequired: 2
      },
      heal: {
        name: "Cura",
        price: 150,
        healthRestore: 30,
        manaCost: 15,
        levelRequired: 3
      },
      lightning: {
        name: "Relâmpago",
        price: 250,
        damage: 40,
        manaCost: 25,
        levelRequired: 5
      }
    }
  };
};

// Inicializar o sistema RPG
initializeMonsters();
initializeShop();

// Funções auxiliares
const getUserRPGData = (jid) => {
  if (!RPG_DB.users[jid]) {
    RPG_DB.users[jid] = {
      level: 1,
      xp: 0,
      gold: 100,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      attack: 10,
      defense: 5,
      inventory: [],
      equipment: {
        weapon: null,
        armor: null,
        spell: null
      },
      battles: {
        wins: 0,
        losses: 0,
        monstersDefeated: 0
      },
      lastIncome: Date.now()
    };
  }
  return RPG_DB.users[jid];
};

const updateRankings = () => {
  const users = Object.entries(RPG_DB.users).map(([jid, data]) => ({ jid, ...data }));
  
  RPG_DB.rankings.gold = users
    .sort((a, b) => b.gold - a.gold)
    .slice(0, 10);
    
  RPG_DB.rankings.xp = users
    .sort((a, b) => (b.level * 1000 + b.xp) - (a.level * 1000 + a.xp))
    .slice(0, 10);
};

const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp) / 5) + 1;
};

const checkSpecialCharacter = (jid) => {
  return RPG_DB.specialCharacters[jid];
};

const giveIncome = async (jid) => {
  const specialChar = checkSpecialCharacter(jid);
  if (specialChar && specialChar.income) {
    const userData = getUserRPGData(jid);
    const now = Date.now();
    const hoursPassed = Math.floor((now - userData.lastIncome) / (1000 * 60 * 60));
    
    if (hoursPassed > 0) {
      userData.gold += specialChar.income * hoursPassed;
      userData.lastIncome = now;
      return `💰 Como ${specialChar.title}, você recebeu ${specialChar.income * hoursPassed} golds de renda.`;
    }
  }
  return null;
};

// Comandos RPG
module.exports = {
  // Comando de perfil RPG
  name: "perfilrpg",
  description: "Mostra o perfil RPG do usuário",
  commands: ["perfilrpg", "rpgprofile"],
  usage: `${PREFIX}perfilrpg [@usuario]`,
  handle: async ({
    args,
    socket,
    remoteJid,
    userJid,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
    sendText
  }) => {
    await sendWaitReply("Carregando perfil RPG...");
    
    const targetJid = args[0] 
      ? args[0].replace(/[@ ]/g, "") + "@s.whatsapp.net" 
      : userJid;
    
    const userData = getUserRPGData(targetJid);
    const specialChar = checkSpecialCharacter(targetJid);
    
    // Atualizar renda para personagens especiais
    const incomeMsg = await giveIncome(targetJid);
    
    // Calcular progresso para próximo nível
    const currentLevelXP = Math.pow((userData.level - 1) * 5, 2);
    const nextLevelXP = Math.pow(userData.level * 5, 2);
    const xpProgress = Math.floor(((userData.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
    
    // Arte ASCII para o perfil
    let profileArt = `
    ╔════════════════════════╗
    ║      ◈ PERFIL RPG ◈     ║
    ╠════════════════════════╣
    ║ Nível: ${userData.level.toString().padEnd(16)}║
    ║ XP: ${userData.xp} (${xpProgress}%)     ║
    ║ Gold: ${userData.gold.toString().padEnd(15)}║
    ╠════════════════════════╣
    ║ Saúde: ${userData.health}/${userData.maxHealth}     ║
    ║ Mana: ${userData.mana}/${userData.maxMana}       ║
    ╠════════════════════════╣
    ║ Ataque: ${userData.attack}        ║
    ║ Defesa: ${userData.defense}       ║
    ╠════════════════════════╣
    ║ Vitórias: ${userData.battles.wins}    ║
    ║ Derrotas: ${userData.battles.losses}  ║
    ║ Monstros: ${userData.battles.monstersDefeated} ║
    ╚════════════════════════╝
    `;
    
    if (specialChar) {
      profileArt += `
      ╔════════════════════════╗
      ║  ◈ PERSONAGEM ESPECIAL ◈ ║
      ╠════════════════════════╣
      ║ Nome: ${specialChar.name.padEnd(15)}║
      ║ Título: ${specialChar.title.padEnd(12)}║
      ║ Arma: ${specialChar.weapon?.padEnd(14) || "Nenhuma".padEnd(14)}║
      ╚════════════════════════╝
      `;
    }
    
    if (incomeMsg) {
      profileArt += `\n${incomeMsg}`;
    }
    
    await sendSuccessReact();
    await sendText(profileArt);
  },

  // Comando de ranking
  name: "rank",
  description: "Mostra os rankings de gold e XP",
  commands: ["rank", "ranking"],
  usage: `${PREFIX}rank`,
  handle: async ({ sendText }) => {
    updateRankings();
    
    let goldRanking = "╔════════════════════════╗\n║      ◈ TOP GOLDS ◈      ║\n╠══════════╦═════════════╣\n";
    
    RPG_DB.rankings.gold.forEach((user, index) => {
      const shortJid = user.jid.split("@")[0];
      goldRanking += `║ ${(index + 1).toString().padEnd(8)}║ ${shortJid.padEnd(10)} ║\n║          ║ ${user.gold.toString().padEnd(10)} ║\n`;
      if (index < RPG_DB.rankings.gold.length - 1) {
        goldRanking += "╠══════════╬═════════════╣\n";
      }
    });
    
    goldRanking += "╚══════════╩═════════════╝";
    
    let xpRanking = "╔════════════════════════╗\n║       ◈ TOP XP ◈       ║\n╠══════════╦═════════════╣\n";
    
    RPG_DB.rankings.xp.forEach((user, index) => {
      const shortJid = user.jid.split("@")[0];
      xpRanking += `║ ${(index + 1).toString().padEnd(8)}║ ${shortJid.padEnd(10)} ║\n║          ║ Nv.${user.level} (${user.xp}) ║\n`;
      if (index < RPG_DB.rankings.xp.length - 1) {
        xpRanking += "╠══════════╬═════════════╣\n";
      }
    });
    
    xpRanking += "╚══════════╩═════════════╝";
    
    await sendText(`*Ranking de Golds*\n${goldRanking}\n\n*Ranking de Nível/XP*\n${xpRanking}`);
  },

  // Comando PvP
  name: "pvp",
  description: "Desafia um jogador para uma batalha PvP",
  commands: ["pvp", "batalha"],
  usage: `${PREFIX}pvp @jogador [aposta]`,
  handle: async ({
    args,
    userJid,
    replyJid,
    isReply,
    sendText,
    sendErrorReply,
    sendSuccessReact
  }) => {
    if (!args.length && !isReply) {
      await sendErrorReply("Você precisa mencionar um jogador para batalhar!");
      return;
    }
    
    const targetJid = isReply ? replyJid : toUserJid(args[0]);
    if (!targetJid) {
      await sendErrorReply("Jogador inválido!");
      return;
    }
    
    if (targetJid === userJid) {
      await sendErrorReply("Você não pode batalhar consigo mesmo!");
      return;
    }
    
    const bet = args[1] ? parseInt(args[1]) : 0;
    const attacker = getUserRPGData(userJid);
    const defender = getUserRPGData(targetJid);
    
    if (bet > 0) {
      if (attacker.gold < bet) {
        await sendErrorReply("Você não tem gold suficiente para essa aposta!");
        return;
      }
      
      if (defender.gold < bet) {
        await sendErrorReply("O jogador desafiado não tem gold suficiente para essa aposta!");
        return;
      }
    }
    
    await sendText(`⚔️ Desafio de batalha enviado! Aguardando resposta de @${targetJid.split("@")[0]}...`);
    
    // Simulando batalha (em um sistema real, isso seria mais complexo)
    const attackerRoll = Math.floor(Math.random() * 20) + 1 + attacker.attack;
    const defenderRoll = Math.floor(Math.random() * 20) + 1 + defender.defense;
    
    let result;
    if (attackerRoll > defenderRoll) {
      // Atacante vence
      const goldWon = bet > 0 ? bet : Math.floor(defender.gold * 0.1);
      attacker.gold += goldWon;
      defender.gold = Math.max(0, defender.gold - goldWon);
      attacker.battles.wins += 1;
      defender.battles.losses += 1;
      
      result = `⚔️ @${userJid.split("@")[0]} venceu a batalha contra @${targetJid.split("@")[0]} e ganhou ${goldWon} golds!`;
    } else if (defenderRoll > attackerRoll) {
      // Defensor vence
      const goldWon = bet > 0 ? bet : Math.floor(attacker.gold * 0.1);
      defender.gold += goldWon;
      attacker.gold = Math.max(0, attacker.gold - goldWon);
      defender.battles.wins += 1;
      attacker.battles.losses += 1;
      
      result = `⚔️ @${targetJid.split("@")[0]} venceu a batalha contra @${userJid.split("@")[0]} e ganhou ${goldWon} golds!`;
    } else {
      // Empate
      result = `⚔️ A batalha entre @${userJid.split("@")[0]} e @${targetJid.split("@")[0]} terminou em empate!`;
    }
    
    await sendSuccessReact();
    await sendText(result);
    updateRankings();
  },

  // Comando de caçar monstros
  name: "cacar",
  description: "Caça um monstro para ganhar XP e gold",
  commands: ["cacar", "hunt"],
  usage: `${PREFIX}cacar [monstro]`,
  handle: async ({
    args,
    userJid,
    sendText,
    sendErrorReply,
    sendSuccessReact
  }) => {
    const userData = getUserRPGData(userJid);
    const monsterName = args[0]?.toLowerCase();
    
    let monster;
    if (monsterName) {
      monster = RPG_DB.monsters[monsterName];
      if (!monster) {
        await sendErrorReply("Monstro não encontrado! Use !monstros para ver a lista.");
        return;
      }
      
      if (userData.level < monster.level - 2) {
        await sendErrorReply("Este monstro é muito forte para seu nível!");
        return;
      }
    } else {
      // Monstro aleatório baseado no nível
      const availableMonsters = Object.values(RPG_DB.monsters).filter(m => 
        m.level <= userData.level + 2
      );
      
      if (availableMonsters.length === 0) {
        await sendErrorReply("Nenhum monstro disponível para seu nível!");
        return;
      }
      
      monster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    }
    
    // Simular batalha
    let battleLog = `⚔️ Encontrou um ${monster.name} (Nível ${monster.level})!\n`;
    
    let playerHealth = userData.health;
    let monsterHealth = monster.health;
    
    while (playerHealth > 0 && monsterHealth > 0) {
      // Jogador ataca
      const playerDamage = Math.max(1, userData.attack + Math.floor(Math.random() * 10) - monster.defense);
      monsterHealth -= playerDamage;
      battleLog += `Você causou ${playerDamage} de dano! (${monsterHealth > 0 ? monsterHealth : 0}/${monster.health})\n`;
      
      if (monsterHealth <= 0) break;
      
      // Monstro ataca
      const monsterDamage = Math.max(1, monster.attack + Math.floor(Math.random() * 5) - userData.defense);
      playerHealth -= monsterDamage;
      battleLog += `${monster.name} causou ${monsterDamage} de dano! (${playerHealth > 0 ? playerHealth : 0}/${userData.maxHealth})\n`;
    }
    
    if (playerHealth > 0) {
      // Vitória
      userData.xp += monster.xpReward;
      userData.gold += monster.goldReward;
      userData.battles.monstersDefeated += 1;
      
      // Verificar se subiu de nível
      const newLevel = calculateLevel(userData.xp);
      let levelUpMsg = "";
      if (newLevel > userData.level) {
        userData.level = newLevel;
        userData.maxHealth += 10;
        userData.health = userData.maxHealth;
        userData.maxMana += 5;
        userData.mana = userData.maxMana;
        userData.attack += 2;
        userData.defense += 1;
        levelUpMsg = `\n✨ Parabéns! Você subiu para o nível ${newLevel}!`;
      }
      
      // Loot aleatório
      let lootMsg = "";
      if (Math.random() < 0.3 && monster.loot.length > 0) {
        const lootItem = monster.loot[Math.floor(Math.random() * monster.loot.length)];
        userData.inventory.push(lootItem);
        lootMsg = `\nVocê encontrou: ${lootItem}`;
      }
      
      await sendText(`${battleLog}\nVocê derrotou o ${monster.name}!\nGanhou ${monster.xpReward} XP e ${monster.goldReward} golds.${levelUpMsg}${lootMsg}`);
    } else {
      // Derrota
      const goldLost = Math.floor(userData.gold * 0.1);
      userData.gold = Math.max(0, userData.gold - goldLost);
      userData.health = 1; // Não morrer completamente
      
      await sendText(`${battleLog}\nVocê foi derrotado pelo ${monster.name}!\nPerdeu ${goldLost} golds.`);
    }
    
    await sendSuccessReact();
    updateRankings();
  },

  // Comando de loja
  name: "loja",
  description: "Mostra itens disponíveis para compra",
  commands: ["loja", "shop"],
  usage: `${PREFIX}loja [arma/armadura/magia]`,
  handle: async ({
    args,
    userJid,
    sendText,
    sendErrorReply
  }) => {
    const category = args[0]?.toLowerCase();
    const userData = getUserRPGData(userJid);
    
    let shopItems = "";
    
    if (!category || category === "armas") {
      shopItems += "╔════════════════════════════╗\n║         ◈ ARMAS ◈         ║\n╠══════════════╦══════╦════╣\n";
      for (const [id, item] of Object.entries(RPG_DB.shop.weapons)) {
        shopItems += `║ ${item.name.padEnd(12)}║ ${item.attack.toString().padEnd(4)}║ ${item.price.toString().padEnd(3)}║\n`;
      }
      shopItems += "╚══════════════╩══════╩════╝\n";
    }
    
    if (!category || category === "armaduras") {
      shopItems += "╔════════════════════════════╗\n║       ◈ ARMADURAS ◈       ║\n╠══════════════╦══════╦════╣\n";
      for (const [id, item] of Object.entries(RPG_DB.shop.armor)) {
        shopItems += `║ ${item.name.padEnd(12)}║ ${item.defense.toString().padEnd(4)}║ ${item.price.toString().padEnd(3)}║\n`;
      }
      shopItems += "╚══════════════╩══════╩════╝\n";
    }
    
    if (!category || category === "magias") {
      shopItems += "╔════════════════════════════╗\n║         ◈ MAGIAS ◈        ║\n╠══════════════╦══════╦════╣\n";
      for (const [id, item] of Object.entries(RPG_DB.shop.spells)) {
        const effect = item.damage ? `Dano: ${item.damage}` : `Cura: ${item.healthRestore}`;
        shopItems += `║ ${item.name.padEnd(12)}║ ${effect.padEnd(4)}║ ${item.price.toString().padEnd(3)}║\n`;
      }
      shopItems += "╚══════════════╩══════╩════╝\n";
    }
    
    if (!shopItems) {
      await sendErrorReply("Categoria inválida! Use: armas, armaduras ou magias");
      return;
    }
    
    await sendText(`${shopItems}\nUse !comprar [item] para comprar um item.`);
  },

  // Comando de compra
  name: "comprar",
  description: "Compra um item da loja",
  commands: ["comprar", "buy"],
  usage: `${PREFIX}comprar [item]`,
  handle: async ({
    args,
    userJid,
    sendText,
    sendErrorReply,
    sendSuccessReact
  }) => {
    if (!args.length) {
      await sendErrorReply("Você precisa especificar o item que deseja comprar!");
      return;
    }
    
    const itemName = args[0].toLowerCase();
    const userData = getUserRPGData(userJid);
    
    // Procurar item em todas as categorias
    let item;
    let category;
    
    for (const [cat, items] of Object.entries(RPG_DB.shop)) {
      if (items[itemName]) {
        item = items[itemName];
        category = cat;
        break;
      }
    }
    
    if (!item) {
      await sendErrorReply("Item não encontrado na loja!");
      return;
    }
    
    if (userData.level < item.levelRequired) {
      await sendErrorReply(`Você precisa ser nível ${item.levelRequired} para comprar este item!`);
      return;
    }
    
    if (userData.gold < item.price) {
      await sendErrorReply("Você não tem gold suficiente para comprar este item!");
      return;
    }
    
    // Comprar item
    userData.gold -= item.price;
    
    if (category === "weapons") {
      userData.equipment.weapon = item.name;
      userData.attack += item.attack;
    } else if (category === "armor") {
      userData.equipment.armor = item.name;
      userData.defense += item.defense;
    } else if (category === "spells") {
      userData.equipment.spell = item.name;
    }
    
    await sendSuccessReact();
    await sendText(`Você comprou ${item.name} por ${item.price} golds!\nO item foi equipado automaticamente.`);
    updateRankings();
  },

  // Comandos especiais para Don de La Bragança
  name: "adminrpg",
  description: "Comandos administrativos do RPG (apenas para Don de La Bragança)",
  commands: ["resetmundial", "darxp", "dargold", "banirdeuses"],
  usage: `${PREFIX}resetmundial\n${PREFIX}darxp @usuario 9999\n${PREFIX}dargold @usuario 9999\n${PREFIX}banirdeuses @usuario`,
  handle: async ({
    args,
    userJid,
    sendText,
    sendErrorReply,
    sendSuccessReact
  }) => {
    const specialChar = checkSpecialCharacter(userJid);
    
    if (!specialChar || !specialChar.adminCommands) {
      await sendErrorReply("Você não tem permissão para usar este comando!");
      return;
    }
    
    const command = args[0]?.toLowerCase();
    
    switch (command) {
      case "resetmundial":
        // Resetar todo o RPG
        RPG_DB.users = {};
        initializeMonsters();
        initializeShop();
        RPG_DB.rankings = { gold: [], xp: [] };
        
        await sendText("O mundo RPG foi reiniciado completamente!");
        break;
        
      case "darxp":
        if (args.length < 3) {
          await sendErrorReply("Uso: !darxp @usuario quantidade");
          return;
        }
        
        const xpTargetJid = toUserJid(args[1]);
        if (!xpTargetJid) {
          await sendErrorReply("Usuário inválido!");
          return;
        }
        
        const xpAmount = parseInt(args[2]);
        if (isNaN(xpAmount) {
          await sendErrorReply("Quantidade de XP inválida!");
          return;
        }
        
        const xpTargetData = getUserRPGData(xpTargetJid);
        xpTargetData.xp += xpAmount;
        
        // Atualizar nível se necessário
        const newLevel = calculateLevel(xpTargetData.xp);
        if (newLevel > xpTargetData.level) {
          xpTargetData.level = newLevel;
          xpTargetData.maxHealth += 10;
          xpTargetData.health = xpTargetData.maxHealth;
          xpTargetData.maxMana += 5;
          xpTargetData.mana = xpTargetData.maxMana;
          xpTargetData.attack += 2;
          xpTargetData.defense += 1;
        }
        
        await sendText(`Você deu ${xpAmount} XP para @${xpTargetJid.split("@")[0]}!`);
        updateRankings();
        break;
        
      case "dargold":
        if (args.length < 3) {
          await sendErrorReply("Uso: !dargold @usuario quantidade");
          return;
        }
        
        const goldTargetJid = toUserJid(args[1]);
        if (!goldTargetJid) {
          await sendErrorReply("Usuário inválido!");
          return;
        }
        
        const goldAmount = parseInt(args[2]);
        if (isNaN(goldAmount)) {
          await sendErrorReply("Quantidade de gold inválida!");
          return;
        }
        
        const goldTargetData = getUserRPGData(goldTargetJid);
        goldTargetData.gold += goldAmount;
        
        await sendText(`Você deu ${goldAmount} golds para @${goldTargetJid.split("@")[0]}!`);
        updateRankings();
        break;
        
      case "banirdeuses":
        if (args.length < 2) {
          await sendErrorReply("Uso: !banirdeuses @usuario");
          return;
        }
        
        const banTargetJid = toUserJid(args[1]);
        if (!banTargetJid) {
          await sendErrorReply("Usuário inválido!");
          return;
        }
        
        if (RPG_DB.specialCharacters[banTargetJid]) {
          // Temporariamente remover poderes (por 1 hora)
          const tempBan = { ...RPG_DB.specialCharacters[banTargetJid], bannedUntil: Date.now() + 3600000 };
          RPG_DB.specialCharacters[banTargetJid] = tempBan;
          
          await sendText(`@${banTargetJid.split("@")[0]} foi temporariamente banido dos poderes divinos por 1 hora!`);
        } else {
          await sendErrorReply("Este usuário não é um deus para ser banido!");
        }
        break;
        
      default:
        await sendErrorReply("Comando administrativo inválido!");
    }
    
    await sendSuccessReact();
  },

  // Comando para listar monstros
  name: "monstros",
  description: "Lista todos os monstros disponíveis",
  commands: ["monstros", "monsters"],
  usage: `${PREFIX}monstros`,
  handle: async ({ sendText }) => {
    let monstersList = "╔══════════════════════════════════╗\n║          ◈ MONSTROS ◈          ║\n╠══════════╦══════╦══════╦═══════╣\n";
    monstersList += "║ Nome     ║ Nv.  ║ Saúde║ Recomp.║\n";
    monstersList += "╠══════════╬══════╬══════╬═══════╣\n";
    
    for (const [id, monster] of Object.entries(RPG_DB.monsters)) {
      monstersList += `║ ${monster.name.padEnd(8)}║ ${monster.level.toString().padEnd(4)}║ ${monster.health.toString().padEnd(4)}║ ${monster.goldReward.toString().padEnd(5)}║\n`;
    }
    
    monstersList += "╚══════════╩══════╩══════╩═══════╝\n";
    monstersList += "Use !cacar [monstro] para caçar um monstro específico.";
    
    await sendText(monstersList);
  }
};
