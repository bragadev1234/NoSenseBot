/**
 * Comando para enviar uma mensagem repetidas vezes
 * Autor: Mkg
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "spam",
  description: "Envia uma mensagem um número de vezes (máximo 100).",
  commands: ["spam"],
  usage: `${PREFIX}spam <quantidade> <mensagem>`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, args }) => {
    // Verifica se o usuário passou a quantidade e a mensagem
    if (args.length < 2) {
      return sendReply(`❌ Uso incorreto!\nExemplo: ${PREFIX}spam 5 Olá Mundo`);
    }

    // Pega quantidade e mensagem
    let quantidade = parseInt(args[0], 10);
    if (isNaN(quantidade) || quantidade <= 0) {
      return sendReply(`❌ Quantidade inválida!`);
    }
    if (quantidade > 100) quantidade = 100;

    const mensagem = args.slice(1).join(" ");

    // Envia a mensagem a quantidade de vezes
    for (let i = 0; i < quantidade; i++) {
      await sendReply(mensagem);
    }
  },
};
