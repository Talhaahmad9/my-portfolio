"use client";

import React, { useState } from "react";
import { PlainRole } from "@/lib/admin/queries/roles";
import { PlainSkill } from "@/lib/admin/queries/skills";
import { DatePrecision, PublicationStatus, RoleCategory } from "@/lib/cms/types";
import { createRole, updateRole, archiveRole, deleteRole } from "@/actions/roles";
import { DatePrecisionInput } from "@/components/admin/cms/DatePrecisionInput";
import { toCmsDateInputValue } from "@/lib/admin/cms-date-input";

interface RoleManagementProps {
  initialRoles: PlainRole[];
  allSkills: PlainSkill[];
}

const CATEGORIES: RoleCategory[] = ["professional", "freelance", "leadership", "community"];

export function RoleManagement({ initialRoles, allSkills }: RoleManagementProps) {
  const [roles, setRoles] = useState<PlainRole[]>(initialRoles);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PlainRole | null>(null);
  const [archiveConfirmRole, setArchiveConfirmRole] = useState<PlainRole | null>(null);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<PlainRole | null>(null);

  // Form Fields
  const [roleTitle, setRoleTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [category, setCategory] = useState<RoleCategory>("professional");
  const [location, setLocation] = useState("");
  const [startDateRaw, setStartDateRaw] = useState("");
  const [startDatePrecision, setStartDatePrecision] = useState<DatePrecision | "">("");
  const [endDateRaw, setEndDateRaw] = useState("");
  const [endDatePrecision, setEndDatePrecision] = useState<DatePrecision | "">("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Array<{ label: string; value: string; change?: string }>>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>("draft");

  // UI State
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDependencies, setDeleteDependencies] = useState<{
    projects?: Array<{ id: string; title: string }>;
    events?: Array<{ id: string; title: string }>;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function openCreateModal() {
    setSelectedRole(null);
    setRoleTitle("");
    setOrganization("");
    setCategory("professional");
    setLocation("");
    setStartDateRaw("");
    setStartDatePrecision("");
    setEndDateRaw("");
    setEndDatePrecision("");
    setIsCurrent(false);
    setSummary("");
    setDescription("");
    setHighlights([]);
    setMetrics([]);
    setSelectedSkillIds([]);
    setFeatured(false);
    setDisplayOrder(roles.length > 0 ? Math.max(...roles.map((r) => r.displayOrder)) + 1 : 1);
    setPublicationStatus("draft");
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(role: PlainRole) {
    setSelectedRole(role);
    setRoleTitle(role.roleTitle);
    setOrganization(role.organization);
    setCategory(role.category as RoleCategory);
    setLocation(role.location || "");
    setStartDateRaw(toCmsDateInputValue(role.startDate, role.startDatePrecision));
    setStartDatePrecision(role.startDatePrecision || "");
    setEndDateRaw(toCmsDateInputValue(role.endDate, role.endDatePrecision));
    setEndDatePrecision(role.endDatePrecision || "");
    setIsCurrent(role.isCurrent ?? false);
    setSummary(role.summary);
    setDescription(role.description || "");
    setHighlights(role.highlights || []);
    setMetrics(role.metrics || []);
    setSelectedSkillIds(role.skillIds || []);
    setFeatured(role.featured ?? false);
    setDisplayOrder(role.displayOrder);
    setPublicationStatus(role.publicationStatus as PublicationStatus);
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedRole(null);
    setFormError(null);
  }

  function toggleSkillSelect(skillId: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (!selectedRole) {
        // Create
        const res = await createRole({
          roleTitle,
          organization,
          category,
          location: location || undefined,
          startDateRaw: startDateRaw || undefined,
          startDatePrecision: startDatePrecision || undefined,
          endDateRaw: endDateRaw || undefined,
          endDatePrecision: endDatePrecision || undefined,
          isCurrent,
          summary,
          description: description || undefined,
          highlights,
          metrics,
          skillIds: selectedSkillIds,
          featured,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to create Role.");
          return;
        }

        setRoles((prev) => [...prev, res.data!].sort((a, b) => a.displayOrder - b.displayOrder));
        showToast(`Role "${res.data.roleTitle}" created successfully.`);
        closeModal();
      } else {
        // Update
        const res = await updateRole({
          id: selectedRole._id,
          roleTitle,
          organization,
          category,
          location,
          startDateRaw,
          startDatePrecision: startDatePrecision || undefined,
          endDateRaw,
          endDatePrecision: endDatePrecision || undefined,
          isCurrent,
          summary,
          description,
          highlights,
          metrics,
          skillIds: selectedSkillIds,
          featured,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to update Role.");
          return;
        }

        setRoles((prev) =>
          prev
            .map((r) => (r._id === selectedRole._id ? res.data! : r))
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );
        showToast(`Role "${res.data.roleTitle}" updated successfully.`);
        closeModal();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(role: PlainRole) {
    setIsSubmitting(true);
    try {
      const res = await archiveRole(role._id);
      if (!res.success || !res.data) {
        showToast(`Error: ${res.error || "Failed to archive role."}`);
        return;
      }
      setRoles((prev) => prev.map((r) => (r._id === role._id ? res.data! : r)));
      showToast(`Role "${role.roleTitle}" archived.`);
      setArchiveConfirmRole(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive role.";
      showToast(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(role: PlainRole) {
    setIsSubmitting(true);
    setDeleteDependencies(null);
    try {
      const res = await deleteRole(role._id);
      if (!res.success) {
        if (res.dependencies) {
          setDeleteDependencies(res.dependencies);
        } else {
          showToast(`Error: ${res.error || "Failed to delete role."}`);
        }
        return;
      }

      setRoles((prev) => prev.filter((r) => r._id !== role._id));
      showToast(`Role "${role.roleTitle}" deleted permanently.`);
      setDeleteConfirmRole(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete role.";
      showToast(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredRoles = roles.filter((r) => {
    const matchesCat = filterCategory === "all" || r.category === filterCategory;
    const matchesStatus = filterStatus === "all" || r.publicationStatus === filterStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      r.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.organization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-zinc-900 border border-orangeWeb/40 text-white rounded-xl shadow-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-orangeWeb animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orangeWeb/50 w-48"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-orangeWeb/50"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-orangeWeb/50"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-orangeWeb to-amber-500 hover:from-orangeWeb/90 hover:to-amber-500/90 text-zinc-950 font-semibold text-xs rounded-xl shadow-lg shadow-orangeWeb/10 transition-all duration-200 flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Role
        </button>
      </div>

      {/* Role Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRoles.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
            <p className="text-sm text-zinc-400">No roles found matching criteria.</p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role._id}
              className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-white text-base">{role.roleTitle}</h3>
                  <span className="text-zinc-400 text-sm">@ {role.organization}</span>
                  {role.isCurrent && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Current
                    </span>
                  )}
                  {role.featured && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      ★ Featured
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      role.publicationStatus === "published"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : role.publicationStatus === "draft"
                        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
                    }`}
                  >
                    {role.publicationStatus}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <span>📅 {role.dateRangeText || "Dates unspecified"}</span>
                  {role.location && <span>📍 {role.location}</span>}
                  <span className="capitalize">🏷️ {role.category}</span>
                  <span>Order: {role.displayOrder}</span>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2">{role.summary}</p>

                {role.skills && role.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.skills.map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700/50"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => openEditModal(role)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition"
                >
                  Edit
                </button>
                {role.publicationStatus !== "archived" && (
                  <button
                    onClick={() => setArchiveConfirmRole(role)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium transition"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => setDeleteConfirmRole(role)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 my-8 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold">
                {selectedRole ? `Edit Role: ${selectedRole.roleTitle}` : "Create Canonical Role"}
              </h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Role Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Lead Full-Stack AI Engineer"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Organization <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. StayDue"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RoleCategory)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote / Karachi, Pakistan"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  />
                </div>
              </div>

              {/* Dates & Current Flag */}
              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={isCurrent}
                    onChange={(e) => {
                      setIsCurrent(e.target.checked);
                      if (e.target.checked) {
                        setEndDateRaw("");
                        setEndDatePrecision("");
                      }
                    }}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-orangeWeb focus:ring-0"
                  />
                  <label htmlFor="isCurrent" className="text-xs font-medium text-zinc-200 cursor-pointer">
                    I currently work in this role
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePrecisionInput
                    label="Start Date"
                    dateValue={startDateRaw}
                    precision={startDatePrecision}
                    onChange={(val, prec) => {
                      setStartDateRaw(val);
                      setStartDatePrecision(prec);
                    }}
                  />

                  <DatePrecisionInput
                    label="End Date"
                    dateValue={endDateRaw}
                    precision={endDatePrecision}
                    disabled={isCurrent}
                    onChange={(val, prec) => {
                      setEndDateRaw(val);
                      setEndDatePrecision(prec);
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Summary <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="High-level role overview..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed role description..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                />
              </div>

              {/* Highlights Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Highlights</label>
                  <button
                    type="button"
                    onClick={() => setHighlights((prev) => [...prev, ""])}
                    className="text-[11px] text-orangeWeb hover:underline font-medium"
                  >
                    + Add Highlight
                  </button>
                </div>

                {highlights.map((hl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={hl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHighlights((prev) => prev.map((item, i) => (i === idx ? val : item)));
                      }}
                      placeholder={`Highlight #${idx + 1}`}
                      className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                    />
                    <button
                      type="button"
                      onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-zinc-500 hover:text-red-400 text-xs px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Skills Multi-select */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">Associated Canonical Skills</label>
                <div className="max-h-36 overflow-y-auto p-3 bg-zinc-950 border border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {allSkills.map((s) => {
                    const isChecked = selectedSkillIds.includes(s._id);
                    return (
                      <label
                        key={s._id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer transition ${
                          isChecked
                            ? "bg-orangeWeb/10 border-orangeWeb/40 text-orangeWeb"
                            : "bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSkillSelect(s._id)}
                          className="rounded border-zinc-800 text-orangeWeb focus:ring-0"
                        />
                        <span className="truncate">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Settings row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Status</label>
                  <select
                    value={publicationStatus}
                    onChange={(e) => setPublicationStatus(e.target.value as PublicationStatus)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded border-zinc-800 text-orangeWeb focus:ring-0"
                    />
                    <span>Featured</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-orangeWeb hover:bg-orangeWeb/90 text-zinc-950 font-bold rounded-xl text-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : selectedRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {archiveConfirmRole && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-base font-bold text-amber-400">Archive Role</h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to archive <strong>{archiveConfirmRole.roleTitle} @ {archiveConfirmRole.organization}</strong>?
              This sets its status to Archived without breaking any project references.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setArchiveConfirmRole(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchive(archiveConfirmRole)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmRole && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-base font-bold text-red-400">Hard Delete Role</h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to permanently delete <strong>{deleteConfirmRole.roleTitle} @ {deleteConfirmRole.organization}</strong>?
              This action cannot be undone.
            </p>

            {deleteDependencies && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2 text-xs">
                <p className="font-semibold text-red-400">Deletion Blocked: Dependencies Exist</p>
                {deleteDependencies.projects && deleteDependencies.projects.length > 0 && (
                  <p className="text-zinc-300">
                    Projects referencing this role: {deleteDependencies.projects.map((p) => p.title).join(", ")}
                  </p>
                )}
                {deleteDependencies.events && deleteDependencies.events.length > 0 && (
                  <p className="text-zinc-300">
                    Events referencing this role: {deleteDependencies.events.map((e) => e.title).join(", ")}
                  </p>
                )}
                <p className="text-zinc-400 font-medium pt-1">
                  Please use <strong>Archive</strong> instead to preserve database integrity.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirmRole(null);
                  setDeleteDependencies(null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition"
              >
                Cancel
              </button>
              {!deleteDependencies && (
                <button
                  onClick={() => handleDelete(deleteConfirmRole)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                >
                  Delete Permanently
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
