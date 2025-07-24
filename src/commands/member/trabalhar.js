const { PREFIX } = require('../../config');
const { onlyNumbers } = require('../../utils');
const { 
  rpgData,
  EMPREGOS,
  TITULOS,
  calcularNivel,
  xpParaProxNivel,
  atualizarRanking
} = require('./rpgDB');

module.exports = {
  name: "trabalhar",
  description: "Trabalhe para ganhar gold e XP",
  commands: ["trabalhar"],
  usage: `${PREFIX}trabalhar <emprego>`,
  
  handle: async ({ sendText, userJid, args }) => {
    const userId = onlyNumbers(userJid);
    
    if(!rpgData[userId]) {
      rpgData[userId] = {
        gold: 100,
        xp: 0,
        nivel: 1,
        titulo: "PLEBEU",
        cooldowns: {},
        fugitivo: false
      };
    }
    
    const user = rpgData[userId];
    const empregoArg = args[0]?.toLowerCase();
    
    if(!empregoArg) {
      let lista = "✨ *LISTA DE EMPREGOS* ✨\n\n";
      Object.values(EMPREGOS).forEach(emp => {
        const disponivel = !emp.requisito || user.titulo === emp.requisito;
        lista += `${disponivel ? emp.emoji : "🔒"} *${emp.nome}*\n` +
                `💰 ${emp.ganho.min}-${emp.ganho.max}g | ⏱️ ${emp.cooldown}s\n` +
                `${emp.desc}${!disponivel ? " (🔒 Bloqueado)" : ""}\n\n`;
      });
      return await sendText(lista + `📌 Exemplo: ${PREFIX}trabalhar mineiro`);
    }
    
    const emprego = Object.values(EMPREGOS).find(e => 
      e.nome.toLowerCase().includes(empregoArg)
    );
    
    if(!emprego) return await sendText("❌ Emprego não encontrado!");
    
    if(emprego.requisito && user.titulo !== emprego.requisito) {
      return await sendText(`🔒 Você precisa ser ${TITULOS[emprego.requisito].nome} para este trabalho.`);
    }
    
    if(user.fugitivo) {
      if(Math.random() < 0.4) {
        user.titulo = "ESCRAVO";
        user.fugitivo = false;
        return await sendText("⛓️ Você foi capturado e agora é um ESCRAVO!");
      }
      return await sendText("🏃‍♂️ Você está fugindo e não pode trabalhar!");
    }
    
    const cooldownRestante = (user.cooldowns[emprego.nome] || 0) - Date.now();
    if(cooldownRestante > 0) {
      return await sendText(`⏳ Aguarde ${Math.ceil(cooldownRestante/1000)}s para trabalhar novamente.`);
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
    
    user.gold += ganho;
    user.xp += emprego.xp;
    user.cooldowns[emprego.nome] = Date.now() + (emprego.cooldown * 1000);
    
    const novoNivel = calcularNivel(user.xp);
    let mensagem = `💼 *${emprego.nome.toUpperCase()}*\n\n` +
                  `💰 Ganho: ${ganho}g\n` +
                  `✨ XP: +${emprego.xp} (${user.xp}/${xpParaProxNivel(user.nivel)})\n` +
                  `⏱️ Recarga: ${emprego.cooldown}s`;
    
    if(novoNivel > user.nivel) {
      user.nivel = novoNivel;
      mensagem += `\n\n🎉 *NÍVEL ${novoNivel} ALCANÇADO!*`;
    }
    
    if(emprego.ilegal && Math.random() < emprego.risco) {
      user.fugitivo = true;
      mensagem += `\n\n🚨 *VOCÊ FOI DESCOBERTO!* Agora é um FUGITIVO!`;
    }
    
    atualizarRanking();
    return await sendText(mensagem);
  }
};
