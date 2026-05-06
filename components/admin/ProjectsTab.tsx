"use client";

import { useMemo, useState } from "react";
import type { IProject } from "@/lib/db/models/Project";
import { Pencil, Plus, Trash2, X, Image as ImageIcon } from "lucide-react";
import { createProject, deleteProject, updateProject } from "@/actions/projects";
import Toast from "@/components/admin/Toast";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/useToast";
import { typography } from "@/lib/typography";

type Mode = "list" | "form";

interface ProjectFormState {
  title: string;
  liveUrl: string;
  githubUrl: string;
  badge: string;
  order: number;
  imageFit: "cover" | "contain";
  existingImages: string[];
  newImages: File[];
}

const initialFormState: ProjectFormState = {
  title: "",
  liveUrl: "",
  githubUrl: "",
  badge: "",
  order: 0,
  imageFit: "cover",
  existingImages: [],
  newImages: [],
};

function getProjectId(project: IProject): string {
  const maybeId = (project as unknown as { _id?: unknown })._id;
  return typeof maybeId === "string" ? maybeId : String(maybeId);
}

function toFormState(project: IProject): ProjectFormState {
  return {
    title: project.title,
    liveUrl: project.liveUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    badge: project.badge ?? "",
    order: project.order,
    imageFit: project.imageFit ?? "cover",
    existingImages: project.images,
    newImages: [],
  };
}

function buildSubmitPayload(form: ProjectFormState): FormData {
  const payload = new FormData();
  payload.set("title", form.title);
  payload.set("description", form.title); // Use title as description fallback
  payload.set("bullets", JSON.stringify([]));
  payload.set("tags", JSON.stringify([]));
  payload.set("imageFit", form.imageFit);
  payload.set("liveUrl", form.liveUrl);
  payload.set("githubUrl", form.githubUrl);
  payload.set("badge", form.badge);
  payload.set("featured", "false");
  payload.set("order", String(form.order));
  payload.set("existingImages", JSON.stringify(form.existingImages));

  form.newImages.forEach((file) => {
    payload.append("images", file);
  });

  return payload;
}

interface ProjectsTabProps {
  projects: IProject[];
}

