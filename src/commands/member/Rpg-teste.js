const { PREFIX } = require('../../config');
const { onlyNumbers, toUserJid } = require('../../utils');
const { InvalidParameterError } = require('../../errors');
const path = require('node:path');
const { ASSETS_DIR } = require('../../config');

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
  FLORESTA: {
    nome: "🌳 Floresta Encantada",
    taxaImposto: 0.1,
    bonus: 0.3,
    custoViagem: 200
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
    regiao: "REINO",
    requisito: { nivel: 5 }
  },
  BRUXO: {
    nome: "🔮 Bruxo",
    emoji: "🔮",
    cooldown: 30,
    ganho: { min: 60, max: 120 },
    xp: 8,
    desc: "Invoca magias poderosas",
    regiao: "FLORESTA",
    requisito: { nivel: 7 }
  },
  
  // Especiais
  CAÇADOR: {
    nome: "🏹 Caçador",
    emoji: "🏹",
    cooldown: 20,
    ganho: { min: 40, max: 80 },
    xp: 5,
    desc: "Caça criaturas raras",
    regiao: "FLORESTA",
    risco: 0.2 // 20% chance de falhar
  },
  LADRAO: {
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
const aplicarImpostos = (userId) => {
  const agora = new Date();
  const user = rpgData[userId];
  
  if (!user) return;
  
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
};

// Inicializa jogador
const initPlayer = (userId) => {
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
      criadoEm: new Date().toISOString()
    };
  }
  return rpgData[userId];
};

// Comando: !menurpg
const menuRPG = async ({ sendReply, userJid }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  
  const mensagem = `🎮 *MENU RPG* 🎮\n\n` +
    `💰 Saldo: ${user.gold} golds\n` +
    `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)\n` +
    `📍 Região: ${REGIOES[user.regiao].nome}\n\n` +
    `📌 *Comandos disponíveis:*\n` +
    `🔹 ${PREFIX}rank - Ver ranking global\n` +
    `🔹 ${PREFIX}empregos - Listar empregos\n` +
    `🔹 ${PREFIX}trabalhar <emprego> - Trabalhar\n` +
    `🔹 ${PREFIX}viajar <região> - Viajar para outra região\n` +
    `🔹 ${PREFIX}perfil - Ver seu perfil\n\n` +
    `Digite ${PREFIX}ajuda rpg para mais informações`;
  
  await sendReply(mensagem);
};

// Comando: !rank
const rankRPG = async ({ sendReply, userJid }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  atualizarRank();
  
  const posicao = rankGlobal.findIndex(u => u.userId === userId) + 1;
  const top5 = rankGlobal.slice(0, 5).map((u, i) => 
    `${i+1}. @${u.userId} - ${u.gold} golds (Nv. ${u.nivel})`
  ).join('\n');
  
  await sendReply(
    `🏆 *RANKING GLOBAL* 🏆\n\n` +
    `${top5}\n\n` +
    `📍 Sua posição: ${posicao || 'Não ranqueado'}\n` +
    `💰 Seu saldo: ${user.gold} golds\n` +
    `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)`
  );
};

// Comando: !empregos
const listarEmpregos = async ({ sendReply, userJid }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  
  const empregosDisponiveis = Object.values(EMPREGOS)
    .filter(e => {
      const mesmaRegiao = e.regiao === user.regiao;
      const temRequisito = !e.requisito || user.nivel >= e.requisito.nivel;
      return mesmaRegiao || user.nivel >= 5 || temRequisito;
    })
    .map(emp => 
      `${emp.emoji} *${emp.nome}* - ${PREFIX}trabalhar ${emp.nome.split(' ')[1].toLowerCase()}\n` +
      `⏱️ ${emp.cooldown}s | 🪙 ${emp.ganho.min}-${emp.ganho.max} golds | ✨ +${emp.xp} XP\n` +
      `📝 ${emp.desc}${emp.risco ? ` | ☠️ Risco: ${emp.risco*100}%` : ''}` +
      `${emp.requisito ? ` | 🔐 Nv. ${emp.requisito.nivel}+` : ''}`
    ).join('\n\n');
  
  await sendReply(
    `🏘️ *EMPREGOS DISPONÍVEIS* (${REGIOES[user.regiao].nome})\n\n` +
    `${empregosDisponiveis}\n\n` +
    `💰 Saldo: ${user.gold} golds | ✨ ${user.xp}/${xpParaProxNivel(user.nivel)} XP\n` +
    `📊 Nível: ${user.nivel} | 📍 ${REGIOES[user.regiao].nome}\n\n` +
    `📌 Ex: ${PREFIX}trabalhar mineiro`
  );
};

