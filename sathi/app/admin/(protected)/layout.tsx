// ❌ GALAT — yeh hai toh login bhi block hoga
import AdminRoute from "../../auth/AdminRoute";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      {children}
    </AdminRoute>
  );
}