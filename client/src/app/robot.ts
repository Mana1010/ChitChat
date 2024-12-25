import { MetadataRoute } from "next";

const BASE_URL = "http:localhost//3000";
export default function robot(): MetadataRoute.Robots {
  const PROTECTED_ROUTES = ["/chats/*", "/mailbox/*"];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PROTECTED_ROUTES,
    },
    sitemap: `${BASE_URL}/sitemap/xml`,
  };
}
