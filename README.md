# Bragra-Bot (Fork Takeshi Bot)

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
pkg upgrade -y && pkg update -y && pkg install git -y && pkg install nodejs-lts -y && pkg install ffmpeg -y && pkg install unzip -y && pkg install python python-pip &&  npm install moment node-featch jsdom axios cheerio && npm install node-summarizer && npm install google-translate-api-x && npm install natural stopword wav
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
wget https://github.com/braga2311/braga-bot/archive/refs/heads/main.zip -O braga-bot.zip
```

5 - Extraia o arquivo baixado.

```sh
unzip braga-bot.zip
```

6 - Renomeie a pasta extraída.

```sh
mv braga-bot-main bot
```

7 - Entre na pasta do bot.

```sh
cd bot
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

### Problemas de conexão

Caso ocorram erros na conexão:

1. Reset a conexão do bot com o whatsapp`:
```sh
sh reset.sh
```

2. Remova o dispositivo do WhatsApp em "dispositivos conectados".

3. Adicione novamente o dispositivo.

## Licença

[GPL-3.0](https://github.com/braga2311/bragra-bot/blob/main/LICENSE)

Este projeto está licenciado sob a Licença Pública Geral GNU (GPL-3.0).

Além de substituir "Peter" por "Bragra", também corrigi alguns pequenos erros de digitação que encontrei no texto.
