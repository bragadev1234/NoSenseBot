const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const dns = require("dns").promises;
const whois = require("whois-json");
const axios = require("axios");

function calcularScore({ dominioValido, mxRegistros, whoisInfo, geoInfo, vazamentos, subdominios }) {
  let score = 100;
  let motivos = [];

  if (dominioValido === "❌ Não encontrado") {
    score -= 50;
    motivos.push("❌ Domínio inexistente");
  }

  if (mxRegistros === "❌ Nenhum") {
    score -= 30;
    motivos.push("❌ Sem servidores MX");
  }

  const idadeDominio = whoisInfo?.idadeDominio || 0;
  if (idadeDominio < 1) {
    score -= 20;
    motivos.push("⚠️ Domínio muito novo");
  } else if (idadeDominio > 10) {
    score += 10;
    motivos.push("✅ Domínio antigo e estabelecido");
  }

  if ((whoisInfo?.org || "").toLowerCase().includes("privacy")) {
    score -= 15;
    motivos.push("⚠️ Dados WHOIS privados");
  }

  if (geoInfo?.bogon) {
    score -= 25;
    motivos.push("⚠️ IP inválido ou reservado");
  }

  if (vazamentos && vazamentos !== "✅ Nenhum vazamento encontrado") {
    score -= 35;
    motivos.push("🔓 E-mail vazado em breaches");
  }

  if (subdominios && subdominios.length > 5) {
    score += 5;
    motivos.push("✅ Domínio com boa infraestrutura");
  }

  let nivel = "🟢 Seguro";
  if (score < 70) nivel = "🟡 Suspeito";
  if (score < 40) nivel = "🔴 Alto risco";

  return { score, nivel, motivos };
}

async function consultarVazamentos(email) {
  try {
    const [breachDirectory, haveibeenpwned] = await Promise.allSettled([
      axios.get(`https://breachdirectory.tk/api?query=${encodeURIComponent(email)}`, {
        timeout: 10000,
        validateStatus: () => true,
      }),
      axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        validateStatus: () => true,
      })
    ]);

    const leaks = [];

    if (breachDirectory.status === 'fulfilled' && breachDirectory.value.status === 200 && breachDirectory.value.data?.success) {
      breachDirectory.value.data.result.slice(0, 5).forEach(l => {
        leaks.push(`🔓 ${l.name} | Senha: ${l.password || "oculta"}`);
      });
    }

    if (haveibeenpwned.status === 'fulfilled' && haveibeenpwned.value.status === 200) {
      haveibeenpwned.value.data.slice(0, 3).forEach(breach => {
        leaks.push(`🔓 ${breach.Name} | ${breach.BreachDate} | ${breach.Description.substring(0, 50)}...`);
      });
    }

    return leaks.length ? leaks.join("\n") : "✅ Nenhum vazamento encontrado";
  } catch {
    return "✅ Nenhum vazamento encontrado";
  }
}

async function consultarGeo(ip) {
  try {
    const [ipApi, ipInfo] = await Promise.allSettled([
      axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org,as,lat,lon,query,zip`, {
        timeout: 10000,
      }),
      axios.get(`https://ipinfo.io/${ip}/json`, {
        timeout: 10000,
        validateStatus: () => true,
      })
    ]);

    let geoData = {};

    if (ipApi.status === 'fulfilled' && ipApi.value.data?.status === "success") {
      const g = ipApi.value.data;
      geoData = {
        ...geoData,
        ip: g.query,
        pais: g.country,
        regiao: g.regionName,
        cidade: g.city,
        zip: g.zip,
        org: g.org || g.isp,
        asn: g.as,
        lat: g.lat,
        lon: g.lon
      };
    }

    if (ipInfo.status === 'fulfilled' && ipInfo.value.data) {
      const g = ipInfo.value.data;
      geoData = {
        ...geoData,
        hostname: g.hostname,
        timezone: g.timezone,
        ip: g.ip,
        cidade: geoData.cidade || g.city,
        regiao: geoData.regiao || g.region,
        pais: geoData.pais || g.country,
        org: geoData.org || g.org,
        loc: g.loc
      };
    }

    if (Object.keys(geoData).length > 0) {
      return {
        ...geoData,
        maps: `https://www.google.com/maps/search/?api=1&query=${geoData.lat},${geoData.lon}`,
        satelite: `https://www.google.com/maps/@${geoData.lat},${geoData.lon},15z/data=!3m1!1e3`,
        street: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${geoData.lat},${geoData.lon}`,
        bogon: !geoData.org || geoData.org.includes('Reserved') || geoData.asn?.includes('Reserved')
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function consultarSubdominios(dominio) {
  try {
    const [crtsh, hackertarget] = await Promise.allSettled([
      axios.get(`https://crt.sh/?q=${dominio}&output=json`, { timeout: 15000 }),
      axios.get(`https://api.hackertarget.com/hostsearch/?q=${dominio}`, { timeout: 15000 })
    ]);

    const subdominios = new Set();

    if (crtsh.status === 'fulfilled' && crtsh.value.data && Array.isArray(crtsh.value.data)) {
      crtsh.value.data.forEach(r => {
        if (r.name_value && !r.name_value.startsWith('*.')) {
          subdominios.add(r.name_value.toLowerCase());
        }
      });
    }

    if (hackertarget.status === 'fulfilled' && hackertarget.value.data) {
      hackertarget.value.data.split('\n').forEach(line => {
        const sub = line.split(',')[0];
        if (sub && sub.includes(dominio)) {
          subdominios.add(sub.toLowerCase());
        }
      });
    }

    const subsArray = Array.from(subdominios).filter(s => s !== dominio);
    return subsArray.length ? subsArray.slice(0, 15).map(s => `🔗 ${s}`).join("\n") : "Nenhum subdomínio encontrado";
  } catch {
    return "❌ Erro ao consultar subdomínios";
  }
}

