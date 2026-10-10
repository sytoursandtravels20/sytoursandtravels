/* ============================================================
   main.js — shared page setup and homepage orchestration.
   ============================================================ */

const activityCatalogFilters = { type: "all", category: "all" };
const waterTripCatalogFilters = { type: "all", category: "all" };
let activityItemsForGallery = [];
let waterTripItemsForGallery = [];

document.addEventListener("DOMContentLoaded", async function () {
  initActivityGallery();

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
    renderFeatured(visibleVehicles(getCachedCatalog(
      CONFIG.rentalInventoryCsvUrl,
      parseRentalInventoryCsv,
      LOCAL_DATA.vehicles,
      "rental inventory"
    )).filter(function (vehicle) {
      return vehicle.featured && (vehicle.type || "car") === "car";
    }));
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
  } else if (page === "offers") {
    renderOfferListings(getCachedCatalog(CONFIG.offersCsvUrl, parseOffersCsv, [], "offers"));
    loadOffers().then(renderOfferListings);
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
        return vehicle.featured && (vehicle.type || "car") === "car";
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
    offers: "Offers & Discounts | " + C.name,
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
    activityItemsForGallery = filterSheetCatalog(items, activityCatalogFilters);
    el.innerHTML = activityItemsForGallery.map(activityCard).join("");
  }
}

function initActivityGallery() {
  const dialog = document.createElement("dialog");
  dialog.className = "activity-gallery-dialog";
  dialog.setAttribute("aria-label", "Activity details");
  document.body.appendChild(dialog);

  document.addEventListener("click", function (event) {
    const card = event.target instanceof Element
      ? event.target.closest(".activity-card, .water-trip-card")
      : null;
    if (!card) return;
    const isWaterTrip = card.classList.contains("water-trip-card");
    const index = Number(isWaterTrip ? card.dataset.waterTripIndex : card.dataset.activityIndex);
    const item = (isWaterTrip ? waterTripItemsForGallery : activityItemsForGallery)[index];
    if (!item) return;
    openCatalogGallery(dialog, item, isWaterTrip);
  });

  dialog.addEventListener("click", function (event) {
    const button = event.target instanceof Element ? event.target.closest("[data-gallery-action]") : null;
    if (button) {
      const action = button.dataset.galleryAction;
      if (action === "close") {
        dialog.close();
      } else if (action === "move") {
        const track = dialog.querySelector(".activity-gallery-track");
        const direction = Number(button.dataset.galleryMove);
        if (track) track.scrollBy({ left: track.clientWidth * direction, behavior: "smooth" });
      } else if (action === "select") {
        const track = dialog.querySelector(".activity-gallery-track");
        const index = Number(button.dataset.galleryIndex);
        if (track) track.scrollTo({ left: track.clientWidth * index, behavior: "smooth" });
      }
    } else if (event.target === dialog) {
      dialog.close();
    }
  });
}

