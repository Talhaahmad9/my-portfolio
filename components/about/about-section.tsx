import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";

// ─── Skill categories derived from resume ─────────────────────────────────────

const skills = [
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
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutSection() {
  return (
    <SectionWrapper
      id="about"
      className="py-24 px-6 bg-black"
    >
      <div className="mx-auto max-w-6xl">

        {/* Section heading */}
        <SectionItem>
          <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb mb-2">
            About Me
          </p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Full-Stack AI Engineer
          </h2>
        </SectionItem>

        {/* Two-column: bio left, achievement card right */}
        <div className="mt-12 grid gap-10 lg:grid-cols-2">

          {/* Bio */}
          <SectionItem>
            <div className="space-y-5 text-platinum leading-relaxed">
              <p>
                I&apos;m Talha Ahmad — a Full-Stack AI Engineer and Computer
                Science student at the{" "}
                <span className="text-white font-medium">
                  Institute of Business Management (IoBM), Karachi
                </span>
                , expected to graduate in 2027.
              </p>
              <p>
                I build production-grade web applications and intelligent AI
                systems end-to-end — from fine-tuned LLM pipelines to
                fully-deployed Next.js products. My current focus is{" "}
                <span className="text-orangeWeb font-medium">
                  AI agent architecture and LLM orchestration
                </span>
                , with a growing body of work in multi-agent GenAI frameworks.
              </p>
              <p>
                Most recently, I won{" "}
                <span className="text-white font-medium">
                  1st place at Hackfest × Datathon 2026
                </span>{" "}
                hosted by IBA Karachi — building a multi-agent narrative
                simulation engine using LangGraph and Google Gemini 2.0 Flash,
                scoring 88/100 against teams from leading Pakistani universities.
              </p>
              <p>
                I&apos;m open to remote roles in AI engineering, full-stack
                development, or GenAI product teams.
              </p>
            </div>
          </SectionItem>

          {/* Achievement highlight card */}
          <SectionItem>
            <div className="rounded-lg border border-orangeWeb/30 bg-oxfordBlue p-6 h-full">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🏆</span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-orangeWeb mb-1">
                    Recent Achievement
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    Hackfest × Datathon 2026
                  </h3>
                  <p className="text-sm text-platinum mt-1">
                    Hosted by IBA Karachi
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-platinum">
                    <p>
                      <span className="text-white font-medium">Score:</span> 88 / 100
                    </p>
                    <p>
                      <span className="text-white font-medium">Result:</span> 1st Place
                    </p>
                    <p>
                      <span className="text-white font-medium">Project:</span> Multi-Agent
                      Narrative Simulation Engine
                    </p>
                    <p>
                      <span className="text-white font-medium">Stack:</span> LangGraph ·
                      Gemini 2.0 Flash · Python · Next.js
                    </p>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="mt-6 pt-6 border-t border-platinum/10">
                <p className="text-xs font-medium uppercase tracking-widest text-orangeWeb mb-3">
                  Education
                </p>
                <p className="text-sm text-white font-medium">
                  BS Computer Science — IoBM, Karachi
                </p>
                <p className="text-sm text-platinum mt-1">
                  Sep 2023 – Present · Expected 2027
                </p>
              </div>
            </div>
          </SectionItem>
        </div>

        {/* Skills grid */}
        <div className="mt-16">
          <SectionItem>
            <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb mb-8">
              Technical Skills
            </p>
          </SectionItem>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((group) => (
              <SectionItem key={group.category}>
                <div className="rounded-lg bg-oxfordBlue p-5 h-full">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-orangeWeb mb-4">
                    {group.category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-platinum/15 bg-black px-3 py-1 text-xs text-platinum"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </SectionItem>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-16">
          <SectionItem>
            <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb mb-6">
              Certifications
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "React – The Complete Guide (incl. Next.js, Redux) — Udemy",
                "CSS – The Complete Guide (incl. Flexbox, Grid & Sass) — Udemy",
                "The Complete Full-Stack Web Development Bootcamp — Udemy",
              ].map((cert) => (
                <div
                  key={cert}
                  className="flex items-start gap-3 rounded-lg border border-platinum/10 bg-oxfordBlue px-4 py-3"
                >
                  <span className="mt-0.5 text-orangeWeb shrink-0">✓</span>
                  <p className="text-sm text-platinum">{cert}</p>
                </div>
              ))}
            </div>
          </SectionItem>
        </div>

      </div>
    </SectionWrapper>
  );
}
