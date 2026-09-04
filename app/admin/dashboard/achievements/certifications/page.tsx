import { connectDB } from "@/lib/db/mongo";
import { getCanonicalCertifications } from "@/lib/admin/queries/achievements";
import { getCanonicalSkills } from "@/lib/admin/queries/skills";
import { CertificationManagement } from "@/components/admin/cms/CertificationManagement";

export default async function AdminCertificationsPage() {
  await connectDB();

  const [{ certifications }, skills] = await Promise.all([
    getCanonicalCertifications(),
    getCanonicalSkills(),
  ]);

  const allSkills = skills.map((s) => ({
    id: s._id,
    name: s.name,
    isArchived: s.publicationStatus === "archived",
  }));

  return (
    <div className="space-y-6">
      <CertificationManagement
        initialCertifications={certifications}
        allSkills={allSkills}
      />
    </div>
  );
}
