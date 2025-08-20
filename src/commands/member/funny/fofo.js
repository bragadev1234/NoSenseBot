// fofo.js
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "fofo",
  description: "Mostra uma imagem fofa de animal",
  commands: ["fofo", "cute", "fofura"],
  usage: `${PREFIX}fofo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🐾");
    
    const animals = ['cat', 'dog', 'panda', 'red_panda', 'fox', 'koala'];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    
    try {
      const response = await axios.get(`https://some-random-api.com/animal/${randomAnimal}`);
      
      if (response.data && response.data.image) {
        await sendReply(`🐾 *${randomAnimal.toUpperCase()} FOFO* 🐾`);
        await sendImageFromURL(response.data.image, `Imagem fofa de ${randomAnimal}`);
        
        if (response.data.fact) {
          await delay(2000);
          await sendReply(`📚 *FATO CURIOSO:* ${response.data.fact}`);
        }
      } else {
        await sendErrorReply("Erro ao carregar imagem fofa!");
      }
    } catch (error) {
      await sendErrorReply("Erro ao buscar imagem fofa. Tentando alternativa...");
      
      // Fallback para API de gatos
      try {
        const catResponse = await axios.get('https://api.thecatapi.com/v1/images/search');
        
        if (catResponse.data && catResponse.data[0].url) {
          await sendReply("🐱 GATO FOFO 🐱");
          await sendImageFromURL(catResponse.data[0].url, "Gato fofo");
        }
      } catch (fallbackError) {
        await sendErrorReply("Erro ao buscar imagem fofa.");
      }
    }
  },
};