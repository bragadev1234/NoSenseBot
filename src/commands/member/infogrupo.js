const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

const BOT_NUMBER = "559984271816"; // Reaper-Bot

module.exports = {
  name: "infogrupo",
  description: "Mostra painel completo com informações do grupo (Reaper-Bot).",
  commands: ["infogrupo", "groupinfo", "info", "statusgrupo"],
  usage: `${PREFIX}infogrupo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    remoteJid,
    sendReply,
    getGroupMetadata,
    isGroup,
    getInviteCode,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    const groupMetadata = await getGroupMetadata();
    const totalMembers = groupMetadata.participants.length;
    const admins = groupMetadata.participants.filter(p => p.admin);
    const bots = groupMetadata.participants.filter(p => p.id.includes(BOT_NUMBER));
    const commonMembers = totalMembers - admins.length - bots.length;

    const creationDate = new Date(groupMetadata.creation * 1000);
    const creationDateStr = creationDate.toLocaleDateString("pt-BR");
    const daysExistence = Math.floor((Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24));

    const ephemeral = groupMetadata.ephemeralDuration
      ? `${groupMetadata.ephemeralDuration / 86400} dias`
      : "Desativado";

    let inviteLink = "Privado";
    try {
      inviteLink = `https://chat.whatsapp.com/${await getInviteCode(remoteJid)}`;
    } catch (e) {
      inviteLink = "Indisponível";
    }

    const restrict = groupMetadata.restrict ? "✅ Somente admins podem editar" : "❌ Todos podem editar";
    const announce = groupMetadata.announce ? "✅ Apenas admins podem enviar mensagens" : "❌ Todos podem enviar mensagens";

    // Percentuais
    const botPercent = ((bots.length / totalMembers) * 100).toFixed(2);
    const adminPercent = ((admins.length / totalMembers) * 100).toFixed(2);

    // Últimos eventos (mock — depende da API usada ter logs de entrada/saída)
    const lastJoined = groupMetadata.participants[groupMetadata.participants.length - 1]?.id || "N/A";
    const lastRemoved = groupMetadata.participants.find(p => p.removed) || { id: "N/A" };

    let info = `📋 *PAINEL DO GRUPO — Reaper-Bot*\n\n`;
    info += `📛 *Nome:* ${groupMetadata.subject}\n`;
    info += `👑 *Dono:* @${groupMetadata.owner.split("@")[0]}\n`;
    info += `📅 *Criado em:* ${creationDateStr} (${daysExistence} dias atrás)\n`;
    info += `👥 *Total de membros:* ${totalMembers}\n`;
    info += `🧮 *Membros comuns:* ${commonMembers}\n`;
    info += `🛡️ *Administradores:* ${admins.length} (${adminPercent}%)\n${admins.map(a => `   • @${a.id.split("@")[0]}`).join("\n")}\n`;
    info += `🤖 *Bots no grupo:* ${bots.length} (${botPercent}%)\n`;
    info += `🆔 *ID do grupo:* ${remoteJid}\n`;
    info += `⏳ *Mensagens temporárias:* ${ephemeral}\n`;
    info += `🔗 *Link de convite:* ${inviteLink}\n`;
    info += `🔒 *Restrições:* ${restrict}\n`;
    info += `📢 *Modo de mensagens:* ${announce}\n`;
    info += `📊 *Média de membros por admin:* ${(totalMembers / admins.length).toFixed(1)}\n`;
    info += `🆕 *Último que entrou:* @${lastJoined.split("@")[0]}\n`;
    info += `📤 *Último que saiu:* @${lastRemoved.id.split("@")[0]}\n`;

    await sendReply(info);
  },
};
