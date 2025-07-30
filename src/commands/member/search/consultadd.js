const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);


// BASE DE DDDs COMPLETA (ATUALIZADA 2023)
const DDD_DATABASE = {
  '11': { state: 'SP', region: 'Sudeste', cities: ['São Paulo', 'Osasco', 'Guarulhos'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'São Paulo' },
  '12': { state: 'SP', region: 'Sudeste', cities: ['São José dos Campos', 'Taubaté', 'Jacareí'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'São José dos Campos' },
  '13': { state: 'SP', region: 'Sudeste', cities: ['Santos', 'Praia Grande', 'São Vicente'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Santos' },
  '14': { state: 'SP', region: 'Sudeste', cities: ['Bauru', 'Jaú', 'Botucatu'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Bauru' },
  '15': { state: 'SP', region: 'Sudeste', cities: ['Sorocaba', 'Itapetininga', 'Votorantim'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Sorocaba' },
  '16': { state: 'SP', region: 'Sudeste', cities: ['Ribeirão Preto', 'São Carlos', 'Araraquara'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Ribeirão Preto' },
  '17': { state: 'SP', region: 'Sudeste', cities: ['São José do Rio Preto', 'Catanduva', 'Votuporanga'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'São José do Rio Preto' },
  '18': { state: 'SP', region: 'Sudeste', cities: ['Presidente Prudente', 'Araçatuba', 'Assis'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Presidente Prudente' },
  '19': { state: 'SP', region: 'Sudeste', cities: ['Campinas', 'Piracicaba', 'Limeira'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Campinas' },
  '21': { state: 'RJ', region: 'Sudeste', cities: ['Rio de Janeiro', 'Niterói', 'São Gonçalo'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Rio de Janeiro' },
  '22': { state: 'RJ', region: 'Sudeste', cities: ['Campos dos Goytacazes', 'Macaé', 'Cabo Frio'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Campos dos Goytacazes' },
  '24': { state: 'RJ', region: 'Sudeste', cities: ['Volta Redonda', 'Petrópolis', 'Barra Mansa'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Volta Redonda' },
  '27': { state: 'ES', region: 'Sudeste', cities: ['Vitória', 'Vila Velha', 'Cariacica'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Vitória' },
  '28': { state: 'ES', region: 'Sudeste', cities: ['Cachoeiro de Itapemirim', 'Colatina', 'Linhares'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Cachoeiro de Itapemirim' },
  '31': { state: 'MG', region: 'Sudeste', cities: ['Belo Horizonte', 'Contagem', 'Betim'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Belo Horizonte' },
  '32': { state: 'MG', region: 'Sudeste', cities: ['Juiz de Fora', 'Barbacena', 'Muriae'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Juiz de Fora' },
  '33': { state: 'MG', region: 'Sudeste', cities: ['Governador Valadares', 'Teófilo Otoni', 'Guanhães'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Governador Valadares' },
  '34': { state: 'MG', region: 'Sudeste', cities: ['Uberlândia', 'Uberaba', 'Araguari'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Uberlândia' },
  '35': { state: 'MG', region: 'Sudeste', cities: ['Poços de Caldas', 'Pouso Alegre', 'Varginha'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Poços de Caldas' },
  '37': { state: 'MG', region: 'Sudeste', cities: ['Divinópolis', 'Itaúna', 'Passos'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Divinópolis' },
  '38': { state: 'MG', region: 'Sudeste', cities: ['Montes Claros', 'Diamantina', 'Curvelo'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Montes Claros' },
  '41': { state: 'PR', region: 'Sul', cities: ['Curitiba', 'São José dos Pinhais', 'Colombo'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Curitiba' },
  '42': { state: 'PR', region: 'Sul', cities: ['Ponta Grossa', 'Guarapuava', 'União da Vitória'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Ponta Grossa' },
  '43': { state: 'PR', region: 'Sul', cities: ['Londrina', 'Maringá', 'Apucarana'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Londrina' },
  '44': { state: 'PR', region: 'Sul', cities: ['Maringá', 'Umuarama', 'Cianorte'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Maringá' },
  '45': { state: 'PR', region: 'Sul', cities: ['Foz do Iguaçu', 'Cascavel', 'Toledo'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Foz do Iguaçu' },
  '46': { state: 'PR', region: 'Sul', cities: ['Francisco Beltrão', 'Pato Branco', 'Dois Vizinhos'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Francisco Beltrão' },
  '47': { state: 'SC', region: 'Sul', cities: ['Joinville', 'Blumenau', 'Itajaí'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Joinville' },
  '48': { state: 'SC', region: 'Sul', cities: ['Florianópolis', 'São José', 'Palhoça'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Florianópolis' },
  '49': { state: 'SC', region: 'Sul', cities: ['Chapecó', 'Lages', 'Joaçaba'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Chapecó' },
  '51': { state: 'RS', region: 'Sul', cities: ['Porto Alegre', 'Caxias do Sul', 'Canoas'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Porto Alegre' },
  '53': { state: 'RS', region: 'Sul', cities: ['Pelotas', 'Rio Grande', 'Bagé'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Pelotas' },
  '54': { state: 'RS', region: 'Sul', cities: ['Caxias do Sul', 'Bento Gonçalves', 'Farroupilha'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Caxias do Sul' },
  '55': { state: 'RS', region: 'Sul', cities: ['Santa Maria', 'Uruguaiana', 'Santana do Livramento'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Santa Maria' },
  '61': { state: 'DF', region: 'Centro-Oeste', cities: ['Brasília', 'Taguatinga', 'Ceilândia'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Brasília' },
  '62': { state: 'GO', region: 'Centro-Oeste', cities: ['Goiânia', 'Anápolis', 'Rio Verde'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Goiânia' },
  '63': { state: 'TO', region: 'Norte', cities: ['Palmas', 'Araguaína', 'Gurupi'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Palmas' },
  '64': { state: 'GO', region: 'Centro-Oeste', cities: ['Rio Verde', 'Jataí', 'Catalão'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Rio Verde' },
  '65': { state: 'MT', region: 'Centro-Oeste', cities: ['Cuiabá', 'Várzea Grande', 'Rondonópolis'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Cuiabá' },
  '66': { state: 'MT', region: 'Centro-Oeste', cities: ['Sinop', 'Tangará da Serra', 'Barra do Garças'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Sinop' },
  '67': { state: 'MS', region: 'Centro-Oeste', cities: ['Campo Grande', 'Dourados', 'Corumbá'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Campo Grande' },
  '68': { state: 'AC', region: 'Norte', cities: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-5', capital: 'Rio Branco' },
  '69': { state: 'RO', region: 'Norte', cities: ['Porto Velho', 'Ji-Paraná', 'Ariquemes'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-4', capital: 'Porto Velho' },
  '71': { state: 'BA', region: 'Nordeste', cities: ['Salvador', 'Feira de Santana', 'Lauro de Freitas'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Salvador' },
  '73': { state: 'BA', region: 'Nordeste', cities: ['Itabuna', 'Ilhéus', 'Porto Seguro'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Itabuna' },
  '74': { state: 'BA', region: 'Nordeste', cities: ['Juazeiro', 'Paulo Afonso', 'Barreiras'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Juazeiro' },
  '75': { state: 'BA', region: 'Nordeste', cities: ['Alagoinhas', 'Santo Antônio de Jesus', 'Valença'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Alagoinhas' },
  '77': { state: 'BA', region: 'Nordeste', cities: ['Vitória da Conquista', 'Jequié', 'Brumado'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Vitória da Conquista' },
  '79': { state: 'SE', region: 'Nordeste', cities: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Aracaju' },
  '81': { state: 'PE', region: 'Nordeste', cities: ['Recife', 'Jaboatão dos Guararapes', 'Olinda'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Recife' },
  '82': { state: 'AL', region: 'Nordeste', cities: ['Maceió', 'Arapiraca', 'Rio Largo'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Maceió' },
  '83': { state: 'PB', region: 'Nordeste', cities: ['João Pessoa', 'Campina Grande', 'Santa Rita'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'João Pessoa' },
  '84': { state: 'RN', region: 'Nordeste', cities: ['Natal', 'Mossoró', 'Parnamirim'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Natal' },
  '85': { state: 'CE', region: 'Nordeste', cities: ['Fortaleza', 'Caucaia', 'Maracanaú'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Fortaleza' },
  '86': { state: 'PI', region: 'Nordeste', cities: ['Teresina', 'Parnaíba', 'Picos'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Teresina' },
  '87': { state: 'PE', region: 'Nordeste', cities: ['Petrolina', 'Garanhuns', 'Salgueiro'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Petrolina' },
  '88': { state: 'CE', region: 'Nordeste', cities: ['Juazeiro do Norte', 'Crato', 'Sobral'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Juazeiro do Norte' },
  '89': { state: 'PI', region: 'Nordeste', cities: ['Picos', 'Floriano', 'Piripiri'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Picos' },
  '91': { state: 'PA', region: 'Norte', cities: ['Belém', 'Ananindeua', 'Santarém'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Belém' },
  '92': { state: 'AM', region: 'Norte', cities: ['Manaus', 'Parintins', 'Itacoatiara'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-4', capital: 'Manaus' },
  '93': { state: 'PA', region: 'Norte', cities: ['Santarém', 'Marabá', 'Altamira'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Santarém' },
  '94': { state: 'PA', region: 'Norte', cities: ['Marabá', 'Parauapebas', 'Redenção'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Marabá' },
  '95': { state: 'RR', region: 'Norte', cities: ['Boa Vista', 'Rorainópolis', 'Caracaraí'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-4', capital: 'Boa Vista' },
  '96': { state: 'AP', region: 'Norte', cities: ['Macapá', 'Santana', 'Laranjal do Jari'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Macapá' },
  '97': { state: 'AM', region: 'Norte', cities: ['Manacapuru', 'Coari', 'Tefé'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-4', capital: 'Manacapuru' },
  '98': { state: 'MA', region: 'Nordeste', cities: ['São Luís', 'Imperatriz', 'Timon'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'São Luís' },
  '99': { state: 'MA', region: 'Nordeste', cities: ['Imperatriz', 'Caxias', 'Codó'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Imperatriz' }
};



// 🌍 APIs de consulta
const APIs = {
  geolocation: 'https://nominatim.openstreetmap.org/search',
  phoneInfo: 'https://api.numlookupapi.com/v1/validate/',
  ipApi: 'http://ip-api.com/json/'
};

// 🔍 Validador de números aprimorado
const validatePhoneNumber = (number) => {
  const cleaned = number.replace(/\D/g, '');
  
  // Validação do formato
  if (!/^55\d{10,11}$/.test(cleaned)) {
    return { valid: false, error: 'Formato inválido! Use 55DDDNUMERO (ex: 5511988887777)' };
  }
  
  const ddd = cleaned.substring(2, 4);
  if (!DDD_DATABASE[ddd]) {
    return { valid: false, error: 'DDD não encontrado!' };
  }
  
  // Extrai informações adicionais
  const numberType = cleaned.length === 12 ? 'Celular' : 'Fixo';
  const formattedNumber = `+${cleaned.substring(0, 2)} (${ddd}) ${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
  
  return { 
    valid: true, 
    number: cleaned,
    ddd,
    fullNumber: `+${cleaned}`,
    localNumber: cleaned.substring(4),
    numberType,
    formattedNumber,
    possibleOperators: DDD_DATABASE[ddd].operatorCoverage
  };
};

// 📊 Formatadores aprimorados
const format = {
  location: (data) => {
    const { state, region, cities, capital } = data;
    return `📍 *Estado:* ${state} (${region})\n🏙️ *Cidades Principais:* ${cities.slice(0, 3).join(', ')}${cities.length > 3 ? ` + ${cities.length - 3} outras` : ''}\n⭐ *Capital Regional:* ${capital}`;
  },
  operators: (ops) => `📶 *Operadoras Possíveis:* ${ops.join(' | ')}`,
  timezone: (tz) => `⏰ *Fuso Horário:* ${tz}`,
  maps: (city) => `🗺️ *Google Maps:* https://www.google.com/maps/search/${encodeURIComponent(city)}`,
  coordinates: (lat, lon) => `🌐 *Coordenadas GPS:* ${lat}, ${lon}\n📍 *Google Maps Direto:* https://www.google.com/maps?q=${lat},${lon}`,
  numberInfo: (info) => `📞 *Número Formatado:* ${info.formattedNumber}\n📱 *Tipo:* ${info.numberType}\n🔢 *DDD:* ${info.ddd}`
};

// 🌐 Obter informações de geolocalização aprimoradas
const getEnhancedGeoInfo = async (city) => {
  try {
    const [geoResponse, ipResponse] = await Promise.all([
      axios.get(APIs.geolocation, {
        params: { q: city, format: 'json', limit: 1 },
        headers: { 'User-Agent': 'LoctelBot/2.0' }
      }),
      axios.get(APIs.ipApi)
    ]);

    const geoData = geoResponse.data[0] || {};
    const ipData = ipResponse.data || {};

    return {
      coordinates: geoData.lat && geoData.lon 
        ? { lat: geoData.lat, lon: geoData.lon, address: geoData.display_name }
        : null,
      timezone: ipData.timezone || 'GMT-3' // Fallback para o timezone mais comum no Brasil
    };
  } catch (error) {
    return { coordinates: null, timezone: 'GMT-3' };
  }
};

module.exports = {
  name: "loctel",
  description: "Consulta completa de números telefônicos com geolocalização aprimorada",
  commands: ["loctel", "localizartel", "consultatel", "telinfo"],
  usage: `${PREFIX}loctel <número>\nEx: ${PREFIX}loctel 5511988887777`,

  handle: async ({
    args,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
    sendReply,
  }) => {
    try {
      if (!args[0]) {
        return sendErrorReply(`📛 Informe um número!\nEx: ${PREFIX}loctel 5511988887777`);
      }

      await sendWaitReply("🛰️ Rastreando número com tecnologia aprimorada...");

      // 🔍 Validação do número
      const validation = validatePhoneNumber(args[0]);
      if (!validation.valid) {
        return sendErrorReply(validation.error);
      }

      const { ddd, fullNumber } = validation;
      const dddInfo = DDD_DATABASE[ddd];

      // 🌍 Consulta de geolocalização aprimorada
      const { coordinates, timezone } = await getEnhancedGeoInfo(dddInfo.capital);
      
      // 💾 Montagem do relatório completo
      const report = `
📡 *RELATÓRIO TELEFÔNICO AVANÇADO*

${format.numberInfo(validation)}
${format.location(dddInfo)}
${format.operators(dddInfo.operatorCoverage)}
${format.timezone(timezone)}

${coordinates ? format.coordinates(coordinates.lat, coordinates.lon) : ''}
${format.maps(dddInfo.capital)}

🔍 *Detalhes Adicionais:*
• *Região:* ${dddInfo.region}
• *Cidades Cobertas:* ${dddInfo.cities.length}
• *Operadoras Ativas:* ${dddInfo.operatorCoverage.length}

💡 *Dica Técnica:* O número pode estar em qualquer área de cobertura do DDD ${ddd}
⚠️ *Aviso Legal:* Esta consulta fornece apenas informações geográficas aproximadas
      `.trim();

      await sendSuccessReact();
      return sendReply(report);

    } catch (error) {
      errorLog(`Erro no loctel: ${error.stack}`);
      return sendErrorReply(`💢 Erro na consulta avançada: ${error.message || 'Serviço temporariamente indisponível'}`);
    }
  }
};
