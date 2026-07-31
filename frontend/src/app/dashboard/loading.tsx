import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#090d16] p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <Skeleton className="h-20 w-full rounded-2xl" />

      {/* Metrics Skeleton Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>

      {/* Charts Skeleton Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[360px] rounded-2xl" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>

      {/* Table Skeleton */}
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
