const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "corno",
  description: "Cornômetro oficial do grupo: mede e coroa o mais corno!",
  commands: ["rank-corno", "cornometro"],
  usage: `${PREFIX}corno`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendText, getGroupMetadata, chatId, isGroup }) => {
    if (!isGroup) {
      throw new InvalidParameterError("❗ Esse comando só pode ser usado em grupos.");
    }

    const groupMetadata = await getGroupMetadata(chatId);
    const participants = groupMetadata.participants.map(p =>
      p.id.replace(/@.+/, "")
    );

    if (!participants.length) {
      throw new InvalidParameterError("❗ Nenhum membro encontrado.");
    }

    // Embaralhar
    const shuffled = participants.sort(() => Math.random() - 0.5);

    let lista = `╭━─━─━─━─━─━─━─━─━─━╮\n`;
    lista += `   👑 *CORNÔMETRO OFICIAL* 👑\n`;
    lista += `╰━─━─━─━─━─━─━─━─━─━╯\n\n`;

    shuffled.forEach((num, i) => {
      const vezes = Math.floor(Math.random() * 100) + 1;
      lista += `*${i + 1}.* @${num}  — já foi corno *${vezes}x* 🐮\n`;
    });

    // Escolher aleatório para "mais corno"
    const escolhido = shuffled[Math.floor(Math.random() * shuffled.length)];
    lista += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    lista += `👑 O *Membro Mais Corno* é: @${escolhido}!!! 🐂🔥\n`;
    lista += `━━━━━━━━━━━━━━━━━━━━━━`;

    await sendText(lista, shuffled.map(num => num + "@s.whatsapp.net"));
  },
};
