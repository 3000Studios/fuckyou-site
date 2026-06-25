import { getRabbitHoleBySlug, rabbitHoles } from "./story-data.js";

const app = document.getElementById("app");
const pageCount = rabbitHoles.length;
const audioEnabledKey = "fuckyou-site:audio-enabled";
const audioModeKey = "fuckyou-site:audio-mode";
let audioContext = null;
let ambientNodes = [];
let ambientTimer = null;

const staticPages = {
  about: {
    title: "About",
    body: [
      "fuckyou.site is a chaotic experimental rabbit hole built to keep people curious and clicking.",
      "It mixes weird humor, animated transitions, and a deliberately strange content structure so each page feels different from the last.",
    ],
  },
  contact: {
    title: "Contact",
    body: [
      "Use this site as a conversation starter, a joke machine, or a curiosity trap.",
      "For business or technical contact, wire this page to the repo's preferred support path before production launch.",
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    body: [
      "This site is intentionally lightweight and does not require user accounts for the rabbit-hole experience.",
      "If analytics, forms, or other telemetry are enabled, they should be documented here before launch.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "The site is provided as an entertainment experience with no guarantees beyond basic functionality.",
      "Users are responsible for how they interact with the content and any external destinations they choose to visit.",
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    body: [
      "The content is satirical and absurd by design.",
      "It should not be treated as factual guidance, professional advice, or a reliable oracle of any kind.",
    ],
  },
  "refund-policy": {
    title: "Refund Policy",
    body: [
      "No paid product is exposed in this repo, so there is nothing to refund here.",
      "If monetization is added later, this page must be updated to match the actual offer terms.",
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    body: [
      "If cookies or similar storage are used, they should be documented and limited to the minimum necessary behavior.",
      "No tracking is implied by this static build unless explicitly added later.",
    ],
  },
  accessibility: {
    title: "Accessibility Statement",
    body: [
      "The interface supports keyboard navigation, responsive layout changes, focus states, and reduced-motion-friendly CSS patterns.",
      "Further accessibility improvements should be validated against real browser and screen reader behavior before launch.",
    ],
  },
};

function routeFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || path === "") return { type: "home" };
  const holeMatch = path.match(/^\/hole\/([a-z0-9-]+)$/i);
  if (holeMatch) return { type: "hole", slug: holeMatch[1] };
  const staticMatch = path.match(/^\/([a-z0-9-]+)$/i);
  if (staticPages[staticMatch?.[1]]) return { type: "static", slug: staticMatch[1] };
  return { type: "home" };
}

function navigate(url) {
  window.history.pushState({}, "", url);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateHead(meta) {
  document.title = meta.title;
  setMeta("description", meta.description);
  setMeta("og:title", meta.title, "property");
  setMeta("og:description", meta.description, "property");
  setMeta("og:url", `${window.location.origin}${window.location.pathname}`, "property");
  setMeta("twitter:title", meta.title);
  setMeta("twitter:description", meta.description);
  setMeta("theme-color", meta.themeColor, "name");
  setStructuredData(meta);
}

function setMeta(name, content, attr = "name") {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.append(tag);
  }
  tag.setAttribute("content", content);
}

function setStructuredData(meta) {
  let script = document.head.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    document.head.append(script);
  }
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "fuckyou.site",
    url: window.location.origin,
    description: meta.description,
  });
}

function themeColorFromHue(hue) {
  const base = Math.max(0, Math.min(255, Math.round((hue / 360) * 255)));
  return `#${base.toString(16).padStart(2, "0")}0b14`;
}

function shell(content, theme, extraClasses = "") {
  const style = `
    --hue:${theme.hue};
    --accent:${theme.accent};
    --surface:${theme.surface};
    --glow:${theme.glow};
    --card:${theme.card};
    --line:${theme.line};
  `;
  return `
    <div class="scene ${extraClasses}" style="${style}">
      <div class="background-noise"></div>
      <div class="orb orb-a"></div>
      <div class="orb orb-b"></div>
      <div class="orb orb-c"></div>
      <div class="page-wallpaper"></div>
      <div class="page-frame">
        ${siteHeader()}
        ${content}
        ${siteFooter()}
      </div>
    </div>
  `;
}

