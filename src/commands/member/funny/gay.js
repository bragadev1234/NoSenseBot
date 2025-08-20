// gay.js - Comando atualizado
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "gay",
  description: "Descobre o quanto alguém é gay",
  commands: ["gay", "gaymeter", "viado"],
  usage: `${PREFIX}gay @pessoa`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, mentionedJid, userJid }) => {
    await sendReact("🌈");
    
    const targetJid = mentionedJid && mentionedJid.length > 0 ? mentionedJid[0] : userJid;
    const targetNumber = targetJid.split("@")[0];
    
    // Números especiais que sempre dão 0%
    const specialNumbers = ["559984271816", "9984271816"];
    
    let percentage;
    
    if (specialNumbers.includes(targetNumber)) {
      percentage = 0; // Sempre 0% para números especiais
    } else {
      // Cálculo baseado no número (sempre o mesmo resultado para a mesma pessoa)
      const seed = parseInt(targetNumber.slice(-4));
      percentage = Math.abs(seed % 101);
    }
    
    // Buscar GIF apropriado
    let gifTag = "lgbt";
    if (percentage === 0) gifTag = "macho";
    if (percentage > 50) gifTag = "gay pride";
    
    try {
      const gifResponse = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${gifTag}`);
      
      await sendReply(`🌈 *TESTE DE GAYMETRO* 🌈
      
${targetNumber} é ${percentage}% gay!

${generateGayMessage(percentage)}`);

      if (gifResponse.data.data.images) {
        const gifUrl = gifResponse.data.data.images.original.url;
        await sendImageFromURL(gifUrl, `${percentage}% gay`);
      }
    } catch (error) {
      await sendReply(`🌈 *TESTE DE GAYMETRO* 🌈
      
${targetNumber} é ${percentage}% gay!

${generateGayMessage(percentage)}`);
    }
  },
};

function generateGayMessage(percentage) {
  if (percentage === 0) return "🏳️‍🌈 Hétero absoluto! Nem um pingo de gay!";
  if (percentage <= 20) return "😎 Quase hétero, só uns deslizes pequenos!";
  if (percentage <= 40) return "🤔 Tem um pouquinho de curiosidade...";
  if (percentage <= 60) return "🧐 Meio termo! Nem hétero, nem gay!";
  if (percentage <= 80) return "😏 Tá mais pra gay do que pra hétero!";
  if (percentage <= 99) return "🏳️‍🌈 Quase 100% gay! Só falta assumir!";
  return "🏳️‍🌈⭐ 100% GAY! Orgulho LGBTQIA+! ⭐🏳️‍🌈";
}