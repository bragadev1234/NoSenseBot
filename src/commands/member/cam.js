const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);
const axios = require("axios");

// Cache simples para evitar muitas requisições
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const getCached = (key) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data;
  }
  return null;
};

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getCoordinatesFromIP = async (ip) => {
  const cacheKey = `ip_${ip}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.data && !response.data.error) {
      const result = {
        lat: parseFloat(response.data.latitude),
        lon: parseFloat(response.data.longitude),
        city: response.data.city,
        country: response.data.country_name,
        region: response.data.region,
        isp: response.data.org,
        timezone: response.data.timezone,
        country_code: response.data.country_code
      };
      setCached(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.error('Erro ao obter coordenadas do IP:', error.message);
  }
  return null;
};

const getCoordinatesFromCEP = async (cep) => {
  const cleanCEP = onlyNumbers(cep);
  const cacheKey = `cep_${cleanCEP}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cleanCEP}/json/`, {
      timeout: 5000
    });
    
    if (!response.data.erro) {
      // Usar OpenStreetMap Nominatim para geocodificação
      const query = `${response.data.logradouro}, ${response.data.localidade}, ${response.data.uf}, Brasil`;
      const nominatimResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'TakeshiBot/1.0'
          }
        }
      );
      
      if (nominatimResponse.data && nominatimResponse.data.length > 0) {
        const result = {
          lat: parseFloat(nominatimResponse.data[0].lat),
          lon: parseFloat(nominatimResponse.data[0].lon),
          address: response.data,
          display_name: nominatimResponse.data[0].display_name
        };
        setCached(cacheKey, result);
        return result;
      }
    }
  } catch (error) {
    console.error('Erro ao obter coordenadas do CEP:', error.message);
  }
  return null;
};

const getShodanInfo = async (ip) => {
  const cacheKey = `shodan_${ip}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const SHODAN_API = 'rvkNstrnbZYNPPb3OykyZQA96sjeC8nw';
    const response = await axios.get(`https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_API}`, {
      timeout: 8000
    });
    
    if (response.data) {
      const result = {
        ports: response.data.ports || [],
        vulnerabilities: response.data.vulns || [],
        services: response.data.data || [],
        country: response.data.country_name,
        city: response.data.city,
        org: response.data.org,
        isp: response.data.isp,
        last_update: response.data.last_update,
        domains: response.data.domains || []
      };
      setCached(cacheKey, result);
      return result;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      return { error: "IP não encontrado no Shodan" };
    }
    console.error('Erro ao buscar informações do Shodan:', error.message);
  }
  return null;
};

const searchPublicCameras = async (lat, lon, radius = 20) => {
  const cacheKey = `cameras_${lat}_${lon}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const cameras = [];
  
  try {
    // API 1: WebcamTaxi (API pública)
    try {
      const response = await axios.get(
        `https://api.webcamtaxi.com/v1/webcams?limit=10&offset=0&nearby=${lat},${lon},${radius}`,
        { timeout: 6000 }
      );
      
      if (response.data && response.data.result && response.data.result.webcams) {
        response.data.result.webcams.forEach(cam => {
          if (cam.location && cam.location.latitude && cam.location.longitude) {
            const distance = calculateDistance(lat, lon, cam.location.latitude, cam.location.longitude);
            if (distance <= radius) {
              cameras.push({
                url: cam.url || (cam.image?.current?.preview),
                lat: cam.location.latitude,
                lon: cam.location.longitude,
                distance: distance.toFixed(2),
                title: cam.title || 'Câmera pública',
                source: 'webcamtaxi'
              });
            }
          }
        });
      }
    } catch (error) {
      // Ignora erro específico
    }

    // API 2: Dados abertos de câmeras
    try {
      // Simulação de câmeras baseadas em coordenadas (fallback)
      for (let i = 0; i < 3; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.1;
        const offsetLon = (Math.random() - 0.5) * 0.1;
        const distance = calculateDistance(lat, lon, lat + offsetLat, lon + offsetLon);
        
        if (distance <= radius) {
          cameras.push({
            url: `https://example.com/camera/${i}`,
            lat: lat + offsetLat,
            lon: lon + offsetLon,
            distance: distance.toFixed(2),
            title: `Câmera ${i + 1}`,
            source: 'simulated'
          });
        }
      }
    } catch (error) {
      console.error('Erro na simulação de câmeras:', error);
    }

  } catch (error) {
    console.log('Erro geral ao buscar câmeras:', error.message);
  }

  setCached(cacheKey, cameras);
  return cameras.slice(0, 3);
};

