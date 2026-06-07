export async function downloadFile(url: string, filename: string): Promise<void> {
  // Attempt to fetch the file and trigger a programmatic download using a blob.
  // This works around browsers that ignore the `download` attribute for cross-origin links.
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  // append to body so click works in Firefox
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
