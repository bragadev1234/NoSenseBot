const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

// Enhanced in-memory database with additional fields
const rpgData = {};
const rankGlobal = [];

// Expanded regions with more properties
const REGIOES = {
  VILAREJO: {
    nome: "🏡 Vilarejo",
    taxaImposto: 0.05,
    bonus: 0,
    nivelRequerido: 1,
    desc: "Um humilde vilarejo onde todos começam sua jornada"
  },
  METROPOLE: {
    nome: "🏙️ Metrópole",
    taxaImposto: 0.15,
    bonus: 0.2,
    nivelRequerido: 5,
    desc: "Uma grande cidade cheia de oportunidades"
  },
  REINO: {
    nome: "🏰 Reino",
    taxaImposto: 0.25,
    bonus: 0.4,
    nivelRequerido: 10,
    desc: "Terra governada por nobres e cavaleiros"
  },
  IMPERIO: {
    nome: "👑 Império",
    taxaImposto: 0.35,
    bonus: 0.6,
    nivelRequerido: 20,
    desc: "O centro de poder do mundo, onde reis e rainhas governam"
  },
  CELESTIA: {
    nome: "🌌 Celestia",
    taxaImposto: 0.1,
    bonus: 0.8,
    nivelRequerido: 30,
    desc: "Reino celestial reservado para os mais poderosos",
    especial: true
  }
};

// Enhanced titles with gender support
const TITULOS = {
  PLEBEU: { 
    nome: (genero) => genero === 'F' ? "Plebeia" : "Plebeu", 
    bonus: 0, 
    requisito: { gold: 0, nivel: 0 } 
  },
  NOBRE: { 
    nome: (genero) => genero === 'F' ? "Nobre" : "Nobre", 
    bonus: 0.1, 
    requisito: { gold: 5000, nivel: 15 } 
  },
  BARÃO: { 
    nome: (genero) => genero === 'F' ? "Baronesa" : "Barão", 
    bonus: 0.15, 
    requisito: { gold: 10000, nivel: 20 } 
  },
  CONDE: { 
    nome: (genero) => genero === 'F' ? "Condessa" : "Conde", 
    bonus: 0.2, 
    requisito: { gold: 20000, nivel: 25 } 
  },
  DUQUE: { 
    nome: (genero) => genero === 'F' ? "Duquesa" : "Duque", 
    bonus: 0.25, 
    requisito: { gold: 35000, nivel: 30 } 
  },
  PRINCIPE: { 
    nome: (genero) => genero === 'F' ? "Princesa" : "Príncipe", 
    bonus: 0.3, 
    requisito: { gold: 50000, nivel: 35 } 
  },
  REI: { 
    nome: (genero) => genero === 'F' ? "Rainha" : "Rei", 
    bonus: 0.4, 
    requisito: { gold: 100000, nivel: 40 },
    especial: true
  }
};

// Expanded job list with more variety
const EMPREGOS = {
  // Basic jobs
  FAZENDEIRO: {
    nome: "👨‍🌾 Fazendeiro",
    emoji: "👨‍🌾",
    cooldown: 10,
    ganho: { min: 15, max: 30 },
    xp: 2,
    desc: "Cultiva alimentos básicos",
    regiao: "VILAREJO",
    skill: "forca"
  },
  PESCADOR: {
    nome: "🎣 Pescador",
    emoji: "🎣",
    cooldown: 12,
    ganho: { min: 18, max: 35 },
    xp: 2,
    desc: "Pesca em rios e lagos",
    regiao: "VILAREJO",
    skill: "agilidade"
  },
  
  // Intermediate jobs
  FERREIRO: {
    nome: "⚒️ Ferreiro",
    emoji: "⚒️",
    cooldown: 18,
    ganho: { min: 30, max: 60 },
    xp: 4,
    desc: "Forja armas e ferramentas",
    regiao: "METROPOLE",
    skill: "forca"
  },
  
  // Advanced jobs
  MAGO: {
    nome: "🧙‍♂️ Mago",
    emoji: "🧙‍♂️",
    cooldown: 30,
    ganho: { min: 60, max: 120 },
    xp: 8,
    desc: "Estuda artes arcanas",
    regiao: "REINO",
    skill: "inteligencia"
  },
  
  // Special jobs
  GOVERNADOR: {
    nome: "🏛️ Governador",
    emoji: "🏛️",
    cooldown: 40,
    ganho: { min: 150, max: 300 },
    xp: 15,
    desc: "Administra uma província",
    regiao: "IMPERIO",
    requisito: { nivel: 25 },
    skill: "carisma"
  },
  
  // Royal jobs (only for kings/queens)
  REGENTE: {
    nome: "👑 Regente",
    emoji: "👑",
    cooldown: 60,
    ganho: { min: 300, max: 600 },
    xp: 30,
    desc: "Governa todo o império",
    regiao: "IMPERIO",
    requisito: { titulo: "REI" },
    skill: "carisma"
  }
};

