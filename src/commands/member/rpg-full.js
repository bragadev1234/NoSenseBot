// rpg-system.js
const { PREFIX, BASE_DIR } = require(`${BASE_DIR}/config`);
const fs = require('fs');
const path = require('path');
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, PermissionError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

// =============================================
// 🏰 ESTRUTURA PRINCIPAL DO RPG
// =============================================

const RPG_DB = {
  users: {},
  monsters: {},
  shop: {},
  rankings: {
    gold: [],
    xp: []
  },
  specialCharacters: {
    '553597816349': { // Rainha Feiticeira Lavs
      title: '𓋼𓍊 Deusa Suprema / Rainha Eterna 𓍊𓋼',
      weapon: 'Espada Astoria',
      powers: [
        '✧ Dano Infinito',
        '✧ Corta qualquer coisa',
        '✧ Queima almas eternamente',
        '✧ Transcende o universo humano'
      ],
      goldPerHour: 1000000,
      immunity: true
    },
    '5519981889986': { // Escriba Suprema Dany
      title: '𓋼𓍊 Escriba Suprema da Deusa Lavs 𓍊𓋼',
      weapon: 'Cajado Instropecto La Varum Chtuvhulo',
      powers: [
        '✧ Poderes transcendentes da espada de Lavs',
        '✧ Manipulação da realidade'
      ],
      goldPerHour: 1000000,
      immunity: true
    },
    '5521985886256': { // Magnata Maligno
      title: '𓋼𓍊 Magnata das Sombras 𓍊𓋼',
      goldPerHour: 1000000,
      immunity: true
    },
    '559984271816': { // Don de La Bragança
      title: '𓋼𓍊✧ Divindade Suprema ✧𓍊𓋼',
      isAdmin: true,
      absolutePower: true
    }
  },
  worldResetInterval: 3600000 // 1 hora
};

// =============================================
// 🛠️ FUNÇÕES AUXILIARES
// =============================================

function createNewUser(userJid) {
  return {
    level: 1,
    xp: 0,
    gold: 100,
    hp: 100,
    maxHp: 100,
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
      losses: 0
    },
    lastHunt: 0,
    cooldowns: {}
  };
}

function loadMonsters() {
  RPG_DB.monsters = {
    slime: {
      name: 'Slime Negro',
      hp: 50,
      attack: 5,
      defense: 2,
      xp: 10,
      gold: 5,
      loot: ['Poção de Cura', 'Núcleo de Slime'],
      art: `
      .     .★*.
    　. 　 .　　　.
  　 *　　 　ﾟ*｡.･｡
  　　　 *　 ﾟ･｡ * ﾟ｡
  　　　　･　　*ﾟ｡　　 *
  　 ﾟ　　　.　 ｡･｡ 　 　 　 *
  　　　 *　　ﾟ　｡･｡･　　ﾟ。
  `
    },
    goblin: {
      name: 'Goblin das Sombras',
      hp: 80,
      attack: 12,
      defense: 5,
      xp: 25,
      gold: 15,
      loot: ['Adaga Afiada', 'Armadura de Couro'],
      art: `
        ,      ,
       /(.____.)\\
       \\) __ (//
       //    \\\\
      ((      ))
       \\\\    //
        \\)__(/
      `
    },
    dragon: {
      name: 'Dragão da Perdição',
      hp: 500,
      attack: 50,
      defense: 30,
      xp: 200,
      gold: 1000,
      loot: ['Escama de Dragão', 'Espada do Dragão'],
      art: `
            ___
          /   \\\\
    .-.  |     |  .-.
    |@|  |/   \\|  |@|
   /   \\        /   \\
   |   /\\____/\\   |
   \\_/            \\_/
      `
    }
  };
}

