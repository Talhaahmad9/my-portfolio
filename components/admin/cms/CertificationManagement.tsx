"use client";

import React, { useState } from "react";
import { PlainCertification } from "@/lib/admin/queries/achievements";
import { PublicationStatus } from "@/lib/cms/types";
import { createCertification, updateCertification, archiveCertification, deleteCertification, uploadCertificationMedia, removeCertificationMedia } from "@/actions/certifications";
import { RelationshipMultiSelect, SelectOption } from "@/components/admin/cms/RelationshipSelect";

interface CertificationManagementProps {
  initialCertifications: PlainCertification[];
  allSkills: Array<{ id: string; name: string }>;
}

export function CertificationManagement({
  initialCertifications,
  allSkills,
}: CertificationManagementProps) {
  const [certifications, setCertifications] = useState<PlainCertification[]>(initialCertifications);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<PlainCertification | null>(null);
  const [archiveConfirmCert, setArchiveConfirmCert] = useState<PlainCertification | null>(null);
  const [deleteConfirmCert, setDeleteConfirmCert] = useState<PlainCertification | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDateRaw, setIssueDateRaw] = useState("");
  const [expiryDateRaw, setExpiryDateRaw] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>("draft");

  // UI Feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteBlockedError, setDeleteBlockedError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function openCreateModal() {
    setSelectedCert(null);
    setName("");
    setIssuer("");
    setIssueDateRaw("");
    setExpiryDateRaw("");
    setCredentialId("");
    setCredentialUrl("");
    setDescription("");
    setSelectedSkillIds([]);
    setDisplayOrder(certifications.length > 0 ? Math.max(...certifications.map((c) => c.displayOrder)) + 1 : 1);
    setPublicationStatus("draft");
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(cert: PlainCertification) {
    setSelectedCert(cert);
    setName(cert.name);
    setIssuer(cert.issuer);
    setIssueDateRaw(cert.issueDate ? cert.issueDate.split("T")[0] : "");
    setExpiryDateRaw(cert.expiryDate ? cert.expiryDate.split("T")[0] : "");
    setCredentialId(cert.credentialId || "");
    setCredentialUrl(cert.credentialUrl || "");
    setDescription(cert.description || "");
    setSelectedSkillIds(cert.skillIds || cert.skills.map((s) => s.id));
    setDisplayOrder(cert.displayOrder);
    setPublicationStatus(cert.publicationStatus);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (selectedCert) {
        // Edit Mode
        const res = await updateCertification({
          id: selectedCert._id,
          name,
          issuer,
          issueDateRaw,
          expiryDateRaw,
          credentialId,
          credentialUrl,
          description,
          skillIds: selectedSkillIds,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to update Certification.");
          setIsSubmitting(false);
          return;
        }

        setCertifications((prev) => prev.map((c) => (c._id === res.data!._id ? res.data! : c)));
        showToast(`Updated Certification "${res.data.name}" successfully.`);
      } else {
        // Create Mode
        const res = await createCertification({
          name,
          issuer,
          issueDateRaw: issueDateRaw || undefined,
          expiryDateRaw: expiryDateRaw || undefined,
          credentialId: credentialId || undefined,
          credentialUrl: credentialUrl || undefined,
          description: description || undefined,
          skillIds: selectedSkillIds,
          displayOrder,
          publicationStatus,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Failed to create Certification.");
          setIsSubmitting(false);
          return;
        }

        setCertifications((prev) => [res.data!, ...prev]);
        showToast(`Created Certification "${res.data.name}" successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmArchive() {
    if (!archiveConfirmCert) return;
    setIsSubmitting(true);

    try {
      const res = await archiveCertification(archiveConfirmCert._id);
      if (!res.success || !res.data) {
        showToast(res.error || "Failed to archive Certification.");
      } else {
        setCertifications((prev) => prev.map((c) => (c._id === res.data!._id ? res.data! : c)));
        showToast(`Archived Certification "${res.data.name}".`);
      }
    } finally {
      setIsSubmitting(false);
      setArchiveConfirmCert(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmCert) return;
    setIsSubmitting(true);
    setDeleteBlockedError(null);

    try {
      const res = await deleteCertification(deleteConfirmCert._id);
      if (!res.success) {
        setDeleteBlockedError(res.error || "Failed to delete Certification.");
      } else {
        setCertifications((prev) => prev.filter((c) => c._id !== deleteConfirmCert._id));
        showToast(`Deleted Certification "${deleteConfirmCert.name}".`);
        setDeleteConfirmCert(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUploadMedia(id: string, file: File) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const formData = new FormData();
      formData.append("media", file);
      const res = await uploadCertificationMedia(id, formData);
      if (!res.success || !res.data) {
        setFormError(res.error || "Failed to upload media.");
      } else {
        setCertifications((prev) => prev.map((c) => (c._id === res.data!._id ? res.data! : c)));
        if (selectedCert && selectedCert._id === id) {
          setSelectedCert(res.data);
        }
        showToast("Media uploaded successfully.");
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveMedia(id: string) {
    if (!confirm("Are you sure you want to remove this media? This cannot be undone.")) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await removeCertificationMedia(id);
      if (!res.success || !res.data) {
        setFormError(res.error || "Failed to remove media.");
      } else {
        setCertifications((prev) => prev.map((c) => (c._id === res.data!._id ? res.data! : c)));
        if (selectedCert && selectedCert._id === id) {
          setSelectedCert(res.data);
        }
        showToast("Media removed successfully.");
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const skillOptions: SelectOption[] = allSkills.map((s) => ({ id: s.id, label: s.name }));

  const filteredCerts = certifications.filter((c) => {
    if (filterStatus !== "all" && c.publicationStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchIssuer = c.issuer.toLowerCase().includes(q);
      return matchName || matchIssuer;
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
          <h2 className="text-xl font-bold tracking-tight text-neutral-100">Certifications Management</h2>
          <p className="text-sm text-neutral-400">
            Manage Verified Credentials, Online Certificates, and Badges.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
        >
          + Create Certification
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <input
          type="text"
          placeholder="Search by name or issuer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
        />

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

      {/* Certifications List */}
      <div className="space-y-4">
        {filteredCerts.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center text-neutral-500">
            No certifications found.
          </div>
        ) : (
          filteredCerts.map((c) => (
            <div
              key={c._id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3 transition hover:border-neutral-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-neutral-100">{c.name}</h3>
                    {c.mediaUrl && (
                      <span className="rounded bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                        Media Attached
                      </span>
                    )}
                    {c.publicationStatus === "published" && (
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        Published
                      </span>
                    )}
                    {c.publicationStatus === "draft" && (
                      <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        Draft
                      </span>
                    )}
                    {c.publicationStatus === "archived" && (
                      <span className="rounded bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {c.issuer}
                    {c.issueDateFormatted ? ` • Issued: ${c.issueDateFormatted}` : ""}
                    {c.expiryDateFormatted ? ` • Expires: ${c.expiryDateFormatted}` : ""}
                    {c.credentialId ? ` • ID: ${c.credentialId}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="rounded bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
                  >
                    Edit
                  </button>
                  {c.publicationStatus !== "archived" && (
                    <button
                      onClick={() => setArchiveConfirmCert(c)}
                      className="rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDeleteConfirmCert(c);
                      setDeleteBlockedError(null);
                    }}
                    className="rounded bg-red-500/10 border border-red-500/30 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {c.description && <p className="text-xs text-neutral-300 line-clamp-2">{c.description}</p>}

              {/* Skills */}
              {c.skills.length > 0 && (
                <div className="text-xs text-neutral-400 pt-1">
                  <span className="font-semibold text-neutral-500">Skills: </span>
                  {c.skills.map((s) => s.name).join(", ")}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-100">
              {selectedCert ? `Edit Certification "${selectedCert.name}"` : "Create Canonical Certification"}
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
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Issuer *
                  </label>
                  <input
                    type="text"
                    required
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="e.g. Coursera / AWS / IBM"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Issue Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={issueDateRaw}
                    onChange={(e) => setIssueDateRaw(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Expiry Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={expiryDateRaw}
                    onChange={(e) => setExpiryDateRaw(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    placeholder="e.g. CERT-982341"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Credential URL
                  </label>
                  <input
                    type="url"
                    value={credentialUrl}
                    onChange={(e) => setCredentialUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
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

              {/* Skills */}
              <RelationshipMultiSelect
                label="Linked Skills"
                options={skillOptions}
                selectedIds={selectedSkillIds}
                onChange={setSelectedSkillIds}
              />

              {/* Media Attachment Status */}
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 text-xs space-y-3">
                <span className="font-semibold text-neutral-400 uppercase tracking-wider block">
                  Media Attachment
                </span>
                
                {selectedCert?.mediaUrl ? (
                  <div className="space-y-2">
                    <p className="text-sky-300">
                      Certificate media attached. Evidence ID: <span className="font-mono text-neutral-300">{selectedCert.publicId}</span>
                    </p>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleRemoveMedia(selectedCert._id)}
                      className="rounded bg-red-500/10 px-2 py-1 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Remove Media
                    </button>
                    {selectedCert.publicationStatus === "published" && (
                      <p className="text-[10px] text-amber-500 pt-1">
                        Cannot remove media while published. Unpublish first.
                      </p>
                    )}
                  </div>
                ) : selectedCert ? (
                  <div className="space-y-2">
                    <p className="text-neutral-500 italic">No certificate media attached to this record.</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      disabled={isSubmitting}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadMedia(selectedCert._id, file);
                      }}
                      className="block w-full text-xs text-neutral-400 file:mr-2 file:rounded file:border-0 file:bg-neutral-800 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-neutral-300 hover:file:bg-neutral-700 disabled:opacity-50"
                    />
                  </div>
                ) : (
                  <p className="text-neutral-500 italic">Please save the certification first before attaching media.</p>
                )}
                
                <p className="text-[10px] text-neutral-500 pt-1">
                  Media operations save instantly to the cloud.
                </p>
              </div>

              {/* Display Order & Publication Status */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
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
                  {isSubmitting ? "Saving..." : selectedCert ? "Save Changes" : "Create Certification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archiveConfirmCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-100">
              Archive Certification &quot;{archiveConfirmCert.name}&quot;?
            </h3>
            <p className="text-xs text-neutral-400">
              Archiving retains all certification metadata and media, but marks the credential as non-public.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setArchiveConfirmCert(null)}
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
      {deleteConfirmCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-400">
              Hard Delete Certification &quot;{deleteConfirmCert.name}&quot;?
            </h3>

            {deleteBlockedError ? (
              <div className="space-y-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                <p className="font-semibold">{deleteBlockedError}</p>
                <p className="text-neutral-400">
                  Please use <strong className="text-amber-300">Archive</strong> to safely retain certificate evidence.
                </p>
              </div>
            ) : deleteConfirmCert.mediaUrl ? (
              <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
                <p className="font-semibold">Certificate Media Attached</p>
                <p>
                  Hard deletion is blocked for certifications with attached media to prevent orphaned evidence. Please use <strong className="text-amber-200">Archive</strong> instead.
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                This will permanently delete the Certification document. This action cannot be undone.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirmCert(null);
                  setDeleteBlockedError(null);
                }}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
              >
                {deleteBlockedError || deleteConfirmCert.mediaUrl ? "Close" : "Cancel"}
              </button>
              {!deleteBlockedError && !deleteConfirmCert.mediaUrl && (
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
