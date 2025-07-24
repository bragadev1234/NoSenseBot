// Armazenamento em memória
const rpgData = {};
const ranking = [];
const eventosAtivos = [];

// Hierarquia e títulos
const TITULOS = {
  REI: { nome: "👑 Rei", bonus: 0.25, requisito: 1, imposto: 0.10 },
  RAINHA: { nome: "👸 Rainha", bonus: 0.20, requisito: 2, imposto: 0.08 },
  PRINCIPE: { nome: "🤴 Príncipe", bonus: 0.15, requisito: 3, imposto: 0.05 },
  DUQUE: { nome: "🎩 Duque", bonus: 0.12, requisito: 5, imposto: 0.03 },
  NOBRE: { nome: "💂 Nobre", bonus: 0.08, requisito: 10, imposto: 0.02 },
  PLEBEU: { nome: "🧑 Plebeu", bonus: 0, requisito: Infinity, imposto: 0 },
  ESCRAVO: { nome: "⛓️ Escravo", bonus: -0.40, requisito: null, imposto: 0.50 },
  FUGITIVO: { nome: "🏃‍♂️ Fugitivo", bonus: -0.60, requisito: null, imposto: 0 },
  MONSTRO: { nome: "👹 Monstro", bonus: -0.75, requisito: null, imposto: 0.70 },
  BRUXO: { nome: "🧙 Bruxo", bonus: 0.30, requisito: null, imposto: 0.15 }
};

// Lista de empregos
const EMPREGOS = {
  FAZENDEIRO: {
    nome: "👨‍🌾 Fazendeiro", emoji: "👨‍🌾", cooldown: 10,
    ganho: { min: 15, max: 30 }, xp: 2, risco: 0,
    desc: "Cultiva alimentos para o reino", categoria: "civil"
  },
  MINEIRO: {
    nome: "⛏️ Mineiro", emoji: "⛏️", cooldown: 12,
    ganho: { min: 20, max: 40 }, xp: 3, risco: 0.1,
    desc: "Extrai minérios preciosos", categoria: "civil"
  },
  CAVALEIRO: {
    nome: "⚔️ Cavaleiro", emoji: "⚔️", cooldown: 20,
    ganho: { min: 30, max: 60 }, xp: 5, risco: 0.2,
    desc: "Defende o reino em batalhas", categoria: "militar",
    requisito: "NOBRE"
  },
  BRUXO: {
    nome: "🔮 Aprendiz de Bruxo", emoji: "🔮", cooldown: 25,
    ganho: { min: 40, max: 80 }, xp: 8, risco: 0.3,
    desc: "Estuda artes arcanas", categoria: "magico"
  },
  LADRAO: {
    nome: "🦹 Ladrão", emoji: "🦹", cooldown: 15,
    ganho: { min: 50, max: 90 }, xp: 6, risco: 0.6,
    desc: "Rouba dos ricos e pobres", categoria: "ilegal",
    ilegal: true
  }
};

// Sistema de progressão
const calcularNivel = (xp) => Math.floor(Math.sqrt(xp / 150)) + 1;
const xpParaProxNivel = (nivel) => Math.pow(nivel, 2) * 150;

// Atualizar ranking
const atualizarRanking = () => {
  ranking.length = 0;
  Object.entries(rpgData).forEach(([userId, data]) => {
    if(data.gold > 0) ranking.push({ userId, ...data });
  });
  ranking.sort((a, b) => b.gold - a.gold);
  
  ranking.forEach((user, index) => {
    if(index === 0) user.titulo = "REI";
    else if(index === 1) user.titulo = "RAINHA";
    else if(index === 2) user.titulo = "PRINCIPE";
    else if(index < 5) user.titulo = "DUQUE";
    else if(index < 15) user.titulo = "NOBRE";
    else if(!["BRUXO", "MONSTRO"].includes(user.titulo)) user.titulo = "PLEBEU";
  });
};

module.exports = {
  rpgData,
  ranking,
  eventosAtivos,
  TITULOS,
  EMPREGOS,
  calcularNivel,
  xpParaProxNivel,
  atualizarRanking
};
