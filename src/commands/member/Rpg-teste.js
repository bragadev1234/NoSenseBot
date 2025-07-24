const { PREFIX } = require('../../config');
const { onlyNumbers, toUserJid } = require('../../utils');
const path = require('node:path');
const fs = require('fs');
const { ASSETS_DIR } = require('../../config');

// Sistema de persistência em arquivo JSON
const RPG_DATA_FILE = path.join(__dirname, 'rpg_data.json');

// Carrega dados do arquivo ou inicializa
let rpgData = {};
let rankGlobal = [];

try {
  const data = fs.readFileSync(RPG_DATA_FILE, 'utf8');
  const parsed = JSON.parse(data);
  rpgData = parsed.rpgData || {};
  rankGlobal = parsed.rankGlobal || [];
} catch (err) {
  if (err.code !== 'ENOENT') console.error('Erro ao carregar dados RPG:', err);
}

// Função para salvar dados
const saveData = () => {
  try {
    fs.writeFileSync(RPG_DATA_FILE, JSON.stringify({ rpgData, rankGlobal }, null, 2));
  } catch (err) {
    console.error('Erro ao salvar dados RPG:', err);
  }
};

// Sistema de regiões
const REGIOES = {
  VILAREJO: {
    nome: "🏡 Vilarejo",
    taxaImposto: 0.05,
    bonus: 0,
    custoViajar: 50,
    nivelRequerido: 1
  },
  METROPOLE: {
    nome: "🏙️ Metrópole",
    taxaImposto: 0.15,
    bonus: 0.2,
    custoViajar: 200,
    nivelRequerido: 3
  },
  REINO: {
    nome: "🏰 Reino",
    taxaImposto: 0.25,
    bonus: 0.4,
    custoViajar: 500,
    nivelRequerido: 5
  },
  CEMITERIO: {
    nome: "⚰️ Cemitério Maldito",
    taxaImposto: 0.35,
    bonus: 0.6,
    custoViajar: 1000,
    nivelRequerido: 10
  }
};

// Sistema de empregos expandido
const EMPREGOS = {
  // Básicos (Vilarejo)
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
    desc: "Pesca em rios e lagos próximos",
    regiao: "VILAREJO"
  },
  LENHADOR: {
    nome: "🪓 Lenhador",
    emoji: "🪓",
    cooldown: 8,
    ganho: { min: 12, max: 25 },
    xp: 1,
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
    cooldown: 14,
    ganho: { min: 22, max: 45 },
    xp: 3,
    desc: "Prepara refeições para os cidadãos",
    regiao: "METROPOLE"
  },

  // Avançados (Reino)
  ALQUIMISTA: {
    nome: "🧪 Alquimista",
    emoji: "🧪",
    cooldown: 25,
    ganho: { min: 50, max: 100 },
    xp: 6,
    desc: "Cria poções mágicas e elixires raros",
    regiao: "REINO"
  },
  MAGO: {
    nome: "🧙‍♂️ Mago",
    emoji: "🧙‍♂️",
    cooldown: 30,
    ganho: { min: 60, max: 120 },
    xp: 8,
    desc: "Estuda artes arcanas e feitiços poderosos",
    regiao: "REINO"
  },
  BRUXO: {
    nome: "🔮 Bruxo",
    emoji: "🔮",
    cooldown: 28,
    ganho: { min: 55, max: 110 },
    xp: 7,
    desc: "Invoca espíritos e pratica magia negra",
    regiao: "REINO",
    risco: 0.15
  },

  // Especiais (Cemitério)
  NECROMANTE: {
    nome: "☠️ Necromante",
    emoji: "☠️",
    cooldown: 35,
    ganho: { min: 80, max: 160 },
    xp: 10,
    desc: "Controla os mortos para fazer seu trabalho sujo",
    regiao: "CEMITERIO",
    risco: 0.3
  },
  CAÇADORDEMORTOS: {
    nome: "⚔️ Caçador de Mortos",
    emoji: "⚔️",
    cooldown: 22,
    ganho: { min: 70, max: 140 },
    xp: 9,
    desc: "Protege os vivos das criaturas da noite",
    regiao: "CEMITERIO",
    risco: 0.25
  },

  // Profissões de risco
  LADRÃO: {
    nome: "🦹 Ladrão",
    emoji: "🦹",
    cooldown: 15,
    ganho: { min: 80, max: 160 },
    xp: 7,
    desc: "Rouba dos ricos... ou de quem estiver no caminho",
    regiao: "METROPOLE",
    risco: 0.4
  },
  GLADIADOR: {
    nome: "⚔️ Gladiador",
    emoji: "⚔️",
    cooldown: 20,
    ganho: { min: 40, max: 200 },
    xp: 8,
    desc: "Luta na arena por fama e fortuna",
    regiao: "REINO",
    risco: 0.35
  }
};