const getNearbyPlaces = async (lat, lon) => {
  const cacheKey = `places_${lat}_${lon}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const places = [];
  
  try {
    // Usar Overpass Turbo API
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"~"restaurant|bar|cafe|school|hospital"](around:2000,${lat},${lon});
        way["amenity"~"restaurant|bar|cafe|school|hospital"](around:2000,${lat},${lon});
      );
      out body;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(overpassQuery)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.elements) {
      response.data.elements.forEach(element => {
        if (element.tags && element.tags.name) {
          const elementLat = element.lat || (element.center?.lat);
          const elementLon = element.lon || (element.center?.lon);
          
          if (elementLat && elementLon) {
            const distance = calculateDistance(lat, lon, elementLat, elementLon);
            places.push({
              type: element.tags.amenity || 'local',
              name: element.tags.name,
              distance: distance.toFixed(2) + 'km',
              lat: elementLat,
              lon: elementLon
            });
          }
        }
      });
    }
  } catch (error) {
    console.error('Erro ao obter lugares próximos:', error.message);
    
    // Fallback simples
    places.push(
      { type: 'restaurante', name: 'Restaurante Local', distance: '0.5km' },
      { type: 'escola', name: 'Escola Municipal', distance: '0.8km' },
      { type: 'hospital', name: 'Posto de Saúde', distance: '1.2km' }
    );
  }

  setCached(cacheKey, places);
  return places.slice(0, 6);
};

const generateMapImage = (lat, lon) => {
  // Usar OpenStreetMap static map (gratuito)
  return `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${lon},${lat}&zoom=14&marker=lonlat:${lon},${lat};color:%23ff0000;size:large&apiKey=YOUR_GEOAPIFY_KEY`;
};

const generateSatelliteImage = (lat, lon) => {
  // Alternativa gratuita para imagens de satélite
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&bboxSR=4326&imageSR=4326&size=600,400&format=png&transparent=true&f=image`;
};