// Level calculation system
const calcularNivel = (xp) => Math.floor(Math.pow(xp / 100, 0.6)) + 1;
const xpParaProxNivel = (nivel) => Math.pow(nivel / 0.6, 1 / 0.6) * 100;

// Enhanced ranking system
const atualizarRank = () => {
  rankGlobal.length = 0;
  
  for (const [userId, data] of Object.entries(rpgData)) {
    rankGlobal.push({
      userId,
      gold: data.gold,
      nivel: data.nivel,
      xp: data.xp,
      titulo: data.titulo || 'PLEBEU',
      genero: data.genero || 'M'
    });
  }
  
  rankGlobal.sort((a, b) => {
    const tituloA = Object.keys(TITULOS).indexOf(a.titulo);
    const tituloB = Object.keys(TITULOS).indexOf(b.titulo);
    
    if (tituloB !== tituloA) return tituloB - tituloA;
    return b.gold - a.gold || b.nivel - a.nivel;
  });
};

// Title update system with gender support
const atualizarTitulo = (userId) => {
  const user = rpgData[userId];
  if (!user) return;
  
  const titulosPossiveis = Object.entries(TITULOS)
    .filter(([_, dados]) => 
      user.gold >= dados.requisito.gold && 
      user.nivel >= dados.requisito.nivel
    )
    .sort((a, b) => 
      b[1].requisito.gold - a[1].requisito.gold || 
      b[1].requisito.nivel - a[1].requisito.nivel
    );
  
  if (titulosPossiveis.length > 0) {
    const novoTitulo = titulosPossiveis[0][0];
    if (user.titulo !== novoTitulo) {
      user.titulo = novoTitulo;
      return TITULOS[novoTitulo].nome(user.genero || 'M');
    }
  }
  
  return null;
};

// Tax system with royal benefits
const aplicarImpostos = () => {
  const agora = new Date();
  
  if (agora.getMinutes() === 0) {
    for (const userId in rpgData) {
      const user = rpgData[userId];
      const regiao = REGIOES[user.regiao || 'VILAREJO'];
      const imposto = Math.floor(user.gold * regiao.taxaImposto);
      
      if (imposto > 0) {
        user.gold -= imposto;
        user.historicoImpostos = user.historicoImpostos || [];
        user.historicoImpostos.push({
          valor: imposto,
          quando: agora.toLocaleTimeString()
        });
        
        // Kings/Queens receive taxes from their region
        if (user.titulo === 'REI' && user.regiao === 'IMPERIO') {
          const bonusGovernante = Math.floor(imposto * 0.2); // 20% of taxes
          user.gold += bonusGovernante;
        }
      }
    }
  }
};

