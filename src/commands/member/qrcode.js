// gerarqrcode.js - CORRIGIDO (usando FFmpeg se necessário)
const qrcode = require('qrcode');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "gerarqrcode",
  description: "Gera QR Code a partir de texto/URL",
  commands: ["gerarqrcode", "qrcode", "qr"],
  usage: `${PREFIX}gerarqrcode <texto>`,
  
  handle: async ({ args, sendReply, sendErrorReply, sendImageFromBuffer }) => {
    if (!args.length) {
      throw new InvalidParameterError("Digite o texto para o QR Code");
    }

    const text = args.join(" ");
    
    try {
      // Usando a biblioteca qrcode que é mais eficiente para QR Codes
      const qrBuffer = await qrcode.toBuffer(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      await sendImageFromBuffer(qrBuffer, `📱 QR Code: ${text.length > 50 ? text.substring(0, 50) + '...' : text}`);
      
    } catch (error) {
      await sendErrorReply("Erro ao gerar QR Code!");
    }
  },
};
