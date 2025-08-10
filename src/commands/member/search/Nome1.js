/**
 * Consulta de nome com múltiplas fontes
 * @author braga 
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "nome1",
  description: "Consulta detalhada por nome completo",
  commands: ["nome1", "consultanome"],
  usage: `${PREFIX}nome1 <nome completo>`,
  handle: async ({ sendReply, sendReact, args, fullMessage }) => {
    const nome = fullMessage.split(" ").slice(1).join(" ");
    if (!nome) return sendReply("Por favor, informe um nome. Ex: /nome1 João Silva");
    
    await sendReact("🔍");
    
    try {
      const response = await fetch(`http://ghostcenter.xyz/api/nome/${encodeURIComponent(nome)}`);
      const data = await response.json();
      
      if (data.status === 404) {
        return sendReply("❌ Nenhum resultado encontrado para este nome");
      }
      
      let result = `🔎 *Resultados para*: ${nome}\n*Total encontrado*: ${data.total}\n\n`;
      
      data.dados.slice(0, 3).forEach((pessoa, index) => {
        result += `*${index + 1}.* ${pessoa.nome}\n`;
        result += `CPF: ${pessoa.cpf || 'Não encontrado'}\n`;
        result += `Nascimento: ${pessoa.nascimento || 'Não encontrado'}\n`;
        result += `Sexo: ${pessoa.sexo || 'Não informado'}\n\n`;
      });
      
      await sendReply(result);
      
    } catch (error) {
      await sendReply("⚠️ Ocorreu um erro ao consultar o nome. Tente novamente mais tarde.");
    }
  },
};
