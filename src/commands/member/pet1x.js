const { PREFIX } = require(`${BASE_DIR}/config`);
const fs = require('fs');
const path = require('path');

// Caminho do arquivo de salvamento
const PETS_DATA_PATH = path.join(BASE_DIR, 'pets_data.json');

// Carregar dados salvos
let petsData = {};
try {
  if (fs.existsSync(PETS_DATA_PATH)) {
    petsData = JSON.parse(fs.readFileSync(PETS_DATA_PATH, 'utf8'));
  }
} catch (error) {
  console.error('Erro ao carregar dados dos pets:', error);
}

// Sistema de batalha de pets
module.exports = {
  name: "petx1",
  description: "⚔️ Desafia alguém para um X1 de pets",
  commands: ["petx1", "x1pet", "batalhapet", "duelopet"],
  usage: `${PREFIX}petx1 @usuário`,
  cooldown: 30,

  handle: async ({ sendReply, sendText, userJid, args, mentionedJid, senderName, client }) => {
    const userId = userJid.replace(/@.+/, "");
    
    // Verificar se mencionou alguém
    if (!mentionedJid || mentionedJid.length === 0) {
      return sendReply(
        `❌ *${senderName}*, você precisa mencionar alguém para desafiar!\n` +
        `Exemplo: *${PREFIX}petx1 @amigo*`,
        [userJid]
      );
    }
    
    const opponentJid = mentionedJid[0];
    const opponentId = opponentJid.replace(/@.+/, "");
    
    // Verificar se não está se desafiando
    if (opponentId === userId) {
      return sendReply(
        `🤦 *${senderName}*, você não pode desafiar a si mesmo!\n` +
        `Tente desafiar alguém de verdade!`,
        [userJid]
      );
    }
    
    // Verificar se ambos têm pets
    if (!petsData[userId] || petsData[userId].pets.length === 0) {
      return sendReply(
        `❌ *${senderName}*, você não possui pets para batalhar!\n` +
        `Use *${PREFIX}pet* para adquirir pets primeiro.`,
        [userJid]
      );
    }
    
    if (!petsData[opponentId] || petsData[opponentId].pets.length === 0) {
      return sendReply(
        `❌ *${senderName}*, essa pessoa não possui pets para batalhar!`,
        [userJid]
      );
    }
    
    // Obter os pets mais raros de cada um
    const userPets = petsData[userId].pets;
    const opponentPets = petsData[opponentId].pets;
    
    // Ordenar pets por raridade (nível mais alto primeiro)
    userPets.sort((a, b) => b.nivel - a.nivel || a.nome.localeCompare(b.nome));
    opponentPets.sort((a, b) => b.nivel - a.nivel || a.nome.localeCompare(b.nome));
    
    const userPet = userPets[0];
    const opponentPet = opponentPets[0];
    
    // Calcular poder baseado na raridade e nível
    const rarityPower = {
      "Comum": 1, "Raro": 2, "Épico": 3, 
      "Lendário": 4, "Deus": 5, "Brainrot": 6, "Supremo": 10
    };
    
    const userPower = rarityPower[userPet.raridade] * userPet.nivel * (0.8 + Math.random() * 0.4);
    const opponentPower = rarityPower[opponentPet.raridade] * opponentPet.nivel * (0.8 + Math.random() * 0.4);
    
    // Determinar vencedor
    let winner, loser, winnerPet, loserPet, winnerPower, loserPower;
    
    if (userPower > opponentPower) {
      winner = userId;
      loser = opponentId;
      winnerPet = userPet;
      loserPet = opponentPet;
      winnerPower = userPower;
      loserPower = opponentPower;
    } else if (opponentPower > userPower) {
      winner = opponentId;
      loser = userId;
      winnerPet = opponentPet;
      loserPet = userPet;
      winnerPower = opponentPower;
      loserPower = userPower;
    } else {
      // Empate - decidir aleatoriamente
      const randomWinner = Math.random() > 0.5 ? userId : opponentId;
      winner = randomWinner;
      loser = randomWinner === userId ? opponentId : userId;
      winnerPet = randomWinner === userId ? userPet : opponentPet;
      loserPet = randomWinner === userId ? opponentPet : userPet;
      winnerPower = userPower;
      loserPower = opponentPower;
    }
    
    // Mensagens de batalha dinâmicas
    const battleMessages = [
      `⚡ *${winnerPet.nome}* lança um ataque relâmpago!`,
      `🔥 *${winnerPet.nome}* solta uma rajada de fogo!`,
      `❄️ *${winnerPet.nome}* congela o oponente com um sopro gélido!`,
      `💫 *${winnerPet.nome}* usa um poder cósmico!`,
      `🌪️ *${winnerPet.nome}* cria um tornado devastador!`,
      `⚔️ *${winnerPet.nome}* avança com um ataque preciso!`,
      `✨ *${winnerPet.nome}* libera energia mágica!`,
      `🌌 *${winnerPet.nome}* distorce a realidade ao redor!`,
      `💥 *${winnerPet.nome}* executa um golpe crítico!`,
      `🌀 *${winnerPet.nome}* absorve a energia do oponente!`
    ];
    
    const defenseMessages = [
      `🛡️ *${loserPet.nome}* tenta se defender...`,
      `💨 *${loserPet.nome}* esquiva rapidamente...`,
      `🌊 *${loserPet.nome}* cria uma barreira de água...`,
      `🪨 *${loserPet.nome}* se protege atrás de rochas...`,
      `🌳 *${loserPet.nome}* busca cobertura...`,
      `⚡ *${loserPet.nome}* tenta contra-atacar...`,
      `🔮 *${loserPet.nome}* conjura um escudo mágico...`,
      `💫 *${loserPet.nome}* teleporta para evitar o golpe...`,
      `🌙 *${loserPet.nome}* usa poderes lunares para se proteger...`,
      `🔄 *${loserPet.nome}* tenta redirecionar o ataque...`
    ];
    
    const resultMessages = [
      `🎯 O ataque foi super efetivo!`,
      `💣 Dano crítico!`,
      `⭐ Ataque perfeito!`,
      `🎖️ Golpe magistral!`,
      `🏹 Flecha certeira!`,
      `🧨 Explosão devastadora!`,
      `⚡ Eletrocutou o oponente!`,
      `🔥 Queimadura grave!`,
      `❄️ Congelamento completo!`,
      `🌪️ Redemoinho arrasador!`
    ];
    
    const finalMessages = [
      `🏆 Vitória esmagadora!`,
      `🎖️ Batalha épica decidida!`,
      `⭐ Combate lendário!`,
      `👑 Demonstração de superioridade!`,
      `💎 Exibição de poder absoluto!`,
      `🌠 performance incrível!`,
      `🚀 Dominância total!`,
      `✨ show de habilidades!`,
      `⚡ prova de força!`,
      `🔥 exibição arrasadora!`
    ];
    
    // Selecionar mensagens aleatórias
    const battleMessage = battleMessages[Math.floor(Math.random() * battleMessages.length)];
    const defenseMessage = defenseMessages[Math.floor(Math.random() * defenseMessages.length)];
    const resultMessage = resultMessages[Math.floor(Math.random() * resultMessages.length)];
    const finalMessage = finalMessages[Math.floor(Math.random() * finalMessages.length)];
    
    // Determinar diferença de poder
    const powerDifference = Math.abs(winnerPower - loserPower);
    let dominanceLevel = "";
    
    if (powerDifference < 5) {
      dominanceLevel = "Vitória por pouco! Foi quase um empate!";
    } else if (powerDifference < 15) {
      dominanceLevel = "Vitória convincente! Boa batalha!";
    } else if (powerDifference < 30) {
      dominanceLevel = "Vitória dominante! Superioridade clara!";
    } else {
      dominanceLevel = "Vitória arrasadora! Dominância total!";
    }
    
    // Criar mensagem de batalha
    const battleAnnouncement = 
      `⚔️ *DESAFIO DE PETS - X1* ⚔️\n\n` +
      `🧙 *Desafiante:* ${senderName}\n` +
      `⚡ *Desafiado:* @${opponentId}\n\n` +
      `🌅 *A batalha começa!*\n\n` +
      `${winnerPet.emoji} *${winnerPet.nome}* (${winnerPet.raridade}) VS ${loserPet.emoji} *${loserPet.nome}* (${loserPet.raridade})\n\n` +
      `🎯 *Round 1:*\n${battleMessage}\n` +
      `🛡️ *Reação:*\n${defenseMessage}\n` +
      `💥 *Resultado:*\n${resultMessage}\n\n` +
      `📊 *Poder do ataque:* ${winnerPower.toFixed(1)} VS ${loserPower.toFixed(1)}\n\n` +
      `🏁 *Resultado final:*\n${finalMessage}\n` +
      `🎖️ *Vencedor:* @${winner.replace(/@.+/, "")} com ${winnerPet.emoji} *${winnerPet.nome}*\n` +
      `📈 *Dominância:* ${dominanceLevel}\n\n` +
      `🔥 *${winnerPet.nome}* demonstrou superioridade ${winnerPower > loserPower * 1.5 ? "absoluta" : "inquestionável"}!\n` +
      `💎 *Dica:* Pets mais raros têm mais chances de vencer!`;
    
    // Enviar mensagem de batalha
    await sendReply(
      battleAnnouncement,
      [userJid, opponentJid],
      winner === userId ? "#00FF00" : "#FF0000"
    );
    
    // Adicionar estatísticas de batalha
    if (!petsData[winner].battles) {
      petsData[winner].battles = { wins: 0, losses: 0 };
    }
    if (!petsData[loser].battles) {
      petsData[loser].battles = { wins: 0, losses: 0 };
    }
    
    petsData[winner].battles.wins = (petsData[winner].battles.wins || 0) + 1;
    petsData[loser].battles.losses = (petsData[loser].battles.losses || 0) + 1;
    
    // Salvar dados
    try {
      fs.writeFileSync(PETS_DATA_PATH, JSON.stringify(petsData, null, 2));
    } catch (error) {
      console.error('Erro ao salvar dados da batalha:', error);
    }
  },
};
