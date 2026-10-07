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

Both pages share the same header, footer, and CSS tokens. Both are fully static — no server config required.

## Where to edit what

| What you want to change | File |
|---|---|
| Company name, phone, email, socials | `js/config.js` → `CONFIG.company`, `CONFIG.social` |
| Homepage hero text + background | `js/config.js` → `CONFIG.hero` |
| Homepage CTA block | `js/config.js` → `CONFIG.cta` |
| Vehicles (name, price, image, category) | `js/data.js` → `LOCAL_DATA.vehicles` |
| Water activities | `js/data.js` → `LOCAL_DATA.activities` |
| Yachts / Boats / Cruises | `js/data.js` → `LOCAL_DATA.yachts`, `.boats`, `.cruises` |
| Categories tiles | `js/data.js` → `LOCAL_DATA.categories` |
| Why Book With Us | `js/data.js` → `LOCAL_DATA.whyBook` |
| How It Works | `js/data.js` → `LOCAL_DATA.howItWorks` |
| Reviews | `js/data.js` → `LOCAL_DATA.reviews` |
| Colors / spacing | `css/home.css` → `:root { ... }` (both pages) |
| Navbar links | `components/header.html` |
| Footer links | `components/footer.html` |

## Vehicles data shape

Each vehicle in `LOCAL_DATA.vehicles`:

```js
{
  category:     "car" | "bike",   // used for filters on /rentals/
  name:         "Toyota Innova Crysta",
  seats:        7,
  transmission: "Manual",
  fuel:         "Diesel",
  price:        2500,
  badge:        "Most Popular",   // optional
  featured:     true,             // shows on homepage Featured Rentals
  image:        "https://..."
}