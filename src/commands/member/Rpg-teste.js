const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

const rpgData = {};
const ranking = [];
const eventosAtivos = [];

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
  PESCADOR: {
    nome: "🎣 Pescador", emoji: "🎣", cooldown: 10,
    ganho: { min: 18, max: 35 }, xp: 2, risco: 0.05,
    desc: "Pesca nos rios do reino", categoria: "civil"
  },
  CAVALEIRO: {
    nome: "⚔️ Cavaleiro", emoji: "⚔️", cooldown: 20,
    ganho: { min: 30, max: 60 }, xp: 5, risco: 0.2,
    desc: "Defende o reino em batalhas", categoria: "militar",
    requisito: "NOBRE"
  },
  ARQUEIRO: {
    nome: "🏹 Arqueiro", emoji: "🏹", cooldown: 15,
    ganho: { min: 25, max: 45 }, xp: 4, risco: 0.15,
    desc: "Atira com precisão", categoria: "militar"
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
  },
  MALDITO: {
    nome: "💀 Maldito", emoji: "💀", cooldown: 40,
    ganho: { min: 100, max: 200 }, xp: 15, risco: 0.8,
    desc: "Executa trabalhos amaldiçoados", categoria: "maldicao",
    efeito: "maldicao"
  }
};

const MALDICOES = {
  AZAR: {
    nome: "☠️ Maldição do Azar",
    efeito: (user) => { user.cooldownMultiplier = 1.5; },
    desc: "Seus trabalhos demoram 50% mais tempo"
  },
  SANGUESSUGA: {
    nome: "🩸 Maldição Sanguessuga",
    efeito: (user) => { user.goldLoss = 0.1; },
    desc: "Perde 10% do gold diariamente"
  },
  ESCRAVIDAO: {
    nome: "⛓️ Maldição da Escravidão",
    efeito: (user) => { user.titulo = "ESCRAVO"; },
    desc: "Você se torna escravo automaticamente"
  }
};

const calcularNivel = (xp) => Math.floor(Math.sqrt(xp / 150)) + 1;
const xpParaProxNivel = (nivel) => Math.pow(nivel, 2) * 150;

