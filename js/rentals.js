/* ============================================================
   rentals.js — logic for rentals/index.html.
   Loads header/footer, applies CONFIG, loads data, manages
   filters (seats / type / sort on cars; legacy filters on two-wheelers).
   ============================================================ */

let allVehicles = [];
const requestedCategory = new URLSearchParams(window.location.search).get("category");
const requestedType = new URLSearchParams(window.location.search).get("type");
const rentalPageType = document.body.dataset.rentalType || "car";
let currentFilters = {
  type: requestedType || "all",
  category: requestedCategory || "all",
  seats: "all",
  search: "",
  sort: rentalPageType === "two-wheeler" ? "recommended" : "",
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
  renderListings();
  function refreshRentalInventory() {
    return loadRentalInventory().then(function (vehicles) {
      allVehicles = prepareRentalCards(visibleVehicles(vehicles));
      renderVehicleFilters();
      renderListings();
    });
  }
  refreshRentalInventory();
  watchCatalogUpdates(refreshRentalInventory, 60000);
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
  const seatsSelect = document.getElementById("vehicleSeatsFilter");
  if (seatsSelect) {
    seatsSelect.addEventListener("change", function (event) {
      currentFilters.seats = event.target.value;
      renderListings();
    });
  }

  const categorySelect = document.getElementById("vehicleCategoryFilter");
  if (categorySelect) {
    categorySelect.addEventListener("change", function (event) {
      currentFilters.category = event.target.value;
      renderListings();
    });
  }

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
      currentFilters = {
        category: "all",
        seats: "all",
        search: "",
        sort: rentalPageType === "two-wheeler" ? "recommended" : "",
        availableOnly: false
      };
      currentFilters.type = "all";
      renderVehicleFilters();
      if (searchInput) searchInput.value = "";
      if (sortSel) sortSel.value = currentFilters.sort;
      if (seatsSelect) seatsSelect.value = "all";
      if (categorySelect) categorySelect.value = "all";
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
  const seatsSelect = document.getElementById("vehicleSeatsFilter");
  const categorySelect = document.getElementById("vehicleCategoryFilter");
  if (seatsSelect && categorySelect) {
    renderSeatAndTypeFilters(seatsSelect, categorySelect);
    return;
  }

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

function renderSeatAndTypeFilters(seatsSelect, categorySelect) {
  const seats = Array.from(new Set(allVehicles.flatMap(function (vehicle) {
    return passengerSeats(vehicle);
  }))).sort(function (a, b) { return a - b; });
  const categories = Array.from(new Set(allVehicles
    .map(function (vehicle) { return vehicle.category || "other"; })));

  const hasEightPlusSeats = seats.some(function (seat) { return seat >= 8; });
  if ((!seats.some(function (seat) { return seat.toString() === currentFilters.seats; }) &&
    currentFilters.seats !== "8+") || (currentFilters.seats === "8+" && !hasEightPlusSeats)) {
    currentFilters.seats = "all";
  }
  if (!categories.includes(currentFilters.category)) currentFilters.category = "all";

  const seatOptions = seats.reduce(function (options, seat) {
    if (seat >= 8) {
      if (!options.some(function (option) { return option.value === "8+"; })) {
        options.push({ value: "8+", label: "8+ Seater" });
      }
    } else {
      options.push({ value: seat.toString(), label: seat + " Seater" });
    }
    return options;
  }, []);

  seatsSelect.innerHTML = [
    '<option value="all">Seats</option>',
    ...seatOptions.map(function (option) {
      return `<option value="${esc(option.value)}">${esc(option.label)}</option>`;
    })
  ].join("");
  seatsSelect.value = currentFilters.seats;

  categorySelect.innerHTML = [
    '<option value="all">Type</option>',
    ...categories.map(function (category) {
      return `<option value="${esc(category)}">${esc(vehicleCategoryLabel(category))}</option>`;
    })
  ].join("");
  categorySelect.value = currentFilters.category;
}

function passengerSeats(vehicle) {
  const passengers = vehicle.passengers;
  if (Number.isInteger(passengers) && passengers > 0) return [passengers];
  if (typeof passengers === "string" && /^\d+(?:\s*\/\s*\d+)+$/.test(passengers)) {
    return passengers.split("/").map(function (seat) { return Number(seat.trim()); });
  }
  return [];
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

function applyFilters(items, filters) {
  let list = items.slice();

  /* Vehicle type */
  if (filters.type && filters.type !== "all") {
    list = list.filter(function (v) { return vehicleType(v) === filters.type; });
  }

  /* Passenger capacity */
  if (filters.seats && filters.seats !== "all") {
    list = list.filter(function (vehicle) {
      return passengerSeats(vehicle).some(function (seat) {
        return filters.seats === "8+" ? seat >= 8 : seat.toString() === filters.seats;
      });
    });
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
