const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, ServiceUnavailableError } = require(`${BASE_DIR}/errors`);

// 🌐 Constelação de APIs CNPJ (7 fontes diferentes)
const CNPJ_API_NETWORK = [
  {
    name: 'BrasilAPI',
    endpoint: cnpj => `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
    validator: data => data.razao_social,
    priority: 1,
    timeout: 4000
  },
  {
    name: 'ReceitaWS',
    endpoint: cnpj => `https://receitaws.com.br/v1/cnpj/${cnpj}`,
    validator: data => data.nome,
    priority: 2,
    timeout: 6000,
    retry: 2
  },
  {
    name: 'CNPJA',
    endpoint: cnpj => `https://api.cnpja.com/brazil/${cnpj}`,
    validator: data => data.company?.name,
    priority: 3,
    timeout: 5000
  },
  {
    name: 'MinhaReceita',
    endpoint: cnpj => `https://minhareceita.org/api/v1/cnpj/${cnpj}`,
    validator: data => data.razao_social,
    priority: 4,
    timeout: 7000
  },
  {
    name: 'CNPJWS',
    endpoint: cnpj => `https://cnpjws.com.br/v1/cnpj/${cnpj}`,
    validator: data => data.empresa,
    priority: 5,
    timeout: 4500
  },
  {
    name: 'OpenCNPJ',
    endpoint: cnpj => `https://api.opencnpj.com.br/v1/cnpj/${cnpj}`,
    validator: data => data.razao_social,
    priority: 6,
    timeout: 5500
  },
  {
    name: 'CNPJOnline',
    endpoint: cnpj => `https://api.cnpjonline.com.br/v1/cnpj/${cnpj}`,
    validator: data => data.nome_empresarial,
    priority: 7,
    timeout: 5000,
    fallbackOnly: true
  }
].sort((a, b) => a.priority - b.priority);

// 🛡️ Validador Avançado de CNPJ
class CNPJValidator {
  static clean(cnpj) {
    return cnpj.replace(/\D/g, '');
  }

  static validate(cnpj) {
    const cleaned = this.clean(cnpj);
    
    if (cleaned.length !== 14) {
      throw new InvalidParameterError('CNPJ deve conter 14 dígitos');
    }

    if (/^(\d)\1{13}$/.test(cleaned)) {
      throw new InvalidParameterError('CNPJ inválido (sequência repetida)');
    }

    const digits = cleaned.split('').map(Number);
    const [d1, d2] = this.calculateCheckDigits(digits.slice(0, 12));
    
    if (digits[12] !== d1 || digits[13] !== d2) {
      throw new InvalidParameterError('CNPJ inválido (dígitos verificadores incorretos)');
    }

    return cleaned;
  }

  static calculateCheckDigits(numbers) {
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, ...weights1];
    
    const mod11 = (nums, weights) => {
      const sum = nums.reduce((acc, num, i) => acc + (num * weights[i]), 0);
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const d1 = mod11(numbers, weights1);
    const d2 = mod11([...numbers, d1], weights2);
    
    return [d1, d2];
  }
}

// 🔄 Sistema de Tentativas Adaptáveis
class RetryManager {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async executeWithRetry(fn, retriesLeft = this.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (retriesLeft <= 0) throw error;
      
      const delay = this.baseDelay * (this.maxRetries - retriesLeft + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.executeWithRetry(fn, retriesLeft - 1);
    }
  }
}

// 🌐 Consultor Multi-API com Fallback
class CNPJConsultant {
  constructor() {
    this.retryManager = new RetryManager();
    this.cache = new Map();
  }

  async query(cnpj) {
    const cached = this.cache.get(cnpj);
    if (cached) {
      console.log(`[CNPJ] Retornando do cache: ${cnpj}`);
      return cached;
    }

    let lastError;
    
    for (const api of CNPJ_API_NETWORK) {
      if (api.fallbackOnly && !lastError) continue;
      
      try {
        console.log(`[CNPJ] Tentando ${api.name} para ${cnpj}`);
        
        const data = await this.retryManager.executeWithRetry(
          () => this._queryAPI(api, cnpj),
          api.retry || 1
        );

        if (data && api.validator(data)) {
          const normalized = this._normalizeData(data, api.name);
          this.cache.set(cnpj, normalized);
          return normalized;
        }
      } catch (error) {
        console.error(`[CNPJ] API ${api.name} falhou: ${error.message}`);
        lastError = error;
      }
    }

    throw lastError || new ServiceUnavailableError('Todas as APIs falharam');
  }

  async _queryAPI(api, cnpj) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), api.timeout);

    try {
      const response = await axios.get(api.endpoint(cnpj), {
        signal: controller.signal,
        headers: { 
          'User-Agent': 'CNPJBot/2.0',
          'Accept': 'application/json'
        }
      });

      return response.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  _normalizeData(data, source) {
    const getValue = (paths) => {
      for (const path of paths) {
        const value = path.split('.').reduce((obj, key) => obj?.[key], data);
        if (value) return value;
      }
      return null;
    };

    return {
      razaoSocial: getValue(['razao_social', 'nome', 'company.name', 'empresa', 'nome_empresarial']),
      nomeFantasia: getValue(['nome_fantasia', 'fantasia', 'company.trading_name']),
      cnae: getValue(['cnae_fiscal_descricao', 'atividade_principal.0.text', 'main_activity.description']),
      dataAbertura: getValue(['data_inicio_atividade', 'abertura', 'opening_date']),
      municipio: getValue(['municipio', 'city', 'company.city']),
      uf: getValue(['uf', 'state', 'company.state']),
      telefone: getValue(['ddd_telefone_1', 'telefone', 'phone']),
      situacao: getValue(['descricao_situacao_cadastral', 'situacao', 'status']),
      porte: getValue(['porte', 'company.size']),
      naturezaJuridica: getValue(['natureza_juridica', 'legal_nature']),
      source
    };
  }
}

