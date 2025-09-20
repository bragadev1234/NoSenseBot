/** *
@author Braga
@version 2.0

Consulta CPF (MEC + Dataget + Scraping + Inferências + Análise Comportamental)
*/
const { PREFIX } = require(`${BASE_DIR}/config`);
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const moment = require("moment");

// --- Funções auxiliares expandidas ---
function calcularSigno(dia, mes) {
    const signos = [
        { nome: "Capricórnio", elemento: "Terra", regente: "Saturno", inicio: [12, 22], fim: [1, 20] },
        { nome: "Aquário", elemento: "Ar", regente: "Urano", inicio: [1, 21], fim: [2, 18] },
        { nome: "Peixes", elemento: "Água", regente: "Netuno", inicio: [2, 19], fim: [3, 20] },
        { nome: "Áries", elemento: "Fogo", regente: "Marte", inicio: [3, 21], fim: [4, 20] },
        { nome: "Touro", elemento: "Terra", regente: "Vênus", inicio: [4, 21], fim: [5, 20] },
        { nome: "Gêmeos", elemento: "Ar", regente: "Mercúrio", inicio: [5, 21], fim: [6, 20] },
        { nome: "Câncer", elemento: "Água", regente: "Lua", inicio: [6, 21], fim: [7, 22] },
        { nome: "Leão", elemento: "Fogo", regente: "Sol", inicio: [7, 23], fim: [8, 22] },
        { nome: "Virgem", elemento: "Terra", regente: "Mercúrio", inicio: [8, 23], fim: [9, 22] },
        { nome: "Libra", elemento: "Ar", regente: "Vênus", inicio: [9, 23], fim: [10, 22] },
        { nome: "Escorpião", elemento: "Água", regente: "Plutão", inicio: [10, 23], fim: [11, 21] },
        { nome: "Sagitário", elemento: "Fogo", regente: "Júpiter", inicio: [11, 22], fim: [12, 21] }
    ];
    
    for (const s of signos) {
        if ((mes === s.inicio[0] && dia >= s.inicio[1]) ||
            (mes === s.fim[0] && dia <= s.fim[1])) {
            return {
                nome: s.nome,
                elemento: s.elemento,
                regente: s.regente,
                tracos: getTracoSigno(s.nome)
            };
        }
    }
    return { nome: "Não calculado", elemento: "N/A", regente: "N/A", tracos: [] };
}

function getTracoSigno(signo) {
    const tracos = {
        "Áries": ["Corajoso", "Impulsivo", "Enérgico", "Competitivo"],
        "Touro": ["Paciente", "Determinado", "Sensual", "Teimoso"],
        "Gêmeos": ["Comunicativo", "Curioso", "Versátil", "Inconstante"],
        "Câncer": ["Emocional", "Protetor", "Intuitivo", "Moody"],
        "Leão": ["Generoso", "Orgulhoso", "Criativo", "Dramático"],
        "Virgem": ["Analítico", "Prático", "Perfeccionista", "Crítico"],
        "Libra": ["Diplomático", "Social", "Romântico", "Indeciso"],
        "Escorpião": ["Intenso", "Passional", "Determinado", "Ciumento"],
        "Sagitário": ["Otimista", "Aventureiro", "Honesto", "Impaciente"],
        "Capricórnio": ["Disciplinado", "Responsável", "Ambicioso", "Frio"],
        "Aquário": ["Original", "Humanitário", "Intelectual", "Rebelde"],
        "Peixes": ["Compassivo", "Artístico", "Sensível", "Indeciso"]
    };
    return tracos[signo] || [];
}

function calcularAscendente(horaNascimento, signoSolar) {
    if (!horaNascimento || horaNascimento === "Não informado") {
        return "Estimado (faltam dados)";
    }
    
    const [hora, minuto] = horaNascimento.split(":").map(Number);
    const signosOrdem = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                         "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
    
    const indexSigno = signosOrdem.indexOf(signoSolar);
    const horasPorSigno = 2;
    const totalMinutos = hora * 60 + minuto;
    const indexAscendente = (indexSigno + Math.floor(totalMinutos / (horasPorSigno * 60))) % 12;
    
    return signosOrdem[indexAscendente];
}

