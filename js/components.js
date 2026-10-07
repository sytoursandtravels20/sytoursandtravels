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

/* Connects the Bootstrap search modal to the cards currently shown. */
function initHeaderSearch() {
  const modal = document.getElementById("headerSearchModal");
  const input = document.getElementById("headerSearchInput");
  const empty = document.getElementById("headerSearchEmpty");
  if (!modal || !input) return;

  // Focus the input when Bootstrap finishes opening the responsive modal.
  modal.addEventListener("shown.bs.modal", function () {
    input.focus();
  });

  input.addEventListener("input", function () {
    const rentalSearch = document.getElementById("filterSearch");

    // Reuse the rentals page filters so its result count and empty state update too.
    if (rentalSearch) {
      rentalSearch.value = input.value;
      rentalSearch.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    // On other pages, show only rendered cards whose text matches the query.
    const query = input.value.trim().toLowerCase();
    const cards = document.querySelectorAll(".sy-card");
    let matchCount = 0;
    cards.forEach(function (card) {
      const matches = !query || card.textContent.toLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) matchCount += 1;
    });
    if (empty) empty.hidden = !query || matchCount > 0;
  });

}

/* ---------- CARD TEMPLATES (unchanged) ---------- */
function categoryCard(c) {
  return `
    <a class="category-card" href="${esc(c.href || "#")}">
      <span class="category-img"><img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy"></span>
      <p class="category-name">${esc(c.name)}</p>
      <p class="category-desc">${esc(c.desc)}</p>
    </a>`;
}

function vehicleCard(v) {
  /* Availability state */
  const isBooked = v.status === "booked";
  const until = v.bookedUntil ? " · Available from " + esc(v.bookedUntil) : "";

  /* WhatsApp message — same as before, only sent if available */
  const waMsg =
    "Hi " + CONFIG.company.name + ", I'm interested in renting the " +
    v.name + " (" + v.seats + " seats, " + v.transmission + ", " + v.fuel +
    ") at \u20B9" + fmtPrice(v.price) + "/day. Kindly share availability. Thank you.";

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

  return `
    <article class="sy-card${isBooked ? " is-booked" : ""}">
      <div class="sy-card-media">
        <img src="${esc(v.image)}" alt="${esc(v.name)}" loading="lazy">
        ${badge}
      </div>
      <div class="sy-card-body">
        <h3 class="sy-card-title">${esc(v.name)}</h3>
        <ul class="sy-specs">
          <li><i class="bi bi-people"></i> ${esc(v.seats)} Seats</li>
          <li><i class="bi bi-gear"></i> ${esc(v.transmission)}</li>
          <li><i class="bi bi-fuel-pump"></i> ${esc(v.fuel)}</li>
        </ul>
        <div class="sy-card-foot">
          <div class="sy-price">
            <span class="sy-price-value">\u20B9${fmtPrice(v.price)}</span>
            <span class="sy-price-unit">/ day</span>
            ${hint}
          </div>
          ${action}
        </div>
      </div>
    </article>`;
}

function activityCard(a) {
  const waMsg =
    "Hi " + CONFIG.company.name + ", I'm interested in the " + a.name +
    " experience (" + a.meta + ") at \u20B9" + fmtPrice(a.price) + " " + a.unit +
    ". Kindly share availability. Thank you.";
  return `
    <article class="sy-card">
      <div class="sy-card-media"><img src="${esc(a.image)}" alt="${esc(a.name)}" loading="lazy"></div>
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
        <img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">
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

function reviewCard(r) {
  const initials = r.name.trim().split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
  return `
    <article class="review-card">
      <div class="review-stars">${stars}</div>
      <p class="review-text">“${esc(r.text)}”</p>
      <div class="review-author">
        <div class="review-avatar">${esc(initials)}</div>
        <div>
          <p class="review-name">${esc(r.name)}</p>
          <p class="review-src">${esc(r.source)}</p>
        </div>
      </div>
    </article>`;
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