function siteHeader() {
  return `
    <header class="site-header">
      <a class="brand" href="/" aria-label="fuckyou.site home">
        <span class="brand-mark">◉</span>
        <span class="brand-copy">
          <strong>fuckyou.site</strong>
          <span>rabbit-hole generator</span>
        </span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/privacy-policy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/contact">Contact</a>
      </nav>
      <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu">
        <span class="menu-gear"></span>
        <span class="menu-copy">menu</span>
      </button>
      <button class="audio-toggle" type="button" data-audio-toggle>
        <span class="audio-dot"></span>
        <span>sound</span>
      </button>
    </header>
    <div class="mobile-menu" id="mobile-menu" hidden>
      <div class="mobile-menu-panel">
        <button class="menu-close" type="button" data-menu-close>close</button>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy-policy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/accessibility">Accessibility</a>
        <a href="/hole/hole-001">Start hole 001</a>
      </div>
    </div>
  `;
}

function siteFooter() {
  return `
    <footer class="site-footer">
      <span>200 pages of weirdness</span>
      <span>keyboard friendly</span>
      <span>Cloudflare-ready static build</span>
    </footer>
  `;
}

function ensureAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    audioContext = new Context();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  window.localStorage.setItem(audioEnabledKey, "1");
  return audioContext;
}

function stopAmbient() {
  ambientNodes.forEach((node) => {
    try { node.stop(); } catch {}
  });
  ambientNodes = [];
  if (ambientTimer) {
    clearInterval(ambientTimer);
    ambientTimer = null;
  }
}