export default function ProjectsTab({ projects }: ProjectsTabProps) {
  const [mode, setMode] = useState<Mode>("list");
  const [items, setItems] = useState<IProject[]>(projects);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);
  const [form, setForm] = useState<ProjectFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(640);
  const [previewHeight, setPreviewHeight] = useState(360);
  const { toast, showToast, hideToast } = useToast();

  const newImagePreviews = useMemo(
    () => form.newImages.map((file) => ({ file, src: URL.createObjectURL(file) })),
    [form.newImages]
  );

  const primaryImage = useMemo(() => {
    if (newImagePreviews.length > 0) {
      return newImagePreviews[0]?.src ?? null;
    }
    if (form.existingImages.length > 0) {
      return form.existingImages[0] ?? null;
    }
    return null;
  }, [newImagePreviews, form.existingImages]);

  const startCreate = (): void => {
    setEditingId(null);
    setForm(initialFormState);
    setMode("form");
  };

  const startEdit = (project: IProject): void => {
    setEditingId(getProjectId(project));
    setForm(toFormState(project));
    setMode("form");
  };

  const cancelForm = (): void => {
    setEditingId(null);
    setForm(initialFormState);
    setMode("list");
  };

  const requestDelete = (project: IProject): void => {
    setProjectToDelete(project);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!projectToDelete) {
      return;
    }

    const id = getProjectId(projectToDelete);

    const result = await deleteProject(id);
    if (!result.success) {
      showToast(result.error ?? "Failed to delete project", "error");
      return;
    }

    setItems((current) => current.filter((item) => getProjectId(item) !== id));
    setProjectToDelete(null);
    showToast("Project deleted successfully", "success");
  };

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    if (form.existingImages.length === 0 && form.newImages.length === 0) {
      showToast("At least one image is required", "error");
      return;
    }

    setIsSubmitting(true);

    const payload = buildSubmitPayload(form);
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
        return [...current, result.data as IProject].sort((a, b) => a.order - b.order);
      }

      return current
        .map((item) => (getProjectId(item) === editingId ? (result.data as IProject) : item))
        .sort((a, b) => a.order - b.order);
    });

    setIsSubmitting(false);
    showToast(editingId ? "Project updated successfully" : "Project created successfully", "success");
    cancelForm();
  };

  return (
    <section className="space-y-4">
      <div>
        <p className={typography.adminEyebrow}>Projects</p>
        <h2 className={`mt-2 ${typography.adminTitle}`}>Manage projects</h2>
      </div>

      <div className="rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4">
        <p className="text-sm text-platinum">
          Total projects: <span className="font-semibold text-white">{items.length}</span>
        </p>
      </div>

      {mode === "list" ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add New Project
          </button>

          {items.length === 0 ? (
            <p className="rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4 text-sm text-platinum">
              No projects yet. Add your first project to get started.
            </p>
          ) : (
            items
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((project) => {
                const id = getProjectId(project);

                return (
                  <article
                    key={id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-oxfordBlue bg-black/40 p-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {project.images && project.images[0] ? (
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-oxfordBlue/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-oxfordBlue/50 bg-black/50">
                          <ImageIcon className="h-6 w-6 text-platinum/40" aria-hidden="true" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-white">{project.title}</h4>
                        <p className="text-xs text-platinum/70">
                          Order: {project.order} • {project.images.length} image{project.images.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(project)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-oxfordBlue bg-black px-3 py-2 text-sm font-medium text-platinum transition-colors hover:border-orangeWeb hover:text-orangeWeb"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(project)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-500/40 bg-black px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-400 hover:text-red-300"
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
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="space-y-4 rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4">
          <h3 className={typography.adminCardTitle}>
            {editingId ? "Edit project" : "Create project"}
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
                placeholder="Project name"
              />
            </div>

            {/* Live URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Live URL</label>
              <input
                type="url"
                value={form.liveUrl}
                onChange={(e) => setForm((c) => ({ ...c, liveUrl: e.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
                placeholder="https://example.com"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">GitHub URL</label>
              <input
                type="url"
                value={form.githubUrl}
                onChange={(e) => setForm((c) => ({ ...c, githubUrl: e.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
                placeholder="https://github.com/..."
              />
            </div>

            {/* Badge */}
            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Badge (optional)</label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm((c) => ({ ...c, badge: e.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
                placeholder="1st Place — Hackfest 2026"
              />
              <p className="mt-1 text-xs text-platinum/60">Emoji are removed automatically.</p>
            </div>

            {/* Image Fit */}
            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Image Fit</label>
              <select
                value={form.imageFit}
                onChange={(e) =>
                  setForm((c) => ({
                    ...c,
                    imageFit: e.target.value as "cover" | "contain",
                  }))
                }
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              >
                <option value="cover">Cover (fill, may crop)</option>
                <option value="contain">Contain (fit entire image)</option>
              </select>
              <p className="mt-1 text-xs text-platinum/60">
                Cover crops to fit. Contain shows the full image with padding.
              </p>
            </div>

            {/* Order */}
            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Display Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((c) => ({ ...c, order: Number(e.target.value) || 0 }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            {/* Images */}
            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setForm((c) => ({ ...c, newImages: [...c.newImages, ...files] }));
                }}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-sm text-platinum outline-none file:mr-3 file:rounded file:border-0 file:bg-orangeWeb file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
              />
              <p className="mt-1 text-xs text-platinum/60">Select one or more images.</p>

              {/* Existing Images */}
              {form.existingImages.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs text-platinum/70">Current images:</p>
                  <div className="flex flex-wrap gap-2">
                    {form.existingImages.map((url) => (
                      <div key={url} className="relative h-16 w-16 overflow-hidden rounded-md border border-oxfordBlue/50">
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
                          className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-red-500/90 text-white"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {newImagePreviews.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs text-platinum/70">New images ({newImagePreviews.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {newImagePreviews.map(({ file, src }, idx) => (
                      <div key={`${file.name}-${idx}`} className="relative h-16 w-16 overflow-hidden rounded-md border border-orangeWeb/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={file.name} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((c) => ({
                              ...c,
                              newImages: c.newImages.filter((f) => f !== file),
                            }))
                          }
                          className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-red-500/90 text-white"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Preview Viewer */}
              {primaryImage && (
                <div className="mt-4 rounded-lg border border-oxfordBlue bg-black/35 p-4">
                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-platinum/60">
                      Live Preview
                    </p>

                    {/* Dimensions Controls */}
                    <div className="flex flex-wrap gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-platinum/70">Width</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={120}
                            max={1400}
                            value={previewWidth}
                            onChange={(e) =>
                              setPreviewWidth(Math.max(120, Number(e.target.value) || 120))
                            }
                            className="w-24 rounded-md border border-oxfordBlue bg-black px-2 py-1 text-sm text-platinum outline-none focus:border-orangeWeb"
                          />
                          <span className="text-xs text-platinum/60">px</span>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-platinum/70">Height</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={80}
                            max={900}
                            value={previewHeight}
                            onChange={(e) =>
                              setPreviewHeight(Math.max(80, Number(e.target.value) || 80))
                            }
                            className="w-24 rounded-md border border-oxfordBlue bg-black px-2 py-1 text-sm text-platinum outline-none focus:border-orangeWeb"
                          />
                          <span className="text-xs text-platinum/60">px</span>
                        </div>
                      </div>

                      <div className="flex items-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewWidth(640);
                            setPreviewHeight(360);
                          }}
                          className="rounded-md border border-platinum/20 bg-black px-2 py-1 text-xs font-medium text-platinum transition-colors hover:border-orangeWeb hover:text-orangeWeb"
                        >
                          Reset to 16:9
                        </button>
                      </div>
                    </div>

                    {/* Preview Box */}
                    <div className="overflow-auto rounded-md border border-oxfordBlue/70 bg-black/50 p-2">
                      <div
                        className="mx-auto flex items-center justify-center rounded-md border border-platinum/10 bg-black overflow-hidden"
                        style={{
                          width: `${previewWidth}px`,
                          height: `${previewHeight}px`,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={primaryImage}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-platinum/60">
                      Dimensions: {previewWidth} × {previewHeight} px (Aspect ratio: {(previewWidth / previewHeight).toFixed(2)}:1)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 border-t border-oxfordBlue/50 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-md border border-oxfordBlue px-4 py-2 text-sm font-semibold text-platinum transition-colors hover:border-orangeWeb hover:text-orangeWeb"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {toast && (
        <Toast toast={toast} onClose={hideToast} />
      )}

      {projectToDelete && (
        <ConfirmModal
          isOpen={Boolean(projectToDelete)}
          title="Delete Project"
          message="Are you sure you want to delete this project? This cannot be undone."
          onConfirm={() => void confirmDelete()}
          onCancel={() => setProjectToDelete(null)}
        />
      )}
    </section>
  );
}
