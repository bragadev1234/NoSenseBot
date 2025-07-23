const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");

exports.menuMessage = (senderName) => {
  const date = new Date();

  return `
⛧━━━━━━━━━━━━━━━━━━━━━━━━━⛧
  ꧁༒☬ 𝕭𝖗𝖆𝖌𝖆𝕭𝖔𝖙 ☬༒꧂
『 Usuário: *${senderName || '𝖆𝖓ô𝖓𝖎𝖒𝖔'}* 』
⛧━━━━━━━━━━━━━━━━━━━━━━━━━⛧

📦 𝕴𝖓𝖋𝖔𝖗𝖒𝖆çõ𝖊𝖘
⛧ Versão: ${packageInfo.version}
⛧ Data: ${date.toLocaleDateString("pt-br")}
⛧ Hora: ${date.toLocaleTimeString("pt-br")}
⛧ Prefixo: ${PREFIX}

╭─⊹⊱ ✠ 𝕯𝖔𝖓𝖔 ✠ ⊰⊹─╮
┃ ${PREFIX}set-menu-image ⟶ muda imagem do menu
╰────────────────────╯

╭─⊹⊱ 🛡️ 𝔄𝔡𝔪𝔦𝔫𝔦𝔰𝔱𝔯𝔞çã𝔬 ⊰⊹─╮
| ${PREFIX}menurpg (Versao inicial)
┃ ${PREFIX}abrir / fechar ⟶ controla grupo
┃ ${PREFIX}ban ⟶ remove usuário
┃ ${PREFIX}promover / rebaixar ⟶ cargos
┃ ${PREFIX}limpar ⟶ limpa mensagens
┃ ${PREFIX}anti-link ⟶ ativa bloqueio
┃ ${PREFIX}welcome ⟶ ativa mensagens de boas-vindas
| ${PREFIX}exit ⟶ ativa mensagens de saida
| ${PREFIX}marcartodos ⟶ marca todos do grupo
╰────────────────────────╯

╭─⊹⊱ 🔍 𝕮𝖔𝖓𝖘𝖚𝖑𝖙𝖆𝖘 ⊰⊹─╮
┃ ${PREFIX}consultacep ⟶ CEP via API
┃ ${PREFIX}consultaip ⟶ dados de IP
┃ ${PREFIX}consultacnpj ⟶ CNPJ empresa
┃ ${PREFIX}consultaddd ⟶ informações de DDD
┃ ${PREFIX}consultaplaca ⟶ dados de veículo
┃ ${PREFIX}validarcpf ⟶ checa CPF
┃ ${PREFIX}validarrg ⟶ valida RG (formato SP)
┃ ${PREFIX}validarcnh ⟶ valida CNH
┃ ${PREFIX}validarpis ⟶ valida PIS/PASEP/NIT
┃ ${PREFIX}validartitulo ⟶ confirma título de eleitor
┃ ${PREFIX}consultabim / consultadd ⟶ dados básicos
╰────────────────────────╯

╭─⊹⊱ 🔧 𝕱𝖊𝖗𝖗𝖆𝖒𝖊𝖓𝖙𝖆𝖘 ⊰⊹─╮
┃ ${PREFIX}ping ⟶ velocidade do bot
┃ ${PREFIX}revelar ⟶ revela foto ou vdeo de vizualizacao unica
┃ ${PREFIX}perfil ⟶ info do usuário
┃ ${PREFIX}google-search ⟶ pesquisa web
┃ ${PREFIX}yt-search ⟶ busca no YouTube
╰────────────────────────╯

╭─⊹⊱ 🎵 𝕸í𝖉𝖎𝖆 & 𝕯𝖔𝖜𝖓 ⊰⊹─╮
┃ ${PREFIX}play / play-video ⟶ toca áudio/vídeo
┃ ${PREFIX}tik-tok ⟶ envia vídeo do tiktok
┃ ${PREFIX}ttp ⟶ texto em sticker
┃ ${PREFIX}to-image ⟶ sticker em imagem
╰────────────────────────╯

╭─⊹⊱ 🤖 𝕴𝖓𝖙𝖊𝖑𝖎𝖌ê𝖓𝖈𝖎𝖆 𝕬𝖗𝖙𝖎𝖋𝖎𝖈𝖎𝖆𝖑 ⊰⊹─╮
┃ ${PREFIX}gemini ⟶ IA para conversas
┃ ${PREFIX}ia-sticker ⟶ IA cria figurinhas
┃ ${PREFIX}pixart ⟶ IA com arte
┃ ${PREFIX}stable-diffusion-turbo ⟶ gera imagem IA
╰────────────────────────╯

╭─⊹⊱ 🎭 𝕯𝖎𝖛𝖊𝖗𝖘ã𝖔 & 𝕵𝖔𝖌𝖔𝖘 ⊰⊹─╮
| ${PREFIX}casar ⟶ se case uma pessoa
┃ ${PREFIX}cassanic ⟶ caça-níquel aleatorio
| ${PREFIX}lutar ⟶ inicia uma luta com uma pessoa
| ${PREFIX}molestar ⟶ molesta uma pessoa (use com sabedoria kkk)
┃ ${PREFIX}matar / socar ⟶ ações da um soco ou uma pessoa
┃ ${PREFIX}dado ⟶ sorte aleatório
┃ ${PREFIX}beijar / abracar ⟶ comandos afetivos
╰────────────────────────╯

╭─⊹⊱ ✨ 𝕰𝖋𝖊𝖎𝖙𝖔𝖘 𝕯𝖊 𝕴𝖒𝖆𝖌𝖊𝖒 ⊰⊹─╮
┃ ${PREFIX}blur ⟶ aplica desfoque
┃ ${PREFIX}cadeia / rip ⟶ efeitos meme
┃ ${PREFIX}inverter ⟶ vira imagem
┃ ${PREFIX}bolsonaro ⟶ coloca uma imagem dentro de uma tv com o bolsonaro apontando
╰────────────────────────╯

⛧━━━━━━━━━━━━━━━⛧
✠ 𝕮𝖗é𝖉𝖎𝖙𝖔𝖘:
⛧ Dono: @bragadev123
⛧ Repo: github.com/braga2311/braga-bot
⛧ Site social: EM DESENVOLVIMENTO
⛧━━━━━━━━━━━━━━━⛧
`;
};
