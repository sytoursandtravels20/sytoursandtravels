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

`name`, `type`, `category`, `manualPrice`, `automaticPrice`, `passengers`, and `status`. `typeLabel`, `categoryLabel`, `quantity`, and `image` are optional.

Use `type` for a vehicle type such as `car`, `bike`, or `scooty`, and use `category` for its filter category, such as `economy`, `suv`, `premium`, or `7-seater`. The rentals page automatically builds its type and category filters from the distinct values in these columns. Optional `typeLabel` and `categoryLabel` columns set the visible names for those filters and vehicle cards; enter the same label on each row sharing that type/category. If a label is blank, the site formats the type or category value for display. If `type` is omitted, legacy type values (`car`, `bike`, `scooty`, `scooter`) in `category` are still accepted. `quantity` is the number of matching units and defaults to 1. Leave a transmission price blank if it is not offered, and use values such as `6/7` for variable passenger capacity. Use `available`, `booked`, or `hidden` for status. An empty `image` reuses the local image for a known vehicle, if available; new vehicles can omit it. The published sheet is public/read-only to site visitors, so only put public inventory information in it.

Rental data loads from the browser cache immediately, then refreshes from Google Sheets in the background with an eight-second timeout and cache bypass. New rows render when the refreshed CSV is valid. If it cannot load or has invalid data, the last valid cached catalog (or local catalog on first visit) remains visible. Featured-card choices for existing models continue to come from `js/data.js`.

Activities load from the published `Activities` tab with the required columns `name`, `meta`, `price`, `unit`, and `image`. Add optional `type`, `typeLabel`, `category`, and `categoryLabel` columns to control activity types, category filters, and their displayed labels. Distinct types/categories in the sheet automatically build the activities-page filter chips; blank type/category values use `activity` as the default activity type and category.

Water trips load from the published `WaterTrips` tab with the required columns `name`, `type`, `meta`, `price`, `unit`, `badge`, and `image`. `type` can be any value (for example Yacht, Boat, Cruise, or a new type); add optional `typeLabel`, `category`, and `categoryLabel` columns for visible names and additional category filters. Distinct sheet types/categories automatically build water-trip filter chips.

All catalogs load in parallel with an eight-second timeout. Local cards render immediately on first visit; after a successful load, each published CSV is cached in the visitor’s browser so its data renders immediately on later visits while refreshing in the background. If a CSV cannot load or is invalid, the last valid cached data is kept, otherwise local data is used. Leave an existing item’s image blank to reuse its local image; new items need an image URL.

Privacy and Terms content loads from their published tabs. Add a row with `Last updated` under `heading` and the date under `content` to display the policy’s revision date. Update that row whenever you edit the policy; the website cannot infer the document edit date from a published CSV.

## Taxi requests

The `/taxi/` form validates pickup, destination, date, time, and passenger count in the browser, then opens a pre-filled WhatsApp message using `CONFIG.company.phoneRaw`. Pickup and destination can be typed or selected on the interactive OpenStreetMap picker. It does not create or store bookings.