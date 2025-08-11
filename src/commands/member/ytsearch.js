// src/commands/member/ytsearch.js
const axios = require('axios');
const { YOUTUBE_API_KEY } = require('../../config');
const { sendReply } = require('../../utils/loadCommonFunctions');

module.exports = {
  name: "ytsearch",
  description: "Busca vídeos no YouTube",
  commands: ["ytsearch", "youtubesearch", "buscarvideo"],
  usage: `${PREFIX}ytsearch <termo de busca>`,
  handle: async ({ args, sendWaitReply, sendSuccessReact }) => {
    if (!args.length) {
      await sendReply("Por favor, digite o que deseja buscar no YouTube.");
      return;
    }

    const query = args.join(" ");
    await sendWaitReply(`Buscando "${query}" no YouTube...`);

    try {
      // Busca vídeos no YouTube
      const searchResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video`
      );

      if (!searchResponse.data.items.length) {
        await sendReply("Nenhum resultado encontrado para sua busca.");
        return;
      }

      // Formata os resultados
      let resultsMessage = `🔍 *Resultados para "${query}"*\n\n`;
      searchResponse.data.items.forEach((item, index) => {
        resultsMessage += `${index + 1}. *${item.snippet.title}*\n`;
        resultsMessage += `   📺 ${item.snippet.channelTitle}\n`;
        resultsMessage += `   🔗 https://youtu.be/${item.id.videoId}\n\n`;
      });

      resultsMessage += `Use /tocar ou /video com o número do resultado para reproduzir.`;

      await sendReply(resultsMessage);
      await sendSuccessReact();
    } catch (error) {
      console.error("Erro ao buscar vídeos:", error);
      await sendReply("Ocorreu um erro ao buscar vídeos. Tente novamente mais tarde.");
    }
  },
};