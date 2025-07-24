// Armazenamento em memória
const rpgDB = {
  users: {},
  lastDaily: null,

  getUser(userId) {
    if (!this.users[userId]) {
      this.users[userId] = {
        gold: 0,
        xp: 0,
        nivel: 1,
        vitorias: 0,
        derrotas: 0,
        owner: null,
        isMonster: false,
        cooldowns: {},
        lastWork: null
      };
    }
    return this.users[userId];
  },

  getRanking() {
    return Object.entries(this.users)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.gold - a.gold || b.nivel - a.nivel);
  },

  calcularNivel(xp) {
    return Math.floor(Math.sqrt(xp / 10)) + 1;
  },

  xpParaProxNivel(nivel) {
    return Math.pow(nivel, 2) * 10;
  }
};

module.exports = rpgDB;
