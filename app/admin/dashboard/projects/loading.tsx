import AdminRouteSkeleton from "@/components/admin/AdminRouteSkeleton";

export default function ProjectsLoading() {
  return (
    <AdminRouteSkeleton
      title="Loading projects"
      description="Fetching project cards, media, and ordering controls."
      blocks={4}
    />
  );
}
