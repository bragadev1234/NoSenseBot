const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

// Banco de dados em memória
const rpgData = {};
const rankGlobal = [];

// Fontes de texto estilizadas
const FONTES = {
  titulo: (text) => `✨ ${text} ✨`,
  subtitulo: (text) => `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n${text}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`,
  destaque: (text) => `★ ${text} ★`,
  erro: (text) => `✖ ${text} ✖`,
  sucesso: (text) => `✔ ${text} ✔`,
  dinheiro: (text) => `💰 ${text}`,
  xp: (text) => `✨ ${text}`,
  nivel: (text) => `📈 ${text}`,
  tempo: (text) => `⏱️ ${text}`,
  local: (text) => `📍 ${text}`,
  ranking: (text) => `🏆 ${text}`,
  perigo: (text) => `☠️ ${text}`,
  bonus: (text) => `🎁 ${text}`
};

// Sistema de cidades/regiões com diferentes economias
const REGIOES = {
  VILAREJO: {
    nome: "🏡 Vilarejo dos Iniciantes",
    taxaImposto: 0.05,
    bonus: 0,
    custoViagem: 50,
    seguranca: 0.9 // Alta segurança contra crimes
  },
  METROPOLE: {
    nome: "🏙️ Metrópole Mercante",
    taxaImposto: 0.15,
    bonus: 0.2,
    custoViagem: 150,
    seguranca: 0.7 // Média segurança
  },
  REINO: {
    nome: "🏰 Reino dos Aventureiros",
    taxaImposto: 0.25,
    bonus: 0.4,
    custoViagem: 300,
    seguranca: 0.5 // Baixa segurança
  },
  CIDADELA_REAL: {
    nome: "👑 Cidadela Real",
    taxaImposto: 0.35,
    bonus: 0.6,
    custoViagem: 1000,
    exclusivo: true,
    seguranca: 1.0 // Crimes impossíveis
  }
};

// Títulos baseados no ranking
const TITULOS = {
  1: "👑 Rei/Reina",
  2: "👑 Príncipe/Princesa",
  3: "👑 Duque/Duquesa",
  4: "👑 Conde/Condessa",
  5: "👑 Barão/Baronesa",
  default: ["Plebeu", "Escravo", "Fugitivo", "Mendigo", "Servo"]
};

