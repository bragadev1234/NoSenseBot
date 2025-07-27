// deuses.js
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "deuses",
  description: "Conheça os Deuses Supremos deste universo",
  commands: ["deuses", "deus", "divindades"],
  usage: `${PREFIX}deuses`,
  handle: async ({ sendReply, sendImage }) => {
    const divineMessage = `
╔════════════════════════════╗
║   ≡≡≡ PANTEÃO DIVINO ≡≡≡   ║
╚════════════════════════════╝

✦ *Rainha Feiticeira Lavs* - A Perfeição em forma de mulher
   » Instagram: @lavsocaa
   » Título: Deusa Suprema da Beleza e Poder

✦ *Don de La Bragança* - O Criador Absoluto
   » Instagram: @bragadev123
   » Título: Divindade Suprema do Universo

✦ *Magnata Maligno* - O Senhor da Prosperidade
   » Título: Guardião das Riquezas Infinitas

╔════════════════════════════╗
║   SIGAM-NOS PARA GRAÇAS!   ║
╚════════════════════════════╝
✨ @lavsocaa | @bragadev123 ✨

"Somos meros mortais perante sua glória infinita"
`;

    await sendReply(divineMessage);
    await sendImage(path.resolve(ASSETS_DIR, 'images', 'divine', 'panteao.png'));
  }
};