async function consultarHeadersSecurity(dominio) {
  try {
    const response = await axios.get(`https://${dominio}`, {
      timeout: 10000,
      validateStatus: () => true
    });

    const headers = response.headers;
    const securityHeaders = [];

    if (headers['strict-transport-security']) securityHeaders.push("✅ HSTS habilitado");
    if (headers['x-content-type-options']) securityHeaders.push("✅ X-Content-Type-Options");
    if (headers['x-frame-options']) securityHeaders.push("✅ X-Frame-Options");
    if (headers['x-xss-protection']) securityHeaders.push("✅ X-XSS-Protection");
    if (headers['content-security-policy']) securityHeaders.push("✅ Content-Security-Policy");

    return securityHeaders.length ? securityHeaders.join("\n") : "❌ Nenhum header de segurança encontrado";
  } catch {
    return "❌ Não foi possível verificar headers de segurança";
  }
}

async function consultarTecnologias(dominio) {
  try {
    const response = await axios.get(`https://api.wappalyzer.com/v2/lookup/?url=${dominio}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      validateStatus: () => true
    });

    if (response.data && response.data.technologies) {
      const techs = response.data.technologies.slice(0, 8).map(t => `${t.name}${t.version ? ` v${t.version}` : ''}`);
      return techs.join(", ");
    }
    return "Não detectado";
  } catch {
    return "Não detectado";
  }
}

async function consultarBlacklists(ip) {
  try {
    const blacklists = [
      `https://api.blacklistchecker.com/check/${ip}`,
      `https://check.getipintel.net/check.php?ip=${ip}&contact=email@example.com`,
      `https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/${ip}`
    ];

    const results = await Promise.allSettled(
      blacklists.map(url => 
        axios.get(url, { timeout: 8000, validateStatus: () => true })
      )
    );

    const blacklisted = results.filter(result => 
      result.status === 'fulfilled' && 
      result.value.data && 
      (result.value.data.blacklisted === true || 
       result.value.data.result === 'true' || 
       result.value.data.fraud_score > 80)
    );

    return blacklisted.length > 0 ? `⚠️ Listado em ${blacklisted.length} blacklist(s)` : "✅ Não listado em blacklists conhecidas";
  } catch {
    return "❌ Erro ao verificar blacklists";
  }
}

function detectarProvedor(email) {
  const dominio = email.split("@")[1].toLowerCase();
  const provedores = {
    'gmail.com': '📧 Gmail (Google)',
    'googlemail.com': '📧 Gmail (Google)',
    'outlook.com': '📧 Outlook (Microsoft)',
    'hotmail.com': '📧 Outlook (Microsoft)',
    'live.com': '📧 Outlook (Microsoft)',
    'msn.com': '📧 Outlook (Microsoft)',
    'yahoo.com': '📧 Yahoo Mail',
    'ymail.com': '📧 Yahoo Mail',
    'icloud.com': '📧 iCloud (Apple)',
    'me.com': '📧 iCloud (Apple)',
    'mac.com': '📧 iCloud (Apple)',
    'zoho.com': '📧 Zoho Mail',
    'protonmail.com': '🔒 ProtonMail',
    'proton.me': '🔒 ProtonMail',
    'tutanota.com': '🔒 Tutanota',
    'tuta.io': '🔒 Tutanota',
    'aol.com': '📧 AOL Mail',
    'yandex.com': '📧 Yandex Mail',
    'mail.ru': '📧 Mail.ru'
  };

  return provedores[dominio] || "🌐 Domínio próprio";
}

