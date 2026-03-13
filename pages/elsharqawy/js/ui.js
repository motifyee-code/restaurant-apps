(function () {
  window.PC = window.PC || {};

  function applyI18n(lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";

  document.title = PC.t(lang, "meta_title");
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", PC.t(lang, "meta_description"));

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = PC.t(lang, key);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const spec = el.getAttribute("data-i18n-attr");
    if (!spec) return;
    const parts = spec
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const p of parts) {
      const [attr, key] = p.split(":").map((s) => s.trim());
      if (!attr || !key) continue;
      el.setAttribute(attr, PC.t(lang, key));
    }
  });

  const langToggle = document.getElementById("langToggle");
  const icon = langToggle && langToggle.querySelector(".toggle__icon");
  if (icon) icon.textContent = lang === "ar" ? "AR" : "EN";
}

function applyBindings(bindings) {
  document.querySelectorAll("[data-bind-text]").forEach((el) => {
    const key = el.getAttribute("data-bind-text");
    if (!key) return;
    if (!(key in bindings)) return;
    el.textContent = String(bindings[key]);
  });

  document.querySelectorAll("[data-bind-attr]").forEach((el) => {
    const spec = el.getAttribute("data-bind-attr");
    if (!spec) return;
    const parts = spec
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const p of parts) {
      const [attr, key] = p.split(":").map((s) => s.trim());
      if (!attr || !key) continue;
      if (!(key in bindings)) continue;
      el.setAttribute(attr, String(bindings[key]));
    }
  });
}

function toMailto(lang, companyEmail, formData) {
  const lines = [
    `${t(lang, "mail_name")}: ${formData.get("name") || ""}`,
    `${t(lang, "mail_email")}: ${formData.get("email") || ""}`,
    `${t(lang, "mail_phone")}: ${formData.get("phone") || ""}`,
    `${t(lang, "mail_interest")}: ${formData.get("interest") || ""}`,
    "",
    `${t(lang, "mail_message")}:`,
    String(formData.get("message") || ""),
  ];

  const body = encodeURIComponent(lines.join("\n"));
  const subject = encodeURIComponent(t(lang, "mail_subject"));
  return `mailto:${encodeURIComponent(companyEmail)}?subject=${subject}&body=${body}`;
}

async function submitToEndpoint(endpoint, formData) {
  const payload = Object.fromEntries(formData.entries());

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
}

function wireForm(getState, companyEmail, formEl, statusEl) {
  if (!formEl) return;

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { lang } = getState();
    statusEl && (statusEl.textContent = PC.t(lang, "status_sending"));

    const formData = new FormData(formEl);

    try {
      if (PC.config && PC.config.contactFormEndpoint) {
        await submitToEndpoint(PC.config.contactFormEndpoint, formData);
        formEl.reset();
        statusEl && (statusEl.textContent = PC.t(lang, "status_sent"));
      } else {
        window.location.href = toMailto(lang, companyEmail, formData);
        statusEl && (statusEl.textContent = PC.t(lang, "status_open_email"));
      }
    } catch (err) {
      statusEl && (statusEl.textContent = PC.t(lang, "status_failed"));
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });
}

function wireCarousel(root) {
  const track = root.querySelector("[data-carousel-track]");
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  if (!track) return;

  const scrollByOne = (dir) => {
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const first = track.querySelector("img");
    const amount = first ? first.getBoundingClientRect().width + 16 : track.clientWidth;
    const rtl = document.documentElement.dir === "rtl";
    track.scrollBy({ left: (rtl ? -1 : 1) * dir * amount, behavior: reducedMotion ? "auto" : "smooth" });
  };

  prev && prev.addEventListener("click", () => scrollByOne(-1));
  next && next.addEventListener("click", () => scrollByOne(1));
}

function wireMobileMenu() {
  var menu = document.getElementById("mobileMenu");
  var toggle = document.getElementById("menuToggle");
  if (!menu || !toggle) return;

  function openMenu() {
    document.body.classList.add("menuOpen");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    document.body.classList.remove("menuOpen");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    if (document.body.classList.contains("menuOpen")) closeMenu();
    else openMenu();
  });

  menu.querySelectorAll("[data-menu-close]").forEach(function (el) {
    el.addEventListener("click", closeMenu);
  });

  menu.querySelectorAll("a[href^=\"#\"]").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });
}

function wireToTop() {
  var btn = document.getElementById("toTop");
  var hero = document.querySelector(".hero");
  if (!btn || !hero) return;

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show() {
    btn.classList.add("isVisible");
  }

  function hide() {
    btn.classList.remove("isVisible");
  }

  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        // When hero is not intersecting, we are beyond it => show button.
        var isHeroVisible = entries && entries[0] ? entries[0].isIntersecting : true;
        if (isHeroVisible) hide();
        else show();
      },
      { threshold: 0.05 },
    );
    obs.observe(hero);
  } else {
    window.addEventListener("scroll", function () {
      var heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom < 0) show();
      else hide();
    });
  }

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
}

  PC.initSite = function initSite() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const state = {
    lang: "en",
    theme: "light",
  };
  const getState = () => ({ ...state });

  const savedLang = localStorage.getItem(PC.STORAGE_LANG);
  state.lang = savedLang === "ar" || savedLang === "en" ? savedLang : PC.detectSystemLang();
  applyI18n(state.lang);
  applyBindings(PC.bindingsForLang(state.lang));

  const savedTheme = localStorage.getItem(PC.STORAGE_THEME);
  state.theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : PC.detectSystemTheme();
  PC.applyTheme(state.theme);

  if (!savedTheme && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener &&
      mq.addEventListener("change", () => {
        if (localStorage.getItem(PC.STORAGE_THEME)) return;
        state.theme = PC.detectSystemTheme();
        PC.applyTheme(state.theme);
      });
  }

  const langToggle = document.getElementById("langToggle");
  langToggle &&
    langToggle.addEventListener("click", () => {
      state.lang = state.lang === "ar" ? "en" : "ar";
      localStorage.setItem(PC.STORAGE_LANG, state.lang);
      applyI18n(state.lang);
      applyBindings(PC.bindingsForLang(state.lang));
    });

  const themeToggle = document.getElementById("themeToggle");
  themeToggle &&
    themeToggle.addEventListener("click", () => {
      state.theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(PC.STORAGE_THEME, state.theme);
      PC.applyTheme(state.theme);
    });

  const bindings = PC.bindingsForLang(state.lang);
  wireForm(getState, bindings.companyEmail, document.getElementById("quoteForm"), document.getElementById("formStatus"));
  wireForm(
    getState,
    bindings.companyEmail,
    document.getElementById("contactForm"),
    document.getElementById("contactStatus"),
  );

  document.querySelectorAll("[data-carousel]").forEach(wireCarousel);
  wireMobileMenu();
  wireToTop();
  };
})();
