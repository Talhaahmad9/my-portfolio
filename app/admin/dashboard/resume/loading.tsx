import AdminRouteSkeleton from "@/components/admin/AdminRouteSkeleton";

export default function ResumeLoading() {
  return (
    <AdminRouteSkeleton
      title="Loading resumes"
      description="Syncing active resume, archive, and upload controls."
      blocks={3}
    />
  );
}
