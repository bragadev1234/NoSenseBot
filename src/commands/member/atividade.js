const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

// Estrutura principal de estatísticas
const messageCount = new Map(); 
const startDate = new Map();
const lastMessage = new Map();

// ========================
// Comando Principal
// ========================
module.exports = {
  name: "contador",
  description: "Exibe estatísticas avançadas de mensagens do grupo (Reaper-Bot).",
  commands: ["contador", "counter", "msgcount", "contagem"],
  usage: `${PREFIX}contador`,

  handle: async ({
    remoteJid,
    sendReply,
    isGroup,
    getGroupMetadata,
  }) => {
    if (!isGroup) throw new DangerError("Este comando só pode ser usado em grupos.");

    const groupMetadata = await getGroupMetadata();
    const totalMembers = groupMetadata.participants.length;

    if (!messageCount.has(remoteJid)) {
      messageCount.set(remoteJid, { total: 0, users: new Map(), days: new Map(), hours: new Map(), name: groupMetadata.subject });
      startDate.set(remoteJid, new Date());
      lastMessage.set(remoteJid, "N/A");
    }

    const groupData = messageCount.get(remoteJid);
    const { total, users, days, hours, name } = groupData;
    const start = startDate.get(remoteJid);
    const lastMsg = lastMessage.get(remoteJid);

    // --- Cálculos básicos ---
    const daysActive = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const avgPerDay = (total / daysActive).toFixed(1);
    const avgPerMember = (total / totalMembers).toFixed(1);
    const avgPerHour = (total / (daysActive * 24)).toFixed(2);

    // --- Ranking top 5 usuários ---
    const topUsers = [...users.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const mostActive = [...users.entries()].sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
    const leastActive = [...users.entries()].sort((a, b) => a[1] - b[1])[0] || ["N/A", 0];

    // --- Dia e horário mais ativo ---
    const bestDay = [...days.entries()].sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
    const bestHour = [...hours.entries()].sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

    // --- Distribuição por períodos ---
    const periodDist = { madrugada: 0, manhã: 0, tarde: 0, noite: 0 };
    for (const [h, c] of hours.entries()) {
      if (h >= 0 && h < 6) periodDist.madrugada += c;
      else if (h >= 6 && h < 12) periodDist.manhã += c;
      else if (h >= 12 && h < 18) periodDist.tarde += c;
      else periodDist.noite += c;
    }

    // --- Ranking Global de Grupos ---
    const globalRanking = [...messageCount.entries()]
      .map(([gid, data]) => ({ gid, name: data.name || gid, total: data.total }))
      .sort((a, b) => b.total - a.total);

    const groupRank = globalRanking.findIndex(g => g.gid === remoteJid) + 1;
    const topGroup = globalRanking[0] || { name: "N/A", total: 0 };

    // ========================
    // Construção da resposta
    // ========================
    let stats = `📊 *ANÁLISE DE MENSAGENS — Reaper-Bot*\n\n`;
    stats += `💬 *Total de mensagens:* ${total}\n`;
    stats += `👥 *Média por membro:* ${avgPerMember}\n`;
    stats += `📅 *Média por dia:* ${avgPerDay}\n`;
    stats += `⏰ *Média por hora:* ${avgPerHour}\n`;
    stats += `📆 *Monitorando desde:* ${start.toLocaleDateString("pt-BR")}\n`;
    stats += `⏱️ *Última mensagem:* ${lastMsg}\n\n`;

    stats += `🏆 *Top 5 mais ativos:*\n`;
    if (topUsers.length > 0) {
      topUsers.forEach(([user, count], i) => {
        stats += `   ${i + 1}. @${user.split("@")[0]} — ${count} msgs\n`;
      });
    } else {
      stats += `   Sem dados suficientes.\n`;
    }

    stats += `\n👑 *Mais ativo:* @${mostActive[0].split("@")[0]} — ${mostActive[1]} msgs\n`;
    stats += `😶 *Mais silencioso:* @${leastActive[0].split("@")[0]} — ${leastActive[1]} msgs\n\n`;

    stats += `📈 *Dia mais ativo:* ${bestDay[0]} — ${bestDay[1]} msgs\n`;
    stats += `⌚ *Horário mais ativo:* ${bestHour[0]}h — ${bestHour[1]} msgs\n\n`;

    stats += `🌙 *Madrugada:* ${periodDist.madrugada} msgs\n`;
    stats += `🌞 *Manhã:* ${periodDist.manhã} msgs\n`;
    stats += `🌇 *Tarde:* ${periodDist.tarde} msgs\n`;
    stats += `🌙 *Noite:* ${periodDist.noite} msgs\n\n`;

    // --- Ranking Global ---
    stats += `🌐 *Ranking Global de Grupos*\n`;
    stats += `📍 Este grupo: #${groupRank} (${total} msgs)\n`;
    stats += `👑 Grupo campeão: "${topGroup.name}" — ${topGroup.total} msgs\n\n`;

    stats += `⚠️ _O contador reinicia quando o bot é reiniciado_`;

    await sendReply(stats);
  },
};

// ========================
// Função para incrementar contador
// ========================
function incrementMessageCount(remoteJid, sender, groupName) {
  if (!messageCount.has(remoteJid)) {
    messageCount.set(remoteJid, { total: 0, users: new Map(), days: new Map(), hours: new Map(), name: groupName });
    startDate.set(remoteJid, new Date());
  }

  const groupData = messageCount.get(remoteJid);
  groupData.total += 1;

  // Contagem por usuário
  const userCounts = groupData.users;
  userCounts.set(sender, (userCounts.get(sender) || 0) + 1);

  // Contagem por dia
  const day = new Date().toLocaleDateString("pt-BR");
  groupData.days.set(day, (groupData.days.get(day) || 0) + 1);

  // Contagem por hora
  const hour = new Date().getHours();
  groupData.hours.set(hour, (groupData.hours.get(hour) || 0) + 1);

  // Última mensagem
  lastMessage.set(remoteJid, new Date().toLocaleString("pt-BR"));

  messageCount.set(remoteJid, groupData);
}

module.exports.incrementMessageCount = incrementMessageCount;
