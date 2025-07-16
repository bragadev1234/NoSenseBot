# Peter-Bot (Fork Takeshi Bot)

> **Este projeto é um fork expansivo do Takeshi Bot original**, com as seguintes melhorias e adições:
>- **Expansão de funcionalidades**: Novos recursos para enriquecer a experiência do usuário  
>- **Otimização visual**: Design aprimorado e interfaces mais intuitivas  
>- **Melhorias textuais**: Conteúdo revisado e aprimorado para maior clareza e impacto  
>- **Roadmap futuro**: Novos comandos e features em desenvolvimento  

**Importante**: Este fork **não substitui** o excelente trabalho dos desenvolvedores originais do Takeshi Bot. Nosso objetivo é complementar e expandir o projeto base, mantendo todo o respeito pelo código aberto.  

**Agradecimentos especiais** aos criadores originais por disponibilizar este projeto incrível como open source. Seu trabalho foi a base fundamental para esta versão.  

---

<div align="center">
    <img src="./assets/images/takeshi-bot.png" width="500">
</div>

<br />

<div align="center">
    <a href="https://github.com/braga2311/peter-bot">
        <img alt="Version" src="https://img.shields.io/badge/Vers%C3%A3o-1.2.DevS.Trava.fork-blue">
    </a>
</div>

<br />

## Bot de WhatsApp multifunções baseado no Takeshi Bot

![Logger](./assets/images/logger.png)

## 💻 Tecnologias envolvidas

- [Axios](https://axios-http.com/ptbr/docs/intro)
- [Baileys 6.7.18](https://github.com/WhiskeySockets/Baileys)
- [FFMPEG](https://ffmpeg.org/)
- [Node.js >= 22.14.0](https://nodejs.org/en)
- [Spider X API](https://api.spiderx.com.br)

## ⚠ Atenção

Este projeto não possui qualquer vínculo oficial com o WhatsApp. Ele foi desenvolvido de forma independente para interações automatizadas por meio da plataforma.

Não nos responsabilizamos por qualquer uso indevido deste bot. É de responsabilidade exclusiva do usuário garantir que sua utilização esteja em conformidade com os termos de uso do WhatsApp e a legislação vigente.

## Instalação no Termux

1 - Abra o Termux e execute os comandos abaixo.<br/>
_Não tem o Termux? [Clique aqui e baixe a última versão](https://www.mediafire.com/file/wxpygdb9bcb5npb/Termux_0.118.3_Dev_Gui.apk) ou [clique aqui e baixe versão da Play Store](https://play.google.com/store/apps/details?id=com.termux) caso a versão do MediaFire anterior não funcione._

```sh
pkg upgrade -y && pkg update -y && pkg install git -y && pkg install nodejs-lts -y && pkg install ffmpeg -y && pkg install unzip -y
```

2 - Habilite o acesso da pasta storage, no termux.

```sh
termux-setup-storage
```

3 - Entre na pasta sdcard.

```sh
cd /sdcard
```

4 - Baixe o repositório.

```sh
wget https://github.com/braga2311/peter-bot/archive/refs/heads/main.zip -O peter-bot.zip
```

5 - Extraia o arquivo baixado.

```sh
unzip peter-bot.zip
```

6 - Renomeie a pasta extraída.

```sh
mv peter-bot-main peter-bot
```

7 - Entre na pasta do bot.

```sh
cd peter-bot
```

8 - Habilite permissões de leitura e escrita.

```sh
chmod -R 755 ./*
```

9 - Execute o bot.

```sh
npm start
```

10 - Insira o número de telefone e pressione `enter`.

11 - Informe o código que aparece no termux no seu WhatsApp.

12 - Aguarde 10 segundos, depois digite `CTRL + C` para parar o bot.

13 - Configure o arquivo `config.js` que está dentro da pasta `src`.

```js
// Prefixo dos comandos
exports.PREFIX = "/";

// Emoji do bot (mude se preferir).
exports.BOT_EMOJI = "🤖";

// Nome do bot (mude se preferir).
exports.BOT_NAME = "Peter Bot";

// Número do bot. Coloque o número do bot
// (apenas números, exatamente como está no WhatsApp).
// Se o seu DDD não for de SP ou do Rio, não coloque o 9 antes do número.
exports.BOT_NUMBER = "558112345678";

// Número do dono do bot. Coloque o número do dono do bot
// (apenas números, exatamente como está no WhatsApp).
// Se o seu DDD não for de SP ou do Rio, não coloque o 9 antes do número.
exports.OWNER_NUMBER = "5521950502020";

// LID do dono do bot.
// Para obter o LID do dono do bot, use o comando <prefixo>get-lid @marca ou +telefone do dono.
exports.OWNER_LID = "219999999999999@lid";
```

14 - Inicie o bot novamente.

```sh
npm start
```

## Funcionalidades principais

O Peter-Bot inclui todos os recursos do Takeshi Bot original, além de novas funcionalidades:

- Comandos administrativos para grupos
- Diversão e interação com membros
- Download de mídias (YouTube, TikTok)
- Geração de imagens com IA
- Sistema de respostas automáticas
- E muito mais!

## Estrutura de pastas

- 📁 assets ➔ arquivos de mídia
- 📁 database ➔ arquivos de dados
- 📁 src ➔ código fonte do bot
    - 📁 commands ➔ comandos do bot
    - 📁 utils ➔ utilitários
    - 📝 config.js ➔ configurações do bot
- 📝 package.json ➔ dependências do projeto

## Erros comuns

### Permission denied (permissão negada) ao acessar `cd /sdcard`

Abra o termux, digite `termux-setup-storage` e aceite as permissões.

### Problemas de conexão

Caso ocorram erros na conexão:

1. Remova os arquivos da pasta `/assets/auth/baileys`:
```sh
rm -rf ./assets/auth/baileys
```

2. Remova o dispositivo do WhatsApp em "dispositivos conectados".

3. Adicione novamente o dispositivo.

## Licença

[GPL-3.0](https://github.com/braga2311/peter-bot/blob/main/LICENSE)

Este projeto está licenciado sob a Licença Pública Geral GNU (GPL-3.0).
