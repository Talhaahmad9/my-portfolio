"use client";

import React, { useState } from "react";
import type { IProject } from "@/lib/db/models/Project";
import { Pencil, Plus, Trash2, X, Image as ImageIcon, Sparkles, ExternalLink, Code2, Layers, BookOpen, Search } from "lucide-react";
import { createProject, deleteProject, updateProject } from "@/actions/projects";
import Toast from "@/components/admin/Toast";
import { useToast } from "@/components/admin/useToast";
import { typography } from "@/lib/typography";
import { PublicationStatus } from "@/lib/cms/types";

type Mode = "list" | "form";
type FormTab = "live" | "canonical" | "relationships" | "casestudy" | "seo";

interface SkillOption {
  id: string;
  name: string;
  isArchived?: boolean;
}

interface RoleOption {
  id: string;
  roleTitle: string;
  organization: string;
  isArchived?: boolean;
}

interface ProjectsTabProps {
  projects: IProject[];
  allSkills?: SkillOption[];
  allRoles?: RoleOption[];
}

interface TechnicalDecisionForm {
  title: string;
  context: string;
  decision: string;
  consequencesStr: string;
}

interface TechnicalChallengeForm {
  title: string;
  problem: string;
  solution: string;
  impact: string;
}

interface MetricForm {
  label: string;
  value: string;
  change?: string;
}

interface ProjectFormState {
  // Live / Legacy
  title: string;
  liveUrl: string;
  githubUrl: string;
  badge: string;
  order: number;
  featured: boolean;
  imageFit: "cover" | "contain";
  existingImages: string[];
  newImages: File[];

  // Canonical V2
  slug: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  publicationStatus: PublicationStatus;
  projectType: string;
  category: string;
  documentationUrl: string;
  demoUrl: string;

  // Relationships
  selectedSkillIds: string[];
  selectedRoleIds: string[];

  // Case Study & Architecture
  architectureOverview: string;
  architectureDiagramUrl: string;
  outcomesStr: string;
  technicalDecisions: TechnicalDecisionForm[];
  challenges: TechnicalChallengeForm[];
  metrics: MetricForm[];

  // SEO
  metaTitle: string;
  metaDescription: string;
  keywordsStr: string;
}

const initialFormState: ProjectFormState = {
  title: "",
  liveUrl: "",
  githubUrl: "",
  badge: "",
  order: 0,
  featured: false,
  imageFit: "cover",
  existingImages: [],
  newImages: [],

  slug: "",
  tagline: "",
  shortDescription: "",
  longDescription: "",
  publicationStatus: "draft",
  projectType: "personal",
  category: "fullstack",
  documentationUrl: "",
  demoUrl: "",

  selectedSkillIds: [],
  selectedRoleIds: [],

  architectureOverview: "",
  architectureDiagramUrl: "",
  outcomesStr: "",
  technicalDecisions: [],
  challenges: [],
  metrics: [],

  metaTitle: "",
  metaDescription: "",
  keywordsStr: "",
};

