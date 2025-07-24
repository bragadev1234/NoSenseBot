/*

SUCCESS] Fui conectado com sucesso!
Erro ao importar /data/data/com.termux/files/home/braga-bot/src/commands/member/trabalhar.js: /data/data/com.termux/files/home/braga-bot/src/commands/member/trabalhar.js:74
      const remaining = Math.ceil((job.cooldown * 1000 - (now - userData.lastWork)) / 1000;
                                                                                      ^^^^

SyntaxError: missing ) after argument list
    at wrapSafe (node:internal/modules/cjs/loader:1624:18)
    at Module._compile (node:internal/modules/cjs/loader:1666:20)
    at Module._extensions..js (node:internal/modules/cjs/loader:1824:10)
    at Module.load (node:internal/modules/cjs/loader:1427:32)
    at Module._load (node:internal/modules/cjs/loader:1250:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Module.require (node:internal/modules/cjs/loader:1449:12)
    at require (node:internal/modules/helpers:135:16)
    at /data/data/com.termux/files/home/braga-bot/src/utils/index.js:228:18
Erro ao importar /data/data/com.termux/files/home/braga-bot/src/commands/member/trabalhar.js: /data/data/com.termux/files/home/braga-bot/src/commands/member/trabalhar.js:74
      const remaining = Math.ceil((job.cooldown * 1000 - (now - userData.lastWork)) / 1000;
                                                                                      ^^^^

SyntaxError: missing ) after argument list
    at wrapSafe (node:internal/modules/cjs/loader:1624:18)
    at Module._compile (node:internal/modules/cjs/loader:1666:20)
    at Module._extensions..js (node:internal/modules/cjs/loader:1824:10)
    at Module.load (node:internal/modules/cjs/loader:1427:32)
    at Module._load (node:internal/modules/cjs/loader:1250:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Module.require (node:internal/modules/cjs/loader:1449:12)
    at require (node:internal/modules/helpers:135:16)
    at /data/data/com.termux/files/home/braga-bot/src/utils/index.js:228:18
Erro ao importar /data/data/com.termux/files/home/braga-bot/src/commands/member/trabalhar.js: /data/data/com.termux/files/home/braga-bot/src/commands/member/trabalhar.js:74
      const remaining = Math.ceil((job.cooldown * 1000 - (now - userData.lastWork)) / 1000;
                      

*/




const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { menuMessage } = require(`${BASE_DIR}/menu`);
const path = require("path");

module.exports = {
  name: "menu",
  description: "Menu de comandos",
  commands: ["menu", "help"],
  usage: `${PREFIX}menu`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendImageFromFile, sendSuccessReact }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      `\n\n${menuMessage()}`
    );
  },
};
