const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

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
  const time = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  return [
    "🎁 <b>Новая заявка — Blox Fruits</b>",
    "",
    "👤 <b>Ник:</b> " + user,
    "🆔 <b>User ID:</b> <code>" + id + "</code>",
    "🍇 <b>Приз:</b> " + fruit + " (" + label + ")",
    "🕐 " + time
  ].join("\n");
}

async function sendTelegram(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error("На сервере не заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID");
  }
  const url = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.description || "Ошибка Telegram");
  }
  return data;
}

module.exports = async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Только POST" });
    return;
  }

  try {
    const body = req.body || {};
    const user = String(body.robloxUser || "").trim();
    const id = String(body.robloxId || "").trim();

    if (!user || user.length > 64) {
      res.status(400).json({ ok: false, error: "Некорректный ник" });
      return;
    }
    if (!/^[a-zA-Z0-9_.]{3,32}$/.test(id)) {
      res.status(400).json({ ok: false, error: "User ID: буквы и цифры, 3–32 символа" });
      return;
    }

    await sendTelegram(
      buildMessage({
        robloxUser: user,
        robloxId: id,
        fruitName: body.fruitName || "—",
        label: body.label || "—"
      })
    );

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || "Ошибка отправки" });
  }
};
