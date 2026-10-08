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
| Rental inventory (name, rates, passenger capacity, image, category, availability) | Published Google Sheet configured in `js/config.js` |
| Water activities | Published `Activities` sheet tab configured in `js/config.js` |
| Taxi WhatsApp number | `js/config.js` → `CONFIG.company.phoneRaw` |
| Yachts / Boats / Cruises | Published `WaterTrips` sheet tab configured in `js/config.js` |
| Categories tiles | `js/data.js` → `LOCAL_DATA.categories` |
| Why Book With Us | `js/data.js` → `LOCAL_DATA.whyBook` |
| How It Works | `js/data.js` → `LOCAL_DATA.howItWorks` |
| Colors / spacing | `css/home.css` → `:root { ... }` (both pages) |
| Navbar links | `components/header.html` |
| Footer links | `components/footer.html` |

## Vehicles data shape

Each rental row in the published Google Sheet uses these columns:

`name`, `category`, `manualPrice`, `automaticPrice`, `passengers`, `image`, and `status`.

Leave a transmission price blank if it is not offered. Use `available`, `booked`, or `hidden` for status. Keep the `image` cell blank to reuse the existing local image for that exact vehicle name; new vehicles need an image URL. The sheet is fetched asynchronously with an eight-second timeout; local rental data renders immediately and remains in use if the sheet cannot be loaded or has invalid data. The published sheet is public/read-only to site visitors, so only put public inventory information in it. The current rental-sheet integration is for cars; type and featured-card choices for existing models continue to come from `js/data.js`.

Activities load from the published `Activities` tab with the columns `name`, `meta`, `price`, `unit`, and `image`. Yachts, boats, and cruises load together from `WaterTrips` with `name`, `type`, `meta`, `price`, `unit`, `badge`, and `image`; `type` must be `Yacht`, `Boat`, or `Cruise`. All catalogs load in parallel with an eight-second timeout. Local cards render immediately on first visit; after a successful load, each published CSV is cached in the visitor’s browser so its data renders immediately on later visits while refreshing in the background. If a CSV cannot load or is invalid, the last valid cached data is kept, otherwise local data is used. Leave an existing item’s image blank to reuse its local image; new items need an image URL.

## Taxi requests

The `/taxi/` form validates pickup, destination, date, time, and passenger count in the browser, then opens a pre-filled WhatsApp message using `CONFIG.company.phoneRaw`. Pickup and destination can be typed or selected on the interactive OpenStreetMap picker. It does not create or store bookings.