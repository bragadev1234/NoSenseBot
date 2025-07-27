const { PREFIX } = require("../../config");
const { onlyNumbers } = require("../../utils");

// Banco de dados em memória
const rpgData = {};
const rankGlobal = [];

// Sistema de cidades/regiões com diferentes economias
const REGIOES = {
  VILAREJO: {
    nome: "🏡 Vilarejo",
    taxaImposto: 0.05,
    bonus: 0,
    custoViagem: 50,
  },
  METROPOLE: {
    nome: "🏙️ Metrópole",
    taxaImposto: 0.15,
    bonus: 0.2,
    custoViagem: 150,
  },
  REINO: {
    nome: "🏰 Reino",
    taxaImposto: 0.25,
    bonus: 0.4,
    custoViagem: 300,
  },
  CIDADELA_REAL: {
    nome: "👑 Cidadela Real",
    taxaImposto: 0.35,
    bonus: 0.6,
    custoViagem: 1000,
    exclusivo: true,
  },
};

// Títulos baseados no ranking
const TITULOS = {
  1: "👑 Rei/Reina",
  2: "👑 Príncipe/Princesa",
  3: "👑 Duque/Duquesa",
  4: "👑 Conde/Condessa",
  5: "👑 Barão/Baronesa",
  default: ["Plebeu", "Escravo", "Fugitivo", "Mendigo", "Servo"],
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
    regiao: "VILAREJO",
  },
  PESCADOR: {
    nome: "🎣 Pescador",
    emoji: "🎣",
    cooldown: 12,
    ganho: { min: 18, max: 35 },
    xp: 2,
    desc: "Pesca em rios e lagos",
    regiao: "VILAREJO",
  },
  LENHADOR: {
    nome: "🪓 Lenhador",
    emoji: "🪓",
    cooldown: 12,
    ganho: { min: 20, max: 40 },
    xp: 2,
    desc: "Corta madeira para construção",
    regiao: "VILAREJO",
  },

  // Intermediários (Metrópole)
  MINEIRO: {
    nome: "⛏️ Mineiro",
    emoji: "⛏️",
    cooldown: 15,
    ganho: { min: 25, max: 50 },
    xp: 3,
    desc: "Extrai minérios preciosos",
    regiao: "METROPOLE",
  },
  FERREIRO: {
    nome: "⚒️ Ferreiro",
    emoji: "⚒️",
    cooldown: 18,
    ganho: { min: 30, max: 60 },
    xp: 4,
    desc: "Forja armas e ferramentas",
    regiao: "METROPOLE",
  },
  COMERCIANTE: {
    nome: "📦 Comerciante",
    emoji: "📦",
    cooldown: 20,
    ganho: { min: 35, max: 70 },
    xp: 4,
    desc: "Negocia mercadorias valiosas",
    regiao: "METROPOLE",
  },

  // Avançados (Reino)
  ALQUIMISTA: {
    nome: "🧪 Alquimista",
    emoji: "🧪",
    cooldown: 25,
    ganho: { min: 50, max: 100 },
    xp: 6,
    desc: "Cria poções mágicas",
    regiao: "REINO",
  },
  MAGO: {
    nome: "🧙‍♂️ Mago",
    emoji: "🧙‍♂️",
    cooldown: 30,
    ganho: { min: 60, max: 120 },
    xp: 8,
    desc: "Estuda artes arcanas",
    regiao: "REINO",
  },
  BRUXO: {
    nome: "🔮 Bruxo",
    emoji: "🔮",
    cooldown: 28,
    ganho: { min: 55, max: 110 },
    xp: 7,
    desc: "Domina magias das trevas",
    regiao: "REINO",
    risco: 0.15,
  },
  PALADINO: {
    nome: "⚔️ Paladino",
    emoji: "⚔️",
    cooldown: 32,
    ganho: { min: 65, max: 130 },
    xp: 9,
    desc: "Defensor do reino sagrado",
    regiao: "REINO",
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
    risco: 0.2,
  },
  LADRÃO: {
    nome: "🦹 Ladrão",
    emoji: "🦹",
    cooldown: 15,
    ganho: { min: 80, max: 160 },
    xp: 7,
    desc: "Rouba dos ricos... ou pobres",
    regiao: "METROPOLE",
    risco: 0.4,
  },
  ASSASSINO: {
    nome: "🗡️ Assassino",
    emoji: "🗡️",
    cooldown: 40,
    ganho: { min: 150, max: 300 },
    xp: 12,
    desc: "Executa contratos secretos",
    regiao: "REINO",
    risco: 0.5,
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
    requisito: "top5",
  },
  TESOUREIRO: {
    nome: "💰 Tesoureiro Real",
    emoji: "💰",
    cooldown: 50,
    ganho: { min: 250, max: 500 },
    xp: 18,
    desc: "Gerencia o tesouro do reino",
    regiao: "CIDADELA_REAL",
    requisito: "top5",
  },
  GUARDA_REAL: {
    nome: "🛡️ Guarda Real",
    emoji: "🛡️",
    cooldown: 35,
    ganho: { min: 180, max: 350 },
    xp: 14,
    desc: "Protege a família real",
    regiao: "CIDADELA_REAL",
    requisito: "top10",
  },
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
      xp: data.xp,
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
            quando: new Date().toLocaleTimeString(),
          });
        }
      }

      rei.gold += totalImpostos;
      rei.historicoImpostos = rei.historicoImpostos || [];
      rei.historicoImpostos.push({
        tipo: "coleta",
        valor: totalImpostos,
        quando: new Date().toLocaleTimeString(),
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
      const regiao = REGIOES[user.regiao || "VILAREJO"];
      const imposto = Math.floor(user.gold * regiao.taxaImposto);

      if (imposto > 0) {
        user.gold -= imposto;
        user.historicoImpostos = user.historicoImpostos || [];
        user.historicoImpostos.push({
          tipo: "regional",
          valor: imposto,
          quando: agora.toLocaleTimeString(),
        });
      }
    }
  }
};