function openCatalogGallery(dialog, item, isWaterTrip) {
  const images = activityImages(item);
  const details = String(item.details || item.priceDetails || "").trim();
  const description = String(item.description || "").trim();
  const title = String(item.name || "");
  const meta = String(item.meta || "");
  const price = fmtPrice(item.price);
  const unit = String(item.unit || "");
  const tripType = isWaterTrip ? catalogTypeLabel(item.type) : "";
  const category = isWaterTrip && item.category ? catalogLabel(item.category) : "";
  const message =
    "Hi " + CONFIG.company.name + ", I'm interested in the " + title +
    (isWaterTrip ? " (" + tripType + (category ? ", " + category : "") + ", " + meta + ")" : " experience (" + meta + ")") +
    " at \u20B9" + price + " " + unit +
    ". Kindly share availability. Thank you.";

  dialog.innerHTML = `
    <div class="activity-dialog-header">
      <h2 id="activityDialogTitle">${esc(title)}</h2>
      <button class="activity-dialog-close" type="button" data-gallery-action="close" aria-label="Close activity details">
        <i class="bi bi-x-lg" aria-hidden="true"></i>
      </button>
    </div>
    <div class="activity-gallery-viewer">
      <button class="activity-gallery-arrow is-previous" type="button" data-gallery-action="move" data-gallery-move="-1" aria-label="Previous photo"${images.length < 2 ? " hidden" : ""}>
        <i class="bi bi-chevron-left" aria-hidden="true"></i>
      </button>
      <div class="activity-gallery-track" aria-label="Photos of ${esc(title)}" tabindex="0">
        ${images.map(function (image, index) {
          return `<figure class="activity-gallery-slide"><img src="${esc(image)}" alt="${esc(title)} photo ${index + 1}"${index ? ' loading="lazy"' : ""}></figure>`;
        }).join("")}
      </div>
      <button class="activity-gallery-arrow is-next" type="button" data-gallery-action="move" data-gallery-move="1" aria-label="Next photo"${images.length < 2 ? " hidden" : ""}>
        <i class="bi bi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
    ${images.length > 1 ? `
      <div class="activity-gallery-controls">
        <span class="activity-gallery-count" aria-live="polite">1 / ${images.length}</span>
        <div class="activity-gallery-dots" aria-label="Choose a photo">
          ${images.map(function (_image, index) {
            return `<button class="activity-gallery-dot" type="button" data-gallery-action="select" data-gallery-index="${index}" aria-label="Show photo ${index + 1}"${index === 0 ? ' aria-current="true"' : ""}></button>`;
          }).join("")}
        </div>
      </div>` : ""}
    <div class="activity-dialog-content">
      <p class="activity-dialog-meta"><i class="bi ${isWaterTrip ? "bi-info-circle" : "bi-geo-alt-fill"}" aria-hidden="true"></i> ${esc(meta)}</p>
      ${description ? `<p class="activity-dialog-description">${esc(description)}</p>` : ""}
      ${details ? `<div class="activity-dialog-details"><h3>Details</h3><p>${esc(details)}</p></div>` : ""}
      <div class="activity-dialog-footer">
        <p class="activity-dialog-price"><strong>\u20B9${price}</strong> <span>${esc(unit)}</span></p>
        <a class="btn-book" href="${waLink(message)}" target="_blank" rel="noopener">Enquire on WhatsApp <i class="bi bi-whatsapp" aria-hidden="true"></i></a>
      </div>
    </div>`;

  const track = dialog.querySelector(".activity-gallery-track");
  if (track) {
    track.addEventListener("scroll", function () {
      const currentIndex = Math.round(track.scrollLeft / track.clientWidth);
      const count = dialog.querySelector(".activity-gallery-count");
      if (count) count.textContent = (currentIndex + 1) + " / " + images.length;
      dialog.querySelectorAll(".activity-gallery-dot").forEach(function (dot, index) {
        if (index === currentIndex) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }, { passive: true });
  }

  dialog.setAttribute("aria-labelledby", "activityDialogTitle");
  dialog.showModal();
}
function renderYachtsBoatsCruises(DATA) {
  const el = document.getElementById("yachtsGrid");
  if (!el) return;
  const trips = DATA.waterTrips || [];
  renderSheetCatalogFilters("waterTripCatalogFilters", trips, waterTripCatalogFilters, function () {
    renderYachtsBoatsCruises(DATA);
  });
  waterTripItemsForGallery = filterSheetCatalog(trips, waterTripCatalogFilters);
  el.innerHTML = waterTripItemsForGallery.map(waterCard).join("");
}

function renderOfferListings(offers) {
  const grid = document.getElementById("offersGrid");
  const status = document.getElementById("offersStatus");
  if (!grid || !status) return;
  const items = offers || [];
  if (!items.length) {
    grid.replaceChildren();
    status.textContent = "There are no offers available right now. Please check back soon.";
    return;
  }
  status.textContent = "";
  grid.innerHTML = items.map(function (offer) {
    return `
      <article class="offer-card">
        <span class="offer-card-icon" aria-hidden="true"><i class="bi bi-tag-fill"></i></span>
        <div class="offer-card-copy">
          <span class="offer-card-label">Special offer</span>
          <h2>${esc(offer.title)}</h2>
          <p>${esc(offer.description)}</p>
        </div>
        <a class="offer-card-cta" href="${esc(offerWhatsAppLink(offer))}" target="_blank" rel="noopener">
          Ask about this offer <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
        </a>
      </article>`;
  }).join("");
}

function offerWhatsAppLink(offer) {
  const message = formatText("Hello {company}, I saw this offer: {offer}. Please confirm its availability and terms.", {
    company: CONFIG.company.name,
    offer: [offer.title, offer.description].filter(Boolean).join(" — ")
  });
  return waLink(message);
}

// Build type and category buttons from sheet values instead of a hard-coded list.
function renderSheetCatalogFilters(containerId, items, filters, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
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
    renderSheetFilterGroup("type", types, filters.type, formatText("All types")),
    renderSheetFilterGroup("category", categories, filters.category, formatText("All categories"))
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
  const form = document.getElementById("homeBookingForm");
  const fieldsContainer = document.getElementById("homeBookingFields");
  if (!form || !fieldsContainer) return;

  const serviceFields = {
    cars: {
      label: "Car Rental",
      fields: [
        { name: "pickup", label: "Pickup Location", type: "text", placeholder: "Where should we deliver?", icon: "bi-geo-alt", required: true },
        { name: "pickupDate", label: "Pickup Date", type: "date", icon: "bi-calendar-event", required: true },
        { name: "returnDate", label: "Return Date", type: "date", icon: "bi-calendar-event", required: true },
        { name: "vehicle", label: "Vehicle Preference", type: "text", placeholder: "Car, bike, or scooter (optional)", icon: "bi-car-front", required: false }
      ]
    },
    taxi: {
      label: "Taxi",
      fields: [
        { name: "pickup", label: "Pickup Location", type: "text", placeholder: "Enter pickup location", icon: "bi-geo-alt", required: true },
        { name: "destination", label: "Destination", type: "text", placeholder: "Where are you going?", icon: "bi-flag", required: true },
        { name: "date", label: "Travel Date", type: "date", icon: "bi-calendar-event", required: true },
        { name: "time", label: "Pickup Time", type: "time", icon: "bi-clock", required: true },
        { name: "passengers", label: "Passengers", type: "number", placeholder: "Number of passengers", icon: "bi-people", min: "1", step: "1", required: true }
      ]
    },
    activities: {
      label: "Activity",
      fields: [
        { name: "activity", label: "Activity", type: "text", placeholder: "Which activity would you like?", icon: "bi-water", required: true },
        { name: "date", label: "Activity Date", type: "date", icon: "bi-calendar-event", required: true },
        { name: "guests", label: "Guests", type: "number", placeholder: "Number of guests", icon: "bi-people", min: "1", step: "1", required: true }
      ]
    },
    yachts: {
      label: "Yacht",
      fields: [
        { name: "date", label: "Trip Date", type: "date", icon: "bi-calendar-event", required: true },
        { name: "guests", label: "Guests", type: "number", placeholder: "Number of guests", icon: "bi-people", min: "1", step: "1", required: true }
      ]
    },
    boats: {
      label: "Boat",
      fields: [
        { name: "date", label: "Trip Date", type: "date", icon: "bi-calendar-event", required: true },
        { name: "guests", label: "Guests", type: "number", placeholder: "Number of guests", icon: "bi-people", min: "1", step: "1", required: true }
      ]
    },
    cruises: {
      label: "Cruise",
      fields: [
        { name: "date", label: "Cruise Date", type: "date", icon: "bi-calendar-event", required: true },
        { name: "guests", label: "Guests", type: "number", placeholder: "Number of guests", icon: "bi-people", min: "1", step: "1", required: true }
      ]
    }
  };
  const savedValues = {};
  let currentTabKey = null;

  function localDateString(date) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  function renderFields(tab) {
    const service = serviceFields[tab.dataset.tab] || serviceFields.cars;
    if (currentTabKey) {
      savedValues[currentTabKey] = {};
      fieldsContainer.querySelectorAll("input").forEach(function (input) {
        savedValues[currentTabKey][input.name] = input.value;
      });
    }

    fieldsContainer.innerHTML = service.fields.map(function (field) {
      const fieldId = "homeBooking-" + field.name;
      return `<div class="search-field">
        <label for="${fieldId}">${field.label}</label>
        <div class="field-control"><i class="bi ${field.icon}" aria-hidden="true"></i><input id="${fieldId}" name="${field.name}" type="${field.type}"${field.placeholder ? ` placeholder="${field.placeholder}"` : ""}${field.min ? ` min="${field.min}"` : ""}${field.step ? ` step="${field.step}"` : ""}${field.required ? " required" : ""} aria-label="${field.label}" /></div>
      </div>`;
    }).join("");

    fieldsContainer.querySelectorAll('input[type="date"]').forEach(function (input) {
      input.min = localDateString(new Date());
    });
    fieldsContainer.querySelectorAll("input").forEach(function (input) {
      input.value = savedValues[tab.dataset.tab] && savedValues[tab.dataset.tab][input.name] || "";
    });
    currentTabKey = tab.dataset.tab;

    const pickupDate = fieldsContainer.querySelector('[name="pickupDate"]');
    const returnDate = fieldsContainer.querySelector('[name="returnDate"]');
    if (pickupDate && returnDate) {
      const updateReturnDateMin = function () {
        returnDate.min = pickupDate.value || localDateString(new Date());
      };
      pickupDate.addEventListener("change", updateReturnDateMin);
      updateReturnDateMin();
    }
    return service;
  }

  const activeTab = document.querySelector(".search-tab.is-active");
  if (activeTab) renderFields(activeTab);

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderFields(tab);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const activeServiceTab = document.querySelector(".search-tab.is-active");
    const service = serviceFields[activeServiceTab && activeServiceTab.dataset.tab] || serviceFields.cars;
    const entries = Array.from(fieldsContainer.querySelectorAll("input"))
      .filter(function (input) { return input.value.trim(); })
      .map(function (input) {
        const label = fieldsContainer.querySelector(`label[for="${input.id}"]`);
        let value = input.value.trim();
        if (input.type === "date") {
          const parts = value.split("-");
          value = parts[2] + "/" + parts[1] + "/" + parts[0];
        }
        return (label ? label.textContent : input.name) + ": " + value;
      });
    const request = [
      "Booking Request - " + service.label,
      "Location: Goa",
      ...entries,
      "",
      "Please confirm availability and price."
    ].join("\n");
    const whatsappUrl = "https://wa.me/" + CONFIG.company.phoneRaw + "?text=" + encodeURIComponent(request);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}