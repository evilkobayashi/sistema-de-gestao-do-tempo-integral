export default function Loading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      <div>
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-96"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-16 bg-gray-200 rounded w-full"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="h-10 bg-gray-200 rounded w-64"></div>
          <div className="border border-slate-200 rounded-xl p-10 h-64 bg-white flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