// Comando: !trabalhar
const trabalharRPG = async ({ sendReply, userJid, args }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  const comando = args[0]?.toLowerCase();
  
  if (!comando) {
    return await sendReply(
      `❌ Uso correto: ${PREFIX}trabalhar <emprego>\n` +
      `Use ${PREFIX}empregos para ver a lista de empregos disponíveis.`
    );
  }

  const emprego = Object.values(EMPREGOS).find(e => 
    e.nome.toLowerCase().includes(comando)
  );

  if (!emprego) {
    return await sendReply(`❌ Emprego não encontrado! Use ${PREFIX}empregos para listar.`);
  }

  // Verificar requisitos
  if (emprego.requisito && user.nivel < emprego.requisito.nivel) {
    return await sendReply(
      `🔐 *Emprego bloqueado!*\n` +
      `Você precisa ser nível ${emprego.requisito.nivel}+ para trabalhar como ${emprego.nome}.\n` +
      `Seu nível atual: ${user.nivel}`
    );
  }

  // Verificar região
  if (emprego.regiao !== user.regiao && user.nivel < 5) {
    return await sendReply(
      `🌍 *Emprego bloqueado!*\n` +
      `Você precisa estar na região ${REGIOES[emprego.regiao].nome} ou ter nível 5+.\n` +
      `Sua região atual: ${REGIOES[user.regiao].nome}`
    );
  }

  // Verificar cooldown
  const agora = Date.now();
  if (user.cooldowns[emprego.nome] > agora) {
    const segundos = Math.ceil((user.cooldowns[emprego.nome] - agora) / 1000);
    return await sendReply(
      `⏳ *Aguarde ${segundos}s*\n` +
      `Você pode trabalhar como ${emprego.emoji} ${emprego.nome} novamente em ${segundos} segundos.`
    );
  }

  // Trabalhar com riscos
  let resultado = 'sucesso';
  let ganho = Math.floor(Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)) + emprego.ganho.min;

  // Aplicar bônus
  const bonusRegiao = Math.floor(ganho * REGIOES[user.regiao].bonus);
  const bonusNivel = Math.floor(ganho * (user.nivel * 0.02));
  ganho += bonusRegiao + bonusNivel;

  // Verificar riscos
  if (emprego.risco && Math.random() < emprego.risco) {
    resultado = 'fracasso';
    ganho = Math.floor(ganho * 0.5) * -1;
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

  await sendReply(mensagem);
  atualizarRank();
};

// Comando: !viajar
const viajarRPG = async ({ sendReply, userJid, args }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  const regiaoDestino = args[0]?.toUpperCase();
  
  if (!regiaoDestino || !REGIOES[regiaoDestino]) {
    const regioesDisponiveis = Object.entries(REGIOES)
      .map(([key, reg]) => `🔹 ${key.toLowerCase()} - ${reg.nome} (${reg.custoViagem} golds)`)
      .join('\n');
    
    return await sendReply(
      `🌍 *VIAGEM* 🌍\n\n` +
      `Regiões disponíveis:\n${regioesDisponiveis}\n\n` +
      `Uso: ${PREFIX}viajar <região>\n` +
      `Ex: ${PREFIX}viajar reino`
    );
  }
  
  if (user.regiao === regiaoDestino) {
    return await sendReply(
      `ℹ️ Você já está na região ${REGIOES[regiaoDestino].nome}!`
    );
  }
  
  const custoViagem = REGIOES[regiaoDestino].custoViagem;
  if (user.gold < custoViagem) {
    return await sendReply(
      `❌ *Fundos insuficientes!*\n` +
      `Você precisa de ${custoViagem} golds para viajar para ${REGIOES[regiaoDestino].nome}.\n` +
      `Seu saldo: ${user.gold} golds`
    );
  }
  
  // Realizar viagem
  user.gold -= custoViagem;
  user.regiao = regiaoDestino;
  
  await sendReply(
    `✈️ *Viagem concluída!*\n\n` +
    `Você chegou em ${REGIOES[regiaoDestino].nome}!\n` +
    `💰 Custo: ${custoViagem} golds\n` +
    `🪙 Saldo atual: ${user.gold} golds\n\n` +
    `Use ${PREFIX}empregos para ver as oportunidades nesta região!`
  );
};

// Comando: !perfil
const perfilRPG = async ({ sendReply, userJid }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  
  const historicoTrabalhos = user.historico
    .map(t => `${t.emprego} (${t.resultado === 'sucesso' ? '✅' : '❌'}): ${t.ganho >= 0 ? '+' : ''}${t.ganho}`)
    .join('\n') || 'Nenhum trabalho recente';
  
  await sendReply(
    `📜 *PERFIL RPG* 📜\n\n` +
    `👤 Jogador: @${userId}\n` +
    `💰 Gold: ${user.gold}\n` +
    `📊 Nível: ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)\n` +
    `📍 Região: ${REGIOES[user.regiao].nome}\n\n` +
    `🛠️ *Habilidades*\n` +
    `💪 Força: ${user.skills.forca}\n` +
    `🏃 Agilidade: ${user.skills.agilidade}\n` +
    `🧠 Inteligência: ${user.skills.inteligencia}\n\n` +
    `📅 Criado em: ${new Date(user.criadoEm).toLocaleDateString()}\n\n` +
    `📝 *Últimos trabalhos*\n${historicoTrabalhos}`
  );
};

module.exports = {
  name: "rpg",
  description: "Sistema RPG completo com economia, empregos e ranking",
  commands: ["rpg", "menurpg", "rank", "empregos", "trabalhar", "viajar", "perfil"],
  usage: `${PREFIX}rpg <comando>`,
  
  handle: async ({ sendReply, sendErrorReply, userJid, args, command }) => {
    try {
      const comando = command.toLowerCase();
      
      switch(comando) {
        case 'menurpg':
        case 'rpg':
          return await menuRPG({ sendReply, userJid });
          
        case 'rank':
          return await rankRPG({ sendReply, userJid });
          
        case 'empregos':
          return await listarEmpregos({ sendReply, userJid });
          
        case 'trabalhar':
          return await trabalharRPG({ sendReply, userJid, args });
          
        case 'viajar':
          return await viajarRPG({ sendReply, userJid, args });
          
        case 'perfil':
          return await perfilRPG({ sendReply, userJid });
          
        default:
          await sendErrorReply(
            `Comando inválido! Use ${PREFIX}menurpg para ver as opções.`
          );
      }
    } catch (error) {
      console.error('Erro no comando RPG:', error);
      await sendErrorReply(
        `❌ Ocorreu um erro ao processar o comando. Tente novamente mais tarde.`
      );
    }
  }
};
