/**
 * Menu do bot
 *
 * @author Dev Gui
 * Alteração no fork por: braga
 * Design reformulado por: [Seu Nome]
 */
const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");
const { readMore } = require("./utils");

exports.menuMessage = (senderName) => {
  const date = new Date();

  return `╭┈⊰ 🌸 『 *꧁꧂ _꧁ღ${BOT_NAME}꧂_  ꧁꧂* 』
┊Olá, *${senderName || 'usuário'}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❪🍧ฺꕸ▸ *MENU PRINCIPAL*
┊
┊•.‌𖥨֗🍓⭟Versão: ${packageInfo.version}
┊•.‌𖥨֗🍓⭟Data: ${date.toLocaleDateString("pt-br")}
┊•.‌𖥨֗🍓⭟Hora: ${date.toLocaleTimeString("pt-br")}
┊•.‌𖥨֗🍓⭟Prefixo: ${PREFIX}
┊
╭┈❪👑ฺꕸ▸ *MENU DONO*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}set-menu-image
┊•.‌𖥨֗🍓⭟${PREFIX}trava
┊
╭┈❪🛡️ฺꕸ▸ *MENU ADMIN*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}abrir
┊•.‌𖥨֗🍓⭟${PREFIX}fechar
┊•.‌𖥨֗🍓⭟${PREFIX}ban
┊•.‌𖥨֗🍓⭟${PREFIX}promover
┊•.‌𖥨֗🍓⭟${PREFIX}rebaixar
┊•.‌𖥨֗🍓⭟${PREFIX}limpar
┊•.‌𖥨֗🍓⭟${PREFIX}anti-link
┊•.‌𖥨֗🍓⭟${PREFIX}welcome
┊•.‌𖥨֗🍓⭟${PREFIX}hidetag
┊
╭┈❪🔍ฺꕸ▸ *MENU CONSULTAS*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}consultacep
┊•.‌𖥨֗🍓⭟${PREFIX}consultaip
┊•.‌𖥨֗🍓⭟${PREFIX}consultacnpj
┊•.‌𖥨֗🍓⭟${PREFIX}validarcpf
┊•.‌𖥨֗🍓⭟${PREFIX}consultabim
┊•.‌𖥨֗🍓⭟${PREFIX}consultadd
┊•.‌𖥨֗🍓⭟${PREFIX}gerarcpf
┊•.‌𖥨֗🍓⭟${PREFIX}gerarcnh
┊•.‌𖥨֗🍓⭟${PREFIX}gerartitulo
┊•.‌𖥨֗🍓⭟${PREFIX}validartitulo
┊
╭┈❪🔧ฺꕸ▸ *MENU FERRAMENTAS*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}ping
┊•.‌𖥨֗🍓⭟${PREFIX}revelar
┊•.‌𖥨֗🍓⭟${PREFIX}cep
┊•.‌𖥨֗🍓⭟${PREFIX}perfil
┊•.‌𖥨֗🍓⭟${PREFIX}google-search
┊•.‌𖥨֗🍓⭟${PREFIX}yt-search
┊
╭┈❪🎵ฺꕸ▸ *MENU MÍDIA*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}play
┊•.‌𖥨֗🍓⭟${PREFIX}play-video
┊•.‌𖥨֗🍓⭟${PREFIX}tik-tok
┊•.‌𖥨֗🍓⭟${PREFIX}ttp
┊•.‌𖥨֗🍓⭟${PREFIX}to-image
┊
╭┈❪🤖ฺꕸ▸ *MENU IA*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}gemini
┊•.‌𖥨֗🍓⭟${PREFIX}ia-sticker
┊•.‌𖥨֗🍓⭟${PREFIX}pixart
┊•.‌𖥨֗🍓⭟${PREFIX}stable-diffusion-turbo
┊
╭┈❪🎭ฺꕸ▸ *MENU JOGOS/DIVERSÃO*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}cassanic
┊•.‌𖥨֗🍓⭟${PREFIX}matar
┊•.‌𖥨֗🍓⭟${PREFIX}dado
┊•.‌𖥨֗🍓⭟${PREFIX}beijar
┊•.‌𖥨֗🍓⭟${PREFIX}abracar
┊•.‌𖥨֗🍓⭟${PREFIX}socar
┊
╭┈❪✨ฺꕸ▸ *MENU EFEITOS*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}blur
┊•.‌𖥨֗🍓⭟${PREFIX}cadeia
┊•.‌𖥨֗🍓⭟${PREFIX}rip
┊•.‌𖥨֗🍓⭟${PREFIX}inverter
┊•.‌𖥨֗🍓⭟${PREFIX}bolsonaro
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};