function playTone({ type = "sine", frequency = 220, duration = 0.12, gain = 0.05, detune = 0 }) {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.detune.value = detune;
  amp.gain.value = gain;
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start();
  amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

function startAmbient(mode = "night") {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  stopAmbient();
  const base = mode === "wild" ? 82 : mode === "drone" ? 62 : 98;
  const intervals = mode === "wild" ? [0, 5, 12] : mode === "drone" ? [0, 7] : [0, 4, 9];
  intervals.forEach((offset, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = base + offset;
    gain.gain.value = 0.006 + index * 0.003;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    ambientNodes.push(osc);
  });
  ambientTimer = window.setInterval(() => {
    const tones = [base, base + 3, base + 7, base + 12];
    playTone({ type: "triangle", frequency: tones[Math.floor(Math.random() * tones.length)], duration: 0.11, gain: 0.012 });
  }, mode === "wild" ? 1200 : 1800);
  window.localStorage.setItem(audioModeKey, mode);
}

function playWarpSound(seed = 0) {
  const base = 120 + (seed % 8) * 42;
  playTone({ type: "sawtooth", frequency: base, duration: 0.08, gain: 0.03 });
  setTimeout(() => playTone({ type: "triangle", frequency: base * 1.8, duration: 0.1, gain: 0.025 }), 40);
  setTimeout(() => playTone({ type: "square", frequency: base * 0.5, duration: 0.14, gain: 0.02 }), 80);
}

function playScareSting() {
  playTone({ type: "square", frequency: 98, duration: 0.18, gain: 0.035 });
  setTimeout(() => playTone({ type: "sawtooth", frequency: 840, duration: 0.16, gain: 0.02 }), 60);
  setTimeout(() => playTone({ type: "triangle", frequency: 64, duration: 0.24, gain: 0.03 }), 120);
}

function soundBoardButtons(page) {
  return ["zap", "thump", "boo", "luxe", "bs", "whoa"].map((label, index) => `
    <button class="sound-chip" data-sound="${label}" data-tone="${index}" type="button">${label}</button>
  `).join("");
}

function gameMarkup(page) {
  return `
    <div class="mini-game" data-game="${page.gameKind}">
      <div class="mini-game-head">
        <strong>${page.gameLine}</strong>
        <span>${page.adultCue}</span>
        <span>${page.layoutLine}</span>
      </div>
      <button class="primary-button mini-game-button" data-warp type="button">Click warp</button>
      <div class="warp-track" aria-hidden="true">
        <span class="warp-dot"></span>
        <span class="warp-dot"></span>
        <span class="warp-dot"></span>
        <span class="warp-dot"></span>
      </div>
    </div>
  `;
}

function botMarkup(page) {
  const lines = [
    `${page.botVoice} bot: "You clicked the wrong tunnel, champ."`,
    `room bot: "That was embarrassing."`,
    `gremlin bot: "Try another warp if you want the spicy route."`,
  ];
  return `
    <div class="bot-crowd" aria-label="Chaotic bot chatter">
      ${lines.map((line, index) => `<div class="bot-float bot-${index + 1}">${line}</div>`).join("")}
    </div>
  `;
}

function homeView() {
  const cards = rabbitHoles.map((hole) => `
    <button class="rabbit-card" data-slug="${hole.slug}" style="--card-hue:${hole.theme.hue};--card-accent:${hole.theme.accent}">
      <span class="card-index">#${String(hole.id).padStart(3, "0")}</span>
      <strong>${hole.title}</strong>
      <span>${hole.hook}</span>
      <span class="card-footer">${hole.cta}</span>
    </button>
  `).join("");

  return `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">200 weird pages. zero chill.</p>
        <h1>Tap one button and drop into a new flavor of nonsense.</h1>
        <p class="lede">Every page is generated to feel different: new copy, new color, new motion, new level of weird, and a fresh reason to click again.</p>
        <div class="hero-actions">
          <a class="primary-button link-button" href="/hole/hole-001">Start the first hole</a>
          <a class="secondary-button link-button" href="/about">Read the backstory</a>
        </div>
      </div>
      <div class="hero-face">
        <button class="face-button" data-slug="hole-001" aria-label="Open the first rabbit hole">ಠ_ಠ</button>
        <p>Press the face. It acts like it knows something.</p>
      </div>
    </section>
    <section class="home-nav-panel">
      <div>
        <p class="eyebrow">Navigate first</p>
        <strong>Use this panel instead of a popup.</strong>
        <p class="lede">Jump straight to the main hole, legal pages, or the contact route without dismissing anything.</p>
      </div>
      <div class="home-nav-links">
        <a class="nav-pill" href="/hole/hole-001">Start hole 001</a>
        <a class="nav-pill" href="/about">About</a>
        <a class="nav-pill" href="/contact">Contact</a>
        <a class="nav-pill" href="/privacy-policy">Privacy</a>
      </div>
    </section>
    <section class="grid-shell">
      <div class="grid-meta">
        <span>${pageCount} rabbit holes</span>
        <span>each one different</span>
        <span>built for curiosity</span>
      </div>
      <div class="rabbit-grid">${cards}</div>
    </section>
  `;
}

function holeView(hole) {
  return `
    <section class="story-shell transition-${hole.transition} mode-${hole.layoutMode}">
      <a class="back-link" href="/">← back to the chaos grid</a>
      <div class="story-panel">
        <div class="story-kicker">
          <span>${hole.labels[0]}</span>
          <span>${hole.labels[1]}</span>
          <span>${hole.labels[2]}</span>
        </div>
        <h1>${hole.title}</h1>
        <p class="lede">${hole.hook}</p>
        <div class="story-copy">
          <p>${hole.opening}</p>
          <p>${hole.punchline}</p>
          <p>${hole.prompt}</p>
          <p>${hole.adultCue}</p>
          <p>${hole.botLine}</p>
        </div>
        <div class="story-notes">
          ${hole.crumbs.map((item) => `<p>${item}</p>`).join("")}
        </div>
        <div class="story-oddities">
          ${hole.oddities.map((item) => `<div>${item}</div>`).join("")}
        </div>
        <div class="story-variant">
          <span>${hole.layoutLine}</span>
          <span>${hole.tunnelStyle} tunnel</span>
          <span>${hole.soundSet} board</span>
        </div>
        ${botMarkup(hole)}
        <div class="soundboard" aria-label="Sound board">
          ${soundBoardButtons(hole)}
        </div>
        ${gameMarkup(hole)}
        <div class="story-actions">
          <button class="primary-button" data-next>Open another cursed page</button>
          <button class="secondary-button" data-random>Surprise me harder</button>
        </div>
      </div>
    </section>
  `;
}

function staticView(page) {
  return `
    <section class="story-shell transition-drift">
      <a class="back-link" href="/">← back home</a>
      <div class="story-panel">
        <div class="story-kicker">
          <span>static page</span>
          <span>official info</span>
          <span>${page.title.toLowerCase()}</span>
        </div>
        <h1>${page.title}</h1>
        <div class="story-copy">
          ${page.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
        </div>
        <div class="story-actions">
          <a class="primary-button link-button" href="/hole/hole-001">Launch the rabbit hole</a>
          <a class="secondary-button link-button" href="/contact">Contact</a>
        </div>
      </div>
    </section>
  `;
}

function maybeTriggerScare(hole) {
  if (!hole.scare) return;
  playScareSting();
  document.body.classList.add("scare-flash");
  window.setTimeout(() => document.body.classList.remove("scare-flash"), 260);
}

function bindMenu() {
  const toggle = app.querySelector("[data-menu-toggle]");
  const menu = app.querySelector("#mobile-menu");
  const close = app.querySelector("[data-menu-close]");
  if (!toggle || !menu || !close) return;
  const open = () => {
    menu.hidden = false;
    menu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  };
  const hide = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    window.setTimeout(() => { menu.hidden = true; }, 180);
  };
  toggle.addEventListener("click", () => {
    if (menu.hidden) open(); else hide();
  });
  close.addEventListener("click", hide);
  menu.addEventListener("click", (event) => {
    if (event.target === menu) hide();
  });
}

