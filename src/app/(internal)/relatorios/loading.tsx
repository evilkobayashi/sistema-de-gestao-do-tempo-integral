import SkeletonTable from '@/components/ui/SkeletonTable'

export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-3 flex-wrap">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="space-y-4 mt-6">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <SkeletonTable />
      </div>
    </div>
  )
}
