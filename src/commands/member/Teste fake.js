const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { isGroup, toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

// Banco de dados simulado para banimentos diários
const dailyBans = new Map(); // {remoteJid: {count: number, lastReset: Date}}

// Lista de números protegidos (com mensagens mais "sérias" mas ainda falsas)
const PROTECTED_NUMBERS = {
  // Número do dono (acesso total)
  "55994271816": `
  ⚠️ *Acesso negado - Nível de permissão insuficiente*
  Este usuário possui imunidade total ao sistema de banimento.
  `,
  
  // Número com mensagem "especial"
  "559984271816": `
  ❗ *Operação bloqueada - Usuário protegido*
  Você não tem autorização para executar esta ação.
  `,

  // Outros números protegidos
  "21985886256": "🔒 Este usuário está em uma lista de proteção.",
  "21991161241": "🚫 Ação não permitida contra este membro.",
  "6381164925": "⚠️ Você não pode banir este número.",
  "22997506007": "⛔ Proteção ativa - Comando bloqueado.",
  "15997146763": "🔐 Acesso restrito para este contato.",
  "5491588668": "❗ Usuário imune a banimentos.",
  "3196800493": "🛡️ Defesas ativas - Tente outro alvo.",
  "21959317800": "🚨 Este número não pode ser banido.",
  "3597816349": "⚡ Erro: Permissões insuficientes."
};

module.exports = {
  name: "banirnumero",
  description: "Simula um banimento (apenas simulação)",
  commands: ["banirnumero", "banir", "bn"],
  usage: `${PREFIX}banirnumero @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    socket,
    remoteJid,
    userJid,
    sendText,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
    isReply,
    replyJid
  }) => {
    // Verificação básica de grupo
    if (!isGroup(remoteJid)) {
      throw new InvalidParameterError("Este comando só funciona em grupos.");
    }

    // Obter alvo
    const targetJid = isReply ? replyJid : (args[0] ? toUserJid(args[0]) : null);
    
    if (!targetJid) {
      await sendErrorReply("Você precisa mencionar alguém ou responder uma mensagem.");
      return;
    }

    const userNumber = onlyNumbers(userJid);
    const targetNumber = onlyNumbers(targetJid);
    const isAdmin = userNumber === "55994271816"; // Dono

    // Verificar se o alvo está protegido
    if (PROTECTED_NUMBERS[targetNumber]) {
      await sendText(PROTECTED_NUMBERS[targetNumber], {
        mentions: [targetJid]
      });
      return;
    }

    // Controle de banimentos diários
    const now = new Date();
    if (!dailyBans.has(remoteJid)) {
      dailyBans.set(remoteJid, { count: 0, lastReset: now });
    }

    const groupData = dailyBans.get(remoteJid);
    if (now.getDate() !== groupData.lastReset.getDate()) {
      groupData.count = 0;
      groupData.lastReset = now;
    }

    // Limite de 10 banimentos/dia (exceto para admin)
    if (!isAdmin && groupData.count >= 10) {
      await sendErrorReply("Limite diário de banimentos atingido (10/10).");
      return;
    }

    // Iniciar processo "sério" de banimento falso
    await sendWaitReply("Analisando permissões...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!isAdmin) groupData.count++;

    await sendText("✅ Solicitação aceita. Iniciando procedimento...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    await sendText(`🔍 Verificando dados do alvo: @${targetNumber}...`, {
      mentions: [targetJid]
    });
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 60% de chance de falha
    const shouldFail = !isAdmin && Math.random() < 0.6;

    if (shouldFail) {
      const errors = [
        "⚠️ Erro: O alvo possui proteções ativas.",
        "⏳ Sistema sobrecarregado. Tente novamente mais tarde.",
        "🔒 Falha na autenticação. Permissões insuficientes.",
        "🛡️ Mecanismo de defesa do alvo bloqueou a ação."
      ];
      await sendText(errors[Math.floor(Math.random() * errors.length)]);
    } else {
      await sendText("⚙️ Removendo permissões do alvo...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await sendText("🗑️ Limpando dados de registro...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await sendText(`☑️ Banimento concluído: @${targetNumber} removido.`, {
        mentions: [targetJid]
      });
      await sendSuccessReact();
      
      // Mostrar contador
      const remaining = isAdmin ? "∞" : (10 - groupData.count);
      await sendText(`📊 Banimentos hoje: ${groupData.count}/10 (Restantes: ${remaining})`);
    }
  },
};
