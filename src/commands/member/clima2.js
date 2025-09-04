const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const fetch = require("node-fetch");

module.exports = {
  name: "clima",
  description: "Mostra a previsão do tempo para uma cidade.",
  commands: ["clima2", "tempo2", "weather2"],
  usage: `${PREFIX}clima <cidade>`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendImageFromURL, sendErrorReply, args }) => {
    if (!args.length) {
      throw new InvalidParameterError("❗ Você precisa informar a cidade.");
    }

    const cidade = args.join(" ");
    const apiUrl = `https://wttr.in/${encodeURIComponent(cidade)}?format=j1`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        await sendErrorReply("❗ Não consegui buscar o clima.");
        return;
      }

      const data = await response.json();

      const weather = data.current_condition?.[0];
      const area = data.nearest_area?.[0]?.areaName?.[0]?.value || cidade;
      const pais = data.nearest_area?.[0]?.country?.[0]?.value || "Desconhecido";

      const caption = `
🌦️ *Clima em ${area}, ${pais}*  

🌡️ Temperatura: ${weather.temp_C}°C  
🥵 Sensação: ${weather.FeelsLikeC}°C  
💧 Umidade: ${weather.humidity}%  
💨 Vento: ${weather.windspeedKmph} km/h  
🌍 Condição: ${weather.weatherDesc?.[0]?.value || "Indefinida"}  

📅 Atualizado em: ${weather.observation_time}
      `;

      const icon = weather.weatherIconUrl?.[0]?.value;

      if (icon) {
        await sendImageFromURL(icon, caption.trim());
      } else {
        await sendImageFromURL(
          "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
          caption.trim()
        );
      }
    } catch (err) {
      console.error("Erro no comando clima:", err.message);
      await sendErrorReply("❗ Erro ao buscar a previsão do tempo.");
    }
  },
};
