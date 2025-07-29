const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");

exports.menuMessage = (senderName) => {
  const date = new Date();

  return `
╭── ❖ 👑 𝐃𝐎𝐍𝐎 ❖ ──╮
│ ${PREFIX}set-menu-image 🖼️
╰─────────────────╯

╭── ❖ 🛡️ 𝐀𝐃𝐌𝐈𝐍 ❖ ──╮
│ ${PREFIX}menurpg 🎭
│ ${PREFIX}abrir / fechar 🚪
│ ${PREFIX}ban 🔨
│ ${PREFIX}promover / rebaixar 🎖️
│ ${PREFIX}limpar 🧹
│ ${PREFIX}anti-link 🔗🚫
│ ${PREFIX}welcome 🎉
│ ${PREFIX}exit 👋
│ ${PREFIX}marcartodos 📢
╰─────────────────╯

╭── ❖ 🔍 𝐂𝐎𝐍𝐒𝐔𝐋𝐓𝐀𝐒 ❖ ──╮
│ ${PREFIX}consultacep 🏠
│ ${PREFIX}consultaip 🌐
│ ${PREFIX}consultacnpj 🏢
│ ${PREFIX}consultaddd ☎️
│ ${PREFIX}consultaplaca 🚗
│ ${PREFIX}validarcpf 🪪
│ ${PREFIX}validarrg 📄
│ ${PREFIX}validarcnh 🧾
│ ${PREFIX}validarpis 💳
│ ${PREFIX}validartitulo 🗳️
│ ${PREFIX}consultabim 🧑‍🎓
│ ${PREFIX}consultadd 📍
╰─────────────────────╯

╭── ❖ 🛠️ 𝐔𝐓𝐈𝐋𝐈𝐓𝐀́𝐑𝐈𝐎𝐒 ❖ ──╮
│ ${PREFIX}ping 📶
│ ${PREFIX}revelar 👁️
│ ${PREFIX}perfil 🙋
│ ${PREFIX}google-search 🔎
│ ${PREFIX}yt-search ▶️
╰────────────────────────╯

╭── ❖ 🎬 𝐌𝐈́𝐃𝐈𝐀 ❖ ──╮
│ ${PREFIX}play / play-video 🎵
│ ${PREFIX}tik-tok 🎥
│ ${PREFIX}ttp 🧷
│ ${PREFIX}to-image 🖼️
╰────────────────────╯

╭── ❖ 🤖 𝐈𝐀 ❖ ──╮
│ ${PREFIX}gemini 💬
│ ${PREFIX}ia-sticker 🪄
│ ${PREFIX}pixart 🎨
│ ${PREFIX}stable-diffusion-turbo 🧠
╰────────────────╯

╭── ❖ 🎉 𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎 ❖ ──╮
│ ${PREFIX}casar 💍
│ ${PREFIX}cassanic 🎰
│ ${PREFIX}lutar ⚔️
│ ${PREFIX}molestar 😈
│ ${PREFIX}matar / socar 🩸
│ ${PREFIX}dado 🎲
│ ${PREFIX}beijar / abracar 💋🤗
╰─────────────────────╯

╭── ❖ 🎲 𝐉𝐎𝐆𝐎𝐒 ❖ ──╮
│ ?mini-xadrez ♟️
│ ?rr 🔫
│ ?taro 🔮
│ ?bj 🃏
│ ?domino 🁢
│ ?velha ❌⭕
│ ?caraoucoroa 🪙
╰─────────────────╯

╭── ❖ 🖌️ 𝐄𝐅𝐄𝐈𝐓𝐎𝐒 ❖ ──╮
│ ${PREFIX}blur 🌫️
│ ${PREFIX}cadeia / rip ⚰️
│ ${PREFIX}inverter 🔁
│ ${PREFIX}bolsonaro 📺
╰─────────────────────╯
`;
};