function calcularCartaPessoal(dia, mes, ano) {
    let soma = dia + mes + (ano % 100);
    while (soma > 22) soma -= 22;
    
    const cartas = {
        0: { nome: "O Louco", significado: "Liberdade, inocência, novas jornadas" },
        1: { nome: "O Mago", significado: "Vontade, habilidade, manifestação" },
        2: { nome: "A Sacerdotisa", significado: "Intuição, mistério, sabedoria oculta" },
        3: { nome: "A Imperatriz", significado: "Fertilidade, abundância, natureza" },
        4: { nome: "O Imperador", significado: "Autoridade, estrutura, controle" },
        5: { nome: "O Hierofante", significado: "Tradição, espiritualidade, ensinamento" },
        6: { nome: "Os Enamorados", significado: "Amor, escolhas, harmonia" },
        7: { nome: "O Carro", significado: "Vitória, controle, progresso" },
        8: { nome: "A Justiça", significado: "Equilíbrio, verdade, causa e efeito" },
        9: { nome: "O Eremita", significado: "Reflexão, solidão, orientação interior" },
        10: { nome: "A Roda da Fortuna", significado: "Ciclos, destino, mudança" },
        11: { nome: "A Força", significado: "Coragem, persuasão, influência suave" },
        12: { nome: "O Enforcado", significado: "Sacrifício, nova perspectiva, pausa" },
        13: { nome: "A Morte", significado: "Fim de ciclo, transformação, renovação" },
        14: { nome: "A Temperança", significado: "Moderação, equilíbrio, cura" },
        15: { nome: "O Diabo", significado: "Desejo, escravidão, materialismo" },
        16: { nome: "A Torre", significado: "Mudança brusca, revelação, caos" },
        17: { nome: "A Estrela", significado: "Esperança, fé, inspiração" },
        18: { nome: "A Lua", significado: "Ilusão, intuição, subconsciente" },
        19: { nome: "O Sol", significado: "Vitalidade, sucesso, alegria" },
        20: { nome: "O Julgamento", significado: "Renascimento, chamado interior, absolvição" },
        21: { nome: "O Mundo", significado: "Completude, realização, viagem" }
    };
    
    return cartas[soma] || { nome: "Desconhecida", significado: "N/A" };
}

function estimarRenda(cidade, empresas, idade, escolaridade) {
    let base = 2000;
    
    // Fatores de ajuste
    if (empresas > 0) base += empresas * 1500;
    if (idade > 30) base += (idade - 30) * 50;
    if (idade > 50) base += 500; // Experiência
    
    // Ajuste por cidade
    const cidadesPremium = ["São Paulo", "Rio de Janeiro", "Brasília", "Curitiba", "Belo Horizonte"];
    if (cidadesPremium.some(c => cidade.includes(c))) base += 2000;
    
    // Escolaridade
    const escolaridadeBonus = {
        "Fundamental": 0,
        "Médio": 500,
        "Superior": 1500,
        "Pós-graduação": 3000,
        "Mestrado": 4500,
        "Doutorado": 6000
    };
    base += escolaridadeBonus[escolaridade] || 0;
    
    // Faixa de renda com margem de erro
    const variacao = base * 0.3; // 30% para cima ou para baixo
    return `R$ ${Math.round(base - variacao).toLocaleString()} - R$ ${Math.round(base + variacao).toLocaleString()}/mês`;
}

function estimarScore(idade, empresas, veiculos, dividas) {
    let score = 500;
    
    // Fatores positivos
    score += empresas * 50;
    score += veiculos * 30;
    score += Math.min(idade * 2, 100); // Bônus por idade até 50 anos
    
    // Fatores negativos
    score -= (dividas || 0) * 20;
    
    // Limites
    score = Math.max(300, Math.min(900, score));
    
    // Classificação
    let classificacao = "";
    if (score > 800) classificacao = "Excelente";
    else if (score > 700) classificacao = "Bom";
    else if (score > 600) classificacao = "Regular+";
    else if (score > 500) classificacao = "Regular";
    else classificacao = "Baixo";
    
    return `${score}-${score + 50} (${classificacao})`;
}

