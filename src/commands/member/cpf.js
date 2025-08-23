const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const axios = require('axios');

// Funções auxiliares para processamento de dados
function calcularIdade(dataNascimento) {
  if (!dataNascimento || dataNascimento === 'Não informado') return 'Desconhecida';
  
  try {
    const partes = dataNascimento.split('/');
    if (partes.length !== 3) return 'Desconhecida';
    
    const nascimento = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return `${idade} anos`;
  } catch (e) {
    return 'Desconhecida';
  }
}

function determinarSigno(dataNascimento) {
  if (!dataNascimento || dataNascimento === 'Não informado') return 'Não identificado';
  
  try {
    const partes = dataNascimento.split('/');
    if (partes.length !== 3) return 'Não identificado';
    
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    
    if ((mes === 1 && dia >= 20) || (mes === 2 && dia <= 18)) return 'Aquário ♒';
    if ((mes === 2 && dia >= 19) || (mes === 3 && dia <= 20)) return 'Peixes ♓';
    if ((mes === 3 && dia >= 21) || (mes === 4 && dia <= 19)) return 'Áries ♈';
    if ((mes === 4 && dia >= 20) || (mes === 5 && dia <= 20)) return 'Touro ♉';
    if ((mes === 5 && dia >= 21) || (mes === 6 && dia <= 20)) return 'Gêmeos ♊';
    if ((mes === 6 && dia >= 21) || (mes === 7 && dia <= 22)) return 'Câncer ♋';
    if ((mes === 7 && dia >= 23) || (mes === 8 && dia <= 22)) return 'Leão ♌';
    if ((mes === 8 && dia >= 23) || (mes === 9 && dia <= 22)) return 'Virgem ♍';
    if ((mes === 9 && dia >= 23) || (mes === 10 && dia <= 22)) return 'Libra ♎';
    if ((mes === 10 && dia >= 23) || (mes === 11 && dia <= 21)) return 'Escorpião ♏';
    if ((mes === 11 && dia >= 22) || (mes === 12 && dia <= 21)) return 'Sagitário ♐';
    if ((mes === 12 && dia >= 22) || (mes === 1 && dia <= 19)) return 'Capricórnio ♑';
    
    return 'Não identificado';
  } catch (e) {
    return 'Não identificado';
  }
}

function determinarEstadoCPF(cpf) {
  if (!cpf || cpf.length !== 11) return 'Não identificado';
  
  const nonoDigito = parseInt(cpf[8]);
  
  const estados = {
    0: ['RS'],
    1: ['DF', 'GO', 'MS', 'MT', 'TO'],
    2: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR'],
    3: ['CE', 'MA', 'PI'],
    4: ['AL', 'PB', 'PE', 'RN'],
    5: ['BA', 'SE'],
    6: ['MG'],
    7: ['ES', 'RJ'],
    8: ['SP'],
    9: ['PR', 'SC']
  };
  
  for (const [digito, estadosList] of Object.entries(estados)) {
    if (nonoDigito === parseInt(digito)) {
      return estadosList.join('/');
    }
  }
  
  return 'Não identificado';
}

function formatarCPF(cpf) {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

module.exports = {
  name: "consultacpf",
  description: "Consulta dados de CPF através da API com informações adicionais",
  commands: ["consultacpf", "cpf", "consultar", "consulta", "cpfinfo"],
  usage: `${PREFIX}consultacpf 12345678900`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendText,
    sendErrorReply,
    sendImageFromURL,
    userJid,
    args,
    sendReact,
    sendReply
  }) => {
    await sendReact("🔍");

    if (!args.length) {
      throw new InvalidParameterError(
        "❗ Você precisa informar um CPF para consulta!"
      );
    }

    const cpf = onlyNumbers(args[0]);

    if (cpf.length !== 11) {
      await sendErrorReply(
        "❗ CPF inválido! Deve conter 11 dígitos."
      );
      return;
    }

    try {
      await sendReply("🔍 Consultando CPF na base de dados...");

      // Fazendo a requisição para a API
      const response = await axios.get(`https://api.dataget.site/api/v1/cpf/${cpf}`, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 12.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
          "Authorization": "Bearer 2e1228a7a34fb74cb5d91cfae27594ef07b0f03f92abe4611c94bc3fa4583765"
        }
      });

      const data = response.data;

      if (data.CPF && data.CPF.length === 11) {
        const nome = data.NOME || 'Não informado';
        const nasc = data.NASC || 'Não informado';
        const nomeMae = data.NOME_MAE || 'Não informado';
        const nomePai = (data.NOME_PAI && data.NOME_PAI.length > 2) ? data.NOME_PAI : 'Não informado';
        const sexo = data.SEXO || 'Não informado';
        
        // Dados calculados
        const idade = calcularIdade(nasc);
        const signo = determinarSigno(nasc);
        const estado = determinarEstadoCPF(cpf);
        const cpfFormatado = formatarCPF(cpf);
        
        // Gerar legenda formatada
        const caption = `

🟪🟪 *CONSULTA DE CPF REALIZADA* 🟪🟪  

👤 *INFORMAÇÕES PESSOAIS*  

👤 *Nome:* ${nome}  
🚻 *Sexo:* ${sexo}  
🎂 *Data de Nascimento:* ${nasc}  
⏳ *Idade:* ${idade}  
♈ *Signo:* ${signo}  

👨‍👩‍👧 *INFORMAÇÕES FAMILIARES*  

👩 *Nome da Mãe:* ${nomeMae}  
👨 *Nome do Pai:* ${nomePai}  

📇 *DOCUMENTO*  

🆔 *CPF:* ${cpfFormatado}  
🌎 *Estado de Emissão:* ${estado}

⏰ *Consulta realizada em:* ${new Date().toLocaleString('pt-BR')}
        `.trim();

        // Envia a imagem com a legenda formatada
        await sendImageFromURL(
          "https://profanereaper.neocities.org/58743c7215ac254075aee5585e8861ca.jpg",
          caption
        );

        await sendReply(
          `📊 *DETALHES ADICIONAIS*\n\n` +
          `👤 *Solicitante:* ${userJid.split('@')[0]}\n` +
          `🔒 *Status da consulta:* Concluída com sucesso ✅\n\n` +
          `⚠️ *AVISO LEGAL:* Estas informações são fornecidas apenas para fins educativos. ` +
          `Respeite a privacidade alheia e use este recurso com responsabilidade.`
        );

      } else {
        await sendErrorReply(
          "❌ CPF não encontrado na base de dados.\n" +
          "Verifique se o CPF está correto e tente novamente."
        );
      }

    } catch (error) {
      console.error('Erro na consulta:', error);
      
      if (error.response) {
        await sendErrorReply(
          "❌ Erro na API: " + (error.response.data?.msg || 'Serviço indisponível no momento')
        );
      } else if (error.code === 'ECONNABORTED') {
        await sendErrorReply(
          "⏰ Timeout na consulta. O servidor demorou muito para responder.\n" +
          "Tente novamente em alguns instantes."
        );
      } else {
        await sendErrorReply(
          "❌ Erro interno na consulta. Tente novamente mais tarde."
        );
      }
    }
  },
};