// Enhanced region change system
const mudarRegiao = (userId, novaRegiao) => {
  const user = rpgData[userId];
  if (!user) return { success: false, reason: "Jogador não encontrado" };
  
  const regiao = REGIOES[novaRegiao];
  if (!regiao) return { success: false, reason: "Região inválida" };
  
  if (user.nivel < regiao.nivelRequerido) {
    return { 
      success: false, 
      reason: `Nível ${regiao.nivelRequerido} requerido` 
    };
  }
  
  // Special regions require special titles
  if (regiao.especial && user.titulo !== 'REI') {
    return { 
      success: false, 
      reason: "Apenas reis/rainhas podem acessar esta região" 
    };
  }
  
  const custo = user.nivel * 100;
  if (user.gold < custo) {
    return { 
      success: false, 
      reason: `Gold insuficiente (${custo} necessário)` 
    };
  }
  
  user.gold -= custo;
  user.regiao = novaRegiao;
  return { success: true, custo };
};

// Command: RPG Status
const handleStatus = async ({ userId, sendText }) => {
  const user = rpgData[userId];
  if (!user) return;
  
  aplicarImpostos();
  const novoStatus = atualizarTitulo(userId);
  
  let mensagemStatus = `👤 *STATUS RPG* 👤\n\n` +
    `🏷️ Título: ${TITULOS[user.titulo].nome(user.genero || 'M')}${novoStatus ? ` → ${novoStatus}` : ''}\n` +
    `💰 Gold: ${user.gold}\n` +
    `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)\n` +
    `📍 Região: ${REGIOES[user.regiao].nome}\n` +
    `🎭 Gênero: ${user.genero === 'F' ? 'Feminino 👸' : 'Masculino 🤴'}\n` +
    `🛠️ Skills:\n` +
    `💪 Força: ${user.skills.forca}\n` +
    `🏃 Agilidade: ${user.skills.agilidade}\n` +
    `🧠 Inteligência: ${user.skills.inteligencia}\n` +
    `🎭 Carisma: ${user.skills.carisma}\n\n`;
  
  if (user.inventario.length > 0) {
    mensagemStatus += `🎒 Inventário: ${user.inventario.join(', ')}\n\n`;
  }
  
  mensagemStatus += `📜 Descrição da região:\n${REGIOES[user.regiao].desc}`;
  
  await sendText(mensagemStatus);
};

// Command: Change Region
const handleMudarRegiao = async ({ userId, args, sendText }) => {
  const regiaoAlvo = args[2]?.toUpperCase();
  
  if (!regiaoAlvo || !REGIOES[regiaoAlvo]) {
    return sendText(
      `🌍 *Regiões disponíveis:*\n\n` +
      Object.entries(REGIOES).map(([key, reg]) => 
        `${reg.nome} - ${PREFIX}rpg mudar ${key}\n` +
        `📊 Nível requerido: ${reg.nivelRequerido}\n` +
        `💰 Imposto: ${reg.taxaImposto*100}% | Bônus: +${reg.bonus*100}%\n` +
        `📜 ${reg.desc}`
      ).join('\n\n')
    );
  }
  
  const resultado = mudarRegiao(userId, regiaoAlvo);
  
  if (resultado.success) {
    await sendText(
      `🌍 *Mudança de região bem-sucedida!*\n\n` +
      `Você agora está em ${REGIOES[regiaoAlvo].nome}\n` +
      `💰 Custo: ${resultado.custo} golds\n` +
      `⚠️ Atenção: Impostos aqui são ${REGIOES[regiaoAlvo].taxaImposto*100}%\n\n` +
      `📜 ${REGIOES[regiaoAlvo].desc}`
    );
  } else {
    await sendText(
      `❌ *Falha ao mudar de região!*\n` +
      `Motivo: ${resultado.reason}\n\n` +
      `Sua região atual: ${REGIOES[rpgData[userId].regiao].nome}`
    );
  }
};

