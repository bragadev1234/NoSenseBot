const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "listaradmins",
  description: "Lista todos os administradores do grupo.",
  commands: ["listaradmins", "listadmins", "admins", "administradores"],
  usage: `${PREFIX}listaradmins`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    remoteJid,
    sendReply,
    getGroupMetadata,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    const groupMetadata = await getGroupMetadata();
    const admins = groupMetadata.participants.filter(p => p.admin);

    if (admins.length === 0) {
      return sendReply("Não há administradores neste grupo.");
    }

    let adminList = "👑 *Administradores do Grupo:*\n\n";
    admins.forEach((admin, index) => {
      const number = admin.id.split('@')[0];
      adminList += `${index + 1}. @${number}\n`;
    });

    await sendReply(adminList);
  },
};
