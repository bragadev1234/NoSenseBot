// rpg-system.js
const { PREFIX, BASE_DIR } = require(`${BASE_DIR}/config`);
const fs = require('fs');
const path = require('path');
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);

// Constantes do sistema
const RPG_CONFIG = {
  MAX_LEVEL: 100,
  XP_BASE: 100,
  XP_MULTIPLIER: 1.2,
  DAILY_REWARD: 500,
  BOSS_SPAWN_RATE: 0.05,
  GUILD_CREATION_COST: 5000
};

// Banco de dados expandido
class RPGDatabase {
  constructor() {
    this.users = {};
    this.monsters = this.loadMonsters();
    this.shop = this.loadShopItems();
    this.rankings = {
      gold: [],
      xp: [],
      pvp: []
    };
    this.guilds = {};
    this.quests = this.loadQuests();
    this.events = {};
    this.specialCharacters = this.loadSpecialCharacters();
    this.worldState = {
      dayNightCycle: 'day',
      weather: 'clear',
      lastReset: new Date()
    };
  }

  loadMonsters() {
    return {
      // Monstros normais
      slime: { name: 'Slime', hp: 50, attack: 5, defense: 2, xp: 10, gold: [3,8], loot: [
        {name: 'Potion', chance: 0.5}, 
        {name: 'Slime Core', chance: 0.2}
      ]},
      goblin: { name: 'Goblin', hp: 80, attack: 12, defense: 5, xp: 25, gold: [10,25], loot: [
        {name: 'Dagger', chance: 0.3},
        {name: 'Leather Armor', chance: 0.2}
      ]},
      
      // Monstros élite
      dragon: { 
        name: 'Dragão Negro', 
        hp: 500, 
        attack: 50, 
        defense: 30, 
        xp: 200, 
        gold: [800,1200], 
        loot: [
          {name: 'Dragon Scale', chance: 0.4},
          {name: 'Dragon Sword', chance: 0.1},
          {name: 'Dragon Armor', chance: 0.1}
        ],
        special: 'fire_breath'
      },
      
      // Chefes
      demon_king: {
        name: 'Rei Demônio',
        hp: 5000,
        attack: 200,
        defense: 150,
        xp: 5000,
        gold: [5000,10000],
        loot: [
          {name: 'Demon Crown', chance: 0.05},
          {name: 'Hellfire Sword', chance: 0.03}
        ],
        special: ['dark_aura', 'life_drain'],
        isBoss: true
      }
    };
  }

  loadShopItems() {
    return {
      weapons: [
        { id: 1, name: 'Espada de Madeira', price: 50, attack: 5, level: 1 },
        { id: 2, name: 'Espada de Ferro', price: 200, attack: 15, level: 5 },
        { id: 3, name: 'Espada de Aço', price: 500, attack: 30, level: 10 },
        { id: 4, name: 'Espada de Diamante', price: 2000, attack: 60, level: 20 },
        { id: 5, name: 'Espada do Dragão', price: 10000, attack: 120, level: 40, special: 'fire_damage' }
      ],
      armor: [
        { id: 101, name: 'Armadura de Couro', price: 100, defense: 5, level: 1 },
        { id: 102, name: 'Armadura de Ferro', price: 400, defense: 15, level: 5 },
        { id: 103, name: 'Armadura de Aço', price: 1000, defense: 30, level: 10 },
        { id: 104, name: 'Armadura de Dragão', price: 5000, defense: 60, level: 20, special: 'fire_resist' }
      ],
      spells: [
        { id: 201, name: 'Bola de Fogo', price: 300, damage: 20, mana: 10, level: 1 },
        { id: 202, name: 'Raio de Gelo', price: 500, damage: 30, mana: 15, level: 5, special: 'freeze_chance' },
        { id: 203, name: 'Tempestade', price: 1000, damage: 50, mana: 30, level: 10 }
      ],
      potions: [
        { id: 301, name: 'Poção de Cura', price: 50, effect: { hp: 30 }, level: 1 },
        { id: 302, name: 'Poção de Mana', price: 50, effect: { mana: 20 }, level: 1 },
        { id: 303, name: 'Poção de Força', price: 150, effect: { attack: 10 }, duration: 3600, level: 5 }
      ]
    };
  }

  loadQuests() {
    return {
      daily: [
        {
          id: 1,
          name: 'Caçador de Slimes',
          description: 'Derrote 5 Slimes',
          objective: { monster: 'slime', count: 5 },
          reward: { xp: 100, gold: 50, items: ['Potion'] }
        },
        {
          id: 2,
          name: 'Colecionador de Recursos',
          description: 'Colete 3 itens de monstros',
          objective: { collect: 3 },
          reward: { xp: 150, gold: 100 }
        }
      ],
      story: [
        {
          id: 101,
          name: 'Ameaça Goblin',
          description: 'Derrote 10 Goblins para proteger a vila',
          objective: { monster: 'goblin', count: 10 },
          reward: { xp: 500, gold: 300, items: ['Iron Sword'] },
          requiredLevel: 5
        }
      ]
    };
  }

