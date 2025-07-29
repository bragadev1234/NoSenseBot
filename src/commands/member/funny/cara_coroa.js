const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "caraoucoroa",
  description: "Jogue cara ou coroa e teste sua sorte.",
  commands: ["caraoucoroa", "coinflip", "moeda"],
  usage: `${PREFIX}caraoucoroa [cara/coroa]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, args, userJid }) => {
    const resultado = Math.random() > 0.5 ? "cara" : "coroa";
    const aposta = args[0]?.toLowerCase();
    
    let mensagem = `@${userJid.split("@")[0]} girou a moeda e o resultado foi: ${resultado.toUpperCase()}!`;
    
    if (aposta && ["cara", "coroa"].includes(aposta)) {
      if (aposta === resultado) {
        mensagem += "\n🎉 Parabéns, você acertou!";
      } else {
        mensagem += "\n😢 Que pena, você errou!";
      }
    }

    await sendReply(mensagem);
  },
};
