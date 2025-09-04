const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const { parsePhoneNumberFromString } = require("libphonenumber-js");

// Mapa completo de DDI para nome de países (mais de 100 países)
const countryMap = {
  "1": "Estados Unidos/Canadá",
  "7": "Rússia/Cazaquistão",
  "20": "Egito",
  "27": "África do Sul",
  "30": "Grécia",
  "31": "Países Baixos",
  "32": "Bélgica",
  "33": "França",
  "34": "Espanha",
  "36": "Hungria",
  "39": "Itália",
  "40": "Romênia",
  "41": "Suíça",
  "43": "Áustria",
  "44": "Reino Unido",
  "45": "Dinamarca",
  "46": "Suécia",
  "47": "Noruega",
  "48": "Polônia",
  "49": "Alemanha",
  "51": "Peru",
  "52": "México",
  "53": "Cuba",
  "54": "Argentina",
  "55": "Brasil",
  "56": "Chile",
  "57": "Colômbia",
  "58": "Venezuela",
  "60": "Malásia",
  "61": "Austrália",
  "62": "Indonésia",
  "63": "Filipinas",
  "64": "Nova Zelândia",
  "65": "Singapura",
  "66": "Tailândia",
  "81": "Japão",
  "82": "Coreia do Sul",
  "84": "Vietnã",
  "86": "China",
  "90": "Turquia",
  "91": "Índia",
  "92": "Paquistão",
  "93": "Afeganistão",
  "94": "Sri Lanka",
  "95": "Myanmar",
  "98": "Irã",
  "211": "Sudão do Sul",
  "212": "Marrocos",
  "213": "Argélia",
  "216": "Tunísia",
  "218": "Líbia",
  "220": "Gâmbia",
  "221": "Senegal",
  "222": "Mauritânia",
  "223": "Mali",
  "224": "Guiné",
  "225": "Costa do Marfim",
  "226": "Burkina Faso",
  "227": "Níger",
  "228": "Togo",
  "229": "Benin",
  "230": "Maurício",
  "231": "Libéria",
  "232": "Serra Leoa",
  "233": "Gana",
  "234": "Nigéria",
  "235": "Chade",
  "236": "República Centro-Africana",
  "237": "Camarões",
  "238": "Cabo Verde",
  "239": "São Tomé e Príncipe",
  "240": "Guiné Equatorial",
  "241": "Gabão",
  "242": "República do Congo",
  "243": "República Democrática do Congo",
  "244": "Angola",
  "245": "Guiné-Bissau",
  "246": "Diego Garcia",
  "248": "Seicheles",
  "249": "Sudão",
  "250": "Ruanda",
  "251": "Etiópia",
  "252": "Somália",
  "253": "Djibuti",
  "254": "Quênia",
  "255": "Tanzânia",
  "256": "Uganda",
  "257": "Burundi",
  "258": "Moçambique",
  "260": "Zâmbia",
  "261": "Madagascar",
  "262": "Reunião",
  "263": "Zimbábue",
  "264": "Namíbia",
  "265": "Malawi",
  "266": "Lesoto",
  "267": "Botsuana",
  "268": "Suazilândia",
  "269": "Comores",
  "290": "Santa Helena",
  "291": "Eritreia",
  "297": "Aruba",
  "298": "Ilhas Faroé",
  "299": "Groenlândia",
  "350": "Gibraltar",
  "351": "Portugal",
  "352": "Luxemburgo",
  "353": "Irlanda",
  "354": "Islândia",
  "355": "Albânia",
  "356": "Malta",
  "357": "Chipre",
  "358": "Finlândia",
  "359": "Bulgária",
  "370": "Lituânia",
  "371": "Letônia",
  "372": "Estônia",
  "373": "Moldávia",
  "374": "Armênia",
  "375": "Bielorrússia",
  "376": "Andorra",
  "377": "Mônaco",
  "378": "San Marino",
  "379": "Vaticano",
  "380": "Ucrânia",
  "381": "Sérvia",
  "382": "Montenegro",
  "383": "Kosovo",
  "385": "Croácia",
  "386": "Eslovênia",
  "387": "Bósnia e Herzegovina",
  "389": "Macedônia do Norte",
  "420": "República Tcheca",
  "421": "Eslováquia",
  "423": "Liechtenstein",
  "500": "Ilhas Malvinas",
  "501": "Belize",
  "502": "Guatemala",
  "503": "El Salvador",
  "504": "Honduras",
  "505": "Nicarágua",
  "506": "Costa Rica",
  "507": "Panamá",
  "508": "Saint-Pierre e Miquelon",
  "509": "Haiti",
  "590": "Guadalupe",
  "591": "Bolívia",
  "592": "Guiana",
  "593": "Equador",
  "594": "Guiana Francesa",
  "595": "Paraguai",
  "596": "Martinica",
  "597": "Suriname",
  "598": "Uruguai",
  "599": "Antilhas Holandesas",
  "670": "Timor-Leste",
  "672": "Ilha Norfolk",
  "673": "Brunei",
  "674": "Nauru",
  "675": "Papua-Nova Guiné",
  "676": "Tonga",
  "677": "Ilhas Salomão",
  "678": "Vanuatu",
  "679": "Fiji",
  "680": "Palau",
  "681": "Wallis e Futuna",
  "682": "Ilhas Cook",
  "683": "Niue",
  "685": "Samoa",
  "686": "Quiribati",
  "687": "Nova Caledônia",
  "688": "Tuvalu",
  "689": "Polinésia Francesa",
  "690": "Tokelau",
  "691": "Micronésia",
  "692": "Ilhas Marshall",
  "850": "Coreia do Norte",
  "852": "Hong Kong",
  "853": "Macau",
  "855": "Camboja",
  "856": "Laos",
  "880": "Bangladesh",
  "886": "Taiwan",
  "960": "Maldivas",
  "961": "Líbano",
  "962": "Jordânia",
  "963": "Síria",
  "964": "Iraque",
  "965": "Kuwait",
  "966": "Arábia Saudita",
  "967": "Iêmen",
  "968": "Omã",
  "970": "Palestina",
  "971": "Emirados Árabes Unidos",
  "972": "Israel",
  "973": "Bahrein",
  "974": "Qatar",
  "975": "Butão",
  "976": "Mongólia",
  "977": "Nepal",
  "992": "Tajiquistão",
  "993": "Turcomenistão",
  "994": "Azerbaijão",
  "995": "Geórgia",
  "996": "Quirguistão",
  "998": "Uzbequistão"
};

