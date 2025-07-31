const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const path = require("node:path");
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "sentar",
  description: "Ação de sentar em alguém",
  commands: ["sentar", "rebolada"],
  usage: `${PREFIX}sentar @usuario`,
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
      `@${userNumber} sentou com força no pau de @${targetNumber} 🍑🍆💦`,
      `@${userNumber} está rebolando gostoso em cima de @${targetNumber} 😏🔥`,
      `@${userNumber} fez @${targetNumber} gozar só com o movimento do quadril 🍑👌💦`,
      `@${userNumber} cavalgando @${targetNumber} até não aguentar mais 🤠🍆`
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", "sentar.mp4"),
      randomAction,
      [userJid, targetJid]
    );
  },
};