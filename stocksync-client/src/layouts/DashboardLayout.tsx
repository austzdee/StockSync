import { useState, type ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        mobileSidebarOpen={mobileSidebarOpen}
        desktopSidebarCollapsed={desktopSidebarCollapsed}
        onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
        onToggleDesktopSidebar={() =>
          setDesktopSidebarCollapsed((current) => !current)
        }
      />

      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          desktopSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Topbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;