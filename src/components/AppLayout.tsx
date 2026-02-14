import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import { createContext, useContext } from "react";

type ProgressCtx = ReturnType<typeof useProgress>;
const ProgressContext = createContext<ProgressCtx | null>(null);
export const useProgressCtx = () => useContext(ProgressContext)!;

export function AppLayout() {
  const progressApi = useProgress();

  return (
    <ProgressContext.Provider value={progressApi}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar
            onExport={progressApi.exportProgress}
            onImport={progressApi.importProgress}
          />
          <main className="flex-1 overflow-auto">
            <header className="sticky top-0 z-30 flex h-12 items-center border-b border-border bg-background/80 backdrop-blur px-4">
              <SidebarTrigger />
            </header>
            <div className="p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProgressContext.Provider>
  );
}
