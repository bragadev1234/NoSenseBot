const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "domino",
  description: "Inicia um jogo de dominó no grupo.",
  commands: ["domino", "domino"],
  usage: `${PREFIX}domino`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, remoteJid, args, isGroup }) => {
    if (!isGroup(remoteJid)) {
      throw new InvalidParameterError("Este jogo só pode ser jogado em grupos!");
    }

    const players = args.length > 0 ? args : [];
    
    if (players.length < 2) {
      await sendReply("Você precisa mencionar pelo menos 2 jogadores para começar o jogo!");
      return;
    }

    // Lógica simplificada de dominó
    const pieces = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        pieces.push([i, j]);
      }
    }

    // Embaralhar peças
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }

    // Distribuir peças (7 para cada jogador)
    const playerPieces = {};
    players.forEach((player, index) => {
      playerPieces[player] = pieces.slice(index * 7, (index + 1) * 7);
    });

    await sendReply(`🎲 Jogo de dominó iniciado!
    
Jogadores: ${players.map(p => `@${p.split("@")[0]}`).join(", ")}
    
Cada jogador recebeu 7 peças. Use "${PREFIX}jogar @jogador [peça]" para jogar.`);
  },
};
