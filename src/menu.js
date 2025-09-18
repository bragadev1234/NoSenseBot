const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");
const fetch = require("node-fetch");

async function getRepoData() {
  const response = await fetch("https://api.github.com/repos/bragadev1234/NoSenseBot-Bot");
  const data = await response.json();
  return {
    stars: data.stargazers_count,
    forks: data.forks_count,
    issues: data.open_issues_count,
    website: data.homepage || "https://github.com/bragadev1234/NoSenseBot-Bot",
  };
}

exports.menuMessage = async (senderName) => {
  const date = new Date();
  const { stars, forks, issues, website } = await getRepoData();

  return `
⛧━━━━━━━━━━━━━━━ 𝑴𝑬𝑵𝑼 ━━━━━━━━━━━━━━━⛧
✦ Olá, *${senderName}*  
✦ Você está no domínio do *${BOT_NAME}* ⚔️

📅 𝑫𝒂𝒕𝒂: ${date.toLocaleDateString()}
⚙️ 𝑽𝒆𝒓𝒔𝒂̃𝒐: v${packageInfo.version}

⛧━━━━━━━━━ 𝑨𝑫𝑴𝑰𝑵 ⛧
🚪 ${PREFIX}abrir / ${PREFIX}fechar
🔨 ${PREFIX}ban
🎖️ ${PREFIX}promover / ${PREFIX}rebaixar
🧹 ${PREFIX}limpar
📢 ${PREFIX}marcartodos
🎉 ${PREFIX}welcome
👋 ${PREFIX}exit
🧾 ${PREFIX}loctel
💳 ${PREFIX}cnpj
📞 ${PREFIX}tel3
📞 ${PREFIX}ddd
🗳️ ${PREFIX}placa
🧑‍🎓 ${PREFIX}bin
📍 ${PREFIX}cpf
🙋 ${PREFIX}perfil
🗣️ ${PREFIX}ig
🎫 ${PREFIX}email
🧐 ${PREFIX}geo
🗃️ ${PREFIX}numero2
♈ ${PREFIX}signododia
🌌 ${PREFIX}ascendentedodia
🌐 ${PREFIX}gerar-link
👁️ ${PREFIX}revelar
🖼️ ${PREFIX}to-image
🖌️ ${PREFIX}gerar-imagem
🎵 ${PREFIX}letra
🔎 ${PREFIX}google-led
📝✂️ ${PREFIX}resumir
🤔 ${PREFIX}wiki

⛧━━━━━━━━━ 𝑨𝑵𝑻𝑰𝑺 ⛧
🔗 ${PREFIX}anti-link
🔇 ${PREFIX}anti-audio
🖼️ ${PREFIX}anti-sticker
🎥 ${PREFIX}anti-video
📄 ${PREFIX}anti-document
💬 ${PREFIX}anti-palavrao

⛧━━━━━━━━━ 𝑼𝑻𝑰𝑳𝑰𝑻𝑨́𝑹𝑰𝑶𝑺 ⛧
📜 ${PREFIX}regras
🪪 ${PREFIX}cep
📄 ${PREFIX}ip
🚏 ${PREFIX}qr
📱 ${PREFIX}whatsapp
🧾 ${PREFIX}loctel
💳 ${PREFIX}cnpj
📞 ${PREFIX}tel3
📞 ${PREFIX}ddd
🗳️ ${PREFIX}placa
🧑‍🎓 ${PREFIX}bin
📍 ${PREFIX}cpf
🙋 ${PREFIX}perfil
🗣️ ${PREFIX}ig
🎫 ${PREFIX}email
🧐 ${PREFIX}geo
🗃️ ${PREFIX}numero2
♈ ${PREFIX}signododia
🌌 ${PREFIX}ascendentedodia
🌐 ${PREFIX}gerar-link
👁️ ${PREFIX}revelar
🖼️ ${PREFIX}to-image
🖌️ ${PREFIX}gerar-imagem
🎵 ${PREFIX}letra
🔎 ${PREFIX}google-led
📝✂️ ${PREFIX}resumir
🤔 ${PREFIX}wiki

⛧━━━━━━━━━ 𝑪𝑼𝑳𝑻𝑼𝑹𝑨 & 𝑨𝑵𝑰𝑴𝑬 ⛧
🇯🇵 ${PREFIX}anime
🎰 ${PREFIX}cassanic
⚔️ ${PREFIX}lutar
🩸 ${PREFIX}matar/socar
🎲 ${PREFIX}dado
💋🤗 ${PREFIX}beijar/abracar
🥧 ${PREFIX}torta
🪙 ${PREFIX}caracoroa
👋 ${PREFIX}tapa
🍽️ ${PREFIX}jantar
📶 ${PREFIX}ping
🏪 ${PREFIX}get-lid

⛧━━━━━━━━━ 𝑷𝑬𝑻𝑺 ⛧
🐶 ${PREFIX}pet
📋 ${PREFIX}meuspets
🏆 ${PREFIX}pet rank
ℹ️ ${PREFIX}pet info

⛧━━━━━━━━━ 𝑴𝑬𝑴𝑬𝑺 & 𝑹𝑨𝑵𝑲𝑺 ⛧
🤡 ${PREFIX}rank-corno
🥊 ${PREFIX}rank-jabateu
🎲 ${PREFIX}rank-jadeu
👅 ${PREFIX}rank-mamada

⛧━━━━━━━━━ 𝑺𝑻𝑨𝑻𝑰́𝑺𝑻𝑰𝑪𝑨 ⛧
⭐ Estrelas: ${stars}
🍴 Forks: ${forks}
🧷 Issues abertas: ${issues}
🌐 Website: ${website}

⛧━━━━━━━━━ 𝑪𝑹𝑬́𝑫𝑰𝑻𝑶𝑺 ⛧
🖤 Desenvolvido por NosenseSae / Braga Dev
🔗 GitHub: https://github.com/bragadev1234/Reaper-Bot/tree/main

⛧━━━━━━━━━ 𝑭𝑰𝑳𝑶𝑺𝑶𝑭𝑰𝑎 ⛧
"Será que nos campos ou no ato de amar
Eu posso encontrar um motivo pra continuar?
Será que no céu azul
Existe um motivo pra vivo estar?"  
- Fragmentos da alma, Igiris  

⛧━━━━━━━━━━━━━━━⛧
`;
};
