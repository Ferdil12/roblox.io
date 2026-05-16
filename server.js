import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT || 8790);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

app.use(cors({ origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN }));
app.use(express.json({ limit: "32kb" }));

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildMessage(body) {
  const user = escapeHtml(body.robloxUser);
  const id = escapeHtml(body.robloxId);
  const fruit = escapeHtml(body.fruitName);
  const label = escapeHtml(body.label);
  const tier = escapeHtml(body.tier);
  const time = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  return [
    "🎁 <b>Новая заявка — Blox Fruits</b>",
    "",
    "👤 <b>Ник:</b> " + user,
    "🆔 <b>User ID:</b> <code>" + id + "</code>",
    "🍇 <b>Приз:</b> " + fruit + " (" + label + ")",
    tier ? "⭐ <b>Редкость:</b> " + tier : "",
    "🕐 " + time
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeChatId(raw) {
  const value = String(raw || "").trim().replace(/^["']|["']$/g, "");
  if (!value) return "";
  if (/^-?\d+$/.test(value)) return value;
  return value;
}

function explainTelegramError(data) {
  const code = data?.error_code;
  const desc = data?.description || "Неизвестная ошибка Telegram";
  const hints = {
    401: "Неверный TELEGRAM_BOT_TOKEN. Скопируй токен заново из @BotFather.",
    400:
      "Неверный Chat ID или ты ещё не написал боту /start. Напиши боту в личку и возьми id из getUpdates.",
    403: "Ты заблокировал бота. Разблокируй в Telegram и нажми /start.",
    404: "Chat ID не найден. Проверь TELEGRAM_CHAT_ID в bridge/.env."
  };
  const hint = hints[code] ? " " + hints[code] : "";
  return "Telegram [" + code + "]: " + desc + hint;
}

async function sendTelegram(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error("Создай bridge/.env из .env.example и укажи TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID");
  }
  const chatId = normalizeChatId(CHAT_ID);
  const url = "https://api.telegram.org/bot" + BOT_TOKEN.trim() + "/sendMessage";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(explainTelegramError(data));
  }
  return data;
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    telegramConfigured: Boolean(BOT_TOKEN && CHAT_ID),
    chatId: CHAT_ID ? normalizeChatId(CHAT_ID) : null
  });
});

app.get("/api/test", async (_req, res) => {
  try {
    await sendTelegram("✅ Тест: бот работает. Заявки с сайта будут приходить сюда.");
    res.json({ ok: true, message: "Сообщение отправлено в Telegram" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || "Ошибка" });
  }
});

app.post("/api/entry", async (req, res) => {
  try {
    const { robloxUser, robloxId, fruitName, label, tier } = req.body || {};
    const user = String(robloxUser || "").trim();
    const id = String(robloxId || "").trim();

    if (!user || user.length > 64) {
      return res.status(400).json({ error: "Некорректный ник" });
    }
    if (!/^[a-zA-Z0-9_.]{3,32}$/.test(id)) {
      return res.status(400).json({ error: "User ID: буквы и цифры, 3–32 символа" });
    }

    const text = buildMessage({
      robloxUser: user,
      robloxId: id,
      fruitName: fruitName || "—",
      label: label || "—",
      tier: tier || ""
    });

    await sendTelegram(text);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Ошибка отправки" });
  }
});

app.listen(PORT, () => {
  console.log("Telegram bridge: http://localhost:" + PORT);
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("Заполни TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в bridge/.env");
  }
});
