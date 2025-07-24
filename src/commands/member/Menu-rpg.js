// rpg-commands.js
const { PREFIX } = require('../../config');

module.exports = {
  name: "rpg",
  description: "Comandos do sistema RPG",
  commands: ["menurpg", "rpghelp", "rpgguide", "rpgcomandos"],
  usage: `${PREFIX}menurpg`,

  handle: async ({ sendText, sendReplyWithMentions }) => {
    const commands = {
      // Comando principal (menu bonito)
      menurpg: () => sendReplyWithMentions(
        `*╔════════ ≪ °❈° ≫ ════════╗*\n` +
        `         *🏰 RPG ECONOMY*        \n` +
        `*╚════════ ≪ °❈° ≫ ════════╝*\n\n` +
        
        `💰 *COMANDOS PRINCIPAIS* 💰\n` +
        `▸ ${PREFIX}trabalhar - Lista empregos\n` +
        `▸ ${PREFIX}trabalhar <emprego> - Trabalha\n` +
        `▸ ${PREFIX}rank - Ver ranking\n` +
        `▸ ${PREFIX}viajar <região> - Viaja pra outra região\n\n` +
        
        `👑 *HIERARQUIA* 👑\n` +
        `1° - 👑 Rei/Reina\n` +
        `2° - 👑 Príncipe/Princesa\n` +
        `3°-5° - 💎 Nobres\n` +
        `6°+ - 🧍 Plebeus\n\n` +
        
        `🌍 *REGIÕES* 🌍\n` +
        `▸ 🏡 Vilarejo (Iniciantes)\n` +
        `▸ 🏙️ Metrópole (+20% gold)\n` +
        `▸ 🏰 Reino (+40% gold)\n` +
        `▸ 👑 Cidadela Real (TOP 5)\n\n` +
        
        `💡 *DICAS RÁPIDAS* 💡\n` +
        `» Use ${PREFIX}rank pra ver seu progresso\n` +
        `» Empregos arriscados dão mais gold\n` +
        `» Impostos são cobrados periodicamente\n\n` +
        
        `🔎 *Exemplo*: ${PREFIX}trabalhar mago`
      ),

      // Comando detalhado (guia completo)
      rpgguide: () => sendText(
        `📚 *GUIA COMPLETO DO RPG* 📚\n\n` +
        `*🔹 COMO COMEÇAR:*\n` +
        `1. Use ${PREFIX}trabalhar para ver empregos\n` +
        `2. Escolha um com ${PREFIX}trabalhar <nome>\n` +
        `3. Ganhe gold e XP para subir de nível\n\n` +
        
        `*🏆 SISTEMA DE RANKING:*\n` +
        `- Atualizado automaticamente\n` +
        `- TOP 5 recebe títulos de nobreza\n` +
        `- TOP 1 coleta impostos de todos\n\n` +
        
        `*💼 TIPOS DE EMPREGOS:*\n` +
        `- 🟢 Básicos (Seguros, ganho baixo)\n` +
        `- 🟡 Intermediários (Risco médio)\n` +
        `- 🔴 Avançados (Alto risco/recompensa)\n` +
        `- 👑 Reais (Exclusivos para TOP 5)\n\n` +
        
        `*📊 SISTEMA DE NÍVEL:*\n` +
        `- Cada nível aumenta seus bônus\n` +
        `- Nível 5+: Acessa todas regiões\n` +
        `- Nível 10+: Acessa Cidadela Real\n\n` +
        
        `*⚠️ AVISOS IMPORTANTES:*\n` +
        `- Impostos são cobrados automaticamente\n` +
        `- Empregos tem tempo de espera (cooldown)\n` +
        `- TOP 5 pode ser desafiado por outros jogadores`
      )
    };

    // Comando de ajuda rápido (alternativo)
    rpghelp: () => sendText(
      `🆘 *AJUDA RÁPIDA - RPG* 🆘\n\n` +
      `🔹 Comandos básicos:\n` +
      `${PREFIX}trabalhar - Lista empregos\n` +
      `${PREFIX}rank - Mostra ranking\n` +
      `${PREFIX}viajar - Muda de região\n\n` +
      
      `🔹 Precisa de mais ajuda?\n` +
      `Use ${PREFIX}rpgguide para o manual completo\n` +
      `Ou pergunte no grupo!`
    )
  }
};