function getProjectId(project: IProject): string {
  const maybeId = (project as unknown as { _id?: unknown })._id;
  return typeof maybeId === "string" ? maybeId : String(maybeId);
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toFormState(project: IProject): ProjectFormState {
  return {
    title: project.title ?? "",
    liveUrl: project.demoUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    badge: project.badge ?? "",
    order: project.displayOrder ?? 0,
    featured: project.isFeatured ?? false,
    imageFit: project.imageFit ?? "cover",
    existingImages: Array.isArray(project.images) ? project.images : [],
    newImages: [],

    slug: project.slug ?? generateSlug(project.title ?? ""),
    tagline: project.tagline ?? "",
    shortDescription: project.shortDescription ?? "",
    longDescription: project.longDescription ?? "",
    publicationStatus: project.publicationStatus ?? "draft",
    projectType: project.projectType ?? "personal",
    category: project.category ?? "fullstack",
    documentationUrl: project.documentationUrl ?? "",
    demoUrl: project.demoUrl ?? "",

    selectedSkillIds: (project.skillIds ?? []).map((id) => String(id)),
    selectedRoleIds: (project.roleIds ?? []).map((id) => String(id)),

    architectureOverview: project.architectureOverview ?? "",
    architectureDiagramUrl: project.architectureDiagramUrl ?? "",
    outcomesStr: (project.outcomes ?? []).join("\n"),
    technicalDecisions: (project.technicalDecisions ?? []).map((td) => ({
      title: td.title || "",
      context: td.context || "",
      decision: td.decision || "",
      consequencesStr: (td.consequences || []).join(", "),
    })),
    challenges: (project.challenges ?? []).map((tc) => ({
      title: tc.title || "",
      problem: tc.problem || "",
      solution: tc.solution || "",
      impact: tc.impact || "",
    })),
    metrics: (project.metrics ?? []).map((m) => ({
      label: m.label || "",
      value: m.value || "",
      change: m.change || "",
    })),

    metaTitle: project.seo?.metaTitle ?? "",
    metaDescription: project.seo?.metaDescription ?? "",
    keywordsStr: (project.seo?.keywords ?? []).join(", "),
  };
}

function buildSubmitFormData(form: ProjectFormState): FormData {
  const payload = new FormData();
  payload.set("title", form.title);
  payload.set("liveUrl", form.liveUrl);
  payload.set("githubUrl", form.githubUrl);
  payload.set("badge", form.badge);
  payload.set("order", String(form.order));
  payload.set("featured", form.featured ? "true" : "false");
  payload.set("imageFit", form.imageFit);
  payload.set("existingImages", JSON.stringify(form.existingImages));

  form.newImages.forEach((file) => {
    payload.append("images", file);
  });

  // Canonical V2
  payload.set("slug", form.slug);
  payload.set("tagline", form.tagline);
  payload.set("shortDescription", form.shortDescription);
  payload.set("longDescription", form.longDescription);
  payload.set("publicationStatus", form.publicationStatus);
  payload.set("projectType", form.projectType);
  payload.set("category", form.category);
  payload.set("documentationUrl", form.documentationUrl);
  payload.set("demoUrl", form.demoUrl);

  // Relationships
  payload.set("skillIds", JSON.stringify(form.selectedSkillIds));
  payload.set("roleIds", JSON.stringify(form.selectedRoleIds));

  // Case Study & Architecture
  payload.set("architectureOverview", form.architectureOverview);
  payload.set("architectureDiagramUrl", form.architectureDiagramUrl);

  const outcomesArray = form.outcomesStr
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  payload.set("outcomes", JSON.stringify(outcomesArray));

  const decisionsArray = form.technicalDecisions
    .filter((td) => td.title.trim() && td.decision.trim())
    .map((td) => ({
      title: td.title.trim(),
      context: td.context.trim() || td.title.trim(),
      decision: td.decision.trim(),
      consequences: td.consequencesStr
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0),
    }));
  payload.set("technicalDecisions", JSON.stringify(decisionsArray));

  const challengesArray = form.challenges
    .filter((tc) => tc.title.trim() && tc.problem.trim())
    .map((tc) => ({
      title: tc.title.trim(),
      problem: tc.problem.trim(),
      solution: tc.solution.trim() || tc.problem.trim(),
      impact: tc.impact.trim() || tc.title.trim(),
    }));
  payload.set("challenges", JSON.stringify(challengesArray));

  const metricsArray = form.metrics
    .filter((m) => m.label.trim() && m.value.trim())
    .map((m) => ({
      label: m.label.trim(),
      value: m.value.trim(),
      change: m.change?.trim() || undefined,
    }));
  payload.set("metrics", JSON.stringify(metricsArray));

  // SEO
  const keywordsArray = form.keywordsStr
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
  if (form.metaTitle.trim() || form.metaDescription.trim() || keywordsArray.length > 0) {
    payload.set(
      "seo",
      JSON.stringify({
        metaTitle: form.metaTitle.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined,
        keywords: keywordsArray,
      })
    );
  }

  return payload;
}

