import AdminRouteSkeleton from "@/components/admin/AdminRouteSkeleton";

export default function DashboardLoading() {
  return (
    <AdminRouteSkeleton
      title="Loading dashboard"
      description="Preparing your admin workspace and navigation state."
      blocks={2}
    />
  );
}
