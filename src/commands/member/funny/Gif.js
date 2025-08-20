// gif.js - Comando base para buscar GIFs
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "gif",
  description: "Busca um GIF pelo termo especificado",
  commands: ["gif"],
  usage: `${PREFIX}gif <termo>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, args }) => {
    await sendReact("🎬");
    
    if (!args || args.length === 0) {
      return sendErrorReply("Digite o termo para buscar o GIF! Ex: /gif anime feliz");
    }
    
    const searchTerm = args.join(" ");
    
    try {
      // API pública do Giphy sem necessidade de chave
      const response = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${encodeURIComponent(searchTerm)}`);
      
      if (response.data.data.images) {
        const gifUrl = response.data.data.images.original.url;
        await sendReply(`🔍 GIF para: ${searchTerm}`);
        await sendImageFromURL(gifUrl, `GIF: ${searchTerm}`);
      } else {
        await sendErrorReply("Nenhum GIF encontrado para: " + searchTerm);
      }
    } catch (error) {
      await sendErrorReply("Erro ao buscar GIF. Tentando alternativa...");
      
      // Fallback para API alternativa
      try {
        const tenorResponse = await axios.get(`https://g.tenor.com/v1/random?q=${encodeURIComponent(searchTerm)}&key=LIVDSRZULELA&limit=1`);
        
        if (tenorResponse.data.results.length > 0) {
          const gifUrl = tenorResponse.data.results[0].media[0].gif.url;
          await sendReply(`🔍 GIF para: ${searchTerm}`);
          await sendImageFromURL(gifUrl, `GIF: ${searchTerm}`);
        } else {
          await sendErrorReply("Nenhum GIF encontrado para: " + searchTerm);
        }
      } catch (fallbackError) {
        await sendErrorReply("Erro ao buscar GIF. Tente outro termo.");
      }
    }
  },
};