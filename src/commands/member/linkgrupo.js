const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "linkgrupo",
  description: "Obtém o link de convite do grupo.",
  commands: ["linkgrupo", "grouplink", "link", "convite"],
  usage: `${PREFIX}linkgrupo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    remoteJid,
    sendReply,
    socket,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    try {
      const code = await socket.groupInviteCode(remoteJid);
      const link = `https://chat.whatsapp.com/${code}`;
      
      await sendReply(`🔗 *Link do Grupo:*\n${link}`);
    } catch (error) {
      throw new DangerError("Não foi possível obter o link do grupo. Verifique minhas permissões.");
    }
  },
};
