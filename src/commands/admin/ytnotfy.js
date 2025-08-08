const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

// Configuração global
const YOUTUBE_API_KEY = "AIzaSyCZ9KNXMf-A716KI2_rRQvyngw0fu3CP60";
const CHANNELS = {
    "ArthurDev": "@oultimoarthur"
};

// Arquivo de persistência
const STORAGE_FILE = path.join(__dirname, 'yt.json');

// Armazenamento em memória
const groupSubscriptions = new Map();
let lastVideoData = null;

// Carrega dados persistentes
function loadPersistentData() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const rawData = fs.readFileSync(STORAGE_FILE, 'utf8');
            const data = JSON.parse(rawData);
            
            if (data.groupSubscriptions) {
                Object.entries(data.groupSubscriptions).forEach(([key, value]) => {
                    groupSubscriptions.set(key, {
                        intervalSeconds: value.intervalSeconds
                    });
                });
            }
        }
    } catch (error) {
        console.error("Erro ao carregar dados persistentes:", error);
    }
}

loadPersistentData();

// Função para salvar dados
async function savePersistentData() {
    try {
        const dataToSave = {
            groupSubscriptions: {}
        };

        groupSubscriptions.forEach((value, key) => {
            dataToSave.groupSubscriptions[key] = {
                intervalSeconds: value.intervalSeconds
            };
        });

        fs.writeFileSync(STORAGE_FILE, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
        console.error("Erro ao salvar dados persistentes:", error);
    }
}

// Template de mensagem grande único
const FULL_MESSAGE_TEMPLATE = `
🎬 *NOVO VÍDEO DO {channel_name}* 🎬

📌 *{video_title}*

📅 *Data de Publicação:* {publish_date}
⏱️ *Duração:* {video_duration}
👀 *Visualizações:* {view_count}
👍 *Curtidas:* {like_count}
💬 *Comentários:* {comment_count}

📝 *Descrição Completa:*
{video_description}

🔗 *Assista agora:* {video_url}

📢 *Apoie o canal:*
- Deixe seu like 👍
- Comente sua opinião 💬
- Compartilhe com amigos 🔄
- Ative as notificações 🔔

#NovoVideo #ArthurDev #YouTube
`;

module.exports = {
  name: "yton",
  description: "Ativa notificações do canal do Arthur para este grupo",
  commands: ["yton", "ytnotify", "arthurnotify", "ytalert"],
  usage: `${PREFIX}yton [intervalo_em_minutos]`,
  
  handle: async ({ 
    args, 
    remoteJid, 
    sendText, 
    sendReact,
    socket
  }) => {
    await sendReact("⏳");
    
    if (!remoteJid.endsWith('@g.us')) {
      await sendText("❌ *Este comando só funciona em grupos!*");
      return;
    }
    
    // Parar notificações se já estiverem ativas
    if (groupSubscriptions.has(remoteJid)) {
        const subscription = groupSubscriptions.get(remoteJid);
        if (subscription.intervalId) {
            clearInterval(subscription.intervalId);
        }
        groupSubscriptions.delete(remoteJid);
        await savePersistentData();
        await sendText(
          "🔴 *Notificações desativadas!*\n" +
          "As notificações de novos vídeos foram desligadas.\n" +
          `Use *${PREFIX}yton* para ativar novamente.`
        );
        return;
    }
    
    // Configurar intervalo (sem limites)
    const intervalMinutes = args[0] ? parseFloat(args[0]) : 10;
    
    if (isNaN(intervalMinutes) || intervalMinutes <= 0) {
      await sendText(
        "❌ *Intervalo inválido!*\n" +
        `Use um número positivo em minutos. Ex: *${PREFIX}yton 5.5* (5 minutos e 30 segundos)`
      );
      return;
    }
    
    const intervalSeconds = intervalMinutes * 60;
    
    // Iniciar verificação periódica
    const intervalId = setInterval(() => checkNewVideos(socket, remoteJid), intervalSeconds * 1000);
    groupSubscriptions.set(remoteJid, {
        intervalId,
        intervalSeconds,
        lastCheck: Date.now()
    });
    await savePersistentData();
    
    await sendText(
      `✅ *NOTIFICAÇÕES ATIVADAS COM SUCESSO!*\n\n` +
      `🔔 Verificações a cada: *${intervalMinutes} minutos*\n` +
      `📺 Canal monitorado: *ArthurDev*\n\n` +
      `⚙️ *Configurações ativas:*\n` +
      `- Notificar sempre o último vídeo disponível\n` +
      `- Mensagens completas detalhadas\n` +
      `- Sem menções a participantes\n\n` +
      `🔧 Use *${PREFIX}yton* novamente para desativar\n` +
      `🔄 Atualizações automáticas garantidas!`
    );
    
    await checkNewVideos(socket, remoteJid);
  },
};

async function checkNewVideos(socket, groupJid) {
  try {
    const subscription = groupSubscriptions.get(groupJid);
    if (!subscription) return;

    subscription.lastCheck = Date.now();
    groupSubscriptions.set(groupJid, subscription);

    for (const [name, channelId] of Object.entries(CHANNELS)) {
      const video = await getEnhancedVideoData(channelId);
      if (!video) continue;

      lastVideoData = video;

      // Formatação de data completa
      const publishDate = new Date(video.published_at);
      const formattedDate = publishDate.toLocaleString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo'
      });

      // Prepara os dados para a mensagem
      const messageData = {
          channel_name: video.channel_title,
          video_title: video.title,
          video_duration: video.duration,
          publish_date: formattedDate,
          view_count: video.viewCount ? video.viewCount.toLocaleString('pt-BR') : 'N/A',
          like_count: video.likeCount ? video.likeCount.toLocaleString('pt-BR') : 'N/A',
          comment_count: video.commentCount ? video.commentCount.toLocaleString('pt-BR') : 'N/A',
          video_url: `https://youtu.be/${video.video_id}`,
          video_description: formatDescription(video.description)
      };

      // Aplica os dados ao template
      let message = FULL_MESSAGE_TEMPLATE;
      for (const [key, value] of Object.entries(messageData)) {
          message = message.replace(new RegExp(`{${key}}`, 'g'), value);
      }

      // Baixa a thumbnail em alta qualidade
      let thumbBuffer;
      try {
          const thumbUrl = video.thumbnails.maxres?.url || video.thumbnails.high?.url;
          if (thumbUrl) {
              const thumbResponse = await axios.get(thumbUrl, { 
                  responseType: 'arraybuffer',
                  timeout: 10000
              });
              thumbBuffer = Buffer.from(thumbResponse.data, 'binary');
          }
      } catch (error) {
          console.error("Erro ao baixar thumbnail:", error);
      }

      // Envia a mensagem
      try {
          if (thumbBuffer) {
              await socket.sendMessage(groupJid, {
                  image: thumbBuffer,
                  caption: message.trim()
              });
          } else {
              await socket.sendMessage(groupJid, {
                  text: message.trim()
              });
          }
      } catch (error) {
          console.error("Erro ao enviar mensagem:", error);
      }
    }
  } catch (error) {
    console.error("Erro ao verificar vídeos:", error);
    try {
      await socket.sendMessage(groupJid, {
          text: "⚠️ *Ocorreu um erro ao verificar novos vídeos*\n" +
                "As notificações continuarão funcionando normalmente.\n" +
                "Próxima verificação conforme o intervalo configurado."
      });
    } catch (err) {
      console.error("Erro ao enviar mensagem de erro:", err);
    }
  }
}