// Sistema de níveis avançado
const calcularNivel = (xp) => Math.floor(Math.pow(xp / 100, 0.6)) + 1;
const xpParaProxNivel = (nivel) => Math.pow(nivel / 0.6, 1 / 0.6) * 100;

// Atualizar ranking global
const atualizarRank = () => {
  rankGlobal = Object.entries(rpgData).map(([userId, data]) => ({
    userId,
    gold: data.gold,
    nivel: data.nivel,
    xp: data.xp,
    regiao: data.regiao
  })).sort((a, b) => b.gold - a.gold || b.nivel - a.nivel || b.xp - a.xp);
  saveData();
};

// Sistema de impostos
const aplicarImpostos = (userId) => {
  const user = rpgData[userId];
  if (!user) return;

  const agora = new Date();
  const ultimoImposto = user.ultimoImposto ? new Date(user.ultimoImposto) : null;
  
  // Aplica imposto a cada hora real
  if (!ultimoImposto || (agora - ultimoImposto) >= 3600000) {
    const regiao = REGIOES[user.regiao || 'VILAREJO'];
    const imposto = Math.floor(user.gold * regiao.taxaImposto);
    
    if (imposto > 0) {
      user.gold -= imposto;
      user.ultimoImposto = agora.toISOString();
      user.historicoImpostos = user.historicoImpostos || [];
      user.historicoImpostos.push({
        valor: imposto,
        quando: agora.toLocaleTimeString()
      });
      saveData();
    }
  }
};

// Inicializar jogador
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
        inteligencia: 1,
        sorte: 1
      },
      criadoEm: new Date().toISOString(),
      ultimoImposto: null,
      historicoImpostos: []
    };
    saveData();
  }
  return rpgData[userId];
};

// Comando: !menurpg
const menuRPG = async ({ sendReply, userJid }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  
  const mensagem = `🎮 *MENU RPG* 🎮\n\n` +
    `💰 *Gold:* ${user.gold}\n` +
    `✨ *XP:* ${user.xp}/${xpParaProxNivel(user.nivel)} (Nível ${user.nivel})\n` +
    `📍 *Região:* ${REGIOES[user.regiao].nome}\n\n` +
    `📊 *Comandos Disponíveis:*\n` +
    `- *${PREFIX}rank* - Ver ranking global\n` +
    `- *${PREFIX}empregos* - Listar empregos disponíveis\n` +
    `- *${PREFIX}trabalhar <emprego>* - Trabalhar\n` +
    `- *${PREFIX}viajar <região>* - Viajar para outra região\n` +
    `- *${PREFIX}status* - Ver seu status completo\n\n` +
    `⚔️ *Skills:*\n` +
    `💪 Força: ${user.skills.forca} | 🏃 Agilidade: ${user.skills.agilidade}\n` +
    `🧠 Inteligência: ${user.skills.inteligencia} | 🍀 Sorte: ${user.skills.sorte}`;

  await sendReply(mensagem);
};

// Comando: !rank
const rankRPG = async ({ sendReply, userJid }) => {
  const userId = onlyNumbers(userJid);
  atualizarRank();
  
  const userPos = rankGlobal.findIndex(u => u.userId === userId) + 1;
  const userData = rankGlobal[userPos - 1] || rpgData[userId];
  
  const top5 = rankGlobal.slice(0, 5).map((u, i) => 
    `${i+1}. @${u.userId} - ${u.gold} golds (Nv. ${u.nivel}, ${REGIOES[u.regiao].nome})`
  ).join('\n');
  
  const mensagem = `🏆 *RANKING GLOBAL* 🏆\n\n` +
    `${top5}\n\n` +
    `📍 *Sua posição:* ${userPos || 'Não ranqueado'}\n` +
    `💰 *Gold:* ${userData.gold} | ✨ *Nível:* ${userData.nivel}\n` +
    `📊 *XP:* ${userData.xp}/${xpParaProxNivel(userData.nivel)} | ` +
    `🌍 *Região:* ${REGIOES[userData.regiao].nome}`;

  await sendReply(mensagem);
};

