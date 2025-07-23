const rpg = require('./rpg-core');
const { PREFIX } = require('../../../config');

module.exports = {
  name: "profissao",
  description: "Escolhe sua profissão no RPG",
  commands: ["profissao", "profissão"],
  usage: `${PREFIX}profissao <tipo>`,
  handle: async ({ args, userJid, sendReply, sendErrorReply, userName }) => {
    const profession = args[0]?.toLowerCase();
    const validProfs = Object.keys(rpg.professions);
    
    if (!validProfs.includes(profession)) {
      return sendErrorReply(`Profissões disponíveis: ${validProfs.join(', ')}`);
    }

    const player = rpg.getPlayer(userJid, userName);
    player.profession = profession.charAt(0).toUpperCase() + profession.slice(1);
    rpg.saveData();

    await sendReply(
      `✅ Você agora é um *${player.profession}*!\n` +
      `Ganhos: ${rpg.professions[profession].min}-${rpg.professions[profession].max} golds por trabalho`
    );
  }
};
