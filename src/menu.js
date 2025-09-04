const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");

exports.menuMessage = (senderName) => {
  const date = new Date();

  return `
✨━━━━━━━━━━━━━━━━━━✨  
        *MENU DO ${BOT_NAME}*  
✨━━━━━━━━━━━━━━━━━━✨  

🛡️ *ADMINISTRAÇÃO* 🛡️  
🚪 *${PREFIX}abrir/fechar*  
🔨 *${PREFIX}ban*  
🎖️ *${PREFIX}promover/rebaixar*  
🧹 *${PREFIX}limpar*  
🔗🚫 *${PREFIX}anti-link*  
🔇🚫 *${PREFIX}anti-audio*  
🖼️🚫 *${PREFIX}anti-sticker*  
🎥🚫 *${PREFIX}anti-video*  
📄🚫 *${PREFIX}anti-document*  
🎉 *${PREFIX}welcome*  
👋 *${PREFIX}exit*  
📢 *${PREFIX}marcartodos*  
⏰ *${PREFIX}agendar-mensagem*  
📜 *${PREFIX}regras*  
🪪 *${PREFIX}cep*  
📄 *${PREFIX}ip*  
🧾 *${PREFIX}loctel*  
💳 *${PREFIX}cnpj*  
📞 *${PREFIX}tel3*
📞 *${PREFIX}*  
🗳️ *${PREFIX}placa*  
🧑‍🎓 *${PREFIX}bin*  
📍 *${PREFIX}cpf*  
📞 *${PREFIX}ddd*  
🙋 *${PREFIX}perfil*  
🗣️ *${PREFIX}ig*  
🎫 *${PREFIX}email*  
🧐 *${PREFIX}geo*  
🗃️ *${PREFIX}numero2*
♈ *${PREFIX}signododia*  
🌌 *${PREFIX}ascendentedodia*  
🌐 *${PREFIX}gerar-link*  
👁️ *${PREFIX}revelar*  
🖼️ *${PREFIX}to-image*  
🖌️ *${PREFIX}gerar-imagem*  
🔎 *${PREFIX}google-led*  
📝✂️ *${PREFIX}resumir*  
💡 *Dica*: No comando *${PREFIX}s* você pode escolher um dos filtros: blur, grayscale, sepia, invert, cartoon, pixelate, vintage, emboss, glow, sketch, flip, mirror, rotate, negate, contrast  
💍 *${PREFIX}casar*  
🤔 *${PREFIX}wiki* 
🇯🇵 *${PREFIX}anime*  
🎰 *${PREFIX}cassanic*  
⚔️ *${PREFIX}lutar*  
🩸 *${PREFIX}matar/socar*  
🎲 *${PREFIX}dado*  
💋🤗 *${PREFIX}beijar/abracar*  
🥧 *${PREFIX}torta*  
🪙 *${PREFIX}caracoroa*  
👋 *${PREFIX}tapa*  
🍽️ *${PREFIX}jantar*  
📶 *${PREFIX}ping*  
🌐 *${PREFIX}traduzir*  
💼 *${PREFIX}vagas30*  

📅 *Data:* ${date.toLocaleDateString()}  
⏰ *Hora:* ${date.toLocaleTimeString()}  

✨━━━━━━━━━━━━━━━━━━✨  
        *${BOT_NAME} v${packageInfo.version}*  
✨━━━━━━━━━━━━━━━━━━✨  
`;
};
