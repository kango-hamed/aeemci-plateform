import AdminSidebar from '@/components/admin/Sidebar'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
