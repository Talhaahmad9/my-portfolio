import mongoose, { Document, Model, Schema } from "mongoose";

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface IAchievement {
  title: string;
  event: string;
  place: string;
  score?: string;
  description?: string;
  liveUrl?: string;
  githubUrl?: string;
  stack: string[];
}

export interface ISkillGroup {
  category: string;
  items: string[];
}

export interface ICertification {
  publicId?: string;
  name: string;
  issuer: string;
  imageUrl?: string;
}

// ─── Main interface ───────────────────────────────────────────────────────────

export interface ISiteConfig extends Document {
  key: string; // always "main" — singleton
  hero: {
    tagline: string;
    typewriterStrings: string[];
  };
  about: {
    heading: string;
    bio: string;
    bullets: string[];
    achievements: IAchievement[];
    skills: ISkillGroup[];
    certifications: ICertification[];
  };
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const AchievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true },
    event: { type: String, required: true },
    place: { type: String, required: true },
    score: { type: String },
    description: { type: String },
    liveUrl: { type: String },
    githubUrl: { type: String },
    stack: { type: [String], default: [] },
  },
  { _id: false }
);

const SkillGroupSchema = new Schema<ISkillGroup>(
  {
    category: { type: String, required: true },
    items: { type: [String], default: [] },
  },
  { _id: false }
);

const CertificationSchema = new Schema<ICertification>(
  {
    publicId: { type: String },
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const SiteConfigSchema = new Schema<ISiteConfig>({
  key: { type: String, required: true, unique: true, default: "main" },
  hero: {
    tagline: {
      type: String,
      default:
        "I build intelligent systems and high-performance web applications — from fine-tuned LLMs to production-ready Next.js products.",
    },
    typewriterStrings: {
      type: [String],
      default: [
        "Full Stack Developer",
        "GenAI Specialist",
        "LLM Engineer",
        "Next.js Developer",
        "AI Agent Builder",
      ],
    },
  },
  about: {
    heading: {
      type: String,
      default: "Full-Stack Developer",
    },
    bio: {
      type: String,
      default: "",
    },
    bullets: {
      type: [String],
      default: [],
    },
    achievements: { type: [AchievementSchema], default: [] },
    skills: { type: [SkillGroupSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
  },
});

// ─── Model (safe re-use in Next.js hot-reload) ────────────────────────────────

let SiteConfigModel: Model<ISiteConfig>;

try {
  SiteConfigModel = mongoose.model<ISiteConfig>("SiteConfig");
} catch {
  SiteConfigModel = mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);
}

export { SiteConfigModel };

// ─── Default values (used as fallback when no DB doc exists) ─────────────────

export const DEFAULT_SITE_CONFIG = {
  hero: {
    tagline:
      "I build intelligent systems and high-performance web applications — from fine-tuned LLMs to production-ready Next.js products.",
    typewriterStrings: [
      "Full Stack Developer",
      "GenAI Specialist",
      "LLM Engineer",
      "Next.js Developer",
      "AI Agent Builder",
    ],
  },
  about: {
    heading: "Full-Stack Developer",
    bio: `I'm Talha Ahmad — a Full Stack Developer and GenAI Specialist, and Computer Science student at the Institute of Business Management (IoBM), Karachi, expected to graduate in 2027.\n\nI build production-grade web applications and intelligent AI systems end-to-end — from fine-tuned LLM pipelines to fully-deployed Next.js products. My current focus is AI agent architecture and LLM orchestration, with a growing body of work in multi-agent GenAI frameworks.\n\nMost recently, I won 1st place at Hackfest × Datathon 2026 hosted by IBA Karachi — building a multi-agent narrative simulation engine using LangGraph and Google Gemini 2.0 Flash, scoring 88/100 against teams from leading Pakistani universities.\n\nI'm open to remote roles in AI engineering, full-stack development, or GenAI product teams.`,
    bullets: [],
    achievements: [
      {
        title: "Hackfest × Datathon 2026",
        event: "IBA Karachi",
        place: "1st Place",
        score: "88/100",
        description: "Multi-Agent Narrative Simulation Engine",
        liveUrl: "",
        githubUrl: "",
        stack: ["LangGraph", "Gemini 2.0 Flash", "Python", "Next.js"],
      },
    ],
    skills: [
      {
        category: "AI & GenAI",
        items: [
          "LangGraph",
          "LangChain",
          "Google Gemini API",
          "Multi-Agent Systems",
          "LLM Orchestration",
          "Prompt Engineering",
          "Chain-of-Thought Reasoning",
        ],
      },
      {
        category: "Frontend",
        items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "CSS Modules"],
      },
      {
        category: "Backend & Data",
        items: ["Node.js", "REST APIs", "Supabase", "MongoDB Atlas", "Python", "Pydantic"],
      },
      {
        category: "Auth & Security",
        items: ["Clerk", "OAuth / Google Login", "JWT"],
      },
      {
        category: "Deployment & Tools",
        items: ["Vercel", "Git / GitHub", "UV", "Hostinger DNS"],
      },
    ],
    certifications: [
      {
        publicId: "cert_0f3c8e45a1b2d4e6c7f80911",
        name: "React – The Complete Guide (incl. Next.js, Redux)",
        issuer: "Udemy",
      },
      {
        publicId: "cert_1a4d9f52b3c6e7d8f9011223",
        name: "CSS – The Complete Guide (incl. Flexbox, Grid & Sass)",
        issuer: "Udemy",
      },
      {
        publicId: "cert_2b5e0a63c4d7f8e9a0122334",
        name: "The Complete Full-Stack Web Development Bootcamp",
        issuer: "Udemy",
      },
    ],
  },
} as const;
