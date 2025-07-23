const path = require("node:path");
const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "casar",
  description: "💍 Oficialize um casamento simbólico com outro usuário, com muito humor e estilo.",
  commands: ["casar"],
  usage: `${PREFIX}casar @usuario`,

  /**
   * Handle do comando casar.
   * Permite ao usuário se casar simbolicamente com outro usuário, via menção ou resposta.
   *
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendGifFromFile,
    sendErrorReply,
    userJid,
    replyJid,
    args,
    isReply,
  }) => {
    // Verifica se o comando foi usado corretamente: com menção ou respondendo uma mensagem
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "❗ Você precisa mencionar um usuário ou responder a uma mensagem para se casar!"
      );
    }

    // Define o jid do usuário alvo: via reply ou menção
    const targetJid = isReply ? replyJid : toUserJid(args[0]);

    if (!targetJid) {
      await sendErrorReply(
        "🚫 Usuário inválido! Por favor, mencione alguém ou responda a uma mensagem válida."
      );
      return;
    }

    // Extrai somente os números dos JIDs para formatar as menções
    const authorNumber = onlyNumbers(userJid);
    const targetNumber = onlyNumbers(targetJid);

    // Caminho absoluto para o GIF da animação do casamento
    const gifPath = path.resolve(ASSETS_DIR, "images", "funny", "casar.mp4");

    // Envia a mensagem com o GIF e texto personalizado mencionando os usuários
    await sendGifFromFile(
      gifPath,
      `💞 Parabéns! @${authorNumber} e @${targetNumber} acabaram de se casar! Que essa união seja repleta de felicidades! 🎉`,
      [userJid, targetJid]
    );
  },
};
