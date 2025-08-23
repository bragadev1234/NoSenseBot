const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);
const axios = require("axios");

module.exports = {
  name: "consultacnpj",
  description: "Consulta dados de CNPJ na ReceitaWS",
  commands: ["consultacnpj", "cnpj", "empresa"],
  usage: `${PREFIX}consultacnpj 12345678000195`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendText,
    sendErrorReply,
    sendImageFromURL,
    userJid,
    args,
    sendReact,
    sendReply
  }) => {
    await sendReact("🏢");

    if (!args.length) {
      throw new InvalidParameterError(
        "❗ Você precisa informar um CNPJ para consulta!"
      );
    }

    const cnpj = onlyNumbers(args[0]);

    if (cnpj.length !== 14) {
      await sendErrorReply("❗ CNPJ inválido! Deve conter 14 dígitos.");
      return;
    }

    try {
      await sendReply("🔎 Buscando informações na ReceitaWS...");

      // Adicionando headers para evitar bloqueios
      const response = await axios.get(
        `https://www.receitaws.com.br/v1/cnpj/${cnpj}`,
        {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Connection': 'keep-alive'
          }
        }
      );

      const data = response.data;

      if (data.status === "ERROR" || data.message) {
        await sendErrorReply(
          "❌ CNPJ não encontrado ou erro na consulta.\n" +
            `*Mensagem:* ${data.message || "Erro desconhecido"}`
        );
        return;
      }

      // Formatar CNPJ
      const cnpjFormatado = cnpj.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );

      // Tratamento para dados nulos ou undefined
      const formatData = (value, defaultValue = "Não informado") => {
        return value && value !== "" ? value : defaultValue;
      };

      // Mensagem formatada
      const caption = `
🏢 *CONSULTA DE CNPJ* 🏢

📛 *Razão Social:* ${formatData(data.nome)}

📋 *Informações da Empresa*
━━━━━━━━━━━━━━━━━━━━━━
🆔 *CNPJ:* ${cnpjFormatado}  
📌 *Situação:* ${formatData(data.situacao)}  
📅 *Abertura:* ${formatData(data.abertura)}  
🏷️ *Tipo:* ${formatData(data.tipo)}  
📊 *Porte:* ${formatData(data.porte)}  
⚖️ *Natureza Jurídica:* ${formatData(data.natureza_juridica)}  

📍 *Endereço*
━━━━━━━━━━━━━━━━━━━━━━
🏠 *Logradouro:* ${formatData(data.logradouro)}${data.numero ? `, ${data.numero}` : ''}  
➕ *Complemento:* ${formatData(data.complemento)}  
🗺️ *Bairro:* ${formatData(data.bairro)}  
🏤 *CEP:* ${formatData(data.cep)}  
🌆 *Município:* ${formatData(data.municipio)}${data.uf ? ` - ${data.uf}` : ''}  

📞 *Contato*
━━━━━━━━━━━━━━━━━━━━━━
📱 *Telefone:* ${formatData(data.telefone)}  
✉️ *E-mail:* ${formatData(data.email)}
💰 *Capital Social:* R$ ${data.capital_social ? parseFloat(data.capital_social).toLocaleString("pt-BR") : "0,00"}

⏰ *Consulta realizada em:* ${new Date().toLocaleString("pt-BR")}
      `.trim();

      // Envia imagem com os dados (com fallback)
      try {
        await sendImageFromURL(
          "https://i.ibb.co/7yWsXQ6/cnpj-banner.jpg",
          caption
        );
      } catch (imageError) {
        // Se falhar ao enviar imagem, envia apenas texto
        await sendText(caption);
      }

      // Detalhes extras
      await sendReply(
        `📊 *DETALHES ADICIONAIS*\n\n` +
          `👤 *Solicitante:* ${userJid.split("@")[0]}\n` +
          `🔒 *Status da consulta:* ✅ Concluída com sucesso\n\n` +
          `ℹ️ *Fonte:* ReceitaWS`
      );
    } catch (error) {
      console.error("Erro na consulta CNPJ:", error);

      if (error.response?.status === 429) {
        await sendErrorReply(
          "⏰ Limite de consultas excedido.\n" +
            "A ReceitaWS permite apenas 3 consultas por minuto.\n" +
            "Tente novamente em instantes."
        );
      } else if (error.response?.status === 404) {
        await sendErrorReply(
          "❌ CNPJ não encontrado na base da Receita Federal.\n" +
            "Verifique se o CNPJ está correto e tente novamente."
        );
      } else if (error.code === 'ECONNABORTED') {
        await sendErrorReply(
          "⏰ Tempo de consulta excedido.\n" +
            "A ReceitaWS pode estar lenta no momento.\n" +
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
