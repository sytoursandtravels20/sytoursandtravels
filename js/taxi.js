/* Taxi booking validation, WhatsApp handoff, and optional map route selection. */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("taxiForm");
  const dateInput = document.getElementById("taxiDate");
  const message = document.getElementById("taxiMessage");
  const mapElement = document.getElementById("taxiMap");
  const mapHint = document.getElementById("mapHint");
  if (!form || !dateInput || !message || !mapElement || !mapHint) return;

  dateInput.min = localDateString(new Date());
  if (!window.L) {
    mapHint.textContent = "Map is unavailable right now. Enter your pickup and destination in the fields below.";
  } else {
    initTaxiMap(mapElement, mapHint);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    message.textContent = "";

    const fields = [
      { input: document.getElementById("taxiFrom"), error: "Please enter your pickup location." },
      { input: document.getElementById("taxiTo"), error: "Please enter your destination." },
      { input: dateInput, error: "Please select a travel date." },
      { input: document.getElementById("taxiTime"), error: "Please select a pickup time." },
      { input: document.getElementById("taxiPassengers"), error: "Please enter the number of passengers." }
    ];

    for (const field of fields) {
      if (!field.input.value.trim()) {
        showError(field.error, field.input);
        return;
      }
    }

    if (dateInput.value < localDateString(new Date())) {
      showError("Please select today or a future travel date.", dateInput);
      return;
    }
    if (!dateInput.validity.valid) {
      showError("Please select a valid travel date.", dateInput);
      return;
    }

    const passengerInput = document.getElementById("taxiPassengers");
    const passengers = Number(passengerInput.value);
    if (!Number.isInteger(passengers) || passengers < 1) {
      showError("Please enter at least 1 passenger.", passengerInput);
      return;
    }

    const timeInput = document.getElementById("taxiTime");
    if (!timeInput.validity.valid) {
      showError("Please select a valid pickup time.", timeInput);
      return;
    }
    const whatsappMessage = [
      "🚕 Taxi Booking Request",
      "",
      "📍 From: " + fields[0].input.value.trim(),
      "📍 To: " + fields[1].input.value.trim(),
      "📅 Date: " + formatTravelDate(dateInput.value),
      "🕐 Pickup Time: " + formatPickupTime(timeInput.value),
      "👥 No. of Passengers: " + passengers,
      "",
      "Please confirm availability and booking."
    ].join("\n");
    const whatsappUrl = "https://wa.me/" + CONFIG.company.phoneRaw +
      "?text=" + encodeURIComponent(whatsappMessage);

    try {
      const whatsappWindow = window.open(whatsappUrl, "_blank");
      if (!whatsappWindow) throw new Error("WhatsApp could not be opened.");
      whatsappWindow.opener = null;
    } catch (error) {
      console.error("[SY] Failed to open WhatsApp booking request.", error);
      showError("Unable to open WhatsApp. Please try again.");
    }
  });

  function showError(text, input) {
    message.textContent = text;
    if (input) input.focus();
  }
});

