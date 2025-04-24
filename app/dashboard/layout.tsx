// app/dashboard/layout.tsx
import Sidebar from "@/components/layout/Sidebar";
import Providers from '../providers';
import NavBar from "@/components/layout/NavBar";

export const metadata = {
  title: 'Dashboard - Eco-Source',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <Providers>
          <div className="flex h-screen">
            <NavBar />
            <Sidebar />
            <main className="flex-grow overflow-y-auto pt-">{children}</main>
          </div>
        </Providers>
  );
}
