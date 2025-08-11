const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const translate = require('google-translate-api-x');

module.exports = {
  name: "traduzir",
  description: "Traduz texto para português brasileiro.",
  commands: ["traduzir", "translate"],
  usage: `${PREFIX}traduzir <texto>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendReply, sendErrorReply }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        `Você precisa informar um texto para traduzir!\nEx: ${PREFIX}traduzir Hello world`
      );
    }

    const text = args.join(' ');

    try {
      // Tradução com detecção automática
      const res = await translate(text, { to: 'pt' });

      const detectedLanguage = res.from.language.iso || 'desconhecido';
      const translatedText = res.text || 'N/A';

      await sendReply(`
🌍 *Texto original (${detectedLanguage.toUpperCase()}):*
${text}

🇧🇷 *Tradução (PT-BR):*
${translatedText}

📝 *Caracteres:* ${text.length}
      `.trim());

    } catch (error) {
      console.error('[TRADUZIR] Erro:', error.message);
      await sendErrorReply('🔴 Falha ao traduzir. Tente novamente mais tarde.');
    }
  }
};
