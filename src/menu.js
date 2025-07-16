/**
 * Menu do bot
 *
 * @author Dev Gui
 * Alteração no fork por: braga
 * mudanca completa de visual, alguns comandos foram removidos da lista orginal. 
 */
const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");
const { readMore } = require("./utils");

exports.menuMessage = () => {
  const date = new Date();

  return `╭─⊣〘 ${BOT_NAME} 〙${readMore()}
║
╠🕷️➽𝐕𝐄𝐑𝐒Ã𝐎: ${packageInfo.version}
╠🕷️➽𝐃𝐀𝐓𝐀: ${date.toLocaleDateString("pt-br")}
╠🕷️➽𝐇𝐎𝐑𝐀: ${date.toLocaleTimeString("pt-br")}
╠🕷️➽𝐏𝐑𝐄𝐅𝐈𝐗𝐎: ${PREFIX}
║
║╭─⊣〘 D̵̝͉͑̐O̶̠͚͗͌̃̿́̍N̶̟̆̔̈́ͅO̴̳̩̪̟͍̼̝͖̻̺͋͐̂͂́̽̉̏ 〙
║
╠🕷️➽ ${PREFIX}set-menu-image
║
║╭─⊣〘 𝙰𝙳𝙼𝙸𝙽𝙸𝚂𝚃𝚁𝙰ÇÃ𝙾 〙
║
╠🕷️➽ ${PREFIX}abrir
╠🕷️➽ ${PREFIX}fechar
╠🕷️➽ ${PREFIX}ban
╠🕷️➽ ${PREFIX}promover
╠🕷️➽ ${PREFIX}rebaixar
╠🕷️➽ ${PREFIX}limpar
╠🕷️➽ ${PREFIX}anti-link
╠🕷️➽ ${PREFIX}welcome
╠🕷️➽ ${PREFIX}agendar-mensagem
╠🕷️➽ ${PREFIX}hidetag
╠🕷️➽ ${PREFIX}rename
║
║╭─⊣〘 𝙵𝙴𝚁𝚁𝙰𝙼𝙴𝙽𝚃𝙰𝚂 〙
║
╠🕷️➽ ${PREFIX}ping
╠🕷️➽ ${PREFIX}!vagasi
╠🕷️➽ ${PREFIX}revelar
╠🕷️➽ ${PREFIX}cep
╠🕷️➽ ${PREFIX}perfil
╠🕷️➽ ${PREFIX}google-search
╠🕷️➽ ${PREFIX}yt-search
║
║╭─⊣〘 MÍDIA 〙
║
╠🕷️➽ ${PREFIX}play
╠🕷️➽ ${PREFIX}play-video
╠🕷️➽ ${PREFIX}tik-tok
╠🕷️➽ ${PREFIX}s
╠🕷️➽ ${PREFIX}ttp
╠🕷️➽ ${PREFIX}to-image
║
║╭─⊣〘 𝙸𝙰 & 𝙸𝙼𝙰𝙶𝙴𝙽𝚂 〙
║
╠🕷️➽ ${PREFIX}gemini
╠🕷️➽ ${PREFIX}ia-sticker
╠🕷️➽ ${PREFIX}pixart
╠🕷️➽ ${PREFIX}stable-diffusion-turbo
║
║╭─⊣〘 ＤＩＶＥＲＳÃＯ 〙
║
╠🕷️➽ ${PREFIX}matar
╠🕷️➽ ${PREFIX}dado
╠🕷️➽ ${PREFIX}beijar
╠🕷️➽ ${PREFIX}abracar
╠🕷️➽ ${PREFIX}socar
╠🕷️➽ ${PREFIX}lutar
║
║╭─⊣〘 𝙴𝙵𝙵𝙴𝙲𝚃𝚂 〙
║
╠🕷️➽ ${PREFIX}blur
╠🕷️➽ ${PREFIX}cadeia
╠🕷️➽ ${PREFIX}rip
╠🕷️➽ ${PREFIX}inverter
╠🕷️➽ ${PREFIX}bolsonaro
║
╚════• 〘${BOT_NAME}〙•═════╝
`;
};
