import { Skeleton } from "@/components/ui/skeleton";

export default function UploadLoading() {
  return (
    <div className="min-h-screen bg-[#090d16] p-6 max-w-4xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* Dropzone Skeleton */}
      <Skeleton className="h-64 w-full rounded-2xl" />

      {/* Inputs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
