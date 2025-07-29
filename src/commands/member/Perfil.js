const axios = require("axios");
const { isGroup } = require(`${BASE_DIR}/utils`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { getProfileImageData } = require(`${BASE_DIR}/services/baileys`);

module.exports = {
  name: "perfil",
  description: "Revela a essência oculta de um usuário.",
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
      throw new InvalidParameterError("Este ritual só pode ser feito em grupo.");
    }

    const targetJid = args[0]
      ? args[0].replace(/[@ ]/g, "") + "@s.whatsapp.net"
      : userJid;

    await sendWaitReply("Invocando sombras...");

    try {
      let profilePicUrl;
      let userName = "Desconhecido";
      let userDescription = "";
      let userRole = "Alma comum";
      let userSpecialStats = "";
      let dddInfo = "Entre o véu e a névoa";

      const number = targetJid.split("@")[0].replace(/[^0-9]/g, "");
      const ddd = number.slice(2, 4);

      try {
        const { profileImage } = await getProfileImageData(socket, targetJid);
        profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;

        const contactInfo = await socket.onWhatsApp(targetJid);
        userName = contactInfo[0]?.name || "Desconhecido";
      } catch {
        profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
      }

      const groupMetadata = await socket.groupMetadata(remoteJid);
      const participant = groupMetadata.participants.find(p => p.id === targetJid);
      if (participant?.admin) userRole = "Guardião da Ordem";

      // 🎯 Números Especiais — com mensagem personalizada e tom gótico
      switch (number) {
        case "5521985886256":
          userRole = "Sombra do Trono";
          userDescription = "Manipula o caos com frieza. Aquele que não sorri — apenas observa e governa.";
          break;
        case "559984271816":
          userRole = "Engrenagem do Destino";
          userDescription = "Frio, suicidamente lógico. Um devoto do silêncio, protetor dos seus com garras ocultas.";
          break;
        case "553597816349":
          userRole = "Melancolia Encarnada";
          userDescription =
            "Beleza que fere, aura que sufoca. Ela é poema e punhal. Se elogiar, viva. Se esquecer, morra.";
          userSpecialStats = `
🖤 *Melancolia:* 100%
🦇 *Vibe:* Gótica Elegante
🩸 *Charme Letal:* Ativo`;
          break;
      }

      // 📍 Localização por DDD via API pública
      try {
        const dddRes = await axios.get(`https://brasilapi.com.br/api/ddd/v1/${ddd}`);
        dddInfo = `${dddRes.data.cidade} - ${dddRes.data.estado}`;
      } catch {
        dddInfo = "Reino Oculto";
      }

      // 🔮 Estatísticas do perfil
      const randomPercent = Math.floor(Math.random() * 100);
      const programPrice = (Math.random() * 5000 + 1000).toFixed(2);
      const beautyLevel = Math.floor(Math.random() * 100) + 1;
      const luckLevel = Math.floor(Math.random() * 100) + 1;
      const humorLevel = ["Cínico", "Sarcasmo refinado", "Sorriso sombrio", "Riso caótico"][Math.floor(Math.random() * 4)];
      const memeKnowledge = Math.floor(Math.random() * 100) + 1;

      // 🧾 Mensagem final — versão clean, estética gótica
      const mensagem = `
──────⊹⊱✧⊰⊹──────

🕯️ *${userRole}*
🧛 *Nome:* @${number}
📍 *Domínio:* ${dddInfo}

🗡️ *Descrição:* ${userDescription || "Sombras comuns, sem marcas no véu."}

╭───────✦
│ 🎭 *Humor:* ${humorLevel}
│ 🍀 *Sorte:* ${luckLevel}%
│ 🤝 *Carisma:* ${memeKnowledge}%
│ 💰 *Programa:* R$ ${programPrice}
│ 💔 *Beleza:* ${beautyLevel}%
│ 🐄 *Gadisse:* ${randomPercent + 7}%
╰───────✦
${userSpecialStats}

──────⊹⊱✧⊰⊹──────`;

      const mentions = [targetJid];
      await sendSuccessReact();

      await socket.sendMessage(remoteJid, {
        image: { url: profilePicUrl },
        caption: mensagem,
        mentions,
      });
    } catch (error) {
      console.error(error);
      sendErrorReply("O véu foi interrompido... algo falhou.");
    }
  },
};
