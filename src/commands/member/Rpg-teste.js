const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

// Banco de dados em memória
const rpgData = {};
const rankGlobal = [];

// Sistema de cidades/regiões com diferentes economias
const REGIOES = {
  VILAREJO: {
    nome: "🏡 Vilarejo",
    taxaImposto: 0.05,
    bonus: 0,
    nivelRequerido: 1
  },
  METROPOLE: {
    nome: "🏙️ Metrópole",
    taxaImposto: 0.15,
    bonus: 0.2,
    nivelRequerido: 5
  },
  REINO: {
    nome: "🏰 Reino",
    taxaImposto: 0.25,
    bonus: 0.4,
    nivelRequerido: 10
  },
  IMPERIO: {
    nome: "👑 Império",
    taxaImposto: 0.35,
    bonus: 0.6,
    nivelRequerido: 20
  }
};

// Títulos de nobreza/realeza
const TITULOS = {
  PLEBEU: { nome: "Plebeu", bonus: 0, requisito: { gold: 0, nivel: 0 } },
  NOBRE: { nome: "Nobre", bonus: 0.1, requisito: { gold: 5000, nivel: 15 } },
  BARÃO: { nome: "Barão", bonus: 0.15, requisito: { gold: 10000, nivel: 20 } },
  CONDE: { nome: "Conde", bonus: 0.2, requisito: { gold: 20000, nivel: 25 } },
  DUQUE: { nome: "Duque", bonus: 0.25, requisito: { gold: 35000, nivel: 30 } },
  PRINCIPE: { nome: "Príncipe", bonus: 0.3, requisito: { gold: 50000, nivel: 35 } },
  REI: { nome: "Rei/Rainha", bonus: 0.4, requisito: { gold: 100000, nivel: 40 } }
};

// Lista expandida de empregos (profissões)
const EMPREGOS = {
  // Básicos
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
  
  // Intermediários 
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
  MERCADOR: {
    nome: "📦 Mercador",
    emoji: "📦",
    cooldown: 20,
    ganho: { min: 35, max: 70 },
    xp: 4,
    desc: "Negocia mercadorias entre cidades",
    regiao: "METROPOLE"
  },
  
  // Avançados
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
  TAROLOGO: {
    nome: "🔮 Tarólogo",
    emoji: "🔮",
    cooldown: 28,
    ganho: { min: 55, max: 110 },
    xp: 7,
    desc: "Lê o destino nas cartas",
    regiao: "REINO",
    risco: 0.1 // 10% chance de previsão errada
  },
  BRUXO: {
    nome: "🪄 Bruxo",
    emoji: "🪄",
    cooldown: 32,
    ganho: { min: 65, max: 130 },
    xp: 9,
    desc: "Pratica magia ancestral",
    regiao: "REINO",
    risco: 0.15 // 15% chance de magia falhar
  },
  
  // Especiais
  CAÇADOR: {
    nome: "🏹 Caçador",
    emoji: "🏹",
    cooldown: 20,
    ganho: { min: 40, max: 80 },
    xp: 5,
    desc: "Caça criaturas raras",
    regiao: "METROPOLE",
    risco: 0.2 // 20% chance de falhar
  },
  LADRÃO: {
    nome: "🦹 Ladrão",
    emoji: "🦹",
    cooldown: 15,
    ganho: { min: 80, max: 160 },
    xp: 7,
    desc: "Rouba dos ricos... ou pobres",
    regiao: "METROPOLE",
    risco: 0.4 // 40% chance de ser preso
  },
  SOLDADO: {
    nome: "🛡️ Soldado",
    emoji: "🛡️",
    cooldown: 22,
    ganho: { min: 45, max: 90 },
    xp: 6,
    desc: "Defende o reino",
    regiao: "REINO",
    risco: 0.25 // 25% chance de ferimento
  },
  CONSELHEIRO: {
    nome: "💼 Conselheiro",
    emoji: "💼",
    cooldown: 35,
    ganho: { min: 100, max: 200 },
    xp: 10,
    desc: "Aconselha a nobreza",
    regiao: "IMPERIO"
  },
  GOVERNADOR: {
    nome: "🏛️ Governador",
    emoji: "🏛️",
    cooldown: 40,
    ganho: { min: 150, max: 300 },
    xp: 15,
    desc: "Administra uma província",
    regiao: "IMPERIO",
    requisito: { nivel: 25 }
  }
};

