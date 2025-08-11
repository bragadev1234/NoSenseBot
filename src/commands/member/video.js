// src/commands/member/video.js
const axios = require('axios');
const { YOUTUBE_API_KEY } = require('../../config');
const { sendVideoFromURL, sendImageFromURL, sendReply } = require('../../utils/loadCommonFunctions');

module.exports = {
  name: "video",
  description: "Busca e envia um vídeo do YouTube",
  commands: ["video", "vid", "ytvideo"],
  usage: `${PREFIX}video <nome do vídeo>`,
  handle: async ({ args, sendWaitReply, sendSuccessReact }) => {
    if (!args.length) {
      await sendReply("Por favor, digite o nome do vídeo que deseja buscar.");
      return;
    }

    const query = args.join(" ");
    await sendWaitReply(`Buscando "${query}" no YouTube...`);

    try {
      // Busca o vídeo no YouTube
      const searchResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video`
      );

      if (!searchResponse.data.items.length) {
        await sendReply("Nenhum resultado encontrado para sua busca.");
        return;
      }

      const video = searchResponse.data.items[0];
      const videoId = video.id.videoId;
      const title = video.snippet.title;
      const channel = video.snippet.channelTitle;
      const views = video.statistics?.viewCount || "N/A";
      const likes = video.statistics?.likeCount || "N/A";
      const thumbUrl = video.snippet.thumbnails.high.url;

      // Envia a thumb e informações do vídeo
      await sendImageFromURL(
        thumbUrl,
        `🎬 *${title}*\n📺 Canal: ${channel}\n👀 Views: ${views}\n👍 Likes: ${likes}\n🔗 https://youtu.be/${videoId}`
      );

      // Envia o link direto do vídeo (poderia usar um serviço de download se preferir)
      await sendReply(`📥 Download: https://yt1s.com/en?q=${videoId}`);

      await sendSuccessReact();
    } catch (error) {
      console.error("Erro ao buscar vídeo:", error);
      await sendReply("Ocorreu um erro ao buscar o vídeo. Tente novamente mais tarde.");
    }
  },
};