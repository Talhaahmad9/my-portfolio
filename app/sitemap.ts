import type { MetadataRoute } from "next";
import { getPublishedProjectsForPublic } from "@/lib/public/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://talhaahmad.me";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/cv`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const projects = await getPublishedProjectsForPublic();
    const caseStudyRoutes: MetadataRoute.Sitemap = projects
      .filter((p) => p.hasCaseStudy && p.slug)
      .map((p) => ({
        url: `${baseUrl}/projects/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...caseStudyRoutes];
  } catch (error) {
    console.error("Failed to generate project sitemap entries:", error);
    return staticRoutes;
  }
}
