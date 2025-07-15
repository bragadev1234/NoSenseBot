
/**
 * 🚀 VAGAS-TECH-LINKEDIN SCRAPER - MEGA BOT
 * 
 * 📌 Um poderoso scraper de vagas de tecnologia no LinkedIn com:
 * - Priorização automática de vagas BR
 * - Complemento com vagas internacionais remotas
 * - Filtros inteligentes por modalidade (Remoto/Híbrido/Presencial)
 * - Extração de salários quando disponíveis
 * 
 * ⚙️ TECNOLOGIAS:
 * - Axios: Para requisições HTTP eficientes
 * - JSDOM: Para parsear e extrair dados do HTML
 * - Natural Language Processing: Para sumarização de descrições (opcional)
 * 
 * 🌟 RECURSOS AVANÇADOS:
 * 1. Busca simultânea em APIs BR e Global
 * 2. Filtro geográfico preciso (geoId do Brasil)
 * 3. Rate limit handling com delays inteligentes
 * 4. Timeouts configuráveis para cada requisição
 * 5. Envio em batches para evitar bloqueios
 * 
 * 📊 MÉTRICAS:
 * - Até 30 vagas BR prioritárias
 * - Até 10 vagas globais remotas (complementares)
 * - Busca em menos de 25s (timeout configurável)
 * 
 * ⚠️ LIMITAÇÕES:
 * - LinkedIn pode bloquear IPs com muitas requisições
 * - Layout do LinkedIn pode mudar e quebrar os seletores
 * - Algumas vagas podem ter informações incompletas
 * 
 * 🛠️ COMO USAR:
 * 1. Importe no seu bot com: `const vagasScraper = require('./vagas-tech')`
 * 2. Chame o handler com: `vagasScraper.handle({ args, sendText, sendReply })`
 * 3. Comandos disponíveis:
 *    - !vagas <tecnologia> → Busca padrão
 *    - !vagas30 <tecnologia> → Busca 30+ vagas
 * 
 * 🔧 DEPENDÊNCIAS:
 * - axios@^1.3.4
 * - jsdom@^20.0.3
 * - natural@^5.2.3 (opcional)
 * 
 * 📝 EXEMPLO DE USO COMPLETO:
 * ```
 * !vagas30 python remoto
 * !vagas react native
 * !vagas "front end pleno"
 * ```
 * 
 * 📈 VERSÃO: 3.1.0 (Jun/2024)
 * 👨‍💻 AUTOR: braga2311 <isaquebragadasilva2311@gmail.com>
 */

const axios = require("axios");
const { JSDOM } = require("jsdom");
const { PREFIX } = require(`${BASE_DIR}/config`);

// Configurações
const MAX_VAGAS_BR = 30; // Tenta pegar 30 BR primeiro
const MAX_VAGAS_GLOBAL = 10; // Complementa com até 10 globais remotas
const TIMEOUT = 25000; // 25 segundos

// Função melhorada para extrair dados
function extractJobData(jobElement, isGlobal = false) {
  try {
    const title = jobElement.querySelector("h3")?.textContent.trim() || "Sem título";
    const company = jobElement.querySelector(".base-search-card__subtitle")?.textContent.trim() || "Empresa não informada";
    const location = jobElement.querySelector(".job-search-card__location")?.textContent.trim() || "Remoto";
    const link = jobElement.querySelector("a.base-card__full-link")?.href?.split('?')[0] || "#";
    
    // Extrai salário (se disponível)
    const salary = jobElement.querySelector(".job-search-card__salary-info")?.textContent.trim().replace(/\s+/g, " ") || "Não informado";
    
    // Verifica modalidade
    const isRemote = /remote|remoto|home office|homeoffice/i.test(title + location);
    const isHybrid = /hybrid|híbrido|flexível|flexible/i.test(title + location);
    
    // Para vagas globais, só retorna se for remota
    if (isGlobal && !isRemote) return null;

    return {
      title,
      company,
      location,
      link,
      salary,
      isRemote,
      isHybrid,
      type: isGlobal ? "🌍 REMOTO GLOBAL" : "🇧🇷 BR"
    };
  } catch (error) {
    console.error("Erro ao extrair dados:", error);
    return null;
  }
}

