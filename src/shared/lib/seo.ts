import type { Metadata, Viewport } from "next";

// 1. Centralized SEO Configurations
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ktcn.itup.io.vn";

export const SEO_CONFIG = {
  applicationName: "Cổng thông tin Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
  themeColor: "#0f2950", // Navy Blue color matching the school identity
  colorScheme: "light" as const,
  defaultKeywords: [
    "trường kỹ thuật và công nghệ",
    "đại học vinh",
    "kỹ thuật và công nghệ đại học vinh",
    "công nghệ thông tin đại học vinh",
    "tự động hóa đại học vinh",
    "kỹ thuật ô tô đại học vinh",
    "công nghệ nhiệt đại học vinh",
    "điện tử đại học vinh",
    "khoa học máy tính",
    "tuyển sinh kỹ thuật công nghệ",
    "set vinhuni",
    "college of engineering and technology vinh university"
  ],
  authors: [
    { name: "CLB ITUP", url: "https://www.facebook.com/itup.binhdanhocvuso.dhv/" }
  ],
  creator: "CLB ITUP",
  publisher: "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
  googleVerification: "Siki4bEf5Hnv5qu8KHanq-b7bTQE_9U0lPMj2sOddbs",
  fallbackOgImage: `${BASE_URL}/images/logo.png`, // Fallback to official logo if no post image exists
};

