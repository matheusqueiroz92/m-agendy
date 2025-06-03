import { SidebarProvider } from "@/components/ui/sidebar";

import { AppHeader } from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <AppHeader />
        <div className="flex-1">{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
