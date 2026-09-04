"use client";

import React, { useState } from "react";
import { PlainEducation } from "@/lib/admin/queries/education";
import { DatePrecision, PublicationStatus } from "@/lib/cms/types";
import { createEducation, updateEducation, archiveEducation, deleteEducation } from "@/actions/education";
import { DatePrecisionInput } from "@/components/admin/cms/DatePrecisionInput";
import { toCmsDateInputValue } from "@/lib/admin/cms-date-input";

interface EducationManagementProps {
  initialEducation: PlainEducation[];
}

export function EducationManagement({ initialEducation }: EducationManagementProps) {
  const [education, setEducation] = useState<PlainEducation[]>(initialEducation);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<PlainEducation | null>(null);
  const [archiveConfirmEd, setArchiveConfirmEd] = useState<PlainEducation | null>(null);
  const [deleteConfirmEd, setDeleteConfirmEd] = useState<PlainEducation | null>(null);

  // Form Fields
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [location, setLocation] = useState("");
  const [startDateRaw, setStartDateRaw] = useState("");
  const [startDatePrecision, setStartDatePrecision] = useState<DatePrecision | "">("");
  const [endDateRaw, setEndDateRaw] = useState("");
  const [endDatePrecision, setEndDatePrecision] = useState<DatePrecision | "">("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [summary, setSummary] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>("draft");

  // UI State
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function openCreateModal() {
    setSelectedEducation(null);
    setInstitution("");
    setDegree("");
    setField("");
    setLocation("");
    setStartDateRaw("");
    setStartDatePrecision("");
    setEndDateRaw("");
    setEndDatePrecision("");
    setIsCurrent(false);
    setSummary("");
    setHighlights([]);
    setDisplayOrder(education.length > 0 ? Math.max(...education.map((e) => e.displayOrder)) + 1 : 1);
    setPublicationStatus("draft");
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(ed: PlainEducation) {
    setSelectedEducation(ed);
    setInstitution(ed.institution);
    setDegree(ed.degree);
    setField(ed.field || "");
    setLocation(ed.location || "");
    setStartDateRaw(toCmsDateInputValue(ed.startDate, ed.startDatePrecision));
    setStartDatePrecision(ed.startDatePrecision || "");
    setEndDateRaw(toCmsDateInputValue(ed.endDate, ed.endDatePrecision));
    setEndDatePrecision(ed.endDatePrecision || "");
    setIsCurrent(ed.isCurrent ?? false);
    setSummary(ed.summary || "");
    setHighlights(ed.highlights || []);
    setDisplayOrder(ed.displayOrder);
    setPublicationStatus(ed.publicationStatus as PublicationStatus);
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedEducation(null);
    setFormError(null);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (!selectedEducation) {
        // Create
        const res = await createEducation({
          institution,
          degree,
          field: field || undefined,
          location: location || undefined,
          startDateRaw: startDateRaw || undefined,
          startDatePrecision: startDatePrecision || undefined,
          endDateRaw: endDateRaw || undefined,
          endDatePrecision: endDatePrecision || undefined,
          isCurrent,
          summary: summary || undefined,
          highlights,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to create Education record.");
          return;
        }

        setEducation((prev) => [...prev, res.data!].sort((a, b) => a.displayOrder - b.displayOrder));
        showToast(`Education record for "${res.data.institution}" created.`);
        closeModal();
      } else {
        // Update
        const res = await updateEducation({
          id: selectedEducation._id,
          institution,
          degree,
          field,
          location,
          startDateRaw,
          startDatePrecision: startDatePrecision || undefined,
          endDateRaw,
          endDatePrecision: endDatePrecision || undefined,
          isCurrent,
          summary,
          highlights,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to update Education record.");
          return;
        }

        setEducation((prev) =>
          prev
            .map((e) => (e._id === selectedEducation._id ? res.data! : e))
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );
        showToast(`Education record for "${res.data.institution}" updated.`);
        closeModal();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(ed: PlainEducation) {
    setIsSubmitting(true);
    try {
      const res = await archiveEducation(ed._id);
      if (!res.success || !res.data) {
        showToast(`Error: ${res.error || "Failed to archive education record."}`);
        return;
      }
      setEducation((prev) => prev.map((e) => (e._id === ed._id ? res.data! : e)));
      showToast(`Education record for "${ed.institution}" archived.`);
      setArchiveConfirmEd(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive education record.";
      showToast(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(ed: PlainEducation) {
    setIsSubmitting(true);
    try {
      const res = await deleteEducation(ed._id);
      if (!res.success) {
        showToast(`Error: ${res.error || "Failed to delete education record."}`);
        return;
      }
      setEducation((prev) => prev.filter((e) => e._id !== ed._id));
      showToast(`Education record for "${ed.institution}" deleted permanently.`);
      setDeleteConfirmEd(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete education record.";
      showToast(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredEd = education.filter((e) => {
    const matchesStatus = filterStatus === "all" || e.publicationStatus === filterStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      e.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.degree.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.field && e.field.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
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

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search education..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orangeWeb/50 w-48"
          />

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
          Add Education
        </button>
      </div>

      {/* Education Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEd.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
            <p className="text-sm text-zinc-400">No education records found matching criteria.</p>
          </div>
        ) : (
          filteredEd.map((ed) => (
            <div
              key={ed._id}
              className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-white text-base">{ed.degree}</h3>
                  {ed.field && <span className="text-zinc-400 text-sm">in {ed.field}</span>}
                  <span className="text-zinc-400 text-sm">@ {ed.institution}</span>
                  {ed.isCurrent && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Enrolled / Current
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      ed.publicationStatus === "published"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : ed.publicationStatus === "draft"
                        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
                    }`}
                  >
                    {ed.publicationStatus}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <span>📅 {ed.dateRangeText || "Dates unspecified"}</span>
                  {ed.location && <span>📍 {ed.location}</span>}
                  <span>Order: {ed.displayOrder}</span>
                </div>

                {ed.summary && <p className="text-xs text-zinc-300 line-clamp-2">{ed.summary}</p>}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => openEditModal(ed)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition"
                >
                  Edit
                </button>
                {ed.publicationStatus !== "archived" && (
                  <button
                    onClick={() => setArchiveConfirmEd(ed)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium transition"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => setDeleteConfirmEd(ed)}
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
                {selectedEducation ? `Edit Education: ${selectedEducation.institution}` : "Create Canonical Education Record"}
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
                    Institution <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Institute of Business Management (IoBM)"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Degree <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. Bachelor of Science"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Karachi, Pakistan"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                  />
                </div>
              </div>

              {/* Dates & Current Enrolled Flag */}
              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCurrentEd"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-orangeWeb focus:ring-0"
                  />
                  <label htmlFor="isCurrentEd" className="text-xs font-medium text-zinc-200 cursor-pointer">
                    Currently enrolled / expecting completion
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
                    label={isCurrent ? "Expected Completion Date" : "End Date"}
                    dateValue={endDateRaw}
                    precision={endDatePrecision}
                    onChange={(val, prec) => {
                      setEndDateRaw(val);
                      setEndDatePrecision(prec);
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Summary (Optional)</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Academic overview..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orangeWeb/50"
                />
              </div>

              {/* Highlights Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Highlights / Coursework</label>
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

              {/* Settings row */}
              <div className="grid grid-cols-2 gap-4">
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
                  {isSubmitting ? "Saving..." : selectedEducation ? "Update Education" : "Create Education"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {archiveConfirmEd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-base font-bold text-amber-400">Archive Education Record</h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to archive education record for <strong>{archiveConfirmEd.institution}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setArchiveConfirmEd(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchive(archiveConfirmEd)}
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
      {deleteConfirmEd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-base font-bold text-red-400">Hard Delete Education Record</h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to permanently delete <strong>{deleteConfirmEd.institution} ({deleteConfirmEd.degree})</strong>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmEd(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmEd)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