  loadSpecialCharacters() {
    return {
      '553597816349': { // Rainha Feiticeira Lavs
        title: 'Deusa Suprema / Rainha Eterna',
        weapon: 'Espada Astoria',
        powers: ['Dano Infinito', 'Corta qualquer coisa', 'Queima almas eternamente', 'Transcende o universo humano'],
        goldPerHour: 1000000,
        immunity: true,
        specialCommands: ['!divinejudgment @alvo']
      },
      '5519981889986': { // Escriba Suprema Dany
        title: 'Escriba Suprema da Deusa Lavs',
        weapon: 'Cajado mágico Instropecto La Varum Chtuvhulo',
        powers: ['Mesmos poderes transcendentes da espada de Lavs'],
        goldPerHour: 1000000,
        immunity: true
      },
      '5521985886256': { // Magnata Maligno
        goldPerHour: 1000000,
        immunity: true
      },
      '559984271816': { // Don de La Bragança
        title: 'Divindade Suprema',
        isAdmin: true,
        powers: ['Controle total sobre o sistema RPG'],
        specialCommands: ['!resetmundial', '!darxp @alvo 9999', '!banirdeuses @alvo', '!spawnboss']
      }
    };
  }
}

const RPG_DB = new RPGDatabase();

// Sistema de batalha avançado
class BattleSystem {
  static calculateDamage(attacker, defender, isMagic = false) {
    const baseAttack = isMagic ? 
      (attacker.magicAttack + (attacker.equipment.spell?.damage || 0)) : 
      (attacker.attack + (attacker.equipment.weapon?.attack || 0));
    
    const baseDefense = isMagic ? 
      (defender.magicDefense || defender.defense * 0.5) : 
      (defender.defense + (defender.equipment.armor?.defense || 0));
    
    // Fórmula de dano balanceada
    const damage = Math.floor(
      (baseAttack * (0.8 + Math.random() * 0.4)) - 
      (baseDefense * (0.4 + Math.random() * 0.2))
    );
    
    return Math.max(1, damage);
  }

  static applySpecialEffects(attacker, defender, effect) {
    // Implementar efeitos especiais como queimadura, congelamento, etc.
    switch(effect) {
      case 'fire_damage':
        return Math.floor(damage * 1.2);
      case 'freeze_chance':
        if (Math.random() < 0.3) return { damage: damage * 1.5, effect: 'frozen' };
        break;
      case 'life_drain':
        attacker.hp += Math.floor(damage * 0.3);
        break;
    }
    return damage;
  }
}

// Sistema de economia
class EconomySystem {
  static calculatePvPRewards(winner, loser) {
    const baseReward = Math.min(
      Math.floor(loser.gold * 0.2),
      winner.level * 50
    );
    return {
      gold: baseReward,
      xp: winner.level * 5
    };
  }

  static calculateMonsterRewards(monster, playerLevel) {
    const xp = Math.floor(monster.xp * (1 + playerLevel * 0.05));
    const gold = Math.floor(
      (Math.random() * (monster.gold[1] - monster.gold[0])) + monster.gold[0]
    );
    return { xp, gold };
  }
}

// Inicialização do sistema
function initRPGSystem() {
  startDayNightCycle();
  startWeatherSystem();
  startGoldDistribution();
  startAutoReset();
  startBossSpawner();
}

// Ciclo dia/noite
function startDayNightCycle() {
  setInterval(() => {
    RPG_DB.worldState.dayNightCycle = 
      RPG_DB.worldState.dayNightCycle === 'day' ? 'night' : 'day';
    
    // Aplicar modificadores
    if (RPG_DB.worldState.dayNightCycle === 'night') {
      // Aumentar spawn de monstros noturnos
      // Bônus para certas habilidades
    }
  }, 1800000); // 30 minutos
}

// Sistema de clima
function startWeatherSystem() {
  const weatherTypes = ['clear', 'rain', 'storm', 'windy', 'fog'];
  setInterval(() => {
    RPG_DB.worldState.weather = weatherTypes[
      Math.floor(Math.random() * weatherTypes.length)
    ];
    
    // Aplicar efeitos de clima
    switch(RPG_DB.worldState.weather) {
      case 'rain':
        // Aumentar dano de água, reduzir fogo
        break;
      case 'storm':
        // Chance de raios aleatórios
        break;
    }
  }, 3600000); // 1 hora
}

// Spawn de chefes aleatórios
function startBossSpawner() {
  setInterval(() => {
    if (Math.random() < RPG_CONFIG.BOSS_SPAWN_RATE) {
      const boss = RPG_DB.monsters.demon_king;
      RPG_DB.events.activeBoss = {
        ...boss,
        currentHp: boss.hp,
        participants: []
      };
      // Notificar todos os jogadores
    }
  }, 3600000); // 1 hora
}

module.exports = {
  RPG_DB,
  RPG_CONFIG,
  BattleSystem,
  EconomySystem,
  initRPGSystem
};
