import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { budgetsQuery, clientsQuery, servicesQuery } from "@/lib/queries";
import { currency, formatDate } from "@/lib/format";
import { FileText, Users, Package, TrendingUp, CalendarDays, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(budgetsQuery),
    context.queryClient.ensureQueryData(clientsQuery),
    context.queryClient.ensureQueryData(servicesQuery),
  ]),
  component: Dashboard,
  errorComponent: ({ error, reset }) => (
    <div className="card-elevated p-12 text-center space-y-4">
      <div className="mx-auto w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
        <Receipt className="w-5 h-5 text-destructive" />
      </div>
      <h2 className="text-lg font-medium">Erro ao carregar dashboard</h2>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {error.message || "Não foi possível carregar os dados. Verifique sua conexão."}
      </p>
      <button 
        onClick={() => reset()} 
        className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
      >
        Tentar novamente
      </button>
    </div>
  ),
  notFoundComponent: () => <div className="card-elevated p-12 text-center text-muted-foreground">Conteúdo não encontrado.</div>,
});

function Dashboard() {
  const { data: budgets } = useSuspenseQuery(budgetsQuery);
  const { data: clients } = useSuspenseQuery(clientsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayBudgets = budgets.filter((b) => new Date(b.created_at) >= today);
  const monthBudgets = budgets.filter((b) => new Date(b.created_at) >= monthStart);
  const monthTotal = monthBudgets.reduce((s, b) => s + Number(b.total), 0);

  // Chart: last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short" });
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const count = budgets.filter((b) => {
      const bd = new Date(b.created_at);
      return bd >= d && bd < end;
    }).length;
    return { month: label, qtd: count };
  });

  const cards = [
    { label: "Orçamentos hoje", value: todayBudgets.length, icon: CalendarDays },
    { label: "Orçamentos no mês", value: monthBudgets.length, icon: FileText },
    { label: "Valor orçado no mês", value: currency(monthTotal), icon: TrendingUp },
    { label: "Clientes", value: clients.length, icon: Users },
    { label: "Serviços ativos", value: services.filter((s) => s.active).length, icon: Package },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do seu ateliê.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card-elevated p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 font-display text-2xl text-foreground">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card-elevated p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Orçamentos por mês</h2>
            <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="qtd" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated p-6">
          <h2 className="font-display text-xl mb-4">Atalhos</h2>
          <div className="space-y-2">
            <Link to="/budgets/new" className="flex items-center justify-between p-3 rounded-md bg-primary-soft hover:bg-accent">
              <span className="text-sm font-medium">Criar novo orçamento</span><ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/clients" className="flex items-center justify-between p-3 rounded-md hover:bg-accent">
              <span className="text-sm">Adicionar cliente</span><ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/services" className="flex items-center justify-between p-3 rounded-md hover:bg-accent">
              <span className="text-sm">Cadastrar serviço</span><ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Últimos orçamentos</h2>
          <Link to="/budgets" className="text-sm text-primary hover:underline">Ver todos</Link>
        </div>
        {budgets.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhum orçamento ainda. <Link to="/budgets/new" className="text-primary hover:underline">Criar o primeiro</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3">Nº</th>
                  <th className="py-3">Cliente</th>
                  <th className="py-3">Valor</th>
                  <th className="py-3">Data</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {budgets.slice(0, 8).map((b: any) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="py-3 font-mono text-xs">#{String(b.number).padStart(4, "0")}</td>
                    <td className="py-3">
                      <Link to="/budgets/$id" params={{ id: b.id }} className="hover:text-primary">
                        {b.client?.name}
                      </Link>
                    </td>
                    <td className="py-3 font-medium">{currency(b.total)}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(b.created_at)}</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pendente: "bg-warning/15 text-warning-foreground border-warning/30",
    aprovado: "bg-success/15 text-success border-success/30",
    recusado: "bg-destructive/10 text-destructive border-destructive/30",
    concluido: "bg-primary-soft text-primary border-primary/30",
  };
  const cls = map[status] || "bg-muted text-muted-foreground border-border";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}>{status}</span>;
}
