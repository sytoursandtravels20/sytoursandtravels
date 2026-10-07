# SY Tours & Travels — Homepage

## Where to edit what

| What you want to change | File to edit |
|---|---|
| Company name, phone, email, address, socials | `js/config.js` → `CONFIG.company`, `CONFIG.social` |
| Hero title, subtitle, background image | `js/config.js` → `CONFIG.hero` |
| Final CTA block | `js/config.js` → `CONFIG.cta` |
| Cars / Bikes (name, price, seats, image) | `js/data.js` → `LOCAL_DATA.vehicles` |
| Water activities | `js/data.js` → `LOCAL_DATA.activities` |
| Yachts / Boats / Cruises | `js/data.js` → `LOCAL_DATA.yachts`, `.boats`, `.cruises` |
| Categories tiles | `js/data.js` → `LOCAL_DATA.categories` |
| Why Book With Us | `js/data.js` → `LOCAL_DATA.whyBook` |
| How It Works | `js/data.js` → `LOCAL_DATA.howItWorks` |
| Reviews | `js/data.js` → `LOCAL_DATA.reviews` |
| Colors / fonts / spacing | `css/home.css` → `:root { ... }` |
| Navbar links | `components/header.html` |
| Footer links | `components/footer.html` |

---

## How the data layer works

Everything reads from a single object returned by `loadData()` in `js/main.js`.
Right now, that returns `LOCAL_DATA` from `js/data.js`.

### Switching to Google Sheets later — 4 steps

You will **not** need to touch `index.html` or any CSS. The design stays the same.

**1. Create sheets** — one per list, headers in row 1:

- `categories` : name | desc | image | href
- `vehicles`   : name | seats | transmission | fuel | price | badge | image
- `activities` : name | meta | price | unit | image
- `yachts`     : name | meta | price | unit | badge | image
- `boats`      : name | meta | price | unit | image
- `cruises`    : name | meta | price | unit | image
- `whyBook`    : icon | title | text
- `howItWorks` : icon | title | text
- `reviews`    : name | source | rating | text

**2. Apps Script Web App** — Extensions → Apps Script. Read each sheet into
an array of objects and return JSON with the same shape as `LOCAL_DATA`:
