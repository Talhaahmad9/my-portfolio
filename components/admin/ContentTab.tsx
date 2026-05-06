"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImagePlus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  updateHero,
  updateAbout,
  updateAchievements,
  updateSkills,
} from "@/actions/config";
import type { SiteConfigPlain } from "@/actions/config";
import type { IAchievement, ICertification, ISkillGroup } from "@/lib/db/models/SiteConfig";
import Toast from "@/components/admin/Toast";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/useToast";
import LoadingButton from "@/components/admin/LoadingButton";
import { typography } from "@/lib/typography";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContentTabProps {
  config: SiteConfigPlain;
}

type Section = "hero" | "about" | "achievements" | "skills";

// ─── Achievement form state ───────────────────────────────────────────────────

interface AchievementForm {
  title: string;
  event: string;
  place: string;
  score: string;
  description: string;
  liveUrl: string;
  githubUrl: string;
  stack: string[];
  stackInput: string;
}

const blankAchievement = (): AchievementForm => ({
  title: "",
  event: "",
  place: "",
  score: "",
  description: "",
  liveUrl: "",
  githubUrl: "",
  stack: [],
  stackInput: "",
});

function achievementToForm(a: IAchievement): AchievementForm {
  return {
    title: a.title,
    event: a.event,
    place: a.place,
    score: a.score ?? "",
    description: a.description ?? "",
    liveUrl: a.liveUrl ?? "",
    githubUrl: a.githubUrl ?? "",
    stack: a.stack ?? [],
    stackInput: "",
  };
}

// ─── Skill group form state ───────────────────────────────────────────────────

interface SkillGroupForm {
  category: string;
  items: string[];
  itemInput: string;
}

const blankSkillGroup = (): SkillGroupForm => ({
  category: "",
  items: [],
  itemInput: "",
});

function skillGroupToForm(g: ISkillGroup): SkillGroupForm {
  return { category: g.category, items: g.items, itemInput: "" };
}

// ─── Cert form state ──────────────────────────────────────────────────────────

interface CertForm {
  publicId: string;
  name: string;
  issuer: string;
  imageUrl: string;
  newImage: File | null;
  previewUrl: string | null;
  removeImage: boolean;
}

const blankCert = (): CertForm => ({
  publicId: "",
  name: "",
  issuer: "",
  imageUrl: "",
  newImage: null,
  previewUrl: null,
  removeImage: false,
});

