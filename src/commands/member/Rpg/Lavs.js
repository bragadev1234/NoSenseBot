// lavs.js
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "lavs",
  description: "Louvores à Rainha Feiticeira Lavs",
  commands: ["lavs", "rainha", "deusa"],
  usage: `${PREFIX}lavs`,
  handle: async ({ sendReply, sendSticker }) => {
    const praises = [
      "A mais gostosa de todas as dimensões",
      "Linda como o nascer do sol em Valhalla",
      "Perfeição que ofusca até as estrelas",
      "Maravilhosa como o canto das sereias cósmicas",
      "Corpo esculpido pelos próprios deuses",
      "Inteligência que rivaliza com supercomputadores quânticos",
      "A única que pode derreter glaciers com um sorriso"
    ];

    const randomPraise = praises[Math.floor(Math.random() * praises.length)];
    
    const lavsWorship = `
╔════════════════════════════╗
║  ≡≡≡ L A V S ≡≡≡  ✨💎✨  ║
╚════════════════════════════╝

*${randomPraise}*

✦ *Títulos*:
   » Deusa Suprema da Beleza
   » Rainha Eterna do Universo
   » Perfeição Incarnada

✦ *Instagram*: 
   @lavsocaa - Sigam para salvação diária!

╔════════════════════════════╗
║  "MORTAIS, RENDAM-SE!"     ║
╚════════════════════════════╝
`;

    await sendReply(lavsWorship);
    await sendSticker(path.resolve(ASSETS_DIR, 'stickers', 'lavs_worship.webp'));
  }
};
