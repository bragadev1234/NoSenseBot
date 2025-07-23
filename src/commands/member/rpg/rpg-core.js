const fs = require('fs');
const path = require('path');

class RPGSystem {
  constructor() {
    this.players = new Map();
    this.loadData();
    this.professions = {
      fazendeiro: { min: 10, max: 20, emoji: '👨‍🌾' },
      minerador: { min: 15, max: 25, emoji: '⛏️' },
      construtor: { min: 20, max: 30, emoji: '👷' }
    };
    this.ranks = ['👑 Rei', '👸 Rainha', '🤴 Príncipe', '👧 Princesa'];
  }

  loadData() {
    const filePath = path.join(__dirname, '../../../database/rpg-data.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      data.players.forEach(player => this.players.set(player.userJid, player));
    }
  }

  saveData() {
    const filePath = path.join(__dirname, '../../../database/rpg-data.json');
    fs.writeFileSync(filePath, JSON.stringify({
      players: Array.from(this.players.values())
    }));
  }

  getPlayer(userJid, userName) {
    if (!this.players.has(userJid)) {
      this.players.set(userJid, {
        userJid,
        name: userName,
        golds: 100,
        profession: null,
        status: 'Normal',
        master: null,
        lastWorked: null
      });
    }
    return this.players.get(userJid);
  }
}

module.exports = new RPGSystem();
