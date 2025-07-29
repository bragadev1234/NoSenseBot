const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "jogodavelha",
  description: "Desafie alguém para um jogo da velha.",
  commands: ["jogodavelha", "velha", "ttt"],
  usage: `${PREFIX}jogodavelha @oponente`,
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

    // Inicializar tabuleiro
    const board = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"]
    ];

    const players = {
      [userJid]: "❌",
      [opponentJid]: "⭕"
    };

    const currentPlayer = userJid;

    await sendReply(`🎮 Jogo da Velha: @${userJid.split("@")[0]} (❌) vs @${opponentJid.split("@")[0]} (⭕)
    
Tabuleiro:
${board.map(row => row.join(" | ")).join("\n---------\n")}
    
É a vez de @${currentPlayer.split("@")[0]}. Use "${PREFIX}jogar [1-9]" para fazer sua jogada.`);
  },
};
