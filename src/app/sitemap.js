import { siteConfig } from "@/config/site";

export default function sitemap() {
  /* in-page anchors ("/#cta") aren't their own URLs, so they stay out of the sitemap */
  const routes = [
    "",
    ...siteConfig.nav.map((n) => n.href).filter((h) => h !== "/" && !h.includes("#")),
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
