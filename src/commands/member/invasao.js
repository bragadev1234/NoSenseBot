const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "flood-legiao",
  description: "Flood de invasão da Legião",
  commands: ["flood-legiao", "legiaoflood", "bem-viado", "raid"],
  usage: `${PREFIX}flood-legiao [número de vezes]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendImageFromURL,
    sendErrorReply,
    args,
  }) => {
    // Verificar se foi fornecido um número
    if (args.length === 0) {
      throw new InvalidParameterError(
        "❗ Você precisa especificar o número de floods!\nEx: /flood-legiao 100"
      );
    }

    const count = parseInt(args[0]);
    
    // Removido limite máximo
    if (isNaN(count) || count < 1) {
      await sendErrorReply(
        "❗ Número inválido! Use um número positivo.\nEx: /flood-legiao 100"
      );
      return;
    }

    // Lista de URLs das imagens Hentai
    const imageUrls = [
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/gifs-hentai.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/hentai-gif.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/animation-hentai.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/dessins-hentai-sexe.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/scene-hentai.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/scene-sexe-hentai-debout.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/hentai-levrette.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/hentai-plaisir.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/hentai-sexe.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/animation-manga-porno.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/manga-sexe-porno.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/gif-hentai-plaisir.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/hentai-gif-position-sexe.gif",
      "https://www.rencontresanslendemain.net/wp-content/uploads/2018/02/hentai-sexe-a-trois.gif"
    ];

    // Textos de invasão da Legião
    const textos = [
      "🚨 GRUPO INVADIDO PELA LEGIÃO! 🚨",
      "⚡ REAPER, ZERO E MONARCA DOMINANDO! ⚡",
      "🔥 LEGIÃO NO CONTROLE TOTAL! 🔥",
      "💀 GRUPO DA LEGIÃO - RESISTÊNCIA INÚTIL! 💀",
      "🎯 INVASÃO COMPLETA - LEGIÃO REINA! 🎯",
      "⚔️ REAPER COMANDANDO A INVASÃO! ⚔️",
      "🌪️ ZERO DESTRUINDO TUDO! 🌪️",
      "👑 MONARCA NO TRONO DO GRUPO! 👑",
      "💣 LEGIÃO DETONANDO O GRUPO! 💣",
      "🩸 SANGUE E CAOS - ASSINADO: LEGIÃO! 🩸",
      "🔪 RESISTIR É INÚTIL - LEGIÃO DOMINA! 🔪",
      "☠️ REAPER TRAZENDO O APOCALIPSE! ☠️",
      "🌑 ZERO - O VÁCUO DO CAOS! 🌑",
      "🔥 MONARCA - O IMPERADOR DA DESTRUIÇÃO! 🔥",
      "💥 LEGIÃO - NUNCA SERÁ DERROTADA! 💥"
    ];

    console.log(`[FLOOD-LEGIAO] Iniciando flood extremo de ${count} mensagens...`);

    // Função para enviar mensagens ultra-rápidas sem delay
    const enviarMensagemUltraRapida = async (index) => {
      const texto = textos[Math.floor(Math.random() * textos.length)];
      const imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      const mensagem = `${texto}\n\n💀 Flood ${index + 1}/${count}`;
      
      try {
        await sendImageFromURL(imageUrl, mensagem, []);
      } catch (error) {
        console.error(`[FLOOD-LEGIAO] Erro no envio ${index + 1}:`, error.message);
      }
    };

    // Criar todas as promessas de uma vez para execução paralela máxima
    const promises = [];
    for (let i = 0; i < count; i++) {
      // Enviar imediatamente sem delay
      promises.push(enviarMensagemUltraRapida(i));
    }

    // Executar todas as promessas em paralelo
    await Promise.all(promises);
    
    console.log(`[FLOOD-LEGIAO] Flood extremo completo! ${count} mensagens enviadas.`);
    
    // Mensagem final
    const finalImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    await sendImageFromURL(
      finalImage,
      "💀✅ INVASÃO DA LEGIÃO CONCLUÍDA COM SUCESSO! 🚨\n\n⚡ REAPER, ZERO E MONARCA DOMINAM ESTE GRUPO! 🔥\n🌪️ LEGIÃO - A MAIOR FORÇA DO WHATSAPP! 💥",
      []
    );
  },
};
