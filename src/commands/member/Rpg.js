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
    custoViagem: 50
  },
  METROPOLE: {
    nome: "🏙️ Metrópole",
    taxaImposto: 0.15,
    bonus: 0.2,
    custoViagem: 150
  },
  REINO: {
    nome: "🏰 Reino",
    taxaImposto: 0.25,
    bonus: 0.4,
    custoViagem: 300
  },
  CIDADELA_REAL: {
    nome: "👑 Cidadela Real",
    taxaImposto: 0.35,
    bonus: 0.6,
    custoViagem: 1000,
    exclusivo: true
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

module.exports = {
  name: "trabalhar",
  description: "Sistema RPG de trabalhos com economia dinâmica",
  commands: ["trabalhar", "work", "job", "emprego"],
  usage: `${PREFIX}trabalhar <emprego>`,
  
  handle: async ({ sendText, userJid, args }) => {
    const userId = onlyNumbers(userJid);
    const comando = args[0]?.toLowerCase();

    // Inicialização do jogador
    if (!rpgData[userId]) {
      rpgData[userId] = {
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
        }
      };
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
            `${reg.nome} - ${PREFIX}trabalhar viajar ${key}\n` +
            `💰 Custo: ${reg.custoViagem} golds | 🏆 ${reg.exclusivo ? "Nível 10+ ou Top Rank" : ""}`
          ).join('\n');
        
        return sendText(
          `✈️ *SISTEMA DE VIAGEM* ✈️\n\n` +
          `Regiões disponíveis:\n${regioesDisponiveis}\n\n` +
          `📍 Sua região atual: ${REGIOES[user.regiao].nome}\n` +
          `💰 Seu saldo: ${user.gold} golds\n\n` +
          `Ex: ${PREFIX}trabalhar viajar METROPOLE`
        );
      }
      
      if (regiaoDestino.exclusivo && user.nivel < 10 && !rankGlobal.some(u => u.userId === userId && rankGlobal.indexOf(u) < 5)) {
        return sendText(
          `🚫 *ACESSO NEGADO!*\n` +
          `A ${regiaoDestino.nome} é exclusiva para:\n` +
          `- Nível 10 ou superior\n` +
          `- Membros do Top 5 do ranking\n\n` +
          `Seu nível: ${user.nivel}`
        );
      }
      
      if (user.regiao === destino) {
        return sendText(`ℹ️ Você já está na região ${regiaoDestino.nome}!`);
      }
      
      if (user.gold < regiaoDestino.custoViagem) {
        return sendText(
          `💰 *FUNDOS INSUFICIENTES!*\n` +
          `Você precisa de ${regiaoDestino.custoViagem} golds para viajar para ${regiaoDestino.nome}\n` +
          `Seu saldo: ${user.gold} golds`
        );
      }
      
      user.gold -= regiaoDestino.custoViagem;
      user.regiao = destino;
      return sendText(
        `✈️ *VIAGEM REALIZADA!*\n` +
        `Você chegou em ${regiaoDestino.nome}\n` +
        `💰 Custo da viagem: ${regiaoDestino.custoViagem} golds\n` +
        `🏆 Novos empregos disponíveis! Use ${PREFIX}trabalhar para ver.`
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
        `🏆 *RANKING GLOBAL* 🏆\n\n` +
        `${top5}\n\n` +
        `📍 Seu título: ${titulo}\n` +
        `📊 Sua posição: ${posicao || 'Não ranqueado'}\n` +
        `💰 Seu saldo: ${user.gold} golds\n` +
        `✨ Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)`
      );
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
          `${emp.emoji} *${emp.nome}* - ${PREFIX}trabalhar ${emp.nome.split(' ')[1].toLowerCase()}\n` +
          `⏱️ ${emp.cooldown}s | 🪙 ${emp.ganho.min}-${emp.ganho.max} golds | ✨ +${emp.xp} XP\n` +
          `📝 ${emp.desc}${emp.risco ? ` | ☠️ Risco: ${emp.risco*100}%` : ''}` +
          `${emp.requisito ? ` | 🏆 ${emp.requisito.toUpperCase()}` : ''}`
        ).join('\n\n');
      
      return sendText(
        `🏘️ *EMPREGOS DISPONÍVEIS* (${REGIOES[user.regiao].nome})\n\n` +
        `${empregosDisponiveis}\n\n` +
        `💰 Saldo: ${user.gold} golds | ✨ ${user.xp}/${xpParaProxNivel(user.nivel)} XP\n` +
        `📊 Nível: ${user.nivel} | 📍 ${REGIOES[user.regiao].nome}\n` +
        `💼 Histórico: ${user.historico.slice(0, 3).map(h => h.emprego).join(', ') || 'Nenhum'}\n\n` +
        `📌 Ex: ${PREFIX}trabalhar mineiro`
      );
    }

    // Executar trabalho
    const emprego = Object.values(EMPREGOS).find(e => 
      e.nome.toLowerCase().includes(comando)
    );

    if (!emprego) return sendText(`❌ Emprego não encontrado! Use ${PREFIX}trabalhar para listar.`);

    // Verificar requisitos especiais
    if (emprego.requisito === "top5" && !rankGlobal.some(u => u.userId === userId && rankGlobal.indexOf(u) < 5)) {
      return sendText(
        `🏆 *EMPREGO EXCLUSIVO!*\n` +
        `Você precisa estar no Top 5 do ranking para ser ${emprego.nome}!\n` +
        `Use ${PREFIX}trabalhar rank para ver sua posição.`
      );
    }
    
    if (emprego.requisito === "top10" && !rankGlobal.some(u => u.userId === userId && rankGlobal.indexOf(u) < 10)) {
      return sendText(
        `🏆 *EMPREGO EXCLUSIVO!*\n` +
        `Você precisa estar no Top 10 do ranking para ser ${emprego.nome}!\n` +
        `Use ${PREFIX}trabalhar rank para ver sua posição.`
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
    let mensagem = `💰 *${resultado === 'sucesso' ? 'TRABALHO CONCLUÍDO' : 'TRABALHO FALHOU'}*\n\n` +
      `${emprego.emoji} *${emprego.nome}*\n` +
      `🪙 Ganho: ${ganho >= 0 ? '+' : ''}${ganho} golds\n` +
      `✨ XP: ${resultado === 'sucesso' ? '+' : ''}${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})\n` +
      `🏛️ Imposto: -${impostoTrabalho} golds\n`;

    if (bonusRegiao > 0 || bonusNivel > 0 || bonusRank > 0) {
      mensagem += `🎁 Bônus: ${bonusRegiao > 0 ? `+${bonusRegiao} (região) ` : ''}` +
        `${bonusNivel > 0 ? `+${bonusNivel} (nível ${user.nivel}) ` : ''}` +
        `${bonusRank > 0 ? `+${bonusRank} (ranking)` : ''}\n`;
    }

    if (nivelUp) {
      mensagem += `\n🎉 *NOVO NÍVEL ${user.nivel}!* Bônus aumentado para ${user.nivel * 3}%`;
    }

    mensagem += `\n⏱️ Próximo trabalho em ${emprego.cooldown}s`;

    await sendText(mensagem);
    atualizarRank(); // Atualiza o ranking global
  }
};
