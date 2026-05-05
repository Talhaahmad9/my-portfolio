import AdminRouteSkeleton from "@/components/admin/AdminRouteSkeleton";

export default function ContentLoading() {
  return (
    <AdminRouteSkeleton
      title="Loading site content"
      description="Fetching hero, about, achievements, and skills content."
      blocks={3}
      hasTabs
    />
  );
}
