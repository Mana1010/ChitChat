import { MetadataRoute } from "next";

// const baseUrl = "http:localhost//3000";
const BASE_URL = "https://chit-chat-omega-dun.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
    },
  ];
}
