// rpgtutorial.js
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "rpgguia",
  description: "Aprenda tudo sobre o sistema RPG",
  commands: ["rpgguia", "aprenderrpg", "tutorialrpg"],
  usage: `${PREFIX}rpgguia`,
  handle: async ({ sendReply }) => {
    const tutorial = `
╔════════════════════════════╗
║  ≡≡≡ GUIA DO RPG ≡≡≡  🎮  ║
╚════════════════════════════╝

✦ *COMANDOS BÁSICOS*:
   » ${PREFIX}perfilrpg - Seu personagem
   » ${PREFIX}loja - Compre equipamentos
   » ${PREFIX}cacar - Enfrente monstros
   » ${PREFIX}pvp @jogador - Desafie alguém

✦ *SISTEMA DE NÍVEL*:
   » Ganhe XP derrotando monstros
   » Suba de nível para stats melhores
   » Cada nível exige mais XP

✦ *ECONOMIA*:
   » Ganhe gold em batalhas
   » Compre equipamentos na loja
   » Aposte em duelos PvP

✦ *DEUSES* (sigam nos IG):
   » ${PREFIX}lavs - @lavsocaa
   » ${PREFIX}braganca - @bragadev123

╔════════════════════════════╗
║  DICA: Use ${PREFIX}comandos  ║
║  para lista completa!       ║
╚════════════════════════════╝
`;

    await sendReply(tutorial);
  }
};
