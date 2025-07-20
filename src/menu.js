/**
 * 
 * 
 * @author Dev Gui
 * Adaptação por: braga
 */
const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");

// Função para gerar a data/hora formatada
function getDateTime() {
  const date = new Date();
  return {
    date: date.toLocaleDateString("pt-br"),
    time: date.toLocaleTimeString("pt-br")
  };
}

// Menu Principal - Lista todas as categorias
exports.menuPrincipal = (senderName) => {
  const { date, time } = getDateTime();
  
  return `╭┈⊰ 🌸 『 *꧁꧂ _꧁ღ${BOT_NAME}꧂_  ꧁꧂* 』
┊Olá, *${senderName || 'usuário'}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❪🍧ฺꕸ▸ *MENU PRINCIPAL*
┊
┊•.‌𖥨֗🍓⭟Versão: ${packageInfo.version}
┊•.‌𖥨֗🍓⭟Data: ${date}
┊•.‌𖥨֗🍓⭟Hora: ${time}
┊•.‌𖥨֗🍓⭟Prefixo: ${PREFIX}
┊
╭┈❪📚ฺꕸ▸ *CATEGORIAS*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}menuadm - Comandos administrativos
┊•.‌𖥨֗🍓⭟${PREFIX}menuconsultas - Consultas diversas
┊•.‌𖥨֗🍓⭟${PREFIX}menudono - Comandos exclusivos
┊•.‌𖥨֗🍓⭟${PREFIX}menujogos - Jogos e diversão
┊•.‌𖥨֗🍓⭟${PREFIX}menumidia - Comandos de mídia
┊•.‌𖥨֗🍓⭟${PREFIX}menuia - Inteligência Artificial
┊•.‌𖥨֗🍓⭟${PREFIX}menuefeitos - Efeitos para imagens
┊•.‌𖥨֗🍓⭟${PREFIX}menuferramentas - Ferramentas úteis
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};

// Menu de Administração
exports.menuAdm = () => {
  return `╭┈❪🛡️ฺꕸ▸ *MENU ADMINISTRAÇÃO*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}abrir - Abrir grupo
┊•.‌𖥨֗🍓⭟${PREFIX}fechar - Fechar grupo
┊•.‌𖥨֗🍓⭟${PREFIX}ban - Banir membro
┊•.‌𖥨֗🍓⭟${PREFIX}promover - Dar admin
┊•.‌𖥨֗🍓⭟${PREFIX}rebaixar - Remover admin
┊•.‌𖥨֗🍓⭟${PREFIX}limpar - Limpar chat
┊•.‌𖥨֗🍓⭟${PREFIX}anti-link - Ativar anti-link
┊•.‌𖥨֗🍓⭟${PREFIX}welcome - Configurar boas-vindas
┊•.‌𖥨֗🍓⭟${PREFIX}hidetag - Marcação invisível
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};

// Menu de Consultas (novo)
exports.menuConsultas = () => {
  return `╭┈❪🔍ฺꕸ▸ *MENU CONSULTAS*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}consultacep - Consultar CEP
┊•.‌𖥨֗🍓⭟${PREFIX}consultaip - Consultar IP
┊•.‌𖥨֗🍓⭟${PREFIX}consultacnpj - Consultar CNPJ
┊•.‌𖥨֗🍓⭟${PREFIX}validarcpf - Validar CPF
┊•.‌𖥨֗🍓⭟${PREFIX}consultabim - Consultar BIM
┊•.‌𖥨֗🍓⭟${PREFIX}consultadd - Consultar DD
┊•.‌𖥨֗🍓⭟${PREFIX}gerarcpf - Gerar CPF válido
┊•.‌𖥨֗🍓⭟${PREFIX}gerarcnh - Gerar CNH válida
┊•.‌𖥨֗🍓⭟${PREFIX}gerartitulo - Gerar título eleitoral
┊•.‌𖥨֗🍓⭟${PREFIX}validartitulo - Validar título
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};

// Menu do Dono
exports.menuDono = () => {
  return `╭┈❪👑ฺꕸ▸ *MENU DONO*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}set-menu-image - Alterar imagem do menu
┊•.‌𖥨֗🍓⭟${PREFIX}trava - Comando de trava
┊•.‌𖥨֗🍓⭟${PREFIX}desligar - Desligar bot
┊•.‌𖥨֗🍓⭟${PREFIX}infobot - Ver info do bot
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};

// Menu de Jogos/Diversão
exports.menuJogos = () => {
  return `╭┈❪🎭ฺꕸ▸ *MENU JOGOS/DIVERSÃO*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}cassanic - Cassino virtual
┊•.‌𖥨֗🍓⭟${PREFIX}matar - Jogo de matar
┊•.‌𖥨֗🍓⭟${PREFIX}dado - Rolar dado
┊•.‌𖥨֗🍓⭟${PREFIX}beijar - Beijar alguém
┊•.‌𖥨֗🍓⭟${PREFIX}abracar - Abraçar alguém
┊•.‌𖥨֗🍓⭟${PREFIX}socar - Socar alguém
┊•.‌𖥨֗🍓⭟${PREFIX}lutar - Batalha RPG
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};

// Menu de Mídia
exports.menuMidia = () => {
  return `╭┈❪🎵ฺꕸ▸ *MENU MÍDIA*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}play - Baixar áudio
┊•.‌𖥨֗🍓⭟${PREFIX}play-video - Baixar vídeo
┊•.‌𖥨֗🍓⭟${PREFIX}tik-tok - Baixar do TikTok
┊•.‌𖥨֗🍓⭟${PREFIX}ttp - Texto para sticker
┊•.‌𖥨֗🍓⭟${PREFIX}to-image - Sticker para imagem
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};

// Menu de IA
exports.menuIA = () => {
  return `╭┈❪🤖ฺꕸ▸ *MENU INTELIGÊNCIA ARTIFICIAL*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}gemini - Chat com Gemini
┊•.‌𖥨֗🍓⭟${PREFIX}ia-sticker - Criar sticker com IA
┊•.‌𖥨֗🍓⭟${PREFIX}pixart - Gerar imagem IA
┊•.‌𖥨֗🍓⭟${PREFIX}stable-diffusion-turbo - Imagens em alta qualidade
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};

// Menu de Efeitos
exports.menuEfeitos = () => {
  return `╭┈❪✨ฺꕸ▸ *MENU EFEITOS*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}blur - Desfocar imagem
┊•.‌𖥨֗🍓⭟${PREFIX}cadeia - Foto na cadeia
┊•.‌𖥨֗🍓⭟${PREFIX}rip - Lápide com sua foto
┊•.‌𖥨֗🍓⭟${PREFIX}inverter - Inverter cores
┊•.‌𖥨֗🍓⭟${PREFIX}bolsonaro - Efeito Bolsonaro
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};

// Menu de Ferramentas
exports.menuFerramentas = () => {
  return `╭┈❪🔧ฺꕸ▸ *MENU FERRAMENTAS*
┊
┊•.‌𖥨֗🍓⭟${PREFIX}ping - Testar velocidade
┊•.‌𖥨֗🍓⭟${PREFIX}revelar - Revelar mensagem
┊•.‌𖥨֗🍓⭟${PREFIX}cep - Consultar CEP
┊•.‌𖥨֗🍓⭟${PREFIX}perfil - Ver perfil
┊•.‌𖥨֗🍓⭟${PREFIX}google-search - Pesquisar no Google
┊•.‌𖥨֗🍓⭟${PREFIX}yt-search - Pesquisar no YouTube
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯
`;
};
