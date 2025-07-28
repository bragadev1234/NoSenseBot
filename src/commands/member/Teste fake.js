const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { isGroup, toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

// Banco de dados simulado
const dailyBans = new Map(); // {remoteJid: {count: number, lastReset: Date}}

// **LISTA DE PROTEGIDOS COM MENSAGENS OFENSIVAS/FOFAS**  
const PROTECTED_NUMBERS = {
  // **DONO ABSOLUTO** (Poder ilimitado)  
  "55994271816": `  
  👑 *[ACESSO NEGADO]*  
  *"Você achou mesmo que poderia banir o DONO?* 😂  
  *Volte quando for alguém importante, migalha.* 🍞  
  `,  

  // **FRACOTE INÚTIL** (Mensagem ofensiva)  
  "559984271816": `  
  🧻 *[TENTATIVA REJEITADA]*  
  *"KKKKKKKKK* 🤣 *Você tentou banir ESSE herege?*  
  *Nem com 100 vidas você teria poder pra isso, coitado.* 💩  
  `,  

  // **OUTROS PROTEGIDOS** (Mensagens fofas/ironicas)  
  "21985886256": `  
  🍯 *[PROTEÇÃO ATIVA]*  
  *"Awwwn, tentou banir o docinho?* 🍭 *Que fofo!*  
  *Mas não, ele é protegido pela lei do mais lindo.* 💖  
  `,  
  "21991161241": `  
  🦄 *[DEFESA MÁGICA]*  
  *"Tsc tsc...* 👶 *Quer banir um unicórnio?*  
  *Você não tem nível, amiguinho. Volte quando crescer.* 📏  
  `,  
  "6381164925": `  
  🧸 *[BLOQUEADO]*  
  *"Owwnt, que bonitinho você tentando...* 😊  
  *Mas não, esse ursinho é meu favorito. Sai fora!* 🚫  
  `,  
  "22997506007": `  
  🍬 *[IMUNIDADE]*  
  *"Hihihi* 😜 *Quem você pensa que é?*  
  *Esse aqui é blindado com carinho e açúcar!* 🍫  
  `,  
  "15997146763": `  
  🐾 *[ERRO FOFINHO]*  
  *"Nya~* 🐱 *Não pode banir o gatinho!*  
  *Sua tentativa foi registrada como... FRACASSADA!* 💢  
  `,  
  "5491588668": `  
  🎀 *[NÃO PODE]*  
  *"Oh não, o princeso está protegido!* 👑  
  *Você? Só um plebeu com sonhos molhados.* 💦😂  
  `,  
  "3196800493": `  
  🍩 *[DEFESA DOCE]*  
  *"Achou que ia banir o donut?* 🍩 *QUE ENGRAÇADINHO!*  
  *Toma um leitinho e vai dormir, bebê.* 🥛😴  
  `,  
  "21959317800": `  
  🎛️ *[ERRO 404]*  
  *"Seu poder de banir...* 😴 *Não existe.*  
  *Vai chorar? Vai? Vai mesmo?* 😭👉👈  
  `,  
  "3597816349": `  
  🧁 *[NEGADO]*  
  *"Quer banir o cupcake?* 🧁 *Tadinho...*  
  *Nem seu Wi-Fi aguenta tanta fofura!* 💥📶  
  `  
};

module.exports = {
  name: "banirnumero",
  description: "😈 Simula banimento com mensagens ofensivas/fofas",
  commands: ["banirnumero", "banir", "bn", "xingar"],
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
    // Verificação básica
    if (!isGroup(remoteJid)) {
      throw new InvalidParameterError("❌ *Vai tentar banir no PV? Patético.*");
    }

    // Obter alvo
    const targetJid = isReply ? replyJid : (args[0] ? toUserJid(args[0]) : null);
    
    if (!targetJid) {
      await sendErrorReply("🤡 *Cadê o usuário, gênio? Quer banir o vento?*");
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
      await sendErrorReply("🛑 *Acabou sua cota, noob.* Amanhã você tenta de novo.");
      return;
    }

    // **INICIAR PROCESSO DE BANIMENTO FALSO**  
    await sendWaitReply("🔎 *Analisando seu nível de insignificância...*");
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!isAdmin) groupData.count++;

    await sendText("✅ *Solicitação aceita... Por enquanto.*");
    await new Promise(resolve => setTimeout(resolve, 1500));

    await sendText(`🎯 *Alvo selecionado:* @${targetNumber}... *Prepare-se!*`, {
      mentions: [targetJid]
    });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 70% de chance de falha (mais diversão)
    const shouldFail = !isAdmin && Math.random() < 0.7;

    if (shouldFail) {
      const fails = [
        `💥 *ERRO CRÍTICO*: @${targetNumber} *é muito foda pra você banir!* 😎`,  
        `🤖 *DEFESA ATIVADA*: *O alvo riu da sua tentativa.* KKKK 👎`,  
        `📛 *VOCÊ FRACASSOU*: *Até meu código tem pena de você.* 😢`,  
        `🍼 *BANIMENTO FALHO*: *Quer mamadeira? Toma.* 🍼 *Agora vai dormir!*`  
      ];
      await sendText(fails[Math.floor(Math.random() * fails.length)], {
        mentions: [targetJid]
      });
    } else {
      await sendText("⚡ *Removendo direitos...*");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await sendText("🗑️ *Deletando existência social...*");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await sendText(`☠️ *BANIDO!* @${targetNumber} *foi pro limbo!* 👻`, {
        mentions: [targetJid]
      });
      await sendSuccessReact();
      
      // Contador com provocação
      const remaining = isAdmin ? "INFINITO" : (10 - groupData.count);
      await sendText(
        `📊 *Banimentos hoje:* ${groupData.count}/10\n` +  
        `💀 *Restantes:* ${remaining}\n` +  
        (groupData.count >= 8 ? "*Quase acabando... Tá com medo?* 😏" : "")  
      );
    }
  },
};
