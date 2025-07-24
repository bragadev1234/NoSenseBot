const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

// Banco de dados em memória
const rpgData = {};
const rankGlobal = [];
const realeza = {};

// Sistema de cidades/regiões
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

// Lista de empregos
const EMPREGOS = {
  FAZENDEIRO: { nome: "👨‍🌾 Fazendeiro", emoji: "👨‍🌾", cooldown: 10, ganho: { min: 15, max: 30 }, xp: 2, desc: "Cultiva alimentos básicos para a vila", regiao: "VILAREJO" },
  PESCADOR: { nome: "🎣 Pescador", emoji: "🎣", cooldown: 12, ganho: { min: 18, max: 35 }, xp: 2, desc: "Pesca em rios e lagos locais", regiao: "VILAREJO" },
  LENHADOR: { nome: "🪓 Lenhador", emoji: "🪓", cooldown: 12, ganho: { min: 20, max: 40 }, xp: 2, desc: "Corta madeira para construção", regiao: "VILAREJO" },
  MINEIRO: { nome: "⛏️ Mineiro", emoji: "⛏️", cooldown: 15, ganho: { min: 25, max: 50 }, xp: 3, desc: "Extrai minérios preciosos das minas", regiao: "METROPOLE" },
  FERREIRO: { nome: "⚒️ Ferreiro", emoji: "⚒️", cooldown: 18, ganho: { min: 30, max: 60 }, xp: 4, desc: "Forja armas e ferramentas de qualidade", regiao: "METROPOLE" },
  COZINHEIRO: { nome: "👨‍🍳 Cozinheiro", emoji: "👨‍🍳", cooldown: 15, ganho: { min: 25, max: 45 }, xp: 3, desc: "Prepara refeições deliciosas", regiao: "METROPOLE" },
  ALQUIMISTA: { nome: "🧪 Alquimista", emoji: "🧪", cooldown: 25, ganho: { min: 50, max: 100 }, xp: 6, desc: "Cria poções mágicas e elixires raros", regiao: "REINO", requisito: "inteligencia > 3" },
  MAGO: { nome: "🧙‍♂️ Mago", emoji: "🧙‍♂️", cooldown: 30, ganho: { min: 60, max: 120 }, xp: 8, desc: "Estuda artes arcanas e feitiços poderosos", regiao: "REINO", requisito: "inteligencia > 5" },
  BRUXO: { nome: "🔮 Bruxo", emoji: "🔮", cooldown: 28, ganho: { min: 55, max: 110 }, xp: 7, desc: "Domina magias das trevas e previsões", regiao: "REINO", requisito: "inteligencia > 4" },
  CAÇADOR: { nome: "🏹 Caçador", emoji: "🏹", cooldown: 20, ganho: { min: 40, max: 80 }, xp: 5, desc: "Caça criaturas raras e perigosas", regiao: "METROPOLE", risco: 0.2 },
  LADRÃO: { nome: "🦹 Ladrão", emoji: "🦹", cooldown: 15, ganho: { min: 80, max: 160 }, xp: 7, desc: "Rouba dos ricos... ou de quem estiver no caminho", regiao: "SUBMUNDO", risco: 0.4 },
  MACUMBEIRO: { nome: "⚰️ Macumbeiro", emoji: "⚰️", cooldown: 22, ganho: { min: 70, max: 140 }, xp: 6, desc: "Pratica rituais misteriosos e perigosos", regiao: "SUBMUNDO", risco: 0.3, requisito: "inteligencia > 2" },
  GLADIADOR: { nome: "⚔️ Gladiador", emoji: "⚔️", cooldown: 18, ganho: { min: 45, max: 90 }, xp: 6, desc: "Luta na arena por fama e fortuna", regiao: "METROPOLE", risco: 0.25 }
};

// Funções básicas
const calcularNivel = (xp) => Math.floor(Math.pow(xp / 100, 0.6)) + 1;
const xpParaProxNivel = (nivel) => Math.pow(nivel / 0.6, 1 / 0.6) * 100;

