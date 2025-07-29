const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "roletarussa",
  description: "Jogo perigoso de roleta russa (1 em 6 chances de perder).",
  commands: ["roletarussa", "rr", "russianroulette"],
  usage: `${PREFIX}roletarussa`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, userJid, remoteJid, socket }) => {
    const bulletPosition = Math.floor(Math.random() * 6) + 1;
    const playerPosition = Math.floor(Math.random() * 6) + 1;

    if (bulletPosition === playerPosition) {
      await sendReact("💥");
      await sendReply(`💥 BANG! @${userJid.split("@")[0]} perdeu na roleta russa! 💀`);
      await socket.groupParticipantsUpdate(remoteJid, [userJid], "remove");
    } else {
      await sendReact("🔫");
      await sendReply(`🔫 Click! @${userJid.split("@")[0]} sobreviveu à roleta russa! (Posição ${playerPosition}/6)`);
    }
  },
};
