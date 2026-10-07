/* ============================================================
   rentals.js — logic for rentals/index.html.
   Loads header/footer, applies CONFIG, loads data, and manages
   the filter bar (category / search / sort) + grid rendering.
   ============================================================ */

let allVehicles = [];
let currentFilters = {
  category: "all",
  search: "",
  sort: "recommended"
};

document.addEventListener("DOMContentLoaded", async function () {

  /* 1. Load header + footer */
  await Promise.all([
    loadComponent("site-header", "components/header.html"),
    loadComponent("site-footer", "components/footer.html")
  ]);

  /* 2. Apply company text + CTA */
  applyConfig();
  markActiveNav();

  /* 3. Load data and store vehicles */
  const DATA = await loadData();
  allVehicles = (DATA.vehicles || []).slice();   // copy so we don't mutate original

  /* 4. Render static "Why Rent With Us" section */
  renderWhyBook(DATA.whyBook);

  /* 5. Wire up filters and do the first render */
  initFilters();
  renderListings();

  /* 6. Small interactions */
  initHeaderShadow();
});

/* ============================================================
   DATA LOADER (mirrors main.js — no shared global)
   ============================================================ */
async function loadData() {
  const src = CONFIG.dataSource || {};
  if (src.mode === "remote" && src.remoteUrl) {
    try {
      const res = await fetch(src.remoteUrl);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      console.info("[SY] Loaded data from remote source.");
      return json;
    } catch (err) {
      console.warn("[SY] Remote data failed — using LOCAL_DATA.", err);
      return LOCAL_DATA;
    }
  }
  return LOCAL_DATA;
}

/* ============================================================
   FILTER WIRING
   ============================================================ */
function initFilters() {
  /* Category chips */
  const chips = document.querySelectorAll(".filter-chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      currentFilters.category = chip.dataset.cat || "all";
      renderListings();
    });
  });

  /* Search box (live filter with tiny debounce) */
  const searchInput = document.getElementById("filterSearch");
  if (searchInput) {
    let t;
    searchInput.addEventListener("input", function (e) {
      clearTimeout(t);
      t = setTimeout(function () {
        currentFilters.search = e.target.value.trim().toLowerCase();
        renderListings();
      }, 150);
    });
  }

  /* Sort dropdown */
  const sortSel = document.getElementById("filterSort");
  if (sortSel) {
    sortSel.addEventListener("change", function (e) {
      currentFilters.sort = e.target.value;
      renderListings();
    });
  }

  /* Clear filters button in the empty state */
  const clearBtn = document.getElementById("clearFilters");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      currentFilters = { category: "all", search: "", sort: "recommended" };
      document.querySelectorAll(".filter-chip").forEach(function (c) {
        c.classList.toggle("is-active", c.dataset.cat === "all");
      });
      if (searchInput) searchInput.value = "";
      if (sortSel) sortSel.value = "recommended";
      renderListings();
    });
  }
}

/* ============================================================
   APPLY FILTERS + RENDER
   ============================================================ */
function renderListings() {
  const list = applyFilters(allVehicles, currentFilters);
  const grid = document.getElementById("rentalGrid");
  const count = document.getElementById("resultsCount");
  const empty = document.getElementById("emptyState");

  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = "";
    if (empty) empty.hidden = false;
    if (count) count.textContent = "";
    return;
  }

  if (empty) empty.hidden = true;
  grid.innerHTML = list.map(vehicleCard).join("");
  if (count) {
    count.textContent = "Showing " + list.length + " of " + allVehicles.length + " vehicles";
  }
}

function applyFilters(items, filters) {
  let list = items.slice();

  /* Category */
  if (filters.category && filters.category !== "all") {
    list = list.filter(function (v) { return v.category === filters.category; });
  }

  /* Search — matches name, transmission or fuel */
  if (filters.search) {
    const q = filters.search;
    list = list.filter(function (v) {
      return (
        (v.name || "").toLowerCase().indexOf(q) !== -1 ||
        (v.transmission || "").toLowerCase().indexOf(q) !== -1 ||
        (v.fuel || "").toLowerCase().indexOf(q) !== -1
      );
    });
  }

  /* Sort */
  switch (filters.sort) {
    case "price-asc":  list.sort(function (a, b) { return a.price - b.price; }); break;
    case "price-desc": list.sort(function (a, b) { return b.price - a.price; }); break;
    case "name":       list.sort(function (a, b) { return a.name.localeCompare(b.name); }); break;
    /* "recommended" keeps original order */
  }

  return list;
}

/* ============================================================
   STATIC SECTIONS (reuse renderers from components.js)
   ============================================================ */
function renderWhyBook(whyBook) {
  const el = document.getElementById("whyGrid");
  if (el) el.innerHTML = (whyBook || []).map(whyItem).join("");
}

/* ============================================================
   CONFIG → header, footer, CTA
   (mirrors main.js so both pages share the same look)
   ============================================================ */
function applyConfig() {
  const C = CONFIG.company;

  /* Header brand */
  setText("brandName", C.name);
  setText("brandTag",  C.tagline);
  setBrandLogo("brandLogo");

  /* Final CTA */
  const c = CONFIG.cta;
  setText("ctaTitle", c.title);
  setText("ctaSub",   c.subtitle);

  const ctaEl = document.querySelector(".cta");
  if (ctaEl && c.backgroundImage) ctaEl.style.setProperty("--cta-img", `url("${c.backgroundImage}")`);

  const ctaBtn = document.getElementById("ctaBtn");
  if (ctaBtn) { ctaBtn.textContent = c.button.label; ctaBtn.href = c.button.href; }

  const ctaWa = document.getElementById("ctaWa");
  if (ctaWa) ctaWa.href = waLink("Hi " + C.name + ", I'd like to enquire about renting a vehicle in Goa. Please share availability.");

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
    const map = { facebook: "bi-facebook", instagram: "bi-instagram", twitter: "bi-twitter-x", youtube: "bi-youtube" };
    socialEl.innerHTML = Object.keys(map)
      .filter(function (k) { return CONFIG.social[k]; })
      .map(function (k) {
        return `<a href="${CONFIG.social[k]}" target="_blank" rel="noopener" aria-label="${k}"><i class="bi ${map[k]}"></i></a>`;
      }).join("");
  }

  document.title = "Rentals in Goa | Cars & Bikes — " + C.name;
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

/* ---------- Header shadow on scroll ---------- */
function initHeaderShadow() {
  const nav = document.getElementById("syNav");
  if (!nav) return;
  function update() { nav.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", update, { passive: true });
  update();
}