/**
 * Melhorado por: Braga
 *
 * @author Dev Gui
 */
const os = require("os");
const { execSync } = require("child_process");
const { PREFIX } = require(`${BASE_DIR}/config`);
const path = require("node:path");
const fs = require("fs");

module.exports = {
  name: "ping",
  description:
    "Verificar se o bot está online, o tempo de resposta e o tempo de atividade.",
  commands: ["ping", "pong"],
  usage: `${PREFIX}ping`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, startProcess, fullMessage }) => {
    try {
      const isPing = fullMessage.slice(1).startsWith("ping");
      const response = isPing ? "🏓 *Pong!*" : "🏓 *Ping!*";

      await sendReact("🏓");

      // Uptime detalhado
      const uptimeSeconds = process.uptime();
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);

      // Ping (latência)
      const ping = Date.now() - startProcess;

      // Memória
      const memUsage = process.memoryUsage();
      const rssMB = (memUsage.rss / 1024 / 1024).toFixed(2);
      const heapUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
      const heapTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);

      // CPU load média (1, 5 e 15 minutos)
      const loadAvg = os.loadavg().map((v) => v.toFixed(2));

      // Sistema operacional
      const osType = os.type(); // ex: Linux, Darwin, Windows_NT
      const osPlatform = os.platform(); // ex: linux, darwin, win32
      const osRelease = os.release(); // ex: kernel version
      const osArch = os.arch(); // ex: x64, arm

      // Versão do Node.js
      const nodeVersion = process.version;

      // Versão do NPM (se disponível)
      let npmVersion = "N/A";
      try {
        npmVersion = execSync("npm -v", { encoding: "utf8" }).trim();
      } catch {}

      // PID do processo atual
      const pid = process.pid;

      // Variáveis de ambiente importantes
      const nodeEnv = process.env.NODE_ENV || "undefined";

      // Dependências do bot (package.json)
      let dependencies = "N/A";
      try {
        const packageJsonPath = path.join(BASE_DIR, "package.json");
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
          dependencies = Object.keys(packageJson.dependencies || {}).join(", ") || "Nenhuma";
        }
      } catch {}

      // Formatação da mensagem em Markdown para WhatsApp
      const message = `${response}

*📶 Velocidade de resposta:* \`${ping}ms\`
*⏱️ Uptime:* \`${days}d ${hours}h ${minutes}m ${seconds}s\`
*💾 Memória (RSS):* \`${rssMB} MB\`
*📦 Heap usado:* \`${heapUsedMB} MB\` / \`${heapTotalMB} MB\`
*🖥️ Node.js versão:* \`${nodeVersion}\`
*📦 NPM versão:* \`${npmVersion}\`
*🖨️ PID do processo:* \`${pid}\`
*💻 Sistema:* \`${osType} (${osPlatform}) - ${osRelease} - ${osArch}\`
*⚙️ Carga CPU (1m,5m,15m):* \`${loadAvg.join(", ")}\`
*🌱 NODE_ENV:* \`${nodeEnv}\`
*📚 Dependências:* \`${dependencies}\`
`;

      await sendReply(message);
    } catch (error) {
      console.error("[PING COMMAND ERROR]", error);
      await sendReply("❌ *Ocorreu um erro ao executar o comando ping.*");
    }
  },
};
