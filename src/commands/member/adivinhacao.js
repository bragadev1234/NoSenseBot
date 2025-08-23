const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

// Armazenar jogos de adivinhação
const guessGames = new Map();

module.exports = {
  name: "adivinhacao",
  description: "Tente adivinhar o número que estou pensando (1-100).",
  commands: ["adivinhacao", "guess", "adivinhar", "numberguess"],
  usage: `${PREFIX}adivinhacao 50`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    remoteJid,
    userJid,
    sendReply,
  }) => {
    if (!guessGames.has(remoteJid)) {
      guessGames.set(remoteJid, new Map());
    }

    const userGames = guessGames.get(remoteJid);

    if (!userGames.has(userJid)) {
      // Iniciar novo jogo
      const secretNumber = Math.floor(Math.random() * 100) + 1;
      userGames.set(userJid, {
        secretNumber,
        attempts: 0,
        maxAttempts: 5,
        started: Date.now()
      });

      await sendReply(`🔢 *JOGO DA ADIVINHAÇÃO*\n\n` +
        `Estou pensando em um número entre 1 e 100!\n` +
        `Você tem 5 tentativas para adivinhar.\n\n` +
        `_Use ${PREFIX}adivinhacao [número] para jogar._`);
      return;
    }

    if (!args.length) {
      throw new DangerError(`Digite um número para adivinhar.`);
    }

    const guess = parseInt(args[0]);
    const game = userGames.get(userJid);

    if (isNaN(guess) || guess < 1 || guess > 100) {
      throw new DangerError("Digite um número entre 1 e 100.");
    }

    game.attempts++;

    if (guess === game.secretNumber) {
      await sendReply(`🎉 *PARABÉNS!* @${userJid.split('@')[0]}\n\n` +
        `Você acertou o número ${game.secretNumber}!\n` +
        `Tentativas: ${game.attempts}/${game.maxAttempts}\n\n` +
        `_Jogo finalizado!_`);
      userGames.delete(userJid);
    } else if (game.attempts >= game.maxAttempts) {
      await sendReply(`❌ *FIM DE JOGO!* @${userJid.split('@')[0]}\n\n` +
        `O número era: ${game.secretNumber}\n` +
        `Tentativas: ${game.attempts}/${game.maxAttempts}\n\n` +
        `_Tente novamente!_`);
      userGames.delete(userJid);
    } else {
      const hint = guess < game.secretNumber ? "maior" : "menor";
      await sendReply(`📉 *DICA:* Tente um número ${hint}!\n\n` +
        `Tentativa: ${game.attempts}/${game.maxAttempts}\n` +
        `Último palpite: ${guess}\n\n` +
        `_Continue tentando!_`);
    }
  },
};
