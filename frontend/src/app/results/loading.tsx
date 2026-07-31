import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsLoading() {
  return (
    <div className="min-h-screen bg-[#090d16] p-6 max-w-6xl mx-auto space-y-8">
      {/* Score Hero Skeleton */}
      <Skeleton className="h-64 w-full rounded-2xl" />

      {/* Analytics Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>

      {/* AI Rewrite Skeleton */}
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
