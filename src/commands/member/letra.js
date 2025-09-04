// letra.js - CORRIGIDO (API alternativa)
const axios = require('axios');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "letra",
  description: "Busca letras de músicas",
  commands: ["letra", "lyrics", "musica"],
  usage: `${PREFIX}letra <nome da música>`,
  
  handle: async ({ args, sendReply, sendErrorReply }) => {
    if (!args.length) {
      throw new InvalidParameterError("Digite o nome da música. Ex: /letra Bohemian Rhapsody");
    }

    const query = args.join(" ");
    
    try {
      // API alternativa mais confiável
      const response = await axios.get(`https://api.vagalume.com.br/search.php?art=${encodeURIComponent(query)}&mus=${encodeURIComponent(query)}&apikey=free`);
      
      if (!response.data || !response.data.mus || response.data.mus.length === 0) {
        return await sendErrorReply("Letra não encontrada!");
      }
      
      const song = response.data.mus[0];
      let lyrics = song.text;
      
      if (lyrics.length > 4000) {
        lyrics = lyrics.substring(0, 4000) + "...\n\n📝 *Letra muito longa, mostrando apenas parte*";
      }
      
      await sendReply(`🎵 *${song.name} - ${response.data.art.name}*\n\n${lyrics}`);
    } catch (error) {
      await sendErrorReply("Letra não encontrada ou erro na busca!");
    }
  },
};