function loadShopItems() {
  RPG_DB.shop = {
    weapons: [
      { name: 'Espada de Madeira', price: 50, attack: 5, type: 'weapon' },
      { name: 'Espada de Ferro', price: 200, attack: 15, type: 'weapon' },
      { name: 'Espada de Aço', price: 500, attack: 30, type: 'weapon' },
      { name: 'Espada de Diamante', price: 2000, attack: 60, type: 'weapon' },
      { name: 'Espada Astral', price: 5000, attack: 100, type: 'weapon', special: true }
    ],
    armor: [
      { name: 'Armadura de Couro', price: 100, defense: 5, type: 'armor' },
      { name: 'Armadura de Ferro', price: 400, defense: 15, type: 'armor' },
      { name: 'Armadura de Aço', price: 1000, defense: 30, type: 'armor' },
      { name: 'Armadura de Dragão', price: 5000, defense: 60, type: 'armor' },
      { name: 'Armadura Celestial', price: 8000, defense: 100, type: 'armor', special: true }
    ],
    spells: [
      { name: 'Bola de Fogo', price: 300, damage: 20, mana: 10, type: 'spell' },
      { name: 'Raio de Gelo', price: 500, damage: 30, mana: 15, type: 'spell' },
      { name: 'Tempestade', price: 1000, damage: 50, mana: 30, type: 'spell' },
      { name: 'Meteoro', price: 3000, damage: 100, mana: 50, type: 'spell', special: true }
    ],
    potions: [
      { name: 'Poção de Cura', price: 50, hp: 30, type: 'potion' },
      { name: 'Poção de Mana', price: 50, mana: 20, type: 'potion' },
      { name: 'Poção da Força', price: 150, attack: 10, duration: 3600, type: 'potion' }
    ]
  };
}

function updateRankings() {
  RPG_DB.rankings.gold = Object.entries(RPG_DB.users)
    .sort((a, b) => b[1].gold - a[1].gold)
    .slice(0, 10);
  
  RPG_DB.rankings.xp = Object.entries(RPG_DB.users)
    .sort((a, b) => (b[1].level * 1000 + b[1].xp) - (a[1].level * 1000 + a[1].xp))
    .slice(0, 10);
}

function formatBattleArt(attacker, defender, damage) {
  return `
╔════════════════════════════╗
║        ⚔️ BATALHA ⚔️        ║
╠════════════════════════════╣
║                            ║
║  (ง •̀_•́)ง ${attacker}       ║
║                            ║
║       ====> 💥 ${damage}     ║
║                            ║
║  (ಠ_ಠ) ${defender}          ║
║                            ║
╚════════════════════════════╝
`;
}