module.exports = {
  name: "infopessoa",
  description: "Mostra informações objetivas sobre o número de telefone.",
  commands: ["infopessoa", "numero2", "info3"],
  usage: `${PREFIX}infopessoa @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendText,
    sendErrorReply,
    replyJid,
    args,
    isReply,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "❗ Você precisa mencionar ou responder alguém para consultar o número!"
      );
    }

    const targetJid = isReply ? replyJid : toUserJid(args[0]);

    if (!targetJid) {
      await sendErrorReply("❗ Número inválido ou não reconhecido.");
      return;
    }

    const targetNumber = onlyNumbers(targetJid);
    const fullNumber = `+${targetNumber}`;
    const phoneParsed = parsePhoneNumberFromString(fullNumber);

    if (!phoneParsed || !phoneParsed.isValid()) {
      await sendErrorReply("❗ Não consegui identificar este número.");
      return;
    }

    const ddi = phoneParsed.countryCallingCode;
    const countryName = countryMap[ddi] || "País não mapeado";

    // Texto objetivo e direto
    const mensagem = `
📱 Número: ${fullNumber}  
🌍 País: ${countryName}  
📞 DDI: +${ddi}  
🔢 Tipo: ${phoneParsed.getType() || "Indefinido"}  
✅ Válido: ${phoneParsed.isValid() ? "Sim" : "Não"}  
🔒 Internacional: ${phoneParsed.formatInternational()}  
🏠 Nacional: ${phoneParsed.formatNational()}
    `;

    await sendText(mensagem.trim(), [targetJid]);
  },
};
