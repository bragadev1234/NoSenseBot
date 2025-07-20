const axios = require('axios');
const { getBuffer } = require('../../utils');

module.exports = {
    name: 'consultas',
    category: 'member',
    desc: 'Comandos de consultas diversas',
    async exec({ msg, args, sock }) {
        try {
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '⌛', key: msg.key } });

            const cmd = args[0]?.toLowerCase();
            const query = args.slice(1).join(' ');

            switch(cmd) {
                case 'cep':
                    if (!query) {
                        await msg.reply('❌ Por favor, informe um CEP');
                        return sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
                    }
                    return await consultaCEP(msg, query, sock);
                
                case 'ip':
                    if (!query) {
                        await msg.reply('❌ Por favor, informe um IP');
                        return sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
                    }
                    return await consultaIP(msg, query, sock);
                
                case 'cnpj':
                    if (!query) {
                        await msg.reply('❌ Por favor, informe um CNPJ');
                        return sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
                    }
                    return await consultaCNPJ(msg, query, sock);
                
                case 'validarcpf':
                    if (!query) {
                        await msg.reply('❌ Por favor, informe um CPF');
                        return sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
                    }
                    return await validarCPF(msg, query, sock);
                
                case 'gerarcpf':
                    return await gerarCPF(msg, sock);
                
                case 'gerarcnh':
                    return await gerarCNH(msg, sock);
                
                case 'gerartitulo':
                    return await gerarTitulo(msg, sock);
                
                case 'validartitulo':
                    if (!query) {
                        await msg.reply('❌ Por favor, informe um título');
                        return sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
                    }
                    return await validarTitulo(msg, query, sock);
                
                default:
                    const menuConsulta = `*📊 MENU DE CONSULTAS 📊*\n\n` +
                        `🔍 *Consultas Disponíveis:*\n` +
                        `├─ 📌 ${PREFIX}consultacep [CEP]\n` +
                        `├─ 🌐 ${PREFIX}consultaip [IP]\n` +
                        `├─ 🏢 ${PREFIX}consultacnpj [CNPJ]\n` +
                        `├─ 📝 ${PREFIX}validarcpf [CPF]\n` +
                        `├─ 🔢 ${PREFIX}gerarcpf\n` +
                        `├─ 🚗 ${PREFIX}gerarcnh\n` +
                        `├─ 🗳️ ${PREFIX}gerartitulo\n` +
                        `└─ ✅ ${PREFIX}validartitulo [TÍTULO]`;
                    
                    await msg.reply(menuConsulta);
                    return sock.sendMessage(msg.key.remoteJid, { react: { text: '📊', key: msg.key } });
            }
        } catch (err) {
            console.error(err);
            await msg.reply('⚠️ Ocorreu um erro');
            return sock.sendMessage(msg.key.remoteJid, { react: { text: '⚠️', key: msg.key } });
        }
    }
};

async function consultaCEP(msg, cep, sock) {
    try {
        cep = cep.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            await msg.reply('❌ CEP inválido');
            return sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
        }

        const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        
        if (data.erro) {
            await msg.reply('🔍 CEP não encontrado');
            return sock.sendMessage(msg.key.remoteJid, { react: { text: '🔍', key: msg.key } });
        }

        const response = `*📮 CONSULTA DE CEP*\n\n` +
            `📍 *Logradouro:* ${data.logradouro || '-'}\n` +
            `🏙️ *Bairro:* ${data.bairro || '-'}\n` +
            `🏙️ *Cidade:* ${data.localidade}\n` +
            `🌎 *Estado:* ${data.uf}\n` +
            `📮 *CEP:* ${data.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}`;

        await msg.reply(response);
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } });
    } catch (err) {
        console.error(err);
        await msg.reply('⚠️ Erro ao consultar CEP');
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '⚠️', key: msg.key } });
    }
}

async function consultaIP(msg, ip, sock) {
    try {
        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
            await msg.reply('❌ IP inválido');
            return sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
        }

        const { data } = await axios.get(`http://ip-api.com/json/${ip}?fields=66842623&lang=pt-BR`);
        
        if (data.status === 'fail') {
            await msg.reply('🔍 IP não encontrado');
            return sock.sendMessage(msg.key.remoteJid, { react: { text: '🔍', key: msg.key } });
        }

        const response = `*🌐 CONSULTA DE IP*\n\n` +
            `🌐 *IP:* ${data.query}\n` +
            `🏙️ *Cidade:* ${data.city || '-'}\n` +
            `🌎 *Região:* ${data.regionName || '-'}\n` +
            `🇧🇷 *País:* ${data.country || '-'}\n` +
            `📌 *CEP:* ${data.zip || '-'}\n` +
            `📶 *Provedor:* ${data.isp || '-'}`;

        await msg.reply(response);
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } });
    } catch (err) {
        console.error(err);
        await msg.reply('⚠️ Erro ao consultar IP');
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '⚠️', key: msg.key } });
    }
}

