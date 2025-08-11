const { PREFIX } = require(`${BASE_DIR}/config`);
const { sendReply } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "ascendentedodia",
  description: "Mostra a previsão do ascendente do dia.",
  commands: ["ascendentedodia", "ascendente"],
  usage: `${PREFIX}ascendentedodia <seu-ascendente>`,
  handle: async ({ args }) => {
    const ascendentes = {
      "aries": "Energia extra para iniciar projetos! Momento de ação.",
      "touro": "Foco em segurança material e prazeres simples.",
      "gemeos": "Comunicação fluida - aproveite para networking.",
      "cancer": "Sensibilidade aguçada - cuide das emoções.",
      "leao": "Criatividade em alta - expresse seu talento.",
      "virgem": "Detalhes importantes - organização é essencial.",
      "libra": "Relacionamentos em destaque - busque equilíbrio.",
      "escorpiao": "Transformação pessoal - momento de mudanças.",
      "sagitario": "Otimismo e expansão - ideias visionárias.",
      "capricornio": "Disciplina traz resultados - foco no longo prazo.",
      "aquario": "Inovação e liberdade - pense fora da caixa.",
      "peixes": "Intuição poderosa - siga seu coração."
    };

    const ascendente = args[0]?.toLowerCase();
    if (!ascendente || !ascendentes[ascendente]) {
      const lista = Object.keys(ascendentes).join(", ");
      await sendReply(`Ascendente inválido! Use: ${PREFIX}ascendentedodia <ascendente>\nOpções: ${lista}`);
      return;
    }

    await sendReply(`✨ Previsão para ascendente em ${ascendente.toUpperCase()}:\n\n${ascendentes[ascendente]}`);
  },
};