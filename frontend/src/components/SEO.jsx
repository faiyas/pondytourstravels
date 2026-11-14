import { useEffect } from "react";

const SITE_URL = "https://pondytourstravels.com";
const DEFAULT_IMAGE = `${SITE_URL}/images/vehicle/innova-crysta.png`;
const LOGO_IMAGE = `${SITE_URL}/images/logo/dark.png`;

function setMeta(selector, attr, value) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    const match = selector.match(/\[(name|property)="([^"]+)"\]/);
    if (match) {
      tag.setAttribute(match[1], match[2]);
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute(attr, value);
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function setJsonLd(id, data) {
  const scriptId = `jsonld-${id}`;
  let script = document.head.querySelector(`#${scriptId}`);
  if (!data) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export default function SEO({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;

    document.title = title;
    setCanonical(url);

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");

    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:image"]', "content", image);

    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", image);

    setJsonLd("page", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      publisher: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Pondy Tours & Travels",
        logo: {
          "@type": "ImageObject",
          url: LOGO_IMAGE,
          contentUrl: LOGO_IMAGE,
        },
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: image,
      },
      inLanguage: "en-IN",
    });

    setJsonLd("custom", jsonLd);
  }, [description, image, jsonLd, noindex, path, title, type]);

  return null;
}
