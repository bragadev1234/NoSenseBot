// meme.js
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "meme",
  description: "Mostra um meme aleatório",
  commands: ["meme", "memes"],
  usage: `${PREFIX}meme`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("😆");
    
    try {
      const response = await axios.get('https://meme-api.com/gimme');
      
      if (response.data && response.data.url) {
        await sendReply(`😆 *MEME* 😆
        
Título: ${response.data.title}
Subreddit: ${response.data.subreddit}`);
        
        await sendImageFromURL(response.data.url, `Meme: ${response.data.title}`);
      } else {
        await sendErrorReply("Erro ao carregar meme!");
      }
    } catch (error) {
      await sendErrorReply("Erro ao buscar meme. Tentando alternativa...");
      
      // Fallback
      try {
        const gifResponse = await axios.get('https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=meme');
        
        if (gifResponse.data.data.images) {
          const gifUrl = gifResponse.data.data.images.original.url;
          await sendReply("😆 MEME ALEATÓRIO 😆");
          await sendImageFromURL(gifUrl, "Meme aleatório");
        }
      } catch (fallbackError) {
        await sendErrorReply("Erro ao buscar meme.");
      }
    }
  },
};