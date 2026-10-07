/* ============================================================
   data.js — LOCAL fallback data for the whole site.

   AVAILABILITY (admin control):
   Every vehicle has two fields you can edit:
     • status       → "available" | "booked" | "hidden"
     • bookedUntil  → optional text shown to visitors when booked

   • status "available" → normal card, Book Now works
   • status "booked"    → "Booked" badge, button disabled, image dimmed
   • status "hidden"    → card never appears on the site
   ============================================================ */

const LOCAL_DATA = {

  /* ==========================================================
     1. POPULAR CATEGORIES
     ========================================================== */
  categories: [
    { name: "Car Rentals",     desc: "Comfortable · Reliable",    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80", href: "rentals/" },
    { name: "Bike Rentals",    desc: "Explore Freely",            image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",    href: "rentals/" },
    { name: "Water Activities",desc: "Adventure Awaits",          image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80", href: "activities/" },
    { name: "Yacht Rentals",   desc: "Luxury on Water",           image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=75", href: "yachts/" },
    { name: "Boat Trips",      desc: "Island · Sightseeing",      image: "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=600&q=75", href: "yachts/" },
    { name: "Cruises",         desc: "Sunset · Party · More",     image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=600&q=75", href: "yachts/" }
  ],

  /* ==========================================================
     2. VEHICLES (cars + bikes)
     - category : "car" | "bike"
     - featured : true → shows on homepage Featured Rentals
     - status   : "available" | "booked" | "hidden"   ← EDIT THIS
     - bookedUntil : free text (optional)             ← EDIT THIS
     ========================================================== */
  vehicles: [
    /* ---------------- CARS ---------------- */
    {
      category: "car",
      name: "Toyota Innova Crysta",
      seats: 7,
      transmission: "Manual",
      fuel: "Diesel",
      price: 2500,
      badge: "Most Popular",
      featured: true,
      status: "available",        // ← change to "booked" or "hidden" as needed
      bookedUntil: "",            // ← e.g. "15 Oct 2026"
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "car",
      name: "Maruti Suzuki Dzire",
      seats: 5,
      transmission: "Manual",
      fuel: "Petrol",
      price: 1200,
      badge: "",
      featured: true,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "car",
      name: "Hyundai Creta",
      seats: 5,
      transmission: "Automatic",
      fuel: "Petrol",
      price: 2000,
      badge: "",
      featured: true,
      status: "booked",           // ← example: this one is currently rented
      bookedUntil: "15 Oct 2026",
      image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "car",
      name: "Maruti Suzuki Swift",
      seats: 5,
      transmission: "Manual",
      fuel: "Petrol",
      price: 1100,
      badge: "",
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "car",
      name: "Maruti Suzuki Ertiga",
      seats: 7,
      transmission: "Manual",
      fuel: "CNG",
      price: 1800,
      badge: "",
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "car",
      name: "Toyota Fortuner",
      seats: 7,
      transmission: "Automatic",
      fuel: "Diesel",
      price: 4500,
      badge: "Premium",
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=800&q=80"
    },

    /* ---------------- BIKES ---------------- */
    {
      category: "bike",
      name: "Honda CB350",
      seats: 2,
      transmission: "Manual",
      fuel: "Petrol",
      price: 1000,
      badge: "",
      featured: true,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "bike",
      name: "Honda Activa",
      seats: 2,
      transmission: "Automatic",
      fuel: "Petrol",
      price: 400,
      badge: "Best Value",
      featured: true,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "bike",
      name: "Royal Enfield Classic 350",
      seats: 2,
      transmission: "Manual",
      fuel: "Petrol",
      price: 1200,
      badge: "",
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1558980664-10e7170b5df9?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "bike",
      name: "TVS Jupiter",
      seats: 2,
      transmission: "Automatic",
      fuel: "Petrol",
      price: 450,
      badge: "",
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "bike",
      name: "Bajaj Pulsar 150",
      seats: 2,
      transmission: "Manual",
      fuel: "Petrol",
      price: 700,
      badge: "",
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80"
    },
    {
      category: "bike",
      name: "KTM Duke 200",
      seats: 2,
      transmission: "Manual",
      fuel: "Petrol",
      price: 900,
      badge: "",
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=800&q=80"
    }
  ],

  /* ==========================================================
     3. EXCITING EXPERIENCES
     ========================================================== */
  activities: [
    { name: "Scuba Diving",  meta: "2 hrs · North Goa",       price: 2500, unit: "per person", image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80" },
    { name: "Parasailing",   meta: "15 min · Baga Beach",     price: 1800, unit: "per person", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
    { name: "Jet Ski",       meta: "30 min · Calangute",      price: 1500, unit: "per person", image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80" },
    { name: "Dolphin Trips", meta: "1 hr · Sinquerim",        price: 900,  unit: "per person", image: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=800&q=80" },
    { name: "Sunset Cruise", meta: "2 hrs · Mandovi River",   price: 1200, unit: "per person", image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80" },
    { name: "Island Tours",  meta: "Full day · Grand Island", price: 2000, unit: "per person", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" }
  ],

  /* ==========================================================
     4. YACHTS
     ========================================================== */
  yachts: [
    { name: "Sunseeker 55", meta: "54 ft · 20 Guests · Crew", price: 75000, unit: "per day", badge: "Premium", image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80" },
    { name: "Princess 48",  meta: "48 ft · 16 Guests · Crew", price: 60000, unit: "per day", badge: "",        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" }
  ],

  /* ==========================================================
     5. BOATS
     ========================================================== */
  boats: [
    { name: "Private Boat", meta: "8 Guests · Sightseeing", price: 5000, unit: "per trip", image: "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=800&q=80" },
    { name: "Speed Boat",   meta: "6 Guests · Thrill Ride", price: 3500, unit: "per trip", image: "https://images.unsplash.com/photo-1502933691298-84fc14542831?auto=format&fit=crop&w=800&q=80" }
  ],

  /* ==========================================================
     6. CRUISES
     ========================================================== */
  cruises: [
    { name: "Party Cruise",  meta: "3 hrs · Music & Dance", price: 2500, unit: "per person", image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80" },
    { name: "Sunset Cruise", meta: "2 hrs · Mandovi River", price: 1500, unit: "per person", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80" }
  ],

  /* ==========================================================
     7. WHY BOOK WITH US
     ========================================================== */
  whyBook: [
    { icon: "bi-patch-check-fill",      title: "Verified Vehicles & Operators", text: "Safe & trusted partners across Goa." },
    { icon: "bi-cash-coin",             title: "Transparent Pricing",           text: "No hidden charges. Ever." },
    { icon: "bi-lightning-charge-fill", title: "Easy Booking",                  text: "In minutes, not hours." },
    { icon: "bi-headset",               title: "Local Support",                 text: "We're here for you, 24/7." },
    { icon: "bi-shield-lock-fill",      title: "Secure Payments",               text: "Safe & flexible options." },
    { icon: "bi-star-fill",             title: "Top Rated in Goa",              text: "Loved by hundreds of travellers." }
  ],

  /* ==========================================================
     8. HOW IT WORKS
     ========================================================== */
  howItWorks: [
    { icon: "bi-search",         title: "Search",  text: "Find what you need." },
    { icon: "bi-check2-square",  title: "Choose",  text: "Compare & select." },
    { icon: "bi-calendar-check", title: "Book",    text: "Confirm your slot." },
    { icon: "bi-emoji-smile",    title: "Enjoy",   text: "Make memories." }
  ],

};