/* ============================================================
   rentals.js — logic for rentals/index.html.
   Loads header/footer, applies CONFIG, loads data, manages
   filters (category / search / sort / available-only).
   ============================================================ */

let allVehicles = [];
const requestedCategory = new URLSearchParams(window.location.search).get("category");
const requestedType = new URLSearchParams(window.location.search).get("type");
const rentalPageType = document.body.dataset.rentalType || "car";
let currentFilters = {
  type: requestedType || "all",
  category: requestedCategory || "all",
  search: "",
  sort: "recommended",
  availableOnly: false
};

document.addEventListener("DOMContentLoaded", async function () {

  const componentsReady = Promise.all([
    loadComponent("site-header", "components/header.html"),
    loadComponent("site-footer", "components/footer.html")
  ]);

  // Draw the last saved sheet data (or built-in fallback), then refresh in the background.
  allVehicles = prepareRentalCards(visibleVehicles(getCachedCatalog(
    CONFIG.rentalInventoryCsvUrl,
    parseRentalInventoryCsv,
    LOCAL_DATA.vehicles,
    "rental inventory"
  )));

  renderWhyBook(LOCAL_DATA.whyBook);
  renderVehicleFilters();
  initFilters();
  initRentalBooking();
  renderListings();
  loadRentalInventory().then(function (vehicles) {
    allVehicles = prepareRentalCards(visibleVehicles(vehicles));
    renderVehicleFilters();
    renderListings();
  });
  await componentsReady;
  applyConfig();
  applySharedConfig();
  setHeaderContactLinks();
  markActiveNav();
  initHeaderShadow();
});

/* ============================================================
   FILTER WIRING
   ============================================================ */
function initFilters() {
  initFilterGroup("vehicleTypeFilters", "type", function (type) {
    currentFilters.type = type;
    currentFilters.category = "all";
    renderVehicleFilters();
    renderListings();
  });
  initFilterGroup("vehicleCategoryFilters", "category", function (category) {
    currentFilters.category = category;
    renderVehicleFilters();
    renderListings();
  });

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

  const sortSel = document.getElementById("filterSort");
  if (sortSel) {
    sortSel.addEventListener("change", function (e) {
      currentFilters.sort = e.target.value;
      renderListings();
    });
  }

  const availOnly = document.getElementById("availableOnly");
  if (availOnly) {
    availOnly.addEventListener("change", function (e) {
      currentFilters.availableOnly = e.target.checked;
      renderListings();
    });
  }

  /* Clear filters button */
  const clearBtn = document.getElementById("clearFilters");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      currentFilters = { category: "all", search: "", sort: "recommended", availableOnly: false };
      currentFilters.type = "all";
      renderVehicleFilters();
      if (searchInput) searchInput.value = "";
      if (sortSel) sortSel.value = "recommended";
      if (availOnly) availOnly.checked = false;
      renderListings();
    });
  }
}

function initFilterGroup(id, filterName, onSelect) {
  const group = document.getElementById(id);
  if (!group) return;
  group.addEventListener("click", function (event) {
    const chip = event.target.closest(".filter-chip");
    if (!chip || !group.contains(chip)) return;
    currentFilters[filterName] = chip.dataset.filterValue || "all";
    onSelect(currentFilters[filterName]);
  });
}

