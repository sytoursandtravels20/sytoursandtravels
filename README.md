# SY Tours & Travels

Static marketing and booking-enquiry website for SY Tours & Travels.

## Pages

| URL | File |
|---|---|
| `/` | `index.html` |
| `/about/` | `about/index.html` |
| `/rentals/` | `rentals/index.html` |
| `/taxi/` | `taxi/index.html` |
| `/activities/` | `activities/index.html` |
| `/yachts/` | `yachts/index.html` |
| `/blog/` | `blog/index.html` |
| `/contact/` | `contact/index.html` |
| `/privacy/` | `privacy/index.html` |
| `/terms/` | `terms/index.html` |

The pages share header/footer components and CSS tokens. The site is static and can be hosted without an application server.

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

## Editable catalogs

Each rental row in the published Google Sheet uses these columns:

`name`, `category`, `manualPrice`, `automaticPrice`, `passengers`, `image`, and `status`.

Enter a publicly accessible direct image URL in `image` for every vehicle; the sheet value is used for the rental listing and homepage cards. A missing image URL makes the sheet invalid, and the site keeps its local fallback catalog until the sheet is corrected. Leave a transmission price blank if it is not offered. Use `available`, `booked`, or `hidden` for status. The sheet is fetched asynchronously with an eight-second timeout; local rental data renders immediately and remains in use if the sheet cannot be loaded or has invalid data. The published sheet is public/read-only to site visitors, so only put public inventory information in it. The current rental-sheet integration is for cars; type and featured-card choices for existing models continue to come from `js/data.js`.

Activities load from the published `Activities` tab with the columns `name`, `meta`, `price`, `unit`, and `image`. Yachts, boats, and cruises load together from `WaterTrips` with `name`, `type`, `meta`, `price`, `unit`, `badge`, and `image`; `type` must be `Yacht`, `Boat`, or `Cruise`. All catalogs load in parallel with an eight-second timeout. Local cards render immediately on first visit; after a successful load, each published CSV is cached in the visitor’s browser so its data renders immediately on later visits while refreshing in the background. If a CSV cannot load or is invalid, the last valid cached data is kept, otherwise local data is used. Leave an existing item’s image blank to reuse its local image; new items need an image URL.

Privacy and Terms content loads from their published tabs. Add a row with `Last updated` under `heading` and the date under `content` to display the policy’s revision date. Update that row whenever you edit the policy; the website cannot infer the document edit date from a published CSV.

## Taxi requests

The `/taxi/` form validates pickup, destination, date, time, and passenger count in the browser, then opens a pre-filled WhatsApp message using `CONFIG.company.phoneRaw`. Pickup and destination can be typed or selected on the interactive OpenStreetMap picker. It does not create or store bookings.