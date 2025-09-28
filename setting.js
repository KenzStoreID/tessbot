// setting.js
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export default {
  // Token dari BotFather (.env atau langsung isi string di sini)
  token: "7308221343:AAFzOPsjpSiZ4l3lWW-JmikMcwy4C5YLQpI",

  // Admin ID (array), isi dengan Telegram user ID admin
  adminIds: [7654518224], // contoh, ganti dengan ID kamu

  // Lokasi folder untuk simpan data JSON
  dataDir: "./data",
  usersFile: path.join("./data", "users.json"),

  // Opsi bot
  polling: true,   // true = long polling, false = webhook
};
