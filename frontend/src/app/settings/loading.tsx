import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-[#090d16] p-6 max-w-4xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* Tabs Skeleton */}
      <Skeleton className="h-14 w-full rounded-2xl" />

      {/* Main Settings Card Skeleton */}
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
