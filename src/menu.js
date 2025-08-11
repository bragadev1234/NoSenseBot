const { BOT_NAME, PREFIX } = require("./config");
const packageInfo = require("../package.json");

exports.menuMessage = (senderName) => {
  const date = new Date();

  return `
🌟━━━━━━━━━━━━━━━━━━🌟  
       *MENU DO ${BOT_NAME}*  
🌟━━━━━━━━━━━━━━━━━━🌟  

🔷 *ADMINISTRAÇÃO* 🔷  
1. ${PREFIX}abrir/fechar 🚪  
2. ${PREFIX}ban 🔨  
3. ${PREFIX}promover/rebaixar 🎖️  
4. ${PREFIX}limpar 🧹  
5. ${PREFIX}anti-link 🔗🚫  
6. ${PREFIX}anti-audio 🔇🚫  
7. ${PREFIX}anti-sticker 🖼️🚫  
8. ${PREFIX}anti-video 🎥🚫  
9. ${PREFIX}anti-document 📄🚫  
10. ${PREFIX}welcome 🎉  
11. ${PREFIX}exit 👋  
12. ${PREFIX}marcartodos 📢  
13. ${PREFIX}agendar-mensagem ⏰  

🔹 *INFORMAÇÕES* 🔹  
14. ${PREFIX}cep 🪪  
15. ${PREFIX}ip 📄  
16. ${PREFIX}loctel 🧾  
17. ${PREFIX}cnpj 💳  
18. ${PREFIX}placa 🗳️  
19. ${PREFIX}bin 🧑‍🎓  
20. ${PREFIX}cpf 📍  
21. ${PREFIX}ddd 📞  
22. ${PREFIX}perfil 🙋  
23. ${PREFIX}signododia ♈  
24. ${PREFIX}ascendentedodia 🌌  

🔹 *MÍDIA & ARQUIVOS* 🔹  
25. ${PREFIX}gerar-link 🌐  
26. ${PREFIX}revelar 👁️  
27. ${PREFIX}to-image 🖼️  
28. ${PREFIX}video 🎥  
29. ${PREFIX}tocar 🎵  
30. ${PREFIX}ytsearch ▶️  
31. ${PREFIX}google 🔎  
32. ${PREFIX}resumir-pdf 📑✂️  
33. ${PREFIX}resumir-texto 📝✂️  

🔹 *DIVERSÃO & INTERAÇÃO* 🔹  
34. ${PREFIX}casar 💍  
35. ${PREFIX}cassanic 🎰  
36. ${PREFIX}lutar ⚔️  
37. ${PREFIX}matar/socar 🩸  
38. ${PREFIX}dado 🎲  
39. ${PREFIX}beijar/abracar 💋🤗  
40. ${PREFIX}torta 🥧  
41. ${PREFIX}caracoroa 🪙  
42. ${PREFIX}tapa 👋  
43. ${PREFIX}jantar 🍽️  

🔹 *UTILIDADES* 🔹  
44. ${PREFIX}ping 📶  

📅 Data: ${date.toLocaleDateString()}  
⏰ Hora: ${date.toLocaleTimeString()}  

🌟━━━━━━━━━━━━━━━━━━🌟  
       *${BOT_NAME} v${packageInfo.version}*  
🌟━━━━━━━━━━━━━━━━━━🌟  
`;
};
