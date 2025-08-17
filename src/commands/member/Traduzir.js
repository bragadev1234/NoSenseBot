const axios = require('axios');

module.exports = {
  name: "traduzir",
  commands: ["traduzir", "translate"],
  usage: `${PREFIX}traduzir <texto>`,
  handle: async ({ args, sendReply, sendErrorReply }) => {
    try {
      if (!args[0]) return sendErrorReply(`📛 Informe um texto para traduzir\nEx: ${PREFIX}traduzir Hello world`);
      
      const text = args.join(' ');
      
      // Usando instância pública do LibreTranslate
      const response = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: 'auto',
        target: 'pt',
        format: 'text',
        api_key: '' // Pode deixar vazio para uso público
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const detectedLanguage = response.data.detectedLanguage?.language || 'desconhecido';
      const confidence = response.data.detectedLanguage?.confidence ? 
        (response.data.detectedLanguage.confidence * 100).toFixed(2) + '%' : 'desconhecido';

      await sendReply(`
🌍 *Texto original (${detectedLanguage.toUpperCase()} - ${confidence}):*
${text}

🇧🇷 *Tradução (PT-BR):*
${response.data.translatedText}

📝 *Caracteres:* ${text.length}
      `.trim());
      
    } catch (error) {
      console.error('Erro na tradução:', error);
      sendErrorReply('🔴 Falha ao traduzir. Tente novamente mais tarde.');
    }
  }
};