// Sistema de níveis avançado
const calcularNivel = (xp) => Math.floor(Math.pow(xp / 100, 0.6)) + 1;
const xpParaProxNivel = (nivel) => Math.pow(nivel / 0.6, 1 / 0.6) * 100;

// Sistema de rank
const atualizarRank = () => {
  rankGlobal.length = 0; // Limpa o rank
  
  for (const [userId, data] of Object.entries(rpgData)) {
    rankGlobal.push({
      userId,
      gold: data.gold,
      nivel: data.nivel,
      xp: data.xp,
      titulo: data.titulo || 'PLEBEU'
    });
  }
  
  rankGlobal.sort((a, b) => {
    // Ordena por título (se houver diferença)
    const tituloA = Object.keys(TITULOS).indexOf(a.titulo);
    const tituloB = Object.keys(TITULOS).indexOf(b.titulo);
    
    if (tituloB !== tituloA) return tituloB - tituloA;
    // Se mesmo título, ordena por gold e nível
    return b.gold - a.gold || b.nivel - a.nivel;
  });
};

// Verificar e atualizar título do jogador
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
      return TITULOS[novoTitulo].nome;
    }
  }
  
  return null;
};

// Sistema de impostos e eventos
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
          valor: imposto,
          quando: agora.toLocaleTimeString()
        });
        
        // Se o jogador é um governante (Rei/Príncipe), ele recebe parte dos impostos
        if (user.titulo === 'REI' || user.titulo === 'PRINCIPE') {
          const bonusGovernante = Math.floor(imposto * 0.1); // 10% do imposto
          user.gold += bonusGovernante;
        }
      }
    }
  }
};

// Sistema de mudança de região
const mudarRegiao = (userId, novaRegiao) => {
  const user = rpgData[userId];
  if (!user) return false;
  
  const regiao = REGIOES[novaRegiao];
  if (!regiao || user.nivel < regiao.nivelRequerido) {
    return false;
  }
  
  // Custo para mudar de região
  const custo = user.nivel * 100;
  if (user.gold < custo) return false;
  
  user.gold -= custo;
  user.regiao = novaRegiao;
  return true;
};

