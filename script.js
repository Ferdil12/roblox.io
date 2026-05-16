(function () {
  const cfg = window.GIVEAWAY_CONFIG || {};
  const STORAGE_KEY = "bf_giveaway_entries";
  const legendaryChance = typeof cfg.legendaryChance === "number" ? cfg.legendaryChance : 0.9;
  const segments = cfg.wheelSegments || [];

  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");
  const organizerLine = document.getElementById("organizerLine");
  const wheelCanvas = document.getElementById("wheelCanvas");
  const spinBtn = document.getElementById("spinBtn");
  const resultLine = document.getElementById("resultLine");
  const claimModal = document.getElementById("claimModal");
  const claimForm = document.getElementById("claimForm");
  const modalTitle = document.getElementById("modalTitle");
  const modalPrize = document.getElementById("modalPrize");
  const successModal = document.getElementById("successModal");
  const successText = document.getElementById("successText");
  const successOk = document.getElementById("successOk");
  const closeModal = document.getElementById("closeModal");
  const floatFruits = document.getElementById("floatFruits");
  const particles = document.getElementById("particles");
  const adminPanel = document.getElementById("adminPanel");
  const exportBtn = document.getElementById("exportBtn");
  const entriesList = document.getElementById("entriesList");
  const timerBlock = document.getElementById("timerBlock");
  const timerEl = document.getElementById("timer");
  const splash = document.getElementById("splash");
  const splashTag = document.getElementById("splashTag");
  const splashSub = document.getElementById("splashSub");
  const splashProgress = document.getElementById("splashProgress");
  const splashSkip = document.getElementById("splashSkip");
  const mainContent = document.getElementById("mainContent");
  const socialNav = document.getElementById("socialNav");
  const copyrightLine = document.getElementById("copyrightLine");
  const rbxBlocks = document.getElementById("rbxBlocks");
  const giveawayInfoTitle = document.getElementById("giveawayInfoTitle");
  const giveawayInfoIntro = document.getElementById("giveawayInfoIntro");
  const registerSteps = document.getElementById("registerSteps");
  const fruitsGrid = document.getElementById("fruitsGrid");

  let spinning = false;
  let wheelRotation = 0;
  let lastWin = null;

  const useConfigTexts = cfg.useConfigTexts === true;

  if (useConfigTexts) {
    if (cfg.title && pageTitle) pageTitle.textContent = cfg.title;
    if (cfg.subtitle && pageSubtitle) pageSubtitle.textContent = cfg.subtitle;
    if (cfg.organizer && organizerLine) {
      organizerLine.textContent = "Организатор: " + cfg.organizer;
    }
  }

  function isValidSocialUrl(url) {
    return (
      typeof url === "string" &&
      url.startsWith("http") &&
      !url.includes("REPLACE")
    );
  }

  function renderSocialLinks() {
    if (!socialNav) return;
    socialNav.innerHTML = "";
    (cfg.socialLinks || []).forEach(function (item) {
      if (!isValidSocialUrl(item.url)) return;
      const a = document.createElement("a");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "social-link social-" + (item.icon || item.id || "link");
      a.textContent = item.label || item.id;
      socialNav.appendChild(a);
    });
    if (!socialNav.children.length && useConfigTexts) {
      const p = document.createElement("p");
      p.className = "field-hint";
      p.textContent = "Добавь ссылки в config.js → socialLinks";
      socialNav.appendChild(p);
    }
  }

  function renderLegalFooter() {
    if (!useConfigTexts || !copyrightLine) return;
    const legal = cfg.legal || {};
    const year = legal.year || new Date().getFullYear();
    const custom = legal.footerText;
    copyrightLine.textContent = custom || "© " + year + " · Все права защищены.";
  }

  function renderGiveawayInfo() {
    const info = cfg.giveawayInfo || {};
    if (useConfigTexts) {
      if (giveawayInfoTitle && info.title) giveawayInfoTitle.textContent = info.title;
      if (giveawayInfoIntro && info.intro) giveawayInfoIntro.textContent = info.intro;
    } else if (giveawayInfoIntro && info.intro && !giveawayInfoIntro.textContent.trim()) {
      giveawayInfoIntro.textContent = info.intro;
    }
    if (!registerSteps) return;
    registerSteps.innerHTML = "";
    const steps = info.steps || [];
    steps.forEach(function (step) {
      const li = document.createElement("li");
      li.textContent = step;
      registerSteps.appendChild(li);
    });
  }

  function renderFruitCatalog() {
    if (!fruitsGrid) return;
    fruitsGrid.innerHTML = "";
    const fruits = cfg.prizeFruits || [];
    fruits.forEach(function (fruit) {
      const card = document.createElement("article");
      card.className = "fruit-card";

      const imgWrap = document.createElement("div");
      imgWrap.className = "fruit-img-wrap";
      const img = document.createElement("img");
      img.className = "fruit-img";
      img.alt = fruit.nameRu || fruit.name || "Фрукт";
      img.loading = "lazy";
      img.width = 120;
      img.height = 120;
      if (fruit.image) img.src = fruit.image;
      img.onerror = function () {
        img.remove();
        const fallback = document.createElement("span");
        fallback.className = "fruit-emoji-fallback";
        fallback.textContent = fruit.emoji || "🍇";
        imgWrap.appendChild(fallback);
      };
      imgWrap.appendChild(img);

      const body = document.createElement("div");
      body.className = "fruit-body";
      const title = document.createElement("h3");
      title.textContent = (fruit.nameRu || fruit.name) + " (" + fruit.name + ")";
      const rarity = document.createElement("p");
      rarity.className = "fruit-rarity";
      rarity.textContent = fruit.rarity || "Приз";
      const desc = document.createElement("p");
      desc.className = "fruit-desc";
      desc.textContent = fruit.description || "";
      const ab = document.createElement("p");
      ab.className = "fruit-abilities";
      ab.innerHTML = "<strong>Способности:</strong> " + (fruit.abilities || "—");

      body.appendChild(title);
      body.appendChild(rarity);
      body.appendChild(desc);
      body.appendChild(ab);

      card.appendChild(imgWrap);
      card.appendChild(body);
      fruitsGrid.appendChild(card);
    });
  }

  function spawnRbxBlocks() {
    if (!rbxBlocks) return;
    const colors = ["#e2231a", "#00a2ff", "#f5cd30", "#39ff14", "#ff6b6b"];
    for (let i = 0; i < 14; i += 1) {
      const b = document.createElement("span");
      b.className = "rbx-block";
      b.style.left = Math.random() * 100 + "%";
      b.style.animationDelay = Math.random() * 8 + "s";
      b.style.animationDuration = 10 + Math.random() * 12 + "s";
      b.style.background = colors[i % colors.length];
      b.style.width = 14 + Math.floor(Math.random() * 18) + "px";
      b.style.height = b.style.width;
      rbxBlocks.appendChild(b);
    }
  }

  function hideSplash() {
    if (!splash) return;
    splash.classList.add("splash-out");
    document.body.classList.add("app-ready");
    setTimeout(function () {
      splash.remove();
    }, 500);
  }

  function runSplash() {
    const splashCfg = cfg.splash || {};
    const duration = splashCfg.durationMs || 3200;
    if (useConfigTexts) {
      if (splashTag && splashCfg.title) splashTag.textContent = splashCfg.title;
      if (splashSub && splashCfg.subtitle) splashSub.textContent = splashCfg.subtitle;
    }

    let start = performance.now();
    let done = false;

    function finish() {
      if (done) return;
      done = true;
      hideSplash();
    }

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      if (splashProgress) splashProgress.style.width = t * 100 + "%";
      if (t < 1 && !done) requestAnimationFrame(frame);
      else finish();
    }

    if (splashSkip) splashSkip.addEventListener("click", finish);
    requestAnimationFrame(frame);
    setTimeout(finish, duration + 400);
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function rollPrize() {
    const tier =
      Math.random() < legendaryChance
        ? "legendary"
        : Math.random() < 0.65
          ? "mythic"
          : "rare";
    const names =
      tier === "legendary"
        ? cfg.legendaryNames || ["Legendary Fruit"]
        : tier === "mythic"
          ? cfg.mythicNames || ["Mythic Fruit"]
          : cfg.rareNames || ["Rare Fruit"];
    const segPool = segments.filter((s) => s.id === tier);
    const seg = segPool.length ? pickRandom(segPool) : segments[0];
    return {
      tier,
      fruitName: pickRandom(names),
      label: seg ? seg.label : tier,
      emoji: seg ? seg.emoji : "🍇",
      color: seg ? seg.color : "#f59e0b"
    };
  }

  function segmentIndexForTier(tier) {
    const idx = segments.findIndex((s) => s.id === tier);
    return idx >= 0 ? idx : 0;
  }

  function drawWheel(rotationDeg) {
    if (!(wheelCanvas instanceof HTMLCanvasElement) || !segments.length) return;
    const ctx = wheelCanvas.getContext("2d");
    if (!ctx) return;

    const w = wheelCanvas.width;
    const h = wheelCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 6;
    const slice = (Math.PI * 2) / segments.length;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotationDeg * Math.PI) / 180);

    segments.forEach((seg, i) => {
      const start = i * slice;
      const end = start + slice;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, start, end);
      ctx.closePath();
      ctx.fillStyle = seg.color || "#444";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px Segoe UI, sans-serif";
      ctx.fillText(seg.emoji + " " + seg.label, r - 14, 5);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fillStyle = "#0c1022";
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  function spinToPrize(prize, onDone) {
    const targetIdx = segmentIndexForTier(prize.tier);
    const sliceDeg = 360 / segments.length;
    const centerOfSlice = targetIdx * sliceDeg + sliceDeg / 2;
    const extra = 6 * 360 + (360 - centerOfSlice);
    const from = wheelRotation;
    const to = from + extra;
    const duration = 4800;
    const start = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      wheelRotation = from + (to - from) * eased;
      drawWheel(wheelRotation);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        wheelRotation = to % 360;
        onDone();
      }
    }

    requestAnimationFrame(frame);
  }

  function burstParticles() {
    if (!particles) return;
    for (let i = 0; i < 24; i += 1) {
      const p = document.createElement("span");
      p.className = "burst";
      p.style.left = 50 + (Math.random() - 0.5) * 40 + "%";
      p.style.top = 40 + Math.random() * 20 + "%";
      p.style.setProperty("--dx", (Math.random() - 0.5) * 120 + "px");
      p.style.setProperty("--dy", -80 - Math.random() * 120 + "px");
      p.style.background = ["#f59e0b", "#a855f7", "#22d3ee", "#f97316"][
        Math.floor(Math.random() * 4)
      ];
      particles.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  function spawnFloatFruits() {
    if (!floatFruits) return;
    const emojis = ["🍇", "🐉", "🔥", "⚡", "👻", "🌸", "❄️", "🌑"];
    for (let i = 0; i < 10; i += 1) {
      const el = document.createElement("span");
      el.className = "fruit-float";
      el.textContent = emojis[i % emojis.length];
      el.style.left = Math.random() * 100 + "%";
      el.style.animationDelay = Math.random() * 6 + "s";
      el.style.animationDuration = 8 + Math.random() * 8 + "s";
      floatFruits.appendChild(el);
    }
  }

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveEntry(entry) {
    const list = loadEntries();
    list.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderEntries();
  }

  function getTelegramApiUrl() {
    const tg = cfg.telegram || {};
    if (tg.apiUrl) return tg.apiUrl;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8790/api/entry";
    }
    return "/api/entry";
  }

  async function sendEntryToTelegram(entry) {
    const tg = cfg.telegram || {};
    if (!tg.enabled) return { ok: true, skipped: true };

    const apiUrl = getTelegramApiUrl();
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      throw new Error(data.error || "Не удалось отправить в Telegram");
    }
    return data;
  }

  function renderEntries() {
    if (!entriesList) return;
    const list = loadEntries();
    entriesList.innerHTML = "";
    list
      .slice()
      .reverse()
      .forEach((e) => {
        const li = document.createElement("li");
        li.textContent =
          e.robloxUser +
          " · ID " +
          e.robloxId +
          " · " +
          e.fruitName +
          " (" +
          e.label +
          ") · " +
          new Date(e.at).toLocaleString("ru-RU");
        entriesList.appendChild(li);
      });
  }

  function openClaimModal(prize) {
    lastWin = prize;
    if (modalTitle) modalTitle.textContent = prize.emoji + " Поздравляем!";
    if (modalPrize) {
      modalPrize.textContent = prize.label + ": " + prize.fruitName;
      modalPrize.style.color = prize.color;
    }
    if (claimForm) claimForm.reset();
    if (claimModal && typeof claimModal.showModal === "function") {
      claimModal.showModal();
    }
  }

  if (spinBtn) {
    spinBtn.addEventListener("click", function () {
      if (spinning) return;
      spinning = true;
      spinBtn.disabled = true;
      if (resultLine) resultLine.hidden = true;

      const prize = rollPrize();
      spinToPrize(prize, function () {
        spinning = false;
        spinBtn.disabled = false;
        burstParticles();
        document.body.classList.add("win-flash");
        setTimeout(() => document.body.classList.remove("win-flash"), 600);

        if (resultLine) {
          resultLine.hidden = false;
          resultLine.textContent =
            "Выпало: " + prize.emoji + " " + prize.fruitName + " (" + prize.label + ")";
        }
        setTimeout(() => openClaimModal(prize), 400);
      });
    });
  }

  if (claimForm) {
    claimForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const userInput = document.getElementById("robloxUser");
      const idInput = document.getElementById("robloxId");
      if (!(userInput instanceof HTMLInputElement) || !(idInput instanceof HTMLInputElement)) {
        return;
      }
      const robloxUser = userInput.value.trim();
      const robloxId = idInput.value.trim();
      if (!robloxUser || !/^[a-zA-Z0-9_.]{3,32}$/.test(robloxId)) {
        alert("Проверь ник и User ID (буквы, цифры, 3–32 символа).");
        return;
      }
      if (!lastWin) return;

      const entry = {
        robloxUser,
        robloxId,
        fruitName: lastWin.fruitName,
        label: lastWin.label,
        tier: lastWin.tier,
        at: new Date().toISOString()
      };

      const submitBtn = claimForm.querySelector('button[type="submit"]');
      if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;

      saveEntry(entry);

      sendEntryToTelegram(entry)
        .then(function () {
          if (claimModal && typeof claimModal.close === "function") claimModal.close();
          if (successText) {
            successText.textContent =
              "Заявка для " +
              robloxUser +
              " отправлена. Фрукт «" +
              lastWin.fruitName +
              "» скоро передадим в игре.";
          }
          if (successModal && typeof successModal.showModal === "function") {
            successModal.showModal();
          }
        })
        .catch(function (err) {
          alert(
            "Заявка сохранена на сайте, но в Telegram не ушла:\n" +
              (err && err.message ? err.message : "запусти bridge и проверь .env")
          );
          if (claimModal && typeof claimModal.close === "function") claimModal.close();
        })
        .finally(function () {
          if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
        });
    });
  }

  if (closeModal && claimModal) {
    closeModal.addEventListener("click", function () {
      claimModal.close();
    });
  }

  if (successOk && successModal) {
    successOk.addEventListener("click", function () {
      successModal.close();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      const blob = new Blob([JSON.stringify(loadEntries(), null, 2)], {
        type: "application/json"
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "blox-fruits-entries.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("admin") === "1" && adminPanel) {
    adminPanel.hidden = false;
    renderEntries();
  }

  renderSocialLinks();
  renderLegalFooter();
  renderGiveawayInfo();
  renderFruitCatalog();
  spawnRbxBlocks();
  spawnFloatFruits();
  drawWheel(0);
  runSplash();

  if (cfg.endDate && timerBlock && timerEl) {
    const end = new Date(cfg.endDate);
    if (!Number.isNaN(end.getTime())) {
      timerBlock.hidden = false;
      function tick() {
        const diff = end.getTime() - Date.now();
        if (diff <= 0) {
          timerEl.textContent = "Раздача завершена";
          if (spinBtn) spinBtn.disabled = true;
          return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timerEl.textContent =
          (d ? d + " д " : "") +
          String(h).padStart(2, "0") +
          ":" +
          String(m).padStart(2, "0") +
          ":" +
          String(s).padStart(2, "0");
      }
      tick();
      setInterval(tick, 1000);
    }
  }
})();
