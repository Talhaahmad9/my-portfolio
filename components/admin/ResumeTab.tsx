"use client";

import { useMemo, useState } from "react";
import { CheckCircle, ExternalLink, Loader2, Trash2, Upload } from "lucide-react";
import { deleteResume, setActiveResume, uploadResume } from "@/actions/resume";
import type { IResume } from "@/lib/db/models/Resume";
import Toast from "@/components/admin/Toast";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/useToast";

interface ResumeTabProps {
  activeResume: IResume | null;
  resumes: IResume[];
}

function getResumeId(resume: IResume): string {
  const maybeId = (resume as unknown as { _id?: unknown })._id;
  return typeof maybeId === "string" ? maybeId : String(maybeId);
}

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(2)} MB`;
}

export default function ResumeTab({ activeResume, resumes }: ResumeTabProps) {
  const [items, setItems] = useState<IResume[]>(resumes);
  const [activeId, setActiveId] = useState<string | null>(
    activeResume ? getResumeId(activeResume) : null
  );
  const [label, setLabel] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rowLoadingId, setRowLoadingId] = useState<string | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<IResume | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      ),
    [items]
  );

  const resolvedActive =
    sortedItems.find((resume) => getResumeId(resume) === activeId) ?? null;

  const handleUpload = async (): Promise<void> => {
    if (isUploading) {
      return;
    }

    if (!selectedFile) {
      showToast("Please select a PDF file", "error");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.set("label", label);
    formData.set("file", selectedFile);

    const result = await uploadResume(formData);
    if (!result.success || !result.data) {
      showToast(result.error ?? "Failed to upload resume", "error");
      setIsUploading(false);
      return;
    }

    setItems((current) => [result.data as IResume, ...current]);
    setLabel("");
    setSelectedFile(null);
    setIsUploading(false);
    showToast("Resume uploaded successfully", "success");
  };

  const handleSetActive = async (resume: IResume): Promise<void> => {
    const id = getResumeId(resume);
    if (id === activeId || rowLoadingId) {
      return;
    }

    setRowLoadingId(id);

    const result = await setActiveResume(id);
    if (!result.success) {
      showToast(result.error ?? "Failed to set active resume", "error");
      setRowLoadingId(null);
      return;
    }

    setItems((current) =>
      current.map((item) => {
        const itemId = getResumeId(item);
        return {
          ...item,
          isActive: itemId === id,
        };
      }) as IResume[]
    );
    setActiveId(id);
    setRowLoadingId(null);
    showToast("Active resume updated", "success");
  };

  const requestDelete = (resume: IResume): void => {
    setResumeToDelete(resume);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!resumeToDelete || rowLoadingId) {
      return;
    }

    const id = getResumeId(resumeToDelete);

    setRowLoadingId(id);

    const result = await deleteResume(id);
    if (!result.success) {
      showToast(result.error ?? "Failed to delete resume", "error");
      setRowLoadingId(null);
      return;
    }

    setItems((current) => current.filter((item) => getResumeId(item) !== id));
    setActiveId((current) => (current === id ? null : current));
    setRowLoadingId(null);
    setResumeToDelete(null);
    showToast("Resume deleted successfully", "success");
  };

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb">Resume</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Manage resume files</h2>
      </div>

      <div className="rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4">
        <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb">Active Resume</p>
        {resolvedActive ? (
          <div className="mt-3 space-y-2">
            <h3 className="text-base font-semibold text-white">{resolvedActive.label}</h3>
            <p className="text-sm text-platinum">Uploaded {formatDate(resolvedActive.uploadedAt)}</p>
            <a
              href={resolvedActive.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-orangeWeb hover:underline"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Download active resume
            </a>
          </div>
        ) : (
          <p className="mt-3 text-sm text-platinum">No active resume</p>
        )}
      </div>

      <div className="rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4 space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb">Upload PDF</p>

        <div>
          <label className="mb-2 block text-sm text-platinum">Label</label>
          <input
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Full-Stack CV - May 2026"
            className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-platinum">PDF file</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
            }}
            className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-sm text-platinum outline-none file:mr-3 file:rounded file:border-0 file:bg-orangeWeb file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
          />
          {selectedFile ? (
            <p className="mt-2 text-xs text-platinum/80">Selected: {formatFileSize(selectedFile.size)}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void handleUpload()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          {isUploading ? "Uploading..." : "Upload Resume"}
        </button>
      </div>

      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <p className="rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4 text-sm text-platinum">
            No resumes found.
          </p>
        ) : (
          sortedItems.map((resume) => {
            const id = getResumeId(resume);
            const isActive = id === activeId;
            const isRowLoading = rowLoadingId === id;

            return (
              <article
                key={id}
                className={`rounded-xl border p-4 ${
                  isActive
                    ? "border-orangeWeb bg-orangeWeb/10"
                    : "border-oxfordBlue bg-oxfordBlue/40"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{resume.label}</h3>
                    <p className="mt-1 text-sm text-platinum">Uploaded {formatDate(resume.uploadedAt)}</p>
                    {isActive ? (
                      <span className="mt-2 inline-flex rounded-full bg-orangeWeb/20 px-2.5 py-1 text-xs font-medium text-orangeWeb">
                        Active
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-oxfordBlue bg-black px-3 py-1.5 text-xs font-medium text-platinum hover:text-orangeWeb"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Download
                    </a>

                    <button
                      type="button"
                      onClick={() => void handleSetActive(resume)}
                      disabled={isActive || isRowLoading}
                      className="inline-flex items-center gap-1.5 rounded-md border border-oxfordBlue bg-black px-3 py-1.5 text-xs font-medium text-platinum hover:text-orangeWeb disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRowLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      Set Active
                    </button>

                    <button
                      type="button"
                      onClick={() => requestDelete(resume)}
                      disabled={isRowLoading}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-500/40 bg-black px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRowLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(resumeToDelete)}
        title="Delete resume"
        message="Delete this resume file? This action cannot be undone."
        onConfirm={() => void confirmDelete()}
        onCancel={() => setResumeToDelete(null)}
      />

      {toast ? <Toast toast={toast} onClose={hideToast} /> : null}
    </section>
  );
}
