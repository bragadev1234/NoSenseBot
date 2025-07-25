const { isGroup } = require(`${BASE_DIR}/utils`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { getProfileImageData } = require(`${BASE_DIR}/services/baileys`);

module.exports = {
  name: "perfil",
  description: "Mostra informações de um usuário",
  commands: ["perfil", "profile"],
  usage: `${PREFIX}perfil ou perfil @usuario`,
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
  }) => {
    if (!isGroup(remoteJid)) {
      throw new InvalidParameterError(
        "Este comando só pode ser usado em grupo."
      );
    }

    const targetJid = args[0]
      ? args[0].replace(/[@ ]/g, "") + "@s.whatsapp.net"
      : userJid;

    await sendWaitReply("Carregando perfil...");

    try {
      let profilePicUrl;
      let userName;
      let userRole = "Membro";

      try {
        const { profileImage } = await getProfileImageData(socket, targetJid);
        profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;

        const contactInfo = await socket.onWhatsApp(targetJid);
        userName = contactInfo[0]?.name || "Usuário Desconhecido";
      } catch (error) {
        errorLog(
          `Erro ao tentar pegar dados do usuário ${targetJid}: ${JSON.stringify(
            error,
            null,
            2
          )}`
        );
        profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
      }

      const groupMetadata = await socket.groupMetadata(remoteJid);

      const participant = groupMetadata.participants.find(
        (participant) => participant.id === targetJid
      );

      if (participant?.admin) {
        userRole = "Administrador";
      }

      // Gerando todas as estatísticas aleatórias
      const randomPercent = Math.floor(Math.random() * 100);
      const programPrice = (Math.random() * 5000 + 1000).toFixed(2);
      const beautyLevel = Math.floor(Math.random() * 100) + 1;
      const iqLevel = Math.floor(Math.random() * 140) + 60;
      const luckLevel = Math.floor(Math.random() * 100) + 1;
      const humorLevel = ["Ruim", "Médio", "Bom", "Ótimo"][Math.floor(Math.random() * 4)];
      const zodiacSign = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"][Math.floor(Math.random() * 12)];
      const relationshipStatus = ["Solteiro(a)", "Namorando", "Noivo(a)", "Casado(a)", "Enrolado(a)", "Em crise"][Math.floor(Math.random() * 6)];
      const memeKnowledge = Math.floor(Math.random() * 100) + 1;
      const batteryLevel = Math.floor(Math.random() * 100) + 1;

      const mensagem = `
👤 *Nome:* @${targetJid.split("@")[0]}
🎖️ *Cargo:* ${userRole}
♈ *Signo:* ${zodiacSign}
💘 *Status:* ${relationshipStatus}

📊 *Estatísticas:*
🌚 *Programa:* R$ ${programPrice}
🐮 *Gado:* ${randomPercent + 7 || 5}%
🎱 *Passiva:* ${randomPercent + 5 || 10}%
✨ *Beleza:* ${beautyLevel}%
🧠 *QI:* ${iqLevel}
🍀 *Sorte:* ${luckLevel}%
😂 *Humor:* ${humorLevel}
📱 *Bateria:* ${batteryLevel}%
🤣 *Memes:* ${memeKnowledge}%`;

      const mentions = [targetJid];

      await sendSuccessReact();

      await socket.sendMessage(remoteJid, {
        image: { url: profilePicUrl },
        caption: mensagem,
        mentions: mentions,
      });
    } catch (error) {
      console.error(error);
      sendErrorReply("Ocorreu um erro ao tentar verificar o perfil.");
    }
  },
};
