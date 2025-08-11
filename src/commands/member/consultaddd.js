const axios = require('axios');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

const DDD_DATABASE = {
  '11': { state: 'SP', region: 'Sudeste', cities: ['São Paulo', 'Osasco', 'Guarulhos', 'Santo André', 'São Bernardo do Campo', 'Diadema'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Algar', 'Sercomtel'], timezone: 'GMT-3', capital: 'São Paulo', area: 'Metropolitana' },
  '12': { state: 'SP', region: 'Sudeste', cities: ['São José dos Campos', 'Taubaté', 'Jacareí', 'Caçapava', 'Campos do Jordão', 'Caraguatatuba'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'São José dos Campos', area: 'Vale do Paraíba' },
  '13': { state: 'SP', region: 'Sudeste', cities: ['Santos', 'Praia Grande', 'São Vicente', 'Cubatão', 'Guarujá', 'Bertioga'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Santos', area: 'Baixada Santista' },
  '14': { state: 'SP', region: 'Sudeste', cities: ['Bauru', 'Jaú', 'Botucatu', 'Avaré', 'Lençóis Paulista', 'Agudos'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Datora'], timezone: 'GMT-3', capital: 'Bauru', area: 'Centro-Oeste' },
  '15': { state: 'SP', region: 'Sudeste', cities: ['Sorocaba', 'Itapetininga', 'Votorantim', 'Tatuí', 'Salto', 'Capão Bonito'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Sorocaba', area: 'Sudoeste' },
  '16': { state: 'SP', region: 'Sudeste', cities: ['Ribeirão Preto', 'São Carlos', 'Araraquara', 'Batatais', 'Franca', 'Sertãozinho'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Algar'], timezone: 'GMT-3', capital: 'Ribeirão Preto', area: 'Nordeste' },
  '17': { state: 'SP', region: 'Sudeste', cities: ['São José do Rio Preto', 'Catanduva', 'Votuporanga', 'Barretos', 'Araçatuba', 'Jales'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Sercomtel'], timezone: 'GMT-3', capital: 'São José do Rio Preto', area: 'Noroeste' },
  '18': { state: 'SP', region: 'Sudeste', cities: ['Presidente Prudente', 'Araçatuba', 'Assis', 'Dracena', 'Adamantina', 'Tupã'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Presidente Prudente', area: 'Extremo Oeste' },
  '19': { state: 'SP', region: 'Sudeste', cities: ['Campinas', 'Piracicaba', 'Limeira', 'Americana', 'Santa Bárbara d\'Oeste', 'Hortolândia'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Nextel'], timezone: 'GMT-3', capital: 'Campinas', area: 'Metropolitana' },
  '21': { state: 'RJ', region: 'Sudeste', cities: ['Rio de Janeiro', 'Niterói', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Belford Roxo'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Rio de Janeiro', area: 'Metropolitana' },
  '22': { state: 'RJ', region: 'Sudeste', cities: ['Campos dos Goytacazes', 'Macaé', 'Cabo Frio', 'Nova Friburgo', 'Teresópolis', 'Petrópolis'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Campos dos Goytacazes', area: 'Norte Fluminense' },
  '24': { state: 'RJ', region: 'Sudeste', cities: ['Volta Redonda', 'Petrópolis', 'Barra Mansa', 'Resende', 'Angra dos Reis', 'Valença'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Volta Redonda', area: 'Sul Fluminense' },
  '27': { state: 'ES', region: 'Sudeste', cities: ['Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Linhares', 'Colatina'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Vitória', area: 'Metropolitana' },
  '28': { state: 'ES', region: 'Sudeste', cities: ['Cachoeiro de Itapemirim', 'Colatina', 'Linhares', 'São Mateus', 'Aracruz', 'Guarapari'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Cachoeiro de Itapemirim', area: 'Sul' },
  '31': { state: 'MG', region: 'Sudeste', cities: ['Belo Horizonte', 'Contagem', 'Betim', 'Ribeirão das Neves', 'Ibirité', 'Santa Luzia'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Algar'], timezone: 'GMT-3', capital: 'Belo Horizonte', area: 'Metropolitana' },
  '32': { state: 'MG', region: 'Sudeste', cities: ['Juiz de Fora', 'Barbacena', 'Muriae', 'Cataguases', 'Ubá', 'São João Nepomuceno'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Juiz de Fora', area: 'Zona da Mata' },
  '33': { state: 'MG', region: 'Sudeste', cities: ['Governador Valadares', 'Teófilo Otoni', 'Guanhães', 'Mantena', 'Caratinga', 'Aimorés'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Governador Valadares', area: 'Vale do Rio Doce' },
  '34': { state: 'MG', region: 'Sudeste', cities: ['Uberlândia', 'Uberaba', 'Araguari', 'Ituiutaba', 'Araxá', 'Patos de Minas'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Algar'], timezone: 'GMT-3', capital: 'Uberlândia', area: 'Triângulo Mineiro' },
  '35': { state: 'MG', region: 'Sudeste', cities: ['Poços de Caldas', 'Pouso Alegre', 'Varginha', 'Passos', 'São Sebastião do Paraíso', 'Alfenas'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Poços de Caldas', area: 'Sul' },
  '37': { state: 'MG', region: 'Sudeste', cities: ['Divinópolis', 'Itaúna', 'Passos', 'Formiga', 'Nova Serrana', 'Oliveira'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Divinópolis', area: 'Oeste' },
  '38': { state: 'MG', region: 'Sudeste', cities: ['Montes Claros', 'Diamantina', 'Curvelo', 'Janaúba', 'Januária', 'Pirapora'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Montes Claros', area: 'Norte' },
  '41': { state: 'PR', region: 'Sul', cities: ['Curitiba', 'São José dos Pinhais', 'Colombo', 'Pinhais', 'Araucária', 'Fazenda Rio Grande'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Sercomtel'], timezone: 'GMT-3', capital: 'Curitiba', area: 'Metropolitana' },
  '42': { state: 'PR', region: 'Sul', cities: ['Ponta Grossa', 'Guarapuava', 'União da Vitória', 'Castro', 'Carambeí', 'Palmeira'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Ponta Grossa', area: 'Centro-Sul' },
  '43': { state: 'PR', region: 'Sul', cities: ['Londrina', 'Maringá', 'Apucarana', 'Arapongas', 'Cambé', 'Rolândia'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Sercomtel'], timezone: 'GMT-3', capital: 'Londrina', area: 'Norte' },
  '44': { state: 'PR', region: 'Sul', cities: ['Maringá', 'Umuarama', 'Cianorte', 'Paranavaí', 'Sarandi', 'Campo Mourão'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Maringá', area: 'Noroeste' },
  '45': { state: 'PR', region: 'Sul', cities: ['Foz do Iguaçu', 'Cascavel', 'Toledo', 'Medianeira', 'Francisco Beltrão', 'Pato Branco'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Foz do Iguaçu', area: 'Oeste' },
  '46': { state: 'PR', region: 'Sul', cities: ['Francisco Beltrão', 'Pato Branco', 'Dois Vizinhos', 'Coronel Vivida', 'Palmas', 'Chopinzinho'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Francisco Beltrão', area: 'Sudoeste' },
  '47': { state: 'SC', region: 'Sul', cities: ['Joinville', 'Blumenau', 'Itajaí', 'Jaraguá do Sul', 'Brusque', 'Balneário Camboriú'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Algar'], timezone: 'GMT-3', capital: 'Joinville', area: 'Norte' },
  '48': { state: 'SC', region: 'Sul', cities: ['Florianópolis', 'São José', 'Palhoça', 'Biguaçu', 'Tubarão', 'Criciúma'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Florianópolis', area: 'Metropolitana' },
  '49': { state: 'SC', region: 'Sul', cities: ['Chapecó', 'Lages', 'Joaçaba', 'Concórdia', 'São Miguel do Oeste', 'Xanxerê'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Chapecó', area: 'Oeste' },
  '51': { state: 'RS', region: 'Sul', cities: ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Gravataí', 'Novo Hamburgo', 'Viamão'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Sercomtel'], timezone: 'GMT-3', capital: 'Porto Alegre', area: 'Metropolitana' },
  '53': { state: 'RS', region: 'Sul', cities: ['Pelotas', 'Rio Grande', 'Bagé', 'Santa Vitória do Palmar', 'Jaguarão', 'São Lourenço do Sul'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Pelotas', area: 'Sul' },
  '54': { state: 'RS', region: 'Sul', cities: ['Caxias do Sul', 'Bento Gonçalves', 'Farroupilha', 'Garibaldi', 'Vacaria', 'Nova Prata'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Caxias do Sul', area: 'Serra Gaúcha' },
  '55': { state: 'RS', region: 'Sul', cities: ['Santa Maria', 'Uruguaiana', 'Santana do Livramento', 'São Gabriel', 'Alegrete', 'Rosário do Sul'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Santa Maria', area: 'Centro-Oeste' },
  '61': { state: 'DF', region: 'Centro-Oeste', cities: ['Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Gama', 'Planaltina'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Algar'], timezone: 'GMT-3', capital: 'Brasília', area: 'Federal' },
  '62': { state: 'GO', region: 'Centro-Oeste', cities: ['Goiânia', 'Anápolis', 'Rio Verde', 'Trindade', 'Senador Canedo', 'Aparecida de Goiânia'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi', 'Algar'], timezone: 'GMT-3', capital: 'Goiânia', area: 'Metropolitana' },
  '63': { state: 'TO', region: 'Norte', cities: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Palmas', area: 'Central' },
  '64': { state: 'GO', region: 'Centro-Oeste', cities: ['Rio Verde', 'Jataí', 'Catalão', 'Quirinópolis', 'Mineiros', 'Caldas Novas'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Rio Verde', area: 'Sul' },
  '65': { state: 'MT', region: 'Centro-Oeste', cities: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Barra do Garças'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Cuiabá', area: 'Metropolitana' },
  '66': { state: 'MT', region: 'Centro-Oeste', cities: ['Sinop', 'Tangará da Serra', 'Barra do Garças', 'Sorriso', 'Lucas do Rio Verde', 'Juara'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Sinop', area: 'Norte' },
  '67': { state: 'MS', region: 'Centro-Oeste', cities: ['Campo Grande', 'Dourados', 'Corumbá', 'Três Lagoas', 'Ponta Porã', 'Naviraí'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Campo Grande', area: 'Metropolitana' },
  '68': { state: 'AC', region: 'Norte', cities: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Plácido de Castro'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-5', capital: 'Rio Branco', area: 'Central' },
  '69': { state: 'RO', region: 'Norte', cities: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Jaru'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-4', capital: 'Porto Velho', area: 'Metropolitana' },
  '71': { state: 'BA', region: 'Nordeste', cities: ['Salvador', 'Feira de Santana', 'Lauro de Freitas', 'Camaçari', 'Simões Filho', 'Alagoinhas'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Salvador', area: 'Metropolitana' },
  '73': { state: 'BA', region: 'Nordeste', cities: ['Itabuna', 'Ilhéus', 'Porto Seguro', 'Eunápolis', 'Teixeira de Freitas', 'Jequié'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Itabuna', area: 'Sul' },
  '74': { state: 'BA', region: 'Nordeste', cities: ['Juazeiro', 'Paulo Afonso', 'Barreiras', 'Irecê', 'Bom Jesus da Lapa', 'Xique-Xique'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Juazeiro', area: 'Norte' },
  '75': { state: 'BA', region: 'Nordeste', cities: ['Alagoinhas', 'Santo Antônio de Jesus', 'Valença', 'Entre Rios', 'Conde', 'Cruz das Almas'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Alagoinhas', area: 'Nordeste' },
  '77': { state: 'BA', region: 'Nordeste', cities: ['Vitória da Conquista', 'Jequié', 'Brumado', 'Itapetinga', 'Guanambi', 'Livramento de Nossa Senhora'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Vitória da Conquista', area: 'Sudoeste' },
  '79': { state: 'SE', region: 'Nordeste', cities: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância', 'Tobias Barreto'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Aracaju', area: 'Metropolitana' },
  '81': { state: 'PE', region: 'Nordeste', cities: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Paulista', 'Petrolina'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Recife', area: 'Metropolitana' },
  '82': { state: 'AL', region: 'Nordeste', cities: ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares', 'São Miguel dos Campos'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Maceió', area: 'Metropolitana' },
  '83': { state: 'PB', region: 'Nordeste', cities: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'João Pessoa', area: 'Metropolitana' },
  '84': { state: 'RN', region: 'Nordeste', cities: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Natal', area: 'Metropolitana' },
  '85': { state: 'CE', region: 'Nordeste', cities: ['Fortaleza', 'Caucaia', 'Maracanaú', 'Sobral', 'Juazeiro do Norte', 'Crato'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Fortaleza', area: 'Metropolitana' },
  '86': { state: 'PI', region: 'Nordeste', cities: ['Teresina', 'Parnaíba', 'Picos', 'Floriano', 'Piripiri', 'Campo Maior'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Teresina', area: 'Metropolitana' },
  '87': { state: 'PE', region: 'Nordeste', cities: ['Petrolina', 'Garanhuns', 'Salgueiro', 'Arcoverde', 'Serra Talhada', 'Ouricuri'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Petrolina', area: 'Sertão' },
  '88': { state: 'CE', region: 'Nordeste', cities: ['Juazeiro do Norte', 'Crato', 'Sobral', 'Iguatu', 'Quixadá', 'Russas'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Juazeiro do Norte', area: 'Cariri' },
  '89': { state: 'PI', region: 'Nordeste', cities: ['Picos', 'Floriano', 'Piripiri', 'Oeiras', 'São Raimundo Nonato', 'Valença do Piauí'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Picos', area: 'Sul' },
  '91': { state: 'PA', region: 'Norte', cities: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Abaetetuba'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Belém', area: 'Metropolitana' },
  '92': { state: 'AM', region: 'Norte', cities: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-4', capital: 'Manaus', area: 'Metropolitana' },
  '93': { state: 'PA', region: 'Norte', cities: ['Santarém', 'Marabá', 'Altamira', 'Itaituba', 'Tucuruí', 'Redenção'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Santarém', area: 'Oeste' },
  '94': { state: 'PA', region: 'Norte', cities: ['Marabá', 'Parauapebas', 'Redenção', 'Xinguara', 'Conceição do Araguaia', 'São Félix do Xingu'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Marabá', area: 'Sudeste' },
  '95': { state: 'RR', region: 'Norte', cities: ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí', 'Cantá'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-4', capital: 'Boa Vista', area: 'Central' },
  '96': { state: 'AP', region: 'Norte', cities: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Porto Grande', 'Mazagão'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Macapá', area: 'Metropolitana' },
  '97': { state: 'AM', region: 'Norte', cities: ['Manacapuru', 'Coari', 'Tefé', 'Eirunepé', 'Carauari', 'Jutaí'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-4', capital: 'Manacapuru', area: 'Sul' },
  '98': { state: 'MA', region: 'Nordeste', cities: ['São Luís', 'Imperatriz', 'Timon', 'Caxias', 'Codó', 'Bacabal'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'São Luís', area: 'Metropolitana' },
  '99': { state: 'MA', region: 'Nordeste', cities: ['Imperatriz', 'Caxias', 'Codó', 'Bacabal', 'Santa Inês', 'Barra do Corda'], operatorCoverage: ['Vivo', 'Claro', 'Tim', 'Oi'], timezone: 'GMT-3', capital: 'Imperatriz', area: 'Oeste' }
};

// 🎯 ALGORITMO DE PRECISÃO APERFEIÇOADO
class PhoneLocator {
  static async getPreciseLocation(ddd, number) {
    try {
      // 1. Consulta à API de operadoras para determinar a localização mais precisa
      const carrierResponse = await axios.get(`https://api.operadoras.com/v2/ddd/${ddd}`, {
        params: { number: number.substring(4) },
        timeout: 3000
      });

      // 2. Geolocalização baseada na torre mais próxima (quando disponível)
      const towerData = await axios.get('https://api.opencellid.org/v1/cell', {
        params: {
          ddd,
          number,
          key: process.env.OPENCELLID_KEY || ''
        },
        timeout: 5000
      });

      // 3. Fallback para dados da base DDD
      const dddInfo = DDD_DATABASE[ddd];
      
      return {
        preciseCity: carrierResponse.data?.city || towerData.data?.city || dddInfo.capital,
        coordinates: towerData.data?.coordinates || null,
        carrier: carrierResponse.data?.carrier || 'Desconhecida',
        accuracy: carrierResponse.data ? 'Alta' : towerData.data ? 'Média' : 'Baixa'
      };
    } catch (error) {
      const dddInfo = DDD_DATABASE[ddd];
      return {
        preciseCity: dddInfo.capital,
        coordinates: null,
        carrier: 'Desconhecida',
        accuracy: 'Baixa'
      };
    }
  }
}

// 📱 VALIDADOR MELHORADO
const validatePhoneNumber = (number) => {
  const cleaned = number.replace(/\D/g, '');
  
  if (!/^55\d{10,11}$/.test(cleaned)) {
    return { valid: false, error: '📛 Formato inválido! Use 55DDDNUMERO (ex: 5511988887777)' };
  }
  
  const ddd = cleaned.substring(2, 4);
  if (!DDD_DATABASE[ddd]) {
    return { valid: false, error: '📛 DDD não encontrado!' };
  }
  
  const numberType = cleaned.length === 12 ? '📱 Celular' : '📞 Fixo';
  const formattedNumber = `+${cleaned.substring(0, 2)} (${ddd}) ${cleaned.substring(4, cleaned.length-4)}-${cleaned.substring(cleaned.length-4)}`;
  
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

// 📊 GERADOR DE RELATÓRIO OTIMIZADO
const generateReport = async (validation) => {
  const { ddd, formattedNumber, numberType } = validation;
  const dddInfo = DDD_DATABASE[ddd];
  const location = await PhoneLocator.getPreciseLocation(ddd, validation.number);

  return `
🔍 *RELATÓRIO TELEFÔNICO PRECISO*

${formattedNumber}
${numberType} | DDD: ${ddd}

📍 *Localização:*
🏙️ Cidade: ${location.preciseCity} (${location.accuracy})
🏛️ Estado: ${dddInfo.state} (${dddInfo.region})
🗺️ Área: ${dddInfo.area}

📶 *Operadoras:*
${dddInfo.operatorCoverage.join(' | ')}

${location.coordinates ? `🌐 GPS: ${location.coordinates.lat},${location.coordinates.lon}` : ''}
🕒 Fuso: ${dddInfo.timezone}
📊 Precisão: ${location.accuracy}
`.trim();
};

module.exports = {
  name: "consultaddd",
  commands: ["ddd", "consultaddd", "telinfo"],
  usage: `${PREFIX}ddd <número>`,
  handle: async ({ args, sendReply, sendErrorReply }) => {
    try {
      if (!args[0]) return sendErrorReply(`📛 Informe um número!\nEx: ${PREFIX}ddd 5511988887777`);
      
      const validation = validatePhoneNumber(args[0]);
      if (!validation.valid) return sendErrorReply(validation.error);
      
      const report = await generateReport(validation);
      await sendReply(report);
    } catch (error) {
      sendErrorReply('🔴 Erro na consulta. Tente novamente.');
    }
  }
};