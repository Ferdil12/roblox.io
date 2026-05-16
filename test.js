const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (!BOT_TOKEN || !CHAT_ID) {
    res.status(500).json({ ok: false, error: "Нет TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID на сервере" });
    return;
  }

  try {
    const url = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: "✅ Сайт на сервере работает. Заявки будут приходить сюда."
      })
    });
    const data = await r.json();
    if (!data.ok) {
      res.status(500).json({ ok: false, error: data.description });
      return;
    }
    res.status(200).json({ ok: true, message: "Сообщение отправлено в Telegram" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
