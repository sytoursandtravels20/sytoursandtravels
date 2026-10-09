/* ============================================================
   main.js — shared page setup and homepage orchestration.
   ============================================================ */

const activityCatalogFilters = { type: "all", category: "all" };
const waterTripCatalogFilters = { type: "all", category: "all" };

document.addEventListener("DOMContentLoaded", async function () {

  const componentsReady = Promise.all([
    loadComponent("site-header", "components/header.html"),
    loadComponent("site-footer", "components/footer.html")
  ]);

  const page = document.body.dataset.page;
  if (page === "privacy") {
    loadLegalPolicy(
      CONFIG.privacyPolicyCsvUrl,
      document.getElementById("privacyPolicyContent"),
      document.getElementById("privacyPolicyUpdated")
    );
  } else if (page === "terms") {
    loadLegalPolicy(
      CONFIG.termsCsvUrl,
      document.getElementById("termsContent"),
      document.getElementById("termsUpdated")
    );
  }

  renderCategories(LOCAL_DATA.categories);
  if (page === "home") {
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
  } else if (page === "activities") {
    renderExperiences(getCachedCatalog(
      CONFIG.activitiesCsvUrl,
      parseActivitiesCsv,
      LOCAL_DATA.activities,
      "activities"
    ));
    loadActivities().then(renderExperiences);
  } else if (page === "yachts") {
    renderYachtsBoatsCruises({ waterTrips: getCachedCatalog(
      CONFIG.waterTripsCsvUrl,
      parseWaterTripsCsv,
      getLocalWaterTrips(),
      "water trips"
    ) });
    loadWaterTrips().then(function (waterTrips) {
      renderYachtsBoatsCruises({ waterTrips: waterTrips });
    });
  }
  renderWhyBook(LOCAL_DATA.whyBook);
  renderHowItWorks(LOCAL_DATA.howItWorks);

  if (page === "home") {
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
  }

  await componentsReady;
  applyConfig();
  setHeaderPhoneLink();
  markActiveNav();
  initHeaderShadow();
});

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

/* ---------- Homepage card rendering ---------- */
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
  const items = activities || [];
  renderSheetCatalogFilters("activityCatalogFilters", items, activityCatalogFilters, function () {
    renderExperiences(items);
  });
  if (el) {
    el.innerHTML = filterSheetCatalog(items, activityCatalogFilters).map(activityCard).join("");
  }
}
function renderYachtsBoatsCruises(DATA) {
  const el = document.getElementById("yachtsGrid");
  if (!el) return;
  const trips = DATA.waterTrips || [];
  renderSheetCatalogFilters("waterTripCatalogFilters", trips, waterTripCatalogFilters, function () {
    renderYachtsBoatsCruises(DATA);
  });
  el.innerHTML = filterSheetCatalog(trips, waterTripCatalogFilters).map(function (trip) {
    return waterCard(trip, trip.typeLabel || trip.type);
  }).join("");
}

function renderSheetCatalogFilters(containerId, items, filters, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const types = sheetCatalogOptions(items, "type", "typeLabel");
  if (filters.type !== "all" && !types.some(function (option) { return option.value === filters.type; })) {
    filters.type = "all";
  }
  const visibleItems = filters.type === "all" ? items : items.filter(function (item) {
    return item.type === filters.type;
  });
  const categories = sheetCatalogOptions(visibleItems, "category", "categoryLabel");

  if (filters.category !== "all" && !categories.some(function (option) { return option.value === filters.category; })) {
    filters.category = "all";
  }

  container.innerHTML = [
    renderSheetFilterGroup("type", types, filters.type, "All types"),
    renderSheetFilterGroup("category", categories, filters.category, "All categories")
  ].join("");
  container.onclick = function (event) {
    const button = event.target.closest("[data-catalog-filter]");
    if (!button || !container.contains(button)) return;
    const filter = button.dataset.catalogFilter;
    filters[filter] = button.dataset.filterValue || "all";
    if (filter === "type") filters.category = "all";
    onChange();
  };
}

function renderSheetFilterGroup(filter, options, selected, allLabel) {
  if (options.length < 2) return "";
  return `<div class="catalog-filter-group" aria-label="${esc(allLabel)}"><button class="catalog-filter-chip${selected === "all" ? " is-active" : ""}" type="button" data-catalog-filter="${filter}" data-filter-value="all">${allLabel}</button>${options.map(function (option) {
    return `<button class="catalog-filter-chip${selected === option.value ? " is-active" : ""}" type="button" data-catalog-filter="${filter}" data-filter-value="${esc(option.value)}">${esc(option.label)}</button>`;
  }).join("")}</div>`;
}

function sheetCatalogOptions(items, valueKey, labelKey) {
  const options = new Map();
  items.forEach(function (item) {
    const value = (item[valueKey] || "").trim();
    if (!value) return;
    const label = (item[labelKey] || "").trim() || catalogLabel(value);
    if (!options.has(value) || (!options.get(value).customLabel && item[labelKey])) {
      options.set(value, { value: value, label: label, customLabel: Boolean(item[labelKey]) });
    }
  });
  return Array.from(options.values()).sort(function (a, b) {
    return a.label.localeCompare(b.label);
  });
}

function filterSheetCatalog(items, filters) {
  return items.filter(function (item) {
    return (filters.type === "all" || item.type === filters.type) &&
      (filters.category === "all" || item.category === filters.category);
  });
}
function renderWhyBook(whyBook) {
  const el = document.getElementById("whyGrid");
  if (el) el.innerHTML = (whyBook || []).map(whyItem).join("");
}
function renderHowItWorks(steps) {
  const el = document.getElementById("howGrid");
  if (el) el.innerHTML = (steps || []).map(howItem).join("");
}
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