"use client";

import React, { useState } from "react";
import { PlainSkill } from "@/lib/admin/queries/skills";
import { createSkill, updateSkill, archiveSkill, deleteSkill, ActionResult } from "@/actions/skills";
import { PublicationBadge } from "@/components/admin/cms/PublicationBadge";
import { FeaturedBadge } from "@/components/admin/cms/FeaturedBadge";
import { Plus, Edit2, Archive, Trash2, X, AlertTriangle, Check, Loader2, Sparkles } from "lucide-react";

interface SkillManagementProps {
  initialSkills: PlainSkill[];
}

export function SkillManagement({ initialSkills }: SkillManagementProps) {
  const [skills, setSkills] = useState<PlainSkill[]>(initialSkills);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal states
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<PlainSkill | null>(null);
  const [archiveConfirmSkill, setArchiveConfirmSkill] = useState<PlainSkill | null>(null);
  const [deleteConfirmSkill, setDeleteConfirmSkill] = useState<PlainSkill | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    summary: "",
    featured: false,
    displayOrder: 0,
    publicationStatus: "draft" as "draft" | "published" | "archived",
  });

  // Action status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [deleteDependencies, setDeleteDependencies] = useState<ActionResult["dependencies"] | null>(null);

  // Derived category list for datalist suggestions
  const categories = Array.from(new Set(skills.map((s) => s.category))).sort();

  // Helper toast trigger
  function showToast(msg: string) {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  }

  // Helper slug generator
  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function openCreateModal() {
    setFormError(null);
    setFormData({
      name: "",
      slug: "",
      category: categories[0] || "frontend",
      summary: "",
      featured: false,
      displayOrder: skills.length > 0 ? Math.max(...skills.map((s) => s.displayOrder)) + 1 : 0,
      publicationStatus: "draft",
    });
    setSelectedSkill(null);
    setModalMode("create");
  }

  function openEditModal(skill: PlainSkill) {
    setFormError(null);
    setSelectedSkill(skill);
    setFormData({
      name: skill.name,
      slug: skill.slug,
      category: skill.category,
      summary: skill.summary || "",
      featured: skill.featured ?? false,
      displayOrder: skill.displayOrder,
      publicationStatus: skill.publicationStatus,
    });
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedSkill(null);
    setFormError(null);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (modalMode === "create") {
        const res = await createSkill({
          name: formData.name,
          slug: formData.slug,
          category: formData.category,
          summary: formData.summary || undefined,
          featured: formData.featured,
          displayOrder: Number(formData.displayOrder),
          publicationStatus: formData.publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to create skill.");
          setIsSubmitting(false);
          return;
        }

        setSkills((prev) => [...prev, res.data!].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)));
        showToast(`Skill "${res.data.name}" created successfully as draft.`);
        closeModal();
      } else if (modalMode === "edit" && selectedSkill) {
        const res = await updateSkill({
          id: selectedSkill._id,
          name: formData.name,
          slug: formData.slug,
          category: formData.category,
          summary: formData.summary,
          featured: formData.featured,
          displayOrder: Number(formData.displayOrder),
          publicationStatus: formData.publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to update skill.");
          setIsSubmitting(false);
          return;
        }

        setSkills((prev) =>
          prev
            .map((s) => (s._id === selectedSkill._id ? res.data! : s))
            .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
        );
        showToast(`Skill "${res.data.name}" updated successfully.`);
        closeModal();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(skill: PlainSkill) {
    setIsSubmitting(true);
    try {
      const res = await archiveSkill(skill._id);
      if (!res.success || !res.data) {
        showToast(`Error: ${res.error || "Failed to archive skill."}`);
        return;
      }

      setSkills((prev) => prev.map((s) => (s._id === skill._id ? res.data! : s)));
      showToast(`Skill "${skill.name}" set to Archived state.`);
      setArchiveConfirmSkill(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive skill.";
      showToast(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(skill: PlainSkill) {
    setIsSubmitting(true);
    setDeleteDependencies(null);
    try {
      const res = await deleteSkill(skill._id);
      if (!res.success) {
        if (res.dependencies) {
          setDeleteDependencies(res.dependencies);
        } else {
          showToast(`Error: ${res.error || "Failed to delete skill."}`);
        }
        return;
      }

      setSkills((prev) => prev.filter((s) => s._id !== skill._id));
      showToast(`Skill "${skill.name}" deleted permanently.`);
      setDeleteConfirmSkill(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete skill.";
      showToast(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter skills
  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.summary && s.summary.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <input
            type="text"
            placeholder="Search skills by name, slug, summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orangeWeb/50 min-w-[200px]"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 capitalize focus:outline-none focus:border-orangeWeb/50"
          >
            <option value="all">All Categories ({skills.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c} ({skills.filter((s) => s.category === c).length})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orangeWeb text-zinc-950 font-semibold text-xs transition-all hover:bg-orangeWeb/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Skill
        </button>
      </div>

      {/* Datalist for category input suggestions */}
      <datalist id="category-suggestions">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* Table Surface */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[11px] font-semibold border-b border-zinc-800">
              <tr>
                <th scope="col" className="px-4 py-3">Order</th>
                <th scope="col" className="px-4 py-3">Skill Name</th>
                <th scope="col" className="px-4 py-3">Slug</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Summary</th>
                <th scope="col" className="px-4 py-3">Badges</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500 italic">
                    No matching skills found.
                  </td>
                </tr>
              ) : (
                filteredSkills.map((skill) => (
                  <tr key={skill._id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-3 font-mono text-zinc-500">{skill.displayOrder}</td>
                    <td className="px-4 py-3 font-medium text-white">{skill.name}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400 text-[11px]">{skill.slug}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50 capitalize">
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">
                      {skill.summary || <span className="text-zinc-600 italic">Not set</span>}
                    </td>
                    <td className="px-4 py-3">
                      <FeaturedBadge featured={skill.featured} />
                    </td>
                    <td className="px-4 py-3">
                      <PublicationBadge status={skill.publicationStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => openEditModal(skill)}
                          title="Edit Skill"
                          className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {skill.publicationStatus !== "archived" && (
                          <button
                            onClick={() => setArchiveConfirmSkill(skill)}
                            title="Archive Skill"
                            className="p-1.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDeleteDependencies(null);
                            setDeleteConfirmSkill(skill);
                          }}
                          title="Hard Delete Skill"
                          className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="font-heading text-lg font-bold text-white">
                {modalMode === "create" ? "Create Canonical Skill" : `Edit Skill: ${selectedSkill?.name}`}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">
                  Skill Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: newName,
                      slug: modalMode === "create" && !prev.slug ? generateSlug(newName) : prev.slug,
                    }));
                  }}
                  placeholder="e.g. Next.js, LangGraph, Python"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orangeWeb/50"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-300">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }))}
                    className="text-[11px] text-orangeWeb hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> Generate from name
                  </button>
                </div>
                <input
                  type="text"
                  required
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().trim() }))}
                  placeholder="e.g. nextjs, langgraph, python"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-cyan-300 font-mono placeholder-zinc-600 focus:outline-none focus:border-orangeWeb/50"
                />
                <p className="text-[10px] text-zinc-500">Lowercase letters, numbers, and hyphens only.</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">
                  Category <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="category-suggestions"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. frontend, ai_agents, cloud_devops"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orangeWeb/50 capitalize"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Summary (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief description of competency or context..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orangeWeb/50 resize-none"
                />
                <p className="text-[10px] text-zinc-500">
                  Leaving this empty when editing will unset the summary property.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono focus:outline-none focus:border-orangeWeb/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Publication Status</label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        publicationStatus: e.target.value as "draft" | "published" | "archived",
                      }))
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-orangeWeb/50"
                  >
                    <option value="draft">Draft (Default)</option>
                    <option value="published">Published (CMS Eligible)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="rounded bg-zinc-950 border-zinc-800 text-orangeWeb focus:ring-0"
                />
                <label htmlFor="featured-checkbox" className="font-semibold text-zinc-300 cursor-pointer">
                  Feature this Skill in primary showcases
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-orangeWeb text-zinc-950 font-bold transition-all hover:bg-orangeWeb/90 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modalMode === "create" ? "Create Skill" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE CONFIRMATION MODAL */}
      {archiveConfirmSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-amber-500/30 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <Archive className="h-6 w-6" />
              <h3 className="font-heading text-lg font-bold text-white">Archive Skill?</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to archive <strong className="text-white">{archiveConfirmSkill.name}</strong>?
            </p>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300 space-y-1">
              <p className="font-semibold">Graph Preservation Policy:</p>
              <p className="text-[11px] text-amber-200/80">
                The Skill will remain in MongoDB and existing relationships across Roles, Projects, Events, Awards, and Certifications will be preserved cleanly.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setArchiveConfirmSkill(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchive(archiveConfirmSkill)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HARD DELETE CONFIRMATION & DEPENDENCY GUARD MODAL */}
      {deleteConfirmSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 className="h-6 w-6" />
              <h3 className="font-heading text-lg font-bold text-white">Hard Delete Skill</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Target Skill: <strong className="text-white">{deleteConfirmSkill.name}</strong> ({deleteConfirmSkill.slug})
            </p>

            {deleteDependencies ? (
              <div className="space-y-3 bg-red-500/10 border border-red-500/30 p-3.5 rounded-lg text-xs">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Deletion Blocked by Dependency Guard</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  This Skill cannot be hard deleted because it is referenced in the canonical database:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-red-300 font-mono">
                  {deleteDependencies.projects?.map((p) => (
                    <li key={p.id}>Project: {p.title}</li>
                  ))}
                  {deleteDependencies.events?.map((e) => (
                    <li key={e.id}>Event: {e.title}</li>
                  ))}
                  {deleteDependencies.roles?.map((r) => (
                    <li key={r.id}>Role: {r.title}</li>
                  ))}
                  {deleteDependencies.awards?.map((a) => (
                    <li key={a.id}>Award: {a.title}</li>
                  ))}
                  {deleteDependencies.certifications?.map((c) => (
                    <li key={c.id}>Certification: {c.title}</li>
                  ))}
                </ul>
                <p className="text-zinc-400 text-[10px] pt-1 italic">
                  Recommendation: Use Archive to set status to Archived without breaking graph references.
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">
                Warning: Hard deletion is permanent and will remove this Skill document from MongoDB.
              </p>
            )}

            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
              {deleteDependencies ? (
                <button
                  onClick={() => {
                    const s = deleteConfirmSkill;
                    setDeleteConfirmSkill(null);
                    setDeleteDependencies(null);
                    setArchiveConfirmSkill(s);
                  }}
                  className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold"
                >
                  Archive Instead
                </button>
              ) : (
                <div></div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDeleteConfirmSkill(null);
                    setDeleteDependencies(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium"
                >
                  Close
                </button>
                {!deleteDependencies && (
                  <button
                    onClick={() => handleDelete(deleteConfirmSkill)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Confirm Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
