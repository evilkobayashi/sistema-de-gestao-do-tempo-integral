'use client'

export default function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-full animate-pulse">
      {/* Search Bar Skeleton */}
      <div className="p-3 border-b flex items-center">
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
      
      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-3 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <td key={colIndex} className="px-3 py-4">
                    <div className={`h-3 bg-gray-200 rounded ${
                      colIndex === 0 ? 'w-28' : colIndex === 1 ? 'w-16' : colIndex === 2 ? 'w-20' : 'w-12'
                    }`}></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