function analisarPerfilComportamental(signo, idade, cidade) {
    const perfis = {
        "Analítico": ["Virgem", "Capricórnio", "Aquário"],
        "Emocional": ["Câncer", "Peixes", "Escorpião"],
        "Dinâmico": ["Áries", "Gêmeos", "Sagitário"],
        "Estável": ["Touro", "Leão", "Libra"]
    };
    
    let tracos = [];
    const signoNome = signo.nome;
    
    // Baseado no signo
    for (const [perfil, signos] of Object.entries(perfis)) {
        if (signos.includes(signoNome)) {
            tracos.push(perfil);
        }
    }
    
    // Baseado na idade
    if (idade > 40) tracos.push("Conservador");
    if (idade < 30) tracos.push("Inovador");
    
    // Baseado na cidade
    const cidadesMetro = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Porto Alegre"];
    if (cidadesMetro.some(c => cidade.includes(c))) {
        tracos.push("Urbanizado");
    } else {
        tracos.push("Localista");
    }
    
    return tracos.length > 0 ? tracos.join(", ") : "Padrão";
}

// --- Módulo principal expandido ---
module.exports = {
    name: "cpf",
    description: "Consulta CPF com dados, cálculos avançados e análise comportamental",
    commands: ["cpf", "cpf1", "cpfconsulta"],
    usage: `${PREFIX}cpfUltraPlus <CPF>`,
    handle: async ({ sendReply, sendReact, fullMessage }) => {
        const cpf = fullMessage.split(" ")[1];
        if (!cpf || cpf.length !== 11 || !/^\d+$/.test(cpf)) {
            await sendReply("❌ CPF inválido. Informe 11 dígitos numéricos.");
            return;
        }

        await sendReact("🔍");
        try {
            // --- Consultas paralelas melhoradas ---
            const [mecRes, datagetRes, receitaRes] = await Promise.all([
                fetch(`http://sistec.mec.gov.br/precadastros/populacpf/cpf/${cpf}`, {
                    headers: { 'Accept': 'application/json' }
                }).catch(() => null),
                
                fetch(`https://api.dataget.site/api/v1/cpf/${cpf}`, {
                    headers: {
                        'Authorization': 'Bearer 2e1228a7a34fb74cb5d91cfae27594ef07b0f03f92abe4611c94bc3fa4583765',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 12.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0'
                    }
                }).catch(() => null),
                
                fetch(`https://consulta.receita.fazenda.gov.br/consulta/${cpf}`, {
                    redirect: 'manual'
                }).catch(() => null)
            ]);

            // Processamento dos dados
            const mecData = mecRes ? await mecRes.json().catch(() => ({})) : {};
            const dataGetData = datagetRes ? await datagetRes.json().catch(() => ({})) : {};
            
            // Dados básicos
            const nome = dataGetData.NOME || mecData.no_pessoa_rf || "Não informado";
            const mae = dataGetData.NOME_MAE || mecData.no_mae_rf || "Não informado";
            const pai = dataGetData.NOME_PAI || "Não informado";
            const nasc = dataGetData.NASC || mecData.dt_nascimento_rf || "Não informado";
            const sexo = dataGetData.SEXO || mecData.sg_sexo_rf || "Não informado";
            const cidade = dataGetData.CIDADE || "Desconhecida";
            const estado = dataGetData.UF || "N/A";
            const lat = dataGetData.LAT || "-";
            const lng = dataGetData.LNG || "-";
            const escolaridade = mecData.escolaridade || "Não informado";
            const horaNascimento = dataGetData.HORA_NASC || "Não informado";

            // --- Dados adicionais via scraping melhorado ---
            let empresas = 0;
            let veiculos = 0;
            let dividas = 0;
            let processos = 0;
            
            try {
                // Scraping de empresas
                const empresaResp = await fetch(`https://www.consultaempresa.com/cpf/${cpf}`);
                const empresaHtml = await empresaResp.text();
                const $emp = cheerio.load(empresaHtml);
                empresas = $emp("td:contains('Sócio')").length || 0;
                
                // Scraping de veículos
                const veiculoResp = await fetch(`https://www.consultaveiculo.com/cpf/${cpf}`);
                const veiculoHtml = await veiculoResp.text();
                const $veic = cheerio.load(veiculoHtml);
                veiculos = $veic("tr:contains('Placa')").length || 0;
                
                // Scraping de dívidas
                const dividaResp = await fetch(`https://www.serasa.com.br/consulta/${cpf}`);
                const dividaHtml = await dividaResp.text();
                const $div = cheerio.load(dividaHtml);
                dividas = parseInt($div("span:contains('dívidas')").first().text().match(/\d+/)) || 0;
                
                // Scraping de processos
                const processoResp = await fetch(`https://www.tjsp.jus.br/consulta/${cpf}`);
                const processoHtml = await processoResp.text();
                const $proc = cheerio.load(processoHtml);
                processos = $proc("div.processos").length || 0;
            } catch (err) {
                console.error("Erro em scraping:", err.message);
            }

            // --- Cálculos extras expandidos ---
            let idade = 0;
            let signoData = { nome: "Não calculado" };
            let ascendente = "Estimado";
            let cartaData = { nome: "N/A" };
            let renda = "N/A";
            let score = "N/A";
            let perfilComportamental = "N/A";
            
            if (nasc !== "Não informado") {
                const [ano, mes, dia] = nasc.includes("-") ? 
                    nasc.split("-").map(Number) : 
                    nasc.split("/").reverse().map(Number);
                
                idade = new Date().getFullYear() - ano;
                signoData = calcularSigno(dia, mes);
                ascendente = calcularAscendente(horaNascimento, signoData.nome);
                cartaData = calcularCartaPessoal(dia, mes, ano);
                renda = estimarRenda(cidade, empresas, idade, escolaridade);
                score = estimarScore(idade, empresas, veiculos, dividas);
                perfilComportamental = analisarPerfilComportamental(signoData, idade, cidade);
            }

            // --- Formatação da resposta ---
            const responseMessage = `
✅ *Consulta CPF UIdentificação*  
👤 Nome: ${nome}  
🆔 CPF: ${cpf.match(/(\d{3})(\d{3})(\d{3})(\d{2})/).slice(1).join(".")}  
👩 Mãe: ${mae}  
👨 Pai: ${pai}  
🎂 Nascimento: ${nasc} (${idade} anos)  
⚧ Sexo: ${sexo}  
🎓 Escolaridade: ${escolaridade}  
🏠 *Endereço*  
📍 Cidade: ${cidade}  
🌎 Estado: ${estado}  
📌 Localização: ${lat}, ${lng}  
💰 *Financeiro*  
💵 Faixa de Renda: ${renda}  
📊 Score de Crédito: ${score}  
❗ Dívidas Registradas: ${dividas}  
⚖️ Processos Judiciais: ${processos}  
🏢 *Patrimônio*  
🏛 Empresas Vinculadas: ${empresas}  
🚗 Veículos Registrados: ${veiculos}  
🔮 *Perfil Astral*  
♈ Signo Solar: ${signoData.nome} (${signoData.elemento})  
🌟 Regente: ${signoData.regente}  
⬆️ Ascendente: ${ascendente}  
✨ Traços: ${signoData.tracos.join(", ") || "N/A"}  
🃏 Carta Pessoal: ${cartaData.nome}  
📜 Significado: ${cartaData.significado}  
🧠 *Análise Comportamental*  
📝 Perfil: ${perfilComportamental}  
🔍 Traços Dominantes: ${analisarPerfilComportamental(signoData, idade, cidade)}  
  
📌 *Observações*  
${dividas > 3 ? "⚠️ Possível inadimplência" : "✅ Situação financeira estável"}  
${processos > 0 ? "⚖️ Pendências judiciais" : "✅ Sem processos"}  
${empresas > 0 ? "💼 Empreendedor/Investidor" : "👨‍💻 Perfil tradicional"}  
  
`;

            await sendReply(responseMessage);

        } catch (error) {
            console.error("Erro na consulta:", error);
            await sendReply("❌ Erro ao consultar CPF.;
        }
    }
};
