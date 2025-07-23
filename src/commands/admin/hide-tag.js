const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "marcartodos",
  description: "Este comando marcará todos do grupo",
  commands: ["marcartodos"],
  usage: `${PREFIX}hidetag motivo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ fullArgs, sendText, socket, remoteJid, sendReact }) => {
    const { participants } = await socket.groupMetadata(remoteJid);

    const mentions = participants.map(({ id }) => id);

    await sendReact("📢");

    await sendText(`📢 Marcando todos!\n\n${fullArgs}`, mentions);
  },
};
