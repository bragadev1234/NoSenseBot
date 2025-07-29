const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

const cartas = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

module.exports = {
  name: "blackjack",
  description: "Jogue blackjack (21) contra o bot.",
  commands: ["blackjack", "bj", "21"],
  usage: `${PREFIX}blackjack`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid }) => {
    // Distribuir cartas iniciais
    const maoJogador = [
      cartas[Math.floor(Math.random() * cartas.length)],
      cartas[Math.floor(Math.random() * cartas.length)]
    ];
    
    const maoBot = [
      cartas[Math.floor(Math.random() * cartas.length)],
      '?'
    ];

    await sendReply(`🃏 Blackjack iniciado para @${userJid.split("@")[0]}!
    
Suas cartas: ${maoJogador.join(', ')}
Cartas do bot: ${maoBot.join(', ')}

Use:
"${PREFIX}hit" para pedir mais uma carta
"${PREFIX}stand" para parar
"${PREFIX}double" para dobrar sua aposta`);
  },
};