module.exports = {
  name: "trabalhar",
  description: "Sistema RPG de trabalhos com economia dinâmica",
  commands: ["trabalhar", "work", "job", "emprego", "rpg"],
  usage: `${PREFIX}trabalhar <emprego>\n${PREFIX}rpg status\n${PREFIX}rpg mudar <regiao>`,
  
  handle: async ({ sendText, userJid, args, sendReply }) => {
    const userId = onlyNumbers(userJid);
    const comando = args[0]?.toLowerCase();
    const subComando = args[1]?.toLowerCase();

    // Inicialização do jogador
    if (!rpgData[userId]) {
      rpgData[userId] = {
        gold: 100,
        xp: 0,
        nivel: 1,
        regiao: "VILAREJO",
        titulo: "PLEBEU",
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

    const user = rpgData[userId];
    aplicarImpostos(); // Verifica impostos

    // Comando 'rpg status'
    if (comando === 'rpg' && subComando === 'status') {
      const tituloAtual = TITULOS[user.titulo].nome;
      const novoStatus = atualizarTitulo(userId);
      
      let mensagemStatus = `👤 *STATUS RPG* 👤\n\n` +
        `🏷️ Título: ${tituloAtual}${novoStatus ? ` → ${novoStatus}` : ''}\n` +
        `💰 Gold: ${user.gold}\n` +
        `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)\n` +
        `📍 Região: ${REGIOES[user.regiao].nome}\n` +
        `🛠️ Skills:\n` +
        `💪 Força: ${user.skills.forca}\n` +
        `🏃 Agilidade: ${user.skills.agilidade}\n` +
        `🧠 Inteligência: ${user.skills.inteligencia}\n` +
        `🎭 Carisma: ${user.skills.carisma}\n\n`;
      
      if (user.inventario.length > 0) {
        mensagemStatus += `🎒 Inventário: ${user.inventario.join(', ')}`;
      }
      
      return sendText(mensagemStatus);
    }

    // Comando 'rpg mudar'
    if (comando === 'rpg' && subComando === 'mudar') {
      const regiaoAlvo = args[2]?.toUpperCase();
      if (!regiaoAlvo || !REGIOES[regiaoAlvo]) {
        return sendText(
          `🌍 *Regiões disponíveis:*\n\n` +
          Object.entries(REGIOES).map(([key, reg]) => 
            `${reg.nome} - ${PREFIX}rpg mudar ${key}\n` +
            `📊 Nível requerido: ${reg.nivelRequerido}\n` +
            `💰 Imposto: ${reg.taxaImposto*100}% | Bônus: +${reg.bonus*100}%`
          ).join('\n')
        );
      }
      
      if (mudarRegiao(userId, regiaoAlvo)) {
        return sendText(
          `🌍 *Mudança de região bem-sucedida!*\n\n` +
          `Você agora está em ${REGIOES[regiaoAlvo].nome}\n` +
          `💰 Custo: ${user.nivel * 100} golds\n` +
          `⚠️ Atenção: Impostos aqui são ${REGIOES[regiaoAlvo].taxaImposto*100}%`
        );
      } else {
        return sendText(
          `❌ *Falha ao mudar de região!*\n` +
          `Verifique se você tem:\n` +
          `- Gold suficiente (${user.nivel * 100} needed)\n` +
          `- Nível requerido (${REGIOES[regiaoAlvo].nivelRequerido}+)\n` +
          `Sua região atual: ${REGIOES[user.regiao].nome}`
        );
      }
    }

    // Comando 'rank'
    if (comando === 'rank') {
      atualizarRank();
      const posicao = rankGlobal.findIndex(u => u.userId === userId) + 1;
      const top5 = rankGlobal.slice(0, 5).map((u, i) => 
        `${i+1}. ${TITULOS[u.titulo].nome} @${u.userId} - ${u.gold} golds (Nv. ${u.nivel})`
      ).join('\n');
      
      return sendText(
        `🏆 *RANKING GLOBAL* 🏆\n\n` +
        `${top5}\n\n` +
        `📍 Sua posição: ${posicao || 'Não ranqueado'}\n` +
        `🏷️ Seu título: ${TITULOS[user.titulo].nome}\n` +
        `💰 Seu saldo: ${user.gold} golds\n` +
        `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)`
      );
    }

    // Lista de empregos
    if (!comando || !Object.values(EMPREGOS).some(e => e.nome.toLowerCase().includes(comando))) {
      const empregosDisponiveis = Object.values(EMPREGOS)
        .filter(e => 
          (e.regiao === user.regiao || user.nivel >= 5) &&
          (!e.requisito || user.nivel >= e.requisito.nivel)
        )
        .map(emp => 
          `${emp.emoji} *${emp.nome}* - ${PREFIX}trabalhar ${emp.nome.split(' ')[1].toLowerCase()}\n` +
          `⏱️ ${emp.cooldown}s | 🪙 ${emp.ganho.min}-${emp.ganho.max} golds | ✨ +${emp.xp} XP\n` +
          `📝 ${emp.desc}${emp.risco ? ` | ☠️ Risco: ${emp.risco*100}%` : ''}` +
          (emp.requisito ? `\n🔒 Requer nível ${emp.requisito.nivel}+` : '')
        ).join('\n\n');
      
      return sendText(
        `🏘️ *EMPREGOS DISPONÍVEIS* (${REGIOES[user.regiao].nome})\n\n` +
        `${empregosDisponiveis}\n\n` +
        `💰 Saldo: ${user.gold} golds | ✨ ${user.xp}/${xpParaProxNivel(user.nivel)} XP\n` +
        `📊 Nível: ${user.nivel} | 🏷️ ${TITULOS[user.titulo].nome}\n` +
        `📍 Região: ${REGIOES[user.regiao].nome}\n` +
        `💼 Histórico: ${user.historico.slice(0, 3).map(h => h.emprego).join(', ') || 'Nenhum'}\n\n` +
        `📌 Ex: ${PREFIX}trabalhar mineiro`
      );
    }

    // Executar trabalho
    const emprego = Object.values(EMPREGOS).find(e => 
      e.nome.toLowerCase().includes(comando)
    );

    if (!emprego) return sendText(`❌ Emprego não encontrado! Use ${PREFIX}trabalhar para listar.`);

    // Verificar requisitos
    if (emprego.requisito && user.nivel < emprego.requisito.nivel) {
      return sendText(
        `🔒 *Emprego bloqueado!*\n` +
        `Você precisa ser nível ${emprego.requisito.nivel}+ para trabalhar como ${emprego.nome}.\n` +
        `Seu nível atual: ${user.nivel}`
      );
    }

    // Verificar região
    if (emprego.regiao !== user.regiao && user.nivel < 5) {
      return sendText(
        `🌍 *Emprego bloqueado!*\n` +
        `Você precisa estar na região ${REGIOES[emprego.regiao].nome} ou ter nível 5+.\n` +
        `Sua região atual: ${REGIOES[user.regiao].nome}`
      );
    }

    // Verificar cooldown
    const agora = Date.now();
    if (user.cooldowns[emprego.nome] > agora) {
      const segundos = Math.ceil((user.cooldowns[emprego.nome] - agora) / 1000);
      return sendText(
        `⏳ *Aguarde ${segundos}s*\n` +
        `Você pode trabalhar como ${emprego.emoji} ${emprego.nome} novamente em ${segundos} segundos.`
      );
    }

    // Trabalhar com riscos
    let resultado = 'sucesso';
    let ganho = Math.floor(Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)) + emprego.ganho.min;

    // Aplicar bônus de região, nível e título
    const bonusRegiao = Math.floor(ganho * REGIOES[user.regiao].bonus);
    const bonusNivel = Math.floor(ganho * (user.nivel * 0.02)); // 2% por nível
    const bonusTitulo = Math.floor(ganho * TITULOS[user.titulo].bonus);
    ganho += bonusRegiao + bonusNivel + bonusTitulo;

    // Verificar riscos
    if (emprego.risco && Math.random() < emprego.risco) {
      resultado = 'fracasso';
      ganho = Math.floor(ganho * 0.5) * -1; // Perde metade
    }

    // Atualizar dados
    user.gold += ganho;
    user.xp += resultado === 'sucesso' ? emprego.xp : Math.floor(emprego.xp * 0.5);
    user.cooldowns[emprego.nome] = agora + (emprego.cooldown * 1000);
    
    // Verificar nível e título
    const novoNivel = calcularNivel(user.xp);
    const nivelUp = novoNivel > user.nivel;
    user.nivel = novoNivel;
    
    const novoTitulo = atualizarTitulo(userId);

    // Atualizar histórico
    user.historico.unshift({
      emprego: emprego.nome,
      resultado,
      ganho,
      quando: new Date().toLocaleTimeString()
    });
    user.historico = user.historico.slice(0, 5);

    // Mensagem de resultado
    let mensagem = `💰 *${resultado === 'sucesso' ? 'TRABALHO CONCLUÍDO' : 'TRABALHO FALHOU'}*\n\n` +
      `${emprego.emoji} *${emprego.nome}*\n` +
      `🪙 Ganho: ${ganho >= 0 ? '+' : ''}${ganho} golds\n` +
      `✨ XP: ${resultado === 'sucesso' ? '+' : ''}${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})\n`;

    if (bonusRegiao > 0 || bonusNivel > 0 || bonusTitulo > 0) {
      mensagem += `🎁 Bônus: ` +
        `${bonusRegiao > 0 ? `+${bonusRegiao} (região) ` : ''}` +
        `${bonusNivel > 0 ? `+${bonusNivel} (nível ${user.nivel}) ` : ''}` +
        `${bonusTitulo > 0 ? `+${bonusTitulo} (${TITULOS[user.titulo].nome})` : ''}\n`;
    }

    if (nivelUp) {
      mensagem += `\n🎉 *NOVO NÍVEL ${user.nivel}!* Bônus aumentado para ${user.nivel * 2}%`;
    }
    
    if (novoTitulo) {
      mensagem += `\n👑 *NOVO TÍTULO: ${novoTitulo.toUpperCase()}!*`;
    }

    mensagem += `\n⏱️ Próximo trabalho em ${emprego.cooldown}s`;

    await sendText(mensagem);
    atualizarRank(); // Atualiza o ranking global
  }
};
