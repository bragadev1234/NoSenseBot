const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require("axios");
const { sendImageFromURL, sendErrorReply } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "gerar-imagem",
  description: "Gera uma imagem aleatória baseada em um termo.",
  commands: ["gerar-imagem", "imagem"],
  usage: `${PREFIX}gerar-imagem <termo>`,
  handle: async ({ args }) => {
    if (!args.length) {
      await sendErrorReply("Digite um termo para busca. Ex: /gerar-imagem paisagem");
      return;
    }

    const termo = args.join(" ");
    try {
      const response = await axios.get(`https://source.unsplash.com/random/800x600/?${encodeURIComponent(termo)}`);
      await sendImageFromURL(response.request.res.responseUrl, `Imagem relacionada a: ${termo}`);
    } catch (error) {
      await sendErrorReply("Erro ao buscar imagem. Tente outro termo.");
    }
  },
};