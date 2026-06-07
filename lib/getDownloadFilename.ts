function sanitizeName(name: string): string {
  // Lowercase, replace spaces and invalid chars with hyphens, collapse hyphens
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getDownloadFilename(label?: string | null, fileUrl?: string | null): string {
  // Prefer admin label when available
  if (label && label.trim().length > 0) {
    const base = sanitizeName(label);
    return base.endsWith(".pdf") ? base : `${base}.pdf`;
  }

  if (fileUrl) {
    try {
      // Parse URL and take the final path segment as the filename.
      const parsed = new URL(fileUrl);
      const segments = parsed.pathname.split("/");
      let name = segments[segments.length - 1] || "resume.pdf";
      // strip leading timestamp like 1780809076002-...
      name = name.replace(/^\d+-/, "");
      name = sanitizeName(name.replace(/\.pdf$/i, ""));
      return name ? `${name}.pdf` : "resume.pdf";
    } catch (e) {
      // fallback
    }
  }

  return "resume.pdf";
}
