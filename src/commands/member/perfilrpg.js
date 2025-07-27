// perfilrpg.js
const { PREFIX, RPG_DB, RPG_CONFIG } = require(`${BASE_DIR}/rpg-system`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  name: "perfilrpg",
  description: "Mostra seu perfil detalhado no RPG",
  commands: ["perfilrpg", "rpgperfil", "meurpg"],
  usage: `${PREFIX}perfilrpg [@usuario]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendImage, userJid, replyJid, args, isReply }) => {
    const targetJid = isReply ? replyJid : args.length ? toUserJid(args[0]) : userJid;
    const userNumber = onlyNumbers(targetJid);

    if (!RPG_DB.users[userNumber]) {
      RPG_DB.users[userNumber] = createNewUser(userNumber);
    }

    const user = RPG_DB.users[userNumber];
    const specialChar = RPG_DB.specialCharacters[userNumber];
    
    // Criar imagem de perfil (simplificado)
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    
    // Fundo baseado no nível
    const bgColor = user.level < 10 ? '#3498db' : 
                   user.level < 30 ? '#2ecc71' : 
                   user.level < 50 ? '#e74c3c' : 
                   user.level < 80 ? '#9b59b6' : '#f1c40f';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texto do perfil
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`PERFIL RPG - Nível ${user.level}`, 20, 30);
    
    ctx.font = '16px Arial';
    ctx.fillText(`XP: ${user.xp}/${calculateNextLevelXP(user.level)}`, 20, 60);
    ctx.fillText(`Gold: ${user.gold}`, 20, 90);
    
    // Salvar imagem temporariamente
    const tempPath = path.join(ASSETS_DIR, 'temp', `${userNumber}-profile.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(tempPath, buffer);
    
    // Texto detalhado
    let profileText = `
╔════════════════════════════╗
║       ≡≡≡ PERFIL RPG ≡≡≡   ║
╚════════════════════════════╝

✦ Nível: ${user.level} (${user.xp}/${calculateNextLevelXP(user.level)} XP)
✦ Progresso: ${calculateLevelProgress(user)}%
✦ Gold: ${user.gold} 
✦ Rank Gold: #${getRankPosition(userNumber, 'gold')}
✦ Rank Nível: #${getRankPosition(userNumber, 'xp')}

╔════════════════════════════╗
║        ATRIBUTOS           ║
╚════════════════════════════╝
✦ HP: ${user.hp}/${user.maxHp}
✦ Mana: ${user.mana}/${user.maxMana}
✦ Ataque: ${user.attack} + ${user.equipment.weapon?.attack || 0}
✦ Defesa: ${user.defense} + ${user.equipment.armor?.defense || 0}
✦ Magia: ${user.magicAttack} + ${user.equipment.spell?.damage || 0}
✦ Sorte: ${user.luck || 0}

╔════════════════════════════╗
║        EQUIPAMENTO         ║
╚════════════════════════════╝
✦ Arma: ${user.equipment.weapon?.name || 'Nenhuma'} ${user.equipment.weapon?.special ? `[${user.equipment.weapon.special}]` : ''}
✦ Armadura: ${user.equipment.armor?.name || 'Nenhuma'} ${user.equipment.armor?.special ? `[${user.equipment.armor.special}]` : ''}
✦ Magia: ${user.equipment.spell?.name || 'Nenhuma'} ${user.equipment.spell?.special ? `[${user.equipment.spell.special}]` : ''}
✦ Acessório: ${user.equipment.accessory?.name || 'Nenhum'}

╔════════════════════════════╗
║        ESTATÍSTICAS        ║
╚════════════════════════════╝
✦ Jogando há: ${formatTime(process.uptime() - user.joinTime)}
✦ Vitórias PvP: ${user.battles.wins}
✦ Derrotas PvP: ${user.battles.losses}
✦ Monstros derrotados: ${user.monstersDefeated}
✦ Missões completas: ${user.questsCompleted}
`;

    if (specialChar) {
      profileText += `
╔════════════════════════════╗
║   ≡≡≡ STATUS DIVINO ≡≡≡    ║
╚════════════════════════════╝
✦ Título: ${specialChar.title}
✦ Arma: ${specialChar.weapon}
✦ Poderes:
${specialChar.powers.map(p => `✧ ${p}`).join('\n')}
✦ Gold/hora: ${specialChar.goldPerHour}
`;
    }

    // Enviar imagem e texto
    await sendImage(tempPath, 'Seu perfil RPG:');
    await sendReply(profileText);
    
    // Limpar arquivo temporário
    fs.unlinkSync(tempPath);
  },
};

// Funções auxiliares
function calculateNextLevelXP(level) {
  return Math.floor(RPG_CONFIG.XP_BASE * Math.pow(RPG_CONFIG.XP_MULTIPLIER, level - 1));
}

function calculateLevelProgress(user) {
  const currentLevelXP = calculateNextLevelXP(user.level - 1);
  const nextLevelXP = calculateNextLevelXP(user.level);
  return Math.floor(((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
}

function getRankPosition(userNumber, type) {
  const ranking = RPG_DB.rankings[type];
  const index = ranking.findIndex(([num]) => num === userNumber);
  return index !== -1 ? index + 1 : 'Não ranqueado';
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}
