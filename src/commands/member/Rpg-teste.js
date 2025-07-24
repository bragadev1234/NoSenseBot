const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');

// Banco de dados em memória
const rpgData = {};
const ranking = [];
const eventosAtivos = [];

// Hierarquia e títulos expandidos
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

// Lista expandida de empregos com categorias
const EMPREGOS = {
  // Empregos civis
  FAZENDEIRO: {
    nome: "👨‍🌾 Fazendeiro", categoria: "civil", 
    cooldown: 10, ganho: { min: 15, max: 30 }, 
    xp: 2, risco: 0, desc: "Cultiva alimentos básicos"
  },

  // Empregos militares
  CAVALEIRO: {
    nome: "⚔️ Cavaleiro", categoria: "militar", 
    cooldown: 20, ganho: { min: 30, max: 60 }, 
    xp: 5, risco: 0.2, desc: "Defende o reino em batalhas",
    requisito: "NOBRE"
  },

  // Empregos ilegais
  LADRAO: {
    nome: "🦹 Ladrão", categoria: "ilegal", 
    cooldown: 15, ganho: { min: 50, max: 90 }, 
    xp: 6, risco: 0.6, desc: "Rouba dos ricos... e dos pobres também",
    ilegal: true
  },

  // Empregos mágicos
  BRUXO: {
    nome: "🔮 Aprendiz de Bruxo", categoria: "magico", 
    cooldown: 25, ganho: { min: 40, max: 80 }, 
    xp: 8, risco: 0.3, desc: "Estuda as artes arcanas",
    requisito: null
  },

  // Empregos reais
  CONSELHEIRO: {
    nome: "💼 Conselheiro Real", categoria: "real", 
    cooldown: 30, ganho: { min: 70, max: 120 }, 
    xp: 10, risco: 0, desc: "Aconselha a realeza",
    requisito: "DUQUE"
  },

  // Profissões amaldiçoadas
  MALDITO: {
    nome: "💀 Maldito", categoria: "maldicao", 
    cooldown: 40, ganho: { min: 100, max: 200 }, 
    xp: 15, risco: 0.8, desc: "Executa trabalhos amaldiçoados",
    efeito: "maldicao"
  }
};

// Sistema de maldições
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

// Sistema de progressão
const calcularNivel = (xp) => Math.floor(Math.sqrt(xp / 150)) + 1;
const xpParaProxNivel = (nivel) => Math.pow(nivel, 2) * 150;

// Atualizar ranking e aplicar eventos globais
const atualizarSistema = () => {
  ranking.length = 0;
  
  // Processar todos os jogadores
  Object.entries(rpgData).forEach(([userId, user]) => {
    // Aplicar efeitos de maldição
    if(user.maldicoes && user.maldicoes.length > 0) {
      user.maldicoes.forEach(maldicao => {
        MALDICOES[maldicao].efeito(user);
      });
    }
    
    // Aplicar perda de gold para escravos/monstros
    if(user.titulo === "ESCRAVO" || user.titulo === "MONSTRO") {
      const imposto = TITULOS[user.titulo].imposto;
      const perdido = Math.floor(user.gold * imposto);
      user.gold -= perdido;
      
      // Encontrar o rei para receber os impostos
      const rei = ranking.find(u => u.titulo === "REI");
      if(rei) {
        rpgData[rei.userId].gold += perdido;
      }
    }
    
    // Adicionar ao ranking se tiver gold positivo
    if(user.gold > 0) {
      ranking.push({ userId, ...user });
    }
  });
  
  // Ordenar ranking
  ranking.sort((a, b) => b.gold - a.gold);
  
  // Atribuir títulos
  ranking.forEach((user, index) => {
    if(index === 0) user.titulo = "REI";
    else if(index === 1) user.titulo = "RAINHA";
    else if(index === 2) user.titulo = "PRINCIPE";
    else if(index < 5) user.titulo = "DUQUE";
    else if(index < 15) user.titulo = "NOBRE";
    else if(user.titulo !== "BRUXO" && user.titulo !== "MONSTRO") {
      user.titulo = "PLEBEU";
    }
  });
  
  // Gerar eventos aleatórios
  if(Math.random() < 0.2) {
    const eventosPossiveis = [
      "INVASAO_MONSTROS",
      "FESTA_REAL",
      "PESTE",
      "COLHEITA_ABUNDANTE"
    ];
    const evento = eventosPossiveis[Math.floor(Math.random() * eventosPossiveis.length)];
    eventosAtivos.push({ tipo: evento, duracao: 3 });
  }
};

