const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { downloadContentFromMessage, getBuffer } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "ig",
  description: "Informações completas de perfil do Instagram com imagem de perfil.",
  commands: ["ig", "instagram", "perfilig", "insta"],
  usage: `${PREFIX}ig <@usuario>`,

  handle: async ({ args, sendReply, sendErrorReply, sendImageFromBuffer }) => {
    if (!args.length) {
      throw new InvalidParameterError("Digite o @ do usuário do Instagram");
    }

    let username = args[0].replace("@", "").toLowerCase();

    try {
      // Novo endpoint público do Instagram
      const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;

      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Instagram 219.0.0.12.117 Android",
          "X-IG-App-ID": "1217981644879628",
          "X-IG-WWW-Claim": "0",
          "X-Requested-With": "XMLHttpRequest",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept": "application/json",
          "Connection": "close",
          "Origin": "https://www.instagram.com",
          "Referer": "https://www.instagram.com/",
          "Authority": "www.instagram.com"
        },
        timeout: 15000
      });

      const user = response.data?.data?.user;

      if (!user) {
        return await sendErrorReply("❌ Perfil não encontrado ou privado!");
      }

      // Baixar a imagem de perfil em alta qualidade
      let profilePicBuffer = null;
      let profilePicUrl = user.profile_pic_url_hd || user.profile_pic_url;
      
      try {
        const imageResponse = await axios.get(profilePicUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        profilePicBuffer = Buffer.from(imageResponse.data);
      } catch (imgError) {
        console.error("Erro ao baixar imagem:", imgError.message);
      }

      // Calcular engajamento aproximado
      let engagementRate = "N/A";
      if (user.edge_owner_to_timeline_media?.count > 0 && user.edge_followed_by?.count > 0) {
        const avgLikes = user.edge_owner_to_timeline_media.edges.reduce((sum, edge) => 
          sum + (edge.node.edge_liked_by?.count || 0), 0) / user.edge_owner_to_timeline_media.edges.length;
        
        engagementRate = ((avgLikes / user.edge_followed_by.count) * 100).toFixed(2) + '%';
      }

      // Informações de último post
      let lastPostInfo = "";
      if (user.edge_owner_to_timeline_media?.edges?.length > 0) {
        const latestPost = user.edge_owner_to_timeline_media.edges[0].node;
        const postDate = new Date(latestPost.taken_at_timestamp * 1000);
        const now = new Date();
        const diffTime = Math.abs(now - postDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        lastPostInfo = `
📅 Último post: ${diffDays} dia${diffDays !== 1 ? 's' : ''} atrás
❤️ ${latestPost.edge_liked_by?.count?.toLocaleString() || "0"} curtidas
💬 ${latestPost.edge_media_to_comment?.count?.toLocaleString() || "0"} comentários
        `.trim();
      }

      // Formatação completa das informações
      const info = `
📸 *INFORMAÇÕES COMPLETAS DO INSTAGRAM*

👤 *PERFIL*
@${user.username}
${user.full_name || "Nome não disponível"}

📝 *BIOGRAFIA*
${user.biography || "Sem biografia"}

📊 *ESTATÍSTICAS*
👥 ${user.edge_followed_by?.count?.toLocaleString() || "0"} Seguidores
📋 ${user.edge_follow?.count?.toLocaleString() || "0"} Seguindo
📊 ${user.edge_owner_to_timeline_media?.count?.toLocaleString() || "0"} Posts
📈 Taxa de engajamento: ${engagementRate}
📌 ${user.highlight_reel_count?.toLocaleString() || "0"} Destaques

🏷️ *CATEGORIA*
${user.category_name || "Não categorizado"}

✅ *VERIFICAÇÃO E STATUS*
${user.is_verified ? "✅ Verificado" : "❌ Não verificado"}
${user.is_private ? "🔒 Perfil privado" : "🔓 Perfil público"}
${user.is_business_account ? "💼 Conta business" : "👤 Conta pessoal"}
${user.is_professional_account ? "🎯 Conta profissional" : ""}

🌐 *LINKS EXTERNOS*
${user.external_url ? `🔗 ${user.external_url}` : "Nenhum link externo"}
${user.website ? `🌍 ${user.website}` : ""}

🆔 *INFORMAÇÕES TÉCNICAS*
ID: ${user.id || "N/A"}

${lastPostInfo}

📡 *FONTE*
Dados obtidos via API pública do Instagram
      `.trim();

      // Enviar tudo em uma única mensagem com imagem
      if (profilePicBuffer) {
        await sendImageFromBuffer(profilePicBuffer, info, [], null);
      } else {
        // Se não conseguir baixar a imagem, enviar texto com URL da imagem
        await sendReply(info);
        await sendReply(`🖼️ *Foto de perfil:* ${profilePicUrl}`);
      }

    } catch (err) {
      console.error("Erro completo no comando IG:", err);
      
      if (err.response) {
        console.error(`Status: ${err.response.status} - ${err.response.statusText}`);
        console.error("Resposta:", err.response.data);
        
        if (err.response.status === 404) {
          return await sendErrorReply("❌ Perfil não encontrado. Verifique se o @ está correto.");
        } else if (err.response.status === 429) {
          return await sendErrorReply("⚠️ Muitas requisições. O Instagram bloqueou temporariamente. Tente novamente em 1-2 horas.");
        } else if (err.response.status === 403) {
          return await sendErrorReply("🔒 Acesso proibido. O perfil pode ser privado ou restrito.");
        }
      } else if (err.code === 'ECONNABORTED') {
        return await sendErrorReply("⏰ Tempo limite excedido. Tente novamente.");
      }
      
      await sendErrorReply(
        "⚠️ Erro ao buscar perfil. Possíveis causas:\n• Perfil privado\n• Limite de requisições\n• Bloqueio do Instagram\n• Problema de conexão"
      );
    }
  },
};
