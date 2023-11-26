const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const { DateTime } = require('luxon');

// Substitua 'SEU_TOKEN_AQUI' pelo token gerado pelo BotFather
const TOKEN = '6779734021:AAGf0u69zvWo_kP4ZO_jXZ1Cx1FG94tsQoE';

// Substitua 'SEU_GRUPO_AQUI' pelo ID do grupo para o qual deseja enviar sinais
const GRUPO_ID = '-1002084016436';

const OPORTUNIDADES = [
  "🤑🤑 Oportunidade Identificada 🤑🤑\n\n🐯 Fortune Tiger\n🔥 Nº de Jogadas: {jogadas}\n⏰ Validade: {validade} minutos\n\n🚨 FUNCIONA APENAS NA PLATAFORMA ABAIXO! ⬇️\n\nhttps://go.aff.brx.bet/2fvsykpf",
  "🤑🤑 Oportunidade Identificada 🤑🤑\n\n🐯 Fortune Ox\n🔥 Nº de Jogadas: {jogadas}\n⏰ Validade: {validade} minutos\n\n🚨 FUNCIONA APENAS NA PLATAFORMA ABAIXO! ⬇️\n\nhttps://go.aff.brx.bet/9clq61mf",
  "🤑🤑 Oportunidade Identificada 🤑🤑\n\n🐯 Fortune Mouse\n🔥 Nº de Jogadas: {jogadas}\n⏰ Validade: {validade} minutos\n\n🚨 FUNCIONA APENAS NA PLATAFORMA ABAIXO! ⬇️\n\nhttps://go.aff.brx.bet/xrgx1j9v",
  "🤑🤑 Oportunidade Identificada 🤑🤑\n\n🐯 Fortune Rabbit\n🔥 Nº de Jogadas: {jogadas}\n⏰ Validade: {validade} minutos\n\n🚨 FUNCIONA APENAS NA PLATAFORMA ABAIXO! ⬇️\n\nhttps://brx.bet/casino/pgsoft/fortune-rabbit"
];

// Mutex para controle de concorrência
const mutexFile = 'bot_running.lock';

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

// Chame a função no início do seu script
checkIfBotIsRunning();

// Chame a função no final do seu script ou em um manipulador de eventos de saída
// para garantir que o arquivo de bloqueio seja removido mesmo em caso de erro ou interrupção
// do processo
process.on('exit', releaseLock);
process.on('SIGINT', releaseLock);
process.on('uncaughtException', releaseLock);

function enviarOportunidade(bot, chatId) {
  // Tenta obter o bloqueio do mutex
  if (!mutex.lock()) {
    console.log('Tentativa de envio concorrente bloqueada.');
    return;
  }

  const oportunidadeTemplate = OPORTUNIDADES[Math.floor(Math.random() * OPORTUNIDADES.length)];
  const jogadas = Math.floor(Math.random() * (15 - 4 + 1)) + 4;
  const validade = [5, 7, 10, 15][Math.floor(Math.random() * 4)];
  const oportunidade = oportunidadeTemplate.replace('{jogadas}', jogadas).replace('{validade}', validade);

  bot.sendMessage(chatId, oportunidade).catch((error) => {
    console.error(`Erro ao enviar mensagem: ${error}`);
  }).finally(() => {
    // Libera o mutex após o envio
    mutex.unlock();
  });
}

function agendarOportunidades(bot, horarios) {
  console.log("Iniciando o agendamento...");

  horarios.forEach((horario) => {
    const [hora, minuto] = horario.split(':');
    const rule = new schedule.RecurrenceRule();
    rule.hour = parseInt(hora, 10);
    rule.minute = parseInt(minuto, 10);

    schedule.scheduleJob(rule, () => enviarOportunidade(bot, GRUPO_ID));
  });

  console.log("Tarefas agendadas adicionadas com sucesso.");
}

function main() {
  const bot = new TelegramBot(TOKEN, { polling: true });

  bot.on('polling_error', (error) => {
    console.error(`Erro de polling: ${error}`);
    // Pode ser útil adicionar um tempo de espera aqui antes de reiniciar o polling
    setTimeout(() => bot.startPolling({ interval: 3000 }), 5000);
  });

  const horarios = ["07:04", "09:50", "10:55", "11:37", "11:45", "12:49", "13:47", "14:02",
    "16:10", "16:17", "16:41", "17:31", "17:45", "18:18", "18:30",
    "18:55", "19:33", "21:30", "22:37", "23:59", "02:33", "04:23", "06:46"];

  agendarOportunidades(bot, horarios);
}

main();
