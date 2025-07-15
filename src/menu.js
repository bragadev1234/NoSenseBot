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

  return `╭━━⪩ BEM VINDO! ⪨━━${readMore()}

╰┈➤${BOT_NAME}
╰┈➤ Data: ${date.toLocaleDateString("pt-br")}
╰┈➤ Hora: ${date.toLocaleTimeString("pt-br")}
╰┈➤ Prefixo: ${PREFIX}
╰┈➤ Versão: ${packageInfo.version}
╰━━─「～(■_■)～♪」─━━

┏━━━━━━━━━━◆━━━━━━━━━━┓
       🛠️ *COMANDOS DO BOT* 🛠️
┗━━━━━━━━━━◆━━━━━━━━━━┛

═════◇ *DONO* ◇═════
╰┈➤ ${PREFIX}set-menu-image » Altera a imagem do menu

════◇ *ADMINISTRAÇÃO* ◇════
╰┈➤ ${PREFIX}abrir » Libera chat para membros
⟩ ${PREFIX}fechar » Restringe chat a admins
⟩ ${PREFIX}ban » Banir usuário
⟩ ${PREFIX}promover » Tornar usuário admin
⟩ ${PREFIX}rebaixar » Remover admin
⟩ ${PREFIX}limpar » Limpar o chat
⟩ ${PREFIX}anti-link » Bloquear links
⟩ ${PREFIX}welcome » Ativa mensagem de despedida
⟩ ${PREFIX}welcome » Ativar boas-vindas (1/0)
⟩ ${PREFIX}agendar-mensagem » Agenda mensagens
⟩ ${PREFIX}hidetag » Marcar todos do grupo!

════◇ *FERRAMENTAS* ◇════
╰┈➤ ${PREFIX}ping » Teste de conexão
⟩ ${PREFIX}revelar » Revela uma imagem ou vídeo com visualização única
⟩ ${PREFIX}cep » Consulta de CEP
⟩ ${PREFIX}rename » Adiciona novos meta-dados à figurinha
⟩ ${PREFIX}perfil » Ver perfil de usuário
⟩ ${PREFIX}google-search » Pesquisa no Google
⟩ ${PREFIX}yt-search » Busca no YouTube

════◇ *MÍDIA* ◇════
╰┈➤ ${PREFIX}play » Exbir áudio do YouTube  + Informações 
⟩ ${PREFIX}play-video » Exibir vídeo do YouTube + Informações 
⟩ ${PREFIX}tik-tok » Videos do TikTok
⟩ ${PREFIX}s » Imagem para figurinha
⟩ ${PREFIX}ttp » Texto para figurinha
⟩ ${PREFIX}to-image » Figurinha para imagem

════◇ *IA & IMAGENS* ◇════
╰┈➤ ${PREFIX}gemini » Chat com IA
⟩ ${PREFIX}ia-sticker » Gerar figurinha com IA
⟩ ${PREFIX}pixart » Converter para pixel art
⟩ ${PREFIX}stable-diffusion-turbo » Gerador de imagens

════◇ *DIVERSÃO* ◇════
╰┈➤ ${PREFIX}matar » GIF matando usuário
⟩ ${PREFIX}dado » Rolar dado
⟩ ${PREFIX}beijar » GIF de beijo
⟩ ${PREFIX}abracar » GIF de abraço
⟩ ${PREFIX}socar » GIF de soco
⟩ ${PREFIX}lutar » GIF de luta

════◇ *EFFECTS* ◇════
╰┈➤ ${PREFIX}blur » Desfoque na imagem
⟩ ${PREFIX}cadeia » Efeito prisão
⟩ ${PREFIX}rip » Efeito túmulo
⟩ ${PREFIX}inverter » Cores invertidas
⟩ ${PREFIX}bolsonaro » Meme da TV

┗━━━━━━━━━━◆━━━━━━━━━━┛;
};