async function consultarGravatar(email) {
  const crypto = require("crypto");
  const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=256`;
}

async function consultarPerfisSociais(email) {
  try {
    const sites = [
      `https://www.linkedin.com/sales/gmail/profile/viewByEmail/${email}`,
      `https://www.facebook.com/search/people/?q=${email}`,
      `https://twitter.com/search?q=${email}`,
      `https://github.com/search?q=${email}&type=users`
    ];

    const perfis = [];

    for (const site of sites) {
      try {
        const response = await axios.head(site, {
          timeout: 5000,
          validateStatus: (status) => status < 400
        });
        
        if (response.status < 400) {
          const nomeSite = site.split('/')[2].replace('www.', '');
          perfis.push(`🔍 ${nomeSite}: ${site}`);
        }
      } catch (error) {
        // Ignora erros de timeout ou status 404
      }
    }

    return perfis.length ? perfis.join("\n") : "❌ Nenhum perfil social encontrado";
  } catch {
    return "❌ Erro ao buscar perfis sociais";
  }
}

async function consultarReputacaoDominio(dominio) {
  try {
    const response = await axios.get(`https://www.virustotal.com/vtapi/v2/domain/report?apikey=&domain=${dominio}`, {
      timeout: 10000,
      validateStatus: () => true
    });

    if (response.data) {
      const deteccoes = response.data.detected_urls ? response.data.detected_urls.length : 0;
      return deteccoes > 0 ? `⚠️ ${deteccoes} detecções no VirusTotal` : "✅ Domínio limpo no VirusTotal";
    }
    return "❌ Não foi possível verificar reputação";
  } catch {
    return "❌ Erro ao verificar reputação";
  }
}

