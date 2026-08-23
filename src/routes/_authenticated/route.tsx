import { createFileRoute, Outlet, redirect, Link, useRouter, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, FileText, Users, Package, Settings, LogOut, Plus, Menu, History } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import logoAsset from "@/assets/logo-dai-artes.png.asset.json";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw redirect({ to: "/auth" });
    
    // Check if user is active
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();
      
    if (profile?.status === 'inactive') {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth" });
    }

    // Check role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    return { 
      user, 
      role: userRole?.role || 'user',
      isAdmin: userRole?.role === 'admin'
    };
  },
  component: Shell,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/budgets", label: "Orçamentos", icon: FileText },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/services", label: "Serviços", icon: Package },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

const ADMIN_NAV = [
  { to: "/admin/users", label: "Usuários", icon: Users },
  { to: "/admin/audit", label: "Auditoria", icon: History },
] as const;


function Shell() {
  const { user, isAdmin } = Route.useRouteContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg grid place-items-center bg-white p-1 shadow-sm border">
          <img src={logoAsset.url} alt="Dai Artes" className="h-full w-full object-contain" />
        </div>
        <div>
          <div className="font-display text-lg leading-none text-sidebar-foreground">Dai Artes</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Orçamentos</div>
        </div>
      </div>

      <div className="p-3">
        <Link 
          to="/budgets/new"
          onClick={() => setMobileMenuOpen(false)}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 shadow-[var(--shadow-soft)]">
          <Plus className="h-4 w-4" /> Novo orçamento
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV.map((it) => {
          const active = pathname === it.to || (it.to !== "/dashboard" && pathname.startsWith(it.to));
          const Icon = it.icon;
          return (
            <Link key={it.to} to={it.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 h-10 rounded-md text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`}>
              <Icon className="h-4 w-4" /> {it.label}
            </Link>
          );
        })}
        
        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Administração
            </div>
            {ADMIN_NAV.map((it) => {
              const active = pathname.startsWith(it.to);
              const Icon = it.icon;
              return (
                <Link key={it.to} to={it.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 h-10 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                  }`}>
                  <Icon className="h-4 w-4" /> {it.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border mt-auto">
        <div className="text-xs text-muted-foreground truncate mb-2">{user?.email}</div>
        <button onClick={signOut}
          className="w-full flex items-center gap-2 h-9 px-3 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="no-print h-16 border-b bg-card/70 backdrop-blur flex items-center justify-between px-4 md:px-8 gap-3 sticky top-0 z-10">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="h-8 w-8 rounded bg-white p-0.5 shadow-sm border">
               <img src={logoAsset.url} alt="Dai Artes" className="h-full w-full object-contain" />
            </div>
            <div className="font-display text-lg text-primary">Dai Artes</div>
          </div>
          
          <div className="hidden md:block text-sm text-muted-foreground italic">
            "Feito com amor" ✨
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/budgets/new" className="md:hidden inline-flex items-center gap-1 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 shadow-sm">
              <Plus className="h-4 w-4" />Novo
            </Link>
            <div className="hidden md:block text-xs text-muted-foreground font-medium uppercase tracking-tighter">
              Sistema de Orçamentos
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
