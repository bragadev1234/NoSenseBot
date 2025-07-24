const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

// Banco de dados em memória
const rpgData = {};
const rankGlobal = [];
const realeza = {}; // Armazena a realeza de cada região

// Sistema de cidades/regiões com diferentes economias
const REGIOES = {
  VILAREJO: {
    nome: "🏡 Vilarejo",
    taxaImposto: 0.05,
    bonus: 0,
    desc: "Um humilde vilarejo com oportunidades básicas",
    realeza: {
      rei: "Nenhum (Governo Comunitário)",
      conselheiros: ["Aldeão Sábio", "Fazendeiro Chefe"]
    }
  },
  METROPOLE: {
    nome: "🏙️ Metrópole",
    taxaImposto: 0.15,
    bonus: 0.2,
    desc: "Cidade movimentada com diversas profissões",
    realeza: {
      prefeito: "Governador Urbano",
      vereadores: 12
    }
  },
  REINO: {
    nome: "🏰 Reino",
    taxaImposto: 0.25,
    bonus: 0.4,
    desc: "Terra da realeza e magia",
    realeza: {
      rei: "Rei Arthur Pendragon",
      rainha: "Rainha Guinevere",
      nobres: ["Duque de Wellington", "Barão Vermelho", "Conde Drácula"]
    }
  },
  SUBMUNDO: {
    nome: "🕳️ Submundo",
    taxaImposto: 0.35,
    bonus: 0.5,
    desc: "Local perigoso com trabalhos ilegais",
    realeza: {
      lider: "Don Corleone",
      capangas: ["Al Capone", "Pablo Escobar", "Dona Flor"]
    }
  }
};

// Lista expandida de empregos
const EMPREGOS = {
  // Básicos
  FAZENDEIRO: {
    nome: "👨‍🌾 Fazendeiro",
    emoji: "👨‍🌾",
    cooldown: 10,
    ganho: { min: 15, max: 30 },
    xp: 2,
    desc: "Cultiva alimentos básicos para a vila",
    regiao: "VILAREJO"
  },
  PESCADOR: {
    nome: "🎣 Pescador",
    emoji: "🎣",
    cooldown: 12,
    ganho: { min: 18, max: 35 },
    xp: 2,
    desc: "Pesca em rios e lagos locais",
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
    desc: "Extrai minérios preciosos das minas",
    regiao: "METROPOLE"
  },
  FERREIRO: {
    nome: "⚒️ Ferreiro",
    emoji: "⚒️",
    cooldown: 18,
    ganho: { min: 30, max: 60 },
    xp: 4,
    desc: "Forja armas e ferramentas de qualidade",
    regiao: "METROPOLE"
  },
  COZINHEIRO: {
    nome: "👨‍🍳 Cozinheiro",
    emoji: "👨‍🍳",
    cooldown: 15,
    ganho: { min: 25, max: 45 },
    xp: 3,
    desc: "Prepara refeições deliciosas",
    regiao: "METROPOLE"
  },
  
  // Avançados
  ALQUIMISTA: {
    nome: "🧪 Alquimista",
    emoji: "🧪",
    cooldown: 25,
    ganho: { min: 50, max: 100 },
    xp: 6,
    desc: "Cria poções mágicas e elixires raros",
    regiao: "REINO",
    requisito: "inteligencia > 3"
  },
  MAGO: {
    nome: "🧙‍♂️ Mago",
    emoji: "🧙‍♂️",
    cooldown: 30,
    ganho: { min: 60, max: 120 },
    xp: 8,
    desc: "Estuda artes arcanas e feitiços poderosos",
    regiao: "REINO",
    requisito: "inteligencia > 5"
  },
  BRUXO: {
    nome: "🔮 Bruxo",
    emoji: "🔮",
    cooldown: 28,
    ganho: { min: 55, max: 110 },
    xp: 7,
    desc: "Domina magias das trevas e previsões",
    regiao: "REINO",
    requisito: "inteligencia > 4"
  },
  
  // Especiais/Perigosos
  CAÇADOR: {
    nome: "🏹 Caçador",
    emoji: "🏹",
    cooldown: 20,
    ganho: { min: 40, max: 80 },
    xp: 5,
    desc: "Caça criaturas raras e perigosas",
    regiao: "METROPOLE",
    risco: 0.2 // 20% chance de falhar
  },
  LADRÃO: {
    nome: "🦹 Ladrão",
    emoji: "🦹",
    cooldown: 15,
    ganho: { min: 80, max: 160 },
    xp: 7,
    desc: "Rouba dos ricos... ou de quem estiver no caminho",
    regiao: "SUBMUNDO",
    risco: 0.4 // 40% chance de ser preso
  },
  MACUMBEIRO: {
    nome: "⚰️ Macumbeiro",
    emoji: "⚰️",
    cooldown: 22,
    ganho: { min: 70, max: 140 },
    xp: 6,
    desc: "Pratica rituais misteriosos e perigosos",
    regiao: "SUBMUNDO",
    risco: 0.3,
    requisito: "inteligencia > 2"
  },
  GLADIADOR: {
    nome: "⚔️ Gladiador",
    emoji: "⚔️",
    cooldown: 18,
    ganho: { min: 45, max: 90 },
    xp: 6,
    desc: "Luta na arena por fama e fortuna",
    regiao: "METROPOLE",
    risco: 0.25
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
      regiao: data.regiao
    });
  }
  
  rankGlobal.sort((a, b) => b.gold - a.gold || b.nivel - a.nivel);
};

