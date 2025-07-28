const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");

exports.menuMessage = (senderName) => {
  const date = new Date();

  return `
⛤━━━━━━━━━━━━━━━━━━━━━━━━━━━━⛤
   ꧁༺☠︎ 𝕯𝖆𝖗𝖐 𝕭𝖗𝖆𝖌𝖆𝕭𝖔𝖙 ☠︎༻꧂
『 𝖀𝖘𝖚𝖆́𝖗𝖎𝖔: *${senderName || '𝕯𝖊𝖒𝖔𝖓𝖎𝖔 𝕬𝖓𝖔̂𝖓𝖎𝖒𝖔'}* 』
⛤━━━━━━━━━━━━━━━━━━━━━━━━━━━━⛤

☠⃠ 𝕴𝖓𝖋𝖔𝖗𝖒𝖆𝖈̧𝖔̃𝖊𝖘 𝖉𝖔 𝕬𝖇𝖎𝖘𝖒𝖔 ☠⃠
⛧ 𝖁𝖊𝖗𝖘𝖆̃𝖔: ${packageInfo.version}
⛧ 𝕯𝖆𝖙𝖆: ${date.toLocaleDateString("pt-br")}
⛧ 𝕳𝖔́𝖗𝖆: ${date.toLocaleTimeString("pt-br")}
⛧ 𝕻𝖗𝖊𝖋𝖎𝖝𝖔: [ ${PREFIX} ]

⚰︎━━━━━━⊱ 𝕯𝖔𝖓𝖔 ⊰━━━━━━⚰︎
☠ ${PREFIX}set-menu-image » 𝕸𝖔𝖉𝖎𝖋𝖎𝖈𝖆 𝖎𝖒𝖆𝖌𝖊𝖒 𝖉𝖔 𝖒𝖊𝖓𝖚

⚡︎━━━━⊱ 𝕬𝖉𝖒𝖎𝖓𝖎𝖘𝖙𝖗𝖆𝖈̧𝖆̃𝖔 ⊰━━━━⚡︎
☠ ${PREFIX}menurpg » 𝕸𝖊𝖓𝖚 𝖗𝖕𝖌 (𝖛𝖊𝖗𝖘𝖆̃𝖔 𝖆𝖓𝖙𝖎𝖌𝖆)
☠ ${PREFIX}abrir/fechar » 𝕮𝖔𝖓𝖙𝖗𝖔𝖑𝖊 𝖌𝖗𝖚𝖕𝖔
☠ ${PREFIX}ban » 𝕰𝖝𝖎𝖑𝖎𝖆 𝖚𝖘𝖚𝖆́𝖗𝖎𝖔
☠ ${PREFIX}promover/rebaixar » 𝕸𝖆𝖓𝖎𝖕𝖚𝖑𝖆 𝖈𝖆𝖗𝖌𝖔𝖘
☠ ${PREFIX}limpar » 𝕻𝖚𝖗𝖎𝖋𝖎𝖈𝖆 𝖒𝖊𝖓𝖘𝖆𝖌𝖊𝖓𝖘
☠ ${PREFIX}anti-link » 𝕭𝖑𝖔𝖖𝖚𝖊𝖎𝖔 𝖉𝖊 𝖑𝖎𝖓𝖐𝖘
☠ ${PREFIX}welcome » 𝕸𝖊𝖓𝖘𝖆𝖌𝖊𝖒 𝖉𝖊 𝖇𝖔𝖆𝖘-𝖛𝖎𝖓𝖉𝖆𝖘
☠ ${PREFIX}exit » 𝕸𝖊𝖓𝖘𝖆𝖌𝖊𝖒 𝖉𝖊 𝖘𝖆𝖎́𝖉𝖆
☠ ${PREFIX}marcartodos » 𝕸𝖆𝖗𝖈𝖆 𝖙𝖔𝖉𝖔𝖘 𝖓𝖔 𝖌𝖗𝖚𝖕𝖔

☠⃠━━━━⊱ 𝕮𝖔𝖓𝖘𝖚𝖑𝖙𝖆𝖘 ⊰━━━━☠⃠
☠ ${PREFIX}consultacep » 𝕮𝖔𝖓𝖘𝖚𝖑𝖙𝖆 𝕮𝕰𝕻
☠ ${PREFIX}consultaip » 𝕴𝖓𝖋𝖔𝖗𝖒𝖆𝖈̧𝖔̃𝖊𝖘 �𝖉𝖊 𝕴𝕻
☠ ${PREFIX}consultacnpj » 𝕯𝖆𝖉𝖔𝖘 𝖉𝖊 𝖊𝖒𝖕𝖗𝖊𝖘𝖆
☠ ${PREFIX}consultaddd » 𝕴𝖓𝖋𝖔 𝖉𝖊 𝕯𝕯𝕯
☠ ${PREFIX}consultaplaca » 𝕽𝖊𝖌𝖎𝖘𝖙𝖗𝖔 𝖉𝖊 𝖛𝖊𝖎́𝖈𝖚𝖑𝖔
☠ ${PREFIX}validarcpf » 𝕮𝖍𝖊𝖈𝖆 𝖈𝖔𝖒 𝕮𝕻𝕱
☠ ${PREFIX}validarrg » 𝕽𝕲 (𝖋𝖔𝖗𝖒𝖆𝖙𝖔 𝕾𝕻)
☠ ${PREFIX}validarcnh » 𝕮𝖆𝖗𝖙𝖊𝖎𝖗𝖆 �𝖉𝖊 𝖍𝖆𝖇𝖎𝖑𝖎𝖙𝖆𝖈̧𝖆̃𝖔
☠ ${PREFIX}validarpis » 𝕻𝕴𝕾/𝕻𝕬𝕾𝕰𝕻/𝕹𝕴𝕿
☠ ${PREFIX}validartitulo » 𝕿𝖎́𝖙𝖚𝖑𝖔 �𝖉𝖊 𝖊𝖑𝖊𝖎𝖙𝖔𝖗
☠ ${PREFIX}consultabim » 𝕯𝖆𝖉𝖔𝖘 𝖇𝖆́𝖘𝖎𝖈𝖔𝖘
☠ ${PREFIX}consultadd » 𝕯𝖆𝖉𝖔𝖘 𝖇𝖆́𝖘𝖎𝖈𝖔𝖘

☠⃠━━━━⊱ 𝖀𝖙𝖎𝖑𝖎𝖙𝖆́𝖗𝖎𝖔𝖘 ⊰━━━━☠⃠
☠ ${PREFIX}ping » 𝖁𝖊𝖑𝖔𝖈𝖎𝖉𝖆𝖉𝖊 𝖉𝖔 𝖇𝖔𝖙
☠ ${PREFIX}revelar » 𝕽𝖊𝖛𝖊𝖑𝖆 𝖒𝖎́𝖉𝖎𝖆 𝖊𝖋𝖊̂𝖒𝖊𝖗𝖆
☠ ${PREFIX}perfil » 𝕴𝖓𝖋𝖔𝖘 𝖉𝖔 𝖚𝖘𝖚𝖆́𝖗𝖎𝖔
☠ ${PREFIX}google-search » 𝕻𝖊𝖘𝖖𝖚𝖎𝖘𝖆 𝖓𝖆 �𝖓𝖙𝖊𝖗𝖓𝖊𝖙
☠ ${PREFIX}yt-search » 𝕭𝖚𝖘𝖈𝖆 𝖓𝖔 𝖄𝖔𝖚𝖙𝖚𝖇𝖊

☠⃠━━━━⊱ 𝕸𝖎́𝖉𝖎𝖆 ⊰━━━━☠⃠
☠ ${PREFIX}play/play-video » 𝕽𝖊𝖕𝖗𝖔𝖉𝖚𝖟 𝖆́𝖚𝖉𝖎𝖔/𝖛𝖎́𝖉𝖊𝖔
☠ ${PREFIX}tik-tok » 𝕯𝖔𝖜𝖓𝖑𝖔𝖆𝖉 𝖉𝖊 𝖛𝖎́𝖉𝖊𝖔𝖘
☠ ${PREFIX}ttp » 𝕮𝖔𝖓𝖛𝖊𝖗𝖙𝖊 𝖙𝖊𝖝𝖙𝖔 𝖊𝖒 𝖋𝖎𝖌𝖚𝖗𝖎𝖓𝖍𝖆
☠ ${PREFIX}to-image » 𝕮𝖔𝖓𝖛𝖊𝖗𝖙𝖊 𝖋𝖎𝖌𝖚𝖗𝖎𝖓𝖍𝖆 𝖊𝖒 𝖎𝖒𝖆𝖌𝖊𝖒

✞━━━━⊱ 𝕴𝖆 ⊰━━━━✞
☠ ${PREFIX}gemini » 𝕮𝖍𝖆𝖙 𝖈𝖔𝖒 𝕴𝕬
☠ ${PREFIX}ia-sticker » 𝕮𝖗𝖎𝖆 𝖋𝖎𝖌𝖚𝖗𝖎𝖓𝖍𝖆𝖘 𝖈𝖔𝖒 𝕴𝕬
☠ ${PREFIX}pixart » 𝕬𝖗𝖙𝖊 𝖌𝖊𝖗𝖆𝖉𝖆 𝖕𝖔𝖗 𝕴𝕬
☠ ${PREFIX}stable-diffusion-turbo » 𝕴𝖒𝖆𝖌𝖊𝖓𝖘 𝖈𝖔𝖒 𝕴𝕬

✞━━━━⊱ 𝕯𝖎𝖛𝖊𝖗𝖘𝖆̃𝖔 ⊰━━━━✞
☠ ${PREFIX}casar » 𝕮𝖆𝖘𝖆𝖒𝖊𝖓𝖙𝖔 𝖉𝖎𝖆𝖇𝖔́𝖑𝖎𝖈𝖔
☠ ${PREFIX}cassanic » 𝕮𝖆𝖘𝖎𝖓𝖔 𝖉𝖔 𝖎𝖓𝖋𝖊𝖗𝖓𝖔
☠ ${PREFIX}lutar » 𝕯𝖚𝖊𝖑𝖔 𝖒𝖔𝖗𝖙𝖆𝖑
☠ ${PREFIX}molestar » 𝕿𝖔𝖗𝖙𝖚𝖗𝖆 𝖉𝖎𝖌𝖎𝖙𝖆𝖑 (𝖈𝖔𝖒 𝖒𝖔𝖉𝖊𝖗𝖆𝖈̧𝖆̃𝖔)
☠ ${PREFIX}matar/socar » 𝕬𝖙𝖆𝖖𝖚𝖊𝖘 𝖛𝖎𝖔𝖑𝖊𝖓𝖙𝖔𝖘
☠ ${PREFIX}dado » 𝕽𝖔𝖉𝖆 𝖆 𝖗𝖔𝖉𝖆 𝖉𝖆 𝖘𝖔𝖗𝖙𝖊
☠ ${PREFIX}beijar/abracar » 𝕯𝖊𝖒𝖔𝖓𝖘𝖙𝖗𝖆𝖈̧𝖔̃𝖊𝖘 𝖉𝖊 𝖆𝖋𝖊𝖙𝖔

✞━━━━⊱ 𝕰𝖋𝖊𝖎𝖙𝖔𝖘 ⊰━━━━✞
☠ ${PREFIX}blur » 𝕯𝖊𝖘𝖋𝖔𝖖𝖚𝖊 𝖘𝖔𝖇𝖗𝖊𝖓𝖆𝖙𝖚𝖗𝖆𝖑
☠ ${PREFIX}cadeia/rip » 𝕰𝖋𝖊𝖎𝖙𝖔𝖘 𝖒𝖆𝖈𝖆𝖇𝖗𝖔𝖘
☠ ${PREFIX}inverter » 𝕴𝖓𝖛𝖊𝖗𝖘𝖆̃𝖔 𝖉𝖊 𝖎𝖒𝖆𝖌𝖊𝖒
☠ ${PREFIX}bolsonaro » 𝕰𝖋𝖊𝖎𝖙𝖔 𝖉𝖊 𝖙𝖊𝖑𝖊𝖛𝖎𝖘𝖆̃𝖔 𝖉𝖎𝖆𝖇𝖔́𝖑𝖎𝖈𝖆

⛤━━━━━━━━━━━━━━━━━━━━━━⛤
✠ 𝕮𝖗𝖊́𝖉𝖎𝖙𝖔𝖘:
⛧ 𝕯𝖔𝖓𝖔: @bragadev123
⛧ 𝕽𝖊𝖕𝖔: github.com/braga2311/braga-bot
⛧ 𝕾𝖎𝖙𝖊: 𝖊𝖒 𝖉𝖊𝖘𝖊𝖓𝖛𝖔𝖑𝖛𝖎𝖒𝖊𝖓𝖙𝖔
⛤━━━━━━━━━━━━━━━━━━━━━━⛤
`;
};