// Command: Rank
const handleRank = async ({ userId, sendText }) => {
  atualizarRank();
  const user = rpgData[userId];
  const posicao = rankGlobal.findIndex(u => u.userId === userId) + 1;
  
  const top5 = rankGlobal.slice(0, 5).map((u, i) => 
    `${i+1}. ${TITULOS[u.titulo].nome(u.genero || 'M')} @${u.userId.slice(0, 6)}... - ${u.gold} golds (Nv. ${u.nivel})`
  ).join('\n');
  
  await sendText(
    `🏆 *RANKING GLOBAL* 🏆\n\n` +
    `${top5}\n\n` +
    `📍 Sua posição: ${posicao || 'Não ranqueado'}\n` +
    `🏷️ Seu título: ${TITULOS[user.titulo].nome(user.genero || 'M')}\n` +
    `💰 Seu saldo: ${user.gold} golds\n` +
    `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)`
  );
};

// Command: List Jobs
const handleListarEmpregos = async ({ userId, sendText, PREFIX }) => {
  const user = rpgData[userId];
  
  const empregosDisponiveis = Object.values(EMPREGOS)
    .filter(e => {
      const mesmaRegiao = e.regiao === user.regiao;
      const nivelSuficiente = user.nivel >= 5;
      const requisitosCumpridos = !e.requisito || 
        (e.requisito.nivel ? user.nivel >= e.requisito.nivel : true) &&
        (e.requisito.titulo ? user.titulo === e.requisito.titulo : true);
      
      return (mesmaRegiao || nivelSuficiente) && requisitosCumpridos;
    })
    .map(emp => 
      `${emp.emoji} *${emp.nome}* - ${PREFIX}trabalhar ${emp.nome.split(' ')[1].toLowerCase()}\n` +
      `⏱️ ${emp.cooldown}s | 🪙 ${emp.ganho.min}-${emp.ganho.max} golds | ✨ +${emp.xp} XP\n` +
      `📝 ${emp.desc} | 🎯 Skill: ${emp.skill.toUpperCase()}\n` +
      (emp.risco ? `☠️ Risco: ${emp.risco*100}%` : '') +
      (emp.requisito ? `\n🔒 Requer: ${emp.requisito.nivel ? `Nível ${emp.requisito.nivel}+` : ''}${emp.requisito.titulo ? `Título ${TITULOS[emp.requisito.titulo].nome('M')}` : ''}` : '')
    ).join('\n\n');
  
  await sendText(
    `🏘️ *EMPREGOS DISPONÍVEIS* (${REGIOES[user.regiao].nome})\n\n` +
    `${empregosDisponiveis}\n\n` +
    `💰 Saldo: ${user.gold} golds | ✨ ${user.xp}/${xpParaProxNivel(user.nivel)} XP\n` +
    `📊 Nível: ${user.nivel} | 🏷️ ${TITULOS[user.titulo].nome(user.genero || 'M')}\n` +
    `📍 Região: ${REGIOES[user.regiao].nome}\n\n` +
    `📌 Ex: ${PREFIX}trabalhar mineiro`
  );
};

