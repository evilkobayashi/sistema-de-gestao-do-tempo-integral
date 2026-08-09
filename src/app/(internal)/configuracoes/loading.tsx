export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
            <ul className="space-y-2 pt-2">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <li key={rowIndex} className="flex justify-between items-center py-1 border-b">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
