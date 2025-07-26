const { PREFIX } = require(`${BASE_DIR}/config`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);

const partidas = new Map(); // por grupo
const perfis = new Map();   // por usuário
let ranking = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resetarSistema() {
  perfis.clear();
  ranking = [];
  console.log("🔄 Sistema de apostas resetado (a cada 1h).");
}
setInterval(resetarSistema, 60 * 60 * 1000); // reset a cada 1 hora

const frases = [
  "Tentou correr... tropeçou... fim.",
  "Desafiou o destino... perdeu.",
  "Girou o tambor... BANG.",
  "Foi corajoso. Mas não sortudo.",
  "A sorte não estava com ele.",
];

const arteBanner = () => `
╔════════════════════════════════╗
║     ☠️ R O U L E T A   R U S S A ☠️     ║
╚════════════════════════════════╝
“𝑁𝑒𝑚 𝑡𝑜𝑑𝑜𝑠 𝑠𝑜𝑏𝑟𝑒𝑣𝑖𝑣𝑒𝑚. 𝑈𝑚 𝑠𝑜́ 𝑣𝑒𝑛𝑐𝑒.”
`;

function getPerfil(userJid) {
  if (!perfis.has(userJid)) {
    perfis.set(userJid, {
      vitorias: 0,
      mortes: 0,
      moedas: 1000,
      apostado: 0,
    });
  }
  return perfis.get(userJid);
}

function atualizarRanking() {
  ranking = [...perfis.entries()]
    .sort((a, b) => b[1].vitorias - a[1].vitorias)
    .slice(0, 10);
}

module.exports = {
  name: "roletarussa",
  description: "☠️ Roleta russa completa com apostas, ranking e perfil",
  commands: ["roletarussa", "entrar", "apostar", "fugir", "rankingaposta", "perfilaposta"],
  usage: `${PREFIX}roletarussa | ${PREFIX}entrar | ${PREFIX}apostar 100 | ${PREFIX}fugir | ${PREFIX}rankingaposta | ${PREFIX}perfilaposta`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ command, args, userJid, remoteJid, sendText }) => {
    const grupoId = remoteJid;
    const userId = userJid;
    const userNum = onlyNumbers(userId);
    const perfil = getPerfil(userId);

    switch (command) {
      case "roletarussa": {
        if (partidas.has(grupoId)) {
          return sendText("⚠️ Uma partida já está em andamento.");
        }

        partidas.set(grupoId, {
          status: "espera",
          jogadores: new Map(), // jid -> aposta
          pote: 0,
        });

        await sendText(`${arteBanner()}
🎯 @${userNum} iniciou a Roleta Russa!

Use *${PREFIX}entrar* para participar.  
Use *${PREFIX}apostar 100* para apostar.  
⏱️ Início em 45 segundos...
Máximo: 12 jogadores.`);

        await sleep(45000);

        const partida = partidas.get(grupoId);
        if (!partida || partida.jogadores.size < 2) {
          partidas.delete(grupoId);
          return sendText("❌ Jogadores insuficientes. Jogo cancelado.");
        }

        partida.status = "ativo";
        const vivos = [...partida.jogadores.keys()];

        await sendText(`🎮 Iniciando partida com ${vivos.length} jogadores...
💰 Pote acumulado: ${partida.pote} moedas`);

        while (vivos.length > 1) {
          await sleep(3500);
          const eliminado = vivos[Math.floor(Math.random() * vivos.length)];
          const frase = frases[Math.floor(Math.random() * frases.length)];
          vivos.splice(vivos.indexOf(eliminado), 1);

          const perfilElim = getPerfil(eliminado);
          perfilElim.mortes++;

          await sendText(`
💥 *@${onlyNumbers(eliminado)} foi eliminado!*  
🗯️ ${frase}
👥 Restantes: ${vivos.length}
          `);
        }

        const vencedor = vivos[0];
        const perfilV = getPerfil(vencedor);
        perfilV.vitorias++;
        perfilV.moedas += partidas.get(grupoId).pote;

        atualizarRanking();
        partidas.delete(grupoId);

        return sendText(`
🏆 *@${onlyNumbers(vencedor)} venceu a roleta russa!*
💰 Prêmio: ${partidas.get(grupoId)?.pote || 0} moedas
        `);
      }

      case "entrar": {
        const partida = partidas.get(grupoId);
        if (!partida || partida.status !== "espera") {
          return sendText("🚫 Nenhuma partida aguardando jogadores.");
        }

        if (partida.jogadores.has(userId)) {
          return sendText("🎮 Você já está na partida.");
        }

        if (partida.jogadores.size >= 12) {
          return sendText("🚷 Limite de 12 jogadores atingido.");
        }

        partida.jogadores.set(userId, 0);
        return sendText(`🎯 @${userNum} entrou na Roleta Russa!`);
      }

      case "apostar": {
        const partida = partidas.get(grupoId);
        if (!partida || partida.status !== "espera") {
          return sendText("🕐 Só é possível apostar antes da partida iniciar.");
        }

        if (!partida.jogadores.has(userId)) {
          return sendText("❗ Use *!entrar* antes de apostar.");
        }

        const valor = parseInt(args[0]);
        if (isNaN(valor) || valor < 10) {
          return sendText("⚠️ Aposta inválida. Mínimo: 10 moedas.");
        }

        if (perfil.moedas < valor) {
          return sendText("💸 Você não tem moedas suficientes.");
        }

        partida.jogadores.set(userId, partida.jogadores.get(userId) + valor);
        partida.pote += valor;
        perfil.moedas -= valor;
        perfil.apostado += valor;

        return sendText(`💰 @${userNum} apostou ${valor} moedas!`);
      }

      case "fugir": {
        const partida = partidas.get(grupoId);
        if (!partida || !partida.jogadores.has(userId)) {
          return sendText("🤷 Você não está em nenhuma partida.");
        }

        partida.jogadores.delete(userId);
        return sendText(`🏃‍♂️ @${userNum} fugiu da partida como um covarde.`);
      }

      case "rankingaposta": {
        if (ranking.length === 0) {
          return sendText("📉 Nenhuma vitória registrada ainda.");
        }

        const texto = ranking.map(([jid, p], i) =>
          `#${i + 1} - @${onlyNumbers(jid)}: ${p.vitorias} vitória(s)`
        ).join("\n");

        return sendText(`📊 *RANKING GLOBAL DE APOSTAS*\n\n${texto}\n\n🔁 Reset automático em 1 hora.`);
      }

      case "perfilaposta": {
        return sendText(`
📄 *Seu Perfil de Apostas*
🏆 Vitórias: ${perfil.vitorias}
💀 Mortes: ${perfil.mortes}
💸 Moedas: ${perfil.moedas}
🪙 Total Apostado: ${perfil.apostado}
🔁 Dados resetam a cada 1 hora.
        `);
      }

      default:
        return sendText("❌ Comando inválido ou indisponível.");
    }
  },
};
