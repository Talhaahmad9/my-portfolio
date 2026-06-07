import { getActiveResume } from "@/actions/resume";

export async function GET() {
  const active = await getActiveResume();
  if (!active || !active.fileUrl) {
    return new Response("Not found", { status: 404 });
  }

  const fileUrl: string = active.fileUrl;
  const label: string = active.label ?? "resume.pdf";

  // Fetch the file from the public R2 URL server-side
  const res = await fetch(fileUrl);
  if (!res.ok) {
    return new Response("Failed to fetch resume", { status: 502 });
  }

  // Determine filename: prefer admin label, fall back to basename
  const filename = (label && label.trim()) ? label : (() => {
    try { return new URL(fileUrl).pathname.split('/').pop() || 'resume.pdf'; } catch { return 'resume.pdf'; }
  })();

  const headers: Record<string, string> = {};
  // Forward content-type if available
  const ct = res.headers.get('content-type');
  if (ct) headers['Content-Type'] = ct;
  // Force attachment with filename
  headers['Content-Disposition'] = `attachment; filename="${filename.replace(/"/g, '')}"`;

  const body = res.body;
  return new Response(body, { status: 200, headers });
}
