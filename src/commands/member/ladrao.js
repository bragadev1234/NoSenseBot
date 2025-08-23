const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "ladrao",
  description: "Rouba grana imaginária de alguém",
  commands: ["ladrao", "roubo"],
  usage: `${PREFIX}ladrao`,

  handle: async ({ sendText, getGroupMetadata, chatId, isGroup }) => {
    if (!isGroup) throw new InvalidParameterError("❗ Só funciona em grupos.");

    const groupMetadata = await getGroupMetadata(chatId);
    const participants = groupMetadata.participants.map(p => p.id.replace(/@.+/, ""));

    const escolhido = participants[Math.floor(Math.random() * participants.length)];
    const valor = Math.floor(Math.random() * 1000) + 1;

    await sendText(`🏃💰 @${escolhido} foi assaltado e perdeu *R$${valor}* pro ladrão do grupo!`, [escolhido + "@s.whatsapp.net"]);
  },
};
