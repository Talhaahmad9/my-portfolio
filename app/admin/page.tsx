import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminPage() {
  const session = await auth();

  if (session) {
    redirect("/admin/dashboard");
  }

  return <LoginForm />;
}