// Comando: !empregos
const listarEmpregos = async ({ sendReply, userJid }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  aplicarImpostos(userId);
  
  const empregosDisponiveis = Object.values(EMPREGOS)
    .filter(e => e.regiao === user.regiao || user.nivel >= REGIOES[e.regiao].nivelRequerido)
    .map(emp => {
      const riscoMsg = emp.risco ? ` | ☠️ *Risco:* ${(emp.risco * 100).toFixed(0)}%` : '';
      return (
        `${emp.emoji} *${emp.nome}* - \`${PREFIX}trabalhar ${emp.nome.split(' ')[1].toLowerCase()}\`\n` +
        `⏱️ *Cooldown:* ${emp.cooldown}s | 🪙 *Ganho:* ${emp.ganho.min}-${emp.ganho.max} golds\n` +
        `✨ *XP:* +${emp.xp}${riscoMsg}\n` +
        `📝 *Descrição:* ${emp.desc}`
      );
    }).join('\n\n');
  
  const mensagem = `💼 *EMPREGOS DISPONÍVEIS* (${REGIOES[user.regiao].nome})\n\n` +
    `${empregosDisponiveis}\n\n` +
    `ℹ️ Use \`${PREFIX}trabalhar <emprego>\` para trabalhar\n` +
    `Ex: \`${PREFIX}trabalhar mineiro\``;

  await sendReply(mensagem);
};

// Comando: !trabalhar
const trabalhar = async ({ sendReply, userJid, args }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  aplicarImpostos(userId);
  
  const comando = args[0]?.toLowerCase();
  if (!comando) return await listarEmpregos({ sendReply, userJid });

  const emprego = Object.values(EMPREGOS).find(e => 
    e.nome.toLowerCase().includes(comando)
  );
  
  if (!emprego) {
    await sendReply(`❌ Emprego não encontrado! Use \`${PREFIX}empregos\` para listar.`);
    return;
  }

  // Verificar região e nível
  if (emprego.regiao !== user.regiao && user.nivel < REGIOES[emprego.regiao].nivelRequerido) {
    await sendReply(
      `🌍 *Emprego bloqueado!*\n` +
      `Você precisa estar na região ${REGIOES[emprego.regiao].nome} ou ter nível ${REGIOES[emprego.regiao].nivelRequerido}+.\n` +
      `Sua região atual: ${REGIOES[user.regiao].nome} (Nível ${user.nivel})`
    );
    return;
  }

  // Verificar cooldown
  const agora = Date.now();
  if (user.cooldowns[emprego.nome] > agora) {
    const segundos = Math.ceil((user.cooldowns[emprego.nome] - agora) / 1000);
    await sendReply(
      `⏳ *Aguarde ${segundos}s*\n` +
      `Você pode trabalhar como ${emprego.emoji} ${emprego.nome} novamente em ${segundos} segundos.`
    );
    return;
  }

  // Calcular ganhos com bônus
  let ganhoBase = Math.floor(Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)) + emprego.ganho.min;
  let resultado = 'sucesso';
  
  // Bônus de região, nível e sorte
  const bonusRegiao = Math.floor(ganhoBase * REGIOES[user.regiao].bonus);
  const bonusNivel = Math.floor(ganhoBase * (user.nivel * 0.02));
  const bonusSorte = Math.floor(ganhoBase * (user.skills.sorte * 0.01));
  let ganhoTotal = ganhoBase + bonusRegiao + bonusNivel + bonusSorte;

  // Verificar riscos
  if (emprego.risco && Math.random() < emprego.risco) {
    resultado = 'fracasso';
    ganhoTotal = Math.floor(ganhoTotal * 0.5) * -1; // Perde metade
  }

  // Atualizar dados do jogador
  user.gold += ganhoTotal;
  user.xp += resultado === 'sucesso' ? emprego.xp : Math.floor(emprego.xp * 0.5);
  user.cooldowns[emprego.nome] = agora + (emprego.cooldown * 1000);
  
  // Verificar aumento de nível
  const novoNivel = calcularNivel(user.xp);
  const nivelUp = novoNivel > user.nivel;
  if (nivelUp) user.nivel = novoNivel;

  // Atualizar histórico
  user.historico.unshift({
    emprego: emprego.nome,
    resultado,
    ganho: ganhoTotal,
    quando: new Date().toLocaleTimeString()
  });
  user.historico = user.historico.slice(0, 5);

  // Construir mensagem de resultado
  let mensagem = `💰 *${resultado === 'sucesso' ? 'TRABALHO CONCLUÍDO!' : 'TRABALHO FALHOU!'}*\n\n` +
    `${emprego.emoji} *${emprego.nome}*\n` +
    `🪙 *Ganho:* ${ganhoTotal >= 0 ? '+' : ''}${ganhoTotal} golds\n` +
    `✨ *XP:* ${resultado === 'sucesso' ? '+' : ''}${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})\n`;

  // Adicionar bônus à mensagem
  const bonuses = [];
  if (bonusRegiao > 0) bonuses.push(`+${bonusRegiao} (região)`);
  if (bonusNivel > 0) bonuses.push(`+${bonusNivel} (nível)`);
  if (bonusSorte > 0) bonuses.push(`+${bonusSorte} (sorte)`);
  
  if (bonuses.length > 0) {
    mensagem += `🎁 *Bônus:* ${bonuses.join(' ')}\n`;
  }

  if (nivelUp) {
    mensagem += `\n🎉 *NOVO NÍVEL ${user.nivel}!* Todos os bônus aumentados!\n`;
  }

  mensagem += `\n⏱️ *Próximo trabalho em:* ${emprego.cooldown}s`;

  await sendReply(mensagem);
  saveData();
  atualizarRank();
};

