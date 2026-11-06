/* ============================================================
   rentals.js — logic for rentals/index.html.
   Loads header/footer, applies CONFIG, loads data, manages
   filters (seats / type / sort on cars; legacy filters on two-wheelers).
   ============================================================ */

let allVehicles = [];
const RENTALS_PER_PAGE = 19;
let currentRentalPage = 1;
const requestedCategory = new URLSearchParams(window.location.search).get("category");
const requestedType = new URLSearchParams(window.location.search).get("type");
const rentalPageType = document.body.dataset.rentalType || "car";
let currentFilters = {
  type: requestedType || "all",
  category: requestedCategory || "all",
  seats: "all",
  transmission: "all",
  search: "",
  sort: ""
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
  initRentalPriceInfo();
  renderListings();
  function refreshRentalInventory() {
    return loadRentalInventory().then(function (vehicles) {
      allVehicles = prepareRentalCards(visibleVehicles(vehicles));
      renderVehicleFilters();
      renderListings(false);
    });
  }
  refreshRentalInventory();
  watchCatalogUpdates(refreshRentalInventory, 30000);
  await componentsReady;
  applyConfig();
  applySharedConfig();
  setHeaderContactLinks();
  markActiveNav();
  initHeaderShadow();
});

function initRentalPriceInfo() {
  const rentalGrid = document.getElementById("rentalGrid");
  if (!rentalGrid) return;

  function positionPopover(details) {
    const summary = details.querySelector("summary");
    const popover = details.querySelector("p");
    if (!summary || !popover) return;

    details.classList.add("is-positioned");
    popover.style.left = "0px";
    popover.style.top = "0px";

    const anchor = summary.getBoundingClientRect();
    const bounds = popover.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(margin, Math.min(
      anchor.left + (anchor.width - bounds.width) / 2,
      document.documentElement.clientWidth - bounds.width - margin
    ));
    const top = anchor.top - bounds.height - margin >= margin
      ? anchor.top - bounds.height - margin
      : Math.min(anchor.bottom + margin, window.innerHeight - bounds.height - margin);

    popover.style.left = left + "px";
    popover.style.top = Math.max(margin, top) + "px";
  }

  rentalGrid.addEventListener("toggle", function (event) {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.matches(".rental-price-info")) return;

    if (details.open) {
      rentalGrid.querySelectorAll(".rental-price-info[open]").forEach(function (otherDetails) {
        if (otherDetails !== details) otherDetails.open = false;
      });
      requestAnimationFrame(function () { positionPopover(details); });
    } else {
      details.classList.remove("is-positioned");
    }
  }, true);

  document.addEventListener("pointerdown", function (event) {
    const openDetails = rentalGrid.querySelector(".rental-price-info[open]");
    if (openDetails && !openDetails.contains(event.target)) openDetails.open = false;
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      const openDetails = rentalGrid.querySelector(".rental-price-info[open]");
      if (openDetails) openDetails.open = false;
    }
  });

  function repositionOpenPopover() {
    const openDetails = rentalGrid.querySelector(".rental-price-info[open]");
    if (openDetails) positionPopover(openDetails);
  }

  window.addEventListener("resize", repositionOpenPopover);
  window.addEventListener("scroll", repositionOpenPopover, true);
}

/* ============================================================
   FILTER WIRING
   ============================================================ */