// Sistema de Inventário e Loja
const ITENS = {
  POCAO_PEQUENA: {
    nome: "Poção Pequena",
    emoji: "🧪",
    descricao: "Restaura 20 de HP.",
    preco: 50,
    efeito: { hp: 20 },
  },
  ESPADA_FERRO: {
    nome: "Espada de Ferro",
    emoji: "⚔️",
    descricao: "Aumenta o ataque em 10.",
    preco: 200,
    efeito: { ataque: 10 },
  },
  ESCUDO_MADEIRA: {
    nome: "Escudo de Madeira",
    emoji: "🛡️",
    descricao: "Aumenta a defesa em 5.",
    preco: 100,
    efeito: { defesa: 5 },
  },
  ELMO_COURO: {
    nome: "Elmo de Couro",
    emoji: "🪖",
    descricao: "Aumenta a defesa em 3.",
    preco: 75,
    efeito: { defesa: 3 },
  },
  PEITORAL_COURO: {
    nome: "Peitoral de Couro",
    emoji: "🎽",
    descricao: "Aumenta a defesa em 7.",
    preco: 150,
    efeito: { defesa: 7 },
  },
  CALCAS_COURO: {
    nome: "Calças de Couro",
    emoji: "👖",
    descricao: "Aumenta a defesa em 4.",
    preco: 90,
    efeito: { defesa: 4 },
  },
  BOTAS_COURO: {
    nome: "Botas de Couro",
    emoji: "👢",
    descricao: "Aumenta a agilidade em 2.",
    preco: 60,
    efeito: { agilidade: 2 },
  },
  ANEL_FORCA: {
    nome: "Anel da Força",
    emoji: "💍",
    descricao: "Aumenta a força em 5.",
    preco: 300,
    efeito: { forca: 5 },
  },
  COLAR_INTELIGENCIA: {
    nome: "Colar da Inteligência",
    emoji: "📿",
    descricao: "Aumenta a inteligência em 5.",
    preco: 300,
    efeito: { inteligencia: 5 },
  },
  AMULETO_AGILIDADE: {
    nome: "Amuleto da Agilidade",
    emoji: "💎",
    descricao: "Aumenta a agilidade em 5.",
    preco: 300,
    efeito: { agilidade: 5 },
  },
  POCAO_MEDIA: {
    nome: "Poção Média",
    emoji: "🧪",
    descricao: "Restaura 50 de HP.",
    preco: 120,
    efeito: { hp: 50 },
  },
  ESPADA_ACO: {
    nome: "Espada de Aço",
    emoji: "🗡️",
    descricao: "Aumenta o ataque em 20.",
    preco: 500,
    efeito: { ataque: 20 },
  },
  ESCUDO_FERRO: {
    nome: "Escudo de Ferro",
    emoji: "🛡️",
    descricao: "Aumenta a defesa em 15.",
    preco: 350,
    efeito: { defesa: 15 },
  },
  ARMADURA_FERRO: {
    nome: "Armadura de Ferro",
    emoji: "🪖",
    descricao: "Aumenta a defesa em 25.",
    preco: 700,
    efeito: { defesa: 25 },
  },
  MACHADO_GUERRA: {
    nome: "Machado de Guerra",
    emoji: "🪓",
    descricao: "Aumenta o ataque em 18 e força em 3.",
    preco: 450,
    efeito: { ataque: 18, forca: 3 },
  },
  ARCO_LONGO: {
    nome: "Arco Longo",
    emoji: "🏹",
    descricao: "Aumenta o ataque em 15 e agilidade em 3.",
    preco: 400,
    efeito: { ataque: 15, agilidade: 3 },
  },
  CAJADO_MAGICO: {
    nome: "Cajado Mágico",
    emoji: "杖",
    descricao: "Aumenta o ataque em 12 e inteligência em 5.",
    preco: 480,
    efeito: { ataque: 12, inteligencia: 5 },
  },
  POCAO_GRANDE: {
    nome: "Poção Grande",
    emoji: "🧪",
    descricao: "Restaura 100 de HP.",
    preco: 250,
    efeito: { hp: 100 },
  },
  ESPADA_DIAMANTE: {
    nome: "Espada de Diamante",
    emoji: "💎⚔️",
    descricao: "Aumenta o ataque em 40.",
    preco: 1500,
    efeito: { ataque: 40 },
  },
  ARMADURA_DIAMANTE: {
    nome: "Armadura de Diamante",
    emoji: "💎🛡️",
    descricao: "Aumenta a defesa em 50.",
    preco: 2000,
    efeito: { defesa: 50 },
  },
  AMULETO_LENDARIO: {
    nome: "Amuleto Lendário",
    emoji: "✨💎",
    descricao: "Aumenta todas as skills em 10.",
    preco: 5000,
    efeito: { forca: 10, agilidade: 10, inteligencia: 10 },
  },
};

