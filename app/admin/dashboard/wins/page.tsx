import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWins } from "@/actions/wins";
import WinsTab from "@/components/admin/WinsTab";

export default async function WinsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin");
  }

  const wins = await getWins();

  return <WinsTab wins={wins} />;
}
