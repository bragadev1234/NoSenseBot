const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);
const axios = require("axios");

module.exports = {
  name: "consultacep",
  description: "Consulta informações de endereço por CEP",
  commands: ["consultacep", "cep", "endereco"],
  usage: `${PREFIX}consultacep 12345678`,
  handle: async ({
    sendText,
    sendErrorReply,
    sendImageFromURL,
    userJid,
    args,
    sendReact,
    sendReply,
    sendLink
  }) => {
    await sendReact("📮");

    if (!args.length) {
      throw new InvalidParameterError(
        "❗ Você precisa informar um CEP para consulta!"
      );
    }

    const cep = onlyNumbers(args[0]);

    if (cep.length !== 8) {
      await sendErrorReply("❗ CEP inválido! Deve conter 8 dígitos.");
      return;
    }

    try {
      await sendReply("🔎 Buscando informações do CEP...");

      const response = await axios.get(
        `https://viacep.com.br/ws/${cep}/json/`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      const data = response.data;

      if (data.erro) {
        await sendErrorReply(
          "❌ CEP não encontrado na base de dados!\nVerifique se o CEP está correto."
        );
        return;
      }

      // Formatar CEP
      const cepFormatado = cep.replace(/^(\d{5})(\d{3})/, "$1-$2");
      
      // Preparar endereço para URLs do Maps
      const enderecoFormatado = `${data.logradouro || ""}, ${data.bairro || ""}, ${data.localidade || ""} - ${data.uf || ""}, Brasil`.replace(/\s+/g, '+');
      
      // Gerar links do Google Maps
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${enderecoFormatado}`;
      const streetViewLink = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${enderecoFormatado}`;

      // Mensagem formatada
      const caption = `
📮 *CONSULTA DE CEP* 📮

📍 *Endereço Completo*
━━━━━━━━━━━━━━━━━━━━━━
📋 *CEP:* ${cepFormatado}
🏠 *Logradouro:* ${data.logradouro || "Não informado"}
🗺️ *Bairro:* ${data.bairro || "Não informado"}
🏙️ *Cidade:* ${data.localidade || "Não informado"}
🏁 *Estado:* ${data.uf || "Não informado"}
➕ *Complemento:* ${data.complemento || "Não informado"}

📊 *IBGE*
━━━━━━━━━━━━━━━━━━━━━━
🌐 *Código IBGE:* ${data.ibge || "Não informado"}
📞 *DDD:* ${data.ddd || "Não informado"}

🗺️ *Localização*
━━━━━━━━━━━━━━━━━━━━━━
🔗 *Google Maps:* ${mapsLink}
🌎 *Street View:* ${streetViewLink}

⏰ *Consulta realizada em:* ${new Date().toLocaleString("pt-BR")}
      `.trim();

      // Envia imagem com os dados
      try {
        await sendImageFromURL(
          "https://i.ibb.co/3pLJy7t/cep-banner.jpg",
          caption
        );
      } catch (imageError) {
        // Fallback para texto caso a imagem falhe
        await sendText(caption);
      }

      // Enviar links clicáveis separadamente
      await sendReply(
        `🗺️ *ACESSO RÁPIDO À LOCALIZAÇÃO*\n\n` +
        `📍 *Ver no Google Maps:*\n${mapsLink}\n\n` +
        `🌎 *Ver no Street View:*\n${streetViewLink}\n\n` +
        `_Clique nos links acima para visualizar a localização_`
      );

      // Detalhes extras
      await sendReply(
        `📋 *DETALHES ADICIONAIS*\n\n` +
          `👤 *Solicitante:* @${userJid.split("@")[0]}\n` +
          `🔍 *Status da consulta:* ✅ Concluída com sucesso\n\n` +
          `ℹ️ *Fonte:* ViaCEP + Google Maps`
      );
    } catch (error) {
      console.error("Erro na consulta CEP:", error);

      if (error.response?.status === 400 || error.response?.status === 404) {
        await sendErrorReply(
          "❌ CEP não encontrado ou formato inválido.\n" +
            "Verifique se o CEP está correto e tente novamente."
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
