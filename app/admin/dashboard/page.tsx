import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin");
  }

  return (
    <section className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb">
        Dashboard
      </p>
      <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
      <p className="max-w-2xl text-sm text-platinum">
        Use the sidebar to manage projects, wins, and resumes. This shell keeps all admin
        routes fast and minimal.
      </p>
    </section>
  );
}
