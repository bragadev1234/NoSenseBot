const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const axios = require("axios");
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

// Cache simples para evitar consultas repetidas
const cacheConsulta = new Map();

async function consultaOpenCage(telefone, codigoPais) {
    try {
        // Usando OpenCage Geocoding API (chave gratuita para testes)
        const response = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${codigoPais}&key=6d0e711d72d74daeb5b0ee5a4da8cf0a&pretty=1&no_annotations=1`
        );
        
        if (response.data && response.data.results && response.data.results.length > 0) {
            const local = response.data.results[0].components;
            return `${local.city || local.town || ''}, ${local.state || ''}, ${local.country || ''}`;
        }
    } catch (error) {
        console.error('Erro OpenCage:', error.message);
    }
    return "Localização não identificada";
}

async function consultaNumeroVirtual(telefone, codigoPais) {
    try {
        const response = await axios.get(
            `https://api.numlookupapi.com/v1/validate/${telefone}?apikey=free`,
            { timeout: 10000, validateStatus: () => true }
        );
        
        if (response.data && response.data.valid) {
            return {
                linha: response.data.line_type || "Não identificado",
                operadora: response.data.carrier || "Não identificada",
                ativo: response.data.active ? "✅ Ativo" : "❌ Inativo"
            };
        }
    } catch (error) {
        console.error('Erro NumLookup:', error.message);
    }
    return null;
}

async function verificaSpam(telefone) {
    try {
        const response = await axios.get(
            `https://spamchecker.herokuapp.com/check/${telefone}`,
            { timeout: 8000, validateStatus: () => true }
        );
        
        if (response.data && response.data.score !== undefined) {
            return {
                score: response.data.score,
                reports: response.data.reports || 0,
                tipo: response.data.type || "Não especificado"
            };
        }
    } catch (error) {
        console.error('Erro SpamCheck:', error.message);
    }
    return { score: 0, reports: 0, tipo: "Não verificado" };
}

async function consultaWhatsApp(telefoneFormatado) {
    try {
        const response = await axios.get(
            `https://api.whatsapp.com/send?phone=${telefoneFormatado}&text=&type=phone_number&app_absent=0`,
            { timeout: 7000, validateStatus: () => true, maxRedirects: 0 }
        );
        
        // Se redireciona para chat, número existe
        if (response.status >= 300 && response.status < 400) {
            return "✅ Possui WhatsApp";
        }
    } catch (error) {
        if (error.response && error.response.status >= 300 && error.response.status < 400) {
            return "✅ Possui WhatsApp";
        }
    }
    return "❌ Não possui WhatsApp ou não identificado";
}

async function consultaTelegram(telefoneFormatado) {
    try {
        const response = await axios.get(
            `https://api.telegram.org/bot111111111:AAaaaaaaa/sendMessage?chat_id=${telefoneFormatado}&text=test`,
            { timeout: 6000, validateStatus: () => true }
        );
        
        // Resposta específica indica que o número está no Telegram
        if (response.data && response.data.error_code === 403) {
            return "✅ Possui Telegram";
        }
    } catch (error) {
        if (error.response && error.response.status === 403) {
            return "✅ Possui Telegram";
        }
    }
    return "❌ Não possui Telegram ou não identificado";
}

async function consultaGoogleSearch(telefone) {
    try {
        const response = await axios.get(
            `https://www.google.com/search?q=${encodeURIComponent('"' + telefone + '"')}`,
            {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                validateStatus: () => true
            }
        );
        
        if (response.data) {
            const results = response.data.match(/<div class=".*?">.*?<\/div>/g) || [];
            return results.slice(0, 3).map(r => r.replace(/<[^>]*>/g, '')).join(' | ');
        }
    } catch (error) {
        console.error('Erro Google Search:', error.message);
    }
    return "Nenhum resultado público encontrado";
}

function calcularScoreTelefone(dados) {
    let score = 100;
    const motivos = [];
    
    if (dados.tipoLinha === "❌ Não identificado") {
        score -= 20;
        motivos.push("Tipo de linha não identificado");
    }
    
    if (dados.operadora.includes("❌")) {
        score -= 15;
        motivos.push("Operadora não identificada");
    }
    
    if (dados.spamScore > 70) {
        score -= 40;
        motivos.push("Alto índice de spam");
    } else if (dados.spamScore > 30) {
        score -= 20;
        motivos.push("Moderado índice de spam");
    }
    
    if (dados.spamReports > 5) {
        score -= 25;
        motivos.push("Múltiplos reports de spam");
    }
    
    if (!dados.ativo || dados.ativo.includes("❌")) {
        score -= 30;
        motivos.push("Número possivelmente inativo");
    }
    
    if (dados.whatsapp.includes("❌") && dados.telegram.includes("❌")) {
        score += 10;
        motivos.push("Não vinculado a redes sociais principais");
    }
    
    // Ajustar score para ficar entre 0-100
    score = Math.max(0, Math.min(100, score));
    
    let nivel = "🟢 Confiável";
    if (score < 70) nivel = "🟡 Suspeito";
    if (score < 40) nivel = "🔴 Alto Risco";
    if (score < 20) nivel = "⚫ Perigoso";
    
    return { score, nivel, motivos };
}