// Sistema PvP
const pvpChallenges = {}; // Armazena desafios pendentes

// Função para gerar um resultado de combate simples (exemplo)
const simularCombate = (jogador1, jogador2) => {
  // Lógica de combate simplificada: quem tiver mais gold ou nível, tem mais chance
  const chanceJogador1 = jogador1.gold + jogador1.nivel * 10;
  const chanceJogador2 = jogador2.gold + jogador2.nivel * 10;

  const totalChance = chanceJogador1 + chanceJogador2;
  const randomValue = Math.random() * totalChance;

  if (randomValue < chanceJogador1) {
    return jogador1.userId; // Jogador 1 vence
  } else {
    return jogador2.userId; // Jogador 2 vence
  }
};

// Monstros para PvE
const MONSTROS = {
  GOBLIN: {
    nome: "Goblin",
    emoji: "👹",
    hp: 50,
    ataque: 10,
    defesa: 5,
    xpRecompensa: 20,
    goldRecompensa: { min: 30, max: 60 },
  },
  ORC: {
    nome: "Orc",
    emoji: "👺",
    hp: 100,
    ataque: 25,
    defesa: 15,
    xpRecompensa: 50,
    goldRecompensa: { min: 80, max: 150 },
  },
  DRAGAO_FILHOTE: {
    nome: "Dragão Filhote",
    emoji: "🐉",
    hp: 200,
    ataque: 40,
    defesa: 25,
    xpRecompensa: 150,
    goldRecompensa: { min: 200, max: 400 },
  },
};

