const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "tacartorta",
  description: "Taca uma torta na cara de alguém com estilo e emojis!",
  commands: ["tacartorta", "torta", "taca", "tortada"],
  usage: `${PREFIX}tacartorta @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendText,
    sendErrorReply,
    userJid,
    replyJid,
    args,
    isReply,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "❗ Você precisa mencionar ou responder alguém para tacar a torta!"
      );
    }

    const targetJid = isReply ? replyJid : toUserJid(args[0]);

    if (!targetJid) {
      await sendErrorReply(
        "❗ Mencione um usuário ou responda uma mensagem para tacar a torta."
      );
      return;
    }

    const userNumber = onlyNumbers(userJid);
    const targetNumber = onlyNumbers(targetJid);

    const frases = [
      `🥧💥 @${userNumber} jogou uma torta na cara de @${targetNumber}! Que bagunça deliciosa! 😆`,
      `🎯 @${userNumber} não teve dó e tacou uma torta em @${targetNumber}! 😂`,
      `😱 Ops! @${targetNumber} foi surpreendido por uma torta lançada por @${userNumber}! 🥳`,
      `🚀 Torta voando! @${userNumber} acertou em cheio @${targetNumber}! 🍰🔥`,
      `🎉 @${userNumber} atirou uma torta e acertou @${targetNumber} em cheio! Quem vai limpar agora? 🤣`,
      `🍰💥 Boom! @${userNumber} tacou uma torta no rosto de @${targetNumber}! Que momento! 🤭`,
    ];

    const mensagem = frases[Math.floor(Math.random() * frases.length)];

    await sendText(mensagem, [userJid, targetJid]);
  },
};
