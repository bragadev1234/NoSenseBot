const { PREFIX } = require(`${BASE_DIR}/config`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

const partidas = new Map(); // grupoId => partida
const perfis = new Map();   // userJid => { vitórias, mortes, apostas, moedas }
let ranking = [];           // ordenado por vitórias

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resetDadosGlobais() {
  perfis.clear();
  ranking = [];
  console.log("🧹 Dados de perfil e ranking resetados (agendamento de 1h).");
}
setInterval(resetDadosGlobais, 60 * 60 * 1000); // Reset a cada 1h

// Arte e frases
const frasesMorte = [
  "Tentou rolar, tropeçou e... fim.",
  "Riu do destino. Pagou caro.",
  "💥 Uma bala, um destino. Foi-se.",
  "O tambor girou... e o silêncio acabou.",
  "Desafiou o impossível. E perdeu.",
];
const banner = () => `
╔══════════════════════════════════╗
║       ☠️ 𝐑𝐎𝐔𝐋𝐄𝐓𝐓𝐄 𝐃𝐄 𝐌𝐎𝐑𝐓𝐄 ☠️       ║
╚══════════════════════════════════╝
“𝑁𝑎̃𝑜 𝑒́ 𝑎 𝑣𝑖𝑑𝑎 𝑞𝑢𝑒 𝑒𝑠𝑐𝑜𝑙ℎ𝑒, 𝑒́ 𝑎 𝑎𝑟𝑚𝑎...”
`;

function atualizarRanking() {
  ranking = [...perfis.entries()]
    .sort((a, b) => b[1].vitorias - a[1].vitorias)
    .slice(0, 10);
}

function inicializarPerfil(userJid) {
  if (!perfis.has(userJid)) {
    perfis.set(userJid, {
      vitorias: 0,
      mortes: 0,
      apostas: 0,
      moedas: 1000,
    });
  }
}

module.exports = {
  name: "roletarussa",
  description: "☠️ Jogo dramático de roleta russa com ranking e perfis",
  commands: ["roletarussa", "entrar", "apostar", "fugir", "rankingaposta", "perfilaposta"],
  usage: `${PREFIX}roletarussa | ${PREFIX}entrar | ${PREFIX}apostar 100 | ${PREFIX}rankingaposta | ${PREFIX}perfilaposta`,

  handle: async ({ args, command, userJid, remoteJid, sendText }) => {
    const groupId = remoteJid;
    inicializarPerfil(userJid);
    const perfil = perfis.get(userJid);

    // Inicia partida
    if (command === "roletarussa") {
      if (partidas.has(groupId)) {
        return sendText("⚠️ Uma roleta já está em andamento.");
      }

      partidas.set(groupId, {
        status: "espera",
        jogadores: new Map(),
        pote: 0,
      });

      await sendText(`${banner()}
🎯 @${onlyNumbers(userJid)} iniciou a Roleta Russa!

Use *${PREFIX}entrar* para jogar.  
Use *${PREFIX}apostar 100* para apostar.  
Tempo: 45s
Máximo: 12 jogadores`);

      await sleep(45000);

      const partida = partidas.get(groupId);
      if (!partida || partida.jogadores.size < 2) {
        partidas.delete(groupId);
        return sendText("❌ Jogadores insuficientes. Jogo cancelado.");
      }

      partida.status = "rodando";
      const vivos = [...partida.jogadores.keys()];

      await sendText(`🎮 Iniciando roleta com ${vivos.length} jogadores!
💰 Pote: ${partida.pote} moedas`);

      while (vivos.length > 1) {
        await sleep(3500);
        const eliminado = vivos[Math.floor(Math.random() * vivos.length)];
        vivos.splice(vivos.indexOf(eliminado), 1);

        const frase = frasesMorte[Math.floor(Math.random() * frasesMorte.length)];
        const nome = onlyNumbers(eliminado);

        perfis.get(eliminado).mortes++;

        await sendText(`
┌───────────────🔫───────────────┐
│ 💥 *ELIMINADO:* @${nome}     
│ ${frase}
└───────────────────────────────┘

Jogadores restantes: ${vivos.length}
        `);
      }

      const vencedor = vivos[0];
      const nomeV = onlyNumbers(vencedor);
      const premio = partidas.get(groupId).pote;

      perfil.vitorias++;
      perfil.moedas += premio;

      atualizarRanking();
      partidas.delete(groupId);

      return sendText(`
╔═══════════════╗
║ 🏆 𝙑𝙀𝙉𝘾𝙀𝘿𝙊𝙍 🏆 ║
╚═══════════════╝

@${nomeV} sobreviveu até o fim!  
💰 Recompensa: ${premio} moedas
`);
    }

    // Entrar
    if (command === "entrar") {
      const partida = partidas.get(groupId);
      if (!partida || partida.status !== "espera") {
        return sendText("🚫 Nenhuma roleta aberta ou tempo esgotado.");
      }

      if (partida.jogadores.has(userJid)) {
        return sendText("🙋 Você já está na partida.");
      }

      if (partida.jogadores.size >= 12) {
        return sendText("❌ Limite de 12 jogadores atingido.");
      }

      partida.jogadores.set(userJid, 0);
      return sendText(`🎯 @${onlyNumbers(userJid)} entrou na Roleta!`);
    }

    // Apostar
    if (command === "apostar") {
      const partida = partidas.get(groupId);
      if (!partida || partida.status !== "espera") {
        return sendText("⏳ Só é possível apostar antes da roleta começar.");
      }

      if (!partida.jogadores.has(userJid)) {
        return sendText("⚠️ Entre primeiro usando *!entrar*.");
      }

      const valor = parseInt(args[0]);
      if (isNaN(valor) || valor < 10) {
        return sendText("💸 Valor inválido. Mínimo: 10 moedas.");
      }

      if (perfil.moedas < valor) {
        return sendText("🚫 Você não tem moedas suficientes.");
      }

      partida.jogadores.set(userJid, (partida.jogadores.get(userJid) || 0) + valor);
      partida.pote += valor;
      perfil.apostas += valor;
      perfil.moedas -= valor;

      return sendText(`💰 @${onlyNumbers(userJid)} apostou ${valor} moedas!`);
    }

    // Fugir
    if (command === "fugir") {
      const partida = partidas.get(groupId);
      if (!partida || (partida.status !== "espera" && partida.status !== "rodando")) {
        return sendText("🚫 Nenhuma partida ativa para fugir.");
      }

      if (!partida.jogadores.has(userJid)) {
        return sendText("🤷 Você não está na partida.");
      }

      partida.jogadores.delete(userJid);
      return sendText(`🏃‍♂️ @${onlyNumbers(userJid)} fugiu da partida como um covarde...`);
    }

    // Ranking
    if (command === "rankingaposta") {
      if (ranking.length === 0) return sendText("📉 Sem dados de ranking ainda.");

      const tabela = ranking
        .map(([jid, p], i) => `#${i + 1} - @${onlyNumbers(jid)}: ${p.vitorias} vitória(s)`)
        .join("\n");

      return sendText(`
📊 *RANKING GERAL (Reseta a cada 1h)*

${tabela}
      `);
    }

    // Perfil
    if (command === "perfilaposta") {
      return sendText(`
👤 *Seu Perfil de Apostas*
🪙 Moedas: ${perfil.moedas}
🏆 Vitórias: ${perfil.vitorias}
💀 Mortes: ${perfil.mortes}
💸 Total Apostado: ${perfil.apostas}
Reseta em 1h automaticamente.
      `);
    }
  },
};
