import { getRabbitHoleBySlug, rabbitHoles } from "./story-data.js";

const app = document.getElementById("app");
const pageCount = rabbitHoles.length;
const introDismissedKey = "fuckyou-site:intro-dismissed";

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
      ${intro()}
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
    </header>
  `;
}

function siteFooter() {
  return `
    <footer class="site-footer">
      <span>100 pages of weirdness</span>
      <span>keyboard friendly</span>
      <span>Cloudflare-ready static build</span>
    </footer>
  `;
}

function intro() {
  const dismissed = window.localStorage.getItem(introDismissedKey) === "1";
  return dismissed ? "" : `
    <button class="intro-overlay" data-dismiss-intro type="button" aria-label="Skip intro">
      <span class="intro-badge">Tap anywhere to enter</span>
      <strong>The floor is about to lie to you.</strong>
      <span class="intro-sub">Skip the intro or wait for the door to open itself.</span>
    </button>
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
        <p class="eyebrow">100 weird pages. zero chill.</p>
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
    <section class="story-shell transition-${hole.transition}">
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
        </div>
        <div class="story-notes">
          ${hole.crumbs.map((item) => `<p>${item}</p>`).join("")}
        </div>
        <div class="story-oddities">
          ${hole.oddities.map((item) => `<div>${item}</div>`).join("")}
        </div>
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

  const dismiss = app.querySelector("[data-dismiss-intro]");
  if (dismiss) {
    dismiss.addEventListener("click", () => {
      window.localStorage.setItem(introDismissedKey, "1");
      render();
    });
  }
}

window.addEventListener("popstate", render);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && window.localStorage.getItem(introDismissedKey) !== "1") {
    window.localStorage.setItem(introDismissedKey, "1");
    render();
  }
});
render();