// Lista expandida de empregos (30 profissões)
const EMPREGOS = {
  // Básicos (Vilarejo)
  FAZENDEIRO: {
    nome: "👨‍🌾 Fazendeiro",
    emoji: "👨‍🌾",
    cooldown: 10,
    ganho: { min: 15, max: 30 },
    xp: 2,
    desc: "Cultiva alimentos básicos",
    regiao: "VILAREJO"
  },
  PESCADOR: {
    nome: "🎣 Pescador",
    emoji: "🎣",
    cooldown: 12,
    ganho: { min: 18, max: 35 },
    xp: 2,
    desc: "Pesca em rios e lagos",
    regiao: "VILAREJO"
  },
  LENHADOR: {
    nome: "🪓 Lenhador",
    emoji: "🪓",
    cooldown: 12,
    ganho: { min: 20, max: 40 },
    xp: 2,
    desc: "Corta madeira para construção",
    regiao: "VILAREJO"
  },
  
  // Intermediários (Metrópole)
  MINEIRO: {
    nome: "⛏️ Mineiro",
    emoji: "⛏️",
    cooldown: 15,
    ganho: { min: 25, max: 50 },
    xp: 3,
    desc: "Extrai minérios preciosos",
    regiao: "METROPOLE"
  },
  FERREIRO: {
    nome: "⚒️ Ferreiro",
    emoji: "⚒️",
    cooldown: 18,
    ganho: { min: 30, max: 60 },
    xp: 4,
    desc: "Forja armas e ferramentas",
    regiao: "METROPOLE"
  },
  COMERCIANTE: {
    nome: "📦 Comerciante",
    emoji: "📦",
    cooldown: 20,
    ganho: { min: 35, max: 70 },
    xp: 4,
    desc: "Negocia mercadorias valiosas",
    regiao: "METROPOLE"
  },
  
  // Avançados (Reino)
  ALQUIMISTA: {
    nome: "🧪 Alquimista",
    emoji: "🧪",
    cooldown: 25,
    ganho: { min: 50, max: 100 },
    xp: 6,
    desc: "Cria poções mágicas",
    regiao: "REINO"
  },
  MAGO: {
    nome: "🧙‍♂️ Mago",
    emoji: "🧙‍♂️",
    cooldown: 30,
    ganho: { min: 60, max: 120 },
    xp: 8,
    desc: "Estuda artes arcanas",
    regiao: "REINO"
  },
  BRUXO: {
    nome: "🔮 Bruxo",
    emoji: "🔮",
    cooldown: 28,
    ganho: { min: 55, max: 110 },
    xp: 7,
    desc: "Domina magias das trevas",
    regiao: "REINO",
    risco: 0.15
  },
  PALADINO: {
    nome: "⚔️ Paladino",
    emoji: "⚔️",
    cooldown: 32,
    ganho: { min: 65, max: 130 },
    xp: 9,
    desc: "Defensor do reino sagrado",
    regiao: "REINO"
  },
  
  // Especiais (Riscos)
  CAÇADOR: {
    nome: "🏹 Caçador",
    emoji: "🏹",
    cooldown: 20,
    ganho: { min: 40, max: 80 },
    xp: 5,
    desc: "Caça criaturas raras",
    regiao: "METROPOLE",
    risco: 0.2
  },
  LADRÃO: {
    nome: "🦹 Ladrão",
    emoji: "🦹",
    cooldown: 15,
    ganho: { min: 80, max: 160 },
    xp: 7,
    desc: "Rouba dos ricos... ou pobres",
    regiao: "METROPOLE",
    risco: 0.4
  },
  ASSASSINO: {
    nome: "🗡️ Assassino",
    emoji: "🗡️",
    cooldown: 40,
    ganho: { min: 150, max: 300 },
    xp: 12,
    desc: "Executa contratos secretos",
    regiao: "REINO",
    risco: 0.5
  },
  
  // Realeza (Cidadela Real)
  CONSELHEIRO: {
    nome: "💎 Conselheiro Real",
    emoji: "💎",
    cooldown: 45,
    ganho: { min: 200, max: 400 },
    xp: 15,
    desc: "Aconselha o rei em decisões",
    regiao: "CIDADELA_REAL",
    requisito: "top5"
  },
  TESOUREIRO: {
    nome: "💰 Tesoureiro Real",
    emoji: "💰",
    cooldown: 50,
    ganho: { min: 250, max: 500 },
    xp: 18,
    desc: "Gerencia o tesouro do reino",
    regiao: "CIDADELA_REAL",
    requisito: "top5"
  },
  GUARDA_REAL: {
    nome: "🛡️ Guarda Real",
    emoji: "🛡️",
    cooldown: 35,
    ganho: { min: 180, max: 350 },
    xp: 14,
    desc: "Protege a família real",
    regiao: "CIDADELA_REAL",
    requisito: "top10"
  }
};

// Sistema de níveis mais fácil
const calcularNivel = (xp) => Math.floor(Math.pow(xp / 50, 0.5)) + 1;
const xpParaProxNivel = (nivel) => Math.pow(nivel / 0.5, 1 / 0.5) * 50;

// Sistema de rank
const atualizarRank = () => {
  rankGlobal.length = 0; // Limpa o rank
  
  for (const [userId, data] of Object.entries(rpgData)) {
    rankGlobal.push({
      userId,
      gold: data.gold,
      nivel: data.nivel,
      xp: data.xp
    });
  }
  
  rankGlobal.sort((a, b) => b.gold - a.gold || b.nivel - a.nivel);
};

// Sistema de impostos reais
let ultimaColetaImpostos = Date.now();
const coletarImpostosReais = () => {
  const agora = Date.now();
  // Coleta a cada 2 horas (simulação)
  if (agora - ultimaColetaImpostos > 7200000) {
    ultimaColetaImpostos = agora;
    
    if (rankGlobal.length > 0) {
      const rei = rpgData[rankGlobal[0].userId];
      let totalImpostos = 0;
      
      for (const userId in rpgData) {
        if (userId !== rei.userId) {
          const user = rpgData[userId];
          const imposto = Math.floor(user.gold * 0.1); // 10% para o rei
          user.gold -= imposto;
          totalImpostos += imposto;
          
          user.historicoImpostos = user.historicoImpostos || [];
          user.historicoImpostos.push({
            tipo: "real",
            valor: imposto,
            quando: new Date().toLocaleTimeString()
          });
        }
      }
      
      rei.gold += totalImpostos;
      rei.historicoImpostos = rei.historicoImpostos || [];
      rei.historicoImpostos.push({
        tipo: "coleta",
        valor: totalImpostos,
        quando: new Date().toLocaleTimeString()
      });
      
      return totalImpostos;
    }
  }
  return 0;
};

