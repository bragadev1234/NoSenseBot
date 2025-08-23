const { PREFIX } = require(`${BASE_DIR}/config`);
const axios = require('axios');

module.exports = {
  name: "gerar-img",
  description: "Gera uma imagem usando IA a partir de uma descrição",
  commands: ["gerar-img", "gerar-imagem", "ia-img", "imagem"],
  usage: `${PREFIX}gerar-img [descrição da imagem]`,

  handle: async ({ sendReply, sendReact, fullMessage, sendImageFromURL }) => {
    try {
      await sendReact("🎨");
      
      const prompt = fullMessage.split(' ').slice(1).join(' ');
      
      if (!prompt) {
        return await sendReply("❌ Por favor, forneça uma descrição. Ex: /gerar-img um gato astronauta");
      }

      if (prompt.length > 100) {
        return await sendReply("❌ Descrição muito longa! Máximo 100 caracteres.");
      }

      await sendReply(`🔄 Gerando: "${prompt}"...`);

      // API gratuita e sem chave - Prodia
      const response = await axios.post('https://api.prodia.com/v1/sdxl/generate', {
        prompt: prompt,
        model: "sd_xl_base_1.0.safetensors [be9edd61]",
        steps: 25,
        cfg_scale: 7,
        seed: -1,
        sampler: "Euler",
        aspect_ratio: "square"
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const jobId = response.data.job;
      
      // Verificar status até estar pronto
      let imageUrl = null;
      let attempts = 0;
      
      while (attempts < 20 && !imageUrl) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusResponse = await axios.get(`https://api.prodia.com/v1/job/${jobId}`);
        
        if (statusResponse.data.status === 'succeeded') {
          imageUrl = statusResponse.data.imageUrl;
          break;
        }
        
        attempts++;
      }

      if (!imageUrl) {
        return await sendReply("❌ Tempo esgotado. Tente novamente!");
      }

      await sendImageFromURL(imageUrl, `🎨 Gerado: "${prompt}"`);
      
    } catch (error) {
      console.error("[GERAR-IMG ERROR]", error);
      
      // Fallback para API alternativa se a primeira falhar
      try {
        await sendReply("🔄 Tentando método alternativo...");
        
        // Segunda opção - Stable Diffusion API gratuita
        const fallbackResponse = await axios.post('https://api.deepai.org/api/stable-diffusion', {
          text: prompt,
        }, {
          headers: {
            'api-key': 'quickstart-cred', // Chave pública para testes
            'Content-Type': 'application/json'
          }
        });

        if (fallbackResponse.data.output_url) {
          await sendImageFromURL(fallbackResponse.data.output_url, `🎨 Gerado: "${prompt}"`);
        } else {
          throw new Error('API alternativa falhou');
        }
        
      } catch (fallbackError) {
        await sendReply("❌ Erro ao gerar imagem. As APIs gratuitas podem estar sobrecarregadas.");
      }
    }
  },
};