// Command: Work
const handleTrabalhar = async ({ userId, args, sendText }) => {
  const comando = args[0]?.toLowerCase();
  const user = rpgData[userId];
  
  const emprego = Object.values(EMPREGOS).find(e => 
    e.nome.toLowerCase().includes(comando)
  );

  if (!emprego) return;

  // Check requirements
  if (emprego.requisito) {
    if (emprego.requisito.nivel && user.nivel < emprego.requisito.nivel) {
      return sendText(
        `🔒 *Emprego bloqueado!*\n` +
        `Você precisa ser nível ${emprego.requisito.nivel}+ para trabalhar como ${emprego.nome}.\n` +
        `Seu nível atual: ${user.nivel}`
      );
    }
    
    if (emprego.requisito.titulo && user.titulo !== emprego.requisito.titulo) {
      return sendText(
        `👑 *Emprego real bloqueado!*\n` +
        `Você precisa ser ${TITULOS[emprego.requisito.titulo].nome(user.genero || 'M')} para este trabalho.\n` +
        `Seu título atual: ${TITULOS[user.titulo].nome(user.genero || 'M')}`
      );
    }
  }

  // Check cooldown
  const agora = Date.now();
  if (user.cooldowns[emprego.nome] > agora) {
    const segundos = Math.ceil((user.cooldowns[emprego.nome] - agora) / 1000);
    return sendText(
      `⏳ *Aguarde ${segundos}s*\n` +
      `Você pode trabalhar como ${emprego.emoji} ${emprego.nome} novamente em ${segundos} segundos.`
    );
  }

  // Work calculation with skill bonus
  let ganho = Math.floor(Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)) + emprego.ganho.min;
  let resultado = 'sucesso';
  
  // Apply bonuses
  const bonusRegiao = Math.floor(ganho * REGIOES[user.regiao].bonus);
  const bonusNivel = Math.floor(ganho * (user.nivel * 0.02));
  const bonusTitulo = Math.floor(ganho * TITULOS[user.titulo].bonus);
  const bonusSkill = Math.floor(ganho * (user.skills[emprego.skill] * 0.05));
  
  ganho += bonusRegiao + bonusNivel + bonusTitulo + bonusSkill;

  // Check for risks
  if (emprego.risco && Math.random() < emprego.risco) {
    resultado = 'fracasso';
    ganho = Math.floor(ganho * 0.5) * -1;
  }

  // Update user data
  user.gold += ganho;
  user.xp += resultado === 'sucesso' ? emprego.xp : Math.floor(emprego.xp * 0.5);
  user.cooldowns[emprego.nome] = agora + (emprego.cooldown * 1000);
  
  // Level and title check
  const novoNivel = calcularNivel(user.xp);
  const nivelUp = novoNivel > user.nivel;
  user.nivel = novoNivel;
  
  const novoTitulo = atualizarTitulo(userId);

  // Update history
  user.historico.unshift({
    emprego: emprego.nome,
    resultado,
    ganho,
    quando: new Date().toLocaleTimeString()
  });
  user.historico = user.historico.slice(0, 5);

  // Skill improvement chance
  if (Math.random() < 0.3) {
    user.skills[emprego.skill] += 1;
  }

  // Build result message
  let mensagem = `💰 *${resultado === 'sucesso' ? 'TRABALHO CONCLUÍDO' : 'TRABALHO FALHOU'}*\n\n` +
    `${emprego.emoji} *${emprego.nome}*\n` +
    `🪙 Ganho: ${ganho >= 0 ? '+' : ''}${ganho} golds\n` +
    `✨ XP: ${resultado === 'sucesso' ? '+' : ''}${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})\n`;

  if (bonusRegiao > 0 || bonusNivel > 0 || bonusTitulo > 0 || bonusSkill > 0) {
    mensagem += `🎁 Bônus: ` +
      `${bonusRegiao > 0 ? `+${bonusRegiao} (região) ` : ''}` +
      `${bonusNivel > 0 ? `+${bonusNivel} (nível ${user.nivel}) ` : ''}` +
      `${bonusTitulo > 0 ? `+${bonusTitulo} (${TITULOS[user.titulo].nome(user.genero || 'M')}) ` : ''}` +
      `${bonusSkill > 0 ? `+${bonusSkill} (${emprego.skill} ${user.skills[emprego.skill]})` : ''}\n`;
  }

  if (nivelUp) {
    mensagem += `\n🎉 *NOVO NÍVEL ${user.nivel}!* Bônus aumentado para ${user.nivel * 2}%`;
  }
  
  if (novoTitulo) {
    mensagem += `\n👑 *NOVO TÍTULO: ${novoTitulo.toUpperCase()}!*`;
  }

  mensagem += `\n⏱️ Próximo trabalho em ${emprego.cooldown}s`;

  await sendText(mensagem);
  atualizarRank();
};

