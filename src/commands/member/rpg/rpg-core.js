const fs = require('fs');
const path = require('path');

class RPGSystem {
  constructor() {
    this.players = {};
    this.profissoes = {
      fazendeiro: { min: 10, max: 20, emoji: '👨‍🌾' },
      minerador: { min: 15, max: 25, emoji: '⛏️' }, 
      mercador: { min: 12, max: 22, emoji: '💼' }
    };
    this.loadData();
  }

  // Carrega os dados salvos
  loadData() {
    const filePath = path.join(__dirname, '../../../database/rpg-data.json');
    if (fs.existsSync(filePath)) {
      this.players = JSON.parse(fs.readFileSync(filePath));
    }
  }

  // Salva os dados
  saveData() {
    const filePath = path.join(__dirname, '../../../database/rpg-data.json');
    fs.writeFileSync(filePath, JSON.stringify(this.players));
  }

  // Obtém ou cria um jogador
  getPlayer(userJid, userName) {
    if (!this.players[userJid]) {
      this.players[userJid] = {
        nome: userName,
        gold: 100,
        vida: 100,
        profissao: null,
        nivel: 1,
        vitorias: 0
      };
    }
    return this.players[userJid];
  }

  // Gera ranking
  getRanking() {
    return Object.entries(this.players)
      .sort((a, b) => b[1].gold - a[1].gold)
      .slice(0, 5);
  }
}

module.exports = new RPGSystem();
