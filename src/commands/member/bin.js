const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);
const axios = require("axios");

module.exports = {
  name: "consultabin",
  description: "Consulta informações de BIN de cartão de crédito",
  commands: ["consultabin", "bin", "cartao", "cc"],
  usage: `${PREFIX}consultabin 123456`,
  handle: async ({
    sendText,
    sendErrorReply,
    sendImageFromURL,
    userJid,
    args,
    sendReact,
    sendReply
  }) => {
    await sendReact("💳");

    if (!args.length) {
      throw new InvalidParameterError(
        "❗ Você precisa informar um BIN para consulta!"
      );
    }

    const bin = onlyNumbers(args[0]);

    if (bin.length < 6 || bin.length > 8) {
      await sendErrorReply("❗ BIN inválido! Deve conter entre 6 e 8 dígitos.");
      return;
    }

    try {
      await sendReply("🔎 Consultando informações do BIN...");

      const response = await axios.get(
        `https://lookup.binlist.net/${bin}`,
        {
          timeout: 10000,
          headers: {
            'Accept-Version': '3',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      const data = response.data;

      // Determinar o tipo de cartão com base no primeiro dígito
      let cardType = "Desconhecido";
      const firstDigit = bin.charAt(0);
      
      if (firstDigit === '4') cardType = "Visa";
      else if (firstDigit === '5') cardType = "Mastercard";
      else if (firstDigit === '3') cardType = "American Express";
      else if (firstDigit === '6') cardType = "Discover";

      // Determinar a categoria do cartão
      let cardCategory = "Desconhecida";
      if (data.category) {
        cardCategory = data.category.charAt(0).toUpperCase() + data.category.slice(1);
      }

      // Mensagem formatada
      const caption = `
💳 *CONSULTA DE BIN* 💳

📋 *Informações do Cartão*
━━━━━━━━━━━━━━━━━━━━━━
🔢 *BIN:* ${bin}
🏦 *Banco:* ${data.bank?.name || "Não identificado"}
🌐 *País:* ${data.country?.name || "Não identificado"} (${data.country?.emoji || "🌐"})
🏷️ *Bandeira:* ${data.scheme ? data.scheme.toUpperCase() : cardType}
📊 *Tipo:* ${data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : "Desconhecido"}
🗂️ *Categoria:* ${cardCategory}

💰 *Informações Adicionais*
━━━━━━━━━━━━━━━━━━━━━━
📞 *Telefone do banco:* ${data.bank?.phone || "Não disponível"}
🌐 *Site do banco:* ${data.bank?.url || "Não disponível"}
🏛️ *Moeda:* ${data.country?.currency || "Não identificada"}

⚠️ *Aviso Legal*
━━━━━━━━━━━━━━━━━━━━━━
ℹ️ Esta consulta fornece apenas informações públicas sobre o BIN.
🔒 Não armazenamos ou compartilhamos dados sensíveis.
🚫 Uso para atividades ilegais é estritamente proibido.

⏰ *Consulta realizada em:* ${new Date().toLocaleString("pt-BR")}
      `.trim();

      // Envia imagem com os dados
      try {
        await sendImageFromURL(
          "https://i.ibb.co/0Q6z2yN/bin-banner.jpg",
          caption
        );
      } catch (imageError) {
        // Fallback para texto caso a imagem falhe
        await sendText(caption);
      }

      // Informações adicionais de segurança
      await sendReply(
        `🔒 *DICAS DE SEGURANÇA*\n\n` +
        `✅ Sempre verifique a segurança do site antes de comprar\n` +
        `✅ Use cartões virtuais para compras online\n` +
        `✅ Ative notificações de transações no seu app bancário\n` +
        `✅ Nunca compartilhe o código CVV do seu cartão\n\n` +
        `ℹ️ *Fonte:* Binlist API`
      );

    } catch (error) {
      console.error("Erro na consulta BIN:", error);

      if (error.response?.status === 404) {
        await sendErrorReply(
          "❌ BIN não encontrado na base de dados.\n" +
          "Verifique se o número está correto ou tente um BIN diferente."
        );
      } else if (error.response?.status === 429) {
        await sendErrorReply(
          "⏰ Limite de consultas excedido.\n" +
          "Aguarde alguns instantes antes de fazer outra consulta."
        );
      } else if (error.code === 'ECONNABORTED') {
        await sendErrorReply(
          "⏰ Tempo de consulta excedido.\n" +
          "O serviço pode estar indisponível no momento.\n" +
          "Tente novamente em alguns instantes."
        );
      } else {
        await sendErrorReply(
          "❌ Erro ao realizar a consulta. Tente novamente mais tarde.\n" +
          `*Detalhes:* ${error.message}`
        );
      }
    }
  },
};
