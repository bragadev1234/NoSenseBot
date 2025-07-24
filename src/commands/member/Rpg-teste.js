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
    bonus: 0
  },
  METROPOLE: {
    nome: "🏙️ Metrópole",
    taxaImposto: 0.15,
    bonus: 0.2
  },
  REINO: {
    nome: "🏰 Reino",
    taxaImposto: 0.25,
    bonus: 0.4
  }
};

// Lista expandida de empregos (20 profissões)
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
      xp: data.xp
    });
  }
  
  rankGlobal.sort((a, b) => b.gold - a.gold || b.nivel - a.nivel);
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
    aplicarImpostos(); // Verifica impostos

    // Comando 'rank'
    if (comando === 'rank') {
      atualizarRank();
      const posicao = rankGlobal.findIndex(u => u.userId === userId) + 1;
      const top5 = rankGlobal.slice(0, 5).map((u, i) => 
        `${i+1}. @${u.userId} - ${u.gold} golds (Nv. ${u.nivel})`
      ).join('\n');
      
      return sendText(
        `🏆 *RANKING GLOBAL* 🏆\n\n` +
        `${top5}\n\n` +
        `📍 Sua posição: ${posicao || 'Não ranqueado'}\n` +
        `💰 Seu saldo: ${user.gold} golds\n` +
        `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)`
      );
    }

    // Lista de empregos
    if (!comando || !Object.values(EMPREGOS).some(e => e.nome.toLowerCase().includes(comando))) {
      const empregosDisponiveis = Object.values(EMPREGOS)
        .filter(e => e.regiao === user.regiao || user.nivel >= 5)
        .map(emp => 
          `${emp.emoji} *${emp.nome}* - ${PREFIX}trabalhar ${emp.nome.split(' ')[1].toLowerCase()}\n` +
          `⏱️ ${emp.cooldown}s | 🪙 ${emp.ganho.min}-${emp.ganho.max} golds | ✨ +${emp.xp} XP\n` +
          `📝 ${emp.desc}${emp.risco ? ` | ☠️ Risco: ${emp.risco*100}%` : ''}`
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

    // Aplicar bônus de região e nível
    const bonusRegiao = Math.floor(ganho * REGIOES[user.regiao].bonus);
    const bonusNivel = Math.floor(ganho * (user.nivel * 0.02)); // 2% por nível
    ganho += bonusRegiao + bonusNivel;

    // Verificar riscos
    if (emprego.risco && Math.random() < emprego.risco) {
      resultado = 'fracasso';
      ganho = Math.floor(ganho * 0.5) * -1; // Perde metade
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
      `✨ XP: ${resultado === 'sucesso' ? '+' : ''}${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})\n`;

    if (bonusRegiao > 0 || bonusNivel > 0) {
      mensagem += `🎁 Bônus: ${bonusRegiao > 0 ? `+${bonusRegiao} (região) ` : ''}` +
        `${bonusNivel > 0 ? `+${bonusNivel} (nível ${user.nivel})` : ''}\n`;
    }

    if (nivelUp) {
      mensagem += `\n🎉 *NOVO NÍVEL ${user.nivel}!* Bônus aumentado para ${user.nivel * 2}%`;
    }

    mensagem += `\n⏱️ Próximo trabalho em ${emprego.cooldown}s`;

    await sendText(mensagem);
    atualizarRank(); // Atualiza o ranking global
  }
};
