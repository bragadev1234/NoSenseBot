const axios = require('axios');
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);

// Funções auxiliares para calcular dados adicionais
function calcularIdade(dataNascimento) {
  if (!dataNascimento || dataNascimento === "Não informado") return "Desconhecida";
  
  try {
    const nasc = new Date(dataNascimento.split('/').reverse().join('-'));
    if (isNaN(nasc.getTime())) return "Data inválida";
    
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    
    return `${idade} anos`;
  } catch (e) {
    return "Data inválida";
  }
}

function determinarSigno(dataNascimento) {
  if (!dataNascimento || dataNascimento === "Não informado") return "Desconhecido";
  
  try {
    const [dia, mes] = dataNascimento.split('/').map(Number);
    
    if ((mes === 1 && dia >= 20) || (mes === 2 && dia <= 18)) return "Aquário";
    if ((mes === 2 && dia >= 19) || (mes === 3 && dia <= 20)) return "Peixes";
    if ((mes === 3 && dia >= 21) || (mes === 4 && dia <= 19)) return "Áries";
    if ((mes === 4 && dia >= 20) || (mes === 5 && dia <= 20)) return "Touro";
    if ((mes === 5 && dia >= 21) || (mes === 6 && dia <= 20)) return "Gêmeos";
    if ((mes === 6 && dia >= 21) || (mes === 7 && dia <= 22)) return "Câncer";
    if ((mes === 7 && dia >= 23) || (mes === 8 && dia <= 22)) return "Leão";
    if ((mes === 8 && dia >= 23) || (mes === 9 && dia <= 22)) return "Virgem";
    if ((mes === 9 && dia >= 23) || (mes === 10 && dia <= 22)) return "Libra";
    if ((mes === 10 && dia >= 23) || (mes === 11 && dia <= 21)) return "Escorpião";
    if ((mes === 11 && dia >= 22) || (mes === 12 && dia <= 21)) return "Sagitário";
    if ((mes === 12 && dia >= 22) || (mes === 1 && dia <= 19)) return "Capricórnio";
    
    return "Desconhecido";
  } catch (e) {
    return "Desconhecido";
  }
}

function determinarGeracao(dataNascimento) {
  if (!dataNascimento || dataNascimento === "Não informado") return "Desconhecida";
  
  try {
    const ano = new Date(dataNascimento.split('/').reverse().join('-')).getFullYear();
    
    if (ano >= 2013) return "Alpha";
    if (ano >= 1997) return "Geração Z";
    if (ano >= 1981) return "Millennials";
    if (ano >= 1965) return "Geração X";
    if (ano >= 1946) return "Baby Boomers";
    return "Geração Silenciosa";
  } catch (e) {
    return "Desconhecida";
  }
}

function formatarCPF(cpf) {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

module.exports = {
  name: "puxarcpf",
  description: "Consulta completa de dados do CPF informado com informações adicionais",
  commands: ["puxarcpf", "consultacpf", "cpf", "consultarcpf"],
  usage: `${PREFIX}puxarcpf <cpf>\nEx: ${PREFIX}puxarcpf 12345678900`,

  handle: async ({
    args,
    sendReply,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
  }) => {
    try {
      if (!args[0]) {
        return sendErrorReply(`❌ Informe um CPF válido!\nEx: ${PREFIX}puxarcpf 12345678900`);
      }

      const cpf = args[0].replace(/\D/g, '');
      
      // Validação completa do CPF
      if (!/^\d{11}$/.test(cpf)) {
        return sendErrorReply('❌ CPF inválido! Deve conter exatamente 11 dígitos numéricos.');
      }
      
      // Validação dos dígitos verificadores
      let soma = 0;
      let resto;
      
      for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
      }
      resto = (soma * 10) % 11;
      
      if ((resto === 10) || (resto === 11)) resto = 0;
      if (resto !== parseInt(cpf.substring(9, 10))) {
        return sendErrorReply('❌ CPF inválido! Dígito verificador incorreto.');
      }
      
      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
      }
      resto = (soma * 10) % 11;
      
      if ((resto === 10) || (resto === 11)) resto = 0;
      if (resto !== parseInt(cpf.substring(10, 11))) {
        return sendErrorReply('❌ CPF inválido! Segundo dígito verificador incorreto.');
      }

      await sendWaitReply('🔍 Consultando CPF na base de dados...');

      const response = await axios.get(`https://api.dataget.site/api/v1/cpf/${cpf}`, {
        headers: {
          "Authorization": "Bearer 2e1228a7a34fb74cb5d91cfae27594ef07b0f03f92abe4611c94bc3fa4583765",
          "User-Agent": "Mozilla/5.0 (NodeBot)",
        },
        timeout: 15000, // Aumentado o timeout para 15 segundos
      });

      const data = response.data;

      if (!data || !data.CPF) {
        return sendErrorReply("❌ CPF não encontrado ou sem dados disponíveis.");
      }

      const {
        NOME = "Não informado",
        NASC = "Não informado",
        NOME_MAE = "Não informado",
        NOME_PAI = "Não informado",
        SEXO = "Não informado",
      } = data;

      // Calcular dados adicionais
      const idade = calcularIdade(NASC);
      const signo = determinarSigno(NASC);
      const geracao = determinarGeracao(NASC);
      const cpfFormatado = formatarCPF(cpf);

      const msg = `
🧾 *CONSULTA DE CPF - DADOS COMPLETOS*

🔢 *CPF:* ${cpfFormatado}
👤 *Nome:* ${NOME}
🎂 *Nascimento:* ${NASC} (${idade})
✨ *Signo:* ${signo}
🧑‍🤝‍🧑 *Geração:* ${geracao}
👩 *Mãe:* ${NOME_MAE}
👨 *Pai:* ${NOME_PAI}
⚧️ *Sexo:* ${SEXO}

📌 *v0.10*
      `.trim();

      await sendSuccessReact();
      return sendReply(msg);

    } catch (err) {
      errorLog(`Erro no puxarcpf.js: ${err.stack}`);
      
      if (err.code === 'ECONNABORTED') {
        return sendErrorReply("⌛ A consulta demorou muito e foi cancelada. Tente novamente.");
      }
      
      if (err.response?.status === 404) {
        return sendErrorReply("❌ CPF não encontrado na base de dados.");
      }
      
      if (err.response?.status === 429) {
        return sendErrorReply("⚠️ Muitas consultas em pouco tempo. Aguarde antes de tentar novamente.");
      }
      
      return sendErrorReply("💢 Erro ao consultar o CPF. Tente novamente mais tarde.");
    }
  }
};
