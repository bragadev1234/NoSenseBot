const { PREFIX } = require(`${BASE_DIR}/config`);
const fs = require('fs');
const path = require('path');

// Definição dos usuários VIP e Deus dos Animais
const VIP_USERS = ["556996092882", "555399634754", "244944908060", "351965469392"];
const DEUS_DOS_ANIMAIS = "559984271816";

// Sistema de pets expandido com muitas categorias
const PETS = [
  // COMUNS (Nível 1) - 30%
  { emoji: "🐶", nome: "Cachorro Caramelo", raridade: "Comum", descricao: "O clássico brasileiro", nivel: 1 },
  { emoji: "🐱", nome: "Gato Siamês", raridade: "Comum", descricao: "Elegante e vocal", nivel: 1 },
  { emoji: "🐭", nome: "Camundongo", raridade: "Comum", descricao: "Pequeno e ágil", nivel: 1 },
  { emoji: "🐹", nome: "Hamster", raridade: "Comum", descricao: "Fofinho e ativo à noite", nivel: 1 },
  { emoji: "🐰", nome: "Coelho", raridade: "Comum", descricao: "Fofo e saltitante", nivel: 1 },
  { emoji: "🐻", nome: "Urso Pardo", raridade: "Comum", descricao: "Grande e peludo", nivel: 1 },
  { emoji: "🐨", nome: "Coala", raridade: "Comum", descricao: "Calmo e dorminhoco", nivel: 1 },
  { emoji: "🐼", nome: "Panda", raridade: "Comum", descricao: "Brincalhão e amante de bambu", nivel: 1 },
  { emoji: "🐢", nome: "Tartaruga", raridade: "Comum", descricao: "Calma e resistente", nivel: 1 },
  { emoji: "🐸", nome: "Sapo", raridade: "Comum", descricao: "Saltitante e verde", nivel: 1 },
  { emoji: "🐠", nome: "Peixe Palhaço", raridade: "Comum", descricao: "Colorido e amigável", nivel: 1 },
  { emoji: "🐬", nome: "Golfinho", raridade: "Comum", descricao: "Inteligente e brincalhão", nivel: 1 },
  { emoji: "🐳", nome: "Baleia", raridade: "Comum", descricao: "Gigante e gentil", nivel: 1 },
  { emoji: "🦀", nome: "Caranguejo", raridade: "Comum", descricao: "Anda de lado e pinça", nivel: 1 },
  { emoji: "🐌", nome: "Caracol", raridade: "Comum", descricao: "Devagar e constante", nivel: 1 },
  { emoji: "🦜", nome: "Papagaio", raridade: "Comum", descricao: "Falante e colorido", nivel: 1 },
  { emoji: "🐔", nome: "Galinha", raridade: "Comum", descricao: "Cacareja e bota ovos", nivel: 1 },
  { emoji: "🐤", nome: "Pintinho", raridade: "Comum", descricao: "Fofinho e amarelo", nivel: 1 },
  { emoji: "🦆", nome: "Pato", raridade: "Comum", descricao: "Nada e grasna", nivel: 1 },
  { emoji: "🐝", nome: "Abelha", raridade: "Comum", descricao: "Trabalhadora e produtora de mel", nivel: 1 },
  { emoji: "🦋", nome: "Borboleta", raridade: "Comum", descricao: "Colorida e delicada", nivel: 1 },
  { emoji: "🐜", nome: "Formiga", raridade: "Comum", descricao: "Trabalhadora e organizada", nivel: 1 },
  { emoji: "🦗", nome: "Gafanhoto", raridade: "Comum", descricao: "Saltitante e verde", nivel: 1 },
  { emoji: "🐞", nome: "Joaninha", raridade: "Comum", descricao: "Pintadinha e sortuda", nivel: 1 },
  { emoji: "🦎", nome: "Lagarto", raridade: "Comum", descricao: "Rápido e escalador", nivel: 1 },
  { emoji: "🐿️", nome: "Esquilo", raridade: "Comum", descricao: "Fofinho e armazenador", nivel: 1 },
  { emoji: "🦥", nome: "Preguiça", raridade: "Comum", descricao: "Devagar e calmo", nivel: 1 },
  { emoji: "🦦", nome: "Lontra", raridade: "Comum", descricao: "Brincalhona e aquática", nivel: 1 },
  { emoji: "🦡", nome: "Texugo", raridade: "Comum", descricao: "Corajoso e persistente", nivel: 1 },
  
  // RAROS (Nível 2) - 25%
  { emoji: "🐺🌙", nome: "Lobo da Luna", raridade: "Raro", descricao: "Uiva para a lua cheia", nivel: 2 },
  { emoji: "🦊🍇", nome: "Raposa Astuta", raridade: "Raro", descricao: "Esperta como uma raposa", nivel: 2 },
  { emoji: "🦁👑", nome: "Leão Rei", raridade: "Raro", descricao: "Rei da selva coroado", nivel: 2 },
  { emoji: "🐯🔥", nome: "Tigre de Fogo", raridade: "Raro", descricao: "Listrado e flamejante", nivel: 2 },
  { emoji: "🦓🌈", nome: "Zebra Arco-Íris", raridade: "Raro", descricao: "Listrada e colorida", nivel: 2 },
  { emoji: "🦒🌳", nome: "Girafa das Acácias", raridade: "Raro", descricao: "Pescoço longo entre as árvores", nivel: 2 },
  { emoji: "🐘💧", nome: "Elefante d'Água", raridade: "Raro", descricao: "Banha-se no rio", nivel: 2 },
  { emoji: "🦏🛡️", nome: "Rinoceronte Blindado", raridade: "Raro", descricao: "Couro mais duro que aço", nivel: 2 },
  { emoji: "🐆🌙", nome: "Leopardo da Noite", raridade: "Raro", descricao: "Caçador noturno", nivel: 2 },
  { emoji: "🐊🌊", nome: "Crocodilo do Nilo", raridade: "Raro", descricao: "Rei dos rios", nivel: 2 },
  { emoji: "🦅☀️", nome: "Águia Solar", raridade: "Raro", descricao: "Voa nas alturas", nivel: 2 },
  { emoji: "🦉🌙", nome: "Coruja Lunar", raridade: "Raro", descricao: "Sábia e noturna", nivel: 2 },
  { emoji: "🦚🌈", nome: "Pavão Real", raridade: "Raro", descricao: "Exibe linda cauda colorida", nivel: 2 },
  { emoji: "🐍🌿", nome: "Cobra das Selvas", raridade: "Raro", descricao: "Venonosa e rápida", nivel: 2 },
  { emoji: "🦂🔥", nome: "Escorpião Flamejante", raridade: "Raro", descricao: "Pequeno e perigoso", nivel: 2 },
  { emoji: "🐙🌊", nome: "Polvo Gigante", raridade: "Raro", descricao: "Inteligente com oito braços", nivel: 2 },
  { emoji: "🦑⚫", nome: "Lula Vampira", raridade: "Raro", descricao: "Nada rápido e solta tinta", nivel: 2 },
  { emoji: "🦈🌊", nome: "Tubarão Branco", raridade: "Raro", descricao: "Terrível predador dos mares", nivel: 2 },
  { emoji: "🐎⚡", nome: "Cavalo Veloz", raridade: "Raro", descricao: "Nobre e rápido", nivel: 2 },
  { emoji: "🦌🌲", nome: "Cervo da Floresta", raridade: "Raro", descricao: "Elegante e ágil", nivel: 2 },
  { emoji: "🐐🏔️", nome: "Cabra da Montanha", raridade: "Raro", descricao: "Ágil e escaladora", nivel: 2 },
  { emoji: "🦙☁️", nome: "Lhama das Nuvens", raridade: "Raro", descricao: "Fofa e tranquila", nivel: 2 },
  { emoji: "🦒🌟", nome: "Girafa Estelar", raridade: "Raro", descricao: "Pescoço alcança as estrelas", nivel: 2 },
  { emoji: "🐘🌀", nome: "Elefante Místico", raridade: "Raro", descricao: "Sábio e ancestral", nivel: 2 },
  
  // ÉPICOS (Nível 3) - 25%
  { emoji: "🦄🌈", nome: "Unicórnio Arco-Íris", raridade: "Épico", descricao: "Mágico e colorido", nivel: 3 },
  { emoji: "🐲☁️", nome: "Dragão das Nuvens", raridade: "Épico", descricao: "Voa entre as montanhas", nivel: 3 },
  { emoji: "🦕🌋", nome: "Brontossauro Vulcânico", raridade: "Épico", descricao: "Herbívoro pré-histórico", nivel: 3 },
  { emoji: "🦖🦴", nome: "T-Rex Alpha", raridade: "Épico", descricao: "Rei dos dinossauros", nivel: 3 },
  { emoji: "🧚✨", nome: "Fada dos Desejos", raridade: "Épico", descricao: "Concede desejos", nivel: 3 },
  { emoji: "🧜🌊", nome: "Sereia dos Abismos", raridade: "Épico", descricao: "Rainha dos mares", nivel: 3 },
  { emoji: "🦇🌑", nome: "Morcego Vampiro", raridade: "Épico", descricao: "Lorde da noite", nivel: 3 },
  { emoji: "🐉🌀", nome: "Serpente Alada", raridade: "Épico", descricao: "Mítica e poderosa", nivel: 3 },
  { emoji: "🦢👑", nome: "Cisne Real", raridade: "Épico", descricao: "Elegante e majestoso", nivel: 3 },
  { emoji: "🦥🍃", nome: "Preguiça Mágica", raridade: "Épico", descricao: "Lenta mas encantada", nivel: 3 },
  { emoji: "🦔🌀", nome: "Ouriço Teletransportador", raridade: "Épico", descricao: "Se enrola e desaparece", nivel: 3 },
  { emoji: "🦘🌌", nome: "Canguru Dimensional", raridade: "Épico", descricao: "Pula entre dimensões", nivel: 3 },
  { emoji: "🐋🌊", nome: "Cachalote Ancestral", raridade: "Épico", descricao: "Gigante dos abismos", nivel: 3 },
  { emoji: "🦭❄️", nome: "Foca Glacial", raridade: "Épico", descricao: "Dança sob a aurora boreal", nivel: 3 },
  { emoji: "🦏💎", nome: "Rinoceronte Cristal", raridade: "Épico", descricao: "Chifre de cristal puro", nivel: 3 },
  { emoji: "🦁🔥", nome: "Leão Flamejante", raridade: "Épico", descricao: "Juba de fogo eterno", nivel: 3 },
  { emoji: "🐅⚡", nome: "Tigre Trovejante", raridade: "Épico", descricao: "Rugido que ecoa como trovão", nivel: 3 },
  { emoji: "🦅🌪️", nome: "Águia Tempestade", raridade: "Épico", descricao: "Asas que controlam ventos", nivel: 3 },
  { emoji: "🦉📚", nome: "Coruja da Sabedoria", raridade: "Épico", descricao: "Conhece todos os segredos", nivel: 3 },
  { emoji: "🐍💎", nome: "Serpente de Cristal", raridade: "Épico", descricao: "Escamas de diamante puro", nivel: 3 },
  { emoji: "🦄🌟", nome: "Unicórnio Estelar", raridade: "Épico", descricao: "Cavalgando pelas estrelas", nivel: 3 },
  { emoji: "🐲🔥", nome: "Dragão de Fogo", raridade: "Épico", descricao: "Cuspe de chamas eternas", nivel: 3 },
  { emoji: "🦕🌌", nome: "Dinossauro Cósmico", raridade: "Épico", descricao: "Viajante do tempo", nivel: 3 },
  { emoji: "🧜♀️🌙", nome: "Sereia Lunar", raridade: "Épico", descricao: "Canta sob o luar", nivel: 3 },
  
  // LENDÁRIOS (Nível 4) - 15%
  { emoji: "🌟🔥", nome: "Fênix Renascida", raridade: "Lendário", descricao: "Renasce das cinzas", nivel: 4 },
  { emoji: "☄️👑", nome: "Qilin Real", raridade: "Lendário", descricao: "Criatura celestial", nivel: 4 },
  { emoji: "🔱🌊", nome: "Kraken Milenar", raridade: "Lendário", descricao: "Lenda dos mares", nivel: 4 },
  { emoji: "🎭🦁", nome: "Griffo Dourado", raridade: "Lendário", descricao: "Metade águia, metade leão", nivel: 4 },
  { emoji: "🌌🐕", nome: "Cérbero Infernal", raridade: "Lendário", descricao: "Guardião do submundo", nivel: 4 },
  { emoji: "🗿🌋", nome: "Golem de Lava", raridade: "Lendário", descricao: "Feito de rocha vulcânica", nivel: 4 },
  { emoji: "🌠🦄", nome: "Pégaso Celestial", raridade: "Lendário", descricao: "Cavalo alado divino", nivel: 4 },
  { emoji: "🧿🐍", nome: "Basilisco Ancestral", raridade: "Lendário", descricao: "Olhar petrificante", nivel: 4 },
  { emoji: "🌀🧜", nome: "Sereia Tempestade", raridade: "Lendário", descricao: "Controla mares e tempestades", nivel: 4 },
  { emoji: "🌑🐺", nome: "Lobisomem Alpha", raridade: "Lendário", descricao: "Transforma na lua cheia", nivel: 4 },
  { emoji: "🧬🐲", nome: "Quimera Primordial", raridade: "Lendário", descricao: "Leão, cabra e serpente em um", nivel: 4 },
  { emoji: "💎🐉", nome: "Dragão de Cristal", raridade: "Lendário", descricao: "Feito de gemas preciosas", nivel: 4 },
  { emoji: "🌪️🦅", nome: "Roc Gigante", raridade: "Lendário", descricao: "Pássaro gigante das lendas", nivel: 4 },
  { emoji: "🔥👹", nome: "Ifrit das Areias", raridade: "Lendário", descricao: "Espírito de fogo do deserto", nivel: 4 },
  { emoji: "❄️👸", nome: "Yeti das Montanhas", raridade: "Lendário", descricao: "Gigante das neves eternas", nivel: 4 },
  { emoji: "🌙🦊", nome: "Kitsune Celestial", raridade: "Lendário", descricao: "Raposa de nove caudas", nivel: 4 },
  { emoji: "⚡🐲", nome: "Dragão do Trovão", raridade: "Lendário", descricao: "Senhor das tempestades", nivel: 4 },
  { emoji: "🌊🐉", nome: "Dragão Marinho", raridade: "Lendário", descricao: "Governa os oceanos", nivel: 4 },
  { emoji: "🍃🦌", nome: "Cervo da Eternidade", raridade: "Lendário", descricao: "Vive milhares de anos", nivel: 4 },
  
  // DEUSES (Nível 5) - 4%
  { emoji: "⚡🌩️", nome: "Thor, Deus do Trovão", raridade: "Deus", descricao: "Portador do Mjolnir", nivel: 5 },
  { emoji: "🌊🔱", nome: "Poseidon, Rei dos Mares", raridade: "Deus", descricao: "Controla oceanos", nivel: 5 },
  { emoji: "🔥🏺", nome: "Hefesto, Ferreiro Divino", raridade: "Deus", descricao: "Forja armas divinas", nivel: 5 },
  { emoji: "🌞🏹", nome: "Apolo, Deus do Sol", raridade: "Deus", descricao: "Arqueiro celestial", nivel: 5 },
  { emoji: "🌙🏹", nome: "Ártemis, Caçadora Lunar", raridade: "Deus", descricao: "Protetora dos animais", nivel: 5 },
  { emoji: "🍇🍷", nome: "Dionísio, Deus do Vinho", raridade: "Deus", descricao: "Festa e celebração", nivel: 5 },
  { emoji: "💘🏹", nome: "Eros, Deus do Amor", raridade: "Deus", descricao: "Flechas do amor", nivel: 5 },
  { emoji: "🦉📜", nome: "Atena, Deusa da Sabedoria", raridade: "Deus", descricao: "Estratégia e conhecimento", nivel: 5 },
  { emoji: "⚔️🛡️", nome: "Ares, Deus da Guerra", raridade: "Deus", descricao: "Batalha e conflito", nivel: 5 },
  { emoji: "💎🌾", nome: "Deméter, Deusa da Colheita", raridade: "Deus", descricao: "Agricultura e fertilidade", nivel: 5 },
  { emoji: "❤️🏛️", nome: "Hera, Rainha dos Deuses", raridade: "Deus", descricao: "Matrimônio e família", nivel: 5 },
  { emoji: "☠️⚰️", nome: "Hades, Senhor do Submundo", raridade: "Deus", descricao: "Riqueza e mortos", nivel: 5 },
  { emoji: "🌈🕊️", nome: "Íris, Mensageira Divina", raridade: "Deus", descricao: "Arco-íris e mensagens", nivel: 5 },
  { emoji: "🌅🍃", nome: "Eos, Deusa do Amanhecer", raridade: "Deus", descricao: "Aurora e renovação", nivel: 5 },
  { emoji: "🎭🎪", nome: "Dionísio, Deus do Teatro", raridade: "Deus", descricao: "Festa e celebração", nivel: 5 },
  { emoji: "💎🏛️", nome: "Plutão, Deus das Riquezas", raridade: "Deus", descricao: "Riquezas subterrâneas", nivel: 5 },
  { emoji: "🌙🌌", nome: "Nyx, Deusa da Noite", raridade: "Deus", descricao: "Mãe da escuridão", nivel: 5 },
  { emoji: "🌅🌊", nome: "Hemera, Deusa do Dia", raridade: "Deus", descricao: "Filha da luz", nivel: 5 },
  { emoji: "🌀🌪️", nome: "Éolo, Deus dos Ventos", raridade: "Deus", descricao: "Controla as tempestades", nivel: 5 },
  
  // MEMES/BRAINROT (Nível Especial) - 1%
  { emoji: "🐄🪐", nome: "Vaca Saturno", raridade: "Brainrot", descricao: "Vaca cósmica que produz leite de estrelas", nivel: 99 },
  { emoji: "🌌👽", nome: "Saturnita", raridade: "Brainrot", descricao: "Alienígena dos anéis de Saturno", nivel: 99 },
  { emoji: "🎵🎶", nome: "Tralalerotralala", raridade: "Brainrot", descricao: "Criatura musical que não para de cantar", nivel: 99 },
  { emoji: "💀☠️", nome: "Eternal Suffering", raridade: "Brainrot", descricao: "A personificação do sofrimento infinito", nivel: 99 },
  { emoji: "🍌🐒", nome: "Macaco da Banana", raridade: "Brainrot", descricao: "Só pensa em bananas 24/7", nivel: 99 },
  { emoji: "🦆🍞", nome: "Pato de Pão", raridade: "Brainrot", descricao: "Alimentado exclusivamente com pão", nivel: 99 },
  { emoji: "🐸🍵", nome: "Sapo do Chá", raridade: "Brainrot", descricao: "Sapo que vive em xícaras de chá", nivel: 99 },
  { emoji: "🦀🦀", nome: "Caranguejo Dançante", raridade: "Brainrot", descricao: "Só sabe dançar sideways", nivel: 99 },
  { emoji: "🥔🐦", nome: "Pombo da Batata", raridade: "Brainrot", descricao: "Pombo que carrega batatas", nivel: 99 },
  { emoji: "🍕🐊", nome: "Jacaré Pizza", raridade: "Brainrot", descricao: "Jacaré que só come pizza", nivel: 99 },
  { emoji: "🤖🐔", nome: "Galinha Robô", raridade: "Brainrot", descricao: "Galinha do futuro", nivel: 99 },
  { emoji: "🛸🐑", nome: "Ovelha Alien", raridade: "Brainrot", descricao: "Ovelha de outro planeta", nivel: 99 },
  { emoji: "🍣🐈", nome: "Gato Sushi", raridade: "Brainrot", descricao: "Gato que vira sushi", nivel: 99 },
  { emoji: "🎮🐁", nome: "Rato Gamer", raridade: "Brainrot", descricao: "Rato que joga videogame", nivel: 99 },
  { emoji: "☕🦉", nome: "Coruja Cafeinada", raridade: "Brainrot", descricao: "Coruja que não dorme", nivel: 99 },
  
  // SUPREMOS (Nível 100 - Apenas para o Deus dos Animais)
  { emoji: "🌌🐉", nome: "Dragão Cósmico", raridade: "Supremo", descricao: "Existe além do tempo e espaço", nivel: 100 },
  { emoji: "⚡🦁", nome: "Leão Celestial", raridade: "Supremo", descricao: "Ruge e cria novas galáxias", nivel: 100 },
  { emoji: "🌠🐺", nome: "Lobo Estelar", raridade: "Supremo", descricao: "Corre através das nebulosas", nivel: 100 },
  { emoji: "♾️🦅", nome: "Águia Infinita", raridade: "Supremo", descricao: "Enxerga todos os universos", nivel: 100 },
  { emoji: "💫🐍", nome: "Serpente Quântica", raridade: "Supremo", descricao: "Morde sua própria cauda em todas as dimensões", nivel: 100 },
  { emoji: "🌀🦄", nome: "Unicórnio Dimensional", raridade: "Supremo", descricao: "Chifre que perfura realidades", nivel: 100 },
  { emoji: "🌑🌕", nome: "Lua Solar", raridade: "Supremo", descricao: "Eclipse eterno", nivel: 100 },
  { emoji: "⚡🌊", nome: "Tempestade Cósmica", raridade: "Supremo", descricao: "Raios e marés intergalácticos", nivel: 100 },
  { emoji: "🌟🌙", nome: "Estrela Cadente", raridade: "Supremo", descricao: "Brilha mais que mil sóis", nivel: 100 },
  { emoji: "🌀🐉", nome: "Dragão do Vortex", raridade: "Supremo", descricao: "Controla buracos negros", nivel: 100 },
  { emoji: "🌌🧿", nome: "Olho Cósmico", raridade: "Supremo", descricao: "Vê através de todas as dimensões", nivel: 100 },
  { emoji: "⚡🔱", nome: "Tridente Celestial", raridade: "Supremo", descricao: "Forjado nas estrelas", nivel: 100 },
  { emoji: "🌠👑", nome: "Monarca Estelar", raridade: "Supremo", descricao: "Rei de todas as galáxias", nivel: 100 },
  { emoji: "♾️🐲", nome: "Dragão Infinito", raridade: "Supremo", descricao: "Sem começo nem fim", nivel: 100 },
  { emoji: "💫🌟", nome: "Nebulosa Viva", raridade: "Supremo", descricao: "Consciência estelar", nivel: 100 }
];

