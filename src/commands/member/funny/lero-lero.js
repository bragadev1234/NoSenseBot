// lero-lero.js
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "lerolero",
  description: "Gera um texto de lero-lero (discurso político)",
  commands: ["lerolero", "politico", "discursar"],
  usage: `${PREFIX}lerolero`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🎭");
    
    const inicio = [
      "Caros compatriotas,",
      "Em nome do progresso,",
      "Pautado nos anseios da população,",
      "Em consonância com as diretrizes estabelecidas,",
      "Alinhados com as expectativas societárias,"
    ];
    
    const meio = [
      "é fundamental ressaltar que a complexidade dos estudos efetuados",
      "não podemos esquecer que a contínua expansão de nossa atividade",
      "a execução dos pontos do programa",
      "o novo modelo estrutural aqui preconizado",
      "o desenvolvimento contínuo de distintas formas de atuação"
    ];
    
    const fim = [
      "nos obriga à análise das condições inegavelmente apropriadas.",
      "cumpre um papel essencial na formulação do sistema de participação geral.",
      "auxilia a preparação e a composição do fluxo de informações.",
      "garante a contribuição de um grupo importante na determinação das direções preferenciais.",
      "estende o alcance e a importância dos índices pretendidos."
    ];
    
    const texto = `${inicio[Math.floor(Math.random() * inicio.length)]} ${meio[Math.floor(Math.random() * meio.length)]} ${fim[Math.floor(Math.random() * fim.length)]}`;
    
    await sendReply(`🎭 *LERO-LERO POLÍTICO*
    
${texto}`);
  },
};