# Reaper Bot (Fork Takeshi Bot) 🤖

![GitHub Repo stars](https://img.shields.io/github/stars/ProfaneReaper/Reaper-Bot?style=social)
![GitHub forks](https://img.shields.io/github/forks/ProfaneReaper/Reaper-Bot?style=social)
![GitHub issues](https://img.shields.io/github/issues/ProfaneReaper/Reaper-Bot)
![GitHub license](https://img.shields.io/github/license/ProfaneReaper/Reaper-Bot)
![GitHub last commit](https://img.shields.io/github/last-commit/ProfaneReaper/Reaper-Bot)

Este projeto é um fork expansivo do Takeshi Bot original, com as seguintes melhorias e adições:

✨ **Expansão de funcionalidades**: Novos recursos para enriquecer a experiência do usuário  
🎨 **Otimização visual**: Design aprimorado e interfaces mais intuitivas  
📝 **Melhorias textuais**: Conteúdo revisado e aprimorado para maior clareza e impacto  
🛣️ **Roadmap futuro**: Novos comandos e features em desenvolvimento  

> **Importante**: Este fork não substitui o excelente trabalho dos desenvolvedores originais do Takeshi Bot. Nosso objetivo é complementar e expandir o projeto base, mantendo todo o respeito pelo código aberto.

Agradecimentos especiais aos criadores originais por disponibilizar este projeto incrível como open source. Seu trabalho foi a base fundamental para esta versão.

## 💻 Tecnologias Envolvidas

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Baileys](https://img.shields.io/badge/Baileys-6.7.18-FF6B6B?style=for-the-badge)

## ⚠ Atenção

Este projeto não possui qualquer vínculo oficial com o WhatsApp. Ele foi desenvolvido de forma independente para interações automatizadas por meio da plataforma.

Não nos responsabilizamos por qualquer uso indevido deste bot. É de responsabilidade exclusiva do usuário garantir que sua utilização esteja em conformidade com os termos de uso do WhatsApp e a legislação vigente.

## Instalação

### 📱 No Termux

1. Abra o Termux e execute os comandos abaixo.

   *Não tem o Termux?* [Clique aqui](https://example.com) e baixe a última versão.

```bash
pkg upgrade -y && pkg update -y && pkg install git -y && pkg install nodejs-lts -y && pkg install ffmpeg -y && pkg install unzip -y && pkg install python python-pip && npm install moment jsdom axios cheerio && npm install node-summarizer && npm install google-translate-api-x && npm install natural stopword lodash compromise sentiment && npm install node-fetch
```

2. Habilite o acesso da pasta storage no Termux:
```bash
termux-setup-storage
```

3. Entre na pasta sdcard:
```bash
cd /sdcard
```

4. Baixe o repositório:
```bash
wget https://github.com/ProfaneReaper/Reaper-Bot/archive/refs/heads/main.zip -O reaper-bot.zip
```

5. Extraia o arquivo baixado:
```bash
unzip reaper-bot.zip
```

6. Renomeie a pasta extraída:
```bash
mv Reaper-Bot-main bot
```

7. Entre na pasta do bot:
```bash
cd bot
```

8. Habilite permissões:
```bash
chmod -R 755 ./*
```

9. Execute o bot:
```bash
npm start
```

### 🖥️ No Ubuntu

1. Atualize os pacotes e instale as dependências:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nodejs ffmpeg unzip python3 python3-pip
```

2. Instale as dependências do Node.js:
```bash
npm install moment jsdom axios cheerio node-summarizer google-translate-api-x natural stopword lodash compromise sentiment node-fetch
```

3. Clone o repositório:
```bash
git clone https://github.com/ProfaneReaper/Reaper-Bot.git
cd Reaper-Bot
```

4. Execute o bot:
```bash
npm start
```

## 🔄 Problemas de Conexão

Caso ocorram erros na conexão:

1. Reset a conexão do bot com o WhatsApp:
```bash
sh reset.sh
```

2. Remova o dispositivo do WhatsApp em "dispositivos conectados"
3. Adicione novamente o dispositivo

## 📜 Licença

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)

Este projeto está licenciado sob a Licença Pública Geral GNU (GPL-3.0).
