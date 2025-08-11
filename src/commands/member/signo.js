const { PREFIX } = require(`${BASE_DIR}/config`);
const { sendReply } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "signododia",
  description: "Mostra a previsão do signo do dia.",
  commands: ["signododia", "signo"],
  usage: `${PREFIX}signododia <seu-signo>`,
  handle: async ({ args }) => {
    const signos = {
      "aries": "🔥 Coragem e iniciativa marcam seu dia! Ótimo momento para novos projetos.",
      "touro": "💪 Persistência trará recompensas. Foco na estabilidade financeira.",
      "gemeos": "💡 Comunicação em alta! Bom dia para networking e aprendizado.",
      "cancer": "🏠 Emoções à flor da pele. Valorize momentos em família.",
      "leao": "✨ Criatividade e liderança em destaque. Brilhe naturalmente!",
      "virgem": "📊 Organização é chave. Resolva pendências práticas.",
      "libra": "💖 Harmonia nos relacionamentos. Diálogo resolve conflitos.",
      "escorpiao": "🔄 Transformação pessoal. Bom para reflexão profunda.",
      "sagitario": "🌍 Aventuras e expansão. Considere viagens ou estudos.",
      "capricornio": "📈 Ambição profissional. Passos sólidos trazem sucesso.",
      "aquario": "🧠 Ideias inovadoras. Colabore em projetos sociais.",
      "peixes": "🎨 Intuição aguçada. Arte e espiritualidade em foco."
    };

    const signo = args[0]?.toLowerCase();
    if (!signo || !signos[signo]) {
      const listaSignos = Object.keys(signos).join(", ");
      await sendReply(`Signo inválido! Use: ${PREFIX}signododia <signo>\nSignos disponíveis: ${listaSignos}`);
      return;
    }

    await sendReply(`♈ Previsão para ${signo.toUpperCase()} hoje:\n\n${signos[signo]}`);
  },
};