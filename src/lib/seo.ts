import type { Experience } from "@/data/experiences";
import type { CitySummary } from "@/lib/cities";
import type { ReviewSummary } from "@/lib/api/reviews";

export function resolveSiteUrl(): string {
  if (typeof process !== "undefined" && process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, "");
  }
  if (typeof process !== "undefined" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://the-royal-passage.vercel.app";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "The Royal Passage";
export const CONTACT_EMAIL = "noreplay@theroyalpassage.com";
export const CONTACT_PHONE = "+91 729588826";
export const MAPS_LINK = "https://maps.app.goo.gl/Qy3oqMKGpJDQUbeZ9";

export const businessAddress = {
  "@type": "PostalAddress",
  streetAddress: "5th Cross Road, Saraswathipuram",
  addressLocality: "Mysuru",
  addressRegion: "Karnataka",
  postalCode: "570009",
  addressCountry: "IN",
};

const categories = [
  "Pottery Experience",
  "Culinary Courses",
  "Outdoor Cooking",
  "Nature Walks",
  "Heritage Walks",
  "Curated Expeditions",
];

export function buildExperienceJsonLd(exp: Experience, reviews: ReviewSummary[] = []) {
  const pageUrl = `${SITE_URL}/experiences/${exp.slug}`;
  const priceCurrency = exp.currencySymbol === "₹" ? "INR" : "EUR";

  const reviewNodes = reviews.slice(0, 10).map((review) => ({
    "@type": "Review",
    author: { "@type": "Person", name: review.reviewerDisplayName ?? "Guest" },
    datePublished: review.createdAt,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
    },
    reviewBody: review.comment ?? undefined,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: exp.title,
    description: exp.description,
    image: exp.image ? [exp.image] : undefined,
    url: pageUrl,
    touristType: "Cultural traveller",
    provider: {
      "@type": "Person",
      name: exp.hostName,
    },
    offers: {
      "@type": "Offer",
      price: exp.pricePerPerson,
      priceCurrency,
      availability: exp.slots.some((slot) => slot.available > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      url: pageUrl,
    },
    aggregateRating:
      exp.reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: exp.rating,
            reviewCount: exp.reviewsCount,
          }
        : undefined,
    review: reviewNodes.length > 0 ? reviewNodes : undefined,
    location: {
      "@type": "Place",
      name: exp.address || exp.city,
      address: {
        "@type": "PostalAddress",
        addressLocality: exp.city,
        addressCountry: "IN",
      },
    },
  };
}

export function buildCityJsonLd(city: CitySummary) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${city.name} experiences — ${SITE_NAME}`,
        url: `${SITE_URL}/cities/${city.slug}`,
        description: city.description ?? city.tagline ?? undefined,
        about: {
          "@type": "City",
          name: city.name,
          address: {
            "@type": "PostalAddress",
            addressRegion: city.state,
            addressCountry: city.state === "Tamil Nadu" ? "IN" : "IN",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Cities", item: `${SITE_URL}/cities` },
          {
            "@type": "ListItem",
            position: 3,
            name: city.name,
            item: `${SITE_URL}/cities/${city.slug}`,
          },
        ],
      },
    ],
  };
}

export function buildHomeJsonLd(experiences: Experience[] = []) {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const homepageId = `${SITE_URL}/#homepage`;
  const offerCatalogId = `${SITE_URL}/#experience-catalog`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": organizationId,
        "@type": ["Organization", "TravelAgency", "LocalBusiness"],
        name: SITE_NAME,
        url: SITE_URL,
        email: CONTACT_EMAIL,
        telephone: CONTACT_PHONE,
        address: businessAddress,
        areaServed: ["Mysuru", "Karnataka", "India"],
        slogan: "Experience Mysuru, Royally",
        description:
          "An experience-led travel company curating immersive journeys in and around Mysuru.",
        hasMap: MAPS_LINK,
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: CONTACT_PHONE,
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: ["en", "kn", "hi"],
          },
        ],
      },
      {
        "@id": websiteId,
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { "@id": organizationId },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/experiences?category={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@id": homepageId,
        "@type": "WebPage",
        name: "Experience Mysuru, Royally",
        url: SITE_URL,
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
        description:
          "Curated Mysuru experiences including heritage walks, culinary journeys, pottery, nature trails and bespoke royal expeditions.",
      },
      {
        "@id": offerCatalogId,
        "@type": "OfferCatalog",
        name: "Curated Mysuru Experiences",
        itemListElement: categories.map((name) => ({
          "@type": "OfferCatalog",
          name,
          url: `${SITE_URL}/experiences`,
        })),
      },
      {
        "@type": "ItemList",
        name: "Featured experiences",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: experiences.length,
        itemListElement: experiences.map((exp, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}/experiences/${exp.slug}`,
          item: {
            "@type": "TouristTrip",
            name: exp.title,
            description: exp.description,
            touristType: "Cultural traveller",
            provider: { "@id": organizationId },
            offers: {
              "@type": "Offer",
              price: exp.pricePerPerson,
              priceCurrency: exp.currencySymbol === "₹" ? "INR" : "EUR",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/experiences/${exp.slug}`,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: exp.rating,
              reviewCount: exp.reviewsCount,
            },
          },
        })),
      },
      ...categories.map((name) => ({
        "@type": "Service",
        name,
        serviceType: "Curated travel experience",
        provider: { "@id": organizationId },
        areaServed: {
          "@type": "City",
          name: "Mysuru",
          address: {
            "@type": "PostalAddress",
            addressRegion: "Karnataka",
            addressCountry: "IN",
          },
        },
      })),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Experiences",
            item: `${SITE_URL}/experiences`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Contact",
            item: `${SITE_URL}/contact`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What does The Royal Passage offer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The Royal Passage curates premium local experiences around Mysuru, including heritage walks, culinary courses, pottery, nature walks and bespoke expeditions.",
            },
          },
          {
            "@type": "Question",
            name: "Where is The Royal Passage located?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The Royal Passage is based at 5th Cross Road, Saraswathipuram, Mysuru, Karnataka 570009.",
            },
          },
          {
            "@type": "Question",
            name: "How can I contact The Royal Passage?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `You can call or WhatsApp ${CONTACT_PHONE}, or email ${CONTACT_EMAIL}.`,
            },
          },
        ],
      },
    ],
  };
}

export function buildContactJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${SITE_URL}/#organization`,
        "@type": ["Organization", "TravelAgency", "LocalBusiness"],
        name: SITE_NAME,
        url: SITE_URL,
        telephone: CONTACT_PHONE,
        email: CONTACT_EMAIL,
        address: businessAddress,
        hasMap: MAPS_LINK,
      },
      {
        "@type": "ContactPage",
        name: `Contact ${SITE_NAME}`,
        url: `${SITE_URL}/contact`,
        about: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contact",
            item: `${SITE_URL}/contact`,
          },
        ],
      },
    ],
  };
}
