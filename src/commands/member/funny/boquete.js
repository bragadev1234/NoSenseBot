const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "boquete",
  description: "Envia um GIF de boquete hentai aleatório",
  commands: ["boquete", "blowjob", "oral", "chupada", "mamar"],
  usage: `${PREFIX}boquete [@usuário]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendGifFromURL, sendReact, userJid, mentionedJidList, fullMessage }) => {
    // APIs gratuitas para conteúdo hentai (sem necessidade de chave)
    const apis = [
      // API 1: Nekos.life (versão NSFW)
      "https://nekos.life/api/v2/img/blowjob",
      // API 2: Purrbot.site (API de NSFW)
      "https://purrbot.site/api/img/nsfw/blowjob/gif",
      // API 3: Waifu.pics (NSFW)
      "https://api.waifu.pics/nsfw/blowjob"
    ];
    
    // Lista de mensagens engraçadas para legendas
    const mensagens = [
      "Está precisando de um boquete? 😏",
      "Hmm, que delícia! 👅",
      "Alguém pediu um boquete? 🍆💦",
      "Que tal um oral bem gostoso? 😋",
      "Sucção profissional em ação! 🔥",
      "Isso que é serviço de qualidade! 😈",
      "Nada como um bom boquete para alegrar o dia! 🌈",
      "Serviço completo com direito a engolir! ⭐",
      "Chupando até as bolas! 🎯",
      "Mamada com técnica ninja! 🥷",
      "Deixa que eu resolvo isso com a boca! 😛",
      "Só chamar que eu estou a postos! 🫡",
      "Oral sem precedentes! 🏆",
      "Isso que é saber usar a língua! 👅",
      "Mamada com gosto e dedicação! 💯"
    ];
    
    try {
      // Selecionar uma API aleatória
      const apiAleatoria = apis[Math.floor(Math.random() * apis.length)];
      
      // Buscar o GIF da API
      const response = await axios.get(apiAleatoria);
      let urlGif;
      
      // Extrair URL do GIF baseado na estrutura de resposta de cada API
      if (apiAleatoria.includes('nekos.life')) {
        urlGif = response.data.url;
      } else if (apiAleatoria.includes('purrbot.site')) {
        urlGif = response.data.link;
      } else if (apiAleatoria.includes('waifu.pics')) {
        urlGif = response.data.url;
      }
      
      // Verificar se há menções no comando
      let mencionado = mentionedJidList.length > 0 ? mentionedJidList[0] : null;
      
      // Selecionar mensagem aleatória
      const mensagemAleatoria = mensagens[Math.floor(Math.random() * mensagens.length)];
      
      // Construir legenda com menção se houver
      let legenda = mensagemAleatoria;
      
      if (mencionado) {
        const nomeUsuario = userJid.split("@")[0];
        const nomeMencionado = mencionado.split("@")[0];
        
        // Mensagens específicas para quando há menção
        const mensagensComMencao = [
          `@${nomeUsuario} deu um boquete transcendental em @${nomeMencionado}! 😱`,
          `@${nomeUsuario} está mamando @${nomeMencionado} com gosto! 👅💦`,
          `@${nomeMencionado} recebeu o melhor boquete da vida de @${nomeUsuario}! 🏆`,
          `@${nomeUsuario} mostrou toda sua habilidade oral para @${nomeMencionado}! 🔥`,
          `@${nomeMencionado} não aguentou o boquete de @${nomeUsuario} e gozou! 💦`,
          `@${nomeUsuario} está devorando @${nomeMencionado} com a boca! 😈`,
          `Serviço completo: @${nomeUsuario} mamando @${nomeMencionado} até o talo! 🍆`,
          `@${nomeMencionado} está tendo a experiência oral da vida com @${nomeUsuario}! ✨`,
          `@${nomeUsuario} mostrou que sabe usar a língua em @${nomeMencionado}! 👅`,
          `@${nomeMencionado} não esperava um boquete tão bom de @${nomeUsuario}! 😲`
        ];
        
        legenda = mensagensComMencao[Math.floor(Math.random() * mensagensComMencao.length)];
      }
      
      // Enviar o GIF com a legenda
      await sendGifFromURL(
        urlGif,
        legenda,
        mencionado ? [mencionado, userJid] : undefined
      );
      
    } catch (error) {
      console.error("Erro ao buscar GIF de boquete:", error);
      await sendErrorReply("Não consegui encontrar um boquete agora 😢 Tente novamente mais tarde!");
    }
  },
};