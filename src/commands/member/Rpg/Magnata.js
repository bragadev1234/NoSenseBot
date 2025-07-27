// magnata.js
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "magnata",
  description: "Homenagem ao Magnata Maligno",
  commands: ["magnata", "magnatao", "rico"],
  usage: `${PREFIX}magnata`,
  handle: async ({ sendReply }) => {
    const wealthMessage = `
╔════════════════════════════╗
║  ≡≡≡ MAGNATA MALIGNO ≡≡≡   ║
╚════════════════════════════╝

*"Ouro corre em minhas veias"*

✦ *Títulos*:
   » Senhor das Economias
   » Ditador Financeiro Supremo
   » Bancoiro dos Deuses

✦ *Fatos*:
   » Ganha 1 milhão de gold/hora
   » Possui diamantes como pedrinhas
   » Riqueza que desafia a física

╔════════════════════════════╗
║  "INVEJEM-ME, MORTALS!"    ║
╚════════════════════════════╝
`;

    await sendReply(wealthMessage);
  }
};
