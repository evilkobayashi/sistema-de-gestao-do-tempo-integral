import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 bg-slate-950 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
