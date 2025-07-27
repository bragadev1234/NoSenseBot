// braganca_commands.js
const { PREFIX, RPG_DB } = require(`${BASE_DIR}/rpg-system`);
const { InvalidParameterError, PermissionError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "braganca_poderes",
  description: "Comandos Divinos Exclusivos do Don de La Bragança",
  commands: [
    "resetmundial", 
    "darxp", 
    "banirdeuses",
    "criarmonstro",
    "alterarrealidade",
    "abrirportal",
    "concederarma",
    "revelarsegredos"
  ],
  usage: `${PREFIX}resetmundial\n${PREFIX}darxp @usuário 9999\n${PREFIX}banirdeuses @usuário\n${PREFIX}criarmonstro nome HP ATK DEF\n${PREFIX}alterarrealidade chave valor\n${PREFIX}abrirportal dimensao\n${PREFIX}concederarma @usuário "Espada Proibida" 999 50\n${PREFIX}revelarsegredos`,
  
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, args, fullArgs, isReply, replyJid }) => {
    const userNumber = onlyNumbers(userJid);
    
    // Verificação de divindade
    if (userNumber !== '559984271816') {
      throw new PermissionError("Apenas o Don de La Bragança pode usar esses comandos!");
    }

    const command = args[0]?.toLowerCase();
    
    // === COMANDO: RESET MUNDIAL ===
    if (command === 'resetmundial') {
      RPG_DB.users = {};
      RPG_DB.guilds = {};
      RPG_DB.events = {};
      RPG_DB.rankings = { gold: [], xp: [], pvp: [] };
      
      await sendReply("🔥 O mundo foi reiniciado com fogo purificador!\n" + 
                     "Todas as almas foram devolvidas ao ponto zero.");
      return;
    }

    // === COMANDO: DAR XP ===
    if (command === 'darxp') {
      const targetJid = isReply ? replyJid : toUserJid(args[1]);
      const xpAmount = parseInt(args[2]);
      
      if (!targetJid || isNaN(xpAmount)) {
        throw new InvalidParameterError("Uso: !darxp @usuário quantidade");
      }

      const targetNumber = onlyNumbers(targetJid);
      if (!RPG_DB.users[targetNumber]) {
        RPG_DB.users[targetNumber] = createNewUser(targetNumber);
      }

      RPG_DB.users[targetNumber].xp += xpAmount;
      
      // Level up automático
      while (RPG_DB.users[targetNumber].xp >= calculateNextLevelXP(RPG_DB.users[targetNumber].level)) {
        RPG_DB.users[targetNumber].levelUp();
      }
      
      await sendReply(`⚡ @${targetNumber} recebeu ${xpAmount} XP diretamente das mãos divinas!\n` +
                     `Novo nível: ${RPG_DB.users[targetNumber].level}`);
      updateRankings();
      return;
    }

    // === COMANDO: BANIR DEUSES ===
    if (command === 'banirdeuses') {
      const targetJid = isReply ? replyJid : toUserJid(args[1]);
      if (!targetJid) throw new InvalidParameterError("Uso: !banirdeuses @usuário");

      const targetNumber = onlyNumbers(targetJid);
      if (RPG_DB.specialCharacters[targetNumber]) {
        const banTime = 3600000; // 1 hora
        const originalData = { ...RPG_DB.specialCharacters[targetNumber] };
        
        await sendReply(`☠️ @${targetNumber} foi banido dos poderes divinos!\n` +
                       `Tempo de exílio: 1 hora terrena`);
        
        delete RPG_DB.specialCharacters[targetNumber];
        
        setTimeout(() => {
          RPG_DB.specialCharacters[targetNumber] = originalData;
        }, banTime);
      } else {
        await sendReply("Este mortal nunca foi digno de ser um deus...");
      }
      return;
    }

    // === COMANDO: CRIAR MONSTRO ===
    if (command === 'criarmonstro') {
      const [name, hp, atk, def] = args.slice(1);
      
      if (!name || !hp || !atk || !def) {
        throw new InvalidParameterError("Uso: !criarmonstro nome HP ATK DEF");
      }

      const monsterId = name.toLowerCase().replace(/\s+/g, '_');
      RPG_DB.monsters[monsterId] = {
        name,
        hp: parseInt(hp),
        attack: parseInt(atk),
        defense: parseInt(def),
        xp: Math.floor(parseInt(hp) * 0.5),
        gold: [Math.floor(parseInt(atk) * 2), Math.floor(parseInt(atk) * 5)],
        loot: [],
        isCustom: true
      };

      await sendReply(`🐉 Monstro "${name}" criado com:\n` +
                     `❤️ HP: ${hp} | ⚔️ ATK: ${atk} | 🛡️ DEF: ${def}`);
      return;
    }

    // === COMANDO: ALTERAR REALIDADE ===
    if (command === 'alterarrealidade') {
      const [key, value] = args.slice(1);
      
      if (!key || !value) {
        throw new InvalidParameterError("Uso: !alterarrealidade chave valor");
      }

      RPG_DB.worldState[key] = value;
      
      await sendReply(`🌌 Realidade alterada:\n` +
                     `Chave "${key}" agora é "${value}"`);
      return;
    }

    // === COMANDO: ABRIR PORTAL ===
    if (command === 'abrirportal') {
      const dimension = args[1] || 'inferno';
      const dimensions = {
        inferno: { name: "Inferno", emoji: "🔥", effect: "Todos os ataques causam queimadura" },
        valhalla: { name: "Valhalla", emoji: "⚡", effect: "+50% de XP ganho" },
        abismo: { name: "Abismo", emoji: "🕳️", effect: "Visibilidade reduzida" }
      };

      if (!dimensions[dimension]) {
        throw new InvalidParameterError(`Dimensões disponíveis: ${Object.keys(dimensions).join(', ')}`);
      }

      RPG_DB.events.activePortal = dimensions[dimension];
      
      await sendReply(
        `🌀 PORTAL PARA ${dimensions[dimension].name.toUpperCase()} ABERTO ${dimensions[dimension].emoji}\n` +
        `Efeito ativo: ${dimensions[dimension].effect}\n` +
        `Duração: 1 hora terrena`
      );

      setTimeout(() => {
        delete RPG_DB.events.activePortal;
      }, 3600000);
      return;
    }

    // === COMANDO: CONCEDER ARMA ===
    if (command === 'concederarma') {
      const targetJid = isReply ? replyJid : toUserJid(args[1]);
      const weaponName = fullArgs.split('"')[1];
      const [attack, level] = fullArgs.split('"')[2].trim().split(' ').map(Number);
      
      if (!targetJid || !weaponName || isNaN(attack) || isNaN(level)) {
        throw new InvalidParameterError('Uso: !concederarma @usuário "Nome da Arma" ATK NIVEL');
      }

      const targetNumber = onlyNumbers(targetJid);
      if (!RPG_DB.users[targetNumber]) {
        RPG_DB.users[targetNumber] = createNewUser(targetNumber);
      }

      const divineWeapon = {
        name: weaponName,
        attack,
        level,
        special: 'divine_blessing',
        isDivine: true
      };

      RPG_DB.users[targetNumber].equipment.weapon = divineWeapon;
      
      await sendReply(
        `⚔️ ARMA DIVINA CONCEDIDA:\n` +
        `Para: @${targetNumber}\n` +
        `Nome: ${weaponName}\n` +
        `Poder: ${attack} ATK | Nível ${level}\n` +
        `Efeito: Bênção Divina (+30% dano)`
      );
      return;
    }

    // === COMANDO: REVELAR SEGREDOS ===
    if (command === 'revelarsegredos') {
      const secrets = [
        "O ouro dos jogadores é armazenado em um dragão dimensional",
        "Lavs na verdade criou o Don quando era apenas uma bebê divina",
        "Existe um nível 101, mas apenas os dignos podem alcançar",
        "O próximo boss será baseado no primeiro jogador a chegar no nível 100",
        "Há uma espada lendária escondida no código-fonte do bot"
      ];

      await sendReply(
        `🔮 SEGREDOS CÓSMICOS REVELADOS:\n\n` +
        `"${secrets[Math.floor(Math.random() * secrets.length)]}"\n\n` +
        `(Este conhecimento pode desaparecer a qualquer momento)`
      );
      return;
    }

    // === LISTA DE COMANDOS ===
    const helpMessage = `
╔════════════════════════════╗
║  ≡≡≡ PODERES ABSOLUTOS ≡≡≡ ║
╚════════════════════════════╝

✦ ${PREFIX}resetmundial - Apaga TODOS os dados RPG
✦ ${PREFIX}darxp @usuário 9999 - Concede XP divino
✦ ${PREFIX}banirdeuses @usuário - Revoga poderes
✦ ${PREFIX}criarmonstro Nome HP ATK DEF - Cria vida
✦ ${PREFIX}alterarrealidade chave valor - Altera o mundo
✦ ${PREFIX}abrirportal [inferno/valhalla/abismo] - Conecta dimensões
✦ ${PREFIX}concederarma @usuário "Nome" ATK NIVEL - Forja armas lendárias
✦ ${PREFIX}revelarsegredos - Mostra verdades cósmicas

╔════════════════════════════╗
║  "EU SOU A LEI SUPREMA"    ║
╚════════════════════════════╝
`;

    await sendReply(helpMessage);
  }
};
