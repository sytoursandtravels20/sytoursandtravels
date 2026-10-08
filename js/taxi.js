document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("taxiForm");
  const dateInput = document.getElementById("taxiDate");
  const message = document.getElementById("taxiMessage");
  if (!form || !dateInput || !message) return;

  dateInput.min = localDateString(new Date());

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
