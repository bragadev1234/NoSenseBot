/**
 * Localização por número de telefone
 * @author braga
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "loctel2",
  description: "Consulta de localização por número de telefone",
  commands: ["loctel2", "localizatel"],
  usage: `${PREFIX}loctel2 <DDD+número>`,
  handle: async ({ sendReply, sendReact, args }) => {
    if (!args[0] || args[0].length < 10) {
      return sendReply("Por favor, informe um número com DDD. Ex: /loctel2 2199999999");
    }
    
    await sendReact("📱");
    const numero = args[0];
    const ddd = numero.substring(0, 2);
    
    try {
      // Consulta DDD primeiro
      const dddResponse = await fetch(`https://brasilapi.com.br/api/ddd/v1/${ddd}`);
      const dddData = await dddResponse.json();
      
      if (!dddData.state) {
        return sendReply("❌ DDD não encontrado ou inválido");
      }
      
      // Consulta operadora (API pública sem chave)
      const operadoraResponse = await fetch(`https://apilayer.net/api/validate?number=55${numero}`);
      const operadoraData = await operadoraResponse.json();
      
      let info = `*Número*: ${numero}\n`;
      info += `*Estado*: ${dddData.state}\n`;
      info += `*Cidades*: ${dddData.cities.slice(0, 3).join(", ")}\n`;
      
      if (operadoraData.valid) {
        info += `*Operadora*: ${operadoraData.carrier || 'Não identificada'}\n`;
        info += `*Tipo*: ${operadoraData.line_type || 'Não identificado'}\n`;
      }
      
      await sendReply(`📍 *Informações do Telefone*:\n\n${info}`);
      
    } catch (error) {
      await sendReply("⚠️ Ocorreu um erro ao consultar o telefone. Tente novamente mais tarde.");
    }
  },
};
