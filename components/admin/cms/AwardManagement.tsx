"use client";

import React, { useState } from "react";
import { PlainAward } from "@/lib/admin/queries/achievements";
import { AwardType, PublicationStatus } from "@/lib/cms/types";
import { createAward, updateAward, archiveAward, deleteAward } from "@/actions/awards";
import {
  RelationshipMultiSelect,
  RelationshipSingleSelect,
  SelectOption,
} from "@/components/admin/cms/RelationshipSelect";

interface AwardManagementProps {
  initialAwards: PlainAward[];
  allProjects: Array<{ id: string; title: string }>;
  allEvents: Array<{ id: string; title: string }>;
  allSkills: Array<{ id: string; name: string }>;
}

const AWARD_TYPES: AwardType[] = ["competition", "recognition", "academic", "other"];

export function AwardManagement({
  initialAwards,
  allProjects,
  allEvents,
  allSkills,
}: AwardManagementProps) {
  const [awards, setAwards] = useState<PlainAward[]>(initialAwards);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<PlainAward | null>(null);
  const [archiveConfirmAward, setArchiveConfirmAward] = useState<PlainAward | null>(null);
  const [deleteConfirmAward, setDeleteConfirmAward] = useState<PlainAward | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [awardType, setAwardType] = useState<AwardType>("competition");
  const [issuer, setIssuer] = useState("");
  const [placement, setPlacement] = useState("");
  const [score, setScore] = useState("");
  const [dateRaw, setDateRaw] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [metrics, setMetrics] = useState<Array<{ label: string; value: string; numericValue?: number; unit?: string; context?: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>("draft");

  // UI Feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function openCreateModal() {
    setSelectedAward(null);
    setTitle("");
    setAwardType("competition");
    setIssuer("");
    setPlacement("");
    setScore("");
    setDateRaw("");
    setSummary("");
    setDescription("");
    setMetrics([]);
    setSelectedProjectId(null);
    setSelectedEventId(null);
    setSelectedSkillIds([]);
    setFeatured(false);
    setDisplayOrder(awards.length > 0 ? Math.max(...awards.map((a) => a.displayOrder)) + 1 : 1);
    setPublicationStatus("draft");
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(award: PlainAward) {
    setSelectedAward(award);
    setTitle(award.title);
    setAwardType(award.awardType);
    setIssuer(award.issuer || "");
    setPlacement(award.placement || "");
    setScore(award.score || "");
    setDateRaw(award.date ? award.date.split("T")[0] : "");
    setSummary(award.summary || "");
    setDescription(award.description || "");
    setMetrics(award.metrics || []);
    setSelectedProjectId(award.relatedProjectId || award.relatedProject?.id || null);
    setSelectedEventId(award.relatedEventId || award.relatedEvent?.id || null);
    setSelectedSkillIds(award.skillIds || award.skills.map((s) => s.id));
    setFeatured(award.featured ?? false);
    setDisplayOrder(award.displayOrder);
    setPublicationStatus(award.publicationStatus);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (selectedAward) {
        // Edit Mode
        const res = await updateAward({
          id: selectedAward._id,
          title,
          awardType,
          issuer,
          placement,
          score,
          dateRaw,
          summary,
          description,
          metrics,
          relatedProjectId: selectedProjectId,
          relatedEventId: selectedEventId,
          skillIds: selectedSkillIds,
          featured,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to update Award.");
          setIsSubmitting(false);
          return;
        }

        setAwards((prev) => prev.map((a) => (a._id === res.data!._id ? res.data! : a)));
        showToast(`Updated Award "${res.data.title}" successfully.`);
      } else {
        // Create Mode
        const res = await createAward({
          title,
          awardType,
          issuer: issuer || undefined,
          placement: placement || undefined,
          score: score || undefined,
          dateRaw,
          summary: summary || undefined,
          description: description || undefined,
          metrics,
          relatedProjectId: selectedProjectId,
          relatedEventId: selectedEventId,
          skillIds: selectedSkillIds,
          featured,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to create Award.");
          setIsSubmitting(false);
          return;
        }

        setAwards((prev) => [res.data!, ...prev]);
        showToast(`Created Award "${res.data.title}" successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmArchive() {
    if (!archiveConfirmAward) return;
    setIsSubmitting(true);

    try {
      const res = await archiveAward(archiveConfirmAward._id);
      if (!res.success || !res.data) {
        showToast(res.error || "Failed to archive Award.");
      } else {
        setAwards((prev) => prev.map((a) => (a._id === res.data!._id ? res.data! : a)));
        showToast(`Archived Award "${res.data.title}".`);
      }
    } finally {
      setIsSubmitting(false);
      setArchiveConfirmAward(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmAward) return;
    setIsSubmitting(true);

    try {
      const res = await deleteAward(deleteConfirmAward._id);
      if (!res.success) {
        showToast(res.error || "Failed to delete Award.");
      } else {
        setAwards((prev) => prev.filter((a) => a._id !== deleteConfirmAward._id));
        showToast(`Deleted Award "${deleteConfirmAward.title}".`);
      }
    } finally {
      setIsSubmitting(false);
      setDeleteConfirmAward(null);
    }
  }

  // Metric helpers
  function addMetric() {
    setMetrics((prev) => [...prev, { label: "", value: "" }]);
  }

  function removeMetric(index: number) {
    setMetrics((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMetricField(index: number, field: string, value: unknown) {
    setMetrics((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  const projectOptions: SelectOption[] = allProjects.map((p) => ({ id: p.id, label: p.title }));
  const eventOptions: SelectOption[] = allEvents.map((e) => ({ id: e.id, label: e.title }));
  const skillOptions: SelectOption[] = allSkills.map((s) => ({ id: s.id, label: s.name }));

  const filteredAwards = awards.filter((a) => {
    if (filterType !== "all" && a.awardType !== filterType) return false;
    if (filterStatus !== "all" && a.publicationStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchIssuer = (a.issuer || "").toLowerCase().includes(q);
      return matchTitle || matchIssuer;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-lg border border-amber-500/40 bg-neutral-900 px-4 py-3 text-sm text-amber-300 shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100">Awards Management</h2>
          <p className="text-sm text-neutral-400">
            Manage Competition Wins, Recognitions, and Academic Achievements.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
        >
          + Create Award
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <input
          type="text"
          placeholder="Search by title or issuer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 focus:border-amber-500 focus:outline-none"
        >
          <option value="all">All Types</option>
          {AWARD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 focus:border-amber-500 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Awards List */}
      <div className="space-y-4">
        {filteredAwards.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center text-neutral-500">
            No awards found.
          </div>
        ) : (
          filteredAwards.map((a) => (
            <div
              key={a._id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3 transition hover:border-neutral-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-neutral-100">{a.title}</h3>
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
                      {a.awardType}
                    </span>
                    {a.placement && (
                      <span className="rounded bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                        {a.placement}
                      </span>
                    )}
                    {a.publicationStatus === "published" && (
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        Published
                      </span>
                    )}
                    {a.publicationStatus === "draft" && (
                      <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        Draft
                      </span>
                    )}
                    {a.publicationStatus === "archived" && (
                      <span className="rounded bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {a.issuer ? `${a.issuer} • ` : ""}
                    {a.dateFormatted}
                    {a.score ? ` • Score: ${a.score}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(a)}
                    className="rounded bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
                  >
                    Edit
                  </button>
                  {a.publicationStatus !== "archived" && (
                    <button
                      onClick={() => setArchiveConfirmAward(a)}
                      className="rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirmAward(a)}
                    className="rounded bg-red-500/10 border border-red-500/30 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {a.summary && <p className="text-xs text-neutral-300 line-clamp-2">{a.summary}</p>}

              {/* Relationships */}
              <div className="flex flex-wrap gap-4 text-xs text-neutral-400 pt-1">
                {a.relatedProject && (
                  <div>
                    <span className="font-semibold text-neutral-500">Related Project: </span>
                    {a.relatedProject.name}
                  </div>
                )}
                {a.relatedEvent && (
                  <div>
                    <span className="font-semibold text-neutral-500">Related Event: </span>
                    {a.relatedEvent.name}
                  </div>
                )}
                {a.skills.length > 0 && (
                  <div>
                    <span className="font-semibold text-neutral-500">Skills: </span>
                    {a.skills.map((s) => s.name).join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-100">
              {selectedAward ? `Edit Award "${selectedAward.title}"` : "Create Canonical Award"}
            </h3>

            {formError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Award Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Award Type *
                  </label>
                  <select
                    value={awardType}
                    onChange={(e) => setAwardType(e.target.value as AwardType)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  >
                    {AWARD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Issuer
                  </label>
                  <input
                    type="text"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="e.g. FAST / IBA"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Placement
                  </label>
                  <input
                    type="text"
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    placeholder="e.g. 1st Place / Runner Up"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Score / Result
                  </label>
                  <input
                    type="text"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 98/100"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Exact Award Date (YYYY-MM-DD) *
                </label>
                <input
                  type="date"
                  required
                  value={dateRaw}
                  onChange={(e) => setDateRaw(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Exact day precision is required for Awards. Partial dates are not accepted.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Summary
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Singular Relationships */}
              <div className="grid gap-4 sm:grid-cols-2">
                <RelationshipSingleSelect
                  label="Related Project"
                  options={projectOptions}
                  selectedId={selectedProjectId}
                  onChange={setSelectedProjectId}
                />

                <RelationshipSingleSelect
                  label="Related Event"
                  options={eventOptions}
                  selectedId={selectedEventId}
                  onChange={setSelectedEventId}
                />
              </div>

              {/* Skills */}
              <RelationshipMultiSelect
                label="Linked Skills"
                options={skillOptions}
                selectedIds={selectedSkillIds}
                onChange={setSelectedSkillIds}
              />

              {/* Metrics Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Award Metrics
                  </label>
                  <button
                    type="button"
                    onClick={addMetric}
                    className="text-xs font-semibold text-amber-400 hover:underline"
                  >
                    + Add Metric
                  </button>
                </div>

                {metrics.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. Teams Beat)"
                      value={m.label}
                      onChange={(e) => updateMetricField(idx, "label", e.target.value)}
                      className="flex-1 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-200"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 45+)"
                      value={m.value}
                      onChange={(e) => updateMetricField(idx, "value", e.target.value)}
                      className="flex-1 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeMetric(idx)}
                      className="text-xs text-red-400 hover:text-red-300 px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Display & Publication Options */}
              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={publicationStatus}
                    onChange={(e) => setPublicationStatus(e.target.value as PublicationStatus)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-300">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded border-neutral-800 bg-neutral-950 text-amber-500 focus:ring-amber-500"
                    />
                    Featured Award
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : selectedAward ? "Save Changes" : "Create Award"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archiveConfirmAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-100">
              Archive Award &quot;{archiveConfirmAward.title}&quot;?
            </h3>
            <p className="text-xs text-neutral-400">
              Archiving retains all award metadata and relationships, but removes it from public rendering eligibility.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setArchiveConfirmAward(null)}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArchive}
                disabled={isSubmitting}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-400">
              Hard Delete Award &quot;{deleteConfirmAward.title}&quot;?
            </h3>
            <p className="text-xs text-neutral-400">
              This will permanently delete the Award document. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmAward(null)}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