// Sistema de impostos regionais
const aplicarImpostos = () => {
  const agora = new Date();
  
  // Aplica a cada hora (simulação)
  if (agora.getMinutes() === 0) {
    for (const userId in rpgData) {
      const user = rpgData[userId];
      const regiao = REGIOES[user.regiao || 'VILAREJO'];
      const imposto = Math.floor(user.gold * regiao.taxaImposto);
      
      if (imposto > 0) {
        user.gold -= imposto;
        user.historicoImpostos = user.historicoImpostos || [];
        user.historicoImpostos.push({
          tipo: "regional",
          valor: imposto,
          quando: agora.toLocaleTimeString()
        });
      }
    }
  }
};

// Sistema de PvP
const duelar = (desafiante, desafiado) => {
  const jogador1 = rpgData[desafiante];
  const jogador2 = rpgData[desafiado];
  
  if (!jogador1 || !jogador2) {
    return { vencedor: null, mensagem: FONTES.erro("Um dos jogadores não está registrado no RPG!") };
  }
  
  if (jogador1.gold < 50 || jogador2.gold < 50) {
    return { vencedor: null, mensagem: FONTES.erro("Ambos precisam ter pelo menos 50 golds para duelar!") };
  }
  
  // Fatores que influenciam o duelo
  const nivel1 = jogador1.nivel;
  const nivel2 = jogador2.nivel;
  const forca1 = jogador1.skills?.forca || 1;
  const forca2 = jogador2.skills?.forca || 1;
  const agilidade1 = jogador1.skills?.agilidade || 1;
  const agilidade2 = jogador2.skills?.agilidade || 1;
  
  // Cálculo de chance de vitória (60% nível, 30% força, 10% agilidade)
  const chance1 = (nivel1 * 0.6) + (forca1 * 0.3) + (agilidade1 * 0.1);
  const chance2 = (nivel2 * 0.6) + (forca2 * 0.3) + (agilidade2 * 0.1);
  const total = chance1 + chance2;
  
  const random = Math.random() * total;
  const vencedor = random < chance1 ? desafiante : desafiado;
  const perdedor = vencedor === desafiante ? desafiado : desafiante;
  
  // Aposta baseada no nível (5% do gold do perdedor)
  const aposta = Math.floor(rpgData[perdedor].gold * 0.05);
  
  // Transferência de golds
  rpgData[vencedor].gold += aposta;
  rpgData[perdedor].gold -= aposta;
  
  // XP para ambos
  rpgData[vencedor].xp += 10;
  rpgData[perdedor].xp += 5;
  
  // Atualizar histórico
  rpgData[vencedor].historicoPvP = rpgData[vencedor].historicoPvP || [];
  rpgData[vencedor].historicoPvP.push({
    oponente: perdedor,
    resultado: 'vitória',
    gold: apesta,
    quando: new Date().toLocaleTimeString()
  });
  
  rpgData[perdedor].historicoPvP = rpgData[perdedor].historicoPvP || [];
  rpgData[perdedor].historicoPvP.push({
    oponente: vencedor,
    resultado: 'derrota',
    gold: -aposta,
    quando: new Date().toLocaleTimeString()
  });
  
  return {
    vencedor,
    mensagem: FONTES.sucesso(`\n⚔️ *DUELO FINALIZADO!* ⚔️\n\n` +
      `🏆 Vencedor: @${vencedor}\n` +
      `💀 Perdedor: @${perdedor}\n` +
      `💰 Aposta: ${aposta} golds transferidos\n` +
      `✨ ${rpgData[vencedor].nome || 'Desafiante'} ganhou +10 XP\n` +
      `✨ ${rpgData[perdedor].nome || 'Desafiado'} ganhou +5 XP`)
  };
};

