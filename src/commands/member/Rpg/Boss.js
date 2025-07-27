// boss.js
const { PREFIX, RPG_DB, BattleSystem } = require(`${BASE_DIR}/rpg-system`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "boss",
  description: "Participe de batalhas contra chefes poderosos",
  commands: ["boss", "chefe"],
  usage: `${PREFIX}boss [entrar/atacar]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, args }) => {
    const userNumber = onlyNumbers(userJid);
    const action = args[0]?.toLowerCase();

    if (!RPG_DB.users[userNumber]) {
      RPG_DB.users[userNumber] = createNewUser(userNumber);
    }

    const user = RPG_DB.users[userNumber];

    // Verificar se há um chefe ativo
    if (!RPG_DB.events.activeBoss) {
      await sendReply("Não há nenhum chefe ativo no momento. Continue explorando para encontrar um!");
      return;
    }

    const boss = RPG_DB.events.activeBoss;

    if (!action || action === 'status') {
      // Mostrar status do chefe
      await sendReply(getBossStatus(boss));
      return;
    }

    if (action === 'entrar') {
      // Entrar na batalha
      if (boss.participants.includes(userNumber)) {
        await sendReply("Você já está nesta batalha!");
        return;
      }

      boss.participants.push(userNumber);
      await sendReply(`Você entrou na batalha contra ${boss.name}! Use !boss atacar para ajudar a derrotá-lo.`);
      return;
    }

    if (action === 'atacar') {
      // Atacar o chefe
      if (!boss.participants.includes(userNumber)) {
        await sendReply("Você precisa entrar na batalha primeiro com !boss entrar");
        return;
      }

      if (boss.currentHp <= 0) {
        await sendReply("Este chefe já foi derrotado!");
        return;
      }

      const damage = BattleSystem.calculateDamage(user, boss);
      boss.currentHp -= damage;

      let result = `
╔════════════════════════════╗
║   ≡≡≡ ATAQUE AO CHEFE ≡≡≡  ║
╚════════════════════════════╝

✦ Você causou ${damage} de dano em ${boss.name}!
✦ HP restante: ${Math.max(0, boss.currentHp)}/${boss.hp}
`;

      // Verificar se o chefe foi derrotado
      if (boss.currentHp <= 0) {
        const rewards = calculateBossRewards(boss, boss.participants);
        
        // Distribuir recompensas
        boss.participants.forEach(participant => {
          if (RPG_DB.users[participant]) {
            RPG_DB.users[participant].xp += rewards.xp;
            RPG_DB.users[participant].gold += rewards.gold;
            RPG_DB.users[participant].bossesDefeated = (RPG_DB.users[participant].bossesDefeated || 0) + 1;
            
            // Chance de drop especial
            if (Math.random() < 0.1) { // 10% de chance
              const specialItem = boss.loot.find(i => Math.random() < i.chance);
              if (specialItem) {
                RPG_DB.users[participant].inventory.push(specialItem.name);
                result += `\n✦ @${participant} recebeu ${specialItem.name}!\n`;
              }
            }
          }
        });
        
        result += `
╔════════════════════════════╗
║   ≡≡≡ CHEFE DERROTADO ≡≡≡  ║
╚════════════════════════════╝

✦ Recompensas para todos os participantes:
✧ XP: +${rewards.xp}
✧ Gold: +${rewards.gold}

Parabéns aos heróis que derrotaram ${boss.name}!
`;
        
        // Limpar chefe derrotado
        delete RPG_DB.events.activeBoss;
      } else {
        // Contra-ataque do chefe
        const targetIndex = Math.floor(Math.random() * boss.participants.length);
        const targetNumber = boss.participants[targetIndex];
        const target = RPG_DB.users[targetNumber];
        
        if (target) {
          const bossDamage = BattleSystem.calculateDamage(boss, target);
          target.hp = Math.max(1, target.hp - bossDamage);
          
          result += `
✦ ${boss.name} contra-atacou @${targetNumber}!
✦ Dano causado: ${bossDamage}
✦ HP restante de @${targetNumber}: ${target.hp}/${target.maxHp}
`;
        }
      }

      await sendReply(result);
      updateRankings();
      return;
    }

    throw new InvalidParameterError("Ação inválida! Use entrar, atacar ou status");
  },
};

function getBossStatus(boss) {
  return `
╔════════════════════════════╗
║   ≡≡≡ ${boss.name.toUpperCase()} ≡≡≡   ║
╚════════════════════════════╝

✦ HP: ${boss.currentHp}/${boss.hp} (${Math.floor((boss.currentHp / boss.hp) * 100)}%)
✦ Participantes: ${boss.participants.length}
✦ Dificuldade: ${boss.isBoss ? '☆☆☆☆☆' : '☆☆☆'}

Use !boss entrar para juntar-se à batalha!
Use !boss atacar para ajudar a derrotá-lo!
`;
}

function calculateBossRewards(boss, participants) {
  const baseXP = boss.xp * 2;
  const baseGold = boss.gold[1] * 3;
  
  return {
    xp: Math.floor(baseXP / participants.length),
    gold: Math.floor(baseGold / participants.length)
  };
}
