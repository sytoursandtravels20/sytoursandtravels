/* ============================================================
   main.js — homepage orchestration.
   Loads header + footer, applies CONFIG text, loads DATA (local
   or remote), renders all sections and wires up interactions.

   DATA FLOW:
     loadData()  →  returns the data object (local or remote)
                 →  passed to every render function
   ============================================================ */

document.addEventListener("DOMContentLoaded", async function () {

  /* 1. Load header + footer components */
  await Promise.all([
    loadComponent("site-header", "components/header.html"),
    loadComponent("site-footer", "components/footer.html")
  ]);

  /* 2. Apply editable business content from CONFIG */
  applyConfig();

  /* 3. Load data (local JSON or remote Google Sheets JSON) */
  const DATA = await loadData();

  /* 4. Render every dynamic section from DATA */
  renderCategories(DATA.categories);
  renderFeatured(DATA.vehicles);
  renderExperiences(DATA.activities);
  renderYachtsBoatsCruises(DATA);
  renderWhyBook(DATA.whyBook);
  renderHowItWorks(DATA.howItWorks);
  renderReviews(DATA.reviews);

  /* 5. Small interactions */
  initSearchTabs();
  initScrollSpy();
  initHeaderShadow();
  initMobileNavSpy();
});

/* ============================================================
   DATA LOADER
   ------------------------------------------------------------
   • mode "local"  → returns LOCAL_DATA from js/data.js
   • mode "remote" → fetches remoteUrl and returns the parsed JSON
   • on any remote failure → logs and falls back to LOCAL_DATA
   ============================================================ */
async function loadData() {
  const src = CONFIG.dataSource || {};

  if (src.mode === "remote" && src.remoteUrl) {
    try {
      const res = await fetch(src.remoteUrl, { method: "GET" });
      if (!res.ok) throw new Error("HTTP " + res.status);

      const json = await res.json();
      console.info("[SY] Loaded data from remote source.");
      return json;

    } catch (err) {
      console.warn("[SY] Remote data failed — falling back to LOCAL_DATA.", err);
      return LOCAL_DATA;
    }
  }

  return LOCAL_DATA;
}

/* ============================================================
   Apply CONFIG → header, hero, footer, CTA
   ============================================================ */
function applyConfig() {
  const C = CONFIG.company;

  /* Header brand */
  setText("brandName", C.name);
  setText("brandTag",  C.tagline);
  setBrandLogo("brandLogo");

  /* Hero */
  const h = CONFIG.hero;
  setText("heroEyebrow", h.eyebrow);
  setText("heroTitle1",  h.titleLine1);
  setText("heroTitle2",  h.titleLine2);
  setText("heroSub",     h.subtitle);

  const heroEl = document.querySelector(".hero");
  if (heroEl && h.backgroundImage) {
    heroEl.style.setProperty("--hero-img", `url("${h.backgroundImage}")`);
  }

  const cta1 = document.getElementById("heroCta1");
  const cta2 = document.getElementById("heroCta2");
  if (cta1) { cta1.textContent = h.ctaPrimary.label;   cta1.href = h.ctaPrimary.href; }
  if (cta2) { cta2.textContent = h.ctaSecondary.label; cta2.href = h.ctaSecondary.href; }

  /* CTA banner */
  const c = CONFIG.cta;
  setText("ctaTitle", c.title);
  setText("ctaSub",   c.subtitle);

  const ctaEl = document.querySelector(".cta");
  if (ctaEl && c.backgroundImage) {
    ctaEl.style.setProperty("--cta-img", `url("${c.backgroundImage}")`);
  }

  const ctaBtn = document.getElementById("ctaBtn");
  if (ctaBtn) { ctaBtn.textContent = c.button.label; ctaBtn.href = c.button.href; }

  const ctaWa = document.getElementById("ctaWa");
  if (ctaWa) {
    ctaWa.href = waLink(
      "Hi " + C.name + ", I'd like to enquire about your rentals and activities. Please share details."
    );
  }

  /* Footer brand + contact */
  setText("footerBrandName", C.name);
  setText("footerBrandTag",  C.tagline);
  setText("footerDesc",      C.description);
  setText("footerAddress",   C.address);
  setBrandLogo("footerBrandLogo");

  const phoneEl = document.getElementById("footerPhone");
  if (phoneEl) { phoneEl.textContent = C.phone; phoneEl.href = "tel:+" + C.phoneRaw; }

  const emailEl = document.getElementById("footerEmail");
  if (emailEl) { emailEl.textContent = C.email; emailEl.href = "mailto:" + C.email; }

  const yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const compEl = document.getElementById("footerCompany");
  if (compEl) compEl.textContent = C.name;

  /* Footer social */
  const socialEl = document.getElementById("footerSocial");
  if (socialEl) {
    const map = {
      facebook:  "bi-facebook",
      instagram: "bi-instagram",
      twitter:   "bi-twitter-x",
      youtube:   "bi-youtube"
    };
    socialEl.innerHTML = Object.keys(map)
      .filter(function (k) { return CONFIG.social[k]; })
      .map(function (k) {
        return `<a href="${CONFIG.social[k]}" target="_blank" rel="noopener" aria-label="${k}"><i class="bi ${map[k]}"></i></a>`;
      })
      .join("");
  }

  /* Page title */
  document.title = C.name + " | Car Rentals, Water Sports & Yachts in Goa";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function setBrandLogo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (CONFIG.logo.logoUrl) {
    el.innerHTML = `<img src="${CONFIG.logo.logoUrl}" alt="${CONFIG.company.name}">`;
  } else {
    el.innerHTML = `<i class="bi ${CONFIG.logo.logoIcon}"></i>`;
  }
}

