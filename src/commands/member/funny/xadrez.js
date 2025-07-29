const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "xadrez4x4",
  description: "Jogo de xadrez em um tabuleiro 4x4 simplificado.",
  commands: ["xadrez4x4", "mini-xadrez"],
  usage: `${PREFIX}xadrez4x4 @oponente`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, args, userJid, remoteJid, isGroup }) => {
    if (!isGroup(remoteJid)) {
      throw new InvalidParameterError("Este jogo só pode ser jogado em grupos!");
    }

    if (!args[0]) {
      await sendReply("Você precisa mencionar um oponente para jogar!");
      return;
    }

    const opponentJid = args[0].replace(/[@ ]/g, "") + "@s.whatsapp.net";
    
    if (opponentJid === userJid) {
      await sendReply("Você não pode jogar contra si mesmo!");
      return;
    }

    // Tabuleiro 4x4 simplificado
    const board = [
      ["♜", "♞", "♝", "♛"],
      ["♟", "♟", "♟", "♟"],
      ["♙", "♙", "♙", "♙"],
      ["♖", "♘", "♗", "♕"]
    ];

    const players = {
      [userJid]: "brancas",
      [opponentJid]: "pretas"
    };

    const currentPlayer = userJid;

    await sendReply(`♟️ Xadrez 4x4: @${userJid.split("@")[0]} (brancas) vs @${opponentJid.split("@")[0]} (pretas)
    
Tabuleiro:
${board.map(row => row.join(" ")).join("\n")}
    
É a vez de @${currentPlayer.split("@")[0]}. Use "${PREFIX}mover [de-para]" para fazer seu movimento (ex: a2-a3).`);
  },
};