function initFilters() {
  const pagination = document.getElementById("rentalPagination");
  if (pagination) {
    pagination.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-page]");
      if (!button || !pagination.contains(button) || button.disabled) return;
      currentRentalPage = Number(button.dataset.page);
      renderListings(false);

      const resultsCount = document.getElementById("resultsCount");
      if (resultsCount) {
        const filterBar = document.getElementById("filterBar");
        const stickyOffset = filterBar ? filterBar.getBoundingClientRect().bottom : 0;
        window.scrollBy({
          top: resultsCount.getBoundingClientRect().top - stickyOffset - 12,
          behavior: "smooth"
        });
      }
    });
  }

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
      if (rentalPageType === "two-wheeler") renderVehicleFilters();
      renderListings();
    });
  }

  const typeSelect = document.getElementById("vehicleTypeFilter");
  if (typeSelect) {
    typeSelect.addEventListener("change", function (event) {
      currentFilters.type = event.target.value;
      currentFilters.category = "all";
      currentFilters.transmission = "all";
      renderVehicleFilters();
      renderListings();
    });
  }

  const transmissionSelect = document.getElementById("vehicleTransmissionFilter");
  if (transmissionSelect) {
    transmissionSelect.addEventListener("change", function (event) {
      currentFilters.transmission = event.target.value;
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

  /* Clear filters button */
  const clearBtn = document.getElementById("clearFilters");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      currentFilters = {
        category: "all",
        seats: "all",
        transmission: "all",
        search: "",
        sort: ""
      };
      currentFilters.type = "all";
      renderVehicleFilters();
      if (searchInput) searchInput.value = "";
      if (sortSel) sortSel.value = currentFilters.sort;
      if (seatsSelect) seatsSelect.value = "all";
      if (typeSelect) typeSelect.value = "all";
      if (categorySelect) categorySelect.value = "all";
      if (transmissionSelect) transmissionSelect.value = "all";
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
  if (rentalPageType === "two-wheeler") {
    renderTwoWheelerFilters();
    return;
  }

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

function renderTwoWheelerFilters() {
  const typeSelect = document.getElementById("vehicleTypeFilter");
  const categorySelect = document.getElementById("vehicleCategoryFilter");
  const transmissionSelect = document.getElementById("vehicleTransmissionFilter");
  if (!typeSelect || !categorySelect || !transmissionSelect) return;

  const types = Array.from(new Set(allVehicles.map(vehicleType)));
  if (currentFilters.type !== "all" && !types.includes(currentFilters.type)) {
    currentFilters.type = "all";
  }
  const typeVehicles = currentFilters.type === "all"
    ? allVehicles
    : allVehicles.filter(function (vehicle) { return vehicleType(vehicle) === currentFilters.type; });
  const categories = Array.from(new Set(typeVehicles.map(function (vehicle) {
    return vehicle.category || "other";
  })));
  if (currentFilters.category !== "all" && !categories.includes(currentFilters.category)) {
    currentFilters.category = "all";
  }

  const categoryVehicles = currentFilters.category === "all"
    ? typeVehicles
    : typeVehicles.filter(function (vehicle) {
      return (vehicle.category || "other") === currentFilters.category;
    });
  const transmissions = Array.from(new Set(categoryVehicles.map(function (vehicle) {
    return vehicle.transmission || "Standard";
  }))).sort(function (a, b) { return a.localeCompare(b); });
  if (currentFilters.transmission !== "all" && !transmissions.includes(currentFilters.transmission)) {
    currentFilters.transmission = "all";
  }

  typeSelect.innerHTML = [
    `<option value="all">${esc(formatText("All vehicle types"))}</option>`,
    ...types.map(function (type) {
      return `<option value="${esc(type)}">${esc(catalogTypeLabel(type))}</option>`;
    })
  ].join("");
  typeSelect.value = currentFilters.type;

  categorySelect.innerHTML = [
    `<option value="all">${esc(formatText(categories.length > 1 ? "All categories" : "All"))}</option>`,
    ...categories.map(function (category) {
      const sample = typeVehicles.find(function (vehicle) {
        return (vehicle.category || "other") === category;
      });
      return `<option value="${esc(category)}">${esc(vehicleCategoryLabel(category, sample && sample.categoryLabel))}</option>`;
    })
  ].join("");
  categorySelect.value = currentFilters.category;

  transmissionSelect.innerHTML = [
    `<option value="all">${esc(formatText("All Transmissions"))}</option>`,
    ...transmissions.map(function (transmission) {
      return `<option value="${esc(transmission)}">${esc(transmission)}</option>`;
    })
  ].join("");
  transmissionSelect.value = currentFilters.transmission;
}

function renderSeatAndTypeFilters(seatsSelect, categorySelect) {
  const seats = Array.from(new Set(allVehicles.flatMap(function (vehicle) {
    return passengerSeats(vehicle);
  }))).sort(function (a, b) { return a - b; });
  const categories = Array.from(new Set(allVehicles
    .map(function (vehicle) { return vehicle.category || "other"; })));
  const transmissionSelect = document.getElementById("vehicleTransmissionFilter");
  const transmissions = Array.from(new Set(allVehicles
    .map(function (vehicle) { return vehicle.transmission || "Standard"; })))
    .sort(function (a, b) { return a.localeCompare(b); });

  if (currentFilters.seats !== "all" &&
    !seats.some(function (seat) { return seat.toString() === currentFilters.seats; })) {
    currentFilters.seats = "all";
  }
  if (!categories.includes(currentFilters.category)) currentFilters.category = "all";

  const seatOptions = seats.map(function (seat) {
    return { value: seat.toString(), label: seat + " Seater" };
  });

  seatsSelect.innerHTML = [
    '<option value="all">All Seats</option>',
    ...seatOptions.map(function (option) {
      return `<option value="${esc(option.value)}">${esc(option.label)}</option>`;
    })
  ].join("");
  seatsSelect.value = currentFilters.seats;

  categorySelect.innerHTML = [
    '<option value="all">All Types</option>',
    ...categories.map(function (category) {
      return `<option value="${esc(category)}">${esc(vehicleCategoryLabel(category))}</option>`;
    })
  ].join("");
  categorySelect.value = currentFilters.category;

  if (transmissionSelect) {
    if (!transmissions.includes(currentFilters.transmission)) currentFilters.transmission = "all";
    transmissionSelect.innerHTML = [
      '<option value="all">All Transmissions</option>',
      ...transmissions.map(function (transmission) {
        return `<option value="${esc(transmission)}">${esc(transmission)}</option>`;
      })
    ].join("");
    transmissionSelect.value = currentFilters.transmission;
  }
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
function renderListings(resetPage) {
  const list = applyFilters(allVehicles, currentFilters);
  const grid = document.getElementById("rentalGrid");
  const count = document.getElementById("resultsCount");
  const empty = document.getElementById("emptyState");
  const pagination = document.getElementById("rentalPagination");

  if (!grid) return;

  if (resetPage !== false) currentRentalPage = 1;

  if (list.length === 0) {
    grid.innerHTML = "";
    if (empty) empty.hidden = false;
    if (count) count.textContent = "";
    if (pagination) {
      pagination.hidden = true;
      pagination.innerHTML = "";
    }
    return;
  }

  const pageCount = Math.ceil(list.length / RENTALS_PER_PAGE);
  currentRentalPage = Math.min(currentRentalPage, pageCount);
  const start = (currentRentalPage - 1) * RENTALS_PER_PAGE;
  const pageVehicles = list.slice(start, start + RENTALS_PER_PAGE);

  if (empty) empty.hidden = true;
  grid.innerHTML = pageVehicles.map(function (vehicle) {
    return vehicleCard(vehicle, allVehicles.indexOf(vehicle));
  }).join("");
  if (count) {
    count.textContent = formatText("Showing {start}-{end} of {total} vehicles", {
      start: String(start + 1),
      end: String(start + pageVehicles.length),
      total: String(list.length)
    });
  }
  if (pagination) {
    pagination.hidden = pageCount < 2;
    pagination.innerHTML = pageCount < 2 ? "" : [
      `<button class="rental-page-button" type="button" data-page="${currentRentalPage - 1}" aria-label="${esc(formatText("Previous page"))}"${currentRentalPage === 1 ? " disabled" : ""}>${esc(formatText("Previous"))}</button>`,
      ...Array.from({ length: pageCount }, function (_, index) {
        const page = index + 1;
        return `<button class="rental-page-button${page === currentRentalPage ? " is-active" : ""}" type="button" data-page="${page}" aria-label="${esc(formatText("Page {page}", { page: String(page) }))}"${page === currentRentalPage ? ' aria-current="page"' : ""}>${page}</button>`;
      }),
      `<button class="rental-page-button" type="button" data-page="${currentRentalPage + 1}" aria-label="${esc(formatText("Next page"))}"${currentRentalPage === pageCount ? " disabled" : ""}>${esc(formatText("Next"))}</button>`
    ].join("");
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
        return seat.toString() === filters.seats;
      });
    });
  }

  /* Category */
  if (filters.category && filters.category !== "all") {
    list = list.filter(function (v) { return (v.category || "other") === filters.category; });
  }

  /* Transmission */
  if (filters.transmission && filters.transmission !== "all") {
    list = list.filter(function (vehicle) {
      return (vehicle.transmission || "Standard") === filters.transmission;
    });
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
