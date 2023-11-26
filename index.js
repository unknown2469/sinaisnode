const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const Mutex = require('async-mutex').Mutex;
const fs = require('fs');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '6779734021:AAE_qVNt11LN0Z0qPrc0SAD_I3ZEiBCKRnk';
const GRUPO_ID = process.env.TELEGRAM_GROUP_ID || '-1002084016436';

const mutex = new Mutex();
const mutexFile = 'bot_running.lock';

const OPORTUNIDADES = [
  "🤑🤑 Oportunidade Identificada 🤑🤑\n\n🐯 Fortune Tiger\n🔥 Nº de Jogadas: {jogadas}\n⏰ Validade: {validade} minutos\n\n🚨 FUNCIONA APENAS NA PLATAFORMA ABAIXO! ⬇️\n\nhttps://go.aff.brx.bet/2fvsykpf",
  "🤑🤑 Oportunidade Identificada 🤑🤑\n\n🐯 Fortune Ox\n🔥 Nº de Jogadas: {jogadas}\n⏰ Validade: {validade} minutos\n\n🚨 FUNCIONA APENAS NA PLATAFORMA ABAIXO! ⬇️\n\nhttps://go.aff.brx.bet/9clq61mf",
  "🤑🤑 Oportunidade Identificada 🤑🤑\n\n🐯 Fortune Mouse\n🔥 Nº de Jogadas: {jogadas}\n⏰ Validade: {validade} minutos\n\n🚨 FUNCIONA APENAS NA PLATAFORMA ABAIXO! ⬇️\n\nhttps://go.aff.brx.bet/xrgx1j9v",
  "🤑🤑 Oportunidade Identificada 🤑🤑\n\n🐯 Fortune Rabbit\n🔥 Nº de Jogadas: {jogadas}\n⏰ Validade: {validade} minutos\n\n🚨 FUNCIONA APENAS NA PLATAFORMA ABAIXO! ⬇️\n\nhttps://brx.bet/casino/pgsoft/fortune-rabbit"
];

// Evite a execução concorrente do script
function checkIfBotIsRunning() {
  if (fs.existsSync(mutexFile)) {
    console.log('Bot is already running. Exiting.');
    process.exit(1);
  } else {
    fs.writeFileSync(mutexFile, '1');
  }
}

function releaseLock() {
  fs.unlinkSync(mutexFile);
}

process.on('exit', releaseLock);
process.on('SIGINT', releaseLock);
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err}`);
  releaseLock();
  process.exit(1);
});

function scheduleOpportunities(bot, times) {
  console.log("Iniciando o agendamento...");

  times.forEach((time) => {
    const [hour, minute] = time.split(':');
    const rule = new schedule.RecurrenceRule();
    rule.hour = parseInt(hour, 10);
    rule.minute = parseInt(minute, 10);
    rule.tz = 'America/Sao_Paulo'; // Substitua pelo fuso horário desejado

    schedule.scheduleJob(rule, () => enviarOportunidade(bot, GRUPO_ID));
  });

  console.log("Tarefas agendadas adicionadas com sucesso.");
}

async function enviarOportunidade(bot, chatId) {
  try {
    const oportunidadeTemplate = OPORTUNIDADES[Math.floor(Math.random() * OPORTUNIDADES.length)];
    const jogadas = Math.floor(Math.random() * (15 - 4 + 1)) + 4;
    const validade = [5, 7, 10, 15][Math.floor(Math.random() * 4)];
    const oportunidade = oportunidadeTemplate.replace('{jogadas}', jogadas).replace('{validade}', validade);

    await bot.sendMessage(chatId, oportunidade);
  } catch (error) {
    console.error(`Erro ao enviar mensagem: ${error}`);
  } finally {
    mutex.release();
  }
}

function main() {
  checkIfBotIsRunning();

  const bot = new TelegramBot(TOKEN);

  // Configuração do webhook
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(bodyParser.json());

  app.post(`/${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  bot.setWebHook(`https://seu-app-heroku.herokuapp.com/${"6779734021:AAE_qVNt11LN0Z0qPrc0SAD_I3ZEiBCKRnk"}`);

  app.listen(PORT, () => {
    console.log(`Servidor está ouvindo na porta ${PORT}`);
  });

  const horarios = ["07:04", "09:50", "10:55", "11:37", "11:45", "12:49", "13:47", "14:02",
    "16:10", "16:17", "16:41", "17:31", "17:45", "18:18", "18:30",
    "18:55", "19:45", "21:30", "22:37", "23:01" "23:59", "02:33", "04:23", "06:46"];

  scheduleOpportunities(bot, horarios);
}

main();