function renderVehicleFilters() {
  const typeFilters = document.getElementById("vehicleTypeFilters");
  const categoryFilters = document.getElementById("vehicleCategoryFilters");
  const types = Array.from(new Set(allVehicles.map(vehicleType)));
  if (currentFilters.type !== "all" && !types.includes(currentFilters.type)) {
    currentFilters.type = "all";
  }
  const availableTypes = currentFilters.type === "all" ? types : types.filter(function (type) {
    return type === currentFilters.type;
  });
  const categories = Array.from(new Set(allVehicles
    .filter(function (vehicle) {
      return currentFilters.type === "all" || vehicleType(vehicle) === currentFilters.type;
    })
    .map(function (vehicle) { return vehicle.category || "other"; })));

  if (typeFilters) {
    typeFilters.hidden = types.length < 2;
    typeFilters.innerHTML = types.length < 2 ? "" : [
      filterChip("all", formatText("All vehicle types"), currentFilters.type === "all")
    ].concat(types.map(function (type) {
      return filterChip(type, catalogTypeLabel(type), currentFilters.type === type);
    })).join("");
  }

  if (categoryFilters) {
    const selectedCategory = categories.indexOf(currentFilters.category) !== -1 ? currentFilters.category : "all";
    if (selectedCategory !== currentFilters.category) currentFilters.category = selectedCategory;
    categoryFilters.innerHTML = [
      filterChip("all", formatText(availableTypes.length > 1 ? "All categories" : "All"), selectedCategory === "all")
    ].concat(categories.map(function (category) {
      const sample = allVehicles.find(function (vehicle) {
        return vehicle.category === category && (currentFilters.type === "all" || vehicleType(vehicle) === currentFilters.type);
      });
      return filterChip(category, vehicleCategoryLabel(category, sample && sample.categoryLabel), selectedCategory === category);
    })).join("");
  }
}

function filterChip(value, label, isActive) {
  return `<button class="filter-chip${isActive ? " is-active" : ""}" type="button" data-filter-value="${esc(value)}">${esc(label)}</button>`;
}

function vehicleType(vehicle) {
  return vehicle.type || "car";
}

function filterPageVehicles(vehicles) {
  return vehicles.filter(function (vehicle) {
    const type = vehicleType(vehicle);
    return rentalPageType === "two-wheeler"
      ? type === "bike" || type === "scooty" || type === "scooter"
      : type === "car";
  });
}

function prepareRentalCards(vehicles) {
  return filterPageVehicles(vehicles).flatMap(function (vehicle) {
    const rates = vehicle.rates && vehicle.rates.length
      ? vehicle.rates
      : (typeof vehicle.price === "number"
        ? [{ transmission: vehicle.transmission || "Standard", price: vehicle.price }]
        : []);
    return rates.length
      ? rates.map(function (rate) {
        return Object.assign({}, vehicle, {
          rates: [rate],
          transmission: rate.transmission || vehicle.transmission || "Standard"
        });
      })
      : [vehicle];
  });
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
  grid.innerHTML = list.map(function (vehicle) {
    return vehicleCard(vehicle, allVehicles.indexOf(vehicle));
  }).join("");
  if (count) {
    count.textContent = formatText("Showing {shown} of {total} vehicles", {
      shown: String(list.length),
      total: String(allVehicles.length)
    });
  }
}

