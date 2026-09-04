export interface ProjectMigrationTarget {
  id: string;
  expectedTitle: string;
  slug: string;
  publicationStatus: "published";
  copyDescriptionToShortDescription: boolean;
  requiredSkillSlugs: string[];
}

export const LOCKED_PROJECT_TARGETS: ProjectMigrationTarget[] = [
  {
    id: "69fae5d7da84ac20e090e2e6",
    expectedTitle: "StayDue",
    slug: "staydue",
    publicationStatus: "published",
    copyDescriptionToShortDescription: true,
    requiredSkillSlugs: [
      "nextjs",
      "typescript",
      "mongodb",
      "nextauth",
      "whatsapp-api",
      "resend",
      "cloudflare-r2",
      "vercel",
    ],
  },
  {
    id: "69faf5a124fd83a947ffca15",
    expectedTitle: "NextForge",
    slug: "nextforge",
    publicationStatus: "published",
    copyDescriptionToShortDescription: false,
    requiredSkillSlugs: ["nextjs"],
  },
  {
    id: "69fb37a076733bcff41bd19b",
    expectedTitle: "Talha Ahmad - Personal Portfolio Website",
    slug: "talha-ahmad-personal-portfolio-website",
    publicationStatus: "published",
    copyDescriptionToShortDescription: false,
    requiredSkillSlugs: [],
  },
  {
    id: "69faf415c176385097cea33f",
    expectedTitle: "Market Mayhem",
    slug: "market-mayhem",
    publicationStatus: "published",
    copyDescriptionToShortDescription: false,
    requiredSkillSlugs: ["socket-io", "supabase", "railway", "vercel"],
  },
  {
    id: "69faf2cfc176385097cea33e",
    expectedTitle: "Multi-Agent Simulation Engine",
    slug: "multi-agent-simulation-engine",
    publicationStatus: "published",
    copyDescriptionToShortDescription: false,
    requiredSkillSlugs: ["python", "langgraph", "google-gemini", "pydantic"],
  },
  {
    id: "69faf67ca984f539da534b3c",
    expectedTitle: "Vestra",
    slug: "vestra",
    publicationStatus: "published",
    copyDescriptionToShortDescription: true,
    requiredSkillSlugs: [
      "nextjs",
      "supabase",
      "tailwindcss",
      "leopard-courier-api",
      "vercel",
    ],
  },
];

// Derive unique required Skill slug union across all project candidates
export const REQUIRED_SKILL_SLUGS_UNION: string[] = Array.from(
  new Set(LOCKED_PROJECT_TARGETS.flatMap((p) => p.requiredSkillSlugs))
).sort();
