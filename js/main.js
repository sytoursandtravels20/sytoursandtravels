/* ============================================================
   main.js — homepage orchestration.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async function () {

  const componentsReady = Promise.all([
    loadComponent("site-header", "components/header.html"),
    loadComponent("site-footer", "components/footer.html")
  ]);

  renderCategories(LOCAL_DATA.categories);
  renderFeatured(visibleVehicles(getCachedCatalog(
    CONFIG.rentalInventoryCsvUrl,
    parseRentalInventoryCsv,
    LOCAL_DATA.vehicles,
    "rental inventory"
  )).filter(function (vehicle) { return vehicle.featured; }));
  renderExperiences(getCachedCatalog(
    CONFIG.activitiesCsvUrl,
    parseActivitiesCsv,
    LOCAL_DATA.activities,
    "activities"
  ));
  renderYachtsBoatsCruises({ waterTrips: getCachedCatalog(
    CONFIG.waterTripsCsvUrl,
    parseWaterTripsCsv,
    getLocalWaterTrips(),
    "water trips"
  ) });
  renderWhyBook(LOCAL_DATA.whyBook);
  renderHowItWorks(LOCAL_DATA.howItWorks);

  initSearchTabs();
  loadRentalInventory().then(function (vehicles) {
    renderFeatured(visibleVehicles(vehicles).filter(function (vehicle) {
      return vehicle.featured;
    }));
  });
  loadActivities().then(renderExperiences);
  loadWaterTrips().then(function (waterTrips) {
    renderYachtsBoatsCruises({ waterTrips: waterTrips });
  });

  await componentsReady;
  applyConfig();
  setHeaderPhoneLink();
  markActiveNav();
  initHeaderShadow();
});

/* ---------- applyConfig (unchanged) ---------- */
function applyConfig() {
  const C = CONFIG.company;

  setText("brandName", C.name);
  setText("brandTag",  C.tagline);
  setBrandLogo("brandLogo");

  const h = CONFIG.hero;
  setText("heroEyebrow", h.eyebrow);
  setText("heroTitle1",  h.titleLine1);
  setText("heroTitle2",  h.titleLine2);
  setText("heroSub",     h.subtitle);

  const heroEl = document.querySelector(".hero");
  if (heroEl && h.backgroundImage) heroEl.style.setProperty("--hero-img", `url("${h.backgroundImage}")`);

  const cta1 = document.getElementById("heroCta1");
  const cta2 = document.getElementById("heroCta2");
  if (cta1) { cta1.textContent = h.ctaPrimary.label;   cta1.href = h.ctaPrimary.href; }
  if (cta2) { cta2.textContent = h.ctaSecondary.label; cta2.href = h.ctaSecondary.href; }

  const c = CONFIG.cta;
  setText("ctaTitle", c.title);
  setText("ctaSub",   c.subtitle);

  const ctaEl = document.querySelector(".cta");
  if (ctaEl && c.backgroundImage) ctaEl.style.setProperty("--cta-img", `url("${c.backgroundImage}")`);

  const ctaBtn = document.getElementById("ctaBtn");
  if (ctaBtn) {
    ctaBtn.textContent = c.button.label;
    ctaBtn.href = document.body.dataset.page === "activities" ? "/activities/#activities" : c.button.href;
  }

  const ctaWa = document.getElementById("ctaWa");
  if (ctaWa) ctaWa.href = waLink("Hi " + C.name + ", I'd like to enquire about your rentals and activities. Please share details.");

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

  const socialEl = document.getElementById("footerSocial");
  if (socialEl) {
    const map = { facebook: "bi-facebook", instagram: "bi-instagram", twitter: "bi-twitter-x", youtube: "bi-youtube" };
    socialEl.innerHTML = Object.keys(map)
      .filter(function (k) { return CONFIG.social[k]; })
      .map(function (k) {
        return `<a href="${CONFIG.social[k]}" target="_blank" rel="noopener" aria-label="${k}"><i class="bi ${map[k]}"></i></a>`;
      }).join("");
  }

  const page = document.body.dataset.page;
  const titles = {
    home: "Car Rentals in Goa | " + C.name,
    about: "About " + C.name + " | Goa",
    taxi: "Taxi Service in Goa | " + C.name,
    activities: "Water Activities in Goa | " + C.name,
    yachts: "Yacht, Boat & Cruise Trips in Goa | " + C.name,
    blog: "Goa Travel Stories | " + C.name,
    contact: "Contact " + C.name + " | Goa",
    privacy: "Privacy Policy | " + C.name,
    terms: "Terms of Use | " + C.name
  };
  document.title = titles[page] || C.name;
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

/* ---------- Render functions (unchanged) ---------- */
function renderCategories(categories) {
  const el = document.getElementById("categoryGrid");
  if (el) el.innerHTML = (categories || []).map(categoryCard).join("");
}
function renderFeatured(vehicles) {
  const el = document.getElementById("featuredGrid");
  if (el) el.innerHTML = (vehicles || []).map(vehicleCard).join("");
}
function renderExperiences(activities) {
  const el = document.getElementById("experiencesGrid");
  if (el) el.innerHTML = (activities || []).map(activityCard).join("");
}
function renderYachtsBoatsCruises(DATA) {
  const el = document.getElementById("yachtsGrid");
  if (!el) return;
  const trips = DATA.waterTrips || [];
  el.innerHTML = trips.map(function (trip) {
    return waterCard(trip, trip.type);
  }).join("");
}
function renderWhyBook(whyBook) {
  const el = document.getElementById("whyGrid");
  if (el) el.innerHTML = (whyBook || []).map(whyItem).join("");
}
function renderHowItWorks(steps) {
  const el = document.getElementById("howGrid");
  if (el) el.innerHTML = (steps || []).map(howItem).join("");
}
/* ---------- Interactions (unchanged) ---------- */
function initSearchTabs() {
  const tabs = document.querySelectorAll(".search-tab");
  const searchButton = document.getElementById("searchNowButton");
  const dateInput = document.getElementById("searchDate");
  const guestsInput = document.getElementById("searchGuests");

  // Keep Search Now aligned with the selected service and entered trip details.
  function updateSearchDestination(tab) {
    if (!searchButton) return;
    const destination = new URL(tab.dataset.href || "/rentals/", window.location.origin);
    if (dateInput && dateInput.value) destination.searchParams.set("date", dateInput.value);
    if (guestsInput && guestsInput.value) destination.searchParams.set("guests", guestsInput.value);
    searchButton.href = destination.pathname + destination.search + destination.hash;
  }

  const activeTab = document.querySelector(".search-tab.is-active");
  if (activeTab) updateSearchDestination(activeTab);

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      updateSearchDestination(tab);
    });
  });
}
function initHeaderShadow() {
  const nav = document.getElementById("syNav");
  if (!nav) return;
  function update() { nav.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", update, { passive: true });
  update();
}