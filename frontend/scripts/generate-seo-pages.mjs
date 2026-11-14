import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://pondytourstravels.com";
const DIST_DIR = path.resolve("dist");

const pages = [
  {
    path: "/",
    title: "Pondy Tours & Travels | Pondicherry to Chennai Taxi Service",
    description:
      "Book Pondicherry to Chennai, Bangalore, Coimbatore and Madurai taxi service with Pondy Tours & Travels. 24/7 outstation cabs, verified drivers, Sedan, Ertiga, Innova and Crysta.",
  },
  {
    path: "/services",
    title: "Taxi Services in Pondicherry | One-Way, Round Trip & Airport Transfers",
    description:
      "Explore Pondy Tours & Travels taxi services including Pondicherry one-way cabs, round trips, airport transfers and 24/7 outstation taxi booking.",
  },
  {
    path: "/fleet",
    title: "Pondicherry Taxi Fleet | Sedan, Ertiga, Innova & Crysta",
    description:
      "Choose from Sedan, MUV/SUV Ertiga, Innova and Innova Crysta vehicles for Pondicherry outstation taxi service with verified drivers.",
  },
  {
    path: "/pricing",
    title: "Pondicherry Taxi Pricing | Transparent Outstation Cab Rates",
    description:
      "View Pondy Tours & Travels taxi pricing for Sedan, Ertiga, Innova and Innova Crysta with one-way and round-trip outstation cab rates.",
  },
  {
    path: "/contact",
    title: "Contact Pondy Tours & Travels | Pondicherry Taxi Booking",
    description:
      "Contact Pondy Tours & Travels for 24/7 Pondicherry taxi booking, WhatsApp cab reservations, airport transfers and outstation taxi support.",
  },
  {
    path: "/about",
    title: "About Pondy Tours & Travels | Pondicherry Taxi Service",
    description:
      "Learn about Pondy Tours & Travels, a Pondicherry taxi service for Chennai, Bangalore, Coimbatore, Madurai, airport transfers and outstation cab booking.",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | Pondy Tours & Travels",
    description:
      "Privacy policy for Pondy Tours & Travels taxi bookings, including how customer booking details, route data and contact information are used.",
  },
  {
    path: "/terms-conditions",
    title: "Taxi Booking Terms & Conditions | Pondy Tours & Travels",
    description:
      "Read Pondy Tours & Travels taxi booking terms, driver allowance, minimum distance policy, tolls, permits and outstation cab charges.",
  },
  {
    path: "/routes/pondicherry-to-chennai-taxi",
    title: "Pondicherry to Chennai Taxi | One-Way & Round Trip Cab",
    description:
      "Book Pondicherry to Chennai taxi service with verified drivers, clean cars, GPS tracking and transparent outstation cab pricing.",
  },
  {
    path: "/routes/chennai-to-pondicherry-taxi",
    title: "Chennai to Pondicherry Taxi | 24/7 Outstation Cab Booking",
    description:
      "Reserve Chennai to Pondicherry taxi service for airport pickup, one-way cab travel, family trips and round-trip outstation rides.",
  },
  {
    path: "/routes/pondicherry-to-bangalore-taxi",
    title: "Pondicherry to Bangalore Taxi | Sedan, Ertiga, Innova & Crysta",
    description:
      "Book Pondicherry to Bangalore taxi service with Sedan, Ertiga, Innova and Innova Crysta options for comfortable intercity travel.",
  },
  {
    path: "/routes/pondicherry-to-coimbatore-taxi",
    title: "Pondicherry to Coimbatore Taxi | Reliable Outstation Cab",
    description:
      "Book reliable Pondicherry to Coimbatore taxi service for one-way drops, round trips, business travel and family journeys.",
  },
  {
    path: "/routes/pondicherry-to-madurai-taxi",
    title: "Pondicherry to Madurai Taxi | One-Way & Round Trip Cab",
    description:
      "Book Pondicherry to Madurai taxi service with 24/7 support, verified drivers, clean vehicles and transparent outstation fare details.",
  },
];

const baseHtml = await readFile(path.join(DIST_DIR, "index.html"), "utf8");

function escapeAttribute(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function absoluteUrl(routePath) {
  return routePath === "/" ? `${SITE_URL}/` : `${SITE_URL}${routePath}/`;
}

function replaceOrInsertHeadTag(html, pattern, tag) {
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function renderPage(page) {
  const title = escapeAttribute(page.title);
  const description = escapeAttribute(page.description);
  const url = absoluteUrl(page.path);

  let html = baseHtml;
  html = html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
  html = replaceOrInsertHeadTag(
    html,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`,
  );
  html = replaceOrInsertHeadTag(
    html,
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    '<meta name="robots" content="index, follow, max-image-preview:large" />',
  );
  html = replaceOrInsertHeadTag(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  );
  html = replaceOrInsertHeadTag(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`,
  );
  html = replaceOrInsertHeadTag(
    html,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`,
  );
  html = replaceOrInsertHeadTag(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
  );
  html = replaceOrInsertHeadTag(
    html,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`,
  );
  html = replaceOrInsertHeadTag(
    html,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`,
  );

  return html;
}

for (const page of pages) {
  const outputDir =
    page.path === "/" ? DIST_DIR : path.join(DIST_DIR, page.path.replace(/^\//, ""));

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), renderPage(page), "utf8");
}

console.log(`Generated ${pages.length} canonical SEO pages.`);
