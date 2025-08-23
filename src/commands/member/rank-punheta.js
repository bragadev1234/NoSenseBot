const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "punheteiro",
  description: "Lista oficial dos punheteiros/siriqueiras do grupo!",
  commands: ["rank-jabateu", "siriqueira", "punhetometro"],
  usage: `${PREFIX}punheteiro`,

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
    lista += `   🔞 *PUNHETÔMETRO OFICIAL* 🔞\n`;
    lista += `╰━─━─━─━─━─━─━─━─━─━╯\n\n`;

    shuffled.forEach((num, i) => {
      const vezes = Math.floor(Math.random() * 100) + 1;
      lista += `*${i + 1}.* @${num}  — já bateu *${vezes}x* 🖐️💦\n`;
    });

    // Eleger campeão
    const escolhido = shuffled[Math.floor(Math.random() * shuffled.length)];
    lista += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    lista += `👑 O *Mestre Punheteiro / Siriqueira Suprema* é: @${escolhido}!!! 💦🔥\n`;
    lista += `━━━━━━━━━━━━━━━━━━━━━━`;

    await sendText(lista, shuffled.map(num => num + "@s.whatsapp.net"));
  },
};
