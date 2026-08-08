import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Plus, Pencil, Trash2, Eye, FileText, TrendingUp, Receipt, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { clientDetailQuery, settingsQuery } from "@/lib/queries";
import { currency, formatDate, formatPhone, onlyDigits } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/_authenticated/clients/$id")({
  loader: ({ context, params }) => Promise.all([
    context.queryClient.ensureQueryData(clientDetailQuery(params.id)),
    context.queryClient.ensureQueryData(settingsQuery),
  ]),
  component: ClientDetailPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Cliente não encontrado.</div>,
});

const STATUS_STYLES: Record<string, string> = {
  pendente: "bg-primary-soft text-primary",
  aprovado: "bg-success/15 text-success",
  concluido: "bg-success/15 text-success",
  recusado: "bg-destructive/10 text-destructive",
};

function ClientDetailPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(clientDetailQuery(id));
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { client, budgets } = data;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const stats = useMemo(() => {
    const total = budgets.reduce((s: number, b: any) => s + Number(b.total), 0);
    const approved = budgets.filter((b: any) => b.status === "aprovado" || b.status === "concluido");
    const approvedTotal = approved.reduce((s: number, b: any) => s + Number(b.total), 0);
    const last = budgets[0] as any;
    return { count: budgets.length, total, approvedTotal, approvedCount: approved.length, last };
  }, [budgets]);

  async function remove() {
    if (!confirm("Excluir este cliente? Orçamentos existentes não serão apagados.")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Cliente excluído.");
    qc.invalidateQueries({ queryKey: ["clients"] });
    navigate({ to: "/clients" });
  }

  function openWhatsapp() {
    const firstName = client.name.split(" ")[0] || client.name;
    const msg = `Olá, ${firstName}! Aqui é da ${settings?.company_name || "Dai Artes"} 💗`;
    window.open(whatsappLink(client.phone, msg), "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/clients" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Clientes
        </Link>
        <div className="flex flex-wrap gap-2">
          <button onClick={openWhatsapp} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
          <Link to="/budgets/new" search={{ clientId: id } as any} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo orçamento
          </Link>
          <button onClick={() => setEditing(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border hover:bg-accent" title="Editar">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={remove} className="inline-flex h-10 w-10 items-center justify-center rounded-md border text-destructive hover:bg-destructive/10" title="Excluir">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="card-elevated p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full grid place-items-center gradient-hero text-primary-foreground font-display text-2xl">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl">{client.name}</h1>
            <div className="text-sm text-muted-foreground mt-1">
              {formatPhone(client.phone)} · Cliente desde {formatDate(client.created_at)}
            </div>
          </div>
        </div>
        {client.notes && (
          <div className="mt-4 text-sm text-muted-foreground border-t pt-4 whitespace-pre-line">{client.notes}</div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FileText className="h-4 w-4" />} label="Orçamentos" value={String(stats.count)} />
        <StatCard icon={<Receipt className="h-4 w-4" />} label="Total orçado" value={currency(stats.total)} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label={`Aprovados (${stats.approvedCount})`} value={currency(stats.approvedTotal)} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Último orçamento" value={stats.last ? formatDate(stats.last.created_at) : "—"} />
      </div>

      <div className="card-elevated">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-display text-lg">Histórico de orçamentos</h2>
          <span className="text-xs text-muted-foreground">{budgets.length} {budgets.length === 1 ? "registro" : "registros"}</span>
        </div>
        {budgets.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum orçamento ainda.{" "}
            <Link to="/budgets/new" search={{ clientId: id } as any} className="text-primary hover:underline">Criar o primeiro</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Nº</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Entrega</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 w-20 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b: any) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="p-4 font-mono text-xs">
                      <Link to="/budgets/$id" params={{ id: b.id }} className="hover:text-primary">
                        #{String(b.number).padStart(4, "0")}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(b.created_at)}</td>
                    <td className="p-4 text-muted-foreground">{b.delivery_date ? formatDate(b.delivery_date) : "—"}</td>
                    <td className="p-4 font-medium">{currency(b.total)}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status] || "bg-muted text-muted-foreground"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link to="/budgets/$id" params={{ id: b.id }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" title="Visualizar (PDF, WhatsApp)">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <EditDialog client={client} onClose={() => setEditing(false)} />}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="font-display text-xl mt-2">{value}</div>
    </div>
  );
}

function EditDialog({ client, onClose }: { client: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(formatPhone(client.phone));
  const [notes, setNotes] = useState(client.notes || "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !onlyDigits(phone)) return toast.error("Nome e telefone são obrigatórios.");
    setSaving(true);
    const { error } = await supabase.from("clients")
      .update({ name: name.trim(), phone: onlyDigits(phone), notes: notes.trim() || null })
      .eq("id", client.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Cliente atualizado.");
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["client", client.id] });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Editar cliente</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
              className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone (WhatsApp)</label>
            <input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(11) 91234-5678"
              className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-md border text-sm hover:bg-accent">Cancelar</button>
            <button type="submit" disabled={saving} className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60">
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
