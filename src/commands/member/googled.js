const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require("axios");
const { sendReply, sendErrorReply } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "googled",
  description: "Busca notícias recentes no Google.",
  commands: ["googled", "noticias"],
  usage: `${PREFIX}googled <tema>`,
  handle: async ({ args }) => {
    if (!args.length) {
      await sendErrorReply("Digite um tema para busca. Ex: /googled tecnologia");
      return;
    }

    const tema = args.join(" ");
    try {
      const response = await axios.get(`https://news.google.com/rss/search?q=${encodeURIComponent(tema)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`);
      const items = response.data.match(/<title>(.*?)<\/title>/g).slice(1, 6);
      const noticias = items.map(item => item.replace(/<\/?title>/g, "").replace(/&#[0-9]+;/g, "")).join("\n\n• ");
      
      await sendReply(`📰 Últimas notícias sobre "${tema}":\n\n• ${noticias}`);
    } catch (error) {
      await sendErrorReply("Erro ao buscar notícias. Tente novamente.");
    }
  },
};