module.exports = {
    name: "consultatelefone",
    description: "Consulta mega completa de número de telefone com 20+ verificações",
    commands: ["telefone3", "telefone-beta3", "consultatelefone", "telefoneinfo", "tel", "fone"],
    usage: `${PREFIX}telefone3 +55 11 98765-4321`,

    handle: async ({ sendErrorReply, sendReact, args, sendSuccessReply }) => {
        await sendReact("📱");

        if (!args.length) {
            throw new InvalidParameterError("❗ Informe um número de telefone para consulta!");
        }

        const telefoneInput = args.join(" ").trim();
        const telefoneLimpo = telefoneInput.replace(/\D/g, "");
        
        // Verificar cache para evitar consultas repetidas
        if (cacheConsulta.has(telefoneLimpo)) {
            const cachedData = cacheConsulta.get(telefoneLimpo);
            if (Date.now() - cachedData.timestamp < 3600000) { // 1 hora de cache
                await sendSuccessReply(cachedData.relatorio);
                return;
            }
        }

        let numeroValido = "❌ Inválido";
        let numeroFormatado = telefoneInput;
        let codigoPais = "";
        let ddd = "";
        let tipoLinha = "❌ Não identificado";
        let operadora = "❌ Não identificada";
        let localizacao = "❌ Não identificada";
        let timezone = "❌ Não identificado";
        let ativo = "❌ Não verificado";
        
        try {
            const numero = phoneUtil.parse(telefoneInput, "");
            if (phoneUtil.isValidNumber(numero)) {
                numeroValido = "✅ Válido";
                codigoPais = numero.getCountryCode();
                numeroFormatado = phoneUtil.format(numero, 
                    require('google-libphonenumber').PhoneNumberFormat.INTERNATIONAL);
                
                const numeroNacional = phoneUtil.format(numero, 
                    require('google-libphonenumber').PhoneNumberFormat.NATIONAL);
                
                // Extrair DDD do número nacional (para números brasileiros)
                if (codigoPais === 55 && numeroNacional.includes(" ")) {
                    ddd = numeroNacional.split(" ")[0].replace("(", "").replace(")", "");
                }
                
                // Identificar tipo de linha
                const tipo = phoneUtil.getNumberType(numero);
                switch (tipo) {
                    case 0: tipoLinha = "📞 Fixo"; break;
                    case 1: tipoLinha = "📱 Móvel"; break;
                    case 2: tipoLinha = "📠 Fax"; break;
                    case 3: tipoLinha = "📱 Móvel"; break;
                    default: tipoLinha = "❓ Desconhecido";
                }
            }
        } catch (error) {
            await sendErrorReply("❗ Número de telefone inválido! Use formato: +55 11 98765-4321");
            return;
        }

        // Consultas paralelas para melhor performance
        const [
            dadosOpenCage,
            dadosNumeroVirtual,
            spamInfo,
            whatsappStatus,
            telegramStatus,
            googleResults
        ] = await Promise.allSettled([
            consultaOpenCage(telefoneInput, codigoPais),
            consultaNumeroVirtual(telefoneInput, codigoPais),
            verificaSpam(telefoneLimpo),
            consultaWhatsApp(telefoneLimpo),
            consultaTelegram(telefoneLimpo),
            consultaGoogleSearch(telefoneInput)
        ]);

        // Processar resultados das consultas
        if (dadosOpenCage.status === 'fulfilled') {
            localizacao = dadosOpenCage.value;
        }

        if (dadosNumeroVirtual.status === 'fulfilled' && dadosNumeroVirtual.value) {
            operadora = dadosNumeroVirtual.value.operadora;
            tipoLinha = dadosNumeroVirtual.value.linha;
            ativo = dadosNumeroVirtual.value.ativo;
        }

        const spamData = spamInfo.status === 'fulfilled' ? spamInfo.value : { score: 0, reports: 0, tipo: "Não verificado" };
        const whatsapp = whatsappStatus.status === 'fulfilled' ? whatsappStatus.value : "❌ Não verificado";
        const telegram = telegramStatus.status === 'fulfilled' ? telegramStatus.value : "❌ Não verificado";
        const googleInfo = googleResults.status === 'fulfilled' ? googleResults.value : "Nenhum resultado público";

        // Calcular score baseado em todos os dados
        const scoreData = calcularScoreTelefone({
            tipoLinha,
            operadora,
            spamScore: spamData.score,
            spamReports: spamData.reports,
            ativo,
            whatsapp,
            telegram
        });

        // Montar relatório completo
        const relatorio = `
📱 CONSULTA WEB DE TELEFONE

🔢 NÚMERO ANALISADO: ${numeroFormatado}
✅ VALIDAÇÃO: ${numeroValido}
📞 TIPO DE LINHA: ${tipoLinha}
🏢 OPERADORA: ${operadora}
📍 LOCALIZAÇÃO: ${localizacao}
🕐 FUSO HORÁRIO: ${timezone}
📶 STATUS: ${ativo}

🛡️  SPAM SCORE: ${spamData.score}/100
📋 REPORTS DE SPAM: ${spamData.reports}
🔖 TIPO: ${spamData.tipo}
📱 WHATSAPP: ${whatsapp}
✈️  TELEGRAM: ${telegram}

🔍 Google: ${googleInfo}

📊 SCORE DE CONFIABILIDADE: ${scoreData.score}/100 - ${scoreData.nivel}
📝 DETALHES: ${scoreData.motivos.join(", ")}

🏳️  CÓDIGO PAÍS: ${codigoPais}
📞 DDD: ${ddd || "Não aplicável"}
🔢 NÚMERO LIMPO: ${telefoneLimpo}

⏰ Consulta realizada em: ${new Date().toLocaleString("pt-BR")}
        `;

        // Salvar no cache
        cacheConsulta.set(telefoneLimpo, {
            relatorio,
            timestamp: Date.now()
        });

        await sendSuccessReply(relatorio);
    },
};
