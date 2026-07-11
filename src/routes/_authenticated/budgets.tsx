import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2, Eye, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { budgetsQuery } from "@/lib/queries";
import { currency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/budgets")({
  loader: ({ context }) => context.queryClient.ensureQueryData(budgetsQuery),
  component: BudgetsRouter,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Nada.</div>,
});

function BudgetsRouter() {
  // If a child route matches, render it. Otherwise render the list.
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId !== "/_authenticated/budgets" && m.routeId.startsWith("/_authenticated/budgets"));
  if (isChild) return <Outlet />;
  return <BudgetsList />;
}

function BudgetsList() {
  const { data: budgets } = useSuspenseQuery(budgetsQuery);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [range, setRange] = useState<string>("all");

  const filtered = useMemo(() => {
    const now = new Date();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const bounds: Record<string, Date | null> = {
      all: null,
      today: start,
      week: new Date(now.getTime() - 7 * 86400000),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
      year: new Date(now.getFullYear(), 0, 1),
    };
    const s = q.trim().toLowerCase();
    return budgets.filter((b: any) => {
      if (status !== "all" && b.status !== status) return false;
      const min = bounds[range];
      if (min && new Date(b.created_at) < min) return false;
      if (s) {
        const hay = `${b.client?.name || ""} ${String(b.number)}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [budgets, q, status, range]);

  async function remove(id: string) {
    if (!confirm("Excluir este orçamento?")) return;
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Orçamento excluído.");
    qc.invalidateQueries({ queryKey: ["budgets"] });
  }

  async function duplicate(id: string) {
    const { data: userData } = await supabase.auth.getUser();
    const { data: original } = await supabase.from("budgets").select("*, items:budget_items(*)").eq("id", id).single();
    if (!original) return;
    const { data: newB, error } = await supabase.from("budgets").insert({
      user_id: userData.user!.id,
      client_id: original.client_id,
      subtotal: original.subtotal, discount: original.discount, surcharge: original.surcharge, total: original.total,
      notes: original.notes, delivery_date: original.delivery_date, status: "pendente",
    }).select().single();
    if (error) return toast.error(error.message);
    if (original.items?.length) {
      await supabase.from("budget_items").insert(
        original.items.map((it: any) => ({
          budget_id: newB.id, service_id: it.service_id, service_name: it.service_name,
          quantity: it.quantity, unit_price: it.unit_price, subtotal: it.subtotal, position: it.position,
        })),
      );
    }
    toast.success("Orçamento duplicado.");
    qc.invalidateQueries({ queryKey: ["budgets"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Histórico completo de orçamentos.</p>
        </div>
        <Link to="/budgets/new" className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo orçamento
        </Link>
      </div>

      <div className="card-elevated">
        <div className="p-4 border-b flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-52">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cliente ou número…" className="flex-1 bg-transparent outline-none text-sm h-9" />
          </div>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="h-9 rounded-md border border-input bg-card px-2 text-sm">
            <option value="all">Todo o período</option>
            <option value="today">Hoje</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Este mês</option>
            <option value="year">Este ano</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-card px-2 text-sm">
            <option value="all">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="concluido">Concluído</option>
            <option value="recusado">Recusado</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {budgets.length === 0 ? (
              <>Nenhum orçamento ainda. <Link to="/budgets/new" className="text-primary hover:underline">Criar o primeiro</Link>.</>
            ) : "Nada encontrado."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Nº</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 w-40 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b: any) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="p-4 font-mono text-xs">#{String(b.number).padStart(4, "0")}</td>
                    <td className="p-4 font-medium"><Link to="/budgets/$id" params={{ id: b.id }} className="hover:text-primary">{b.client?.name}</Link></td>
                    <td className="p-4">{currency(b.total)}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(b.created_at)}</td>
                    <td className="p-4"><span className="text-xs px-2 py-0.5 rounded-full bg-primary-soft text-primary">{b.status}</span></td>
                    <td className="p-4 text-right space-x-1">
                      <Link to="/budgets/$id" params={{ id: b.id }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" title="Visualizar"><Eye className="h-4 w-4" /></Link>
                      <button onClick={() => duplicate(b.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" title="Duplicar"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => remove(b.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive" title="Excluir"><Trash2 className="h-4 w-4" /></button>
                    </td>
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