module.exports = {
  name: "consultaemail",
  description: "Mega consulta OSINT de e-mail (MX, WHOIS, IP, subdomínios, vazamentos, score, perfis)",
  commands: ["consultaemail", "email", "emailinfo", "consultaremail", "emailosint"],
  usage: `${PREFIX}consultaemail exemplo@gmail.com`,

  handle: async ({
    sendErrorReply,
    sendImageFromURL,
    sendReact,
    args,
  }) => {
    await sendReact("📧");

    if (!args.length) {
      throw new InvalidParameterError("❗ Você precisa informar um e-mail para consulta!");
    }

    const email = args[0].trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      await sendErrorReply("❗ E-mail inválido! Informe um e-mail válido.");
      return;
    }

    const dominio = email.split("@")[1];
    const provedor = detectarProvedor(email);

    let dominioValido = "❌ Não encontrado";
    let mxRegistros = "❌ Nenhum";
    let whoisInfo = {};
    let whoisTexto = "❌ Não disponível";
    let vazamentosTexto = "✅ Consultando...";
    let geoTexto = "✅ Consultando...";
    let subsTexto = "✅ Consultando...";
    let securityHeadersTexto = "✅ Consultando...";
    let tecnologiasTexto = "✅ Consultando...";
    let blacklistsTexto = "✅ Consultando...";
    let reputacaoTexto = "✅ Consultando...";
    let perfisTexto = "✅ Consultando...";
    let gravatarUrl = await consultarGravatar(email);

    try {
      const registros = await dns.resolveMx(dominio);
      if (registros && registros.length > 0) {
        dominioValido = "✅ Existe";
        mxRegistros = registros.map(r => `📨 ${r.exchange} (pri:${r.priority})`).join("\n");
      }
    } catch {
      dominioValido = "❌ Não encontrado";
    }

    try {
      const info = await whois(dominio);
      if (info) {
        let criado = info.creationDate || info.created || info.registrationDate || null;
        let idadeDominio = 0;
        if (criado) {
          const dataCriacao = new Date(criado);
          const hoje = new Date();
          idadeDominio = Math.floor((hoje - dataCriacao) / (1000 * 60 * 60 * 24 * 365));
        }

        whoisInfo = {
          registrant: info.registrant || info.registrar || "Não informado",
          org: info.org || info.organization || info.registrar || "Não informado",
          telefone: info.phone || info.telephoneNumber || "Não informado",
          emailAdmin: info.emails || info.registrarEmail || "Não informado",
          country: info.country || info.registrarCountry || "Não informado",
          criado: criado || "Não informado",
          expira: info.registrarRegistrationExpirationDate || info.expires || info.expirationDate || "Não informado",
          idadeDominio,
        };

        whoisTexto =
`👤 Dono: ${whoisInfo.registrant}
🏢 Organização: ${whoisInfo.org}
📞 Telefone: ${whoisInfo.telefone}
📧 E-mail Admin: ${whoisInfo.emailAdmin}
📅 Criado em: ${whoisInfo.criado}
📅 Expira em: ${whoisInfo.expira}
⏳ Idade: ${idadeDominio} anos
🌍 País: ${whoisInfo.country}`;
      }
    } catch {
      whoisTexto = "❌ Erro ao consultar WHOIS";
    }

    const [
      vazamentosResult,
      subdominiosResult,
      securityHeadersResult,
      tecnologiasResult,
      reputacaoResult,
      perfisResult
    ] = await Promise.allSettled([
      consultarVazamentos(email),
      consultarSubdominios(dominio),
      consultarHeadersSecurity(dominio),
      consultarTecnologias(dominio),
      consultarReputacaoDominio(dominio),
      consultarPerfisSociais(email)
    ]);

    vazamentosTexto = vazamentosResult.status === 'fulfilled' ? vazamentosResult.value : "❌ Erro na consulta";
    subsTexto = subdominiosResult.status === 'fulfilled' ? subdominiosResult.value : "❌ Erro na consulta";
    securityHeadersTexto = securityHeadersResult.status === 'fulfilled' ? securityHeadersResult.value : "❌ Erro na consulta";
    tecnologiasTexto = tecnologiasResult.status === 'fulfilled' ? tecnologiasResult.value : "❌ Erro na consulta";
    reputacaoTexto = reputacaoResult.status === 'fulfilled' ? reputacaoResult.value : "❌ Erro na consulta";
    perfisTexto = perfisResult.status === 'fulfilled' ? perfisResult.value : "❌ Erro na consulta";

    let geoInfo = null;
    try {
      const registrosA = await dns.resolve4(dominio).catch(() => dns.resolve(dominio));
      if (registrosA && registrosA.length > 0) {
        geoInfo = await consultarGeo(registrosA[0]);
        if (geoInfo) {
          blacklistsTexto = await consultarBlacklists(geoInfo.ip);
          
          geoTexto =
`🌐 IP: ${geoInfo.ip}
🏢 ASN: ${geoInfo.asn}
🏛️ Org/ISP: ${geoInfo.org}
📍 Local: ${geoInfo.cidade}, ${geoInfo.regiao}, ${geoInfo.pais}
🌐 Hostname: ${geoInfo.hostname || 'N/A'}
🕐 Timezone: ${geoInfo.timezone || 'N/A'}
📮 Zip: ${geoInfo.zip || 'N/A'}
🗺️ Maps: ${geoInfo.maps}`;
        }
      }
    } catch {
      geoTexto = "❌ Não foi possível resolver o IP";
      blacklistsTexto = "❌ IP não disponível";
    }

    const { score, nivel, motivos } = calcularScore({ 
      dominioValido, 
      mxRegistros, 
      whoisInfo, 
      geoInfo, 
      vazamentos: vazamentosTexto,
      subdominios: subsTexto.split('\n').filter(s => s !== "Nenhum subdomínio encontrado")
    });

    const caption =
`📧 CONSULTA DE E-MAIL COMPLETA

🆔 E-mail: ${email}
🌐 Domínio: ${dominio}
🏢 Provedor: ${provedor}
📡 Domínio válido: ${dominioValido}

📨 Servidores MX:
${mxRegistros}

🗂️ WHOIS:
${whoisTexto}

🔎 Subdomínios (${subsTexto.split('\n').length}):
${subsTexto}

🔒 Headers de Segurança:
${securityHeadersTexto}

🛠️ Tecnologias detectadas:
${tecnologiasTexto}

🔓 Vazamentos:
${vazamentosTexto}

🌍 Geolocalização IP:
${geoTexto}

⚫ Blacklists:
${blacklistsTexto}

📊 Reputação:
${reputacaoTexto}

👥 Perfis Sociais:
${perfisTexto}

👤 Gravatar:
${gravatarUrl}

📊 Score: ${score}/100 - ${nivel}
⚠️ Motivos: ${motivos.join(", ")}
⏰ Consulta realizada em: ${new Date().toLocaleString("pt-BR")}
`;

    await sendImageFromURL(gravatarUrl, caption);
  },
};