const atualizarSistema = () => {
  ranking.length = 0;
  
  Object.entries(rpgData).forEach(([userId, user]) => {
    if(user.maldicoes?.length > 0) {
      user.maldicoes.forEach(maldicao => {
        MALDICOES[maldicao].efeito(user);
      });
    }
    
    if(["ESCRAVO", "MONSTRO"].includes(user.titulo)) {
      const imposto = TITULOS[user.titulo].imposto;
      const perdido = Math.floor(user.gold * imposto);
      user.gold -= perdido;
      
      const rei = ranking.find(u => u.titulo === "REI");
      if(rei) rpgData[rei.userId].gold += perdido;
    }
    
    if(user.gold > 0) ranking.push({ userId, ...user });
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
  
  if(Math.random() < 0.2) {
    const eventos = ["INVASAO_MONSTROS", "FESTA_REAL", "PESTE", "COLHEITA_ABUNDANTE"];
    eventosAtivos.push({ tipo: eventos[Math.floor(Math.random() * eventos.length)], duracao: 3 });
  }
};

// ========== COMANDO PRINCIPAL ==========
module.exports = {
  name: "rpg",
  description: "Sistema RPG completo",
  commands: ["rpg", "trabalhar", "rank", "reinado", "amaldicoar", "curar"],
  usage: `${PREFIX}rpg <comando> [opções]`,
  
  handle: async ({ sendText, userJid, args, command, mentionByReply }) => {
    const userId = onlyNumbers(userJid);
    
    if(!rpgData[userId]) {
      rpgData[userId] = {
        gold: 100,
        xp: 0,
        nivel: 1,
        titulo: "PLEBEU",
        cooldowns: {},
        historico: [],
        fugitivo: false,
        maldicoes: [],
        inventario: []
      };
    }
    
    const user = rpgData[userId];
    atualizarSistema();

    // ========== COMANDO: RANK/REINADO ==========
    if(command === "rank" || command === "reinado") {
      if(ranking.length === 0) return await sendText("🏰 O reino ainda está vazio...");
      
      let mensagem = "✨ *🏆 RANKING DO REINO* ✨\n\n";
      ranking.slice(0, 15).forEach((user, index) => {
        const titulo = TITULOS[user.titulo]?.nome || "🧑 Plebeu";
        mensagem += `${index + 1}. ${titulo} @${user.userId}\n   💰 ${user.gold} golds | 🌟 Nvl ${user.nivel}`;
        if(user.maldicoes?.length > 0) mensagem += ` | 💀 ${user.maldicoes.length} maldições`;
        mensagem += "\n";
      });
      
      if(eventosAtivos.length > 0) {
        mensagem += "\n⚡ *EVENTOS ATIVOS*\n";
        eventosAtivos.forEach(e => mensagem += `- ${e.tipo.replace(/_/g, ' ')} (${e.duracao}d)\n`);
      }
      
      return await sendText(mensagem);
    }

    // ========== COMANDO: AMALDICOAR ==========
    if(command === "amaldicoar" && mentionByReply) {
      if(!["BRUXO", "REI", "RAINHA"].includes(user.titulo)) {
        return await sendText("🚫 *Acesso Negado!* Apenas bruxos e a realeza podem amaldiçoar.");
      }
      
      const alvoId = onlyNumbers(mentionByReply);
      if(!rpgData[alvoId]) return await sendText("❌ Jogador não encontrado!");
      
      const maldicoes = Object.keys(MALDICOES);
      const maldicao = maldicoes[Math.floor(Math.random() * maldicoes.length)];
      
      if(!rpgData[alvoId].maldicoes) rpgData[alvoId].maldicoes = [];
      rpgData[alvoId].maldicoes.push(maldicao);
      
      return await sendText(
        `🌀 *MALDIÇÃO LANÇADA!*\n` +
        `🧙 ${TITULOS[user.titulo].nome} amaldiçoou @${alvoId}\n` +
        `💀 *${MALDICOES[maldicao].nome}*\n` +
        `📜 *Efeito:* ${MALDICOES[maldicao].desc}`
      );
    }

    // ========== COMANDO: CURAR ==========
    if(command === "curar" && mentionByReply) {
      if(!["BRUXO", "REI", "RAINHA"].includes(user.titulo)) {
        return await sendText("🚫 *Acesso Negado!* Apenas bruxos e a realeza podem curar.");
      }
      
      const alvoId = onlyNumbers(mentionByReply);
      if(!rpgData[alvoId]?.maldicoes?.length) return await sendText("❌ Jogador não está amaldiçoado!");
      
      const maldicao = rpgData[alvoId].maldicoes.pop();
      return await sendText(
        `✨ *MALDIÇÃO REMOVIDA!*\n` +
        `🧙 ${TITULOS[user.titulo].nome} curou @${alvoId}\n` +
        `🛡️ *${MALDICOES[maldicao].nome}* foi removida!`
      );
    }

    // ========== COMANDO: TRABALHAR ==========
    if(command === "trabalhar" || (command === "rpg" && args[0] === "trabalhar")) {
      const empregoArg = args[1]?.toLowerCase();
      
      if(!empregoArg) {
        let mensagem = `🏰 *📜 LISTA DE EMPREGOS* 🏰\n\n` +
          `👤 *Seu Status:*\n` +
          `🏷️ ${TITULOS[user.titulo].nome} | 💰 ${user.gold}g | 🌟 Nvl ${user.nivel}\n\n`;
        
        Object.values(EMPREGOS).forEach(emp => {
          const disponivel = !(emp.requisito && user.titulo !== emp.requisito) && 
                           !(emp.ilegal && ["REI", "RAINHA", "PRINCIPE", "DUQUE"].includes(user.titulo));
          
          mensagem += `${disponivel ? emp.emoji : "🔒"} *${emp.nome}*\n` +
                     `⏱️ ${emp.cooldown}s | 💰 ${emp.ganho.min}-${emp.ganho.max}g | ✨ +${emp.xp}xp\n` +
                     `${emp.desc}${!disponivel ? " (🔒 Bloqueado)" : ""}\n\n`;
        });
        
        return await sendText(mensagem + `📌 Exemplo: ${PREFIX}trabalhar mineiro`);
      }
      
      const emprego = Object.values(EMPREGOS).find(e => 
        e.nome.toLowerCase().includes(empregoArg)
      );
      
      if(!emprego) return await sendText(`❌ Emprego não encontrado! Use ${PREFIX}trabalhar para listar.`);
      
      if(emprego.requisito && user.titulo !== emprego.requisito) {
        return await sendText(`🔒 Você precisa ser ${TITULOS[emprego.requisito].nome} para este trabalho.`);
      }
      
      if(user.fugitivo) {
        if(Math.random() < 0.4) {
          user.titulo = "ESCRAVO";
          user.fugitivo = false;
          return await sendText(`⛓️ *CAPTURADO!* Você foi pego e agora é um ESCRAVO!`);
        }
        return await sendText(`🏃‍♂️ *FUGITIVO!* Você não pode trabalhar enquanto está fugindo!`);
      }
      
      const cooldownRestante = (user.cooldowns[emprego.nome] || 0) - Date.now();
      if(cooldownRestante > 0) {
        return await sendText(
          `⏳ *AGUARDE* ${Math.ceil(cooldownRestante/1000)}s\n` +
          `Você pode trabalhar como ${emprego.emoji} ${emprego.nome} novamente em ${Math.ceil(cooldownRestante/1000)} segundos.`
        );
      }
      
      let ganho = Math.floor(Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)) + emprego.ganho.min;
      ganho += ganho * TITULOS[user.titulo].bonus;
      ganho = Math.round(ganho);
      
      if(TITULOS[user.titulo].imposto > 0) {
        const imposto = Math.floor(ganho * TITULOS[user.titulo].imposto);
        ganho -= imposto;
        if(["ESCRAVO", "MONSTRO"].includes(user.titulo)) {
          const rei = ranking.find(u => u.titulo === "REI");
          if(rei) rpgData[rei.userId].gold += imposto;
        }
      }
      
      let evento = "";
      
      if(emprego.ilegal && Math.random() < emprego.risco) {
        user.fugitivo = true;
        evento = `\n\n🚨 *ALERTA!* Você foi descoberto e agora é um FUGITIVO!`;
      } 
      else if(emprego.efeito === "maldicao" && Math.random() < 0.4) {
        const maldicao = Object.keys(MALDICOES)[Math.floor(Math.random() * Object.keys(MALDICOES).length)];
        if(!user.maldicoes) user.maldicoes = [];
        user.maldicoes.push(maldicao);
        evento = `\n\n💀 *MALDIÇÃO!* ${MALDICOES[maldicao].nome} - ${MALDICOES[maldicao].desc}`;
      }
      else if(user.titulo === "ESCRAVO" && Math.random() < 0.1) {
        user.titulo = "MONSTRO";
        evento = `\n\n👹 *TRANSFORMAÇÃO!* Você se tornou um MONSTRO! 70% de impostos para o rei.`;
      }
      else if(user.titulo === "PLEBEU" && Math.random() < 0.05) {
        user.titulo = "NOBRE";
        evento = `\n\n🎩 *PROMOÇÃO!* Você agora é um NOBRE!`;
      }
      else if(emprego.categoria === "magico" && Math.random() < 0.1 && user.nivel >= 5) {
        user.titulo = "BRUXO";
        evento = `\n\n🧙 *BRUXO!* Você dominou as artes arcanas!`;
      }
      
      user.gold += ganho;
      user.xp += emprego.xp;
      user.cooldowns[emprego.nome] = Date.now() + (emprego.cooldown * 1000);
      
      const novoNivel = calcularNivel(user.xp);
      if(novoNivel > user.nivel) {
        evento += `\n\n🎉 *NÍVEL ${novoNivel}!* Seus ganhos aumentaram!`;
        user.nivel = novoNivel;
      }
      
      atualizarSistema();
      
      return await sendText(
        `💼 *TRABALHO CONCLUÍDO* 💼\n\n` +
        `${emprego.emoji} *${emprego.nome}*\n` +
        `💰 Ganho: ${ganho}g (${TITULOS[user.titulo].bonus * 100}% ${TITULOS[user.titulo].bonus > 0 ? 'bônus' : 'desconto'})\n` +
        `✨ XP: +${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})\n` +
        `🏷️ Título: ${TITULOS[user.titulo].nome}\n` +
        `⏱️ Recarga: ${emprego.cooldown}s` +
        evento
      );
    }

    // ========== MENSAGEM DE AJUDA PADRÃO ==========
    return await sendText(
      `✨ *🏰 SISTEMA RPG DO REINO* ✨\n\n` +
      `📜 *COMANDOS DISPONÍVEIS:*\n\n` +
      `🛠️ *${PREFIX}trabalhar* - Lista de empregos\n` +
      `🛠️ *${PREFIX}trabalhar <emprego>* - Trabalha\n` +
      `🏆 *${PREFIX}rank* - Ranking do reino\n` +
      `🌀 *${PREFIX}amaldicoar @jogador* - Lança maldição (Bruxos/Realeza)\n` +
      `✨ *${PREFIX}curar @jogador* - Remove maldição (Bruxos/Realeza)\n\n` +
      `💡 Dica: Use *${PREFIX}trabalhar* para ver todos os empregos detalhados.`
    );
  }
};