function certificationToForm(certification: ICertification): CertForm {
  return {
    publicId: certification.publicId ?? "",
    name: certification.name,
    issuer: certification.issuer,
    imageUrl: certification.imageUrl ?? "",
    newImage: null,
    previewUrl: null,
    removeImage: false,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContentTab({ config }: ContentTabProps) {
  const { toast, showToast, hideToast } = useToast();
  const [activeSection, setActiveSection] = useState<Section>("hero");

  // ── Hero state ──────────────────────────────────────────────────────────────
  const [tagline, setTagline] = useState(config.hero.tagline);
  const [typewriterStrings, setTypewriterStrings] = useState<string[]>(
    config.hero.typewriterStrings
  );
  const [newTypewriterString, setNewTypewriterString] = useState("");
  const [heroLoading, setHeroLoading] = useState(false);

  // ── About state ─────────────────────────────────────────────────────────────
  const [bio, setBio] = useState(config.about.bio);
  const [certs, setCerts] = useState<CertForm[]>(
    config.about.certifications.map(certificationToForm)
  );
  const [aboutLoading, setAboutLoading] = useState(false);

  // ── Achievements state ──────────────────────────────────────────────────────
  const [achievements, setAchievements] = useState<IAchievement[]>(config.about.achievements);
  const [achievementView, setAchievementView] = useState<"list" | "form">("list");
  const [editingAchievementIndex, setEditingAchievementIndex] = useState<number | null>(null);
  const [achievementForm, setAchievementForm] = useState<AchievementForm>(blankAchievement);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [deleteAchievementIndex, setDeleteAchievementIndex] = useState<number | null>(null);

  // ── Skills state ────────────────────────────────────────────────────────────
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillGroupForms, setSkillGroupForms] = useState<SkillGroupForm[]>(
    config.about.skills.map(skillGroupToForm)
  );
  const [deleteSkillIndex, setDeleteSkillIndex] = useState<number | null>(null);

  // ── Hero handlers ───────────────────────────────────────────────────────────

  const handleHeroSave = async () => {
    setHeroLoading(true);
    const result = await updateHero({ tagline, typewriterStrings });
    setHeroLoading(false);
    if (result.success) {
      showToast("Hero section saved.", "success");
    } else {
      showToast(result.error ?? "Failed to save hero.", "error");
    }
  };

  const addTypewriterString = () => {
    const trimmed = newTypewriterString.trim();
    if (!trimmed) return;
    setTypewriterStrings((prev) => [...prev, trimmed]);
    setNewTypewriterString("");
  };

  const removeTypewriterString = (index: number) => {
    setTypewriterStrings((prev) => prev.filter((_, i) => i !== index));
  };

  const moveTypewriterString = (index: number, direction: "up" | "down") => {
    setTypewriterStrings((prev) => {
      const copy = [...prev];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= copy.length) return prev;
      [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
      return copy;
    });
  };

  // ── About handlers ──────────────────────────────────────────────────────────

  const handleAboutSave = async () => {
    const payload = new FormData();
    payload.set("bio", bio);
    payload.set(
      "certifications",
      JSON.stringify(
        certs.map((cert) => ({
          publicId: cert.publicId,
          name: cert.name,
          issuer: cert.issuer,
          imageUrl: cert.imageUrl,
          removeImage: cert.removeImage,
        }))
      )
    );

    certs.forEach((cert, index) => {
      if (cert.newImage) {
        payload.set(`certificateImage_${index}`, cert.newImage);
      }
    });

    setAboutLoading(true);
    const result = await updateAbout(payload);
    setAboutLoading(false);
    if (result.success) {
      if (result.data) {
        setBio(result.data.bio);
        setCerts(result.data.certifications.map(certificationToForm));
      }
      showToast("About section saved.", "success");
    } else {
      showToast(result.error ?? "Failed to save about.", "error");
    }
  };

  const addCert = () => setCerts((prev) => [...prev, blankCert()]);
  const removeCert = (i: number) =>
    setCerts((prev) => {
      const target = prev[i];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== i);
    });
  const updateCert = (i: number, field: "name" | "issuer", value: string) =>
    setCerts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

  const updateCertImage = (i: number, file: File | null) =>
    setCerts((prev) =>
      prev.map((cert, idx) => {
        if (idx !== i) return cert;
        if (cert.previewUrl) {
          URL.revokeObjectURL(cert.previewUrl);
        }
        return {
          ...cert,
          newImage: file,
          previewUrl: file ? URL.createObjectURL(file) : null,
          removeImage: false,
        };
      })
    );

  const removeCertImage = (i: number) =>
    setCerts((prev) =>
      prev.map((cert, idx) => {
        if (idx !== i) return cert;
        if (cert.previewUrl) {
          URL.revokeObjectURL(cert.previewUrl);
        }
        return {
          ...cert,
          imageUrl: "",
          newImage: null,
          previewUrl: null,
          removeImage: true,
        };
      })
    );

  // ── Achievements handlers ───────────────────────────────────────────────────

  const openAddAchievement = () => {
    setEditingAchievementIndex(null);
    setAchievementForm(blankAchievement());
    setAchievementView("form");
  };

  const openEditAchievement = (index: number) => {
    const a = achievements[index];
    if (!a) return;
    setEditingAchievementIndex(index);
    setAchievementForm(achievementToForm(a));
    setAchievementView("form");
  };

  const saveAchievement = async () => {
    const { stackInput: _si, ...rest } = achievementForm; void _si;
    const updated =
      editingAchievementIndex !== null
        ? achievements.map((a, i) => (i === editingAchievementIndex ? (rest as IAchievement) : a))
        : [...achievements, rest as IAchievement];

    setAchievementsLoading(true);
    const result = await updateAchievements(updated);
    setAchievementsLoading(false);

    if (result.success) {
      setAchievements(updated);
      setAchievementView("list");
      showToast(
        editingAchievementIndex !== null ? "Achievement updated." : "Achievement added.",
        "success"
      );
    } else {
      showToast(result.error ?? "Failed to save achievement.", "error");
    }
  };

  const confirmDeleteAchievement = async () => {
    if (deleteAchievementIndex === null) return;
    const updated = achievements.filter((_, i) => i !== deleteAchievementIndex);
    setAchievementsLoading(true);
    const result = await updateAchievements(updated);
    setAchievementsLoading(false);
    setDeleteAchievementIndex(null);
    if (result.success) {
      setAchievements(updated);
      showToast("Achievement deleted.", "success");
    } else {
      showToast(result.error ?? "Failed to delete achievement.", "error");
    }
  };

  const moveAchievement = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= achievements.length) return;

    const updated = [...achievements];
    [updated[index], updated[targetIndex]] = [updated[targetIndex]!, updated[index]!];

    setAchievementsLoading(true);
    const result = await updateAchievements(updated);
    setAchievementsLoading(false);

    if (result.success) {
      setAchievements(updated);
      showToast("Achievement order updated.", "success");
    } else {
      showToast(result.error ?? "Failed to reorder achievements.", "error");
    }
  };

  const addAchievementStackChip = () => {
    const trimmed = achievementForm.stackInput.trim();
    if (!trimmed) return;
    setAchievementForm((prev) => ({
      ...prev,
      stack: [...prev.stack, trimmed],
      stackInput: "",
    }));
  };

  // ── Skills handlers ─────────────────────────────────────────────────────────

  const handleSkillsSave = async () => {
    const data = skillGroupForms.map((g) => ({ category: g.category, items: g.items }));
    setSkillsLoading(true);
    const result = await updateSkills(data);
    setSkillsLoading(false);
    if (result.success) {
      showToast("Skills saved.", "success");
    } else {
      showToast(result.error ?? "Failed to save skills.", "error");
    }
  };

  const addSkillGroup = () =>
    setSkillGroupForms((prev) => [...prev, blankSkillGroup()]);

  const removeSkillGroup = (i: number) =>
    setSkillGroupForms((prev) => prev.filter((_, idx) => idx !== i));

  const updateSkillGroup = (i: number, updates: Partial<SkillGroupForm>) =>
    setSkillGroupForms((prev) =>
      prev.map((g, idx) => (idx === i ? { ...g, ...updates } : g))
    );

  const addSkillItem = (groupIndex: number) => {
    const trimmed = skillGroupForms[groupIndex]?.itemInput.trim();
    if (!trimmed) return;
    updateSkillGroup(groupIndex, {
      items: [...(skillGroupForms[groupIndex]?.items ?? []), trimmed],
      itemInput: "",
    });
  };

  const removeSkillItem = (groupIndex: number, itemIndex: number) => {
    const current = skillGroupForms[groupIndex];
    if (!current) return;
    updateSkillGroup(groupIndex, {
      items: current.items.filter((_, i) => i !== itemIndex),
    });
  };

  // ── Section nav ─────────────────────────────────────────────────────────────

  const sections: { id: Section; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "about", label: "About & Bio" },
    { id: "achievements", label: "Achievements" },
    { id: "skills", label: "Technical Skills" },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {toast && <Toast toast={toast} onClose={hideToast} />}

      <ConfirmModal
        isOpen={deleteAchievementIndex !== null}
        title="Delete Achievement"
        message="Delete this achievement? This cannot be undone."
        onConfirm={() => void confirmDeleteAchievement()}
        onCancel={() => setDeleteAchievementIndex(null)}
      />

      <ConfirmModal
        isOpen={deleteSkillIndex !== null}
        title="Delete Skill Category"
        message="Delete this skill category? This cannot be undone."
        onConfirm={() => {
          if (deleteSkillIndex !== null) removeSkillGroup(deleteSkillIndex);
          setDeleteSkillIndex(null);
        }}
        onCancel={() => setDeleteSkillIndex(null)}
      />

      <div className="mb-6">
        <p className={typography.adminEyebrow}>Admin · Content</p>
        <h2 className="mt-1 font-heading text-2xl font-semibold text-white">
          Site Content
        </h2>
      </div>

      {/* Sub-navigation */}
      <div className="mb-8 flex gap-2 overflow-x-auto border-b border-platinum/10 pb-px">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`whitespace-nowrap border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
              activeSection === s.id
                ? "border-orangeWeb text-orangeWeb"
                : "border-transparent text-platinum hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      {activeSection === "hero" && (
        <div className="space-y-6 max-w-2xl">
          {/* Tagline */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">Tagline</label>
            <textarea
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-platinum/20 bg-oxfordBlue px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
            />
          </div>

          {/* Typewriter strings */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">
              Typewriter Strings
            </label>
            <div className="space-y-2">
              {typewriterStrings.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 rounded-md border border-platinum/15 bg-black px-3 py-2 text-sm text-platinum">
                    {s}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveTypewriterString(i, "up")}
                    disabled={i === 0}
                    className="p-1.5 text-platinum hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTypewriterString(i, "down")}
                    disabled={i === typewriterStrings.length - 1}
                    className="p-1.5 text-platinum hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTypewriterString(i)}
                    className="p-1.5 text-platinum hover:text-orangeWeb"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Add a new role or title…"
                value={newTypewriterString}
                onChange={(e) => setNewTypewriterString(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTypewriterString()}
                className="flex-1 rounded-md border border-platinum/20 bg-oxfordBlue px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
              />
              <button
                type="button"
                onClick={addTypewriterString}
                className="rounded-md bg-oxfordBlue border border-platinum/20 px-3 py-2 text-sm text-platinum hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <LoadingButton
            onClick={() => void handleHeroSave()}
            loading={heroLoading}
            loadingText="Saving Hero..."
            className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black hover:bg-orangeWeb/90 disabled:opacity-60"
          >
            Save Hero
          </LoadingButton>
        </div>
      )}

      {/* ── About & Bio ───────────────────────────────────────────────────── */}
      {activeSection === "about" && (
        <div className="space-y-6 max-w-2xl">
          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">Bio</label>
            <p className="mb-2 text-xs text-platinum/60">
              Separate paragraphs with a blank line.
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={10}
              className="w-full rounded-md border border-platinum/20 bg-oxfordBlue px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
            />
          </div>

          {/* Certifications */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-white">Certifications</label>
              <button
                type="button"
                onClick={addCert}
                className="inline-flex items-center gap-1 text-xs text-platinum hover:text-orangeWeb"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {certs.map((cert, i) => (
                <div
                  key={cert.publicId || i}
                  className="space-y-4 rounded-lg border border-platinum/10 bg-oxfordBlue p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Certificate name"
                        value={cert.name}
                        onChange={(e) => updateCert(i, "name", e.target.value)}
                        className="w-full rounded-md border border-platinum/20 bg-black px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
                      />
                      <input
                        type="text"
                        placeholder="Issuer"
                        value={cert.issuer}
                        onChange={(e) => updateCert(i, "issuer", e.target.value)}
                        className="w-full rounded-md border border-platinum/20 bg-black px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCert(i)}
                      className="p-2 text-platinum hover:text-orangeWeb"
                      aria-label={`Remove ${cert.name || "certificate"}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                    <div className="overflow-hidden rounded-lg border border-platinum/10 bg-black/40">
                      {cert.previewUrl || cert.imageUrl ? (
                        <div className="relative h-40 w-full">
                          <Image
                            src={cert.previewUrl ?? cert.imageUrl}
                            alt={cert.name || "Certificate preview"}
                            fill
                            sizes="140px"
                            unoptimized={Boolean(cert.previewUrl)}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-40 flex-col items-center justify-center gap-2 px-4 text-center text-platinum/55">
                          <ImagePlus className="h-6 w-6" />
                          <p className="text-xs">Upload a certificate image</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-platinum/60">
                          Certificate Image
                        </label>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/avif"
                          onChange={(e) => updateCertImage(i, e.target.files?.[0] ?? null)}
                          className="block w-full text-sm text-platinum file:mr-3 file:rounded-md file:border file:border-platinum/20 file:bg-black file:px-3 file:py-2 file:text-sm file:text-platinum hover:file:text-white"
                        />
                        <p className="mt-2 text-xs text-platinum/60">
                          JPG, PNG, WebP, or AVIF. Max 5MB.
                        </p>
                      </div>

                      {cert.publicId ? (
                        <div className="rounded-md border border-platinum/10 bg-black/40 px-3 py-2">
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-platinum/50">
                            Share URL
                          </p>
                          <p className="mt-1 break-all text-xs text-platinum">
                            /certificates/{cert.publicId}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-platinum/60">
                          The share URL is created automatically after the first save.
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {(cert.previewUrl || cert.imageUrl) && (
                          <button
                            type="button"
                            onClick={() => removeCertImage(i)}
                            className="text-xs text-platinum hover:text-orangeWeb"
                          >
                            Remove image
                          </button>
                        )}
                        {cert.publicId && cert.imageUrl && !cert.previewUrl && (
                          <a
                            href={`/certificates/${cert.publicId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-orangeWeb hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open public page
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <LoadingButton
            onClick={() => void handleAboutSave()}
            loading={aboutLoading}
            loadingText="Saving About..."
            className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black hover:bg-orangeWeb/90 disabled:opacity-60"
          >
            Save About
          </LoadingButton>
        </div>
      )}

      {/* ── Achievements ──────────────────────────────────────────────────── */}
      {activeSection === "achievements" && (
        <div className="max-w-2xl">
          {achievementView === "list" && (
            <>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-xs text-platinum/60">
                  The list order controls slideshow order on the public About section.
                </p>
                <button
                  type="button"
                  onClick={openAddAchievement}
                  className="inline-flex items-center gap-2 rounded-md border border-platinum/20 px-3 py-2 text-sm text-platinum hover:text-white"
                >
                  <Plus className="h-4 w-4" /> Add Achievement
                </button>
              </div>
              {achievements.length === 0 && (
                <p className="text-sm text-platinum/60">No achievements yet.</p>
              )}
              <div className="space-y-3">
                {achievements.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-platinum/10 bg-oxfordBlue px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-orangeWeb/80">
                        Slide {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="truncate text-sm font-medium text-white">{a.title}</p>
                      <p className="text-xs text-platinum">{a.event} · {a.place}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => void moveAchievement(i, "up")}
                        disabled={achievementsLoading || i === 0}
                        className="p-1.5 text-platinum hover:text-white disabled:opacity-30"
                        aria-label={`Move ${a.title} up`}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveAchievement(i, "down")}
                        disabled={achievementsLoading || i === achievements.length - 1}
                        className="p-1.5 text-platinum hover:text-white disabled:opacity-30"
                        aria-label={`Move ${a.title} down`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditAchievement(i)}
                        className="rounded-md px-2 py-1 text-xs text-platinum hover:text-orangeWeb"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteAchievementIndex(i)}
                        className="p-1.5 text-platinum hover:text-orangeWeb"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {achievementView === "form" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">
                {editingAchievementIndex !== null ? "Edit Achievement" : "New Achievement"}
              </h3>

              {[
                { label: "Title *", key: "title", placeholder: "e.g. Hackfest × Datathon 2026" },
                { label: "Event / Organizer *", key: "event", placeholder: "e.g. IBA Karachi" },
                { label: "Place *", key: "place", placeholder: "e.g. 1st Place" },
                { label: "Score", key: "score", placeholder: "e.g. 88/100" },
                { label: "Project Description", key: "description", placeholder: "Brief project description" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-white">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={(achievementForm as unknown as Record<string, string>)[key] ?? ""}
                    onChange={(e) =>
                      setAchievementForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full rounded-md border border-platinum/20 bg-oxfordBlue px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
                  />
                </div>
              ))}

              {/* URLs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white">Live URL</label>
                  <input
                    type="url"
                    placeholder="https://…"
                    value={achievementForm.liveUrl}
                    onChange={(e) =>
                      setAchievementForm((prev) => ({ ...prev, liveUrl: e.target.value }))
                    }
                    className="w-full rounded-md border border-platinum/20 bg-oxfordBlue px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-white">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/…"
                    value={achievementForm.githubUrl}
                    onChange={(e) =>
                      setAchievementForm((prev) => ({ ...prev, githubUrl: e.target.value }))
                    }
                    className="w-full rounded-md border border-platinum/20 bg-oxfordBlue px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
                  />
                </div>
              </div>

              {/* Stack */}
              <div>
                <label className="mb-1 block text-sm font-medium text-white">Stack</label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {achievementForm.stack.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md border border-platinum/15 bg-black px-2.5 py-1 text-xs text-platinum"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() =>
                          setAchievementForm((prev) => ({
                            ...prev,
                            stack: prev.stack.filter((_, idx) => idx !== i),
                          }))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add stack item…"
                    value={achievementForm.stackInput}
                    onChange={(e) =>
                      setAchievementForm((prev) => ({ ...prev, stackInput: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && addAchievementStackChip()}
                    className="flex-1 rounded-md border border-platinum/20 bg-oxfordBlue px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
                  />
                  <button
                    type="button"
                    onClick={addAchievementStackChip}
                    className="rounded-md border border-platinum/20 bg-oxfordBlue px-3 py-2 text-platinum hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <LoadingButton
                  onClick={() => void saveAchievement()}
                  loading={achievementsLoading}
                  loadingText="Saving..."
                  className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black hover:bg-orangeWeb/90 disabled:opacity-60"
                >
                  {editingAchievementIndex !== null ? "Save Changes" : "Add Achievement"}
                </LoadingButton>
                <button
                  type="button"
                  onClick={() => setAchievementView("list")}
                  className="rounded-md border border-platinum/20 px-4 py-2 text-sm text-platinum hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Skills ────────────────────────────────────────────────────────── */}
      {activeSection === "skills" && (
        <div className="max-w-2xl space-y-4">
          {skillGroupForms.map((group, gi) => (
            <div
              key={gi}
              className="rounded-lg border border-platinum/10 bg-oxfordBlue p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Category name"
                  value={group.category}
                  onChange={(e) => updateSkillGroup(gi, { category: e.target.value })}
                  className="flex-1 rounded-md border border-platinum/20 bg-black px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
                />
                <button
                  type="button"
                  onClick={() => setDeleteSkillIndex(gi)}
                  className="p-2 text-platinum hover:text-orangeWeb"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.items.map((item, ii) => (
                  <span
                    key={ii}
                    className="inline-flex items-center gap-1 rounded-md border border-platinum/15 bg-black px-2.5 py-1 text-xs text-platinum"
                  >
                    {item}
                    <button type="button" onClick={() => removeSkillItem(gi, ii)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill…"
                  value={group.itemInput}
                  onChange={(e) => updateSkillGroup(gi, { itemInput: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addSkillItem(gi)}
                  className="flex-1 rounded-md border border-platinum/20 bg-black px-3 py-2 text-sm text-white placeholder:text-platinum/50 focus:outline-none focus:ring-1 focus:ring-orangeWeb"
                />
                <button
                  type="button"
                  onClick={() => addSkillItem(gi)}
                  className="rounded-md border border-platinum/20 bg-black px-3 py-2 text-platinum hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSkillGroup}
            className="inline-flex items-center gap-2 rounded-md border border-platinum/20 px-3 py-2 text-sm text-platinum hover:text-white"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>

          <div className="pt-2">
            <LoadingButton
              onClick={() => void handleSkillsSave()}
              loading={skillsLoading}
              loadingText="Saving Skills..."
              className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black hover:bg-orangeWeb/90 disabled:opacity-60"
            >
              Save Skills
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
}
