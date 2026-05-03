"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Trophy, X } from "lucide-react";
import { createWin, deleteWin } from "@/actions/wins";
import type { IWin } from "@/lib/db/models/Win";
import Toast from "@/components/admin/Toast";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/useToast";

interface WinsTabProps {
  wins: IWin[];
}

interface WinFormState {
  title: string;
  event: string;
  place: string;
  score: string;
  date: string;
  description: string;
  stack: string[];
  stackInput: string;
}

const initialFormState: WinFormState = {
  title: "",
  event: "",
  place: "",
  score: "",
  date: "",
  description: "",
  stack: [],
  stackInput: "",
};

function getWinId(win: IWin): string {
  const maybeId = (win as unknown as { _id?: unknown })._id;
  return typeof maybeId === "string" ? maybeId : String(maybeId);
}

function formatWinDate(value: Date | string): string {
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

export default function WinsTab({ wins }: WinsTabProps) {
  const [items, setItems] = useState<IWin[]>(wins);
  const [view, setView] = useState<"list" | "form">("list");
  const [winToDelete, setWinToDelete] = useState<IWin | null>(null);
  const [form, setForm] = useState<WinFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const startAdd = (): void => {
    setForm(initialFormState);
    setView("form");
  };

  const cancelAdd = (): void => {
    setForm(initialFormState);
    setView("list");
  };

  const handleAddStack = (): void => {
    const value = form.stackInput.trim();
    if (!value || form.stack.includes(value)) {
      return;
    }

    setForm((current) => ({
      ...current,
      stack: [...current.stack, value],
      stackInput: "",
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: form.title,
      event: form.event,
      place: form.place,
      score: form.score,
      date: form.date,
      description: form.description,
      stack: form.stack,
    };

    const result = await createWin(payload);

    if (!result.success || !result.data) {
      showToast(result.error ?? "Failed to create win", "error");
      setIsSubmitting(false);
      return;
    }

    setItems((current) => {
      const next = [...current, result.data as IWin];
      return next.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    setIsSubmitting(false);
    showToast("Win created successfully", "success");
    cancelAdd();
  };

  const requestDelete = (win: IWin): void => {
    setWinToDelete(win);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!winToDelete) {
      return;
    }

    const id = getWinId(winToDelete);
    const result = await deleteWin(id);

    if (!result.success) {
      showToast(result.error ?? "Failed to delete win", "error");
      return;
    }

    setItems((current) => current.filter((item) => getWinId(item) !== id));
    setWinToDelete(null);
    showToast("Win deleted successfully", "success");
  };

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb">Hall of Fame</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Manage wins</h2>
      </div>

      <div className="rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4">
        <p className="text-sm text-platinum">
          Total wins: <span className="font-semibold text-white">{items.length}</span>
        </p>
      </div>

      {view === "list" ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Win
          </button>

          {items.length === 0 ? (
            <p className="rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4 text-sm text-platinum">
              No wins yet. Add your first Hall of Fame entry.
            </p>
          ) : (
            items.map((win) => {
              const id = getWinId(win);

              return (
                <article
                  key={id}
                  className="rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-orangeWeb" aria-hidden="true" />
                        <h3 className="text-base font-semibold text-white">{win.title}</h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-orangeWeb/30 bg-orangeWeb/15 px-2.5 py-1 font-medium text-orangeWeb">
                          {win.place}
                        </span>
                        <span className="text-platinum">{win.event}</span>
                        {win.score ? (
                          <span className="rounded-full border border-oxfordBlue bg-black px-2.5 py-1 text-platinum">
                            Score: {win.score}
                          </span>
                        ) : null}
                        <span className="text-platinum/80">{formatWinDate(win.date)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => requestDelete(win)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-500/40 bg-black px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-400 hover:text-red-300"
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
        <div className="space-y-4 rounded-xl border border-oxfordBlue bg-oxfordBlue/40 p-4">
          <h3 className="text-lg font-semibold text-white">Add win</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Event</label>
              <input
                type="text"
                value={form.event}
                onChange={(event) => setForm((current) => ({ ...current, event: event.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Place</label>
              <input
                type="text"
                value={form.place}
                onChange={(event) => setForm((current) => ({ ...current, place: event.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-platinum">Score (optional)</label>
              <input
                type="text"
                value={form.score}
                onChange={(event) => setForm((current) => ({ ...current, score: event.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-platinum">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-platinum">
                Description (optional)
              </label>
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
              <label className="mb-2 block text-sm font-medium text-platinum">Stack (optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.stackInput}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, stackInput: event.target.value }))
                  }
                  className="w-full rounded-md border border-oxfordBlue bg-black px-3 py-2 text-platinum outline-none focus:border-orangeWeb"
                  placeholder="Type stack item and click Add"
                />
                <button
                  type="button"
                  onClick={handleAddStack}
                  className="rounded-md bg-orangeWeb px-3 py-2 text-xs font-semibold text-black"
                >
                  Add
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {form.stack.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-xs text-platinum"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          stack: current.stack.filter((stackItem) => stackItem !== item),
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {isSubmitting ? "Saving..." : "Create Win"}
            </button>
            <button
              type="button"
              onClick={cancelAdd}
              className="rounded-md border border-oxfordBlue bg-black px-4 py-2 text-sm font-medium text-platinum hover:text-orangeWeb"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(winToDelete)}
        title="Delete win"
        message="Delete this Hall of Fame entry? This action cannot be undone."
        onConfirm={() => void confirmDelete()}
        onCancel={() => setWinToDelete(null)}
      />

      {toast ? <Toast toast={toast} onClose={hideToast} /> : null}
    </section>
  );
}