async function consultaCNPJ(msg, cnpj, sock) {
    try {
        cnpj = cnpj.replace(/\D/g, '');
        
        if (!validarCNPJ(cnpj)) {
            await msg.reply('❌ CNPJ inválido');
            return sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
        }

        const { data } = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
        
        if (data.status === 'ERROR') {
            await msg.reply('🔍 CNPJ não encontrado');
            return sock.sendMessage(msg.key.remoteJid, { react: { text: '🔍', key: msg.key } });
        }

        const response = `*🏢 CONSULTA DE CNPJ*\n\n` +
            `🏢 *Razão Social:* ${data.nome}\n` +
            `📅 *Abertura:* ${data.abertura}\n` +
            `🌎 *Estado:* ${data.uf}\n` +
            `🏙️ *Município:* ${data.municipio}\n` +
            `📮 *CEP:* ${data.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}\n` +
            `📍 *Endereço:* ${data.logradouro}, ${data.numero}`;

        await msg.reply(response);
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } });
    } catch (err) {
        console.error(err);
        await msg.reply('⚠️ Erro ao consultar CNPJ');
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '⚠️', key: msg.key } });
    }
}

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g,'');
    
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    
    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return resultado == digitos.charAt(1);
}

async function validarCPF(msg, cpf, sock) {
    try {
        cpf = cpf.replace(/\D/g, '');
        const isValid = validarCPF(cpf);
        
        const response = `*${isValid ? '✅ CPF VÁLIDO' : '❌ CPF INVÁLIDO'}*\n` +
            `📝 *Número:* ${cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}`;

        await msg.reply(response);
        return sock.sendMessage(msg.key.remoteJid, { react: { text: isValid ? '✅' : '❌', key: msg.key } });
    } catch (err) {
        console.error(err);
        await msg.reply('⚠️ Erro ao validar CPF');
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '⚠️', key: msg.key } });
    }
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g,'');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    
    return resto === parseInt(cpf.charAt(10));
}

async function gerarCPF(msg, sock) {
    try {
        const cpf = gerarCPFValido();
        const response = `*🔢 CPF GERADO*\n` +
            `📝 *Número:* ${cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}`;

        await msg.reply(response);
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '🔢', key: msg.key } });
    } catch (err) {
        console.error(err);
        await msg.reply('⚠️ Erro ao gerar CPF');
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '⚠️', key: msg.key } });
    }
}

function gerarCPFValido() {
    const digits = Array.from({length: 9}, () => Math.floor(Math.random() * 10));
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;
    digits.push(digit1);
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += digits[i] * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;
    digits.push(digit2);
    
    return digits.join('');
}

async function gerarCNH(msg, sock) {
    try {
        const cnh = gerarCNHValida();
        const response = `*🚗 CNH GERADA*\n` +
            `📝 *Número:* ${cnh.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}`;

        await msg.reply(response);
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '🚗', key: msg.key } });
    } catch (err) {
        console.error(err);
        await msg.reply('⚠️ Erro ao gerar CNH');
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '⚠️', key: msg.key } });
    }
}

function gerarCNHValida() {
    const digits = Array.from({length: 9}, () => Math.floor(Math.random() * 10));
    
    let sum = 0;
    let weight = 9;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * weight--;
    }
    
    let digit1 = sum % 11;
    if (digit1 >= 10) digit1 = 0;
    digits.push(digit1);
    
    return digits.join('') + Math.floor(Math.random() * 2);
}

async function gerarTitulo(msg, sock) {
    try {
        const titulo = gerarTituloValido();
        const response = `*🗳️ TÍTULO GERADO*\n` +
            `📝 *Número:* ${titulo.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}`;

        await msg.reply(response);
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '🗳️', key: msg.key } });
    } catch (err) {
        console.error(err);
        await msg.reply('⚠️ Erro ao gerar título');
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '⚠️', key: msg.key } });
    }
}

function gerarTituloValido() {
    const digits = Array.from({length: 8}, () => Math.floor(Math.random() * 10));
    const uf = Math.floor(Math.random() * 28).toString().padStart(2, '0');
    
    let sum = 0;
    let weight = 2;
    for (let i = 0; i < 8; i++) {
        sum += digits[i] * weight++;
        if (weight > 9) weight = 2;
    }
    
    const digit1 = sum % 11;
    digits.push(digit1 === 10 ? 0 : digit1);
    
    sum = 0;
    weight = 7;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * weight++;
        if (weight > 9) weight = 7;
    }
    
    const digit2 = sum % 11;
    digits.push(digit2 === 10 ? 0 : digit2);
    
    return digits.join('') + uf;
}

async function validarTitulo(msg, titulo, sock) {
    try {
        titulo = titulo.replace(/\D/g, '');
        const isValid = validarTituloEleitoral(titulo);
        
        const response = `*${isValid ? '✅ TÍTULO VÁLIDO' : '❌ TÍTULO INVÁLIDO'}*\n` +
            `📝 *Número:* ${titulo.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}`;

        await msg.reply(response);
        return sock.sendMessage(msg.key.remoteJid, { react: { text: isValid ? '✅' : '❌', key: msg.key } });
    } catch (err) {
        console.error(err);
        await msg.reply('⚠️ Erro ao validar título');
        return sock.sendMessage(msg.key.remoteJid, { react: { text: '⚠️', key: msg.key } });
    }
}

function validarTituloEleitoral(titulo) {
    titulo = titulo.replace(/[^\d]+/g,'');
    if (titulo.length !== 12) return false;
    
    const digits = titulo.substring(0, 10).split('').map(Number);
    const uf = titulo.substring(10, 12);
    
    let sum = 0;
    let weight = 2;
    for (let i = 0; i < 8; i++) {
        sum += digits[i] * weight++;
        if (weight > 9) weight = 2;
    }
    
    const digit1 = sum % 11;
    if (digit1 === 10 ? 0 : digit1 !== digits[8]) return false;
    
    sum = 0;
    weight = 7;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * weight++;
        if (weight > 9) weight = 7;
    }
    
    const digit2 = sum % 11;
    return (digit2 === 10 ? 0 : digit2) === digits[9];
        }
