// Suggest Goa locations as the visitor types, then send the trip request to WhatsApp.
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("taxiForm");
  if (!form) return;

  const from = document.getElementById("taxiFrom");
  const to = document.getElementById("taxiTo");
  const date = document.getElementById("taxiDate");
  const time = document.getElementById("taxiTime");
  const passengers = document.getElementById("taxiPassengers");
  const message = document.getElementById("taxiMessage");
  const mapDialog = document.getElementById("taxiMapDialog");
  const mapStatus = document.getElementById("taxiMapStatus");
  let map;
  let mapMarker;
  let mapTarget;
  let lookupController;

  date.min = localDateString(new Date());
  const closePickupSuggestions = addLocationSearch(from, document.getElementById("pickupSuggestions"));
  const closeDestinationSuggestions = addLocationSearch(to, document.getElementById("destinationSuggestions"));

  document.querySelectorAll("[data-map-target]").forEach(function (button) {
    button.addEventListener("click", function () {
      mapTarget = document.getElementById(button.dataset.mapTarget);
      closePickupSuggestions();
      closeDestinationSuggestions();
      mapStatus.textContent = "";
      document.getElementById("taxiMapTitle").textContent =
        siteText(mapTarget === from ? "Choose pickup location" : "Choose destination");
      mapDialog.showModal();

      if (!window.L) {
        mapStatus.textContent = siteText("The map could not load. You can still enter the location above.");
        return;
      }
      if (!map) {
        map = window.L.map("taxiMap").setView([15.49, 73.83], 11);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19
        }).addTo(map);
        map.on("click", selectMapLocation);
      }
      requestAnimationFrame(function () { map.invalidateSize(); });
    });
  });

  document.getElementById("closeTaxiMap").addEventListener("click", function () {
    mapDialog.close();
  });
  mapDialog.addEventListener("close", function () {
    if (lookupController) lookupController.abort();
  });

  document.getElementById("swapRoute").addEventListener("click", function () {
    const location = from.value;
    from.value = to.value;
    to.value = location;
    closePickupSuggestions();
    closeDestinationSuggestions();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    message.textContent = "";

    if (!from.value.trim() || !to.value.trim() || !date.value || !time.value || !passengers.value) {
      message.textContent = siteText("Please enter both locations and complete all trip details.");
      return;
    }
    if (date.value < localDateString(new Date()) || !date.validity.valid) {
      message.textContent = siteText("Please choose today or a future travel date.");
      date.focus();
      return;
    }
    if (!time.validity.valid || !Number.isInteger(Number(passengers.value)) || Number(passengers.value) < 1) {
      message.textContent = siteText("Please check the pickup time and passenger count.");
      return;
    }

    const request = [
      siteText("Taxi Booking Request"),
      siteText("From") + ": " + from.value.trim(),
      siteText("To") + ": " + to.value.trim(),
      siteText("Date") + ": " + formatTravelDate(date.value),
      siteText("Pickup time") + ": " + formatPickupTime(time.value),
      siteText("Passengers") + ": " + passengers.value
    ].join("\n");
    window.open("https://wa.me/" + CONFIG.company.phoneRaw + "?text=" + encodeURIComponent(request), "_blank", "noopener");
  });

  async function selectMapLocation(event) {
    if (lookupController) lookupController.abort();
    lookupController = new AbortController();
    const { lat, lng } = event.latlng;
    if (mapMarker) mapMarker.setLatLng(event.latlng);
    else mapMarker = window.L.marker(event.latlng).addTo(map);
    mapStatus.textContent = siteText("Finding this place…");

    const url = new URL("https://photon.komoot.io/reverse");
    url.search = new URLSearchParams({ lat: String(lat), lon: String(lng) });

    try {
      const response = await fetch(url, { signal: lookupController.signal });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const result = await response.json();
      const feature = result.features && result.features[0];
      const place = feature && formatPlace(feature.properties);
      if (!place) throw new Error("No place name was found for the selected point.");

      mapTarget.value = place;
      mapDialog.close();
      mapTarget.focus();
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("[SY] Could not identify the selected map location.", error);
        mapStatus.textContent = siteText("Could not identify that place. Try tapping nearby or enter it above.");
      }
    }
  }
});

// Show nearby place suggestions; visitors can still type any address manually.
function addLocationSearch(input, suggestions) {
  let timer;
  let controller;
  input.setAttribute("aria-expanded", "false");

  input.addEventListener("input", function () {
    clearTimeout(timer);
    if (controller) controller.abort();
    suggestions.replaceChildren();
    suggestions.hidden = true;
    input.setAttribute("aria-expanded", "false");

    const query = input.value.trim();
    if (query.length < 3) return;

    timer = setTimeout(async function () {
      controller = new AbortController();
      const url = new URL("https://photon.komoot.io/api/");
      url.search = new URLSearchParams({ q: query, lat: "15.49", lon: "73.83", limit: "5" });

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const result = await response.json();
        const places = (result.features || []).map(function (feature) {
          return formatPlace(feature.properties);
        }).filter(Boolean);

        suggestions.replaceChildren();
        places.forEach(function (place) {
          const option = document.createElement("button");
          option.type = "button";
          option.className = "location-suggestion";
          option.setAttribute("data-i18n-preserve", "");
          option.setAttribute("role", "option");
          option.textContent = place;
          option.addEventListener("click", function () {
            input.value = place;
            suggestions.hidden = true;
            input.setAttribute("aria-expanded", "false");
            input.focus();
          });
          suggestions.appendChild(option);
        });
        if (!places.length) {
          const empty = document.createElement("p");
          empty.className = "location-suggestion-empty";
          empty.textContent = siteText("No places found. You can keep your address as typed.");
          suggestions.appendChild(empty);
        }
        suggestions.hidden = false;
        input.setAttribute("aria-expanded", "true");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("[SY] Could not load location suggestions.", error);
        }
      }
    }, 300);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      suggestions.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("click", function (event) {
    if (!suggestions.contains(event.target) && event.target !== input) {
      suggestions.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }
  });

  return function () {
    clearTimeout(timer);
    if (controller) controller.abort();
    suggestions.replaceChildren();
    suggestions.hidden = true;
    input.setAttribute("aria-expanded", "false");
  };
}

function formatPlace(place) {
  return [
    place.name,
    [place.housenumber, place.street].filter(Boolean).join(" "),
    place.city || place.town || place.village,
    place.state
  ].filter(function (part, index, all) {
    return part && all.indexOf(part) === index;
  }).join(", ");
}

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function formatTravelDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
}

function formatPickupTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(new Date(2000, 0, 1, hour, minute));
}
