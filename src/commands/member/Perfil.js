const { isGroup } = require(`${BASE_DIR}/utils`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { getProfileImageData } = require(`${BASE_DIR}/services/baileys`);

// Mapa completo e organizado de DDDs do Brasil
const DDD_MAP = {
  // Região Sudeste
  "11": "São Paulo - SP", "12": "São José dos Campos - SP", "13": "Santos - SP",
  "14": "Bauru - SP", "15": "Sorocaba - SP", "16": "Ribeirão Preto - SP",
  "17": "São José do Rio Preto - SP", "18": "Presidente Prudente - SP",
  "19": "Campinas - SP", "21": "Rio de Janeiro - RJ", "22": "Campos dos Goytacazes - RJ",
  "24": "Volta Redonda - RJ", "27": "Vitória - ES", "28": "Cachoeiro de Itapemirim - ES",
  "31": "Belo Horizonte - MG", "32": "Juiz de Fora - MG", "33": "Governador Valadares - MG",
  "34": "Uberlândia - MG", "35": "Poços de Caldas - MG", "37": "Divinópolis - MG",
  "38": "Montes Claros - MG",
  
  // Região Sul
  "41": "Curitiba - PR", "42": "Ponta Grossa - PR", "43": "Londrina - PR",
  "44": "Maringá - PR", "45": "Foz do Iguaçu - PR", "46": "Francisco Beltrão - PR",
  "47": "Joinville - SC", "48": "Florianópolis - SC", "49": "Chapecó - SC",
  "51": "Porto Alegre - RS", "53": "Pelotas - RS", "54": "Caxias do Sul - RS",
  "55": "Santa Maria - RS",
  
  // Região Centro-Oeste
  "61": "Brasília - DF", "62": "Goiânia - GO", "63": "Palmas - TO",
  "64": "Rio Verde - GO", "65": "Cuiabá - MT", "66": "Rondonópolis - MT",
  "67": "Campo Grande - MS", "68": "Rio Branco - AC", "69": "Porto Velho - RO",
  
  // Região Nordeste
  "71": "Salvador - BA", "73": "Ilhéus - BA", "74": "Juazeiro - BA",
  "75": "Feira de Santana - BA", "77": "Barreiras - BA", "79": "Aracaju - SE",
  "81": "Recife - PE", "82": "Maceió - AL", "83": "João Pessoa - PB",
  "84": "Natal - RN", "85": "Fortaleza - CE", "86": "Teresina - PI",
  "87": "Petrolina - PE", "88": "Juazeiro do Norte - CE", "89": "Picos - PI",
  
  // Região Norte
  "91": "Belém - PA", "92": "Manaus - AM", "93": "Santarém - PA",
  "94": "Marabá - PA", "95": "Boa Vista - RR", "96": "Macapá - AP",
  "97": "Coari - AM", "98": "São Luís - MA", "99": "Imperatriz - MA"
};

// Humores com tom sombrio e melancólico
const HUMORS = [
  "Sarcasmo refinado",
  "Melancolia calculista",
  "Frieza estratégica",
  "Desdém aristocrático",
  "Ironia letal",
  "Contemplação sombria",
  "Indiferença glacial",
  "Depressivo constante",
  "Vazio existencial",
  "Nostalgia venenosa"
];

module.exports = {
  name: "perfil",
  description: "Revela a essência sombria de um usuário",
  commands: ["perfil", "profile", "ficha"],
  usage: `${PREFIX}perfil ou perfil @usuario`,
  
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    socket,
    remoteJid,
    userJid,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
  }) => {
    if (!isGroup(remoteJid)) {
      throw new InvalidParameterError(
        "Este conhecimento só pode ser acessado em círculos sombrios."
      );
    }

    const targetJid = args[0]
      ? args[0].replace(/[@ ]/g, "") + "@s.whatsapp.net"
      : userJid;

    await sendWaitReply("Consultando os arquivos proibidos...");

    try {
      let profilePicUrl;
      let userName;
      let userRole = "Pequeno Mortal";
      let description = "";
      let extraFields = [];

      try {
        const { profileImage } = await getProfileImageData(socket, targetJid);
        profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;
        const contactInfo = await socket.onWhatsApp(targetJid);
        userName = contactInfo[0]?.name || "Entidade Não Catalogada";
      } catch (error) {
        errorLog(
          `Erro ao tentar ler a aura de ${targetJid}: ${JSON.stringify(
            error,
            null,
            2
          )}`
        );
        profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
      }

      // Extrai DDD do número
      const phoneNumber = targetJid.split("@")[0];
      const ddd = phoneNumber.length > 4 ? phoneNumber.substring(2, 4) : "00";
      const location = DDD_MAP[ddd] || "Território Desconhecido";

      // Tratamento especial para números lendários
      switch (phoneNumber) {
        case "5521985886256": // Fundador
          userRole = "Fundador Presidente Supremo";
          description = "Frio como a lâmina, estrategista absoluto. Ele não age — ele decide.";
          extraFields = [
            "🕯️ *Presença:* 99%",
            "🗡️ *Estratégia:* 100%",
            "🧠 *Manipulador:* 96%",
            "💀 *Remorso:* 0%",
            "⚰️ *Vazio Existencial:* 100%"
          ];
          break;
          
        case "000000": // Engrenagem
          userRole = "Engrenagem Sombria do Sistema";
          description = "A mente por trás do código. Suicidamente lógico, mortalmente leal aos seus.";
          extraFields = [
            "⚙️ *Lógica:* 98%",
            "🔐 *Lealdade:* 100%",
            "🤖 *Precisão:* 97%"
          ];
          break;
          
        case "553597816349": // Melancolia
          userRole = "A Melancolia em Carne";
          description = "Ela não fala — encanta. Sua beleza pesa. Sua presença sufoca.";
          extraFields = [
            "🌹 *Melancolia:* 100%",
            "👁️ *Olhar Fatal:* 100%",
            "💋 *Charme Letal:* 100%",
            "💔 *Fragilidade:* 87%"
          ];
          break;
          
        case "5521959317800": // Guarida
          userRole = "Guarida do Destino";
          description = "Onde os fios do destino se entrelaçam. Seu toque altera probabilidades.";
          extraFields = [
            "🧵 *Tecelão do Destino:* 100%",
            "🎲 *Influência Cósmica:* 95%",
            "🔮 *Precognição:* 88%"
          ];
          break;
          
        case "559984271816": // Dono do bot (Se'Young)
          userRole = "Rooftop Sword Master";
          description = "Mente vazia, oficina de pensamentos vazios. A melancolia feita carne, Engrenagem Sombria do Sistema.";
          extraFields = [
            "☁️ *Depressão:* -2311",
            "💀 *Chance Diária de Suicídio:* 9%",
            "🗡️ *Skill com Espadas:* 100%",
            "🕳️ *Vazio Existencial:* ∞",
            "🌌 *Identificação:* Se'Young",
            "⚙️ *Lógica:* 98%",
            "🔐 *Lealdade:* 100%",
            "🤖 *Precisão:* 97%"
          ];
          break;
      }

      // Gera atributos baseados no status do usuário
      const isSpecialNumber = [
        "5521985886256", "559984271816", 
        "553597816349", "5521959317800",
        "5521985886256"
      ].includes(phoneNumber);

      const randomPercent = (min = 1, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min;
      const programPrice = (Math.random() * 5000 + 1000).toFixed(2);
      
      // Atributos principais
      const attributes = {
        luck: isSpecialNumber ? randomPercent(80, 100) : randomPercent(),
        charisma: isSpecialNumber ? (phoneNumber === "5521985886256" ? 96 : 100) : randomPercent(),
        beauty: isSpecialNumber ? (phoneNumber === "5521985886256" ? 96 : 100) : randomPercent(),
        gado: phoneNumber === "553597816349" ? 5 : 
              phoneNumber === "5521985886256" ? 15 : 
              randomPercent(),
        humor: phoneNumber === "5521985886256" ? "Depressivo constante" :
               phoneNumber === "559984271816" ? "Frieza estratégica" :
               phoneNumber === "553597816349" ? "Melancolia calculista" :
               phoneNumber === "5521959317800" ? "Contemplação sombria" :
               HUMORS[Math.floor(Math.random() * HUMORS.length)]
      };

      // Monta a mensagem com estética gótica
      let mensagem = `──────⊹⊱✫⊰⊹──────\n`;
      
      if (userRole !== "Pequeno Mortal") {
        mensagem += `🕯️ *${userRole}*\n`;
      }
      
      mensagem += `🧛 *Nome:* @${phoneNumber}\n`;
      mensagem += `📍 *Localização:* ${location}\n`;
      
      if (description) {
        mensagem += `\n${description}\n`;
      }
      
      mensagem += `\n🎭 *Humor:* ${attributes.humor}\n`;
      mensagem += `🍀 *Sorte:* ${attributes.luck}%\n`;
      mensagem += `🤣 *Carisma:* ${attributes.charisma}%\n`;
      mensagem += `💰 *Programa:* R$ ${programPrice}\n`;
      
      // Tratamento especial para o dono do bot
      if (phoneNumber === "5521985886256") {
        mensagem += `💔 *Beleza:* ${attributes.beauty} (corações partidos)\n`;
      } else {
        mensagem += `💔 *Beleza:* ${attributes.beauty}%\n`;
      }
      
      mensagem += `🐄 *Gadisse:* ${attributes.gado}%`;
      
      if (extraFields.length > 0) {
        mensagem += `\n\n${extraFields.join("\n")}`;
      }
      
      mensagem += `\n──────⊹⊱✫⊰⊹──────`;

      const mentions = [targetJid];

      await sendSuccessReact();

      await socket.sendMessage(remoteJid, {
        image: { url: profilePicUrl },
        caption: mensagem,
        mentions: mentions,
      });
    } catch (error) {
      console.error(error);
      sendErrorReply("Os arquivos sombrios se recusam a ser lidos...");
    }
  },
};
