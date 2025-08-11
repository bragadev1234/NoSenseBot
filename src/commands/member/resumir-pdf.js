const { PREFIX } = require(`${BASE_DIR}/config`);
const pdf = require('pdf-parse');
const { summarize } = require('node-summarizer');
const { sendReply, sendErrorReply, sendWaitReply } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "resumir-pdf",
  description: "Resume conteúdo de PDFs",
  commands: ["resumir-pdf", "resumir"],
  usage: `${PREFIX}resumir-pdf (responda a um PDF)`,
  handle: async ({ quotedMsg }) => {
    if (!quotedMsg || !quotedMsg.document) {
      await sendErrorReply("⚠ Responda a um arquivo PDF!");
      return;
    }

    await sendWaitReply("📄 Processando PDF...");

    try {
      const pdfBuffer = await quotedMsg.downloadMedia();
      const data = await pdf(pdfBuffer);
      
      if (!data.text) {
        await sendErrorReply("❌ PDF sem texto legível ou protegido.");
        return;
      }

      // Algoritmo de resumo por frequência de termos
      const resumidor = new summarize(data.text);
      const { summary, keywords } = resumidor.getSummaryByFrequency();

      await sendReply(
        `📌 Resumo do PDF:\n\n${summary}\n\n` +
        `🔑 Palavras-chave: ${keywords.slice(0, 5).join(', ')}`
      );
    } catch (error) {
      console.error(error);
      await sendErrorReply("❌ Erro ao ler PDF. Verifique o arquivo.");
    }
  },
};