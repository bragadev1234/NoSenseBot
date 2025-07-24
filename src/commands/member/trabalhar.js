const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

// Banco de dados em memória
const rpgData = {};

// Lista de empregos melhorados
const EMPREGOS = {
  FAZENDEIRO: {
    nome: "👨‍🌾 Fazendeiro",
    emoji: "👨‍🌾",
    cooldown: 10,
    ganho: { min: 15, max: 30 },
    xp: 2,
    desc: "Cultiva alimentos básicos para a vila"
  },
  MINEIRO: {
    nome: "⛏️ Mineiro",
    emoji: "⛏️",
    cooldown: 15,
    ganho: { min: 20, max: 40 },
    xp: 3,
    desc: "Extrai minerais preciosos das cavernas"
  },
  PESCADOR: {
    nome: "🎣 Pescador",
    emoji: "🎣",
    cooldown: 12,
    ganho: { min: 18, max: 35 },
    xp: 2,
    desc: "Pesca peixes e frutos do mar"
  },
  ALQUIMISTA: {
    nome: "🧪 Alquimista",
    emoji: "🧪",
    cooldown: 25,
    ganho: { min: 30, max: 60 },
    xp: 5,
    desc: "Cria poções e elixires mágicos"
  },
  CAÇADOR: {
    nome: "🏹 Caçador",
    emoji: "🏹",
    cooldown: 20,
    ganho: { min: 25, max: 50 },
    xp: 4,
    desc: "Caça criaturas perigosas"
  },
  FERREIRO: {
    nome: "⚒️ Ferreiro",
    emoji: "⚒️",
    cooldown: 18,
    ganho: { min: 22, max: 45 },
    xp: 4,
    desc: "Forja armas e armaduras"
  }
};

// Sistema de níveis
const calcularNivel = (xp) => Math.floor(Math.sqrt(xp / 10)) + 1;
const xpParaProxNivel = (nivel) => Math.pow(nivel, 2) * 10;

module.exports = {
  name: "trabalhar",
  description: "Trabalhe para ganhar golds e XP",
  commands: ["trabalhar", "work", "job"],
  usage: `${PREFIX}trabalhar <emprego>`,
  
  handle: async ({ sendText, userJid, args }) => {
    const userId = onlyNumbers(userJid);
    const comando = args[0]?.toLowerCase();

    // Inicializar dados do usuário se não existirem
    if (!rpgData[userId]) {
      rpgData[userId] = {
        gold: 0,
        xp: 0,
        nivel: 1,
        cooldowns: {},
        historico: []
      };
    }

    const user = rpgData[userId];

    // Mostrar lista de empregos se não especificar
    if (!comando || !Object.values(EMPREGOS).some(e => e.nome.toLowerCase().includes(comando))) {
      const listaEmpregos = Object.values(EMPREGOS).map(emprego => 
        `${emprego.emoji} *${emprego.nome}* - ${PREFIX}trabalhar ${emprego.nome.split(' ')[1].toLowerCase()}\n` +
        `⏱️ ${emprego.cooldown}s | 🪙 ${emprego.ganho.min}-${emprego.ganho.max} golds | ✨ +${emprego.xp} XP\n` +
        `📝 ${emprego.desc}`
      ).join('\n\n');

      await sendText(
        `*🏘️ EMPREGOS DISPONÍVEIS* (Nível ${user.nivel})\n\n` +
        `${listaEmpregos}\n\n` +
        `💰 Seu saldo: ${user.gold} golds | ✨ ${user.xp}/${xpParaProxNivel(user.nivel)} XP\n` +
        `📌 Exemplo: ${PREFIX}trabalhar mineiro`
      );
      return;
    }

    // Encontrar emprego
    const emprego = Object.values(EMPREGOS).find(e => 
      e.nome.toLowerCase().includes(comando)
    );

    if (!emprego) {
      await sendText(`❌ Emprego não encontrado! Use ${PREFIX}trabalhar para ver a lista.`);
      return;
    }

    // Verificar cooldown
    const agora = Date.now();
    const cooldownRestante = (user.cooldowns[emprego.nome] || 0) - agora;

    if (cooldownRestante > 0) {
      const segundos = Math.ceil(cooldownRestante / 1000);
      await sendText(
        `⏳ *Aguarde ${segundos}s*\n` +
        `Você pode trabalhar como ${emprego.emoji} ${emprego.nome} novamente em ${segundos} segundos.`
      );
      return;
    }

    // Trabalhar
    const ganho = Math.floor(
      Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)
    ) + emprego.ganho.min;

    // Bônus por nível (1% por nível)
    const bonus = Math.floor(ganho * (user.nivel * 0.01));
    const ganhoTotal = ganho + bonus;

    // Atualizar dados
    user.gold += ganhoTotal;
    user.xp += emprego.xp;
    user.cooldowns[emprego.nome] = agora + (emprego.cooldown * 1000);
    
    // Verificar se subiu de nível
    const novoNivel = calcularNivel(user.xp);
    const nivelUp = novoNivel > user.nivel;
    user.nivel = novoNivel;

    // Adicionar ao histórico (mantém apenas os últimos 5)
    user.historico.unshift({
      emprego: emprego.nome,
      ganho: ganhoTotal,
      quando: new Date().toLocaleTimeString()
    });
    user.historico = user.historico.slice(0, 5);

    // Montar mensagem
    let mensagem = `💰 *TRABALHO REALIZADO*\n\n` +
      `${emprego.emoji} *${emprego.nome}*\n` +
      `🪙 Ganho: +${ganhoTotal} golds (${bonus > 0 ? `+${bonus} bônus nível ${user.nivel}` : 'sem bônus'})\n` +
      `✨ XP: +${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})\n`;

    if (nivelUp) {
      mensagem += `\n🎉 *NOVO NÍVEL ${user.nivel}!* Bônus aumentado para ${user.nivel}%`;
    }

    mensagem += `\n⏱️ Próximo trabalho em ${emprego.cooldown}s`;

    await sendText(mensagem);
  }
};
