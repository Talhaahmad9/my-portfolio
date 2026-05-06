"use client";

import { useMemo, useState } from "react";
import type { IProject } from "@/lib/db/models/Project";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { createProject, deleteProject, updateProject } from "@/actions/projects";
import Toast from "@/components/admin/Toast";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/useToast";
import LoadingButton from "@/components/admin/LoadingButton";
import { typography } from "@/lib/typography";

type Mode = "list" | "form";

interface ProjectFormState {
  title: string;
  description: string;
  bullets: string[];
  tags: string[];
  tagInput: string;
  liveUrl: string;
  githubUrl: string;
  badge: string;
  featured: boolean;
  order: number;
  existingImages: string[];
  newImages: File[];
}

const initialFormState: ProjectFormState = {
  title: "",
  description: "",
  bullets: [""],
  tags: [],
  tagInput: "",
  liveUrl: "",
  githubUrl: "",
  badge: "",
  featured: false,
  order: 0,
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
    description: project.description,
    bullets: project.bullets.length > 0 ? project.bullets : [""],
    tags: project.tags,
    tagInput: "",
    liveUrl: project.liveUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    badge: project.badge ?? "",
    featured: project.featured,
    order: project.order,
    existingImages: project.images,
    newImages: [],
  };
}

function buildSubmitPayload(form: ProjectFormState): FormData {
  const payload = new FormData();
  payload.set("title", form.title);
  payload.set("description", form.description);
  payload.set(
    "bullets",
    JSON.stringify(form.bullets.map((bullet) => bullet.trim()).filter((bullet) => bullet.length > 0))
  );
  payload.set("tags", JSON.stringify(form.tags));
  payload.set("liveUrl", form.liveUrl);
  payload.set("githubUrl", form.githubUrl);
  payload.set("badge", form.badge);
  payload.set("featured", String(form.featured));
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
  const { toast, showToast, hideToast } = useToast();

  const newImagePreviews = useMemo(
    () => form.newImages.map((file) => ({ file, src: URL.createObjectURL(file) })),
    [form.newImages]
  );

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

  const handleAddTag = (): void => {
    const value = form.tagInput.trim();
    if (!value || form.tags.includes(value)) {
      return;
    }

    setForm((current) => ({
      ...current,
      tags: [...current.tags, value],
      tagInput: "",
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting) {
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
                    className="rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{project.title}</h3>
                        <p className="mt-1 text-xs text-platinum/80">Order: {project.order}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={`${id}-${tag}`}
                              className="rounded-full border border-oxfordBlue bg-black px-2.5 py-1 text-xs text-platinum"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.featured ? (
                            <span className="rounded-full bg-orangeWeb/20 px-2.5 py-1 text-xs font-medium text-orangeWeb">
                              Featured
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-2 flex w-full flex-wrap items-center gap-2 sm:mt-0 sm:w-auto">
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
                    </div>
                  </article>
                );
              })
          )}
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4">
          <h3 className={typography.adminCardTitle}>
            {editingId ? "Edit project" : "Create project"}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-platinum">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-platinum">Description</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-platinum">Bullets</label>
              <div className="space-y-2">
                {form.bullets.map((bullet, index) => (
                  <div key={`bullet-${index}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          bullets: current.bullets.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item
                          ),
                        }))
                      }
                      className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          bullets:
                            current.bullets.length === 1
                              ? [""]
                              : current.bullets.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                      className="rounded-md border border-oxfordBlue bg-black p-2 text-platinum hover:text-orangeWeb"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, bullets: [...current.bullets, ""] }))
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-oxfordBlue bg-black px-3 py-1.5 text-xs text-platinum hover:text-orangeWeb"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add bullet
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-platinum">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.tagInput}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tagInput: event.target.value }))
                  }
                  className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
                  placeholder="Type tag and click Add"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-md bg-orangeWeb px-3 py-2 text-xs font-semibold text-black"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-xs text-platinum"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          tags: current.tags.filter((item) => item !== tag),
                        }))
                      }
                      className="text-platinum/70 hover:text-orangeWeb"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Live URL</label>
              <input
                type="url"
                value={form.liveUrl}
                onChange={(event) => setForm((current) => ({ ...current, liveUrl: event.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">GitHub URL</label>
              <input
                type="url"
                value={form.githubUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, githubUrl: event.target.value }))
                }
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Badge</label>
              <input
                type="text"
                value={form.badge}
                onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
                placeholder="1st Place — Hackfest × Datathon 2026"
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
              <p className="mt-2 text-sm text-platinum/70">
                Emoji are removed automatically. Use plain badge text only.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(event) =>
                  setForm((current) => ({ ...current, order: Number(event.target.value) || 0 }))
                }
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                id="featured"
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm((current) => ({ ...current, featured: event.target.checked }))
                }
                className="h-4 w-4 rounded border-oxfordBlue bg-black text-orangeWeb"
              />
              <label htmlFor="featured" className="text-sm text-platinum">
                Mark as featured project
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-platinum">Images</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
                onChange={(event) => {
                  const selected = Array.from(event.target.files ?? []);
                  setForm((current) => ({
                    ...current,
                    newImages: [...current.newImages, ...selected],
                  }));
                }}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-sm text-platinum outline-none file:mr-3 file:rounded file:border-0 file:bg-orangeWeb file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
              />
              <p className="mt-2 text-xs text-platinum/70">
                Supported formats: JPG, PNG, WebP, AVIF, GIF, SVG.
              </p>

              {form.existingImages.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs text-platinum/80">Existing images</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {form.existingImages.map((url) => (
                      <div key={url} className="relative overflow-hidden rounded-md border border-oxfordBlue">
                        <img src={url} alt="Existing project" className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              existingImages: current.existingImages.filter((item) => item !== url),
                            }))
                          }
                          className="absolute right-1 top-1 rounded bg-black/80 p-1 text-platinum hover:text-orangeWeb"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {newImagePreviews.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs text-platinum/80">New image previews</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {newImagePreviews.map(({ file, src }) => (
                      <div
                        key={`${file.name}-${file.lastModified}`}
                        className="relative overflow-hidden rounded-md border border-oxfordBlue"
                      >
                        <img src={src} alt={file.name} className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              newImages: current.newImages.filter(
                                (item) =>
                                  !(
                                    item.name === file.name &&
                                    item.lastModified === file.lastModified &&
                                    item.size === file.size
                                  )
                              ),
                            }))
                          }
                          className="absolute right-1 top-1 rounded bg-black/80 p-1 text-platinum hover:text-orangeWeb"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <LoadingButton
              onClick={() => void handleSubmit()}
              loading={isSubmitting}
              loadingText="Saving..."
              className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {editingId ? "Update Project" : "Create Project"}
            </LoadingButton>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-md border border-oxfordBlue bg-black px-4 py-2 text-sm font-medium text-platinum hover:text-orangeWeb"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        title="Delete project"
        message="Delete this project and all uploaded images? This action cannot be undone."
        onConfirm={() => void confirmDelete()}
        onCancel={() => setProjectToDelete(null)}
      />

      {toast ? <Toast toast={toast} onClose={hideToast} /> : null}
    </section>
  );
}