// Comando principal
module.exports = {
  name: "rpg",
  description: "Sistema RPG completo com hierarquia, magia e economia",
  commands: ["rpg", "trabalhar", "rank", "reinado", "amaldicoar", "curar"],
  usage: `${PREFIX}rpg <comando> [opções]`,
  
  handle: async ({ sendText, userJid, args, command, mentionByReply }) => {
    const userId = onlyNumbers(userJid);
    const now = new Date();
    
    // Inicializar jogador
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
        inventario: [],
        ultimoTrabalho: null
      };
    }
    
    const user = rpgData[userId];
    atualizarSistema();
    
    // Comando: !rank / !reinado
    if(command === "rank" || command === "reinado") {
      if(ranking.length === 0) {
        return await sendText("🏰 O reino ainda está vazio... Seja o primeiro a trabalhar!");
      }
      
      let mensagem = "🏆 *HIERARQUIA REAL* 🏆\n\n";
      
      ranking.slice(0, 15).forEach((user, index) => {
        const titulo = TITULOS[user.titulo]?.nome || "🧑 Plebeu";
        mensagem += `${index + 1}. ${titulo} @${user.userId}\n   🪙 ${user.gold} golds | ✨ Nvl ${user.nivel}`;
        
        if(user.maldicoes?.length > 0) {
          mensagem += ` | 💀 ${user.maldicoes.length} maldições`;
        }
        
        mensagem += "\n";
      });
      
      // Mostrar eventos ativos
      if(eventosAtivos.length > 0) {
        mensagem += "\n⚡ *EVENTOS ATIVOS*\n";
        eventosAtivos.forEach(evento => {
          mensagem += `- ${evento.tipo.replace(/_/g, ' ')} (${evento.duracao} dias restantes)\n`;
        });
      }
      
      return await sendText(mensagem);
    }
    
    // Comando: !amaldicoar (apenas bruxos/realeza)
    if(command === "amaldicoar" && mentionByReply) {
      if(user.titulo !== "BRUXO" && !["REI", "RAINHA"].includes(user.titulo)) {
        return await sendText("❌ Apenas bruxos e a realeza podem amaldiçoar outros!");
      }
      
      const alvoId = onlyNumbers(mentionByReply);
      if(!rpgData[alvoId]) {
        return await sendText("❌ Jogador não encontrado no reino!");
      }
      
      const alvo = rpgData[alvoId];
      const maldicoesDisponiveis = Object.keys(MALDICOES);
      const maldicao = maldicoesDisponiveis[Math.floor(Math.random() * maldicoesDisponiveis.length)];
      
      if(!alvo.maldicoes) alvo.maldicoes = [];
      alvo.maldicoes.push(maldicao);
      
      return await sendText(
        `🌀 *MALDIÇÃO LANÇADA!*\n\n` +
        `${TITULOS[user.titulo].nome} @${userId} amaldiçoou @${alvoId}\n` +
        `💀 Maldição: ${MALDICOES[maldicao].nome}\n` +
        `📜 Efeito: ${MALDICOES[maldicao].desc}`
      );
    }
    
    // Comando: !curar (apenas bruxos/realeza)
    if(command === "curar" && mentionByReply) {
      if(user.titulo !== "BRUXO" && !["REI", "RAINHA"].includes(user.titulo)) {
        return await sendText("❌ Apenas bruxos e a realeza podem curar maldições!");
      }
      
      const alvoId = onlyNumbers(mentionByReply);
      if(!rpgData[alvoId] || !rpgData[alvoId].maldicoes || rpgData[alvoId].maldicoes.length === 0) {
        return await sendText("❌ Este jogador não está amaldiçoado!");
      }
      
      const maldicaoRemovida = rpgData[alvoId].maldicoes.pop();
      
      return await sendText(
        `✨ *MALDIÇÃO REMOVIDA!*\n\n` +
        `${TITULOS[user.titulo].nome} @${userId} removeu uma maldição de @${alvoId}\n` +
        `🛡️ Maldição removida: ${MALDICOES[maldicaoRemovida].nome}`
      );
    }
    
    // Comando: !trabalhar / !rpg trabalhar
    if(command === "trabalhar" || (command === "rpg" && args[0] === "trabalhar")) {
      const empregoArg = args[1]?.toLowerCase();
      
      // Mostrar lista de empregos se não especificar
      if(!empregoArg) {
        let empregosPorCategoria = {};
        
        Object.values(EMPREGOS).forEach(emprego => {
          if(!empregosPorCategoria[emprego.categoria]) {
            empregosPorCategoria[emprego.categoria] = [];
          }
          
          let disponivel = true;
          if(emprego.requisito && user.titulo !== emprego.requisito) disponivel = false;
          if(emprego.ilegal && ["REI", "RAINHA", "PRINCIPE", "DUQUE"].includes(user.titulo)) disponivel = false;
          if(emprego.efeito === "maldicao" && user.titulo === "BRUXO") disponivel = false;
          
          empregosPorCategoria[emprego.categoria].push({
            ...emprego,
            disponivel,
            texto: `${emprego.emoji || '🔹'} *${emprego.nome}* - ${PREFIX}${command} ${emprego.nome.split(' ')[1].toLowerCase()}\n` +
                   `⏱️ ${emprego.cooldown}s | 🪙 ${emprego.ganho.min}-${emprego.ganho.max} | ✨ +${emprego.xp} XP\n` +
                   `📝 ${emprego.desc}${!disponivel ? '\n🔒 *BLOQUEADO*' : ''}`
          });
        });
        
        let mensagem = `🏰 *REINO DE BRAGA* - ${TITULOS[user.titulo].nome}\n\n`;
        mensagem += `💰 Saldo: ${user.gold} golds | ✨ Nível ${user.nivel} (${user.xp}/${xpParaProxNivel(user.nivel)} XP)\n`;
        
        if(user.maldicoes?.length > 0) {
          mensagem += `💀 Maldições: ${user.maldicoes.map(m => MALDICOES[m].nome).join(', ')}\n`;
        }
        
        mensagem += `\n📜 *CATEGORIAS DE EMPREGOS*\n`;
        
        for(const [categoria, empregos] of Object.entries(empregosPorCategoria)) {
          mensagem += `\n*${categoria.toUpperCase()}*\n`;
          mensagem += empregos.filter(e => e.disponivel).map(e => e.texto).join('\n\n');
          
          const bloqueados = empregos.filter(e => !e.disponivel);
          if(bloqueados.length > 0) {
            mensagem += `\n\n*🔒 ${categoria.toUpperCase()} BLOQUEADOS*\n`;
            mensagem += bloqueados.map(e => e.texto).join('\n\n');
          }
        }
        
        return await sendText(mensagem);
      }
      
      // Encontrar emprego
      const emprego = Object.values(EMPREGOS).find(e => 
        e.nome.toLowerCase().includes(empregoArg)
      );
      
      if(!emprego) {
        return await sendText(`❌ Emprego não encontrado! Use ${PREFIX}${command} para ver a lista.`);
      }
      
      // Verificar requisitos
      if(emprego.requisito && user.titulo !== emprego.requisito) {
        return await sendText(
          `🔒 *ACESSO NEGADO*\n` +
          `Você precisa ser ${TITULOS[emprego.requisito].nome} para trabalhar como ${emprego.nome}.`
        );
      }
      
      // Verificar se é fugitivo
      if(user.fugitivo) {
        const chanceCaptura = 0.4;
        if(Math.random() < chanceCaptura) {
          user.titulo = "ESCRAVO";
          user.fugitivo = false;
          return await sendText(
            `⛓️ *CAPTURADO!*\n` +
            `Você foi capturado pelos guardas enquanto tentava trabalhar!\n` +
            `Agora você é um ESCRAVO do reino.`
          );
        }
        return await sendText(
          `🏃‍♂️ *FUGITIVO*\n` +
          `Você não pode trabalhar enquanto está fugindo da lei!\n` +
          `Chance de captura: ${chanceCaptura * 100}% a cada tentativa.`
        );
      }
      
      // Verificar cooldown
      const cooldownRestante = (user.cooldowns[emprego.nome] || 0) - Date.now();
      
      if(cooldownRestante > 0) {
        const segundos = Math.ceil(cooldownRestante / 1000);
        return await sendText(
          `⏳ *Aguarde ${segundos}s*\n` +
          `Você pode trabalhar como ${emprego.emoji || '🔹'} ${emprego.nome} novamente em ${segundos} segundos.`
        );
      }
      
      // Executar trabalho
      let ganho = Math.floor(
        Math.random() * (emprego.ganho.max - emprego.ganho.min + 1)
      ) + emprego.ganho.min;
      
      // Aplicar bônus/malus
      ganho += ganho * TITULOS[user.titulo].bonus;
      ganho = Math.round(ganho);
      
      // Aplicar impostos (exceto para fugitivos)
      if(TITULOS[user.titulo].imposto > 0 && !user.fugitivo) {
        const imposto = Math.floor(ganho * TITULOS[user.titulo].imposto);
        ganho -= imposto;
        
        // Rei recebe impostos de escravos/monstros
        if(["ESCRAVO", "MONSTRO"].includes(user.titulo)) {
          const rei = ranking.find(u => u.titulo === "REI");
          if(rei) {
            rpgData[rei.userId].gold += imposto;
          }
        }
      }
      
      // Risco de eventos
      let evento = "";
      
      // Chance de ser pego em empregos ilegais
      if(emprego.ilegal && Math.random() < emprego.risco) {
        user.fugitivo = true;
        evento = `\n\n🚨 *ALERTA!* Você foi descoberto e agora é um FUGITIVO!`;
      } 
      // Chance de contrair maldição em trabalhos amaldiçoados
      else if(emprego.efeito === "maldicao" && Math.random() < 0.4) {
        const maldicoesDisponiveis = Object.keys(MALDICOES);
        const maldicao = maldicoesDisponiveis[Math.floor(Math.random() * maldicoesDisponiveis.length)];
        
        if(!user.maldicoes) user.maldicoes = [];
        user.maldicoes.push(maldicao);
        
        evento = `\n\n💀 *MALDIÇÃO!* Você contraiu ${MALDICOES[maldicao].nome}!\n` +
                 `📜 Efeito: ${MALDICOES[maldicao].desc}`;
      }
      // Chance de virar monstro
      else if(user.titulo === "ESCRAVO" && Math.random() < 0.1) {
        user.titulo = "MONSTRO";
        evento = `\n\n👹 *TRANSFORMAÇÃO!* O sofrimento te transformou em um MONSTRO!\n` +
                 `Agora 70% de seus ganhos vão para o rei.`;
      }
      // Chance de promoção para nobre
      else if(user.titulo === "PLEBEU" && Math.random() < 0.05) {
        user.titulo = "NOBRE";
        evento = `\n\n🎩 *HONRAS!* Você foi promovido a NOBRE do reino!`;
      }
      // Chance de virar bruxo
      else if(emprego.categoria === "magico" && Math.random() < 0.1 && user.nivel >= 5) {
        user.titulo = "BRUXO";
        evento = `\n\n🧙 *ILUMINAÇÃO!* Você dominou as artes arcanas e agora é um BRUXO!\n` +
                 `Você pode lançar maldições em outros jogadores.`;
      }
      
      // Atualizar dados do jogador
      user.gold += ganho;
      user.xp += emprego.xp;
      user.cooldowns[emprego.nome] = Date.now() + (emprego.cooldown * 1000);
      user.ultimoTrabalho = emprego.nome;
      
      // Verificar nível
      const novoNivel = calcularNivel(user.xp);
      if(novoNivel > user.nivel) {
        evento += `\n\n🎉 *NOVO NÍVEL ${novoNivel}!* Seus ganhos aumentaram!`;
        user.nivel = novoNivel;
      }
      
      // Atualizar ranking
      atualizarSistema();
      
      // Mensagem de resultado
      let mensagem = `💼 *TRABALHO REALIZADO*\n\n` +
        `${emprego.emoji || '🔹'} *${emprego.nome}*\n` +
        `🪙 Ganho: ${ganho} golds (${TITULOS[user.titulo].bonus * 100}% ${TITULOS[user.titulo].bonus > 0 ? 'bônus' : 'desconto'})`;
      
      if(TITULOS[user.titulo].imposto > 0) {
        mensagem += ` | 💸 ${TITULOS[user.titulo].imposto * 100}% impostos`;
      }
      
      mensagem += `\n✨ XP: +${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})` +
                  `\n🏷️ Título: ${TITULOS[user.titulo].nome}` +
                  `\n⏱️ Próximo trabalho em ${emprego.cooldown}s` +
                  evento;
      
      return await sendText(mensagem);
    }
    
    // Comando não reconhecido
    return await sendText(
      `🏰 *SISTEMA RPG DO REINO*\n\n` +
      `📌 Comandos disponíveis:\n` +
      `- ${PREFIX}trabalhar - Mostra lista de empregos\n` +
      `- ${PREFIX}trabalhar <emprego> - Trabalha na profissão\n` +
      `- ${PREFIX}rank - Mostra a hierarquia do reino\n` +
      `- ${PREFIX}amaldicoar @jogador - Lança uma maldição (apenas bruxos/realeza)\n` +
      `- ${PREFIX}curar @jogador - Remove uma maldição (apenas bruxos/realeza)\n\n` +
      `💡 Use ${PREFIX}trabalhar sem argumentos para ver todos os empregos disponíveis.`
    );
  }
};