// Função para formatar a descrição
function formatDescription(desc) {
    if (!desc) return "Sem descrição disponível";
    
    // Remove URLs longas
    let formatted = desc.replace(/https?:\/\/\S+/g, '[link]');
    
    // Limita o tamanho se for muito grande
    if (formatted.length > 800) {
        formatted = formatted.substring(0, 800) + '...\n[continua no YouTube]';
    }
    
    return formatted;
}

async function getEnhancedVideoData(channelIdentifier) {
  try {
    let channelId = channelIdentifier;
    
    if (channelIdentifier.startsWith("@")) {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/channels`,
        {
          params: {
            key: YOUTUBE_API_KEY,
            forHandle: channelIdentifier,
            part: "id"
          }
        }
      );
      
      if (!response.data?.items?.length) return null;
      channelId = response.data.items[0].id;
    }
    
    // Busca o último vídeo
    const searchResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          key: YOUTUBE_API_KEY,
          channelId,
          part: "snippet",
          maxResults: 1,
          order: "date",
          type: "video"
        }
      }
    );
    
    if (!searchResponse.data?.items?.length) return null;
    const videoId = searchResponse.data.items[0].id.videoId;
    
    // Busca estatísticas detalhadas
    const detailsResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          key: YOUTUBE_API_KEY,
          id: videoId,
          part: "snippet,contentDetails,statistics"
        }
      }
    );
    
    if (!detailsResponse.data?.items?.length) return null;
    
    const snippet = detailsResponse.data.items[0].snippet;
    const contentDetails = detailsResponse.data.items[0].contentDetails;
    const statistics = detailsResponse.data.items[0].statistics;
    
    return {
      video_id: videoId,
      title: snippet.title,
      description: snippet.description || "",
      published_at: snippet.publishedAt,
      channel_title: snippet.channelTitle,
      channel_url: `https://youtube.com/channel/${channelId}`,
      thumbnails: snippet.thumbnails,
      duration: formatDuration(contentDetails.duration),
      viewCount: statistics.viewCount ? parseInt(statistics.viewCount) : null,
      likeCount: statistics.likeCount ? parseInt(statistics.likeCount) : null,
      commentCount: statistics.commentCount ? parseInt(statistics.commentCount) : null
    };
  } catch (error) {
    console.error("Erro ao buscar vídeo:", error);
    return lastVideoData;
  }
}

function formatDuration(isoDuration) {
  if (!isoDuration) return '--';
  
  const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  let hours = matches[1] ? parseInt(matches[1]) : 0;
  let minutes = matches[2] ? parseInt(matches[2]) : 0;
  let seconds = matches[3] ? parseInt(matches[3]) : 0;
  
  let parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ') || '--';
}

function restoreIntervals(socket) {
    groupSubscriptions.forEach((value, key) => {
        if (value.intervalSeconds && !value.intervalId) {
            const intervalId = setInterval(
                () => checkNewVideos(socket, key),
                value.intervalSeconds * 1000
            );
            value.intervalId = intervalId;
            groupSubscriptions.set(key, value);
        }
    });
}

module.exports.restoreIntervals = restoreIntervals;