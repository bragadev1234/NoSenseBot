const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { isGroup, toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

// Configurações
const MAX_DAILY_BANS = 10;
const COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutos

// Banco de dados em memória
const banData = {
  dailyCount: {},
  cooldowns: {},
  logs: []
};

// Lista de números protegidos (COM MENSAGENS OFENSIVAS)
const PROTECTED_NUMBERS = {
  "5555994271816": { // DONO
    message: `
    💢 VAI TOMAR NO SEU CU, MERDA!
    👎 VOCÊ NÃO TEM NEM SOMBRA DO PODER NECESSÁRIO!
    🖕 VOLTA PRO BURACO, INSETO!
    `,
    level: "DEUS"
  },
  "55559984271816": { // ADMIN
    message: `
    🤡 OLHA O PALHAÇO QUERENDO DAR BAN!
    🧠 CÉREBRO DE AMEBA DETECTADO!
    💩 TENTATIVA PATÉTICA REGISTRADA!
    `,
    level: "ADMIN"
  },
  "5521985886256": {
    message: `
    🚫 BURRO DEMAIS PRA ISSO!
    🤏 SER IGNORANTE, NEM TENTE!
    `,
    level: "MODERADOR"
  },
  "5521991161241": {
    message: `
    😂😂😂😂😂😂
    🤣 TÁ DE ZOAÇÃO, NÉ? 
    😭 NINGUÉM TE LEVA A SÉRIO!
    `,
    level: "PROTEGIDO"
  }
};

// Verificar proteção
function checkProtected(targetJid) {
  const num = onlyNumbers(targetJid);
  return PROTECTED_NUMBERS[num] || null;
}

module.exports = {
  name: "banir",
  description: "Sistema de banimento falso (local e ofensivo)",
  commands: ["banwr", "foder"],
  usage: `${PREFIX}banir @usuário`,
  handle: async ({ args, userJid, remoteJid, sendText, sendErrorReply, sendWaitReply }) => {
    
    // Verificação de grupo
    if (!isGroup(remoteJid)) {
      await sendErrorReply("VAI TOMAR NO CU! ISSO SÓ FUNCIONA EM GRUPO!");
      return;
    }

    // Obter alvo
    const targetJid = args[0] ? toUserJid(args[0]) : null;
    if (!targetJid) {
      await sendErrorReply("SEU ANIMAL! TEM QUE MENCIONAR ALGUÉM!");
      return;
    }

    // Verificar se está protegido (OFENSIVO)
    const protected = checkProtected(targetJid);
    if (protected) {
      await sendText(protected.message, { mentions: [targetJid] });
      await sendText(`📛 NÍVEL DE PROTEÇÃO: ${protected.level}`);
      return;
    }

    // Verificar cooldown
    const userNum = onlyNumbers(userJid);
    if (banData.cooldowns[userNum] > Date.now()) {
      const remaining = Math.ceil((banData.cooldowns[userNum] - Date.now()) / 60000);
      await sendErrorReply(`CALMA AÍ, DESESPERADO! ESPERA ${remaining} MINUTOS!`);
      return;
    }

    // Processo de banimento falso
    await sendWaitReply("PERA AÍ, TÔ VENDO SE VOCÊ NÃO É UM LIXO...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 70% chance de falha
    const success = Math.random() < 0.3;

    if (success) {
      await sendText("PORRA! DEU CERTO, MAS NÃO SE ACHA!");
      await new Promise(resolve => setTimeout(resolve, 1500));
      await sendText(`🔪 @${onlyNumbers(targetJid)} FOI BANIDO (MENTIRA)`, {
        mentions: [targetJid]
      });
    } else {
      await sendText("KKKKKKKKKKKKKKK QUE FRACASSADO!");
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendText("VOCÊ É TÃO BURRO QUE NEM PRA BANIR VOCÊ SERVE!");
      await new Promise(resolve => setTimeout(resolve, 2000));
      await sendText(`🤡 OLHA O @${onlyNumbers(userJid)} TENTANDO BANIR! QUE VERGONHA!`, {
        mentions: [userJid]
      });
    }

    // Atualizar cooldown
    banData.cooldowns[userNum] = Date.now() + COOLDOWN_TIME;
    
    // Atualizar contagem diária (simplificado)
    if (!banData.dailyCount[remoteJid]) banData.dailyCount[remoteJid] = 0;
    banData.dailyCount[remoteJid]++;
  }
};
