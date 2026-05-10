import * as baileys from "@whiskeysockets/baileys";
const { 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason 
} = baileys;
const makeWASocket = baileys.default;


const dbPath = './database.json';
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ users: {}, chats: {}, characters: {} }));

global.db = {
  data: JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
};


setInterval(() => {
  fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
}, 30000);


import pino from "pino";
import { Boom } from "@hapi/boom";
import figlet from "figlet";
import chalk from "chalk";
import { exec } from "child_process";
import readline from "readline";
import fs from "fs";

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(text, (answer) => { rl.close(); resolve(answer); }));
};

global.plugins = {};
const loadPlugins = async () => {
  const pluginFolder = "./plugins";
  if (!fs.existsSync(pluginFolder)) fs.mkdirSync(pluginFolder);
  const pluginFiles = fs.readdirSync(pluginFolder).filter(file => file.endsWith(".js"));
  for (const file of pluginFiles) {
    const module = await import(`./plugins/${file}`);
    global.plugins[file] = module.default;
  }
  console.log(chalk.blue(`[SISTEMA] ${Object.keys(global.plugins).length} Plugins cargados.`));
};

async function startBot() {
  console.clear();
  await loadPlugins();

  figlet("Deku Bot MD", (err, data) => {
    if (!err) console.log(chalk.green(data));
    console.log(chalk.green("🔥 Iniciando sistema de héroes...\n"));
  });

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "20.0.0"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
  });

  if (!sock.authState.creds.registered) {
    let number = await question(chalk.cyan("📱 Introduce tu número (Ej: 549...): "));
    number = number.replace(/[^0-9]/g, "");
    if (!number) process.exit(1);
    const code = await sock.requestPairingCode(number);
    console.log(chalk.black.bgGreen("\n TU CÓDIGO DE VINCULACIÓN: "), chalk.bold.white(code), "\n");
  }

  sock.ev.on("messages.upsert", async (chatUpdate) => {
    const m = chatUpdate.messages[0];
    if (!m.message) return;
    const { handler } = await import("./handler.js");
    await handler(sock, m, chatUpdate);
  });

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) startBot();
      else process.exit(0);
    }
    if (connection === "open") {
      console.log(chalk.green("✅ Deku conectado con éxito."));
      exec("rm -rf tmp && mkdir tmp");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

startBot();
