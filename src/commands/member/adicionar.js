const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "add",
  description: "Adiciona um usuário ao grupo.",
  commands: ["add", "adicionar", "adiciona", "invite"],
  usage: `${PREFIX}add 5511999999999`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    remoteJid,
    sendErrorReply,
    sendSuccessReply,
    socket,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    if (!args.length) {
      throw new DangerError(
        `Você precisa informar o número do usuário que deseja adicionar.\n\nExemplo: ${PREFIX}add 5511999999999`
      );
    }

    const targetUserNumber = onlyNumbers(args[0]);
    const targetUserJid = toUserJid(targetUserNumber);

    try {
      // Verifica se o número existe no WhatsApp
      const [result] = await socket.onWhatsApp(targetUserNumber);
      
      if (!result || !result.exists) {
        return sendErrorReply(
          `O número ${targetUserNumber} não existe no WhatsApp.`
        );
      }

      // Adiciona o usuário ao grupo
      await socket.groupParticipantsUpdate(remoteJid, [targetUserJid], "add");
      
      await sendSuccessReply(
        `Usuário ${targetUserNumber} foi adicionado ao grupo com sucesso!`
      );
    } catch (error) {
      if (error.message.includes("401")) {
        throw new DangerError("Não foi possível adicionar o usuário. O grupo pode estar cheio ou o usuário pode ter bloqueado adições.");
      }
      throw new DangerError("Não foi possível adicionar o usuário. Verifique minhas permissões.");
    }
  },
};
