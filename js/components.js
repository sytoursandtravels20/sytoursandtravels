/* Shared layout, card rendering, catalog loading, and formatting helpers. */

async function loadComponent(targetId, path) {
  const el = document.getElementById(targetId);
  if (!el) return;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error("HTTP " + res.status);
    el.innerHTML = await res.text();
    el.querySelectorAll("script").forEach(function (old) {
      const s = document.createElement("script");
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
  } catch (err) {
    console.error("Failed to load", path, err);
    el.innerHTML =
      '<p style="padding:1rem;text-align:center;color:#b00;background:#fff">' +
      "Could not load " + path +
      ". Please open the site with a local web server.</p>";
  }
}

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtPrice(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

function waLink(message) {
  return "https://wa.me/" + CONFIG.company.phoneRaw + "?text=" + encodeURIComponent(message);
}

/* Keep desktop and mobile navigation states in sync with the current page. */
function markActiveNav() {
  const page = (document.body.dataset.page || "home").trim();
  document.querySelectorAll("[data-page]").forEach(function (el) {
    el.classList.toggle("active", el.dataset.page === page);
  });
}

/* Sets the header call button from the editable company phone number. */
function setHeaderPhoneLink() {
  const link = document.getElementById("headerPhone");
  if (link) link.href = "tel:+" + CONFIG.company.phoneRaw;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || "";
}

function setBrandLogo(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.innerHTML = CONFIG.logo.logoUrl
    ? `<img src="${esc(CONFIG.logo.logoUrl)}" alt="${esc(CONFIG.company.name)}">`
    : `<i class="bi ${esc(CONFIG.logo.logoIcon)}"></i>`;
}

function initHeaderShadow() {
  const nav = document.getElementById("syNav");
  if (!nav) return;
  function update() { nav.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function categoryCard(c) {
  return `
    <a class="category-card" href="${esc(c.href || "#")}">
      <span class="category-img"><img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy" decoding="async"></span>
      <p class="category-name">${esc(c.name)}</p>
      <p class="category-desc">${esc(c.desc)}</p>
    </a>`;
}

function vehicleCard(v) {
  /* Availability state */
  const isBooked = v.status === "booked";
  const until = v.bookedUntil ? " · Available from " + esc(v.bookedUntil) : "";
  const rates = v.rates && v.rates.length
    ? v.rates
    : (typeof v.price === "number" ? [{ transmission: v.transmission, price: v.price }] : []);
  const rateLabels = rates.length
    ? rates.map(function (rate) {
      return `<span class="sy-price-value">\u20B9${fmtPrice(rate.price)}${rate.transmission ? " " + esc(rate.transmission) : ""}</span>`;
    }).join("")
    : '<span class="sy-price-value">Price on request</span>';
  const hasSampleRate = rates.some(function (rate) { return rate.sample; });
  const transmissionLabel = rates.length
    ? rates.map(function (rate) { return rate.transmission; }).filter(Boolean).join(" / ")
    : "";

  /* Build the enquiry text from the same rates shown on the card. */
  const waMsg =
    "Hi " + CONFIG.company.name + ", I'm interested in renting the " +
    v.name + (transmissionLabel ? " (" + transmissionLabel + ")" : "") +
    (rates.length ? " at " + (hasSampleRate ? "the sample rate of " : "") + rates.map(function (rate) {
      return "\u20B9" + fmtPrice(rate.price) + (rate.transmission ? " " + rate.transmission : "");
    }).join(" / ") + " per day" : " and would like to know the rate") +
    ". Kindly share availability. Thank you.";

  /* Badge: prefer existing badge when available, else show Booked */
  let badge = "";
  if (isBooked) {
    badge = `<span class="sy-badge sy-badge--booked">Booked</span>`;
  } else if (v.badge) {
    badge = `<span class="sy-badge">${esc(v.badge)}</span>`;
  }

  /* Footer action: WhatsApp button if available, disabled pill if booked */
  const action = isBooked
    ? `<span class="btn-book is-disabled" aria-disabled="true">Unavailable</span>`
    : `<a class="btn-book" href="${waLink(waMsg)}" target="_blank" rel="noopener">Book Now</a>`;

  /* Optional "available from" hint under the price */
  const hint = isBooked && v.bookedUntil
    ? `<span class="sy-price-hint">${esc(until).replace(/^ · /, "")}</span>`
    : "";
  const passengerSpec = (Number.isInteger(v.passengers) && v.passengers > 0) ||
    (typeof v.passengers === "string" && /^\d+(?:\s*\/\s*\d+)+$/.test(v.passengers))
    ? `<li><i class="bi bi-people-fill"></i> ${esc(v.passengers)} passengers</li>`
    : "";
  const quantitySpec = Number.isInteger(v.quantity) && v.quantity > 1
    ? `<li><i class="bi bi-car-front"></i> ${v.quantity} units</li>`
    : "";
  const vehicleImage = v.image
    ? `<img src="${esc(v.image)}" alt="${esc(v.name)}" loading="lazy" decoding="async">`
    : "";

  return `
    <article class="sy-card${isBooked ? " is-booked" : ""}">
      <div class="sy-card-media">
        ${vehicleImage}
        ${badge}
      </div>
      <div class="sy-card-body">
        <h3 class="sy-card-title">${esc(v.name)}</h3>
        <ul class="sy-specs">
          <li><i class="bi bi-grid"></i> ${esc(vehicleCategoryLabel(v.category, v.categoryLabel))}</li>
          ${quantitySpec}
          ${passengerSpec}
        </ul>
        <div class="sy-card-foot">
          <div class="sy-price">
            ${rateLabels}
            ${rates.length ? `<span class="sy-price-unit">${hasSampleRate ? "sample rate · " : ""}per day</span>` : ""}
            ${hint}
          </div>
          ${action}
        </div>
      </div>
    </article>`;
}

function vehicleCategoryLabel(category, label) {
  return label || (category || "car").split(/[-_\s]+/).map(function (part) {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(" ");
}

function activityCard(a) {
  const waMsg =
    "Hi " + CONFIG.company.name + ", I'm interested in the " + a.name +
    " experience (" + a.meta + ") at \u20B9" + fmtPrice(a.price) + " " + a.unit +
    ". Kindly share availability. Thank you.";
  const category = a.categoryLabel || catalogLabel(a.category);
  return `
    <article class="sy-card">
      <div class="sy-card-media"><img src="${esc(a.image)}" alt="${esc(a.name)}" loading="lazy" decoding="async"></div>
      <div class="sy-card-body">
        <h3 class="sy-card-title">${esc(a.name)}</h3>
        ${category ? `<span class="catalog-category">${esc(category)}</span>` : ""}
        <p style="color:var(--sy-muted); font-size:.78rem; margin:0 0 .85rem;">
          <i class="bi bi-info-circle" style="color:var(--sy-blue)"></i> ${esc(a.meta)}
        </p>
        <div class="sy-card-foot">
          <div class="sy-price">
            <span class="sy-price-value">\u20B9${fmtPrice(a.price)}</span>
            <span class="sy-price-unit">${esc(a.unit)}</span>
          </div>
          <a class="btn-book" href="${waLink(waMsg)}" target="_blank" rel="noopener">Book Now</a>
        </div>
      </div>
    </article>`;
}

function waterCard(item, kind) {
  const typeLabel = item.typeLabel || catalogLabel(kind);
  const category = item.categoryLabel || catalogLabel(item.category);
  const waMsg =
    "Hi " + CONFIG.company.name + ", I'm interested in the " + item.name +
    " (" + typeLabel + (category ? ", " + category : "") + ", " + item.meta + ") at \u20B9" + fmtPrice(item.price) +
    " " + item.unit + ". Kindly share availability. Thank you.";
  return `
    <article class="sy-card">
      <div class="sy-card-media">
        <img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy" decoding="async">
        ${item.badge ? `<span class="sy-badge">${esc(item.badge)}</span>` : ""}
      </div>
      <div class="sy-card-body">
        <h3 class="sy-card-title">${esc(item.name)}</h3>
        <span class="catalog-category">${esc(typeLabel)}${category ? " · " + esc(category) : ""}</span>
        <p style="color:var(--sy-muted); font-size:.78rem; margin:0 0 .85rem;">
          <i class="bi bi-info-circle" style="color:var(--sy-blue)"></i> ${esc(item.meta)}
        </p>
        <div class="sy-card-foot">
          <div class="sy-price">
            <span class="sy-price-value">\u20B9${fmtPrice(item.price)}</span>
            <span class="sy-price-unit">${esc(item.unit)}</span>
          </div>
          <a class="btn-book" href="${waLink(waMsg)}" target="_blank" rel="noopener">Book Now</a>
        </div>
      </div>
    </article>`;
}

function catalogLabel(value) {
  return (value || "").split(/[-_\s]+/).filter(Boolean).map(function (part) {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(" ");
}

function whyItem(w) {
  return `
    <div class="why-item">
      <span class="why-icon"><i class="bi ${esc(w.icon)}"></i></span>
      <div>
        <h4 class="why-title">${esc(w.title)}</h4>
        <p class="why-text">${esc(w.text)}</p>
      </div>
    </div>`;
}

function howItem(step, index) {
  return `
    <div class="how-item">
      <span class="how-num"><i class="bi ${esc(step.icon)}"></i></span>
      <h4 class="how-title">${index + 1}. ${esc(step.title)}</h4>
      <p class="how-text">${esc(step.text)}</p>
    </div>`;
}

/* ============================================================
   AVAILABILITY HELPER
   Filters out "hidden" vehicles everywhere.
   Booked vehicles stay visible (they get a Booked badge).
   ============================================================ */
function visibleVehicles(list) {
  return (list || []).filter(function (v) {
    return v.status !== "hidden";
  });
}

async function loadRentalInventory() {
  const label = "rental inventory";
  const fallback = getCachedCatalog(CONFIG.rentalInventoryCsvUrl, parseRentalInventoryCsv, LOCAL_DATA.vehicles, label);
  return loadCatalogCsv(CONFIG.rentalInventoryCsvUrl, parseRentalInventoryCsv, fallback, label);
}

async function loadActivities() {
  const label = "activities";
  const fallback = getCachedCatalog(CONFIG.activitiesCsvUrl, parseActivitiesCsv, LOCAL_DATA.activities, label);
  return loadCatalogCsv(CONFIG.activitiesCsvUrl, parseActivitiesCsv, fallback, label);
}

async function loadWaterTrips() {
  const label = "water trips";
  const fallback = getCachedCatalog(CONFIG.waterTripsCsvUrl, parseWaterTripsCsv, getLocalWaterTrips(), label);
  return loadCatalogCsv(CONFIG.waterTripsCsvUrl, parseWaterTripsCsv, fallback, label);
}

async function loadCatalogCsv(url, parse, fallback, label) {
  if (!url) return fallback;
  const controller = new AbortController();
  // Keep background refreshes bounded so a stalled sheet never blocks page interaction.
  const timeout = setTimeout(function () { controller.abort(); }, 8000);
  try {
    const requestUrl = new URL(url);
    requestUrl.searchParams.set("_sy_refresh", Date.now().toString());
    const response = await fetch(requestUrl.toString(), {
      cache: "no-store",
      signal: controller.signal
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const csv = await response.text();
    const data = parse(csv);
    cacheCatalogCsv(url, csv, label);
    console.info("[SY] Loaded " + label + " from Google Sheets.");
    return data;
  } catch (error) {
    console.warn("[SY] Google Sheets " + label + " unavailable; keeping local data.", error);
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

// Render cached CSV data immediately; the network request refreshes it separately.
function getCachedCatalog(url, parse, fallback, label) {
  if (!url) return fallback;
  try {
    const csv = localStorage.getItem(catalogCacheKey(url));
    return csv ? parse(csv) : fallback;
  } catch (error) {
    console.warn("[SY] Could not read cached " + label + ".", error);
    return fallback;
  }
}

function loadLegalPolicy(url, contentElement, updatedElement) {
  if (!contentElement || !updatedElement) return;
  const originalContent = contentElement.innerHTML;
  const fallback = {
    sections: parseLegalPolicyHtml(originalContent),
    lastUpdated: updatedElement.textContent.replace(/^Last updated:\s*/i, "").trim()
  };
  const cached = getCachedCatalog(url, parseLegalPolicyCsv, fallback, "legal policy");
  renderLegalPolicy(contentElement, updatedElement, cached);
  loadCatalogCsv(url, parseLegalPolicyCsv, fallback, "legal policy").then(function (policy) {
    renderLegalPolicy(contentElement, updatedElement, policy);
  });
}

// Preserve the static policy as the offline fallback without keeping duplicate markup.
function parseLegalPolicyHtml(html) {
  const temporary = document.createElement("div");
  temporary.innerHTML = html;
  const sections = [];
  let heading = "";
  Array.from(temporary.children).forEach(function (element) {
    if (element.tagName === "H2") {
      heading = element.textContent.trim();
    } else if (element.tagName === "P" && element.textContent.trim()) {
      sections.push({ heading: heading, content: element.textContent.trim() });
      heading = "";
    }
  });
  return sections;
}

function parseLegalPolicyCsv(csv) {
  const rows = parseCsvRows(csv);
  const columns = csvColumnIndexes(rows, ["heading", "content"], "legal policy");
  let lastUpdated = "";
  const sections = csvDataRows(rows, "legal policy").reduce(function (result, row, index) {
    const heading = (row[columns.heading] || "").trim();
    const content = (row[columns.content] || "").trim();
    if (!heading || !content) {
      throw new Error("Legal policy row " + (index + 2) + " needs both a heading and content.");
    }
    if (heading.toLowerCase() === "last updated") {
      lastUpdated = content;
      return result;
    }
    result.push({ heading: heading, content: content });
    return result;
  }, []);
  if (!sections.length) throw new Error("Legal policy CSV has no policy sections.");
  return { sections: sections, lastUpdated: lastUpdated };
}

function renderLegalPolicy(container, updatedElement, policy) {
  const fragment = document.createDocumentFragment();
  policy.sections.forEach(function (section) {
    if (section.heading) {
      const heading = document.createElement("h2");
      heading.textContent = section.heading;
      fragment.appendChild(heading);
    }
    const paragraph = document.createElement("p");
    appendPolicyText(paragraph, section.content);
    fragment.appendChild(paragraph);
  });
  container.replaceChildren(fragment);
  if (policy.lastUpdated) updatedElement.textContent = "Last updated: " + policy.lastUpdated;
}

// Policy text is plain text; link only email addresses rather than interpreting HTML.
function appendPolicyText(paragraph, content) {
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
  let lastIndex = 0;
  let match;
  while ((match = emailPattern.exec(content))) {
    paragraph.appendChild(document.createTextNode(content.slice(lastIndex, match.index)));
    const link = document.createElement("a");
    link.href = "mailto:" + match[0];
    link.textContent = match[0];
    paragraph.appendChild(link);
    lastIndex = match.index + match[0].length;
  }
  paragraph.appendChild(document.createTextNode(content.slice(lastIndex)));
}

function cacheCatalogCsv(url, csv, label) {
  try {
    localStorage.setItem(catalogCacheKey(url), csv);
  } catch (error) {
    console.warn("[SY] Could not cache " + label + ".", error);
  }
}

function catalogCacheKey(url) {
  return "sy-catalog-csv-v1:" + url;
}

function parseRentalInventoryCsv(csv) {
  const rows = parseCsvRows(csv);
  const columnIndexes = csvColumnIndexes(
    rows,
    ["name", "category", "manualprice", "automaticprice", "passengers", "status"],
    "rental inventory"
  );
  const headers = rows[0].map(function (header) { return header.trim().toLowerCase(); });
  columnIndexes.type = headers.indexOf("type");
  columnIndexes.typelabel = headers.indexOf("typelabel");
  columnIndexes.categorylabel = headers.indexOf("categorylabel");
  columnIndexes.image = headers.indexOf("image");
  columnIndexes.quantity = headers.indexOf("quantity");

  const localByName = new Map(LOCAL_DATA.vehicles.map(function (vehicle) {
    return [vehicle.name.trim().toLowerCase(), vehicle];
  }));
  const vehicles = csvDataRows(rows, "rental inventory").map(function (row, index) {
    const get = function (header) {
      return (row[columnIndexes[header]] || "").trim();
    };
    const name = get("name");
    const sheetCategory = get("category").toLowerCase();
    const status = get("status").toLowerCase() || "available";
    const passengerValue = get("passengers");
    const passengers = /^\d+$/.test(passengerValue) ? Number(passengerValue) : passengerValue;
    const quantityValue = get("quantity");
    const quantity = quantityValue ? Number(quantityValue) : 1;
    const manualPrice = get("manualprice")
      ? parseCatalogPrice(get("manualprice"), index + 2, "Manual")
      : null;
    const automaticPrice = get("automaticprice")
      ? parseCatalogPrice(get("automaticprice"), index + 2, "Automatic")
      : null;
    const local = localByName.get(name.toLowerCase());
    const listedType = get("type").toLowerCase();
    const categoryIsVehicleType = ["car", "bike", "scooty", "scooter"].includes(sheetCategory);
    const type = listedType || (categoryIsVehicleType ? sheetCategory : (local && local.type) || "car");
    const category = categoryIsVehicleType
      ? (local && local.category) || "other"
      : sheetCategory || (local && local.category) || "other";
    const typeLabel = get("typelabel") || (local && local.typeLabel) || "";
    const categoryLabel = get("categorylabel") || (local && local.categoryLabel) || "";
    const image = get("image") || (local && local.image) || "";

    if (!name) throw new Error("Inventory row " + (index + 2) + " has no vehicle name.");
    if (!(Number.isInteger(passengers) && passengers > 0) &&
      !(typeof passengers === "string" && /^\d+(?:\s*\/\s*\d+)+$/.test(passengers))) {
      throw new Error("Inventory row " + (index + 2) + " has an invalid passenger count.");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Inventory row " + (index + 2) + " has an invalid quantity.");
    }
    if (!manualPrice && !automaticPrice) {
      throw new Error("Inventory row " + (index + 2) + " has no valid price.");
    }
    if (!["available", "booked", "hidden"].includes(status)) {
      throw new Error("Inventory row " + (index + 2) + " has an invalid status.");
    }

    const rates = [];
    if (manualPrice) rates.push({ transmission: "Manual", price: manualPrice });
    if (automaticPrice) rates.push({ transmission: "Automatic", price: automaticPrice });
    return {
      type: type,
      typeLabel: typeLabel,
      category: category,
      categoryLabel: categoryLabel,
      name: name,
      passengers: passengers,
      quantity: quantity,
      rates: rates,
      featured: Boolean(local && local.featured),
      status: status,
      bookedUntil: local ? local.bookedUntil : "",
      image: image
    };
  });

  return vehicles;
}

function parseActivitiesCsv(csv) {
  const rows = parseCsvRows(csv);
  const columns = csvColumnIndexes(rows, ["name", "meta", "price", "unit", "image"], "activities");
  const headers = rows[0].map(function (header) { return header.trim().toLowerCase(); });
  columns.type = headers.indexOf("type");
  columns.typelabel = headers.indexOf("typelabel");
  columns.category = headers.indexOf("category");
  columns.categorylabel = headers.indexOf("categorylabel");
  const localByName = new Map(LOCAL_DATA.activities.map(function (activity) {
    return [activity.name.trim().toLowerCase(), activity];
  }));
  return csvDataRows(rows, "activities").map(function (row, index) {
    const get = function (header) { return (row[columns[header]] || "").trim(); };
    const name = get("name");
    const local = localByName.get(name.toLowerCase());
    const activity = {
      name: name,
      type: get("type") || (local && local.type) || "activity",
      typeLabel: get("typelabel") || (local && local.typeLabel) || "",
      category: get("category") || (local && local.category) || "activity",
      categoryLabel: get("categorylabel") || (local && local.categoryLabel) || "",
      meta: get("meta"),
      price: parseCatalogPrice(get("price"), index + 2),
      unit: get("unit"),
      image: get("image") || (local && local.image)
    };
    if (!activity.name || !activity.meta || !activity.unit || !activity.image) {
      throw new Error("Activities row " + (index + 2) + " is missing required information.");
    }
    return activity;
  });
}

function parseWaterTripsCsv(csv) {
  const rows = parseCsvRows(csv);
  const columns = csvColumnIndexes(rows, ["name", "type", "meta", "price", "unit", "badge", "image"], "water trips");
  const headers = rows[0].map(function (header) { return header.trim().toLowerCase(); });
  columns.typelabel = headers.indexOf("typelabel");
  columns.category = headers.indexOf("category");
  columns.categorylabel = headers.indexOf("categorylabel");
  const localByName = new Map(getLocalWaterTrips().map(function (trip) {
    return [trip.name.trim().toLowerCase(), trip];
  }));
  return csvDataRows(rows, "water trips").map(function (row, index) {
    const get = function (header) { return (row[columns[header]] || "").trim(); };
    const name = get("name");
    const kind = get("type");
    const local = localByName.get(name.toLowerCase());
    const trip = {
      name: name,
      type: kind,
      typeLabel: get("typelabel") || (local && local.typeLabel) || "",
      category: get("category") || (local && local.category) || "",
      categoryLabel: get("categorylabel") || (local && local.categoryLabel) || "",
      meta: get("meta"),
      price: parseCatalogPrice(get("price"), index + 2),
      unit: get("unit"),
      badge: get("badge"),
      image: get("image") || (local && local.image)
    };
    if (!trip.name || !trip.type || !trip.meta || !trip.unit || !trip.image) {
      throw new Error("WaterTrips row " + (index + 2) + " is missing required information.");
    }
    return trip;
  });
}

function csvColumnIndexes(rows, requiredHeaders, label) {
  if (rows.length < 2) throw new Error("Google Sheets " + label + " CSV has no data rows.");
  const headers = rows[0].map(function (header) { return header.trim().toLowerCase(); });
  const columns = {};
  requiredHeaders.forEach(function (header) {
    const index = headers.indexOf(header);
    if (index === -1) throw new Error("Google Sheets " + label + " CSV is missing the " + header + " column.");
    columns[header] = index;
  });
  return columns;
}

function csvDataRows(rows, label) {
  const dataRows = rows.slice(1).filter(function (row) {
    return row.some(function (cell) { return cell.trim(); });
  });
  if (!dataRows.length) throw new Error("Google Sheets " + label + " CSV has no usable rows.");
  return dataRows;
}

function parseCatalogPrice(value, rowNumber, label) {
  const price = Number(value.replace(/[₹,\s]/g, ""));
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Catalog row " + rowNumber + " has an invalid " + (label || "catalog") + " price.");
  }
  return price;
}

function getLocalWaterTrips() {
  // Normalize the legacy per-type arrays to the combined sheet's { type, ...item } shape.
  return []
    .concat(LOCAL_DATA.yachts.map(function (item) { return Object.assign({ type: "Yacht" }, item); }))
    .concat(LOCAL_DATA.boats.map(function (item) { return Object.assign({ type: "Boat" }, item); }))
    .concat(LOCAL_DATA.cruises.map(function (item) { return Object.assign({ type: "Cruise" }, item); }));
}

function parseCsvRows(csv) {
  // Handle quoted commas, escaped quotes, and line breaks in published sheet cells.
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const text = csv.replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"' && cell === "") {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (quoted) throw new Error("Inventory CSV contains an unterminated quoted field.");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}