const atualizarRank = () => {
  rankGlobal.length = 0;
  for (const [userId, data] of Object.entries(rpgData)) {
    rankGlobal.push({ userId, gold: data.gold, nivel: data.nivel, xp: data.xp, regiao: data.regiao });
  }
  rankGlobal.sort((a, b) => b.gold - a.gold || b.nivel - a.nivel);
};

const aplicarImpostos = (userId) => {
  const user = rpgData[userId];
  if (!user) return;

  const agora = new Date();
  const diffHoras = (agora - (user.ultimoImposto || 0)) / (1000 * 60 * 60);

  if (diffHoras >= 12) {
    const imposto = Math.floor(user.gold * REGIOES[user.regiao || 'VILAREJO'].taxaImposto);
    if (imposto > 0) {
      user.gold -= imposto;
      user.ultimoImposto = agora;
      realeza[user.regiao] = realeza[user.regiao] || { tesouro: 0 };
      realeza[user.regiao].tesouro += imposto;
    }
  }
};

const verificarRequisito = (user, requisito) => {
  if (!requisito) return true;
  const [skill, operador, valor] = requisito.split(' ');
  return eval(`user.skills.${skill} ${operador} ${valor}`);
};

// Módulo RPG principal
module.exports = {
  name: "rpg",
  description: "Sistema RPG completo",
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
        skills: { forca: 1, agilidade: 1, inteligencia: 1 },
        historico: [],
        ultimoImposto: 0,
        historicoImpostos: []
      };
    }

    const user = rpgData[userId];
    aplicarImpostos(userId);

    // Menu principal
    if (!comando || comando === 'menu') {
      return sendReply(
        `🎮 *MENU RPG*\n\n💰 Saldo: ${user.gold}g\n📊 Nível: ${user.nivel}\n📍 ${REGIOES[user.regiao].nome}\n\n` +
        `🔹 *COMANDOS*\n▸ ${PREFIX}rpg menu\n▸ ${PREFIX}rpg empregos\n▸ ${PREFIX}trabalhar <emprego>\n` +
        `▸ ${PREFIX}rpg rank\n▸ ${PREFIX}rpg reino\n▸ ${PREFIX}rpg mudar <região>\n▸ ${PREFIX}rpg status`
      );
    }

    // Comandos específicos
    if (comando === 'status') {
      return sendReply(
        `📊 *STATUS*\n\n💰 ${user.gold}g\n✨ ${user.xp}/${xpParaProxNivel(user.nivel)} XP\n` +
        `📍 ${REGIOES[user.regiao].nome}\n\n⚔️ Força ${user.skills.forca} | Agilidade ${user.skills.agilidade} | Inteligência ${user.skills.inteligencia}`
      );
    }

    if (comando === 'rank') {
      atualizarRank();
      const posicao = rankGlobal.findIndex(u => u.userId === userId) + 1;
      const top5 = rankGlobal.slice(0, 5).map((u, i) => 
        `${i+1}. @${u.userId} - ${u.gold}g (Nv. ${u.nivel})`
      ).join('\n');
      return sendReply(`🏆 *RANKING*\n\n${top5}\n\n📍 Sua posição: ${posicao}`);
    }

    if (comando === 'reino') {
      const regiao = REGIOES[user.regiao];
      const tesouro = realeza[user.regiao]?.tesouro || 0;
      return sendReply(
        `🏰 *${regiao.nome}*\n\n💰 Tesouro: ${tesouro}g\nℹ️ ${regiao.desc}`
      );
    }

    if (comando === 'mudar') {
      const regiaoDesejada = args[1]?.toUpperCase();
      if (!REGIOES[regiaoDesejada]) {
        return sendReply(
          `🌍 *MUDAR REGIÃO*\n\nCusto: 200g\nRegiões:\n` +
          Object.entries(REGIOES).map(([k,v]) => `▸ ${v.nome}: ${PREFIX}rpg mudar ${k.toLowerCase()}`).join('\n')
        );
      }
      
      if (user.gold < 200) return sendReply(`❌ Precisa de 200g para viajar!`);
      
      user.gold -= 200;
      user.regiao = regiaoDesejada;
      return sendReply(
        `✈️ Chegou em ${REGIOES[regiaoDesejada].nome}\n💰 Saldo: ${user.gold}g`
      );
    }

    if (comando === 'empregos') {
      const empregos = Object.values(EMPREGOS)
        .filter(e => e.regiao === user.regiao || user.nivel >= 5)
        .map(e => `${e.emoji} ${e.nome}: ${PREFIX}trabalhar ${e.nome.split(' ')[1].toLowerCase()}`)
        .join('\n');
      return sendReply(`💼 *EMPREGOS*\n\n${empregos}`);
    }

    return sendReply(`❌ Comando inválido. Use ${PREFIX}rpg menu`);
  }
};

