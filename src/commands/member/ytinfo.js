// src/commands/member/ytinfo.js
const axios = require('axios');
const { YOUTUBE_API_KEY } = require('../../config');
const { sendImageFromURL, sendReply } = require('../../utils/loadCommonFunctions');

module.exports = {
  name: "ytinfo",
  description: "Mostra informações detalhadas sobre um vídeo do YouTube",
  commands: ["ytinfo", "videoinfo", "infovid"],
  usage: `${PREFIX}ytinfo <URL ou ID do vídeo>`,
  handle: async ({ args, sendWaitReply, sendSuccessReact }) => {
    if (!args.length) {
      await sendReply("Por favor, forneça a URL ou ID do vídeo do YouTube.");
      return;
    }

    let videoId = args[0];
    
    // Extrai o ID da URL se for uma URL completa
    if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) {
      const match = videoId.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|youtu\.be\/)([^"&?\/\s]{11})/);
      videoId = match ? match[1] : videoId;
    }

    await sendWaitReply(`Obtendo informações do vídeo...`);

    try {
      // Busca detalhes do vídeo
      const videoResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );

      if (!videoResponse.data.items.length) {
        await sendReply("Vídeo não encontrado. Verifique a URL ou ID.");
        return;
      }

      const video = videoResponse.data.items[0];
      const title = video.snippet.title;
      const channel = video.snippet.channelTitle;
      const views = video.statistics.viewCount;
      const likes = video.statistics.likeCount;
      const duration = video.contentDetails.duration.replace(/PT|H|M|S/g, match => {
        if (match === 'PT') return '';
        if (match === 'H') return 'h ';
        if (match === 'M') return 'm ';
        if (match === 'S') return 's';
      }).trim();
      const thumbUrl = video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url;
      const description = video.snippet.description.substring(0, 200) + (video.snippet.description.length > 200 ? "..." : "");

      // Formata a mensagem com as informações
      const infoMessage = `
🎬 *${title}*
📺 *Canal:* ${channel}
⏱ *Duração:* ${duration}
👀 *Views:* ${Number(views).toLocaleString()}
👍 *Likes:* ${Number(likes).toLocaleString()}
📅 *Publicado em:* ${new Date(video.snippet.publishedAt).toLocaleDateString()}
📝 *Descrição:* ${description}
🔗 *Link:* https://youtu.be/${videoId}
      `;

      // Envia a thumb e informações do vídeo
      await sendImageFromURL(thumbUrl, infoMessage);

      await sendSuccessReact();
    } catch (error) {
      console.error("Erro ao buscar informações do vídeo:", error);
      await sendReply("Ocorreu um erro ao buscar as informações do vídeo. Verifique a URL ou tente novamente mais tarde.");
    }
  },
};