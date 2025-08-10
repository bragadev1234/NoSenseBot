
/**
 * Consulta de CRM (Médicos)
 * @author SeuNome
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "CRM",
  description: "Consulta de CRM de médicos",
  commands: ["crm", "consultacrm"],
  usage: `${PREFIX}crm <numero crm>`,
  handle: async ({ sendReply, sendReact, args }) => {
    if (!args[0]) return sendReply("Por favor, informe um CRM. Ex: /crm 123456");
    
    await sendReact("🏥");
    const crm = args[0];
    
    try {
      const response = await fetch(`https://www.consultacrm.com.br/api/index.php?tipo=crm&q=${crm}&chave=0&destino=json`);
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return sendReply("❌ CRM não encontrado ou inválido");
      }
      
      const medico = data[0];
      let info = `*Médico*: ${medico.nome || 'Não informado'}\n`;
      info += `*CRM*: ${medico.numero || 'Não informado'}\n`;
      info += `*UF*: ${medico.uf || 'Não informado'}\n`;
      info += `*Situação*: ${medico.situacao || 'Não informada'}\n`;
      info += `*Especialidade*: ${medico.especialidade || 'Não informada'}\n`;
      
      await sendReply(`📋 *Informações do CRM* ${crm}:\n\n${info}`);
      
    } catch (error) {
      await sendReply("⚠️ Ocorreu um erro ao consultar o CRM. Tente novamente mais tarde.");
    }
  },
};