// Sistema de impostos aprimorado
const aplicarImpostos = (userId) => {
  const user = rpgData[userId];
  if (!user) return;

  const agora = new Date();
  const ultimoImposto = user.ultimoImposto || 0;
  const diffHoras = (agora - ultimoImposto) / (1000 * 60 * 60);

  // Aplica a cada 12 horas (simulação de dia/noite)
  if (diffHoras >= 12) {
    const regiao = REGIOES[user.regiao || 'VILAREJO'];
    const imposto = Math.floor(user.gold * regiao.taxaImposto);
    
    if (imposto > 0) {
      user.gold -= imposto;
      user.ultimoImposto = agora;
      user.historicoImpostos = user.historicoImpostos || [];
      user.historicoImpostos.push({
        valor: imposto,
        quando: agora.toLocaleString(),
        regiao: user.regiao
      });

      // Adiciona o imposto ao tesouro da região
      realeza[user.regiao] = realeza[user.regiao] || { tesouro: 0 };
      realeza[user.regiao].tesouro += imposto;
    }
  }
};

// Verificar requisitos de emprego
const verificarRequisito = (user, requisito) => {
  if (!requisito) return true;
  
  const [skill, operador, valor] = requisito.split(' ');
  return eval(`user.skills.${skill} ${operador} ${valor}`);
};

