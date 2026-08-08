import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { servicesQuery } from "@/lib/queries";
import { currency } from "@/lib/format";
import { logAudit } from "@/lib/audit";

const CATEGORIES = [
  "Topo de Bolo", "Caixas Personalizadas", "Convites", "Lembranças",
  "Adesivos", "Canecas", "Sublimação", "Impressões", "Outros",
];

export const Route = createFileRoute("/_authenticated/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: ServicesPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Sem serviços.</div>,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return services;
    return services.filter((c) => c.name.toLowerCase().includes(s) || c.category.toLowerCase().includes(s));
  }, [services, q]);

  async function remove(id: string) {
    if (!confirm("Excluir este serviço?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Serviço excluído.");
    logAudit("delete", "service", id, { id });
    qc.invalidateQueries({ queryKey: ["services"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl">Serviços</h1>
          <p className="text-sm text-muted-foreground">Catálogo de produtos e serviços.</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo serviço
        </button>
      </div>

      <div className="card-elevated">
        <div className="p-4 border-b flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou categoria…"
            className="flex-1 bg-transparent outline-none text-sm h-9" />
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {services.length === 0 ? "Nenhum serviço cadastrado ainda." : "Nada encontrado."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Preço base</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 w-32 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4"><span className="text-xs px-2 py-0.5 rounded-full bg-primary-soft text-primary">{s.category}</span></td>
                    <td className="p-4">{currency(s.base_price)}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${s.active ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}`}>
                        {s.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button onClick={() => { setEditing(s); setOpen(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(s.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && <ServiceDialog service={editing} onClose={() => setOpen(false)} />}
    </div>
  );
}

function ServiceDialog({ service, onClose }: { service: any | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(service?.name || "");
  const [category, setCategory] = useState(service?.category || "Outros");
  const [description, setDescription] = useState(service?.description || "");
  const [basePrice, setBasePrice] = useState(String(service?.base_price ?? ""));
  const [active, setActive] = useState(service?.active ?? true);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nome é obrigatório.");
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const payload = {
        name: name.trim(), category, description: description.trim() || null,
        base_price: Number(basePrice.replace(",", ".")) || 0, active,
        user_id: userData.user!.id,
      };
      const res = service
        ? await supabase.from("services").update({ ...payload, user_id: undefined as any }).eq("id", service.id)
        : await supabase.from("services").insert(payload);
      if (res.error) throw res.error;
      toast.success(service ? "Serviço atualizado." : "Serviço cadastrado.");
      logAudit(service ? "update" : "create", "service", service?.id || (res.data as any)?.[0]?.id, payload);
      qc.invalidateQueries({ queryKey: ["services"] });
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">{service ? "Editar serviço" : "Novo serviço"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm outline-none">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Preço base (R$)</label>
              <input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} inputMode="decimal" placeholder="0,00" className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-primary" />
            Serviço ativo
          </label>
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
