const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "nuke",
  description: "💥 Apaga geral no grupo (só os não-admins)",
  commands: ["nuke", "bomba", "apagatudo", "penteiro"],
  usage: `${PREFIX}nuke`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendText, socket, remoteJid, sendReact, userJid }) => {
    await sendReact("💣");
    
    try {
      const { participants } = await socket.groupMetadata(remoteJid);
      const nonAdminMembers = participants.filter(
        p => !p.admin && p.id !== userJid
      );

      if (nonAdminMembers.length === 0) {
        await sendText(
          "💣 *BOMBA RELÓGIO* 💣\n\n" +
          "Cadê os trouxas pra eu expulsar?\n" +
          "O grupo tá limpo ou só tem ADM mesmo?\n\n" +
          "🤡 *Bot by Bragadev123 - O Faxineiro de Grupos* 🤡"
        );
        return;
      }

      // Mensagem épica antes do caos
      await sendText(
        "🚨 *ALERTA VERMELHO* 🚨\n\n" +
        "INICIANDO PROTOCOLO 'FAXINA DOS FRACOS'\n\n" +
        `👉 ${nonAdminMembers.length} trouxas detectados\n` +
        "👉 Pegando a vassoura hidráulica\n" +
        "👉 Chamando o capiroto pra ajudar\n\n" +
        "⏳ *3... 2... 1...* 💥\n\n" +
        "🤖 *Bot by Bragadev123 - O Exterminador de Otários*"
      );

      // Começa a expulsão em massa
      for (const member of nonAdminMembers) {
        try {
          await socket.groupParticipantsUpdate(remoteJid, [member.id], "remove");
          // Delayzinho pra não floodar
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Falha ao expulsar ${member.id}:`, error);
        }
      }

      // Relatório pós-caos
      await sendText(
        "💥 *MISSAO CUMPRIDA* 💥\n\n" +
        "✅ Faxina concluída com sucesso!\n" +
        `🚮 ${nonAdminMembers.length} membros viraram história\n` +
        "🏆 Grupo agora tá limpinho que até brilha\n\n" +
        "📌 *Dica*: Quer evitar isso? Vira ADM!\n\n" +
        "😈 *Bot by Bragadev123 - O Diabo em Pessoa*"
      );
      await sendReact("💀");

    } catch (error) {
      console.error("Bomba falhou:", error);
      await sendText(
        "❌ *VISH... DEU MERDA* ❌\n\n" +
        "A bomba falhou! Alguém tirou o chicote do diabo?\n\n" +
        "Motivo: " + (error.message || "Deus não quis") + "\n\n" +
        "😅 *Bot by Bragadev123 - O Bombardeiro Preguiçoso*"
      );
      await sendReact("🤡");
    }
  },
};
