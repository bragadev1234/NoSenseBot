// abraco.js - Comando romântico com GIF
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "abraco",
  description: "Manda um abraço para alguém",
  commands: ["abraco2", "abraçar2", "hug2"],
  usage: `${PREFIX}abraco @pessoa`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, mentionedJid, userJid }) => {
    await sendReact("🤗");
    
    const targetJid = mentionedJid && mentionedJid.length > 0 ? mentionedJid[0] : userJid;
    const targetNumber = targetJid.split("@")[0];
    const senderNumber = userJid.split("@")[0];
    
    // Números especiais
    const specialNumbers = ["559984271816", "9984271816"];
    
    let mensagem;
    
    if (specialNumbers.includes(targetNumber)) {
      mensagem = `🤗 *ABRAÇO ESPECIAL* 🤗
      
${senderNumber} mandou um abraço super especial para ${targetNumber}!

💖 Este abraço é carregado de carinho e afeto! 🤗`;
    } else {
      mensagem = `🤗 *ABRAÇO* 🤗
      
${senderNumber} mandou um abraço para ${targetNumber}!

🫂 Abraço apertado!`;
    }
    
    try {
      const gifResponse = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=hug`);
      
      await sendReply(mensagem);

      if (gifResponse.data.data.images) {
        const gifUrl = gifResponse.data.data.images.original.url;
        await sendImageFromURL(gifUrl, "Abraço");
      }
    } catch (error) {
      await sendReply(mensagem);
    }
  },
};