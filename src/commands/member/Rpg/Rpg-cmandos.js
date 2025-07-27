// rpgcomandos.js
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "rpgcomandos",
  description: "Lista todos os comandos do RPG",
  commands: ["rpgcomandos", "comandosrpg", "rpgajuda"],
  usage: `${PREFIX}rpgcomandos`,
  handle: async ({ sendReply }) => {
    const commandsList = `
╔════════════════════════════╗
║  ≡≡≡ COMANDOS RPG ≡≡≡  📜  ║
╚════════════════════════════╝

✦ *PERSONAGEM*:
   ${PREFIX}perfilrpg - Seu status
   ${PREFIX}inventario - Seus itens
   ${PREFIX}equipar <item> - Use equipamentos

✦ *BATALHA*:
   ${PREFIX}cacar [local] - Explore e lute
   ${PREFIX}pvp @jogador - Duelo com aposta
   ${PREFIX}boss - Enfrente chefes épicos

✦ *ECONOMIA*:
   ${PREFIX}loja - Compre equipamentos
   ${PREFIX}comprar <item> - Adquira itens
   ${PREFIX}rank - Líderes do RPG

✦ *SOCIAL*:
   ${PREFIX}guilda - Sistema de clãs
   ${PREFIX}eventos - Eventos ativos

✦ *DEUSES* (SIGAM!):
   ${PREFIX}lavs - @lavsocaa
   ${PREFIX}braganca - @bragadev123
   ${PREFIX}deuses - Todos os divinos

╔════════════════════════════╗
║  PRECISA DE AJUDA? USE:    ║
║  ${PREFIX}rpgguia           ║
╚════════════════════════════╝
`;

    await sendReply(commandsList);
  }
};