function getLevelProgressBar(currentXP, level) {
  const xpNeeded = level * 100;
  const progress = Math.min(100, Math.floor((currentXP / xpNeeded) * 100);
  const filled = '█'.repeat(Math.floor(progress / 5));
  const empty = '░'.repeat(20 - Math.floor(progress / 5));
  return `[${filled}${empty}] ${progress}%`;
}

// =============================================
// ⚙️ INICIALIZAÇÃO DO SISTEMA
// =============================================

function initRPGSystem() {
  loadMonsters();
  loadShopItems();
  startGoldDistribution();
  startAutoReset();
  console.log('Sistema RPG inicializado com sucesso!');
}

function startGoldDistribution() {
  setInterval(() => {
    for (const [number, char] of Object.entries(RPG_DB.specialCharacters)) {
      if (char.goldPerHour) {
        if (!RPG_DB.users[number]) {
          RPG_DB.users[number] = createNewUser(number);
        }
        RPG_DB.users[number].gold += char.goldPerHour;
      }
    }
  }, 3600000); // A cada hora
}

function startAutoReset() {
  setInterval(() => {
    RPG_DB.users = {};
    RPG_DB.rankings = { gold: [], xp: [] };
    console.log('⏳ Mundo RPG foi resetado automaticamente');
  }, RPG_DB.worldResetInterval);
}

// =============================================
// 🎮 COMANDOS RPG
// =============================================

async function handlePerfilRPG({ sendReply, userJid, replyJid, args, isReply }) {
  const targetJid = isReply ? replyJid : args.length ? toUserJid(args[0]) : userJid;
  const userNumber = onlyNumbers(targetJid);

  if (!RPG_DB.users[userNumber]) {
    RPG_DB.users[userNumber] = createNewUser(userNumber);
  }

  const user = RPG_DB.users[userNumber];
  const specialChar = RPG_DB.specialCharacters[userNumber];
  
  let profile = `
╔════════════════════════════╗
║       𓋼𓍊 PERFIL RPG 𓍊𓋼      ║
╠════════════════════════════╣
`;

  if (specialChar) {
    profile += `
║  ✧ ${specialChar.title} ✧      ║
╠════════════════════════════╣
`;
  }

  profile += `
║ ✦ Nível: ${user.level}                ║
║ ✦ Progresso: ${getLevelProgressBar(user.xp, user.level)}
║ ✦ Gold: ${user.gold}                 ║
║ ✦ HP: ${user.hp}/${user.maxHp}       ║
║ ✦ Mana: ${user.mana}/${user.maxMana} ║
║ ✦ Ataque: ${user.attack + (user.equipment.weapon ? user.equipment.weapon.attack : 0)}
║ ✦ Defesa: ${user.defense + (user.equipment.armor ? user.equipment.armor.defense : 0)}
╠════════════════════════════╣
║       𓋼𓍊 EQUIPAMENTO 𓍊𓋼      ║
╠════════════════════════════╣
║ ✦ Arma: ${user.equipment.weapon ? user.equipment.weapon.name : 'Nenhuma'}
║ ✦ Armadura: ${user.equipment.armor ? user.equipment.armor.name : 'Nenhuma'}
║ ✦ Magia: ${user.equipment.spell ? user.equipment.spell.name : 'Nenhuma'}
╠════════════════════════════╣
║        𓋼𓍊 BATALHAS 𓍊𓋼       ║
╠════════════════════════════╣
║ ✦ Vitórias: ${user.battles.wins}     ║
║ ✦ Derrotas: ${user.battles.losses}   ║
╚════════════════════════════╝
`;

  await sendReply(profile);
}

async function handlePVP({ sendReply, userJid, replyJid, args, isReply }) {
  if (!args.length && !isReply) {
    throw new InvalidParameterError("Você precisa mencionar um jogador para batalhar!");
  }

  const attackerJid = userJid;
  const defenderJid = isReply ? replyJid : toUserJid(args[0]);
  
  const attackerNumber = onlyNumbers(attackerJid);
  const defenderNumber = onlyNumbers(defenderJid);

  if (attackerNumber === defenderNumber) {
    await sendReply("Você não pode batalhar contra si mesmo!");
    return;
  }

  // Inicializar jogadores se não existirem
  if (!RPG_DB.users[attackerNumber]) RPG_DB.users[attackerNumber] = createNewUser(attackerNumber);
  if (!RPG_DB.users[defenderNumber]) RPG_DB.users[defenderNumber] = createNewUser(defenderNumber);

  const attacker = RPG_DB.users[attackerNumber];
  const defender = RPG_DB.users[defenderNumber];

  // Verificar se é um personagem especial
  const specialDefender = RPG_DB.specialCharacters[defenderNumber];
  if (specialDefender && specialDefender.immunity) {
    await sendReply(`
╔════════════════════════════╗
║    ⚠️ BATALHA IMPOSSÍVEL ⚠️   ║
╠════════════════════════════╣
║                            ║
║ Você ousou desafiar        ║
║ ${specialDefender.title}!
║                            ║
║ Sua existência foi         ║
║ obliterada por poderes     ║
║ além da compreensão mortal.║
║                            ║
╠════════════════════════════╣
║ ✦ Resultado: Derrota       ║
║ ✦ Gold perdido: ${Math.floor(attacker.gold * 0.5)}
╚════════════════════════════╝
`);
    attacker.gold = Math.floor(attacker.gold * 0.5);
    attacker.battles.losses++;
    return;
  }

  // Calcular stats com equipamentos
  const attackerAttack = attacker.attack + (attacker.equipment.weapon ? attacker.equipment.weapon.attack : 0);
  const attackerDefense = attacker.defense + (attacker.equipment.armor ? attacker.equipment.armor.defense : 0);
  
  const defenderAttack = defender.attack + (defender.equipment.weapon ? defender.equipment.weapon.attack : 0);
  const defenderDefense = defender.defense + (defender.equipment.armor ? defender.equipment.armor.defense : 0);

  // Simular batalha
  let battleLog = `
╔════════════════════════════╗
║      ⚔️ BATALHA PvP ⚔️      ║
╠════════════════════════════╣
║ ✦ Desafiante: @${attackerNumber}
║ ✦ Desafiado: @${defenderNumber}
╠════════════════════════════╣
`;

  const attackerRoll = Math.random() * (attackerAttack / 2) + (attackerAttack / 2);
  const defenderRoll = Math.random() * (defenderAttack / 2) + (defenderAttack / 2);

  const attackerDamage = Math.max(1, Math.floor(attackerRoll - (defenderDefense / 2)));
  const defenderDamage = Math.max(1, Math.floor(defenderRoll - (attackerDefense / 2)));

  // Adicionar arte da batalha
  battleLog += formatBattleArt(
    `@${attackerNumber.slice(-4)}`,
    `@${defenderNumber.slice(-4)}`,
    attackerDamage > defenderDamage ? attackerDamage : defenderDamage
  );

  // Determinar vencedor
  if (attackerDamage > defenderDamage) {
    const goldWon = Math.floor(defender.gold * 0.2);
    attacker.gold += goldWon;
    defender.gold -= goldWon;
    attacker.battles.wins++;
    defender.battles.losses++;
    
    battleLog += `
╠════════════════════════════╣
║       ✧ VITÓRIA ✧         ║
╠════════════════════════════╣
║ ✦ Vencedor: @${attackerNumber}
║ ✦ Dano causado: ${attackerDamage}
║ ✦ Gold ganho: ${goldWon}
╚════════════════════════════╝
`;
  } else {
    const goldLost = Math.floor(attacker.gold * 0.2);
    defender.gold += goldLost;
    attacker.gold -= goldLost;
    defender.battles.wins++;
    attacker.battles.losses++;
    
    battleLog += `
╠════════════════════════════╣
║        ✧ DERROTA ✧        ║
╠════════════════════════════╣
║ ✦ Vencedor: @${defenderNumber}
║ ✦ Dano recebido: ${defenderDamage}
║ ✦ Gold perdido: ${goldLost}
╚════════════════════════════╝
`;
  }

  await sendReply(battleLog);
  updateRankings();
}

async function handleLoja({ sendReply, args }) {
  const category = args[0]?.toLowerCase();
  
  let shopItems = `
╔════════════════════════════╗
║       𓋼𓍊 LOJA RPG 𓍊𓋼       ║
╠════════════════════════════╣
`;

  if (!category || category === 'armas') {
    shopItems += `
║        ✧ ARMAS ✧          ║
╠════════════════════════════╣
`;
    RPG_DB.shop.weapons.forEach(item => {
      shopItems += `║ ✦ ${item.name} - ⚔️+${item.attack} - 💰${item.price}\n`;
    });
  }

  if (!category || category === 'armaduras') {
    shopItems += `
║       ✧ ARMADURAS ✧       ║
╠════════════════════════════╣
`;
    RPG_DB.shop.armor.forEach(item => {
      shopItems += `║ ✦ ${item.name} - 🛡️+${item.defense} - 💰${item.price}\n`;
    });
  }

  if (!category || category === 'magias') {
    shopItems += `
║        ✧ MAGIAS ✧         ║
╠════════════════════════════╣
`;
    RPG_DB.shop.spells.forEach(item => {
      shopItems += `║ ✦ ${item.name} - 🔥${item.damage} (✨${item.mana}) - 💰${item.price}\n`;
    });
  }

  if (!category || category === 'pocoes') {
    shopItems += `
║       ✧ POÇÕES ✧         ║
╠════════════════════════════╣
`;
    RPG_DB.shop.potions.forEach(item => {
      if (item.hp) {
        shopItems += `║ ✦ ${item.name} - ❤️+${item.hp} - 💰${item.price}\n`;
      } else if (item.mana) {
        shopItems += `║ ✦ ${item.name} - ✨+${item.mana} - 💰${item.price}\n`;
      } else if (item.attack) {
        shopItems += `║ ✦ ${item.name} - ⚔️+${item.attack} (${item.duration/60}min) - 💰${item.price}\n`;
      }
    });
  }

  shopItems += `
╠════════════════════════════╣
║ Use ${PREFIX}comprar <item>  ║
║ para adquirir um item.     ║
╚════════════════════════════╝
`;

  await sendReply(shopItems);
}

async function handleComprar({ sendReply, userJid, fullArgs }) {
  const itemName = fullArgs.toLowerCase();
  const userNumber = onlyNumbers(userJid);
  
  if (!RPG_DB.users[userNumber]) {
    RPG_DB.users[userNumber] = createNewUser(userNumber);
  }

  const user = RPG_DB.users[userNumber];
  
  // Procurar item em todas as categorias
  let item = null;
  let category = null;
  
  for (const cat of ['weapons', 'armor', 'spells', 'potions']) {
    const foundItem = RPG_DB.shop[cat].find(i => i.name.toLowerCase() === itemName);
    if (foundItem) {
      item = foundItem;
      category = cat;
      break;
    }
  }

  if (!item) {
    throw new InvalidParameterError("Item não encontrado na loja!");
  }

  if (user.gold < item.price) {
    await sendReply(`
╔════════════════════════════╗
║      ✧ FALHA ✧            ║
╠════════════════════════════╣
║ Você não tem gold suficiente!
║ Necessário: ${item.price} gold
║ Você tem: ${user.gold} gold
╚════════════════════════════╝
`);
    return;
  }

  // Comprar item
  user.gold -= item.price;
  
  if (category === 'weapons') {
    user.equipment.weapon = item;
  } else if (category === 'armor') {
    user.equipment.armor = item;
  } else if (category === 'spells') {
    user.equipment.spell = item;
  } else if (category === 'potions') {
    user.inventory.push(item);
  }

  await sendReply(`
╔════════════════════════════╗
║     ✧ COMPRA REALIZADA ✧   ║
╠════════════════════════════╣
║ ✦ Item: ${item.name}       ║
║ ✦ Preço: ${item.price} gold║
║ ✦ Gold restante: ${user.gold}
╠════════════════════════════╣
║ ${category !== 'potions' ? 'Item equipado automaticamente!' : 'Item adicionado ao inventário!'}
╚════════════════════════════╝
`);
}

async function handleRank({ sendReply, args }) {
  const type = args[0]?.toLowerCase() || 'gold';
  
  let ranking = `
╔════════════════════════════╗
║      𓋼𓍊 RANKING 𓍊𓋼       ║
╠════════════════════════════╣
`;

  if (type === 'gold') {
    ranking += `
║       ✧ TOP 10 GOLD ✧      ║
╠════════════════════════════╣
`;
    RPG_DB.rankings.gold.forEach(([user, data], index) => {
      ranking += `║ ${index + 1}. @${user.slice(-4)} - 💰${data.gold}\n`;
    });
  } else if (type === 'xp') {
    ranking += `
║      ✧ TOP 10 LEVEL ✧      ║
╠════════════════════════════╣
`;
    RPG_DB.rankings.xp.forEach(([user, data], index) => {
      ranking += `║ ${index + 1}. @${user.slice(-4)} - レベル${data.level} (${data.xp} XP)\n`;
    });
  } else {
    throw new InvalidParameterError("Tipo de ranking inválido! Use 'gold' ou 'xp'");
  }

  ranking += `
╠════════════════════════════╣
║   Use ${PREFIX}rank gold/xp   ║
║   para ver rankings        ║
╚════════════════════════════╝
`;

  await sendReply(ranking);
}

async function handleCacar({ sendReply, userJid }) {
  const userNumber = onlyNumbers(userJid);
  
  if (!RPG_DB.users[userNumber]) {
    RPG_DB.users[userNumber] = createNewUser(userNumber);
  }

  const user = RPG_DB.users[userNumber];
  
  // Verificar cooldown
  const now = Date.now();
  if (now - user.lastHunt < 30000) { // 30 segundos de cooldown
    const remaining = Math.ceil((30000 - (now - user.lastHunt)) / 1000);
    await sendReply(`
╔════════════════════════════╗
║       ✧ AGUARDE ✧         ║
╠════════════════════════════╣
║ Você precisa esperar ${remaining}s
║ antes de caçar novamente!  ║
╚════════════════════════════╝
`);
    return;
  }

  user.lastHunt = now;
  
  // Determinar monstro com base no nível do jogador
  let monsterPool = [];
  if (user.level < 5) {
    monsterPool = ['slime'];
  } else if (user.level < 10) {
    monsterPool = ['slime', 'goblin'];
  } else {
    monsterPool = ['slime', 'goblin', 'dragon'];
  }

  const monsterType = monsterPool[Math.floor(Math.random() * monsterPool.length)];
  const monster = RPG_DB.monsters[monsterType];

  // Simular batalha
  const userAttack = user.attack + (user.equipment.weapon ? user.equipment.weapon.attack : 0);
  const userDefense = user.defense + (user.equipment.armor ? user.equipment.armor.defense : 0);
  
  const monsterDamage = Math.max(1, Math.floor(monster.attack - (userDefense / 2)));
  const userDamage = Math.max(1, Math.floor(userAttack - (monster.defense / 2)));

  // Determinar resultado
  let result = `
╔════════════════════════════╗
║   ENCONTROU UM MONSTRO!    ║
╠════════════════════════════╣
${monster.art}
╠════════════════════════════╣
║ ✦ ${monster.name.toUpperCase()}
╠════════════════════════════╣
`;

  if (userDamage >= monster.hp) {
    // Vitória
    const xpGained = monster.xp;
    const goldGained = monster.gold;
    
    user.xp += xpGained;
    user.gold += goldGained;
    user.hp = Math.max(1, user.hp - Math.floor(monsterDamage / 2));
    
    // Verificar level up
    let levelUpMsg = '';
    while (user.xp >= user.level * 100) {
      user.xp -= user.level * 100;
      user.level++;
      user.maxHp += 10;
      user.hp = user.maxHp;
      user.maxMana += 5;
      user.mana = user.maxMana;
      user.attack += 2;
      user.defense += 1;
      levelUpMsg += `\n║ ✦ LEVEL UP! Agora você é nível ${user.level}!`;
    }

    // Chance de loot
    let lootMsg = '';
    if (Math.random() < 0.3) { // 30% de chance de loot
      const loot = monster.loot[Math.floor(Math.random() * monster.loot.length)];
      user.inventory.push(loot);
      lootMsg = `\n║ ✦ Você encontrou: ${loot}!`;
    }

    result += `
║ ✦ Você derrotou o ${monster.name}!
║ ✦ Dano causado: ${userDamage}
║ ✦ Dano recebido: ${Math.floor(monsterDamage / 2)}
║ ✦ XP ganho: ${xpGained}
║ ✦ Gold ganho: ${goldGained}${levelUpMsg}${lootMsg}
╚════════════════════════════╝
`;
  } else {
    // Derrota
    user.hp = Math.max(1, user.hp - monsterDamage);
    result += `
║ ✦ Você foi derrotado pelo ${monster.name}!
║ ✦ Dano causado: ${userDamage}
║ ✦ Dano recebido: ${monsterDamage}
║ ✦ HP restante: ${user.hp}/${user.maxHp}
╠════════════════════════════╣
║ Fuja para viver outro dia! ║
╚════════════════════════════╝
`;
  }

  await sendReply(result);
  updateRankings();
}

async function handleAdminRPG({ sendReply, userJid, args, isReply, replyJid }) {
  const userNumber = onlyNumbers(userJid);
  
  // Verificar se é o Don de La Bragança
  if (!RPG_DB.specialCharacters[userNumber]?.isAdmin) {
    throw new PermissionError("Apenas o Don de La Bragança pode usar esses comandos!");
  }

  const command = args[0]?.toLowerCase();
  
  if (command === 'resetmundial') {
    RPG_DB.users = {};
    RPG_DB.rankings = { gold: [], xp: [] };
    await sendReply(`
╔════════════════════════════╗
║    ✧ MUNDO RESETADO ✧     ║
╠════════════════════════════╣
║ Todos os dados RPG foram   ║
║ reiniciados por ordem      ║
║ divina!                    ║
╚════════════════════════════╝
`);
    return;
  }

  if (command === 'darxp') {
    const targetJid = isReply ? replyJid : toUserJid(args[1]);
    const xpAmount = parseInt(args[2]);
    
    if (!targetJid || isNaN(xpAmount)) {
      throw new InvalidParameterError("Uso correto: !darxp @usuario 9999");
    }

    const targetNumber = onlyNumbers(targetJid);
    if (!RPG_DB.users[targetNumber]) {
      RPG_DB.users[targetNumber] = createNewUser(targetNumber);
    }

    RPG_DB.users[targetNumber].xp += xpAmount;
    // Verificar level up
    while (RPG_DB.users[targetNumber].xp >= RPG_DB.users[targetNumber].level * 100) {
      RPG_DB.users[targetNumber].xp -= RPG_DB.users[targetNumber].level * 100;
      RPG_DB.users[targetNumber].level++;
      RPG_DB.users[targetNumber].maxHp += 10;
      RPG_DB.users[targetNumber].hp = RPG_DB.users[targetNumber].maxHp;
      RPG_DB.users[targetNumber].maxMana += 5;
      RPG_DB.users[targetNumber].mana = RPG_DB.users[targetNumber].maxMana;
      RPG_DB.users[targetNumber].attack += 2;
      RPG_DB.users[targetNumber].defense += 1;
    }

    await sendReply(`
╔════════════════════════════╗
║     ✧ XP CONCEDIDO ✧      ║
╠════════════════════════════╣
║ @${targetNumber} recebeu    ║
║ ${xpAmount} XP!            ║
║ Novo nível: ${RPG_DB.users[targetNumber].level}
╚════════════════════════════╝
`);
    updateRankings();
    return;
  }

  if (command === 'banirdeuses') {
    const targetJid = isReply ? replyJid : toUserJid(args[1]);
    if (!targetJid) {
      throw new InvalidParameterError("Uso correto: !banirdeuses @usuario");
    }

    const targetNumber = onlyNumbers(targetJid);
    if (RPG_DB.specialCharacters[targetNumber]) {
      // Temporariamente remove os poderes (por 1 hora)
      const originalData = { ...RPG_DB.specialCharacters[targetNumber] };
      delete RPG_DB.specialCharacters[targetNumber];
      
      setTimeout(() => {
        RPG_DB.specialCharacters[targetNumber] = originalData;
      }, 3600000);

      await sendReply(`
╔════════════════════════════╗
║    ✧ DEUS BANIDO ✧        ║
╠════════════════════════════╣
║ @${targetNumber} foi        ║
║ temporariamente banido     ║
║ dos poderes divinos por    ║
║ 1 hora!                   ║
╚════════════════════════════╝
`);
    } else {
      await sendReply(`
╔════════════════════════════╗
║     ✧ FALHA ✧             ║
╠════════════════════════════╣
║ Este usuário não é um deus ║
║ para ser banido!           ║
╚════════════════════════════╝
`);
    }
    return;
  }

  throw new InvalidParameterError("Comando de administração inválido!");
}

// =============================================
// 📦 EXPORTAÇÃO DO MÓDULO
// =============================================

module.exports = {
  initRPGSystem,
  RPG_DB,
  commands: {
    perfilrpg: {
      name: "perfilrpg",
      description: "Mostra seu perfil no RPG",
      commands: ["perfilrpg", "rpgperfil"],
      usage: `${PREFIX}perfilrpg [@usuario]`,
      handle: handlePerfilRPG
    },
    pvp: {
      name: "pvp",
      description: "Desafia um jogador para uma batalha PvP",
      commands: ["pvp", "batalha"],
      usage: `${PREFIX}pvp @usuario`,
      handle: handlePVP
    },
    loja: {
      name: "loja",
      description: "Mostra itens disponíveis para compra",
      commands: ["loja", "shop"],
      usage: `${PREFIX}loja [arma/armadura/magia]`,
      handle: handleLoja
    },
    comprar: {
      name: "comprar",
      description: "Compra um item da loja RPG",
      commands: ["comprar", "buy"],
      usage: `${PREFIX}comprar <item>`,
      handle: handleComprar
    },
    rank: {
      name: "rank",
      description: "Mostra o ranking de jogadores",
      commands: ["rank", "ranking"],
      usage: `${PREFIX}rank [gold/xp]`,
      handle: handleRank
    },
    cacar: {
      name: "cacar",
      description: "Caça monstros para ganhar XP e gold",
      commands: ["cacar", "hunt"],
      usage: `${PREFIX}cacar`,
      handle: handleCacar
    },
    adminrpg: {
      name: "adminrpg",
      description: "Comandos de administração do RPG",
      commands: ["resetmundial", "darxp", "banirdeuses"],
      usage: `${PREFIX}resetmundial\n${PREFIX}darxp @usuario 9999\n${PREFIX}banirdeuses @usuario`,
      handle: handleAdminRPG
    }
  }
};