// Sistema de raridade com probabilidades aumentadas
const RARITY_CHANCES = {
  "Comum": 30,
  "Raro": 25, 
  "Épico": 25,
  "Lendário": 15,
  "Deus": 4,
  "Brainrot": 1
};

// Cores para embed de acordo com a raridade
const RARITY_COLORS = {
  "Comum": "#808080",
  "Raro": "#0070DD", 
  "Épico": "#A335EE",
  "Lendário": "#FF8000",
  "Deus": "#E6CC80",
  "Brainrot": "#00FF00",
  "Supremo": "#FF0000"
};

// Cooldown para usuários normais (15 segundos)
const NORMAL_COOLDOWN = 15;
const userCooldowns = new Map();

// Caminho do arquivo de salvamento
const PETS_DATA_PATH = path.join(BASE_DIR, 'pets_data.json');

// Carregar dados salvos ou criar arquivo se não existir
let petsData = {};
try {
  if (fs.existsSync(PETS_DATA_PATH)) {
    const data = fs.readFileSync(PETS_DATA_PATH, 'utf8');
    petsData = JSON.parse(data);
  } else {
    // Criar arquivo se não existir
    fs.writeFileSync(PETS_DATA_PATH, JSON.stringify({}, null, 2));
    console.log('Arquivo de pets criado:', PETS_DATA_PATH);
  }
} catch (error) {
  console.error('Erro ao carregar dados dos pets:', error);
  // Criar arquivo vazio se houver erro
  petsData = {};
  fs.writeFileSync(PETS_DATA_PATH, JSON.stringify({}, null, 2));
}

