const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { isGroup, toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

// =============================================
// 🔥 LISTA NEGRA - PROTEGIDOS IMUNES 🔥
// =============================================
const PROTEGIDOS = {
  // 👑 DONO ABSOLUTO
  "559984271816": {
    msg: `
    💢 *[SISTEMA AUTODESTRUTIVO ATIVADO]* 💢
    🚨 *VOCÊ TENTOU BANIR O CRIADOR?*
    👎 *SEU LIXO INÚTIL! VOCÊ NEM DEVERIA TER TENTADO!*
    ☠️ *SUA CONTA SERÁ MARCADA POR ISSO!*
    `,
    nivel: "DEUS"
  },

  // 👮‍♂️ SUB-DONO
  "559181548247": {
    msg: `
    🤬 *VOCÊ É UM VERME!*
    🖕 *NEM O BRAÇO DIREITO DO DONO VOCÊ CONSEGUE BANIR!*
    📛 *VAI CHORAR NO CANTINHO!*
    `,
    nivel: "SUB-DONO"
  },

  // 👥 MEMBROS PROTEGIDOS
  "5521959317800": "🔞 *VOCÊ É UM ZÉ NINGUÉM!*",
  "553597816349": "💩 *SEU EXCREMENTO DIGITAL!*",
  "5515997146763": "🤡 *PALHAÇO SEM GRAÇA!*",
  "5521985886256": "⚡ *VOCÊ LEVARÁ UM CHOQUE SE TENTAR NOVAMENTE!*"
};

// =============================================
// 🔄 VARIÁVEIS DO SISTEMA
// =============================================
const processos = new Map(); // {userId: {targetId, timestamp}}

// =============================================
// 💼 FUNÇÕES DO SISTEMA
// =============================================
function verificarProtegido(jid) {
  const num = onlyNumbers(jid);
  return PROTEGIDOS[num] || null;
}

// =============================================
// 🛠️ COMANDO PRINCIPAL
// =============================================
module.exports = {
  name: "banir",
  description: "COMANDO DE BANIMENTO COM ATRASO",
  commands: ["banir", "banimento", "expulsar"],
  usage: `${PREFIX}banir @usuário`,
  handle: async ({
    args,
    userJid,
    remoteJid,
    sendText,
    sendErrorReply,
    sendWaitReply,
    isReply,
    replyJid
  }) => {
    // ✅ VERIFICAÇÕES INICIAIS
    if (!isGroup(remoteJid)) {
      await sendErrorReply("❌ *ISSO SÓ FUNCIONA EM GRUPOS, BURRO!*");
      return;
    }

    const targetJid = isReply ? replyJid : (args[0] ? toUserJid(args[0]) : null);
    if (!targetJid) {
      await sendErrorReply("⚠️ *MARQUE ALGUÉM, SEU ANIMAL!*");
      return;
    }

    // 🔥 VERIFICAR SE É PROTEGIDO
    const protegido = verificarProtegido(targetJid);
    if (protegido) {
      await sendText(protegido.msg || protegido, { mentions: [targetJid] });
      if (protegido.nivel) {
        await sendText(`📛 *NÍVEL DE PROTEÇÃO: ${protegido.nivel}*`);
      }
      return;
    }

    // ⏳ VERIFICAR SE JÁ TEM PROCESSO EM ANDAMENTO
    const userNum = onlyNumbers(userJid);
    if (processos.has(userNum)) {
      const processo = processos.get(userNum);
      const tempoRestante = 24 - Math.floor((Date.now() - processo.timestamp) / (1000 * 60 * 60));
      
      if (tempoRestante > 0) {
        await sendErrorReply(
          `🕒 *SEU PROCESSO CONTRA @${onlyNumbers(processo.targetId)} ESTÁ EM ANDAMENTO!*\n` +
          `⏳ *TEMPO RESTANTE: ${tempoRestante} HORAS*`,
          { mentions: [processo.targetId] }
        );
        return;
      }
    }

    // 🎰 INICIAR NOVO PROCESSO
    await sendWaitReply("⚖️ *INICIANDO PROCESSO DE BANIMENTO...*");
    await new Promise(resolve => setTimeout(resolve, 3000));

    processos.set(userNum, {
      targetId: targetJid,
      timestamp: Date.now()
    });

    await sendText(
      `📝 *PROCESSO REGISTRADO CONTRA @${onlyNumbers(targetJid)}*\n` +
      `⏳ *RESULTADO DISPONÍVEL EM 24 HORAS*`,
      { mentions: [targetJid] }
    );

    // ⏰ AGENDAR RESULTADO
    setTimeout(async () => {
      processos.delete(userNum);
      const sucesso = Math.random() < 0.3; // 30% chance

      if (sucesso) {
        await sendText(
          `🎉 *PROCESSO CONCLUÍDO!*\n` +
          `☠️ *@${onlyNumbers(targetJid)} FOI BANIDO COM SUCESSO!*`,
          { mentions: [targetJid] }
        );
      } else {
        await sendText(
          `💥 *PROCESSO FALHOU!*\n` +
          `🤡 *@${onlyNumbers(userJid)} SEU PEDIDO FOI REJEITADO!*`,
          { mentions: [userJid] }
        );
      }
    }, 24 * 60 * 60 * 1000); // 24 horas
  }
};
