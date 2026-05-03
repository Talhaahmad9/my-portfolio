import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveResume, getAllResumes } from "@/actions/resume";
import ResumeTab from "@/components/admin/ResumeTab";

export default async function ResumePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin");
  }

  const [activeResume, resumes] = await Promise.all([getActiveResume(), getAllResumes()]);

  return <ResumeTab activeResume={activeResume} resumes={resumes} />;
}
