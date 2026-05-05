import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSiteConfig } from "@/actions/config";
import ContentTab from "@/components/admin/ContentTab";

export default async function ContentPage() {
  const session = await auth();
  if (!session) redirect("/admin");

  const config = await getSiteConfig();

  return <ContentTab config={config} />;
}
