const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "jokempo",
  description: "Jogue pedra, papel e tesoura contra o bot.",
  commands: ["jokempo", "jokenpo", "ppt", "rps"],
  usage: `${PREFIX}jokempo pedra`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    userJid,
    sendReply,
  }) => {
    if (!args.length) {
      throw new DangerError(
        `Escolha pedra, papel ou tesoura.\n\nExemplo: ${PREFIX}jokempo pedra`
      );
    }

    const playerChoice = args[0].toLowerCase();
    const choices = ['pedra', 'papel', 'tesoura'];
    
    if (!choices.includes(playerChoice)) {
      throw new DangerError("Escolha entre: pedra, papel ou tesoura.");
    }

    const botChoice = choices[Math.floor(Math.random() * 3)];
    let result;

    if (playerChoice === botChoice) {
      result = "Empate!";
    } else if (
      (playerChoice === 'pedra' && botChoice === 'tesoura') ||
      (playerChoice === 'papel' && botChoice === 'pedra') ||
      (playerChoice === 'tesoura' && botChoice === 'papel')
    ) {
      result = "Você ganhou! 🎉";
    } else {
      result = "Eu ganhei! 😎";
    }

    const emojis = {
      pedra: '👊',
      papel: '✋',
      tesoura: '✌️'
    };

    await sendReply(`🎮 *JOKEMPO*\n\n` +
      `@${userJid.split('@')[0]}: ${emojis[playerChoice]} ${playerChoice}\n` +
      `🤖 Bot: ${emojis[botChoice]} ${botChoice}\n\n` +
      `🔸 *Resultado:* ${result}`);
  },
};
