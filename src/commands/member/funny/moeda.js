// moeda.js
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "moeda",
  description: "Converte valores entre moedas",
  commands: ["moeda", "converter", "currency"],
  usage: `${PREFIX}moeda <valor> <de> <para>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, args }) => {
    await sendReact("💱");
    
    if (!args || args.length < 3) {
      return sendErrorReply("Use: /moeda <valor> <de> <para>\nEx: /moeda 100 USD BRL");
    }
    
    const valor = parseFloat(args[0]);
    const de = args[1].toUpperCase();
    const para = args[2].toUpperCase();
    
    if (isNaN(valor)) {
      return sendErrorReply("Valor inválido!");
    }
    
    try {
      const response = await axios.get(`https://api.exchangerate.host/latest?base=${de}&symbols=${para}`);
      
      if (response.data && response.data.rates) {
        const taxa = response.data.rates[para];
        const resultado = (valor * taxa).toFixed(2);
        
        await sendReply(`💱 *CONVERSÃO DE MOEDA*
        
${valor} ${de} = ${resultado} ${para}
Taxa: 1 ${de} = ${taxa} ${para}
        
Última atualização: ${new Date(response.data.date).toLocaleDateString()}`);
      } else {
        await sendErrorReply("Moeda não encontrada!");
      }
    } catch (error) {
      await sendErrorReply("Erro ao converter moeda. Verifique os códigos das moedas.");
    }
  },
};