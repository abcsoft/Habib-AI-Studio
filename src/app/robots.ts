import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/generate",
        "/billing",
        "/settings",
        "/styleguide",
        "/demo",
        "/projects",
        "/campaigns",
        "/brands",
        "/creatives",
        "/history",
        "/usage",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
