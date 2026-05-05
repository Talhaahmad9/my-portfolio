export type Project = {
  title: string;
  description: string;
  bullets: string[];
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  badge?: string; // e.g. "1st Place — Hackfest x IBA 2026"
};

export const PROJECTS: Project[] = [
  {
    title: "Multi-Agent Narrative Simulation Engine",
    description:
      "A production-grade multi-agent GenAI framework built for Hackfest × Datathon 2026 hosted by IBA Karachi. Secured 1st place with a score of 88/100 among teams from leading Pakistani universities.",
    bullets: [
      "Designed a Director-Agent architecture using LangGraph to manage narrative pacing and logical consistency across multiple collaborating AI agents.",
      "Engineered a global Entity-Ownership Registry that eliminates narrative hallucinations by enforcing canonical facts across all agents.",
      "Built an Action Handshaking Protocol ensuring cause-effect continuity across 7+ unique non-verbal character interactions per story.",
      "Integrated a Thought-Action-Dialogue (TAD) Loop providing full Chain-of-Thought reasoning transparency for every agent decision.",
    ],
    tags: ["LangGraph", "Gemini 2.0 Flash", "Python", "Multi-Agent", "Next.js"],
    githubUrl: "https://github.com/Talhaahmad9/GenAi_DSS",
    badge: "1st Place — Hackfest × Datathon - IBA 2026",
  },
  {
    title: "Vestra — E-Commerce Platform",
    description:
      "Full-stack e-commerce web application for a clothing brand, live in production and handling real orders.",
    bullets: [
      "Built and deployed a full-stack e-commerce app currently live at vestrapk.com handling real customer orders.",
      "Developed an admin panel for complete product, order, and inventory management with real-time updates.",
      "Integrated Leopard's Courier API for automated order processing and shipping workflows.",
      "Managed end-to-end deployment pipeline using GitHub, Vercel, and Hostinger DNS.",
    ],
    tags: ["Next.js", "Tailwind CSS", "Supabase", "REST APIs", "Vercel"],
    liveUrl: "https://vestrapk.com",
  },
  {
    title: "LostNFound",
    description:
      "A modern Lost & Found web app for reporting, searching, and managing lost or found items with real-time search and user authentication.",
    bullets: [
      "Built real-time item search and filtering with MongoDB Atlas full-text indexes.",
      "Integrated Clerk for OAuth / Google Login with protected routes and session management.",
      "Implemented SEO best practices — sitemap, robots.txt, and meta tags.",
      "Deployed on Vercel with custom domain configuration.",
    ],
    tags: ["Next.js", "MongoDB", "Tailwind CSS", "Clerk", "Vercel"],
    liveUrl: "https://lostndfound.site",
    githubUrl: "https://github.com/Talhaahmad9/lostndfound",
  },
  {
    title: "Foodie App",
    description:
      "A food-sharing web app where users can browse, view, and share detailed meal recipes with images and creator info.",
    bullets: [
      "Implemented server-side rendering and SEO-friendly dynamic metadata per meal page.",
      "Built modular React component architecture with CSS Modules for scoped styling.",
      "Added image upload support and dynamic routing for individual meal detail pages.",
    ],
    tags: ["Next.js", "SSR", "CSS Modules", "Node.js"],
    githubUrl: "https://github.com/Talhaahmad9/foodie-app",
  },
];
