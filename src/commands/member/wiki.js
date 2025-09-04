const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const fetch = require("node-fetch");
const wiki = require("wikijs").default; // npm install wikijs

module.exports = {
  name: "wiki",
  description: "Busca informações na Wikipédia.",
  commands: ["wiki", "wikipedia", "pesquisar"],
  usage: `${PREFIX}wiki <termo>`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendImageFromURL, sendErrorReply, args }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "❗ Você precisa informar o que deseja pesquisar na Wikipédia."
      );
    }

    const query = args.join(" ");
    let title = query;
    let extract = null;
    let link = null;
    let image = null;

    // --- Tentativa 1: API REST oficial ---
    try {
      const apiUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        query
      )}`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.extract) {
          title = data.title || query;
          extract = data.extract;
          link = data.content_urls?.desktop?.page;
          image = data.thumbnail?.source;
        }
      }
    } catch (err) {
      console.warn("API REST falhou:", err.message);
    }

    // --- Tentativa 2: wikijs (fallback) ---
    if (!extract) {
      try {
        const page = await wiki({ apiUrl: "https://pt.wikipedia.org/w/api.php" }).page(query);
        title = await page.title();
        extract = await page.summary();
        link = await page.url();
        const images = await page.images();
        image =
          images.find((img) => img.endsWith(".jpg") || img.endsWith(".png")) ||
          "https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png";
      } catch (err) {
        console.error("Erro no fallback WikiJS:", err.message);
        await sendErrorReply("❗ Não encontrei nada na Wikipédia.");
        return;
      }
    }

    // --- Monta mensagem final ---
    const caption = `
📚 *Wikipédia*  
🔎 Pesquisa: *${title}*

${extract.slice(0, 1000)}...

🔗 Leia mais: ${link || "Link não disponível"}
    `;

    try {
      await sendImageFromURL(
        image || "https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png",
        caption.trim()
      );
    } catch (err) {
      console.error("Erro ao enviar imagem:", err.message);
      await sendErrorReply("❗ Consegui o texto, mas falhou ao enviar a imagem.");
      await sendText(caption.trim());
    }
  },
};
