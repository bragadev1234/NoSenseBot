const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { isGroup } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "jogodavelha",
  description: "Desafie alguém para um jogo da velha.",
  commands: ["jogodavelha", "velha", "ttt"],
  usage: `${PREFIX}jogodavelha @oponente`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, args, userJid, remoteJid, socket }) => {
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

    // Inicializar jogo
    socket.tttGames = socket.tttGames || {};
    const gameId = `${remoteJid}_${Date.now()}`;
    
    socket.tttGames[gameId] = {
      board: [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"]
      ],
      players: {
        [userJid]: "❌",
        [opponentJid]: "⭕"
      },
      currentPlayer: userJid,
      status: "waiting"
    };

    await sendReply(`🎮 Jogo da Velha iniciado!
    
Jogadores:
❌ @${userJid.split("@")[0]}
⭕ @${opponentJid.split("@")[0]}

É a vez de @${userJid.split("@")[0]} (❌)

Tabuleiro:
${formatBoard(socket.tttGames[gameId].board)}

Use "${PREFIX}jogar [1-9]" para fazer sua jogada.`);
  },
};

// Comando para jogar
module.exports.actions = {
  jogar: async ({ sendReply, args, userJid, remoteJid, socket }) => {
    const gameId = Object.keys(socket.tttGames || {}).find(id => id.startsWith(remoteJid));
    if (!gameId) return await sendReply("Nenhum jogo ativo neste grupo.");

    const game = socket.tttGames[gameId];
    if (game.currentPlayer !== userJid) {
      return await sendReply("Não é sua vez de jogar!");
    }

    const position = parseInt(args[0]);
    if (isNaN(position) || position < 1 || position > 9) {
      return await sendReply("Posição inválida! Escolha um número de 1 a 9.");
    }

    const row = Math.floor((position - 1) / 3);
    const col = (position - 1) % 3;

    if (["❌", "⭕"].includes(game.board[row][col])) {
      return await sendReply("Esta posição já está ocupada!");
    }

    game.board[row][col] = game.players[userJid];
    
    // Verificar vitória
    if (checkWin(game.board, game.players[userJid])) {
      await sendReply(`🎉 @${userJid.split("@")[0]} venceu!
      
Tabuleiro final:
${formatBoard(game.board)}`);
      delete socket.tttGames[gameId];
      return;
    }

    // Verificar empate
    if (game.board.flat().every(cell => ["❌", "⭕"].includes(cell))) {
      await sendReply(`🤝 Empate!
      
Tabuleiro final:
${formatBoard(game.board)}`);
      delete socket.tttGames[gameId];
      return;
    }

    // Trocar jogador
    game.currentPlayer = Object.keys(game.players).find(p => p !== userJid);
    
    await sendReply(`@${game.currentPlayer.split("@")[0]} (${game.players[game.currentPlayer]}) é sua vez!
    
Tabuleiro:
${formatBoard(game.board)}`);
  }
};

function formatBoard(board) {
  return board.map(row => row.join(" | ")).join("\n---------\n");
}

function checkWin(board, symbol) {
  // Verificar linhas
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === symbol && board[i][1] === symbol && board[i][2] === symbol) {
      return true;
    }
  }

  // Verificar colunas
  for (let j = 0; j < 3; j++) {
    if (board[0][j] === symbol && board[1][j] === symbol && board[2][j] === symbol) {
      return true;
    }
  }

  // Verificar diagonais
  if (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) {
    return true;
  }
  if (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) {
    return true;
  }

  return false;
              }
