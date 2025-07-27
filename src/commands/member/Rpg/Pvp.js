// pvp.js
const { PREFIX, RPG_DB, BattleSystem, EconomySystem } = require(`${BASE_DIR}/rpg-system`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "pvp",
  description: "Desafia um jogador para uma batalha PvP com apostas",
  commands: ["pvp", "batalha", "duelo"],
  usage: `${PREFIX}pvp @usuario [aposta]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, replyJid, args, isReply }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError("Você precisa mencionar um jogador para batalhar!");
    }

    const attackerJid = userJid;
    const defenderJid = isReply ? replyJid : toUserJid(args[0]);
    const betAmount = args.length > (isReply ? 0 : 1) ? parseInt(args[isReply ? 0 : 1]) : 0;
    
    const attackerNumber = onlyNumbers(attackerJid);
    const defenderNumber = onlyNumbers(defenderJid);

    if (attackerNumber === defenderNumber) {
      await sendReply("Você não pode batalhar contra si mesmo!");
      return;
    }

    // Inicializar jogadores
    if (!RPG_DB.users[attackerNumber]) RPG_DB.users[attackerNumber] = createNewUser(attackerNumber);
    if (!RPG_DB.users[defenderNumber]) RPG_DB.users[defenderNumber] = createNewUser(defenderNumber);

    const attacker = RPG_DB.users[attackerNumber];
    const defender = RPG_DB.users[defenderNumber];

    // Verificar aposta
    if (betAmount > 0) {
      if (attacker.gold < betAmount) {
        await sendReply(`Você não tem gold suficiente para apostar ${betAmount}!`);
        return;
      }
      if (defender.gold < betAmount) {
        await sendReply(`O alvo não tem gold suficiente para a aposta de ${betAmount}!`);
        return;
      }
    }

    // Verificar personagens especiais
    const specialDefender = RPG_DB.specialCharacters[defenderNumber];
    if (specialDefender && specialDefender.immunity) {
      await sendReply(`
╔════════════════════════════╗
║   ≡≡≡ BATALHA DIVINA ≡≡≡   ║
╚════════════════════════════╝

Você ousou desafiar ${specialDefender.title || 'um ser supremo'}!
Seus ataques não fazem nem cócegas nesta divindade.

✦ Resultado: Derrota inevitável
✦ Gold perdido: ${betAmount || Math.floor(attacker.gold * 0.3)}
✦ Status: Humilhado
`);
      
      if (betAmount > 0) {
        defender.gold += betAmount;
        attacker.gold -= betAmount;
      } else {
        attacker.gold = Math.max(0, attacker.gold - Math.floor(attacker.gold * 0.3));
      }
      
      attacker.battles.losses++;
      defender.battles.wins++;
      updateRankings();
      return;
    }

    // Iniciar batalha
    let battleLog = `
╔════════════════════════════╗
║       ≡≡≡ BATALHA ≡≡≡      ║
║   @${attackerNumber} vs @${defenderNumber}
╚════════════════════════════╝
${betAmount > 0 ? `✦ Aposta: ${betAmount} gold\n` : ''}
`;

    // Rodadas de batalha (melhor de 3)
    let attackerWins = 0;
    let defenderWins = 0;
    const rounds = [];

    for (let round = 1; round <= 3; round++) {
      const attackerDamage = BattleSystem.calculateDamage(attacker, defender);
      const defenderDamage = BattleSystem.calculateDamage(defender, attacker);
      
      rounds.push({
        round,
        attackerDamage,
        defenderDamage
      });

      if (attackerDamage > defenderDamage) {
        attackerWins++;
        battleLog += `✦ Rodada ${round}: @${attackerNumber} vence (${attackerDamage} vs ${defenderDamage})\n`;
      } else {
        defenderWins++;
        battleLog += `✦ Rodada ${round}: @${defenderNumber} vence (${defenderDamage} vs ${attackerDamage})\n`;
      }

      if (attackerWins >= 2 || defenderWins >= 2) break;
    }

    // Resultado final
    if (attackerWins > defenderWins) {
      const rewards = EconomySystem.calculatePvPRewards(attacker, defender);
      const goldWon = betAmount > 0 ? betAmount : rewards.gold;
      
      attacker.gold += goldWon;
      defender.gold -= goldWon;
      attacker.xp += rewards.xp;
      attacker.battles.wins++;
      defender.battles.losses++;
      
      battleLog += `
✦ Vencedor: @${attackerNumber}
✦ Gold ganho: ${goldWon}
✦ XP ganho: ${rewards.xp}
`;
    } else {
      const goldLost = betAmount > 0 ? betAmount : Math.floor(attacker.gold * 0.15);
      
      defender.gold += goldLost;
      attacker.gold -= goldLost;
      defender.battles.wins++;
      attacker.battles.losses++;
      
      battleLog += `
✦ Vencedor: @${defenderNumber}
✦ Gold perdido: ${goldLost}
✦ Humilhação: +1
`;
    }

    await sendReply(battleLog);
    updateRankings();
  },
};