/* ============================================================
   Render functions — each takes its own slice of data.
   Never reference DATA globally, so switching to a remote source
   requires zero changes here.
   ============================================================ */
function renderCategories(categories) {
  const el = document.getElementById("categoryGrid");
  if (!el) return;
  el.innerHTML = (categories || []).map(categoryCard).join("");
}

function renderFeatured(vehicles) {
  const el = document.getElementById("featuredGrid");
  if (!el) return;
  el.innerHTML = (vehicles || []).map(vehicleCard).join("");
}

function renderExperiences(activities) {
  const el = document.getElementById("experiencesGrid");
  if (!el) return;
  el.innerHTML = (activities || []).map(activityCard).join("");
}

function renderYachtsBoatsCruises(DATA) {
  const el = document.getElementById("yachtsGrid");
  if (!el) return;
  const cards = []
    .concat((DATA.yachts  || []).map(function (x) { return waterCard(x, "Yacht");  }))
    .concat((DATA.boats   || []).map(function (x) { return waterCard(x, "Boat");   }))
    .concat((DATA.cruises || []).map(function (x) { return waterCard(x, "Cruise"); }));
  el.innerHTML = cards.join("");
}

function renderWhyBook(whyBook) {
  const el = document.getElementById("whyGrid");
  if (!el) return;
  el.innerHTML = (whyBook || []).map(whyItem).join("");
}

function renderHowItWorks(steps) {
  const el = document.getElementById("howGrid");
  if (!el) return;
  el.innerHTML = (steps || []).map(howItem).join("");
}

function renderReviews(reviews) {
  const el = document.getElementById("reviewsGrid");
  if (!el) return;
  el.innerHTML = (reviews || []).map(reviewCard).join("");
}

/* ============================================================
   Small interactions
   ============================================================ */
function initSearchTabs() {
  const tabs = document.querySelectorAll(".search-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
    });
  });
}

function initScrollSpy() {
  const links = document.querySelectorAll('.sy-nav-links .nav-link');
  const sections = Array.prototype.map.call(links, function (l) {
    const id = l.getAttribute("href");
    return id && id.startsWith("#") ? document.querySelector(id) : null;
  });

  function update() {
    const y = window.scrollY + 140;
    let activeIndex = 0;
    sections.forEach(function (sec, i) {
      if (sec && sec.offsetTop <= y) activeIndex = i;
    });
    links.forEach(function (l, i) {
      l.classList.toggle("active", i === activeIndex);
    });
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initHeaderShadow() {
  const nav = document.getElementById("syNav");
  if (!nav) return;
  function update() { nav.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initMobileNavSpy() {
  const items = document.querySelectorAll(".mobile-nav-item");
  items.forEach(function (item) {
    item.addEventListener("click", function () {
      items.forEach(function (i) { i.classList.remove("is-active"); });
      item.classList.add("is-active");
    });
  });
}