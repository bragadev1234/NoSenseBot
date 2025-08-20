// covid.js
const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "covid",
  description: "Mostra estatísticas COVID-19 de um país",
  commands: ["covid", "corona"],
  usage: `${PREFIX}covid <país>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, args }) => {
    await sendReact("🦠");
    
    const pais = args && args.length > 0 ? args.join(" ") : "Brazil";
    
    try {
      const response = await axios.get(`https://disease.sh/v3/covid-19/countries/${encodeURIComponent(pais)}`);
      
      if (response.data) {
        const data = response.data;
        await sendReply(`🦠 *COVID-19 NO ${data.country.toUpperCase()}*
        
😷 Casos confirmados: ${data.cases.toLocaleString()}
⚰️ Mortes: ${data.deaths.toLocaleString()}
💊 Recuperados: ${data.recovered.toLocaleString()}
📊 Casos ativos: ${data.active.toLocaleString()}
📈 Casos hoje: ${data.todayCases.toLocaleString()}
⚠️ Mortes hoje: ${data.todayDeaths.toLocaleString()}
🧪 Testes: ${data.tests.toLocaleString()}
        
Última atualização: ${new Date(data.updated).toLocaleString()}`);
      } else {
        await sendErrorReply("País não encontrado!");
      }
    } catch (error) {
      await sendErrorReply("Erro ao buscar dados COVID-19. Verifique o nome do país.");
    }
  },
};