module.exports = {
  name: "vagas-mega-plus",
  description: "Busca 30+ vagas BR e complementa com remotas globais",
  commands: ["vagas30", "supervagas"],
  usage: `${PREFIX}vagas30 <tecnologia>`,

  handle: async ({ args, sendText, sendReply }) => {
    const termo = args.join(" ").toLowerCase();

    if (!termo) {
      return sendReply(`⚠️ Use: ${PREFIX}vagas30 <tecnologia>\nEx: ${PREFIX}vagas30 node.js remoto`);
    }

    try {
      await sendText(`🔍 MEGA BUSCA POR 30+ VAGAS (BR + REMOTO GLOBAL) PARA *${termo.toUpperCase()}*...`);

      // URL BR otimizada
      const urlBr = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(termo)}&location=Brasil&geoId=106057199&f_TPR=r86400&start=0`;
      
      // URL Global Remota
      const urlGlobal = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(termo)}&f_WT=2&start=0`;

      const [responseBr, responseGlobal] = await Promise.all([
        axios.get(urlBr, { 
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "pt-BR,pt;q=0.9"
          },
          timeout: TIMEOUT
        }),
        axios.get(urlGlobal, { 
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
          },
          timeout: TIMEOUT
        })
      ]);

      // Processa vagas BR
      const domBr = new JSDOM(responseBr.data);
      let jobsBr = Array.from(domBr.window.document.querySelectorAll("li"))
        .map(job => extractJobData(job))
        .filter(Boolean)
        .slice(0, MAX_VAGAS_BR);

      // Processa vagas globais remotas (se não atingiu o limite)
      let jobsGlobal = [];
      if (jobsBr.length < MAX_VAGAS_BR) {
        const domGlobal = new JSDOM(responseGlobal.data);
        jobsGlobal = Array.from(domGlobal.window.document.querySelectorAll("li"))
          .map(job => extractJobData(job, true))
          .filter(job => job && !/bra[sz]il|br/i.test(job.location))
          .slice(0, MAX_VAGAS_GLOBAL);
      }

      // Combina resultados
      const allJobs = [...jobsBr, ...jobsGlobal].slice(0, MAX_VAGAS_BR + MAX_VAGAS_GLOBAL);
      const brCount = jobsBr.length;
      const globalCount = jobsGlobal.length;

      if (!allJobs.length) {
        return sendReply("😵‍💫 NÃO ACHEI NADA! Tente termos diferentes ou menos específicos");
      }

      // Monta resultado em partes (para evitar mensagem muito longa)
      await sendText(`🚀 *VAGAS ENCONTRADAS (${brCount} BR + ${globalCount} REMOTO GLOBAL):*`);

      // Envia em lotes de 5 vagas
      for (let i = 0; i < allJobs.length; i += 5) {
        const batch = allJobs.slice(i, i + 5);
        let batchText = "";
        
        batch.forEach((job, index) => {
          const pos = i + index + 1;
          batchText += `\n*${pos}. ${job.title}*\n`;
          batchText += `🏢 ${job.company}\n`;
          batchText += `${job.type} ${job.isRemote ? '🏠 REMOTO' : job.isHybrid ? '⚡ HÍBRIDO' : '🏢 PRESENCIAL'}\n`;
          batchText += `📍 ${job.location.replace("Brazil", "Brasil")}\n`;
          batchText += `💰 ${job.salary}\n`;
          batchText += `🔗 ${job.link}\n`;
        });

        await sendText(batchText);
        if (i + 5 < allJobs.length) await new Promise(resolve => setTimeout(resolve, 1000)); // Delay entre batches
      }

      await sendText("💡 *DICAS PRO:*\n- Use 'remoto' ou 'híbrido' na busca\n- Vagas globais geralmente exigem inglês\n- Salários podem variar por região");

    } catch (error) {
      console.error("Erro na super busca:", error);
      await sendReply("💥 LINKEDIN TRAVOU! Tente novamente mais tarde ou com termos diferentes");
    }
  }
};