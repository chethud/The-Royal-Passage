import type { Experience } from "@/data/experiences";

export const SITE_URL = "https://theroyalpassage.com";
export const SITE_NAME = "The Royal Passage";
export const CONTACT_EMAIL = "prajwalbp500@gmail.com";
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

export function buildHomeJsonLd(experiences: Experience[]) {
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
        primaryImageOfPage: `${SITE_URL}/og-image.jpg`,
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
              text: "You can call or WhatsApp +91 729588826, or email prajwalbp500@gmail.com.",
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
