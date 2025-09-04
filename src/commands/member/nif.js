const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const axios = require("axios");

const nifCache = new Map();
const CACHE_TTL = 86400000; // 24h

function validarNIF(nif) {
    const n = nif.replace(/\D/g, '');
    if (n.length !== 9) return false;
    return [5, 6, 8, 9].includes(parseInt(n[0]));
}

function validarDigitoControloNIF(nif) {
    const n = nif.replace(/\D/g, '');
    if (n.length !== 9) return false;
    const controlo = parseInt(n[8]);
    let soma = 0;
    for (let i = 0; i < 8; i++) soma += parseInt(n[i]) * (9 - i);
    const resto = soma % 11;
    const calculado = (resto === 0 || resto === 1) ? 0 : 11 - resto;
    return controlo === calculado;
}

// ========== CONSULTAS ==========
async function consultarNIFAPI(nif) {
    try {
        const r = await axios.get(`https://api.nif.pt/?key=free&q=${nif}`, { timeout: 10000 });
        if (r.data?.result === "success") return r.data.records[nif];
    } catch {}
    return null;
}

async function consultarNIFAlternativo(nif) {
    try {
        const r = await axios.get(`https://www.nif.pt/${nif}`, { timeout: 8000, headers: { "User-Agent": "Mozilla/5.0" } });
        if (r.data) {
            const h = r.data;
            const get = (regex) => (h.match(regex) ? h.match(regex)[1].trim() : "Não disponível");
            return {
                nome: get(/<h1[^>]*>(.*?)<\/h1>/i),
                estado: get(/Estado:\s*<[^>]*>(.*?)<\/span>/i),
                data_registo: get(/Data de registo:\s*<[^>]*>(.*?)<\/span>/i),
                natureza: get(/Natureza:\s*<[^>]*>(.*?)<\/span>/i),
                capital: get(/Capital Social:\s*<[^>]*>(.*?)<\/span>/i),
                sede: get(/Sede:\s*<[^>]*>(.*?)<\/span>/i)
            };
        }
    } catch {}
    return null;
}

async function consultarAtividade(nif) {
    try {
        const r = await axios.get(`https://www.oni.pt/api/company/${nif}`, { timeout: 8000 });
        return r.data?.activity || "Não disponível";
    } catch { return "Não disponível"; }
}

async function consultarMorada(nif) {
    try {
        const r = await axios.get(`https://api.companyinformation.com/pt/${nif}`, { timeout: 8000 });
        return r.data?.address || "Não disponível";
    } catch { return "Não disponível"; }
}

async function consultarSituacao(nif) {
    try {
        const r = await axios.get(`https://api.portugal.gov.pt/company/status/${nif}`, { timeout: 8000 });
        return r.data?.regular ? "Regular" : "Irregular";
    } catch { return "Não disponível"; }
}

async function consultarHistorico(nif) {
    try {
        const r = await axios.get(`https://api.businesshistory.pt/company/${nif}/events`, { timeout: 10000 });
        return r.data?.events?.slice(0, 3) || [];
    } catch { return []; }
}

async function consultarInsolvencia(nif) {
    try {
        const r = await axios.get(`https://www.insolvencias.pt/api/${nif}`, { timeout: 10000 });
        return r.data?.status || "Não disponível";
    } catch { return "Não disponível"; }
}

// ========== MAIN ==========
module.exports = {
    name: "consultanif",
    description: "Consulta NIF (Número de Identificação Fiscal) de Portugal",
    commands: ["nif", "consultanif", "nifpt", "empresapt", "cnpjpt"],
    usage: `${PREFIX}nif 506789123`,

    handle: async ({ sendErrorReply, sendReact, args, sendSuccessReply }) => {
        await sendReact("🇵🇹");

        if (!args.length) throw new InvalidParameterError("Informe um NIF. Ex: 506789123");

        const nif = args[0].replace(/\D/g, '');
        if (!validarNIF(nif)) return sendErrorReply("❌ NIF inválido! Deve ter 9 dígitos e começar com 5, 6, 8 ou 9.");
        if (!validarDigitoControloNIF(nif)) return sendErrorReply("❌ Dígito de controlo inválido.");

        if (nifCache.has(nif) && Date.now() - nifCache.get(nif).timestamp < CACHE_TTL) {
            return sendSuccessReply(JSON.stringify(nifCache.get(nif).dados, null, 2));
        }

        const [oficial, alt, atividade, morada, situacao, historico, insolvencia] = await Promise.all([
            consultarNIFAPI(nif),
            consultarNIFAlternativo(nif),
            consultarAtividade(nif),
            consultarMorada(nif),
            consultarSituacao(nif),
            consultarHistorico(nif),
            consultarInsolvencia(nif)
        ]);

        const dados = [
            { campo: "Empresa", valor: oficial?.title || alt?.nome || "Não disponível" },
            { campo: "NIF", valor: nif },
            { campo: "Data de Registo", valor: oficial?.registered || alt?.data_registo || "Não disponível" },
            { campo: "Natureza Jurídica", valor: oficial?.nature || alt?.natureza || "Não disponível" },
            { campo: "Capital Social", valor: oficial?.capital || alt?.capital || "Não disponível" },
            { campo: "Estado", valor: oficial?.status || alt?.estado || "Não disponível" },
            { campo: "Situação", valor: situacao },
            { campo: "CAE", valor: atividade },
            { campo: "Morada", valor: oficial?.morada || alt?.sede || morada },
            { campo: "Insolvência", valor: insolvencia },
            { campo: "Últimos Eventos", valor: historico.length ? historico.map(e => `${e.date}: ${e.description}`).join(" | ") : "Não disponível" },
            { campo: "Validação Dígito", valor: "✅ Válido" },
            { campo: "Tipo", valor: `Empresa (inicia com ${nif[0]})` },
            { campo: "Consulta em", valor: new Date().toLocaleString("pt-PT") }
        ];

        nifCache.set(nif, { dados, timestamp: Date.now() });

        await sendSuccessReply(JSON.stringify(dados, null, 2));
    },
};