// Módulo RPG principal
module.exports = {
  name: "rpg",
  description: "Sistema RPG completo com economia, empregos e progressão",
  commands: ["rpg"],
  usage: `${PREFIX}rpg <menu|empregos|rank|reino|mudar|status>`,
  
  handle: async ({ sendText, userJid, args, sendReply }) => {
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
        },
        inventario: [],
        ultimoImposto: 0,
        historicoImpostos: []
      };
    }

    const user = rpgData[userId];
    aplicarImpostos(userId); // Verifica impostos

    // Menu principal
    if (!comando || comando === 'menu') {
      return sendText(
        `🎮 *MENU RPG* 🎮\n\n` +
        `💰 Saldo: ${user.gold} golds\n` +
        `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)\n` +
        `📍 Região: ${REGIOES[user.regiao].nome}\n\n` +
        `🔹 *COMANDOS DISPONÍVEIS*\n` +
        `▸ ${PREFIX}rpg menu - Mostra este menu\n` +
        `▸ ${PREFIX}rpg empregos - Lista empregos disponíveis\n` +
        `▸ ${PREFIX}trabalhar <emprego> - Trabalha em um emprego\n` +
        `▸ ${PREFIX}rpg rank - Mostra o ranking global\n` +
        `▸ ${PREFIX}rpg reino - Mostra a realeza da região\n` +
        `▸ ${PREFIX}rpg mudar <região> - Muda de região (custo: 200 golds)\n` +
        `▸ ${PREFIX}rpg status - Mostra seu status completo\n\n` +
        `⚔️ Skills: Força ${user.skills.forca.toFixed(1)} | Agilidade ${user.skills.agilidade.toFixed(1)} | Inteligência ${user.skills.inteligencia.toFixed(1)}`
      );
    }

    // Comando 'status'
    if (comando === 'status') {
      const historicoTrabalhos = user.historico.slice(0, 3).map(h => 
        `${h.emprego.split(' ')[1]}: ${h.ganho >= 0 ? '+' : ''}${h.ganho}g (${h.resultado})`
      ).join('\n▸ ') || 'Nenhum trabalho recente';
      
      const historicoImpostos = user.historicoImpostos.slice(0, 3).map(i => 
        `${i.valor}g em ${REGIOES[i.regiao].nome.split(' ')[1]} (${i.quando.split(',')[0]})`
      ).join('\n▸ ') || 'Nenhum imposto recente';
      
      return sendText(
        `📊 *STATUS DE @${userId}*\n\n` +
        `💰 Golds: ${user.gold}\n` +
        `✨ XP: ${user.xp}/${xpParaProxNivel(user.nivel)} (Nv. ${user.nivel})\n` +
        `📍 Região: ${REGIOES[user.regiao].nome}\n\n` +
        `⚔️ *ATRIBUTOS*\n` +
        `▸ Força: ${user.skills.forca.toFixed(1)}\n` +
        `▸ Agilidade: ${user.skills.agilidade.toFixed(1)}\n` +
        `▸ Inteligência: ${user.skills.inteligencia.toFixed(1)}\n\n` +
        `📜 *HISTÓRICO DE TRABALHOS*\n▸ ${historicoTrabalhos}\n\n` +
        `🏛️ *HISTÓRICO DE IMPOSTOS*\n▸ ${historicoImpostos}`
      );
    }

    // Comando 'rank'
    if (comando === 'rank') {
      atualizarRank();
      const posicao = rankGlobal.findIndex(u => u.userId === userId) + 1;
      const top5 = rankGlobal.slice(0, 5).map((u, i) => 
        `${i+1}. @${u.userId} - ${u.gold}g (Nv. ${u.nivel}) - ${REGIOES[u.regiao].nome}`
      ).join('\n');
      
      return sendText(
        `🏆 *RANKING GLOBAL* 🏆\n\n` +
        `👑 *TOP 5* 👑\n${top5}\n\n` +
        `📍 Sua posição: ${posicao || 'Não ranqueado'}\n` +
        `💰 Seu saldo: ${user.gold} golds\n` +
        `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)\n` +
        `🌍 Região: ${REGIOES[user.regiao].nome}`
      );
    }

    // Comando 'reino'
    if (comando === 'reino') {
      const regiao = REGIOES[user.regiao];
      const tesouro = realeza[user.regiao]?.tesouro || 0;
      
      let infoRealeza = "";
      if (user.regiao === "REINO") {
        infoRealeza = 
          `👑 *Rei*: ${regiao.realeza.rei}\n` +
          `👑 *Rainha*: ${regiao.realeza.rainha}\n` +
          `🎖️ *Nobres*:\n▸ ${regiao.realeza.nobres.join('\n▸ ')}\n`;
      } else if (user.regiao === "SUBMUNDO") {
        infoRealeza = 
          `🕴️ *Líder*: ${regiao.realeza.lider}\n` +
          `💀 *Capangas*:\n▸ ${regiao.realeza.capangas.join('\n▸ ')}\n`;
      } else {
        infoRealeza = 
          `🏛️ *Governo*: ${Object.entries(regiao.realeza).map(([k,v]) => `\n▸ ${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('')}\n`;
      }
      
      return sendText(
        `🏰 *REINO DE ${regiao.nome.toUpperCase()}* 🏰\n\n` +
        `${infoRealeza}\n` +
        `💰 *Tesouro Real*: ${tesouro} golds\n` +
        `🏛️ *Impostos*: ${regiao.taxaImposto*100}% a cada 12 horas\n\n` +
        `ℹ️ ${regiao.desc}`
      );
    }

    // Comando 'mudar' região
    if (comando === 'mudar') {
      const regiaoDesejada = args[1]?.toUpperCase();
      const regiaoInfo = REGIOES[regiaoDesejada];
      
      if (!regiaoInfo) {
        const regioesDisponiveis = Object.entries(REGIOES)
          .map(([key, val]) => `▸ ${val.nome}: ${PREFIX}rpg mudar ${key.toLowerCase()}`)
          .join('\n');
          
        return sendText(
          `🌍 *MUDAR DE REGIÃO* (Custo: 200 golds)\n\n` +
          `📍 Região atual: ${REGIOES[user.regiao].nome}\n\n` +
          `🛣️ *Regiões disponíveis:*\n${regioesDisponiveis}\n\n` +
          `ℹ️ Cada região tem diferentes empregos, impostos e bônus.`
        );
      }
      
      if (user.regiao === regiaoDesejada) {
        return sendText(`ℹ️ Você já está na região ${regiaoInfo.nome}!`);
      }
      
      if (user.gold < 200) {
        return sendText(
          `❌ Você precisa de 200 golds para viajar para ${regiaoInfo.nome}!\n` +
          `💰 Saldo atual: ${user.gold} golds`
        );
      }
      
      user.gold -= 200;
      user.regiao = regiaoDesejada;
      return sendText(
        `✈️ *Viagem concluída!*\n\n` +
        `📍 Você chegou em ${regiaoInfo.nome}\n` +
        `💰 Custo: 200 golds | Saldo: ${user.gold}g\n\n` +
        `🏛️ *Governo*: ${Object.keys(regiaoInfo.realeza).join(', ')}\n` +
        `💸 *Impostos*: ${regiaoInfo.taxaImposto*100}%\n` +
        `🎁 *Bônus*: +${regiaoInfo.bonus*100}% nos ganhos\n\n` +
        `ℹ️ ${regiaoInfo.desc}`
      );
    }

    // Lista de empregos
    if (comando === 'empregos') {
      const empregosDisponiveis = Object.values(EMPREGOS)
        .filter(e => e.regiao === user.regiao || user.nivel >= 5)
        .map(emp => {
          const bloqueado = emp.requisito && !verificarRequisito(user, emp.requisito);
          return (
            `${emp.emoji} *${emp.nome}* - ${PREFIX}trabalhar ${emp.nome.split(' ')[1].toLowerCase()}\n` +
            `⏱️ ${emp.cooldown}s | 🪙 ${emp.ganho.min}-${emp.ganho.max}g | ✨ +${emp.xp} XP\n` +
            `📝 ${emp.desc}${emp.risco ? ` | ☠️ Risco: ${emp.risco*100}%` : ''}` +
            (bloqueado ? `\n🔒 Requisito: ${emp.requisito.replace('>', '> ')}` : '')
          );
        }).join('\n\n');
      
      return sendText(
        `💼 *EMPREGOS DISPONÍVEIS* (${REGIOES[user.regiao].nome})\n\n` +
        `${empregosDisponiveis}\n\n` +
        `💰 Saldo: ${user.gold}g | ✨ ${user.xp}/${xpParaProxNivel(user.nivel)} XP\n` +
        `📊 Nível: ${user.nivel} | 📍 ${REGIOES[user.regiao].nome}\n\n` +
        `📌 Exemplo: ${PREFIX}trabalhar mineiro`
      );
    }

    // Comando não reconhecido
    return sendText(
      `❌ Comando não reconhecido. Use *${PREFIX}rpg menu* para ver as opções.`
    );
  }
};

// Módulo separado para o comando trabalhar
module.exports.trabalhar = {
  name: "trabalhar",
  description: "Trabalha em um emprego para ganhar golds e XP",
  commands: ["trabalhar", "work", "job", "emprego"],
  usage: `${PREFIX}trabalhar <emprego>`,
  
  handle: async ({ sendText, userJid, args, sendReply }) => {
    const userId = onlyNumbers(userJid);
    const trabalhoArg = args[0]?.toLowerCase();
    
    if (!rpgData[userId]) {
      return sendText(
        `❌ Você não está registrado no RPG!\n` +
        `Use *${PREFIX}rpg menu* para começar.`
      );
    }

    const user = rpgData[userId];
    aplicarImpostos(userId);

    if (!trabalhoArg) {
      return sendReply(
        `💼 *ESCOLHA UM EMPREGO*\n\n` +
        `Use *${PREFIX}rpg empregos* para ver a lista de empregos disponíveis.\n` +
        `Exemplo: *${PREFIX}trabalhar mineiro*`
      );
    }

    const emprego = Object.values(EMPREGOS).find(e => 
      e.nome.toLowerCase().includes(trabalhoArg)
    );

    if (!emprego) {
      return sendReply(
        `❌ Emprego não encontrado!\n` +
        `Use *${PREFIX}rpg empregos* para ver a lista de empregos disponíveis.`
      );
    }

    // Verificar região
    if (emprego.regiao !== user.regiao && user.nivel < 5) {
      return sendText(
        `🌍 *Emprego bloqueado!*\n` +
        `Você precisa estar na região ${REGIOES[emprego.regiao].nome} ou ter nível 5+.\n` +
        `Sua região atual: ${REGIOES[user.regiao].nome}\n\n` +
        `💡 Use *${PREFIX}rpg mudar* para viajar para outra região.`
      );
    }

    // Verificar requisitos
    if (emprego.requisito && !verificarRequisito(user, emprego.requisito)) {
      return sendText(
        `🔒 *Requisito não atendido!*\n` +
        `Para trabalhar como ${emprego.nome}, você precisa:\n` +
        `${emprego.requisito.replace('>', '> ')}\n\n` +
        `Seus atributos: Força ${user.skills.forca.toFixed(1)} | Agilidade ${user.skills.agilidade.toFixed(1)} | Inteligência ${user.skills.inteligencia.toFixed(1)}`
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
      const perda = Math.floor(ganho * 0.5);
      ganho = -perda;
      
      // Mensagens diferentes para cada falha
      if (emprego.nome.includes('Ladrão')) {
        ganho = -Math.floor(ganho * 1.5); // Ladrão perde mais
        resultado = 'preso';
      } else if (emprego.nome.includes('Macumbeiro')) {
        resultado = 'amaldiçoado';
      }
    }

    // Atualizar dados
    user.gold += ganho;
    user.xp += resultado === 'sucesso' ? emprego.xp : Math.floor(emprego.xp * 0.5);
    user.cooldowns[emprego.nome] = agora + (emprego.cooldown * 1000);
    
    // Melhorar habilidades baseado no trabalho
    if (resultado === 'sucesso') {
      if (emprego.nome.includes('Ferreiro') || emprego.nome.includes('Gladiador')) {
        user.skills.forca += 0.1;
      } else if (emprego.nome.includes('Ladrão') || emprego.nome.includes('Caçador')) {
        user.skills.agilidade += 0.1;
      } else if (emprego.nome.includes('Mago') || emprego.nome.includes('Alquimista')) {
        user.skills.inteligencia += 0.1;
      }
    }
    
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
    let mensagem = `💰 *${resultado.toUpperCase()}!*\n\n` +
      `${emprego.emoji} *${emprego.nome}*\n` +
      `🪙 Ganho: ${ganho >= 0 ? '+' : ''}${ganho} golds\n` +
      `✨ XP: ${resultado === 'sucesso' ? '+' : ''}${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})\n`;

    if (bonusRegiao > 0 || bonusNivel > 0) {
      mensagem += `🎁 Bônus: ${bonusRegiao > 0 ? `+${bonusRegiao} (região) ` : ''}` +
        `${bonusNivel > 0 ? `+${bonusNivel} (nível ${user.nivel})` : ''}\n`;
    }

    // Mensagens especiais para falhas
    if (resultado === 'preso') {
      mensagem += `\n🚨 *Você foi preso!* Perdeu ${-ganho}g e ficou sem trabalhar hoje.\n` +
        `⏳ Poderá trabalhar novamente em ${emprego.cooldown * 2}s`;
      user.cooldowns[emprego.nome] = agora + (emprego.cooldown * 2000);
    } else if (resultado === 'amaldiçoado') {
      mensagem += `\n👹 *Você foi amaldiçoado!* Perdeu ${-ganho}g e 10% de XP.\n` +
        `Sua inteligência foi reduzida temporariamente.`;
      user.xp = Math.floor(user.xp * 0.9);
      user.skills.inteligencia = Math.max(1, user.skills.inteligencia - 0.2);
    }

    if (nivelUp) {
      mensagem += `\n🎉 *NOVO NÍVEL ${user.nivel}!* Bônus aumentado para ${user.nivel * 2}%`;
    }

    mensagem += `\n⏱️ Próximo trabalho em ${emprego.cooldown}s`;

    await sendText(mensagem);
    atualizarRank();
  }
};
