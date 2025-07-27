// guilda.js
const { PREFIX, RPG_DB, RPG_CONFIG } = require(`${BASE_DIR}/rpg-system`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "guilda",
  description: "Sistema de guildas para jogadores se unirem",
  commands: ["guilda", "guild", "clã"],
  usage: `${PREFIX}guilda criar <nome>\n${PREFIX}guilda entrar <nome>\n${PREFIX}guilda info [nome]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, args }) => {
    const userNumber = onlyNumbers(userJid);
    const action = args[0]?.toLowerCase();
    const guildName = args.slice(1).join(' ');

    if (!RPG_DB.users[userNumber]) {
      RPG_DB.users[userNumber] = createNewUser(userNumber);
    }

    const user = RPG_DB.users[userNumber];

    if (!action) {
      // Mostrar info da guilda atual
      if (user.guild) {
        const guild = RPG_DB.guilds[user.guild];
        await sendReply(getGuildInfo(guild));
      } else {
        await sendReply("Você não está em nenhuma guilda. Use !guilda criar <nome> ou !guilda entrar <nome>");
      }
      return;
    }

    switch(action) {
      case 'criar':
        if (!guildName) {
          throw new InvalidParameterError("Você precisa especificar um nome para a guilda!");
        }
        
        if (user.gold < RPG_CONFIG.GUILD_CREATION_COST) {
          await sendReply(`Você precisa de ${RPG_CONFIG.GUILD_CREATION_COST} gold para criar uma guilda!`);
          return;
        }
        
        if (user.guild) {
          await sendReply("Você já está em uma guilda! Deixe a guilda atual antes de criar uma nova.");
          return;
        }
        
        // Criar nova guilda
        const guildId = guildName.toLowerCase().replace(/\s+/g, '-');
        if (RPG_DB.guilds[guildId]) {
          await sendReply("Já existe uma guilda com esse nome!");
          return;
        }
        
        RPG_DB.guilds[guildId] = {
          id: guildId,
          name: guildName,
          leader: userNumber,
          members: [userNumber],
          level: 1,
          xp: 0,
          gold: 0,
          created: Date.now(),
          motto: '',
          announcements: []
        };
        
        user.gold -= RPG_CONFIG.GUILD_CREATION_COST;
        user.guild = guildId;
        
        await sendReply(`
╔════════════════════════════╗
║   ≡≡≡ GUILDA CRIADA ≡≡≡    ║
╚════════════════════════════╝

✦ Nome: ${guildName}
✦ Líder: @${userNumber}
✦ Membros: 1
✦ Custo: ${RPG_CONFIG.GUILD_CREATION_COST} gold

Use !guilda convite @jogador para convidar membros.
`);
        break;
        
      case 'entrar':
        if (!guildName) {
          throw new InvalidParameterError("Você precisa especificar o nome da guilda!");
        }
        
        const guildToJoin = Object.values(RPG_DB.guilds).find(g => 
          g.name.toLowerCase() === guildName.toLowerCase()
        );
        
        if (!guildToJoin) {
          await sendReply("Guilda não encontrada!");
          return;
        }
        
        if (user.guild) {
          await sendReply("Você já está em uma guilda! Deixe a guilda atual antes de entrar em outra.");
          return;
        }
        
        guildToJoin.members.push(userNumber);
        user.guild = guildToJoin.id;
        
        await sendReply(`
╔════════════════════════════╗
║   ≡≡≡ ENTROU NA GUILDA ≡≡≡ ║
╚════════════════════════════╝

✦ Guilda: ${guildToJoin.name}
✦ Membros: ${guildToJoin.members.length}
✦ Level: ${guildToJoin.level}

Bem-vindo(a) à guilda!
`);
        break;
        
      case 'info':
        let guildInfo;
        if (guildName) {
          guildInfo = Object.values(RPG_DB.guilds).find(g => 
            g.name.toLowerCase() === guildName.toLowerCase()
          );
          if (!guildInfo) {
            await sendReply("Guilda não encontrada!");
            return;
          }
        } else if (user.guild) {
          guildInfo = RPG_DB.guilds[user.guild];
        } else {
          await sendReply("Você não está em uma guilda e não especificou uma para visualizar.");
          return;
        }
        
        await sendReply(getGuildInfo(guildInfo));
        break;
        
      case 'deixar':
        if (!user.guild) {
          await sendReply("Você não está em nenhuma guilda!");
          return;
        }
        
        const guild = RPG_DB.guilds[user.guild];
        if (guild.leader === userNumber) {
          await sendReply("Você é o líder da guilda! Transfira a liderança antes de sair ou use !guilda deletar para remover a guilda.");
          return;
        }
        
        guild.members = guild.members.filter(m => m !== userNumber);
        user.guild = null;
        
        await sendReply(`Você deixou a guilda ${guild.name}.`);
        break;
        
      default:
        throw new InvalidParameterError("Ação inválida! Use criar, entrar, info ou deixar");
    }
  },
};

function getGuildInfo(guild) {
  return `
╔════════════════════════════╗
║   ≡≡≡ GUILDA ${guild.name.toUpperCase()} ≡≡≡ ║
╚════════════════════════════╝

✦ Líder: @${guild.leader}
✦ Membros: ${guild.members.length}/20
✦ Level: ${guild.level}
✦ XP: ${guild.xp}/${guild.level * 1000}
✦ Gold: ${guild.gold}
✦ Criada: ${new Date(guild.created).toLocaleDateString()}
✦ Lema: ${guild.motto || 'Nenhum'}

╔════════════════════════════╗
║        ANÚNCIOS            ║
╚════════════════════════════╝
${guild.announcements.length > 0 ? 
  guild.announcements.map(a => `✦ ${a}`).join('\n') : 
  'Nenhum anúncio recente.'}
`;
}
