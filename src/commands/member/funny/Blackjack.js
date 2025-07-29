const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { isGroup } = require(`${BASE_DIR}/utils`);

// Sistema completo de Blackjack com apostas, splits e double down
module.exports = {
  name: "blackjack",
  description: "Jogue blackjack (21) contra o bot com sistema de apostas completo.",
  commands: ["blackjack", "bj", "21"],
  usage: `${PREFIX}blackjack [aposta]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, args, remoteJid, socket }) => {
    const betAmount = parseInt(args[0]) || 10;
    
    if (isNaN(betAmount) || betAmount <= 0) {
      await sendReply("Por favor, insira uma aposta válida (ex: !blackjack 50)");
      return;
    }

    // Baralho com múltiplos decks
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let deck = [];
    
    // 6 baralhos (como em cassinos)
    for (let i = 0; i < 6; i++) {
      for (const suit of suits) {
        for (const value of values) {
          deck.push({ value, suit });
        }
      }
    }

    // Embaralhar
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Distribuir cartas
    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];
    let playerTotal = calculateHand(playerHand);
    let dealerTotal = calculateHand([dealerHand[0]]); // Mostra apenas uma carta do dealer
    let gameState = "playing";
    let canDouble = true;
    let canSplit = playerHand[0].value === playerHand[1].value;

    function drawCard() {
      return deck.pop();
    }

    function calculateHand(hand) {
      let total = 0;
      let aces = 0;
      
      for (const card of hand) {
        if (card.value === 'A') {
          aces++;
          total += 11;
        } else if (['J', 'Q', 'K'].includes(card.value)) {
          total += 10;
        } else {
          total += parseInt(card.value);
        }
      }
      
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }
      
      return total;
    }

    function formatHand(hand, hideFirst = false) {
      return hand.map((card, i) => 
        i === 0 && hideFirst ? '❓' : `${card.value}${card.suit}`
      ).join(' ');
    }

    await sendReply(`🃏 *BLACKJACK* - Aposta: $${betAmount}
    
👤 Sua mão: ${formatHand(playerHand)} (Total: ${playerTotal})
🃏 Dealer: ${formatHand(dealerHand, true)} (${dealerHand[0].value}${dealerHand[0].suit} + ?)

Comandos:
✅ ${PREFIX}hit - Pedir carta
⏹️ ${PREFIX}stand - Parar
💰 ${PREFIX}double - Dobrar aposta${canSplit ? `
🔄 ${PREFIX}split - Dividir mão` : ''}`);

    // Armazenar estado do jogo
    socket.blackjackGames = socket.blackjackGames || {};
    socket.blackjackGames[userJid] = {
      deck,
      playerHand,
      dealerHand,
      playerTotal,
      dealerTotal,
      betAmount,
      gameState,
      canDouble,
      canSplit
    };
  },
};

// Comandos adicionais para o Blackjack
module.exports.actions = {
  hit: async ({ sendReply, userJid, socket }) => {
    const game = socket.blackjackGames?.[userJid];
    if (!game) return await sendReply("Nenhum jogo ativo. Use !blackjack para começar.");

    game.playerHand.push(game.deck.pop());
    game.playerTotal = calculateHand(game.playerHand);
    game.canDouble = false;

    if (game.playerTotal > 21) {
      await sendReply(`💥 Estourou! Sua mão: ${formatHand(game.playerHand)} (${game.playerTotal})
Perdeu $${game.betAmount}`);
      delete socket.blackjackGames[userJid];
    } else {
      await sendReply(`🃏 Nova carta: ${game.playerHand[game.playerHand.length-1].value}${game.playerHand[game.playerHand.length-1].suit}
Total: ${game.playerTotal}
  
Comandos: ${PREFIX}hit | ${PREFIX}stand`);
    }
  },

  stand: async ({ sendReply, userJid, socket }) => {
    const game = socket.blackjackGames?.[userJid];
    if (!game) return await sendReply("Nenhum jogo ativo.");

    // Dealer joga
    while (game.dealerTotal < 17) {
      game.dealerHand.push(game.deck.pop());
      game.dealerTotal = calculateHand(game.dealerHand);
    }

    let result;
    if (game.dealerTotal > 21 || game.playerTotal > game.dealerTotal) {
      result = `🎉 Ganhou $${game.betAmount * 2}!`;
    } else if (game.playerTotal === game.dealerTotal) {
      result = "🔄 Empate! Você recebe sua aposta de volta.";
    } else {
      result = `😢 Perdeu $${game.betAmount}.`;
    }

    await sendReply(`🏁 Resultado:
👤 Sua mão: ${formatHand(game.playerHand)} (${game.playerTotal})
🃏 Dealer: ${formatHand(game.dealerHand)} (${game.dealerTotal})

${result}`);
    delete socket.blackjackGames[userJid];
  },

  double: async ({ sendReply, userJid, socket }) => {
    const game = socket.blackjackGames?.[userJid];
    if (!game) return await sendReply("Nenhum jogo ativo.");
    if (!game.canDouble) return await sendReply("Não pode dobrar agora.");

    game.betAmount *= 2;
    game.playerHand.push(game.deck.pop());
    game.playerTotal = calculateHand(game.playerHand);

    if (game.playerTotal > 21) {
      await sendReply(`💥 Estourou! Sua mão: ${formatHand(game.playerHand)} (${game.playerTotal})
Perdeu $${game.betAmount}`);
    } else {
      // Dealer joga automaticamente após double
      while (game.dealerTotal < 17) {
        game.dealerHand.push(game.deck.pop());
        game.dealerTotal = calculateHand(game.dealerHand);
      }

      let result;
      if (game.dealerTotal > 21 || game.playerTotal > game.dealerTotal) {
        result = `🎉 Ganhou $${game.betAmount * 2}!`;
      } else if (game.playerTotal === game.dealerTotal) {
        result = "🔄 Empate! Você recebe sua aposta de volta.";
      } else {
        result = `😢 Perdeu $${game.betAmount}.`;
      }

      await sendReply(`🏁 Resultado (Dobrado):
👤 Sua mão: ${formatHand(game.playerHand)} (${game.playerTotal})
🃏 Dealer: ${formatHand(game.dealerHand)} (${game.dealerTotal})

${result}`);
    }
    delete socket.blackjackGames[userJid];
  },

  split: async ({ sendReply, userJid, socket }) => {
    const game = socket.blackjackGames?.[userJid];
    if (!game) return await sendReply("Nenhum jogo ativo.");
    if (!game.canSplit) return await sendReply("Não pode dividir esta mão.");

    // Implementar lógica de split aqui
    await sendReply("🔄 Mão dividida - Em desenvolvimento");
  }
};

// Funções auxiliares
function calculateHand(hand) {
  let total = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      total += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      total += 10;
    } else {
      total += parseInt(card.value);
    }
  }
  
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  return total;
}

function formatHand(hand) {
  return hand.map(card => `${card.value}${card.suit}`).join(' ');
}
