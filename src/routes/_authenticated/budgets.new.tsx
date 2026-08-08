import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { clientsQuery, servicesQuery, settingsQuery } from "@/lib/queries";
import { currency, formatDate } from "@/lib/format";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/budgets/new")({
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(clientsQuery),
    context.queryClient.ensureQueryData(servicesQuery),
    context.queryClient.ensureQueryData(settingsQuery),
  ]),
  component: NewBudgetPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Não encontrado.</div>,
});

type Item = { key: string; service_id: string | null; service_name: string; quantity: number; unit_price: number };

function NewBudgetPage() {
  const { data: clients } = useSuspenseQuery(clientsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const navigate = useNavigate();

  const [clientId, setClientId] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [discount, setDiscount] = useState("0");
  const [surcharge, setSurcharge] = useState("0");
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() + (settings?.default_delivery_days ?? 5));
    return d.toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);

  const subtotal = useMemo(() => items.reduce((s: number, i: Item) => s + (i.quantity * i.unit_price), 0), [items]);
  const total = Math.max(0, subtotal - Number(discount.replace(",", ".") || 0) + Number(surcharge.replace(",", ".") || 0));
  const client = clients.find((c: any) => c.id === clientId);

  function addItem(serviceId: string) {
    const svc = services.find((s: any) => s.id === serviceId);
    if (!svc) return;
    setItems((prev) => [...prev, {
      key: crypto.randomUUID(), service_id: svc.id, service_name: svc.name,
      quantity: 1, unit_price: Number(svc.base_price),
    }]);
  }

  function updateItem(key: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  async function save() {
    if (!clientId) return toast.error("Selecione um cliente.");
    if (items.length === 0) return toast.error("Adicione pelo menos um serviço.");
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: budget, error } = await supabase.from("budgets").insert({
        user_id: userData.user!.id,
        client_id: clientId,
        subtotal, total,
        discount: Number(discount.replace(",", ".") || 0),
        surcharge: Number(surcharge.replace(",", ".") || 0),
        notes: notes.trim() || null,
        delivery_date: deliveryDate || null,
        status: "pendente", number: 0,
      }).select().single();
      if (error) throw error;
      await supabase.from("budget_items").insert(items.map((it, idx) => ({
        budget_id: budget.id, service_id: it.service_id, service_name: it.service_name,
        quantity: it.quantity, unit_price: it.unit_price, subtotal: it.quantity * it.unit_price, position: idx,
      })));
      toast.success(`Orçamento #${String(budget.number).padStart(4, "0")} criado!`);
      logAudit("create", "budget", budget.id, { total: budget.total, client_id: budget.client_id });
      navigate({ to: "/budgets/$id", params: { id: budget.id } });
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Novo orçamento</h1>
        <p className="text-sm text-muted-foreground">Preencha e veja o resultado em tempo real.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* FORM */}
        <div className="space-y-6">
          <div className="card-elevated p-5 space-y-4">
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm">
                <option value="">Selecione…</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {clients.length === 0 && <p className="text-xs text-muted-foreground mt-1">Cadastre um cliente antes.</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Data prevista de entrega</label>
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm" />
            </div>
          </div>

          <div className="card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Itens</h3>
              <select onChange={(e) => { if (e.target.value) { addItem(e.target.value); e.target.value = ""; } }}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm">
                <option value="">+ Adicionar serviço</option>
                {services.filter((s: any) => s.active).map((s: any) => <option key={s.id} value={s.id}>{s.name} — {currency(s.base_price)}</option>)}
              </select>
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
                Nenhum item. Selecione um serviço acima.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.key} className="grid grid-cols-12 gap-2 items-center">
                    <input value={it.service_name} onChange={(e) => updateItem(it.key, { service_name: e.target.value })}
                      className="col-span-5 h-10 rounded-md border border-input bg-card px-2 text-sm" />
                    <input type="number" min={0} step="0.5" value={it.quantity} onChange={(e) => updateItem(it.key, { quantity: Number(e.target.value) })}
                      className="col-span-2 h-10 rounded-md border border-input bg-card px-2 text-sm text-center" />
                    <input type="number" min={0} step="0.01" value={it.unit_price} onChange={(e) => updateItem(it.key, { unit_price: Number(e.target.value) })}
                      className="col-span-3 h-10 rounded-md border border-input bg-card px-2 text-sm text-right" />
                    <div className="col-span-1 text-right text-sm font-medium">{currency(it.quantity * it.unit_price).replace("R$", "")}</div>
                    <button onClick={() => removeItem(it.key)} className="col-span-1 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-elevated p-5 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Desconto (R$)</label>
              <input value={discount} onChange={(e) => setDiscount(e.target.value)} inputMode="decimal"
                className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Acréscimo (R$)</label>
              <input value={surcharge} onChange={(e) => setSurcharge(e.target.value)} inputMode="decimal"
                className="mt-1 w-full h-11 rounded-md border border-input bg-card px-3 text-sm" />
            </div>
          </div>

          <div className="card-elevated p-5">
            <label className="text-sm font-medium">Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              placeholder="Prazo de produção, forma de pagamento, informações do pedido…"
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => history.back()} className="h-11 px-5 rounded-md border text-sm hover:bg-accent">Cancelar</button>
            <button onClick={save} disabled={saving} className="h-11 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 shadow-[var(--shadow-soft)]">
              {saving ? "Salvando…" : "Salvar orçamento"}
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="lg:sticky lg:top-4 h-fit">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Prévia em tempo real</div>
          <div className="card-elevated p-8 space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl grid place-items-center gradient-hero">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-display text-2xl text-primary">{settings?.company_name || "Dai Artes"}</div>
                  <div className="text-xs text-muted-foreground">{settings?.phone} {settings?.instagram && `· ${settings.instagram}`}</div>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div className="font-medium text-foreground">Orçamento</div>
                <div>{formatDate(new Date())}</div>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Para</div>
              <div className="font-medium">{client?.name || "—"}</div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <th className="py-2">Serviço</th>
                  <th className="py-2 text-center">Qtd</th>
                  <th className="py-2 text-right">Unit.</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">Sem itens</td></tr>
                ) : items.map((it) => (
                  <tr key={it.key} className="border-b last:border-0">
                    <td className="py-2">{it.service_name}</td>
                    <td className="py-2 text-center">{it.quantity}</td>
                    <td className="py-2 text-right">{currency(it.unit_price)}</td>
                    <td className="py-2 text-right">{currency(it.quantity * it.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{currency(subtotal)}</span></div>
              {Number(discount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span>- {currency(Number(discount.replace(",", ".")))}</span></div>}
              {Number(surcharge) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Acréscimo</span><span>+ {currency(Number(surcharge.replace(",", ".")))}</span></div>}
              <div className="flex justify-between border-t pt-2 mt-2 font-display text-lg"><span>Total</span><span className="text-primary">{currency(total)}</span></div>
            </div>

            {deliveryDate && (
              <div className="text-sm"><span className="text-muted-foreground">Entrega prevista:</span> {formatDate(deliveryDate)}</div>
            )}
            {notes && (
              <div className="text-xs text-muted-foreground whitespace-pre-line border-t pt-4">{notes}</div>
            )}
            <div className="text-xs text-center text-muted-foreground border-t pt-4 italic">
              {settings?.pdf_footer || "Obrigado pela preferência."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