// Função para salvar dados
function savePetsData() {
  try {
    fs.writeFileSync(PETS_DATA_PATH, JSON.stringify(petsData, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados dos pets:', error);
  }
}

// Função para adicionar pet ao usuário
function addPetToUser(userId, pet, senderName) {
  if (!petsData[userId]) {
    petsData[userId] = {
      username: senderName || `@${userId}`,
      pets: [],
      total: 0,
      rareCount: 0,
      lastPetTime: Date.now()
    };
  } else {
    // Atualizar nome se necessário
    if (senderName && petsData[userId].username !== senderName) {
      petsData[userId].username = senderName;
    }
  }
  
  petsData[userId].pets.push({
    emoji: pet.emoji,
    nome: pet.nome,
    raridade: pet.raridade,
    descricao: pet.descricao,
    nivel: pet.nivel,
    obtained: new Date().toISOString()
  });
  
  petsData[userId].total++;
  
  if (pet.raridade !== "Comum") {
    petsData[userId].rareCount++;
  }
  
  petsData[userId].lastPetTime = Date.now();
  savePetsData();
}

// Função para verificar cooldown
function checkCooldown(userId) {
  const now = Date.now();
  const lastTime = userCooldowns.get(userId) || 0;
  const cooldownTime = VIP_USERS.includes(userId) || userId === DEUS_DOS_ANIMAIS ? 0 : NORMAL_COOLDOWN * 1000;
  
  if (now - lastTime < cooldownTime) {
    return Math.ceil((cooldownTime - (now - lastTime)) / 1000);
  }
  
  return 0;
}

// Função para atualizar cooldown
function updateCooldown(userId) {
  userCooldowns.set(userId, Date.now());
}

module.exports = {
  name: "pet",
  description: "🎁 Adquire um pet aleatório com diferentes raridades",
  commands: ["pet", "meupet", "adotar", "getpet"],
  usage: `${PREFIX}pet [info|meuspets|rank]`,
  cooldown: 15,

  handle: async ({ sendText, sendReply, userJid, args, senderName }) => {
    const userId = userJid.replace(/@.+/, "");
    const command = args[0]?.toLowerCase();
    const userMention = `@${userId}`;
    
    // Comando para ver informações detalhadas
    if (command === "info") {
      return sendText(`
📋 *SISTEMA DE PETS* 📋

🎲 *Como funciona:*
• Use ${PREFIX}pet para ganhar um pet aleatório
• Cada pet tem uma raridade diferente
• Use ${PREFIX}pet meuspets para ver sua coleção
• Use ${PREFIX}pet rank para ver o ranking de colecionadores

🏆 *Raridades:*
• Comum (30%) - Nível 1
• Raro (25%) - Nível 2  
• Épico (25%) - Nível 3
• Lendário (15%) - Nível 4
• Deus (4%) - Nível 5
• Brainrot (1%) - Nível Especial

⭐ *Usuários VIP:* 
Sem delay e chances melhoradas!

👑 *Deus dos Animais:* 
Apenas pets Supremos!

✨ Colecione todos e construa seu zoológico!
      `);
    }
    
    // Comando para ver os pets do usuário
    if (command === "meuspets" || command === "mypets") {
      if (!petsData[userId] || petsData[userId].pets.length === 0) {
        return sendReply(
          `📭 ${userMention}, você ainda não possui pets!\n` +
          `Use *${PREFIX}pet* para adquirir seu primeiro pet.`,
          [userJid]
        );
      }
      
      const userData = petsData[userId];
      const totalPets = userData.pets.length;
      
      let message = `📘 *Coleção de Pets de ${userData.username}*\n\n`;
      message += `📊 Total: ${userData.total} pets | Raros: ${userData.rareCount}\n\n`;
      
      // Agrupar pets por raridade
      const petsPorRaridade = {};
      userData.pets.forEach(pet => {
        if (!petsPorRaridade[pet.raridade]) {
          petsPorRaridade[pet.raridade] = [];
        }
        petsPorRaridade[pet.raridade].push(pet);
      });
      
      // Ordenar por raridade (da mais rara para a mais comum)
      const ordemRaridades = ["Supremo", "Brainrot", "Deus", "Lendário", "Épico", "Raro", "Comum"];
      
      ordemRaridades.forEach(raridade => {
        if (petsPorRaridade[raridade]) {
          message += `*${raridade}s:* (${petsPorRaridade[raridade].length})\n`;
          
          petsPorRaridade[raridade].forEach((pet, index) => {
            if (index < 15) { // Limite para não ficar muito grande
              message += `${pet.emoji} ${pet.nome} - Nv.${pet.nivel}\n`;
            }
          });
          
          if (petsPorRaridade[raridade].length > 15) {
            message += `...e mais ${petsPorRaridade[raridade].length - 15}\n`;
          }
          
          message += "\n";
        }
      });
      
      message += `⏰ Último pet: ${new Date(userData.lastPetTime).toLocaleDateString('pt-BR')}`;
      
      return sendReply(message, [userJid]);
    }
    
    // Comando para ver o ranking
    if (command === "rank" || command === "ranking") {
      const users = Object.values(petsData);
      
      if (users.length === 0) {
        return sendReply(
          "📊 Ninguém possui pets ainda! Seja o primeiro a usar *!pet*",
          [userJid]
        );
      }
      
      // Ordenar por total de pets (decrescente)
      users.sort((a, b) => b.total - a.total);
      
      let rankMessage = "🏆 *RANKING DE COLECIONADORES DE PETS* 🏆\n\n";
      
      for (let i = 0; i < Math.min(10, users.length); i++) {
        const user = users[i];
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}°`;
        
        rankMessage += `${medal} ${user.username} - ${user.total} pets (${user.rareCount} raros)\n`;
      }
      
      // Ver posição do usuário atual
      const userIndex = users.findIndex(u => u.username === (senderName || userMention));
      if (userIndex !== -1) {
        rankMessage += `\n📍 Sua posição: ${userIndex + 1}° lugar`;
      } else {
        rankMessage += `\n📍 Você ainda não está no ranking. Use *${PREFIX}pet*!`;
      }
      
      return sendReply(rankMessage, [userJid]);
    }
    
    // Verificar cooldown para usuários normais
    const cooldownLeft = checkCooldown(userId);
    if (cooldownLeft > 0) {
      return sendReply(
        `⏰ ${userMention}, aguarde ${cooldownLeft} segundos para usar o pet novamente!`,
        [userJid]
      );
    }
    
    // Verificar se é o Deus dos Animais
    const isDeusDosAnimais = userId === DEUS_DOS_ANIMAIS;
    
    // Verificar se é usuário VIP
    const isVip = VIP_USERS.includes(userId);
    
    let petEscolhido;
    
    if (isDeusDosAnimais) {
      // Deus dos Animais só recebe pets supremos
      const supremos = PETS.filter(pet => pet.raridade === "Supremo");
      petEscolhido = supremos[Math.floor(Math.random() * supremos.length)];
    } 
    else if (isVip) {
      // VIPs têm chances melhoradas
      const roll = Math.random() * 100;
      let rarityToGet = "";

      if (roll <= 10) rarityToGet = "Deus";
      else if (roll <= 25) rarityToGet = "Lendário";
      else if (roll <= 50) rarityToGet = "Épico";
      else if (roll <= 75) rarityToGet = "Raro";
      else rarityToGet = "Comum";

      const petsFiltrados = PETS.filter(pet => pet.raridade === rarityToGet);
      petEscolhido = petsFiltrados[Math.floor(Math.random() * petsFiltrados.length)];
    } 
    else {
      // Sistema de rolagem normal para outros usuários
      const roll = Math.random() * 100;
      let rarityToGet = "";

      if (roll <= RARITY_CHANCES.Deus) rarityToGet = "Deus";
      else if (roll <= RARITY_CHANCES.Lendário + RARITY_CHANCES.Deus) rarityToGet = "Lendário";
      else if (roll <= RARITY_CHANCES.Épico + RARITY_CHANCES.Lendário + RARITY_CHANCES.Deus) rarityToGet = "Épico";
      else if (roll <= RARITY_CHANCES.Raro + RARITY_CHANCES.Épico + RARITY_CHANCES.Lendário + RARITY_CHANCES.Deus) rarityToGet = "Raro";
      else rarityToGet = "Comum";

      const petsFiltrados = PETS.filter(pet => pet.raridade === rarityToGet);
      petEscolhido = petsFiltrados[Math.floor(Math.random() * petsFiltrados.length)];
    }
    
    // Adicionar pet ao usuário
    addPetToUser(userId, petEscolhido, senderName || userMention);
    
    // Atualizar cooldown
    updateCooldown(userId);
    
    // Mensagens especiais para raridades altas
    let mensagemEspecial = "";
    if (petEscolhido.raridade === "Supremo") {
      mensagemEspecial = "🌌 *PODER CÓSMICO!* O Deus dos Animais abençoou você com uma criatura além da compreensão mortal! ";
    } 
    else if (petEscolhido.raridade === "Deus") {
      mensagemEspecial = "✨ *BENÇÃO DIVINA!* Um ser divino decidiu acompanhá-lo! ";
    }
    else if (petEscolhido.raridade === "Lendário") {
      mensagemEspecial = "🎉 *LENDA VIVA!* Você acaba de encontrar uma criatura lendária! ";
    } 
    else if (petEscolhido.raridade === "Épico") {
      mensagemEspecial = "🎊 *SORTE ÉPICA!* Uma criatura épica apareceu! ";
    }
    else if (petEscolhido.raridade === "Brainrot") {
      mensagemEspecial = "🧠 *CRIATURA ENCEREBRADA!* Você encontrou um ser de puro brainrot! ";
    }
    
    // Status VIP/Deus
    let statusMessage = "";
    if (isDeusDosAnimais) {
      statusMessage = `👑 *Status:* Deus dos Animais | *Delay:* Sem delay`;
    } else if (isVip) {
      statusMessage = `⭐ *Status:* VIP | *Delay:* Sem delay`;
    } else {
      statusMessage = `📊 *Status:* Normal | *Delay:* 15s`;
    }
    
    // Enviar mensagem com o pet
    await sendReply(
      `${mensagemEspecial}\n` +
      `🎁 ${userMention}, você ganhou um novo pet:\n` +
      `${petEscolhido.emoji} *${petEscolhido.nome}* (${petEscolhido.raridade})\n` +
      `📝 _${petEscolhido.descricao}_\n\n` +
      `📊 *Raridade:* ${petEscolhido.raridade} | *Nível:* ${petEscolhido.nivel}\n` +
      `${statusMessage}\n` +
      `🎯 Use *${PREFIX}pet meuspets* para ver sua coleção!`,
      [userJid],
      RARITY_COLORS[petEscolhido.raridade]
    );
  },
};