// 📊 Analisador de Empresa
class CompanyAnalyzer {
  static analyze(cnpj, data) {
    const factors = {
      cnpjValido: this._validateCNPJStructure(cnpj) ? 0 : 1,
      recente: this._isNewCompany(data.dataAbertura) ? 0.3 : 0,
      semTelefone: !data.telefone ? 0.2 : 0,
      situacaoIrregular: data.situacao !== 'ATIVA' ? 0.5 : 0,
      portePequeno: data.porte?.includes('MEI') ? 0.1 : 0
    };

    const score = Object.values(factors).reduce((sum, val) => sum + val, 0);
    const level = score > 0.7 ? 'ALTO' : score > 0.3 ? 'MÉDIO' : 'BAIXO';

    return { score, level, factors };
  }

  static _validateCNPJStructure(cnpj) {
    try {
      CNPJValidator.validate(cnpj);
      return true;
    } catch {
      return false;
    }
  }

  static _isNewCompany(openingDate) {
    if (!openingDate) return false;
    const date = new Date(openingDate.includes('/') 
      ? openingDate.split('/').reverse().join('-') 
      : openingDate);
    return (Date.now() - date) < 1000 * 60 * 60 * 24 * 365 * 2;
  }
}

// 📝 Gerador de Relatórios
class CNPJReport {
  static generate(cnpj, data, analysis) {
    const format = {
      date: (dateStr) => {
        if (!dateStr) return 'Não informada';
        const date = new Date(dateStr.includes('/') 
          ? dateStr.split('/').reverse().join('-') 
          : dateStr);
        return date.toLocaleDateString('pt-BR');
      },
      phone: (phone) => {
        if (!phone) return 'Não informado';
        const digits = phone.replace(/\D/g, '');
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
      },
      risk: (level) => {
        const emoji = { 'ALTO': '🔴', 'MÉDIO': '🟠', 'BAIXO': '🟢' }[level];
        return `${emoji} ${level}`;
      }
    };

    return `
🏢 *RELATÓRIO CNPJ PREMIUM* 🏢

🔢 *CNPJ:* ${cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}

📌 *Identificação:*
▸ Razão Social: ${data.razaoSocial || 'Não informada'}
▸ Nome Fantasia: ${data.nomeFantasia || 'Não informado'}
▸ Natureza Jurídica: ${data.naturezaJuridica || 'Não informada'}

📅 *Datas:*
▸ Data Abertura: ${format.date(data.dataAbertura)}
▸ Situação Cadastral: ${data.situacao || 'Não informada'}

📍 *Localização:*
▸ Município/UF: ${data.municipio || 'Não informado'}/${data.uf || '--'}
▸ Telefone: ${format.phone(data.telefone)}

📊 *Atividades:*
▸ CNAE Principal: ${data.cnae || 'Não informado'}
▸ Porte: ${data.porte || 'Não informado'}

⚠️ *Análise de Risco:* ${format.risk(analysis.level)}
▸ Score: ${analysis.score.toFixed(2)}
▸ Fatores: ${Object.entries(analysis.factors)
    .filter(([, val]) => val > 0)
    .map(([factor]) => factor)
    .join(', ') || 'Nenhum relevante'}

🔍 *Metadados:*
▸ Fonte: ${data.source || 'Não especificada'}
▸ Consulta em: ${new Date().toLocaleString('pt-BR')}

💡 *Observações:* 
- CNPJs gerados automaticamente podem não estar ativos
- Consulte sempre fontes oficiais para transações importantes
`.trim();
  }
}

// Módulo principal
const consultant = new CNPJConsultant();

module.exports = {
  name: "consultacnpj",
  description: "Consulta CNPJ com 7 fontes diferentes e análise de risco",
  commands: ["cnpj", "consultacnpj", "empresa", "cnpjfull"],
  usage: `${PREFIX}cnpj <CNPJ>\nEx: ${PREFIX}cnpj 12345678000195`,

  handle: async ({ args, sendReply, sendErrorReply, sendWaitReply, sendSuccessReact }) => {
    try {
      if (!args[0]) {
        return sendErrorReply(`Informe um CNPJ\nEx: ${PREFIX}cnpj 12345678000195`);
      }

      await sendWaitReply("🔍 Consultando em 7 bases de dados...");

      const cnpj = CNPJValidator.clean(args[0]);
      
      try {
        CNPJValidator.validate(cnpj);
      } catch (e) {
        console.warn(`CNPJ ${cnpj} falhou na validação local, mas continuando...`);
      }

      const data = await consultant.query(cnpj);
      const analysis = CompanyAnalyzer.analyze(cnpj, data);
      const report = CNPJReport.generate(cnpj, data, analysis);

      await sendSuccessReact();
      return sendReply(report);

    } catch (error) {
      console.error(`Falha CNPJ: ${error.stack}`);
      
      const message = error instanceof InvalidParameterError
        ? `CNPJ inválido: ${error.message}`
        : 'Falha ao consultar. Tente novamente mais tarde.';

      return sendErrorReply(`❌ ${message}\n💡 Dica: CNPJs gerados podem demorar para estar disponíveis nas bases.`);
    }
  }
};
