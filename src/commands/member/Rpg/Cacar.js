// cacar.js
const { PREFIX, RPG_DB, BattleSystem, EconomySystem } = require(`${BASE_DIR}/rpg-system`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "cacar",
  description: "Explora o mundo em busca de monstros, tesouros e aventuras",
  commands: ["cacar", "hunt", "explorar"],
  usage: `${PREFIX}cacar [local]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, args }) => {
    const userNumber = onlyNumbers(userJid);
    
    if (!RPG_DB.users[userNumber]) {
      RPG_DB.users[userNumber] = createNewUser(userNumber);
    }

    const user = RPG_DB.users[userNumber];
    const location = args[0]?.toLowerCase() || 'floresta'; // Locais possíveis: floresta, caverna, montanha, etc.
    
    // Verificar se há um chefe ativo
    if (RPG_DB.events.activeBoss && !RPG_DB.events.activeBoss.participants.includes(userNumber)) {
      await sendReply(`
╔════════════════════════════╗
║   ≡≡≡ CHEFE ENCONTRADO ≡≡≡ ║
╚════════════════════════════╝

Um ${RPG_DB.events.activeBoss.name} apareceu no mundo!
Use !boss para juntar-se à batalha contra esta ameaça.
`);
      return;
    }

    // Determinar encontro com base no local e nível
    const encounter = generateEncounter(user.level, location);
    let result = `
╔════════════════════════════╗
║   ≡≡≡ ${location.toUpperCase()} ≡≡≡   ║
╚════════════════════════════╝
`;

    if (encounter.type === 'monster') {
      const monster = RPG_DB.monsters[encounter.monster];
      const battleResult = BattleSystem.monsterBattle(user, monster);
      
      result += `
✦ Encontrou: ${monster.name} ${monster.isElite ? '☆' : ''}
✦ Dano causado: ${battleResult.userDamage}
✦ Dano recebido: ${battleResult.monsterDamage}
✦ HP restante: ${user.hp}/${user.maxHp}
`;

      if (battleResult.win) {
        const rewards = EconomySystem.calculateMonsterRewards(monster, user.level);
        user.xp += rewards.xp;
        user.gold += rewards.gold;
        user.monstersDefeated++;
        
        result += `
✦ Vitória! Recompensas:
✧ XP: +${rewards.xp}
✧ Gold: +${rewards.gold}
`;

        // Drop de itens
        if (battleResult.droppedItem) {
          user.inventory.push(battleResult.droppedItem);
          result += `✧ Item: ${battleResult.droppedItem}\n`;
        }

        // Verificar level up
        while (user.xp >= calculateNextLevelXP(user.level)) {
          user.levelUp();
          result += `\n✦ LEVEL UP! Agora você é nível ${user.level}!\n`;
        }
      } else {
        result += `
✦ Derrota! Você fugiu do ${monster.name}.
✦ Gold perdido: ${battleResult.lostGold}
`;
      }
    } else if (encounter.type === 'treasure') {
      const goldFound = Math.floor(user.level * (10 + Math.random() * 20));
      user.gold += goldFound;
      
      result += `
✦ Você encontrou um tesouro!
✦ Gold: +${goldFound}
`;
    } else if (encounter.type === 'nothing') {
      result += `
✦ Nada de interessante encontrado...
✦ Tente explorar novamente!
`;
    }

    // Verificar progresso de missões
    checkQuestProgress(userNumber, encounter);

    await sendReply(result);
    updateRankings();
  },
};

function generateEncounter(playerLevel, location) {
  const roll = Math.random();
  
  // Chance de encontro baseada no local
  const encounterChance = {
    floresta: 0.7,
    caverna: 0.8,
    montanha: 0.9
  }[location] || 0.7;

  if (roll < encounterChance) {
    // Encontro com monstro
    const monsterPool = getMonstersForLocationAndLevel(location, playerLevel);
    const monsterType = weightedRandom(monsterPool);
    
    return {
      type: 'monster',
      monster: monsterType
    };
  } else if (roll < encounterChance + 0.15) {
    // Tesouro
    return { type: 'treasure' };
  } else {
    // Nada
    return { type: 'nothing' };
  }
}

function getMonstersForLocationAndLevel(location, level) {
  // Filtra monstros por local e nível do jogador
  const monsters = Object.entries(RPG_DB.monsters)
    .filter(([_, m]) => 
      (!m.requiredLocation || m.requiredLocation === location) &&
      (!m.minLevel || level >= m.minLevel)
    )
    .reduce((acc, [key, m]) => {
      acc[key] = m.isBoss ? 0.01 : (m.isElite ? 0.2 : 1);
      return acc;
    }, {});
  
  return monsters;
}

function weightedRandom(items) {
  const pool = [];
  for (const [item, weight] of Object.entries(items)) {
    for (let i = 0; i < weight * 100; i++) {
      pool.push(item);
    }
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function checkQuestProgress(userNumber, encounter) {
  const user = RPG_DB.users[userNumber];
  if (!user.activeQuests) return;

  user.activeQuests.forEach(quest => {
    if (quest.type === 'monster' && encounter.type === 'monster' && 
        quest.monster === encounter.monster) {
      quest.progress++;
      
      if (quest.progress >= quest.required) {
        // Missão completa
        completeQuest(userNumber, quest.id);
      }
    }
  });
}
