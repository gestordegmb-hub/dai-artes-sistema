import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { clientsQuery } from "@/lib/queries";
import { formatPhone, onlyDigits } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/clients")({
  loader: ({ context }) => context.queryClient.ensureQueryData(clientsQuery),
  component: ClientsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Sem clientes.</div>,
});

function ClientsPage() {
  const { data: clients } = useSuspenseQuery(clientsQuery);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(s) || onlyDigits(c.phone).includes(onlyDigits(s)));
  }, [clients, q]);

  async function remove(id: string) {
    if (!confirm("Excluir este cliente? Orçamentos existentes não serão apagados.")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Cliente excluído.");
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua base de clientes.</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo cliente
        </button>
      </div>

      <div className="card-elevated">
        <div className="p-4 border-b flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou telefone…"
            className="flex-1 bg-transparent outline-none text-sm h-9" />
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {clients.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nada encontrado."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4 w-32 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4 text-muted-foreground">{formatPhone(c.phone)}</td>
                    <td className="p-4 text-right space-x-1">
                      <button onClick={() => { setEditing(c); setOpen(true); }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(c.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && <ClientDialog client={editing} onClose={() => setOpen(false)} />}
    </div>
  );
}

function ClientDialog({ client, onClose }: { client: any | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(client?.name || "");
  const [phone, setPhone] = useState(client?.phone ? formatPhone(client.phone) : "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !onlyDigits(phone)) return toast.error("Nome e telefone são obrigatórios.");
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const payload = { name: name.trim(), phone: onlyDigits(phone), user_id: userData.user!.id };
      const res = client
        ? await supabase.from("clients").update({ name: payload.name, phone: payload.phone }).eq("id", client.id)
        : await supabase.from("clients").insert(payload);
      if (res.error) throw res.error;
      toast.success(client ? "Cliente atualizado." : "Cliente cadastrado.");
      qc.invalidateQueries({ queryKey: ["clients"] });
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">{client ? "Editar cliente" : "Novo cliente"}</h2>
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
