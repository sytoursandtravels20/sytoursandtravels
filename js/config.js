/* ============================================================
   config.js — ALL company-level, editable business information.
   Change things here to update the whole site.
   ============================================================ */

const CONFIG = {

  // These links connect each published Google Sheets tab to the page that displays it.
  // Keep local data in js/data.js as a backup for visitors who are offline.
  rentalInventoryCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQiFcddFBWrgGcvabvjuCCd8yEDoTWKlEKuK-nFwpTKv7qv3ydH5z-S1K7o8OJWJOeR_9Rc16QN3kPP/pub?gid=0&single=true&output=csv",
  activitiesCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQiFcddFBWrgGcvabvjuCCd8yEDoTWKlEKuK-nFwpTKv7qv3ydH5z-S1K7o8OJWJOeR_9Rc16QN3kPP/pub?gid=262811681&single=true&output=csv",
  waterTripsCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQiFcddFBWrgGcvabvjuCCd8yEDoTWKlEKuK-nFwpTKv7qv3ydH5z-S1K7o8OJWJOeR_9Rc16QN3kPP/pub?gid=1371955855&single=true&output=csv",
  privacyPolicyCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQiFcddFBWrgGcvabvjuCCd8yEDoTWKlEKuK-nFwpTKv7qv3ydH5z-S1K7o8OJWJOeR_9Rc16QN3kPP/pub?gid=1099760026&single=true&output=csv",
  termsCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQiFcddFBWrgGcvabvjuCCd8yEDoTWKlEKuK-nFwpTKv7qv3ydH5z-S1K7o8OJWJOeR_9Rc16QN3kPP/pub?gid=122504111&single=true&output=csv",
  offersCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQiFcddFBWrgGcvabvjuCCd8yEDoTWKlEKuK-nFwpTKv7qv3ydH5z-S1K7o8OJWJOeR_9Rc16QN3kPP/pub?gid=717773747&single=true&output=csv",

  /* ---------- COMPANY: update these details for the header, footer, and booking links ---------- */
  company: {
    name:      "SY Tours & Travels",
    tagline:   "Rentals · Activities · Yachts · More",
    phone:     "+91 90219 54978",
    phoneRaw:  "919021954978",   // digits only — used for tel: and wa.me links
    email:     "sytourandtravels20@gmail.com",
    address:   "Panjim, Goa, India",
    description:
      "Rent cars, book water activities, yachts, boats and cruises across Goa. Simple booking, honest prices, and a team that puts your happiness first."
  },

  /* ---------- LOGO ---------- */
  logo: {
    logoUrl:  "/sy-logo.svg",  // Shared SY mark used in the header and footer.
    logoIcon: "bi-compass"     // Bootstrap icon class used if logoUrl is empty
  },

  /* ---------- SOCIAL LINKS ---------- */
  social: {
    facebook:  "https://facebook.com/",
    instagram: "https://instagram.com/",
    twitter:   "https://twitter.com/",
    youtube:   "https://youtube.com/"
  },

  /* ---------- HERO ---------- */
  hero: {
    eyebrow:      "ONE PLATFORM. EVERY WAY TO EXPLORE",
    titleLine1:   "Explore Goa",
    titleLine2:   "Your Way",
    subtitle:     "Rent cars and bikes, discover water activities, book yachts, boats, cruises and more — all in one place.",
    backgroundImage:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=2000&q=82",
    ctaPrimary:   { label: "Explore Rentals", href: "#featured" },
    ctaSecondary: { label: "View Activities", href: "activities/" }
  },

  /* ---------- FINAL CTA BANNER ---------- */
  cta: {
    title:    "Your Goa adventure starts here.",
    subtitle: "Rides. Waves. Boats. Cruises. All in one place.",
    button:   { label: "Explore Now", href: "#featured" },
    backgroundImage:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=68"
  }
};