// Comando: !viajar
const viajar = async ({ sendReply, userJid, args }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  
  const regiaoDesejada = args[0]?.toUpperCase();
  if (!regiaoDesejada || !REGIOES[regiaoDesejada]) {
    const regioesDisponiveis = Object.entries(REGIOES)
      .map(([key, reg]) => 
        `- *${reg.nome}* (${reg.custoViajar} golds) - Nível ${reg.nivelRequerido} - \`${PREFIX}viajar ${key}\``
      ).join('\n');
    
    await sendReply(
      `✈️ *VIAGEM DISPONÍVEIS*\n\n` +
      `${regioesDisponiveis}\n\n` +
      `📍 Sua região atual: ${REGIOES[user.regiao].nome}\n` +
      `💰 Seu saldo: ${user.gold} golds`
    );
    return;
  }

  const regiao = REGIOES[regiaoDesejada];
  
  // Verificar requisitos
  if (user.nivel < regiao.nivelRequerido) {
    await sendReply(
      `❌ *Viagem bloqueada!*\n` +
      `Você precisa ser nível ${regiao.nivelRequerido} para viajar para ${regiao.nome}.\n` +
      `Seu nível atual: ${user.nivel}`
    );
    return;
  }

  if (user.gold < regiao.custoViajar) {
    await sendReply(
      `❌ *Gold insuficiente!*\n` +
      `Você precisa de ${regiao.custoViajar} golds para viajar para ${regiao.nome}.\n` +
      `Seu saldo atual: ${user.gold} golds`
    );
    return;
  }

  // Realizar viagem
  user.gold -= regiao.custoViajar;
  user.regiao = regiaoDesejada;
  
  await sendReply(
    `✈️ *VIAGEM REALIZADA!*\n\n` +
    `Você chegou em ${regiao.nome}!\n` +
    `💰 Custo: ${regiao.custoViajar} golds\n` +
    `🆕 Saldo: ${user.gold} golds\n\n` +
    `ℹ️ Taxa de impostos: ${regiao.taxaImposto * 100}%\n` +
    `🎁 Bônus de ganhos: +${regiao.bonus * 100}%`
  );
  saveData();
};

// Comando: !status
const statusRPG = async ({ sendReply, userJid }) => {
  const userId = onlyNumbers(userJid);
  const user = initPlayer(userId);
  
  const historicoTrabalhos = user.historico.map(t => 
    `${t.emprego.split(' ')[1]} (${t.resultado === 'sucesso' ? '✅' : '❌'}): ${t.ganho >= 0 ? '+' : ''}${t.ganho}`
  ).join('\n') || 'Nenhum trabalho recente';
  
  const mensagem = `📊 *STATUS RPG* - @${userId}\n\n` +
    `💰 *Gold:* ${user.gold}\n` +
    `✨ *XP:* ${user.xp}/${xpParaProxNivel(user.nivel)} (Nível ${user.nivel})\n` +
    `🌍 *Região:* ${REGIOES[user.regiao].nome}\n\n` +
    `⚔️ *Atributos:*\n` +
    `💪 Força: ${user.skills.forca} | 🏃 Agilidade: ${user.skills.agilidade}\n` +
    `🧠 Inteligência: ${user.skills.inteligencia} | 🍀 Sorte: ${user.skills.sorte}\n\n` +
    `📜 *Histórico recente:*\n${historicoTrabalhos}\n\n` +
    `🕒 *Criado em:* ${new Date(user.criadoEm).toLocaleDateString()}`;

  await sendReply(mensagem);
};

// Exportação principal
module.exports = {
  name: "rpg",
  description: "Sistema RPG completo com economia, empregos e viagens",
  commands: ["rpg", "menurpg", "rank", "empregos", "trabalhar", "viajar", "status"],
  
  handle: async (props) => {
    const { args, command } = props;
    
    switch (command.toLowerCase()) {
      case 'menurpg':
        return await menuRPG(props);
      case 'rank':
        return await rankRPG(props);
      case 'empregos':
        return await listarEmpregos(props);
      case 'trabalhar':
        return await trabalhar(props);
      case 'viajar':
        return await viajar(props);
      case 'status':
        return await statusRPG(props);
      default:
        return await menuRPG(props);
    }
  }
};