function initTaxiMap(mapElement, mapHint) {
  const pickupInput = document.getElementById("taxiFrom");
  const destinationInput = document.getElementById("taxiTo");
  const pickupButton = document.getElementById("pickPickup");
  const destinationButton = document.getElementById("pickDestination");
  const swapButton = document.getElementById("swapRoute");
  const map = L.map(mapElement, { scrollWheelZoom: false }).setView([15.4909, 73.8278], 9);
  const markers = { pickup: null, destination: null };
  const lookupIds = { pickup: 0, destination: 0 };
  let routeLine = null;
  let selectionMode = "pickup";

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
  }).addTo(map);

  pickupInput.addEventListener("input", function () {
    clearMapLocation("pickup");
    setSelectionMode(null);
    mapHint.textContent = "Pickup entered manually. Choose Pickup below if you want to place it on the map.";
  });
  destinationInput.addEventListener("input", function () {
    clearMapLocation("destination");
    setSelectionMode(null);
    mapHint.textContent = "Destination entered manually. Choose Destination below if you want to place it on the map.";
  });

  pickupButton.addEventListener("click", function () {
    setSelectionMode("pickup");
  });
  destinationButton.addEventListener("click", function () {
    setSelectionMode("destination");
  });
  swapButton.addEventListener("click", function () {
    const pickupValue = pickupInput.value;
    pickupInput.value = destinationInput.value;
    destinationInput.value = pickupValue;
    const pickupLocation = markers.pickup;
    markers.pickup = markers.destination;
    markers.destination = pickupLocation;
    setSelectionMode(null);
    updateRoute();
    updateRouteButtons();
    mapHint.textContent = "Pickup and destination swapped.";
  });

  map.on("click", function (event) {
    if (!selectionMode) {
      mapHint.textContent = "Choose Pickup or Destination below the map, then tap the map.";
      return;
    }
    const selectedKind = selectionMode;
    selectMapLocation(selectedKind, event.latlng);
    setSelectionMode(selectedKind === "pickup" ? "destination" : null);
  });

  function setSelectionMode(mode) {
    selectionMode = mode;
    pickupButton.classList.toggle("is-active", mode === "pickup");
    pickupButton.setAttribute("aria-pressed", String(mode === "pickup"));
    destinationButton.classList.toggle("is-active", mode === "destination");
    destinationButton.setAttribute("aria-pressed", String(mode === "destination"));
    mapElement.classList.toggle("is-picking", Boolean(mode));
    mapHint.textContent = mode
      ? (mode === "pickup" ? "Step 1: tap the map to choose your pickup." : "Step 2: tap the map to choose your destination.")
      : "Choose Pickup or Destination below the map, then tap the map.";
  }

  setSelectionMode("pickup");

  function selectMapLocation(kind, latlng) {
    // Ignore stale reverse-geocoding responses if the visitor moves this pin again.
    const thisLookup = ++lookupIds[kind];
    const coordinates = latlng.lat.toFixed(5) + ", " + latlng.lng.toFixed(5);
    const input = kind === "pickup" ? pickupInput : destinationInput;
    input.value = coordinates;
    mapHint.textContent = "Getting the address for your " + kind + "…";

    if (markers[kind]) map.removeLayer(markers[kind]);
    const iconClass = kind === "pickup" ? "is-pickup" : "is-destination";
    const iconName = kind === "pickup" ? "bi-geo-alt-fill" : "bi-flag-fill";
    const icon = L.divIcon({
      className: "",
      html: `<span class="taxi-pin-icon ${iconClass}"><i class="bi ${iconName}"></i></span>`,
      iconSize: [34, 38],
      iconAnchor: [17, 36]
    });
    markers[kind] = L.marker(latlng, { icon: icon }).addTo(map);
    updateRouteButtons();
    updateRoute();
    lookupAddress(latlng).then(function (address) {
      if (thisLookup !== lookupIds[kind] || !markers[kind] || !markers[kind].getLatLng().equals(latlng)) return;
      if (address) {
        input.value = address;
        markers[kind].bindPopup(
          `<strong>${kind === "pickup" ? "Pickup" : "Destination"}</strong><br>${escapeMapText(address)}`
        );
        mapHint.textContent = markers.pickup && markers.destination
          ? "Both locations are set. Continue with your trip details below."
          : kind === "pickup"
            ? "Pickup set. Now tap the map to choose your destination."
            : "Destination set. Choose Pickup below if you still need to set it.";
      } else {
        mapHint.textContent = markers.pickup && markers.destination
          ? "Both locations are set. Address lookup is unavailable, but you can edit them below."
          : kind === "pickup"
            ? "Address lookup unavailable. Pickup is set; tap the map to choose your destination."
            : "Address lookup unavailable. Destination is set; choose Pickup below if needed.";
      }
    }).catch(function (error) {
      if (thisLookup !== lookupIds[kind]) return;
      console.error("[SY] Map address lookup failed.", error);
      mapHint.textContent = markers.pickup && markers.destination
        ? "Both locations are set. You can edit them below."
        : kind === "pickup"
          ? "Could not look up the pickup address. Tap the map to choose your destination."
          : "Could not look up the destination address. Choose Pickup below if needed.";
    });
  }

  function clearMapLocation(kind) {
    if (markers[kind]) {
      map.removeLayer(markers[kind]);
      markers[kind] = null;
      lookupIds[kind] += 1;
      updateRouteButtons();
      updateRoute();
    }
  }

  function updateRouteButtons() {
    pickupButton.classList.toggle("is-set", Boolean(markers.pickup));
    destinationButton.classList.toggle("is-set", Boolean(markers.destination));
  }

  function updateRoute() {
    if (routeLine) {
      map.removeLayer(routeLine);
      routeLine = null;
    }
    if (markers.pickup && markers.destination) {
      routeLine = L.polyline(
        [markers.pickup.getLatLng(), markers.destination.getLatLng()],
        { color: "#236da8", weight: 4, opacity: .8, dashArray: "8 9" }
      ).addTo(map);
      const bounds = L.latLngBounds(markers.pickup.getLatLng(), markers.destination.getLatLng());
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    } else if (markers.pickup || markers.destination) {
      map.panTo((markers.pickup || markers.destination).getLatLng());
    }
  }

  async function lookupAddress(latlng) {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.search = new URLSearchParams({
      format: "jsonv2",
      lat: latlng.lat,
      lon: latlng.lng,
      zoom: "18",
      addressdetails: "1"
    });
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    const address = data.address || {};
    const primary = address.amenity || address.shop || address.tourism ||
      address.road || address.neighbourhood || address.suburb || data.name;
    const locality = address.suburb || address.village || address.town || address.city;
    const parts = [primary, locality, address.state].filter(function (part, index, all) {
      return part && all.indexOf(part) === index;
    });
    return parts.length ? parts.join(", ") : data.display_name || "";
  }
}

function escapeMapText(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character];
  });
}

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function formatTravelDate(value) {
  const parts = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(parts[0], parts[1] - 1, parts[2]));
}

function formatPickupTime(value) {
  const parts = value.split(":").map(Number);
  const date = new Date(2000, 0, 1, parts[0], parts[1]);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date).replace(/\b(am|pm)\b/i, function (period) {
    return period.toUpperCase();
  });
}
