const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "cuzcuz",
  description: "Cuzcuzômetro oficial do grupo!",
  commands: ["rank-quemdeumais", "cuzcuzometro", "toba"],
  usage: `${PREFIX}cuzcuz`,

  handle: async ({ sendText, getGroupMetadata, chatId, isGroup }) => {
    if (!isGroup) throw new InvalidParameterError("❗ Só funciona em grupos!");

    const groupMetadata = await getGroupMetadata(chatId);
    const participants = groupMetadata.participants.map(p => p.id.replace(/@.+/, ""));
    if (!participants.length) throw new InvalidParameterError("❗ Nenhum membro encontrado.");

    const shuffled = participants.sort(() => Math.random() - 0.5);

    let lista = `🍑 *CUZCUZÔMETRO OFICIAL* 🍑\n\n`;
    shuffled.forEach((num, i) => {
      const vezes = Math.floor(Math.random() * 40) + 1;
      lista += `*${i + 1}.* @${num}  — já deu o toba *${vezes}x* 🍑🔥\n`;
    });

    const escolhido = shuffled[Math.floor(Math.random() * shuffled.length)];
    lista += `\n👑 O *Mestre do Cuzcuz* é: @${escolhido}!!! 🍑👅`;

    await sendText(lista, shuffled.map(num => num + "@s.whatsapp.net"));
  },
};