function bindAudioToggle(hole) {
  const toggle = app.querySelector("[data-audio-toggle]");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const currentMode = window.localStorage.getItem(audioModeKey) || "night";
    const nextMode = currentMode === "night" ? "drone" : currentMode === "drone" ? "wild" : "night";
    startAmbient(nextMode);
    toggle.dataset.mode = nextMode;
    toggle.classList.add("active");
    window.setTimeout(() => toggle.classList.remove("active"), 240);
    if (hole?.scare) playScareSting();
  });
}

function bindSceneControls(hole) {
  const soundButtons = app.querySelectorAll("[data-sound]");
  soundButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tone = Number(button.dataset.tone || 0);
      playWarpSound(hole.id + tone);
      button.classList.add("pulse");
      window.setTimeout(() => button.classList.remove("pulse"), 240);
    });
  });

  const warp = app.querySelector("[data-warp]");
  if (warp) {
    warp.addEventListener("click", () => {
      const nextIndex = ((hole.id + 11) % pageCount) + 1;
      playWarpSound(nextIndex);
      navigate(`/hole/hole-${String(nextIndex).padStart(3, "0")}`);
    });
  }
}

function render() {
  const route = routeFromLocation();
  const hole = route.type === "hole" ? getRabbitHoleBySlug(route.slug) : rabbitHoles[0];
  const page = route.type === "static" ? staticPages[route.slug] : null;
  const title = route.type === "hole" ? `${hole.title} | fuckyou.site` : route.type === "static" ? `${page.title} | fuckyou.site` : "fuckyou.site | rabbit hole generator";
  const description = route.type === "hole" ? hole.hook : route.type === "static" ? `${page.title} page for fuckyou.site.` : "A bizarre rabbit hole of strange, mean, curious, and wildly different mini-pages.";
  const metaTheme = route.type === "hole" ? hole.theme : rabbitHoles[0].theme;
  updateHead({ title, description, themeColor: themeColorFromHue(metaTheme.hue) });

  if (route.type === "home") {
    app.innerHTML = shell(homeView(), rabbitHoles[0].theme, "page-home");
  } else if (route.type === "hole") {
    app.innerHTML = shell(holeView(hole), hole.theme, "page-hole");
  } else {
    app.innerHTML = shell(staticView(page), rabbitHoles[0].theme, "page-static");
  }

  document.body.dataset.page = route.type;

  app.querySelectorAll("[data-slug]").forEach((node) => {
    node.addEventListener("click", () => navigate(`/hole/${node.dataset.slug}`));
  });

  const next = app.querySelector("[data-next]");
  if (next) {
    next.addEventListener("click", () => {
      const nextIndex = (hole.id % pageCount) + 1;
      navigate(`/hole/hole-${String(nextIndex).padStart(3, "0")}`);
    });
  }

  const random = app.querySelector("[data-random]");
  if (random) {
    random.addEventListener("click", () => {
      const pick = rabbitHoles[Math.floor(Math.random() * rabbitHoles.length)];
      navigate(`/hole/${pick.slug}`);
    });
  }

  if (route.type === "hole") {
    bindSceneControls(hole);
    maybeTriggerScare(hole);
  }
  bindMenu();
  bindAudioToggle(hole);
}

window.addEventListener("popstate", render);
window.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    ensureAudioContext();
    playWarpSound(pageCount);
  }
  if (event.key.toLowerCase?.() === "m") {
    const toggle = app.querySelector("[data-menu-toggle]");
    if (toggle) toggle.click();
  }
});
render();
