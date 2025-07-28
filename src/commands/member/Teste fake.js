const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { isGroup, toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

// ⚠️ CONFIGURAÇÕES OFICIAIS
const MAX_DAILY_BANS = 10;
const COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutos

// 🔒 BANCO DE DADOS OFICIAL
const securityDatabase = {
  protectedNumbers: {
    "55559984271816": { // 👑 DONO ABSOLUTO
      level: "DEUS",
      addedBy: "SISTEMA",
      date: "2023-01-01"
    },
    "55559181548247": { // 👑 ADMIN GLOBAL
      level: "DEUS",
      addedBy: "SISTEMA",
      date: "2023-01-01"
    },
    // Outros protegidos...
  },
  banLogs: [],
  cooldowns: {},
  dailyCount: {}
};

// 🔍 VERIFICAR PRIVILÉGIOS
function checkPrivileges(userJid) {
  const userNum = onlyNumbers(userJid);
  return securityDatabase.protectedNumbers[userNum]?.level === "DEUS";
}

// ✨ COMANDO PRINCIPAL
module.exports = {
  name: "ban",
  description: "Sistema oficial de banimento",
  commands: ["ban", "banir", "banhammer"],
  usage: `${PREFIX}ban @usuário [motivo]`,
  
  // 🛡️ COMANDO DE ADMIN
  admin: {
    name: "protect",
    description: "Adiciona usuário à lista de proteção",
    commands: ["protect", "addprotect"],
    usage: `${PREFIX}protect @usuário [nível]`,
    handle: async ({ args, userJid, sendSuccess, sendError }) => {
      if (!checkPrivileges(userJid)) {
        await sendError("❌ ACESSO NEGADO: Somente o DONO pode usar este comando");
        return;
      }

      const targetJid = args[0] ? toUserJid(args[0]) : null;
      if (!targetJid) {
        await sendError("⚠️ Especifique um usuário");
        return;
      }

      const level = args[1] || "MODERADOR";
      const targetNum = onlyNumbers(targetJid);

      securityDatabase.protectedNumbers[targetNum] = {
        level,
        addedBy: onlyNumbers(userJid),
        date: new Date().toISOString()
      };

      await sendSuccess(`✅ @${targetNum} adicionado aos protegidos como ${level}`, {
        mentions: [targetJid]
      });
    }
  },

  // ⚡ HANDLE PRINCIPAL
  handle: async ({ args, userJid, remoteJid, sendText, sendError, sendWait }) => {
    // 🔐 VERIFICAÇÃO DE GRUPO
    if (!isGroup(remoteJid)) {
      await sendError("🚫 Comando restrito a grupos oficiais");
      return;
    }

    // 🎯 OBTER ALVO
    const targetJid = args[0] ? toUserJid(args[0]) : null;
    if (!targetJid) {
      await sendError("⚠️ Especifique o alvo: @usuário");
      return;
    }

    const userNum = onlyNumbers(userJid);
    const targetNum = onlyNumbers(targetJid);

    // ⚠️ VERIFICAR PROTEGIDOS
    if (securityDatabase.protectedNumbers[targetNum]) {
      const protection = securityDatabase.protectedNumbers[targetNum];
      await sendText(`
      ⚠️ **ALERTA DE SEGURANÇA** ⚠️
      ----------------------------------
      👤 Usuário: @${targetNum}
      🛡️ Nível: ${protection.level}
      📅 Desde: ${protection.date.split('T')[0]}
      👮‍♂️ Adicionado por: @${protection.addedBy}
      ----------------------------------
      ❌ AÇÃO BLOQUEADA PELO SISTEMA
      `, { mentions: [targetJid] });
      return;
    }

    // ⏳ VERIFICAR COOLDOWN
    if (securityDatabase.cooldowns[userNum] > Date.now()) {
      const remaining = Math.ceil((securityDatabase.cooldowns[userNum] - Date.now()) / 60000);
      await sendError(`⏳ Aguarde ${remaining} minutos para novo banimento`);
      return;
    }

    // 🔄 PROCESSO DE BANIMENTO
    await sendWait("🔍 Analisando permissões...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 📊 VERIFICAR LIMITE DIÁRIO
    if ((securityDatabase.dailyCount[remoteJid] || 0) >= MAX_DAILY_BANS) {
      await sendError("🚫 Limite diário de banimentos atingido");
      return;
    }

    // 🎲 CHANCE DE SUCESSO (40%)
    const success = Math.random() < 0.4;

    if (success) {
      await sendText("✅ **BANIMENTO APROVADO**");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await sendText(`
      🚨 **PROCESSO DE BANIMENTO** 🚨
      --------------------------------
      👤 Alvo: @${targetNum}
      🔨 Executor: @${userNum}
      📌 Motivo: Violação de diretrizes
      --------------------------------
      🚫 ACESSO REVOGADO COM SUCESSO
      `, { mentions: [targetJid, userJid] });

      // 📈 ATUALIZAR ESTATÍSTICAS
      securityDatabase.dailyCount[remoteJid] = (securityDatabase.dailyCount[remoteJid] || 0) + 1;
      securityDatabase.cooldowns[userNum] = Date.now() + COOLDOWN_TIME;
    } else {
      await sendText("❌ **FALHA NO BANIMENTO**");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await sendText(`
      ⚠️ **ERRO NO SISTEMA** ⚠️
      ----------------------------
      Código: MCTL-${Math.floor(Math.random() * 9000) + 1000}
      Status: Proteções ativas detectadas
      ----------------------------
      🛡️ O alvo permanece no grupo
      `, { mentions: [targetJid] });
    }
  }
};

