const axios = require('axios');
const cheerio = require('cheerio');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

const BIN_SOURCES = [
  {
    name: 'BACEN',
    type: 'scraping',
    endpoint: 'https://www.bcb.gov.br/fis/info/instituicoes.asp',
    priority: 1,
    timeout: 5000
  },
  {
    name: 'Binlist',
    type: 'api',
    endpoint: bin => `https://lookup.binlist.net/${bin}`,
    priority: 2,
    timeout: 3000
  },
  {
    name: 'BIN Database',
    type: 'api',
    endpoint: bin => `https://bindb.org/api/bin/${bin}`,
    priority: 3,
    timeout: 4000
  }
].sort((a, b) => a.priority - b.priority);

class BINValidator {
  static validate(bin) {
    const cleaned = bin.replace(/\D/g, '');
    if (cleaned.length < 6 || cleaned.length > 8) throw new InvalidParameterError('❌ 6-8 dígitos');
    if (!/^\d+$/.test(cleaned)) throw new InvalidParameterError('❌ Apenas números');
    return cleaned.substring(0, 8);
  }
}

class BINConsultant {
  constructor() {
    this.cache = new Map();
  }

  async query(bin) {
    const cacheKey = BINValidator.validate(bin);
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    for (const source of BIN_SOURCES) {
      try {
        const data = source.type === 'scraping' 
          ? await this._scrapeBACEN(cacheKey) 
          : await this._callAPI(source, cacheKey);
        
        if (data) {
          const result = {
            bin: data.bin || cacheKey,
            brand: data.brand || '🏦 Desconhecida',
            issuer: data.issuer || '🏛️ Desconhecido',
            country: data.country || '🌍 Desconhecido',
            type: data.type || '💳 Indefinido',
            prepaid: data.prepaid ? '✅ Sim' : '❌ Não',
            level: data.level || '🔹 Padrão',
            bankPhone: data.bankPhone || '📞 Não disponível',
            website: data.website || '🌐 Não disponível',
            source: source.name
          };
          this.cache.set(cacheKey, result);
          return result;
        }
      } catch {}
    }
    throw new Error('🚫 Serviço indisponível');
  }

  async _scrapeBACEN(bin) {
    const response = await axios.get(BIN_SOURCES[0].endpoint, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(response.data);
    const rows = $('table.tabela tr');
    
    for (let i = 0; i < rows.length; i++) {
      const cols = $(rows[i]).find('td');
      if (cols.length >= 3) {
        const [start, end] = $(cols[0]).text().trim().split('-').map(Number);
        const currentBin = parseInt(bin.substring(0, 6));
        if (currentBin >= start && currentBin <= end) {
          return {
            issuer: $(cols[1]).text().trim(),
            brand: $(cols[1]).text().trim().includes('VISA') ? 'Visa' : 
                  $(cols[1]).text().trim().includes('MASTERCARD') ? 'Mastercard' : '🏦 Outra',
            country: '🇧🇷 Brasil',
            type: $(cols[1]).text().trim().includes('DEBITO') ? 'Débito' : 'Crédito'
          };
        }
      }
    }
    return null;
  }

  async _callAPI(source, bin) {
    const response = await axios.get(source.endpoint(bin), {
      timeout: source.timeout
    });
    
    const data = response.data;
    return {
      brand: data.scheme || data.brand || data.card_type,
      issuer: data.bank?.name || data.issuer || data.bank_name,
      country: data.country?.name || data.country || data.countryName,
      type: data.type || data.card_category || data.product_type,
      prepaid: data.prepaid || false,
      level: data.level ? `${data.level.charAt(0).toUpperCase() + data.level.slice(1)}` : null,
      bankPhone: data.bank?.phone || data.phone,
      website: data.bank?.url || data.website
    };
  }
}

module.exports = {
  name: "bin",
  commands: ["bin", "cartao", "bandeira"],
  usage: `${PREFIX}bin 123456`,

  handle: async ({ args, sendReply, sendErrorReply, sendWaitReply }) => {
    try {
      if (!args[0]) return sendErrorReply(`❌ ${PREFIX}bin 123456`);
      
      await sendWaitReply("🔍 Analisando...");
      const consultant = new BINConsultant();
      const data = await consultant.query(args[0]);

      await sendReply(`
💳 *BIN ${data.bin}*

🏦 *Banco:* ${data.issuer}
🏷️ *Bandeira:* ${data.brand}
🌎 *País:* ${data.country}
💳 *Tipo:* ${data.type} ${data.level}
💰 *Pré-pago:* ${data.prepaid}

📞 *Telefone:* ${data.bankPhone}
🌐 *Website:* ${data.website}

📌 *Fonte:* ${data.source}
      `.trim());

    } catch (error) {
      sendErrorReply(error.message.includes('dígitos') ? error.message : '🚫 Erro na consulta');
    }
  }
};