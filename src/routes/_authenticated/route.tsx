import { createFileRoute, Outlet, redirect, Link, useRouter, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, FileText, Users, Package, Settings, LogOut, Plus, Beaker } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { isDemoUser } from "@/lib/demo-auth";
import logoAsset from "@/assets/logo-dai-artes.png.asset.json";


export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
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

function Shell() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg grid place-items-center bg-white p-1 shadow-sm">
            <img src={logoAsset.url} alt="Dai Artes" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="font-display text-lg leading-none text-sidebar-foreground">Dai Artes</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Orçamentos</div>
          </div>
        </div>

        <div className="p-3">
          <Link to="/budgets/new"
            className="w-full flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 shadow-[var(--shadow-soft)]">
            <Plus className="h-4 w-4" /> Novo orçamento
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((it) => {
            const active = pathname === it.to || (it.to !== "/dashboard" && pathname.startsWith(it.to));
            const Icon = it.icon;
            return (
              <Link key={it.to} to={it.to}
                className={`flex items-center gap-3 px-3 h-10 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}>
                <Icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground truncate mb-2">{user?.email}</div>
          <button onClick={signOut}
            className="w-full flex items-center gap-2 h-9 px-3 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="no-print h-16 border-b bg-card/70 backdrop-blur flex items-center justify-between px-4 md:px-8 gap-3">
          <div className="md:hidden font-display text-lg text-primary">Dai Artes</div>
          <div className="hidden md:block text-sm text-muted-foreground">Bem-vinda de volta ✨</div>
          <div className="flex items-center gap-2">
            {isDemoUser(user?.email) && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary-soft text-primary font-medium">
                <Beaker className="h-3 w-3" /> Modo demo
              </span>
            )}
            <Link to="/budgets/new" className="md:hidden inline-flex items-center gap-1 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">
              <Plus className="h-4 w-4" />Novo
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
