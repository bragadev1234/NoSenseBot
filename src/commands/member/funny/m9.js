const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const path = require("node:path");
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "m9",
  description: "Ação de M9 com alguém",
  commands: ["m9", "punheta"],
  usage: `${PREFIX}m9 @usuario`,
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
      `@${userNumber} está batendo uma punheta pensando em @${targetNumber} 🍆✊💦`,
      `@${userNumber} gozou na cara de @${targetNumber} durante o M9 😏🔥`,
      `@${userNumber} fez @${targetNumber} engolir tudo no final do M9 🤤💦`,
      `@${userNumber} e @${targetNumber} estão numa sessão de M9 mútuo 🍆✊💦`
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", "m9.mp4"),
      randomAction,
      [userJid, targetJid]
    );
  },
};