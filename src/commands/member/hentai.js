const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "hentai",
  description: "Envia uma imagem aleatória de hentai",
  commands: ["hentai", "h"],
  usage: `${PREFIX}hentai`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendImageFromURL, sendReact }) => {
    try {
      await sendReact("🔥");
      
      // API para imagens NSFW (hentai)
      const apiUrl = "https://api.waifu.pics/nsfw/waifu";
      
      await sendReply("🔞 *Procurando uma imagem quente...*");
      
      // Fazer requisição para a API
      const response = await axios.get(apiUrl);
      const imageUrl = response.data.url;
      
      // Enviar a imagem com legenda NSFW
      await sendImageFromURL(
        imageUrl,
        "🔞 *Aqui está sua imagem hentai!*\n\n" +
        "💡 Use com moderação!\n" +
        "⚠️ *Conteúdo adulto - 18+*"
      );
      
    } catch (error) {
      console.error("[HENTAI COMMAND ERROR]", error);
      await sendReply("❌ *Erro ao buscar imagem hentai. Tente novamente.*");
    }
  },
};
