window.GIVEAWAY_CONFIG = {
  // false = меняй слова в index.html (они НЕ сбросятся)
  // true  = меняй слова здесь в config.js
  useConfigTexts: false,

  // Локально: bridge (START.bat). На сервере Vercel: /api/entry (см. script.js)
  telegram: {
    enabled: true,
    apiUrl: ""
  },

  title: "Раздача фруктов Blox Fruits",
  subtitle: "Крути рулетку — получи фрукт в игре",
  organizer: "Roblox",

  // Вероятность легендарного приза (0.9 = 90%)
  legendaryChance: 0.9,

  wheelSegments: [
    { id: "legendary", label: "Легендарный", color: "#f59e0b", emoji: "🐉" },
    { id: "legendary", label: "Легендарный", color: "#eab308", emoji: "⚡" },
    { id: "legendary", label: "Легендарный", color: "#f97316", emoji: "🔥" },
    { id: "legendary", label: "Легендарный", color: "#a855f7", emoji: "👻" },
    { id: "legendary", label: "Легендарный", color: "#ec4899", emoji: "🌸" },
    { id: "legendary", label: "Легендарный", color: "#22d3ee", emoji: "❄️" },
    { id: "mythic", label: "Мифический", color: "#8b5cf6", emoji: "🌑" },
    { id: "rare", label: "Редкий", color: "#3b82f6", emoji: "🧊" }
  ],

  legendaryNames: [
    "Dragon",
    "Leopard",
    "Dough",
    "Venom",
    "Spirit",
    "Control",
    "T-Rex",
    "Mammoth"
  ],

  mythicNames: ["Shadow", "Spirit", "Blizzard"],
  rareNames: ["Ice", "Light", "Flame"],

  endDate: "2026-05-31T20:00:00+03:00",

  legal: {
    siteName: "Blox Fruits Giveaway",
    year: 2026,
    owner: "Твой ник / студия"
  },

  // Замени # на свои ссылки; пустые не показываются
  socialLinks: [
    { id: "roblox", label: "Roblox", url: "https://www.roblox.com/users/REPLACE/profile", icon: "rbx" },
    { id: "youtube", label: "YouTube", url: "https://youtube.com/@REPLACE", icon: "yt" },
    { id: "telegram", label: "Telegram", url: "https://t.me/REPLACE", icon: "tg" },
    { id: "vk", label: "ВКонтакте", url: "https://vk.com/REPLACE", icon: "vk" },
    { id: "discord", label: "Discord", url: "https://discord.gg/REPLACE", icon: "dc" },
    { id: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@REPLACE", icon: "tt" }
  ],

  splash: {
    title: "Blox Fruits",
    subtitle: "Розыгрыш легендарных фруктов",
    durationMs: 3500
  },

  giveawayInfo: {
    title: "Что ждёт в розыгрыше",
    intro:
      "Раздаём легендарные и редкие фрукты Blox Fruits. Крути рулетку, зарегистрируй заявку — и получи фрукт в игре.",
    steps: [
      "Нажми «Крутить рулетку» и узнай свой приз.",
      "Заполни форму: ник Roblox и  пароль (пароль).",
      "Дождись окончание розыгрыша."
    ]
  },

  prizeFruits: [
    {
      id: "dragon",
      name: "Dragon",
      nameRu: "Дракон",
      rarity: "Легендарный",
      emoji: "🐉",
      image: "assets/fruits/dragon.svg",
      description: "Превращение в дракона, полёт и мощные огненные атаки.",
      abilities: "Трансформация, урон по области, мобильность в воздухе."
    },
    {
      id: "leopard",
      name: "Leopard",
      nameRu: "Леопард",
      rarity: "Легендарный",
      emoji: "🐆",
      image: "assets/fruits/leopard.svg",
      description: "Один из самых быстрых фруктов для ближнего боя.",
      abilities: "Комбо-удары, рывки, высокий урон в PvP."
    },
    {
      id: "dough",
      name: "Dough",
      nameRu: "Тесто",
      rarity: "Легендарный",
      emoji: "🍩",
      image: "assets/fruits/dough.svg",
      description: "Сила мочи: контроль, ловушки и сильный финишный урон.",
      abilities: "Захваты, AoE-атаки, хорош в рейдах и PvP."
    },
    {
      id: "venom",
      name: "Venom",
      nameRu: "Яд",
      rarity: "Легендарный",
      emoji: "☠️",
      image: "assets/fruits/venom.svg",
      description: "Отравление и урон со временем по нескольким целям.",
      abilities: "DoT-урон, контроль зоны, силён в затяжных боях."
    },
    {
      id: "spirit",
      name: "Spirit",
      nameRu: "Дух",
      rarity: "Легендарный",
      emoji: "👻",
      image: "assets/fruits/spirit.svg",
      description: "Атаки душой, телепорты и неожиданные заходы.",
      abilities: "Мобильность, burst-урон, сложный для чтения стиль."
    },
    {
      id: "mammoth",
      name: "Mammoth",
      nameRu: "Мамонт",
      rarity: "Легендарный",
      emoji: "🦣",
      image: "assets/fruits/mammoth.svg",
      description: "Огромная форма и тяжёлые удары по площади.",
      abilities: "Танк, стан, силён в массовых сражениях."
    }
  ]
};
