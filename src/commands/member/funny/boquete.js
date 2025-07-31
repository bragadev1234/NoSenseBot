const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const path = require("node:path");
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "boquete",
  description: "Ação de boquete com alguém",
  commands: ["boquete", "chupeta"],
  usage: `${PREFIX}boquete @usuario`,
  handle: async ({
    sendGifFromFile,
    sendErrorReply,
    userJid,
    replyJid,
    args,
    isReply,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "Você precisa mencionar ou marcar um membro!"
      );
    }

    const targetJid = isReply ? replyJid : toUserJid(args[0]);

    if (!targetJid) {
      await sendErrorReply(
        "Você precisa mencionar um usuário ou responder uma mensagem para essa ação."
      );
      return;
    }

    const userNumber = onlyNumbers(userJid);
    const targetNumber = onlyNumbers(targetJid);

    const actions = [
      `@${userNumber} está dando um boquete profundo em @${targetNumber} 👅🍆💦`,
      `@${userNumber} engoliu tudo que @${targetNumber} tinha pra oferecer 🤤🔥`,
      `@${userNumber} chupando com vontade o pau de @${targetNumber} até ele gozar 😏💦`,
      `@${userNumber} fez @${targetNumber} gemer com essa boca especial 👄🍆`
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", "boquete.mp4"),
      randomAction,
      [userJid, targetJid]
    );
  },
};