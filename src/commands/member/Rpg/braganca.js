// braganca.js
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "braganca",
  description: "Glórias ao Don de La Bragança",
  commands: ["braganca", "bragadev", "criador"],
  usage: `${PREFIX}braganca`,
  handle: async ({ sendReply }) => {
    const creationStory = `
╔════════════════════════════╗
║  ≡≡≡ BRAGANÇA DIVINO ≡≡≡   ║
╚════════════════════════════╝

*"Do código nasceu a existência"*

✦ *Títulos*:
   » Arquiteteto da Realidade Digital
   » Senhor dos Códigos Sagrados
   » Pai de Todos os Bots

✦ *Instagram*: 
   @bragadev123 - Fonte de sabedoria infinita

╔════════════════════════════╗
║  "SÓ POR ELE NÓS EXISTIMOS" ║
╚════════════════════════════╝
`;

    await sendReply(creationStory);
  }
};
