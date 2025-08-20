// shipar.js - Comando atualizado
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "shipar",
  description: "Calcula a compatibilidade entre duas pessoas",
  commands: ["shipar", "ship", "navio"],
  usage: `${PREFIX}shipar @pessoa1 @pessoa2`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, mentionedJid, userJid }) => {
    await sendReact("💘");
    
    if (!mentionedJid || mentionedJid.length < 2) {
      return sendErrorReply("Você precisa mencionar duas pessoas! Ex: /shipar @fulano @ciclano");
    }
    
    const person1 = mentionedJid[0];
    const person2 = mentionedJid[1];
    
    // Números especiais que sempre dão 100%
    const specialNumbers = ["559984271816", "9984271816"];
    const person1Number = person1.split("@")[0];
    const person2Number = person2.split("@")[0];
    
    let compatibility;
    
    // Se um dos números for especial, sempre 100%
    if (specialNumbers.includes(person1Number) || specialNumbers.includes(person2Number)) {
      compatibility = 100;
    } else {
      // Cálculo baseado nos números (sempre o mesmo resultado para as mesmas pessoas)
      const seed = parseInt(person1Number.slice(-4)) + parseInt(person2Number.slice(-4));
      compatibility = Math.abs(seed % 101);
    }
    
    const shipName = person1Number.slice(0, 3) + person2Number.slice(-3);
    
    // Buscar GIF romântico baseado na compatibilidade
    let gifTag = "love";
    if (compatibility >= 80) gifTag = "romantic kiss";
    if (compatibility <= 20) gifTag = "breakup";
    
    try {
      const gifResponse = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${gifTag}`);
      
      await sendReply(`💖 *SHIPPERANDO* 💖
      
${person1.split("@")[0]} ❤️ ${person2.split("@")[0]}

Nome do casal: ${shipName}
Compatibilidade: ${compatibility}%

${generateCompatibilityMessage(compatibility)}`);

      if (gifResponse.data.data.images) {
        const gifUrl = gifResponse.data.data.images.original.url;
        await sendImageFromURL(gifUrl, `Compatibilidade: ${compatibility}%`);
      }
    } catch (error) {
      await sendReply(`💖 *SHIPPERANDO* 💖
      
${person1.split("@")[0]} ❤️ ${person2.split("@")[0]}

Nome do casal: ${shipName}
Compatibilidade: ${compatibility}%

${generateCompatibilityMessage(compatibility)}`);
    }
  },
};

function generateCompatibilityMessage(percentage) {
  if (percentage === 100) return "💘 ALMA GÊMEAS! Um amor destinado a durar para sempre! 💘";
  if (percentage >= 90) return "💕 Casal perfeito! Que romance lindo!";
  if (percentage >= 70) return "😍 Grande potencial! Um futuro brilhante juntos!";
  if (percentage >= 50) return "🤔 Dá pra tentar, mas vai precisar de esforço!";
  if (percentage >= 30) return "😬 Melhor continuarem só na amizade...";
  return "💀 Esquece! Isso nunca vai dar certo!";
}