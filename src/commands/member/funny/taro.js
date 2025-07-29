const { PREFIX } = require(`${BASE_DIR}/config`);
const path = require("node:path");
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);

const tarotCards = [
  { name: "O Louco", meaning: "Novos começos, espontaneidade, aventura" },
  { name: "O Mago", meaning: "Poder, habilidade, concentração" },
  { name: "A Sacerdotisa", meaning: "Intuição, mistério, subconsciente" },
  { name: "A Imperatriz", meaning: "Fertilidade, natureza, abundância" },
  { name: "O Imperador", meaning: "Autoridade, estrutura, controle" },
  { name: "O Hierofante", meaning: "Tradição, espiritualidade, conselho" },
  { name: "Os Enamorados", meaning: "Amor, harmonia, relacionamentos" },
  { name: "O Carro", meaning: "Determinação, vontade, triunfo" },
  { name: "A Força", meaning: "Força interior, coragem, paciência" },
  { name: "O Eremita", meaning: "Soul-searching, introspecção, solidão" }
];

module.exports = {
  name: "taro",
  description: "Tire uma carta de tarô e descubra seu significado.",
  commands: ["taro", "tarot", "carta"],
  usage: `${PREFIX}taro`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid }) => {
    const randomCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];
    const isReversed = Math.random() > 0.7;
    
    const message = `🔮 *Carta do Tarô para @${userJid.split("@")[0]}* 🔮
    
${isReversed ? "🃏 (Invertida)" : ""} *${randomCard.name}*
📜 *Significado:* ${isReversed ? "Dificuldades com " + randomCard.meaning.toLowerCase() : randomCard.meaning}`;

    await sendReply(message);
  },
};
