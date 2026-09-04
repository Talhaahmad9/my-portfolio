export interface SkillMigrationCandidate {
  name: string;
  slug: string;
  category: string;
  displayOrder: number;
  publicationStatus: "published";
  provenance: "DATABASE" | "USER_SUPPLIED" | "BOTH";
}

export interface SiteSettingsMigrationCandidate {
  key: "main";
  identity: {
    fullName: string;
    primaryTitle: string;
    tagline?: string;
    location?: string;
  };
  hero: {
    headline: string;
    roleLabels: string[];
  };
  about: {
    heading: string;
    body: string[];
    highlights: string[];
  };
  contact: {
    email: string;
  };
  socials: Array<{
    platform: string;
    url: string;
    displayOrder: number;
  }>;
  navigation: [];
  footer: Record<string, unknown>;
}

export const LOCKED_SKILL_CANDIDATES: SkillMigrationCandidate[] = [
  // Languages
  {
    name: "JavaScript",
    slug: "javascript",
    category: "Languages",
    displayOrder: 1,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "TypeScript",
    slug: "typescript",
    category: "Languages",
    displayOrder: 2,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Python",
    slug: "python",
    category: "Languages",
    displayOrder: 3,
    publicationStatus: "published",
    provenance: "BOTH",
  },
  // Frontend
  {
    name: "React",
    slug: "react",
    category: "Frontend",
    displayOrder: 4,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Next.js",
    slug: "nextjs",
    category: "Frontend",
    displayOrder: 5,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Tailwind CSS",
    slug: "tailwindcss",
    category: "Frontend",
    displayOrder: 6,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Framer Motion",
    slug: "framer-motion",
    category: "Frontend",
    displayOrder: 7,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Zustand",
    slug: "zustand",
    category: "Frontend",
    displayOrder: 8,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  // Backend
  {
    name: "Node.js",
    slug: "nodejs",
    category: "Backend",
    displayOrder: 9,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "REST APIs",
    slug: "rest-apis",
    category: "Backend",
    displayOrder: 10,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Socket.IO",
    slug: "socket-io",
    category: "Backend",
    displayOrder: 11,
    publicationStatus: "published",
    provenance: "BOTH",
  },
  {
    name: "NextAuth.js",
    slug: "nextauth",
    category: "Backend",
    displayOrder: 12,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "JWT",
    slug: "jwt",
    category: "Backend",
    displayOrder: 13,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "OAuth 2.0",
    slug: "oauth-2-0",
    category: "Backend",
    displayOrder: 14,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  // Databases
  {
    name: "MongoDB",
    slug: "mongodb",
    category: "Databases",
    displayOrder: 15,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "PostgreSQL",
    slug: "postgresql",
    category: "Databases",
    displayOrder: 16,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Supabase",
    slug: "supabase",
    category: "Databases",
    displayOrder: 17,
    publicationStatus: "published",
    provenance: "BOTH",
  },
  // AI Integration
  {
    name: "Pydantic",
    slug: "pydantic",
    category: "AI Integration",
    displayOrder: 18,
    publicationStatus: "published",
    provenance: "USER_SUPPLIED",
  },
  {
    name: "LangGraph",
    slug: "langgraph",
    category: "AI Integration",
    displayOrder: 19,
    publicationStatus: "published",
    provenance: "BOTH",
  },
  {
    name: "LangChain",
    slug: "langchain",
    category: "AI Integration",
    displayOrder: 20,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Vercel AI SDK",
    slug: "vercel-ai-sdk",
    category: "AI Integration",
    displayOrder: 21,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Google Gemini",
    slug: "google-gemini",
    category: "AI Integration",
    displayOrder: 22,
    publicationStatus: "published",
    provenance: "BOTH",
  },
  {
    name: "RAG Pipelines",
    slug: "rag-pipelines",
    category: "AI Integration",
    displayOrder: 23,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  // Infrastructure
  {
    name: "Vercel",
    slug: "vercel",
    category: "Infrastructure",
    displayOrder: 24,
    publicationStatus: "published",
    provenance: "BOTH",
  },
  {
    name: "Railway",
    slug: "railway",
    category: "Infrastructure",
    displayOrder: 25,
    publicationStatus: "published",
    provenance: "BOTH",
  },
  {
    name: "Cloudflare R2",
    slug: "cloudflare-r2",
    category: "Infrastructure",
    displayOrder: 26,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "GitHub",
    slug: "github",
    category: "Infrastructure",
    displayOrder: 27,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "CI/CD",
    slug: "cicd",
    category: "Infrastructure",
    displayOrder: 28,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  // Integrations
  {
    name: "Meta WhatsApp API",
    slug: "whatsapp-api",
    category: "Integrations",
    displayOrder: 29,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Resend",
    slug: "resend",
    category: "Integrations",
    displayOrder: 30,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Leopard Courier API",
    slug: "leopard-courier-api",
    category: "Integrations",
    displayOrder: 31,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  // Data Science
  {
    name: "Pandas",
    slug: "pandas",
    category: "Data Science",
    displayOrder: 32,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "NumPy",
    slug: "numpy",
    category: "Data Science",
    displayOrder: 33,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
  {
    name: "Microsoft Excel",
    slug: "excel",
    category: "Data Science",
    displayOrder: 34,
    publicationStatus: "published",
    provenance: "DATABASE",
  },
];
