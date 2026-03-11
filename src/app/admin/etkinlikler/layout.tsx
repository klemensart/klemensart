import AdminOnlyGuard from "../AdminOnlyGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminOnlyGuard>{children}</AdminOnlyGuard>;
}
