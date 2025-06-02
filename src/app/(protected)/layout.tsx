import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryProvider } from "@/providers/query-provider";

import { AppSidebar } from "./_components/app-sidebar";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <QueryProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </QueryProvider>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