// Sistema de assalto
const assaltar = (assaltante, vitima) => {
  const jogador1 = rpgData[assaltante];
  const jogador2 = rpgData[vitima];
  
  if (!jogador1 || !jogador2) {
    return { sucesso: false, mensagem: FONTES.erro("Um dos jogadores não está registrado no RPG!") };
  }
  
  // Verificar segurança da região
  const regiao = REGIOES[jogador1.regiao || 'VILAREJO'];
  if (Math.random() < regiao.seguranca) {
    // Falha por segurança
    const multa = Math.floor(jogador1.gold * 0.1);
    jogador1.gold -= multa;
    
    return {
      sucesso: false,
      mensagem: FONTES.erro(`\n🚨 *ASSALTO FALHOU!* 🚨\n\n` +
        `Você foi pego pela guarda ${regiao.nome}!\n` +
        `💰 Multa: -${multa} golds\n` +
        `⚠️ Reputação diminuída!`)
    };
  }
  
  // Chance baseada em nível e agilidade
  const chanceSucesso = 0.4 + (jogador1.nivel * 0.01) + ((jogador1.skills?.agilidade || 1) * 0.05);
  const sucesso = Math.random() < chanceSucesso;
  
  if (sucesso) {
    // Assalto bem sucedido - rouba 40% do gold da vítima
    const roubado = Math.floor(jogador2.gold * 0.4);
    jogador1.gold += roubado;
    jogador2.gold -= roubado;
    
    // XP
    jogador1.xp += 15;
    
    // Histórico
    jogador1.historicoCrimes = jogador1.historicoCrimes || [];
    jogador1.historicoCrimes.push({
      vitima,
      tipo: 'assalto',
      resultado: 'sucesso',
      gold: roubado,
      quando: new Date().toLocaleTimeString()
    });
    
    jogador2.historicoCrimes = jogador2.historicoCrimes || [];
    jogador2.historicoCrimes.push({
      vitima: assaltante,
      tipo: 'assalto',
      resultado: 'vitima',
      gold: -roubado,
      quando: new Date().toLocaleTimeString()
    });
    
    return {
      sucesso: true,
      mensagem: FONTES.sucesso(`\n💰 *ASSALTO BEM SUCEDIDO!* 💰\n\n` +
        `Você roubou ${roubado} golds de @${vitima}\n` +
        `✨ +15 XP por crime bem sucedido\n` +
        `🏃‍♂️ Fuja antes que a guarda te pegue!`)
    };
  } else {
    // Assalto falhou - perde 25% do gold
    const perdido = Math.floor(jogador1.gold * 0.25);
    jogador1.gold -= perdido;
    
    // XP mínimo
    jogador1.xp += 5;
    
    // Histórico
    jogador1.historicoCrimes = jogador1.historicoCrimes || [];
    jogador1.historicoCrimes.push({
      vitima,
      tipo: 'assalto',
      resultado: 'fracasso',
      gold: -perdido,
      quando: new Date().toLocaleTimeString()
    });
    
    return {
      sucesso: false,
      mensagem: FONTES.erro(`\n🚨 *ASSALTO FALHOU!* 🚨\n\n` +
        `Você foi pego por @${vitima}!\n` +
        `💰 Perda: -${perdido} golds\n` +
        `✨ +5 XP pela tentativa\n` +
        `⚠️ Tente novamente mais tarde!`)
    };
  }
};

