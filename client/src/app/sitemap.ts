import { MetadataRoute } from "next";

const baseUrl = "http:localhost//3000";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
    },
  ];
}
