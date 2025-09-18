const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");

exports.menuMessage = (senderName) => {
  const date = new Date();

  return `
✨━━━━━━━━━━━━━ MENU ━━━━━━━━━━━━━✨  
👋 Olá, *${senderName}*!  
Aqui estão os comandos disponíveis no *${BOT_NAME}* 🤖  

📅 *Data:* ${date.toLocaleDateString()}  
⚙️ *Versão:* v${packageInfo.version}  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 *ADMINISTRAÇÃO*  
🚪 ${PREFIX}abrir / ${PREFIX}fechar  
🔨 ${PREFIX}ban  
🎖️ ${PREFIX}promover / ${PREFIX}rebaixar  
🧹 ${PREFIX}limpar  
📢 ${PREFIX}marcartodos  
🎉 ${PREFIX}welcome  
👋 ${PREFIX}exit  
💾 ${PREFIX}infogrupo | linkgrupo | listaadm  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 *ANTIS*  
🔗 ${PREFIX}anti-link  
🔇 ${PREFIX}anti-audio  
🖼️ ${PREFIX}anti-sticker  
🎥 ${PREFIX}anti-video  
📄 ${PREFIX}anti-document  

━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 *UTILITÁRIOS*  
📜 ${PREFIX}regras  
🪪 ${PREFIX}cep  
📄 ${PREFIX}ip  
🚏 ${PREFIX}qr  
🧾 ${PREFIX}loctel  
💳 ${PREFIX}cnpj  
📞 ${PREFIX}tel3  
📞 ${PREFIX}ddd  
🗳️ ${PREFIX}placa  
🧑‍🎓 ${PREFIX}bin  
📍 ${PREFIX}cpf  
🙋 ${PREFIX}perfil  
🗣️ ${PREFIX}ig  
🎫 ${PREFIX}email  
🧐 ${PREFIX}geo  
🗃️ ${PREFIX}numero2  
🌐 ${PREFIX}gerar-link  
👁️ ${PREFIX}revelar  
🖼️ ${PREFIX}to-image  
🖌️ ${PREFIX}gerar-imagem  
📶 ${PREFIX}ping  
🚨 ${PREFIX}gerarsenha  
🗓️ ${PREFIX}calculadora  
🌐 ${PREFIX}traduzir  
💼 ${PREFIX}vagas30  
🇵🇹 ${PREFIX}nif  
🇪🇸 ${PREFIX}espanhola  
🔎 ${PREFIX}google-led  
📝✂️ ${PREFIX}resumir  
🤔 ${PREFIX}wiki  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 *DIVERSÃO & JOGOS*  
🎰 ${PREFIX}cassanic  
⚔️ ${PREFIX}lutar  
🩸 ${PREFIX}matar / ${PREFIX}socar  
🎲 ${PREFIX}dado  
💋🤗 ${PREFIX}beijar / ${PREFIX}abracar  
🥧 ${PREFIX}torta  
🪙 ${PREFIX}caracoroa  
👋 ${PREFIX}tapa  
🍽️ ${PREFIX}jantar  
🏪 ${PREFIX}get-lid  

━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 *CULTURA & ANIME*  
🇯🇵 ${PREFIX}anime  
🎵 ${PREFIX}letra  
♈ ${PREFIX}signododia  
🌌 ${PREFIX}ascendentedodia  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🐾 *PETS*  
🐶 ${PREFIX}pet  
📋 ${PREFIX}meuspets  
🏆 ${PREFIX}pet rank  
ℹ️ ${PREFIX}pet info  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 *NSFW +18*  
🤤 ${PREFIX}hentai  
💦 ${PREFIX}sexo1 / ${PREFIX}sexo2 / ${PREFIX}sexo3  
🚶 ${PREFIX}sexoempe  
🍑 ${PREFIX}sentar2  
💧 ${PREFIX}sexomolhado  
👄 ${PREFIX}boquete  
😋 ${PREFIX}chuparpeitos  
🎌 ${PREFIX}sexohegal  
👭 ${PREFIX}sexo-lesbica  
💋 ${PREFIX}beijo-lesbico  
🌸 ${PREFIX}sexo-yuri  
✋ ${PREFIX}apalpar-amiga  
🤲 ${PREFIX}apalpar  
🍆 ${PREFIX}sexo-futa1 / ${PREFIX}sexo-futa2  
💅 ${PREFIX}sexo-femboy  
✌️ ${PREFIX}siririca / ${PREFIX}siririca2  
🍈🍈 ${PREFIX}mostrarospeitos  
👅 ${PREFIX}chuparbct  
👀 ${PREFIX}sexo-loli  

━━━━━━━━━━━━━━━━━━━━━━━━━━
😂 *RANKS MEMES*  
🤡 ${PREFIX}rank-corno  
🥊 ${PREFIX}rank-jabateu  
🎲 ${PREFIX}rank-jadeu  
👅 ${PREFIX}rank-mamada  

✨━━━━━━━━━━━━━━━━━━✨  
`;
};