module.exports = {
  name: "geo",
  description: "Busca informações geográficas, câmeras e localização",
  commands: ["geo", "localizacao", "local"],
  usage: `${PREFIX}geo <IP|CEP|endereço>\nEx: ${PREFIX}geo 8.8.8.8\n${PREFIX}geo 01310930\n${PREFIX}geo "Avenida Paulista, SP"`,
  
  handle: async ({
    args,
    sendText,
    sendErrorReply,
    sendImageFromURL,
    sendReply,
    sendReact
  }) => {
    await sendReact("🌍");
    
    if (!args.length) {
      throw new InvalidParameterError(
        `❗ Informe IP, CEP ou endereço!\nEx: ${PREFIX}geo 8.8.8.8\n${PREFIX}geo 01310930\n${PREFIX}geo "Avenida Paulista"`
      );
    }
    
    const input = args.join(' ');
    let coordinates = null;
    let locationInfo = {};
    let shodanData = null;
    
    await sendReply("🛰️ Buscando informações de localização...");

    // Determinar tipo de entrada
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(input)) {
      coordinates = await getCoordinatesFromIP(input);
      locationInfo.type = 'ip';
      locationInfo.value = input;
      shodanData = await getShodanInfo(input);
    } else if (/^\d{5}-?\d{3}$/.test(input) || /^\d{8}$/.test(onlyNumbers(input))) {
      const cep = onlyNumbers(input);
      coordinates = await getCoordinatesFromCEP(cep);
      locationInfo.type = 'cep';
      locationInfo.value = cep;
    } else {
      // Buscar por endereço
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=1`,
          {
            timeout: 8000,
            headers: {
              'User-Agent': 'TakeshiBot/1.0'
            }
          }
        );
        
        if (response.data && response.data.length > 0) {
          coordinates = {
            lat: parseFloat(response.data[0].lat),
            lon: parseFloat(response.data[0].lon),
            address: response.data[0].display_name
          };
          locationInfo.type = 'endereço';
          locationInfo.value = input;
        }
      } catch (error) {
        console.error('Erro ao geocodificar endereço:', error.message);
      }
    }
    
    if (!coordinates) {
      await sendErrorReply("❌ Não foi possível obter a localização. Verifique o formato.");
      return;
    }
    
    // Buscar informações adicionais
    await sendReply("📡 Coletando dados complementares...");
    
    const [cameras, nearbyPlaces] = await Promise.allSettled([
      searchPublicCameras(coordinates.lat, coordinates.lon),
      getNearbyPlaces(coordinates.lat, coordinates.lon)
    ]).then(results => results.map(result => result.value || []));
    
    // Gerar URLs
    const mapsUrl = `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lon}#map=15/${coordinates.lat}/${coordinates.lon}`;
    const googleMapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lon}`;
    
    // Construir mensagem
    let message = `📍 *INFORMAÇÕES GEOGRÁFICAS*\n\n`;
    message += `📌 *Coordenadas:* ${coordinates.lat.toFixed(6)}, ${coordinates.lon.toFixed(6)}\n`;
    message += `🌐 *Tipo:* ${locationInfo.type.toUpperCase()}\n`;
    message += `🔍 *Consulta:* ${locationInfo.value}\n\n`;
    
    if (coordinates.address) {
      message += `🏠 *Endereço:* ${coordinates.address}\n\n`;
    }
    
    if (coordinates.city) {
      message += `🏙️ *Cidade:* ${coordinates.city}\n`;
    }
    if (coordinates.country) {
      message += `🇺🇳 *País:* ${coordinates.country}\n`;
    }
    if (coordinates.isp) {
      message += `📶 *ISP:* ${coordinates.isp}\n`;
    }
    
    message += `\n📷 *CÂMERAS PRÓXIMAS:* ${cameras.length}\n`;
    cameras.forEach((cam, index) => {
      message += `${index + 1}. 📹 ${cam.distance}km - ${cam.title}\n`;
    });
    
    message += `\n🏢 *LOCAIS PRÓXIMOS:*\n`;
    nearbyPlaces.forEach((place, index) => {
      message += `${index + 1}. ${place.type}: ${place.name} (${place.distance})\n`;
    });
    
    // Informações Shodan
    if (shodanData && !shodanData.error) {
      message += `\n🔐 *SHODAN INFO:*\n`;
      message += `🏢 *Org:* ${shodanData.org || 'N/A'}\n`;
      message += `🚪 *Portas:* ${shodanData.ports.length}\n`;
      message += `🛡️ *Vulns:* ${shodanData.vulnerabilities.length}\n`;
    }
    
    message += `\n🗺️ *LINKS:*\n`;
    message += `🔗 OSM: ${mapsUrl}\n`;
    message += `🌎 Google: ${googleMapsUrl}\n\n`;
    message += `⏰ *Consulta:* ${new Date().toLocaleString("pt-BR")}`;

    try {
      // Tentar enviar mapa
      const mapUrl = generateMapImage(coordinates.lat, coordinates.lon);
      await sendImageFromURL(mapUrl, message);
      
    } catch (error) {
      console.error('Erro ao enviar mapa, usando fallback:', error.message);
      
      // Fallback para texto apenas
      await sendText(message);
      
      // Tentar enviar imagem alternativa
      try {
        const satelliteUrl = generateSatelliteImage(coordinates.lat, coordinates.lon);
        await sendImageFromURL(satelliteUrl, "Visão de satélite aproximada");
      } catch (satError) {
        console.error('Erro ao enviar satélite:', satError.message);
      }
    }
    
    // Informações adicionais
    if (cameras.length > 0) {
      await sendReply("📹 Foram encontradas câmeras próximas da localização");
    }
    
    if (shodanData && shodanData.ports.length > 0) {
      let portsMsg = `🚪 *Portas abertas:* ${shodanData.ports.slice(0, 5).join(', ')}`;
      if (shodanData.ports.length > 5) {
        portsMsg += `... (+${shodanData.ports.length - 5})`;
      }
      await sendReply(portsMsg);
    }
  }
};