module.exports = {
  name: "trabalhar",
  description: "Sistema RPG de trabalhos com economia dinâmica",
  commands: ["trabalhar", "work", "job", "emprego", "pvp", "assaltar", "inventario", "loja", "comprar", "vender", "usar", "batalhar", "status"],
  usage: `${PREFIX}trabalhar <emprego> | ${PREFIX}pvp @usuario <valor> | ${PREFIX}pvp aceitar | ${PREFIX}pvp recusar | ${PREFIX}assaltar @usuario | ${PREFIX}inventario | ${PREFIX}loja | ${PREFIX}comprar <item> | ${PREFIX}vender <item> | ${PREFIX}usar <item> | ${PREFIX}batalhar <monstro> | ${PREFIX}status`,

  handle: async ({ sendText, userJid, args, mentionedJidList }) => {
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
          inteligencia: 1,
        },
        inventario: {}, // Novo: Inventário do jogador
        hp: 100, // Novo: Pontos de vida
        maxHp: 100, // Novo: HP máximo
      };
    }

    const user = rpgData[userId];
    const agora = Date.now(); // Definir agora aqui para ser usado em todos os comandos
    aplicarImpostos(); // Verifica impostos regionais
    coletarImpostosReais(); // Verifica impostos reais

    // Comando de status do jogador
    if (comando === "status") {
      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║          👤 *SEU STATUS*             ║
        ╚══════════════════════════════════════╝

        💰 *Golds:* ${user.gold}
        ✨ *XP:* ${user.xp} / ${xpParaProxNivel(user.nivel)}
        📊 *Nível:* ${user.nivel}
        💖 *HP:* ${user.hp} / ${user.maxHp}
        📍 *Região:* ${REGIOES[user.regiao].nome}
        💪 *Força:* ${user.skills.forca}
        💨 *Agilidade:* ${user.skills.agilidade}
        🧠 *Inteligência:* ${user.skills.inteligencia}
        `
      );
    }

    // Comando PvE (Batalhar)
    if (comando === "batalhar") {
      const monstroDesejado = args[1]?.toUpperCase();
      const monstro = MONSTROS[monstroDesejado];

      if (!monstro) {
        const monstrosDisponiveis = Object.entries(MONSTROS)
          .map(([key, mon]) => `${mon.emoji} ${mon.nome} (HP: ${mon.hp}, Atk: ${mon.ataque}, Def: ${mon.defesa})`) 
          .join("\n");

        return sendText(
          `
          ╔══════════════════════════════════════╗
          ║          ⚔️ *ARENA DE BATALHA*         ║
          ╚══════════════════════════════════════╝

          *Monstros disponíveis:*
${monstrosDisponiveis}

          _Use ${PREFIX}batalhar <monstro> para iniciar uma batalha._
          _Ex: ${PREFIX}batalhar goblin_
          `
        );
      }

      // Cooldown para batalha
      if (user.cooldowns.batalha > agora) {
        const segundos = Math.ceil((user.cooldowns.batalha - agora) / 1000);
        return sendText(
          `⏳ *Aguarde ${segundos}s*\n` +
          `Você precisa esperar ${segundos} segundos para iniciar outra batalha.`
        );
      }

      let logBatalha = `⚔️ *BATALHA CONTRA ${monstro.nome.toUpperCase()}!* ⚔️\n\n`;
      let userHp = user.hp;
      let monstroHp = monstro.hp;

      // Calcular atributos efetivos do jogador
      let userAtaque = user.skills.forca * 2 + (user.skills.agilidade / 2); // Exemplo de cálculo
      let userDefesa = user.skills.inteligencia * 1.5 + (user.skills.forca / 2); // Exemplo de cálculo

      while (userHp > 0 && monstroHp > 0) {
        // Turno do jogador
        let danoJogador = Math.max(0, userAtaque - monstro.defesa);
        monstroHp -= danoJogador;
        logBatalha += `Você atacou ${monstro.nome} causando ${danoJogador} de dano. HP do ${monstro.nome}: ${Math.max(0, monstroHp)}\n`;

        if (monstroHp <= 0) {
          logBatalha += `
🎉 Você derrotou o ${monstro.nome}!
`;
          user.xp += monstro.xpRecompensa;
          const goldGanho = Math.floor(Math.random() * (monstro.goldRecompensa.max - monstro.goldRecompensa.min + 1)) + monstro.goldRecompensa.min;
          user.gold += goldGanho;
          logBatalha += `Você ganhou ${monstro.xpRecompensa} XP e ${goldGanho} golds!\n`;
          break;
        }

        // Turno do monstro
        let danoMonstro = Math.max(0, monstro.ataque - userDefesa);
        userHp -= danoMonstro;
        logBatalha += `${monstro.nome} atacou você causando ${danoMonstro} de dano. Seu HP: ${Math.max(0, userHp)}\n`;

        if (userHp <= 0) {
          logBatalha += `
💀 Você foi derrotado pelo ${monstro.nome}!
`;
          // Penalidade por derrota (ex: perde 10% do gold)
          const goldPerdido = Math.floor(user.gold * 0.1);
          user.gold -= goldPerdido;
          logBatalha += `Você perdeu ${goldPerdido} golds na derrota.\n`;
          break;
        }
      }

      user.hp = userHp; // Atualiza o HP do usuário após a batalha
      user.cooldowns.batalha = agora + 120 * 1000; // 2 minutos de cooldown para batalha

      // Verificar nível após a batalha
      const novoNivel = calcularNivel(user.xp);
      const nivelUp = novoNivel > user.nivel;
      user.nivel = novoNivel;
      if (nivelUp) {
        logBatalha += `
🎉 *NOVO NÍVEL ${user.nivel}!* Seus atributos melhoraram!\n`;
        // Aumentar HP máximo e skills ao subir de nível
        user.maxHp += 10;
        user.hp = user.maxHp; // Restaura HP ao subir de nível
        user.skills.forca += 1;
        user.skills.agilidade += 1;
        user.skills.inteligencia += 1;
      }

      return sendText(logBatalha);
    }

    // Comando 'inventario'
    if (comando === "inventario") {
      const itensNoInventario = Object.entries(user.inventario)
        .map(([itemKey, quantidade]) => {
          const item = ITENS[itemKey];
          return `${item.emoji} ${item.nome} (x${quantidade}) - ${item.descricao}`;
        })
        .join("\n");

      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║          🎒 *SEU INVENTÁRIO*         ║
        ╚══════════════════════════════════════╝

${itensNoInventario || "_Seu inventário está vazio._"}

        _Use ${PREFIX}loja para ver itens disponíveis._
        `
      );
    }

    // Comando 'loja'
    if (comando === "loja") {
      const itensNaLoja = Object.entries(ITENS)
        .map(([itemKey, item]) => {
          return `${item.emoji} ${item.nome} - 💰 ${item.preco} golds\n  _${item.descricao}_\n  *Comprar:* ${PREFIX}comprar ${itemKey.toLowerCase()}`;
        })
        .join("\n\n");

      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║           🏪 *LOJA DO REINO*          ║
        ╚══════════════════════════════════════╝

${itensNaLoja}

        _Use ${PREFIX}comprar <item> para adquirir um item._
        _Ex: ${PREFIX}comprar pocao_pequena_
        `
      );
    }

    // Comando 'comprar'
    if (comando === "comprar") {
      const itemDesejado = args[1]?.toUpperCase();
      const item = ITENS[itemDesejado];

      if (!item) {
        return sendText(`❌ Item não encontrado na loja. Use ${PREFIX}loja para ver os itens.`);
      }

      if (user.gold < item.preco) {
        return sendText(
          `💰 Você não tem golds suficientes para comprar ${item.nome}.` +
          `\nSeu saldo: ${user.gold} golds | Preço: ${item.preco} golds`
        );
      }

      user.gold -= item.preco;
      user.inventario[itemDesejado] = (user.inventario[itemDesejado] || 0) + 1;

      return sendText(
        `🎉 Você comprou ${item.emoji} ${item.nome} por ${item.preco} golds!\n` +
        `Seu novo saldo: ${user.gold} golds`
      );
    }

    // Comando 'vender'
    if (comando === "vender") {
      const itemDesejado = args[1]?.toUpperCase();
      const item = ITENS[itemDesejado];

      if (!item) {
        return sendText(`❌ Item não encontrado.`);
      }

      if (!user.inventario[itemDesejado] || user.inventario[itemDesejado] <= 0) {
        return sendText(`🎒 Você não tem ${item.nome} no seu inventário para vender.`);
      }

      const precoVenda = Math.floor(item.preco * 0.8); // Vende por 80% do preço de compra
      user.gold += precoVenda;
      user.inventario[itemDesejado] -= 1;

      if (user.inventario[itemDesejado] === 0) {
        delete user.inventario[itemDesejado];
      }

      return sendText(
        `💰 Você vendeu ${item.emoji} ${item.nome} por ${precoVenda} golds!\n` +
        `Seu novo saldo: ${user.gold} golds`
      );
    }

    // Comando 'usar'
    if (comando === "usar") {
      const itemDesejado = args[1]?.toUpperCase();
      const item = ITENS[itemDesejado];

      if (!item) {
        return sendText(`❌ Item não encontrado.`);
      }

      if (!user.inventario[itemDesejado] || user.inventario[itemDesejado] <= 0) {
        return sendText(`🎒 Você não tem ${item.nome} no seu inventário para usar.`);
      }

      if (item.efeito.hp) {
        user.hp = Math.min(user.maxHp, user.hp + item.efeito.hp);
        user.inventario[itemDesejado] -= 1;
        if (user.inventario[itemDesejado] === 0) {
          delete user.inventario[itemDesejado];
        }
        return sendText(
          `💖 Você usou ${item.emoji} ${item.nome} e restaurou ${item.efeito.hp} de HP.\n` +
          `Seu HP atual: ${user.hp}/${user.maxHp}`
        );
      } else if (item.efeito.ataque || item.efeito.defesa || item.efeito.forca || item.efeito.agilidade || item.efeito.inteligencia) {
        // Equipar item (simplificado: apenas aplica o bônus)
        for (const skill in item.efeito) {
          user.skills[skill] = (user.skills[skill] || 0) + item.efeito[skill];
        }
        user.inventario[itemDesejado] -= 1; // Consome o item ao usar/equipar
        if (user.inventario[itemDesejado] === 0) {
          delete user.inventario[itemDesejado];
        }
        return sendText(
          `✨ Você equipou ${item.emoji} ${item.nome} e seus atributos foram aumentados!\n` +
          `Força: ${user.skills.forca}, Agilidade: ${user.skills.agilidade}, Inteligência: ${user.skills.inteligencia}`
        );
      } else {
        return sendText(`🤷 Este item não pode ser usado ou equipado.`);
      }
    }

    // Comando 'viajar'
    if (comando === "viajar") {
      const destino = args[1]?.toUpperCase();
      const regiaoDestino = REGIOES[destino];

      if (!regiaoDestino) {
        const regioesDisponiveis = Object.entries(REGIOES)
          .filter(([key, reg]) => !reg.exclusivo || user.nivel >= 10)
          .map(
            ([key, reg]) =>
              `${reg.nome} - ${PREFIX}trabalhar viajar ${key}\n` +
              `💰 Custo: ${reg.custoViagem} golds | 🏆 ${reg.exclusivo ? "Nível 10+ ou Top Rank" : ""}`
          )
          .join("\n");

        return sendText(
          `
          ╔══════════════════════════════════════╗
          ║        ✈️ *SISTEMA DE VIAGEM* ✈️       ║
          ╚══════════════════════════════════════╝

          *Regiões disponíveis:*
${regioesDisponiveis}

          📍 *Sua região atual:* ${REGIOES[user.regiao].nome}
          💰 *Seu saldo:* ${user.gold} golds

          _Ex: ${PREFIX}trabalhar viajar METROPOLE_
          `
        );
      }

      if (
        regiaoDestino.exclusivo &&
        user.nivel < 10 &&
        !rankGlobal.some(
          (u) => u.userId === userId && rankGlobal.indexOf(u) < 5
        )
      ) {
        return sendText(
          `
          ╔══════════════════════════════════════╗
          ║         🚫 *ACESSO NEGADO!*          ║
          ╚══════════════════════════════════════╝

          A ${regiaoDestino.nome} é exclusiva para:
          - Nível 10 ou superior
          - Membros do Top 5 do ranking

          *Seu nível:* ${user.nivel}
          `
        );
      }

      // Novas restrições de nível para Metrópole e Reino
      if (destino === "METROPOLE" && user.nivel < 3) {
        return sendText(
          `
          ╔══════════════════════════════════════╗
          ║         🚫 *ACESSO NEGADO!*          ║
          ╚══════════════════════════════════════╝

          Você precisa ser Nível 3 ou superior para viajar para a ${regiaoDestino.nome}.
          *Seu nível:* ${user.nivel}
          `
        );
      }
      if (destino === "REINO" && user.nivel < 7) {
        return sendText(
          `
          ╔══════════════════════════════════════╗
          ║         🚫 *ACESSO NEGADO!*          ║
          ╚══════════════════════════════════════╝

          Você precisa ser Nível 7 ou superior para viajar para o ${regiaoDestino.nome}.
          *Seu nível:* ${user.nivel}
          `
        );
      }

      if (user.regiao === destino) {
        return sendText(`ℹ️ Você já está na região ${regiaoDestino.nome}!`);
      }

      if (user.gold < regiaoDestino.custoViagem) {
        return sendText(
          `
          ╔══════════════════════════════════════╗
          ║       💰 *FUNDOS INSUFICIENTES!*      ║
          ╚══════════════════════════════════════╝

          Você precisa de ${regiaoDestino.custoViagem} golds para viajar para ${regiaoDestino.nome}
          *Seu saldo:* ${user.gold} golds
          `
        );
      }

      user.gold -= regiaoDestino.custoViagem;
      user.regiao = destino;
      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║        ✈️ *VIAGEM REALIZADA!*         ║
        ╚══════════════════════════════════════╝

        Você chegou em ${regiaoDestino.nome}
        *Custo da viagem:* ${regiaoDestino.custoViagem} golds
        🏆 _Novos empregos disponíveis! Use ${PREFIX}trabalhar para ver._
        `
      );
    }

    // Comando 'rank'
    if (comando === "rank") {
      atualizarRank();
      const posicao = rankGlobal.findIndex((u) => u.userId === userId) + 1;
      const titulo =
        TITULOS[posicao] ||
        TITULOS.default[Math.floor(Math.random() * TITULOS.default.length)];

      const top5 = rankGlobal
        .slice(0, 5)
        .map(
          (u, i) =>
            `${i + 1}. ${TITULOS[i + 1]} @${u.userId} - ${u.gold} golds (Nv. ${u.nivel})`
        )
        .join("\n");

      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║          🏆 *RANKING GLOBAL* 🏆        ║
        ╚══════════════════════════════════════╝

${top5}

        📍 *Seu título:* ${titulo}
        📊 *Sua posição:* ${posicao || "Não ranqueado"}
        💰 *Seu saldo:* ${user.gold} golds
        ✨ *Nível:* ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)
        `
      );
    }

    // Comando PvP
    if (comando === "pvp") {
      // Verificar cooldown geral de PvP
      if (user.cooldowns.pvp > agora) {
        const segundos = Math.ceil((user.cooldowns.pvp - agora) / 1000);
        return sendText(
          `⏳ *Aguarde ${segundos}s*\n` +
          `Você precisa esperar ${segundos} segundos para iniciar ou aceitar outro PvP.`
        );
      }

      const alvoId = mentionedJidList[0] ? onlyNumbers(mentionedJidList[0]) : null;
      const acao = args[1]?.toLowerCase();

      // Desafiar alguém
      if (alvoId && !acao) {
        const valorAposta = parseInt(args[2]);

        if (isNaN(valorAposta) || valorAposta <= 0) {
          return sendText(`❌ Valor de aposta inválido. Use: ${PREFIX}pvp @usuario <valor>`);
        }
        if (user.gold < valorAposta) {
          return sendText(`💰 Você não tem golds suficientes para esta aposta! Seu saldo: ${user.gold}`);
        }
        if (!rpgData[alvoId]) {
          return sendText(`🚫 O usuário mencionado não está registrado no RPG.`);
        }
        if (alvoId === userId) {
          return sendText(`🤦 Você não pode desafiar a si mesmo para um PvP!`);
        }

        const alvoUser = rpgData[alvoId];
        if (alvoUser.gold < valorAposta) {
          return sendText(`💰 O alvo não tem golds suficientes para cobrir a aposta de ${valorAposta}!`);
        }

        // Armazenar desafio
        pvpChallenges[alvoId] = {
          desafiador: userId,
          alvo: alvoId,
          valor: valorAposta,
          timestamp: Date.now(),
        };

        // Adicionar cooldown para o desafiador
        user.cooldowns.pvp = agora + 300 * 1000; // 5 minutos de cooldown

        return sendText(
          `⚔️ *DESAFIO PVP!* ⚔️\n\n` +
          `@${alvoId} foi desafiado por @${userId} para um PvP valendo ${valorAposta} golds!\n` +
          `Para aceitar, use: ${PREFIX}pvp aceitar\n` +
          `Para recusar, use: ${PREFIX}pvp recusar\n\n` +
          `⏳ Você poderá desafiar novamente em 5 minutos.`
        );
      }

      // Aceitar desafio
      if (acao === "aceitar") {
        const desafio = pvpChallenges[userId];

        if (!desafio || desafio.alvo !== userId) {
          return sendText(`🚫 Você não tem nenhum desafio PvP pendente para aceitar.`);
        }

        // Adicionar cooldown para o alvo
        user.cooldowns.pvp = agora + 300 * 1000; // 5 minutos de cooldown

        const desafiadorUser = rpgData[desafio.desafiador];
        const alvoUser = rpgData[desafio.alvo];

        if (desafiadorUser.gold < desafio.valor || alvoUser.gold < desafio.valor) {
          delete pvpChallenges[userId];
          return sendText(
            `💰 Um dos jogadores não tem mais golds suficientes para a aposta. Desafio cancelado.`
          );
        }

        // Realizar combate
        const vencedorId = simularCombate(desafiadorUser, alvoUser);
        const perdedorId =
          vencedorId === desafiadorUser.userId ? alvoUser.userId : desafiadorUser.userId;

        const vencedorUser = rpgData[vencedorId];
        const perdedorUser = rpgData[perdedorId];

        // Transferir golds
        vencedorUser.gold += desafio.valor;
        perdedorUser.gold -= desafio.valor;

        delete pvpChallenges[userId]; // Remover desafio

        return sendText(
          `🎉 *RESULTADO PVP!* 🎉\n\n` +
          `@${vencedorId} VENCEU o PvP contra @${perdedorId} e ganhou ${desafio.valor} golds!\n` +
          `Saldo de @${vencedorId}: ${vencedorUser.gold}\n` +
          `Saldo de @${perdedorId}: ${perdedorUser.gold}`
        );
      }

      // Recusar desafio
      if (acao === "recusar") {
        const desafio = pvpChallenges[userId];

        if (!desafio || desafio.alvo !== userId) {
          return sendText(`🚫 Você não tem nenhum desafio PvP pendente para recusar.`);
        }

        delete pvpChallenges[userId];
        return sendText(`💔 Você recusou o desafio PvP de @${desafio.desafiador}.`);
      }

      return sendText(
        `❌ Comando PvP inválido. Use:\n` +
        `${PREFIX}pvp @usuario <valor> (para desafiar)\n` +
        `${PREFIX}pvp aceitar (para aceitar um desafio pendente)\n` +
        `${PREFIX}pvp recusar (para recusar um desafio pendente)`
      );
    }

    // Comando Assaltar
    if (comando === "assaltar") {
      const alvoId = mentionedJidList[0] ? onlyNumbers(mentionedJidList[0]) : null;

      if (!alvoId) {
        return sendText(`❌ Você precisa mencionar quem deseja assaltar. Use: ${PREFIX}assaltar @usuario`);
      }
      if (!rpgData[alvoId]) {
        return sendText(`🚫 O usuário mencionado não está registrado no RPG.`);
      }
      if (alvoId === userId) {
        return sendText(`🤦 Você não pode assaltar a si mesmo!`);
      }

      // Cooldown para assalto
      if (user.cooldowns.assalto > agora) {
        const segundos = Math.ceil((user.cooldowns.assalto - agora) / 1000);
        return sendText(
          `⏳ *Aguarde ${segundos}s*\n` +
          `Você precisa esperar ${segundos} segundos para tentar outro assalto.`
        );
      }

      const alvoUser = rpgData[alvoId];
      const chanceSucesso = 0.5; // 50% de chance base de sucesso
      const randomValue = Math.random();

      let mensagemAssalto = ``;

      if (randomValue < chanceSucesso) {
        // Sucesso no assalto
        const goldRoubado = Math.floor(alvoUser.gold * 0.4); // Leva 40% dos golds do outro
        if (goldRoubado === 0) {
          mensagemAssalto = `Você tentou assaltar @${alvoId}, mas ele(a) não tinha golds para roubar! 🤷`;
        } else {
          user.gold += goldRoubado;
          alvoUser.gold -= goldRoubado;
          mensagemAssalto = `🎉 *ASSALTO BEM SUCEDIDO!* 🎉\n\n` +
            `Você assaltou @${alvoId} e roubou ${goldRoubado} golds!\n` +
            `Seu novo saldo: ${user.gold}\n` +
            `Saldo de @${alvoId}: ${alvoUser.gold}`;
        }
      } else {
        // Falha no assalto
        const goldPerdido = Math.floor(user.gold * 0.25); // Perde 25% de seus golds
        user.gold -= goldPerdido;
        mensagemAssalto = `🚨 *ASSALTO FALHOU!* 🚨\n\n` +
          `Você tentou assaltar @${alvoId}, mas falhou miseravelmente e perdeu ${goldPerdido} golds!\n` +
          `Seu novo saldo: ${user.gold}`;
      }

      user.cooldowns.assalto = agora + 600 * 1000; // 10 minutos de cooldown para assalto
      return sendText(mensagemAssalto);
    }

    // Lista de empregos
    if (
      !comando ||
      !Object.values(EMPREGOS).some((e) => e.nome.toLowerCase().includes(comando))
    ) {
      const empregosDisponiveis = Object.values(EMPREGOS)
        .filter((e) => {
          const mesmaRegiao = e.regiao === user.regiao;
          const nivelSuficiente = user.nivel >= 5;
          const requisitoTop =
            !e.requisito ||
            (e.requisito === "top5" &&
              rankGlobal.some(
                (u) => u.userId === userId && rankGlobal.indexOf(u) < 5
              )) ||
            (e.requisito === "top10" &&
              rankGlobal.some(
                (u) => u.userId === userId && rankGlobal.indexOf(u) < 10
              ));

          return mesmaRegiao || nivelSuficiente || requisitoTop;
        })
        .map(
          (emp) =>
            `${emp.emoji} *${emp.nome}* - ${PREFIX}trabalhar ${emp.nome
              .split(" ")[1]
              .toLowerCase()}\n` +
            `⏱️ ${emp.cooldown}s | 🪙 ${emp.ganho.min}-${emp.ganho.max} golds | ✨ +${emp.xp} XP\n` +
            `📝 ${emp.desc}${emp.risco ? ` | ☠️ Risco: ${emp.risco * 100}%` : ""}` +
            `${emp.requisito ? ` | 🏆 ${emp.requisito.toUpperCase()}` : ""}`
        )
        .join("\n\n");

      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║     🏘️ *EMPREGOS DISPONÍVEIS* (${REGIOES[user.regiao].nome})     ║
        ╚══════════════════════════════════════╝

${empregosDisponiveis}

        💰 *Saldo:* ${user.gold} golds | ✨ ${user.xp}/${xpParaProxNivel(user.nivel)} XP
        📊 *Nível:* ${user.nivel} | 📍 ${REGIOES[user.regiao].nome}
        💼 *Histórico:* ${user.historico.slice(0, 3).map((h) => h.emprego).join(", ") || "Nenhum"}

        _📌 Ex: ${PREFIX}trabalhar mineiro_
        `
      );
    }

    // Executar trabalho
    const emprego = Object.values(EMPREGOS).find((e) =>
      e.nome.toLowerCase().includes(comando)
    );

    if (!emprego) return sendText(`❌ Emprego não encontrado! Use ${PREFIX}trabalhar para listar.`);

    // Verificar requisitos especiais
    if (
      emprego.requisito === "top5" &&
      !rankGlobal.some((u) => u.userId === userId && rankGlobal.indexOf(u) < 5)
    ) {
      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║        🏆 *EMPREGO EXCLUSIVO!*       ║
        ╚══════════════════════════════════════╝

        Você precisa estar no Top 5 do ranking para ser ${emprego.nome}!
        _Use ${PREFIX}trabalhar rank para ver sua posição._
        `
      );
    }

    if (
      emprego.requisito === "top10" &&
      !rankGlobal.some((u) => u.userId === userId && rankGlobal.indexOf(u) < 10)
    ) {
      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║        🏆 *EMPREGO EXCLUSIVO!*       ║
        ╚══════════════════════════════════════╝

        Você precisa estar no Top 10 do ranking para ser ${emprego.nome}!
        _Use ${PREFIX}trabalhar rank para ver sua posição._
        `
      );
    }

    // Verificar região
    if (emprego.regiao !== user.regiao && user.nivel < 5) {
      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║         🌍 *Emprego bloqueado!*        ║
        ╚══════════════════════════════════════╝

        Você precisa estar na região ${REGIOES[emprego.regiao].nome} ou ter nível 5+.
        *Sua região atual:* ${REGIOES[user.regiao].nome}
        `
      );
    }

    // Verificar cooldown
    if (user.cooldowns[emprego.nome] > agora) {
      const segundos = Math.ceil((user.cooldowns[emprego.nome] - agora) / 1000);
      return sendText(
        `
        ╔══════════════════════════════════════╗
        ║          ⏳ *Aguarde ${segundos}s*          ║
        ╚══════════════════════════════════════╝

        Você pode trabalhar como ${emprego.emoji} ${emprego.nome} novamente em ${segundos} segundos.
        `
      );
    }

    // Trabalhar com riscos
    let resultado = "sucesso";
    let ganho =
      Math.floor(Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)) +
      emprego.ganho.min;

    // Aplicar bônus de região, nível e ranking
    const bonusRegiao = Math.floor(ganho * REGIOES[user.regiao].bonus);
    const bonusNivel = Math.floor(ganho * (user.nivel * 0.03)); // 3% por nível
    const posicaoRank = rankGlobal.findIndex((u) => u.userId === userId) + 1;
    const bonusRank = posicaoRank <= 5 ? Math.floor(ganho * 0.1) : 0; // 10% bonus para top 5

    ganho += bonusRegiao + bonusNivel + bonusRank;

    // Verificar riscos
    if (emprego.risco && Math.random() < emprego.risco) {
      resultado = "fracasso";
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
        quando: new Date().toLocaleTimeString(),
      });
    }

    // Atualizar dados
    user.gold += ganho;
    user.xp += resultado === "sucesso" ? emprego.xp : Math.floor(emprego.xp * 0.5);
    user.cooldowns[emprego.nome] = agora + emprego.cooldown * 1000;

    // Verificar nível
    const novoNivel = calcularNivel(user.xp);
    const nivelUp = novoNivel > user.nivel;
    user.nivel = novoNivel;

    // Atualizar histórico
    user.historico.unshift({
      emprego: emprego.nome,
      resultado,
      ganho,
      quando: new Date().toLocaleTimeString(),
    });
    user.historico = user.historico.slice(0, 5);

    // Mensagem de resultado
    let mensagem =
      `
    ╔══════════════════════════════════════╗
    ║ 💰 *${resultado === "sucesso" ? "TRABALHO CONCLUÍDO" : "TRABALHO FALHOU"}* ║
    ╚══════════════════════════════════════╝

    ${emprego.emoji} *${emprego.nome}*
    🪙 *Ganho:* ${ganho >= 0 ? "+" : ""}${ganho} golds
    ✨ *XP:* ${resultado === "sucesso" ? "+" : ""}${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})
    🏛️ *Imposto:* -${impostoTrabalho} golds
    `;

    if (bonusRegiao > 0 || bonusNivel > 0 || bonusRank > 0) {
      mensagem +=
        `🎁 *Bônus:* ${bonusRegiao > 0 ? `+${bonusRegiao} (região) ` : ""}` +
        `${bonusNivel > 0 ? `+${bonusNivel} (nível ${user.nivel}) ` : ""}` +
        `${bonusRank > 0 ? `+${bonusRank} (ranking)` : ""}\n`;
    }

    if (nivelUp) {
      mensagem += `\n🎉 *NOVO NÍVEL ${user.nivel}!* Seus atributos melhoraram!`;
      // Aumentar HP máximo e skills ao subir de nível
      user.maxHp += 10;
      user.hp = user.maxHp; // Restaura HP ao subir de nível
      user.skills.forca += 1;
      user.skills.agilidade += 1;
      user.skills.inteligencia += 1;
    }

    mensagem += `\n⏱️ _Próximo trabalho em ${emprego.cooldown}s_`;

    await sendText(mensagem);
    atualizarRank(); // Atualiza o ranking global
  },
};