// Comando trabalhar
module.exports.trabalhar = {
  name: "trabalhar",
  description: "Trabalha em um emprego",
  commands: ["trabalhar", "work"],
  usage: `${PREFIX}trabalhar <emprego>`,
  
  handle: async ({ sendReply, userJid, args }) => {
    const userId = onlyNumbers(userJid);
    if (!rpgData[userId]) return sendReply(`❌ Use ${PREFIX}rpg menu primeiro`);

    const user = rpgData[userId];
    aplicarImpostos(userId);
    const trabalhoArg = args[0]?.toLowerCase();
    if (!trabalhoArg) return sendReply(`💼 Use: ${PREFIX}trabalhar <emprego>`);

    const emprego = Object.values(EMPREGOS).find(e => 
      e.nome.toLowerCase().includes(trabalhoArg)
    );
    if (!emprego) return sendReply(`❌ Emprego não encontrado!`);

    // Verificações
    if (emprego.regiao !== user.regiao && user.nivel < 5) {
      return sendReply(`❌ Precisa estar em ${REGIOES[emprego.regiao].nome} ou nível 5+`);
    }

    if (emprego.requisito && !verificarRequisito(user, emprego.requisito)) {
      return sendReply(`🔒 Requisito: ${emprego.requisito}`);
    }

    const agora = Date.now();
    if (user.cooldowns[emprego.nome] > agora) {
      const segundos = Math.ceil((user.cooldowns[emprego.nome] - agora) / 1000);
      return sendReply(`⏳ Aguarde ${segundos}s para trabalhar novamente`);
    }

    // Trabalhar
    let ganho = Math.floor(Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)) + emprego.ganho.min;
    let resultado = 'sucesso';

    if (emprego.risco && Math.random() < emprego.risco) {
      resultado = 'fracasso';
      ganho = -Math.floor(ganho * 0.5);
    }

    // Aplicar bônus de região
    ganho += Math.floor(ganho * REGIOES[user.regiao].bonus);

    // Atualizar dados
    user.gold += ganho;
    user.xp += (resultado === 'sucesso') ? emprego.xp : Math.floor(emprego.xp * 0.5);
    user.cooldowns[emprego.nome] = agora + (emprego.cooldown * 1000);
    
    // Melhorar habilidades
    if (resultado === 'sucesso') {
      if (emprego.nome.includes('Ferreiro') || emprego.nome.includes('Gladiador')) user.skills.forca += 0.1;
      else if (emprego.nome.includes('Ladrão') || emprego.nome.includes('Caçador')) user.skills.agilidade += 0.1;
      else if (emprego.nome.includes('Mago') || emprego.nome.includes('Alquimista')) user.skills.inteligencia += 0.1;
    }

    // Verificar nível
    const novoNivel = calcularNivel(user.xp);
    if (novoNivel > user.nivel) {
      user.nivel = novoNivel;
    }

    // Mensagem de resultado
    let mensagem = `💰 *${resultado.toUpperCase()}*\n${emprego.emoji} ${emprego.nome}\n`;
    mensagem += `🪙 ${ganho >= 0 ? '+' : ''}${ganho}g | ✨ ${emprego.xp} XP\n`;
    mensagem += `⏱️ Próximo trabalho em ${emprego.cooldown}s`;

    if (novoNivel > user.nivel) {
      mensagem += `\n🎉 Subiu para nível ${novoNivel}!`;
    }

    await sendReply(mensagem);
    atualizarRank();
  }
};
