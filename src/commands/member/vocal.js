const { PREFIX } = require(`${BASE_DIR}/config`);
const fs = require('fs');
const path = require('path');
const { TEMP_DIR } = require(`${BASE_DIR}/config`);
const { sendAudioFromFile, sendErrorReply, sendWaitReply } = require(`${BASE_DIR}/utils`);
const wav = require('wav'); // Biblioteca para manipulação WAV

// Garante diretório temporário
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

module.exports = {
  name: "vocal",
  description: "Extrai vocais de áudio usando DSP puro",
  commands: ["vocal", "isolavocal"],
  usage: `${PREFIX}vocal (responda a um áudio)`,
  handle: async ({ quotedMsg }) => {
    if (!quotedMsg || !quotedMsg.audio) {
      await sendErrorReply("⚠ Responda a um áudio para extrair os vocais!");
      return;
    }

    await sendWaitReply("🔊 Processando áudio (isso pode levar alguns segundos)...");

    const timestamp = Date.now();
    const inputPath = path.join(TEMP_DIR, `input_${timestamp}.wav`);
    const outputPath = path.join(TEMP_DIR, `vocal_${timestamp}.wav`);

    try {
      // 1. Baixa o áudio
      const audioBuffer = await quotedMsg.downloadMedia();

      // 2. Converte para WAV (garante formato compatível)
      await writeWavFile(inputPath, audioBuffer);

      // 3. Processa a extração vocal (retorna buffer do vocal isolado)
      const vocalBuffer = await processVocalExtraction(inputPath, outputPath);

      // 4. Envia o arquivo de áudio com vocal isolado
      await sendAudioFromFile(outputPath, false, null, "🎤 Vocal extraído com DSP!");

    } catch (error) {
      console.error('Erro no processamento:', error);
      await sendErrorReply("❌ Erro ao processar áudio. Formato não suportado ou falha interna.");
    } finally {
      // Limpa arquivos temporários
      try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
      try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
    }
  },
};

// Escreve um arquivo WAV válido a partir do buffer bruto (simplificado)
// Para uso real, ideal usar uma lib especializada que converta formatos
async function writeWavFile(filePath, buffer) {
  return new Promise((resolve, reject) => {
    // Supondo que o buffer já é WAV válido
    // Se não for, aqui seria o lugar para converter (ex: via ffmpeg)
    fs.writeFile(filePath, buffer, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Processa a extração vocal via isolamento do canal central
async function processVocalExtraction(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const reader = new wav.Reader();
    const writer = new wav.FileWriter(outputPath);

    // Stream de leitura do arquivo
    const fileStream = fs.createReadStream(inputPath);

    fileStream.pipe(reader);

    reader.on('format', (format) => {
      // Configura writer com os mesmos parâmetros
      writer.setFormat(format);

      // Ao ler dados, processa para isolar vocal
      reader.on('data', (chunk) => {
        let processedChunk;
        if (format.channels === 2) {
          processedChunk = isolateCenterChannel(chunk, format.bitDepth);
        } else {
          processedChunk = highPassFilter(chunk, format.sampleRate);
        }
        writer.write(processedChunk);
      });

      reader.on('end', () => {
        writer.end();
      });

      writer.on('finish', () => {
        resolve(fs.readFileSync(outputPath));
      });
    });

    reader.on('error', reject);
    writer.on('error', reject);
    fileStream.on('error', reject);
  });
}

// Isola o canal central para estéreo
function isolateCenterChannel(buffer, bitDepth) {
  const bytesPerSample = bitDepth / 8;
  const processed = Buffer.alloc(buffer.length);

  for (let i = 0; i < buffer.length; i += bytesPerSample * 2) {
    const left = readSample(buffer, i, bytesPerSample);
    const right = readSample(buffer, i + bytesPerSample, bytesPerSample);
    // Isola vocal pela diferença dos canais
    const center = Math.floor((left - right) / 2);

    writeSample(processed, i, bytesPerSample, center);
    writeSample(processed, i + bytesPerSample, bytesPerSample, center);
  }

  return processed;
}

// Filtro passa-altas simples para mono
function highPassFilter(buffer, sampleRate) {
  const RC = 1.0 / (sampleRate * 0.0005);
  const dt = 1.0 / sampleRate;
  const alpha = RC / (RC + dt);

  const processed = Buffer.alloc(buffer.length);
  let prev = 0;

  for (let i = 0; i < buffer.length; i += 2) {
    const sample = buffer.readInt16LE(i);
    const filtered = alpha * (prev + sample - (sample * 1));
    processed.writeInt16LE(Math.round(filtered), i);
    prev = sample;
  }

  return processed;
}

// Helpers para leitura/escrita genérica dos samples
function readSample(buffer, offset, bytes) {
  switch (bytes) {
    case 1: return buffer.readInt8(offset);
    case 2: return buffer.readInt16LE(offset);
    case 3: return buffer.readIntLE(offset, 3);
    case 4: return buffer.readInt32LE(offset);
    default: throw new Error('BitDepth não suportado');
  }
}

function writeSample(buffer, offset, bytes, value) {
  switch (bytes) {
    case 1: buffer.writeInt8(value, offset); break;
    case 2: buffer.writeInt16LE(value, offset); break;
    case 3: buffer.writeIntLE(value, offset, 3); break;
    case 4: buffer.writeInt32LE(value, offset); break;
    default: throw new Error('BitDepth não suportado');
  }
}