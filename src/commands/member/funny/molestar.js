const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const path = require("node:path");
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "molestar",
  description: "Ação de BDSM com alguém",
  commands: ["molestar", "bdsm", "dominar"],
  usage: `${PREFIX}molestar @usuario`,
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
      `@${userNumber} amarrou @${targetNumber} e está fazendo o que quiser 🔗😈`,
      `@${userNumber} deu uma surra em @${targetNumber} com um chicote 🖤🖤`,
      `@${userNumber} colocou @${targetNumber} de joelhos e está humilhando 😏🔥`,
      `@${userNumber} está testando os limites de @${targetNumber} numa sessão BDSM intensa ⛓️💢`
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", "bdsm.mp4"),
      randomAction,
      [userJid, targetJid]
    );
  },
};