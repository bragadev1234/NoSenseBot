const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

const natural = require("natural");
const stopword = require("stopword");
const _ = require("lodash");

module.exports = {
  name: "resumir",
  description: "Resumo simples com dados básicos e úteis.",
  commands: ["resumir", "summary", "sumario"],
  usage: `${PREFIX}resumir <texto> [nº de frases]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendReply }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        `Você precisa informar um texto para resumir!\nEx: ${PREFIX}resumir Hoje o clima está ensolarado...`
      );
    }

    let numSentences = 3;
    if (!isNaN(args[args.length - 1])) {
      numSentences = Math.min(Math.max(parseInt(args.pop()), 1), 10);
    }

    const text = args.join(" ");

    try {
      const sentenceTokenizer = new natural.SentenceTokenizer();
      const wordTokenizer = new natural.WordTokenizer();

      const sentences = sentenceTokenizer.tokenize(text);
      const words = wordTokenizer.tokenize(text);

      const tfidf = new natural.TfIdf();
      const cleanSentences = sentences.map(sentence =>
        stopword.removeStopwords(
          wordTokenizer.tokenize(sentence.toLowerCase()),
          stopword.pt
        )
      );
      cleanSentences.forEach(words => tfidf.addDocument(words));

      const sentenceScores = sentences.map((sentence, i) => {
        let score = 0;
        tfidf.listTerms(i).forEach(term => {
          score += term.tfidf;
        });

        const wc = sentence.split(/\s+/).length;
        if (wc < 8) score *= 0.8;
        if (wc > 25) score *= 0.9;

        return { sentence, score, index: i };
      });

      const selectedSentences = _(sentenceScores)
        .orderBy("score", "desc")
        .take(numSentences)
        .sortBy("index")
        .map("sentence")
        .value();

      const summary = selectedSentences.join(" ");

      const keyPhrase = sentenceScores.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), { score: -Infinity }).sentence;

      const wordsCount = summary.split(/\s+/).length;
      const readingTimeMinutes = Math.max(1, Math.round(wordsCount / 200));

      const reply = [
        `🤖 *Nat-IA* ❤️`,
        `Uma assistente inteligente para resumir textos e fornecer dados úteis rapidamente.`,
        `Aqui está seu resumo com informações importantes:`,
        ``,
        `✂️ *Resumo:*`,
        `${summary}`,
        ``,
        `⏳ *Tempo de leitura estimado:* ${readingTimeMinutes} min`,
        `💡 *Frase-chave:* ${keyPhrase}`,
        `🔢 *Caracteres no resumo:* ${summary.length}`,
        ``,
        `📊 *Dados básicos do texto original:*`,
        `🗨️ Frases: ${sentences.length}`,
        `🔤 Palavras: ${words.length}`,
        `🔠 Caracteres: ${text.length}`
      ].join("\n\n");

      await sendReply(reply);
    } catch (error) {
      console.error("[RESUMIR] Erro:", error);
      await sendReply("🔴 Falha ao gerar o resumo.");
    }
  }
};