// Command: Set Gender
const handleSetGenero = async ({ userId, args, sendText }) => {
  const genero = args[1]?.toUpperCase();
  
  if (!genero || !['M', 'F'].includes(genero)) {
    return sendText(
      `🎭 *Definir Gênero*\n\n` +
      `Uso: ${PREFIX}rpg genero <M/F>\n` +
      `Exemplo: ${PREFIX}rpg genero F\n\n` +
      `Isso afetará como seu título é exibido (Rei/Rainha, Príncipe/Princesa, etc)`
    );
  }
  
  if (!rpgData[userId]) {
    rpgData[userId] = {
      gold: 100,
      xp: 0,
      nivel: 1,
      regiao: "VILAREJO",
      titulo: "PLEBEU",
      genero: genero,
      cooldowns: {},
      historico: [],
      skills: {
        forca: 1,
        agilidade: 1,
        inteligencia: 1,
        carisma: 1
      },
      inventario: []
    };
  } else {
    rpgData[userId].genero = genero;
  }
  
  await sendText(
    `🎭 *Gênero definido com sucesso!*\n\n` +
    `Agora você será reconhecido como:\n` +
    `${TITULOS[rpgData[userId].titulo].nome(genero)}\n\n` +
    `Isso afeta como seus títulos são exibidos no jogo.`
  );
};

// Main command handler
module.exports = {
  name: "rpg",
  description: "Sistema RPG avançado com reinos, títulos e economia dinâmica",
  commands: ["rpg", "trabalhar", "work", "job", "emprego"],
  usage: `${PREFIX}rpg status\n` +
    `${PREFIX}rpg mudar <regiao>\n` +
    `${PREFIX}rpg genero <M/F>\n` +
    `${PREFIX}rpg rank\n` +
    `${PREFIX}trabalhar <emprego>`,
  
  handle: async ({ sendText, userJid, args, sendReply }) => {
    const userId = onlyNumbers(userJid);
    const comando = args[0]?.toLowerCase();
    const subComando = args[1]?.toLowerCase();

    // Initialize player if doesn't exist
    if (!rpgData[userId]) {
      rpgData[userId] = {
        gold: 100,
        xp: 0,
        nivel: 1,
        regiao: "VILAREJO",
        titulo: "PLEBEU",
        genero: 'M',
        cooldowns: {},
        historico: [],
        skills: {
          forca: 1,
          agilidade: 1,
          inteligencia: 1,
          carisma: 1
        },
        inventario: []
      };
    }

    // Apply taxes before any command
    aplicarImpostos();

    // Route commands
    if (comando === 'rpg') {
      if (!subComando || subComando === 'status') {
        return handleStatus({ userId, sendText });
      }
      
      if (subComando === 'mudar') {
        return handleMudarRegiao({ userId, args, sendText });
      }
      
      if (subComando === 'rank') {
        return handleRank({ userId, sendText });
      }
      
      if (subComando === 'genero') {
        return handleSetGenero({ userId, args, sendText, PREFIX });
      }
      
      // Show RPG help if no valid subcommand
      return sendText(
        `🎮 *Sistema RPG - Ajuda*\n\n` +
        `📌 ${PREFIX}rpg status - Ver seu status\n` +
        `🌍 ${PREFIX}rpg mudar <regiao> - Mudar de região\n` +
        `🎭 ${PREFIX}rpg genero <M/F> - Definir gênero\n` +
        `🏆 ${PREFIX}rpg rank - Ver ranking global\n` +
        `💼 ${PREFIX}trabalhar <emprego> - Trabalhar\n\n` +
        `👑 Títulos reais disponíveis:\n` +
        `- Plebeu/Plebeia\n` +
        `- Nobre\n` +
        `- Barão/Baronesa\n` +
        `- Conde/Condessa\n` +
        `- Duque/Duquesa\n` +
        `- Príncipe/Princesa\n` +
        `- Rei/Rainha`
      );
    }
    
    if (comando === 'trabalhar' || comando === 'work' || comando === 'job') {
      if (!args[1]) {
        return handleListarEmpregos({ userId, sendText, PREFIX });
      }
      return handleTrabalhar({ userId, args, sendText });
    }
    
    // Default response
    return sendText(
      `❓ Comando RPG não reconhecido. Use ${PREFIX}rpg para ajuda.`
    );
  }
};
