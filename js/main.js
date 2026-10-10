/* ============================================================
   main.js — shared page setup and homepage orchestration.
   ============================================================ */

const activityCatalogFilters = { type: "all", category: "all" };
const waterTripCatalogFilters = { type: "all", category: "all" };
let currentOffers = [];
let currentOfferIndex = 0;

document.addEventListener("DOMContentLoaded", async function () {

  const componentsReady = Promise.all([
    loadComponent("site-header", "components/header.html"),
    loadComponent("site-footer", "components/footer.html")
  ]);

  const page = document.body.dataset.page;
  // Show saved/local content immediately, then replace it when the latest sheet loads.
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
    renderOffers(getCachedCatalog(CONFIG.offersCsvUrl, parseOffersCsv, [], "offers"));
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
    loadOffers().then(renderOffers);
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
  applySharedConfig();
  setHeaderPhoneLink();
  markActiveNav();
  initHeaderShadow();
  applySiteLanguage();
});

document.addEventListener("site-language-change", function () {
  const page = document.body.dataset.page;
  if (page === "home") {
    renderCategories(LOCAL_DATA.categories);
    renderFeatured(visibleVehicles(getCachedCatalog(
      CONFIG.rentalInventoryCsvUrl, parseRentalInventoryCsv, LOCAL_DATA.vehicles, "rental inventory"
    )).filter(function (vehicle) { return vehicle.featured; }));
    renderExperiences(getCachedCatalog(
      CONFIG.activitiesCsvUrl, parseActivitiesCsv, LOCAL_DATA.activities, "activities"
    ));
    renderYachtsBoatsCruises({ waterTrips: getCachedCatalog(
      CONFIG.waterTripsCsvUrl, parseWaterTripsCsv, getLocalWaterTrips(), "water trips"
    ) });
    renderWhyBook(LOCAL_DATA.whyBook);
    renderHowItWorks(LOCAL_DATA.howItWorks);
    renderOffers(currentOffers);
  } else if (page === "activities") {
    renderExperiences(getCachedCatalog(
      CONFIG.activitiesCsvUrl, parseActivitiesCsv, LOCAL_DATA.activities, "activities"
    ));
  } else if (page === "yachts") {
    renderYachtsBoatsCruises({ waterTrips: getCachedCatalog(
      CONFIG.waterTripsCsvUrl, parseWaterTripsCsv, getLocalWaterTrips(), "water trips"
    ) });
  }
  translateBuiltInText();
});

function applyConfig() {
  const C = CONFIG.company;

  // Homepage-specific text and images come from CONFIG; header/footer are shared separately.
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
    return waterCard(trip);
  }).join("");
}

function renderOffers(offers) {
  const strip = document.getElementById("offersStrip");
  if (!strip) return;
  currentOffers = offers || [];
  if (!currentOffers.length) {
    strip.hidden = true;
    return;
  }
  currentOfferIndex = Math.min(currentOfferIndex, currentOffers.length - 1);
  strip.hidden = false;
  const offer = currentOffers[currentOfferIndex];
  const discount = document.getElementById("offerDiscount");
  const title = document.getElementById("offerTitle");
  const description = document.getElementById("offerDescription");
  const validity = document.getElementById("offerValidity");
  const cta = document.getElementById("offerCta");
  const controls = document.getElementById("offerControls");
  const position = document.getElementById("offerPosition");
  if (discount) {
    discount.textContent = offer.discount;
    discount.hidden = !offer.discount;
  }
  if (title) title.textContent = offer.title;
  if (description) description.textContent = offer.description;
  if (validity) {
    validity.textContent = offer.validUntil
      ? siteText("Valid until {date}", { date: offer.validUntil })
      : "";
    validity.hidden = !offer.validUntil;
  }
  if (cta) {
    const message = siteText("Hello {company}, I saw this offer: {offer}. Please confirm its availability and terms.", {
      company: CONFIG.company.name,
      offer: [offer.title, offer.discount, offer.description].filter(Boolean).join(" — ")
    });
    cta.textContent = siteText("Ask about this offer on WhatsApp");
    cta.href = waLink(message);
  }
  if (controls) controls.hidden = currentOffers.length < 2;
  if (position) position.textContent = siteText("{current} of {total}", {
    current: String(currentOfferIndex + 1),
    total: String(currentOffers.length)
  });
  const previous = document.getElementById("offerPrevious");
  const next = document.getElementById("offerNext");
  if (previous) previous.onclick = function () {
    currentOfferIndex = (currentOfferIndex - 1 + currentOffers.length) % currentOffers.length;
    renderOffers(currentOffers);
  };
  if (next) next.onclick = function () {
    currentOfferIndex = (currentOfferIndex + 1) % currentOffers.length;
    renderOffers(currentOffers);
  };
}

// Build type and category buttons from sheet values instead of a hard-coded list.
function renderSheetCatalogFilters(containerId, items, filters, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.setAttribute("data-i18n-preserve", "");

  const types = sheetCatalogOptions(items, "type");
  if (filters.type !== "all" && !types.some(function (option) { return option.value === filters.type; })) {
    filters.type = "all";
  }
  const visibleItems = filters.type === "all" ? items : items.filter(function (item) {
    return item.type === filters.type;
  });
  const categories = sheetCatalogOptions(visibleItems, "category");

  if (filters.category !== "all" && !categories.some(function (option) { return option.value === filters.category; })) {
    filters.category = "all";
  }

  container.innerHTML = [
    renderSheetFilterGroup("type", types, filters.type, siteText("All types")),
    renderSheetFilterGroup("category", categories, filters.category, siteText("All categories"))
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

// Use a readable label from the sheet, or title-case the value if no label was entered.
function sheetCatalogOptions(items, valueKey) {
  const options = new Map();
  items.forEach(function (item) {
    const value = (item[valueKey] || "").trim();
    if (!value) return;
    const label = valueKey === "type" ? catalogTypeLabel(value) : catalogLabel(value);
    if (!options.has(value)) options.set(value, { value: value, label: label });
  });
  return Array.from(options.values()).sort(function (a, b) {
    return a.label.localeCompare(b.label);
  });
}

// Hide sheet categories that do not match the currently selected type.
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