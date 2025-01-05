import { MetadataRoute } from "next";

// const BASE_URL = "http:localhost//3000";
const BASE_URL = "https://chit-chat-omega-dun.vercel.app";
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
