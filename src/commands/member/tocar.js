// src/commands/member/tocar.js
const axios = require('axios');
const { YOUTUBE_API_KEY } = require('../../config');
const { sendAudioFromURL, sendImageFromURL, sendReply } = require('../../utils/loadCommonFunctions');
const path = require('node:path');

module.exports = {
  name: "tocar",
  description: "Toca uma música do YouTube",
  commands: ["tocar", "play", "toca"],
  usage: `${PREFIX}tocar <nome da música>`,
  handle: async ({ args, sendWaitReply, sendSuccessReact }) => {
    if (!args.length) {
      await sendReply("Por favor, digite o nome da música que deseja tocar.");
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
      const thumbUrl = video.snippet.thumbnails.high.url;

      // Envia a thumb e informações do vídeo
      await sendImageFromURL(
        thumbUrl,
        `🎵 *${title}*\n📺 Canal: ${channel}\n🔗 https://youtu.be/${videoId}`
      );

      // Envia o áudio (usando um serviço externo para converter)
      const audioUrl = `https://ytmp3.cx/@api/button/mp3/${videoId}`;
      await sendAudioFromURL(audioUrl);

      await sendSuccessReact();
    } catch (error) {
      console.error("Erro ao buscar música:", error);
      await sendReply("Ocorreu um erro ao buscar a música. Tente novamente mais tarde.");
    }
  },
};