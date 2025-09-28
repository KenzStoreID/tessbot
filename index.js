import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import settings from "./setting.js";

// ===== Setup bot =====
if (!settings.token || settings.token === "YOUR_BOT_TOKEN_HERE") {
  console.error("BOT_TOKEN belum diatur di .env atau setting.js");
  process.exit(1);
}

const bot = new TelegramBot(settings.token, { polling: settings.polling });

// Pastikan folder data ada
if (!fs.existsSync(settings.dataDir)) fs.mkdirSync(settings.dataDir);

function loadUsers() {
  if (!fs.existsSync(settings.usersFile)) return {};
  return JSON.parse(fs.readFileSync(settings.usersFile, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(settings.usersFile, JSON.stringify(users, null, 2), "utf-8");
}

// ===== Commands =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const users = loadUsers();
  users[msg.from.id] = {
    id: msg.from.id,
    username: msg.from.username,
    first_name: msg.from.first_name,
    last_name: msg.from.last_name,
  };
  saveUsers(users);

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Simpan nomor", callback_data: "save_number" }],
        [{ text: "Jumlah user", callback_data: "count_users" }],
      ],
    },
  };

  bot.sendMessage(
    chatId,
    `Halo ${msg.from.first_name || msg.from.username}! 👋\n\nKetik /help untuk perintah lain.`,
    opts
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `/start - Mulai & daftar\n/help - Bantuan\n/echo <text> - Ulangi teks\n/save <key> <value> - Simpan data\n/users - Jumlah user (admin saja)`
  );
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, match[1]);
});

bot.onText(/\/save (.+)/, (msg, match) => {
  const args = match[1].split(" ");
  if (args.length < 2) {
    bot.sendMessage(msg.chat.id, "Gunakan: /save <key> <value>");
    return;
  }
  const key = args[0];
  const value = args.slice(1).join(" ");
  const users = loadUsers();
  const uid = msg.from.id.toString();
  const user = users[uid] || {};
  user.data = user.data || {};
  user.data[key] = value;
  users[uid] = user;
  saveUsers(users);

  bot.sendMessage(msg.chat.id, `Disimpan: ${key} = ${value}`);
});

bot.onText(/\/users/, (msg) => {
  if (settings.adminIds.length && !settings.adminIds.includes(msg.from.id)) {
    bot.sendMessage(msg.chat.id, "Anda bukan admin.");
    return;
  }
  const users = loadUsers();
  bot.sendMessage(msg.chat.id, `Ada ${Object.keys(users).length} user tersimpan.`);
});

// Callback query
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  if (query.data === "save_number") {
    bot.sendMessage(
      chatId,
      "Ketik /save wa <nomor> untuk simpan nomor WhatsApp.\nContoh: /save wa 628123456789"
    );
  } else if (query.data === "count_users") {
    const users = loadUsers();
    bot.sendMessage(chatId, `Ada ${Object.keys(users).length} user tersimpan.`);
  }
  bot.answerCallbackQuery(query.id);
});

// Unknown command
bot.on("message", (msg) => {
  if (msg.text && msg.text.startsWith("/")) {
    const known = ["/start", "/help", "/echo", "/save", "/users"];
    if (!known.some((cmd) => msg.text.startsWith(cmd))) {
      bot.sendMessage(msg.chat.id, "Perintah tidak dikenali. Ketik /help untuk daftar perintah.");
    }
  }
});

console.log("Bot berjalan (long polling). Tekan Ctrl+C untuk stop.");

