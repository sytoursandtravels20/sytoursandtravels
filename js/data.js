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
    { name: "Water Activities",desc: "Adventure Awaits",          image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80", href: "activities/" },
    { name: "Yacht Rentals",   desc: "Luxury on Water",           image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=75", href: "yachts/" },
    { name: "Boat Trips",      desc: "Island · Sightseeing",      image: "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=600&q=75", href: "yachts/" },
    { name: "Cruises",         desc: "Sunset · Party · More",     image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=600&q=75", href: "yachts/" }
  ],

  /* ==========================================================
     2. RENTAL VEHICLES
     - type     : car | bike | scooty
     - category : vehicle category shown in the rentals filters
     - rates    : daily rates by transmission
     - passengers: vehicle seating capacity
     - featured : true → shows on homepage Featured Rentals
     - status   : "available" | "booked" | "hidden"   ← EDIT THIS
     ========================================================== */
  vehicles: [
    {
      type: "car",
      category: "economy",
      name: "Maruti Swift",
      passengers: 5,
      rates: [{ transmission: "Manual", price: 1150 }, { transmission: "Automatic", price: 1399 }],
      featured: true,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Suzuki_Swift_%282024%29_hybrid_DSC_6076.jpg/960px-Suzuki_Swift_%282024%29_hybrid_DSC_6076.jpg"
    },
    {
      type: "car",
      category: "economy",
      name: "Maruti Baleno",
      passengers: 5,
      rates: [{ transmission: "Manual", price: 1199 }, { transmission: "Automatic", price: 1499 }],
      featured: true,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/2022_Maruti_Suzuki_Baleno_Alpha_%28India%29_front_view.jpg/960px-2022_Maruti_Suzuki_Baleno_Alpha_%28India%29_front_view.jpg"
    },
    {
      type: "car",
      category: "economy",
      name: "Hyundai i20",
      passengers: 5,
      rates: [{ transmission: "Automatic", price: 1799 }],
      featured: true,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Hyundai_i20_%28III%2C_Facelift%29_%E2%80%93_f_11102025.jpg/960px-Hyundai_i20_%28III%2C_Facelift%29_%E2%80%93_f_11102025.jpg"
    },
    {
      type: "car",
      category: "suv",
      name: "Maruti Fronx",
      passengers: 5,
      rates: [{ transmission: "Manual", price: 1499 }, { transmission: "Automatic", price: 1799 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/2024_Suzuki_Fronx.jpg/960px-2024_Suzuki_Fronx.jpg"
    },
    {
      type: "car",
      category: "suv",
      name: "Kia Sonet",
      passengers: 5,
      rates: [{ transmission: "Manual", price: 1799 }, { transmission: "Automatic", price: 2299 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/2021_Kia_Sonet_1.5_Premiere_%28Indonesia%29_front_view_03.jpg/960px-2021_Kia_Sonet_1.5_Premiere_%28Indonesia%29_front_view_03.jpg"
    },
    {
      type: "car",
      category: "suv",
      name: "Maruti Brezza",
      passengers: 5,
      rates: [{ transmission: "Manual", price: 1499 }, { transmission: "Automatic", price: 1799 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/2022_Maruti_Suzuki_Brezza_ZXi%2B_%28India%29_front_view_03.png/960px-2022_Maruti_Suzuki_Brezza_ZXi%2B_%28India%29_front_view_03.png"
    },
    {
      type: "car",
      category: "suv",
      name: "Mahindra Thar Hard Top",
      passengers: 4,
      rates: [{ transmission: "Manual", price: 2999 }, { transmission: "Automatic", price: 3199 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg/960px-Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg"
    },
    {
      type: "car",
      category: "suv",
      name: "Maruti Jimny",
      passengers: 4,
      rates: [{ transmission: "Manual", price: 2799 }, { transmission: "Automatic", price: 3199 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/2019_Suzuki_Jimny_SZ5_4X4_Automatic_1.5.jpg/960px-2019_Suzuki_Jimny_SZ5_4X4_Automatic_1.5.jpg"
    },
    {
      type: "car",
      category: "premium-suv",
      name: "Hyundai Creta",
      passengers: 5,
      rates: [{ transmission: "Manual", price: 2349 }, { transmission: "Automatic", price: 2999 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png/960px-2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png"
    },
    {
      type: "car",
      category: "premium-suv",
      name: "Kia Seltos",
      passengers: 5,
      rates: [{ transmission: "Manual", price: 1499 }, { transmission: "Automatic", price: 2999 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg/960px-Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg"
    },
    {
      type: "car",
      category: "premium-suv",
      name: "Mahindra Thar Roxx",
      passengers: 5,
      rates: [{ transmission: "Manual", price: 4299 }, { transmission: "Automatic", price: 4799 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Mahindra_Thar_ROXX_on_dirt.jpg/960px-Mahindra_Thar_ROXX_on_dirt.jpg"
    },
    {
      type: "car",
      category: "7-seater",
      name: "Maruti Ertiga",
      passengers: 7,
      rates: [{ transmission: "Manual", price: 1999 }, { transmission: "Automatic", price: 2499 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/2022_Maruti_Suzuki_Ertiga_LXi.jpg/960px-2022_Maruti_Suzuki_Ertiga_LXi.jpg"
    },
    {
      type: "car",
      category: "7-seater",
      name: "Kia Carens",
      passengers: 7,
      rates: [{ transmission: "Manual", price: 2349 }, { transmission: "Automatic", price: 2999 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/2022_Kia_Carens_1.4_%28India%29_front_view_01.jpg/960px-2022_Kia_Carens_1.4_%28India%29_front_view_01.jpg"
    },
    {
      type: "car",
      category: "7-seater",
      name: "Hyundai Alcazar",
      passengers: 7,
      rates: [{ transmission: "Manual", price: 2499 }, { transmission: "Automatic", price: 2999 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/2021_Hyundai_Alcazar_2.0_Signature_%28India%29_front_view.png/960px-2021_Hyundai_Alcazar_2.0_Signature_%28India%29_front_view.png"
    },
    {
      type: "car",
      category: "7-seater",
      name: "Toyota Innova Crysta",
      passengers: 7,
      rates: [{ transmission: "Manual", price: 2749 }, { transmission: "Automatic", price: 2199 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Toyota_Innova_Crysta_2.4_Z_front_right.jpg/960px-Toyota_Innova_Crysta_2.4_Z_front_right.jpg"
    },
    {
      type: "car",
      category: "7-seater",
      name: "Toyota Innova Hycross",
      passengers: 7,
      rates: [{ transmission: "Automatic", price: 3400 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Toyota_Innova_Zenix_2.0_V_%28III%29_%E2%80%93_f_22032025.jpg/960px-Toyota_Innova_Zenix_2.0_V_%28III%29_%E2%80%93_f_22032025.jpg"
    },
    {
      type: "car",
      category: "luxury",
      name: "Toyota Fortuner",
      passengers: 7,
      rates: [{ transmission: "Automatic", price: 6699 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/2015_Toyota_Fortuner_%28New_Zealand%29.jpg/960px-2015_Toyota_Fortuner_%28New_Zealand%29.jpg"
    },
    {
      type: "car",
      category: "suv",
      name: "Mahindra Thar Soft Top",
      passengers: 4,
      rates: [{ transmission: "Manual", price: 3000 }, { transmission: "Automatic", price: 3299 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg/960px-Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg"
    },
    {
      type: "car",
      category: "premium-suv",
      name: "Hyundai Creta with Sunroof",
      passengers: 5,
      rates: [{ transmission: "Automatic", price: 3199 }],
      featured: false,
      status: "available",
      bookedUntil: "",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png/960px-2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png"
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