export default function ProjectsTab({ projects, allSkills = [], allRoles = [] }: ProjectsTabProps) {
  const [mode, setMode] = useState<Mode>("list");
  const [activeTab, setActiveTab] = useState<FormTab>("live");
  const [items, setItems] = useState<IProject[]>(projects);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Deletion modal & dependencies
  const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);
  const [deleteDependencies, setDeleteDependencies] = useState<{
    events?: Array<{ id: string; title: string }>;
    awards?: Array<{ id: string; title: string }>;
  } | null>(null);

  const [form, setForm] = useState<ProjectFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast, showToast, hideToast } = useToast();

  const startCreate = (): void => {
    setEditingId(null);
    setForm(initialFormState);
    setActiveTab("live");
    setMode("form");
  };

  const startEdit = (project: IProject): void => {
    setEditingId(getProjectId(project));
    setForm(toFormState(project));
    setActiveTab("live");
    setMode("form");
  };

  const cancelForm = (): void => {
    setEditingId(null);
    setForm(initialFormState);
    setMode("list");
  };

  const requestDelete = (project: IProject): void => {
    setProjectToDelete(project);
    setDeleteDependencies(null);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!projectToDelete) return;
    const id = getProjectId(projectToDelete);
    setIsSubmitting(true);
    setDeleteDependencies(null);

    try {
      const result = await deleteProject(id);
      if (!result.success) {
        if (result.dependencies) {
          setDeleteDependencies(result.dependencies);
        } else {
          showToast(result.error ?? "Failed to delete project", "error");
          setProjectToDelete(null);
        }
        return;
      }

      setItems((current) => current.filter((item) => getProjectId(item) !== id));
      setProjectToDelete(null);
      showToast(`Deleted project "${projectToDelete.title}".`, "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    if (!form.slug.trim()) {
      showToast("Canonical Slug is required", "error");
      return;
    }

    if (form.existingImages.length === 0 && form.newImages.length === 0) {
      showToast("At least one image is required for portfolio display", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildSubmitFormData(form);
      const result = editingId
        ? await updateProject(editingId, payload)
        : await createProject(payload);

      if (!result.success || !result.data) {
        showToast(result.error ?? "Failed to save project", "error");
        setIsSubmitting(false);
        return;
      }

      setItems((current) => {
        if (!editingId) {
          return [...current, result.data as IProject].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        }
        return current
          .map((item) => (getProjectId(item) === editingId ? (result.data as IProject) : item))
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      });

      setIsSubmitting(false);
      showToast(editingId ? "Project updated successfully" : "Project created successfully", "success");
      cancelForm();
    } catch (err: unknown) {
      setIsSubmitting(false);
      showToast(err instanceof Error ? err.message : "An unexpected error occurred", "error");
    }
  };

  // Filtered List
  const filteredProjects = items.filter((p) => {
    if (statusFilter !== "all" && p.publicationStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (p.title || "").toLowerCase().includes(q);
      const matchSlug = (p.slug || "").toLowerCase().includes(q);
      return matchTitle || matchSlug;
    }
    return true;
  });

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={typography.adminEyebrow}>Canonical Content</p>
          <h2 className={`mt-1 ${typography.adminTitle}`}>Projects V2 Editor</h2>
        </div>
        {mode === "list" && (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            + Add New Project
          </button>
        )}
      </div>

      {mode === "list" ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search projects by title or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 pl-9 pr-3 py-1.5 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Canonical Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <p className="text-xs text-neutral-400">
              Total Projects: <span className="font-semibold text-neutral-100">{items.length}</span>
            </p>
          </div>

          {/* List Cards */}
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center text-neutral-500">
                No projects match the selected criteria.
              </div>
            ) : (
              filteredProjects.map((project) => {
                const id = getProjectId(project);
                const isPublished = project.publicationStatus === "published";
                const isDraft = project.publicationStatus === "draft" || !project.publicationStatus;
                const isArchived = project.publicationStatus === "archived";

                return (
                  <article
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition hover:border-neutral-700"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {project.images && project.images[0] ? (
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950">
                          <ImageIcon className="h-6 w-6 text-neutral-600" aria-hidden="true" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="truncate font-semibold text-neutral-100">{project.title}</h4>
                          {project.slug && (
                            <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-amber-400">
                              /{project.slug}
                            </span>
                          )}
                          {isPublished && (
                            <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              Published
                            </span>
                          )}
                          {isDraft && (
                            <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                              Draft
                            </span>
                          )}
                          {isArchived && (
                            <span className="rounded bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                              Archived
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-1">
                          Order: {project.displayOrder ?? 0} • {(project.images ?? []).length} image(s) • Skills: {(project.skillIds ?? []).length} • Roles: {(project.roleIds ?? []).length}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(project)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(project)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Form Editor Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                {editingId ? `Edit Project "${form.title}"` : "Create New Project"}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage live portfolio attributes alongside future canonical case-study details.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex flex-wrap border-b border-neutral-800 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("live")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === "live"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              1. Live Portfolio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("canonical")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === "canonical"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              2. Canonical V2 Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("relationships")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === "relationships"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              3. Graph Relationships
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("casestudy")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === "casestudy"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              4. Case Study & Architecture
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === "seo"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              5. SEO
            </button>
          </div>

          {/* TAB 1: Live Portfolio */}
          {activeTab === "live" && (
            <div className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                <strong>Live Portfolio Impact:</strong> Fields in this section directly control your current public website rendering.
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setForm((c) => ({
                        ...c,
                        title: newTitle,
                        slug: c.slug || generateSlug(newTitle),
                      }));
                    }}
                    placeholder="e.g. StayDue"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Badge (optional)
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm((c) => ({ ...c, badge: e.target.value }))}
                    placeholder="e.g. 1st Place — Hackfest 2026"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">Emojis are stripped automatically.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Live URL
                  </label>
                  <input
                    type="url"
                    value={form.liveUrl}
                    onChange={(e) => setForm((c) => ({ ...c, liveUrl: e.target.value }))}
                    placeholder="https://staydue.com"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={(e) => setForm((c) => ({ ...c, githubUrl: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((c) => ({ ...c, order: Number(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Image Fit
                  </label>
                  <select
                    value={form.imageFit}
                    onChange={(e) => setForm((c) => ({ ...c, imageFit: e.target.value as "cover" | "contain" }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="cover">Cover (fill & crop)</option>
                    <option value="contain">Contain (fit entire image)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-300">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((c) => ({ ...c, featured: e.target.checked }))}
                      className="rounded border-neutral-800 bg-neutral-950 text-amber-500 focus:ring-amber-500"
                    />
                    SHARED: Featured Project (Syncs with isFeatured)
                  </label>
                </div>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Project Images *
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setForm((c) => ({ ...c, newImages: [...c.newImages, ...files] }));
                  }}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-amber-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-neutral-950"
                />

                {/* Existing Images */}
                {form.existingImages.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs text-neutral-400">Current Saved Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {form.existingImages.map((url) => (
                        <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="existing" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((c) => ({
                                ...c,
                                existingImages: c.existingImages.filter((img) => img !== url),
                              }))
                            }
                            className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-red-500 text-white"
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Canonical V2 Profile */}
          {activeTab === "canonical" && (
            <div className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
              <div className="rounded-lg border border-neutral-700 bg-neutral-900/80 p-3 text-xs text-neutral-300">
                <strong>Canonical Storage Notice:</strong> Canonical publication status is stored for the upcoming public cutover phase. It does not currently hide this Project from the live portfolio.
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-400">
                      Canonical Slug *
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm((c) => ({ ...c, slug: generateSlug(c.title) }))}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Suggest from Title
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value.toLowerCase().trim() }))}
                    placeholder="staydue"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-mono text-amber-300 focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">Lowercase, hyphenated (e.g. multi-agent-simulation-engine).</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Canonical Publication Status
                  </label>
                  <select
                    value={form.publicationStatus}
                    onChange={(e) => setForm((c) => ({ ...c, publicationStatus: e.target.value as PublicationStatus }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="draft">Draft (Canonical default)</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Project Type
                  </label>
                  <select
                    value={form.projectType}
                    onChange={(e) => setForm((c) => ({ ...c, projectType: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="personal">Personal Project</option>
                    <option value="commercial">Commercial</option>
                    <option value="open_source">Open Source</option>
                    <option value="client">Client Work</option>
                    <option value="academic">Academic / University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ai_agents">AI Agents & LLMs</option>
                    <option value="fullstack">Full-Stack Application</option>
                    <option value="systems">Systems Engineering</option>
                    <option value="cloud_devops">Cloud & DevOps</option>
                    <option value="frontend">Frontend & UI</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Tagline (One-liner summary)
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm((c) => ({ ...c, tagline: e.target.value }))}
                  placeholder="e.g. AI-powered property booking & hospitality management system"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) => setForm((c) => ({ ...c, shortDescription: e.target.value }))}
                  placeholder="Brief overview displayed on cards..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Long Description / Overview
                </label>
                <textarea
                  rows={4}
                  value={form.longDescription}
                  onChange={(e) => setForm((c) => ({ ...c, longDescription: e.target.value }))}
                  placeholder="Detailed project narrative and feature breakdown..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Documentation URL
                  </label>
                  <input
                    type="url"
                    value={form.documentationUrl}
                    onChange={(e) => setForm((c) => ({ ...c, documentationUrl: e.target.value }))}
                    placeholder="https://docs.staydue.com"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Demo Video URL
                  </label>
                  <input
                    type="url"
                    value={form.demoUrl}
                    onChange={(e) => setForm((c) => ({ ...c, demoUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Graph Relationships */}
          {activeTab === "relationships" && (
            <div className="space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
              <div>
                <h4 className="text-sm font-bold text-neutral-100">Linked Skills Graph</h4>
                <p className="text-xs text-neutral-400 mb-3">
                  Select Skills utilized in this project. Existing archived skill references remain preserved.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 max-h-48 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                  {allSkills.length === 0 ? (
                    <p className="text-xs text-neutral-500 col-span-full">No Skills found in database.</p>
                  ) : (
                    allSkills.map((s) => {
                      const isSelected = form.selectedSkillIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center gap-2 rounded-md p-2 text-xs cursor-pointer transition ${
                            isSelected
                              ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                              : "hover:bg-neutral-900 text-neutral-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm((c) => ({ ...c, selectedSkillIds: [...c.selectedSkillIds, s.id] }));
                              } else {
                                setForm((c) => ({ ...c, selectedSkillIds: c.selectedSkillIds.filter((id) => id !== s.id) }));
                              }
                            }}
                            className="rounded border-neutral-800 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="truncate">{s.name}</span>
                          {s.isArchived && <span className="text-[10px] text-neutral-500">(Archived)</span>}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-100">Linked Roles Graph</h4>
                <p className="text-xs text-neutral-400 mb-3">
                  Select professional or organizational Roles during which this project was built.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                  {allRoles.length === 0 ? (
                    <p className="text-xs text-neutral-500 col-span-full">No Roles found in database.</p>
                  ) : (
                    allRoles.map((r) => {
                      const isSelected = form.selectedRoleIds.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          className={`flex items-center gap-2 rounded-md p-2 text-xs cursor-pointer transition ${
                            isSelected
                              ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                              : "hover:bg-neutral-900 text-neutral-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm((c) => ({ ...c, selectedRoleIds: [...c.selectedRoleIds, r.id] }));
                              } else {
                                setForm((c) => ({ ...c, selectedRoleIds: c.selectedRoleIds.filter((id) => id !== r.id) }));
                              }
                            }}
                            className="rounded border-neutral-800 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="truncate">{r.roleTitle} — {r.organization}</span>
                          {r.isArchived && <span className="text-[10px] text-neutral-500">(Archived)</span>}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Case Study & Architecture */}
          {activeTab === "casestudy" && (
            <div className="space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Architecture Overview
                  </label>
                  <textarea
                    rows={3}
                    value={form.architectureOverview}
                    onChange={(e) => setForm((c) => ({ ...c, architectureOverview: e.target.value }))}
                    placeholder="High-level architecture pattern (e.g. Next.js App Router + MongoDB + Cloudflare R2)"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Architecture Diagram URL
                  </label>
                  <input
                    type="url"
                    value={form.architectureDiagramUrl}
                    onChange={(e) => setForm((c) => ({ ...c, architectureDiagramUrl: e.target.value }))}
                    placeholder="https://images.portfolio.com/diagram.png"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Key Outcomes (one per line)
                </label>
                <textarea
                  rows={3}
                  value={form.outcomesStr}
                  onChange={(e) => setForm((c) => ({ ...c, outcomesStr: e.target.value }))}
                  placeholder="Processed 10,000+ real-time websocket requests&#10;Achieved 99.9% deployment uptime"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Technical Decisions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Technical Decisions</h4>
                  <button
                    type="button"
                    onClick={() => setForm((c) => ({
                      ...c,
                      technicalDecisions: [...c.technicalDecisions, { title: "", context: "", decision: "", consequencesStr: "" }],
                    }))}
                    className="text-xs font-semibold text-amber-400 hover:underline"
                  >
                    + Add Decision
                  </button>
                </div>
                <div className="space-y-3">
                  {form.technicalDecisions.map((td, idx) => (
                    <div key={idx} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => setForm((c) => ({
                          ...c,
                          technicalDecisions: c.technicalDecisions.filter((_, i) => i !== idx),
                        }))}
                        className="absolute right-3 top-3 text-neutral-500 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Decision Title (e.g. Choose MongoDB over PostgreSQL)"
                          value={td.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((c) => ({
                              ...c,
                              technicalDecisions: c.technicalDecisions.map((item, i) => i === idx ? { ...item, title: val } : item),
                            }));
                          }}
                          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Context / Rationale"
                          value={td.context}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((c) => ({
                              ...c,
                              technicalDecisions: c.technicalDecisions.map((item, i) => i === idx ? { ...item, context: val } : item),
                            }));
                          }}
                          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Chosen Decision details..."
                        value={td.decision}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((c) => ({
                            ...c,
                            technicalDecisions: c.technicalDecisions.map((item, i) => i === idx ? { ...item, decision: val } : item),
                          }));
                        }}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Challenges */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Technical Challenges</h4>
                  <button
                    type="button"
                    onClick={() => setForm((c) => ({
                      ...c,
                      challenges: [...c.challenges, { title: "", problem: "", solution: "", impact: "" }],
                    }))}
                    className="text-xs font-semibold text-amber-400 hover:underline"
                  >
                    + Add Challenge
                  </button>
                </div>
                <div className="space-y-3">
                  {form.challenges.map((tc, idx) => (
                    <div key={idx} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => setForm((c) => ({
                          ...c,
                          challenges: c.challenges.filter((_, i) => i !== idx),
                        }))}
                        className="absolute right-3 top-3 text-neutral-500 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Challenge Title"
                          value={tc.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((c) => ({
                              ...c,
                              challenges: c.challenges.map((item, i) => i === idx ? { ...item, title: val } : item),
                            }));
                          }}
                          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Problem Description"
                          value={tc.problem}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((c) => ({
                              ...c,
                              challenges: c.challenges.map((item, i) => i === idx ? { ...item, problem: val } : item),
                            }));
                          }}
                          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Engineered Solution"
                          value={tc.solution}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((c) => ({
                              ...c,
                              challenges: c.challenges.map((item, i) => i === idx ? { ...item, solution: val } : item),
                            }));
                          }}
                          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Impact / Result"
                          value={tc.impact}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((c) => ({
                              ...c,
                              challenges: c.challenges.map((item, i) => i === idx ? { ...item, impact: val } : item),
                            }));
                          }}
                          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEO Metadata */}
          {activeTab === "seo" && (
            <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Meta Title Override
                </label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => setForm((c) => ({ ...c, metaTitle: e.target.value }))}
                  placeholder="e.g. StayDue — AI Property Management Engine"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => setForm((c) => ({ ...c, metaDescription: e.target.value }))}
                  placeholder="Case study and architecture overview of StayDue property engine..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  SEO Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={form.keywordsStr}
                  onChange={(e) => setForm((c) => ({ ...c, keywordsStr: e.target.value }))}
                  placeholder="ai agents, property management, nextjs, mongodb"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Form Bottom Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-lg bg-neutral-800 px-5 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      )}

      {toast && <Toast toast={toast} onClose={hideToast} />}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-400">
              Hard Delete Project &quot;{projectToDelete.title}&quot;?
            </h3>

            {deleteDependencies ? (
              <div className="space-y-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                <p className="font-semibold">
                  Cannot delete Project. It is referenced by incoming graph relationships:
                </p>
                {deleteDependencies.events && deleteDependencies.events.length > 0 && (
                  <div>
                    <span className="font-semibold">Events: </span>
                    {deleteDependencies.events.map((e) => e.title).join(", ")}
                  </div>
                )}
                {deleteDependencies.awards && deleteDependencies.awards.length > 0 && (
                  <div>
                    <span className="font-semibold">Awards: </span>
                    {deleteDependencies.awards.map((a) => a.title).join(", ")}
                  </div>
                )}
                <p className="text-neutral-400">
                  Please edit the canonical <strong className="text-amber-300">Publication Status</strong> to <strong className="text-amber-300">Archived</strong> instead to preserve graph integrity.
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                This will permanently delete the Project document and its attached portfolio images from Cloudflare R2 storage. This action cannot be undone.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setProjectToDelete(null);
                  setDeleteDependencies(null);
                }}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
              >
                {deleteDependencies ? "Close" : "Cancel"}
              </button>
              {!deleteDependencies && (
                <button
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
