/* ============================================================
   components.js — shared helpers + card templates.
   (Only markActiveNav is new — everything else unchanged.)
   ============================================================ */

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

/* ---------- NEW: mark the nav link matching the current page ---------- */
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

/* ---------- CARD TEMPLATES (unchanged) ---------- */
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

  /* WhatsApp message — same as before, only sent if available */
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
  const passengerSpec = Number.isInteger(v.passengers) && v.passengers > 0
    ? `<li><i class="bi bi-people-fill"></i> ${v.passengers} passengers</li>`
    : "";

  return `
    <article class="sy-card${isBooked ? " is-booked" : ""}">
      <div class="sy-card-media">
        <img src="${esc(v.image)}" alt="${esc(v.name)}" loading="lazy" decoding="async">
        ${badge}
      </div>
      <div class="sy-card-body">
        <h3 class="sy-card-title">${esc(v.name)}</h3>
        <ul class="sy-specs">
          <li><i class="bi bi-grid"></i> ${esc(vehicleCategoryLabel(v.category))}</li>
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

function vehicleCategoryLabel(category) {
  const labels = {
    economy: "Economy Cars",
    suv: "SUV Cars",
    "premium-suv": "Premium SUV",
    "7-seater": "7-Seater Cars",
    luxury: "Luxury / Premium"
  };
  return labels[category] || category || "Car";
}

function activityCard(a) {
  const waMsg =
    "Hi " + CONFIG.company.name + ", I'm interested in the " + a.name +
    " experience (" + a.meta + ") at \u20B9" + fmtPrice(a.price) + " " + a.unit +
    ". Kindly share availability. Thank you.";
  return `
    <article class="sy-card">
      <div class="sy-card-media"><img src="${esc(a.image)}" alt="${esc(a.name)}" loading="lazy" decoding="async"></div>
      <div class="sy-card-body">
        <h3 class="sy-card-title">${esc(a.name)}</h3>
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
  const waMsg =
    "Hi " + CONFIG.company.name + ", I'm interested in the " + item.name +
    " (" + kind + ", " + item.meta + ") at \u20B9" + fmtPrice(item.price) +
    " " + item.unit + ". Kindly share availability. Thank you.";
  return `
    <article class="sy-card">
      <div class="sy-card-media">
        <img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy" decoding="async">
        ${item.badge ? `<span class="sy-badge">${esc(item.badge)}</span>` : ""}
      </div>
      <div class="sy-card-body">
        <h3 class="sy-card-title">${esc(item.name)}</h3>
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
  const url = CONFIG.rentalInventoryCsvUrl;
  if (!url) return LOCAL_DATA.vehicles;

  const controller = new AbortController();
  const timeout = setTimeout(function () { controller.abort(); }, 8000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const csv = await response.text();
    const vehicles = parseRentalInventoryCsv(csv);
    console.info("[SY] Loaded rental inventory from Google Sheets.");
    return vehicles;
  } catch (error) {
    console.warn("[SY] Google Sheets inventory unavailable; keeping local inventory.", error);
    return LOCAL_DATA.vehicles;
  } finally {
    clearTimeout(timeout);
  }
}

function parseRentalInventoryCsv(csv) {
  const rows = parseCsvRows(csv);
  if (rows.length < 2) throw new Error("Inventory CSV has no vehicle rows.");

  const headers = rows[0].map(function (header) { return header.trim().toLowerCase(); });
  const requiredHeaders = ["name", "category", "manualprice", "automaticprice", "passengers", "image", "status"];
  const columnIndexes = {};
  requiredHeaders.forEach(function (header) {
    const index = headers.indexOf(header);
    if (index === -1) throw new Error("Inventory CSV is missing the " + header + " column.");
    columnIndexes[header] = index;
  });

  const localByName = new Map(LOCAL_DATA.vehicles.map(function (vehicle) {
    return [vehicle.name.trim().toLowerCase(), vehicle];
  }));
  const vehicles = rows.slice(1).filter(function (row) {
    return row.some(function (cell) { return cell.trim(); });
  }).map(function (row, index) {
    const get = function (header) {
      return (row[columnIndexes[header]] || "").trim();
    };
    const name = get("name");
    const category = get("category");
    const status = get("status").toLowerCase() || "available";
    const passengers = Number(get("passengers"));
    const manualPrice = parseInventoryPrice(get("manualprice"), "Manual", index + 2);
    const automaticPrice = parseInventoryPrice(get("automaticprice"), "Automatic", index + 2);
    const local = localByName.get(name.toLowerCase());
    const image = get("image") || (local && local.image);

    if (!name) throw new Error("Inventory row " + (index + 2) + " has no vehicle name.");
    if (!["economy", "suv", "premium-suv", "7-seater", "luxury"].includes(category)) {
      throw new Error("Inventory row " + (index + 2) + " has an invalid category.");
    }
    if (!Number.isInteger(passengers) || passengers < 1) {
      throw new Error("Inventory row " + (index + 2) + " has an invalid passenger count.");
    }
    if (!manualPrice && !automaticPrice) {
      throw new Error("Inventory row " + (index + 2) + " has no valid price.");
    }
    if (!["available", "booked", "hidden"].includes(status)) {
      throw new Error("Inventory row " + (index + 2) + " has an invalid status.");
    }
    if (!image) {
      throw new Error("Inventory row " + (index + 2) + " needs an image URL.");
    }

    const rates = [];
    if (manualPrice) rates.push({ transmission: "Manual", price: manualPrice });
    if (automaticPrice) rates.push({ transmission: "Automatic", price: automaticPrice });
    return {
      type: "car",
      category: category,
      name: name,
      passengers: passengers,
      rates: rates,
      featured: Boolean(local && local.featured),
      status: status,
      bookedUntil: local ? local.bookedUntil : "",
      image: image
    };
  });

  if (!vehicles.length) throw new Error("Inventory CSV has no usable vehicle rows.");
  return vehicles;
}

function parseInventoryPrice(value, transmission, rowNumber) {
  if (!value) return null;
  const price = Number(value.replace(/[₹,\s]/g, ""));
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Inventory row " + rowNumber + " has an invalid " + transmission + " price.");
  }
  return price;
}

function parseCsvRows(csv) {
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