// Common Viewport Export to be reused in layouts
export const defaultViewport: Viewport = {
  themeColor: SEO_CONFIG.themeColor,
  colorScheme: SEO_CONFIG.colorScheme,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

interface MetadataOptions {
  title: string;
  description: string;
  slug?: string; // Path or slug of the page
  locale?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  alternatesLanguages?: { [key: string]: string }; // Map language code to localized slug
  robots?: string | string[] | any; // Custom robots settings
}

// 2. Main Metadata Constructor function
export function constructMetadata(options: MetadataOptions): Metadata {
  const locale = options.locale || "vi";
  const isEn = locale === "en";
  const siteUrl = BASE_URL;

  // Format Title
  const siteName = isEn 
    ? "SET VinhUni - College of Engineering and Technology" 
    : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh";
  
  const titleFormatted = options.slug 
    ? `${options.title} | ${isEn ? "SET VinhUni" : "Trường Kỹ thuật và Công nghệ"}`
    : options.title;

  const description = options.description;
  
  // Resolve canonical path based on localized slug or standard slug
  let pagePath = options.slug ? options.slug.replace(/^\/+/, "") : "";
  if (options.alternatesLanguages && options.alternatesLanguages[locale]) {
    pagePath = options.alternatesLanguages[locale].replace(/^\/+/, "");
  }
  const canonicalUrl = pagePath ? `${siteUrl}/${locale}/${pagePath}` : `${siteUrl}/${locale}`;

  // Image resolution: make sure it is absolute
  let ogImage = options.image || SEO_CONFIG.fallbackOgImage;
  if (ogImage && !ogImage.startsWith("http")) {
    ogImage = `${siteUrl}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`;
  }

  // Keywords merging
  const keywords = options.keywords 
    ? [...options.keywords, ...SEO_CONFIG.defaultKeywords]
    : SEO_CONFIG.defaultKeywords;

  // Build alternates languages
  const alternatesLanguages: { [key: string]: string } = {};
  if (options.alternatesLanguages) {
    Object.entries(options.alternatesLanguages).forEach(([lang, langSlug]) => {
      alternatesLanguages[lang] = `${siteUrl}/${lang}/${langSlug.replace(/^\/+/, "")}`;
    });
    if (options.alternatesLanguages.vi) {
      alternatesLanguages["x-default"] = `${siteUrl}/vi/${options.alternatesLanguages.vi.replace(/^\/+/, "")}`;
    }
  } else {
    alternatesLanguages.vi = options.slug ? `${siteUrl}/vi/${options.slug.replace(/^\/+/, "")}` : `${siteUrl}/vi`;
    alternatesLanguages.en = options.slug ? `${siteUrl}/en/${options.slug.replace(/^\/+/, "")}` : `${siteUrl}/en`;
    alternatesLanguages["x-default"] = options.slug ? `${siteUrl}/vi/${options.slug.replace(/^\/+/, "")}` : `${siteUrl}/vi`;
  }

  // Dynamically resolve robots settings
  let robotsConfig = {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  };

  if (options.robots) {
    if (typeof options.robots === "string") {
      const isNoIndex = options.robots.includes("noindex");
      const isNoFollow = options.robots.includes("nofollow");
      robotsConfig = {
        index: !isNoIndex,
        follow: !isNoFollow,
        googleBot: {
          index: !isNoIndex,
          follow: !isNoFollow,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      };
    } else if (Array.isArray(options.robots)) {
      const isNoIndex = options.robots.includes("noindex");
      const isNoFollow = options.robots.includes("nofollow");
      robotsConfig = {
        index: !isNoIndex,
        follow: !isNoFollow,
        googleBot: {
          index: !isNoIndex,
          follow: !isNoFollow,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      };
    } else {
      robotsConfig = options.robots;
    }
  }

  return {
    title: {
      default: titleFormatted,
      template: `%s | ${isEn ? "SET VinhUni" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh"}`,
    },
    description: description,
    keywords: keywords,
    applicationName: SEO_CONFIG.applicationName,
    authors: SEO_CONFIG.authors,
    creator: SEO_CONFIG.creator,
    publisher: SEO_CONFIG.publisher,
    metadataBase: new URL(siteUrl),
    category: "Education",
    alternates: {
      canonical: canonicalUrl,
      languages: alternatesLanguages,
    },
    robots: robotsConfig,
    openGraph: {
      title: titleFormatted,
      description: description,
      url: canonicalUrl,
      siteName: siteName,
      locale: isEn ? "en_US" : "vi_VN",
      type: options.type || "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
      ...(options.type === "article" && {
        publishedTime: options.publishedTime,
        modifiedTime: options.modifiedTime,
        authors: options.authors || [SEO_CONFIG.creator],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: titleFormatted,
      description: description,
      images: [ogImage],
      creator: "@itup_vinhuni", // Replace with actual Twitter handle of the school if any
    },
    verification: {
      google: SEO_CONFIG.googleVerification,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/images/logo-32.png", sizes: "32x32", type: "image/png" },
        { url: "/images/logo-192.png", sizes: "192x192", type: "image/png" },
        { url: "/images/logo-512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
      apple: [
        { url: "/images/logo-180.png", sizes: "180x180", type: "image/png" },
      ],
    },
  };
}

// 3. Schema.org Structured Data Generators (JSON-LD)

// WebSite & SearchAction Schema for search results optimization
export function buildWebSiteSchema(locale: string = "vi") {
  const isEn = locale === "en";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/${locale}#website`,
    "name": isEn ? "College of Engineering and Technology - Vinh University" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
    "alternateName": isEn 
      ? ["SET VinhUni", "College of Engineering and Technology"]
      : ["Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh", "Trường Kỹ thuật và Công nghệ", "SET VinhUni"],
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/${locale}/${isEn ? "search" : "tim-kiem"}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// EducationalOrganization Schema (System-wide representation of the College)
export function buildOrganizationSchema(locale: string = "vi") {
  const isEn = locale === "en";
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${BASE_URL}/${locale}#organization`,
    "name": isEn ? "College of Engineering and Technology - Vinh University" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
    "alternateName": ["SET VinhUni", "Trường Kỹ thuật và Công nghệ", "Viện Kỹ thuật và Công nghệ Trường Đại học Vinh"],
    "url": `${BASE_URL}/${locale}`,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/images/logo.png`,
      "width": "953",
      "height": "294"
    },
    "image": `${BASE_URL}/images/logo.png`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "182 Lê Duẩn",
      "addressLocality": "Vinh",
      "addressRegion": "Nghệ An",
      "postalCode": "43000",
      "addressCountry": "VN"
    },
    "telephone": "0238 3855 452",
    "email": "vienktcn@vinhuni.edu.vn",
    "sameAs": [
      "https://www.facebook.com/itup.binhdanhocvuso.dhv/",
      "https://vinhuni.edu.vn"
    ],
    "parentOrganization": {
      "@type": "EducationalOrganization",
      "name": "Trường Đại học Vinh",
      "url": "https://vinhuni.edu.vn"
    }
  };
}

// BreadcrumbList Schema for navigation history
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

// Article / NewsArticle Schema for news detail pages
interface ArticleSchemaOptions {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  slug: string;
  locale: string;
  categoryName?: string;
}

export function buildArticleSchema(options: ArticleSchemaOptions) {
  const imageResolved = options.image || SEO_CONFIG.fallbackOgImage;
  const canonicalUrl = `${BASE_URL}/${options.locale}/${options.slug}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${canonicalUrl}#article`,
    "isPartOf": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "headline": options.title,
    "description": options.description,
    "image": imageResolved.startsWith("http") ? imageResolved : `${BASE_URL}${imageResolved}`,
    "datePublished": options.datePublished,
    "dateModified": options.dateModified || options.datePublished,
    "author": {
      "@type": "Person",
      "name": options.authorName
    },
    "publisher": {
      "@type": "EducationalOrganization",
      "name": options.locale === "en" ? "College of Engineering and Technology - Vinh University" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/images/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "articleSection": options.categoryName || "News"
  };
}

// Person Schema (specifically for lecturer / faculty profiles)
interface PersonSchemaOptions {
  name: string;
  jobTitle?: string;
  email?: string;
  telephone?: string;
  image?: string;
  slug: string;
  locale: string;
  description?: string;
  worksFor?: string;
}

export function buildPersonSchema(options: PersonSchemaOptions) {
  const canonicalUrl = `${BASE_URL}/${options.locale}/nhan-su/${options.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${canonicalUrl}#person`,
    "name": options.name,
    "jobTitle": options.jobTitle || "Giảng viên",
    "worksFor": {
      "@type": "EducationalOrganization",
      "name": options.worksFor || (options.locale === "en" ? "College of Engineering and Technology - Vinh University" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh")
    },
    "email": options.email || undefined,
    "telephone": options.telephone || undefined,
    "image": options.image ? (options.image.startsWith("http") ? options.image : `${BASE_URL}${options.image}`) : undefined,
    "url": canonicalUrl,
    "description": options.description || undefined
  };
}

// Course / Program Schema (for training degrees/majors)
interface CourseSchemaOptions {
  name: string;
  description: string;
  provider?: string;
  courseCode?: string;
  locale: string;
}

export function buildCourseSchema(options: CourseSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": options.name,
    "description": options.description,
    "provider": {
      "@type": "EducationalOrganization",
      "name": options.provider || (options.locale === "en" ? "College of Engineering and Technology - Vinh University" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh"),
      "url": `${BASE_URL}/${options.locale}`
    },
    "courseCode": options.courseCode || undefined
  };
}

// FAQ Schema for informational pages (like admission advice)
export function buildFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map((q) => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };
}
