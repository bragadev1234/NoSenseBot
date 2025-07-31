const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const path = require("node:path");
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "sexo",
  description: "Faz sexo com alguém",
  commands: ["sexo", "fode"],
  usage: `${PREFIX}sexo @usuario`,
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
        "Você precisa mencionar ou marcar um membro para foder!"
      );
    }

    const targetJid = isReply ? replyJid : toUserJid(args[0]);

    if (!targetJid) {
      await sendErrorReply(
        "Você precisa mencionar um usuário ou responder uma mensagem para transar."
      );
      return;
    }

    const userNumber = onlyNumbers(userJid);
    const targetNumber = onlyNumbers(targetJid);

    const phrases = [
      `@${userNumber} está metendo gostoso em @${targetNumber} até gozar dentro! 💦😈`,
      `@${userNumber} deu uma surra de pica em @${targetNumber} até deixar todo melado! 🍆💦`,
      `@${userNumber} e @${targetNumber} estão transando selvagemente até o amanhecer! 🌙🔥`
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", "sexo.mp4"),
      randomPhrase,
      [userJid, targetJid]
    );
  },
};