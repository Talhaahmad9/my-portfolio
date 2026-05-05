import AdminRouteSkeleton from "@/components/admin/AdminRouteSkeleton";

export default function WinsLoading() {
  return (
    <AdminRouteSkeleton
      title="Loading hall of fame"
      description="Fetching achievements and timeline metadata."
      blocks={4}
    />
  );
}
