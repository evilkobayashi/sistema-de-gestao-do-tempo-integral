import SkeletonTable from '@/components/ui/SkeletonTable'

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
      <SkeletonTable />
    </div>
  )
}
