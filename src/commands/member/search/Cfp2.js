/**
 * Consulta de CPF com múltiplas fontes
 * @author Braga
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "cpf2",
  description: "Consulta detalhada de CPF com informações básicas",
  commands: ["cpf2", "consultacpf"],
  usage: `${PREFIX}cpf2 <cpf>`,
  handle: async ({ sendReply, sendReact, args }) => {
    if (!args[0]) return sendReply("Por favor, informe um CPF. Ex: /cpf2 12345678901");
    
    await sendReact("🔍");
    const cpf = args[0];

    try {
      // API 1 - Consulta básica
      const api1 = await fetch(`https://api.cpfcnpj.com.br/${cpf}`).then(res => res.json());
      
      // API 2 - Consulta alternativa
      const api2 = await fetch(`http://ghostcenter.xyz/api/cpf/${cpf}`).then(res => res.json());
      
      // Montando resposta
      let response = `📌 *Consulta de CPF*: ${cpf}\n\n`;
      
      if (api1.status === 200) {
        response += `*Nome*: ${api1.nome || 'Não encontrado'}\n`;
        response += `*Nascimento*: ${api1.nascimento || 'Não encontrado'}\n`;
        response += `*Mãe*: ${api1.mae || 'Não encontrado'}\n`;
      }
      
      if (api2.status === 200) {
        response += `\n*RG*: ${api2.rg || 'Não encontrado'}\n`;
        response += `*Pai*: ${api2.pai || 'Não encontrado'}\n`;
        response += `*Idade*: ${api2.idade || 'Não calculada'}\n`;
      }
      
      if (!api1.status && !api2.status) {
        response = "❌ Nenhuma informação encontrada para este CPF";
      }
      
      await sendReply(response);
      
    } catch (error) {
      await sendReply("⚠️ Ocorreu um erro ao consultar o CPF. Tente novamente mais tarde.");
    }
  },
};
