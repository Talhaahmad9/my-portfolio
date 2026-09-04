"use client";

import React, { useState } from "react";
import { PlainEvent } from "@/lib/admin/queries/events";
import { DatePrecision, EventType, PublicationStatus } from "@/lib/cms/types";
import { createEvent, updateEvent, archiveEvent, deleteEvent } from "@/actions/events";
import { DatePrecisionInput } from "@/components/admin/cms/DatePrecisionInput";
import { toCmsDateInputValue } from "@/lib/admin/cms-date-input";
import { RelationshipMultiSelect, SelectOption } from "@/components/admin/cms/RelationshipSelect";

interface EventManagementProps {
  initialEvents: PlainEvent[];
  allProjects: Array<{ id: string; title: string }>;
  allRoles: Array<{ id: string; roleTitle: string; organization: string }>;
  allSkills: Array<{ id: string; name: string }>;
}

const EVENT_TYPES: EventType[] = [
  "hackathon",
  "competition",
  "workshop",
  "webinar",
  "conference",
  "community",
  "other",
];

export function EventManagement({
  initialEvents,
  allProjects,
  allRoles,
  allSkills,
}: EventManagementProps) {
  const [events, setEvents] = useState<PlainEvent[]>(initialEvents);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PlainEvent | null>(null);
  const [archiveConfirmEvent, setArchiveConfirmEvent] = useState<PlainEvent | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<PlainEvent | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("hackathon");
  const [organizer, setOrganizer] = useState("");
  const [location, setLocation] = useState("");
  const [startDateRaw, setStartDateRaw] = useState("");
  const [startDatePrecision, setStartDatePrecision] = useState<DatePrecision | "">("day");
  const [endDateRaw, setEndDateRaw] = useState("");
  const [endDatePrecision, setEndDatePrecision] = useState<DatePrecision | "">("");
  const [summary, setSummary] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>("draft");

  // UI Feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDependencies, setDeleteDependencies] = useState<{
    awards?: Array<{ id: string; title: string }>;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function openCreateModal() {
    setSelectedEvent(null);
    setTitle("");
    setEventType("hackathon");
    setOrganizer("");
    setLocation("");
    setStartDateRaw("");
    setStartDatePrecision("day");
    setEndDateRaw("");
    setEndDatePrecision("");
    setSummary("");
    setHighlights([]);
    setSelectedProjectIds([]);
    setSelectedRoleIds([]);
    setSelectedSkillIds([]);
    setFeatured(false);
    setDisplayOrder(events.length > 0 ? Math.max(...events.map((e) => e.displayOrder)) + 1 : 1);
    setPublicationStatus("draft");
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(event: PlainEvent) {
    setSelectedEvent(event);
    setTitle(event.title);
    setEventType(event.eventType);
    setOrganizer(event.organizer || "");
    setLocation(event.location || "");
    setStartDateRaw(toCmsDateInputValue(event.startDate, event.startDatePrecision));
    setStartDatePrecision(event.startDatePrecision || "day");
    setEndDateRaw(toCmsDateInputValue(event.endDate, event.endDatePrecision));
    setEndDatePrecision(event.endDatePrecision || "");
    setSummary(event.summary || "");
    setHighlights(event.highlights || []);
    setSelectedProjectIds(event.projects.map((p) => p.id));
    setSelectedRoleIds(event.roles.map((r) => r.id));
    setSelectedSkillIds(event.skills.map((s) => s.id));
    setFeatured(event.featured ?? false);
    setDisplayOrder(event.displayOrder);
    setPublicationStatus(event.publicationStatus);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (selectedEvent) {
        // Edit Mode
        const res = await updateEvent({
          id: selectedEvent._id,
          title,
          eventType,
          organizer,
          location,
          startDateRaw,
          startDatePrecision: startDatePrecision || undefined,
          endDateRaw,
          endDatePrecision: endDatePrecision || undefined,
          summary,
          highlights,
          projectIds: selectedProjectIds,
          roleIds: selectedRoleIds,
          skillIds: selectedSkillIds,
          featured,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to update Event.");
          setIsSubmitting(false);
          return;
        }

        setEvents((prev) => prev.map((ev) => (ev._id === res.data!._id ? res.data! : ev)));
        showToast(`Updated Event "${res.data.title}" successfully.`);
      } else {
        // Create Mode
        if (!startDatePrecision) {
          setFormError("Start date precision is required.");
          setIsSubmitting(false);
          return;
        }

        const res = await createEvent({
          title,
          eventType,
          organizer: organizer || undefined,
          location: location || undefined,
          startDateRaw,
          startDatePrecision,
          endDateRaw: endDateRaw || undefined,
          endDatePrecision: endDatePrecision || undefined,
          summary: summary || undefined,
          highlights,
          projectIds: selectedProjectIds,
          roleIds: selectedRoleIds,
          skillIds: selectedSkillIds,
          featured,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to create Event.");
          setIsSubmitting(false);
          return;
        }

        setEvents((prev) => [res.data!, ...prev]);
        showToast(`Created Event "${res.data.title}" successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmArchive() {
    if (!archiveConfirmEvent) return;
    setIsSubmitting(true);

    try {
      const res = await archiveEvent(archiveConfirmEvent._id);
      if (!res.success || !res.data) {
        showToast(res.error || "Failed to archive Event.");
      } else {
        setEvents((prev) => prev.map((ev) => (ev._id === res.data!._id ? res.data! : ev)));
        showToast(`Archived Event "${res.data.title}".`);
      }
    } finally {
      setIsSubmitting(false);
      setArchiveConfirmEvent(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmEvent) return;
    setIsSubmitting(true);
    setDeleteDependencies(null);

    try {
      const res = await deleteEvent(deleteConfirmEvent._id);
      if (!res.success) {
        if (res.dependencies) {
          setDeleteDependencies(res.dependencies);
        } else {
          showToast(res.error || "Failed to delete Event.");
          setDeleteConfirmEvent(null);
        }
      } else {
        setEvents((prev) => prev.filter((ev) => ev._id !== deleteConfirmEvent._id));
        showToast(`Deleted Event "${deleteConfirmEvent.title}".`);
        setDeleteConfirmEvent(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Options for relationship multi-selects
  const projectOptions: SelectOption[] = allProjects.map((p) => ({ id: p.id, label: p.title }));
  const roleOptions: SelectOption[] = allRoles.map((r) => ({ id: r.id, label: `${r.roleTitle} — ${r.organization}` }));
  const skillOptions: SelectOption[] = allSkills.map((s) => ({ id: s.id, label: s.name }));

  const filteredEvents = events.filter((ev) => {
    if (filterType !== "all" && ev.eventType !== filterType) return false;
    if (filterStatus !== "all" && ev.publicationStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchOrg = (ev.organizer || "").toLowerCase().includes(q);
      return matchTitle || matchOrg;
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

      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100">Events Management</h2>
          <p className="text-sm text-neutral-400">
            Manage Hackathons, Competitions, Webinars, and Conferences.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
        >
          + Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <input
          type="text"
          placeholder="Search by title or organizer..."
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
          {EVENT_TYPES.map((t) => (
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

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center text-neutral-500">
            No events found.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev._id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3 transition hover:border-neutral-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-neutral-100">{ev.title}</h3>
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
                      {ev.eventType}
                    </span>
                    {ev.publicationStatus === "published" && (
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        Published
                      </span>
                    )}
                    {ev.publicationStatus === "draft" && (
                      <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        Draft
                      </span>
                    )}
                    {ev.publicationStatus === "archived" && (
                      <span className="rounded bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {ev.organizer ? `${ev.organizer} • ` : ""}
                    {ev.dateRangeText}
                    {ev.location ? ` • ${ev.location}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(ev)}
                    className="rounded bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
                  >
                    Edit
                  </button>
                  {ev.publicationStatus !== "archived" && (
                    <button
                      onClick={() => setArchiveConfirmEvent(ev)}
                      className="rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDeleteConfirmEvent(ev);
                      setDeleteDependencies(null);
                    }}
                    className="rounded bg-red-500/10 border border-red-500/30 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {ev.summary && <p className="text-xs text-neutral-300 line-clamp-2">{ev.summary}</p>}

              {/* Relationships */}
              <div className="flex flex-wrap gap-4 text-xs text-neutral-400 pt-1">
                {ev.projects.length > 0 && (
                  <div>
                    <span className="font-semibold text-neutral-500">Projects: </span>
                    {ev.projects.map((p) => p.name).join(", ")}
                  </div>
                )}
                {ev.roles.length > 0 && (
                  <div>
                    <span className="font-semibold text-neutral-500">Roles: </span>
                    {ev.roles.map((r) => r.name).join(", ")}
                  </div>
                )}
                {ev.skills.length > 0 && (
                  <div>
                    <span className="font-semibold text-neutral-500">Skills: </span>
                    {ev.skills.map((s) => s.name).join(", ")}
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
              {selectedEvent ? `Edit Event "${selectedEvent.title}"` : "Create Canonical Event"}
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
                    Event Title *
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
                    Event Type *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Organizer
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. IEEE IoBM Branch"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Karachi, Pakistan / Online"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Start Date & Precision */}
              <DatePrecisionInput
                label="Start Date"
                dateValue={startDateRaw}
                precision={startDatePrecision}
                onChange={(v, p) => {
                  setStartDateRaw(v);
                  setStartDatePrecision(p);
                }}
                optional={false}
              />

              {/* End Date & Precision */}
              <DatePrecisionInput
                label="End Date"
                dateValue={endDateRaw}
                precision={endDatePrecision}
                onChange={(v, p) => {
                  setEndDateRaw(v);
                  setEndDatePrecision(p);
                }}
                optional={true}
              />

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

              {/* Relationships */}
              <RelationshipMultiSelect
                label="Linked Projects"
                options={projectOptions}
                selectedIds={selectedProjectIds}
                onChange={setSelectedProjectIds}
              />

              <RelationshipMultiSelect
                label="Linked Roles"
                options={roleOptions}
                selectedIds={selectedRoleIds}
                onChange={setSelectedRoleIds}
              />

              <RelationshipMultiSelect
                label="Linked Skills"
                options={skillOptions}
                selectedIds={selectedSkillIds}
                onChange={setSelectedSkillIds}
              />

              {/* Options */}
              <div className="grid gap-4 sm:grid-cols-3">
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
                    Featured Event
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
                  {isSubmitting ? "Saving..." : selectedEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {archiveConfirmEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-100">
              Archive Event &quot;{archiveConfirmEvent.title}&quot;?
            </h3>
            <p className="text-xs text-neutral-400">
              Archiving retains all event details and graph relationships, but marks the event as non-public.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setArchiveConfirmEvent(null)}
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

      {/* Delete Modal */}
      {deleteConfirmEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-400">
              Hard Delete Event &quot;{deleteConfirmEvent.title}&quot;?
            </h3>

            {deleteDependencies ? (
              <div className="space-y-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                <p className="font-semibold">
                  Cannot delete Event. It is referenced by incoming Awards:
                </p>
                {deleteDependencies.awards && deleteDependencies.awards.length > 0 && (
                  <div>
                    <span className="font-semibold">Awards: </span>
                    {deleteDependencies.awards.map((a) => a.title).join(", ")}
                  </div>
                )}
                <p className="text-neutral-400">
                  Please use <strong className="text-amber-300">Archive</strong> instead to preserve graph integrity.
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                This will permanently delete the Event document. This action cannot be undone.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirmEvent(null);
                  setDeleteDependencies(null);
                }}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
              >
                {deleteDependencies ? "Close" : "Cancel"}
              </button>
              {!deleteDependencies && (
                <button
                  onClick={handleConfirmDelete}
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
    </div>
  );
}
