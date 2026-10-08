## Admin: marking a vehicle as booked / hidden

You never edit HTML or CSS for this. You only edit the data.

### In `js/data.js` (now)

Find the vehicle in `LOCAL_DATA.vehicles` and change two fields:

```js
status: "booked",              // was "available"
bookedUntil: "15 Oct 2026",    // optional — shows to visitors
# SY Tours & Travels

## Pages

| URL | File |
|---|---|
| `/` | `index.html` |
| `/rentals/` | `rentals/index.html` |
| `/taxi/` | `taxi/index.html` |

Both pages share the same header, footer, and CSS tokens. Both are fully static — no server config required.

## Where to edit what

| What you want to change | File |
|---|---|
| Company name, phone, email, socials | `js/config.js` → `CONFIG.company`, `CONFIG.social` |
| Homepage hero text + background | `js/config.js` → `CONFIG.hero` |
| Homepage CTA block | `js/config.js` → `CONFIG.cta` |
| Vehicles (name, price, image, category) | `js/data.js` → `LOCAL_DATA.vehicles` |
| Water activities | `js/data.js` → `LOCAL_DATA.activities` |
| Taxi WhatsApp number | `js/config.js` → `CONFIG.company.phoneRaw` |
| Yachts / Boats / Cruises | `js/data.js` → `LOCAL_DATA.yachts`, `.boats`, `.cruises` |
| Categories tiles | `js/data.js` → `LOCAL_DATA.categories` |
| Why Book With Us | `js/data.js` → `LOCAL_DATA.whyBook` |
| How It Works | `js/data.js` → `LOCAL_DATA.howItWorks` |
| Colors / spacing | `css/home.css` → `:root { ... }` (both pages) |
| Navbar links | `components/header.html` |
| Footer links | `components/footer.html` |

## Vehicles data shape

Each vehicle in `LOCAL_DATA.vehicles`:

```js
{
  type: "car" | "bike" | "scooty",
  category: "economy" | "suv" | "premium-suv" | "7-seater" | "luxury",
  name: "Maruti Swift",
  rates: [
    { transmission: "Manual", price: 1150 },
    { transmission: "Automatic", price: 1400 },
    { price: 2000, sample: true } // sample rates are labelled on the card
  ],
  featured: true,                 // shows on homepage Featured Rentals
  status: "available",            // "available" | "booked" | "hidden"
  image:        "https://..."
}
```

Vehicle type filters are generated from the types in the data, so adding a bike or scooty later automatically adds its filter. Sample rates are placeholders, marked on each rental card; confirm them before publishing as actual prices. Fuel type is not displayed on rental cards.

## Taxi requests

The `/taxi/` form validates pickup, destination, date, time, and passenger count in the browser, then opens a pre-filled WhatsApp message using `CONFIG.company.phoneRaw`. Pickup and destination can be typed or selected on the interactive OpenStreetMap picker. It does not create or store bookings.