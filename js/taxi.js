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

  date.min = localDateString(new Date());
  const closePickupSuggestions = addLocationSearch(from, document.getElementById("pickupSuggestions"));
  const closeDestinationSuggestions = addLocationSearch(to, document.getElementById("destinationSuggestions"));

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
      message.textContent = "Please enter both locations and complete all trip details.";
      return;
    }
    if (date.value < localDateString(new Date()) || !date.validity.valid) {
      message.textContent = "Please choose today or a future travel date.";
      date.focus();
      return;
    }
    if (!time.validity.valid || !Number.isInteger(Number(passengers.value)) || Number(passengers.value) < 1) {
      message.textContent = "Please check the pickup time and passenger count.";
      return;
    }

    const request = [
      "Taxi Booking Request",
      "From: " + from.value.trim(),
      "To: " + to.value.trim(),
      "Date: " + formatTravelDate(date.value),
      "Pickup time: " + formatPickupTime(time.value),
      "Passengers: " + passengers.value
    ].join("\n");
    window.open("https://wa.me/" + CONFIG.company.phoneRaw + "?text=" + encodeURIComponent(request), "_blank", "noopener");
  });
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
          const place = feature.properties;
          return [
            place.name,
            place.street,
            place.city || place.town || place.village,
            place.state
          ].filter(function (part, index, all) {
            return part && all.indexOf(part) === index;
          }).join(", ");
        }).filter(Boolean);

        suggestions.replaceChildren();
        places.forEach(function (place) {
          const option = document.createElement("button");
          option.type = "button";
          option.className = "location-suggestion";
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
          empty.textContent = "No places found. You can keep your address as typed.";
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
