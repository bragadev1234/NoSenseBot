const { PREFIX } = require('../../config');
const { 
  ranking,
  TITULOS,
  atualizarRanking
} = require('./rpgDB');

module.exports = {
  name: "rank",
  description: "Mostra o ranking do reino",
  commands: ["rank", "ranking"],
  usage: `${PREFIX}rank`,
  
  handle: async ({ sendText }) => {
    atualizarRanking();
    
    if(ranking.length === 0) return await sendText("🏰 O reino ainda está vazio...");
    
    let mensagem = "🏆 *RANKING DO REINO* 🏆\n\n";
    ranking.slice(0, 10).forEach((user, index) => {
      mensagem += `${index + 1}. ${TITULOS[user.titulo].nome} @${user.userId}\n` +
                 `   💰 ${user.gold}g | 🌟 Nvl ${user.nivel}\n`;
    });
    
    return await sendText(mensagem);
  }
};
