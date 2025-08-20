// curiosidade.js
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "curiosidade",
  description: "Mostra uma curiosidade interessante",
  commands: ["curiosidade", "fact", "fato"],
  usage: `${PREFIX}curiosidade`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🤔");
    
    try {
      const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=pt');
      
      if (response.data && response.data.text) {
        await sendReply(`🤔 *CURIOSIDADE*
        
${response.data.text}`);
      } else {
        await sendErrorReply("Erro ao carregar curiosidade!");
      }
    } catch (error) {
      // Fallback para curiosidades fixas
      const curiosidades = [
        "Os ursos polares são canhotos.",
        "O coração de uma baleia azul é do tamanho de um carro.",
        "Os golfinhos dormem com um olho aberto.",
        "A formiga pode levantar 50 vezes o seu próprio peso.",
        "O mel nunca estraga. Arqueólogos encontraram mel com mais de 3000 anos em tumbas egípcias e ainda comestível.",
      ];
      
      const curiosidade = curiosidades[Math.floor(Math.random() * curiosidades.length)];
      
      await sendReply(`🤔 *CURIOSIDADE*
      
${curiosidade}`);
    }
  },
};