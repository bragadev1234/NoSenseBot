const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");

exports.menuMessage = (senderName) => {
  const date = new Date();

  return `
✨━━━━━━━━━━━━━ 𝑴𝑬𝑵𝑼 ━━━━━━━━━━━━━✨  
👋 𝑶𝑙𝒂́, *${senderName}*!  
𝑨𝒒𝒖𝒊 𝒆𝒔𝒕𝒂̃𝒐 𝒐𝒔 𝒄𝒐𝒎𝒂𝒏𝒅𝒐𝒔 𝒅𝒊𝒔𝒑𝒐𝒏𝒊́𝒗𝒆𝒊𝒔 𝒏𝒐 *${BOT_NAME}* 🤖  

📅 *𝑫𝒂𝒕𝒂:* ${date.toLocaleDateString()}  
⚙️ *𝑽𝒆𝒓𝒔𝒂̃𝒐:* v${packageInfo.version}  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 *𝑨𝑫𝑴𝑰𝑵𝑰𝑺𝑻𝑹𝑨𝑪̧𝑨̃𝑶*  
🚪 ${PREFIX}𝒂𝒃𝒓𝒊𝒓 / ${PREFIX}𝒇𝒆𝒄𝒉𝒂𝒓  
🔨 ${PREFIX}𝒃𝒂𝒏  
🎖️ ${PREFIX}𝒑𝒓𝒐𝒎𝒐𝒗𝒆𝒓 / ${PREFIX}𝒓𝒆𝒃𝒂𝒊𝒙𝒂𝒓  
🧹 ${PREFIX}𝒍𝒊𝒎𝒑𝒂𝒓  
📢 ${PREFIX}𝒎𝒂𝒓𝒄𝒂𝒓𝒕𝒐𝒅𝒐𝒔  
🎉 ${PREFIX}𝒘𝒆𝒍𝒄𝒐𝒎𝒆  
👋 ${PREFIX}𝒆𝒙𝒊𝒕  
💾 ${PREFIX}𝒊𝒏𝒇𝒐𝒈𝒓𝒖𝒑𝒐 | 𝒍𝒊𝒏𝒌𝒈𝒓𝒖𝒑𝒐 | 𝒍𝒊𝒔𝒕𝒂𝒂𝒅𝒎  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 *𝑨𝑵𝑻𝑰𝑺*  
🔗 ${PREFIX}𝒂𝒏𝒕𝒊-𝒍𝒊𝒏𝒌  
🔇 ${PREFIX}𝒂𝒏𝒕𝒊-𝒂𝒖𝒅𝒊𝒐  
🖼️ ${PREFIX}𝒂𝒏𝒕𝒊-𝒔𝒕𝒊𝒄𝒌𝒆𝒓  
🎥 ${PREFIX}𝒂𝒏𝒕𝒊-𝒗𝒊𝒅𝒆𝒐  
📄 ${PREFIX}𝒂𝒏𝒕𝒊-𝒅𝒐𝒄𝒖𝒎𝒆𝒏𝒕  

━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 *𝑼𝑻𝑰𝑳𝑰𝑻𝑨́𝑹𝑰𝑶𝑺*  
📜 ${PREFIX}𝒓𝒆𝒈𝒓𝒂𝒔  
🪪 ${PREFIX}𝒄𝒆𝒑  
📄 ${PREFIX}𝒊𝒑  
🚏 ${PREFIX}𝒒𝒓  
🧾 ${PREFIX}𝒍𝒐𝒄𝒕𝒆𝒍  
💳 ${PREFIX}𝒄𝒏𝒑𝒋  
📞 ${PREFIX}𝒕𝒆𝒍3  
📞 ${PREFIX}𝒅𝒅𝒅  
🗳️ ${PREFIX}𝒑𝒍𝒂𝒄𝒂  
🧑‍🎓 ${PREFIX}𝒃𝒊𝒏  
📍 ${PREFIX}𝒄𝒑𝒇  
🙋 ${PREFIX}𝒑𝒆𝒓𝒇𝒊𝒍  
🗣️ ${PREFIX}𝒊𝒈  
🎫 ${PREFIX}𝒆𝒎𝒂𝒊𝒍  
🧐 ${PREFIX}𝒈𝒆𝒐  
🗃️ ${PREFIX}𝒏𝒖𝒎𝒆𝒓𝒐2  
🌐 ${PREFIX}𝒈𝒆𝒓𝒂𝒓-𝒍𝒊𝒏𝒌  
👁️ ${PREFIX}𝒓𝒆𝒗𝒆𝒍𝒂𝒓  
🖼️ ${PREFIX}𝒕𝒐-𝒊𝒎𝒂𝒈𝒆  
🖌️ ${PREFIX}𝒈𝒆𝒓𝒂𝒓-𝒊𝒎𝒂𝒈𝒆𝒎  
📶 ${PREFIX}𝒑𝒊𝒏𝒈  
🚨 ${PREFIX}𝒈𝒆𝒓𝒂𝒓𝒔𝒆𝒏𝒉𝒂  
🗓️ ${PREFIX}𝒄𝒂𝒍𝒄𝒖𝒍𝒂𝒅𝒐𝒓𝒂  
🌐 ${PREFIX}𝒕𝒓𝒂𝒅𝒖𝒛𝒊𝒓  
💼 ${PREFIX}𝒗𝒂𝒈𝒂𝒔30  
🇵🇹 ${PREFIX}𝒏𝒊𝒇  
🇪🇸 ${PREFIX}𝒆𝒔𝒑𝒂𝒏𝒉𝒐𝒍𝒂  
🔎 ${PREFIX}𝒈𝒐𝒐𝒈𝒍𝒆-𝒍𝒆𝒅  
📝✂️ ${PREFIX}𝒓𝒆𝒔𝒖𝒎𝒊𝒓  
🤔 ${PREFIX}𝒘𝒊𝒌𝒊  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 *𝑫𝑰𝑽𝑬𝑹𝑺𝑨̃𝑶 & 𝑱𝑶𝑮𝑶𝑺*  
🎰 ${PREFIX}𝒄𝒂𝒔𝒔𝒂𝒏𝒊𝒄  
⚔️ ${PREFIX}𝒍𝒖𝒕𝒂𝒓  
🩸 ${PREFIX}𝒎𝒂𝒕𝒂𝒓 / ${PREFIX}𝒔𝒐𝒄𝒂𝒓  
🎲 ${PREFIX}𝒅𝒂𝒅𝒐  
💋🤗 ${PREFIX}𝒃𝒆𝒊𝒋𝒂𝒓 / ${PREFIX}𝒂𝒃𝒓𝒂𝒄𝒂𝒓  
🥧 ${PREFIX}𝒕𝒐𝒓𝒕𝒂  
🪙 ${PREFIX}𝒄𝒂𝒓𝒂𝒄𝒐𝒓𝒐𝒂  
👋 ${PREFIX}𝒕𝒂𝒑𝒂  
🍽️ ${PREFIX}𝒋𝒂𝒏𝒕𝒂𝒓  
🏪 ${PREFIX}𝒈𝒆𝒕-𝒍𝒊𝒅  

━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 *𝑪𝑼𝑳𝑻𝑼𝑹𝑨 & 𝑨𝑵𝑰𝑴𝑬*  
🇯🇵 ${PREFIX}𝒂𝒏𝒊𝒎𝒆  
🎵 ${PREFIX}𝒍𝒆𝒕𝒓𝒂  
♈ ${PREFIX}𝒔𝒊𝒈𝒏𝒐𝒅𝒐𝒅𝒊𝒂  
🌌 ${PREFIX}𝒂𝒔𝒄𝒆𝒏𝒅𝒆𝒏𝒕𝒆𝒅𝒐𝒅𝒊𝒂  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🐾 *𝑷𝑬𝑻𝑺*  
🐶 ${PREFIX}𝒑𝒆𝒕  
📋 ${PREFIX}𝒎𝒆𝒖𝒔𝒑𝒆𝒕𝒔  
🏆 ${PREFIX}𝒑𝒆𝒕 𝒓𝒂𝒏𝒌  
ℹ️ ${PREFIX}𝒑𝒆𝒕 𝒊𝒏𝒇𝒐  

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 *𝑵𝑺𝑭𝑾 +18*  
🤤 ${PREFIX}𝒉𝒆𝒏𝒕𝒂𝒊  
💦 ${PREFIX}𝒔𝒆𝒙𝒐1 / ${PREFIX}𝒔𝒆𝒙𝒐2 / ${PREFIX}𝒔𝒆𝒙𝒐3  
🚶 ${PREFIX}𝒔𝒆𝒙𝒐𝒆𝒎𝒑𝒆  
🍑 ${PREFIX}𝒔𝒆𝒏𝒕𝒂𝒓2  
💧 ${PREFIX}𝒔𝒆𝒙𝒐𝒎𝒐𝒍𝒉𝒂𝒅𝒐  
👄 ${PREFIX}𝒃𝒐𝒒𝒖𝒆𝒕𝒆  
😋 ${PREFIX}𝒄𝒉𝒖𝒑𝒂𝒓𝒑𝒆𝒊𝒕𝒐𝒔  
🎌 ${PREFIX}𝒔𝒆𝒙𝒐𝒉𝒆𝒈𝒂𝒍  
👭 ${PREFIX}𝒔𝒆𝒙𝒐-𝒍𝒆𝒔𝒃𝒊𝒄𝒂  
💋 ${PREFIX}𝒃𝒆𝒊𝒋𝒐-𝒍𝒆𝒔𝒃𝒊𝒄𝒐  
🌸 ${PREFIX}𝒔𝒆𝒙𝒐-𝒚𝒖𝒓𝒊  
✋ ${PREFIX}𝒂𝒑𝒂𝒍𝒑𝒂𝒓-𝒂𝒎𝒊𝒈𝒂  
🤲 ${PREFIX}𝒂𝒑𝒂𝒍𝒑𝒂𝒓  
🍆 ${PREFIX}𝒔𝒆𝒙𝒐-𝒇𝒖𝒕𝒂1 / ${PREFIX}𝒔𝒆𝒙𝒐-𝒇𝒖𝒕𝒂2  
💅 ${PREFIX}𝒔𝒆𝒙𝒐-𝒇𝒆𝒎𝒃𝒐𝒚  
✌️ ${PREFIX}𝒔𝒊𝒓𝒊𝒓𝒊𝒄𝒂 / ${PREFIX}𝒔𝒊𝒓𝒊𝒓𝒊𝒄𝒂2  
🍈🍈 ${PREFIX}𝒎𝒐𝒔𝒕𝒓𝒂𝒓𝒐𝒔𝒑𝒆𝒊𝒕𝒐𝒔  
👅 ${PREFIX}𝒄𝒉𝒖𝒑𝒂𝒓𝒃𝒄𝒕  
👀 ${PREFIX}𝒔𝒆𝒙𝒐-𝒍𝒐𝒍𝒊  

━━━━━━━━━━━━━━━━━━━━━━━━━━
😂 *𝑹𝑨𝑵𝑲𝑺 𝑴𝑬𝑴𝑬𝑺*  
🤡 ${PREFIX}𝒓𝒂𝒏𝒌-𝒄𝒐𝒓𝒏𝒐  
🥊 ${PREFIX}𝒓𝒂𝒏𝒌-𝒋𝒂𝒃𝒂𝒕𝒆𝒖  
🎲 ${PREFIX}𝒓𝒂𝒏𝒌-𝒋𝒂𝒅𝒆𝒖  
👅 ${PREFIX}𝒓𝒂𝒏𝒌-𝒎𝒂𝒎𝒂𝒅𝒂  

✨━━━━━━━━━━━━━━━━━━✨  
`;
};
