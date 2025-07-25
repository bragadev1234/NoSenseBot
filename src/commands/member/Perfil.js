const { isGroup } = require(`${BASE_DIR}/utils`);
const { errorLog, commandLogger } = require(`${BASE_DIR}/utils/logger`);
const fs = require('fs').promises;
const path = require('path');

const { PREFIX, ASSETS_DIR, CACHE_DIR } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, UserNotInGroupError } = require(`${BASE_DIR}/errors`);
const { getProfileImageData, getStatus } = require(`${BASE_DIR}/services/baileys`);

// Cache de perfis (em memória)
const profileCache = new Map();
const CACHE_EXPIRATION = 1000 * 60 * 30; // 30 minutos

// Helper para formatar datas
const formatDate = (date) => {
  if (!date) return 'Desconhecido';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Helper para calcular tempo no grupo
const calculateGroupTime = (participant) => {
  if (!participant?.date) return 'Desconhecido';
  const joinDate = new Date(participant.date * 1000);
  const diff = Date.now() - joinDate.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `${years} ano${years > 1 ? 's' : ''}`;
  if (months > 0) return `${months} mês${months > 1 ? 'es' : ''}`;
  return `${days} dia${days > 1 ? 's' : ''}`;
};

module.exports = {
  name: "perfil",
  description: "Mostra informações detalhadas de um usuário",
  commands: ["perfil", "profile", "info"],
  usage: `${PREFIX}perfil [@usuário]`,
  aliases: ["pf"],
  cooldown: 5000, // 5 segundos de cooldown
  
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    socket,
    remoteJid,
    userJid,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
    sendWarningReact,
    isAdmin
  }) => {
    try {
      // Verifica se é um grupo
      if (!isGroup(remoteJid)) {
        throw new InvalidParameterError(
          "Este comando só pode ser usado em grupos."
        );
      }

      // Determina o usuário alvo
      const targetJid = args[0] 
        ? args[0].replace(/[@ ]/g, "") + "@s.whatsapp.net"
        : userJid;

      // Verifica cooldown
      const cacheKey = `${remoteJid}_${targetJid}`;
      const cachedProfile = profileCache.get(cacheKey);
      
      if (cachedProfile && (Date.now() - cachedProfile.timestamp < CACHE_EXPIRATION)) {
        await socket.sendMessage(remoteJid, cachedProfile.message);
        await sendSuccessReact();
        return;
      }

      await sendWaitReply("📡 Buscando informações do perfil...");

      // Obtém metadados do grupo
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const participant = groupMetadata.participants.find(p => p.id === targetJid);
      
      // Verifica se o usuário está no grupo
      if (!participant && targetJid !== userJid) {
        throw new UserNotInGroupError("O usuário mencionado não está neste grupo.");
      }

      // Obtém dados do perfil
      let profileData = {
        picUrl: `${ASSETS_DIR}/images/default-user.png`,
        name: 'Usuário Desconhecido',
        status: '',
        role: participant?.admin ? 'Administrador' : 'Membro',
        joinDate: participant?.date ? participant.date * 1000 : null,
        isBot: targetJid.includes('@s.whatsapp.net') ? false : true
      };

      try {
        // Tenta obter dados do usuário
        const [{ name, status }, { profileImage }] = await Promise.all([
          socket.onWhatsApp(targetJid).then(res => res[0] || {}),
          getProfileImageData(socket, targetJid)
        ]);

        profileData.name = name || profileData.name;
        profileData.status = status || profileData.status;
        profileData.picUrl = profileImage || profileData.picUrl;
        
        // Tenta obter status personalizado
        try {
          const userStatus = await getStatus(socket, targetJid);
          profileData.status = userStatus.status || profileData.status;
        } catch (statusError) {
          errorLog(`Erro ao obter status: ${statusError.message}`);
        }
      } catch (error) {
        errorLog(`Erro ao obter dados do perfil: ${error.message}`);
      }

      // Gera estatísticas (algumas aleatórias para diversão)
      const stats = {
        activity: Math.floor(Math.random() * 100),
        popularity: Math.floor(Math.random() * 100),
        humor: Math.floor(Math.random() * 100),
        // Calcula "nível" baseado no tempo no grupo
        level: participant?.date ? Math.min(
          Math.floor((Date.now() - (participant.date * 1000)) / (1000 * 60 * 60 * 24 * 30)), 
          100
        ) : 0
      };

      // Formata a mensagem
      const formattedMessage = `
🌟 *INFORMAÇÕES DO PERFIL* 🌟

👤 *Nome:* ${profileData.name} ${profileData.isBot ? '(🤖 Bot)' : ''}
📧 *ID:* ${targetJid.split('@')[0]}
📝 *Status:* ${profileData.status || 'Nenhum status definido'}

👑 *Cargo:* ${profileData.role}
📅 *No grupo há:* ${calculateGroupTime(participant)}
📊 *Nível:* ${stats.level}

📈 *Estatísticas:*
   ├─ 🎯 Atividade: ${stats.activity}%
   ├─ 💖 Popularidade: ${stats.popularity}%
   └─ 😂 Humor: ${stats.humor}%

🔍 *Dados técnicos:*
   └─ 📅 Última atualização: ${new Date().toLocaleTimeString()}
      `.trim();

      // Prepara a mensagem com imagem
      const messageData = {
        image: { url: profileData.picUrl },
        caption: formattedMessage,
        mentions: [targetJid],
        footer: `Comando executado por @${userJid.split('@')[0]}`,
        contextInfo: {
          mentionedJid: [userJid]
        }
      };

      // Atualiza cache
      profileCache.set(cacheKey, {
        timestamp: Date.now(),
        message: messageData
      });

      // Envia a mensagem
      await socket.sendMessage(remoteJid, messageData);
      await sendSuccessReact();
      
      // Log do comando
      commandLogger.info(`Perfil visualizado: ${targetJid} em ${remoteJid}`);
    } catch (error) {
      errorLog(`Erro no comando perfil: ${error.stack}`);
      
      if (error instanceof InvalidParameterError || error instanceof UserNotInGroupError) {
        await sendWarningReact();
        await sendErrorReply(error.message);
      } else {
        await sendErrorReply("❌ Ocorreu um erro ao processar o perfil. Tente novamente mais tarde.");
      }
    }
  },
};
