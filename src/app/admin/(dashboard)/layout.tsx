import { verifyAdminSession } from "@/lib/auth/dal";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await verifyAdminSession();

  return (
    <div className="min-h-screen bg-navy-50">
      <AdminNav />
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