module.exports = {
  name: "rpg",
  description: "Sistema RPG completo com economia, PvP e crimes",
  commands: ["rpg", "trabalhar", "work", "job", "emprego", "pvp", "assaltar"],
  usage: `${PREFIX}rpg <comando> [opções]`,
  
  handle: async ({ sendText, userJid, args, mentions }) => {
    const userId = onlyNumbers(userJid);
    const comando = args[0]?.toLowerCase();

    // Inicialização do jogador
    if (!rpgData[userId]) {
      rpgData[userId] = {
        nome: `Jogador ${userId.slice(-4)}`,
        gold: 100,
        xp: 0,
        nivel: 1,
        regiao: "VILAREJO",
        cooldowns: {},
        historico: [],
        skills: {
          forca: 1,
          agilidade: 1,
          inteligencia: 1
        },
        inventario: [],
        reputacao: 0
      };
      atualizarRank();
    }

    const user = rpgData[userId];
    aplicarImpostos(); // Verifica impostos regionais
    coletarImpostosReais(); // Verifica impostos reais

    // Comando 'viajar'
    if (comando === 'viajar') {
      const destino = args[1]?.toUpperCase();
      const regiaoDestino = REGIOES[destino];
      
      if (!regiaoDestino) {
        const regioesDisponiveis = Object.entries(REGIOES)
          .filter(([key, reg]) => !reg.exclusivo || user.nivel >= 10)
          .map(([key, reg]) => 
            `${reg.nome} - ${PREFIX}rpg viajar ${key}\n` +
            `💰 Custo: ${reg.custoViagem} golds | 🏆 ${reg.exclusivo ? "Nível 10+ ou Top Rank" : ""}`
          ).join('\n\n');
        
        return sendText(
          FONTES.titulo("✈️ SISTEMA DE VIAGEM ✈️") + "\n\n" +
          FONTES.subtitulo("Regiões disponíveis:") + "\n" +
          regioesDisponiveis + "\n\n" +
          FONTES.local(`Sua região atual: ${REGIOES[user.regiao].nome}`) + "\n" +
          FONTES.dinheiro(`Seu saldo: ${user.gold} golds`) + "\n\n" +
          `Ex: ${PREFIX}rpg viajar METROPOLE`
        );
      }
      
      if (regiaoDestino.exclusivo && user.nivel < 10 && !rankGlobal.some(u => u.userId === userId && rankGlobal.indexOf(u) < 5)) {
        return sendText(
          FONTES.erro("🚫 ACESSO NEGADO!") + "\n\n" +
          `A ${regiaoDestino.nome} é exclusiva para:\n` +
          `- Nível 10 ou superior\n` +
          `- Membros do Top 5 do ranking\n\n` +
          FONTES.nivel(`Seu nível: ${user.nivel}`)
        );
      }
      
      if (user.regiao === destino) {
        return sendText(FONTES.erro(`ℹ️ Você já está na região ${regiaoDestino.nome}!`));
      }
      
      if (user.gold < regiaoDestino.custoViagem) {
        return sendText(
          FONTES.erro("💰 FUNDOS INSUFICIENTES!") + "\n\n" +
          `Você precisa de ${regiaoDestino.custoViagem} golds para viajar para ${regiaoDestino.nome}\n` +
          FONTES.dinheiro(`Seu saldo: ${user.gold} golds`)
        );
      }
      
      user.gold -= regiaoDestino.custoViagem;
      user.regiao = destino;
      return sendText(
        FONTES.sucesso("✈️ VIAGEM REALIZADA!") + "\n\n" +
        `Você chegou em ${regiaoDestino.nome}\n` +
        FONTES.dinheiro(`Custo da viagem: ${regiaoDestino.custoViagem} golds`) + "\n" +
        `🏆 Novos empregos disponíveis! Use ${PREFIX}rpg para ver.`
      );
    }

    // Comando 'rank'
    if (comando === 'rank') {
      atualizarRank();
      const posicao = rankGlobal.findIndex(u => u.userId === userId) + 1;
      const titulo = TITULOS[posicao] || 
        TITULOS.default[Math.floor(Math.random() * TITULOS.default.length)];
      
      const top5 = rankGlobal.slice(0, 5).map((u, i) => 
        `${i+1}. ${TITULOS[i+1]} @${u.userId} - ${u.gold} golds (Nv. ${u.nivel})`
      ).join('\n');
      
      return sendText(
        FONTES.titulo("🏆 RANKING GLOBAL 🏆") + "\n\n" +
        top5 + "\n\n" +
        FONTES.destaque(`📍 Seu título: ${titulo}`) + "\n" +
        FONTES.ranking(`📊 Sua posição: ${posicao || 'Não ranqueado'}`) + "\n" +
        FONTES.dinheiro(`💰 Seu saldo: ${user.gold} golds`) + "\n" +
        FONTES.xp(`✨ Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)`)
      );
    }

    // Comando 'pvp'
    if (comando === 'pvp') {
      if (!mentions || mentions.length === 0) {
        return sendText(
          FONTES.erro("❌ MENÇÃO OBRIGATÓRIA!") + "\n\n" +
          `Use: ${PREFIX}rpg pvp @jogador\n` +
          `Ex: ${PREFIX}rpg pvp @5511999999999`
        );
      }
      
      const alvo = onlyNumbers(mentions[0]);
      if (alvo === userId) {
        return sendText(FONTES.erro("Você não pode duelar consigo mesmo!"));
      }
      
      const resultado = duelar(userId, alvo);
      return sendText(resultado.mensagem);
    }

    // Comando 'assaltar'
    if (comando === 'assaltar') {
      if (!mentions || mentions.length === 0) {
        return sendText(
          FONTES.erro("❌ MENÇÃO OBRIGATÓRIA!") + "\n\n" +
          `Use: ${PREFIX}rpg assaltar @jogador\n` +
          `Ex: ${PREFIX}rpg assaltar @5511999999999\n\n` +
          FONTES.perigo("⚠️ Cuidado! Assaltos podem falhar e você perderá golds!")
        );
      }
      
      const alvo = onlyNumbers(mentions[0]);
      if (alvo === userId) {
        return sendText(FONTES.erro("Você não pode assaltar a si mesmo!"));
      }
      
      if (REGIOES[user.regiao].seguranca === 1) {
        return sendText(
          FONTES.erro("🚫 CRIMES IMPOSSÍVEIS!") + "\n\n" +
          `Na ${REGIOES[user.regiao].nome}, a segurança é máxima!\n` +
          `Viaje para uma região menos segura para cometer crimes.`
        );
      }
      
      const resultado = assaltar(userId, alvo);
      return sendText(resultado.mensagem);
    }

    // Lista de empregos
    if (!comando || !Object.values(EMPREGOS).some(e => e.nome.toLowerCase().includes(comando))) {
      const empregosDisponiveis = Object.values(EMPREGOS)
        .filter(e => {
          const mesmaRegiao = e.regiao === user.regiao;
          const nivelSuficiente = user.nivel >= 5;
          const requisitoTop = 
            (!e.requisito) || 
            (e.requisito === "top5" && rankGlobal.some(u => u.userId === userId && rankGlobal.indexOf(u) < 5)) ||
            (e.requisito === "top10" && rankGlobal.some(u => u.userId === userId && rankGlobal.indexOf(u) < 10));
          
          return mesmaRegiao || nivelSuficiente || requisitoTop;
        })
        .map(emp => 
          `${emp.emoji} *${emp.nome}* - ${PREFIX}rpg ${emp.nome.split(' ')[1].toLowerCase()}\n` +
          `${FONTES.tempo(`${emp.cooldown}s`)} | ${FONTES.dinheiro(`${emp.ganho.min}-${emp.ganho.max} golds`)} | ${FONTES.xp(`+${emp.xp} XP`)}\n` +
          `📝 ${emp.desc}${emp.risco ? ` | ${FONTES.perigo(`Risco: ${emp.risco*100}%`)}` : ''}` +
          `${emp.requisito ? ` | 🏆 ${emp.requisito.toUpperCase()}` : ''}`
        ).join('\n\n');
      
      return sendText(
        FONTES.titulo(`🏘️ EMPREGOS DISPONÍVEIS (${REGIOES[user.regiao].nome})`) + "\n\n" +
        empregosDisponiveis + "\n\n" +
        FONTES.dinheiro(`💰 Saldo: ${user.gold} golds`) + " | " +
        FONTES.xp(`✨ ${user.xp}/${xpParaProxNivel(user.nivel)} XP`) + "\n" +
        FONTES.nivel(`📊 Nível: ${user.nivel}`) + " | " +
        FONTES.local(`📍 ${REGIOES[user.regiao].nome}`) + "\n" +
        `💼 Histórico: ${user.historico.slice(0, 3).map(h => h.emprego).join(', ') || 'Nenhum'}\n\n` +
        `📌 Ex: ${PREFIX}rpg mineiro`
      );
    }

    // Executar trabalho
    const emprego = Object.values(EMPREGOS).find(e => 
      e.nome.toLowerCase().includes(comando)
    );

    if (!emprego) return sendText(FONTES.erro(`❌ Emprego não encontrado! Use ${PREFIX}rpg para listar.`));

    // Verificar requisitos especiais
    if (emprego.requisito === "top5" && !rankGlobal.some(u => u.userId === userId && rankGlobal.indexOf(u) < 5)) {
      return sendText(
        FONTES.erro("🏆 EMPREGO EXCLUSIVO!") + "\n\n" +
        `Você precisa estar no Top 5 do ranking para ser ${emprego.nome}!\n` +
        `Use ${PREFIX}rpg rank para ver sua posição.`
      );
    }
    
    if (emprego.requisito === "top10" && !rankGlobal.some(u => u.userId === userId && rankGlobal.indexOf(u) < 10)) {
      return sendText(
        FONTES.erro("🏆 EMPREGO EXCLUSIVO!") + "\n\n" +
        `Você precisa estar no Top 10 do ranking para ser ${emprego.nome}!\n` +
        `Use ${PREFIX}rpg rank para ver sua posição.`
      );
    }

    // Verificar região
    if (emprego.regiao !== user.regiao && user.nivel < 5) {
      return sendText(
        FONTES.erro("🌍 EMPREGO BLOQUEADO!") + "\n\n" +
        `Você precisa estar na região ${REGIOES[emprego.regiao].nome} ou ter nível 5+.\n` +
        FONTES.local(`Sua região atual: ${REGIOES[user.regiao].nome}`)
      );
    }

    // Verificar cooldown
    const agora = Date.now();
    if (user.cooldowns[emprego.nome] > agora) {
      const segundos = Math.ceil((user.cooldowns[emprego.nome] - agora) / 1000);
      return sendText(
        FONTES.erro(`⏳ AGUARDE ${segundos}s`) + "\n\n" +
        `Você pode trabalhar como ${emprego.emoji} ${emprego.nome} novamente em ${segundos} segundos.`
      );
    }

    // Trabalhar com riscos
    let resultado = 'sucesso';
    let ganho = Math.floor(Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)) + emprego.ganho.min;

    // Aplicar bônus de região, nível e ranking
    const bonusRegiao = Math.floor(ganho * REGIOES[user.regiao].bonus);
    const bonusNivel = Math.floor(ganho * (user.nivel * 0.03)); // 3% por nível
    const posicaoRank = rankGlobal.findIndex(u => u.userId === userId) + 1;
    const bonusRank = posicaoRank <= 5 ? Math.floor(ganho * 0.1) : 0; // 10% bonus para top 5
    
    ganho += bonusRegiao + bonusNivel + bonusRank;

    // Verificar riscos
    if (emprego.risco && Math.random() < emprego.risco) {
      resultado = 'fracasso';
      ganho = Math.floor(ganho * 0.5) * -1; // Perde metade
    }

    // Imposto por trabalho (5%)
    const impostoTrabalho = Math.floor(ganho * 0.05);
    if (impostoTrabalho > 0 && ganho > 0) {
      ganho -= impostoTrabalho;
      user.historicoImpostos = user.historicoImpostos || [];
      user.historicoImpostos.push({
        tipo: "trabalho",
        valor: impostoTrabalho,
        quando: new Date().toLocaleTimeString()
      });
    }

    // Atualizar dados
    user.gold += ganho;
    user.xp += resultado === 'sucesso' ? emprego.xp : Math.floor(emprego.xp * 0.5);
    user.cooldowns[emprego.nome] = agora + (emprego.cooldown * 1000);
    
    // Verificar nível
    const novoNivel = calcularNivel(user.xp);
    const nivelUp = novoNivel > user.nivel;
    user.nivel = novoNivel;

    // Atualizar histórico
    user.historico.unshift({
      emprego: emprego.nome,
      resultado,
      ganho,
      quando: new Date().toLocaleTimeString()
    });
    user.historico = user.historico.slice(0, 5);

    // Mensagem de resultado
    let mensagem = FONTES.titulo(`💰 ${resultado === 'sucesso' ? 'TRABALHO CONCLUÍDO' : 'TRABALHO FALHOU'}`) + "\n\n" +
      `${emprego.emoji} *${emprego.nome}*\n` +
      FONTES.dinheiro(`🪙 Ganho: ${ganho >= 0 ? '+' : ''}${ganho} golds`) + "\n" +
      FONTES.xp(`✨ XP: ${resultado === 'sucesso' ? '+' : ''}${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})`) + "\n" +
      FONTES.dinheiro(`🏛️ Imposto: -${impostoTrabalho} golds`) + "\n";

    if (bonusRegiao > 0 || bonusNivel > 0 || bonusRank > 0) {
      mensagem += FONTES.bonus("🎁 Bônus: ") +
        `${bonusRegiao > 0 ? `+${bonusRegiao} (região) ` : ''}` +
        `${bonusNivel > 0 ? `+${bonusNivel} (nível ${user.nivel}) ` : ''}` +
        `${bonusRank > 0 ? `+${bonusRank} (ranking)` : ''}\n`;
    }

    if (nivelUp) {
      mensagem += `\n` + FONTES.sucesso(`🎉 *NOVO NÍVEL ${user.nivel}!* Bônus aumentado para ${user.nivel * 3}%`);
    }

    mensagem += `\n` + FONTES.tempo(`⏱️ Próximo trabalho em ${emprego.cooldown}s`);

    await sendText(mensagem);
    atualizarRank(); // Atualiza o ranking global
  }
};
