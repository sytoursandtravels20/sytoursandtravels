# SY Tours & Travels

Static marketing and booking-enquiry website for SY Tours & Travels.

## Pages

| URL | File |
|---|---|
| `/` | `index.html` |
| `/about/` | `about/index.html` |
| `/offers/` | `offers/index.html` |
| `/rentals/` | `rentals/index.html` |
| `/taxi/` | `taxi/index.html` |
| `/activities/` | `activities/index.html` |
| `/yachts/` | `yachts/index.html` |
| `/blog/` | `blog/index.html` |
| `/contact/` | `contact/index.html` |
| `/privacy/` | `privacy/index.html` |
| `/terms/` | `terms/index.html` |

The pages share header/footer components and CSS tokens. The site is static and can be hosted without an application server.

Visitors can switch between light and dark themes from the shared header. Their choice is saved in the browser; if they have not chosen a theme, the site follows the device color preference.

## How the website is organized

- `index.html` and each page folder's `index.html` contain the page layout.
- `css/` contains the styles; `home.css` provides the shared colors, cards, and common page elements.
- `js/config.js` contains company details and links to the published Google Sheets.
- `js/data.js` contains backup content for when a sheet or network connection is unavailable.
- `js/components.js` builds reusable cards, reads sheet rows, and fills in the shared header/footer.
- `js/main.js` handles shared pages, activities, and water trips; `js/rentals.js` handles rental filters; `js/taxi.js` handles taxi enquiries and place suggestions; `js/blog.js` displays blog posts.
- `components/header.html` and `components/footer.html` are reused across pages.

When making routine content changes, update the appropriate Google Sheet or the matching business setting in `js/config.js`. The code comments explain the less-obvious loading, filtering, and booking behavior; they are not intended to repeat each line of code.

## Where to edit what

| What you want to change | File |
|---|---|
| Company name, phone, email, socials | `js/config.js` → `CONFIG.company`, `CONFIG.social` |
| Homepage hero text + background | `js/config.js` → `CONFIG.hero` |
| Homepage CTA block | `js/config.js` → `CONFIG.cta` |
| Homepage offers | A separate published `Offers` sheet tab; set `offersCsvUrl` in `js/config.js` |
| Rental inventory (name, rates, passenger capacity, image, category, availability) | Published Google Sheet configured in `js/config.js` |
| Water activities | Published `Activities` sheet tab configured in `js/config.js` |
| Taxi WhatsApp number | `js/config.js` → `CONFIG.company.phoneRaw` |
| Yachts / Boats / Cruises | Published `WaterTrips` sheet tab configured in `js/config.js` |
| Categories tiles | `js/data.js` → `LOCAL_DATA.categories` |
| Why Book With Us | `js/data.js` → `LOCAL_DATA.whyBook` |
| How It Works | `js/data.js` → `LOCAL_DATA.howItWorks` |
| Colors / spacing | `css/home.css` → `:root { ... }`; dark mode uses `css/theme.css` |
| Navbar links | `components/header.html` |
| Footer links | `components/footer.html` |

## Offers

Offers use a separate Google Sheets tab, so existing catalog tabs do not need to change. Publish the `Offers` tab as CSV with just two columns: `title` and `description`. Each row appears in the homepage banner and on `/offers/`; put any discount amount, conditions, or other offer details in the description. The WhatsApp buttons let visitors confirm availability and terms. The offer display does not alter catalog prices.

## Editable catalogs

Each rental row in the published Google Sheet uses these columns:

`name`, `type`, `category`, `manualPrice`, `automaticPrice`, `passengers`, and `status`. `quantity`, `image`, and `details` are optional. Use `type` and `category` as their visible names too (for example, `car` displays as “Cars” and `7-seater` as “7 Seater”); there are no separate type/category labels to keep in sync. `details` is plain text shown in an expandable card section; use it for verified inclusions, extra charges, and important booking terms. The site also accepts the legacy `priceDetails`/`pricedetails` column name for compatibility.

Use `type` for a vehicle type such as `car`, `bike`, or `scooty`, and use `category` for its filter category, such as `economy`, `suv`, `premium`, or `7-seater`. The rentals page automatically builds its type and category filters from the distinct values in these columns. Both names are automatically formatted from their values, so change only `type` or `category` to update the corresponding filter. If `type` is omitted, legacy type values (`car`, `bike`, `scooty`, `scooter`) in `category` are still accepted. `quantity` is the number of matching units and defaults to 1. Leave a transmission price blank if it is not offered, and use values such as `6/7` for variable passenger capacity. Use `available`, `booked`, or `hidden` for status. An empty `image` reuses the local image for a known vehicle, if available; new vehicles can omit it. The published sheet is public/read-only to site visitors, so only put public inventory information in it.

Rental data loads from the browser cache immediately, then refreshes from Google Sheets in the background with an eight-second timeout and cache bypass. New rows render when the refreshed CSV is valid. If it cannot load or has invalid data, the last valid cached catalog (or local catalog on first visit) remains visible. Featured-card choices for existing models continue to come from `js/data.js`.

Activities load from the published `Activities` tab with the required columns `name`, `meta`, `price`, `unit`, and `image`. The optional `type` column controls activity types; its visible label is automatically generated from its value. Use `category` as both the category value and its visible name. Add an optional `details` column to show an expandable card section. Distinct types/categories in the sheet automatically build the activities-page filter chips; blank type/category values use `activity` as the default activity type and category.

Water trips load from the published `WaterTrips` tab with the required columns `name`, `type`, `meta`, `price`, `unit`, `badge`, and `image`. `type` can be any value (for example yacht, boat, cruise, or a new type); its visible label is automatically generated from its value. Use `category` as both the category value and its visible name. Add an optional `details` column to show an expandable card section. Distinct sheet types/categories automatically build water-trip filter chips.

All catalogs load in parallel with an eight-second timeout. Local cards render immediately on first visit; after a successful load, each published CSV is cached in the visitor’s browser so its data renders immediately on later visits while refreshing in the background. If a CSV cannot load or is invalid, the last valid cached data is kept, otherwise local data is used. Leave an existing item’s image blank to reuse its local image; new items need an image URL.

Privacy and Terms content loads from their published tabs. Add a row with `Last updated` under `heading` and the date under `content` to display the policy’s revision date. Update that row whenever you edit the policy; the website cannot infer the document edit date from a published CSV.

## Taxi requests

The `/taxi/` form suggests nearby places as visitors type and also lets visitors choose pickup and destination points on a map. It validates the trip details and opens a pre-filled WhatsApp message using `CONFIG.company.phoneRaw`. It does not create or store bookings.