function initRentalBooking() {
  const grid = document.getElementById("rentalGrid");
  const dialog = document.getElementById("rentalBookingDialog");
  const form = document.getElementById("rentalBookingForm");
  const dateInput = document.getElementById("rentalPickupDate");
  const pickupInput = document.getElementById("rentalPickupLocation");
  const mapWrap = document.getElementById("rentalPickupMapWrap");
  const mapElement = document.getElementById("rentalPickupMap");
  const mapStatus = document.getElementById("rentalPickupMapStatus");
  const mapToggle = document.getElementById("toggleRentalPickupMap");
  if (!grid || !dialog || !form || !dateInput || !pickupInput || !mapWrap || !mapElement || !mapStatus || !mapToggle) return;

  const localToday = localDateString(new Date());
  dateInput.min = localToday;
  let map;
  let mapMarker;
  let lookupController;

  grid.addEventListener("click", function (event) {
    const button = event.target instanceof Element
      ? event.target.closest("[data-rental-book]")
      : null;
    if (!button || !grid.contains(button)) return;

    const vehicle = allVehicles[Number(button.dataset.rentalBook)];
    if (!vehicle || vehicle.status === "booked") return;

    const rate = vehicle.rates && vehicle.rates[0]
      ? vehicle.rates[0]
      : (typeof vehicle.price === "number" ? { transmission: vehicle.transmission || "Standard", price: vehicle.price } : null);
    if (!rate) {
      console.error("[SY] Cannot start rental booking: no price is available for " + vehicle.name + ".");
      return;
    }

    document.getElementById("rentalBookingVehicle").textContent =
      vehicle.name + " · " + (rate.transmission || vehicle.transmission || "Standard") +
      " · ₹" + fmtPrice(rate.price) + " / day";
    form.reset();
    form.dataset.vehicleIndex = String(allVehicles.indexOf(vehicle));
    dateInput.min = localToday;
    mapWrap.hidden = true;
    mapToggle.setAttribute("aria-expanded", "false");
    mapToggle.innerHTML = '<i class="bi bi-map" aria-hidden="true"></i> Choose on map';
    mapStatus.textContent = "";
    dialog.showModal();
  });

  mapToggle.addEventListener("click", function () {
    const shouldShowMap = mapWrap.hidden;
    mapWrap.hidden = !shouldShowMap;
    mapToggle.setAttribute("aria-expanded", String(shouldShowMap));
    mapToggle.innerHTML = shouldShowMap
      ? '<i class="bi bi-keyboard" aria-hidden="true"></i> Enter location instead'
      : '<i class="bi bi-map" aria-hidden="true"></i> Choose on map';
    if (!shouldShowMap) return;

    if (!window.L) {
      mapStatus.textContent = "Map unavailable. Please enter your pickup location above.";
      return;
    }
    if (!map) {
      map = window.L.map(mapElement).setView([15.49, 73.83], 11);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
      }).addTo(map);
      map.on("click", selectPickupLocation);
    }
    requestAnimationFrame(function () { map.invalidateSize(); });
  });

  dialog.addEventListener("click", function (event) {
    if (event.target instanceof Element && event.target.closest("[data-close-rental-dialog]")) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", function () {
    if (lookupController) lookupController.abort();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const vehicle = allVehicles[Number(form.dataset.vehicleIndex)];
    const rate = vehicle && vehicle.rates && vehicle.rates[0]
      ? vehicle.rates[0]
      : (vehicle && typeof vehicle.price === "number" ? { transmission: vehicle.transmission || "Standard", price: vehicle.price } : null);
    if (!vehicle || !rate) {
      console.error("[SY] Cannot submit rental enquiry: vehicle or selected rate is no longer available.");
      return;
    }

    const formData = new FormData(form);
    const message = [
      "Hi " + CONFIG.company.name + ", I'd like to book " + vehicle.name + ".",
      "Transmission: " + (rate.transmission || "Standard"),
      "Price: ₹" + fmtPrice(rate.price) + " per day",
      "Pickup location: " + String(formData.get("location")).trim(),
      "Pickup date: " + String(formData.get("date")),
      "Pickup time: " + String(formData.get("time")),
      "Please confirm availability and booking details. Thank you."
    ].join("\n");

    const bookingWindow = window.open(waLink(message), "_blank");
    if (bookingWindow) {
      bookingWindow.opener = null;
    } else {
      window.location.assign(waLink(message));
    }
    dialog.close();
  });

  async function selectPickupLocation(event) {
    if (lookupController) lookupController.abort();
    lookupController = new AbortController();
    const point = event.latlng;
    if (mapMarker) mapMarker.setLatLng(point);
    else mapMarker = window.L.marker(point).addTo(map);
    mapStatus.textContent = "Finding this place…";

    const url = new URL("https://photon.komoot.io/reverse");
    url.search = new URLSearchParams({ lat: String(point.lat), lon: String(point.lng) });
    try {
      const response = await fetch(url, { signal: lookupController.signal });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const result = await response.json();
      const feature = result.features && result.features[0];
      const place = feature && rentalMapPlace(feature.properties);
      if (!place) throw new Error("No place name was found for the selected point.");
      pickupInput.value = place;
      mapStatus.textContent = "Pickup location selected.";
      mapWrap.hidden = true;
      mapToggle.setAttribute("aria-expanded", "false");
      mapToggle.innerHTML = '<i class="bi bi-map" aria-hidden="true"></i> Change map location';
      pickupInput.focus();
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("[SY] Could not identify the selected rental pickup location.", error);
        mapStatus.textContent = "Could not identify that place. Try tapping nearby or type the location above.";
      }
    }
  }
}

function localDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function rentalMapPlace(properties) {
  return [
    properties.name,
    properties.street,
    properties.locality,
    properties.city,
    properties.state
  ].filter(function (part, index, parts) {
    return part && parts.indexOf(part) === index;
  }).join(", ");
}

function applyFilters(items, filters) {
  let list = items.slice();

  /* Vehicle type */
  if (filters.type && filters.type !== "all") {
    list = list.filter(function (v) { return vehicleType(v) === filters.type; });
  }

  /* Category */
  if (filters.category && filters.category !== "all") {
    list = list.filter(function (v) { return v.category === filters.category; });
  }

  // Booked vehicles can still be shown, but are removed by the availability toggle.
  /* Available only */
  if (filters.availableOnly) {
    list = list.filter(function (v) { return v.status !== "booked"; });
  }

  /* Search — matches vehicle name or listed transmission */
  if (filters.search) {
    const q = filters.search;
    list = list.filter(function (v) {
      return (
        (v.name || "").toLowerCase().indexOf(q) !== -1 ||
        (v.transmission || "").toLowerCase().indexOf(q) !== -1 ||
        (v.rates || []).some(function (rate) {
          return (rate.transmission || "").toLowerCase().indexOf(q) !== -1;
        })
      );
    });
  }

  /* Sort */
  switch (filters.sort) {
    case "price-asc":  list.sort(function (a, b) { return compareVehiclePrice(a, b, false); }); break;
    case "price-desc": list.sort(function (a, b) { return compareVehiclePrice(a, b, true); }); break;
    case "name":       list.sort(function (a, b) { return a.name.localeCompare(b.name); }); break;
  }

  return list;
}

function compareVehiclePrice(a, b, descending) {
  const aPrice = vehicleSortPrice(a);
  const bPrice = vehicleSortPrice(b);
  const aHasPrice = Number.isFinite(aPrice);
  const bHasPrice = Number.isFinite(bPrice);
  if (aHasPrice !== bHasPrice) return aHasPrice ? -1 : 1;
  return descending ? bPrice - aPrice : aPrice - bPrice;
}

function vehicleSortPrice(vehicle) {
  const rates = vehicle.rates || [];
  if (rates.length) {
    return Math.min.apply(null, rates.map(function (rate) { return rate.price; }));
  }
  return typeof vehicle.price === "number" ? vehicle.price : Number.POSITIVE_INFINITY;
}

/* ============================================================
   STATIC SECTIONS
   ============================================================ */
function renderWhyBook(whyBook) {
  const el = document.getElementById("whyGrid");
  if (el) el.innerHTML = (whyBook || []).map(whyItem).join("");
}

/* ============================================================
   CONFIG → header, footer, CTA
   ============================================================ */
function applyConfig() {
  const C = CONFIG.company;

  // Rental-page calls-to-action are separate from the shared header and footer.
  const c = CONFIG.cta;
  setText("ctaTitle", c.title);
  setText("ctaSub",   c.subtitle);

  const ctaEl = document.querySelector(".cta");
  if (ctaEl && c.backgroundImage) ctaEl.style.setProperty("--cta-img", `url("${c.backgroundImage}")`);

  const ctaBtn = document.getElementById("ctaBtn");
  if (ctaBtn) { ctaBtn.textContent = c.button.label; ctaBtn.href = c.button.href; }

  const ctaWa = document.getElementById("ctaWa");
  if (ctaWa) ctaWa.href = waLink("Hi " + C.name + ", I'd like to enquire about renting a vehicle in Goa. Please share availability.");

  document.title = "Car Rentals in Goa — " + C.name;
}
