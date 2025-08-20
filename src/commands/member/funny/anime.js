// anime.js
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "anime",
  description: "Busca informações sobre um anime",
  commands: ["anime", "animeinfo"],
  usage: `${PREFIX}anime <nome do anime>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, args }) => {
    await sendReact("🎌");
    
    if (!args || args.length === 0) {
      return sendErrorReply("Digite o nome de um anime! Ex: /anime Naruto");
    }
    
    const animeName = args.join(" ");
    
    try {
      const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
      
      if (response.data.data && response.data.data.length > 0) {
        const anime = response.data.data[0];
        await sendReply(`🎌 *${anime.title}*
        
📺 Episódios: ${anime.episodes || "Desconhecido"}
⭐ Nota: ${anime.score || "N/A"}
📆 Status: ${anime.status}
        
${anime.synopsis ? anime.synopsis.substring(0, 200) + "..." : "Sem sinopse disponível"}`);
        
        if (anime.images.jpg.image_url) {
          await sendImageFromURL(anime.images.jpg.image_url, `Capa: ${anime.title}`);
        }
      } else {
        await sendErrorReply("Anime não encontrado!");
      }
    } catch (error) {
      await sendErrorReply("Erro ao buscar informações do anime.");
    }
  },
};