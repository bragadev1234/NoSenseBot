// beleza.js - Comando atualizado
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "beleza",
  description: "Mede o nível de beleza de alguém",
  commands: ["beleza", "lindo", "gato", "gata", "feio"],
  usage: `${PREFIX}beleza @pessoa`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, mentionedJid, userJid }) => {
    await sendReact("✨");
    
    const targetJid = mentionedJid && mentionedJid.length > 0 ? mentionedJid[0] : userJid;
    const targetNumber = targetJid.split("@")[0];
    
    // Números especiais que sempre dão 100%
    const specialNumbers = ["559984271816", "9984271816"];
    
    let percentage;
    
    if (specialNumbers.includes(targetNumber)) {
      percentage = 100; // Sempre 100% para números especiais
    } else {
      // Cálculo baseado no número (sempre o mesmo resultado para a mesma pessoa)
      const seed = parseInt(targetNumber.slice(-4));
      percentage = Math.abs(seed % 101);
    }
    
    // Buscar GIF apropriado
    let gifTag = "beautiful";
    if (percentage >= 80) gifTag = "beautiful";
    if (percentage <= 30) gifTag = "ugly";
    
    try {
      const gifResponse = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${gifTag}`);
      
      await sendReply(`✨ *TESTE DE BELEZA* ✨
      
${targetNumber} é ${percentage}% lindo(a)!

${generateBelezaMessage(percentage)}`);

      if (gifResponse.data.data.images) {
        const gifUrl = gifResponse.data.data.images.original.url;
        await sendImageFromURL(gifUrl, `${percentage}% de beleza`);
      }
    } catch (error) {
      await sendReply(`✨ *TESTE DE BELEZA* ✨
      
${targetNumber} é ${percentage}% lindo(a)!

${generateBelezaMessage(percentage)}`);
    }
  },
};

function generateBelezaMessage(percentage) {
  if (percentage === 100) return "💫 PERFEIÇÃO ABSOLUTA! A pessoa mais linda do universo! 💫";
  if (percentage >= 90) return "😍 Que pessoa maravilhosa! Deslumbrante!";
  if (percentage >= 70) return "🥰 Muito bonito(a)! Chama atenção por onde passa!";
  if (percentage >= 50) return "😊 Bonito(a)! Tem seu charme!";
  if (percentage >= 30) return "🙂 Na média! Nem feio(a), nem bonito(a)!";
  if (percentage >= 10) return "😬 Precisa melhorar um pouquinho...";
  return "💀 Feio(a) pra caramba! Melhor usar uma sacola na cabeça!";
}