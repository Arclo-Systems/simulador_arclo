import { SidebarNav } from "@/components/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:m-2"
      >
        Saltar al contenido
      </a>
      <div className="flex h-screen">
        <SidebarNav />
        <main id="main-content" className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
