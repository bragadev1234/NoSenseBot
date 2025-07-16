const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "cassanic",
  description: "Cassanic Slot Machine — teste sua sorte!",
  commands: ["cassanic"],
  usage: `${PREFIX}cassanic`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendText }) => {
    const emojis = ["🍑", "🍋", "🍌", "🍉", "🍇", "🍒"];
    
    const sortear = () => emojis[Math.floor(Math.random() * emojis.length)];

    const slot1 = sortear();
    const slot2 = sortear();
    const slot3 = sortear();

    await sendText("🎰 Girando máquina Cassanic... Aguarde...");

    const resultado = `${slot1}${slot2}${slot3}`;
    let mensagemFinal = `🎰 Resultado: ${resultado}\n`;

    if (slot1 === slot2 && slot2 === slot3) {
      const premio = Math.floor(Math.random() * 900 + 100); // Ganha entre 100 e 1000
      mensagemFinal += `🎉 Parabéns! Você fez um HATTRICK e ganhou ${premio} Cassanic Coins!`;
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      const premio = Math.floor(Math.random() * 100 + 20); // Ganha entre 20 e 120
      mensagemFinal += `👍 Duas frutas iguais! Você ganhou ${premio} Cassanic Coins.`;
    } else {
      mensagemFinal += "😢 Nenhuma combinação... tente novamente!";
    }

    await sendText(mensagemFinal);
  },
};
